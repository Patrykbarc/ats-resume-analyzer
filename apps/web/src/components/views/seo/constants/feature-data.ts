import { CheckCircle2, FileText, Sparkles, TrendingUp } from 'lucide-react'
import { ComponentType, SVGProps } from 'react'

export type FeatureKey = 'aiPowered' | 'atsOptimization' | 'instantFeedback' | 'actionableTips'

export const featureData: { icon: ComponentType<SVGProps<SVGSVGElement>>; key: FeatureKey }[] = [
  { icon: Sparkles, key: 'aiPowered' },
  { icon: FileText, key: 'atsOptimization' },
  { icon: TrendingUp, key: 'instantFeedback' },
  { icon: CheckCircle2, key: 'actionableTips' }
]
