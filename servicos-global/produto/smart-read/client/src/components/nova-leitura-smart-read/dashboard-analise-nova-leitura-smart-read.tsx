/**
 * DashboardAnaliseNovaLeituraSmartRead — passo 2: métricas + gráfico de IAs
 */

import { useEffect, useMemo, useState } from 'react'
import { Brain, ChartLineUp, Clock, FileText, Timer } from '@phosphor-icons/react'
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import { calcularSavingAgregadoTransacoesSmartRead } from '../../shared/calcular-saving-agregado-transacoes-smart-read'
import { calcularSavingNovaLeituraSmartRead } from '../../shared/calcular-saving-nova-leitura-smart-read'
import {
  formatarSavingHorasLeitura,
} from '../../shared/formatacao-leitura-smart-read'
import {
  mesclarTransacoesAgregacaoBaseCalculoSmartRead,
  montarEntradaAgregacaoNovaLeituraEmAndamentoSmartRead,
} from '../../shared/montar-entrada-agregacao-nova-leitura-smart-read'
import { useSavingAcumuladoWorkspaceSmartRead } from '../../shared/use-saving-acumulado-workspace-smart-read'
import {
  LinkMetodologiaSavingInsightsSmartRead,
  ProvedorMetodologiaSavingInsightsSmartRead,
} from '../../pages/insights-smart-read/metodologia-saving-insights-smart-read'

type Props = {
  arquivos: ArquivoLocalNovaLeitura[]
  analiseCompleta: boolean
  processamentoComErro: boolean
  inicioAnalise: number | null
  tempoAnaliseSegundos: number | null
}

type EtapaAnalise = {
  id: number
  rotulo: string
  progresso: number
  status: 'pendente' | 'andamento' | 'completo'
}

function formatarTempo(totalSegundos: number): string {
  const horas = Math.floor(totalSegundos / 3600)
  const minutos = Math.floor((totalSegundos % 3600) / 60)
  const segundos = totalSegundos % 60
  return [horas, minutos, segundos].map((n) => String(n).padStart(2, '0')).join(' : ')
}

function calcularProgressoEtapas(
  elapsedSegundos: number,
  analiseCompleta: boolean,
  processamentoComErro: boolean,
): EtapaAnalise[] {
  if (processamentoComErro) {
    return [
      { id: 1, rotulo: 'Primeira análise', progresso: 0, status: 'pendente' },
      { id: 2, rotulo: 'Segunda análise', progresso: 0, status: 'pendente' },
      { id: 3, rotulo: 'Terceira análise', progresso: 0, status: 'pendente' },
    ]
  }

  if (analiseCompleta) {
    return [
      { id: 1, rotulo: 'Primeira análise', progresso: 100, status: 'completo' },
      { id: 2, rotulo: 'Segunda análise', progresso: 100, status: 'completo' },
      { id: 3, rotulo: 'Terceira análise', progresso: 100, status: 'completo' },
    ]
  }

  const p1 = Math.min(100, Math.round((elapsedSegundos / 6) * 100))
  const p2 = elapsedSegundos > 4 ? Math.min(100, Math.round(((elapsedSegundos - 4) / 8) * 100)) : 0
  const p3 = elapsedSegundos > 10 ? Math.min(100, Math.round(((elapsedSegundos - 10) / 6) * 100)) : 0

  return [
    {
      id: 1,
      rotulo: 'Primeira análise',
      progresso: p1,
      status: p1 >= 100 ? 'completo' : 'andamento',
    },
    {
      id: 2,
      rotulo: 'Segunda análise',
      progresso: p2,
      status: p2 >= 100 ? 'completo' : p2 > 0 ? 'andamento' : 'pendente',
    },
    {
      id: 3,
      rotulo: 'Terceira análise',
      progresso: p3,
      status: p3 >= 100 ? 'completo' : p3 > 0 ? 'andamento' : 'pendente',
    },
  ]
}

export function DashboardAnaliseNovaLeituraSmartRead({
  arquivos,
  analiseCompleta,
  processamentoComErro,
  inicioAnalise,
  tempoAnaliseSegundos,
}: Props) {
  const [agora, setAgora] = useState(Date.now())
  const savingAcumulado = useSavingAcumuladoWorkspaceSmartRead(true, {
    gatilhoRecarga: analiseCompleta,
  })

  useEffect(() => {
    if (analiseCompleta || processamentoComErro || !inicioAnalise || tempoAnaliseSegundos != null) return
    const id = window.setInterval(() => setAgora(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [analiseCompleta, processamentoComErro, inicioAnalise, tempoAnaliseSegundos])

  const elapsedSegundos = useMemo(() => {
    if (tempoAnaliseSegundos != null) return tempoAnaliseSegundos
    if (inicioAnalise) return Math.floor((agora - inicioAnalise) / 1000)
    return 0
  }, [agora, inicioAnalise, tempoAnaliseSegundos])
  const etapas = useMemo(
    () => calcularProgressoEtapas(elapsedSegundos, analiseCompleta, processamentoComErro),
    [elapsedSegundos, analiseCompleta, processamentoComErro],
  )

  const progressoGeral = Math.round(
    etapas.reduce((acc, etapa) => acc + etapa.progresso, 0) / etapas.length,
  )

  const saving = useMemo(() => {
    if (processamentoComErro || arquivos.length <= 0) return { minutos: null, brl: null }
    return calcularSavingNovaLeituraSmartRead(arquivos, {
      tempoLeituraSegundos: elapsedSegundos,
    })
  }, [processamentoComErro, arquivos, elapsedSegundos])

  const idLeituraAtual = arquivos.find((item) => item.id_leitura)?.id_leitura ?? null

  const savingAcumuladoExibicao = useMemo(() => {
    if (savingAcumulado.carregando) {
      return { minutos: null as number | null, totalDocumentos: 0 }
    }

    const transacoesHistorico = idLeituraAtual
      ? savingAcumulado.transacoes.filter((item) => item.id_leitura !== idLeituraAtual)
      : savingAcumulado.transacoes
    const agregadoHistorico = calcularSavingAgregadoTransacoesSmartRead(transacoesHistorico)
    const minutosTotais = (agregadoHistorico.minutos ?? 0) + (saving.minutos ?? 0)

    return {
      minutos: minutosTotais > 0 ? minutosTotais : null,
      totalDocumentos: savingAcumulado.totalDocumentos,
    }
  }, [
    savingAcumulado.carregando,
    savingAcumulado.transacoes,
    savingAcumulado.totalDocumentos,
    idLeituraAtual,
    saving.minutos,
  ])

  const barraAcumuladoPct =
    !savingAcumulado.carregando && savingAcumuladoExibicao.totalDocumentos > 0 ? 100 : 0
  const entradaLeituraAtual = useMemo(
    () => montarEntradaAgregacaoNovaLeituraEmAndamentoSmartRead(arquivos),
    [arquivos],
  )
  const transacoesBaseCalculo = useMemo(
    () =>
      mesclarTransacoesAgregacaoBaseCalculoSmartRead(
        savingAcumulado.transacoes,
        entradaLeituraAtual,
        idLeituraAtual,
      ),
    [savingAcumulado.transacoes, entradaLeituraAtual, idLeituraAtual],
  )

  return (
    <ProvedorMetodologiaSavingInsightsSmartRead
      transacoes={transacoesBaseCalculo}
      aoAbrir={() => void savingAcumulado.recarregar()}
    >
    <div className="sr-wizard-principal sr-wizard-principal--analise">
      {processamentoComErro && (
        <div className="sr-wizard-analise-alerta-erro" role="alert">
          A análise não pôde ser concluída. Verifique os arquivos na sidebar e tente novamente.
        </div>
      )}

      <div className="sr-wizard-analise-layout">
        <div className="sr-wizard-metricas">
          <article className="sr-wizard-metrica-card sr-wizard-metrica-card--superficie">
            <header>
              <Clock size={18} weight="duotone" />
              <span>Tempo de leitura</span>
            </header>
            <div className="sr-wizard-metrica-valores">
              <div className="sr-wizard-timer">{formatarTempo(elapsedSegundos)}</div>
              <small>HH : MM : SS</small>
            </div>
          </article>

          <article className="sr-wizard-metrica-card sr-wizard-metrica-card--superficie">
            <header>
              <Timer size={18} weight="duotone" />
              <span>Recursos reduzidos com a leitura</span>
            </header>
            <div className="sr-wizard-metrica-valores">
              <div className="sr-wizard-recursos">
                <strong>{formatarSavingHorasLeitura(saving.minutos)}</strong>
              </div>
              <small>Base manual do documento − tempo de leitura</small>
              <p className="sr-wizard-metrica-link-metodologia">
                <LinkMetodologiaSavingInsightsSmartRead>Base de cálculo →</LinkMetodologiaSavingInsightsSmartRead>
              </p>
            </div>
          </article>

          <article className="sr-wizard-metrica-card sr-wizard-metrica-card--superficie sr-wizard-metrica-card--acumulados">
            <header>
              <ChartLineUp size={18} weight="duotone" />
              <span>Tempo reduzido acumulado</span>
            </header>
            <div className="sr-wizard-acumulados-infografico" aria-label="Histórico do workspace">
              <div className="sr-wizard-acumulados-col">
                <span className="sr-wizard-acumulados-icone" aria-hidden>
                  <FileText size={16} weight="duotone" />
                </span>
                <span className="sr-wizard-acumulados-valor">
                  {savingAcumulado.carregando ? '…' : savingAcumuladoExibicao.totalDocumentos}
                </span>
                <span className="sr-wizard-acumulados-rotulo">Documentos</span>
              </div>
              <div className="sr-wizard-acumulados-conector" aria-hidden>
                <span className="sr-wizard-acumulados-barra">
                  <span
                    className="sr-wizard-acumulados-barra-fill"
                    style={{ width: `${barraAcumuladoPct}%` }}
                  />
                </span>
              </div>
              <div className="sr-wizard-acumulados-col">
                <span className="sr-wizard-acumulados-icone sr-wizard-acumulados-icone--verde" aria-hidden>
                  <Timer size={16} weight="duotone" />
                </span>
                <span className="sr-wizard-acumulados-valor">
                  {savingAcumulado.carregando
                    ? '…'
                    : formatarSavingHorasLeitura(savingAcumuladoExibicao.minutos)}
                </span>
                <span className="sr-wizard-acumulados-rotulo">Saving</span>
              </div>
              <p className="sr-wizard-acumulados-rodape">Histórico do workspace</p>
            </div>
          </article>
        </div>

        <section className="sr-wizard-analise-painel" aria-label="Progresso das análises">
          <div className="sr-wizard-analise-corpo">
            <div className="sr-wizard-analise-lista">
              {etapas.map((etapa) => (
                <EtapaPipeline key={etapa.id} etapa={etapa} />
              ))}
            </div>

            <div className="sr-wizard-cerebro-wrap">
              <svg className="sr-wizard-cerebro-anel" viewBox="0 0 200 200" aria-hidden>
                <circle cx="100" cy="100" r="88" className="sr-wizard-cerebro-anel-trilha" />
                <circle
                  cx="100"
                  cy="100"
                  r="88"
                  className="sr-wizard-cerebro-anel-progresso"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 88}`,
                    strokeDashoffset: `${2 * Math.PI * 88 * (1 - progressoGeral / 100)}`,
                  }}
                />
              </svg>
              <div className="sr-wizard-cerebro-icone">
                <Brain size={72} weight="duotone" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
    </ProvedorMetodologiaSavingInsightsSmartRead>
  )
}

function EtapaPipeline({ etapa }: { etapa: EtapaAnalise }) {
  const rotuloStatus =
    etapa.status === 'completo' ? 'Completo' : etapa.status === 'andamento' ? 'Em andamento' : 'Aguardando'

  return (
    <div className={`sr-wizard-etapa-pipeline sr-wizard-etapa-pipeline--${etapa.status}`}>
      <span className="sr-wizard-etapa-numero">{etapa.id}</span>
      <span className="sr-wizard-etapa-rotulo">{etapa.rotulo}</span>
      <div className="sr-wizard-etapa-barra">
        <div
          className={`sr-wizard-etapa-barra-fill sr-wizard-etapa-barra-fill--${etapa.status}`}
          style={{ width: `${etapa.progresso}%` }}
        />
      </div>
      <span className="sr-wizard-etapa-percentual">{etapa.progresso}%</span>
      <span className={`sr-wizard-etapa-pill sr-wizard-etapa-pill--${etapa.status}`}>{rotuloStatus}</span>
    </div>
  )
}
