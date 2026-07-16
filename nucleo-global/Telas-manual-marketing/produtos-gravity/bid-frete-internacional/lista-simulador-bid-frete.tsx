import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  Anchor,
  AirplaneTilt,
  ArrowSquareOut,
  Columns,
  CurrencyDollar,
  DownloadSimple,
  MagnifyingGlass,
  Package,
  Plus,
  Truck,
} from '@phosphor-icons/react'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import {
  RenderBadgeOperacao,
  RenderBadgeStatus,
} from '@produto/bid-frete-internacional/client/src/pages/colunas-lista-bid-frete-internacional'
import {
  LISTA_STATUS_CORES_DEFAULT_BID_FRETE,
  resolverEstiloPillAbaStatusBidFrete,
} from '@produto/bid-frete-internacional/client/src/shared/lista-status-aba-estilo-bid-frete-internacional'
import { MODAL_LABELS, MODALIDADE_LABELS } from '@produto/bid-frete-internacional/client/src/shared/types'
import type { ColunaListaSimuladorBidFrete } from './colunas-lista-simulador-bid-frete'
import { criarEstadoColunasDemonstracaoArrastarListaSimuladorBidFrete } from './criar-estado-colunas-demonstracao-arrastar-lista-simulador-bid-frete'
import { LINHAS_LISTA_SIMULADOR_BID_FRETE, type LinhaListaSimuladorBidFrete } from './dados-lista-simulador-bid-frete'
import {
  CURSOR_ARRASTAR_LISTA_INICIAL,
  iniciarMotorAnimacaoArrastarColunasListaBidFrete,
  type EstadoCursorArrastarLista,
} from './motor-animacao-arrastar-colunas-lista-simulador-bid-frete'
import {
  reordenarColunasListaSimuladorBidFrete,
  type LadoDropColuna,
} from './reordenar-colunas-lista-simulador-bid-frete'
import { IndicadorCabecalhoFantasmaArrastarListaSimuladorPedido } from '../pedido/indicador-cabecalho-fantasma-arrastar-lista-simulador-pedido'
import { IndicadorCursorArrastarListaSimuladorPedido } from '../pedido/indicador-cursor-arrastar-lista-simulador-pedido'
import '../pedido/indicador-cursor-arrastar-lista-simulador-pedido.css'
import '../../../Tabelas/tabela-virtual-global/src/tabela-virtual.css'
import '../../../Tabelas/tabela-virtual-global/src/botao-completo-exportar.css'
import './lista-simulador-bid-frete.css'

const PAINEIS_DEMO = [
  { id: 'geral', label: 'Geral' },
  { id: 'asia', label: 'Ásia' },
  { id: 'europa', label: 'Europa' },
] as const

const STATUS_ABAS_DEMO = [
  { id: 'TODAS', label: 'Todas as cotações' },
  { id: 'RASCUNHO', label: 'Rascunho' },
  { id: 'ENVIADA_FORNECEDORES', label: 'Enviada ao fornecedor' },
  { id: 'EM_COTACAO', label: 'Em cotação' },
  { id: 'AGUARDANDO_APROVACAO', label: 'Aprovação pendente' },
  { id: 'APROVADA', label: 'Aprovada' },
  { id: 'REPROVADA', label: 'Reprovada' },
  { id: 'CANCELADA', label: 'Cancelada' },
  { id: 'FALTA_INFORMACAO', label: 'Falta de informação' },
  { id: 'EXPIRADA', label: 'Expirada' },
] as const

function IconeModal({ modal }: { modal: string }) {
  if (modal === 'AEREO') return <AirplaneTilt size={13} weight="duotone" aria-hidden />
  if (modal === 'RODOVIARIO') return <Truck size={13} weight="duotone" aria-hidden />
  return <Anchor size={13} weight="duotone" aria-hidden />
}

function renderCelulaLista(
  colunaId: string,
  linha: LinhaListaSimuladorBidFrete,
): ReactNode {
  switch (colunaId) {
    case 'numero_cotacao':
      return (
        <span className="bfs-lista-link-cotacao">
          {linha.numeroCotacao}
          <ArrowSquareOut size={11} weight="bold" aria-hidden />
        </span>
      )
    case 'status':
      return RenderBadgeStatus(linha.status)
    case 'operacao':
      return RenderBadgeOperacao(linha.operacao)
    case 'modal':
      return (
        <span className="bfs-lista-modal">
          <IconeModal modal={linha.modal} />
          {MODAL_LABELS[linha.modal as keyof typeof MODAL_LABELS] ?? linha.modal}
        </span>
      )
    case 'modalidade':
      return MODALIDADE_LABELS[linha.modalidade as keyof typeof MODALIDADE_LABELS] ?? linha.modalidade
    case 'porto_destino':
      return linha.portoDestino
    case 'porto_origem':
      return linha.portoOrigem
    case 'tipo_container':
      return linha.tipoContainer
    case 'peso_kg':
      return linha.pesoKg
    default:
      return '—'
  }
}

type Props = {
  modoDemonstracaoArrastarColunas?: boolean
}

export function ListaSimuladorBidFrete({
  modoDemonstracaoArrastarColunas = false,
}: Props) {
  const [painelAtualId, setPainelAtualId] = useState('geral')
  const [statusFiltro, setStatusFiltro] = useState('TODAS')
  const [colunas, setColunas] = useState<ColunaListaSimuladorBidFrete[]>(() =>
    modoDemonstracaoArrastarColunas
      ? criarEstadoColunasDemonstracaoArrastarListaSimuladorBidFrete()
      : criarEstadoColunasDemonstracaoArrastarListaSimuladorBidFrete(),
  )
  const [dragColunaId, setDragColunaId] = useState<string | null>(null)
  const [dragOverColunaId, setDragOverColunaId] = useState<string | null>(null)
  const [ladoDropColuna, setLadoDropColuna] = useState<LadoDropColuna>('after')
  const shellDemonstracaoRef = useRef<HTMLDivElement>(null)
  const [cursorArrastar, setCursorArrastar] = useState<EstadoCursorArrastarLista>(
    CURSOR_ARRASTAR_LISTA_INICIAL,
  )

  const colunasVisiveis = useMemo(
    () => colunas.filter((coluna) => coluna.visivel),
    [colunas],
  )

  const aplicarReordenacaoColuna = useCallback((fromId: string, toId: string, lado: LadoDropColuna) => {
    setColunas((prev) => reordenarColunasListaSimuladorBidFrete(prev, fromId, toId, lado))
  }, [])

  useEffect(() => {
    if (!modoDemonstracaoArrastarColunas) return undefined

    return iniciarMotorAnimacaoArrastarColunasListaBidFrete({
      ativo: true,
      containerRef: shellDemonstracaoRef,
      aoMoverColuna: aplicarReordenacaoColuna,
      aoArrastarColuna: setDragColunaId,
      aoPreverDrop: (destinoId, lado) => {
        setDragOverColunaId(destinoId)
        if (lado) setLadoDropColuna(lado)
      },
      aoAtualizarCursor: setCursorArrastar,
      aoReiniciarColunas: () => {
        setColunas(criarEstadoColunasDemonstracaoArrastarListaSimuladorBidFrete())
        setDragColunaId(null)
        setDragOverColunaId(null)
        const areaRolagem = shellDemonstracaoRef.current?.querySelector<HTMLElement>('.bfs-lista-tabela-wrap')
        if (areaRolagem) areaRolagem.scrollLeft = 0
      },
    })
  }, [aplicarReordenacaoColuna, modoDemonstracaoArrastarColunas])

  const classeDropColuna = useCallback((colunaId: string) => {
    if (dragOverColunaId !== colunaId || !dragColunaId) return ''
    return ladoDropColuna === 'before' ? 'bfs-lista-th--drop-before' : 'bfs-lista-th--drop-after'
  }, [dragColunaId, dragOverColunaId, ladoDropColuna])

  return (
    <div
      ref={shellDemonstracaoRef}
      className={[
        'bfs-lista',
        modoDemonstracaoArrastarColunas ? 'bfs-lista--demo-arrastar' : '',
      ].filter(Boolean).join(' ')}
      role={modoDemonstracaoArrastarColunas ? 'img' : undefined}
      aria-label={modoDemonstracaoArrastarColunas ? 'Demonstração animada — arrastar colunas na Lista BID Frete' : undefined}
    >
      <div className="lp-stats-row">
        <div className="lp-cards">
          <CardBasicoGlobal
            titulo="Total de Cotações"
            icone={<Package weight="duotone" size={16} style={{ color: 'var(--bfs-accent)' }} />}
            valor="62"
            subtexto="Total acumulado"
          />
          <CardBasicoGlobal
            titulo="Valor Total de Frete"
            icone={<CurrencyDollar weight="duotone" size={16} style={{ color: '#34d399' }} />}
            valor="USD 16.450,00"
            variante="sucesso"
            subtexto="Valor acumulado das propostas recebidas"
          />
          <CardBasicoGlobal
            titulo="Propostas Recebidas"
            icone={<Package weight="duotone" size={16} style={{ color: '#f8fafc' }} />}
            valor="20"
            subtexto="Quantidade total de respostas dos fornecedores"
          />
        </div>
      </div>

      <div className="bfs-lista-chrome">
        <div className="bfs-lista-faixa">
          <div className="bfs-lista-paineis">
            <span className="bfs-lista-paineis-label">Painel:</span>
            {PAINEIS_DEMO.map((painel) => (
              <button
                key={painel.id}
                type="button"
                className={[
                  'bfs-lista-painel-tab',
                  painelAtualId === painel.id ? 'bfs-lista-painel-tab--ativo' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => setPainelAtualId(painel.id)}
              >
                {painel.label}
              </button>
            ))}
            <span className="bfs-lista-painel-mais" aria-hidden>+</span>
          </div>

          <div className="bfs-lista-status-bar">
            <span className="bfs-lista-status-label">Status</span>
            <div className="bfs-lista-status-pills">
              {STATUS_ABAS_DEMO.map((aba) => (
                <button
                  key={aba.id}
                  type="button"
                  className="bfs-lista-status-chip"
                  style={resolverEstiloPillAbaStatusBidFrete(aba.id, LISTA_STATUS_CORES_DEFAULT_BID_FRETE[aba.id], statusFiltro === aba.id)}
                  onClick={() => setStatusFiltro(aba.id)}
                >
                  {aba.id !== 'TODAS' ? (
                    <span
                      className="bfs-lista-status-dot"
                      style={{ background: LISTA_STATUS_CORES_DEFAULT_BID_FRETE[aba.id] ?? '#818cf8' }}
                    />
                  ) : null}
                  {aba.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bfs-lista-toolbar gtv-toolbar">
          <div className="bfs-lista-toolbar-esq gtv-toolbar-esquerda">
            <div className="gtv-busca-wrapper">
              <span className="gtv-busca-icone"><MagnifyingGlass size={14} aria-hidden /></span>
              <input
                type="search"
                className="gtv-busca-input"
                placeholder="Buscar"
                readOnly={modoDemonstracaoArrastarColunas}
              />
            </div>
            <BotaoGlobal variante="primario" tamanho="pequeno" icone={<Plus size={14} weight="bold" />}>
              Novo
            </BotaoGlobal>
          </div>
          <div className="bfs-lista-toolbar-dir gtv-toolbar-direita">
            <button type="button" className="gtv-btn" aria-label="Colunas">
              <Columns size={14} weight="duotone" aria-hidden />
              Colunas
            </button>
            <button type="button" className="gtv-btn" aria-label="Exportar">
              <DownloadSimple size={14} weight="duotone" aria-hidden />
              Exportar
            </button>
          </div>
        </div>

        <div className="bfs-lista-tabela-wrap">
          <table className="bfs-lista-tabela">
            <thead>
              <tr>
                <th className="bfs-lista-th-check" aria-label="Selecionar">
                  <input type="checkbox" className="gtv-checkbox" readOnly aria-hidden />
                </th>
                {colunasVisiveis.map((coluna) => {
                  const arrastando = dragColunaId === coluna.id
                  return (
                    <th
                      key={coluna.id}
                      data-coluna-th-demo-id={modoDemonstracaoArrastarColunas ? coluna.id : undefined}
                      className={[
                        arrastando ? 'bfs-lista-th--arrastando' : '',
                        classeDropColuna(coluna.id),
                      ].filter(Boolean).join(' ') || undefined}
                    >
                      {coluna.label}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {LINHAS_LISTA_SIMULADOR_BID_FRETE.map((linha) => (
                <tr key={linha.id}>
                  <td className="bfs-lista-td-check">
                    <input type="checkbox" className="gtv-checkbox" readOnly aria-hidden />
                  </td>
                  {colunasVisiveis.map((coluna) => (
                    <td key={`${linha.id}-${coluna.id}`}>
                      {renderCelulaLista(coluna.id, linha)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modoDemonstracaoArrastarColunas ? (
        <div className="bfs-lista-demo-arrastar-camada" aria-hidden>
          <IndicadorCursorArrastarListaSimuladorPedido estado={cursorArrastar} />
          {dragColunaId && cursorArrastar.arrastando ? (
            <IndicadorCabecalhoFantasmaArrastarListaSimuladorPedido
              rotulo={colunas.find((coluna) => coluna.id === dragColunaId)?.label ?? ''}
              x={cursorArrastar.x}
              y={cursorArrastar.y}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
