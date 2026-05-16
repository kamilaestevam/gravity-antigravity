/**
 * SecaoKanbanColunas.tsx — Sub-seção "Colunas" de Configurações > Kanban
 *
 * Exibe a lista de colunas de status do Kanban com suporte a ocultar/exibir.
 * Segue o padrão: Preview → Ativos → Disponíveis para adicionar → Footer.
 *
 * Props são controladas pelo componente pai (Configuracoes.tsx), que mantém
 * o estado de `colunasOcultas` e a lógica de salvar/descartar.
 */

import React from 'react'
import { GravityLoader } from '@nucleo/gravity-loader-global'
import { Eye, Plus, SquaresFour, X, Info } from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { BotaoSalvar, BotaoCancelar } from '@nucleo/botoes-salvar-global'
import { ConfiguracaoSecaoGlobal } from '@nucleo/cabecalho-secao-global'
import type { PedidoStatusConfig } from '../shared/types'

// ── Props ─────────────────────────────────────────────────────────────────────

interface SecaoKanbanColunasProps {
  statusConfig:   PedidoStatusConfig[]
  loading:        boolean
  colunasOcultas: string[]
  dirty:          boolean
  onToggle:       (nome: string) => void
  onSalvar:       () => void
  onDescartar:    () => void
}

// ── Componente ────────────────────────────────────────────────────────────────

export function SecaoKanbanColunas({
  statusConfig,
  loading,
  colunasOcultas,
  dirty,
  onToggle,
  onSalvar,
  onDescartar,
}: SecaoKanbanColunasProps) {
  const ordenados   = [...statusConfig].sort((a, b) => a.ordem - b.ordem)
  const ativos      = ordenados.filter(s => !colunasOcultas.includes(s.nome))
  const disponiveis = ordenados.filter(s =>  colunasOcultas.includes(s.nome))

  return (
    <section className="cfg-secao">
      <div className="cfg-secao__header">
        <div>
          <h2 className="cfg-secao__titulo">Colunas do Kanban</h2>
          <p className="cfg-secao__desc">
            Selecione quais colunas de status aparecem no Kanban.
            Novos status criados aparecem automaticamente.
          </p>
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}>
          <GravityLoader tamanho="sm" />
        </div>
      )}

      {!loading && statusConfig.length === 0 && (
        <p className="cfg-hint" style={{ textAlign: 'center', padding: '2rem 0' }}>
          Nenhum status configurado
        </p>
      )}

      {!loading && statusConfig.length > 0 && (
        <>
          {/* ── Preview ── */}
          <div className="cfg-cards-preview-wrap">
            <p className="cfg-cards-preview-label">
              <SquaresFour size={12} weight="fill" />
              Preview — colunas visíveis no Kanban
            </p>
            <div className="cfg-kanban-colunas-preview">
              {ativos.length === 0 && (
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0.25rem 0' }}>
                  Nenhuma coluna visível
                </p>
              )}
              {ativos.map(s => (
                <div key={s.nome} className="cfg-kanban-colunas-preview__col">
                  <span className="cfg-kanban-colunas-preview__bar" style={{ background: s.cor }} />
                  <span className="cfg-kanban-colunas-preview__label">{s.rotulo}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Ativos ── */}
          <ConfiguracaoSecaoGlobal label="ATIVOS" count={`${ativos.length} coluna${ativos.length !== 1 ? 's' : ''}`} />
          <p className="cfg-hint">Olho para ocultar a coluna no Kanban</p>
          <div className="cfg-kanban-campos-lista">
            {ativos.length === 0 && (
              <p className="cfg-hint" style={{ textAlign: 'center', padding: '1rem 0' }}>
                Nenhuma coluna visível — adicione abaixo
              </p>
            )}
            {ativos.map(s => (
              <div key={s.nome} className="cfg-kanban-campo-row">
                <span className="cfg-kanban-campo-dot" style={{ background: s.cor }} />
                <span className="cfg-kanban-campo-label">{s.rotulo}</span>
                {s.is_sistema && (
                  <span className="cfg-kanban-aba-fixa-badge">sistema</span>
                )}
                {s.is_sistema ? (
                  <TooltipGlobal descricao="Coluna obrigatória — status de sistema sempre visível no Kanban">
                    <span className="cfg-kanban-sistema-info" aria-label="Coluna obrigatória">
                      <Info size={14} weight="duotone" />
                    </span>
                  </TooltipGlobal>
                ) : (
                  <>
                    <TooltipGlobal descricao="Ocultar coluna">
                      <button
                        type="button"
                        className="cfg-eye-btn cfg-eye-btn--on"
                        onClick={() => onToggle(s.nome)}
                        aria-label="Ocultar coluna"
                      >
                        <Eye size={14} weight="bold" />
                      </button>
                    </TooltipGlobal>
                    <button
                      type="button"
                      className="cfg-remove-btn"
                      onClick={() => onToggle(s.nome)}
                      aria-label="Mover para disponíveis"
                    >
                      <X size={12} weight="bold" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* ── Disponíveis para adicionar ── */}
          <ConfiguracaoSecaoGlobal
            label="DISPONÍVEIS PARA ADICIONAR"
            hint="clique em + para adicionar"
            style={{ marginTop: '1.5rem' }}
          />
          <div className="cfg-kanban-disponivel-lista">
            {disponiveis.length > 0 && (
              <div className="cfg-kanban-disponivel-header">
                <span>Coluna</span>
                <span></span>
              </div>
            )}
            {disponiveis.length === 0 && (
              <p className="cfg-hint" style={{ textAlign: 'center', padding: '1rem 0' }}>
                Todas as colunas estão visíveis
              </p>
            )}
            {disponiveis.map(s => (
              <div key={s.nome} className="cfg-kanban-disponivel-row">
                <span className="cfg-kanban-disponivel-info">
                  <span className="cfg-kanban-campo-dot" style={{ background: s.cor }} />
                  <span className="cfg-kanban-disponivel-label">{s.rotulo}</span>
                </span>
                <TooltipGlobal descricao="Exibir coluna no Kanban">
                  <button
                    type="button"
                    className="cfg-kanban-add-btn"
                    onClick={() => onToggle(s.nome)}
                    aria-label="Exibir coluna"
                  >
                    <Plus size={13} weight="bold" />
                  </button>
                </TooltipGlobal>
              </div>
            ))}
          </div>

          {/* ── Footer ── */}
          <div className="cfg-campo-calc-item__footer">
            <BotaoCancelar onClick={onDescartar} dirty={dirty} />
            <BotaoSalvar   onClick={onSalvar}    dirty={dirty} />
          </div>
        </>
      )}
    </section>
  )
}
