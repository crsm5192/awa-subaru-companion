import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

const PHRASES = [
  '今天也要元气满满哦～',
  '陪我玩嘛～',
  '你在忙什么呀？',
  '要加油哦！',
  '肚子有点饿了…',
  '哼哼，才没有想你呢',
  '今天的天气真不错呀',
  '一起加油吧！',
  '好无聊哦，陪我聊聊天嘛～',
  '我最喜欢和你待在一起啦！',
  '偷偷看你一眼…',
  '工作辛苦啦，喝口水吧～'
]

// 两种形状 + 四种底色随机
const SHAPES = ['round', 'cloud'] as const
const COLORS = ['#ffc9dd', '#cfe6ff', '#b9e2f7', '#fff3dd'] // 粉、粉蓝、天蓝、米白

interface BubbleState {
  text: string
  shape: (typeof SHAPES)[number]
  color: string
}

/** 随机文字气泡：固定在窗口右上方，每隔 15~45 秒随机冒出一句（形状/颜色随机），停留 4 秒 */
export default function SpeechBubble(): JSX.Element | null {
  const [bubble, setBubble] = useState<BubbleState | null>(null)

  useEffect(() => {
    let showTimer = 0
    let hideTimer = 0
    let cancelled = false

    const schedule = (): void => {
      const delay = 15000 + Math.random() * 30000
      showTimer = window.setTimeout(() => {
        if (cancelled) return
        setBubble({
          text: PHRASES[Math.floor(Math.random() * PHRASES.length)],
          shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
          color: COLORS[Math.floor(Math.random() * COLORS.length)]
        })
        hideTimer = window.setTimeout(() => {
          if (!cancelled) setBubble(null)
        }, 4000)
        schedule()
      }, delay)
    }
    schedule()

    return () => {
      cancelled = true
      window.clearTimeout(showTimer)
      window.clearTimeout(hideTimer)
    }
  }, [])

  if (!bubble) return null
  const shapeClass = bubble.shape === 'cloud' ? 'bubble-cloud' : 'bubble-round'
  return (
    <div
      className={`speech-bubble ${shapeClass}`}
      style={{ '--bubble-color': bubble.color } as CSSProperties}
    >
      {bubble.text}
    </div>
  )
}