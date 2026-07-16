/**
 * matriz-validacao-invoice-smart-read.ts — SSOT Matriz Consolidada de Análise de Fatura Comercial
 *
 * Pipeline: OCR → Passo 1 (Código) → Passo 2 (API CNPJ) → Passo 3 (LLM Analista) → Passo 4 (UI)
 *
 * Base normativa geral: RA (Decreto 6.759/2009) arts. 553/557/711/725 · IN SRF 680/2006 arts. 15 e 18 ·
 * AVA-GATT (Decreto 2.781/1998) arts. 1º e 8º · Tabela TI NCM (Mercosul) · Incoterms® 2020 ·
 * IN RFB 2002/2020 (Catálogo DUIMP) · ISO 4217 · Res. BCB 277/2022 · Portaria MAPA 514/2022 + NIMF 15.
 *
 * `base_normativa` por regra espelha as matrizes irmãs já publicadas (P, PC, AW, BL) onde há
 * referência cruzada explícita (ex.: P5-03 ↔ S7-01, P1-04 ↔ S1-03).
 */

export type SecaoMatrizInvoice =
  | 'identificacao'
  | 'cadastral'
  | 'logistica'
  | 'itens_fiscais'
  | 'financeiro'
  | 'bancario'
  | 'pesos_embalagens'
  | 'legitimidade'

export type MotorValidacaoInvoice = 'codigo' | 'api' | 'llm' | 'rag'

export type StatusMatrizInvoice = 'verde' | 'amarelo' | 'vermelho'

export type RegraMatrizInvoice = {
  id: string
  secao: SecaoMatrizInvoice
  item: string
  motor: MotorValidacaoInvoice
  /** Nota técnica para prompt e motor — não exibir direto na UI */
  descricao: string
  /** Texto da tooltip (ícone i) — linguagem do usuário, máx ~90 caracteres */
  tooltip_conferencia: string
  /** Citação normativa que fundamenta a regra */
  base_normativa: string
}

/** Ordem canônica das seções na UI (matriz 1→8). */
export const ORDEM_SECOES_MATRIZ_INVOICE: readonly SecaoMatrizInvoice[] = [
  'identificacao',
  'cadastral',
  'logistica',
  'itens_fiscais',
  'financeiro',
  'bancario',
  'pesos_embalagens',
  'legitimidade',
] as const

export const ROTULO_SECAO_MATRIZ_INVOICE: Record<SecaoMatrizInvoice, string> = {
  identificacao: '1 — Identificação e rastreabilidade',
  cadastral: '2 — Qualificação das partes (RFB)',
  logistica: '3 — Logística e enquadramentos',
  itens_fiscais: '4 — Itens de linha e inteligência fiscal',
  financeiro: '5 — Auditoria financeira e câmbio',
  bancario: '6 — Dados bancários',
  pesos_embalagens: '7 — Pesos, volumes e embalagens',
  legitimidade: '8 — Assinatura e legitimidade',
}

/** Matriz completa — fonte única para documentação, testes e orquestração. */
export const MATRIZ_VALIDACAO_INVOICE: RegraMatrizInvoice[] = [
  // Seção 1
  {
    id: 'S1-01',
    secao: 'identificacao',
    item: 'Número da Invoice',
    motor: 'codigo',
    descricao: 'Identificação única obrigatória',
    tooltip_conferencia: 'Confere se a invoice traz número único de identificação do documento',
    base_normativa: 'RA art. 553, III; IN 680/06 art. 18, III',
  },
  {
    id: 'S1-02',
    secao: 'identificacao',
    item: 'Data de Emissão',
    motor: 'codigo',
    descricao: 'Presente; alerta se futura ou > 180 dias',
    tooltip_conferencia: 'Valida a data de emissão — alerta se futura ou com mais de 180 dias',
    base_normativa: 'Coerência documental (IN 680/06 arts. 25–32)',
  },
  {
    id: 'S1-03',
    secao: 'identificacao',
    item: 'Vínculo PO / Proforma',
    motor: 'llm',
    descricao: 'Extrair PO ou referência de Proforma',
    tooltip_conferencia: 'Busca referência de pedido de compra ou proforma vinculada à invoice',
    base_normativa: 'IN 680/06 art. 15, §1º; coerência do dossiê comercial',
  },
  {
    id: 'S1-04',
    secao: 'identificacao',
    item: 'Paginação',
    motor: 'codigo',
    descricao: 'Total de páginas vs rodapé',
    tooltip_conferencia: 'Confronta o total de páginas declarado com a paginação do arquivo',
    base_normativa: 'Integridade documental — IN 680/06 art. 18, §3º c/c MP 2.200-2/2001',
  },
  // Seção 2
  {
    id: 'S2-01',
    secao: 'cadastral',
    item: 'CNPJ Importador — máscara',
    motor: 'codigo',
    descricao: 'Regex + Módulo 11',
    tooltip_conferencia: 'Valida formato e dígitos verificadores do CNPJ do importador',
    base_normativa: 'IN RFB 2119/2022; Dicionário DI/RFB (CNPJ 14 posições)',
  },
  {
    id: 'S2-02',
    secao: 'cadastral',
    item: 'CNPJ — status RFB',
    motor: 'api',
    descricao: 'Consulta externa — ATIVO na Receita',
    tooltip_conferencia: 'Consulta se o CNPJ do importador está ativo na Receita Federal',
    base_normativa: 'IN 680/06 art. 15, I (regularidade cadastral)',
  },
  {
    id: 'S2-03',
    secao: 'cadastral',
    item: 'Análise da razão social do importador',
    motor: 'llm',
    descricao: 'Comparação semântica invoice vs JSON oficial CNPJ',
    tooltip_conferencia: 'Compara o nome do importador na invoice com o cadastro oficial do CNPJ',
    base_normativa: 'Coerência cadastral (IN 680/06 art. 15)',
  },
  {
    id: 'S2-04',
    secao: 'cadastral',
    item: 'Análise do endereço do importador',
    motor: 'llm',
    descricao: 'Endereço invoice vs fiscal RFB',
    tooltip_conferencia: 'Compara o endereço do importador na invoice com o cadastro da RFB',
    base_normativa: 'IN 680/06 art. 15; coerência do consignatário com cadastro fiscal',
  },
  {
    id: 'S2-05',
    secao: 'cadastral',
    item: 'Nome do exportador',
    motor: 'llm',
    descricao: 'Nome do seller na invoice',
    tooltip_conferencia: 'Confere se o documento traz o nome do exportador identificado',
    base_normativa: 'IN 680/06 art. 18; RA art. 553',
  },
  {
    id: 'S2-06',
    secao: 'cadastral',
    item: 'Endereço do exportador',
    motor: 'llm',
    descricao: 'Endereço internacional do exportador',
    tooltip_conferencia: 'Confere se o endereço do exportador está presente na invoice',
    base_normativa: 'IN 680/06 art. 18; RA art. 553',
  },
  {
    id: 'S2-07',
    secao: 'cadastral',
    item: 'Nome do fabricante',
    motor: 'llm',
    descricao: 'Exportador ou terceiro — DUIMP Catálogo',
    tooltip_conferencia: 'Confere se o fabricante está identificado — exigido no catálogo DUIMP',
    base_normativa:
      'IN 680/06, art. 4º-A e Anexo III (Duimp/Catálogo — incl. IN RFB 2002/2020)',
  },
  {
    id: 'S2-08',
    secao: 'cadastral',
    item: 'Endereço do fabricante',
    motor: 'llm',
    descricao: 'Endereço do fabricante quando distinto do exportador',
    tooltip_conferencia: 'Confere se o endereço do fabricante está presente quando aplicável',
    base_normativa: 'Catálogo de Produtos DUIMP; IN 680/06 art. 4º-A',
  },
  {
    id: 'S2-09',
    secao: 'cadastral',
    item: 'Notify party / entrega',
    motor: 'llm',
    descricao: 'Entrega em filial diferente do importador',
    tooltip_conferencia: 'Verifica notify party ou endereço de entrega diferente do importador',
    base_normativa: 'IN 680/06 art. 29, II',
  },
  // Seção 3
  {
    id: 'S3-01',
    secao: 'logistica',
    item: 'Incoterm e local',
    motor: 'codigo',
    descricao: 'Sigla 3 letras + local nomeado',
    tooltip_conferencia: 'Valida sigla Incoterm de três letras e o local nomeado na invoice',
    base_normativa: 'Incoterms® 2020; AVA-GATT art. 8º',
  },
  {
    id: 'S3-02',
    secao: 'logistica',
    item: 'Coerência geográfica',
    motor: 'llm',
    descricao: 'Local Incoterm vs rota (ex: FOB porto)',
    tooltip_conferencia: 'Cruza o local do Incoterm com porto, aeroporto ou cidade da rota declarada',
    base_normativa: 'RA art. 553; coerência geográfica',
  },
  {
    id: 'S3-03',
    secao: 'logistica',
    item: 'Rotas e fluxos',
    motor: 'llm',
    descricao: 'Origem, aquisição, procedência — triangulação',
    tooltip_conferencia: 'Analisa origem, aquisição e procedência — detecta triangulação comercial',
    base_normativa:
      'Acordo de Valoração Aduaneira (art. 1º c/c 15); RA arts. 76–83 (valoração); controle de origem',
  },
  {
    id: 'S3-04',
    secao: 'logistica',
    item: 'Regimes especiais',
    motor: 'rag',
    descricao: 'Drawback, Suframa/ZFM',
    tooltip_conferencia: 'Identifica indícios de Drawback, Suframa ou Zona Franca de Manaus',
    base_normativa: 'RA arts. 30–35 (drawback); Decreto 7.212/2010 (Suframa/ZFM)',
  },
  // Seção 4
  {
    id: 'S4-01',
    secao: 'itens_fiscais',
    item: 'Part Number',
    motor: 'codigo',
    descricao: 'Referência do item para histórico',
    tooltip_conferencia: 'Verifica se cada linha traz part number para rastreabilidade',
    base_normativa: 'Catálogo DUIMP; rastreabilidade',
  },
  {
    id: 'S4-02',
    secao: 'itens_fiscais',
    item: 'Descrição comercial',
    motor: 'llm',
    descricao: 'Proibir genéricos; exigir composição/função',
    tooltip_conferencia: 'Exige descrição específica do produto — rejeita termos genéricos',
    base_normativa: 'RA art. 557; AVA-GATT art. 1º (descrição determinável)',
  },
  {
    id: 'S4-03',
    secao: 'itens_fiscais',
    item: 'Pré-classificação NCM',
    motor: 'llm',
    descricao: 'Capítulo/posição vs descrição e NCM declarado',
    tooltip_conferencia: 'Cruza capítulo e posição NCM com a descrição antes da declaração',
    base_normativa: 'Pré-classificação; Tabela TI NCM (Mercosul); RA art. 557',
  },
  {
    id: 'S4-04',
    secao: 'itens_fiscais',
    item: 'NCM declarado',
    motor: 'codigo',
    descricao: '6 dígitos SH / 8 dígitos Mercosul',
    tooltip_conferencia: 'Valida NCM com seis dígitos SH ou oito dígitos Mercosul por linha',
    base_normativa: 'RA art. 557; Tabela TI NCM (Mercosul); IN 680/06 Anexo III',
  },
  {
    id: 'S4-05',
    secao: 'itens_fiscais',
    item: 'Unidades de medida',
    motor: 'codigo',
    descricao: 'Quantidade e unidade por linha',
    tooltip_conferencia: 'Exige quantidade e unidade comercial preenchidas em cada linha',
    base_normativa: 'Dicionário DI/RFB; CISG art. 35 (quantidade determinável)',
  },
  // Seção 5
  {
    id: 'S5-01',
    secao: 'financeiro',
    item: 'Moeda ISO 4217',
    motor: 'codigo',
    descricao: 'USD, EUR, GBP — sem símbolos ambíguos',
    tooltip_conferencia: 'Confere moeda no padrão ISO — USD, EUR ou GBP sem símbolos ambíguos',
    base_normativa: 'ISO 4217; base de conversão (RA art. 97)',
  },
  {
    id: 'S5-02',
    secao: 'financeiro',
    item: 'Unicidade cambial',
    motor: 'codigo',
    descricao: 'Moeda linhas = moeda totais',
    tooltip_conferencia: 'Garante a mesma moeda nas linhas e nos totais da invoice',
    base_normativa: 'AVA-GATT art. 1º; coerência cambial do documento',
  },
  {
    id: 'S5-03',
    secao: 'financeiro',
    item: 'Multiplicação de linha',
    motor: 'codigo',
    descricao: 'Qtd × preço unitário = total linha',
    tooltip_conferencia: 'Recalcula quantidade vezes preço unitário e confere o total da linha',
    base_normativa: 'Consistência aritmética; AVA-GATT art. 1º',
  },
  {
    id: 'S5-04',
    secao: 'financeiro',
    item: 'Somatório mercadorias',
    motor: 'codigo',
    descricao: 'Σ linhas = subtotal',
    tooltip_conferencia: 'Soma os totais das linhas e confere com o subtotal declarado',
    base_normativa: 'Consistência aritmética; AVA-GATT art. 8º',
  },
  {
    id: 'S5-05',
    secao: 'financeiro',
    item: 'Fechamento financeiro',
    motor: 'codigo',
    descricao: 'Subtotal + frete + seguro + acréscimos − descontos = total',
    tooltip_conferencia: 'Fecha subtotal, frete, seguro, acréscimos e descontos até o total final',
    base_normativa: 'AVA-GATT art. 8º, 1–2 (valoração); RA art. 711',
  },
  {
    id: 'S5-06',
    secao: 'financeiro',
    item: 'Rateios finais',
    motor: 'codigo',
    descricao: 'Rateio proporcional frete/desconto global',
    tooltip_conferencia: 'Verifica rateio proporcional de frete ou desconto global entre linhas',
    base_normativa: 'AVA-GATT art. 8º; rateio proporcional (RA art. 557)',
  },
  // Seção 6
  {
    id: 'S6-01',
    secao: 'bancario',
    item: 'Beneficiário bancário',
    motor: 'llm',
    descricao: 'Banco, agência, conta exportador',
    tooltip_conferencia: 'Confere banco, agência e conta do beneficiário do pagamento',
    base_normativa: 'Normas cambiais BCB (Res. 277/2022); Lei 14.286/2021',
  },
  {
    id: 'S6-02',
    secao: 'bancario',
    item: 'SWIFT / IBAN / Routing',
    motor: 'codigo',
    descricao: 'Regex formato internacional',
    tooltip_conferencia: 'Valida formato internacional de SWIFT, IBAN ou routing number',
    base_normativa: 'Praxe bancária internacional (SWIFT/BIC; IBAN ISO 13616)',
  },
  {
    id: 'S6-03',
    secao: 'bancario',
    item: 'Termos de pagamento',
    motor: 'llm',
    descricao: 'À vista, 30 dias, parcelado',
    tooltip_conferencia: 'Identifica prazo e condição de pagamento — à vista, dias ou parcelado',
    base_normativa: 'Normas cambiais BCB; CISG art. 33 (prazo de entrega/pagamento)',
  },
  // Seção 7
  {
    id: 'S7-01',
    secao: 'pesos_embalagens',
    item: 'Peso bruto ≥ líquido',
    motor: 'codigo',
    descricao: 'Gross Weight ≥ Net Weight',
    tooltip_conferencia: 'Garante que o peso bruto seja maior ou igual ao peso líquido',
    base_normativa: 'Consistência física; IN 680/06 art. 29 (espelho P5-03)',
  },
  {
    id: 'S7-02',
    secao: 'pesos_embalagens',
    item: 'Consistência volumes',
    motor: 'codigo',
    descricao: 'Contagem volumes vs sumário',
    tooltip_conferencia: 'Confronta a contagem de volumes com o sumário de embalagens',
    base_normativa: 'IN 680/06 art. 18; Manual RFB (espelho P4-06)',
  },
  {
    id: 'S7-03',
    secao: 'pesos_embalagens',
    item: 'Embalagem madeira (MAPA)',
    motor: 'llm',
    descricao: 'Paletes/caixas madeira — NIMF 15',
    tooltip_conferencia: 'Detecta embalagem de madeira e exigência de tratamento NIMF 15',
    base_normativa: 'Portaria MAPA 514/2022; NIMF 15 (CIPV/FAO)',
  },
  // Seção 8
  {
    id: 'S8-01',
    secao: 'legitimidade',
    item: 'Assinatura / carimbo',
    motor: 'llm',
    descricao: 'Assinatura mecânica, digital ou selo',
    tooltip_conferencia: 'Verifica assinatura, carimbo ou selo de autenticidade no documento',
    base_normativa: 'IN 680/06 art. 18, §3º c/c MP 2.200-2/2001',
  },
]

export function severidadeParaStatusMatriz(
  severidade: 'critico' | 'atencao' | 'informativo',
): StatusMatrizInvoice {
  if (severidade === 'critico') return 'vermelho'
  if (severidade === 'atencao') return 'amarelo'
  return 'verde'
}

export function regraMatrizPorId(id: string): RegraMatrizInvoice | undefined {
  return MATRIZ_VALIDACAO_INVOICE.find((r) => r.id === id)
}
