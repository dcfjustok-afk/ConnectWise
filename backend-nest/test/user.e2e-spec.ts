import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, hashPassword, TEST_PASSWORD } from './fixtures';

describe('User Search (e2e)', () => {
  let app: INestApplication;

  const mockUsers = [
    { id: 1, username: 'alice', email: 'alice@test.com' },
    { id: 2, username: 'bob', email: 'bob@test.com' },
  ];

  const prisma: Record<string, any> = {
    user: {
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn().mockImplementation(({ where }: any) => {
        return Promise.resolve(mockUsers.find((u) => u.username === where.username) || null);
      }),
      create: jest.fn(),
      findMany: jest.fn().mockImplementation(({ where }: any) => {
        if (!where?.OR) return Promise.resolve([]);
        const keyword: string = where.OR[0]?.username?.contains || '';
        return Promise.resolve(
          mockUsers.filter(
            (u) =>
              u.username.toLowerCase().includes(keyword.toLowerCase()) ||
              u.email.toLowerCase().includes(keyword.toLowerCase()),
          ),
        );
      }),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeAll(async () => {
    app = await createTestApp(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/user/search — 需要登录 (AuthGuard)', async () => {
    await request(app.getHttpServer())
      .get('/api/user/search?keyword=ali')
      .expect(401);
  });

  it('GET /api/user/search — 登录后搜索', async () => {
    const hashed = hashPassword(TEST_PASSWORD);
    prisma.user.findUnique.mockImplementation(({ where }: any) => {
      if (where.username === 'alice') {
        return Promise.resolve({ ...mockUsers[0], password: hashed });
      }
      return Promise.resolve(null);
    });

    const agent = request.agent(app.getHttpServer());
    await agent
      .post('/api/user/login')
      .send({ username: 'alice', password: TEST_PASSWORD })
      .expect(200);

    const res = await agent.get('/api/user/search?keyword=ali').expect(200);
    expect(res.body.code).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('GET /api/user/search — 空关键词返回空数组', async () => {
    const hashed = hashPassword(TEST_PASSWORD);
    prisma.user.findUnique.mockImplementation(({ where }: any) => {
      if (where.username === 'alice') {
        return Promise.resolve({ ...mockUsers[0], password: hashed });
      }
      return Promise.resolve(null);
    });

    const agent = request.agent(app.getHttpServer());
    await agent
      .post('/api/user/login')
      .send({ username: 'alice', password: TEST_PASSWORD })
      .expect(200);

    const res = await agent.get('/api/user/search?keyword=').expect(200);
    expect(res.body.data).toEqual([]);
  });
});
