/**
 * Cotacoes.tsx — Lista + Kanban de Cotações (T2/T3)
 * Skill: antigravity-design-system, antigravity-componentes
 *
 * Migrado para TabelaVirtualGlobal para suportar ordenação manual,
 * persistência de colunas, edição inline e precisão numérica reativa.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useShellStore } from '@gravity/shell'

const NovaCotacao = React.lazy(() => import('./NovaCotacao'))
import CotacoesKanban from './CotacoesKanban'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TabelaVirtualGlobal } from '@nucleo/tabela-virtual-global'
import type { GTPreferencias, GTColuna } from '@nucleo/tabela-virtual-global'
import {
  FileText,
  Truck,
  Eye,
  ListBullets,
  Kanban,
  Upload,
  ArrowCounterClockwise,
  Warning,
  Package,
} from '@phosphor-icons/react'

import { getCotacoes } from '../shared/api'
import type { Cotacao, StatusCotacao } from '../shared/types'
import { STATUS_LABELS, STATUS_BADGE, MODAL_LABELS, MODALIDADE_LABELS } from '../shared/types'
import {
  buildColunasCotacoes,
  fmtData,
  fmtQuantidade,
  getCasas,
  RenderBadgeStatus,
  RenderModalIcon,
} from '../components/lista/ColunasCotacoes'

// ─── Tabs de filtro ───

const abas = [
  { valor: 'TODAS', label: 'Todas as cotações' },
  { valor: 'DATA_LIMITE', label: 'Data limite para resposta' },
  { valor: 'PROXIMO_VENCIMENTO', label: 'Próximos ao vencimento' },
  { valor: 'FALTA_INFORMACAO', label: 'Falta de informação' },
]

// ─── Campos Editáveis Inline ───

const CAMPOS_EDITAVEIS = [
  'referencia_interna',
  'prazo_resposta',
  'origem_nome',
  'destino_nome',
  'modal',
  'modalidade',
  'peso_kg',
  'cubagem_m3',
  'quantidade',
  'incoterm',
  'valor_alvo',
]

// ─── Sequência de colunas padrão ───

const COLUNAS_PADRAO_VISIVEIS = [
  'numero',
  'referencia_interna',
  'status',
  'created_at',
  'modal',
  'origem_nome',
  'destino_nome',
  'peso_kg',
  'cubagem_m3',
  'incoterm',
  'valor_alvo',
  'saving_valor',
  'saving_percentual',
]



export default function Cotacoes() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const addNotification = useShellStore(s => s.addNotification)

  const isNovaCotacao = location.pathname.endsWith('/nova')
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')

  const visaoParam = searchParams.get('visao')
  const visao = visaoParam === 'kanban' ? 'kanban' : 'lista'

  const setVisao = (novaVisao: 'lista' | 'kanban') => {
    setSearchParams(
      (prev) => {
        prev.set('visao', novaVisao)
        return prev
      },
      { replace: true }
    )
  }

  useEffect(() => {
    if (!searchParams.has('visao') && !isNovaCotacao) {
      setSearchParams(
        (prev) => {
          prev.set('visao', 'lista')
          return prev
        },
        { replace: true }
      )
    }
  }, [searchParams, setSearchParams, isNovaCotacao])

  const [filtroTab, setFiltroTab] = useState('TODAS')

  // Carregar dados de cotações
  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await getCotacoes({ limit: 50 })
      setCotacoes(res.cotacoes)
    } catch {
      setCotacoes([])
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  // ─── Tabela Virtual: Preferências, Colunas e Edição ───

  const [preferencias, setPreferencias] = useState<GTPreferencias | undefined>(() => {
    try {
      const raw = localStorage.getItem('bid-frete:config:tabela_preferencias')
      return raw ? JSON.parse(raw) : undefined
    } catch {
      return undefined
    }
  })

  const handleSalvarPreferencias = useCallback((prefs: GTPreferencias) => {
    setPreferencias(prefs)
    try {
      localStorage.setItem('bid-frete:config:tabela_preferencias', JSON.stringify(prefs))
    } catch { /* ignore */ }
  }, [])

  const colunasTabela = useMemo(() => buildColunasCotacoes(t), [t])

  const handleEditar = useCallback(async (id: string, campo: string, valor: unknown) => {
    let updatedCotacao: Cotacao | undefined
    setCotacoes(prev => prev.map(c => {
      if (c.id === id) {
        updatedCotacao = { ...c, [campo as keyof Cotacao]: valor } as Cotacao
        return updatedCotacao
      }
      return c
    }))
    const current = cotacoes.find(c => c.id === id)
    if (!current) throw new Error('Cotação não encontrada')
    const updated = { ...current, [campo as keyof Cotacao]: valor } as Cotacao
    return updated
  }, [cotacoes])

  const handleReordenarCotacoes = useCallback((ids: string[]) => {
    const mapa = new Map(cotacoes.map(c => [c.id, c]))
    const reordenados = ids.map(id => mapa.get(id)).filter((c): c is Cotacao => c != null)
    const restantes = cotacoes.filter(c => !ids.includes(c.id))
    setCotacoes([...reordenados, ...restantes])
  }, [cotacoes])

  // ─── Filtragem Reativa (Busca + Abas) ───

  const cotacoesFiltradas = useMemo(() => {
    let result = cotacoes

    // Filtro por abas
    if (filtroTab === 'DATA_LIMITE') {
      result = result.filter(c => c.status === 'AGUARDANDO_APROVACAO')
    } else if (filtroTab === 'PROXIMO_VENCIMENTO') {
      result = result.filter(c => c.status === 'EM_COTACAO')
    } else if (filtroTab === 'FALTA_INFORMACAO') {
      result = result.filter(c => c.status === 'FALTA_INFORMACAO')
    }

    // Filtro por busca
    if (busca.trim()) {
      const term = busca.toLowerCase()
      result = result.filter(c =>
        c.numero.toLowerCase().includes(term) ||
        (c.referencia_interna ?? '').toLowerCase().includes(term) ||
        c.origem_nome.toLowerCase().includes(term) ||
        c.destino_nome.toLowerCase().includes(term)
      )
    }

    return result
  }, [cotacoes, filtroTab, busca])

  // ─── Ações de Linha ───

  const acoes = useMemo(() => [
    {
      id: 'ver',
      icone: <Eye weight="duotone" size={16} />,
      tooltip: 'Ver detalhes',
      onClick: (item: Cotacao) => navigate(`/cotacoes/${item.id}`),
    },
  ], [navigate])



  // ─── Render ───

  return (
    <PaginaGlobal
      className="bf-cotacoes"
      cabecalho={
        <CabecalhoGlobal
          icone={<FileText weight="duotone" size={22} />}
          titulo={t('bidfrete.cotacoes.titulo')}
        />
      }
    >
      {/* Conteúdo da Visão */}
      {visao === 'lista' ? (
        <div className="bf-table-section">
          <TabelaVirtualGlobal<Cotacao, any>
            dados={cotacoesFiltradas}
            colunas={colunasTabela}
            itemId={(item) => item.id}
            
            itensPorPagina={50}
            totalItens={cotacoesFiltradas.length}
            paginaAtual={1}
            onMudarPagina={() => {}}
            labelPai={['cotação', 'cotações']}
            
            abas={abas}
            abaAtiva={filtroTab}
            onMudarAba={setFiltroTab}
            
            acoes={acoes}
            
            onBuscar={setBusca}
            modoLocalizar={true}
            placeholderBusca="Buscar por processo, referência, origem ou destino..."
            
            camposEditaveis={CAMPOS_EDITAVEIS}
            onEditar={handleEditar}
            onSalvoComSucesso={() => addNotification({ type: 'success', message: 'Campo atualizado com sucesso.' })}
            onErroAoSalvar={(msg) => addNotification({ type: 'error', message: msg })}
            
            arrastavelPai={true}
            onReordenarPai={handleReordenarCotacoes}
            
            preferencias={preferencias}
            onSalvarPreferencias={handleSalvarPreferencias}
            colunasPadrao={COLUNAS_PADRAO_VISIVEIS}
            
            carregando={carregando}
            emptyIcon={<Package size={40} weight="duotone" style={{ color: 'var(--text-muted)' }} />}
            emptyTitle={t('bidfrete.cotacoes.vazio')}
            emptyDescription="Nenhuma cotação encontrada com os filtros selecionados."
            
            ariaLabel="Lista de Cotações"
          />
        </div>
      ) : (
        <CotacoesKanban
          cotacoes={cotacoesFiltradas}
          carregando={carregando}
          onRefresh={carregar}
        />
      )}

      <style>{`
        .bf-cotacoes {
          padding: 0;
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          height: 100%;
        }

        /* ── Toggle lista/kanban ── */
        .bf-toggle-btn {
          background: var(--bg-elevated, #475569);
          border: none;
          border-radius: var(--radius-md, 8px);
          padding: 0.4rem 0.5rem;
          cursor: pointer;
          color: var(--text-muted, #64748b);
          display: flex;
          align-items: center;
          transition: all 0.15s;
        }
        .bf-toggle-btn:hover {
          color: var(--text-secondary, #94a3b8);
        }
        .bf-toggle-btn--ativo {
          background: var(--accent, #6366f1);
          color: #fff;
        }
        .bf-toggle-btn--ativo:hover {
          color: #fff;
        }

        /* ── Table section ── */
        .bf-table-section {
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          overflow: hidden;
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        /* ── Kanban Board ── */
        .bf-kanban-board {
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
          padding-bottom: 1rem;
        }

        .bf-kanban-col {
          min-width: 280px;
          max-width: 320px;
          flex-shrink: 0;
          flex: 1;
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          display: flex;
          flex-direction: column;
        }

        .bf-kanban-col-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-lg, 12px) var(--radius-lg, 12px) 0 0;
          font-size: 0.8125rem;
          font-weight: 600;
        }

        .bf-kanban-col-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .bf-kanban-col-count {
          margin-left: auto;
          font-size: 0.75rem;
          font-weight: 700;
          opacity: 0.8;
        }

        .bf-kanban-col-body {
          flex: 1;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-height: 200px;
        }

        .bf-kanban-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          font-size: 0.8125rem;
          color: var(--text-muted, #64748b);
          opacity: 0.5;
        }

        .bf-kanban-card {
          background: var(--bg-base, #1e293b);
          border-radius: var(--radius-md, 8px);
          padding: 0.75rem;
          cursor: pointer;
          transition: transform 0.1s, box-shadow 0.1s;
          border: 1px solid var(--bg-elevated, #475569);
        }
        .bf-kanban-card:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.5));
        }

        .bf-kanban-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .bf-kanban-card-numero {
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          color: var(--text-muted, #64748b);
        }

        .bf-kanban-card-route {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-primary, #f1f5f9);
          margin-bottom: 0.35rem;
        }

        .bf-kanban-card-meta {
          display: flex;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-secondary, #94a3b8);
          margin-bottom: 0.35rem;
        }

        .bf-kanban-card-ref {
          font-size: 0.6875rem;
          color: var(--text-muted, #64748b);
          margin-bottom: 0.35rem;
        }

        .bf-kanban-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.6875rem;
          color: var(--text-muted, #64748b);
          padding-top: 0.35rem;
          border-top: 1px solid var(--bg-elevated, #475569);
        }

        /* ── Botões ── */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.25rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          border: none;
          font-family: inherit;
        }
        .btn-primary {
          background: var(--accent, #6366f1);
          color: #fff;
        }
        .btn-primary:hover { background: var(--accent-hover, #4f46e5); }
        .btn-secondary {
          background: var(--bg-surface, #334155);
          color: var(--text-secondary, #94a3b8);
          border: 1px solid var(--bg-elevated, #475569);
        }
        .btn-secondary:hover {
          background: var(--bg-elevated, #475569);
          color: var(--text-primary, #f1f5f9);
        }
      `}</style>
      {isNovaCotacao && (
        <React.Suspense fallback={null}>
          <NovaCotacao />
        </React.Suspense>
      )}
    </PaginaGlobal>
  )
}
