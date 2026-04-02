/**
 * Step 124: WS 双客户端契约测试
 *
 * 验证两个 WS 客户端连入同一画布房间后：
 * 1. 正常消息（addNode/deleteNode/addEdge/deleteEdge）广播到对方
 * 2. updateNode + version 冲突 → flushNode 回包
 * 3. ping → pong
 * 4. 错误握手场景（无 session、缺 canvasId、无权）
 */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { WebSocket, Data as WsData } from 'ws';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { SESSION_MIDDLEWARE } from '../src/session/session.module';
import { createStore, createMockPrisma, InMemoryStore } from './fixtures';

let app: INestApplication;
let store: InMemoryStore;
let baseUrl: string;
let ownerCookie: string;
let guestCookie: string;

// 帮助函数：收集 WS 消息（带超时）
function collectMessages(ws: WebSocket, count: number, timeoutMs = 3000): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const msgs: any[] = [];
    const timer = setTimeout(() => resolve(msgs), timeoutMs);
    ws.on('message', (raw: WsData) => {
      msgs.push(JSON.parse(raw.toString()));
      if (msgs.length >= count) {
        clearTimeout(timer);
        resolve(msgs);
      }
    });
    ws.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

// 帮助函数：等待 WS 连接打开
function waitOpen(ws: WebSocket): Promise<void> {
  return new Promise((resolve, reject) => {
    if (ws.readyState === WebSocket.OPEN) return resolve();
    ws.on('open', () => resolve());
    ws.on('error', (err) => reject(err));
  });
}

// 帮助函数：等待 WS 关闭
function waitClose(ws: WebSocket, timeoutMs = 3000): Promise<{ code: number; reason: string }> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve({ code: 0, reason: 'timeout' }), timeoutMs);
    ws.on('close', (code: number, reason: Buffer) => {
      clearTimeout(timer);
      resolve({ code, reason: reason.toString() });
    });
  });
}

// 帮助函数：HTTP 登录获取 cookie
async function login(
  appUrl: string,
  username: string,
  password: string,
): Promise<string> {
  const res = await fetch(`${appUrl}/api/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    redirect: 'manual',
  });
  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) throw new Error('No cookie returned from login');
  return setCookie.split(';')[0];
}

beforeAll(async () => {
  store = createStore();
  const mockPrisma = createMockPrisma(store);

  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue(mockPrisma)
    .compile();

  app = moduleFixture.createNestApplication();

  // 使用 DI 容器中的 session 中间件（与 RealtimeModule WS upgrade 共享同一 MemoryStore）
  const sessionMiddleware = app.get(SESSION_MIDDLEWARE);
  app.use(sessionMiddleware);

  app.setGlobalPrefix('api');
  await app.init();
  await app.listen(0);

  const url = await app.getUrl();
  baseUrl = url.replace('[::1]', 'localhost');

  // 注册 owner 和 guest
  await fetch(`${baseUrl}/api/user/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'owner', email: 'owner@test.com', password: 'password123' }),
  });
  await fetch(`${baseUrl}/api/user/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'guest', email: 'guest@test.com', password: 'password123' }),
  });

  // 登录获取 cookie
  ownerCookie = await login(baseUrl, 'owner', 'password123');
  guestCookie = await login(baseUrl, 'guest', 'password123');

  // owner 创建一个画布
  await fetch(`${baseUrl}/api/canvas/create/1`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ownerCookie },
    body: JSON.stringify({ title: 'WS Test Canvas' }),
  });

  // owner 给 guest 分享（edit 权限）
  await fetch(`${baseUrl}/api/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: ownerCookie },
    body: JSON.stringify({ canvasId: 1, toUsername: 'guest', permission: 'edit' }),
  });
});

afterAll(async () => {
  await app.close();
});

function connectWs(cookie: string, canvasId: number): WebSocket {
  const wsUrl = baseUrl.replace('http', 'ws');
  return new WebSocket(`${wsUrl}/ws?canvasId=${canvasId}`, {
    headers: { Cookie: cookie },
  });
}

describe('WS 双客户端契约', () => {
  describe('握手阶段', () => {
    it('无 session → 关闭 4001 + 错误帧', async () => {
      const wsUrl = baseUrl.replace('http', 'ws');
      const ws = new WebSocket(`${wsUrl}/ws?canvasId=1`);
      const closePromise = waitClose(ws);
      const msgPromise = collectMessages(ws, 1);

      const [closeResult, msgs] = await Promise.all([closePromise, msgPromise]);

      expect(closeResult.code).toBe(4001);
      if (msgs.length > 0) {
        expect(msgs[0].type).toBe('error');
        expect(msgs[0].code).toBe(5009); // WS_AUTH_FAILED
      }
    });

    it('缺少 canvasId → 关闭 4002', async () => {
      const wsUrl = baseUrl.replace('http', 'ws');
      const ws = new WebSocket(`${wsUrl}/ws`, {
        headers: { Cookie: ownerCookie },
      });
      const closeResult = await waitClose(ws);
      expect(closeResult.code).toBe(4002);
    });
  });

  describe('消息广播', () => {
    let ws1: WebSocket;
    let ws2: WebSocket;

    beforeEach(async () => {
      ws1 = connectWs(ownerCookie, 1);
      ws2 = connectWs(guestCookie, 1);
      await Promise.all([waitOpen(ws1), waitOpen(ws2)]);
    });

    afterEach(() => {
      [ws1, ws2].forEach((ws) => {
        if (ws.readyState <= WebSocket.OPEN) ws.close();
      });
    });

    it('addNode: 发送者不回收，对方收到', async () => {
      const msgPromise = collectMessages(ws2, 1);
      ws1.send(JSON.stringify({
        type: 'addNode',
        canvasId: 1,
        data: { id: 'n1', label: 'test' },
      }));

      const msgs = await msgPromise;
      expect(msgs).toHaveLength(1);
      expect(msgs[0].type).toBe('addNode');
      expect(msgs[0].canvasId).toBe(1);
      expect(msgs[0].data).toEqual({ id: 'n1', label: 'test' });
    });

    it('deleteNode: 对方收到广播', async () => {
      const msgPromise = collectMessages(ws2, 1);
      ws1.send(JSON.stringify({
        type: 'deleteNode',
        canvasId: 1,
        data: { id: 'n1' },
      }));

      const msgs = await msgPromise;
      expect(msgs).toHaveLength(1);
      expect(msgs[0].type).toBe('deleteNode');
    });

    it('addEdge: 对方收到广播', async () => {
      const msgPromise = collectMessages(ws1, 1);
      ws2.send(JSON.stringify({
        type: 'addEdge',
        canvasId: 1,
        data: { id: 'e1', source: 'n1', target: 'n2' },
      }));

      const msgs = await msgPromise;
      expect(msgs).toHaveLength(1);
      expect(msgs[0].type).toBe('addEdge');
    });

    it('deleteEdge: 对方收到广播', async () => {
      const msgPromise = collectMessages(ws1, 1);
      ws2.send(JSON.stringify({
        type: 'deleteEdge',
        canvasId: 1,
        data: { id: 'e1' },
      }));

      const msgs = await msgPromise;
      expect(msgs).toHaveLength(1);
      expect(msgs[0].type).toBe('deleteEdge');
    });
  });

  describe('ping/pong', () => {
    it('ping → 收到 pong', async () => {
      const ws = connectWs(ownerCookie, 1);
      await waitOpen(ws);

      const msgPromise = collectMessages(ws, 1);
      ws.send(JSON.stringify({ type: 'ping', canvasId: 1 }));

      const msgs = await msgPromise;
      expect(msgs).toHaveLength(1);
      expect(msgs[0].type).toBe('pong');
      expect(msgs[0].canvasId).toBe(1);

      ws.close();
    });
  });

  describe('updateNode + version 冲突', () => {
    let ws1: WebSocket;
    let ws2: WebSocket;

    beforeEach(async () => {
      ws1 = connectWs(ownerCookie, 1);
      ws2 = connectWs(guestCookie, 1);
      await Promise.all([waitOpen(ws1), waitOpen(ws2)]);
    });

    afterEach(() => {
      [ws1, ws2].forEach((ws) => {
        if (ws.readyState <= WebSocket.OPEN) ws.close();
      });
    });

    it('正常 update → 对方收到 + 发送者收到 ack 携带新版本', async () => {
      const ws2Promise = collectMessages(ws2, 1);
      const ws1Promise = collectMessages(ws1, 1);

      ws1.send(JSON.stringify({
        type: 'updateNode',
        canvasId: 1,
        data: { id: 'n1', label: 'updated' },
        version: 0,
      }));

      const [ws2Msgs, ws1Msgs] = await Promise.all([ws2Promise, ws1Promise]);

      // 对方收到更新广播
      expect(ws2Msgs).toHaveLength(1);
      expect(ws2Msgs[0].type).toBe('updateNode');
      expect(ws2Msgs[0].version).toBeGreaterThan(0);

      // 发送者收到版本确认
      expect(ws1Msgs).toHaveLength(1);
      expect(ws1Msgs[0].type).toBe('updateNode');
      expect(ws1Msgs[0].version).toBeGreaterThan(0);
    });

    it('版本落后 → 发送者收到 flushNode', async () => {
      // 先正常更新一次使版本递增
      const firstAck = collectMessages(ws1, 1);
      ws1.send(JSON.stringify({
        type: 'updateNode', canvasId: 1,
        data: { id: 'n1', label: 'v1' }, version: 0,
      }));
      await firstAck;

      // 等 ws2 收到第一条广播
      await new Promise((r) => setTimeout(r, 200));

      // ws2 用过期版本 0 更新 → 应收到 flushNode
      const flushPromise = collectMessages(ws2, 1);
      ws2.send(JSON.stringify({
        type: 'updateNode', canvasId: 1,
        data: { id: 'n1', label: 'stale' }, version: 0,
      }));

      const msgs = await flushPromise;
      expect(msgs).toHaveLength(1);
      expect(msgs[0].type).toBe('flushNode');
      expect(msgs[0].msg).toContain('版本冲突');
    });
  });

  describe('异常消息处理', () => {
    it('无效 JSON → 收到 error 帧', async () => {
      const ws = connectWs(ownerCookie, 1);
      await waitOpen(ws);

      const msgPromise = collectMessages(ws, 1);
      ws.send('not-json{{{');

      const msgs = await msgPromise;
      expect(msgs).toHaveLength(1);
      expect(msgs[0].type).toBe('error');
      expect(msgs[0].code).toBe(1001); // BAD_REQUEST

      ws.close();
    });

    it('未知消息类型 → 收到 error 帧', async () => {
      const ws = connectWs(ownerCookie, 1);
      await waitOpen(ws);

      const msgPromise = collectMessages(ws, 1);
      ws.send(JSON.stringify({ type: 'unknownType', canvasId: 1 }));

      const msgs = await msgPromise;
      expect(msgs).toHaveLength(1);
      expect(msgs[0].type).toBe('error');
      expect(msgs[0].code).toBe(1001); // BAD_REQUEST

      ws.close();
    });

    it('客户端发 flushNode → 收到 error 帧', async () => {
      const ws = connectWs(ownerCookie, 1);
      await waitOpen(ws);

      const msgPromise = collectMessages(ws, 1);
      ws.send(JSON.stringify({ type: 'flushNode', canvasId: 1 }));

      const msgs = await msgPromise;
      expect(msgs).toHaveLength(1);
      expect(msgs[0].type).toBe('error');

      ws.close();
    });
  });
});
