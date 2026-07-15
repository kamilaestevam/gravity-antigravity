/**
 * Configurações › Taxa de Câmbio — leitura PTAX (admin) + dólar futuro (Focus) + datas de sync.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowsClockwise, ChartLine, CircleNotch, Clock, CurrencyCircleDollar } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { ConfiguracaoSecaoGlobal } from '@nucleo/cabecalho-secao-global'
import {
  buscarPrevisoesTaxaFuturaInsights,
  buscarTaxasMoedaAtuaisInsights,
  previsaoTaxaFuturaMoedaResponseSchema,
  taxasMoedaAtuaisResponseSchema,
} from '../../shared/taxas-cambio-insights-bid-frete-internacional'

const MOEDAS_INFO: Record<string, { nome: string }> = {
  USD: { nome: 'Dólar Americano' },
  EUR: { nome: 'Euro' },
  GBP: { nome: 'Libra Esterlina' },
  CHF: { nome: 'Franco Suíço' },
  CNY: { nome: 'Yuan Chinês' },
  JPY: { nome: 'Iene Japonês' },
  CAD: { nome: 'Dólar Canadense' },
}

const MOEDAS_ORDEM = ['USD', 'EUR', 'GBP', 'CHF', 'CNY', 'JPY', 'CAD'] as const

function fmtTaxa(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '—'
  return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
}

function fmtDataHora(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function fmtMes(iso: string): string {
  const d = new Date(iso)
  const mes = d.toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', '')
  return `${mes.charAt(0).toUpperCase()}${mes.slice(1)}/${d.getUTCFullYear()}`
}

function fmtDataCurta(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('pt-BR')
}

function rotuloBoletimTag(boletim: string | null, dataCotacao: string | null): string | null {
  if (boletim?.trim()) return boletim.trim()
  if (dataCotacao) return 'Boletim'
  return null
}

type LinhaPtax = {
  moeda: string
  nome: string
  venda: number | null
  compra: number | null
  data_cotacao: string | null
  sincronizado_em: string | null
  boletim: string | null
}

export function SecaoBoletimCambialConfigBidFreteInternacional() {
  const { t } = useTranslation()
  const [carregando, setCarregando] = useState(true)
  const [carregandoFuturo, setCarregandoFuturo] = useState(true)
  const [linhasPtax, setLinhasPtax] = useState<LinhaPtax[]>([])
  const [previsoesUsd, setPrevisoesUsd] = useState<
    Array<{ mes: string; mediano: number; sincronizado_em: string | null }>
  >([])
  const [ultimaRespostaApi, setUltimaRespostaApi] = useState<string | null>(null)
  const [erroPtax, setErroPtax] = useState<string | null>(null)

  const carregarPtax = useCallback(async () => {
    setCarregando(true)
    setErroPtax(null)
    try {
      const parsed = await buscarTaxasMoedaAtuaisInsights()
      taxasMoedaAtuaisResponseSchema.parse(parsed)
      setUltimaRespostaApi(parsed.data ?? new Date().toISOString())

      const porMoeda = parsed.por_moeda ?? {}
      const moedasApi = Object.keys(porMoeda)
      const ordem = [...MOEDAS_ORDEM, ...moedasApi.filter(m => !MOEDAS_ORDEM.includes(m as typeof MOEDAS_ORDEM[number]))]

      setLinhasPtax(
        ordem.map(moeda => {
          const lista = porMoeda[moeda] ?? []
          const ultimo = lista.length > 0 ? lista[lista.length - 1] : null
          const venda = ultimo ? Number(ultimo.venda) : null
          const compra = ultimo ? Number(ultimo.compra) : null
          return {
            moeda,
            nome: MOEDAS_INFO[moeda]?.nome ?? moeda,
            venda: Number.isFinite(venda) ? venda : null,
            compra: Number.isFinite(compra) ? compra : null,
            data_cotacao: ultimo?.data_cotacao
              ? String(ultimo.data_cotacao).slice(0, 10)
              : null,
            sincronizado_em: ultimo?.criado_em ? String(ultimo.criado_em) : null,
            boletim: ultimo?.boletim ?? null,
          }
        }),
      )

      const taxasAplicadas: Record<string, number> = {}
      for (const linha of ordem) {
        const v = porMoeda[linha]?.at(-1)?.venda
        const n = Number(v)
        if (Number.isFinite(n) && n > 0) taxasAplicadas[linha] = n
      }
      if (Object.keys(taxasAplicadas).length > 0) {
        localStorage.setItem('bid-frete:config:taxa-cambio', JSON.stringify(taxasAplicadas))
      }
    } catch (err) {
      setErroPtax(err instanceof Error ? err.message : 'Falha ao carregar PTAX do admin')
      setLinhasPtax(MOEDAS_ORDEM.map(moeda => ({
        moeda,
        nome: MOEDAS_INFO[moeda]?.nome ?? moeda,
        venda: null,
        compra: null,
        data_cotacao: null,
        sincronizado_em: null,
        boletim: null,
      })))
    } finally {
      setCarregando(false)
    }
  }, [])

  const carregarFuturo = useCallback(async () => {
    setCarregandoFuturo(true)
    try {
      const raw = await buscarPrevisoesTaxaFuturaInsights('USD', 4)
      const parsed = previsaoTaxaFuturaMoedaResponseSchema.parse(raw)
      setPrevisoesUsd(
        parsed.data.map(p => ({
          mes: p.mes_previsao_taxa_futura_moeda,
          mediano: p.valor_mediano_previsao_taxa_futura_moeda,
          sincronizado_em: p.data_atualizacao_previsao_taxa_futura_moeda ?? p.data_previsao_taxa_futura_moeda,
        })),
      )
    } catch {
      setPrevisoesUsd([])
    } finally {
      setCarregandoFuturo(false)
    }
  }, [])

  useEffect(() => {
    void carregarPtax()
    void carregarFuturo()
  }, [carregarPtax, carregarFuturo])

  const mensagemSyncPtax = useMemo(() => {
    if (erroPtax) return erroPtax
    const comSync = linhasPtax.filter(l => l.sincronizado_em)
    if (comSync.length === 0) {
      return t(
        'bidfrete.config.taxa_cambio.sync_ausente',
        'Nenhuma taxa sincronizada nesta organização — verifique o admin › Taxas e Moeda.',
      )
    }
    const maisRecente = comSync.reduce((acc, l) => {
      const tMs = new Date(l.sincronizado_em!).getTime()
      return tMs > acc.ms ? { ms: tMs, iso: l.sincronizado_em! } : acc
    }, { ms: 0, iso: '' as string })
    return t(
      'bidfrete.config.taxa_cambio.sync_ptax',
      'Última sincronização PTAX registrada: {{data}} (fonte: admin / Configurador).',
      { data: fmtDataHora(maisRecente.iso) },
    )
  }, [erroPtax, linhasPtax, t])

  const mensagemSyncFocus = useMemo(() => {
    const ultima = previsoesUsd
      .map(p => p.sincronizado_em)
      .filter(Boolean)
      .sort()
      .at(-1)
    if (!ultima) {
      return t(
        'bidfrete.config.taxa_cambio.sync_focus_ausente',
        'Dólar futuro (Focus) ainda não sincronizado — admin › Taxas e Moeda › Previsão.',
      )
    }
    return t(
      'bidfrete.config.taxa_cambio.sync_focus',
      'Última atualização Focus (USD): {{data}}.',
      { data: fmtDataHora(ultima) },
    )
  }, [previsoesUsd, t])

  return (
    <div className="cfg-cards-wrapper">
      <section className="cfg-secao">
        <div className="cfg-secao__header">
          <div>
            <h2 className="cfg-secao__titulo">
              {t('bidfrete.configuracoes.boletim_cambial_titulo', 'Boletim Cambial')}
            </h2>
            <p className="cfg-secao__desc">
              {t(
                'bidfrete.configuracoes.boletim_cambial_desc_admin',
                'Taxas oficiais do admin (PTAX) e previsão de dólar futuro (BACEN Focus). Somente leitura.',
              )}
            </p>
          </div>
          <BotaoGlobal
            variante="secundario"
            tamanho="pequeno"
            onClick={() => { void carregarPtax(); void carregarFuturo() }}
          >
            {carregando ? <CircleNotch size={14} className="cfg-spin" /> : <ArrowsClockwise size={14} />}
            {t('bidfrete.config.taxa_cambio.atualizar', 'Atualizar')}
          </BotaoGlobal>
        </div>

        <p className="cfg-taxa-cambio-sync">
          <Clock size={14} aria-hidden />
          <span>
            {mensagemSyncPtax}
            {ultimaRespostaApi && !erroPtax && (
              <span className="cfg-taxa-cambio-sync__sub">
                {t('bidfrete.config.taxa_cambio.resposta_api', 'Consulta API: {{data}}', {
                  data: fmtDataHora(ultimaRespostaApi),
                })}
              </span>
            )}
          </span>
        </p>

        <ConfiguracaoSecaoGlobal
          label={t('bidfrete.config.taxa_cambio.ptax_titulo', 'PTAX — todas as moedas do admin')}
          count={`${linhasPtax.filter(l => l.venda != null).length}/${linhasPtax.length}`}
        />

        <div className="cfg-taxa-cambio-lista">
          {carregando ? (
            <p className="cfg-hint">{t('bidfrete.config.carregando', 'Carregando…')}</p>
          ) : (
            linhasPtax.map(linha => {
              const boletimTag = rotuloBoletimTag(linha.boletim, linha.data_cotacao)
              const dataTag = fmtDataCurta(linha.data_cotacao)
              const syncTag = linha.sincronizado_em ? fmtDataHora(linha.sincronizado_em) : null
              return (
              <div key={linha.moeda} className="cfg-taxa-cambio-linha">
                <div className="cfg-taxa-cambio-linha__moeda">
                  <CurrencyCircleDollar size={18} className="cfg-taxa-cambio-linha__icone" aria-hidden />
                  <div className="cfg-taxa-cambio-linha__corpo">
                    <div className="cfg-taxa-cambio-linha__titulo">
                      <span className="cfg-taxa-cambio-linha__codigo">{linha.moeda} / BRL</span>
                      {(boletimTag || dataTag || syncTag) && (
                        <div className="cfg-taxa-cambio-tags">
                          {boletimTag && (
                            <span className="cfg-taxa-cambio-tag cfg-taxa-cambio-tag--boletim">{boletimTag}</span>
                          )}
                          {dataTag && (
                            <span className="cfg-taxa-cambio-tag">{dataTag}</span>
                          )}
                          {syncTag && (
                            <span className="cfg-taxa-cambio-tag cfg-taxa-cambio-tag--sync">sync {syncTag}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="cfg-taxa-cambio-linha__nome">{linha.nome}</div>
                  </div>
                </div>
                <div className="cfg-taxa-cambio-linha__col">
                  <div className="cfg-taxa-cambio-linha__rotulo">Venda</div>
                  <div className="cfg-taxa-cambio-linha__valor">{fmtTaxa(linha.venda)}</div>
                </div>
              </div>
            )})
          )}
        </div>

        <div className="cfg-taxa-cambio-bloco">
          <ConfiguracaoSecaoGlobal
            label={t('bidfrete.config.taxa_cambio.futuro_titulo', 'Dólar futuro (BACEN Focus)')}
            count={String(previsoesUsd.length)}
          />
          <p className="cfg-taxa-cambio-sync">
            <ChartLine size={14} aria-hidden />
            <span>{mensagemSyncFocus}</span>
          </p>
          {carregandoFuturo ? (
            <p className="cfg-hint">{t('bidfrete.config.carregando', 'Carregando…')}</p>
          ) : previsoesUsd.length === 0 ? (
            <p className="cfg-taxa-cambio-vazio">
              {t('bidfrete.config.taxa_cambio.futuro_vazio', 'Sem previsões USD disponíveis.')}
            </p>
          ) : (
            <div className="cfg-taxa-cambio-lista">
              {previsoesUsd.map(p => (
                <div key={p.mes} className="cfg-taxa-cambio-linha cfg-taxa-cambio-linha--futuro">
                  <span className="cfg-taxa-cambio-linha__codigo">{fmtMes(p.mes)}</span>
                  <span className="cfg-taxa-cambio-linha__valor">R$ {fmtTaxa(p.mediano)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
