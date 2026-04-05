/**
 * DrawerPedido.tsx — Drawer lateral de criacao/edicao de Pedido
 *
 * Props:
 *   aberto        — controla visibilidade
 *   pedidoId?     — undefined = criar (POST) / preenchido = editar (PUT)
 *   onFechar      — callback para fechar o drawer
 *   onSalvo       — callback com o pedido salvo
 *   initialTab?   — aba inicial ao abrir ('dados' | 'itens' | 'transferencias')
 *
 * Comportamento:
 *   - Slide-in da direita com backdrop desfocado
 *   - Largura 480px (desktop) / 100vw (mobile)
 *   - Fechar com Escape ou clique no backdrop
 *   - Confirma fechar se houver dados preenchidos e nao salvos
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Package,
  Plus,
  Trash,
  FloppyDisk,
  X,
  Spinner,
  Warning,
  ArrowsLeftRight,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { GabiFieldIcon } from '@nucleo/gabi-field-icon-global'
import type { TipoOperacao, PedidoItem, Pedido, TransferHistorico } from '../shared/types'
import { pedidoApi, pedidoTransferirApi } from '../shared/api'
import './DrawerPedido.css'

// ── Props ─────────────────────────────────────────────────────────────────────

export type DrawerPedidoTab = 'dados' | 'itens' | 'transferencias'

export interface DrawerPedidoProps {
  aberto: boolean
  pedidoId?: string
  onFechar: () => void
  onSalvo: (pedido: Pedido) => void
  initialTab?: DrawerPedidoTab
}

// ── Tipos de formulario ──────────────────────────────────────────────────────

interface PedidoForm {
  tipo_operacao: TipoOperacao
  numero_pedido: string
  importacao_exportador_id: string
  fabricante_id: string
  incoterm: string
  moeda_pedido: string
  cobertura_cambial: string
  condicao_pagamento: string
  numero_proforma: string
  numero_invoice: string
  referencia_importador: string
  referencia_exportador: string
  referencia_fabricante: string
  data_emissao_pedido: string
}

interface ItemForm {
  key: string
  part_number: string
  ncm: string
  descricao_item: string
  quantidade_inicial_item_pedido: string
  unidade_comercializada_item: string
  valor_por_unidade_item: string
}

const FORM_VAZIO: PedidoForm = {
  tipo_operacao: 'importacao',
  numero_pedido: '',
  importacao_exportador_id: '',
  fabricante_id: '',
  incoterm: 'FOB',
  moeda_pedido: 'USD',
  cobertura_cambial: 'com_cobertura',
  condicao_pagamento: '',
  numero_proforma: '',
  numero_invoice: '',
  referencia_importador: '',
  referencia_exportador: '',
  referencia_fabricante: '',
  data_emissao_pedido: new Date().toISOString().split('T')[0],
}

const ITEM_VAZIO = (): ItemForm => ({
  key: crypto.randomUUID(),
  part_number: '',
  ncm: '',
  descricao_item: '',
  quantidade_inicial_item_pedido: '',
  unidade_comercializada_item: 'UN',
  valor_por_unidade_item: '',
})

function formFoiAlterado(form: PedidoForm, itens: ItemForm[]): boolean {
  if (form.numero_pedido.trim() !== '') return true
  if (form.importacao_exportador_id.trim() !== '') return true
  if (itens.some(i => i.part_number.trim() !== '' || i.descricao_item.trim() !== '')) return true
  return false
}

// ── Componente ────────────────────────────────────────────────────────────────

export function DrawerPedido({ aberto, pedidoId, onFechar, onSalvo, initialTab }: DrawerPedidoProps) {
  const modoEdicao = Boolean(pedidoId)

  const [form, setForm]       = useState<PedidoForm>(FORM_VAZIO)
  const [itens, setItens]     = useState<ItemForm[]>([ITEM_VAZIO()])
  const [carregando, setCarregando] = useState(false)
  const [salvando, setSalvando]     = useState(false)
  const [erro, setErro]             = useState<string | null>(null)

  // ── Abas ──────────────────────────────────────────────────────────────────
  const [abaAtiva, setAbaAtiva] = useState<DrawerPedidoTab>(() => initialTab ?? 'dados')

  // Transferencias (lazy load)
  const [transferencias, setTransferencias]           = useState<TransferHistorico[]>([])
  const [carregandoTransfer, setCarregandoTransfer]   = useState(false)
  const [erroTransfer, setErroTransfer]               = useState<string | null>(null)
  const transferCarregado                              = useRef(false)

  const formRef = useRef({ form, itens })
  formRef.current = { form, itens }

  // Resetar aba ao abrir
  useEffect(() => {
    if (aberto) {
      setAbaAtiva(initialTab ?? 'dados')
      setTransferencias([])
      setErroTransfer(null)
      transferCarregado.current = false
    }
  }, [aberto, initialTab])

  // Lazy-load de transferencias ao selecionar aba
  useEffect(() => {
    if (abaAtiva !== 'transferencias') return
    if (!pedidoId) return
    if (transferCarregado.current) return

    let cancelado = false
    setCarregandoTransfer(true)
    setErroTransfer(null)

    pedidoTransferirApi.historico(pedidoId)
      .then(data => {
        if (cancelado) return
        setTransferencias(data)
        transferCarregado.current = true
      })
      .catch(() => {
        if (!cancelado) setErroTransfer('Erro ao carregar transferencias. Tente novamente.')
      })
      .finally(() => {
        if (!cancelado) setCarregandoTransfer(false)
      })

    return () => { cancelado = true }
  }, [abaAtiva, pedidoId])

  // Carregar pedido ao abrir em modo edicao
  useEffect(() => {
    if (!aberto) return
    if (!modoEdicao) {
      setForm(FORM_VAZIO)
      setItens([ITEM_VAZIO()])
      setErro(null)
      return
    }

    let cancelado = false
    setCarregando(true)
    setErro(null)

    pedidoApi.buscarPorId(pedidoId!)
      .then(pedido => {
        if (cancelado) return
        setForm({
          tipo_operacao: pedido.tipo_operacao,
          numero_pedido: pedido.numero_pedido,
          importacao_exportador_id: pedido.importacao_exportador_id ?? '',
          fabricante_id: '',
          incoterm: pedido.incoterm ?? 'FOB',
          moeda_pedido: pedido.moeda_pedido,
          cobertura_cambial: pedido.cobertura_cambial,
          condicao_pagamento: pedido.condicao_pagamento ?? '',
          numero_proforma: pedido.numero_proforma ?? '',
          numero_invoice: pedido.numero_invoice ?? '',
          referencia_importador: pedido.referencia_importador ?? '',
          referencia_exportador: pedido.referencia_exportador ?? '',
          referencia_fabricante: pedido.referencia_fabricante ?? '',
          data_emissao_pedido: pedido.data_emissao_pedido?.split('T')[0] ?? '',
        })
        if (pedido.itens?.length > 0) {
          setItens(pedido.itens.map((item: PedidoItem) => ({
            key: item.id,
            part_number: item.part_number,
            ncm: item.ncm,
            descricao_item: item.descricao_item,
            quantidade_inicial_item_pedido: String(item.quantidade_inicial_item_pedido),
            unidade_comercializada_item: item.unidade_comercializada_item ?? 'UN',
            valor_por_unidade_item: item.valor_por_unidade_item != null ? String(item.valor_por_unidade_item) : '',
          })))
        }
      })
      .catch(() => {
        if (!cancelado) setErro('Erro ao carregar pedido. Tente novamente.')
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })

    return () => { cancelado = true }
  }, [aberto, modoEdicao, pedidoId])

  // Fechar com Escape
  useEffect(() => {
    if (!aberto) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') tentarFechar()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [aberto]) // tentarFechar eh definido abaixo

  const tentarFechar = useCallback(() => {
    const { form: f, itens: it } = formRef.current
    if (formFoiAlterado(f, it)) {
      if (!window.confirm('Existem dados preenchidos que serao perdidos. Deseja fechar mesmo assim?')) return
    }
    onFechar()
  }, [onFechar])

  function handleChange(campo: keyof PedidoForm, valor: string) {
    setForm(prev => ({ ...prev, [campo]: valor }))
  }

  function handleItemChange(index: number, campo: keyof ItemForm, valor: string) {
    setItens(prev => prev.map((item, i) => i === index ? { ...item, [campo]: valor } : item))
  }

  function adicionarItem() {
    setItens(prev => [...prev, ITEM_VAZIO()])
  }

  function removerItem(index: number) {
    if (itens.length <= 1) return
    setItens(prev => prev.filter((_, i) => i !== index))
  }

  const handleSalvar = useCallback(async () => {
    setSalvando(true)
    setErro(null)
    try {
      const itensMapped = itens.map(item => ({
        part_number: item.part_number,
        ncm: item.ncm,
        descricao_item: item.descricao_item,
        quantidade_inicial_item_pedido: parseFloat(item.quantidade_inicial_item_pedido) || 0,
        unidade_comercializada_item: item.unidade_comercializada_item,
        valor_por_unidade_item: item.valor_por_unidade_item ? parseFloat(item.valor_por_unidade_item) : undefined,
      }))
      const payload = { ...form, data_emissao_pedido: form.data_emissao_pedido, itens: itensMapped as PedidoItem[] }

      const resultado = modoEdicao
        ? await pedidoApi.atualizar(pedidoId!, payload)
        : await pedidoApi.criar(payload)

      onSalvo(resultado)
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar pedido. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }, [form, itens, modoEdicao, pedidoId, onSalvo])

  if (!aberto) return null

  return (
    <div
      className="drawer-pedido__overlay"
      onClick={e => { if (e.target === e.currentTarget) tentarFechar() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-pedido-titulo"
    >
      <div className="drawer-pedido__container">
        {/* Header */}
        <div className="drawer-pedido__header">
          <h2 id="drawer-pedido-titulo" className="drawer-pedido__titulo">
            <Package size={18} weight="duotone" aria-hidden="true" />
            {modoEdicao ? 'Editar Pedido' : 'Novo Pedido'}
          </h2>
          <button
            className="drawer-pedido__fechar"
            onClick={tentarFechar}
            aria-label="Fechar drawer"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* Barra de abas */}
        <div className="drawer-pedido__tabs" role="tablist" aria-label="Secoes do pedido">
          <button
            role="tab"
            aria-selected={abaAtiva === 'dados'}
            aria-controls="dp-panel-dados"
            className={`drawer-pedido__tab${abaAtiva === 'dados' ? ' drawer-pedido__tab--ativo' : ''}`}
            onClick={() => setAbaAtiva('dados')}
            type="button"
          >
            Dados
          </button>
          <button
            role="tab"
            aria-selected={abaAtiva === 'itens'}
            aria-controls="dp-panel-itens"
            className={`drawer-pedido__tab${abaAtiva === 'itens' ? ' drawer-pedido__tab--ativo' : ''}`}
            onClick={() => setAbaAtiva('itens')}
            type="button"
          >
            Itens ({itens.length})
          </button>
          {modoEdicao && (
            <button
              role="tab"
              aria-selected={abaAtiva === 'transferencias'}
              aria-controls="dp-panel-transferencias"
              className={`drawer-pedido__tab${abaAtiva === 'transferencias' ? ' drawer-pedido__tab--ativo' : ''}`}
              onClick={() => setAbaAtiva('transferencias')}
              type="button"
            >
              <ArrowsLeftRight size={13} weight="bold" aria-hidden="true" />
              Transferencias {transferCarregado.current ? `(${transferencias.length})` : ''}
            </button>
          )}
        </div>

        {/* Corpo */}
        <div className="drawer-pedido__corpo">
          {carregando ? (
            <div className="drawer-pedido__loading" aria-live="polite">
              <Spinner size={20} className="drawer-pedido__spinner" aria-hidden="true" />
              <span>Carregando pedido...</span>
            </div>
          ) : (
            <>
              {/* Painel: Dados do Pedido */}
              <div
                id="dp-panel-dados"
                role="tabpanel"
                aria-labelledby="dp-tab-dados"
                hidden={abaAtiva !== 'dados'}
                className="drawer-pedido__painel"
              >
                <section>
                  <p className="drawer-pedido__secao-titulo">Dados do Pedido</p>
                  <div className="drawer-pedido__grid">
                    <div className="drawer-pedido__campo">
                      <label className="drawer-pedido__label" htmlFor="dp-tipo-operacao">Tipo Operacao</label>
                      <select
                        id="dp-tipo-operacao"
                        className="drawer-pedido__select"
                        value={form.tipo_operacao}
                        onChange={e => handleChange('tipo_operacao', e.target.value)}
                      >
                        <option value="importacao">Importacao</option>
                        <option value="exportacao">Exportacao</option>
                      </select>
                    </div>
                    <div className="drawer-pedido__campo">
                      <label className="drawer-pedido__label" htmlFor="dp-numero-pedido">Numero Pedido</label>
                      <input
                        id="dp-numero-pedido"
                        className="drawer-pedido__input"
                        value={form.numero_pedido}
                        onChange={e => handleChange('numero_pedido', e.target.value)}
                        placeholder="Ex: PO-2026/001"
                      />
                    </div>
                    <div className="drawer-pedido__campo">
                      <label className="drawer-pedido__label" htmlFor="dp-exportador">Exportador</label>
                      <input
                        id="dp-exportador"
                        className="drawer-pedido__input"
                        value={form.importacao_exportador_id}
                        onChange={e => handleChange('importacao_exportador_id', e.target.value)}
                        placeholder="Selecionar exportador"
                      />
                    </div>
                    <div className="drawer-pedido__campo">
                      <label className="drawer-pedido__label" htmlFor="dp-fabricante">Fabricante</label>
                      <input
                        id="dp-fabricante"
                        className="drawer-pedido__input"
                        value={form.fabricante_id}
                        onChange={e => handleChange('fabricante_id', e.target.value)}
                        placeholder="Selecionar fabricante"
                      />
                    </div>
                    <div className="drawer-pedido__campo">
                      <label className="drawer-pedido__label" htmlFor="dp-incoterm" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        Incoterm
                        <GabiFieldIcon campo="incoterm" label="Incoterm" gabiEndpoint="/api/v1/pedidos/gabi/field-help" />
                      </label>
                      <select
                        id="dp-incoterm"
                        className="drawer-pedido__select"
                        value={form.incoterm}
                        onChange={e => handleChange('incoterm', e.target.value)}
                      >
                        {['FOB','CIF','EXW','CFR','DDP','DAP','FCA','CPT','CIP','DPU','FAS'].map(i => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </div>
                    <div className="drawer-pedido__campo">
                      <label className="drawer-pedido__label" htmlFor="dp-moeda">Moeda</label>
                      <select
                        id="dp-moeda"
                        className="drawer-pedido__select"
                        value={form.moeda_pedido}
                        onChange={e => handleChange('moeda_pedido', e.target.value)}
                      >
                        {['USD','EUR','GBP','BRL','CNY','JPY'].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="drawer-pedido__campo">
                      <label className="drawer-pedido__label" htmlFor="dp-cobertura" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        Cobertura Cambial
                        <GabiFieldIcon campo="cobertura_cambial" label="Cobertura Cambial" gabiEndpoint="/api/v1/pedidos/gabi/field-help" />
                      </label>
                      <select
                        id="dp-cobertura"
                        className="drawer-pedido__select"
                        value={form.cobertura_cambial}
                        onChange={e => handleChange('cobertura_cambial', e.target.value)}
                      >
                        <option value="com_cobertura">Com Cobertura</option>
                        <option value="sem_cobertura">Sem Cobertura</option>
                      </select>
                    </div>
                    <div className="drawer-pedido__campo">
                      <label className="drawer-pedido__label" htmlFor="dp-pagamento" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        Condição de Pagamento
                        <GabiFieldIcon campo="condicao_pagamento" label="Condição de Pagamento" gabiEndpoint="/api/v1/pedidos/gabi/field-help" />
                      </label>
                      <input
                        id="dp-pagamento"
                        className="drawer-pedido__input"
                        value={form.condicao_pagamento}
                        onChange={e => handleChange('condicao_pagamento', e.target.value)}
                        placeholder="Ex: 30% Antecipado"
                      />
                    </div>
                    <div className="drawer-pedido__campo">
                      <label className="drawer-pedido__label" htmlFor="dp-proforma">Numero Proforma</label>
                      <input
                        id="dp-proforma"
                        className="drawer-pedido__input"
                        value={form.numero_proforma}
                        onChange={e => handleChange('numero_proforma', e.target.value)}
                      />
                    </div>
                    <div className="drawer-pedido__campo">
                      <label className="drawer-pedido__label" htmlFor="dp-invoice">Numero Invoice</label>
                      <input
                        id="dp-invoice"
                        className="drawer-pedido__input"
                        value={form.numero_invoice}
                        onChange={e => handleChange('numero_invoice', e.target.value)}
                      />
                    </div>
                    <div className="drawer-pedido__campo">
                      <label className="drawer-pedido__label" htmlFor="dp-ref-imp">Ref. Importador</label>
                      <input
                        id="dp-ref-imp"
                        className="drawer-pedido__input"
                        value={form.referencia_importador}
                        onChange={e => handleChange('referencia_importador', e.target.value)}
                      />
                    </div>
                    <div className="drawer-pedido__campo">
                      <label className="drawer-pedido__label" htmlFor="dp-ref-exp">Ref. Exportador</label>
                      <input
                        id="dp-ref-exp"
                        className="drawer-pedido__input"
                        value={form.referencia_exportador}
                        onChange={e => handleChange('referencia_exportador', e.target.value)}
                      />
                    </div>
                    <div className="drawer-pedido__campo">
                      <label className="drawer-pedido__label" htmlFor="dp-ref-fab">Ref. Fabricante</label>
                      <input
                        id="dp-ref-fab"
                        className="drawer-pedido__input"
                        value={form.referencia_fabricante}
                        onChange={e => handleChange('referencia_fabricante', e.target.value)}
                      />
                    </div>
                    <div className="drawer-pedido__campo">
                      <label className="drawer-pedido__label" htmlFor="dp-data-emissao">Data Emissao</label>
                      <input
                        id="dp-data-emissao"
                        type="date"
                        className="drawer-pedido__input"
                        value={form.data_emissao_pedido}
                        onChange={e => handleChange('data_emissao_pedido', e.target.value)}
                      />
                    </div>
                  </div>
                </section>

                {/* Erro */}
                {erro && (
                  <div className="drawer-pedido__erro" role="alert">
                    <Warning size={14} weight="fill" aria-hidden="true" />
                    {erro}
                  </div>
                )}
              </div>

              {/* Painel: Itens */}
              <div
                id="dp-panel-itens"
                role="tabpanel"
                aria-labelledby="dp-tab-itens"
                hidden={abaAtiva !== 'itens'}
                className="drawer-pedido__painel"
              >
                <section>
                  <div className="drawer-pedido__itens-header">
                    <p className="drawer-pedido__secao-titulo" style={{ margin: 0 }}>
                      Itens ({itens.length})
                    </p>
                    <BotaoGlobal
                      variante="secundario"
                      tamanho="pequeno"
                      icone={<Plus size={12} weight="bold" />}
                      onClick={adicionarItem}
                    >
                      Adicionar Item
                    </BotaoGlobal>
                  </div>

                  {itens.map((item, index) => (
                    <div key={item.key} className="drawer-pedido__item">
                      <div className="drawer-pedido__campo">
                        <label className="drawer-pedido__label" htmlFor={`dp-pn-${index}`} style={{ fontSize: '0.625rem' }}>Part Number</label>
                        <input
                          id={`dp-pn-${index}`}
                          className="drawer-pedido__input"
                          value={item.part_number}
                          onChange={e => handleItemChange(index, 'part_number', e.target.value)}
                          placeholder="SKU"
                          aria-label="Part Number"
                        />
                      </div>
                      <div className="drawer-pedido__campo">
                        <label className="drawer-pedido__label" htmlFor={`dp-ncm-${index}`} style={{ fontSize: '0.625rem' }}>NCM</label>
                        <input
                          id={`dp-ncm-${index}`}
                          className="drawer-pedido__input drawer-pedido__input--mono"
                          value={item.ncm}
                          onChange={e => handleItemChange(index, 'ncm', e.target.value)}
                          placeholder="0000.00.00"
                          aria-label="NCM"
                        />
                      </div>
                      <div className="drawer-pedido__campo">
                        <label className="drawer-pedido__label" htmlFor={`dp-desc-${index}`} style={{ fontSize: '0.625rem' }}>Descricao</label>
                        <input
                          id={`dp-desc-${index}`}
                          className="drawer-pedido__input"
                          value={item.descricao_item}
                          onChange={e => handleItemChange(index, 'descricao_item', e.target.value)}
                          placeholder="Descricao do item"
                          aria-label="Descricao"
                        />
                      </div>
                      <div className="drawer-pedido__campo">
                        <label className="drawer-pedido__label" htmlFor={`dp-qty-${index}`} style={{ fontSize: '0.625rem' }}>Qtd.</label>
                        <input
                          id={`dp-qty-${index}`}
                          type="number"
                          className="drawer-pedido__input"
                          style={{ textAlign: 'right' }}
                          value={item.quantidade_inicial_item_pedido}
                          onChange={e => handleItemChange(index, 'quantidade_inicial_item_pedido', e.target.value)}
                          placeholder="0"
                          min="0"
                          step="0.01"
                          aria-label="Quantidade"
                        />
                      </div>
                      <div className="drawer-pedido__campo">
                        <label className="drawer-pedido__label" htmlFor={`dp-uom-${index}`} style={{ fontSize: '0.625rem' }}>UoM</label>
                        <select
                          id={`dp-uom-${index}`}
                          className="drawer-pedido__select"
                          value={item.unidade_comercializada_item}
                          onChange={e => handleItemChange(index, 'unidade_comercializada_item', e.target.value)}
                          aria-label="Unidade"
                        >
                          {['UN','MT','M2','KG','LT','TON','CM3','PC'].map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </div>
                      <div className="drawer-pedido__campo">
                        <label className="drawer-pedido__label" htmlFor={`dp-vl-${index}`} style={{ fontSize: '0.625rem' }}>Vl. Unit.</label>
                        <input
                          id={`dp-vl-${index}`}
                          type="number"
                          className="drawer-pedido__input"
                          style={{ textAlign: 'right' }}
                          value={item.valor_por_unidade_item}
                          onChange={e => handleItemChange(index, 'valor_por_unidade_item', e.target.value)}
                          placeholder="0,00"
                          min="0"
                          step="0.01"
                          aria-label="Valor Unitario"
                        />
                      </div>
                      <button
                        className="drawer-pedido__item-remover"
                        onClick={() => removerItem(index)}
                        disabled={itens.length <= 1}
                        title="Remover item"
                        aria-label={`Remover item ${index + 1}`}
                        type="button"
                      >
                        <Trash size={14} weight="duotone" />
                      </button>
                    </div>
                  ))}
                </section>
              </div>

              {/* Painel: Transferencias */}
              {modoEdicao && (
                <div
                  id="dp-panel-transferencias"
                  role="tabpanel"
                  aria-labelledby="dp-tab-transferencias"
                  hidden={abaAtiva !== 'transferencias'}
                  className="drawer-pedido__painel"
                >
                  {carregandoTransfer ? (
                    <div className="drawer-pedido__loading" aria-live="polite">
                      <Spinner size={20} className="drawer-pedido__spinner" aria-hidden="true" />
                      <span>Carregando transferencias...</span>
                    </div>
                  ) : erroTransfer ? (
                    <div className="drawer-pedido__erro" role="alert">
                      <Warning size={14} weight="fill" aria-hidden="true" />
                      {erroTransfer}
                    </div>
                  ) : transferencias.length === 0 ? (
                    <div className="drawer-pedido__transferencias-vazio">
                      <ArrowsLeftRight size={28} weight="duotone" aria-hidden="true" />
                      <span>Nenhuma transferencia registrada</span>
                    </div>
                  ) : (
                    <ol className="drawer-pedido__timeline" aria-label="Historico de transferencias">
                      {transferencias.map(t => (
                        <li key={t.id} className="drawer-pedido__timeline-item">
                          <div className="drawer-pedido__timeline-dot" aria-hidden="true" />
                          <div className="drawer-pedido__timeline-conteudo">
                            <div className="drawer-pedido__timeline-cabecalho">
                              <time
                                className="drawer-pedido__timeline-data"
                                dateTime={t.created_at}
                              >
                                {new Date(t.created_at).toLocaleString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </time>
                              {t.revertido && (
                                <span className="drawer-pedido__badge-revertido" aria-label="Transferencia revertida">
                                  Revertido
                                </span>
                              )}
                            </div>
                            <p className="drawer-pedido__timeline-usuario">
                              Por: <strong>{t.created_by}</strong>
                            </p>
                            <p className="drawer-pedido__timeline-qtd">
                              Quantidade: <strong>{t.quantidade_item_transferida}</strong>
                            </p>
                            <p className="drawer-pedido__timeline-cenario">
                              Cenario: <span className="drawer-pedido__timeline-cenario-tag">{t.cenario}</span>
                            </p>
                            {t.destinos.length > 0 && (
                              <ul className="drawer-pedido__timeline-destinos" aria-label="Destinos da transferencia">
                                {t.destinos.map((d, di) => (
                                  <li key={di} className="drawer-pedido__timeline-destino">
                                    <span className="drawer-pedido__timeline-destino-tipo">{d.tipo}</span>
                                    {d.pedido_id && (
                                      <span className="drawer-pedido__timeline-destino-id">
                                        → Pedido {d.pedido_id}
                                      </span>
                                    )}
                                    <span className="drawer-pedido__timeline-destino-qtd">
                                      {d.quantidade} un.
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer — ocultar na aba de transferencias */}
        {abaAtiva !== 'transferencias' && (
          <div className="drawer-pedido__footer">
            <BotaoGlobal
              variante="secundario"
              tamanho="medio"
              onClick={tentarFechar}
              disabled={salvando}
            >
              Cancelar
            </BotaoGlobal>
            <BotaoGlobal
              variante="primario"
              tamanho="medio"
              icone={<FloppyDisk size={16} />}
              onClick={handleSalvar}
              disabled={carregando || salvando}
              aria-busy={salvando}
            >
              {salvando ? 'Salvando...' : modoEdicao ? 'Salvar Alteracoes' : 'Criar Pedido'}
            </BotaoGlobal>
          </div>
        )}
        {abaAtiva === 'transferencias' && (
          <div className="drawer-pedido__footer">
            <BotaoGlobal
              variante="secundario"
              tamanho="medio"
              onClick={tentarFechar}
              disabled={salvando}
            >
              Fechar
            </BotaoGlobal>
          </div>
        )}
      </div>
    </div>
  )
}
