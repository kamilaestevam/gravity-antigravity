/**
 * notificador-sync-ncm.ts — Despacho de notificações pós-sync NCM
 *
 * Lê os destinatários cadastrados em NcmSyncAgendamento.notificadores_ncm_sync_agendamento,
 * filtra por condição (Apenas Erros / Sempre) e envia via serviço de Email da plataforma.
 *
 * Padrão: fire-and-forget (best-effort). Falha de notificação NUNCA bloqueia o sync.
 * Comunicação via HTTP S2S com x-chave-interna-servico (skill: autenticacao-s2s).
 * Timeout de 5s por chamada (skill: resiliencia).
 *
 * WhatsApp: despacho via POST /api/v1/whatsapp/send no serviço plataforma.
 */

import type { PrismaClient } from '../../../generated/index.js'
import type { SyncResult } from './motor-sync-ncm.js'

// ── Tipos ────────────────────────────────────────────────────────────────────

interface Notificador {
  id:       string
  nome:     string
  contato:  string
  condicao: 'Apenas Erros' | 'Sempre'
  canal:    'E-mail' | 'WhatsApp' | 'Ambos'
}

// ── Lazy getters (padrão ESM — Mand. 08) ─────────────────────────────────────

function getEmailServiceUrl(): string {
  return process.env.EMAIL_SERVICE_URL ?? 'http://localhost:3001'
}

function getWhatsAppServiceUrl(): string {
  return process.env.WHATSAPP_SERVICE_URL ?? 'http://localhost:3001'
}

function getChaveInterna(): string {
  const chave = process.env.CHAVE_INTERNA_SERVICO ?? process.env.INTERNAL_SERVICE_KEY
  if (!chave) console.warn('[notificador-sync-ncm] CHAVE_INTERNA_SERVICO ausente — notificações não serão enviadas')
  return chave ?? ''
}

const FETCH_TIMEOUT_MS = 5_000

// ── Despacho principal ───────────────────────────────────────────────────────

/**
 * Lê destinatários do banco, filtra por condição, e despacha notificações.
 * Fire-and-forget: nunca lança — apenas loga warnings em caso de falha.
 */
export async function despacharNotificacoesNcmSync(
  prisma: PrismaClient,
  status: 'SUCESSO' | 'ERRO',
  resultado: SyncResult | null,
  mensagemErro?: string,
): Promise<void> {
  try {
    const config = await prisma.ncmSyncAgendamento.findUnique({
      where:  { id_ncm_sync_agendamento: 'default' },
      select: { notificadores_ncm_sync_agendamento: true },
    })

    const bruto = config?.notificadores_ncm_sync_agendamento
    if (!Array.isArray(bruto) || bruto.length === 0) return

    const destinatarios = (bruto as unknown as Notificador[]).filter(n =>
      n.condicao === 'Sempre' || (n.condicao === 'Apenas Erros' && status === 'ERRO')
    )

    if (destinatarios.length === 0) return

    const assunto = status === 'SUCESSO'
      ? `[Gravity] Sync NCM concluído — ${resultado?.total ?? 0} NCMs`
      : '[Gravity] Sync NCM falhou'

    const corpoHtml = construirEmailHtml(status, resultado, mensagemErro)

    for (const dest of destinatarios) {
      if (dest.canal === 'E-mail' || dest.canal === 'Ambos') {
        void enviarEmail(dest.contato, assunto, corpoHtml)
      }
      if (dest.canal === 'WhatsApp' || dest.canal === 'Ambos') {
        void enviarWhatsApp(dest.contato, assunto)
      }
    }

    console.log(`[notificador-sync-ncm] ${destinatarios.length} notificação(ões) despachada(s) (status=${status})`)
  } catch (err) {
    console.warn('[notificador-sync-ncm] Falha ao despachar notificações (best-effort):', err instanceof Error ? err.message : err)
  }
}

// ── Email via serviço Plataforma ─────────────────────────────────────────────

async function enviarEmail(para: string, assunto: string, corpoHtml: string): Promise<void> {
  try {
    const resposta = await fetch(`${getEmailServiceUrl()}/api/v1/envios-email`, {
      method: 'POST',
      headers: {
        'Content-Type':            'application/json',
        'x-chave-interna-servico': getChaveInterna(),
        'x-id-organizacao':        'system',
      },
      body: JSON.stringify({
        to:        para,
        subject:   assunto,
        body_html: corpoHtml,
      }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })

    if (!resposta.ok) {
      console.warn(`[notificador-sync-ncm] Email falhou para ${para}: HTTP ${resposta.status}`)
    }
  } catch (err) {
    console.warn(`[notificador-sync-ncm] Email falhou para ${para}:`, err instanceof Error ? err.message : err)
  }
}

// ── WhatsApp via serviço Plataforma ─────────────────────────────────────────

async function enviarWhatsApp(para: string, textoResumo: string): Promise<void> {
  try {
    const resposta = await fetch(`${getWhatsAppServiceUrl()}/api/v1/whatsapp/send`, {
      method: 'POST',
      headers: {
        'Content-Type':            'application/json',
        'x-chave-interna-servico': getChaveInterna(),
        'x-id-organizacao':        'system',
      },
      body: JSON.stringify({
        phone_number: para,
        text:         textoResumo,
      }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })

    if (!resposta.ok) {
      console.warn(`[notificador-sync-ncm] WhatsApp falhou para ${para}: HTTP ${resposta.status}`)
    }
  } catch (err) {
    console.warn(`[notificador-sync-ncm] WhatsApp falhou para ${para}:`, err instanceof Error ? err.message : err)
  }
}

// ── Template HTML do email ───────────────────────────────────────────────────

function construirEmailHtml(
  status: 'SUCESSO' | 'ERRO',
  resultado: SyncResult | null,
  mensagemErro?: string,
): string {
  const corStatus = status === 'SUCESSO' ? '#22c55e' : '#ef4444'
  const icone     = status === 'SUCESSO' ? '&#10004;' : '&#10006;'

  const linhasDetalhes = resultado
    ? `
      <tr><td style="padding:6px 12px;border-bottom:1px solid #334155">Total NCMs</td><td style="padding:6px 12px;border-bottom:1px solid #334155;text-align:right">${resultado.total}</td></tr>
      <tr><td style="padding:6px 12px;border-bottom:1px solid #334155">Adicionados</td><td style="padding:6px 12px;border-bottom:1px solid #334155;text-align:right;color:#22c55e">+${resultado.adicionados}</td></tr>
      <tr><td style="padding:6px 12px;border-bottom:1px solid #334155">Alterados</td><td style="padding:6px 12px;border-bottom:1px solid #334155;text-align:right;color:#f59e0b">~${resultado.alterados}</td></tr>
      <tr><td style="padding:6px 12px;border-bottom:1px solid #334155">Removidos</td><td style="padding:6px 12px;border-bottom:1px solid #334155;text-align:right;color:#ef4444">-${resultado.removidos}</td></tr>
      <tr><td style="padding:6px 12px">Duração</td><td style="padding:6px 12px;text-align:right">${(resultado.duracaoMs / 1000).toFixed(1)}s</td></tr>
    `
    : ''

  const blocoErro = mensagemErro
    ? `<div style="margin-top:16px;padding:12px;background:#1e1b2e;border-left:4px solid #ef4444;border-radius:4px;color:#fca5a5;font-family:monospace;font-size:13px">${mensagemErro}</div>`
    : ''

  return `
    <div style="background:#0f172a;color:#e2e8f0;padding:32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
      <div style="max-width:480px;margin:0 auto">
        <h2 style="margin:0 0 8px;color:${corStatus}">${icone} Sync NCM — ${status}</h2>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:14px">Portal Único Siscomex &rarr; Gravity Cadastros</p>
        ${resultado ? `
        <table style="width:100%;border-collapse:collapse;background:#1e293b;border-radius:8px;overflow:hidden;color:#e2e8f0;font-size:14px">
          ${linhasDetalhes}
        </table>
        ` : ''}
        ${blocoErro}
        <p style="margin:24px 0 0;color:#64748b;font-size:12px">Notificação automática — Gravity Admin</p>
      </div>
    </div>
  `
}
