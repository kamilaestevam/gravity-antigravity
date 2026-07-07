import { useCallback, useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react'
import {
  Airplane,
  Anchor,
  Buildings,
  CaretDown,
  CheckCircle,
  Circle,
  ClipboardText,
  CurrencyDollar,
  FileText,
  GlobeHemisphereWest,
  MagnifyingGlass,
  Package,
  PencilSimple,
  Receipt,
  ShieldCheck,
  ShieldWarning,
  Sparkle,
  Truck,
  User,
  Users,
  X,
} from '@phosphor-icons/react'
import type { IconProps } from '@phosphor-icons/react'
import type { ArquivoDemoSimulador } from './arquivos-demo-simulador-smart-doc'
import type { DocumentoSimulador } from './documentos-preview-simulador-smart-doc'
import {
  calcularEstatisticasConferenciaSimulador,
  obterSecoesConferenciaSimulador,
  type SecaoConferenciaSimulador,
} from './dados-conferencia-simulador-smart-doc'
import { CampoLinhaConferenciaSimuladorSmartDoc } from './campo-linha-conferencia-simulador-smart-doc'
import { RiscosSimuladorSmartDoc } from './riscos-simulador-smart-doc'
import { QaSimuladorSmartDoc } from './qa-simulador-smart-doc'
import { GraficoAprovacaoRiscosSimulador } from './grafico-aprovacao-riscos-simulador'
import '../../../../servicos-global/produto/processo/client/src/pages/dados-tecnicos/DadosTecnicos.css'
import './conferencia-simulador-smart-doc.css'

export type AbaConferenciaSimulador = 'campos' | 'qa' | 'riscos'

const ABAS: { id: AbaConferenciaSimulador; rotulo: string; Icone: ComponentType<IconProps> }[] = [
  { id: 'campos', rotulo: 'Conferência de Campos', Icone: ClipboardText },
  { id: 'riscos', rotulo: 'Análise de Riscos', Icone: ShieldWarning },
  { id: 'qa', rotulo: 'Consultor Inteligente', Icone: Sparkle },
]

type SelecaoConferencia = {
  idArquivo: string
  idDocumento: string
}

type Props = {
  arquivos: ArquivoDemoSimulador[]
  selecao: SelecaoConferencia | null
  onCompararArquivo?: () => void
  onAbaChange?: (aba: AbaConferenciaSimulador) => void
}

const ICONE_SECAO: Record<string, ReactNode> = {
  'Dados gerais': <FileText weight="duotone" size={18} />,
  'Nome do transportador': <Truck weight="duotone" size={18} />,
  Exportador: <Buildings weight="duotone" size={18} />,
  Importador: <User weight="duotone" size={18} />,
  Notify: <Users weight="duotone" size={18} />,
  'Origem e destino': <GlobeHemisphereWest weight="duotone" size={18} />,
  Mercadoria: <Package weight="duotone" size={18} />,
  Embalagem: <Package weight="duotone" size={18} />,
  Frete: <Truck weight="duotone" size={18} />,
  Embarque: <Anchor weight="duotone" size={18} />,
  'Valores declarados': <CurrencyDollar weight="duotone" size={18} />,
  'Dados bancários': <Receipt weight="duotone" size={18} />,
  'Campos adicionais': <FileText weight="duotone" size={18} />,
  Containers: <Anchor weight="duotone" size={18} />,
  'Informações AWB': <Airplane weight="duotone" size={18} />,
}

function iconeSecao(titulo: string) {
  const exato = ICONE_SECAO[titulo]
  if (exato) return exato
  if (/^Item \d+$/i.test(titulo)) return <Package weight="duotone" size={18} />
  if (/^Container \d+$/i.test(titulo)) return <Anchor weight="duotone" size={18} />
  const t = titulo.toLowerCase()
  if (t.includes('importador') || t.includes('consignee')) return <User weight="duotone" size={18} />
  if (t.includes('exportador')) return <Buildings weight="duotone" size={18} />
  if (t.includes('mercadoria') || t.includes('embalagem')) return <Package weight="duotone" size={18} />
  if (t.includes('embarque')) return <Anchor weight="duotone" size={18} />
  return <FileText weight="duotone" size={18} />
}

export function ConferenciaSimuladorSmartDoc({ arquivos, selecao, onCompararArquivo, onAbaChange }: Props) {
  const [aba, setAba] = useState<AbaConferenciaSimulador>('campos')
  const [progressoColapsado, setProgressoColapsado] = useState(false)
  const [secoesColapsadas, setSecoesColapsadas] = useState<Set<string>>(() => new Set())
  const [filtro, setFiltro] = useState<'todos' | 'preenchidos' | 'vazios'>('todos')
  const [busca, setBusca] = useState('')
  const [conferenciaManualRiscos, setConferenciaManualRiscos] = useState({ marcados: 0, total: 0 })

  const aoMudarConferenciaManualRiscos = useCallback((marcados: number, total: number) => {
    setConferenciaManualRiscos({ marcados, total })
  }, [])

  useEffect(() => {
    onAbaChange?.(aba)
  }, [aba, onAbaChange])

  function selecionarAba(id: AbaConferenciaSimulador) {
    setAba(id)
  }

  const arquivosCompletos = arquivos.filter((a) => a.status === 'completo')

  const arquivoAtual = useMemo(() => {
    if (selecao) {
      return arquivosCompletos.find((a) => a.id === selecao.idArquivo) ?? arquivosCompletos[0]
    }
    return arquivosCompletos[0]
  }, [arquivosCompletos, selecao])

  const documentoAtual: DocumentoSimulador | null = useMemo(() => {
    if (!arquivoAtual) return null
    if (selecao?.idDocumento) {
      return arquivoAtual.documentosIdentificados.find((d) => d.id === selecao.idDocumento) ?? arquivoAtual.documentosIdentificados[0] ?? null
    }
    return arquivoAtual.documentosIdentificados[0] ?? null
  }, [arquivoAtual, selecao])

  const secoesBase = useMemo(
    () => (documentoAtual ? obterSecoesConferenciaSimulador(documentoAtual) : []),
    [documentoAtual],
  )

  useEffect(() => {
    setSecoesColapsadas(
      new Set(
        secoesBase
          .filter((s) => /^Item \d+$/i.test(s.titulo) || /^Container \d+$/i.test(s.titulo))
          .map((s) => s.id),
      ),
    )
    setBusca('')
    setFiltro('todos')
  }, [documentoAtual?.id, secoesBase.length])

  const secoesVisiveis = useMemo(() => {
    const buscaNorm = busca.trim().toLowerCase()
    return secoesBase
      .map((secao) => ({
        ...secao,
        campos: secao.campos.filter((campo) => {
          if (filtro === 'preenchidos' && campo.status !== 'preenchido') return false
          if (filtro === 'vazios' && campo.status === 'preenchido') return false
          if (!buscaNorm) return true
          return (
            campo.rotulo.toLowerCase().includes(buscaNorm) ||
            (campo.valor?.toLowerCase().includes(buscaNorm) ?? false)
          )
        }),
      }))
      .filter((secao) => secao.campos.length > 0)
  }, [secoesBase, filtro, busca])

  const stats = useMemo(() => calcularEstatisticasConferenciaSimulador(secoesBase), [secoesBase])

  const tituloContexto = arquivoAtual
    ? `${arquivoAtual.nome}${documentoAtual ? ` | ${documentoAtual.rotulo}` : ''}`
    : ''

  function toggleSecao(id: string) {
    setSecoesColapsadas((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const todasColapsadas =
    secoesVisiveis.length > 0 && secoesVisiveis.every((s) => secoesColapsadas.has(s.id))

  function toggleTodasSecoes() {
    if (todasColapsadas) {
      setSecoesColapsadas(new Set())
      return
    }
    setSecoesColapsadas(new Set(secoesVisiveis.map((s) => s.id)))
  }

  return (
    <div className="sds-nl-principal-conferencia">
      <div className="sds-nl-conf-tabs-bar">
        <div className="sds-nl-conf-tabs" role="tablist" aria-label="Conferência da leitura" data-sds-tutorial-alvo="conf-abas-principais">
          {ABAS.map(({ id, rotulo, Icone }) => {
            const ativo = aba === id
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={ativo}
                className={`sds-nl-conf-tab${ativo ? ' sds-nl-conf-tab--ativo' : ''}`}
                onClick={() => selecionarAba(id)}
              >
                <Icone className="sds-nl-conf-tab-icone" size={16} weight="regular" aria-hidden />
                <span className="sds-nl-conf-tab-rotulo">{rotulo}</span>
              </button>
            )
          })}
        </div>

        {aba === 'riscos' && conferenciaManualRiscos.marcados > 0 && (
          <div className="sds-nl-conf-tabs-conferencia" aria-live="polite">
            <GraficoAprovacaoRiscosSimulador
              marcados={conferenciaManualRiscos.marcados}
              total={conferenciaManualRiscos.total}
              classe="sds-riscos-grafico-aprovacao--tabs"
            />
          </div>
        )}
      </div>

      {aba === 'campos' && (
        <div className="sds-nl-conf-campos dt-layout">
          {!arquivoAtual ? (
            <p className="sds-nl-conf-vazio">Aguardando análise dos arquivos.</p>
          ) : (
            <>
              <div className="sds-nl-conf-contexto-linha">
                <span className="sds-nl-conf-contexto-texto">{tituloContexto}</span>
                {onCompararArquivo && (
                  <button
                    type="button"
                    className="sds-nl-btn sds-nl-btn--prim sds-nl-btn--sm"
                    onClick={onCompararArquivo}
                    data-sds-tutorial-alvo="conf-comparar"
                  >
                    Comparar arquivo
                  </button>
                )}
              </div>

              <section className={`sds-nl-conf-progresso-bloco${progressoColapsado ? ' sds-nl-conf-progresso-bloco--colapsado' : ''}`} data-sds-tutorial-alvo="conf-progresso">
                <button
                  type="button"
                  className="sds-nl-conf-progresso-header"
                  onClick={() => setProgressoColapsado((p) => !p)}
                  aria-expanded={!progressoColapsado}
                >
                  <div className="sds-nl-conf-progresso-header-esq">
                    <CaretDown
                      weight="bold"
                      size={14}
                      className={`dt-caret${progressoColapsado ? ' dt-caret--colapsado' : ''}`}
                    />
                    <strong className="sds-nl-conf-progresso-titulo">Progresso da Conferência</strong>
                  </div>
                  <div className="sds-nl-conf-progresso-busca" onClick={(e) => e.stopPropagation()}>
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
                        <button type="button" className="dt-toc-busca-limpar" onClick={() => setBusca('')} aria-label="Limpar busca">
                          <X size={12} weight="bold" />
                        </button>
                      )}
                    </div>
                  </div>
                </button>

                {!progressoColapsado && (
                  <div className="sds-nl-conf-progresso-corpo">
                    <div className="sds-nl-conf-progresso-linha">
                      <div className="sds-nl-conf-progresso-barra" role="progressbar" aria-valuenow={stats.percentual} aria-valuemin={0} aria-valuemax={100}>
                        <div className="sds-nl-conf-progresso-barra-fill" style={{ width: `${stats.percentual}%` }} />
                      </div>
                      <span className="sds-nl-conf-progresso-pct">{stats.percentual}%</span>
                    </div>
                    <div className="sds-nl-conf-progresso-metricas" data-sds-tutorial-alvo="conf-filtros">
                      <button type="button" className={`sds-nl-conf-progresso-metrica sds-nl-conf-progresso-metrica--todos${filtro === 'todos' ? ' sds-nl-conf-progresso-metrica--ativo' : ''}`} onClick={() => setFiltro('todos')} aria-pressed={filtro === 'todos'}>
                        <span className="sds-nl-conf-progresso-metrica-valor">{stats.total}</span>
                        <span className="sds-nl-conf-progresso-metrica-rotulo">
                          <ShieldCheck size={12} weight="fill" aria-hidden />
                          Verificados
                        </span>
                      </button>
                      <button type="button" className={`sds-nl-conf-progresso-metrica sds-nl-conf-progresso-metrica--preenchido${filtro === 'preenchidos' ? ' sds-nl-conf-progresso-metrica--ativo' : ''}`} onClick={() => setFiltro('preenchidos')} aria-pressed={filtro === 'preenchidos'}>
                        <span className="sds-nl-conf-progresso-metrica-valor">{stats.preenchidos}</span>
                        <span className="sds-nl-conf-progresso-metrica-rotulo">
                          <CheckCircle size={12} weight="fill" aria-hidden />
                          Preenchidos
                        </span>
                      </button>
                      <button type="button" className={`sds-nl-conf-progresso-metrica sds-nl-conf-progresso-metrica--vazio${filtro === 'vazios' ? ' sds-nl-conf-progresso-metrica--ativo' : ''}`} onClick={() => setFiltro('vazios')} aria-pressed={filtro === 'vazios'}>
                        <span className="sds-nl-conf-progresso-metrica-valor">{stats.vazios}</span>
                        <span className="sds-nl-conf-progresso-metrica-rotulo">
                          <Circle size={12} weight="fill" aria-hidden />
                          Vazios
                        </span>
                      </button>
                      <button type="button" className="sds-nl-conf-progresso-metrica sds-nl-conf-progresso-metrica--alterado" disabled>
                        <span className="sds-nl-conf-progresso-metrica-valor">0</span>
                        <span className="sds-nl-conf-progresso-metrica-rotulo">
                          <PencilSimple size={12} weight="fill" aria-hidden />
                          Preenchidos alterados
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </section>

              <main className="dt-main">
                {secoesVisiveis.length > 0 && (
                  <div className="dt-main-toolbar sds-nl-conf-secoes-toolbar">
                    <button type="button" className="dt-main-toolbar-btn dt-main-toolbar-btn--right" onClick={toggleTodasSecoes}>
                      <CaretDown weight="bold" size={12} className={`dt-caret${todasColapsadas ? ' dt-caret--colapsado' : ''}`} />
                      {todasColapsadas ? 'Expandir todas' : 'Recolher todas'}
                    </button>
                  </div>
                )}

                {secoesVisiveis.length === 0 ? (
                  <p className="sds-nl-conf-vazio">Nenhum campo encontrado para este documento.</p>
                ) : (
                  secoesVisiveis.map((secao: SecaoConferenciaSimulador, indiceSecao) => {
                    const preenchidosSecao = secao.campos.filter((c) => c.status === 'preenchido').length
                    const pctSecao = secao.campos.length ? Math.round((preenchidosSecao / secao.campos.length) * 100) : 0
                    const colapsada = secoesColapsadas.has(secao.id)
                    return (
                      <section
                        key={secao.id}
                        className={`dt-secao${colapsada ? ' dt-secao--colapsada' : ''}`}
                        {...(indiceSecao === 0 ? { 'data-sds-tutorial-alvo': 'conf-secoes' } : {})}
                      >
                        <button type="button" className="dt-secao-header" onClick={() => toggleSecao(secao.id)} aria-expanded={!colapsada}>
                          <div className="dt-secao-title">
                            <CaretDown weight="bold" size={14} className={`dt-caret${colapsada ? ' dt-caret--colapsado' : ''}`} />
                            <span className="dt-secao-icon">{iconeSecao(secao.titulo)}</span>
                            <h2>{secao.titulo}</h2>
                          </div>
                          <div className="dt-secao-completude">
                            <div className="dt-secao-progress">
                              <div className="dt-secao-progress-fill" style={{ width: `${pctSecao}%`, background: pctSecao === 100 ? '#34d399' : '#a78bfa' }} />
                            </div>
                            <span className="dt-secao-pill">
                              {preenchidosSecao}/{secao.campos.length}
                            </span>
                          </div>
                        </button>
                        {!colapsada && (
                          <div className="dt-grid" {...(indiceSecao === 0 ? { 'data-sds-tutorial-alvo': 'conf-campos' } : {})}>
                            {secao.campos.map((campo) => (
                              <CampoLinhaConferenciaSimuladorSmartDoc
                                key={campo.chave}
                                chave={campo.chave}
                                rotulo={campo.rotulo}
                                valor={campo.valor}
                                status={campo.status}
                              />
                            ))}
                          </div>
                        )}
                      </section>
                    )
                  })
                )}
              </main>
            </>
          )}
        </div>
      )}

      {aba === 'qa' && (
        <div className="sds-nl-conf-tab-panel">
          <QaSimuladorSmartDoc
            arquivos={arquivos}
            documentoAtual={documentoAtual}
            tituloContexto={tituloContexto}
          />
        </div>
      )}

      {aba === 'riscos' && (
        <div className="sds-nl-conf-tab-panel">
          <RiscosSimuladorSmartDoc
            arquivos={arquivos}
            selecao={selecao}
            onCompararArquivo={onCompararArquivo}
            onConferenciaManualChange={aoMudarConferenciaManualRiscos}
          />
        </div>
      )}

    </div>
  )
}
