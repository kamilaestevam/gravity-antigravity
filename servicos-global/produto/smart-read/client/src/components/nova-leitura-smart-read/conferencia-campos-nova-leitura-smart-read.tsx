/**
 * ConferenciaCamposNovaLeituraSmartRead — layout padrão Processo / Dados do Processo (dt-*)
 */

import { useEffect, useMemo, useState } from 'react'
import {
  Anchor,
  Buildings,
  CaretDown,
  CheckCircle,
  Circle,
  FileText,
  MagnifyingGlass,
  Package,
  Truck,
  User,
  Users,
  X,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import { extrairDocumentosArquivoLocal } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import {
  calcularEstatisticasConferencia,
  extrairSecoesConferenciaLeitura,
  type SecaoConferenciaLeitura,
} from '../../shared/extrair-secoes-conferencia-leitura-smart-read'
import '../../../../../processo/client/src/pages/dados-tecnicos/DadosTecnicos.css'

type FiltroConferencia = 'todos' | 'preenchidos' | 'vazios'

type Props = {
  arquivo: ArquivoLocalNovaLeitura
  indiceDocumento: number
  onCompararArquivo?: () => void
  ocultarComparar?: boolean
}

function iconeSecao(titulo: string) {
  const t = titulo.toLowerCase()
  if (t.includes('document')) return <FileText weight="duotone" size={18} />
  if (t.includes('carrier')) return <Truck weight="duotone" size={18} />
  if (t.includes('exporter')) return <Buildings weight="duotone" size={18} />
  if (t.includes('importer')) return <User weight="duotone" size={18} />
  if (t.includes('notify')) return <Users weight="duotone" size={18} />
  if (t.includes('shipment') || t.includes('container')) return <Anchor weight="duotone" size={18} />
  return <Package weight="duotone" size={18} />
}

function filtrarCamposSecao(secao: SecaoConferenciaLeitura, filtro: FiltroConferencia, busca: string) {
  const buscaNorm = busca.trim().toLowerCase()
  return secao.campos.filter((campo) => {
    if (filtro === 'preenchidos' && !campo.preenchido) return false
    if (filtro === 'vazios' && campo.preenchido) return false
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
}: Props) {
  const [filtro, setFiltro] = useState<FiltroConferencia>('todos')
  const [busca, setBusca] = useState('')
  const [secoesColapsadas, setSecoesColapsadas] = useState<Set<string>>(() => new Set())

  const documentos = extrairDocumentosArquivoLocal(arquivo)
  const documentoAtual = documentos[indiceDocumento]
  const arquivoApi =
    arquivo.leitura?.arquivos.find((a) => a.id_arquivo === arquivo.id_arquivo) ??
    arquivo.leitura?.arquivos[0]
  const extracao = arquivoApi?.resultado_extracao?.[indiceDocumento]
  const secoes = useMemo(
    () => extrairSecoesConferenciaLeitura(extracao?.dados ?? {}),
    [extracao?.dados],
  )
  const stats = useMemo(() => calcularEstatisticasConferencia(secoes), [secoes])

  useEffect(() => {
    setSecoesColapsadas(new Set(secoes.map((s) => s.id)))
  }, [extracao?.dados, indiceDocumento])

  const campoAssinado = useMemo(
    () =>
      secoes
        .flatMap((s) => s.campos)
        .find((c) => c.chave === 'isSigned'),
    [secoes],
  )

  const secoesVisiveis = useMemo(
    () =>
      secoes
        .map((secao) => ({
          ...secao,
          campos: filtrarCamposSecao(secao, filtro, busca).filter((c) => c.chave !== 'isSigned'),
        }))
        .filter((secao) => secao.campos.length > 0),
    [secoes, filtro, busca],
  )

  function toggleSecao(id: string) {
    setSecoesColapsadas((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
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

      <div className="sr-conf-legenda" aria-label="Legenda de status dos campos">
        <span>
          <CheckCircle size={14} weight="fill" className="sr-conf-legenda-ok" /> Todos os campos preenchidos
        </span>
        <span>
          <Circle size={14} weight="fill" className="sr-conf-legenda-info" /> Conflitos (não impeditivo)
        </span>
        <span>
          <Circle size={14} weight="fill" className="sr-conf-legenda-vazio" /> Campos não preenchidos
        </span>
      </div>

      <div className="sr-conf-progresso-bloco">
        <div className="sr-conf-progresso-topo">
          <strong>Progresso da Conferência</strong>
          <span>
            {stats.preenchidos} preenchidos · {stats.vazios} vazios
          </span>
        </div>
        <div className="sr-conf-progresso-linha">
          <div className="sr-conf-progresso-barra" aria-hidden>
            <div className="sr-conf-progresso-barra-fill" style={{ width: `${stats.percentual}%` }} />
          </div>
          <span className="sr-conf-progresso-pct">{stats.percentual}%</span>
        </div>
        <div className="sr-conf-filtros" role="tablist" aria-label="Filtrar campos">
          {(
            [
              ['todos', 'Todos', stats.total],
              ['preenchidos', 'Preenchidos', stats.preenchidos],
              ['vazios', 'Vazios', stats.vazios],
            ] as const
          ).map(([id, rotulo, qtd]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={filtro === id}
              className={`sr-conf-filtro${filtro === id ? ' sr-conf-filtro--ativo' : ''}`}
              onClick={() => setFiltro(id)}
            >
              {rotulo} {qtd}
            </button>
          ))}
        </div>
      </div>

      {campoAssinado && (
        <div
          className={`sr-conf-assinado${campoAssinado.valor === 'Sim' ? ' sr-conf-assinado--ok' : ''}`}
        >
          <CheckCircle size={16} weight="fill" />
          <span>Documento {campoAssinado.valor === 'Sim' ? 'Assinado' : 'Não Assinado'}</span>
        </div>
      )}

      <main className="dt-main">
        <div className="dt-main-toolbar">
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

        {secoesVisiveis.length === 0 ? (
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
                    {secao.campos.map((campo) => (
                      <div
                        key={campo.chave}
                        className={`dt-row dt-row--${campo.preenchido ? 'preenchido' : 'vazio-opc'}`}
                      >
                        <div className="dt-row-status" aria-hidden="true" />
                        <div className="dt-row-head">
                          <span className="dt-row-label">{campo.rotulo}</span>
                        </div>
                        <div className="dt-row-value">
                          {campo.valor ? (
                            <span className="dt-row-text">{campo.valor}</span>
                          ) : (
                            <span className="dt-row-empty">—</span>
                          )}
                        </div>
                      </div>
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
