/**
 * Geradores de blocos Academy a partir do SSOT dos manuais.
 */

import type { DocPassoVisual as DocPassoLogin } from './manual-login-conteudo'
import type {
  DocFluxo,
  DocOrigemDados,
  DocPassoVisual as DocPassoConfigurador,
  DocSecao as DocSecaoConfigurador,
} from './manual-configurador-conteudo'
import type { IdInfograficoAcademy } from './academy-infograficos'

export type TipoBlocoAcademy =
  | 'heading' | 'texto' | 'imagem' | 'video' | 'citacao' | 'destaque'
  | 'definicao' | 'dois_colunas' | 'timeline' | 'destaque_escuro' | 'infografico'

export interface BlocoConteudoAcademy {
  tipo: TipoBlocoAcademy
  dados: Record<string, string | number>
}

export function limparTextoManual(texto: string): string {
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
    destaque: 'Destaque',
    lembrete: 'Lembrete',
  }
  return map[tipo] ?? 'Nota'
}

function blocosDeCallout(callout: { tipo: string; texto: string }): BlocoConteudoAcademy {
  return {
    tipo: 'destaque',
    dados: {
      titulo: tituloCallout(callout.tipo),
      text: limparTextoManual(callout.texto),
    },
  }
}

function blocosDePassoLogin(passo: DocPassoLogin): BlocoConteudoAcademy[] {
  const blocos: BlocoConteudoAcademy[] = [
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

export function blocosDeSecaoLogin(secao: {
  num: number
  titulo: string
  paragrafos: string[]
  imagem?: string
  callout?: { tipo: string; texto: string }
  passosVisuais?: DocPassoLogin[]
}): BlocoConteudoAcademy[] {
  const blocos: BlocoConteudoAcademy[] = [
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
  if (secao.callout) blocos.push(blocosDeCallout(secao.callout))
  for (const passo of secao.passosVisuais ?? []) {
    blocos.push(...blocosDePassoLogin(passo))
  }
  return blocos
}

function blocosDePassoConfigurador(passo: DocPassoConfigurador, indice: number): BlocoConteudoAcademy[] {
  const titulo = passo.titulo
  const num = passo.num ?? indice + 1
  const blocos: BlocoConteudoAcademy[] = [
    { tipo: 'heading', dados: { text: `${num}. ${titulo}`, nivel: 2 } },
  ]
  for (const paragrafo of passo.paragrafos ?? []) {
    blocos.push({ tipo: 'texto', dados: { text: limparTextoManual(paragrafo) } })
  }
  if (passo.imagem) {
    blocos.push({
      tipo: 'imagem',
      dados: { src: passo.imagem, alt: titulo, largura: 'full' },
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

function blocosDeOrigemDados(origem: DocOrigemDados): BlocoConteudoAcademy[] {
  const blocos: BlocoConteudoAcademy[] = []
  if (origem.titulo) {
    blocos.push({ tipo: 'heading', dados: { text: origem.titulo, nivel: 2 } })
  }
  for (const paragrafo of origem.paragrafos) {
    blocos.push({ tipo: 'texto', dados: { text: limparTextoManual(paragrafo) } })
  }
  for (const etapa of origem.etapas) {
    blocos.push({ tipo: 'heading', dados: { text: etapa.legenda, nivel: 3 } })
    for (const paragrafo of etapa.paragrafos) {
      blocos.push({ tipo: 'texto', dados: { text: limparTextoManual(paragrafo) } })
    }
    blocos.push({
      tipo: 'imagem',
      dados: { src: etapa.imagem, alt: etapa.legenda, largura: 'full' },
    })
  }
  return blocos
}

function blocoInfografico(id: IdInfograficoAcademy): BlocoConteudoAcademy {
  return { tipo: 'infografico', dados: { id } }
}

const INFOGRAFICOS_SECAO: Array<{ flag: keyof DocSecaoConfigurador; id: IdInfograficoAcademy }> = [
  { flag: 'mostrarInfograficoOrganizacao', id: 'organizacao-conta' },
  { flag: 'mostrarInfograficoOrganizacaoWorkspaces', id: 'organizacao-workspaces' },
  { flag: 'mostrarInfograficoFornecedoresComex', id: 'fornecedores-comex' },
]

const INFOGRAFICOS_FLUXO: Array<{ flag: keyof DocFluxo; id: IdInfograficoAcademy }> = [
  { flag: 'mostrarInfograficoTiposUsuario', id: 'tipos-usuario' },
  { flag: 'mostrarInfograficoPapeisFornecedor', id: 'papeis-fornecedor' },
  { flag: 'mostrarInfograficoPermissoesUsuario', id: 'permissoes-usuario' },
]

function blocosInfograficosSecao(
  secao: DocSecaoConfigurador,
  idsExplicitos?: IdInfograficoAcademy[],
): BlocoConteudoAcademy[] {
  if (idsExplicitos?.length) return idsExplicitos.map(blocoInfografico)
  const blocos: BlocoConteudoAcademy[] = []
  for (const { flag, id } of INFOGRAFICOS_SECAO) {
    if (secao[flag]) blocos.push(blocoInfografico(id))
  }
  return blocos
}

function blocosInfograficosFluxo(fluxo: DocFluxo): BlocoConteudoAcademy[] {
  const blocos: BlocoConteudoAcademy[] = []
  for (const { flag, id } of INFOGRAFICOS_FLUXO) {
    if (fluxo[flag] && !(flag === 'mostrarInfograficoPermissoesUsuario' && fluxo.infograficoPermissoesUsuarioAposPasso != null)) {
      blocos.push(blocoInfografico(id))
    }
  }
  return blocos
}

function blocosDeFluxo(fluxo: DocFluxo, maxPassos?: number): BlocoConteudoAcademy[] {
  const blocos: BlocoConteudoAcademy[] = [
    { tipo: 'heading', dados: { text: fluxo.titulo, nivel: 2 } },
  ]
  for (const paragrafo of fluxo.paragrafos ?? []) {
    blocos.push({ tipo: 'texto', dados: { text: limparTextoManual(paragrafo) } })
  }
  if (fluxo.callout && !fluxo.calloutAposPassos) blocos.push(blocosDeCallout(fluxo.callout))
  blocos.push(...blocosInfograficosFluxo(fluxo))
  const passos = maxPassos != null ? fluxo.passosVisuais.slice(0, maxPassos) : fluxo.passosVisuais
  for (let i = 0; i < passos.length; i++) {
    blocos.push(...blocosDePassoConfigurador(passos[i], i))
  }
  if (fluxo.callout && fluxo.calloutAposPassos) blocos.push(blocosDeCallout(fluxo.callout))
  return blocos
}

export interface CuradoriaSecaoAcademy {
  fluxoIndices?: number[]
  maxPassosPorFluxo?: number
  incluirOrigemDados?: boolean
  /** Intro da seção (título + parágrafos + imagem). Default true. */
  incluirIntroSecao?: boolean
  /** Infográficos da seção quando a intro está omitida (ex.: aula 2 do capítulo). */
  infograficosSecao?: IdInfograficoAcademy[]
}

export function blocosDeSecaoConfiguradorAcademy(
  secao: DocSecaoConfigurador,
  curadoria: CuradoriaSecaoAcademy = {},
): BlocoConteudoAcademy[] {
  const blocos: BlocoConteudoAcademy[] = []
  const incluirIntro = curadoria.incluirIntroSecao !== false

  if (incluirIntro) {
    blocos.push({ tipo: 'heading', dados: { text: secao.titulo, nivel: 1 } })
    for (const paragrafo of secao.paragrafos) {
      blocos.push({ tipo: 'texto', dados: { text: limparTextoManual(paragrafo) } })
    }
    blocos.push(...blocosInfograficosSecao(secao))
    if (secao.imagem) {
      blocos.push({
        tipo: 'imagem',
        dados: { src: secao.imagem, alt: secao.titulo, caption: secao.titulo, largura: 'full' },
      })
    }
    if (secao.calloutAposParagrafo) blocos.push(blocosDeCallout(secao.calloutAposParagrafo.callout))
    if (secao.callout) blocos.push(blocosDeCallout(secao.callout))
  } else {
    blocos.push(...blocosInfograficosSecao(secao, curadoria.infograficosSecao))
  }

  if (curadoria.incluirOrigemDados && secao.origemDados) {
    blocos.push(...blocosDeOrigemDados(secao.origemDados))
  }
  const fluxos = secao.fluxos ?? []
  const indices = curadoria.fluxoIndices ?? fluxos.map((_, i) => i)
  for (const idx of indices) {
    const fluxo = fluxos[idx]
    if (fluxo) blocos.push(...blocosDeFluxo(fluxo, curadoria.maxPassosPorFluxo))
  }
  return blocos
}
