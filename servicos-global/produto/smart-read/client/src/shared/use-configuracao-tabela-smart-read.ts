/**
 * use-configuracao-tabela-smart-read.ts — linhas por página e densidade da Lista.
 * Fonte: Configurações › Tabelas (`persistencia-configuracoes-smart-read`).
 */

import { useEffect, useMemo, useState } from 'react'
import {
  SYNC_EVENT_CONFIGURACOES_SMART_READ,
  carregarConfiguracoesSmartRead,
  type TabelaConfigSmartRead,
} from './persistencia-configuracoes-smart-read'

const LINHAS_VALIDAS = new Set([10, 25, 50, 100])

function normalizarLinhasPagina(raw: string): number {
  const n = Number(raw)
  return LINHAS_VALIDAS.has(n) ? n : 50
}

function normalizarDensidade(raw: string): 'compacto' | 'confortavel' {
  return raw === 'compacto' ? 'compacto' : 'confortavel'
}

export function resolverConfiguracaoTabelaSmartRead(tabela: TabelaConfigSmartRead) {
  return {
    linhasPagina: normalizarLinhasPagina(tabela.linhasPagina),
    densidade: normalizarDensidade(tabela.densidade),
  }
}

export function useConfiguracaoTabelaSmartRead() {
  const [tabela, setTabela] = useState(() => carregarConfiguracoesSmartRead().tabela)

  useEffect(() => {
    function sync() {
      setTabela(carregarConfiguracoesSmartRead().tabela)
    }
    window.addEventListener(SYNC_EVENT_CONFIGURACOES_SMART_READ, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(SYNC_EVENT_CONFIGURACOES_SMART_READ, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return useMemo(() => resolverConfiguracaoTabelaSmartRead(tabela), [tabela])
}
