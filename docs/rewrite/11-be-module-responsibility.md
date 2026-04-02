# Step 011 后端模块职责盘点

调研目标：梳理旧后端模块分层职责与业务域映射。

## 一、分层职责

| 分层 | 目录/位置 | 职责 |
|---|---|---|
| Controller | `src/main/java/com/conwise/controller` | 处理 HTTP/WS 入口请求、参数接收与分发 |
| Service | `src/main/java/com/conwise/service` | 承载核心业务逻辑，协调多数据源 |
| Mapper | `src/main/java/com/conwise/mapper` | MyBatis 接口层，执行数据库读写 |
| Config | `src/main/java/com/conwise/config` | Redis Session、WebSocket、WebMvc、异步配置 |
| Model | `src/main/java/com/conwise/model` | 实体、DTO、响应封装、错误码等模型 |
| Handler | `src/main/java/com/conwise/handler` | 类型转换与处理器辅助逻辑 |
| Aspect | `src/main/java/com/conwise/aspect` | 请求日志与切面能力 |

## 二、业务域映射

| 业务域 | 关键类 | 说明 |
|---|---|---|
| User | `UserController` `UserService` `UserMapper` | 用户注册、登录、会话校验 |
| Canvas | `CanvasController` `CanvasService` `CanvasMapper` | 画布增删改查与内容存储 |
| Share | `ShareController` `CanvasShareService` `CanvasShareMapper` | 画布分享与权限管理 |
| AI | `AiController` `AiService` | AI 生成、关联、图结构输出 |
| Realtime | `CanvasWebSocketHandler` | 实时消息处理与同房间广播 |
| Infra | `MinioService` `AsyncConfig` | 文件存储与异步执行 |

## 三、关键关系

- `Controller -> Service -> Mapper` 为主调用链。
- `CanvasWebSocketHandler` 直接关联 `CanvasService` 处理实时更新。
- `RedisSessionConfig` 与 `AuthenticationInterceptor` 共同构成会话鉴权链路。

## 四、已确认/待确认

已确认：
- 分层结构完整，业务域清晰。

待确认：
- 各域内是否存在跨层调用（需在 Step 018 深入 SQL/事务时复核）。
