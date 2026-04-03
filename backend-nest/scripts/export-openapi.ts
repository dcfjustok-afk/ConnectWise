/**
 * 离线导出 OpenAPI JSON
 *
 * 用法：npx ts-node scripts/export-openapi.ts
 * 输出：docs/openapi.json
 */
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from '../src/app.module';

async function main(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('ConnectionWise API')
    .setDescription('ConnectionWise 后端 API 文档')
    .setVersion('1.0')
    .addCookieAuth('connectwise.sid')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const outDir = path.resolve(__dirname, '..', 'docs');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outPath = path.join(outDir, 'openapi.json');
  fs.writeFileSync(outPath, JSON.stringify(document, null, 2), 'utf-8');

  console.log(`OpenAPI JSON exported to ${outPath}`);
  await app.close();
}

void main();
