# Step 025 前端 SSE 消费点盘点

调研目标：梳理 EventSource 初始化与事件消费行为。

## 一、SSE 使用结论

已发现前端存在原生 EventSource 使用。

## 二、初始化位置

- `src/components/hoc/withToolTip.jsx`

## 三、事件消费行为

- 监听事件：`push`
- 监听事件：`close`（收到后主动关闭 EventSource）
- 错误处理：`onerror` 中记录错误并关闭连接

## 四、调用模式

- 多处 `new EventSource(SSESource)` 创建流式连接
- 结合 AI 相关提示词/图生成交互逻辑做增量显示

## 五、证据文件路径

- `src/components/hoc/withToolTip.jsx`（多处 EventSource 创建与监听）

## 六、已确认/待确认

已确认：
- SSE 在前端已被消费，且具备 `push/close/error` 处理。

待确认：
- 各 SSE 入口是否与后端 `/ai/generate` `/ai/associate` `/ai/generate-graph` 全量一一对应。
