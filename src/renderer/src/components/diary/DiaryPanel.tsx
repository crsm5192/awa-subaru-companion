import { useEffect, useState } from 'react'
import type { DiaryEntry } from '@shared/types'

const today = (): string => new Date().toISOString().slice(0, 10)

export default function DiaryPanel(): JSX.Element {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [current, setCurrent] = useState<DiaryEntry | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const reload = (): void => {
    void window.api.diary.list().then((list) => {
      setEntries(list)
      const todays = list.find((d) => d.date === today())
      setCurrent(todays ?? null)
      setTitle(todays?.title ?? '')
      setContent(todays?.content ?? '')
    })
  }

  useEffect(() => {
    reload()
  }, [])

  const save = async (): Promise<void> => {
    const entry: DiaryEntry = {
      id: current?.id ?? crypto.randomUUID(),
      date: today(),
      title: title || today(),
      content,
      updatedAt: Date.now()
    }
    await window.api.diary.save(entry)
    reload()
  }

  return (
    <div className="panel diary-panel">
      <div className="panel-header">
        <span>日记 · {today()}</span>
        <span className="diary-siyuan-hint">TODO: 同步到思源</span>
      </div>
      <input
        className="diary-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="标题"
      />
      <textarea
        className="diary-content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="写下今天…"
      />
      <button onClick={() => void save()}>保存</button>
      <details>
        <summary>历史</summary>
        {entries.map((d) => (
          <div key={d.id} onClick={() => { setCurrent(d); setTitle(d.title); setContent(d.content) }}>
            {d.date} · {d.title}
          </div>
        ))}
      </details>
    </div>
  )
}
