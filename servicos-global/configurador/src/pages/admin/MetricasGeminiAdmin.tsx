import React, { useState, useEffect } from 'react'
import { Brain, Coin, Clock, ChartBar } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { adminTestLogsApi } from '../../services/apiClient'

interface DailyMetric {
  date: string
  totalAnalises: number
  totalTokens: number
  custoEstimadoUSD: number
  latenciaMediaMs: number
  confianca: { alta: number; media: number; baixa: number }
  diffsValidados: number
}

export function MetricasGeminiAdmin() {
  const [daily, setDaily] = useState<DailyMetric[]>([])
  const [cache, setCache] = useState<{ cacheSize: number; cacheHits: number; cacheMisses: number; hitRate: number }>({ cacheSize: 0, cacheHits: 0, cacheMisses: 0, hitRate: 0 })
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await adminTestLogsApi.geminiMetrics()
        setDaily((res.daily as unknown as DailyMetric[]) ?? [])
        setCache(res.cache as typeof cache)
      } catch { /* metrics not available */ }
      setCarregando(false)
    })()
  }, [])

  const totalAnalises = daily.reduce((acc, d) => acc + d.totalAnalises, 0)
  const custoTotal = daily.reduce((acc, d) => acc + d.custoEstimadoUSD, 0)
  const latenciaMedia = daily.length > 0
    ? Math.round(daily.reduce((acc, d) => acc + d.latenciaMediaMs, 0) / daily.length)
    : 0

  const colunas: TabelaGlobalColuna<DailyMetric>[] = [
    { key: 'date', label: 'DATA', tipo: 'texto' },
    { key: 'totalAnalises', label: 'ANÁLISES', tipo: 'numero' },
    { key: 'totalTokens', label: 'TOKENS', tipo: 'numero',
      render: (v: number) => <span style={{ color: '#94a3b8' }}>{v.toLocaleString()}</span>
    },
    { key: 'custoEstimadoUSD', label: 'CUSTO ($)', tipo: 'numero',
      render: (v: number) => <span style={{ color: v > 0.1 ? '#eab308' : '#10b981', fontWeight: 600 }}>${v.toFixed(4)}</span>
    },
    { key: 'latenciaMediaMs', label: 'LATÊNCIA (ms)', tipo: 'numero',
      render: (v: number) => <span style={{ color: v > 5000 ? '#ef4444' : '#10b981' }}>{v}ms</span>
    },
    { key: 'diffsValidados', label: 'DIFFS OK', tipo: 'numero' },
    { key: 'confianca' as keyof DailyMetric, label: 'CONFIANÇA', tipo: 'texto',
      render: (_v: unknown, item: DailyMetric) => (
        <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.7rem' }}>
          <span style={{ color: '#10b981' }}>{item.confianca.alta}A</span>
          <span style={{ color: '#eab308' }}>{item.confianca.media}M</span>
          <span style={{ color: '#64748b' }}>{item.confianca.baixa}B</span>
        </div>
      )
    },
  ]

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<Brain weight="duotone" size={22} />}
          titulo="Métricas Gemini"
          subtitulo="Custo, latência, confiança e cache do analisador de testes"
        />
      }
      stats={
        <>
          <CardBasicoGlobal
            titulo="Análises Totais"
            valor={totalAnalises}
            icone={<ChartBar weight="duotone" size={18} />}
            variante="primario"
          />
          <CardBasicoGlobal
            titulo="Custo Total"
            valor={`$${custoTotal.toFixed(4)}`}
            icone={<Coin weight="duotone" size={18} />}
            variante={custoTotal > 5 ? 'perigo' : 'sucesso'}
          />
          <CardBasicoGlobal
            titulo="Latência Média"
            valor={`${latenciaMedia}ms`}
            icone={<Clock weight="duotone" size={18} />}
            variante={latenciaMedia > 5000 ? 'aviso' : 'sucesso'}
          />
          <CardBasicoGlobal
            titulo="Cache Hit Rate"
            valor={`${cache.hitRate}%`}
            icone={<Brain weight="duotone" size={18} />}
            variante={cache.hitRate >= 40 ? 'sucesso' : 'aviso'}
          />
        </>
      }
    >
      <div className="ws-fade-up" style={{ position: 'relative', zIndex: 10, marginTop: '32px' }}>
        <TabelaGlobal
          id="admin-gemini-metrics"
          dados={daily}
          colunas={colunas}
          idKey="date"
          mensagemVazio="Nenhuma métrica disponível. Execute análises Gemini para começar a coletar dados."
        />
      </div>
    </PaginaGlobal>
  )
}
