/**
 * 测试数据夹具 — 共享常量与种子数据
 */
import * as crypto from 'crypto';

/** 测试通用密码 */
export const TEST_PASSWORD = 'password123';

/** 预计算 sha256 哈希 */
export function hashPassword(pw: string): string {
  return crypto.createHash('sha256').update(pw).digest('hex');
}

/** 种子用户模板 */
export const SEED_USERS = {
  owner: { username: 'owner', email: 'owner@test.com', password: TEST_PASSWORD },
  guest: { username: 'guest', email: 'guest@test.com', password: TEST_PASSWORD },
  alice: { username: 'alice', email: 'alice@test.com', password: TEST_PASSWORD },
} as const;

/** 种子画布模板 */
export const SEED_CANVASES = {
  basic: { title: 'Test Canvas' },
  withNodes: { title: 'Canvas With Nodes', nodes: [{ id: 'n1' }], edges: [] },
} as const;
