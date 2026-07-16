/**
 * matriz-validacao-pedido-venda-smart-read.ts — SSOT Matriz de Validação do Pedido de Venda / SO (v1.0)
 *
 * Order confirmation / sales order emitido pelo exportador. Espelho vendedor do PO — simetria PC↔PV é a regra-mãe.
 * Base: CISG (Decreto 8.327/2014) arts. 18–23 · AVA-GATT arts. 1º e 8º · RA arts. 76–83 e 711 ·
 * IN RFB 1861/2018 · DL 1.455/76 art. 23 · Res. BCB 277/2022 · IN 680/06 art. 15.
 */

export type SecaoMatrizPedidoVenda =
  | 'identificacao_vinculos'
  | 'partes_vendedor_comprador'
  | 'termos_comerciais_logisticos'
  | 'itens_linha'
  | 'valores_financeiros'
  | 'dados_bancarios_cambio'
  | 'aceite_contrato'
  | 'sinais_regulatorios'
  | 'consistencia_risco'

export type MotorValidacaoPedidoVenda =
  | 'codigo'
  | 'api'
  | 'llm'
  | 'rag'
  | 'cross_doc'
  | 'codigo_rag'
  | 'cross_doc_rag'
  | 'api_llm'

export type SeveridadeMatrizPedidoVenda = 'bloq' | 'alerta' | 'info' | 'cond' | null

export type RegraMatrizPedidoVenda = {
  id: string
  secao: SecaoMatrizPedidoVenda
  item: string
  motor: MotorValidacaoPedidoVenda
  severidade: SeveridadeMatrizPedidoVenda
  gate_condicional?: boolean
  descricao: string
  tooltip_conferencia: string
  base_normativa: string
}

export const ORDEM_SECOES_MATRIZ_PEDIDO_VENDA: readonly SecaoMatrizPedidoVenda[] = [
  'identificacao_vinculos',
  'partes_vendedor_comprador',
  'termos_comerciais_logisticos',
  'itens_linha',
  'valores_financeiros',
  'dados_bancarios_cambio',
  'aceite_contrato',
  'sinais_regulatorios',
  'consistencia_risco',
] as const

export const ROTULO_SECAO_MATRIZ_PEDIDO_VENDA: Record<SecaoMatrizPedidoVenda, string> = {
  identificacao_vinculos: '1 — Identificação e vínculos',
  partes_vendedor_comprador: '2 — Partes (vendedor e comprador)',
  termos_comerciais_logisticos: '3 — Termos comerciais e logísticos',
  itens_linha: '4 — Itens de linha',
  valores_financeiros: '5 — Valores e condições financeiras',
  dados_bancarios_cambio: '6 — Dados bancários e câmbio',
  aceite_contrato: '7 — Aceite e formação do contrato',
  sinais_regulatorios: '8 — Sinais regulatórios antecipados',
  consistencia_risco: '9 — Consistência e risco',
}

export const ROTULO_SEVERIDADE_MATRIZ_PEDIDO_VENDA: Record<Exclude<SeveridadeMatrizPedidoVenda, null>, string> = {
  bloq: 'BLOQ', alerta: 'ALERTA', info: 'INFO', cond: 'COND',
}

export const MATRIZ_VALIDACAO_PEDIDO_VENDA: RegraMatrizPedidoVenda[] = [
  // ── 1 — Identificação e vínculos ──
  {
    id: 'PV1-01',
    secao: 'identificacao_vinculos',
    item: 'Número do pedido de venda',
    motor: 'codigo',
    severidade: "alerta",
    descricao: 'Nº único do sales order / order confirmation presente',
    tooltip_conferencia: 'Confere o número único do pedido de venda',
    base_normativa: 'Rastreabilidade; IN 680/06 art. 15, §1º',
  },
  {
    id: 'PV1-02',
    secao: 'identificacao_vinculos',
    item: 'Natureza do documento',
    motor: 'llm',
    severidade: "alerta",
    descricao: 'Classificar: order confirmation, sales order, proforma ou quotation. Proforma não substitui invoice',
    tooltip_conferencia: 'Identifica o tipo do documento e alerta que proforma não instrui o despacho',
    base_normativa: 'RA art. 553, II; analogia art. 557',
  },
  {
    id: 'PV1-03',
    secao: 'identificacao_vinculos',
    item: 'Vínculo com o PO e a invoice',
    motor: 'cross_doc',
    severidade: "bloq",
    descricao: 'Referência ao nº do PO (PC1-01) e coerência com invoice (S1-03); PV sem PO é red flag',
    tooltip_conferencia: 'Cruza o pedido de venda com o pedido de compra e a invoice',
    base_normativa: 'CISG art. 18; IN 680/06 art. 15, §1º',
  },
  {
    id: 'PV1-04',
    secao: 'identificacao_vinculos',
    item: 'Data de emissão',
    motor: 'codigo',
    severidade: "alerta",
    descricao: 'Presente; posterior ao PO e anterior ou igual à invoice; alertar se futura',
    tooltip_conferencia: 'Valida a data e a ordem cronológica (PO → PV → invoice)',
    base_normativa: 'CISG art. 18',
  },
  {
    id: 'PV1-05',
    secao: 'identificacao_vinculos',
    item: 'Moeda',
    motor: 'codigo',
    severidade: "alerta",
    descricao: 'Moeda ISO 4217; igual à do PO (PC1-05) e da invoice (S5-01)',
    tooltip_conferencia: 'Valida a moeda e a coerência com pedido de compra e invoice',
    base_normativa: 'ISO 4217; normas cambiais BCB',
  },
  // ── 2 — Partes (vendedor e comprador) ──
  {
    id: 'PV2-01',
    secao: 'partes_vendedor_comprador',
    item: 'Vendedor / exportador (emissor)',
    motor: 'cross_doc',
    severidade: "alerta",
    descricao: 'Vendedor identificado; casa com exportador da invoice (S2-05) e PO (PC2-03)',
    tooltip_conferencia: 'Confere o vendedor contra invoice e pedido de compra',
    base_normativa: 'AVA-GATT art. 1º',
  },
  {
    id: 'PV2-02',
    secao: 'partes_vendedor_comprador',
    item: 'Fabricante',
    motor: 'cross_doc',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'Quando vendedor ≠ fabricante: fabricante identificado; alimenta Catálogo DUIMP',
    tooltip_conferencia: 'Extrai o fabricante quando distinto do vendedor — atributo do catálogo',
    base_normativa: 'Catálogo DUIMP',
  },
  {
    id: 'PV2-03',
    secao: 'partes_vendedor_comprador',
    item: 'Comprador / importador',
    motor: 'cross_doc',
    severidade: "alerta",
    descricao: 'Comprador identificado; casa com importador da invoice (S2-03) e PO (PC2-01)',
    tooltip_conferencia: 'Confere o comprador contra invoice e pedido de compra',
    base_normativa: 'AVA-GATT art. 1º',
  },
  {
    id: 'PV2-04',
    secao: 'partes_vendedor_comprador',
    item: 'Consignatário / entrega',
    motor: 'llm',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'Entrega a terceiro/filial diferente do comprador; cruza com notify da invoice (S2-09)',
    tooltip_conferencia: 'Detecta entrega a terceiro e cruza com o notify da invoice',
    base_normativa: 'IN 680/06 art. 29, II',
  },
  {
    id: 'PV2-05',
    secao: 'partes_vendedor_comprador',
    item: 'Partes relacionadas',
    motor: 'llm',
    severidade: "alerta",
    descricao: 'Indícios de vínculo entre vendedor e comprador (intercompany)',
    tooltip_conferencia: 'Sinaliza indício de partes relacionadas para checagem de valoração',
    base_normativa: 'AVA-GATT art. 1º, §2º e art. 15',
  },
  // ── 3 — Termos comerciais e logísticos ──
  {
    id: 'PV3-01',
    secao: 'termos_comerciais_logisticos',
    item: 'Incoterm e local',
    motor: 'cross_doc',
    severidade: "bloq",
    descricao: 'Incoterms® 2020 + local; casa com PO (PC3-01) e invoice (S3-01). Incoterm confirmado ≠ pedido = contraproposta',
    tooltip_conferencia: 'Confere o Incoterm confirmado contra pedido de compra e invoice',
    base_normativa: 'Incoterms® 2020; CISG art. 19',
  },
  {
    id: 'PV3-02',
    secao: 'termos_comerciais_logisticos',
    item: 'Prazo de embarque confirmado',
    motor: 'cross_doc',
    severidade: "alerta",
    descricao: 'Data/janela confirmada; coerente com PO (PC3-02) e embarque BL/AWB',
    tooltip_conferencia: 'Confere o prazo de embarque confirmado contra pedido e conhecimento',
    base_normativa: 'CISG art. 33',
  },
  {
    id: 'PV3-03',
    secao: 'termos_comerciais_logisticos',
    item: 'Origem confirmada',
    motor: 'cross_doc',
    severidade: "alerta",
    descricao: 'País de origem/fabricação confirmado; coerente com CO, PO e rota',
    tooltip_conferencia: 'Cruza a origem confirmada com certificado, pedido e rota',
    base_normativa: 'RA arts. 30–35',
  },
  {
    id: 'PV3-04',
    secao: 'termos_comerciais_logisticos',
    item: 'Termos de pagamento confirmados',
    motor: 'cross_doc',
    severidade: "alerta",
    descricao: 'Condição confirmada coerente com PO, invoice e câmbio',
    tooltip_conferencia: 'Confere os termos de pagamento confirmados contra pedido, invoice e câmbio',
    base_normativa: 'Normas cambiais BCB',
  },
  {
    id: 'PV3-05',
    secao: 'termos_comerciais_logisticos',
    item: 'Validade da confirmação/oferta',
    motor: 'llm',
    severidade: "info",
    descricao: 'Prazo de validade da confirmação ou proforma',
    tooltip_conferencia: 'Verifica o prazo de validade da confirmação/proforma',
    base_normativa: 'CISG art. 18, §2º',
  },
  // ── 4 — Itens de linha ──
  {
    id: 'PV4-01',
    secao: 'itens_linha',
    item: 'Part number / SKU',
    motor: 'cross_doc',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'PN/SKU por item; casa com PO, invoice e catálogo',
    tooltip_conferencia: 'Confere part numbers contra pedido, invoice e catálogo',
    base_normativa: 'Catálogo DUIMP',
  },
  {
    id: 'PV4-02',
    secao: 'itens_linha',
    item: 'Descrição do produto',
    motor: 'cross_doc',
    severidade: "alerta",
    descricao: 'Descrição específica; coerente com PO e base da descrição da invoice',
    tooltip_conferencia: 'Confere a descrição confirmada contra pedido e invoice',
    base_normativa: 'AVA-GATT; Catálogo DUIMP',
  },
  {
    id: 'PV4-03',
    secao: 'itens_linha',
    item: 'Quantidade confirmada',
    motor: 'cross_doc',
    severidade: "bloq",
    descricao: 'Quantidade confirmada = quantidade pedida (PC4-03) e faturada (S4-05)',
    tooltip_conferencia: 'Compara a quantidade confirmada com a pedida e a faturada',
    base_normativa: 'CISG art. 19',
  },
  {
    id: 'PV4-04',
    secao: 'itens_linha',
    item: 'Preço unitário confirmado',
    motor: 'cross_doc',
    severidade: "bloq",
    descricao: 'Preço confirmado = preço do PO e da invoice; divergência é red flag de valoração',
    tooltip_conferencia: 'Compara o preço confirmado com o pedido e o faturado — divergência é red flag',
    base_normativa: 'AVA-GATT art. 1º; CISG art. 19; RA art. 711',
  },
  {
    id: 'PV4-05',
    secao: 'itens_linha',
    item: 'Marca e modelo',
    motor: 'llm',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'Marca/modelo por item quando presentes; alimentam Catálogo DUIMP',
    tooltip_conferencia: 'Extrai marca e modelo por item — atributos do catálogo',
    base_normativa: 'Catálogo de Produtos DUIMP',
  },
  // ── 5 — Valores e condições financeiras ──
  {
    id: 'PV5-01',
    secao: 'valores_financeiros',
    item: 'Multiplicação de linha',
    motor: 'codigo',
    severidade: "alerta",
    descricao: 'Qtd × preço unitário = total da linha',
    tooltip_conferencia: 'Recalcula quantidade × preço unitário por linha',
    base_normativa: 'Consistência aritmética',
  },
  {
    id: 'PV5-02',
    secao: 'valores_financeiros',
    item: 'Somatório e total',
    motor: 'codigo',
    severidade: "alerta",
    descricao: 'Σ linhas + acréscimos − descontos = total confirmado',
    tooltip_conferencia: 'Soma as linhas e confere o total confirmado',
    base_normativa: 'Consistência aritmética',
  },
  {
    id: 'PV5-03',
    secao: 'valores_financeiros',
    item: 'Total PV × PO × invoice',
    motor: 'cross_doc',
    severidade: "bloq",
    descricao: 'Total confirmado = total do PO e da invoice; divergência global é red flag',
    tooltip_conferencia: 'Compara o total confirmado com pedido e invoice',
    base_normativa: 'AVA-GATT art. 1º; RA art. 711',
  },
  {
    id: 'PV5-04',
    secao: 'valores_financeiros',
    item: 'Frete e seguro (se CIF/CIP)',
    motor: 'cross_doc',
    severidade: "alerta",
    descricao: 'Em C/D: frete e seguro discriminados coerentes com Incoterm e invoice',
    tooltip_conferencia: 'Confere frete e seguro confirmados contra Incoterm e invoice',
    base_normativa: 'AVA-GATT art. 8º; Incoterms® 2020',
  },
  {
    id: 'PV5-05',
    secao: 'valores_financeiros',
    item: 'Descontos e custos adicionais',
    motor: 'llm',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'Desconto com natureza; royalties/ferramental/assists sinalizados',
    tooltip_conferencia: 'Confere descontos e detecta custos que compõem o valor aduaneiro',
    base_normativa: 'AVA-GATT art. 8º; RA art. 557',
  },
  // ── 6 — Dados bancários e câmbio ──
  {
    id: 'PV6-01',
    secao: 'dados_bancarios_cambio',
    item: 'Beneficiário bancário',
    motor: 'cross_doc',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'Banco/conta do vendedor; coerente com invoice e PO',
    tooltip_conferencia: 'Confere dados bancários contra invoice e pedido de compra',
    base_normativa: 'Res. BCB 277/2022',
  },
  {
    id: 'PV6-02',
    secao: 'dados_bancarios_cambio',
    item: 'SWIFT / IBAN',
    motor: 'codigo',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'Formato internacional (ISO 9362 / ISO 13616) quando presente',
    tooltip_conferencia: 'Valida SWIFT/IBAN quando presente',
    base_normativa: 'ISO 9362; ISO 13616',
  },
  {
    id: 'PV6-03',
    secao: 'dados_bancarios_cambio',
    item: 'Beneficiário ≠ vendedor',
    motor: 'cross_doc',
    severidade: "bloq",
    descricao: 'Pagamento a terceiro distinto do vendedor: red flag de triangulação financeira',
    tooltip_conferencia: 'Sinaliza pagamento a terceiro distinto do vendedor — red flag',
    base_normativa: 'Res. BCB 277/2022; DL 1.455/76 art. 23',
  },
  // ── 7 — Aceite e formação do contrato ──
  {
    id: 'PV7-01',
    secao: 'aceite_contrato',
    item: 'Assinatura/aprovação do vendedor',
    motor: 'llm',
    severidade: "alerta",
    descricao: 'Assinatura ou aprovação eletrônica do vendedor confirmando a venda',
    tooltip_conferencia: 'Verifica a assinatura/aprovação do vendedor',
    base_normativa: 'CISG art. 18',
  },
  {
    id: 'PV7-02',
    secao: 'aceite_contrato',
    item: 'Aceite com modificações (contraproposta)',
    motor: 'cross_doc',
    severidade: "bloq",
    descricao: 'Divergências materiais PO↔PV (preço, quantidade, Incoterm, prazo) = contraproposta CISG art. 19',
    tooltip_conferencia: 'Detecta contraproposta que descaracteriza o aceite',
    base_normativa: 'CISG art. 19',
  },
  {
    id: 'PV7-03',
    secao: 'aceite_contrato',
    item: 'Referência a termos e condições',
    motor: 'llm',
    severidade: "info",
    descricao: 'Referência a T&C de venda / contrato-quadro',
    tooltip_conferencia: 'Detecta termos e condições de venda anexos',
    base_normativa: 'CISG; contrato internacional',
  },
  // ── 8 — Sinais regulatórios antecipados ──
  {
    id: 'PV8-01',
    secao: 'sinais_regulatorios',
    item: 'NCM / HS informada pelo vendedor',
    motor: 'cross_doc',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'HS/NCM informada pelo exportador como insumo à pré-classificação, sem vincular',
    tooltip_conferencia: 'Usa a HS do vendedor como insumo à pré-classificação, sem vinculação',
    base_normativa: 'NCM/SH; responsabilidade do importador',
  },
  {
    id: 'PV8-02',
    secao: 'sinais_regulatorios',
    item: 'Anuências antecipadas',
    motor: 'cross_doc_rag',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'Produto que exigirá LPCO: sinalizar para licenciar antes do embarque',
    tooltip_conferencia: 'Sinaliza anuências prováveis já na confirmação da venda',
    base_normativa: 'Tratamento administrativo; LPCO',
  },
  {
    id: 'PV8-03',
    secao: 'sinais_regulatorios',
    item: 'Especificações técnicas / certificados prometidos',
    motor: 'llm',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'Compromissos do vendedor (laudo, ficha técnica, MSDS) que instruirão o despacho',
    tooltip_conferencia: 'Detecta certificados/laudos prometidos que instruirão o despacho',
    base_normativa: 'Anuências específicas; carga perigosa',
  },
  // ── 9 — Consistência e risco ──
  {
    id: 'PV9-01',
    secao: 'consistencia_risco',
    item: 'Legibilidade e integridade',
    motor: 'llm',
    severidade: "alerta",
    descricao: 'Legível, sem rasuras ou alterações suspeitas',
    tooltip_conferencia: 'Avalia legibilidade e integridade do pedido de venda',
    base_normativa: 'Boa prática documental',
  },
  {
    id: 'PV9-02',
    secao: 'consistencia_risco',
    item: 'Simetria PV × PO × invoice',
    motor: 'cross_doc',
    severidade: "bloq",
    descricao: 'Parecer único de simetria: divergências materiais sinalizam contrato não fechado ou valoração',
    tooltip_conferencia: 'Consolida a simetria entre pedido de compra, pedido de venda e invoice',
    base_normativa: 'CISG art. 19; AVA-GATT',
  },
  {
    id: 'PV9-03',
    secao: 'consistencia_risco',
    item: 'Plausibilidade de preço',
    motor: 'api_llm',
    severidade: "info",
    descricao: 'Preço confirmado vs histórico e mercado; outlier severo sinaliza valoração',
    tooltip_conferencia: 'Compara preços confirmados com histórico e mercado',
    base_normativa: 'MP 2.158-35/01 art. 88; RA art. 703',
  },
  {
    id: 'PV9-04',
    secao: 'consistencia_risco',
    item: 'Risco de valoração / contrato / câmbio',
    motor: 'codigo',
    severidade: "bloq",
    descricao: 'Consolidar: contraproposta não fechada, divergência de preço, pagamento a terceiro',
    tooltip_conferencia: 'Consolida o risco de contrato, valoração e câmbio',
    base_normativa: 'CISG art. 19; AVA-GATT; DL 1.455/76 art. 23',
  },
  {
    id: 'PV9-05',
    secao: 'consistencia_risco',
    item: 'Score documental',
    motor: 'codigo',
    severidade: null,
    descricao: 'Score 0–100 sobre regras ALERTA/INFO aplicáveis',
    tooltip_conferencia: 'Pontuação de qualidade documental do pedido de venda',
    base_normativa: 'Metodologia interna',
  },
  {
    id: 'PV9-06',
    secao: 'consistencia_risco',
    item: 'Classificação de risco (gates + score)',
    motor: 'codigo',
    severidade: null,
    descricao: 'Pior entre score e gates. Gates: PV1-03, PV3-01, PV4-03, PV4-04, PV5-03, PV6-03, PV7-02, PV9-02, PV9-04',
    tooltip_conferencia: 'Classificação final combinando gates e pontuação',
    base_normativa: 'Metodologia interna',
  },
]

export const GATES_MATRIZ_PEDIDO_VENDA: readonly string[] =
  MATRIZ_VALIDACAO_PEDIDO_VENDA.filter((regra) => regra.severidade === 'bloq').map((regra) => regra.id)

export const GATES_CRITICOS_MATRIZ_PEDIDO_VENDA: readonly string[] = [
  'PV7-02',
  'PV9-02',
  'PV4-04',
  'PV5-03',
  'PV6-03',
]

export type ClassificacaoRiscoPedidoVenda = 'baixo_risco' | 'atencao' | 'alto_risco' | 'critico'

export const ROTULO_CLASSIFICACAO_RISCO_PEDIDO_VENDA: Record<ClassificacaoRiscoPedidoVenda, string> = {
  baixo_risco: 'Baixo risco', atencao: 'Atenção', alto_risco: 'Alto risco', critico: 'Crítico',
}

export function classificacaoPorFaixaScorePedidoVenda(score: number): ClassificacaoRiscoPedidoVenda {
  if (score >= 95) return 'baixo_risco'
  if (score >= 80) return 'atencao'
  if (score >= 60) return 'alto_risco'
  return 'critico'
}

export function classificacaoRiscoPedidoVenda(score: number, gatesFalhos: readonly string[]): ClassificacaoRiscoPedidoVenda {
  const porScore = classificacaoPorFaixaScorePedidoVenda(score)
  if (gatesFalhos.length === 0) return porScore
  const temGateCritico = gatesFalhos.some((id) => GATES_CRITICOS_MATRIZ_PEDIDO_VENDA.includes(id))
  if (gatesFalhos.length >= 2 || temGateCritico) return 'critico'
  return porScore === 'critico' ? 'critico' : 'alto_risco'
}

export function regraMatrizPedidoVendaPorId(id: string): RegraMatrizPedidoVenda | undefined {
  return MATRIZ_VALIDACAO_PEDIDO_VENDA.find((r) => r.id === id)
}
