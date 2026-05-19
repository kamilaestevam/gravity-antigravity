import '@nucleo/Utilidades/localization/i18n'
import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useShellStore } from '@gravity/shell'
import { MOCK_PEDIDOS_RESPONSE } from './shared/mockData'
import { ModalConsolidarPedidos } from './components/ModalPedidosConsolidar'

useShellStore.setState({
  addNotification: (n: unknown) => console.log('[mock-notification]', n),
} as never)

function TesteConsolidar() {
  const pedidos = MOCK_PEDIDOS_RESPONSE.data
  const [aberto, setAberto] = useState(true)
  const [selecionados, setSelecionados] = useState([pedidos[0], pedidos[1]])

  return (
    <div style={{ padding: 32, fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#e2e8f0' }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>Teste — Modal Consolidar Pedidos</h1>
      <p style={{ marginBottom: 16, color: '#94a3b8' }}>
        Pedidos selecionados: {selecionados.map(p => p.numero_pedido).join(', ')}
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {pedidos.map(p => (
          <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: '#cbd5e1' }}>
            <input
              type="checkbox"
              checked={selecionados.some(s => s.id === p.id)}
              onChange={e => {
                if (e.target.checked) setSelecionados(prev => [...prev, p])
                else setSelecionados(prev => prev.filter(s => s.id !== p.id))
              }}
            />
            {p.numero_pedido}
          </label>
        ))}
      </div>

      <button
        onClick={() => setAberto(true)}
        disabled={selecionados.length < 2}
        style={{
          padding: '8px 20px',
          background: selecionados.length < 2 ? '#334155' : '#f59e0b',
          color: selecionados.length < 2 ? '#64748b' : '#0f172a',
          border: 'none',
          borderRadius: 6,
          fontWeight: 600,
          cursor: selecionados.length < 2 ? 'not-allowed' : 'pointer',
        }}
      >
        Abrir Modal Consolidar ({selecionados.length} pedidos)
      </button>

      {aberto && selecionados.length >= 2 && (
        <ModalConsolidarPedidos
          pedidosSelecionados={selecionados}
          conflito_tipo_operacao={false}
          onFechar={() => setAberto(false)}
          onConcluido={() => { setAberto(false); alert('Consolidação concluída!') }}
        />
      )}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TesteConsolidar />
  </React.StrictMode>
)
