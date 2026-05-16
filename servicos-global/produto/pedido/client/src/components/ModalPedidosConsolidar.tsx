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
  Stack, MinusCircle,
} from '@phosphor-icons/react'
import { GravityLoader } from '@nucleo/gravity-loader-global'
import { ModalPassoPassoGlobal } from '@nucleo/modal-passo-passo-global'
import type { PassoConfig } from '@nucleo/modal-passo-passo-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { useShellStore } from '@gravity/shell'
import type { Pedido, ConsolidacaoPreview, ConsolidacaoPayload, CampoDivergente, CampoIgual } from '../shared/types'
import { pedidoConsolidarApi } from '../shared/api'
import { fmtMoeda } from '../shared/types'

// ── Props ─────────────────────────────────────────────────────────────────────

interface ModalConsolidarPedidosProps {
  pedidosSelecionados: Pedido[]
  onFechar: () => void
  onConcluido: () => void
  conflito_tipo_operacao?: boolean
}

// ── Passos ────────────────────────────────────────────────────────────────────

const PASSOS: PassoConfig[] = [
  { id: 1, label: 'Configurar' },
  { id: 2, label: 'Comparar' },
  { id: 3, label: 'Confirmar' },
]

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
  const [aberto, setAberto] = useState(inicialmenteAberto)
  const totalDivergentes = grupo.divergentes.length
  const totalIguais = grupo.iguais.length
  const total = totalDivergentes + totalIguais

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
          <span style={estilos.grupoContador}>({total} campos)</span>
        </span>
        <span style={estilos.grupoHeaderRight}>
          {totalDivergentes > 0 && (
            <span style={estilos.badgeDivergenciaPequeno}>
              <Warning size={12} weight="fill" />
              {totalDivergentes}
            </span>
          )}
          {totalIguais > 0 && (
            <span style={estilos.badgeIgualPequeno}>
              <CheckCircle size={12} weight="fill" />
              {totalIguais}
            </span>
          )}
        </span>
      </button>

      {aberto && (
        <div style={estilos.grupoCorpo}>
          {/* Divergentes primeiro */}
          {grupo.divergentes.map(campo => (
            <LinhaCampoComparacao
              key={campo.campo}
              campo={campo}
              tipo="divergente"
              valorEscolhido={camposEscolhidos[campo.campo] ?? campo.valor_sugerido}
              onMudar={v => onMudarCampo(campo.campo, v)}
            />
          ))}
          {/* Iguais depois */}
          {grupo.iguais.map(campo => (
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
          aria-label={`Valor consolidado para ${campo.rotulo}`}
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
          {campo.valores.length} origens
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
  return (
    <div style={estilos.linhaComparacao}>
      <div style={estilos.linhaNome}>{campo.rotulo}</div>
      <div style={estilos.linhaValorIgual}>{fmtValor(campo.valor)}</div>
      <div style={estilos.linhaOrigens}>
        <span style={estilos.badgeIgual}>
          <CheckCircle size={13} weight="fill" />
          igual
        </span>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export function ModalConsolidarPedidos({
  pedidosSelecionados,
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

  const ids = pedidosSelecionados.map(p => p.id)
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
  }, [])

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
        addNotification({ type: 'success', message: `${pedidosSelecionados.length} POs consolidadas em ${numeroPedido.trim()}.`, duration: 4000 })
        setConcluido(true)
        setTimeout(() => onConcluido(), 1500)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro ao consolidar pedidos'
        addNotification({ type: 'error', message: `Falha: ${msg}`, duration: 4000 })
      } finally {
        setSalvando(false)
      }
    }
  }, [passoAtual, preview, numeroPedido, camposEscolhidos, fundirItens, ids, onConcluido, pedidosSelecionados, addNotification])

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
          <GravityLoader texto="Analisando pedidos..." tamanho="sm" />
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
          <span className="cons-secao-titulo">Configuração</span>

          {/* Número do pedido */}
          <CampoGeralGlobal
            label="Número do Pedido Consolidado"
            obrigatorio
            vazio={!numeroPedido.trim()}
          >
            <input
              id="numero-pedido-cons"
              type="text"
              value={numeroPedido}
              onChange={e => setNumeroPedido(e.target.value)}
              placeholder="Ex: PO-CONS-2026/001"
              aria-required="true"
              maxLength={100}
            />
          </CampoGeralGlobal>
          <span style={estilos.hintComIcone}>
            <Info size={14} weight="fill" style={{ flexShrink: 0, opacity: 0.6 }} />
            Sugestão automática — você pode editar livremente.
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
              <span>Fundir itens com mesmo Part Number (somar quantidades)</span>
            </label>
          )}
        </div>

        {/* ── Seção 2 — Preview ── */}
        <div className="cons-secao">
          <span className="cons-secao-titulo">Preview</span>

          {/* Cards de estatísticas */}
          <style>{`[data-cons-stats] > .tg-trigger { display: flex; width: 100%; } [data-cons-stats] > .tg-trigger > div { width: 100%; } [data-cons-stats] > .tg-trigger:hover > div { border-color: rgba(99, 102, 241, 0.25) !important; box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15) !important; background: rgba(15, 23, 42, 0.65) !important; }`}</style>
          <div data-cons-stats style={estilos.statsGrid}>
            <TooltipGlobal
              titulo="Pedidos selecionados"
              descricao={
                <div style={estilos.tooltipRico}>
                  <span style={estilos.tooltipCategoria}>Consolidação</span>
                  <div style={estilos.tooltipLinha2}><span>Selecionados</span><span style={estilos.tooltipValor2}>{pedidosSelecionados.length}</span></div>
                  <div style={estilos.tooltipLinha2}><span>Resultado</span><span style={estilos.tooltipValor2}>1 pedido</span></div>
                </div>
              }
            >
              <div style={{ ...estilos.statCard, borderTop: '2px solid rgba(148,163,184,0.3)' }}>
                <Package size={20} weight="duotone" style={{ color: '#94a3b8' }} />
                <div>
                  <span style={estilos.statValor}>{pedidosSelecionados.length}</span>
                  <span style={estilos.statLabel}>Pedidos</span>
                </div>
              </div>
            </TooltipGlobal>
            <TooltipGlobal
              titulo="Total de itens"
              descricao={
                <div style={estilos.tooltipRico}>
                  <span style={estilos.tooltipCategoria}>Itens</span>
                  <div style={estilos.tooltipLinha2}><span>Total agrupado</span><span style={estilos.tooltipValor2}>{preview.itens.length}</span></div>
                  <div style={estilos.tooltipLinha2}><span>De pedidos</span><span style={estilos.tooltipValor2}>{pedidosSelecionados.length}</span></div>
                  {preview.itens.some(i => i.pode_fundir) && (
                    <div style={estilos.tooltipLinha2}><span>Fundíveis</span><span style={{ ...estilos.tooltipValor2, color: '#94a3b8' }}>{preview.itens.filter(i => i.pode_fundir).length}</span></div>
                  )}
                </div>
              }
            >
              <div style={{ ...estilos.statCard, borderTop: '2px solid rgba(148,163,184,0.3)' }}>
                <ListChecks size={20} weight="duotone" style={{ color: '#94a3b8' }} />
                <div>
                  <span style={estilos.statValor}>{preview.itens.length}</span>
                  <span style={estilos.statLabel}>Itens</span>
                </div>
              </div>
            </TooltipGlobal>
            <TooltipGlobal
              titulo="Campos divergentes"
              descricao={
                <div style={estilos.tooltipRico}>
                  <span style={estilos.tooltipCategoria}>Análise</span>
                  <div style={estilos.tooltipLinha2}><span>Divergentes</span><span style={{ ...estilos.tooltipValor2, color: totalDivergencias > 0 ? '#fbbf24' : '#4ade80' }}>{totalDivergencias}</span></div>
                  <div style={estilos.tooltipLinha2}><span>Ação</span><span style={estilos.tooltipValor2}>{totalDivergencias > 0 ? 'Escolher valores' : 'Nenhuma'}</span></div>
                </div>
              }
            >
              <div style={{ ...estilos.statCard, borderTop: `2px solid ${totalDivergencias > 0 ? 'rgba(251,191,36,0.4)' : 'rgba(148,163,184,0.3)'}` }}>
                <Warning size={20} weight="duotone" style={{ color: totalDivergencias > 0 ? '#fbbf24' : '#94a3b8' }} />
                <div>
                  <span style={estilos.statValor}>{totalDivergencias}</span>
                  <span style={estilos.statLabel}>Divergências</span>
                </div>
              </div>
            </TooltipGlobal>
            <TooltipGlobal
              titulo="Campos iguais"
              descricao={
                <div style={estilos.tooltipRico}>
                  <span style={estilos.tooltipCategoria}>Campos</span>
                  <div style={estilos.tooltipLinha2}><span>Iguais</span><span style={{ ...estilos.tooltipValor2, color: '#94a3b8' }}>{totalIguais}</span></div>
                  <div style={estilos.tooltipLinha2}><span>Ação</span><span style={estilos.tooltipValor2}>Mantidos</span></div>
                  <div style={estilos.tooltipLinha2}><span>Taxa de igualdade</span><span style={{ ...estilos.tooltipValor2, color: '#94a3b8' }}>{totalIguais + totalDivergencias > 0 ? Math.round((totalIguais / (totalIguais + totalDivergencias)) * 100) : 0}%</span></div>
                </div>
              }
            >
              <div style={{ ...estilos.statCard, borderTop: '2px solid rgba(74,222,128,0.4)' }}>
                <CheckCircle size={20} weight="duotone" style={{ color: '#4ade80' }} />
                <div>
                  <span style={estilos.statValor}>{totalIguais}</span>
                  <span style={estilos.statLabel}>Campos iguais</span>
                </div>
              </div>
            </TooltipGlobal>
          </div>

          {/* Valor total */}
          {preview.valor_total_soma > 0 && (
            <div style={estilos.valorTotalCard}>
              <span style={estilos.valorTotalLabel}>Valor total consolidado</span>
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

    // Estatísticas para o infográfico
    const totalColunasAtivas = grupos.length
    const todosCamposValores = [
      ...preview.campos_divergentes.map(c => camposEscolhidos[c.campo] ?? c.valor_sugerido),
      ...preview.campos_iguais.map(c => c.valor),
    ]
    const totalPreenchidos = todosCamposValores.filter(v => v != null && v !== '').length
    const totalVazios = todosCamposValores.length - totalPreenchidos

    return (
      <div style={estilos.passo2}>
        {/* Infográfico resumo */}
        <div style={estilos.infograficoGrid}>
          <div style={{ ...estilos.infograficoCard, borderTop: '2px solid rgba(129,140,248,0.4)' }}>
            <Stack size={20} weight="duotone" style={{ color: '#818cf8' }} />
            <div>
              <span style={estilos.infograficoValor}>{totalColunasAtivas}</span>
              <span style={estilos.infograficoLabel}>Colunas ativas</span>
            </div>
          </div>
          <div style={{ ...estilos.infograficoCard, borderTop: '2px solid rgba(74,222,128,0.4)' }}>
            <CheckCircle size={20} weight="duotone" style={{ color: '#4ade80' }} />
            <div>
              <span style={estilos.infograficoValor}>{totalPreenchidos}</span>
              <span style={estilos.infograficoLabel}>Campos preenchidos</span>
            </div>
          </div>
          <div style={{ ...estilos.infograficoCard, borderTop: '2px solid rgba(148,163,184,0.3)' }}>
            <MinusCircle size={20} weight="duotone" style={{ color: '#94a3b8' }} />
            <div>
              <span style={estilos.infograficoValor}>{totalVazios}</span>
              <span style={estilos.infograficoLabel}>Campos vazios</span>
            </div>
          </div>
        </div>

        {/* Header com legenda */}
        <div style={estilos.legendaComparacao}>
          <span style={estilos.legendaItem}>
            <Warning size={14} weight="fill" style={{ color: 'var(--warning, #f59e0b)' }} />
            Divergente — escolha o valor
          </span>
          <span style={estilos.legendaItem}>
            <CheckCircle size={14} weight="fill" style={{ color: 'var(--success, #22c55e)' }} />
            Igual — será mantido
          </span>
        </div>

        {/* Grupos colapsáveis */}
        {grupos.map((grupo, idx) => (
          <GrupoColapsavel
            key={grupo.grupo}
            grupo={grupo}
            camposEscolhidos={camposEscolhidos}
            onMudarCampo={handleMudarCampo}
            inicialmenteAberto={idx === 0 || grupo.divergentes.length > 0}
          />
        ))}
      </div>
    )
  }

  function renderPasso3() {
    if (concluido) {
      return (
        <div style={estilos.centrado}>
          <Check size={48} weight="duotone" style={{ color: 'var(--success, #22c55e)' }} />
          <p style={estilos.sucessoTexto}>Consolidação realizada com sucesso!</p>
        </div>
      )
    }

    if (!preview) return null

    return (
      <div style={estilos.passo3}>
        <div style={estilos.confirmacaoCard}>
          <GitMerge size={24} weight="duotone" style={{ color: 'var(--accent, #6366f1)' }} />
          <div style={estilos.confirmacaoTexto}>
            <p style={estilos.confirmacaoTitulo}>Confirmar consolidação</p>
            <p style={estilos.confirmacaoDesc}>
              {pedidosSelecionados.length} pedidos serão unificados em <strong>{numeroPedido}</strong>.
              Os pedidos originais serão arquivados (soft delete).
            </p>
          </div>
        </div>

        {/* Resumo das escolhas para divergências */}
        {totalDivergencias > 0 && (
          <div style={estilos.resumoEscolhas}>
            <span style={estilos.resumoEscolhasTitulo}>
              Valores escolhidos para {totalDivergencias} campo{totalDivergencias !== 1 ? 's' : ''} divergente{totalDivergencias !== 1 ? 's' : ''}:
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
          <span style={estilos.pedidosOrigemTitulo}>Pedidos de origem (serão arquivados):</span>
          <div style={estilos.pedidosOrigemLista}>
            {pedidosSelecionados.map(p => (
              <span key={p.id} style={estilos.pedidoOrigemChip}>{p.numero_pedido}</span>
            ))}
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
      .mpg-dialog > div:last-child {
        justify-content: flex-end !important;
        gap: 0.75rem !important;
      }
      .mpg-dialog > div:last-child > div > span {
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
      titulo={`Consolidar ${pedidosSelecionados.length} Pedidos`}
      icone={<GitMerge size={22} weight="duotone" />}
      subtitulo="Unifique pedidos selecionados em um único pedido consolidado"
      aberto={true}
      passos={PASSOS}
      passoAtual={passoAtual}
      onProximo={handleProximo}
      onVoltar={handleVoltar}
      onFechar={onFechar}
      podeAvancar={podeAvancar}
      labelBotaoFinal="Consolidar"
      labelProximo="Próximo"
      tamanho="xl"
      ocultarStepper={concluido}
      ocultarFooter={concluido}
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
    gridTemplateColumns: 'repeat(4, 1fr)',
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
    gap: '1.25rem',
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

  // Infográfico passo 2
  infograficoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.625rem',
  } as React.CSSProperties,
  infograficoCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.875rem 0.875rem',
    background: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(99, 102, 241, 0.12)',
    borderRadius: 'var(--radius-md)',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
  } as React.CSSProperties,
  infograficoValor: {
    display: 'block',
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#fff',
    lineHeight: 1.2,
    marginBottom: '0.125rem',
  } as React.CSSProperties,
  infograficoLabel: {
    display: 'block',
    fontSize: '0.6875rem',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    fontWeight: 600,
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
  sucessoTexto: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--success, #22c55e)',
    margin: 0,
  } as React.CSSProperties,
} as const
