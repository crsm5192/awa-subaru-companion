# resources/ —— 运行时资源

放这里的内容会被 electron-builder 打包进产物（`asarUnpack` 保证模型文件可被文件系统直接读取）。

| 路径 | 用途 | 说明 |
|---|---|---|
| `tray.png` | 托盘图标 | 16x16 或 32x32，透明背景 png；未放置则自动跳过托盘 |
| `models/*.model3.json` + `.moc3` + 贴图 | Live2D 模型 | 设置里 `pet.modelPath` 指向 model3.json |

美术素材流水线建议：
1. 用 Qwen-Image-Layered 生成「正面、无透视、中性表情、分部件」的分层 PSD；
2. 部件至少含：头发前/后层、眼睛（睁+闭）、嘴巴、眉毛、头、身体；
3. 进 Live2D Cubism Editor 做精简 rig（ParamEyeLOpen、ParamMouthOpenY、ParamBreath、ParamAngleX/Y）后导出。
