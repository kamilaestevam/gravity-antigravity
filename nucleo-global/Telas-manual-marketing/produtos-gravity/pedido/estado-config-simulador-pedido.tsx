import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { KanbanPreferenciasSimulador } from './dados-kanban-simulador-pedido'
import {
  CARDS_PADRAO_ATIVOS,
  CASAS_DECIMAIS_PADRAO,
  COLUNAS_PERSONALIZADAS_PADRAO,
  criarKanbanPrefsPadrao,
  SALDO_FORMULA_PADRAO,
  STATUS_PADRAO_SIMULADOR,
  type CardPeriodoSimulador,
  type CardPreferenciaSimulador,
  type CategoriaConfigSimuladorPedido,
  type ColunaPersonalizadaSimulador,
  type FormatoDataSimulador,
  type NumeracaoConfigSimulador,
  type StatusConfigSimulador,
  type TabelaConfigSimulador,
  type TemplatePdfSimulador,
  type TipoColunaPersonalizadaSimulador,
} from './catalogo-config-simulador-pedido'

export type EstadoConfigSimuladorPedido = {
  categoriaAtiva: CategoriaConfigSimuladorPedido
  cardsPeriodo: CardPeriodoSimulador
  cardsAtivos: CardPreferenciaSimulador[]
  tabela: TabelaConfigSimulador
  casasDecimais: Record<string, number>
  formatoData: FormatoDataSimulador
  colunasPersonalizadas: ColunaPersonalizadaSimulador[]
  saldoFormula: string
  status: StatusConfigSimulador[]
  kanbanColunasOcultas: string[]
  kanbanPrefs: KanbanPreferenciasSimulador
  numeracao: NumeracaoConfigSimulador
  templatesPdf: TemplatePdfSimulador[]
}

type ConfigSimuladorPedidoContextValue = {
  /** Preferências aplicadas — Lista, Kanban e Insights leem daqui */
  config: EstadoConfigSimuladorPedido
  /** Rascunho da tela Configurações — commit via salvarCategoria */
  rascunho: EstadoConfigSimuladorPedido
  salvandoCategoria: CategoriaConfigSimuladorPedido | null
  isDirtyCategoria: (categoria: CategoriaConfigSimuladorPedido) => boolean
  salvarCategoria: (categoria: CategoriaConfigSimuladorPedido) => Promise<void>
  setCategoriaAtiva: (cat: CategoriaConfigSimuladorPedido) => void
  setCardsPeriodo: (p: CardPeriodoSimulador) => void
  toggleCardAtivo: (id: string) => void
  adicionarCard: (id: string) => void
  removerCard: (id: string) => void
  reordenarCards: (ids: string[]) => void
  setTabela: (patch: Partial<TabelaConfigSimulador>) => void
  setCasaDecimal: (chave: string, valor: number) => void
  setFormatoData: (fmt: FormatoDataSimulador) => void
  adicionarColunaPersonalizada: (nome: string, tipo: TipoColunaPersonalizadaSimulador) => string
  removerColunaPersonalizada: (id: string) => void
  toggleVisibilidadeColunaPersonalizada: (id: string) => void
  reordenarColunasPersonalizadas: (ids: string[]) => void
  setSaldoFormula: (formula: string) => void
  adicionarStatus: (rotulo: string, cor: string) => void
  editarStatus: (id: string, rotulo: string, cor: string) => void
  removerStatus: (id: string) => void
  reordenarStatus: (ids: string[]) => void
  toggleKanbanColuna: (nomeStatus: string) => void
  setKanbanPrefs: (prefs: KanbanPreferenciasSimulador) => void
  toggleKanbanCardCampo: (campo: string) => void
  adicionarKanbanCardCampo: (campo: string, label: string) => void
  setKanbanDataCritica: (campo: string | null) => void
  toggleKanbanModalCampo: (aba: 'pedido' | 'quantidades' | 'datas', campo: string) => void
  adicionarKanbanModalCampo: (aba: 'pedido' | 'quantidades' | 'datas', campo: string, label: string) => void
  setNumeracao: (patch: Partial<NumeracaoConfigSimulador>) => void
  adicionarTemplatePdf: (nome: string) => void
  removerTemplatePdf: (id: string) => void
  restaurarPadrao: (categoria: CategoriaConfigSimuladorPedido) => void
  statusVisiveisKanban: StatusConfigSimulador[]
}

const NUMERACAO_PADRAO: NumeracaoConfigSimulador = {
  prefixo: 'PO-',
  incluirAno: true,
  digitosSequencia: 4,
  reiniciar: 'ano',
  automaticoCriar: true,
  automaticoDuplicar: true,
  automaticoConsolidar: true,
}

const ESTADO_INICIAL: EstadoConfigSimuladorPedido = {
  categoriaAtiva: 'cards',
  cardsPeriodo: '30d',
  cardsAtivos: CARDS_PADRAO_ATIVOS.map((c) => ({ ...c })),
  tabela: { linhasPorPagina: 100, destacarAtrasados: true },
  casasDecimais: { ...CASAS_DECIMAIS_PADRAO },
  formatoData: 'DD/MM/YYYY',
  colunasPersonalizadas: COLUNAS_PERSONALIZADAS_PADRAO.map((c) => ({ ...c })),
  saldoFormula: SALDO_FORMULA_PADRAO,
  status: STATUS_PADRAO_SIMULADOR.map((s) => ({ ...s })),
  kanbanColunasOcultas: [],
  kanbanPrefs: criarKanbanPrefsPadrao(),
  numeracao: { ...NUMERACAO_PADRAO },
  templatesPdf: [],
}

const ConfigSimuladorPedidoContext = createContext<ConfigSimuladorPedidoContextValue | null>(null)

const SALVAR_MINIMO_MS = 420

function clonarKanbanPrefs(prefs: KanbanPreferenciasSimulador): KanbanPreferenciasSimulador {
  return {
    card: {
      dataCritica: prefs.card.dataCritica,
      campos: prefs.card.campos.map((c) => ({ ...c })),
    },
    abas: prefs.abas.map((a) => ({
      aba: a.aba,
      campos: a.campos.map((c) => ({ ...c })),
    })),
  }
}

function clonarEstado(estado: EstadoConfigSimuladorPedido): EstadoConfigSimuladorPedido {
  return {
    ...estado,
    cardsAtivos: estado.cardsAtivos.map((c) => ({ ...c })),
    tabela: { ...estado.tabela },
    casasDecimais: { ...estado.casasDecimais },
    colunasPersonalizadas: estado.colunasPersonalizadas.map((c) => ({ ...c })),
    status: estado.status.map((s) => ({ ...s })),
    kanbanColunasOcultas: [...estado.kanbanColunasOcultas],
    kanbanPrefs: clonarKanbanPrefs(estado.kanbanPrefs),
    numeracao: { ...estado.numeracao },
    templatesPdf: estado.templatesPdf.map((t) => ({ ...t })),
  }
}

function criarEstadoInicial(): EstadoConfigSimuladorPedido {
  return clonarEstado(ESTADO_INICIAL)
}

function gerarId(prefixo: string): string {
  return `${prefixo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function calcStatusVisiveisKanban(estado: EstadoConfigSimuladorPedido): StatusConfigSimulador[] {
  return [...estado.status]
    .sort((a, b) => a.ordem - b.ordem)
    .filter((s) => !estado.kanbanColunasOcultas.includes(s.nome))
}

function mesmaListaCards(a: CardPreferenciaSimulador[], b: CardPreferenciaSimulador[]): boolean {
  if (a.length !== b.length) return false
  return a.every((item, i) => {
    const outro = b[i]
    return item.id === outro?.id && item.visivel === outro.visivel && item.ordem === outro.ordem
  })
}

function mesmasColunasPersonalizadas(a: ColunaPersonalizadaSimulador[], b: ColunaPersonalizadaSimulador[]): boolean {
  if (a.length !== b.length) return false
  return a.every((col, i) => {
    const outro = b[i]
    return (
      col.id === outro?.id
      && col.chave === outro.chave
      && col.nome === outro.nome
      && col.tipo === outro.tipo
      && col.visivel === outro.visivel
      && col.ordem === outro.ordem
    )
  })
}

function mesmosStatus(a: StatusConfigSimulador[], b: StatusConfigSimulador[]): boolean {
  if (a.length !== b.length) return false
  return a.every((st, i) => {
    const outro = b[i]
    return (
      st.id === outro?.id
      && st.nome === outro.nome
      && st.rotulo === outro.rotulo
      && st.cor === outro.cor
      && st.ordem === outro.ordem
      && st.is_sistema === outro.is_sistema
    )
  })
}

function isDirtyCategoriaEstado(
  aplicado: EstadoConfigSimuladorPedido,
  rascunho: EstadoConfigSimuladorPedido,
  categoria: CategoriaConfigSimuladorPedido,
): boolean {
  switch (categoria) {
    case 'cards':
      return (
        aplicado.cardsPeriodo !== rascunho.cardsPeriodo
        || !mesmaListaCards(aplicado.cardsAtivos, rascunho.cardsAtivos)
      )
    case 'tabela':
      return (
        aplicado.tabela.linhasPorPagina !== rascunho.tabela.linhasPorPagina
        || aplicado.tabela.destacarAtrasados !== rascunho.tabela.destacarAtrasados
      )
    case 'colunas-casas-decimais':
      return JSON.stringify(aplicado.casasDecimais) !== JSON.stringify(rascunho.casasDecimais)
    case 'colunas-formato-data':
      return aplicado.formatoData !== rascunho.formatoData
    case 'colunas-personalizadas':
      return !mesmasColunasPersonalizadas(aplicado.colunasPersonalizadas, rascunho.colunasPersonalizadas)
    case 'colunas-campos-calculados':
      return aplicado.saldoFormula !== rascunho.saldoFormula
    case 'kanban-colunas':
      return JSON.stringify(aplicado.kanbanColunasOcultas) !== JSON.stringify(rascunho.kanbanColunasOcultas)
    case 'kanban-card':
      return JSON.stringify(aplicado.kanbanPrefs.card) !== JSON.stringify(rascunho.kanbanPrefs.card)
    case 'kanban-modal':
      return JSON.stringify(aplicado.kanbanPrefs.abas) !== JSON.stringify(rascunho.kanbanPrefs.abas)
    case 'status':
      return !mesmosStatus(aplicado.status, rascunho.status)
    case 'numeracao':
      return JSON.stringify(aplicado.numeracao) !== JSON.stringify(rascunho.numeracao)
    case 'templates-pdf':
      return JSON.stringify(aplicado.templatesPdf) !== JSON.stringify(rascunho.templatesPdf)
    default:
      return false
  }
}

function aplicarRascunhoNaCategoria(
  aplicado: EstadoConfigSimuladorPedido,
  rascunho: EstadoConfigSimuladorPedido,
  categoria: CategoriaConfigSimuladorPedido,
): EstadoConfigSimuladorPedido {
  const next = clonarEstado(aplicado)
  switch (categoria) {
    case 'cards':
      next.cardsPeriodo = rascunho.cardsPeriodo
      next.cardsAtivos = rascunho.cardsAtivos.map((c) => ({ ...c }))
      break
    case 'tabela':
      next.tabela = { ...rascunho.tabela }
      break
    case 'colunas-casas-decimais':
      next.casasDecimais = { ...rascunho.casasDecimais }
      break
    case 'colunas-formato-data':
      next.formatoData = rascunho.formatoData
      break
    case 'colunas-personalizadas':
      next.colunasPersonalizadas = rascunho.colunasPersonalizadas.map((c) => ({ ...c }))
      break
    case 'colunas-campos-calculados':
      next.saldoFormula = rascunho.saldoFormula
      break
    case 'kanban-colunas':
      next.kanbanColunasOcultas = [...rascunho.kanbanColunasOcultas]
      break
    case 'kanban-card':
      next.kanbanPrefs = {
        ...next.kanbanPrefs,
        card: clonarKanbanPrefs(rascunho.kanbanPrefs).card,
      }
      break
    case 'kanban-modal':
      next.kanbanPrefs = {
        ...next.kanbanPrefs,
        abas: clonarKanbanPrefs(rascunho.kanbanPrefs).abas,
      }
      break
    case 'status':
      next.status = rascunho.status.map((s) => ({ ...s }))
      break
    case 'numeracao':
      next.numeracao = { ...rascunho.numeracao }
      break
    case 'templates-pdf':
      next.templatesPdf = rascunho.templatesPdf.map((t) => ({ ...t }))
      break
    default:
      break
  }
  return next
}

function restaurarPadraoRascunho(
  rascunho: EstadoConfigSimuladorPedido,
  categoria: CategoriaConfigSimuladorPedido,
): EstadoConfigSimuladorPedido {
  const next = clonarEstado(rascunho)
  switch (categoria) {
    case 'cards':
      next.cardsAtivos = CARDS_PADRAO_ATIVOS.map((c) => ({ ...c }))
      next.cardsPeriodo = '30d'
      break
    case 'tabela':
      next.tabela = { linhasPorPagina: 100, destacarAtrasados: true }
      break
    case 'colunas-casas-decimais':
      next.casasDecimais = { ...CASAS_DECIMAIS_PADRAO }
      break
    case 'colunas-formato-data':
      next.formatoData = 'DD/MM/YYYY'
      break
    case 'colunas-personalizadas':
      next.colunasPersonalizadas = COLUNAS_PERSONALIZADAS_PADRAO.map((c) => ({ ...c }))
      break
    case 'colunas-campos-calculados':
      next.saldoFormula = SALDO_FORMULA_PADRAO
      break
    case 'kanban-colunas':
      next.kanbanColunasOcultas = []
      break
    case 'kanban-card':
    case 'kanban-modal':
      next.kanbanPrefs = criarKanbanPrefsPadrao()
      break
    case 'status':
      next.status = STATUS_PADRAO_SIMULADOR.map((s) => ({ ...s }))
      break
    case 'numeracao':
      next.numeracao = { ...NUMERACAO_PADRAO }
      break
    case 'templates-pdf':
      next.templatesPdf = []
      break
    default:
      break
  }
  return next
}

export function ConfigSimuladorPedidoProvider({ children }: { children: ReactNode }) {
  const [aplicado, setAplicado] = useState<EstadoConfigSimuladorPedido>(criarEstadoInicial)
  const [rascunho, setRascunho] = useState<EstadoConfigSimuladorPedido>(criarEstadoInicial)
  const [salvandoCategoria, setSalvandoCategoria] = useState<CategoriaConfigSimuladorPedido | null>(null)

  const isDirtyCategoria = useCallback(
    (categoria: CategoriaConfigSimuladorPedido) => isDirtyCategoriaEstado(aplicado, rascunho, categoria),
    [aplicado, rascunho],
  )

  const salvarCategoria = useCallback(async (categoria: CategoriaConfigSimuladorPedido) => {
    if (!isDirtyCategoriaEstado(aplicado, rascunho, categoria)) return
    setSalvandoCategoria(categoria)
    const inicio = Date.now()
    try {
      setAplicado((prev) => aplicarRascunhoNaCategoria(prev, rascunho, categoria))
    } finally {
      const restante = SALVAR_MINIMO_MS - (Date.now() - inicio)
      if (restante > 0) {
        await new Promise((resolve) => setTimeout(resolve, restante))
      }
      setSalvandoCategoria(null)
    }
  }, [aplicado, rascunho])

  const setCategoriaAtiva = useCallback((categoriaAtiva: CategoriaConfigSimuladorPedido) => {
    setAplicado((prev) => ({ ...prev, categoriaAtiva }))
    setRascunho((prev) => ({ ...prev, categoriaAtiva }))
  }, [])

  const setCardsPeriodo = useCallback((cardsPeriodo: CardPeriodoSimulador) => {
    setRascunho((prev) => ({ ...prev, cardsPeriodo }))
  }, [])

  const toggleCardAtivo = useCallback((id: string) => {
    setRascunho((prev) => ({
      ...prev,
      cardsAtivos: prev.cardsAtivos.map((c) =>
        c.id === id ? { ...c, visivel: !c.visivel } : c,
      ),
    }))
  }, [])

  const adicionarCard = useCallback((id: string) => {
    setRascunho((prev) => {
      if (prev.cardsAtivos.some((c) => c.id === id)) return prev
      return {
        ...prev,
        cardsAtivos: [
          ...prev.cardsAtivos,
          { id, visivel: true, ordem: prev.cardsAtivos.length },
        ],
      }
    })
  }, [])

  const removerCard = useCallback((id: string) => {
    setRascunho((prev) => ({
      ...prev,
      cardsAtivos: prev.cardsAtivos.filter((c) => c.id !== id),
    }))
  }, [])

  const reordenarCards = useCallback((ids: string[]) => {
    setRascunho((prev) => ({
      ...prev,
      cardsAtivos: ids
        .map((id, ordem) => {
          const card = prev.cardsAtivos.find((c) => c.id === id)
          return card ? { ...card, ordem } : null
        })
        .filter((c): c is CardPreferenciaSimulador => c != null),
    }))
  }, [])

  const setTabela = useCallback((patch: Partial<TabelaConfigSimulador>) => {
    setRascunho((prev) => ({ ...prev, tabela: { ...prev.tabela, ...patch } }))
  }, [])

  const setCasaDecimal = useCallback((chave: string, valor: number) => {
    setRascunho((prev) => ({
      ...prev,
      casasDecimais: { ...prev.casasDecimais, [chave]: Math.max(0, Math.min(6, valor)) },
    }))
  }, [])

  const setFormatoData = useCallback((formatoData: FormatoDataSimulador) => {
    setRascunho((prev) => ({ ...prev, formatoData }))
  }, [])

  const adicionarColunaPersonalizada = useCallback((nome: string, tipo: TipoColunaPersonalizadaSimulador) => {
    const chave = nome.toLowerCase().replace(/\s+/g, '_').slice(0, 40)
    const colunaIdLista = `custom_${chave}`
    const inserir = (prev: EstadoConfigSimuladorPedido): EstadoConfigSimuladorPedido => ({
      ...prev,
      colunasPersonalizadas: [
        ...prev.colunasPersonalizadas,
        {
          id: gerarId('cp'),
          chave,
          nome: nome.toUpperCase(),
          tipo,
          visivel: true,
          ordem: prev.colunasPersonalizadas.length,
        },
      ],
    })
    setRascunho(inserir)
    setAplicado(inserir)
    return colunaIdLista
  }, [])

  const removerColunaPersonalizada = useCallback((id: string) => {
    setRascunho((prev) => ({
      ...prev,
      colunasPersonalizadas: prev.colunasPersonalizadas.filter((c) => c.id !== id),
    }))
  }, [])

  const toggleVisibilidadeColunaPersonalizada = useCallback((id: string) => {
    setRascunho((prev) => ({
      ...prev,
      colunasPersonalizadas: prev.colunasPersonalizadas.map((c) =>
        c.id === id ? { ...c, visivel: !c.visivel } : c,
      ),
    }))
  }, [])

  const reordenarColunasPersonalizadas = useCallback((ids: string[]) => {
    setRascunho((prev) => ({
      ...prev,
      colunasPersonalizadas: ids
        .map((id, ordem) => {
          const col = prev.colunasPersonalizadas.find((c) => c.id === id)
          return col ? { ...col, ordem } : null
        })
        .filter((c): c is ColunaPersonalizadaSimulador => c != null),
    }))
  }, [])

  const setSaldoFormula = useCallback((saldoFormula: string) => {
    setRascunho((prev) => ({ ...prev, saldoFormula }))
  }, [])

  const adicionarStatus = useCallback((rotulo: string, cor: string) => {
    const nome = rotulo.toLowerCase().replace(/\s+/g, '_')
    setRascunho((prev) => ({
      ...prev,
      status: [
        ...prev.status,
        {
          id: gerarId('st'),
          nome,
          rotulo,
          cor,
          ordem: prev.status.length,
          is_sistema: false,
        },
      ],
    }))
  }, [])

  const editarStatus = useCallback((id: string, rotulo: string, cor: string) => {
    setRascunho((prev) => ({
      ...prev,
      status: prev.status.map((s) =>
        s.id === id && !s.is_sistema ? { ...s, rotulo, cor, nome: rotulo.toLowerCase().replace(/\s+/g, '_') } : s,
      ),
    }))
  }, [])

  const removerStatus = useCallback((id: string) => {
    setRascunho((prev) => ({
      ...prev,
      status: prev.status.filter((s) => s.id !== id || s.is_sistema),
    }))
  }, [])

  const reordenarStatus = useCallback((ids: string[]) => {
    setRascunho((prev) => ({
      ...prev,
      status: ids
        .map((id, ordem) => {
          const st = prev.status.find((s) => s.id === id)
          return st ? { ...st, ordem } : null
        })
        .filter((s): s is StatusConfigSimulador => s != null),
    }))
  }, [])

  const toggleKanbanColuna = useCallback((nomeStatus: string) => {
    setRascunho((prev) => {
      const ocultas = prev.kanbanColunasOcultas.includes(nomeStatus)
        ? prev.kanbanColunasOcultas.filter((n) => n !== nomeStatus)
        : [...prev.kanbanColunasOcultas, nomeStatus]
      return { ...prev, kanbanColunasOcultas: ocultas }
    })
  }, [])

  const setKanbanPrefs = useCallback((kanbanPrefs: KanbanPreferenciasSimulador) => {
    setRascunho((prev) => ({ ...prev, kanbanPrefs: clonarKanbanPrefs(kanbanPrefs) }))
  }, [])

  const toggleKanbanCardCampo = useCallback((campo: string) => {
    setRascunho((prev) => ({
      ...prev,
      kanbanPrefs: {
        ...prev.kanbanPrefs,
        card: {
          ...prev.kanbanPrefs.card,
          campos: prev.kanbanPrefs.card.campos.map((c) =>
            c.campo === campo ? { ...c, visivel: !c.visivel } : c,
          ),
        },
      },
    }))
  }, [])

  const adicionarKanbanCardCampo = useCallback((campo: string, label: string) => {
    setRascunho((prev) => {
      if (prev.kanbanPrefs.card.campos.some((c) => c.campo === campo)) return prev
      return {
        ...prev,
        kanbanPrefs: {
          ...prev.kanbanPrefs,
          card: {
            ...prev.kanbanPrefs.card,
            campos: [
              ...prev.kanbanPrefs.card.campos,
              { campo, label, visivel: true, ordem: prev.kanbanPrefs.card.campos.length },
            ],
          },
        },
      }
    })
  }, [])

  const setKanbanDataCritica = useCallback((campo: string | null) => {
    setRascunho((prev) => ({
      ...prev,
      kanbanPrefs: {
        ...prev.kanbanPrefs,
        card: { ...prev.kanbanPrefs.card, dataCritica: campo },
      },
    }))
  }, [])

  const toggleKanbanModalCampo = useCallback(
    (aba: 'pedido' | 'quantidades' | 'datas', campo: string) => {
      setRascunho((prev) => ({
        ...prev,
        kanbanPrefs: {
          ...prev.kanbanPrefs,
          abas: prev.kanbanPrefs.abas.map((a) =>
            a.aba === aba
              ? {
                  ...a,
                  campos: a.campos.map((c) =>
                    c.campo === campo ? { ...c, visivel: !c.visivel } : c,
                  ),
                }
              : a,
          ),
        },
      }))
    },
    [],
  )

  const adicionarKanbanModalCampo = useCallback(
    (aba: 'pedido' | 'quantidades' | 'datas', campo: string, label: string) => {
      setRascunho((prev) => {
        const abaAtual = prev.kanbanPrefs.abas.find((a) => a.aba === aba)
        if (!abaAtual || abaAtual.campos.some((c) => c.campo === campo)) return prev
        return {
          ...prev,
          kanbanPrefs: {
            ...prev.kanbanPrefs,
            abas: prev.kanbanPrefs.abas.map((a) =>
              a.aba === aba
                ? {
                    ...a,
                    campos: [
                      ...a.campos,
                      { campo, label, visivel: true, ordem: a.campos.length },
                    ],
                  }
                : a,
            ),
          },
        }
      })
    },
    [],
  )

  const setNumeracao = useCallback((patch: Partial<NumeracaoConfigSimulador>) => {
    setRascunho((prev) => ({ ...prev, numeracao: { ...prev.numeracao, ...patch } }))
  }, [])

  const adicionarTemplatePdf = useCallback((nome: string) => {
    setRascunho((prev) => ({
      ...prev,
      templatesPdf: [
        ...prev.templatesPdf,
        {
          id: gerarId('tpl'),
          nome,
          conteudo: '{{numero_pedido}} — {{exportador}}',
          criadoEm: new Date().toISOString(),
        },
      ],
    }))
  }, [])

  const removerTemplatePdf = useCallback((id: string) => {
    setRascunho((prev) => ({
      ...prev,
      templatesPdf: prev.templatesPdf.filter((t) => t.id !== id),
    }))
  }, [])

  const restaurarPadrao = useCallback((categoria: CategoriaConfigSimuladorPedido) => {
    setRascunho((prev) => restaurarPadraoRascunho(prev, categoria))
  }, [])

  const statusVisiveisKanban = useMemo(
    () => calcStatusVisiveisKanban(aplicado),
    [aplicado],
  )

  const value = useMemo<ConfigSimuladorPedidoContextValue>(
    () => ({
      config: aplicado,
      rascunho,
      salvandoCategoria,
      isDirtyCategoria,
      salvarCategoria,
      setCategoriaAtiva,
      setCardsPeriodo,
      toggleCardAtivo,
      adicionarCard,
      removerCard,
      reordenarCards,
      setTabela,
      setCasaDecimal,
      setFormatoData,
      adicionarColunaPersonalizada,
      removerColunaPersonalizada,
      toggleVisibilidadeColunaPersonalizada,
      reordenarColunasPersonalizadas,
      setSaldoFormula,
      adicionarStatus,
      editarStatus,
      removerStatus,
      reordenarStatus,
      toggleKanbanColuna,
      setKanbanPrefs,
      toggleKanbanCardCampo,
      adicionarKanbanCardCampo,
      setKanbanDataCritica,
      toggleKanbanModalCampo,
      adicionarKanbanModalCampo,
      setNumeracao,
      adicionarTemplatePdf,
      removerTemplatePdf,
      restaurarPadrao,
      statusVisiveisKanban,
    }),
    [
      aplicado,
      rascunho,
      salvandoCategoria,
      isDirtyCategoria,
      salvarCategoria,
      setCategoriaAtiva,
      setCardsPeriodo,
      toggleCardAtivo,
      adicionarCard,
      removerCard,
      reordenarCards,
      setTabela,
      setCasaDecimal,
      setFormatoData,
      adicionarColunaPersonalizada,
      removerColunaPersonalizada,
      toggleVisibilidadeColunaPersonalizada,
      reordenarColunasPersonalizadas,
      setSaldoFormula,
      adicionarStatus,
      editarStatus,
      removerStatus,
      reordenarStatus,
      toggleKanbanColuna,
      setKanbanPrefs,
      toggleKanbanCardCampo,
      adicionarKanbanCardCampo,
      setKanbanDataCritica,
      toggleKanbanModalCampo,
      adicionarKanbanModalCampo,
      setNumeracao,
      adicionarTemplatePdf,
      removerTemplatePdf,
      restaurarPadrao,
      statusVisiveisKanban,
    ],
  )

  return (
    <ConfigSimuladorPedidoContext.Provider value={value}>
      {children}
    </ConfigSimuladorPedidoContext.Provider>
  )
}

export function useConfigSimuladorPedido(): ConfigSimuladorPedidoContextValue {
  const ctx = useContext(ConfigSimuladorPedidoContext)
  if (!ctx) {
    throw new Error('useConfigSimuladorPedido deve ser usado dentro de ConfigSimuladorPedidoProvider')
  }
  return ctx
}

export type { CategoriaConfigSimuladorPedido }
