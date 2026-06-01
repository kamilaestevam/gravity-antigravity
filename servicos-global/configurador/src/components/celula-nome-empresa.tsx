import React from 'react'
import { OrgBadge } from './org-badge'

/** Coluna unificada: organização (internos) ou empresa fornecedora (Fornecedor). */
export function CelulaNomeEmpresa({
  ehFornecedor,
  nomeOrganizacao,
  nomeFornecedor,
}: {
  ehFornecedor: boolean
  nomeOrganizacao: string
  nomeFornecedor?: string | null
}) {
  if (ehFornecedor) {
    const nome = nomeFornecedor
    if (!nome) return <span style={{ color: 'var(--ws-muted)' }}>—</span>
    return <OrgBadge nome={nome} variant="fornecedor" />
  }

  return <OrgBadge nome={nomeOrganizacao} />
}
