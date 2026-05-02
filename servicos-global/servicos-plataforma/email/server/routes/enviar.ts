// server/routes/enviar.ts
// POST /api/v1/envios-email — envia um email imediatamente ou via template.

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/errors.js'
import { prisma } from '../lib/prisma.js'
import { sendEmail, interpolateTemplate } from '../services/email.js'
import { authMiddleware } from '../middleware/auth.js'

export const enviarRouter = Router()

const enviarSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1).max(255).optional(),
  body: z.string().min(1).optional(),
  body_html: z.string().optional(),
  template_id: z.string().cuid().optional(),
  variables: z.record(z.string()).optional().default({}),
  product_id: z.string().optional(),
}).refine(
  (d) => d.template_id || (d.subject && (d.body || d.body_html)),
  { message: 'Forneça template_id ou subject + body' }
)

enviarRouter.post(
  '/api/v1/envios-email',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const parse = enviarSchema.safeParse(req.body)
    if (!parse.success) {
      return next(new AppError(parse.error.errors[0].message, 422, 'VALIDATION_ERROR'))
    }

    const { to, subject, body, body_html, template_id, variables, product_id } = parse.data
    const { id_organizacao: tenantId, id_usuario: userId } = req.auth

    let finalSubject = subject ?? ''
    let finalHtml = body_html ?? body ?? ''
    let finalText = body

    // Carregar e interpolar template se fornecido
    if (template_id) {
      const tmpl = await prisma.emailTemplate.findFirst({
        where: {
          id_template_email: template_id,
          id_organizacao_template_email: tenantId,
          ativo_template_email: true,
        },
      })
      if (!tmpl) {
        return next(new AppError('Template não encontrado ou inativo', 404, 'TEMPLATE_NOT_FOUND'))
      }
      finalSubject = finalSubject || interpolateTemplate(tmpl.assunto_template_email, variables)
      finalHtml = interpolateTemplate(tmpl.corpo_html_template_email, variables)
      finalText = tmpl.corpo_texto_template_email
        ? interpolateTemplate(tmpl.corpo_texto_template_email, variables)
        : undefined
    }

    const result = await sendEmail({
      tenantId,
      userId,
      productId: product_id,
      to,
      subject: finalSubject,
      html: finalHtml,
      text: finalText,
      templateId: template_id,
    })

    if (!result.success) {
      return next(new AppError(
        `Falha ao enviar email: ${result.error}`,
        502,
        'EMAIL_SEND_FAILED'
      ))
    }

    res.status(202).json({
      message: 'Email enviado com sucesso',
      resend_id: result.resendId,
      dedup_key: result.dedupKey,
    })
  }
)
