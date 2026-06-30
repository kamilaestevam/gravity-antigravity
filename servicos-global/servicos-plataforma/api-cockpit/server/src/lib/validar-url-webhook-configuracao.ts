/**
 * Validação de URL para cadastro de webhook — espelha configurador/src/utils/validar-url-webhook-configuracao.ts
 */
import { z } from 'zod'

export const EXEMPLO_URL_WEBHOOK = 'https://api.suaempresa.com.br/webhooks/gravity'

const ROTULOS_DOMINIO_EXEMPLO = new Set([
  'exemplo',
  'example',
  'test',
  'teste',
  'foo',
  'bar',
  'dominio',
  'domain',
  'seu-dominio',
  'suaempresa',
  'empresa',
])

function ehHostLocalDev(hostname: string): boolean {
  const host = hostname.toLowerCase()
  return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost')
}

export function validarUrlWebhookConfiguracao(valor: string): string | null {
  const url = valor.trim()
  if (!url) {
    return 'Informe a URL HTTPS do endpoint que receberá os eventos.'
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return `Formato inválido. Use uma URL completa começando com https:// — ex.: ${EXEMPLO_URL_WEBHOOK}`
  }

  const host = parsed.hostname.toLowerCase()
  const ehLocal = ehHostLocalDev(host)

  if (parsed.protocol !== 'https:' && !ehLocal) {
    return 'A URL deve usar HTTPS. Em testes locais, use http://localhost:PORTA/caminho'
  }

  if (parsed.username || parsed.password) {
    return 'A URL não pode conter usuário ou senha embutidos.'
  }

  if (!ehLocal) {
    if (!host.includes('.')) {
      return `Use um domínio público com extensão válida (.com, .com.br, etc.). Ex.: ${EXEMPLO_URL_WEBHOOK}`
    }

    const labels = host.split('.').filter(Boolean)
    const tld = labels[labels.length - 1] ?? ''
    if (!/^[a-z]{2,63}$/i.test(tld)) {
      return `A extensão do domínio deve ter pelo menos 2 letras (.com, .br, etc.). Ex.: ${EXEMPLO_URL_WEBHOOK}`
    }

    const pareceExemplo =
      labels.length >= 2 &&
      labels.every((rotulo) => ROTULOS_DOMINIO_EXEMPLO.has(rotulo))

    if (pareceExemplo) {
      return `Substitua o domínio de exemplo pelo endpoint real da sua aplicação. Ex.: ${EXEMPLO_URL_WEBHOOK}`
    }
  }

  return null
}

export const urlWebhookConfiguracaoSchema = z
  .string()
  .trim()
  .min(1, 'Informe a URL HTTPS do endpoint que receberá os eventos.')
  .superRefine((valor, ctx) => {
    const erro = validarUrlWebhookConfiguracao(valor)
    if (erro) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: erro })
    }
  })

/** Primeira mensagem amigável de um ZodError (para resposta 400). */
export function mensagemErroValidacaoZod(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Dados inválidos. Verifique URL e eventos selecionados.'
}
