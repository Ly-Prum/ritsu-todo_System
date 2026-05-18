import type { CSSProperties, ReactNode } from 'react'

const style: CSSProperties = {
  backgroundImage: 'linear-gradient(135deg, #34d399 0%, #38bdf8 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  display: 'inline-block',
  forcedColorAdjust: 'none' as CSSProperties['forcedColorAdjust'],
}

export default function GradientText({ children }: { children: ReactNode }) {
  return <span style={style}>{children}</span>
}
