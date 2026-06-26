/**
 * matriz-validacao-invoice-smart-read.ts — SSOT Matriz Consolidada de Análise de Fatura Comercial
 *
 * Pipeline: OCR → Passo 1 (Código) → Passo 2 (API CNPJ) → Passo 3 (LLM Analista) → Passo 4 (UI)
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
  descricao: string
}

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
  { id: 'S1-01', secao: 'identificacao', item: 'Número da Invoice', motor: 'codigo', descricao: 'Identificação única obrigatória' },
  { id: 'S1-02', secao: 'identificacao', item: 'Data de Emissão', motor: 'codigo', descricao: 'Presente; alerta se futura ou > 180 dias' },
  { id: 'S1-03', secao: 'identificacao', item: 'Vínculo PO / Proforma', motor: 'llm', descricao: 'Extrair PO ou referência de Proforma' },
  { id: 'S1-04', secao: 'identificacao', item: 'Paginação', motor: 'codigo', descricao: 'Total de páginas vs rodapé' },
  // Seção 2
  { id: 'S2-01', secao: 'cadastral', item: 'CNPJ Importador — máscara', motor: 'codigo', descricao: 'Regex + Módulo 11' },
  { id: 'S2-02', secao: 'cadastral', item: 'CNPJ — status RFB', motor: 'api', descricao: 'Consulta externa — ATIVO na Receita' },
  { id: 'S2-03', secao: 'cadastral', item: 'Fuzzy Match Razão Social', motor: 'llm', descricao: 'Invoice vs JSON oficial CNPJ' },
  { id: 'S2-04', secao: 'cadastral', item: 'Fuzzy Match Endereço', motor: 'llm', descricao: 'Endereço invoice vs fiscal RFB' },
  { id: 'S2-05', secao: 'cadastral', item: 'Exportador (Seller)', motor: 'llm', descricao: 'Nome, endereço internacional, Tax ID' },
  { id: 'S2-06', secao: 'cadastral', item: 'Fabricante', motor: 'llm', descricao: 'Exportador ou terceiro — DUIMP Catálogo' },
  { id: 'S2-07', secao: 'cadastral', item: 'Notify Party / Delivery', motor: 'llm', descricao: 'Entrega em filial diferente do importador' },
  // Seção 3
  { id: 'S3-01', secao: 'logistica', item: 'Incoterm e local', motor: 'codigo', descricao: 'Sigla 3 letras + local nomeado' },
  { id: 'S3-02', secao: 'logistica', item: 'Coerência geográfica', motor: 'llm', descricao: 'Local Incoterm vs rota (ex: FOB porto)' },
  { id: 'S3-03', secao: 'logistica', item: 'Rotas e fluxos', motor: 'llm', descricao: 'Origem, aquisição, procedência — triangulação' },
  { id: 'S3-04', secao: 'logistica', item: 'Regimes especiais', motor: 'rag', descricao: 'Drawback, Suframa/ZFM' },
  // Seção 4
  { id: 'S4-01', secao: 'itens_fiscais', item: 'Part Number', motor: 'codigo', descricao: 'Referência do item para histórico' },
  { id: 'S4-02', secao: 'itens_fiscais', item: 'Descrição comercial', motor: 'llm', descricao: 'Proibir genéricos; exigir composição/função' },
  { id: 'S4-03', secao: 'itens_fiscais', item: 'Pré-classificação NCM', motor: 'llm', descricao: 'Capítulo/posição vs descrição e NCM declarado' },
  { id: 'S4-04', secao: 'itens_fiscais', item: 'NCM declarado', motor: 'codigo', descricao: '6 dígitos SH / 8 dígitos Mercosul' },
  { id: 'S4-05', secao: 'itens_fiscais', item: 'Unidades de medida', motor: 'codigo', descricao: 'Quantidade e unidade por linha' },
  // Seção 5
  { id: 'S5-01', secao: 'financeiro', item: 'Moeda ISO 4217', motor: 'codigo', descricao: 'USD, EUR, GBP — sem símbolos ambíguos' },
  { id: 'S5-02', secao: 'financeiro', item: 'Unicidade cambial', motor: 'codigo', descricao: 'Moeda linhas = moeda totais' },
  { id: 'S5-03', secao: 'financeiro', item: 'Multiplicação de linha', motor: 'codigo', descricao: 'Qtd × preço unitário = total linha' },
  { id: 'S5-04', secao: 'financeiro', item: 'Somatório mercadorias', motor: 'codigo', descricao: 'Σ linhas = subtotal' },
  { id: 'S5-05', secao: 'financeiro', item: 'Fechamento financeiro', motor: 'codigo', descricao: 'Subtotal + frete + seguro + acréscimos − descontos = total' },
  { id: 'S5-06', secao: 'financeiro', item: 'Rateios finais', motor: 'codigo', descricao: 'Rateio proporcional frete/desconto global' },
  // Seção 6
  { id: 'S6-01', secao: 'bancario', item: 'Beneficiário bancário', motor: 'llm', descricao: 'Banco, agência, conta exportador' },
  { id: 'S6-02', secao: 'bancario', item: 'SWIFT / IBAN / Routing', motor: 'codigo', descricao: 'Regex formato internacional' },
  { id: 'S6-03', secao: 'bancario', item: 'Termos de pagamento', motor: 'llm', descricao: 'À vista, 30 dias, parcelado' },
  // Seção 7
  { id: 'S7-01', secao: 'pesos_embalagens', item: 'Peso bruto ≥ líquido', motor: 'codigo', descricao: 'Gross Weight ≥ Net Weight' },
  { id: 'S7-02', secao: 'pesos_embalagens', item: 'Consistência volumes', motor: 'codigo', descricao: 'Contagem volumes vs sumário' },
  { id: 'S7-03', secao: 'pesos_embalagens', item: 'Embalagem madeira (MAPA)', motor: 'llm', descricao: 'Paletes/caixas madeira — NIMF 15' },
  // Seção 8
  { id: 'S8-01', secao: 'legitimidade', item: 'Assinatura / carimbo', motor: 'llm', descricao: 'Assinatura mecânica, digital ou selo' },
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
