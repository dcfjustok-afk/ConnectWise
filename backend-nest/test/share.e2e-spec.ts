import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createStore, createMockPrisma, createTestApp, SEED_USERS } from './fixtures';
import type { InMemoryStore } from './fixtures';

describe('Share (e2e)', () => {
  let app: INestApplication;
  let store: InMemoryStore;

  const prisma = (() => {
    store = createStore();
    return createMockPrisma(store);
  })();

  let ownerAgent: any;
  let guestAgent: any;
  let ownerId: number;
  let guestId: number;
  let canvasId: number;

  beforeAll(async () => {
    store = createStore();
    Object.assign(prisma, createMockPrisma(store));
    app = await createTestApp(prisma);

    // 注册 owner
    ownerAgent = request.agent(app.getHttpServer());
    await ownerAgent
      .post('/api/user/register')
      .send(SEED_USERS.owner)
      .expect(201);
    await ownerAgent
      .post('/api/user/login')
      .send({ username: SEED_USERS.owner.username, password: SEED_USERS.owner.password })
      .expect(200);
    ownerId = store.userIdSeq;

    // 注册 guest
    guestAgent = request.agent(app.getHttpServer());
    await guestAgent
      .post('/api/user/register')
      .send(SEED_USERS.guest)
      .expect(201);
    await guestAgent
      .post('/api/user/login')
      .send({ username: SEED_USERS.guest.username, password: SEED_USERS.guest.password })
      .expect(200);
    guestId = store.userIdSeq;

    // owner 创建画布
    const res = await ownerAgent
      .post(`/api/canvas/create/${ownerId}`)
      .send({ title: 'Share Test Canvas' })
      .expect(201);
    canvasId = res.body.data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  // ── 未登录 ──
  it('未登录应被 AuthGuard 拒绝', async () => {
    await request(app.getHttpServer()).get('/api/share/user/1').expect(401);
  });

  // ── 创建分享 ──
  it('POST /api/share — owner 成功创建分享', async () => {
    const res = await ownerAgent
      .post('/api/share')
      .send({ canvasId, toUsername: 'guest', permission: 'view' })
      .expect(201);

    expect(res.body.code).toBe(200);
    expect(res.body.data.canvasId).toBe(canvasId);
    expect(res.body.data.permission).toBe('view');
  });

  it('POST /api/share — 重复分享应返回 4004', async () => {
    const res = await ownerAgent
      .post('/api/share')
      .send({ canvasId, toUsername: 'guest', permission: 'view' })
      .expect(400);

    expect(res.body.code).toBe(4004);
  });

  it('POST /api/share — 非 owner 创建分享应拒绝', async () => {
    const res = await guestAgent
      .post('/api/share')
      .send({ canvasId, toUsername: 'owner', permission: 'view' })
      .expect(403);

    expect(res.body.code).toBe(4003);
  });

  it('POST /api/share — 目标用户不存在应返回 4005', async () => {
    const res = await ownerAgent
      .post('/api/share')
      .send({ canvasId, toUsername: 'nobody', permission: 'view' })
      .expect(400);

    expect(res.body.code).toBe(4005);
  });

  it('POST /api/share — DTO 校验：无效 permission', async () => {
    await ownerAgent
      .post('/api/share')
      .send({ canvasId, toUsername: 'guest', permission: 'admin' })
      .expect(400);
  });

  // ── 查询分享 ──
  it('GET /api/share/user/:userId — guest 查看自己被分享的列表', async () => {
    const res = await guestAgent
      .get(`/api/share/user/${guestId}`)
      .expect(200);

    expect(res.body.code).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/share/user/:userId — 查看他人的列表应拒绝', async () => {
    const res = await guestAgent
      .get(`/api/share/user/${ownerId}`)
      .expect(403);

    expect(res.body.code).toBe(4003);
  });

  it('GET /api/share/:canvasId — owner 查看画布分享列表', async () => {
    const res = await ownerAgent
      .get(`/api/share/${canvasId}`)
      .expect(200);

    expect(res.body.code).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('GET /api/share/:canvasId — 非 owner 查看应拒绝', async () => {
    const res = await guestAgent
      .get(`/api/share/${canvasId}`)
      .expect(403);

    expect(res.body.code).toBe(4003);
  });

  // ── 修改权限 ──
  it('PUT /api/share — owner 修改权限', async () => {
    const shareId = store.shares[0]?.id;
    const res = await ownerAgent
      .put('/api/share')
      .send({ id: shareId, permission: 'edit' })
      .expect(200);

    expect(res.body.code).toBe(200);
    expect(res.body.data.permission).toBe('edit');
  });

  it('PUT /api/share — 非 owner 修改应拒绝', async () => {
    const shareId = store.shares[0]?.id;
    const res = await guestAgent
      .put('/api/share')
      .send({ id: shareId, permission: 'view' })
      .expect(403);

    expect(res.body.code).toBe(4003);
  });

  // ── 删除分享 ──
  it('DELETE /api/share/:shareId — owner 删除分享', async () => {
    const shareId = store.shares[0]?.id;
    const res = await ownerAgent
      .delete(`/api/share/${shareId}`)
      .expect(200);

    expect(res.body.code).toBe(200);
    expect(res.body.data.success).toBe(true);
  });

  it('DELETE /api/share/:shareId — 不存在的分享应 404', async () => {
    const res = await ownerAgent
      .delete('/api/share/99999')
      .expect(404);

    expect(res.body.code).toBe(4005);
  });
});
