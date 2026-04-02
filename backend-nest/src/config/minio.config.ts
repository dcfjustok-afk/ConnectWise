import { registerAs } from '@nestjs/config';

export default registerAs('minio', () => ({
  endpoint: process.env.MINIO_ENDPOINT,
  region: process.env.MINIO_REGION ?? 'us-east-1',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
  bucket: process.env.MINIO_BUCKET ?? 'connectionwise',
  useSSL: String(process.env.MINIO_USE_SSL ?? 'false') === 'true',
}));
