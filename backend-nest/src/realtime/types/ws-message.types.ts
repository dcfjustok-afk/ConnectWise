/**
 * WS 消息类型常量 — 与旧系统 CanvasWebSocketHandler 对齐
 */
export enum WsEventType {
  // ── 心跳 ──
  PING = 'ping',
  PONG = 'pong',

  // ── Node 操作 ──
  ADD_NODE = 'addNode',
  DELETE_NODE = 'deleteNode',
  UPDATE_NODE = 'updateNode',
  FLUSH_NODE = 'flushNode',

  // ── Edge 操作 ──
  ADD_EDGE = 'addEdge',
  DELETE_EDGE = 'deleteEdge',
  UPDATE_EDGE = 'updateEdge',
  FLUSH_EDGE = 'flushEdge',
}

/**
 * WS 自定义关闭码（4000-4999 范围，RFC 6455 允许应用层自定义）
 *
 * 与 BizErrorCode 一一映射，方便前端根据 close code 做统一处理。
 */
export enum WsCloseCode {
  UNAUTHORIZED = 4001,
  MISSING_CANVAS_ID = 4002,
  FORBIDDEN = 4003,
  GLOBAL_LIMIT = 4007,
  ROOM_LIMIT = 4008,
  INTERNAL_ERROR = 4500,
}

/**
 * 客户端 → 服务器 消息体
 */
export interface WsIncomingMessage {
  type: WsEventType | string;
  canvasId: number;
  data?: unknown;
  version?: number;
}

/**
 * 服务器 → 客户端 消息体
 */
export interface WsOutgoingMessage {
  type: WsEventType | string;
  canvasId: number;
  data?: unknown;
  version?: number;
  code?: number;
  msg?: string;
}

/**
 * WS 错误回包
 */
export interface WsErrorMessage {
  type: 'error';
  code: number;
  msg: string;
}
