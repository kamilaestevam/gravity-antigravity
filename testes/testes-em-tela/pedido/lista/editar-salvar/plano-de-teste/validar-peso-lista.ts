/**
 * Suite Peso Líquido + Peso Bruto — chamada pelo runner principal editar-salvar (passos 227–248).
 * Plano: TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045 · ETAPAs 44–45
 */
import type { Locator, Page } from 'playwright'

const LOCAL_LISTA = 'Lista'

const COLUNA_PESO_LIQ = 'PESO LÍQUIDO TOTAL DO PEDIDO/ITEM'
const COL_KEY_PESO_LIQ = 'peso_liquido_total_pedido'

const COLUNA_PESO_BRU = 'PESO BRUTO TOTAL DO PEDIDO/ITEM'
const COL_KEY_PESO_BRU = 'peso_bruto_total_pedido'

const TITULO_TOOLTIP_PESO_LIQ_PEDIDO = /peso líquido total do pedido/i
const TITULO_TOOLTIP_PESO_BRU_PEDIDO = /peso bruto total do pedido/i

const PILLS_PEDIDO_PESO = [
  /total do pedido.*soma/i,
  /bloqueado/i,
  /diverg/i,
] as const

const PILLS_ITEM_PESO = [
  /editável no item/i,
  /diverg/i,
] as const

const AVISO_IMPACTO_PESO_LIQ = /alteração da unidade irá alterar também.*peso bruto total/i
const AVISO_IMPACTO_PESO_BRU = /alteração da unidade irá alterar também.*peso líquido total/i

const UNIDADES_OBRIGATORIAS = ['G', 'KG', 'TON'] as const
const UNIDADE_PESO = 'KG'

const PESO_LIQ_INCLUIR = '10,000'
const PESO_LIQ_EDITAR = '12,500'
const PESO_BRU_INCLUIR = '20,000'
const PESO_BRU_EDITAR = '25,500'

export type PesoEmtCtx = {
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

function celulaPesoExibeValor(texto: string, valor: string, unidade: string): boolean {
  const t = normalizarTextoCelula(texto)
  return t.includes(valor) && new RegExp(`\\b${unidade}\\b`, 'i').test(t)
}

function parseNumeroBr(texto: string): number {
  const limpo = texto.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
  const n = parseFloat(limpo)
  return Number.isFinite(n) ? n : 0
}

async function cursorNotAllowed(celula: Locator): Promise<boolean> {
  await celula.hover()
  return celula.evaluate(el => {
    const alvo = el.querySelector('.tg-trigger') ?? el
    return window.getComputedStyle(alvo).cursor === 'not-allowed'
  })
}

async function validarTooltipPeso(
  ctx: PesoEmtCtx,
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
  const tituloOk = tituloRe.test(titulo)
  const pillsOk = pills.every(re => re.test(descricao))
  return tituloOk && pillsOk
}

async function clicarCelulaNaoAbrePopover(
  ctx: PesoEmtCtx,
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

async function validarSelectUnidadesPeso(
  ctx: PesoEmtCtx,
  page: Page,
  rowId: string,
  colKey: string,
  nomePrint: string,
): Promise<{ ok: boolean; unidades: string[] }> {
  await ctx.fecharPopoverSeAberto(page)
  const abriu = await ctx.abrirPopoverQuantidadeItem(page, rowId, 0, colKey)
  if (!abriu) return { ok: false, unidades: [] }
  await ctx.abrirDropdownUnidadePopover(page)
  const unidades = await ctx.listarUnidadesDropdownPopover(page)
  await ctx.screenshot(page, nomePrint)
  const ok = UNIDADES_OBRIGATORIAS.every(sigla => unidades.includes(sigla))
  return { ok, unidades }
}

async function validarPersistenciaHub(
  ctx: PesoEmtCtx,
  page: Page,
  numeroPedido: string,
  colKey: string,
  valor: string,
  unidade: string,
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
  const textoItem = (await ctx.lerTextosCampoItens(page, rowId, colKey))[0] ?? ''
  await ctx.screenshot(page, nomePrint)
  return celulaPesoExibeValor(textoItem, valor, unidade)
}

async function validarPesoLiquido(
  ctx: PesoEmtCtx,
  page: Page,
  rowId: string,
  numeroPedido: string,
): Promise<void> {
  ctx.log(`ℹ Coluna ${COLUNA_PESO_LIQ}: passos 227–237 (regras PLQ-01…11)`)
  await ctx.scrollColunaParaVisivel(page, COL_KEY_PESO_LIQ)

  const celPai = page.locator(`[data-gtv-rowid="${rowId}"][data-gtv-campo="${COL_KEY_PESO_LIQ}"]`)
  const celItem = page.locator(`.gtv-linha--filho[data-gtv-pai-id="${rowId}"]`).first()
    .locator(`[data-gtv-campo="${COL_KEY_PESO_LIQ}"]`)

  if (await cursorNotAllowed(celPai)) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_PESO_LIQ, '227 — Cursor not-allowed na célula do pedido')
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_PESO_LIQ, '227 — Cursor do pedido deve ser not-allowed')
  }
  await ctx.screenshot(page, '227-plq-cursor-pedido.png')

  const tipPai = await validarTooltipPeso(
    ctx, page, celPai, TITULO_TOOLTIP_PESO_LIQ_PEDIDO, PILLS_PEDIDO_PESO, '228-plq-tooltip-pedido.png',
  )
  if (tipPai) ctx.logAprovado(LOCAL_LISTA, COLUNA_PESO_LIQ, '228 — Tooltip pedido (calculado + bloqueado + divergência)')
  else ctx.falharTabela(LOCAL_LISTA, COLUNA_PESO_LIQ, '228 — Tooltip pedido incompleto')

  if (await clicarCelulaNaoAbrePopover(ctx, page, celPai, '229-plq-pedido-nao-edita.png')) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_PESO_LIQ, '229 — Pedido não abre popover')
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_PESO_LIQ, '229 — Célula do pedido não deve editar')
  }

  const tipItem = await validarTooltipPeso(
    ctx, page, celItem, /peso líquido/i, PILLS_ITEM_PESO, '230-plq-tooltip-item.png',
  )
  if (tipItem) ctx.logAprovado(LOCAL_LISTA, COLUNA_PESO_LIQ, '230 — Tooltip item (editável + divergência)')
  else ctx.falharTabela(LOCAL_LISTA, COLUNA_PESO_LIQ, '230 — Tooltip item incompleto')

  const abriu231 = await ctx.abrirPopoverQuantidadeItem(page, rowId, 0, COL_KEY_PESO_LIQ)
  await ctx.screenshot(page, '231-plq-item-abre-popover-resultado.png')
  if (abriu231) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_PESO_LIQ, '231 — Item abre popover qty + unidade')
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_PESO_LIQ, '231 — Clicar item deve abrir popover')
  }
  await ctx.fecharPopoverSeAberto(page)

  const sel232 = await validarSelectUnidadesPeso(ctx, page, rowId, COL_KEY_PESO_LIQ, '232-plq-select-unidades.png')
  if (sel232.ok) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_PESO_LIQ, `232 — Select lista G, KG e TON (${sel232.unidades.join(', ')})`)
  } else {
    ctx.falharTabela(
      LOCAL_LISTA,
      COLUNA_PESO_LIQ,
      `232 — Dropdown deve conter G, KG e TON (encontradas: ${sel232.unidades.join(', ') || 'nenhuma'})`,
    )
  }
  await ctx.fecharPopoverSeAberto(page)

  const abriu233 = await ctx.abrirPopoverQuantidadeItem(page, rowId, 0, COL_KEY_PESO_LIQ)
  if (!abriu233) {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_PESO_LIQ, '233 — Abrir popover para aviso de impacto')
  } else {
    const avisoOk = await ctx.popoverExibeAvisoImpactoUnidade(page, AVISO_IMPACTO_PESO_LIQ)
    await ctx.screenshot(page, '233-plq-aviso-impacto-bruto.png')
    if (avisoOk) {
      ctx.logAprovado(LOCAL_LISTA, COLUNA_PESO_LIQ, '233 — Aviso: alteração de unidade impacta Peso Bruto Total')
    } else {
      ctx.falharTabela(LOCAL_LISTA, COLUNA_PESO_LIQ, '233 — Popover deve exibir aviso de impacto no Peso Bruto')
    }
  }
  await ctx.fecharPopoverSeAberto(page)

  const textoPaiAntes234 = await ctx.lerTextoCampoPai(page, rowId, COL_KEY_PESO_LIQ)
  const notif234 = await ctx.salvarQuantidadeUnidadeItem(
    page, rowId, 0, COL_KEY_PESO_LIQ, PESO_LIQ_INCLUIR, UNIDADE_PESO, '234-plq-item-incluir',
  )
  const textoItem234 = (await ctx.lerTextosCampoItens(page, rowId, COL_KEY_PESO_LIQ))[0] ?? ''
  await ctx.screenshot(page, ctx.printResultado('234-plq-item-incluir'))
  if (notif234 === 'erro') {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_PESO_LIQ, '234 — Salvar peso líquido no item 1 — toast de erro')
  } else if (!celulaPesoExibeValor(textoItem234, PESO_LIQ_INCLUIR, UNIDADE_PESO)) {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_PESO_LIQ, `234 — Item 1 deve exibir ${PESO_LIQ_INCLUIR} ${UNIDADE_PESO} (obtido: ${textoItem234})`)
  } else {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_PESO_LIQ, `234 — Incluir ${PESO_LIQ_INCLUIR} ${UNIDADE_PESO} no item 1`)
  }

  const textoPai234 = await ctx.lerTextoCampoPai(page, rowId, COL_KEY_PESO_LIQ)
  const textosItens234 = await ctx.lerTextosCampoItens(page, rowId, COL_KEY_PESO_LIQ)
  const somaItens234 = textosItens234.reduce((acc, t) => acc + parseNumeroBr(t), 0)
  const pedidoNum234 = parseNumeroBr(textoPai234)
  const pedidoMudou = textoPai234 !== textoPaiAntes234
  await ctx.screenshot(page, '235-plq-pedido-soma-resultado.png')
  if (pedidoMudou && (pedidoNum234 > 0 || somaItens234 > 0)) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_PESO_LIQ, `235 — Pedido atualizou soma (pedido=${textoPai234})`)
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_PESO_LIQ, `235 — Pedido deve refletir soma dos itens (antes=${textoPaiAntes234}; depois=${textoPai234})`)
  }

  const notif236 = await ctx.salvarQuantidadeUnidadeItem(
    page, rowId, 0, COL_KEY_PESO_LIQ, PESO_LIQ_EDITAR, UNIDADE_PESO, '236-plq-item-editar',
  )
  const textoItem236 = (await ctx.lerTextosCampoItens(page, rowId, COL_KEY_PESO_LIQ))[0] ?? ''
  await ctx.screenshot(page, ctx.printResultado('236-plq-item-editar'))
  if (notif236 === 'erro') {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_PESO_LIQ, '236 — Editar peso líquido no item 1 — toast de erro')
  } else if (!celulaPesoExibeValor(textoItem236, PESO_LIQ_EDITAR, UNIDADE_PESO)) {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_PESO_LIQ, `236 — Item 1 deve exibir ${PESO_LIQ_EDITAR} ${UNIDADE_PESO} (obtido: ${textoItem236})`)
  } else {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_PESO_LIQ, `236 — Editar para ${PESO_LIQ_EDITAR} ${UNIDADE_PESO}`)
  }

  const persistiu237 = await validarPersistenciaHub(
    ctx, page, numeroPedido, COL_KEY_PESO_LIQ, PESO_LIQ_EDITAR, UNIDADE_PESO, '237-plq-persistencia-apos-navegar-resultado.png',
  )
  if (persistiu237) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_PESO_LIQ, `237 — Persistência após hub (${PESO_LIQ_EDITAR} ${UNIDADE_PESO})`)
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_PESO_LIQ, '237 — Peso líquido não persistiu após sair/voltar')
  }

  const rowIdPos237 = await ctx.localizarRowIdPorNumeroPedido(page, numeroPedido)
  if (rowIdPos237) await ctx.expandirPedido(page, rowIdPos237)
}

async function validarPesoBruto(
  ctx: PesoEmtCtx,
  page: Page,
  rowId: string,
  numeroPedido: string,
): Promise<void> {
  ctx.log(`ℹ Coluna ${COLUNA_PESO_BRU}: passos 238–248 (regras PLB-01…11)`)
  await ctx.scrollColunaParaVisivel(page, COL_KEY_PESO_BRU)

  const celPai = page.locator(`[data-gtv-rowid="${rowId}"][data-gtv-campo="${COL_KEY_PESO_BRU}"]`)
  const celItem = page.locator(`.gtv-linha--filho[data-gtv-pai-id="${rowId}"]`).first()
    .locator(`[data-gtv-campo="${COL_KEY_PESO_BRU}"]`)

  if (await cursorNotAllowed(celPai)) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_PESO_BRU, '238 — Cursor not-allowed na célula do pedido')
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_PESO_BRU, '238 — Cursor do pedido deve ser not-allowed')
  }
  await ctx.screenshot(page, '238-plb-cursor-pedido.png')

  const tipPai = await validarTooltipPeso(
    ctx, page, celPai, TITULO_TOOLTIP_PESO_BRU_PEDIDO, PILLS_PEDIDO_PESO, '239-plb-tooltip-pedido.png',
  )
  if (tipPai) ctx.logAprovado(LOCAL_LISTA, COLUNA_PESO_BRU, '239 — Tooltip pedido (calculado + bloqueado + divergência)')
  else ctx.falharTabela(LOCAL_LISTA, COLUNA_PESO_BRU, '239 — Tooltip pedido incompleto')

  if (await clicarCelulaNaoAbrePopover(ctx, page, celPai, '240-plb-pedido-nao-edita.png')) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_PESO_BRU, '240 — Pedido não abre popover')
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_PESO_BRU, '240 — Célula do pedido não deve editar')
  }

  const tipItem = await validarTooltipPeso(
    ctx, page, celItem, /peso bruto/i, PILLS_ITEM_PESO, '241-plb-tooltip-item.png',
  )
  if (tipItem) ctx.logAprovado(LOCAL_LISTA, COLUNA_PESO_BRU, '241 — Tooltip item (editável + divergência)')
  else ctx.falharTabela(LOCAL_LISTA, COLUNA_PESO_BRU, '241 — Tooltip item incompleto')

  const abriu242 = await ctx.abrirPopoverQuantidadeItem(page, rowId, 0, COL_KEY_PESO_BRU)
  await ctx.screenshot(page, '242-plb-item-abre-popover-resultado.png')
  if (abriu242) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_PESO_BRU, '242 — Item abre popover qty + unidade')
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_PESO_BRU, '242 — Clicar item deve abrir popover')
  }
  await ctx.fecharPopoverSeAberto(page)

  const sel243 = await validarSelectUnidadesPeso(ctx, page, rowId, COL_KEY_PESO_BRU, '243-plb-select-unidades.png')
  if (sel243.ok) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_PESO_BRU, `243 — Select lista G, KG e TON (${sel243.unidades.join(', ')})`)
  } else {
    ctx.falharTabela(
      LOCAL_LISTA,
      COLUNA_PESO_BRU,
      `243 — Dropdown deve conter G, KG e TON (encontradas: ${sel243.unidades.join(', ') || 'nenhuma'})`,
    )
  }
  await ctx.fecharPopoverSeAberto(page)

  const abriu244 = await ctx.abrirPopoverQuantidadeItem(page, rowId, 0, COL_KEY_PESO_BRU)
  if (!abriu244) {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_PESO_BRU, '244 — Abrir popover para aviso de impacto')
  } else {
    const avisoOk = await ctx.popoverExibeAvisoImpactoUnidade(page, AVISO_IMPACTO_PESO_BRU)
    await ctx.screenshot(page, '244-plb-aviso-impacto-liquido.png')
    if (avisoOk) {
      ctx.logAprovado(LOCAL_LISTA, COLUNA_PESO_BRU, '244 — Aviso: alteração de unidade impacta Peso Líquido Total')
    } else {
      ctx.falharTabela(LOCAL_LISTA, COLUNA_PESO_BRU, '244 — Popover deve exibir aviso de impacto no Peso Líquido')
    }
  }
  await ctx.fecharPopoverSeAberto(page)

  const textoPaiAntes245 = await ctx.lerTextoCampoPai(page, rowId, COL_KEY_PESO_BRU)
  const notif245 = await ctx.salvarQuantidadeUnidadeItem(
    page, rowId, 0, COL_KEY_PESO_BRU, PESO_BRU_INCLUIR, UNIDADE_PESO, '245-plb-item-incluir',
  )
  const textoItem245 = (await ctx.lerTextosCampoItens(page, rowId, COL_KEY_PESO_BRU))[0] ?? ''
  await ctx.screenshot(page, ctx.printResultado('245-plb-item-incluir'))
  if (notif245 === 'erro') {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_PESO_BRU, '245 — Salvar peso bruto no item 1 — toast de erro')
  } else if (!celulaPesoExibeValor(textoItem245, PESO_BRU_INCLUIR, UNIDADE_PESO)) {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_PESO_BRU, `245 — Item 1 deve exibir ${PESO_BRU_INCLUIR} ${UNIDADE_PESO} (obtido: ${textoItem245})`)
  } else {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_PESO_BRU, `245 — Incluir ${PESO_BRU_INCLUIR} ${UNIDADE_PESO} no item 1`)
  }

  const textoPai245 = await ctx.lerTextoCampoPai(page, rowId, COL_KEY_PESO_BRU)
  const pedidoMudou245 = textoPai245 !== textoPaiAntes245
  await ctx.screenshot(page, '246-plb-pedido-soma-resultado.png')
  if (pedidoMudou245 && parseNumeroBr(textoPai245) > 0) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_PESO_BRU, `246 — Pedido atualizou soma (pedido=${textoPai245})`)
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_PESO_BRU, `246 — Pedido deve refletir soma dos itens (antes=${textoPaiAntes245}; depois=${textoPai245})`)
  }

  const notif247 = await ctx.salvarQuantidadeUnidadeItem(
    page, rowId, 0, COL_KEY_PESO_BRU, PESO_BRU_EDITAR, UNIDADE_PESO, '247-plb-item-editar',
  )
  const textoItem247 = (await ctx.lerTextosCampoItens(page, rowId, COL_KEY_PESO_BRU))[0] ?? ''
  await ctx.screenshot(page, ctx.printResultado('247-plb-item-editar'))
  if (notif247 === 'erro') {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_PESO_BRU, '247 — Editar peso bruto no item 1 — toast de erro')
  } else if (!celulaPesoExibeValor(textoItem247, PESO_BRU_EDITAR, UNIDADE_PESO)) {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_PESO_BRU, `247 — Item 1 deve exibir ${PESO_BRU_EDITAR} ${UNIDADE_PESO} (obtido: ${textoItem247})`)
  } else {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_PESO_BRU, `247 — Editar para ${PESO_BRU_EDITAR} ${UNIDADE_PESO}`)
  }

  const persistiu248 = await validarPersistenciaHub(
    ctx, page, numeroPedido, COL_KEY_PESO_BRU, PESO_BRU_EDITAR, UNIDADE_PESO, '248-plb-persistencia-apos-navegar-resultado.png',
  )
  if (persistiu248) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_PESO_BRU, `248 — Persistência após hub (${PESO_BRU_EDITAR} ${UNIDADE_PESO})`)
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_PESO_BRU, '248 — Peso bruto não persistiu após sair/voltar')
  }
}

export async function validarPesoLista(
  ctx: PesoEmtCtx,
  page: Page,
  rowId: string,
  numeroPedido: string,
  qtdItens: number,
): Promise<void> {
  if (qtdItens < 1) {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_PESO_LIQ, 'Pré-condição — pedido sem itens visíveis para peso')
    return
  }
  await validarPesoLiquido(ctx, page, rowId, numeroPedido)

  const rowIdAtual = await ctx.localizarRowIdPorNumeroPedido(page, numeroPedido)
  const rowIdBruto = rowIdAtual ?? rowId
  if (rowIdAtual) await ctx.expandirPedido(page, rowIdAtual)

  await validarPesoBruto(ctx, page, rowIdBruto, numeroPedido)
}
