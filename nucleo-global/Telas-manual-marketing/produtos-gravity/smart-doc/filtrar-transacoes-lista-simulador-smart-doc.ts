import type { FiltroAtivo, FiltrosAtivosMap } from '../../../Tabelas/tabela-virtual-global/src/FiltrosColuna/tipos'
import {
  COLUNAS_PADRAO_VISIVEIS_LISTA_SMART_DOC_SIMULADOR,
  type TransacaoLeituraSimulador,
} from './dados-lista-simulador-smart-doc'
import {
  formatarDataLeituraSimulador,
  formatarDuracaoMsLeituraSimulador,
  formatarPercentualLeituraSimulador,
  formatarSavingHorasLeituraSimulador,
  formatarSavingValorLeituraSimulador,
} from './formatacao-lista-simulador-smart-doc'

function valorTextoTransacao(item: TransacaoLeituraSimulador, campo: string): string {
  switch (campo) {
    case 'nome_leitura':
      return item.nome_leitura ?? item.nome_arquivo ?? item.id_leitura
    case 'status_leitura':
      return item.status_leitura
    case 'total_arquivos':
      return String(item.total_arquivos)
    case 'media_acertos':
      return formatarPercentualLeituraSimulador(item.media_acertos)
    case 'data_envio':
      return formatarDataLeituraSimulador(item.data_envio)
    case 'total_documentos':
      return String(item.total_documentos)
    case 'total_campos_extraidos':
      return String(item.total_campos_extraidos)
    case 'total_campos_corretos':
      return String(item.total_campos_corretos)
    case 'total_campos_errados':
      return String(item.total_campos_errados)
    case 'tipos_documento':
      return item.tipos_documento ?? ''
    case 'numeros_documento':
      return ''
    case 'tempo_extracao_ia_ms':
      return formatarDuracaoMsLeituraSimulador(item.tempo_extracao_ia_ms)
    case 'tempo_processo_total_ms':
      return formatarDuracaoMsLeituraSimulador(item.tempo_processo_total_ms)
    case 'saving_total_minutos':
      return formatarSavingHorasLeituraSimulador(item.saving_total_minutos)
    case 'saving_total_brl':
      return formatarSavingValorLeituraSimulador(item.saving_total_brl)
    default:
      return ''
  }
}

function passaFiltroTexto(valor: string, filtro: FiltroAtivo): boolean {
  if (filtro.tipo !== 'texto') return true
  const busca = filtro.valor.trim().toLowerCase()
  if (!busca) return true
  return valor.toLowerCase().includes(busca)
}

function passaFiltroEnum(valor: string, filtro: FiltroAtivo): boolean {
  if (filtro.tipo !== 'enum') return true
  if (!filtro.valores?.length) return true
  return filtro.valores.includes(valor)
}

function passaFiltroNumero(valor: string, filtro: FiltroAtivo): boolean {
  if (filtro.tipo !== 'numero') return true
  const numero = Number(valor.replace(/[^\d.,-]/g, '').replace(',', '.'))
  if (Number.isNaN(numero)) return false
  if (filtro.min != null && numero < filtro.min) return false
  if (filtro.max != null && numero > filtro.max) return false
  return true
}

export function filtrarTransacoesListaSimuladorSmartDoc(
  transacoes: TransacaoLeituraSimulador[],
  filtros: FiltrosAtivosMap,
): TransacaoLeituraSimulador[] {
  const chaves = Object.keys(filtros)
  if (chaves.length === 0) return transacoes

  return transacoes.filter((item) =>
    chaves.every((campo) => {
      if (!COLUNAS_PADRAO_VISIVEIS_LISTA_SMART_DOC_SIMULADOR.includes(
        campo as (typeof COLUNAS_PADRAO_VISIVEIS_LISTA_SMART_DOC_SIMULADOR)[number],
      )) {
        return true
      }
      const filtro = filtros[campo]
      if (!filtro) return true
      const valor = valorTextoTransacao(item, campo)
      if (filtro.tipo === 'enum') return passaFiltroEnum(valor, filtro)
      if (filtro.tipo === 'numero') return passaFiltroNumero(valor, filtro)
      return passaFiltroTexto(valor, filtro)
    }),
  )
}

export function valoresUnicosColunaTransacaoSimulador(
  transacoes: TransacaoLeituraSimulador[],
  campo: string,
): string[] {
  const set = new Set<string>()
  for (const item of transacoes) {
    const valor = valorTextoTransacao(item, campo).trim()
    if (valor) set.add(valor)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'))
}

export function formatarValorExportColunaLeituraSimulador(
  key: string,
  item: TransacaoLeituraSimulador,
): string {
  return valorTextoTransacao(item, key)
}
