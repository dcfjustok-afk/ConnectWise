# 重构目录结构草案

```text
connection-wise-rewrite/
├─ backend-nest/
│  ├─ src/
│  │  ├─ modules/
│  │  │  ├─ auth/
│  │  │  ├─ user/
│  │  │  ├─ canvas/
│  │  │  ├─ share/
│  │  │  ├─ realtime/
│  │  │  ├─ ai/
│  │  │  └─ storage/
│  │  ├─ common/
│  │  │  ├─ guards/
│  │  │  ├─ interceptors/
│  │  │  ├─ filters/
│  │  │  ├─ decorators/
│  │  │  └─ errors/
│  │  ├─ config/
│  │  └─ main.ts
│  ├─ prisma/
│  │  ├─ schema.prisma
│  │  └─ migrations/
│  ├─ test/
│  ├─ scripts/
│  ├─ .env.example
│  ├─ Dockerfile
│  └─ package.json
├─ frontend-web/
│  ├─ src/
│  │  ├─ api/
│  │  ├─ components/
│  │  ├─ hooks/
│  │  ├─ store/
│  │  ├─ utils/
│  │  ├─ webSocket/
│  │  └─ App.jsx
│  ├─ public/
│  ├─ .env.example
│  ├─ Dockerfile
│  └─ package.json
├─ infra/
│  ├─ compose.yml
│  ├─ nginx/
│  │  ├─ nginx-dev.conf
│  │  └─ nginx-prod.conf
│  └─ scripts/
│     ├─ up.ps1
│     ├─ down.ps1
│     └─ logs.ps1
└─ docs/
   └─ rewrite/
      ├─ 00-folder-structure.md
      ├─ 01-api-compat-rules.md
      ├─ 02-ws-contract.md
      ├─ 03-sse-contract.md
      ├─ 04-db-mapping.md
      └─ 05-error-code-map.md
```

- `backend-nest/`: 新后端主工程，负责 REST、WS、SSE、鉴权、存储与 AI。
- `frontend-web/`: 前端工程，优先保持现有功能与协议兼容。
- `infra/`: 部署与联调基础设施，统一容器编排、反向代理与运维脚本。
- `docs/rewrite/`: 重构规范与契约文档，作为联调与验收依据。
