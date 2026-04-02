# Step 010 后端目录与入口盘点（As-Is）

盘点目标：`D:\project\connection-wise_BE`

## 1. 目录结构（2-3 层）

```text
D:\project\connection-wise_BE
├── .github/
├── src/
│   ├── main/
│   │   ├── java/com/conwise/
│   │   │   ├── aspect/
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   ├── mapper/
│   │   │   ├── model/
│   │   │   ├── service/
│   │   │   └── handler/
│   │   └── resources/
│   │       ├── mapper/
│   │       └── application*.yaml
│   └── test/
├── pom.xml
└── Dockerfile
```

## 2. 入口点

- Spring Boot 主入口：`src/main/java/com/conwise/ConnectWiseApplication.java`
- WebSocket 配置入口：`src/main/java/com/conwise/config/WebSocketConfig.java`
- WebSocket 处理入口：`src/main/java/com/conwise/controller/CanvasWebSocketHandler.java`

## 3. 模块职责映射

| 模块 | 关键目录/类 | 职责 |
|---|---|---|
| User | `controller/UserController` `service/UserService` `mapper/UserMapper` | 用户、登录、会话相关 |
| Canvas | `controller/CanvasController` `service/CanvasService` `mapper/CanvasMapper` | 画布 CRUD 与画布数据管理 |
| Realtime | `controller/CanvasWebSocketHandler` | 实时协作消息处理与广播 |
| AI | `controller/AiController` `service/AiService` | AI 相关接口能力 |
| Auth/Session | `config/RedisSessionConfig` `config/WebSocketHandshakeInterceptor` | Redis Session、WS 握手校验 |
| Infra/Tooling | `service/MinioService` `config/AsyncConfig` | 对象存储与异步任务 |

## 4. 关键配置文件

- `src/main/resources/application.yaml`
- `src/main/resources/application-dev-template.yaml`
- `src/main/resources/application-prod.yaml`
- `src/main/resources/postgresql.sql`
- `src/main/java/com/conwise/config/RedisSessionConfig.java`
- `src/main/java/com/conwise/config/WebMvcConfig.java`
- `src/main/java/com/conwise/config/WebSocketConfig.java`

## 5. 已确认与待确认

已确认：
- 旧后端为 Java Spring 体系，含 MyBatis、PostgreSQL、Redis Session、WebSocket、MinIO。
- API 基础前缀存在 `/api` 语义，且 WS 路径存在 `/ws/canvas/{canvasId}`。
- 模块分层清晰，具备 user/canvas/ai/realtime 能力。

待确认：
- AI Provider 的具体接入方式与模型选择。
- 认证鉴权完整策略（除 Session 外的安全组件与规则）。
- WS 握手参数与前端传递细节（cookie/token/headers）。

## 6. 对 Step 011 输入

- 下一步将深入 `controller/service/mapper/config` 四类，形成逐模块职责清单与接口对照表。
