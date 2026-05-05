/**
 * montar-detalhe-acao-historico-log
 *
 * Gera o texto humano final que vai no campo `detalhe_acao_historico_log` da
 * tabela `historico_log`, comparando os snapshots `estado_anterior_historico_log`
 * e `estado_posterior_historico_log` (ambos `jsonb`).
 *
 * Substitui as concatenações ad-hoc espalhadas em rotas (PATCH workspace,
 * PATCH organizacao, PATCH patente etc.) por uma fonte única de geração de
 * texto, evitando divergência entre módulos.
 *
 * Pipeline:
 *  1. `compararEstadosHistoricoLog(antes, depois, tipo_recurso)` →
 *      lista de strings "Label: 'X' → 'Y'"
 *  2. `montarDetalheAcaoHistoricoLog(verbo, tipo_recurso, nome_recurso, diff)`
 *      → string final pronta pra gravar no banco
 *
 * Ver: regras-de-negocio.md §2.4 (Status do evento) e §4 (Estado anterior/posterior)
 */

import { rotularCampoHistoricoLog } from '@nucleo/labels-campos-historico-log'
import { formatarValorHistoricoLog }  from '@nucleo/formatar-valor-historico-log'

/**
 * Campos de auditoria que NUNCA aparecem no diff (timestamps de criação,
 * atualização e exclusão geridos pelo Prisma — não são "alterações de domínio").
 */
const CAMPOS_HISTORICO_LOG_NAO_DIFFAVEIS = new Set<string>([
  // prefixos comuns de timestamps tratados em runtime via campo.startsWith('data_')
])

/**
 * Compara `estado_anterior_historico_log` com `estado_posterior_historico_log`
 * e devolve uma linha `Label: "X" → "Y"` para cada campo cujo valor mudou.
 *
 * Campos com prefixo `data_` (timestamps) são ignorados — não são alterações
 * de domínio relevantes pro usuário final.
 *
 * @param estado_anterior_historico_log    — snapshot ANTES (pode ser null em CREATE)
 * @param estado_posterior_historico_log   — snapshot DEPOIS (pode ser null em DELETE)
 * @param tipo_recurso_historico_log       — PascalCase do recurso (Workspace, Usuario, ...)
 */
export function compararEstadosHistoricoLog(
  estado_anterior_historico_log:  Record<string, unknown> | null | undefined,
  estado_posterior_historico_log: Record<string, unknown> | null | undefined,
  tipo_recurso_historico_log: string,
): string[] {
  if (!estado_anterior_historico_log || !estado_posterior_historico_log) return []

  const linhas: string[] = []
  for (const [nome_campo, valor_novo] of Object.entries(estado_posterior_historico_log)) {
    if (CAMPOS_HISTORICO_LOG_NAO_DIFFAVEIS.has(nome_campo)) continue
    if (nome_campo.startsWith('data_')) continue

    const valor_antigo = estado_anterior_historico_log[nome_campo]
    if (JSON.stringify(valor_antigo) === JSON.stringify(valor_novo)) continue

    const label = rotularCampoHistoricoLog(tipo_recurso_historico_log, nome_campo)
    linhas.push(
      `${label}: "${formatarValorHistoricoLog(valor_antigo, nome_campo)}" → "${formatarValorHistoricoLog(valor_novo, nome_campo)}"`
    )
  }
  return linhas
}

/**
 * Monta o texto final pra gravar em `detalhe_acao_historico_log`.
 *
 * Formato:
 *   - sem diff:  `${verbo} ${recurso} "${nome_recurso}"`
 *   - com diff:  `${verbo} ${recurso} "${nome_recurso}" — ${diff[0]}; ${diff[1]}; ...`
 *
 * @param verbo                       — particípio passado em PT-BR ('Criou', 'Atualizou', 'Excluiu')
 * @param tipo_recurso_historico_log  — PascalCase do recurso (vai pro texto em lowercase)
 * @param nome_recurso                — nome do registro (ex: 'CDE Importador')
 * @param diff_campos                 — saída de `compararEstadosHistoricoLog`
 */
export function montarDetalheAcaoHistoricoLog(
  verbo: 'Criou' | 'Atualizou' | 'Excluiu',
  tipo_recurso_historico_log: string,
  nome_recurso: string,
  diff_campos: string[],
): string {
  const cabecalho = `${verbo} ${tipo_recurso_historico_log.toLowerCase()} "${nome_recurso}"`
  return diff_campos.length === 0
    ? cabecalho
    : `${cabecalho} — ${diff_campos.join('; ')}`
}
