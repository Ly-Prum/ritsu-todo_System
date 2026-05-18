import type { CSSProperties, ReactNode } from 'react'

export default function GradientText({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-block bg-clip-text text-transparent"
      style={{
        backgroundImage: 'linear-gradient(135deg, #34d399 0%, #38bdf8 100%)',
        WebkitTextFillColor: 'transparent',
        forcedColorAdjust: 'none' as CSSProperties['forcedColorAdjust'],
      }}
    >
      {children}
    </span>
  )
}
