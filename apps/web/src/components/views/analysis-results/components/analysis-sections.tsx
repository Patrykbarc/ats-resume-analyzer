import { Card, CardContent } from '@/components/ui/card'
import { AiAnalysis } from '@monorepo/types'
import { capitalize } from 'lodash'
import { AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react'

type Section<T extends keyof AiAnalysis['sections']> = T[]

type AiAnalysisSectionObject = {
  strengths: Section<'strengths'>
  areas_for_improvement: Section<'areas_for_improvement'>
  recommendations: Section<'recommendations'>
}

type TypedSectionArray = [keyof AiAnalysisSectionObject, string[]][]

const ICONS_DATA = [
  { icon: CheckCircle2, color: 'text-green-500' },
  { icon: AlertCircle, color: 'text-yellow-500' },
  { icon: Lightbulb, color: 'text-blue-500' }
]

export function AnalysisSections({
  sections
}: {
  sections: AiAnalysis['sections']
}) {
  const sectionsArr = Object.entries(sections) as TypedSectionArray

  return sectionsArr.map(([key, items], index) => {
    const title = capitalize(key.replaceAll('_', ' '))

    const sectionIconData = ICONS_DATA[index % ICONS_DATA.length]

    const IconComponent = sectionIconData.icon
    const iconColor = sectionIconData.color

    if (items.length === 0) {
      return null
    }

    return (
      <Card key={key}>
        <CardContent>
          <div className="mb-4 flex items-center gap-3">
            <div>
              <IconComponent className={`h-6 w-6 ${iconColor}`} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          </div>

          <ol className="list-inside list-decimal space-y-2 text-sm">
            {items.map((item, idx) => (
              <li key={idx} className="leading-relaxed text-muted-foreground">
                {item}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    )
  })
}
