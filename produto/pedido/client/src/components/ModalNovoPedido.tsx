/**
 * ModalNovoPedido.tsx — Wizard de criação de pedido (2 passos)
 *
 * Passo 1 — Dados do Pedido: tipo, número, exportador, incoterm, moeda, etc.
 * Passo 2 — Itens: lista de itens com part_number, NCM, qtd, valor
 *
 * Usa ModalPassoPassoGlobal (nucleo-global) — padrão Gravity.
 * Edição de pedido existente usa o DrawerPedido (aba Dados / Itens / Transferências).
 */

import React, { useState, useCallback } from 'react'
import { Package, Tag, Plus, Trash, Warning } from '@phosphor-icons/react'
import { ModalPassoPassoGlobal, type PassoConfig } from '@nucleo/modal-passo-passo-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { useShellStore } from '@gravity/shell'
import type { TipoOperacao, PedidoItem, Pedido } from '../shared/types'
import { pedidoApi } from '../shared/api'

// ── Passos ─────────────────────────────────────────────────────────────────────

const PASSOS: PassoConfig[] = [
  { id: 1, label: 'Dados do Pedido', icone: <Package size={14} weight="duotone" /> },
  { id: 2, label: 'Itens',           icone: <Tag size={14} weight="duotone" /> },
]

// ── Tipos de formulário ────────────────────────────────────────────────────────

interface PedidoForm {
  tipo_operacao: TipoOperacao
  numero_pedido: string
  importacao_exportador_id: string
  fabricante_id: string
  incoterm: string
  condicao_pagamento_pedido: string
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
}

const FORM_VAZIO: PedidoForm = {
  tipo_operacao: 'importacao',
  numero_pedido: '',
  importacao_exportador_id: '',
  fabricante_id: '',
  incoterm: 'FOB',
  condicao_pagamento_pedido: '',
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
})

// ── Opções de select ───────────────────────────────────────────────────────────

const OPCOES_TIPO_OPERACAO = [
  { valor: 'importacao', rotulo: 'Importação' },
  { valor: 'exportacao', rotulo: 'Exportação' },
]

const OPCOES_INCOTERM = ['FOB','CIF','EXW','CFR','DDP','DAP','FCA','CPT','CIP','DPU','FAS']
  .map(v => ({ valor: v, rotulo: v }))

const OPCOES_COBERTURA = [
  { valor: 'com_cobertura', rotulo: 'Com Cobertura' },
  { valor: 'sem_cobertura', rotulo: 'Sem Cobertura' },
]

// ── Validação frontend ─────────────────────────────────────────────────────────

interface ErrosValidacao {
  geral?: string
  numero_pedido?: string
}

function validarPasso1(form: PedidoForm): ErrosValidacao {
  const erros: ErrosValidacao = {}
  if (!form.numero_pedido.trim()) {
    erros.numero_pedido = 'Número do pedido é obrigatório'
  }
  if (form.data_emissao_pedido) {
    const d = new Date(`${form.data_emissao_pedido}T00:00:00.000Z`)
    if (isNaN(d.getTime())) {
      erros.geral = 'Data de emissão inválida — use o formato DD/MM/AAAA ou selecione pelo calendário.'
    }
  }
  return erros
}

function validarPasso2(_itens: ItemForm[]): ErrosValidacao {
  // Nenhum campo de item é obrigatório no frontend.
  // O backend valida o que for necessário e retorna mensagens de erro claras.
  return {}
}

// ── Tradução de erros da API ───────────────────────────────────────────────────

function traduzirErroApi(err: unknown): string {
  // Erros de rede (sem conexão)
  if (err instanceof TypeError && (err.message.includes('fetch') || err.message.includes('Failed to fetch') || err.message.includes('network'))) {
    return 'Sem conexão com o servidor. Verifique sua internet e tente novamente.'
  }

  if (!(err instanceof Error)) return 'Erro inesperado. Verifique o console e tente novamente.'

  const msg = err.message

  // Mensagem literal do servidor — mostrar diretamente (já é legível)
  if (msg && !msg.startsWith('HTTP ')) {
    if (msg.toLowerCase().includes('dados invalidos') || msg.toLowerCase().includes('dados inválidos')) {
      return 'Dados inválidos. Verifique o campo obrigatório: Número do Pedido.'
    }
    return msg
  }

  // Códigos HTTP sem mensagem do servidor
  if (msg === 'HTTP 400') return 'Requisição inválida (400) — verifique os dados e tente novamente.'
  if (msg === 'HTTP 401') return 'Sessão expirada (401) — recarregue a página e faça login novamente.'
  if (msg === 'HTTP 403') return 'Sem permissão (403) — você não pode criar pedidos neste workspace.'
  if (msg === 'HTTP 404') return 'Rota não encontrada (404) — o servidor pode estar desatualizado. Tente reiniciá-lo.'
  if (msg === 'HTTP 409') return 'Conflito (409) — já existe um pedido com esse número.'
  if (msg === 'HTTP 422') return 'Dados inválidos (422) — verifique o Número do Pedido e tente novamente.'
  if (msg === 'HTTP 500') return 'Erro interno do servidor (500) — tente novamente em alguns instantes.'
  if (msg === 'HTTP 502') return 'Gateway indisponível (502) — o servidor pode estar reiniciando.'
  if (msg === 'HTTP 503') return 'Serviço indisponível (503) — tente novamente em alguns instantes.'

  // Qualquer outro código HTTP
  const match = msg.match(/^HTTP (\d+)$/)
  if (match) return `Erro do servidor (${match[1]}) — tente novamente.`

  return `Erro inesperado: ${msg}`
}

// ── Props ──────────────────────────────────────────────────────────────────────

export interface ModalNovoPedidoProps {
  aberto: boolean
  onFechar: () => void
  onSalvo: (pedido: Pedido) => void
}

// ── Estilos inline ─────────────────────────────────────────────────────────────

const s = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  } as React.CSSProperties,
  gridFull: {
    gridColumn: '1 / -1',
  } as React.CSSProperties,
  campo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.375rem',
  } as React.CSSProperties,
  label: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  } as React.CSSProperties,
  input: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--bg-elevated)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    padding: '0.5rem 0.75rem',
    outline: 'none',
    transition: 'border-color 0.15s',
    width: '100%',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  secaoTitulo: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: '1rem',
  } as React.CSSProperties,
  erroGeral: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    fontSize: '0.8125rem',
    color: 'var(--danger, #ef4444)',
    marginTop: '0.75rem',
    padding: '0.625rem 0.875rem',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 'var(--radius-md)',
  } as React.CSSProperties,
  itensHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.875rem',
  } as React.CSSProperties,
  itemCard: {
    padding: '0.875rem',
    background: 'var(--bg-elevated)',
    borderRadius: 'var(--radius-md)',
    marginBottom: '0.625rem',
    border: '1px solid transparent',
  } as React.CSSProperties,
  itemGrid: {
    display: 'grid',
    gridTemplateColumns: '1.6fr 1fr 2fr 0.8fr auto',
    gap: '0.5rem',
    alignItems: 'flex-start',
  } as React.CSSProperties,
  btnRemover: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    padding: '0.375rem',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    marginTop: '1.25rem',
    transition: 'color 0.15s',
  } as React.CSSProperties,
  inputCompacto: {
    background: 'var(--bg-base)',
    border: '1px solid var(--bg-elevated)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: '0.8125rem',
    padding: '0.375rem 0.5rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  labelCompacto: {
    fontSize: '0.625rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    marginBottom: '0.25rem',
    display: 'block',
  } as React.CSSProperties,
  selectCompacto: {
    background: 'var(--bg-base)',
    border: '1px solid var(--bg-elevated)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: '0.8125rem',
    padding: '0.375rem 0.5rem',
    outline: 'none',
    width: '100%',
    cursor: 'pointer',
  } as React.CSSProperties,
}

// ── Componente principal ───────────────────────────────────────────────────────

export function ModalNovoPedido({ aberto, onFechar, onSalvo }: ModalNovoPedidoProps) {
  const [passo, setPasso]       = useState(1)
  const [form, setForm]         = useState<PedidoForm>(FORM_VAZIO)
  const [itens, setItens]       = useState<ItemForm[]>([ITEM_VAZIO()])
  const [salvando, setSalvando] = useState(false)
  const [erros, setErros]       = useState<ErrosValidacao>({})
  const { addNotification } = useShellStore()

  // Bloqueia fechar enquanto está salvando (evita pedido duplicado)
  const handleFechar = useCallback(() => {
    if (salvando) return
    setPasso(1)
    setForm(FORM_VAZIO)
    setItens([ITEM_VAZIO()])
    setErros({})
    onFechar()
  }, [onFechar, salvando])

  function set(campo: keyof PedidoForm, valor: string) {
    setForm(prev => ({ ...prev, [campo]: valor }))
    // Limpar erro do campo ao editar
    if (campo === 'numero_pedido' && erros.numero_pedido) {
      setErros(prev => ({ ...prev, numero_pedido: undefined }))
    }
  }

  function setItem(index: number, campo: keyof ItemForm, valor: string) {
    setItens(prev => prev.map((it, i) => i === index ? { ...it, [campo]: valor } : it))
  }

  function adicionarItem() {
    setItens(prev => [...prev, ITEM_VAZIO()])
  }

  function removerItem(index: number) {
    if (itens.length <= 1) return
    setItens(prev => prev.filter((_, i) => i !== index))
  }

  // Passo 1 → só exige número do pedido para avançar
  // Passo 2 → sem obrigatoriedade, sempre pode criar
  const podeAvancar = passo === 1
    ? form.numero_pedido.trim() !== ''
    : true

  async function handleProximo() {
    if (passo === 1) {
      // Validar passo 1 antes de avançar
      const errosPasso1 = validarPasso1(form)
      if (Object.keys(errosPasso1).length > 0) {
        setErros(errosPasso1)
        return
      }
      setErros({})
      setPasso(2)
      return
    }

    // Passo 2 → validar antes de salvar
    const errosPasso2 = validarPasso2(itens)
    if (Object.keys(errosPasso2).length > 0) {
      setErros(errosPasso2)
      return
    }

    setSalvando(true)
    setErros({})
    try {
      const itensMapped = itens
        .filter(it => it.part_number.trim() !== '' || it.descricao_item.trim() !== '' || it.ncm.trim() !== '' || it.quantidade_inicial_item_pedido.trim() !== '')
        .map(it => ({
          part_number: it.part_number,
          ncm: it.ncm,
          descricao_item: it.descricao_item,
          quantidade_inicial_item_pedido: parseFloat(it.quantidade_inicial_item_pedido) || 0,
        }))

      // Converter data para ISO 8601 completo (z.string().datetime() no backend)
      const dataISO = form.data_emissao_pedido
        ? new Date(`${form.data_emissao_pedido}T00:00:00.000Z`).toISOString()
        : undefined

      // Converter strings vazias para null nos campos opcionais
      const formLimpo = Object.fromEntries(
        Object.entries(form).map(([k, v]) =>
          k === 'tipo_operacao' || k === 'numero_pedido'
            ? [k, v]
            : [k, typeof v === 'string' && v.trim() === '' ? null : v]
        )
      )

      const payload = {
        ...formLimpo,
        data_emissao_pedido: dataISO,
        itens: itensMapped as PedidoItem[],
      }

      const resultado = await pedidoApi.criar(payload)
      addNotification({
        type: 'success',
        message: `Pedido ${resultado.numero_pedido} criado com sucesso.`,
      })
      onSalvo(resultado)
      handleFechar()
    } catch (err: unknown) {
      console.error('[ModalNovoPedido] erro ao criar pedido:', err)
      const msg = traduzirErroApi(err)
      setErros({ geral: msg })
      addNotification({ type: 'error', message: msg })
    } finally {
      setSalvando(false)
    }
  }

  function handleVoltar() {
    if (salvando) return
    if (passo > 1) { setPasso(p => p - 1); setErros({}) }
    else handleFechar()
  }

  return (
    <ModalPassoPassoGlobal
      titulo="Novo Pedido"
      aberto={aberto}
      passos={PASSOS}
      passoAtual={passo}
      onProximo={handleProximo}
      onVoltar={handleVoltar}
      onFechar={handleFechar}
      podeAvancar={podeAvancar && !salvando}
      labelBotaoFinal={salvando ? 'Criando...' : 'Criar Pedido'}
      tamanho="lg"
      altura="620px"
    >
      {passo === 1 && (
        <Passo1Dados form={form} erros={erros} onChange={set} />
      )}
      {passo === 2 && (
        <Passo2Itens
          itens={itens}
          erros={erros}
          onAdicionarItem={adicionarItem}
          onRemoverItem={removerItem}
          onChangeItem={setItem}
        />
      )}
    </ModalPassoPassoGlobal>
  )
}

// ── Passo 1 — Dados do Pedido ──────────────────────────────────────────────────

function Passo1Dados({
  form,
  erros,
  onChange,
}: {
  form: PedidoForm
  erros: ErrosValidacao
  onChange: (campo: keyof PedidoForm, valor: string) => void
}) {
  return (
    <div>
      <p style={s.secaoTitulo}>Dados do Pedido</p>
      <div style={s.grid}>
        <div style={s.campo}>
          <SelectGlobal
            label="Tipo Operação"
            opcoes={OPCOES_TIPO_OPERACAO}
            valor={form.tipo_operacao}
            aoMudarValor={v => onChange('tipo_operacao', String(v ?? 'importacao'))}
          />
        </div>
        <div style={s.campo}>
          <label style={s.label} htmlFor="mnp-numero-pedido">Número Pedido</label>
          <input
            id="mnp-numero-pedido"
            style={{
              ...s.input,
              ...(erros.numero_pedido ? { borderColor: 'var(--danger, #ef4444)' } : {}),
            }}
            value={form.numero_pedido}
            onChange={e => onChange('numero_pedido', e.target.value)}
            placeholder="Ex: PO-2026/001"
            aria-invalid={Boolean(erros.numero_pedido)}
          />
          {erros.numero_pedido && (
            <span
              style={{ fontSize: '0.6875rem', color: 'var(--danger, #ef4444)', marginTop: '0.125rem' }}
              role="alert"
            >
              {erros.numero_pedido}
            </span>
          )}
        </div>
        <div style={s.campo}>
          <label style={s.label} htmlFor="mnp-exportador">Exportador / Fornecedor</label>
          <input
            id="mnp-exportador"
            style={s.input}
            value={form.importacao_exportador_id}
            onChange={e => onChange('importacao_exportador_id', e.target.value)}
            placeholder="Nome ou código do exportador"
          />
        </div>
        <div style={s.campo}>
          <label style={s.label} htmlFor="mnp-fabricante">Fabricante</label>
          <input
            id="mnp-fabricante"
            style={s.input}
            value={form.fabricante_id}
            onChange={e => onChange('fabricante_id', e.target.value)}
            placeholder="Nome ou código do fabricante"
          />
        </div>
        <div style={s.campo}>
          <SelectGlobal
            label="Incoterm"
            opcoes={OPCOES_INCOTERM}
            valor={form.incoterm}
            aoMudarValor={v => onChange('incoterm', String(v ?? 'FOB'))}
          />
        </div>
        <div style={s.campo}>
          <label style={s.label} htmlFor="mnp-pagamento">Condição Pagamento</label>
          <input
            id="mnp-pagamento"
            style={s.input}
            value={form.condicao_pagamento_pedido}
            onChange={e => onChange('condicao_pagamento_pedido', e.target.value)}
            placeholder="Ex: 30% Antecipado"
          />
        </div>
        <div style={s.campo}>
          <label style={s.label} htmlFor="mnp-proforma">Número Proforma</label>
          <input
            id="mnp-proforma"
            style={s.input}
            value={form.numero_proforma}
            onChange={e => onChange('numero_proforma', e.target.value)}
          />
        </div>
        <div style={s.campo}>
          <label style={s.label} htmlFor="mnp-invoice">Número Invoice</label>
          <input
            id="mnp-invoice"
            style={s.input}
            value={form.numero_invoice}
            onChange={e => onChange('numero_invoice', e.target.value)}
          />
        </div>
        <div style={s.campo}>
          <label style={s.label} htmlFor="mnp-ref-imp">Ref. Importador</label>
          <input
            id="mnp-ref-imp"
            style={s.input}
            value={form.referencia_importador}
            onChange={e => onChange('referencia_importador', e.target.value)}
          />
        </div>
        <div style={s.campo}>
          <label style={s.label} htmlFor="mnp-ref-exp">Ref. Exportador</label>
          <input
            id="mnp-ref-exp"
            style={s.input}
            value={form.referencia_exportador}
            onChange={e => onChange('referencia_exportador', e.target.value)}
          />
        </div>
        <div style={s.campo}>
          <label style={s.label} htmlFor="mnp-ref-fab">Ref. Fabricante</label>
          <input
            id="mnp-ref-fab"
            style={s.input}
            value={form.referencia_fabricante}
            onChange={e => onChange('referencia_fabricante', e.target.value)}
          />
        </div>
        <div style={s.campo}>
          <label style={s.label} htmlFor="mnp-data-emissao">Data Emissão</label>
          <input
            id="mnp-data-emissao"
            type="date"
            style={s.input}
            value={form.data_emissao_pedido}
            onChange={e => onChange('data_emissao_pedido', e.target.value)}
          />
        </div>
      </div>

      {/* Erros do passo 1 (data inválida ou outros erros gerais) */}
      {erros.geral && (
        <div style={s.erroGeral} role="alert">
          <Warning size={15} weight="fill" style={{ flexShrink: 0, marginTop: '1px' }} />
          <span>{erros.geral}</span>
        </div>
      )}
    </div>
  )
}

// ── Passo 2 — Itens ────────────────────────────────────────────────────────────

function Passo2Itens({
  itens,
  erros,
  onAdicionarItem,
  onRemoverItem,
  onChangeItem,
}: {
  itens: ItemForm[]
  erros: ErrosValidacao
  onAdicionarItem: () => void
  onRemoverItem: (index: number) => void
  onChangeItem: (index: number, campo: keyof ItemForm, valor: string) => void
}) {
  return (
    <div>
      <div style={s.itensHeader}>
        <p style={{ ...s.secaoTitulo, marginBottom: 0 }}>
          Itens do Pedido ({itens.length})
        </p>
        <BotaoGlobal
          variante="secundario"
          tamanho="pequeno"
          icone={<Plus size={12} weight="bold" />}
          onClick={onAdicionarItem}
        >
          Adicionar Item
        </BotaoGlobal>
      </div>

      {itens.map((item, index) => (
        <div key={item.key} style={s.itemCard}>
          <div style={s.itemGrid}>
            <div>
              <label style={s.labelCompacto} htmlFor={`mnp-pn-${index}`}>Part Number</label>
              <input
                id={`mnp-pn-${index}`}
                style={s.inputCompacto}
                value={item.part_number}
                onChange={e => onChangeItem(index, 'part_number', e.target.value)}
                placeholder="SKU"
              />
            </div>
            <div>
              <label style={s.labelCompacto} htmlFor={`mnp-ncm-${index}`}>NCM</label>
              <input
                id={`mnp-ncm-${index}`}
                style={{ ...s.inputCompacto, fontFamily: 'monospace' }}
                value={item.ncm}
                onChange={e => onChangeItem(index, 'ncm', e.target.value)}
                placeholder="0000.00.00"
              />
            </div>
            <div>
              <label style={s.labelCompacto} htmlFor={`mnp-desc-${index}`}>Descrição</label>
              <input
                id={`mnp-desc-${index}`}
                style={s.inputCompacto}
                value={item.descricao_item}
                onChange={e => onChangeItem(index, 'descricao_item', e.target.value)}
                placeholder="Descrição do item"
              />
            </div>
            <div>
              <label style={s.labelCompacto} htmlFor={`mnp-qty-${index}`}>Qtd.</label>
              <input
                id={`mnp-qty-${index}`}
                type="number"
                style={{ ...s.inputCompacto, textAlign: 'right' }}
                value={item.quantidade_inicial_item_pedido}
                onChange={e => onChangeItem(index, 'quantidade_inicial_item_pedido', e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <button
              style={s.btnRemover}
              onClick={() => onRemoverItem(index)}
              disabled={itens.length <= 1}
              title={itens.length <= 1 ? 'Não é possível remover o único item' : 'Remover item'}
              aria-label={`Remover item ${index + 1}`}
              type="button"
            >
              <Trash size={14} weight="duotone" />
            </button>
          </div>
        </div>
      ))}

      {/* Erro retornado pela API */}
      {erros.geral && (
        <div style={s.erroGeral} role="alert">
          <Warning size={15} weight="fill" style={{ flexShrink: 0, marginTop: '1px' }} />
          <span>{erros.geral}</span>
        </div>
      )}
    </div>
  )
}
