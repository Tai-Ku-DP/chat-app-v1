import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

/**
 * Service quản lý kết nối và tương tác với Redis
 * Cung cấp các phương thức để kết nối, lưu trữ và truy xuất dữ liệu từ Redis
 * Tự động xử lý kết nối lại khi mất kết nối
 */

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private pubClient: RedisClientType;
  private subClient: RedisClientType;
  /**
   * Khởi tạo Redis clients
   * - pubClient: dùng để publish messages và thực hiện các thao tác CRUD
   * - subClient: dùng để subscribe vào các channels
   */
  constructor() {
    // Tạo client chính với cấu hình kết nối
    this.pubClient = createClient({
      url: `redis://localhost:6379`,
      socket: {
        // Chiến lược kết nối lại khi mất kết nối
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            this.logger.error('Redis connection failed after 10 retries');
            return new Error('Redis connection failed');
          }
          // Tăng thời gian chờ giữa các lần thử kết nối lại
          return Math.min(retries * 100, 3000);
        },
        connectTimeout: 10000,
      },
    });

    // Tạo client thứ hai từ client chính
    this.subClient = this.pubClient.duplicate();

    // Set up error handlers
    this.pubClient.on('error', (err) => {
      this.logger.error('Redis Pub Client Error:', err);
      // Attempt to reconnect if the client is closed due to an error
      if (!this.pubClient.isOpen) {
        this.reconnectPubClient();
      }
    });

    this.subClient.on('error', (err) => {
      this.logger.error('Redis Sub Client Error:', err);
      // Attempt to reconnect if the client is closed due to an error
      if (!this.subClient.isOpen) {
        this.reconnectSubClient();
      }
    });

    // Set up reconnect handlers
    this.pubClient.on('reconnecting', () => {
      this.logger.log('Redis Pub Client reconnecting...');
    });

    this.subClient.on('reconnecting', () => {
      this.logger.log('Redis Sub Client reconnecting...');
    });

    // Set up connect handlers
    this.pubClient.on('connect', () => {
      this.logger.log('Redis Pub Client connected');
    });

    this.subClient.on('connect', () => {
      this.logger.log('Redis Sub Client connected');
    });
  }

  /**
   * Kết nối lại client pub khi bị mất kết nối
   * Nếu kết nối thất bại, sẽ tự động thử lại sau 5 giây
   * @private
   */
  private async reconnectPubClient() {
    try {
      if (!this.pubClient.isOpen) {
        await this.pubClient.connect();
        this.logger.log('Redis Pub Client reconnected successfully');
      }
    } catch (err) {
      this.logger.error('Failed to reconnect Redis Pub Client:', err);
      // Lên lịch thử kết nối lại sau 5 giây
      setTimeout(() => this.reconnectPubClient(), 5000);
    }
  }

  /**
   * Kết nối lại client sub khi bị mất kết nối
   * Nếu kết nối thất bại, sẽ tự động thử lại sau 5 giây
   * @private
   */
  private async reconnectSubClient() {
    try {
      if (!this.subClient.isOpen) {
        await this.subClient.connect();
        this.logger.log('Redis Sub Client reconnected successfully');
      }
    } catch (err) {
      this.logger.error('Failed to reconnect Redis Sub Client:', err);
      // Lên lịch thử kết nối lại sau 5 giây
      setTimeout(() => this.reconnectSubClient(), 5000);
    }
  }

  getPubClient(): RedisClientType {
    return this.pubClient;
  }

  getSubClient(): RedisClientType {
    return this.subClient;
  }

  /**
   * Lưu giá trị vào Redis
   * Tự động chuyển đổi giá trị thành chuỗi JSON
   * Tự động kết nối lại nếu client bị đóng
   *
   * @param key Khóa để lưu trữ giá trị
   * @param value Giá trị cần lưu (có thể là bất kỳ kiểu dữ liệu nào)
   * @param ttlSeconds Thời gian sống của khóa (tính bằng giây), không bắt buộc
   * @returns true nếu thành công, false nếu thất bại
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      // Đảm bảo Redis được kết nối trước khi thực hiện thao tác
      const connected = await this.ensureConnection();
      if (!connected) {
        this.logger.warn(`Cannot set Redis key ${key}: client not connected`);
        return false;
      }

      // Chuyển đổi giá trị thành chuỗi JSON
      const stringValue = JSON.stringify(value);

      // Lưu giá trị với hoặc không có thời gian sống
      if (ttlSeconds) {
        await this.pubClient.set(key, stringValue, { EX: ttlSeconds });
      } else {
        await this.pubClient.set(key, stringValue);
      }
      return true;
    } catch (error) {
      this.logger.error(`Error setting Redis key ${key}:`, error);
      return false;
    }
  }

  /**
   * Lấy giá trị từ Redis
   * Tự động chuyển đổi chuỗi JSON thành đối tượng
   * Tự động kết nối lại nếu client bị đóng
   *
   * @param key Khóa cần lấy giá trị
   * @returns Giá trị đã được chuyển đổi từ JSON, hoặc null nếu không tìm thấy hoặc có lỗi
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Đảm bảo Redis được kết nối trước khi thực hiện thao tác
      const connected = await this.ensureConnection();
      if (!connected) {
        this.logger.warn(`Cannot get Redis key ${key}: client not connected`);
        return null;
      }

      // Lấy giá trị và chuyển đổi từ chuỗi JSON
      const value = await this.pubClient.get(key);
      return value ? JSON.parse(value.toString()) : null;
    } catch (error) {
      this.logger.error(`Error getting Redis key ${key}:`, error);
      return null;
    }
  }

  /**
   * Được gọi khi module được khởi tạo
   * Kết nối tới Redis server nếu chưa được kết nối
   * Xử lý lỗi "Socket already opened" một cách hợp lý
   */
  async onModuleInit() {
    try {
      // Chỉ kết nối nếu chưa được kết nối
      if (!this.pubClient.isOpen) {
        await this.pubClient.connect();
      }
      if (!this.subClient.isOpen) {
        await this.subClient.connect();
      }
      this.logger.log('Redis pub/sub clients connected');
    } catch (err) {
      // Kiểm tra nếu là lỗi "Socket already opened", có thể bỏ qua
      if (err.message && err.message.includes('Socket already opened')) {
        this.logger.log('Redis clients already connected');
      } else {
        this.logger.error('Failed to connect Redis clients:', err);
      }
      // Không ném lỗi, chỉ ghi log
    }
  }

  /**
   * Được gọi khi module bị hủy
   * Đóng kết nối tới Redis server nếu đang mở
   */
  async onModuleDestroy() {
    try {
      if (this.pubClient.isOpen) {
        await this.pubClient.disconnect();
      }
      if (this.subClient.isOpen) {
        await this.subClient.disconnect();
      }
      this.logger.log('Redis pub/sub clients disconnected');
    } catch (err) {
      this.logger.error('Error disconnecting Redis clients:', err);
    }
  }

  /**
   * Đảm bảo Redis được kết nối trước khi thực hiện các thao tác
   * Nếu chưa kết nối, sẽ tự động kết nối
   * Nếu kết nối thất bại, sẽ lên lịch thử lại sau 1 giây
   * @returns true nếu cả hai client đều được kết nối, false nếu không
   * @private
   */
  private async ensureConnection(): Promise<boolean> {
    let pubConnected = this.pubClient.isOpen;
    let subConnected = this.subClient.isOpen;

    if (!pubConnected) {
      try {
        await this.pubClient.connect();
        pubConnected = true;
        this.logger.log('Redis pub client connected on demand');
      } catch (err) {
        this.logger.error('Failed to connect Redis pub client on demand:', err);
        // Lên lịch thử kết nối lại sau 1 giây
        setTimeout(() => this.reconnectPubClient(), 1000);
      }
    }

    if (!subConnected) {
      try {
        await this.subClient.connect();
        subConnected = true;
        this.logger.log('Redis sub client connected on demand');
      } catch (err) {
        this.logger.error('Failed to connect Redis sub client on demand:', err);
        // Lên lịch thử kết nối lại sau 1 giây
        setTimeout(() => this.reconnectSubClient(), 1000);
      }
    }

    return pubConnected && subConnected;
  }
}
