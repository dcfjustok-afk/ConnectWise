# Step 027 前端上传与文件流程盘点

调研目标：梳理上传入口、上传接口与文件处理流程。

## 一、上传入口

- 画布缩略图上传（与编辑页/截图逻辑关联）。

## 二、上传调用链

- 服务函数：`canvas.service.js` 中 `uploadThumbnail`
- 请求方式：`POST /canvas/uploadThumbnail`
- 载体：`FormData` + `multipart/form-data`

## 三、流程特征

- 文件由前端生成或选择后封装为 FormData。
- 与画布 ID 等业务字段一起提交后端。

## 四、证据文件路径

- `src/api/canvas.service.js`
- `src/components/pages/NoteEditor` 相关上传触发逻辑（需结合页面代码进一步核对）

## 五、已确认/待确认

已确认：
- 上传接口与 multipart 传输模式存在。

待确认：
- 文件大小/类型前端校验与节流策略是否完善（需实现联调时补测）。
