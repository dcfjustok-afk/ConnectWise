# AI SSE 协议契约

## Endpoint 列表

- `GET /api/ai/generate?prompt=...&direction=...`
- `GET /api/ai/associate?prompt=...`
- `GET /api/ai/generate-graph?prompt=...`

## 事件名称

- `push`：流式数据分片
- `close`：正常结束
- `error`：异常结束

## 数据结构

### push

```text
event: push
data: {"content":"...chunk..."}
```

约束：
- `content` 为文本分片，按到达顺序拼接。
- 单次 `data` 可为空字符串，但必须是合法 JSON。

### close

```text
event: close
data: {"reason":"completed"}
```

约束：
- 每次正常会话只发送一次 `close`。
- 前端收到后主动关闭 EventSource。

### error

```text
event: error
data: {"code":5001,"msg":"ai provider unavailable"}
```

约束：
- 错误必须可诊断，至少包含 `code` 与 `msg`。
- 发送 `error` 后应结束当前流。

## 连接关闭与异常处理

- 客户端主动关闭：服务端应立刻停止下游 AI 调用与流输出。
- 服务端正常结束：先发 `close`，再结束连接。
- 服务端异常结束：发 `error` 后结束连接。
- 超时策略：建议设置服务端超时并转为 `error` 事件。

## 兼容性要求

- 保持标准 `text/event-stream`。
- 保持前端 `EventSource` 可直接消费，无需改协议解析层。
- 事件名必须与本契约一致，不得临时改名。
