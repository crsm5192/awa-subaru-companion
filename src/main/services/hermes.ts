import type { ChatMessage, HermesConfig } from '../../shared/types'

/**
 * 调用 hermes-agent 的 OpenAI 兼容接口，流式返回。
 * 参考：https://hermes-agent.nousresearch.com/docs/user-guide/features/api-server
 *
 * 假设 baseUrl 形如 http://127.0.0.1:8000，会补成 /v1/chat/completions；
 * 若 baseUrl 已以 /v1 结尾，则直接接 /chat/completions。
 */
export async function streamChat(
  cfg: HermesConfig,
  messages: ChatMessage[],
  onChunk: (delta: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const base = cfg.baseUrl.replace(/\/+$/, '')
  const url = base.endsWith('/v1') ? `${base}/chat/completions` : `${base}/v1/chat/completions`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {})
    },
    body: JSON.stringify({ model: cfg.model, messages, stream: true }),
    signal
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`hermes 请求失败 HTTP ${res.status}: ${text.slice(0, 300)}`)
  }
  if (!res.body) throw new Error('hermes 未返回流式 body')

  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buf = ''

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })

    const lines = buf.split(/\r?\n/)
    buf = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const data = trimmed.slice(5).trim()
      if (data === '[DONE]') return
      try {
        const json = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string }; text?: string }>
        }
        const delta = json.choices?.[0]?.delta?.content ?? json.choices?.[0]?.text ?? ''
        if (delta) onChunk(delta)
      } catch {
        // 忽略 keep-alive 等非 JSON 行
      }
    }
  }
}
