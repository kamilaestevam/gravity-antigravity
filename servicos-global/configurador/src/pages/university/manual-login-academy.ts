/**
 * Academy Login — aulas geradas a partir do manual (SSOT: manual-login-conteudo.ts).
 */

import { DOC_LOGIN_SECOES, type DocPassoVisual, type DocSecao } from './manual-login-conteudo'

type TipoBloco =
  | 'heading' | 'texto' | 'imagem' | 'video' | 'citacao' | 'destaque'
  | 'definicao' | 'dois_colunas' | 'timeline' | 'destaque_escuro'

interface BlocoConteudo {
  tipo: TipoBloco
  dados: Record<string, string | number>
}

export interface AulaDemo {
  slug: string
  titulo: string
  duracao: string
  blocos: BlocoConteudo[]
}

export const LOGIN_AULA_SLUGS = [
  'a-tela-de-acesso',
  'criar-sua-conta',
  'entrar-email-senha',
  'recuperar-senha',
  'convite-usuario',
  'entrar-com-google',
] as const

const LOGIN_DURACOES = ['8m', '18m', '12m', '14m', '16m', '8m']

function limparTextoManual(texto: string): string {
  return texto
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\{\{link:([^|]+)\|([^}]+)\}\}/g, '$2')
    .replace(/\{\{icone:[^}]+\}\}/g, '👁')
}

function tituloCallout(tipo: string): string {
  const map: Record<string, string> = {
    dica: 'Dica',
    aviso: 'Atenção',
    seguranca: 'Segurança',
    exemplo: 'Exemplo',
  }
  return map[tipo] ?? 'Nota'
}

function blocosDeCallout(callout: { tipo: string; texto: string }): BlocoConteudo {
  return {
    tipo: 'destaque',
    dados: {
      titulo: tituloCallout(callout.tipo),
      text: limparTextoManual(callout.texto),
    },
  }
}

function blocosDePasso(passo: DocPassoVisual): BlocoConteudo[] {
  const blocos: BlocoConteudo[] = [
    { tipo: 'heading', dados: { text: `${passo.num}. ${passo.titulo}`, nivel: 2 } },
  ]
  for (const paragrafo of passo.paragrafos) {
    blocos.push({ tipo: 'texto', dados: { text: limparTextoManual(paragrafo) } })
  }
  if (passo.imagem) {
    blocos.push({
      tipo: 'imagem',
      dados: { src: passo.imagem, alt: passo.titulo, largura: 'full' },
    })
  }
  if (passo.galeriaTelas) {
    for (const tela of passo.galeriaTelas) {
      blocos.push({ tipo: 'heading', dados: { text: tela.legenda, nivel: 3 } })
      blocos.push({
        tipo: 'imagem',
        dados: { src: tela.imagem, alt: tela.legenda, largura: 'full' },
      })
    }
  }
  if (passo.callout) blocos.push(blocosDeCallout(passo.callout))
  for (const callout of passo.callouts ?? []) blocos.push(blocosDeCallout(callout))
  return blocos
}

function blocosDeSecao(secao: DocSecao): BlocoConteudo[] {
  const blocos: BlocoConteudo[] = [
    { tipo: 'heading', dados: { text: `${secao.num}. ${secao.titulo}`, nivel: 1 } },
  ]
  for (const paragrafo of secao.paragrafos) {
    blocos.push({ tipo: 'texto', dados: { text: limparTextoManual(paragrafo) } })
  }
  if (secao.imagem) {
    blocos.push({
      tipo: 'imagem',
      dados: { src: secao.imagem, alt: secao.titulo, caption: secao.titulo, largura: 'full' },
    })
  }
  if (secao.lista?.length) {
    blocos.push({
      tipo: 'texto',
      dados: {
        text: secao.lista.map(item => `• ${limparTextoManual(item)}`).join('\n'),
      },
    })
  }
  if (secao.callout) blocos.push(blocosDeCallout(secao.callout))
  for (const passo of secao.passosVisuais ?? []) {
    blocos.push(...blocosDePasso(passo))
  }
  return blocos
}

export const LOGIN_FASES_TRILHA = DOC_LOGIN_SECOES.map((secao, i) => ({
  slug: LOGIN_AULA_SLUGS[i],
  nome: secao.titulo,
  duracao: LOGIN_DURACOES[i] ?? '10m',
}))

export const AULAS_LOGIN: AulaDemo[] = DOC_LOGIN_SECOES.map((secao, i) => ({
  slug: LOGIN_AULA_SLUGS[i],
  titulo: secao.titulo,
  duracao: LOGIN_DURACOES[i] ?? '10m',
  blocos: blocosDeSecao(secao),
}))
