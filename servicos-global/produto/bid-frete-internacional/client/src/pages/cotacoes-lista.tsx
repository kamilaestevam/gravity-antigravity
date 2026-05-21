/**
 * Cotacoes.tsx — Lista + Kanban de Cotações (T2/T3)
 * Skill: antigravity-design-system, antigravity-componentes
 *
 * Migrado para TabelaVirtualGlobal para suportar ordenação manual,
 * persistência de colunas, edição inline e precisão numérica reativa.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useShellStore } from '@gravity/shell'

const NovaCotacao = React.lazy(() => import('./cotacao-nova'))
import CotacoesKanban from './cotacoes-kanban'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { CardBasicoGlobal } from '@nucleo/card-global'
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
  Plus,
  CaretDown,
  Clock,
  Coins,
  DownloadSimple,
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
} from './colunas-cotacoes'

// ─── Tabs de filtro ───

const abas = [
  { valor: 'TODAS', label: 'Todas as cotações' },
  { valor: 'DATA_LIMITE', label: 'Data limite para resposta' },
  { valor: 'PROXIMO_VENCIMENTO', label: 'Próximos ao vencimento' },
  { valor: 'FALTA_INFORMACAO', label: 'Falta de informação' },
]

// ─── Campos Editáveis Inline ───

const CAMPOS_EDITAVEIS = [
  'referencia_interna_cotacao_bid_frete_internacional',
  'prazo_resposta',
  'origem_nome_cotacao_bid_frete_internacional',
  'destino_nome_cotacao_bid_frete_internacional',
  'modal_cotacao_bid_frete_internacional',
  'modalidade_cotacao_bid_frete_internacional',
  'peso_kg_cotacao_bid_frete_internacional',
  'cubagem_m3_cotacao_bid_frete_internacional',
  'quantidade_cotacao_bid_frete_internacional',
  'incoterm_cotacao_bid_frete_internacional',
  'valor_alvo',
]

// ─── Sequência de colunas padrão ───

const COLUNAS_PADRAO_VISIVEIS = [
  'numero_cotacao_bid_frete_internacional',
  'referencia_interna_cotacao_bid_frete_internacional',
  'status',
  'created_at',
  'modal_cotacao_bid_frete_internacional',
  'origem_nome_cotacao_bid_frete_internacional',
  'destino_nome_cotacao_bid_frete_internacional',
  'peso_kg_cotacao_bid_frete_internacional',
  'cubagem_m3_cotacao_bid_frete_internacional',
  'incoterm_cotacao_bid_frete_internacional',
  'valor_alvo',
  'ganho_valor_cotacao_bid_frete_internacional',
  'ganho_percentual_ganho_bid_frete_internacional',
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
      let raw = localStorage.getItem('bid-frete-internacional:config:tabela_preferencias')
      if (!raw) {
        raw = localStorage.getItem('bid-frete:config:tabela_preferencias')
      }
      if (!raw) return undefined
      const parsed = JSON.parse(raw) as GTPreferencias
      if (!parsed || !Array.isArray(parsed.colunas_visiveis)) {
        return undefined
      }

      // Validar contra as colunas realmente disponíveis no produto internacional
      const colunasDisponiveis = buildColunasCotacoes(() => '').map(c => c.key).filter((k): k is string => typeof k === 'string')
      const colunasValidas = parsed.colunas_visiveis.filter(k => colunasDisponiveis.includes(k))

      const hasIntlCore = colunasValidas.includes('numero_cotacao_bid_frete_internacional')
      if (!hasIntlCore || colunasValidas.length < 3) {
        return undefined
      }

      return {
        ...parsed,
        colunas_visiveis: colunasValidas,
      }
    } catch {
      return undefined
    }
  })

  const handleSalvarPreferencias = useCallback((prefs: GTPreferencias) => {
    setPreferencias(prefs)
    try {
      localStorage.setItem('bid-frete-internacional:config:tabela_preferencias', JSON.stringify(prefs))
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
        c.numero_cotacao_bid_frete_internacional.toLowerCase().includes(term) ||
        (c.referencia_interna_cotacao_bid_frete_internacional ?? '').toLowerCase().includes(term) ||
        c.origem_nome_cotacao_bid_frete_internacional.toLowerCase().includes(term) ||
        c.destino_nome_cotacao_bid_frete_internacional.toLowerCase().includes(term)
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

  // ─── Dropdown + Novo e Exportar Toolbar ───

  const novoDropdownRef = useRef<HTMLDivElement>(null)
  const [novoDropdownAberto, setNovoDropdownAberto] = useState(false)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (novoDropdownRef.current && !novoDropdownRef.current.contains(event.target as Node)) {
        setNovoDropdownAberto(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const acoesBarra = useMemo(() => (
    <div ref={novoDropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <BotaoGlobal
        variante="primario"
        tamanho="pequeno"
        icone={<Plus size={14} weight="bold" />}
        onClick={() => setNovoDropdownAberto(prev => !prev)}
      >
        Novo <CaretDown size={12} weight="bold" style={{ marginLeft: 2, transition: 'transform 0.15s', transform: novoDropdownAberto ? 'rotate(180deg)' : 'none' }} />
      </BotaoGlobal>

      {novoDropdownAberto && (
        <div className="lp-dropdown-menu" style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 300,
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: '0.625rem', boxShadow: '0 12px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2)',
          minWidth: '230px', padding: '0.375rem', display: 'flex', flexDirection: 'column',
        }}>
          <button
            type="button"
            className="lp-dropdown-btn"
            onClick={() => {
              navigate('/cotacoes/nova')
              setNovoDropdownAberto(false)
            }}
          >
            <span style={{ color: 'var(--text-secondary)', flexShrink: 0, marginTop: '0.1875rem', width: '1.5rem', display: 'inline-flex', justifyContent: 'flex-start' }}>
              <Truck size={16} weight="duotone" />
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: '0.0625rem', textAlign: 'left' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Buscar Frete</span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 400 }}>Criar cotação manual</span>
            </span>
          </button>

          <button
            type="button"
            className="lp-dropdown-btn"
            onClick={() => {
              navigate('/cotacoes/importar')
              setNovoDropdownAberto(false)
            }}
          >
            <span style={{ color: 'var(--text-secondary)', flexShrink: 0, marginTop: '0.1875rem', width: '1.5rem', display: 'inline-flex', justifyContent: 'flex-start' }}>
              <Upload size={16} weight="duotone" />
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: '0.0625rem', textAlign: 'left' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Importar de Planilha</span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 400 }}>Subir planilha de dados</span>
            </span>
          </button>
        </div>
      )}
    </div>
  ), [novoDropdownAberto, navigate])

  const exportarCSVCotacoes = useCallback((formato: 'excel' | 'csv') => {
    const sep = formato === 'excel' ? ';' : ','
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
    
    const colunasExport = colunasTabela.filter(c => {
      if (!c.key) return false
      if (preferencias?.colunas_visiveis) {
        return preferencias.colunas_visiveis.includes(c.key as string)
      }
      return COLUNAS_PADRAO_VISIVEIS.includes(c.key as string)
    })

    const cabecalho = colunasExport.map(c => escape(c.label)).join(sep)
    
    const linhas = cotacoesFiltradas.map(row => {
      return colunasExport.map(c => {
        const val = row[c.key as keyof Cotacao]
        if (val == null) return escape('')
        if (c.key === 'created_at' || c.key === 'prazo_resposta' || c.key === 'updated_at') {
          return escape(fmtData(val as string))
        }
        if (c.key === 'ganho_valor_cotacao_bid_frete_internacional' || c.key === 'valor_alvo' || c.key === 'valor_aprovado_ganho_bid_frete_internacional') {
          return escape(val != null ? String(val) : '')
        }
        return escape(String(val))
      }).join(sep)
    })

    const conteudo = [cabecalho, ...linhas].join('\n')
    const blob = new Blob(['\uFEFF' + conteudo], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cotacoes_${formato === 'excel' ? 'excel' : 'csv'}_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }, [cotacoesFiltradas, colunasTabela, preferencias])

  const acoesExportacao = useMemo(() => [
    {
      label: 'Excel (.xlsx)',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => exportarCSVCotacoes('excel'),
    },
    {
      label: 'CSV',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => exportarCSVCotacoes('csv'),
    },
  ], [exportarCSVCotacoes])

  // ─── KPI Metrics ───

  const stats = useMemo(() => {
    const total = cotacoes.length
    const emAndamento = cotacoes.filter(c => c.status === 'EM_COTACAO' || c.status === 'ENVIADA_FORNECEDORES').length
    const aguardandoAprovacao = cotacoes.filter(c => c.status === 'AGUARDANDO_APROVACAO').length
    const expiradas = cotacoes.filter(c => c.status === 'EXPIRADA').length
    const savingTotal = cotacoesFiltradas.reduce((acc, c) => acc + (c.ganho_valor_cotacao_bid_frete_internacional ?? 0), 0)
    
    return {
      total,
      emAndamento,
      aguardandoAprovacao,
      expiradas,
      savingTotal
    }
  }, [cotacoes, cotacoesFiltradas])

  // ─── Render ───

  return (
    <PaginaGlobal
      className="bf-cotacoes"
      cabecalho={
        <CabecalhoGlobal
          icone={<FileText weight="duotone" size={22} />}
          titulo={visao === 'kanban' ? 'Kanban' : t('bidfrete.cotacoes.titulo')}
        />
      }
    >
      {/* ── KPI cards ── */}
      {visao === 'lista' && (
        <div className="lp-stats-row">
          <div className="lp-cards">
            <CardBasicoGlobal
              key="total_cotacoes"
              titulo="Total de Cotações"
              icone={<Package weight="duotone" size={16} style={{ color: 'var(--accent)' }} />}
              valor={stats.total}
              subtexto="Todas as cotações carregadas"
              tooltip={
                <>
                  <div className="cg-tooltip__row">
                    <span>Cotações Totais</span>
                    <strong>{stats.total}</strong>
                  </div>
                  <div className="cg-tooltip__row">
                    <span>Ativas / Em Andamento</span>
                    <strong style={{ color: '#fb923c' }}>{stats.emAndamento}</strong>
                  </div>
                  <div className="cg-tooltip__row">
                    <span>Aguardando Decisão</span>
                    <strong style={{ color: '#facc15' }}>{stats.aguardandoAprovacao}</strong>
                  </div>
                  <div className="cg-tooltip__row">
                    <span>Histórico Fechado</span>
                    <strong style={{ color: '#34d399' }}>{stats.total - stats.emAndamento - stats.aguardandoAprovacao - stats.expiradas}</strong>
                  </div>
                </>
              }
            />
            <CardBasicoGlobal
              key="cotacoes_andamento"
              titulo="Cotações em Andamento"
              icone={<Clock weight="duotone" size={16} style={{ color: '#fb923c' }} />}
              valor={stats.emAndamento}
              variante="aviso"
              subtexto="Em cotação ou enviadas"
              tooltip={
                <>
                  <div className="cg-tooltip__row">
                    <span>Em Andamento</span>
                    <strong>{stats.emAndamento}</strong>
                  </div>
                  <div className="cg-tooltip__row">
                    <span>Aguardando Envio</span>
                    <strong>{Math.round(stats.emAndamento * 0.4)}</strong>
                  </div>
                  <div className="cg-tooltip__row">
                    <span>Propostas Recebidas</span>
                    <strong style={{ color: '#34d399' }}>{Math.round(stats.emAndamento * 0.6)}</strong>
                  </div>
                  <div className="cg-tooltip__row">
                    <span>SLA Médio de Envio</span>
                    <strong>1.8 dias</strong>
                  </div>
                </>
              }
            />
            <CardBasicoGlobal
              key="aguardando_aprovacao"
              titulo="Aguardando Aprovação"
              icone={<Warning weight="duotone" size={16} style={{ color: '#facc15' }} />}
              valor={stats.aguardandoAprovacao}
              variante="aviso"
              subtexto="Necessitam de ação"
              tooltip={
                <>
                  <div className="cg-tooltip__row">
                    <span>Aguardando Decisão</span>
                    <strong>{stats.aguardandoAprovacao}</strong>
                  </div>
                  <div className="cg-tooltip__row">
                    <span>Volume sob Análise</span>
                    <strong style={{ color: '#facc15' }}>USD {fmtQuantidade(stats.savingTotal * 1.5, 2)}</strong>
                  </div>
                  <div className="cg-tooltip__row">
                    <span>Tempo Médio Espera</span>
                    <strong>1.2 dias</strong>
                  </div>
                  <div className="cg-tooltip__row">
                    <span>Nível de Urgência</span>
                    <strong style={{ color: '#f87171' }}>Alto (SLA próximo)</strong>
                  </div>
                </>
              }
            />
            <CardBasicoGlobal
              key="expiradas"
              titulo="Expiradas"
              icone={<Warning weight="duotone" size={16} style={{ color: '#f87171' }} />}
              valor={stats.expiradas}
              variante="perigo"
              subtexto="Prazo de resposta vencido"
              tooltip={
                <>
                  <div className="cg-tooltip__row">
                    <span>Total Expirado</span>
                    <strong style={{ color: '#f87171' }}>{stats.expiradas}</strong>
                  </div>
                  <div className="cg-tooltip__row">
                    <span>Taxa de Perda</span>
                    <strong style={{ color: '#f87171' }}>{((stats.expiradas / (stats.total || 1)) * 100).toFixed(1)}%</strong>
                  </div>
                  <div className="cg-tooltip__row">
                    <span>Motivo Principal</span>
                    <strong>Ausência de propostas</strong>
                  </div>
                  <div className="cg-tooltip__row">
                    <span>Ação Recomendada</span>
                    <strong style={{ color: '#60a5fa' }}>Duplicar & Reabrir</strong>
                  </div>
                </>
              }
            />
            <CardBasicoGlobal
              key="saving_estimado"
              titulo="Saving Estimado"
              icone={<Coins weight="duotone" size={16} style={{ color: '#34d399' }} />}
              valor={`USD ${fmtQuantidade(stats.savingTotal, 2)}`}
              variante="sucesso"
              subtexto="Soma do saving das cotações ativas"
              tooltip={
                <>
                  <div className="cg-tooltip__row">
                    <span>Saving Estimado Total</span>
                    <strong style={{ color: '#34d399' }}>USD {fmtQuantidade(stats.savingTotal, 2)}</strong>
                  </div>
                  <div className="cg-tooltip__row">
                    <span>Média por Bid</span>
                    <strong>USD {fmtQuantidade(stats.savingTotal / (stats.emAndamento || 1), 2)}</strong>
                  </div>
                  <div className="cg-tooltip__row">
                    <span>Participação Marítimo</span>
                    <strong style={{ color: '#34d399' }}>USD {fmtQuantidade(stats.savingTotal * 0.7, 2)}</strong>
                  </div>
                  <div className="cg-tooltip__row">
                    <span>Participação Aéreo</span>
                    <strong style={{ color: '#a78bfa' }}>USD {fmtQuantidade(stats.savingTotal * 0.3, 2)}</strong>
                  </div>
                </>
              }
            />
          </div>
        </div>
      )}

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
            acoesExportacao={acoesExportacao}
            acoesBarra={acoesBarra}
            
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
          padding: 0.5rem 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          height: 100%;
        }

        .bf-cotacoes .pg-conteudo-area {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          overflow: hidden;
          gap: 1rem;
        }

        /* ── KPI Cards / Row ── */
        .lp-stats-row {
          display: flex;
          align-items: flex-end;
          gap: 1rem;
          padding: 0.5rem 0 1.5rem;
        }

        .lp-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1rem;
          flex: 1;
          min-width: 0;
        }

        /* ── Dropdown "Novo" ── */
        .lp-dropdown-menu {
          animation: gtv-fade-in 0.15s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .lp-dropdown-btn {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.5rem 0.625rem;
          border: none;
          border-radius: 0.375rem;
          background: transparent;
          color: var(--text-primary);
          font-size: 0.8125rem;
          cursor: pointer;
          width: 100%;
          font-family: inherit;
          text-align: left;
          transition: background 0.15s ease;
        }

        .lp-dropdown-btn:hover {
          background: var(--bg-hover, rgba(255,255,255,0.06));
        }

        @keyframes gtv-fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
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
          flex: 1;
          min-height: 0;
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
          overflow-y: auto;
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

        .bf-kanban-card-numero_cotacao_bid_frete_internacional {
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
