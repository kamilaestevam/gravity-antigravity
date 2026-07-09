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
      { documento: 'Invoice #INV-9821', campo: 'items.totalNetWeight', valor: '18.420,00 KG' },
      { documento: 'Packing List', campo: 'packages.totalNetWeight', valor: '8.420,00 KG' },
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
      { documento: 'Invoice #INV-9821', campo: 'document.incoterm', valor: 'FOB Hamburg' },
      { documento: 'Bill of Lading', campo: 'shipment.portOfLoading', valor: 'Hamburg, DE' },
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
      { documento: 'Invoice #INV-9821', campo: 'items[12].ncm', valor: '8479.89.99' },
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
      { documento: 'Invoice #INV-9821', campo: 'importer.cnpj', valor: '47.829.103/0001-56' },
    ],
    origem: 'v1',
  },
]

const RISCOS_PACKING: RiscoSimuladorSmartDoc[] = [
  {
    id: 'risco-data-emissao',
    severidade: 'atencao',
    titulo: 'Data de emissão fora do intervalo esperado',
    motivo: 'Data de emissão 2024-06-19 está fora do intervalo aceito para despacho (documento antigo ou OCR incorreto).',
    analise:
      'Emissão fora do prazo operacional pode exigir justificativa na DUIMP e reforço de conferência documental.',
    correcao_sugerida: 'Confirmar data de emissão com o exportador e reenviar packing list com data legível e atualizada.',
    evidencias: [{ documento: 'Packing List', campo: 'document.issueDate', valor: '2024-06-19' }],
    origem: 'v1',
  },
  {
    id: 'risco-ncm-ausente',
    severidade: 'critico',
    titulo: 'NCM ausente — classificação fiscal a definir',
    motivo: 'Linha 1 não contém código NCM válido; o campo traz texto de part number em vez de classificação fiscal.',
    analise:
      'Ausência de NCM por item impede registro correto no Siscomex e pode gerar retenção na conferência aduaneira.',
    correcao_sugerida: 'Informar NCM de 8 dígitos por item, alinhado à descrição técnica e à Tabela TIPI.',
    evidencias: [
      {
        documento: 'Packing List',
        campo: 'items[0].ncm',
        valor: 'PCIFNOSP1LPORTEIROIPR1010MI 4510135/5',
      },
    ],
    origem: 'llm',
  },
  {
    id: 'risco-unidade-medida',
    severidade: 'informativo',
    titulo: 'Unidade de medida ausente — linha 1',
    motivo: 'Item 1 sem unidade de medida declarada (KG, UN, PCS).',
    analise: 'Unidade ausente dificulta cruzamento com invoice e pode gerar alerta na matriz de checklist.',
    correcao_sugerida: 'Preencher unidade de medida em todas as linhas do packing list.',
    evidencias: [{ documento: 'Packing List', campo: 'items[0].unitOfMeasure', valor: null }],
    origem: 'v1',
  },
  {
    id: 'risco-hs-code',
    severidade: 'critico',
    titulo: 'HS Code ausente — classificação fiscal a definir',
    motivo: 'Linha 1 sem HS Code informado para cruzamento com NCM e descrição do item.',
    analise: 'HS Code ausente reduz rastreabilidade fiscal internacional e consistência com a invoice.',
    correcao_sugerida: 'Incluir HS Code por item, coerente com NCM e descrição comercial.',
    evidencias: [{ documento: 'Packing List', campo: 'items[0].hsCode', valor: null }],
    origem: 'v1',
  },
]

const RISCOS_BOL: RiscoSimuladorSmartDoc[] = [
  {
    id: 'risco-volumes-bl',
    severidade: 'atencao',
    titulo: 'Total de volumes não confere com Packing List',
    motivo: 'Bill of Lading indica 22 volumes; Packing List registra 24 volumes.',
    analise: 'Divergência de volumes entre BL e packing list pode exigir retificação do conhecimento de embarque.',
    correcao_sugerida: 'Confirmar contagem física e alinhar volumes entre Packing List e Bill of Lading.',
    evidencias: [
      { documento: 'Bill of Lading', campo: 'shipment.totalPackages', valor: '22' },
      { documento: 'Packing List', campo: 'packages.totalCount', valor: '24' },
    ],
    origem: 'v1',
  },
  {
    id: 'risco-porto',
    severidade: 'informativo',
    titulo: 'Rota de embarque coerente',
    motivo: 'Porto de embarque Hamburg, DE e destino Santos, BR alinhados com Incoterm FOB.',
    analise: 'Rota marítima padrão para importação industrial Brasil–Alemanha.',
    evidencias: [
      { documento: 'Bill of Lading', campo: 'shipment.portOfLoading', valor: 'Hamburg, DE' },
      { documento: 'Bill of Lading', campo: 'shipment.portOfDischarge', valor: 'Santos, BR' },
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
    // 10 campos · 4 em risco (40%) → 2 críticos + 1 atenção + 1 informativo
    camposCriticos = 2
    camposAtencao = 1
  } else if (tipo === 'bill-of-lading') {
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
