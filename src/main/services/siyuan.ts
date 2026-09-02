import type { DiaryEntry, SiyuanConfig, SiyuanNotebook, SiyuanSyncResult, TodoItem } from '../../shared/types'

/**
 * 思源笔记内核 HTTP API 客户端（日记/待办同步 + 连接测试 + 笔记本列表）。
 * 参考：https://siyuannote.com/article/1749331310
 * 所有内核接口都是 POST；鉴权头为 `Authorization: Token <token>`。
 */

interface SiyuanResp<T = unknown> {
  code: number
  msg: string
  data: T
}

async function request<T = unknown>(cfg: SiyuanConfig, path: string, body?: unknown): Promise<SiyuanResp<T>> {
  const base = cfg.baseUrl.replace(/\/+$/, '')
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cfg.token ? { Authorization: `Token ${cfg.token}` } : {})
    },
    body: JSON.stringify(body ?? {})
  })
  if (!res.ok) {
    throw new Error(`思源请求失败 HTTP ${res.status}: ${await res.text().catch(() => '')}`)
  }
  const json = (await res.json()) as SiyuanResp<T>
  if (json.code !== 0) {
    throw new Error(`思源错误 code=${json.code}: ${json.msg}`)
  }
  return json
}

/** 探测思源是否可达（/api/system/version 无需鉴权也能返回版本号） */
export async function testConnection(cfg: SiyuanConfig): Promise<{ ok: boolean; version?: string }> {
  const r = await request<string>(cfg, '/api/system/version')
  return { ok: r.code === 0, version: String(r.data ?? '') }
}

export interface NotebookInfo extends SiyuanNotebook {}

/** 列出（未关闭的）笔记本，供设置里选择同步目标 */
export async function listNotebooks(cfg: SiyuanConfig): Promise<NotebookInfo[]> {
  const r = await request<{ notebooks: Array<{ id: string; name: string; closed?: boolean }> }>(
    cfg,
    '/api/notebook/lsNotebooks'
  )
  return (r.data?.notebooks ?? []).filter((n) => !n.closed).map((n) => ({ id: n.id, name: n.name }))
}

/** 同步结果：skipped = 未启用同步/未选笔记本（本地照常保存，不算失败） */
export type SyncResult = SiyuanSyncResult

/**
 * 按「文档路径」幂等更新一篇思源文档（先删旧、再建新）。
 *
 * 实测坑：
 *   1. createDocWithMd 同路径会重复建文档（不是更新），所以必须先删旧文档；
 *   2. 思源的 SQL 索引有延迟，建/删后立刻按 hpath 查不可靠 → 不能用 SQL 找旧文档；
 *   3. removeDoc/listDocsByPath 的 path 是「.sy 路径」，且嵌套文档带父级 id 链
 *      （/父id/子id.sy），不能用 /子id.sy 裸删。
 * 所以改用「文件树遍历」：沿 docPath 逐段走 listDocsByPath（读文件树、即时无延迟），
 * 收集目标路径上的旧文档 .sy 路径 → 全部删除 → 再创建。
 */
async function upsertDoc(
  cfg: SiyuanConfig,
  notebook: string,
  docPath: string,
  markdown: string
): Promise<void> {
  const segments = docPath.split('/').filter(Boolean)

  // 沿文件树逐段下钻，收集目标文档（含历史重复）的 .sy 路径
  let parentPath = '/'
  let targetPaths: string[] = []
  for (let i = 0; i < segments.length; i++) {
    const listing = await request<{ files?: Array<{ name: string; path: string }> }>(
      cfg,
      '/api/filetree/listDocsByPath',
      { notebook, path: parentPath }
    )
    const files = listing.data?.files ?? []
    const matches = files.filter((f) => f.name === segments[i])
    if (i === segments.length - 1) {
      targetPaths = matches.map((f) => f.path)
    } else if (matches.length > 0) {
      parentPath = matches[0].path // 进入下一层（取第一个同名父级）
    } else {
      break // 父级不存在，目标也不会存在
    }
  }

  for (const p of targetPaths) {
    await request(cfg, '/api/filetree/removeDoc', { notebook, path: p }).catch(() => {})
  }

  // path 的父级不存在时思源会自动创建
  await request(cfg, '/api/filetree/createDocWithMd', { notebook, path: docPath, markdown })
}

/** 同步一篇日记：文档路径 /日记/日期，正文 = 标题 + 内容 */
export async function syncDiary(cfg: SiyuanConfig, entry: DiaryEntry): Promise<SyncResult> {
  if (!cfg.syncDiary || !cfg.diaryNotebook) return { ok: true, skipped: true }
  try {
    const md = `# ${entry.title}\n\n${entry.content}`
    await upsertDoc(cfg, cfg.diaryNotebook, `/日记/${entry.date}`, md)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

/** 同步待办清单（整表覆盖为一篇 Markdown 任务清单，路径 /待办/待办清单） */
export async function syncTodoList(cfg: SiyuanConfig, items: TodoItem[]): Promise<SyncResult> {
  if (!cfg.syncTodo || !cfg.todoNotebook) return { ok: true, skipped: true }
  try {
    const lines = items.map((i) => `- [${i.done ? 'x' : ' '}] ${i.title.replace(/\r?\n/g, ' ')}`)
    const md = `# 待办清单\n\n${lines.join('\n') || '（空）'}\n\n> 最后同步：${new Date().toLocaleString('zh-CN')}`
    await upsertDoc(cfg, cfg.todoNotebook, '/待办/待办清单', md)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}