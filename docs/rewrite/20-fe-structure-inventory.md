# Step 020 前端目录结构盘点

调研目标：梳理旧前端目录结构与关键职责。

调研路径：`D:\project\connection-wise-FE`

## 一、目录结构（2-3 层）

```text
src/
├── api/                # API 封装与 axios 客户端
├── components/
│   ├── common/         # 通用组件
│   ├── hoc/            # 高阶组件（含路由守卫/AI 流式入口）
│   ├── layout/         # 布局组件
│   ├── pages/          # 页面组件
│   └── provider/       # Context Provider（如 WebSocketProvider）
├── hooks/              # 自定义 Hooks
├── store/              # Redux Toolkit 状态管理
├── utils/              # 工具函数
└── webSocket/          # WS 连接与消息代理
```

## 二、关键目录职责

| 目录 | 职责 |
|---|---|
| `src/api` | 统一封装后端接口调用与客户端配置 |
| `src/components/pages` | 页面级 UI 与页面业务组合 |
| `src/components/provider` | 全局上下文注入（WS 实例等） |
| `src/hooks` | 将页面逻辑抽离为可复用 hooks |
| `src/store` | 全局状态（user/canvas/ui/setting） |
| `src/webSocket` | 连接、重连、消息分发 |

## 三、证据文件路径

- `src/`
- `src/components/provider/WebSocketProvider.jsx`
- `src/store/index.js`

## 四、已确认/待确认

已确认：
- 前端具备页面、状态、网络、实时能力分层结构。

待确认：
- 各目录之间是否存在循环依赖（需在实现前通过静态分析工具确认）。
