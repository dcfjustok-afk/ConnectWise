# Step 035 技术栈问答 Q6（部署/容器）

问题：部署与容器化路径如何确定？

## 一、候选方案

- A：后端/前端分别 Dockerfile + compose 本地编排
- B：仅后端容器化，前端本地运行
- C：直接上 K8s（跳过 compose）

## 二、决策

选择 A：双 Dockerfile + compose。

## 三、理由

1. 与 Phase E 的 167-170 步骤一致，路径清晰。
2. 便于联调时一键起依赖（db/redis/minio/backend/frontend）。
3. 对开发与验证环境一致性帮助最大。

## 四、风险与缓解

- 风险：容器网络与本地网络差异导致 cookie/WS 问题。
- 缓解：提前固定域名、端口、反向代理和 CORS 策略，并纳入联调清单。

## 五、失败最小修复

- 若 compose 阻塞进度，允许先拆分最小联调栈（backend+db+redis）再渐进补齐。
