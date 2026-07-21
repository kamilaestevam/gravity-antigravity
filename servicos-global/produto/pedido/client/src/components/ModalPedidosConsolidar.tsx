/**
 * ModalConsolidar.tsx — Modal de consolidação de pedidos (multi-step)
 *
 * Fluxo em 3 passos:
 *   Passo 1 — Resumo: preview geral (nº pedido, estatísticas, opções)
 *   Passo 2 — Comparação: DE/PARA por grupo com badges Origens
 *   Passo 3 — Resultado: confirmação final ou sucesso
 *
 * Regras de negócio:
 *   - Campos divergentes exibem badge laranja "N origens" com tooltip
 *   - Campos iguais exibem badge verde "igual"
 *   - Grupos colapsáveis por categoria (Comercial, Exportador, etc.)
 *   - Conflito tipo_operacao bloqueia consolidação
 *   - Fundir itens com mesmo part_number: toggle opcional
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  GitMerge, Warning, CheckCircle, WarningDiamond,
  CaretDown, CaretRight, Package, ListChecks, Check, Info,
  Stack, MinusCircle, CubeTransparent,
} from '@phosphor-icons/react'
import { GravityLoader } from '@nucleo/gravity-loader-global'
import { ModalPassoPassoGlobal } from '@nucleo/modal-passo-passo-global'
import type { PassoConfig } from '@nucleo/modal-passo-passo-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { useShellStore } from '@gravity/shell'
import type { Pedido, PedidoItem, ConsolidacaoPreview, ConsolidacaoPayload, CampoDivergente, CampoIgual } from '../shared/types'
import { pedidoConsolidarApi } from '../shared/api'
import { fmtMoeda } from '../shared/types'

// ── Props ─────────────────────────────────────────────────────────────────────

interface ModalConsolidarPedidosProps {
  pedidosSelecionados: Pedido[]
  /** Itens selecionados individualmente (filhos) — seus pedidos-pai contam como "parcial" */
  itensSelecionados?: PedidoItem[]
  onFechar: () => void
  onConcluido: () => void
  conflito_tipo_operacao?: boolean
}

// ── Passos (rótulos via i18n no componente principal) ─────────────────────────

// ── Helpers ───────────────────────────────────────────────────────────────────

interface GrupoCampos {
  grupo: string
  divergentes: CampoDivergente[]
  iguais: CampoIgual[]
}

function agruparCampos(divergentes: CampoDivergente[], iguais: CampoIgual[]): GrupoCampos[] {
  const mapa = new Map<string, GrupoCampos>()

  for (const d of divergentes) {
    const g = mapa.get(d.grupo) ?? { grupo: d.grupo, divergentes: [], iguais: [] }
    g.divergentes.push(d)
    mapa.set(d.grupo, g)
  }
  for (const i of iguais) {
    const g = mapa.get(i.grupo) ?? { grupo: i.grupo, divergentes: [], iguais: [] }
    g.iguais.push(i)
    mapa.set(i.grupo, g)
  }

  return Array.from(mapa.values())
}

function fmtValor(valor: string | number | null): string {
  if (valor == null || valor === '') return '—'
  if (typeof valor === 'string' && valor.match(/^\d{4}-\d{2}-\d{2}/)) {
    const d = new Date(valor)
    if (!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR')
  }
  return String(valor)
}

// ── Sub-componente: Grupo colapsável ─────────────────────────────────────────

interface GrupoColapsavelProps {
  grupo: GrupoCampos
  camposEscolhidos: Record<string, string | number | null>
  onMudarCampo: (campo: string, valor: string | number | null) => void
  inicialmenteAberto?: boolean
}

function GrupoColapsavel({ grupo, camposEscolhidos, onMudarCampo, inicialmenteAberto = false }: GrupoColapsavelProps) {
  const { t } = useTranslation()
  const [aberto, setAberto] = useState(inicialmenteAberto)
  const totalDivergentes = grupo.divergentes.length
  const iguaisComDado = grupo.iguais.filter(c => c.valor != null && c.valor !== '')
  const iguaisVazios = grupo.iguais.filter(c => c.valor == null || c.valor === '')
  const totalComDado = totalDivergentes + iguaisComDado.length
  const total = totalDivergentes + grupo.iguais.length

  return (
    <div style={estilos.grupo}>
      <button
        type="button"
        style={estilos.grupoHeader}
        onClick={() => setAberto(v => !v)}
        aria-expanded={aberto}
      >
        <span style={estilos.grupoHeaderLeft}>
          {aberto ? <CaretDown size={14} weight="bold" /> : <CaretRight size={14} weight="bold" />}
          <span style={estilos.grupoNome}>{grupo.grupo}</span>
          <span style={estilos.grupoContador}>{t('pedido.modal_cons.grupo_campos', { count: total })}</span>
        </span>
        <span style={estilos.grupoHeaderRight}>
          {totalDivergentes > 0 && (
            <span style={estilos.badgeDivergenciaPequeno}>
              <Warning size={12} weight="fill" />
              {totalDivergentes}
            </span>
          )}
          {iguaisComDado.length > 0 && (
            <span style={estilos.badgeIgualPequeno}>
              <CheckCircle size={12} weight="fill" />
              {iguaisComDado.length}
            </span>
          )}
          {iguaisVazios.length > 0 && (
            <span style={estilos.badgeVazioPequeno}>
              <MinusCircle size={12} weight="fill" />
              {iguaisVazios.length}
            </span>
          )}
        </span>
      </button>

      {aberto && (
        <div style={estilos.grupoCorpo}>
          {/* 1. Divergentes — precisam de ação */}
          {grupo.divergentes.map(campo => (
            <LinhaCampoComparacao
              key={campo.campo}
              campo={campo}
              tipo="divergente"
              valorEscolhido={camposEscolhidos[campo.campo] ?? campo.valor_sugerido}
              onMudar={v => onMudarCampo(campo.campo, v)}
            />
          ))}
          {/* 2. Iguais com dado — informativo, tem conteúdo */}
          {iguaisComDado.map(campo => (
            <LinhaCampoIgual key={campo.campo} campo={campo} />
          ))}
          {/* 3. Vazios por último — menos relevantes */}
          {iguaisVazios.map(campo => (
            <LinhaCampoIgual key={campo.campo} campo={campo} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Sub-componente: Linha campo divergente ────────────────────────────────────

interface LinhaCampoComparacaoProps {
  campo: CampoDivergente
  tipo: 'divergente'
  valorEscolhido: string | number | null
  onMudar: (valor: string | number | null) => void
}

function LinhaCampoComparacao({ campo, valorEscolhido, onMudar }: LinhaCampoComparacaoProps) {
  const { t } = useTranslation()
  const [tooltipVisivel, setTooltipVisivel] = useState(false)

  return (
    <div style={estilos.linhaComparacao}>
      <div style={estilos.linhaNome}>{campo.rotulo}</div>
      <div style={estilos.linhaSelect}>
        <SelectGlobal
          buscavel={false}
          tamanho="compacto"
          opcoes={campo.valores.map(v => ({
            valor: String(v.valor ?? ''),
            rotulo: `${fmtValor(v.valor)} (${v.numero_pedido})`,
          }))}
          valor={String(valorEscolhido ?? '')}
          aoMudarValor={v => {
            const opt = campo.valores.find(vl => String(vl.valor) === String(v))
            onMudar(opt?.valor ?? (v != null ? String(v) : null))
          }}
          aria-label={t('pedido.modal_cons.aria_valor_consolidado', { campo: campo.rotulo })}
        />
      </div>
      <div style={estilos.linhaOrigens}>
        <span
          style={estilos.badgeDivergencia}
          onMouseEnter={() => setTooltipVisivel(true)}
          onMouseLeave={() => setTooltipVisivel(false)}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setTooltipVisivel(v => !v) }}
        >
          <Warning size={13} weight="fill" />
          {t('pedido.modal_cons.badge_divergencia', { count: campo.valores.length })}
          {tooltipVisivel && (
            <span style={estilos.tooltip} role="tooltip">
              {campo.valores.map(v => (
                <span key={v.pedido_id} style={estilos.tooltipLinha}>
                  <strong>{v.numero_pedido}:</strong> {fmtValor(v.valor)}
                </span>
              ))}
            </span>
          )}
        </span>
      </div>
    </div>
  )
}

// ── Sub-componente: Linha campo igual ─────────────────────────────────────────

function LinhaCampoIgual({ campo }: { campo: CampoIgual }) {
  const { t } = useTranslation()
  const temDado = campo.valor != null && campo.valor !== ''
  return (
    <div style={{ ...estilos.linhaComparacao, ...(temDado ? {} : { opacity: 0.5 }) }}>
      <div style={estilos.linhaNome}>{campo.rotulo}</div>
      <div style={estilos.linhaValorIgual}>{fmtValor(campo.valor)}</div>
      <div style={estilos.linhaOrigens}>
        {temDado ? (
          <span style={estilos.badgeIgual}>
            <CheckCircle size={13} weight="fill" />
            {t('pedido.modal_cons.badge_igual')}
          </span>
        ) : (
          <span style={estilos.badgeVazio}>
            <MinusCircle size={13} weight="fill" />
            {t('pedido.modal_cons.badge_vazio')}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export function ModalConsolidarPedidos({
  pedidosSelecionados,
  itensSelecionados = [],
  onFechar,
  onConcluido,
  conflito_tipo_operacao: conflitoProp = false,
}: ModalConsolidarPedidosProps) {
  const { addNotification } = useShellStore()
  const { t } = useTranslation()

  const [passoAtual, setPassoAtual] = useState(1)
  const [preview, setPreview] = useState<ConsolidacaoPreview | null>(null)
  const [carregandoPreview, setCarregandoPreview] = useState(true)
  const [erroPreview, setErroPreview] = useState<string | null>(null)
  const [numeroPedido, setNumeroPedido] = useState('')
  const [camposEscolhidos, setCamposEscolhidos] = useState<Record<string, string | number | null>>({})
  const [fundirItens, setFundirItens] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [concluido, setConcluido] = useState(false)
  const [infograficoPopover, setInfograficoPopover] = useState<'ativas' | 'dados' | 'vazias' | null>(null)
  const [filtroCampos, setFiltroCampos] = useState<'todos' | 'divergentes' | 'iguais' | 'vazios'>('todos')
  const [filtroPedidoOrigem, setFiltroPedidoOrigem] = useState<string | null>(null)

  // IDs dos pedidos inteiros + pedidos-pai dos itens avulsos (parciais)
  const pedidoIdsInteiros = pedidosSelecionados.map(p => p.id)
  const pedidoIdsParciais = [...new Set(itensSelecionados.map(i => i.pedido_id))].filter(id => !pedidoIdsInteiros.includes(id))
  const ids = [...pedidoIdsInteiros, ...pedidoIdsParciais]
  const conflito_tipo_operacao = conflitoProp || (preview?.conflito_tipo_operacao ?? false)
  const totalPedidosConsolidar = pedidosSelecionados.length + pedidoIdsParciais.length

  const passos = useMemo<PassoConfig[]>(() => [
    { id: 1, label: t('pedido.modal_cons.passo_configurar') },
    { id: 2, label: t('pedido.modal_cons.passo_comparar') },
    { id: 3, label: t('pedido.modal_cons.passo_confirmar') },
  ], [t])

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
        const iniciais: Record<string, string | number | null> = {}
        for (const campo of data.campos_divergentes) {
          iniciais[campo.campo] = campo.valor_sugerido
        }
        setCamposEscolhidos(iniciais)
      })
      .catch((err: unknown) => {
        if (cancelado) return
        setErroPreview(err instanceof Error ? err.message : t('pedido.modal_cons.erro_preview'))
      })
      .finally(() => {
        if (!cancelado) setCarregandoPreview(false)
      })

    return () => { cancelado = true }
  }, [ids.join(','), t])

  const handleMudarCampo = useCallback((campo: string, valor: string | number | null) => {
    setCamposEscolhidos(prev => ({ ...prev, [campo]: valor }))
  }, [])

  const grupos = useMemo(() => {
    if (!preview) return []
    return agruparCampos(preview.campos_divergentes, preview.campos_iguais)
  }, [preview])

  const totalDivergencias = preview?.campos_divergentes.length ?? 0
  const totalIguais = preview?.campos_iguais.length ?? 0

  // ── Handlers de navegação ───────────────────────────────────────────────────

  const handleProximo = useCallback(async () => {
    if (passoAtual === 1) {
      setPassoAtual(2)
    } else if (passoAtual === 2) {
      setPassoAtual(3)
    } else if (passoAtual === 3) {
      // Executar consolidação
      if (!preview || !numeroPedido.trim()) return
      setSalvando(true)

      const payload: ConsolidacaoPayload = {
        ids,
        numero_pedido: numeroPedido.trim(),
        campos_escolhidos: camposEscolhidos,
        fundir_itens_mesmo_part_number: fundirItens,
      }

      try {
        await pedidoConsolidarApi.confirmar(payload)
        addNotification({ type: 'success', message: t('pedido.modal_cons.notificacao_sucesso', { count: ids.length, numero: numeroPedido.trim() }), duration: 4000 })
        setConcluido(true)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t('pedido.modal_cons.erro_consolidar')
        addNotification({ type: 'error', message: t('pedido.modal_cons.notificacao_falha', { msg }), duration: 4000 })
      } finally {
        setSalvando(false)
      }
    }
  }, [passoAtual, preview, numeroPedido, camposEscolhidos, fundirItens, ids, addNotification, t])

  const handleVoltar = useCallback(() => {
    if (passoAtual > 1) setPassoAtual(p => p - 1)
  }, [passoAtual])

  const podeAvancar = (() => {
    if (carregandoPreview || !!erroPreview || conflito_tipo_operacao) return false
    if (passoAtual === 1) return !!numeroPedido.trim()
    if (passoAtual === 3) return !salvando && !concluido
    return true
  })()

  // ── Render por passo ────────────────────────────────────────────────────────

  function renderPasso1() {
    if (carregandoPreview) {
      return (
        <div style={estilos.centrado}>
          <GravityLoader texto={t('pedido.modal_cons.carregando')} tamanho="sm" />
        </div>
      )
    }

    if (erroPreview) {
      return (
        <div style={estilos.erro}>
          <Warning size={16} weight="fill" />
          {erroPreview}
        </div>
      )
    }

    if (!preview) return null

    return (
      <div style={estilos.passo1}>
        {/* Banner conflito */}
        {conflito_tipo_operacao && (
          <div style={estilos.bannerConflito}>
            <WarningDiamond weight="duotone" size={18} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={estilos.bannerConflitotitulo}>{t('pedido.modal_cons.conflito_titulo')}</p>
              <p style={estilos.bannerConflitoMsg}>{t('pedido.modal_cons.conflito_msg')}</p>
            </div>
          </div>
        )}

        {/* ── Seção 1 — Configuração ── */}
        <div className="cons-secao">
          <span className="cons-secao-titulo">{t('pedido.modal_cons.secao_configuracao')}</span>

          {/* Número do pedido */}
          <CampoGeralGlobal
            label={t('pedido.modal_cons.numero_label')}
            obrigatorio
            vazio={!numeroPedido.trim()}
          >
            <input
              id="numero-pedido-cons"
              type="text"
              value={numeroPedido}
              onChange={e => setNumeroPedido(e.target.value)}
              placeholder={t('pedido.modal_cons.numero_placeholder')}
              aria-required="true"
              maxLength={100}
            />
          </CampoGeralGlobal>
          <span style={estilos.hintComIcone}>
            <Info size={14} weight="fill" style={{ flexShrink: 0, opacity: 0.6 }} />
            {t('pedido.modal_cons.numero_hint')}
          </span>

          {/* Fundir itens */}
          {preview.itens.some(i => i.pode_fundir) && (
            <label style={estilos.checkboxLabel}>
              <input
                type="checkbox"
                checked={fundirItens}
                onChange={e => setFundirItens(e.target.checked)}
                style={estilos.checkbox}
              />
              <span>{t('pedido.modal_cons.fundir_part_number')}</span>
            </label>
          )}
        </div>

        {/* ── Seção 2 — Preview ── */}
        <div className="cons-secao">
          <span className="cons-secao-titulo">{t('pedido.modal_cons.secao_preview')}</span>

          {/* Cards de estatísticas */}
          <style>{`[data-cons-stats] > .tg-trigger { display: flex; width: 100%; } [data-cons-stats] > .tg-trigger > div { width: 100%; } [data-cons-stats] > .tg-trigger:hover > div { border-color: rgba(99, 102, 241, 0.25) !important; box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15) !important; background: rgba(15, 23, 42, 0.65) !important; }`}</style>
          <div data-cons-stats style={estilos.statsGrid}>
            <TooltipGlobal
              titulo={t('pedido.modal_cons.tooltip_pedidos_selecionados')}
              descricao={
                <div style={estilos.tooltipRico}>
                  <span style={estilos.tooltipCategoria}>{t('pedido.modal_cons.tooltip_categoria_consolidacao')}</span>
                  <div style={estilos.tooltipLinha2}><span>{t('pedido.modal_cons.tooltip_selecionados')}</span><span style={estilos.tooltipValor2}>{ids.length}</span></div>
                  <div style={estilos.tooltipLinha2}><span>{t('pedido.modal_cons.tooltip_resultado')}</span><span style={estilos.tooltipValor2}>{t('pedido.modal_cons.tooltip_um_pedido')}</span></div>
                </div>
              }
            >
              <div style={{ ...estilos.statCard, borderTop: '2px solid rgba(148,163,184,0.3)' }}>
                <Package size={20} weight="duotone" style={{ color: '#94a3b8' }} />
                <div>
                  <span style={estilos.statValor}>{ids.length}</span>
                  <span style={estilos.statLabel}>{t('pedido.modal_cons.stat_pedidos')}</span>
                </div>
              </div>
            </TooltipGlobal>
            <TooltipGlobal
              titulo={t('pedido.modal_cons.tooltip_total_itens')}
              descricao={
                <div style={estilos.tooltipRico}>
                  <span style={estilos.tooltipCategoria}>{t('pedido.modal_cons.tooltip_categoria_itens')}</span>
                  <div style={estilos.tooltipLinha2}><span>{t('pedido.modal_cons.tooltip_total_agrupado')}</span><span style={estilos.tooltipValor2}>{preview.itens.length}</span></div>
                  <div style={estilos.tooltipLinha2}><span>{t('pedido.modal_cons.tooltip_de_pedidos')}</span><span style={estilos.tooltipValor2}>{ids.length}</span></div>
                  {preview.itens.some(i => i.pode_fundir) && (
                    <div style={estilos.tooltipLinha2}><span>{t('pedido.modal_cons.tooltip_fundiveis')}</span><span style={{ ...estilos.tooltipValor2, color: '#94a3b8' }}>{preview.itens.filter(i => i.pode_fundir).length}</span></div>
                  )}
                </div>
              }
            >
              <div style={{ ...estilos.statCard, borderTop: '2px solid rgba(148,163,184,0.3)' }}>
                <ListChecks size={20} weight="duotone" style={{ color: '#94a3b8' }} />
                <div>
                  <span style={estilos.statValor}>{preview.itens.length}</span>
                  <span style={estilos.statLabel}>{t('pedido.modal_cons.stat_itens')}</span>
                </div>
              </div>
            </TooltipGlobal>
            {/* Cards: Pedidos Inteiros + Pedidos Parciais */}
            {(() => {
              // Pedidos-pai dos itens selecionados individualmente → parciais
              const pedidoIdsParciais = new Set(itensSelecionados.map(i => i.pedido_id))
              // Contar itens selecionados por pedido parcial
              const itensCountPorPedido = new Map<string, number>()
              for (const item of itensSelecionados) {
                itensCountPorPedido.set(item.pedido_id, (itensCountPorPedido.get(item.pedido_id) ?? 0) + 1)
              }

              const inteiros: Array<{ numero: string; itens: number }> = []
              const parciais: Array<{ numero: string; itensSel: number; itensTotal: number }> = []

              // Pedidos selecionados inteiros (checkbox no pai)
              for (const p of pedidosSelecionados) {
                const info = preview.pedidos_info.find(pi => pi.id === p.id)
                const totalOriginal = info?.total_itens ?? p.itens.length
                inteiros.push({ numero: p.numero_pedido, itens: totalOriginal })
              }

              // Pedidos parciais: têm itens selecionados mas NÃO estão nos pedidosSelecionados
              const pedidosInteirosIds = new Set(pedidosSelecionados.map(p => p.id))
              for (const pedidoId of pedidoIdsParciais) {
                if (pedidosInteirosIds.has(pedidoId)) continue // já é inteiro
                const info = preview.pedidos_info.find(pi => pi.id === pedidoId)
                const itensSel = itensCountPorPedido.get(pedidoId) ?? 0
                const totalOriginal = info?.total_itens ?? itensSel
                const numero = info?.numero ?? t('pedido.modal_cons.pedido_fallback', { id: pedidoId.slice(0, 8) })
                parciais.push({ numero, itensSel, itensTotal: totalOriginal })
              }
              return (
                <>
                  {/* Card Pedidos Inteiros */}
                  <TooltipGlobal
                    titulo={t('pedido.modal_cons.tooltip_pedidos_inteiros')}
                    descricao={
                      <div style={estilos.tooltipRico}>
                        <span style={estilos.tooltipCategoria}>{t('pedido.modal_cons.tooltip_todos_itens_selecionados')}</span>
                        {inteiros.map(p => (
                          <div key={p.numero} style={estilos.tooltipLinha2}>
                            <span>{p.numero}</span>
                            <span style={estilos.tooltipValor2}>{t('pedido.modal_cons.item', { count: p.itens })}</span>
                          </div>
                        ))}
                        {inteiros.length === 0 && (
                          <div style={{ fontSize: '0.75rem', color: '#475569' }}>{t('pedido.modal_cons.tooltip_nenhum_inteiro')}</div>
                        )}
                      </div>
                    }
                  >
                    <div style={{ ...estilos.statCard, borderTop: '2px solid rgba(74,222,128,0.4)' }}>
                      <Package size={20} weight="duotone" style={{ color: '#4ade80' }} />
                      <div>
                        <span style={estilos.statValor}>{inteiros.length}</span>
                        <span style={estilos.statLabel}>{t('pedido.modal_cons.stat_pedidos_inteiros')}</span>
                      </div>
                    </div>
                  </TooltipGlobal>
                  {/* Card Pedidos Parciais */}
                  <TooltipGlobal
                    titulo={t('pedido.modal_cons.tooltip_pedidos_parciais')}
                    descricao={
                      <div style={estilos.tooltipRico}>
                        <span style={estilos.tooltipCategoria}>{t('pedido.modal_cons.tooltip_alguns_itens_selecionados')}</span>
                        {parciais.map(p => (
                          <div key={p.numero} style={estilos.tooltipLinha2}>
                            <span>{p.numero}</span>
                            <span style={{ ...estilos.tooltipValor2, color: '#fbbf24' }}>{p.itensSel}/{p.itensTotal} {t('pedido.modal_cons.item', { count: p.itensTotal })}</span>
                          </div>
                        ))}
                        {parciais.length === 0 && (
                          <div style={{ fontSize: '0.75rem', color: '#475569' }}>{t('pedido.modal_cons.tooltip_nenhum_parcial')}</div>
                        )}
                      </div>
                    }
                  >
                    <div style={{ ...estilos.statCard, borderTop: `2px solid ${parciais.length > 0 ? 'rgba(251,191,36,0.4)' : 'rgba(148,163,184,0.3)'}` }}>
                      <CubeTransparent size={20} weight="duotone" style={{ color: parciais.length > 0 ? '#fbbf24' : '#94a3b8' }} />
                      <div>
                        <span style={estilos.statValor}>{parciais.length}</span>
                        <span style={estilos.statLabel}>{t('pedido.modal_cons.stat_pedidos_parciais')}</span>
                      </div>
                    </div>
                  </TooltipGlobal>
                </>
              )
            })()}
            <TooltipGlobal
              titulo={t('pedido.modal_cons.tooltip_campos_divergentes')}
              descricao={
                <div style={estilos.tooltipRico}>
                  <span style={estilos.tooltipCategoria}>{t('pedido.modal_cons.tooltip_categoria_analise')}</span>
                  <div style={estilos.tooltipLinha2}><span>{t('pedido.modal_cons.tooltip_divergentes')}</span><span style={{ ...estilos.tooltipValor2, color: totalDivergencias > 0 ? '#fbbf24' : '#4ade80' }}>{totalDivergencias}</span></div>
                  <div style={estilos.tooltipLinha2}><span>{t('pedido.modal_cons.tooltip_acao')}</span><span style={estilos.tooltipValor2}>{totalDivergencias > 0 ? t('pedido.modal_cons.tooltip_escolher_valores') : t('pedido.modal_cons.tooltip_nenhuma')}</span></div>
                </div>
              }
            >
              <div style={{ ...estilos.statCard, borderTop: `2px solid ${totalDivergencias > 0 ? 'rgba(251,191,36,0.4)' : 'rgba(148,163,184,0.3)'}` }}>
                <Warning size={20} weight="duotone" style={{ color: totalDivergencias > 0 ? '#fbbf24' : '#94a3b8' }} />
                <div>
                  <span style={estilos.statValor}>{totalDivergencias}</span>
                  <span style={estilos.statLabel}>{t('pedido.modal_cons.stat_divergencias')}</span>
                </div>
              </div>
            </TooltipGlobal>
            <TooltipGlobal
              titulo={t('pedido.modal_cons.tooltip_campos_iguais')}
              descricao={
                <div style={estilos.tooltipRico}>
                  <span style={estilos.tooltipCategoria}>{t('pedido.modal_cons.tooltip_campos_iguais')}</span>
                  <div style={estilos.tooltipLinha2}><span>{t('pedido.modal_cons.tooltip_iguais')}</span><span style={{ ...estilos.tooltipValor2, color: '#94a3b8' }}>{totalIguais}</span></div>
                  <div style={estilos.tooltipLinha2}><span>{t('pedido.modal_cons.tooltip_acao')}</span><span style={estilos.tooltipValor2}>{t('pedido.modal_cons.tooltip_mantidos')}</span></div>
                  <div style={estilos.tooltipLinha2}><span>{t('pedido.modal_cons.tooltip_taxa_igualdade')}</span><span style={{ ...estilos.tooltipValor2, color: '#94a3b8' }}>{totalIguais + totalDivergencias > 0 ? Math.round((totalIguais / (totalIguais + totalDivergencias)) * 100) : 0}%</span></div>
                </div>
              }
            >
              <div style={{ ...estilos.statCard, borderTop: '2px solid rgba(74,222,128,0.4)' }}>
                <CheckCircle size={20} weight="duotone" style={{ color: '#4ade80' }} />
                <div>
                  <span style={estilos.statValor}>{totalIguais}</span>
                  <span style={estilos.statLabel}>{t('pedido.modal_cons.stat_campos_iguais')}</span>
                </div>
              </div>
            </TooltipGlobal>
          </div>

          {/* Valor total */}
          {preview.valor_total_soma > 0 && (
            <div style={estilos.valorTotalCard}>
              <span style={estilos.valorTotalLabel}>{t('pedido.modal_cons.valor_total_consolidado')}</span>
              <span style={estilos.valorTotalValor}>{fmtMoeda(preview.valor_total_soma, preview.moeda)}</span>
            </div>
          )}

          {/* Resumo dos grupos — removido por decisão de UX */}
        </div>
      </div>
    )
  }

  function renderPasso2() {
    if (!preview) return null

    // Estatísticas para o infográfico — com rótulos para tooltips
    const todosCampos = [
      ...preview.campos_divergentes.map(c => ({
        rotulo: c.rotulo,
        grupo: c.grupo,
        valor: camposEscolhidos[c.campo] ?? c.valor_sugerido,
      })),
      ...preview.campos_iguais.map(c => ({
        rotulo: c.rotulo,
        grupo: c.grupo,
        valor: c.valor,
      })),
    ]
    const totalColunasAtivas = todosCampos.length
    const camposComDadosList = todosCampos.filter(c => c.valor != null && c.valor !== '')
    const camposVaziosList = todosCampos.filter(c => c.valor == null || c.valor === '')
    const totalComDados = camposComDadosList.length
    const totalVazias = camposVaziosList.length

    // Agrupar campos por grupo para popover
    const agruparPorGrupo = (campos: Array<{ rotulo: string; grupo: string }>) => {
      const porGrupo: Record<string, string[]> = {}
      for (const c of campos) {
        if (!porGrupo[c.grupo]) porGrupo[c.grupo] = []
        porGrupo[c.grupo].push(c.rotulo)
      }
      return porGrupo
    }

    const renderColunasInline = (campos: Array<{ rotulo: string; grupo: string }>) => {
      const porGrupo = agruparPorGrupo(campos)
      return (
        <div style={estilos.infograficoDetalhe}>
          <div style={estilos.infograficoDetalheScroll}>
            {Object.entries(porGrupo).map(([grupo, rotulos]) => (
              <div key={grupo} style={{ marginBottom: '0.5rem' }}>
                <span style={estilos.infograficoDetalheGrupo}>{grupo} ({rotulos.length})</span>
                {rotulos.map(r => (
                  <span key={r} style={estilos.infograficoDetalheItem}>{r}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div style={estilos.passo2}>
        {/* Infográfico resumo — pills clicáveis, mesma linguagem dos filtros */}
        <div style={estilos.infograficoPills}>
          <button
            type="button"
            style={{ ...estilos.legendaFiltro, ...(infograficoPopover === 'ativas' ? estilos.legendaFiltroAtivo : {}) }}
            onClick={() => setInfograficoPopover(prev => prev === 'ativas' ? null : 'ativas')}
          >
            <Stack size={14} weight="fill" style={{ color: infograficoPopover === 'ativas' ? '#a5b4fc' : '#818cf8' }} />
            {t('pedido.modal_cons.colunas_ativas', { count: totalColunasAtivas })}
          </button>
          <button
            type="button"
            style={{ ...estilos.legendaFiltro, ...(infograficoPopover === 'dados' ? estilos.legendaFiltroIgual : {}) }}
            onClick={() => setInfograficoPopover(prev => prev === 'dados' ? null : 'dados')}
          >
            <CheckCircle size={14} weight="fill" style={{ color: infograficoPopover === 'dados' ? '#4ade80' : 'var(--success, #22c55e)' }} />
            {t('pedido.modal_cons.com_dados', { count: totalComDados })}
          </button>
          <button
            type="button"
            style={{ ...estilos.legendaFiltro, ...(infograficoPopover === 'vazias' ? estilos.legendaFiltroVazio : {}) }}
            onClick={() => setInfograficoPopover(prev => prev === 'vazias' ? null : 'vazias')}
          >
            <MinusCircle size={14} weight="fill" style={{ color: '#475569' }} />
            {t('pedido.modal_cons.vazias', { count: totalVazias })}
          </button>
        </div>

        {/* Detalhe inline — expande abaixo dos pills ao clicar */}
        {infograficoPopover === 'ativas' && renderColunasInline(todosCampos)}
        {infograficoPopover === 'dados' && renderColunasInline(camposComDadosList)}
        {infograficoPopover === 'vazias' && renderColunasInline(camposVaziosList)}

        {/* Filtros clicáveis */}
        <div style={estilos.legendaComparacao}>
          <button
            type="button"
            style={{ ...estilos.legendaFiltro, ...(filtroCampos === 'todos' ? estilos.legendaFiltroAtivo : {}) }}
            onClick={() => setFiltroCampos('todos')}
          >
            {t('pedido.modal_cons.filtro_todos')}
          </button>
          <button
            type="button"
            style={{ ...estilos.legendaFiltro, ...(filtroCampos === 'divergentes' ? estilos.legendaFiltroDivergente : {}) }}
            onClick={() => setFiltroCampos(f => f === 'divergentes' ? 'todos' : 'divergentes')}
          >
            <Warning size={14} weight="fill" style={{ color: filtroCampos === 'divergentes' ? '#fbbf24' : 'var(--warning, #f59e0b)' }} />
            {t('pedido.modal_cons.filtro_divergentes')}
          </button>
          <button
            type="button"
            style={{ ...estilos.legendaFiltro, ...(filtroCampos === 'iguais' ? estilos.legendaFiltroIgual : {}) }}
            onClick={() => setFiltroCampos(f => f === 'iguais' ? 'todos' : 'iguais')}
          >
            <CheckCircle size={14} weight="fill" style={{ color: filtroCampos === 'iguais' ? '#4ade80' : 'var(--success, #22c55e)' }} />
            {t('pedido.modal_cons.filtro_iguais')}
          </button>
          <button
            type="button"
            style={{ ...estilos.legendaFiltro, ...(filtroCampos === 'vazios' ? estilos.legendaFiltroVazio : {}) }}
            onClick={() => setFiltroCampos(f => f === 'vazios' ? 'todos' : 'vazios')}
          >
            <MinusCircle size={14} weight="fill" style={{ color: '#475569' }} />
            {t('pedido.modal_cons.filtro_vazios')}
          </button>
        </div>

        {/* Filtro por pedido de origem — select buscável */}
        {preview.pedidos_info.length >= 2 && (
          <div style={estilos.filtroOrigemRow}>
            <span style={estilos.filtroOrigemLabel}>{t('pedido.modal_cons.origem_label')}</span>
            <div style={estilos.filtroOrigemSelect}>
              <SelectGlobal
                buscavel
                tamanho="compacto"
                placeholder={t('pedido.modal_cons.filtro_origem_placeholder')}
                opcoes={[
                  { valor: '__todos__', rotulo: t('pedido.modal_cons.todos_pedidos', { count: preview.pedidos_info.length }) },
                  ...preview.pedidos_info.map(pi => {
                    const divCount = preview.campos_divergentes.filter(c => c.valores.some(v => v.pedido_id === pi.id)).length
                    return {
                      valor: pi.id,
                      rotulo: divCount > 0
                        ? `${pi.numero}  ·  ${t('pedido.modal_cons.divergencia_count', { count: divCount })}`
                        : pi.numero,
                    }
                  }),
                ]}
                valor={filtroPedidoOrigem ?? '__todos__'}
                aoMudarValor={v => setFiltroPedidoOrigem(v === '__todos__' ? null : String(v))}
                aria-label={t('pedido.modal_cons.aria_filtrar_origem')}
              />
            </div>
          </div>
        )}

        {/* Grupos colapsáveis — filtrados */}
        {grupos.map((grupo) => {
          // 1. Filtro por pedido de origem (divergentes que envolvem esse pedido)
          let divergentesBase = grupo.divergentes
          if (filtroPedidoOrigem) {
            divergentesBase = divergentesBase.filter(c => c.valores.some(v => v.pedido_id === filtroPedidoOrigem))
          }

          // 2. Filtro por tipo (divergentes/iguais/vazios)
          const divergentesFiltrados = filtroCampos === 'iguais' || filtroCampos === 'vazios' ? [] : divergentesBase
          const iguaisComDado = grupo.iguais.filter(c => c.valor != null && c.valor !== '')
          const iguaisVazio = grupo.iguais.filter(c => c.valor == null || c.valor === '')
          let iguaisFiltrados: CampoIgual[] = []
          if (filtroPedidoOrigem) {
            // Quando filtrado por pedido, iguais ficam ocultos (são comuns, não específicos)
            if (filtroCampos === 'todos' || filtroCampos === 'iguais') iguaisFiltrados = []
            else iguaisFiltrados = []
          } else {
            if (filtroCampos === 'todos') iguaisFiltrados = grupo.iguais
            else if (filtroCampos === 'iguais') iguaisFiltrados = iguaisComDado
            else if (filtroCampos === 'vazios') iguaisFiltrados = iguaisVazio
          }

          const grupoFiltrado: GrupoCampos = {
            grupo: grupo.grupo,
            divergentes: divergentesFiltrados,
            iguais: iguaisFiltrados,
          }

          // Ocultar grupo se vazio após filtro
          if (grupoFiltrado.divergentes.length === 0 && grupoFiltrado.iguais.length === 0) return null

          return (
            <GrupoColapsavel
              key={grupo.grupo}
              grupo={grupoFiltrado}
              camposEscolhidos={camposEscolhidos}
              onMudarCampo={handleMudarCampo}
              inicialmenteAberto={grupoFiltrado.divergentes.length > 0 || grupoFiltrado.iguais.some(c => c.valor != null && c.valor !== '')}
            />
          )
        })}
      </div>
    )
  }

  function renderPasso3() {
    if (!preview) return null

    // ── Tela de resultado (após consolidação concluída) ──
    if (concluido) {
      const totalItens = preview.itens.length
      return (
        <div style={estilos.passo3}>
          {/* Banner de sucesso — mesmo padrão da edição em massa */}
          <div style={estilos.resultadoBanner}>
            <CheckCircle weight="fill" size={20} color="var(--success, #22c55e)" />
            <div>
              <p style={estilos.resultadoBannerTexto}>
                {t('pedido.modal_cons.resultado_banner', { pedidos: ids.length, numero: numeroPedido, itens: totalItens, count: totalItens })}
              </p>
            </div>
          </div>

          {/* Pedidos de origem — arquivados */}
          <div style={estilos.resultadoSecao}>
            <p style={estilos.resultadoSecaoTitulo}>{t('pedido.modal_cons.pedidos_origem_arquivados_resultado')}</p>
            {pedidosSelecionados.map(p => (
              <div key={p.id} style={estilos.resultadoCard}>
                <div style={estilos.resultadoCardTexto}>
                  <span style={estilos.resultadoCardNome}>{p.numero_pedido}</span>
                  <span style={estilos.resultadoCardDetalhe}>
                    {t('pedido.modal_cons.detalhe_inteiro', { count: preview.pedidos_info.find(pi => pi.id === p.id)?.total_itens ?? 0 })}
                  </span>
                </div>
                <span style={estilos.resultadoOk}><CheckCircle size={14} weight="fill" /> OK</span>
              </div>
            ))}
            {pedidoIdsParciais.map(id => {
              const info = preview.pedidos_info.find(pi => pi.id === id)
              const numero = info?.numero ?? t('pedido.modal_cons.pedido_fallback', { id: id.slice(0, 8) })
              const itensSel = itensSelecionados.filter(i => i.pedido_id === id).length
              return (
                <div key={id} style={estilos.resultadoCard}>
                  <div style={estilos.resultadoCardTexto}>
                    <span style={estilos.resultadoCardNome}>{numero}</span>
                    <span style={estilos.resultadoCardDetalhe}>
                      {t('pedido.modal_cons.detalhe_parcial', { count: itensSel })}
                    </span>
                  </div>
                  <span style={estilos.resultadoOk}><CheckCircle size={14} weight="fill" /> OK</span>
                </div>
              )
            })}
          </div>

          {/* Divergências resolvidas */}
          {totalDivergencias > 0 && (
            <div style={estilos.resultadoSecao}>
              <p style={estilos.resultadoSecaoTitulo}>{t('pedido.modal_cons.campos_divergentes_resolvidos')}</p>
              {preview.campos_divergentes.map(campo => (
                <div key={campo.campo} style={estilos.resultadoCard}>
                  <div style={estilos.resultadoCardTexto}>
                    <span style={estilos.resultadoCardNome}>{campo.rotulo}</span>
                    <span style={estilos.resultadoCardDetalhe}>{fmtValor(camposEscolhidos[campo.campo] ?? campo.valor_sugerido)}</span>
                  </div>
                  <span style={estilos.resultadoOk}><CheckCircle size={14} weight="fill" /> OK</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    // ── Tela de confirmação (antes de consolidar) ──
    return (
      <div style={estilos.passo3}>
        <div style={estilos.confirmacaoCard}>
          <GitMerge size={24} weight="duotone" style={{ color: 'var(--accent, #6366f1)' }} />
          <div style={estilos.confirmacaoTexto}>
            <p style={estilos.confirmacaoTitulo}>{t('pedido.modal_cons.confirmacao_titulo')}</p>
            <p style={estilos.confirmacaoDesc}>
              {t('pedido.modal_cons.confirmacao_desc', { count: ids.length, numero: numeroPedido })}
            </p>
          </div>
        </div>

        {/* Resumo das escolhas para divergências */}
        {totalDivergencias > 0 && (
          <div style={estilos.resumoEscolhas}>
            <span style={estilos.resumoEscolhasTitulo}>
              {t('pedido.modal_cons.resumo_escolhas', { count: totalDivergencias })}
            </span>
            <div style={estilos.resumoEscolhasLista}>
              {preview.campos_divergentes.map(campo => (
                <div key={campo.campo} style={estilos.resumoEscolhaLinha}>
                  <span style={estilos.resumoEscolhaCampo}>{campo.rotulo}</span>
                  <span style={estilos.resumoEscolhaValor}>{fmtValor(camposEscolhidos[campo.campo] ?? campo.valor_sugerido)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pedidos que serão consolidados */}
        <div style={estilos.pedidosOrigem}>
          <span style={estilos.pedidosOrigemTitulo}>{t('pedido.modal_cons.pedidos_origem_arquivados')}</span>
          <div style={estilos.pedidosOrigemLista}>
            {pedidosSelecionados.map(p => (
              <span key={p.id} style={estilos.pedidoOrigemChip}>{p.numero_pedido} {t('pedido.modal_cons.chip_inteiro')}</span>
            ))}
            {pedidoIdsParciais.map(id => {
              const info = preview?.pedidos_info.find(pi => pi.id === id)
              const numero = info?.numero ?? t('pedido.modal_cons.pedido_fallback', { id: id.slice(0, 8) })
              const itensSel = itensSelecionados.filter(i => i.pedido_id === id).length
              return (
                <span key={id} style={{ ...estilos.pedidoOrigemChip, borderColor: 'color-mix(in srgb, var(--warning) 30%, transparent)', background: 'color-mix(in srgb, var(--warning) 10%, transparent)' }}>
                  {numero} {t('pedido.modal_cons.chip_parcial', { count: itensSel })}
                </span>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
    {/* Override visual do modal — borda accent, seções premium e footer refinado */}
    <style>{`
      .mpg-dialog {
        border: 1px solid color-mix(in srgb, var(--accent, #6366f1) 18%, var(--bg-elevated)) !important;
        box-shadow:
          0 24px 64px rgba(0, 0, 0, 0.55),
          0 0 0 1px rgba(99, 102, 241, 0.08),
          inset 0 1px 0 rgba(255, 255, 255, 0.03) !important;
      }
      /* ── Input glass dentro das seções ── */
      .cons-secao input[type="text"] {
        background: rgba(15, 23, 42, 0.5) !important;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(99, 102, 241, 0.15) !important;
        border-radius: var(--radius-md);
        color: var(--text-primary);
        padding: 0.625rem 0.875rem;
        font-size: 0.875rem;
        transition: border-color 0.2s, box-shadow 0.2s;
        outline: none;
      }
      .cons-secao input[type="text"]:focus {
        border-color: #6366f1 !important;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12), 0 0 12px rgba(99, 102, 241, 0.08);
      }
      .cons-secao input[type="text"]::placeholder {
        color: var(--text-muted, #64748b);
        opacity: 0.6;
      }
      .cons-secao {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 1rem 1.25rem;
        background: transparent;
        border: 1px solid color-mix(in srgb, var(--bg-elevated) 60%, transparent);
        border-radius: var(--radius-lg);
      }
      .cons-secao-titulo {
        position: relative;
        z-index: 1;
        font-size: 0.6875rem;
        font-weight: 700;
        color: var(--accent, #6366f1);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      /* ── Footer: botões juntos à direita, sem indicador 1/3 ── */
      /* Só o span do indicador (sem button). O Próximo vem em <span><BotaoGlobal/></span>
         desde dataTutorialAlvoBotaoAvancar (55454f12) — seletor antigo escondia os dois. */
      .mpg-dialog > div:last-child {
        justify-content: flex-end !important;
        gap: 0.75rem !important;
      }
      .mpg-dialog > div:last-child > div > span:not(:has(button)) {
        display: none !important;
      }
      .cons-secao-titulo::before {
        content: '';
        display: inline-block;
        width: 7px;
        height: 7px;
        background: linear-gradient(135deg, var(--accent, #6366f1), #a78bfa);
        border-radius: 50%;
        box-shadow: 0 0 6px color-mix(in srgb, var(--accent, #6366f1) 40%, transparent);
      }
    `}</style>
    <ModalPassoPassoGlobal
      titulo={t('pedido.modal_cons.titulo', { count: totalPedidosConsolidar })}
      icone={<GitMerge size={22} weight="duotone" />}
      subtitulo={t('pedido.modal_cons.subtitulo')}
      aberto={true}
      passos={passos}
      passoAtual={passoAtual}
      onProximo={handleProximo}
      onVoltar={handleVoltar}
      onFechar={onFechar}
      podeAvancar={podeAvancar}
      labelBotaoFinal={t('pedido.modal_cons.consolidar')}
      labelProximo={t('pedido.modal_cons.proximo')}
      tamanho="xl"
      carregando={salvando}
      textoCarregando={t('pedido.modal_cons.consolidando')}
      ocultarStepper={concluido}
      footerCustom={concluido ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <BotaoGlobal variante="primario" tamanho="medio" onClick={onConcluido}>
            {t('pedido.modal_cons.fechar')}
          </BotaoGlobal>
        </div>
      ) : undefined}
    >
      {passoAtual === 1 && renderPasso1()}
      {passoAtual === 2 && renderPasso2()}
      {passoAtual === 3 && renderPasso3()}
    </ModalPassoPassoGlobal>
    </>
  )
}

// ── Estilos inline (Design System Solid Slate) ───────────────────────────────

const estilos = {
  centrado: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    minHeight: '200px',
  },
  erro: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    background: 'color-mix(in srgb, var(--danger) 10%, transparent)',
    border: '1px solid color-mix(in srgb, var(--danger) 30%, transparent)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--danger)',
    fontSize: '0.8125rem',
  } as React.CSSProperties,

  // ── Passo 1 ──
  passo1: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  // secao e secaoTitulo movidos para CSS classes (.cons-secao, .cons-secao-titulo)
  hintComIcone: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.8rem',
    color: 'var(--text-muted, #94a3b8)',
    marginTop: '-0.25rem',
  } as React.CSSProperties,
  bannerConflito: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    background: 'color-mix(in srgb, var(--danger) 8%, transparent)',
    border: '1px solid color-mix(in srgb, var(--danger) 30%, transparent)',
    borderRadius: 'var(--radius-md)',
  } as React.CSSProperties,
  bannerConflitotitulo: {
    color: 'var(--danger)',
    fontWeight: 600,
    fontSize: '0.875rem',
    margin: 0,
  } as React.CSSProperties,
  bannerConflitoMsg: {
    color: 'var(--text-secondary)',
    fontSize: '0.8125rem',
    margin: '0.25rem 0 0',
  } as React.CSSProperties,
  campoNumero: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.375rem',
  },
  label: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  input: {
    padding: '0.5rem 0.75rem',
    background: 'var(--bg-surface)',
    border: '1px solid var(--bg-elevated)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.15s',
  } as React.CSSProperties,
  hint: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  } as React.CSSProperties,
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.625rem',
  } as React.CSSProperties,
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 0.875rem',
    background: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(99, 102, 241, 0.12)',
    borderRadius: 'var(--radius-md)',
    cursor: 'default',
    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
  } as React.CSSProperties,
  statValor: {
    display: 'block',
    fontSize: '1.375rem',
    fontWeight: 800,
    color: '#fff',
    lineHeight: 1.2,
    marginBottom: '0.25rem',
  } as React.CSSProperties,
  statLabel: {
    display: 'block',
    fontSize: '0.6875rem',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    fontWeight: 600,
  } as React.CSSProperties,
  // ── Tooltip rico (estilo Dashboard) ──
  tooltipRico: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.375rem',
    minWidth: '160px',
  } as React.CSSProperties,
  tooltipCategoria: {
    display: 'block',
    fontSize: '0.625rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: '0.125rem',
  } as React.CSSProperties,
  tooltipLinha2: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    fontSize: '0.8125rem',
    color: 'var(--text-secondary)',
  } as React.CSSProperties,
  tooltipValor2: {
    fontWeight: 700,
    color: 'var(--text-primary)',
    fontVariantNumeric: 'tabular-nums',
  } as React.CSSProperties,
  valorTotalCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.625rem 1rem',
    background: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(99, 102, 241, 0.12)',
    borderRadius: 'var(--radius-md)',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
  } as React.CSSProperties,
  valorTotalLabel: {
    fontSize: '0.8125rem',
    color: 'var(--text-muted)',
  } as React.CSSProperties,
  valorTotalValor: {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    fontVariantNumeric: 'tabular-nums',
  } as React.CSSProperties,
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8125rem',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    padding: '0.5rem 0',
  } as React.CSSProperties,
  checkbox: {
    accentColor: 'var(--accent, #6366f1)',
  } as React.CSSProperties,
  resumoGrupos: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  resumoGruposTitulo: {
    fontSize: '0.6875rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  } as React.CSSProperties,
  resumoGruposLista: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.375rem',
  },
  resumoGrupoChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.25rem 0.625rem',
    background: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(99, 102, 241, 0.10)',
    borderRadius: '999px',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  } as React.CSSProperties,
  chipBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '16px',
    height: '16px',
    padding: '0 4px',
    background: 'color-mix(in srgb, var(--warning, #f59e0b) 20%, transparent)',
    color: 'var(--warning, #f59e0b)',
    borderRadius: '999px',
    fontSize: '0.625rem',
    fontWeight: 700,
  } as React.CSSProperties,

  // ── Passo 2 ──
  passo2: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  legendaComparacao: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.75rem',
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-md)',
    marginBottom: '0.5rem',
  } as React.CSSProperties,
  legendaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  } as React.CSSProperties,
  legendaFiltro: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.3125rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    borderRadius: '999px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  } as React.CSSProperties,
  legendaFiltroAtivo: {
    background: 'rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    color: '#a5b4fc',
  } as React.CSSProperties,
  legendaFiltroDivergente: {
    background: 'rgba(251, 191, 36, 0.12)',
    border: '1px solid rgba(251, 191, 36, 0.3)',
    color: '#fbbf24',
  } as React.CSSProperties,
  legendaFiltroIgual: {
    background: 'rgba(74, 222, 128, 0.12)',
    border: '1px solid rgba(74, 222, 128, 0.3)',
    color: '#4ade80',
  } as React.CSSProperties,
  legendaFiltroVazio: {
    background: 'rgba(71, 85, 105, 0.15)',
    border: '1px solid rgba(71, 85, 105, 0.3)',
    color: '#64748b',
  } as React.CSSProperties,

  // Infográfico passo 2
  // (infografico cards removidos — agora usa pills no padrão legendaFiltro)
  infograficoPills: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  infograficoDetalhe: {
    background: 'rgba(15, 23, 42, 0.5)',
    border: '1px solid rgba(99, 102, 241, 0.12)',
    borderRadius: 'var(--radius-md)',
    padding: '0.75rem 1rem',
    marginTop: '0.5rem',
  } as React.CSSProperties,
  infograficoDetalheScroll: {
    maxHeight: '200px',
    overflowY: 'auto' as const,
    overscrollBehavior: 'contain' as const,
  } as React.CSSProperties,
  infograficoDetalheGrupo: {
    display: 'block',
    fontSize: '0.6875rem',
    fontWeight: 700,
    color: '#818cf8',
    marginBottom: '0.125rem',
  } as React.CSSProperties,
  infograficoDetalheItem: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#94a3b8',
    paddingLeft: '0.5rem',
    lineHeight: 1.6,
  } as React.CSSProperties,

  // ── Filtro por pedido de origem (SelectGlobal) ──
  filtroOrigemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 0.75rem',
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-md)',
    marginBottom: '0.25rem',
  } as React.CSSProperties,
  filtroOrigemLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,
  filtroOrigemSelect: {
    flex: 1,
    minWidth: 0,
  } as React.CSSProperties,

  // Grupo colapsável
  grupo: {
    border: '1px solid var(--bg-elevated)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
  } as React.CSSProperties,
  grupoHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '0.625rem 0.875rem',
    background: 'var(--bg-surface)',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.1s',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  grupoHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  } as React.CSSProperties,
  grupoNome: {
    fontSize: '0.8125rem',
    fontWeight: 600,
  } as React.CSSProperties,
  grupoContador: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  } as React.CSSProperties,
  grupoHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  } as React.CSSProperties,
  badgeDivergenciaPequeno: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.125rem 0.5rem',
    background: 'color-mix(in srgb, var(--warning, #f59e0b) 15%, transparent)',
    color: 'var(--warning, #f59e0b)',
    borderRadius: '999px',
    fontSize: '0.6875rem',
    fontWeight: 600,
  } as React.CSSProperties,
  badgeIgualPequeno: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.125rem 0.5rem',
    background: 'color-mix(in srgb, var(--success, #22c55e) 15%, transparent)',
    color: 'var(--success, #22c55e)',
    borderRadius: '999px',
    fontSize: '0.6875rem',
    fontWeight: 600,
  } as React.CSSProperties,
  badgeVazioPequeno: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.125rem 0.5rem',
    background: 'rgba(71, 85, 105, 0.15)',
    color: '#475569',
    borderRadius: '999px',
    fontSize: '0.6875rem',
    fontWeight: 600,
  } as React.CSSProperties,
  grupoCorpo: {
    display: 'flex',
    flexDirection: 'column' as const,
    borderTop: '1px solid var(--bg-elevated)',
  },

  // Linhas de comparação
  linhaComparacao: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr auto',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 0.875rem',
    borderBottom: '1px solid color-mix(in srgb, var(--bg-elevated) 50%, transparent)',
    fontSize: '0.8125rem',
  } as React.CSSProperties,
  linhaNome: {
    color: 'var(--text-secondary)',
    fontSize: '0.8125rem',
    fontWeight: 500,
  } as React.CSSProperties,
  linhaSelect: {
    minWidth: 0,
  } as React.CSSProperties,
  linhaValorIgual: {
    color: 'var(--text-primary)',
    fontSize: '0.8125rem',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  linhaOrigens: {
    display: 'flex',
    justifyContent: 'flex-end',
  } as React.CSSProperties,
  badgeDivergencia: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.1875rem 0.5rem',
    background: 'color-mix(in srgb, var(--warning, #f59e0b) 15%, transparent)',
    color: 'var(--warning, #f59e0b)',
    borderRadius: '999px',
    fontSize: '0.6875rem',
    fontWeight: 600,
    cursor: 'pointer',
    position: 'relative' as const,
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,
  badgeIgual: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.1875rem 0.5rem',
    background: 'color-mix(in srgb, var(--success, #22c55e) 15%, transparent)',
    color: 'var(--success, #22c55e)',
    borderRadius: '999px',
    fontSize: '0.6875rem',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,
  badgeVazio: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.1875rem 0.5rem',
    background: 'rgba(71, 85, 105, 0.15)',
    color: '#475569',
    borderRadius: '999px',
    fontSize: '0.6875rem',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,
  tooltip: {
    position: 'absolute' as const,
    bottom: 'calc(100% + 8px)',
    right: 0,
    background: 'var(--bg-base)',
    border: '1px solid var(--bg-elevated)',
    borderRadius: 'var(--radius-md)',
    padding: '0.5rem 0.75rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
    zIndex: 100,
    minWidth: '180px',
    boxShadow: 'var(--shadow-md)',
  } as React.CSSProperties,
  tooltipLinha: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,

  // ── Passo 3 ──
  passo3: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.25rem',
  },
  confirmacaoCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.875rem',
    padding: '1rem 1.25rem',
    background: 'color-mix(in srgb, var(--accent, #6366f1) 8%, transparent)',
    border: '1px solid color-mix(in srgb, var(--accent, #6366f1) 25%, transparent)',
    borderRadius: 'var(--radius-md)',
  } as React.CSSProperties,
  confirmacaoTexto: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  confirmacaoTitulo: {
    margin: 0,
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  confirmacaoDesc: {
    margin: 0,
    fontSize: '0.8125rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
  } as React.CSSProperties,
  resumoEscolhas: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  resumoEscolhasTitulo: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.03em',
  } as React.CSSProperties,
  resumoEscolhasLista: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
    padding: '0.5rem 0.75rem',
    background: 'var(--bg-surface)',
    border: '1px solid var(--bg-elevated)',
    borderRadius: 'var(--radius-md)',
    maxHeight: '200px',
    overflowY: 'auto' as const,
  },
  resumoEscolhaLinha: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.25rem 0',
    borderBottom: '1px solid color-mix(in srgb, var(--bg-elevated) 50%, transparent)',
  } as React.CSSProperties,
  resumoEscolhaCampo: {
    fontSize: '0.8125rem',
    color: 'var(--text-secondary)',
  } as React.CSSProperties,
  resumoEscolhaValor: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  pedidosOrigem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  pedidosOrigemTitulo: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.03em',
  } as React.CSSProperties,
  pedidosOrigemLista: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.375rem',
  },
  pedidoOrigemChip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.625rem',
    background: 'color-mix(in srgb, var(--danger) 10%, transparent)',
    border: '1px solid color-mix(in srgb, var(--danger) 20%, transparent)',
    borderRadius: '999px',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  } as React.CSSProperties,
  // ── Resultado (passo 3 concluído) — padrão edição em massa ──
  resultadoBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    background: 'color-mix(in srgb, var(--success, #22c55e) 10%, transparent)',
    border: '1px solid color-mix(in srgb, var(--success, #22c55e) 35%, transparent)',
    borderRadius: 'var(--radius-md, 8px)',
    marginBottom: '0.5rem',
  } as React.CSSProperties,
  resultadoBannerTexto: {
    margin: 0,
    fontWeight: 600,
    fontSize: '0.875rem',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  resultadoSecao: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  resultadoSecaoTitulo: {
    margin: 0,
    fontWeight: 600,
    fontSize: '0.8125rem',
    color: 'var(--text-secondary, #94a3b8)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  } as React.CSSProperties,
  resultadoCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.625rem 0.875rem',
    background: 'var(--surface-2, #1e293b)',
    borderRadius: 'var(--radius-sm, 6px)',
    border: '1px solid var(--border, #334155)',
  } as React.CSSProperties,
  resultadoCardTexto: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.125rem',
  },
  resultadoCardNome: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  resultadoCardDetalhe: {
    fontSize: '0.75rem',
    color: 'var(--text-tertiary, #64748b)',
  } as React.CSSProperties,
  resultadoOk: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--success, #22c55e)',
  } as React.CSSProperties,
} as const
