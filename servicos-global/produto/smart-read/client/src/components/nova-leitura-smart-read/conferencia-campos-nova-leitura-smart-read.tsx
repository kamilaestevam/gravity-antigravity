/**
 * ConferenciaCamposNovaLeituraSmartRead — layout padrão Processo / Dados do Processo (dt-*)
 */

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Airplane,
  Anchor,
  Buildings,
  CaretDown,
  CheckCircle,
  Circle,
  CurrencyDollar,
  FileText,
  GlobeHemisphereWest,
  MagnifyingGlass,
  MapTrifold,
  Package,
  PencilSimple,
  Receipt,
  ShieldCheck,
  Truck,
  User,
  Users,
  X,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import {
  contarDocumentosArquivoLocal,
  extrairDocumentosArquivoLocal,
  resolverArquivoApiLeitura,
} from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import {
  calcularEstatisticasConferencia,
  extrairSecoesConferenciaLeitura,
  type SecaoConferenciaLeitura,
} from '../../shared/extrair-secoes-conferencia-leitura-smart-read'
import { isCampoEditadoLeitura } from '../../shared/definir-valor-por-caminho-dados-leitura-smart-read'
import { caminhoEditavelParidadeConferenciaListaSmartRead } from '../../shared/paridade-edicao-conferencia-lista-smart-read'
import { CampoLinhaConferenciaNovaLeituraSmartRead } from './campo-linha-conferencia-nova-leitura-smart-read'
import '../../../../../../../nucleo-global/Tabelas/tabela-virtual-global/src/FiltrosColuna/FiltrosColuna.css'
import '../../../../../processo/client/src/pages/dados-tecnicos/DadosTecnicos.css'

type FiltroConferencia = 'todos' | 'preenchidos' | 'vazios' | 'alterados'

const ROTULO_FILTRO_CONFERENCIA: Record<FiltroConferencia, string> = {
  todos: 'Verificados',
  preenchidos: 'Preenchidos',
  vazios: 'Vazios',
  alterados: 'Preenchidos alterados',
}

type Props = {
  arquivo: ArquivoLocalNovaLeitura
  indiceDocumento: number
  onCompararArquivo?: () => void
  ocultarComparar?: boolean
  camposEditados?: ReadonlySet<string>
  onEditarCampo?: (chave: string, valor: string) => void
  campoFoco?: string | null
  onCampoFocoConsumido?: () => void
}

const ICONE_SECAO_CONFERENCIA: Record<string, ReactNode> = {
  'Dados gerais': <FileText weight="duotone" size={18} />,
  'Nome do transportador': <Truck weight="duotone" size={18} />,
  Exportador: <Buildings weight="duotone" size={18} />,
  Importador: <User weight="duotone" size={18} />,
  Notify: <Users weight="duotone" size={18} />,
  'Origem e destino': <GlobeHemisphereWest weight="duotone" size={18} />,
  Mercadoria: <Package weight="duotone" size={18} />,
  Frete: <Truck weight="duotone" size={18} />,
  'Informações AWB': <Airplane weight="duotone" size={18} />,
  Voo: <Airplane weight="duotone" size={18} />,
  'Agente de carga': <Users weight="duotone" size={18} />,
  Rota: <MapTrifold weight="duotone" size={18} />,
  Embarque: <Anchor weight="duotone" size={18} />,
  'Valores declarados': <CurrencyDollar weight="duotone" size={18} />,
  Custos: <Receipt weight="duotone" size={18} />,
}

function iconeSecao(titulo: string) {
  const iconeExato = ICONE_SECAO_CONFERENCIA[titulo]
  if (iconeExato) return iconeExato

  const t = titulo.toLowerCase()
  if (t.includes('document') || t.includes('dados gerais')) return <FileText weight="duotone" size={18} />
  if (t.includes('transportador') || t.includes('transportadora') || t.includes('carrier') || t.includes('frete')) {
    return <Truck weight="duotone" size={18} />
  }
  if (t.includes('exportador') || t.includes('exporter') || t.includes('shipper')) {
    return <Buildings weight="duotone" size={18} />
  }
  if (t.includes('importador') || t.includes('importer') || t.includes('consignee')) {
    return <User weight="duotone" size={18} />
  }
  if (t.includes('notify')) return <Users weight="duotone" size={18} />
  if (t.includes('origem') || t.includes('destino') || t.includes('routing') || t.includes('shipment')) {
    return <GlobeHemisphereWest weight="duotone" size={18} />
  }
  if (t.includes('mercadoria') || t.includes('goods') || t.includes('items') || /^item \d+$/i.test(t)) {
    return <Package weight="duotone" size={18} />
  }
  if (t.includes('container') || t.includes('embarque')) return <Anchor weight="duotone" size={18} />
  return <Package weight="duotone" size={18} />
}

function filtrarCamposSecao(
  secao: SecaoConferenciaLeitura,
  filtro: FiltroConferencia,
  busca: string,
  ehAlterado: (chave: string) => boolean,
) {
  const buscaNorm = busca.trim().toLowerCase()
  return secao.campos.filter((campo) => {
    if (filtro === 'preenchidos' && !campo.preenchido) return false
    if (filtro === 'vazios' && campo.preenchido) return false
    if (filtro === 'alterados' && (!campo.preenchido || !ehAlterado(campo.chave))) return false
    if (!buscaNorm) return true
    return (
      campo.rotulo.toLowerCase().includes(buscaNorm) ||
      (campo.valor?.toLowerCase().includes(buscaNorm) ?? false)
    )
  })
}

export function ConferenciaCamposNovaLeituraSmartRead({
  arquivo,
  indiceDocumento,
  onCompararArquivo,
  ocultarComparar = false,
  camposEditados = new Set(),
  onEditarCampo,
  campoFoco = null,
  onCampoFocoConsumido,
}: Props) {
  const [filtro, setFiltro] = useState<FiltroConferencia>('todos')
  const [busca, setBusca] = useState('')
  const [progressoColapsado, setProgressoColapsado] = useState(false)
  const [secoesColapsadas, setSecoesColapsadas] = useState<Set<string>>(() => new Set())
  const [campoDestacado, setCampoDestacado] = useState<string | null>(null)

  const documentos = extrairDocumentosArquivoLocal(arquivo)
  const documentoAtual = documentos[indiceDocumento]
  const arquivoApi = resolverArquivoApiLeitura(arquivo)
  const extracao = arquivoApi?.resultado_extracao?.[indiceDocumento]
  const secoes = useMemo(
    () => extrairSecoesConferenciaLeitura(extracao?.dados ?? {}),
    [extracao?.dados],
  )
  const tipoDocumentoAtual = extracao?.tipo_documento ?? documentoAtual?.tipo_documento ?? null

  const caminhoEditavel = useCallback(
    (chave: string) => caminhoEditavelParidadeConferenciaListaSmartRead(chave, tipoDocumentoAtual),
    [tipoDocumentoAtual],
  )

  const stats = useMemo(
    () =>
      calcularEstatisticasConferencia(secoes, {
        idArquivoLocal: arquivo.id_arquivo_local,
        indiceDocumento,
        camposEditados,
      }),
    [secoes, arquivo.id_arquivo_local, indiceDocumento, camposEditados],
  )

  const ehAlterado = useCallback(
    (chave: string) =>
      isCampoEditadoLeitura(camposEditados, arquivo.id_arquivo_local, indiceDocumento, chave),
    [camposEditados, arquivo.id_arquivo_local, indiceDocumento],
  )

  const idSecaoAssinado = useMemo(() => {
    const secaoComAssinado = secoes.find((s) => s.campos.some((c) => c.chave === 'isSigned'))
    return secaoComAssinado?.id ?? secoes[0]?.id ?? null
  }, [secoes])

  useEffect(() => {
    setSecoesColapsadas(new Set(secoes.map((s) => s.id)))
    setFiltro('todos')
    setBusca('')
  }, [arquivo.id_arquivo_local, indiceDocumento])

  useEffect(() => {
    if (!campoFoco?.trim()) return
    const chave = campoFoco.trim()
    const secaoAlvo = secoes.find((secao) => secao.campos.some((c) => c.chave === chave))
    if (!secaoAlvo) {
      onCampoFocoConsumido?.()
      return
    }
    setSecoesColapsadas((prev) => {
      const next = new Set(prev)
      next.delete(secaoAlvo.id)
      return next
    })
    setFiltro('todos')
    setBusca('')
    setCampoDestacado(chave)
    const timerScroll = window.setTimeout(() => {
      document.getElementById(`sr-campo-conferencia-${chave}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
      onCampoFocoConsumido?.()
    }, 120)
    const timerDestaque = window.setTimeout(() => setCampoDestacado(null), 2400)
    return () => {
      window.clearTimeout(timerScroll)
      window.clearTimeout(timerDestaque)
    }
  }, [campoFoco, secoes, onCampoFocoConsumido])

  useEffect(() => {
    if (filtro === 'todos' && !busca.trim()) return
    const idsExpandidos = secoes
      .filter((secao) => {
        const campos = filtrarCamposSecao(secao, filtro, busca, ehAlterado).filter(
          (c) => c.chave !== 'isSigned',
        )
        const incluiAssinado =
          secao.id === idSecaoAssinado &&
          filtrarCamposSecao(secao, filtro, busca, ehAlterado).some((c) => c.chave === 'isSigned')
        return campos.length > 0 || incluiAssinado
      })
      .map((s) => s.id)

    setSecoesColapsadas((prev) => {
      const next = new Set(prev)
      for (const id of idsExpandidos) next.delete(id)
      return next
    })
  }, [filtro, busca, secoes, ehAlterado, idSecaoAssinado])

  const campoAssinado = useMemo(
    () => secoes.flatMap((s) => s.campos).find((c) => c.chave === 'isSigned'),
    [secoes],
  )

  const assinadoVisivel = useMemo(() => {
    if (!campoAssinado) return false
    const filtrados = filtrarCamposSecao(
      { id: '', titulo: '', campos: [campoAssinado] },
      filtro,
      busca,
      ehAlterado,
    )
    return filtrados.length > 0
  }, [campoAssinado, filtro, busca, ehAlterado])

  const secoesVisiveis = useMemo(
    () =>
      secoes
        .map((secao) => ({
          ...secao,
          campos: filtrarCamposSecao(secao, filtro, busca, ehAlterado).filter(
            (c) => c.chave !== 'isSigned',
          ),
        }))
        .filter((secao) => secao.campos.length > 0),
    [secoes, filtro, busca, ehAlterado],
  )

  function toggleSecao(id: string) {
    setSecoesColapsadas((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const todasColapsadas =
    secoesVisiveis.length > 0 && secoesVisiveis.every((secao) => secoesColapsadas.has(secao.id))

  function toggleTodasSecoes() {
    if (todasColapsadas) {
      setSecoesColapsadas(new Set())
      return
    }
    setSecoesColapsadas(new Set(secoesVisiveis.map((secao) => secao.id)))
  }

  const tituloContexto = `${arquivo.arquivo.name}${documentoAtual ? ` | ${documentoAtual.tipo_documento}` : ''}`

  return (
    <div className="sr-conf-campos dt-layout">
      <div className="sr-conf-contexto-linha">
        <span className="sr-conf-contexto-texto">{tituloContexto}</span>
        {!ocultarComparar && onCompararArquivo && (
          <BotaoGlobal variante="primario" tamanho="pequeno" onClick={onCompararArquivo}>
            Comparar arquivo
          </BotaoGlobal>
        )}
      </div>

      <section
        className={`sr-conf-progresso-bloco${progressoColapsado ? ' sr-conf-progresso-bloco--colapsado' : ''}`}
      >
        <button
          type="button"
          className="sr-conf-progresso-header"
          onClick={() => setProgressoColapsado((prev) => !prev)}
          aria-expanded={!progressoColapsado}
          aria-controls="sr-conf-progresso-corpo"
        >
          <div className="sr-conf-progresso-header-esq">
            <CaretDown
              weight="bold"
              size={14}
              className={`dt-caret${progressoColapsado ? ' dt-caret--colapsado' : ''}`}
            />
            <strong className="sr-conf-progresso-titulo">Progresso da Conferência</strong>
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
                placeholder="Localizar campos"
                aria-label="Localizar campos"
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

        {!progressoColapsado && (
          <div id="sr-conf-progresso-corpo" className="sr-conf-progresso-corpo">
            <div className="sr-conf-progresso-linha">
              <div
                className="sr-conf-progresso-barra"
                role="progressbar"
                aria-valuenow={stats.percentual}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${stats.percentual}% dos campos preenchidos`}
              >
                <div
                  className="sr-conf-progresso-barra-fill"
                  style={{ width: `${stats.percentual}%` }}
                />
              </div>
              <span className="sr-conf-progresso-pct">{stats.percentual}%</span>
            </div>

            <div className="sr-conf-progresso-metricas" aria-label="Resumo da conferência">
              <button
                type="button"
                className={`sr-conf-progresso-metrica sr-conf-progresso-metrica--todos${filtro === 'todos' ? ' sr-conf-progresso-metrica--ativo' : ''}`}
                aria-pressed={filtro === 'todos'}
                onClick={() => setFiltro('todos')}
              >
                <span className="sr-conf-progresso-metrica-valor">{stats.total}</span>
                <span className="sr-conf-progresso-metrica-rotulo">
                  <ShieldCheck size={12} weight="fill" aria-hidden />
                  Verificados
                </span>
              </button>
              <button
                type="button"
                className={`sr-conf-progresso-metrica sr-conf-progresso-metrica--preenchido${filtro === 'preenchidos' ? ' sr-conf-progresso-metrica--ativo' : ''}`}
                aria-pressed={filtro === 'preenchidos'}
                onClick={() => setFiltro('preenchidos')}
              >
                <span className="sr-conf-progresso-metrica-valor">{stats.preenchidos}</span>
                <span className="sr-conf-progresso-metrica-rotulo">
                  <CheckCircle size={12} weight="fill" aria-hidden />
                  Preenchidos
                </span>
              </button>
              <button
                type="button"
                className={`sr-conf-progresso-metrica sr-conf-progresso-metrica--vazio${filtro === 'vazios' ? ' sr-conf-progresso-metrica--ativo' : ''}`}
                aria-pressed={filtro === 'vazios'}
                onClick={() => setFiltro('vazios')}
              >
                <span className="sr-conf-progresso-metrica-valor">{stats.vazios}</span>
                <span className="sr-conf-progresso-metrica-rotulo">
                  <Circle size={12} weight="fill" aria-hidden />
                  {ROTULO_FILTRO_CONFERENCIA.vazios}
                </span>
              </button>
              <button
                type="button"
                className={`sr-conf-progresso-metrica sr-conf-progresso-metrica--alterado${filtro === 'alterados' ? ' sr-conf-progresso-metrica--ativo' : ''}`}
                aria-pressed={filtro === 'alterados'}
                onClick={() => setFiltro('alterados')}
              >
                <span className="sr-conf-progresso-metrica-valor">{stats.preenchidosAlterados}</span>
                <span className="sr-conf-progresso-metrica-rotulo">
                  <PencilSimple size={12} weight="fill" aria-hidden />
                  Preenchidos alterados
                </span>
              </button>
            </div>
          </div>
        )}
      </section>

      <main className="dt-main">
        {(filtro !== 'todos' || busca.trim() || secoesVisiveis.length > 0 || assinadoVisivel) && (
          <div className="dt-main-toolbar sr-conf-secoes-toolbar">
            {(filtro !== 'todos' || busca.trim()) && (
              <div className="dt-chips sr-conf-chips">
                {filtro !== 'todos' && (
                  <span className="fc-chip" role="status" aria-live="polite">
                    <span className="fc-chip-label">Conferência:</span>
                    <span className="fc-chip-valor">{ROTULO_FILTRO_CONFERENCIA[filtro]}</span>
                    <button
                      type="button"
                      className="fc-chip-remove"
                      onClick={() => setFiltro('todos')}
                      title="Remover filtro"
                      aria-label={`Remover filtro ${ROTULO_FILTRO_CONFERENCIA[filtro]}`}
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
            {(secoesVisiveis.length > 0 || assinadoVisivel) && (
              <button
                type="button"
                className="dt-main-toolbar-btn dt-main-toolbar-btn--right"
                onClick={toggleTodasSecoes}
                title={todasColapsadas ? 'Expandir todas as seções' : 'Recolher todas as seções'}
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

        {secoesVisiveis.length === 0 && !assinadoVisivel ? (
          <p className="sr-conf-vazio">Nenhum campo encontrado para este documento.</p>
        ) : (
          secoesVisiveis.map((secao) => {
            const preenchidosSecao = secao.campos.filter((c) => c.preenchido).length
            const pctSecao = secao.campos.length
              ? Math.round((preenchidosSecao / secao.campos.length) * 100)
              : 0
            const completa = preenchidosSecao === secao.campos.length
            const colapsada = secoesColapsadas.has(secao.id)

            return (
              <section
                key={secao.id}
                id={secao.id}
                className={`dt-secao${colapsada ? ' dt-secao--colapsada' : ''}`}
              >
                <button
                  type="button"
                  className="dt-secao-header"
                  onClick={() => toggleSecao(secao.id)}
                  aria-expanded={!colapsada}
                  aria-controls={`${secao.id}-grid`}
                >
                  <div className="dt-secao-title">
                    <CaretDown
                      weight="bold"
                      size={14}
                      className={`dt-caret${colapsada ? ' dt-caret--colapsado' : ''}`}
                    />
                    <span className="dt-secao-icon">{iconeSecao(secao.titulo)}</span>
                    <h2>{secao.titulo}</h2>
                  </div>
                  <div className="dt-secao-completude">
                    <div className="dt-secao-progress">
                      <div
                        className="dt-secao-progress-fill"
                        style={{
                          width: `${pctSecao}%`,
                          background: completa ? '#34d399' : '#a78bfa',
                        }}
                      />
                    </div>
                    <span className="dt-secao-pill">
                      {preenchidosSecao}/{secao.campos.length}
                    </span>
                  </div>
                </button>

                {!colapsada && (
                  <div id={`${secao.id}-grid`} className="dt-grid">
                    {secao.id === idSecaoAssinado && assinadoVisivel && campoAssinado && (
                      <CampoLinhaConferenciaNovaLeituraSmartRead
                        chave="isSigned"
                        rotulo={campoAssinado.rotulo}
                        valor={campoAssinado.valor}
                        alterado={ehAlterado('isSigned')}
                        editavel={caminhoEditavel('isSigned')}
                        tipo="booleano"
                        aoSalvar={(novo) => onEditarCampo?.('isSigned', novo)}
                      />
                    )}
                    {secao.campos.map((campo) => (
                      <CampoLinhaConferenciaNovaLeituraSmartRead
                        key={campo.chave}
                        chave={campo.chave}
                        rotulo={campo.rotulo}
                        valor={campo.valor}
                        alterado={ehAlterado(campo.chave)}
                        destacado={campoDestacado === campo.chave}
                        editavel={caminhoEditavel(campo.chave)}
                        aoSalvar={(novo) => onEditarCampo?.(campo.chave, novo)}
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
