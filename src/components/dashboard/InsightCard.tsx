import { Panel } from '@/components/ui/Panel'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { COPY } from '@/lib/copy'

type TierInsight = {
  name: string
  count: number
  quantityTotal?: number
  quantitySold?: number
}

type InsightCardProps = {
  tiers: TierInsight[]
  capacityFilled: number
}

export function InsightCard({ tiers, capacityFilled }: InsightCardProps) {
  const hotTier = tiers.find((t) => {
    const total = t.quantityTotal ?? 0
    const sold = t.quantitySold ?? t.count
    return total > 0 && sold / total >= 0.7 && sold / total < 1
  })

  const message = hotTier
    ? `${hotTier.name} is ${Math.round(((hotTier.quantitySold ?? hotTier.count) / (hotTier.quantityTotal ?? 1)) * 100)}% sold — consider opening the next tier.`
    : capacityFilled >= 85
      ? 'Room is nearly full — push final sales or close the drop.'
      : capacityFilled >= 40
        ? 'Momentum is building — share the drop link to accelerate sell-through.'
        : 'Drop is live. Share early to build waitlist pressure before tiers sell out.'

  return (
    <Panel glow="acid" className="p-5">
      <SectionLabel>{COPY.nextAction}</SectionLabel>
      <p className="mt-2 text-sm leading-relaxed">{message}</p>
    </Panel>
  )
}
