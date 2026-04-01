# WebSocket 协议契约

## 连接信息

- 路径：`/api/ws/canvas/:canvasId`
- 鉴权：基于已有 session cookie
- 上下文：服务端在连接上下文绑定 `userId` 与 `canvasId`

## 消息总结构

```json
{
  "type": "updateNode",
  "operation": {
    "id": "node_123",
    "path": ["data", "text"],
    "value": "\"new content\"",
    "version": 2,
    "includeSender": false
  }
}
```

- `type`：消息类型
- `operation`：具体操作体

## type 列表

- `ping`
- `pong`
- `addNode`
- `deleteNode`
- `updateNode`
- `addEdge`
- `deleteEdge`
- `updateEdge`
- `flushNode`
- `flushEdge`

## operation 字段定义

- `id`：目标节点或边 ID
- `path`：更新路径数组，仅 `updateNode/updateEdge` 必填
- `value`：更新值，字符串化 JSON，按旧前端习惯传递
- `version`：客户端提交版本号，用于冲突检测
- `includeSender`：广播是否包含发送方（可选，默认 `false`）

## 示例

### addNode

```json
{
  "type": "addNode",
  "operation": {
    "id": "n_1001",
    "value": "{\"id\":\"n_1001\",\"type\":\"textNode\",\"position\":{\"x\":100,\"y\":200},\"data\":{\"text\":\"hello\"},\"version\":1}"
  }
}
```

### updateNode

```json
{
  "type": "updateNode",
  "operation": {
    "id": "n_1001",
    "path": ["data", "text"],
    "value": "\"hello world\"",
    "version": 1
  }
}
```

### flushNode（冲突回包）

```json
{
  "type": "flushNode",
  "operation": {
    "id": "n_1001",
    "value": "{\"id\":\"n_1001\",\"data\":{\"text\":\"server truth\"},\"version\":3}"
  }
}
```

## 错误场景与回包规范

- 未认证：连接阶段拒绝，返回可诊断错误码并关闭连接。
- 无权限访问画布：连接阶段拒绝并关闭连接。
- 消息体不合法：返回错误事件（或错误消息）但不影响其他连接。
- 版本冲突：服务端返回 `flushNode` 或 `flushEdge`，携带权威数据。
- 房间超限：连接阶段拒绝，返回容量相关错误码。

## 联调约束

- 前后端必须严格使用 `type + operation` 结构。
- `value` 在 patch 场景保持字符串化 JSON，避免解析歧义。
- 冲突处理必须走 `flushNode/flushEdge`，不允许静默覆盖。
