/**
 * ConferenciaRiscosAduaneirosNovaLeituraSmartRead — V1 + LLM + Cadastros (piloto)
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CaretDown,
  CircleNotch,
  FileText,
  Info,
  MagnifyingGlass,
  Scales,
  ShieldCheck,
  ShieldWarning,
  Sparkle,
  Warning,
  WarningCircle,
  X,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import { smartReadApi } from '../../shared/api'
import {
  aplicarCorrecaoSugeridaPadraoRisco,
  montarDocumentosAnaliseRiscoDeArquivosLocais,
} from '../../shared/analisar-riscos-aduaneiros-leitura-smart-read'
import {
  obterCacheAnaliseRiscosSessaoSmartRead,
  salvarCacheAnaliseRiscosSessaoSmartRead,
} from '../../shared/cache-analise-riscos-sessao-smart-read'
import { executarAuditoriaV1AnaliseRiscosLeitura } from '../../../../shared/analise-riscos-leitura-smart-read'
import type { RegraAuditoriaV1 } from '../../../../shared/analise-riscos-leitura-smart-read'
import { montarResumoGeralChecklistInvoices } from '../../../../shared/montar-checklist-matriz-invoice-smart-read'
import { ModalChecklistConferenciaNovaLeituraSmartRead } from './modal-checklist-conferencia-nova-leitura-smart-read'
import type {
  CategoriaRiscoAduaneiro,
  RiscoAduaneiroLeitura,
  SeveridadeRiscoAduaneiro,
} from '../../shared/analisar-riscos-aduaneiros-leitura-smart-read'
import type { SecaoMatrizInvoice } from '../../../../shared/matriz-validacao-invoice-smart-read'
import {
  ORDEM_SECOES_MATRIZ_INVOICE,
  ROTULO_SECAO_MATRIZ_INVOICE,
} from '../../../../shared/matriz-validacao-invoice-smart-read'
import { ehRiscoClassificacaoFiscal } from '../../../../shared/texto-analise-riscos-leitura-smart-read'
import { EvidenciaVisualRiscoNovaLeituraSmartRead } from './evidencia-visual-risco-nova-leitura-smart-read'
import { AcoesCorrecaoRiscoNovaLeituraSmartRead } from './acoes-correcao-risco-nova-leitura-smart-read'
import type { ContextoEvidenciaRiscoNovaLeitura } from '../../shared/contexto-evidencia-risco-nova-leitura-smart-read'
import '../../../../../../../nucleo-global/Tabelas/tabela-virtual-global/src/FiltrosColuna/FiltrosColuna.css'
import '../../../../../processo/client/src/pages/dados-tecnicos/DadosTecnicos.css'

import type { ResumoUsoLlmLeituraSmartRead, UsoLlmChamadaLeituraSmartRead } from '../../../../shared/uso-llm-leitura-smart-read'

type Props = {
  arquivos: ArquivoLocalNovaLeitura[]
  onVerEvidencia?: (ctx: ContextoEvidenciaRiscoNovaLeitura) => void
  idLeituraLegado?: string | null
  onTokensAtualizados?: (
    resumo: ResumoUsoLlmLeituraSmartRead | null | undefined,
    chamada?: UsoLlmChamadaLeituraSmartRead | null,
  ) => void
  onIaInicio?: () => void
  onIaFim?: () => void
}

type FiltroRisco = 'todos' | SeveridadeRiscoAduaneiro

const ROTULO_FILTRO_RISCO: Record<FiltroRisco, string> = {
  todos: 'Todos os riscos',
  critico: 'Críticos',
  atencao: 'Atenção',
  informativo: 'Informativos',
}

const ROTULO_CATEGORIA: Record<CategoriaRiscoAduaneiro, string> = {
  ncm: 'NCM e classificação fiscal',
  cnpj: 'CNPJ e identificação',
  incoterm: 'Incoterm e termos comerciais',
  documental: 'Documental',
  cruzado: 'Cruzamento entre documentos',
  matematico: 'Totais e matemática',
  comercial: 'Comercial',
  normativo: 'Normativo / Siscomex',
}

function rotuloSeveridade(severidade: SeveridadeRiscoAduaneiro): string {
  switch (severidade) {
    case 'critico':
      return 'Crítico'
    case 'atencao':
      return 'Atenção'
    default:
      return 'Informativo'
  }
}

function iconeCategoria(categoria: CategoriaRiscoAduaneiro) {
  switch (categoria) {
    case 'normativo':
    case 'ncm':
      return <Scales weight="duotone" size={18} />
    case 'documental':
      return <FileText weight="duotone" size={18} />
    default:
      return <ShieldWarning weight="duotone" size={18} />
  }
}

function filtrarRiscos(
  riscos: RiscoAduaneiroLeitura[],
  filtro: FiltroRisco,
  busca: string,
): RiscoAduaneiroLeitura[] {
  const buscaNorm = busca.trim().toLowerCase()
  return riscos.filter((risco) => {
    if (filtro !== 'todos' && risco.severidade !== filtro) return false
    if (!buscaNorm) return true
    return (
      risco.titulo.toLowerCase().includes(buscaNorm) ||
      risco.motivo.toLowerCase().includes(buscaNorm) ||
      risco.analise.toLowerCase().includes(buscaNorm) ||
      (risco.correcao_sugerida?.toLowerCase().includes(buscaNorm) ?? false) ||
      risco.evidencias.some(
        (ev) =>
          ev.documento.toLowerCase().includes(buscaNorm) ||
          (ev.campo?.toLowerCase().includes(buscaNorm) ?? false) ||
          (ev.valor?.toLowerCase().includes(buscaNorm) ?? false),
      )
    )
  })
}

function LinhaRisco({
  risco: riscoBruto,
  arquivos,
  onVerEvidencia,
  onIrConferenciaCampos,
  selecionado,
  onToggleSelecao,
  numero,
  aguardandoClassificacao = false,
}: {
  risco: RiscoAduaneiroLeitura
  arquivos: ArquivoLocalNovaLeitura[]
  onVerEvidencia?: (ctx: ContextoEvidenciaRiscoNovaLeitura) => void
  onIrConferenciaCampos?: (campo: string | null) => void
  selecionado: boolean
  onToggleSelecao: (id: string) => void
  numero: number
  aguardandoClassificacao?: boolean
}) {
  const [expandido, setExpandido] = useState(riscoBruto.severidade === 'critico')
  const risco = aplicarCorrecaoSugeridaPadraoRisco(riscoBruto)
  const campoConferencia = risco.evidencias.find((ev) => ev.campo)?.campo ?? null
  const contextoEvidencia = {
    tituloRisco: risco.titulo,
    motivo: risco.motivo,
    analise: risco.analise,
    correcao: risco.correcao_sugerida,
  }

  return (
    <article
      id={`sr-risco-${risco.id}`}
      className={`sr-conf-risco-linha sr-conf-risco-linha--${risco.severidade}${selecionado ? ' sr-conf-risco-linha--selecionado' : ''}${expandido ? '' : ' sr-conf-risco-linha--colapsada'}`}
    >
      <div className="sr-conf-risco-linha-topo">
        <span className="sr-conf-risco-numero" aria-label={`Risco ${numero}`}>
          {String(numero).padStart(2, '0')}
        </span>
        <label
          className="sr-conf-risco-selecao"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={selecionado}
            onChange={() => onToggleSelecao(risco.id)}
            aria-label={`Selecionar risco: ${risco.titulo}`}
          />
        </label>
        <button
          type="button"
          className="sr-conf-risco-linha-toggle"
          onClick={() => setExpandido((prev) => !prev)}
          aria-expanded={expandido}
          aria-controls={`sr-risco-corpo-${risco.id}`}
        >
          <h3 className="sr-conf-risco-linha-titulo">{risco.titulo}</h3>
          <span className="sr-conf-risco-linha-meta">
            <span className={`sr-conf-risco-badge sr-conf-risco-badge--${risco.severidade}`}>
              {rotuloSeveridade(risco.severidade)}
            </span>
            {risco.id_regra_matriz && (
              <span className="sr-conf-risco-codigo-regra" title="Regra da matriz">
                {risco.id_regra_matriz}
              </span>
            )}
            {risco.origem === 'llm' && (
              <span className="sr-conf-risco-origem sr-conf-risco-origem--llm" title="Enriquecido por IA">
                <Sparkle size={10} weight="fill" aria-hidden />
              </span>
            )}
          </span>
          <CaretDown
            weight="bold"
            size={14}
            className={`sr-conf-risco-linha-caret dt-caret${expandido ? '' : ' dt-caret--colapsado'}`}
            aria-hidden
          />
        </button>
      </div>

      {!expandido && <p className="sr-conf-risco-linha-resumo">{risco.motivo}</p>}

      {expandido && (
        <div id={`sr-risco-corpo-${risco.id}`} className="sr-conf-risco-linha-corpo">
          <div className="sr-conf-risco-detalhe sr-conf-risco-detalhe--compacto">
            <div className="sr-conf-risco-campos-grid sr-conf-risco-campos-grid--vertical">
              <div className="sr-conf-risco-campo">
                <span className="sr-conf-risco-campo-rotulo">Risco</span>
                <p>{risco.motivo}</p>
              </div>
              <div className="sr-conf-risco-campo">
                <span className="sr-conf-risco-campo-rotulo">Análise</span>
                <p>{risco.analise}</p>
              </div>
            </div>
          </div>

          {risco.citacoes_normativas && risco.citacoes_normativas.length > 0 && (
            <div className="sr-conf-risco-evidencias sr-conf-risco-evidencias--compacto">
              <strong>Referências normativas</strong>
              <ul>
                {risco.citacoes_normativas.map((cit, idx) => (
                  <li key={`${risco.id}-cit-${idx}`}>
                    <span className="sr-conf-risco-ev-campo">{cit.referencia}</span>
                    {cit.trecho && <span className="sr-conf-risco-ev-valor">{cit.trecho}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {risco.evidencias.length > 0 && (
            <div className="sr-conf-risco-evidencias-lista sr-conf-risco-evidencias-lista--compacta">
              {risco.evidencias.map((ev, idx) => (
                <EvidenciaVisualRiscoNovaLeituraSmartRead
                  key={`${risco.id}-ev-${idx}`}
                  evidencia={ev}
                  arquivos={arquivos}
                  contextoRisco={contextoEvidencia}
                  onVerEvidencia={onVerEvidencia}
                  compacto
                />
              ))}
            </div>
          )}

          {risco.correcao_sugerida ? (
            <aside
              className="sr-conf-risco-correcao sr-conf-risco-correcao--abaixo sr-conf-risco-correcao--compacto sr-conf-risco-correcao--acionavel"
              aria-label="Correção sugerida"
            >
              <span className="sr-conf-risco-correcao-rotulo">Correção</span>
              <p>{risco.correcao_sugerida}</p>
              {onIrConferenciaCampos && (
                <div className="sr-conf-risco-correcao-acoes">
                  <BotaoGlobal
                    variante="primario"
                    tamanho="pequeno"
                    type="button"
                    onClick={() => onIrConferenciaCampos(campoConferencia)}
                  >
                    Ir para Conferência de Campos
                  </BotaoGlobal>
                </div>
              )}
            </aside>
          ) : (
            aguardandoClassificacao &&
            ehRiscoClassificacaoFiscal(risco.titulo, risco.categoria) && (
              <aside
                className="sr-conf-risco-correcao sr-conf-risco-correcao--abaixo sr-conf-risco-correcao--compacto sr-conf-risco-correcao--pendente"
                aria-label="Classificação fiscal em análise"
              >
                <span className="sr-conf-risco-correcao-rotulo">Classificação fiscal</span>
                <p>
                  <CircleNotch size={14} className="sr-wizard-analise-arquivo-spin" aria-hidden />{' '}
                  IA analisando descrição do item para sugerir NCM/HS…
                </p>
              </aside>
            )
          )}
        </div>
      )}
    </article>
  )
}

type PropsComNavegacao = Props & {
  onIrConferenciaCampos?: (campo: string | null) => void
}

export function ConferenciaRiscosAduaneirosNovaLeituraSmartRead({
  arquivos,
  onVerEvidencia,
  onIrConferenciaCampos,
  idLeituraLegado = null,
  onTokensAtualizados,
  onIaInicio,
  onIaFim,
}: PropsComNavegacao) {
  const requisicaoSeq = useRef(0)
  const [resumo, setResumo] = useState({
    riscos: [] as RiscoAduaneiroLeitura[],
    total: 0,
    criticos: 0,
    atencao: 0,
    informativos: 0,
  })
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<FiltroRisco>('todos')
  const [busca, setBusca] = useState('')
  const [categoriasColapsadas, setCategoriasColapsadas] = useState<Set<string>>(() => new Set())
  const [riscosSelecionados, setRiscosSelecionados] = useState<Set<string>>(() => new Set())
  const [regrasContexto, setRegrasContexto] = useState<RegraAuditoriaV1[]>([])
  const [pipelineConcluido, setPipelineConcluido] = useState(false)
  const [llmHabilitado, setLlmHabilitado] = useState(false)
  const [modalChecklistAberto, setModalChecklistAberto] = useState(false)

  const arquivosAnalisaveis = useMemo(
    () => arquivos.filter((a) => a.status_arquivo_local === 'completo'),
    [arquivos],
  )

  const documentos = useMemo(
    () => montarDocumentosAnaliseRiscoDeArquivosLocais(arquivosAnalisaveis),
    [arquivosAnalisaveis],
  )

  const chaveAnalise = useMemo(
    () =>
      `${idLeituraLegado ?? ''}|${documentos.map((d) => `${d.nome_arquivo}:${d.indice}:${d.tipo_documento}`).join('|')}`,
    [documentos, idLeituraLegado],
  )

  const auditoriaV1Local = useMemo(
    () =>
      documentos.length === 0
        ? null
        : executarAuditoriaV1AnaliseRiscosLeitura(documentos),
    [documentos, chaveAnalise],
  )

  const parametrosChecklist = useMemo(
    () => ({
      regras: regrasContexto,
      riscos: resumo.riscos,
      pipelineConcluido,
      llmHabilitado,
      carregando,
    }),
    [regrasContexto, resumo.riscos, pipelineConcluido, llmHabilitado, carregando],
  )

  const resumoGeralChecklist = useMemo(
    () =>
      documentos.length === 0
        ? null
        : montarResumoGeralChecklistInvoices({ ...parametrosChecklist, documentos }),
    [parametrosChecklist, documentos],
  )

  const contagemChecklist = resumoGeralChecklist?.contagem_global ?? {
    verde: 0,
    amarelo: 0,
    vermelho: 0,
    pendente: 0,
    total: 0,
  }

  const percentualChecklistVerde = resumoGeralChecklist?.percentual_global ?? 0

  const percentualConformidade = useMemo(() => {
    if (resumo.total === 0) return 100
    return Math.round(((resumo.total - resumo.criticos) / resumo.total) * 100)
  }, [resumo.total, resumo.criticos])

  const riscosFiltrados = useMemo(
    () => filtrarRiscos(resumo.riscos, filtro, busca),
    [resumo.riscos, filtro, busca],
  )

  const riscosSelecionadosLista = useMemo(
    () =>
      resumo.riscos
        .filter((r) => riscosSelecionados.has(r.id))
        .map(aplicarCorrecaoSugeridaPadraoRisco),
    [resumo.riscos, riscosSelecionados],
  )

  const todosFiltradosSelecionados =
    riscosFiltrados.length > 0 && riscosFiltrados.every((r) => riscosSelecionados.has(r.id))

  function toggleSelecaoRisco(id: string) {
    setRiscosSelecionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelecionarTodosFiltrados() {
    setRiscosSelecionados((prev) => {
      const next = new Set(prev)
      if (todosFiltradosSelecionados) {
        for (const r of riscosFiltrados) next.delete(r.id)
      } else {
        for (const r of riscosFiltrados) next.add(r.id)
      }
      return next
    })
  }

  const numeracaoRiscos = useMemo(() => {
    const mapa = new Map<string, number>()
    riscosFiltrados.forEach((risco, indice) => mapa.set(risco.id, indice + 1))
    return mapa
  }, [riscosFiltrados])

  const secoesCategoria = useMemo(() => {
    const usaMatriz = riscosFiltrados.some((r) => r.secao_matriz)
    if (usaMatriz) {
      const mapa = new Map<SecaoMatrizInvoice, RiscoAduaneiroLeitura[]>()
      for (const risco of riscosFiltrados) {
        const chave = risco.secao_matriz ?? ('itens_fiscais' as SecaoMatrizInvoice)
        const lista = mapa.get(chave) ?? []
        lista.push(risco)
        mapa.set(chave, lista)
      }
      return ORDEM_SECOES_MATRIZ_INVOICE.filter((secao) => mapa.has(secao)).map((secao) => {
        const riscos = mapa.get(secao) ?? []
        return {
          id: `sr-risco-secao-${secao}`,
          categoria: secao as unknown as CategoriaRiscoAduaneiro,
          titulo: ROTULO_SECAO_MATRIZ_INVOICE[secao],
          riscos,
          criticos: riscos.filter((r) => r.severidade === 'critico').length,
        }
      })
    }

    const mapa = new Map<CategoriaRiscoAduaneiro, RiscoAduaneiroLeitura[]>()
    for (const risco of riscosFiltrados) {
      const lista = mapa.get(risco.categoria) ?? []
      lista.push(risco)
      mapa.set(risco.categoria, lista)
    }
    return [...mapa.entries()]
      .map(([categoria, riscos]) => ({
        id: `sr-risco-cat-${categoria}`,
        categoria,
        titulo: ROTULO_CATEGORIA[categoria],
        riscos,
        criticos: riscos.filter((r) => r.severidade === 'critico').length,
      }))
      .sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'))
  }, [riscosFiltrados])

  const todasColapsadas =
    secoesCategoria.length > 0 && secoesCategoria.every((s) => categoriasColapsadas.has(s.id))

  const chaveSecoesCategoria = useMemo(
    () => secoesCategoria.map((secao) => secao.id).join('|'),
    [secoesCategoria],
  )

  const legendaSegmentosRisco =
    resumo.total === 0
      ? null
      : [
          resumo.criticos > 0 ? `${resumo.criticos} crítico${resumo.criticos === 1 ? '' : 's'}` : null,
          resumo.atencao > 0 ? `${resumo.atencao} atenção` : null,
          resumo.informativos > 0
            ? `${resumo.informativos} informativo${resumo.informativos === 1 ? '' : 's'}`
            : null,
        ]
          .filter((parte): parte is string => parte !== null)
          .join(' · ')

  useEffect(() => {
    if (secoesCategoria.length === 0) {
      setCategoriasColapsadas(new Set())
      return
    }
    setCategoriasColapsadas(new Set(secoesCategoria.slice(1).map((secao) => secao.id)))
  }, [chaveSecoesCategoria, secoesCategoria])

  useEffect(() => {
    if (auditoriaV1Local) {
      setResumo(auditoriaV1Local.resumo)
      setRegrasContexto(auditoriaV1Local.contexto.regras)
      setPipelineConcluido(false)
      setLlmHabilitado(false)
    }
  }, [auditoriaV1Local])

  useEffect(() => {
    if (documentos.length === 0) return

    const emCache = obterCacheAnaliseRiscosSessaoSmartRead(chaveAnalise)
    if (emCache) {
      setResumo(emCache.resumo)
      setRegrasContexto(emCache.contexto_v1.regras)
      setLlmHabilitado(emCache.llm_ativo)
      setAviso(emCache.aviso ?? null)
      setPipelineConcluido(true)
      setCarregando(false)
      onTokensAtualizados?.(emCache.uso_llm_leitura, emCache.uso_llm_chamada)
      return
    }

    const seq = ++requisicaoSeq.current
    setCarregando(true)
    setErro(null)
    setAviso(null)
    setPipelineConcluido(false)
    onIaInicio?.()

    smartReadApi
      .analisarRiscosLeitura({
        documentos,
        incluir_llm: true,
        id_leitura_legado: idLeituraLegado ?? undefined,
      })
      .then((resposta) => {
        if (requisicaoSeq.current !== seq) return
        salvarCacheAnaliseRiscosSessaoSmartRead(chaveAnalise, resposta)
        setResumo(resposta.resumo)
        setRegrasContexto(resposta.contexto_v1.regras)
        setLlmHabilitado(resposta.llm_ativo)
        setAviso(resposta.aviso ?? null)
        setPipelineConcluido(true)
        onTokensAtualizados?.(resposta.uso_llm_leitura, resposta.uso_llm_chamada)
      })
      .catch((ex: unknown) => {
        if (requisicaoSeq.current !== seq) return
        setErro(ex instanceof Error ? ex.message : 'Falha na análise de riscos')
        setPipelineConcluido(!!auditoriaV1Local)
      })
      .finally(() => {
        if (requisicaoSeq.current === seq) {
          setCarregando(false)
          onIaFim?.()
        }
      })
  }, [chaveAnalise, documentos, idLeituraLegado, onTokensAtualizados, onIaInicio, onIaFim, auditoriaV1Local])

  function scrollParaRisco(riscoId: string) {
    const el = document.getElementById(`sr-risco-${riscoId}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  function verRiscoDoChecklist(riscoId: string) {
    setModalChecklistAberto(false)
    window.requestAnimationFrame(() => scrollParaRisco(riscoId))
  }

  function toggleCategoria(id: string) {
    setCategoriasColapsadas((prev) => {
      if (prev.has(id)) {
        const next = new Set(prev)
        next.delete(id)
        return next
      }
      const next = new Set(secoesCategoria.map((secao) => secao.id))
      next.delete(id)
      return next
    })
  }

  function secaoTodosSelecionados(riscos: RiscoAduaneiroLeitura[]) {
    return riscos.length > 0 && riscos.every((risco) => riscosSelecionados.has(risco.id))
  }

  function toggleSelecionarSecao(riscos: RiscoAduaneiroLeitura[]) {
    const todos = secaoTodosSelecionados(riscos)
    setRiscosSelecionados((prev) => {
      const next = new Set(prev)
      if (todos) {
        for (const risco of riscos) next.delete(risco.id)
      } else {
        for (const risco of riscos) next.add(risco.id)
      }
      return next
    })
  }

  function toggleTodasCategorias() {
    if (todasColapsadas) {
      setCategoriasColapsadas(new Set())
      return
    }
    setCategoriasColapsadas(new Set(secoesCategoria.map((s) => s.id)))
  }

  if (arquivosAnalisaveis.length === 0) {
    return (
      <div className="sr-conf-riscos">
        <p className="sr-conf-vazio">Aguardando análise dos arquivos para calcular riscos.</p>
      </div>
    )
  }

  return (
    <div className="sr-conf-riscos">
      {carregando && (
        <p className="sr-conf-riscos-carregando" role="status">
          <CircleNotch size={18} className="sr-wizard-analise-arquivo-spin" aria-hidden />
          {resumo.total > 0 ? 'Enriquecendo com IA e validação NCM…' : 'Analisando documentos…'}
        </p>
      )}

      {erro && (
        <p className="sr-conf-riscos-erro" role="alert">
          {erro}
        </p>
      )}

      {aviso && !erro && (
        <p className="sr-conf-riscos-aviso" role="status">
          {aviso}
        </p>
      )}

      <section className="sr-conf-riscos-cabecalho" aria-label="Resumo da análise de riscos">
        <div className="sr-conf-riscos-cabecalho-principal">
          <div className="sr-conf-riscos-cabecalho-resumo">
            <div className="sr-conf-riscos-cabecalho-titulo-linha">
              <strong className="sr-conf-riscos-cabecalho-titulo">Análise de riscos</strong>
              <span className="sr-conf-riscos-cabecalho-subtitulo">
                {percentualConformidade}% sem críticos abertos
              </span>
            </div>

            {resumo.total > 0 && (
              <>
                <div
                  className="sr-conf-riscos-seg-bar"
                  role="img"
                  aria-label={`Distribuição: ${legendaSegmentosRisco ?? ''}`}
                >
                  {resumo.criticos > 0 && (
                    <span
                      className="sr-conf-riscos-seg-bar__critico"
                      style={{ width: `${(resumo.criticos / resumo.total) * 100}%` }}
                    />
                  )}
                  {resumo.atencao > 0 && (
                    <span
                      className="sr-conf-riscos-seg-bar__atencao"
                      style={{ width: `${(resumo.atencao / resumo.total) * 100}%` }}
                    />
                  )}
                  {resumo.informativos > 0 && (
                    <span
                      className="sr-conf-riscos-seg-bar__informativo"
                      style={{ width: `${(resumo.informativos / resumo.total) * 100}%` }}
                    />
                  )}
                </div>
                {legendaSegmentosRisco && (
                  <p className="sr-conf-riscos-seg-legenda">
                    {resumo.total} {resumo.total === 1 ? 'risco' : 'riscos'} · {legendaSegmentosRisco}
                  </p>
                )}
              </>
            )}

            <div className="sr-conf-progresso-metricas sr-conf-progresso-metricas--compacto" aria-label="Filtrar riscos">
              <button
                type="button"
                className={`sr-conf-progresso-metrica sr-conf-progresso-metrica--todos${filtro === 'todos' ? ' sr-conf-progresso-metrica--ativo' : ''}`}
                aria-pressed={filtro === 'todos'}
                onClick={() => setFiltro('todos')}
              >
                <span className="sr-conf-progresso-metrica-valor">{resumo.total}</span>
                <span className="sr-conf-progresso-metrica-rotulo">
                  <ShieldCheck size={12} weight="fill" aria-hidden />
                  Todos
                </span>
              </button>
              <button
                type="button"
                className={`sr-conf-progresso-metrica sr-conf-progresso-metrica--critico${filtro === 'critico' ? ' sr-conf-progresso-metrica--ativo' : ''}`}
                aria-pressed={filtro === 'critico'}
                onClick={() => setFiltro('critico')}
              >
                <span className="sr-conf-progresso-metrica-valor">{resumo.criticos}</span>
                <span className="sr-conf-progresso-metrica-rotulo">
                  <WarningCircle size={12} weight="fill" aria-hidden />
                  Críticos
                </span>
              </button>
              <button
                type="button"
                className={`sr-conf-progresso-metrica sr-conf-progresso-metrica--vazio${filtro === 'atencao' ? ' sr-conf-progresso-metrica--ativo' : ''}`}
                aria-pressed={filtro === 'atencao'}
                onClick={() => setFiltro('atencao')}
              >
                <span className="sr-conf-progresso-metrica-valor">{resumo.atencao}</span>
                <span className="sr-conf-progresso-metrica-rotulo">
                  <Warning size={12} weight="fill" aria-hidden />
                  Atenção
                </span>
              </button>
              <button
                type="button"
                className={`sr-conf-progresso-metrica sr-conf-progresso-metrica--informativo${filtro === 'informativo' ? ' sr-conf-progresso-metrica--ativo' : ''}`}
                aria-pressed={filtro === 'informativo'}
                onClick={() => setFiltro('informativo')}
              >
                <span className="sr-conf-progresso-metrica-valor">{resumo.informativos}</span>
                <span className="sr-conf-progresso-metrica-rotulo">
                  <Info size={12} weight="fill" aria-hidden />
                  Informativos
                </span>
              </button>
            </div>
          </div>

          <div className="sr-conf-progresso-busca">
            <div className="dt-header-busca">
              <MagnifyingGlass weight="duotone" size={14} className="dt-toc-busca-icon" />
              <input
                type="search"
                className="dt-toc-busca-input"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Localizar riscos"
                aria-label="Localizar riscos"
              />
              {busca && (
                <button
                  type="button"
                  className="dt-toc-busca-limpar"
                  onClick={() => setBusca('')}
                  aria-label="Limpar busca"
                >
                  <X size={12} weight="bold" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="sr-conf-riscos-cabecalho-rodape">
          <button
            type="button"
            className="sr-conf-riscos-checklist-link"
            onClick={() => setModalChecklistAberto(true)}
            aria-haspopup="dialog"
          >
            Checklist matriz · {percentualChecklistVerde}% conforme
          </button>
          <span className="sr-conf-riscos-checklist-resumo-compacto">
            {contagemChecklist.verde} ok · {contagemChecklist.amarelo} atenção ·{' '}
            {contagemChecklist.vermelho} falha · {contagemChecklist.pendente} pendente
          </span>
          {riscosFiltrados.length > 0 && (
            <label className="sr-conf-riscos-selecionar-compacto">
              <input
                type="checkbox"
                checked={todosFiltradosSelecionados}
                onChange={toggleSelecionarTodosFiltrados}
                aria-label="Selecionar todos os riscos visíveis"
              />
              <span>Selecionar ({riscosFiltrados.length})</span>
            </label>
          )}
          {riscosSelecionadosLista.length > 0 && (
            <AcoesCorrecaoRiscoNovaLeituraSmartRead riscos={riscosSelecionadosLista} />
          )}
          <span className="sr-conf-riscos-disclaimer-compacto">
            V1 + IA + NCM — apoio à conferência
          </span>
        </div>
      </section>

      <ModalChecklistConferenciaNovaLeituraSmartRead
        aberto={modalChecklistAberto}
        onFechar={() => setModalChecklistAberto(false)}
        documentos={documentos}
        parametrosChecklist={parametrosChecklist}
        onVerRisco={verRiscoDoChecklist}
      />

      <main className="dt-main sr-conf-riscos-main">
        {(filtro !== 'todos' || busca.trim() || secoesCategoria.length > 0) && (
          <div className="dt-main-toolbar sr-conf-secoes-toolbar">
            {(filtro !== 'todos' || busca.trim()) && (
              <div className="dt-chips sr-conf-chips">
                {filtro !== 'todos' && (
                  <span className="fc-chip" role="status" aria-live="polite">
                    <span className="fc-chip-label">Riscos:</span>
                    <span className="fc-chip-valor">{ROTULO_FILTRO_RISCO[filtro]}</span>
                    <button
                      type="button"
                      className="fc-chip-remove"
                      onClick={() => setFiltro('todos')}
                      title="Remover filtro"
                      aria-label={`Remover filtro ${ROTULO_FILTRO_RISCO[filtro]}`}
                    >
                      <X size={10} weight="bold" />
                    </button>
                  </span>
                )}
                {busca.trim() && (
                  <span className="fc-chip" role="status" aria-live="polite">
                    <span className="fc-chip-label">Busca:</span>
                    <span className="fc-chip-valor">{busca.trim()}</span>
                    <button
                      type="button"
                      className="fc-chip-remove"
                      onClick={() => setBusca('')}
                      title="Remover busca"
                      aria-label="Remover busca"
                    >
                      <X size={10} weight="bold" />
                    </button>
                  </span>
                )}
              </div>
            )}
            {secoesCategoria.length > 0 && (
              <button
                type="button"
                className="dt-main-toolbar-btn dt-main-toolbar-btn--right"
                onClick={toggleTodasCategorias}
                title={todasColapsadas ? 'Expandir todas as categorias' : 'Recolher todas as categorias'}
              >
                <CaretDown
                  weight="bold"
                  size={12}
                  className={`dt-caret${todasColapsadas ? ' dt-caret--colapsado' : ''}`}
                />
                {todasColapsadas ? 'Expandir todas' : 'Recolher todas'}
              </button>
            )}
          </div>
        )}

        {!carregando && resumo.riscos.length === 0 && !erro ? (
          <p className="sr-conf-riscos-ok">Nenhum risco identificado na leitura atual.</p>
        ) : secoesCategoria.length === 0 ? (
          <p className="sr-conf-vazio">Nenhum risco encontrado para os filtros atuais.</p>
        ) : (
          secoesCategoria.map((secao) => {
            const colapsada = categoriasColapsadas.has(secao.id)

            return (
              <section
                key={secao.id}
                id={secao.id}
                className={`dt-secao${colapsada ? ' dt-secao--colapsada' : ''}`}
              >
                <button
                  type="button"
                  className="dt-secao-header"
                  onClick={() => toggleCategoria(secao.id)}
                  aria-expanded={!colapsada}
                  aria-controls={`${secao.id}-lista`}
                >
                  <div className="dt-secao-title">
                    <CaretDown
                      weight="bold"
                      size={14}
                      className={`dt-caret${colapsada ? ' dt-caret--colapsado' : ''}`}
                    />
                    <span className="dt-secao-icon">{iconeCategoria(secao.categoria)}</span>
                    <h2>{secao.titulo}</h2>
                  </div>
                  <div className="dt-secao-completude">
                    <label
                      className="sr-conf-riscos-secao-selecionar"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={secaoTodosSelecionados(secao.riscos)}
                        onChange={() => toggleSelecionarSecao(secao.riscos)}
                        aria-label={`Selecionar riscos de ${secao.titulo}`}
                      />
                      <span>Selecionar</span>
                    </label>
                    <span className="dt-secao-pill">
                      {secao.riscos.length} {secao.riscos.length === 1 ? 'risco' : 'riscos'}
                    </span>
                  </div>
                </button>
                {!colapsada && (
                <div id={`${secao.id}-lista`} className="sr-conf-riscos-lista sr-conf-riscos-lista--secao">
                  {secao.riscos.map((risco) => (
                    <LinhaRisco
                      key={risco.id}
                      risco={risco}
                      arquivos={arquivos}
                      onVerEvidencia={onVerEvidencia}
                      onIrConferenciaCampos={onIrConferenciaCampos}
                      selecionado={riscosSelecionados.has(risco.id)}
                      onToggleSelecao={toggleSelecaoRisco}
                      numero={numeracaoRiscos.get(risco.id) ?? 0}
                      aguardandoClassificacao={carregando}
                    />
                  ))}
                </div>
                )}
              </section>
            )
          })
        )}
      </main>
    </div>
  )
}
