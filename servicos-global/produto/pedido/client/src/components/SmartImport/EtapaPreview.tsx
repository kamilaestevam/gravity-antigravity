/**
 * EtapaPreview.tsx — Etapa 3 do Smart Import
 * Mostra cada pedido que sera criado com:
 *  - Numero do pedido editavel pelo usuario
 *  - Todos os campos detectados do arquivo
 *  - Status ok/aviso/erro com alertas expandiveis
 */

import React, { useState, useMemo } from 'react'
import {
  CheckCircle,
  Warning,
  XCircle,
  CaretDown,
  CaretRight,
  PencilSimple,
  Check,
  Plus,
  X,
} from '@phosphor-icons/react'
import type { SmartImportLinha, DecisaoDuplicata } from '../../shared/types'
import { ehCampoNcm, formatarNcm } from '../../../../shared/formatadores'
import { ROTULO_POR_CAMPO, CAMPOS_PEDIDO_DDD_TODOS } from '../../../../shared/campos-pedido-ddd'

// P16 — Set de campos obrigatorios para sinalizacao visual (mesmo
// padrao do EtapaMapeamento.tsx). Reutilizado para detectar quando
// um valor vazio em campo obrigatorio deve mostrar borda vermelha.
const CAMPOS_OBRIGATORIOS = new Set(
  CAMPOS_PEDIDO_DDD_TODOS.filter(c => c.obrigatorio).map(c => c.campo)
)

/**
 * P13.2-UI — Formata valor de campo para exibicao no preview.
 * Hoje cobre NCM ("22021000" -> "2202.10.00"). Pode crescer no futuro para
 * outros campos com formato visual padrao (CNPJ, CPF, telefone, etc.).
 */
function formatarValor(campo: string, valor: unknown): string {
  const str = String(valor)
  if (ehCampoNcm(campo)) return formatarNcm(str)
  return str
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface EtapaPreviewProps {
  linhas: SmartImportLinha[]
  linhasSelecionadas: Set<number>
  decisoesDuplicatas: Record<string, DecisaoDuplicata>
  numerosEditados: Record<number, string>
  onSelecaoChange: (linhas: Set<number>) => void
  onDecisaoDuplicata: (numeroPedido: string, decisao: DecisaoDuplicata) => void
  onNumeroEditado: (linhaArquivo: number, numero: string) => void
  /** P15.1 — Callback para adicionar item inline a um pedido sem ITEM */
  onAdicionarItemInline?: (linhaPedido: SmartImportLinha, dadosItem: Record<string, unknown>) => void
  /** P15.2 — Callback para editar valor de campo em linha existente */
  onEditarCampoLinha?: (linhaArquivo: number, campo: string, novoValor: string) => void
}

// P15.1 — Formulario inline para adicionar item a pedido sem ITEM
interface ItemInlineForm {
  part_number_item:        string
  ncm_item:                string
  descricao_item:          string
  quantidade_inicial_item: string
  valor_por_unidade_item:  string
  moeda_item:              string
  incoterm_item:           string
}

const ITEM_INLINE_VAZIO: ItemInlineForm = {
  part_number_item:        '',
  ncm_item:                '',
  descricao_item:          '',
  quantidade_inicial_item: '',
  valor_por_unidade_item:  '',
  moeda_item:              'USD',
  incoterm_item:           '',
}

type FiltroPreview = 'todos' | 'ok' | 'aviso' | 'erro'

// ── Rotulos legíveis para os campos ──────────────────────────────────────────
//
// P5.4 — Antes existia um Record<string, string> hardcoded com 15 rotulos
// legados (`exportador`, `fabricante`, `ncm`, `data_embarque` etc. — nomes
// que nao existem mais no SSOT). Trocado por `ROTULO_POR_CAMPO` do
// `campos-pedido-ddd.ts` que cobre os 143 campos. Quando o campo nao tem
// rotulo (campos extras "custom_*" ou campos novos), faz fallback humano:
// "data_emissao_pedido" -> "Data emissao pedido".

function rotulo(campo: string): string {
  return ROTULO_POR_CAMPO[campo] ?? campo.replace(/_/g, ' ')
}

// ── Componente de status ──────────────────────────────────────────────────────

function IconeStatus({ status }: { status: SmartImportLinha['status'] }) {
  if (status === 'ok')    return <CheckCircle size={16} weight="fill" className="smart-import__status-ok"    aria-label="Ok"    />
  if (status === 'aviso') return <Warning     size={16} weight="fill" className="smart-import__status-aviso" aria-label="Aviso" />
  return                         <XCircle     size={16} weight="fill" className="smart-import__status-erro"  aria-label="Erro"  />
}

// ── Card de pedido ────────────────────────────────────────────────────────────

function CardPedido({
  linha,
  selecionada,
  decisao,
  numeroEditado,
  onToggle,
  onDecisao,
  onNumeroEditado,
  onAdicionarItemInline,
  onEditarCampoLinha,
}: {
  linha: SmartImportLinha
  selecionada: boolean
  decisao: DecisaoDuplicata | undefined
  numeroEditado: string | undefined
  onToggle: () => void
  onDecisao: (d: DecisaoDuplicata) => void
  onNumeroEditado: (v: string) => void
  onAdicionarItemInline?: (linhaPedido: SmartImportLinha, dadosItem: Record<string, unknown>) => void
  onEditarCampoLinha?: (linhaArquivo: number, campo: string, novoValor: string) => void
}) {
  const [expandidoAlertas, setExpandidoAlertas] = useState(false)
  const [expandidoCampos, setExpandidoCampos]   = useState(false)
  const [editandoNumero, setEditandoNumero]      = useState(false)
  const [numeroTemp, setNumeroTemp]              = useState('')
  // P15.1 — Estado do formulario inline de adicionar item
  const [mostrandoFormItem, setMostrandoFormItem] = useState(false)
  const [formItem, setFormItem] = useState<ItemInlineForm>(ITEM_INLINE_VAZIO)
  // P15.2 — Estado de edicao de campo individual (chave: nome do campo)
  const [campoEditando, setCampoEditando] = useState<string | null>(null)
  const [valorTemp, setValorTemp]         = useState('')

  // P15.1 — Detecta alerta "Pedido sem ITEM associado" (vem do validarCoerenciaMasterDetail)
  const temAlertaItemFaltando = linha.alertas.some(a =>
    a.campo === 'tipo_linha' && /sem ITEM associado|nao tem nenhum ITEM/i.test(a.mensagem)
  )

  const temDuplicata = linha.alertas.some(a => a.tipo === 'duplicado_sistema')
  const numeroAtual  = numeroEditado ?? linha.numero_pedido ?? '—'

  const camposVisiveis = Object.entries(linha.dados)
    .filter(([k]) => k !== 'numero_pedido')
    .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '')

  function iniciarEdicao() {
    setNumeroTemp(numeroAtual)
    setEditandoNumero(true)
  }

  function confirmarEdicao() {
    if (numeroTemp.trim()) onNumeroEditado(numeroTemp.trim())
    setEditandoNumero(false)
  }

  // P15.2 — Helpers de edicao inline de campo individual
  function iniciarEdicaoCampo(campo: string, valorAtual: unknown) {
    setCampoEditando(campo)
    setValorTemp(String(valorAtual ?? ''))
  }

  function confirmarEdicaoCampo() {
    if (campoEditando && onEditarCampoLinha) {
      onEditarCampoLinha(linha.linha_arquivo, campoEditando, valorTemp)
    }
    setCampoEditando(null)
  }

  function cancelarEdicaoCampo() {
    setCampoEditando(null)
    setValorTemp('')
  }

  // P15.1 — Confirmacao do form inline (cria nova SmartImportLinha tipo ITEM)
  function confirmarAdicionarItem() {
    if (!onAdicionarItemInline) return
    if (!formItem.part_number_item.trim()) return  // P14: part_number_item e' obrigatorio
    const dadosItem: Record<string, unknown> = {
      tipo_linha:              'ITEM',
      numero_pedido:           linha.numero_pedido ?? '',
      part_number_item:        formItem.part_number_item.trim(),
      ncm_item:                formItem.ncm_item.trim() || undefined,
      descricao_item:          formItem.descricao_item.trim() || undefined,
      quantidade_inicial_item: formItem.quantidade_inicial_item.trim() || undefined,
      valor_por_unidade_item:  formItem.valor_por_unidade_item.trim() || undefined,
      moeda_item:              formItem.moeda_item.trim() || 'USD',
      incoterm_item:           formItem.incoterm_item.trim() || undefined,
      _origem:                 'inline',  // marca para auditoria
    }
    // Remove undefined (dados.unknown nao precisa de chave para vazio)
    for (const k of Object.keys(dadosItem)) {
      if (dadosItem[k] === undefined) delete dadosItem[k]
    }
    onAdicionarItemInline(linha, dadosItem)
    setFormItem(ITEM_INLINE_VAZIO)
    setMostrandoFormItem(false)
  }

  function cancelarAdicionarItem() {
    setFormItem(ITEM_INLINE_VAZIO)
    setMostrandoFormItem(false)
  }

  return (
    <div
      className={`smart-import__card-pedido${selecionada ? ' smart-import__card-pedido--selecionado' : ' smart-import__card-pedido--desmarcado'}`}
      aria-selected={selecionada}
    >
      {/* Linha de cabeçalho do card */}
      <div className="smart-import__card-header">
        <input
          type="checkbox"
          checked={selecionada}
          onChange={onToggle}
          aria-label={`Selecionar pedido da linha ${linha.linha_arquivo}`}
          style={{ flexShrink: 0 }}
        />

        {/* Badge novo pedido */}
        {linha.status === 'ok' && !linha.alertas.some(a => a.tipo === 'duplicado_sistema') && (
          <span style={{ color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', fontSize: '0.625rem', fontWeight: 700, padding: '0.125rem 0.375rem', borderRadius: '9999px', flexShrink: 0 }}>
            NOVO PEDIDO
          </span>
        )}

        {/* Badge aviso — sera criado mas tem alertas */}
        {linha.status === 'aviso' && !temDuplicata && (
          <span style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', fontSize: '0.625rem', fontWeight: 700, padding: '0.125rem 0.375rem', borderRadius: '9999px', flexShrink: 0 }}>
            COM AVISO
          </span>
        )}

        {/* Badge erro — nao sera criado */}
        {linha.status === 'erro' && (
          <span style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.625rem', fontWeight: 700, padding: '0.125rem 0.375rem', borderRadius: '9999px', flexShrink: 0 }}>
            COM ERRO
          </span>
        )}

        {/* Número do pedido editável */}
        <div className="smart-import__numero-pedido-wrapper">
          {editandoNumero ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <input
                className="smart-import__numero-input"
                value={numeroTemp}
                onChange={e => setNumeroTemp(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') confirmarEdicao(); if (e.key === 'Escape') setEditandoNumero(false) }}
                autoFocus
                aria-label="Numero do pedido"
              />
              <button type="button" className="smart-import__btn-icone" onClick={confirmarEdicao} aria-label="Confirmar">
                <Check size={14} weight="bold" />
              </button>
              <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                Enter ✓ · Esc ✕
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="smart-import__numero-pedido">{numeroAtual}</span>
              {linha.status !== 'erro' && (
                <button
                  type="button"
                  className="smart-import__btn-icone"
                  onClick={iniciarEdicao}
                  aria-label="Editar numero do pedido"
                  title="Editar número (Enter para confirmar, Esc para cancelar)"
                >
                  <PencilSimple size={13} weight="bold" />
                </button>
              )}
              {numeroEditado && (
                <span style={{ fontSize: '0.7rem', color: '#60a5fa' }}>editado</span>
              )}
            </div>
          )}
        </div>

        <IconeStatus status={linha.status} />

        {/* Exportador em destaque */}
        {linha.dados.exportador && (
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', flexShrink: 0 }}>
            {String(linha.dados.exportador)}
          </span>
        )}

        {/* Linha bruta */}
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginLeft: 'auto', flexShrink: 0 }}>
          linha {linha.linha_arquivo}
        </span>
      </div>

      {/* Decisão duplicata */}
      {temDuplicata && (
        <div className="smart-import__duplicata-aviso">
          <Warning size={13} weight="fill" style={{ color: '#f59e0b' }} aria-hidden="true" />
          <span>Pedido já existe no sistema.</span>
          <select
            className="drawer-pedido__select"
            style={{ fontSize: '0.75rem', padding: '0.125rem 0.375rem' }}
            value={decisao ?? 'pular'}
            onChange={e => onDecisao(e.target.value as DecisaoDuplicata)}
            aria-label="Decisao para pedido duplicado"
          >
            <option value="sobrescrever">Sobrescrever</option>
            <option value="criar">Criar mesmo assim</option>
            <option value="pular">Pular</option>
          </select>
        </div>
      )}

      {/* Diff preview ao sobrescrever */}
      {temDuplicata && decisao === 'sobrescrever' && (
        <div style={{
          marginTop: '0.375rem',
          padding: '0.5rem 0.75rem',
          background: 'rgba(99,102,241,0.06)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '0.375rem',
          fontSize: '0.75rem',
        }}>
          <p style={{ margin: '0 0 0.375rem', fontWeight: 600, color: 'var(--accent, #6366f1)' }}>
            Campos que serão atualizados:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.25rem 0.75rem' }}>
            {Object.entries(linha.dados)
              .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '')
              .slice(0, 8)
              .map(([campo, valor]) => (
                <React.Fragment key={campo}>
                  <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{rotulo(campo)}:</span>
                  <span style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatarValor(campo, valor)}</span>
                </React.Fragment>
              ))
            }
          </div>
          {Object.keys(linha.dados).length > 8 && (
            <p style={{ margin: '0.375rem 0 0', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              + {Object.keys(linha.dados).length - 8} outros campos
            </p>
          )}
        </div>
      )}

      {/* Campos detectados */}
      {camposVisiveis.length > 0 && (
        <div className="smart-import__campos-detectados">
          <button
            type="button"
            className="smart-import__expandir-campos"
            onClick={() => setExpandidoCampos(v => !v)}
            aria-expanded={expandidoCampos}
          >
            {expandidoCampos
              ? <CaretDown size={11} aria-hidden="true" />
              : <CaretRight size={11} aria-hidden="true" />}
            {expandidoCampos
              ? 'Ocultar campos'
              : `Ver ${camposVisiveis.length} campo(s) detectado(s)`}
          </button>

          {expandidoCampos && (
            <div className="smart-import__campos-grid">
              {camposVisiveis.map(([campo, valor]) => {
                const ehEditandoEste = campoEditando === campo
                // P16 — Padrao plataforma: asterisco + borda vermelha em obrigatorios vazios
                const ehObrigatorio = CAMPOS_OBRIGATORIOS.has(campo)
                const valorAtualVazio = ehEditandoEste
                  ? !valorTemp.trim()
                  : !String(valor ?? '').trim()
                const deveDestacarErro = ehObrigatorio && valorAtualVazio
                return (
                  <div key={campo} className="smart-import__campo-item">
                    <span className="smart-import__campo-label">
                      {rotulo(campo)}
                      {ehObrigatorio && (
                        <span style={{ color: '#f87171', fontWeight: 700, marginLeft: '0.25rem' }} aria-label="obrigatorio">*</span>
                      )}
                    </span>
                    {/* P15.2 — edicao inline (mesmo padrao do numero_pedido) */}
                    {ehEditandoEste ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 }}>
                        <input
                          className="smart-import__numero-input"
                          value={valorTemp}
                          onChange={e => setValorTemp(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') confirmarEdicaoCampo()
                            if (e.key === 'Escape') cancelarEdicaoCampo()
                          }}
                          autoFocus
                          aria-label={`Editar ${rotulo(campo)}`}
                          aria-required={ehObrigatorio || undefined}
                          aria-invalid={deveDestacarErro || undefined}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            borderColor: deveDestacarErro ? '#f87171' : undefined,
                          }}
                        />
                        <button type="button" className="smart-import__btn-icone" onClick={confirmarEdicaoCampo} aria-label="Confirmar edicao" title="Confirmar (Enter)">
                          <Check size={12} weight="bold" />
                        </button>
                        <button type="button" className="smart-import__btn-icone" onClick={cancelarEdicaoCampo} aria-label="Cancelar edicao" title="Cancelar (Esc)">
                          <X size={12} weight="bold" />
                        </button>
                      </div>
                    ) : (
                      <span
                        className="smart-import__campo-valor"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          // P16 — destaque visual sutil quando obrigatorio + vazio
                          color: deveDestacarErro ? '#f87171' : undefined,
                        }}
                      >
                        {deveDestacarErro
                          ? <em style={{ fontStyle: 'normal' }}>(vazio)</em>
                          : formatarValor(campo, valor)}
                        {onEditarCampoLinha && (
                          <button
                            type="button"
                            className="smart-import__btn-icone"
                            onClick={() => iniciarEdicaoCampo(campo, valor)}
                            aria-label={`Editar ${rotulo(campo)}`}
                            title="Editar valor"
                            style={{ opacity: 0.6 }}
                          >
                            <PencilSimple size={11} weight="bold" />
                          </button>
                        )}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Alertas */}
      {linha.alertas.length > 0 && (
        <div>
          <button
            type="button"
            className="smart-import__expandir-campos"
            onClick={() => setExpandidoAlertas(v => !v)}
            aria-expanded={expandidoAlertas}
            style={{ color: linha.status === 'erro' ? '#ef4444' : '#f59e0b' }}
          >
            {expandidoAlertas
              ? <CaretDown size={11} aria-hidden="true" />
              : <CaretRight size={11} aria-hidden="true" />}
            {linha.alertas.length} alerta(s)
          </button>

          {expandidoAlertas && (
            <ul style={{ margin: '0.375rem 0 0 1rem', padding: 0, listStyle: 'none' }}>
              {linha.alertas.map((a, i) => (
                <li key={i} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem', color: a.nivel === 'erro' ? '#ef4444' : '#f59e0b', marginBottom: '0.25rem' }}>
                  {a.nivel === 'erro'
                    ? <XCircle size={12} weight="fill" aria-hidden="true" />
                    : <Warning size={12} weight="fill" aria-hidden="true" />}
                  <strong>{rotulo(a.campo)}:</strong> {a.mensagem}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* P15.1 — Botao/form de adicionar item quando alerta "pedido sem ITEM" */}
      {temAlertaItemFaltando && onAdicionarItemInline && (
        <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(96,165,250,0.06)', borderRadius: '6px', border: '1px dashed rgba(96,165,250,0.3)' }}>
          {!mostrandoFormItem ? (
            <button
              type="button"
              onClick={() => setMostrandoFormItem(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                background: 'transparent',
                border: 'none',
                color: '#60a5fa',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: 500,
                padding: 0,
              }}
              aria-label="Adicionar item inline"
            >
              <Plus size={14} weight="bold" aria-hidden="true" />
              Adicionar Item aqui (sem voltar a planilha)
            </button>
          ) : (
            <div>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Novo item para <strong>{numeroAtual}</strong>:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {/* Part Number — obrigatorio (P16: padrao da plataforma) */}
                {/*
                  P16 — Sinalizacao de obrigatorio segue o padrao
                  CampoGeralGlobal da plataforma:
                    - Asterisco vermelho discreto no label (#f87171 dark)
                    - Borda vermelha no input quando vazio (regra do
                      campo-geral.css: ".cg-wrapper--erro input { border-color: #f87171 }")
                  Sem legenda no rodape (removida na plataforma — era redundante).
                */}
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    Part Number{' '}
                    <span style={{ color: '#f87171', fontWeight: 700 }} aria-label="obrigatorio">*</span>
                  </span>
                  <input
                    className="smart-import__numero-input"
                    value={formItem.part_number_item}
                    onChange={e => setFormItem(p => ({ ...p, part_number_item: e.target.value }))}
                    autoFocus
                    aria-label="Part Number"
                    aria-required="true"
                    aria-invalid={!formItem.part_number_item.trim()}
                    style={{
                      borderColor: !formItem.part_number_item.trim() ? '#f87171' : undefined,
                    }}
                  />
                </label>
                {/* NCM */}
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>NCM</span>
                  <input
                    className="smart-import__numero-input"
                    value={formItem.ncm_item}
                    onChange={e => setFormItem(p => ({ ...p, ncm_item: e.target.value }))}
                    placeholder="2202.10.00"
                    aria-label="NCM"
                  />
                </label>
                {/* Descricao */}
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', gridColumn: '1 / -1' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Descricao</span>
                  <input
                    className="smart-import__numero-input"
                    value={formItem.descricao_item}
                    onChange={e => setFormItem(p => ({ ...p, descricao_item: e.target.value }))}
                    aria-label="Descricao do Item"
                  />
                </label>
                {/* Quantidade */}
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Qtd. Inicial</span>
                  <input
                    className="smart-import__numero-input"
                    value={formItem.quantidade_inicial_item}
                    onChange={e => setFormItem(p => ({ ...p, quantidade_inicial_item: e.target.value }))}
                    inputMode="decimal"
                    aria-label="Quantidade Inicial"
                  />
                </label>
                {/* Valor unitario */}
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Valor por Unidade</span>
                  <input
                    className="smart-import__numero-input"
                    value={formItem.valor_por_unidade_item}
                    onChange={e => setFormItem(p => ({ ...p, valor_por_unidade_item: e.target.value }))}
                    inputMode="decimal"
                    aria-label="Valor por Unidade"
                  />
                </label>
                {/* Moeda */}
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Moeda</span>
                  <input
                    className="smart-import__numero-input"
                    value={formItem.moeda_item}
                    onChange={e => setFormItem(p => ({ ...p, moeda_item: e.target.value.toUpperCase().slice(0, 3) }))}
                    placeholder="USD"
                    aria-label="Moeda"
                    maxLength={3}
                  />
                </label>
                {/* Incoterm */}
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Incoterm</span>
                  <input
                    className="smart-import__numero-input"
                    value={formItem.incoterm_item}
                    onChange={e => setFormItem(p => ({ ...p, incoterm_item: e.target.value.toUpperCase().slice(0, 6) }))}
                    placeholder="FOB"
                    aria-label="Incoterm"
                    maxLength={6}
                  />
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={cancelarAdicionarItem}
                  style={{ background: 'transparent', border: '1px solid var(--bg-elevated, #334155)', color: 'var(--text-muted)', padding: '0.375rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarAdicionarItem}
                  disabled={!formItem.part_number_item.trim()}
                  style={{
                    background: formItem.part_number_item.trim() ? '#60a5fa' : 'var(--bg-elevated, #334155)',
                    border: 'none',
                    color: formItem.part_number_item.trim() ? '#0f172a' : 'var(--text-muted)',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '4px',
                    cursor: formItem.part_number_item.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                  title={formItem.part_number_item.trim() ? 'Adicionar item ao pedido' : 'Part Number e obrigatorio'}
                >
                  Adicionar Item
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export function EtapaPreview({
  linhas,
  linhasSelecionadas,
  decisoesDuplicatas,
  numerosEditados,
  onSelecaoChange,
  onDecisaoDuplicata,
  onNumeroEditado,
  onAdicionarItemInline,
  onEditarCampoLinha,
}: EtapaPreviewProps) {
  const [filtro, setFiltro] = useState<FiltroPreview>('todos')
  const [filtroVisible, setFiltroVisible] = useState(true)

  const linhasFiltradas = useMemo(() => {
    if (filtro === 'todos') return linhas
    return linhas.filter(l => l.status === filtro)
  }, [linhas, filtro])

  function aplicarFiltro(novoFiltro: FiltroPreview) {
    setFiltroVisible(false)
    setTimeout(() => {
      setFiltro(novoFiltro)
      setFiltroVisible(true)
    }, 100)
  }

  const contadores = useMemo(() => ({
    ok:    linhas.filter(l => l.status === 'ok').length,
    aviso: linhas.filter(l => l.status === 'aviso').length,
    erro:  linhas.filter(l => l.status === 'erro').length,
  }), [linhas])

  const pedidosUnicosTotal = useMemo(() => {
    return new Set(linhas.map(l => l.numero_pedido).filter(Boolean)).size
  }, [linhas])

  const pedidosUnicosSelecionados = useMemo(() => {
    return new Set(
      linhas.filter(l => linhasSelecionadas.has(l.linha_arquivo)).map(l => l.numero_pedido).filter(Boolean)
    ).size
  }, [linhas, linhasSelecionadas])

  const duplicatas  = linhas.filter(l => l.alertas.some(a => a.tipo === 'duplicado_sistema'))
  const atualizados = duplicatas.filter(l => decisoesDuplicatas[l.numero_pedido ?? ''] === 'sobrescrever').length
  const pulados     = duplicatas.filter(l => decisoesDuplicatas[l.numero_pedido ?? ''] === 'pular').length
  const criados     = linhasSelecionadas.size

  function toggleLinha(linhaNum: number) {
    const novo = new Set(linhasSelecionadas)
    if (novo.has(linhaNum)) novo.delete(linhaNum)
    else novo.add(linhaNum)
    onSelecaoChange(novo)
  }

  function selecionarTodasValidas() {
    onSelecaoChange(new Set(linhas.filter(l => l.status === 'ok').map(l => l.linha_arquivo)))
  }

  function selecionarTodas() {
    onSelecaoChange(new Set(linhas.map(l => l.linha_arquivo)))
  }

  function desselecionarTodas() {
    onSelecaoChange(new Set())
  }

  return (
    <div>
      {/* Contador de resumo */}
      <div className="smart-import__contador" role="status">
        <span><strong>{pedidosUnicosSelecionados}</strong> pedido(s) de <strong>{pedidosUnicosTotal}</strong> únicos</span>
        <span>·</span>
        <span><strong>{criados}</strong> linha(s) incluídas</span>
        <span><strong>{atualizados}</strong> atualiz.</span>
        <span><strong>{pulados}</strong> pulados</span>
        {contadores.erro > 0 && (
          <span style={{ color: '#ef4444' }}><strong>{contadores.erro}</strong> com erro</span>
        )}
      </div>

      {/* Filtros + ações */}
      <div className="smart-import__filtros" role="group" aria-label="Filtrar pedidos">
        {(['todos', 'ok', 'aviso', 'erro'] as FiltroPreview[]).map(f => (
          <button
            key={f}
            className={`smart-import__filtro-btn${filtro === f ? ' smart-import__filtro-btn--ativo' : ''}`}
            onClick={() => aplicarFiltro(f)}
            aria-pressed={filtro === f}
          >
            {f === 'todos' && `Todos (${linhas.length})`}
            {f === 'ok'    && `Ok (${contadores.ok})`}
            {f === 'aviso' && `Aviso (${contadores.aviso})`}
            {f === 'erro'  && `Erro (${contadores.erro})`}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <button className="smart-import__filtro-btn" onClick={selecionarTodasValidas}>
            Selecionar validas
          </button>
          <button className="smart-import__filtro-btn" onClick={() => {
            onSelecaoChange(new Set([
              ...Array.from(linhasSelecionadas),
              ...linhas.filter(l => l.status === 'aviso').map(l => l.linha_arquivo)
            ]))
          }}>
            + Incluir avisos
          </button>
          <button className="smart-import__filtro-btn" onClick={selecionarTodas}>
            Selecionar todas
          </button>
          <button className="smart-import__filtro-btn" onClick={desselecionarTodas}>
            Limpar selecao
          </button>
        </div>
      </div>

      {/* Cards de pedidos */}
      <div className="smart-import__cards-lista" style={{ transition: 'opacity 0.15s ease', opacity: filtroVisible ? 1 : 0 }}>
        {linhasFiltradas.map(linha => (
          <CardPedido
            key={linha.linha_arquivo}
            linha={linha}
            selecionada={linhasSelecionadas.has(linha.linha_arquivo)}
            decisao={decisoesDuplicatas[linha.numero_pedido ?? '']}
            numeroEditado={numerosEditados[linha.linha_arquivo]}
            onToggle={() => toggleLinha(linha.linha_arquivo)}
            onDecisao={d => onDecisaoDuplicata(linha.numero_pedido ?? '', d)}
            onNumeroEditado={v => onNumeroEditado(linha.linha_arquivo, v)}
            onAdicionarItemInline={onAdicionarItemInline}
            onEditarCampoLinha={onEditarCampoLinha}
          />
        ))}
      </div>
    </div>
  )
}
