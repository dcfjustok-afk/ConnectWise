import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';

export interface RoomClient {
  ws: WebSocket;
  userId: number;
  username: string;
}

/**
 * WS 房间管理器 — 按 canvasId 管理客户端连接
 */
@Injectable()
export class RoomManager {
  /** canvasId → Set<RoomClient> */
  private readonly rooms = new Map<number, Set<RoomClient>>();

  join(canvasId: number, client: RoomClient): void {
    if (!this.rooms.has(canvasId)) {
      this.rooms.set(canvasId, new Set());
    }
    this.rooms.get(canvasId)!.add(client);
  }

  leave(canvasId: number, client: RoomClient): void {
    const room = this.rooms.get(canvasId);
    if (!room) return;
    room.delete(client);
    if (room.size === 0) {
      this.rooms.delete(canvasId);
    }
  }

  leaveAll(client: RoomClient): void {
    for (const [canvasId, room] of this.rooms) {
      room.delete(client);
      if (room.size === 0) {
        this.rooms.delete(canvasId);
      }
    }
  }

  getClients(canvasId: number): Set<RoomClient> {
    return this.rooms.get(canvasId) ?? new Set();
  }

  getRoomSize(canvasId: number): number {
    return this.rooms.get(canvasId)?.size ?? 0;
  }

  getTotalConnections(): number {
    let total = 0;
    for (const room of this.rooms.values()) {
      total += room.size;
    }
    return total;
  }

  /**
   * 广播消息到房间
   * @param canvasId 画布 ID
   * @param message 序列化后的 JSON 字符串
   * @param excludeClient 排除的客户端（发送者自身）
   */
  broadcast(canvasId: number, message: string, excludeClient?: RoomClient): void {
    const room = this.rooms.get(canvasId);
    if (!room) return;

    for (const client of room) {
      if (client === excludeClient) continue;
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    }
  }

  /**
   * 发送消息给所有人（含发送者）
   */
  broadcastAll(canvasId: number, message: string): void {
    this.broadcast(canvasId, message, undefined);
  }
}
