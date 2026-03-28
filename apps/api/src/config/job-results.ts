import type { AiAnalysis } from '@monorepo/types'

export type JobResult = AiAnalysis & {
  parsed_file: string
  user: { id: string } | null
}

export const jobResults = new Map<string, JobResult>()
