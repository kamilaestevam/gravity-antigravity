import { z } from 'zod'

export const notificationItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string().optional(),
  message: z.string(),
  read: z.boolean(),
  target_entity: z.string().optional(),
  target_id: z.string().optional(),
  delivery_status: z.string().optional(),
  created_at: z.string(),
})

export type NotificationItem = z.infer<typeof notificationItemSchema>

export const notificacoesListResponseSchema = z.object({
  status: z.literal('success'),
  data: z.array(notificationItemSchema),
  unread_count: z.number().int().nonnegative().optional(),
})

export const notificacaoCreateResponseSchema = z.object({
  status: z.literal('success'),
  data: notificationItemSchema,
})

export const notificacoesConfigResponseSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    email_enabled: z.boolean(),
    whatsapp_enabled: z.boolean(),
  }),
})

export const usuariosListResponseSchema = z.object({
  users: z.array(z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().optional(),
  })).optional(),
})
