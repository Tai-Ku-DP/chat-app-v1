import * as bcrypt from 'bcrypt';

export const hashPassword = async (pass: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pass, salt);
};
