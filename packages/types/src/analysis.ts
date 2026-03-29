type PremiumModules = {
  ats_keyword_match: {
    target_role: string
    matched_keywords: string[]
    missing_keywords: string[]
    optimization_tips: string[]
  }
  content_and_structure: {
    format_issues: string[]
    structure_recommendations: string[]
    content_gaps: string[]
  }
  cover_letter: {
    analysis: string[]
    outline: {
      hook: string
      body: string
      close: string
    }
  }
  interview_prep: {
    elevator_pitch: string
    likely_questions: string[]
    stories_to_prepare: string[]
    metrics_to_cite: string[]
  }
  linkedin_profile: {
    headline: string
    about_summary: string
    featured_keywords: string[]
    action_items: string[]
  }
  skills_gap: {
    gaps: string[]
    learning_plan: string[]
    certifications: string[]
  }
  salary_insights: {
    range_estimate: string
    negotiation_moves: string[]
    risk_flags: string[]
  }
  career_path: {
    short_term_roles: string[]
    mid_term_roles: string[]
    long_term_roles: string[]
    next_steps: string[]
  }
  export: {
    pdf_outline: string[]
    priority_order: string[]
    notes: string
  }
}

type AiAnalysis = {
  id: string
  title: string
  overall_score: {
    label: string
    range: string
    score: string
    weighting_justification: {
      'ATS Compatibility': string
      'Job Market Alignment': string
      'Competitive Differentiation': string
    }
    justification: string
  }
  sections: {
    strengths: string[]
    areas_for_improvement: string[]
    recommendations: string[]
  }
  premium_modules?: PremiumModules
  parsed_file: string
}

type AiAnalysisError = { error: string }

export type { AiAnalysis, AiAnalysisError, PremiumModules }
