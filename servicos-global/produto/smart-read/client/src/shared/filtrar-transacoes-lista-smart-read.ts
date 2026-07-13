/**
 * Filtros client-side da lista de leituras (colunas pai).
 * Colunas do catálogo de documento não filtram a linha pai — valores ficam nas linhas-filhas.
 */
import type { FiltroAtivo, FiltrosAtivosMap } from '@nucleo/tabela-virtual-global'
import { CHAVES_COLUNAS_PAI_LISTA_LEITURA_SMART_READ } from './colunas-lista-leitura-smart-read'
import {
  formatarDataLeitura,
  formatarDuracaoMsLeitura,
  formatarPercentualLeitura,
  formatarSavingHorasLeitura,
  formatarSavingValorLeitura,
} from './formatacao-leitura-smart-read'
import { ROTULO_STATUS_FLUXO_LEITURA } from '../../../shared/status-fluxo-leitura-smart-read'
import type { TransacaoLeitura } from './schemas'

function valorTextoTransacao(item: TransacaoLeitura, campo: string): string {
  switch (campo) {
    case 'nome_leitura':
      return item.nome_leitura ?? item.nome_arquivo ?? item.id_leitura
    case 'status_fluxo_leitura':
      return ROTULO_STATUS_FLUXO_LEITURA[item.status_fluxo_leitura]
    case 'total_arquivos':
      return String(item.total_arquivos)
    case 'media_acertos':
      return formatarPercentualLeitura(item.media_acertos)
    case 'data_envio':
      return formatarDataLeitura(item.data_envio)
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
      return formatarDuracaoMsLeitura(item.tempo_extracao_ia_ms)
    case 'tempo_processo_total_ms':
      return formatarDuracaoMsLeitura(item.tempo_processo_total_ms)
    case 'saving_total_minutos':
      return formatarSavingHorasLeitura(item.saving_total_minutos)
    case 'saving_total_brl':
      return formatarSavingValorLeitura(item.saving_total_brl)
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
  if (filtro.valor.size === 0) return true
  return filtro.valor.has(valor)
}

function passaFiltroNumero(valorBruto: string, filtro: FiltroAtivo): boolean {
  if (filtro.tipo !== 'numero') return true
  const numero = Number(valorBruto.replace(/[^\d.,-]/g, '').replace(',', '.'))
  if (Number.isNaN(numero)) return false
  if (filtro.valor.min != null && numero < filtro.valor.min) return false
  if (filtro.valor.max != null && numero > filtro.valor.max) return false
  return true
}

function passaFiltroColuna(item: TransacaoLeitura, campo: string, filtro: FiltroAtivo): boolean {
  const valor = valorTextoTransacao(item, campo)
  if (filtro.tipo === 'texto') return passaFiltroTexto(valor, filtro)
  if (filtro.tipo === 'enum') return passaFiltroEnum(valor, filtro)
  if (filtro.tipo === 'numero') return passaFiltroNumero(valor, filtro)
  return true
}

export function filtrarTransacoesListaSmartRead(
  transacoes: TransacaoLeitura[],
  filtros: FiltrosAtivosMap,
): TransacaoLeitura[] {
  const camposPai = new Set<string>(CHAVES_COLUNAS_PAI_LISTA_LEITURA_SMART_READ)
  const entradas = Object.entries(filtros).filter(([campo]) => camposPai.has(campo))
  if (entradas.length === 0) return transacoes
  return transacoes.filter((item) =>
    entradas.every(([campo, filtro]) => passaFiltroColuna(item, campo, filtro)),
  )
}

export function valoresUnicosColunaTransacao(
  transacoes: TransacaoLeitura[],
  campo: string,
): string[] {
  const valores = new Set<string>()
  for (const item of transacoes) {
    const v = valorTextoTransacao(item, campo)
    if (v) valores.add(v)
  }
  return Array.from(valores).sort((a, b) => a.localeCompare(b, 'pt-BR'))
}
