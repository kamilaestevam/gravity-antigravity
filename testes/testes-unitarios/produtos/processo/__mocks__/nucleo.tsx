/**
 * Mock de todos os componentes @nucleo/*
 * Renderiza divs simples com data-testid para testes
 */
import React, { useState } from 'react'

// ── Status Badge ──
export function StatusBadgeGlobal({ valor, genero }: { valor: string; genero?: string }) {
  return <span data-testid="status-badge" data-genero={genero}>{valor}</span>
}

// ── Tooltip ──
export function TooltipGlobal({ children, titulo, descricao }: { children: React.ReactNode; titulo?: string; descricao?: string }) {
  return <div data-testid="tooltip" data-titulo={titulo} data-descricao={descricao}>{children}</div>
}

// ── Botao ──
export function BotaoGlobal({
  children, label, variante, tamanho, icone, onClick, disabled, className,
}: {
  children?: React.ReactNode; label?: string; variante?: string; tamanho?: string;
  icone?: React.ReactNode; onClick?: () => void; disabled?: boolean; className?: string;
}) {
  return (
    <button
      data-testid="botao-global"
      data-variante={variante}
      data-tamanho={tamanho}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {icone}
      {children ?? label}
    </button>
  )
}

// ── Pagina ──
export function PaginaGlobal({
  children, layout, cabecalho, stats, acoes, className,
}: {
  children?: React.ReactNode; layout?: string; cabecalho?: React.ReactNode;
  stats?: React.ReactNode; acoes?: React.ReactNode; className?: string;
}) {
  return (
    <div data-testid="pagina-global" data-layout={layout} className={className}>
      {cabecalho}
      {stats && <div data-testid="pagina-stats">{stats}</div>}
      {acoes && <div data-testid="pagina-acoes">{acoes}</div>}
      <div data-testid="pagina-content">{children}</div>
    </div>
  )
}

// ── Cabecalho ──
export function CabecalhoGlobal({
  titulo, subtitulo, icone, acoes,
}: {
  titulo: string; subtitulo?: string; icone?: React.ReactNode; acoes?: React.ReactNode;
}) {
  return (
    <div data-testid="cabecalho-global">
      {icone}
      <h1 data-testid="cabecalho-titulo">{titulo}</h1>
      {subtitulo && <p data-testid="cabecalho-subtitulo">{subtitulo}</p>}
      {acoes}
    </div>
  )
}

// ── Card Basico ──
export function CardBasicoGlobal({
  titulo, icone, valor, periodos, subtexto, tooltip, variante, className,
}: {
  titulo: string; icone?: React.ReactNode; valor: React.ReactNode;
  periodos?: Array<{ periodo: string; rotulo: string; valor: string; direcao: string }>;
  subtexto?: React.ReactNode; tooltip?: React.ReactNode; variante?: string; className?: string;
}) {
  return (
    <div data-testid="card-basico" data-titulo={titulo} data-variante={variante} className={className}>
      {icone}
      <span data-testid="card-valor">{valor}</span>
      {subtexto && <span data-testid="card-subtexto">{subtexto}</span>}
      {periodos?.map((p, i) => (
        <span key={i} data-testid="card-periodo" data-direcao={p.direcao}>{p.valor}</span>
      ))}
      {tooltip && <div data-testid="card-tooltip">{tooltip}</div>}
    </div>
  )
}

// ── Card Grafico ──
export function CardGraficoGlobal({
  titulo, icone, total, valorPrincipal, corGauge, legenda, tooltip,
}: {
  titulo: string; icone?: React.ReactNode; total: number; valorPrincipal: number;
  corGauge?: string; legenda?: Array<{ label: string; valor: number; cor: string }>;
  tooltip?: React.ReactNode;
}) {
  return (
    <div data-testid="card-grafico" data-titulo={titulo}>
      {icone}
      <span data-testid="gauge-value">{valorPrincipal}/{total}</span>
      {legenda?.map((l, i) => (
        <span key={i} data-testid="gauge-legenda" data-label={l.label}>{l.valor}</span>
      ))}
      {tooltip && <div data-testid="gauge-tooltip">{tooltip}</div>}
    </div>
  )
}

// ── Campo Geral ──
export function GeralCampoGlobal({
  children, label, obrigatorio, tooltipTitulo, tooltipDescricao, className,
}: {
  children?: React.ReactNode; label?: string; obrigatorio?: boolean;
  tooltipTitulo?: string; tooltipDescricao?: string; className?: string;
}) {
  return (
    <div data-testid="campo-geral" data-label={label} data-obrigatorio={obrigatorio} className={className}>
      {label && <label>{label}</label>}
      {children}
    </div>
  )
}

// ── Select ──
export function SelectGlobal({
  opcoes, valor, aoMudarValor, placeholder, buscavel, iconeEsquerda,
}: {
  opcoes: Array<{ valor: string; rotulo: string }>; valor: string;
  aoMudarValor: (v: string | null) => void; placeholder?: string;
  buscavel?: boolean; iconeEsquerda?: React.ReactNode;
}) {
  return (
    <select
      data-testid="select-global"
      value={valor}
      onChange={(e) => aoMudarValor(e.target.value || null)}
    >
      <option value="">{placeholder ?? 'Selecione...'}</option>
      {opcoes.map((o) => (
        <option key={o.valor} value={o.valor}>{o.rotulo}</option>
      ))}
    </select>
  )
}
export type SelectOpcao = { valor: string; rotulo: string }

// ── Tabela Camadas ──
export function TabelaCamadasGlobal<P, F>({
  dados, colunas, colunasFilhas, filhos, acoes, itemId,
  placeholderBusca, campoBusca, mensagemVazio, carregando, itensPorPagina,
}: {
  dados: P[]; colunas: Array<{ key: string; label: string; render?: (val: unknown, row: P) => React.ReactNode; [k: string]: unknown }>;
  colunasFilhas?: Array<{ key: string; label: string; render?: (val: unknown, row: F) => React.ReactNode; [k: string]: unknown }>;
  filhos?: (parent: P) => F[]; acoes?: Array<{ id: string; tooltip: string; icone: React.ReactNode; onClick: (row: P) => void }>;
  itemId: (row: P) => string; placeholderBusca?: string; campoBusca?: string;
  mensagemVazio?: string; carregando?: boolean; itensPorPagina?: number;
}) {
  if (carregando) return <div data-testid="tabela-loading">Carregando...</div>
  if (dados.length === 0) return <div data-testid="tabela-vazia">{mensagemVazio}</div>

  return (
    <div data-testid="tabela-camadas">
      <input data-testid="tabela-busca" placeholder={placeholderBusca} />
      <table>
        <thead>
          <tr>
            {colunas.map(c => <th key={c.key}>{c.label}</th>)}
            {acoes && <th>Acoes</th>}
          </tr>
        </thead>
        <tbody>
          {dados.map((row) => {
            const id = itemId(row)
            const childRows = filhos?.(row) ?? []
            return (
              <React.Fragment key={id}>
                <tr data-testid={`tabela-row-${id}`}>
                  {colunas.map(c => (
                    <td key={c.key}>
                      {c.render ? c.render((row as Record<string, unknown>)[c.key], row) : String((row as Record<string, unknown>)[c.key] ?? '')}
                    </td>
                  ))}
                  {acoes && (
                    <td>
                      {acoes.map(a => (
                        <button key={a.id} data-testid={`acao-${a.id}-${id}`} onClick={() => a.onClick(row)}>
                          {a.icone}
                        </button>
                      ))}
                    </td>
                  )}
                </tr>
                {childRows.map((child, ci) => (
                  <tr key={`${id}-child-${ci}`} data-testid={`tabela-child-${id}-${ci}`}>
                    {colunasFilhas?.map(c => (
                      <td key={c.key}>
                        {c.render ? c.render((child as Record<string, unknown>)[c.key], child) : String((child as Record<string, unknown>)[c.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
export type TCGColuna<T> = {
  key: string; label: string; align?: string;
  tooltipTitulo?: string; tooltipDescricao?: string;
  render?: (val: unknown, row: T) => React.ReactNode;
}
export type TCGAcao<T> = {
  id: string; tooltip: string; icone: React.ReactNode; onClick: (row: T) => void;
}

// ── Modal Confirmar Excluir ──
export function SelecaoExcluirGlobal({
  aberto, titulo, descricao, nomeItem, aoConfirmar, aoCancelar,
}: {
  aberto: boolean; titulo: string; descricao: string; nomeItem?: string;
  aoConfirmar: () => void; aoCancelar: () => void;
}) {
  if (!aberto) return null
  return (
    <div data-testid="modal-excluir" role="dialog">
      <h2>{titulo}</h2>
      <p>{descricao}</p>
      {nomeItem && <span data-testid="modal-nome-item">{nomeItem}</span>}
      <button data-testid="modal-confirmar" onClick={aoConfirmar}>Confirmar</button>
      <button data-testid="modal-cancelar" onClick={aoCancelar}>Cancelar</button>
    </div>
  )
}

// ── Botoes Salvar ──
export function BotoesSalvarGlobal({
  dirty, onSalvar, onCancelar, alinhamento,
}: {
  dirty: boolean; onSalvar: () => void; onCancelar: () => void; alinhamento?: string;
}) {
  return (
    <div data-testid="botoes-salvar" data-dirty={dirty}>
      <button data-testid="btn-salvar" onClick={onSalvar} disabled={!dirty}>Salvar</button>
      <button data-testid="btn-cancelar" onClick={onCancelar} disabled={!dirty}>Cancelar</button>
    </div>
  )
}

export function useDirty(initial: unknown, current: unknown) {
  const dirty = JSON.stringify(initial) !== JSON.stringify(current)
  return {
    dirty,
    resetDirty: (_val?: unknown) => {},
  }
}

// ── Localizar Expandido ──
export function LocalizarExpandidoCampoGlobal({
  placeholder, disableGlobalDOMFilter,
}: {
  placeholder?: string; disableGlobalDOMFilter?: boolean;
}) {
  return <input data-testid="localizar-expandido" placeholder={placeholder} />
}
