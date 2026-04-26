import { z } from 'zod'

export const ActorTypeEnum = z.enum(['USER', 'API', 'AI', 'JOB', 'INTEGRATION'])
export const EventStatusEnum = z.enum(['SUCCESS', 'FAILURE', 'PARTIAL'])

export const IngestHistorySchema = z.object({
  actor_type: ActorTypeEnum,
  actor_id: z.string().min(1),
  actor_name: z.string().min(1),
  actor_ip: z.string().optional(),
  actor_metadata: z.record(z.unknown()).optional(),

  module: z.string().min(1),
  resource_type: z.string().min(1),
  resource_id: z.string().optional(),

  action: z.string().min(1),
  action_detail: z.string().min(1),

  before: z.unknown().optional(),
  after: z.unknown().optional(),

  status: EventStatusEnum.optional(),
  error_message: z.string().optional(),

  product_id: z.string().optional(),
  user_id: z.string().optional(),
})

export const ListHistoryQuerySchema = z.object({
  // Visibilidade — preenchido pelo middleware, nunca pelo cliente
  tenant_id: z.string().optional(),
  user_id_filter: z.string().optional(),

  // Filtros
  actor_type: ActorTypeEnum.optional(),
  actor_id: z.string().optional(),
  module: z.string().optional(),
  resource_type: z.string().optional(),
  resource_id: z.string().optional(),
  action: z.string().optional(),
  status: EventStatusEnum.optional(),
  product_id: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),

  // Paginação cursor-based
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
})

export const ExportHistoryQuerySchema = z.object({
  tenant_id: z.string().optional(),
  user_id_filter: z.string().optional(),
  actor_type: ActorTypeEnum.optional(),
  module: z.string().optional(),
  action: z.string().optional(),
  status: EventStatusEnum.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  format: z.enum(['csv', 'json']).default('csv'),
})

export const AlertRuleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  enabled: z.boolean().default(true),

  actor_type: ActorTypeEnum.optional(),
  action: z.string().optional(),
  module: z.string().optional(),

  threshold_count: z.number().int().positive().optional(),
  threshold_window_seconds: z.number().int().positive().optional(),

  channel_inapp: z.boolean().default(true),
  channel_email: z.boolean().default(false),
  channel_whatsapp: z.boolean().default(false),

  recipients_email: z.array(z.string().email()).default([]),
  recipients_whatsapp: z.array(z.string()).default([]),
  recipients_user_ids: z.array(z.string()).default([]),
})

export const AlertEventUpdateSchema = z.object({
  status: z.enum(['REVIEWED', 'ESCALATED']),
  notes: z.string().optional(),
})
