/**
 * Mock de todos os componentes @nucleo/*
 * Renderiza elementos simples com data-testid para testes
 */
import React from 'react'

// ── Tabela Virtual ──
export function TabelaVirtualGlobal({
  dados,
  colunas,
  carregando,
  abas,
  abaAtiva,
  onMudarAba,
  acoesBarra,
  ariaLabel,
}: {
  dados?: unknown[]
  colunas?: unknown[]
  carregando?: boolean
  abas?: { valor: string; label: string }[]
  abaAtiva?: string
  onMudarAba?: (v: string) => void
  acoesBarra?: React.ReactNode
  ariaLabel?: string
}) {
  return (
    <div data-testid="tabela-virtual-global" aria-label={ariaLabel}>
      {carregando && <div data-testid="loading-state">Carregando...</div>}
      {!carregando && dados !== undefined && (
        <div data-testid="row-count">{dados.length} linhas</div>
      )}
      {abas && (
        <div data-testid="abas">
          {abas.map(a => (
            <button
              key={a.valor}
              data-testid={`aba-${a.valor}`}
              data-ativo={abaAtiva === a.valor}
              onClick={() => onMudarAba?.(a.valor)}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
      {acoesBarra && <div data-testid="acoes-barra">{acoesBarra}</div>}
    </div>
  )
}

// ── Card ──
export function CardBasicoGlobal({
  titulo,
  valor,
  subtexto,
  tooltip,
}: {
  titulo?: string
  valor?: unknown
  subtexto?: string
  tooltip?: React.ReactNode
}) {
  return (
    <div data-testid="card-basico">
      <span data-testid="card-titulo">{titulo}</span>
      <span data-testid="card-valor">{String(valor ?? '')}</span>
      {subtexto && <span data-testid="card-subtexto">{subtexto}</span>}
    </div>
  )
}

// ── Status Badge ──
export function StatusBadgeGlobal({ valor }: { valor: string; genero?: string }) {
  return <span data-testid="status-badge">{valor}</span>
}

// ── Botão ──
export function BotaoGlobal({
  children,
  onClick,
  disabled,
  variante,
}: {
  children?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variante?: string
  tamanho?: string
  icone?: React.ReactNode
}) {
  return (
    <button
      data-testid="botao-global"
      data-variante={variante}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

// ── Outros ──
export function TooltipGlobal({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
export function SelectGlobal(props: Record<string, unknown>) {
  return <select data-testid="select-global" {...(props as any)} />
}
export function ModalPassoPassoGlobal({ children }: { children?: React.ReactNode }) {
  return <div data-testid="modal-passo-passo">{children}</div>
}
export function ModalGlobal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}
export function InputGlobal(props: Record<string, unknown>) {
  return <input data-testid="input-global" {...(props as any)} />
}

// ── GABI Field Icon (mock para testes) ──
export function GabiFieldIcon(_props: Record<string, unknown>) {
  return null
}
export function GabiTokenBadge(_props: Record<string, unknown>) {
  return null
}
export function useGabiOnDemand(_campo: string, _label: string, _endpoint?: string) {
  return { consultar: async () => {}, titulo: null, texto: null, resposta: null, carregando: false, esgotado: false, erro: null, limpar: () => {} }
}
export function useGabiQuota(_endpoint?: string) {
  return { quota: null, carregando: false, recarregar: async () => {} }
}

// ── Kanban Global ──
export type KanbanItem = { id: string; columnId: string; [key: string]: unknown }
export function KanbanGlobal({ renderCard, onCardClick }: {
  items?: KanbanItem[]
  columns?: unknown[]
  renderCard?: (item: KanbanItem) => React.ReactNode
  onCardClick?: (item: KanbanItem) => void
  loading?: boolean
}) {
  return <div data-testid="kanban-global" />
}
