import React, { useState, useEffect, useCallback } from 'react'
import { z } from 'zod'
import { Plus, Trash, Copy, Key } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { ModalFormularioGlobal } from '@nucleo/modal-formulario-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { requisicaoAutenticada } from '../../services/requisicao-autenticada'
import { getAcoesExportacaoPadrao } from '../../utils/export-helper'
import { ApiCockpitTabs } from './ApiCockpitTabs'
import { ApiCockpitKpiCards } from './ApiCockpitKpiCards'

// ─── Schemas Zod (Mandamento 06/09) ──────────────────────────────────────

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

const criarTokenResponseSchema = apiTokenSchema.extend({
  valor_api_token: z.string(),
})

type ApiToken = z.infer<typeof apiTokenSchema>
type CriarTokenResponse = z.infer<typeof criarTokenResponseSchema>
type EscopoApiToken = z.infer<typeof escopoApiTokenEnum>
type ValidadeApiToken = z.infer<typeof validadeApiTokenEnum>

const SELECT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem 0.75rem',
  borderRadius: '8px',
  border: '1px solid var(--ws-accent-border, rgba(255,255,255,0.1))',
  background: 'rgba(0,0,0,0.2)',
  color: 'var(--text-primary, #fff)',
  fontSize: '0.875rem',
}

const INPUT_STYLE: React.CSSProperties = { ...SELECT_STYLE }

export function ApiTokens() {
  const [tokens, setTokens] = useState<ApiToken[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  // Modal — criar
  const [modalCriarAberto, setModalCriarAberto] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [novoEscopo, setNovoEscopo] = useState<EscopoApiToken>('LEITURA')
  const [novaValidade, setNovaValidade] = useState<ValidadeApiToken>('NUNCA')
  const [novoLimite, setNovoLimite] = useState('60')
  const [criando, setCriando] = useState(false)

  // Modal — exibicao do valor em claro (uma vez so)
  const [tokenCriado, setTokenCriado] = useState<CriarTokenResponse | null>(null)

  const carregar = useCallback(async () => {
    try {
      setLoading(true)
      setErro(null)
      const res = await requisicaoAutenticada('/api/v1/api-cockpit/api-tokens')
      if (!res.ok) throw new Error(`Falha ao listar tokens: ${res.status}`)
      const raw = await res.json()
      const parsed = listarTokensResponseSchema.safeParse(raw)
      if (!parsed.success) {
        console.warn('[ApiTokens] payload invalido', parsed.error)
        setTokens([])
        return
      }
      if (parsed.data.error) throw new Error(parsed.data.error)
      setTokens(parsed.data.tokens)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha desconhecida'
      setErro(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const resetForm = () => {
    setNovoNome('')
    setNovoEscopo('LEITURA')
    setNovaValidade('NUNCA')
    setNovoLimite('60')
  }

  const handleCriar = async () => {
    if (!novoNome.trim()) return
    setCriando(true)
    setErro(null)
    try {
      const res = await requisicaoAutenticada('/api/v1/api-cockpit/api-tokens', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome_api_token:                      novoNome.trim(),
          escopo_api_token:                    novoEscopo,
          validade_api_token:                  novaValidade,
          limite_requisicoes_minuto_api_token: Number(novoLimite) || 60,
        }),
      })
      const raw = await res.json()
      if (!res.ok) {
        throw new Error(raw?.erro || raw?.error || `Falha ao criar token: ${res.status}`)
      }
      const parsed = criarTokenResponseSchema.safeParse(raw)
      if (!parsed.success) throw new Error('Resposta de criacao invalida')
      setTokenCriado(parsed.data)
      setModalCriarAberto(false)
      resetForm()
      await carregar()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao criar token')
    } finally {
      setCriando(false)
    }
  }

  const handleRevogar = async (id_api_token: string) => {
    if (!window.confirm('Revogar este token? Aplicações que o usam pararão de funcionar imediatamente.')) return
    try {
      const res = await requisicaoAutenticada(
        `/api/v1/api-cockpit/api-tokens/${encodeURIComponent(id_api_token)}`,
        { method: 'DELETE' },
      )
      if (!res.ok && res.status !== 204) {
        const raw = await res.json().catch(() => ({}))
        throw new Error(raw?.erro || raw?.error || `Falha ao revogar: ${res.status}`)
      }
      await carregar()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao revogar token')
    }
  }

  const handleCopiar = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto)
    } catch {
      // silencioso — UI poderia mostrar toast
    }
  }

  const colunas: TabelaGlobalColuna<ApiToken>[] = [
    {
      key: 'nome_api_token',
      label: 'Nome',
      tipo: 'texto',
      tooltipTitulo: 'Nome',
      tooltipDescricao: 'Identificacao livre dada pelo usuario ao token',
    },
    {
      key: 'prefixo_api_token',
      label: 'Prefixo',
      tipo: 'texto',
      tooltipTitulo: 'Prefixo',
      tooltipDescricao: 'Indica o ambiente do token (producao ou homologacao)',
      render: (val) => <code style={{ fontSize: '0.75rem' }}>{val as string}</code>,
    },
    {
      key: 'escopo_api_token',
      label: 'Escopo',
      tipo: 'texto',
      tooltipTitulo: 'Escopo',
      tooltipDescricao: 'Permissoes do token: leitura, escrita ou exclusao',
    },
    {
      key: 'validade_api_token',
      label: 'Validade',
      tipo: 'texto',
      tooltipTitulo: 'Validade',
      tooltipDescricao: 'Periodo de expiracao configurado',
    },
    {
      key: 'data_expiracao_api_token',
      label: 'Expira em',
      tipo: 'texto',
      tooltipTitulo: 'Data de Expiracao',
      tooltipDescricao: 'Data exata em que o token deixa de funcionar',
      render: (val) => (val ? new Date(val as string).toLocaleDateString('pt-BR') : '—'),
    },
    {
      key: 'limite_requisicoes_minuto_api_token',
      label: 'Rate (req/min)',
      tipo: 'texto',
      tooltipTitulo: 'Limite de Requisicoes',
      tooltipDescricao: 'Quantidade maxima de requisicoes permitidas por minuto',
    },
    {
      key: 'data_criacao_api_token',
      label: 'Criado em',
      tipo: 'texto',
      tooltipTitulo: 'Data de Criacao',
      tooltipDescricao: 'Quando este token foi gerado',
      render: (val) => new Date(val as string).toLocaleDateString('pt-BR'),
    },
    {
      key: 'id_api_token',
      label: 'Acoes',
      tipo: 'texto',
      align: 'center',
      render: (val) => (
        <BotaoGlobal
          variante="perigo"
          tamanho="pequeno"
          onClick={() => handleRevogar(val as string)}
          icone={<Trash size={14} />}
          aria-label="Revogar token"
        >
          Revogar
        </BotaoGlobal>
      ),
    },
  ]

  return (
    <PaginaGlobal
      cabecalho={
        <CabecalhoGlobal
          titulo="Tokens de API"
          subtitulo="Gere e gerencie tokens para integrar seus sistemas com a API Gravity"
          icone={<Key size={32} weight="duotone" />}
        />
      }
    >
      {erro && (
        <div role="alert" style={{
          padding: '0.75rem 1rem', borderRadius: '8px',
          background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
          color: '#f87171', marginTop: '1rem', fontSize: '0.875rem',
        }}>
          {erro}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1.5rem' }}>
        <ApiCockpitKpiCards />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <ApiCockpitTabs />
          <BotaoGlobal
            variante="primario"
            onClick={() => setModalCriarAberto(true)}
            icone={<Plus size={16} />}
          >
            Novo Token
          </BotaoGlobal>
        </div>

        <TabelaGlobal
          id="api-tokens"
          idKey="id_api_token"
          colunas={colunas}
          dados={tokens}
          acoesExportacao={getAcoesExportacaoPadrao(colunas, 'tokens-api', 'Tokens de API')}
          mensagemVazio={loading ? 'Carregando tokens...' : 'Nenhum token gerado ainda. Clique em "Novo Token" para criar o primeiro.'}
        />
      </div>

      {/* Modal — Criar token */}
      <ModalFormularioGlobal
        aberto={modalCriarAberto}
        aoFechar={() => !criando && setModalCriarAberto(false)}
        aoSalvar={handleCriar}
        icone={<Key size={24} weight="duotone" />}
        titulo="Gerar Novo Token"
        subtitulo="O valor em claro só será exibido uma vez. Copie e guarde em local seguro."
        tamanho="md"
        altura="auto"
        dirty={!!novoNome.trim()}
        podesSalvar={!!novoNome.trim() && !criando}
        textoSalvar={criando ? 'Gerando...' : 'Gerar Token'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 1.5rem' }}>
          <CampoGeralGlobal label="Nome do Token" htmlFor="nome-api-token" obrigatorio>
            <input
              id="nome-api-token"
              type="text"
              style={INPUT_STYLE}
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Ex: Integração SAP Produção"
            />
          </CampoGeralGlobal>

          <CampoGeralGlobal label="Escopo" htmlFor="escopo-api-token">
            <select
              id="escopo-api-token"
              style={SELECT_STYLE}
              value={novoEscopo}
              onChange={(e) => setNovoEscopo(e.target.value as EscopoApiToken)}
            >
              <option value="LEITURA">Leitura (apenas GET)</option>
              <option value="ESCRITA">Escrita (GET, POST, PUT)</option>
              <option value="EXCLUSAO">Exclusão (todos os métodos)</option>
            </select>
          </CampoGeralGlobal>

          <CampoGeralGlobal label="Validade" htmlFor="validade-api-token">
            <select
              id="validade-api-token"
              style={SELECT_STYLE}
              value={novaValidade}
              onChange={(e) => setNovaValidade(e.target.value as ValidadeApiToken)}
            >
              <option value="NUNCA">Nunca expira</option>
              <option value="DIAS_30">30 dias</option>
              <option value="DIAS_90">90 dias</option>
              <option value="CUSTOMIZADO">Customizado</option>
            </select>
          </CampoGeralGlobal>

          <CampoGeralGlobal label="Limite de requisições por minuto" htmlFor="limite-req-min">
            <input
              id="limite-req-min"
              type="number"
              min={1}
              style={INPUT_STYLE}
              value={novoLimite}
              onChange={(e) => setNovoLimite(e.target.value)}
              placeholder="60"
            />
          </CampoGeralGlobal>
        </div>
      </ModalFormularioGlobal>

      {/* Modal — Exibicao unica do valor em claro */}
      <ModalFormularioGlobal
        aberto={!!tokenCriado}
        aoFechar={() => setTokenCriado(null)}
        aoSalvar={() => setTokenCriado(null)}
        icone={<Key size={24} weight="duotone" />}
        titulo="Token Gerado"
        subtitulo="Este é o ÚNICO momento em que você verá o valor em claro. Copie e guarde em local seguro."
        tamanho="md"
        altura="auto"
        dirty={false}
        podesSalvar
        textoSalvar="Já copiei, fechar"
        textoCancelar=""
      >
        {tokenCriado && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 1.5rem' }}>
            <div role="alert" style={{
              padding: '0.75rem 1rem', borderRadius: '8px',
              background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
              color: '#fbbf24', fontSize: '0.875rem',
            }}>
              ⚠️ Após fechar este modal o valor não poderá mais ser recuperado.
            </div>
            <div style={{
              padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <code style={{ flex: 1, fontSize: '0.75rem', wordBreak: 'break-all', color: 'var(--text-primary)' }}>
                {tokenCriado.valor_api_token}
              </code>
              <BotaoGlobal
                variante="secundario"
                tamanho="pequeno"
                onClick={() => handleCopiar(tokenCriado.valor_api_token)}
                icone={<Copy size={14} />}
                aria-label="Copiar token"
              >
                Copiar
              </BotaoGlobal>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <strong>Nome:</strong> {tokenCriado.nome_api_token}<br />
              <strong>Escopo:</strong> {tokenCriado.escopo_api_token}<br />
              <strong>Validade:</strong> {tokenCriado.validade_api_token}
              {tokenCriado.data_expiracao_api_token && (
                <> (até {new Date(tokenCriado.data_expiracao_api_token).toLocaleDateString('pt-BR')})</>
              )}
            </div>
          </div>
        )}
      </ModalFormularioGlobal>
    </PaginaGlobal>
  )
}

export default ApiTokens
