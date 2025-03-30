import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT;
  console.log({ PORT });
  await app.listen(PORT, () => console.log('Sever running on port' + PORT));
}
bootstrap();
