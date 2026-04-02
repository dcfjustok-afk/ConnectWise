import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createStore, createMockPrisma, createTestApp, TEST_PASSWORD } from './fixtures';
import type { InMemoryStore } from './fixtures';

describe('Canvas (e2e)', () => {
  let app: INestApplication;
  let store: InMemoryStore;

  const prisma = (() => {
    store = createStore();
    return createMockPrisma(store);
  })();

  let agent: any;

  beforeAll(async () => {
    store = createStore();
    Object.assign(prisma, createMockPrisma(store));
    app = await createTestApp(prisma);

    // 注册 + 登录
    agent = request.agent(app.getHttpServer());
    await agent
      .post('/api/user/register')
      .send({ username: 'canvas_user', email: 'canvas@test.com', password: TEST_PASSWORD })
      .expect(201);
    await agent
      .post('/api/user/login')
      .send({ username: 'canvas_user', password: TEST_PASSWORD })
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });

  // ── 未登录拒绝 ──

  it('未登录应被 AuthGuard 拒绝', async () => {
    await request(app.getHttpServer())
      .post('/api/canvas/create/1')
      .send({ title: 'test' })
      .expect(401);
  });

  // ── 创建 ──

  it('POST /api/canvas/create/:userId — 成功创建画布', async () => {
    const res = await agent
      .post(`/api/canvas/create/${store.userIdSeq}`)
      .send({ title: 'My Canvas', nodes: [{ id: 'n1' }], edges: [] })
      .expect(201);

    expect(res.body.code).toBe(200);
    expect(res.body.data.title).toBe('My Canvas');
    expect(res.body.data.id).toBeDefined();
  });

  it('POST /api/canvas/create/:userId — DTO 校验：title 为空', async () => {
    const res = await agent
      .post(`/api/canvas/create/${store.userIdSeq}`)
      .send({ title: '' })
      .expect(400);

    expect(res.body.code).toBeDefined();
  });

  it('POST /api/canvas/create/:userId — 路径 userId 不一致应拒绝', async () => {
    const res = await agent
      .post('/api/canvas/create/9999')
      .send({ title: 'Nope' })
      .expect(403);

    expect(res.body.code).toBe(3007);
  });

  // ── 读取列表 ──

  it('GET /api/canvas/user/:userId — 获取画布列表', async () => {
    const res = await agent
      .get(`/api/canvas/user/${store.userIdSeq}`)
      .expect(200);

    expect(res.body.code).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/canvas/user/:userId — 其他用户的列表应拒绝', async () => {
    const res = await agent
      .get('/api/canvas/user/9999')
      .expect(403);

    expect(res.body.code).toBe(3007);
  });

  // ── 读取单个 ──

  it('GET /api/canvas/:id — 获取自己的画布', async () => {
    const res = await agent
      .get(`/api/canvas/${store.canvasIdSeq}`)
      .expect(200);

    expect(res.body.code).toBe(200);
    expect(res.body.data.title).toBe('My Canvas');
  });

  it('GET /api/canvas/:id — 画布不存在应 404', async () => {
    const res = await agent
      .get('/api/canvas/99999')
      .expect(404);

    expect(res.body.code).toBe(3006);
  });

  // ── 更新 ──

  it('PUT /api/canvas — 更新画布标题', async () => {
    const res = await agent
      .put('/api/canvas')
      .send({ id: store.canvasIdSeq, title: 'Updated Canvas' })
      .expect(200);

    expect(res.body.code).toBe(200);
    expect(res.body.data.title).toBe('Updated Canvas');
  });

  it('PUT /api/canvas — DTO 校验：id 缺失', async () => {
    await agent
      .put('/api/canvas')
      .send({ title: 'No Id' })
      .expect(400);
  });

  it('PUT /api/canvas — 画布不存在应 404', async () => {
    const res = await agent
      .put('/api/canvas')
      .send({ id: 99999, title: 'Ghost' })
      .expect(404);

    expect(res.body.code).toBe(3006);
  });

  // ── 连接 ──

  it('GET /api/canvas/connection — 获取连接列表', async () => {
    const res = await agent
      .get('/api/canvas/connection')
      .expect(200);

    expect(res.body.code).toBe(200);
    expect(res.body.data).toHaveProperty('owned');
    expect(res.body.data).toHaveProperty('shared');
  });

  // ── 删除 ──

  it('DELETE /api/canvas/:canvasId — 删除画布', async () => {
    // 先创建一个用于删除
    const createRes = await agent
      .post(`/api/canvas/create/${store.userIdSeq}`)
      .send({ title: 'To Delete' })
      .expect(201);

    const deleteId = createRes.body.data.id;

    const res = await agent
      .delete(`/api/canvas/${deleteId}`)
      .expect(200);

    expect(res.body.code).toBe(200);
    expect(res.body.data.success).toBe(true);
  });

  it('DELETE /api/canvas/:canvasId — 画布不存在应 404', async () => {
    const res = await agent
      .delete('/api/canvas/99999')
      .expect(404);

    expect(res.body.code).toBe(3006);
  });
});
