/**
 * 业务错误码定义
 *
 * 编码规则（与旧系统 ResponseCode.java 对齐）：
 * - 1xxx：通用/系统
 * - 2xxx：认证与用户
 * - 3xxx：画布
 * - 4xxx：分享
 * - 5xxx：实时/WS
 * - 6xxx：AI（新增）
 *
 * 旧系统兼容码保持原值不变。
 */
export enum BizErrorCode {
  // ── 通用/系统（旧 1xxx）──
  BAD_REQUEST = 1001,       // 旧 BAD_REQUEST(1001)
  UNAUTHORIZED = 1002,      // 旧 UNAUTHORIZED(1002)
  FORBIDDEN = 1003,         // 旧 FORBIDDEN(1003)
  INTERNAL_ERROR = 1005,    // 旧 SERVER_ERROR(1005)

  // ── 认证与用户（旧 2xxx）──
  LOGIN_FAILED = 2001,          // 旧 USER_LOGIN_FAILED(2001)
  USER_ALREADY_EXISTS = 2004,   // 旧 USER_ALREADY_EXISTS(2004)
  USER_NOT_FOUND = 2005,        // 旧 USER_NOT_FOUND(2005)
  USER_SESSION_EXPIRED = 2007,  // 旧 USER_SESSION_EXPIRED(2007)

  // ── 画布（旧 3xxx）──
  CANVAS_NOT_FOUND = 3006,     // 旧 CANVAS_NOT_FOUND(3006)
  CANVAS_ACCESS_DENIED = 3007, // 旧 CANVAS_PERMISSION_DENIED(3007)

  // ── 分享（旧 4xxx）──
  SHARE_PERMISSION_DENIED = 4003, // 旧 CANVAS_SHARE_PERMISSION_DENIED(4003)
  SHARE_DUPLICATE = 4004,         // 旧 CANVAS_SHARE_ALREADY_EXISTS(4004)
  SHARE_NOT_FOUND = 4005,         // 旧 CANVAS_SHARE_USER_NOT_FOUNT(4005)

  // ── WS/实时（旧 5xxx）──
  WS_GLOBAL_LIMIT = 5007,  // 旧 WS_OVER_MAXCONNECTIONS(5007)
  WS_ROOM_LIMIT = 5008,    // 旧 WS_OVER_ROOM_MAXCONNECTIONS(5008)
  WS_AUTH_FAILED = 5009,    // 新增

  // ── AI（新增 6xxx）──
  AI_PROVIDER_ERROR = 6001,
  AI_TIMEOUT = 6002,
  AI_QUOTA_EXCEEDED = 6003,
}
