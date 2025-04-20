import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { isObjectIdOrHexString } from 'mongoose';

export const hashPassword = async (pass: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pass, salt);
};

export const validateMongoId = (id: string) => {
  if (!isObjectIdOrHexString(id)) {
    throw new HttpException('Invalid MongoId', HttpStatus.BAD_REQUEST);
  }

  return true;
};
