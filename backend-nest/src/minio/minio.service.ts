import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { Readable } from 'stream';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private client!: Minio.Client;
  private bucket!: string;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const endpoint = this.configService.get<string>('minio.endpoint', 'localhost');
    const port = parseInt(endpoint.split(':')[1] || '9000', 10);
    const host = endpoint.replace(/:\d+$/, '').replace(/^https?:\/\//, '');

    this.bucket = this.configService.get<string>('minio.bucket', 'connectionwise');

    this.client = new Minio.Client({
      endPoint: host,
      port,
      useSSL: this.configService.get<boolean>('minio.useSSL', false),
      accessKey: this.configService.get<string>('minio.accessKey', ''),
      secretKey: this.configService.get<string>('minio.secretKey', ''),
      region: this.configService.get<string>('minio.region', 'us-east-1'),
    });

    await this.ensureBucket();
  }

  private async ensureBucket(): Promise<void> {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket);
        this.logger.log(`Bucket "${this.bucket}" created`);
      }
    } catch (err) {
      this.logger.warn(`MinIO bucket check failed (non-blocking): ${(err as Error).message}`);
    }
  }

  /** 上传文件流到 MinIO */
  async putObject(
    objectName: string,
    stream: Readable | Buffer,
    size: number,
    contentType: string,
  ): Promise<string> {
    await this.client.putObject(this.bucket, objectName, stream, size, {
      'Content-Type': contentType,
    });
    return objectName;
  }

  /** 获取文件预签名 URL（默认 7200 秒） */
  async getPresignedUrl(objectName: string, expiry = 7200): Promise<string> {
    return this.client.presignedGetObject(this.bucket, objectName, expiry);
  }

  /** 删除对象 */
  async removeObject(objectName: string): Promise<void> {
    await this.client.removeObject(this.bucket, objectName);
  }

  /** 检查 MinIO 连通性 */
  async isHealthy(): Promise<boolean> {
    try {
      await this.client.bucketExists(this.bucket);
      return true;
    } catch {
      return false;
    }
  }
}
