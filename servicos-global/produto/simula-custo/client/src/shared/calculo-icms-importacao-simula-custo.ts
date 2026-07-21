/**
 * ICMS na importação — espelho bilateral do server (calculo-icms-importacao-simula-custo.ts).
 */
import type { ModalidadeRecolhimentoIcmsSimulaCusto } from './schemas-simula-custo'

export interface ParametrosCalculoIcmsImportacaoSimulaCusto {
  modalidade: ModalidadeRecolhimentoIcmsSimulaCusto
  somaBasesPrevias: number
  aliquotaInternaUf: number
  aliquotaEfetiva: number
}

export interface ResultadoCalculoIcmsImportacaoSimulaCusto {
  aliquota_interna_uf: number
  aliquota_efetiva: number
  reducao_base: number | null
  base_calculo: number
  valor: number
}

function icmsCompoeNacionalizado(modalidade: ModalidadeRecolhimentoIcmsSimulaCusto): boolean {
  return modalidade === 'INTEGRAL' || modalidade === 'REDUCAO'
}

function baseIcmsPorDentro(somaBasesPrevias: number, aliquotaInternaUf: number): number {
  if (aliquotaInternaUf <= 0) return somaBasesPrevias
  return somaBasesPrevias / (1 - aliquotaInternaUf)
}

export function calcularIcmsImportacaoSimulaCusto(
  params: ParametrosCalculoIcmsImportacaoSimulaCusto,
): ResultadoCalculoIcmsImportacaoSimulaCusto {
  const { modalidade, somaBasesPrevias, aliquotaInternaUf } = params
  const aliquotaEfetivaBruta = Math.max(params.aliquotaEfetiva, 0)

  if (modalidade === 'ISENTO' || modalidade === 'DIFERIDO') {
    return {
      aliquota_interna_uf: aliquotaInternaUf,
      aliquota_efetiva: 0,
      reducao_base: null,
      base_calculo: somaBasesPrevias,
      valor: 0,
    }
  }

  if (modalidade === 'INTEGRAL') {
    const aliquota = aliquotaInternaUf
    const base = baseIcmsPorDentro(somaBasesPrevias, aliquota)
    const valorBruto = base * aliquota
    return {
      aliquota_interna_uf: aliquota,
      aliquota_efetiva: aliquota,
      reducao_base: null,
      base_calculo: base,
      valor: icmsCompoeNacionalizado(modalidade) ? valorBruto : 0,
    }
  }

  const aliquotaEfetiva = Math.min(aliquotaEfetivaBruta, aliquotaInternaUf)
  const base = baseIcmsPorDentro(somaBasesPrevias, aliquotaInternaUf)
  const valorBruto = base * aliquotaEfetiva
  const reducaoBase = aliquotaInternaUf > 0
    ? Math.max(0, 1 - (aliquotaEfetiva / aliquotaInternaUf))
    : 0

  return {
    aliquota_interna_uf: aliquotaInternaUf,
    aliquota_efetiva: aliquotaEfetiva,
    reducao_base: reducaoBase,
    base_calculo: base,
    valor: icmsCompoeNacionalizado(modalidade) ? valorBruto : 0,
  }
}

export function resolverAliquotaEfetivaIcmsReducaoSimulaCusto(
  aliquotaInternaUf: number,
  reducaoBase: number,
): number {
  const reducao = Math.min(Math.max(reducaoBase, 0), 1)
  return aliquotaInternaUf * (1 - reducao)
}

export function resolverReducaoBaseIcmsSimulaCusto(
  aliquotaInternaUf: number,
  aliquotaEfetiva: number,
): number {
  if (aliquotaInternaUf <= 0) return 0
  return Math.min(Math.max(1 - (aliquotaEfetiva / aliquotaInternaUf), 0), 1)
}
