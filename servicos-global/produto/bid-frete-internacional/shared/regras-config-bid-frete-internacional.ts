import {
  EMPRESA_PAGADORA_TAXA_FECHAMENTO_PADRAO_BID_FRETE_INTERNACIONAL,
  normalizarEmpresaPagadoraTaxaFechamentoPlataformaGravity,
  type EmpresaPagadoraTaxaFechamentoPlataformaGravity,
} from './empresa-pagadora-taxa-fechamento-plataforma-bid-frete-internacional.js'

export const CHAVE_LOCAL_STORAGE_REGRAS_CONFIG_BID_FRETE_INTERNACIONAL = 'bid-frete:config:regras'

export interface RegrasConfigBidFreteInternacional {
  respostaAutomatica: boolean
  prazoPadraoHoras: number
  alertasDivergencia: boolean
  aprovarAbaixoDoTeto: boolean
  /** Padrão da organização — wizard exige escolha explícita por cotação. */
  fornecedorPodeAlterarPropostaPadrao: boolean
  /** Quem paga a taxa de fechamento da plataforma Gravity (success fee). */
  empresaPagadoraTaxaFechamentoPlataformaGravity: EmpresaPagadoraTaxaFechamentoPlataformaGravity
}

export const REGRAS_CONFIG_PADRAO_BID_FRETE_INTERNACIONAL: RegrasConfigBidFreteInternacional = {
  respostaAutomatica: true,
  prazoPadraoHoras: 72,
  alertasDivergencia: true,
  aprovarAbaixoDoTeto: false,
  fornecedorPodeAlterarPropostaPadrao: false,
  empresaPagadoraTaxaFechamentoPlataformaGravity: EMPRESA_PAGADORA_TAXA_FECHAMENTO_PADRAO_BID_FRETE_INTERNACIONAL,
}

export function lerRegrasConfigBidFreteInternacional(): RegrasConfigBidFreteInternacional {
  if (typeof localStorage === 'undefined') {
    return { ...REGRAS_CONFIG_PADRAO_BID_FRETE_INTERNACIONAL }
  }
  try {
    const raw = localStorage.getItem(CHAVE_LOCAL_STORAGE_REGRAS_CONFIG_BID_FRETE_INTERNACIONAL)
    if (!raw) return { ...REGRAS_CONFIG_PADRAO_BID_FRETE_INTERNACIONAL }
    const parsed = JSON.parse(raw) as Partial<RegrasConfigBidFreteInternacional>
    return {
      ...REGRAS_CONFIG_PADRAO_BID_FRETE_INTERNACIONAL,
      ...parsed,
      fornecedorPodeAlterarPropostaPadrao:
        parsed.fornecedorPodeAlterarPropostaPadrao
        ?? REGRAS_CONFIG_PADRAO_BID_FRETE_INTERNACIONAL.fornecedorPodeAlterarPropostaPadrao,
      empresaPagadoraTaxaFechamentoPlataformaGravity:
        normalizarEmpresaPagadoraTaxaFechamentoPlataformaGravity(
          parsed.empresaPagadoraTaxaFechamentoPlataformaGravity,
        ),
    }
  } catch {
    return { ...REGRAS_CONFIG_PADRAO_BID_FRETE_INTERNACIONAL }
  }
}

/** Sugere data/hora limite a partir do prazo padrão em horas (Configurações). */
export function calcularDataLimiteRespostaSugeridaBidFreteInternacional(
  prazoPadraoHoras: number,
  agora: Date = new Date(),
): string {
  const horas = Number.isFinite(prazoPadraoHoras) && prazoPadraoHoras > 0 ? prazoPadraoHoras : 72
  const limite = new Date(agora.getTime() + horas * 60 * 60 * 1000)
  const yyyy = limite.getFullYear()
  const mm = String(limite.getMonth() + 1).padStart(2, '0')
  const dd = String(limite.getDate()).padStart(2, '0')
  const hh = String(limite.getHours()).padStart(2, '0')
  const min = String(limite.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}
