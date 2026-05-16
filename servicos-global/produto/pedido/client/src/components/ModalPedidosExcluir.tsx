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
        setErro(err instanceof Error ? err.message : 'Erro ao carregar preview')
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
        const s = totalPedidosExcluidos === 1 ? '' : 's'
        partes.push(`${totalPedidosExcluidos} pedido${s} excluído${s}`)
      }
      if (totalItensExcluidos > 0) {
        const s = totalItensExcluidos === 1 ? '' : 's'
        partes.push(`${totalItensExcluidos} item${s} excluído${s}`)
      }
      addNotification({
        type: 'success',
        message: partes.length > 0 ? `${partes.join('. ')}.` : 'Exclusão concluída.',
        duration: 4000,
      })

      setTimeout(() => {
        setFeedbackBotao(null)
        setResultado(resultadoFinal)
      }, 1200)
      return
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir'
      setConfirmando(false)
      setFeedbackBotao('erro')
      setErro(msg)
      addNotification({ type: 'error', message: `Falha ao excluir: ${msg}`, duration: 4000 })

      setTimeout(() => { setFeedbackBotao(null) }, 1500)
      return
    }
  }, [podeExcluir, preview, totalPermitidos, itensAgrupados, addNotification])

  // ── Tela de resultado ──────────────────────────────────────────────────────
  if (resultado) {
    const temPedidosExcluidos = resultado.excluidos > 0
    const temItensExcluidosResult = resultado.itens_excluidos > 0
    return (
      <div className="modal-excluir__overlay" role="dialog" aria-modal="true" aria-label="Exclusão concluída">
        <div className="modal-excluir__container">
          <div className="modal-excluir__header">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trash size={20} weight="duotone" style={{ color: 'var(--ws-accent, #818cf8)', flexShrink: 0 }} />
                <h2 className="modal-excluir__titulo">Exclusão concluída</h2>
              </div>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4 }}>Resultado da operação de exclusão</p>
            </div>
            <button className="modal-excluir__fechar" onClick={onConcluido} aria-label="Fechar">
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="modal-excluir__body">
            {temPedidosExcluidos && (
              <div className="modal-excluir__resultado-sucesso">
                <CheckCircle size={20} weight="fill" className="modal-excluir__icone-sucesso" aria-hidden="true" />
                <p className="modal-excluir__resultado-texto">
                  {resultado.excluidos} pedido{resultado.excluidos === 1 ? '' : 's'} excluído{resultado.excluidos === 1 ? '' : 's'} permanentemente.
                </p>
              </div>
            )}
            {temItensExcluidosResult && (
              <div className="modal-excluir__resultado-sucesso">
                <CheckCircle size={20} weight="fill" className="modal-excluir__icone-sucesso" aria-hidden="true" />
                <p className="modal-excluir__resultado-texto">
                  {resultado.itens_excluidos} item{resultado.itens_excluidos === 1 ? '' : 's'} excluído{resultado.itens_excluidos === 1 ? '' : 's'} permanentemente.
                </p>
              </div>
            )}
            {resultado.pedidos_excluidos_por_sem_item > 0 && (
              <p className="modal-excluir__resultado-detalhe">
                {resultado.pedidos_excluidos_por_sem_item} pedido{resultado.pedidos_excluidos_por_sem_item === 1 ? '' : 's'} excluído{resultado.pedidos_excluidos_por_sem_item === 1 ? '' : 's'} automaticamente por ficar{resultado.pedidos_excluidos_por_sem_item === 1 ? '' : 'em'} sem itens.
              </p>
            )}
          </div>

          <div className="modal-excluir__footer">
            <BotaoGlobal variante="primario" onClick={onConcluido}>
              Fechar
            </BotaoGlobal>
          </div>
        </div>
      </div>
    )
  }

  // ── Título dinâmico ────────────────────────────────────────────────────────
  const tituloPartes: string[] = []
  if (pedidos.length > 0) {
    tituloPartes.push(`${pedidos.length} pedido${pedidos.length === 1 ? '' : 's'}`)
  }
  if (itensAvulsos.length > 0) {
    tituloPartes.push(`${itensAvulsos.length} item${itensAvulsos.length === 1 ? '' : 's'}`)
  }
  const tituloContagem = tituloPartes.join(' e ')

  // ── Tela de confirmação ────────────────────────────────────────────────────
  return (
    <div className="modal-excluir__overlay" role="dialog" aria-modal="true" aria-label="Excluir pedidos e itens">
      <div className="modal-excluir__container">
        <div className="modal-excluir__header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trash size={20} weight="duotone" style={{ color: 'var(--ws-accent, #818cf8)', flexShrink: 0 }} />
              <h2 className="modal-excluir__titulo">
                Excluir ({tituloContagem})
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4 }}>Esta ação é permanente e não pode ser desfeita</p>
          </div>
          <button
            className="modal-excluir__fechar"
            onClick={onFechar}
            disabled={confirmando}
            aria-label="Fechar"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="modal-excluir__body">
          {carregando && (
            <div className="modal-excluir__carregando" aria-live="polite">
              <Spinner size={24} className="modal-excluir__spinner" aria-hidden="true" />
              <span>Verificando pedidos...</span>
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
                  <strong>Esta ação não pode ser desfeita.</strong>{' '}
                  {temPedidos && temItensAvulsos
                    ? 'Os pedidos selecionados (e seus itens) e os itens avulsos serão removidos permanentemente.'
                    : temPedidos
                      ? 'Os pedidos selecionados e seus itens serão removidos permanentemente.'
                      : 'Os itens selecionados serão removidos permanentemente.'}
                </p>
              </div>

              {/* ── Seção Pedidos (preview) ── */}
              {temPedidos && preview && (
                <>
                  {/* Permitidos */}
                  {totalPermitidos > 0 && (
                    <div>
                      <p className="modal-excluir__secao-titulo">
                        {totalPermitidos === 1
                          ? '1 pedido será excluído'
                          : `${totalPermitidos} pedidos serão excluídos`}
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
                                ? `O pedido "${comTransf[0].numero_pedido}" possui ${totalTransf} registro${totalTransf === 1 ? '' : 's'} de transferência que também ${totalTransf === 1 ? 'será excluído' : 'serão excluídos'}.`
                                : `${comTransf.length} pedidos possuem ${totalTransf} registro${totalTransf === 1 ? '' : 's'} de transferência que também ${totalTransf === 1 ? 'será excluído' : 'serão excluídos'}.`
                            })()}
                          </p>
                        </div>
                      )}

                      <table className="modal-excluir__tabela" aria-label="Pedidos que serão excluídos">
                        <thead>
                          <tr>
                            <th className="modal-excluir__th">Número</th>
                            <th className="modal-excluir__th">Itens</th>
                            <th className="modal-excluir__th">Transferências</th>
                          </tr>
                        </thead>
                        <tbody>
                          {preview.permitidos.map(p => (
                            <tr key={p.id} className="modal-excluir__linha">
                              <td className="modal-excluir__td modal-excluir__td--numero">{p.numero_pedido || p.id}</td>
                              <td className="modal-excluir__td modal-excluir__td--itens">
                                {p.total_itens} {p.total_itens === 1 ? 'item' : 'itens'}
                              </td>
                              <td className="modal-excluir__td modal-excluir__td--itens">
                                {(p.total_transferencias ?? 0) > 0 ? `${p.total_transferencias} registro${(p.total_transferencias ?? 0) === 1 ? '' : 's'}` : '—'}
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
                        {totalBloqueados === 1
                          ? '1 pedido bloqueado (status não permite exclusão)'
                          : `${totalBloqueados} pedidos bloqueados (status não permite exclusão)`}
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
                      Nenhum dos pedidos selecionados pode ser excluído com os status atuais.
                    </div>
                  )}

                  {totalPermitidos === 0 && totalBloqueados === 0 && !temItensAvulsos && (
                    <div className="modal-excluir__erro" role="alert">
                      Não foi possível carregar os dados dos pedidos selecionados. Tente novamente ou verifique se o servidor está acessível.
                    </div>
                  )}
                </>
              )}

              {/* ── Seção Itens avulsos ── */}
              {temItensAvulsos && (
                <div>
                  <p className="modal-excluir__secao-titulo">
                    {itensAvulsos.length === 1
                      ? '1 item será excluído'
                      : `${itensAvulsos.length} itens serão excluídos`}
                  </p>
                  <table className="modal-excluir__tabela" aria-label="Itens que serão excluídos">
                    <thead>
                      <tr>
                        <th className="modal-excluir__th">Nº Pedido</th>
                        <th className="modal-excluir__th">Nº Item</th>
                        <th className="modal-excluir__th">Descrição</th>
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
            Cancelar
          </BotaoGlobal>
          <BotaoGlobal
            variante="perigo"
            onClick={handleConfirmar}
            disabled={!podeExcluir}
            carregando={confirmando}
            textoCarregando="Excluindo..."
            resultadoAcao={feedbackBotao}
            icone={<Trash size={14} weight="bold" />}
          >
            {feedbackBotao === 'sucesso' ? 'Excluído' : feedbackBotao === 'erro' ? 'Falhou' : 'Excluir'}
          </BotaoGlobal>
        </div>
      </div>
    </div>
  )
}
