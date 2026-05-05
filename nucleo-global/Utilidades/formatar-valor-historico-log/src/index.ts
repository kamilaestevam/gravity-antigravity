/**
 * formatar-valor-historico-log
 *
 * Converte um valor cru (vindo de `estado_anterior_historico_log` ou
 * `estado_posterior_historico_log`, ambos `jsonb`) em string legível em PT-BR
 * para exibição na coluna "Detalhes" da tela `/workspace/historico-organizacao`.
 *
 * Cobertura:
 *  - `null`/`undefined`        → '—'
 *  - `boolean`                 → 'Sim' | 'Não'
 *  - `Date`                    → 'dd/mm/aaaa hh:mm' (locale pt-BR)
 *  - `string` em campo de enum → label PT-BR (LABELS_VALORES_*)
 *  - `object`                  → JSON.stringify
 *  - demais                    → String(valor)
 *
 * Ver: ddd-nomenclatura/SKILL.md REGRA 7 (enum values em UPPER_SNAKE EN, label PT-BR via mapa)
 *      ddd-nomenclatura/SKILL.md REGRA 9 (Label canonical em tela)
 */

/**
 * Labels PT-BR dos valores do enum `tipo_usuario`.
 * Valores em UPPER_SNAKE EN (REGRA 7) — chaves do mapa = constantes do banco.
 */
const LABELS_VALORES_TIPO_USUARIO: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN:       'Admin',
  MASTER:      'Master',
  PADRAO:      'Padrão',
  FORNECEDOR:  'Fornecedor',
}

/** Labels PT-BR dos valores do campo `status_workspace`. */
const LABELS_VALORES_STATUS_WORKSPACE: Record<string, string> = {
  ATIVO:   'Ativo',
  INATIVO: 'Inativo',
}

/** Labels PT-BR dos valores do campo `status_organizacao`. */
const LABELS_VALORES_STATUS_ORGANIZACAO: Record<string, string> = {
  ATIVO:                   'Ativo',
  SUSPENSO:                'Suspenso',
  CANCELADO:               'Cancelado',
  CONFIGURACAO_PENDENTE:   'Configuração pendente',
}

/** Labels PT-BR dos valores do campo `status_assinatura_produto_gravity`. */
const LABELS_VALORES_STATUS_ASSINATURA_PRODUTO_GRAVITY: Record<string, string> = {
  ATIVA:      'Ativa',
  EM_TESTE:   'Em teste',
  SUSPENSA:   'Suspensa',
  INATIVA:    'Inativa',
}

/**
 * Mapa central que relaciona `nome_campo` ao mapa de labels dos valores daquele
 * campo. Acessado pelo `formatarValorHistoricoLog` quando recebe um valor string
 * acompanhado do nome do campo.
 */
const LABELS_VALORES_POR_CAMPO_HISTORICO_LOG: Record<string, Record<string, string>> = {
  tipo_usuario:                       LABELS_VALORES_TIPO_USUARIO,
  status_workspace:                   LABELS_VALORES_STATUS_WORKSPACE,
  status_organizacao:                 LABELS_VALORES_STATUS_ORGANIZACAO,
  status_assinatura_produto_gravity:  LABELS_VALORES_STATUS_ASSINATURA_PRODUTO_GRAVITY,
}

/**
 * Formata um valor para exibição no campo `detalhe_acao_historico_log`.
 *
 * @param valor       — valor cru lido de `estado_anterior_historico_log` ou
 *                      `estado_posterior_historico_log` (jsonb)
 * @param nome_campo  — nome do campo de origem; usado apenas quando o valor é
 *                      string e o campo possui mapa de labels (enum)
 */
export function formatarValorHistoricoLog(valor: unknown, nome_campo?: string): string {
  if (valor === null || valor === undefined) return '—'
  if (typeof valor === 'boolean') return valor ? 'Sim' : 'Não'
  if (valor instanceof Date) {
    return valor.toLocaleString('pt-BR', {
      day:    '2-digit',
      month:  '2-digit',
      year:   'numeric',
      hour:   '2-digit',
      minute: '2-digit',
    })
  }
  if (typeof valor === 'string' && nome_campo) {
    const labelsDoCampo = LABELS_VALORES_POR_CAMPO_HISTORICO_LOG[nome_campo]
    if (labelsDoCampo?.[valor]) return labelsDoCampo[valor]
  }
  if (typeof valor === 'object') return JSON.stringify(valor)
  return String(valor)
}
