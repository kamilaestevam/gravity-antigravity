/**
 * Academy Configurador — capítulos gerados do manual (SSOT: manual-configurador-conteudo.ts).
 * Curadoria enxuta por aula; um capítulo visível por vez na jornada.
 */

import {
  type ConfiguradorManualSlug,
  secaoConfiguradorPorSlug,
} from './manual-configurador-conteudo'
import { DOC_API_COCKPIT_SECAO } from './manual-api-cockpit-conteudo'
import {
  blocosDeSecaoConfiguradorAcademy,
  type CuradoriaSecaoAcademy,
} from './academy-blocos-manual'
import type { AulaDemo } from './manual-login-academy'

interface AulaConfiguradorDef {
  slug: string
  titulo: string
  duracao: string
  manualCapitulo: ConfiguradorManualSlug
  curadoria: CuradoriaSecaoAcademy
}

interface CapituloConfiguradorDef {
  slug: string
  tag: string
  emoji: string
  nome: string
  aulas: AulaConfiguradorDef[]
}

function secaoAcademyPorSlug(slug: ConfiguradorManualSlug) {
  if (slug === 'api-cockpit') return DOC_API_COCKPIT_SECAO
  return secaoConfiguradorPorSlug(slug)
}

function montarAula(def: AulaConfiguradorDef): AulaDemo {
  const secao = secaoAcademyPorSlug(def.manualCapitulo)
  if (!secao) {
    return {
      slug: def.slug,
      titulo: def.titulo,
      duracao: def.duracao,
      blocos: [{ tipo: 'texto', dados: { text: 'Conteúdo em preparação.' } }],
    }
  }
  return {
    slug: def.slug,
    titulo: def.titulo,
    duracao: def.duracao,
    blocos: blocosDeSecaoConfiguradorAcademy(secao, def.curadoria) as AulaDemo['blocos'],
    manualSecao: secao.num,
    manualCapitulo: def.manualCapitulo,
  }
}

const CAPITULOS_CONFIGURADOR_DEF: CapituloConfiguradorDef[] = [
  {
    slug: 'conhecendo-o-gravity',
    tag: '#60a5fa',
    emoji: '🧭',
    nome: 'Conhecendo o Gravity',
    aulas: [
      {
        slug: 'criando-a-organizacao',
        titulo: 'Criando a Organização',
        duracao: '20m',
        manualCapitulo: 'organizacao',
        curadoria: { incluirOrigemDados: true, fluxoIndices: [0] },
      },
      {
        slug: 'configurando-workspaces',
        titulo: 'Configurando Workspaces',
        duracao: '20m',
        manualCapitulo: 'workspaces',
        curadoria: { fluxoIndices: [0, 1], maxPassosPorFluxo: 2 },
      },
      {
        slug: 'convidando-usuarios',
        titulo: 'Convidando usuários',
        duracao: '20m',
        manualCapitulo: 'usuarios',
        curadoria: { fluxoIndices: [2], maxPassosPorFluxo: 2 },
      },
    ],
  },
  {
    slug: 'fornecedores-comex',
    tag: '#38bdf8',
    emoji: '🌐',
    nome: 'Fornecedores COMEX',
    aulas: [
      {
        slug: 'cadastrando-fornecedores',
        titulo: 'Cadastrando fornecedores',
        duracao: '25m',
        manualCapitulo: 'fornecedores',
        curadoria: { fluxoIndices: [0, 1], maxPassosPorFluxo: 2 },
      },
      {
        slug: 'exportador-e-importador',
        titulo: 'Exportador e importador',
        duracao: '25m',
        manualCapitulo: 'fornecedores',
        curadoria: {
          fluxoIndices: [2, 3],
          maxPassosPorFluxo: 2,
          incluirIntroSecao: false,
          infograficosSecao: ['fornecedores-comex'],
        },
      },
    ],
  },
  {
    slug: 'assinaturas-e-financeiro',
    tag: '#a78bfa',
    emoji: '💳',
    nome: 'Assinaturas e Financeiro',
    aulas: [
      {
        slug: 'gerenciando-assinaturas',
        titulo: 'Gerenciando assinaturas',
        duracao: '25m',
        manualCapitulo: 'assinaturas',
        curadoria: { fluxoIndices: [0, 1], maxPassosPorFluxo: 2 },
      },
      {
        slug: 'financeiro-da-conta',
        titulo: 'Financeiro da conta',
        duracao: '20m',
        manualCapitulo: 'financeiro',
        curadoria: { fluxoIndices: [0, 1], maxPassosPorFluxo: 2 },
      },
    ],
  },
  {
    slug: 'integracoes-e-operacao',
    tag: '#34d399',
    emoji: '⚙️',
    nome: 'Integrações e operação',
    aulas: [
      {
        slug: 'api-cockpit-integracoes',
        titulo: 'API Cockpit e integrações',
        duracao: '30m',
        manualCapitulo: 'api-cockpit',
        curadoria: { fluxoIndices: [0, 1], maxPassosPorFluxo: 1 },
      },
      {
        slug: 'taxas-e-moeda',
        titulo: 'Taxas e moeda',
        duracao: '15m',
        manualCapitulo: 'taxas-moeda',
        curadoria: { fluxoIndices: [0], maxPassosPorFluxo: 2 },
      },
      {
        slug: 'historico-e-auditoria',
        titulo: 'Histórico e auditoria',
        duracao: '20m',
        manualCapitulo: 'historico',
        curadoria: { fluxoIndices: [0], maxPassosPorFluxo: 2 },
      },
    ],
  },
]

export const CONFIGURADOR_CAP1_SLUG = CAPITULOS_CONFIGURADOR_DEF[0].slug

export const CONFIGURADOR_FASES_CAP1 = CAPITULOS_CONFIGURADOR_DEF[0].aulas.map(a => ({
  slug: a.slug,
  nome: a.titulo,
  duracao: a.duracao,
}))

export const AULAS_CONFIGURADOR_CAP1 = CAPITULOS_CONFIGURADOR_DEF[0].aulas.map(montarAula)

export const AULAS_CONFIGURADOR = CAPITULOS_CONFIGURADOR_DEF.flatMap(cap => cap.aulas.map(montarAula))

export const CONFIGURADOR_TRILHAS = CAPITULOS_CONFIGURADOR_DEF.map(cap => ({
  slug: cap.slug,
  tag: cap.tag,
  emoji: cap.emoji,
  nome: cap.nome,
  modulos: cap.aulas.length,
  duracao: cap.aulas.reduce((s, a) => s + parseInt(a.duracao, 10), 0) + 'm',
  prog: 0,
  fases: cap.aulas.map(a => ({
    slug: a.slug,
    nome: a.titulo,
    duracao: a.duracao,
    concluida: false,
  })),
}))

export const CONFIGURADOR_AULA_SLUGS = AULAS_CONFIGURADOR.map(a => a.slug)
