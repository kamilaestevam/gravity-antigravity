import React from 'react'
import { Historico as HistoricoGlobal } from '@organizacao/historico'
import { useShellStore } from '@gravity/shell'
import { getApiContext } from '../shared/api'

export default function Historico() {
  const { currentUser } = useShellStore()
  // Usa o mesmo tenantId que todas as requisições da API usam (via setApiContext)
  const { tenantId: apiTenantId } = getApiContext()
  const tenantId = apiTenantId
    || currentUser.tenantId
    || import.meta.env.VITE_DEV_TENANT_ID
    || 'tenant-pedido-dev-001'

  return (
    <div className="ws-fade-up" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, padding: '0.5rem 2rem 1.5rem', gap: '1rem' }}>
      <HistoricoGlobal
        productId="pedido"
        apiBaseUrl="/historico-api"
        tenantId={tenantId}
        useMock={false}
      />
    </div>
  )
}
