import { dirname, join } from 'node:path'

/**
 * 便携应用根目录：portable 打包后 process.execPath 指向临时解压目录，
 * 需要靠 electron-builder 注入的 PORTABLE_EXECUTABLE_DIR 拿到用户放置 exe 的真实目录。
 */
export function appRootDir(): string {
  return process.env.PORTABLE_EXECUTABLE_DIR || dirname(process.execPath)
}

/** exe 旁边的 models 目录（便携外部模型） */
export function externalModelsDir(): string {
  return join(appRootDir(), 'models')
}

/** exe 旁边的 config.json（便携外部配置） */
export function externalConfigFile(): string {
  return join(appRootDir(), 'config.json')
}

/** exe 旁边的 music 目录（便携外部音乐） */
export function externalMusicDir(): string {
  return join(appRootDir(), 'music')
}