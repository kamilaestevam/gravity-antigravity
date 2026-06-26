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
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import { smartReadApi } from '../../shared/api'
import {
  analisarRiscosAduaneirosLeitura,
  aplicarCorrecaoSugeridaPadraoRisco,
  montarDocumentosAnaliseRiscoDeArquivosLocais,
} from '../../shared/analisar-riscos-aduaneiros-leitura-smart-read'
import type {
  CategoriaRiscoAduaneiro,
  RiscoAduaneiroLeitura,
  SeveridadeRiscoAduaneiro,
} from '../../shared/analisar-riscos-aduaneiros-leitura-smart-read'
import { EvidenciaVisualRiscoNovaLeituraSmartRead } from './evidencia-visual-risco-nova-leitura-smart-read'
import { AcoesCorrecaoRiscoNovaLeituraSmartRead } from './acoes-correcao-risco-nova-leitura-smart-read'
import type { ContextoEvidenciaRiscoNovaLeitura } from '../../shared/contexto-evidencia-risco-nova-leitura-smart-read'
import '../../../../../../../nucleo-global/Tabelas/tabela-virtual-global/src/FiltrosColuna/FiltrosColuna.css'
import '../../../../../processo/client/src/pages/dados-tecnicos/DadosTecnicos.css'

type Props = {
  arquivos: ArquivoLocalNovaLeitura[]
  onVerEvidencia?: (ctx: ContextoEvidenciaRiscoNovaLeitura) => void
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

function iconeSeveridade(severidade: SeveridadeRiscoAduaneiro) {
  switch (severidade) {
    case 'critico':
      return <WarningCircle weight="fill" size={18} />
    case 'atencao':
      return <Warning weight="fill" size={18} />
    default:
      return <Info weight="fill" size={18} />
  }
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

function rotuloOrigem(origem: RiscoAduaneiroLeitura['origem']): string {
  if (origem === 'llm') return 'IA'
  return 'Regras'
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
  selecionado,
  onToggleSelecao,
  numero,
}: {
  risco: RiscoAduaneiroLeitura
  arquivos: ArquivoLocalNovaLeitura[]
  onVerEvidencia?: (ctx: ContextoEvidenciaRiscoNovaLeitura) => void
  selecionado: boolean
  onToggleSelecao: (id: string) => void
  numero: number
}) {
  const risco = aplicarCorrecaoSugeridaPadraoRisco(riscoBruto)
  const contextoEvidencia = {
    tituloRisco: risco.titulo,
    motivo: risco.motivo,
    analise: risco.analise,
    correcao: risco.correcao_sugerida,
  }
  const onde =
    risco.evidencias[0] != null
      ? [risco.evidencias[0].documento, risco.evidencias[0].campo].filter(Boolean).join(' · ')
      : null

  return (
    <article
      className={`sr-conf-risco-linha sr-conf-risco-linha--${risco.severidade}${selecionado ? ' sr-conf-risco-linha--selecionado' : ''}`}
    >
      <div className="sr-conf-risco-linha-topo">
        <span className="sr-conf-risco-numero" aria-label={`Risco ${numero}`}>
          {String(numero).padStart(2, '0')}
        </span>
        <label className="sr-conf-risco-selecao">
          <input
            type="checkbox"
            checked={selecionado}
            onChange={() => onToggleSelecao(risco.id)}
            aria-label={`Selecionar risco: ${risco.titulo}`}
          />
        </label>
        <span className="sr-conf-risco-severidade-icone" aria-hidden>
          {iconeSeveridade(risco.severidade)}
        </span>
        <h3 className="sr-conf-risco-linha-titulo">{risco.titulo}</h3>
        <span className={`sr-conf-risco-badge sr-conf-risco-badge--${risco.severidade}`}>
          {rotuloSeveridade(risco.severidade)}
        </span>
        <span className={`sr-conf-risco-origem sr-conf-risco-origem--${risco.origem ?? 'v1'}`}>
          {risco.origem === 'llm' ? (
            <Sparkle size={10} weight="fill" aria-hidden />
          ) : (
            <ShieldCheck size={10} weight="fill" aria-hidden />
          )}
          {rotuloOrigem(risco.origem)}
        </span>
      </div>

      <div className="sr-conf-risco-linha-corpo">
        <div className="sr-conf-risco-detalhe">
          <div className="sr-conf-risco-bloco">
            <h4 className="sr-conf-risco-bloco-titulo">O que é o risco</h4>
            <p>{risco.motivo}</p>
          </div>
          <div className="sr-conf-risco-bloco">
            <h4 className="sr-conf-risco-bloco-titulo">Motivo</h4>
            <p>{risco.analise}</p>
          </div>
          {onde && (
            <div className="sr-conf-risco-bloco">
              <h4 className="sr-conf-risco-bloco-titulo">Onde</h4>
              <p className="sr-conf-risco-onde">{onde}</p>
            </div>
          )}
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
          <div className="sr-conf-risco-bloco sr-conf-risco-bloco--evidencias">
            <h4 className="sr-conf-risco-bloco-titulo">Evidências</h4>
            <div className="sr-conf-risco-evidencias-lista">
              {risco.evidencias.map((ev, idx) => (
                <EvidenciaVisualRiscoNovaLeituraSmartRead
                  key={`${risco.id}-ev-${idx}`}
                  evidencia={ev}
                  arquivos={arquivos}
                  contextoRisco={contextoEvidencia}
                  onVerEvidencia={onVerEvidencia}
                />
              ))}
            </div>
          </div>
        )}

        {risco.correcao_sugerida && (
          <aside className="sr-conf-risco-correcao sr-conf-risco-correcao--abaixo" aria-label="Correção sugerida">
            <span className="sr-conf-risco-correcao-rotulo">Correção sugerida</span>
            <p>{risco.correcao_sugerida}</p>
          </aside>
        )}
      </div>
    </article>
  )
}

export function ConferenciaRiscosAduaneirosNovaLeituraSmartRead({
  arquivos,
  onVerEvidencia,
}: Props) {
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
  const [painelColapsado, setPainelColapsado] = useState(false)
  const [categoriasColapsadas, setCategoriasColapsadas] = useState<Set<string>>(() => new Set())
  const [riscosSelecionados, setRiscosSelecionados] = useState<Set<string>>(() => new Set())

  const arquivosAnalisaveis = useMemo(
    () => arquivos.filter((a) => a.status_arquivo_local === 'completo'),
    [arquivos],
  )

  const documentos = useMemo(
    () => montarDocumentosAnaliseRiscoDeArquivosLocais(arquivosAnalisaveis),
    [arquivosAnalisaveis],
  )

  const chaveAnalise = useMemo(
    () => documentos.map((d) => `${d.nome_arquivo}:${d.indice}:${d.tipo_documento}`).join('|'),
    [documentos],
  )

  const resumoV1 = useMemo(
    () => (documentos.length === 0 ? null : analisarRiscosAduaneirosLeitura(arquivosAnalisaveis)),
    [arquivosAnalisaveis, documentos.length, chaveAnalise],
  )

  const percentualConformidade = useMemo(() => {
    if (resumo.total === 0) return 100
    return Math.round(((resumo.total - resumo.criticos) / resumo.total) * 100)
  }, [resumo.total, resumo.criticos])

  const corBarraConformidade =
    percentualConformidade >= 80
      ? 'linear-gradient(90deg, #34d399, #6ee7b7)'
      : percentualConformidade >= 50
        ? 'linear-gradient(90deg, #818cf8, #a78bfa)'
        : 'linear-gradient(90deg, #f87171, #fb923c)'

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
      .sort((a, b) => b.criticos - a.criticos || a.titulo.localeCompare(b.titulo, 'pt-BR'))
  }, [riscosFiltrados])

  const todasColapsadas =
    secoesCategoria.length > 0 && secoesCategoria.every((s) => categoriasColapsadas.has(s.id))

  useEffect(() => {
    if (resumoV1) setResumo(resumoV1)
  }, [resumoV1])

  useEffect(() => {
    if (documentos.length === 0) return

    const seq = ++requisicaoSeq.current
    setCarregando(true)
    setErro(null)
    setAviso(null)

    smartReadApi
      .analisarRiscosLeitura({ documentos, incluir_llm: true })
      .then((resposta) => {
        if (requisicaoSeq.current !== seq) return
        setResumo(resposta.resumo)
        setAviso(resposta.aviso ?? null)
      })
      .catch((ex: unknown) => {
        if (requisicaoSeq.current !== seq) return
        setErro(ex instanceof Error ? ex.message : 'Falha na análise de riscos')
      })
      .finally(() => {
        if (requisicaoSeq.current === seq) setCarregando(false)
      })
  }, [chaveAnalise, documentos])

  function toggleCategoria(id: string) {
    setCategoriasColapsadas((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
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

      <section
        className={`sr-conf-progresso-bloco${painelColapsado ? ' sr-conf-progresso-bloco--colapsado' : ''}`}
      >
        <button
          type="button"
          className="sr-conf-progresso-header"
          onClick={() => setPainelColapsado((prev) => !prev)}
          aria-expanded={!painelColapsado}
          aria-controls="sr-conf-riscos-painel-corpo"
        >
          <div className="sr-conf-progresso-header-esq">
            <CaretDown
              weight="bold"
              size={14}
              className={`dt-caret${painelColapsado ? ' dt-caret--colapsado' : ''}`}
            />
            <strong className="sr-conf-progresso-titulo">Painel da Análise</strong>
          </div>
          <div
            className="sr-conf-progresso-busca"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
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
        </button>

        {!painelColapsado && (
          <div id="sr-conf-riscos-painel-corpo" className="sr-conf-progresso-corpo">
            <div className="sr-conf-progresso-linha">
              <div
                className="sr-conf-progresso-barra"
                role="progressbar"
                aria-valuenow={percentualConformidade}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${percentualConformidade}% sem riscos críticos`}
              >
                <div
                  className="sr-conf-progresso-barra-fill"
                  style={{
                    width: `${percentualConformidade}%`,
                    background: corBarraConformidade,
                  }}
                />
              </div>
              <span className="sr-conf-progresso-pct">{percentualConformidade}%</span>
            </div>

            <div className="sr-conf-progresso-metricas" aria-label="Resumo de riscos">
              <button
                type="button"
                className={`sr-conf-progresso-metrica sr-conf-progresso-metrica--todos${filtro === 'todos' ? ' sr-conf-progresso-metrica--ativo' : ''}`}
                aria-pressed={filtro === 'todos'}
                onClick={() => setFiltro('todos')}
              >
                <span className="sr-conf-progresso-metrica-valor">{resumo.total}</span>
                <span className="sr-conf-progresso-metrica-rotulo">
                  <ShieldCheck size={12} weight="fill" aria-hidden />
                  Total
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
        )}
      </section>

      <p className="sr-conf-riscos-disclaimer">
        Auditoria V1 + IA comercial + validação NCM Siscomex. Apoio à conferência — não substitui despacho aduaneiro.
      </p>

      {riscosFiltrados.length > 0 && (
        <section className="sr-conf-risco-lote" aria-label="Seleção para e-mail ao fornecedor">
          <label className="sr-conf-risco-lote-selecionar">
            <input
              type="checkbox"
              checked={todosFiltradosSelecionados}
              onChange={toggleSelecionarTodosFiltrados}
              aria-label="Selecionar todos os riscos visíveis"
            />
            <span>Selecionar tudo ({riscosFiltrados.length})</span>
          </label>
          {riscosSelecionadosLista.length > 0 && (
            <AcoesCorrecaoRiscoNovaLeituraSmartRead riscos={riscosSelecionadosLista} />
          )}
        </section>
      )}

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
            const pctCriticos = secao.riscos.length
              ? Math.round((secao.criticos / secao.riscos.length) * 100)
              : 0

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
                    <div className="dt-secao-progress">
                      <div
                        className="dt-secao-progress-fill"
                        style={{
                          width: `${100 - pctCriticos}%`,
                          background: secao.criticos === 0 ? '#34d399' : '#f87171',
                        }}
                      />
                    </div>
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
                      selecionado={riscosSelecionados.has(risco.id)}
                      onToggleSelecao={toggleSelecaoRisco}
                      numero={numeracaoRiscos.get(risco.id) ?? 0}
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
