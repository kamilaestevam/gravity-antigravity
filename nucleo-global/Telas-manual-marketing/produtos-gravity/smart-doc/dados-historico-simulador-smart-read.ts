/**
 * Mock de logs do Histórico — produto Smart Docs (simulador marketing).
 * Paridade com `historico_log` e eventos do manual university §08 Histórico.
 */

export type HistoricoLogSimuladorSmartRead = {
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
  EXPORTAR: 'Exportou',
}

function humanizar(codigo: string): string {
  return codigo
    .split('_')
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1).toLowerCase() : ''))
    .join(' ')
}

export function rotuloAcaoHistoricoSimuladorSmartRead(codigo: string | null | undefined): string {
  if (!codigo) return '—'
  return ACAO_PARTICIPIO[codigo] ?? humanizar(codigo)
}

export function formatarDataHistoricoSimuladorSmartRead(iso: string): string {
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
): HistoricoLogSimuladorSmartRead {
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
    modulo_historico_log: 'smart-read',
    metadata_ator_historico_log: { endpoint },
    email_ator_historico_log: email,
  }
}

/** Logs mock filtrados ao produto Smart Docs — ordenados do mais recente ao mais antigo. */
export const LOGS_HISTORICO_SIMULADOR_SMART_READ: HistoricoLogSimuladorSmartRead[] = [
  log('sr-hl-001', 0, 16, 'ATUALIZAR', 'Conferência — campo NCM alterado na leitura Leitura 597', 'leitura', 'lr_597', 'PATCH /api/v1/smart-read/leituras/lr_597/conferencia'),
  log('sr-hl-002', 0, 14, 'CRIAR', 'Nova leitura Leitura 612 iniciada (Invoice + Packing List)', 'leitura', 'lr_612', 'POST /api/v1/smart-read/leituras'),
  log('sr-hl-003', 1, 11, 'ATUALIZAR', 'Status da leitura Leitura 477 → Concluída', 'leitura', 'lr_477', 'PATCH /api/v1/smart-read/leituras/lr_477/status'),
  log('sr-hl-004', 1, 9, 'EXCLUIR', 'Leitura Leitura 301 excluída da Lista', 'leitura', 'lr_301', 'DELETE /api/v1/smart-read/leituras/lr_301'),
  log('sr-hl-005', 2, 17, 'CRIAR', 'Coluna personalizada "Prazo entrega" criada em Configurações', 'config_coluna', 'col_prazo', 'POST /api/v1/smart-read/config/colunas-personalizadas'),
  log('sr-hl-006', 2, 15, 'ATUALIZAR', 'Salvou cards ativos e período de comparação (30 dias)', 'config_cards', 'cfg_cards', 'PUT /api/v1/smart-read/config/cards'),
  log('sr-hl-007', 3, 10, 'ATUALIZAR', 'Reordenou colunas personalizadas na Lista', 'config_coluna', 'col_ordem', 'PUT /api/v1/smart-read/config/colunas-personalizadas/ordem'),
  log('sr-hl-008', 3, 8, 'CRIAR', 'Leitura via API Cockpit — documento Bill of Lading anexado', 'leitura', 'lr_api_88', 'POST /api/v1/smart-read/leituras', 'SUCESSO', 'API Cockpit', 'cockpit@gravity.internal'),
  log('sr-hl-009', 4, 16, 'ATUALIZAR', 'Conferência — sessão Itens marcada como conferida', 'leitura', 'lr_520', 'PATCH /api/v1/smart-read/leituras/lr_520/conferencia'),
  log('sr-hl-010', 5, 11, 'EXPORTAR', 'Exportação Excel — 21 leituras visíveis na Lista', 'leitura', 'export_xlsx', 'POST /api/v1/smart-read/leituras/exportar'),
  log('sr-hl-011', 5, 9, 'ATUALIZAR', 'Densidade da tabela alterada para Compacta', 'config_tabela', 'cfg_tabela', 'PUT /api/v1/smart-read/config/tabelas'),
  log('sr-hl-012', 6, 14, 'CRIAR', 'Nova coluna checkbox "Conferido operador" salva', 'config_coluna', 'col_conf_op', 'POST /api/v1/smart-read/config/colunas-personalizadas'),
  log('sr-hl-013', 7, 10, 'ATUALIZAR', 'Campo percentual ajustado na conferência — Leitura 445', 'leitura', 'lr_445', 'PATCH /api/v1/smart-read/leituras/lr_445/conferencia'),
  log('sr-hl-014', 8, 15, 'EXCLUIR', 'Documento anexo removido do passo 1 — Leitura 388', 'leitura_anexo', 'anx_388', 'DELETE /api/v1/smart-read/leituras/lr_388/anexos/anx_388'),
  log('sr-hl-015', 9, 11, 'CRIAR', 'Leitura Leitura 701 criada com 3 arquivos PDF', 'leitura', 'lr_701', 'POST /api/v1/smart-read/leituras'),
  log('sr-hl-016', 10, 9, 'ATUALIZAR', 'Visibilidade da coluna "Tipo documento" alterada', 'config_coluna', 'col_tipo_doc', 'PUT /api/v1/smart-read/config/colunas-personalizadas/col_tipo_doc'),
  log('sr-hl-017', 11, 16, 'ATUALIZAR', 'Conferência — lista suspensa "Incoterm" atualizada', 'leitura', 'lr_290', 'PATCH /api/v1/smart-read/leituras/lr_290/conferencia'),
  log('sr-hl-018', 12, 13, 'EXPORTAR', 'Exportação CSV — filtros ativos na Lista', 'leitura', 'export_csv', 'POST /api/v1/smart-read/leituras/exportar'),
  log('sr-hl-019', 14, 10, 'CRIAR', 'Painel "Operacional" salvo na Lista', 'config_painel', 'painel_op', 'POST /api/v1/smart-read/config/paineis'),
  log('sr-hl-020', 15, 8, 'ATUALIZAR', 'Linhas por página alteradas para 50', 'config_tabela', 'cfg_linhas', 'PUT /api/v1/smart-read/config/tabelas'),
  log('sr-hl-021', 18, 14, 'ATUALIZAR', 'Checklist de conferência — item 4 marcado', 'leitura', 'lr_155', 'PATCH /api/v1/smart-read/leituras/lr_155/checklist'),
  log('sr-hl-022', 20, 11, 'CRIAR', 'Leitura retomada após interrupção — Leitura 633', 'leitura', 'lr_633', 'POST /api/v1/smart-read/leituras/lr_633/retomar'),
  log('sr-hl-023', 22, 9, 'EXCLUIR', 'Leitura Leitura 199 excluída em lote (2 selecionadas)', 'leitura', 'lr_lote_2', 'DELETE /api/v1/smart-read/leituras/lote'),
  log('sr-hl-024', 25, 16, 'ATUALIZAR', 'Card "Taxa de Sucesso" adicionado aos ativos', 'config_cards', 'card_taxa', 'PUT /api/v1/smart-read/config/cards'),
  log('sr-hl-025', 28, 10, 'CRIAR', 'Nova leitura via integração webhook — documento fiscal', 'leitura', 'lr_wh_42', 'POST /api/v1/smart-read/leituras/webhook'),
]
