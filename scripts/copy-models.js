// 打包后把模型/音乐目录复制到 release/（与 exe 同级，便携外部资源）
const fs = require('node:fs')
const path = require('node:path')

function copyDir(name) {
  const src = path.join(__dirname, '..', 'src', 'renderer', 'public', name)
  const dst = path.join(__dirname, '..', 'release', name)
  if (!fs.existsSync(src)) {
    console.log(`[copy-assets] 跳过（无 ${name} 目录）：`, src)
    return
  }
  fs.rmSync(dst, { recursive: true, force: true })
  fs.cpSync(src, dst, { recursive: true })
  console.log(`[copy-assets] ${name} 已复制到 →`, dst)
}

copyDir('models')
copyDir('music')
