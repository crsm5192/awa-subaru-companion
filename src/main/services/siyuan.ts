import type { SiyuanConfig } from '../../shared/types'

/**
 * 思源笔记内核 HTTP API 客户端（极简）。
 * 参考：https://siyuannote.com/article/1749331310
 * 所有内核接口都是 POST；鉴权头为 `Authorization: Token <token>`。
 */
async function request(
  cfg: SiyuanConfig,
  path: string,
  body?: unknown
): Promise<{ code: number; msg: string; data: unknown }> {
  const base = cfg.baseUrl.replace(/\/+$/, '')
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cfg.token ? { Authorization: `Token ${cfg.token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  })
  if (!res.ok) {
    throw new Error(`思源请求失败 HTTP ${res.status}: ${await res.text().catch(() => '')}`)
  }
  return (await res.json()) as { code: number; msg: string; data: unknown }
}

/** 探测思源是否可达（/api/system/version 无需鉴权也能返回版本号） */
export async function testConnection(cfg: SiyuanConfig): Promise<{ ok: boolean; version?: string }> {
  const r = await request(cfg, '/api/system/version')
  return { ok: r.code === 0, version: String(r.data ?? '') }
}

// TODO: 实现日记/笔记的实际读写，常用接口：
//   1) 列出笔记本      POST /api/notebook/lsNotebooks
//   2) 用 markdown 建文档 POST /api/filetree/createDocWithMd { notebook, path, markdown }
//   3) 追加块          POST /api/block/appendBlock { dataType: 'markdown', data: '...', parentID }
//   4) SQL 查询        POST /api/query/sql { stmt: 'SELECT * FROM blocks ...' }
//
// 建议：日记「保存」时同时写一份到思源（按日期建文档），让 hermes-agent 和思源能直接看到。
export async function createDiaryDoc(
  cfg: SiyuanConfig,
  _notebook: string,
  _path: string,
  _markdown: string
): Promise<unknown> {
  throw new Error('createDiaryDoc 尚未实现 —— 见本文件 TODO')
}
