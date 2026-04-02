# Step 022 前端状态管理盘点

调研目标：梳理状态管理方案、状态域与更新路径。

## 一、状态方案

- 全局状态：Redux Toolkit
- 局部/连接态：React Context（WebSocketContext）

## 二、核心状态域

| 状态域 | 文件 | 用途 |
|---|---|---|
| user | `src/store/slices/user.slice.js` | 用户信息与认证态 |
| canvas | `src/store/slices/canvas.slice.js` | 画布内容与当前画布上下文 |
| ui | `src/store/slices/ui.slice.js` | UI 反馈、加载态、弹窗等 |
| setting | `src/store/slices/setting.slice.js` | 配置偏好 |

## 三、更新路径

- 页面/组件 dispatch -> slice reducer -> store 更新
- 实时消息通过 `WebSocketProvider` 与 hook 间接驱动画布状态变更

## 四、证据文件路径

- `src/store/index.js`
- `src/store/slices/`
- `src/components/provider/WebSocketProvider.jsx`

## 五、已确认/待确认

已确认：
- Redux + Context 混合方案已落地。

待确认：
- 画布状态与 WS 消息并发更新的一致性边界需在联调阶段验证。
