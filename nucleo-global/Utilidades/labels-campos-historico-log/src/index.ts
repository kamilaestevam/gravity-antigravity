/**
 * labels-campos-historico-log
 *
 * Mapa canonical do label PT-BR para cada campo de cada `tipo_recurso_historico_log`
 * exibido na coluna "Detalhes" da tela `/workspace/historico-organizacao`.
 *
 * É consumido pelo módulo `montar-detalhe-acao-historico-log` para gerar o texto
 * humano de `detalhe_acao_historico_log` automaticamente a partir dos snapshots
 * `estado_anterior_historico_log` e `estado_posterior_historico_log` (jsonb).
 *
 * Quando um campo novo for adicionado em algum recurso auditado, atualizar o
 * mapa abaixo. Campo ausente cai no fallback (devolve o nome cru do campo) —
 * comportamento intencional para não quebrar UI quando schema evolui antes do mapa.
 *
 * Ver: regras-de-negocio.md §3 (Visibilidade do Histórico)
 *      ddd-nomenclatura/SKILL.md REGRA 9 (Label canonical em tela)
 */

/**
 * Estrutura: `LABELS_CAMPOS_HISTORICO_LOG[tipo_recurso_historico_log][nome_campo] = label`
 */
export const LABELS_CAMPOS_HISTORICO_LOG: Record<string, Record<string, string>> = {
  Workspace: {
    nome_workspace:        'Nome',
    cnpj_workspace:        'CNPJ',
    status_workspace:      'Status',
    subdominio_workspace:  'Subdomínio',
  },
  Organizacao: {
    nome_organizacao:        'Nome',
    cnpj_organizacao:        'CNPJ',
    status_organizacao:      'Status',
    subdominio_organizacao:  'Subdomínio',
  },
  Usuario: {
    nome_usuario:                    'Nome',
    email_usuario:                   'E-mail',
    tipo_usuario:                    'Patente',
    acesso_workspaces_futuros:       'Auto-vínculo a workspaces futuros',
    id_workspace_preferido_usuario:  'Workspace preferido',
  },
  AssinaturaProdutoGravity: {
    status_assinatura_produto_gravity: 'Status',
    valor_assinatura_produto_gravity:  'Valor',
  },
  // Adicionar demais recursos auditados conforme necessário (Pedido, NotaFiscal, etc.)
}

/**
 * Devolve o label canonical PT-BR de um campo dentro do contexto de
 * `historico_log`. Fallback: o próprio nome do campo (quando recurso ou campo
 * não estão mapeados). Mandamento 08 — falha visível (vê o nome técnico) em
 * vez de silenciar com string vazia.
 */
export function rotularCampoHistoricoLog(
  tipo_recurso_historico_log: string,
  nome_campo: string,
): string {
  return LABELS_CAMPOS_HISTORICO_LOG[tipo_recurso_historico_log]?.[nome_campo] ?? nome_campo
}
