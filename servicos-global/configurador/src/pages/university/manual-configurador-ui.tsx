import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Gear, Crown, Buildings, Users, Handshake, CreditCard, Receipt, Pulse,
  CurrencyCircleDollar, ClockCounterClockwise, ArrowsOut, CaretDown,
  UserPlus, IdentificationCard, ArrowRight, ShieldCheck, User, Key, Check,
  Package, Truck, ArrowDown, ArrowUp, EnvelopeSimple, Desktop,
  Eye, EyeSlash, PlusCircle, ArrowsOutLineVertical, PencilSimple, UploadSimple, ArrowsLeftRight, Sparkle,
  Plus, MinusCircle, Warning, FunnelSimple, CubeTransparent, TextT, Anchor,
  List, SquaresFour, ChartBar, ListChecks, Stack, Globe, ListBullets,
  ShieldStar, UserGear, Boat, Airplane, TruckTrailer, Warehouse, Bank, Factory,
  Circle, CheckCircle, CircleHalf, Prohibit,
  type Icon,
} from '@phosphor-icons/react'
import {
  HISTORICO_CATALOGO_SECOES,
  type HistoricoCatalogoSecao,
} from './manual-historico-catalogo'
import {
  type ConfiguradorManualSlug,
  type DocTooltipKpi,
  type DocColunaTabela,
  type DocFiguraAposParagrafo,
  type DocFluxo,
  type DocGaleriaTela,
  type DocGaleriaComparacaoTela,
  type DocChipConsolidarExemploId,
  type DocChipEdicaoMassaExemploId,
  type DocCalloutManual,
  type DocOrigemDados,
  type DocPassoVisual,
  type DocSecao,
  type DocTopicoImagemLateral,
  type DocWizardEtapa,
  metadadosConfiguradorPagina,
  montarItensSumarioManual,
  montarEntradasSumarioManual,
  montarArvoreSubitensSumario,
  type DocItemSumarioManual,
  type DocItemSumarioManualArvore,
  type DocEntradaSumarioManual,
  SCREENSHOT_HUB_ACESSO_CONFIGURADOR,
  SCREENSHOT_USUARIOS_PERMISSAO_COTAR_FRETE,
  SCREENSHOT_USUARIOS_PERMISSAO_MODAL,
  LINK_MANUAL_PERMISSOES,
  secaoConfiguradorPorSlug,
  contarPassosVisuais,
  rotuloPassoNoCapitulo,
  encontrarPassoPorNum,
} from './manual-configurador-conteudo'
import { MANUAL_ESPACO_PARAGRAFO_PX, MANUAL_ESPACO_PARAGRAFO_ACORDEAO_PX, MANUAL_ESPACO_APOS_CABECALHO_ACORDEAO_PX, MANUAL_ESPACO_ANTES_IMAGEM_ACORDEAO_PX, MANUAL_ESPACO_FRASE_IMAGEM_PX, MANUAL_ESPACO_IMAGEM_FRASE_PX, MANUAL_ESPACO_ANTES_INFOGRAFICO_ACORDEAO_PX, MANUAL_ACORDEON_CORPO_PADDING_LATERAL_PX, MANUAL_ACORDEON_SECAO_GAP_PX, MANUAL_ACORDEON_SUBTOPICO_BORDA_ESQUERDA, MANUAL_ACORDEON_SUBTOPICO_GAP_PX, MANUAL_ACORDEON_SUBTOPICO_MARGEM_TOPO_PX, MANUAL_ACORDEON_SUBTOPICO_PADDING_ESQUERDA_PX, MANUAL_ACORDEON_SUBTOPICO_RECUO_NIVEL_PX, MANUAL_SUMARIO_SUBTOPICO_GAP_ANINHADO_PX, MANUAL_SUMARIO_SUBTOPICO_GAP_PX, MANUAL_SUMARIO_SUBTOPICO_MARGEM_FILHO_PX, MANUAL_SUMARIO_SUBTOPICO_MARGEM_GRUPO_PX, MANUAL_SUMARIO_SUBTOPICO_RECUO_PX, MANUAL_RAIO_CHIP, MANUAL_ALINHAMENTO_CORPO, MANUAL_CORPO_TIPOGRAFIA, MANUAL_GRID_TEXTO_IMAGEM, manualMargemParagrafo, manualMargemParagrafoAntesCallout, manualMargemCalloutAposParagrafo, MANUAL_ESPACO_ENTRE_PASSOS_PX, MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX, MANUAL_ESPACO_APOS_LINHA_TITULO_GUIA_PX, MANUAL_ESPACO_GRADE_GALERIA_PX, MANUAL_ALTURA_LEGENDA_CHIP_GRADE_PX, MANUAL_ALTURA_LEGENDA_CHIP_EDICAO_MASSA_NIVEL_PX, MANUAL_ALTURA_LEGENDA_CHIP_EDICAO_MASSA_CAMPO_PX } from './manual-tipografia'
import {
  type ManualEstadoLeitura,
  idSecaoManual,
  idPassoManual,
  idsPassosFluxo,
  extrairSlugManualDaRota,
  carregarLidosManual,
  salvarLidosManual,
  calcularEstadoLeitura,
  calcularEstadoCapitulo,
  montarIdsRastreaveisLeituraManual,
  contarLidosManual,
  percentualLeituraManual,
  abrirCadeiaPassoManual,
} from './manual-leitura-progresso'
import { ManualInfograficoHubTelas } from './manual-hub-infografico'
import { ManualInfograficoPedidoVisaoGeral } from './manual-pedido-infografico-visao-geral'
import {
  blocoInsightPedidoPorNum,
  CardBlocoInsightPedido,
  ManualInfograficoPedidoInsights,
} from './manual-pedido-infografico-insights'
import { ManualInfograficoBidFreteInsights } from './manual-bid-frete-infografico-insights'
import { ManualInfograficoPedidoListaCustomizacao } from './manual-pedido-infografico-lista-customizacao'
import { ManualInfograficoPedidoConfiguracoesColunasAdaptacao } from './manual-pedido-infografico-configuracoes-colunas-adaptacao'
import { ManualInfograficoPedidoConfiguracoesStatusAdaptacao } from './manual-pedido-infografico-configuracoes-status-adaptacao'
import {
  ManualInfograficoBidFreteMapa,
  ManualPilaresMapaBidFreteChips,
  type ManualPilarMapaBidFreteId,
} from './manual-bid-frete-infografico-mapa'
import {
  ManualInfograficoBidFretePainelCotacao,
  ManualPilaresPainelCotacaoBidFreteChips,
  type ManualPilarPainelCotacaoBidFreteId,
} from './manual-bid-frete-infografico-painel-cotacao'
import {
  ManualInfograficoBidFreteAbasPainelCotacao,
  ManualPilaresAbasPainelCotacaoBidFreteChips,
  type ManualPilarAbasPainelCotacaoBidFreteId,
} from './manual-bid-frete-infografico-abas-painel-cotacao'
import {
  ManualInfograficoBidFreteFiltrosMapa,
  ManualPilaresFiltrosMapaBidFreteChips,
  type ManualPilarFiltrosMapaBidFreteId,
} from './manual-bid-frete-infografico-filtros-mapa'
import {
  ManualInfograficoBidFreteControlesMapa,
  ManualPilaresControlesMapaBidFreteChips,
  type ManualPilarControlesMapaBidFreteId,
} from './manual-bid-frete-infografico-controles-mapa'
import {
  ManualInfograficoPedidoMapa,
  ManualPilaresMapaPedidoChips,
  type ManualPilarMapaPedidoId,
} from './manual-pedido-infografico-mapa'
import {
  ManualInfograficoPedidoRankingsMapa,
  ManualPilaresRankingsMapaPedidoChips,
  type ManualPilarRankingsMapaPedidoId,
} from './manual-pedido-infografico-rankings-mapa'
import {
  ManualInfograficoPedidoControlesMapa,
  ManualPilaresControlesMapaPedidoChips,
  type ManualPilarControlesMapaPedidoId,
} from './manual-pedido-infografico-controles-mapa'
import {
  ManualInfograficoPedidoFiltrosMapa,
  ManualPilaresFiltrosMapaPedidoChips,
  type ManualPilarFiltrosMapaPedidoId,
} from './manual-pedido-infografico-filtros-mapa'
import { ManualPedidoSimuladorFiltrosMapa } from './manual-pedido-simulador-filtros-mapa'
import { ManualPedidoSimuladorListaArrastarColunas } from './manual-pedido-simulador-lista-arrastar-colunas'
import { ManualInfograficoPedidoCatalogoColunasLista } from './manual-pedido-infografico-catalogo-colunas-lista'
import { ManualPedidoTabelaCatalogoColunasLista, ManualPedidoTabelaCatalogoColunasEdicaoMassa } from './manual-pedido-accordion-colunas-lista'
import { ManualInfograficoPedidoListaAlertas } from './manual-pedido-infografico-lista-alertas'
import { ManualInfograficoPedidoListaImportarFormas } from './manual-pedido-infografico-lista-importar-formas'
import { ManualInfograficoPedidoListaTransferirFluxo } from './manual-pedido-infografico-lista-transferir-fluxo'
import { ManualInfograficoBidFreteNovaCotacaoFluxo } from './manual-bid-frete-infografico-nova-cotacao-fluxo'
import { ManualInfograficoBidFreteCotacaoAvulsaFormas } from './manual-bid-frete-infografico-cotacao-avulsa-formas'
import { ManualInfograficoBidFreteCotacaoAvulsaVsBid } from './manual-bid-frete-infografico-cotacao-avulsa-vs-bid'
import { ManualInfograficoBidFreteBidPacoteCotacoes } from './manual-bid-frete-infografico-bid-pacote-cotacoes'
import { ManualBidFreteBarraEscopo, ManualBidFreteIconesEscopo, ManualBidFreteInfograficoLegendaEscopoIcones } from './manual-bid-frete-escopo-aplicacao'
import type { ManualBidFreteEscopoConfig } from './manual-bid-frete-escopo-aplicacao'
import { ManualInfograficoBidFreteNovaCotacaoResultadoEsperado } from './manual-bid-frete-infografico-nova-cotacao-resultado-esperado'
import { ManualInfograficoBidFreteModalOperacaoCampos } from './manual-bid-frete-infografico-modal-operacao-campos'
import { ManualBidFreteSimuladorModalOperacao } from './manual-bid-frete-simulador-modal-operacao'
import { ManualBidFreteSimuladorPainelInsights } from './manual-bid-frete-simulador-painel-insights'
import { ManualBidFreteSimuladorOrigemDestino } from './manual-bid-frete-simulador-origem-destino'
import { ManualInfograficoBidFreteOrigemDestinoCampos } from './manual-bid-frete-infografico-origem-destino-campos'
import {
  ManualInfograficoBotaoInline,
  ManualInfograficoIconeAbrirCotacaoListaBidFreteInline,
  ManualInfograficoIconeControleMapaBidFreteInline,
  ManualInfograficoIconeControleMapaPedidoInline,
  ManualInfograficoPinMapaPedidoInline,
  isIconeControleMapaBidFrete,
  isIconeControleMapaPedido,
} from './manual-infografico-rich-text'
import { ManualInfograficoPedidoListaTransferirResultadoEsperado } from './manual-pedido-infografico-lista-transferir-resultado-esperado'
import { ManualInfograficoPedidoListaConsolidarPasso2Regras } from './manual-pedido-infografico-lista-consolidar-passo2-regras'
import { ManualInfograficoPedidoListaConsolidarResultadoEsperado } from './manual-pedido-infografico-lista-consolidar-resultado-esperado'
import { ManualInfograficoPedidoListaEdicaoMassaPasso1Regras } from './manual-pedido-infografico-lista-edicao-massa-passo1-regras'
import { ManualInfograficoPedidoListaEdicaoMassaPasso2Regras } from './manual-pedido-infografico-lista-edicao-massa-passo2-regras'
import { ManualInfograficoPedidoListaEdicaoMassaResultadoEsperado } from './manual-pedido-infografico-lista-edicao-massa-resultado-esperado'
import { ManualInfograficoPedidoListaImportarMapeamentoColunas } from './manual-pedido-infografico-mapeamento-importar-colunas'
import { ManualPedidoTabelaAlertasLista } from './manual-pedido-tabela-alertas-lista'
import { ManualPedidoAccordionDashboardSugestoes } from './manual-pedido-accordion-dashboard-sugestoes'
import { ManualPedidoAccordionDashboardTiposVisualizacao } from './manual-pedido-accordion-dashboard-tipos-visualizacao'
import { ManualPedidoCatalogoHistoricoEventos } from './manual-pedido-accordion-historico-eventos'
import { ManualPedidoIndicadoresMoverDashboard } from './manual-pedido-indicadores-mover-dashboard'
import { ManualPedidoCardsKanbanCabecalho } from './manual-pedido-cards-kanban-cabecalho'
import { ManualPedidoFormatosExportacaoLista } from './manual-pedido-formatos-exportacao-lista'
import { ManualPedidoFormatosImportacaoLista } from './manual-pedido-formatos-importacao-lista'
import { ManualPedidoCaminhosImportacaoPlanilha } from './manual-pedido-caminhos-importacao-planilha'
import { ManualInfograficoSmartDocsDocumentos } from './manual-smart-read-infografico-documentos'
import { ManualInfograficoSmartDocsInsights } from './manual-smart-read-infografico-insights'
import { ManualInfograficoSmartDocsListaCustomizacao } from './manual-smart-read-infografico-lista-customizacao'
import { ManualInfograficoSmartDocsListaPaineis } from './manual-smart-read-infografico-lista-paineis'
import { ManualInfograficoListaLeituraSmartReadIntegracaoApiCockpit } from './manual-lista-leitura-smart-read-infografico-integracao-api-cockpit'
import { ManualSmartReadTabelaCatalogoColunasLista } from './manual-smart-read-tabela-colunas-lista'
import { ManualInfograficoMenuLateral } from './manual-navegacao-infografico'
import { ManualInfograficoIconesMenuSuperior } from './manual-navegacao-icones-menu'
import { ManualInfograficoMapaNavegacaoGravity } from './manual-navegacao-mapa-gravity'
import { DOC_API_COCKPIT_SECAO } from './manual-api-cockpit-conteudo'

const MANUAL_TITULO_COR = 'var(--ws-text,#f1f5f9)'
const MANUAL_CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

const MANUAL_TIPO = {
  titulo: MANUAL_TITULO_COR,
  corpo: MANUAL_CORPO_70,
  secundario: 'var(--ws-muted,#c8d1dc)',
  meta: 'var(--ws-muted,#94a3b8)',
} as const

const MANUAL_ESTILO_PASSO_ROTULO: React.CSSProperties = {
  fontSize: '12px', fontWeight: 700, letterSpacing: '.08em', color: '#818cf8',
  textTransform: 'uppercase', margin: '0 0 8px',
}

const MANUAL_ESTILO_PASSO_TITULO: React.CSSProperties = {
  fontWeight: 700, fontSize: '.92rem', color: MANUAL_TITULO_COR, margin: `0 0 ${MANUAL_ESPACO_PARAGRAFO_PX}px`,
}

const MANUAL_ESTILO_CORPO: React.CSSProperties = {
  ...MANUAL_CORPO_TIPOGRAFIA,
  color: MANUAL_CORPO_70,
}

const MANUAL_LINK_STYLE: React.CSSProperties = {
  color: '#818cf8',
  textDecoration: 'none',
}

type ManualPilarCustomizacaoId = '01' | '02' | '03' | '04'

const MANUAL_PILARES_CUSTOMIZACAO: Record<
  ManualPilarCustomizacaoId,
  { icone: Icon; cor: string; borda: string; fundo: string }
> = {
  '01': { icone: EyeSlash, cor: '#f87171', borda: 'rgba(248,113,113,.32)', fundo: 'rgba(239,68,68,.08)' },
  '02': { icone: Eye, cor: '#34d399', borda: 'rgba(52,211,153,.32)', fundo: 'rgba(52,211,153,.08)' },
  '03': { icone: ArrowsOutLineVertical, cor: '#60a5fa', borda: 'rgba(96,165,250,.32)', fundo: 'rgba(96,165,250,.08)' },
  '04': { icone: PlusCircle, cor: '#a78bfa', borda: 'rgba(167,139,250,.32)', fundo: 'rgba(139,92,246,.08)' },
}

function ManualPilaresCustomizacaoChips({ pilares }: { pilares: ManualPilarCustomizacaoId[] }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 6,
        flexShrink: 0,
        paddingTop: 2,
      }}
      aria-label={`Passos ${pilares.join(' e ')} do infográfico de customização`}
    >
      {pilares.map((num) => {
        const pilar = MANUAL_PILARES_CUSTOMIZACAO[num]
        const Icone = pilar.icone
        return (
          <div
            key={num}
            title={`Passo ${num}`}
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              border: `1px solid ${pilar.borda}`,
              background: pilar.fundo,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 800, color: pilar.cor, lineHeight: 1, letterSpacing: '.04em' }}>
              {num}
            </span>
            <Icone size={13} weight="duotone" color={pilar.cor} aria-hidden />
          </div>
        )
      })}
    </div>
  )
}

type ManualPilarImportarFormaId = '01' | '02' | '03' | '04'

const MANUAL_PILARES_IMPORTAR_FORMAS: Record<
  ManualPilarImportarFormaId,
  { icone: Icon; cor: string; borda: string; fundo: string }
> = {
  '01': { icone: UploadSimple, cor: '#34d399', borda: 'rgba(52,211,153,.32)', fundo: 'rgba(52,211,153,.08)' },
  '02': { icone: ArrowsLeftRight, cor: '#60a5fa', borda: 'rgba(96,165,250,.32)', fundo: 'rgba(96,165,250,.08)' },
  '03': { icone: Sparkle, cor: '#a78bfa', borda: 'rgba(167,139,250,.32)', fundo: 'rgba(139,92,246,.08)' },
  '04': { icone: PencilSimple, cor: '#fbbf24', borda: 'rgba(251,191,36,.32)', fundo: 'rgba(245,158,11,.1)' },
}

function ManualPilaresImportarFormasChips({ pilares }: { pilares: ManualPilarImportarFormaId[] }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 6,
        flexShrink: 0,
        paddingTop: 2,
      }}
      aria-label={`Passos ${pilares.join(' e ')} do infográfico de importação`}
    >
      {pilares.map((num) => {
        const pilar = MANUAL_PILARES_IMPORTAR_FORMAS[num]
        const Icone = pilar.icone
        return (
          <div
            key={num}
            title={`Passo ${num}`}
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              border: `1px solid ${pilar.borda}`,
              background: pilar.fundo,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 800, color: pilar.cor, lineHeight: 1, letterSpacing: '.04em' }}>
              {num}
            </span>
            <Icone size={13} weight="duotone" color={pilar.cor} aria-hidden />
          </div>
        )
      })}
    </div>
  )
}

const MANUAL_CHIPS_TRANSFERIR_TRES_TIPOS = [
  { id: 'novo', rotulo: 'Novo pedido', icone: Plus, cor: '#34d399', borda: 'rgba(52,211,153,.32)', fundo: 'rgba(52,211,153,.08)' },
  { id: 'existente', rotulo: 'Pedido existente', icone: Package, cor: '#60a5fa', borda: 'rgba(96,165,250,.32)', fundo: 'rgba(96,165,250,.08)' },
  { id: 'reducao', rotulo: 'Redução simples', icone: MinusCircle, cor: '#fbbf24', borda: 'rgba(251,191,36,.32)', fundo: 'rgba(245,158,11,.1)' },
] as const

type ManualChipTransferirTipoId = (typeof MANUAL_CHIPS_TRANSFERIR_TRES_TIPOS)[number]['id']

function ManualChipTransferirTipo({ id }: { id: ManualChipTransferirTipoId }) {
  const tipo = MANUAL_CHIPS_TRANSFERIR_TRES_TIPOS.find((item) => item.id === id)
  if (!tipo) return null
  const Icone = tipo.icone
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        fontSize: '.68rem',
        fontWeight: 800,
        color: tipo.cor,
        background: tipo.fundo,
        border: `1px solid ${tipo.borda}`,
        borderRadius: 999,
        padding: '4px 11px 4px 5px',
        letterSpacing: '.02em',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 24,
          height: 24,
          borderRadius: 7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: 'rgba(8,12,24,.4)',
          border: `1px solid ${tipo.borda}`,
        }}
        aria-hidden
      >
        <Icone size={16} weight="bold" color={tipo.cor} />
      </span>
      {tipo.rotulo}
    </span>
  )
}

/** Manual Pedido § Transferir — chips dos 3 destinos que compartilham o início comum (01–04). */
function ManualChipsTransferirTresTiposInicioComum({ compacto = false }: { compacto?: boolean }) {
  return (
    <div
      role="group"
      aria-label="Novo pedido, Pedido existente e Redução simples compartilham os passos 01 a 04"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: compacto ? 0 : 12,
        alignItems: 'center',
        flexShrink: 0,
      }}
    >
      {!compacto ? (
        <span style={{
          fontSize: '.62rem',
          fontWeight: 800,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          color: '#94a3b8',
          marginRight: 2,
        }}>
          Válido para
        </span>
      ) : null}
      {MANUAL_CHIPS_TRANSFERIR_TRES_TIPOS.map((tipo) => (
        <ManualChipTransferirTipo key={tipo.id} id={tipo.id} />
      ))}
    </div>
  )
}

const MANUAL_CHIPS_BID_FRETE_MODAL_TRANSPORTE = [
  { id: 'maritimo', rotulo: 'Marítimo', icone: Boat, cor: '#38bdf8', borda: 'rgba(56,189,248,.32)', fundo: 'rgba(56,189,248,.08)' },
  { id: 'aereo', rotulo: 'Aéreo', icone: Airplane, cor: '#a78bfa', borda: 'rgba(167,139,250,.32)', fundo: 'rgba(167,139,250,.1)' },
  { id: 'rodoviario', rotulo: 'Rodoviário', icone: TruckTrailer, cor: '#fbbf24', borda: 'rgba(251,191,36,.32)', fundo: 'rgba(245,158,11,.1)' },
] as const

type ManualChipBidFreteModalTransporteId = (typeof MANUAL_CHIPS_BID_FRETE_MODAL_TRANSPORTE)[number]['id']

function ManualChipBidFreteModalTransporte({ id }: { id: ManualChipBidFreteModalTransporteId }) {
  const tipo = MANUAL_CHIPS_BID_FRETE_MODAL_TRANSPORTE.find((item) => item.id === id)
  if (!tipo) return null
  const Icone = tipo.icone
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        fontSize: '.68rem',
        fontWeight: 800,
        color: tipo.cor,
        background: tipo.fundo,
        border: `1px solid ${tipo.borda}`,
        borderRadius: 999,
        padding: '4px 11px 4px 5px',
        letterSpacing: '.02em',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 24,
          height: 24,
          borderRadius: 7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: 'rgba(8,12,24,.4)',
          border: `1px solid ${tipo.borda}`,
        }}
        aria-hidden
      >
        <Icone size={16} weight="bold" color={tipo.cor} />
      </span>
      {tipo.rotulo}
    </span>
  )
}

function ManualChipBidFreteBidPilar() {
  return (
    <div
      title="BID"
      style={{
        width: 38,
        height: 38,
        borderRadius: 8,
        border: '1px solid rgba(129,140,248,.35)',
        background: 'rgba(99,102,241,.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      aria-hidden
    >
      <Stack size={18} weight="duotone" color="#818cf8" />
    </div>
  )
}

function ManualChipBidFreteTokenNaoUtilizado() {
  return (
    <div
      title="Token não usado"
      style={{
        width: 38,
        height: 38,
        borderRadius: 8,
        border: '1px solid rgba(148,163,184,.35)',
        background: 'rgba(148,163,184,.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      aria-hidden
    >
      <Key size={18} weight="duotone" color="#94a3b8" />
    </div>
  )
}

function ManualChipBidFreteTokenUtilizado() {
  return (
    <div
      title="Token usado"
      style={{
        width: 38,
        height: 38,
        borderRadius: 8,
        border: '1px solid rgba(251,191,36,.45)',
        background: 'rgba(251,191,36,.14)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
      }}
      aria-hidden
    >
      <Key size={18} weight="duotone" color="#fbbf24" />
      <Check
        size={10}
        weight="bold"
        color="#fbbf24"
        style={{ position: 'absolute', right: 4, bottom: 4 }}
      />
    </div>
  )
}

function ManualChipBidFreteFormaManualPilar() {
  return (
    <div
      title="Forma Manual"
      style={{
        width: 38,
        height: 38,
        borderRadius: 8,
        border: '1px solid rgba(52,211,153,.35)',
        background: 'rgba(52,211,153,.12)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        flexShrink: 0,
      }}
      aria-hidden
    >
      <span style={{
        fontSize: '12px',
        fontWeight: 800,
        color: '#6ee7b7',
        lineHeight: 1,
        letterSpacing: '.04em',
      }}>
        01
      </span>
      <PencilSimple size={13} weight="duotone" color="#6ee7b7" />
    </div>
  )
}

/** Manual BID Frete §7.01 — chips numerados dos três caminhos de acesso ao Painel da Cotação. */
const MANUAL_CHIP_ACESSO_PAINEL_COTACAO_ESTILO = {
  cor: '#60a5fa',
  borda: 'rgba(96,165,250,.35)',
  fundo: 'rgba(96,165,250,.1)',
} as const

function ManualChipAcessoPainelCotacaoNumero({ numero }: { numero: '01' | '2' | '3' }) {
  const { cor, borda, fundo } = MANUAL_CHIP_ACESSO_PAINEL_COTACAO_ESTILO
  return (
    <div
      title={`Acesso ${numero}`}
      style={{
        width: 38,
        height: 38,
        borderRadius: 8,
        border: `1px solid ${borda}`,
        background: fundo,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      aria-hidden
    >
      <span style={{
        fontSize: numero === '01' ? '12px' : '14px',
        fontWeight: 800,
        color: cor,
        lineHeight: 1,
        letterSpacing: '.04em',
      }}>
        {numero}
      </span>
    </div>
  )
}

function ManualChipAcessoPainelCotacaoIcone({
  titulo,
  icone: Icone,
}: {
  titulo: string
  icone: Icon
}) {
  const { cor, borda, fundo } = MANUAL_CHIP_ACESSO_PAINEL_COTACAO_ESTILO
  return (
    <div
      title={titulo}
      style={{
        width: 38,
        height: 38,
        borderRadius: 8,
        border: `1px solid ${borda}`,
        background: fundo,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      aria-hidden
    >
      <Icone size={18} weight="duotone" color={cor} />
    </div>
  )
}

type ManualChipAcessoPainelCotacaoId = 'mapa' | 'tooltip' | 'lista'

function ManualChipsAcessoPainelCotacao({ id }: { id: ManualChipAcessoPainelCotacaoId }) {
  if (id === 'mapa') {
    return (
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <ManualChipAcessoPainelCotacaoNumero numero="01" />
        <ManualChipAcessoPainelCotacaoIcone titulo="Visão Insights" icone={Globe} />
      </div>
    )
  }
  if (id === 'tooltip') {
    return (
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <ManualChipAcessoPainelCotacaoNumero numero="2" />
        <ManualChipAcessoPainelCotacaoIcone titulo="Tooltip do KPI" icone={ChartBar} />
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
      <ManualChipAcessoPainelCotacaoNumero numero="3" />
      <ManualChipAcessoPainelCotacaoIcone titulo="Lista" icone={ListBullets} />
    </div>
  )
}

function ManualChipsBidFreteModalTransporteInicioComum({ compacto = false }: { compacto?: boolean }) {
  return (
    <div
      role="group"
      aria-label="Marítimo, Aéreo e Rodoviário compartilham os passos iniciais da nova cotação manual"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: compacto ? 0 : 12,
        alignItems: 'center',
        flexShrink: 0,
      }}
    >
      {!compacto ? (
        <span style={{
          fontSize: '.62rem',
          fontWeight: 800,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          color: '#94a3b8',
          marginRight: 2,
        }}>
          Modais
        </span>
      ) : null}
      {MANUAL_CHIPS_BID_FRETE_MODAL_TRANSPORTE.map((tipo) => (
        <ManualChipBidFreteModalTransporte key={tipo.id} id={tipo.id} />
      ))}
    </div>
  )
}

function ManualValidoParaChipsBidFreteModalTransporte({ marginBottom = MANUAL_ESPACO_PARAGRAFO_PX }: { marginBottom?: number }) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '6px 8px',
      marginBottom,
      textAlign: 'left',
    }}>
      <span style={{
        fontSize: '.74rem',
        fontWeight: 600,
        color: 'color-mix(in srgb, var(--ws-text, #f1f5f9) 75%, transparent)',
        lineHeight: 1.4,
      }}>
        válido para
      </span>
      <ManualChipsBidFreteModalTransporteInicioComum compacto />
    </div>
  )
}

const MANUAL_CHIPS_BID_FRETE_TIPO_CARGA = [
  { id: 'fcl', rotulo: 'FCL', icone: Package, cor: '#34d399', borda: 'rgba(52,211,153,.32)', fundo: 'rgba(52,211,153,.08)' },
  { id: 'lcl', rotulo: 'LCL', icone: CubeTransparent, cor: '#60a5fa', borda: 'rgba(96,165,250,.32)', fundo: 'rgba(96,165,250,.08)' },
  { id: 'air_lcl_rodo', rotulo: 'Aéreo / LCL / Rodo', icone: Airplane, cor: '#f472b6', borda: 'rgba(244,114,182,.32)', fundo: 'rgba(244,114,182,.08)' },
] as const

type ManualChipBidFreteTipoCargaId = (typeof MANUAL_CHIPS_BID_FRETE_TIPO_CARGA)[number]['id']

function ManualChipBidFreteTipoCarga({ id }: { id: ManualChipBidFreteTipoCargaId }) {
  const tipo = MANUAL_CHIPS_BID_FRETE_TIPO_CARGA.find((item) => item.id === id)
  if (!tipo) return null
  const Icone = tipo.icone
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        fontSize: '.68rem',
        fontWeight: 800,
        color: tipo.cor,
        background: tipo.fundo,
        border: `1px solid ${tipo.borda}`,
        borderRadius: 999,
        padding: '4px 11px 4px 5px',
        letterSpacing: '.02em',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 24,
          height: 24,
          borderRadius: 7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: 'rgba(8,12,24,.4)',
          border: `1px solid ${tipo.borda}`,
        }}
        aria-hidden
      >
        <Icone size={16} weight="bold" color={tipo.cor} />
      </span>
      {tipo.rotulo}
    </span>
  )
}

function ManualChipsBidFreteTipoCargaInicioComum({ compacto = false }: { compacto?: boolean }) {
  return (
    <div
      role="group"
      aria-label="FCL, LCL e Aéreo LCL Rodo compartilham cubagem, Incoterm e valor alvo"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: compacto ? 0 : 12,
        alignItems: 'center',
        flexShrink: 0,
      }}
    >
      {!compacto ? (
        <span style={{
          fontSize: '.62rem',
          fontWeight: 800,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          color: '#94a3b8',
          marginRight: 2,
        }}>
          Carga
        </span>
      ) : null}
      {MANUAL_CHIPS_BID_FRETE_TIPO_CARGA.map((tipo) => (
        <ManualChipBidFreteTipoCarga key={tipo.id} id={tipo.id} />
      ))}
    </div>
  )
}

const MANUAL_CHIPS_CONSOLIDAR_EXEMPLO = [
  { id: 'filtro_origem', rotulo: 'Filtro origem', icone: FunnelSimple, cor: '#818cf8', borda: 'rgba(129,140,248,.32)', fundo: 'rgba(99,102,241,.1)' },
  { id: 'igual', rotulo: 'Igual', icone: CheckCircle, cor: '#34d399', borda: 'rgba(52,211,153,.32)', fundo: 'rgba(52,211,153,.08)' },
  { id: 'divergente', rotulo: 'Divergente', icone: Warning, cor: '#fbbf24', borda: 'rgba(251,191,36,.32)', fundo: 'rgba(245,158,11,.1)' },
  { id: 'vazio', rotulo: 'Vazio', icone: MinusCircle, cor: '#64748b', borda: 'rgba(100,116,139,.28)', fundo: 'rgba(71,85,105,.12)' },
  { id: 'proximo', rotulo: 'Próximo', icone: ArrowRight, cor: '#a5b4fc', borda: 'rgba(129,140,248,.28)', fundo: 'rgba(99,102,241,.08)' },
] as const satisfies ReadonlyArray<{
  id: DocChipConsolidarExemploId
  rotulo: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
}>

function ManualChipConsolidarExemplo({ id }: { id: DocChipConsolidarExemploId }) {
  const tipo = MANUAL_CHIPS_CONSOLIDAR_EXEMPLO.find((item) => item.id === id)
  if (!tipo) return null
  const Icone = tipo.icone
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        fontSize: '.68rem',
        fontWeight: 800,
        color: tipo.cor,
        background: tipo.fundo,
        border: `1px solid ${tipo.borda}`,
        borderRadius: 999,
        padding: '4px 11px 4px 5px',
        letterSpacing: '.02em',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 24,
          height: 24,
          borderRadius: 7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: 'rgba(8,12,24,.4)',
          border: `1px solid ${tipo.borda}`,
        }}
        aria-hidden
      >
        <Icone size={16} weight="bold" color={tipo.cor} />
      </span>
      {tipo.rotulo}
    </span>
  )
}

/** Manual Pedido § Consolidar — legenda compacta dos tipos ilustrados nos prints do passo 2. */
function ManualChipsConsolidarExemplosLegenda() {
  return (
    <div
      role="group"
      aria-label="Tipos de campo ilustrados na comparação"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: MANUAL_ESPACO_PARAGRAFO_PX,
        alignItems: 'center',
      }}
    >
      {MANUAL_CHIPS_CONSOLIDAR_EXEMPLO.map((tipo) => (
        <ManualChipConsolidarExemplo key={tipo.id} id={tipo.id} />
      ))}
    </div>
  )
}

const MANUAL_CHIPS_EDICAO_MASSA_EXEMPLO = [
  { id: 'nivel_pedido', rotulo: 'Pedido', icone: Package, cor: '#818cf8', borda: 'rgba(129,140,248,.32)', fundo: 'rgba(99,102,241,.1)' },
  { id: 'nivel_item', rotulo: 'Item', icone: ListChecks, cor: '#34d399', borda: 'rgba(52,211,153,.32)', fundo: 'rgba(52,211,153,.08)' },
  { id: 'nivel_combinado', rotulo: 'Combinado', icone: CubeTransparent, cor: '#94a3b8', borda: 'rgba(148,163,184,.28)', fundo: 'rgba(148,163,184,.1)' },
  { id: 'tipo_texto', rotulo: 'Texto', icone: TextT, cor: '#a5b4fc', borda: 'rgba(129,140,248,.28)', fundo: 'rgba(99,102,241,.08)' },
  { id: 'tipo_select', rotulo: 'Select', icone: CaretDown, cor: '#60a5fa', borda: 'rgba(96,165,250,.32)', fundo: 'rgba(96,165,250,.08)' },
  { id: 'adicionar_campo', rotulo: '+ Campo', icone: Plus, cor: '#34d399', borda: 'rgba(52,211,153,.32)', fundo: 'rgba(52,211,153,.08)' },
  { id: 'filtro_por_pedido', rotulo: 'Por pedido', icone: FunnelSimple, cor: '#818cf8', borda: 'rgba(129,140,248,.32)', fundo: 'rgba(99,102,241,.1)' },
  { id: 'filtro_todos', rotulo: 'Todos', icone: FunnelSimple, cor: '#94a3b8', borda: 'rgba(148,163,184,.28)', fundo: 'rgba(148,163,184,.1)' },
  { id: 'filtro_alterados', rotulo: 'Alterados', icone: CheckCircle, cor: '#fbbf24', borda: 'rgba(251,191,36,.32)', fundo: 'rgba(245,158,11,.1)' },
  { id: 'filtro_sem_efeito', rotulo: 'Sem efeito', icone: MinusCircle, cor: '#64748b', borda: 'rgba(100,116,139,.28)', fundo: 'rgba(71,85,105,.12)' },
] as const satisfies ReadonlyArray<{
  id: DocChipEdicaoMassaExemploId
  rotulo: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
}>

function ManualChipEdicaoMassaExemplo({ id }: { id: DocChipEdicaoMassaExemploId }) {
  const tipo = MANUAL_CHIPS_EDICAO_MASSA_EXEMPLO.find((item) => item.id === id)
  if (!tipo) return null
  const Icone = tipo.icone
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        fontSize: '.68rem',
        fontWeight: 800,
        color: tipo.cor,
        background: tipo.fundo,
        border: `1px solid ${tipo.borda}`,
        borderRadius: 999,
        padding: '4px 11px 4px 5px',
        letterSpacing: '.02em',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 24,
          height: 24,
          borderRadius: 7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: 'rgba(8,12,24,.4)',
          border: `1px solid ${tipo.borda}`,
        }}
        aria-hidden
      >
        <Icone size={16} weight="bold" color={tipo.cor} />
      </span>
      {tipo.rotulo}
    </span>
  )
}

function ManualGaleriaCabecalhoEtapaRamo({
  chip,
  tituloMarkdown,
  subtituloMarkdown,
  acoesDireita,
}: {
  chip?: React.ReactNode
  tituloMarkdown: string
  subtituloMarkdown?: string
  acoesDireita?: React.ReactNode
}) {
  const temSubtitulo = Boolean(subtituloMarkdown?.trim())
  return (
    <div style={{ marginBottom: MANUAL_ESPACO_PARAGRAFO_PX, textAlign: 'left' }}>
      <div style={{
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        flexWrap: 'nowrap',
      }}>
        {chip}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '8px 12px',
          }}>
            <div style={{ flex: '1 1 auto', minWidth: 0 }}>
              <p style={{
                fontSize: '14.5px',
                fontWeight: 700,
                color: '#818cf8',
                margin: 0,
                letterSpacing: '.04em',
                lineHeight: 1.35,
              }}>
                <ManualTextoRich texto={tituloMarkdown} />
              </p>
              {temSubtitulo ? (
                <div style={{ marginTop: 4 }}>
                  <ManualParagrafo texto={subtituloMarkdown!} marginBottom={0} />
                </div>
              ) : null}
            </div>
            {acoesDireita}
          </div>
        </div>
      </div>
    </div>
  )
}

function ManualGaleriaCabecalhoPasso({
  legendaPasso,
  textoCorpo,
  pilaresImportarFormas,
  pilaresCustomizacao,
  pilaresMapaBidFrete,
  pilaresPainelCotacaoBidFrete,
  pilaresFiltrosMapaBidFrete,
  pilaresAbasPainelCotacaoBidFrete,
  pilaresControlesMapaBidFrete,
  pilaresMapaPedido,
  pilaresRankingsMapaPedido,
  pilaresControlesMapaPedido,
  pilaresFiltrosMapaPedido,
}: {
  legendaPasso: string
  /** Subtítulo abaixo do título, na coluna ao lado do chip. */
  textoCorpo?: string
  pilaresImportarFormas?: ManualPilarImportarFormaId[]
  pilaresCustomizacao?: ManualPilarCustomizacaoId[]
  pilaresMapaBidFrete?: ManualPilarMapaBidFreteId[]
  pilaresPainelCotacaoBidFrete?: ManualPilarPainelCotacaoBidFreteId[]
  pilaresFiltrosMapaBidFrete?: ManualPilarFiltrosMapaBidFreteId[]
  pilaresAbasPainelCotacaoBidFrete?: ManualPilarAbasPainelCotacaoBidFreteId[]
  pilaresControlesMapaBidFrete?: ManualPilarControlesMapaBidFreteId[]
  pilaresMapaPedido?: ManualPilarMapaPedidoId[]
  pilaresRankingsMapaPedido?: ManualPilarRankingsMapaPedidoId[]
  pilaresControlesMapaPedido?: ManualPilarControlesMapaPedidoId[]
  pilaresFiltrosMapaPedido?: ManualPilarFiltrosMapaPedidoId[]
}) {
  const temTextoCorpo = Boolean(textoCorpo?.trim())
  return (
    <div style={{ marginBottom: MANUAL_ESPACO_ANTES_IMAGEM_ACORDEAO_PX }}>
      <div style={{
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        flexWrap: 'nowrap',
      }}>
        {pilaresImportarFormas?.length ? (
          <ManualPilaresImportarFormasChips pilares={pilaresImportarFormas} />
        ) : pilaresCustomizacao?.length ? (
          <ManualPilaresCustomizacaoChips pilares={pilaresCustomizacao} />
        ) : pilaresMapaBidFrete?.length ? (
          <ManualPilaresMapaBidFreteChips pilares={pilaresMapaBidFrete} />
        ) : pilaresPainelCotacaoBidFrete?.length ? (
          <ManualPilaresPainelCotacaoBidFreteChips pilares={pilaresPainelCotacaoBidFrete} />
        ) : pilaresFiltrosMapaBidFrete?.length ? (
          <ManualPilaresFiltrosMapaBidFreteChips pilares={pilaresFiltrosMapaBidFrete} />
        ) : pilaresAbasPainelCotacaoBidFrete?.length ? (
          <ManualPilaresAbasPainelCotacaoBidFreteChips pilares={pilaresAbasPainelCotacaoBidFrete} />
        ) : pilaresControlesMapaBidFrete?.length ? (
          <ManualPilaresControlesMapaBidFreteChips pilares={pilaresControlesMapaBidFrete} />
        ) : pilaresMapaPedido?.length ? (
          <ManualPilaresMapaPedidoChips pilares={pilaresMapaPedido} />
        ) : pilaresRankingsMapaPedido?.length ? (
          <ManualPilaresRankingsMapaPedidoChips pilares={pilaresRankingsMapaPedido} />
        ) : pilaresFiltrosMapaPedido?.length ? (
          <ManualPilaresFiltrosMapaPedidoChips pilares={pilaresFiltrosMapaPedido} />
        ) : pilaresControlesMapaPedido?.length ? (
          <ManualPilaresControlesMapaPedidoChips pilares={pilaresControlesMapaPedido} />
        ) : null}
        {legendaPasso.trim() || temTextoCorpo ? (
          <div style={{ flex: 1, minWidth: 0 }}>
            {legendaPasso.trim() ? (
              <ManualGaleriaTelaLegendaStep legenda={legendaPasso} alinhamento="left" />
            ) : null}
            {temTextoCorpo ? (
              <div style={{ marginTop: legendaPasso.trim() ? 4 : 0 }}>
                <ManualParagrafo texto={textoCorpo!} marginBottom={0} />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

const LINK_DOC_WORKSPACES = '/university-gravity/docs/configurador/workspaces'

const ManualScrollSecaoContext = createContext<((n: number) => void) | null>(null)

type ManualSubtopicosContextValue = {
  abertosPorPrefix: Record<string, number[]>
  toggle: (prefix: string, num: number) => void
  abrir: (prefix: string, num: number) => void
}

const ManualSubtopicosContext = createContext<ManualSubtopicosContextValue | null>(null)

/** Estado de acordeões de subtópicos — usado na Academy (fluxo_manual) sem o shell DocManualUmaSecao. */
export function ManualSubtopicosProvider({ children }: { children: React.ReactNode }) {
  const [subtopicosAbertos, setSubtopicosAbertos] = useState<Record<string, number[]>>({})
  const abrirSubtopico = useCallback((prefix: string, num: number) => {
    setSubtopicosAbertos(prev => {
      const atual = prev[prefix] ?? []
      if (atual.includes(num)) return prev
      return { ...prev, [prefix]: [...atual, num] }
    })
  }, [])
  const toggleSubtopico = useCallback((prefix: string, num: number) => {
    setSubtopicosAbertos(prev => {
      const atual = prev[prefix] ?? []
      return {
        ...prev,
        [prefix]: atual.includes(num) ? atual.filter(n => n !== num) : [...atual, num],
      }
    })
  }, [])
  const subtopicosCtx = useMemo<ManualSubtopicosContextValue>(() => ({
    abertosPorPrefix: subtopicosAbertos,
    toggle: toggleSubtopico,
    abrir: abrirSubtopico,
  }), [subtopicosAbertos, toggleSubtopico, abrirSubtopico])
  return (
    <ManualSubtopicosContext.Provider value={subtopicosCtx}>
      {children}
    </ManualSubtopicosContext.Provider>
  )
}

type ManualLeituraContextValue = {
  ativo: boolean
  fluxoPorSecao: Map<number, DocFluxo>
  isLido: (id: string) => boolean
  estadoCapitulo: (secaoNum: number) => ManualEstadoLeitura
  toggleCapitulo: (secaoNum: number) => void
  togglePasso: (id: string) => void
  totalRastreaveis: number
  totalLidos: number
  percentual: number
}

export const ManualLeituraContext = createContext<ManualLeituraContextValue | null>(null)

export function ManualBotaoMarcarLido({
  estado,
  onToggle,
  rotulo,
}: {
  estado: ManualEstadoLeitura
  onToggle: () => void
  rotulo: string
}) {
  const titulo = estado === 'lido' ? `Desmarcar ${rotulo}` : `Marcar ${rotulo} como lido`
  const Icone = estado === 'lido' ? CheckCircle : estado === 'parcial' ? CircleHalf : Circle
  const cor = estado === 'lido' ? '#22c55e' : estado === 'parcial' ? '#818cf8' : '#64748b'
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onToggle() }}
      title={titulo}
      aria-label={titulo}
      aria-pressed={estado === 'lido'}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 2,
        display: 'inline-flex',
        alignItems: 'center',
        flexShrink: 0,
      }}
    >
      <Icone size={14} weight={estado === 'nao_lido' ? 'regular' : 'fill'} color={cor} />
    </button>
  )
}

function parseElementoPassoManual(elementoId: string): { prefix: string; num: number } | null {
  const m = /^manual-passo-(.+)-(\d+)$/.exec(elementoId)
  if (!m) return null
  return { prefix: m[1], num: Number(m[2]) }
}

function numeroSecaoDeHashManual(hash: string | undefined): number | null {
  if (!hash) return null
  const m = /^#?doc-sec-(\d+)$/.exec(hash)
  if (!m) return null
  const n = Number(m[1])
  return Number.isFinite(n) && n > 0 ? n : null
}

function ManualLinkInterno({ href, rotulo }: { href: string; rotulo: string }) {
  const location = useLocation()
  const navigate = useNavigate()
  const scrollToSecao = useContext(ManualScrollSecaoContext)
  const hashIdx = href.indexOf('#')
  const pathname = (hashIdx >= 0 ? href.slice(0, hashIdx) : href).replace(/\/$/, '')
  const hash = hashIdx >= 0 ? href.slice(hashIdx) : ''
  const secaoNum = numeroSecaoDeHashManual(hash || undefined)
  const pathnameAtual = location.pathname.replace(/\/$/, '')
  const mesmaPagina = pathnameAtual === pathname

  const estiloBotaoLink: React.CSSProperties = {
    ...MANUAL_LINK_STYLE,
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    font: 'inherit',
  }

  if (secaoNum != null && scrollToSecao && mesmaPagina) {
    return (
      <button
        type="button"
        onClick={() => scrollToSecao(secaoNum)}
        style={estiloBotaoLink}
      >
        {rotulo}
      </button>
    )
  }

  if (secaoNum != null) {
    return (
      <button
        type="button"
        onClick={() => navigate({ pathname, hash })}
        style={estiloBotaoLink}
      >
        {rotulo}
      </button>
    )
  }

  return (
    <Link to={href} style={MANUAL_LINK_STYLE}>
      {rotulo}
    </Link>
  )
}

function textoComLinkWorkspaces(texto: string): string {
  return texto.replace(/\bworkspaces?\b/gi, (m) => `{{link:${LINK_DOC_WORKSPACES}|${m}}}`)
}

function gridColunasGaleriaTelas(quantidade: number): string {
  if (quantidade <= 1) return '1fr'
  if (quantidade === 2) return 'repeat(2, minmax(0, 1fr))'
  if (quantidade >= 4) return `repeat(${quantidade}, minmax(0, 1fr))`
  return 'repeat(3, minmax(0, 1fr))'
}

const CALLOUT_STYLE: Record<string, { bg: string; borda: string; label: string; cor: string }> = {
  destaque: { bg: 'rgba(251,191,36,.1)', borda: 'rgba(251,191,36,.38)', label: 'Bom saber', cor: '#fbbf24' },
  aviso: { bg: 'rgba(239,68,68,.08)', borda: 'rgba(248,113,113,.35)', label: 'Aviso', cor: '#f87171' },
  exemplo: { bg: 'rgba(148,163,184,.08)', borda: 'rgba(148,163,184,.25)', label: '💡 Exemplo', cor: '#94a3b8' },
  dica: { bg: 'rgba(99,102,241,.07)', borda: 'rgba(99,102,241,.3)', label: '💡 Dica', cor: '#818cf8' },
  lembrete: { bg: 'rgba(251,191,36,.08)', borda: 'rgba(251,191,36,.32)', label: 'Lembrete', cor: '#fbbf24' },
  seguranca: { bg: 'rgba(52,211,153,.08)', borda: 'rgba(52,211,153,.35)', label: 'Segurança', cor: '#34d399' },
}

const MANUAL_ESTILO_CALLOUT_CORPO: React.CSSProperties = {
  fontSize: '.82rem', color: MANUAL_CORPO_70, lineHeight: 1.65,
  textAlign: MANUAL_ALINHAMENTO_CORPO, textJustify: 'inter-word',
}

/** Ícones inline: token `{{icone:slug}}` — paridade ONBOARDING §9 */
const MANUAL_ICONES_PHOSPHOR: Record<string, Icon> = {
  olho: Eye,
  'olho-riscado': EyeSlash,
}

const MANUAL_ICONE_INLINE_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  verticalAlign: 'text-bottom',
  margin: '0 3px',
  alignItems: 'center',
  justifyContent: 'center',
}

/** Pin marítimo do mapa Insights — paridade `bfd-map-pin__dot` (visão geral BID Frete). */
function ManualIconePinMapaBidFreteInline() {
  return (
    <span
      role="img"
      aria-label="Pin do mapa — terminal no hub de cotações"
      style={{
        display: 'inline-flex',
        verticalAlign: 'text-bottom',
        marginLeft: 3,
        marginRight: 2,
        alignItems: 'center',
        justifyContent: 'center',
        width: 18,
        height: 18,
        borderRadius: '50%',
        backgroundColor: '#34d399',
        boxShadow: '0 0 8px rgba(52, 211, 153, 0.6)',
      }}
    >
      <Anchor size={11} weight="bold" color="#000000" aria-hidden />
    </span>
  )
}

function ManualIconeInline({ slug }: { slug: string }) {
  if (slug === 'pin-mapa-bid-frete') {
    return <ManualIconePinMapaBidFreteInline />
  }
  if (slug === 'pin-mapa-pedido') {
    return <ManualInfograficoPinMapaPedidoInline />
  }
  if (slug === 'abrir-cotacao-lista-bid-frete') {
    return <ManualInfograficoIconeAbrirCotacaoListaBidFreteInline />
  }
  if (isIconeControleMapaPedido(slug)) {
    return <ManualInfograficoIconeControleMapaPedidoInline slug={slug} />
  }
  if (isIconeControleMapaBidFrete(slug)) {
    return <ManualInfograficoIconeControleMapaBidFreteInline slug={slug} />
  }
  const Icone = MANUAL_ICONES_PHOSPHOR[slug]
  if (!Icone) return <>{`{{icone:${slug}}}`}</>
  return (
    <span style={MANUAL_ICONE_INLINE_STYLE} aria-hidden>
      <Icone size={16} />
    </span>
  )
}

function ManualBotaoInline({ slug }: { slug: string }) {
  return <ManualInfograficoBotaoInline slug={slug} />
}

function ManualTextoRich({ texto }: { texto: string }) {
  const linhas = texto.split('\n')
  return (
    <>
      {linhas.map((linha, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          <ManualTextoRichLinha texto={linha} />
        </React.Fragment>
      ))}
    </>
  )
}

function ManualTextoRichSegmento({ texto }: { texto: string }) {
  if (!texto.includes('**') && !texto.includes('*')) return texto
  const partes: React.ReactNode[] = []
  const re = /(\*\*([^*]+)\*\*|\*\_([^*]+)\_\*|\*([^*]+)\*)/g
  let ultimo = 0
  let match: RegExpExecArray | null
  let ki = 0
  while ((match = re.exec(texto)) !== null) {
    if (match.index > ultimo) partes.push(texto.slice(ultimo, match.index))
    if (match[2] !== undefined) {
      partes.push(
        <strong key={`b-${ki++}`} style={{ color: MANUAL_TITULO_COR, fontWeight: 700 }}>
          {match[2]}
        </strong>,
      )
    } else if (match[3] !== undefined) {
      partes.push(
        <em key={`is-${ki++}`} style={{ color: '#cbd5e1', fontStyle: 'italic', fontWeight: 600 }}>
          {match[3]}
        </em>,
      )
    } else if (match[4] !== undefined) {
      partes.push(
        <em key={`i-${ki++}`} style={{ color: '#cbd5e1', fontStyle: 'italic' }}>
          {match[4]}
        </em>,
      )
    }
    ultimo = re.lastIndex
  }
  if (ultimo < texto.length) partes.push(texto.slice(ultimo))
  return <>{partes}</>
}

function ManualTextoRichLinha({ texto }: { texto: string }) {
  const partes: React.ReactNode[] = []
  const re = /(https:\/\/[^\s]+|\{\{link:([^|]+)\|([^}]+)\}\}|\{\{icone:([a-z0-9-]+)\}\}|\{\{botao:([a-z0-9-]+)\}\})/g
  let ultimo = 0
  let match: RegExpExecArray | null
  let ki = 0
  while ((match = re.exec(texto)) !== null) {
    if (match.index > ultimo) {
      partes.push(<ManualTextoRichSegmento key={`t-${ki++}`} texto={texto.slice(ultimo, match.index)} />)
    }
    if (match[1].startsWith('https://')) {
      partes.push(
        <a key={match.index} href={match[1]} target="_blank" rel="noreferrer" style={MANUAL_LINK_STYLE}>
          {match[1]}
        </a>,
      )
    } else if (match[5] !== undefined) {
      partes.push(<ManualBotaoInline key={match.index} slug={match[5]} />)
    } else if (match[4] !== undefined) {
      partes.push(<ManualIconeInline key={match.index} slug={match[4]} />)
    } else if (match[2] !== undefined) {
      partes.push(
        <ManualLinkInterno key={match.index} href={match[2]} rotulo={match[3]} />,
      )
    }
    ultimo = re.lastIndex
  }
  if (ultimo < texto.length) {
    partes.push(<ManualTextoRichSegmento key={`t-${ki++}`} texto={texto.slice(ultimo)} />)
  }
  return <>{partes}</>
}

function splitLabelDescListaManual(item: string): { label: string; desc: string } {
  const cleaned = item.replace(/^[-–]\s*/, '').trim()
  const re = /^((?:[^{]|(?:\{\{link:[^}]+\}\}))+):\s*(.*)$/s
  const match = cleaned.match(re)
  if (!match) return { label: cleaned, desc: '' }
  return { label: match[1].trim(), desc: match[2].trim() }
}

function ManualIndicadorCursorVisualizacao() {
  return (
    <div
      role="img"
      aria-label="Cursor bloqueado — somente visualização"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        marginTop: 14,
        marginBottom: 4,
        padding: '12px 16px',
        borderRadius: 12,
        border: '1px solid rgba(248,113,113,.32)',
        background: 'linear-gradient(135deg, rgba(239,68,68,.12) 0%, rgba(148,163,184,.04) 100%)',
      }}
    >
      <Prohibit size={32} weight="fill" color="#ef4444" aria-hidden />
      <span style={{ fontSize: '.78rem', lineHeight: 1.45, color: MANUAL_CORPO_70 }}>
        Cursor de <strong style={{ color: '#fca5a5', fontWeight: 700 }}>bloqueio</strong> — a Lista é{' '}
        <strong style={{ color: MANUAL_TITULO_COR, fontWeight: 700 }}>somente visualização</strong>
      </span>
    </div>
  )
}

function ManualParagrafo({
  texto,
  marginBottom,
  alinhamentoAcordeao = false,
}: {
  texto: string
  marginBottom?: number | string
  /** Subtópico em acordeão — alinha à esquerda com infográficos/galerias (sem recuo de passo). */
  alinhamentoAcordeao?: boolean
}) {
  return (
    <p style={{
      ...MANUAL_ESTILO_CORPO,
      ...(alinhamentoAcordeao
        ? {
          textAlign: 'left',
          paddingLeft: MANUAL_ACORDEON_CORPO_PADDING_LATERAL_PX,
          marginLeft: 0,
        }
        : {}),
      margin: marginBottom === 0 ? 0 : `0 0 ${marginBottom ?? MANUAL_ESPACO_PARAGRAFO_PX}px`,
    }}>
      <ManualTextoRich texto={texto} />
    </p>
  )
}

const ESTILO_BOTAO_AMPLIAR: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '6px 11px', borderRadius: 9,
  background: 'rgba(99,102,241,.88)', border: '1px solid rgba(165,180,252,.45)',
  color: '#f8fafc', fontSize: '.65rem', fontWeight: 700, letterSpacing: '.03em',
  backdropFilter: 'blur(8px)', boxShadow: '0 4px 14px rgba(0,0,0,.28)',
  cursor: 'pointer',
}

/** Bump ao adicionar PNGs novos — evita cache de HTML (SPA fallback) quando o arquivo ainda não existia. */
const MANUAL_SCREENSHOT_CACHE_KEY = '224'

function urlScreenshotManual(src: string): string {
  const sep = src.includes('?') ? '&' : '?'
  return `${src}${sep}ssv=${MANUAL_SCREENSHOT_CACHE_KEY}`
}

function ManualFiguraScreenshot({
  src,
  alt,
  larguraMaxima,
  alturaMaxima,
  larguraTotal,
  ampliarInferiorDireito,
  preencherCelulaGrade,
  className,
  semSombraExterna,
}: {
  src: string
  alt: string
  larguraMaxima?: number
  alturaMaxima?: number
  larguraTotal?: boolean
  /** Só para casos pontuais — botão Ampliar no canto inferior direito da figura. */
  ampliarInferiorDireito?: boolean
  /** Preenche a célula da grade com altura uniforme (object-fit: cover). */
  preencherCelulaGrade?: boolean
  /** Ex.: `uni-player-aula__figura` no Guia Gravity (ritmo SSOT via workspace.css). */
  className?: string
  semSombraExterna?: boolean
}) {
  const [telaCheia, setTelaCheia] = useState(false)
  const [erroCarregamento, setErroCarregamento] = useState(false)
  const [tentativaRecarga, setTentativaRecarga] = useState(0)
  const srcEfetivo = `${urlScreenshotManual(src)}${tentativaRecarga > 0 ? `&rc=${tentativaRecarga}` : ''}`
  const ampliarAbaixo = src === SCREENSHOT_HUB_ACESSO_CONFIGURADOR
  const compacta = larguraMaxima != null
  const preencherGrade = preencherCelulaGrade === true
  const alturaFixa = alturaMaxima != null
  const recorteVertical = preencherGrade || alturaFixa
  const larguraCheia = ampliarAbaixo || compacta || larguraTotal || preencherGrade || alturaFixa

  useEffect(() => {
    setErroCarregamento(false)
    setTentativaRecarga(0)
  }, [src])

  useEffect(() => {
    setErroCarregamento(false)
  }, [srcEfetivo])

  const aoErroImagem = () => {
    if (tentativaRecarga < 3) {
      window.setTimeout(() => setTentativaRecarga((n) => n + 1), 500)
      return
    }
    setErroCarregamento(true)
  }

  useEffect(() => {
    if (!telaCheia) return
    const onTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTelaCheia(false)
    }
    document.addEventListener('keydown', onTecla)
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onTecla)
      document.body.style.overflow = overflowAnterior
    }
  }, [telaCheia])

  const abrirTelaCheia = () => setTelaCheia(true)

  return (
    <>
      <div
        className={className}
        style={
        ampliarAbaixo
          ? { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }
          : preencherGrade && !alturaFixa
            ? {
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              width: '100%',
              minWidth: 0,
            }
            : compacta || larguraTotal || alturaFixa
              ? { maxWidth: larguraMaxima, width: '100%' }
              : undefined
      }>
        <figure
          role={erroCarregamento ? undefined : 'button'}
          tabIndex={erroCarregamento ? undefined : 0}
          aria-label={erroCarregamento ? undefined : `${alt}: abrir em tela cheia`}
          onClick={erroCarregamento ? undefined : abrirTelaCheia}
          onKeyDown={erroCarregamento ? undefined : (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              abrirTelaCheia()
            }
          }}
          style={{
            margin: 0, borderRadius: 14, overflow: 'hidden',
            cursor: erroCarregamento ? 'default' : 'zoom-in',
            border: '1px solid rgba(148,163,184,.15)',
            boxShadow: semSombraExterna
              ? 'inset 0 1px 0 rgba(255,255,255,.04), 0 0 0 1px rgba(148,163,184,.12)'
              : '0 8px 32px rgba(0,0,0,.28)',
            background: 'rgba(8,12,24,.55)', position: 'relative',
            width: larguraCheia ? '100%' : undefined,
            maxWidth: preencherGrade && !alturaFixa ? undefined : larguraMaxima,
            ...(alturaFixa ? { height: alturaMaxima, maxHeight: alturaMaxima } : {}),
            ...(preencherGrade && !alturaFixa
              ? { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }
              : alturaFixa
                ? { display: 'flex', flexDirection: 'column', overflow: 'hidden' }
                : {}),
          }}
        >
          {erroCarregamento ? (
            <div style={{
              padding: 48, textAlign: 'center', color: '#475569', fontSize: '.8rem',
              background: 'rgba(148,163,184,.04)',
            }}>
              📸 Salve o screenshot em
              <br />
              <code style={{ color: '#818cf8', fontSize: '.75rem' }}>{src}</code>
            </div>
          ) : (
            <img
              key={srcEfetivo}
              src={srcEfetivo}
              alt={alt}
              style={recorteVertical
                ? {
                  flex: 1,
                  width: '100%',
                  minHeight: 0,
                  height: '100%',
                  display: 'block',
                  objectFit: 'cover',
                  objectPosition: 'top center',
                }
                : { width: '100%', display: 'block', verticalAlign: 'top', objectFit: 'contain' }}
              onError={aoErroImagem}
            />
          )}
          {!ampliarAbaixo && !erroCarregamento && (
            <span style={{
              position: 'absolute',
              ...(ampliarInferiorDireito || semSombraExterna
                ? { bottom: 10, right: 10 }
                : { top: 10, right: 10 }),
              zIndex: 2,
              ...ESTILO_BOTAO_AMPLIAR,
              pointerEvents: 'none',
            }}>
              <ArrowsOut size={15} weight="duotone" aria-hidden />
              Ampliar
            </span>
          )}
        </figure>
        {ampliarAbaixo && (
          <button
            type="button"
            onClick={abrirTelaCheia}
            aria-label={`${alt}: ampliar`}
            style={{ ...ESTILO_BOTAO_AMPLIAR, marginTop: 10 }}
          >
            <ArrowsOut size={15} weight="duotone" aria-hidden />
            Ampliar
          </button>
        )}
      </div>

      {telaCheia && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setTelaCheia(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', background: 'rgba(2,6,23,.92)', backdropFilter: 'blur(4px)',
          }}
        >
          <button
            type="button"
            onClick={() => setTelaCheia(false)}
            aria-label="Fechar visualização em tela cheia"
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(148,163,184,.12)', border: '1px solid rgba(148,163,184,.25)',
              color: '#f1f5f9', borderRadius: 8, padding: '8px 14px',
              fontSize: '.78rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Fechar ✕
          </button>
          <img
            src={srcEfetivo}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 'min(96vw, 1920px)', maxHeight: '92vh',
              width: 'auto', height: 'auto', objectFit: 'contain',
              borderRadius: 10, boxShadow: '0 24px 80px rgba(0,0,0,.55)',
            }}
          />
        </div>
      )}
    </>
  )
}

function ManualTextoUx10AcimaFigura({ texto }: { texto: string }) {
  return (
    <div style={{
      marginBottom: 10,
      background: 'rgba(99,102,241,.06)',
      border: '1px solid rgba(99,102,241,.18)',
      borderRadius: 10,
      padding: '10px 12px',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.04)',
    }}>
      <p style={{ ...MANUAL_ESTILO_CORPO, margin: 0, fontSize: '.75rem', lineHeight: 1.5 }}>
        <ManualTextoRich texto={texto} />
      </p>
    </div>
  )
}

function ManualGaleriaTelaLegendaStep({
  legenda,
  alinhamento = 'center',
}: {
  legenda: string
  alinhamento?: 'center' | 'left'
}) {
  return (
    <p style={{
      fontSize: '14.5px', fontWeight: 700, color: '#818cf8',
      margin: 0, marginBottom: alinhamento === 'center' ? 6 : 0,
      textAlign: alinhamento, letterSpacing: '.04em',
    }}>{legenda}</p>
  )
}

function ManualGaleriaTelaLegendaFigura({ legenda }: { legenda: string }) {
  return (
    <p style={{
      fontSize: '.68rem', fontWeight: 600, color: '#94a3b8',
      marginBottom: 6, textAlign: 'center', letterSpacing: '.03em',
    }}>{legenda}</p>
  )
}

function ManualGaleriaTelaLegendaLinha({ texto }: { texto: string }) {
  return (
    <p style={{
      fontSize: '.72rem', fontWeight: 700, color: '#818cf8',
      margin: '4px 0 0', textAlign: 'center', letterSpacing: '.04em', lineHeight: 1.55,
    }}>
      <ManualTextoRich texto={texto} />
    </p>
  )
}

function ManualGaleriaTelaParagrafoFigura({
  texto,
  entreLinhas = false,
  margemAbaixo,
  alturaFixaLegenda,
}: {
  texto: string
  /** @deprecated Preferir `margemAbaixo` em `ManualGaleriaLegendaPrintPasso`. Mantido só em grades legadas. */
  entreLinhas?: boolean
  /** Sobrescreve o vão frase → imagem (SSOT `MANUAL_ESPACO_FRASE_IMAGEM_PX`). */
  margemAbaixo?: number
  alturaFixaLegenda?: number
}) {
  return (
    <div style={{
      marginBottom: alturaFixaLegenda ? 0 : (margemAbaixo ?? (entreLinhas ? MANUAL_ESPACO_PARAGRAFO_PX : MANUAL_ESPACO_ANTES_IMAGEM_ACORDEAO_PX)),
      minHeight: alturaFixaLegenda,
      textAlign: 'left',
    }}>
      <ManualParagrafo texto={texto} marginBottom={0} />
    </div>
  )
}

/** Print numerado (**08.** …) — chip indigo + legenda, distinto do bloco 💡 Dica. */
function ManualGaleriaChipNumeroPasso({ numero }: { numero: string }) {
  return (
    <div
      title={`Passo ${numero}`}
      style={{
        minWidth: 52,
        height: 38,
        padding: '0 7px',
        borderRadius: 8,
        border: '1px solid rgba(129,140,248,.32)',
        background: 'rgba(99,102,241,.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        flexShrink: 0,
      }}
    >
      <span style={{
        fontSize: '7px', fontWeight: 800, color: '#818cf8', letterSpacing: '.1em',
        lineHeight: 1, textTransform: 'uppercase',
      }}>
        Passo
      </span>
      <span style={{
        fontSize: '11px', fontWeight: 800, color: '#818cf8', letterSpacing: '.04em', lineHeight: 1,
      }}>
        {numero}
      </span>
    </div>
  )
}

function ManualGaleriaLegendaPrintPasso({
  texto,
  entreLinhas = false,
  margemAbaixo,
  modoTituloSubtopico = false,
  semAlturaMinima = false,
  passoAcademyGuia = false,
  alturaFixaLegenda,
}: {
  texto: string
  entreLinhas?: boolean
  /** Sobrescreve margin-bottom padrão (ex.: print largura total → `MANUAL_ESPACO_PARAGRAFO_PX`). */
  margemAbaixo?: number
  /** Subtópico em acordeão — instrução operacional simples; só **NN.** vira chip de passo. */
  modoTituloSubtopico?: boolean
  /** Fluxo de coluna única (cenário) — dispensa a altura mínima usada só p/ alinhar grades. */
  semAlturaMinima?: boolean
  /** Guia Academy — borda lateral só em **Passo NN** (`.uni-player-aula__passo-corpo`). */
  passoAcademyGuia?: boolean
  /** Grade multi-coluna — alinha legendas e empurra prints para a mesma baseline. */
  alturaFixaLegenda?: number
}) {
  const matchNumerado = texto.match(/^\*\*(\d{2})\.\*\*\s+([\s\S]+)$/)
  const marginBottom = margemAbaixo ?? MANUAL_ESPACO_ANTES_IMAGEM_ACORDEAO_PX

  if (modoTituloSubtopico && !matchNumerado) {
    return (
      <ManualGaleriaTelaParagrafoFigura
        texto={texto}
        entreLinhas={entreLinhas}
        margemAbaixo={margemAbaixo}
      />
    )
  }

  const match = matchNumerado
  if (!match) {
    return (
      <ManualGaleriaTelaParagrafoFigura
        texto={texto}
        entreLinhas={entreLinhas}
        margemAbaixo={alturaFixaLegenda ? 0 : margemAbaixo}
        alturaFixaLegenda={alturaFixaLegenda}
      />
    )
  }
  const [, numero, legenda] = match
  const linhaPassoNumerado = (
    <div style={{
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      textAlign: 'left',
    }}>
      <ManualGaleriaChipNumeroPasso numero={numero} />
      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
        <ManualParagrafo texto={legenda.trim()} marginBottom={0} />
      </div>
    </div>
  )
  const estiloLegendaGrade = alturaFixaLegenda && !semAlturaMinima
    ? { minHeight: alturaFixaLegenda, marginBottom: 0 as const }
    : { marginBottom }
  if (passoAcademyGuia) {
    return (
      <div
        className="uni-player-aula__passo-corpo"
        style={{ ...estiloLegendaGrade, width: '100%', minWidth: 0, boxSizing: 'border-box' }}
      >
        {linhaPassoNumerado}
      </div>
    )
  }
  return (
    <div style={{
      ...estiloLegendaGrade,
      textAlign: 'left',
    }}>
      {linhaPassoNumerado}
    </div>
  )
}

function ManualGaleriaRotuloLinhaDicas() {
  return (
    <p style={{
      ...MANUAL_ESTILO_PASSO_ROTULO,
      margin: '0 0 10px',
    }}>
      Dicas desta etapa
    </p>
  )
}

function ManualGaleriaRotuloConsolidarExemplos() {
  return (
    <p style={{
      ...MANUAL_ESTILO_PASSO_ROTULO,
      margin: '0 0 10px',
    }}>
      Na prática · passo 2 do modal
    </p>
  )
}

function ManualGaleriaRotuloEdicaoMassaExemplos({ passo }: { passo: 1 | 2 }) {
  return (
    <p style={{
      ...MANUAL_ESTILO_PASSO_ROTULO,
      margin: '0 0 10px',
    }}>
      {passo === 1 ? 'Na prática · passo 1 do modal' : 'Na prática · passo 2 do modal'}
    </p>
  )
}

/** Print com chip de tipo (Igual, Divergente…) — distinto do chip numerado de passo. */
function ManualGaleriaLegendaConsolidarExemplo({
  chip,
  texto,
  entreLinhas = false,
  margemAbaixo,
  alturaFixaLegenda,
}: {
  chip: DocChipConsolidarExemploId
  texto: string
  entreLinhas?: boolean
  margemAbaixo?: number
  /** Grade 3 colunas — mesma altura em Igual/Divergente/Vazio para alinhar prints. */
  alturaFixaLegenda?: number
}) {
  const marginBottom = margemAbaixo ?? (entreLinhas ? 4 : 6)
  return (
    <div style={{
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      marginBottom,
      minHeight: alturaFixaLegenda ?? (entreLinhas ? undefined : '2.75rem'),
      height: alturaFixaLegenda,
      boxSizing: 'border-box',
    }}>
      <div style={{ paddingTop: 2 }}>
        <ManualChipConsolidarExemplo id={chip} />
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
        <ManualParagrafo texto={texto.trim()} marginBottom={0} />
      </div>
    </div>
  )
}

/** Print com chip de edição em massa — distinto do chip numerado de passo. */
function ManualGaleriaLegendaEdicaoMassaExemplo({
  chip,
  texto,
  entreLinhas = false,
  margemAbaixo,
  alturaFixaLegenda,
}: {
  chip: DocChipEdicaoMassaExemploId
  texto: string
  entreLinhas?: boolean
  margemAbaixo?: number
  alturaFixaLegenda?: number
}) {
  const marginBottom = margemAbaixo ?? (entreLinhas ? 4 : 6)
  return (
    <div style={{
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      marginBottom,
      minHeight: alturaFixaLegenda ?? (entreLinhas ? undefined : '2.75rem'),
      height: alturaFixaLegenda,
      boxSizing: 'border-box',
    }}>
      <div style={{ paddingTop: 2 }}>
        <ManualChipEdicaoMassaExemplo id={chip} />
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
        <ManualParagrafo texto={texto.trim()} marginBottom={0} />
      </div>
    </div>
  )
}

/** Grade Igual/Divergente/Vazio — 3 colunas na largura total, legendas alinhadas. */
const MANUAL_ESTILO_GRADE_CHIP_TRES_COLUNAS: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: 10,
  alignItems: 'stretch',
  width: '100%',
}

/** Dupla de prints com frase só na 2ª figura — frase no centro, imagens alinhadas no topo. */
function ehLinhaFigurasComFraseCentral(
  linha: NonNullable<DocGaleriaTela['imagensCompostas']>[number],
): boolean {
  if (linha.figuras.length !== 2) return false
  const [esq, dir] = linha.figuras
  return !esq.paragrafoAntes?.trim() && !esq.legenda?.trim()
    && Boolean(dir.paragrafoAntes?.trim()) && !dir.legenda?.trim()
}

function ManualGaleriaTelaFigurasCompostas({
  linhas,
  legendaPrincipal,
}: {
  linhas: NonNullable<DocGaleriaTela['imagensCompostas']>
  legendaPrincipal: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: MANUAL_ESPACO_PARAGRAFO_PX }}>
      {linhas.map((linha, indiceLinha) => {
        const centralizar = linha.centralizar ?? linha.figuras.length === 1
        const figurasLinha = centralizar && linha.figuras.length === 1 ? (
          <div
            key={`linha-${indiceLinha}`}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
          >
            {linha.figuras[0].paragrafoAntes ? (
              <ManualGaleriaTelaParagrafoFigura texto={linha.figuras[0].paragrafoAntes} />
            ) : linha.figuras[0].legenda ? (
              <ManualGaleriaTelaLegendaFigura legenda={linha.figuras[0].legenda} />
            ) : null}
            <ManualFiguraScreenshot
              src={linha.figuras[0].imagem}
              alt={linha.figuras[0].legenda ?? legendaPrincipal}
              {...(linha.figuras[0].larguraMaxima != null
                ? { larguraMaxima: linha.figuras[0].larguraMaxima }
                : { larguraTotal: true })}
            />
          </div>
        ) : ehLinhaFigurasComFraseCentral(linha) ? (
          <div
            key={`linha-${indiceLinha}`}
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(140px, 22%) minmax(0, 1fr)',
              gap: MANUAL_ESPACO_GRADE_GALERIA_PX,
              alignItems: 'start',
            }}
          >
            <ManualFiguraScreenshot
              src={linha.figuras[0].imagem}
              alt={linha.figuras[0].legenda ?? `${legendaPrincipal} — figura 1`}
              larguraTotal
            />
            <div style={{ alignSelf: 'center', minWidth: 0 }}>
              <ManualGaleriaTelaParagrafoFigura
                texto={linha.figuras[1].paragrafoAntes!}
                margemAbaixo={0}
              />
            </div>
            <ManualFiguraScreenshot
              src={linha.figuras[1].imagem}
              alt={linha.figuras[1].legenda ?? `${legendaPrincipal} — figura 2`}
              larguraTotal
            />
          </div>
        ) : (
          <div
            key={`linha-${indiceLinha}`}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${linha.figuras.length}, minmax(0, 1fr))`,
              gap: MANUAL_ESPACO_GRADE_GALERIA_PX,
              alignItems: 'start',
            }}
          >
            {linha.figuras.map((figura, indiceFigura) => {
              const alt = figura.legenda ?? `${legendaPrincipal} — figura ${indiceFigura + 1}`
              return (
                <div key={`fig-${indiceFigura}`}>
                  {figura.paragrafoAntes ? (
                    <ManualGaleriaTelaParagrafoFigura texto={figura.paragrafoAntes} />
                  ) : figura.legenda ? (
                    <ManualGaleriaTelaLegendaFigura legenda={figura.legenda} />
                  ) : null}
                  <ManualFiguraScreenshot src={figura.imagem} alt={alt} larguraTotal />
                </div>
              )
            })}
          </div>
        )

        return (
          <React.Fragment key={`bloco-${indiceLinha}`}>
            {linha.paragrafoAntes ? (
              <ManualGaleriaTelaParagrafoFigura texto={linha.paragrafoAntes} />
            ) : null}
            {figurasLinha}
            {linha.paragrafoApos ? (
              <ManualGaleriaTelaParagrafoFigura texto={linha.paragrafoApos} entreLinhas />
            ) : linha.legendaApos ? (
              <ManualGaleriaTelaLegendaLinha texto={linha.legendaApos} />
            ) : null}
          </React.Fragment>
        )
      })}
    </div>
  )
}

function ManualGaleriaTelaCelula({ tela }: { tela: DocGaleriaTela }) {
  const pilaresCustomizacao = tela.pilaresCustomizacao
  const pilaresMapaBidFrete = tela.pilaresMapaBidFrete
  const pilaresPainelCotacaoBidFrete = tela.pilaresPainelCotacaoBidFrete
  const pilaresFiltrosMapaBidFrete = tela.pilaresFiltrosMapaBidFrete
  const pilaresAbasPainelCotacaoBidFrete = tela.pilaresAbasPainelCotacaoBidFrete
  const pilaresControlesMapaBidFrete = tela.pilaresControlesMapaBidFrete
  const pilaresMapaPedido = tela.pilaresMapaPedido
  const pilaresRankingsMapaPedido = tela.pilaresRankingsMapaPedido
  const pilaresControlesMapaPedido = tela.pilaresControlesMapaPedido
  const pilaresFiltrosMapaPedido = tela.pilaresFiltrosMapaPedido
  const temPilares = Boolean(
    pilaresCustomizacao?.length || pilaresMapaBidFrete?.length || pilaresPainelCotacaoBidFrete?.length
      || pilaresFiltrosMapaBidFrete?.length || pilaresAbasPainelCotacaoBidFrete?.length
      || pilaresControlesMapaBidFrete?.length || pilaresMapaPedido?.length
      || pilaresRankingsMapaPedido?.length || pilaresControlesMapaPedido?.length
      || pilaresFiltrosMapaPedido?.length,
  )

  const figuras = tela.imagensCompostas?.length
    ? (
      <ManualGaleriaTelaFigurasCompostas
        linhas={tela.imagensCompostas}
        legendaPrincipal={tela.legenda}
      />
    )
    : tela.simuladorPedidoListaArrastarColunas
      ? <ManualPedidoSimuladorListaArrastarColunas />
      : tela.imagem
        ? <ManualFiguraScreenshot src={tela.imagem} alt={tela.legenda} />
        : null

  const restoAposParagrafo = (
    <>
      {tela.tooltipKpi ? (
        <div style={{ marginBottom: MANUAL_ESPACO_PARAGRAFO_PX }}>
          <ManualTooltipKpiCard tooltip={tela.tooltipKpi} />
        </div>
      ) : null}
      {!temPilares && tela.legendaAlinhamento !== 'left' ? (
        <ManualGaleriaTelaLegendaStep
          legenda={tela.legenda}
          alinhamento={tela.legendaAlinhamento ?? 'center'}
        />
      ) : null}
      {tela.simuladorBidFretePainelInsights ? <ManualBidFreteSimuladorPainelInsights /> : null}
      {figuras}
      {tela.calloutDepois ? (
        <ManualCalloutBloco callout={tela.calloutDepois} marginTop={MANUAL_ESPACO_PARAGRAFO_PX} />
      ) : tela.paragrafoDepois ? (
        <div style={{ marginTop: MANUAL_ESPACO_PARAGRAFO_PX, textAlign: 'left' }}>
          <ManualParagrafo texto={tela.paragrafoDepois} marginBottom={0} />
        </div>
      ) : null}
    </>
  )

  if (!temPilares) {
    const legendaEsquerda = tela.legendaAlinhamento === 'left' ? (
      <div style={{ marginBottom: MANUAL_ESPACO_ANTES_IMAGEM_ACORDEAO_PX }}>
        <ManualGaleriaTelaLegendaStep legenda={tela.legenda} alinhamento="left" />
      </div>
    ) : null

    return (
      <div>
        {legendaEsquerda}
        {tela.paragrafoAntes ? (
          <div style={{ marginBottom: MANUAL_ESPACO_ANTES_IMAGEM_ACORDEAO_PX, textAlign: 'left' }}>
            <ManualParagrafo texto={tela.paragrafoAntes} marginBottom={0} />
          </div>
        ) : null}
        {restoAposParagrafo}
      </div>
    )
  }

  return (
    <div>
      <ManualGaleriaCabecalhoPasso
        legendaPasso={tela.legenda}
        textoCorpo={tela.paragrafoAntes}
        pilaresCustomizacao={pilaresCustomizacao}
        pilaresMapaBidFrete={pilaresMapaBidFrete}
        pilaresPainelCotacaoBidFrete={pilaresPainelCotacaoBidFrete}
        pilaresFiltrosMapaBidFrete={pilaresFiltrosMapaBidFrete}
        pilaresAbasPainelCotacaoBidFrete={pilaresAbasPainelCotacaoBidFrete}
        pilaresControlesMapaBidFrete={pilaresControlesMapaBidFrete}
        pilaresMapaPedido={pilaresMapaPedido}
        pilaresRankingsMapaPedido={pilaresRankingsMapaPedido}
        pilaresControlesMapaPedido={pilaresControlesMapaPedido}
        pilaresFiltrosMapaPedido={pilaresFiltrosMapaPedido}
      />
      {restoAposParagrafo}
    </div>
  )
}

function ManualGaleriaTelaImagemCelula({ tela }: { tela: DocGaleriaTela }) {
  const figuras = tela.imagensCompostas?.length
    ? (
      <ManualGaleriaTelaFigurasCompostas
        linhas={tela.imagensCompostas}
        legendaPrincipal={tela.legenda}
      />
    )
    : tela.imagem
      ? <ManualFiguraScreenshot src={tela.imagem} alt={tela.legenda} larguraTotal />
      : null

  return (
    <div style={{ width: '100%' }}>
      <p style={{
        fontSize: '.72rem', fontWeight: 700, color: '#818cf8',
        marginBottom: 8, textAlign: 'center', letterSpacing: '.04em',
        minHeight: '2.25rem',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}>{tela.legenda}</p>
      {figuras}
    </div>
  )
}

export function ManualGaleriaTelasBloco({
  telas,
  fraseAposIndice,
}: {
  telas: DocGaleriaTela[]
  fraseAposIndice?: { indice: number; texto: string }
}) {
  if (telas.length === 0) return null

  const gradeTelas = (items: DocGaleriaTela[], marginTop: number) => {
    const alinharCards = items.length > 0 && items.every((tela) => tela.tooltipKpi != null)

    if (alinharCards) {
      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: gridColunasGaleriaTelas(items.length),
          gap: 14,
          marginTop,
          alignItems: 'stretch',
        }}>
          {items.map((tela) => (
            <ManualTooltipKpiCard
              key={`card-${tela.legenda}`}
              tooltip={tela.tooltipKpi!}
              preencherAltura
            />
          ))}
          {items.map((tela) => (
            <ManualGaleriaTelaImagemCelula key={`img-${tela.legenda}`} tela={tela} />
          ))}
        </div>
      )
    }

    return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: gridColunasGaleriaTelas(items.length),
      gap: 14,
      marginTop,
    }}>
      {items.map((tela) => (
        <div key={tela.legenda}>
          <ManualGaleriaTelaCelula tela={tela} />
        </div>
      ))}
    </div>
    )
  }

  if (
    !fraseAposIndice
    || fraseAposIndice.indice < 0
    || fraseAposIndice.indice >= telas.length - 1
  ) {
    return gradeTelas(telas, 20)
  }

  const antes = telas.slice(0, fraseAposIndice.indice + 1)
  const depois = telas.slice(fraseAposIndice.indice + 1)

  return (
    <>
      {gradeTelas(antes, 20)}
      <div style={{
        marginTop: 16,
        padding: '2px 0 0 18px',
        borderLeft: '3px solid rgba(99,102,241,.45)',
      }}>
        <ManualParagrafo texto={fraseAposIndice.texto} marginBottom={0} />
      </div>
      {gradeTelas(depois, 16)}
    </>
  )
}

function ManualCalloutBloco({ callout, marginTop = 12, marginBottom = 0 }: {
  callout: { tipo: 'aviso' | 'exemplo' | 'dica' | 'seguranca' | 'destaque' | 'lembrete'; texto: string }
  marginTop?: number
  marginBottom?: number
}) {
  const c = CALLOUT_STYLE[callout.tipo]
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.borda}`, borderRadius: 8,
      padding: '12px 16px', marginTop, marginBottom,
    }}>
      <p style={{
        fontSize: '.7rem', fontWeight: 700, color: c.cor, marginBottom: 5,
        letterSpacing: '.06em', textTransform: 'uppercase',
      }}>{c.label}</p>
      <p style={MANUAL_ESTILO_CALLOUT_CORPO}><ManualTextoRich texto={callout.texto} /></p>
    </div>
  )
}

function ManualTagEmBreve({ compact = false }: { compact?: boolean }) {
  return (
    <span
      aria-label="Em breve"
      style={{
        fontSize: compact ? '.58rem' : '.62rem',
        fontWeight: 700,
        letterSpacing: '.04em',
        textTransform: 'uppercase',
        color: '#fbbf24',
        background: 'rgba(251,191,36,.1)',
        border: '1px solid rgba(251,191,36,.32)',
        borderRadius: MANUAL_RAIO_CHIP,
        padding: compact ? '2px 8px' : '3px 10px',
        flexShrink: 0,
        lineHeight: 1.2,
      }}
    >
      Em breve
    </span>
  )
}

function ManualBadgeEmDesenvolvimento({ marginBottom = MANUAL_ESPACO_PARAGRAFO_PX }: { marginBottom?: number }) {
  const c = CALLOUT_STYLE.lembrete
  return (
    <div style={{
      background: c.bg,
      border: `1px solid ${c.borda}`,
      borderRadius: 8,
      padding: '12px 16px',
      marginTop: 0,
      marginBottom,
    }}>
      <p style={{
        fontSize: '.7rem',
        fontWeight: 700,
        color: c.cor,
        marginBottom: 5,
        letterSpacing: '.06em',
        textTransform: 'uppercase',
      }}>
        Em breve
      </p>
      <p style={MANUAL_ESTILO_CALLOUT_CORPO}>
        Esta seção ainda está em homologação — a documentação pode antecipar telas que mudam antes do release.
      </p>
    </div>
  )
}

function ManualColunasTabela({ colunas }: { colunas: DocColunaTabela[] }) {
  return (
    <div style={{
      marginTop: 16,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: 14,
    }}>
      {colunas.map((col) => (
        <div
          key={col.coluna}
          style={{
            background: 'rgba(99,102,241,.06)',
            border: '1px solid rgba(99,102,241,.18)',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          {col.imagem && (
            <ManualFiguraScreenshot
              src={col.imagem}
              alt={`Coluna ${col.coluna}`}
            />
          )}
          <div style={{ padding: '12px 14px' }}>
            <p style={{
              fontSize: '.68rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
              color: '#818cf8', margin: '0 0 4px',
            }}>
              {col.coluna}
            </p>
            {col.tituloColuna && (
              <p style={{ fontSize: '.72rem', fontWeight: 600, color: '#e2e8f0', margin: '0 0 6px' }}>
                {col.tituloColuna}
              </p>
            )}
            <p style={{ fontSize: '.75rem', color: MANUAL_CORPO_70, margin: col.detalhes?.length ? '0 0 8px' : 0, lineHeight: 1.45 }}>
              {col.descricao}
            </p>
            {col.detalhes && col.detalhes.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: '.72rem', color: MANUAL_CORPO_70, lineHeight: 1.5 }}>
                {col.detalhes.map((item) => (
                  <li key={item} style={{ marginBottom: 3 }}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function ManualTooltipKpiCard({
  tooltip,
  preencherAltura = false,
}: {
  tooltip: DocTooltipKpi
  preencherAltura?: boolean
}) {
  return (
    <div
      style={{
        background: 'rgba(99,102,241,.06)',
        border: '1px solid rgba(99,102,241,.18)',
        borderRadius: 10,
        padding: '12px 14px',
        ...(preencherAltura ? {
          height: '100%',
          width: '100%',
          boxSizing: 'border-box',
        } : {}),
      }}
    >
      <p style={{
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
        color: '#818cf8', margin: '0 0 10px',
      }}>
        {tooltip.card}
      </p>
      <p style={{ fontSize: '.72rem', fontWeight: 600, color: '#e2e8f0', margin: '0 0 10px' }}>
        Tooltip: {tooltip.tituloTooltip}
      </p>
      <p style={{ fontSize: '.75rem', color: MANUAL_CORPO_70, margin: '0 0 8px', lineHeight: 1.45 }}>
        <ManualTextoRich texto={tooltip.descricao} />
      </p>
      <ul style={{ margin: 0, paddingLeft: 16, fontSize: '.72rem', color: MANUAL_CORPO_70, lineHeight: 1.5 }}>
        {tooltip.detalhes.map((item) => (
          <li key={item} style={{ marginBottom: 3 }}><ManualTextoRichLinha texto={item} /></li>
        ))}
      </ul>
    </div>
  )
}

function ManualTooltipsKpi({ tooltips }: { tooltips: DocTooltipKpi[] }) {
  const umaColuna = tooltips.length === 1
  return (
    <div style={{
      marginTop: 16,
      display: 'grid',
      gridTemplateColumns: umaColuna ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 10,
    }}>
      {tooltips.map((tooltip) => (
        <ManualTooltipKpiCard key={tooltip.card} tooltip={tooltip} />
      ))}
    </div>
  )
}

function figurasAposParagrafoPasso(
  passo: DocPassoVisual,
  indice: number,
): DocFiguraAposParagrafo[] {
  return (passo.figurasAposParagrafo ?? []).filter((f) => f.indice === indice)
}

function galeriaComparacaoAposParagrafoPasso(passo: DocPassoVisual, indice: number) {
  return (passo.galeriaComparacaoAposParagrafo ?? []).filter((g) => g.indice === indice)
}

/** Nova etapa / novo assunto após bloco anterior (ex.: dicas → Novo pedido). SSOT: `MANUAL_ESPACO_ENTRE_PASSOS_PX` (22px). */
function espacoSuperiorAntesTituloEtapaGaleria(
  galerias: Array<{ tituloEtapa?: string; chipTransferirTituloEtapa?: string }>,
  indice: number,
  galeria: { tituloEtapa?: string; chipTransferirTituloEtapa?: string },
): boolean {
  if (indice > 0) return true
  if (!galeria.tituloEtapa || indice === 0) return false
  if (galeria.chipTransferirTituloEtapa) return true
  return !galerias[indice - 1]?.tituloEtapa
}

function ManualPassosSubtopicosAcordeao({
  fluxo,
  numeroSecaoFluxo,
  propsPasso,
}: {
  fluxo: DocFluxo
  numeroSecaoFluxo: number
  propsPasso: (passo: DocPassoVisual) => {
    passo: DocPassoVisual
    prefixoPasso?: string
    wizardEtapas?: DocWizardEtapa[]
    ancoraPassoId?: string
  }
}) {
  const ctx = useContext(ManualSubtopicosContext)
  const ancoraPrefix = fluxo.ancoraPassosPrefix
  const passos = fluxo.passosVisuais ?? []
  if (!ctx || !ancoraPrefix || passos.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: MANUAL_ESPACO_ENTRE_PASSOS_PX, marginTop: MANUAL_ESPACO_ENTRE_PASSOS_PX }}>
      <ManualPassosSubtopicosAcordeaoNivel
        passos={passos}
        ancoraPrefix={ancoraPrefix}
        numeroSecaoFluxo={numeroSecaoFluxo}
        fluxo={fluxo}
        propsPasso={propsPasso}
        profundidade={0}
      />
    </div>
  )
}

function estiloArvoreSubtopicosAninhados(profundidade: number): React.CSSProperties {
  if (profundidade <= 0) return {}
  return {
    marginTop: MANUAL_ACORDEON_SUBTOPICO_MARGEM_TOPO_PX,
    marginLeft: MANUAL_ACORDEON_SUBTOPICO_RECUO_NIVEL_PX,
    paddingLeft: MANUAL_ACORDEON_SUBTOPICO_PADDING_ESQUERDA_PX,
    borderLeft: MANUAL_ACORDEON_SUBTOPICO_BORDA_ESQUERDA,
  }
}

function ManualPassosSubtopicosAcordeaoNivel({
  passos,
  ancoraPrefix,
  numeroSecaoFluxo,
  fluxo,
  propsPasso,
  profundidade,
}: {
  passos: DocPassoVisual[]
  ancoraPrefix: string
  numeroSecaoFluxo: number
  fluxo: DocFluxo
  propsPasso: (passo: DocPassoVisual) => {
    passo: DocPassoVisual
    prefixoPasso?: string
    wizardEtapas?: DocWizardEtapa[]
    ancoraPassoId?: string
  }
  profundidade: number
}) {
  const ctx = useContext(ManualSubtopicosContext)
  const leitura = useContext(ManualLeituraContext)
  if (!ctx) return null

  const abertosPasso = ctx.abertosPorPrefix[ancoraPrefix] ?? []
  const aninhado = profundidade > 0
  const gapIrmaos = MANUAL_ACORDEON_SECAO_GAP_PX
  const raioCard = aninhado ? 8 : 12
  const paddingCabecalho = aninhado ? '10px 14px' : '16px 22px'
  const gapCabecalho = aninhado ? 12 : 16

  const itens = passos.map((passo) => {
        const ancoraPassoId = `manual-passo-${ancoraPrefix}-${passo.num}`
        const rotuloCurto = passo.tituloCurto ?? passo.titulo
        const aberto = abertosPasso.includes(passo.num)
        const rotuloSecao = rotuloPassoNoCapitulo(numeroSecaoFluxo, passo)
        const passoId = idPassoManual(ancoraPrefix, passo.num)
        const estadoPasso: ManualEstadoLeitura = leitura?.isLido(passoId) ? 'lido' : 'nao_lido'
        const temFilhos = (passo.passosFilhos?.length ?? 0) > 0
        const bordaPasso = aninhado
          ? (aberto ? 'rgba(129,140,248,.24)' : 'rgba(148,163,184,.14)')
          : (aberto ? 'rgba(129,140,248,.28)' : 'rgba(148,163,184,.12)')
        const estiloBorda = aninhado ? `1px dashed ${bordaPasso}` : `1px solid ${bordaPasso}`

        return (
          <div
            key={passo.num}
            id={ancoraPassoId}
            style={{
              ...MANUAL_ESTILO_ACORDEON_SECAO,
              scrollMarginTop: MANUAL_SCROLL_MARGEM_TOPO_PX,
              border: estiloBorda,
              borderRadius: raioCard,
              overflow: 'hidden',
              transition: 'border-color .2s',
            }}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: gapCabecalho,
                padding: paddingCabecalho,
                color: 'var(--ws-text, #f1f5f9)',
                background: aberto ? 'rgba(99,102,241,.08)' : 'rgba(148,163,184,.04)',
                transition: 'background .15s',
              }}
            >
              <button
                type="button"
                onClick={() => ctx.toggle(ancoraPrefix, passo.num)}
                aria-expanded={aberto}
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'inherit',
                  background: 'transparent',
                  padding: 0,
                }}
              >
                <span style={{
                  ...MANUAL_ESTILO_SECAO_NUMERO,
                  minWidth: aninhado ? 56 : 36,
                  fontSize: aninhado ? '.72rem' : '.78rem',
                  color: aberto ? '#a5b4fc' : '#818cf8',
                }}>
                  {rotuloSecao}
                </span>
                <span style={{ flex: 1, minWidth: 0, fontWeight: 600, fontSize: aninhado ? '.82rem' : '.86rem', lineHeight: 1.35, opacity: estadoPasso === 'lido' ? 0.65 : 1 }}>
                  {rotuloCurto}
                </span>
                {passo.badgeEmDesenvolvimento ? <ManualTagEmBreve compact /> : null}
              </button>
              {leitura?.ativo && (
                <ManualBotaoMarcarLido
                  estado={estadoPasso}
                  onToggle={() => leitura.togglePasso(passoId)}
                  rotulo={rotuloCurto}
                />
              )}
              <button
                type="button"
                onClick={() => ctx.toggle(ancoraPrefix, passo.num)}
                aria-label={aberto ? `Recolher ${rotuloCurto}` : `Expandir ${rotuloCurto}`}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 2,
                  display: 'inline-flex',
                  flexShrink: 0,
                }}
              >
                <CaretDown
                  size={14}
                  weight="bold"
                  color="#818cf8"
                  style={{
                    transform: aberto ? 'rotate(180deg)' : 'rotate(-90deg)',
                    transition: 'transform .2s',
                  }}
                />
              </button>
            </div>
            {aberto && (
              <div style={{
                padding: `${MANUAL_ESPACO_ENTRE_PASSOS_PX}px 20px ${MANUAL_ESPACO_ENTRE_PASSOS_PX + 4}px`,
                borderTop: '1px solid rgba(148,163,184,.1)',
              }}>
                <ManualBlocoPassoVisual
                  {...propsPasso(passo)}
                  ocultarRotuloPasso
                  emAcordeaoSubtopico
                />
                <ManualInfograficoPermissoesUsuarioEmbutido fluxo={fluxo} aposPassoNum={passo.num} />
                {temFilhos && (
                  <ManualPassosSubtopicosAcordeaoNivel
                    passos={passo.passosFilhos!}
                    ancoraPrefix={ancoraPrefix}
                    numeroSecaoFluxo={numeroSecaoFluxo}
                    fluxo={fluxo}
                    propsPasso={propsPasso}
                    profundidade={profundidade + 1}
                  />
                )}
              </div>
            )}
          </div>
        )
      })

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: gapIrmaos,
      ...estiloArvoreSubtopicosAninhados(profundidade),
    }}>
      {itens}
    </div>
  )
}

function ManualMiniStepperWizard({
  etapas,
  etapaAtiva,
}: {
  etapas: DocWizardEtapa[]
  etapaAtiva: number
}) {
  if (etapas.length === 0) return null

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
      padding: '10px 14px',
      borderRadius: 10,
      border: '1px solid rgba(129,140,248,.22)',
      background: 'linear-gradient(90deg, rgba(99,102,241,.08) 0%, rgba(148,163,184,.03) 100%)',
    }}>
      {etapas.map((etapa, indice) => {
        const ativa = etapa.numero === etapaAtiva
        const concluida = etapa.numero < etapaAtiva
        return (
          <React.Fragment key={etapa.numero}>
            {indice > 0 ? (
              <span style={{
                color: concluida || ativa ? 'rgba(129,140,248,.45)' : 'rgba(100,116,139,.35)',
                fontSize: '.7rem',
                userSelect: 'none',
              }}>
                ·
              </span>
            ) : null}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              fontSize: '.7rem',
              lineHeight: 1.2,
              fontWeight: ativa ? 700 : 500,
              color: ativa ? '#e0e7ff' : concluida ? '#94a3b8' : '#64748b',
            }}>
              <span style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '.62rem',
                fontWeight: 800,
                letterSpacing: 0,
                background: ativa
                  ? 'linear-gradient(135deg, #6366f1, #818cf8)'
                  : concluida
                    ? 'rgba(99,102,241,.18)'
                    : 'transparent',
                border: ativa
                  ? 'none'
                  : concluida
                    ? '1px solid rgba(129,140,248,.35)'
                    : '1px solid rgba(148,163,184,.3)',
                color: ativa ? '#fff' : concluida ? '#a5b4fc' : '#64748b',
                boxShadow: ativa ? '0 0 0 3px rgba(99,102,241,.18)' : undefined,
              }}>
                {ativa ? '●' : etapa.numero}
              </span>
              {etapa.rotulo}
            </span>
          </React.Fragment>
        )
      })}
    </div>
  )
}

type GaleriaComparacaoAposImagemPasso = NonNullable<DocPassoVisual['galeriaComparacaoAposImagem']>[number]

/** Galeria de um único print — ritmo Academy via `.uni-player-aula__figura` (12px entre screenshots). */
function ehGaleriaComparacaoPassoAcademySimples(galeria: GaleriaComparacaoAposImagemPasso): boolean {
  if ((galeria.colunas ?? 1) !== 1) return false
  if (galeria.telas.length !== 1) return false
  if (galeria.tituloEtapa?.trim()) return false
  if (galeria.textoIntro?.trim()) return false
  if (galeria.chipBidFreteTokenNaoUtilizado || galeria.chipBidFreteTokenUtilizado) return false
  if (galeria.colunasGradeTemplate) return false
  if (galeria.gradeTelasMesmaAltura) return false
  return true
}

function ManualGaleriaComparacaoAposImagemAcademy({
  galeria,
}: {
  galeria: GaleriaComparacaoAposImagemPasso
}) {
  const tela = galeria.telas[0]!
  return (
    <>
      <ManualFiguraScreenshot
        src={tela.imagem}
        alt={tela.legenda || ''}
        larguraTotal
        className="uni-player-aula__figura"
        semSombraExterna
      />
      {galeria.calloutApos ? (
        <div className="uni-player-aula__passo-callouts">
          <ManualCalloutBloco callout={galeria.calloutApos} marginTop={0} />
        </div>
      ) : null}
    </>
  )
}

function ManualBlocoPassoVisual({
  passo,
  ocultarRotuloPasso = false,
  ocultarTituloPasso: ocultarTituloPassoProp = false,
  emAcordeaoSubtopico = false,
  emGradeCenarios = false,
  cenarioParte = 'completo',
  prefixoPasso,
  ancoraPassoId,
  wizardEtapas,
}: {
  passo: DocPassoVisual
  ocultarRotuloPasso?: boolean
  ocultarTituloPasso?: boolean
  emAcordeaoSubtopico?: boolean
  emGradeCenarios?: boolean
  /** Com grade lado a lado + imagens alinhadas: `texto` ou `figuras` em linhas separadas. */
  cenarioParte?: 'completo' | 'texto' | 'figuras'
  prefixoPasso?: string
  ancoraPassoId?: string
  wizardEtapas?: DocWizardEtapa[]
}) {
  const semRotuloPasso = ocultarRotuloPasso || passo.ocultarRotuloPasso || passo.estiloTituloWizard === true || emAcordeaoSubtopico
  const ocultarTituloPasso = passo.ocultarTituloPasso || ocultarTituloPassoProp
  const passoAcademyIsolado = ocultarRotuloPasso && ocultarTituloPasso
  const omitirFigurasNoTexto = cenarioParte === 'texto'
  const textoCenariosAlinhados = emGradeCenarios && cenarioParte === 'texto'
  /** §4.02 — intro acima dos cards; parágrafo[0] não repete abaixo do infográfico. */
  const cotacaoAvulsaFormasIntroAntesCards = Boolean(
    passo.mostrarInfograficoBidFreteCotacaoAvulsaFormas
    && (passo.paragrafos?.length ?? 0) > 0,
  )
  const blocoBase: React.CSSProperties = emAcordeaoSubtopico || passoAcademyIsolado
    ? { paddingTop: 0, marginTop: 0 }
    : emGradeCenarios
    ? { paddingTop: 0, marginTop: cenarioParte === 'figuras' ? 0 : 18 }
    : {
      paddingTop: passo.num === 1 ? 8 : MANUAL_ESPACO_ENTRE_PASSOS_PX,
      borderTop: passo.num === 1 ? undefined : '1px solid rgba(148,163,184,.1)',
      marginTop: passo.num === 1 ? 18 : MANUAL_ESPACO_ENTRE_PASSOS_PX,
    }

  const estiloBlocoRaiz: React.CSSProperties = ancoraPassoId && !emAcordeaoSubtopico
    ? { ...blocoBase, scrollMarginTop: MANUAL_SCROLL_MARGEM_TOPO_PX }
    : blocoBase

  const estiloRaizTextoCenarios: React.CSSProperties = textoCenariosAlinhados
    ? { ...estiloBlocoRaiz, height: '100%', display: 'flex', flexDirection: 'column' }
    : estiloBlocoRaiz

  const espacoParagrafoPx = emAcordeaoSubtopico ? MANUAL_ESPACO_PARAGRAFO_ACORDEAO_PX : MANUAL_ESPACO_PARAGRAFO_PX
  const margemParagrafo = (indice: number, total: number, indiceCallout?: number) => {
    if (indiceCallout === indice) return 0
    return indice < total - 1 ? espacoParagrafoPx : 0
  }

  const margemCalloutAposParagrafo = (indiceCallout: number, totalParagrafos: number) => ({
    marginTop: espacoParagrafoPx,
    marginBottom: indiceCallout < totalParagrafos - 1 ? espacoParagrafoPx : 0,
  })

  const calloutsLista = passo.dicaAoLadoImagem || passo.calloutAposImagem
    ? []
    : (passo.callouts ?? (passo.callout ? [passo.callout] : []))

  const blocoCallouts = calloutsLista.map((callout, i) => (
    <ManualCalloutBloco
      key={i}
      callout={callout}
      marginTop={i === 0 ? ((passo.paragrafos?.length ?? 0) > 0 ? MANUAL_ESPACO_PARAGRAFO_PX : 0) : 8}
    />
  ))

  const passoCorpoAcademySubtitulo = Boolean(
    passoAcademyIsolado && passo.rotuloPasso && !passo.rotuloPassoAposGaleriaComparacao,
  )

  const WrapperCorpoSubtituloGuia = ({ children }: { children: React.ReactNode }) => <>{children}</>

  const blocoGaleriasAposParagrafoIndice = (indiceParagrafo: number) => {
    const galeriasParagrafo = galeriaComparacaoAposParagrafoPasso(passo, indiceParagrafo)
    return (
      <>
        {galeriasParagrafo.map((galeria, idxGaleria) => (
          <React.Fragment key={`galeria-${indiceParagrafo}-${idxGaleria}-${galeria.infograficoTransferirResultadoEsperado ?? ''}-${galeria.infograficoConsolidarPasso2Regras ? 'c2' : ''}-${galeria.infograficoConsolidarResultadoEsperado ? 'cr' : ''}-${galeria.telas.map((t) => t.imagem).join('|')}`}>
            <ManualGaleriaComparacaoIntro
              telas={galeria.telas}
              ampliarInferiorDireito={galeria.ampliarInferiorDireito}
              colunas={galeria.colunas}
              colunasGradeTemplate={galeria.colunasGradeTemplate}
              gradeTelasMesmaAltura={galeria.gradeTelasMesmaAltura}
              textoAcimaEstiloCorpo={galeria.textoAcimaEstiloCorpo}
              espacoTextoFiguraPx={galeria.espacoTextoFiguraPx}
              legendaPasso={galeria.legendaPasso}
              pilaresImportarFormas={galeria.pilaresImportarFormas}
              tituloEtapa={galeria.tituloEtapa}
              textoIntro={galeria.textoIntro}
              cenariosAcesso={galeria.cenariosAcesso}
              textoAoLado={galeria.textoAoLado}
              infograficoMapeamentoImportarColunas={galeria.infograficoMapeamentoImportarColunas}
              infograficoTransferirResultadoEsperado={galeria.infograficoTransferirResultadoEsperado}
              infograficoBidFreteNovaCotacaoResultadoEsperado={galeria.infograficoBidFreteNovaCotacaoResultadoEsperado}
              infograficoBidFreteBidPacoteCotacoes={galeria.infograficoBidFreteBidPacoteCotacoes}
              infograficoBidFreteModalOperacaoCampos={galeria.infograficoBidFreteModalOperacaoCampos}
              telasAposInfograficoBidFreteModalOperacaoCampos={galeria.telasAposInfograficoBidFreteModalOperacaoCampos}
              textoAposInfograficoBidFreteModalOperacaoCampos={galeria.textoAposInfograficoBidFreteModalOperacaoCampos}
              simuladorBidFreteModalOperacao={galeria.simuladorBidFreteModalOperacao}
              infograficoBidFreteOrigemDestinoCampos={galeria.infograficoBidFreteOrigemDestinoCampos}
              telasAposInfograficoBidFreteOrigemDestinoCampos={galeria.telasAposInfograficoBidFreteOrigemDestinoCampos}
              textoAposInfograficoBidFreteOrigemDestinoCampos={galeria.textoAposInfograficoBidFreteOrigemDestinoCampos}
              calloutEntreTelasAposInfograficoBidFreteOrigemDestinoCampos={galeria.calloutEntreTelasAposInfograficoBidFreteOrigemDestinoCampos}
              textoSecaoDestinoAposCalloutOrigemDestinoBidFrete={galeria.textoSecaoDestinoAposCalloutOrigemDestinoBidFrete}
              telasSecaoDestinoAposCalloutOrigemDestinoBidFrete={galeria.telasSecaoDestinoAposCalloutOrigemDestinoBidFrete}
              calloutEntreTelasSecaoDestinoAposCalloutOrigemDestinoBidFrete={galeria.calloutEntreTelasSecaoDestinoAposCalloutOrigemDestinoBidFrete}
              calloutAposSecaoDestinoOrigemDestinoBidFrete={galeria.calloutAposSecaoDestinoOrigemDestinoBidFrete}
              simuladorBidFreteOrigemDestino={galeria.simuladorBidFreteOrigemDestino}
              infograficoConsolidarPasso2Regras={galeria.infograficoConsolidarPasso2Regras}
              infograficoConsolidarResultadoEsperado={galeria.infograficoConsolidarResultadoEsperado}
              layoutConsolidarResultadoUnificado={galeria.layoutConsolidarResultadoUnificado}
              rotuloConsolidarExemplosPasso2={galeria.rotuloConsolidarExemplosPasso2}
              layoutConsolidarExemplosPasso2={galeria.layoutConsolidarExemplosPasso2}
              infograficoEdicaoMassaPasso1Regras={galeria.infograficoEdicaoMassaPasso1Regras}
              mostrarCatalogoEdicaoMassaPedidoLista={galeria.mostrarCatalogoEdicaoMassaPedidoLista}
              infograficoEdicaoMassaPasso2Regras={galeria.infograficoEdicaoMassaPasso2Regras}
              infograficoEdicaoMassaResultadoEsperado={galeria.infograficoEdicaoMassaResultadoEsperado}
              rotuloEdicaoMassaExemplosPasso1={galeria.rotuloEdicaoMassaExemplosPasso1}
              rotuloEdicaoMassaExemplosPasso2={galeria.rotuloEdicaoMassaExemplosPasso2}
              layoutEdicaoMassaExemplosPasso1={galeria.layoutEdicaoMassaExemplosPasso1}
              layoutEdicaoMassaExemplosPasso2={galeria.layoutEdicaoMassaExemplosPasso2}
              layoutPrimeiroPrintLarguraTotal={galeria.layoutPrimeiroPrintLarguraTotal}
              layoutPrimeirosPrintsLarguraTotal={galeria.layoutPrimeirosPrintsLarguraTotal}
              layoutCardInsightGradePedido={galeria.layoutCardInsightGradePedido}
              mostrarChipsTransferirTresTipos={galeria.mostrarChipsTransferirTresTipos}
              chipTransferirTituloEtapa={galeria.chipTransferirTituloEtapa}
              mostrarChipsBidFreteModalTransporte={galeria.mostrarChipsBidFreteModalTransporte}
              chipsBidFreteModalTransporteAoLadoTitulo={galeria.chipsBidFreteModalTransporteAoLadoTitulo}
              iconesEscopoBidFrete={galeria.iconesEscopoBidFrete}
              chipBidFreteModalTransporte={galeria.chipBidFreteModalTransporte}
              chipBidFreteFormaManual={galeria.chipBidFreteFormaManual}
              chipBidFreteBid={galeria.chipBidFreteBid}
              mostrarChipsBidFreteTipoCarga={galeria.mostrarChipsBidFreteTipoCarga}
              chipBidFreteTipoCarga={galeria.chipBidFreteTipoCarga}
              calloutApos={galeria.calloutApos}
              mostrarIndicadoresMoverDashboardPedido={galeria.mostrarIndicadoresMoverDashboardPedido}
              mostrarCardsKanbanCabecalhoPedido={galeria.mostrarCardsKanbanCabecalhoPedido}
              espacoSuperiorEtapa={espacoSuperiorAntesTituloEtapaGaleria(galeriasParagrafo, idxGaleria, galeria)}
              espacoInferiorAposEtapaPx={galeria.espacoInferiorAposEtapaPx}
              emAcordeaoSubtopico={emAcordeaoSubtopico}
              passoAcademyGuia={passoAcademyIsolado}
            />
            {passo.mostrarCatalogoDashboardSugestoesPedido
            && passo.catalogoDashboardSugestoesAposGaleriaIndice === idxGaleria ? (
              <ManualPedidoAccordionDashboardSugestoes />
            ) : null}
            {passo.mostrarCatalogoDashboardTiposVisualizacaoPedido
            && passo.catalogoDashboardTiposVisualizacaoAposGaleriaIndice === idxGaleria ? (
              <ManualPedidoAccordionDashboardTiposVisualizacao />
            ) : null}
          </React.Fragment>
        ))}
        {passo.mostrarInfograficoBidFreteNovaCotacaoFluxo
        && passo.bidFreteNovaCotacaoEscopoAposGaleriaParagrafo === indiceParagrafo ? (
          <>
            {passo.textoAntesInfograficoBidFreteNovaCotacaoFluxo ? (
              <ManualParagrafo
                texto={passo.textoAntesInfograficoBidFreteNovaCotacaoFluxo}
                marginBottom={MANUAL_ESPACO_FRASE_IMAGEM_PX}
                alinhamentoAcordeao={emAcordeaoSubtopico}
              />
            ) : null}
            <div style={{
              marginTop: passo.textoAntesInfograficoBidFreteNovaCotacaoFluxo
                ? 0
                : MANUAL_ESPACO_FRASE_IMAGEM_PX,
              marginBottom: MANUAL_ESPACO_IMAGEM_FRASE_PX,
            }}>
              <ManualInfograficoBidFreteNovaCotacaoFluxo />
            </div>
          </>
        ) : null}
        {passo.mostrarLegendaEscopoIconesBidFrete
        && passo.bidFreteNovaCotacaoEscopoAposGaleriaParagrafo === indiceParagrafo ? (
          <>
            {passo.textoAntesLegendaEscopoIconesBidFrete ? (
              <ManualParagrafo
                texto={passo.textoAntesLegendaEscopoIconesBidFrete}
                marginBottom={MANUAL_ESPACO_FRASE_IMAGEM_PX}
                alinhamentoAcordeao={emAcordeaoSubtopico}
              />
            ) : null}
            <ManualBidFreteInfograficoLegendaEscopoIcones />
          </>
        ) : null}
      </>
    )
  }

  const blocoTexto = (
    <div
      className={
        passoCorpoAcademySubtitulo
          ? (passo.destaqueRotuloPassoGuia
            ? 'uni-player-aula__passo-corpo uni-player-aula__passo-corpo--destaque'
            : 'uni-player-aula__passo-corpo')
          : undefined
      }
      style={passoAcademyIsolado ? {
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        ...(textoCenariosAlinhados
          ? { flex: 1, height: '100%', boxSizing: 'border-box' as const, paddingBottom: 8 }
          : {}),
      } : {
        padding: emAcordeaoSubtopico
          ? `${MANUAL_ESPACO_APOS_CABECALHO_ACORDEAO_PX}px 0 0`
          : '2px 0 0 18px',
        borderLeft: emAcordeaoSubtopico ? 'none' : '3px solid rgba(99,102,241,.45)',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        ...(textoCenariosAlinhados
          ? { flex: 1, height: '100%', boxSizing: 'border-box' as const, paddingBottom: 8 }
          : {}),
      }}
    >
      <WrapperCorpoSubtituloGuia>
      {passoAcademyIsolado && passo.rotuloPasso && !passo.rotuloPassoAposGaleriaComparacao ? (
        <div
          className="uni-player-aula__passo-rotulo-linha"
          style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
        >
          <p style={{ ...MANUAL_ESTILO_PASSO_ROTULO, margin: 0 }}>
            {passo.rotuloPasso}
          </p>
          {passo.tagEmConstrucao ? (
            <span className="ws-badge ws-badge-warning">Em construção</span>
          ) : null}
          {passo.tagEmBreve ? (
            <span className="ws-badge ws-badge-warning">Em breve</span>
          ) : null}
        </div>
      ) : null}
      {!semRotuloPasso && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', margin: '0 0 8px' }}>
          <span style={{ ...MANUAL_ESTILO_PASSO_ROTULO, margin: 0 }}>
            {String(passo.num).padStart(2, '0')}
          </span>
          {prefixoPasso && (
            <span style={{
              fontSize: '.62rem',
              fontWeight: 800,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: '#a5b4fc',
              background: 'rgba(99,102,241,.14)',
              border: '1px solid rgba(129,140,248,.3)',
              borderRadius: MANUAL_RAIO_CHIP,
              padding: '3px 10px',
            }}>
              {prefixoPasso}
            </span>
          )}
        </div>
      )}
      {!ocultarTituloPasso && !emAcordeaoSubtopico && (
        passo.estiloTituloWizard && passo.etapaWizard != null && wizardEtapas ? (
          <ManualMiniStepperWizard etapas={wizardEtapas} etapaAtiva={passo.etapaWizard} />
        ) : (
          <>
            {prefixoPasso ? (
              <p style={{ ...MANUAL_ESTILO_PASSO_TITULO, marginBottom: MANUAL_ESPACO_PARAGRAFO_PX + 4 }}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>{prefixoPasso}</span>
                <span style={{ color: '#64748b', margin: '0 6px', fontWeight: 400 }}>—</span>
                <span>{passo.titulo}</span>
              </p>
            ) : (
              <p style={{
                ...MANUAL_ESTILO_PASSO_TITULO,
                marginBottom: passo.mostrarInfograficoPedidoConfiguracoesStatusAdaptacao
                  ? MANUAL_ESPACO_APOS_LINHA_TITULO_GUIA_PX
                  : MANUAL_ESPACO_PARAGRAFO_PX + 4,
              }}>
                {passo.titulo}
              </p>
            )}
          </>
        )
      )}
      {passo.mostrarInfograficoPedidoListaImportarFormas ? (
        <div style={{ marginBottom: MANUAL_ESPACO_ENTRE_PASSOS_PX }}>
          <ManualInfograficoPedidoListaImportarFormas />
        </div>
      ) : null}
      {passo.mostrarInfograficoSmartDocsListaPaineis ? (
        <div style={{ marginBottom: MANUAL_ESPACO_ENTRE_PASSOS_PX }}>
          <ManualInfograficoSmartDocsListaPaineis />
        </div>
      ) : null}
      {passo.badgeEmDesenvolvimento && !emAcordeaoSubtopico ? (
        <ManualBadgeEmDesenvolvimento marginBottom={espacoParagrafoPx} />
      ) : null}
      {cotacaoAvulsaFormasIntroAntesCards ? (() => {
        const figuraIntro = figurasAposParagrafoPasso(passo, 0)[0]
        if (figuraIntro) {
          return (
            <div style={{
              display: 'grid',
              gridTemplateColumns: MANUAL_GRID_TEXTO_IMAGEM,
              gap: 28,
              alignItems: 'start',
              marginBottom: MANUAL_ESPACO_ENTRE_PASSOS_PX,
            }}>
              <ManualParagrafo
                texto={passo.paragrafos![0]}
                alinhamentoAcordeao={emAcordeaoSubtopico}
                marginBottom={0}
              />
              <ManualFiguraScreenshot
                src={figuraIntro.imagem}
                alt={figuraIntro.legenda ?? passo.titulo}
                larguraMaxima={figuraIntro.larguraMaxima}
              />
            </div>
          )
        }
        return (
          <ManualParagrafo
            texto={passo.paragrafos![0]}
            alinhamentoAcordeao={emAcordeaoSubtopico}
            marginBottom={MANUAL_ESPACO_PARAGRAFO_PX}
          />
        )
      })() : null}
      {passo.mostrarInfograficoBidFreteCotacaoAvulsaFormas ? (
        <div style={{
          marginTop: cotacaoAvulsaFormasIntroAntesCards
            ? 0
            : emAcordeaoSubtopico
              ? MANUAL_ESPACO_ANTES_INFOGRAFICO_ACORDEAO_PX
              : MANUAL_ESPACO_ENTRE_PASSOS_PX,
          marginBottom: MANUAL_ESPACO_ENTRE_PASSOS_PX,
        }}>
          <ManualInfograficoBidFreteCotacaoAvulsaFormas />
        </div>
      ) : null}
      {passo.paragrafos?.map((p, i) => {
        const caminhosImportacaoIdx = passo.caminhosImportacaoPlanilhaAposParagrafo ?? 1
        const calloutAntesParagrafoCaminhosImportacao = Boolean(
          passo.mostrarCaminhosImportacaoPlanilhaPedidoLista
          && passo.calloutAposParagrafo?.indice === i
          && caminhosImportacaoIdx === i,
        )
        const calloutBloco = passo.calloutAposParagrafo?.indice === i ? (() => {
          const margens = margemCalloutAposParagrafo(
            i,
            passo.paragrafos?.length ?? 0,
          )
          return (
            <ManualCalloutBloco
              callout={passo.calloutAposParagrafo.callout}
              marginTop={calloutAntesParagrafoCaminhosImportacao
                ? MANUAL_ESPACO_ENTRE_PASSOS_PX
                : margens.marginTop}
              marginBottom={calloutAntesParagrafoCaminhosImportacao
                ? MANUAL_ESPACO_PARAGRAFO_PX
                : margens.marginBottom}
            />
          )
        })() : null

        return (
        <div key={i}>
          {calloutAntesParagrafoCaminhosImportacao ? calloutBloco : null}
          {passo.mostrarCaminhosImportacaoPlanilhaPedidoLista
          && (passo.caminhosImportacaoPlanilhaAposParagrafo ?? 1) === i ? (
            <ManualGaleriaCabecalhoPasso
              legendaPasso="01 · Importar via planilha"
              pilaresImportarFormas={['01']}
            />
          ) : null}
          {!(cotacaoAvulsaFormasIntroAntesCards && i === 0) ? (
            <ManualParagrafo
              texto={p}
              alinhamentoAcordeao={emAcordeaoSubtopico}
              marginBottom={margemParagrafo(
                i,
                passo.paragrafos?.length ?? 0,
                passo.calloutAposParagrafo?.indice,
              )}
            />
          ) : null}
          {passo.mostrarIndicadorCursorVisualizacao
          && (passo.indicadorCursorVisualizacaoAposParagrafo ?? 1) === i ? (
            <ManualIndicadorCursorVisualizacao />
          ) : null}
          {!calloutAntesParagrafoCaminhosImportacao ? calloutBloco : null}
          {omitirFigurasNoTexto
          || (cotacaoAvulsaFormasIntroAntesCards && i === 0)
            ? null
            : figurasAposParagrafoPasso(passo, i).map((fig) => (
              <div key={fig.imagem} style={{ margin: `${MANUAL_ESPACO_PARAGRAFO_PX}px 0 ${MANUAL_ESPACO_ENTRE_PASSOS_PX}px` }}>
                <ManualFiguraScreenshot
                  src={fig.imagem}
                  alt={fig.legenda ?? passo.titulo}
                  larguraMaxima={fig.larguraMaxima}
                />
              </div>
            ))}
          {passo.mostrarCatalogoColunasPedidoLista
          && (passo.catalogoColunasPedidoAposParagrafo ?? 0) === i ? (
            <ManualPedidoTabelaCatalogoColunasLista />
          ) : null}
          {passo.mostrarCatalogoHistoricoPedido
          && (passo.catalogoHistoricoPedidoAposParagrafo ?? 0) === i ? (
            <ManualPedidoCatalogoHistoricoEventos />
          ) : null}
          {passo.mostrarFormatosExportacaoPedidoLista
          && (passo.formatosExportacaoPedidoAposParagrafo ?? 1) === i ? (
            <ManualPedidoFormatosExportacaoLista />
          ) : null}
          {passo.mostrarCaminhosImportacaoPlanilhaPedidoLista
          && (passo.caminhosImportacaoPlanilhaAposParagrafo ?? 1) === i ? (
            <>
              <ManualPedidoCaminhosImportacaoPlanilha />
              {(passo.galeriaComparacaoAposCaminhosImportacao ?? []).map((galeria) => (
                <ManualGaleriaComparacaoIntro
                  key={galeria.telas.map((t) => t.imagem).join('|')}
                  telas={galeria.telas}
                  ampliarInferiorDireito={galeria.ampliarInferiorDireito}
                  colunas={galeria.colunas}
                  textoAcimaEstiloCorpo={galeria.textoAcimaEstiloCorpo}
                  legendaPasso={galeria.legendaPasso}
                  pilaresImportarFormas={galeria.pilaresImportarFormas}
                  tituloEtapa={galeria.tituloEtapa}
                  textoIntro={galeria.textoIntro}
                  textoAoLado={galeria.textoAoLado}
                  infograficoMapeamentoImportarColunas={galeria.infograficoMapeamentoImportarColunas}
                  infograficoTransferirResultadoEsperado={galeria.infograficoTransferirResultadoEsperado}
                  infograficoBidFreteNovaCotacaoResultadoEsperado={galeria.infograficoBidFreteNovaCotacaoResultadoEsperado}
                  infograficoBidFreteBidPacoteCotacoes={galeria.infograficoBidFreteBidPacoteCotacoes}
                  infograficoBidFreteModalOperacaoCampos={galeria.infograficoBidFreteModalOperacaoCampos}
                  telasAposInfograficoBidFreteModalOperacaoCampos={galeria.telasAposInfograficoBidFreteModalOperacaoCampos}
                  textoAposInfograficoBidFreteModalOperacaoCampos={galeria.textoAposInfograficoBidFreteModalOperacaoCampos}
                  infograficoBidFreteOrigemDestinoCampos={galeria.infograficoBidFreteOrigemDestinoCampos}
                  telasAposInfograficoBidFreteOrigemDestinoCampos={galeria.telasAposInfograficoBidFreteOrigemDestinoCampos}
                  textoAposInfograficoBidFreteOrigemDestinoCampos={galeria.textoAposInfograficoBidFreteOrigemDestinoCampos}
                  calloutEntreTelasAposInfograficoBidFreteOrigemDestinoCampos={galeria.calloutEntreTelasAposInfograficoBidFreteOrigemDestinoCampos}
                  textoSecaoDestinoAposCalloutOrigemDestinoBidFrete={galeria.textoSecaoDestinoAposCalloutOrigemDestinoBidFrete}
                  telasSecaoDestinoAposCalloutOrigemDestinoBidFrete={galeria.telasSecaoDestinoAposCalloutOrigemDestinoBidFrete}
                  calloutEntreTelasSecaoDestinoAposCalloutOrigemDestinoBidFrete={galeria.calloutEntreTelasSecaoDestinoAposCalloutOrigemDestinoBidFrete}
                  calloutAposSecaoDestinoOrigemDestinoBidFrete={galeria.calloutAposSecaoDestinoOrigemDestinoBidFrete}
                  infograficoConsolidarPasso2Regras={galeria.infograficoConsolidarPasso2Regras}
                  infograficoConsolidarResultadoEsperado={galeria.infograficoConsolidarResultadoEsperado}
                  layoutConsolidarResultadoUnificado={galeria.layoutConsolidarResultadoUnificado}
                  rotuloConsolidarExemplosPasso2={galeria.rotuloConsolidarExemplosPasso2}
                  layoutConsolidarExemplosPasso2={galeria.layoutConsolidarExemplosPasso2}
                  infograficoEdicaoMassaPasso1Regras={galeria.infograficoEdicaoMassaPasso1Regras}
                  mostrarCatalogoEdicaoMassaPedidoLista={galeria.mostrarCatalogoEdicaoMassaPedidoLista}
                  infograficoEdicaoMassaPasso2Regras={galeria.infograficoEdicaoMassaPasso2Regras}
                  infograficoEdicaoMassaResultadoEsperado={galeria.infograficoEdicaoMassaResultadoEsperado}
                  rotuloEdicaoMassaExemplosPasso1={galeria.rotuloEdicaoMassaExemplosPasso1}
                  rotuloEdicaoMassaExemplosPasso2={galeria.rotuloEdicaoMassaExemplosPasso2}
                  layoutEdicaoMassaExemplosPasso1={galeria.layoutEdicaoMassaExemplosPasso1}
                  layoutEdicaoMassaExemplosPasso2={galeria.layoutEdicaoMassaExemplosPasso2}
                  layoutPrimeiroPrintLarguraTotal={galeria.layoutPrimeiroPrintLarguraTotal}
                  layoutPrimeirosPrintsLarguraTotal={galeria.layoutPrimeirosPrintsLarguraTotal}
                  layoutCardInsightGradePedido={galeria.layoutCardInsightGradePedido}
                  calloutApos={galeria.calloutApos}
                  emAcordeaoSubtopico={emAcordeaoSubtopico}
                />
              ))}
            </>
          ) : null}
          {passo.mostrarFormatosImportacaoPedidoLista
          && (passo.formatosImportacaoPedidoAposParagrafo ?? 1) === i ? (
            <ManualPedidoFormatosImportacaoLista />
          ) : null}
          {passo.mostrarInfograficoPedidoListaTransferirFluxo
          && (passo.transferirInfograficoAposParagrafo ?? 1) === i ? (
            <ManualInfograficoPedidoListaTransferirFluxo />
          ) : null}
          {passo.mostrarInfograficoBidFreteNovaCotacaoFluxo
          && passo.bidFreteNovaCotacaoEscopoAposGaleriaParagrafo !== i
          && (passo.bidFreteNovaCotacaoInfograficoAposParagrafo ?? 1) === i ? (
            <div style={{
              marginTop: emAcordeaoSubtopico
                ? MANUAL_ESPACO_ANTES_INFOGRAFICO_ACORDEAO_PX
                : MANUAL_ESPACO_ENTRE_PASSOS_PX,
              marginBottom: MANUAL_ESPACO_ENTRE_PASSOS_PX,
            }}>
              <ManualInfograficoBidFreteNovaCotacaoFluxo />
            </div>
          ) : null}
          {passo.mostrarInfograficoBidFreteCotacaoAvulsaVsBid
          && (passo.bidFreteCotacaoAvulsaVsBidInfograficoAposParagrafo ?? 0) === i ? (
            <div style={{
              marginTop: emAcordeaoSubtopico
                ? MANUAL_ESPACO_ANTES_INFOGRAFICO_ACORDEAO_PX
                : MANUAL_ESPACO_ENTRE_PASSOS_PX,
              marginBottom: MANUAL_ESPACO_ENTRE_PASSOS_PX,
            }}>
              <ManualInfograficoBidFreteCotacaoAvulsaVsBid />
            </div>
          ) : null}
          {passo.mostrarInfograficoBidFreteCotacaoAvulsaFormas
          && !cotacaoAvulsaFormasIntroAntesCards
          && (passo.bidFreteCotacaoAvulsaFormasInfograficoAposParagrafo ?? 0) === i ? (
            <div style={{
              marginTop: emAcordeaoSubtopico
                ? MANUAL_ESPACO_ANTES_INFOGRAFICO_ACORDEAO_PX
                : MANUAL_ESPACO_ENTRE_PASSOS_PX,
              marginBottom: MANUAL_ESPACO_ENTRE_PASSOS_PX,
            }}>
              <ManualInfograficoBidFreteCotacaoAvulsaFormas />
            </div>
          ) : null}
          {passo.barraEscopoBidFrete
          && (passo.barraEscopoBidFreteAposParagrafo
            ?? passo.bidFreteNovaCotacaoInfograficoAposParagrafo
            ?? 1) === i ? (
            <ManualBidFreteBarraEscopo config={passo.barraEscopoBidFrete} />
          ) : null}
          {passo.mostrarLegendaEscopoIconesBidFrete
          && passo.bidFreteNovaCotacaoEscopoAposGaleriaParagrafo !== i
          && (passo.legendaEscopoIconesBidFreteAposParagrafo
            ?? passo.bidFreteNovaCotacaoInfograficoAposParagrafo
            ?? 1) === i ? (
            <ManualBidFreteInfograficoLegendaEscopoIcones />
          ) : null}
          {(() => {
            if (passoCorpoAcademySubtitulo) return null
            return blocoGaleriasAposParagrafoIndice(i)
          })()}
        </div>
        )
      })}
      {passo.mostrarInfograficoPedidoConfiguracoesColunasAdaptacao ? (
        <div style={{ marginBottom: MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX }}>
          <ManualInfograficoPedidoConfiguracoesColunasAdaptacao />
        </div>
      ) : null}
      {passo.mostrarInfograficoPedidoConfiguracoesStatusAdaptacao ? (
        <div style={{ marginBottom: MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX }}>
          <ManualInfograficoPedidoConfiguracoesStatusAdaptacao />
        </div>
      ) : null}
      {(passo.paragrafos?.length ?? 0) === 0 && passo.mostrarInfograficoBidFreteNovaCotacaoFluxo ? (
        <div style={{ marginBottom: MANUAL_ESPACO_ENTRE_PASSOS_PX }}>
          <ManualInfograficoBidFreteNovaCotacaoFluxo />
        </div>
      ) : null}
      {(passo.paragrafos?.length ?? 0) === 0
        && !passoCorpoAcademySubtitulo
        ? (() => {
          const galeriasSemParagrafo = galeriaComparacaoAposParagrafoPasso(passo, 0)
          return galeriasSemParagrafo.map((galeria, idxGaleria) => (
            <ManualGaleriaComparacaoIntro
              key={`galeria-sem-par-${idxGaleria}-${galeria.infograficoBidFreteNovaCotacaoResultadoEsperado ? 'res' : ''}-${galeria.telas.map((t) => t.imagem).join('|')}`}
              telas={galeria.telas}
              ampliarInferiorDireito={galeria.ampliarInferiorDireito}
              colunas={galeria.colunas}
              textoAcimaEstiloCorpo={galeria.textoAcimaEstiloCorpo}
              legendaPasso={galeria.legendaPasso}
              pilaresImportarFormas={galeria.pilaresImportarFormas}
              tituloEtapa={galeria.tituloEtapa}
              textoIntro={galeria.textoIntro}
              cenariosAcesso={galeria.cenariosAcesso}
              textoAoLado={galeria.textoAoLado}
              infograficoMapeamentoImportarColunas={galeria.infograficoMapeamentoImportarColunas}
              infograficoTransferirResultadoEsperado={galeria.infograficoTransferirResultadoEsperado}
              infograficoBidFreteNovaCotacaoResultadoEsperado={galeria.infograficoBidFreteNovaCotacaoResultadoEsperado}
              infograficoBidFreteBidPacoteCotacoes={galeria.infograficoBidFreteBidPacoteCotacoes}
              infograficoBidFreteModalOperacaoCampos={galeria.infograficoBidFreteModalOperacaoCampos}
              telasAposInfograficoBidFreteModalOperacaoCampos={galeria.telasAposInfograficoBidFreteModalOperacaoCampos}
              textoAposInfograficoBidFreteModalOperacaoCampos={galeria.textoAposInfograficoBidFreteModalOperacaoCampos}
              simuladorBidFreteModalOperacao={galeria.simuladorBidFreteModalOperacao}
              infograficoBidFreteOrigemDestinoCampos={galeria.infograficoBidFreteOrigemDestinoCampos}
              telasAposInfograficoBidFreteOrigemDestinoCampos={galeria.telasAposInfograficoBidFreteOrigemDestinoCampos}
              textoAposInfograficoBidFreteOrigemDestinoCampos={galeria.textoAposInfograficoBidFreteOrigemDestinoCampos}
              calloutEntreTelasAposInfograficoBidFreteOrigemDestinoCampos={galeria.calloutEntreTelasAposInfograficoBidFreteOrigemDestinoCampos}
              textoSecaoDestinoAposCalloutOrigemDestinoBidFrete={galeria.textoSecaoDestinoAposCalloutOrigemDestinoBidFrete}
              telasSecaoDestinoAposCalloutOrigemDestinoBidFrete={galeria.telasSecaoDestinoAposCalloutOrigemDestinoBidFrete}
              calloutEntreTelasSecaoDestinoAposCalloutOrigemDestinoBidFrete={galeria.calloutEntreTelasSecaoDestinoAposCalloutOrigemDestinoBidFrete}
              calloutAposSecaoDestinoOrigemDestinoBidFrete={galeria.calloutAposSecaoDestinoOrigemDestinoBidFrete}
              simuladorBidFreteOrigemDestino={galeria.simuladorBidFreteOrigemDestino}
              mostrarChipsTransferirTresTipos={galeria.mostrarChipsTransferirTresTipos}
              chipTransferirTituloEtapa={galeria.chipTransferirTituloEtapa}
              mostrarChipsBidFreteModalTransporte={galeria.mostrarChipsBidFreteModalTransporte}
              chipsBidFreteModalTransporteAoLadoTitulo={galeria.chipsBidFreteModalTransporteAoLadoTitulo}
              iconesEscopoBidFrete={galeria.iconesEscopoBidFrete}
              chipBidFreteModalTransporte={galeria.chipBidFreteModalTransporte}
              chipBidFreteFormaManual={galeria.chipBidFreteFormaManual}
              chipBidFreteBid={galeria.chipBidFreteBid}
              mostrarChipsBidFreteTipoCarga={galeria.mostrarChipsBidFreteTipoCarga}
              chipBidFreteTipoCarga={galeria.chipBidFreteTipoCarga}
              calloutApos={galeria.calloutApos}
              espacoSuperiorEtapa={espacoSuperiorAntesTituloEtapaGaleria(galeriasSemParagrafo, idxGaleria, galeria)}
              espacoInferiorAposEtapaPx={galeria.espacoInferiorAposEtapaPx}
              emAcordeaoSubtopico={emAcordeaoSubtopico}
            />
          ))
        })()
        : null}
      {passo.linkCapitulo && (
        <p style={{ marginTop: 12, marginBottom: 0 }}>
          <Link to={passo.linkCapitulo.href} style={MANUAL_LINK_STYLE}>
            {passo.linkCapitulo.texto}
          </Link>
        </p>
      )}
      {passo.tooltipsKpi && passo.tooltipsKpi.length > 0 && !passo.tooltipsKpiAposImagem && (
        <ManualTooltipsKpi tooltips={passo.tooltipsKpi} />
      )}
      {(passo.dicaAoLadoImagem
        ? (passo.callouts ?? [])
        : []
      ).map((callout, i) => (
        <ManualCalloutBloco key={i} callout={callout} marginTop={i === 0 ? 12 : 8} />
      ))}
      {passo.mostrarCatalogoDashboardSugestoesPedido
      && passo.catalogoDashboardSugestoesAposGaleriaIndice == null ? (
        <ManualPedidoAccordionDashboardSugestoes />
      ) : null}
      {passo.mostrarCatalogoDashboardTiposVisualizacaoPedido
      && passo.catalogoDashboardTiposVisualizacaoAposGaleriaIndice == null ? (
        <ManualPedidoAccordionDashboardTiposVisualizacao />
      ) : null}
      {!passo.calloutAoLadoTexto && blocoCallouts}
      </WrapperCorpoSubtituloGuia>
      {passoCorpoAcademySubtitulo ? (
        <div className="uni-player-aula__passo-galeria">
          {(passo.paragrafos ?? []).map((_, indiceParagrafo) => (
            <React.Fragment key={`galeria-subtitulo-par-${indiceParagrafo}`}>
              {blocoGaleriasAposParagrafoIndice(indiceParagrafo)}
            </React.Fragment>
          ))}
          {(passo.paragrafos?.length ?? 0) === 0
            ? galeriaComparacaoAposParagrafoPasso(passo, 0).map((galeria, idxGaleria) => (
              <ManualGaleriaComparacaoIntro
                key={`galeria-sem-par-${idxGaleria}-${galeria.infograficoBidFreteNovaCotacaoResultadoEsperado ? 'res' : ''}-${galeria.telas.map((t) => t.imagem).join('|')}`}
                telas={galeria.telas}
                ampliarInferiorDireito={galeria.ampliarInferiorDireito}
                colunas={galeria.colunas}
                textoAcimaEstiloCorpo={galeria.textoAcimaEstiloCorpo}
                legendaPasso={galeria.legendaPasso}
                pilaresImportarFormas={galeria.pilaresImportarFormas}
                tituloEtapa={galeria.tituloEtapa}
                textoIntro={galeria.textoIntro}
                cenariosAcesso={galeria.cenariosAcesso}
                textoAoLado={galeria.textoAoLado}
                infograficoMapeamentoImportarColunas={galeria.infograficoMapeamentoImportarColunas}
                infograficoTransferirResultadoEsperado={galeria.infograficoTransferirResultadoEsperado}
                infograficoBidFreteNovaCotacaoResultadoEsperado={galeria.infograficoBidFreteNovaCotacaoResultadoEsperado}
                infograficoBidFreteBidPacoteCotacoes={galeria.infograficoBidFreteBidPacoteCotacoes}
                infograficoBidFreteModalOperacaoCampos={galeria.infograficoBidFreteModalOperacaoCampos}
                telasAposInfograficoBidFreteModalOperacaoCampos={galeria.telasAposInfograficoBidFreteModalOperacaoCampos}
                textoAposInfograficoBidFreteModalOperacaoCampos={galeria.textoAposInfograficoBidFreteModalOperacaoCampos}
                simuladorBidFreteModalOperacao={galeria.simuladorBidFreteModalOperacao}
                infograficoBidFreteOrigemDestinoCampos={galeria.infograficoBidFreteOrigemDestinoCampos}
                telasAposInfograficoBidFreteOrigemDestinoCampos={galeria.telasAposInfograficoBidFreteOrigemDestinoCampos}
                textoAposInfograficoBidFreteOrigemDestinoCampos={galeria.textoAposInfograficoBidFreteOrigemDestinoCampos}
                calloutEntreTelasAposInfograficoBidFreteOrigemDestinoCampos={galeria.calloutEntreTelasAposInfograficoBidFreteOrigemDestinoCampos}
                textoSecaoDestinoAposCalloutOrigemDestinoBidFrete={galeria.textoSecaoDestinoAposCalloutOrigemDestinoBidFrete}
                telasSecaoDestinoAposCalloutOrigemDestinoBidFrete={galeria.telasSecaoDestinoAposCalloutOrigemDestinoBidFrete}
                calloutEntreTelasSecaoDestinoAposCalloutOrigemDestinoBidFrete={galeria.calloutEntreTelasSecaoDestinoAposCalloutOrigemDestinoBidFrete}
                calloutAposSecaoDestinoOrigemDestinoBidFrete={galeria.calloutAposSecaoDestinoOrigemDestinoBidFrete}
                simuladorBidFreteOrigemDestino={galeria.simuladorBidFreteOrigemDestino}
                mostrarChipsTransferirTresTipos={galeria.mostrarChipsTransferirTresTipos}
                chipTransferirTituloEtapa={galeria.chipTransferirTituloEtapa}
                mostrarChipsBidFreteModalTransporte={galeria.mostrarChipsBidFreteModalTransporte}
                chipsBidFreteModalTransporteAoLadoTitulo={galeria.chipsBidFreteModalTransporteAoLadoTitulo}
                iconesEscopoBidFrete={galeria.iconesEscopoBidFrete}
                chipBidFreteModalTransporte={galeria.chipBidFreteModalTransporte}
                chipBidFreteFormaManual={galeria.chipBidFreteFormaManual}
                chipBidFreteBid={galeria.chipBidFreteBid}
                mostrarChipsBidFreteTipoCarga={galeria.mostrarChipsBidFreteTipoCarga}
                chipBidFreteTipoCarga={galeria.chipBidFreteTipoCarga}
                calloutApos={galeria.calloutApos}
                espacoSuperiorEtapa={espacoSuperiorAntesTituloEtapaGaleria(galeriaComparacaoAposParagrafoPasso(passo, 0), idxGaleria, galeria)}
                espacoInferiorAposEtapaPx={galeria.espacoInferiorAposEtapaPx}
                emAcordeaoSubtopico={emAcordeaoSubtopico}
                passoAcademyGuia={passoAcademyIsolado}
              />
            ))
            : null}
        </div>
      ) : null}
    </div>
  )

  const rodapeDicaImagem = passo.dicaAoLadoImagem ? (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(200px, 34%) minmax(0, 1fr)',
      gap: 20,
      marginTop: 20,
      alignItems: 'start',
    }}>
      <ManualCalloutBloco callout={passo.dicaAoLadoImagem.callout} marginTop={0} />
      <ManualFiguraScreenshot
        src={passo.dicaAoLadoImagem.imagem}
        alt={passo.dicaAoLadoImagem.legenda ?? 'Menu do usuário'}
      />
    </div>
  ) : null

  const gradeColunas = passo.colunasTabela && passo.colunasTabela.length > 0
    ? <ManualColunasTabela colunas={passo.colunasTabela} />
    : null

  const tabelaCatalogoColunasSmartRead = passo.mostrarCatalogoColunasListaSmartRead
    ? <ManualSmartReadTabelaCatalogoColunasLista />
    : null

  const infograficoBidFreteSecaoVisualAcademy = passoAcademyIsolado
    ? (passo.mostrarInfograficoBidFreteMapa
      ? <ManualInfograficoBidFreteMapa />
      : passo.mostrarInfograficoBidFreteFiltrosMapa
        ? <ManualInfograficoBidFreteFiltrosMapa />
        : passo.mostrarInfograficoBidFreteControlesMapa
          ? <ManualInfograficoBidFreteControlesMapa />
          : passo.mostrarInfograficoBidFretePainelCotacao
            ? <ManualInfograficoBidFretePainelCotacao />
            : passo.mostrarInfograficoBidFreteAbasPainelCotacao
              ? <ManualInfograficoBidFreteAbasPainelCotacao />
              : null)
    : null

  const infograficoListaCustomizacao = passo.mostrarInfograficoSmartDocsListaCustomizacao
    ? <ManualInfograficoSmartDocsListaCustomizacao />
    : passo.mostrarInfograficoPedidoListaCustomizacao
      ? <ManualInfograficoPedidoListaCustomizacao />
      : passo.mostrarInfograficoBidFreteMapa
        ? (infograficoBidFreteSecaoVisualAcademy ? null : <ManualInfograficoBidFreteMapa />)
        : passo.mostrarInfograficoBidFretePainelCotacao
          ? (infograficoBidFreteSecaoVisualAcademy ? null : <ManualInfograficoBidFretePainelCotacao />)
          : passo.mostrarInfograficoBidFreteFiltrosMapa
          ? (infograficoBidFreteSecaoVisualAcademy ? null : <ManualInfograficoBidFreteFiltrosMapa />)
          : passo.mostrarInfograficoBidFreteAbasPainelCotacao
            ? (infograficoBidFreteSecaoVisualAcademy ? null : <ManualInfograficoBidFreteAbasPainelCotacao />)
      : passo.mostrarInfograficoBidFreteControlesMapa
        ? (infograficoBidFreteSecaoVisualAcademy ? null : <ManualInfograficoBidFreteControlesMapa />)
        : passo.mostrarInfograficoPedidoFiltrosMapa
          ? <ManualInfograficoPedidoFiltrosMapa />
        : passo.mostrarInfograficoPedidoMapa
          ? (passoAcademyIsolado ? null : <ManualInfograficoPedidoMapa />)
          : passo.mostrarInfograficoPedidoRankingsMapa
            ? <ManualInfograficoPedidoRankingsMapa />
            : passo.mostrarInfograficoPedidoControlesMapa
              ? <ManualInfograficoPedidoControlesMapa />
            : null

  const infograficoCatalogoColunasPedido = passo.mostrarInfograficoPedidoCatalogoColunasLista
    ? <ManualInfograficoPedidoCatalogoColunasLista />
    : null

  const tabelaCatalogoColunasPedido = passo.mostrarInfograficoPedidoCatalogoColunasLista
    ? <ManualPedidoTabelaCatalogoColunasLista />
    : null

  const infograficoListaAlertas = passo.mostrarInfograficoPedidoListaAlertas
    ? <ManualInfograficoPedidoListaAlertas />
    : null

  const tabelaAlertasPedidoLista = passo.mostrarTabelaAlertasPedidoLista
    ? <ManualPedidoTabelaAlertasLista />
    : null

  const espacoEntreItensGaleriaPassoPx = passoAcademyIsolado
    ? MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX
    : MANUAL_ESPACO_ENTRE_PASSOS_PX

  const galeriaAposTabela = passo.galeriaTelasAposTabela?.length ? (
    <div style={{ marginTop: passoAcademyIsolado ? 0 : MANUAL_ESPACO_ENTRE_PASSOS_PX }}>
      {passo.galeriaTelasAposTabela.map((tela, indiceGaleria) => (
        <div
          key={tela.imagem ?? `${tela.legenda}-${indiceGaleria}`}
          style={{ marginTop: indiceGaleria === 0 ? 0 : espacoEntreItensGaleriaPassoPx }}
        >
          <ManualGaleriaTelaCelula tela={tela} />
        </div>
      ))}
    </div>
  ) : null

  const subsecaoAposGaleriaTabela = passo.subsecaoAposGaleriaTabela ? (
    <div
      style={{ marginTop: passo.galeriaTelasAposTabela?.length
        ? espacoEntreItensGaleriaPassoPx
        : (passoAcademyIsolado ? 0 : MANUAL_ESPACO_ENTRE_PASSOS_PX) }}
    >
      {passoAcademyIsolado ? (
        <div
          className="uni-player-aula__passo-corpo"
          style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}
        >
          <div
            className="uni-player-aula__passo-rotulo-linha"
            style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
          >
            <p style={{ ...MANUAL_ESTILO_PASSO_ROTULO, margin: 0 }}>
              {passo.subsecaoAposGaleriaTabela.rotuloPasso}
            </p>
          </div>
          {passo.subsecaoAposGaleriaTabela.paragrafos.map((p, i, arr) => (
            <ManualParagrafo
              key={p}
              texto={p}
              marginBottom={i < arr.length - 1 ? espacoParagrafoPx : 0}
            />
          ))}
        </div>
      ) : (
        <>
          <p style={{ ...MANUAL_ESTILO_PASSO_TITULO, marginBottom: MANUAL_ESPACO_PARAGRAFO_PX + 4 }}>
            {passo.subsecaoAposGaleriaTabela.rotuloPasso}
          </p>
          {passo.subsecaoAposGaleriaTabela.paragrafos.map((p, i, arr) => (
            <ManualParagrafo
              key={p}
              texto={p}
              marginBottom={i < arr.length - 1 ? espacoParagrafoPx : 0}
            />
          ))}
        </>
      )}
      {passo.subsecaoAposGaleriaTabela.mostrarInfograficoPedidoControlesMapa ? (
        <div style={{ marginTop: MANUAL_ESPACO_ENTRE_PASSOS_PX }}>
          <ManualInfograficoPedidoControlesMapa />
        </div>
      ) : null}
      {passo.subsecaoAposGaleriaTabela.galeriaTelas?.length ? (
        <div style={{ marginTop: espacoEntreItensGaleriaPassoPx }}>
          {passo.subsecaoAposGaleriaTabela.galeriaTelas.map((tela, indiceGaleria) => (
            <div
              key={tela.imagem ?? `${tela.legenda}-${indiceGaleria}`}
              style={{ marginTop: indiceGaleria === 0 ? 0 : espacoEntreItensGaleriaPassoPx }}
            >
              <ManualGaleriaTelaCelula tela={tela} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  ) : null

  const paragrafoAposGaleriaTabela = passo.paragrafoAposGaleriaTabela ? (
    <div style={{ marginTop: 20 }}>
      <ManualParagrafo texto={passo.paragrafoAposGaleriaTabela} marginBottom={0} />
    </div>
  ) : null

  const calloutAposGaleriaTabela = passo.calloutAposGaleriaTabela ? (
    <ManualCalloutBloco callout={passo.calloutAposGaleriaTabela} marginTop={24} />
  ) : null

  const calloutAposTabelaColunasPadrao = passo.calloutAposTabelaColunasPadrao ? (
    <ManualCalloutBloco callout={passo.calloutAposTabelaColunasPadrao} marginTop={16} />
  ) : null

  const blocoListaCustomizacao = (infograficoListaCustomizacao || infograficoCatalogoColunasPedido || tabelaCatalogoColunasPedido || infograficoListaAlertas || tabelaAlertasPedidoLista || passo.mostrarTabelaColunasPadraoLista
    || tabelaCatalogoColunasSmartRead || calloutAposTabelaColunasPadrao || galeriaAposTabela || subsecaoAposGaleriaTabela || paragrafoAposGaleriaTabela || calloutAposGaleriaTabela
    || passo.simuladorPedidoFiltrosMapa) ? (
    <>
      {infograficoListaCustomizacao}
      {infograficoCatalogoColunasPedido}
      {tabelaCatalogoColunasPedido}
      {infograficoListaAlertas}
      {tabelaAlertasPedidoLista}
      {gradeColunas}
      {tabelaCatalogoColunasSmartRead}
      {calloutAposTabelaColunasPadrao}
      {galeriaAposTabela}
      {subsecaoAposGaleriaTabela}
      {paragrafoAposGaleriaTabela}
      {calloutAposGaleriaTabela}
      {passo.simuladorPedidoFiltrosMapa ? (
        <div style={{ marginTop: espacoEntreItensGaleriaPassoPx }}>
          <ManualPedidoSimuladorFiltrosMapa />
        </div>
      ) : null}
    </>
  ) : null

  const blocoInfograficoSecaoVisualAcademy = passoAcademyIsolado && (
    passo.mostrarInfograficoPedidoMapa || infograficoBidFreteSecaoVisualAcademy
  ) ? (
    <div className="uni-player-aula__passo-galeria uni-player-aula__passo-galeria--secao-visual">
      {passo.mostrarInfograficoPedidoMapa
        ? <ManualInfograficoPedidoMapa />
        : infograficoBidFreteSecaoVisualAcademy}
    </div>
  ) : null

  const colunaTexto = (
    <>
      {blocoTexto}
      {!passo.imagem && !passo.galeriaTelas?.length && !passo.galeriaComparacao?.length
        ? gradeColunas
        : null}
    </>
  )

  const galeriaComparacao = passo.galeriaComparacao?.length ? (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${Math.min(passo.galeriaComparacao.length, 2)}, minmax(0, 1fr))`,
      gap: 14,
      alignItems: 'start',
    }}>
      {passo.galeriaComparacao.map((tela) => (
        <div key={tela.legenda}>
          <p style={{
            fontSize: '.72rem', fontWeight: 700, color: '#818cf8',
            marginBottom: 8, textAlign: 'center', letterSpacing: '.04em',
          }}>{tela.legenda}</p>
          <ManualFiguraScreenshot src={tela.imagem} alt={tela.legenda} />
        </div>
      ))}
    </div>
  ) : null

  if (passo.imagemAbaixoTexto && passo.imagem) {
    const galeriaAbaixo = passo.galeriaTelas?.length ? (
      <ManualGaleriaTelasBloco
        telas={passo.galeriaTelas}
        fraseAposIndice={passo.galeriaFraseAposIndice}
      />
    ) : null

    const blocoTextoComCallout = passo.calloutAoLadoTexto && calloutsLista.length > 0 ? (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(220px, 38%)',
        gap: 20,
        alignItems: 'center',
      }}>
        {blocoTexto}
        <div>{blocoCallouts}</div>
      </div>
    ) : blocoTexto

    const blocoAposFigura = (
      <>
        {passo.legendaAposImagem ? (
          <div style={{ marginTop: MANUAL_ESPACO_IMAGEM_FRASE_PX }}>
            <ManualGaleriaTelaLegendaStep
              legenda={passo.legendaAposImagem}
              alinhamento={passo.legendaAposImagemAlinhamento ?? 'left'}
            />
          </div>
        ) : null}
        {passo.calloutAposImagem ? (
          passoAcademyIsolado ? (
            <div className="uni-player-aula__passo-callouts">
              {(Array.isArray(passo.calloutAposImagem) ? passo.calloutAposImagem : [passo.calloutAposImagem]).map((callout, idx) => (
                <ManualCalloutBloco
                  key={idx}
                  callout={callout}
                  marginTop={idx === 0 ? 0 : MANUAL_ESPACO_PARAGRAFO_PX}
                />
              ))}
            </div>
          ) : (
            (Array.isArray(passo.calloutAposImagem) ? passo.calloutAposImagem : [passo.calloutAposImagem]).map((callout, idx) => (
              <ManualCalloutBloco
                key={idx}
                callout={callout}
                marginTop={idx === 0 ? MANUAL_ESPACO_IMAGEM_FRASE_PX : MANUAL_ESPACO_PARAGRAFO_PX}
              />
            ))
          )
        ) : null}
        {passo.paragrafosAposImagem && passo.paragrafosAposImagem.length > 0 && (
          <div style={{
            marginTop: passo.calloutAposImagem
              ? MANUAL_ESPACO_PARAGRAFO_PX
              : MANUAL_ESPACO_IMAGEM_FRASE_PX,
          }}>
            {passo.paragrafosAposImagem.map((p, i) => (
              <ManualParagrafo
                key={p}
                texto={p}
                marginBottom={i < passo.paragrafosAposImagem!.length - 1 ? MANUAL_ESPACO_PARAGRAFO_PX : 0}
              />
            ))}
          </div>
        )}
        {passo.mostrarInfograficoListaLeituraSmartReadIntegracaoApiCockpit ? (
          <ManualInfograficoListaLeituraSmartReadIntegracaoApiCockpit />
        ) : null}
        {passo.tooltipsKpiAposImagem && passo.tooltipsKpi && passo.tooltipsKpi.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <ManualTooltipsKpi tooltips={passo.tooltipsKpi} />
          </div>
        )}
        {galeriaAbaixo}
        {passo.galeriaComparacaoAposImagem?.map((galeria, idxGaleria) => {
          const chave = `galeria-apos-img-${idxGaleria}-${galeria.telas.map((t) => t.imagem).join('|')}`
          const rotuloGaleria = galeria.rotuloPasso?.trim()
          const textoIntroGaleria = galeria.textoIntro?.trim()
          const rotuloGaleriaNoPassoCorpo = Boolean(passoAcademyIsolado && rotuloGaleria)
          const blocoRotuloGaleria = rotuloGaleria ? (
            rotuloGaleriaNoPassoCorpo ? (
              <div
                className="uni-player-aula__passo-corpo"
                style={{
                  width: '100%',
                  minWidth: 0,
                  boxSizing: 'border-box',
                  marginTop: idxGaleria > 0 ? MANUAL_ESPACO_ENTRE_PASSOS_PX : undefined,
                }}
              >
                <div
                  className="uni-player-aula__passo-rotulo-linha"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
                >
                  <p style={{ ...MANUAL_ESTILO_PASSO_ROTULO, margin: 0 }}>
                    {rotuloGaleria}
                  </p>
                </div>
                {textoIntroGaleria ? (
                  <ManualParagrafo texto={galeria.textoIntro!} marginBottom={0} />
                ) : null}
              </div>
            ) : (
              <div
                style={{
                  marginTop: idxGaleria > 0 ? MANUAL_ESPACO_ENTRE_PASSOS_PX : undefined,
                  marginBottom: MANUAL_ESPACO_PARAGRAFO_PX,
                }}
              >
                <p style={{ ...MANUAL_ESTILO_PASSO_ROTULO, margin: 0 }}>
                  {rotuloGaleria}
                </p>
                {textoIntroGaleria ? (
                  <ManualParagrafo texto={galeria.textoIntro!} marginBottom={0} />
                ) : null}
              </div>
            )
          ) : null
          if (passoAcademyIsolado && ehGaleriaComparacaoPassoAcademySimples(galeria)) {
            return (
              <React.Fragment key={chave}>
                {blocoRotuloGaleria}
                <ManualGaleriaComparacaoAposImagemAcademy
                  galeria={galeria}
                />
              </React.Fragment>
            )
          }
          const aposTextoPrincipal = Boolean(
            passo.paragrafosAposImagem?.length || passo.calloutAposImagem,
          )
          const ehPrimeiraAposTexto = aposTextoPrincipal && idxGaleria === 0
          const ehSubsecaoComTitulo = Boolean(galeria.tituloEtapa)
          return (
          <React.Fragment key={chave}>
            {blocoRotuloGaleria}
            <div className={rotuloGaleriaNoPassoCorpo ? 'uni-player-aula__passo-galeria' : undefined}>
            <ManualGaleriaComparacaoIntro
            telas={galeria.telas}
            colunas={galeria.colunas ?? 1}
            colunasGradeTemplate={galeria.colunasGradeTemplate}
            gradeTelasMesmaAltura={galeria.gradeTelasMesmaAltura}
            tituloEtapa={galeria.tituloEtapa}
            textoIntro={rotuloGaleriaNoPassoCorpo ? undefined : galeria.textoIntro}
            textoAcimaEstiloCorpo={galeria.textoAcimaEstiloCorpo}
            chipBidFreteTokenNaoUtilizado={galeria.chipBidFreteTokenNaoUtilizado}
            chipBidFreteTokenUtilizado={galeria.chipBidFreteTokenUtilizado}
            calloutApos={galeria.calloutApos}
            margemSuperiorPx={ehPrimeiraAposTexto ? MANUAL_ESPACO_FRASE_IMAGEM_PX : undefined}
            espacoSuperiorEtapa={idxGaleria > 0 && ehSubsecaoComTitulo}
            emAcordeaoSubtopico={emAcordeaoSubtopico}
          />
            </div>
          </React.Fragment>
          )
        })}
        {passoAcademyIsolado && passo.rotuloPassoAposGaleriaComparacao && passo.rotuloPasso ? (
          <div className="uni-player-aula__passo-corpo" style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
            <div
              className="uni-player-aula__passo-rotulo-linha"
              style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
            >
              <p style={{ ...MANUAL_ESTILO_PASSO_ROTULO, margin: 0 }}>
                {passo.rotuloPasso}
              </p>
            </div>
            {(passo.paragrafosAposGaleriaComparacao ?? passo.paragrafos ?? []).map((p, i, arr) => (
              <ManualParagrafo
                key={p}
                texto={p}
                marginBottom={i < arr.length - 1 ? espacoParagrafoPx : 0}
              />
            ))}
          </div>
        ) : null}
        {blocoListaCustomizacao}
      </>
    )

    if (cenarioParte === 'texto') {
      return (
        <div id={ancoraPassoId} style={estiloRaizTextoCenarios}>
          {blocoTextoComCallout}
        </div>
      )
    }

    if (cenarioParte === 'figuras') {
      return (
        <div id={ancoraPassoId} style={estiloBlocoRaiz}>
          <ManualFiguraScreenshot src={passo.imagem} alt={passo.titulo} />
          {blocoAposFigura}
        </div>
      )
    }

    return (
      <div
        id={ancoraPassoId}
        className={passoAcademyIsolado ? 'uni-player-aula__bloco-passo' : undefined}
        style={passoAcademyIsolado ? { margin: 0, padding: 0 } : estiloBlocoRaiz}
      >
        {blocoInfograficoSecaoVisualAcademy}
        {passoAcademyIsolado ? (
          <div className="uni-player-aula__passo-etapa">
            {blocoTextoComCallout}
            <ManualFiguraScreenshot
              src={passo.imagem}
              alt={passo.titulo}
              larguraTotal
              className="uni-player-aula__figura"
              semSombraExterna
            />
            {blocoAposFigura}
          </div>
        ) : (
          <>
            {blocoTextoComCallout}
            <div style={{
              marginTop: emAcordeaoSubtopico
                ? MANUAL_ESPACO_ANTES_IMAGEM_ACORDEAO_PX
                : (calloutsLista.length > 0 ? MANUAL_ESPACO_ENTRE_PASSOS_PX : 20),
            }}>
              <ManualFiguraScreenshot src={passo.imagem} alt={passo.titulo} />
            </div>
            {blocoAposFigura}
          </>
        )}
      </div>
    )
  }

  if (galeriaComparacao) {
    return (
      <div id={ancoraPassoId} style={estiloBlocoRaiz}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 36%) minmax(0, 1fr)',
          gap: 28,
          alignItems: 'start',
        }}>
          {colunaTexto}
          {galeriaComparacao}
        </div>
      </div>
    )
  }

  if (passo.galeriaTelas?.length || (passo.colunasTabela?.length && !passo.imagem)) {
    const galeria = passo.galeriaTelas?.length ? (
      <ManualGaleriaTelasBloco
        telas={passo.galeriaTelas}
        fraseAposIndice={passo.galeriaFraseAposIndice}
      />
    ) : null

    if (passo.imagem) {
      return (
        <div id={ancoraPassoId} style={estiloBlocoRaiz}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(240px, 36%) minmax(0, 1fr)',
            gap: 28,
            alignItems: 'start',
          }}>
            {colunaTexto}
            <ManualFiguraScreenshot src={passo.imagem} alt={passo.titulo} />
          </div>
          {galeria}
        </div>
      )
    }

    return (
      <div id={ancoraPassoId} style={estiloBlocoRaiz}>
        {colunaTexto}
        {galeria}
        {blocoListaCustomizacao}
      </div>
    )
  }

  if (gradeColunas && passo.imagem) {
    return (
      <div id={ancoraPassoId} style={estiloBlocoRaiz}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 36%) minmax(0, 1fr)',
          gap: 28,
          alignItems: 'start',
        }}>
          {blocoTexto}
          <ManualFiguraScreenshot src={passo.imagem} alt={passo.titulo} />
        </div>
        {blocoListaCustomizacao ?? gradeColunas}
      </div>
    )
  }

  if (cenarioParte === 'figuras') {
    const figuras = passo.figurasAposParagrafo ?? []
    return (
      <div id={ancoraPassoId} style={estiloBlocoRaiz}>
        {figuras.map((fig) => (
          <div key={fig.imagem} style={{ margin: 0 }}>
            <ManualFiguraScreenshot
              src={fig.imagem}
              alt={fig.legenda ?? passo.titulo}
              larguraMaxima={fig.larguraMaxima}
            />
          </div>
        ))}
      </div>
    )
  }

  if (cenarioParte === 'texto' && !passo.imagem && !passo.galeriaComparacao?.length && !passo.galeriaTelas?.length) {
    return (
      <div id={ancoraPassoId} style={estiloRaizTextoCenarios}>
        {blocoTexto}
        {blocoListaCustomizacao}
      </div>
    )
  }

  if (!passo.imagem && !passo.galeriaComparacao?.length && !passo.galeriaTelas?.length) {
    return (
      <div
        id={ancoraPassoId}
        className={passoAcademyIsolado ? 'uni-player-aula__bloco-passo' : undefined}
        style={passoAcademyIsolado ? { margin: 0, padding: 0 } : estiloBlocoRaiz}
      >
        {passoAcademyIsolado ? blocoTexto : null}
        {blocoInfograficoSecaoVisualAcademy}
        {passoAcademyIsolado ? null : blocoTexto}
        {blocoListaCustomizacao ? (
          passoAcademyIsolado ? (
            <div className="uni-player-aula__passo-galeria">{blocoListaCustomizacao}</div>
          ) : (
            blocoListaCustomizacao
          )
        ) : null}
        {rodapeDicaImagem}
      </div>
    )
  }

  return (
    <div
      id={ancoraPassoId}
      style={{
      ...estiloBlocoRaiz,
      display: 'grid',
      gridTemplateColumns: MANUAL_GRID_TEXTO_IMAGEM,
      gap: 28,
      alignItems: 'start',
    }}>
      {colunaTexto}
      {passo.imagem && <ManualFiguraScreenshot src={passo.imagem} alt={passo.titulo} />}
    </div>
  )
}

const MANUAL_ESTILO_SECAO_NUMERO: React.CSSProperties = {
  color: '#818cf8', fontSize: '.85rem', fontWeight: 700, flexShrink: 0, minWidth: 28,
}

const MANUAL_SCROLL_MARGEM_TOPO_PX = 32

export const MANUAL_ESTILO_ACORDEON_SECAO: React.CSSProperties = {
  scrollMarginTop: MANUAL_SCROLL_MARGEM_TOPO_PX,
}

function encontrarContainerScrollManual(el: HTMLElement): HTMLElement | null {
  const marcado = document.querySelector<HTMLElement>('[data-manual-scroll-root]')
  if (marcado) return marcado
  let atual: HTMLElement | null = el.parentElement
  while (atual) {
    const { overflowY } = getComputedStyle(atual)
    if (overflowY === 'auto' || overflowY === 'scroll') return atual
    atual = atual.parentElement
  }
  return null
}

/** Rola até seção do manual dentro do container scrollável da University (não o `window`). */
export function rolarParaSecaoManual(idSecao: string, behavior: ScrollBehavior = 'smooth'): boolean {
  const el = document.getElementById(idSecao)
  if (!el) return false
  const container = encontrarContainerScrollManual(el)
  const margem = MANUAL_SCROLL_MARGEM_TOPO_PX
  if (container) {
    const elRect = el.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const top = elRect.top - containerRect.top + container.scrollTop - margem
    const topFinal = Math.max(0, top)
    if (typeof container.scrollTo === 'function') {
      container.scrollTo({ top: topFinal, behavior })
    } else {
      container.scrollTop = topFinal
    }
  } else {
    el.scrollIntoView({ behavior, block: 'start' })
  }
  return true
}

export function useManualSumarioScroll(
  abertos: number[],
  setAbertos: React.Dispatch<React.SetStateAction<number[]>>,
  abrirSubtopico: (prefix: string, num: number) => void = () => {},
  subtopicosAbertos: Record<string, number[]> = {},
  secao?: DocSecao,
) {
  const [pendenteScroll, setPendenteScroll] = useState<{
    secao: number
    elemento?: string
    passo?: { prefix: string; num: number }
  } | null>(null)

  const obterFluxoPorSecao = useCallback((secaoNum: number): DocFluxo | undefined => {
    if (!secao?.fluxos?.length || secaoNum < 2) return undefined
    return secao.fluxos[secaoNum - 2]
  }, [secao])

  const scrollToSecao = useCallback((n: number) => {
    const id = `doc-sec-${n}`
    if (!abertos.includes(n)) {
      setAbertos(prev => (prev.includes(n) ? prev : [...prev, n]))
      setPendenteScroll({ secao: n })
    } else {
      rolarParaSecaoManual(id)
    }
  }, [abertos, setAbertos])

  const scrollToItem = useCallback((item: DocItemSumarioManual) => {
    const n = item.secaoAcordeao
    if (item.elementoScroll) {
      const passo = parseElementoPassoManual(item.elementoScroll)
      if (passo) {
        const fluxo = obterFluxoPorSecao(n)
        if (fluxo?.passosVisuais?.length && fluxo.ancoraPassosPrefix === passo.prefix) {
          abrirCadeiaPassoManual(passo.prefix, fluxo.passosVisuais, passo.num, abrirSubtopico)
        } else {
          abrirSubtopico(passo.prefix, passo.num)
        }
      }
      if (!abertos.includes(n)) {
        setAbertos(prev => (prev.includes(n) ? prev : [...prev, n]))
        setPendenteScroll({ secao: n, elemento: item.elementoScroll, passo: passo ?? undefined })
      } else {
        rolarParaSecaoManual(item.elementoScroll)
      }
      return
    }
    scrollToSecao(n)
  }, [abertos, scrollToSecao, setAbertos, abrirSubtopico, obterFluxoPorSecao])

  useEffect(() => {
    if (pendenteScroll == null || !abertos.includes(pendenteScroll.secao)) return
    if (pendenteScroll.passo) {
      const fluxo = obterFluxoPorSecao(pendenteScroll.secao)
      const passos = fluxo?.passosVisuais ?? []
      const passoAlvo = encontrarPassoPorNum(passos, pendenteScroll.passo.num)
      if (!passoAlvo) return
      const abertosPasso = subtopicosAbertos[pendenteScroll.passo.prefix] ?? []
      const cadeia: number[] = []
      let atual: DocPassoVisual | undefined = passoAlvo
      while (atual) {
        cadeia.unshift(atual.num)
        atual = atual.numPai != null ? encontrarPassoPorNum(passos, atual.numPai) : undefined
      }
      if (!cadeia.every(num => abertosPasso.includes(num))) return
    }
    const id = pendenteScroll.elemento ?? `doc-sec-${pendenteScroll.secao}`
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        rolarParaSecaoManual(id)
        setPendenteScroll(null)
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [abertos, pendenteScroll, subtopicosAbertos, obterFluxoPorSecao])

  return { scrollToSecao, scrollToItem }
}

function figurasAposParagrafoFluxo(
  fluxo: DocFluxo,
  indice: number,
): { imagem: string; legenda?: string }[] {
  return (fluxo.figurasAposParagrafo ?? []).filter((f) => f.indice === indice)
}

function ManualInfograficoPermissoesUsuarioEmbutido({ fluxo, aposPassoNum }: {
  fluxo: DocFluxo
  aposPassoNum: number
}) {
  if (!fluxo.mostrarInfograficoPermissoesUsuario) return null
  if (fluxo.infograficoPermissoesUsuarioAposPasso !== aposPassoNum) return null
  return (
    <div style={{ marginTop: 20, marginBottom: 20 }}>
      <ManualInfograficoPermissoesUsuario />
    </div>
  )
}

export type ModoSecaoFluxoAcademy = 'completo' | 'intro' | 'passo' | 'rodape'

export function ManualSecaoFluxo({
  fluxo,
  numeroSecaoFluxo,
  modo = 'completo',
  passoNum,
}: {
  fluxo: DocFluxo
  numeroSecaoFluxo: number
  /** Academy: fatia intro, um passo ou rodapé em vez do fluxo inteiro em acordeão. */
  modo?: ModoSecaoFluxoAcademy
  passoNum?: number
}) {
  const prefixoPasso = fluxo.prefixoPassosVisuais
  const ancoraPassosPrefix = fluxo.ancoraPassosPrefix

  const propsPasso = (passo: DocPassoVisual) => ({
    passo,
    prefixoPasso,
    wizardEtapas: fluxo.wizardEtapas,
    ancoraPassoId: ancoraPassosPrefix
      ? `manual-passo-${ancoraPassosPrefix}-${passo.num}`
      : undefined,
  })

  const introFluxo = (
    <>
      {fluxo.paragrafos?.map((p, i) => (
        <div key={i}>
          <ManualParagrafo
            texto={p}
            marginBottom={manualMargemParagrafoAntesCallout(
              i,
              fluxo.paragrafos?.length ?? 0,
              fluxo.calloutAposParagrafo?.indice,
            )}
          />
          {fluxo.calloutAposParagrafo?.indice === i && (() => {
            const margens = manualMargemCalloutAposParagrafo(
              i,
              fluxo.paragrafos?.length ?? 0,
            )
            const marginBottomCallout = margens.marginBottom > 0
              ? margens.marginBottom
              : (fluxo.mostrarMapaSubtopicosPassos ? 16 : 0)
            return (
              <ManualCalloutBloco
                callout={fluxo.calloutAposParagrafo.callout}
                marginTop={margens.marginTop}
                marginBottom={marginBottomCallout}
              />
            )
          })()}
          {figurasAposParagrafoFluxo(fluxo, i).map((fig) => (
            <div key={fig.imagem} style={{ margin: `${MANUAL_ESPACO_PARAGRAFO_PX}px 0 ${MANUAL_ESPACO_ENTRE_PASSOS_PX}px` }}>
              <ManualFiguraScreenshot
                src={fig.imagem}
                alt={fig.legenda ?? fluxo.titulo}
                larguraMaxima={fig.larguraMaxima}
              />
            </div>
          ))}
        </div>
      ))}
      {fluxo.callout && !fluxo.calloutAposPassos && (
        <ManualCalloutBloco callout={fluxo.callout} marginTop={12} />
      )}
      {fluxo.mostrarInfograficoPermissoesUsuario && fluxo.infograficoPermissoesUsuarioAposPasso == null && (
        <div style={{ marginTop: 20, marginBottom: 20 }}>
          <ManualInfograficoPermissoesUsuario />
        </div>
      )}
      {fluxo.mostrarInfograficoPapeisFornecedor && (
        <div style={{ marginTop: MANUAL_ESPACO_PARAGRAFO_PX, marginBottom: MANUAL_ESPACO_ENTRE_PASSOS_PX }}>
          <ManualInfograficoPapeisFornecedor />
        </div>
      )}
      {fluxo.mostrarInfograficoMenuLateral && (
        <div style={{ marginTop: MANUAL_ESPACO_PARAGRAFO_PX, marginBottom: MANUAL_ESPACO_ENTRE_PASSOS_PX }}>
          <ManualInfograficoMenuLateral />
        </div>
      )}
      {fluxo.mostrarInfograficoIconesMenuSuperior && !fluxo.infograficoIconesMenuSuperiorAposPassos && (
        <div style={{ marginTop: MANUAL_ESPACO_PARAGRAFO_PX, marginBottom: MANUAL_ESPACO_PARAGRAFO_PX }}>
          <ManualInfograficoIconesMenuSuperior />
        </div>
      )}
      {fluxo.mostrarInfograficoTiposUsuario && (
        <div style={{ marginTop: MANUAL_ESPACO_PARAGRAFO_PX, marginBottom: MANUAL_ESPACO_PARAGRAFO_PX }}>
          <ManualInfograficoTiposUsuario />
        </div>
      )}
      {fluxo.mostrarInfograficoSmartDocsInsights && (
        <div style={{ marginTop: MANUAL_ESPACO_PARAGRAFO_PX, marginBottom: MANUAL_ESPACO_PARAGRAFO_PX }}>
          <ManualInfograficoSmartDocsInsights />
        </div>
      )}
      {fluxo.mostrarInfograficoPedidoInsights && (
        <div style={{ marginTop: MANUAL_ESPACO_PARAGRAFO_PX, marginBottom: MANUAL_ESPACO_PARAGRAFO_PX }}>
          <ManualInfograficoPedidoInsights />
        </div>
      )}
      {fluxo.mostrarInfograficoBidFreteInsights && (
        <div style={{ marginTop: MANUAL_ESPACO_PARAGRAFO_PX, marginBottom: MANUAL_ESPACO_PARAGRAFO_PX }}>
          <ManualInfograficoBidFreteInsights />
        </div>
      )}
      {fluxo.mostrarInfograficoBidFretePainelCotacao && (
        <div style={{ marginTop: MANUAL_ESPACO_PARAGRAFO_PX, marginBottom: MANUAL_ESPACO_ENTRE_PASSOS_PX }}>
          <ManualInfograficoBidFretePainelCotacao />
        </div>
      )}
      {fluxo.figurasAposInfografico?.map((fig) => (
        <div
          key={fig.imagem}
          style={{ margin: `0 0 ${MANUAL_ESPACO_ENTRE_PASSOS_PX}px` }}
        >
          {fig.paragrafoAntes ? (
            <ManualParagrafo
              texto={fig.paragrafoAntes}
              marginBottom={MANUAL_ESPACO_PARAGRAFO_PX}
            />
          ) : null}
          <ManualFiguraScreenshot
            src={fig.imagem}
            alt={fig.legenda ?? fluxo.titulo}
            larguraMaxima={fig.larguraMaxima}
          />
        </div>
      ))}
    </>
  )

  const passosFluxo = (
    <>
      {fluxo.modoCenarios && fluxo.cenariosLadoALado && (fluxo.passosVisuais?.length ?? 0) > 0 ? (
        fluxo.cenariosImagensAlinhadas ? (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: MANUAL_ESPACO_GRADE_GALERIA_PX,
              alignItems: 'stretch',
              marginTop: MANUAL_ESPACO_ENTRE_PASSOS_PX,
            }}>
              {fluxo.passosVisuais.map(passo => (
                <ManualBlocoPassoVisual
                  key={`${passo.num}-texto`}
                  {...propsPasso(passo)}
                  ocultarRotuloPasso
                  emGradeCenarios
                  cenarioParte="texto"
                />
              ))}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: MANUAL_ESPACO_GRADE_GALERIA_PX,
              alignItems: 'start',
              marginTop: MANUAL_ESPACO_ANTES_IMAGEM_ACORDEAO_PX,
            }}>
              {fluxo.passosVisuais.map(passo => (
                <ManualBlocoPassoVisual
                  key={`${passo.num}-figuras`}
                  {...propsPasso(passo)}
                  ocultarRotuloPasso
                  emGradeCenarios
                  cenarioParte="figuras"
                />
              ))}
            </div>
          </>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: MANUAL_ESPACO_GRADE_GALERIA_PX,
            alignItems: 'start',
            marginTop: MANUAL_ESPACO_ENTRE_PASSOS_PX,
          }}>
            {fluxo.passosVisuais.map(passo => (
              <ManualBlocoPassoVisual
                key={passo.num}
                {...propsPasso(passo)}
                ocultarRotuloPasso
                emGradeCenarios
              />
            ))}
          </div>
        )
      ) : fluxo.mostrarMapaSubtopicosPassos && fluxo.ancoraPassosPrefix ? (
        <ManualPassosSubtopicosAcordeao
          fluxo={fluxo}
          numeroSecaoFluxo={numeroSecaoFluxo}
          propsPasso={propsPasso}
        />
      ) : (
        (fluxo.passosVisuais ?? []).map(passo => (
          <React.Fragment key={passo.num}>
            <ManualBlocoPassoVisual
              {...propsPasso(passo)}
              ocultarRotuloPasso={fluxo.modoCenarios}
            />
            <ManualInfograficoPermissoesUsuarioEmbutido fluxo={fluxo} aposPassoNum={passo.num} />
          </React.Fragment>
        ))
      )}
    </>
  )

  const rodapeFluxo = (
    <>
      {fluxo.mostrarCatalogoHistoricoCompleto && (
        <ManualCatalogoHistoricoCompleto />
      )}
      {fluxo.callout && fluxo.calloutAposPassos && (
        <ManualCalloutBloco callout={fluxo.callout} marginTop={12} />
      )}
      {fluxo.mostrarInfograficoIconesMenuSuperior && fluxo.infograficoIconesMenuSuperiorAposPassos && (
        <div style={{ marginTop: 20, marginBottom: 4 }}>
          <ManualInfograficoIconesMenuSuperior />
        </div>
      )}
      {fluxo.mostrarInfograficoHubTelas && fluxo.infograficoHubTelasAposPassos && (
        <div style={{ marginTop: 24, marginBottom: 8 }}>
          <ManualInfograficoHubTelas />
        </div>
      )}
    </>
  )

  if (modo === 'intro') return introFluxo

  if (modo === 'passo') {
    const passo = fluxo.passosVisuais?.find(p => p.num === passoNum)
    if (!passo) return null
    return (
      <>
        <ManualBlocoPassoVisual
          {...propsPasso(passo)}
          ocultarRotuloPasso
          ocultarTituloPasso
        />
        <ManualInfograficoPermissoesUsuarioEmbutido fluxo={fluxo} aposPassoNum={passo.num} />
      </>
    )
  }

  if (modo === 'rodape') return rodapeFluxo

  return (
    <>
      {introFluxo}
      {passosFluxo}
      {rodapeFluxo}
    </>
  )
}

export function ManualBlocoOrigemDados({ origem }: { origem: DocOrigemDados }) {
  const titulo = origem.titulo ?? 'De onde vem esse dado'
  return (
    <div
      id="doc-origem-dados"
      style={{
        marginTop: 24,
        background: 'rgba(251,191,36,.04)',
        border: '1px solid rgba(251,191,36,.18)',
        borderRadius: 14,
        padding: '20px 22px 24px',
      }}
    >
      <p style={{
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
        color: '#fbbf24', margin: '0 0 12px',
      }}>
        {titulo}
      </p>
      {origem.paragrafos.map((p, i) => (
        <ManualParagrafo
          key={i}
          texto={p}
          marginBottom={
            i === origem.paragrafos.length - 1 && origem.etapas.length > 0
              ? 20
              : manualMargemParagrafo(i, origem.paragrafos.length)
          }
        />
      ))}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20,
        marginTop: origem.paragrafos.length === 0 ? 0 : undefined,
      }}>
        {origem.etapas.map((etapa) => (
          <div key={etapa.legenda}>
            <p style={{
              fontSize: '.72rem', fontWeight: 700, color: '#fbbf24',
              marginBottom: 8, letterSpacing: '.04em',
            }}>
              {etapa.legenda}
            </p>
            {etapa.paragrafos.map((p, i) => (
              <ManualParagrafo key={i} texto={p} marginBottom={manualMargemParagrafo(i, etapa.paragrafos.length)} />
            ))}
            <ManualFiguraScreenshot src={etapa.imagem} alt={etapa.legenda} />
          </div>
        ))}
      </div>
    </div>
  )
}

function figurasAposParagrafo(
  secao: DocSecao,
  indice: number,
): { imagem: string; legenda?: string }[] {
  return (secao.figurasAposParagrafo ?? []).filter((f) => f.indice === indice)
}

function galeriaComparacaoAposParagrafoSecao(secao: DocSecao, indice: number) {
  return (secao.galeriaComparacaoAposParagrafo ?? []).filter((g) => g.indice === indice)
}

export function ManualGaleriaComparacaoIntro({
  telas,
  ampliarInferiorDireito,
  colunas,
  colunasGradeTemplate,
  gradeTelasMesmaAltura = false,
  textoAcimaEstiloCorpo = false,
  espacoTextoFiguraPx,
  legendaPasso,
  pilaresImportarFormas,
  pilaresCustomizacao,
  tituloEtapa,
  textoIntro,
  cenariosAcesso,
  textoAoLado,
  infograficoMapeamentoImportarColunas,
  infograficoTransferirResultadoEsperado,
  infograficoBidFreteNovaCotacaoResultadoEsperado,
  infograficoBidFreteBidPacoteCotacoes,
  infograficoBidFreteModalOperacaoCampos,
  telasAposInfograficoBidFreteModalOperacaoCampos,
  textoAposInfograficoBidFreteModalOperacaoCampos,
  simuladorBidFreteModalOperacao,
  infograficoBidFreteOrigemDestinoCampos,
  telasAposInfograficoBidFreteOrigemDestinoCampos,
  textoAposInfograficoBidFreteOrigemDestinoCampos,
  calloutEntreTelasAposInfograficoBidFreteOrigemDestinoCampos,
  textoSecaoDestinoAposCalloutOrigemDestinoBidFrete,
  telasSecaoDestinoAposCalloutOrigemDestinoBidFrete,
  calloutEntreTelasSecaoDestinoAposCalloutOrigemDestinoBidFrete,
  calloutAposSecaoDestinoOrigemDestinoBidFrete,
  simuladorBidFreteOrigemDestino,
  infograficoConsolidarPasso2Regras,
  infograficoConsolidarResultadoEsperado,
  layoutConsolidarResultadoUnificado,
  rotuloConsolidarExemplosPasso2,
  layoutConsolidarExemplosPasso2,
  infograficoEdicaoMassaPasso1Regras,
  mostrarCatalogoEdicaoMassaPedidoLista,
  infograficoEdicaoMassaPasso2Regras,
  infograficoEdicaoMassaResultadoEsperado,
  rotuloEdicaoMassaExemplosPasso1,
  rotuloEdicaoMassaExemplosPasso2,
  layoutEdicaoMassaExemplosPasso1,
  layoutEdicaoMassaExemplosPasso2,
  layoutPrimeiroPrintLarguraTotal,
  layoutPrimeirosPrintsLarguraTotal,
  mostrarChipsTransferirTresTipos,
  chipTransferirTituloEtapa,
  mostrarChipsBidFreteModalTransporte,
  chipsBidFreteModalTransporteAoLadoTitulo,
  iconesEscopoBidFrete,
  chipBidFreteModalTransporte,
  chipBidFreteFormaManual,
  chipBidFreteBid,
  chipBidFreteTokenNaoUtilizado,
  chipBidFreteTokenUtilizado,
  mostrarChipsBidFreteTipoCarga,
  chipBidFreteTipoCarga,
  calloutApos,
  mostrarIndicadoresMoverDashboardPedido,
  mostrarCardsKanbanCabecalhoPedido,
  layoutCardInsightGradePedido,
  espacoSuperiorEtapa = false,
  espacoInferiorAposEtapaPx,
  margemSuperiorPx,
  emAcordeaoSubtopico = false,
  passoAcademyGuia = false,
}: {
  telas: DocGaleriaComparacaoTela[]
  ampliarInferiorDireito?: boolean
  colunas?: number
  colunasGradeTemplate?: string
  gradeTelasMesmaAltura?: boolean
  textoAcimaEstiloCorpo?: boolean
  espacoTextoFiguraPx?: number
  legendaPasso?: string
  pilaresImportarFormas?: ManualPilarImportarFormaId[]
  pilaresCustomizacao?: ManualPilarCustomizacaoId[]
  tituloEtapa?: string
  textoIntro?: string
  cenariosAcesso?: {
    titulo: string
    texto: string
    imagem?: string
    paragrafoAntesPrint?: string
    printsApos?: { imagem: string; paragrafoAntesPrint?: string }[]
    chipAcessoPainelCotacao?: ManualChipAcessoPainelCotacaoId
  }[]
  textoAoLado?: string[]
  infograficoMapeamentoImportarColunas?: boolean
  infograficoTransferirResultadoEsperado?: 'novo' | 'existente' | 'reducao'
  infograficoBidFreteNovaCotacaoResultadoEsperado?: boolean
  infograficoBidFreteBidPacoteCotacoes?: boolean
  infograficoBidFreteModalOperacaoCampos?: boolean
  telasAposInfograficoBidFreteModalOperacaoCampos?: DocGaleriaComparacaoTela[]
  textoAposInfograficoBidFreteModalOperacaoCampos?: string
  simuladorBidFreteModalOperacao?: boolean
  infograficoBidFreteOrigemDestinoCampos?: boolean
  telasAposInfograficoBidFreteOrigemDestinoCampos?: DocGaleriaComparacaoTela[]
  textoAposInfograficoBidFreteOrigemDestinoCampos?: string
  calloutEntreTelasAposInfograficoBidFreteOrigemDestinoCampos?: DocCalloutManual | DocCalloutManual[]
  textoSecaoDestinoAposCalloutOrigemDestinoBidFrete?: string
  telasSecaoDestinoAposCalloutOrigemDestinoBidFrete?: DocGaleriaComparacaoTela[]
  calloutEntreTelasSecaoDestinoAposCalloutOrigemDestinoBidFrete?: DocCalloutManual | DocCalloutManual[]
  calloutAposSecaoDestinoOrigemDestinoBidFrete?: DocCalloutManual | DocCalloutManual[]
  simuladorBidFreteOrigemDestino?: boolean
  infograficoConsolidarPasso2Regras?: boolean
  infograficoConsolidarResultadoEsperado?: boolean
  layoutConsolidarResultadoUnificado?: boolean
  rotuloConsolidarExemplosPasso2?: boolean
  layoutConsolidarExemplosPasso2?: boolean
  infograficoEdicaoMassaPasso1Regras?: boolean
  mostrarCatalogoEdicaoMassaPedidoLista?: boolean
  infograficoEdicaoMassaPasso2Regras?: boolean
  infograficoEdicaoMassaResultadoEsperado?: boolean
  rotuloEdicaoMassaExemplosPasso1?: boolean
  rotuloEdicaoMassaExemplosPasso2?: boolean
  layoutEdicaoMassaExemplosPasso1?: boolean
  layoutEdicaoMassaExemplosPasso2?: boolean
  layoutPrimeiroPrintLarguraTotal?: boolean
  layoutPrimeirosPrintsLarguraTotal?: number
  mostrarChipsTransferirTresTipos?: boolean
  chipTransferirTituloEtapa?: 'novo' | 'existente' | 'reducao'
  mostrarChipsBidFreteModalTransporte?: boolean
  chipsBidFreteModalTransporteAoLadoTitulo?: boolean
  iconesEscopoBidFrete?: ManualBidFreteEscopoConfig
  chipBidFreteModalTransporte?: 'maritimo' | 'aereo' | 'rodoviario'
  chipBidFreteFormaManual?: boolean
  chipBidFreteBid?: boolean
  chipBidFreteTokenNaoUtilizado?: boolean
  chipBidFreteTokenUtilizado?: boolean
  mostrarChipsBidFreteTipoCarga?: boolean
  chipBidFreteTipoCarga?: 'fcl' | 'lcl' | 'air_lcl_rodo'
  calloutApos?: DocCalloutManual | DocCalloutManual[]
  mostrarIndicadoresMoverDashboardPedido?: boolean
  mostrarCardsKanbanCabecalhoPedido?: boolean
  /** Manual Pedido § Insights — card UX10 à esquerda + print à direita por widget da grade. */
  layoutCardInsightGradePedido?: boolean
  espacoSuperiorEtapa?: boolean
  espacoInferiorAposEtapaPx?: number
  /** Sobrescreve margin-top do bloco (ex.: frase → imagem após `paragrafosAposImagem`). */
  margemSuperiorPx?: number
  /** Galeria dentro de subtópico recolhível — usa ritmo `manual-tipografia` (28px antes do print). */
  emAcordeaoSubtopico?: boolean
  /** Guia Academy — borda lateral só em **Passo NN** (`paragrafoAntes` numerado). */
  passoAcademyGuia?: boolean
}) {
  if (
    telas.length === 0
    && !(cenariosAcesso?.length)
    && !tituloEtapa
    && !textoIntro
    && !infograficoTransferirResultadoEsperado
    && !infograficoBidFreteNovaCotacaoResultadoEsperado
    && !infograficoBidFreteBidPacoteCotacoes
    && !infograficoBidFreteModalOperacaoCampos
    && !simuladorBidFreteModalOperacao
    && !simuladorBidFreteOrigemDestino
    && !infograficoBidFreteOrigemDestinoCampos
    && !infograficoConsolidarPasso2Regras
    && !infograficoConsolidarResultadoEsperado
    && !infograficoEdicaoMassaPasso1Regras
    && !mostrarCatalogoEdicaoMassaPedidoLista
    && !infograficoEdicaoMassaPasso2Regras
    && !infograficoEdicaoMassaResultadoEsperado
  ) return null
  const modoTituloSubtopico = emAcordeaoSubtopico && textoAcimaEstiloCorpo
  const colunasGrade = colunas ?? Math.min(telas.length, 2)
  const printLarguraTotal = colunasGrade === 1
  const espacoParagrafoGaleriaPx = emAcordeaoSubtopico
    ? MANUAL_ESPACO_PARAGRAFO_ACORDEAO_PX
    : MANUAL_ESPACO_PARAGRAFO_PX
  const espacoAcimaGaleriaPx = emAcordeaoSubtopico
    ? MANUAL_ESPACO_ANTES_IMAGEM_ACORDEAO_PX
    : MANUAL_ESPACO_PARAGRAFO_PX
  const espacoLegendaPrintFiguraPx = espacoTextoFiguraPx ?? (
    textoAcimaEstiloCorpo || emAcordeaoSubtopico
      ? MANUAL_ESPACO_ANTES_IMAGEM_ACORDEAO_PX
      : MANUAL_ESPACO_PARAGRAFO_PX
  )
  const espacoGradeGaleriaPx = textoAcimaEstiloCorpo
    ? MANUAL_ESPACO_GRADE_GALERIA_PX
    : (colunasGrade >= 4 ? 10 : MANUAL_ESPACO_GRADE_GALERIA_PX)
  const cabecalhoPasso = legendaPasso && (pilaresImportarFormas?.length || pilaresCustomizacao?.length) ? (
    <ManualGaleriaCabecalhoPasso
      legendaPasso={legendaPasso}
      pilaresImportarFormas={pilaresImportarFormas}
      pilaresCustomizacao={pilaresCustomizacao}
    />
  ) : null

  const alinharCalloutsNaGrade = telas.length > 1 && telas.some((t) => t.calloutAntes)

  const gradePassoDuasLinhas = textoAcimaEstiloCorpo && colunasGrade > 1 && !printLarguraTotal

  const renderTela = (
    tela: DocGaleriaComparacaoTela,
    opts?: {
      alinharLegendaChipGrade?: boolean
      alturaLegendaChipGrade?: number
      margemAbaixoLegenda?: number
      forcarLarguraTotal?: boolean
      /** Grade PASSO — linha 1 só legendas (baseline inferior alinhada). */
      parte?: 'legenda' | 'imagem'
    },
  ) => {
    const usarFlexColunaGrade = (gradePassoDuasLinhas && opts?.parte)
      ? false
      : ((textoAcimaEstiloCorpo && colunasGrade > 1 && !printLarguraTotal && !opts?.forcarLarguraTotal)
        || alinharCalloutsNaGrade
        || opts?.alinharLegendaChipGrade
        || gradeTelasMesmaAltura)
    const alinharLegendaAlturaFixa = opts?.alinharLegendaChipGrade && !opts?.parte
    const margemAbaixoLegenda = opts?.parte === 'legenda'
      ? 0
      : (opts?.margemAbaixoLegenda ?? espacoLegendaPrintFiguraPx)

    const blocoLegenda = (
      <>
        {tela.calloutAntes ? (
          <div style={alinharCalloutsNaGrade ? { flex: '1 1 0', marginBottom: 10 } : undefined}>
            <ManualCalloutBloco callout={tela.calloutAntes} marginTop={0} marginBottom={alinharCalloutsNaGrade ? 0 : 10} />
          </div>
        ) : tela.chipConsolidarExemplo && tela.paragrafoAntes ? (
          <ManualGaleriaLegendaConsolidarExemplo
            chip={tela.chipConsolidarExemplo}
            texto={tela.paragrafoAntes}
            margemAbaixo={margemAbaixoLegenda}
            alturaFixaLegenda={alinharLegendaAlturaFixa
              ? (opts?.alturaLegendaChipGrade ?? MANUAL_ALTURA_LEGENDA_CHIP_GRADE_PX)
              : undefined}
          />
        ) : tela.chipEdicaoMassaExemplo && tela.paragrafoAntes ? (
          <ManualGaleriaLegendaEdicaoMassaExemplo
            chip={tela.chipEdicaoMassaExemplo}
            texto={tela.paragrafoAntes}
            margemAbaixo={margemAbaixoLegenda}
            alturaFixaLegenda={alinharLegendaAlturaFixa
              ? (opts?.alturaLegendaChipGrade ?? MANUAL_ALTURA_LEGENDA_CHIP_GRADE_PX)
              : undefined}
          />
        ) : tela.paragrafoAntes ? (
          textoAcimaEstiloCorpo
            ? (
              <ManualGaleriaLegendaPrintPasso
                texto={tela.paragrafoAntes}
                margemAbaixo={margemAbaixoLegenda}
                modoTituloSubtopico={modoTituloSubtopico}
                passoAcademyGuia={passoAcademyGuia}
                alturaFixaLegenda={alinharLegendaAlturaFixa
                  ? (opts?.alturaLegendaChipGrade ?? MANUAL_ALTURA_LEGENDA_CHIP_GRADE_PX)
                  : undefined}
              />
            )
            : <ManualTextoUx10AcimaFigura texto={tela.paragrafoAntes} />
        ) : null}
        {opts?.parte !== 'legenda' && tela.legenda.trim() ? (
          <p style={{
            fontSize: '.72rem', fontWeight: 700, color: '#818cf8',
            marginBottom: 10, textAlign: 'center', letterSpacing: '.03em', lineHeight: 1.4,
          }}>
            {tela.legenda}
          </p>
        ) : null}
      </>
    )

    const blocoImagem = (
      <>
        <div style={alinharLegendaAlturaFixa ? { marginTop: 'auto', width: '100%', minWidth: 0 } : undefined}>
          <ManualFiguraScreenshot
            src={tela.imagem}
            alt={tela.legenda.trim() || tela.paragrafoAntes?.replace(/\*\*/g, '') || 'Captura de tela'}
            ampliarInferiorDireito={ampliarInferiorDireito}
            larguraMaxima={tela.larguraMaxima}
            alturaMaxima={tela.alturaMaxima}
            larguraTotal={printLarguraTotal || opts?.forcarLarguraTotal}
            preencherCelulaGrade={
              tela.preencherCelulaGrade !== undefined
                ? tela.preencherCelulaGrade
                : gradeTelasMesmaAltura
            }
          />
        </div>
        {tela.legendaApos?.trim() ? (
          <div style={{ marginTop: MANUAL_ESPACO_PARAGRAFO_PX }}>
            <ManualGaleriaTelaLegendaStep
              legenda={tela.legendaApos}
              alinhamento={tela.legendaAposAlinhamento ?? 'left'}
            />
          </div>
        ) : null}
        {tela.paragrafoDepois ? (
          <ManualParagrafo texto={tela.paragrafoDepois} marginBottom={0} />
        ) : null}
      </>
    )

    if (opts?.parte === 'legenda') {
      return (
        <div style={{ width: '100%', minWidth: 0 }}>
          {blocoLegenda}
        </div>
      )
    }
    if (opts?.parte === 'imagem') {
      return (
        <div style={{ width: '100%', minWidth: 0 }}>
          {blocoImagem}
        </div>
      )
    }

    return (
      <div
        key={tela.imagem}
        style={{
          ...((printLarguraTotal || opts?.forcarLarguraTotal) ? { width: '100%', minWidth: 0 } : {}),
          ...(usarFlexColunaGrade
            ? { display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }
            : {}),
        }}
      >
        {blocoLegenda}
        {blocoImagem}
      </div>
    )
  }

  const gradeComTextoAoLado = (textoAoLado?.length || infograficoMapeamentoImportarColunas)
    && telas.length === 1
    && colunasGrade === 4

  const linhaSoDicas = telas.length > 0
    && telas.every((t) => t.calloutAntes)
    && !tituloEtapa

  const subtituloEtapa = textoIntro?.trim() || undefined
  const subtituloNoCabecalhoEtapa = Boolean(tituloEtapa && subtituloEtapa)

  const margemInferiorGaleriaPx = espacoInferiorAposEtapaPx ?? MANUAL_ESPACO_ENTRE_PASSOS_PX
  const margemSuperiorGaleriaPx = margemSuperiorPx ?? (
    textoAcimaEstiloCorpo
      ? (espacoSuperiorEtapa ? 0 : espacoAcimaGaleriaPx)
      : MANUAL_ESPACO_ENTRE_PASSOS_PX
  )

  return (
    <div style={{
      margin: `${margemSuperiorGaleriaPx}px 0 ${margemInferiorGaleriaPx}px`,
      paddingTop: espacoSuperiorEtapa ? MANUAL_ESPACO_ENTRE_PASSOS_PX : undefined,
    }}>
      {linhaSoDicas ? <ManualGaleriaRotuloLinhaDicas /> : null}
      {rotuloConsolidarExemplosPasso2 ? <ManualGaleriaRotuloConsolidarExemplos /> : null}
      {rotuloEdicaoMassaExemplosPasso1 ? <ManualGaleriaRotuloEdicaoMassaExemplos passo={1} /> : null}
      {rotuloEdicaoMassaExemplosPasso2 ? <ManualGaleriaRotuloEdicaoMassaExemplos passo={2} /> : null}
      {tituloEtapa && mostrarChipsTransferirTresTipos ? (
        <>
          <ManualGaleriaCabecalhoEtapaRamo
            tituloMarkdown={tituloEtapa}
            subtituloMarkdown={subtituloEtapa}
          />
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '6px 8px',
            marginBottom: MANUAL_ESPACO_PARAGRAFO_PX,
            textAlign: 'left',
          }}>
            <span style={{
              fontSize: '.74rem',
              fontWeight: 600,
              color: 'color-mix(in srgb, var(--ws-text, #f1f5f9) 75%, transparent)',
              lineHeight: 1.4,
            }}>
              válido para
            </span>
            <ManualChipsTransferirTresTiposInicioComum compacto />
          </div>
        </>
      ) : tituloEtapa && chipTransferirTituloEtapa ? (
        <ManualGaleriaCabecalhoEtapaRamo
          chip={<ManualChipTransferirTipo id={chipTransferirTituloEtapa} />}
          tituloMarkdown={tituloEtapa}
          subtituloMarkdown={subtituloEtapa}
        />
      ) : tituloEtapa && chipBidFreteBid ? (
        <ManualGaleriaCabecalhoEtapaRamo
          chip={<ManualChipBidFreteBidPilar />}
          tituloMarkdown={tituloEtapa}
          subtituloMarkdown={subtituloEtapa}
          acoesDireita={iconesEscopoBidFrete
            ? <ManualBidFreteIconesEscopo config={iconesEscopoBidFrete} />
            : undefined}
        />
      ) : tituloEtapa && chipBidFreteFormaManual ? (
        <ManualGaleriaCabecalhoEtapaRamo
          chip={<ManualChipBidFreteFormaManualPilar />}
          tituloMarkdown={tituloEtapa}
          subtituloMarkdown={subtituloEtapa}
          acoesDireita={iconesEscopoBidFrete
            ? <ManualBidFreteIconesEscopo config={iconesEscopoBidFrete} />
            : undefined}
        />
      ) : tituloEtapa && chipBidFreteModalTransporte ? (
        <ManualGaleriaCabecalhoEtapaRamo
          chip={<ManualChipBidFreteModalTransporte id={chipBidFreteModalTransporte} />}
          tituloMarkdown={tituloEtapa}
          subtituloMarkdown={subtituloEtapa}
        />
      ) : tituloEtapa && chipBidFreteTipoCarga ? (
        <ManualGaleriaCabecalhoEtapaRamo
          chip={<ManualChipBidFreteTipoCarga id={chipBidFreteTipoCarga} />}
          tituloMarkdown={tituloEtapa}
          subtituloMarkdown={subtituloEtapa}
        />
      ) : tituloEtapa && chipBidFreteTokenNaoUtilizado ? (
        <ManualGaleriaCabecalhoEtapaRamo
          chip={<ManualChipBidFreteTokenNaoUtilizado />}
          tituloMarkdown={tituloEtapa}
          subtituloMarkdown={subtituloEtapa}
        />
      ) : tituloEtapa && chipBidFreteTokenUtilizado ? (
        <ManualGaleriaCabecalhoEtapaRamo
          chip={<ManualChipBidFreteTokenUtilizado />}
          tituloMarkdown={tituloEtapa}
          subtituloMarkdown={subtituloEtapa}
        />
      ) : tituloEtapa && iconesEscopoBidFrete ? (
        <>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px 12px',
            marginBottom: subtituloNoCabecalhoEtapa ? 0 : MANUAL_ESPACO_PARAGRAFO_PX,
            textAlign: 'left',
          }}>
            <p style={{
              fontSize: '14.5px',
              fontWeight: 700,
              color: '#818cf8',
              margin: 0,
              letterSpacing: '.04em',
              lineHeight: 1.35,
              flex: '1 1 auto',
              minWidth: 0,
            }}>
              <ManualTextoRich texto={tituloEtapa} />
            </p>
            <ManualBidFreteIconesEscopo config={iconesEscopoBidFrete} />
          </div>
          {subtituloNoCabecalhoEtapa ? (
            <ManualParagrafo texto={subtituloEtapa!} marginBottom={MANUAL_ESPACO_PARAGRAFO_PX} />
          ) : null}
        </>
      ) : tituloEtapa && mostrarChipsBidFreteModalTransporte && chipsBidFreteModalTransporteAoLadoTitulo ? (
        <>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px 12px',
            marginBottom: subtituloNoCabecalhoEtapa ? 0 : MANUAL_ESPACO_PARAGRAFO_PX,
            textAlign: 'left',
          }}>
            <p style={{
              fontSize: '14.5px',
              fontWeight: 700,
              color: '#818cf8',
              margin: 0,
              letterSpacing: '.04em',
              lineHeight: 1.35,
              flex: '1 1 auto',
              minWidth: 0,
            }}>
              <ManualTextoRich texto={tituloEtapa} />
            </p>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '6px 8px',
              flexShrink: 0,
            }}>
              <span style={{
                fontSize: '.74rem',
                fontWeight: 600,
                color: 'color-mix(in srgb, var(--ws-text, #f1f5f9) 75%, transparent)',
                lineHeight: 1.4,
              }}>
                válido para
              </span>
              <ManualChipsBidFreteModalTransporteInicioComum compacto />
            </div>
          </div>
          {subtituloNoCabecalhoEtapa ? (
            <ManualParagrafo texto={subtituloEtapa!} marginBottom={MANUAL_ESPACO_PARAGRAFO_PX} />
          ) : null}
        </>
      ) : tituloEtapa && mostrarChipsBidFreteModalTransporte ? (
        <>
          <ManualGaleriaCabecalhoEtapaRamo
            tituloMarkdown={tituloEtapa}
            subtituloMarkdown={subtituloEtapa}
          />
          <ManualValidoParaChipsBidFreteModalTransporte />
        </>
      ) : tituloEtapa && mostrarChipsBidFreteTipoCarga ? (
        <>
          <ManualGaleriaCabecalhoEtapaRamo
            tituloMarkdown={tituloEtapa}
            subtituloMarkdown={subtituloEtapa}
          />
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '6px 8px',
            marginBottom: MANUAL_ESPACO_PARAGRAFO_PX,
            textAlign: 'left',
          }}>
            <span style={{
              fontSize: '.74rem',
              fontWeight: 600,
              color: 'color-mix(in srgb, var(--ws-text, #f1f5f9) 75%, transparent)',
              lineHeight: 1.4,
            }}>
              válido para
            </span>
            <ManualChipsBidFreteTipoCargaInicioComum compacto />
          </div>
        </>
      ) : tituloEtapa ? (
        <ManualGaleriaCabecalhoEtapaRamo
          tituloMarkdown={tituloEtapa}
          subtituloMarkdown={subtituloEtapa}
        />
      ) : null}
      {cenariosAcesso?.map((cenario, idxCenario) => (
        <ManualBlocoCenarioAcesso
          key={cenario.titulo}
          titulo={cenario.titulo}
          texto={cenario.texto}
          imagem={cenario.imagem}
          paragrafoAntesPrint={cenario.paragrafoAntesPrint}
          printsApos={cenario.printsApos}
          chipAcessoPainelCotacao={cenario.chipAcessoPainelCotacao}
          ampliarInferiorDireito={ampliarInferiorDireito}
          emAcordeaoSubtopico={emAcordeaoSubtopico}
          modoTituloSubtopico={modoTituloSubtopico}
          espacoAntesPrintPx={espacoLegendaPrintFiguraPx}
          espacoAposBlocoPx={idxCenario === (cenariosAcesso.length - 1) ? MANUAL_ESPACO_ENTRE_PASSOS_PX : MANUAL_ESPACO_IMAGEM_FRASE_PX}
          espacoImagemTextoPx={MANUAL_ESPACO_IMAGEM_FRASE_PX}
        />
      ))}
      {mostrarChipsTransferirTresTipos && !tituloEtapa ? (
        <ManualChipsTransferirTresTiposInicioComum />
      ) : null}
      {mostrarChipsBidFreteModalTransporte && !tituloEtapa ? (
        <ManualChipsBidFreteModalTransporteInicioComum />
      ) : null}
      {mostrarChipsBidFreteTipoCarga && !tituloEtapa ? (
        <ManualChipsBidFreteTipoCargaInicioComum />
      ) : null}
      {!subtituloNoCabecalhoEtapa && textoIntro ? (
        <ManualParagrafo texto={textoIntro} marginBottom={MANUAL_ESPACO_PARAGRAFO_PX} />
      ) : null}
      {cabecalhoPasso}
      {infograficoConsolidarPasso2Regras ? (
        <ManualInfograficoPedidoListaConsolidarPasso2Regras />
      ) : null}
      {infograficoEdicaoMassaPasso1Regras ? (
        <ManualInfograficoPedidoListaEdicaoMassaPasso1Regras />
      ) : null}
      {mostrarCatalogoEdicaoMassaPedidoLista ? (
        <ManualPedidoTabelaCatalogoColunasEdicaoMassa />
      ) : null}
      {infograficoEdicaoMassaPasso2Regras ? (
        <ManualInfograficoPedidoListaEdicaoMassaPasso2Regras />
      ) : null}
      {infograficoConsolidarResultadoEsperado && !layoutConsolidarResultadoUnificado ? (
        <ManualInfograficoPedidoListaConsolidarResultadoEsperado />
      ) : null}
      {infograficoEdicaoMassaResultadoEsperado ? (
        <ManualInfograficoPedidoListaEdicaoMassaResultadoEsperado />
      ) : null}
      {infograficoTransferirResultadoEsperado ? (
        <ManualInfograficoPedidoListaTransferirResultadoEsperado variant={infograficoTransferirResultadoEsperado} />
      ) : null}
      {infograficoBidFreteNovaCotacaoResultadoEsperado ? (
        <ManualInfograficoBidFreteNovaCotacaoResultadoEsperado />
      ) : null}
      {gradeComTextoAoLado ? (
        <>
          {infograficoMapeamentoImportarColunas && telas[0].paragrafoAntes ? (
            <ManualGaleriaLegendaPrintPasso texto={telas[0].paragrafoAntes} entreLinhas />
          ) : null}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 10,
            alignItems: 'stretch',
          }}>
            {infograficoMapeamentoImportarColunas ? (
              <>
                <ManualFiguraScreenshot
                  src={telas[0].imagem}
                  alt={telas[0].paragrafoAntes?.replace(/\*\*/g, '') || 'Captura de tela'}
                  ampliarInferiorDireito={ampliarInferiorDireito}
                />
                <div style={{ gridColumn: 'span 3', display: 'flex', minHeight: 0 }}>
                  <ManualInfograficoPedidoListaImportarMapeamentoColunas />
                </div>
              </>
            ) : (
              <>
                {renderTela(telas[0])}
                <div style={{ gridColumn: 'span 3', paddingTop: 2 }}>
                  {textoAoLado?.map((paragrafo, idx) => (
                    <ManualParagrafo
                      key={paragrafo.slice(0, 24)}
                      texto={paragrafo}
                      marginBottom={idx === (textoAoLado?.length ?? 0) - 1 ? 0 : MANUAL_ESPACO_PARAGRAFO_PX}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      ) : telas.length > 0 ? (
      layoutCardInsightGradePedido ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: MANUAL_ESPACO_ENTRE_PASSOS_PX }}>
          {telas.map((tela) => {
            const bloco = tela.cardInsightGradePedido != null
              ? blocoInsightPedidoPorNum(tela.cardInsightGradePedido)
              : undefined
            return (
              <div
                key={tela.imagem}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 360px) minmax(0, 1fr)',
                  gap: 20,
                  alignItems: 'start',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  {bloco ? <CardBlocoInsightPedido bloco={bloco} compacto={false} /> : null}
                </div>
                <div style={{ minWidth: 0, display: 'flex', justifyContent: 'flex-end' }}>
                  <ManualFiguraScreenshot
                    src={tela.imagem}
                    alt={bloco?.rotulo ?? tela.legenda}
                    ampliarInferiorDireito={ampliarInferiorDireito}
                    larguraMaxima={tela.larguraMaxima}
                    alturaMaxima={tela.alturaMaxima}
                  />
                </div>
              </div>
            )
          })}
        </div>
      ) : layoutConsolidarResultadoUnificado && telas.length >= 1 ? (
        <div
          role="group"
          aria-label="Resultado na Lista após consolidar"
          style={{
            background: 'linear-gradient(165deg, rgba(99,102,241,.08) 0%, rgba(148,163,184,.04) 48%, rgba(52,211,153,.05) 100%)',
            border: '1px solid rgba(148,163,184,.16)',
            borderRadius: 14,
            padding: '16px 16px 14px',
            boxShadow: '0 8px 28px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.04)',
          }}
        >
          <div style={{ marginBottom: 16 }}>
            {telas.map((tela) => renderTela(tela))}
          </div>
          <div style={{
            borderTop: '1px solid rgba(148,163,184,.14)',
            paddingTop: 14,
          }}>
            <ManualInfograficoPedidoListaConsolidarResultadoEsperado embutido />
          </div>
        </div>
      ) : layoutEdicaoMassaExemplosPasso1 && telas.length >= 6 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={MANUAL_ESTILO_GRADE_CHIP_TRES_COLUNAS}>
            {telas.slice(0, 3).map((tela) => renderTela(tela, {
              alinharLegendaChipGrade: true,
              alturaLegendaChipGrade: MANUAL_ALTURA_LEGENDA_CHIP_EDICAO_MASSA_NIVEL_PX,
              margemAbaixoLegenda: 4,
            }))}
          </div>
          <div style={MANUAL_ESTILO_GRADE_CHIP_TRES_COLUNAS}>
            {telas.slice(3, 6).map((tela) => renderTela(tela, {
              alinharLegendaChipGrade: true,
              alturaLegendaChipGrade: MANUAL_ALTURA_LEGENDA_CHIP_EDICAO_MASSA_CAMPO_PX,
              margemAbaixoLegenda: 4,
            }))}
          </div>
        </div>
      ) : layoutEdicaoMassaExemplosPasso2 && telas.length >= 4 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {renderTela(telas[0])}
          <div style={{ ...MANUAL_ESTILO_GRADE_CHIP_TRES_COLUNAS, marginTop: -50 }}>
            {telas.slice(1, 4).map((tela) => renderTela(tela, { alinharLegendaChipGrade: true }))}
          </div>
        </div>
      ) : (rotuloConsolidarExemplosPasso2 || layoutConsolidarExemplosPasso2) && telas.length >= 4 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {renderTela(telas[0])}
          <div style={MANUAL_ESTILO_GRADE_CHIP_TRES_COLUNAS}>
            {telas.slice(1, 4).map((tela) => renderTela(tela, { alinharLegendaChipGrade: true }))}
          </div>
        </div>
      ) : layoutPrimeiroPrintLarguraTotal && telas.length >= 2 ? (() => {
        const qtdLinhaCheia = Math.min(
          layoutPrimeirosPrintsLarguraTotal ?? 1,
          telas.length - 1,
        )
        const linhasCheias = telas.slice(0, qtdLinhaCheia)
        const restantes = telas.slice(qtdLinhaCheia)
        const colunasRestantes = Math.min(3, restantes.length)
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {linhasCheias.map((tela) => renderTela(tela, { forcarLarguraTotal: true }))}
            {restantes.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${colunasRestantes}, minmax(0, 1fr))`,
                gap: espacoGradeGaleriaPx,
                alignItems: 'stretch',
              }}>
                {restantes.map((tela) => renderTela(tela, { alinharLegendaChipGrade: true }))}
              </div>
            ) : null}
          </div>
        )
      })() : gradePassoDuasLinhas ? (
      telas.length <= colunasGrade ? (
      <div style={{
        display: 'grid',
        gridTemplateColumns: colunasGradeTemplate ?? `repeat(${colunasGrade}, minmax(0, 1fr))`,
        columnGap: espacoGradeGaleriaPx,
        rowGap: espacoLegendaPrintFiguraPx,
      }}>
        {telas.map((tela) => (
          <div key={`${tela.imagem}-leg`} style={{ alignSelf: 'end', minWidth: 0 }}>
            {renderTela(tela, { parte: 'legenda' })}
          </div>
        ))}
        {telas.map((tela) => (
          <div key={`${tela.imagem}-img`} style={{ minWidth: 0 }}>
            {renderTela(tela, { parte: 'imagem' })}
          </div>
        ))}
      </div>
      ) : (
      <div style={{
        display: 'grid',
        gridTemplateColumns: colunasGradeTemplate ?? `repeat(${colunasGrade}, minmax(0, 1fr))`,
        columnGap: espacoGradeGaleriaPx,
        rowGap: espacoGradeGaleriaPx,
      }}>
        {telas.map((tela) => (
          <div
            key={tela.imagem}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: espacoLegendaPrintFiguraPx,
              minWidth: 0,
            }}
          >
            {renderTela(tela, { parte: 'legenda' })}
            {renderTela(tela, { parte: 'imagem' })}
          </div>
        ))}
      </div>
      )
      ) : (
      <div style={{
      display: 'grid',
      gridTemplateColumns: printLarguraTotal
        ? 'minmax(0, 1fr)'
        : (colunasGradeTemplate ?? `repeat(${colunasGrade}, minmax(0, 1fr))`),
      width: printLarguraTotal ? '100%' : undefined,
      gap: espacoGradeGaleriaPx,
      alignItems: alinharCalloutsNaGrade || gradeTelasMesmaAltura
        ? 'stretch'
        : 'start',
    }}>
      {telas.map((tela) => renderTela(tela))}
      </div>
      )
      ) : null}
      {infograficoBidFreteBidPacoteCotacoes ? (
        <div style={{ marginTop: MANUAL_ESPACO_ENTRE_PASSOS_PX }}>
          <ManualInfograficoBidFreteBidPacoteCotacoes />
        </div>
      ) : null}
      {infograficoBidFreteModalOperacaoCampos ? (
        <div style={{ marginTop: MANUAL_ESPACO_PARAGRAFO_PX }}>
          <ManualInfograficoBidFreteModalOperacaoCampos />
        </div>
      ) : null}
      {textoAposInfograficoBidFreteModalOperacaoCampos ? (
        <div style={{ marginTop: MANUAL_ESPACO_PARAGRAFO_PX }}>
          <ManualParagrafo
            texto={textoAposInfograficoBidFreteModalOperacaoCampos}
            marginBottom={emAcordeaoSubtopico
              ? MANUAL_ESPACO_ANTES_IMAGEM_ACORDEAO_PX
              : MANUAL_ESPACO_PARAGRAFO_PX}
            alinhamentoAcordeao={emAcordeaoSubtopico}
          />
        </div>
      ) : null}
      {telasAposInfograficoBidFreteModalOperacaoCampos?.length ? (
        <div style={{
          marginTop: textoAposInfograficoBidFreteModalOperacaoCampos
            ? 0
            : MANUAL_ESPACO_PARAGRAFO_PX,
        }}>
          {telasAposInfograficoBidFreteModalOperacaoCampos.map((tela) => renderTela(tela, { forcarLarguraTotal: true }))}
        </div>
      ) : null}
      {infograficoBidFreteOrigemDestinoCampos ? (
        <div style={{ marginTop: MANUAL_ESPACO_PARAGRAFO_PX }}>
          <ManualInfograficoBidFreteOrigemDestinoCampos />
        </div>
      ) : null}
      {textoAposInfograficoBidFreteOrigemDestinoCampos ? (
        <div style={{ marginTop: MANUAL_ESPACO_PARAGRAFO_PX }}>
          <ManualParagrafo
            texto={textoAposInfograficoBidFreteOrigemDestinoCampos}
            marginBottom={emAcordeaoSubtopico
              ? MANUAL_ESPACO_ANTES_IMAGEM_ACORDEAO_PX
              : MANUAL_ESPACO_PARAGRAFO_PX}
            alinhamentoAcordeao={emAcordeaoSubtopico}
          />
        </div>
      ) : null}
      {telasAposInfograficoBidFreteOrigemDestinoCampos?.length ? (
        <div style={{
          marginTop: textoAposInfograficoBidFreteOrigemDestinoCampos
            ? 0
            : MANUAL_ESPACO_PARAGRAFO_PX,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: MANUAL_ESPACO_GRADE_GALERIA_PX,
            alignItems: 'stretch',
          }}>
            {telasAposInfograficoBidFreteOrigemDestinoCampos.slice(0, 2).map((tela) => renderTela(tela, { alinharLegendaChipGrade: true }))}
          </div>
          {(Array.isArray(calloutEntreTelasAposInfograficoBidFreteOrigemDestinoCampos)
            ? calloutEntreTelasAposInfograficoBidFreteOrigemDestinoCampos
            : calloutEntreTelasAposInfograficoBidFreteOrigemDestinoCampos
              ? [calloutEntreTelasAposInfograficoBidFreteOrigemDestinoCampos]
              : []
          ).map((callout, idx) => (
            <ManualCalloutBloco
              key={callout.texto.slice(0, 40)}
              callout={callout}
              marginTop={idx === 0 ? MANUAL_ESPACO_PARAGRAFO_PX : 8}
              marginBottom={0}
            />
          ))}
          {telasAposInfograficoBidFreteOrigemDestinoCampos.length > 2 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: MANUAL_ESPACO_GRADE_GALERIA_PX,
              alignItems: 'stretch',
              marginTop: MANUAL_ESPACO_GRADE_GALERIA_PX,
            }}>
              {telasAposInfograficoBidFreteOrigemDestinoCampos.slice(2).map((tela) => renderTela(tela, { alinharLegendaChipGrade: true }))}
            </div>
          ) : null}
        </div>
      ) : null}
      {calloutApos ? (
        (Array.isArray(calloutApos) ? calloutApos : [calloutApos]).map((callout, idx) => (
          <ManualCalloutBloco
            key={callout.texto.slice(0, 32)}
            callout={callout}
            marginTop={idx === 0 ? 12 : 8}
            marginBottom={0}
          />
        ))
      ) : null}
      {simuladorBidFreteModalOperacao ? <ManualBidFreteSimuladorModalOperacao /> : null}
      {textoSecaoDestinoAposCalloutOrigemDestinoBidFrete ? (
        <div style={{ marginTop: MANUAL_ESPACO_PARAGRAFO_PX }}>
          <ManualParagrafo
            texto={textoSecaoDestinoAposCalloutOrigemDestinoBidFrete}
            marginBottom={emAcordeaoSubtopico
              ? MANUAL_ESPACO_ANTES_IMAGEM_ACORDEAO_PX
              : MANUAL_ESPACO_PARAGRAFO_PX}
            alinhamentoAcordeao={emAcordeaoSubtopico}
          />
        </div>
      ) : null}
      {telasSecaoDestinoAposCalloutOrigemDestinoBidFrete?.length ? (
        <div style={{
          marginTop: textoSecaoDestinoAposCalloutOrigemDestinoBidFrete
            ? 0
            : MANUAL_ESPACO_PARAGRAFO_PX,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: MANUAL_ESPACO_GRADE_GALERIA_PX,
            alignItems: 'stretch',
          }}>
            {telasSecaoDestinoAposCalloutOrigemDestinoBidFrete.slice(0, 2).map((tela) => renderTela(tela, { alinharLegendaChipGrade: true }))}
          </div>
          {(Array.isArray(calloutEntreTelasSecaoDestinoAposCalloutOrigemDestinoBidFrete)
            ? calloutEntreTelasSecaoDestinoAposCalloutOrigemDestinoBidFrete
            : calloutEntreTelasSecaoDestinoAposCalloutOrigemDestinoBidFrete
              ? [calloutEntreTelasSecaoDestinoAposCalloutOrigemDestinoBidFrete]
              : []
          ).map((callout, idx) => (
            <ManualCalloutBloco
              key={callout.texto.slice(0, 40)}
              callout={callout}
              marginTop={idx === 0 ? MANUAL_ESPACO_PARAGRAFO_PX : 8}
              marginBottom={0}
            />
          ))}
          {telasSecaoDestinoAposCalloutOrigemDestinoBidFrete.length > 2 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: MANUAL_ESPACO_GRADE_GALERIA_PX,
              alignItems: 'stretch',
              marginTop: MANUAL_ESPACO_GRADE_GALERIA_PX,
            }}>
              {telasSecaoDestinoAposCalloutOrigemDestinoBidFrete.slice(2).map((tela) => renderTela(tela, { alinharLegendaChipGrade: true }))}
            </div>
          ) : null}
        </div>
      ) : null}
      {calloutAposSecaoDestinoOrigemDestinoBidFrete ? (
        (Array.isArray(calloutAposSecaoDestinoOrigemDestinoBidFrete)
          ? calloutAposSecaoDestinoOrigemDestinoBidFrete
          : [calloutAposSecaoDestinoOrigemDestinoBidFrete]
        ).map((callout, idx) => (
          <ManualCalloutBloco
            key={callout.texto.slice(0, 32)}
            callout={callout}
            marginTop={idx === 0 ? 12 : 8}
            marginBottom={0}
          />
        ))
      ) : null}
      {simuladorBidFreteOrigemDestino ? <ManualBidFreteSimuladorOrigemDestino /> : null}
      {mostrarIndicadoresMoverDashboardPedido ? <ManualPedidoIndicadoresMoverDashboard /> : null}
      {mostrarCardsKanbanCabecalhoPedido ? <ManualPedidoCardsKanbanCabecalho /> : null}
    </div>
  )
}

function ManualBlocoCenarioAcesso({
  titulo,
  texto,
  imagem,
  paragrafoAntesPrint,
  printsApos,
  chipAcessoPainelCotacao,
  ampliarInferiorDireito,
  emAcordeaoSubtopico = false,
  modoTituloSubtopico = false,
  espacoAntesPrintPx: espacoAntesPrintPxProp,
  espacoAposBlocoPx: espacoAposBlocoPxProp,
  espacoImagemTextoPx,
}: {
  titulo: string
  texto: string
  imagem?: string
  paragrafoAntesPrint?: string
  printsApos?: { imagem: string; paragrafoAntesPrint?: string }[]
  /** Manual BID Frete §7.01 — chip 01 + visão (mapa), 2 (tooltip) ou 3 (lista). */
  chipAcessoPainelCotacao?: ManualChipAcessoPainelCotacaoId
  ampliarInferiorDireito?: boolean
  emAcordeaoSubtopico?: boolean
  modoTituloSubtopico?: boolean
  /** Sobrescreve frase → print (padrão: 6px acordeão, 12px corpo). */
  espacoAntesPrintPx?: number
  /** Sobrescreve margem inferior do bloco (padrão: 22px com print, 12px sem). */
  espacoAposBlocoPx?: number
  /** Vão fim de imagem → próximo texto (SSOT `MANUAL_ESPACO_IMAGEM_FRASE_PX`). */
  espacoImagemTextoPx?: number
}) {
  const espacoAntesPrintPx = espacoAntesPrintPxProp ?? (
    emAcordeaoSubtopico
      ? MANUAL_ESPACO_ANTES_IMAGEM_ACORDEAO_PX
      : MANUAL_ESPACO_PARAGRAFO_PX
  )
  const espacoEntrePrintsPx = espacoImagemTextoPx ?? espacoAntesPrintPxProp ?? MANUAL_ESPACO_ENTRE_PASSOS_PX
  const temPrint = Boolean(imagem || (printsApos?.length ?? 0) > 0)
  const espacoAposBlocoPx = espacoAposBlocoPxProp ?? (
    temPrint ? MANUAL_ESPACO_ENTRE_PASSOS_PX : MANUAL_ESPACO_PARAGRAFO_PX
  )

  const renderPrint = (
    src: string,
    legenda?: string,
    marginTop = espacoAntesPrintPx,
  ) => (
    <div key={src} style={{ marginTop }}>
      {legenda ? (
        <ManualGaleriaLegendaPrintPasso
          texto={legenda}
          margemAbaixo={espacoAntesPrintPx}
          modoTituloSubtopico={modoTituloSubtopico}
          semAlturaMinima
        />
      ) : null}
      <ManualFiguraScreenshot
        src={src}
        alt={legenda?.replace(/\*\*/g, '') ?? texto.replace(/\*\*/g, '')}
        larguraTotal
        ampliarInferiorDireito={ampliarInferiorDireito}
      />
    </div>
  )

  return (
    <div style={{
      minWidth: 0,
      marginBottom: espacoAposBlocoPx,
    }}>
      <div style={{
        padding: '2px 0 0 18px',
        borderLeft: '3px solid rgba(99,102,241,.45)',
        minWidth: 0,
        marginBottom: temPrint ? espacoAntesPrintPx : 0,
      }}>
        <div style={{
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
          marginBottom: MANUAL_ESPACO_PARAGRAFO_PX + 4,
        }}>
          {chipAcessoPainelCotacao ? (
            <ManualChipsAcessoPainelCotacao id={chipAcessoPainelCotacao} />
          ) : null}
          <p style={{
            ...MANUAL_ESTILO_PASSO_TITULO,
            margin: 0,
            flex: 1,
            minWidth: 0,
            paddingTop: chipAcessoPainelCotacao ? 8 : 0,
            ...(emAcordeaoSubtopico ? { textAlign: 'left' } : {}),
          }}>
            {titulo}
          </p>
        </div>
        <ManualParagrafo
          texto={texto}
          marginBottom={0}
          alinhamentoAcordeao={emAcordeaoSubtopico}
        />
      </div>
      {imagem ? renderPrint(imagem, paragrafoAntesPrint, 0) : null}
      {printsApos?.map((print, idx) => renderPrint(
        print.imagem,
        print.paragrafoAntesPrint,
        imagem || idx > 0 ? espacoEntrePrintsPx : 0,
      ))}
    </div>
  )
}

function ManualTopicoImagemLateralTexto({
  topico,
  indice,
}: {
  topico: DocTopicoImagemLateral
  indice: number
}) {
  return (
    <div style={{
      padding: '2px 0 0 18px',
      borderLeft: '3px solid rgba(99,102,241,.45)',
      minWidth: 0,
    }}>
      <p style={{
        ...MANUAL_ESTILO_PASSO_TITULO,
        display: 'flex',
        alignItems: 'baseline',
        gap: 10,
        marginBottom: 8,
      }}>
        <span style={{
          fontSize: '.72rem', fontWeight: 800, color: '#818cf8', flexShrink: 0,
        }}>
          {String(indice + 1).padStart(2, '0')}
        </span>
        {topico.titulo}
      </p>
      <ManualParagrafo texto={topico.texto} marginBottom={0} />
    </div>
  )
}

export function ManualTopicosImagemLateral({ topicos }: { topicos: DocTopicoImagemLateral[] }) {
  if (topicos.length === 0) return null

  if (topicos.length > 1) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        marginTop: 20,
      }}>
        {topicos.map((topico, i) => (
          <div
            key={topico.titulo}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              width: '100%',
            }}
          >
            <ManualTopicoImagemLateralTexto topico={topico} indice={i} />
            <ManualFiguraScreenshot
              src={topico.imagem}
              alt={topico.titulo}
              larguraMaxima={topico.larguraMaxima}
            />
          </div>
        ))}
      </div>
    )
  }

  const topico = topicos[0]
  return (
    <ul style={{
      listStyle: 'none', margin: '20px 0 0', padding: 0,
    }}>
      <li>
        <div style={{
          display: 'grid',
          gridTemplateColumns: MANUAL_GRID_TEXTO_IMAGEM,
          gap: 28,
          alignItems: 'start',
        }}>
          <ManualTopicoImagemLateralTexto topico={topico} indice={0} />
          <ManualFiguraScreenshot
            src={topico.imagem}
            alt={topico.titulo}
            larguraMaxima={topico.larguraMaxima}
          />
        </div>
      </li>
    </ul>
  )
}

function ManualSecaoIntro({ secao }: { secao: DocSecao }) {
  return (
    <div style={{ padding: '4px 0 8px' }}>
      {secao.layoutTextoImagemLateral && (secao.imagem || secao.dicaAoLadoImagem) ? (
        <>
        <div style={{
          display: 'grid',
          gridTemplateColumns: MANUAL_GRID_TEXTO_IMAGEM,
          gap: 28,
          alignItems: 'start',
          marginBottom: secao.lista ? 28 : 0,
        }}>
          <div style={{ padding: '2px 0 0 18px', borderLeft: '3px solid rgba(99,102,241,.45)', width: '100%', minWidth: 0 }}>
            {secao.paragrafos.map((p, i) => (
              <div key={i}>
                <ManualParagrafo
                  texto={p}
                  marginBottom={manualMargemParagrafoAntesCallout(
                    i,
                    secao.paragrafos.length,
                    secao.calloutAposParagrafo?.indice,
                  )}
                />
                {figurasAposParagrafo(secao, i).map((fig) => (
                  <div key={fig.imagem} style={{ margin: `${MANUAL_ESPACO_PARAGRAFO_PX}px 0 ${MANUAL_ESPACO_ENTRE_PASSOS_PX}px` }}>
                    <ManualFiguraScreenshot
                      src={fig.imagem}
                      alt={fig.legenda ?? secao.titulo}
                      larguraMaxima={fig.larguraMaxima}
                    />
                  </div>
                ))}
                {galeriaComparacaoAposParagrafoSecao(secao, i).map((galeria) => (
                  <ManualGaleriaComparacaoIntro
                    key={galeria.telas.map(t => t.imagem).join('|')}
                    telas={galeria.telas}
                    ampliarInferiorDireito={galeria.ampliarInferiorDireito}
                    colunas={galeria.colunas}
                    textoAcimaEstiloCorpo={galeria.textoAcimaEstiloCorpo}
                    legendaPasso={galeria.legendaPasso}
                    pilaresImportarFormas={galeria.pilaresImportarFormas}
                  />
                ))}
                {secao.calloutAposParagrafo?.indice === i && (() => {
                  const margens = manualMargemCalloutAposParagrafo(i, secao.paragrafos.length)
                  return (
                    <ManualCalloutBloco
                      callout={secao.calloutAposParagrafo.callout}
                      marginTop={margens.marginTop}
                      marginBottom={margens.marginBottom}
                    />
                  )
                })()}
              </div>
            ))}
          </div>
          {secao.dicaAoLadoImagem ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(200px, 34%) minmax(0, 1fr)',
              gap: 20,
              alignItems: 'start',
            }}>
              <ManualCalloutBloco callout={secao.dicaAoLadoImagem.callout} marginTop={0} />
              <ManualFiguraScreenshot
                src={secao.dicaAoLadoImagem.imagem}
                alt={secao.dicaAoLadoImagem.legenda ?? secao.titulo}
              />
            </div>
          ) : (
            <ManualFiguraScreenshot src={secao.imagem!} alt={secao.titulo} />
          )}
        </div>
        {secao.topicosImagemLateral && secao.topicosImagemLateral.length > 0 && (
          <ManualTopicosImagemLateral topicos={secao.topicosImagemLateral} />
        )}
        </>
      ) : (
        <>
          {secao.paragrafos.map((p, i) => (
            <div key={i}>
              <ManualParagrafo
                texto={p}
                marginBottom={
                  secao.calloutAposParagrafo?.indice === i
                    ? 0
                    : i === secao.paragrafos.length - 1 && !secao.fluxos?.length
                      ? 0
                      : manualMargemParagrafoAntesCallout(
                        i,
                        secao.paragrafos.length,
                        secao.calloutAposParagrafo?.indice,
                      )
                }
              />
              {figurasAposParagrafo(secao, i).map((fig) => (
                <div key={fig.imagem} style={{ margin: `${MANUAL_ESPACO_PARAGRAFO_PX}px 0 ${MANUAL_ESPACO_ENTRE_PASSOS_PX}px` }}>
                  <ManualFiguraScreenshot
                    src={fig.imagem}
                    alt={fig.legenda ?? secao.titulo}
                    larguraMaxima={fig.larguraMaxima}
                  />
                </div>
              ))}
              {galeriaComparacaoAposParagrafoSecao(secao, i).map((galeria) => (
                <ManualGaleriaComparacaoIntro
                  key={galeria.telas.map(t => t.imagem).join('|')}
                  telas={galeria.telas}
                  ampliarInferiorDireito={galeria.ampliarInferiorDireito}
                  colunas={galeria.colunas}
                  textoAcimaEstiloCorpo={galeria.textoAcimaEstiloCorpo}
                  legendaPasso={galeria.legendaPasso}
                  pilaresImportarFormas={galeria.pilaresImportarFormas}
                />
              ))}
              {secao.calloutAposParagrafo?.indice === i && (() => {
                const margens = manualMargemCalloutAposParagrafo(i, secao.paragrafos.length)
                return (
                  <ManualCalloutBloco
                    callout={secao.calloutAposParagrafo.callout}
                    marginTop={margens.marginTop}
                    marginBottom={margens.marginBottom}
                  />
                )
              })()}
            </div>
          ))}

          {secao.topicosImagemLateral && secao.topicosImagemLateral.length > 0 && (
            <ManualTopicosImagemLateral topicos={secao.topicosImagemLateral} />
          )}

          {secao.imagem && !secao.fluxos?.length && (
            <div style={{ marginTop: 20 }}>
              <ManualFiguraScreenshot src={secao.imagem} alt={secao.titulo} />
            </div>
          )}
        </>
      )}

      {secao.mostrarInfograficoOrganizacao && (
        <div style={{ marginTop: 24, marginBottom: 8 }}>
          <ManualInfograficoOrganizacaoConta />
        </div>
      )}

      {secao.origemDados && (
        <ManualBlocoOrigemDados origem={secao.origemDados} />
      )}

      {secao.mostrarInfograficoOrganizacaoWorkspaces && (
        <div style={{ marginTop: 24, marginBottom: 8 }}>
          <ManualInfograficoOrganizacaoWorkspaces />
          <ManualTabelaComparativaOrganizacaoWorkspace />
        </div>
      )}

      {secao.mostrarInfograficoFornecedoresComex && (
        <div style={{ marginTop: 24, marginBottom: 8 }}>
          <ManualInfograficoFornecedoresComex />
        </div>
      )}

      {secao.mostrarInfograficoHubTelas && (
        <div style={{ marginTop: 24, marginBottom: 8 }}>
          <ManualInfograficoHubTelas />
        </div>
      )}

      {secao.mostrarInfograficoSmartDocsDocumentos && (
        <div style={{ marginTop: 24, marginBottom: 8 }}>
          <ManualInfograficoSmartDocsDocumentos />
        </div>
      )}

      {secao.mostrarInfograficoPedidoVisaoGeral && (
        <div style={{ marginTop: 16, marginBottom: 0 }}>
          <ManualInfograficoPedidoVisaoGeral />
        </div>
      )}

      {secao.mostrarInfograficoMapaNavegacaoGravity && (
        <div style={{ marginTop: 24, marginBottom: 8 }}>
          <ManualInfograficoMapaNavegacaoGravity />
        </div>
      )}

      {secao.lista && !secao.mostrarInfograficoPedidoVisaoGeral && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 10,
          marginTop: 20,
        }}>
          {secao.lista.map((item, i) => {
            const { label, desc } = splitLabelDescListaManual(item)
            return (
              <div key={i} style={{
                background: 'rgba(148,163,184,.05)', border: '1px solid rgba(148,163,184,.12)',
                borderRadius: 10, padding: '12px 14px',
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'rgba(99,102,241,.12)', border: '1px solid rgba(99,102,241,.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  fontSize: '.75rem', color: '#818cf8', fontWeight: 700,
                }}>{i + 1}</div>
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    fontWeight: 600, fontSize: '.82rem',
                    color: MANUAL_TITULO_COR, marginBottom: desc ? 3 : 0, lineHeight: 1.35,
                  }}><ManualTextoRich texto={label.trim()} /></p>
                  {desc && <p style={{
                    fontSize: '.78rem',
                    color: MANUAL_CORPO_70, lineHeight: 1.45,
                    textAlign: MANUAL_ALINHAMENTO_CORPO,
                    textJustify: 'inter-word',
                  }}><ManualTextoRich texto={desc} /></p>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {secao.callout && (() => {
        const c = CALLOUT_STYLE[secao.callout!.tipo]
        return (
          <div style={{ background: c.bg, border: `1px solid ${c.borda}`, borderRadius: 8, padding: '12px 16px', marginTop: 14 }}>
            <p style={{ fontSize: '.7rem', fontWeight: 700, color: c.cor, marginBottom: 5, letterSpacing: '.06em', textTransform: 'uppercase' }}>{c.label}</p>
            <p style={MANUAL_ESTILO_CALLOUT_CORPO}><ManualTextoRich texto={secao.callout!.texto} /></p>
          </div>
        )
      })()}
    </div>
  )
}

const INFO_BOX: React.CSSProperties = {
  borderRadius: 10,
  padding: '12px 14px',
  fontSize: '.78rem',
  fontWeight: 600,
  textAlign: 'center',
  lineHeight: 1.35,
}

const INFO_ORG: React.CSSProperties = {
  ...INFO_BOX,
  background: 'rgba(99,102,241,.14)',
  border: '1px solid rgba(129,140,248,.35)',
  color: '#c7d2fe',
}

const INFO_WS: React.CSSProperties = {
  ...INFO_BOX,
  background: 'rgba(148,163,184,.08)',
  border: '1px solid rgba(148,163,184,.2)',
  color: '#e2e8f0',
  fontSize: '.72rem',
  fontWeight: 500,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}

const INFO_ETAPA: React.CSSProperties = {
  ...INFO_BOX,
  background: 'rgba(148,163,184,.06)',
  border: '1px solid rgba(148,163,184,.18)',
  color: '#e2e8f0',
  fontSize: '.72rem',
  fontWeight: 500,
  flex: 1,
  minWidth: 0,
}

const INFO_PILULA: React.CSSProperties = {
  ...INFO_BOX,
  background: 'rgba(251,191,36,.08)',
  border: '1px solid rgba(251,191,36,.22)',
  color: '#fde68a',
  fontSize: '.7rem',
  fontWeight: 600,
  textAlign: 'left',
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
}

export function ManualInfograficoOrganizacaoConta() {
  const etapas = [
    {
      icone: UserPlus,
      cor: '#94a3b8',
      titulo: 'Cadastro',
      subtitulo: 'E-mail e senha em /login',
    },
    {
      icone: IdentificationCard,
      cor: '#a5b4fc',
      titulo: 'Onboarding',
      subtitulo: 'Nome da empresa + CNPJ',
    },
    {
      icone: Crown,
      cor: '#fbbf24',
      titulo: 'Organização',
      subtitulo: 'Conta ativa na Gravity',
    },
  ] as const

  const responsabilidades = [
    { icone: IdentificationCard, texto: 'Identidade legal: CNPJ e razão social' },
    { icone: CreditCard, texto: 'Assinaturas e produtos contratados' },
    { icone: Receipt, texto: 'Faturamento e cobrança da conta' },
    { icone: Users, texto: 'Usuários Master e convites da organização' },
  ] as const

  return (
    <div style={{
      background: 'rgba(148,163,184,.04)',
      border: '1px solid rgba(148,163,184,.14)',
      borderRadius: 16,
      padding: '22px 24px 26px',
    }}>
      <p style={{
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
        color: MANUAL_TIPO.meta, margin: '0 0 18px',
      }}>
        Da conta à empresa: o que é a Organização
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {/* Jornada de criação */}
        <div style={{
          background: 'rgba(99,102,241,.06)',
          border: '1px solid rgba(99,102,241,.2)',
          borderRadius: 14,
          padding: '18px 16px 20px',
        }}>
          <p style={{ fontSize: '.72rem', fontWeight: 800, color: '#818cf8', margin: '0 0 14px', letterSpacing: '.04em' }}>
            Como ela nasce
          </p>
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 6, flexWrap: 'wrap' }}>
            {etapas.map((etapa, i) => {
              const Icone = etapa.icone
              return (
                <React.Fragment key={etapa.titulo}>
                  <div style={INFO_ETAPA}>
                    <Icone size={18} weight="duotone" style={{ marginBottom: 6, color: etapa.cor }} />
                    <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: 2 }}>{etapa.titulo}</div>
                    <div style={{ fontSize: '.66rem', opacity: .85, lineHeight: 1.4 }}>{etapa.subtitulo}</div>
                  </div>
                  {i < etapas.length - 1 && (
                    <div style={{
                      display: 'flex', alignItems: 'center', color: '#64748b', flexShrink: 0, padding: '0 2px',
                    }}>
                      <ArrowRight size={14} weight="bold" />
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </div>
          <p style={{ fontSize: '.72rem', color: MANUAL_CORPO_70, margin: '12px 0 0', lineHeight: 1.5 }}>
            A organização é criada uma única vez, no onboarding. Depois disso você só revisa e atualiza os dados em Configurador → Organização.
          </p>
          <p style={{
            fontSize: '.68rem', fontWeight: 600, color: '#a5b4fc', margin: '10px 0 0',
            letterSpacing: '.03em',
          }}>
            ↓ Veja as telas reais desse passo em &quot;De onde vem esse dado&quot;, logo abaixo
          </p>
        </div>

        {/* Papel na plataforma */}
        <div style={{
          background: 'rgba(251,191,36,.05)',
          border: '1px solid rgba(251,191,36,.18)',
          borderRadius: 14,
          padding: '18px 16px 20px',
        }}>
          <p style={{ fontSize: '.72rem', fontWeight: 800, color: '#fbbf24', margin: '0 0 14px', letterSpacing: '.04em' }}>
            O que fica na organização
          </p>
          <div style={{
            ...INFO_ORG,
            width: '100%',
            marginBottom: 12,
            background: 'rgba(251,191,36,.1)',
            borderColor: 'rgba(251,191,36,.3)',
            color: '#fde68a',
          }}>
            <Crown size={18} weight="duotone" style={{ marginBottom: 4, color: '#fbbf24' }} />
            <div>Empresa contratante</div>
            <div style={{ fontSize: '.68rem', fontWeight: 500, opacity: .85, marginTop: 2 }}>
              Uma conta Gravity = uma organização no contrato
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {responsabilidades.map(({ icone: Icone, texto }) => (
              <div key={texto} style={INFO_PILULA}>
                <Icone size={14} weight="duotone" style={{ flexShrink: 0, marginTop: 1, color: '#fbbf24' }} />
                <span>{texto}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '.72rem', color: MANUAL_CORPO_70, margin: '12px 0 0', lineHeight: 1.5 }}>
            Filiais, clientes e operações do dia a dia ficam nos{' '}
            <Link to="/university-gravity/docs/configurador/workspaces" style={MANUAL_LINK_STYLE}>workspaces</Link>
            {' '},  a organização é a raiz da conta, não a unidade operacional.
          </p>
        </div>
      </div>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '8px 14px', marginTop: 16, paddingTop: 12,
        borderTop: '1px dashed rgba(148,163,184,.15)',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.68rem', color: '#fbbf24' }}>
          <Crown size={13} weight="duotone" /> Organização = identidade e contrato com a Gravity
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.68rem', color: '#94a3b8' }}>
          <IdentificationCard size={13} weight="duotone" /> Nasce no onboarding com nome + CNPJ
        </span>
      </div>
    </div>
  )
}

export function ManualInfograficoOrganizacaoWorkspaces() {
  const definicoesWorkspace = [
    {
      cor: '#818cf8',
      bg: 'rgba(99,102,241,.08)',
      borda: 'rgba(99,102,241,.22)',
      rotulo: 'Matriz e filial do importador e exportador',
    },
    {
      cor: '#34d399',
      bg: 'rgba(52,211,153,.08)',
      borda: 'rgba(52,211,153,.22)',
      rotulo: 'Clientes importadores e exportadores de despachantes, agentes, etc.',
    },
  ] as const

  return (
    <div style={{
      background: 'rgba(148,163,184,.04)',
      border: '1px solid rgba(148,163,184,.14)',
      borderRadius: 16,
      padding: '22px 24px 26px',
    }}>
      <p style={{
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
        color: MANUAL_TIPO.meta, margin: '0 0 14px',
      }}>
        O que é um workspace
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 12,
        marginBottom: 22,
      }}>
        {definicoesWorkspace.map((item) => (
          <div
            key={item.rotulo}
            style={{
              background: item.bg,
              border: `1px solid ${item.borda}`,
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 8,
            }}
          >
            <Buildings size={18} weight="duotone" style={{ color: item.cor, flexShrink: 0 }} />
            <p style={{
              margin: 0,
              fontSize: '.78rem',
              fontWeight: 600,
              color: '#e2e8f0',
              lineHeight: 1.45,
            }}>
              {item.rotulo}
            </p>
            <p style={{
              margin: 0,
              fontSize: '.72rem',
              fontWeight: 800,
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              color: item.cor,
            }}>
              = Workspace
            </p>
          </div>
        ))}
      </div>

      <p style={{
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
        color: MANUAL_TIPO.meta, margin: '0 0 18px',
      }}>
        Organização × Workspaces: dois cenários comuns
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {/* Cenário 1 */}
        <div style={{
          background: 'rgba(99,102,241,.06)',
          border: '1px solid rgba(99,102,241,.2)',
          borderRadius: 14,
          padding: '18px 16px 20px',
        }}>
          <p style={{ fontSize: '.72rem', fontWeight: 800, color: '#818cf8', margin: '0 0 14px', letterSpacing: '.04em' }}>
            Cenário 1: Importador / Exportador
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ ...INFO_ORG, width: '100%' }}>
              <Crown size={16} weight="duotone" style={{ marginBottom: 4, color: '#a5b4fc' }} />
              <div>Organização</div>
              <div style={{ fontSize: '.68rem', fontWeight: 500, opacity: .85, marginTop: 2 }}>Empresa contratante (matriz)</div>
            </div>
            <div style={{ color: '#64748b', fontSize: '.75rem' }}>↓ pode ter 1 ou vários</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
              <div style={INFO_WS}>
                <Buildings size={14} weight="duotone" style={{ marginBottom: 4, color: '#94a3b8' }} />
                <div>
                  Workspace
                  <br />
                  Matriz SP
                </div>
              </div>
              <div style={INFO_WS}>
                <Buildings size={14} weight="duotone" style={{ marginBottom: 4, color: '#94a3b8' }} />
                <div>
                  Workspace
                  <br />
                  Filial RJ
                </div>
              </div>
            </div>
            <p style={{ fontSize: '.72rem', color: MANUAL_CORPO_70, margin: '8px 0 0', lineHeight: 1.5, textAlign: 'center' }}>
              Cada matriz ou filial que importa ou exporta é um workspace com dados isolados.
            </p>
          </div>
        </div>

        {/* Cenário 2 */}
        <div style={{
          background: 'rgba(52,211,153,.06)',
          border: '1px solid rgba(52,211,153,.2)',
          borderRadius: 14,
          padding: '18px 16px 20px',
        }}>
          <p style={{ fontSize: '.72rem', fontWeight: 800, color: '#34d399', margin: '0 0 14px', letterSpacing: '.04em' }}>
            Cenário 2: Despachante / Agente
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ ...INFO_ORG, width: '100%', background: 'rgba(52,211,153,.12)', borderColor: 'rgba(52,211,153,.35)', color: '#a7f3d0' }}>
              <Crown size={16} weight="duotone" style={{ marginBottom: 4, color: '#6ee7b7' }} />
              <div>Organização</div>
              <div style={{ fontSize: '.68rem', fontWeight: 500, opacity: .85, marginTop: 2 }}>Despachante ou agente de carga</div>
            </div>
            <div style={{ color: '#64748b', fontSize: '.75rem' }}>↓ clientes como workspaces</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
              <div style={INFO_WS}>
                <Buildings size={14} weight="duotone" style={{ marginBottom: 4, color: '#94a3b8' }} />
                <div>
                  Workspace
                  <br />
                  Importador A
                </div>
              </div>
              <div style={INFO_WS}>
                <Buildings size={14} weight="duotone" style={{ marginBottom: 4, color: '#94a3b8' }} />
                <div>
                  Workspace
                  <br />
                  Exportador B
                </div>
              </div>
            </div>
            <p style={{ fontSize: '.72rem', color: MANUAL_CORPO_70, margin: '8px 0 0', lineHeight: 1.5, textAlign: 'center' }}>
              Cada cliente importador ou exportador atendido vira um workspace separado.
            </p>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '8px 14px', marginTop: 16, paddingTop: 12,
        borderTop: '1px dashed rgba(148,163,184,.15)',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.68rem', color: '#818cf8' }}>
          <Crown size={13} weight="duotone" /> Organização = quem contrata o Gravity
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.68rem', color: '#94a3b8' }}>
          <Buildings size={13} weight="duotone" /> Workspace = unidade operacional dentro da org
        </span>
      </div>
    </div>
  )
}

export function ManualInfograficoFornecedoresComex() {
  const INFO_FORN: React.CSSProperties = {
    ...INFO_WS,
    padding: '12px 14px',
    fontSize: '.78rem',
    lineHeight: 1.45,
    textAlign: 'center' as const,
  }

  return (
    <div style={{
      background: 'rgba(148,163,184,.04)',
      border: '1px solid rgba(148,163,184,.14)',
      borderRadius: 16,
      padding: '22px 24px 26px',
    }}>
      <p style={{
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
        color: MANUAL_TIPO.meta, margin: '0 0 18px',
      }}>
        Papéis COMEX do fornecedor: relação com a sua operação
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {/* Importação */}
        <div style={{
          background: 'rgba(96,165,250,.06)',
          border: '1px solid rgba(96,165,250,.22)',
          borderRadius: 14,
          padding: '18px 16px 20px',
        }}>
          <p style={{ fontSize: '.72rem', fontWeight: 800, color: '#60a5fa', margin: '0 0 14px', letterSpacing: '.04em' }}>
            Sua operação: Importação
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ ...INFO_ORG, width: '100%', background: 'rgba(96,165,250,.1)', borderColor: 'rgba(96,165,250,.3)', color: '#bfdbfe' }}>
              <Buildings size={16} weight="duotone" style={{ marginBottom: 4, color: '#93c5fd' }} />
              <div>Seu workspace</div>
              <div style={{ fontSize: '.68rem', fontWeight: 500, opacity: .85, marginTop: 2 }}>Quem importa a mercadoria</div>
            </div>
            <ArrowDown size={18} weight="bold" color="#64748b" />
            <div style={{ ...INFO_FORN, width: '100%', borderColor: 'rgba(52,211,153,.35)', background: 'rgba(52,211,153,.08)', color: '#a7f3d0' }}>
              <Truck size={14} weight="duotone" style={{ marginBottom: 4, color: '#34d399' }} />
              <strong>Fornecedor · Exportador</strong>
              <div style={{ fontSize: '.68rem', marginTop: 4, opacity: .9 }}>Vendedor no exterior: exporta para você</div>
            </div>
            <p style={{ fontSize: '.72rem', color: MANUAL_CORPO_70, margin: '8px 0 0', lineHeight: 1.55, textAlign: 'center' }}>
              <strong style={{ color: '#34d399' }}>Exportador na importação</strong>: cadastre o fabricante ou trading company que vende a mercadoria que sua empresa está importando.
            </p>
          </div>
        </div>

        {/* Exportação */}
        <div style={{
          background: 'rgba(52,211,153,.06)',
          border: '1px solid rgba(52,211,153,.2)',
          borderRadius: 14,
          padding: '18px 16px 20px',
        }}>
          <p style={{ fontSize: '.72rem', fontWeight: 800, color: '#34d399', margin: '0 0 14px', letterSpacing: '.04em' }}>
            Sua operação: Exportação
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ ...INFO_ORG, width: '100%', background: 'rgba(52,211,153,.12)', borderColor: 'rgba(52,211,153,.35)', color: '#a7f3d0' }}>
              <Buildings size={16} weight="duotone" style={{ marginBottom: 4, color: '#6ee7b7' }} />
              <div>Seu workspace</div>
              <div style={{ fontSize: '.68rem', fontWeight: 500, opacity: .85, marginTop: 2 }}>Quem exporta a mercadoria</div>
            </div>
            <ArrowUp size={18} weight="bold" color="#64748b" />
            <div style={{ ...INFO_FORN, width: '100%', borderColor: 'rgba(96,165,250,.35)', background: 'rgba(96,165,250,.08)', color: '#bfdbfe' }}>
              <Package size={14} weight="duotone" style={{ marginBottom: 4, color: '#60a5fa' }} />
              <strong>Fornecedor · Importador</strong>
              <div style={{ fontSize: '.68rem', marginTop: 4, opacity: .9 }}>Comprador no exterior: importa de você</div>
            </div>
            <p style={{ fontSize: '.72rem', color: MANUAL_CORPO_70, margin: '8px 0 0', lineHeight: 1.55, textAlign: 'center' }}>
              <strong style={{ color: '#60a5fa' }}>Importador na exportação</strong>: cadastre o cliente estrangeiro que compra a mercadoria que sua empresa exporta. Ele atua como importador na operação.
            </p>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 16,
        padding: '14px 16px',
        background: 'rgba(251,191,36,.05)',
        border: '1px solid rgba(251,191,36,.18)',
        borderRadius: 12,
      }}>
        <p style={{ fontSize: '.75rem', color: MANUAL_CORPO_70, margin: 0, lineHeight: 1.6 }}>
          <strong style={{ color: '#fbbf24' }}>Fornecedor ≠ Workspace.</strong> Workspace é a sua unidade operacional (filial ou cliente do despachante). Fornecedor é um terceiro cadastrado no Configurador: aparece em pedidos, processos, cotações de frete e demais fluxos COMEX. Além de Importador e Exportador, você pode marcar Agente, Despachante, Armador e outros papéis no mesmo cadastro.
        </p>
      </div>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '8px 14px', marginTop: 14, paddingTop: 12,
        borderTop: '1px dashed rgba(148,163,184,.15)',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.68rem', color: '#34d399' }}>
          <Truck size={13} weight="duotone" /> Exportador = vende na sua importação
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.68rem', color: '#60a5fa' }}>
          <Package size={13} weight="duotone" /> Importador = compra na sua exportação
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.68rem', color: '#94a3b8' }}>
          <Handshake size={13} weight="duotone" /> Terceiro cadastrado em Fornecedores
        </span>
      </div>
    </div>
  )
}

interface ManualCamadaPasso {
  id: number
  icone: Icon
  cor: string
  corBorda: string
  corFundo: string
  titulo: string
  descricao: string
  badge?: string
}

function ManualCamadaAcessoFluxo() {
  const [ativo, setAtivo] = useState<number | null>(null)

  const passos: ManualCamadaPasso[] = [
    {
      id: 0,
      icone: User,
      cor: '#94a3b8',
      corBorda: 'rgba(148,163,184,.28)',
      corFundo: 'rgba(148,163,184,.08)',
      titulo: 'Standard ou Fornecedor',
      descricao: 'Convidado pelo Master na organização',
    },
    {
      id: 1,
      icone: Buildings,
      cor: '#818cf8',
      corBorda: 'rgba(99,102,241,.35)',
      corFundo: 'rgba(99,102,241,.1)',
      titulo: '1ª camada · Workspaces',
      descricao: 'Quais unidades pode acessar: uma, várias ou nenhuma até o Master marcar',
      badge: '1',
    },
    {
      id: 2,
      icone: Key,
      cor: '#34d399',
      corBorda: 'rgba(52,211,153,.32)',
      corFundo: 'rgba(52,211,153,.08)',
      titulo: '2ª camada · Permissões',
      descricao: 'Dentro de cada produto: Ver e Editar (Dashboard, Lista, Kanban…)',
      badge: '2',
    },
    {
      id: 3,
      icone: Pulse,
      cor: '#818cf8',
      corBorda: 'rgba(129,140,248,.28)',
      corFundo: 'rgba(129,140,248,.08)',
      titulo: 'Produtos Gravity',
      descricao: 'Só opera nos workspaces e telas liberados nas duas camadas',
    },
  ]

  return (
    <div style={{
      marginBottom: 22,
      padding: '18px 20px 20px',
      background: 'linear-gradient(135deg, rgba(99,102,241,.08) 0%, rgba(8,12,24,.35) 50%, rgba(52,211,153,.06) 100%)',
      border: '1px solid rgba(99,102,241,.2)',
      borderRadius: 14,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,102,241,.08), transparent 70%)',
      }} />
      <p style={{
        position: 'relative',
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
        color: '#a5b4fc', margin: '0 0 16px',
      }}>
        Fluxo de acesso: Standard e Fornecedor
      </p>
      <div style={{
        position: 'relative',
        display: 'flex', alignItems: 'stretch', gap: 6, flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {passos.map((passo, i) => {
          const Icone = passo.icone
          const destacado = ativo === passo.id
          const vizinho = ativo !== null && (ativo === passo.id, 1 || ativo === passo.id + 1)
          return (
            <React.Fragment key={passo.id}>
              <div
                role="group"
                tabIndex={0}
                onMouseEnter={() => setAtivo(passo.id)}
                onMouseLeave={() => setAtivo(null)}
                onFocus={() => setAtivo(passo.id)}
                onBlur={() => setAtivo(null)}
                style={{
                  position: 'relative',
                  flex: '1 1 130px',
                  minWidth: 120,
                  maxWidth: 200,
                  padding: '14px 12px',
                  borderRadius: 12,
                  textAlign: 'center',
                  fontSize: '.72rem',
                  lineHeight: 1.45,
                  cursor: 'default',
                  outline: 'none',
                  background: passo.corFundo,
                  border: `1px solid ${destacado ? passo.cor : passo.corBorda}`,
                  boxShadow: destacado ? `0 8px 24px ${passo.corFundo}, 0 0 0 1px ${passo.corBorda}` : 'none',
                  transform: destacado ? 'translateY(-3px) scale(1.02)' : 'none',
                  transition: 'transform .2s ease, box-shadow .2s ease, border-color .2s ease',
                }}
              >
                {passo.badge && (
                  <span style={{
                    position: 'absolute',
                    top: -10,
                    right: 10,
                    width: 20, height: 20, borderRadius: 999,
                    background: passo.cor, color: '#0f172a',
                    fontSize: '.62rem', fontWeight: 800,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,.25)',
                  }}>{passo.badge}</span>
                )}
                <Icone size={20} weight="duotone" style={{ marginBottom: 8, color: passo.cor }} />
                <div style={{ fontWeight: 700, marginBottom: 5, color: '#e2e8f0', fontSize: '.74rem' }}>{passo.titulo}</div>
                <div style={{ fontSize: '.66rem', color: MANUAL_CORPO_70 }}>
                  <ManualTextoRichLinha texto={textoComLinkWorkspaces(passo.descricao)} />
                </div>
              </div>
              {i < passos.length - 1 && (
                <div style={{
                  display: 'flex', alignItems: 'center', color: destacado || vizinho ? passo.cor : '#475569',
                  flexShrink: 0, padding: '0 2px',
                  transition: 'color .2s ease, transform .2s ease',
                  transform: destacado ? 'translateX(2px)' : 'none',
                }}>
                  <ArrowRight size={16} weight="bold" />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
      <div style={{
        position: 'relative',
        marginTop: 16,
        padding: '10px 14px',
        borderRadius: 10,
        background: 'rgba(251,191,36,.08)',
        border: '1px solid rgba(251,191,36,.22)',
        display: 'flex', alignItems: 'center', gap: 10,
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        <Crown size={16} weight="duotone" color="#fbbf24" />
        <span style={{ fontSize: '.74rem', color: MANUAL_CORPO_70, lineHeight: 1.5, textAlign: 'center' }}>
          <strong style={{ color: '#fde68a' }}>Master</strong> ignora este fluxo: acesso irrestrito em toda a organização
        </span>
      </div>
    </div>
  )
}

export function ManualInfograficoPermissoesUsuario() {
  const cardBase: React.CSSProperties = {
    borderRadius: 12,
    padding: '14px 16px',
    background: 'rgba(8,12,24,.28)',
    border: '1px solid rgba(148,163,184,.14)',
  }

  const telasPadrao: { icone: Icon; rotulo: string }[] = [
    { icone: ChartBar, rotulo: 'Dashboard' },
    { icone: List, rotulo: 'Lista' },
    { icone: SquaresFour, rotulo: 'Kanban' },
    { icone: ChartBar, rotulo: 'Relatórios' },
    { icone: ClockCounterClockwise, rotulo: 'Histórico' },
    { icone: Gear, rotulo: 'Configuração' },
  ]

  return (
    <div style={{
      background: 'rgba(99,102,241,.04)',
      border: '1px solid rgba(99,102,241,.18)',
      borderRadius: 16,
      padding: '20px 22px 22px',
    }}>
      <p style={{
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
        color: MANUAL_TIPO.meta, margin: '0 0 16px',
      }}>
        Como funcionam as permissões granulares
      </p>

      <p style={{ ...MANUAL_ESTILO_CORPO, margin: '0 0 16px', fontSize: '.82rem' }}>
        Cada Produto Gravity contratado pela organização aparece como um bloco na aba Permissões.
        Por linha, você define se o usuário só consulta ou também altera dados naquela visualização.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
        }}>
        <div style={{
          ...cardBase,
          background: 'linear-gradient(145deg, rgba(99,102,241,.1) 0%, rgba(99,102,241,.03) 100%)',
          borderColor: 'rgba(129,140,248,.28)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'rgba(99,102,241,.15)', border: '1px solid rgba(129,140,248,.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Eye size={18} weight="duotone" color="#818cf8" />
            </span>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '.88rem', color: '#c7d2fe' }}>Ver</p>
          </div>
          <p style={{ margin: 0, fontSize: '.76rem', color: MANUAL_CORPO_70, lineHeight: 1.55 }}>
            O usuário acessa a tela e consulta informações, sem alterar registros.
            Use quando a pessoa só precisa acompanhar ou extrair dados.
          </p>
        </div>

        <div style={{
          ...cardBase,
          background: 'linear-gradient(145deg, rgba(52,211,153,.08) 0%, rgba(52,211,153,.02) 100%)',
          borderColor: 'rgba(52,211,153,.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'rgba(52,211,153,.12)', border: '1px solid rgba(52,211,153,.28)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PencilSimple size={18} weight="duotone" color="#34d399" />
            </span>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '.88rem', color: '#a7f3d0' }}>Editar</p>
          </div>
          <p style={{ margin: 0, fontSize: '.76rem', color: MANUAL_CORPO_70, lineHeight: 1.55 }}>
            Inclui tudo de Ver e permite criar, alterar ou excluir naquela visualização.
            Marque só onde a operação exige mudança de dados.
          </p>
        </div>
        </div>

        <div style={{
          ...cardBase,
          background: 'rgba(148,163,184,.04)',
        }}>
        <p style={{
          margin: '0 0 12px', fontSize: '.72rem', fontWeight: 800, letterSpacing: '.05em',
          textTransform: 'uppercase', color: '#94a3b8',
        }}>
          Visualizações padrão por produto
        </p>
        <p style={{ margin: '0 0 14px', fontSize: '.76rem', color: MANUAL_CORPO_70, lineHeight: 1.55 }}>
          Cada produto segue o mesmo padrão de telas. Na grade, localize o produto (ex.: Pedido, Smart Docs)
          e marque Ver ou Editar na linha correspondente: basta selecionar o local indicado.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {telasPadrao.map(({ icone: Icone, rotulo }) => (
            <span key={rotulo} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 999,
              background: 'rgba(99,102,241,.08)', border: '1px solid rgba(129,140,248,.22)',
              fontSize: '.72rem', fontWeight: 600, color: '#c7d2fe',
            }}>
              <Icone size={14} weight="duotone" color="#818cf8" />
              {rotulo}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          <ManualFiguraScreenshot
            src={SCREENSHOT_USUARIOS_PERMISSAO_MODAL}
            alt="Modal Editar usuário — aba Permissões com colunas Ver e Editar"
          />
        </div>
        </div>
      </div>
    </div>
  )
}

function ManualBlocoFornecedorInteracao() {
  const itemBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '14px 16px',
    borderRadius: 12,
    background: 'rgba(8,12,24,.25)',
    border: '1px solid rgba(148,163,184,.12)',
  }

  return (
    <div style={{
      marginTop: 18,
      padding: '16px 18px 18px',
      borderRadius: 14,
      background: 'linear-gradient(145deg, rgba(52,211,153,.08) 0%, rgba(52,211,153,.02) 100%)',
      border: '1px solid rgba(52,211,153,.22)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Handshake size={18} weight="duotone" color="#34d399" />
        <p style={{
          margin: 0, fontSize: '.72rem', fontWeight: 800, letterSpacing: '.06em',
          textTransform: 'uppercase', color: '#6ee7b7',
        }}>
          Fornecedor: como interage com a organização
        </p>
      </div>
      <p style={{ fontSize: '.78rem', color: MANUAL_CORPO_70, margin: '0 0 14px', lineHeight: 1.55 }}>
        O parceiro pode operar com a organização de duas formas. O Master escolhe qual modelo usar;
        <strong style={{ color: '#a7f3d0' }}> o acesso à plataforma não é obrigatório</strong>.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
        <div style={itemBase}>
          <span style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: 'rgba(99,102,241,.12)', border: '1px solid rgba(129,140,248,.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Desktop size={18} weight="duotone" color="#818cf8" />
          </span>
          <div>
            <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '.8rem', color: '#e2e8f0' }}>
              Com usuário na plataforma
            </p>
            <p style={{ margin: 0, fontSize: '.74rem', color: MANUAL_CORPO_70, lineHeight: 1.5 }}>
              O Master convida um usuário tipo Fornecedor. A pessoa acessa as telas liberadas
              {' '}(<ManualTextoRichLinha texto={`{{link:/university-gravity/docs/configurador/workspaces|workspaces}} e ${LINK_MANUAL_PERMISSOES} granulares`} />).
            </p>
          </div>
        </div>
        <div style={itemBase}>
          <span style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: 'rgba(52,211,153,.1)', border: '1px solid rgba(52,211,153,.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <EnvelopeSimple size={18} weight="duotone" color="#34d399" />
          </span>
          <div>
            <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '.8rem', color: '#e2e8f0' }}>
              Só por e-mail, sem acesso
            </p>
            <p style={{ margin: 0, fontSize: '.74rem', color: MANUAL_CORPO_70, lineHeight: 1.5 }}>
              Se o Master preferir, não há convite nem login. As interações ocorrem por respostas
              de e-mail, fora do Gravity.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const PAPEL_FORNECEDOR_INFO: {
  label: string
  descricao: string
  cor: string
  icone: React.ReactNode
}[] = [
  { label: 'Fabricante', descricao: 'Quem produz a mercadoria negociada na operação.', cor: '#fbbf24', icone: <Factory weight="duotone" size={16} /> },
  { label: 'Agente de Carga', descricao: 'Logística internacional: contrata frete, consolida cargas e coordena o embarque.', cor: '#c084fc', icone: <UserGear weight="duotone" size={16} /> },
  { label: 'Despachante Aduaneiro', descricao: 'Representante legal da empresa perante a Receita: desembaraço e compliance aduaneiro.', cor: '#f472b6', icone: <ShieldStar weight="duotone" size={16} /> },
  { label: 'Armador', descricao: 'Companhia marítima que opera o navio e o espaço no porão/contêiner.', cor: '#22d3ee', icone: <Boat weight="duotone" size={16} /> },
  { label: 'Cia Aérea', descricao: 'Transporte aéreo de carga: AWB e embarques urgentes.', cor: '#818cf8', icone: <Airplane weight="duotone" size={16} /> },
  { label: 'Transportadora Rodoviária', descricao: 'Coleta e entrega no trecho nacional ou internacional por rodovia.', cor: '#a3e635', icone: <TruckTrailer weight="duotone" size={16} /> },
  { label: 'Armazém Alfandegado', descricao: 'Recinto alfandegado: mercadoria sob controle aduaneiro antes do desembaraço.', cor: '#fb923c', icone: <Warehouse weight="duotone" size={16} /> },
  { label: 'Armazém Nacional', descricao: 'Armazenagem geral fora de regime alfandegado.', cor: '#fdba74', icone: <Warehouse weight="duotone" size={16} /> },
  { label: 'Banco', descricao: 'Instituição financeira em operações de comércio exterior.', cor: '#10b981', icone: <Bank weight="duotone" size={16} /> },
  { label: 'Seguradora / Corretora', descricao: 'Seguro de carga internacional ou corretagem de câmbio.', cor: '#06b6d4', icone: <ShieldCheck weight="duotone" size={16} /> },
]

export function ManualInfograficoPapeisFornecedor() {
  return (
    <div style={{
      background: 'rgba(148,163,184,.04)',
      border: '1px solid rgba(148,163,184,.14)',
      borderRadius: 16,
      padding: '22px 24px 26px',
    }}>
      <p style={{
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
        color: MANUAL_TIPO.meta, margin: '0 0 6px',
      }}>
        Outros papéis COMEX: o que é cada um
      </p>
      <p style={{ fontSize: '.75rem', color: MANUAL_CORPO_70, margin: '0 0 16px', lineHeight: 1.55 }}>
        Marque na aba Papéis COMEX todos os papéis que o terceiro exerce. A plataforma usa esses flags para filtrar dropdowns, convites e cotações.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 10,
      }}>
        {PAPEL_FORNECEDOR_INFO.map((papel) => (
          <div
            key={papel.label}
            style={{
              background: `${papel.cor}0d`,
              border: `1px solid ${papel.cor}33`,
              borderRadius: 10,
              padding: '12px 14px',
            }}
          >
            <p style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: '.72rem', fontWeight: 700, color: papel.cor, margin: '0 0 6px',
            }}>
              {papel.icone}
              {papel.label}
            </p>
            <p style={{ fontSize: '.7rem', color: MANUAL_CORPO_70, margin: 0, lineHeight: 1.45 }}>
              {papel.descricao}
            </p>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 16,
        padding: '14px 16px',
        background: 'rgba(99,102,241,.06)',
        border: '1px solid rgba(99,102,241,.2)',
        borderRadius: 12,
      }}>
        <p style={{ fontSize: '.75rem', color: MANUAL_CORPO_70, margin: '0 0 10px', lineHeight: 1.6 }}>
          <strong style={{ color: '#a5b4fc' }}>Uma empresa, vários papéis.</strong> O mesmo CNPJ ou TIN pode ser Despachante e Agente de Carga: marque os dois no mesmo cadastro. Os chips na listagem mostram a combinação (ex.: Despachante + Agente).
        </p>
        <p style={{ fontSize: '.75rem', color: MANUAL_CORPO_70, margin: 0, lineHeight: 1.6 }}>
          <strong style={{ color: '#a5b4fc' }}>Por que cadastrar bem?</strong> Contato correto para comunicações e convites · seleção em cotações de frete e câmbio · vínculo de usuários tipo Fornecedor · registros consistentes em Pedido, Processo e documentos legais.
        </p>
      </div>
    </div>
  )
}

export function ManualInfograficoTiposUsuario() {
  const tipos = [
    {
      icone: Crown,
      cor: '#fbbf24',
      titulo: 'Master',
      subtitulo: 'Administrador da Empresa e todos os Workspaces',
      pilulas: ['Acesso total: sem camadas', 'Convida e edita usuários', 'Todos os workspaces e Produtos Gravity'],
    },
    {
      icone: User,
      cor: '#818cf8',
      titulo: 'Standard',
      subtitulo: 'Colaborador interno da Organização',
      pilulas: ['1º Workspaces habilitados', '2º Permissões granulares', 'Só opera onde o Master liberar'],
    },
    {
      icone: Handshake,
      cor: '#34d399',
      titulo: 'Fornecedor',
      subtitulo: 'Parceiro externo',
      pilulas: ['1º Workspaces habilitados', '2º Permissões sempre granulares', 'Plataforma opcional: ou só e-mail'],
    },
  ] as const

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{
        background: 'rgba(148,163,184,.04)',
        border: '1px solid rgba(148,163,184,.14)',
        borderRadius: 16,
        padding: '22px 24px 26px',
      }}>
        <p style={{
          fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
          color: MANUAL_TIPO.meta, margin: '0 0 18px',
        }}>
          Tipos de usuário na organização
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        <div style={{
          background: 'rgba(251,191,36,.05)',
          border: '1px solid rgba(251,191,36,.18)',
          borderRadius: 14,
          padding: '18px 16px 20px',
        }}>
          <p style={{ fontSize: '.72rem', fontWeight: 800, color: '#fbbf24', margin: '0 0 14px', letterSpacing: '.04em' }}>
            Quem gerencia a conta
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{
              ...INFO_ORG,
              width: '100%',
              background: 'rgba(251,191,36,.1)',
              borderColor: 'rgba(251,191,36,.3)',
              color: '#fde68a',
            }}>
              <Crown size={18} weight="duotone" style={{ marginBottom: 4, color: '#fbbf24' }} />
              <div>Master</div>
              <div style={{ fontSize: '.68rem', fontWeight: 500, opacity: .85, marginTop: 2 }}>
                Primeiro usuário da organização: sempre Master
              </div>
            </div>
            <div
              role="presentation"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                gap: 5,
                padding: '4px 0 2px',
              }}
            >
              <div style={{
                width: 1,
                height: 14,
                borderRadius: 1,
                background: 'linear-gradient(180deg, rgba(251,191,36,.35), rgba(251,191,36,.08))',
              }} />
              <span style={{
                fontSize: '.72rem',
                fontWeight: 600,
                color: '#e7d4a8',
                letterSpacing: '.01em',
                lineHeight: 1.4,
                textAlign: 'center',
              }}>
                convida e define acesso
              </span>
              <ArrowDown size={13} weight="bold" color="rgba(251, 191, 36, 0.45)" aria-hidden />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
              <div style={INFO_WS}>
                <User size={14} weight="duotone" style={{ marginBottom: 4, color: '#818cf8' }} />
                <div>
                  Standard
                  <br />
                  Equipe interna
                </div>
              </div>
              <div style={INFO_WS}>
                <Handshake size={14} weight="duotone" style={{ marginBottom: 4, color: '#34d399' }} />
                <div>
                  Fornecedor
                  <br />
                  Parceiro externo
                </div>
              </div>
            </div>
            <p style={{ fontSize: '.72rem', color: MANUAL_CORPO_70, margin: '8px 0 0', lineHeight: 1.5, textAlign: 'center' }}>
              Só o Master convida pessoas e altera patentes, permissões e{' '}
              <Link to={LINK_DOC_WORKSPACES} style={MANUAL_LINK_STYLE}>workspaces</Link>
              {' '}de outros usuários.
            </p>
          </div>
        </div>

        <div style={{
          background: 'rgba(99,102,241,.06)',
          border: '1px solid rgba(99,102,241,.2)',
          borderRadius: 14,
          padding: '18px 16px 20px',
        }}>
          <p style={{ fontSize: '.72rem', fontWeight: 800, color: '#818cf8', margin: '0 0 14px', letterSpacing: '.04em' }}>
            O que muda entre os tipos
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tipos.map(({ icone: Icone, cor, titulo, subtitulo, pilulas }) => (
              <div
                key={titulo}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${cor}55`
                  e.currentTarget.style.transform = 'translateX(4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(148,163,184,.12)'
                  e.currentTarget.style.transform = 'none'
                }}
                style={{
                  background: 'rgba(8,12,24,.2)',
                  border: '1px solid rgba(148,163,184,.12)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  transition: 'transform .18s ease, border-color .18s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Icone size={16} weight="duotone" style={{ color: cor, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '.82rem', color: '#e2e8f0' }}>{titulo}</div>
                    <div style={{ fontSize: '.68rem', color: MANUAL_CORPO_70 }}>
                      <ManualTextoRichLinha texto={textoComLinkWorkspaces(subtitulo)} />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {pilulas.map((texto) => (
                    <span key={texto} style={{
                      ...INFO_PILULA,
                      fontSize: '.66rem',
                      padding: '4px 8px',
                    }}>
                      <ManualTextoRichLinha texto={textoComLinkWorkspaces(texto)} />
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '.72rem', color: MANUAL_CORPO_70, margin: '12px 0 0', lineHeight: 1.5 }}>
            Standard e Fornecedor enxergam somente a si mesmos na lista de Usuários. O Master vê toda a organização.
          </p>
        </div>
      </div>

        <ManualTabelaComparativaTiposUsuario />
      </div>

      <ManualBlocoFornecedorInteracao />

      <ManualParagrafo
        texto={`O **Master** configura cada **Standard** e **Fornecedor** em três passos: quais ${textoComLinkWorkspaces('workspaces')} a pessoa acessa, quais **permissões** (telas e ações) tem nesses ambientes e qual ou quais **produtos Gravity** ficam liberados.`}
        marginBottom={0}
      />

      <ManualCamadaAcessoFluxo />
    </div>
  )
}

const HISTORICO_TABELA_TH: React.CSSProperties = {
  padding: '11px 14px',
  textAlign: 'left',
  fontSize: '.66rem',
  fontWeight: 700,
  letterSpacing: '.06em',
  textTransform: 'uppercase',
  borderBottom: '1px solid rgba(148,163,184,.15)',
}

const HISTORICO_TABELA_TD: React.CSSProperties = {
  padding: '11px 14px',
  fontSize: '.76rem',
  lineHeight: 1.45,
  verticalAlign: 'top',
  borderBottom: '1px solid rgba(148,163,184,.08)',
  color: '#e2e8f0',
}

function ManualHistoricoTabelaSecao({ secao }: { secao: HistoricoCatalogoSecao }) {
  const minWidth = Math.max(480, secao.colunas.length * 110)

  return (
    <div style={{
      marginTop: 18,
      borderRadius: 14,
      border: '1px solid rgba(148,163,184,.14)',
      background: 'linear-gradient(145deg, rgba(99,102,241,.06) 0%, rgba(148,163,184,.04) 50%, rgba(52,211,153,.04) 100%)',
      boxShadow: '0 8px 32px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.04)',
      overflow: 'hidden',
    }}>
      <p style={{
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
        color: MANUAL_TIPO.meta, margin: 0, padding: '14px 16px 12px',
        borderBottom: '1px solid rgba(148,163,184,.1)',
      }}>
        {secao.titulo}
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {secao.colunas.map((col) => (
                <th
                  key={col.chave}
                  style={{
                    ...HISTORICO_TABELA_TH,
                    width: col.largura,
                    color: col.destaque ? '#a5b4fc' : '#94a3b8',
                    background: col.destaque ? 'rgba(99,102,241,.08)' : 'transparent',
                  }}
                >
                  {col.rotulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {secao.linhas.map((linha, i) => (
              <tr
                key={`${secao.titulo}-${i}`}
                style={{ background: i % 2 === 0 ? 'rgba(8,12,24,.15)' : 'transparent' }}
              >
                {secao.colunas.map((col) => {
                  const valor = linha[col.chave] ?? ''
                  const ehNum = col.chave === 'num'
                  const ehTecnico = col.chave === 'acao' || col.chave === 'campo' || col.chave === 'gatilho' || col.chave === 'prefixo'
                  const ehUsuario = col.chave === 'traducao'
                  return (
                    <td
                      key={col.chave}
                      style={{
                        ...HISTORICO_TABELA_TD,
                        fontWeight: ehNum || col.destaque || ehUsuario ? 600 : 400,
                        color: ehNum ? '#94a3b8' : '#e2e8f0',
                        background: col.destaque ? 'rgba(99,102,241,.04)' : undefined,
                        fontFamily: ehTecnico
                          ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
                          : undefined,
                        fontSize: ehTecnico ? '.7rem' : '.76rem',
                      }}
                    >
                      <ManualTextoRich texto={valor} />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {secao.notaRodape && (
        <p style={{
          margin: 0,
          padding: '10px 16px 14px',
          fontSize: '.72rem',
          lineHeight: 1.5,
          color: MANUAL_CORPO_70,
          borderTop: '1px solid rgba(148,163,184,.08)',
        }}>
          <ManualTextoRich texto={secao.notaRodape} />
        </p>
      )}
    </div>
  )
}

function ManualCatalogoHistoricoCompleto() {
  return (
    <div style={{ marginTop: 8, marginBottom: 8 }}>
      {HISTORICO_CATALOGO_SECOES.map((secao) => (
        <ManualHistoricoTabelaSecao key={secao.titulo} secao={secao} />
      ))}
    </div>
  )
}

const COMPARATIVO_TIPOS_USUARIO: {
  criterio: string
  master: string
  standard: string
  fornecedor: string
}[] = [
  {
    criterio: 'Camadas de acesso',
    master: 'Nenhuma: acesso direto a tudo',
    standard: '1º workspaces habilitados · 2º permissões granulares por produto',
    fornecedor: '1º workspaces habilitados · 2º permissões granulares (obrigatórias)',
  },
  {
    criterio: 'O que é',
    master: 'Administrador da Empresa e todos os Workspaces',
    standard: 'Colaborador interno da empresa que contratou Gravity (Organização)',
    fornecedor: 'Usuário de empresa parceira (frete, câmbio, despacho etc.)',
  },
  {
    criterio: 'Escopo',
    master: 'Toda a organização e todos os workspaces',
    standard: 'Apenas o que o Master liberar',
    fornecedor: 'Apenas recursos explicitamente liberados',
  },
  {
    criterio: 'Workspaces',
    master: 'Acesso automático a todos: sem vínculo manual',
    standard: 'Somente unidades marcadas: sem marcação, não entra no workspace',
    fornecedor: 'Somente unidades marcadas + empresa fornecedora vinculada',
  },
  {
    criterio: 'Permissões granulares',
    master: 'Não se aplica: bypass total',
    standard: 'Ver e Editar por produto (Dashboard, Lista, Kanban…): definidas pelo Master',
    fornecedor: 'Obrigatórias: sempre Ver/Editar explícito por produto',
  },
  {
    criterio: 'Configurador',
    master: 'Acesso total às áreas da organização',
    standard: 'Somente áreas com permissão marcada',
    fornecedor: 'Somente áreas com permissão marcada',
  },
  {
    criterio: 'Produtos Gravity',
    master: 'Todos os produtos contratados pela organização',
    standard: 'Conforme permissões granulares por produto',
    fornecedor: 'Conforme permissões granulares: sempre obrigatórias',
  },
  {
    criterio: 'Convida usuários',
    master: 'Sim: Master, Standard e Fornecedor',
    standard: 'Não',
    fornecedor: 'Não',
  },
  {
    criterio: 'Lista de Usuários',
    master: 'Vê todos os usuários da organização',
    standard: 'Vê somente a si',
    fornecedor: 'Vê somente a si',
  },
  {
    criterio: 'Acesso à plataforma',
    master: ', ',
    standard: 'Sempre: opera nas telas liberadas pelo Master',
    fornecedor: 'Opcional: usuário nas telas ou só interação por e-mail, sem login',
  },
  {
    criterio: 'Quem atribui',
    master: 'Sistema: primeiro usuário da conta',
    standard: 'Master da organização',
    fornecedor: 'Master da organização',
  },
]

function ManualTabelaComparativaTiposUsuario() {
  const thBase: React.CSSProperties = {
    padding: '12px 14px',
    textAlign: 'left',
    fontSize: '.66rem',
    fontWeight: 700,
    letterSpacing: '.06em',
    textTransform: 'uppercase',
    borderBottom: '1px solid rgba(148,163,184,.15)',
  }

  const tdBase: React.CSSProperties = {
    padding: '12px 14px',
    fontSize: '.76rem',
    lineHeight: 1.5,
    verticalAlign: 'top',
    borderBottom: '1px solid rgba(148,163,184,.08)',
  }

  return (
    <div style={{
      marginTop: 20,
      borderRadius: 14,
      border: '1px solid rgba(148,163,184,.14)',
      background: 'linear-gradient(145deg, rgba(251,191,36,.06) 0%, rgba(99,102,241,.05) 45%, rgba(52,211,153,.04) 100%)',
      boxShadow: '0 8px 32px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.04)',
      overflow: 'hidden',
    }}>
      <p style={{
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
        color: MANUAL_TIPO.meta, margin: 0, padding: '16px 18px 14px',
        borderBottom: '1px solid rgba(148,163,184,.1)',
      }}>
        Comparativo: Master × Standard × Fornecedor
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 680, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thBase, color: '#94a3b8', width: '18%' }}>Critério</th>
              <th style={{
                ...thBase,
                color: '#fde68a',
                background: 'rgba(251,191,36,.08)',
                width: '27%',
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Crown size={14} weight="duotone" />
                  Master
                </span>
              </th>
              <th style={{
                ...thBase,
                color: '#a5b4fc',
                background: 'rgba(99,102,241,.08)',
                width: '27%',
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <User size={14} weight="duotone" />
                  Standard
                </span>
              </th>
              <th style={{
                ...thBase,
                color: '#6ee7b7',
                background: 'rgba(52,211,153,.06)',
                width: '28%',
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Handshake size={14} weight="duotone" />
                  Fornecedor
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARATIVO_TIPOS_USUARIO.map((linha, i) => (
              <tr
                key={linha.criterio}
                style={{ background: i % 2 === 0 ? 'rgba(8,12,24,.15)' : 'transparent' }}
              >
                <td style={{ ...tdBase, fontWeight: 600, color: '#94a3b8' }}>
                  <ManualTextoRichLinha texto={textoComLinkWorkspaces(linha.criterio)} />
                </td>
                <td style={{ ...tdBase, color: '#e2e8f0', background: 'rgba(251,191,36,.04)' }}>
                  <ManualTextoRichLinha texto={textoComLinkWorkspaces(linha.master)} />
                </td>
                <td style={{ ...tdBase, color: '#e2e8f0', background: 'rgba(99,102,241,.04)' }}>
                  <ManualTextoRichLinha texto={textoComLinkWorkspaces(linha.standard)} />
                </td>
                <td style={{ ...tdBase, color: '#e2e8f0', background: 'rgba(52,211,153,.03)' }}>
                  <ManualTextoRichLinha texto={textoComLinkWorkspaces(linha.fornecedor)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const COMPARATIVO_ORG_WS: { criterio: string; organizacao: string; workspace: string }[] = [
  {
    criterio: 'O que é',
    organizacao: 'Empresa que contrata o Gravity',
    workspace: 'Matriz e filial do importador/exportador, ou cliente de despachante e agente',
  },
  {
    criterio: 'Quantidade',
    organizacao: 'Uma por contrato / conta Gravity',
    workspace: 'Uma ou várias por organização — o usuário Master decide quantas criar',
  },
  {
    criterio: 'Como nasce',
    organizacao: 'Primeiro acesso do usuário Master: no onboarding, informa nome da empresa e CNPJ',
    workspace: 'Usuário Master cria novo workspace em Configurador → Workspaces',
  },
  {
    criterio: 'Identidade legal',
    organizacao: 'CNPJ da empresa contratante (bloqueado após onboarding)',
    workspace: 'CNPJ próprio da filial ou do cliente, quando aplicável',
  },
  {
    criterio: 'Registros operacionais',
    organizacao: 'Não concentra operações: apenas gestão da conta (contrato, usuários, assinaturas)',
    workspace: 'DUIMP, Pedidos, Cotações de frete, Câmbio e demais registros ficam sempre no workspace',
  },
  {
    criterio: 'Faturamento',
    organizacao: 'Assinaturas, planos e cobrança da conta',
    workspace: 'Não fatura: consome produtos da organização',
  },
  {
    criterio: 'Quem acessa',
    organizacao: 'Usuários Master veem toda a conta',
    workspace: 'Standard e Fornecedor só veem workspaces vinculados',
  },
  {
    criterio: 'Exemplos',
    organizacao: 'Matriz importadora, despachante de carga',
    workspace: 'Filial RJ, Importador A, Exportador B',
  },
]

export function ManualTabelaComparativaOrganizacaoWorkspace() {
  const thBase: React.CSSProperties = {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '.68rem',
    fontWeight: 700,
    letterSpacing: '.06em',
    textTransform: 'uppercase',
    borderBottom: '1px solid rgba(148,163,184,.15)',
  }

  const tdBase: React.CSSProperties = {
    padding: '12px 16px',
    fontSize: '.78rem',
    lineHeight: 1.5,
    verticalAlign: 'top',
    borderBottom: '1px solid rgba(148,163,184,.08)',
  }

  return (
    <div style={{
      marginTop: 20,
      borderRadius: 14,
      border: '1px solid rgba(148,163,184,.14)',
      background: 'linear-gradient(145deg, rgba(99,102,241,.06) 0%, rgba(148,163,184,.04) 50%, rgba(52,211,153,.04) 100%)',
      boxShadow: '0 8px 32px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.04)',
      overflow: 'hidden',
    }}>
      <p style={{
        fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
        color: MANUAL_TIPO.meta, margin: 0, padding: '16px 18px 14px',
        borderBottom: '1px solid rgba(148,163,184,.1)',
      }}>
        Comparativo: Organização × Workspace
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 520, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thBase, color: '#94a3b8', width: '22%' }}>Critério</th>
              <th style={{
                ...thBase,
                color: '#a5b4fc',
                background: 'rgba(99,102,241,.08)',
                width: '39%',
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Crown size={14} weight="duotone" />
                  Organização
                </span>
              </th>
              <th style={{
                ...thBase,
                color: '#cbd5e1',
                background: 'rgba(148,163,184,.06)',
                width: '39%',
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Buildings size={14} weight="duotone" />
                  Workspace
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARATIVO_ORG_WS.map((linha, i) => (
              <tr
                key={linha.criterio}
                style={{
                  background: i % 2 === 0 ? 'rgba(8,12,24,.15)' : 'transparent',
                }}
              >
                <td style={{ ...tdBase, fontWeight: 600, color: '#94a3b8' }}>{linha.criterio}</td>
                <td style={{ ...tdBase, color: '#e2e8f0', background: 'rgba(99,102,241,.04)' }}>
                  {linha.organizacao}
                </td>
                <td style={{ ...tdBase, color: '#e2e8f0', background: 'rgba(148,163,184,.03)' }}>
                  {linha.workspace}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const MANUAL_ESTILO_BOTAO_SUMARIO: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '2px 0',
  textAlign: 'left',
  lineHeight: 1.4,
  borderRadius: 6,
  transition: 'color .15s, background .15s',
}

function ManualSumarioLinhaSubitem({
  item,
  profundidade,
  onIr,
}: {
  item: DocItemSumarioManual
  profundidade: number
  onIr: (item: DocItemSumarioManual) => void
}) {
  const leitura = useContext(ManualLeituraContext)
  const subLido = item.elementoScroll ? leitura?.isLido(item.elementoScroll) : false
  const rotulo = item.rotulo
  const nivel = item.subitemNivel ?? profundidade + 1

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minWidth: 0,
        paddingTop: profundidade === 0 ? 2 : 0,
        paddingBottom: profundidade === 0 ? 2 : 0,
      }}
    >
      <span
        title={item.rotulo}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 'auto',
          padding: '2px 6px',
          borderRadius: 6,
          fontSize: '.66rem',
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '.02em',
          color: nivel <= 1 ? '#a5b4fc' : '#94a3b8',
          background: nivel <= 1 ? 'rgba(99,102,241,.12)' : 'rgba(148,163,184,.08)',
          border: `1px solid ${nivel <= 1 ? 'rgba(129,140,248,.25)' : 'rgba(148,163,184,.14)'}`,
          flexShrink: 0,
        }}
      >
        {rotulo}
      </span>
      {subLido && (
        <CheckCircle size={12} weight="fill" color="#22c55e" style={{ flexShrink: 0 }} />
      )}
      <button
        type="button"
        onClick={() => onIr(item)}
        title={`${item.rotulo} ${item.titulo}`}
        style={{
          ...MANUAL_ESTILO_BOTAO_SUMARIO,
          color: subLido ? '#64748b' : (nivel <= 1 ? '#cbd5e1' : '#94a3b8'),
          fontWeight: nivel <= 1 ? 600 : 500,
          fontSize: nivel <= 1 ? '.82rem' : '.78rem',
          minWidth: 0,
          opacity: subLido ? 0.75 : 1,
          flex: item.emBreve ? '0 1 auto' : undefined,
        }}
      >
        {item.titulo}
      </button>
      {item.emBreve ? <ManualTagEmBreve compact /> : null}
    </div>
  )
}

function ManualSumarioSubitensArvore({
  nos,
  profundidade,
  onIr,
}: {
  nos: DocItemSumarioManualArvore[]
  profundidade: number
  onIr: (item: DocItemSumarioManual) => void
}) {
  if (nos.length === 0) return null

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: profundidade === 0 ? MANUAL_SUMARIO_SUBTOPICO_GAP_PX : MANUAL_SUMARIO_SUBTOPICO_GAP_ANINHADO_PX,
      marginTop: profundidade === 0 ? MANUAL_SUMARIO_SUBTOPICO_MARGEM_GRUPO_PX : MANUAL_SUMARIO_SUBTOPICO_MARGEM_FILHO_PX,
      ...(profundidade === 0
        ? {
            paddingLeft: MANUAL_SUMARIO_SUBTOPICO_RECUO_PX,
            borderLeft: MANUAL_ACORDEON_SUBTOPICO_BORDA_ESQUERDA,
          }
        : {
            marginLeft: 4,
            paddingLeft: MANUAL_SUMARIO_SUBTOPICO_RECUO_PX,
            borderLeft: MANUAL_ACORDEON_SUBTOPICO_BORDA_ESQUERDA,
          }),
    }}>
      {nos.map(no => (
        <div key={`${no.rotulo}-${no.titulo}`}>
          <ManualSumarioLinhaSubitem item={no} profundidade={profundidade} onIr={onIr} />
          {(no.filhos?.length ?? 0) > 0 && (
            <ManualSumarioSubitensArvore nos={no.filhos!} profundidade={profundidade + 1} onIr={onIr} />
          )}
        </div>
      ))}
    </div>
  )
}

export function ManualSumarioBloco({
  entradas,
  totalCapitulos,
  totalSubcapitulos,
  gruposAbertos,
  onToggleGrupo,
  onExpandirGrupo,
  scrollToItem,
  todosAbertos,
  toggleTodos,
}: {
  entradas: DocEntradaSumarioManual[]
  totalCapitulos: number
  totalSubcapitulos: number
  gruposAbertos: Record<number, boolean>
  onToggleGrupo: (secaoNum: number) => void
  onExpandirGrupo: (secaoNum: number) => void
  scrollToItem: (item: DocItemSumarioManual) => void
  todosAbertos: boolean
  toggleTodos: () => void
}) {
  const leitura = useContext(ManualLeituraContext)
  const irParaItem = (item: DocItemSumarioManual) => {
    if (item.subitem) onExpandirGrupo(item.secaoAcordeao)
    scrollToItem(item)
  }

  return (
    <>
      <div style={{
        background: 'rgba(148,163,184,.05)', border: '1px solid rgba(148,163,184,.12)',
        borderRadius: 14, padding: '20px 26px', marginBottom: 10,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 10,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}>
          <p style={{
            fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em',
            color: 'var(--ws-muted,#64748b)', textTransform: 'uppercase', margin: 0,
          }}>
            Sumário
          </p>
          <span style={{ fontSize: '.72rem', color: '#64748b', fontWeight: 500 }}>
            {totalCapitulos} capítulos
            {totalSubcapitulos > 0 ? ` / ${totalSubcapitulos} subcapítulos` : ''}
            {leitura?.ativo && leitura.totalRastreaveis > 0 ? ` · ${leitura.totalLidos} lidos` : ''}
          </span>
        </div>

        {leitura?.ativo && leitura.totalRastreaveis > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{
              height: 4,
              borderRadius: 2,
              background: 'rgba(148,163,184,.15)',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${leitura.percentual}%`,
                height: '100%',
                borderRadius: 2,
                background: '#6366f1',
                transition: 'width .25s ease',
              }} />
            </div>
            <p style={{ fontSize: '.68rem', color: '#64748b', margin: '6px 0 0' }}>
              {leitura.percentual}% concluído
            </p>
          </div>
        )}

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          fontSize: '.85rem',
        }}>
          {entradas.map(({ capitulo, subitens }) => {
            const temSubitens = (subitens?.length ?? 0) > 0
            const grupoAberto = gruposAbertos[capitulo.secaoAcordeao] === true
            const estadoCap = leitura?.estadoCapitulo(capitulo.secaoAcordeao) ?? 'nao_lido'
            const totalSubs = subitens?.length ?? 0
            const idsSubs = subitens?.map(s => s.elementoScroll).filter((id): id is string => Boolean(id)) ?? []
            const lidosSubs = idsSubs.filter(id => leitura?.isLido(id)).length
            const rotuloContagemSubs = leitura?.ativo && lidosSubs > 0
              ? `${lidosSubs}/${totalSubs} subcapítulos`
              : `${totalSubs} subcapítulos`

            return (
              <div key={`${capitulo.rotulo}-${capitulo.titulo}`}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                }}>
                  <span style={{
                    ...MANUAL_ESTILO_SECAO_NUMERO,
                    minWidth: 22,
                    color: estadoCap === 'lido' ? '#64748b' : '#818cf8',
                    lineHeight: 1.35,
                    paddingTop: 2,
                  }}>
                    {capitulo.rotulo}.
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      flexWrap: 'wrap',
                    }}>
                      {estadoCap === 'lido' && (
                        <CheckCircle size={14} weight="fill" color="#22c55e" style={{ flexShrink: 0 }} />
                      )}
                      {estadoCap === 'parcial' && (
                        <CircleHalf size={14} weight="fill" color="#818cf8" style={{ flexShrink: 0 }} />
                      )}
                      <button
                        type="button"
                        onClick={() => irParaItem(capitulo)}
                        style={{
                          ...MANUAL_ESTILO_BOTAO_SUMARIO,
                          color: estadoCap === 'lido' ? '#64748b' : '#c7d2fe',
                          fontWeight: 600,
                          flex: 1,
                          minWidth: 0,
                          opacity: estadoCap === 'lido' ? 0.75 : 1,
                        }}
                      >
                        {capitulo.titulo}
                      </button>
                    </div>

                    {temSubitens && (
                      <button
                        type="button"
                        onClick={() => onToggleGrupo(capitulo.secaoAcordeao)}
                        aria-expanded={grupoAberto}
                        aria-label={grupoAberto
                          ? `Recolher ${totalSubs} subcapítulos de ${capitulo.titulo}`
                          : `Expandir ${totalSubs} subcapítulos de ${capitulo.titulo}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          marginTop: 4,
                          background: 'rgba(148,163,184,.05)',
                          border: '1px solid rgba(148,163,184,.12)',
                          borderRadius: MANUAL_RAIO_CHIP,
                          cursor: 'pointer',
                          color: '#a5b4fc',
                          fontSize: '.6rem',
                          fontWeight: 700,
                          letterSpacing: '.02em',
                          padding: '3px 8px',
                          lineHeight: 1.2,
                        }}
                      >
                        <CaretDown
                          weight="bold"
                          size={10}
                          style={{
                            flexShrink: 0,
                            transform: grupoAberto ? 'rotate(0deg)' : 'rotate(-90deg)',
                            transition: 'transform .2s',
                          }}
                        />
                        <span>{rotuloContagemSubs}</span>
                      </button>
                    )}

                    {temSubitens && grupoAberto && (
                      <ManualSumarioSubitensArvore
                        nos={montarArvoreSubitensSumario(subitens!)}
                        profundidade={0}
                        onIr={irParaItem}
                      />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <button
          type="button"
          onClick={toggleTodos}
          title={todosAbertos ? 'Recolher todas as seções' : 'Expandir todas as seções'}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--ws-muted,#94a3b8)', fontSize: '.78rem', fontWeight: 600, padding: '4px 2px',
          }}
        >
          <CaretDown
            weight="bold"
            size={12}
            style={{
              transform: todosAbertos ? 'rotate(180deg)' : 'none',
              transition: 'transform .2s',
            }}
          />
          {todosAbertos ? 'Recolher todas' : 'Expandir todas'}
        </button>
      </div>
    </>
  )
}

const ICONES_MANUAL: Record<ConfiguradorManualSlug, Icon> = {
  'visao-geral': Gear,
  organizacao: Crown,
  workspaces: Buildings,
  usuarios: Users,
  fornecedores: Handshake,
  assinaturas: CreditCard,
  financeiro: Receipt,
  'api-cockpit': Pulse,
  'taxas-moeda': CurrencyCircleDollar,
  historico: ClockCounterClockwise,
}

export function iconeConfiguradorManual(slug: ConfiguradorManualSlug, size = 16) {
  const Icon = ICONES_MANUAL[slug]
  return <Icon weight="duotone" size={size} />
}

export interface DocManualMetadado {
  rotulo: string
  valor: string
  href?: boolean
}

export function DocManualUmaSecao({
  secao,
  metadados,
  secoesAbertasInicial,
  manualSlug,
}: {
  secao: DocSecao
  metadados: DocManualMetadado[]
  /** Seções expandidas ao carregar (padrão: só a intro §01). */
  secoesAbertasInicial?: number[]
  /** Slug do manual para persistência de leitura (ex.: `pedido`). */
  manualSlug?: string
}) {
  const location = useLocation()
  const slug = manualSlug ?? extrairSlugManualDaRota(location.pathname)
  const leituraAtivo = Boolean(slug)
  const idsRastreaveis = useMemo(() => montarIdsRastreaveisLeituraManual(secao), [secao])
  const fluxoPorSecao = useMemo(() => {
    const map = new Map<number, DocFluxo>()
    secao.fluxos?.forEach((fluxo, i) => map.set(i + 2, fluxo))
    return map
  }, [secao.fluxos])
  const [lidos, setLidos] = useState<Set<string>>(() => (slug ? carregarLidosManual(slug) : new Set()))
  useEffect(() => {
    if (slug) setLidos(carregarLidosManual(slug))
  }, [slug])
  const persistirLidos = useCallback((next: Set<string>) => {
    setLidos(next)
    if (slug) salvarLidosManual(slug, next)
  }, [slug])
  const toggleCapitulo = useCallback((secaoNum: number) => {
    if (!slug) return
    const fluxo = fluxoPorSecao.get(secaoNum)
    const filhos = fluxo ? idsPassosFluxo(fluxo) : []
    const next = new Set(lidos)
    if (filhos.length > 0) {
      const estado = calcularEstadoLeitura(lidos, filhos)
      if (estado === 'lido') filhos.forEach(id => next.delete(id))
      else filhos.forEach(id => next.add(id))
    } else {
      const id = idSecaoManual(secaoNum)
      if (next.has(id)) next.delete(id)
      else next.add(id)
    }
    persistirLidos(next)
  }, [slug, fluxoPorSecao, lidos, persistirLidos])
  const togglePasso = useCallback((id: string) => {
    if (!slug) return
    const next = new Set(lidos)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    persistirLidos(next)
  }, [slug, lidos, persistirLidos])
  const leituraCtx = useMemo<ManualLeituraContextValue>(() => ({
    ativo: leituraAtivo,
    fluxoPorSecao,
    isLido: (id: string) => lidos.has(id),
    estadoCapitulo: (secaoNum: number) => {
      const fluxo = fluxoPorSecao.get(secaoNum)
      return calcularEstadoCapitulo(lidos, secaoNum, fluxo)
    },
    toggleCapitulo,
    togglePasso,
    totalRastreaveis: idsRastreaveis.length,
    totalLidos: contarLidosManual(lidos, idsRastreaveis),
    percentual: percentualLeituraManual(lidos, idsRastreaveis),
  }), [leituraAtivo, fluxoPorSecao, lidos, toggleCapitulo, togglePasso, idsRastreaveis])
  const itensSumario = montarItensSumarioManual(secao)
  const entradasSumario = useMemo(() => montarEntradasSumarioManual(secao), [secao])
  const totalCapitulosSumario = entradasSumario.length
  const totalSubcapitulosSumario = entradasSumario.reduce(
    (acc, e) => acc + (e.subitens?.length ?? 0),
    0,
  )
  const todosNums = itensSumario.flatMap(i => (i.num != null ? [i.num] : []))
  const [abertos, setAbertos] = useState<number[]>(secoesAbertasInicial ?? [])
  const [gruposSumarioAbertos, setGruposSumarioAbertos] = useState<Record<number, boolean>>({})
  const [subtopicosAbertos, setSubtopicosAbertos] = useState<Record<string, number[]>>({})
  const abrirSubtopico = useCallback((prefix: string, num: number) => {
    setSubtopicosAbertos(prev => {
      const atual = prev[prefix] ?? []
      if (atual.includes(num)) return prev
      return { ...prev, [prefix]: [...atual, num] }
    })
  }, [])
  const toggleSubtopico = useCallback((prefix: string, num: number) => {
    setSubtopicosAbertos(prev => {
      const atual = prev[prefix] ?? []
      return {
        ...prev,
        [prefix]: atual.includes(num) ? atual.filter(n => n !== num) : [...atual, num],
      }
    })
  }, [])
  const subtopicosCtx = useMemo<ManualSubtopicosContextValue>(() => ({
    abertosPorPrefix: subtopicosAbertos,
    toggle: toggleSubtopico,
    abrir: abrirSubtopico,
  }), [subtopicosAbertos, toggleSubtopico, abrirSubtopico])
  const todosAbertos = todosNums.length > 0 && todosNums.every(n => abertos.includes(n))
  const toggle = (n: number) => setAbertos(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])
  const toggleTodos = () => setAbertos(todosAbertos ? [] : [...todosNums])
  const toggleGrupoSumario = useCallback((secaoNum: number) => {
    setGruposSumarioAbertos(prev => ({ ...prev, [secaoNum]: !prev[secaoNum] }))
  }, [])
  const expandirGrupoSumario = useCallback((secaoNum: number) => {
    setGruposSumarioAbertos(prev => (prev[secaoNum] ? prev : { ...prev, [secaoNum]: true }))
  }, [])
  const { scrollToSecao, scrollToItem } = useManualSumarioScroll(
    abertos,
    setAbertos,
    abrirSubtopico,
    subtopicosAbertos,
    secao,
  )

  useEffect(() => {
    const hash = location.hash.replace(/^#/, '')
    const secaoNum = numeroSecaoDeHashManual(location.hash)
    if (secaoNum != null) scrollToSecao(secaoNum)
    if (!hash) return
    const item = itensSumario.find(i => i.elementoScroll === hash)
    if (item) {
      if (item.subitem) expandirGrupoSumario(item.secaoAcordeao)
      scrollToItem(item)
      return
    }
    const passo = parseElementoPassoManual(hash)
    if (!passo) return
    const fluxIdx = secao.fluxos?.findIndex(f => f.ancoraPassosPrefix === passo.prefix) ?? -1
    if (fluxIdx < 0) return
    const fluxo = secao.fluxos![fluxIdx]
    if (fluxo.passosVisuais?.length) {
      abrirCadeiaPassoManual(passo.prefix, fluxo.passosVisuais, passo.num, abrirSubtopico)
    } else {
      abrirSubtopico(passo.prefix, passo.num)
    }
    const secNum = fluxIdx + 2
    expandirGrupoSumario(secNum)
    if (!abertos.includes(secNum)) {
      setAbertos(prev => (prev.includes(secNum) ? prev : [...prev, secNum]))
    }
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => rolarParaSecaoManual(hash))
    })
    return () => cancelAnimationFrame(frame)
  }, [scrollToSecao, scrollToItem, abrirSubtopico, expandirGrupoSumario, location.pathname, location.hash, itensSumario, secao.fluxos, abertos])

  return (
    <ManualScrollSecaoContext.Provider value={scrollToSecao}>
    <ManualSubtopicosContext.Provider value={subtopicosCtx}>
    <ManualLeituraContext.Provider value={leituraCtx}>
    <div style={{ maxWidth: '100%', color: 'var(--ws-text,#f1f5f9)' }}>
      <span style={{
        display: 'inline-block',
        background: 'rgba(148,163,184,.05)',
        color: '#818cf8',
        fontSize: '.68rem',
        fontWeight: 700,
        letterSpacing: '.1em',
        padding: '6px 12px',
        borderRadius: MANUAL_RAIO_CHIP,
        border: '1px solid rgba(148,163,184,.12)',
        marginBottom: 16,
        textTransform: 'uppercase',
      }}>Manual Descritivo de Tela</span>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 10,
        paddingBottom: 22,
        borderBottom: '1px solid rgba(148,163,184,.12)',
        marginBottom: 28,
      }}>
        {metadados.map(meta => (
          <div
            key={meta.rotulo}
            style={{
              background: 'rgba(148,163,184,.05)',
              border: '1px solid rgba(148,163,184,.12)',
              borderRadius: 10,
              padding: '10px 14px',
              minWidth: 0,
              ...(meta.href ? { gridColumn: 'span 2' } : {}),
            }}
          >
            <p style={{
              fontSize: '.62rem', fontWeight: 700, letterSpacing: '.08em',
              textTransform: 'uppercase', color: 'var(--ws-muted,#64748b)', margin: '0 0 4px',
            }}>
              {meta.rotulo}
            </p>
            <p style={{
              fontSize: '.82rem', color: 'var(--ws-text,#e2e8f0)', margin: 0, lineHeight: 1.4,
              overflowWrap: 'anywhere', wordBreak: 'break-word',
            }}>
              {meta.href ? (
                <a href={meta.valor} target="_blank" rel="noreferrer" style={{ ...MANUAL_LINK_STYLE, overflowWrap: 'anywhere' }}>{meta.valor}</a>
              ) : meta.valor}
            </p>
          </div>
        ))}
      </div>

      <ManualSumarioBloco
        entradas={entradasSumario}
        totalCapitulos={totalCapitulosSumario}
        totalSubcapitulos={totalSubcapitulosSumario}
        gruposAbertos={gruposSumarioAbertos}
        onToggleGrupo={toggleGrupoSumario}
        onExpandirGrupo={expandirGrupoSumario}
        scrollToItem={scrollToItem}
        todosAbertos={todosAbertos}
        toggleTodos={toggleTodos}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: MANUAL_ACORDEON_SECAO_GAP_PX }}>
        <div
          id="doc-sec-1"
          style={{
            ...MANUAL_ESTILO_ACORDEON_SECAO,
            border: `1px solid ${abertos.includes(1) ? 'rgba(99,102,241,.25)' : 'rgba(148,163,184,.12)'}`,
            borderRadius: 12, overflow: 'hidden', transition: 'border-color .2s',
          }}
        >
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: abertos.includes(1) ? 'rgba(99,102,241,.07)' : 'rgba(148,163,184,.03)',
              padding: '16px 22px',
              color: 'var(--ws-text,#f1f5f9)',
              transition: 'background .15s',
            }}
          >
            <button
              type="button"
              onClick={() => toggle(1)}
              style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                color: 'inherit',
                textAlign: 'left',
              }}
            >
              <span style={MANUAL_ESTILO_SECAO_NUMERO}>{String(1).padStart(2, '0')}</span>
              <span style={{
                fontWeight: 700, fontSize: '1rem', flex: 1, minWidth: 0,
                opacity: leituraCtx.ativo && leituraCtx.estadoCapitulo(1) === 'lido' ? 0.65 : 1,
              }}>{secao.titulo}</span>
            </button>
            {leituraCtx.ativo && (
              <ManualBotaoMarcarLido
                estado={leituraCtx.estadoCapitulo(1)}
                onToggle={() => leituraCtx.toggleCapitulo(1)}
                rotulo={secao.titulo}
              />
            )}
            <button
              type="button"
              onClick={() => toggle(1)}
              aria-label={abertos.includes(1) ? `Recolher ${secao.titulo}` : `Expandir ${secao.titulo}`}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                color: '#818cf8',
                flexShrink: 0,
                fontSize: '.9rem',
                lineHeight: 1,
              }}
            >
              <span style={{
                display: 'inline-block',
                transform: abertos.includes(1) ? 'rotate(180deg)' : 'none',
                transition: 'transform .25s',
              }}>▾</span>
            </button>
          </div>
          {abertos.includes(1) && (
            <div style={{ padding: '22px 26px 26px', borderTop: '1px solid rgba(148,163,184,.1)' }}>
              <ManualSecaoIntro secao={secao} />
            </div>
          )}
        </div>

        {secao.fluxos?.map((fluxo, i) => {
          const num = i + 2
          const aberto = abertos.includes(num)
          const estadoCap = leituraCtx.ativo ? leituraCtx.estadoCapitulo(num) : 'nao_lido'
          const idsSubs = idsPassosFluxo(fluxo)
          const lidosSubs = idsSubs.filter(id => leituraCtx.isLido(id)).length
          const totalSubs = contarPassosVisuais(fluxo.passosVisuais ?? [])
          const rotuloBadgeSubs = leituraCtx.ativo && lidosSubs > 0 && lidosSubs < idsSubs.length
            ? `${lidosSubs}/${totalSubs} subtópicos`
            : `${totalSubs} subtópicos`
          return (
            <div
              key={`${num}-${fluxo.titulo}`}
              id={`doc-sec-${num}`}
              style={{
                ...MANUAL_ESTILO_ACORDEON_SECAO,
                border: `1px solid ${aberto ? 'rgba(99,102,241,.25)' : 'rgba(148,163,184,.12)'}`,
                borderRadius: 12, overflow: 'hidden', transition: 'border-color .2s',
              }}
            >
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  background: aberto ? 'rgba(99,102,241,.07)' : 'rgba(148,163,184,.03)',
                  padding: '16px 22px',
                  color: 'var(--ws-text,#f1f5f9)',
                  transition: 'background .15s',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggle(num)}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    color: 'inherit',
                    textAlign: 'left',
                  }}
                >
                  <span style={MANUAL_ESTILO_SECAO_NUMERO}>{String(num).padStart(2, '0')}</span>
                  <span style={{
                    fontWeight: 700, fontSize: '1rem', flex: 1, minWidth: 0,
                    opacity: estadoCap === 'lido' ? 0.65 : 1,
                  }}>{fluxo.titulo}</span>
                  {fluxo.mostrarMapaSubtopicosPassos && totalSubs > 0 && (
                    <span style={{
                      fontSize: '.62rem',
                      fontWeight: 700,
                      letterSpacing: '.04em',
                      color: '#a5b4fc',
                      background: 'rgba(148,163,184,.05)',
                      border: '1px solid rgba(148,163,184,.12)',
                      borderRadius: MANUAL_RAIO_CHIP,
                      padding: '6px 12px',
                      flexShrink: 0,
                    }}>
                      {rotuloBadgeSubs}
                    </span>
                  )}
                </button>
                {leituraCtx.ativo && (
                  <ManualBotaoMarcarLido
                    estado={estadoCap}
                    onToggle={() => leituraCtx.toggleCapitulo(num)}
                    rotulo={fluxo.titulo}
                  />
                )}
                <button
                  type="button"
                  onClick={() => toggle(num)}
                  aria-label={aberto ? `Recolher ${fluxo.titulo}` : `Expandir ${fluxo.titulo}`}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    color: '#818cf8',
                    flexShrink: 0,
                    fontSize: '.9rem',
                    lineHeight: 1,
                  }}
                >
                  <span style={{
                    display: 'inline-block',
                    transform: aberto ? 'rotate(180deg)' : 'none',
                    transition: 'transform .25s',
                  }}>▾</span>
                </button>
              </div>
              {aberto && (
                <div style={{ padding: '22px 26px 26px', borderTop: '1px solid rgba(148,163,184,.1)' }}>
                  <ManualSecaoFluxo fluxo={fluxo} numeroSecaoFluxo={num} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
    </ManualLeituraContext.Provider>
    </ManualSubtopicosContext.Provider>
    </ManualScrollSecaoContext.Provider>
  )
}

export function DocConfiguradorManual({ paginaSlug }: { paginaSlug: ConfiguradorManualSlug }) {
  const secao = paginaSlug === 'api-cockpit'
    ? DOC_API_COCKPIT_SECAO
    : secaoConfiguradorPorSlug(paginaSlug)
  const metadados = metadadosConfiguradorPagina(paginaSlug)

  if (!secao) {
    return (
      <div style={{ color: 'var(--ws-muted,#94a3b8)', padding: '40px 0', textAlign: 'center' }}>
        Capítulo não encontrado.
      </div>
    )
  }

  return <DocManualUmaSecao secao={secao} metadados={metadados} />
}

export type { DocSecao, DocPassoVisual, DocFluxo, DocTooltipKpi, DocColunaTabela, DocTopicoImagemLateral }
