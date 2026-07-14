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
  type BlocoConteudoAcademy,
  type CuradoriaSecaoAcademy,
} from './academy-blocos-manual'
import type { AulaDemo } from './manual-login-academy'

interface AulaConfiguradorDef {
  slug: string
  titulo: string
  duracao: string
  /** Aula gerada do manual. Omitir quando `blocosFixos` estiver definido. */
  manualCapitulo?: ConfiguradorManualSlug
  /** Várias seções do manual na mesma aula (ex.: Assinaturas + Financeiro). */
  manualCapitulos?: ConfiguradorManualSlug[]
  curadoria?: CuradoriaSecaoAcademy
  curadoriaPorCapitulo?: Partial<Record<ConfiguradorManualSlug, CuradoriaSecaoAcademy>>
  /** Aula especial (ex.: boas-vindas) — conteúdo fixo, sem SSOT de seção. */
  blocosFixos?: BlocoConteudoAcademy[]
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
  if (def.blocosFixos?.length) {
    return {
      slug: def.slug,
      titulo: def.titulo,
      duracao: def.duracao,
      blocos: def.blocosFixos as AulaDemo['blocos'],
    }
  }

  const capitulos = def.manualCapitulos?.length
    ? def.manualCapitulos
    : def.manualCapitulo
      ? [def.manualCapitulo]
      : []

  if (capitulos.length === 0) {
    return {
      slug: def.slug,
      titulo: def.titulo,
      duracao: def.duracao,
      blocos: [{ tipo: 'texto', dados: { text: 'Conteúdo em preparação.' } }],
    }
  }

  const blocos: BlocoConteudoAcademy[] = []
  let manualSecao: number | undefined
  let manualCapitulo: ConfiguradorManualSlug | undefined

  for (const cap of capitulos) {
    const secao = secaoAcademyPorSlug(cap)
    if (!secao) continue
    if (manualSecao == null) {
      manualSecao = secao.num
      manualCapitulo = cap
    }
    const cur = def.curadoriaPorCapitulo?.[cap] ?? def.curadoria ?? {}
    blocos.push(...blocosDeSecaoConfiguradorAcademy(secao, { ...cur, manualCapitulo: cap }))
  }

  if (blocos.length === 0) {
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
    blocos: blocos as AulaDemo['blocos'],
    manualSecao,
    manualCapitulo,
  }
}

const CAPITULOS_CONFIGURADOR_DEF: CapituloConfiguradorDef[] = [
  {
    slug: 'organizacoes-e-workspaces',
    tag: '#60a5fa',
    emoji: '🏢',
    nome: 'Organização e Workspaces',
    aulas: [
      {
        slug: 'criando-a-organizacao',
        titulo: 'O que é Organização?',
        duracao: '20m',
        manualCapitulo: 'organizacao',
        curadoria: { incluirOrigemDados: true, fluxoIndices: [0], incluirImagemSecao: false },
      },
      {
        slug: 'acessar-workspaces',
        titulo: 'Entenda o que são Workspaces no Gravity',
        duracao: '35m',
        manualCapitulo: 'workspaces',
        curadoria: {
          // Intro + todos os fluxos (acessar, criar, editar, ativar/suspender, excluir)
          fluxoIndices: [0, 1, 2, 3, 4],
          incluirImagemSecao: false,
        },
      },
    ],
  },
  {
    slug: 'usuarios',
    tag: '#a78bfa',
    emoji: '👥',
    nome: 'Usuários',
    aulas: [
      {
        slug: 'administrando-usuarios',
        titulo: 'Administrando usuários',
        duracao: '37m',
        manualCapitulo: 'usuarios',
        curadoria: { fluxoIndices: [1, 0, 2, 3, 4, 5] },
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
        curadoria: { fluxoIndices: [0, 1, 2, 3, 4], incluirImagemSecao: true },
      },
      {
        slug: 'financeiro-da-conta',
        titulo: 'Financeiro da conta',
        duracao: '20m',
        manualCapitulo: 'financeiro',
        curadoria: { fluxoIndices: [0, 1, 2], incluirImagemSecao: true },
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
        duracao: '45m',
        manualCapitulo: 'api-cockpit',
      },
      {
        slug: 'taxas-e-moeda',
        titulo: 'Taxas e moeda',
        duracao: '15m',
        manualCapitulo: 'taxas-moeda',
        curadoria: { fluxoIndices: [0, 1], maxPassosPorFluxo: 3 },
      },
      {
        slug: 'historico-e-auditoria',
        titulo: 'Histórico e auditoria',
        duracao: '20m',
        manualCapitulo: 'historico',
        curadoria: { fluxoIndices: [0, 1, 2], maxPassosPorFluxo: 4 },
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
