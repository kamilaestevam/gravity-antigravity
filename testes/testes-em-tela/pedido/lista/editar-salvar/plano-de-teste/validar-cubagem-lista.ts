/**
 * Suite Cubagem Total — chamada pelo runner principal editar-salvar (passos 249–259).
 * Plano: TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045 · ETAPA 46
 */
import type { Locator, Page } from 'playwright'

const LOCAL_LISTA = 'Lista'
const COLUNA_CUBAGEM = 'CUBAGEM TOTAL DO PEDIDO/ITEM'
const COL_KEY_CUBAGEM = 'cubagem_total_pedido'

const TITULO_TOOLTIP_PEDIDO = /cubagem total do pedido/i

const PILLS_PEDIDO = [
  /total do pedido.*soma/i,
  /bloqueado/i,
  /diverg/i,
] as const

const PILLS_ITEM = [
  /editável no item/i,
  /diverg/i,
] as const

const UNIDADE_CUBAGEM = 'M3'
const CUBAGEM_INCLUIR = '15,250'
const CUBAGEM_EDITAR = '20,500'

export type CubagemEmtCtx = {
  log: (msg: string) => void
  logAprovado: (local: string, sublocal: string, acao: string) => void
  falharTabela: (local: string, sublocal: string, acao: string) => void
  screenshot: (page: Page, nome: string) => Promise<void>
  scrollColunaParaVisivel: (page: Page, colKey: string) => Promise<void>
  esconderTooltipGlobal: (page: Page) => Promise<void>
  fecharPopoverSeAberto: (page: Page) => Promise<void>
  garantirListaPedidos: (page: Page) => Promise<void>
  localizarRowIdPorNumeroPedido: (page: Page, numero: string) => Promise<string | null>
  expandirPedido: (page: Page, rowId: string) => Promise<number>
  hubUrl: string
  lerTextoCampoPai: (page: Page, rowId: string, campo: string) => Promise<string>
  lerTextosCampoItens: (page: Page, pedidoRowId: string, campo: string) => Promise<string[]>
  abrirPopoverQuantidadeItem: (page: Page, pedidoRowId: string, indice: number, colKey: string) => Promise<boolean>
  abrirDropdownUnidadePopover: (page: Page) => Promise<void>
  listarUnidadesDropdownPopover: (page: Page) => Promise<string[]>
  listarRotulosDropdownPopover: (page: Page) => Promise<string[]>
  popoverExibeAvisoImpactoUnidade: (page: Page, padrao: RegExp) => Promise<boolean>
  salvarQuantidadeUnidadeItem: (
    page: Page,
    pedidoRowId: string,
    indice: number,
    colKey: string,
    valor: string,
    unidade: string,
    prefixoPrint: string,
  ) => Promise<'sucesso' | 'erro' | 'nenhuma'>
  printResultado: (prefixo: string) => string
}

function normalizarTextoCelula(texto: string): string {
  return texto.replace(/\s+/g, ' ').trim()
}

function celulaCubagemExibeValor(texto: string, valor: string): boolean {
  const t = normalizarTextoCelula(texto)
  return t.includes(valor) && /M³|M3/i.test(t)
}

function parseNumeroBr(texto: string): number {
  const limpo = texto.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
  const n = parseFloat(limpo)
  return Number.isFinite(n) ? n : 0
}

function quantidadesProximas(a: number, b: number, eps = 0.05): boolean {
  return Math.abs(a - b) <= eps
}

async function cursorNotAllowed(celula: Locator): Promise<boolean> {
  await celula.hover()
  return celula.evaluate(el => {
    const alvo = el.querySelector('.tg-trigger') ?? el
    return window.getComputedStyle(alvo).cursor === 'not-allowed'
  })
}

async function validarTooltip(
  ctx: CubagemEmtCtx,
  page: Page,
  celula: Locator,
  tituloRe: RegExp,
  pills: readonly RegExp[],
  nomePrint: string,
): Promise<boolean> {
  await ctx.esconderTooltipGlobal(page)
  await celula.hover()
  const visivel = await page.locator('.tg-card').first()
    .waitFor({ state: 'visible', timeout: 5000 })
    .then(() => true)
    .catch(() => false)
  if (!visivel) return false
  await ctx.screenshot(page, nomePrint)
  const titulo = ((await page.locator('.tg-titulo').first().textContent()) ?? '').trim()
  const descricao = (await page.locator('.tg-descricao').first().innerText()) ?? ''
  return tituloRe.test(titulo) && pills.every(re => re.test(descricao))
}

async function clicarCelulaNaoAbrePopover(
  ctx: CubagemEmtCtx,
  page: Page,
  celula: Locator,
  nomePrint: string,
): Promise<boolean> {
  await celula.click()
  await page.waitForTimeout(400)
  await ctx.screenshot(page, nomePrint)
  const abriu = await page.locator('.gtv-edit-popover').isVisible().catch(() => false)
    || await page.locator('.gtv-edit-unidade-qty').isVisible().catch(() => false)
  return !abriu
}

async function validarSelectCubagem(
  ctx: CubagemEmtCtx,
  page: Page,
  rowId: string,
  nomePrint: string,
): Promise<{ ok: boolean; unidades: string[]; rotulos: string[] }> {
  await ctx.fecharPopoverSeAberto(page)
  const abriu = await ctx.abrirPopoverQuantidadeItem(page, rowId, 0, COL_KEY_CUBAGEM)
  if (!abriu) return { ok: false, unidades: [], rotulos: [] }
  await ctx.abrirDropdownUnidadePopover(page)
  const unidades = await ctx.listarUnidadesDropdownPopover(page)
  const rotulos = await ctx.listarRotulosDropdownPopover(page)
  await ctx.screenshot(page, nomePrint)
  const temM3 = unidades.some(u => u.toUpperCase() === 'M3')
  const rotuloM3 = rotulos.some(r => /\bM3\b/i.test(r) && /[—–-]/u.test(r))
  const ok = temM3 && rotuloM3 && unidades.length >= 3
  return { ok, unidades, rotulos }
}

async function popoverSemAvisoImpacto(page: Page): Promise<boolean> {
  const aviso = page.locator('.gtv-edit-aviso-impacto')
  return !(await aviso.isVisible().catch(() => false))
}

function somaItensCubagem(textos: string[]): number {
  return textos.reduce((acc, t) => acc + parseNumeroBr(t), 0)
}

async function validarPersistenciaHub(
  ctx: CubagemEmtCtx,
  page: Page,
  numeroPedido: string,
  valor: string,
  nomePrint: string,
): Promise<boolean> {
  await ctx.fecharPopoverSeAberto(page)
  await page.goto(ctx.hubUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(1500)
  await ctx.garantirListaPedidos(page)

  const rowId = await ctx.localizarRowIdPorNumeroPedido(page, numeroPedido)
  if (!rowId) {
    await ctx.screenshot(page, nomePrint)
    return false
  }
  await ctx.expandirPedido(page, rowId)
  const textoItem = (await ctx.lerTextosCampoItens(page, rowId, COL_KEY_CUBAGEM))[0] ?? ''
  await ctx.screenshot(page, nomePrint)
  return celulaCubagemExibeValor(textoItem, valor)
}

export async function validarCubagemLista(
  ctx: CubagemEmtCtx,
  page: Page,
  rowIdInicial: string,
  numeroPedido: string,
  qtdItens: number,
): Promise<void> {
  if (qtdItens < 1) {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_CUBAGEM, 'Pré-condição — pedido sem itens visíveis para cubagem')
    return
  }

  const rowId = (await ctx.localizarRowIdPorNumeroPedido(page, numeroPedido)) ?? rowIdInicial
  await ctx.expandirPedido(page, rowId)

  ctx.log(`ℹ Coluna ${COLUNA_CUBAGEM}: passos 249–259 (regras CUB-01…11)`)
  await ctx.scrollColunaParaVisivel(page, COL_KEY_CUBAGEM)

  const celPai = page.locator(`[data-gtv-rowid="${rowId}"][data-gtv-campo="${COL_KEY_CUBAGEM}"]`)
  const celItem = page.locator(`.gtv-linha--filho[data-gtv-pai-id="${rowId}"]`).first()
    .locator(`[data-gtv-campo="${COL_KEY_CUBAGEM}"]`)

  if (await cursorNotAllowed(celPai)) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_CUBAGEM, '249 — Cursor not-allowed na célula do pedido')
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_CUBAGEM, '249 — Cursor do pedido deve ser not-allowed')
  }
  await ctx.screenshot(page, '249-cub-cursor-pedido.png')

  if (await validarTooltip(ctx, page, celPai, TITULO_TOOLTIP_PEDIDO, PILLS_PEDIDO, '250-cub-tooltip-pedido.png')) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_CUBAGEM, '250 — Tooltip pedido (calculado + bloqueado + divergência)')
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_CUBAGEM, '250 — Tooltip pedido incompleto')
  }

  if (await clicarCelulaNaoAbrePopover(ctx, page, celPai, '251-cub-pedido-nao-edita.png')) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_CUBAGEM, '251 — Pedido não abre popover')
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_CUBAGEM, '251 — Célula do pedido não deve editar')
  }

  if (await validarTooltip(ctx, page, celItem, /cubagem/i, PILLS_ITEM, '252-cub-tooltip-item.png')) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_CUBAGEM, '252 — Tooltip item (editável + divergência)')
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_CUBAGEM, '252 — Tooltip item incompleto')
  }

  const abriu253 = await ctx.abrirPopoverQuantidadeItem(page, rowId, 0, COL_KEY_CUBAGEM)
  await ctx.screenshot(page, '253-cub-item-abre-popover-resultado.png')
  if (abriu253) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_CUBAGEM, '253 — Item abre popover qty + unidade')
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_CUBAGEM, '253 — Clicar item deve abrir popover')
  }
  await ctx.fecharPopoverSeAberto(page)

  const sel254 = await validarSelectCubagem(ctx, page, rowId, '254-cub-select-unidades.png')
  if (sel254.ok) {
    ctx.logAprovado(
      LOCAL_LISTA,
      COLUNA_CUBAGEM,
      `254 — Select Cadastros com M3 (≥3 opções: ${sel254.unidades.join(', ')})`,
    )
  } else {
    ctx.falharTabela(
      LOCAL_LISTA,
      COLUNA_CUBAGEM,
      `254 — Dropdown deve conter M3 com rótulo SIGLA — Nome e ≥3 unidades (encontradas: ${sel254.unidades.join(', ') || 'nenhuma'})`,
    )
  }
  await ctx.fecharPopoverSeAberto(page)

  const abriu255 = await ctx.abrirPopoverQuantidadeItem(page, rowId, 0, COL_KEY_CUBAGEM)
  if (!abriu255) {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_CUBAGEM, '255 — Abrir popover para inspecionar aviso')
  } else {
    const semAviso = await popoverSemAvisoImpacto(page)
    await ctx.screenshot(page, '255-cub-sem-aviso-impacto.png')
    if (semAviso) {
      ctx.logAprovado(LOCAL_LISTA, COLUNA_CUBAGEM, '255 — Cubagem sem aviso amarelo de impacto cruzado')
    } else {
      ctx.falharTabela(LOCAL_LISTA, COLUNA_CUBAGEM, '255 — Popover cubagem não deve exibir aviso de impacto em outro campo')
    }
  }
  await ctx.fecharPopoverSeAberto(page)

  const textoPaiAntes256 = await ctx.lerTextoCampoPai(page, rowId, COL_KEY_CUBAGEM)
  const notif256 = await ctx.salvarQuantidadeUnidadeItem(
    page, rowId, 0, COL_KEY_CUBAGEM, CUBAGEM_INCLUIR, UNIDADE_CUBAGEM, '256-cub-item-incluir',
  )
  const textoItem256 = (await ctx.lerTextosCampoItens(page, rowId, COL_KEY_CUBAGEM))[0] ?? ''
  await ctx.screenshot(page, ctx.printResultado('256-cub-item-incluir'))
  if (notif256 === 'erro') {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_CUBAGEM, '256 — Salvar cubagem no item 1 — toast de erro')
  } else if (notif256 !== 'sucesso') {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_CUBAGEM, '256 — Salvar cubagem no item 1 — toast de sucesso não detectado')
  } else if (!celulaCubagemExibeValor(textoItem256, CUBAGEM_INCLUIR)) {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_CUBAGEM, `256 — Item 1 deve exibir ${CUBAGEM_INCLUIR} M³ (obtido: ${textoItem256})`)
  } else {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_CUBAGEM, `256 — Incluir ${CUBAGEM_INCLUIR} M³ no item 1`)
  }

  const textoPai256 = await ctx.lerTextoCampoPai(page, rowId, COL_KEY_CUBAGEM)
  const textosItens256 = await ctx.lerTextosCampoItens(page, rowId, COL_KEY_CUBAGEM)
  const soma256 = somaItensCubagem(textosItens256)
  const pedido256 = parseNumeroBr(textoPai256)
  await ctx.screenshot(page, '257-cub-pedido-soma-resultado.png')
  if (
    !/divergentes/i.test(textoPai256)
    && quantidadesProximas(pedido256, soma256)
    && textoPai256 !== textoPaiAntes256
  ) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_CUBAGEM, `257 — Pedido = soma itens (${textoPai256})`)
  } else {
    ctx.falharTabela(
      LOCAL_LISTA,
      COLUNA_CUBAGEM,
      `257 — Pedido deve refletir soma (pedido=${textoPai256}; soma itens=${soma256}; antes=${textoPaiAntes256})`,
    )
  }

  const notif258 = await ctx.salvarQuantidadeUnidadeItem(
    page, rowId, 0, COL_KEY_CUBAGEM, CUBAGEM_EDITAR, UNIDADE_CUBAGEM, '258-cub-item-editar',
  )
  const textoItem258 = (await ctx.lerTextosCampoItens(page, rowId, COL_KEY_CUBAGEM))[0] ?? ''
  await ctx.screenshot(page, ctx.printResultado('258-cub-item-editar'))
  if (notif258 === 'erro') {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_CUBAGEM, '258 — Editar cubagem no item 1 — toast de erro')
  } else if (notif258 !== 'sucesso') {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_CUBAGEM, '258 — Editar cubagem — toast de sucesso não detectado')
  } else if (!celulaCubagemExibeValor(textoItem258, CUBAGEM_EDITAR)) {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_CUBAGEM, `258 — Item 1 deve exibir ${CUBAGEM_EDITAR} M³ (obtido: ${textoItem258})`)
  } else {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_CUBAGEM, `258 — Editar para ${CUBAGEM_EDITAR} M³`)
  }

  if (await validarPersistenciaHub(ctx, page, numeroPedido, CUBAGEM_EDITAR, '259-cub-persistencia-apos-navegar-resultado.png')) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_CUBAGEM, `259 — Persistência após hub (${CUBAGEM_EDITAR} M³)`)
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_CUBAGEM, '259 — Cubagem não persistiu após sair/voltar')
  }
}
