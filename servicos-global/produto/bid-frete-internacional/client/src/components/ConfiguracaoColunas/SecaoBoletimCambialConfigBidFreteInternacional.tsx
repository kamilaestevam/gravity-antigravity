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
        <BotaoGlobal variante="secundario" tamanho="pequeno" onClick={() => { void carregarPtax(); void carregarFuturo() }}>
          {carregando ? <CircleNotch size={14} className="cfg-spin" /> : <ArrowsClockwise size={14} />}
          {t('bidfrete.config.taxa_cambio.atualizar', 'Atualizar')}
        </BotaoGlobal>
      </div>

      <p className="cfg-hint-sync" style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '1rem' }}>
        <Clock size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
        {mensagemSyncPtax}
        {ultimaRespostaApi && !erroPtax && (
          <span style={{ display: 'block', marginTop: 4, opacity: 0.85 }}>
            {t('bidfrete.config.taxa_cambio.resposta_api', 'Consulta API: {{data}}', {
              data: fmtDataHora(ultimaRespostaApi),
            })}
          </span>
        )}
      </p>

      <ConfiguracaoSecaoGlobal
        label={t('bidfrete.config.taxa_cambio.ptax_titulo', 'PTAX — todas as moedas do admin')}
        count={`${linhasPtax.filter(l => l.venda != null).length}/${linhasPtax.length}`}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
        {carregando ? (
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{t('bidfrete.config.carregando', 'Carregando…')}</p>
        ) : (
          linhasPtax.map(linha => (
            <div
              key={linha.moeda}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: '1rem',
                alignItems: 'center',
                padding: '0.65rem 0.75rem',
                background: '#334155',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <CurrencyCircleDollar size={18} style={{ color: '#10b981', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>
                    {linha.moeda} / BRL
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{linha.nome}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Venda</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>{fmtTaxa(linha.venda)}</div>
              </div>
              <div style={{ textAlign: 'right', minWidth: '8rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {linha.boletim ?? 'Boletim'} · {linha.data_cotacao ?? '—'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  sync {fmtDataHora(linha.sincronizado_em)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '1.75rem' }}>
        <ConfiguracaoSecaoGlobal
          label={t('bidfrete.config.taxa_cambio.futuro_titulo', 'Dólar futuro (BACEN Focus)')}
          count={String(previsoesUsd.length)}
        />
        <p className="cfg-hint-sync" style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0.5rem 0 1rem' }}>
          <ChartLine size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          {mensagemSyncFocus}
        </p>
        {carregandoFuturo ? (
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{t('bidfrete.config.carregando', 'Carregando…')}</p>
        ) : previsoesUsd.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.8125rem' }}>
            {t('bidfrete.config.taxa_cambio.futuro_vazio', 'Sem previsões USD disponíveis.')}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {previsoesUsd.map(p => (
              <div
                key={p.mes}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.75rem',
                  background: '#334155',
                  borderRadius: '8px',
                }}
              >
                <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{fmtMes(p.mes)}</span>
                <span style={{ color: '#cbd5e1' }}>R$ {fmtTaxa(p.mediano)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
