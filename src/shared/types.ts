// 主进程 / 渲染进程共享的类型定义

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  /** 用于 TTS 的文本（通常是日语版）；为空则用 content */
  speakText?: string
}

export interface HermesConfig {
  /** hermes-agent 的 OpenAI 兼容 API 服务地址，例如 http://127.0.0.1:8000 */
  baseUrl: string
  apiKey: string
  model: string
}

export interface TtsServerConfig {
  /** 未来「常驻 TTS 服务」模式的地址（当前用 command 模式，可留空） */
  baseUrl: string
  voice: string
}

export interface TtsConfig {
  /** command = 调 subaru_voice.py（当前已打通）；server = 未来常驻 HTTP 服务 */
  mode: 'command' | 'server'
  /** CosyVoice 的 python.exe 绝对路径 */
  python: string
  /** subaru_voice.py 绝对路径（文件进/文件出，与 hermes 的 tts-block 同一条链路） */
  script: string
  /** 子进程工作目录 */
  cwd: string
  /** auto=按是否含假名自动判断，zh/jp 强制 */
  lang: 'auto' | 'zh' | 'jp'
  speed: number
  timeoutMs: number
  server: TtsServerConfig
}

export interface SiyuanConfig {
  baseUrl: string
  token: string
}

export interface PetConfig {
  /** Live2D 模型的 model3.json 路径；留空则用内置占位动画 */
  modelPath: string
  scale: number
  /** 点击穿透（穿透到桌面） */
  clickThrough: boolean
  /** 锁定：true 时进入调整模式（左键移窗 / 右键平移 / 滑条缩放） */
  locked: boolean
  /** 眼球追踪鼠标（眼睛跟随光标） */
  eyeTracking: boolean
  /** 眼球追踪幅度（乘数，1 = 默认） */
  eyeTrackingStrength: number
  /** 模型平移偏移（像素，右键拖动） */
  offsetX: number
  offsetY: number
  /** 窗口位置（左键拖动后记住；null = 未设置，用默认位置） */
  winX: number | null
  winY: number | null
}

export interface ChatConfig {
  /** 桌宠人设 / 对话规则（系统提示词主体） */
  persona: string
  /** 语音输出规则（告诉模型如何输出「日语：」行） */
  voiceRule: string
  /** 发送给 hermes 的历史消息条数上限 */
  historyLimit: number
}

export interface AppConfig {
  hermes: HermesConfig
  tts: TtsConfig
  siyuan: SiyuanConfig
  pet: PetConfig
  chat: ChatConfig
}

export interface TtsResult {
  mime: string
  base64: string
}

export interface TodoItem {
  id: string
  title: string
  done: boolean
  createdAt: number
}

export interface DiaryEntry {
  id: string
  /** YYYY-MM-DD */
  date: string
  title: string
  content: string
  updatedAt: number
}

export interface ModelInfo {
  /** 模型目录名（显示用） */
  name: string
  /** 相对 public 的 model3.json 路径（渲染层加载用） */
  model3Path: string
}

/** 深层 Partial：允许只传嵌套对象里的部分字段（用于配置部分更新） */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

export interface MusicInfo {
  /** 歌曲显示名（去掉扩展名） */
  name: string
  /** 艺术家（元数据，可选） */
  artist?: string
  /** 相对 public 的音乐文件路径（渲染层加载用） */
  path: string
}
