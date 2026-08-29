import { app } from 'electron'
import { join } from 'node:path'

/**
 * 应用数据根目录。
 * - 便携版（PORTABLE_EXECUTABLE_DIR 已设）：数据放 exe 旁边，随 exe 携带；
 * - 安装版（NSIS）：数据放 userData（%APPDATA%），覆盖安装/卸载不会被清空。
 */
export function appRootDir(): string {
  return process.env.PORTABLE_EXECUTABLE_DIR || app.getPath('userData')
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