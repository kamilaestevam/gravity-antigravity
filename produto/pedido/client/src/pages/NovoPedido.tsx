/**
 * NovoPedido.tsx — Formulario de criacao/edicao de Pedido
 *
 * Campos do header: tipo_operacao, numero_pedido, exportador, fabricante,
 * incoterm, moeda, cobertura cambial, condicao pagamento, proforma, invoice
 *
 * Secao de itens: part_number, NCM, descricao, quantidade, unidade, valor unitario
 *
 * Modo edicao: recebe id via useParams, carrega pedido existente
 */

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Package,
  FloppyDisk,
  ArrowLeft,
  Plus,
  Trash,
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import type { TipoOperacao, PedidoItem } from '../shared/types'
import { pedidoApi } from '../shared/api'

// ── Tipos locais do formulario ────────────────────────────────────────────────

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
  descricao: string
  quantidade_inicial_item_pedido: string
  unidade_comercializada_item: string
  valor_unitario: string
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
  descricao: '',
  quantidade_inicial_item_pedido: '',
  unidade_comercializada_item: 'UN',
  valor_unitario: '',
})

// ── Estilos ───────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  background: 'var(--bg-surface, #1e1e2e)',
  border: '1px solid var(--border-subtle, #333)',
  borderRadius: '0.375rem',
  color: 'var(--text-primary, #e2e8f0)',
  fontSize: '0.875rem',
  fontFamily: 'var(--font-sans, Plus Jakarta Sans, sans-serif)',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '0.25rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--text-secondary, #94a3b8)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: '1rem',
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function NovoPedido() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const modoEdicao = Boolean(id)

  const [form, setForm] = useState<PedidoForm>(FORM_VAZIO)
  const [itens, setItens] = useState<ItemForm[]>([ITEM_VAZIO()])
  const [salvando, setSalvando] = useState(false)

  function handleChange(campo: keyof PedidoForm, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function handleItemChange(index: number, campo: keyof ItemForm, valor: string) {
    setItens((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [campo]: valor } : item))
    )
  }

  function adicionarItem() {
    setItens((prev) => [...prev, ITEM_VAZIO()])
  }

  function removerItem(index: number) {
    if (itens.length <= 1) return
    setItens((prev) => prev.filter((_, i) => i !== index))
  }

  useEffect(() => {
    if (!modoEdicao || !id) return
    pedidoApi.buscarPorId(id)
      .then(pedido => {
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
            descricao: item.descricao,
            quantidade_inicial_item_pedido: String(item.quantidade_inicial_item_pedido),
            unidade_comercializada_item: item.unidade_comercializada_item ?? 'UN',
            valor_unitario: item.valor_unitario != null ? String(item.valor_unitario) : '',
          })))
        }
      })
      .catch(() => { /* dev: ignorar erro de backend */ })
  }, [modoEdicao, id])

  async function handleSalvar() {
    setSalvando(true)
    try {
      const itensMapped = itens.map(item => ({
        part_number: item.part_number,
        ncm: item.ncm,
        descricao: item.descricao,
        quantidade_inicial_item_pedido: parseFloat(item.quantidade_inicial_item_pedido) || 0,
        unidade_comercializada_item: item.unidade_comercializada_item,
        valor_unitario: item.valor_unitario ? parseFloat(item.valor_unitario) : undefined,
      }))
      const payload = {
        ...form,
        data_emissao_pedido: form.data_emissao_pedido,
        itens: itensMapped as PedidoItem[],
      }
      if (modoEdicao) {
        await pedidoApi.atualizar(id!, payload)
      } else {
        await pedidoApi.criar(payload)
      }
      navigate('/pedidos')
    } catch (err) {
      console.error('[NovoPedido] Erro ao salvar:', err)
      if (import.meta.env.DEV) navigate(-1)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="formulario"
      cabecalho={
        <CabecalhoGlobal
          icone={<Package weight="duotone" size={22} />}
          titulo={modoEdicao ? t('pedido.editar', 'Editar Pedido') : t('pedido.novo_pedido')}
          subtitulo={modoEdicao ? t('pedido.editando', `Editando pedido ${id}`, { id }) : t('pedido.criar_subtitulo', 'Criar novo pedido de compra/venda')}
        />
      }
      acoes={
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <BotaoGlobal
            variante="secundario"
            icone={<ArrowLeft size={16} />}
            onClick={() => navigate('/pedidos')}
          >
            {t('comum.voltar', 'Voltar')}
          </BotaoGlobal>
          <BotaoGlobal
            variante="primario"
            icone={<FloppyDisk size={16} />}
            onClick={handleSalvar}
            disabled={salvando}
          >
            {salvando ? t('comum.salvando', 'Salvando...') : t('comum.salvar', 'Salvar')}
          </BotaoGlobal>
        </div>
      }
    >
      {/* ── Header do Pedido ──────────────────────────────────────────── */}
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--text-secondary, #94a3b8)',
          marginBottom: '1rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {t('pedido.dados_pedido', 'Dados do Pedido')}
        </h3>

        <div style={gridStyle}>
          <div>
            <label style={labelStyle}>Tipo Operacao *</label>
            <select
              style={inputStyle}
              value={form.tipo_operacao}
              onChange={(e) => handleChange('tipo_operacao', e.target.value)}
            >
              <option value="importacao">Importacao</option>
              <option value="exportacao">Exportacao</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Numero Pedido *</label>
            <input
              style={inputStyle}
              value={form.numero_pedido}
              onChange={(e) => handleChange('numero_pedido', e.target.value)}
              placeholder="Ex: PO-2026/001"
            />
          </div>
          <div>
            <label style={labelStyle}>Exportador</label>
            <input
              style={inputStyle}
              value={form.importacao_exportador_id}
              onChange={(e) => handleChange('importacao_exportador_id', e.target.value)}
              placeholder="Selecionar exportador"
            />
          </div>
          <div>
            <label style={labelStyle}>Fabricante</label>
            <input
              style={inputStyle}
              value={form.fabricante_id}
              onChange={(e) => handleChange('fabricante_id', e.target.value)}
              placeholder="Selecionar fabricante"
            />
          </div>
          <div>
            <label style={labelStyle}>Incoterm</label>
            <select
              style={inputStyle}
              value={form.incoterm}
              onChange={(e) => handleChange('incoterm', e.target.value)}
            >
              <option value="FOB">FOB</option>
              <option value="CIF">CIF</option>
              <option value="EXW">EXW</option>
              <option value="CFR">CFR</option>
              <option value="DDP">DDP</option>
              <option value="DAP">DAP</option>
              <option value="FCA">FCA</option>
              <option value="CPT">CPT</option>
              <option value="CIP">CIP</option>
              <option value="DPU">DPU</option>
              <option value="FAS">FAS</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Moeda</label>
            <select
              style={inputStyle}
              value={form.moeda_pedido}
              onChange={(e) => handleChange('moeda_pedido', e.target.value)}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="BRL">BRL</option>
              <option value="CNY">CNY</option>
              <option value="JPY">JPY</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Cobertura Cambial</label>
            <select
              style={inputStyle}
              value={form.cobertura_cambial}
              onChange={(e) => handleChange('cobertura_cambial', e.target.value)}
            >
              <option value="com_cobertura">Com Cobertura</option>
              <option value="sem_cobertura">Sem Cobertura</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Condicao Pagamento</label>
            <input
              style={inputStyle}
              value={form.condicao_pagamento}
              onChange={(e) => handleChange('condicao_pagamento', e.target.value)}
              placeholder="Ex: 30% Antecipado"
            />
          </div>
          <div>
            <label style={labelStyle}>Numero Proforma</label>
            <input
              style={inputStyle}
              value={form.numero_proforma}
              onChange={(e) => handleChange('numero_proforma', e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Numero Invoice</label>
            <input
              style={inputStyle}
              value={form.numero_invoice}
              onChange={(e) => handleChange('numero_invoice', e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Ref. Importador</label>
            <input
              style={inputStyle}
              value={form.referencia_importador}
              onChange={(e) => handleChange('referencia_importador', e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Ref. Exportador</label>
            <input
              style={inputStyle}
              value={form.referencia_exportador}
              onChange={(e) => handleChange('referencia_exportador', e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Ref. Fabricante</label>
            <input
              style={inputStyle}
              value={form.referencia_fabricante}
              onChange={(e) => handleChange('referencia_fabricante', e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Data Emissao</label>
            <input
              type="date"
              style={inputStyle}
              value={form.data_emissao_pedido}
              onChange={(e) => handleChange('data_emissao_pedido', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* ── Itens ─────────────────────────────────────────────────────── */}
      <section>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}>
          <h3 style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--text-secondary, #94a3b8)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {t('pedido.itens_pedido', 'Itens do Pedido')} ({itens.length})
          </h3>
          <BotaoGlobal
            variante="secundario"
            icone={<Plus size={14} />}
            onClick={adicionarItem}
          >
            {t('pedido.adicionar_item', 'Adicionar Item')}
          </BotaoGlobal>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {itens.map((item, index) => (
            <div
              key={item.key}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 120px 1fr 120px 80px 120px 40px',
                gap: '0.5rem',
                alignItems: 'end',
                padding: '0.75rem',
                background: 'var(--bg-surface, #1e1e2e)',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-subtle, #333)',
              }}
            >
              <div>
                <label style={{ ...labelStyle, fontSize: '0.6875rem' }}>Part Number *</label>
                <input
                  style={inputStyle}
                  value={item.part_number}
                  onChange={(e) => handleItemChange(index, 'part_number', e.target.value)}
                  placeholder="SKU"
                />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '0.6875rem' }}>NCM *</label>
                <input
                  style={{ ...inputStyle, fontFamily: 'var(--font-mono, monospace)' }}
                  value={item.ncm}
                  onChange={(e) => handleItemChange(index, 'ncm', e.target.value)}
                  placeholder="0000.00.00"
                />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '0.6875rem' }}>Descricao *</label>
                <input
                  style={inputStyle}
                  value={item.descricao}
                  onChange={(e) => handleItemChange(index, 'descricao', e.target.value)}
                  placeholder="Descricao do item"
                />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '0.6875rem' }}>Quantidade *</label>
                <input
                  type="number"
                  style={{ ...inputStyle, textAlign: 'right' }}
                  value={item.quantidade_inicial_item_pedido}
                  onChange={(e) => handleItemChange(index, 'quantidade_inicial_item_pedido', e.target.value)}
                  placeholder="0,00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '0.6875rem' }}>UoM</label>
                <select
                  style={inputStyle}
                  value={item.unidade_comercializada_item}
                  onChange={(e) => handleItemChange(index, 'unidade_comercializada_item', e.target.value)}
                >
                  <option value="UN">UN</option>
                  <option value="MT">MT</option>
                  <option value="M2">M2</option>
                  <option value="KG">KG</option>
                  <option value="LT">LT</option>
                  <option value="TON">TON</option>
                  <option value="CM3">CM3</option>
                  <option value="PC">PC</option>
                </select>
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '0.6875rem' }}>Valor Unit.</label>
                <input
                  type="number"
                  style={{ ...inputStyle, textAlign: 'right' }}
                  value={item.valor_unitario}
                  onChange={(e) => handleItemChange(index, 'valor_unitario', e.target.value)}
                  placeholder="0,00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <button
                  onClick={() => removerItem(index)}
                  disabled={itens.length <= 1}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: itens.length <= 1 ? 'not-allowed' : 'pointer',
                    color: itens.length <= 1 ? 'var(--text-muted)' : 'var(--color-error, #ef4444)',
                    opacity: itens.length <= 1 ? 0.3 : 0.7,
                    padding: '0.25rem',
                    borderRadius: '0.25rem',
                    transition: 'opacity 0.15s',
                  }}
                  title="Remover item"
                >
                  <Trash size={16} weight="duotone" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PaginaGlobal>
  )
}
