/**
 * Infográficos e blocos embutidos do manual reutilizados na Academy.
 */

import React from 'react'
import type { ConfiguradorManualSlug } from './manual-configurador-conteudo'
import { secaoConfiguradorPorSlug } from './manual-configurador-conteudo'
import {
  ManualBlocoOrigemDados,
  ManualInfograficoFornecedoresComex,
  ManualInfograficoOrganizacaoConta,
  ManualInfograficoOrganizacaoWorkspaces,
  ManualInfograficoPapeisFornecedor,
  ManualInfograficoPermissoesUsuario,
  ManualInfograficoTiposUsuario,
  ManualTabelaComparativaOrganizacaoWorkspace,
} from './manual-configurador-ui'
import { ManualInfograficoGuiaGravity } from './manual-bem-vindo-infografico-guia-gravity'
import {
  ManualInfograficoDnaGravity,
  ManualInfograficoOQueEGravity,
} from './manual-bem-vindo-infografico-o-que-e-gravity'
import { ManualInfograficoApiCockpitIntegracao } from './manual-api-cockpit-infografico-integracao'
import { ManualInfograficoApiCockpitWebhookVsApi } from './manual-api-cockpit-infografico-webhook-vs-api'
import { ManualInfograficoApiCockpitConsumo } from './manual-api-cockpit-infografico-consumo'
import { ManualInfograficoGabiCapacidades } from './manual-gabi-infografico-capacidades'
import { ManualInfograficoGabiJanela } from './manual-gabi-infografico-janela'

export type IdInfograficoAcademy =
  | 'organizacao-conta'
  | 'organizacao-workspaces'
  | 'fornecedores-comex'
  | 'papeis-fornecedor'
  | 'tipos-usuario'
  | 'permissoes-usuario'
  | 'guia-gravity'
  | 'guia-gravity-ecossistema'
  | 'o-que-e-gravity'
  | 'gravity-dna'
  | 'api-cockpit-integracao'
  | 'api-cockpit-webhook-vs-api'
  | 'api-cockpit-consumo'
  | 'gabi-capacidades'
  | 'gabi-janela'

function InfograficoOrganizacaoWorkspacesAcademy() {
  return (
    <>
      <ManualInfograficoOrganizacaoWorkspaces />
      <ManualTabelaComparativaOrganizacaoWorkspace />
    </>
  )
}

export function AcademyOrigemDados({ manualCapitulo }: { manualCapitulo: ConfiguradorManualSlug | string }) {
  const secao = secaoConfiguradorPorSlug(manualCapitulo as ConfiguradorManualSlug)
  if (!secao?.origemDados) return null
  return (
    <div className="uni-academy-origem-dados">
      <ManualBlocoOrigemDados origem={secao.origemDados} />
    </div>
  )
}

const REGISTRO_INFOGRAFICOS_ACADEMY: Record<IdInfograficoAcademy, React.ComponentType> = {
  'organizacao-conta': ManualInfograficoOrganizacaoConta,
  'organizacao-workspaces': InfograficoOrganizacaoWorkspacesAcademy,
  'fornecedores-comex': ManualInfograficoFornecedoresComex,
  'papeis-fornecedor': ManualInfograficoPapeisFornecedor,
  'tipos-usuario': ManualInfograficoTiposUsuario,
  'permissoes-usuario': ManualInfograficoPermissoesUsuario,
  'guia-gravity': ManualInfograficoGuiaGravity,
  'guia-gravity-ecossistema': () => (
    <ManualInfograficoGuiaGravity mostrarJornada={false} mostrarMapa={false} />
  ),
  'o-que-e-gravity': ManualInfograficoOQueEGravity,
  'gravity-dna': ManualInfograficoDnaGravity,
  'api-cockpit-integracao': ManualInfograficoApiCockpitIntegracao,
  'api-cockpit-webhook-vs-api': ManualInfograficoApiCockpitWebhookVsApi,
  'api-cockpit-consumo': ManualInfograficoApiCockpitConsumo,
  'gabi-capacidades': ManualInfograficoGabiCapacidades,
  'gabi-janela': ManualInfograficoGabiJanela,
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
