/**
 * data-campo-conferencia-leitura-smart-read.ts — detecção, ISO canônico e exibição pt-BR para campos de data na Conferência.
 */

function brToIsoLocal(texto: string): string | null {
  const partes = texto.split('/')
  if (partes.length !== 3) return null
  const dd = parseInt(partes[0], 10)
  const mm = parseInt(partes[1], 10)
  const yyyy = parseInt(partes[2], 10)
  if (Number.isNaN(dd) || Number.isNaN(mm) || Number.isNaN(yyyy) || yyyy < 1000) return null
  const data = new Date(yyyy, mm - 1, dd)
  if (Number.isNaN(data.getTime()) || data.getDate() !== dd) return null
  const m = String(mm).padStart(2, '0')
  const d = String(dd).padStart(2, '0')
  return `${yyyy}-${m}-${d}`
}

export function aplicarMascaraDataConferenciaSmartRead(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 8)
  if (digitos.length <= 2) return digitos
  if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`
  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`
}

export function dateToIsoConferenciaSmartRead(data: Date): string {
  const y = data.getFullYear()
  const m = String(data.getMonth() + 1).padStart(2, '0')
  const dd = String(data.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

export function ehCampoDataConferenciaSmartRead(chave: string): boolean {
  const segmento = chave.split('.').pop()?.replace(/\[\d+\]/g, '') ?? chave
  if (/date$/i.test(segmento)) return true
  return chave === 'document.date'
}

export function normalizarValorDataConferenciaParaIso(
  valor: string | null | undefined,
): string | null {
  if (valor == null) return null
  const bruto = valor.trim()
  if (!bruto) return null

  if (/^\d{4}-\d{2}-\d{2}$/.test(bruto)) return bruto
  if (/^\d{4}-\d{2}-\d{2}T/.test(bruto)) return bruto.slice(0, 10)

  const br = brToIsoLocal(bruto)
  if (br) return br

  const ponto = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(bruto)
  if (ponto) {
    return `${ponto[3]}-${ponto[2]}-${ponto[1]}`
  }

  return null
}

export function formatarDataConferenciaSmartRead(valor: string | null | undefined): string {
  const iso = normalizarValorDataConferenciaParaIso(valor)
  if (!iso) {
    const bruto = valor?.trim()
    return bruto ?? ''
  }

  const partes = iso.split('-')
  if (partes.length !== 3) return iso
  const y = parseInt(partes[0], 10)
  const m = parseInt(partes[1], 10)
  const d = parseInt(partes[2], 10)
  if (!y || !m || !d) return iso

  const dd = String(d).padStart(2, '0')
  const mm = String(m).padStart(2, '0')
  return `${dd}/${mm}/${y}`
}

export function valorDataConferenciaParaCalendario(
  valor: string | null | undefined,
): Date | null {
  const iso = normalizarValorDataConferenciaParaIso(valor)
  if (!iso) return null

  const partes = iso.split('-')
  if (partes.length !== 3) return null
  const y = parseInt(partes[0], 10)
  const m = parseInt(partes[1], 10)
  const d = parseInt(partes[2], 10)
  if (!y || !m || !d) return null

  return new Date(y, m - 1, d)
}
