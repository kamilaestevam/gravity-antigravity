/**
 * matriz-validacao-pedido-compra-smart-read.ts — SSOT Matriz de Validação do Pedido de Compra / PO (v1.0)
 *
 * Documento comercial emitido pelo importador. Ancora cadeia de valoração, câmbio, antifraude e Catálogo DUIMP.
 * Base: AVA-GATT arts. 1º e 8º · RA arts. 76–83 e 711 · IN RFB 1861/2018 · DL 1.455/76 art. 23 ·
 * Res. BCB 277/2022 · IN 680/06 art. 15 · CISG (Decreto 8.327/2014).
 */

export type SecaoMatrizPedidoCompra =
  | 'identificacao_vinculos'
  | 'partes_comprador_vendedor'
  | 'termos_comerciais_logisticos'
  | 'itens_linha'
  | 'valores_financeiros'
  | 'cambio_financeiro'
  | 'aprovacoes_controle'
  | 'sinais_regulatorios'
  | 'consistencia_risco'

export type MotorValidacaoPedidoCompra =
  | 'codigo'
  | 'api'
  | 'llm'
  | 'rag'
  | 'cross_doc'
  | 'codigo_rag'
  | 'cross_doc_rag'
  | 'api_llm'

export type SeveridadeMatrizPedidoCompra = 'bloq' | 'alerta' | 'info' | 'cond' | null

export type RegraMatrizPedidoCompra = {
  id: string
  secao: SecaoMatrizPedidoCompra
  item: string
  motor: MotorValidacaoPedidoCompra
  severidade: SeveridadeMatrizPedidoCompra
  gate_condicional?: boolean
  descricao: string
  tooltip_conferencia: string
  base_normativa: string
}

export const ORDEM_SECOES_MATRIZ_PEDIDO_COMPRA: readonly SecaoMatrizPedidoCompra[] = [
  'identificacao_vinculos',
  'partes_comprador_vendedor',
  'termos_comerciais_logisticos',
  'itens_linha',
  'valores_financeiros',
  'cambio_financeiro',
  'aprovacoes_controle',
  'sinais_regulatorios',
  'consistencia_risco',
] as const

export const ROTULO_SECAO_MATRIZ_PEDIDO_COMPRA: Record<SecaoMatrizPedidoCompra, string> = {
  identificacao_vinculos: '1 — Identificação e vínculos',
  partes_comprador_vendedor: '2 — Partes (comprador e vendedor)',
  termos_comerciais_logisticos: '3 — Termos comerciais e logísticos',
  itens_linha: '4 — Itens de linha',
  valores_financeiros: '5 — Valores e condições financeiras',
  cambio_financeiro: '6 — Câmbio e financeiro internacional',
  aprovacoes_controle: '7 — Aprovações e controle interno',
  sinais_regulatorios: '8 — Sinais regulatórios antecipados',
  consistencia_risco: '9 — Consistência e risco',
}

export const ROTULO_SEVERIDADE_MATRIZ_PEDIDO_COMPRA: Record<Exclude<SeveridadeMatrizPedidoCompra, null>, string> = {
  bloq: 'BLOQ', alerta: 'ALERTA', info: 'INFO', cond: 'COND',
}

export const MATRIZ_VALIDACAO_PEDIDO_COMPRA: RegraMatrizPedidoCompra[] = [
  // ── 1 — Identificação e vínculos ──
  {
    id: 'PC1-01',
    secao: 'identificacao_vinculos',
    item: 'Número do PO',
    motor: 'codigo',
    severidade: "alerta",
    descricao: 'Nº único do pedido de compra presente',
    tooltip_conferencia: 'Confere o número único do pedido de compra',
    base_normativa: 'Rastreabilidade; IN 680/06 art. 15, §1º',
  },
  {
    id: 'PC1-02',
    secao: 'identificacao_vinculos',
    item: 'Data de emissão',
    motor: 'codigo',
    severidade: "alerta",
    descricao: 'Presente; deve ser anterior à proforma/invoice e ao embarque; alertar se futura',
    tooltip_conferencia: 'Valida a data e a ordem cronológica (PO antes da invoice)',
    base_normativa: 'Formação do contrato (CISG art. 14 e ss.)',
  },
  {
    id: 'PC1-03',
    secao: 'identificacao_vinculos',
    item: 'Vínculo com invoice/proforma',
    motor: 'cross_doc',
    severidade: "bloq",
    descricao: 'Nº do PO deve casar com a referência de PO na invoice (S1-03) e no pedido de venda (PV1-03); PO órfão é red flag',
    tooltip_conferencia: 'Cruza o PO com a referência declarada na invoice e no pedido de venda',
    base_normativa: 'IN 680/06 art. 15, §1º; coerência do dossiê comercial',
  },
  {
    id: 'PC1-04',
    secao: 'identificacao_vinculos',
    item: 'Revisão / versão do PO',
    motor: 'llm',
    severidade: "alerta",
    descricao: 'Detectar versão/revisão; duas versões divergentes exigem a vigente',
    tooltip_conferencia: 'Identifica revisões do pedido e sinaliza versões conflitantes',
    base_normativa: 'RA art. 725',
  },
  {
    id: 'PC1-05',
    secao: 'identificacao_vinculos',
    item: 'Moeda do pedido',
    motor: 'codigo',
    severidade: "alerta",
    descricao: 'Moeda ISO 4217; mesma da invoice (S5-01) e do câmbio',
    tooltip_conferencia: 'Valida a moeda do pedido e a coerência com invoice e câmbio',
    base_normativa: 'ISO 4217; normas cambiais BCB',
  },
  // ── 2 — Partes (comprador e vendedor) ──
  {
    id: 'PC2-01',
    secao: 'partes_comprador_vendedor',
    item: 'Comprador / importador',
    motor: 'cross_doc',
    severidade: "alerta",
    descricao: 'Comprador identificado; casa com importador da invoice (S2-03)',
    tooltip_conferencia: 'Confere o comprador contra o importador da invoice',
    base_normativa: 'AVA-GATT art. 1º',
  },
  {
    id: 'PC2-02',
    secao: 'partes_comprador_vendedor',
    item: 'CNPJ do comprador',
    motor: 'codigo',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'Quando presente: 14 posições + DV Módulo 11; idêntico ao importador',
    tooltip_conferencia: 'Valida o CNPJ do comprador quando presente',
    base_normativa: 'IN RFB 2.229/2024; IN RFB 2119/2022',
  },
  {
    id: 'PC2-03',
    secao: 'partes_comprador_vendedor',
    item: 'Vendedor / exportador',
    motor: 'cross_doc',
    severidade: "alerta",
    descricao: 'Vendedor identificado; casa com exportador da invoice (S2-05) e PV (PV2-01)',
    tooltip_conferencia: 'Confere o vendedor contra o exportador da invoice',
    base_normativa: 'AVA-GATT art. 1º',
  },
  {
    id: 'PC2-04',
    secao: 'partes_comprador_vendedor',
    item: 'Adquirente / encomendante real',
    motor: 'llm',
    severidade: "bloq",
    descricao: 'Comprador do PO difere do importador DUIMP sem declaração de conta e ordem/encomenda',
    tooltip_conferencia: 'Detecta comprador distinto do importador — indício de interposição',
    base_normativa: 'IN RFB 1861/2018; DL 1.455/76 art. 23, XXII',
  },
  {
    id: 'PC2-05',
    secao: 'partes_comprador_vendedor',
    item: 'Vínculo entre as partes (relacionadas)',
    motor: 'llm',
    severidade: "alerta",
    descricao: 'Indícios de partes relacionadas (intercompany) para verificação de valoração',
    tooltip_conferencia: 'Sinaliza indício de partes relacionadas para checagem de valoração',
    base_normativa: 'AVA-GATT art. 1º, §2º e art. 15',
  },
  // ── 3 — Termos comerciais e logísticos ──
  {
    id: 'PC3-01',
    secao: 'termos_comerciais_logisticos',
    item: 'Incoterm e local',
    motor: 'cross_doc',
    severidade: "alerta",
    descricao: 'Incoterms® 2020 + local; casa com invoice (S3-01) e PV (PV3-01)',
    tooltip_conferencia: 'Confere o Incoterm do pedido contra invoice e pedido de venda',
    base_normativa: 'Incoterms® 2020; AVA-GATT art. 8º',
  },
  {
    id: 'PC3-02',
    secao: 'termos_comerciais_logisticos',
    item: 'Prazo de entrega / shipment',
    motor: 'llm',
    severidade: "info",
    descricao: 'Data ou janela de embarque acordada; coerente com BL/AWB',
    tooltip_conferencia: 'Verifica o prazo de embarque acordado contra o conhecimento',
    base_normativa: 'CISG art. 33',
  },
  {
    id: 'PC3-03',
    secao: 'termos_comerciais_logisticos',
    item: 'Origem/destino acordados',
    motor: 'cross_doc',
    severidade: "alerta",
    descricao: 'País de origem coerente com CO (CO2-04) e rota; destino = importador',
    tooltip_conferencia: 'Cruza origem/destino do pedido com certificado de origem e rota',
    base_normativa: 'RA arts. 30–35',
  },
  {
    id: 'PC3-04',
    secao: 'termos_comerciais_logisticos',
    item: 'Termos de pagamento',
    motor: 'cross_doc',
    severidade: "alerta",
    descricao: 'Condição de pagamento coerente com invoice (S6-03) e câmbio',
    tooltip_conferencia: 'Confere os termos de pagamento contra a invoice e o câmbio',
    base_normativa: 'Normas cambiais BCB',
  },
  // ── 4 — Itens de linha ──
  {
    id: 'PC4-01',
    secao: 'itens_linha',
    item: 'Part number / SKU',
    motor: 'cross_doc',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'PN/SKU por item; casa com invoice (S4-01), PL (P6-02) e catálogo',
    tooltip_conferencia: 'Confere part numbers do pedido contra invoice e catálogo',
    base_normativa: 'Catálogo DUIMP; rastreabilidade',
  },
  {
    id: 'PC4-02',
    secao: 'itens_linha',
    item: 'Descrição do produto',
    motor: 'llm',
    severidade: "alerta",
    descricao: 'Descrição específica por item; rejeitar genéricos',
    tooltip_conferencia: 'Exige descrição específica por item — alimenta invoice e catálogo',
    base_normativa: 'AVA-GATT; Catálogo DUIMP',
  },
  {
    id: 'PC4-03',
    secao: 'itens_linha',
    item: 'Quantidade e unidade',
    motor: 'cross_doc',
    severidade: "alerta",
    descricao: 'Quantidade e unidade por item; invoice não deve exceder o pedido',
    tooltip_conferencia: 'Confere quantidades do pedido contra a invoice',
    base_normativa: 'CISG art. 35',
  },
  {
    id: 'PC4-04',
    secao: 'itens_linha',
    item: 'Preço unitário acordado',
    motor: 'cross_doc',
    severidade: "bloq",
    descricao: 'Preço unitário do PO = preço da invoice (S5-03); divergência é red flag de valoração',
    tooltip_conferencia: 'Compara o preço unitário acordado com o da invoice — divergência é red flag',
    base_normativa: 'AVA-GATT art. 1º; RA art. 711',
  },
  {
    id: 'PC4-05',
    secao: 'itens_linha',
    item: 'Marca e modelo',
    motor: 'llm',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'Marca/modelo por item quando presentes; alimentam Catálogo DUIMP',
    tooltip_conferencia: 'Extrai marca e modelo por item — atributos do catálogo DUIMP',
    base_normativa: 'Catálogo de Produtos DUIMP',
  },
  // ── 5 — Valores e condições financeiras ──
  {
    id: 'PC5-01',
    secao: 'valores_financeiros',
    item: 'Multiplicação de linha',
    motor: 'codigo',
    severidade: "alerta",
    descricao: 'Qtd × preço unitário = total da linha',
    tooltip_conferencia: 'Recalcula quantidade × preço unitário por linha',
    base_normativa: 'Consistência aritmética',
  },
  {
    id: 'PC5-02',
    secao: 'valores_financeiros',
    item: 'Somatório e total',
    motor: 'codigo',
    severidade: "alerta",
    descricao: 'Σ linhas + acréscimos − descontos = total do pedido',
    tooltip_conferencia: 'Soma as linhas e confere o total do pedido',
    base_normativa: 'Consistência aritmética',
  },
  {
    id: 'PC5-03',
    secao: 'valores_financeiros',
    item: 'Total PO × total invoice',
    motor: 'cross_doc',
    severidade: "bloq",
    descricao: 'Total do pedido = total da invoice; divergência global é red flag de valoração',
    tooltip_conferencia: 'Compara o total do pedido com o total da invoice',
    base_normativa: 'AVA-GATT art. 1º; RA art. 711',
  },
  {
    id: 'PC5-04',
    secao: 'valores_financeiros',
    item: 'Descontos — natureza',
    motor: 'llm',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'Desconto acordado com natureza declarada; refletir na invoice (S5-08)',
    tooltip_conferencia: 'Confere descontos e sua natureza contra a invoice',
    base_normativa: 'AVA-GATT art. 1º; RA art. 557',
  },
  {
    id: 'PC5-05',
    secao: 'valores_financeiros',
    item: 'Custos adicionais (royalties, ferramental)',
    motor: 'llm',
    severidade: "alerta",
    descricao: 'Detectar royalties, tooling, assists que compõem valor aduaneiro',
    tooltip_conferencia: 'Detecta royalties/ferramental/assists que compõem o valor aduaneiro',
    base_normativa: 'AVA-GATT art. 8º, 1',
  },
  // ── 6 — Câmbio e financeiro internacional ──
  {
    id: 'PC6-01',
    secao: 'cambio_financeiro',
    item: 'Dados bancários do beneficiário',
    motor: 'cross_doc',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'Banco/conta do vendedor coerentes com invoice (S6-01)',
    tooltip_conferencia: 'Confere dados bancários do pedido contra a invoice',
    base_normativa: 'Normas cambiais BCB (Res. 277/2022)',
  },
  {
    id: 'PC6-02',
    secao: 'cambio_financeiro',
    item: 'Coerência com contratação de câmbio',
    motor: 'cross_doc',
    severidade: "bloq",
    descricao: 'Valor, moeda e beneficiário do PO devem sustentar câmbio; pagamento a terceiro é red flag',
    tooltip_conferencia: 'Verifica se o pedido sustenta o câmbio — pagamento a terceiro é red flag',
    base_normativa: 'Lei 14.286/2021; Res. BCB 277/2022',
  },
  {
    id: 'PC6-03',
    secao: 'cambio_financeiro',
    item: 'Antecipação / pré-pagamento',
    motor: 'llm',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'Pagamento antecipado: verificar prazo e coerência com entrega',
    tooltip_conferencia: 'Detecta pré-pagamento e sua coerência com a entrega',
    base_normativa: 'Normas cambiais BCB',
  },
  // ── 7 — Aprovações e controle interno ──
  {
    id: 'PC7-01',
    secao: 'aprovacoes_controle',
    item: 'Aprovação / assinatura do comprador',
    motor: 'llm',
    severidade: "alerta",
    descricao: 'Assinatura ou aprovação eletrônica do responsável pela compra',
    tooltip_conferencia: 'Verifica a aprovação/assinatura do comprador no pedido',
    base_normativa: 'Controle interno; CISG art. 18',
  },
  {
    id: 'PC7-02',
    secao: 'aprovacoes_controle',
    item: 'Aceite do vendedor',
    motor: 'cross_doc',
    severidade: "info",
    descricao: 'Evidência de aceite (order acknowledgment / pedido de venda PV)',
    tooltip_conferencia: 'Verifica o aceite do vendedor (vínculo com pedido de venda)',
    base_normativa: 'CISG arts. 18–23',
  },
  {
    id: 'PC7-03',
    secao: 'aprovacoes_controle',
    item: 'Termos e condições anexos',
    motor: 'llm',
    severidade: "info",
    descricao: 'Referência a T&C / contrato-quadro; sinalizar cláusulas relevantes',
    tooltip_conferencia: 'Detecta termos e condições anexos ao pedido',
    base_normativa: 'CISG; contrato internacional',
  },
  // ── 8 — Sinais regulatórios antecipados ──
  {
    id: 'PC8-01',
    secao: 'sinais_regulatorios',
    item: 'NCM esperada / pré-classificação',
    motor: 'cross_doc',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'Quando o PO traz NCM: antecipar anuências e tributação',
    tooltip_conferencia: 'Antecipa a NCM esperada para planejamento de anuências e tributos',
    base_normativa: 'Pré-classificação; Portal Único',
  },
  {
    id: 'PC8-02',
    secao: 'sinais_regulatorios',
    item: 'Anuências antecipadas',
    motor: 'cross_doc_rag',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'Produto que exigirá LPCO: sinalizar já no pedido',
    tooltip_conferencia: 'Sinaliza anuências prováveis já na fase de pedido',
    base_normativa: 'Tratamento administrativo; LPCO',
  },
  {
    id: 'PC8-03',
    secao: 'sinais_regulatorios',
    item: 'Bens usados / remanufaturados',
    motor: 'llm',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'Indício de bem usado/remanufaturado exige licenciamento próprio',
    tooltip_conferencia: 'Detecta bem usado ou remanufaturado que exige licenciamento próprio',
    base_normativa: 'Portaria SECEX; anuência específica',
  },
  // ── 9 — Consistência e risco ──
  {
    id: 'PC9-01',
    secao: 'consistencia_risco',
    item: 'Legibilidade e integridade',
    motor: 'llm',
    severidade: "alerta",
    descricao: 'Legível, sem rasuras ou alterações suspeitas',
    tooltip_conferencia: 'Avalia legibilidade e integridade do pedido',
    base_normativa: 'Boa prática documental',
  },
  {
    id: 'PC9-02',
    secao: 'consistencia_risco',
    item: 'Coerência global PC × PV × invoice',
    motor: 'cross_doc',
    severidade: "alerta",
    descricao: 'Parecer único: pedido de compra × pedido de venda × invoice consistentes',
    tooltip_conferencia: 'Consolida a coerência entre os dois pedidos e a invoice',
    base_normativa: 'AVA-GATT; coerência do dossiê',
  },
  {
    id: 'PC9-03',
    secao: 'consistencia_risco',
    item: 'Plausibilidade de preço',
    motor: 'api_llm',
    severidade: "info",
    descricao: 'Preço do PO vs histórico e mercado; outlier severo sinaliza valoração',
    tooltip_conferencia: 'Compara preços do pedido com histórico e mercado',
    base_normativa: 'MP 2.158-35/01 art. 88; RA art. 703',
  },
  {
    id: 'PC9-04',
    secao: 'consistencia_risco',
    item: 'Risco de valoração / interposição',
    motor: 'codigo',
    severidade: "bloq",
    descricao: 'Consolidar: divergência preço PO×invoice, interposição, pagamento a terceiro',
    tooltip_conferencia: 'Consolida o risco de valoração e interposição do pedido',
    base_normativa: 'AVA-GATT; RA arts. 711/725; DL 1.455/76 art. 23',
  },
  {
    id: 'PC9-05',
    secao: 'consistencia_risco',
    item: 'Score documental',
    motor: 'codigo',
    severidade: null,
    descricao: 'Score 0–100 sobre regras ALERTA/INFO aplicáveis',
    tooltip_conferencia: 'Pontuação de qualidade documental do pedido',
    base_normativa: 'Metodologia interna',
  },
  {
    id: 'PC9-06',
    secao: 'consistencia_risco',
    item: 'Classificação de risco (gates + score)',
    motor: 'codigo',
    severidade: null,
    descricao: 'Pior entre score e gates. Gates: PC1-03, PC2-04, PC4-04, PC5-03, PC6-02, PC9-04',
    tooltip_conferencia: 'Classificação final combinando gates e pontuação',
    base_normativa: 'Metodologia interna',
  },
]

export const GATES_MATRIZ_PEDIDO_COMPRA: readonly string[] =
  MATRIZ_VALIDACAO_PEDIDO_COMPRA.filter((regra) => regra.severidade === 'bloq').map((regra) => regra.id)

export const GATES_CRITICOS_MATRIZ_PEDIDO_COMPRA: readonly string[] = [
  'PC4-04',
  'PC5-03',
  'PC2-04',
  'PC6-02',
]

export type ClassificacaoRiscoPedidoCompra = 'baixo_risco' | 'atencao' | 'alto_risco' | 'critico'

export const ROTULO_CLASSIFICACAO_RISCO_PEDIDO_COMPRA: Record<ClassificacaoRiscoPedidoCompra, string> = {
  baixo_risco: 'Baixo risco', atencao: 'Atenção', alto_risco: 'Alto risco', critico: 'Crítico',
}

export function classificacaoPorFaixaScorePedidoCompra(score: number): ClassificacaoRiscoPedidoCompra {
  if (score >= 95) return 'baixo_risco'
  if (score >= 80) return 'atencao'
  if (score >= 60) return 'alto_risco'
  return 'critico'
}

export function classificacaoRiscoPedidoCompra(score: number, gatesFalhos: readonly string[]): ClassificacaoRiscoPedidoCompra {
  const porScore = classificacaoPorFaixaScorePedidoCompra(score)
  if (gatesFalhos.length === 0) return porScore
  const temGateCritico = gatesFalhos.some((id) => GATES_CRITICOS_MATRIZ_PEDIDO_COMPRA.includes(id))
  if (gatesFalhos.length >= 2 || temGateCritico) return 'critico'
  return porScore === 'critico' ? 'critico' : 'alto_risco'
}

export function regraMatrizPedidoCompraPorId(id: string): RegraMatrizPedidoCompra | undefined {
  return MATRIZ_VALIDACAO_PEDIDO_COMPRA.find((r) => r.id === id)
}
