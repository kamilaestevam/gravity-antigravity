import {
  CATALOGO_COLUNAS_DOCUMENTO_SMART_READ,
  type ColunaDocumentoCatalogoSmartRead,
} from './catalogo-colunas-documento-simulador-smart-doc'

function hashSimples(texto: string): number {
  let h = 0
  for (let i = 0; i < texto.length; i += 1) {
    h = (h * 31 + texto.charCodeAt(i)) >>> 0
  }
  return h
}

function demoValorColuna(
  col: ColunaDocumentoCatalogoSmartRead,
  seed: string,
): string | null {
  const h = hashSimples(`${col.key}:${seed}`)
  if (h % 5 === 0) return null

  const chave = col.key.toLowerCase()
  if (chave.includes('data')) return '06/07/2026'
  if (chave.includes('numero') || chave.includes('number')) return `REF-${1000 + (h % 9000)}`
  if (chave.includes('peso') || chave.includes('weight')) return `${120 + (h % 380)} kg`
  if (chave.includes('volume') || chave.includes('cubagem')) return `${(h % 40) + 1} m³`
  if (chave.includes('incoterm')) return 'FOB'
  if (chave.includes('moeda') || chave.includes('currency')) return 'USD'
  if (chave.includes('valor') || chave.includes('amount') || chave.includes('total')) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
      500 + (h % 50_000),
    )
  }
  if (chave.includes('pais') || chave.includes('country')) return h % 2 === 0 ? 'China' : 'Brasil'
  if (chave.includes('porto') || chave.includes('port')) return h % 2 === 0 ? 'CNNGB' : 'BRSSZ'
  if (chave.includes('email')) return 'comex@fornecedor.demo'
  if (chave.includes('cnpj')) return '12.345.678/0001-90'
  return `${col.label}`
}

/** Valores mock por coluna do catálogo (245 campos) — paridade Smart Read real nas linhas-filhas. */
export function gerarValoresColunasDocumentoSimulador(
  tipoDocumento: string | null,
  seed: string,
): Record<string, string> {
  const tipo = tipoDocumento ?? 'INVOICE'
  const valores: Record<string, string> = {}

  for (const col of CATALOGO_COLUNAS_DOCUMENTO_SMART_READ) {
    if (!col.tipos.includes(tipo)) continue
    const demo = demoValorColuna(col, seed)
    if (demo != null && demo.trim()) {
      valores[col.key] = demo
    }
  }

  return valores
}
