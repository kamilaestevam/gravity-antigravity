/**
 * ModalExecutarTestes (CAMADA UI)
 * -------------------------------
 * Modal standalone disparado pelo botão "Rodar todos os testes" da tela de Log de Testes.
 * Permite ao usuário escolher produto/ambiente, selecionar planos específicos e disparar a execução.
 *
 * Divisão UI × domínio:
 * - ESTE arquivo — React, layout, abas, pills, estilos, adminPlanosTesteApi, adminTestesApi, i18n.
 * - `@testes/infra/admin/testes-favoritos-admin` — favoritos (Zod, localStorage, rótulos, snapshot).
 *   Ver comentário de cabeçalho em testes/infra/admin/testes-favoritos-admin.ts e README da pasta.
 *
 * Historicamente esse conteúdo era uma aba ("Execução Manual") dentro do ModalAgendamentoTestes,
 * mas foi extraído para não poluir o modal de agendamento (que só cuida de configurar cron/alertas).
 *
 * Mapeamento Produto → Escopo (Prisma TestePlano.escopo_plano_teste):
 *   admin           → ADMIN
 *   configurador    → CONFIG
 *   pedido          → PEDIDO
 *   bid-frete       → BIDFRT
 *   bid-cambio      → BIDCAM
 *   lpco            → LPCO
 *   nf-importacao   → NFIMP
 *   simula-custo    → SIMCUS
 */
import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalFormularioAbasGlobal, type AbaFormulario } from '@nucleo/modal-formulario-abas-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { Play, CheckSquare, Square, Flask, Funnel, ListMagnifyingGlass, PencilSimple, Check, X, Star, Trash } from '@phosphor-icons/react'
import { adminPlanosTesteApi, adminTestesApi, type PlanoTesteApi } from '../../services/api-client'
import { useShellStore } from '@gravity/shell'
import { ModalDetalhePlanoTeste } from './ModalDetalhePlanoTeste'
import {
  adicionarTesteFavoritoAdmin,
  lerTestesFavoritosAdmin,
  montarResumoPlanosFavorito,
  planosExibicaoFavorito,
  tituloPlanoFavoritoExibicao,
  removerTesteFavoritoAdmin,
  rotuloTesteFavoritoAdmin,
  type AmbienteTesteFavorito,
  type ProdutoTesteFavorito,
  type TesteFavoritoAdmin,
  type TipoTesteFavorito,
} from '@testes/infra/admin/testes-favoritos-admin'

export interface ModalExecutarTestesProps {
  aberto: boolean
  aoFechar: () => void
  /** Notifica o pai para iniciar o polling de status após o disparo. */
  aoIniciarRun?: (planos: string[]) => void
}

/** Produto/Local — primeira opção é Admin (singleton do Gravity HQ). */
const PRODUTOS = [
  { valor: 'admin',         rotulo: 'Admin' },
  { valor: 'configurador',  rotulo: 'Configurador' },
  { valor: 'pedido',        rotulo: 'Pedido' },
  { valor: 'bid-frete',     rotulo: 'BID Frete Internacional' },
  { valor: 'bid-cambio',    rotulo: 'Bid Câmbio' },
  { valor: 'lpco',          rotulo: 'LPCO' },
  { valor: 'nf-importacao', rotulo: 'NF Importação' },
  { valor: 'simula-custo',  rotulo: 'SimulaCusto' },
]

/** Mapeamento produto → TestePlano.escopo_plano_teste (campo Prisma). */
const PRODUTO_PARA_ESCOPO: Record<string, string> = {
  'admin':          'ADMIN',
  'configurador':   'CONFIG',
  'pedido':         'PEDIDO',
  'bid-frete':      'BIDFRT',
  'bid-cambio':     'BIDCAM',
  'lpco':           'LPCO',
  'nf-importacao':  'NFIMP',
  'simula-custo':   'SIMCUS',
}

const opcoesAmbiente = [
  { valor: 'Local',    rotulo: 'Local' },
  { valor: 'Staging',  rotulo: 'Staging' },
  { valor: 'Producao', rotulo: 'Produção' },
]

/** Tipos de teste (TestePlano.tipo_plano_teste). CRO = cross-organização. EMT = em tela. */
type TipoTeste = 'UNI' | 'FUN' | 'E2E' | 'EMT' | 'CRO'
const TIPOS_TESTE: Array<{ valor: TipoTeste; rotulo: string; descricao: string }> = [
  { valor: 'UNI', rotulo: 'Unitário',     descricao: 'Vitest — função/hook isolado' },
  { valor: 'FUN', rotulo: 'Funcional',    descricao: 'Vitest+Supertest — rota/fluxo HTTP' },
  { valor: 'E2E', rotulo: 'End-to-End',   descricao: 'Playwright — fluxo no navegador' },
  { valor: 'CRO', rotulo: 'Cross-Org',    descricao: 'Isolamento entre organizações' },
  { valor: 'EMT', rotulo: 'Em tela',      descricao: 'Playwright visual — script tsx dedicado' },
]

/** Filtro padrão: todos os tipos visíveis (evita lista vazia ao abrir o modal). */
const TODOS_TIPOS_ATIVOS = new Set<TipoTeste>(TIPOS_TESTE.map(t => t.valor))

/**
 * Títulos de seção (uppercase) — Solid Slate:
 * cor #94a3b8 (--text-secondary), 0.7rem, peso 800, letter-spacing 0.1em.
 * Título do plano: #f1f5f9, 11px, peso 250. Descrição: #64748b (--text-muted).
 */
const estiloTituloSecao: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  fontSize: '0.7rem',
  fontWeight: 800,
  textTransform: 'uppercase',
  color: '#94a3b8',
  letterSpacing: '0.1em',
  margin: 0,
}

/** Título do plano (lista + favoritos) — 11px, peso 250, --text-primary. */
const estiloTituloPlano: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 250,
  color: '#f1f5f9',
  lineHeight: 1.35,
}

const estiloLinkSelecionarTodos: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#a78bfa',
  fontSize: '0.625rem',
  cursor: 'pointer',
  fontWeight: 600,
  padding: 0,
  alignSelf: 'flex-start',
}

export function ModalExecutarTestes({ aberto, aoFechar, aoIniciarRun }: ModalExecutarTestesProps) {
  const { t } = useTranslation()
  const [dadosManual, setDadosManual] = useState({
    produto: 'admin',
    ambiente: 'Local',
  })

  /** Tipos de teste selecionados (filtro). Padrão: todos visíveis. */
  const [tiposAtivos, setTiposAtivos] = useState<Set<TipoTeste>>(() => new Set(TODOS_TIPOS_ATIVOS))

  const [planosDisponiveis, setPlanosDisponiveis] = useState<PlanoTesteApi[]>([])
  const [planosSelecionados, setPlanosSelecionados] = useState<Set<string>>(new Set())
  const [carregandoPlanos, setCarregandoPlanos] = useState(false)
  const [rodando, setRodando] = useState(false)
  const [planoDetalhe, setPlanoDetalhe] = useState<PlanoTesteApi | null>(null)
  const [editandoPlanoId, setEditandoPlanoId] = useState<string | null>(null)
  const [rascunhoNomePlano, setRascunhoNomePlano] = useState('')
  const [rascunhoTituloPlano, setRascunhoTituloPlano] = useState('')
  const [salvandoPlano, setSalvandoPlano] = useState(false)
  const [favoritos, setFavoritos] = useState<TesteFavoritoAdmin[]>([])
  const [favoritoPendente, setFavoritoPendente] = useState<TesteFavoritoAdmin | null>(null)

  const currentUser = useShellStore(s => s.currentUser)
  const idUsuario = currentUser.id?.trim() || null

  // Ao abrir o modal: tipos com filtro completo; planos desmarcados (favorito pode pré-selecionar)
  useEffect(() => {
    if (!aberto) return
    setTiposAtivos(new Set(TODOS_TIPOS_ATIVOS))
    setPlanosSelecionados(new Set())
    setFavoritoPendente(null)
    if (idUsuario) setFavoritos(lerTestesFavoritosAdmin(idUsuario))
  }, [aberto, idUsuario])

  // Carrega planos quando o produto muda (sem pré-selecionar)
  useEffect(() => {
    if (!aberto) return
    setCarregandoPlanos(true)
    setPlanosSelecionados(new Set())
    const escopo = PRODUTO_PARA_ESCOPO[dadosManual.produto]
    adminPlanosTesteApi.listar(escopo)
      .then(res => {
        setPlanosDisponiveis(res.planos)
      })
      .catch(() => setPlanosDisponiveis([]))
      .finally(() => setCarregandoPlanos(false))
  }, [dadosManual.produto, aberto])

  // Aplica planos do favorito após carregar a lista do produto
  useEffect(() => {
    if (!favoritoPendente || carregandoPlanos) return
    if (favoritoPendente.produto !== dadosManual.produto) return
    const idsValidos = favoritoPendente.planos_ids.filter(id => planosDisponiveis.some(p => p.id === id))
    setPlanosSelecionados(new Set(idsValidos))
    setFavoritoPendente(null)
  }, [favoritoPendente, carregandoPlanos, planosDisponiveis, dadosManual.produto])

  /** Filtra os planos pelos tipos ativos no momento. */
  const planosFiltrados = planosDisponiveis.filter(p => tiposAtivos.has(p.tipo as TipoTeste))

  /** Planos que serão de fato disparados (selecionados ∩ filtro de tipo). */
  const idsElegiveis = useMemo(
    () => Array.from(planosSelecionados).filter(id => planosFiltrados.some(p => p.id === id)),
    [planosSelecionados, planosFiltrados],
  )

  function togglePlano(id: string) {
    setPlanosSelecionados(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function iniciarEdicaoPlano(plano: PlanoTesteApi) {
    setEditandoPlanoId(plano.id)
    setRascunhoNomePlano(plano.id)
    setRascunhoTituloPlano(plano.tela ?? plano.modulo ?? '')
  }

  function cancelarEdicaoPlano() {
    setEditandoPlanoId(null)
    setRascunhoNomePlano('')
    setRascunhoTituloPlano('')
  }

  async function salvarEdicaoPlano(idAtual: string) {
    const nome = rascunhoNomePlano.trim()
    const titulo = rascunhoTituloPlano.trim()
    if (!nome || !titulo) {
      setErroExecucao('Nome do plano (ID) e título são obrigatórios.')
      return
    }
    if (!/^TST-[A-Z0-9][A-Z0-9-]*$/.test(nome)) {
      setErroExecucao('ID inválido — use o padrão TST-… (maiúsculas, hífens).')
      return
    }

    const planoAtual = planosDisponiveis.find(p => p.id === idAtual)
    const tituloAtual = planoAtual?.tela ?? planoAtual?.modulo ?? ''
    const payload: { id?: string; titulo?: string } = {}
    if (nome !== idAtual) payload.id = nome
    if (titulo !== tituloAtual) payload.titulo = titulo
    if (Object.keys(payload).length === 0) {
      cancelarEdicaoPlano()
      return
    }

    setSalvandoPlano(true)
    setErroExecucao(null)
    try {
      const res = await adminPlanosTesteApi.atualizar(idAtual, payload)
      const atualizado = res.plano as PlanoTesteApi
      setPlanosDisponiveis(prev => prev.map(p => (p.id === idAtual ? { ...p, ...atualizado } : p)))
      if (payload.id && planosSelecionados.has(idAtual)) {
        setPlanosSelecionados(prev => {
          const next = new Set(prev)
          next.delete(idAtual)
          next.add(atualizado.id)
          return next
        })
      }
      if (planoDetalhe?.id === idAtual) {
        setPlanoDetalhe({ ...planoDetalhe, ...atualizado })
      }
      cancelarEdicaoPlano()
      addNotification({ type: 'success', message: 'Plano de teste atualizado no registry' })
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao salvar plano'
      setErroExecucao(mensagem)
      addNotification({ type: 'error', message: mensagem })
    } finally {
      setSalvandoPlano(false)
    }
  }

  function toggleTipo(tipo: TipoTeste) {
    setTiposAtivos(prev => {
      const next = new Set(prev)
      if (next.has(tipo)) next.delete(tipo)
      else next.add(tipo)
      return next
    })
  }

  const todosTiposMarcados = TIPOS_TESTE.every(t => tiposAtivos.has(t.valor))

  function toggleTodosTipos() {
    if (todosTiposMarcados) setTiposAtivos(new Set())
    else setTiposAtivos(new Set(TIPOS_TESTE.map(t => t.valor)))
  }

  function toggleTodosPlanosFiltrados() {
    const idsFiltrados = planosFiltrados.map(p => p.id)
    const todosSelecionados = idsFiltrados.length > 0 && idsFiltrados.every(id => planosSelecionados.has(id))
    if (todosSelecionados) {
      const next = new Set(planosSelecionados)
      idsFiltrados.forEach(id => next.delete(id))
      setPlanosSelecionados(next)
    } else {
      setPlanosSelecionados(new Set([...planosSelecionados, ...idsFiltrados]))
    }
  }

  const addNotification = useShellStore((s) => s.addNotification)
  const [erroExecucao, setErroExecucao] = useState<string | null>(null)

  function salvarFavoritoAtual() {
    if (!idUsuario) {
      addNotification({ type: 'warning', message: 'Faça login para salvar favoritos de teste' })
      return
    }
    if (tiposAtivos.size === 0) {
      addNotification({ type: 'warning', message: 'Marque ao menos um tipo de teste antes de favoritar' })
      return
    }
    const favorito: TesteFavoritoAdmin = {
      produto: dadosManual.produto as ProdutoTesteFavorito,
      ambiente: dadosManual.ambiente as AmbienteTesteFavorito,
      tipos: Array.from(tiposAtivos) as TipoTesteFavorito[],
      planos_ids: [...idsElegiveis],
      planos_resumo: montarResumoPlanosFavorito(idsElegiveis, planosDisponiveis),
    }
    const res = adicionarTesteFavoritoAdmin(idUsuario, favorito)
    setFavoritos(res.favoritos)
    if (!res.adicionado) {
      if (res.motivo === 'duplicado') {
        addNotification({ type: 'info', message: 'Esta configuração já está nos favoritos' })
      } else if (res.motivo === 'limite') {
        addNotification({ type: 'warning', message: 'Limite de favoritos atingido (máx. 20)' })
      } else {
        addNotification({ type: 'error', message: 'Não foi possível salvar o favorito' })
      }
      return
    }
    addNotification({ type: 'success', message: 'Configuração salva em Testes Favoritos' })
  }

  function aplicarFavorito(favorito: TesteFavoritoAdmin) {
    setDadosManual({ produto: favorito.produto, ambiente: favorito.ambiente })
    setTiposAtivos(new Set(favorito.tipos as TipoTeste[]))
    setPlanosSelecionados(new Set())
    setFavoritoPendente(favorito)
  }

  function excluirFavorito(indice: number) {
    if (!idUsuario) return
    const lista = removerTesteFavoritoAdmin(idUsuario, indice)
    setFavoritos(lista)
    addNotification({ type: 'success', message: 'Favorito removido' })
  }

  async function handleExecutar() {
    if (idsElegiveis.length === 0) return
    setErroExecucao(null)
    setRodando(true)
    try {
      const idsAExecutar = idsElegiveis
      if (idsAExecutar.length === 0) {
        setErroExecucao('Nenhum plano elegível para executar. Ative o tipo EMT (ou outro) no filtro e selecione ao menos um plano.')
        return
      }
      const ambiente = dadosManual.ambiente as 'Local' | 'Staging' | 'Producao'
      await adminTestesApi.disparar({ planos: idsAExecutar, ambiente })
      addNotification({ type: 'success', message: `Execução iniciada — ${idsAExecutar.length} plano(s) disparados` })
      if (aoIniciarRun) aoIniciarRun(idsAExecutar)
      aoFechar()
    } catch (err) {
      // Erro alto (Mandamento 08): exibe a mensagem do backend tanto no
      // próprio modal quanto numa notification persistente.
      const mensagem = err instanceof Error ? err.message : 'Erro desconhecido ao disparar testes'
      setErroExecucao(mensagem)
      addNotification({ type: 'error', message: `Falha ao disparar: ${mensagem.slice(0, 200)}` })
      // Modal NÃO fecha — usuário precisa ver o erro e decidir o que fazer.
    } finally {
      setRodando(false)
    }
  }

  const abas: AbaFormulario[] = [
    {
      id: 'executar',
      rotulo: 'Executar',
      ocultarBotoesSalvar: true, // tem botão de ação próprio ("Executar N plano(s)")
      conteudo: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', minHeight: 0, overflowY: 'auto' }}>
          <h4 style={estiloTituloSecao}>
            <Play size={13} weight="fill" /> Disparo Manual por Plano
          </h4>

          {/* Seletor de Produto + Ambiente */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <CampoGeralGlobal label="Produto / Local">
              <SelectGlobal
                opcoes={PRODUTOS}
                valor={dadosManual.produto}
                aoMudarValor={v => setDadosManual({ ...dadosManual, produto: String(v) })}
              />
            </CampoGeralGlobal>
            <CampoGeralGlobal label={t('admin.testes-gerais.agendamento.campo_ambiente_origem')}>
              <SelectGlobal
                opcoes={opcoesAmbiente}
                valor={dadosManual.ambiente}
                aoMudarValor={v => setDadosManual({ ...dadosManual, ambiente: String(v) })}
              />
            </CampoGeralGlobal>
          </div>

          {/* Filtro por tipo de teste */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={estiloTituloSecao}>
              <Funnel size={13} weight="fill" />
              Tipos de Teste Ativos (Filtro)
            </span>
            <button
              type="button"
              onClick={toggleTodosTipos}
              style={estiloLinkSelecionarTodos}
            >
              {todosTiposMarcados ? 'Desmarcar todos' : 'Selecionar todos'}
            </button>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {TIPOS_TESTE.map(tipo => {
                const ativo = tiposAtivos.has(tipo.valor)
                return (
                  <button
                    key={tipo.valor}
                    type="button"
                    onClick={() => toggleTipo(tipo.valor)}
                    title={tipo.descricao}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                      padding: '0.4rem 0.75rem', borderRadius: '8px',
                      background: ativo ? 'rgba(167, 139, 250, 0.12)' : 'rgba(15, 23, 42, 0.4)',
                      border: `1px solid ${ativo ? 'rgba(167, 139, 250, 0.4)' : 'rgba(255,255,255,0.08)'}`,
                      color: ativo ? '#c4b5fd' : '#64748b',
                      fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {ativo ? <CheckSquare size={14} weight="fill" /> : <Square size={14} />}
                    <span style={{ letterSpacing: '0.05em' }}>{tipo.valor}</span>
                    <span style={{ fontWeight: 500, opacity: 0.85 }}>· {tipo.rotulo}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Lista de Planos — flex:1 absorve altura restante */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minHeight: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.25rem' }}>
              <span style={estiloTituloSecao}>
                <Flask size={13} weight="fill" />
                Planos disponíveis — {PRODUTOS.find(p => p.valor === dadosManual.produto)?.rotulo ?? dadosManual.produto}
                {planosDisponiveis.length > 0 && (
                  <span style={{ fontWeight: 500, color: '#64748b' }}>
                    · {planosFiltrados.length}/{planosDisponiveis.length} após filtro
                  </span>
                )}
              </span>
              {planosFiltrados.length > 0 && (
                <button
                  type="button"
                  onClick={toggleTodosPlanosFiltrados}
                  style={estiloLinkSelecionarTodos}
                >
                  {planosFiltrados.every(p => planosSelecionados.has(p.id)) ? 'Desmarcar todos' : 'Selecionar todos'}
                </button>
              )}
            </div>

            {carregandoPlanos ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                Carregando planos...
              </div>
            ) : planosFiltrados.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem',
                border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                {planosDisponiveis.length === 0
                  ? 'Nenhum plano de teste cadastrado para este produto.'
                  : tiposAtivos.size === 0
                    ? `Nenhum tipo marcado — use «Selecionar todos» acima. ${planosDisponiveis.length} plano(s) aguardando no registry.`
                    : `Nenhum plano para os tipos marcados (${planosDisponiveis.length} ocultados pelo filtro).`}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minHeight: 0, overflowY: 'auto' }}>
                {planosFiltrados.map(plano => {
                  const selecionado = planosSelecionados.has(plano.id)
                  const badgeTipo = plano.tipo === 'EMT'
                    ? { bg: 'rgba(245, 158, 11, 0.15)', cor: '#fcd34d', borda: 'rgba(245, 158, 11, 0.35)' }
                    : plano.tipo === 'E2E'
                      ? { bg: 'rgba(99, 102, 241, 0.15)', cor: '#a5b4fc', borda: 'rgba(99, 102, 241, 0.35)' }
                      : { bg: 'rgba(167, 139, 250, 0.15)', cor: '#c4b5fd', borda: 'rgba(167, 139, 250, 0.3)' }
                  return (
                    <div
                      key={plano.id}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                        padding: '0.875rem 1rem', borderRadius: '10px',
                        background: selecionado ? 'rgba(99, 102, 241, 0.08)' : 'rgba(15, 23, 42, 0.3)',
                        border: `1px solid ${selecionado ? 'rgba(99, 102, 241, 0.35)' : 'rgba(255,255,255,0.06)'}`,
                        transition: 'all 0.15s',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => togglePlano(plano.id)}
                        title={selecionado ? 'Desmarcar plano' : 'Marcar plano'}
                        style={{
                          marginTop: '1px', flexShrink: 0, background: 'none', border: 'none', padding: 0,
                          color: selecionado ? '#818cf8' : '#475569', cursor: 'pointer',
                        }}
                      >
                        {selecionado
                          ? <CheckSquare size={18} weight="fill" />
                          : <Square size={18} />
                        }
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.06em',
                            padding: '2px 5px', borderRadius: '3px', marginTop: editandoPlanoId === plano.id ? 6 : 0,
                            background: badgeTipo.bg, color: badgeTipo.cor,
                            border: `1px solid ${badgeTipo.borda}`,
                          }}>
                            {plano.tipo}
                          </span>
                          {editandoPlanoId === plano.id ? (
                            <div
                              style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                              onClick={e => e.stopPropagation()}
                            >
                              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                                  Nome do teste (ID)
                                </span>
                                <input
                                  value={rascunhoNomePlano}
                                  onChange={e => setRascunhoNomePlano(e.target.value)}
                                  disabled={salvandoPlano}
                                  style={{
                                    width: '100%', padding: '0.5rem 0.65rem', borderRadius: '6px',
                                    background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(99,102,241,0.35)',
                                    color: '#e2e8f0', fontSize: '0.75rem', fontFamily: 'ui-monospace, monospace',
                                  }}
                                />
                              </label>
                              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                                  Título
                                </span>
                                <input
                                  value={rascunhoTituloPlano}
                                  onChange={e => setRascunhoTituloPlano(e.target.value)}
                                  disabled={salvandoPlano}
                                  style={{
                                    width: '100%', padding: '0.5rem 0.65rem', borderRadius: '6px',
                                    background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(99,102,241,0.35)',
                                    color: '#f1f5f9', fontSize: '0.85rem',
                                  }}
                                />
                              </label>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  type="button"
                                  disabled={salvandoPlano}
                                  onClick={() => salvarEdicaoPlano(plano.id)}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                    padding: '0.35rem 0.75rem', borderRadius: '6px', border: 'none',
                                    background: '#10b981', color: '#fff', fontSize: '0.75rem', fontWeight: 700,
                                    cursor: salvandoPlano ? 'not-allowed' : 'pointer',
                                  }}
                                >
                                  <Check size={14} weight="bold" />
                                  {salvandoPlano ? 'Salvando…' : 'Salvar'}
                                </button>
                                <button
                                  type="button"
                                  disabled={salvandoPlano}
                                  onClick={cancelarEdicaoPlano}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                    padding: '0.35rem 0.75rem', borderRadius: '6px',
                                    background: 'transparent', color: '#94a3b8',
                                    border: '1px solid rgba(255,255,255,0.15)', fontSize: '0.75rem', fontWeight: 600,
                                    cursor: salvandoPlano ? 'not-allowed' : 'pointer',
                                  }}
                                >
                                  <X size={14} weight="bold" />
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => setPlanoDetalhe(plano)}
                                title="Ver todos os casos deste plano"
                                style={{
                                  fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.06em',
                                  padding: '2px 6px', borderRadius: '4px',
                                  background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc',
                                  border: '1px solid rgba(99, 102, 241, 0.35)',
                                  cursor: 'pointer', textDecoration: 'underline',
                                  textUnderlineOffset: '2px',
                                }}
                              >
                                {plano.id}
                              </button>
                              <span style={estiloTituloPlano}>
                                {plano.tela ?? plano.modulo ?? plano.sublocal}
                              </span>
                              <button
                                type="button"
                                onClick={() => iniciarEdicaoPlano(plano)}
                                title="Editar nome e título do plano"
                                style={{
                                  marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                  padding: '0.25rem 0.5rem', borderRadius: '6px', border: 'none',
                                  background: 'rgba(99, 102, 241, 0.12)', color: '#a5b4fc',
                                  fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
                                }}
                              >
                                <PencilSimple size={13} weight="bold" />
                                Editar
                              </button>
                            </>
                          )}
                        </div>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.775rem', color: '#64748b', lineHeight: 1.4 }}>
                          {plano.sublocal}
                          {plano.criticidade && ` · criticidade ${plano.criticidade}`}
                          {typeof plano.passosTotal === 'number' && ` · ${plano.passosTotal} passos`}
                          {typeof plano.casosTotal === 'number' && ` · ${plano.casosTotal} casos`}
                        </p>
                        <button
                          type="button"
                          onClick={() => setPlanoDetalhe(plano)}
                          style={{
                            marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                            background: 'none', border: 'none', padding: 0,
                            color: '#818cf8', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          <ListMagnifyingGlass size={14} weight="bold" />
                          Ver o que será testado
                          {typeof plano.casosTotal === 'number' && ` (${plano.casosTotal} casos)`}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Testes Favoritos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={estiloTituloSecao}>
                <Star size={13} weight="fill" />
                Testes Favoritos
              </span>
              <button
                type="button"
                onClick={salvarFavoritoAtual}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.35rem 0.65rem', borderRadius: '8px', border: 'none',
                  background: 'rgba(251, 191, 36, 0.12)', color: '#fcd34d',
                  fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                }}
              >
                <Star size={13} weight="bold" />
                Salvar configuração atual
              </button>
            </div>
            {favoritos.length === 0 ? (
              <p style={{ margin: 0, fontSize: '0.775rem', color: '#64748b', lineHeight: 1.45 }}>
                Salve combinações de produto, ambiente, tipos e planos para reutilizar com um clique
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {favoritos.map((fav, indice) => {
                  const rotuloProduto = PRODUTOS.find(p => p.valor === fav.produto)?.rotulo ?? fav.produto
                  const catalogoFav = fav.produto === dadosManual.produto ? planosDisponiveis : undefined
                  const planosCard = planosExibicaoFavorito(fav, catalogoFav)
                  return (
                    <div
                      key={`${fav.produto}-${fav.ambiente}-${indice}`}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                        padding: '0.65rem 0.75rem', borderRadius: '8px',
                        background: 'rgba(15, 23, 42, 0.35)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => aplicarFavorito(fav)}
                        title="Aplicar esta configuração"
                        style={{
                          flex: 1, minWidth: 0, textAlign: 'left',
                          background: 'none', border: 'none', padding: 0,
                          cursor: 'pointer', lineHeight: 1.4,
                        }}
                      >
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem' }}>
                          {rotuloTesteFavoritoAdmin(fav, rotuloProduto)}
                        </div>
                        {planosCard.map((plano, idxPlano) => {
                          const tituloExibicao = tituloPlanoFavoritoExibicao(plano)
                          const badgeTipo = plano.tipo === 'EMT'
                            ? { bg: 'rgba(245, 158, 11, 0.15)', cor: '#fcd34d', borda: 'rgba(245, 158, 11, 0.35)' }
                            : plano.tipo === 'E2E'
                              ? { bg: 'rgba(99, 102, 241, 0.15)', cor: '#a5b4fc', borda: 'rgba(99, 102, 241, 0.35)' }
                              : plano.tipo
                                ? { bg: 'rgba(167, 139, 250, 0.15)', cor: '#c4b5fd', borda: 'rgba(167, 139, 250, 0.3)' }
                                : null
                          return (
                            <div
                              key={`${plano.id}-${idxPlano}`}
                              style={{ marginTop: idxPlano > 0 ? '0.5rem' : 0 }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                                {badgeTipo && plano.tipo && (
                                  <span style={{
                                    fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.06em',
                                    padding: '2px 5px', borderRadius: '3px',
                                    background: badgeTipo.bg, color: badgeTipo.cor,
                                    border: `1px solid ${badgeTipo.borda}`,
                                  }}>
                                    {plano.tipo}
                                  </span>
                                )}
                                <span style={{
                                  fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.04em',
                                  color: '#a5b4fc', textDecoration: 'underline', textUnderlineOffset: '2px',
                                }}>
                                  {plano.id}
                                </span>
                              </div>
                              {tituloExibicao ? (
                                <div style={estiloTituloPlano}>
                                  {tituloExibicao}
                                </div>
                              ) : null}
                              {plano.descricao ? (
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem', lineHeight: 1.45 }}>
                                  {plano.descricao}
                                </div>
                              ) : null}
                            </div>
                          )
                        })}
                      </button>
                      <button
                        type="button"
                        onClick={() => excluirFavorito(indice)}
                        title="Remover favorito"
                        style={{
                          flexShrink: 0, background: 'none', border: 'none', padding: '0.15rem',
                          color: '#94a3b8', cursor: 'pointer',
                        }}
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Banner de erro — exibido quando o backend recusa o disparo */}
          {erroExecucao && (
            <div style={{
              marginTop: 'auto',
              padding: '0.875rem 1rem',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              fontSize: '0.8rem',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              flexShrink: 0,
            }}>
              <div style={{ fontWeight: 800, color: '#ef4444', marginBottom: '0.4rem', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Falha ao disparar testes
              </div>
              {erroExecucao}
            </div>
          )}

          {/* Botão Executar — ancorado no rodapé do container */}
          <div style={{ marginTop: erroExecucao ? '0' : 'auto', paddingTop: '0.5rem', flexShrink: 0 }}>
            <button
              type="button"
              disabled={idsElegiveis.length === 0 || rodando}
              onClick={handleExecutar}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.875rem 2rem', borderRadius: '12px',
                background: idsElegiveis.length === 0 || rodando
                  ? 'rgba(16,185,129,0.3)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff', fontSize: '0.95rem', fontWeight: 700, border: 'none',
                cursor: idsElegiveis.length === 0 || rodando ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)',
                width: 'max-content', transition: 'transform 0.2s',
                opacity: idsElegiveis.length === 0 ? 0.5 : 1,
              }}
              onMouseEnter={(e) => { if (!rodando && idsElegiveis.length > 0) e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <Play size={20} weight="fill" />
              {rodando
                ? 'Iniciando...'
                : `Executar ${idsElegiveis.length} plano${idsElegiveis.length !== 1 ? 's' : ''}`
              }
            </button>
          </div>
        </div>
      )
    }
  ]

  return (
    <>
      <ModalFormularioAbasGlobal
        aberto={aberto}
        aoFechar={aoFechar}
        aoSalvar={() => { /* no-op — aba é de ação, botão próprio */ }}
        icone={<Play weight="fill" size={24} color="#10b981" />}
        titulo="Rodar Testes"
        subtitulo="Selecione o produto, o ambiente e os planos de teste a serem executados"
        tamanho="lg"
        altura="720px"
        abas={abas}
        semAbas={true}
      />

      <ModalDetalhePlanoTeste
        aberto={planoDetalhe !== null}
        plano={planoDetalhe}
        ambiente={dadosManual.ambiente as 'Local' | 'Staging' | 'Producao'}
        aoFechar={() => setPlanoDetalhe(null)}
      />
    </>
  )
}
