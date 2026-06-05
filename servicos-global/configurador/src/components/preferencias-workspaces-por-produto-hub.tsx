/**

 * Preferências de workspaces por produto no HUB (pré-entrada).

 * Todo produto contratado: editar escopo; default = todos os workspaces.

 * Pedido: persiste também na API do produto (menu lateral / lista).

 */



import React, { useCallback, useMemo, useState } from 'react'

import { Plus, PencilSimple, Check, X } from '@phosphor-icons/react'

import { SelectGlobal, type SelectOpcao } from '@nucleo/campo-select-global'

import { gravarEscopoHubProdutoLocal } from '../utils/escopo-workspaces-produto-hub'

import { escopoContemTodosWorkspaces, salvarEscopoWorkspacesHubPedido } from '../utils/pedido-escopo-hub'

import './preferencias-workspaces-por-produto-hub.css'



export interface WorkspaceResumoHub {

  id: string

  nome: string

  iniciais: string

  gradientFrom: string

  gradientTo: string

}



export interface ProdutoContratadoHubLinha {

  product_key: string

  nome: string

}



export interface PreferenciasWorkspacesPorProdutoHubProps {

  produtos: ProdutoContratadoHubLinha[]

  workspaces: WorkspaceResumoHub[]

  busca: string

  escoposPorProduto: Record<string, string[]>

  idOrganizacao: string | null

  idUsuario: string | null

  getToken: () => Promise<string | null>

  onEscopoProdutoChange: (productKey: string, ids: string[]) => void

  onNotificacao: (payload: { type: 'success' | 'error'; message: string }) => void

  getIconeProduto: (slug: string) => { icon: React.ReactElement; color: string; bg: string }

  podeCriarWorkspace: boolean

  onCriarWorkspace: () => void

  t: (key: string, fallback?: string) => string

}



export function PreferenciasWorkspacesPorProdutoHub({

  produtos,

  workspaces,

  busca,

  escoposPorProduto,

  idOrganizacao,

  idUsuario,

  getToken,

  onEscopoProdutoChange,

  onNotificacao,

  getIconeProduto,

  podeCriarWorkspace,

  onCriarWorkspace,

  t,

}: PreferenciasWorkspacesPorProdutoHubProps) {

  const [produtoEditando, setProdutoEditando] = useState<string | null>(null)

  const [salvandoProduto, setSalvandoProduto] = useState<string | null>(null)

  const [rascunho, setRascunho] = useState<string[]>([])



  const mapaWorkspaces = useMemo(

    () => new Map(workspaces.map(w => [w.id, w])),

    [workspaces],

  )



  const idsWorkspacesDisponiveis = useMemo(

    () => workspaces.map(ws => ws.id),

    [workspaces],

  )



  const opcoesWorkspaces = useMemo<SelectOpcao[]>(

    () => workspaces.map(ws => ({ valor: ws.id, rotulo: ws.nome })),

    [workspaces],

  )



  const termoBusca = busca.trim().toLowerCase()



  const produtosFiltrados = useMemo(() => {

    if (!termoBusca) return produtos

    return produtos.filter((prod) => {

      if (prod.nome.toLowerCase().includes(termoBusca)) return true

      const ids = escoposPorProduto[prod.product_key] ?? []

      return ids.some((id) => {

        const nome = mapaWorkspaces.get(id)?.nome ?? ''

        return nome.toLowerCase().includes(termoBusca)

      })

    })

  }, [produtos, termoBusca, escoposPorProduto, mapaWorkspaces])



  const resolverIdWorkspaceHeader = useCallback((): string | null => (

    (typeof sessionStorage !== 'undefined'

      ? sessionStorage.getItem('gravity_company_id')

      : null)

    ?? workspaces[0]?.id

    ?? null

  ), [workspaces])



  const persistirEscopo = useCallback(async (productKey: string, ids: string[]) => {

    if (!idOrganizacao || !idUsuario) return false

    setSalvandoProduto(productKey)

    try {

      if (productKey === 'pedido') {

        const token = await getToken()

        if (!token) throw new Error('no_token')

        const ok = await salvarEscopoWorkspacesHubPedido(token, {

          idOrganizacao,

          idUsuario,

          idWorkspace: resolverIdWorkspaceHeader() ?? ids[0] ?? null,

        }, ids)

        if (!ok) throw new Error('save_failed')

      }



      gravarEscopoHubProdutoLocal(idOrganizacao, productKey, ids)

      onEscopoProdutoChange(productKey, ids)

      onNotificacao({

        type: 'success',

        message: t('sw.ws_pref_salvo', 'Escopo atualizado'),

      })

      return true

    } catch {

      onNotificacao({

        type: 'error',

        message: t('sw.ws_pref_erro', 'Não foi possível salvar o escopo'),

      })

      return false

    } finally {

      setSalvandoProduto(null)

    }

  }, [

    getToken,

    idOrganizacao,

    idUsuario,

    onEscopoProdutoChange,

    onNotificacao,

    resolverIdWorkspaceHeader,

    t,

  ])



  const iniciarEdicao = useCallback((productKey: string, idsAtuais: string[]) => {

    setRascunho([...idsAtuais])

    setProdutoEditando(productKey)

  }, [])



  const cancelarEdicao = useCallback(() => {

    setProdutoEditando(null)

    setRascunho([])

  }, [])



  const confirmarEdicao = useCallback(async (productKey: string) => {

    const ids = rascunho.length > 0

      ? rascunho

      : idsWorkspacesDisponiveis

    const ok = await persistirEscopo(productKey, ids)

    if (ok) {

      setProdutoEditando(null)

      setRascunho([])

    }

  }, [persistirEscopo, rascunho, idsWorkspacesDisponiveis])



  const todosWorkspacesNoRascunho = useMemo(

    () => escopoContemTodosWorkspaces(rascunho, idsWorkspacesDisponiveis),

    [rascunho, idsWorkspacesDisponiveis],

  )



  const alternarSelecionarTodos = useCallback(() => {

    if (todosWorkspacesNoRascunho) {

      setRascunho([])

    } else {

      setRascunho([...idsWorkspacesDisponiveis])

    }

  }, [todosWorkspacesNoRascunho, idsWorkspacesDisponiveis])



  if (produtos.length === 0) {

    return (

      <p className="sw-ws-por-produto-vazio">

        {t('sw.ws_pref_sem_produtos', 'Nenhum produto ativo para configurar workspaces.')}

      </p>

    )

  }



  return (

    <div className="sw-ws-por-produto">

      {produtosFiltrados.length === 0 ? (

        <p className="sw-ws-por-produto-vazio">

          {t('sw.ws_pref_nenhum_resultado', 'Nenhum produto ou workspace corresponde à busca.')}

        </p>

      ) : null}



      {produtosFiltrados.map((prod) => {

        const iconData = getIconeProduto(prod.product_key)

        const idsSalvos = escoposPorProduto[prod.product_key] ?? idsWorkspacesDisponiveis

        const editando = produtoEditando === prod.product_key

        const idsExibicao = editando ? rascunho : idsSalvos

        const escopoTodos = escopoContemTodosWorkspaces(idsExibicao, idsWorkspacesDisponiveis)

        const qtd = idsExibicao.length

        const resumoEscopo = escopoTodos
          ? t('sw.ws_pref_todos', 'Todos os workspaces no escopo')
          : `${qtd} ${t('sw.ws_pref_resumo', 'workspace(s) no escopo')}`

        const salvando = salvandoProduto === prod.product_key



        return (

          <article

            key={prod.product_key}

            className="sw-ws-por-produto-linha"

            style={{ borderLeftColor: iconData.color }}

          >

            <div className="sw-ws-por-produto-cab">

              <span

                className="sw-ws-por-produto-icone"

                style={{ background: iconData.bg, color: iconData.color }}

              >

                {iconData.icon}

              </span>

              <div className="sw-ws-por-produto-titulos">

                <span className="sw-ws-por-produto-nome">{prod.nome}</span>

                <span className="sw-ws-por-produto-sub">{resumoEscopo}</span>

              </div>

              {!editando ? (

                <button

                  type="button"

                  className="sw-ws-por-produto-acao"

                  onClick={() => iniciarEdicao(prod.product_key, idsSalvos)}

                  disabled={workspaces.length === 0}

                >

                  <PencilSimple size={14} weight="bold" />

                  {t('sw.ws_pref_editar', 'Editar')}

                </button>

              ) : (

                <div className="sw-ws-por-produto-acoes-grupo">

                  <button

                    type="button"

                    className="sw-ws-por-produto-acao sw-ws-por-produto-acao--ghost"

                    onClick={cancelarEdicao}

                    disabled={salvando}

                  >

                    <X size={14} weight="bold" />

                    {t('sw.cancelar', 'Cancelar')}

                  </button>

                  <button

                    type="button"

                    className="sw-ws-por-produto-acao sw-ws-por-produto-acao--ok"

                    onClick={() => void confirmarEdicao(prod.product_key)}

                    disabled={salvando}

                  >

                    <Check size={14} weight="bold" />

                    {salvando ? t('sw.salvando', 'Salvando…') : t('sw.salvar', 'Salvar')}

                  </button>

                </div>

              )}

            </div>



            {editando ? (

              <div className="sw-ws-por-produto-editor">

                <SelectGlobal

                  multiplo

                  buscavel

                  opcoes={opcoesWorkspaces}

                  valores={rascunho}

                  aoMudarValores={(vals) => setRascunho(vals.map(String))}

                  placeholder={t('sw.ws_pref_placeholder_select', 'Selecione os workspaces')}

                  aria-label={t('sw.ws_pref_aria_select', `Workspaces no escopo de ${prod.nome}`)}

                  posicao="baixo"

                  conteudoToolbarDropdown={

                    workspaces.length > 1 ? (

                      <button

                        type="button"

                        className="sg-toolbar-dropdown__btn"

                        onClick={(e) => {

                          e.stopPropagation()

                          alternarSelecionarTodos()

                        }}

                        onMouseDown={(e) => e.stopPropagation()}

                      >

                        {todosWorkspacesNoRascunho

                          ? t('sw.ws_pref_desmarcar_tudo', 'Desmarcar tudo')

                          : t('sw.ws_pref_selecionar_tudo', 'Selecionar tudo')}

                      </button>

                    ) : undefined

                  }

                />

              </div>

            ) : (

              <div className="sw-ws-por-produto-chips" role="list">

                {escopoTodos ? (

                  <span className="sw-ws-por-produto-chip sw-ws-por-produto-chip--todos" role="listitem">

                    {t('sw.ws_pref_chip_todos', '✶ Todos os workspaces')}

                  </span>

                ) : (

                  idsExibicao.map((id) => {

                    const ws = mapaWorkspaces.get(id)

                    if (!ws) return null

                    return (

                      <span key={id} className="sw-ws-por-produto-chip" role="listitem">

                        <span

                          className="sw-ws-por-produto-chip-logo"

                          style={{

                            background: `linear-gradient(135deg, ${ws.gradientFrom} 0%, ${ws.gradientTo} 100%)`,

                          }}

                        >

                          {ws.iniciais}

                        </span>

                        <span className="sw-ws-por-produto-chip-nome">{ws.nome}</span>

                      </span>

                    )

                  })

                )}

              </div>

            )}

          </article>

        )

      })}



      {podeCriarWorkspace ? (

        <button type="button" className="sw-ws-por-produto-criar" onClick={onCriarWorkspace}>

          <Plus size={16} weight="bold" />

          {t('sw.criar_workspace', 'Criar workspace')}

        </button>

      ) : null}

    </div>

  )

}


