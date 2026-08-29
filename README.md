# 安和昴陪伴 · Awa Subaru Companion

安和昴（Awa Subaru，出自《GIRLS BAND CRY》）主题的 Windows 桌面陪伴助手。

> **本项目全程由 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 构建。**

## 功能

- 🐱 **Live2D 桌宠**：透明置顶窗 + 点击穿透 + 锁定模式，支持拖拽移动 / 右键平移 / 缩放、眼球追踪、随机气泡。
- 💬 **对话**：接入 hermes-agent 的 OpenAI 兼容 API（流式 SSE），对话规则（人设）与语音规则（「日语：」输出）分离可配。
- 🎙️ **语音**：CosyVoice 安和昴音色 TTS（server 常驻服务 / command CLI 两种模式），口型联动。
- 🎵 **音乐播放器**：顺序/乱序、进度条、读取音频元数据（标题/艺术家）、列表滚动显示、关面板继续播。
- 🍅 **番茄钟 / 待办 / 日记**：本地持久化。
- 📖 **思源笔记**：内核 API 连接测试。
- 💾 **存储**：SQLite（sql.js WASM，聊天/待办/日记）。
- 📦 **便携打包**：模型 / 音乐 / 配置 / 数据都在 exe 外部，绿色免安装。

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

首次运行后在 exe/`userData` 旁生成 `config.json`，也可在设置面板（⚙️）里改。关键项：

- `hermes`：`baseUrl` / `apiKey` / `model`（OpenAI 兼容 API）。
- `tts`：`mode`（`server` 常驻服务 / `command` CLI）、`server.baseUrl`、`speed`。
- `siyuan`：`baseUrl` / `token`（思源「设置 → 关于 → API token」）。
- `pet`：`modelPath`、`scale`、`eyeTracking`、锁定等。
- `chat.persona`：对话规则（人设 / 系统提示词）。
- `chat.voiceRule`：语音规则（如何输出「日语：」行）。

## 模型 / 音乐（外部，不进仓库）

模型放在 `src/renderer/public/models/`（开发）或 exe 旁 `models/`（打包），
音乐放在 `src/renderer/public/music/`（开发）或 exe 旁 `music/`（打包）。
两者因体积和版权原因均不提交，需自行准备。

## 打包（Windows 便携版）

```bash
npm run build:win:portable
```

产物在 `release/`：`AwaSubaruCompanion 0.1.0.exe` + `models/` + `music/`。
打包若遇 `winCodeSign` 解压符号链接报错，请先开启 Windows「开发人员模式」。

## 许可

MIT
