/**
 * Guia Gravity — módulo Gabi IA (Academy).
 * SSOT de conteúdo: manual-gabi-conteudo.ts
 */

import type { AulaDemo, BlocoConteudo } from './manual-login-academy'
import { blocosDeSecaoLogin } from './academy-blocos-manual'
import { DOC_GABI_SECOES, SCREENSHOT_GABI_JANELA_CONTROLES, SCREENSHOT_GABI_JANELA_EXPANDIDA } from './manual-gabi-conteudo'
import { IDS_EXEMPLOS_AULA_O_QUE_E_GABI } from './manual-gabi-exemplo-conversa-dados'

const SECAO_O_QUE_E = DOC_GABI_SECOES[0]
const SECAO_LIMITES = DOC_GABI_SECOES[3]

const BLOCOS_JANELA_GABI: BlocoConteudo[] = [
  {
    tipo: 'heading',
    dados: { text: 'A janela do chat em 4 partes', nivel: 2 },
  },
  {
    tipo: 'texto',
    dados: {
      text: 'Depois de clicar no botão roxo, a **janela da Gabi** abre flutuando sobre a tela. Você não precisa sair do produto em que está. Ela pode ser **movida**, **expandida** e **redimensionada** do seu jeito.',
    },
  },
  { tipo: 'infografico', dados: { id: 'gabi-janela' } },
  {
    tipo: 'imagem',
    dados: {
      src: SCREENSHOT_GABI_JANELA_CONTROLES,
      alt: 'Janela da Gabi com controles, sugestões e campo de pergunta',
      caption: 'Controles no cabeçalho (− expandir ×), sugestões rápidas, campo Pergunte algo… e botão enviar.',
      larguraMaxima: 400,
    },
  },
  {
    tipo: 'imagem',
    dados: {
      src: SCREENSHOT_GABI_JANELA_EXPANDIDA,
      alt: 'Janela da Gabi expandida em quase tela cheia',
      caption: 'Modo expandido: quase tela cheia. Clique de novo no ícone de expandir para voltar ao tamanho anterior.',
      larguraMaxima: 520,
    },
  },
]

const BLOCOS_O_QUE_E_A_GABI: BlocoConteudo[] = [
  { tipo: 'heading', dados: { text: SECAO_O_QUE_E.titulo, nivel: 1 } },
  { tipo: 'texto', dados: { text: SECAO_O_QUE_E.paragrafos[0] } },
  { tipo: 'texto', dados: { text: SECAO_O_QUE_E.paragrafos[1] } },
  {
    tipo: 'heading',
    dados: { text: 'Guia Gravity e Gabi', nivel: 2 },
  },
  {
    tipo: 'texto',
    dados: {
      text: 'O **Guia Gravity** ensina o caminho tela a tela; a **Gabi** resolve na conversa. O infográfico abaixo mostra como **onboarding**, **consulta**, **manual** e **Gabi IA** se encaixam no ecossistema.',
    },
  },
  { tipo: 'infografico', dados: { id: 'guia-gravity-ecossistema' } },
  { tipo: 'texto', dados: { text: SECAO_O_QUE_E.paragrafos[2] } },
  {
    tipo: 'heading',
    dados: { text: 'Tudo o que a Gabi faz hoje', nivel: 2 },
  },
  {
    tipo: 'texto',
    dados: {
      text: 'O quadro abaixo mostra **o que já está disponível** para você usar hoje. Em alguns produtos ela consulta e altera dados de verdade; em outros ainda **só explica** como o módulo funciona.',
    },
  },
  { tipo: 'infografico', dados: { id: 'gabi-capacidades' } },
  {
    tipo: 'heading',
    dados: { text: 'Exemplos de conversa', nivel: 2 },
  },
  {
    tipo: 'texto',
    dados: {
      text: 'Veja como o chat se parece no dia a dia: perguntas comuns, respostas da Gabi e quando ela pede confirmação antes de alterar algo. Exemplos **fáceis**, **médios** e **difíceis**.',
    },
  },
  {
    tipo: 'gabi_conversas',
    dados: { ids: JSON.stringify([...IDS_EXEMPLOS_AULA_O_QUE_E_GABI]) },
  },
  ...BLOCOS_JANELA_GABI,
]

const BLOCOS_LIMITES: BlocoConteudo[] = [
  ...blocosDeSecaoLogin(SECAO_LIMITES) as BlocoConteudo[],
  {
    tipo: 'destaque_escuro',
    dados: {
      titulo: 'Resumo prático',
      texto:
        'Use a Gabi para perguntar, consultar e agilizar tarefas, com permissões corretas e confirmação nas ações sensíveis. Use o Guia Gravity para aprender fluxos completos tela a tela.',
      imagem_alt: 'Gabi e Guia Gravity, papéis complementares',
    },
  },
]

export const GABI_AULA_SLUGS = [
  'o-que-e-a-gabi',
  'limites-e-permissoes',
] as const

const GABI_DURACOES = ['24m', '6m'] as const

export const AULAS_GABI: AulaDemo[] = [
  {
    slug: GABI_AULA_SLUGS[0],
    titulo: SECAO_O_QUE_E.titulo,
    duracao: GABI_DURACOES[0],
    blocos: BLOCOS_O_QUE_E_A_GABI,
    manualSecao: SECAO_O_QUE_E.num,
  },
  {
    slug: GABI_AULA_SLUGS[1],
    titulo: SECAO_LIMITES.titulo,
    duracao: GABI_DURACOES[1],
    blocos: BLOCOS_LIMITES,
    manualSecao: SECAO_LIMITES.num,
  },
]

export const GABI_FASES_TRILHA = AULAS_GABI.map(a => ({
  slug: a.slug,
  nome: a.titulo,
  duracao: a.duracao,
}))

const DURACAO_TOTAL_MIN = AULAS_GABI.reduce((s, a) => s + parseInt(a.duracao, 10), 0)

export const GABI_TRILHA = {
  slug: 'gabi',
  tag: '#e879f9',
  emoji: '✨',
  nome: 'Guia Gabi IA',
  modulos: AULAS_GABI.length,
  duracao: `${DURACAO_TOTAL_MIN}m`,
  prog: 0,
  fases: GABI_FASES_TRILHA.map(f => ({ ...f, concluida: false })),
}
