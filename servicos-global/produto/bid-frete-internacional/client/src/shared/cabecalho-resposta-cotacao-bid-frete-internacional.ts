import type { TFunction } from 'i18next'
import type { TipoOperacao } from './types'

export interface ParteCabecalhoRespostaCotacao {
  id: 'agente' | 'importador' | 'exportador'
  rotulo: string
  valor: string
  oculto: boolean
}

export interface ContextoCabecalhoRespostaCotacao {
  nomeAgente: string
  tipoOperacao?: TipoOperacao | null
  anonima?: boolean | null
  nomeCliente?: string | null
}

export function montarPartesCabecalhoRespostaCotacao(
  ctx: ContextoCabecalhoRespostaCotacao,
  t: TFunction,
): ParteCabecalhoRespostaCotacao[] {
  const partes: ParteCabecalhoRespostaCotacao[] = []
  const nomeAgente = ctx.nomeAgente.trim()

  if (nomeAgente) {
    partes.push({
      id: 'agente',
      rotulo: t('bidfrete.portal.responder.cabecalho_agente', 'Agente'),
      valor: nomeAgente,
      oculto: false,
    })
  }

  const anonima = !!ctx.anonima
  const textoOculto = t(
    'bidfrete.portal.responder.cabecalho_cliente_oculto',
    'Cliente optou por oculto',
  )

  if (ctx.tipoOperacao === 'IMPORTACAO') {
    partes.push({
      id: 'importador',
      rotulo: t('bidfrete.portal.responder.cabecalho_importador', 'Importador'),
      valor: anonima ? textoOculto : (ctx.nomeCliente?.trim() || '—'),
      oculto: anonima,
    })
  } else if (ctx.tipoOperacao === 'EXPORTACAO') {
    partes.push({
      id: 'exportador',
      rotulo: t('bidfrete.portal.responder.cabecalho_exportador', 'Exportador'),
      valor: anonima ? textoOculto : (ctx.nomeCliente?.trim() || '—'),
      oculto: anonima,
    })
  }

  return partes
}
