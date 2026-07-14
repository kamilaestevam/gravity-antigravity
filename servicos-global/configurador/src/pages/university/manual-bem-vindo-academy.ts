/**
 * Guia Gravity — módulo Bem-vindo (primeira porta de entrada da Academy).
 */

import type { AulaDemo, BlocoConteudo } from './manual-login-academy'
import { blocosDeSecaoLogin } from './academy-blocos-manual'
import { DOC_BEM_VINDO_SECOES } from './manual-bem-vindo-conteudo'

export const BEM_VINDO_AULA_SLUG = 'boas-vindas'

const SECAO_BOAS_VINDAS = DOC_BEM_VINDO_SECOES[0]
const SECAO_O_QUE_E_O_GRAVITY = DOC_BEM_VINDO_SECOES[1]

const BLOCOS_BOAS_VINDAS: BlocoConteudo[] = [
  ...blocosDeSecaoLogin(SECAO_BOAS_VINDAS) as BlocoConteudo[],
  {
    tipo: 'video',
    dados: {
      titulo: 'Vídeo de boas-vindas do CEO',
      src: '/university/videos/video_minha_gravacao_boas_vindas_gravity.mp4',
      ganho_audio: 1.35,
    },
  },
  {
    tipo: 'texto',
    dados: {
      variante: 'links-externos',
      titulo: 'LinkedIn',
      itens: JSON.stringify([
        {
          label: 'Daniel Martins',
          descricao: 'Founder & CEO · DATI Tecnologia',
          href: 'https://www.linkedin.com/in/daniel-martins-7a7b4b10/',
        },
        {
          label: 'DATI Tecnologia',
          descricao: 'Empresa no LinkedIn',
          href: 'https://www.linkedin.com/company/datitecnologia/',
        },
      ]),
    },
  },
  {
    tipo: 'destaque',
    dados: {
      titulo: 'Próximo passo',
      text: 'Quando estiver pronto, avance para O que é o Gravity.',
    },
  },
]

const BLOCOS_O_QUE_E_O_GRAVITY: BlocoConteudo[] = (() => {
  const paragrafos = SECAO_O_QUE_E_O_GRAVITY.paragrafos
  const ateDna = paragrafos.slice(0, 3)
  const aposDna = paragrafos.slice(3)
  return [
    { tipo: 'heading', dados: { text: SECAO_O_QUE_E_O_GRAVITY.titulo, nivel: 1 } },
    ...ateDna.map((text) => ({ tipo: 'texto' as const, dados: { text } })),
    { tipo: 'infografico', dados: { id: 'gravity-dna' } },
    ...aposDna.map((text) => ({ tipo: 'texto' as const, dados: { text } })),
    { tipo: 'infografico', dados: { id: 'o-que-e-gravity' } },
  ]
})()

const BLOCOS_O_GUIA_GRAVITY: BlocoConteudo[] = [
  { tipo: 'heading', dados: { text: 'O Guia Gravity', nivel: 1 } },
  {
    tipo: 'texto',
    dados: {
      text: 'Aqui é o local para onboarding e consulta de manual da plataforma Gravity: você aprende no Guia e aprofunda no Manual, no mesmo lugar.',
    },
  },
  {
    tipo: 'texto',
    dados: {
      text: 'Em vez de um treinamento genérico, ou consulta em documentos complexos, cada aula é consulta: mostra telas reais, a ordem exata dos cliques e o porquê de cada etapa. É o mapa que transforma “onde eu clico?” em “eu sei o caminho”.',
    },
  },
  {
    tipo: 'definicao',
    dados: {
      termo: 'Guia Gravity',
      definicao:
        'Local para onboarding e consulta de manual: trilha visual por módulo (Bem Vindo, Login, Configurador, produtos), com aulas, passos, progresso e ponte para o manual descritivo.',
    },
  },
  {
    tipo: 'heading',
    dados: { text: 'Panorama visual', nivel: 2 },
  },
  {
    tipo: 'texto',
    dados: {
      text: 'Antes de entrar nos detalhes, veja o quadro completo: **onboarding**, **consulta** e **manual** no mesmo lugar — e a **GABI AI** fora, mas ao lado.',
    },
  },
  { tipo: 'infografico', dados: { id: 'guia-gravity' } },
  {
    tipo: 'heading',
    dados: { text: 'A jornada em cinco atos', nivel: 2 },
  },
  {
    tipo: 'texto',
    dados: {
      text: 'Na primeira passagem, siga a ordem abaixo. Depois, qualquer módulo vira consulta rápida quando você precisar revisitar um fluxo.',
    },
  },
  {
    tipo: 'timeline',
    dados: {
      titulo: 'Do primeiro olá ao domínio operacional',
      itens: JSON.stringify([
        {
          label: 'Bem Vindo',
          descricao: 'Entenda a plataforma, o próprio guia e o que esperar da jornada.',
        },
        {
          label: 'Login',
          descricao: 'Acesse a conta, recupere senha, aceite convites e entre com Google quando aplicável.',
        },
        {
          label: 'Configurador',
          descricao: 'Organize a conta: organização, workspaces, usuários e permissões.',
        },
        {
          label: 'Produtos contratados',
          descricao: 'Aprenda Pedido, Processo, Smart Docs, BIDs e os demais módulos ativos na organização.',
        },
        {
          label: 'Domínio no dia a dia',
          descricao: 'Opere com confiança, revise aulas quando precisar e aprofunde no manual descritivo.',
        },
      ]),
    },
  },
  {
    tipo: 'heading',
    dados: { text: 'Como estudar sem se perder', nivel: 2 },
  },
  {
    tipo: 'texto',
    dados: {
      text: 'Abra um módulo no menu. Escolha um card (aula). No player, leia o texto, observe as telas e siga os passos numerados. Ao terminar, marque como concluída: o progresso sobe e a próxima etapa se libera.',
    },
  },
  {
    tipo: 'lista_legenda',
    dados: {
      emLinha: 0,
      itens: JSON.stringify([
        {
          label: 'Módulo',
          descricao: 'Tema no menu lateral (ex.: Login, Configurador).',
        },
        {
          label: 'Aula / card',
          descricao: 'Uma etapa da jornada, com duração e XP.',
        },
        {
          label: 'Passos visuais',
          descricao: 'Ordem exata na tela (PASSO 01, PASSO 02…).',
        },
        {
          label: 'Conclusão',
          descricao: 'Marque a aula e avance; pode revisitar sempre.',
        },
      ]),
    },
  },
  {
    tipo: 'destaque',
    dados: {
      titulo: 'Dica de ouro',
      text: 'Faça a primeira passagem completa na ordem da jornada. Depois use o Guia como atalho e o Manual quando precisar de profundidade.',
    },
  },
  {
    tipo: 'destaque_escuro',
    dados: {
      titulo: 'O resultado que buscamos',
      texto:
        'Sair daqui não é “ter lido tudo”. É saber navegar, configurar a conta e operar os produtos contratados com clareza, no seu ritmo.',
      imagem_alt: 'Jornada concluída com confiança',
    },
  },
]

export const AULAS_BEM_VINDO: AulaDemo[] = [
  {
    slug: BEM_VINDO_AULA_SLUG,
    titulo: 'Boas-vindas',
    duracao: '2m',
    blocos: BLOCOS_BOAS_VINDAS,
  },
  {
    slug: 'o-que-e-o-gravity',
    titulo: 'O que é o Gravity',
    duracao: '5m',
    blocos: BLOCOS_O_QUE_E_O_GRAVITY,
  },
  {
    slug: 'o-guia-gravity',
    titulo: 'O Guia Gravity',
    duracao: '8m',
    blocos: BLOCOS_O_GUIA_GRAVITY,
  },
]

export const BEM_VINDO_FASES_TRILHA = AULAS_BEM_VINDO.map(a => ({
  slug: a.slug,
  nome: a.titulo,
  duracao: a.duracao,
}))

const DURACAO_TOTAL_MIN = AULAS_BEM_VINDO.reduce((s, a) => s + parseInt(a.duracao, 10), 0)

export const BEM_VINDO_TRILHA = {
  slug: 'bem-vindo',
  tag: '#a78bfa',
  emoji: '👋',
  nome: 'Primeiros Passos: Bem Vindo',
  modulos: AULAS_BEM_VINDO.length,
  duracao: `${DURACAO_TOTAL_MIN}m`,
  prog: 0,
  fases: BEM_VINDO_FASES_TRILHA.map(f => ({ ...f, concluida: false })),
}
