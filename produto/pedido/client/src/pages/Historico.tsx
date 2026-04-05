import React from 'react'
import { Historico as HistoricoGlobal } from '@tenant/historico'
import { useShellStore } from '@gravity/shell'

export default function Historico() {
  const { currentUser } = useShellStore()
  const tenantId = currentUser.tenantId
    ?? sessionStorage.getItem('gravity_tenant_id')
    ?? 'tenant-pedido-dev-001'

  return (
    <HistoricoGlobal
      productId="pedido"
      apiBaseUrl="/historico-api"
      tenantId={tenantId}
    />
  )
}
