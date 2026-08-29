import { useEffect } from 'react'
import type { MusicInfo } from '@shared/types'
import { useMusicStore } from '../../store/music'

function fmt(s: number): string {
  if (!isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function displayName(m: MusicInfo): string {
  return m.artist ? `${m.artist} - ${m.name}` : m.name
}

export default function MusicPanel(): JSX.Element {
  const songs = useMusicStore((s) => s.songs)
  const index = useMusicStore((s) => s.index)
  const playing = useMusicStore((s) => s.playing)
  const shuffle = useMusicStore((s) => s.shuffle)
  const progress = useMusicStore((s) => s.progress)
  const duration = useMusicStore((s) => s.duration)
  const loadSongs = useMusicStore((s) => s.loadSongs)
  const play = useMusicStore((s) => s.play)
  const togglePlay = useMusicStore((s) => s.togglePlay)
  const next = useMusicStore((s) => s.next)
  const prev = useMusicStore((s) => s.prev)
  const toggleShuffle = useMusicStore((s) => s.toggleShuffle)
  const seek = useMusicStore((s) => s.seek)

  useEffect(() => {
    void loadSongs() // 每次打开都刷新列表，新歌会显示
  }, [loadSongs])

  const current = index >= 0 ? songs[index] : null

  return (
    <div className="panel music-panel">
      <div className="panel-header">
        <span>音乐</span>
        <button
          className={shuffle ? 'shuffle-btn active' : 'shuffle-btn'}
          onClick={toggleShuffle}
          title={shuffle ? '当前：乱序播放，点击切换顺序' : '当前：顺序播放，点击切换乱序'}
        >
          {shuffle ? '🔀 乱序' : '↔️ 顺序'}
        </button>
      </div>

      <div className="music-now">
        <div className="music-title">{current ? displayName(current) : '未在播放'}</div>
        <div className="music-sub">{songs.length} 首 · {shuffle ? '乱序' : '顺序'}</div>
      </div>

      <div className="music-progress">
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={progress}
          onChange={(e) => seek(Number(e.target.value))}
        />
        <div className="music-time">
          <span>{fmt(progress * duration)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      <div className="music-controls">
        <button onClick={prev} disabled={songs.length === 0}>⏮</button>
        <button className="play-btn" onClick={togglePlay} disabled={songs.length === 0}>
          {playing ? '⏸' : '▶'}
        </button>
        <button onClick={next} disabled={songs.length === 0}>⏭</button>
      </div>

      <div className="music-list">
        {songs.map((s, i) => (
          <div
            key={s.path}
            className={i === index ? 'music-item active' : 'music-item'}
            onClick={() => play(i)}
          >
            <span className="music-item-no">{i + 1}</span>
            <span className="music-item-name">
              <span className="music-item-name-inner">{displayName(s)}</span>
            </span>
            {i === index && playing && <span className="music-eq">♪</span>}
          </div>
        ))}
        {songs.length === 0 && (
          <div className="music-empty">音乐文件夹为空——把 mp3/wav/flac 等放进 music 目录即可</div>
        )}
      </div>
    </div>
  )
}