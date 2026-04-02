import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createStore, createMockPrisma, createTestApp, SEED_USERS } from './fixtures';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const store = createStore();
    const prisma = createMockPrisma(store);
    app = await createTestApp(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  // Step 063: register / login / logout / check-auth

  it('POST /api/user/register — 成功注册', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/user/register')
      .send({ username: 'alice', email: 'alice@test.com', password: 'password123' })
      .expect(201);

    expect(res.body.code).toBe(200);
    expect(res.body.data.username).toBe('alice');
  });

  it('POST /api/user/register — 重复用户', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/user/register')
      .send({ username: 'alice', email: 'alice@test.com', password: 'password123' })
      .expect(400);

    expect(res.body.code).toBe(2004);
  });

  it('POST /api/user/login — 成功登录', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/user/login')
      .send({ username: 'alice', password: 'password123' })
      .expect(200);

    expect(res.body.code).toBe(200);
    expect(res.body.data.username).toBe('alice');
  });

  it('POST /api/user/login — 错误密码', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/user/login')
      .send({ username: 'alice', password: 'wrongpassword' })
      .expect(400);

    expect(res.body.code).toBe(2001);
  });

  it('POST /api/user/check-auth — 未登录', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/user/check-auth')
      .expect(200);

    expect(res.body.data.authenticated).toBe(false);
  });

  it('POST /api/user/check-auth — 登录后（含 session cookie）', async () => {
    const agent = request.agent(app.getHttpServer());

    await agent
      .post('/api/user/login')
      .send({ username: 'alice', password: 'password123' })
      .expect(200);

    const res = await agent.post('/api/user/check-auth').expect(200);
    expect(res.body.data.authenticated).toBe(true);
    expect(res.body.data.username).toBe('alice');
  });

  it('POST /api/user/logout — 需先登录', async () => {
    const agent = request.agent(app.getHttpServer());

    // 未登录应拒绝（AuthGuard）
    await agent.post('/api/user/logout').expect(401);

    // 登录
    await agent
      .post('/api/user/login')
      .send({ username: 'alice', password: 'password123' })
      .expect(200);

    // 登出
    const res = await agent.post('/api/user/logout').expect(200);
    expect(res.body.data.success).toBe(true);

    // 登出后 check-auth
    const checkRes = await agent.post('/api/user/check-auth').expect(200);
    expect(checkRes.body.data.authenticated).toBe(false);
  });
});
