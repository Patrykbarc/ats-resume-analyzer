import type { PremiumModules } from '@monorepo/types'

import { AtsKeywordModule } from './ats-keyword-module'
import { CareerPathModule } from './career-path-module'
import { ContentStructureModule } from './content-structure-module'
import { CoverLetterModule } from './cover-letter-module'
import { ExportModule } from './export-module'
import { InterviewPrepModule } from './interview-prep-module'
import { LinkedinModule } from './linkedin-module'
import { SalaryInsightsModule } from './salary-insights-module'
import { SkillsGapModule } from './skills-gap-module'

type PremiumModulesProps = {
  premium?: PremiumModules
}

export function PremiumModules({ premium }: PremiumModulesProps) {
  if (!premium) {
    return null
  }

  return (
    <div className="space-y-4">
      <AtsKeywordModule data={premium.ats_keyword_match} />
      <ContentStructureModule data={premium.content_and_structure} />
      <CoverLetterModule data={premium.cover_letter} />
      <InterviewPrepModule data={premium.interview_prep} />
      <LinkedinModule data={premium.linkedin_profile} />
      <SkillsGapModule data={premium.skills_gap} />
      <SalaryInsightsModule data={premium.salary_insights} />
      <CareerPathModule data={premium.career_path} />
      <ExportModule data={premium.export} />
    </div>
  )
}
