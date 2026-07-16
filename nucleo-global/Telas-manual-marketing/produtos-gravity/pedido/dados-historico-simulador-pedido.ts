/**
 * Mock de logs do Histórico — produto Pedido (simulador marketing).
 * Paridade de campos com `historico_log` e eventos do manual university.
 */

export type HistoricoLogSimuladorPedido = {
  id_historico_log: string
  data_criacao_historico_log: string
  acao_historico_log: string
  detalhe_acao_historico_log: string | null
  tipo_recurso_historico_log: string
  id_recurso_historico_log: string | null
  nome_ator_historico_log: string | null
  tipo_ator_historico_log: string | null
  status_historico_log: string | null
  modulo_historico_log: string | null
  metadata_ator_historico_log: { endpoint?: string } | null
  email_ator_historico_log: string | null
}

const ACAO_PARTICIPIO: Record<string, string> = {
  CRIAR: 'Criou',
  ATUALIZAR: 'Atualizou',
  EXCLUIR: 'Excluiu',
  DUPLICAR: 'Duplicou',
  TRANSFERIR: 'Transferiu',
  CONSOLIDAR: 'Consolidou',
  EDITAR_EM_MASSA: 'Editou em massa',
  REVERTER_TRANSFERENCIA: 'Reverteu transferência',
  ALTERAR_STATUS: 'Alterou status',
  EXCLUIR_ITENS: 'Excluiu itens',
  EXPORTAR: 'Exportou',
}

function humanizar(codigo: string): string {
  return codigo
    .split('_')
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1).toLowerCase() : ''))
    .join(' ')
}

export function rotuloAcaoHistoricoSimuladorPedido(codigo: string | null | undefined): string {
  if (!codigo) return '—'
  return ACAO_PARTICIPIO[codigo] ?? humanizar(codigo)
}

export function formatarDataHistoricoSimuladorPedido(iso: string): string {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function diasAtras(dias: number, hora = 10, minuto = 0): string {
  const d = new Date()
  d.setDate(d.getDate() - dias)
  d.setHours(hora, minuto, 0, 0)
  return d.toISOString()
}

function log(
  id: string,
  dias: number,
  hora: number,
  acao: string,
  detalhe: string,
  recurso: string,
  idRecurso: string,
  endpoint: string,
  status: 'SUCESSO' | 'FALHA' | 'PARCIAL' = 'SUCESSO',
  nome = 'Daniel Martins',
  email = 'daniel@gravity.com.br',
): HistoricoLogSimuladorPedido {
  return {
    id_historico_log: id,
    data_criacao_historico_log: diasAtras(dias, hora, 12),
    acao_historico_log: acao,
    detalhe_acao_historico_log: detalhe,
    tipo_recurso_historico_log: recurso,
    id_recurso_historico_log: idRecurso,
    nome_ator_historico_log: nome,
    tipo_ator_historico_log: 'usuario',
    status_historico_log: status,
    modulo_historico_log: 'pedido',
    metadata_ator_historico_log: { endpoint },
    email_ator_historico_log: email,
  }
}

/** Logs mock filtrados ao produto Pedido — ordenados do mais recente ao mais antigo. */
export const LOGS_HISTORICO_SIMULADOR_PEDIDO: HistoricoLogSimuladorPedido[] = [
  log('hl-001', 0, 16, 'ATUALIZAR', 'Status alterado para Em Andamento — PO-MAT-2026-00482', 'pedido', 'ped_mat_482', 'PATCH /api/v1/pedidos/ped_mat_482/status'),
  log('hl-002', 0, 14, 'CRIAR', 'Novo pedido PO-FIL-2026-00118 criado (Importação)', 'pedido', 'ped_fil_118', 'POST /api/v1/pedidos'),
  log('hl-003', 1, 11, 'TRANSFERIR', 'Transferiu 120 un. do item 3 — PO-MAT-2026-00471 → Filial SC', 'pedido', 'ped_mat_471', 'POST /api/v1/pedidos/ped_mat_471/transferir'),
  log('hl-004', 1, 9, 'EDITAR_EM_MASSA', '12 pedidos — campo Incoterm atualizado para FOB', 'pedido', 'lote_12', 'POST /api/v1/pedidos/edicao-massa'),
  log('hl-005', 2, 17, 'CONSOLIDAR', 'PO-CONS-2026-00007 — uniu PO-MAT-2026-00455 e PO-MAT-2026-00458', 'pedido', 'ped_cons_7', 'POST /api/v1/pedidos/consolidar'),
  log('hl-006', 2, 15, 'DUPLICAR', 'Duplicou PO-EXP-2026-00203 com 4 itens', 'pedido', 'ped_exp_203', 'POST /api/v1/pedidos/ped_exp_203/duplicar'),
  log('hl-007', 3, 10, 'CRIAR', 'Coluna personalizada "Prazo carga" criada', 'config_coluna', 'col_prazo_carga', 'POST /api/v1/pedidos/config/colunas-personalizadas'),
  log('hl-008', 3, 8, 'ATUALIZAR', 'Salvou preferências de cards da Lista (período 30 dias)', 'config_lista', 'cfg_cards', 'PUT /api/v1/pedidos/config/cards'),
  log('hl-009', 4, 16, 'EXCLUIR_ITENS', 'Removeu 2 itens selecionados — PO-MAT-2026-00440', 'pedido_item', 'ped_mat_440', 'DELETE /api/v1/pedidos/ped_mat_440/itens'),
  log('hl-010', 5, 11, 'CRIAR', 'Preview de transferência — 3 pedidos, destino Filial SC', 'pedido', 'preview_trf', 'POST /api/v1/pedidos/transferir/preview'),
  log('hl-011', 5, 9, 'EXPORTAR', 'Exportação Excel — 48 pedidos filtrados (painel Logística)', 'pedido', 'export_xlsx', 'POST /api/v1/pedidos/exportar'),
  log('hl-012', 6, 14, 'ATUALIZAR', 'Editou célula Porto de Origem — PO-FIL-2026-00089', 'pedido', 'ped_fil_89', 'PATCH /api/v1/pedidos/ped_fil_89'),
  log('hl-013', 7, 10, 'ALTERAR_STATUS', 'Status em lote — 8 pedidos para Aprovado', 'pedido', 'lote_status', 'PATCH /api/v1/pedidos/status-lote'),
  log('hl-014', 8, 15, 'CRIAR', 'Painel "Financeiro" criado com filtros salvos', 'config_painel', 'painel_fin', 'POST /api/v1/pedidos/config/paineis'),
  log('hl-015', 9, 11, 'ATUALIZAR', 'Reordenou colunas personalizadas na Lista', 'config_coluna', 'colunas_ordem', 'PUT /api/v1/pedidos/config/colunas-personalizadas/ordem'),
  log('hl-016', 10, 9, 'CRIAR', 'Smart Import — confirmou importação de 15 linhas', 'pedido', 'import_15', 'POST /api/v1/pedidos/importar/confirmar'),
  log('hl-017', 11, 16, 'REVERTER_TRANSFERENCIA', 'Reverteu transferência do item 2 — PO-MAT-2026-00412', 'pedido', 'ped_mat_412', 'POST /api/v1/pedidos/ped_mat_412/reverter-transferencia'),
  log('hl-018', 12, 13, 'ATUALIZAR', 'Salvou layout do Dashboard (widget Status por workspace)', 'config_dashboard', 'dash_layout', 'PUT /api/v1/pedidos/config/dashboard'),
  log('hl-019', 14, 10, 'EXCLUIR', 'Excluiu pedido PO-MAT-2026-00398 (hard delete)', 'pedido', 'ped_mat_398', 'DELETE /api/v1/pedidos/ped_mat_398'),
  log('hl-020', 15, 8, 'ATUALIZAR', 'Editou definição da coluna "Obs. logística"', 'config_coluna', 'col_obs_log', 'PUT /api/v1/pedidos/config/colunas-personalizadas/col_obs_log'),
  log('hl-021', 18, 14, 'CRIAR', 'Novo item adicionado ao pedido PO-EXP-2026-00176', 'pedido_item', 'ped_exp_176', 'POST /api/v1/pedidos/ped_exp_176/itens'),
  log('hl-022', 20, 11, 'ATUALIZAR', 'Preferências do card Kanban — campos visíveis atualizados', 'config_kanban', 'kanban_card', 'PUT /api/v1/pedidos/config/kanban/card'),
  log('hl-023', 22, 9, 'CRIAR', 'Preview de consolidação — 2 pedidos candidatos', 'pedido', 'preview_cons', 'POST /api/v1/pedidos/consolidar/preview'),
  log('hl-024', 25, 16, 'ATUALIZAR', 'Numeração automática — prefixo MAT atualizado', 'config_numeracao', 'num_mat', 'PUT /api/v1/pedidos/config/numeracao'),
  log('hl-025', 28, 10, 'CRIAR', 'Novo pedido PO-MAT-2026-00301 criado via API Cockpit', 'pedido', 'ped_mat_301', 'POST /api/v1/pedidos', 'SUCESSO', 'API Cockpit', 'cockpit@gravity.internal'),
]
