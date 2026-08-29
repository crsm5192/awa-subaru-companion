import { create } from 'zustand'

interface PetState {
  modelPath: string
  scale: number
  locked: boolean
  offsetX: number
  offsetY: number
  eyeTracking: boolean
  eyeTrackingStrength: number
  headX: number
  headY: number
  setModel: (modelPath: string, scale: number) => void
  setScale: (scale: number) => void
  setLocked: (locked: boolean) => void
  setOffset: (offsetX: number, offsetY: number) => void
  setEyeTracking: (eyeTracking: boolean) => void
  setEyeTrackingStrength: (eyeTrackingStrength: number) => void
  setHead: (headX: number, headY: number) => void
}

/**
 * 宠物共享状态：设置面板保存后写这里，PetStage/App 订阅后即时刷新，无需重启。
 */
export const usePetStore = create<PetState>((set) => ({
  modelPath: '',
  scale: 1,
  locked: false,
  offsetX: 0,
  offsetY: 0,
  eyeTracking: true,
  eyeTrackingStrength: 1,
  headX: 0,
  headY: 0,
  setModel: (modelPath, scale) => set({ modelPath, scale }),
  setScale: (scale) => set({ scale }),
  setLocked: (locked) => set({ locked }),
  setOffset: (offsetX, offsetY) => set({ offsetX, offsetY }),
  setEyeTracking: (eyeTracking) => set({ eyeTracking }),
  setEyeTrackingStrength: (eyeTrackingStrength) => set({ eyeTrackingStrength }),
  setHead: (headX, headY) => set({ headX, headY })
}))