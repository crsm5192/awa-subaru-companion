import { useEffect } from 'react'
import Live2DPet from './Live2DPet'
import { usePetStore } from '../../store/pet'

/**
 * 桌面宠物渲染容器。
 * - pet.modelPath 配了 Live2D 模型 → 用 Live2DPet 渲染 .moc3
 * - 没配 → 用 CSS 占位小人兜底
 * - 模型切换：设置面板保存时写 usePetStore，这里订阅后即时重载
 */
export default function PetStage(): JSX.Element {
  const modelPath = usePetStore((s) => s.modelPath)
  const setModel = usePetStore((s) => s.setModel)
  const setLocked = usePetStore((s) => s.setLocked)
  const setOffset = usePetStore((s) => s.setOffset)
  const setEyeTracking = usePetStore((s) => s.setEyeTracking)
  const setEyeTrackingStrength = usePetStore((s) => s.setEyeTrackingStrength)

  useEffect(() => {
    void window.api.getConfig().then((cfg) => {
      setModel(cfg.pet.modelPath, cfg.pet.scale)
      setLocked(cfg.pet.locked)
      setOffset(cfg.pet.offsetX, cfg.pet.offsetY)
      setEyeTracking(cfg.pet.eyeTracking)
      setEyeTrackingStrength(cfg.pet.eyeTrackingStrength)
    })
  }, [setModel, setLocked, setOffset, setEyeTracking, setEyeTrackingStrength])

  if (modelPath) {
    return <Live2DPet modelPath={modelPath} />
  }

  return (
    <div className="pet-stage">
      <div className="chibi">
        <div className="chibi-hair-back" />
        <div className="chibi-head">
          <div className="chibi-hair-front" />
          <div className="chibi-eyes">
            <span className="chibi-eye" />
            <span className="chibi-eye" />
          </div>
          <div className="chibi-mouth" />
        </div>
      </div>
    </div>
  )
}