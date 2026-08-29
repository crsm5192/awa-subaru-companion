import { useEffect, useRef, useState } from 'react'

const WORK = 25 * 60
const BREAK = 5 * 60

export default function PomodoroPanel(): JSX.Element {
  const [seconds, setSeconds] = useState(WORK)
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState<'work' | 'break'>('work')
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!running) return
    timerRef.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s > 1) return s - 1
        const nextPhase = phase === 'work' ? 'break' : 'work'
        setPhase(nextPhase)
        void window.api.notify(
          '番茄钟',
          nextPhase === 'work' ? '休息结束，开始专注' : '专注结束，休息一下'
        )
        return nextPhase === 'work' ? WORK : BREAK
      })
    }, 1000)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [running, phase])

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return (
    <div className="panel pomodoro-panel">
      <div className="panel-header">
        <span>番茄钟</span>
      </div>
      <div className="pomodoro-time">
        {mm}:{ss}
      </div>
      <div className="pomodoro-phase">{phase === 'work' ? '专注中' : '休息中'}</div>
      <div className="pomodoro-actions">
        <button onClick={() => setRunning((r) => !r)}>{running ? '暂停' : '开始'}</button>
        <button
          onClick={() => {
            setSeconds(WORK)
            setPhase('work')
            setRunning(false)
          }}
        >
          重置
        </button>
      </div>
    </div>
  )
}
