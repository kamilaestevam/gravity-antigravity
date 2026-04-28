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
import { useTranslation } from 'react-i18next'
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
import { SelectNcmGlobal } from '@nucleo/campo-ncm-global'
import { ModalGlobal } from '@nucleo/modal-global'
import { GabiFieldIcon } from '@nucleo/gabi-field-icon-global'
import { ModalTabelaMoeda } from '@nucleo/modal-tabela-moeda'
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
  focusField?: string
}

// ── Tipos de formulario ──────────────────────────────────────────────────────

interface PedidoForm {
  tipo_operacao: TipoOperacao
  numero_pedido: string
  importacao_exportador_id: string
  fabricante_id: string
  incoterm: string
  moeda_pedido: string
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
  quantidade_inicial_pedido: string
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
  quantidade_inicial_pedido: '',
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

export function DrawerPedido({ aberto, pedidoId, onFechar, onSalvo, initialTab, focusField }: DrawerPedidoProps) {
  const { t, i18n } = useTranslation()
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
  const [confirmarFecharSemSalvar, setConfirmarFecharSemSalvar] = useState(false)
  const [modalMoedaAberta, setModalMoedaAberta] = useState(false)

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
        if (!cancelado) setErroTransfer(t('pedido.drawer.erro_transfer'))
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
            quantidade_inicial_pedido: String(item.quantidade_inicial_pedido),
            unidade_comercializada_item: item.unidade_comercializada_item ?? 'UN',
            valor_por_unidade_item: item.valor_por_unidade_item != null ? String(item.valor_por_unidade_item) : '',
          })))
        }
      })
      .catch(() => {
        if (!cancelado) setErro(t('pedido.drawer.erro_carregar'))
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })

    return () => { cancelado = true }
  }, [aberto, modoEdicao, pedidoId])

  // Scroll + focus no campo solicitado (via focusField prop)
  useEffect(() => {
    if (!aberto || !focusField || carregando) return
    // Aguarda o render do painel antes de scrollar
    const timer = setTimeout(() => {
      const el = document.getElementById(focusField)
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Destaque visual temporário
      el.classList.add('dp-field--highlight')
      setTimeout(() => el.classList.remove('dp-field--highlight'), 1800)
      // Focus no primeiro input/select/textarea dentro do campo
      const input = el.querySelector<HTMLElement>('input, select, textarea')
      input?.focus()
    }, 300)
    return () => clearTimeout(timer)
  }, [aberto, focusField, carregando])

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
      setConfirmarFecharSemSalvar(true)
      return
    }
    onFechar()
  }, [onFechar])

  const handleFecharConfirmado = useCallback(() => {
    setConfirmarFecharSemSalvar(false)
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
        quantidade_inicial_pedido: parseFloat(item.quantidade_inicial_pedido) || 0,
        unidade_comercializada_item: item.unidade_comercializada_item,
        valor_por_unidade_item: item.valor_por_unidade_item ? parseFloat(item.valor_por_unidade_item) : undefined,
      }))
      const payload = { ...form, data_emissao_pedido: form.data_emissao_pedido, itens: itensMapped as PedidoItem[] }

      const resultado = modoEdicao
        ? await pedidoApi.atualizar(pedidoId!, payload)
        : await pedidoApi.criar(payload)

      onSalvo(resultado)
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : t('pedido.drawer.erro_salvar'))
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
            {modoEdicao ? t('pedido.drawer.titulo_edicao') : t('pedido.drawer.titulo_novo')}
          </h2>
          <button
            className="drawer-pedido__fechar"
            onClick={tentarFechar}
            aria-label={t('pedido.drawer.aria_fechar_drawer')}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* Barra de abas */}
        <div className="drawer-pedido__tabs" role="tablist" aria-label={t('pedido.drawer.aria_secoes_pedido')}>
          <button
            role="tab"
            aria-selected={abaAtiva === 'dados'}
            aria-controls="dp-panel-dados"
            className={`drawer-pedido__tab${abaAtiva === 'dados' ? ' drawer-pedido__tab--ativo' : ''}`}
            onClick={() => setAbaAtiva('dados')}
            type="button"
          >
            {t('pedido.drawer.aba_dados')}
          </button>
          <button
            role="tab"
            aria-selected={abaAtiva === 'itens'}
            aria-controls="dp-panel-itens"
            className={`drawer-pedido__tab${abaAtiva === 'itens' ? ' drawer-pedido__tab--ativo' : ''}`}
            onClick={() => setAbaAtiva('itens')}
            type="button"
          >
            {t('pedido.drawer.aba_itens', { count: itens.length })}
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
              {t('pedido.drawer.aba_transferencias')}{transferCarregado.current ? ` (${transferencias.length})` : ''}
            </button>
          )}
        </div>

        {/* Corpo */}
        <div className="drawer-pedido__corpo">
          {carregando ? (
            <div className="drawer-pedido__loading" aria-live="polite">
              <Spinner size={20} className="drawer-pedido__spinner" aria-hidden="true" />
              <span>{t('pedido.drawer.carregando')}</span>
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
                  <p className="drawer-pedido__secao-titulo">{t('pedido.drawer.secao_dados')}</p>
                  <div className="drawer-pedido__grid">
                    <div className="drawer-pedido__campo">
                      <label className="drawer-pedido__label" htmlFor="dp-tipo-operacao">{t('pedido.drawer.label_tipo_op')}</label>
                      <select
                        id="dp-tipo-operacao"
                        className="drawer-pedido__select"
                        value={form.tipo_operacao}
                        onChange={e => handleChange('tipo_operacao', e.target.value)}
                      >
                        <option value="importacao">{t('pedido.drawer.opt_importacao')}</option>
                        <option value="exportacao">{t('pedido.drawer.opt_exportacao')}</option>
                      </select>
                    </div>
                    <div className="drawer-pedido__campo">
                      <label className="drawer-pedido__label" htmlFor="dp-numero-pedido">{t('pedido.drawer.label_numero')}</label>
                      <input
                        id="dp-numero-pedido"
                        className="drawer-pedido__input"
                        value={form.numero_pedido}
                        onChange={e => handleChange('numero_pedido', e.target.value)}
                        placeholder={t('pedido.drawer.ph_numero')}
                      />
                    </div>
                    <div className="drawer-pedido__campo">
                      <label className="drawer-pedido__label" htmlFor="dp-exportador">{t('pedido.drawer.label_exportador')}</label>
                      <input
                        id="dp-exportador"
                        className="drawer-pedido__input"
                        value={form.importacao_exportador_id}
                        onChange={e => handleChange('importacao_exportador_id', e.target.value)}
                        placeholder={t('pedido.drawer.selecionar_exportador')}
                      />
                    </div>
                    <div className="drawer-pedido__campo">
                      <label className="drawer-pedido__label" htmlFor="dp-fabricante">{t('pedido.drawer.label_fabricante')}</label>
                      <input
                        id="dp-fabricante"
                        className="drawer-pedido__input"
                        value={form.fabricante_id}
                        onChange={e => handleChange('fabricante_id', e.target.value)}
                        placeholder={t('pedido.drawer.selecionar_fabricante')}
                      />
                    </div>
                    <div className="drawer-pedido__campo">
                      <label className="drawer-pedido__label" htmlFor="dp-incoterm" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        {t('pedido.drawer.label_incoterm')}
                        <GabiFieldIcon campo="incoterm" label="Incoterm" gabiEndpoint="/api/v1/pedidos/gabi/ajuda-campo" />
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
                      <label className="drawer-pedido__label">{t('pedido.drawer.label_moeda')}</label>
                      <button
                        type="button"
                        className="drawer-pedido__select"
                        style={{ textAlign: 'left', cursor: 'pointer' }}
                        onClick={() => setModalMoedaAberta(true)}
                      >
                        {form.moeda_pedido || t('pedido.drawer.selecionar_moeda')}
                      </button>
                      <ModalTabelaMoeda
                        aberto={modalMoedaAberta}
                        aoFechar={() => setModalMoedaAberta(false)}
                        aoSelecionar={(sigla) => handleChange('moeda_pedido', sigla)}
                        moedaSelecionada={form.moeda_pedido}
                      />
                    </div>
                    <div className="drawer-pedido__campo">
                      <label className="drawer-pedido__label" htmlFor="dp-pagamento" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        {t('pedido.drawer.label_cond_pgto')}
                        <GabiFieldIcon campo="condicao_pagamento" label="Condição de Pagamento" gabiEndpoint="/api/v1/pedidos/gabi/ajuda-campo" />
                      </label>
                      <input
                        id="dp-pagamento"
                        className="drawer-pedido__input"
                        value={form.condicao_pagamento}
                        onChange={e => handleChange('condicao_pagamento', e.target.value)}
                        placeholder={t('pedido.drawer.ph_cond_pgto')}
                      />
                    </div>
                    <div className="drawer-pedido__campo">
                      <label className="drawer-pedido__label" htmlFor="dp-proforma">{t('pedido.drawer.label_num_proforma')}</label>
                      <input
                        id="dp-proforma"
                        className="drawer-pedido__input"
                        value={form.numero_proforma}
                        onChange={e => handleChange('numero_proforma', e.target.value)}
                      />
                    </div>
                    <div className="drawer-pedido__campo">
                      <label className="drawer-pedido__label" htmlFor="dp-invoice">{t('pedido.drawer.label_num_invoice')}</label>
                      <input
                        id="dp-invoice"
                        className="drawer-pedido__input"
                        value={form.numero_invoice}
                        onChange={e => handleChange('numero_invoice', e.target.value)}
                      />
                    </div>
                    <div className="drawer-pedido__campo">
                      <label className="drawer-pedido__label" htmlFor="dp-ref-imp">{t('pedido.drawer.label_ref_importador')}</label>
                      <input
                        id="dp-ref-imp"
                        className="drawer-pedido__input"
                        value={form.referencia_importador}
                        onChange={e => handleChange('referencia_importador', e.target.value)}
                      />
                    </div>
                    <div className="drawer-pedido__campo">
                      <label className="drawer-pedido__label" htmlFor="dp-ref-exp">{t('pedido.drawer.label_ref_exportador')}</label>
                      <input
                        id="dp-ref-exp"
                        className="drawer-pedido__input"
                        value={form.referencia_exportador}
                        onChange={e => handleChange('referencia_exportador', e.target.value)}
                      />
                    </div>
                    <div className="drawer-pedido__campo">
                      <label className="drawer-pedido__label" htmlFor="dp-ref-fab">{t('pedido.drawer.label_ref_fabricante')}</label>
                      <input
                        id="dp-ref-fab"
                        className="drawer-pedido__input"
                        value={form.referencia_fabricante}
                        onChange={e => handleChange('referencia_fabricante', e.target.value)}
                      />
                    </div>
                    <div className="drawer-pedido__campo">
                      <label className="drawer-pedido__label" htmlFor="dp-data-emissao">{t('pedido.drawer.label_data_emissao')}</label>
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
                      {t('pedido.drawer.secao_itens', { count: itens.length })}
                    </p>
                    <BotaoGlobal
                      variante="secundario"
                      tamanho="pequeno"
                      icone={<Plus size={12} weight="bold" />}
                      onClick={adicionarItem}
                    >
                      {t('pedido.drawer.adicionar_item')}
                    </BotaoGlobal>
                  </div>

                  {itens.map((item, index) => (
                    <div key={item.key} className="drawer-pedido__item">
                      <div className="drawer-pedido__campo">
                        <label className="drawer-pedido__label" htmlFor={`dp-pn-${index}`} style={{ fontSize: '0.625rem' }}>{t('pedido.campos.part_number')}</label>
                        <input
                          id={`dp-pn-${index}`}
                          className="drawer-pedido__input"
                          value={item.part_number}
                          onChange={e => handleItemChange(index, 'part_number', e.target.value)}
                          placeholder={t('pedido.drawer.ph_sku')}
                          aria-label={t('pedido.campos.part_number')}
                        />
                      </div>
                      <div className="drawer-pedido__campo">
                        <SelectNcmGlobal
                          label={t('pedido.campos.ncm')}
                          value={item.ncm}
                          onChange={(codigo) => handleItemChange(index, 'ncm', codigo)}
                        />
                      </div>
                      <div className="drawer-pedido__campo">
                        <label className="drawer-pedido__label" htmlFor={`dp-desc-${index}`} style={{ fontSize: '0.625rem' }}>{t('pedido.drawer.label_descricao')}</label>
                        <input
                          id={`dp-desc-${index}`}
                          className="drawer-pedido__input"
                          value={item.descricao_item}
                          onChange={e => handleItemChange(index, 'descricao_item', e.target.value)}
                          placeholder={t('pedido.drawer.ph_descricao_item')}
                          aria-label={t('pedido.drawer.label_descricao')}
                        />
                      </div>
                      <div className="drawer-pedido__campo">
                        <label className="drawer-pedido__label" htmlFor={`dp-qty-${index}`} style={{ fontSize: '0.625rem' }}>{t('pedido.drawer.label_qtd')}</label>
                        <input
                          id={`dp-qty-${index}`}
                          type="number"
                          className="drawer-pedido__input"
                          style={{ textAlign: 'right' }}
                          value={item.quantidade_inicial_pedido}
                          onChange={e => handleItemChange(index, 'quantidade_inicial_pedido', e.target.value)}
                          placeholder="0"
                          min="0"
                          step="0.01"
                          aria-label={t('pedido.drawer.label_qtd')}
                        />
                      </div>
                      <div className="drawer-pedido__campo">
                        <label className="drawer-pedido__label" htmlFor={`dp-uom-${index}`} style={{ fontSize: '0.625rem' }}>{t('pedido.drawer.label_uom')}</label>
                        <select
                          id={`dp-uom-${index}`}
                          className="drawer-pedido__select"
                          value={item.unidade_comercializada_item}
                          onChange={e => handleItemChange(index, 'unidade_comercializada_item', e.target.value)}
                          aria-label={t('pedido.drawer.label_uom')}
                        >
                          {['UN','MT','M2','KG','LT','TON','CM3','PC'].map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </div>
                      <div className="drawer-pedido__campo">
                        <label className="drawer-pedido__label" htmlFor={`dp-vl-${index}`} style={{ fontSize: '0.625rem' }}>{t('pedido.drawer.label_vl_unit')}</label>
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
                          aria-label={t('pedido.drawer.label_vl_unit')}
                        />
                      </div>
                      <button
                        className="drawer-pedido__item-remover"
                        onClick={() => removerItem(index)}
                        disabled={itens.length <= 1}
                        title={t('pedido.drawer.remover_item_hint')}
                        aria-label={t('pedido.drawer.remover_item_aria', { n: index + 1 })}
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
                      <span>{t('pedido.drawer.carregando_transfer')}</span>
                    </div>
                  ) : erroTransfer ? (
                    <div className="drawer-pedido__erro" role="alert">
                      <Warning size={14} weight="fill" aria-hidden="true" />
                      {erroTransfer}
                    </div>
                  ) : transferencias.length === 0 ? (
                    <div className="drawer-pedido__transferencias-vazio">
                      <ArrowsLeftRight size={28} weight="duotone" aria-hidden="true" />
                      <span>{t('pedido.drawer.sem_transferencias')}</span>
                    </div>
                  ) : (
                    <ol className="drawer-pedido__timeline" aria-label={t('pedido.drawer.transfer_historico')}>
                      {transferencias.map(tr => (
                        <li key={tr.id} className="drawer-pedido__timeline-item">
                          <div className="drawer-pedido__timeline-dot" aria-hidden="true" />
                          <div className="drawer-pedido__timeline-conteudo">
                            <div className="drawer-pedido__timeline-cabecalho">
                              <time
                                className="drawer-pedido__timeline-data"
                                dateTime={tr.created_at}
                              >
                                {new Date(tr.created_at).toLocaleString(i18n.language, {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </time>
                              {tr.revertido && (
                                <span className="drawer-pedido__badge-revertido" aria-label={t('pedido.drawer.badge_revertido')}>
                                  {t('pedido.drawer.badge_revertido')}
                                </span>
                              )}
                            </div>
                            <p className="drawer-pedido__timeline-usuario">
                              {t('pedido.drawer.transfer_por')} <strong>{tr.created_by}</strong>
                            </p>
                            <p className="drawer-pedido__timeline-qtd">
                              {t('pedido.drawer.transfer_qtd')} <strong>{tr.quantidade_item_transferida}</strong>
                            </p>
                            <p className="drawer-pedido__timeline-cenario">
                              {t('pedido.drawer.transfer_cenario')} <span className="drawer-pedido__timeline-cenario-tag">{tr.cenario}</span>
                            </p>
                            {tr.destinos.length > 0 && (
                              <ul className="drawer-pedido__timeline-destinos" aria-label={t('pedido.drawer.transfer_historico')}>
                                {tr.destinos.map((d, di) => (
                                  <li key={di} className="drawer-pedido__timeline-destino">
                                    <span className="drawer-pedido__timeline-destino-tipo">{d.tipo}</span>
                                    {d.pedido_id && (
                                      <span className="drawer-pedido__timeline-destino-id">
                                        {t('pedido.drawer.transfer_destino_pedido', { id: d.pedido_id })}
                                      </span>
                                    )}
                                    <span className="drawer-pedido__timeline-destino-qtd">
                                      {t('pedido.drawer.transfer_destino_qtd', { qtd: d.quantidade })}
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
              {t('pedido.drawer.cancelar')}
            </BotaoGlobal>
            <BotaoGlobal
              variante="primario"
              tamanho="medio"
              icone={<FloppyDisk size={16} />}
              onClick={handleSalvar}
              disabled={carregando || salvando}
              aria-busy={salvando}
            >
              {salvando ? t('pedido.drawer.salvando') : modoEdicao ? t('pedido.drawer.salvar_alteracoes') : t('pedido.drawer.criar_pedido')}
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
              {t('pedido.drawer.fechar')}
            </BotaoGlobal>
          </div>
        )}
      </div>
      <ModalGlobal
        aberto={confirmarFecharSemSalvar}
        aoFechar={() => setConfirmarFecharSemSalvar(false)}
        titulo={t('pedido.drawer.confirm_titulo')}
        tamanho="sm"
        botoes={[
          { rotulo: t('pedido.drawer.confirm_continuar'), variante: 'secondary', ao_clicar: () => setConfirmarFecharSemSalvar(false) },
          { rotulo: t('pedido.drawer.confirm_fechar'), variante: 'danger', ao_clicar: handleFecharConfirmado },
        ]}
      >
        <p style={{ margin: 0, color: 'var(--text-secondary, #94a3b8)', fontSize: '0.875rem' }}>
          {t('pedido.drawer.confirm_msg')}
        </p>
      </ModalGlobal>
    </div>
  )
}
