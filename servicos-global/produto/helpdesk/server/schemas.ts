import { z } from 'zod';

export const tenantHeaderSchema = z.object({
  'x-id-organizacao': z.string({ required_error: 'x-id-organizacao header é obrigatório' }),
  'x-id-produto': z.string().optional(),
  'x-id-usuario': z.string().optional(),
});

export const createCategoriaSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const createSLASchema = z.object({
  categoria_id: z.string().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  response_time_hr: z.number().int().positive(),
  resolution_time_hr: z.number().int().positive(),
});

export const createTemplateSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

export const createTicketSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  categoria_id: z.string().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_ON_CUSTOMER', 'RESOLVED', 'CLOSED']),
  resolve: z.boolean().optional(),
});
