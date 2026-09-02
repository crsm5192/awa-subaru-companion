import { useEffect, useState } from 'react'
import type { TodoItem } from '@shared/types'

export default function TodoPanel(): JSX.Element {
  const [items, setItems] = useState<TodoItem[]>([])
  const [title, setTitle] = useState('')
  const [syncStatus, setSyncStatus] = useState('')
  const [syncErr, setSyncErr] = useState(false)

  const reload = (): void => {
    void window.api.todo.list().then(setItems)
  }

  // 变更后刷新本地列表 + 同步思源（未启用/未选笔记本时主进程返回 skipped）
  const refreshAndSync = async (): Promise<void> => {
    const list = await window.api.todo.list()
    setItems(list)
    try {
      const r = await window.api.siyuan.syncTodo(list)
      if (!r.skipped) {
        setSyncErr(!r.ok)
        setSyncStatus(r.ok ? '已同步到思源 ✓' : `同步失败：${r.error ?? ''}`)
      }
    } catch (e) {
      setSyncErr(true)
      setSyncStatus(`同步失败：${e instanceof Error ? e.message : String(e)}`)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  const add = async (): Promise<void> => {
    const t = title.trim()
    if (!t) return
    setTitle('')
    await window.api.todo.add(t)
    await refreshAndSync()
  }

  const toggle = async (item: TodoItem): Promise<void> => {
    await window.api.todo.update({ ...item, done: !item.done })
    await refreshAndSync()
  }

  const remove = async (id: string): Promise<void> => {
    await window.api.todo.remove(id)
    await refreshAndSync()
  }

  return (
    <div className="panel todo-panel">
      <div className="panel-header">
        <span>待办</span>
        {syncStatus && <span className={syncErr ? 'sync-status err' : 'sync-status ok'}>{syncStatus}</span>}
      </div>
      <div className="todo-input">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && void add()}
          placeholder="添加待办…"
        />
        <button onClick={() => void add()}>＋</button>
      </div>
      <ul className="todo-list">
        {items.map((it) => (
          <li key={it.id} className={it.done ? 'done' : ''}>
            <input type="checkbox" checked={it.done} onChange={() => void toggle(it)} />
            <span>{it.title}</span>
            <button onClick={() => void remove(it.id)}>✕</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
