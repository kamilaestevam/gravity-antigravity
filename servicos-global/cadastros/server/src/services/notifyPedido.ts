/**
 * notifyPedido.ts — Emissor de webhook Cadastros → Pedido (FASE 06E, frente 2).
 *
 * Princípio: sempre que uma entidade do Cadastros muda (Empresa, OPE, NCM,
 * Moeda, Unidade), o Cadastros notifica o serviço Pedido para que este decida
 * — com base na policy `pedido_snapshot_atualizacao` do workspace — se deve
 * re-snapshotar os pedidos afetados.
 *
 * Características:
 *   - Fire-and-forget: nunca bloqueia a resposta da rota chamadora. Falha de
 *     rede vira `console.warn` e segue. O receiver lá no Pedido também
 *     responde 202 imediatamente.
 *   - Timeout curto (2s) — degradação rápida quando o Pedido está fora do ar.
 *   - Auth S2S via `x-internal-key` (skill `seguranca/autenticacao-s2s`).
 *   - Para entidades de catálogo global (NCM/Moeda/Unidade) o `idOrganizacao`
 *     pode ser null/vazio: nesse caso o receiver faz fan-out por todas as
 *     organizações que usam aquele código (não há header obrigatório).
 *
 * REGRA 03 DDD: variáveis TS internas em camelCase (idOrganizacao, etc.).
 */

export type TipoEntidadeNotificada =
  | 'empresa'
  | 'ope'
  | 'ncm'
  | 'moeda'
  | 'unidade'

const TIMEOUT_MS = 2_000

/**
 * Envia POST para /api/v1/internal/cadastros-changed do serviço Pedido.
 *
 * @param tipo            Tipo da entidade modificada.
 * @param identificador   SUID (empresa/ope) ou código (ncm/moeda/unidade).
 * @param idOrganizacao   Pode ser vazio para catálogo global (NCM/Moeda/Unidade).
 *                        Para Empresa/OPE é obrigatório (entidades por org).
 */
export async function notificarMudancaEntidade(
  tipo: TipoEntidadeNotificada,
  identificador: string,
  idOrganizacao: string,
): Promise<void> {
  const url = process.env.PEDIDO_SERVICE_URL ?? 'http://localhost:8030'
  const chaveInterna = process.env.INTERNAL_SERVICE_KEY ?? ''

  if (!chaveInterna) {
    console.warn('[notifyPedido] INTERNAL_SERVICE_KEY ausente — webhook nao enviado')
    return
  }
  if (identificador.length === 0) {
    console.warn(`[notifyPedido] identificador vazio para tipo=${tipo} — abortado`)
    return
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type':  'application/json',
      'x-internal-key': chaveInterna,
    }
    if (idOrganizacao.length > 0) {
      headers['x-id-organizacao'] = idOrganizacao
    }

    const resposta = await fetch(`${url}/api/v1/internal/cadastros-changed`, {
      method:  'POST',
      headers,
      body:    JSON.stringify({ tipo_entidade: tipo, identificador }),
      signal:  AbortSignal.timeout(TIMEOUT_MS),
    })

    if (!resposta.ok) {
      console.warn(
        `[notifyPedido] Pedido respondeu ${resposta.status} para ${tipo}=${identificador}`,
      )
    }
  } catch (err) {
    // Fire-and-forget: log e segue. O receiver tem que ser robusto a perda
    // ocasional — a próxima notificação re-sincroniza.
    console.warn(
      `[notifyPedido] Falha ao notificar Pedido (${tipo}=${identificador}):`,
      err instanceof Error ? err.message : err,
    )
  }
}
