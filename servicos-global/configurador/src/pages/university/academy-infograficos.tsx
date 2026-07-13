/**
 * Infográficos reutilizados na Academy (mesmos componentes do manual).
 */

import React from 'react'
import {
  ManualInfograficoFornecedoresComex,
  ManualInfograficoOrganizacaoConta,
  ManualInfograficoOrganizacaoWorkspaces,
  ManualInfograficoPapeisFornecedor,
  ManualInfograficoPermissoesUsuario,
  ManualInfograficoTiposUsuario,
  ManualTabelaComparativaOrganizacaoWorkspace,
} from './manual-configurador-ui'

export type IdInfograficoAcademy =
  | 'organizacao-conta'
  | 'organizacao-workspaces'
  | 'fornecedores-comex'
  | 'papeis-fornecedor'
  | 'tipos-usuario'
  | 'permissoes-usuario'

function InfograficoOrganizacaoWorkspacesAcademy() {
  return (
    <>
      <ManualInfograficoOrganizacaoWorkspaces />
      <ManualTabelaComparativaOrganizacaoWorkspace />
    </>
  )
}

const REGISTRO_INFOGRAFICOS_ACADEMY: Record<IdInfograficoAcademy, React.ComponentType> = {
  'organizacao-conta': ManualInfograficoOrganizacaoConta,
  'organizacao-workspaces': InfograficoOrganizacaoWorkspacesAcademy,
  'fornecedores-comex': ManualInfograficoFornecedoresComex,
  'papeis-fornecedor': ManualInfograficoPapeisFornecedor,
  'tipos-usuario': ManualInfograficoTiposUsuario,
  'permissoes-usuario': ManualInfograficoPermissoesUsuario,
}

export function AcademyInfografico({ id }: { id: IdInfograficoAcademy | string }) {
  const Comp = REGISTRO_INFOGRAFICOS_ACADEMY[id as IdInfograficoAcademy]
  if (!Comp) return null
  return (
    <div className="uni-academy-infografico">
      <Comp />
    </div>
  )
}
