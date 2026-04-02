/**
 * Canvas 权限策略常量与辅助方法
 *
 * 权限层级：owner > edit > view
 * - owner：完全控制（CRUD + 分享管理）
 * - edit：可读 + 可写画布内容
 * - view：仅读
 *
 * 校验职责分布：
 * - CanvasService：画布 CRUD 的 owner/share 校验
 * - ShareService：分享管理的 owner-only 校验
 * - AuthGuard：全局 session 鉴权
 */

export const VALID_PERMISSIONS = ['view', 'edit'] as const;
export type SharePermission = (typeof VALID_PERMISSIONS)[number];

export function canRead(permission: string | null): boolean {
  return permission === 'view' || permission === 'edit';
}

export function canWrite(permission: string | null): boolean {
  return permission === 'edit';
}
