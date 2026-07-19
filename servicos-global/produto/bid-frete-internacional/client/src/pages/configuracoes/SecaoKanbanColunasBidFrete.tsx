/**
 * SecaoKanbanColunasBidFrete — Configurações > Kanban > Colunas
 * Paridade visual com Pedido: Preview → Ativos → Disponíveis → Footer.
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, Plus, SquaresFour, X, Info } from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { BotaoSalvar, BotaoCancelar } from '@nucleo/botoes-salvar-global'
import { ConfiguracaoSecaoGlobal } from '@nucleo/cabecalho-secao-global'

export interface StatusKanbanColunaBidFrete {
  id: string
  nome: string
  rotulo: string
  cor: string
  ordem: number
  gerenciado_sistema: boolean
}

interface SecaoKanbanColunasBidFreteProps {
  statusConfig: StatusKanbanColunaBidFrete[]
  colunasOcultas: string[]
  dirty: boolean
  ehSistema: (status: StatusKanbanColunaBidFrete) => boolean
  onToggle: (id: string) => void
  onSalvar: () => void
  onDescartar: () => void
}

export function SecaoKanbanColunasBidFrete({
  statusConfig,
  colunasOcultas,
  dirty,
  ehSistema,
  onToggle,
  onSalvar,
  onDescartar,
}: SecaoKanbanColunasBidFreteProps) {
  const { t } = useTranslation()
  const ordenados = [...statusConfig].sort((a, b) => a.ordem - b.ordem)
  const ativos = ordenados.filter(s => !colunasOcultas.includes(s.id))
  const disponiveis = ordenados.filter(s => colunasOcultas.includes(s.id))

  return (
    <section className="cfg-secao">
      <div className="cfg-secao__header">
        <div>
          <h2 className="cfg-secao__titulo">
            {t('pedido.kanban_colunas.titulo', { defaultValue: 'Colunas do Kanban' })}
          </h2>
          <p className="cfg-secao__desc">
            {t('pedido.kanban_colunas.descricao', {
              defaultValue: 'Selecione quais colunas de status aparecem no Kanban. Novos status criados aparecem automaticamente.',
            })}
          </p>
        </div>
      </div>

      {statusConfig.length === 0 && (
        <p className="cfg-hint" style={{ textAlign: 'center', padding: '2rem 0' }}>
          {t('pedido.kanban_colunas.nenhum_status', { defaultValue: 'Nenhum status configurado' })}
        </p>
      )}

      {statusConfig.length > 0 && (
        <>
          <div className="cfg-cards-preview-wrap">
            <p className="cfg-cards-preview-label">
              <SquaresFour size={12} weight="fill" />
              {t('pedido.kanban_colunas.preview_label', { defaultValue: 'Preview — colunas visíveis no Kanban' })}
            </p>
            <div className="cfg-kanban-colunas-preview">
              {ativos.length === 0 && (
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0.25rem 0' }}>
                  {t('pedido.kanban_colunas.nenhuma_coluna_visivel', { defaultValue: 'Nenhuma coluna visível' })}
                </p>
              )}
              {ativos.map(s => (
                <div key={s.id} className="cfg-kanban-colunas-preview__col">
                  <span className="cfg-kanban-colunas-preview__bar" style={{ background: s.cor }} />
                  <span className="cfg-kanban-colunas-preview__label">{s.rotulo}</span>
                </div>
              ))}
            </div>
          </div>

          <ConfiguracaoSecaoGlobal
            label={t('pedido.kanban_colunas.ativos', { defaultValue: 'ATIVOS' })}
            count={t('pedido.kanban_colunas.contador_colunas', { count: ativos.length, defaultValue: '{{count}} coluna(s)' })}
          />
          <p className="cfg-hint">
            {t('pedido.kanban_colunas.hint_olho_ocultar', { defaultValue: 'Olho para ocultar a coluna no Kanban' })}
          </p>
          <div className="cfg-kanban-campos-lista">
            {ativos.length === 0 && (
              <p className="cfg-hint" style={{ textAlign: 'center', padding: '1rem 0' }}>
                {t('pedido.kanban_colunas.nenhuma_coluna_adicione', { defaultValue: 'Nenhuma coluna visível — adicione abaixo' })}
              </p>
            )}
            {ativos.map(s => (
              <div key={s.id} className="cfg-kanban-campo-row">
                <span className="cfg-kanban-campo-dot" style={{ background: s.cor }} />
                <span className="cfg-kanban-campo-label">{s.rotulo}</span>
                {ehSistema(s) && (
                  <span className="cfg-kanban-aba-fixa-badge">
                    {t('pedido.kanban_colunas.badge_sistema', { defaultValue: 'sistema' })}
                  </span>
                )}
                {ehSistema(s) ? (
                  <TooltipGlobal descricao={t('pedido.kanban_colunas.tooltip_sistema', { defaultValue: 'Coluna obrigatória — status de sistema sempre visível no Kanban' })}>
                    <span className="cfg-kanban-sistema-info" aria-label={t('pedido.kanban_colunas.aria_coluna_obrigatoria', { defaultValue: 'Coluna obrigatória' })}>
                      <Info size={14} weight="duotone" />
                    </span>
                  </TooltipGlobal>
                ) : (
                  <>
                    <TooltipGlobal descricao={t('pedido.kanban_colunas.tooltip_ocultar', { defaultValue: 'Ocultar coluna' })}>
                      <button
                        type="button"
                        className="cfg-eye-btn cfg-eye-btn--on"
                        onClick={() => onToggle(s.id)}
                        aria-label={t('pedido.kanban_colunas.aria_ocultar', { defaultValue: 'Ocultar coluna' })}
                      >
                        <Eye size={14} weight="bold" />
                      </button>
                    </TooltipGlobal>
                    <button
                      type="button"
                      className="cfg-remove-btn"
                      onClick={() => onToggle(s.id)}
                      aria-label={t('pedido.kanban_colunas.aria_mover_disponiveis', { defaultValue: 'Mover para disponíveis' })}
                    >
                      <X size={12} weight="bold" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          <ConfiguracaoSecaoGlobal
            label={t('pedido.kanban_colunas.disponiveis_adicionar', { defaultValue: 'DISPONÍVEIS PARA ADICIONAR' })}
            hint={t('pedido.kanban_colunas.hint_clique_mais', { defaultValue: 'clique em + para adicionar' })}
            style={{ marginTop: '1.5rem' }}
          />
          <div className="cfg-kanban-disponivel-lista">
            {disponiveis.length > 0 && (
              <div className="cfg-kanban-disponivel-header">
                <span>{t('pedido.kanban_colunas.coluna', { defaultValue: 'Coluna' })}</span>
                <span></span>
              </div>
            )}
            {disponiveis.length === 0 && (
              <p className="cfg-hint" style={{ textAlign: 'center', padding: '1rem 0' }}>
                {t('pedido.kanban_colunas.todas_visiveis', { defaultValue: 'Todas as colunas estão visíveis' })}
              </p>
            )}
            {disponiveis.map(s => (
              <div key={s.id} className="cfg-kanban-disponivel-row">
                <span className="cfg-kanban-disponivel-info">
                  <span className="cfg-kanban-campo-dot" style={{ background: s.cor }} />
                  <span className="cfg-kanban-disponivel-label">{s.rotulo}</span>
                </span>
                <TooltipGlobal descricao={t('pedido.kanban_colunas.tooltip_exibir', { defaultValue: 'Exibir coluna no Kanban' })}>
                  <button
                    type="button"
                    className="cfg-kanban-add-btn"
                    onClick={() => onToggle(s.id)}
                    aria-label={t('pedido.kanban_colunas.aria_exibir', { defaultValue: 'Exibir coluna' })}
                  >
                    <Plus size={13} weight="bold" />
                  </button>
                </TooltipGlobal>
              </div>
            ))}
          </div>

          <div className="cfg-campo-calc-item__footer" style={{ display: 'flex', alignItems: 'center' }}>
            <p className="cfg-hint" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem', flex: 1 }}>
              <Info size={13} weight="duotone" />
              <span
                dangerouslySetInnerHTML={{
                  __html: t('bidfrete.configuracoes.kanban_colunas_rodape', {
                    defaultValue: 'Estas são as colunas padrão. Para criar novos status, acesse a seção <strong>Status Cotação</strong> no menu lateral.',
                  }),
                }}
              />
            </p>
            <BotaoCancelar onClick={onDescartar} dirty={dirty} />
            <BotaoSalvar onClick={onSalvar} dirty={dirty} />
          </div>
        </>
      )}
    </section>
  )
}
