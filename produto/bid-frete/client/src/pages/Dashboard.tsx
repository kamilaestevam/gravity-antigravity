/**
 * Dashboard.tsx — Visao Geral do BID Frete
 * KPIs, savings, funil de status, calendario de alertas
 * Baseado no print "bid frete modelo.png"
 */

import { useState, useEffect } from 'react'
import { dashboardApi } from '../shared/api.js'
import type { DashboardKPIs } from '../shared/types.js'

export default function Dashboard() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
  const [calendario, setCalendario] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardApi.kpis(),
      dashboardApi.calendario(),
    ]).then(([k, c]) => {
      setKpis(k)
      setCalendario(c)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8">Carregando dashboard...</div>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Visao Geral</h1>

      {/* KPIs principais */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Cotacoes em andamento</p>
          <p className="text-3xl font-bold">{kpis?.cotacoes_andamento ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Valor total em andamento</p>
          <p className="text-lg font-semibold">USD {(kpis?.valor_andamento_usd ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Cotacoes aprovadas</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 rounded-full h-3"
                style={{ width: `${kpis?.aprovacao.percentual_em_tempo ?? 0}%` }}
              />
            </div>
            <span className="text-sm font-medium">{kpis?.aprovacao.percentual_em_tempo}%</span>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Saving estimado</p>
          <p className="text-lg font-semibold text-green-600">
            {(kpis?.savings.media_saving_percentual ?? 0).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Segunda linha de KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Total de cotacoes passadas</p>
          <p className="text-3xl font-bold">{kpis?.cotacoes_passadas ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Valor total aprovado</p>
          <p className="text-lg font-semibold">USD {(kpis?.valor_aprovado_usd ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border col-span-2">
          <p className="text-sm text-gray-500 mb-2">Funil de status</p>
          <div className="flex gap-2 flex-wrap">
            {kpis?.funil.map(f => (
              <span key={f.status} className="px-2 py-1 bg-gray-100 rounded text-xs">
                {f.status}: {f.count}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Calendario de alertas */}
      {calendario?.alertas && (
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <h2 className="text-lg font-semibold mb-3">Alertas</h2>
          <div className="space-y-2">
            {calendario.alertas.map((a: any) => (
              <div key={a.tipo} className="flex items-center justify-between p-2 rounded bg-gray-50">
                <span className="text-sm">{a.label}</span>
                <span className={`px-2 py-0.5 rounded text-sm font-medium ${
                  a.cor === 'green' ? 'bg-green-100 text-green-700' :
                  a.cor === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                  a.cor === 'orange' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {a.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
