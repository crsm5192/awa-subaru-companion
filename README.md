# 安和昴陪伴 · Awa Subaru Companion

安和昴（Awa Subaru，出自《GIRLS BAND CRY》）主题的 Windows 桌面陪伴助手。

> **本项目全程由 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 构建。**

## 功能

- 🐱 **Live2D 桌宠**：透明置顶窗 + 点击穿透 + 锁定模式，支持拖拽移动 / 右键平移 / 缩放、眼球追踪、随机气泡、口型联动。
- 💬 **对话**：接入 hermes-agent 的 OpenAI 兼容 API（流式 SSE），对话规则（人设）与语音规则（「日语：」输出）分离可配。
- 🎙️ **语音**：CosyVoice 安和昴音色 TTS（server 常驻服务 / command CLI 两种模式）。
- 🎵 **音乐播放器**：顺序/乱序、进度条、读取音频元数据（标题/艺术家）、列表滚动、关面板继续播、记住上次播放。
- 🍅 **番茄钟 / 待办 / 日记**：本地持久化。
- 📖 **思源笔记**：内核 API 连接测试。
- 💾 **存储**：SQLite（sql.js WASM，聊天/待办/日记）。
- 📦 **双版本打包**：便携版（免安装）+ NSIS 安装版（启动快）；模型 / 音乐 / 配置 / 数据都在 exe 外部。
- 🩺 **诊断日志**：启动时在数据目录写 `diagnostic.log`，排查模型/音乐路径、WebGL 等问题。

## 技术栈

| 层 | 选型 |
|---|---|
| 桌面外壳 | Electron 33 + electron-vite 2 |
| 渲染 | React 18 + TypeScript + Pixi.js 8 + easy-live2d |
| 状态 | zustand |
| 对话 | hermes-agent OpenAI 兼容 API（流式 SSE） |
| 语音 | CosyVoice（安和昴音色） |
| 存储 | sql.js（WASM SQLite） |
| 元数据 | music-metadata |

## 快速开始

```bash
npm install
npm run dev
```

> Electron 二进制下载慢（国内）：
> ```bash
> set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ && npm install
> ```

## 配置

首次运行后生成 `config.json`（位置见下文「数据存放位置」），也可在设置面板（⚙️）里改。关键项：

- `hermes`：`baseUrl` / `apiKey` / `model`（OpenAI 兼容 API）。
- `tts`：`mode`（`server` 常驻服务 / `command` CLI）、`server.baseUrl`、`speed`。
- `siyuan`：`baseUrl` / `token`（思源「设置 → 关于 → API token」）。
- `pet`：`modelPath`、`scale`、`eyeTracking`、锁定等。
- `chat.persona`：对话规则（人设 / 系统提示词）。
- `chat.voiceRule`：语音规则（如何输出「日语：」行）。

## 数据存放位置

| 版本 | 位置 |
|---|---|
| **开发** | 模型/音乐在 `src/renderer/public/{models,music}/`；配置/数据在 `%APPDATA%\awa-subaru-companion\` |
| **便携版 exe** | 全部在 **exe 旁边**（`models\` `music\` `config.json` `data.db`），随 exe 携带 |
| **安装版（NSIS）** | 全部在 `%APPDATA%\awa-subaru-companion\`（`config.json` `data.db` `models\` `music\`），**覆盖安装/卸载不会被清空** |

> 记不清路径时，看数据目录里的 `diagnostic.log`，会写明 `modelsDir` / `musicDir` 的实际位置。

## 模型 / 音乐（外部，不进仓库）

模型放在 `src/renderer/public/models/`（开发）或上面的数据目录（打包），
音乐放在 `src/renderer/public/music/`（开发）或数据目录（打包）。
两者因体积和版权原因均不提交，需自行准备。

> 提示：若某个模型切不过去、报 404，多半是它的 `model3.json` 里相对路径写错（例如表达式写成了 `../xxx.exp3.json` 而实际在 `expressions/` 子目录）。

## 打包（Windows）

```bash
npm run build:win:portable   # 便携版（免安装）
npm run build:win:nsis       # NSIS 安装版（启动快）
npm run build:win            # 两者都出
```

产物在 `release/`：`AwaSubaruCompanion 0.1.0.exe`（便携）+ `AwaSubaruCompanion Setup 0.1.0.exe`（安装）+ `models\` + `music\`。

打包注意事项：
- 若 electron 下载超时，用 `ELECTRON_MIRROR` 镜像（见「快速开始」）；
- 若 `winCodeSign` 解压报「符号链接」错误，先开启 Windows「开发人员模式」（设置 → 隐私和安全性 → 开发者选项 → 开发人员模式）。

## 排查

- **模型列表为空**：看 `diagnostic.log` 的 `modelsDir 存在: ...`，确认模型放对了位置。
- **模型加载但画面不显示**：多半是显卡驱动/WebGL 问题（Live2D 靠 WebGL 渲染）。打开控制台（`Ctrl+Shift+I`）看 `[webgl] renderer/vendor/version`，更新显卡驱动或换真机。
- **换电脑切不了模型**：确认把 `models\`（和 `music\`）拷到了正确的数据目录。

## 许可

MIT
