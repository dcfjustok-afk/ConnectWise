# Step 015 后端 WS 协议盘点

调研目标：梳理旧后端 WebSocket 入口、握手、消息类型与广播规则。

## 一、入口与配置

- WS 配置：`src/main/java/com/conwise/config/WebSocketConfig.java`
- WS 处理器：`src/main/java/com/conwise/controller/CanvasWebSocketHandler.java`
- 握手拦截：`src/main/java/com/conwise/interceptor/WebSocketHandshakeInterceptor.java`

## 二、握手与上下文

- 握手阶段从 URL 参数提取 `canvasId`。
- 会话属性写入后供 Handler 消息处理使用。

## 三、消息类型（已识别）

- `addNode`
- `updateNode`
- `deleteNode`
- `addEdge`
- `ping`
- 冲突回包：`flushNode`（版本冲突场景）

## 四、广播规则

- Handler 维护会话集合与房间映射。
- `includeSender` 控制是否回发给发送者。

## 五、异常与限流

- 全局/房间连接上限由错误码 `5007/5008` 体现。

## 六、已确认/待确认

已确认：
- 具备握手拦截、消息分发、广播与冲突回包机制。

待确认：
- `updateEdge/deleteEdge` 等类型是否在旧代码中全部实现（需 Step 024 前后端联调时复核）。
