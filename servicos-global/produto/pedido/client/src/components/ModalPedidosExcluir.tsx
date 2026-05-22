/**
 * ModalPedidosExcluir.tsx — Modal de exclusão em lote de pedidos e/ou itens
 *
 * Substitui o `window.confirm()` nativo (fora do design system) por modal
 * customizado no padrão Solid Slate, espelhando ModalPedidosDuplicar.
 *
 * Suporta 3 cenários (mesmo padrão do Duplicar):
 *   - Só pedidos selecionados → preview + confirmar via pedidoExcluirApi
 *   - Só itens selecionados → excluir via pedidoExcluirApi.excluirItens
 *   - Misto (pedidos + itens) → ambos em paralelo
 *
 * Fluxo pedidos:
 *   1. Carrega preview (permitidos + bloqueados) ao abrir
 *   2. Mostra aviso destrutivo + tabela de permitidos + lista de bloqueados
 *   3. Botão "Excluir" (variante perigo) → chama pedidoExcluirApi.confirmar
 *
 * Fluxo itens:
 *   1. Agrupa itens por pedido_id
 *   2. Mostra tabela com itens que serão excluídos
 *   3. Botão "Excluir" → chama pedidoExcluirApi.excluirItens por grupo
 *
 * Resultado: "N pedidos excluídos. M itens excluídos."
 * Concluir → fecha + recarrega lista do pai
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, Spinner, Trash, Warning, X } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import type { ResultadoAcao } from '@nucleo/botao-global'
import { useShellStore } from '@gravity/shell'
import type { Pedido, PedidoItem, ExcluirPreview, ExcluirResultado } from '../shared/types'
import { pedidoExcluirApi } from '../shared/api'
import './ModalPedidosExcluir.css'

// ── Props ─────────────────────────────────────────────────────────────────────

interface ModalPedidosExcluirProps {
  pedidos: Pedido[]
  itens?: PedidoItem[]
  /** Mapa pedido_id → numero_pedido para exibir o número do pedido pai na tabela de itens */
  pedidosMapa?: Map<string, string>
  onFechar: () => void
  onConcluido: () => void
}

// ── Componente ────────────────────────────────────────────────────────────────

export function ModalPedidosExcluir({ pedidos, itens = [], pedidosMapa, onFechar, onConcluido }: ModalPedidosExcluirProps) {
  const { t } = useTranslation()
  const { addNotification } = useShellStore()
  const [preview, setPreview] = useState<ExcluirPreview | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [confirmando, setConfirmando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [resultado, setResultado] = useState<ExcluirResultado | null>(null)
  const [feedbackBotao, setFeedbackBotao] = useState<ResultadoAcao>(null)

  const ids = pedidos.map(p => p.id)

  // Itens avulsos = itens cujo pedido pai NÃO está na seleção de pedidos
  // (se o pai já está selecionado, os itens serão excluídos via cascade)
  const idsPedidosSelecionados = useMemo(() => new Set(pedidos.map(p => p.id)), [pedidos])
  const itensAvulsos = useMemo(
    () => itens.filter(it => !idsPedidosSelecionados.has(it.pedido_id)),
    [itens, idsPedidosSelecionados],
  )

  // Agrupar itens avulsos por pedido_id para chamadas batch
  const itensAgrupados = useMemo(() => {
    const mapa = new Map<string, PedidoItem[]>()
    for (const it of itensAvulsos) {
      const lista = mapa.get(it.pedido_id) ?? []
      lista.push(it)
      mapa.set(it.pedido_id, lista)
    }
    return mapa
  }, [itensAvulsos])

  const temPedidos = pedidos.length > 0
  const temItensAvulsos = itensAvulsos.length > 0

  // Carregar preview ao abrir (só se há pedidos)
  useEffect(() => {
    let cancelado = false

    if (!temPedidos) {
      // Só itens — não precisa de preview
      setCarregando(false)
      return
    }

    setCarregando(true)
    setErro(null)

    pedidoExcluirApi.preview(ids)
      .then(data => {
        if (cancelado) return
        setPreview(data)
      })
      .catch((err: unknown) => {
        if (cancelado) return
        setErro(err instanceof Error ? err.message : t('pedido.excluir.erro_carregar_preview'))
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })

    return () => { cancelado = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const totalPermitidos = preview?.permitidos.length ?? 0
  const totalBloqueados = preview?.bloqueados.length ?? 0

  // Pode excluir se: (há pedidos permitidos OU itens avulsos) E não está carregando/confirmando
  const podeExcluir = (totalPermitidos > 0 || temItensAvulsos) && !carregando && !confirmando

  const handleConfirmar = useCallback(async () => {
    if (!podeExcluir) return
    setConfirmando(true)
    setErro(null)

    try {
      let totalPedidosExcluidos = 0
      let totalItensExcluidos = 0
      let totalPedidosSemItem = 0

      // Executar em paralelo: pedidos + itens (mesmo padrão Duplicar)
      const promessas: Promise<void>[] = []

      // 1. Excluir pedidos (se há permitidos)
      if (preview && totalPermitidos > 0) {
        promessas.push(
          pedidoExcluirApi.confirmar(preview.permitidos.map(p => p.id)).then(res => {
            totalPedidosExcluidos += res.excluidos
            totalItensExcluidos += res.itens_excluidos
            totalPedidosSemItem += res.pedidos_excluidos_por_sem_item
          }),
        )
      }

      // 2. Excluir itens avulsos (agrupados por pedido)
      for (const [pedidoId, itensDoPedido] of itensAgrupados) {
        promessas.push(
          pedidoExcluirApi.excluirItens(pedidoId, itensDoPedido.map(i => i.id)).then(res => {
            totalPedidosExcluidos += res.excluidos
            totalItensExcluidos += res.itens_excluidos
            totalPedidosSemItem += res.pedidos_excluidos_por_sem_item
          }),
        )
      }

      await Promise.all(promessas)

      const resultadoFinal: ExcluirResultado = {
        excluidos: totalPedidosExcluidos,
        itens_excluidos: totalItensExcluidos,
        pedidos_excluidos_por_sem_item: totalPedidosSemItem,
      }

      setConfirmando(false)
      setFeedbackBotao('sucesso')

      // Notificação consolidada
      const partes: string[] = []
      if (totalPedidosExcluidos > 0) {
        partes.push(t('pedido.excluir.notif_pedidos_excluidos', { count: totalPedidosExcluidos }))
      }
      if (totalItensExcluidos > 0) {
        partes.push(t('pedido.excluir.notif_itens_excluidos', { count: totalItensExcluidos }))
      }
      addNotification({
        type: 'success',
        message: partes.length > 0 ? `${partes.join('. ')}.` : t('pedido.excluir.notif_concluida'),
        duration: 4000,
      })

      setTimeout(() => {
        setFeedbackBotao(null)
        setResultado(resultadoFinal)
      }, 1200)
      return
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('pedido.excluir.erro_excluir')
      setConfirmando(false)
      setFeedbackBotao('erro')
      setErro(msg)
      addNotification({ type: 'error', message: t('pedido.excluir.notif_falha', { msg }), duration: 4000 })

      setTimeout(() => { setFeedbackBotao(null) }, 1500)
      return
    }
  }, [podeExcluir, preview, totalPermitidos, itensAgrupados, addNotification, t])

  // ── Tela de resultado ──────────────────────────────────────────────────────
  if (resultado) {
    const temPedidosExcluidos = resultado.excluidos > 0
    const temItensExcluidosResult = resultado.itens_excluidos > 0
    return (
      <div className="modal-excluir__overlay" role="dialog" aria-modal="true" aria-label={t('pedido.excluir.aria_concluida')}>
        <div className="modal-excluir__container">
          <div className="modal-excluir__header">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trash size={20} weight="duotone" style={{ color: 'var(--ws-accent, #818cf8)', flexShrink: 0 }} />
                <h2 className="modal-excluir__titulo">{t('pedido.excluir.titulo_concluida')}</h2>
              </div>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4 }}>{t('pedido.excluir.subtitulo_concluida')}</p>
            </div>
            <button className="modal-excluir__fechar" onClick={onConcluido} aria-label={t('comum.fechar')}>
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="modal-excluir__body">
            {temPedidosExcluidos && (
              <div className="modal-excluir__resultado-sucesso">
                <CheckCircle size={20} weight="fill" className="modal-excluir__icone-sucesso" aria-hidden="true" />
                <p className="modal-excluir__resultado-texto">
                  {t('pedido.excluir.resultado_pedidos', { count: resultado.excluidos })}
                </p>
              </div>
            )}
            {temItensExcluidosResult && (
              <div className="modal-excluir__resultado-sucesso">
                <CheckCircle size={20} weight="fill" className="modal-excluir__icone-sucesso" aria-hidden="true" />
                <p className="modal-excluir__resultado-texto">
                  {t('pedido.excluir.resultado_itens', { count: resultado.itens_excluidos })}
                </p>
              </div>
            )}
            {resultado.pedidos_excluidos_por_sem_item > 0 && (
              <p className="modal-excluir__resultado-detalhe">
                {t('pedido.excluir.resultado_sem_item', { count: resultado.pedidos_excluidos_por_sem_item })}
              </p>
            )}
          </div>

          <div className="modal-excluir__footer">
            <BotaoGlobal variante="primario" onClick={onConcluido}>
              {t('comum.fechar')}
            </BotaoGlobal>
          </div>
        </div>
      </div>
    )
  }

  // ── Título dinâmico ────────────────────────────────────────────────────────
  // Totaliza itens dos pedidos (via preview) + itens avulsos para mostrar o
  // número real de itens que serão excluídos — não apenas os avulsos.
  const totalItensPedidos = preview?.permitidos.reduce((acc, p) => acc + p.total_itens, 0) ?? 0
  const totalItensGeral = totalItensPedidos + itensAvulsos.length

  const tituloPartes: string[] = []
  if (pedidos.length > 0) {
    tituloPartes.push(t('pedido.excluir.contagem_pedidos', { count: pedidos.length }))
  }
  if (totalItensGeral > 0) {
    tituloPartes.push(t('pedido.excluir.contagem_itens', { count: totalItensGeral }))
  } else if (itensAvulsos.length > 0) {
    tituloPartes.push(t('pedido.excluir.contagem_itens', { count: itensAvulsos.length }))
  }
  const tituloContagem = tituloPartes.join(t('pedido.excluir.contagem_separador'))

  // ── Tela de confirmação ────────────────────────────────────────────────────
  return (
    <div className="modal-excluir__overlay" role="dialog" aria-modal="true" aria-label={t('pedido.excluir.aria_modal')}>
      <div className="modal-excluir__container">
        <div className="modal-excluir__header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trash size={20} weight="duotone" style={{ color: 'var(--ws-accent, #818cf8)', flexShrink: 0 }} />
              <h2 className="modal-excluir__titulo">
                {t('pedido.excluir.titulo', { contagem: tituloContagem })}
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4 }}>{t('pedido.excluir.subtitulo')}</p>
          </div>
          <button
            className="modal-excluir__fechar"
            onClick={onFechar}
            disabled={confirmando}
            aria-label={t('comum.fechar')}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="modal-excluir__body">
          {carregando && (
            <div className="modal-excluir__carregando" aria-live="polite">
              <Spinner size={24} className="modal-excluir__spinner" aria-hidden="true" />
              <span>{t('pedido.excluir.verificando')}</span>
            </div>
          )}

          {erro && !carregando && (
            <div className="modal-excluir__erro" role="alert">
              {erro}
            </div>
          )}

          {!carregando && (
            <>
              {/* Aviso destrutivo */}
              <div className="modal-excluir__aviso">
                <Warning size={20} weight="fill" className="modal-excluir__aviso-icone" aria-hidden="true" />
                <p className="modal-excluir__aviso-texto">
                  <strong>{t('pedido.excluir.aviso_irreversivel')}</strong>{' '}
                  {temPedidos && temItensAvulsos
                    ? t('pedido.excluir.aviso_misto')
                    : temPedidos
                      ? t('pedido.excluir.aviso_pedidos')
                      : t('pedido.excluir.aviso_itens')}
                </p>
              </div>

              {/* ── Seção Pedidos (preview) ── */}
              {temPedidos && preview && (
                <>
                  {/* Permitidos */}
                  {totalPermitidos > 0 && (
                    <div>
                      <p className="modal-excluir__secao-titulo">
                        {t('pedido.excluir.secao_permitidos', { count: totalPermitidos })}
                      </p>

                      {/* Aviso de transferências vinculadas */}
                      {preview.permitidos.some(p => (p.total_transferencias ?? 0) > 0) && (
                        <div className="modal-excluir__aviso" style={{ marginBottom: '0.75rem' }}>
                          <Warning size={18} weight="fill" className="modal-excluir__aviso-icone" aria-hidden="true" />
                          <p className="modal-excluir__aviso-texto">
                            {(() => {
                              const comTransf = preview.permitidos.filter(p => (p.total_transferencias ?? 0) > 0)
                              const totalTransf = comTransf.reduce((acc, p) => acc + (p.total_transferencias ?? 0), 0)
                              return comTransf.length === 1
                                ? t('pedido.excluir.aviso_transf_um', { numero: comTransf[0].numero_pedido, count: totalTransf })
                                : t('pedido.excluir.aviso_transf_varios', { pedidos: comTransf.length, count: totalTransf })
                            })()}
                          </p>
                        </div>
                      )}

                      <table className="modal-excluir__tabela" aria-label={t('pedido.excluir.tabela_pedidos_aria')}>
                        <thead>
                          <tr>
                            <th className="modal-excluir__th">{t('pedido.excluir.col_numero')}</th>
                            <th className="modal-excluir__th">{t('pedido.excluir.col_itens')}</th>
                            <th className="modal-excluir__th">{t('pedido.excluir.col_transferencias')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {preview.permitidos.map(p => (
                            <tr key={p.id} className="modal-excluir__linha">
                              <td className="modal-excluir__td modal-excluir__td--numero">{p.numero_pedido || p.id}</td>
                              <td className="modal-excluir__td modal-excluir__td--itens">
                                {t('pedido.excluir.celula_itens', { count: p.total_itens })}
                              </td>
                              <td className="modal-excluir__td modal-excluir__td--itens">
                                {(p.total_transferencias ?? 0) > 0 ? t('pedido.excluir.celula_registros', { count: p.total_transferencias ?? 0 }) : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Bloqueados */}
                  {totalBloqueados > 0 && (
                    <div>
                      <p className="modal-excluir__secao-titulo">
                        {t('pedido.excluir.secao_bloqueados', { count: totalBloqueados })}
                      </p>
                      <ul className="modal-excluir__bloqueados">
                        {preview.bloqueados.map(b => (
                          <li key={b.id} className="modal-excluir__item-bloqueado">
                            <span className="modal-excluir__item-bloqueado-numero">{b.numero_pedido || b.id}</span>
                            <span className="modal-excluir__item-bloqueado-motivo">{b.motivo}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {totalPermitidos === 0 && totalBloqueados > 0 && !temItensAvulsos && (
                    <div className="modal-excluir__erro" role="alert">
                      {t('pedido.excluir.erro_nenhum_permitido')}
                    </div>
                  )}

                  {totalPermitidos === 0 && totalBloqueados === 0 && !temItensAvulsos && (
                    <div className="modal-excluir__erro" role="alert">
                      {t('pedido.excluir.erro_sem_dados')}
                    </div>
                  )}
                </>
              )}

              {/* ── Seção Itens avulsos ── */}
              {temItensAvulsos && (
                <div>
                  <p className="modal-excluir__secao-titulo">
                    {t('pedido.excluir.secao_itens', { count: itensAvulsos.length })}
                  </p>
                  <table className="modal-excluir__tabela" aria-label={t('pedido.excluir.tabela_itens_aria')}>
                    <thead>
                      <tr>
                        <th className="modal-excluir__th">{t('pedido.excluir.col_num_pedido')}</th>
                        <th className="modal-excluir__th">{t('pedido.excluir.col_num_item')}</th>
                        <th className="modal-excluir__th">{t('pedido.excluir.col_descricao')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itensAvulsos.map(it => (
                        <tr key={it.id} className="modal-excluir__linha">
                          <td className="modal-excluir__td modal-excluir__td--numero">
                            {pedidosMapa?.get(it.pedido_id) ?? '—'}
                          </td>
                          <td className="modal-excluir__td modal-excluir__td--numero">
                            {it.sequencia_item ?? '—'}
                          </td>
                          <td className="modal-excluir__td modal-excluir__td--itens">
                            {it.descricao_item || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-excluir__footer">
          <BotaoGlobal variante="secundario" onClick={onFechar} disabled={confirmando || feedbackBotao !== null}>
            {t('comum.cancelar')}
          </BotaoGlobal>
          <BotaoGlobal
            variante="perigo"
            onClick={handleConfirmar}
            disabled={!podeExcluir}
            carregando={confirmando}
            textoCarregando={t('pedido.excluir.botao_excluindo')}
            resultadoAcao={feedbackBotao}
            icone={<Trash size={14} weight="bold" />}
          >
            {feedbackBotao === 'sucesso' ? t('pedido.excluir.botao_excluido') : feedbackBotao === 'erro' ? t('pedido.excluir.botao_falhou') : t('pedido.excluir.botao_excluir')}
          </BotaoGlobal>
        </div>
      </div>
    </div>
  )
}
