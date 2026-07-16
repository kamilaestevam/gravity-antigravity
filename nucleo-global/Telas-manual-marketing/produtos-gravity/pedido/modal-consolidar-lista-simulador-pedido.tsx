import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  CaretDown,
  CaretRight,
  CheckCircle,
  CubeTransparent,
  GitMerge,
  Info,
  ListChecks,
  MinusCircle,
  Package,
  Warning,
  WarningDiamond,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { GravityLoader } from '../../../Feedback/gravity-loader-global/src/GravityLoader'
import { ModalPassoPassoGlobal } from '../../../Modais/modal-passo-passo-global/src/ModalPassoPassoGlobal'
import type { PassoConfig } from '../../../Modais/modal-passo-passo-global/src/ModalPassoPassoGlobal'
import '../../../Modais/modal-passo-passo-global/src/modal-passo-passo.css'
import {
  agruparCamposConsolidacaoSimulador,
  consolidarSelecaoListaSimulador,
  fmtValorCampoConsolidacao,
  gerarPreviewConsolidacaoListaSimulador,
  type CampoDivergenteConsolidacaoSimulador,
  type CampoIgualConsolidacaoSimulador,
  type GrupoCamposConsolidacaoSimulador,
  type PreviewConsolidacaoCompletoSimulador,
  type ResumoConsolidacaoListaSimulador,
} from './consolidar-lista-simulador-pedido'
import type { LinhaListaPedidoSimulador } from './dados-lista-simulador-pedido'
import { formatarValorListaPedidoSimulador } from './dados-lista-simulador-pedido'
import { filtrarItensAvulsosSelecao } from './duplicar-excluir-lista-simulador-pedido'
import type { SelecaoListaSimuladorPedido } from './regras-acoes-barra-lista-simulador-pedido'
import {
  interpolarTextoConsolidar,
  TEXTOS_MODAL_CONSOLIDAR_SIMULADOR_PEDIDO as T,
} from './textos-modal-consolidar-simulador-pedido'
import './modal-consolidar-lista-simulador-pedido.css'

type Props = {
  aberto: boolean
  linhas: readonly LinhaListaPedidoSimulador[]
  selecao: SelecaoListaSimuladorPedido
  onFechar: () => void
  onConcluido: (
    linhas: LinhaListaPedidoSimulador[],
    resumo: ResumoConsolidacaoListaSimulador,
    idNovoPedido: string,
  ) => void
  onEstadoTutorialChange?: (estado: { passo: number; concluido: boolean }) => void
}

type Passo = 1 | 2 | 3
type FiltroCampos = 'todos' | 'divergentes' | 'iguais' | 'vazios'

function GrupoColapsavelConsolidar({
  grupo,
  camposEscolhidos,
  onMudarCampo,
  inicialmenteAberto = false,
  idCampoDestaqueTutorial,
}: {
  grupo: GrupoCamposConsolidacaoSimulador
  camposEscolhidos: Record<string, string | number | null>
  onMudarCampo: (campo: string, valor: string | number | null) => void
  inicialmenteAberto?: boolean
  idCampoDestaqueTutorial?: string | null
}) {
  const [aberto, setAberto] = useState(inicialmenteAberto)
  const iguaisComDado = grupo.iguais.filter((c) => c.valor != null && c.valor !== '')
  const iguaisVazios = grupo.iguais.filter((c) => c.valor == null || c.valor === '')

  return (
    <div className="modal-consolidar__grupo" data-sds-tutorial-alvo="pedido-consolidar-grupo">
      <button type="button" className="modal-consolidar__grupo-header" onClick={() => setAberto((v) => !v)} aria-expanded={aberto}>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {aberto ? <CaretDown size={14} weight="bold" /> : <CaretRight size={14} weight="bold" />}
          <span className="modal-consolidar__grupo-nome">{grupo.grupo}</span>
        </span>
        <span style={{ display: 'flex', gap: '0.375rem' }}>
          {grupo.divergentes.length > 0 && (
            <span className="modal-consolidar__badge modal-consolidar__badge--divergente">
              <Warning size={12} weight="fill" />
              {grupo.divergentes.length}
            </span>
          )}
          {iguaisComDado.length > 0 && (
            <span className="modal-consolidar__badge modal-consolidar__badge--igual">
              <CheckCircle size={12} weight="fill" />
              {iguaisComDado.length}
            </span>
          )}
        </span>
      </button>
      {aberto && (
        <div className="modal-consolidar__grupo-corpo">
          {grupo.divergentes.map((campo) => (
            <LinhaDivergente
              key={campo.campo}
              campo={campo}
              valorEscolhido={camposEscolhidos[campo.campo] ?? campo.valor_sugerido}
              onMudar={onMudarCampo}
              destaqueTutorial={campo.campo === idCampoDestaqueTutorial}
            />
          ))}
          {iguaisComDado.map((campo) => (
            <LinhaIgual key={campo.campo} campo={campo} />
          ))}
          {iguaisVazios.map((campo) => (
            <LinhaIgual key={campo.campo} campo={campo} vazio />
          ))}
        </div>
      )}
    </div>
  )
}

function LinhaDivergente({
  campo,
  valorEscolhido,
  onMudar,
  destaqueTutorial = false,
}: {
  campo: CampoDivergenteConsolidacaoSimulador
  valorEscolhido: string | number | null
  onMudar: (campo: string, valor: string | number | null) => void
  destaqueTutorial?: boolean
}) {
  return (
    <div
      className="modal-consolidar__linha"
      {...(destaqueTutorial ? { 'data-sds-tutorial-alvo': 'pedido-consolidar-campo-divergente' } : {})}
    >
      <span className="modal-consolidar__linha-nome">{campo.rotulo}</span>
      <SelectGlobal
        buscavel={false}
        tamanho="compacto"
        opcoes={campo.valores.map((v) => ({
          valor: String(v.valor ?? ''),
          rotulo: `${fmtValorCampoConsolidacao(v.valor)} (${v.numero_pedido})`,
        }))}
        valor={String(valorEscolhido ?? '')}
        aoMudarValor={(v) => {
          const opt = campo.valores.find((vl) => String(vl.valor) === String(v))
          onMudar(campo.campo, opt?.valor ?? (v != null ? String(v) : null))
        }}
        aria-label={`Valor consolidado para ${campo.rotulo}`}
      />
      <span className="modal-consolidar__badge modal-consolidar__badge--divergente">
        <Warning size={13} weight="fill" />
        {interpolarTextoConsolidar(T.badge_divergencia, { count: campo.valores.length })}
      </span>
    </div>
  )
}

function LinhaIgual({ campo, vazio = false }: { campo: CampoIgualConsolidacaoSimulador; vazio?: boolean }) {
  const temDado = !vazio && campo.valor != null && campo.valor !== ''
  return (
    <div className="modal-consolidar__linha" style={temDado ? undefined : { opacity: 0.55 }}>
      <span className="modal-consolidar__linha-nome">{campo.rotulo}</span>
      <span>{fmtValorCampoConsolidacao(campo.valor)}</span>
      <span className={`modal-consolidar__badge ${temDado ? 'modal-consolidar__badge--igual' : 'modal-consolidar__badge--vazio'}`}>
        {temDado ? <CheckCircle size={13} weight="fill" /> : <MinusCircle size={13} weight="fill" />}
        {temDado ? T.badge_igual : T.badge_vazio}
      </span>
    </div>
  )
}

export function ModalConsolidarListaSimuladorPedido({
  aberto,
  linhas,
  selecao,
  onFechar,
  onConcluido,
  onEstadoTutorialChange,
}: Props) {
  const [selecaoCongelada, setSelecaoCongelada] = useState(selecao)
  const [linhasCongeladas, setLinhasCongeladas] = useState(linhas)
  const modalAbertoAnteriorRef = useRef(false)

  const [passo, setPasso] = useState<Passo>(1)
  const [preview, setPreview] = useState<PreviewConsolidacaoCompletoSimulador | null>(null)
  const [carregandoPreview, setCarregandoPreview] = useState(false)
  const [numeroPedido, setNumeroPedido] = useState('')
  const [camposEscolhidos, setCamposEscolhidos] = useState<Record<string, string | number | null>>({})
  const [fundirItens, setFundirItens] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [concluido, setConcluido] = useState(false)
  const [resumoFinal, setResumoFinal] = useState<ResumoConsolidacaoListaSimulador | null>(null)
  const [filtroCampos, setFiltroCampos] = useState<FiltroCampos>('todos')
  const [filtroPedidoOrigem, setFiltroPedidoOrigem] = useState<string | null>(null)

  const pedidoIdsInteiros = useMemo(() => selecaoCongelada.pedidos.map((p) => p.id), [selecaoCongelada.pedidos])
  const pedidoIdsParciais = useMemo(() => {
    const avulsos = new Set(filtrarItensAvulsosSelecao(selecaoCongelada).map(({ pai }) => pai.id))
    return [...avulsos].filter((id) => !pedidoIdsInteiros.includes(id))
  }, [selecaoCongelada, pedidoIdsInteiros])
  const totalPedidos = pedidoIdsInteiros.length + pedidoIdsParciais.length

  const passos = useMemo<PassoConfig[]>(
    () => [
      { id: 1, label: T.passo1_label },
      { id: 2, label: T.passo2_label },
      { id: 3, label: T.passo3_label },
    ],
    [],
  )

  useEffect(() => {
    if (!aberto) {
      modalAbertoAnteriorRef.current = false
      return
    }
    if (modalAbertoAnteriorRef.current) return
    modalAbertoAnteriorRef.current = true

    setSelecaoCongelada(selecao)
    setLinhasCongeladas(linhas)
    setPasso(1)
    setConcluido(false)
    setResumoFinal(null)
    setConfirmando(false)
    setFiltroCampos('todos')
    setFiltroPedidoOrigem(null)
    setFundirItens(false)
    setCarregandoPreview(true)
    const timer = window.setTimeout(() => {
      const data = gerarPreviewConsolidacaoListaSimulador(linhas, selecao)
      setPreview(data)
      setNumeroPedido(data.numero_sugerido)
      const iniciais: Record<string, string | number | null> = {}
      for (const campo of data.campos_divergentes) {
        iniciais[campo.campo] = campo.valor_sugerido
      }
      setCamposEscolhidos(iniciais)
      setCarregandoPreview(false)
    }, 280)
    return () => window.clearTimeout(timer)
  }, [aberto, linhas, selecao])

  useEffect(() => {
    onEstadoTutorialChange?.({ passo, concluido })
  }, [passo, concluido, onEstadoTutorialChange])

  const grupos = useMemo(() => {
    if (!preview) return []
    return agruparCamposConsolidacaoSimulador(preview.campos_divergentes, preview.campos_iguais)
  }, [preview])

  const gruposFiltrados = useMemo(() => {
    return grupos
      .map((grupo) => {
        let divergentes = grupo.divergentes
        if (filtroPedidoOrigem) {
          divergentes = divergentes.filter((c) => c.valores.some((v) => v.pedido_id === filtroPedidoOrigem))
        }
        if (filtroCampos === 'iguais' || filtroCampos === 'vazios') divergentes = []
        const iguaisComDado = grupo.iguais.filter((c) => c.valor != null && c.valor !== '')
        const iguaisVazio = grupo.iguais.filter((c) => c.valor == null || c.valor === '')
        let iguais = grupo.iguais
        if (filtroPedidoOrigem) iguais = []
        else if (filtroCampos === 'divergentes') iguais = []
        else if (filtroCampos === 'iguais') iguais = iguaisComDado
        else if (filtroCampos === 'vazios') iguais = iguaisVazio
        return { ...grupo, divergentes, iguais }
      })
      .filter((g) => g.divergentes.length > 0 || g.iguais.length > 0)
  }, [grupos, filtroCampos, filtroPedidoOrigem])

  const idPrimeiroCampoDivergenteTutorial = useMemo(() => {
    for (const grupo of gruposFiltrados) {
      const primeiro = grupo.divergentes[0]
      if (primeiro) return primeiro.campo
    }
    return null
  }, [gruposFiltrados])

  const podeProsseguir = useMemo(() => {
    if (carregandoPreview || !preview) return false
    if (preview.conflito_tipo_operacao) return false
    if (passo === 1) return numeroPedido.trim().length > 0
    return true
  }, [carregandoPreview, preview, passo, numeroPedido])

  const handleMudarCampo = useCallback((campo: string, valor: string | number | null) => {
    setCamposEscolhidos((prev) => ({ ...prev, [campo]: valor }))
  }, [])

  const voltar = useCallback(() => {
    if (passo > 1) setPasso((p) => (p - 1) as Passo)
  }, [passo])

  const avancar = useCallback(() => {
    if (passo < 3) setPasso((p) => (p + 1) as Passo)
  }, [passo])

  const handleConfirmar = useCallback(() => {
    if (!preview) return
    setConfirmando(true)
    window.setTimeout(() => {
      try {
        const resultado = consolidarSelecaoListaSimulador(linhasCongeladas, selecaoCongelada, {
          numeroPedido: numeroPedido.trim(),
          camposEscolhidos,
          fundirItensMesmoPartNumber: fundirItens,
        })
        setResumoFinal(resultado.resumo)
        setConcluido(true)
        onConcluido(resultado.linhas, resultado.resumo, resultado.idNovoPedido)
        onFechar()
      } finally {
        setConfirmando(false)
      }
    }, 400)
  }, [preview, linhasCongeladas, selecaoCongelada, numeroPedido, camposEscolhidos, fundirItens, onConcluido, onFechar])

  const handleFecharResultado = useCallback(() => {
    onFechar()
  }, [onFechar])

  if (!aberto) return null

  const titulo = interpolarTextoConsolidar(T.titulo, { count: totalPedidos })
  const totalDivergencias = preview?.campos_divergentes.length ?? 0
  const totalIguais = preview?.campos_iguais.length ?? 0
  const inteiros = selecaoCongelada.pedidos.length
  const parciais = pedidoIdsParciais.length

  const footer = concluido ? (
    <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
      <span data-sds-tutorial-alvo="pedido-consolidar-fechar" style={{ display: 'inline-flex' }}>
        <BotaoGlobal variante="primario" tamanho="medio" onClick={handleFecharResultado}>
          {T.fechar}
        </BotaoGlobal>
      </span>
    </div>
  ) : (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
      <BotaoGlobal variante="fantasma" tamanho="padrao" onClick={passo === 1 ? onFechar : voltar} disabled={confirmando}>
        {passo === 1 ? T.cancelar : T.voltar}
      </BotaoGlobal>
      {passo === 3 ? (
        <span data-sds-tutorial-alvo="pedido-consolidar-confirmar" style={{ display: 'inline-flex' }}>
          <BotaoGlobal variante="primario" tamanho="padrao" onClick={handleConfirmar} disabled={confirmando || !podeProsseguir} carregando={confirmando}>
            {confirmando ? T.consolidando : T.consolidar}
          </BotaoGlobal>
        </span>
      ) : (
        <span data-sds-tutorial-alvo="pedido-consolidar-proximo" style={{ display: 'inline-flex' }}>
          <BotaoGlobal
            variante="primario"
            tamanho="padrao"
            onClick={avancar}
            disabled={!podeProsseguir || carregandoPreview}
            carregando={carregandoPreview}
            iconeDireita={<ArrowRight size={14} weight="bold" />}
          >
            {T.proximo}
          </BotaoGlobal>
        </span>
      )}
    </div>
  )

  return (
    <ModalPassoPassoGlobal
      titulo={titulo}
      icone={<GitMerge size={20} weight="duotone" />}
      subtitulo={T.subtitulo}
      aberto={aberto}
      passos={passos}
      passoAtual={passo}
      onProximo={() => undefined}
      onVoltar={() => undefined}
      onFechar={concluido ? handleFecharResultado : onFechar}
      tamanho="xl"
      ocultarStepper={concluido}
      classNameDialog="modal-consolidar"
      footerCustom={footer}
    >
      <div className="modal-consolidar__corpo">
        {carregandoPreview && !preview ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
            <GravityLoader texto={T.carregando} tamanho="sm" />
          </div>
        ) : preview && concluido && resumoFinal ? (
          <div className="modal-consolidar__resultado" data-sds-tutorial-alvo="pedido-consolidar-resultado">
            <div className="modal-consolidar__resultado-banner">
              <CheckCircle size={20} weight="fill" color="#22c55e" />
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>
                {interpolarTextoConsolidar(T.resultado_banner, {
                  numero: resumoFinal.numeroConsolidado,
                  itens: resumoFinal.itensConsolidados,
                  pedidos: resumoFinal.pedidosOrigem,
                })}
              </p>
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
              {T.pedidos_origem_arquivados_resultado}
            </p>
            {selecaoCongelada.pedidos.map((p) => (
              <div key={p.id} className="modal-consolidar__resultado-card">
                <div>
                  <strong>{p.numeroPedido}</strong>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {interpolarTextoConsolidar(T.detalhe_inteiro, {
                      count: preview.pedidos_info.find((pi) => pi.id === p.id)?.total_itens ?? 0,
                    })}
                  </div>
                </div>
                <span style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 600 }}>OK</span>
              </div>
            ))}
            {totalDivergencias > 0 && (
              <>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                  {T.campos_divergentes_resolvidos}
                </p>
                {preview.campos_divergentes.map((campo) => (
                  <div key={campo.campo} className="modal-consolidar__resultado-card">
                    <div>
                      <strong>{campo.rotulo}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {fmtValorCampoConsolidacao(camposEscolhidos[campo.campo] ?? campo.valor_sugerido)}
                      </div>
                    </div>
                    <span style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 600 }}>OK</span>
                  </div>
                ))}
              </>
            )}
          </div>
        ) : preview ? (
          <>
            {passo === 1 && (
              <div data-sds-tutorial-alvo="pedido-consolidar-passo1">
                {preview.conflito_tipo_operacao && (
                  <div className="modal-consolidar__banner-conflito">
                    <WarningDiamond size={18} weight="duotone" style={{ flexShrink: 0 }} />
                    <div>
                      <strong>{T.conflito_titulo}</strong>
                      <p style={{ margin: '0.25rem 0 0' }}>{T.conflito_msg}</p>
                    </div>
                  </div>
                )}
                <div className="modal-consolidar__secao">
                  <span className="modal-consolidar__secao-titulo">{T.secao_configuracao}</span>
                  <label className="modal-consolidar__secao-titulo" style={{ textTransform: 'none', letterSpacing: 0, fontSize: '0.8125rem', color: '#f1f5f9' }}>
                    {T.numero_label} *
                  </label>
                  <div className="modal-consolidar__campo-alvo" data-sds-tutorial-alvo="pedido-consolidar-numero">
                    <input
                      id="pds-consolidar-numero"
                      type="text"
                      className="modal-consolidar__input"
                      value={numeroPedido}
                      onChange={(e) => setNumeroPedido(e.target.value)}
                      placeholder={T.numero_placeholder}
                      maxLength={100}
                    />
                  </div>
                  <span className="modal-consolidar__hint">
                    <Info size={14} weight="fill" />
                    {T.numero_hint}
                  </span>
                  {preview.itens.some((i) => i.pode_fundir) && (
                    <label className="modal-consolidar__checkbox-label" data-sds-tutorial-alvo="pedido-consolidar-fundir">
                      <input type="checkbox" checked={fundirItens} onChange={(e) => setFundirItens(e.target.checked)} />
                      {T.fundir_part_number}
                    </label>
                  )}
                </div>
                <div className="modal-consolidar__secao" data-sds-tutorial-alvo="pedido-consolidar-resumo">
                  <span className="modal-consolidar__secao-titulo">{T.secao_preview}</span>
                  <div className="modal-consolidar__stats">
                    <TooltipGlobal titulo={T.stat_pedidos} descricao={`${totalPedidos} pedido(s) selecionado(s)`}>
                      <div className="modal-consolidar__stat-card">
                        <Package size={20} weight="duotone" color="#94a3b8" />
                        <div>
                          <span className="modal-consolidar__stat-valor">{totalPedidos}</span>
                          <span className="modal-consolidar__stat-label">{T.stat_pedidos}</span>
                        </div>
                      </div>
                    </TooltipGlobal>
                    <TooltipGlobal titulo={T.stat_itens} descricao={`${preview.itens.length} item(ns) no consolidado`}>
                      <div className="modal-consolidar__stat-card">
                        <ListChecks size={20} weight="duotone" color="#94a3b8" />
                        <div>
                          <span className="modal-consolidar__stat-valor">{preview.itens.length}</span>
                          <span className="modal-consolidar__stat-label">{T.stat_itens}</span>
                        </div>
                      </div>
                    </TooltipGlobal>
                    <div className="modal-consolidar__stat-card">
                      <Package size={20} weight="duotone" color="#4ade80" />
                      <div>
                        <span className="modal-consolidar__stat-valor">{inteiros}</span>
                        <span className="modal-consolidar__stat-label">{T.stat_pedidos_inteiros}</span>
                      </div>
                    </div>
                    <div className="modal-consolidar__stat-card">
                      <CubeTransparent size={20} weight="duotone" color={parciais > 0 ? '#fbbf24' : '#94a3b8'} />
                      <div>
                        <span className="modal-consolidar__stat-valor">{parciais}</span>
                        <span className="modal-consolidar__stat-label">{T.stat_pedidos_parciais}</span>
                      </div>
                    </div>
                    <div className="modal-consolidar__stat-card">
                      <Warning size={20} weight="duotone" color={totalDivergencias > 0 ? '#fbbf24' : '#94a3b8'} />
                      <div>
                        <span className="modal-consolidar__stat-valor">{totalDivergencias}</span>
                        <span className="modal-consolidar__stat-label">{T.stat_divergencias}</span>
                      </div>
                    </div>
                    <div className="modal-consolidar__stat-card">
                      <CheckCircle size={20} weight="duotone" color="#4ade80" />
                      <div>
                        <span className="modal-consolidar__stat-valor">{totalIguais}</span>
                        <span className="modal-consolidar__stat-label">{T.stat_campos_iguais}</span>
                      </div>
                    </div>
                  </div>
                  {preview.valor_total_soma > 0 && (
                    <div className="modal-consolidar__valor-total">
                      <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>{T.valor_total_consolidado}</span>
                      <strong>
                        {preview.moeda} {formatarValorListaPedidoSimulador(preview.valor_total_soma)}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {passo === 2 && (
              <div data-sds-tutorial-alvo="pedido-consolidar-passo2">
                <div
                  className="modal-consolidar__aviso-comparar"
                  data-sds-tutorial-alvo="pedido-consolidar-aviso-pedidos-diferentes"
                >
                  <Info size={18} weight="duotone" style={{ flexShrink: 0, color: '#818cf8' }} />
                  <div>
                    <strong>{T.comparar_aviso_titulo}</strong>
                    <p>{T.comparar_aviso_desc}</p>
                  </div>
                </div>
                <div className="modal-consolidar__filtros">
                  {(['todos', 'divergentes', 'iguais', 'vazios'] as FiltroCampos[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      className={`modal-consolidar__filtro${filtroCampos === f ? ` modal-consolidar__filtro--ativo${f === 'divergentes' ? ' modal-consolidar__filtro--divergente' : ''}${f === 'iguais' ? ' modal-consolidar__filtro--igual' : ''}` : ''}`}
                      onClick={() => setFiltroCampos(f)}
                    >
                      {f === 'todos' && T.filtro_todos}
                      {f === 'divergentes' && T.filtro_divergentes}
                      {f === 'iguais' && T.filtro_iguais}
                      {f === 'vazios' && T.filtro_vazios}
                    </button>
                  ))}
                </div>
                {preview.pedidos_info.length >= 2 && (
                  <div className="modal-consolidar__origem-row">
                    <span className="modal-consolidar__origem-label">{T.origem_label}</span>
                    <div className="modal-consolidar__origem-select" data-sds-tutorial-alvo="pedido-consolidar-filtro-origem">
                      <SelectGlobal
                        buscavel
                        tamanho="compacto"
                        placeholder={T.filtro_origem_placeholder}
                        opcoes={[
                          {
                            valor: '__todos__',
                            rotulo: interpolarTextoConsolidar(T.todos_pedidos, { count: preview.pedidos_info.length }),
                          },
                          ...preview.pedidos_info.map((pi) => ({ valor: pi.id, rotulo: pi.numero })),
                        ]}
                        valor={filtroPedidoOrigem ?? '__todos__'}
                        aoMudarValor={(v) => setFiltroPedidoOrigem(v === '__todos__' ? null : String(v))}
                      />
                    </div>
                  </div>
                )}
                {gruposFiltrados.map((grupo) => (
                  <GrupoColapsavelConsolidar
                    key={grupo.grupo}
                    grupo={grupo}
                    camposEscolhidos={camposEscolhidos}
                    onMudarCampo={handleMudarCampo}
                    inicialmenteAberto={grupo.divergentes.length > 0}
                    idCampoDestaqueTutorial={idPrimeiroCampoDivergenteTutorial}
                  />
                ))}
              </div>
            )}

            {passo === 3 && !concluido && (
              <div data-sds-tutorial-alvo="pedido-consolidar-dialog">
                <div className="modal-consolidar__confirmacao">
                  <GitMerge size={24} weight="duotone" color="#818cf8" />
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>{T.confirmacao_titulo}</p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#94a3b8' }}>
                      {interpolarTextoConsolidar(T.confirmacao_desc, { count: totalPedidos, numero: numeroPedido })}
                    </p>
                  </div>
                </div>
                {totalDivergencias > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                      {interpolarTextoConsolidar(T.resumo_escolhas, { count: totalDivergencias })}
                    </p>
                    {preview.campos_divergentes.map((campo) => (
                      <div key={campo.campo} className="modal-consolidar__resultado-card">
                        <span>{campo.rotulo}</span>
                        <strong>{fmtValorCampoConsolidacao(camposEscolhidos[campo.campo] ?? campo.valor_sugerido)}</strong>
                      </div>
                    ))}
                  </div>
                )}
                <p style={{ margin: '1rem 0 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                  {T.pedidos_origem_arquivados}
                </p>
                <div className="modal-consolidar__chips">
                  {selecaoCongelada.pedidos.map((p) => (
                    <span key={p.id} className="modal-consolidar__chip">
                      {p.numeroPedido} {T.chip_inteiro}
                    </span>
                  ))}
                  {pedidoIdsParciais.map((id) => {
                    const info = preview.pedidos_info.find((pi) => pi.id === id)
                    const n = filtrarItensAvulsosSelecao(selecaoCongelada).filter(({ pai }) => pai.id === id).length
                    return (
                      <span key={id} className="modal-consolidar__chip modal-consolidar__chip--parcial">
                        {info?.numero ?? id} {interpolarTextoConsolidar(T.chip_parcial, { count: n })}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </ModalPassoPassoGlobal>
  )
}
