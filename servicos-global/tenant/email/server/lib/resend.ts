// server/lib/resend.ts
// Instância global do cliente Resend.
// Nenhum outro arquivo chama o Resend diretamente — toda comunicação
// passa pela função sendEmail() em server/services/email.ts.

import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('[email] RESEND_API_KEY não configurado')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

