/**
 * ModalDuplicar.tsx — Modal de duplicação de pedidos E itens (modal único, misto)
 *
 * Aceita 3 cenários de seleção:
 *   • Só pedidos      → cria N pedidos novos com itens copiados (numero pedido vem do usuário)
 *   • Só itens        → duplica itens DENTRO do(s) pedido(s) pai(s), sem criar pedido novo
 *   • Misto           → ambos em paralelo (Promise.all dos 2 endpoints)
 *
 * Regras de ordenação (skill produtos-gravity/pedido):
 *   - Pedido novo  → primeira linha da Lista (garantido pelo orderBy data_criacao DESC do GET)
 *   - Item novo    → linha imediatamente abaixo do original (shift via renumeração 1..N)
 *
 * Aviso pré-confirmação: se algum item tem quantidade_pronta/transferida/cancelada > 0,
 * exibe alerta antes do botão Duplicar. Esses 3 campos são SEMPRE zerados no item duplicado
 * (regra de saldo: copiar execução real geraria saldo fantasma sem processo de embarque
 * correspondente).
 *
 * Aprovado por Coordenador + Líder Técnico em 2026-05-11.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Info, CheckCircle, Copy, Spinner, X, Warning, Files, Package } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { BannerRequisitosGlobal, type RequisitoSalvar } from '@nucleo/banner-requisitos-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { useShellStore } from '@gravity/shell'
import type { Pedido, PedidoItem, DuplicarPayload, DuplicarResultado } from '../shared/types'
import { pedidoDuplicarApi } from '../shared/api'

// ── Props ─────────────────────────────────────────────────────────────────────

interface ModalDuplicarPedidosProps {
  pedidos: Pedido[]
  /** Itens selecionados (em linhas expandidas de pedidos). Default vazio. */
  itens?: PedidoItem[]
  /** Lista COMPLETA de pedidos da página (não apenas os selecionados). Usado para
   *  resolver o número do pedido pai de cada item — necessário quando o usuário
   *  seleciona só itens sem marcar o pedido pai. Default = `pedidos`. */
  todosPedidos?: Pedido[]
  onFechar: () => void
  onConcluido: () => void
}

// ── Tipos internos ────────────────────────────────────────────────────────────

interface PreviewConfig {
  numero_auto: boolean
  copiar_datas: boolean
  status_inicial: string
}

interface PreviewPedido {
  id: string
  numero_pedido: string
  total_itens: number
}

interface ItensPorPedido {
  pedido_id: string
  pedido_numero: string
  itens: PedidoItem[]
}

// ── Componente principal ──────────────────────────────────────────────────────

export function ModalDuplicarPedidos({ pedidos, itens = [], todosPedidos, onFechar, onConcluido }: ModalDuplicarPedidosProps) {
  const { addNotification } = useShellStore()
  const { t } = useTranslation()
  const [config, setConfig] = useState<PreviewConfig | null>(null)
  const [previewPedidos, setPreviewPedidos] = useState<PreviewPedido[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [numeros, setNumeros] = useState<Record<string, string>>({})
  const [confirmando, setConfirmando] = useState(false)
  const [resultado, setResultado] = useState<{
    pedidos_criados: DuplicarResultado['criados']
    itens_criados: DuplicarResultado['criados']
    erros: DuplicarResultado['erros']
  } | null>(null)

  const temPedidos = pedidos.length > 0
  const ids = pedidos.map(p => p.id)

  // FILTRA DUPLICAÇÃO DUPLA (regra universal de sync pai↔filhos, 2026-05-11):
  // Quando o usuário marca o pai, o nucleo-global sincroniza marcando todos os
  // filhos visíveis no `itensSelecionados`. Mas o pai em `pedidos` já dispara
  // cascade no backend (cria pedido novo + todos os itens). Se mandássemos os
  // filhos também como `duplicarItens`, o item seria duplicado 2 vezes:
  //   • 1× no pedido original (via /duplicacoes/itens)
  //   • 1× no pedido novo (via cascade do /duplicacoes/confirmar)
  // Solução: excluir do array `itens` qualquer um cujo pai já está em `pedidos`.
  const idsPedidosSelecionados = useMemo(() => new Set(ids), [ids])
  const itensFiltrados = useMemo(
    () => itens.filter(it => !idsPedidosSelecionados.has(it.pedido_id)),
    [itens, idsPedidosSelecionados],
  )
  const temItens = itensFiltrados.length > 0

  // Lookup id → { seq, label } (item) ou { label } (pedido) para mostrar nome
  // humano-legível no resultado em vez do id técnico (`pedi_id_...`, CUID).
  // Separamos `seq` do `label` para o render colocar um badge visual na sequência.
  const labelPorId = useMemo(() => {
    const map = new Map<string, { seq: number | null; label: string }>()
    for (const p of pedidos) map.set(p.id, { seq: null, label: p.numero_pedido })
    for (const it of itensFiltrados) {
      map.set(it.id, {
        seq: it.sequencia_item ?? null,
        label: it.part_number || it.descricao_item || it.id,
      })
    }
    return map
  }, [pedidos, itensFiltrados])

  const labelOriginal = (originalId: string) =>
    labelPorId.get(originalId) ?? { seq: null, label: originalId }

  // Agrupar itens (já filtrados sem duplicação dupla) por pedido pai. 1 chamada
  // /duplicacoes/itens por pai. Lookup do número do pai: prioriza `todosPedidos`.
  const itensPorPedido = useMemo<ItensPorPedido[]>(() => {
    const fonteLookup = todosPedidos ?? pedidos
    const mapa = new Map<string, ItensPorPedido>()
    for (const it of itensFiltrados) {
      const pedidoId = it.pedido_id
      if (!mapa.has(pedidoId)) {
        const numeroPai = fonteLookup.find(p => p.id === pedidoId)?.numero_pedido ?? pedidoId
        mapa.set(pedidoId, { pedido_id: pedidoId, pedido_numero: numeroPai, itens: [] })
      }
      mapa.get(pedidoId)!.itens.push(it)
    }
    return Array.from(mapa.values())
  }, [itensFiltrados, pedidos, todosPedidos])

  // Detectar itens com quantidade de execução > 0 (vão ter campos zerados na duplicação).
  // Decimal vem como string no JSON do Prisma — Number(x) > 0 é safe contra string vazia.
  const itensComExecucao = useMemo(() => {
    return itensFiltrados.filter(it =>
      Number(it.quantidade_pronta_total_item_pedido) > 0
      || Number(it.quantidade_transferida_pedido) > 0
      || Number(it.quantidade_cancelada_pedido) > 0
    )
  }, [itensFiltrados])

  // Carregar preview de pedidos ao abrir (só se há pedidos selecionados)
  useEffect(() => {
    if (!temPedidos) {
      setCarregando(false)
      // Quando só há itens, ainda precisamos saber a config (numero_auto não importa aqui)
      // mas como temPedidos=false, não exibe tabela de pedidos — só vai chamar duplicarItens
      setConfig({ numero_auto: true, copiar_datas: false, status_inicial: 'copiar' })
      return
    }

    let cancelado = false
    setCarregando(true)
    setErro(null)

    pedidoDuplicarApi.preview(ids)
      .then(data => {
        if (cancelado) return
        setConfig(data.config)
        setPreviewPedidos(data.pedidos)
        const inicial: Record<string, string> = {}
        data.pedidos.forEach(p => { inicial[p.id] = '' })
        setNumeros(inicial)
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

  const handleNumeroChange = useCallback((pedidoId: string, valor: string) => {
    setNumeros(prev => ({ ...prev, [pedidoId]: valor }))
  }, [])

  // Pode duplicar:
  //   - Se há pedidos: todos precisam de número (quando não-auto)
  //   - Se há só itens: sempre OK
  const podeDuplicar = (() => {
    if (!temPedidos && temItens) return true
    if (!config) return false
    if (config.numero_auto) return true
    return previewPedidos.every(p => numeros[p.id]?.trim())
  })()

  // Requisitos para o BannerRequisitosGlobal — só lista os pedidos cuja
  // "número da cópia" ainda não foi preenchido. Quando config.numero_auto=true,
  // não há requisitos pendentes (backend gera o número).
  const requisitos: RequisitoSalvar[] = useMemo(() => {
    if (!config || config.numero_auto) return []
    return previewPedidos.map(p => ({
      chave: `numero_copia_${p.id}`,
      ok: Boolean(numeros[p.id]?.trim()),
      mensagem: t('pedido.modal_dup.req_numero_pendente', { pedido: p.numero_pedido }),
    }))
  }, [config, previewPedidos, numeros, t])

  const handleConfirmar = useCallback(async () => {
    setConfirmando(true)
    setErro(null)

    try {
      // Dispatch paralelo: pedidos (1 chamada) + itens (1 chamada por pedido pai)
      const promessasPedido: Promise<DuplicarResultado>[] = []
      const promessasItens: Promise<DuplicarResultado>[] = []

      if (temPedidos) {
        const payload: DuplicarPayload = {
          ids,
          numeros: config?.numero_auto ? undefined : numeros,
        }
        promessasPedido.push(pedidoDuplicarApi.confirmar(payload))
      }

      for (const grupo of itensPorPedido) {
        promessasItens.push(pedidoDuplicarApi.duplicarItens({
          pedido_id: grupo.pedido_id,
          item_ids: grupo.itens.map(i => i.id),
        }))
      }

      const [resPedidos, resItens] = await Promise.all([
        Promise.all(promessasPedido),
        Promise.all(promessasItens),
      ])

      const pedidos_criados = resPedidos.flatMap(r => r.criados)
      const itens_criados = resItens.flatMap(r => r.criados)
      const erros = [...resPedidos, ...resItens].flatMap(r => r.erros)

      setResultado({ pedidos_criados, itens_criados, erros })

      // Toast consolidado
      const nP = pedidos_criados.length
      const nI = itens_criados.length
      if (nP > 0 || nI > 0) {
        const labelI = nI === 1
          ? t('pedido.modal_dup.label_item_singular')
          : t('pedido.modal_dup.label_item_plural')
        const msg = t('pedido.modal_dup.toast_misto', {
          n_pedidos: nP,
          n_itens: nI,
          s_p: nP !== 1 ? 's' : '',
          label_i: labelI,
        })
        addNotification({ type: 'success', message: msg, duration: 4000 })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao duplicar'
      setErro(msg)
      addNotification({ type: 'error', message: `Falha ao duplicar: ${msg}`, duration: 4000 })
    } finally {
      setConfirmando(false)
    }
  }, [config, ids, itensPorPedido, numeros, temPedidos, addNotification, t])

  const labelStatus = (statusInicial: string) => {
    if (statusInicial === 'copiar') return t('pedido.modal_dup.status_copiado')
    const mapa: Record<string, string> = {
      rascunho: t('pedido.modal_dup.status_rascunho'),
      aberto: t('pedido.modal_dup.status_aberto'),
      transferencia: t('pedido.modal_dup.status_transferencia'),
      consolidado: t('pedido.modal_dup.status_consolidado'),
      cancelado: t('pedido.modal_dup.status_cancelado'),
    }
    return mapa[statusInicial] ?? statusInicial
  }

  // ── Tela de resultado ────────────────────────────────────────────────────────
  if (resultado) {
    const totalSucesso = resultado.pedidos_criados.length + resultado.itens_criados.length
    return (
      <div className="modal-duplicar__overlay" role="dialog" aria-modal="true" aria-label={t('pedido.modal_dup.aria_resultado')}>
        <div className="modal-duplicar__container">
          <div className="modal-duplicar__header">
            <h2 className="modal-duplicar__titulo">{t('pedido.modal_dup.titulo_resultado')}</h2>
            <button
              className="modal-duplicar__fechar"
              onClick={onFechar}
              aria-label={t('pedido.modal_dup.aria_fechar')}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="modal-duplicar__body">
            {totalSucesso > 0 && (
              <div className="modal-duplicar__resultado-sucesso">
                <CheckCircle size={20} weight="fill" className="modal-duplicar__icone-sucesso" aria-hidden="true" />
                <p className="modal-duplicar__resultado-texto">
                  {t('pedido.modal_dup.toast_misto', {
                    n_pedidos: resultado.pedidos_criados.length,
                    n_itens: resultado.itens_criados.length,
                    s_p: resultado.pedidos_criados.length !== 1 ? 's' : '',
                    label_i: resultado.itens_criados.length === 1
                      ? t('pedido.modal_dup.label_item_singular')
                      : t('pedido.modal_dup.label_item_plural'),
                  })}
                </p>
              </div>
            )}

            {resultado.pedidos_criados.length > 0 && (
              <>
                <h3 className="modal-duplicar__secao-titulo">
                  <Files size={14} weight="duotone" aria-hidden="true" className="modal-duplicar__secao-icone" />
                  {t('pedido.modal_dup.secao_pedidos_resultado')}
                </h3>
                <ul className="modal-duplicar__lista-resultado">
                  {resultado.pedidos_criados.map(c => {
                    const orig = labelOriginal(c.original_id)
                    return (
                      <li key={c.novo_id} className="modal-duplicar__item-resultado">
                        <span className="modal-duplicar__numero-original">{orig.label}</span>
                        <span className="modal-duplicar__seta" aria-hidden="true">→</span>
                        <span className="modal-duplicar__numero-novo">{c.numero_pedido}</span>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}

            {resultado.itens_criados.length > 0 && (
              <>
                <h3 className="modal-duplicar__secao-titulo">
                  <Package size={14} weight="duotone" aria-hidden="true" className="modal-duplicar__secao-icone" />
                  {t('pedido.modal_dup.secao_itens_resultado')}
                </h3>
                <ul className="modal-duplicar__lista-resultado">
                  {resultado.itens_criados.map(c => {
                    const orig = labelOriginal(c.original_id)
                    return (
                      <li key={c.novo_id} className="modal-duplicar__item-resultado">
                        {orig.seq != null && (
                          <span className="modal-duplicar__seq-badge" aria-label={`Sequência ${orig.seq}`}>#{orig.seq}</span>
                        )}
                        <span className="modal-duplicar__numero-original">{orig.label}</span>
                        <span className="modal-duplicar__seta" aria-hidden="true">→</span>
                        <span className="modal-duplicar__numero-novo">{t('pedido.modal_dup.copia_label')}</span>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}

            {resultado.erros.length > 0 && (
              <div className="modal-duplicar__resultado-erros">
                <p className="modal-duplicar__erros-titulo">
                  {t('pedido.modal_dup.erros_titulo', { count: resultado.erros.length, s: resultado.erros.length !== 1 ? 's' : '' })}
                </p>
                <ul className="modal-duplicar__lista-erros">
                  {resultado.erros.map(e => (
                    <li key={e.id} className="modal-duplicar__item-erro">
                      <strong>{e.id}:</strong> {e.motivo}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="modal-duplicar__footer">
            <BotaoGlobal variante="primario" onClick={onConcluido}>
              {t('pedido.modal_dup.fechar')}
            </BotaoGlobal>
          </div>
        </div>
      </div>
    )
  }

  // Helper: renderiza a lista de itens como chips individuais — até 4 inline,
  // resto vira "+N" com tooltip nativo (title) mostrando os restantes.
  // Cada chip = badge da sequência (#N) + part_number — separação visual clara,
  // sem "tudo junto" como o usuário reportou (2026-05-11).
  const MAX_INLINE_ITENS = 4
  const formatItemLabel = (it: PedidoItem): string => {
    const seq = it.sequencia_item != null ? `#${it.sequencia_item}` : ''
    const pn = it.part_number || it.descricao_item || it.id
    return seq ? `${seq} ${pn}` : pn
  }
  const renderListaItens = (itensDoPedido: PedidoItem[]): React.ReactNode => {
    const n = itensDoPedido.length
    if (n === 0) return <span className="modal-duplicar__itens-vazio">—</span>
    const inline = itensDoPedido.slice(0, MAX_INLINE_ITENS)
    const resto = itensDoPedido.slice(MAX_INLINE_ITENS)
    // TooltipGlobal usa portal + position fixed (zero flash, padrão do sistema).
    // Lista os itens restantes separados por vírgula — `descricao` aceita uma linha.
    const tooltipResto = resto.map(formatItemLabel).join(', ')
    return (
      <div className="modal-duplicar__itens-lista">
        <strong className="modal-duplicar__itens-count" aria-label={`${n} itens`}>{n}</strong>
        <div className="modal-duplicar__itens-chips">
          {inline.map(it => (
            <span key={it.id} className="modal-duplicar__item-chip">
              {it.sequencia_item != null && (
                <span className="modal-duplicar__item-chip-seq">#{it.sequencia_item}</span>
              )}
              <span className="modal-duplicar__item-chip-pn">
                {it.part_number || it.descricao_item || it.id}
              </span>
            </span>
          ))}
          {resto.length > 0 && (
            <TooltipGlobal
              titulo={t('pedido.modal_dup.itens_extras_titulo', { count: resto.length })}
              descricao={tooltipResto}
            >
              <span
                className="modal-duplicar__item-chip modal-duplicar__item-chip--mais"
                aria-label={`Mais ${resto.length} itens`}
              >
                +{resto.length}
              </span>
            </TooltipGlobal>
          )}
        </div>
      </div>
    )
  }

  // Helper: resolve label singular/plural de "item" no idioma atual.
  // PT: "item" / "itens" (irregular — não usa só sufixo "s").
  // EN: "item" / "items". ES: "ítem" / "ítems".
  // Substituiu o pattern antigo `item{{s_i}}` com s_i='ns' que gerava "itemns" (bug).
  const labelItemFor = (count: number): string =>
    count === 1
      ? t('pedido.modal_dup.label_item_singular')
      : t('pedido.modal_dup.label_item_plural')

  // Título dinâmico conforme a composição da seleção
  const tituloModal = (() => {
    if (temPedidos && temItens) {
      return t('pedido.modal_dup.titulo_misto', {
        n_p: pedidos.length, s_p: pedidos.length !== 1 ? 's' : '',
        n_i: itensFiltrados.length, label_i: labelItemFor(itensFiltrados.length),
      })
    }
    if (temItens && !temPedidos) {
      return t('pedido.modal_dup.titulo_itens', { count: itensFiltrados.length, label_i: labelItemFor(itensFiltrados.length) })
    }
    return t('pedido.modal_dup.titulo', { count: pedidos.length, s: pedidos.length !== 1 ? 's' : '' })
  })()

  // ── Tela principal ───────────────────────────────────────────────────────────
  return (
    <div className="modal-duplicar__overlay" role="dialog" aria-modal="true" aria-label={t('pedido.modal_dup.aria_duplicar_pedidos')}>
      <div className="modal-duplicar__container">
        <div className="modal-duplicar__header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Copy size={20} weight="duotone" style={{ color: 'var(--ws-accent, #818cf8)', flexShrink: 0 }} />
              <h2 className="modal-duplicar__titulo">{tituloModal}</h2>
            </div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4 }}>Crie cópias dos pedidos ou itens selecionados</p>
          </div>
          <button
            className="modal-duplicar__fechar"
            onClick={onFechar}
            aria-label={t('pedido.modal_dup.aria_fechar')}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="modal-duplicar__body">
          {carregando && (
            <div className="modal-duplicar__carregando" aria-live="polite">
              <Spinner size={24} className="modal-duplicar__spinner" aria-hidden="true" />
              <span>{t('pedido.modal_dup.carregando')}</span>
            </div>
          )}

          {erro && !carregando && (
            <div className="modal-duplicar__erro" role="alert">
              {erro}
            </div>
          )}

          {!carregando && config && (
            <>
              {/* Info datas/status — só faz sentido se há pedidos sendo criados */}
              {temPedidos && (
                <div className="modal-duplicar__info">
                  <Info size={16} weight="duotone" className="modal-duplicar__info-icone" aria-hidden="true" />
                  <div className="modal-duplicar__info-texto">
                    <span>
                      {t('pedido.modal_dup.info_datas')} <strong>{config.copiar_datas ? t('pedido.modal_dup.info_datas_copiadas') : t('pedido.modal_dup.info_datas_resetadas')}</strong>
                    </span>
                    <span>
                      {t('pedido.modal_dup.info_status')} <strong>{labelStatus(config.status_inicial)}</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Seção: Pedidos a criar */}
              {temPedidos && (
                <>
                  <h3 className="modal-duplicar__secao-titulo">
                    <Files size={14} weight="duotone" aria-hidden="true" className="modal-duplicar__secao-icone" />
                    {t('pedido.modal_dup.secao_pedidos')}
                  </h3>
                  <table className="modal-duplicar__tabela" aria-label={t('pedido.modal_dup.aria_tabela')}>
                    <colgroup>
                      <col className="modal-duplicar__col-numero" />
                      <col className="modal-duplicar__col-itens" />
                      <col className="modal-duplicar__col-acao" />
                    </colgroup>
                    <thead>
                      <tr>
                        <th className="modal-duplicar__th">{t('pedido.modal_dup.col_original')}</th>
                        <th className="modal-duplicar__th modal-duplicar__th--itens">{t('pedido.modal_dup.col_itens')}</th>
                        <th className="modal-duplicar__th">
                          {config.numero_auto
                            ? t('pedido.modal_dup.col_num_gerado')
                            : (
                              <>
                                {t('pedido.modal_dup.col_num_copia')}
                                <span className="modal-duplicar__obrigatorio-asterisco" aria-hidden="true"> *</span>
                              </>
                            )}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewPedidos.map(p => {
                        // Pegar itens completos do pedido (vem do array de pedidos selecionados)
                        const pedidoCompleto = pedidos.find(pd => pd.id === p.id)
                        const itensDoPedido = pedidoCompleto?.itens ?? []
                        const valorNumero = numeros[p.id] ?? ''
                        const numeroVazio = !valorNumero.trim()
                        return (
                          <tr key={p.id} className="modal-duplicar__linha">
                            <td className="modal-duplicar__td modal-duplicar__td--numero">
                              {p.numero_pedido}
                            </td>
                            <td className="modal-duplicar__td modal-duplicar__td--itens">
                              {renderListaItens(itensDoPedido)}
                            </td>
                            <td className="modal-duplicar__td">
                              {config.numero_auto ? (
                                <span className="modal-duplicar__numero-auto">
                                  {numeros[p.id] || '(gerado automaticamente)'}
                                  {' '}
                                  <span className="modal-duplicar__badge-auto">{t('pedido.modal_dup.num_auto_badge')}</span>
                                </span>
                              ) : (
                                // Padrão oficial Gravity: obrigatorio + vazio = borda vermelha automática.
                                // Sem label visível aqui (header da coluna já cumpre função do label).
                                <CampoGeralGlobal obrigatorio vazio={numeroVazio}>
                                  <input
                                    type="text"
                                    className="modal-duplicar__input"
                                    value={valorNumero}
                                    onChange={e => handleNumeroChange(p.id, e.target.value)}
                                    placeholder={t('pedido.modal_dup.num_placeholder')}
                                    aria-label={`Número da cópia do pedido ${p.numero_pedido}`}
                                    aria-required="true"
                                    aria-invalid={numeroVazio}
                                    maxLength={100}
                                  />
                                </CampoGeralGlobal>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </>
              )}

              {/* Seção: Itens a duplicar em pedidos existentes */}
              {temItens && (
                <>
                  <h3 className="modal-duplicar__secao-titulo">
                    <Package size={14} weight="duotone" aria-hidden="true" className="modal-duplicar__secao-icone" />
                    {t('pedido.modal_dup.secao_itens')}
                  </h3>
                  <table className="modal-duplicar__tabela">
                    <colgroup>
                      <col className="modal-duplicar__col-numero" />
                      <col className="modal-duplicar__col-itens" />
                      <col className="modal-duplicar__col-acao" />
                    </colgroup>
                    <thead>
                      <tr>
                        <th className="modal-duplicar__th">{t('pedido.modal_dup.col_original')}</th>
                        <th className="modal-duplicar__th modal-duplicar__th--itens">{t('pedido.modal_dup.col_itens')}</th>
                        <th className="modal-duplicar__th" aria-hidden="true"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {itensPorPedido.map(grupo => (
                        <tr key={grupo.pedido_id} className="modal-duplicar__linha">
                          <td className="modal-duplicar__td modal-duplicar__td--numero">
                            {grupo.pedido_numero}
                          </td>
                          <td className="modal-duplicar__td modal-duplicar__td--itens">
                            {renderListaItens(grupo.itens)}
                          </td>
                          <td className="modal-duplicar__td" aria-hidden="true"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* Aviso pré-confirmação: campos zerados em itens com execução > 0 */}
              {itensComExecucao.length > 0 && (
                <div className="modal-duplicar__aviso-zerados" role="alert">
                  <Warning size={18} weight="duotone" className="modal-duplicar__aviso-icone" aria-hidden="true" />
                  <div className="modal-duplicar__aviso-texto">
                    <strong>{t('pedido.modal_dup.aviso_zerados_titulo')}</strong>
                    <p>{t('pedido.modal_dup.aviso_zerados_campos')}</p>
                    <p className="modal-duplicar__aviso-motivo">{t('pedido.modal_dup.aviso_zerados_motivo')}</p>
                  </div>
                </div>
              )}

              {erro && (
                <div className="modal-duplicar__erro" role="alert">
                  {erro}
                </div>
              )}

              {/* Banner consolidado "Para avançar, ainda falta:" — pattern oficial
                  Gravity. Não renderiza nada quando todos os requisitos estão OK. */}
              <BannerRequisitosGlobal
                requisitos={requisitos}
                titulo={t('pedido.modal_dup.req_titulo')}
              />
            </>
          )}
        </div>

        <div className="modal-duplicar__footer">
          <BotaoGlobal variante="secundario" onClick={onFechar} disabled={confirmando}>
            {t('pedido.modal_dup.cancelar')}
          </BotaoGlobal>
          <BotaoGlobal
            variante="primario"
            onClick={handleConfirmar}
            disabled={!podeDuplicar || confirmando || carregando}
            carregando={confirmando}
          >
            {confirmando ? t('pedido.modal_dup.duplicando') : t('pedido.modal_dup.duplicar')}
          </BotaoGlobal>
        </div>
      </div>
    </div>
  )
}
