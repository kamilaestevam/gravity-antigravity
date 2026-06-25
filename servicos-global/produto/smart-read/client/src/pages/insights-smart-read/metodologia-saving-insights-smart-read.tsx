import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { BookOpenText, Calculator, ClockCounterClockwise, Info, Table } from '@phosphor-icons/react'
import { ModalOverlay } from '@nucleo/modal-global'
import {
  agregarTempoExtracaoIaMedioPorTipoLeituraSmartRead,
  type EntradaAgregacaoTempoExtracaoIaSmartRead,
} from '../../../../shared/metricas-transacao-leitura-smart-read'
import {
  LINHAS_TABELA_EXIBICAO_BASE_CALCULO_SMART_READ,
  OBSERVACOES_DOCUMENTO_MEDIO_ESTUDO_SMART_READ,
  PARAMETROS_FINANCEIROS_SMART_READ,
  calcularMediasTabelaBaseCalculoSmartRead,
  resolverParametrosTempoDocumentoSmartRead,
} from './dados-base-produto-tempo-smart-read'
import { formatarMoedaInsightsSmartRead } from './calcular-metricas-insights-leitura-smart-read'
import '../../shared/smart-read-leituras.css'
import './insights-smart-read.css'

type MetodologiaSavingContexto = {
  abrir: () => void
  recarregar?: () => void
}

const MetodologiaSavingContext = createContext<MetodologiaSavingContexto | null>(null)

const SISTEMAS_ESTUDO_TEMPO_MANUAL =
  'SAP S/4HANA e GTS, TOTVS Protheus, Datasul, Oracle GTM, Linx, Sankhya, ONESOURCE, Ecomex NSI, Bysoft, Ellas, CargoWise One, DATI Import, além de Mercante/Siscomex/DUIMP/DUE'

function formatarMinutosTabela(valor: number): string {
  return `${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 })} min`
}

function formatarSegundosMedidosTabela(segundos: number): string {
  if (segundos < 10) {
    return `${segundos.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} s`
  }
  return `${Math.round(segundos).toLocaleString('pt-BR')} s`
}

function formatarTempoSmartReadMedidoTabela(
  agregado: ReturnType<typeof agregarTempoExtracaoIaMedioPorTipoLeituraSmartRead>,
  tipo: (typeof LINHAS_TABELA_EXIBICAO_BASE_CALCULO_SMART_READ)[number]['tipo_parametro'],
): string {
  const medido = agregado.por_tipo[tipo]
  if (!medido) return '—'
  return formatarSegundosMedidosTabela(medido.tempo_medio_segundos)
}

function SecaoMetodologiaSaving({
  icone,
  titulo,
  children,
}: {
  icone: ReactNode
  titulo: string
  children: ReactNode
}) {
  return (
    <section className="sr-insights-metodologia-secao">
      <header className="sr-insights-metodologia-secao__cabecalho">
        <span className="sr-insights-metodologia-secao__icone" aria-hidden>
          {icone}
        </span>
        <h3 className="sr-insights-metodologia-secao__titulo">{titulo}</h3>
      </header>
      <div className="sr-insights-metodologia-secao__corpo">{children}</div>
    </section>
  )
}

export function ConteudoMetodologiaSavingInsightsSmartRead({
  transacoes = [],
}: {
  transacoes?: EntradaAgregacaoTempoExtracaoIaSmartRead[]
}) {
  const custoHora =
    PARAMETROS_FINANCEIROS_SMART_READ.custo_hora_operador_brl *
    PARAMETROS_FINANCEIROS_SMART_READ.markup_venda
  const custoHoraRotulo = formatarMoedaInsightsSmartRead(custoHora)
  const custoOperadorRotulo = formatarMoedaInsightsSmartRead(
    PARAMETROS_FINANCEIROS_SMART_READ.custo_hora_operador_brl,
  )
  const medias = calcularMediasTabelaBaseCalculoSmartRead()
  const temposSmartReadMedidos = useMemo(
    () => agregarTempoExtracaoIaMedioPorTipoLeituraSmartRead(transacoes),
    [transacoes],
  )

  return (
    <div className="sr-insights-metodologia-saving sr-insights-metodologia-saving--modal">
      <p className="sr-insights-metodologia-saving__lead">
        Comparamos o tempo estimado de digitação e correção <strong>manual</strong> com o fluxo{' '}
        <strong>Smart Read</strong> por tipo de documento. Os campos editados na conferência entram
        no saving de erros (mesma regra de acerto/erro dos rankings).
      </p>

      <SecaoMetodologiaSaving
        icone={<ClockCounterClockwise weight="duotone" size={18} />}
        titulo="Como chegamos nos tempos manuais"
      >
        <div className="sr-insights-metodologia-saving__destaque">
          <p>
            Cada tempo manual é o tempo médio para reincluir o documento à mão, levantado a partir
            do estudo comparativo entre os sistemas usados no comércio exterior ({SISTEMAS_ESTUDO_TEMPO_MANUAL}
            ).
          </p>
          <p>
            O estudo soma o tempo campo a campo (número do documento, datas, portos, partes,
            contêineres, itens com NCM/quantidade/valor) considerando um assistente de comércio
            exterior com ~2 anos de experiência.
          </p>
          <p className="sr-insights-metodologia-saving__destaque-fecho">
            O tempo <strong>Smart Read</strong> é o tempo de extração automática mais a conferência
            humana dos campos.
          </p>
        </div>
      </SecaoMetodologiaSaving>

      <SecaoMetodologiaSaving
        icone={<Calculator weight="duotone" size={18} />}
        titulo="Fórmulas"
      >
        <ul className="sr-insights-metodologia-saving__formulas">
          <li>
            <span className="sr-insights-metodologia-saving__formula-nome">Saving digitação</span>
            <span className="sr-insights-metodologia-saving__formula-expr">
              soma do tempo manual fixo por documento − tempo de leitura medido (cronômetro do processo)
            </span>
          </li>
          <li>
            <span className="sr-insights-metodologia-saving__formula-nome">Saving em erros (KPI)</span>
            <span className="sr-insights-metodologia-saving__formula-expr">
              quantidade de campos editados na conferência
            </span>
          </li>
          <li>
            <span className="sr-insights-metodologia-saving__formula-nome">Tempo saving erros</span>
            <span className="sr-insights-metodologia-saving__formula-expr">
              campos editados × (correção manual − correção Smart Read por campo)
            </span>
          </li>
          <li>
            <span className="sr-insights-metodologia-saving__formula-nome">Custo evitado</span>
            <span className="sr-insights-metodologia-saving__formula-expr">
              minutos economizados ÷ 60 × {custoHoraRotulo}/h (operador {custoOperadorRotulo}/h +
              markup comercial {PARAMETROS_FINANCEIROS_SMART_READ.markup_venda})
            </span>
          </li>
        </ul>
      </SecaoMetodologiaSaving>

      <SecaoMetodologiaSaving
        icone={<Table weight="duotone" size={18} />}
        titulo="Tempos por tipo de documento"
      >
        <div className="sr-insights-metodologia-saving__tabela-wrap">
          <table className="sr-insights-metodologia-saving__tabela">
            <thead>
              <tr>
                <th scope="col">Tipo</th>
                <th scope="col">
                  <span className="sr-insights-metodologia-saving__th-stack">
                    Digitação
                    <span className="sr-insights-metodologia-saving__th-stack-sub">manual</span>
                  </span>
                </th>
                <th scope="col">
                  <span className="sr-insights-metodologia-saving__th-stack">
                    Digitação
                    <span className="sr-insights-metodologia-saving__th-stack-sub">SR medido (s)</span>
                  </span>
                </th>
                <th scope="col">
                  <span className="sr-insights-metodologia-saving__th-stack">
                    Correção/campo
                    <span className="sr-insights-metodologia-saving__th-stack-sub">manual</span>
                  </span>
                </th>
                <th scope="col">
                  <span className="sr-insights-metodologia-saving__th-stack">
                    Correção/campo
                    <span className="sr-insights-metodologia-saving__th-stack-sub">Smart Read</span>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {LINHAS_TABELA_EXIBICAO_BASE_CALCULO_SMART_READ.map((linha) => {
                const params = resolverParametrosTempoDocumentoSmartRead(linha.tipo_parametro)
                return (
                  <tr key={linha.rotulo_exibicao}>
                    <th scope="row">{linha.rotulo_exibicao}</th>
                    <td>{formatarMinutosTabela(linha.tempo_digitação_manual_minutos)}</td>
                    <td>{formatarTempoSmartReadMedidoTabela(temposSmartReadMedidos, linha.tipo_parametro)}</td>
                    <td>
                      {formatarMinutosTabela(params.tempo_correcao_erro_manual_minutos_por_campo)}
                    </td>
                    <td>
                      {formatarMinutosTabela(params.tempo_correcao_erro_smart_read_minutos_por_campo)}
                    </td>
                  </tr>
                )
              })}
              <tr className="sr-insights-metodologia-saving__tabela-linha-media">
                <th scope="row">Média</th>
                <td>{formatarMinutosTabela(medias.tempo_digitação_manual_minutos)}</td>
                <td>
                  {temposSmartReadMedidos.media_ponderada_segundos != null
                    ? formatarSegundosMedidosTabela(temposSmartReadMedidos.media_ponderada_segundos)
                    : '—'}
                </td>
                <td>
                  {formatarMinutosTabela(medias.tempo_correcao_erro_manual_minutos_por_campo)}
                </td>
                <td>
                  {formatarMinutosTabela(medias.tempo_correcao_erro_smart_read_minutos_por_campo)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="sr-insights-metodologia-saving__tabela-nota">
          Tempos de digitação manual calculados na tabela geral do estudo (seção 19 do estudo de BL),
          com base nos documentos médios descritos abaixo. A coluna <strong>SR medido (s)</strong>{' '}
          usa a média do tempo real de extração IA das leituras visíveis (
          {temposSmartReadMedidos.documentos_amostra > 0
            ? `${Math.round(temposSmartReadMedidos.documentos_amostra)} documento(s) na amostra`
            : 'sem amostra nesta tela — exibe «—»'}
          ). A linha <strong>Média</strong> na digitação manual e correções é aritmética dos tipos;
          na coluna SR, média ponderada da amostra.
        </p>
      </SecaoMetodologiaSaving>

      <SecaoMetodologiaSaving
        icone={<Info weight="duotone" size={18} />}
        titulo="Observações — documento médio do estudo"
      >
        <ul className="sr-insights-metodologia-saving__observacoes">
          {OBSERVACOES_DOCUMENTO_MEDIO_ESTUDO_SMART_READ.map((item) => (
            <li key={item.rotulo}>
              <strong>{item.rotulo}:</strong> {item.texto}
            </li>
          ))}
        </ul>
      </SecaoMetodologiaSaving>

      <footer className="sr-insights-metodologia-saving__rodape">
        <BookOpenText weight="duotone" size={16} className="sr-insights-metodologia-saving__rodape-icone" />
        <p>
          <strong>Fonte:</strong> DOCS BASE PRODUTO — estudos comparativos de tempo de digitação (BL,
          Packing List, Pedido/Proforma/Invoice) embutidos no produto. Valores poderão ser editáveis
          no Configurador quando a tabela oficial for publicada.
        </p>
      </footer>
    </div>
  )
}

export function ProvedorMetodologiaSavingInsightsSmartRead({
  children,
  transacoes = [],
  aoAbrir,
}: {
  children: ReactNode
  transacoes?: EntradaAgregacaoTempoExtracaoIaSmartRead[]
  /** Recarga de amostra antes de exibir o modal (ex.: histórico do workspace). */
  aoAbrir?: () => void
}) {
  const [aberto, setAberto] = useState(false)
  const abrir = useCallback(() => {
    aoAbrir?.()
    setAberto(true)
  }, [aoAbrir])
  const fechar = useCallback(() => setAberto(false), [])

  return (
    <MetodologiaSavingContext.Provider value={{ abrir, recarregar: aoAbrir }}>
      {children}
      <ModalOverlay
        aberto={aberto}
        aoFechar={fechar}
        titulo="Base de cálculo"
        subtitulo="Economia estimada — manual vs Smart Read"
        tamanho="xl"
        larguraMaxima="min(72rem, calc(100vw - 2rem))"
        botoes={[{ rotulo: 'Fechar', variante: 'secondary', ao_clicar: fechar }]}
      >
        <ConteudoMetodologiaSavingInsightsSmartRead transacoes={transacoes} />
      </ModalOverlay>
    </MetodologiaSavingContext.Provider>
  )
}

export function LinkMetodologiaSavingInsightsSmartRead({ children }: { children: ReactNode }) {
  const contexto = useContext(MetodologiaSavingContext)

  const aoClicar = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    contexto?.abrir()
  }

  return (
    <button type="button" className="sr-insights-link-metodologia" onClick={aoClicar}>
      {children}
    </button>
  )
}
