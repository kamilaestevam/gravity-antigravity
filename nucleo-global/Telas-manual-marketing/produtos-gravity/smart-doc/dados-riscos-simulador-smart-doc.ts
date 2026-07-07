import type { DocumentoSimulador, TipoDocumentoSimulador } from './documentos-preview-simulador-smart-doc'
import { contarItensChecklistSimulador, obterItensChecklistSimulador } from './dados-checklist-simulador-smart-doc'

export type SeveridadeRiscoSimulador = 'critico' | 'atencao' | 'informativo'

export type RiscoSimuladorSmartDoc = {
  id: string
  severidade: SeveridadeRiscoSimulador
  titulo: string
  motivo: string
  analise: string
  correcao_sugerida?: string
  evidencias: { documento: string; campo?: string; valor?: string | null }[]
  origem?: 'v1' | 'llm'
}

export type ResumoRiscosSimuladorSmartDoc = {
  riscos: RiscoSimuladorSmartDoc[]
  total: number
  criticos: number
  atencao: number
  informativos: number
}

export type ContagemChecklistSimulador = {
  verde: number
  amarelo: number
  vermelho: number
  pendente: number
}

/** Barra de riscos em escala de campos do documento (ex.: 100 campos, 10 em risco = 10%). */
export type MetricasBarraCamposRiscoSimulador = {
  totalCampos: number
  camposConformes: number
  camposCriticos: number
  camposAtencao: number
  camposEmRisco: number
  percentualConforme: number
  percentualCritico: number
  percentualAtencao: number
  percentualEmRisco: number
}

const RISCOS_INVOICE: RiscoSimuladorSmartDoc[] = [
  {
    id: 'risco-peso-liquido',
    severidade: 'critico',
    titulo: 'Peso líquido divergente entre documentos',
    motivo: 'Net Weight na invoice (18.420,00 KG) não confere com packing list (8.420,00 KG).',
    analise:
      'Divergência superior a 50% entre invoice e packing list pode gerar retenção na conferência aduaneira e exigência de esclarecimento à RFB.',
    correcao_sugerida: 'Conferir unidade de medida e totalizadores; alinhar Net Weight com o packing list antes do registro.',
    evidencias: [
      { documento: 'Invoice #INV-9821', campo: 'Net Weight', valor: '18.420,00 KG' },
      { documento: 'Packing List', campo: 'Net Weight', valor: '8.420,00 KG' },
    ],
    origem: 'v1',
  },
  {
    id: 'risco-incoterm',
    severidade: 'atencao',
    titulo: 'Incoterm FOB sem porto de embarque explícito',
    motivo: 'Invoice indica FOB Hamburg, mas Bill of Lading não referencia o mesmo porto na cláusula de embarque.',
    analise:
      'Inconsistência entre Incoterm e local de embarque pode impactar a base de cálculo do frete internacional na DI.',
    correcao_sugerida: 'Padronizar porto de embarque como Hamburg, DE em todos os documentos da leitura.',
    evidencias: [
      { documento: 'Invoice #INV-9821', campo: 'Incoterm', valor: 'FOB Hamburg' },
      { documento: 'Bill of Lading', campo: 'Port of Loading', valor: 'Hamburg, DE' },
    ],
    origem: 'v1',
  },
  {
    id: 'risco-ncm',
    severidade: 'critico',
    titulo: 'NCM/HS divergente entre invoice e descrição do item',
    motivo: 'Item 12 da invoice usa NCM 8479.89.99, mas a descrição sugere classificação em capítulo 84.21.',
    analise:
      'Classificação fiscal incorreta pode resultar em tributação indevida e multa por classificação errada (IN RFB 1.861/2018).',
    correcao_sugerida: 'Revisar NCM do item 12 com base na descrição técnica e validar no Portal Único Siscomex.',
    evidencias: [
      { documento: 'Invoice #INV-9821', campo: 'Item 12 · NCM', valor: '8479.89.99' },
    ],
    origem: 'llm',
  },
  {
    id: 'risco-cnpj',
    severidade: 'informativo',
    titulo: 'CNPJ importador ativo na Receita Federal',
    motivo: 'CNPJ 47.829.103/0001-56 consta como ativo na base da RFB.',
    analise: 'Situação cadastral regular. Nenhuma ação corretiva necessária para este ponto.',
    evidencias: [
      { documento: 'Invoice #INV-9821', campo: 'CNPJ', valor: '47.829.103/0001-56' },
    ],
    origem: 'v1',
  },
]

const RISCOS_PACKING: RiscoSimuladorSmartDoc[] = [
  {
    id: 'risco-embalagem-total',
    severidade: 'atencao',
    titulo: 'Total de volumes não confere com Bill of Lading',
    motivo: 'Packing list indica 24 volumes; Bill of Lading registra 22 volumes.',
    analise: 'Divergência de volumes pode exigir retificação do conhecimento de embarque.',
    correcao_sugerida: 'Confirmar contagem física e atualizar packing list ou solicitar retificação do B/L.',
    evidencias: [
      { documento: 'Packing List', campo: 'Total Packages', valor: '24' },
      { documento: 'Bill of Lading', campo: 'Packages', valor: '22' },
    ],
    origem: 'v1',
  },
  {
    id: 'risco-peso-bruto',
    severidade: 'informativo',
    titulo: 'Gross Weight dentro da tolerância',
    motivo: 'Gross Weight (9.050,00 KG) compatível com soma de net weight + embalagem estimada.',
    analise: 'Relação peso bruto/líquido coerente com o tipo de embalagem declarado.',
    evidencias: [{ documento: 'Packing List', campo: 'Gross Weight', valor: '9.050,00 KG' }],
    origem: 'v1',
  },
]

const RISCOS_BOL: RiscoSimuladorSmartDoc[] = [
  {
    id: 'risco-porto',
    severidade: 'informativo',
    titulo: 'Rota de embarque coerente',
    motivo: 'Porto de embarque Hamburg, DE e destino Santos, BR alinhados com Incoterm FOB.',
    analise: 'Rota marítima padrão para importação industrial Brasil–Alemanha.',
    evidencias: [
      { documento: 'Bill of Lading', campo: 'Port of Loading', valor: 'Hamburg, DE' },
      { documento: 'Bill of Lading', campo: 'Port of Discharge', valor: 'Santos, BR' },
    ],
    origem: 'v1',
  },
]

export function obterRiscosSimulador(tipo: TipoDocumentoSimulador): RiscoSimuladorSmartDoc[] {
  if (tipo === 'packing-list') return RISCOS_PACKING
  if (tipo === 'bill-of-lading') return RISCOS_BOL
  return RISCOS_INVOICE
}

export function montarResumoRiscosSimulador(riscos: RiscoSimuladorSmartDoc[]): ResumoRiscosSimuladorSmartDoc {
  const criticos = riscos.filter((r) => r.severidade === 'critico').length
  const atencao = riscos.filter((r) => r.severidade === 'atencao').length
  const informativos = riscos.filter((r) => r.severidade === 'informativo').length
  return { riscos, total: riscos.length, criticos, atencao, informativos }
}

export function obterContagemChecklistSimulador(tipo: TipoDocumentoSimulador): ContagemChecklistSimulador {
  const contagem = contarItensChecklistSimulador(obterItensChecklistSimulador(tipo))
  return {
    verde: contagem.verde,
    amarelo: contagem.amarelo,
    vermelho: contagem.vermelho,
    pendente: contagem.pendente,
  }
}

export function calcularPercentualChecklistVerde(contagem: ContagemChecklistSimulador): number {
  const total = contagem.verde + contagem.amarelo + contagem.vermelho + contagem.pendente
  if (total === 0) return 100
  return Math.round((contagem.verde / total) * 100)
}

export function obterMetricasBarraCamposRiscoSimulador(
  documento: DocumentoSimulador | TipoDocumentoSimulador,
): MetricasBarraCamposRiscoSimulador {
  const tipo = typeof documento === 'string' ? documento : documento.tipo
  const totalCampos =
    typeof documento === 'string' ? (tipo === 'invoice' ? 100 : 10) : documento.quantidadeItens

  let camposCriticos = 0
  let camposAtencao = 0

  if (tipo === 'invoice') {
    // 100 campos · 10 em risco (10%) → 5 críticos + 5 atenção
    camposCriticos = 5
    camposAtencao = 5
  } else if (tipo === 'packing-list') {
    // 10 campos · 1 em risco (10%) → atenção
    camposAtencao = 1
  }

  const camposEmRisco = camposCriticos + camposAtencao
  const camposConformes = Math.max(0, totalCampos - camposEmRisco)

  return {
    totalCampos,
    camposConformes,
    camposCriticos,
    camposAtencao,
    camposEmRisco,
    percentualConforme: totalCampos > 0 ? Math.round((camposConformes / totalCampos) * 100) : 100,
    percentualCritico: totalCampos > 0 ? Math.round((camposCriticos / totalCampos) * 100) : 0,
    percentualAtencao: totalCampos > 0 ? Math.round((camposAtencao / totalCampos) * 100) : 0,
    percentualEmRisco: totalCampos > 0 ? Math.round((camposEmRisco / totalCampos) * 100) : 0,
  }
}

export function montarLegendaBarraCamposRisco(
  metricas: MetricasBarraCamposRiscoSimulador,
  resumo: ResumoRiscosSimuladorSmartDoc,
): string {
  const partes: string[] = [
    `${metricas.totalCampos} campos`,
    metricas.camposEmRisco > 0
      ? `${metricas.camposEmRisco} em risco`
      : `${metricas.percentualConforme}% conforme`,
  ]

  if (metricas.camposCriticos > 0) {
    partes.push(`${metricas.camposCriticos} crítico${metricas.camposCriticos > 1 ? 's' : ''}`)
  }
  if (metricas.camposAtencao > 0) {
    partes.push(`${metricas.camposAtencao} atenção`)
  }
  if (resumo.total > 0) {
    partes.push(`${resumo.total} achado${resumo.total > 1 ? 's' : ''}`)
  }

  return partes.join(' · ')
}

export function filtrarRiscosPorBusca(riscos: RiscoSimuladorSmartDoc[], busca: string): RiscoSimuladorSmartDoc[] {
  const buscaNorm = busca.trim().toLowerCase()
  if (!buscaNorm) return riscos
  return riscos.filter(
    (risco) =>
      risco.titulo.toLowerCase().includes(buscaNorm) ||
      risco.motivo.toLowerCase().includes(buscaNorm) ||
      risco.analise.toLowerCase().includes(buscaNorm) ||
      (risco.correcao_sugerida?.toLowerCase().includes(buscaNorm) ?? false),
  )
}

export function rotuloSeveridadeRisco(severidade: SeveridadeRiscoSimulador): string {
  if (severidade === 'critico') return 'Crítico'
  if (severidade === 'atencao') return 'Atenção'
  return 'Informativo'
}

export function calcularPercentualSemCriticosAbertos(resumo: ResumoRiscosSimuladorSmartDoc): number {
  if (resumo.total === 0) return 100
  return Math.round(((resumo.total - resumo.criticos) / resumo.total) * 100)
}

export function montarLegendaSegmentosRisco(resumo: ResumoRiscosSimuladorSmartDoc): string | null {
  if (resumo.total === 0) return null
  const partes: string[] = []
  if (resumo.criticos > 0) partes.push(`${resumo.criticos} crítico${resumo.criticos > 1 ? 's' : ''}`)
  if (resumo.atencao > 0) partes.push(`${resumo.atencao} atenção`)
  if (resumo.informativos > 0) partes.push(`${resumo.informativos} informativo${resumo.informativos > 1 ? 's' : ''}`)
  return partes.join(' · ')
}
