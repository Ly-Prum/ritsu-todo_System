'use client'
import { useRef, useState } from 'react'
import { useStore } from '@/lib/store'

export default function HeaderBanner() {
  const headerBanner = useStore(s => s.headerBanner)
  const headerBannerY = useStore(s => s.headerBannerY)
  const headerBannerHeight = useStore(s => s.headerBannerHeight)
  const headerBannerZoom = useStore(s => s.headerBannerZoom)
  const setHeaderBanner = useStore(s => s.setHeaderBanner)
  const setHeaderBannerY = useStore(s => s.setHeaderBannerY)
  const setHeaderBannerHeight = useStore(s => s.setHeaderBannerHeight)
  const setHeaderBannerZoom = useStore(s => s.setHeaderBannerZoom)

  const [hovering, setHovering] = useState(false)
  const [repositioning, setRepositioning] = useState(false)
  const [dragging, setDragging] = useState(false)
  const dragStartY = useRef(0)
  const dragStartBannerY = useRef(50)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!headerBanner) return null

  function onMouseDown(e: React.MouseEvent) {
    if (!repositioning) return
    setDragging(true)
    dragStartY.current = e.clientY
    dragStartBannerY.current = headerBannerY
    e.preventDefault()
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragging) return
    const delta = e.clientY - dragStartY.current
    setHeaderBannerY(Math.max(0, Math.min(100, Math.round(dragStartBannerY.current - delta * 0.4))))
  }
  function onMouseUp() { setDragging(false) }
  function nudgeY(dir: 'up' | 'down') {
    setHeaderBannerY(Math.max(0, Math.min(100, headerBannerY + (dir === 'up' ? -5 : 5))))
  }
  function nudgeH(dir: 'smaller' | 'larger') {
    setHeaderBannerHeight(Math.max(80, Math.min(320, headerBannerHeight + (dir === 'larger' ? 20 : -20))))
  }
  function nudgeZoom(dir: 'in' | 'out') {
    setHeaderBannerZoom(Math.max(1, Math.min(3, parseFloat((headerBannerZoom + (dir === 'in' ? 0.1 : -0.1)).toFixed(1)))))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const ratio = Math.min(1920 / img.width, 1, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      setHeaderBanner(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.src = url
    e.target.value = ''
  }

  const btn: React.CSSProperties = {
    background: 'rgba(0,0,0,0.65)', color: 'white', border: 'none',
    borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600,
    cursor: 'pointer',
  }
  const squareBtn: React.CSSProperties = {
    background: 'rgba(0,0,0,0.65)', color: 'white', border: 'none',
    borderRadius: 6, width: 32, height: 32, fontSize: 16,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  }

  return (
    <div style={{ position: 'relative', width: '100%', flexShrink: 0 }}>
      {/* バナー本体 */}
      <div
        style={{
          position: 'relative', width: '100%', height: headerBannerHeight,
          overflow: 'hidden',
          cursor: repositioning ? (dragging ? 'grabbing' : 'grab') : 'default',
          transition: 'height 0.2s',
        }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => { setHovering(false); setDragging(false) }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        <div style={{
          position: 'absolute',
          width: `${(headerBannerZoom ?? 1) * 100}%`,
          height: `${(headerBannerZoom ?? 1) * 100}%`,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundImage: `url(${headerBanner})`,
          backgroundSize: 'cover',
          backgroundPosition: `center ${headerBannerY}%`,
          backgroundRepeat: 'no-repeat',
          userSelect: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
          background: 'linear-gradient(to bottom, transparent, var(--bg))',
          pointerEvents: 'none',
        }} />

        {/* 位置調整モード — バナー内ボタン */}
        {repositioning && (
          <>
            <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
              <button style={squareBtn} onClick={e => { e.stopPropagation(); nudgeY('up') }}>▲</button>
            </div>
            <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
              <button style={squareBtn} onClick={e => { e.stopPropagation(); nudgeY('down') }}>▼</button>
            </div>
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0,0,0,0.5)', color: 'white',
              padding: '5px 14px', borderRadius: 20, fontSize: 11,
              pointerEvents: 'none', whiteSpace: 'nowrap',
            }}>
              ▲▼ 上下位置　ドラッグで移動
            </div>
          </>
        )}

        {/* ホバー時ボタン */}
        {hovering && !repositioning && (
          <div style={{ position: 'absolute', bottom: 10, right: 12, display: 'flex', gap: 6, zIndex: 10 }}>
            <button style={btn} onClick={e => { e.stopPropagation(); setRepositioning(true) }}>↕ 調整</button>
            <button style={btn} onClick={e => { e.stopPropagation(); fileRef.current?.click() }}>🖼 変更</button>
            <button style={{ ...btn, background: 'rgba(239,68,68,0.7)' }}
              onClick={e => { e.stopPropagation(); setHeaderBanner('') }}>削除</button>
          </div>
        )}
      </div>

      {/* 調整パネル — overflow: hidden の外側に配置 */}
      {repositioning && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px',
          background: 'rgba(0,0,0,0.8)',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginRight: 4 }}>高さ</span>
          <button style={squareBtn} onClick={() => nudgeH('larger')}>＋</button>
          <button style={squareBtn} onClick={() => nudgeH('smaller')}>－</button>

          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: '0 4px 0 12px' }}>ズーム</span>
          <button style={squareBtn} onClick={() => nudgeZoom('in')}>＋</button>
          <button style={squareBtn} onClick={() => nudgeZoom('out')}>－</button>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{Math.round((headerBannerZoom ?? 1) * 100)}%</span>

          <div style={{ flex: 1 }} />
          <button style={{ ...btn, background: 'rgba(16,185,129,0.85)' }} onClick={() => setRepositioning(false)}>完了</button>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
    </div>
  )
}
