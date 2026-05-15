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
import {
  kindUiDeCampo,
  casasDecimaisDefault,
  aplicarMaskCnpj,
  aplicarMaskCpf,
  aplicarMaskTelefone,
} from '../../../../shared/kind-ui-pedido'
import { CampoSmartImport } from './CampoSmartImport'
import { SelectGlobal } from '@nucleo/campo-select-global'

// P16 — Set de campos obrigatorios para sinalizacao visual (mesmo
// padrao do EtapaMapeamento.tsx). Reutilizado para detectar quando
// um valor vazio em campo obrigatorio deve mostrar borda vermelha.
const CAMPOS_OBRIGATORIOS = new Set(
  CAMPOS_PEDIDO_DDD_TODOS.filter(c => c.obrigatorio).map(c => c.campo)
)

/**
 * Campos ESTRUTURAIS — nao podem ser editados inline pelo usuario.
 *   - tipo_linha: muda Pedido<->Item (reorganiza linha inteira).
 *   - numero_pedido: ja' tem editor proprio no cabecalho do card
 *     (linha do card, ao lado do badge); evita duplicacao.
 *   - sequencia_item_pedido: backend auto-atribui.
 *   - valor_total_item: backend recomputa (qtd × valor_unit).
 *   - data_criacao_*, data_atualizacao_*: timestamps automaticos.
 *   - _origem: flag interna de auditoria (linhas adicionadas inline).
 */
const CAMPOS_NAO_EDITAVEIS_INLINE = new Set<string>([
  'tipo_linha',
  'numero_pedido',
  'sequencia_item_pedido',
  'valor_total_item',
  '_origem',
])

function ehCampoEditavel(campo: string): boolean {
  if (CAMPOS_NAO_EDITAVEIS_INLINE.has(campo)) return false
  if (campo.startsWith('data_criacao_'))     return false
  if (campo.startsWith('data_atualizacao_')) return false
  return true
}

/**
 * Formata valor de campo para exibicao no preview, baseado em kindUiDeCampo.
 * Garante que o que o usuario VE bata com o que digitaria:
 *   - NCM     "22021000"       -> "2202.10.00"
 *   - CNPJ    "12345678000190" -> "12.345.678/0001-90"
 *   - CPF     "12345678901"    -> "123.456.789-01"
 *   - Tel     "11987654321"    -> "(11) 98765-4321"
 *   - Data    "2026-05-13"     -> "13/05/2026"
 *   - Decimal "10"             -> "10,00" (2 casas) ou "10,000" (3 casas peso)
 *   - Tipo Op "importacao"     -> "Importação"
 *
 * Tudo dirigido pelo classificador `kindUiDeCampo` — sem hardcode por nome.
 */
function lerCasasConfigStorage(): Record<string, number> {
  try {
    const raw = localStorage.getItem('pedido:casas_decimais')
    return raw ? (JSON.parse(raw) as Record<string, number>) : {}
  } catch { return {} }
}

function fmtDecimalBr(n: number, casas: number): string {
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })
}

function fmtDataBr(s: string): string {
  // dd/mm/yyyy ja
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s
  // yyyy-mm-dd
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s)
  if (m) return `${m[3]}/${m[2]}/${m[1]}`
  return s
}

function formatarValor(campo: string, valor: unknown): string {
  const str = String(valor ?? '')
  if (!str.trim()) return str
  // Fallback rapido (cobertura legada)
  if (ehCampoNcm(campo)) return formatarNcm(str)

  const kind = kindUiDeCampo(campo)
  switch (kind) {
    case 'ncm':       return formatarNcm(str)
    case 'cnpj':      return aplicarMaskCnpj(str)
    case 'cpf':       return aplicarMaskCpf(str)
    case 'telefone':  return aplicarMaskTelefone(str)
    case 'data':      return fmtDataBr(str)
    case 'tipo_operacao': {
      if (str === 'importacao') return 'Importação'
      if (str === 'exportacao') return 'Exportação'
      return str
    }
    case 'decimal_quantidade':
    case 'decimal_valor':
    case 'decimal_peso':
    case 'decimal_cubagem':
    case 'decimal_taxa':
    case 'inteiro': {
      const n = parseFloat(str.replace(/\./g, '').replace(',', '.'))
      if (isNaN(n)) return str
      const casas = casasDecimaisDefault(kind, lerCasasConfigStorage())
      return fmtDecimalBr(n, casas)
    }
    default:
      return str
  }
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
// P19/Q4 — Refatorado para usar CampoSmartImport (renderer universal). O
// estado agora e' genérico Record<string,string> em vez de tipado por campo,
// porque qualquer campo do SSOT pode ser editado/preenchido.
//
// Lista de campos exibidos no form "Adicionar Item": campos do Item (`nivel:
// 'item'`) com prioridade 'critica' ou 'principal'. Cobre os 12 campos
// essenciais sem hardcode — se SSOT mudar, o form se ajusta sozinho.
type ItemInlineForm = Record<string, string>

/**
 * Campos AUTO-COMPUTADOS que NUNCA devem aparecer no form "Adicionar Item":
 *   - valor_total_item: backend recomputa = quantidade × valor_por_unidade
 *   - sequencia_item_pedido: backend auto-atribui sequência ao criar
 *
 * Se o usuário pudesse preencher, gera divergência com cascade do Pedido.
 */
const CAMPOS_EXCLUIR_FORM = new Set<string>([
  'valor_total_item',
  'sequencia_item_pedido',
])

/** Campos exibidos no form "Adicionar Item". Filtrados do SSOT em runtime. */
const CAMPOS_FORM_ADICIONAR_ITEM: string[] = CAMPOS_PEDIDO_DDD_TODOS
  .filter(c => c.nivel === 'item')
  .filter(c => c.prioridade === 'critica' || c.prioridade === 'principal')
  .filter(c => !CAMPOS_EXCLUIR_FORM.has(c.campo))
  .map(c => c.campo)

/** Defaults de campo — aplicados ao abrir o form. */
const DEFAULTS_FORM_ITEM: Record<string, string> = {
  moeda_item:    'USD',
  incoterm_item: 'FOB',
  // demais campos comecam vazios
}

function formInicialVazio(): ItemInlineForm {
  const f: ItemInlineForm = {}
  for (const campo of CAMPOS_FORM_ADICIONAR_ITEM) {
    f[campo] = DEFAULTS_FORM_ITEM[campo] ?? ''
  }
  return f
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
  const [formItem, setFormItem] = useState<ItemInlineForm>(formInicialVazio)
  // P15.2 — Estado de edicao de campo individual (chave: nome do campo)
  const [campoEditando, setCampoEditando] = useState<string | null>(null)
  const [valorTemp, setValorTemp]         = useState('')

  // P15.1 — Detecta alerta "Pedido sem ITEM associado" (vem do validarCoerenciaMasterDetail)
  const temAlertaItemFaltando = linha.alertas.some(a =>
    a.campo === 'tipo_linha' && /sem ITEM associado|nao tem nenhum ITEM/i.test(a.mensagem)
  )

  const temDuplicata = linha.alertas.some(a => a.tipo === 'duplicado_sistema')
  const numeroAtual  = numeroEditado ?? linha.numero_pedido ?? '—'

  // Lista de campos exibidos na expansao "Ver N campo(s) detectado(s)".
  // Oculta: numero_pedido (ja' no header), tipo_linha (estrutural, mostrado
  // como badge), _origem (flag interna de auditoria), timestamps automaticos.
  const camposVisiveis = Object.entries(linha.dados)
    .filter(([k]) => k !== 'numero_pedido' && k !== 'tipo_linha' && k !== '_origem')
    .filter(([k]) => !k.startsWith('data_criacao_') && !k.startsWith('data_atualizacao_'))
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
  // P19/Q4 — Form agora e' generico: percorre formItem (Record<string,string>)
  // e envia todos os campos preenchidos. Part Number permanece obrigatorio.
  // Backend continua aceitando strings e fazendo parse via normalizarNumero/Data.
  function confirmarAdicionarItem() {
    if (!onAdicionarItemInline) return
    const partNumber = (formItem.part_number_item ?? '').trim()
    if (!partNumber) return  // P14: part_number_item e' obrigatorio

    const dadosItem: Record<string, unknown> = {
      tipo_linha:    'ITEM',
      numero_pedido: linha.numero_pedido ?? '',
      _origem:       'inline',  // marca para auditoria
    }
    // Propaga todos os campos do form (filtra vazios)
    for (const campo of CAMPOS_FORM_ADICIONAR_ITEM) {
      const valor = (formItem[campo] ?? '').trim()
      if (valor) dadosItem[campo] = valor
    }
    // Garante que part_number_item esteja preenchido (validacao acima ja' filtrou)
    dadosItem.part_number_item = partNumber

    onAdicionarItemInline(linha, dadosItem)
    setFormItem(formInicialVazio())
    setMostrandoFormItem(false)
  }

  function cancelarAdicionarItem() {
    setFormItem(formInicialVazio())
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
          <SelectGlobal
            buscavel={false}
            tamanho="compacto"
            opcoes={[
              { valor: 'sobrescrever', rotulo: 'Sobrescrever' },
              { valor: 'criar', rotulo: 'Criar mesmo assim' },
              { valor: 'pular', rotulo: 'Pular' },
            ]}
            valor={decisao ?? 'pular'}
            aoMudarValor={v => v != null && onDecisao(v as DecisaoDuplicata)}
            aria-label="Decisao para pedido duplicado"
          />
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
                        <span className="smart-import__form-label-obrig" aria-label="obrigatorio">*</span>
                      )}
                    </span>
                    {/* P15.2 — edicao inline (mesmo padrao do numero_pedido)
                       P19/Q4 — Migrado para CampoSmartImport (renderer universal).
                       Cada tipo de campo (NCM, CNPJ, decimal, data, select) vira
                       o componente apropriado automaticamente — zero hardcode.

                       Gap #6 — Enter confirma APENAS quando:
                       (a) `e.defaultPrevented === false` — SelectGlobal chama
                           preventDefault no Enter (abre dropdown), entao essa
                           checagem evita confirmar ao abrir o select; E
                       (b) target nao e' TEXTAREA — em textarea Enter cria nova
                           linha, e' o comportamento esperado pelo usuario.
                       Para selects/textareas o usuario confirma via botao Check. */}
                    {ehEditandoEste ? (
                      <div
                        className="smart-import__edit-inline"
                        onKeyDown={e => {
                          if (e.key === 'Escape') {
                            e.preventDefault()
                            cancelarEdicaoCampo()
                            return
                          }
                          if (e.key === 'Enter' && !e.defaultPrevented) {
                            const tag = (e.target as HTMLElement).tagName
                            if (tag !== 'TEXTAREA') {
                              e.preventDefault()
                              confirmarEdicaoCampo()
                            }
                          }
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <CampoSmartImport
                            campo={campo}
                            valor={valorTemp}
                            onChange={v => setValorTemp(v)}
                            obrigatorio={ehObrigatorio}
                            autoFocus
                            semLabel
                          />
                        </div>
                        <button type="button" className="smart-import__btn-icone" onClick={confirmarEdicaoCampo} aria-label="Confirmar edicao" title="Confirmar (Enter)">
                          <Check size={13} weight="bold" />
                        </button>
                        <button type="button" className="smart-import__btn-icone" onClick={cancelarEdicaoCampo} aria-label="Cancelar edicao" title="Cancelar (Esc)">
                          <X size={13} weight="bold" />
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`smart-import__campo-valor${deveDestacarErro ? ' smart-import__campo-valor--erro' : ''}`}
                      >
                        {deveDestacarErro
                          ? <em style={{ fontStyle: 'normal' }}>(vazio)</em>
                          : formatarValor(campo, valor)}
                        {onEditarCampoLinha && ehCampoEditavel(campo) && (
                          <button
                            type="button"
                            className="smart-import__btn-icone smart-import__btn-icone--ghost"
                            onClick={() => iniciarEdicaoCampo(campo, valor)}
                            aria-label={`Editar ${rotulo(campo)}`}
                            title="Editar valor"
                          >
                            <PencilSimple size={12} weight="bold" />
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

      {/* P15.1 — Botao/form de adicionar item quando alerta "pedido sem ITEM"
         P19 — Refatorado para usar classes CSS dedicadas (sem style inline,
         sem cores hex hardcoded). Designer+Coord+LT 13/05/2026. */}
      {temAlertaItemFaltando && onAdicionarItemInline && (
        <div className="smart-import__form-item">
          {!mostrandoFormItem ? (
            <button
              type="button"
              onClick={() => setMostrandoFormItem(true)}
              className="smart-import__btn-adicionar-item"
              aria-label="Adicionar item inline"
            >
              <Plus size={14} weight="bold" aria-hidden="true" />
              Adicionar Item aqui (sem voltar a planilha)
            </button>
          ) : (
            <div>
              <p className="smart-import__form-item-titulo">
                Novo item para <strong>{numeroAtual}</strong>:
              </p>
              {/*
                P19/Q4 — Renderizacao 100% dinamica baseada no SSOT.
                Cada campo passa por kindUiDeCampo() (kind-ui-pedido.ts) que
                escolhe o componente correto (SelectNcmGlobal, SelectGlobal,
                CampoDecimalGlobal, CampoGeralGlobal+input, etc.). Adicionar
                campo novo no SSOT com prioridade critica/principal o faz
                aparecer aqui automaticamente — zero hardcode por campo.
              */}
              <div className="smart-import__form-item-grid">
                {CAMPOS_FORM_ADICIONAR_ITEM.map((campo, idx) => {
                  // Descricao_item ocupa as 2 colunas (campo longo)
                  const ehLongo = campo === 'descricao_item'
                  const ehObrig = CAMPOS_OBRIGATORIOS.has(campo)
                  return (
                    <div
                      key={campo}
                      className={`smart-import__form-item-campo${ehLongo ? ' smart-import__form-item-campo--full' : ''}`}
                    >
                      <CampoSmartImport
                        campo={campo}
                        valor={formItem[campo] ?? ''}
                        onChange={v => setFormItem(p => ({ ...p, [campo]: v }))}
                        obrigatorio={ehObrig}
                        autoFocus={idx === 0}
                      />
                    </div>
                  )
                })}
              </div>
              <div className="smart-import__form-item-acoes">
                <button
                  type="button"
                  onClick={cancelarAdicionarItem}
                  className="smart-import__btn-pill smart-import__btn-pill--secondary"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarAdicionarItem}
                  disabled={!(formItem.part_number_item ?? '').trim()}
                  className="smart-import__btn-pill smart-import__btn-pill--primary"
                  title={(formItem.part_number_item ?? '').trim() ? 'Adicionar item ao pedido' : 'Part Number e obrigatorio'}
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
