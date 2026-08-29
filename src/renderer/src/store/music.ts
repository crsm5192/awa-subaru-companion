import { create } from 'zustand'
import type { MusicInfo } from '@shared/types'

const STATE_KEY = 'awa-music-state'

interface MusicState {
  songs: MusicInfo[]
  index: number
  playing: boolean
  shuffle: boolean
  progress: number
  duration: number
  loadSongs: () => Promise<void>
  play: (i: number) => void
  togglePlay: () => void
  next: () => void
  prev: () => void
  toggleShuffle: () => void
  seek: (v: number) => void
}

// 单例音频：不随面板卸载而停止，关闭面板继续播
const audio = new Audio()

export const useMusicStore = create<MusicState>((set, get) => {
  const persist = (i: number, sh: boolean): void => {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify({ lastIndex: i, shuffle: sh }))
    } catch {
      /* ignore */
    }
  }

  audio.onplay = () => set({ playing: true })
  audio.onpause = () => set({ playing: false })
  audio.ontimeupdate = () => {
    if (audio.duration) set({ progress: audio.currentTime / audio.duration })
  }
  audio.onloadedmetadata = () => set({ duration: audio.duration })
  audio.onended = () => get().next()
  audio.onerror = () => {
    console.error('[music] 音频加载失败:', audio.src, 'code=', audio.error?.code, 'msg=', audio.error?.message)
  }

  const safePlay = (): void => {
    audio.play().catch((e) => {
      console.error('[music] play 失败:', String(e), 'src=', audio.src)
    })
  }

  return {
    songs: [],
    index: -1,
    playing: false,
    shuffle: false,
    progress: 0,
    duration: 0,

    loadSongs: async () => {
      const songs = await window.api.music.list()
      const { index, playing } = get()
      set({ songs })

      if (songs.length === 0) {
        set({ index: -1 })
        return
      }

      // 仅在首次（还没选中）时恢复上次状态 + 预加载；刷新时保留当前播放不打断
      if (index < 0) {
        let si = 0
        let sh = false
        try {
          const s = JSON.parse(localStorage.getItem(STATE_KEY) || '{}') as { lastIndex?: number; shuffle?: boolean }
          si = s.lastIndex ?? 0
          sh = !!s.shuffle
        } catch {
          /* ignore */
        }
        const i = Math.max(0, Math.min(si, songs.length - 1))
        set({ index: i, shuffle: sh })
        if (!playing) audio.src = 'app://bundle/' + encodeURI(songs[i].path)
      }
    },

    play: (i) => {
      const { songs, shuffle } = get()
      if (i < 0 || i >= songs.length) return
      set({ index: i })
      audio.src = 'app://bundle/' + encodeURI(songs[i].path)
      persist(i, shuffle)
      safePlay()
    },

    togglePlay: () => {
      const { index, songs, playing } = get()
      if (songs.length === 0) return
      if (playing) {
        audio.pause()
      } else if (index < 0) {
        get().play(0)
      } else {
        safePlay()
      }
    },

    next: () => {
      const { songs, index, shuffle } = get()
      if (songs.length === 0) return
      const ni = shuffle ? Math.floor(Math.random() * songs.length) : (index + 1) % songs.length
      get().play(ni)
    },

    prev: () => {
      const { songs, index, shuffle } = get()
      if (songs.length === 0) return
      const pi = shuffle ? Math.floor(Math.random() * songs.length) : (index - 1 + songs.length) % songs.length
      get().play(pi)
    },

    toggleShuffle: () => {
      const sh = !get().shuffle
      set({ shuffle: sh })
      persist(get().index, sh)
    },

    seek: (v) => {
      if (audio.duration) {
        audio.currentTime = v * audio.duration
        set({ progress: v })
      }
    }
  }
})
