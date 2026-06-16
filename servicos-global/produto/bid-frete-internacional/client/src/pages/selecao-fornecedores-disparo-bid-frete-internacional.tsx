/**
 * Seleção de fornecedores e canais para disparo de cotação.
 */

import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Envelope, ChatCircle, UsersThree, Star, Trash, CheckCircle, WarningCircle } from '@phosphor-icons/react'
import { GravityLoader } from '@nucleo/gravity-loader-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { TIPO_FORNECEDOR_LABELS, type CanalDisparo, type Fornecedor, type TipoFornecedor, type Visibilidade } from '../shared/types'
import {
  analisarContatosDisparoFornecedores,
  fornecedorAtendeCanalDisparo,
  fornecedorTemEmailDisparo,
  fornecedorTemWhatsappDisparo,
} from '../shared/contato-disparo-bid-frete-internacional'
import { ContatoEmailFornecedorDisparo } from './contato-email-fornecedor-disparo-bid-frete-internacional'

export interface SelecaoFornecedoresDisparoProps {
  visibilidade: Visibilidade
  fornecedores: Fornecedor[]
  carregando: boolean
  selecionados: string[]
  onChangeSelecionados: (ids: string[]) => void
  canais: CanalDisparo[]
  onChangeCanais: (canais: CanalDisparo[]) => void
  /** Cotação aberta: fornecedores removidos manualmente do disparo. */
  excluidosDisparo?: string[]
  onExcluirFornecedorDisparo?: (id_fornecedor_bid_frete_internacional: string) => void
  emailsPorFornecedor?: Record<string, string>
  onEmailFornecedorChange?: (id_fornecedor: string, email: string) => void
  onContatosFornecedorAtualizados?: () => void
}

/** Fornecedores ativos que aceitam cotação aberta (elegíveis ao disparo automático). */
export function fornecedoresElegiveisCotacaoAberta(fornecedores: Fornecedor[]): Fornecedor[] {
  return fornecedores.filter(
    f => f.status_fornecedor_bid_frete_internacional === 'ATIVO'
      && f.aceita_cotacao_aberta_fornecedor_bid_frete_internacional,
  )
}

/** IDs elegíveis menos os excluídos pelo usuário na cotação aberta. */
export function idsFornecedoresDisparoCotacaoAberta(
  fornecedores: Fornecedor[],
  excluidos: string[],
): string[] {
  return fornecedoresElegiveisCotacaoAberta(fornecedores)
    .filter(f => !excluidos.includes(f.id_fornecedor_bid_frete_internacional))
    .map(f => f.id_fornecedor_bid_frete_internacional)
}

function rotuloContatoFornecedorDisparo(f: Fornecedor, canais: CanalDisparo[]): string | null {
  const partes: string[] = []
  if (canais.includes('EMAIL')) {
    partes.push(
      fornecedorTemEmailDisparo(f)
        ? 'E-mail cadastrado'
        : 'Sem e-mail',
    )
  }
  if (canais.includes('WHATSAPP')) {
    partes.push(
      fornecedorTemWhatsappDisparo(f)
        ? 'WhatsApp cadastrado'
        : 'Sem WhatsApp',
    )
  }
  return partes.length > 0 ? partes.join(' · ') : null
}

function LinhaContatoFornecedorDisparo({
  fornecedor,
  canais,
  emailsPorFornecedor,
  onEmailFornecedorChange,
  onContatosFornecedorAtualizados,
}: {
  fornecedor: Fornecedor
  canais: CanalDisparo[]
  emailsPorFornecedor?: Record<string, string>
  onEmailFornecedorChange?: (id_fornecedor: string, email: string) => void
  onContatosFornecedorAtualizados?: () => void
}) {
  if (canais.length === 0) return null
  const id = fornecedor.id_fornecedor_bid_frete_internacional
  return (
    <span className="bf-disparo-item-contatos">
      {canais.includes('EMAIL') && (
        <ContatoEmailFornecedorDisparo
          fornecedor={fornecedor}
          emailSelecionado={emailsPorFornecedor?.[id]}
          onEmailSelecionado={onEmailFornecedorChange}
          onContatosAtualizados={onContatosFornecedorAtualizados}
        />
      )}
      {canais.includes('WHATSAPP') && (
        <BadgeContatoFornecedor fornecedor={fornecedor} canais={['WHATSAPP']} />
      )}
    </span>
  )
}
function BadgeContatoFornecedor({ fornecedor, canais }: { fornecedor: Fornecedor; canais: CanalDisparo[] }) {
  if (canais.length === 0) return null

  const okEmail = !canais.includes('EMAIL') || fornecedorTemEmailDisparo(fornecedor)
  const okWhatsapp = !canais.includes('WHATSAPP') || fornecedorTemWhatsappDisparo(fornecedor)
  const ok = okEmail && okWhatsapp

  return (
    <span className={`bf-disparo-contato-badge ${ok ? 'bf-disparo-contato-badge--ok' : 'bf-disparo-contato-badge--warn'}`}>
      {ok ? <CheckCircle weight="fill" size={12} /> : <WarningCircle weight="fill" size={12} />}
      {rotuloContatoFornecedorDisparo(fornecedor, canais)}
    </span>
  )
}

function ResumoContatosDisparo({
  fornecedoresDestino,
  canais,
}: {
  fornecedoresDestino: Fornecedor[]
  canais: CanalDisparo[]
}) {
  const { t } = useTranslation()

  if (canais.length === 0 || fornecedoresDestino.length === 0) return null

  const analise = analisarContatosDisparoFornecedores(fornecedoresDestino)
  const semCanal = fornecedoresDestino.filter(
    f => canais.some(c => !fornecedorAtendeCanalDisparo(f, c)),
  )

  return (
    <div className="bf-disparo-resumo-contatos" role="status">
      <span className="bf-disparo-resumo-titulo">
        {t('bidfrete.disparo.resumo_contatos', 'Antes de enviar')}
      </span>
      {canais.includes('EMAIL') && (
        <p className="bf-disparo-resumo-linha">
          <Envelope weight="duotone" size={14} />
          {t('bidfrete.disparo.resumo_email', '{{com}} de {{total}} com e-mail válido', {
            com: analise.com_email,
            total: analise.total,
          })}
        </p>
      )}
      {canais.includes('WHATSAPP') && (
        <p className="bf-disparo-resumo-linha">
          <ChatCircle weight="duotone" size={14} />
          {t('bidfrete.disparo.resumo_whatsapp', '{{com}} de {{total}} com WhatsApp', {
            com: analise.com_whatsapp,
            total: analise.total,
          })}
        </p>
      )}
      {semCanal.length > 0 && (
        <p className="bf-disparo-resumo-alerta" role="alert">
          <WarningCircle weight="fill" size={14} />
          {t(
            'bidfrete.disparo.sem_contato_lista',
            'Sem contato para o canal selecionado: {{nomes}}',
            {
              nomes: semCanal
                .map(f => f.nome_fornecedor_bid_frete_internacional)
                .slice(0, 4)
                .join(', ')
                + (semCanal.length > 4 ? ` +${semCanal.length - 4}` : ''),
            },
          )}
        </p>
      )}
    </div>
  )
}

function rotuloMetaFornecedorDisparo(f: Fornecedor): string {
  const tipo = TIPO_FORNECEDOR_LABELS[f.tipo_fornecedor_bid_frete_internacional]
    ?? f.tipo_fornecedor_bid_frete_internacional
  const nota = f.nota_global_classificacao_bid_frete_internacional
  if (nota != null) {
    return `${tipo} · ${nota.toFixed(1)}/5`
  }
  return tipo
}

function toggleItem<T extends string>(lista: T[], item: T): T[] {
  return lista.includes(item) ? lista.filter(i => i !== item) : [...lista, item]
}

/** Spinner padrão da plataforma enquanto a lista de fornecedores carrega. */
function CarregandoFornecedoresDisparo() {
  const { t } = useTranslation()
  return (
    <div className="bf-disparo-carregando" role="status" aria-live="polite" aria-busy="true">
      <GravityLoader
        texto={t('bidfrete.disparo.carregando_fornecedores', 'Carregando fornecedores…')}
        tamanho="sm"
      />
    </div>
  )
}

/** Toggle expandível com barras de nota por fornecedor (Aberta e Direcionada). */
function BarrasNotasFornecedores({
  fornecedores,
  canais,
  onExcluirFornecedor,
  emailsPorFornecedor,
  onEmailFornecedorChange,
  onContatosFornecedorAtualizados,
}: {
  fornecedores: Fornecedor[]
  canais: CanalDisparo[]
  onExcluirFornecedor?: (id_fornecedor_bid_frete_internacional: string) => void
  emailsPorFornecedor?: Record<string, string>
  onEmailFornecedorChange?: (id_fornecedor: string, email: string) => void
  onContatosFornecedorAtualizados?: () => void
}) {
  const { t } = useTranslation()
  const [graficoAberto, setGraficoAberto] = React.useState(false)

  if (fornecedores.length === 0) return null

  const ordenadosPorNota = [...fornecedores].sort(
    (a, b) => (b.nota_global_classificacao_bid_frete_internacional ?? 0) - (a.nota_global_classificacao_bid_frete_internacional ?? 0),
  )

  const comExcluir = onExcluirFornecedor != null

  return (
    <>
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
            const id = f.id_fornecedor_bid_frete_internacional
            return (
              <div
                key={id}
                className={`bf-preview-barra-linha${comExcluir ? ' bf-preview-barra-linha--com-excluir' : ''}`}
              >
                <span className="bf-preview-barra-nome" title={f.nome_fornecedor_bid_frete_internacional}>
                  {f.nome_fornecedor_bid_frete_internacional}
                </span>
                <LinhaContatoFornecedorDisparo
                  fornecedor={f}
                  canais={canais}
                  emailsPorFornecedor={emailsPorFornecedor}
                  onEmailFornecedorChange={onEmailFornecedorChange}
                  onContatosFornecedorAtualizados={onContatosFornecedorAtualizados}
                />
                {comExcluir ? (
                  <span className="bf-preview-barra-meta">{rotuloMetaFornecedorDisparo(f)}</span>
                ) : (
                  <>
                    <div className="bf-preview-barra-track">
                      <div
                        className="bf-preview-barra-fill"
                        style={{ width: `${((nota ?? 0) / 5) * 100}%` }}
                      />
                    </div>
                    <span className="bf-preview-barra-nota">{nota != null ? `${nota.toFixed(1)}/5` : '—'}</span>
                  </>
                )}
                {comExcluir && (
                  <TooltipGlobal
                    descricao={t('bidfrete.disparo.excluir_fornecedor', 'Excluir do disparo')}
                  >
                    <button
                      type="button"
                      className="bf-disparo-btn-excluir"
                      aria-label={t('bidfrete.disparo.excluir_fornecedor', 'Excluir do disparo')}
                      onClick={() => onExcluirFornecedor(id)}
                    >
                      <Trash size={16} weight="bold" />
                    </button>
                  </TooltipGlobal>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

/** Preview de quem receberá a cotação aberta: totais por tipo + barras de nota. */
function PreviewFornecedoresElegiveis({
  fornecedores,
  canais,
  excluidosDisparo,
  onExcluirFornecedorDisparo,
  emailsPorFornecedor,
  onEmailFornecedorChange,
  onContatosFornecedorAtualizados,
}: {
  fornecedores: Fornecedor[]
  canais: CanalDisparo[]
  excluidosDisparo: string[]
  onExcluirFornecedorDisparo?: (id_fornecedor_bid_frete_internacional: string) => void
  emailsPorFornecedor?: Record<string, string>
  onEmailFornecedorChange?: (id_fornecedor: string, email: string) => void
  onContatosFornecedorAtualizados?: () => void
}) {
  const { t } = useTranslation()

  const elegiveisBase = fornecedoresElegiveisCotacaoAberta(fornecedores)

  if (elegiveisBase.length === 0) {
    return (
      <p className="bf-disparo-vazio">
        {t('bidfrete.disparo.sem_elegiveis', 'Nenhum fornecedor ativo aceita cotação aberta — o disparo não terá destinatários.')}
      </p>
    )
  }

  const elegiveis = elegiveisBase.filter(
    f => !excluidosDisparo.includes(f.id_fornecedor_bid_frete_internacional),
  )

  if (elegiveis.length === 0) {
    return (
      <p className="bf-disparo-vazio">
        {t('bidfrete.disparo.todos_excluidos', 'Todos os fornecedores elegíveis foram excluídos — o disparo não terá destinatários.')}
      </p>
    )
  }

  const porTipo = new Map<TipoFornecedor, number>()
  for (const f of elegiveis) {
    porTipo.set(f.tipo_fornecedor_bid_frete_internacional, (porTipo.get(f.tipo_fornecedor_bid_frete_internacional) ?? 0) + 1)
  }

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

      <BarrasNotasFornecedores
        fornecedores={elegiveis}
        canais={canais}
        onExcluirFornecedor={onExcluirFornecedorDisparo}
        emailsPorFornecedor={emailsPorFornecedor}
        onEmailFornecedorChange={onEmailFornecedorChange}
        onContatosFornecedorAtualizados={onContatosFornecedorAtualizados}
      />
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
  excluidosDisparo = [],
  onExcluirFornecedorDisparo,
  emailsPorFornecedor,
  onEmailFornecedorChange,
  onContatosFornecedorAtualizados,
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

  const fornecedoresDestino = useMemo(() => {
    if (visibilidade === 'DIRECIONADA') {
      return fornecedores.filter(f => selecionados.includes(f.id_fornecedor_bid_frete_internacional))
    }
    return fornecedoresElegiveisCotacaoAberta(fornecedores).filter(
      f => !excluidosDisparo.includes(f.id_fornecedor_bid_frete_internacional),
    )
  }, [visibilidade, fornecedores, selecionados, excluidosDisparo])

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

      {carregando ? (
        <CarregandoFornecedoresDisparo />
      ) : (
        <>
          {visibilidade === 'ABERTA' && (
            <PreviewFornecedoresElegiveis
              fornecedores={fornecedores}
              canais={canais}
              excluidosDisparo={excluidosDisparo}
              onExcluirFornecedorDisparo={onExcluirFornecedorDisparo}
              emailsPorFornecedor={emailsPorFornecedor}
              onEmailFornecedorChange={onEmailFornecedorChange}
              onContatosFornecedorAtualizados={onContatosFornecedorAtualizados}
            />
          )}

          {visibilidade === 'DIRECIONADA' && (
            <div className="bf-disparo-lista-wrap">
              {fornecedores.length === 0 ? (
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
                          <span className="bf-disparo-item-corpo">
                            <span className="bf-disparo-item-nome">{f.nome_fornecedor_bid_frete_internacional}</span>
                            {canais.length > 0 && (
                              <LinhaContatoFornecedorDisparo
                                fornecedor={f}
                                canais={canais}
                                emailsPorFornecedor={emailsPorFornecedor}
                                onEmailFornecedorChange={onEmailFornecedorChange}
                                onContatosFornecedorAtualizados={onContatosFornecedorAtualizados}
                              />
                            )}
                          </span>
                          <span className="bf-disparo-item-meta">{rotuloMetaFornecedorDisparo(f)}</span>
                        </label>
                      )
                    })}
                  </div>
                  <BarrasNotasFornecedores
                    fornecedores={fornecedores}
                    canais={canais}
                    emailsPorFornecedor={emailsPorFornecedor}
                    onEmailFornecedorChange={onEmailFornecedorChange}
                    onContatosFornecedorAtualizados={onContatosFornecedorAtualizados}
                  />
                </>
              )}
            </div>
          )}
        </>
      )}

      {!carregando && canais.length > 0 && (
        <ResumoContatosDisparo fornecedoresDestino={fornecedoresDestino} canais={canais} />
      )}

      <style>{`
        .bf-disparo-selecao { display: flex; flex-direction: column; gap: 1rem; }
        .bf-disparo-carregando {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          min-height: 8rem; padding: 1.5rem 1rem; border-radius: 12px;
          border: 1px dashed rgba(129, 140, 248, 0.28);
          background: rgba(30, 41, 59, 0.45);
        }
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
          display: grid; grid-template-columns: auto 1fr auto; gap: 0.75rem; align-items: start;
          padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--bg-elevated, #475569);
          cursor: pointer; background: var(--bg-base, #1e293b);
        }
        .bf-disparo-item-corpo { display: flex; flex-direction: column; gap: 0.35rem; min-width: 0; }
        .bf-disparo-item-contatos { display: flex; flex-wrap: wrap; align-items: center; gap: 0.35rem; }
        .bf-disparo-item--selected { border-color: rgba(99,102,241,0.45); background: rgba(99,102,241,0.08); }
        .bf-disparo-item-nome { font-size: 0.875rem; font-weight: 600; color: var(--text-primary, #f1f5f9); }
        .bf-disparo-item-meta { font-size: 0.75rem; color: var(--text-muted, #64748b); text-align: right; white-space: nowrap; }
        .bf-disparo-vazio { font-size: 0.875rem; color: var(--text-muted, #64748b); margin: 0; }
        .bf-disparo-contato-badge {
          display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.6875rem; font-weight: 600;
          padding: 0.15rem 0.45rem; border-radius: 999px; width: fit-content;
        }
        .bf-disparo-contato-badge--ok { color: #86efac; background: rgba(34, 197, 94, 0.12); }
        .bf-disparo-contato-badge--warn { color: #fca5a5; background: rgba(239, 68, 68, 0.12); }
        .bf-disparo-resumo-contatos {
          display: flex; flex-direction: column; gap: 0.45rem; padding: 0.75rem 0.9rem;
          border-radius: 10px; border: 1px solid rgba(129, 140, 248, 0.25); background: rgba(99, 102, 241, 0.06);
        }
        .bf-disparo-resumo-titulo {
          font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
          color: var(--accent, #818cf8);
        }
        .bf-disparo-resumo-linha {
          display: flex; align-items: center; gap: 0.45rem; margin: 0; font-size: 0.8125rem;
          color: var(--text-secondary, #94a3b8);
        }
        .bf-disparo-resumo-alerta {
          display: flex; align-items: flex-start; gap: 0.45rem; margin: 0; font-size: 0.8125rem;
          color: #fca5a5; line-height: 1.45;
        }

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
        .bf-preview-barra-linha--com-excluir { grid-template-columns: minmax(120px, 1fr) auto auto; gap: 0.75rem; }
        .bf-preview-barra-nome { font-size: 0.8125rem; font-weight: 600; color: var(--text-primary, #f1f5f9); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .bf-preview-barra-track { height: 8px; border-radius: 999px; background: rgba(71,85,105,0.45); overflow: hidden; }
        .bf-preview-barra-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #6366f1, #a78bfa); }
        .bf-preview-barra-nota { font-size: 0.75rem; font-weight: 700; color: var(--text-secondary, #94a3b8); font-variant-numeric: tabular-nums; text-align: right; }
        .bf-preview-barra-meta { font-size: 0.75rem; color: var(--text-muted, #64748b); text-align: right; white-space: nowrap; }
        .bf-disparo-btn-excluir {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 50%;
          background: transparent; border: 1px solid transparent;
          color: #ef4444; cursor: pointer; transition: all 0.15s; flex-shrink: 0;
          padding: 0; font-family: inherit;
        }
        .bf-disparo-btn-excluir:hover {
          background: rgba(239, 68, 68, 0.12);
          border-color: rgba(239, 68, 68, 0.3);
        }
      `}</style>
    </div>
  )
}
