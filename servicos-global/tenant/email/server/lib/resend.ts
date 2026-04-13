// server/lib/resend.ts
// Instância global do cliente Resend.
// Nenhum outro arquivo chama o Resend diretamente — toda comunicação
// passa pela função sendEmail() em server/services/email.ts.

import { Resend } from 'resend'

// Instância lazy — não explode no boot se a chave não estiver configurada.
// Lança erro apenas quando tentativa de envio for feita sem credencial.
let _resend: Resend | null = null

export function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('[email] RESEND_API_KEY não configurado')
    }
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

/** @deprecated Prefira getResend() — mantido por compatibilidade */
export const resend = new Proxy({} as Resend, {
  get(_target, prop) {
    return (getResend() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

