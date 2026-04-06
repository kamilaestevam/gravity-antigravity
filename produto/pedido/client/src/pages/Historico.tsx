import React from 'react'
import { Historico as HistoricoGlobal } from '@tenant/historico'
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
    <HistoricoGlobal
      productId="pedido"
      apiBaseUrl="/historico-api"
      tenantId={tenantId}
      useMock={import.meta.env.DEV}
    />
  )
}
