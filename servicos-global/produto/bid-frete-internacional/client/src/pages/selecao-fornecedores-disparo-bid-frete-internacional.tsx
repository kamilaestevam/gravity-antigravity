/**
 * Seleção de fornecedores e canais para disparo de cotação.
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Envelope, ChatCircle, UsersThree, Star } from '@phosphor-icons/react'
import { TIPO_FORNECEDOR_LABELS, type CanalDisparo, type Fornecedor, type TipoFornecedor, type Visibilidade } from '../shared/types'

export interface SelecaoFornecedoresDisparoProps {
  visibilidade: Visibilidade
  fornecedores: Fornecedor[]
  carregando: boolean
  selecionados: string[]
  onChangeSelecionados: (ids: string[]) => void
  canais: CanalDisparo[]
  onChangeCanais: (canais: CanalDisparo[]) => void
}

function toggleItem<T extends string>(lista: T[], item: T): T[] {
  return lista.includes(item) ? lista.filter(i => i !== item) : [...lista, item]
}

/** Preview de quem receberá a cotação aberta: totais por tipo + barras de nota. */
function PreviewFornecedoresElegiveis({
  fornecedores,
  carregando,
}: {
  fornecedores: Fornecedor[]
  carregando: boolean
}) {
  const { t } = useTranslation()
  const [graficoAberto, setGraficoAberto] = React.useState(false)

  if (carregando) {
    return <p className="bf-disparo-vazio">{t('comum.carregando')}</p>
  }

  const elegiveis = fornecedores.filter(
    f => f.status_fornecedor_bid_frete_internacional === 'ATIVO'
      && f.aceita_cotacao_aberta_fornecedor_bid_frete_internacional,
  )

  if (elegiveis.length === 0) {
    return (
      <p className="bf-disparo-vazio">
        {t('bidfrete.disparo.sem_elegiveis', 'Nenhum fornecedor ativo aceita cotação aberta — o disparo não terá destinatários.')}
      </p>
    )
  }

  const porTipo = new Map<TipoFornecedor, number>()
  for (const f of elegiveis) {
    porTipo.set(f.tipo_fornecedor_bid_frete_internacional, (porTipo.get(f.tipo_fornecedor_bid_frete_internacional) ?? 0) + 1)
  }

  const ordenadosPorNota = [...elegiveis].sort(
    (a, b) => (b.nota_global_classificacao_bid_frete_internacional ?? 0) - (a.nota_global_classificacao_bid_frete_internacional ?? 0),
  )

  return (
    <div className="bf-preview-elegiveis">
      <span className="bf-preview-titulo">{t('bidfrete.disparo.preview', 'Preview')}</span>
      <div className="bf-preview-cards">
        <div className="bf-preview-card bf-preview-card--total">
          <UsersThree weight="duotone" size={18} />
          <span className="bf-preview-card-num">{elegiveis.length}</span>
          <span className="bf-preview-card-label">{t('bidfrete.disparo.total_elegiveis', 'Fornecedores elegíveis')}</span>
        </div>
        {[...porTipo.entries()].map(([tipo, qtd]) => (
          <div key={tipo} className="bf-preview-card">
            <span className="bf-preview-card-num">{qtd}</span>
            <span className="bf-preview-card-label">{TIPO_FORNECEDOR_LABELS[tipo] ?? tipo}</span>
          </div>
        ))}
      </div>

      <button type="button" className="bf-preview-toggle" onClick={() => setGraficoAberto(v => !v)}>
        <Star weight="duotone" size={14} />
        {graficoAberto
          ? t('bidfrete.disparo.ocultar_notas', 'Ocultar fornecedores e notas')
          : t('bidfrete.disparo.ver_notas', 'Ver fornecedores e notas')}
      </button>

      {graficoAberto && (
        <div className="bf-preview-barras">
          {ordenadosPorNota.map(f => {
            const nota = f.nota_global_classificacao_bid_frete_internacional
            return (
              <div key={f.id_fornecedor_bid_frete_internacional} className="bf-preview-barra-linha">
                <span className="bf-preview-barra-nome" title={f.nome_fornecedor_bid_frete_internacional}>
                  {f.nome_fornecedor_bid_frete_internacional}
                </span>
                <div className="bf-preview-barra-track">
                  <div
                    className="bf-preview-barra-fill"
                    style={{ width: `${((nota ?? 0) / 5) * 100}%` }}
                  />
                </div>
                <span className="bf-preview-barra-nota">{nota != null ? `${nota.toFixed(1)}/5` : '—'}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function SelecaoFornecedoresDisparo({
  visibilidade,
  fornecedores,
  carregando,
  selecionados,
  onChangeSelecionados,
  canais,
  onChangeCanais,
}: SelecaoFornecedoresDisparoProps) {
  const { t } = useTranslation()

  const idsFornecedores = fornecedores.map(f => f.id_fornecedor_bid_frete_internacional)
  const todosFornecedoresSelecionados = fornecedores.length > 0
    && idsFornecedores.every(id => selecionados.includes(id))

  function toggleTodosFornecedores() {
    if (todosFornecedoresSelecionados) {
      onChangeSelecionados([])
    } else {
      onChangeSelecionados([...idsFornecedores])
    }
  }

  return (
    <div className="bf-disparo-selecao">
      <p className="bf-disparo-hint">
        {visibilidade === 'ABERTA'
          ? t('bidfrete.disparo.hint_aberta', 'A cotação será enviada a todos os fornecedores ativos que aceitam cotação aberta.')
          : t('bidfrete.disparo.hint_direcionada', 'Selecione os fornecedores que receberão o pedido de cotação por e-mail.')}
      </p>

      <div className="bf-disparo-canais">
        <span className="bf-disparo-canais-label">{t('bidfrete.disparo.canais', 'Canais')}</span>
        <label className="bf-disparo-canal">
          <input
            type="checkbox"
            checked={canais.includes('EMAIL')}
            onChange={() => onChangeCanais(toggleItem(canais, 'EMAIL'))}
          />
          <Envelope weight="duotone" size={16} /> E-mail (Resend)
        </label>
        <label className="bf-disparo-canal">
          <input
            type="checkbox"
            checked={canais.includes('WHATSAPP')}
            onChange={() => onChangeCanais(toggleItem(canais, 'WHATSAPP'))}
          />
          <ChatCircle weight="duotone" size={16} /> WhatsApp
        </label>
      </div>

      {visibilidade === 'ABERTA' && (
        <PreviewFornecedoresElegiveis fornecedores={fornecedores} carregando={carregando} />
      )}

      {visibilidade === 'DIRECIONADA' && (
        <div className="bf-disparo-lista-wrap">
          {carregando ? (
            <p className="bf-disparo-vazio">{t('comum.carregando')}</p>
          ) : fornecedores.length === 0 ? (
            <p className="bf-disparo-vazio">{t('bidfrete.disparo.sem_fornecedores', 'Nenhum fornecedor ativo cadastrado.')}</p>
          ) : (
            <>
              <button
                type="button"
                className="bf-disparo-selecionar-todos"
                onClick={toggleTodosFornecedores}
              >
                {todosFornecedoresSelecionados
                  ? t('bidfrete.disparo.desmarcar_todos', 'Desmarcar todos')
                  : t('bidfrete.disparo.selecionar_todos', 'Selecionar todos')}
              </button>
              <div className="bf-disparo-lista">
            {fornecedores.map(f => {
              const id = f.id_fornecedor_bid_frete_internacional
              const checked = selecionados.includes(id)
              return (
                <label key={id} className={`bf-disparo-item ${checked ? 'bf-disparo-item--selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onChangeSelecionados(toggleItem(selecionados, id))}
                  />
                  <span className="bf-disparo-item-nome">{f.nome_fornecedor_bid_frete_internacional}</span>
                  <span className="bf-disparo-item-email">{f.email_fornecedor_bid_frete_internacional || '—'}</span>
                </label>
              )
            })}
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        .bf-disparo-selecao { display: flex; flex-direction: column; gap: 1rem; }
        .bf-disparo-hint { font-size: 0.875rem; color: var(--text-secondary, #94a3b8); margin: 0; line-height: 1.5; }
        .bf-disparo-canais { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem 1.25rem; }
        .bf-disparo-canais-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--text-muted, #64748b); }
        .bf-disparo-canal { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.875rem; cursor: pointer; color: var(--text-primary, #f1f5f9); }
        .bf-disparo-lista-wrap { display: flex; flex-direction: column; gap: 0.5rem; }
        .bf-disparo-selecionar-todos {
          background: none; border: none; color: #a78bfa; font-size: 0.625rem;
          cursor: pointer; font-weight: 600; padding: 0; align-self: flex-start; font-family: inherit;
        }
        .bf-disparo-selecionar-todos:hover { text-decoration: underline; }
        .bf-disparo-lista { display: flex; flex-direction: column; gap: 0.5rem; max-height: 280px; overflow-y: auto; }
        .bf-disparo-item {
          display: grid; grid-template-columns: auto 1fr auto; gap: 0.75rem; align-items: center;
          padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--bg-elevated, #475569);
          cursor: pointer; background: var(--bg-base, #1e293b);
        }
        .bf-disparo-item--selected { border-color: rgba(99,102,241,0.45); background: rgba(99,102,241,0.08); }
        .bf-disparo-item-nome { font-size: 0.875rem; font-weight: 600; color: var(--text-primary, #f1f5f9); }
        .bf-disparo-item-email { font-size: 0.75rem; color: var(--text-muted, #64748b); font-family: 'DM Mono', monospace; }
        .bf-disparo-vazio { font-size: 0.875rem; color: var(--text-muted, #64748b); margin: 0; }

        /* ── Preview cotação aberta ── */
        .bf-preview-elegiveis { display: flex; flex-direction: column; gap: 0.75rem; }
        .bf-preview-titulo { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--accent, #818cf8); }
        .bf-preview-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.65rem; }
        .bf-preview-card {
          display: flex; flex-direction: column; align-items: flex-start; gap: 0.2rem;
          padding: 0.75rem 0.9rem; border-radius: 10px;
          border: 1px solid var(--bg-elevated, rgba(255,255,255,0.08)); background: var(--bg-base, #1e293b);
        }
        .bf-preview-card--total { border-color: rgba(129,140,248,0.35); color: var(--accent, #818cf8); }
        .bf-preview-card-num { font-size: 1.25rem; font-weight: 800; color: var(--text-primary, #f1f5f9); line-height: 1; }
        .bf-preview-card-label { font-size: 0.6875rem; font-weight: 600; text-transform: uppercase; color: var(--text-muted, #64748b); }
        .bf-preview-toggle {
          display: inline-flex; align-items: center; gap: 0.4rem; align-self: flex-start;
          background: transparent; border: none; cursor: pointer; padding: 0;
          font-size: 0.8125rem; font-weight: 600; color: var(--accent, #818cf8); font-family: inherit;
        }
        .bf-preview-toggle:hover { text-decoration: underline; }
        .bf-preview-barras { display: flex; flex-direction: column; gap: 0.45rem; max-height: 220px; overflow-y: auto; }
        .bf-preview-barra-linha { display: grid; grid-template-columns: minmax(120px, 200px) 1fr 48px; gap: 0.65rem; align-items: center; }
        .bf-preview-barra-nome { font-size: 0.8125rem; font-weight: 600; color: var(--text-primary, #f1f5f9); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .bf-preview-barra-track { height: 8px; border-radius: 999px; background: rgba(71,85,105,0.45); overflow: hidden; }
        .bf-preview-barra-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #6366f1, #a78bfa); }
        .bf-preview-barra-nota { font-size: 0.75rem; font-weight: 700; color: var(--text-secondary, #94a3b8); font-variant-numeric: tabular-nums; text-align: right; }
      `}</style>
    </div>
  )
}
