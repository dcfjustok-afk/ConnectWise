# Step 014 后端错误码与异常流盘点

调研目标：识别错误码定义、异常抛出路径与统一处理流程。

## 一、定义位置

- 错误码枚举：`src/main/java/com/conwise/model/ResponseCode.java`
- 全局异常处理：`src/main/java/com/conwise/exception/GlobalExceptionHandler.java`

## 二、关键错误码示例

| 错误码 | 语义 |
|---|---|
| `1002` | 未授权/未登录 |
| `3006` | 画布不存在 |
| `5007` | WS 全局连接超限 |
| `5008` | WS 房间连接超限 |

## 三、异常流

1. Controller/Service 抛出业务异常或运行时异常。
2. GlobalExceptionHandler 捕获并映射为统一响应体。
3. 前端按 code + msg 做提示与跳转策略。

## 四、风险

- 迁移中需保持关键 code 语义稳定，避免前端分支误判。

## 五、已确认/待确认

已确认：
- 具备统一异常处理与集中错误码定义。

待确认：
- 各接口对异常码使用是否完全一致（需 Step 028 对照抓包）。
