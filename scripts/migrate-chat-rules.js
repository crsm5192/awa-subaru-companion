// 一次性迁移：把旧的 chat.persona（含「日语：」语音规则）拆成 persona + voiceRule
const fs = require('node:fs')
const path = require('node:path')

const f = path.join(process.env.APPDATA, 'awa-subaru-companion', 'config.json')
if (!fs.existsSync(f)) {
  console.log('config.json 不存在，跳过')
  process.exit(0)
}

const c = JSON.parse(fs.readFileSync(f, 'utf8'))
if (!c.chat) {
  console.log('无 chat 配置，跳过')
  process.exit(0)
}

if (typeof c.chat.voiceRule === 'string' && c.chat.voiceRule.trim()) {
  console.log('voiceRule 已存在，跳过')
  process.exit(0)
}

const p = c.chat.persona || ''
const idx = p.indexOf('3. 在回复的最后一行')
if (idx >= 0) {
  c.chat.persona = p.slice(0, idx).trim()
}
c.chat.voiceRule =
  '在回复的最后一行，单独写「日语：」开头，给出这段回复的日语口语版（用于语音合成）。日语要自然，不要敬语腔。'

fs.writeFileSync(f, JSON.stringify(c, null, 2), 'utf8')
console.log('done：persona 已拆分，voiceRule 已添加')
