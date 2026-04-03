import type { TipoCampo, OperadorRegra, RegraKanban } from './tipos'

// ── Operadores disponíveis por tipo de campo ──────────────────────────────────

export const OPERADORES_POR_TIPO: Record<TipoCampo, { value: OperadorRegra; label: string }[]> = {
  texto: [
    { value: 'preenchido', label: 'está preenchido' },
    { value: 'vazio',      label: 'está vazio' },
    { value: 'igual',      label: 'é igual a' },
    { value: 'diferente',  label: 'é diferente de' },
    { value: 'contem',     label: 'contém' },
    { value: 'nao_contem', label: 'não contém' },
  ],
  numero: [
    { value: 'preenchido',  label: 'está preenchido' },
    { value: 'vazio',       label: 'está vazio' },
    { value: 'igual',       label: 'é igual a' },
    { value: 'diferente',   label: 'é diferente de' },
    { value: 'maior',       label: 'é maior que' },
    { value: 'menor',       label: 'é menor que' },
    { value: 'maior_igual', label: 'é maior ou igual a' },
    { value: 'menor_igual', label: 'é menor ou igual a' },
  ],
  data: [
    { value: 'preenchido', label: 'está preenchida' },
    { value: 'vazio',      label: 'está vazia' },
    { value: 'igual',      label: 'é na mesma data que' },
    { value: 'maior',      label: 'é depois de' },
    { value: 'menor',      label: 'é antes de' },
  ],
  booleano: [
    { value: 'igual',     label: 'é verdadeiro' },
    { value: 'diferente', label: 'é falso' },
  ],
  selecao: [
    { value: 'preenchido', label: 'está preenchido' },
    { value: 'vazio',      label: 'está vazio' },
    { value: 'igual',      label: 'é igual a' },
    { value: 'diferente',  label: 'é diferente de' },
  ],
}

// ── Avaliação de um operador ───────────────────────────────────────────────────

function avaliaOperador(
  valorItem:  unknown,
  operador:   OperadorRegra,
  valorRegra: string | undefined,
): boolean {
  const semValor = valorItem === null || valorItem === undefined || valorItem === ''

  switch (operador) {
    case 'preenchido':  return !semValor
    case 'vazio':       return semValor
    case 'igual':       return String(valorItem ?? '') === String(valorRegra ?? '')
    case 'diferente':   return String(valorItem ?? '') !== String(valorRegra ?? '')
    case 'contem':      return String(valorItem ?? '').toLowerCase()
                                .includes(String(valorRegra ?? '').toLowerCase())
    case 'nao_contem':  return !String(valorItem ?? '').toLowerCase()
                                .includes(String(valorRegra ?? '').toLowerCase())
    case 'maior': {
      const a = toComparavel(valorItem), b = toComparavel(valorRegra)
      return a !== null && b !== null && a > b
    }
    case 'menor': {
      const a = toComparavel(valorItem), b = toComparavel(valorRegra)
      return a !== null && b !== null && a < b
    }
    case 'maior_igual': {
      const a = toComparavel(valorItem), b = toComparavel(valorRegra)
      return a !== null && b !== null && a >= b
    }
    case 'menor_igual': {
      const a = toComparavel(valorItem), b = toComparavel(valorRegra)
      return a !== null && b !== null && a <= b
    }
    default: return false
  }
}

/** Converte para número ou timestamp para comparações ordinais */
function toComparavel(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  if (!isNaN(n)) return n
  const d = new Date(String(v)).getTime()
  return isNaN(d) ? null : d
}

// ── Função principal exportada ────────────────────────────────────────────────

/**
 * Avalia as regras de automação para um item e retorna a coluna de destino
 * da primeira regra que bater (ordenadas por `prioridade` crescente).
 *
 * Retorna `null` se nenhuma regra bater ou se o destino é a coluna atual.
 *
 * @example
 * // No produto, ao salvar o card:
 * const destino = avaliarRegras(itemAtualizado, regras, (item, key) => item[key], item.colunaKey)
 * if (destino) await moverItem(item.id, destino)
 */
export function avaliarRegras<T>(
  item:         T,
  regras:       RegraKanban[],
  getItemValue: (item: T, campoKey: string) => unknown,
  colunaAtual?: string,
): string | null {
  const ativas = [...regras]
    .filter(r => r.ativo && r.campoKey && r.colunaDestino)
    .sort((a, b) => a.prioridade - b.prioridade)

  for (const regra of ativas) {
    if (regra.colunaDestino === colunaAtual) continue
    const valorItem = getItemValue(item, regra.campoKey)
    if (avaliaOperador(valorItem, regra.operador, regra.valor)) {
      return regra.colunaDestino
    }
  }
  return null
}
