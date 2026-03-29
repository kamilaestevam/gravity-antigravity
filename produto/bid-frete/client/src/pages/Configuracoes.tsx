/**
 * Configuracoes.tsx — Pagina de configuracao do produto BID Frete
 * Conectores (ERP, armadores), preferencias de notificacao, canais padrao
 */

import { useState, useEffect } from 'react'
import type { CanalDisparo } from '../shared/types.js'

interface ConnectorConfig {
  id: string
  tipo: 'ERP' | 'ARMADOR' | 'CIA_AEREA' | 'WHATSAPP' | 'EMAIL'
  nome: string
  habilitado: boolean
  configuracao: Record<string, string>
}

interface NotificationPrefs {
  email_nova_resposta: boolean
  email_cotacao_expirada: boolean
  email_aprovacao: boolean
  whatsapp_nova_resposta: boolean
  whatsapp_cotacao_expirada: boolean
}

interface Config {
  connectors: ConnectorConfig[]
  notifications: NotificationPrefs
  canais_padrao: CanalDisparo[]
  auto_disparar_tabela: boolean
  prazo_padrao_resposta_horas: number
}

const DEFAULT_CONFIG: Config = {
  connectors: [],
  notifications: {
    email_nova_resposta: true,
    email_cotacao_expirada: true,
    email_aprovacao: true,
    whatsapp_nova_resposta: false,
    whatsapp_cotacao_expirada: false,
  },
  canais_padrao: ['EMAIL'],
  auto_disparar_tabela: true,
  prazo_padrao_resposta_horas: 72,
}

const API_BASE = '/api/v1/bid-frete'

export default function Configuracoes() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'conectores' | 'notificacoes' | 'geral'>('geral')

  useEffect(() => {
    fetch(`${API_BASE}/configuracoes`)
      .then(r => r.ok ? r.json() : DEFAULT_CONFIG)
      .then(data => setConfig({ ...DEFAULT_CONFIG, ...data }))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function salvar() {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch(`${API_BASE}/configuracoes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (!res.ok) throw new Error('Erro ao salvar configuracoes')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function toggleCanal(canal: CanalDisparo) {
    setConfig(prev => ({
      ...prev,
      canais_padrao: prev.canais_padrao.includes(canal)
        ? prev.canais_padrao.filter(c => c !== canal)
        : [...prev.canais_padrao, canal],
    }))
  }

  function toggleConnector(id: string) {
    setConfig(prev => ({
      ...prev,
      connectors: prev.connectors.map(c =>
        c.id === id ? { ...c, habilitado: !c.habilitado } : c
      ),
    }))
  }

  function updateNotification(key: keyof NotificationPrefs) {
    setConfig(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] },
    }))
  }

  if (loading) return <div className="p-8">Carregando configuracoes...</div>

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Configuracoes</h1>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-green-600">Salvo com sucesso!</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
          <button
            onClick={salvar}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {([
          { key: 'geral', label: 'Geral' },
          { key: 'conectores', label: 'Conectores' },
          { key: 'notificacoes', label: 'Notificacoes' },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px ${
              activeTab === t.key ? 'border-blue-600 text-blue-700 font-medium' : 'border-transparent text-gray-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Geral */}
      {activeTab === 'geral' && (
        <div className="bg-white rounded-lg border p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-3">Canais de Disparo Padrao</h3>
            <div className="flex gap-3">
              {(['EMAIL', 'WHATSAPP', 'API', 'PORTAL'] as CanalDisparo[]).map(canal => (
                <label key={canal} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={config.canais_padrao.includes(canal)}
                    onChange={() => toggleCanal(canal)}
                  />
                  {canal}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Prazo Padrao de Resposta</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={config.prazo_padrao_resposta_horas}
                onChange={e => setConfig(prev => ({ ...prev, prazo_padrao_resposta_horas: Number(e.target.value) }))}
                className="border rounded p-2 w-24 text-sm"
                min={1}
              />
              <span className="text-sm text-gray-500">horas</span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={config.auto_disparar_tabela}
                onChange={() => setConfig(prev => ({ ...prev, auto_disparar_tabela: !prev.auto_disparar_tabela }))}
              />
              Auto-disparar resposta com base na tabela de precos do fornecedor
            </label>
          </div>
        </div>
      )}

      {/* Tab: Conectores */}
      {activeTab === 'conectores' && (
        <div className="space-y-4">
          {config.connectors.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
              <p>Nenhum conector configurado.</p>
              <p className="text-xs mt-1">Conectores de ERP, armadores e companhias aereas podem ser configurados aqui.</p>
            </div>
          ) : (
            config.connectors.map(conn => (
              <div key={conn.id} className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{conn.nome}</h3>
                    <p className="text-xs text-gray-400">{conn.tipo}</p>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={conn.habilitado}
                      onChange={() => toggleConnector(conn.id)}
                    />
                    <span className="text-sm">{conn.habilitado ? 'Habilitado' : 'Desabilitado'}</span>
                  </label>
                </div>
                {conn.habilitado && (
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(conn.configuracao).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-xs text-gray-500 mb-1">{key}</label>
                        <input
                          type={key.toLowerCase().includes('secret') || key.toLowerCase().includes('password') ? 'password' : 'text'}
                          value={value}
                          onChange={e => {
                            setConfig(prev => ({
                              ...prev,
                              connectors: prev.connectors.map(c =>
                                c.id === conn.id
                                  ? { ...c, configuracao: { ...c.configuracao, [key]: e.target.value } }
                                  : c
                              ),
                            }))
                          }}
                          className="w-full border rounded p-1.5 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}

          <div className="bg-gray-50 rounded-lg border border-dashed p-4 text-center">
            <p className="text-sm text-gray-500">Conectores disponiveis: SAP, TOTVS, Maersk, MSC, CMA CGM, Hapag-Lloyd</p>
            <p className="text-xs text-gray-400 mt-1">Para adicionar, entre em contato com o suporte.</p>
          </div>
        </div>
      )}

      {/* Tab: Notificacoes */}
      {activeTab === 'notificacoes' && (
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h3 className="text-sm font-semibold">Notificacoes por Email</h3>
          <div className="space-y-2">
            {[
              { key: 'email_nova_resposta' as const, label: 'Nova resposta de fornecedor' },
              { key: 'email_cotacao_expirada' as const, label: 'Cotacao expirada' },
              { key: 'email_aprovacao' as const, label: 'Cotacao aprovada' },
            ].map(item => (
              <label key={item.key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.notifications[item.key]}
                  onChange={() => updateNotification(item.key)}
                />
                {item.label}
              </label>
            ))}
          </div>

          <h3 className="text-sm font-semibold pt-4">Notificacoes por WhatsApp</h3>
          <div className="space-y-2">
            {[
              { key: 'whatsapp_nova_resposta' as const, label: 'Nova resposta de fornecedor' },
              { key: 'whatsapp_cotacao_expirada' as const, label: 'Cotacao expirada' },
            ].map(item => (
              <label key={item.key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.notifications[item.key]}
                  onChange={() => updateNotification(item.key)}
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
