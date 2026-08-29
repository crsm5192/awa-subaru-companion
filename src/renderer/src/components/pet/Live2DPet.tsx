import { useEffect, useRef, useState } from 'react'
import { Application, Ticker } from 'pixi.js'
import { Live2DSprite } from 'easy-live2d'
import { useSpeechStore } from '../../store/speech'
import { usePetStore } from '../../store/pet'

interface Props {
  modelPath: string
}

function withTimeout<T>(p: Promise<T>, ms: number, msg: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(msg)), ms))
  ])
}

function loadCubismCore(): Promise<void> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as { Live2DCubismCore?: unknown }
    if (w.Live2DCubismCore) {
      resolve()
      return
    }
    const s = document.createElement('script')
    s.src = 'live2dcubismcore.min.js'
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('live2dcubismcore.min.js 加载失败（需要 Cubism 5 core）'))
    document.head.appendChild(s)
  })
}

export default function Live2DPet({ modelPath }: Props): JSX.Element {
  const hostRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState('准备加载…')

  useEffect(() => {
    let cancelled = false
    let app: Application | null = null
    let canvas: HTMLCanvasElement | null = null
    let cleanupListeners: (() => void) | null = null
    const host = hostRef.current
    if (!host) {
      setStatus('容器缺失')
      return
    }

    ;(async () => {
      try {
        setStatus('加载 Cubism Core…')
        await loadCubismCore()

        setStatus('创建画布…')
        const w = host.clientWidth || 420
        const h = host.clientHeight || 520
        canvas = document.createElement('canvas')
        host.appendChild(canvas)
        app = new Application()
        await app.init({
          canvas,
          width: w,
          height: h,
          backgroundAlpha: 0,
          antialias: false,
          autoDensity: true,
          resolution: 1
        })

        setStatus('加载模型…')
        const sprite = new Live2DSprite({ modelPath, ticker: Ticker.shared })
        sprite.renderable = true // easy-live2d 默认 renderable=false，显式打开确保渲染
        // 关键：必须先加入舞台，渲染时才触发模型加载（renderFrame → initModel）
        app.stage.addChild(sprite)
        await withTimeout(sprite.ready, 20000, '模型加载超时（20 秒未完成）')
        if (cancelled) return

        setStatus('适配尺寸…')
        // 基础尺寸：高度适配、脚踩窗口底、水平居中；缩放(滑条)在此基础上乘倍数
        const rawH = sprite.height / Math.max(0.0001, Math.abs(sprite.scale.y))
        const baseFit = (h * 0.85) / rawH
        const baseX = w / 2
        const baseY = h

        // 眼睛追踪状态：目标（屏幕光标归一化 -1..1）+ 当前平滑值
        let targetNX = 0
        let targetNY = 0
        let curNX = 0
        let curNY = 0
        const cursorTimer = window.setInterval(() => {
          void window.api.getCursor().then((c) => {
            if (!c) return
            const hw = c.winW / 2 || 1
            const hh = c.winH / 2 || 1
            targetNX = Math.max(-1, Math.min(1, (c.cx - c.winX - hw) / hw))
            targetNY = Math.max(-1, Math.min(1, (c.cy - c.winY - hh) / hh))
          })
        }, 50)

        // 每帧应用：缩放（滑条值）+ 平移（右键拖动）+ 眼睛追踪 + 口型
        const applyTransform = (): void => {
          const { scale, offsetX, offsetY, eyeTracking, eyeTrackingStrength } = usePetStore.getState()
          sprite.scale.set(baseFit * scale)
          sprite.anchor.set(0.5, 1)
          sprite.x = baseX + offsetX
          sprite.y = baseY + offsetY
          // 头部位置（模型头顶往下约 12% = 接近脸/头顶），供文字气泡定位
          const modelH = baseFit * scale * rawH
          usePetStore.getState().setHead(baseX + offsetX, baseY + offsetY - modelH * 0.88)
          // 眼睛追踪：开 → 平滑趋近光标；关 → 回正
          if (eyeTracking) {
            curNX += (targetNX - curNX) * 0.1
            curNY += (targetNY - curNY) * 0.1
          } else {
            curNX = 0
            curNY = 0
          }
          sprite.setParameterValueById('ParamAngleX', curNX * 15 * eyeTrackingStrength)
          sprite.setParameterValueById('ParamAngleY', -curNY * 12 * eyeTrackingStrength)
          sprite.setParameterValueById('ParamEyeBallX', curNX * 1.5 * eyeTrackingStrength)
          sprite.setParameterValueById('ParamEyeBallY', -curNY * 1.5 * eyeTrackingStrength)
          sprite.setParameterValueById('ParamMouthOpenY', useSpeechStore.getState().mouthLevel)
          // 隐藏免费模型水印/广告：Paramheadxy* 参数 30=隐藏、0=显示，每帧强制覆盖（无此参数的模型是空操作）
          for (const name of ['Paramheadxy', 'Paramheadxy2', 'Paramheadxy3', 'Paramheadxy4', 'Paramheadxy5', 'Paramheadxy6', 'Paramheadxy7', 'Paramheadxy8', 'Paramheadxy9']) {
            sprite.setParameterValueById(name, 30)
          }
        }
        app.ticker.add(applyTransform)

        // 锁定模式下：右键拖动 → 平移模型（调整显示哪一部分）
        let dragging = false
        let lastX = 0
        let lastY = 0
        const onDown = (ev: MouseEvent): void => {
          if (!usePetStore.getState().locked) return
          if (ev.button !== 2) return // 右键 = 平移
          dragging = true
          lastX = ev.clientX
          lastY = ev.clientY
          ev.preventDefault()
        }
        const onMove = (ev: MouseEvent): void => {
          if (!dragging) return
          const s = usePetStore.getState()
          s.setOffset(s.offsetX + (ev.clientX - lastX), s.offsetY + (ev.clientY - lastY))
          lastX = ev.clientX
          lastY = ev.clientY
        }
        const onUp = (): void => {
          dragging = false
          const s = usePetStore.getState()
          void window.api.setConfig({ pet: { offsetX: s.offsetX, offsetY: s.offsetY } })
        }
        const onCtx = (ev: MouseEvent): void => ev.preventDefault()
        canvas.addEventListener('mousedown', onDown)
        canvas.addEventListener('contextmenu', onCtx)
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
        cleanupListeners = (): void => {
          window.clearInterval(cursorTimer)
          canvas?.removeEventListener('mousedown', onDown)
          canvas?.removeEventListener('contextmenu', onCtx)
          window.removeEventListener('mousemove', onMove)
          window.removeEventListener('mouseup', onUp)
        }

        console.log('[live2d] DONE rawH=', rawH, 'baseFit=', baseFit)
        setStatus('')
      } catch (e) {
        console.error('[live2d] ERROR:', e)
        setStatus('错误: ' + String((e as Error)?.message ?? e))
      }
    })()

    return () => {
      cancelled = true
      cleanupListeners?.()
      if (app) {
        try {
          app.destroy(true)
        } catch {
          /* ignore */
        }
      }
      if (canvas && canvas.parentNode === host) {
        host.removeChild(canvas)
      }
    }
  }, [modelPath])

  const isErr = status.startsWith('错误')
  return (
    <div className="pet-wrap">
      {/* canvas 宿主：JSX 永远为空，React 不会动它里面手动 append 的 canvas */}
      <div className="pet-stage" ref={hostRef} />
      {status && <div className={`live2d-badge ${isErr ? 'live2d-err' : ''}`}>{status}</div>}
    </div>
  )
}