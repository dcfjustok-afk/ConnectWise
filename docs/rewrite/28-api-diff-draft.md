# Step 028 前后端接口差异初稿

目标：基于 Step 013 与 Step 023，输出 as-is 前后端接口差异初稿，作为 Step 029 兼容红线输入。

## 一、对照范围

- 后端基线：`docs/rewrite/13-be-api-inventory.md`
- 前端基线：`docs/rewrite/23-fe-api-call-inventory.md`

## 二、对照结论

| 类别 | 项 | 结论 | 影响 |
|---|---|---|---|
| 路径前缀 | `/api` context-path | 后端存在 `/api` 前缀语义，前端服务层通常以相对路径书写 | 部署网关或 baseURL 配置不当会导致 404 |
| 认证接口 | `/user/login` `/user/register` `/user/check-auth` | 前后端一致 | 低风险 |
| 画布详情 | `/canvas/{id}` vs `/canvas/:id` | 语义一致（路径参数写法差异） | 低风险 |
| 画布列表 | 前端使用 `/canvas/user/:userId` 风格 | 后端清单初稿未明确列出该接口 | 中风险，需补证确认 |
| 上传接口 | `/canvas/uploadThumbnail` | 前后端一致（multipart） | 中风险，需补大小/类型限制契约 |
| 分享接口 | `/share/*` | 前端为通配调用，后端已识别 `/share` POST 等核心接口 | 中风险，需补 GET/PUT/DELETE 逐条映射 |
| AI SSE 接口 | `/ai/generate` `/ai/associate` `/ai/generate-graph` | 前后端均存在 | 中风险，需锁定事件名与结束语义 |
| 健康检查 | health 相关接口 | 前后端盘点均未形成稳定入口 | 中风险，Phase E 需补齐 `/health` |

## 三、当前差异清单（Draft）

1. 画布列表接口在后端清单中缺少明确证据，需要回查 controller。
2. share 域前端按通配使用，后端需提供完整方法矩阵（GET/POST/PUT/DELETE）。
3. AI SSE 需统一事件名（`push/close/error`）与错误负载格式。
4. 上传接口需明确前后端共同约束（大小、类型、失败码）。
5. `/api` 前缀的责任边界（应用 context-path vs 网关重写）需固定。

## 四、给 Step 029 的输入

- 将上表中中风险项升级为“兼容红线候选”。
- 所有前后端不一致项必须在 Phase B/C/D 编码前完成契约冻结。
