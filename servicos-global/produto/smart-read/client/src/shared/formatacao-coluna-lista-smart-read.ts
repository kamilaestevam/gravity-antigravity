/**
 * Formatação e normalização de valores de colunas na lista Smart Docs (paridade Pedido).
 */
import {
  formatarDataConferenciaSmartRead,
  normalizarValorDataConferenciaParaIso,
} from './data-campo-conferencia-leitura-smart-read'
import {
  resolverCasasDecimaisColunaListaSmartRead,
  resolverTipoColunaListaSmartRead,
  type TipoColunaListaSmartRead,
} from '../../../shared/tipo-coluna-lista-smart-read'
import {
  CATALOGO_COLUNAS_DOCUMENTO_SMART_READ,
  type ColunaDocumentoCatalogoSmartRead,
} from './catalogo-colunas-documento-smart-read'

export function buscarColunaCatalogoDocumentoSmartRead(
  key: string,
): ColunaDocumentoCatalogoSmartRead | undefined {
  return CATALOGO_COLUNAS_DOCUMENTO_SMART_READ.find((col) => col.key === key)
}

function fmtBR(valor: number, casas: number): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })
}

export function tipoColunaCatalogoSmartRead(
  col: Pick<ColunaDocumentoCatalogoSmartRead, 'key' | 'caminhos'>,
): TipoColunaListaSmartRead {
  return resolverTipoColunaListaSmartRead(col)
}

export function formatarValorCelulaCatalogoSmartRead(
  col: Pick<ColunaDocumentoCatalogoSmartRead, 'key' | 'caminhos' | 'label'>,
  valor: string | null | undefined,
): string {
  const bruto = valor?.trim()
  if (!bruto) return '—'

  const tipo = tipoColunaCatalogoSmartRead(col)
  if (tipo === 'periodo') {
    const formatado = formatarDataConferenciaSmartRead(bruto)
    return formatado || bruto
  }
  if (tipo === 'select_moeda') {
    return bruto.toUpperCase()
  }
  if (tipo === 'numero') {
    const casas = resolverCasasDecimaisColunaListaSmartRead(col.key)
    if (/^\d+\.\d+$/.test(bruto)) {
      const numUs = Number.parseFloat(bruto)
      if (Number.isFinite(numUs)) return fmtBR(numUs, casas)
    }
    const normalizado = bruto.replace(/\./g, '').replace(',', '.')
    const num = Number.parseFloat(normalizado)
    if (Number.isFinite(num)) {
      return fmtBR(num, casas)
    }
    const numUs = Number.parseFloat(bruto)
    if (Number.isFinite(numUs)) {
      return fmtBR(numUs, casas)
    }
  }
  return bruto
}

/** Normaliza valor do popover GTV antes de enviar ao PATCH campo-documento. */
export function normalizarValorSalvarColunaListaSmartRead(
  col: Pick<ColunaDocumentoCatalogoSmartRead, 'key' | 'caminhos'>,
  valor: unknown,
): string {
  if (valor == null) return ''

  const tipo = tipoColunaCatalogoSmartRead(col)

  if (tipo === 'periodo') {
    const texto = typeof valor === 'string' ? valor : String(valor)
    return normalizarValorDataConferenciaParaIso(texto) ?? texto.trim()
  }

  if (tipo === 'select_moeda') {
    if (typeof valor === 'object' && valor !== null && 'currency' in valor) {
      const moeda = (valor as { currency?: string }).currency
      return (moeda ?? '').trim().toUpperCase()
    }
    return String(valor).trim().toUpperCase()
  }

  if (tipo === 'numero') {
    if (typeof valor === 'number' && Number.isFinite(valor)) {
      return String(valor)
    }
    const texto = String(valor).trim()
    if (!texto) return ''
    const br = texto.replace(/\./g, '').replace(',', '.')
    const num = Number.parseFloat(br)
    if (Number.isFinite(num)) return String(num)
    return texto
  }

  return String(valor).trim()
}

export function classeMoedaBadgeListaSmartRead(codigo: string): string {
  return `gtv-celula-moeda-badge gtv-moeda-${codigo.toLowerCase()}`
}

export function renderMoedaBadgeListaSmartRead(codigo: string | null | undefined): string {
  if (!codigo?.trim()) return '—'
  return codigo.trim().toUpperCase()
}
