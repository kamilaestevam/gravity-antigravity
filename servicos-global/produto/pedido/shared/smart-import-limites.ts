/**
 * smart-import-limites.ts — Limites do fluxo Smart Import (SSOT cross-tier)
 *
 * Importado por server (validação), client (UI) e geração do template Excel.
 */

/** Máximo de linhas de dados aceitas por importação (após parse e filtros). */
export const LIMITE_LINHAS_IMPORTACAO = 1000

/**
 * Limite do body JSON no Express (POST /confirmar).
 * 1000 linhas × dados mapeados ultrapassa o default 2mb do Express.
 * Alinhado ao teto de arquivo (10MB) — suficiente para 1000 linhas no /confirmar.
 */
export const LIMITE_BODY_JSON_IMPORTACAO_MB = 10
export const LIMITE_BODY_JSON_IMPORTACAO = `${LIMITE_BODY_JSON_IMPORTACAO_MB}mb` as const

/** Primeira linha de dados no template Gravity (linhas 1–2 = cabeçalhos). */
export const PRIMEIRA_LINHA_DADOS_TEMPLATE = 3

/** Última linha de dados no template Excel (= cabeçalhos + limite). */
export const ULTIMA_LINHA_DADOS_TEMPLATE =
  PRIMEIRA_LINHA_DADOS_TEMPLATE + LIMITE_LINHAS_IMPORTACAO - 1

export const CODIGO_ERRO_LIMITE_LINHAS = 'LIMITE_LINHAS_EXCEDIDO' as const

export function mensagemLimiteLinhasExcedido(totalLinhas: number): string {
  return (
    `A planilha tem ${totalLinhas} linhas de dados. ` +
    `O limite maximo e ${LIMITE_LINHAS_IMPORTACAO} linhas por importacao. ` +
    `Divida o arquivo em lotes menores e tente novamente.`
  )
}
