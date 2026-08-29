import { create } from 'zustand'

export type PanelName = 'chat' | 'music' | 'pomodoro' | 'todo' | 'diary' | 'settings' | null

interface UIState {
  panel: PanelName
  setPanel: (p: PanelName) => void
}

export const useUIStore = create<UIState>((set) => ({
  panel: null,
  setPanel: (panel) => set({ panel })
}))
