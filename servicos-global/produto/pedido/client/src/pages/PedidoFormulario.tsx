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
import { usePermissoesPedido } from '../shared/permissoes/usePermissoesPedido'
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
import { SelectGlobal } from '@nucleo/campo-select-global'
import { ModalTabelaMoedaGlobal } from '@nucleo/modal-tabela-moeda'
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

export default function PedidoFormulario() {
  const { t } = useTranslation()
  const { id_pedido } = useParams<{ id_pedido: string }>()
  const navigate = useNavigate()
  const modoEdicao = Boolean(id_pedido)
  // Gating `pedido:lista:editar` (decisao dono + Líder + Coordenador 2026-05-13).
  // `podeEditar` é ESTRITO durante load — botão Salvar fica disabled até dados
  // confirmados. Evita flash de affordance que dispararia 403. Backend POST/PUT
  // /pedidos retornam 403 em caso real.
  const { podeEditar } = usePermissoesPedido()
  const podeEditarLista = podeEditar('lista')

  const [form, setForm] = useState<PedidoForm>(FORM_VAZIO)
  const [itens, setItens] = useState<ItemForm[]>([ITEM_VAZIO()])
  const [salvando, setSalvando] = useState(false)
  const [modalMoedaAberta, setModalMoedaAberta] = useState(false)

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
    if (!modoEdicao || !id_pedido) return
    pedidoApi.buscarPorId(id_pedido)
      .then(pedido => {
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
      .catch(() => { /* dev: ignorar erro de backend */ })
  }, [modoEdicao, id_pedido])

  async function handleSalvar() {
    setSalvando(true)
    try {
      const itensMapped = itens.map(item => ({
        part_number: item.part_number,
        ncm: item.ncm,
        descricao_item: item.descricao_item,
        quantidade_inicial_pedido: parseFloat(item.quantidade_inicial_pedido) || 0,
        unidade_comercializada_item: item.unidade_comercializada_item,
        valor_por_unidade_item: item.valor_por_unidade_item ? parseFloat(item.valor_por_unidade_item) : undefined,
      }))
      const payload = {
        ...form,
        data_emissao_pedido: form.data_emissao_pedido,
        itens: itensMapped as PedidoItem[],
      }
      if (modoEdicao) {
        await pedidoApi.atualizar(id_pedido!, payload)
      } else {
        await pedidoApi.criar(payload)
      }
      navigate('/pedidos')
    } catch (err) {
      console.error('[PedidoFormulario] Erro ao salvar:', err)
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
          subtitulo={modoEdicao ? t('pedido.editando', `Editando pedido ${id_pedido}`, { id: id_pedido }) : t('pedido.criar_subtitulo', 'Criar novo pedido de compra/venda')}
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
            disabled={salvando || !podeEditarLista}
            title={podeEditarLista ? undefined : t('pedido.formulario.sem_permissao_salvar')}
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
            <SelectGlobal
              label={t('pedido.formulario.label_tipo_operacao')}
              obrigatorio
              buscavel={false}
              opcoes={[
                { valor: 'importacao', rotulo: t('pedido.formulario.opt_importacao') },
                { valor: 'exportacao', rotulo: t('pedido.formulario.opt_exportacao') },
              ]}
              valor={form.tipo_operacao}
              aoMudarValor={v => v != null && handleChange('tipo_operacao', String(v))}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('pedido.formulario.label_numero_pedido')}</label>
            <input
              style={inputStyle}
              value={form.numero_pedido}
              onChange={(e) => handleChange('numero_pedido', e.target.value)}
              placeholder={t('pedido.formulario.ph_numero_pedido')}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('pedido.formulario.label_exportador')}</label>
            <input
              style={inputStyle}
              value={form.importacao_exportador_id}
              onChange={(e) => handleChange('importacao_exportador_id', e.target.value)}
              placeholder={t('pedido.formulario.ph_exportador')}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('pedido.formulario.label_fabricante')}</label>
            <input
              style={inputStyle}
              value={form.fabricante_id}
              onChange={(e) => handleChange('fabricante_id', e.target.value)}
              placeholder={t('pedido.formulario.ph_fabricante')}
            />
          </div>
          <div>
            <SelectGlobal
              label={t('pedido.formulario.label_incoterm')}
              buscavel={false}
              opcoes={[
                { valor: 'FOB', rotulo: 'FOB' },
                { valor: 'CIF', rotulo: 'CIF' },
                { valor: 'EXW', rotulo: 'EXW' },
                { valor: 'CFR', rotulo: 'CFR' },
                { valor: 'DDP', rotulo: 'DDP' },
                { valor: 'DAP', rotulo: 'DAP' },
                { valor: 'FCA', rotulo: 'FCA' },
                { valor: 'CPT', rotulo: 'CPT' },
                { valor: 'CIP', rotulo: 'CIP' },
                { valor: 'DPU', rotulo: 'DPU' },
                { valor: 'FAS', rotulo: 'FAS' },
              ]}
              valor={form.incoterm}
              aoMudarValor={v => v != null && handleChange('incoterm', String(v))}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('pedido.formulario.label_moeda')}</label>
            <button
              type="button"
              style={{ ...inputStyle, textAlign: 'left', cursor: 'pointer' }}
              onClick={() => setModalMoedaAberta(true)}
            >
              {form.moeda_pedido || t('pedido.formulario.selecionar_moeda')}
            </button>
            <ModalTabelaMoedaGlobal
              aberto={modalMoedaAberta}
              aoFechar={() => setModalMoedaAberta(false)}
              aoSelecionar={(sigla) => handleChange('moeda_pedido', sigla)}
              moedaSelecionada={form.moeda_pedido}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('pedido.formulario.label_condicao_pagamento')}</label>
            <input
              style={inputStyle}
              value={form.condicao_pagamento}
              onChange={(e) => handleChange('condicao_pagamento', e.target.value)}
              placeholder={t('pedido.formulario.ph_condicao_pagamento')}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('pedido.formulario.label_numero_proforma')}</label>
            <input
              style={inputStyle}
              value={form.numero_proforma}
              onChange={(e) => handleChange('numero_proforma', e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('pedido.formulario.label_numero_invoice')}</label>
            <input
              style={inputStyle}
              value={form.numero_invoice}
              onChange={(e) => handleChange('numero_invoice', e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('pedido.formulario.label_ref_importador')}</label>
            <input
              style={inputStyle}
              value={form.referencia_importador}
              onChange={(e) => handleChange('referencia_importador', e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('pedido.formulario.label_ref_exportador')}</label>
            <input
              style={inputStyle}
              value={form.referencia_exportador}
              onChange={(e) => handleChange('referencia_exportador', e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('pedido.formulario.label_ref_fabricante')}</label>
            <input
              style={inputStyle}
              value={form.referencia_fabricante}
              onChange={(e) => handleChange('referencia_fabricante', e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>{t('pedido.formulario.label_data_emissao')}</label>
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
                <label style={{ ...labelStyle, fontSize: '0.6875rem' }}>{t('pedido.formulario.label_part_number')}</label>
                <input
                  style={inputStyle}
                  value={item.part_number}
                  onChange={(e) => handleItemChange(index, 'part_number', e.target.value)}
                  placeholder={t('pedido.formulario.ph_part_number')}
                />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '0.6875rem' }}>{t('pedido.formulario.label_ncm')}</label>
                <input
                  style={{ ...inputStyle, fontFamily: 'var(--font-mono, monospace)' }}
                  value={item.ncm}
                  onChange={(e) => handleItemChange(index, 'ncm', e.target.value)}
                  placeholder="0000.00.00"
                />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '0.6875rem' }}>{t('pedido.formulario.label_descricao')}</label>
                <input
                  style={inputStyle}
                  value={item.descricao_item}
                  onChange={(e) => handleItemChange(index, 'descricao_item', e.target.value)}
                  placeholder={t('pedido.formulario.ph_descricao')}
                />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '0.6875rem' }}>{t('pedido.formulario.label_quantidade')}</label>
                <input
                  type="number"
                  style={{ ...inputStyle, textAlign: 'right' }}
                  value={item.quantidade_inicial_pedido}
                  onChange={(e) => handleItemChange(index, 'quantidade_inicial_pedido', e.target.value)}
                  placeholder="0,00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <SelectGlobal
                  label="UoM"
                  buscavel={false}
                  tamanho="compacto"
                  opcoes={[
                    { valor: 'UN', rotulo: 'UN' },
                    { valor: 'MT', rotulo: 'MT' },
                    { valor: 'M2', rotulo: 'M2' },
                    { valor: 'KG', rotulo: 'KG' },
                    { valor: 'LT', rotulo: 'LT' },
                    { valor: 'TON', rotulo: 'TON' },
                    { valor: 'CM3', rotulo: 'CM3' },
                    { valor: 'PC', rotulo: 'PC' },
                  ]}
                  valor={item.unidade_comercializada_item}
                  aoMudarValor={v => v != null && handleItemChange(index, 'unidade_comercializada_item', String(v))}
                />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '0.6875rem' }}>{t('pedido.formulario.label_valor_item')}</label>
                <input
                  type="number"
                  style={{ ...inputStyle, textAlign: 'right' }}
                  value={item.valor_por_unidade_item}
                  onChange={(e) => handleItemChange(index, 'valor_por_unidade_item', e.target.value)}
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
                  title={t('pedido.formulario.remover_item')}
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
