/**
 * use-contador-tokens-leitura-smart-read.ts
 *
 * Observador passivo — ZERO rede enquanto `redeLiberada` é false (OCR em andamento).
 * Sem polling: atualiza só por payload das respostas LLM + reconciliação ociosa ao parar a IA.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  atualizarResumoTokensAposChamadaLlm,
  type ResumoUsoLlmLeituraSmartRead,
  type UsoLlmChamadaLeituraSmartRead,
} from '../../../shared/uso-llm-leitura-smart-read'
import { smartReadApi } from './api'

const resumoVazio = (): ResumoUsoLlmLeituraSmartRead => ({
  tokens_entrada: 0,
  tokens_saida: 0,
  tokens_total: 0,
  total_chamadas: 0,
  custo_usd: 0,
})

type Opcoes = {
  chaveSessao?: string | null
  /** false durante OCR — nenhuma chamada HTTP do contador */
  redeLiberada?: boolean
}

export function useContadorTokensLeituraSmartRead(
  idLeituraLegado: string | null,
  painelAtivo: boolean,
  opcoes: Opcoes = {},
) {
  const chaveSessao = opcoes.chaveSessao ?? null
  const redeLiberada = opcoes.redeLiberada ?? false

  const [tokensSessao, setTokensSessao] = useState(0)
  const [tokensMesOrganizacao, setTokensMesOrganizacao] = useState(0)
  const [iaAtiva, setIaAtiva] = useState(false)

  const chaveSessaoAnterior = useRef<string | null>(null)
  const mesCarregadoParaSessao = useRef(false)

  const recarregarMes = useCallback(async () => {
    if (!painelAtivo || !redeLiberada) return
    try {
      const dados = await smartReadApi.obterResumoTokensOrganizacaoMes()
      setTokensMesOrganizacao(dados.tokens_total)
      mesCarregadoParaSessao.current = true
    } catch {
      // informativo
    }
  }, [painelAtivo, redeLiberada])

  const recarregarSessao = useCallback(async () => {
    if (!painelAtivo || !redeLiberada || !idLeituraLegado) return
    try {
      const dados = await smartReadApi.obterResumoTokensLeitura(idLeituraLegado)
      setTokensSessao((anterior) => Math.max(anterior, dados.tokens_total))
    } catch {
      // informativo
    }
  }, [idLeituraLegado, painelAtivo, redeLiberada])

  useEffect(() => {
    if (chaveSessao === chaveSessaoAnterior.current) return
    chaveSessaoAnterior.current = chaveSessao
    mesCarregadoParaSessao.current = false
    setTokensSessao(0)
    setTokensMesOrganizacao(0)
    setIaAtiva(false)
  }, [chaveSessao])

  useEffect(() => {
    if (!painelAtivo || !redeLiberada || mesCarregadoParaSessao.current) return
    const id = window.setTimeout(() => {
      void recarregarMes()
    }, 0)
    return () => window.clearTimeout(id)
  }, [painelAtivo, redeLiberada, recarregarMes])

  const marcarIaAtiva = useCallback(() => {
    setIaAtiva(true)
  }, [])

  const marcarIaInativa = useCallback(() => {
    setIaAtiva(false)
    if (!redeLiberada) return
    window.setTimeout(() => {
      void recarregarSessao()
      void recarregarMes()
    }, 0)
  }, [recarregarMes, recarregarSessao, redeLiberada])

  const aplicarAtualizacaoTokens = useCallback(
    (
      resumoLeituraApi?: ResumoUsoLlmLeituraSmartRead | null,
      chamada?: UsoLlmChamadaLeituraSmartRead | null,
    ) => {
      const parcial = atualizarResumoTokensAposChamadaLlm(resumoVazio(), resumoLeituraApi, chamada)
      if (parcial.tokens_total > 0) {
        setTokensSessao((anterior) => Math.max(anterior, parcial.tokens_total))
      }
    },
    [],
  )

  return {
    tokensTotalSessao: tokensSessao,
    tokensTotalMesOrganizacao: tokensMesOrganizacao,
    iaAtiva,
    marcarIaAtiva,
    marcarIaInativa,
    aplicarAtualizacaoTokens,
    recarregar: async () => {
      if (!redeLiberada) return
      await Promise.all([recarregarSessao(), recarregarMes()])
    },
  }
}
