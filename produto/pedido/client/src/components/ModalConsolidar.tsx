/**
 * ModalConsolidar.tsx — Modal de consolidação de pedidos
 *
 * Permite ao usuário juntar dois ou mais pedidos em um pedido consolidado.
 * Exibe campos divergentes com seletor de valor, badge de origens e tooltip.
 * Campos iguais exibem valor sem indicador.
 *
 * Regras de negócio:
 *   - Aviso de divergência: ativo por padrão (config)
 *   - Fundir itens com mesmo part_number: desativado por padrão (config)
 *   - Campos divergentes: primeiro pedido prevalece por padrão (config)
 *   - Número do pedido consolidado: usuário digita ou usa sugestão
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Warning, CheckCircle, MagnifyingGlass, Spinner, WarningDiamond } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { useShellStore } from '@gravity/shell'
import type { Pedido, ConsolidacaoPreview, ConsolidacaoPayload, CampoDivergente } from '../shared/types'
import { pedidoConsolidarApi } from '../shared/api'
import { fmtMoeda } from '../shared/types'

// ── Props ─────────────────────────────────────────────────────────────────────

interface ModalConsolidarProps {
  pedidosSelecionados: Pedido[]
  onFechar: () => void
  onConcluido: () => void
  /** Sinaliza que os pedidos selecionados possuem tipos de operação diferentes (Onda C). */
  conflito_tipo_operacao?: boolean
}

// ── Componente de linha de campo divergente ───────────────────────────────────

interface LinhaCampoDivergenteProps {
  campo: CampoDivergente
  valorEscolhido: string | number | null
  onMudar: (valor: string | number | null) => void
}

function LinhaCampoDivergente({ campo, valorEscolhido, onMudar }: LinhaCampoDivergenteProps) {
  const { t } = useTranslation()
  const [tooltipVisivel, setTooltipVisivel] = useState(false)

  return (
    <tr className="modal-consolidar__linha-campo">
      <td className="modal-consolidar__campo-nome">{campo.rotulo}</td>
      <td className="modal-consolidar__campo-valor">
        <select
          className="modal-consolidar__select"
          value={String(valorEscolhido ?? '')}
          onChange={e => {
            const opt = campo.valores.find(v => String(v.valor) === e.target.value)
            onMudar(opt?.valor ?? e.target.value)
          }}
          aria-label={`Valor consolidado para ${campo.rotulo}`}
        >
          {campo.valores.map(v => (
            <option key={`${v.pedido_id}-${String(v.valor)}`} value={String(v.valor ?? '')}>
              {String(v.valor ?? '—')} ({v.numero_pedido})
            </option>
          ))}
        </select>
      </td>
      <td className="modal-consolidar__campo-origens">
        <span
          className="modal-consolidar__badge-divergencia"
          onMouseEnter={() => setTooltipVisivel(true)}
          onMouseLeave={() => setTooltipVisivel(false)}
          role="button"
          tabIndex={0}
          aria-label={`${campo.valores.length} origens divergentes para ${campo.rotulo}`}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') setTooltipVisivel(v => !v)
          }}
        >
          <Warning size={14} weight="fill" aria-hidden="true" />
          {t('pedido.modal_cons.badge_divergencia', { count: campo.valores.length })}
          {tooltipVisivel && (
            <span className="modal-consolidar__tooltip" role="tooltip">
              {campo.valores.map(v => (
                <span key={v.pedido_id} className="modal-consolidar__tooltip-linha">
                  <strong>{v.numero_pedido}:</strong> {String(v.valor ?? '—')}
                </span>
              ))}
            </span>
          )}
        </span>
      </td>
    </tr>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export function ModalConsolidar({ pedidosSelecionados, onFechar, onConcluido, conflito_tipo_operacao: conflitoProp = false }: ModalConsolidarProps) {
  const { addNotification } = useShellStore()
  const { t } = useTranslation()
  const [preview, setPreview] = useState<ConsolidacaoPreview | null>(null)
  const [carregandoPreview, setCarregandoPreview] = useState(true)
  const [erroPreview, setErroPreview] = useState<string | null>(null)
  const [numeroPedido, setNumeroPedido] = useState('')
  const [camposEscolhidos, setCamposEscolhidos] = useState<Record<string, string | number | null>>({})
  const [fundirItens, setFundirItens] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erroSalvar, setErroSalvar] = useState<string | null>(null)

  const ids = pedidosSelecionados.map(p => p.id)

  // Conflito de tipo de operação: prop externa (usada antes do preview) OU campo do preview (Onda C)
  const conflito_tipo_operacao = conflitoProp || (preview?.conflito_tipo_operacao ?? false)

  // Carregar preview ao abrir
  useEffect(() => {
    let cancelado = false
    setCarregandoPreview(true)
    setErroPreview(null)

    pedidoConsolidarApi.preview(ids)
      .then(data => {
        if (cancelado) return
        setPreview(data)
        setNumeroPedido(data.numero_sugerido)
        // Inicializar campos com valor sugerido (primeiro pedido)
        const iniciais: Record<string, string | number | null> = {}
        for (const campo of data.campos_divergentes) {
          iniciais[campo.campo] = campo.valor_sugerido
        }
        setCamposEscolhidos(iniciais)
      })
      .catch((err: unknown) => {
        if (cancelado) return
        setErroPreview(err instanceof Error ? err.message : 'Erro ao carregar preview')
      })
      .finally(() => {
        if (!cancelado) setCarregandoPreview(false)
      })

    return () => { cancelado = true }
  }, []) // executa somente na montagem — ids são estáveis

  const handleMudarCampo = useCallback((campo: string, valor: string | number | null) => {
    setCamposEscolhidos(prev => ({ ...prev, [campo]: valor }))
  }, [])

  const handleConsolidar = useCallback(async () => {
    if (!preview || !numeroPedido.trim()) return

    setSalvando(true)
    setErroSalvar(null)

    const payload: ConsolidacaoPayload = {
      ids,
      numero_pedido: numeroPedido.trim(),
      campos_escolhidos: camposEscolhidos,
      fundir_itens_mesmo_part_number: fundirItens,
    }

    try {
      await pedidoConsolidarApi.confirmar(payload)
      addNotification({ type: 'success', message: `${pedidosSelecionados.length} POs consolidadas em ${numeroPedido.trim()}.`, duration: 4000 })
      onConcluido()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao consolidar pedidos'
      setErroSalvar(msg)
      addNotification({ type: 'error', message: `Falha ao consolidar: ${msg}`, duration: 4000 })
    } finally {
      setSalvando(false)
    }
  }, [preview, numeroPedido, camposEscolhidos, fundirItens, ids, onConcluido, pedidosSelecionados, addNotification])

  // Fechar com Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onFechar])

  const totalDivergencias = preview?.campos_divergentes.length ?? 0

  return (
    <div
      className="modal-consolidar__overlay"
      onClick={e => { if (e.target === e.currentTarget) onFechar() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-consolidar-titulo"
    >
      <div className="modal-consolidar__container">
        {/* Header */}
        <div className="modal-consolidar__header">
          <h2 id="modal-consolidar-titulo" className="modal-consolidar__titulo">
            {t('pedido.modal_cons.titulo', { count: pedidosSelecionados.length })}
          </h2>
          <button
            className="modal-consolidar__fechar"
            onClick={onFechar}
            aria-label={t('pedido.modal_cons.aria_fechar')}
            type="button"
          >
            ×
          </button>
        </div>

        {/* Corpo */}
        <div className="modal-consolidar__corpo">
          {/* Banner: conflito de tipo de operação (dados vindos da Onda C) */}
          {conflito_tipo_operacao && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
              padding: '0.75rem 1rem',
              background: 'color-mix(in srgb, var(--danger) 8%, transparent)',
              border: '1px solid color-mix(in srgb, var(--danger) 30%, transparent)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
            }}>
              <WarningDiamond weight="duotone" size={18} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>
                  {t('pedido.modal_cons.conflito_titulo')}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
                  {t('pedido.modal_cons.conflito_msg')}
                </p>
              </div>
            </div>
          )}
          {carregandoPreview ? (
            <div className="modal-consolidar__loading" aria-live="polite">
              <Spinner size={24} className="modal-consolidar__spinner" aria-hidden="true" />
              <span>{t('pedido.modal_cons.carregando')}</span>
            </div>
          ) : erroPreview ? (
            <div className="modal-consolidar__erro" role="alert">
              <Warning size={16} weight="fill" aria-hidden="true" />
              {erroPreview}
            </div>
          ) : preview ? (
            <>
              {/* Número do pedido consolidado */}
              <div className="modal-consolidar__campo-numero">
                <label htmlFor="numero-pedido-consolidado" className="modal-consolidar__label">
                  {t('pedido.modal_cons.numero_label')}
                </label>
                <input
                  id="numero-pedido-consolidado"
                  type="text"
                  className="modal-consolidar__input"
                  value={numeroPedido}
                  onChange={e => setNumeroPedido(e.target.value)}
                  placeholder={t('pedido.modal_cons.numero_placeholder')}
                  aria-required="true"
                  aria-describedby="numero-pedido-hint"
                />
                <span id="numero-pedido-hint" className="modal-consolidar__hint">
                  {t('pedido.modal_cons.numero_hint')}
                </span>
              </div>

              {/* Tabela de campos */}
              {(preview.campos_divergentes.length > 0 || preview.campos_iguais.length > 0) && (
                <div className="modal-consolidar__secao">
                  <table className="modal-consolidar__tabela" aria-label={t('pedido.modal_cons.aria_tabela')}>
                    <thead>
                      <tr>
                        <th scope="col">{t('pedido.modal_cons.col_campo')}</th>
                        <th scope="col">{t('pedido.modal_cons.col_valor')}</th>
                        <th scope="col">{t('pedido.modal_cons.col_origens')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Campos iguais */}
                      {preview.campos_iguais.map(campo => {
                        const pedido = pedidosSelecionados[0]
                        const rotulos: Record<string, string> = {
                          incoterm: t('pedido.modal_cons.campo_incoterm'),
                          moeda_pedido: t('pedido.modal_cons.campo_moeda'),
                          nome_exportador: t('pedido.modal_cons.campo_exportador'),
                          data_emissao_pedido: t('pedido.modal_cons.campo_data_emissao'),
                          condicao_pagamento_pedido: t('pedido.modal_cons.campo_cond_pagamento'),
                        }
                        const valor = pedido[campo as keyof Pedido]
                        return (
                          <tr key={campo} className="modal-consolidar__linha-igual">
                            <td>{rotulos[campo] ?? campo}</td>
                            <td>{String(valor ?? '—')}</td>
                            <td>
                              <span className="modal-consolidar__badge-igual" aria-label={t('pedido.modal_cons.aria_badge_igual')}>
                                <CheckCircle size={14} weight="fill" aria-hidden="true" />
                                {t('pedido.modal_cons.badge_igual')}
                              </span>
                            </td>
                          </tr>
                        )
                      })}

                      {/* Campos divergentes */}
                      {preview.campos_divergentes.map(campo => (
                        <LinhaCampoDivergente
                          key={campo.campo}
                          campo={campo}
                          valorEscolhido={camposEscolhidos[campo.campo] ?? campo.valor_sugerido}
                          onMudar={valor => handleMudarCampo(campo.campo, valor)}
                        />
                      ))}

                      {/* Valor total (sempre soma) */}
                      <tr className="modal-consolidar__linha-total">
                        <td>{t('pedido.modal_cons.campo_valor_total')}</td>
                        <td>{fmtMoeda(preview.valor_total_soma, preview.moeda)}</td>
                        <td>
                          <span className="modal-consolidar__badge-soma">{t('pedido.modal_cons.badge_soma')}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Seção de itens */}
              {preview.itens.some(i => i.pode_fundir) && (
                <div className="modal-consolidar__secao">
                  <label className="modal-consolidar__checkbox-label">
                    <input
                      type="checkbox"
                      checked={fundirItens}
                      onChange={e => setFundirItens(e.target.checked)}
                      aria-describedby="fundir-itens-hint"
                    />
                    <span>{t('pedido.modal_cons.fundir_label')}</span>
                  </label>
                  <span id="fundir-itens-hint" className="modal-consolidar__hint">
                    {t('pedido.modal_cons.fundir_hint')}
                  </span>
                </div>
              )}

              {/* Contador de divergências */}
              {totalDivergencias > 0 && (
                <div className="modal-consolidar__aviso-divergencias" role="status" aria-live="polite">
                  <Warning size={16} weight="fill" aria-hidden="true" />
                  {t('pedido.modal_cons.divergencias', { count: totalDivergencias, s: totalDivergencias !== 1 ? 's' : '' })}
                </div>
              )}

              {/* Erro ao salvar */}
              {erroSalvar && (
                <div className="modal-consolidar__erro" role="alert">
                  <Warning size={16} weight="fill" aria-hidden="true" />
                  {erroSalvar}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="modal-consolidar__footer">
          <BotaoGlobal
            variante="secundario"
            tamanho="medio"
            onClick={onFechar}
            disabled={salvando}
          >
            {t('pedido.modal_cons.cancelar')}
          </BotaoGlobal>
          <BotaoGlobal
            variante="primario"
            tamanho="medio"
            onClick={handleConsolidar}
            disabled={conflito_tipo_operacao || carregandoPreview || salvando || !numeroPedido.trim() || !!erroPreview}
            aria-busy={salvando}
          >
            {salvando ? t('pedido.modal_cons.consolidando') : t('pedido.modal_cons.consolidar')}
          </BotaoGlobal>
        </div>
      </div>
    </div>
  )
}
