import { registerAs } from '@nestjs/config';

export default registerAs('db', () => ({
  url: process.env.DATABASE_URL,
  schema: process.env.DB_SCHEMA ?? 'public',
  poolMin: Number(process.env.DB_POOL_MIN ?? 2),
  poolMax: Number(process.env.DB_POOL_MAX ?? 20),
}));
