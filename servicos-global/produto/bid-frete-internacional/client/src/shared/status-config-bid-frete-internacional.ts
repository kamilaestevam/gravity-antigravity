/**
 * Status de cotação — mesma fonte que Configurações › Status (localStorage).
 * Usado por Lista, Kanban e Insights (funil).
 */

import { useEffect, useState } from 'react'
import { z } from 'zod'
import { STATUS_LABELS, type StatusCotacao } from './types'
import type { EtapaFunilVisaoFornecedorBidFreteInternacional } from './visao-fornecedor-bid-frete-internacional-schemas'

export const statusCotacaoConfigItemSchema = z.object({
  id: z.string(),
  nome: z.string(),
  rotulo: z.string(),
  cor: z.string(),
  ordem: z.number(),
  is_sistema: z.boolean(),
})

export const statusCotacaoConfigArraySchema = z
  .array(statusCotacaoConfigItemSchema)
  .min(1)

export type StatusCotacaoConfigBidFreteInternacional = z.infer<
  typeof statusCotacaoConfigItemSchema
>

export const CHAVE_LOCAL_STORAGE_STATUS_COTACAO_BID_FRETE_INTERNACIONAL = 'bid-frete:config:status'

export const EVENTO_STATUS_COTACAO_CONFIG_ATUALIZADO_BID_FRETE_INTERNACIONAL =
  'bid-frete:config:status-atualizado'

export const STATUS_COTACAO_CONFIG_PADRAO_BID_FRETE_INTERNACIONAL: StatusCotacaoConfigBidFreteInternacional[] = [
  { id: 'rascunho', nome: 'RASCUNHO', rotulo: 'Rascunho', cor: '#94a3b8', ordem: 1, is_sistema: true },
  { id: 'enviada_fornecedores', nome: 'ENVIADA_FORNECEDORES', rotulo: 'Enviada ao fornecedor', cor: '#60a5fa', ordem: 2, is_sistema: true },
  { id: 'em_cotacao', nome: 'EM_COTACAO', rotulo: 'Em cotação', cor: '#fbbf24', ordem: 3, is_sistema: true },
  { id: 'aguardando_aprovacao', nome: 'AGUARDANDO_APROVACAO', rotulo: 'Aprovação pendente', cor: '#818cf8', ordem: 4, is_sistema: true },
  { id: 'aprovada', nome: 'APROVADA', rotulo: 'Aprovada', cor: '#10b981', ordem: 5, is_sistema: false },
  { id: 'reprovada', nome: 'REPROVADA', rotulo: 'Reprovada', cor: '#ef4444', ordem: 6, is_sistema: false },
  { id: 'cancelada', nome: 'CANCELADA', rotulo: 'Cancelada', cor: '#6b7280', ordem: 7, is_sistema: false },
  { id: 'falta_informacao', nome: 'FALTA_INFORMACAO', rotulo: 'Falta de informação', cor: '#fb7185', ordem: 8, is_sistema: false },
  { id: 'expirada', nome: 'EXPIRADA', rotulo: 'Expirada', cor: '#d1d5db', ordem: 9, is_sistema: false },
]

export function lerStatusCotacaoConfigBidFreteInternacional(): StatusCotacaoConfigBidFreteInternacional[] {
  try {
    const raw = localStorage.getItem(CHAVE_LOCAL_STORAGE_STATUS_COTACAO_BID_FRETE_INTERNACIONAL)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      const resultado = statusCotacaoConfigArraySchema.safeParse(parsed)
      if (resultado.success) {
        return resultado.data
      }
    }
  } catch {
    /* storage indisponível ou JSON inválido */
  }
  return STATUS_COTACAO_CONFIG_PADRAO_BID_FRETE_INTERNACIONAL
}

function rotuloFallbackStatusCotacao(nome: string): string {
  const canonico = STATUS_LABELS[nome as StatusCotacao]
  return canonico ?? nome.replace(/_/g, ' ')
}

/**
 * Monta etapas do funil Insights alinhadas à config (rótulo, cor, ordem).
 * Inclui status da config com contagem > 0 e status da API ausentes na config (fallback).
 */
export function montarEtapasFunilInsightsBidFreteInternacional(
  statusConfig: StatusCotacaoConfigBidFreteInternacional[],
  funilApi: Array<{ status: string; count: number }>,
): EtapaFunilVisaoFornecedorBidFreteInternacional[] {
  const contagemPorStatus = new Map<string, number>()
  for (const item of funilApi) {
    contagemPorStatus.set(item.status, item.count)
  }

  const nomesNaConfig = new Set(statusConfig.map((s) => s.nome))
  const etapas: EtapaFunilVisaoFornecedorBidFreteInternacional[] = []

  const configOrdenada = [...statusConfig].sort((a, b) => a.ordem - b.ordem)
  for (const status of configOrdenada) {
    const quantidade = contagemPorStatus.get(status.nome) ?? 0
    if (quantidade <= 0) continue
    etapas.push({
      codigo_status: status.nome,
      rotulo: status.rotulo,
      quantidade,
      cor: status.cor,
    })
    contagemPorStatus.delete(status.nome)
  }

  for (const [status, quantidade] of contagemPorStatus) {
    if (quantidade <= 0 || nomesNaConfig.has(status)) continue
    etapas.push({
      codigo_status: status,
      rotulo: rotuloFallbackStatusCotacao(status),
      quantidade,
      cor: '#94a3b8',
    })
  }

  return etapas
}

export function useStatusCotacaoConfigBidFreteInternacional(): StatusCotacaoConfigBidFreteInternacional[] {
  const [statusConfig, setStatusConfig] = useState(() => lerStatusCotacaoConfigBidFreteInternacional())

  useEffect(() => {
    const atualizar = () => setStatusConfig(lerStatusCotacaoConfigBidFreteInternacional())
    window.addEventListener('storage', atualizar)
    window.addEventListener(EVENTO_STATUS_COTACAO_CONFIG_ATUALIZADO_BID_FRETE_INTERNACIONAL, atualizar)
    return () => {
      window.removeEventListener('storage', atualizar)
      window.removeEventListener(EVENTO_STATUS_COTACAO_CONFIG_ATUALIZADO_BID_FRETE_INTERNACIONAL, atualizar)
    }
  }, [])

  return statusConfig
}
