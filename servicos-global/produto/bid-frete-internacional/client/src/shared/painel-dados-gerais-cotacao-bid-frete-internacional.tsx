/**
 * Aba Dados gerais — identificação e cronograma (padrão Processo › Dados Técnicos).
 */

import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CampoDadoGlobal,
  type ModoCampoDadoGlobal,
  type StatusPreenchimentoCampoDadoGlobal,
} from './campo-dado-global-nucleo'
import {
  CalendarBlank,
  Clock,
  PaperPlaneTilt,
  CheckCircle,
  XCircle,
  CaretDown,
  ClockCounterClockwise,
  Hash,
  IdentificationCard,
  TrafficSign,
} from '@phosphor-icons/react'
import { publicarCotacaoAtualizadaBidFrete } from './bus-cotacao-atualizada-bid-frete-internacional'
import {
  calcularDatasDerivadasCronogramaCotacao,
  cotacaoPermiteEditarPrazoResposta,
} from './calcular-cronograma-cotacao-bid-frete-internacional'
import { EdicaoPeriodoCampoCotacaoBidFreteInternacional } from './edicao-periodo-campo-cotacao-bid-frete-internacional'
import { EdicaoStatusCampoCotacaoBidFreteInternacional } from './edicao-status-campo-cotacao-bid-frete-internacional'
import { EdicaoTextoCampoCotacaoBidFreteInternacional } from './edicao-texto-campo-cotacao-bid-frete-internacional'
import { fmtDataCotacaoBidFrete } from './colunas-datas-motivos-cotacao-bid-frete-internacional'
import { formatarDataBidFrete } from './formato-data-bid-frete'
import {
  cotacaoCampoEditavel,
  salvarCampoCotacaoBidFreteInternacional,
} from './salvar-campo-cotacao-bid-frete-internacional'
import { STATUS_LABELS, type Cotacao, type DisparoCotacaoBidFreteInternacional } from './types'
import './painel-dados-gerais-cotacao-bid-frete-internacional.css'

const SECOES_IDS = ['identificacao', 'cronograma'] as const
type SecaoId = (typeof SECOES_IDS)[number]

const dataHoraBR = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : null

function valorPreenchido(valor: string | null | undefined): boolean {
  if (valor == null) return false
  const t = valor.trim()
  return t !== '' && t !== '—'
}

function statusPreenchimento(
  valor: string | null | undefined,
): StatusPreenchimentoCampoDadoGlobal {
  return valorPreenchido(valor) ? 'preenchido' : 'vazio-opc'
}

interface SecaoDadosGeraisProps {
  id: SecaoId
  titulo: string
  icone: React.ReactNode
  preenchidos: number
  total: number
  colapsada: boolean
  onToggle: () => void
  children: React.ReactNode
}

function SecaoDadosGerais({
  id,
  titulo,
  icone,
  preenchidos,
  total,
  colapsada,
  onToggle,
  children,
}: SecaoDadosGeraisProps) {
  const completa = preenchidos === total && total > 0
  const pct = total > 0 ? Math.round((preenchidos / total) * 100) : 0

  return (
    <section
      id={`bid-dg-${id}`}
      className={`dt-secao ${colapsada ? 'dt-secao--colapsada' : ''}`}
    >
      <button
        type="button"
        className="dt-secao-header"
        onClick={onToggle}
        aria-expanded={!colapsada}
        aria-controls={`bid-dg-${id}-grid`}
      >
        <div className="dt-secao-title">
          <CaretDown
            weight="bold"
            size={14}
            className={`dt-caret ${colapsada ? 'dt-caret--colapsado' : ''}`}
          />
          <span className="dt-secao-icon">{icone}</span>
          <h2>{titulo}</h2>
        </div>
        <div className="dt-secao-completude">
          <div className="dt-secao-progress" aria-hidden>
            <div
              className="dt-secao-progress-fill"
              style={{ width: `${pct}%`, background: completa ? '#34d399' : '#a78bfa' }}
            />
          </div>
          <span className="dt-secao-pill">
            {preenchidos}/{total}
          </span>
        </div>
      </button>
      {!colapsada && (
        <div id={`bid-dg-${id}-grid`} className="dt-grid">
          {children}
        </div>
      )}
    </section>
  )
}

export interface PainelDadosGeraisCotacaoBidFreteInternacionalProps {
  cotacao: Cotacao
  disparos: DisparoCotacaoBidFreteInternacional[]
  onCotacaoAtualizada: (cotacao: Cotacao) => void
}

export function PainelDadosGeraisCotacaoBidFreteInternacional({
  cotacao,
  disparos,
  onCotacaoAtualizada,
}: PainelDadosGeraisCotacaoBidFreteInternacionalProps) {
  const { t } = useTranslation()
  const [salvandoCampo, setSalvandoCampo] = useState<string | null>(null)
  const [erroCampo, setErroCampo] = useState<string | null>(null)
  const [resultadoCampo, setResultadoCampo] = useState<Record<string, 'sucesso' | 'erro'>>({})
  const [secoesColapsadas, setSecoesColapsadas] = useState<Set<SecaoId>>(new Set())

  const idCotacao = cotacao.id_cotacao_bid_frete_internacional

  function modoCampo(campo: string, bloqueado = false): ModoCampoDadoGlobal {
    if (!cotacaoCampoEditavel(campo) || bloqueado) {
      return bloqueado ? 'bloqueado' : 'somente_leitura'
    }
    return 'editavel'
  }

  async function salvarCampo(campo: string, valor: unknown, bloqueado = false) {
    if (!cotacaoCampoEditavel(campo) || bloqueado || salvandoCampo) return
    setSalvandoCampo(campo)
    setErroCampo(null)
    try {
      const cotacaoAtualizada = await salvarCampoCotacaoBidFreteInternacional({
        id: idCotacao,
        campo,
        valor,
        cotacaoAtual: cotacao,
      })
      publicarCotacaoAtualizadaBidFrete(cotacaoAtualizada)
      onCotacaoAtualizada(cotacaoAtualizada)
      setResultadoCampo(prev => ({ ...prev, [campo]: 'sucesso' }))
      window.setTimeout(() => {
        setResultadoCampo(prev => {
          const next = { ...prev }
          delete next[campo]
          return next
        })
      }, 1200)
    } catch (e: unknown) {
      setResultadoCampo(prev => ({ ...prev, [campo]: 'erro' }))
      setErroCampo(
        e instanceof Error
          ? e.message
          : t('bidfrete.detalhe_cotacao.cronograma_erro_salvar', 'Não foi possível salvar.'),
      )
      window.setTimeout(() => setResultadoCampo(prev => {
        const next = { ...prev }
        delete next[campo]
        return next
      }), 2000)
    } finally {
      setSalvandoCampo(null)
    }
  }

  const derivadas = useMemo(
    () => calcularDatasDerivadasCronogramaCotacao(disparos),
    [disparos],
  )

  const permiteEditarPrazo = cotacaoPermiteEditarPrazoResposta(
    cotacao.status_cotacao_bid_frete_internacional,
  )

  const camposCronograma = useMemo(() => {
    const prazo = dataHoraBR(cotacao.data_limite_resposta_cotacao_bid_frete_internacional)
    return [
      { preenchido: valorPreenchido(dataHoraBR(cotacao.data_criacao_cotacao_bid_frete_internacional)) },
      { preenchido: valorPreenchido(dataHoraBR(derivadas.data_primeiro_envio_disparo)) },
      { preenchido: valorPreenchido(prazo) },
      { preenchido: valorPreenchido(dataHoraBR(derivadas.data_ultima_resposta_disparo)) },
      { preenchido: valorPreenchido(fmtDataCotacaoBidFrete(cotacao.data_aprovacao_cotacao_bid_frete_internacional)) },
      { preenchido: valorPreenchido(fmtDataCotacaoBidFrete(cotacao.data_cancelamento_cotacao_bid_frete_internacional)) },
      { preenchido: valorPreenchido(formatarDataBidFrete(cotacao.data_atualizacao_cotacao_bid_frete_internacional)) },
    ]
  }, [cotacao, derivadas])

  const camposIdentificacao = useMemo(() => {
    const ref = cotacao.referencia_interna_cotacao_bid_frete_internacional?.trim()
    return [
      { preenchido: valorPreenchido(cotacao.numero_cotacao_bid_frete_internacional) },
      { preenchido: valorPreenchido(ref || null) },
      { preenchido: valorPreenchido(cotacao.status_cotacao_bid_frete_internacional) },
    ]
  }, [cotacao])

  const completudeCronograma = useMemo(() => {
    const preenchidos = camposCronograma.filter(c => c.preenchido).length
    return { preenchidos, total: camposCronograma.length }
  }, [camposCronograma])

  const completudeIdentificacao = useMemo(() => {
    const preenchidos = camposIdentificacao.filter(c => c.preenchido).length
    return { preenchidos, total: camposIdentificacao.length }
  }, [camposIdentificacao])

  const todasColapsadas = secoesColapsadas.size === SECOES_IDS.length

  function toggleSecao(id: SecaoId) {
    setSecoesColapsadas(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleTodas() {
    setSecoesColapsadas(prev =>
      prev.size === SECOES_IDS.length ? new Set() : new Set(SECOES_IDS),
    )
  }

  const labelPrazo = t('bidfrete.detalhe_cotacao.cronograma_prazo_resposta', 'Prazo para resposta')
  const campoPrazo = 'data_limite_resposta_cotacao_bid_frete_internacional'
  const valorPrazo = dataHoraBR(cotacao.data_limite_resposta_cotacao_bid_frete_internacional)
  const motivoPrazoBloqueado = !permiteEditarPrazo
    ? t(
      'bidfrete.detalhe_cotacao.cronograma_prazo_somente_leitura',
      'Prazo bloqueado para edição neste status da cotação.',
    )
    : undefined

  return (
    <div className="dc-dados-gerais-processo dt-main">
      <div className="dt-main-toolbar">
        <button
          type="button"
          className="dt-main-toolbar-btn"
          onClick={toggleTodas}
          title={todasColapsadas ? 'Expandir todas as seções' : 'Recolher todas as seções'}
        >
          <CaretDown
            weight="bold"
            size={12}
            className={`dt-caret ${todasColapsadas ? 'dt-caret--colapsado' : ''}`}
          />
          {todasColapsadas
            ? t('bidfrete.detalhe_cotacao.dados_gerais_expandir_todas', 'Expandir todas')
            : t('bidfrete.detalhe_cotacao.dados_gerais_recolher_todas', 'Recolher todas')}
        </button>
      </div>

      <SecaoDadosGerais
        id="identificacao"
        titulo={t('bidfrete.detalhe_cotacao.card_identificacao', 'Identificação')}
        icone={<IdentificationCard weight="duotone" size={18} />}
        preenchidos={completudeIdentificacao.preenchidos}
        total={completudeIdentificacao.total}
        colapsada={secoesColapsadas.has('identificacao')}
        onToggle={() => toggleSecao('identificacao')}
      >
        <CampoDadoGlobal
          icone={<Hash weight="duotone" size={14} />}
          label={t('bidfrete.detalhe_cotacao.numero_cotacao', 'Número')}
          modo={modoCampo('numero_cotacao_bid_frete_internacional')}
          statusPreenchimento={statusPreenchimento(cotacao.numero_cotacao_bid_frete_internacional)}
        >
          <EdicaoTextoCampoCotacaoBidFreteInternacional
            label={t('bidfrete.detalhe_cotacao.numero_cotacao', 'Número')}
            valor={cotacao.numero_cotacao_bid_frete_internacional}
            permiteEditar={cotacaoCampoEditavel('numero_cotacao_bid_frete_internacional')}
            salvando={salvandoCampo === 'numero_cotacao_bid_frete_internacional'}
            onConfirmar={(texto) =>
              salvarCampo('numero_cotacao_bid_frete_internacional', texto)}
          />
        </CampoDadoGlobal>
        <CampoDadoGlobal
          icone={<IdentificationCard weight="duotone" size={14} />}
          label={t('bidfrete.detalhe_cotacao.referencia_interna', 'Referência interna')}
          modo={modoCampo('referencia_interna_cotacao_bid_frete_internacional')}
          statusPreenchimento={statusPreenchimento(
            cotacao.referencia_interna_cotacao_bid_frete_internacional,
          )}
        >
          <EdicaoTextoCampoCotacaoBidFreteInternacional
            label={t('bidfrete.detalhe_cotacao.referencia_interna', 'Referência interna')}
            valor={cotacao.referencia_interna_cotacao_bid_frete_internacional}
            permiteEditar={cotacaoCampoEditavel('referencia_interna_cotacao_bid_frete_internacional')}
            salvando={salvandoCampo === 'referencia_interna_cotacao_bid_frete_internacional'}
            onConfirmar={(texto) =>
              salvarCampo('referencia_interna_cotacao_bid_frete_internacional', texto)}
          />
        </CampoDadoGlobal>
        <CampoDadoGlobal
          icone={<TrafficSign weight="duotone" size={14} />}
          label={t('comum.status')}
          modo={modoCampo('status_cotacao_bid_frete_internacional')}
          statusPreenchimento={statusPreenchimento(
            STATUS_LABELS[cotacao.status_cotacao_bid_frete_internacional]
              ?? cotacao.status_cotacao_bid_frete_internacional,
          )}
        >
          <EdicaoStatusCampoCotacaoBidFreteInternacional
            label={t('comum.status')}
            valor={cotacao.status_cotacao_bid_frete_internacional}
            permiteEditar={cotacaoCampoEditavel('status_cotacao_bid_frete_internacional')}
            salvando={salvandoCampo === 'status_cotacao_bid_frete_internacional'}
            onConfirmar={(status) =>
              salvarCampo('status_cotacao_bid_frete_internacional', status)}
          />
        </CampoDadoGlobal>
      </SecaoDadosGerais>

      <SecaoDadosGerais
        id="cronograma"
        titulo={t('bidfrete.detalhe_cotacao.card_cronograma', 'Cronograma')}
        icone={<ClockCounterClockwise weight="duotone" size={18} />}
        preenchidos={completudeCronograma.preenchidos}
        total={completudeCronograma.total}
        colapsada={secoesColapsadas.has('cronograma')}
        onToggle={() => toggleSecao('cronograma')}
      >
        {erroCampo && (
          <p className="dc-cronograma-erro-secao" role="alert">
            {erroCampo}
          </p>
        )}
        <CampoDadoGlobal
          icone={<CalendarBlank weight="duotone" size={14} />}
          label={t('bidfrete.detalhe_cotacao.cronograma_data_criacao', 'Data de criação')}
          modo={modoCampo('data_criacao_cotacao_bid_frete_internacional')}
          statusPreenchimento={statusPreenchimento(
            dataHoraBR(cotacao.data_criacao_cotacao_bid_frete_internacional),
          )}
        >
          <EdicaoPeriodoCampoCotacaoBidFreteInternacional
            label={t('bidfrete.detalhe_cotacao.cronograma_data_criacao', 'Data de criação')}
            valorIso={cotacao.data_criacao_cotacao_bid_frete_internacional}
            permiteEditar={cotacaoCampoEditavel('data_criacao_cotacao_bid_frete_internacional')}
            comHorario
            salvando={salvandoCampo === 'data_criacao_cotacao_bid_frete_internacional'}
            resultadoSalvar={resultadoCampo.data_criacao_cotacao_bid_frete_internacional ?? null}
            onConfirmar={(iso) => salvarCampo('data_criacao_cotacao_bid_frete_internacional', iso)}
          />
        </CampoDadoGlobal>
        <CampoDadoGlobal
          icone={<PaperPlaneTilt weight="duotone" size={14} />}
          label={t('bidfrete.detalhe_cotacao.cronograma_primeiro_envio', 'Primeiro envio')}
          valor={dataHoraBR(derivadas.data_primeiro_envio_disparo)}
          modo="somente_leitura"
          statusPreenchimento={statusPreenchimento(
            dataHoraBR(derivadas.data_primeiro_envio_disparo),
          )}
        />
        <CampoDadoGlobal
          icone={<Clock weight="duotone" size={14} />}
          label={labelPrazo}
          modo={modoCampo(campoPrazo, !permiteEditarPrazo)}
          motivo={motivoPrazoBloqueado}
          statusPreenchimento={statusPreenchimento(valorPrazo)}
        >
          <EdicaoPeriodoCampoCotacaoBidFreteInternacional
            label={labelPrazo}
            valorIso={cotacao.data_limite_resposta_cotacao_bid_frete_internacional}
            permiteEditar={permiteEditarPrazo && cotacaoCampoEditavel(campoPrazo)}
            comHorario
            motivoBloqueado={motivoPrazoBloqueado}
            salvando={salvandoCampo === campoPrazo}
            resultadoSalvar={resultadoCampo[campoPrazo] ?? null}
            onConfirmar={(iso) => salvarCampo(campoPrazo, iso, !permiteEditarPrazo)}
          />
        </CampoDadoGlobal>
        <CampoDadoGlobal
          icone={<CheckCircle weight="duotone" size={14} />}
          label={t('bidfrete.detalhe_cotacao.cronograma_ultima_resposta', 'Última resposta')}
          valor={dataHoraBR(derivadas.data_ultima_resposta_disparo)}
          modo="somente_leitura"
          statusPreenchimento={statusPreenchimento(
            dataHoraBR(derivadas.data_ultima_resposta_disparo),
          )}
        />
        <CampoDadoGlobal
          icone={<CheckCircle weight="fill" size={14} />}
          label={t('bidfrete.lista.colunas.data_aprovacao', 'Data aprovação')}
          modo={modoCampo('data_aprovacao_cotacao_bid_frete_internacional')}
          statusPreenchimento={statusPreenchimento(
            fmtDataCotacaoBidFrete(cotacao.data_aprovacao_cotacao_bid_frete_internacional),
          )}
        >
          <EdicaoPeriodoCampoCotacaoBidFreteInternacional
            label={t('bidfrete.lista.colunas.data_aprovacao', 'Data aprovação')}
            valorIso={cotacao.data_aprovacao_cotacao_bid_frete_internacional}
            permiteEditar={cotacaoCampoEditavel('data_aprovacao_cotacao_bid_frete_internacional')}
            comHorario={false}
            salvando={salvandoCampo === 'data_aprovacao_cotacao_bid_frete_internacional'}
            resultadoSalvar={resultadoCampo.data_aprovacao_cotacao_bid_frete_internacional ?? null}
            onConfirmar={(iso) => salvarCampo('data_aprovacao_cotacao_bid_frete_internacional', iso)}
          />
        </CampoDadoGlobal>
        <CampoDadoGlobal
          icone={<XCircle weight="fill" size={14} />}
          label={t('bidfrete.lista.colunas.data_cancelamento', 'Data cancelamento')}
          modo={modoCampo('data_cancelamento_cotacao_bid_frete_internacional')}
          statusPreenchimento={statusPreenchimento(
            fmtDataCotacaoBidFrete(cotacao.data_cancelamento_cotacao_bid_frete_internacional),
          )}
        >
          <EdicaoPeriodoCampoCotacaoBidFreteInternacional
            label={t('bidfrete.lista.colunas.data_cancelamento', 'Data cancelamento')}
            valorIso={cotacao.data_cancelamento_cotacao_bid_frete_internacional}
            permiteEditar={cotacaoCampoEditavel('data_cancelamento_cotacao_bid_frete_internacional')}
            comHorario={false}
            salvando={salvandoCampo === 'data_cancelamento_cotacao_bid_frete_internacional'}
            resultadoSalvar={resultadoCampo.data_cancelamento_cotacao_bid_frete_internacional ?? null}
            onConfirmar={(iso) => salvarCampo('data_cancelamento_cotacao_bid_frete_internacional', iso)}
          />
        </CampoDadoGlobal>
        <CampoDadoGlobal
          icone={<CalendarBlank weight="duotone" size={14} />}
          label={t('bidfrete.detalhe_cotacao.cronograma_ultima_atualizacao', 'Última atualização')}
          valor={formatarDataBidFrete(cotacao.data_atualizacao_cotacao_bid_frete_internacional)}
          modo="somente_leitura"
          statusPreenchimento={statusPreenchimento(
            cotacao.data_atualizacao_cotacao_bid_frete_internacional,
          )}
        />
      </SecaoDadosGerais>
    </div>
  )
}
