/**
 * BidFreteSimulator — simulador de marketing do BID Frete Internacional.
 * Mesmo padrão do PedidoSimulator: MenuLateralGlobal + header + abas
 * Insights / Lista / Dashboard / Kanban, tudo com dados mock do escopo.
 */

import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import {
  CaretLeft,
  ChartPieSlice,
  CurrencyDollar,
  Files,
  FileText,
  Gear,
  GlobeHemisphereWest,
  GraduationCap,
  Info,
  Kanban,
  ListBullets,
  MagnifyingGlass,
  Package,
  Sparkle,
  SquaresFour,
  Truck,
  X,
} from '@phosphor-icons/react'
import { getProdutoMeta } from '../../../Logo/produtos/src/LogoProdutoGlobal'
import { LogoBidFrete } from '../../../Logo/produtos/src/logos/LogoBidFrete'
import { MenuLateralGlobal } from '../../../Layout/menu-lateral-global/src/MenuLateralGlobal'
import type { ProductSwitcherItem } from '../../../Layout/menu-lateral-global/src/MenuLateralGlobal'
import { TooltipGlobal } from '../../../Feedback/tooltip-global/src/tooltip'
import { PERFIS_EMPRESA_SIMULADOR } from '../smart-doc/dados-cliente-maduro-simulador-smart-doc'
import { resolverEscopoWorkspacesPedidoSimulador } from '../pedido/pedido-escopo-workspaces-simulador'
import { NAV_ITENS_SIMULADOR_BID_FRETE } from './bid-frete-nav-simulador-marketing'
import { InsightsSimuladorBidFrete } from './insights-simulador-bid-frete'
import { ListaSimuladorBidFrete } from './lista-simulador-bid-frete'
import { DashboardSimuladorBidFrete } from './dashboard-simulador-bid-frete'
import { KanbanSimuladorBidFrete } from './kanban-simulador-bid-frete'
import { DropdownNovoSimuladorBidFrete } from './dropdown-novo-simulador-bid-frete'
import { ModalNovaCotacaoSimuladorBidFrete } from './modal-nova-cotacao-simulador-bid-frete'
import {
  montarPainelDemoCotacaoSimulador,
  PainelCotacaoSimuladorBidFrete,
  type DadosPainelCotacaoSimulador,
} from './painel-cotacao-simulador-bid-frete'
import type { CotacaoSimuladorBidFrete } from './dados-simulador-bid-frete'
import { STATUS_SIMULADOR_BID_FRETE } from './dados-simulador-bid-frete'
import './bid-frete-simulator.css'

type BotaoTopoDemoDesativadoProps = {
  tituloTooltip: string
  descricaoTooltip: string
  className: string
  ariaLabel: string
  children: ReactNode
}

function BotaoTopoDemoDesativado({
  tituloTooltip,
  descricaoTooltip,
  className,
  ariaLabel,
  children,
}: BotaoTopoDemoDesativadoProps) {
  return (
    <TooltipGlobal titulo={tituloTooltip} descricao={descricaoTooltip} posicaoPreferida="abaixo">
      <span className="pds-shell-acao-demo-wrap">
        <button
          type="button"
          className={`${className} pds-shell-acao-demo-desativada`}
          aria-label={ariaLabel}
          disabled
        >
          {children}
        </button>
      </span>
    </TooltipGlobal>
  )
}

type AbaVisualizacao = 'insights' | 'lista' | 'dashboard' | 'kanban'

const EMPRESAS = Object.values(PERFIS_EMPRESA_SIMULADOR)
type IdEmpresa = (typeof EMPRESAS)[number]['id']

const BID_FRETE_META = getProdutoMeta('bid-frete')

/** Mesmo catálogo do dropdown de produtos do simulador Smart Docs (troca é no-op na demo). */
const PRODUTOS_SWITCHER_DEMO: ProductSwitcherItem[] = [
  { slug: 'pedido', name: 'Pedido', color: '#d97706', icon: <Package size={14} weight="duotone" /> },
  { slug: 'bid-frete', name: 'Bid Frete Internacional', color: '#2563eb', icon: <Truck size={14} weight="duotone" /> },
  { slug: 'bid-cambio', name: 'Bid Cambio', color: '#0d9488', icon: <CurrencyDollar size={14} weight="duotone" /> },
  { slug: 'nf-import', name: 'NF Import', color: '#7c3aed', icon: <FileText size={14} weight="duotone" /> },
  { slug: 'smart-docs', name: 'Smart Docs', color: '#818cf8', icon: <Sparkle size={14} weight="fill" /> },
  {
    slug: 'processos',
    name: 'Processos',
    color: '#eab308',
    icon: <Files size={14} weight="duotone" />,
    kind: 'acao',
    sublabel: 'Visão unificada dos Produtos',
  },
]

const ABAS: { aba: AbaVisualizacao; label: string; icon: typeof ChartPieSlice }[] = [
  { aba: 'insights', label: 'Insights', icon: ChartPieSlice },
  { aba: 'lista', label: 'Lista', icon: ListBullets },
  { aba: 'dashboard', label: 'Dashboard', icon: SquaresFour },
  { aba: 'kanban', label: 'Kanban', icon: Kanban },
]

const SUBTITULO_ABA: Record<AbaVisualizacao, string | null> = {
  insights: null,
  lista: 'Cotações de frete internacional do escopo',
  dashboard: 'KPIs e gráficos da operação de frete',
  kanban: 'Cotações organizadas por status',
}

export function BidFreteSimulator({ onFecharSimulador }: { onFecharSimulador?: () => void }) {
  const [abaAtiva, setAbaAtiva] = useState<AbaVisualizacao>('insights')
  const [idsEmpresasEscopo, setIdsEmpresasEscopo] = useState<IdEmpresa[]>(() =>
    EMPRESAS.map((empresa) => empresa.id),
  )
  const [menuLateralContraida, setMenuLateralContraida] = useState(true)
  const [cotacaoFocoLista, setCotacaoFocoLista] = useState<string | null>(null)
  const [modalNovaCotacaoAberto, setModalNovaCotacaoAberto] = useState(false)
  const [cotacoesCriadas, setCotacoesCriadas] = useState<CotacaoSimuladorBidFrete[]>([])
  const [painelCotacao, setPainelCotacao] = useState<DadosPainelCotacaoSimulador | null>(null)
  /** Aba em que o usuário estava antes de abrir o painel da cotação. */
  const [abaRetornoPainel, setAbaRetornoPainel] = useState<AbaVisualizacao>('insights')
  /** Painéis das cotações criadas na demo, por número — link de acesso na Lista. */
  const [paineisCriados, setPaineisCriados] = useState<Record<string, DadosPainelCotacaoSimulador>>({})

  const empresasSelecionadas = useMemo(
    () => EMPRESAS.filter((empresa) => idsEmpresasEscopo.includes(empresa.id)),
    [idsEmpresasEscopo],
  )

  const escopoWorkspaces = useMemo(
    () => resolverEscopoWorkspacesPedidoSimulador(empresasSelecionadas),
    [empresasSelecionadas],
  )

  const workspaces = useMemo(
    () => EMPRESAS.map((empresa) => ({ id: empresa.id, name: empresa.nome, plan: empresa.plano })),
    [],
  )

  const tituloPagina = painelCotacao
    ? `Cotação ${painelCotacao.cotacao.numero}`
    : ABAS.find((item) => item.aba === abaAtiva)?.label ?? 'Insights'
  const IconePagina = painelCotacao
    ? FileText
    : ABAS.find((item) => item.aba === abaAtiva)?.icon ?? ChartPieSlice
  const subtituloPagina = painelCotacao
    ? 'Informações, propostas e ações da cotação'
    : SUBTITULO_ABA[abaAtiva]
  const statusPainelCotacao = painelCotacao
    ? STATUS_SIMULADOR_BID_FRETE[painelCotacao.cotacao.status]
    : null

  function voltarDoPainel() {
    const numero = painelCotacao?.cotacao.numero ?? null
    const destino = abaRetornoPainel
    setPainelCotacao(null)
    if (destino === 'lista') {
      setCotacaoFocoLista(numero)
    } else {
      setCotacaoFocoLista(null)
    }
    setAbaAtiva(destino)
  }

  function alternarEmpresaEscopo(id: IdEmpresa) {
    setIdsEmpresasEscopo((atual) => {
      if (atual.includes(id)) {
        if (atual.length === 1) return atual
        return atual.filter((item) => item !== id)
      }
      return [...atual, id]
    })
  }

  function abrirPainelCotacaoDemo(
    cotacao: CotacaoSimuladorBidFrete,
    retorno: AbaVisualizacao = abaAtiva,
  ) {
    setAbaRetornoPainel(retorno)
    const criado = paineisCriados[cotacao.numero]
    const demo = montarPainelDemoCotacaoSimulador(cotacao)
    const dados = criado
      ? {
          ...demo,
          ...criado,
          cotacao,
          fornecedoresConvidados: demo.fornecedoresConvidados,
        }
      : demo
    setPainelCotacao(dados)
  }

  return (
    <div className="pds-shell-wrap">
      {onFecharSimulador && (
        <button
          type="button"
          className="interactive-simulator-close"
          aria-label="Fechar demonstração"
          title="Fechar"
          onClick={(e) => {
            e.stopPropagation()
            onFecharSimulador()
          }}
        >
          <X size={20} weight="bold" />
        </button>
      )}

      <div className="sds-root pds-root bfs-root" onClick={(e) => e.stopPropagation()}>
        <MenuLateralGlobal
          moduleName="BID Frete"
          moduleColor={BID_FRETE_META.color}
          moduleIcon={<LogoBidFrete size={26} />}
          tenantName={escopoWorkspaces.tenantName}
          tenantPlan={escopoWorkspaces.tenantPlan}
          navItems={NAV_ITENS_SIMULADOR_BID_FRETE}
          produtos={PRODUTOS_SWITCHER_DEMO}
          produtoAtualSlug="bid-frete"
          onSwitchProduct={() => {
            /* demo: troca de produto indisponível */
          }}
          workspaces={workspaces}
          modoWorkspace="multiplo"
          workspacesEscopoIds={idsEmpresasEscopo}
          onAlternarWorkspaceEscopo={(id) => alternarEmpresaEscopo(id as IdEmpresa)}
          onDefinirEscopoWorkspaces={(ids) => setIdsEmpresasEscopo(ids as IdEmpresa[])}
          dropdownSearchPlaceholder="Buscar workspace…"
          dropdownCreateLabel="Criar workspace"
          dropdownManageLabel="Gerenciar workspace"
          isCollapsed={menuLateralContraida}
          onToggleCollapse={() => setMenuLateralContraida((v) => !v)}
        />

        <div className="sds-main">
          <div className="sds-main-header">
            <header className="sds-mtg-header" role="banner">
              <div className="sds-mtg-left">
                <div className={`sds-mtg-page-header${painelCotacao ? ' bfs-header-painel-cotacao' : ''}`}>
                  {painelCotacao ? (
                    <button
                      type="button"
                      className="bfs-header-voltar"
                      onClick={voltarDoPainel}
                      aria-label={
                        abaRetornoPainel === 'lista'
                          ? 'Voltar à Lista'
                          : abaRetornoPainel === 'insights'
                            ? 'Voltar aos Insights'
                            : `Voltar ao ${ABAS.find((item) => item.aba === abaRetornoPainel)?.label ?? 'início'}`
                      }
                    >
                      <CaretLeft size={15} weight="bold" />
                    </button>
                  ) : null}
                  <span className="sds-mtg-page-icon" aria-hidden="true">
                    <IconePagina size={22} weight="duotone" />
                  </span>
                  <div className="pds-mtg-titulo-grupo">
                    <span className="sds-mtg-page-title pds-mtg-page-title--solo">
                      {tituloPagina}
                      {statusPainelCotacao ? (
                        <span
                          className="bfs-header-status-pill"
                          style={{ '--pill-cor': statusPainelCotacao.cor } as CSSProperties}
                        >
                          {statusPainelCotacao.rotulo}
                        </span>
                      ) : null}
                    </span>
                    {subtituloPagina ? (
                      <span className="pds-mtg-page-subtitulo">{subtituloPagina}</span>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="sds-mtg-right">
                <BotaoTopoDemoDesativado
                  className="sds-mtg-nav-btn"
                  ariaLabel="Hub (preview — indisponível na demonstração)"
                  tituloTooltip="Hub"
                  descricaoTooltip="Volta ao hub central de módulos e workspaces — recurso do tenant completo"
                >
                  <GlobeHemisphereWest size={12} weight="duotone" />
                  Hub
                </BotaoTopoDemoDesativado>
                <BotaoTopoDemoDesativado
                  className="sds-mtg-icon-btn"
                  ariaLabel="Buscar na tela (preview — indisponível na demonstração)"
                  tituloTooltip="Buscar na tela"
                  descricaoTooltip="Localiza cotações, campos e ações na visualização atual do produto"
                >
                  <MagnifyingGlass size={15} />
                </BotaoTopoDemoDesativado>
                <BotaoTopoDemoDesativado
                  className="sds-mtg-icon-btn"
                  ariaLabel="Gravity University (preview — indisponível na demonstração)"
                  tituloTooltip="Gravity University"
                  descricaoTooltip="Tutoriais e manuais do BID Frete no contexto da tela em que você está"
                >
                  <GraduationCap size={15} weight="duotone" />
                </BotaoTopoDemoDesativado>
                <BotaoTopoDemoDesativado
                  className="sds-mtg-icon-btn"
                  ariaLabel="Dicas (preview — indisponível na demonstração)"
                  tituloTooltip="Dicas do produto"
                  descricaoTooltip="Orientações contextuais da Gabi e atalhos do módulo no tenant completo"
                >
                  <Info size={15} weight="fill" style={{ color: BID_FRETE_META.color }} />
                </BotaoTopoDemoDesativado>
                <BotaoTopoDemoDesativado
                  className="sds-mtg-lang-btn"
                  ariaLabel="Idioma (preview — indisponível na demonstração)"
                  tituloTooltip="Idioma"
                  descricaoTooltip="Alterna português, inglês e espanhol em toda a interface do Gravity"
                >
                  BR
                </BotaoTopoDemoDesativado>
                <BotaoTopoDemoDesativado
                  className="sds-mtg-icon-btn"
                  ariaLabel="Configurações do topo (preview — indisponível na demonstração)"
                  tituloTooltip="Configurações rápidas"
                  descricaoTooltip="Atalho às preferências do BID Frete — indisponível nesta demonstração"
                >
                  <Gear size={15} weight="duotone" />
                </BotaoTopoDemoDesativado>
                <div className="sds-mtg-sep" aria-hidden="true" />
                <div className="sds-mtg-avatar" aria-hidden="true">
                  D
                </div>
              </div>
            </header>

            {!painelCotacao && (
            <div className="smart-read-vis-toolbar">
              <nav className="srt-tabs" aria-label="Modo de visualização do BID Frete" role="tablist">
                {ABAS.map(({ aba, label, icon: Icone }) => (
                  <button
                    key={aba}
                    type="button"
                    role="tab"
                    aria-selected={abaAtiva === aba}
                    className={`srt-tab${abaAtiva === aba ? ' srt-tab--active' : ''}`}
                    onClick={() => setAbaAtiva(aba)}
                  >
                    <Icone weight="duotone" size={14} />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>
              {abaAtiva !== 'lista' && (
                <div className="bfs-toolbar-nova">
                  <DropdownNovoSimuladorBidFrete
                    alinharMenuDireita
                    onAbrirNovaCotacaoManual={() => setModalNovaCotacaoAberto(true)}
                  />
                </div>
              )}
            </div>
            )}
          </div>

          <div className="sds-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            {painelCotacao ? (
              <PainelCotacaoSimuladorBidFrete
                key={painelCotacao.cotacao.numero}
                dados={painelCotacao}
                onAtualizarDados={(dadosAtualizados) => {
                  setPainelCotacao(dadosAtualizados)
                  setPaineisCriados((atual) => ({
                    ...atual,
                    [dadosAtualizados.cotacao.numero]: dadosAtualizados,
                  }))
                }}
                onAposAprovacao={() => {
                  setPainelCotacao(null)
                  setAbaAtiva('insights')
                }}
              />
            ) : abaAtiva === 'insights' ? (
              <InsightsSimuladorBidFrete
                empresasSelecionadas={empresasSelecionadas}
                onAbrirPainelCotacao={(cotacao) => abrirPainelCotacaoDemo(cotacao, 'insights')}
              />
            ) : abaAtiva === 'lista' ? (
              <ListaSimuladorBidFrete
                empresasSelecionadas={empresasSelecionadas}
                numeroCotacaoFoco={cotacaoFocoLista}
                onConsumirFoco={() => setCotacaoFocoLista(null)}
                cotacoesCriadas={cotacoesCriadas}
                onAbrirNovaCotacaoManual={() => setModalNovaCotacaoAberto(true)}
                onAbrirPainelCotacao={(cotacao) => abrirPainelCotacaoDemo(cotacao, 'lista')}
              />
            ) : abaAtiva === 'dashboard' ? (
              <DashboardSimuladorBidFrete empresasSelecionadas={empresasSelecionadas} />
            ) : (
              <KanbanSimuladorBidFrete
                empresasSelecionadas={empresasSelecionadas}
                onAbrirCotacaoCompleta={(numeroCotacao) => {
                  setCotacaoFocoLista(numeroCotacao)
                  setAbaAtiva('lista')
                }}
              />
            )}
          </div>
        </div>
      </div>

      <ModalNovaCotacaoSimuladorBidFrete
        aberto={modalNovaCotacaoAberto}
        empresaIdPadrao={empresasSelecionadas[0]?.id ?? EMPRESAS[0].id}
        onFechar={() => setModalNovaCotacaoAberto(false)}
        onCriarCotacao={(cotacao) => setCotacoesCriadas((atual) => [cotacao, ...atual])}
        onVerCotacao={(numeroCotacao) => {
          setPainelCotacao(null)
          setCotacaoFocoLista(numeroCotacao)
          setAbaAtiva('lista')
        }}
        onAbrirPainelCotacao={(dados) => {
          setAbaRetornoPainel(abaAtiva)
          setPainelCotacao(dados)
        }}
        onRegistrarPainelCotacao={(dados) => {
          setPaineisCriados((atual) => ({ ...atual, [dados.cotacao.numero]: dados }))
        }}
      />
    </div>
  )
}
