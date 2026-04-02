# Step 012 后端配置与环境变量盘点

调研目标：梳理旧后端配置来源、关键环境变量及敏感项。

## 一、配置文件

- `src/main/resources/application.yaml`
- `src/main/resources/application-dev-template.yaml`
- `src/main/resources/application-prod.yaml`

## 二、Java 配置类

- `src/main/java/com/conwise/config/RedisSessionConfig.java`
- `src/main/java/com/conwise/config/WebMvcConfig.java`
- `src/main/java/com/conwise/config/WebSocketConfig.java`
- `src/main/java/com/conwise/config/AsyncConfig.java`

## 三、关键变量盘点

| 变量 | 默认/示例 | 敏感性 | 用途 |
|---|---|---|---|
| `spring.datasource.url` | `jdbc:postgresql://localhost:5432/conwise_db` | 否 | 数据库连接 |
| `spring.datasource.username` | `postgres` | 否 | 数据库用户名 |
| `spring.datasource.password` | 模板占位 | 是 | 数据库密码 |
| `spring.ai.openai.api-key` | 模板占位 | 是 | AI Provider 密钥 |
| `minio.endpoint` | 环境定义 | 否 | MinIO 地址 |
| `minio.credentials.access-key` | 模板占位 | 是 | MinIO 访问密钥 |
| `minio.credentials.password` | 模板占位 | 是 | MinIO 密码 |
| `server.servlet.context-path` | `/api` | 否 | API 前缀 |

## 四、风险提示

- 开发模板中敏感项需保证只占位、不落真实值。
- 运行时 profile 差异会影响联调行为，需在 Step 028 对齐前后端环境。

## 五、已确认/待确认

已确认：
- 配置集中在 `application*.yaml` + `config` 配置类。

待确认：
- 部分连接上限、超时等参数是否来自硬编码（需实现阶段前复查）。
