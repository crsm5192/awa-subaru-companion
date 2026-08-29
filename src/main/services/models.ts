import { app } from 'electron'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import type { ModelInfo } from '../../shared/types'
import { externalModelsDir } from '../paths'

function modelsDir(): string {
  // 打包后：exe 旁边的 models 目录（便携）；开发：src/renderer/public/models
  return app.isPackaged
    ? externalModelsDir()
    : join(app.getAppPath(), 'src', 'renderer', 'public', 'models')
}

/** 扫描模型目录，返回每个子目录下的 model3.json（渲染层用相对路径加载） */
export function listModels(): ModelInfo[] {
  const dir = modelsDir()
  const result: ModelInfo[] = []
  if (!existsSync(dir)) return result

  for (const entry of readdirSync(dir)) {
    const sub = join(dir, entry)
    try {
      if (!statSync(sub).isDirectory()) continue
      const files = readdirSync(sub).filter((f) => f.endsWith('.model3.json'))
      for (const f of files) {
        result.push({ name: entry, model3Path: `models/${entry}/${f}` })
      }
    } catch {
      continue
    }
  }
  return result.sort((a, b) => a.name.localeCompare(b.name))
}