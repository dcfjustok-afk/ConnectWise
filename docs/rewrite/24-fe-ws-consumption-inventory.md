# Step 024 前端 WS 消费点盘点

调研目标：梳理 WS 初始化、地址来源、消息分发与消费点。

## 一、初始化与地址

- 初始化入口：`src/components/provider/WebSocketProvider.jsx`
- 地址来源：`process.env.WS_BASE_URL` + 画布路径参数

## 二、消息分发

- 核心代理：`src/webSocket/WebSocketProxy.js`
- 处理机制：`onmessage` 解析后交给注册的 handlers 分发

## 三、已识别消费类型

- `addNode` `deleteNode` `updateNode` `flushNode`
- `addEdge` `deleteEdge` `updateEdge` `flushEdge`
- `ping/pong`（心跳链路）

## 四、证据文件路径

- `src/components/provider/WebSocketProvider.jsx`
- `src/webSocket/WebSocketProxy.js`
- `src/hooks/useEnhancedReactFlowForRemote.js`

## 五、已确认/待确认

已确认：
- WS 连接与消息消费链路存在且可追踪。

待确认：
- 重连后消息补偿策略在异常网络下的完整性需实测。
