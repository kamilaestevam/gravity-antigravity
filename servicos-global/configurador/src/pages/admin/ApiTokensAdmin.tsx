import React, { useState, useEffect, useCallback } from 'react'
import { z } from 'zod'
import { Key, ArrowClockwise, Info } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { requisicaoAutenticada } from '../../services/requisicao-autenticada'
import { getAcoesExportacaoPadrao } from '../../utils/export-helper'
import { ApiCockpitAdminTabs } from './ApiCockpitAdminTabs'
import { ApiCockpitAdminKpis } from './ApiCockpitAdminKpis'
import { SeletorOrganizacaoAdmin } from './SeletorOrganizacaoAdmin'

// ─── Schemas Zod (Mandamento 06/09 — contratos bilaterais) ──────────────

const escopoApiTokenEnum   = z.enum(['LEITURA', 'ESCRITA', 'EXCLUSAO'])
const validadeApiTokenEnum = z.enum(['NUNCA', 'DIAS_30', 'DIAS_90', 'CUSTOMIZADO'])

const apiTokenSchema = z.object({
  id_api_token:                        z.string(),
  id_organizacao:                      z.string(),
  id_produto_gravity:                  z.string().nullable(),
  id_usuario:                          z.string().nullable(),
  nome_api_token:                      z.string(),
  prefixo_api_token:                   z.string(),
  escopo_api_token:                    escopoApiTokenEnum,
  validade_api_token:                  validadeApiTokenEnum,
  data_expiracao_api_token:            z.string().nullable(),
  limite_requisicoes_minuto_api_token: z.number(),
  data_criacao_api_token:              z.string(),
})

const listarTokensResponseSchema = z.object({
  tokens: z.array(apiTokenSchema),
  error:  z.string().optional(),
})

type ApiToken = z.infer<typeof apiTokenSchema>

export function ApiTokensAdmin() {
  const [idOrganizacao, setIdOrganizacao] = useState<string>('')
  const [tokens, setTokens] = useState<ApiToken[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    if (!idOrganizacao) {
      setTokens([])
      return
    }
    try {
      setLoading(true)
      setErro(null)
      const params = new URLSearchParams({ id_organizacao: idOrganizacao })
      const res = await requisicaoAutenticada(`/api/v1/api-cockpit/admin/api-tokens?${params}`)
      if (!res.ok) throw new Error(`Falha ao listar tokens: ${res.status}`)
      const raw = await res.json()
      const parsed = listarTokensResponseSchema.safeParse(raw)
      if (!parsed.success) {
        console.warn('[ApiTokensAdmin] payload invalido', parsed.error)
        setTokens([])
        return
      }
      if (parsed.data.error) throw new Error(parsed.data.error)
      setTokens(parsed.data.tokens)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha desconhecida')
      setTokens([])
    } finally {
      setLoading(false)
    }
  }, [idOrganizacao])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const colunas: TabelaGlobalColuna<ApiToken>[] = [
    {
      key: 'nome_api_token',
      label: 'Nome',
      tipo: 'texto',
      tooltipTitulo: 'Nome',
      tooltipDescricao: 'Identificação livre dada pelo cliente ao token',
    },
    {
      key: 'prefixo_api_token',
      label: 'Prefixo',
      tipo: 'texto',
      align: 'center',
      tooltipTitulo: 'Prefixo',
      tooltipDescricao: 'Indica o ambiente do token (produção ou homologação)',
      render: (val) => <code style={{ fontSize: '0.75rem' }}>{val as string}</code>,
    },
    {
      key: 'escopo_api_token',
      label: 'Escopo',
      tipo: 'texto',
      align: 'center',
      tooltipTitulo: 'Escopo',
      tooltipDescricao: 'Permissões do token: leitura, escrita ou exclusão',
    },
    {
      key: 'validade_api_token',
      label: 'Validade',
      tipo: 'texto',
      align: 'center',
      tooltipTitulo: 'Validade',
      tooltipDescricao: 'Período de expiração configurado',
    },
    {
      key: 'data_expiracao_api_token',
      label: 'Expira em',
      tipo: 'texto',
      align: 'center',
      tooltipTitulo: 'Data de Expiração',
      tooltipDescricao: 'Data exata em que o token deixa de funcionar',
      render: (val) => (val ? new Date(val as string).toLocaleDateString('pt-BR') : '—'),
    },
    {
      key: 'limite_requisicoes_minuto_api_token',
      label: 'Rate (req/min)',
      tipo: 'texto',
      align: 'center',
      tooltipTitulo: 'Limite de Requisições',
      tooltipDescricao: 'Quantidade máxima de requisições permitidas por minuto',
    },
    {
      key: 'data_criacao_api_token',
      label: 'Criado em',
      tipo: 'texto',
      align: 'center',
      tooltipTitulo: 'Data de Criação',
      tooltipDescricao: 'Quando este token foi gerado',
      render: (val) => new Date(val as string).toLocaleDateString('pt-BR'),
    },
  ]

  return (
    <PaginaGlobal
      cabecalho={
        <CabecalhoGlobal
          icone={<Key weight="duotone" size={24} />}
          titulo="API Cockpit"
          subtitulo="Tokens de API por organização — visão administrativa (somente leitura)"
        />
      }
      stats={<ApiCockpitAdminKpis />}
      toolbar={
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <BotaoGlobal
            variante="secundario"
            onClick={() => void carregar()}
            icone={<ArrowClockwise size={16} />}
            aria-label="Atualizar tokens"
            disabled={!idOrganizacao || loading}
          >
            Atualizar
          </BotaoGlobal>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
        <ApiCockpitAdminTabs />

        <SeletorOrganizacaoAdmin
          valor={idOrganizacao}
          aoMudar={setIdOrganizacao}
        />

        {erro && (
          <div role="alert" style={{
            padding: '0.75rem 1rem', borderRadius: '8px',
            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
            color: '#f87171', fontSize: '0.875rem',
          }}>
            {erro}
          </div>
        )}

        {!idOrganizacao ? (
          <div style={{
            padding: '2rem 1rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            border: '1px dashed var(--border-color)',
            borderRadius: '12px',
            background: 'rgba(0,0,0,0.1)',
          }}>
            <Info size={28} weight="duotone" style={{ color: 'var(--brand-primary, #818cf8)' }} />
            <div style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              Selecione uma organização para inspecionar seus tokens
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: 480 }}>
              A visão administrativa mostra os tokens de uma organização por vez (drill-down).
              Para criar ou revogar tokens, o cliente acessa o painel de workspace dele.
            </div>
          </div>
        ) : (
          <TabelaGlobal
            id="admin-api-tokens"
            colunas={colunas}
            dados={tokens}
            acoesExportacao={getAcoesExportacaoPadrao(colunas, 'tokens-api-admin', 'Tokens de API (Admin)')}
            mensagemVazio={loading ? 'Carregando tokens...' : 'Esta organização não possui tokens cadastrados.'}
          />
        )}
      </div>
    </PaginaGlobal>
  )
}

export default ApiTokensAdmin
