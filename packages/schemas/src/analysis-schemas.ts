import { z } from 'zod'

const AnalysisParamsSchema = z.object({
  id: z.string()
})

const PaginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10).optional(),
  cursor: z.string().optional()
})

const AnalysisParamsWithPaginationSchema = AnalysisParamsSchema.extend(
  PaginationSchema.shape
)

type AnalysisParamsWithLimit = z.infer<
  typeof AnalysisParamsWithPaginationSchema
>

export {
  AnalysisParamsSchema,
  AnalysisParamsWithPaginationSchema,
  PaginationSchema
}
export type { AnalysisParamsWithLimit }
