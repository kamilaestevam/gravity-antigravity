import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowBendUpRight,
  ArrowDown,
  ArrowRight,
  ArrowSquareIn,
  ArrowSquareOut,
  CaretDown,
  CheckCircle,
  Database,
  Eye,
  GitBranch,
  MinusCircle,
  PlusCircle,
  Warning,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { GravityLoader } from '../../../Feedback/gravity-loader-global/src/GravityLoader'
import { ModalPassoPassoGlobal } from '../../../Modais/modal-passo-passo-global/src/ModalPassoPassoGlobal'
import type { PassoConfig } from '../../../Modais/modal-passo-passo-global/src/ModalPassoPassoGlobal'
import '../../../Modais/modal-passo-passo-global/src/modal-passo-passo.css'
import '../../../../servicos-global/produto/pedido/client/src/components/ModalPedidoTransferir.css'
import { filtrarItensAvulsosSelecao } from './duplicar-excluir-lista-simulador-pedido'
import type { LinhaListaPedidoSimulador } from './dados-lista-simulador-pedido'
import type { SelecaoListaSimuladorPedido } from './regras-acoes-barra-lista-simulador-pedido'
import {
  interpolarTextoTransferir,
  TEXTOS_MODAL_TRANSFERIR_SIMULADOR_PEDIDO as T,
} from './textos-modal-transferir-simulador-pedido'
import {
  aplicarTransferenciaListaSimulador,
  fmtQuantidadeSimulador,
  gerarPreviewTransferenciaSimulador,
  inicializarItensQuantidadesTransferirSimulador,
  lerPartNumberItemSimulador,
  lerSaldoTransferivelItemSimulador,
  listarPedidosDestinoElegiveisSimulador,
  montarItensComPedidoTransferirSimulador,
  montarPedidosEnvolvidosTransferir,
  type CenarioTransferSimulador,
  type ItemComPedidoTransferirSimulador,
  type ResumoTransferenciaListaSimulador,
  type TransferDestinoSimulador,
  type TransferPreviewSimulador,
} from './transferir-lista-simulador-pedido'

type Props = {
  aberto: boolean
  selecao: SelecaoListaSimuladorPedido
  linhas: readonly LinhaListaPedidoSimulador[]
  onFechar: () => void
  onConcluido: (
    linhas: LinhaListaPedidoSimulador[],
    resumo: ResumoTransferenciaListaSimulador,
    idsNovosPedidos: string[],
  ) => void
}

type Passo = 1 | 2 | 3 | 4 | 5

const CENARIOS: {
  id: CenarioTransferSimulador
  nome: string
  descricao: string
  Icone: React.ComponentType<{ size?: number; weight?: string; className?: string }>
  reversivel: boolean
}[] = [
  { id: 'split_novo_pedido', nome: T.cenario_split_novo_nome, descricao: T.cenario_split_novo_desc, Icone: GitBranch, reversivel: true },
  { id: 'split_pedido_existente', nome: T.cenario_split_exist_nome, descricao: T.cenario_split_exist_desc, Icone: ArrowBendUpRight, reversivel: true },
  { id: 'reducao_simples', nome: T.cenario_reducao_nome, descricao: T.cenario_reducao_desc, Icone: MinusCircle, reversivel: false },
]

function SeletorCenario({ cenarioSelecionado, onChange }: { cenarioSelecionado: CenarioTransferSimulador | null; onChange: (c: CenarioTransferSimulador) => void }) {
  return (
    <div className="modal-transferir__cenario-cards">
      <span className="modal-transferir__cenario-cards-label">{T.cenario_tipo_label}</span>
      <div className="modal-transferir__cenario-cards-grid">
        {CENARIOS.map((c) => {
          const ativo = c.id === cenarioSelecionado
          return (
            <button key={c.id} type="button" className={`modal-transferir__cenario-card${ativo ? ' modal-transferir__cenario-card--ativo' : ''}`} onClick={() => onChange(c.id)} aria-pressed={ativo}>
              <span className={`modal-transferir__cenario-card-icone${ativo ? ' modal-transferir__cenario-card-icone--ativo' : ''}`}><c.Icone size={20} weight={ativo ? 'fill' : 'duotone'} /></span>
              <span className="modal-transferir__cenario-card-texto">
                <span className="modal-transferir__cenario-card-nome">{c.nome}</span>
                <span className="modal-transferir__cenario-card-desc">{c.descricao}</span>
              </span>
              {!c.reversivel && <span className="modal-transferir__badge-irreversivel">{T.badge_irreversivel}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SeletorItemQuantidade(props: {
  itensComPedido: ItemComPedidoTransferirSimulador[]
  itensQuantidades: Map<string, number>
  onToggleItem: (itemId: string) => void
  onToggleTodos: () => void
  onQuantidadeChange: (itemId: string, qty: number) => void
  multiPedido: boolean
}) {
  const { itensComPedido, itensQuantidades, onToggleItem, onToggleTodos, onQuantidadeChange, multiPedido } = props
  const todosIds = useMemo(() => itensComPedido.map(({ item }) => item.id), [itensComPedido])
  const todosSelecionados = todosIds.length > 0 && todosIds.every((id) => itensQuantidades.has(id))
  const parcialSelecionado = todosIds.some((id) => itensQuantidades.has(id)) && !todosSelecionados

  return (
    <table className="modal-transferir__tabela-itens" aria-label={T.aria_tabela_itens}>
      <thead>
        <tr>
          <th scope="col" className="modal-transferir__col-check">
            <input type="checkbox" checked={todosSelecionados} ref={(el) => { if (el) el.indeterminate = parcialSelecionado }} aria-label={T.aria_selecionar_todos} onChange={(e) => { e.stopPropagation(); onToggleTodos() }} onClick={(e) => e.stopPropagation()} />
          </th>
          {multiPedido && <th scope="col">{T.col_pedido}</th>}
          <th scope="col">{T.col_sequencia_item}</th>
          <th scope="col">{T.col_part_number}</th>
          <th scope="col">{T.col_descricao}</th>
          <th scope="col">{T.col_saldo}</th>
          <th scope="col" style={{ minWidth: 130 }}>{T.col_qty_transfer}</th>
          <th scope="col" style={{ minWidth: 90 }}>{T.col_saldo_apos}</th>
        </tr>
      </thead>
      <tbody>
        {itensComPedido.map(({ item, pedido }) => {
          const selecionado = itensQuantidades.has(item.id)
          const qty = itensQuantidades.get(item.id) ?? 0
          const qtyMax = lerSaldoTransferivelItemSimulador(item)
          const qtyInvalida = selecionado && (qty > qtyMax || qty <= 0)
          const saldoApos = selecionado ? Math.max(0, qtyMax - (qty || 0)) : null
          const partNumber = lerPartNumberItemSimulador(item)
          const descricao = item.campos.descricao_item ?? '—'
          return (
            <tr key={item.id} className="modal-transferir__tabela-itens-row" onClick={() => onToggleItem(item.id)} aria-selected={selecionado}>
              <td className="modal-transferir__col-check"><input type="checkbox" checked={selecionado} readOnly aria-label={interpolarTextoTransferir(T.aria_selecionar_item, { item: partNumber })} /></td>
              {multiPedido && <td className="modal-transferir__col-pedido"><span className="modal-transferir__pedido-numero">{pedido.numeroPedido}</span></td>}
              <td className="modal-transferir__col-seq">{item.sequencia}</td>
              <td><strong>{partNumber.length > 20 ? (
                <TooltipGlobal titulo={T.col_part_number} descricao={partNumber}>
                  <span className="modal-transferir__desc-truncada">{partNumber.slice(0, 20)}…<Eye size={14} className="modal-transferir__desc-eye" /></span>
                </TooltipGlobal>
              ) : partNumber}</strong></td>
              <td>{descricao.length > 30 ? (
                <TooltipGlobal titulo={T.col_descricao} descricao={descricao}>
                  <span className="modal-transferir__desc-truncada">{descricao.slice(0, 30)}…<Eye size={14} className="modal-transferir__desc-eye" /></span>
                </TooltipGlobal>
              ) : <span>{descricao}</span>}</td>
              <td>{fmtQuantidadeSimulador(qtyMax)}</td>
              <td className="modal-transferir__col-qty" onClick={(e) => e.stopPropagation()}>
                {selecionado ? (
                  <div className="modal-transferir__qty-celula">
                    <input
                      type="number"
                      className={`modal-transferir__input-qty${qtyInvalida ? ' modal-transferir__input-qty--erro' : ''}`}
                      value={qty > 0 ? String(qty) : ''}
                      min={0.001}
                      max={qtyMax}
                      step={0.001}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation()
                        const bruto = e.target.value
                        if (bruto === '') {
                          onQuantidadeChange(item.id, 0)
                          return
                        }
                        const n = Number.parseFloat(bruto.replace(',', '.'))
                        if (Number.isFinite(n)) onQuantidadeChange(item.id, n)
                      }}
                      aria-label={T.aria_qtd_transferir}
                    />
                    <div className="modal-transferir__qty-disponivel">{T.max_label} {fmtQuantidadeSimulador(qtyMax)}</div>
                  </div>
                ) : <span className="modal-transferir__texto-muted">—</span>}
              </td>
              <td>{selecionado && qty > 0 ? <span className={saldoApos === 0 ? 'modal-transferir__saldo-zero' : 'modal-transferir__saldo-apos'}>{fmtQuantidadeSimulador(saldoApos ?? 0)}</span> : <span className="modal-transferir__texto-muted">—</span>}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function PreviewImpacto({ preview, indice, total }: { preview: TransferPreviewSimulador; indice?: number; total?: number }) {
  return (
    <div className="modal-transferir__preview-container">
      {total != null && total > 1 && indice != null && (
        <div className="modal-transferir__preview-numeracao">{interpolarTextoTransferir(T.preview_numeracao, { atual: indice + 1, total })}</div>
      )}
      <div className="modal-transferir__preview-origem">
        <div className="modal-transferir__preview-titulo"><ArrowSquareOut size={18} weight="duotone" className="modal-transferir__preview-icone modal-transferir__preview-icone--origem" /><span>{T.preview_origem}</span></div>
        <div className="modal-transferir__preview-linha"><span>{T.preview_label_pedido}</span><span className="modal-transferir__preview-valor">{preview.origem.pedido_numero}</span></div>
        <div className="modal-transferir__preview-linha"><span>{T.preview_label_item}</span><span className="modal-transferir__preview-valor">{preview.origem.item_part_number}</span></div>
        <div className="modal-transferir__preview-linha"><span>{T.preview_label_qtd_atual}</span><span className="modal-transferir__preview-valor">{fmtQuantidadeSimulador(preview.origem.quantidade_atual_pedido)}</span></div>
        <div className="modal-transferir__preview-linha"><span>{T.preview_label_qtd_apos}</span><span className={`modal-transferir__preview-valor modal-transferir__preview-valor--com-icone${preview.origem.encerra ? ' modal-transferir__preview-valor--alerta' : ''}`}><ArrowDown size={12} weight="bold" aria-hidden="true" className="modal-transferir__preview-seta-reducao" />{fmtQuantidadeSimulador(preview.origem.quantidade_apos)}{preview.origem.encerra ? ` ${T.preview_ficara_zero}` : ''}</span></div>
      </div>
      {preview.destinos.length > 0 && (
        <>
          <div className="modal-transferir__preview-fluxo" aria-hidden="true"><CaretDown size={20} weight="bold" /></div>
          <div className="modal-transferir__preview-destinos">
            {preview.destinos.map((d, idx) => (
              <div key={idx} className="modal-transferir__preview-destino">
                <div className="modal-transferir__preview-titulo">
                  <ArrowSquareIn size={18} weight="duotone" className="modal-transferir__preview-icone modal-transferir__preview-icone--destino" />
                  <span>{interpolarTextoTransferir(T.preview_destino_titulo, { n: preview.destinos.length > 1 ? String(idx + 1) : '' })}</span>
                  {d.tipo === 'novo' ? <span className="modal-transferir__badge-novo"><PlusCircle size={11} weight="fill" />{T.badge_novo}</span> : <span className="modal-transferir__badge-existente"><Database size={11} weight="fill" />{T.badge_existente}</span>}
                </div>
                {d.pedido_numero && <div className="modal-transferir__preview-linha"><span>{T.preview_label_pedido}</span><span className="modal-transferir__preview-valor">{d.pedido_numero}</span></div>}
                <div className="modal-transferir__preview-linha"><span>{T.preview_label_quantidade}</span><span className="modal-transferir__preview-valor modal-transferir__preview-valor--positivo">+{fmtQuantidadeSimulador(d.quantidade)}</span></div>
                {d.alertas.map((a, ai) => (
                  <div key={ai} className="modal-transferir__alerta" role="alert"><Warning size={14} weight="fill" aria-hidden="true" />{a}</div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
      {preview.alertas_globais.length > 0 && (
        <div className="modal-transferir__alertas" role="status" aria-live="polite">
          {preview.alertas_globais.map((a, i) => (
            <div key={i} className="modal-transferir__alerta"><Warning size={14} weight="fill" aria-hidden="true" />{a}</div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ModalTransferirListaSimuladorPedido({ aberto, selecao, linhas, onFechar, onConcluido }: Props) {
  const [selecaoCongelada, setSelecaoCongelada] = useState(selecao)
  const [linhasCongeladas, setLinhasCongeladas] = useState(linhas)
  const [passo, setPasso] = useState<Passo>(1)
  const [cenario, setCenario] = useState<CenarioTransferSimulador | null>(null)
  const [destinos, setDestinos] = useState<TransferDestinoSimulador[]>([{ tipo: 'existente', quantidade: 0 }])
  const [numeroPedidoNovo, setNumeroPedidoNovo] = useState('')
  const [previews, setPreviews] = useState<TransferPreviewSimulador[]>([])
  const [carregandoPreview, setCarregandoPreview] = useState(false)
  const [erroPreview, setErroPreview] = useState<string | null>(null)
  const [confirmando, setConfirmando] = useState(false)
  const [erroConfirmar, setErroConfirmar] = useState<string | null>(null)
  const [concluido, setConcluido] = useState(false)
  const [confirmarTiposDivergentes, setConfirmarTiposDivergentes] = useState(false)
  const [resumoFinal, setResumoFinal] = useState<ResumoTransferenciaListaSimulador | null>(null)
  const [linhasResultado, setLinhasResultado] = useState<LinhaListaPedidoSimulador[] | null>(null)
  const [idsNovosPedidosResultado, setIdsNovosPedidosResultado] = useState<string[]>([])

  const modalAbertoAnteriorRef = useRef(false)

  useEffect(() => {
    if (!aberto) {
      modalAbertoAnteriorRef.current = false
      return
    }
    if (modalAbertoAnteriorRef.current) return
    modalAbertoAnteriorRef.current = true

    setSelecaoCongelada(selecao)
    setLinhasCongeladas(linhas)
    const pedidosAbertura = montarPedidosEnvolvidosTransferir(selecao, linhas)
    const avulsosAbertura = filtrarItensAvulsosSelecao(selecao)
    const itensComPedidoAbertura = montarItensComPedidoTransferirSimulador(pedidosAbertura, avulsosAbertura, linhas)
    const idsPreselecionados = avulsosAbertura.length > 0
      ? avulsosAbertura.map(({ item }) => item.id)
      : undefined
    setItensQuantidades(inicializarItensQuantidadesTransferirSimulador(itensComPedidoAbertura, idsPreselecionados))
    setPasso(1)
    setCenario(null)
    setDestinos([{ tipo: 'existente', quantidade: 0 }])
    setNumeroPedidoNovo('')
    setPreviews([])
    setErroPreview(null)
    setErroConfirmar(null)
    setConcluido(false)
    setConfirmarTiposDivergentes(false)
    setResumoFinal(null)
    setLinhasResultado(null)
    setIdsNovosPedidosResultado([])
  }, [aberto, selecao, linhas])

  const pedidos = useMemo(() => montarPedidosEnvolvidosTransferir(selecaoCongelada, linhasCongeladas), [selecaoCongelada, linhasCongeladas])
  const itensAvulsos = useMemo(() => filtrarItensAvulsosSelecao(selecaoCongelada), [selecaoCongelada])
  const itensComPedido = useMemo(() => montarItensComPedidoTransferirSimulador(pedidos, itensAvulsos, linhasCongeladas), [pedidos, itensAvulsos, linhasCongeladas])
  const pedido = pedidos[0]
  const multiPedido = pedidos.length > 1

  const itemToPedidoMap = useMemo(() => {
    const mapa = new Map<string, LinhaListaPedidoSimulador>()
    for (const { item, pedido: p } of itensComPedido) mapa.set(item.id, p)
    return mapa
  }, [itensComPedido])

  const [itensQuantidades, setItensQuantidades] = useState<Map<string, number>>(() => new Map())

  const pedidosDestinoDisponiveis = useMemo(() => {
    if (!pedido) return []
    return listarPedidosDestinoElegiveisSimulador(linhasCongeladas, pedidos, pedido.tipoOperacao)
  }, [linhasCongeladas, pedidos, pedido])

  const quantidadeTotalSelecionada = useMemo(() => {
    let soma = 0
    for (const qty of itensQuantidades.values()) soma += qty
    return soma
  }, [itensQuantidades])

  useEffect(() => {
    if (!cenario) return
    if (cenario === 'reducao_simples') setDestinos([])
    else setDestinos([{ tipo: cenario === 'split_novo_pedido' ? 'novo' : 'existente', quantidade: quantidadeTotalSelecionada }])
  }, [cenario, quantidadeTotalSelecionada])

  const cenarioInfo = CENARIOS.find((c) => c.id === cenario)

  const handleToggleItem = useCallback((itemId: string) => {
    setItensQuantidades((prev) => {
      const novo = new Map(prev)
      if (novo.has(itemId)) novo.delete(itemId)
      else novo.set(itemId, 0)
      return novo
    })
  }, [])

  const handleToggleTodos = useCallback(() => {
    setItensQuantidades((prev) => {
      const todosIds = itensComPedido.map(({ item }) => item.id)
      const todosJa = todosIds.length > 0 && todosIds.every((id) => prev.has(id))
      if (todosJa) return new Map()
      const novo = new Map(prev)
      for (const id of todosIds) if (!novo.has(id)) novo.set(id, 0)
      return novo
    })
  }, [itensComPedido])

  const handleQuantidadeItemChange = useCallback((itemId: string, qty: number) => {
    setItensQuantidades((prev) => { const novo = new Map(prev); novo.set(itemId, qty); return novo })
  }, [])

  const podeProsseguirPasso2 = itensQuantidades.size > 0 && Array.from(itensQuantidades.entries()).every(([id, qty]) => {
    const ic = itensComPedido.find((x) => x.item.id === id)
    return ic != null && qty > 0 && qty <= lerSaldoTransferivelItemSimulador(ic.item)
  })

  const podeProsseguirPasso3 = cenario === 'reducao_simples' || (destinos.length > 0 && destinos.every((d) => {
    if (d.quantidade <= 0) return false
    if (cenario === 'split_pedido_existente' && !d.pedido_id?.trim()) return false
    if (cenario === 'split_novo_pedido' && !numeroPedidoNovo.trim()) return false
    return true
  }))

  const buscarPreview = useCallback(async () => {
    if (!cenario || itensQuantidades.size === 0) return
    setCarregandoPreview(true)
    setErroPreview(null)
    setPreviews([])
    try {
      await new Promise((r) => setTimeout(r, 350))
      const resultados: TransferPreviewSimulador[] = []
      for (const [itemId, qty] of itensQuantidades.entries()) {
        const pedidoDoItem = itemToPedidoMap.get(itemId)
        const item = itensComPedido.find((ic) => ic.item.id === itemId)?.item
        if (!pedidoDoItem || !item) continue
        resultados.push(gerarPreviewTransferenciaSimulador(cenario, item, pedidoDoItem, qty, destinos, numeroPedidoNovo, linhasCongeladas, destinos[0]?.pedido_id))
      }
      setPreviews(resultados)
    } catch {
      setErroPreview(T.erro_calcular_preview)
    } finally {
      setCarregandoPreview(false)
    }
  }, [cenario, itensQuantidades, itemToPedidoMap, itensComPedido, destinos, numeroPedidoNovo, linhasCongeladas])

  const avancar = useCallback(async () => {
    if (passo === 2) {
      const total = Array.from(itensQuantidades.values()).reduce((s, q) => s + q, 0)
      setDestinos((prev) => prev.map((d) => ({ ...d, quantidade: total })))
      setPasso(3)
    } else if (passo === 3) {
      await buscarPreview()
      setPasso(4)
    } else if (passo < 5) setPasso((prev) => (prev + 1) as Passo)
  }, [passo, buscarPreview, itensQuantidades])

  const voltar = useCallback(() => { if (passo > 1) setPasso((prev) => (prev - 1) as Passo) }, [passo])

  const handleConfirmar = useCallback(async () => {
    if (!cenario || itensQuantidades.size === 0) return
    setConfirmando(true)
    setErroConfirmar(null)
    try {
      await new Promise((r) => setTimeout(r, 400))
      const { linhas: proximas, resumo, idsNovosPedidos } = aplicarTransferenciaListaSimulador(linhasCongeladas, {
        cenario, itensQuantidades, itemToPedido: itemToPedidoMap, destinos, numeroPedidoNovo,
      })
      setLinhasResultado(proximas)
      setIdsNovosPedidosResultado(idsNovosPedidos)
      setResumoFinal(resumo)
      setConcluido(true)
    } catch {
      setErroConfirmar(T.erro_confirmar)
    } finally {
      setConfirmando(false)
    }
  }, [cenario, itensQuantidades, itemToPedidoMap, destinos, numeroPedidoNovo, linhasCongeladas])

  const handleFecharResultado = useCallback(() => {
    if (linhasResultado && resumoFinal) {
      onConcluido(linhasResultado, resumoFinal, idsNovosPedidosResultado)
    }
    onFechar()
  }, [linhasResultado, resumoFinal, idsNovosPedidosResultado, onConcluido, onFechar])

  const temAvisoTipo = previews.some((p) => p.aviso_tipo_operacao)
  const podeProsseguir = passo === 1 ? cenario !== null : passo === 2 ? podeProsseguirPasso2 : passo === 3 ? podeProsseguirPasso3 : passo === 4 ? previews.length > 0 && !erroPreview && (!temAvisoTipo || confirmarTiposDivergentes) : false
  const primeiroItemId = useMemo(() => {
    const keys = Array.from(itensQuantidades.keys())
    return keys.length > 0 ? keys[0] : null
  }, [itensQuantidades])

  if (!aberto || !pedido) return null

  const numerosTitulo = multiPedido ? pedidos.map((p) => p.numeroPedido).join(', ') : pedido.numeroPedido
  const titulo = interpolarTextoTransferir(T.titulo, { numero: numerosTitulo.length > 40 ? `${numerosTitulo.slice(0, 40)}…` : numerosTitulo })
  const tituloNode = numerosTitulo.length > 40 ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      {titulo}
      <TooltipGlobal titulo={T.titulo_tooltip_pedidos} descricao={numerosTitulo}>
        <Eye size={16} style={{ cursor: 'help', opacity: 0.7, flexShrink: 0 }} />
      </TooltipGlobal>
    </span>
  ) : undefined
  const PASSOS: PassoConfig[] = [
    { id: 1, label: T.passo1_label }, { id: 2, label: T.passo2_label }, { id: 3, label: T.passo3_label },
    { id: 4, label: T.passo4_label }, { id: 5, label: T.passo5_label },
  ]

  const footer = concluido ? (
    <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}><BotaoGlobal variante="primario" tamanho="medio" onClick={handleFecharResultado}>{T.fechar}</BotaoGlobal></div>
  ) : (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
      <BotaoGlobal variante="fantasma" tamanho="padrao" onClick={passo === 1 ? onFechar : voltar} disabled={confirmando}>{passo === 1 ? T.cancelar : T.voltar}</BotaoGlobal>
      {passo === 5 ? (
        <BotaoGlobal variante="primario" tamanho="padrao" onClick={handleConfirmar} disabled={confirmando} carregando={confirmando} iconeDireita={<ArrowRight size={14} weight="bold" />}>{confirmando ? T.transferindo : T.confirmar}</BotaoGlobal>
      ) : (
        <BotaoGlobal variante="primario" tamanho="padrao" onClick={() => void avancar()} disabled={!podeProsseguir || carregandoPreview} carregando={carregandoPreview} iconeDireita={<ArrowRight size={14} weight="bold" />}>{carregandoPreview ? T.calculando : passo === 4 ? T.revisar_confirmar : T.proximo}</BotaoGlobal>
      )}
    </div>
  )

  return (
    <ModalPassoPassoGlobal titulo={titulo} tituloNode={tituloNode} icone={<ArrowSquareOut size={20} weight="duotone" />} subtitulo={T.subtitulo} aberto={aberto} passos={PASSOS} passoAtual={passo} onProximo={() => undefined} onVoltar={() => undefined} onFechar={concluido ? handleFecharResultado : onFechar} tamanho={multiPedido ? '2xl' : 'xl'} ocultarStepper={concluido} footerCustom={footer}>
      <div className="modal-transferir__corpo">
        {concluido && resumoFinal ? (
          <div className="modal-transferir__resultado" role="status" aria-live="polite">
            <div className="modal-transferir__resultado-sucesso"><CheckCircle size={20} weight="fill" className="modal-transferir__icone-sucesso" /><p className="modal-transferir__resultado-texto">{T.resultado_titulo}</p></div>
            <div className="modal-transferir__secao-titulo"><ArrowSquareOut size={14} weight="duotone" className="modal-transferir__secao-icone" />{T.secao_origem_resultado}</div>
            <ul className="modal-transferir__lista-resultado">
              <li className="modal-transferir__item-resultado"><div className="modal-transferir__resultado-col"><span className="modal-transferir__resultado-label">{T.sucesso_label_cenario}</span><span className="modal-transferir__resultado-detalhe">{cenarioInfo?.nome ?? ''}</span></div><span className="modal-transferir__resultado-ok"><CheckCircle size={14} weight="fill" /> OK</span></li>
              <li className="modal-transferir__item-resultado"><div className="modal-transferir__resultado-col"><span className="modal-transferir__resultado-label">{T.preview_label_pedido}</span><span className="modal-transferir__resultado-detalhe">{numerosTitulo}</span></div><span className="modal-transferir__resultado-ok"><CheckCircle size={14} weight="fill" /> OK</span></li>
              {itensQuantidades.size > 0 && (
                <li className="modal-transferir__item-resultado"><div className="modal-transferir__resultado-col"><span className="modal-transferir__resultado-label">{T.sucesso_label_item}</span><span className="modal-transferir__resultado-detalhe">{itensQuantidades.size === 1 ? (itensComPedido.find((ic) => ic.item.id === primeiroItemId) ? lerPartNumberItemSimulador(itensComPedido.find((ic) => ic.item.id === primeiroItemId)!.item) : '—') : interpolarTextoTransferir(T.n_itens, { count: itensQuantidades.size })}</span></div><span className="modal-transferir__resultado-ok"><CheckCircle size={14} weight="fill" /> OK</span></li>
              )}
              <li className="modal-transferir__item-resultado"><div className="modal-transferir__resultado-col"><span className="modal-transferir__resultado-label">{T.sucesso_label_qtd}</span><span className="modal-transferir__resultado-detalhe">{fmtQuantidadeSimulador(quantidadeTotalSelecionada)}</span></div><span className="modal-transferir__resultado-ok"><CheckCircle size={14} weight="fill" /> OK</span></li>
            </ul>
            {(resumoFinal.pedidoNovoNumero || resumoFinal.pedidosDestinoNumeros.length > 0) && (
              <>
                <div className="modal-transferir__secao-titulo"><ArrowSquareIn size={14} weight="duotone" className="modal-transferir__secao-icone" />{T.secao_destino_resultado}</div>
                <ul className="modal-transferir__lista-resultado">
                  {resumoFinal.pedidoNovoNumero && (
                    <li className="modal-transferir__item-resultado"><div className="modal-transferir__resultado-col"><span className="modal-transferir__resultado-label">{T.sucesso_label_novo_pedido}</span><span className="modal-transferir__resultado-detalhe">{resumoFinal.pedidoNovoNumero}</span></div><span className="modal-transferir__resultado-ok"><CheckCircle size={14} weight="fill" /> OK</span></li>
                  )}
                  {resumoFinal.pedidosDestinoNumeros.length > 0 && !resumoFinal.pedidoNovoNumero && (
                    <li className="modal-transferir__item-resultado"><div className="modal-transferir__resultado-col"><span className="modal-transferir__resultado-label">{T.sucesso_label_destino}</span><span className="modal-transferir__resultado-detalhe">{resumoFinal.pedidosDestinoNumeros.join(', ')}</span></div><span className="modal-transferir__resultado-ok"><CheckCircle size={14} weight="fill" /> OK</span></li>
                  )}
                </ul>
              </>
            )}
          </div>
        ) : (
          <>
            {passo === 1 && <SeletorCenario cenarioSelecionado={cenario} onChange={setCenario} />}
            {passo === 2 && <SeletorItemQuantidade itensComPedido={itensComPedido} itensQuantidades={itensQuantidades} onToggleItem={handleToggleItem} onToggleTodos={handleToggleTodos} onQuantidadeChange={handleQuantidadeItemChange} multiPedido={multiPedido} />}
            {passo === 3 && cenario && (
              cenario === 'reducao_simples' ? (
                <div className="modal-transferir__destinos"><div className="modal-transferir__alerta"><Warning size={14} weight="fill" />{T.alerta_reducao}</div></div>
              ) : (
                <div className="modal-transferir__destinos">
                  {destinos.map((destino, idx) => (
                    <div key={idx} className="modal-transferir__destino-bloco">
                      <div className="modal-transferir__destino-titulo">{T.destino_titulo}</div>
                      {cenario === 'split_pedido_existente' && (
                        <SelectGlobal label={T.destino_id_label} placeholder={T.destino_id_placeholder} buscavel opcoes={pedidosDestinoDisponiveis.map((p) => ({ valor: p.id, rotulo: p.numeroPedido }))} valor={destino.pedido_id ?? null} aoMudarValor={(v) => setDestinos((prev) => prev.map((d, i) => (i === idx ? { ...d, pedido_id: v != null ? String(v) : undefined } : d)))} obrigatorio />
                      )}
                      {cenario === 'split_novo_pedido' && (
                        <div className="modal-transferir__destino-linha">
                          <label className="modal-transferir__label" htmlFor="destino-numero-novo-sim">{T.novo_pedido_label}</label>
                          <input id="destino-numero-novo-sim" type="text" className="modal-transferir__input" value={numeroPedidoNovo} onChange={(e) => setNumeroPedidoNovo(e.target.value)} placeholder={T.novo_pedido_placeholder} />
                        </div>
                      )}
                      {quantidadeTotalSelecionada > 0 && <div className="modal-transferir__destino-linha"><span className="modal-transferir__label">{T.qty_a_transferir}</span><span className="modal-transferir__destino-qty-readonly">{fmtQuantidadeSimulador(destino.quantidade)}</span></div>}
                    </div>
                  ))}
                </div>
              )
            )}
            {passo === 4 && (carregandoPreview ? <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }} aria-live="polite"><GravityLoader texto={T.calculando} tamanho="sm" /></div> : erroPreview ? <div className="modal-transferir__erro" role="alert"><Warning size={16} weight="fill" />{erroPreview}</div> : previews.length > 0 ? (
              <div className="modal-transferir__preview-wrapper">
                {temAvisoTipo && (
                  <div className="modal-transferir__aviso-tipos">
                    <Warning weight="duotone" size={18} className="modal-transferir__aviso-tipos-icone" />
                    <div>
                      <p className="modal-transferir__aviso-tipos-titulo">{T.aviso_tipos_titulo}</p>
                      <p className="modal-transferir__aviso-tipos-msg">{T.aviso_tipos_msg}</p>
                    </div>
                  </div>
                )}
                {previews.map((prev, idx) => <PreviewImpacto key={idx} preview={prev} indice={idx} total={previews.length} />)}
                {temAvisoTipo && (
                  <label className="modal-transferir__confirmacao-tipos">
                    <input type="checkbox" checked={confirmarTiposDivergentes} onChange={(e) => setConfirmarTiposDivergentes(e.target.checked)} className="modal-transferir__confirmacao-tipos-check" />
                    {T.confirm_tipos_divergentes}
                  </label>
                )}
              </div>
            ) : null)}
            {passo === 5 && (
              <div className="modal-transferir__confirmacao-bloco">
                <div className="modal-transferir__alerta modal-transferir__alerta--confirmacao"><ArrowRight size={14} weight="bold" />{cenarioInfo?.reversivel ? T.passo5_reversivel : T.passo5_irreversivel}</div>
                <div className="modal-transferir__preview-wrapper">{previews.map((prev, idx) => <PreviewImpacto key={idx} preview={prev} indice={idx} total={previews.length} />)}</div>
                {erroConfirmar && <div className="modal-transferir__erro" role="alert"><Warning size={16} weight="fill" />{erroConfirmar}</div>}
              </div>
            )}
          </>
        )}
      </div>
    </ModalPassoPassoGlobal>
  )
}
