import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { WebSocketServer } from 'ws';
import { IncomingMessage, ServerResponse } from 'http';
import { RequestHandler } from 'express';
import { CanvasWsGateway } from './canvas-ws.gateway';
import { RoomManager } from './room-manager';
import { CanvasModule } from '../canvas/canvas.module';
import { SESSION_MIDDLEWARE } from '../session/session.module';

@Module({
  imports: [CanvasModule],
  providers: [CanvasWsGateway, RoomManager],
  exports: [CanvasWsGateway, RoomManager],
})
export class RealtimeModule implements OnModuleInit {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly gateway: CanvasWsGateway,
    @Inject(SESSION_MIDDLEWARE) private readonly sessionMiddleware: RequestHandler,
  ) {}

  onModuleInit(): void {
    const server = this.httpAdapterHost.httpAdapter.getHttpServer();

    const wss = new WebSocketServer({
      noServer: true,
    });

    // 利用 HTTP server 的 upgrade 事件挂载 WS
    server.on('upgrade', (req: IncomingMessage, socket: any, head: Buffer) => {
      const url = req.url ?? '';

      // 只处理 /ws 路径（兼容旧前端 WS 路径）
      if (!url.startsWith('/ws')) {
        socket.destroy();
        return;
      }

      // 手动调用 session 中间件解析 WS upgrade 请求上的 session
      const dummyRes = new ServerResponse(req);
      this.sessionMiddleware(req as any, dummyRes as any, () => {
        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit('connection', ws, req);
        });
      });
    });

    this.gateway.init(wss);
  }
}
