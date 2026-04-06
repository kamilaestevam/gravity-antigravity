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
import { GabiFieldIcon } from '@nucleo/gabi-field-icon-global'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useGTExpandir } from './hooks/useGTExpandir.js'
import { useGTSelecao } from './hooks/useGTSelecao.js'
import { useGTInlineEdit } from './hooks/useGTInlineEdit.js'
import { SelectColunasGlobal } from '@nucleo/select-colunas-global'
import { CalendarioCampoGlobal } from '@nucleo/campo-calendario-global'
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

const GTSkeleton = memo(function GTSkeleton({ rowHeight }: { rowHeight: number }) {
  return (
    <div className="gtv-tabela-scroll" aria-busy="true" aria-label="Carregando...">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="gtv-skeleton-linha"
          style={{ height: rowHeight }}
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

// Moedas e unidades padrão quando a coluna não especifica lista própria
const MOEDAS_PADRAO = ['USD', 'EUR', 'BRL', 'CNY', 'GBP', 'JPY', 'CHF', 'ARS', 'CAD', 'AUD', 'MXN', 'CLP', 'COP', 'PEN', 'UYU']
const UNIDADES_PADRAO = ['UN', 'KG', 'G', 'TON', 'L', 'ML', 'M', 'M²', 'M³', 'CX', 'PC', 'PAR', 'DZ', 'CT', 'FD']

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

// Converte string pt-BR (1.500,50) para float (1500.5)
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
    moedas?: string[]
    unidades?: string[]
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
  const [moedaListPos, setMoedaListPos]       = useState<{ top: number; left: number } | null>(null)
  const [unidadeListPos, setUnidadeListPos]   = useState<{ top: number; left: number } | null>(null)
  const [moedaBusca, setMoedaBusca]     = useState('')
  const [unidadeBusca, setUnidadeBusca] = useState('')

  // Abre o dropdown calculando posição fixed a partir do trigger
  function abrirMoeda() {
    const r = moedaTriggerRef.current?.getBoundingClientRect()
    if (r) setMoedaListPos({ top: r.bottom + 4, left: r.left })
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
  const listaMoedas   = overlayInfo.moedas   ?? MOEDAS_PADRAO
  const listaUnidades = overlayInfo.unidades ?? UNIDADES_PADRAO
  const casas = overlayInfo.casasDecimais ?? 0

  // Estados de display pt-BR para os inputs numéricos (inicializados uma vez na abertura do popover)
  // Number() garante conversão correta mesmo quando Prisma Decimal serializa como string no JSON
  const [displayMoedaAmt, setDisplayMoedaAmt] = useState(() => {
    const amt = Number(mv.amount)
    return amt > 0 ? amt.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''
  })
  const [displayQty, setDisplayQty] = useState(() => {
    const qty = Number(uv.quantity)
    return qty > 0 ? qty.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }) : ''
  })
  const numericInitial = isNumero ? (typeof valorEditando === 'number' ? valorEditando : parseBRNum(String(valorEditando ?? ''))) : 0
  const [displayNumero, setDisplayNumero] = useState(() =>
    isNumero && numericInitial > 0 ? numericInitial.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }) : (isNumero ? '' : String(valorEditando ?? ''))
  )

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
      {/* Backdrop — clique fora confirma */}
      <div className="gtv-edit-popover-backdrop" onMouseDown={() => onConfirmar()} />

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
              <GabiFieldIcon
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
              {/* Trigger — dropdown via portal para não ser cortado pelo overflow:hidden */}
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
                  setDisplayMoedaAmt(parsed > 0 ? parsed.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '')
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
                  setDisplayQty(parsed > 0 ? parsed.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }) : '')
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
                <CalendarioCampoGlobal
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
                  setDisplayNumero(parsed > 0 ? parsed.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }) : '')
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

      {/* Dropdown de moeda — portal fora do popover para não ser cortado pelo overflow:hidden */}
      {moedaAberta && moedaListPos && createPortal(
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 10000 }}
            onMouseDown={() => setMoedaAberta(false)}
          />
          <div
            className="gtv-edit-custom-select-list"
            style={{ position: 'fixed', top: moedaListPos.top, left: moedaListPos.left, zIndex: 10001 }}
            onMouseDown={e => e.preventDefault()}
          >
            <div className="gtv-edit-custom-select-busca">
              <svg width="11" height="11" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/>
              </svg>
              <input
                className="gtv-edit-custom-select-busca-input"
                placeholder="Localizar..."
                autoFocus
                value={moedaBusca}
                onChange={e => setMoedaBusca(e.target.value)}
                onKeyDown={e => { if (e.key === 'Escape') setMoedaAberta(false) }}
              />
            </div>
            {listaMoedas.filter(m => m.toLowerCase().includes(moedaBusca.toLowerCase())).map(m => (
              <button
                key={m}
                type="button"
                className={`gtv-edit-custom-select-item${mv.currency === m ? ' gtv-edit-custom-select-item--ativo' : ''}`}
                onClick={() => { onAtualizar({ ...mv, currency: m }); setMoedaAberta(false) }}
              >{m}</button>
            ))}
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
                placeholder="Localizar..."
                autoFocus
                value={unidadeBusca}
                onChange={e => setUnidadeBusca(e.target.value)}
                onKeyDown={e => { if (e.key === 'Escape') setUnidadeAberta(false) }}
              />
            </div>
            {listaUnidades.filter(u => u.toLowerCase().includes(unidadeBusca.toLowerCase())).map(u => (
              <button
                key={u}
                type="button"
                className={`gtv-edit-custom-select-item${uv.unit === u ? ' gtv-edit-custom-select-item--ativo' : ''}`}
                onClick={() => { onAtualizar({ ...uv, unit: u }); setUnidadeAberta(false) }}
              >{u}</button>
            ))}
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
  temMais,
  carregandoMais,
  onCarregarMais,
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
  placeholderBusca = 'Buscar...',
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
  rowHeight = 44,
  childRowHeight = 36,
  overscan = 5,
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
    const padrao = colunas.map(c => c.key)
    onSalvarPreferencias?.({ ...(preferencias ?? {}), colunas_visiveis: padrao })
  }, [colunas, preferencias, onSalvarPreferencias])

  // ── Larguras de colunas (resize) ──────────────────────────────────────────────
  const [larguraColunas, setLarguraColunas] = useState<Record<string, number>>(
    () => preferencias?.larguras ?? {}
  )
  const largurasPref = preferencias?.larguras
  useEffect(() => {
    setLarguraColunas(largurasPref ?? {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [largurasPref])

  const [resizingCol, setResizingCol] = useState<{
    key: string
    startX: number
    startWidth: number
  } | null>(null)
  const rafRef = useRef<number | null>(null)

  // ── Auto-fit: calcula largura com base nos caracteres do conteúdo ─────────────
  // Fórmula: min(max(header, maxConteúdo) + 4, 50) * 8px
  // Calculado UMA única vez quando os dados chegam (ref — sem re-render).
  // Itera sobre as primeiras 500 linhas para limitar custo computacional.
  const autoFitWidthsRef = useRef<Record<string, number>>({})
  const autoFitDoneRef = useRef(false)

  if (!autoFitDoneRef.current && dados.length > 0) {
    const amostra = (dados as Record<string, unknown>[]).slice(0, 500)
    const resultado: Record<string, number> = {}
    const autoFitText = (v: unknown): string => {
      if (v == null) return ''
      if (typeof v === 'string') return v
      if (typeof v === 'number') return String(v)
      if (typeof v === 'object') {
        const obj = v as Record<string, unknown>
        // GTValorMoeda / GTValorUnidade — extract the numeric value
        if ('valor' in obj) return String(obj.valor ?? '')
        return ''
      }
      return String(v)
    }
    for (const col of colunas as GTColuna<unknown>[]) {
      if (col.autoFitDisabled) continue
      const maxConteudo = Math.max(...amostra.map(item => autoFitText(item[col.key]).length))
      resultado[col.key] = Math.min(Math.max(col.label.length, maxConteudo) + 4, 150) * 8
    }
    autoFitWidthsRef.current = resultado
    autoFitDoneRef.current = true
  }

  const getColWidth = useCallback(
    (col: GTColuna<unknown>): number => {
      const saved = larguraColunas[col.key]
      if (saved != null) return saved
      const autoFit = autoFitWidthsRef.current[col.key]
      if (autoFit != null) return autoFit
      if (typeof col.largura === 'number') return col.largura
      if (typeof col.largura === 'string') return parseInt(col.largura, 10) || 150
      return 150
    },
    [larguraColunas]
  )

  // ── Overlay de edição ─────────────────────────────────────────────────────────
  const [overlayInfo, setOverlayInfo] = useState<{
    rect: DOMRect
    id: string
    campo: string
    isFilho: boolean
    colLabel: string
    colTipo?: string
    opcoes?: { valor: string; label: string }[]
    moedas?: string[]
    unidades?: string[]
    gabiCampo?: string
    gabiEndpoint?: string
  } | null>(null)

  // ── Expand/collapse ───────────────────────────────────────────────────────────
  const { expandidos, filhosCache, carregandoFilhos, toggle, atualizarFilhoNoCache } = useGTExpandir<T, C>(
    onCarregarFilhos,
  )

  // ── Largura total e offsets para scroll horizontal ────────────────────────────
  const CABECALHO_HEIGHT = 40

  /** Mostra checkbox de seleção quando há acoesLote OU onSelecaoMudar */
  const temSelecao = (acoesLote != null && acoesLote.length > 0) || onSelecaoMudar != null

  const larguraTotalColunas = useMemo(() => {
    const colsW = colunasFiltradas.reduce(
      (acc, col) => acc + getColWidth(col as GTColuna<unknown>),
      0
    )
    const checkW = temSelecao ? 40 : 0
    const expandW = onCarregarFilhos != null ? 40 : 0
    const acoesW  = acoes && acoes.length > 0 ? acoes.length * 32 + 16 : 0
    return colsW + checkW + expandW + acoesW
  }, [colunasFiltradas, temSelecao, onCarregarFilhos, acoes, getColWidth])

  /** left offset das colunas de dados frozen (após checkbox + expand) */
  const offsetFrozenDados = useMemo(() => {
    const checkW = temSelecao ? 40 : 0
    const expandW = onCarregarFilhos != null ? 40 : 0
    return checkW + expandW
  }, [temSelecao, onCarregarFilhos])

  /** largura total das colunas frozen de dados (para spacer nas linhas filhas) */
  const frozenDataWidth = useMemo(
    () => colunasFiltradas
      .filter(c => c.frozen)
      .reduce((sum, c) => sum + getColWidth(c as GTColuna<unknown>), 0),
    [colunasFiltradas, getColWidth],
  )

  // ── Seleção ───────────────────────────────────────────────────────────────────
  const {
    selecionados,
    toggleItem,
    toggleTodos,
    limpar: limparSelecao,
    todosSelecionados,
    parcialmnteSelecionados,
    selecionadosArray,
  } = useGTSelecao()

  const todosIds = useMemo(() => dados.map(itemId), [dados, itemId])

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
      larguras: preferencias?.larguras,
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

  // ── Flat rows para o virtualizador ────────────────────────────────────────────
  const linhasVirtuais = useMemo(
    () => buildFlatRows<T, C>(dados, expandidos, filhosCache, itemId, filhoId),
    [dados, expandidos, filhosCache, itemId, filhoId],
  )

  // ── Find-in-page ─────────────────────────────────────────────────────────────
  // Células: usadas para navegação prev/next + scroll + destaque amarelo forte
  type GTFindCelula = { linhaIndex: number; colKey: string }

  const findCellMatches = useMemo<GTFindCelula[]>(() => {
    if (!termoBusca.trim()) return []
    const termo = termoBusca.trim().toLowerCase()
    const result: GTFindCelula[] = []
    for (let i = 0; i < linhasVirtuais.length; i++) {
      const linha = linhasVirtuais[i]
      const item = linha.item as Record<string, unknown>
      for (const col of colunasFiltradas) {
        const k = col.key as string
        const v = item[k]
        if (v != null && String(v).toLowerCase().includes(termo)) {
          result.push({ linhaIndex: i, colKey: k })
        }
      }
    }
    return result
  }, [termoBusca, linhasVirtuais, colunasFiltradas])

  // Headers: sempre destacados (amarelo tênue), independentes da navegação
  const findHeaderKeys = useMemo<Set<string>>(() => {
    if (!termoBusca.trim()) return new Set()
    const termo = termoBusca.trim().toLowerCase()
    const s = new Set<string>()
    for (const col of colunasFiltradas) {
      if (col.label.toLowerCase().includes(termo)) s.add(col.key as string)
    }
    return s
  }, [termoBusca, colunasFiltradas])

  const findProximo = useCallback(() => {
    setFindAtivo(i => (i + 1) % Math.max(findCellMatches.length, 1))
  }, [findCellMatches.length])

  const findAnterior = useCallback(() => {
    setFindAtivo(i => (i - 1 + Math.max(findCellMatches.length, 1)) % Math.max(findCellMatches.length, 1))
  }, [findCellMatches.length])

  // ── TanStack Virtual ──────────────────────────────────────────────────────────
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: linhasVirtuais.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (i) =>
      linhasVirtuais[i]?.tipo === 'filho' ? childRowHeight : rowHeight,
    overscan,
    paddingStart: CABECALHO_HEIGHT,
  })

  // ── Find: reset ativo ao mudar matches ───────────────────────────────────────
  useEffect(() => { setFindAtivo(0) }, [findCellMatches])

  // ── Find: scroll até match ativo ─────────────────────────────────────────────
  const virtualizerRef = useRef(virtualizer)
  useLayoutEffect(() => { virtualizerRef.current = virtualizer })

  useEffect(() => {
    if (findCellMatches.length === 0) return
    const m = findCellMatches[findAtivo]
    if (m != null) {
      virtualizerRef.current.scrollToIndex(m.linhaIndex, { align: 'center' })
    }
  }, [findAtivo, findCellMatches])

  // ── Load more via intersection ────────────────────────────────────────────────
  const sentinelaRef = useRef<HTMLDivElement>(null)
  const onCarregarMaisRef = useRef(onCarregarMais)
  useEffect(() => { onCarregarMaisRef.current = onCarregarMais }, [onCarregarMais])

  useEffect(() => {
    if (!temMais || !onCarregarMais || carregandoMais) return

    const el = sentinelaRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onCarregarMaisRef.current?.()
      },
      { root: parentRef.current, threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temMais, carregandoMais])

  // ── Itens selecionados (objetos) ──────────────────────────────────────────────
  const itensSelecionados = useMemo(
    () => dados.filter(item => selecionados.has(itemId(item))),
    [dados, selecionados, itemId],
  )

  useEffect(() => {
    onSelecaoMudar?.(itensSelecionados)
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const linhasPai = linhasVirtuais.filter((l): l is GTLinhaVirtual<T, C> & { tipo: 'pai' } => l.tipo === 'pai')
    const idxAtual  = linhasPai.findIndex(l => l.id === startId)
    if (idxAtual < 0) return
    const promises: Promise<void>[] = []
    for (let i = 0; i < valores.length; i++) {
      const linha = linhasPai[idxAtual + i]
      if (!linha) break
      const valorParsado = parsearLinhaSmartPaste(valores[i], colTipo, valorAtual)
      promises.push(editarFn(linha.id, campo, valorParsado).catch(() => {}))
    }
    await Promise.all(promises)
    onSalvoComSucesso?.()
  }, [onEditar, onEditarFilho, linhasVirtuais, onSalvoComSucesso])

  // ── Smart paste vindo do popover ──────────────────────────────────────────────
  const handleSmartPaste = useCallback(async (valores: string[]) => {
    if (!overlayInfo) return
    const valorAtual = overlayInfo.isFilho ? valorEditandoFilho : valorEditandoPai
    if (overlayInfo.isFilho) cancelarEdicaoFilho()
    else cancelarEdicaoPai()
    await aplicarSmartPaste(overlayInfo.id, overlayInfo.campo, overlayInfo.colTipo, valores, valorAtual, overlayInfo.isFilho)
  }, [overlayInfo, valorEditandoPai, valorEditandoFilho, cancelarEdicaoPai, cancelarEdicaoFilho, aplicarSmartPaste])

  // ── Resize handle — mousemove/mouseup no document ─────────────────────────────
  useEffect(() => {
    if (!resizingCol) return

    function onMouseMove(e: MouseEvent) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const delta = e.clientX - resizingCol!.startX
        const novaLargura = Math.max(60, resizingCol!.startWidth + delta)
        setLarguraColunas(prev => ({ ...prev, [resizingCol!.key]: novaLargura }))
      })
    }

    function onMouseUp(e: MouseEvent) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      const delta = e.clientX - resizingCol.startX
      const novaLargura = Math.max(60, resizingCol.startWidth + delta)
      setLarguraColunas(prev => {
        const novas = { ...prev, [resizingCol!.key]: novaLargura }
        onSalvarPreferencias?.({
          ...(preferencias ?? {}),
          colunas_visiveis: colunasVisiveis,
          larguras: novas,
        })
        return novas
      })
      setResizingCol(null)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [resizingCol, onSalvarPreferencias, preferencias, colunasVisiveis])

  // ─── Helpers find-in-page ────────────────────────────────────────────────────

  function isCelulaMatch(linhaIndex: number, colKey: string): boolean {
    return findCellMatches.some(m => m.linhaIndex === linhaIndex && m.colKey === colKey)
  }

  function isCelulaMatchAtivo(linhaIndex: number, colKey: string): boolean {
    if (findCellMatches.length === 0) return false
    const m = findCellMatches[findAtivo]
    return m != null && m.linhaIndex === linhaIndex && m.colKey === colKey
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

    const classeAlinhamento = ' gtv-celula--center'

    const classeIndent      = ''
    const classeEditavel    = podeEditar ? ' gtv-celula--editavel' : ''
    const classeFrozen      = col.frozen ? ' gtv-celula--frozen' : ''
    const classeFindMatch   = linhaIndex >= 0 && isCelulaMatch(linhaIndex, col.key as string) ? ' gtv-celula--find-match' : ''
    const classeFindAtivo   = linhaIndex >= 0 && isCelulaMatchAtivo(linhaIndex, col.key as string) ? ' gtv-celula--find-match-ativo' : ''

    const styleCelula: React.CSSProperties = {
      flex: `0 0 ${getColWidth(col as GTColuna<unknown>)}px`,
      ...(col.frozen ? { left: offsetFrozenDados } : undefined),
    }

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
        className={`gtv-celula${classeAlinhamento}${classeIndent}${classeEditavel}${classeFrozen}${classeFindMatch}${classeFindAtivo}`}
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
            try {
              await navigator.clipboard.writeText(formatarOverlayValor(valorAtual, col.tipo, (col as GTColuna<unknown>).casasDecimais))
            } catch {}
          }

          if (e.key === 'v') {
            e.preventDefault()
            try {
              const texto = await navigator.clipboard.readText()
              const linhas = texto.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
              if (!linhas.length) return
              if (linhas.length === 1) {
                const editarFn = isFilho ? onEditarFilho : onEditar
                if (editarFn) {
                  const valorParsado = parsearLinhaSmartPaste(linhas[0], col.tipo, valorAtual)
                  await editarFn(id, col.key, valorParsado).catch(() => {})
                  onSalvoComSucesso?.()
                }
              } else {
                await aplicarSmartPaste(id, col.key, col.tipo, linhas, valorAtual, isFilho)
              }
            } catch {}
          }
        } : undefined}
      >
        {estaEditando && overlayAtivo ? (
          // Overlay ativo: mostra indicador visual, o input real está no popover flutuante
          <span className="gtv-celula--editando-overlay">
            {formatarOverlayValor(valorEditando, col.tipo, (col as GTColuna<unknown>).casasDecimais)}
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
    const temFilhos = onCarregarFilhos != null || (filhosCache.get(id)?.length ?? 0) > 0

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
          <div className="gtv-celula gtv-celula--check gtv-celula--frozen" style={{ left: 0 }}>
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
            className="gtv-celula gtv-celula--expand gtv-celula--frozen"
            style={{ left: temSelecao ? 40 : 0 }}
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
          <div className="gtv-celula gtv-celula--acoes">
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
            <div className="gtv-celula gtv-celula--check gtv-celula--frozen" style={{ left: 0 }}>
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
              className="gtv-celula gtv-celula--expand gtv-celula--frozen"
              style={{ left: temSelecao ? 40 : 0 }}
            >
              <span className="gtv-conector" aria-hidden="true">
                {renderConectorFilho ? renderConectorFilho(item) : '└'}
              </span>
            </div>
          )}

          {colunasFiltradas.map((col, idx) => {
            const mapa = mapaColunasFilho[col.key as string]
            const campo = mapa?.campo ?? (col.key as string)
            const podeEditar = (!!mapa?.editavel || camposEditaveisFilhos.includes(col.key as string)) && !!onEditarFilho
            const estaEditando = editandoCelulaFilho?.id === id && editandoCelulaFilho?.campo === campo
            const overlayAtivo  = overlayInfo?.id === id && overlayInfo?.campo === campo

            const classeAlinhamento = ' gtv-celula--center'
            const classeEditavel    = podeEditar ? ' gtv-celula--editavel' : ''
            const classeFrozen      = col.frozen ? ' gtv-celula--frozen' : ''
            const classeFindMatch   = isCelulaMatch(linhaVirtualIndex, col.key as string) ? ' gtv-celula--find-match' : ''
            const classeFindAtivo   = isCelulaMatchAtivo(linhaVirtualIndex, col.key as string) ? ' gtv-celula--find-match-ativo' : ''

            const styleCelula: React.CSSProperties = {
              flex: `0 0 ${getColWidth(col as GTColuna<unknown>)}px`,
              ...(col.frozen ? { left: offsetFrozenDados } : undefined),
            }

            const valor = (item as Record<string, unknown>)[campo]

            return (
              <div
                key={col.key as string}
                className={`gtv-celula${classeAlinhamento}${classeEditavel}${classeFrozen}${classeFindMatch}${classeFindAtivo}`}
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
                    {formatarOverlayValor(valorEditandoFilho, col.tipo, mapa?.casasDecimais ?? (col as GTColuna<unknown>).casasDecimais)}
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
                  mapa ? mapa.render(item) : ((item as Record<string, unknown>)[campo] != null ? String((item as Record<string, unknown>)[campo]) : null)
                )}
              </div>
            )
          })}

          {acoesFilhas && acoesFilhas.length > 0 && (
            <div className="gtv-celula gtv-celula--acoes">
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
              className="gtv-celula gtv-celula--acoes gtv-celula--acoes-filho"
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
          <div className="gtv-celula gtv-celula--check gtv-celula--frozen" style={{ left: 0 }}>
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
            className="gtv-celula gtv-celula--expand gtv-celula--frozen"
            style={{ left: temSelecao ? 40 : 0 }}
          >
            <span className="gtv-conector" aria-hidden="true">└</span>
          </div>
        )}

        {/* Spacer sticky: alinha células filhas com colunas não-frozen do pai */}
        {frozenDataWidth > 0 && (
          <div
            className="gtv-celula gtv-celula--frozen"
            style={{ flex: `0 0 ${frozenDataWidth}px`, left: offsetFrozenDados }}
            aria-hidden="true"
          />
        )}

        {/* Células filhas */}
        {colsFilhas.map((col, idx) =>
          renderCelula<C>(item, id, col, true, idx === 0, linhaVirtualIndex)
        )}

        {/* Ações de linha filha */}
        {acoesFilhas && acoesFilhas.length > 0 && (
          <div className="gtv-celula gtv-celula--acoes">
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
            className="gtv-celula gtv-celula--acoes gtv-celula--acoes-filho"
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

  const totalSize = virtualizer.getTotalSize()
  const virtualItems = virtualizer.getVirtualItems()

  const todosSel = todosSelecionados(todosIds)
  const parcialSel = parcialmnteSelecionados(todosIds)

  return (
    <div
      className={`gtv-container${resizingCol ? ' gtv-container--resizing' : ''}`}
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
          {onBuscar && (
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
                    if (e.key === 'Enter' && findCellMatches.length > 0) {
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
                findCellMatches.length > 0 ? (
                  <div className="gtv-find-nav" role="status" aria-live="polite">
                    <span className="gtv-find-count">{findAtivo + 1} de {findCellMatches.length}</span>
                    {findCellMatches.length > 1 && (
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
        <GTSkeleton rowHeight={rowHeight} />
      ) : (
        <div
          ref={parentRef}
          className="gtv-tabela-scroll"
          role="rowgroup"
          aria-label="Linhas da tabela"
        >
          {/* Cabeçalho sticky — dentro do scroll para alinhar horizontalmente */}
          <div className="gtv-cabecalho" role="row" style={{ minWidth: larguraTotalColunas }}>
            {/* Checkbox cabeçalho */}
            {temSelecao && (
              <div className="gtv-th gtv-th--check gtv-th--frozen" role="columnheader" aria-label="Selecionar todos" style={{ left: 0 }}>
                <input
                  type="checkbox"
                  className="gtv-checkbox"
                  checked={todosSel}
                  ref={el => {
                    if (el) el.indeterminate = parcialSel
                  }}
                  aria-label="Selecionar todos"
                  onChange={() => toggleTodos(todosIds)}
                />
              </div>
            )}

            {/* Expand col */}
            {onCarregarFilhos && (
              <div
                className="gtv-th gtv-th--expand gtv-th--frozen"
                role="columnheader"
                style={{ left: temSelecao ? 40 : 0 }}
              />
            )}

            {/* Colunas de dados */}
            {colunasFiltradas.map(col => {
              const sortAtivo   = sortLocal?.campo === col.key
              const classeSort  = col.sortavel
                ? ` gtv-th--sort${sortAtivo ? ' gtv-th--sorted' : ''}`
                : ''
              const classeAlign = ' gtv-th--center'
              const classeFrozen = col.frozen ? ' gtv-th--frozen' : ''
              const colWidth = getColWidth(col as GTColuna<unknown>)

              const styleTh: React.CSSProperties = {
                flex: `0 0 ${colWidth}px`,
                ...(col.frozen ? { left: offsetFrozenDados } : undefined),
              }

              const isDraggable = !!onSalvarPreferencias && !col.frozen && !col.naoOcultavel
              const isDragging  = dragColKey === col.key
              const isDropTarget = dragOverKey === col.key && dragColKey !== null
              const classeDropBefore = isDropTarget && dropSide === 'before' ? ' gtv-th--drop-before' : ''
              const classeDropAfter  = isDropTarget && dropSide === 'after'  ? ' gtv-th--drop-after'  : ''
              const classeThFindMatch = findHeaderKeys.has(col.key as string) ? ' gtv-th--find-match' : ''
              const classeThFindAtivo = ''  // headers nunca são "ativos" na navegação — sempre tênue

              return (
                <div
                  key={col.key}
                  role="columnheader"
                  className={`gtv-th${classeSort}${classeAlign}${classeFrozen}${classeDropBefore}${classeDropAfter}${classeThFindMatch}${classeThFindAtivo}`}
                  style={{ ...styleTh, opacity: isDragging ? 0.45 : undefined, cursor: isDraggable ? 'grab' : undefined }}
                  draggable={isDraggable}
                  onDragStart={isDraggable ? () => handleColDragStart(col.key) : undefined}
                  onDragOver={isDraggable || dragColKey !== null ? e => handleColDragOver(e, col.key) : undefined}
                  onDrop={dragColKey !== null ? e => handleColDrop(e, col.key) : undefined}
                  onDragEnd={handleColDragEnd}
                  onClick={() => col.sortavel && handleSort(col.key)}
                  aria-sort={
                    sortAtivo
                      ? sortLocal?.dir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  <span className="gtv-th-label">{col.label}</span>
                  {col.sortavel && (
                    <span className={`gtv-sort-icon${!sortAtivo ? ' gtv-sort-icon--idle' : ''}`}>
                      {sortAtivo ? (
                        sortLocal?.dir === 'asc' ? <IconeArrowUp /> : <IconeArrowDown />
                      ) : (
                        <em>↕</em>
                      )}
                    </span>
                  )}
                  {col.filtravel && onFiltroColuna && (
                    <button
                      type="button"
                      className={`gtv-filtro-btn${filtrosAtivosKeys?.has(col.key) ? ' gtv-filtro-btn--ativo' : ''}`}
                      aria-label={`Filtrar por ${col.label}`}
                      title={`Filtrar por ${col.label}`}
                      onClick={e => {
                        e.stopPropagation()
                        onFiltroColuna(col.key, e.currentTarget)
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
                        <path d="M0 1.5A.5.5 0 0 1 .5 1h9a.5.5 0 0 1 .354.854L6 5.707V9a.5.5 0 0 1-.724.447l-2-1A.5.5 0 0 1 3 8V5.707L.146 1.854A.5.5 0 0 1 0 1.5z"/>
                      </svg>
                    </button>
                  )}
                  {/* Resize handle */}
                  <div
                    className="gtv-th-resize-handle"
                    onMouseDown={e => {
                      e.stopPropagation()
                      e.preventDefault()
                      setResizingCol({ key: col.key, startX: e.clientX, startWidth: colWidth })
                    }}
                    onDoubleClick={e => {
                      e.stopPropagation()
                      // Reset para largura padrão
                      setLarguraColunas(prev => {
                        const novo = { ...prev }
                        delete novo[col.key]
                        return novo
                      })
                      if (onSalvarPreferencias && preferencias) {
                        const novas = { ...larguraColunas }
                        delete novas[col.key]
                        onSalvarPreferencias({ ...preferencias, colunas_visiveis: colunasVisiveis, larguras: novas })
                      }
                    }}
                    title="Arrastar para redimensionar · Duplo clique para resetar"
                    aria-hidden="true"
                  />
                </div>
              )
            })}

            {/* Ações col */}
            {acoes && acoes.length > 0 && (
              <div className="gtv-th gtv-th--acoes" role="columnheader" />
            )}
          </div>

          {dados.length === 0 ? (
            /* Estado vazio */
            <GTVazio
              emptyIcon={emptyIcon}
              emptyTitle={emptyTitle}
              emptyDescription={emptyDescription}
              emptyAction={emptyAction}
            />
          ) : (
            <div
              className="gtv-tabela-inner"
              style={{ height: totalSize, minWidth: larguraTotalColunas }}
            >
              {virtualItems.map(virtualItem => {
                const linha = linhasVirtuais[virtualItem.index]
                if (!linha) return null

                return (
                  <div
                    key={virtualItem.key}
                    data-index={virtualItem.index}
                    ref={virtualizer.measureElement}
                    style={{
                      position: 'absolute',
                      top: virtualItem.start,
                      left: 0,
                      width: larguraTotalColunas,
                    }}
                    role="row"
                  >
                    {linha.tipo === 'pai'
                      ? renderLinhaPai(linha as GTLinhaVirtual<T, C> & { tipo: 'pai' }, virtualItem.index)
                      : renderLinhaFilha(linha as GTLinhaVirtual<T, C> & { tipo: 'filho' }, virtualItem.index)}
                  </div>
                )
              })}

              {/* Sentinela para infinite scroll */}
              {temMais && (
                <div
                  ref={sentinelaRef}
                  style={{ height: 1, position: 'absolute', bottom: 0, width: '100%' }}
                  aria-hidden="true"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Rodapé: carregar mais — fora do scroll para não deslocar */}
      {!carregando && temMais && onCarregarMais && (
        <div className="gtv-rodape">
          <button
            className="gtv-carregar-mais-btn"
            disabled={carregandoMais}
            onClick={onCarregarMais}
          >
            {carregandoMais ? (
              <>
                <span className="gtv-spinner" />
                Carregando...
              </>
            ) : (
              'Carregar mais'
            )}
          </button>
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
