/**
 * mapear-participante-insights-smart-read.ts — participantes COMEX e responsável pelo acerto do documento
 *
 * Regra de negócio (emissor = responsável pelo acerto):
 * - Invoice, Packing, Proforma, Pedido → exportador
 * - BL, AWB → agente de carga
 * - Financeiro (boleto, fechamento, etc.) → despachante, agente, transportadora ou armazém (primeiro encontrado)
 */

import { valorTextoComparacaoCampo } from '../../shared/comparar-campos-edicao-leitura-smart-read'
import type { TipoDocumentoBaseSmartRead } from './dados-base-produto-tempo-smart-read'

export type TipoParticipanteInsightsSmartRead =
  | 'exportador'
  | 'importador'
  | 'agente_carga'
  | 'transportadora_rodoviaria'
  | 'armazem_alfandegado'
  | 'despachante_aduaneiro'

export type DefinicaoParticipanteInsights = {
  tipo: TipoParticipanteInsightsSmartRead
  rotulo: string
  padroes_caminho: RegExp[]
}

export const PARTICIPANTES_INSIGHTS_SMART_READ: DefinicaoParticipanteInsights[] = [
  {
    tipo: 'exportador',
    rotulo: 'Exportador',
    padroes_caminho: [/exportador/i, /\bexporter\b/i, /\bshipper\b/i, /remetente/i],
  },
  {
    tipo: 'importador',
    rotulo: 'Importador',
    padroes_caminho: [/importador/i, /\bimporter\b/i, /\bconsignee\b/i, /destinatario/i],
  },
  {
    tipo: 'agente_carga',
    rotulo: 'Agente de carga',
    padroes_caminho: [/agente.?carga/i, /freight.?forward/i, /forwarding.?agent/i, /nvocc/i],
  },
  {
    tipo: 'transportadora_rodoviaria',
    rotulo: 'Transportadora rodoviária',
    padroes_caminho: [/\btransportadora\b/i, /transportadora.?rodovi/i, /road.?carrier/i, /trucking/i, /motorista/i],
  },
  {
    tipo: 'armazem_alfandegado',
    rotulo: 'Armazém alfandegado',
    padroes_caminho: [/\barmazem\b/i, /armazem.?alfand/i, /bonded.?warehouse/i, /recinto/i, /terminal.?alfand/i],
  },
  {
    tipo: 'despachante_aduaneiro',
    rotulo: 'Despachante aduaneiro',
    padroes_caminho: [/despachante/i, /customs.?broker/i, /broker.?aduan/i, /clearance.?agent/i],
  },
]

/** Participantes exibidos nos rankings — emissor/responsável pelo acerto (sem importador). */
export const PARTICIPANTES_RANKING_INSIGHTS_SMART_READ = PARTICIPANTES_INSIGHTS_SMART_READ.filter(
  (p) => p.tipo !== 'importador',
)

const TIPOS_COMERCIAL_EXPORTADOR: TipoDocumentoBaseSmartRead[] = [
  'invoice',
  'packing_list',
  'proforma',
  'pedido',
]

const TIPOS_CONHECIMENTO_AGENTE: TipoDocumentoBaseSmartRead[] = ['bl', 'awb']

const TIPOS_FINANCEIRO_EMISSOR: TipoParticipanteInsightsSmartRead[] = [
  'despachante_aduaneiro',
  'agente_carga',
  'transportadora_rodoviaria',
  'armazem_alfandegado',
]

export type ResponsavelAcertoDocumentoInsights = {
  tipo: TipoParticipanteInsightsSmartRead
  nome: string
}

export function resolverTiposResponsaveisDocumentoInsights(
  tipoDocumento: TipoDocumentoBaseSmartRead,
): TipoParticipanteInsightsSmartRead[] {
  if (TIPOS_COMERCIAL_EXPORTADOR.includes(tipoDocumento)) {
    return ['exportador']
  }
  if (TIPOS_CONHECIMENTO_AGENTE.includes(tipoDocumento)) {
    return ['agente_carga']
  }
  if (tipoDocumento === 'financeiro') {
    return TIPOS_FINANCEIRO_EMISSOR
  }
  return []
}

export function resolverResponsavelAcertoDocumentoInsights(
  tipoDocumento: TipoDocumentoBaseSmartRead,
  participantes: Partial<Record<TipoParticipanteInsightsSmartRead, string>>,
): ResponsavelAcertoDocumentoInsights | null {
  const tiposResponsaveis = resolverTiposResponsaveisDocumentoInsights(tipoDocumento)
  for (const tipo of tiposResponsaveis) {
    const nome = participantes[tipo]
    if (nome) return { tipo, nome }
  }
  return null
}

const PADROES_NOME_CAMPO = /(?:^|\.)(?:nome|name|razao|razao_social|company|fantasia|titular)(?:$|\.)/i

export function classificarCaminhoParticipanteInsights(caminho: string): TipoParticipanteInsightsSmartRead | null {
  for (const participante of PARTICIPANTES_INSIGHTS_SMART_READ) {
    if (participante.padroes_caminho.some((padrao) => padrao.test(caminho))) {
      return participante.tipo
    }
  }
  return null
}

function ehCampoNomeParticipante(caminho: string): boolean {
  if (PADROES_NOME_CAMPO.test(caminho)) return true
  const ultimo = caminho.split('.').pop()?.toLowerCase() ?? ''
  return [
    'exportador',
    'importador',
    'shipper',
    'consignee',
    'exporter',
    'importer',
    'agente_carga',
    'despachante',
    'transportadora',
    'armazem',
  ].includes(ultimo)
}

export function extrairParticipantesDocumentoInsights(
  campos: { caminho_campo: string; valor_final: string | null }[],
): Partial<Record<TipoParticipanteInsightsSmartRead, string>> {
  const nomes: Partial<Record<TipoParticipanteInsightsSmartRead, string>> = {}

  for (const campo of campos) {
    const tipo = classificarCaminhoParticipanteInsights(campo.caminho_campo)
    if (!tipo || !campo.valor_final || !ehCampoNomeParticipante(campo.caminho_campo)) continue

    const atual = nomes[tipo]
    if (!atual || PADROES_NOME_CAMPO.test(campo.caminho_campo)) {
      nomes[tipo] = campo.valor_final
    }
  }

  return nomes
}

export function extrairParticipantesDeDadosLeitura(
  dados: Record<string, unknown>,
): Partial<Record<TipoParticipanteInsightsSmartRead, string>> {
  const campos: { caminho_campo: string; valor_final: string | null }[] = []

  function percorrer(objeto: Record<string, unknown>, prefixo = '') {
    for (const [chave, valor] of Object.entries(objeto)) {
      if (['accuracy', 'averageaccuracy', 'score', 'confidence', 'origem'].includes(chave.toLowerCase())) {
        continue
      }
      const caminho = prefixo ? `${prefixo}.${chave}` : chave
      if (valor !== null && typeof valor === 'object' && !Array.isArray(valor)) {
        percorrer(valor as Record<string, unknown>, caminho)
        continue
      }
      campos.push({
        caminho_campo: caminho,
        valor_final: valorTextoComparacaoCampo(valor),
      })
    }
  }

  percorrer(dados)
  return extrairParticipantesDocumentoInsights(campos)
}
