/**
 * ModalPedidosExcluir.tsx — Modal de exclusão em lote de pedidos
 *
 * Substitui o `window.confirm()` nativo (fora do design system) por modal
 * customizado no padrão Solid Slate, espelhando ModalPedidosDuplicar.
 *
 * Fluxo:
 *   1. Carrega preview (permitidos + bloqueados) ao abrir
 *   2. Mostra aviso destrutivo + tabela de permitidos + lista de bloqueados (se houver)
 *   3. Botão "Excluir" (variante perigo) → chama pedidoExcluirApi.confirmar
 *   4. Tela de resultado: "N pedidos excluídos. M itens excluídos."
 *   5. Concluir → fecha + recarrega lista do pai
 */

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, Spinner, Warning, X } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { useShellStore } from '@gravity/shell'
import type { Pedido, ExcluirPreview, ExcluirResultado } from '../shared/types'
import { pedidoExcluirApi } from '../shared/api'
import './ModalPedidosExcluir.css'

// ── Props ─────────────────────────────────────────────────────────────────────

interface ModalPedidosExcluirProps {
  pedidos: Pedido[]
  onFechar: () => void
  onConcluido: () => void
}

// ── Componente ────────────────────────────────────────────────────────────────

export function ModalPedidosExcluir({ pedidos, onFechar, onConcluido }: ModalPedidosExcluirProps) {
  const { addNotification } = useShellStore()
  const [preview, setPreview] = useState<ExcluirPreview | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [confirmando, setConfirmando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [resultado, setResultado] = useState<ExcluirResultado | null>(null)

  const ids = pedidos.map(p => p.id)

  // Carregar preview ao abrir
  useEffect(() => {
    let cancelado = false
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
  const podeExcluir = totalPermitidos > 0 && !carregando && !confirmando

  const handleConfirmar = useCallback(async () => {
    if (!preview || totalPermitidos === 0) return
    setConfirmando(true)
    setErro(null)

    try {
      const res = await pedidoExcluirApi.confirmar(preview.permitidos.map(p => p.id))
      setResultado(res)
      const sufixoPedido = res.excluidos === 1 ? '' : 's'
      addNotification({
        type: 'success',
        message: `${res.excluidos} pedido${sufixoPedido} excluído${sufixoPedido}.`,
        duration: 4000,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir pedidos'
      setErro(msg)
      addNotification({ type: 'error', message: `Falha ao excluir: ${msg}`, duration: 4000 })
    } finally {
      setConfirmando(false)
    }
  }, [preview, totalPermitidos, addNotification])

  // ── Tela de resultado ──────────────────────────────────────────────────────
  if (resultado) {
    const sufixoPedido = resultado.excluidos === 1 ? '' : 's'
    const sufixoItem = resultado.itens_excluidos === 1 ? '' : 's'
    return (
      <div className="modal-excluir__overlay" role="dialog" aria-modal="true" aria-label="Exclusão concluída">
        <div className="modal-excluir__container">
          <div className="modal-excluir__header">
            <h2 className="modal-excluir__titulo">Exclusão concluída</h2>
            <button className="modal-excluir__fechar" onClick={onConcluido} aria-label="Fechar">
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="modal-excluir__body">
            <div className="modal-excluir__resultado-sucesso">
              <CheckCircle size={20} weight="fill" className="modal-excluir__icone-sucesso" aria-hidden="true" />
              <p className="modal-excluir__resultado-texto">
                {resultado.excluidos} pedido{sufixoPedido} excluído{sufixoPedido} permanentemente.
              </p>
            </div>
            {resultado.itens_excluidos > 0 && (
              <p className="modal-excluir__resultado-detalhe">
                {resultado.itens_excluidos} item{sufixoItem} associado{sufixoItem} também foram removidos.
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

  // ── Tela de confirmação ────────────────────────────────────────────────────
  const sufixoTitulo = pedidos.length === 1 ? '' : 's'
  return (
    <div className="modal-excluir__overlay" role="dialog" aria-modal="true" aria-label="Excluir pedidos">
      <div className="modal-excluir__container">
        <div className="modal-excluir__header">
          <h2 className="modal-excluir__titulo">
            Excluir Pedido{sufixoTitulo} ({pedidos.length} selecionado{sufixoTitulo})
          </h2>
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

          {!carregando && preview && (
            <>
              {/* Aviso destrutivo */}
              <div className="modal-excluir__aviso">
                <Warning size={20} weight="fill" className="modal-excluir__aviso-icone" aria-hidden="true" />
                <p className="modal-excluir__aviso-texto">
                  <strong>Esta ação não pode ser desfeita.</strong> Os pedidos selecionados e seus itens serão removidos permanentemente.
                </p>
              </div>

              {/* Permitidos */}
              {totalPermitidos > 0 && (
                <div>
                  <p className="modal-excluir__secao-titulo">
                    {totalPermitidos === 1
                      ? '1 pedido será excluído'
                      : `${totalPermitidos} pedidos serão excluídos`}
                  </p>
                  <table className="modal-excluir__tabela" aria-label="Pedidos que serão excluídos">
                    <thead>
                      <tr>
                        <th className="modal-excluir__th">Número</th>
                        <th className="modal-excluir__th">Itens</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.permitidos.map(p => (
                        <tr key={p.id} className="modal-excluir__linha">
                          <td className="modal-excluir__td modal-excluir__td--numero">{p.numero_pedido}</td>
                          <td className="modal-excluir__td modal-excluir__td--itens">
                            {p.total_itens} {p.total_itens === 1 ? 'item' : 'itens'}
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
                        <span className="modal-excluir__item-bloqueado-numero">{b.numero_pedido}</span>
                        <span className="modal-excluir__item-bloqueado-motivo">{b.motivo}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {totalPermitidos === 0 && totalBloqueados > 0 && (
                <div className="modal-excluir__erro" role="alert">
                  Nenhum dos pedidos selecionados pode ser excluído com os status atuais.
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-excluir__footer">
          <BotaoGlobal variante="secundario" onClick={onFechar} disabled={confirmando}>
            Cancelar
          </BotaoGlobal>
          <BotaoGlobal
            variante="perigo"
            onClick={handleConfirmar}
            disabled={!podeExcluir}
            carregando={confirmando}
          >
            {confirmando ? 'Excluindo...' : 'Excluir'}
          </BotaoGlobal>
        </div>
      </div>
    </div>
  )
}
