import React, { useEffect, useState } from 'react'

export function Historico() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Basic fetch to the backend via proxy
    fetch('/api/tenant/historico')
      .then(res => res.json())
      .then(data => {
        setLogs(data.data || [])
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Histórico de Alterações</h1>
      <p className="text-gray-600 mb-6">Auditoria completa de tudo que acontece no sistema.</p>
      
      {loading ? (
        <p>Carregando logs...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left bg-white border border-gray-200">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-sm font-semibold text-gray-700">Quando</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Quem</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Ação</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Módulo</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Descrição</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    Nenhum log encontrado.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
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
