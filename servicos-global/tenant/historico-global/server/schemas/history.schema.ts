import { z } from 'zod'

export const IngestHistorySchema = z.object({
  actor_id: z.string().min(1, 'Agent/Actor ID is required'),
  actor_type: z.enum(['USER', 'SYSTEM', 'GABI_IA', 'ADMIN']),
  action: z.string().min(1, 'Action description is required'),
  product_id: z.string().optional(),
  user_id: z.string().optional(),
  metadata: z.record(z.any()).optional()
})

export const ListHistoryQuerySchema = z.object({
  tenant_id: z.string().optional(), // usually populated from auth/middleware
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  actor_id: z.string().optional(),
  actor_type: z.enum(['USER', 'SYSTEM', 'GABI_IA', 'ADMIN']).optional(),
  action: z.string().optional(),
  product_id: z.string().optional(),
  user_id: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0)
})
