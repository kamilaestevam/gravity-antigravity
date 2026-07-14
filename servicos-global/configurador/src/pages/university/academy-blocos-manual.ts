/**
 * Geradores de blocos Academy a partir do SSOT dos manuais.
 */

import type { DocPassoVisual as DocPassoLogin, DocSecao as DocSecaoLogin } from './manual-login-conteudo'
import type {
  ConfiguradorManualSlug,
  DocFiguraAposParagrafo,
  DocFluxo,
  DocPassoVisual as DocPassoConfigurador,
  DocSecao as DocSecaoConfigurador,
} from './manual-configurador-conteudo'
import type { IdInfograficoAcademy } from './academy-infograficos'

export type TipoBlocoAcademy =
  | 'heading' | 'texto' | 'imagem' | 'video' | 'citacao' | 'destaque'
  | 'definicao' | 'dois_colunas' | 'timeline' | 'destaque_escuro' | 'infografico' | 'origem_dados'
  | 'lista_legenda' | 'requisitos_cadastro' | 'passo_visual' | 'catalogo_historico'
  | 'gabi_conversas'

export interface BlocoConteudoAcademy {
  tipo: TipoBlocoAcademy
  dados: Record<string, string | number>
}

export function limparTextoManual(texto: string): string {
  return texto
    // Mantém **negrito** e {{link:…}} para AcademyTextoRich (PlayerAula).
    .replace(/\{\{icone:[^}]+\}\}/g, '👁')
}

const RE_LINK_MARKUP = /^\{\{link:([^|]+)\|([^}]+)\}\}$/

function splitLabelDescListaAcademy(item: string): {
  label: string
  descricao: string
  linkHref?: string
  linkRotulo?: string
} {
  const cleaned = item.replace(/^[-–]\s*/, '').trim()
  const re = /^((?:[^{]|(?:\{\{link:[^}]+\}\}))+)(?::|\s+[—–])\s*(.*)$/s
  const match = cleaned.match(re)
  const parsed = match
    ? { label: match[1].trim(), descricao: match[2].trim() }
    : { label: cleaned, descricao: '' }
  const link = RE_LINK_MARKUP.exec(parsed.label)
  if (!link) return parsed
  return {
    ...parsed,
    linkHref: link[1],
    linkRotulo: link[2],
  }
}

function figurasAposParagrafoSecao(
  secao: { figurasAposParagrafo?: DocFiguraAposParagrafo[] },
  indice: number,
): DocFiguraAposParagrafo[] {
  return (secao.figurasAposParagrafo ?? []).filter((f) => f.indice === indice)
}

function blocoImagemFigura(fig: DocFiguraAposParagrafo): BlocoConteudoAcademy {
  return {
    tipo: 'imagem',
    dados: {
      src: fig.imagem,
      alt: fig.legenda ?? '',
      caption: fig.legenda ?? '',
      largura: 'full',
    },
  }
}

function tituloCallout(tipo: string): string {
  const map: Record<string, string> = {
    dica: 'Dica',
    aviso: 'Aviso importante',
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

function blocosDePassoLogin(passo: DocPassoLogin, indicePasso: number): BlocoConteudoAcademy[] {
  return [{
    tipo: 'passo_visual',
    dados: {
      payload: JSON.stringify(passo),
      primeiro: indicePasso === 0 ? 1 : 0,
    },
  }]
}

function blocosListaLegenda(secao: {
  lista?: string[]
  listaEmLinha?: boolean
  listaColunas?: number
}): BlocoConteudoAcademy[] {
  if (!secao.lista?.length) return []
  const itens = secao.lista.map((item) => splitLabelDescListaAcademy(item))
  const colunas = secao.listaColunas ?? (secao.listaEmLinha ? Math.min(secao.lista.length, 4) : 0)
  return [{
    tipo: 'lista_legenda',
    dados: {
      emLinha: secao.listaEmLinha ? 1 : 0,
      colunas,
      itens: JSON.stringify(itens),
    },
  }]
}

export function blocosDeSecaoLogin(
  secao: DocSecaoLogin,
  opcoes?: { nivelTitulo?: number },
): BlocoConteudoAcademy[] {
  const nivelTitulo = opcoes?.nivelTitulo ?? 1
  const blocos: BlocoConteudoAcademy[] = [
    { tipo: 'heading', dados: { text: secao.titulo, nivel: nivelTitulo } },
  ]

  if (secao.layoutTextoImagemLateral && secao.imagem) {
    for (const paragrafo of secao.paragrafos) {
      blocos.push({ tipo: 'texto', dados: { text: limparTextoManual(paragrafo) } })
    }
    blocos.push({
      tipo: 'imagem',
      dados: { src: secao.imagem, alt: secao.titulo, caption: secao.titulo, largura: 'full' },
    })
    blocos.push(...blocosListaLegenda(secao))
  } else {
    for (const paragrafo of secao.paragrafos) {
      blocos.push({ tipo: 'texto', dados: { text: limparTextoManual(paragrafo) } })
    }
    if (secao.imagem) {
      blocos.push({
        tipo: 'imagem',
        dados: { src: secao.imagem, alt: secao.titulo, caption: secao.titulo, largura: 'full' },
      })
    }
    blocos.push(...blocosListaLegenda(secao))
  }

  if (secao.callout) blocos.push(blocosDeCallout(secao.callout))
  secao.passosVisuais?.forEach((passo, i) => {
    blocos.push(...blocosDePassoLogin(passo, i))
  })
  return blocos
}

function blocosDePassoConfigurador(passo: DocPassoConfigurador, indice: number): BlocoConteudoAcademy[] {
  return [{
    tipo: 'passo_visual',
    dados: {
      payload: JSON.stringify(passo),
      primeiro: indice === 0 ? 1 : 0,
    },
  }]
}

function tituloFluxoAcademy(fluxo: DocFluxo): string {
  if (fluxo.tituloSumario) return fluxo.tituloSumario
  return fluxo.titulo.replace(/^Fluxo\s+\d+:\s*/i, '').trim()
}

function blocoOrigemDados(manualCapitulo: ConfiguradorManualSlug): BlocoConteudoAcademy {
  return { tipo: 'origem_dados', dados: { manualCapitulo } }
}

function blocoInfografico(id: IdInfograficoAcademy): BlocoConteudoAcademy {
  return { tipo: 'infografico', dados: { id } }
}

const INFOGRAFICOS_SECAO: Array<{
  flag: keyof DocSecaoConfigurador
  id: IdInfograficoAcademy
  /** Não repetir no fim quando já embutido após parágrafo (`infograficoApiCockpitIntegracaoAposParagrafo`). */
  skipSeAposParagrafo?: boolean
}> = [
  { flag: 'mostrarInfograficoOrganizacao', id: 'organizacao-conta' },
  { flag: 'mostrarInfograficoOrganizacaoWorkspaces', id: 'organizacao-workspaces' },
  { flag: 'mostrarInfograficoFornecedoresComex', id: 'fornecedores-comex' },
  { flag: 'mostrarInfograficoApiCockpitIntegracao', id: 'api-cockpit-integracao', skipSeAposParagrafo: true },
]

const INFOGRAFICOS_FLUXO: Array<{ flag: keyof DocFluxo; id: IdInfograficoAcademy }> = [
  { flag: 'mostrarInfograficoTiposUsuario', id: 'tipos-usuario' },
  { flag: 'mostrarInfograficoPapeisFornecedor', id: 'papeis-fornecedor' },
  { flag: 'mostrarInfograficoPermissoesUsuario', id: 'permissoes-usuario' },
  { flag: 'mostrarInfograficoApiCockpitWebhookVsApi', id: 'api-cockpit-webhook-vs-api' },
  { flag: 'mostrarInfograficoApiCockpitConsumo', id: 'api-cockpit-consumo' },
]

function blocosInfograficosSecao(
  secao: DocSecaoConfigurador,
  idsExplicitos?: IdInfograficoAcademy[],
): BlocoConteudoAcademy[] {
  if (idsExplicitos?.length) return idsExplicitos.map(blocoInfografico)
  const blocos: BlocoConteudoAcademy[] = []
  for (const { flag, id, skipSeAposParagrafo } of INFOGRAFICOS_SECAO) {
    if (!secao[flag]) continue
    if (
      skipSeAposParagrafo
      && secao.infograficoApiCockpitIntegracaoAposParagrafo != null
    ) continue
    blocos.push(blocoInfografico(id))
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

function blocosDeFluxo(
  fluxo: DocFluxo,
  maxPassos?: number,
  opcoes?: { omitirTitulo?: boolean },
): BlocoConteudoAcademy[] {
  const blocos: BlocoConteudoAcademy[] = []
  if (!opcoes?.omitirTitulo) {
    blocos.push({ tipo: 'heading', dados: { text: tituloFluxoAcademy(fluxo), nivel: 2 } })
  }
  for (let i = 0; i < (fluxo.paragrafos ?? []).length; i++) {
    blocos.push({ tipo: 'texto', dados: { text: limparTextoManual(fluxo.paragrafos![i]) } })
    if (fluxo.calloutAposParagrafo?.indice === i) {
      blocos.push(blocosDeCallout(fluxo.calloutAposParagrafo.callout))
    }
  }
  if (fluxo.callout && !fluxo.calloutAposPassos) blocos.push(blocosDeCallout(fluxo.callout))
  blocos.push(...blocosInfograficosFluxo(fluxo))
  const passosBrutos = fluxo.passosVisuais ?? []
  const passos = maxPassos != null ? passosBrutos.slice(0, maxPassos) : passosBrutos
  for (let i = 0; i < passos.length; i++) {
    blocos.push(...blocosDePassoConfigurador(passos[i], i))
  }
  if (fluxo.mostrarCatalogoHistoricoCompleto) {
    blocos.push({ tipo: 'catalogo_historico', dados: {} })
  }
  if (fluxo.callout && fluxo.calloutAposPassos) blocos.push(blocosDeCallout(fluxo.callout))
  return blocos
}

export interface CuradoriaSecaoAcademy {
  fluxoIndices?: number[]
  maxPassosPorFluxo?: number
  incluirOrigemDados?: boolean
  manualCapitulo?: ConfiguradorManualSlug
  /** Intro da seção (título + parágrafos + imagem). Default true. */
  incluirIntroSecao?: boolean
  /** Screenshot da seção no topo da intro. Default true. */
  incluirImagemSecao?: boolean
  /** Infográficos da seção quando a intro está omitida (ex.: aula 2 do capítulo). */
  infograficosSecao?: IdInfograficoAcademy[]
}

function blocoImagemSecao(
  secao: DocSecaoConfigurador,
  curadoria: CuradoriaSecaoAcademy,
): BlocoConteudoAcademy | null {
  if (curadoria.incluirImagemSecao === false || !secao.imagem) return null
  return {
    tipo: 'imagem',
    dados: { src: secao.imagem, alt: secao.titulo, caption: secao.titulo, largura: 'full' },
  }
}

export function blocosDeSecaoConfiguradorAcademy(
  secao: DocSecaoConfigurador,
  curadoria: CuradoriaSecaoAcademy = {},
): BlocoConteudoAcademy[] {
  const blocos: BlocoConteudoAcademy[] = []
  const incluirIntro = curadoria.incluirIntroSecao !== false

  if (incluirIntro) {
    blocos.push({ tipo: 'heading', dados: { text: secao.titulo, nivel: 1 } })
    if (secao.tituloTopico?.trim()) {
      blocos.push({ tipo: 'heading', dados: { text: secao.tituloTopico.trim(), nivel: 2 } })
    }
    if (secao.layoutTextoImagemLateral) {
      const imagemAposTitulo = blocoImagemSecao(secao, curadoria)
      if (imagemAposTitulo) blocos.push(imagemAposTitulo)
    }
    for (let i = 0; i < secao.paragrafos.length; i++) {
      blocos.push({ tipo: 'texto', dados: { text: limparTextoManual(secao.paragrafos[i]) } })
      for (const fig of figurasAposParagrafoSecao(secao, i)) {
        blocos.push(blocoImagemFigura(fig))
      }
      if (
        secao.mostrarInfograficoApiCockpitIntegracao
        && secao.infograficoApiCockpitIntegracaoAposParagrafo === i
      ) {
        blocos.push(blocoInfografico('api-cockpit-integracao'))
      }
    }
    blocos.push(...blocosInfograficosSecao(secao))
    if (curadoria.incluirOrigemDados && secao.origemDados && curadoria.manualCapitulo) {
      blocos.push(blocoOrigemDados(curadoria.manualCapitulo))
    }
    blocos.push(...blocosListaLegenda(secao))
    if (secao.calloutAposParagrafo) blocos.push(blocosDeCallout(secao.calloutAposParagrafo.callout))
    if (secao.callout) blocos.push(blocosDeCallout(secao.callout))
    if (!secao.layoutTextoImagemLateral) {
      const imagemFinal = blocoImagemSecao(secao, curadoria)
      if (imagemFinal) blocos.push(imagemFinal)
    }
  } else {
    blocos.push(...blocosInfograficosSecao(secao, curadoria.infograficosSecao))
  }

  const fluxos = secao.fluxos ?? []
  const indices = curadoria.fluxoIndices ?? fluxos.map((_, i) => i)
  const tituloTopicoNorm = secao.tituloTopico?.trim().toLocaleLowerCase('pt-BR') ?? ''
  for (const idx of indices) {
    const fluxo = fluxos[idx]
    if (!fluxo) continue
    const tituloFluxoNorm = tituloFluxoAcademy(fluxo).trim().toLocaleLowerCase('pt-BR')
    const omitirTitulo = Boolean(tituloTopicoNorm && tituloFluxoNorm === tituloTopicoNorm)
    blocos.push(...blocosDeFluxo(fluxo, curadoria.maxPassosPorFluxo, { omitirTitulo }))
  }
  return blocos
}
