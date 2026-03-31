import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export function Historico() {
  const { t } = useTranslation()
  const [logs, setLogs] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Basic fetch to the backend via proxy
    fetch('/api/tenant/historico')
      .then(res => res.json())
      .then((data: { data?: unknown[] }) => {
        setLogs(data.data || [])
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{t('historico.titulo')}</h1>
      <p className="text-gray-600 mb-6">{t('historico.subtitulo')}</p>

      {loading ? (
        <p>{t('historico.carregando')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left bg-white border border-gray-200">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-sm font-semibold text-gray-700">{t('historico.tabela.quando')}</th>
                <th className="p-3 text-sm font-semibold text-gray-700">{t('historico.tabela.quem')}</th>
                <th className="p-3 text-sm font-semibold text-gray-700">{t('historico.tabela.acao')}</th>
                <th className="p-3 text-sm font-semibold text-gray-700">{t('historico.tabela.modulo')}</th>
                <th className="p-3 text-sm font-semibold text-gray-700">{t('historico.tabela.descricao')}</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    {t('historico.nenhum_log')}
                  </td>
                </tr>
              ) : (
                (logs as Array<{ id: string; created_at: string; actor_name: string; action: string; entity_label: string; description: string }>).map(log => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="p-3 text-sm">{log.actor_name}</td>
                    <td className="p-3 text-sm"><span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">{log.action}</span></td>
                    <td className="p-3 text-sm">{log.entity_label}</td>
                    <td className="p-3 text-sm">{log.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Historico
