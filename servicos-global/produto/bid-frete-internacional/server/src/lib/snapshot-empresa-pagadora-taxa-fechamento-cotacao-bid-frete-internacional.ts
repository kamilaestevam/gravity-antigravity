import fs from 'node:fs'
import path from 'node:path'
import {
  EMPRESA_PAGADORA_TAXA_FECHAMENTO_PADRAO_BID_FRETE_INTERNACIONAL,
  normalizarEmpresaPagadoraTaxaFechamentoPlataformaGravity,
  type EmpresaPagadoraTaxaFechamentoPlataformaGravity,
} from '../../../shared/empresa-pagadora-taxa-fechamento-plataforma-bid-frete-internacional.js'

const ARQUIVO_SNAPSHOT = path.join(
  process.cwd(),
  'data',
  'snapshot-empresa-pagadora-taxa-fechamento-cotacao-bid-frete-internacional.json',
)

let cacheMemoria: Record<string, EmpresaPagadoraTaxaFechamentoPlataformaGravity> | null = null

function carregarMapa(): Record<string, EmpresaPagadoraTaxaFechamentoPlataformaGravity> {
  if (cacheMemoria) return cacheMemoria
  try {
    if (!fs.existsSync(ARQUIVO_SNAPSHOT)) {
      cacheMemoria = {}
      return cacheMemoria
    }
    const raw = fs.readFileSync(ARQUIVO_SNAPSHOT, 'utf8')
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const mapa: Record<string, EmpresaPagadoraTaxaFechamentoPlataformaGravity> = {}
    for (const [id, valor] of Object.entries(parsed)) {
      mapa[id] = normalizarEmpresaPagadoraTaxaFechamentoPlataformaGravity(valor)
    }
    cacheMemoria = mapa
    return mapa
  } catch {
    cacheMemoria = {}
    return cacheMemoria
  }
}

function persistirMapa(mapa: Record<string, EmpresaPagadoraTaxaFechamentoPlataformaGravity>): void {
  cacheMemoria = mapa
  fs.mkdirSync(path.dirname(ARQUIVO_SNAPSHOT), { recursive: true })
  fs.writeFileSync(ARQUIVO_SNAPSHOT, JSON.stringify(mapa, null, 2), 'utf8')
}

export function registrarEmpresaPagadoraTaxaFechamentoCotacaoBidFreteInternacional(
  id_cotacao_bid_frete_internacional: string,
  pagador: EmpresaPagadoraTaxaFechamentoPlataformaGravity,
): void {
  if (!id_cotacao_bid_frete_internacional.trim()) return
  const mapa = carregarMapa()
  mapa[id_cotacao_bid_frete_internacional] = pagador
  persistirMapa(mapa)
}

export function lerEmpresaPagadoraTaxaFechamentoCotacaoBidFreteInternacional(
  id_cotacao_bid_frete_internacional: string | null | undefined,
): EmpresaPagadoraTaxaFechamentoPlataformaGravity {
  if (!id_cotacao_bid_frete_internacional?.trim()) {
    return EMPRESA_PAGADORA_TAXA_FECHAMENTO_PADRAO_BID_FRETE_INTERNACIONAL
  }
  const mapa = carregarMapa()
  return mapa[id_cotacao_bid_frete_internacional]
    ?? EMPRESA_PAGADORA_TAXA_FECHAMENTO_PADRAO_BID_FRETE_INTERNACIONAL
}
