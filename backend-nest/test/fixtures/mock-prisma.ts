/**
 * 共享 Mock PrismaService 工厂
 *
 * 提供内存数据存储 + 完整的 Prisma 模型 mock 实现，
 * 供所有 e2e 测试复用，避免各测试文件重复定义。
 */

export interface InMemoryStore {
  users: Record<string, any>[];
  canvases: Record<string, any>[];
  shares: Record<string, any>[];
  userIdSeq: number;
  canvasIdSeq: number;
  shareIdSeq: number;
}

export function createStore(): InMemoryStore {
  return {
    users: [],
    canvases: [],
    shares: [],
    userIdSeq: 0,
    canvasIdSeq: 0,
    shareIdSeq: 0,
  };
}

export function createMockPrisma(store: InMemoryStore): Record<string, any> {
  return {
    user: {
      findFirst: jest.fn().mockImplementation(({ where }: any) => {
        const or = where.OR as any[];
        return Promise.resolve(
          store.users.find((u) =>
            or.some(
              (c: any) => c.username === u.username || c.email === u.email,
            ),
          ) || null,
        );
      }),
      findUnique: jest.fn().mockImplementation(({ where }: any) => {
        if (where.username)
          return Promise.resolve(
            store.users.find((u) => u.username === where.username) || null,
          );
        if (where.id)
          return Promise.resolve(
            store.users.find((u) => u.id === where.id) || null,
          );
        return Promise.resolve(null);
      }),
      create: jest.fn().mockImplementation(({ data }: any) => {
        const user = {
          id: ++store.userIdSeq,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        store.users.push(user);
        return Promise.resolve(user);
      }),
      findMany: jest.fn().mockImplementation(({ where }: any) => {
        if (!where?.OR) return Promise.resolve([]);
        const keyword: string =
          where.OR[0]?.username?.contains || '';
        return Promise.resolve(
          store.users.filter(
            (u) =>
              u.username.toLowerCase().includes(keyword.toLowerCase()) ||
              u.email.toLowerCase().includes(keyword.toLowerCase()),
          ),
        );
      }),
    },
    canvas: {
      create: jest.fn().mockImplementation(({ data }: any) => {
        const canvas = {
          id: ++store.canvasIdSeq,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        store.canvases.push(canvas);
        return Promise.resolve(canvas);
      }),
      findMany: jest.fn().mockImplementation(({ where }: any) => {
        return Promise.resolve(
          store.canvases.filter((c) => c.userId === where.userId),
        );
      }),
      findUnique: jest.fn().mockImplementation(({ where }: any) => {
        return Promise.resolve(
          store.canvases.find((c) => c.id === where.id) || null,
        );
      }),
      update: jest.fn().mockImplementation(({ where, data }: any) => {
        const c = store.canvases.find((c) => c.id === where.id);
        if (!c) return Promise.resolve(null);
        Object.assign(c, data, { updatedAt: new Date() });
        return Promise.resolve(c);
      }),
      delete: jest.fn().mockImplementation(({ where }: any) => {
        const idx = store.canvases.findIndex((c) => c.id === where.id);
        if (idx === -1) return Promise.resolve(null);
        return Promise.resolve(store.canvases.splice(idx, 1)[0]);
      }),
    },
    canvasShare: {
      findMany: jest.fn().mockImplementation(({ where }: any) => {
        if (where.userId) {
          return Promise.resolve(
            store.shares
              .filter((s) => s.userId === where.userId)
              .map((s) => {
                const canvas = store.canvases.find(
                  (c) => c.id === s.canvasId,
                );
                const owner = canvas
                  ? store.users.find((u) => u.id === canvas.userId)
                  : null;
                return {
                  ...s,
                  canvas: canvas
                    ? {
                        id: canvas.id,
                        title: canvas.title,
                        userId: canvas.userId,
                        user: owner
                          ? {
                              username: owner.username,
                              email: owner.email,
                            }
                          : null,
                      }
                    : null,
                };
              }),
          );
        }
        if (where.canvasId) {
          return Promise.resolve(
            store.shares
              .filter((s) => s.canvasId === where.canvasId)
              .map((s) => {
                const u = store.users.find((u) => u.id === s.userId);
                return {
                  ...s,
                  user: u
                    ? { id: u.id, username: u.username, email: u.email }
                    : null,
                };
              }),
          );
        }
        return Promise.resolve([]);
      }),
      findUnique: jest.fn().mockImplementation(({ where }: any) => {
        if (where.id)
          return Promise.resolve(
            store.shares.find((s) => s.id === where.id) || null,
          );
        if (where.canvasId_userId) {
          const k = where.canvasId_userId;
          return Promise.resolve(
            store.shares.find(
              (s) => s.canvasId === k.canvasId && s.userId === k.userId,
            ) || null,
          );
        }
        return Promise.resolve(null);
      }),
      create: jest.fn().mockImplementation(({ data }: any) => {
        const share = {
          id: ++store.shareIdSeq,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        store.shares.push(share);
        return Promise.resolve(share);
      }),
      update: jest.fn().mockImplementation(({ where, data }: any) => {
        const s = store.shares.find((s) => s.id === where.id);
        if (!s) return Promise.resolve(null);
        Object.assign(s, data, { updatedAt: new Date() });
        return Promise.resolve(s);
      }),
      delete: jest.fn().mockImplementation(({ where }: any) => {
        const idx = store.shares.findIndex((s) => s.id === where.id);
        if (idx === -1) return Promise.resolve(null);
        return Promise.resolve(store.shares.splice(idx, 1)[0]);
      }),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };
}
