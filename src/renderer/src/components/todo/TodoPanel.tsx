import { useEffect, useState } from 'react'
import type { TodoItem } from '@shared/types'

export default function TodoPanel(): JSX.Element {
  const [items, setItems] = useState<TodoItem[]>([])
  const [title, setTitle] = useState('')

  const reload = (): void => {
    void window.api.todo.list().then(setItems)
  }

  useEffect(() => {
    reload()
  }, [])

  const add = async (): Promise<void> => {
    const t = title.trim()
    if (!t) return
    setTitle('')
    await window.api.todo.add(t)
    reload()
  }

  const toggle = async (item: TodoItem): Promise<void> => {
    await window.api.todo.update({ ...item, done: !item.done })
    reload()
  }

  const remove = async (id: string): Promise<void> => {
    await window.api.todo.remove(id)
    reload()
  }

  return (
    <div className="panel todo-panel">
      <div className="panel-header">
        <span>待办</span>
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
