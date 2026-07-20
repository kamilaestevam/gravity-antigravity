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
import { achatarPassosVisuais } from './manual-configurador-conteudo'
import type { IdInfograficoAcademy } from './academy-infograficos'
import { normalizarTravessaoTextoGuia } from './manual-tipografia'

export type TipoBlocoAcademy =
  | 'heading' | 'texto' | 'imagem' | 'video' | 'citacao' | 'destaque'
  | 'definicao' | 'dois_colunas' | 'timeline' | 'destaque_escuro' | 'infografico' | 'origem_dados'
  | 'lista_legenda' | 'requisitos_cadastro' | 'passo_visual' | 'catalogo_historico'
  | 'gabi_conversas' | 'topicos_imagem_lateral' | 'cenarios_grade' | 'fluxo_manual' | 'galeria_comparacao'

export interface BlocoConteudoAcademy {
  tipo: TipoBlocoAcademy
  dados: Record<string, string | number>
}

export function limparTextoManual(texto: string): string {
  return normalizarTravessaoTextoGuia(
    texto
      // Mantém **negrito** e {{link:…}} para AcademyTextoRich (PlayerAula).
      .replace(/\{\{icone:[^}]+\}\}/g, '👁'),
  )
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

function blocosGaleriaComparacaoAposParagrafo(
  secao: { galeriaComparacaoAposParagrafo?: DocSecaoConfigurador['galeriaComparacaoAposParagrafo'] },
  indice: number,
): BlocoConteudoAcademy[] {
  return (secao.galeriaComparacaoAposParagrafo ?? [])
    .filter((g) => g.indice === indice)
    .map((galeria) => ({
      tipo: 'galeria_comparacao' as const,
      dados: { payload: JSON.stringify(galeria) },
    }))
}

function blocoImagemFigura(fig: DocFiguraAposParagrafo): BlocoConteudoAcademy {
  const dados: Record<string, string | number> = {
    src: fig.imagem,
    alt: fig.legenda ?? '',
    caption: fig.legenda ?? '',
    largura: 'full',
  }
  if (fig.larguraMaxima != null) dados.larguraMaxima = fig.larguraMaxima
  return { tipo: 'imagem', dados }
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

function tituloPassoAcademy(passo: DocPassoConfigurador): string {
  return passo.tituloCurto?.trim() || passo.titulo
}

/** Com H1 + H2 de fluxo (aula multi-fluxo), passos viram subtítulo no corpo — ex.: «Visão geral» sob «Nova cotação». */
function passoDeveSerSubtituloAcademy(passo: DocPassoConfigurador, nivelTituloFluxo: number): boolean {
  if (nivelTituloFluxo < 2) return false
  if (passo.rotuloPasso?.trim()) return false
  if (passo.estiloTituloWizard) return false
  if (passo.ocultarNoSumario && passo.ocultarTituloPasso) return false
  return true
}

function fluxoComPassosSubtituloAcademy(fluxo: DocFluxo, nivelTituloFluxo: number): DocFluxo {
  if (nivelTituloFluxo < 2 || !fluxo.passosVisuais?.length) return fluxo

  function augmentPasso(passo: DocPassoConfigurador): DocPassoConfigurador {
    const base = passoDeveSerSubtituloAcademy(passo, nivelTituloFluxo)
      ? { ...passo, rotuloPasso: tituloPassoAcademy(passo) }
      : passo
    if (!base.passosFilhos?.length) return base
    return {
      ...base,
      passosFilhos: base.passosFilhos.map(augmentPasso),
    }
  }

  return {
    ...fluxo,
    passosVisuais: fluxo.passosVisuais.map(augmentPasso),
  }
}

function fluxoTemRodapeAcademy(fluxo: DocFluxo): boolean {
  return Boolean(
    fluxo.mostrarCatalogoHistoricoCompleto
    || (fluxo.callout && fluxo.calloutAposPassos)
    || (fluxo.mostrarInfograficoIconesMenuSuperior && fluxo.infograficoIconesMenuSuperiorAposPassos)
    || (fluxo.mostrarInfograficoItensMenuUsuario && fluxo.infograficoItensMenuUsuarioAposPassos)
    || (fluxo.mostrarInfograficoHubTelas && fluxo.infograficoHubTelasAposPassos)
  )
}

/** Espelha o corpo renderizado por `introFluxo` em `ManualSecaoFluxo` (modo `intro`). */
function fluxoTemConteudoIntroAcademy(fluxo: DocFluxo): boolean {
  if ((fluxo.paragrafos?.length ?? 0) > 0) return true
  if (fluxo.callout && !fluxo.calloutAposPassos) return true
  if ((fluxo.figurasAposInfografico?.length ?? 0) > 0) return true
  if (fluxo.mostrarInfograficoPermissoesUsuario && fluxo.infograficoPermissoesUsuarioAposPasso == null) {
    return true
  }
  if (fluxo.mostrarInfograficoIconesMenuSuperior && !fluxo.infograficoIconesMenuSuperiorAposPassos) {
    return true
  }
  const flagsInfograficoIntro: Array<keyof DocFluxo> = [
    'mostrarInfograficoPapeisFornecedor',
    'mostrarInfograficoMenuLateral',
    'mostrarInfograficoTiposUsuario',
    'mostrarInfograficoSmartDocsInsights',
    'mostrarInfograficoPedidoInsights',
    'mostrarInfograficoBidFreteInsights',
    'mostrarInfograficoBidFretePainelCotacao',
    'mostrarInfograficoApiCockpitWebhookVsApi',
    'mostrarInfograficoApiCockpitConsumo',
  ]
  return flagsInfograficoIntro.some((flag) => Boolean(fluxo[flag]))
}

/** H2 de seção no sumário/corpo sem bloco `fluxo_manual` vazio (ex.: «Nova cotação» entre exemplos e formas). */
function passoSomenteTituloSecaoAcademy(passo: DocPassoConfigurador): boolean {
  if (passo.estiloTituloWizard !== true) return false
  if ((passo.paragrafos?.length ?? 0) > 0) return false
  if (passo.imagem) return false
  if ((passo.figurasAposParagrafo?.length ?? 0) > 0) return false
  if ((passo.galeriaComparacaoAposParagrafo?.length ?? 0) > 0) return false
  if ((passo.galeriaComparacao?.length ?? 0) > 0) return false
  if ((passo.galeriaTelas?.length ?? 0) > 0) return false
  if (passo.mostrarInfograficoBidFreteCotacaoAvulsaFormas) return false
  return true
}

/** Academy: paridade Pedido Gravity — H1 + tópico intro (H2) + subtópicos como H2 no menu. */
function blocosDeFluxoAcademySubtopicosComoTitulos(
  fluxo: DocFluxo,
  numeroSecaoFluxo: number,
  nivelTituloFluxo = 1,
): BlocoConteudoAcademy[] {
  const blocos: BlocoConteudoAcademy[] = []
  const fluxoRender = fluxoComPassosSubtituloAcademy(fluxo, nivelTituloFluxo)

  if (!fluxo.ocultarTituloFluxoAcademy) {
    blocos.push({ tipo: 'heading', dados: { text: tituloFluxoAcademy(fluxo), nivel: nivelTituloFluxo } })
  }
  const tituloIntro = fluxo.tituloTopicoAcademy?.trim()
  if (tituloIntro) {
    blocos.push({ tipo: 'heading', dados: { text: tituloIntro, nivel: 2 } })
  }
  if (fluxoTemConteudoIntroAcademy(fluxo)) {
    blocos.push({
      tipo: 'fluxo_manual',
      dados: {
        payload: JSON.stringify(fluxoRender),
        numeroSecaoFluxo,
        modo: 'intro',
      },
    })
  }

  for (const passo of achatarPassosVisuais(fluxoRender.passosVisuais ?? [])) {
    // H2 com `tituloCurto` ancora o menu; com `rotuloPasso`, o H2 fica só no sumário (corpo usa o rótulo).
    const passoSomenteInfograficoOculto = passo.ocultarNoSumario && passo.ocultarTituloPasso
    const tituloPasso = tituloPassoAcademy(passo)
    if (!passoSomenteInfograficoOculto) {
      blocos.push({
        tipo: 'heading',
        dados: {
          text: tituloPasso,
          nivel: 2,
          // Título wizard (ex.: «Análise», «Conferência») — H2 visível no corpo; subtítulo usa `rotuloPasso`.
          ...(passo.rotuloPasso?.trim() && !passo.estiloTituloWizard ? { ocultarNoCorpo: 1 } : {}),
          ...(passo.estiloTituloWizard && passo.etapaWizard != null ? { etapaWizard: passo.etapaWizard } : {}),
          ...(passo.ocultarNoSumario ? { ocultarNoSumario: 1 } : {}),
        },
      })
    }
    if (!passoSomenteTituloSecaoAcademy(passo)) {
      blocos.push({
        tipo: 'fluxo_manual',
        dados: {
          payload: JSON.stringify(fluxoRender),
          numeroSecaoFluxo,
          modo: 'passo',
          passoNum: passo.num,
        },
      })
    }
  }

  if (fluxoTemRodapeAcademy(fluxo)) {
    blocos.push({
      tipo: 'fluxo_manual',
      dados: {
        payload: JSON.stringify(fluxoRender),
        numeroSecaoFluxo,
        modo: 'rodape',
      },
    })
  }

  return blocos
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
  { flag: 'mostrarInfograficoHubTelas', id: 'hub-telas' },
  { flag: 'mostrarInfograficoPedidoVisaoGeral', id: 'pedido-visao-geral' },
  { flag: 'mostrarInfograficoSmartDocsOQueE', id: 'smart-docs-o-que-e' },
  { flag: 'mostrarInfograficoSmartDocsDocumentos', id: 'smart-docs-documentos' },
  { flag: 'mostrarInfograficoAdminTelas', id: 'admin-telas' },
]

const INFOGRAFICOS_FLUXO: Array<{
  flag: keyof DocFluxo
  id: IdInfograficoAcademy
  aposPassos?: boolean
  flagAposPassos?: keyof DocFluxo
}> = [
  { flag: 'mostrarInfograficoTiposUsuario', id: 'tipos-usuario' },
  { flag: 'mostrarInfograficoPapeisFornecedor', id: 'papeis-fornecedor' },
  { flag: 'mostrarInfograficoPermissoesUsuario', id: 'permissoes-usuario' },
  { flag: 'mostrarInfograficoApiCockpitWebhookVsApi', id: 'api-cockpit-webhook-vs-api' },
  { flag: 'mostrarInfograficoApiCockpitConsumo', id: 'api-cockpit-consumo' },
  {
    flag: 'mostrarInfograficoIconesMenuSuperior',
    id: 'icones-menu-superior',
    aposPassos: true,
    flagAposPassos: 'infograficoIconesMenuSuperiorAposPassos',
  },
  {
    flag: 'mostrarInfograficoItensMenuUsuario',
    id: 'itens-menu-usuario',
    aposPassos: true,
    flagAposPassos: 'infograficoItensMenuUsuarioAposPassos',
  },
  {
    flag: 'mostrarInfograficoFuncionalidadesLista',
    id: 'funcionalidades-listas',
  },
]

function blocosInfograficosSecao(
  secao: DocSecaoConfigurador,
  idsExplicitos?: IdInfograficoAcademy[],
): BlocoConteudoAcademy[] {
  if (idsExplicitos !== undefined) return idsExplicitos.map(blocoInfografico)
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

function blocosInfograficosFluxo(fluxo: DocFluxo, momento: 'antes_passos' | 'apos_passos'): BlocoConteudoAcademy[] {
  const blocos: BlocoConteudoAcademy[] = []
  for (const { flag, id, aposPassos: suportaAposPassos, flagAposPassos } of INFOGRAFICOS_FLUXO) {
    if (!fluxo[flag]) continue
    if (flag === 'mostrarInfograficoPermissoesUsuario' && fluxo.infograficoPermissoesUsuarioAposPasso != null) continue
    const depoisDosPassos = Boolean(suportaAposPassos && flagAposPassos && fluxo[flagAposPassos])
    if (momento === 'antes_passos' && depoisDosPassos) continue
    if (momento === 'apos_passos' && !depoisDosPassos) continue
    blocos.push(blocoInfografico(id))
  }
  return blocos
}

function tituloFluxoCuradoAcademy(fluxo: DocFluxo, indiceFluxo: number, curadoria: CuradoriaSecaoAcademy): string {
  return curadoria.titulosFluxoAcademy?.[indiceFluxo] ?? tituloFluxoAcademy(fluxo)
}

function blocosDeFluxo(
  fluxo: DocFluxo,
  maxPassos?: number,
  opcoes?: { omitirTitulo?: boolean; tituloFluxo?: string },
): BlocoConteudoAcademy[] {
  const blocos: BlocoConteudoAcademy[] = []
  if (!opcoes?.omitirTitulo) {
    blocos.push({
      tipo: 'heading',
      dados: { text: opcoes?.tituloFluxo ?? tituloFluxoAcademy(fluxo), nivel: 2 },
    })
  }
  for (let i = 0; i < (fluxo.paragrafos ?? []).length; i++) {
    blocos.push({ tipo: 'texto', dados: { text: limparTextoManual(fluxo.paragrafos![i]) } })
    for (const fig of figurasAposParagrafoSecao(fluxo, i)) {
      blocos.push(blocoImagemFigura(fig))
    }
    if (fluxo.calloutAposParagrafo?.indice === i) {
      blocos.push(blocosDeCallout(fluxo.calloutAposParagrafo.callout))
    }
  }
  if (fluxo.callout && !fluxo.calloutAposPassos) blocos.push(blocosDeCallout(fluxo.callout))
  blocos.push(...blocosInfograficosFluxo(fluxo, 'antes_passos'))
  const passosBrutos = fluxo.passosVisuais ?? []
  const passos = maxPassos != null ? passosBrutos.slice(0, maxPassos) : passosBrutos
  if (fluxo.modoCenarios && fluxo.cenariosLadoALado && passos.length > 0) {
    blocos.push({
      tipo: 'cenarios_grade',
      dados: {
        payload: JSON.stringify({
          passos,
          cenariosLadoALado: true,
          cenariosImagensAlinhadas: fluxo.cenariosImagensAlinhadas ?? false,
        }),
      },
    })
  } else {
    for (let i = 0; i < passos.length; i++) {
      const passo = fluxo.modoCenarios
        ? { ...passos[i], ocultarRotuloPasso: true }
        : passos[i]
      blocos.push(...blocosDePassoConfigurador(passo, i))
    }
  }
  if (fluxo.mostrarCatalogoHistoricoCompleto) {
    blocos.push({ tipo: 'catalogo_historico', dados: {} })
  }
  if (
    fluxo.mostrarInfograficoHubGabiInsightsExplicacoes
    && fluxo.infograficoHubGabiInsightsExplicacoesAposPassos
  ) {
    blocos.push(blocoInfografico('hub-gabi-insights-explicacoes'))
  }
  if (fluxo.callout && fluxo.calloutAposPassos) blocos.push(blocosDeCallout(fluxo.callout))
  blocos.push(...blocosInfograficosFluxo(fluxo, 'apos_passos'))
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
  /** Título H1 da intro na Academy (sem alterar o manual /docs). */
  tituloIntroAcademy?: string
  /** Títulos de fluxo na Academy por índice do fluxo no manual. */
  titulosFluxoAcademy?: Partial<Record<number, string>>
  /** Infográficos da seção quando a intro está omitida (ex.: aula 2 do capítulo). */
  infograficosSecao?: IdInfograficoAcademy[]
  /** Renderiza cada fluxo com `ManualSecaoFluxo` (infográficos, acordeões, galerias do manual). */
  fluxoComoManualCompleto?: boolean
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
    blocos.push({
      tipo: 'heading',
      dados: { text: curadoria.tituloIntroAcademy ?? secao.titulo, nivel: 1 },
    })
    if (secao.tituloTopico?.trim()) {
      blocos.push({ tipo: 'heading', dados: { text: secao.tituloTopico.trim(), nivel: 2 } })
    }
    for (let i = 0; i < secao.paragrafos.length; i++) {
      blocos.push({ tipo: 'texto', dados: { text: limparTextoManual(secao.paragrafos[i]) } })
      blocos.push(...blocosGaleriaComparacaoAposParagrafo(secao, i))
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
    if (secao.layoutTextoImagemLateral) {
      const imagemAposTitulo = blocoImagemSecao(secao, curadoria)
      if (imagemAposTitulo) blocos.push(imagemAposTitulo)
    }
    if (secao.topicosImagemLateral?.length) {
      blocos.push({
        tipo: 'heading',
        dados: { text: 'Tipos de menus', nivel: 2 },
      })
      blocos.push({
        tipo: 'topicos_imagem_lateral',
        dados: { payload: JSON.stringify(secao.topicosImagemLateral) },
      })
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
  } else if (curadoria.infograficosSecao !== undefined) {
    blocos.push(...blocosInfograficosSecao(secao, curadoria.infograficosSecao))
  }

  const fluxos = secao.fluxos ?? []
  const indices = curadoria.fluxoIndices ?? fluxos.map((_, i) => i)
  const nivelTituloFluxo = indices.length > 1 ? 2 : 1
  const tituloTopicoNorm = secao.tituloTopico?.trim().toLocaleLowerCase('pt-BR') ?? ''
  for (const idx of indices) {
    const fluxo = fluxos[idx]
    if (!fluxo) continue
    const tituloFluxoNorm = tituloFluxoAcademy(fluxo).trim().toLocaleLowerCase('pt-BR')
    const omitirTitulo = Boolean(tituloTopicoNorm && tituloFluxoNorm === tituloTopicoNorm)
    if (curadoria.fluxoComoManualCompleto) {
      if (fluxo.mostrarMapaSubtopicosPassos && fluxo.ancoraPassosPrefix) {
        blocos.push(...blocosDeFluxoAcademySubtopicosComoTitulos(fluxo, idx + 2, nivelTituloFluxo))
        continue
      }
      if (!omitirTitulo) {
        blocos.push({
          tipo: 'heading',
          dados: { text: tituloFluxoCuradoAcademy(fluxo, idx, curadoria), nivel: nivelTituloFluxo },
        })
      }
      blocos.push({
        tipo: 'fluxo_manual',
        dados: { payload: JSON.stringify(fluxo), numeroSecaoFluxo: idx + 2 },
      })
      continue
    }
    blocos.push(...blocosDeFluxo(fluxo, curadoria.maxPassosPorFluxo, {
      omitirTitulo,
      tituloFluxo: tituloFluxoCuradoAcademy(fluxo, idx, curadoria),
    }))
  }
  return blocos
}
