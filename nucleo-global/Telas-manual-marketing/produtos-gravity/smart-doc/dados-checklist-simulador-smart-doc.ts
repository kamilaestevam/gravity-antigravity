import type { TipoDocumentoSimulador } from './documentos-preview-simulador-smart-doc'

export type StatusChecklistSimulador = 'verde' | 'amarelo' | 'vermelho' | 'pendente'

export type ItemChecklistSimulador = {
  id: string
  secao: string
  secaoRotulo: string
  item: string
  motor: 'Código' | 'API' | 'IA' | 'RAG'
  resultado: string
  status: StatusChecklistSimulador
  rotuloStatus: 'CONFORME' | 'ATENÇÃO' | 'FALHA' | 'PENDENTE'
  riscoId?: string
}

export type SecaoChecklistSimulador = {
  secao: string
  rotulo: string
  itens: ItemChecklistSimulador[]
}

const MOTOR: Record<string, ItemChecklistSimulador['motor']> = {
  codigo: 'Código',
  api: 'API',
  llm: 'IA',
  rag: 'RAG',
}

function item(
  id: string,
  secao: string,
  secaoRotulo: string,
  nome: string,
  motorKey: keyof typeof MOTOR,
  resultado: string,
  status: StatusChecklistSimulador,
  riscoId?: string,
): ItemChecklistSimulador {
  const rotuloStatus =
    status === 'verde'
      ? 'CONFORME'
      : status === 'amarelo'
        ? 'ATENÇÃO'
        : status === 'vermelho'
          ? 'FALHA'
          : 'PENDENTE'
  return {
    id,
    secao,
    secaoRotulo,
    item: nome,
    motor: MOTOR[motorKey],
    resultado,
    status,
    rotuloStatus,
    riscoId,
  }
}

const CHECKLIST_INVOICE: ItemChecklistSimulador[] = [
  item('S1-01', 'identificacao', '1 — Identificação e rastreabilidade', 'Número da Invoice', 'codigo', 'INV-9821', 'verde'),
  item('S1-02', 'identificacao', '1 — Identificação e rastreabilidade', 'Data de Emissão', 'codigo', '14/03/2026', 'verde'),
  item('S2-01', 'cadastral', '2 — Qualificação das partes (RFB)', 'CNPJ Importador — máscara', 'codigo', '47.829.103/0001-56', 'verde'),
  item('S2-02', 'cadastral', '2 — Qualificação das partes (RFB)', 'CNPJ — status RFB', 'api', 'ATIVO', 'verde', 'risco-cnpj'),
  item('S2-03', 'cadastral', '2 — Qualificação das partes (RFB)', 'Análise da razão social do importador', 'llm', 'Razão social conferida', 'verde'),
  item('S2-04', 'cadastral', '2 — Qualificação das partes (RFB)', 'Análise do endereço do importador', 'llm', 'Endereço conferido', 'verde'),
  item('S2-05', 'cadastral', '2 — Qualificação das partes (RFB)', 'Nome do exportador', 'llm', 'Shenzhen Valve Industries Co.', 'verde'),
  item('S2-06', 'cadastral', '2 — Qualificação das partes (RFB)', 'Endereço do exportador', 'llm', 'Shenzhen, Guangdong', 'verde'),
  item('S2-07', 'cadastral', '2 — Qualificação das partes (RFB)', 'Nome do fabricante', 'llm', 'Não aplicável', 'verde'),
  item('S2-08', 'cadastral', '2 — Qualificação das partes (RFB)', 'Endereço do fabricante', 'llm', 'Não aplicável', 'verde'),
  item('S3-01', 'logistica', '3 — Logística e enquadramentos', 'Incoterm e local', 'codigo', 'FOB Hamburg', 'amarelo', 'risco-incoterm'),
  item('S3-02', 'logistica', '3 — Logística e enquadramentos', 'Coerência geográfica', 'llm', 'B/L divergente no porto', 'amarelo', 'risco-incoterm'),
  item('S4-01', 'itens_fiscais', '4 — Itens de linha e inteligência fiscal', 'Part Number', 'codigo', '100 linhas com PN', 'verde'),
  item('S4-02', 'itens_fiscais', '4 — Itens de linha e inteligência fiscal', 'Descrição comercial', 'llm', 'Especificações técnicas OK', 'verde'),
  item('S4-03', 'itens_fiscais', '4 — Itens de linha e inteligência fiscal', 'Pré-classificação NCM', 'llm', 'Item 12: capítulo divergente', 'vermelho', 'risco-ncm'),
  item('S4-04', 'itens_fiscais', '4 — Itens de linha e inteligência fiscal', 'NCM declarado', 'codigo', '8479.89.99 (item 12)', 'amarelo', 'risco-ncm'),
  item('S4-05', 'itens_fiscais', '4 — Itens de linha e inteligência fiscal', 'Unidades de medida', 'codigo', 'UN em todas as linhas', 'verde'),
  item('S5-01', 'financeiro', '5 — Auditoria financeira e câmbio', 'Moeda ISO 4217', 'codigo', 'USD', 'verde'),
  item('S5-02', 'financeiro', '5 — Auditoria financeira e câmbio', 'Unicidade cambial', 'codigo', 'USD em totais', 'verde'),
  item('S5-03', 'financeiro', '5 — Auditoria financeira e câmbio', 'Multiplicação de linha', 'codigo', 'Σ linhas conferido', 'verde'),
  item('S5-04', 'financeiro', '5 — Auditoria financeira e câmbio', 'Somatório mercadorias', 'codigo', 'USD 128.450,75', 'verde'),
  item('S5-05', 'financeiro', '5 — Auditoria financeira e câmbio', 'Fechamento financeiro', 'codigo', 'Subtotal + frete OK', 'verde'),
  item('S6-01', 'bancario', '6 — Dados bancários', 'Beneficiário bancário', 'llm', 'Bank of China Shenzhen', 'verde'),
  item('S6-02', 'bancario', '6 — Dados bancários', 'SWIFT / IBAN / Routing', 'codigo', 'BKCHCNBJ45A', 'verde'),
  item('S6-03', 'bancario', '6 — Dados bancários', 'Termos de pagamento', 'llm', '30 dias após BL', 'verde'),
  item('S7-01', 'pesos_embalagens', '7 — Pesos, volumes e embalagens', 'Peso bruto ≥ líquido', 'codigo', '18.420 vs 8.420 KG', 'vermelho', 'risco-peso-liquido'),
  item('S7-02', 'pesos_embalagens', '7 — Pesos, volumes e embalagens', 'Consistência volumes', 'codigo', '24 volumes', 'verde'),
  item('S7-03', 'pesos_embalagens', '7 — Pesos, volumes e embalagens', 'Embalagem madeira (MAPA)', 'llm', 'Pallets tratados NIMF 15', 'verde'),
  item('S8-01', 'legitimidade', '8 — Assinatura e legitimidade', 'Assinatura / carimbo', 'llm', 'Aguardando validação IA', 'pendente'),
]

const CHECKLIST_PACKING: ItemChecklistSimulador[] = [
  item('P1-01', 'embalagem', '1 — Embalagem e volumes', 'Total de volumes', 'codigo', '24 caixas', 'verde'),
  item('P1-02', 'embalagem', '1 — Embalagem e volumes', 'Consistência com B/L', 'codigo', 'B/L: 22 volumes', 'vermelho', 'risco-embalagem-total'),
  item('P1-03', 'embalagem', '1 — Embalagem e volumes', 'Marcações de embalagem', 'llm', 'Part numbers visíveis', 'verde'),
  item('P2-01', 'pesos', '2 — Pesos declarados', 'Peso líquido total', 'codigo', '8.420,00 KG', 'verde'),
  item('P2-02', 'pesos', '2 — Pesos declarados', 'Peso bruto total', 'codigo', '9.050,00 KG', 'verde', 'risco-peso-bruto'),
  item('P2-03', 'pesos', '2 — Pesos declarados', 'Relação bruto/líquido', 'codigo', '1,075 — OK', 'verde'),
  item('P3-01', 'itens', '3 — Itens embalados', 'Quantidade por linha', 'codigo', '10 itens conferidos', 'verde'),
  item('P3-02', 'itens', '3 — Itens embalados', 'Part number por caixa', 'codigo', 'PN-9821-001…010', 'verde'),
]

const CHECKLIST_BOL: ItemChecklistSimulador[] = [
  item('B1-01', 'embarque', '1 — Dados de embarque', 'Porto de embarque', 'codigo', 'Hamburg, DE', 'verde'),
  item('B1-02', 'embarque', '1 — Dados de embarque', 'Porto de destino', 'codigo', 'Santos, BR', 'verde', 'risco-porto'),
  item('B1-03', 'embarque', '1 — Dados de embarque', 'Data de embarque', 'codigo', '22/03/2026', 'verde'),
  item('B2-01', 'containers', '2 — Containers', 'Quantidade de containers', 'codigo', '10 × 40HC', 'verde'),
  item('B2-02', 'containers', '2 — Containers', 'Selos e lacres', 'codigo', 'SL448201…210', 'verde'),
  item('B3-01', 'frete', '3 — Frete e cláusulas', 'Tipo de frete', 'codigo', 'Freight Collect', 'verde'),
  item('B3-02', 'frete', '3 — Frete e cláusulas', 'Consignee', 'llm', 'Gravity Comex Importação', 'pendente'),
]

export function obterItensChecklistSimulador(tipo: TipoDocumentoSimulador): ItemChecklistSimulador[] {
  if (tipo === 'packing-list') return CHECKLIST_PACKING
  if (tipo === 'bill-of-lading') return CHECKLIST_BOL
  return CHECKLIST_INVOICE
}

export function agruparChecklistPorSecao(itens: ItemChecklistSimulador[]): SecaoChecklistSimulador[] {
  const mapa = new Map<string, SecaoChecklistSimulador>()
  for (const linha of itens) {
    const existente = mapa.get(linha.secao)
    if (existente) {
      existente.itens.push(linha)
    } else {
      mapa.set(linha.secao, {
        secao: linha.secao,
        rotulo: linha.secaoRotulo,
        itens: [linha],
      })
    }
  }
  return [...mapa.values()]
}

export function obterChecklistPorRiscoSimulador(
  tipo: TipoDocumentoSimulador,
  riscoId: string,
): SecaoChecklistSimulador[] {
  const itens = obterItensChecklistSimulador(tipo).filter((i) => i.riscoId === riscoId)
  return agruparChecklistPorSecao(itens)
}

export function vereditoSecaoChecklistSimulador(itens: ItemChecklistSimulador[]): string {
  if (itens.some((i) => i.status === 'vermelho')) return 'FALHA'
  if (itens.some((i) => i.status === 'amarelo')) return 'ATENÇÃO'
  if (itens.some((i) => i.status === 'pendente')) return 'PENDENTE'
  return 'CONFORME'
}

export function contarItensChecklistSimulador(itens: ItemChecklistSimulador[]) {
  return {
    verde: itens.filter((i) => i.status === 'verde').length,
    amarelo: itens.filter((i) => i.status === 'amarelo').length,
    vermelho: itens.filter((i) => i.status === 'vermelho').length,
    pendente: itens.filter((i) => i.status === 'pendente').length,
    total: itens.length,
  }
}

export type ResumoSecaoChecklistSimulador = {
  secao: string
  rotulo: string
  veredito: string
  contagem: ReturnType<typeof contarItensChecklistSimulador>
}

export function montarResumoSecoesChecklistSimulador(tipo: TipoDocumentoSimulador): ResumoSecaoChecklistSimulador[] {
  return agruparChecklistPorSecao(obterItensChecklistSimulador(tipo)).map((secao) => ({
    secao: secao.secao,
    rotulo: secao.rotulo,
    veredito: vereditoSecaoChecklistSimulador(secao.itens),
    contagem: contarItensChecklistSimulador(secao.itens),
  }))
}
