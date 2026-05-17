/**
 * ModalDuplicar.tsx — Modal de duplicação de pedidos E itens (wizard passo a passo)
 *
 * Passo 1 — Raio X: campos resetados + opções togglable
 * Passo 2 — Confirmar: tabela de pedidos/itens + números das cópias
 * Resultado — Tela de conclusão (stepper oculto)
 *
 * Aceita 3 cenários de seleção:
 *   • Só pedidos      → cria N pedidos novos com itens copiados
 *   • Só itens        → duplica itens DENTRO do(s) pedido(s) pai(s)
 *   • Misto           → ambos em paralelo (Promise.all dos 2 endpoints)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Info, CheckCircle, Copy, Warning, Files, Package, XCircle, Sliders } from '@phosphor-icons/react'
import { GravityLoader } from '@nucleo/gravity-loader-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import type { ResultadoAcao } from '@nucleo/botao-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { BannerRequisitosGlobal, type RequisitoSalvar } from '@nucleo/banner-requisitos-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { ModalPassoPassoGlobal, type PassoConfig } from '@nucleo/modal-passo-passo-global'
import { useShellStore } from '@gravity/shell'
import type { Pedido, PedidoItem, DuplicarPayload, DuplicarResultado, OpcoesDuplicacao } from '../shared/types'
import { pedidoDuplicarApi } from '../shared/api'

// ── Props ─────────────────────────────────────────────────────────────────────

interface ModalDuplicarPedidosProps {
  pedidos: Pedido[]
  itens?: PedidoItem[]
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

// ── Passos do wizard ──────────────────────────────────────────────────────────

const PASSOS: PassoConfig[] = [
  { id: 1, label: 'Configurar', icone: <Sliders size={16} weight="bold" /> },
  { id: 2, label: 'Confirmar', icone: <Copy size={16} weight="bold" /> },
]

// ── Componente principal ──────────────────────────────────────────────────────

export function ModalDuplicarPedidos({ pedidos, itens = [], todosPedidos, onFechar, onConcluido }: ModalDuplicarPedidosProps) {
  const { addNotification } = useShellStore()
  const { t } = useTranslation()

  // Wizard
  const [passoAtual, setPassoAtual] = useState(1)

  // Dados
  const [config, setConfig] = useState<PreviewConfig | null>(null)
  const [previewPedidos, setPreviewPedidos] = useState<PreviewPedido[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [numeros, setNumeros] = useState<Record<string, string>>({})
  const [confirmando, setConfirmando] = useState(false)
  const [feedbackBotao, setFeedbackBotao] = useState<ResultadoAcao>(null)
  const [opcoes, setOpcoes] = useState<OpcoesDuplicacao>({
    copiar_datas: true,
    copiar_valores_precos: true,
    copiar_referencias_externas: true,
    copiar_pesos_cubagem: true,
    copiar_descricoes_complementares: true,
  })
  const [resultado, setResultado] = useState<{
    pedidos_criados: DuplicarResultado['criados']
    itens_criados: DuplicarResultado['criados']
    erros: DuplicarResultado['erros']
  } | null>(null)

  const temPedidos = pedidos.length > 0
  const ids = pedidos.map(p => p.id)

  const idsPedidosSelecionados = useMemo(() => new Set(ids), [ids])
  const itensFiltrados = useMemo(
    () => itens.filter(it => !idsPedidosSelecionados.has(it.pedido_id)),
    [itens, idsPedidosSelecionados],
  )
  const temItens = itensFiltrados.length > 0

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

  const itensComExecucao = useMemo(() => {
    return itensFiltrados.filter(it =>
      Number(it.quantidade_pronta_total_item_pedido) > 0
      || Number(it.quantidade_transferida_pedido) > 0
      || Number(it.quantidade_cancelada_pedido) > 0
    )
  }, [itensFiltrados])

  // Carregar preview ao abrir
  useEffect(() => {
    if (!temPedidos) {
      setCarregando(false)
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

  const podeDuplicar = (() => {
    if (!temPedidos && temItens) return true
    if (!config) return false
    if (config.numero_auto) return true
    return previewPedidos.every(p => numeros[p.id]?.trim())
  })()

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
      const promessasPedido: Promise<DuplicarResultado>[] = []
      const promessasItens: Promise<DuplicarResultado>[] = []

      if (temPedidos) {
        const payload: DuplicarPayload = {
          ids,
          numeros: config?.numero_auto ? undefined : numeros,
          opcoes,
        }
        promessasPedido.push(pedidoDuplicarApi.confirmar(payload))
      }

      for (const grupo of itensPorPedido) {
        promessasItens.push(pedidoDuplicarApi.duplicarItens({
          pedido_id: grupo.pedido_id,
          item_ids: grupo.itens.map(i => i.id),
          opcoes,
        }))
      }

      const [resPedidos, resItens] = await Promise.all([
        Promise.all(promessasPedido),
        Promise.all(promessasItens),
      ])

      const pedidos_criados = resPedidos.flatMap(r => r.criados)
      const itens_criados = resItens.flatMap(r => r.criados)
      const erros = [...resPedidos, ...resItens].flatMap(r => r.erros)

      setConfirmando(false)
      setFeedbackBotao('sucesso')
      setResultado({ pedidos_criados, itens_criados, erros })

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

      await new Promise(r => setTimeout(r, 1200))
      setFeedbackBotao(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao duplicar'
      setConfirmando(false)
      setFeedbackBotao('erro')
      setErro(msg)
      addNotification({ type: 'error', message: `Falha ao duplicar: ${msg}`, duration: 4000 })
      setTimeout(() => { setFeedbackBotao(null) }, 1500)
    }
  }, [config, ids, itensPorPedido, numeros, opcoes, temPedidos, addNotification, t])

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

  const labelItemFor = (count: number): string =>
    count === 1
      ? t('pedido.modal_dup.label_item_singular')
      : t('pedido.modal_dup.label_item_plural')

  const tituloModal = (() => {
    if (pedidos.length > 0 && itens.length > 0) {
      return t('pedido.modal_dup.titulo_misto', {
        n_p: pedidos.length, s_p: pedidos.length !== 1 ? 's' : '',
        n_i: itens.length, label_i: labelItemFor(itens.length),
      })
    }
    if (itens.length > 0 && pedidos.length === 0) {
      return t('pedido.modal_dup.titulo_itens', { count: itens.length, label_i: labelItemFor(itens.length) })
    }
    return t('pedido.modal_dup.titulo', { count: pedidos.length, s: pedidos.length !== 1 ? 's' : '' })
  })()

  // ── Wizard navigation ────────────────────────────────────────────────────────

  const handleProximo = useCallback(() => {
    if (passoAtual === 1) {
      setPassoAtual(2)
    } else if (passoAtual === 2) {
      handleConfirmar()
    }
  }, [passoAtual, handleConfirmar])

  const handleVoltar = useCallback(() => {
    if (passoAtual === 2) setPassoAtual(1)
  }, [passoAtual])

  const handleIrParaPasso = useCallback((id: number) => {
    setPassoAtual(id)
  }, [])

  const podeAvancar = (() => {
    if (carregando) return false
    if (passoAtual === 1) return !!config
    if (passoAtual === 2) return podeDuplicar && !confirmando
    return false
  })()

  // ── Helpers de render ────────────────────────────────────────────────────────

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
    const tooltipResto = resto.map(formatItemLabel).join(', ')
    return (
      <div className="modal-duplicar__itens-lista">
        <strong className="modal-duplicar__itens-count" aria-label={`${n} itens`}>{n}</strong>
        <div className="modal-duplicar__itens-chips">
          {inline.map(it => {
            const textoCompleto = it.part_number || it.descricao_item || it.id
            return (
              <TooltipGlobal key={it.id} descricao={textoCompleto}>
                <span className="modal-duplicar__item-chip">
                  {it.sequencia_item != null && (
                    <span className="modal-duplicar__item-chip-seq">#{it.sequencia_item}</span>
                  )}
                  <span className="modal-duplicar__item-chip-pn">
                    {textoCompleto}
                  </span>
                </span>
              </TooltipGlobal>
            )
          })}
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

  // ── Passo 1 — Raio X ────────────────────────────────────────────────────────

  const renderPasso1 = () => {
    if (carregando) {
      return (
        <div className="modal-duplicar__carregando" aria-live="polite">
          <GravityLoader texto={t('pedido.modal_dup.carregando')} tamanho="sm" />
        </div>
      )
    }

    if (erro && !config) {
      return <div className="modal-duplicar__erro" role="alert">{erro}</div>
    }

    return (
      <div className="modal-duplicar__raio-x">
        {/* 🔴 Sempre resetado */}
        <details className="modal-duplicar__raio-x-grupo modal-duplicar__raio-x-grupo--reset" open>
          <summary className="modal-duplicar__raio-x-summary">
            <XCircle size={14} weight="fill" className="modal-duplicar__raio-x-icone--reset" aria-hidden="true" />
            <span className="modal-duplicar__raio-x-label">{t('pedido.modal_dup.raio_x.reset_titulo')}</span>
          </summary>
          <div className="modal-duplicar__raio-x-listas">
            <div className="modal-duplicar__raio-x-coluna">
              <span className="modal-duplicar__raio-x-coluna-titulo">Pedido</span>
              <ul className="modal-duplicar__raio-x-campos">
                {t('pedido.modal_dup.raio_x.reset_pedido_campos').split(', ').map(campo => (
                  <li key={campo}>{campo}</li>
                ))}
              </ul>
            </div>
            <div className="modal-duplicar__raio-x-coluna">
              <span className="modal-duplicar__raio-x-coluna-titulo">Item</span>
              <ul className="modal-duplicar__raio-x-campos">
                {t('pedido.modal_dup.raio_x.reset_item_campos').split(', ').map(campo => (
                  <li key={campo}>{campo}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="modal-duplicar__raio-x-motivo">{t('pedido.modal_dup.raio_x.reset_motivo')}</p>
        </details>

        {/* 🟡 Opções togglable */}
        <div className="modal-duplicar__raio-x-grupo modal-duplicar__raio-x-grupo--opcoes">
          <div className="modal-duplicar__raio-x-summary">
            <Sliders size={14} weight="fill" className="modal-duplicar__raio-x-icone--opcoes" aria-hidden="true" />
            <span className="modal-duplicar__raio-x-label">{t('pedido.modal_dup.raio_x.opcoes_titulo')}</span>
          </div>
          <div className="modal-duplicar__raio-x-toggles">
            {([
              { chave: 'copiar_datas', label: t('pedido.modal_dup.raio_x.toggle_datas') },
              { chave: 'copiar_valores_precos', label: t('pedido.modal_dup.raio_x.toggle_valores') },
              { chave: 'copiar_referencias_externas', label: t('pedido.modal_dup.raio_x.toggle_referencias') },
              { chave: 'copiar_pesos_cubagem', label: t('pedido.modal_dup.raio_x.toggle_pesos') },
              { chave: 'copiar_descricoes_complementares', label: t('pedido.modal_dup.raio_x.toggle_descricoes') },
            ] as { chave: keyof OpcoesDuplicacao; label: string }[]).map(({ chave, label }) => (
              <label key={chave} className="modal-duplicar__raio-x-toggle">
                <input
                  type="checkbox"
                  className="modal-duplicar__raio-x-checkbox"
                  checked={opcoes[chave]}
                  onChange={() => setOpcoes(prev => ({ ...prev, [chave]: !prev[chave] }))}
                />
                <span className="modal-duplicar__raio-x-toggle-label">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Info status */}
        {temPedidos && config && (
          <div className="modal-duplicar__info">
            <Info size={16} weight="duotone" className="modal-duplicar__info-icone" aria-hidden="true" />
            <div className="modal-duplicar__info-texto">
              <span>
                {t('pedido.modal_dup.info_status')} <strong>{labelStatus(config.status_inicial)}</strong>
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Passo 2 — Confirmar ──────────────────────────────────────────────────────

  const renderPasso2 = () => (
    <>
      {/* Seção: Pedidos a criar */}
      {temPedidos && config && (
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
                const pedidoCompleto = pedidos.find(pd => pd.id === p.id)
                const itensDoPedido = pedidoCompleto?.itens ?? []
                const numeroOriginal = pedidoCompleto?.numero_pedido ?? p.numero_pedido
                const valorNumero = numeros[p.id] ?? ''
                const numeroVazio = !valorNumero.trim()
                return (
                  <tr key={p.id} className="modal-duplicar__linha">
                    <td className="modal-duplicar__td modal-duplicar__td--numero">
                      {numeroOriginal}
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

      {/* Aviso pré-confirmação */}
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
        <div className="modal-duplicar__erro" role="alert">{erro}</div>
      )}

      <BannerRequisitosGlobal
        requisitos={requisitos}
        titulo={t('pedido.modal_dup.req_titulo')}
      />
    </>
  )

  // ── Tela de resultado ────────────────────────────────────────────────────────

  const renderResultado = () => {
    if (!resultado) return null
    const totalSucesso = resultado.pedidos_criados.length + resultado.itens_criados.length
    return (
      <>
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
      </>
    )
  }

  // ── Footer custom para tela de resultado ─────────────────────────────────────

  const footerResultado = resultado ? (
    <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
      <BotaoGlobal variante="primario" onClick={onConcluido}>
        {t('pedido.modal_dup.fechar')}
      </BotaoGlobal>
    </div>
  ) : undefined

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <ModalPassoPassoGlobal
      titulo={tituloModal}
      icone={<Copy size={22} weight="duotone" />}
      subtitulo="Crie cópias dos pedidos ou itens selecionados"
      aberto={true}
      passos={PASSOS}
      passoAtual={passoAtual}
      onProximo={handleProximo}
      onVoltar={handleVoltar}
      onFechar={onFechar}
      podeAvancar={podeAvancar}
      labelBotaoFinal={t('pedido.modal_dup.duplicar')}
      labelProximo="Próximo"
      tamanho="lg"
      ocultarStepper={!!resultado}
      ocultarFooter={!!resultado}
      footerCustom={footerResultado}
      navegacaoDireta={true}
      onIrParaPasso={handleIrParaPasso}
    >
      {!resultado && passoAtual === 1 && renderPasso1()}
      {!resultado && passoAtual === 2 && renderPasso2()}
      {resultado && renderResultado()}
    </ModalPassoPassoGlobal>
  )
}
