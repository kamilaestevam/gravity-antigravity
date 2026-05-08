/**
 * @nucleo/tabela-virtual-global — componente principal
 * Tabela virtualizada de alto desempenho para o ecossistema Gravity.
 * Suporta hierarquia 3 níveis: Processo → Pedido → Item.
 * Renderização virtual via @tanstack/react-virtual.
 */

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  memo,
} from 'react'
import { createPortal } from 'react-dom'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { GabiCampoIconeGlobal } from '@nucleo/gabi-field-icon-global'
import { useGTExpandir } from './hooks/useGTExpandir.js'
import { useGTSelecao } from './hooks/useGTSelecao.js'
import { useGTInlineEdit } from './hooks/useGTInlineEdit.js'
import { SelectColunasGlobal } from '@nucleo/select-colunas-global'
import { CampoCalendarioGlobal } from '@nucleo/campo-calendario-global'
import { useMoedas } from '@nucleo/modal-tabela-moeda'
import { useUnidades } from '@nucleo/modal-tabela-unidades'
import './tabela-virtual.css'
import type {
  GTVirtualTableProps,
  GTColuna,
  GTAcao,
  GTAcaoLote,
  GTAbaTipo,
  GTLinhaVirtual,
  GTPreferencias,
  GTValorMoeda,
  GTValorUnidade,
  GTUnidadeOpcao,
} from './tipos.js'
import { BotaoCompletoExportar } from './BotaoCompletoExportar.js'

// ─── Ícones internos ──────────────────────────────────────────────────────────

function IconeChevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconeBusca() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconeX() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}


function IconeColunas() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="5" height="18" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="10" y="3" width="5" height="18" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="17" y="3" width="4" height="18" rx="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function IconeFiltro() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconeArrowUp() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M5 8V2M2 5l3-3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconeArrowDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M5 2v6M2 5l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconeVazio() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildFlatRows<T, C>(
  dados: T[],
  expandidos: Set<string>,
  filhosCache: Map<string, C[]>,
  itemId: (item: T) => string,
  filhoId: (filho: C) => string,
): GTLinhaVirtual<T, C>[] {
  const linhas: GTLinhaVirtual<T, C>[] = []

  for (const item of dados) {
    const id = itemId(item)
    linhas.push({ tipo: 'pai', item, profundidade: 0, id })

    if (expandidos.has(id)) {
      const filhos = filhosCache.get(id) ?? []
      for (const filho of filhos) {
        const fid = filhoId(filho)
        linhas.push({ tipo: 'filho', item: filho, paiId: id, profundidade: 1, id: fid })
      }
    }
  }

  return linhas
}

function contarFiltrosAtivos(filtros: Record<string, unknown>): number {
  let count = 0
  for (const v of Object.values(filtros)) {
    if (v instanceof Set && v.size > 0) count++
    else if (v && typeof v === 'object') {
      const obj = v as Record<string, string>
      if (obj.min || obj.max || obj.inicio || obj.fim) count++
    }
  }
  return count
}

// ─── Subcomponente: Abas de status ────────────────────────────────────────────

const GTAbas = memo(function GTAbas({
  abas,
  abaAtiva,
  onMudarAba,
}: {
  abas: GTAbaTipo[]
  abaAtiva: string | undefined
  onMudarAba?: (aba: string) => void
}) {
  return (
    <div className="gtv-tabs" role="tablist">
      {abas.map(aba => (
        <button
          key={aba.valor}
          role="tab"
          aria-selected={abaAtiva === aba.valor}
          className={`gtv-tab${abaAtiva === aba.valor ? ' gtv-tab--ativa' : ''}`}
          onClick={() => onMudarAba?.(aba.valor)}
        >
          {aba.label}
          {aba.contagem != null && (
            <span className="gtv-tab-badge">{aba.contagem}</span>
          )}
        </button>
      ))}
    </div>
  )
})

// ─── Subcomponente: Skeleton de carregamento ──────────────────────────────────

const GTSkeleton = memo(function GTSkeleton() {
  return (
    <div className="gtv-tabela-scroll" aria-busy="true" aria-label="Carregando...">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="gtv-skeleton-linha"
          style={{ height: 44 }}
        >
          <div className="gtv-skeleton gtv-skeleton--sm" />
          <div className="gtv-skeleton gtv-skeleton--xl" />
          <div className="gtv-skeleton gtv-skeleton--md" />
          <div className="gtv-skeleton gtv-skeleton--lg" />
          <div className="gtv-skeleton gtv-skeleton--sm" />
        </div>
      ))}
    </div>
  )
})

// ─── Subcomponente: Estado vazio ──────────────────────────────────────────────

const GTVazio = memo(function GTVazio({
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: {
  emptyIcon?: React.ReactNode
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
}) {
  return (
    <div className="gtv-vazio">
      <div className="gtv-vazio__icone">
        {emptyIcon ?? <IconeVazio />}
      </div>
      <p className="gtv-vazio__titulo">{emptyTitle ?? 'Nenhum resultado encontrado'}</p>
      {emptyDescription && (
        <p className="gtv-vazio__desc">{emptyDescription}</p>
      )}
      {emptyAction && (
        <div className="gtv-vazio__acao">{emptyAction}</div>
      )}
    </div>
  )
})


// ─── Subcomponente: Popover de edição ────────────────────────────────────────

// ─── Helpers para campos de data ──────────────────────────────────────────────

function dateToIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function isoToBR(iso: unknown): string {
  if (!iso || typeof iso !== 'string') return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR')
}

function aplicarMascaraData(value: string): string {
  // Remove tudo que não é dígito
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

function brToIso(text: string): string | null {
  const parts = text.split('/')
  if (parts.length !== 3) return null
  const dd = parseInt(parts[0]), mm = parseInt(parts[1]), yyyy = parseInt(parts[2])
  if (isNaN(dd) || isNaN(mm) || isNaN(yyyy) || yyyy < 1000) return null
  const d = new Date(yyyy, mm - 1, dd)
  if (isNaN(d.getTime()) || d.getDate() !== dd) return null
  return dateToIso(d)
}

function parseDateValor(val: unknown): { inicio: Date | null; fim: null } {
  if (!val || typeof val !== 'string') return { inicio: null, fim: null }
  const d = new Date(val)
  return { inicio: isNaN(d.getTime()) ? null : d, fim: null }
}

// ──────────────────────────────────────────────────────────────────────────────

// Unidades padrão — agora vêm do banco via `useUnidades()` no hook do
// GTEditPopover. Variável module-level antiga (UNIDADES_PADRAO) removida
// porque dependia da constante hardcoded UNIDADES_SISCOMEX já deletada.
const getUnidadeSigla  = (u: GTUnidadeOpcao) => typeof u === 'string' ? u : u.sigla
const getUnidadeRotulo = (u: GTUnidadeOpcao) => typeof u === 'string' ? u : u.rotulo

function formatarOverlayValor(val: unknown, tipo?: string, casasDecimais?: number): string {
  if (tipo === 'moeda' && val != null && typeof val === 'object') {
    const v = val as GTValorMoeda
    return `${v.currency} ${Number(v.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  if (tipo === 'unidade' && val != null && typeof val === 'object') {
    const v = val as GTValorUnidade
    const casas = casasDecimais ?? 0
    return `${Number(v.quantity).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })} ${v.unit}`
  }
  return String(val ?? '')
}

// Formata número para exibição pt-BR sem depender de toLocaleString (locale pode variar por ambiente)
// Usa regex manual: separador de milhar = ponto, decimal = vírgula
function fmtBR(valor: number, casas: number): string {
  if (!Number.isFinite(valor)) return ''
  const partes = valor.toFixed(Math.max(0, casas)).split('.')
  partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return casas > 0 && partes[1] ? `${partes[0]},${partes[1]}` : partes[0]
}

// Converte string pt-BR (1.500,50) para float (1500.5).
// Limitação: "1.5" sem vírgula e com 1-2 dígitos após o ponto é interpretado
// como decimal US — coluna deve usar tipo 'numero' para garantir entrada via fmtBR.
function parseBRNum(s: string): number {
  const t = s.trim()
  if (!t) return 0
  // Tem vírgula: formato BR (. = milhar, , = decimal)
  if (t.includes(',')) return parseFloat(t.replace(/\./g, '').replace(',', '.')) || 0
  // Só ponto: se 3 dígitos após o ponto → milhar (1.500); senão → decimal (1.5)
  if (t.includes('.')) {
    const parts = t.split('.')
    if (parts.length === 2 && parts[1].length === 3) return parseFloat(t.replace('.', '')) || 0
    return parseFloat(t) || 0
  }
  return parseFloat(t) || 0
}

/**
 * Converte o valor bruto de uma célula para a string exibida na tela,
 * garantindo que o find-in-page encontre exatamente o que o usuário vê.
 *
 * Prioridade:
 * 1. col.findDisplay(item) — cobre badges e renders customizados (100% fiel ao display)
 * 2. objeto (moeda/unidade) → formatarOverlayValor
 * 3. 'periodo' + ISO string → toLocaleDateString('pt-BR')
 * 4. 'numero' + number      → fmtBR(v, casas)
 * 5. boolean                → 'Sim' / 'Não'
 * 6. demais                 → String(v)
 * 7. null/undefined         → ''
 */
function valorParaStringFind(v: unknown, col: GTColuna<unknown>, item: Record<string, unknown>): string {
  if (col.findDisplay) return col.findDisplay(item as never)
  if (v == null) return ''
  if (typeof v === 'object') return formatarOverlayValor(v, col.tipo, col.casasDecimais)
  if (col.tipo === 'periodo' && typeof v === 'string') {
    const d = new Date(v)
    return isNaN(d.getTime()) ? v : d.toLocaleDateString('pt-BR')
  }
  if (col.tipo === 'numero' && typeof v === 'number') return fmtBR(v, col.casasDecimais ?? 0)
  if (typeof v === 'boolean') return v ? 'Sim' : 'Não'
  return String(v)
}

function parsearLinhaSmartPaste(linha: string, tipo?: string, valorAtual?: unknown): unknown {
  const txt = linha.trim()
  if (tipo === 'moeda') {
    const moedaPadrao = (valorAtual as GTValorMoeda | null)?.currency ?? 'USD'
    // Tenta extrair código ISO de 3 letras maiúsculas
    const match = txt.match(/^([A-Z]{3})\s*([\d.,]+)$/) ?? txt.match(/^([\d.,]+)\s*([A-Z]{3})$/)
    if (match) {
      const [, a, b] = match
      const isCurrencyFirst = /^[A-Z]{3}$/.test(a)
      const currency = isCurrencyFirst ? a : b
      const amountStr = isCurrencyFirst ? b : a
      return { currency, amount: Number(amountStr.replace(/\./g, '').replace(',', '.')) || 0 }
    }
    const amount = Number(txt.replace(/\./g, '').replace(',', '.')) || 0
    return { currency: moedaPadrao, amount }
  }
  if (tipo === 'unidade') {
    const unitPadrao = (valorAtual as GTValorUnidade | null)?.unit ?? 'UN'
    const match = txt.match(/^([\d.,]+)\s*([A-Za-zÀ-ú²³]+)$/)
    if (match) {
      return { quantity: Number(match[1].replace(/\./g, '').replace(',', '.')) || 0, unit: match[2].toUpperCase() }
    }
    return { quantity: Number(txt.replace(/\./g, '').replace(',', '.')) || 0, unit: unitPadrao }
  }
  if (tipo === 'numero') {
    return Number(txt.replace(/\./g, '').replace(',', '.')) || 0
  }
  return txt
}

interface GTEditPopoverProps {
  overlayInfo: {
    rect: DOMRect
    id: string
    campo: string
    isFilho: boolean
    colLabel: string
    colTipo?: string
    opcoes?: { valor: string; label: string }[]
    moedas?: GTUnidadeOpcao[]
    unidades?: GTUnidadeOpcao[]
    casasDecimais?: number
    gabiCampo?: string
    gabiEndpoint?: string
  }
  valorEditando: unknown
  salvando: boolean
  onAtualizar: (valor: unknown) => void
  onConfirmar: () => void
  onCancelar: () => void
  onSmartPaste?: (valores: string[]) => void
}

const POPOVER_W = 340

const GTEditPopover = memo(function GTEditPopover({
  overlayInfo,
  valorEditando,
  salvando,
  onAtualizar,
  onConfirmar,
  onCancelar,
  onSmartPaste,
}: GTEditPopoverProps) {
  const { rect, colLabel } = overlayInfo
  const isPeriodo = overlayInfo.colTipo === 'periodo'
  const isOpcoes  = Array.isArray(overlayInfo.opcoes) && overlayInfo.opcoes!.length > 0
  const isMoeda   = overlayInfo.colTipo === 'moeda'
  const isUnidade = overlayInfo.colTipo === 'unidade'
  const isNumero  = overlayInfo.colTipo === 'numero'
  const popoverRef    = useRef<HTMLDivElement>(null)
  const inputRef      = useRef<HTMLInputElement>(null)
  const moedaTriggerRef    = useRef<HTMLButtonElement>(null)
  const unidadeTriggerRef  = useRef<HTMLButtonElement>(null)
  // Flag síncrona: true durante o mousedown do trigger antes do blur do input
  const dropdownAbrindoRef = useRef(false)
  const [moedaAberta, setMoedaAberta] = useState(false)
  const [unidadeAberta, setUnidadeAberta] = useState(false)
  const [moedaListPos, setMoedaListPos]       = useState<{ top: number; left: number; width: number } | null>(null)
  const [unidadeListPos, setUnidadeListPos]   = useState<{ top: number; left: number } | null>(null)
  const [moedaBusca, setMoedaBusca]     = useState('')
  const [unidadeBusca, setUnidadeBusca] = useState('')

  function abrirMoeda() {
    const r = moedaTriggerRef.current?.getBoundingClientRect()
    if (r) setMoedaListPos({ top: r.bottom + 4, left: r.left, width: Math.max(280, r.width) })
    setMoedaBusca('')
    setMoedaAberta(true)
  }
  function abrirUnidade() {
    const r = unidadeTriggerRef.current?.getBoundingClientRect()
    if (r) setUnidadeListPos({ top: r.bottom + 4, left: r.left })
    setUnidadeBusca('')
    setUnidadeAberta(true)
  }

  // Valores compostos — calculados sempre mas usados só nos modos moeda/unidade
  const mv: GTValorMoeda = (isMoeda && valorEditando != null && typeof valorEditando === 'object' && 'currency' in (valorEditando as object))
    ? (valorEditando as GTValorMoeda)
    : { currency: 'USD', amount: 0 }
  const uv: GTValorUnidade = (isUnidade && valorEditando != null && typeof valorEditando === 'object' && 'unit' in (valorEditando as object))
    ? (valorEditando as GTValorUnidade)
    : { unit: 'UN', quantity: 0 }
  // SSOT: listas vêm do banco Cadastros via hooks (antes hardcoded).
  const { moedas: moedasCadastros } = useMoedas()
  const { unidades: unidadesCadastros } = useUnidades()
  const listaMoedasSiscomex = overlayInfo.moedas
    ? moedasCadastros.filter(m => overlayInfo.moedas!.some(mo => getUnidadeSigla(mo) === m.codigo_moeda))
    : moedasCadastros
  const unidadesPadrao: GTUnidadeOpcao[] = unidadesCadastros.map((u) => ({
    sigla: u.codigo_unidade,
    rotulo: u.nome_unidade,
  }))
  const listaUnidades = overlayInfo.unidades ?? unidadesPadrao
  const casas = overlayInfo.casasDecimais ?? 0

  // Estados de display pt-BR para os inputs numéricos (inicializados uma vez na abertura do popover)
  // fmtBR() formata via regex — não depende de toLocaleString nem de locale do browser
  const [displayMoedaAmt, setDisplayMoedaAmt] = useState(() => fmtBR(Number(mv.amount), 2))
  const [displayQty, setDisplayQty]           = useState(() => fmtBR(Number(uv.quantity), casas))
  const numericInitial = isNumero ? (typeof valorEditando === 'number' ? valorEditando : parseBRNum(String(valorEditando ?? ''))) : 0
  const [displayNumero, setDisplayNumero] = useState(() =>
    isNumero ? fmtBR(numericInitial, casas) || '' : String(valorEditando ?? '')
  )

  // useLayoutEffect garante valor formatado antes do primeiro paint — cobre casos onde o
  // useState lazy-init roda antes de valorEditando estar pronto (ex: HMR, Strict Mode duplo-mount)
  useLayoutEffect(() => {
    if (isMoeda)   setDisplayMoedaAmt(fmtBR(Number(mv.amount), 2))
    if (isUnidade) setDisplayQty(fmtBR(Number(uv.quantity), casas))
    if (isNumero)  setDisplayNumero(fmtBR(numericInitial, casas) || String(valorEditando ?? ''))
  }, []) // intentional empty deps — runs once on mount, same scope as lazy-init

  // Handler de paste compartilhado — detecta multi-linha e aciona smart paste
  const handleSmartPasteDetect = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const texto = e.clipboardData.getData('text')
    const linhas = texto.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    if (linhas.length > 1) {
      e.preventDefault()
      onSmartPaste?.(linhas)
    }
  }

  // Estado local para campos de data: texto em formato DD/MM/AAAA
  const [periodoText, setPeriodoText] = useState<string>(() => isoToBR(valorEditando))

  // Posição inicial (abaixo da célula) — reajustada pelo useLayoutEffect
  const [pos, setPos] = useState(() => {
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - POPOVER_W - 8))
    return { top: rect.bottom + 8, left, arrowLeft: 16, flipUp: false }
  })

  // Reposiciona após medir altura real — evita corte na borda inferior
  useLayoutEffect(() => {
    const el = popoverRef.current
    if (!el) return
    const h = el.offsetHeight
    const w = el.offsetWidth
    const left     = Math.max(8, Math.min(rect.left, window.innerWidth - w - 8))
    const arrowLeft = Math.max(12, Math.min(w - 20, (rect.left + rect.width / 2) - left))
    const belowOk  = rect.bottom + h + 12 <= window.innerHeight
    const top      = belowOk ? rect.bottom + 8 : Math.max(8, rect.top - h - 8)
    setPos({ top, left, arrowLeft, flipUp: !belowOk })
  }, [rect])

  // Seleciona o texto ao montar para edição imediata (apenas campos não-periodo)
  useEffect(() => {
    if (!isPeriodo) {
      const t = setTimeout(() => inputRef.current?.select(), 30)
      return () => clearTimeout(t)
    }
  }, [isPeriodo])

  // Atualiza valorEditando ao digitar data — aplica máscara DD/MM/AAAA
  function handlePeriodoTextChange(text: string) {
    const masked = aplicarMascaraData(text)
    setPeriodoText(masked)
    const iso = brToIso(masked)
    if (iso) onAtualizar(iso)
  }

  // Calendário selecionou uma data: preenche input sem confirmar
  function handleCalendarioMudar(val: { inicio: Date | null; fim: Date | null }) {
    if (val.inicio) {
      const iso = dateToIso(val.inicio)
      const br  = val.inicio.toLocaleDateString('pt-BR')
      setPeriodoText(br)
      onAtualizar(iso)
    }
  }

  return (
    <>
      {/* Backdrop — clique fora cancela */}
      <div className="gtv-edit-popover-backdrop" onMouseDown={() => onCancelar()} />

      {/* Seta — fora do popover para não ser cortada pelo overflow:hidden */}
      <div
        className={`gtv-edit-popover-arrow${pos.flipUp ? ' gtv-edit-popover-arrow--flip' : ''}`}
        style={{
          position: 'fixed',
          left: pos.left + pos.arrowLeft,
          top: pos.flipUp ? pos.top + (popoverRef.current?.offsetHeight ?? 0) : pos.top - 8,
          zIndex: 10000,
        }}
      />

      {/* Popover */}
      <div
        ref={popoverRef}
        className={`gtv-edit-popover${pos.flipUp ? ' gtv-edit-popover--flip' : ''}`}
        style={{ top: pos.top, left: pos.left }}
        onMouseDown={e => e.stopPropagation()}
      >

        {/* Header: nome do campo + ✦ GABI (se configurado) + fechar */}
        <div className="gtv-edit-popover-header">
          <span className="gtv-edit-popover-label">
            <svg width="11" height="11" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM51.31,160l96-96,32,32-96,96ZM48,179.31,76.69,208H48Zm160-96L176,115.31,140.69,80,163.31,57.37,208,102Z"/>
            </svg>
            {colLabel}
            {overlayInfo.gabiCampo && (
              <GabiCampoIconeGlobal
                campo={overlayInfo.gabiCampo}
                label={colLabel}
                gabiEndpoint={overlayInfo.gabiEndpoint}
              />
            )}
          </span>
          <button
            type="button"
            className="gtv-edit-popover-close"
            onMouseDown={e => e.stopPropagation()}
            onClick={() => onCancelar()}
            aria-label="Cancelar edição"
          >
            <svg width="9" height="9" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/>
            </svg>
          </button>
        </div>

        {/* Input / Lista de opções */}
        <div className="gtv-edit-popover-body">
          {isOpcoes ? (
            <div className="gtv-edit-popover-opcoes">
              {overlayInfo.opcoes!.map(op => (
                <button
                  key={op.valor}
                  type="button"
                  className={`gtv-edit-popover-opcao${String(valorEditando) === op.valor ? ' gtv-edit-popover-opcao--ativo' : ''}`}
                  disabled={salvando}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => { onAtualizar(op.valor); onConfirmar() }}
                >
                  {op.label}
                </button>
              ))}
            </div>
          ) : isMoeda ? (
            <div className="gtv-edit-moeda">
              {/* Trigger — dropdown inline com busca e lista Siscomex completa */}
              <div className="gtv-edit-custom-select">
                <button
                  ref={moedaTriggerRef}
                  type="button"
                  className="gtv-edit-custom-select-trigger"
                  disabled={salvando}
                  onMouseDown={e => { e.preventDefault(); e.stopPropagation(); if (moedaAberta) { setMoedaAberta(false) } else { dropdownAbrindoRef.current = true; abrirMoeda() } }}
                >
                  <span>{mv.currency}</span>
                  <svg width="10" height="10" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"
                    style={{ transform: moedaAberta ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>
                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/>
                  </svg>
                </button>
              </div>
              <input
                ref={inputRef}
                autoFocus
                type="text"
                inputMode="decimal"
                className="gtv-edit-moeda-valor"
                value={displayMoedaAmt}
                placeholder="0,00"
                disabled={salvando}
                onChange={e => {
                  const raw = e.target.value
                  setDisplayMoedaAmt(raw)
                  onAtualizar({ ...mv, amount: parseBRNum(raw) })
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter')  { e.preventDefault(); onConfirmar() }
                  if (e.key === 'Escape') { e.preventDefault(); setMoedaAberta(false); onCancelar() }
                }}
                onBlur={e => {
                  const parsed = parseBRNum(displayMoedaAmt)
                  setDisplayMoedaAmt(fmtBR(parsed, 2))
                  if (dropdownAbrindoRef.current) { dropdownAbrindoRef.current = false; return }
                  if (!popoverRef.current?.contains(e.relatedTarget as Node)) onConfirmar()
                }}
                onPaste={handleSmartPasteDetect}
              />
            </div>
          ) : isUnidade ? (
            <div className="gtv-edit-unidade">
              <input
                ref={inputRef}
                autoFocus
                type="text"
                inputMode="decimal"
                className="gtv-edit-unidade-qty"
                value={displayQty}
                placeholder={casas > 0 ? `0,${'0'.repeat(casas)}` : '0'}
                disabled={salvando}
                onChange={e => {
                  const raw = e.target.value
                  setDisplayQty(raw)
                  onAtualizar({ ...uv, quantity: parseBRNum(raw) })
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter')  { e.preventDefault(); onConfirmar() }
                  if (e.key === 'Escape') { e.preventDefault(); setUnidadeAberta(false); onCancelar() }
                }}
                onBlur={e => {
                  const parsed = parseBRNum(displayQty)
                  setDisplayQty(fmtBR(parsed, casas))
                  if (dropdownAbrindoRef.current) { dropdownAbrindoRef.current = false; return }
                  if (!popoverRef.current?.contains(e.relatedTarget as Node)) onConfirmar()
                }}
                onPaste={handleSmartPasteDetect}
              />
              {/* Trigger — dropdown via portal para não ser cortado pelo overflow:hidden */}
              <div className="gtv-edit-custom-select">
                <button
                  ref={unidadeTriggerRef}
                  type="button"
                  className="gtv-edit-custom-select-trigger"
                  disabled={salvando}
                  onMouseDown={e => { e.preventDefault(); e.stopPropagation(); if (unidadeAberta) { setUnidadeAberta(false) } else { dropdownAbrindoRef.current = true; abrirUnidade() } }}
                >
                  <span>{uv.unit}</span>
                  <svg width="10" height="10" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"
                    style={{ transform: unidadeAberta ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>
                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/>
                  </svg>
                </button>
              </div>
            </div>
          ) : isPeriodo ? (
            <>
              {/* Input de digitação livre em formato BR */}
              <input
                ref={inputRef}
                autoFocus
                className="gtv-edit-popover-input"
                placeholder="DD/MM/AAAA"
                value={periodoText}
                disabled={salvando}
                onChange={e => handlePeriodoTextChange(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter')  { e.preventDefault(); onConfirmar() }
                  if (e.key === 'Escape') { e.preventDefault(); onCancelar()  }
                }}
              />
              {/* Calendário como opção visual — selecionar preenche o input acima */}
              <div style={{ marginTop: 8 }}>
                <CampoCalendarioGlobal
                  valor={parseDateValor(valorEditando)}
                  aoMudarValor={handleCalendarioMudar}
                  disabled={salvando}
                />
              </div>
            </>
          ) : (
            <input
              ref={inputRef}
              autoFocus
              type="text"
              inputMode={isNumero ? 'decimal' : 'text'}
              className="gtv-edit-popover-input"
              value={isNumero ? displayNumero : String(valorEditando ?? '')}
              disabled={salvando}
              onChange={e => {
                const raw = e.target.value
                if (isNumero) {
                  setDisplayNumero(raw)
                  onAtualizar(parseBRNum(raw))
                } else {
                  onAtualizar(raw)
                }
              }}
              onKeyDown={e => {
                if (e.key === 'Enter')  { e.preventDefault(); onConfirmar() }
                if (e.key === 'Escape') { e.preventDefault(); onCancelar()  }
              }}
              onBlur={e => {
                if (isNumero) {
                  const parsed = parseBRNum(displayNumero)
                  setDisplayNumero(fmtBR(parsed, casas))
                }
                if (!popoverRef.current?.contains(e.relatedTarget as Node)) onConfirmar()
              }}
              onPaste={handleSmartPasteDetect}
            />
          )}
        </div>

        {/* Footer: hints + botões (oculto no modo opcoes — clique já confirma) */}
        <div className={`gtv-edit-popover-footer${isOpcoes ? ' gtv-edit-popover-footer--hidden' : ''}`}>
          <div className="gtv-edit-popover-hints" aria-hidden="true">
            <kbd className="gtv-edit-popover-kbd">Enter</kbd>
            <span>Confirmar</span>
            <span className="gtv-edit-popover-sep">·</span>
            <kbd className="gtv-edit-popover-kbd">Esc</kbd>
            <span>Cancelar</span>
          </div>
          <div className="gtv-edit-popover-actions">
            <button
              type="button"
              className="gtv-edit-popover-btn gtv-edit-popover-btn--ghost"
              onMouseDown={e => e.stopPropagation()}
              onClick={() => onCancelar()}
              tabIndex={-1}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="gtv-edit-popover-btn gtv-edit-popover-btn--primary"
              onMouseDown={e => e.stopPropagation()}
              onClick={() => onConfirmar()}
              disabled={salvando}
              tabIndex={-1}
            >
              {salvando
                ? <span className="gtv-spinner" aria-label="Salvando..." />
                : <>
                    <svg width="11" height="11" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                      <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/>
                    </svg>
                    Confirmar
                  </>
              }
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown de moeda — portal com busca por sigla, descrição ou código */}
      {moedaAberta && moedaListPos && createPortal(
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 10000 }}
            onMouseDown={() => setMoedaAberta(false)}
          />
          <div
            className="gtv-edit-custom-select-list gtv-edit-moeda-list"
            style={{ position: 'fixed', top: moedaListPos.top, left: moedaListPos.left, zIndex: 10001, width: moedaListPos.width }}
            onMouseDown={e => e.preventDefault()}
          >
            <div className="gtv-edit-custom-select-busca">
              <svg width="11" height="11" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/>
              </svg>
              <input
                className="gtv-edit-custom-select-busca-input"
                placeholder="Buscar sigla, descrição ou código..."
                autoFocus
                value={moedaBusca}
                onChange={e => setMoedaBusca(e.target.value)}
                onKeyDown={e => { if (e.key === 'Escape') setMoedaAberta(false) }}
              />
            </div>
            {listaMoedasSiscomex
              .filter(m => {
                const q = moedaBusca.toLowerCase()
                return !q || m.codigo_moeda.toLowerCase().includes(q) || m.nome_moeda.toLowerCase().includes(q)
              })
              .map(m => (
                <button
                  key={m.codigo_moeda}
                  type="button"
                  className={`gtv-edit-custom-select-item gtv-edit-moeda-item${mv.currency === m.codigo_moeda ? ' gtv-edit-custom-select-item--ativo' : ''}`}
                  onClick={() => { onAtualizar({ ...mv, currency: m.codigo_moeda }); setMoedaAberta(false) }}
                >
                  <span className="gtv-edit-moeda-sigla">{m.codigo_moeda}</span>
                  <span className="gtv-edit-moeda-desc">{m.nome_moeda}</span>
                </button>
              ))
            }
          </div>
        </>,
        document.body
      )}

      {/* Dropdown de unidade — portal fora do popover */}
      {unidadeAberta && unidadeListPos && createPortal(
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 10000 }}
            onMouseDown={() => setUnidadeAberta(false)}
          />
          <div
            className="gtv-edit-custom-select-list"
            style={{ position: 'fixed', top: unidadeListPos.top, left: unidadeListPos.left, zIndex: 10001 }}
            onMouseDown={e => e.preventDefault()}
          >
            <div className="gtv-edit-custom-select-busca">
              <svg width="11" height="11" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/>
              </svg>
              <input
                className="gtv-edit-custom-select-busca-input"
                placeholder="Buscar..."
                autoFocus
                value={unidadeBusca}
                onChange={e => setUnidadeBusca(e.target.value)}
                onKeyDown={e => { if (e.key === 'Escape') setUnidadeAberta(false) }}
              />
            </div>
            {listaUnidades
              .filter(u => {
                const q = unidadeBusca.toLowerCase()
                return getUnidadeSigla(u).toLowerCase().includes(q) || getUnidadeRotulo(u).toLowerCase().includes(q)
              })
              .map(u => {
                const sigla  = getUnidadeSigla(u)
                const rotulo = getUnidadeRotulo(u)
                return (
                  <button
                    key={sigla}
                    type="button"
                    className={`gtv-edit-custom-select-item${uv.unit === sigla ? ' gtv-edit-custom-select-item--ativo' : ''}`}
                    onClick={() => { onAtualizar({ ...uv, unit: sigla }); setUnidadeAberta(false) }}
                  >{rotulo}</button>
                )
              })
            }
          </div>
        </>,
        document.body
      )}
    </>
  )
})

// ─── Componente principal ─────────────────────────────────────────────────────

export function TabelaVirtualGlobal<T = unknown, C = never>({
  dados,
  colunas,
  itemId: itemIdProp,
  colunasFilhas,
  mapaColunasFilho,
  onCarregarFilhos,
  filhoId: filhoIdProp,
  acoesFilhas,
  itensPorPagina = 50,
  totalItens,
  paginaAtual,
  onMudarPagina,
  abas,
  abaAtiva,
  onMudarAba,
  acoes,
  acoesLote,
  acoesExportacao,
  acoesBarra,
  onSelecaoMudar,
  selecionavelFilhos,
  onSelecaoFilho,
  acoesFilho,
  renderConectorFilho,
  onBuscar,
  modoLocalizar = false,
  onFindProximaPagina,
  onFindPaginaAnterior,
  onFindTermoChange,
  findTotalExterno,
  placeholderBusca = 'Localizar',
  onFiltrar,
  onOrdenar,
  onFiltroColuna,
  filtrosAtivosKeys,
  sortCampo,
  sortDir,
  camposEditaveis = [],
  onEditar,
  camposEditaveisFilhos = [],
  onEditarFilho,
  onSalvoComSucesso,
  onErroAoSalvar,
  preferencias,
  onSalvarPreferencias,
  carregando,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  ariaLabel = 'Tabela de dados',
}: GTVirtualTableProps<T, C>) {
  // ── Funções de ID ────────────────────────────────────────────────────────────
  const itemId = useCallback(
    (item: T): string => {
      if (itemIdProp) return itemIdProp(item)
      return String((item as Record<string, unknown>).id ?? '')
    },
    [itemIdProp],
  )

  const filhoId = useCallback(
    (filho: C): string => {
      if (filhoIdProp) return filhoIdProp(filho)
      return String((filho as Record<string, unknown>).id ?? '')
    },
    [filhoIdProp],
  )

  // ── Busca ────────────────────────────────────────────────────────────────────
  const [termoBusca, setTermoBusca] = useState('')
  const [findAtivo, setFindAtivo] = useState(0)
  // Acumula matches das páginas já navegadas (para counter cross-page)
  const [findOffset, setFindOffset] = useState(0)

  const handleBusca = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      setTermoBusca(v)
      if (!modoLocalizar) onBuscar?.(v)
    },
    [onBuscar, modoLocalizar],
  )

  const limparBusca = useCallback(() => {
    setTermoBusca('')
    if (!modoLocalizar) onBuscar?.('')
  }, [onBuscar, modoLocalizar])

  // ── Sort ─────────────────────────────────────────────────────────────────────
  const [sortLocal, setSortLocal] = useState<{ campo: string; dir: 'asc' | 'desc' } | null>(
    sortCampo && sortDir ? { campo: sortCampo, dir: sortDir } : null,
  )

  // Sincroniza sortLocal quando os props mudam (ex: sort via popover de filtro)
  useEffect(() => {
    setSortLocal(sortCampo && sortDir ? { campo: sortCampo, dir: sortDir } : null)
  }, [sortCampo, sortDir])

  const handleSort = useCallback(
    (campo: string) => {
      setSortLocal(prev => {
        if (prev?.campo === campo) {
          const novaDir: 'asc' | 'desc' = prev.dir === 'asc' ? 'desc' : 'asc'
          onOrdenar?.(campo, novaDir)
          return { campo, dir: novaDir }
        }
        onOrdenar?.(campo, 'asc')
        return { campo, dir: 'asc' }
      })
    },
    [onOrdenar],
  )

  // ── Scroll container ref (usado por localizar) ───────────────────────────────
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // ── Visibilidade de colunas ───────────────────────────────────────────────────
  const [colunasAbertas, setColunasAbertas] = useState(false)
  const colunasBtnRef = useRef<HTMLButtonElement>(null)

  const colunasVisiveis = useMemo<string[]>(() => {
    if (preferencias?.colunas_visiveis) return preferencias.colunas_visiveis
    return colunas.filter(c => !c.oculta).map(c => c.key)
  }, [preferencias, colunas])

  const colunasFiltradas = useMemo(
    () => colunasVisiveis
      .map(key => colunas.find(c => c.key === key))
      .filter((c): c is GTColuna<T> => c != null),
    [colunas, colunasVisiveis],
  )

  const toggleColuna = useCallback(
    (key: string) => {
      const novaVisibilidade = colunasVisiveis.includes(key)
        ? colunasVisiveis.filter(k => k !== key)
        : [...colunasVisiveis, key]

      const prefs: GTPreferencias = {
        ...(preferencias ?? {}),
        colunas_visiveis: novaVisibilidade,
      }
      onSalvarPreferencias?.(prefs)
    },
    [colunasVisiveis, preferencias, onSalvarPreferencias],
  )

  const reorderColuna = useCallback(
    (fromKey: string, toKey: string) => {
      const ordem = [...colunasVisiveis]
      const fromIdx = ordem.indexOf(fromKey)
      const toIdx   = ordem.indexOf(toKey)
      if (fromIdx === -1 || toIdx === -1) return
      const [item] = ordem.splice(fromIdx, 1)
      ordem.splice(toIdx, 0, item)
      const prefs: GTPreferencias = {
        ...(preferencias ?? {}),
        colunas_visiveis: ordem,
      }
      onSalvarPreferencias?.(prefs)
    },
    [colunasVisiveis, preferencias, onSalvarPreferencias],
  )

  const selecionarTodasColunas = useCallback(() => {
    const todas = colunas.map(c => c.key)
    onSalvarPreferencias?.({ ...(preferencias ?? {}), colunas_visiveis: todas })
  }, [colunas, preferencias, onSalvarPreferencias])

  const restaurarPadraoColunas = useCallback(() => {
    const padrao = colunas.filter(c => !c.oculta).map(c => c.key)
    onSalvarPreferencias?.({ ...(preferencias ?? {}), colunas_visiveis: padrao })
  }, [colunas, preferencias, onSalvarPreferencias])


  // ── Overlay de edição ─────────────────────────────────────────────────────────
  const [overlayInfo, setOverlayInfo] = useState<{
    rect: DOMRect
    id: string
    campo: string
    isFilho: boolean
    colLabel: string
    colTipo?: string
    opcoes?: { valor: string; label: string }[]
    moedas?: GTUnidadeOpcao[]
    unidades?: GTUnidadeOpcao[]
    casasDecimais?: number
    gabiCampo?: string
    gabiEndpoint?: string
  } | null>(null)

  // ── Expand/collapse ───────────────────────────────────────────────────────────
  const { expandidos, filhosCache, carregandoFilhos, toggle, atualizarFilhoNoCache } = useGTExpandir<T, C>(
    onCarregarFilhos,
    dados,
    itemId,
  )

  /** Mostra checkbox de seleção quando há acoesLote OU onSelecaoMudar */
  const temSelecao = (acoesLote != null && acoesLote.length > 0) || onSelecaoMudar != null

  /** Template de colunas para o grid compartilhado */
  const gridTemplateCols = useMemo(() => {
    const cols: string[] = []
    if (temSelecao) cols.push('40px')
    if (onCarregarFilhos) cols.push('40px')
    cols.push(...colunasFiltradas.map(() => 'max-content'))
    if (acoes && acoes.length > 0) cols.push('max-content')
    return cols.join(' ')
  }, [temSelecao, onCarregarFilhos, colunasFiltradas, acoes])


  // ── Seleção ───────────────────────────────────────────────────────────────────
  const {
    selecionados,
    toggleItem,
    toggleTodos,
    limpar: limparSelecao,
    todosSelecionados,
    parcialmenteSelecionados,
    selecionadosArray,
  } = useGTSelecao()

  // ── Seleção de filhos ─────────────────────────────────────────────────────────
  const [filhosSelecionados, setFilhosSelecionados] = useState<Set<string>>(new Set())
  const filhosCacheMap = useRef<Map<string, C>>(new Map())

  // Mantém sempre a referência mais recente do callback para evitar stale closure
  const onSelecaoFilhoRef = useRef(onSelecaoFilho)
  useLayoutEffect(() => {
    onSelecaoFilhoRef.current = onSelecaoFilho
  }, [onSelecaoFilho])

  const toggleFilho = useCallback(
    (id: string, item: C) => {
      setFilhosSelecionados(prev => {
        const novo = new Set(prev)
        if (novo.has(id)) {
          novo.delete(id)
          filhosCacheMap.current.delete(id)
        } else {
          novo.add(id)
          filhosCacheMap.current.set(id, item)
        }
        return novo
      })
    },
    [],
  )

  // Dispara onSelecaoFilho sempre que filhosSelecionados mudar
  useEffect(() => {
    if (!onSelecaoFilhoRef.current) return
    const itens = Array.from(filhosSelecionados)
      .map(id => filhosCacheMap.current.get(id))
      .filter((i): i is C => i != null)
    onSelecaoFilhoRef.current(itens)
  }, [filhosSelecionados])

  // ── Dropdown de ações filho ───────────────────────────────────────────────────
  const [dropdownFilhoAberto, setDropdownFilhoAberto] = useState<string | null>(null)

  useEffect(() => {
    if (!dropdownFilhoAberto) return
    function fecharFora() { setDropdownFilhoAberto(null) }
    document.addEventListener('mousedown', fecharFora)
    return () => document.removeEventListener('mousedown', fecharFora)
  }, [dropdownFilhoAberto])

  // ── Drag de cabeçalho para reordenar colunas ──────────────────────────────────
  const [dragColKey,  setDragColKey]  = useState<string | null>(null)
  const [dragOverKey, setDragOverKey] = useState<string | null>(null)
  const [dropSide,    setDropSide]    = useState<'before' | 'after'>('after')

  const handleColDragStart = useCallback((key: string) => {
    setDragColKey(key)
  }, [])

  const handleColDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, key: string) => {
    e.preventDefault()
    if (!dragColKey || dragColKey === key) return
    const rect = e.currentTarget.getBoundingClientRect()
    const mid  = rect.left + rect.width / 2
    setDragOverKey(key)
    setDropSide(e.clientX < mid ? 'before' : 'after')
  }, [dragColKey])

  const handleColDrop = useCallback((e: React.DragEvent<HTMLDivElement>, targetKey: string) => {
    e.preventDefault()
    if (!dragColKey || dragColKey === targetKey) {
      setDragColKey(null); setDragOverKey(null)
      return
    }
    const ordem = [...colunasVisiveis]
    const fromIdx = ordem.indexOf(dragColKey)
    const toIdx   = ordem.indexOf(targetKey)
    if (fromIdx < 0 || toIdx < 0) { setDragColKey(null); setDragOverKey(null); return }
    ordem.splice(fromIdx, 1)
    const inserirEm = ordem.indexOf(targetKey)
    const offset    = dropSide === 'after' ? 1 : 0
    ordem.splice(inserirEm + offset, 0, dragColKey)
    onSalvarPreferencias?.({
      ...(preferencias ?? {}),
      colunas_visiveis: ordem,
    })
    setDragColKey(null); setDragOverKey(null)
  }, [dragColKey, colunasVisiveis, dropSide, onSalvarPreferencias, preferencias])

  const handleColDragEnd = useCallback(() => {
    setDragColKey(null); setDragOverKey(null)
  }, [])

  // ── Edição inline ─────────────────────────────────────────────────────────────
  const {
    editandoCelula: editandoCelulaPai,
    valorEditando: valorEditandoPai,
    salvando: salvandoPai,
    iniciarEdicao: iniciarEdicaoPai,
    atualizarValor: atualizarValorPai,
    confirmarEdicao: confirmarEdicaoPai,
    cancelarEdicao: cancelarEdicaoPai,
  } = useGTInlineEdit<T>(
    onEditar,
    undefined,
    onSalvoComSucesso,
    onErroAoSalvar,
  )

  const atualizarFilhoCacheCallback = useCallback(
    (filho: C) => atualizarFilhoNoCache(filho, filhoId),
    [atualizarFilhoNoCache, filhoId],
  )

  const {
    editandoCelula: editandoCelulaFilho,
    valorEditando: valorEditandoFilho,
    salvando: salvandoFilho,
    iniciarEdicao: iniciarEdicaoFilho,
    atualizarValor: atualizarValorFilho,
    confirmarEdicao: confirmarEdicaoFilho,
    cancelarEdicao: cancelarEdicaoFilho,
  } = useGTInlineEdit<C>(
    onEditarFilho,
    atualizarFilhoCacheCallback,
    onSalvoComSucesso,
    onErroAoSalvar,
  )

  // ── Paginação ─────────────────────────────────────────────────────────────────
  const modoExterno = totalItens !== undefined
  const [paginaInterna, setPaginaInterna] = useState(1)
  const paginaEfetiva = modoExterno ? (paginaAtual ?? 1) : paginaInterna

  // Pagina os itens pai. No modo externo, dados já é a página atual.
  const dadosPagina = useMemo(
    () => modoExterno
      ? dados
      : dados.slice((paginaEfetiva - 1) * itensPorPagina, paginaEfetiva * itensPorPagina),
    [dados, modoExterno, paginaEfetiva, itensPorPagina],
  )

  const todosIds = useMemo(() => dadosPagina.map(itemId), [dadosPagina, itemId])

  // Flat rows incluindo filhos expandidos — apenas para a página atual
  const linhasPagina = useMemo(
    () => buildFlatRows<T, C>(dadosPagina, expandidos, filhosCache, itemId, filhoId),
    [dadosPagina, expandidos, filhosCache, itemId, filhoId],
  )

  const totalEfetivo = modoExterno ? totalItens : dados.length
  const totalPaginas = Math.ceil(totalEfetivo / itensPorPagina)

  const mudarPagina = useCallback((pagina: number) => {
    if (modoExterno) {
      onMudarPagina?.(pagina)
    } else {
      setPaginaInterna(pagina)
    }
  }, [modoExterno, onMudarPagina])

  // ── Find-in-page ─────────────────────────────────────────────────────────────
  type GTFindMatch =
    | { tipo: 'header'; colKey: string }
    | { tipo: 'celula'; linhaIndex: number; colKey: string }


  const findMatches = useMemo<GTFindMatch[]>(() => {
    if (!termoBusca.trim()) return []
    const termo = termoBusca.trim().toLowerCase()
    const result: GTFindMatch[] = []
    // Headers primeiro (sempre visíveis no topo)
    for (const col of colunasFiltradas) {
      if (col.label.toLowerCase().includes(termo)) {
        result.push({ tipo: 'header', colKey: col.key as string })
      }
    }
    // Células na ordem das linhas da página atual (pai e filhos expandidos)
    for (let i = 0; i < linhasPagina.length; i++) {
      const linha = linhasPagina[i]
      const item = linha.item as Record<string, unknown>
      for (const col of colunasFiltradas) {
        const k = col.key as string
        // Filhos usam mapaColunasFilho para traduzir col.key → campo real do objeto filho
        const campoReal = linha.tipo === 'filho' && mapaColunasFilho
          ? (mapaColunasFilho[k]?.campo ?? k)
          : k
        const v = item[campoReal]
        const vStr = valorParaStringFind(v, col as GTColuna<unknown>, item)
        if (vStr.toLowerCase().includes(termo)) {
          result.push({ tipo: 'celula', linhaIndex: i, colKey: k })
        }
      }
    }
    return result
  }, [termoBusca, linhasPagina, colunasFiltradas, mapaColunasFilho])

  // Sinaliza que ao carregar a próxima página o foco deve ir para o ÚLTIMO match
  const irParaUltimoMatchRef = useRef(false)
  // Offset pendente — aplicado apenas quando novos dados chegam (evita flash no counter)
  const findOffsetPendenteRef = useRef(0)

  const findProximo = useCallback(() => {
    if (findAtivo === findMatches.length - 1 && onFindProximaPagina) {
      // Guarda o offset acumulado; será aplicado no useEffect quando a nova página carregar
      findOffsetPendenteRef.current = findOffset + findMatches.length
      onFindProximaPagina()
    } else {
      setFindAtivo(i => (i + 1) % Math.max(findMatches.length, 1))
    }
  }, [findAtivo, findMatches.length, findOffset, onFindProximaPagina])

  const findAnterior = useCallback(() => {
    if (findAtivo === 0 && onFindPaginaAnterior) {
      irParaUltimoMatchRef.current = true
      // Guarda offset atual; useEffect subtrairá os matches da página anterior
      findOffsetPendenteRef.current = findOffset
      onFindPaginaAnterior()
    } else {
      setFindAtivo(i => (i - 1 + Math.max(findMatches.length, 1)) % Math.max(findMatches.length, 1))
    }
  }, [findAtivo, findMatches.length, findOffset, onFindPaginaAnterior])

  // ── Find: reset ativo ao mudar matches ───────────────────────────────────────
  useEffect(() => {
    if (irParaUltimoMatchRef.current && findMatches.length > 0) {
      // Voltando para página anterior: desconta os matches da nova página do offset
      const novoOffset = Math.max(0, findOffsetPendenteRef.current - findMatches.length)
      findOffsetPendenteRef.current = novoOffset
      setFindOffset(novoOffset)
      setFindAtivo(findMatches.length - 1)
      irParaUltimoMatchRef.current = false
    } else {
      // Avançando para próxima página: aplica o offset pendente
      setFindOffset(findOffsetPendenteRef.current)
      setFindAtivo(0)
    }
  }, [findMatches])

  // ── Find: notifica pai quando termo muda (pai busca total no banco) ──────────
  // Usa ref para isolar o efeito de mudanças de referência do callback.
  // O efeito só dispara quando o TERMO ou modoLocalizar muda, não quando o pai
  // re-renderiza (ex: após receber findTotalExterno do servidor).
  const onFindTermoChangeRef = useRef(onFindTermoChange)
  useEffect(() => { onFindTermoChangeRef.current = onFindTermoChange }, [onFindTermoChange])

  useEffect(() => {
    if (!modoLocalizar || !onFindTermoChangeRef.current) return
    onFindTermoChangeRef.current(termoBusca.trim())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termoBusca, modoLocalizar])

  // ── Find: reset offset ao mudar o termo de busca ─────────────────────────────
  useEffect(() => {
    findOffsetPendenteRef.current = 0
    setFindOffset(0)
  }, [termoBusca])

  // ── Find: scroll para trazer o match ativo para a viewport (vertical + horizontal)
  useEffect(() => {
    if (!modoLocalizar || findMatches.length === 0) return
    const match = findMatches[findAtivo]
    if (!match) return

    const container = scrollContainerRef.current
    if (!container) return

    if (match.tipo === 'celula') {
      // Célula ativa: scroll vertical + horizontal com compensação de header sticky
      const cellEl = container.querySelector<HTMLElement>('.gtv-celula--find-match-ativo')
      if (cellEl) {
        const cr  = container.getBoundingClientRect()
        const cel = cellEl.getBoundingClientRect()
        const headerHeight = (container.querySelector<HTMLElement>('.gtv-th')?.offsetHeight ?? 44)

        let newTop  = container.scrollTop
        let newLeft = container.scrollLeft

        // Vertical: ajusta se a célula está atrás do header (topo) ou abaixo da viewport
        if (cel.top - cr.top < headerHeight) {
          newTop = container.scrollTop - (headerHeight - (cel.top - cr.top)) - 4
        } else if (cel.bottom - cr.top > container.clientHeight) {
          newTop = container.scrollTop + (cel.bottom - cr.top - container.clientHeight) + 4
        }

        // Horizontal: ajusta se a célula está fora das bordas laterais
        if (cel.left < cr.left) {
          newLeft = container.scrollLeft + (cel.left - cr.left) - 4
        } else if (cel.right > cr.right) {
          newLeft = container.scrollLeft + (cel.right - cr.right) + 4
        }

        container.scrollTo({ top: newTop, left: newLeft, behavior: 'smooth' })
      }
    } else {
      // Header match: scroll horizontal apenas (header é sticky, sempre visível verticalmente)
      const headerEl = container.querySelector<HTMLElement>(`[data-find-col-key="${match.colKey}"]`)
      headerEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
    }
  }, [findAtivo, findMatches, modoLocalizar])

  // ── Itens selecionados (objetos) ──────────────────────────────────────────────
  const itensSelecionados = useMemo(
    () => dados.filter(item => selecionados.has(itemId(item))),
    [dados, selecionados, itemId],
  )

  // Ref síncrona para evitar stale closure sem incluir onSelecaoMudar nas deps
  const onSelecaoMudarRef = useRef(onSelecaoMudar)
  useLayoutEffect(() => {
    onSelecaoMudarRef.current = onSelecaoMudar
  }, [onSelecaoMudar])

  useEffect(() => {
    onSelecaoMudarRef.current?.(itensSelecionados)
  }, [itensSelecionados])

  // ── Fechar menus ao clicar fora ───────────────────────────────────────────────

  // ── Fechar overlay ao sair do modo edição ────────────────────────────────────
  useEffect(() => {
    if (!editandoCelulaPai && !editandoCelulaFilho) {
      setOverlayInfo(null)
    }
  }, [editandoCelulaPai, editandoCelulaFilho])

  // ── Core: distribui valores em linhas consecutivas a partir de um id ─────────
  const aplicarSmartPaste = useCallback(async (
    startId: string,
    campo: string,
    colTipo: string | undefined,
    valores: string[],
    valorAtual: unknown,
    isFilho = false,
  ) => {
    const editarFn = isFilho ? onEditarFilho : onEditar
    if (!editarFn) return
    const linhasAlvo = isFilho
      ? linhasPagina.filter((l): l is GTLinhaVirtual<T, C> & { tipo: 'filho' } => l.tipo === 'filho')
      : linhasPagina.filter((l): l is GTLinhaVirtual<T, C> & { tipo: 'pai' } => l.tipo === 'pai')
    const idxAtual  = linhasAlvo.findIndex(l => l.id === startId)
    if (idxAtual < 0) return
    const promises: Promise<void>[] = []
    for (let i = 0; i < valores.length; i++) {
      const linha = linhasAlvo[idxAtual + i]
      if (!linha) break
      const valorParsado = parsearLinhaSmartPaste(valores[i], colTipo, valorAtual)
      promises.push(
        editarFn(linha.id, campo, valorParsado)
          .then(() => {})
          .catch(err => { onErroAoSalvar?.(err instanceof Error ? err.message : 'Erro ao salvar em lote') })
      )
    }
    await Promise.all(promises)
    onSalvoComSucesso?.()
  }, [onEditar, onEditarFilho, linhasPagina, onSalvoComSucesso])

  // ── Smart paste vindo do popover ──────────────────────────────────────────────
  const handleSmartPaste = useCallback(async (valores: string[]) => {
    if (!overlayInfo) return
    const valorAtual = overlayInfo.isFilho ? valorEditandoFilho : valorEditandoPai
    if (overlayInfo.isFilho) cancelarEdicaoFilho()
    else cancelarEdicaoPai()
    await aplicarSmartPaste(overlayInfo.id, overlayInfo.campo, overlayInfo.colTipo, valores, valorAtual, overlayInfo.isFilho)
  }, [overlayInfo, valorEditandoPai, valorEditandoFilho, cancelarEdicaoPai, cancelarEdicaoFilho, aplicarSmartPaste])

  // ─── Helpers find-in-page ────────────────────────────────────────────────────

  function isCelulaMatch(linhaIndex: number, colKey: string): boolean {
    return findMatches.some(m => m.tipo === 'celula' && m.linhaIndex === linhaIndex && m.colKey === colKey)
  }

  function isCelulaMatchAtivo(linhaIndex: number, colKey: string): boolean {
    if (findMatches.length === 0) return false
    const m = findMatches[findAtivo]
    return m != null && m.tipo === 'celula' && m.linhaIndex === linhaIndex && m.colKey === colKey
  }

  // ─── Renderização de célula ──────────────────────────────────────────────────

  function renderCelula<I>(
    item: I,
    id: string,
    col: GTColuna<I>,
    isFilho: boolean,
    isPrimeiraCelula = false,
    linhaIndex = -1,
  ) {
    const valor = (item as Record<string, unknown>)[col.key]

    const editandoCelula  = isFilho ? editandoCelulaFilho  : editandoCelulaPai
    const valorEditando   = isFilho ? valorEditandoFilho   : valorEditandoPai
    const salvando        = isFilho ? salvandoFilho        : salvandoPai
    const iniciarEdicao   = isFilho ? iniciarEdicaoFilho   : iniciarEdicaoPai
    const atualizarValor  = isFilho ? atualizarValorFilho  : atualizarValorPai
    const confirmarEdicao = isFilho ? confirmarEdicaoFilho : confirmarEdicaoPai
    const cancelarEdicao  = isFilho ? cancelarEdicaoFilho  : cancelarEdicaoPai

    const podeEditar =
      ((isFilho ? camposEditaveisFilhos : camposEditaveis).includes(col.key) || col.editavel) &&
      !!(isFilho ? onEditarFilho : onEditar)
    const estaEditando =
      editandoCelula?.id === id && editandoCelula?.campo === col.key

    const classeAlinhamento = col.align === 'left' ? ' gtv-celula--left' : col.align === 'right' ? ' gtv-celula--right' : ' gtv-celula--center'

    const classeIndent      = ''
    const classeEditavel    = podeEditar ? ' gtv-celula--editavel' : ''
    const classeFindMatch   = linhaIndex >= 0 && isCelulaMatch(linhaIndex, col.key as string) ? ' gtv-celula--find-match' : ''
    const classeFindAtivo   = linhaIndex >= 0 && isCelulaMatchAtivo(linhaIndex, col.key as string) ? ' gtv-celula--find-match-ativo' : ''

    const styleCelula: React.CSSProperties = {}

    // Overlay está ativo para esta célula específica
    const overlayAtivo = overlayInfo?.id === id && overlayInfo?.campo === col.key

    // Conteúdo renderizado da célula (fora do estado de edição)
    const valorStr = !col.render ? String(valor ?? '') : ''
    const valorTruncado = valorStr.length > 150 ? valorStr.slice(0, 150) + '…' : valorStr
    const innerContent = col.render ? col.render(valor, item) : valorTruncado

    // Tooltip: só para células sem render customizado (texto puro).
    // Células com render (badges, ícones) já são auto-descritivas.
    // Quando conteúdo > 150 chars, tooltip mostra valor completo; abaixo, idem (ou dica de edição).
    const tooltipDescr = !col.render && !estaEditando && !overlayAtivo
      ? (valor != null && valor !== ''
          ? valorStr
          : podeEditar ? 'Clique para editar' : undefined)
      : undefined

    // Para células com tooltip: o TooltipGlobal envolve um <span> simples.
    // Para células sem tooltip: renderiza o conteúdo diretamente.
    // Não usamos gtv-celula-conteudo (evita dependência circular de width).
    const celConteudo = tooltipDescr ? (
      <TooltipGlobal titulo={col.label} descricao={tooltipDescr}>
        <span className="gtv-celula-text">{innerContent as string}</span>
      </TooltipGlobal>
    ) : (
      <>{innerContent}</>
    )

    return (
      <div
        key={col.key}
        className={`gtv-celula${classeAlinhamento}${classeIndent}${classeEditavel}${classeFindMatch}${classeFindAtivo}`}
        style={styleCelula}
        tabIndex={podeEditar && !estaEditando ? 0 : undefined}
        onClick={e => {
          if (podeEditar && !estaEditando) {
            e.stopPropagation()
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
            const colU = col as GTColuna<unknown>
            setOverlayInfo({ rect, id, campo: col.key, isFilho, colLabel: col.label, colTipo: col.tipo, opcoes: colU.opcoes, moedas: colU.moedas, unidades: colU.unidades, casasDecimais: colU.casasDecimais, gabiCampo: colU.gabiCampo, gabiEndpoint: colU.gabiEndpoint })
            const valorParaEdicao = colU.getValorEditar ? colU.getValorEditar(item) : valor
            iniciarEdicao(id, col.key, valorParaEdicao)
          }
        }}
        onKeyDown={podeEditar && !estaEditando ? async (e) => {
          const ctrl = e.ctrlKey || e.metaKey
          if (!ctrl) return
          const colU = col as GTColuna<unknown>
          const valorAtual = colU.getValorEditar ? colU.getValorEditar(item) : valor

          if (e.key === 'c') {
            e.preventDefault()
            if (!navigator.clipboard) return
            try {
              await navigator.clipboard.writeText(formatarOverlayValor(valorAtual, col.tipo, (col as GTColuna<unknown>).casasDecimais))
            } catch {}
          }

          if (e.key === 'v') {
            e.preventDefault()
            if (!navigator.clipboard) return
            try {
              const texto = await navigator.clipboard.readText()
              const linhas = texto.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
              if (!linhas.length) return
              if (linhas.length === 1) {
                const editarFn = isFilho ? onEditarFilho : onEditar
                if (editarFn) {
                  const valorParsado = parsearLinhaSmartPaste(linhas[0], col.tipo, valorAtual)
                  try {
                    await editarFn(id, col.key, valorParsado)
                    onSalvoComSucesso?.()
                  } catch (err) {
                    onErroAoSalvar?.(err instanceof Error ? err.message : 'Erro ao salvar')
                  }
                }
              } else {
                await aplicarSmartPaste(id, col.key, col.tipo, linhas, valorAtual, isFilho)
              }
            } catch {
              // clipboard indisponível (contexto não seguro ou permissão negada)
            }
          }
        } : undefined}
      >
        {estaEditando && overlayAtivo ? (
          // Overlay ativo: mostra indicador visual, o input real está no popover flutuante
          <span className="gtv-celula--editando-overlay">
            {(col as GTColuna<unknown>).opcoes?.find(op => op.valor === String(valorEditando))?.label
              ?? formatarOverlayValor(valorEditando, col.tipo, (col as GTColuna<unknown>).casasDecimais)}
          </span>
        ) : estaEditando ? (
          <input
            autoFocus
            className="gtv-celula-input"
            value={String(valorEditando ?? '')}
            disabled={salvando}
            onChange={e => atualizarValor(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); confirmarEdicao() }
              if (e.key === 'Escape') cancelarEdicao()
            }}
            onBlur={() => confirmarEdicao()}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          celConteudo
        )}
      </div>
    )
  }

  // ─── Renderização de linha ───────────────────────────────────────────────────

  function renderLinhaPai(linha: GTLinhaVirtual<T, C> & { tipo: 'pai' }, linhaVirtualIndex: number) {
    const { item, id } = linha
    const expandido = expandidos.has(id)
    const carregando_ = carregandoFilhos.has(id)
    const selecionado = selecionados.has(id)
    // Se o cache ainda não foi populado para este id, assume que pode ter filhos (loader definido).
    // Após o primeiro carregamento, mostra o botão apenas se há filhos de fato.
    const temFilhos = filhosCache.has(id)
      ? (filhosCache.get(id)?.length ?? 0) > 0
      : onCarregarFilhos != null

    const classeLinha = [
      'gtv-linha',
      'gtv-linha--pai',
      expandido ? 'gtv-linha--expandida' : '',
      selecionado ? 'gtv-linha--selecionada' : '',
    ].filter(Boolean).join(' ')

    return (
      <div className={classeLinha}>
        {/* Checkbox */}
        {temSelecao && (
          <div className="gtv-celula gtv-celula--check gtv-col-fixa">
            <input
              type="checkbox"
              className="gtv-checkbox"
              checked={selecionados.has(id)}
              aria-label={`Selecionar linha`}
              onChange={() => toggleItem(id)}
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}

        {/* Botão expand */}
        {onCarregarFilhos && (
          <div
            className="gtv-celula gtv-celula--expand gtv-col-fixa"
          >
            {carregando_ ? (
              <span className="gtv-spinner" aria-label="Carregando filhos..." />
            ) : (
              <button
                className="gtv-chevron-btn"
                aria-expanded={expandido}
                aria-label={expandido ? 'Colapsar' : 'Expandir'}
                onClick={e => {
                  e.stopPropagation()
                  toggle(id, item)
                }}
              >
                <span className={`gtv-chevron-icon${expandido ? ' gtv-chevron-icon--aberto' : ''}`}>
                  <IconeChevron />
                </span>
              </button>
            )}
          </div>
        )}

        {/* Células de dados */}
        {colunasFiltradas.map(col =>
          renderCelula<T>(item, id, col as GTColuna<T>, false, false, linhaVirtualIndex)
        )}

        {/* Ações de linha */}
        {acoes && acoes.length > 0 && (
          <div className="gtv-celula gtv-celula--acoes gtv-col-fixa">
            <div className="gtv-acoes-grupo">
              {acoes.map(acao => {
                if (acao.visivel && !acao.visivel(item)) return null
                if (acao.renderCustom) {
                  return <span key={acao.id}>{acao.renderCustom(item)}</span>
                }
                return (
                  <button
                    key={acao.id}
                    className={`gtv-acao-btn${acao.variant === 'danger' ? ' gtv-acao-btn--danger' : ''}`}
                    title={acao.tooltip}
                    aria-label={acao.tooltip}
                    onClick={e => {
                      e.stopPropagation()
                      acao.onClick?.(item)
                    }}
                  >
                    {acao.icone}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  function renderLinhaFilha(linha: GTLinhaVirtual<T, C> & { tipo: 'filho' }, linhaVirtualIndex: number) {
    const { item, id } = linha

    // ── Modo mapeado: filho usa as mesmas colunas do pai ──────────────────────
    if (mapaColunasFilho) {
      const filhoSel = filhosSelecionados.has(id)
      const acoesDoFilho = acoesFilho ? acoesFilho(item) : []
      const dropAberto = dropdownFilhoAberto === id

      return (
        <div className={`gtv-linha gtv-linha--filho${filhoSel ? ' gtv-linha--filho-selecionada' : ''}`}>
          {temSelecao && (
            <div className="gtv-celula gtv-celula--check gtv-col-fixa">
              {selecionavelFilhos && (
                <input
                  type="checkbox"
                  className="gtv-checkbox gtv-checkbox--filho"
                  checked={filhoSel}
                  aria-label="Selecionar item"
                  onChange={() => toggleFilho(id, item)}
                  onClick={e => e.stopPropagation()}
                />
              )}
            </div>
          )}
          {onCarregarFilhos && (
            <div
              className="gtv-celula gtv-celula--expand gtv-col-fixa"
            >
              <span className="gtv-conector" aria-hidden="true">
                {renderConectorFilho ? renderConectorFilho(item) : '└'}
              </span>
            </div>
          )}

          {colunasFiltradas.map((col, idx) => {
            const mapa = mapaColunasFilho[col.key as string]
            const campo = mapa?.campo ?? (col.key as string)
            const editavelMapa = typeof mapa?.editavel === 'function' ? mapa.editavel(item) : !!mapa?.editavel
            const podeEditar = (editavelMapa || camposEditaveisFilhos.includes(col.key as string)) && !!onEditarFilho
            const estaEditando = editandoCelulaFilho?.id === id && editandoCelulaFilho?.campo === campo
            const overlayAtivo  = overlayInfo?.id === id && overlayInfo?.campo === campo

            const classeAlinhamento = col.align === 'left' ? ' gtv-celula--left' : col.align === 'right' ? ' gtv-celula--right' : ' gtv-celula--center'
            const classeEditavel    = podeEditar ? ' gtv-celula--editavel' : ''
            const classeFindMatch   = isCelulaMatch(linhaVirtualIndex, col.key as string) ? ' gtv-celula--find-match' : ''
            const classeFindAtivo   = isCelulaMatchAtivo(linhaVirtualIndex, col.key as string) ? ' gtv-celula--find-match-ativo' : ''

            const styleCelula: React.CSSProperties = {}

            const valor = (item as Record<string, unknown>)[campo]

            return (
              <div
                key={col.key as string}
                className={`gtv-celula${classeAlinhamento}${classeEditavel}${classeFindMatch}${classeFindAtivo}`}
                style={styleCelula}
                onClick={podeEditar && !estaEditando ? (e) => {
                  e.stopPropagation()
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                  const colU2 = col as GTColuna<unknown>
                  setOverlayInfo({ rect, id, campo, isFilho: true, colLabel: col.label, colTipo: col.tipo, opcoes: colU2.opcoes, moedas: colU2.moedas, unidades: mapa?.unidades ?? colU2.unidades, casasDecimais: mapa?.casasDecimais ?? colU2.casasDecimais, gabiCampo: colU2.gabiCampo, gabiEndpoint: colU2.gabiEndpoint })
                  const valorFilhoParaEdicao = mapa?.getValorEditar ? mapa.getValorEditar(item) : (colU2.getValorEditar ? colU2.getValorEditar(item as unknown) : valor)
                  iniciarEdicaoFilho(id, campo, valorFilhoParaEdicao)
                } : undefined}
              >
                {estaEditando && overlayAtivo ? (
                  <span className="gtv-celula--editando-overlay">
                    {(col as GTColuna<unknown>).opcoes?.find(op => op.valor === String(valorEditandoFilho))?.label
                      ?? formatarOverlayValor(valorEditandoFilho, col.tipo, mapa?.casasDecimais ?? (col as GTColuna<unknown>).casasDecimais)}
                  </span>
                ) : estaEditando ? (
                  <input
                    autoFocus
                    className="gtv-celula-input"
                    value={String(valorEditandoFilho ?? '')}
                    disabled={salvandoFilho}
                    onChange={e => atualizarValorFilho(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { e.preventDefault(); confirmarEdicaoFilho() }
                      if (e.key === 'Escape') cancelarEdicaoFilho()
                    }}
                    onBlur={() => confirmarEdicaoFilho()}
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  mapa ? mapa.render(item) : ((item as Record<string, unknown>)[campo] != null ? String((item as Record<string, unknown>)[campo]) : '—')
                )}
              </div>
            )
          })}

          {acoesFilhas && acoesFilhas.length > 0 && (
            <div className="gtv-celula gtv-celula--acoes gtv-col-fixa">
              <div className="gtv-acoes-grupo">
                {acoesFilhas.map(acao => {
                  if (acao.visivel && !acao.visivel(item)) return null
                  if (acao.renderCustom) return <span key={acao.id}>{acao.renderCustom(item)}</span>
                  return (
                    <button
                      key={acao.id}
                      className={`gtv-acao-btn${acao.variant === 'danger' ? ' gtv-acao-btn--danger' : ''}`}
                      title={acao.tooltip}
                      aria-label={acao.tooltip}
                      onClick={e => { e.stopPropagation(); acao.onClick?.(item) }}
                    >
                      {acao.icone}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {acoesDoFilho.length > 0 && (
            <div
              className="gtv-celula gtv-celula--acoes gtv-celula--acoes-filho gtv-col-fixa"
              onMouseDown={e => e.stopPropagation()}
            >
              <div style={{ position: 'relative' }}>
                <button
                  className="gtv-acao-btn gtv-acao-btn--tres-pontos"
                  title="Mais ações"
                  aria-label="Mais ações"
                  aria-expanded={dropAberto}
                  onClick={e => {
                    e.stopPropagation()
                    setDropdownFilhoAberto(dropAberto ? null : id)
                  }}
                >
                  ⋯
                </button>
                {dropAberto && (
                  <div className="gtv-dropdown-filho" onMouseDown={e => e.stopPropagation()}>
                    {acoesDoFilho.map((acao, idx) => (
                      <button
                        key={idx}
                        className={`gtv-dropdown-filho-item${acao.perigo ? ' gtv-dropdown-filho-item--perigo' : ''}`}
                        onClick={e => {
                          e.stopPropagation()
                          setDropdownFilhoAberto(null)
                          acao.onClick()
                        }}
                      >
                        {acao.icone && <span className="gtv-dropdown-filho-icone">{acao.icone}</span>}
                        {acao.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )
    }

    // ── Modo original: filho usa colunasFilhas ────────────────────────────────
    const colsFilhas = colunasFilhas ?? (colunasFiltradas as unknown as GTColuna<C>[])
    const filhoSelOrig = filhosSelecionados.has(id)
    const acoesDoFilhoOrig = acoesFilho ? acoesFilho(item) : []
    const dropAbertoOrig = dropdownFilhoAberto === id

    return (
      <div className={`gtv-linha gtv-linha--filho${filhoSelOrig ? ' gtv-linha--filho-selecionada' : ''}`}>
        {/* Espaço para alinhar com checkbox pai */}
        {temSelecao && (
          <div className="gtv-celula gtv-celula--check gtv-col-fixa">
            {selecionavelFilhos && (
              <input
                type="checkbox"
                className="gtv-checkbox gtv-checkbox--filho"
                checked={filhoSelOrig}
                aria-label="Selecionar item"
                onChange={() => toggleFilho(id, item)}
                onClick={e => e.stopPropagation()}
              />
            )}
          </div>
        )}

        {/* Conector hierárquico */}
        {onCarregarFilhos && (
          <div
            className="gtv-celula gtv-celula--expand gtv-col-fixa"
          >
            <span className="gtv-conector" aria-hidden="true">└</span>
          </div>
        )}


        {/* Células filhas */}
        {colsFilhas.map((col, idx) =>
          renderCelula<C>(item, id, col, true, idx === 0, linhaVirtualIndex)
        )}

        {/* Ações de linha filha */}
        {acoesFilhas && acoesFilhas.length > 0 && (
          <div className="gtv-celula gtv-celula--acoes gtv-col-fixa">
            <div className="gtv-acoes-grupo">
              {acoesFilhas.map(acao => {
                if (acao.visivel && !acao.visivel(item)) return null
                if (acao.renderCustom) {
                  return <span key={acao.id}>{acao.renderCustom(item)}</span>
                }
                return (
                  <button
                    key={acao.id}
                    className={`gtv-acao-btn${acao.variant === 'danger' ? ' gtv-acao-btn--danger' : ''}`}
                    title={acao.tooltip}
                    aria-label={acao.tooltip}
                    onClick={e => {
                      e.stopPropagation()
                      acao.onClick?.(item)
                    }}
                  >
                    {acao.icone}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {acoesDoFilhoOrig.length > 0 && (
          <div
            className="gtv-celula gtv-celula--acoes gtv-celula--acoes-filho gtv-col-fixa"
            onMouseDown={e => e.stopPropagation()}
          >
            <div style={{ position: 'relative' }}>
              <button
                className="gtv-acao-btn gtv-acao-btn--tres-pontos"
                title="Mais ações"
                aria-label="Mais ações"
                aria-expanded={dropAbertoOrig}
                onClick={e => {
                  e.stopPropagation()
                  setDropdownFilhoAberto(dropAbertoOrig ? null : id)
                }}
              >
                ⋯
              </button>
              {dropAbertoOrig && (
                <div className="gtv-dropdown-filho" onMouseDown={e => e.stopPropagation()}>
                  {acoesDoFilhoOrig.map((acao, idx) => (
                    <button
                      key={idx}
                      className={`gtv-dropdown-filho-item${acao.perigo ? ' gtv-dropdown-filho-item--perigo' : ''}`}
                      onClick={e => {
                        e.stopPropagation()
                        setDropdownFilhoAberto(null)
                        acao.onClick()
                      }}
                    >
                      {acao.icone && <span className="gtv-dropdown-filho-icone">{acao.icone}</span>}
                      {acao.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ─── Render principal ────────────────────────────────────────────────────────

  const todosSel = todosSelecionados(todosIds)
  const parcialSel = parcialmenteSelecionados(todosIds)

  return (
    <div
      className="gtv-container"
      role="region"
      aria-label={ariaLabel}
    >
      {/* Abas de status */}
      {abas && abas.length > 0 && (
        <GTAbas abas={abas} abaAtiva={abaAtiva} onMudarAba={onMudarAba} />
      )}

      {/* Toolbar */}
      <div className="gtv-toolbar">
        <div className="gtv-toolbar-esquerda">
          {/* Busca / Find-in-page */}
          {(onBuscar || modoLocalizar) && (
            <div className="gtv-find-bar">
              <div className="gtv-busca-wrapper">
                <span className="gtv-busca-icone"><IconeBusca /></span>
                <input
                  type="text"
                  className="gtv-busca-input"
                  placeholder={placeholderBusca}
                  value={termoBusca}
                  onChange={handleBusca}
                  aria-label="Localizar"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && findMatches.length > 0) {
                      e.preventDefault()
                      if (e.shiftKey) findAnterior()
                      else findProximo()
                    }
                  }}
                />
                {termoBusca && (
                  <button className="gtv-busca-clear" onClick={limparBusca} aria-label="Limpar busca">
                    <IconeX />
                  </button>
                )}
              </div>
              {termoBusca && (
                findMatches.length > 0 ? (
                  <div className="gtv-find-nav" role="status" aria-live="polite">
                    <span className="gtv-find-count">
                      {findOffset + findAtivo + 1} de {findTotalExterno ?? (onFindProximaPagina ? `${findOffset + findMatches.length}+` : findOffset + findMatches.length)}
                    </span>
                    {(findMatches.length > 1 || onFindProximaPagina || onFindPaginaAnterior) && (
                      <>
                        <button className="gtv-find-btn" onClick={findAnterior} aria-label="Match anterior">
                          <IconeArrowUp />
                        </button>
                        <button className="gtv-find-btn" onClick={findProximo} aria-label="Próximo match">
                          <IconeArrowDown />
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <span className="gtv-find-sem-resultado" aria-live="polite">Sem resultados</span>
                )
              )}
            </div>
          )}

          {/* Slot de ações da barra */}
          {acoesBarra}

          {/* Indicador de salvamento */}
          {(salvandoPai || salvandoFilho) && (
            <span className="gtv-salvando" aria-live="polite">
              <span className="gtv-spinner" aria-hidden="true" />
              Salvando...
            </span>
          )}
        </div>

        <div className="gtv-toolbar-direita">
          {/* Visibilidade de colunas */}
          {onSalvarPreferencias && (
            <div style={{ position: 'relative' }}>
              <button
                ref={colunasBtnRef}
                className={`gtv-btn${colunasAbertas ? ' gtv-btn--ativo' : ''}`}
                onClick={() => setColunasAbertas(v => !v)}
                aria-label="Gerenciar colunas"
                title="Colunas"
              >
                <IconeColunas />
                Colunas
              </button>
              {colunasAbertas && (
                <SelectColunasGlobal
                  colunas={[
                    ...colunasVisiveis
                      .map(key => colunas.find(c => c.key === key))
                      .filter((c): c is GTColuna<T> => c != null)
                      .map(c => ({ key: c.key, label: c.label, naoOcultavel: c.naoOcultavel, grupo: c.grupo })),
                    ...colunas
                      .filter(c => !colunasVisiveis.includes(c.key))
                      .map(c => ({ key: c.key, label: c.label, naoOcultavel: c.naoOcultavel, grupo: c.grupo })),
                  ]}
                  colunasVisiveis={colunasVisiveis}
                  onToggle={toggleColuna}
                  onFechar={() => setColunasAbertas(false)}
                  onReordenar={reorderColuna}
                  onSelecionarTodos={selecionarTodasColunas}
                  onRestaurarPadrao={restaurarPadraoColunas}
                  triggerRef={colunasBtnRef}
                  posicao={{ position: 'absolute', top: '100%', right: 0, zIndex: 50 }}
                />
              )}
            </div>
          )}

          {/* Export */}
          {acoesExportacao && acoesExportacao.length > 0 && (
            <BotaoCompletoExportar acoes={acoesExportacao} />
          )}
        </div>
      </div>

      {/* Barra de ações em lote */}
      {acoesLote && acoesLote.length > 0 && selecionadosArray.length > 0 && (
        <div className="gtv-lote-bar" role="toolbar" aria-label="Ações em lote">
          <span className="gtv-lote-info">
            {selecionadosArray.length} {selecionadosArray.length === 1 ? 'item selecionado' : 'itens selecionados'}
          </span>
          <div className="gtv-lote-acoes">
            {acoesLote.map(acao => (
              <button
                key={acao.id}
                className={`gtv-lote-btn${acao.variant === 'danger' ? ' gtv-lote-btn--danger' : ''}`}
                onClick={() => {
                  acao.onClick(itensSelecionados)
                  limparSelecao()
                }}
              >
                {acao.icone}
                {acao.label}
              </button>
            ))}
            <button
              className="gtv-lote-btn gtv-lote-btn--ghost"
              onClick={limparSelecao}
              aria-label="Cancelar seleção"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Skeleton de carregamento */}
      {carregando ? (
        <GTSkeleton />
      ) : (
        <div
          ref={scrollContainerRef}
          className="gtv-tabela-scroll"
          role="rowgroup"
          aria-label="Linhas da tabela"
        >
          {dados.length === 0 ? (
            <GTVazio
              emptyIcon={emptyIcon}
              emptyTitle={emptyTitle}
              emptyDescription={emptyDescription}
              emptyAction={emptyAction}
            />
          ) : (
            /* Grade compartilhada: header + linhas como filhos diretos */
            <div
              className="gtv-grade"
              style={{ gridTemplateColumns: gridTemplateCols }}
            >
              {/* Cabeçalho — display:contents faz os th serem filhos diretos do grid */}
              <div className="gtv-cabecalho" role="row">
                {temSelecao && (
                  <div className="gtv-th gtv-th--check gtv-col-fixa" role="columnheader" aria-label="Selecionar todos">
                    <input
                      type="checkbox"
                      className="gtv-checkbox"
                      checked={todosSel}
                      ref={el => { if (el) el.indeterminate = parcialSel }}
                      aria-label="Selecionar todos"
                      onChange={() => toggleTodos(todosIds)}
                    />
                  </div>
                )}
                {onCarregarFilhos && (
                  <div
                    className="gtv-th gtv-th--expand gtv-col-fixa"
                    role="columnheader"
                  />
                )}
                {colunasFiltradas.map(col => {
                  const sortAtivo   = sortLocal?.campo === col.key
                  const classeSort  = col.sortavel ? ` gtv-th--sort${sortAtivo ? ' gtv-th--sorted' : ''}` : ''
                  const styleTh: React.CSSProperties = {}
                  const isDraggable = !!onSalvarPreferencias && !col.naoOcultavel
                  const isDragging  = dragColKey === col.key
                  const isDropTarget = dragOverKey === col.key && dragColKey !== null
                  const classeDropBefore = isDropTarget && dropSide === 'before' ? ' gtv-th--drop-before' : ''
                  const classeDropAfter  = isDropTarget && dropSide === 'after'  ? ' gtv-th--drop-after'  : ''
                  const classeThFindMatch = findMatches.some(m => m.tipo === 'header' && m.colKey === (col.key as string)) ? ' gtv-th--find-match' : ''
                  const classeThFindAtivo = (findMatches[findAtivo]?.tipo === 'header' && findMatches[findAtivo]?.colKey === (col.key as string)) ? ' gtv-th--find-match-ativo' : ''
                  return (
                    <div
                      key={col.key}
                      role="columnheader"
                      data-find-col-key={col.key}
                      className={`gtv-th gtv-th--center${classeSort}${classeDropBefore}${classeDropAfter}${classeThFindMatch}${classeThFindAtivo}`}
                      style={{ ...styleTh, opacity: isDragging ? 0.45 : undefined, cursor: isDraggable ? 'grab' : undefined }}
                      draggable={isDraggable}
                      onDragStart={isDraggable ? () => handleColDragStart(col.key) : undefined}
                      onDragOver={isDraggable || dragColKey !== null ? e => handleColDragOver(e, col.key) : undefined}
                      onDrop={dragColKey !== null ? e => handleColDrop(e, col.key) : undefined}
                      onDragEnd={handleColDragEnd}
                      onClick={() => col.sortavel && handleSort(col.key)}
                      aria-sort={sortAtivo ? (sortLocal?.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                    >
                      <span className="gtv-th-label" style={col.labelColor ? { color: col.labelColor } : undefined}>{col.label}</span>
                      {col.sortavel && (
                        <span className={`gtv-sort-icon${!sortAtivo ? ' gtv-sort-icon--idle' : ''}`}>
                          {sortAtivo ? (sortLocal?.dir === 'asc' ? <IconeArrowUp /> : <IconeArrowDown />) : <em>↕</em>}
                        </span>
                      )}
                      {col.filtravel && onFiltroColuna && (
                        <button
                          type="button"
                          className={`gtv-filtro-btn${filtrosAtivosKeys?.has(col.key) ? ' gtv-filtro-btn--ativo' : ''}`}
                          aria-label={`Filtrar por ${col.label}`}
                          title={`Filtrar por ${col.label}`}
                          onClick={e => { e.stopPropagation(); onFiltroColuna(col.key, e.currentTarget) }}
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
                            <path d="M0 1.5A.5.5 0 0 1 .5 1h9a.5.5 0 0 1 .354.854L6 5.707V9a.5.5 0 0 1-.724.447l-2-1A.5.5 0 0 1 3 8V5.707L.146 1.854A.5.5 0 0 1 0 1.5z"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  )
                })}
                {acoes && acoes.length > 0 && (
                  <div className="gtv-th gtv-th--acoes gtv-col-fixa" role="columnheader" />
                )}
              </div>

              {/* Linhas da página atual */}
              {linhasPagina.map((linha, idx) => (
                <React.Fragment key={`${linha.tipo}-${linha.id}`}>
                  {linha.tipo === 'pai'
                    ? renderLinhaPai(linha as GTLinhaVirtual<T, C> & { tipo: 'pai' }, idx)
                    : renderLinhaFilha(linha as GTLinhaVirtual<T, C> & { tipo: 'filho' }, idx)}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rodapé de paginação */}
      {!carregando && totalPaginas > 1 && (
        <div className="gtv-paginacao" role="navigation" aria-label="Paginação">
          <span className="gtv-paginacao-info">
            {modoLocalizar && termoBusca
              ? (() => {
                  const total = findTotalExterno ?? (onFindProximaPagina ? null : findOffset + findMatches.length)
                  const label = total != null ? `${total} resultado${total !== 1 ? 's' : ''}` : `${findOffset + findMatches.length}+ resultados`
                  return `${label} · página ${paginaEfetiva} de ${totalPaginas}`
                })()
              : `${totalEfetivo} ${totalEfetivo === 1 ? 'item' : 'itens'} · página ${paginaEfetiva} de ${totalPaginas}`
            }
          </span>
          <div className="gtv-paginacao-controles">
            <button className="gtv-pag-btn" disabled={paginaEfetiva === 1} onClick={() => mudarPagina(1)} aria-label="Primeira página">«</button>
            <button className="gtv-pag-btn" disabled={paginaEfetiva === 1} onClick={() => mudarPagina(paginaEfetiva - 1)} aria-label="Página anterior">‹</button>
            {(() => {
              // Computa páginas visíveis sem criar array de tamanho totalPaginas
              const show = new Set([1, totalPaginas])
              for (let p = Math.max(1, paginaEfetiva - 2); p <= Math.min(totalPaginas, paginaEfetiva + 2); p++) show.add(p)
              const sorted = Array.from(show).sort((a, b) => a - b)
              const items: (number | '...')[] = []
              sorted.forEach((p, i) => {
                if (i > 0 && p - sorted[i - 1] > 1) items.push('...')
                items.push(p)
              })
              return items.map((p, i) => p === '...'
                ? <span key={`e${i}`} className="gtv-pag-reticencias" aria-hidden="true">…</span>
                : <button
                    key={p}
                    className={`gtv-pag-btn${p === paginaEfetiva ? ' gtv-pag-btn--ativo' : ''}`}
                    onClick={() => mudarPagina(p as number)}
                    aria-current={p === paginaEfetiva ? 'page' : undefined}
                  >{p}</button>
              )
            })()}
            <button className="gtv-pag-btn" disabled={paginaEfetiva === totalPaginas} onClick={() => mudarPagina(paginaEfetiva + 1)} aria-label="Próxima página">›</button>
            <button className="gtv-pag-btn" disabled={paginaEfetiva === totalPaginas} onClick={() => mudarPagina(totalPaginas)} aria-label="Última página">»</button>
          </div>
        </div>
      )}

      {/* Overlay de edição — portal direto no body para evitar problemas de stacking context */}
      {/* key = id+campo garante remount completo a cada célula — reinicia useState (displayQty/displayMoedaAmt) */}
      {overlayInfo != null && (editandoCelulaPai != null || editandoCelulaFilho != null) && createPortal(
        <GTEditPopover
          key={`${overlayInfo.id}-${overlayInfo.campo}`}
          overlayInfo={overlayInfo}
          valorEditando={overlayInfo.isFilho ? valorEditandoFilho : valorEditandoPai}
          salvando={overlayInfo.isFilho ? salvandoFilho : salvandoPai}
          onAtualizar={overlayInfo.isFilho ? atualizarValorFilho : atualizarValorPai}
          onConfirmar={overlayInfo.isFilho ? confirmarEdicaoFilho : confirmarEdicaoPai}
          onCancelar={overlayInfo.isFilho ? cancelarEdicaoFilho : cancelarEdicaoPai}
          onSmartPaste={handleSmartPaste}
        />,
        document.body
      )}
    </div>
  )
}

export default TabelaVirtualGlobal
