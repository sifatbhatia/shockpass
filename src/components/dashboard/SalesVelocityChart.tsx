type SalesVelocityChartProps = {
  data: { date: string; sales: number }[]
  className?: string
}

export function SalesVelocityChart({ data, className }: SalesVelocityChartProps) {
  const recent = data.slice(-14)
  const max = Math.max(1, ...recent.map((d) => d.sales))
  const width = 280
  const height = 64
  const points = recent.map((d, i) => {
    const x = (i / Math.max(1, recent.length - 1)) * width
    const y = height - (d.sales / max) * (height - 8) - 4
    return `${x},${y}`
  })

  const total = recent.reduce((s, d) => s + d.sales, 0)

  return (
    <div className={className}>
      <div className="flex items-end justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-muted">Sales velocity</span>
        <span className="font-mono text-sm">{total} last 14d</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-acid"
          points={points.join(' ')}
        />
        {recent.map((d, i) => {
          const x = (i / Math.max(1, recent.length - 1)) * width
          const y = height - (d.sales / max) * (height - 8) - 4
          return d.sales > 0 ? (
            <circle key={d.date} cx={x} cy={y} r="3" className="fill-acid" />
          ) : null
        })}
      </svg>
    </div>
  )
}
