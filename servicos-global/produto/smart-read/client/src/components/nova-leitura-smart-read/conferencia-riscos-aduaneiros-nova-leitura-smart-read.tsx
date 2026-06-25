/**
 * ConferenciaRiscosAduaneirosNovaLeituraSmartRead — V1 + LLM + Cadastros (piloto)
 */

import { useEffect, useState } from 'react'
import { CircleNotch, Info, ShieldWarning, Warning, WarningCircle } from '@phosphor-icons/react'
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import { smartReadApi } from '../../shared/api'
import { montarDocumentosAnaliseRiscoDeArquivosLocais } from '../../shared/analisar-riscos-aduaneiros-leitura-smart-read'
import type {
  RiscoAduaneiroLeitura,
  SeveridadeRiscoAduaneiro,
} from '../../shared/analisar-riscos-aduaneiros-leitura-smart-read'

type Props = {
  arquivos: ArquivoLocalNovaLeitura[]
}

function iconeSeveridade(severidade: SeveridadeRiscoAduaneiro) {
  switch (severidade) {
    case 'critico':
      return <WarningCircle weight="fill" size={20} />
    case 'atencao':
      return <Warning weight="fill" size={20} />
    default:
      return <Info weight="fill" size={20} />
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

function CardRisco({ risco }: { risco: RiscoAduaneiroLeitura }) {
  return (
    <article className={`sr-conf-risco-card sr-conf-risco-card--${risco.severidade}`}>
      <header className="sr-conf-risco-card-header">
        <span className="sr-conf-risco-severidade-icone" aria-hidden>
          {iconeSeveridade(risco.severidade)}
        </span>
        <div className="sr-conf-risco-card-titulos">
          <h3>{risco.titulo}</h3>
          <span className={`sr-conf-risco-badge sr-conf-risco-badge--${risco.severidade}`}>
            {rotuloSeveridade(risco.severidade)}
          </span>
        </div>
      </header>
      <p className="sr-conf-risco-motivo">
        <strong>Motivo:</strong> {risco.motivo}
      </p>
      <p className="sr-conf-risco-analise">
        <strong>Análise:</strong> {risco.analise}
      </p>
      {risco.citacoes_normativas && risco.citacoes_normativas.length > 0 && (
        <div className="sr-conf-risco-evidencias">
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
        <div className="sr-conf-risco-evidencias">
          <strong>Evidências</strong>
          <ul>
            {risco.evidencias.map((ev, idx) => (
              <li key={`${risco.id}-ev-${idx}`}>
                <span>{ev.documento}</span>
                {ev.campo && <span className="sr-conf-risco-ev-campo">{ev.campo}</span>}
                {ev.valor && <span className="sr-conf-risco-ev-valor">{ev.valor}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}

export function ConferenciaRiscosAduaneirosNovaLeituraSmartRead({ arquivos }: Props) {
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

  const arquivosAnalisaveis = arquivos.filter((a) => a.status_arquivo_local === 'completo')
  const chaveAnalise = montarDocumentosAnaliseRiscoDeArquivosLocais(arquivos)
    .map((d) => `${d.nome_arquivo}:${d.indice}:${JSON.stringify(d.dados).length}`)
    .join('|')

  useEffect(() => {
    if (arquivosAnalisaveis.length === 0) return
    const documentos = montarDocumentosAnaliseRiscoDeArquivosLocais(arquivos)
    if (documentos.length === 0) return

    let cancelado = false
    setCarregando(true)
    setErro(null)
    setAviso(null)

    smartReadApi
      .analisarRiscosLeitura({ documentos, incluir_llm: true })
      .then((resposta) => {
        if (cancelado) return
        setResumo(resposta.resumo)
        setAviso(resposta.aviso ?? null)
      })
      .catch((ex: unknown) => {
        if (cancelado) return
        setErro(ex instanceof Error ? ex.message : 'Falha na análise de riscos')
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })

    return () => {
      cancelado = true
    }
  }, [chaveAnalise])

  if (arquivosAnalisaveis.length === 0) {
    return (
      <div className="sr-conf-riscos">
        <p className="sr-conf-vazio">Aguardando análise dos arquivos para calcular riscos.</p>
      </div>
    )
  }

  return (
    <div className="sr-conf-riscos">
      <div className="sr-conf-riscos-intro">
        <ShieldWarning weight="duotone" size={22} className="sr-conf-riscos-intro-icone" />
        <div>
          <h2 className="sr-conf-riscos-titulo">Análise de Riscos</h2>
          <p className="sr-conf-riscos-subtitulo">
            Auditoria V1 (regras e matemática) + IA comercial + validação NCM Siscomex. Apoio à conferência — não
            substitui despacho aduaneiro.
          </p>
        </div>
      </div>

      {carregando && (
        <p className="sr-conf-riscos-carregando" role="status">
          <CircleNotch size={18} className="sr-wizard-analise-arquivo-spin" aria-hidden />
          Analisando documentos…
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

      <div className="sr-conf-riscos-kpis" role="group" aria-label="Resumo de riscos">
        {(
          [
            ['total', 'Total', resumo.total],
            ['critico', 'Críticos', resumo.criticos],
            ['atencao', 'Atenção', resumo.atencao],
            ['informativo', 'Informativos', resumo.informativos],
          ] as const
        ).map(([id, rotulo, valor]) => (
          <div key={id} className={`sr-conf-riscos-kpi sr-conf-riscos-kpi--${id}`}>
            <span className="sr-conf-riscos-kpi-valor">{valor}</span>
            <span className="sr-conf-riscos-kpi-rotulo">{rotulo}</span>
          </div>
        ))}
      </div>

      {!carregando && resumo.riscos.length === 0 && !erro ? (
        <p className="sr-conf-riscos-ok">Nenhum risco identificado na leitura atual.</p>
      ) : (
        <div className="sr-conf-riscos-lista">
          {resumo.riscos.map((risco) => (
            <CardRisco key={risco.id} risco={risco} />
          ))}
        </div>
      )}
    </div>
  )
}
