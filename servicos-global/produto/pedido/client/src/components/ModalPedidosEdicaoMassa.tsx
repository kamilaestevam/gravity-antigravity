/**
 * ModalEdicaoEmMassa.tsx — Modal de edição em massa de pedidos
 *
 * Fluxo em 2 passos:
 *   Passo 1 — Selecionar campos + valores + preview em tempo real (debounce 300ms)
 *   Passo 2 — Confirmar: resumo com X pedidos · Y itens · Z campos + lista campo→valor
 *
 * Regras de negócio:
 *   - Campos bloqueados (calculados) nunca aparecem na lista editável
 *   - Campos com múltiplos valores entre pedidos: placeholder "Múltiplos valores"
 *   - Toggle de nível: Pedido / Item / Combinado
 *   - Preview em tempo real com debounce 300ms
 *   - Preview "de/para" colapsável por campo, mostrando valor atual → novo por pedido
 *   - Fechar com Escape
 */

import React, { useState, useEffect, useCallback, useRef, KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Warning, Spinner, Plus, X, CheckCircle, MagnifyingGlass, CaretDown, CaretRight, Clock, Info, PencilSimpleLine, Package, ListChecks, Funnel, CubeTransparent } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { ModalPassoPassoGlobal } from '@nucleo/modal-passo-passo-global'
import type { PassoConfig } from '@nucleo/modal-passo-passo-global'
import type { ResultadoAcao } from '@nucleo/botao-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { useShellStore } from '@gravity/shell'
import { useHasMixedTipos } from '../shared/state/selecaoStore'
import { useIncotermsPedido } from '../shared/useIncotermsPedido'
import { useMoedasPedido } from '../shared/useMoedasPedido'
import { useUnidadesPedido } from '../shared/useUnidadesPedido'
import { useLogisticaCadastrosPedido } from '../shared/useLogisticaCadastrosPedido'
import { useCambioSiscomexPedido } from '../shared/useCambioSiscomexPedido'
import type {
  Pedido,
  CampoEdicaoMassa,
  ColunaUsuario,
  EdicaoMassaPayload,
  EdicaoMassaPreview,
  EdicaoMassaResultado,
  OperacaoCampo,
  TipoCampoEdicao,
} from '../shared/types'
import { CAMPOS_BLOQUEADOS_PEDIDO, CAMPOS_BLOQUEADOS_ITEM } from '../shared/types'
import { pedidoEdicaoMassaApi, pedidoConfigApi, colunasUsuarioApi } from '../shared/api'
import { cadastrosApi } from '../shared/cadastrosApi'
import {
  CAMPOS_EDICAO_MASSA_PEDIDO,
  CAMPOS_EDICAO_MASSA_ITEM,
  CAMPOS_DETALHES_OPERACIONAIS,
  PREFIXO_COLUNA_USUARIO,
  type CampoEdicaoMassaDef,
} from '../../../shared/camposEdicaoMassa'
import { kindUiDeCampo } from '../../../shared/kind-ui-pedido'

// ── Props ─────────────────────────────────────────────────────────────────────

interface ModalEdicaoMassaPedidosProps {
  pedidos: Pedido[]
  /** IDs específicos de itens selecionados. Se presente, apenas estes itens serão editados
   *  (não o pedido inteiro). Quando ausente, todos os itens dos pedidos selecionados são editados. */
  itensSelecionadosIds?: string[]
  /** Pedidos que recebem tratamento completo (campos pedido + itens) mesmo com item_ids.
   *  Caso misto: pedido selecionado explicitamente + itens avulsos de outros pedidos. */
  pedidoIdsCompleto?: string[]
  onFechar: () => void
  onConcluido: () => void
}

// ── Definição de campos disponíveis para edição ───────────────────────────────

interface DefinicaoCampo {
  campo: string
  rotulo: string
  tipo: TipoCampoEdicao
  nivel: 'pedido' | 'item'
  grupo?: string
  // Para tipo='select' — valores válidos do enum
  opcoes?: { valor: string; rotulo: string }[]
  // Se definido, o campo só aparece quando a condição for verdadeira para os pedidos selecionados
  visivel?: (pedidos: Pedido[]) => boolean
}

type TFunc = (key: string, opts?: Record<string, unknown>) => string

// ── Derivação do SSOT (Onda 3 — 2026-06-11) ──────────────────────────────────
//
// Os campos editáveis vêm de shared/camposEdicaoMassa.ts (derivado do DDD —
// mesma fonte do backend). Regra de produto: se o campo é editável na lista,
// é editável em massa — incluindo colunas criadas pelo usuário, que viajam
// no payload como `coluna_usuario:<id>`.
//
// Rótulos: chave i18n `pedido.massa_campos.<campo>` com fallback no rótulo
// DDD (campos novos ainda sem tradução exibem o rótulo do dicionário).

const GRUPO_DDD_PARA_I18N: Record<string, string> = {
  'Identificacao':        'grupo_identifica_o',
  'Exportador':           'grupo_exportador',
  'Importador':           'grupo_importador',
  'Fabricante':           'grupo_fabricante',
  'OPE':                  'grupo_ope',
  'Comercial':            'grupo_comercial',
  'Financeiro':           'grupo_comercial',
  'Cambio':               'grupo_c_mbio',
  'Fisico':               'grupo_f_sico',
  'Logistica':            'grupo_log_stica',
  'Documentos':           'grupo_documentos',
  'Datas':                'grupo_datas',
  'Datas Draft Pedido':   'grupo_datas_draft_pedido',
  'Datas Draft Proforma': 'grupo_datas_draft_proforma',
  'Datas Draft Invoice':  'grupo_datas_draft_invoice',
  'Produto':              'grupo_produto',
  'Quantidades':          'grupo_quantidades',
  'Partes':               'grupo_partes',
}

// Selects com opções carregadas em runtime que o kindUiDeCampo classifica
// como texto (país/porto/aeroporto/status) — ver injetarOpcoesDinamicas.
const CAMPOS_SELECT_DINAMICO_EXTRA = new Set([
  'pais_exportador', 'pais_fabricante', 'pais_ope',
  'local_de_origem', 'local_de_destino',
  'porto_origem', 'porto_destino',
  'aeroporto_origem', 'aeroporto_destino',
  'status_pedido',
])

/** Mapeia o KindUI (classificador granular do DDD) para o tipo de input do modal. */
function tipoEdicaoDeCampoSsot(campo: string): TipoCampoEdicao {
  if (CAMPOS_SELECT_DINAMICO_EXTRA.has(campo)) return 'select'
  const kind = kindUiDeCampo(campo)
  if (kind === 'ncm') return 'ncm'
  if (kind === 'data') return 'data'
  if (kind === 'inteiro' || kind.startsWith('decimal_')) return 'numero'
  if (
    kind === 'moeda_codigo' || kind === 'incoterm' || kind === 'unidade' ||
    kind === 'tipo_operacao' || kind === 'cobertura_cambial' ||
    kind === 'condicao_pagamento_siscomex' || kind === 'select_ssot'
  ) return 'select'
  return 'texto'
}

function definicaoDeCampoSsot(c: CampoEdicaoMassaDef, t: TFunc): DefinicaoCampo {
  const grupoKey = GRUPO_DDD_PARA_I18N[c.grupo]
  const def: DefinicaoCampo = {
    campo: c.campo,
    rotulo: t(`pedido.massa_campos.${c.campo}`, { defaultValue: c.rotulo }),
    tipo: tipoEdicaoDeCampoSsot(c.campo),
    nivel: c.nivel,
    grupo: grupoKey ? t(`pedido.modal_massa.${grupoKey}`) : c.grupo,
  }

  // Opções traduzidas do tipo de operação; demais selects do SSOT usam o valor cru
  if (c.campo === 'tipo_operacao_pedido' || c.campo === 'tipo_operacao_item') {
    def.opcoes = [
      { valor: 'importacao', rotulo: t('pedido.modal_massa.tipo_op_importacao') },
      { valor: 'exportacao', rotulo: t('pedido.modal_massa.tipo_op_exportacao') },
    ]
  } else if (c.opcoesSelect?.length) {
    def.opcoes = c.opcoesSelect.map(v => ({ valor: v, rotulo: v }))
  }

  // nome_exportador: editável somente em importacao (fornecedor estrangeiro);
  // nome_importador: editável somente em exportacao (cliente estrangeiro)
  if (c.campo === 'nome_exportador') {
    def.visivel = (pedidos: Pedido[]) => pedidos.every(p => p.tipo_operacao === 'importacao')
  }
  if (c.campo === 'nome_importador') {
    def.visivel = (pedidos: Pedido[]) => pedidos.every(p => p.tipo_operacao === 'exportacao')
  }

  return def
}

export function construirCamposPedidoEditaveis(t: TFunc): DefinicaoCampo[] {
  return CAMPOS_EDICAO_MASSA_PEDIDO.map(c => definicaoDeCampoSsot(c, t))
}

export function construirCamposItemEditaveis(t: TFunc): DefinicaoCampo[] {
  return CAMPOS_EDICAO_MASSA_ITEM.map(c => definicaoDeCampoSsot(c, t))
}

/** Coluna criada pelo usuário → DefinicaoCampo (campo `coluna_usuario:<id>`). */
function definicaoDeColunaUsuario(col: ColunaUsuario, nivel: 'pedido' | 'item', t: TFunc): DefinicaoCampo {
  const tipo: TipoCampoEdicao =
    col.tipo === 'numero' || col.tipo === 'percentual' ? 'numero'
    : col.tipo === 'data' ? 'data'
    : col.tipo === 'select' || col.tipo === 'checkbox' ? 'select'
    : col.tipo === 'tipo_documento' && col.opcoes?.length ? 'select'
    : 'texto'
  return {
    campo: `${PREFIXO_COLUNA_USUARIO}${col.id}`,
    rotulo: col.nome,
    tipo,
    nivel,
    grupo: t('pedido.modal_massa.grupo_personalizadas', { defaultValue: 'Personalizadas' }),
    // Mesmos rótulos da edição inline da lista (Pedidos.tsx)
    opcoes: col.tipo === 'select' || col.tipo === 'tipo_documento'
      ? (col.opcoes ?? []).map(v => ({ valor: v, rotulo: v }))
      : col.tipo === 'checkbox'
        ? [
            { valor: 'true',  rotulo: '✓ Sim' },
            { valor: 'false', rotulo: '✗ Não' },
          ]
        : undefined,
  }
}

/** Colunas de usuário disponíveis por aba (escopo pedido/item/ambos). */
export function construirCamposColunaUsuario(
  colunas: ColunaUsuario[],
  nivel: 'pedido' | 'item' | 'combinado',
  t: TFunc,
): DefinicaoCampo[] {
  const editaveis = colunas.filter(c => c.tipo !== 'formula') // fórmula é calculada
  if (nivel === 'pedido') {
    return editaveis.filter(c => c.escopo !== 'item').map(c => definicaoDeColunaUsuario(c, 'pedido', t))
  }
  if (nivel === 'item') {
    return editaveis.filter(c => c.escopo !== 'pedido').map(c => definicaoDeColunaUsuario(c, 'item', t))
  }
  // Combinado: escopo pedido|ambos entram no nível pedido; escopo item no nível item
  return [
    ...editaveis.filter(c => c.escopo !== 'item').map(c => definicaoDeColunaUsuario(c, 'pedido', t)),
    ...editaveis.filter(c => c.escopo === 'item').map(c => definicaoDeColunaUsuario(c, 'item', t)),
  ]
}

const OPERACOES_POR_TIPO: Record<TipoCampoEdicao, OperacaoCampo[]> = {
  texto:   ['substituir'],
  select:  ['substituir'],
  usuario: ['substituir'],
  ncm:     ['substituir'],
  numero:  ['substituir', 'somar', 'subtrair', 'percentual'],
  data:    ['substituir', 'avancar_dias', 'recuar_dias'],
}

/**
 * formataNcm — máscara de NCM (0000.00.00).
 * Recebe entrada bruta, descarta não-dígitos, limita a 8 dígitos e formata.
 */
function formataNcm(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 4) return d
  if (d.length <= 6) return `${d.slice(0, 4)}.${d.slice(4)}`
  return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6)}`
}

const OP_NOME_KEYS: Record<OperacaoCampo, string> = {
  substituir:   'pedido.modal_massa.op_substituir',
  somar:        'pedido.modal_massa.op_somar',
  subtrair:     'pedido.modal_massa.op_subtrair',
  percentual:   'pedido.modal_massa.op_percentual',
  avancar_dias: 'pedido.modal_massa.op_avancar_dias',
  recuar_dias:  'pedido.modal_massa.op_recuar_dias',
}

const OP_LABEL_KEYS: Record<OperacaoCampo, string> = {
  substituir:   'pedido.modal_massa.op_label_substituir',
  somar:        'pedido.modal_massa.op_label_somar',
  subtrair:     'pedido.modal_massa.op_label_subtrair',
  percentual:   'pedido.modal_massa.op_label_percentual',
  avancar_dias: 'pedido.modal_massa.op_label_avancar',
  recuar_dias:  'pedido.modal_massa.op_label_recuar',
}

// ── Campos com @@unique no schema — protegidos contra atribuição em massa ────
//
// Auditoria de unique constraints do Pedido (2026-05-12):
//   - Pedido.@@unique([id_organizacao, numero_pedido])
//   - Demais @@unique do schema estão em models de sistema/config não expostos
//     em edição em massa (StatusPedido, PreferenciaUsuarioColunaPedido,
//     KanbanPreferenciasGlobal, etc.)
//
// Regra: aplicar o mesmo valor a >1 pedido viola @@unique → P2002 no Postgres.
// Operação "substituir" com >1 pedido é IMPOSSÍVEL por design. Bloqueamos no
// frontend (input disabled + tooltip) e no backend (Zod custom 422 + try/catch
// P2002 como defesa em profundidade).
//
// **Convenção:** ao expor novo campo `@@unique` em CAMPOS_*_EDITAVEIS,
// adicionar a entrada aqui também.
// numero_pedido removido em 2026-05-25 — duplicatas permitidas com confirmação.
const CAMPOS_UNIQUE = new Set<string>([])

// Campos que exigem processamento individual por pedido (merge JSON no backend).
// SSOT compartilhado com o service — shared/camposEdicaoMassa.ts (Onda 3).
const CAMPOS_DETALHES_OPERACIONAIS_LENTO = CAMPOS_DETALHES_OPERACIONAIS

// ── Estado de um campo em edição ─────────────────────────────────────────────

interface CampoEmEdicao {
  uid: string             // chave única no UI (não é o campo em si)
  campo: string
  tipo: TipoCampoEdicao
  nivel: 'pedido' | 'item'
  operacao: OperacaoCampo
  valor: string
}

function criarCampoVazio(def: DefinicaoCampo): CampoEmEdicao {
  const operacoes = OPERACOES_POR_TIPO[def.tipo]
  return {
    uid: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    campo: def.campo,
    tipo: def.tipo,
    nivel: def.nivel,
    operacao: operacoes[0],
    valor: '',
  }
}

// ── Tipo de nível ─────────────────────────────────────────────────────────────

type NivelEdicao = 'pedido' | 'item' | 'combinado'

// ── Helpers ───────────────────────────────────────────────────────────────────

function detectarMultiplosValores(pedidos: Pedido[], campo: string): boolean {
  const valores = pedidos.map(p => String((p as Record<string, unknown>)[campo] ?? ''))
  return new Set(valores).size > 1
}

function inputPlaceholder(campo: CampoEmEdicao, pedidos: Pedido[], t: TFunc): string {
  if (campo.nivel === 'pedido' && detectarMultiplosValores(pedidos, campo.campo)) {
    return t('pedido.modal_massa.multiplos_valores')
  }
  return ''
}

interface OpcoesDinamicas {
  incoterms?: { valor: string; rotulo: string }[]
  coberturaCambial?: { valor: string; rotulo: string }[]
  modalidadePagamento?: { valor: string; rotulo: string }[]
  paises?: { valor: string; rotulo: string }[]
  paisesLogistica?: { valor: string; rotulo: string }[]
  portos?: { valor: string; rotulo: string }[]
  aeroportos?: { valor: string; rotulo: string }[]
  moedas?: { valor: string; rotulo: string }[]
  unidades?: { valor: string; rotulo: string }[]
  status?: { valor: string; rotulo: string }[]
}

const CAMPOS_PAIS = new Set(['pais_exportador', 'pais_fabricante', 'pais_ope'])
const CAMPOS_PAIS_LOGISTICA = new Set(['local_de_origem', 'local_de_destino'])
const CAMPOS_PORTO = new Set(['porto_origem', 'porto_destino'])
const CAMPOS_AEROPORTO = new Set(['aeroporto_origem', 'aeroporto_destino'])
const CAMPOS_MOEDA = new Set(['moeda_pedido', 'moeda_item', 'moeda_cambio_pedido'])
const CAMPOS_UNIDADE = new Set(['unidade_comercializada_pedido', 'unidade_comercializada_item'])

function injetarOpcoesDinamicas(campos: DefinicaoCampo[], opcoes: OpcoesDinamicas): DefinicaoCampo[] {
  return campos.map(d => {
    if ((d.campo === 'incoterm_pedido' || d.campo === 'incoterm_item') && opcoes.incoterms?.length) {
      return { ...d, opcoes: opcoes.incoterms }
    }
    if ((d.campo === 'cobertura_cambial_pedido' || d.campo === 'cobertura_cambial_item') && opcoes.coberturaCambial?.length) {
      return { ...d, opcoes: opcoes.coberturaCambial }
    }
    if ((d.campo === 'condicao_pagamento_siscomex_pedido' || d.campo === 'condicao_pagamento_siscomex_item') && opcoes.modalidadePagamento?.length) {
      return { ...d, opcoes: opcoes.modalidadePagamento }
    }
    if (CAMPOS_PAIS.has(d.campo) && opcoes.paises?.length) {
      return { ...d, opcoes: opcoes.paises }
    }
    if (CAMPOS_PAIS_LOGISTICA.has(d.campo) && opcoes.paisesLogistica?.length) {
      return { ...d, opcoes: opcoes.paisesLogistica }
    }
    if (CAMPOS_PORTO.has(d.campo) && opcoes.portos?.length) {
      return { ...d, opcoes: opcoes.portos }
    }
    if (CAMPOS_AEROPORTO.has(d.campo) && opcoes.aeroportos?.length) {
      return { ...d, opcoes: opcoes.aeroportos }
    }
    if (CAMPOS_MOEDA.has(d.campo) && opcoes.moedas?.length) {
      return { ...d, opcoes: opcoes.moedas }
    }
    if (CAMPOS_UNIDADE.has(d.campo) && opcoes.unidades?.length) {
      return { ...d, opcoes: opcoes.unidades }
    }
    if (d.campo === 'status_pedido' && opcoes.status?.length) {
      return { ...d, opcoes: opcoes.status }
    }
    return d
  })
}

function camposParaNivel(
  nivel: NivelEdicao,
  pedidos: Pedido[] = [],
  opcoesDinamicas: OpcoesDinamicas = {},
  t: TFunc,
  colunasUsuario: ColunaUsuario[] = [],
): DefinicaoCampo[] {
  const filtrar = (lista: DefinicaoCampo[]) =>
    lista.filter(d => !d.visivel || d.visivel(pedidos))
  const injetar = (lista: DefinicaoCampo[]) => injetarOpcoesDinamicas(filtrar(lista), opcoesDinamicas)
  const camposPedido = construirCamposPedidoEditaveis(t)
  const camposItem = construirCamposItemEditaveis(t)
  const personalizadas = construirCamposColunaUsuario(colunasUsuario, nivel, t)
  if (nivel === 'pedido')   return [...injetar(camposPedido), ...personalizadas]
  if (nivel === 'item')     return [...injetar(camposItem), ...personalizadas]
  return [...injetar([...camposPedido, ...camposItem]), ...personalizadas]
}

function estasBloqueado(campo: string, nivel: 'pedido' | 'item'): boolean {
  if (nivel === 'pedido') return CAMPOS_BLOQUEADOS_PEDIDO.has(campo)
  return CAMPOS_BLOQUEADOS_ITEM.has(campo)
}

function formatarValorExibicao(valor: string | number | null, t: TFunc): string {
  if (valor === null || valor === undefined || valor === '') return t('pedido.modal_massa.valor_vazio')
  return String(valor)
}

// ── ComboboxCampo — seletor de campo com busca ────────────────────────────────

interface ComboboxCampoProps {
  disponiveis: DefinicaoCampo[]
  valorAtual: string
  uid: string
  onChange: (uid: string, novoCampo: string) => void
}

function ComboboxCampo({ disponiveis, valorAtual, uid, onChange }: ComboboxCampoProps) {
  const { t } = useTranslation()
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const [indiceFocado, setIndiceFocado] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listaRef = useRef<HTMLUListElement>(null)

  const defAtual = disponiveis.find(d => d.campo === valorAtual)

  const filtrados = busca.trim() === ''
    ? disponiveis
    : disponiveis.filter(d =>
        d.rotulo.toLowerCase().includes(busca.toLowerCase()) ||
        d.campo.toLowerCase().includes(busca.toLowerCase()) ||
        (d.grupo ?? '').toLowerCase().includes(busca.toLowerCase())
      )

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickFora = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false)
        setBusca('')
      }
    }
    if (aberto) {
      document.addEventListener('mousedown', handleClickFora)
    }
    return () => document.removeEventListener('mousedown', handleClickFora)
  }, [aberto])

  // Scroll automático para item focado
  useEffect(() => {
    if (!aberto || !listaRef.current) return
    const item = listaRef.current.querySelector(`[data-index="${indiceFocado}"]`) as HTMLElement | null
    item?.scrollIntoView({ block: 'nearest' })
  }, [indiceFocado, aberto])

  // Resetar foco quando busca muda
  useEffect(() => {
    setIndiceFocado(0)
  }, [busca])

  const handleAbrirFechar = () => {
    const novoAberto = !aberto
    setAberto(novoAberto)
    setBusca('')
    if (novoAberto) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  const handleSelecionar = (campo: string) => {
    onChange(uid, campo)
    setAberto(false)
    setBusca('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setIndiceFocado(i => Math.min(i + 1, filtrados.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setIndiceFocado(i => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (filtrados[indiceFocado]) {
          handleSelecionar(filtrados[indiceFocado].campo)
        }
        break
      case 'Escape':
        e.preventDefault()
        e.stopPropagation()
        setAberto(false)
        setBusca('')
        break
    }
  }

  // Agrupar filtrados por grupo
  const grupos: { grupo: string; itens: DefinicaoCampo[] }[] = []
  filtrados.forEach(d => {
    const g = d.grupo ?? t('pedido.modal_massa.grupo_outros')
    const existing = grupos.find(grp => grp.grupo === g)
    if (existing) {
      existing.itens.push(d)
    } else {
      grupos.push({ grupo: g, itens: [d] })
    }
  })

  // Mapear índice global para cada item
  let globalIndex = 0
  const itemsComIndex = grupos.flatMap(g => g.itens.map(item => ({ ...item, globalIndex: globalIndex++ })))

  return (
    <div
      ref={containerRef}
      className="modal-edicao-massa__combobox"
      role="combobox"
      aria-expanded={aberto}
      aria-haspopup="listbox"
    >
      {/* Trigger */}
      <button
        type="button"
        className="modal-edicao-massa__combobox-trigger"
        onClick={handleAbrirFechar}
        aria-label={t('pedido.modal_massa.aria_selecionar_campo')}
      >
        <span className="modal-edicao-massa__combobox-valor">
          {defAtual ? (
            <>
              {defAtual.rotulo}
              {defAtual.nivel === 'item' && (
                <span className="modal-edicao-massa__combobox-badge">{t('pedido.modal_massa.badge_item')}</span>
              )}
            </>
          ) : (
            <span style={{ color: 'var(--color-text-muted, #64748b)' }}>{t('pedido.modal_massa.campo_placeholder')}</span>
          )}
        </span>
        <CaretDown
          size={12}
          className={`modal-edicao-massa__combobox-caret${aberto ? ' modal-edicao-massa__combobox-caret--aberto' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      {aberto && (
        <div className="modal-edicao-massa__combobox-dropdown">
          {/* Busca */}
          <div className="modal-edicao-massa__combobox-busca">
            <MagnifyingGlass size={13} className="modal-edicao-massa__combobox-busca-icone" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              className="modal-edicao-massa__combobox-busca-input"
              placeholder={t('pedido.modal_massa.buscar_campo')}
              value={busca}
              onChange={e => setBusca(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label={t('pedido.modal_massa.buscar_campo')}
              aria-autocomplete="list"
              autoComplete="off"
            />
          </div>

          {/* Lista */}
          {filtrados.length === 0 ? (
            <div className="modal-edicao-massa__combobox-vazio">
              {t('pedido.modal_massa.nenhum_campo')}
            </div>
          ) : (
            <ul
              ref={listaRef}
              className="modal-edicao-massa__combobox-lista"
              role="listbox"
              aria-label={t('pedido.modal_massa.aria_campos_disponiveis')}
            >
              {grupos.map(grupo => (
                <React.Fragment key={grupo.grupo}>
                  <li
                    className="modal-edicao-massa__combobox-grupo"
                    role="presentation"
                    aria-hidden="true"
                  >
                    {grupo.grupo}
                  </li>
                  {grupo.itens.map(item => {
                    const idx = itemsComIndex.find(i => i.campo === item.campo)?.globalIndex ?? 0
                    const selecionado = item.campo === valorAtual
                    const focado = idx === indiceFocado
                    return (
                      <li
                        key={item.campo}
                        data-index={idx}
                        role="option"
                        aria-selected={selecionado}
                        className={[
                          'modal-edicao-massa__combobox-item',
                          selecionado ? 'modal-edicao-massa__combobox-item--selecionado' : '',
                          focado ? 'modal-edicao-massa__combobox-item--focado' : '',
                        ].join(' ')}
                        onMouseDown={e => {
                          e.preventDefault()
                          handleSelecionar(item.campo)
                        }}
                        onMouseEnter={() => setIndiceFocado(idx)}
                      >
                        <span className="modal-edicao-massa__combobox-item-rotulo">{item.rotulo}</span>
                      </li>
                    )
                  })}
                </React.Fragment>
              ))}
            </ul>
          )}

          {/* Contador */}
          <div className="modal-edicao-massa__combobox-contador" aria-live="polite">
            {t('pedido.modal_massa.contador_campos', { count: filtrados.length })}
            {busca && ` ${t('pedido.modal_massa.para_termo', { termo: busca })}`}
          </div>
        </div>
      )}
    </div>
  )
}

// ── PreviewDePara — seção de-para colapsável ─────────────────────────────────

interface PreviewDeparaProps {
  preview: EdicaoMassaPreview
  disponiveis: DefinicaoCampo[]
}

function PreviewDepara({ preview, disponiveis }: PreviewDeparaProps) {
  const { t } = useTranslation()
  const [campoExpandido, setCampoExpandido] = useState<string | null>(null)

  if (!preview.por_pedido || preview.por_pedido.length === 0) return null

  // Coletar todos os campos únicos que têm alterações
  const camposComAlteracoes = preview.campos.map(c => c.campo)

  if (camposComAlteracoes.length === 0) return null

  const toggleCampo = (campo: string) => {
    setCampoExpandido(prev => prev === campo ? null : campo)
  }

  return (
    <div className="modal-edicao-massa__depara">
      <p className="modal-edicao-massa__depara-titulo">{t('pedido.modal_massa.depara_titulo')}</p>
      {camposComAlteracoes.map(campo => {
        const rotulo = disponiveis.find(d => d.campo === campo)?.rotulo ?? campo
        const expandido = campoExpandido === campo

        const linhas = preview.por_pedido!.flatMap(pp =>
          pp.alteracoes
            .filter(a => a.campo === campo)
            .map(a => ({ pedido_id: pp.pedido_id, numero_pedido: pp.numero_pedido, ...a }))
        )

        if (linhas.length === 0) return null

        const semAlteracao = linhas.filter(l =>
          String(l.valor_atual ?? '') === String(l.valor_novo ?? '')
        ).length

        return (
          <div key={campo} className="modal-edicao-massa__depara-campo">
            <button
              type="button"
              className="modal-edicao-massa__depara-campo-header"
              onClick={() => toggleCampo(campo)}
              aria-expanded={expandido}
              aria-controls={`depara-${campo}`}
            >
              <span className="modal-edicao-massa__depara-campo-caret" aria-hidden="true">
                {expandido ? <CaretDown size={12} /> : <CaretRight size={12} />}
              </span>
              <span className="modal-edicao-massa__depara-campo-nome">{rotulo}</span>
              <span className="modal-edicao-massa__depara-campo-stat">
                {t('pedido.modal_massa.depara_alteracoes_count', { count: linhas.length - semAlteracao })}
                {semAlteracao > 0 && ` · ${semAlteracao} ${t('pedido.modal_massa.depara_sem_alteracao')}`}
              </span>
            </button>

            {expandido && (
              <ul
                id={`depara-${campo}`}
                className="modal-edicao-massa__depara-lista"
                aria-label={t('pedido.modal_massa.depara_aria_lista', { rotulo })}
              >
                {linhas.map(linha => {
                  const semMudanca = String(linha.valor_atual ?? '') === String(linha.valor_novo ?? '')
                  return (
                    <li
                      key={linha.pedido_id}
                      className={`modal-edicao-massa__depara-linha${semMudanca ? ' modal-edicao-massa__depara-linha--igual' : ''}`}
                    >
                      <span className="modal-edicao-massa__depara-linha-numero">
                        {linha.numero_pedido}
                      </span>
                      <span className="modal-edicao-massa__depara-linha-de">
                        &ldquo;{formatarValorExibicao(linha.valor_atual, t)}&rdquo;
                      </span>
                      <span className="modal-edicao-massa__depara-linha-seta" aria-hidden="true">→</span>
                      <span className={`modal-edicao-massa__depara-linha-para${semMudanca ? ' modal-edicao-massa__depara-linha-para--igual' : ''}`}>
                        &ldquo;{formatarValorExibicao(linha.valor_novo, t)}&rdquo;
                      </span>
                      {semMudanca && (
                        <span className="modal-edicao-massa__depara-linha-badge">{t('pedido.modal_massa.depara_sem_alteracao')}</span>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Select buscável para campos com muitas opções (países, moedas, unidades) ─

function SelectBuscavelValor({
  opcoes,
  valor,
  disabled,
  placeholder,
  onChange,
}: {
  opcoes: { valor: string; rotulo: string }[]
  valor: string
  disabled?: boolean
  placeholder?: string
  onChange: (v: string) => void
}) {
  const { t } = useTranslation()
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  const filtradas = busca.trim() === ''
    ? opcoes
    : opcoes.filter(o =>
        o.rotulo.toLowerCase().includes(busca.toLowerCase()) ||
        o.valor.toLowerCase().includes(busca.toLowerCase())
      )

  const rotuloSelecionado = opcoes.find(o => o.valor === valor)?.rotulo

  useEffect(() => {
    if (!aberto) return
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setAberto(false)
        setBusca('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [aberto])

  return (
    <div ref={wrapperRef} className="modal-edicao-massa__select-buscavel" style={{ position: 'relative' }}>
      <button
        type="button"
        className="modal-edicao-massa__select"
        disabled={disabled}
        onClick={() => { setAberto(!aberto); setBusca('') }}
        style={{ textAlign: 'left', cursor: disabled ? 'not-allowed' : 'pointer', width: '100%' }}
      >
        {rotuloSelecionado || <span style={{ color: 'var(--text-muted, #94a3b8)' }}>{placeholder}</span>}
      </button>
      {aberto && (
        <div className="modal-edicao-massa__select-buscavel-dropdown" style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999,
          background: 'var(--bg-base, #1e293b)', border: '1.5px solid rgba(129,140,248,.25)',
          borderRadius: '8px', marginTop: '4px',
          boxShadow: '0 16px 48px rgba(0,0,0,.65), 0 4px 16px rgba(0,0,0,.4)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '0.5rem', borderBottom: '1px solid rgba(129,140,248,.15)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <MagnifyingGlass size={14} style={{ color: 'var(--text-muted, #94a3b8)', flexShrink: 0 }} />
            <input
              autoFocus
              className="modal-edicao-massa__input"
              style={{ border: 'none', padding: '0.25rem 0', background: 'transparent', flex: 1 }}
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder={t('pedido.modal_massa.buscar_placeholder')}
            />
          </div>
          <ul style={{
            listStyle: 'none', margin: 0, padding: '0.25rem',
            maxHeight: '220px', overflowY: 'auto',
            scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,.1) transparent',
          }}>
            {filtradas.length === 0 && (
              <li style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted, #94a3b8)', fontSize: '0.875rem' }}>
                {t('pedido.modal_massa.nenhum_resultado')}
              </li>
            )}
            {filtradas.map(o => (
              <li
                key={o.valor}
                onClick={() => { onChange(o.valor); setAberto(false); setBusca('') }}
                style={{
                  padding: '0.5rem 0.75rem', borderRadius: '6px', cursor: 'pointer',
                  fontSize: '0.875rem', color: 'var(--text-primary, #f1f5f9)',
                  background: o.valor === valor ? 'rgba(129,140,248,.12)' : undefined,
                }}
                onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,.05)' }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = o.valor === valor ? 'rgba(129,140,248,.12)' : '' }}
              >
                {o.rotulo}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ── Tradução de mensagens técnicas → amigáveis ──────────────────────────────

function construirMensagensAmigaveis(t: TFunc): [RegExp, string][] { return [
  [/x-id-workspace ausente/i, t('pedido.modal_massa.erro_sem_workspace')],
  [/Portão \d/i, ''],
  [/WORKSPACE_NAO_INFORMADO/i, t('pedido.modal_massa.erro_sem_workspace')],
  [/VALIDATION_ERROR/i, ''],
  [/Transaction.*not found|Transaction.*timed?\s*out|P2024|Transaction.*expired/i, t('pedido.modal_massa.erro_demorou')],
  [/INTERNAL_ERROR|Erro interno/i, t('pedido.modal_massa.erro_inesperado')],
  [/Can't reach database|ECONNREFUSED|Connection.*refused/i, t('pedido.modal_massa.erro_sem_conexao')],
  [/timeout|ETIMEDOUT/i, t('pedido.modal_massa.erro_demorou')],
] }

// ── Estilos compartilhados (padrão Consolidar) ──────────────────────────────

const emEstilos = {
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.625rem',
  } as React.CSSProperties,
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 0.875rem',
    background: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(99, 102, 241, 0.12)',
    borderRadius: 'var(--radius-md)',
    cursor: 'default',
    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
  } as React.CSSProperties,
  statValor: {
    display: 'block',
    fontSize: '1.375rem',
    fontWeight: 800,
    color: '#fff',
    lineHeight: 1.2,
    marginBottom: '0.25rem',
  } as React.CSSProperties,
  statLabel: {
    display: 'block',
    fontSize: '0.6875rem',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    fontWeight: 600,
  } as React.CSSProperties,
  tooltipRico: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.375rem',
    minWidth: '160px',
  } as React.CSSProperties,
  tooltipCategoria: {
    display: 'block',
    fontSize: '0.625rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: '0.125rem',
  } as React.CSSProperties,
  tooltipLinha: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    fontSize: '0.8125rem',
    color: 'var(--text-secondary)',
  } as React.CSSProperties,
  tooltipValor: {
    fontWeight: 700,
    color: 'var(--text-primary)',
    fontVariantNumeric: 'tabular-nums',
  } as React.CSSProperties,
}

function traduzirErro(mensagem: string, t: TFunc): string {
  for (const [regex, amigavel] of construirMensagensAmigaveis(t)) {
    if (regex.test(mensagem)) {
      return amigavel || mensagem
    }
  }
  return mensagem
}

// ── Componente principal ──────────────────────────────────────────────────────

export function ModalEdicaoMassaPedidos({ pedidos, itensSelecionadosIds, pedidoIdsCompleto, onFechar, onConcluido }: ModalEdicaoMassaPedidosProps) {
  const { t } = useTranslation()
  const { addNotification } = useShellStore()
  const hasMixedTipos = useHasMixedTipos()
  const { incotermsOpcoes, loading: incotermLoading, erro: incotermErro } = useIncotermsPedido()
  const { coberturaCambialOpcoes, modalidadePagamentoOpcoes } = useCambioSiscomexPedido()
  const { moedasOpcoes } = useMoedasPedido()
  const { unidadesComercializadas } = useUnidadesPedido()
  const {
    paisesOpcoes: paisesLogisticaOpcoes,
    portosOpcoes,
    aeroportosOpcoes,
  } = useLogisticaCadastrosPedido()
  const [paisesOpcoes, setPaisesOpcoes] = useState<{ valor: string; rotulo: string }[]>([])
  const [statusOpcoes, setStatusOpcoes] = useState<{ valor: string; rotulo: string }[]>([])
  // Colunas criadas pelo usuário (Onda 3) — editáveis em massa via EAV
  const [colunasUsuario, setColunasUsuario] = useState<ColunaUsuario[]>([])
  useEffect(() => {
    cadastrosApi.listarPaises()
      .then(r => setPaisesOpcoes(r.itens.map(p => ({
        valor: p.nome_pais_portugues,
        rotulo: `${p.nome_pais_portugues}${p.codigo_pais_iso_alpha2 ? ` (${p.codigo_pais_iso_alpha2})` : ''}`,
      }))))
      .catch(() => {})
    pedidoConfigApi.listarStatus()
      .then(r => setStatusOpcoes(r.data.map(s => ({ valor: s.nome, rotulo: s.rotulo }))))
      .catch(() => {})
    colunasUsuarioApi.listar()
      .then(setColunasUsuario)
      .catch(() => {})
  }, [])
  const opcoesDinamicas: OpcoesDinamicas = {
    incoterms: incotermsOpcoes.map(o => ({ valor: o.valor, rotulo: o.label })),
    coberturaCambial: coberturaCambialOpcoes.map(o => ({ valor: o.valor, rotulo: o.label })),
    modalidadePagamento: modalidadePagamentoOpcoes.map(o => ({ valor: o.valor, rotulo: o.label })),
    paises: paisesOpcoes,
    paisesLogistica: paisesLogisticaOpcoes.map(o => ({ valor: o.valor, rotulo: o.label })),
    portos: portosOpcoes.map(o => ({ valor: o.valor, rotulo: o.label })),
    aeroportos: aeroportosOpcoes.map(o => ({ valor: o.valor, rotulo: o.label })),
    moedas: moedasOpcoes.map(o => ({ valor: o.valor, rotulo: o.label })),
    unidades: unidadesComercializadas.map(o => ({ valor: o.sigla, rotulo: o.rotulo })),
    status: statusOpcoes,
  }
  const [passo, setPasso] = useState<1 | 2 | 3>(1)
  const [resultado, setResultado] = useState<EdicaoMassaResultado | null>(null)
  const [nivel, setNivel] = useState<NivelEdicao>('combinado')
  const [campos, setCampos] = useState<CampoEmEdicao[]>([])
  const [preview, setPreview] = useState<EdicaoMassaPreview | null>(null)
  const [carregandoPreview, setCarregandoPreview] = useState(false)
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroSalvar, setErroSalvar] = useState<string | null>(null)
  const [feedbackBotao, setFeedbackBotao] = useState<ResultadoAcao>(null)
  // Passo 2: filtros e seletor de pedido
  const [filtroRevisao, setFiltroRevisao] = useState<'todos' | 'alterados' | 'sem-efeito'>('todos')
  const [filtroPedido, setFiltroPedido] = useState<string | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Inicializar com primeiro campo disponível
  useEffect(() => {
    const disponiveis = camposParaNivel(nivel, pedidos, opcoesDinamicas, t, colunasUsuario)
    if (disponiveis.length > 0) {
      setCampos([criarCampoVazio(disponiveis[0])])
    }
    setPreview(null)
  }, [nivel])

  // Fechar com Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onFechar])

  // Preview em tempo real com debounce 300ms
  const solicitarPreview = useCallback(() => {
    const camposValidos = campos.filter(c => c.valor.trim() !== '' && !estasBloqueado(c.campo, c.nivel))
    if (camposValidos.length === 0) {
      setPreview(null)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      setCarregandoPreview(true)
      try {
        const payload: EdicaoMassaPayload = {
          pedido_ids: pedidos.map(p => p.id),
          // Quando itens específicos foram selecionados, enviar seus IDs para preview
          ...(itensSelecionadosIds && itensSelecionadosIds.length > 0
            ? { item_ids: itensSelecionadosIds }
            : {}),
          ...(pedidoIdsCompleto && pedidoIdsCompleto.length > 0
            ? { pedido_ids_completo: pedidoIdsCompleto }
            : {}),
          campos: camposValidos.map(c => ({
            campo: c.campo,
            tipo: c.tipo,
            nivel: c.nivel,
            operacao: c.operacao,
            valor: c.tipo === 'numero' || c.operacao !== 'substituir' ? Number(c.valor) : c.valor,
          })),
          nivel,
        }
        const result = await pedidoEdicaoMassaApi.preview(payload)
        setPreview(result)
        setErroGeral(null)
      } catch (err: unknown) {
        setErroGeral(traduzirErro(err instanceof Error ? err.message : t('pedido.modal_massa.erro_preview'), t))
      } finally {
        setCarregandoPreview(false)
      }
    }, 300)
  }, [campos, pedidos, nivel])

  // Reacionar a mudanças nos campos
  useEffect(() => {
    solicitarPreview()
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [solicitarPreview])

  // ── Handlers de campos ───────────────────────────────────────────────────────

  const handleAdicionarCampo = useCallback(() => {
    const disponiveis = camposParaNivel(nivel, pedidos, opcoesDinamicas, t, colunasUsuario)
    if (disponiveis.length > 0) {
      setCampos(prev => [...prev, criarCampoVazio(disponiveis[0])])
    }
  }, [nivel, colunasUsuario])

  const handleRemoverCampo = useCallback((uid: string) => {
    setCampos(prev => prev.filter(c => c.uid !== uid))
  }, [])

  const handleMudarCampoDef = useCallback((uid: string, novoCampo: string) => {
    const disponiveis = camposParaNivel(nivel, pedidos, opcoesDinamicas, t, colunasUsuario)
    const def = disponiveis.find(d => d.campo === novoCampo)
    if (!def) return
    setCampos(prev => prev.map(c => {
      if (c.uid !== uid) return c
      const ops = OPERACOES_POR_TIPO[def.tipo]
      return { ...c, campo: def.campo, tipo: def.tipo, nivel: def.nivel, operacao: ops[0], valor: '' }
    }))
  }, [nivel, colunasUsuario])

  const handleMudarOperacao = useCallback((uid: string, operacao: OperacaoCampo) => {
    setCampos(prev => prev.map(c => c.uid === uid ? { ...c, operacao } : c))
  }, [])

  const handleMudarValor = useCallback((uid: string, valor: string) => {
    setCampos(prev => prev.map(c => c.uid === uid ? { ...c, valor } : c))
  }, [])

  // ── Avancar para passo 2 ──────────────────────────────────────────────────────

  const handleAvancar = useCallback(() => {
    const camposValidos = campos.filter(c => c.valor.trim() !== '')
    if (camposValidos.length === 0) {
      setErroGeral(t('pedido.modal_massa.erro_campo_obrigatorio'))
      return
    }
    setErroGeral(null)
    setPasso(2)
  }, [campos])

  // ── Confirmar edição em massa ─────────────────────────────────────────────────

  const handleConfirmar = useCallback(async () => {
    const camposValidos = campos.filter(c => c.valor.trim() !== '' && !estasBloqueado(c.campo, c.nivel))
    if (camposValidos.length === 0) return

    setSalvando(true)
    setErroSalvar(null)

    const payload: EdicaoMassaPayload = {
      pedido_ids: pedidos.map(p => p.id),
      // Quando itens específicos foram selecionados, enviar seus IDs para que
      // o backend edite APENAS estes itens (e não todos os itens dos pedidos).
      ...(itensSelecionadosIds && itensSelecionadosIds.length > 0
        ? { item_ids: itensSelecionadosIds }
        : {}),
      ...(pedidoIdsCompleto && pedidoIdsCompleto.length > 0
        ? { pedido_ids_completo: pedidoIdsCompleto }
        : {}),
      campos: camposValidos.map(c => ({
        campo: c.campo,
        tipo: c.tipo,
        nivel: c.nivel,
        operacao: c.operacao,
        valor: c.tipo === 'numero' || c.operacao !== 'substituir' ? Number(c.valor) : c.valor,
      })),
      nivel,
    }

    try {
      const result = await pedidoEdicaoMassaApi.confirmar(payload)
      setSalvando(false)
      setFeedbackBotao('sucesso')
      setResultado(result)
      await new Promise(r => setTimeout(r, 1200))
      setFeedbackBotao(null)
      setPasso(3)
      return
    } catch (err: unknown) {
      const msg = traduzirErro(err instanceof Error ? err.message : t('pedido.modal_massa.erro_aplicar'), t)
      setSalvando(false)
      setFeedbackBotao('erro')
      setErroSalvar(msg)
      addNotification({ type: 'error', message: t('pedido.modal_massa.notif_falha', { msg }), duration: 4000 })
      setTimeout(() => { setFeedbackBotao(null) }, 1500)
      return
    }
  }, [campos, pedidos, nivel, onConcluido, addNotification])

  // ── Render helpers ────────────────────────────────────────────────────────────

  const camposValidos = campos.filter(c => c.valor.trim() !== '')
  const disponiveis = camposParaNivel(nivel, pedidos, opcoesDinamicas, t, colunasUsuario)

  // Algum campo está bloqueado por @@unique (substituir + >1 pedido)?
  // Se sim, bloqueia o botão de revisar/aplicar para falhar ruidoso.
  const temCampoUniqueBloqueado = campos.some(c =>
    CAMPOS_UNIQUE.has(c.campo) && c.operacao === 'substituir' && pedidos.length > 1,
  )

  // Detecta caminho lento: espelha a lógica do backend (todosCamposPedidoSaoRapidos).
  // Lento = qualquer campo com operação diferente de substituir, campo em
  // detalhes_operacionais, ou qualquer campo de nível item.
  const isCaminhoLento = camposValidos.some(c =>
    c.nivel === 'item' ||
    c.operacao !== 'substituir' ||
    CAMPOS_DETALHES_OPERACIONAIS_LENTO.has(c.campo),
  )
  const estimadoSegundos = Math.max(5, Math.round(pedidos.length * 0.5))
  const mostrarAvisoPerformance = isCaminhoLento && pedidos.length > 5

  const renderPasso1 = () => (
    <>
      {/* Toggle de nível */}
      <div className="em-secao">
        <span className="em-secao-titulo">{t('pedido.modal_massa.nivel_titulo')}</span>
        <div className="modal-edicao-massa__nivel-toggle" role="group" aria-label={t('pedido.modal_massa.aria_nivel_edicao')}>
          {(['combinado', 'pedido', 'item'] as NivelEdicao[]).map(n => (
            <button
              key={n}
              type="button"
              className={`modal-edicao-massa__nivel-btn${nivel === n ? ' modal-edicao-massa__nivel-btn--ativo' : ''}`}
              onClick={() => setNivel(n)}
              aria-pressed={nivel === n}
            >
              {n === 'pedido' ? t('pedido.modal_massa.nivel_pedido') : n === 'item' ? t('pedido.modal_massa.nivel_item') : t('pedido.modal_massa.nivel_combinado')}
            </button>
          ))}
        </div>
      </div>

      <div className="modal-edicao-massa__separador" role="separator" />

      {incotermErro && (
        <div className="modal-edicao-massa__aviso modal-edicao-massa__aviso--warn" role="alert">
          <Warning size={16} weight="bold" />
          <span>{t('pedido.modal_massa.incoterms_indisponiveis', { erro: incotermErro })}</span>
        </div>
      )}

      {/* Lista de campos */}
      <div className="em-secao">
        <span className="em-secao-titulo">{t('pedido.modal_massa.secao_campos')}</span>
        <div className="modal-edicao-massa__campos-lista">
          {campos.map(campo => {
            const ops = OPERACOES_POR_TIPO[campo.tipo]
            const temMultiplos = campo.nivel === 'pedido' && detectarMultiplosValores(pedidos, campo.campo)
            const placeholder = inputPlaceholder(campo, pedidos, t)
            // Campo @@unique + substituir + >1 pedido = colisão garantida (P2002).
            // Bloqueia o input no frontend e avisa o usuário.
            const bloqueadoUnique =
              CAMPOS_UNIQUE.has(campo.campo) &&
              campo.operacao === 'substituir' &&
              pedidos.length > 1
            const tooltipUnique = bloqueadoUnique
              ? t('pedido.modal_massa.tooltip_unique', { rotulo: disponiveis.find(d => d.campo === campo.campo)?.rotulo ?? campo.campo })
              : undefined

            return (
              <div key={campo.uid} className="modal-edicao-massa__campo-linha">
                {/* Seletor de campo — combobox com busca */}
                <ComboboxCampo
                  disponiveis={disponiveis}
                  valorAtual={campo.campo}
                  uid={campo.uid}
                  onChange={handleMudarCampoDef}
                />

                {/* Seletor de operação */}
                <SelectGlobal
                  buscavel={false}
                  tamanho="compacto"
                  opcoes={ops.map(op => ({ valor: op, rotulo: t(OP_NOME_KEYS[op]) }))}
                  valor={campo.operacao}
                  aoMudarValor={v => v != null && handleMudarOperacao(campo.uid, v as OperacaoCampo)}
                  aria-label={t('pedido.modal_massa.aria_operacao_para', { campo: campo.campo })}
                />

                {/* Input de valor — renderiza por tipo do campo */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }} title={tooltipUnique}>
                  {campo.tipo === 'select' ? (() => {
                    const def = disponiveis.find(d => d.campo === campo.campo)
                    const opcoes = def?.opcoes ?? []
                    const semOpcoesDinamicas = opcoes.length === 0 && (
                      campo.campo === 'incoterm_pedido' || campo.campo === 'incoterm_item' ||
                      CAMPOS_PAIS.has(campo.campo) || CAMPOS_PAIS_LOGISTICA.has(campo.campo) || CAMPOS_PORTO.has(campo.campo) || CAMPOS_AEROPORTO.has(campo.campo) || CAMPOS_MOEDA.has(campo.campo) || CAMPOS_UNIDADE.has(campo.campo)
                    )
                    if (opcoes.length > 10) {
                      return (
                        <SelectBuscavelValor
                          opcoes={opcoes}
                          valor={campo.valor}
                          disabled={bloqueadoUnique}
                          placeholder={t('pedido.modal_massa.valor_placeholder')}
                          onChange={v => handleMudarValor(campo.uid, v)}
                        />
                      )
                    }
                    return (
                      <SelectGlobal
                        buscavel={false}
                        tamanho="compacto"
                        desabilitado={bloqueadoUnique || semOpcoesDinamicas}
                        carregando={semOpcoesDinamicas}
                        placeholder={semOpcoesDinamicas ? t('comum.carregando') : t('pedido.modal_massa.valor_placeholder')}
                        opcoes={opcoes.map(o => ({ valor: o.valor, rotulo: o.rotulo }))}
                        valor={campo.valor || null}
                        aoMudarValor={v => handleMudarValor(campo.uid, v != null ? String(v) : '')}
                        aria-label={t('pedido.modal_massa.aria_valor_para', { campo: campo.campo })}
                      />
                    )
                  })() : campo.tipo === 'ncm' ? (
                    <input
                      className="modal-edicao-massa__input"
                      type="text"
                      inputMode="numeric"
                      value={campo.valor}
                      disabled={bloqueadoUnique}
                      onChange={e => handleMudarValor(campo.uid, formataNcm(String(e.target.value)))}
                      placeholder="0000.00.00"
                      maxLength={10}
                      aria-label={t('pedido.modal_massa.aria_valor_para', { campo: campo.campo })}
                      style={{ fontFamily: 'var(--font-mono, monospace)' }}
                    />
                  ) : (
                    <input
                      className="modal-edicao-massa__input"
                      type={campo.tipo === 'data' && campo.operacao === 'substituir' ? 'date'
                        : campo.tipo === 'numero' || campo.operacao !== 'substituir' ? 'number'
                        : 'text'}
                      value={campo.valor}
                      disabled={bloqueadoUnique}
                      onChange={e => handleMudarValor(campo.uid, e.target.value)}
                      placeholder={bloqueadoUnique ? t('pedido.modal_massa.bloqueado_unique') : (placeholder || t('pedido.modal_massa.valor_placeholder'))}
                      aria-label={t('pedido.modal_massa.aria_valor_para', { campo: campo.campo })}
                    />
                  )}
                  {bloqueadoUnique && (
                    <span className="modal-edicao-massa__badge-multiplos" style={{ color: 'var(--danger, #ef4444)' }}>
                      <Warning size={11} weight="fill" aria-hidden="true" />
                      {t('pedido.modal_massa.badge_unique_org')}
                    </span>
                  )}
                  {temMultiplos && !bloqueadoUnique && (
                    <span className="modal-edicao-massa__badge-multiplos">
                      <Warning size={11} weight="fill" aria-hidden="true" />
                      {t('pedido.modal_massa.multiplos_valores')}
                    </span>
                  )}
                </div>

                {/* Botão remover */}
                {campos.length > 1 && (
                  <button
                    type="button"
                    className="modal-edicao-massa__remover-campo"
                    onClick={() => handleRemoverCampo(campo.uid)}
                    aria-label={t('pedido.modal_massa.aria_remover_campo', { campo: campo.campo })}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Botão adicionar campo */}
        <button
          type="button"
          className="modal-edicao-massa__adicionar-campo"
          onClick={handleAdicionarCampo}
        >
          <Plus size={14} />
          {t('pedido.modal_massa.adicionar_campo')}
        </button>
      </div>

      <div className="modal-edicao-massa__separador" role="separator" />

      {/* Preview em tempo real */}
      <div className="em-secao" aria-live="polite">
        <span className="em-secao-titulo">{t('pedido.modal_massa.preview_titulo')}</span>

        {carregandoPreview ? (
          <div className="modal-edicao-massa__preview-loading">
            <Spinner size={14} className="modal-edicao-massa__spinner" aria-hidden="true" />
            <span>{t('pedido.modal_massa.preview_calculando')}</span>
          </div>
        ) : preview ? (
          <>
            {/* Stat cards glassmorphism — padrão Consolidar */}
            {(() => {
              // Calcular pedidos inteiros vs parciais (mesma lógica do Consolidar)
              const totalItens = pedidos.reduce((acc, p) => acc + (p.itens?.length ?? 0), 0)
              const temSelecaoItens = itensSelecionadosIds && itensSelecionadosIds.length > 0
              const pedidoIdsCompletoSet = pedidoIdsCompleto ? new Set(pedidoIdsCompleto) : null

              const inteiros: Array<{ numero: string; itens: number }> = []
              const parciais: Array<{ numero: string; itensSel: number; itensTotal: number }> = []

              if (!temSelecaoItens) {
                // Sem seleção de itens específicos → todos os pedidos são inteiros
                for (const p of pedidos) {
                  inteiros.push({ numero: p.numero_pedido, itens: p.itens?.length ?? 0 })
                }
              } else {
                const itensSel = new Set(itensSelecionadosIds)
                for (const p of pedidos) {
                  const totalPedido = p.itens?.length ?? 0
                  if (pedidoIdsCompletoSet?.has(p.id)) {
                    inteiros.push({ numero: p.numero_pedido, itens: totalPedido })
                  } else {
                    const qtdSelecionada = p.itens?.filter(i => itensSel.has(i.id)).length ?? 0
                    if (qtdSelecionada >= totalPedido) {
                      inteiros.push({ numero: p.numero_pedido, itens: totalPedido })
                    } else {
                      parciais.push({ numero: p.numero_pedido, itensSel: qtdSelecionada, itensTotal: totalPedido })
                    }
                  }
                }
              }

              return (
                <div data-em-stats style={emEstilos.statsGrid}>
                  {/* Card 1 — Pedidos */}
                  <TooltipGlobal
                    titulo={t('pedido.modal_massa.stat_pedidos_titulo')}
                    descricao={
                      <div style={emEstilos.tooltipRico}>
                        <span style={emEstilos.tooltipCategoria}>{t('pedido.modal_massa.stat_categoria_edicao')}</span>
                        <div style={emEstilos.tooltipLinha}><span>{t('pedido.modal_massa.stat_selecionados')}</span><span style={emEstilos.tooltipValor}>{pedidos.length}</span></div>
                        <div style={emEstilos.tooltipLinha}><span>{t('pedido.modal_massa.stat_afetados')}</span><span style={emEstilos.tooltipValor}>{preview.pedidos_afetados}</span></div>
                      </div>
                    }
                  >
                    <div style={{ ...emEstilos.statCard, borderTop: '2px solid rgba(148,163,184,0.3)' }}>
                      <Package size={20} weight="duotone" style={{ color: '#94a3b8' }} />
                      <div>
                        <span style={emEstilos.statValor}>{pedidos.length}</span>
                        <span style={emEstilos.statLabel}>{t('pedido.modal_massa.stat_label_pedidos')}</span>
                      </div>
                    </div>
                  </TooltipGlobal>

                  {/* Card 2 — Itens */}
                  <TooltipGlobal
                    titulo={t('pedido.modal_massa.stat_itens_titulo')}
                    descricao={
                      <div style={emEstilos.tooltipRico}>
                        <span style={emEstilos.tooltipCategoria}>{t('pedido.modal_massa.stat_categoria_itens')}</span>
                        <div style={emEstilos.tooltipLinha}><span>{t('pedido.modal_massa.stat_total')}</span><span style={emEstilos.tooltipValor}>{totalItens}</span></div>
                        <div style={emEstilos.tooltipLinha}><span>{t('pedido.modal_massa.stat_de_pedidos')}</span><span style={emEstilos.tooltipValor}>{pedidos.length}</span></div>
                      </div>
                    }
                  >
                    <div style={{ ...emEstilos.statCard, borderTop: '2px solid rgba(148,163,184,0.3)' }}>
                      <ListChecks size={20} weight="duotone" style={{ color: '#94a3b8' }} />
                      <div>
                        <span style={emEstilos.statValor}>{totalItens}</span>
                        <span style={emEstilos.statLabel}>{t('pedido.modal_massa.stat_label_itens')}</span>
                      </div>
                    </div>
                  </TooltipGlobal>

                  {/* Card 3 — Pedidos Inteiros */}
                  <TooltipGlobal
                    titulo={t('pedido.modal_massa.stat_inteiros_titulo')}
                    descricao={
                      <div style={emEstilos.tooltipRico}>
                        <span style={emEstilos.tooltipCategoria}>{t('pedido.modal_massa.stat_categoria_todos_itens')}</span>
                        {inteiros.map(p => (
                          <div key={p.numero} style={emEstilos.tooltipLinha}>
                            <span>{p.numero}</span>
                            <span style={emEstilos.tooltipValor}>{t('pedido.modal_massa.stat_itens_count', { count: p.itens })}</span>
                          </div>
                        ))}
                        {inteiros.length === 0 && (
                          <div style={{ fontSize: '0.75rem', color: '#475569' }}>{t('pedido.modal_massa.stat_nenhum_inteiro')}</div>
                        )}
                      </div>
                    }
                  >
                    <div style={{ ...emEstilos.statCard, borderTop: '2px solid rgba(74,222,128,0.4)' }}>
                      <Package size={20} weight="duotone" style={{ color: '#4ade80' }} />
                      <div>
                        <span style={emEstilos.statValor}>{inteiros.length}</span>
                        <span style={emEstilos.statLabel}>{t('pedido.modal_massa.stat_label_inteiros')}</span>
                      </div>
                    </div>
                  </TooltipGlobal>

                  {/* Card 4 — Pedidos Parciais */}
                  <TooltipGlobal
                    titulo={t('pedido.modal_massa.stat_parciais_titulo')}
                    descricao={
                      <div style={emEstilos.tooltipRico}>
                        <span style={emEstilos.tooltipCategoria}>{t('pedido.modal_massa.stat_categoria_alguns_itens')}</span>
                        {parciais.map(p => (
                          <div key={p.numero} style={emEstilos.tooltipLinha}>
                            <span>{p.numero}</span>
                            <span style={{ ...emEstilos.tooltipValor, color: '#fbbf24' }}>{t('pedido.modal_massa.stat_itens_fracao', { sel: p.itensSel, total: p.itensTotal })}</span>
                          </div>
                        ))}
                        {parciais.length === 0 && (
                          <div style={{ fontSize: '0.75rem', color: '#475569' }}>{t('pedido.modal_massa.stat_nenhum_parcial')}</div>
                        )}
                      </div>
                    }
                  >
                    <div style={{ ...emEstilos.statCard, borderTop: `2px solid ${parciais.length > 0 ? 'rgba(251,191,36,0.4)' : 'rgba(148,163,184,0.3)'}` }}>
                      <CubeTransparent size={20} weight="duotone" style={{ color: parciais.length > 0 ? '#fbbf24' : '#94a3b8' }} />
                      <div>
                        <span style={emEstilos.statValor}>{parciais.length}</span>
                        <span style={emEstilos.statLabel}>{t('pedido.modal_massa.stat_label_parciais')}</span>
                      </div>
                    </div>
                  </TooltipGlobal>
                </div>
              )
            })()}

            {preview.campos.length > 0 && (
              <div className="modal-edicao-massa__preview-campos">
                {preview.campos.map((c, i) => (
                  <div key={i} className="modal-edicao-massa__preview-campo">
                    <span className="modal-edicao-massa__preview-campo-nome">
                      {disponiveis.find(d => d.campo === c.campo)?.rotulo ?? c.campo}
                    </span>
                    <span className="modal-edicao-massa__preview-campo-op">
                      {t(OP_LABEL_KEYS[c.operacao])}
                    </span>
                    <span className="modal-edicao-massa__preview-campo-valor">{disponiveis.find(d => d.campo === c.campo)?.opcoes?.find(o => o.valor === String(c.valor))?.rotulo ?? String(c.valor)}</span>
                    {c.multiplos_valores && (
                      <span className="modal-edicao-massa__badge-multiplos">
                        <Warning size={11} weight="fill" aria-hidden="true" />
                        {t('pedido.modal_massa.multiplos_valores')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Detalhe de/para por pedido */}
            <PreviewDepara preview={preview} disponiveis={disponiveis} />

            {preview.alertas_globais.length > 0 && preview.alertas_globais.map((alerta, i) => (
              <div key={i} className="modal-edicao-massa__alerta">
                <Warning size={14} weight="fill" aria-hidden="true" />
                {alerta}
              </div>
            ))}
          </>
        ) : (
          <span style={{ fontSize: 13, color: 'var(--color-text-muted, #64748b)' }}>
            {t('pedido.modal_massa.preview_vazio')}
          </span>
        )}
      </div>

      {erroGeral && (
        <div className="modal-edicao-massa__erro" role="alert">
          <Warning size={14} weight="fill" aria-hidden="true" />
          {erroGeral}
        </div>
      )}
    </>
  )

  const renderPasso2 = () => (
    <div className="modal-edicao-massa__confirmacao">
      {/* Alerta reforçado quando tipos de operação mistos.
          O banner do topo já informou; aqui antes de aplicar a mudança final
          repetimos com destaque para evitar erro humano. */}
      {hasMixedTipos && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'color-mix(in srgb, var(--warning, #f59e0b) 12%, transparent)',
          border: '1px solid color-mix(in srgb, var(--warning, #f59e0b) 40%, transparent)',
          borderRadius: 'var(--radius-md, 8px)',
          marginBottom: '1rem',
        }}>
          <Warning weight="fill" size={18} color="var(--warning, #f59e0b)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ color: 'var(--warning, #f59e0b)', fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>
              {t('pedido.modal_massa.tipos_diferentes_titulo')}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
              {t('pedido.modal_massa.tipos_diferentes_msg')}
            </p>
          </div>
        </div>
      )}

      {/* C2-a: Auto-fill ao trocar tipo_operacao — banner azul informativo */}
      {preview?.workspaces_auto_fill && preview.workspaces_auto_fill.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'color-mix(in srgb, var(--primary, #6366f1) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--primary, #6366f1) 30%, transparent)',
          borderRadius: 'var(--radius-md, 8px)',
          marginBottom: '1rem',
        }}>
          <Info weight="fill" size={18} color="var(--primary, #6366f1)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ color: 'var(--primary, #6366f1)', fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>
              {t('pedido.modal_massa.autofill_titulo')}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
              {t('pedido.modal_massa.autofill_msg')}
            </p>
            <ul style={{ margin: '0.5rem 0 0 1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {preview.workspaces_auto_fill.map(w => (
                <li key={w.id_workspace}>
                  <strong>{w.nome_workspace}</strong>
                  {w.cnpj_workspace ? <> · {t('pedido.modal_massa.autofill_cnpj_label', { cnpj: w.cnpj_workspace })}</> : <> · <em>{t('pedido.modal_massa.autofill_sem_cnpj')}</em></>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* C2-b: Workspaces sem CNPJ — banner amarelo informativo */}
      {preview?.aviso_workspace_sem_cnpj && preview.aviso_workspace_sem_cnpj.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'color-mix(in srgb, var(--warning, #f59e0b) 12%, transparent)',
          border: '1px solid color-mix(in srgb, var(--warning, #f59e0b) 40%, transparent)',
          borderRadius: 'var(--radius-md, 8px)',
          marginBottom: '1rem',
        }}>
          <Warning weight="fill" size={18} color="var(--warning, #f59e0b)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ color: 'var(--warning, #f59e0b)', fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>
              {t('pedido.modal_massa.workspace_sem_cnpj_titulo')}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
              {t('pedido.modal_massa.workspace_sem_cnpj_msg', { count: preview.aviso_workspace_sem_cnpj.length })}
            </p>
          </div>
        </div>
      )}

      {/* C2-c: Status crítico — banner laranja informativo */}
      {preview?.aviso_status_critico && preview.aviso_status_critico.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'color-mix(in srgb, #fb923c 12%, transparent)',
          border: '1px solid color-mix(in srgb, #fb923c 40%, transparent)',
          borderRadius: 'var(--radius-md, 8px)',
          marginBottom: '1rem',
        }}>
          <Warning weight="fill" size={18} color="#fb923c" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ color: '#fb923c', fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>
              {t('pedido.modal_massa.status_critico_titulo')}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
              {t('pedido.modal_massa.status_critico_msg', { count: preview.aviso_status_critico.length })}{' '}
              <strong>{[...new Set(preview.aviso_status_critico.map(p => p.status_pedido))].join(', ')}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* C3: Aviso quando edição manual sobrescreve auto-fill */}
      {(() => {
        const trocandoTipo = camposValidos.some(c => c.campo === 'tipo_operacao_pedido' && c.operacao === 'substituir')
        const camposManualLadoNacional = camposValidos.filter(c =>
          ['nome_exportador', 'nome_importador', 'cnpj_exportador', 'cnpj_importador'].includes(c.campo),
        )
        if (!trocandoTipo || camposManualLadoNacional.length === 0) return null
        return (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'color-mix(in srgb, var(--warning, #f59e0b) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--warning, #f59e0b) 40%, transparent)',
            borderRadius: 'var(--radius-md, 8px)',
            marginBottom: '1rem',
          }}>
            <Warning weight="fill" size={18} color="var(--warning, #f59e0b)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ color: 'var(--warning, #f59e0b)', fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>
                {t('pedido.modal_massa.manual_sobrescreve_titulo')}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
                {t('pedido.modal_massa.manual_sobrescreve_prefixo')} {camposManualLadoNacional.map(c => <strong key={c.campo}>{disponiveis.find(d => d.campo === c.campo)?.rotulo ?? c.campo}</strong>).reduce((prev, curr, i) => i === 0 ? [curr] : [...prev, ', ', curr], [] as React.ReactNode[])}. {t('pedido.modal_massa.manual_sobrescreve_sufixo')}
              </p>
            </div>
          </div>
        )
      })()}

      {/* Infographic pills — resumo rápido */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
          padding: '0.25rem 0.625rem',
          background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(99, 102, 241, 0.10)', borderRadius: '999px',
          fontSize: '0.75rem', color: 'var(--text-secondary)',
        }}>
          <Package size={12} weight="fill" style={{ color: '#94a3b8' }} />
          <strong style={{ color: '#fff' }}>{preview?.pedidos_afetados ?? pedidos.length}</strong> {t('pedido.modal_massa.pill_pedidos')}
        </span>
        {(preview?.itens_afetados ?? 0) > 0 && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.25rem 0.625rem',
            background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(99, 102, 241, 0.10)', borderRadius: '999px',
            fontSize: '0.75rem', color: 'var(--text-secondary)',
          }}>
            <ListChecks size={12} weight="fill" style={{ color: '#94a3b8' }} />
            <strong style={{ color: '#fff' }}>{preview?.itens_afetados}</strong> {t('pedido.modal_massa.pill_itens')}
          </span>
        )}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
          padding: '0.25rem 0.625rem',
          background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(99, 102, 241, 0.10)', borderRadius: '999px',
          fontSize: '0.75rem', color: 'var(--text-secondary)',
        }}>
          <PencilSimpleLine size={12} weight="fill" style={{ color: '#818cf8' }} />
          <strong style={{ color: '#fff' }}>{camposValidos.length}</strong> {t('pedido.modal_massa.pill_campos')}
        </span>
        {camposValidos.some(c => c.nivel === 'pedido') && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.25rem 0.625rem',
            background: 'color-mix(in srgb, var(--primary, #6366f1) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--primary, #6366f1) 20%, transparent)', borderRadius: '999px',
            fontSize: '0.75rem', color: 'var(--primary, #818cf8)',
          }}>
            {t('pedido.modal_massa.pill_nivel_pedido', { count: camposValidos.filter(c => c.nivel === 'pedido').length })}
          </span>
        )}
        {camposValidos.some(c => c.nivel === 'item') && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.25rem 0.625rem',
            background: 'color-mix(in srgb, var(--success, #22c55e) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--success, #22c55e) 20%, transparent)', borderRadius: '999px',
            fontSize: '0.75rem', color: 'var(--success, #4ade80)',
          }}>
            {t('pedido.modal_massa.pill_nivel_item', { count: camposValidos.filter(c => c.nivel === 'item').length })}
          </span>
        )}
      </div>

      {/* Seletor de pedido — como em Consolidar */}
      {pedidos.length >= 2 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.5rem 0.75rem',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {t('pedido.modal_massa.pedido_label')}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <SelectGlobal
              buscavel
              tamanho="compacto"
              placeholder={t('pedido.modal_massa.filtrar_por_pedido')}
              opcoes={[
                { valor: '__todos__', rotulo: t('pedido.modal_massa.todos_pedidos', { count: pedidos.length }) },
                ...pedidos.map(p => ({
                  valor: p.id,
                  rotulo: `${p.numero_pedido}  ·  ${t('pedido.modal_massa.stat_itens_count', { count: p.itens?.length ?? 0 })}`,
                })),
              ]}
              valor={filtroPedido ?? '__todos__'}
              aoMudarValor={v => setFiltroPedido(v === '__todos__' ? null : String(v))}
              aria-label={t('pedido.modal_massa.filtrar_por_pedido')}
            />
          </div>
        </div>
      )}

      {/* Filtro bar */}
      <div className="em-filtro-bar">
        <Funnel size={14} weight="duotone" style={{ color: 'var(--text-muted)', alignSelf: 'center' }} />
        {(['todos', 'alterados', 'sem-efeito'] as const).map(f => {
          const contagem = f === 'todos' ? camposValidos.length
            : f === 'alterados' ? camposValidos.filter(c => {
                const pc = preview?.campos.find(p => p.campo === c.campo)
                return pc && (pc.valores_distintos?.length ?? 0) > 0 && pc.valores_distintos?.[0] !== c.valor
              }).length
            : camposValidos.filter(c => {
                const pc = preview?.campos.find(p => p.campo === c.campo)
                return !pc || (pc.valores_distintos?.length === 1 && pc.valores_distintos[0] === c.valor)
              }).length
          return (
            <button
              key={f}
              type="button"
              className={`em-filtro-pill${filtroRevisao === f ? ' em-filtro-pill--ativo' : ''}`}
              onClick={() => setFiltroRevisao(f)}
            >
              {f === 'todos' ? t('pedido.modal_massa.filtro_todos') : f === 'alterados' ? t('pedido.modal_massa.filtro_alterados') : t('pedido.modal_massa.filtro_sem_efeito')} ({contagem})
            </button>
          )
        })}
      </div>

      {/* Lista de campos — como está → como vai ficar */}
      {(() => {
        const camposFiltrados = camposValidos.filter(c => {
          if (filtroRevisao === 'todos') return true
          const pc = preview?.campos.find(p => p.campo === c.campo)
          if (filtroRevisao === 'alterados') {
            return pc && (pc.valores_distintos?.length ?? 0) > 0 && pc.valores_distintos?.[0] !== c.valor
          }
          return !pc || (pc.valores_distintos?.length === 1 && pc.valores_distintos[0] === c.valor)
        })

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {camposFiltrados.map(c => {
              const def = disponiveis.find(d => d.campo === c.campo)
              const rotulo = def?.rotulo ?? c.campo
              const previewCampo = preview?.campos.find(p => p.campo === c.campo)
              const valoresAtuais = previewCampo?.valores_distintos ?? []

              // Se um pedido específico está selecionado, mostrar o valor desse pedido
              let valorAtualExib: string
              let multiplos: boolean
              if (filtroPedido && preview?.por_pedido) {
                const pedidoDetalhe = preview.por_pedido.find(pp => pp.pedido_id === filtroPedido)
                const alteracao = pedidoDetalhe?.alteracoes.find(a => a.campo === c.campo)
                valorAtualExib = alteracao ? String(alteracao.valor_atual ?? t('pedido.modal_massa.vazio_paren')) : t('pedido.modal_massa.vazio_paren')
                multiplos = false
              } else {
                multiplos = valoresAtuais.length > 1
                valorAtualExib = multiplos
                  ? t('pedido.modal_massa.valores_distintos', { count: valoresAtuais.length })
                  : valoresAtuais[0] || t('pedido.modal_massa.vazio_paren')
              }

              return (
                <div key={c.uid} style={{
                  display: 'flex', flexDirection: 'column', gap: '0.375rem',
                  padding: '0.75rem 0.875rem',
                  background: 'var(--surface-2, #1e293b)',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid var(--border, #334155)',
                }}>
                  {/* Header: campo + nível */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{rotulo}</span>
                    <span style={{
                      fontSize: '0.6875rem', fontWeight: 500, textTransform: 'uppercase',
                      padding: '0.125rem 0.5rem', borderRadius: '9999px',
                      background: c.nivel === 'pedido'
                        ? 'color-mix(in srgb, var(--primary, #6366f1) 15%, transparent)'
                        : 'color-mix(in srgb, var(--success, #22c55e) 15%, transparent)',
                      color: c.nivel === 'pedido' ? 'var(--primary, #818cf8)' : 'var(--success, #4ade80)',
                    }}>
                      {c.nivel}
                    </span>
                  </div>

                  {/* De → Para */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                    {multiplos && !filtroPedido ? (
                      /* Lista de valores por pedido — padrão Consolidar */
                      (() => {
                        // Ler o valor do campo diretamente dos pedidos originais
                        const porValor = new Map<string, string[]>()
                        for (const p of pedidos) {
                          const raw = (p as unknown as Record<string, unknown>)[c.campo]
                          const valorAtual = String(raw ?? '')
                          const rotuloValor = def?.opcoes?.find(o => o.valor === valorAtual)?.rotulo ?? (valorAtual || t('pedido.modal_massa.vazio_paren'))
                          const chave = rotuloValor
                          const existente = porValor.get(chave) ?? []
                          existente.push(p.numero_pedido)
                          porValor.set(chave, existente)
                        }
                        return (
                          <div style={{
                            flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem',
                          }}>
                            {[...porValor.entries()].map(([rotuloVal, numeros]) => (
                              <span key={rotuloVal} style={{
                                padding: '0.375rem 0.5rem',
                                background: 'color-mix(in srgb, var(--destructive, #ef4444) 8%, transparent)',
                                borderRadius: 'var(--radius-xs, 4px)',
                                color: 'var(--text-secondary, #94a3b8)',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                fontSize: '0.8125rem',
                              }}>
                                {rotuloVal} ({numeros[0]})
                                {numeros.length > 1 && (
                                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginLeft: '0.25rem' }}>
                                    +{numeros.length - 1}
                                  </span>
                                )}
                              </span>
                            ))}
                            <span style={{
                              fontSize: '0.6875rem', fontWeight: 600,
                              color: 'var(--warning, #f59e0b)',
                              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                            }}>
                              <Warning size={12} weight="fill" />
                              {t('pedido.modal_massa.origens_count', { count: porValor.size })}
                            </span>
                          </div>
                        )
                      })()
                    ) : (
                      <span style={{
                        flex: 1, padding: '0.375rem 0.5rem',
                        background: 'color-mix(in srgb, var(--destructive, #ef4444) 8%, transparent)',
                        borderRadius: 'var(--radius-xs, 4px)',
                        color: 'var(--text-secondary, #94a3b8)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {def?.opcoes?.find(o => o.valor === valorAtualExib)?.rotulo ?? valorAtualExib}
                      </span>
                    )}
                    <span style={{ color: 'var(--text-tertiary, #64748b)', flexShrink: 0, fontSize: '0.75rem' }}>→</span>
                    <span style={{
                      flex: 1, padding: '0.375rem 0.5rem',
                      background: 'color-mix(in srgb, var(--success, #22c55e) 8%, transparent)',
                      borderRadius: 'var(--radius-xs, 4px)',
                      color: 'var(--text-primary, #e2e8f0)',
                      fontWeight: 500,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {t(OP_LABEL_KEYS[c.operacao])}: {def?.opcoes?.find(o => o.valor === c.valor)?.rotulo ?? c.valor}
                    </span>
                  </div>

                  {/* Alerta cascade */}
                  {previewCampo?.cascade_para && (
                    <div style={{
                      fontSize: '0.75rem', color: 'var(--primary, #818cf8)',
                      display: 'flex', alignItems: 'center', gap: '0.25rem',
                    }}>
                      ↳ {t('pedido.modal_massa.cascade_msg', { rotulo: disponiveis.find(d => d.campo === previewCampo.cascade_para)?.rotulo ?? previewCampo.cascade_para })}
                      {(previewCampo.overrides_sobrescritos ?? 0) > 0 &&
                        ` · ${t('pedido.modal_massa.cascade_overrides', { count: previewCampo.overrides_sobrescritos })}`}
                    </div>
                  )}
                </div>
              )
            })}
            {camposFiltrados.length === 0 && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                {t('pedido.modal_massa.filtro_nenhum')}
              </span>
            )}
          </div>
        )
      })()}

      {/* Detalhe de/para na confirmação */}
      {preview && <PreviewDepara preview={preview} disponiveis={disponiveis} />}

      {preview?.alertas_globais && preview.alertas_globais.length > 0 && (
        preview.alertas_globais.map((alerta, i) => (
          <div key={i} className="modal-edicao-massa__alerta">
            <Warning size={14} weight="fill" aria-hidden="true" />
            {alerta}
          </div>
        ))
      )}

      {mostrarAvisoPerformance && (
        <div className="modal-edicao-massa__alerta" role="note">
          <Clock size={14} weight="fill" aria-hidden="true" style={{ flexShrink: 0 }} />
          <span>
            {t('pedido.modal_massa.aviso_lento', { count: pedidos.length, segundos: estimadoSegundos })}
          </span>
        </div>
      )}

      {erroSalvar && (
        <div className="modal-edicao-massa__erro" role="alert">
          <Warning size={14} weight="fill" aria-hidden="true" />
          {erroSalvar}
        </div>
      )}
    </div>
  )

  const renderPasso3 = () => {
    if (!resultado) return null
    const temErros = resultado.erros && resultado.erros.length > 0
    const totalPedidos = pedidos.length
    const sucessos = resultado.pedidos_atualizados
    const falhas = resultado.erros?.length ?? 0
    const totalItensAfetados = resultado.itens_atualizados > 0
      ? resultado.itens_atualizados
      : pedidos.reduce((acc, p) => acc + (p.itens?.length ?? 0), 0)
    const camposEditados = campos.filter(c => c.valor.trim() !== '')

    return (
      <div className="modal-edicao-massa__confirmacao">
        {/* Resumo geral */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '1rem',
          background: temErros
            ? 'color-mix(in srgb, var(--warning, #f59e0b) 10%, transparent)'
            : 'color-mix(in srgb, var(--success, #22c55e) 10%, transparent)',
          border: `1px solid ${temErros
            ? 'color-mix(in srgb, var(--warning, #f59e0b) 35%, transparent)'
            : 'color-mix(in srgb, var(--success, #22c55e) 35%, transparent)'}`,
          borderRadius: 'var(--radius-md, 8px)',
          marginBottom: '1rem',
        }}>
          {temErros
            ? <Warning weight="fill" size={20} color="var(--warning, #f59e0b)" />
            : <CheckCircle weight="fill" size={20} color="var(--success, #22c55e)" />}
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>
              {temErros
                ? t('pedido.modal_massa.resumo_com_erros', { sucessos, total: totalPedidos, falhas })
                : t('pedido.modal_massa.resumo_sucesso', { sucessos, itens: totalItensAfetados })}
            </p>
          </div>
        </div>

        {/* Status por campo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('pedido.modal_massa.campos_editados_titulo')}
          </p>
          {camposEditados.map(c => {
            const def = disponiveis.find(d => d.campo === c.campo)
            const rotulo = def?.rotulo ?? c.campo
            const estaNosAlterados = resultado.campos_alterados?.includes(c.campo) ?? false
            const ok = estaNosAlterados && sucessos > 0
            return (
              <div
                key={c.uid}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.625rem 0.875rem',
                  background: 'var(--surface-2, #1e293b)',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid var(--border, #334155)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{rotulo}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary, #64748b)' }}>
                    {c.operacao} → {c.valor}
                  </span>
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  fontSize: '0.75rem', fontWeight: 600,
                  color: ok ? 'var(--success, #22c55e)' : 'var(--destructive, #ef4444)',
                }}>
                  {ok
                    ? <><CheckCircle size={14} weight="fill" /> {t('pedido.modal_massa.status_ok')}</>
                    : <><Warning size={14} weight="fill" /> {t('pedido.modal_massa.status_erro')}</>}
                </span>
              </div>
            )
          })}
        </div>

        {/* Erros detalhados */}
        {temErros && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ margin: '0 0 0.5rem', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--destructive, #ef4444)' }}>
              {t('pedido.modal_massa.pedidos_com_erro')}
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {resultado.erros.map((e, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: '0.8125rem',
                    padding: '0.5rem 0.75rem',
                    background: 'color-mix(in srgb, var(--destructive, #ef4444) 8%, transparent)',
                    borderRadius: 'var(--radius-sm, 6px)',
                    border: '1px solid color-mix(in srgb, var(--destructive, #ef4444) 25%, transparent)',
                    color: 'var(--text-primary, #e2e8f0)',
                  }}
                >
                  <strong>{e.pedido_id.slice(0, 12)}…</strong>: {traduzirErro(e.motivo, t)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  const PASSOS_MASSA: PassoConfig[] = [
    { id: 1, label: t('pedido.modal_massa.passo1_label', { defaultValue: 'Campos' }) },
    { id: 2, label: t('pedido.modal_massa.passo2_label', { defaultValue: 'Revisão' }) },
    { id: 3, label: t('pedido.modal_massa.passo3_label', { defaultValue: 'Resultado' }) },
  ]

  const footerEdicaoMassa = (
    <>
      {/* Esquerda: stepper indicator removido — agora é o stepper global no header */}
      <div className="modal-edicao-massa__footer-direita" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
        {passo === 2 && (
          <BotaoGlobal
            variante="secundario"
            tamanho="medio"
            onClick={() => setPasso(1)}
            disabled={salvando}
          >
            {t('pedido.modal_massa.voltar')}
          </BotaoGlobal>
        )}

        {passo !== 3 && (
          <BotaoGlobal
            variante="secundario"
            tamanho="medio"
            onClick={onFechar}
            disabled={salvando || feedbackBotao !== null}
          >
            {t('pedido.modal_massa.cancelar')}
          </BotaoGlobal>
        )}

        {passo === 1 ? (
          <BotaoGlobal
            variante="primario"
            tamanho="medio"
            onClick={handleAvancar}
            disabled={camposValidos.length === 0 || carregandoPreview || temCampoUniqueBloqueado}
          >
            {t('pedido.modal_massa.revisar')}
          </BotaoGlobal>
        ) : passo === 2 ? (
          <BotaoGlobal
            variante="primario"
            tamanho="medio"
            onClick={handleConfirmar}
            disabled={salvando || feedbackBotao !== null}
            carregando={salvando}
            textoCarregando={t('pedido.modal_massa.aplicando')}
            resultadoAcao={feedbackBotao}
            icone={<PencilSimpleLine size={14} weight="bold" />}
          >
            {feedbackBotao === 'sucesso' ? t('pedido.modal_massa.aplicado') : feedbackBotao === 'erro' ? t('pedido.modal_massa.falhou') : t('pedido.modal_massa.aplicar')}
          </BotaoGlobal>
        ) : (
          <BotaoGlobal
            variante="primario"
            tamanho="medio"
            onClick={() => { onConcluido() }}
          >
            {t('comum.fechar')}
          </BotaoGlobal>
        )}
      </div>
    </>
  )

  return (
    <>
    <style>{`
      .mpg-dialog {
        border: 1px solid color-mix(in srgb, var(--accent, #6366f1) 18%, var(--bg-elevated)) !important;
        box-shadow:
          0 24px 64px rgba(0, 0, 0, 0.55),
          0 0 0 1px rgba(99, 102, 241, 0.08),
          inset 0 1px 0 rgba(255, 255, 255, 0.03) !important;
      }
      .mpg-dialog > div:last-child {
        justify-content: flex-end !important;
        gap: 0.75rem !important;
      }
      .mpg-dialog > div:last-child > div > span {
        display: none !important;
      }
      .em-secao {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 1rem 1.25rem;
        background: transparent;
        border: 1px solid color-mix(in srgb, var(--bg-elevated) 60%, transparent);
        border-radius: var(--radius-lg);
      }
      .em-secao-titulo {
        position: relative;
        z-index: 1;
        font-size: 0.6875rem;
        font-weight: 700;
        color: var(--accent, #6366f1);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .em-secao-titulo::before {
        content: '';
        display: inline-block;
        width: 7px;
        height: 7px;
        background: linear-gradient(135deg, var(--accent, #6366f1), #a78bfa);
        border-radius: 50%;
        box-shadow: 0 0 6px color-mix(in srgb, var(--accent, #6366f1) 40%, transparent);
      }
      [data-em-stats] > .tg-trigger { display: flex; width: 100%; }
      [data-em-stats] > .tg-trigger > div { width: 100%; }
      [data-em-stats] > .tg-trigger:hover > div {
        border-color: rgba(99, 102, 241, 0.25) !important;
        box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15) !important;
        background: rgba(15, 23, 42, 0.65) !important;
      }
      .em-filtro-bar {
        display: flex;
        gap: 0.375rem;
      }
      .em-filtro-pill {
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 600;
        border: 1px solid var(--border, #334155);
        background: transparent;
        color: var(--text-secondary, #94a3b8);
        cursor: pointer;
        transition: all 0.15s;
      }
      .em-filtro-pill:hover {
        border-color: rgba(99, 102, 241, 0.3);
        color: var(--text-primary);
      }
      .em-filtro-pill--ativo {
        background: color-mix(in srgb, var(--accent, #6366f1) 15%, transparent);
        border-color: color-mix(in srgb, var(--accent, #6366f1) 40%, transparent);
        color: var(--accent, #6366f1);
      }
    `}</style>
    <ModalPassoPassoGlobal
      titulo={t('pedido.modal_massa.titulo', { count: pedidos.length, s: pedidos.length !== 1 ? 's' : '' })}
      icone={<PencilSimpleLine size={20} weight="duotone" />}
      subtitulo={t('pedido.modal_massa.subtitulo')}
      aberto={true}
      passos={PASSOS_MASSA}
      passoAtual={passo}
      onProximo={() => {}}
      onVoltar={() => {}}
      onFechar={onFechar}
      tamanho="xl"
      ocultarStepper={passo === 3}
      footerCustom={footerEdicaoMassa}
    >
        {/* Corpo */}
        <div className="modal-edicao-massa__corpo-inner">
          {/* Banner informativo: pedidos de tipos diferentes selecionados */}
          {hasMixedTipos && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
              padding: '0.75rem 1rem',
              background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
              border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
            }}>
              <Info weight="duotone" size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>
                  {t('pedido.modal_massa.mixed_tipos_titulo')}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
                  {t('pedido.modal_massa.mixed_tipos_msg')}
                </p>
              </div>
            </div>
          )}
          {passo === 1 ? renderPasso1() : passo === 2 ? renderPasso2() : renderPasso3()}
        </div>
    </ModalPassoPassoGlobal>
    </>
  )
}
