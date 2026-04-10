/**
 * gabiInsightsService.ts — Motor de Insights da Gabi para o Dashboard Pedido
 *
 * Fase 1: Templates por role — gera insights ranqueados com base em KPIs + role do usuário
 * Fase 2: Integra scores de comportamento para re-ranquear (via behaviorTrackingService)
 * Fase 3: Enriquece texto via LLM (gabiLlmInsightsService) com fallback determinístico
 *
 * Regras:
 *  - Sempre retorna no mínimo 2 insights
 *  - Nunca expõe dados de outro tenant
 *  - Fallback seguro se LLM falhar ou exceder quota
 */

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface KpiSnapshot {
  total_pedidos: number
  pedidos_abertos: number
  pedidos_em_andamento: number
  pedidos_atrasados: number
  pedidos_sem_exportador: number
  pedidos_cancelados: number
  pedidos_consolidados: number
  pedidos_importacao: number
  pedidos_exportacao: number
  qtd_saldo_total: number
  qtd_pronta_total: number
  qtd_transferida_total: number
  qtd_inicial_total: number
  valor_total: number
  valor_total_brl: number
  valor_itens_total: number
  ticket_medio: number
  taxa_atraso: number
  taxa_transferencia: number
  // Completude documental
  pedidos_sem_incoterm: number
  pedidos_sem_fabricante: number
  pedidos_sem_proforma: number
  pedidos_sem_invoice: number
  pedidos_sem_ref_imp: number
  // Moedas e logística
  moedas_distintas: number
  peso_bruto_total: number
  cubagem_total: number
  // Itens
  itens_sem_cobertura: number
  qtd_cancelada_total: number
}

export type UserRole = 'operador' | 'gerente' | 'diretor' | 'admin' | 'default'

export interface GabiInsight {
  id: string
  variante: 'default' | 'warn'
  tag: string
  /** Texto em linguagem natural — substituído pelo LLM na Fase 3 */
  texto: string
  stat?: { label: string; valor: string }
  textoLink?: string
  /** Rota para navegação — inclui filtros pré-aplicados */
  rota?: string
  /** Score de relevância para ranking (maior = mais relevante) */
  score: number
}

// ── Pesos de relevância por role ──────────────────────────────────────────────
// Cada role tem um mapa: insightId → peso base
// Fase 2: scores de comportamento multiplicam esses pesos

const ROLE_WEIGHTS: Record<UserRole, Record<string, number>> = {
  operador: {
    atrasados:        100,
    sem_exportador:    90,
    qtd_pronta:        80,
    abertos:           70,
    em_andamento:      65,
    saldo_itens:       55,
    volume_geral:      45,
    cancelados:        60,
    financeiro:        20,
    financeiro_itens:  18,
    consolidados:      40,
    distribuicao:      10,
    tendencia:         15,
    sem_incoterm:      85,
    sem_fabricante:    80,
    sem_documentos:    70,
    exposicao_cambial: 30,
    logistica:         50,
    qtd_cancelada:     75,
    multimoeda:        20,
  },
  gerente: {
    atrasados:         80,
    financeiro:       100,
    financeiro_itens:  85,
    sem_exportador:    70,
    abertos:           60,
    em_andamento:      55,
    qtd_pronta:        50,
    consolidados:      60,
    distribuicao:      40,
    cancelados:        65,
    volume_geral:      35,
    saldo_itens:       40,
    tendencia:         55,
    sem_incoterm:      70,
    sem_fabricante:    65,
    sem_documentos:    60,
    exposicao_cambial: 90,
    logistica:         60,
    qtd_cancelada:     70,
    multimoeda:        80,
  },
  diretor: {
    financeiro:       100,
    financeiro_itens:  90,
    distribuicao:      90,
    tendencia:         85,
    consolidados:      75,
    atrasados:         60,
    abertos:           40,
    em_andamento:      35,
    qtd_pronta:        30,
    sem_exportador:    50,
    volume_geral:      50,
    saldo_itens:       30,
    cancelados:        45,
    sem_incoterm:      50,
    sem_fabricante:    45,
    sem_documentos:    40,
    exposicao_cambial: 95,
    logistica:         70,
    qtd_cancelada:     50,
    multimoeda:        85,
  },
  admin: {
    atrasados:        100,
    financeiro:       100,
    financeiro_itens: 100,
    distribuicao:     100,
    sem_exportador:   100,
    abertos:          100,
    em_andamento:     100,
    qtd_pronta:       100,
    consolidados:     100,
    cancelados:       100,
    volume_geral:     100,
    saldo_itens:      100,
    tendencia:        100,
    sem_incoterm:     100,
    sem_fabricante:   100,
    sem_documentos:   100,
    exposicao_cambial:100,
    logistica:        100,
    qtd_cancelada:    100,
    multimoeda:       100,
  },
  default: {
    atrasados:         80,
    financeiro:        60,
    financeiro_itens:  55,
    sem_exportador:    70,
    abertos:           70,
    em_andamento:      60,
    qtd_pronta:        50,
    consolidados:      50,
    distribuicao:      40,
    cancelados:        50,
    volume_geral:      40,
    saldo_itens:       40,
    tendencia:         40,
    sem_incoterm:      70,
    sem_fabricante:    65,
    sem_documentos:    60,
    exposicao_cambial: 70,
    logistica:         55,
    qtd_cancelada:     65,
    multimoeda:        60,
  },
}

// ── Formatadores ──────────────────────────────────────────────────────────────

const fmtNum = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n))
const fmtBRL = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)
const fmtPct = (n: number) => `${n.toFixed(1)}%`

// ── Candidatos de descoberta de funcionalidade ────────────────────────────────
// Exibidos apenas para usuários que ainda não usaram a funcionalidade.
// IDs prefixados com feat_ para separação na lógica de interleaving.

function buildFeatureCandidates(
  kpis: KpiSnapshot,
  behaviorScores: Record<string, number>,
): GabiInsight[] {
  const features: GabiInsight[] = []
  const used = (id: string) => (behaviorScores[id] ?? 0) > 0

  // Transferência — só mostrar se nunca transferiu E tem pedidos abertos
  if (!used('feat_transferir') && kpis.pedidos_abertos > 0 && kpis.qtd_transferida_total === 0) {
    features.push({
      id: 'feat_transferir',
      variante: 'default',
      tag: 'Sabia que você pode? · Transferência',
      texto: `Você tem ${kpis.pedidos_abertos} pedido${kpis.pedidos_abertos > 1 ? 's' : ''} em aberto. É possível transferir itens para separar volumes ou originar novos pedidos derivados.`,
      stat: { label: 'Pedidos prontos para transferir', valor: fmtNum(kpis.pedidos_abertos) },
      textoLink: 'Ver pedidos',
      rota: '/pedidos/lista?status=aberto',
      score: 10,
    })
  }

  // Colunas customizadas — mostrar se nunca acessou configurações
  if (!used('feat_colunas')) {
    features.push({
      id: 'feat_colunas',
      variante: 'default',
      tag: 'Sabia que você pode? · Colunas',
      texto: 'Adicione colunas exclusivas ao seu produto. Campos personalizados aparecem na lista, nos filtros e no kanban.',
      textoLink: 'Criar coluna',
      rota: '/pedidos/configuracoes',
      score: 7,
    })
  }

  // Importação em massa — mostrar se nunca importou (proxy: poucos pedidos)
  if (!used('feat_importar') && kpis.total_pedidos < 20) {
    features.push({
      id: 'feat_importar',
      variante: 'default',
      tag: 'Sabia que você pode? · Importação',
      texto: 'Importe pedidos em massa via planilha Excel ou CSV. O sistema interpreta automaticamente os campos.',
      textoLink: 'Importar planilha',
      rota: '/pedidos/importar',
      score: 6,
    })
  }

  // Kanban — mostrar se nunca usou a view kanban
  if (!used('feat_kanban')) {
    features.push({
      id: 'feat_kanban',
      variante: 'default',
      tag: 'Sabia que você pode? · Kanban',
      texto: 'Visualize seus pedidos em formato Kanban. Arraste entre colunas para mudar status com um clique.',
      textoLink: 'Abrir Kanban',
      rota: '/pedidos/kanban',
      score: 5,
    })
  }

  // Dashboard personalizado — mostrar sempre como dica de alto valor
  if (!used('feat_dashboard_custom')) {
    features.push({
      id: 'feat_dashboard_custom',
      variante: 'default',
      tag: 'Sabia que você pode? · Dashboard',
      texto: 'Este dashboard é totalmente personalizável. Adicione métricas, mova seções e crie widgets com qualquer cruzamento de dados.',
      textoLink: 'Personalizar',
      rota: '/pedidos/dashboard',
      score: 4,
    })
  }

  return features
}

// ── Candidatos de insight (todos possíveis) ───────────────────────────────────

function buildCandidates(kpis: KpiSnapshot, role: UserRole): GabiInsight[] {
  const weights = ROLE_WEIGHTS[role] ?? ROLE_WEIGHTS.default
  const candidates: GabiInsight[] = []

  // ── ATRASADOS ─────────────────────────────────────────────────────────────
  if (kpis.pedidos_atrasados > 0) {
    candidates.push({
      id: 'atrasados',
      variante: 'warn',
      tag: 'Atenção · Pedidos Atrasados',
      texto: `${kpis.pedidos_atrasados} pedido${kpis.pedidos_atrasados > 1 ? 's' : ''} com prazo vencido. Ação imediata recomendada.`,
      stat: { label: 'Taxa de atraso', valor: fmtPct(kpis.taxa_atraso) },
      textoLink: 'Ver atrasados',
      rota: '/pedidos/lista?status=atrasado',
      score: weights.atrasados ?? 0,
    })
  }

  // ── SEM EXPORTADOR ────────────────────────────────────────────────────────
  if (kpis.pedidos_sem_exportador > 0) {
    candidates.push({
      id: 'sem_exportador',
      variante: 'warn',
      tag: 'Atenção · Sem Exportador',
      texto: `${kpis.pedidos_sem_exportador} pedido${kpis.pedidos_sem_exportador > 1 ? 's' : ''} sem exportador vinculado. Bloqueio de faturamento em risco.`,
      textoLink: 'Corrigir agora',
      rota: '/pedidos/lista?sem_exportador=true',
      score: weights.sem_exportador ?? 0,
    })
  }

  // ── ABERTOS / TRANSFERÊNCIA ────────────────────────────────────────────────
  if (kpis.pedidos_abertos > 0) {
    candidates.push({
      id: 'abertos',
      variante: 'default',
      tag: 'Oportunidade · Transferência',
      texto: `${kpis.pedidos_abertos} pedido${kpis.pedidos_abertos > 1 ? 's' : ''} em aberto prontos para iniciar transferência.`,
      stat: kpis.qtd_transferida_total > 0
        ? { label: 'Qtd. já transferida', valor: fmtNum(kpis.qtd_transferida_total) }
        : undefined,
      textoLink: 'Ver pedidos',
      rota: '/pedidos/lista?status=aberto',
      score: weights.abertos ?? 0,
    })
  }

  // ── QTD PRONTA / EMBARQUE ─────────────────────────────────────────────────
  if (kpis.qtd_pronta_total > 0) {
    candidates.push({
      id: 'qtd_pronta',
      variante: 'default',
      tag: 'Operação · Qtd. Pronta',
      texto: `${fmtNum(kpis.qtd_pronta_total)} unidades prontas disponíveis para embarque imediato.`,
      stat: kpis.qtd_saldo_total > 0
        ? { label: 'Saldo total disponível', valor: fmtNum(kpis.qtd_saldo_total) }
        : undefined,
      score: weights.qtd_pronta ?? 0,
    })
  }

  // ── FINANCEIRO ────────────────────────────────────────────────────────────
  if (kpis.valor_total > 0) {
    candidates.push({
      id: 'financeiro',
      variante: 'default',
      tag: 'Financeiro · Carteira',
      texto: `Carteira do período totaliza ${fmtBRL(kpis.valor_total)} em pedidos.`,
      stat: kpis.ticket_medio > 0
        ? { label: 'Ticket médio por pedido', valor: fmtBRL(kpis.ticket_medio) }
        : undefined,
      score: weights.financeiro ?? 0,
    })
  }

  // ── DISTRIBUIÇÃO IMP/EXP ──────────────────────────────────────────────────
  const totalOps = kpis.pedidos_importacao + kpis.pedidos_exportacao
  if (totalOps > 0) {
    const pctImp = Math.round((kpis.pedidos_importacao / totalOps) * 100)
    candidates.push({
      id: 'distribuicao',
      variante: 'default',
      tag: 'Análise · Imp. vs Exp.',
      texto: `${pctImp}% das operações são importações e ${100 - pctImp}% exportações no período.`,
      stat: { label: 'Total de operações', valor: fmtNum(totalOps) },
      score: weights.distribuicao ?? 0,
    })
  }

  // ── CANCELADOS ────────────────────────────────────────────────────────────
  if (kpis.pedidos_cancelados > 0 && kpis.total_pedidos > 0) {
    const pctCancel = ((kpis.pedidos_cancelados / kpis.total_pedidos) * 100).toFixed(1)
    candidates.push({
      id: 'cancelados',
      variante: kpis.pedidos_cancelados / kpis.total_pedidos > 0.1 ? 'warn' : 'default',
      tag: 'Alerta · Cancelamentos',
      texto: `${kpis.pedidos_cancelados} pedido${kpis.pedidos_cancelados > 1 ? 's' : ''} cancelado${kpis.pedidos_cancelados > 1 ? 's' : ''} no período (${pctCancel}% do total).`,
      stat: { label: 'Total no período', valor: fmtNum(kpis.total_pedidos) },
      textoLink: 'Ver cancelados',
      rota: '/pedidos/lista?status=cancelado',
      score: weights.cancelados ?? 0,
    })
  }

  // ── EM ANDAMENTO / TRANSFERÊNCIA ──────────────────────────────────────────
  if (kpis.pedidos_em_andamento > 0) {
    candidates.push({
      id: 'em_andamento',
      variante: 'default',
      tag: 'Operação · Em Andamento',
      texto: `${kpis.pedidos_em_andamento} pedido${kpis.pedidos_em_andamento > 1 ? 's' : ''} em transferência ativa no momento.`,
      stat: kpis.taxa_transferencia > 0
        ? { label: 'Taxa de transferência', valor: fmtPct(kpis.taxa_transferencia) }
        : { label: 'Qtd. transferida', valor: fmtNum(kpis.qtd_transferida_total) },
      textoLink: 'Ver em andamento',
      rota: '/pedidos/lista?status=transferencia',
      score: (weights.abertos ?? 0) * 0.9,
    })
  }

  // ── CONSOLIDADOS ──────────────────────────────────────────────────────────
  if (kpis.pedidos_consolidados > 0) {
    const pctConc = kpis.total_pedidos > 0
      ? ((kpis.pedidos_consolidados / kpis.total_pedidos) * 100).toFixed(0)
      : '0'
    candidates.push({
      id: 'consolidados',
      variante: 'default',
      tag: 'Resultado · Consolidados',
      texto: `${kpis.pedidos_consolidados} pedido${kpis.pedidos_consolidados > 1 ? 's' : ''} consolidado${kpis.pedidos_consolidados > 1 ? 's' : ''} no período — ${pctConc}% de conclusão.`,
      stat: { label: 'Total no período', valor: fmtNum(kpis.total_pedidos) },
      textoLink: 'Ver consolidados',
      rota: '/pedidos/lista?status=consolidado',
      score: (weights.financeiro ?? 0) * 0.7,
    })
  }

  // ── VOLUME GERAL — sempre visível se há qualquer pedido ──────────────────
  if (kpis.total_pedidos > 0) {
    const abertosE = kpis.pedidos_abertos + kpis.pedidos_em_andamento
    candidates.push({
      id: 'volume_geral',
      variante: 'default',
      tag: 'Visão Geral · Período',
      texto: `${fmtNum(kpis.total_pedidos)} pedido${kpis.total_pedidos > 1 ? 's' : ''} registrado${kpis.total_pedidos > 1 ? 's' : ''} no período, ${fmtNum(abertosE)} com operação ativa.`,
      stat: kpis.qtd_inicial_total > 0
        ? { label: 'Qtd. inicial total', valor: fmtNum(kpis.qtd_inicial_total) }
        : { label: 'Pedidos no período', valor: fmtNum(kpis.total_pedidos) },
      score: (weights.abertos ?? 0) * 0.5,
    })
  }

  // ── ITENS — saldo disponível ───────────────────────────────────────────────
  if (kpis.qtd_saldo_total > 0) {
    const pctSaldo = kpis.qtd_inicial_total > 0
      ? ((kpis.qtd_saldo_total / kpis.qtd_inicial_total) * 100).toFixed(0)
      : '0'
    candidates.push({
      id: 'saldo_itens',
      variante: 'default',
      tag: 'Estoque · Saldo Disponível',
      texto: `${fmtNum(kpis.qtd_saldo_total)} unidades com saldo disponível — ${pctSaldo}% do volume inicial ainda não expedido.`,
      stat: { label: 'Qtd. inicial', valor: fmtNum(kpis.qtd_inicial_total) },
      score: (weights.qtd_pronta ?? 0) * 0.6,
    })
  }

  // ── FINANCEIRO ITENS ──────────────────────────────────────────────────────
  if (kpis.valor_itens_total > 0) {
    candidates.push({
      id: 'financeiro_itens',
      variante: 'default',
      tag: 'Financeiro · Valor de Itens',
      texto: `Itens dos pedidos totalizam ${fmtBRL(kpis.valor_itens_total)} no período.`,
      stat: kpis.valor_total > 0
        ? { label: 'Valor total dos pedidos', valor: fmtBRL(kpis.valor_total) }
        : undefined,
      score: (weights.financeiro ?? 0) * 0.6,
    })
  }

  // ── SEM INCOTERM ───────────────────────────────────────────────────────────
  if (kpis.pedidos_sem_incoterm > 0) {
    candidates.push({
      id: 'sem_incoterm',
      variante: 'warn',
      tag: 'Atenção · Incoterm',
      texto: `${kpis.pedidos_sem_incoterm} pedido${kpis.pedidos_sem_incoterm > 1 ? 's' : ''} sem incoterm definido — campo obrigatório para documentação de exportação.`,
      stat: { label: 'Pedidos sem incoterm', valor: fmtNum(kpis.pedidos_sem_incoterm) },
      textoLink: 'Corrigir pedidos',
      rota: '/pedidos/lista',
      score: weights.sem_incoterm ?? 0,
    })
  }

  // ── SEM FABRICANTE ─────────────────────────────────────────────────────────
  if (kpis.pedidos_sem_fabricante > 0) {
    candidates.push({
      id: 'sem_fabricante',
      variante: 'warn',
      tag: 'Atenção · Fabricante',
      texto: `${kpis.pedidos_sem_fabricante} pedido${kpis.pedidos_sem_fabricante > 1 ? 's' : ''} sem fabricante vinculado.`,
      stat: { label: 'Total no período', valor: fmtNum(kpis.total_pedidos) },
      textoLink: 'Ver pedidos',
      rota: '/pedidos/lista',
      score: weights.sem_fabricante ?? 0,
    })
  }

  // ── DOCUMENTAÇÃO (proforma + invoice) ────────────────────────────────────
  const sem_doc = kpis.pedidos_sem_proforma + kpis.pedidos_sem_invoice
  if (sem_doc > 0) {
    candidates.push({
      id: 'sem_documentos',
      variante: 'default',
      tag: 'Operação · Documentação',
      texto: kpis.pedidos_sem_proforma > 0 && kpis.pedidos_sem_invoice > 0
        ? `${kpis.pedidos_sem_proforma} pedido${kpis.pedidos_sem_proforma > 1 ? 's' : ''} sem proforma e ${kpis.pedidos_sem_invoice} sem invoice no período.`
        : kpis.pedidos_sem_proforma > 0
          ? `${kpis.pedidos_sem_proforma} pedido${kpis.pedidos_sem_proforma > 1 ? 's' : ''} aguardando número de proforma.`
          : `${kpis.pedidos_sem_invoice} pedido${kpis.pedidos_sem_invoice > 1 ? 's' : ''} aguardando número de invoice.`,
      stat: { label: 'Pedidos incompletos', valor: fmtNum(sem_doc) },
      textoLink: 'Ver documentação',
      rota: '/pedidos/lista',
      score: weights.sem_documentos ?? 0,
    })
  }

  // ── EXPOSIÇÃO CAMBIAL ──────────────────────────────────────────────────────
  if (kpis.itens_sem_cobertura > 0) {
    candidates.push({
      id: 'exposicao_cambial',
      variante: kpis.itens_sem_cobertura > 5 ? 'warn' : 'default',
      tag: kpis.itens_sem_cobertura > 5 ? 'Atenção · Exposição Cambial' : 'Financeiro · Cobertura Cambial',
      texto: `${fmtNum(kpis.itens_sem_cobertura)} ite${kpis.itens_sem_cobertura > 1 ? 'ns' : 'm'} sem cobertura cambial contratada — exposição ao risco de variação.`,
      stat: { label: 'Itens totais', valor: fmtNum(kpis.qtd_inicial_total > 0 ? kpis.qtd_inicial_total : 0) },
      textoLink: 'Analisar exposição',
      rota: '/pedidos/lista',
      score: weights.exposicao_cambial ?? 0,
    })
  }

  // ── MULTI-MOEDA ───────────────────────────────────────────────────────────
  if (kpis.moedas_distintas > 1) {
    candidates.push({
      id: 'multimoeda',
      variante: 'default',
      tag: 'Financeiro · Multi-Moeda',
      texto: `Carteira com ${kpis.moedas_distintas} moedas distintas no período. Variações cambiais afetam o valor consolidado.`,
      stat: kpis.valor_total_brl > 0
        ? { label: 'Exposição total (BRL)', valor: fmtBRL(kpis.valor_total_brl) }
        : { label: 'Moedas no período', valor: fmtNum(kpis.moedas_distintas) },
      textoLink: 'Ver carteira',
      rota: '/pedidos/lista',
      score: weights.multimoeda ?? 0,
    })
  }

  // ── LOGÍSTICA ─────────────────────────────────────────────────────────────
  if (kpis.peso_bruto_total > 0 || kpis.cubagem_total > 0) {
    const temPeso    = kpis.peso_bruto_total > 0
    const temCubagem = kpis.cubagem_total > 0
    candidates.push({
      id: 'logistica',
      variante: 'default',
      tag: 'Logística · Peso & Cubagem',
      texto: temPeso && temCubagem
        ? `Carteira atual: ${fmtNum(kpis.peso_bruto_total)} kg bruto e ${kpis.cubagem_total.toFixed(2)} m³ de cubagem.`
        : temPeso
          ? `Peso bruto total da carteira: ${fmtNum(kpis.peso_bruto_total)} kg.`
          : `Cubagem total da carteira: ${kpis.cubagem_total.toFixed(2)} m³.`,
      stat: temPeso
        ? { label: 'Peso bruto (kg)', valor: fmtNum(kpis.peso_bruto_total) }
        : { label: 'Cubagem (m³)', valor: kpis.cubagem_total.toFixed(2) },
      score: weights.logistica ?? 0,
    })
  }

  // ── CANCELAMENTOS DE QUANTIDADE ───────────────────────────────────────────
  if (kpis.qtd_cancelada_total > 0) {
    const pctCancelado = kpis.qtd_inicial_total > 0
      ? ((kpis.qtd_cancelada_total / kpis.qtd_inicial_total) * 100).toFixed(1)
      : '0'
    candidates.push({
      id: 'qtd_cancelada',
      variante: Number(pctCancelado) > 15 ? 'warn' : 'default',
      tag: Number(pctCancelado) > 15 ? 'Atenção · Cancelamentos' : 'Operação · Cancelamentos',
      texto: `${fmtNum(kpis.qtd_cancelada_total)} unidades canceladas no período — ${pctCancelado}% do volume inicial.`,
      stat: { label: 'Volume inicial', valor: fmtNum(kpis.qtd_inicial_total) },
      textoLink: 'Ver itens',
      rota: '/pedidos/lista',
      score: weights.qtd_cancelada ?? 0,
    })
  }

  return candidates
}

// ── Cruzamentos — insights compostos com 2+ campos ───────────────────────────
// Só aparecem quando AMBAS as condições são verdadeiras.
// IDs prefixados com cross_ para não colidir com candidatos simples.

function buildCrossInsights(kpis: KpiSnapshot, role: UserRole): GabiInsight[] {
  const weights = ROLE_WEIGHTS[role] ?? ROLE_WEIGHTS.default
  const crosses: GabiInsight[] = []

  // ── Pronta + sem exportador — bloqueio real ───────────────────────────────
  if (kpis.qtd_pronta_total > 0 && kpis.pedidos_sem_exportador > 0) {
    crosses.push({
      id: 'cross_pronta_sem_exportador',
      variante: 'warn',
      tag: 'Atenção · Bloqueio de Embarque',
      texto: `${fmtNum(kpis.qtd_pronta_total)} unidades prontas para embarque, mas ${kpis.pedidos_sem_exportador} pedido${kpis.pedidos_sem_exportador > 1 ? 's' : ''} sem exportador vinculado.`,
      stat: { label: 'Qtd. pronta bloqueada', valor: fmtNum(kpis.qtd_pronta_total) },
      textoLink: 'Corrigir exportador',
      rota: '/pedidos/lista?exportador=nenhum',
      score: (weights.sem_exportador ?? 0) * 1.3,
    })
  }

  // ── Abertos + sem incoterm — risco documental nos pedidos ativos ──────────
  if (kpis.pedidos_abertos > 0 && kpis.pedidos_sem_incoterm > 0) {
    const sobreposicao = Math.min(kpis.pedidos_abertos, kpis.pedidos_sem_incoterm)
    crosses.push({
      id: 'cross_abertos_sem_incoterm',
      variante: 'warn',
      tag: 'Atenção · Incoterm em Aberto',
      texto: `${sobreposicao} pedido${sobreposicao > 1 ? 's' : ''} ativo${sobreposicao > 1 ? 's' : ''} sem incoterm — pode atrasar documentação de embarque.`,
      stat: { label: 'Pedidos em aberto', valor: fmtNum(kpis.pedidos_abertos) },
      textoLink: 'Corrigir agora',
      rota: '/pedidos/lista?status=aberto',
      score: (weights.sem_incoterm ?? 0) * 1.2,
    })
  }

  // ── Draft + valor potencial — rascunhos represando carteira ──────────────
  if (kpis.pedidos_draft > 0 && kpis.ticket_medio > 0) {
    const valorRepresado = kpis.pedidos_draft * kpis.ticket_medio
    crosses.push({
      id: 'cross_draft_valor',
      variante: 'default',
      tag: 'Financeiro · Rascunhos em Espera',
      texto: `${kpis.pedidos_draft} rascunho${kpis.pedidos_draft > 1 ? 's' : ''} representa${kpis.pedidos_draft > 1 ? 'm' : ''} aprox. ${fmtBRL(valorRepresado)} em valor potencial aguardando envio.`,
      stat: { label: 'Ticket médio', valor: fmtBRL(kpis.ticket_medio) },
      textoLink: 'Ver rascunhos',
      rota: '/pedidos/lista?status=draft',
      score: (weights.financeiro ?? 0) * 0.9,
    })
  }

  // ── Cobertura cambial + valor total — exposição financeira real ───────────
  if (kpis.itens_sem_cobertura > 0 && kpis.valor_total > 0) {
    const pctExpostos = kpis.qtd_inicial_total > 0
      ? ((kpis.itens_sem_cobertura / kpis.qtd_inicial_total) * 100).toFixed(0)
      : '?'
    crosses.push({
      id: 'cross_cobertura_valor',
      variante: kpis.itens_sem_cobertura > 5 ? 'warn' : 'default',
      tag: 'Financeiro · Exposição Cambial Real',
      texto: `${pctExpostos}% dos itens sem cobertura cambial numa carteira de ${fmtBRL(kpis.valor_total)}.`,
      stat: { label: 'Itens sem cobertura', valor: fmtNum(kpis.itens_sem_cobertura) },
      textoLink: 'Analisar exposição',
      rota: '/pedidos/lista',
      score: (weights.exposicao_cambial ?? 0) * 1.1,
    })
  }

  // ── Multi-moeda + sem cobertura — risco duplo ─────────────────────────────
  if (kpis.moedas_distintas > 1 && kpis.itens_sem_cobertura > 0) {
    crosses.push({
      id: 'cross_multimoeda_cobertura',
      variante: 'warn',
      tag: 'Atenção · Risco Cambial Duplo',
      texto: `Carteira em ${kpis.moedas_distintas} moedas com ${fmtNum(kpis.itens_sem_cobertura)} ite${kpis.itens_sem_cobertura > 1 ? 'ns' : 'm'} sem cobertura — exposição composta ao câmbio.`,
      stat: kpis.valor_total_brl > 0
        ? { label: 'Exposição total (BRL)', valor: fmtBRL(kpis.valor_total_brl) }
        : { label: 'Moedas no período', valor: fmtNum(kpis.moedas_distintas) },
      textoLink: 'Ver carteira',
      rota: '/pedidos/lista',
      score: (weights.exposicao_cambial ?? 0) * 1.2,
    })
  }

  // ── Em andamento + cancelamentos — saldo comprometido ────────────────────
  if (kpis.pedidos_em_andamento > 0 && kpis.qtd_cancelada_total > 0) {
    crosses.push({
      id: 'cross_andamento_cancelado',
      variante: 'default',
      tag: 'Operação · Saldo em Revisão',
      texto: `Há transferências ativas e ${fmtNum(kpis.qtd_cancelada_total)} unidades canceladas no período — revisar saldo dos itens em andamento.`,
      stat: { label: 'Pedidos em andamento', valor: fmtNum(kpis.pedidos_em_andamento) },
      textoLink: 'Ver em andamento',
      rota: '/pedidos/lista?status=transferencia',
      score: (weights.em_andamento ?? 0) * 0.9,
    })
  }

  // ── Sem fabricante + importações — risco de LI ───────────────────────────
  if (kpis.pedidos_sem_fabricante > 0 && kpis.pedidos_importacao > 0) {
    crosses.push({
      id: 'cross_fabricante_importacao',
      variante: 'warn',
      tag: 'Atenção · Licença de Importação',
      texto: `${kpis.pedidos_sem_fabricante} importaç${kpis.pedidos_sem_fabricante > 1 ? 'ões' : 'ão'} sem fabricante vinculado — necessário para Licença de Importação.`,
      stat: { label: 'Total importações', valor: fmtNum(kpis.pedidos_importacao) },
      textoLink: 'Corrigir',
      rota: '/pedidos/lista',
      score: (weights.sem_fabricante ?? 0) * 1.2,
    })
  }

  // ── Logística + em andamento — peso em trânsito ───────────────────────────
  if (kpis.peso_bruto_total > 0 && kpis.pedidos_em_andamento > 0) {
    crosses.push({
      id: 'cross_logistica_andamento',
      variante: 'default',
      tag: 'Logística · Em Trânsito',
      texto: `${fmtNum(kpis.peso_bruto_total)} kg bruto na carteira com ${kpis.pedidos_em_andamento} pedido${kpis.pedidos_em_andamento > 1 ? 's' : ''} em transferência ativa.`,
      stat: kpis.cubagem_total > 0
        ? { label: 'Cubagem (m³)', valor: kpis.cubagem_total.toFixed(2) }
        : { label: 'Peso bruto (kg)', valor: fmtNum(kpis.peso_bruto_total) },
      score: (weights.logistica ?? 0) * 0.9,
    })
  }

  // ── Sem proforma + abertos — risco de atraso de embarque ─────────────────
  if (kpis.pedidos_sem_proforma > 0 && kpis.pedidos_abertos > 0) {
    crosses.push({
      id: 'cross_proforma_abertos',
      variante: 'default',
      tag: 'Operação · Proforma Pendente',
      texto: `${kpis.pedidos_sem_proforma} pedido${kpis.pedidos_sem_proforma > 1 ? 's' : ''} em aberto sem número de proforma — pode atrasar o processo de embarque.`,
      stat: { label: 'Pedidos em aberto', valor: fmtNum(kpis.pedidos_abertos) },
      textoLink: 'Ver pendentes',
      rota: '/pedidos/lista?status=aberto',
      score: (weights.sem_documentos ?? 0) * 1.1,
    })
  }

  return crosses
}

// ── Padding — garante mínimo de 4 insights ────────────────────────────────────

const FALLBACK_INSIGHTS: GabiInsight[] = [
  {
    id: 'status_ok',
    variante: 'default',
    tag: 'Status · Tudo em dia',
    texto: 'Nenhuma pendência identificada. Operação normalizada no período selecionado.',
    score: 1,
  },
  {
    id: 'dica_periodo',
    variante: 'default',
    tag: 'Dica · Gabi AI',
    texto: 'Use o filtro de período para explorar tendências históricas dos seus pedidos.',
    textoLink: 'Explorar dados',
    rota: '/pedidos/dashboard',
    score: 0,
  },
  {
    id: 'dica_widgets',
    variante: 'default',
    tag: 'Dica · Personalização',
    texto: 'Adicione widgets personalizados ao dashboard para monitorar as métricas que mais importam para você.',
    textoLink: 'Criar widget',
    rota: '/pedidos/dashboard',
    score: 0,
  },
  {
    id: 'dica_filtros',
    variante: 'default',
    tag: 'Dica · Filtros',
    texto: 'Filtre por status ou período para obter insights mais precisos sobre a sua operação.',
    score: 0,
  },
]

// ── Função principal ──────────────────────────────────────────────────────────

/**
 * Gera lista de insights ranqueados para exibição no carrossel do Dashboard.
 *
 * Lógica de composição:
 *  - Insights de dados (baseados em KPIs) são ranqueados por score × comportamento
 *  - Feature cards (feat_*) são intercalados: 1 a cada 3 cards de dados
 *  - Features já usadas (behaviorScores[feat_X] > 0) são suprimidas
 *  - Mínimo 4 cards total — fallbacks preenchem o restante
 *
 * @param kpis           - Snapshot de KPIs do período
 * @param role           - Role do usuário (determina pesos de relevância)
 * @param behaviorScores - (Fase 2) Scores de comportamento por insightId → multiplicador
 * @returns              - Lista intercalada: dados + features, mínimo 4
 */
export function generateInsights(
  kpis: KpiSnapshot,
  role: UserRole = 'default',
  behaviorScores: Record<string, number> = {},
): GabiInsight[] {
  // ── 1. Candidatos de dados (simples + cruzamentos mesclados por score) ────
  const dataCandidates = [
    ...buildCandidates(kpis, role),
    ...buildCrossInsights(kpis, role),
  ]
  const dataScored = dataCandidates
    .map(ins => ({ ...ins, score: ins.score * (behaviorScores[ins.id] ?? 1.0) }))
    .sort((a, b) => b.score - a.score)

  // ── 2. Feature cards — apenas não usadas ─────────────────────────────────
  const featureCandidates = buildFeatureCandidates(kpis, behaviorScores)
    .sort((a, b) => b.score - a.score)

  // ── 3. Interleaving: 1 feature a cada 3 dados ────────────────────────────
  const result: GabiInsight[] = []
  const MAX_FEATURE_CARDS = 2   // nunca mais que 2 cards de instrução no total
  const FEATURE_INTERVAL  = 5   // 1 feature a cada 5 dados reais
  let featIdx = 0
  for (let i = 0; i < dataScored.length; i++) {
    result.push(dataScored[i]!)
    if (
      (i + 1) % FEATURE_INTERVAL === 0 &&
      featIdx < featureCandidates.length &&
      featIdx < MAX_FEATURE_CARDS
    ) {
      result.push(featureCandidates[featIdx++]!)
    }
  }
  // 1 feature no final se ainda não atingiu o limite e há dados suficientes
  if (featIdx < featureCandidates.length && featIdx < MAX_FEATURE_CARDS && dataScored.length >= 3) {
    result.push(featureCandidates[featIdx]!)
  }

  // ── 4. Garante mínimo de 4 insights ──────────────────────────────────────
  const MIN = 4
  if (result.length >= MIN) return result
  const needed = MIN - result.length
  const extras = FALLBACK_INSIGHTS
    .filter(f => !result.find(r => r.id === f.id))
    .slice(0, needed)
  return [...result, ...extras]
}

/**
 * Normaliza o role recebido para os valores suportados.
 * Headers HTTP podem trazer valores variados — normalizamos aqui.
 */
export function normalizeRole(raw: string | undefined): UserRole {
  if (!raw) return 'default'
  const lower = raw.toLowerCase()
  if (lower.includes('diretor') || lower.includes('director')) return 'diretor'
  if (lower.includes('gerente') || lower.includes('manager'))   return 'gerente'
  if (lower.includes('admin'))                                   return 'admin'
  if (lower.includes('operador') || lower.includes('operator')) return 'operador'
  return 'default'
}
