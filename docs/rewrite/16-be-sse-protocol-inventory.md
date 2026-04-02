# Step 016 后端 SSE 协议盘点

调研目标：梳理旧后端 SSE endpoint/event/data/close/error 行为。

## 一、SSE 入口

- `GET /ai/generate`
- `GET /ai/associate`
- `GET /ai/generate-graph`

证据文件：`src/main/java/com/conwise/controller/AiController.java`

## 二、流输出类型

- `produces = MediaType.TEXT_EVENT_STREAM_VALUE`
- 返回 `Flux<ServerSentEvent<String>>`

## 三、协议行为（as-is）

- 按流式 chunk 连续推送数据。
- 结束时由流完成信号触发 close 语义。
- 异常时由流错误路径返回 error 语义。

## 四、已确认/待确认

已确认：
- SSE 能力在 AI 控制器中存在且为标准 `text/event-stream`。

待确认：
- 事件名称是否固定为 `push/close/error`（需读取具体 ServerSentEvent 构造处细节）。
