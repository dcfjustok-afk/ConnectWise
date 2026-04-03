import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createStore, createMockPrisma, createTestApp, createMockMinioService, TEST_PASSWORD } from './fixtures';
import type { InMemoryStore } from './fixtures';

describe('Upload Thumbnail (e2e)', () => {
  let app: INestApplication;
  let store: InMemoryStore;
  let mockMinio: Record<string, any>;

  const prisma = (() => {
    store = createStore();
    return createMockPrisma(store);
  })();

  let agent: any;
  let canvasId: number;

  beforeAll(async () => {
    store = createStore();
    Object.assign(prisma, createMockPrisma(store));
    mockMinio = createMockMinioService();
    app = await createTestApp(prisma, { mockMinio });

    agent = request.agent(app.getHttpServer());
    await agent
      .post('/api/user/register')
      .send({ username: 'upload_user', email: 'upload@test.com', password: TEST_PASSWORD })
      .expect(201);
    await agent
      .post('/api/user/login')
      .send({ username: 'upload_user', password: TEST_PASSWORD })
      .expect(200);

    // 创建一个画布
    const res = await agent
      .post(`/api/canvas/create/${store.userIdSeq}`)
      .send({ title: 'Upload Test Canvas', nodes: [], edges: [] })
      .expect(201);
    canvasId = res.body.data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/canvas/uploadThumbnail — 成功上传缩略图', async () => {
    const res = await agent
      .post('/api/canvas/uploadThumbnail')
      .field('canvasId', canvasId)
      .attach('thumbnail', Buffer.from('fake-png'), {
        filename: 'thumb.png',
        contentType: 'image/png',
      })
      .expect(201);

    expect(res.body.code).toBe(200);
    expect(res.body.data.thumbnailFileName).toBeDefined();
    expect(mockMinio.putObject).toHaveBeenCalled();
  });

  it('POST /api/canvas/uploadThumbnail — 不支持的文件类型应拒绝', async () => {
    await agent
      .post('/api/canvas/uploadThumbnail')
      .field('canvasId', canvasId)
      .attach('thumbnail', Buffer.from('fake-exe'), {
        filename: 'malware.exe',
        contentType: 'application/octet-stream',
      })
      .expect(400);
  });

  it('POST /api/canvas/uploadThumbnail — 画布不存在应 404', async () => {
    const res = await agent
      .post('/api/canvas/uploadThumbnail')
      .field('canvasId', 99999)
      .attach('thumbnail', Buffer.from('fake-png'), {
        filename: 'thumb.png',
        contentType: 'image/png',
      })
      .expect(404);

    expect(res.body.code).toBe(3006);
  });

  it('POST /api/canvas/uploadThumbnail — 未登录应被拒绝', async () => {
    await request(app.getHttpServer())
      .post('/api/canvas/uploadThumbnail')
      .field('canvasId', canvasId)
      .attach('thumbnail', Buffer.from('fake-png'), {
        filename: 'thumb.png',
        contentType: 'image/png',
      })
      .expect(401);
  });

  it('POST /api/canvas/uploadThumbnail — 缺少文件应 400', async () => {
    await agent
      .post('/api/canvas/uploadThumbnail')
      .field('canvasId', canvasId)
      .expect(400);
  });

  it('POST /api/canvas/uploadThumbnail — 上传 jpeg 格式应成功', async () => {
    const res = await agent
      .post('/api/canvas/uploadThumbnail')
      .field('canvasId', canvasId)
      .attach('thumbnail', Buffer.from('fake-jpeg'), {
        filename: 'thumb.jpg',
        contentType: 'image/jpeg',
      })
      .expect(201);

    expect(res.body.code).toBe(200);
  });

  it('POST /api/canvas/uploadThumbnail — 旧缩略图应被删除', async () => {
    // 先确保画布有旧缩略图
    const canvas = store.canvases.find((c) => c.id === canvasId);
    canvas!.thumbnailFileName = 'thumbnails/old.png';
    mockMinio.removeObject.mockClear();

    await agent
      .post('/api/canvas/uploadThumbnail')
      .field('canvasId', canvasId)
      .attach('thumbnail', Buffer.from('new-png'), {
        filename: 'new.png',
        contentType: 'image/png',
      })
      .expect(201);

    expect(mockMinio.removeObject).toHaveBeenCalledWith('thumbnails/old.png');
  });
});
