import { Injectable } from '@nestjs/common';
import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { parse as parseUrl } from 'url';
import { ConfigService } from '@nestjs/config';
import { CanvasRepository } from '../canvas/canvas.repository';
import { canRead, canWrite } from '../common/policy/canvas-permission.policy';
import { BizErrorCode } from '../common/exceptions';
import { RoomManager, RoomClient } from './room-manager';
import {
  WsEventType,
  WsCloseCode,
  WsIncomingMessage,
  WsOutgoingMessage,
  WsErrorMessage,
} from './types';

interface SessionData {
  userId?: number;
  username?: string;
}

@Injectable()
export class CanvasWsGateway {
  private wss!: WebSocketServer;

  /** 全局连接上限 */
  private readonly globalMaxConn: number;
  /** 单房间连接上限 */
  private readonly roomMaxConn: number;

  constructor(
    private readonly roomManager: RoomManager,
    private readonly canvasRepository: CanvasRepository,
    private readonly configService: ConfigService,
  ) {
    this.globalMaxConn = this.configService.get<number>('app.wsGlobalMax', 1000);
    this.roomMaxConn = this.configService.get<number>('app.wsRoomMax', 50);
  }

  /**
   * 由 RealtimeModule.onModuleInit 调用, 传入已初始化的 WSS 实例
   */
  init(wss: WebSocketServer): void {
    this.wss = wss;
    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      this.handleConnection(ws, req);
    });
  }

  // ────────────────────── 握手 & 连接 ──────────────────────

  private async handleConnection(ws: WebSocket, req: IncomingMessage): Promise<void> {
    try {
      // Step 112: Session 鉴权
      const session = (req as any).session as SessionData | undefined;
      if (!session?.userId) {
        this.closeWithError(ws, BizErrorCode.WS_AUTH_FAILED, '未登录或会话已过期', WsCloseCode.UNAUTHORIZED);
        return;
      }

      const userId = session.userId;
      const username = session.username ?? 'unknown';

      // Step 111: 从 URL 参数提取 canvasId
      const parsedUrl = parseUrl(req.url ?? '', true);
      const canvasIdStr = parsedUrl.query['canvasId'] as string | undefined;
      const canvasId = canvasIdStr ? Number(canvasIdStr) : NaN;

      if (!canvasId || isNaN(canvasId)) {
        this.closeWithError(ws, BizErrorCode.CANVAS_NOT_FOUND, '缺少 canvasId 参数', WsCloseCode.MISSING_CANVAS_ID);
        return;
      }

      // Step 113: 画布权限校验
      const hasAccess = await this.checkCanvasAccess(canvasId, userId);
      if (!hasAccess) {
        this.closeWithError(ws, BizErrorCode.CANVAS_ACCESS_DENIED, '无权访问该画布', WsCloseCode.FORBIDDEN);
        return;
      }

      // 连接限流检查
      if (this.roomManager.getTotalConnections() >= this.globalMaxConn) {
        this.closeWithError(ws, BizErrorCode.WS_GLOBAL_LIMIT, '全局连接数已达上限', WsCloseCode.GLOBAL_LIMIT);
        return;
      }
      if (this.roomManager.getRoomSize(canvasId) >= this.roomMaxConn) {
        this.closeWithError(ws, BizErrorCode.WS_ROOM_LIMIT, '房间连接数已达上限', WsCloseCode.ROOM_LIMIT);
        return;
      }

      // 注册到房间
      const client: RoomClient = { ws, userId, username };
      this.roomManager.join(canvasId, client);

      // 事件监听
      ws.on('message', (raw: Buffer | string) => {
        this.handleMessage(client, canvasId, raw);
      });

      ws.on('close', () => {
        this.roomManager.leave(canvasId, client);
      });

      ws.on('error', () => {
        this.roomManager.leave(canvasId, client);
      });
    } catch {
      // Step 123: 兜底 — 握手阶段未知异常统一关闭
      this.closeWithError(ws, BizErrorCode.INTERNAL_ERROR, '服务器内部错误', WsCloseCode.INTERNAL_ERROR);
    }
  }

  // ────────────────────── 消息分发 ──────────────────────

  private handleMessage(client: RoomClient, canvasId: number, raw: Buffer | string): void {
    let msg: WsIncomingMessage;
    try {
      msg = JSON.parse(typeof raw === 'string' ? raw : raw.toString('utf-8'));
    } catch {
      this.sendError(client.ws, BizErrorCode.BAD_REQUEST, '无效的 JSON 消息');
      return;
    }

    if (!msg.type) {
      this.sendError(client.ws, BizErrorCode.BAD_REQUEST, '缺少 type 字段');
      return;
    }

    try {

    switch (msg.type) {
      // Step 114: ping/pong
      case WsEventType.PING:
        this.handlePing(client, canvasId);
        break;

      // Step 115-118: Node events
      case WsEventType.ADD_NODE:
        this.handleBroadcast(client, canvasId, msg);
        break;
      case WsEventType.DELETE_NODE:
        this.handleBroadcast(client, canvasId, msg);
        break;
      case WsEventType.UPDATE_NODE:
        this.handleUpdateWithVersion(client, canvasId, msg);
        break;
      case WsEventType.FLUSH_NODE:
        // flushNode 由服务端发起，客户端不应发送
        this.sendError(client.ws, BizErrorCode.BAD_REQUEST, 'flushNode 仅由服务端发送');
        break;

      // Step 119-122: Edge events
      case WsEventType.ADD_EDGE:
        this.handleBroadcast(client, canvasId, msg);
        break;
      case WsEventType.DELETE_EDGE:
        this.handleBroadcast(client, canvasId, msg);
        break;
      case WsEventType.UPDATE_EDGE:
        this.handleUpdateWithVersion(client, canvasId, msg);
        break;
      case WsEventType.FLUSH_EDGE:
        // flushEdge 由服务端发起
        this.sendError(client.ws, BizErrorCode.BAD_REQUEST, 'flushEdge 仅由服务端发送');
        break;

      default:
        this.sendError(client.ws, BizErrorCode.BAD_REQUEST, `未知消息类型: ${msg.type}`);
        break;
    }
    } catch {
      // Step 123: 兜底 — 消息处理阶段未知异常
      this.sendError(client.ws, BizErrorCode.INTERNAL_ERROR, '消息处理异常');
    }
  }

  // ────────────────────── Step 114: ping/pong ──────────────────────

  private handlePing(client: RoomClient, canvasId: number): void {
    const pong: WsOutgoingMessage = {
      type: WsEventType.PONG,
      canvasId,
    };
    this.send(client.ws, pong);
  }

  // ────────────────────── Step 115/116/119/120: add/delete 广播 ──────────────────────

  private handleBroadcast(client: RoomClient, canvasId: number, msg: WsIncomingMessage): void {
    const outgoing: WsOutgoingMessage = {
      type: msg.type,
      canvasId,
      data: msg.data,
    };
    const json = JSON.stringify(outgoing);
    // 广播给其他人（不回发给发送者）
    this.roomManager.broadcast(canvasId, json, client);
  }

  // ────────────────────── Step 117/121: update + version 冲突检测 ──────────────────────

  /**
   * 版本冲突检测逻辑：
   * - 客户端携带 version，服务端维护房间内单调递增版本号
   * - 若客户端 version 落后，触发 flush 回包（全量同步）
   * - 否则正常广播 update
   *
   * 这里采用轻量级内存版本：房间维度版本号，每次 update 递增。
   * 完整持久化冲突解决将在 Phase E 中实现。
   */
  private roomVersions = new Map<number, number>();

  private handleUpdateWithVersion(
    client: RoomClient,
    canvasId: number,
    msg: WsIncomingMessage,
  ): void {
    const currentVersion = this.roomVersions.get(canvasId) ?? 0;
    const clientVersion = msg.version ?? 0;

    if (clientVersion < currentVersion) {
      // 版本冲突 → 触发 flush 回包给发送者
      const flushType =
        msg.type === WsEventType.UPDATE_NODE
          ? WsEventType.FLUSH_NODE
          : WsEventType.FLUSH_EDGE;

      const flush: WsOutgoingMessage = {
        type: flushType,
        canvasId,
        data: msg.data,
        version: currentVersion,
        msg: '版本冲突，请同步最新数据',
      };
      this.send(client.ws, flush);
      return;
    }

    // 版本递增
    const newVersion = currentVersion + 1;
    this.roomVersions.set(canvasId, newVersion);

    // 正常广播（不回发给发送者），附带新版本号
    const outgoing: WsOutgoingMessage = {
      type: msg.type,
      canvasId,
      data: msg.data,
      version: newVersion,
    };
    const json = JSON.stringify(outgoing);
    this.roomManager.broadcast(canvasId, json, client);

    // 告知发送者新版本号（确认）
    const ack: WsOutgoingMessage = {
      type: msg.type,
      canvasId,
      version: newVersion,
    };
    this.send(client.ws, ack);
  }

  // ────────────────────── Step 113: 权限检查 ──────────────────────

  private async checkCanvasAccess(canvasId: number, userId: number): Promise<boolean> {
    const canvas = await this.canvasRepository.findById(canvasId);
    if (!canvas) return false;
    if (canvas.userId === userId) return true;

    const permission = await this.canvasRepository.findSharePermission(canvasId, userId);
    return canRead(permission);
  }

  // ────────────────────── 工具方法 ──────────────────────

  private send(ws: WebSocket, message: WsOutgoingMessage | WsErrorMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  /** Step 123: 发送业务错误帧（不关闭连接） */
  private sendError(ws: WebSocket, code: number, msg: string): void {
    const errorMsg: WsErrorMessage = { type: 'error', code, msg };
    this.send(ws, errorMsg);
  }

  /** Step 123: 发送错误帧后关闭连接（握手/限流/权限阶段使用） */
  private closeWithError(ws: WebSocket, bizCode: number, msg: string, closeCode: WsCloseCode): void {
    this.sendError(ws, bizCode, msg);
    ws.close(closeCode, msg);
  }
}
