import { app } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

/** 数据目录：userData 下按名字存一个 JSON 文件（个人项目够用，无需 SQLite） */
export function dataFile(name: string): string {
  return join(app.getPath('userData'), `${name}.json`)
}

export function readJson<T>(name: string, fallback: T): T {
  const f = dataFile(name)
  try {
    if (existsSync(f)) return JSON.parse(readFileSync(f, 'utf-8')) as T
  } catch (e) {
    console.error(`[store] 读取 ${name} 失败：`, e)
  }
  return fallback
}

export function writeJson(name: string, data: unknown): void {
  const f = dataFile(name)
  mkdirSync(dirname(f), { recursive: true })
  writeFileSync(f, JSON.stringify(data, null, 2), 'utf-8')
}
