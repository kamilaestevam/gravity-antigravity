/**
 * Suite Qtd. Transferida — chamada pelo runner principal editar-salvar (passos 83–134).
 * Plano: TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045 · ETAPAs 23–26
 */
import type { Locator, Page } from 'playwright'

const COLUNA_QTD_TRANSF = 'QTD. TRANSFERIDA DO PEDIDO/ITEM'
const COL_KEY_QTD_TRANSF = 'quantidade_transferida_total'
const COL_KEY_QTD_INICIAL = 'quantidade_total_pedido'
const COL_KEY_QTD_CANCELADA = 'quantidade_cancelada_total_pedido'
const COL_KEY_SALDO = 'saldo_itens_do_pedido'
const LOCAL_LISTA = 'Lista'
const TITULO_TOOLTIP_QTD_TRANSF = 'Qtd. Transferida do Pedido'

const PILLS_TOOLTIP_QTD_TRANSF = [
  /bloqueado para edição/i,
  /total.*qtd\. transferida.*soma dos itens/i,
  /soma apenas se todas unidades/i,
  /unidade comercializada diverg/i,
  /casas decimais/i,
] as const

const AVISO_QTD_TRANSF =
  /para alterar os itens.*clique em transferir no menu principal/i

type CenarioTransfer = 'split_novo_pedido' | 'split_pedido_existente' | 'reducao_simples'

export type QtdTransferidaEmtCtx = {
  log: (msg: string) => void
  logAprovado: (local: string, sublocal: string, acao: string) => void
  falharTabela: (local: string, sublocal: string, acao: string) => void
  screenshot: (page: Page, nome: string) => Promise<void>
  scrollColunaParaVisivel: (page: Page, colKey: string) => Promise<void>
  esconderTooltipGlobal: (page: Page) => Promise<void>
  garantirListaPedidos: (page: Page) => Promise<void>
  localizarRowIdPorNumeroPedido: (page: Page, numero: string) => Promise<string | null>
  expandirPedido: (page: Page, rowId: string) => Promise<number>
  hubUrl: string
}

async function cursorNotAllowed(celula: Locator): Promise<boolean> {
  await celula.hover()
  return celula.evaluate(el => {
    const alvo = el.querySelector('.tg-trigger') ?? el
    return window.getComputedStyle(alvo).cursor === 'not-allowed'
  })
}

async function validarTooltipQtdTransf(
  ctx: QtdTransferidaEmtCtx,
  page: Page,
  celula: Locator,
  nomePrint: string,
): Promise<{ ok: boolean; descricao: string }> {
  await ctx.esconderTooltipGlobal(page)
  await celula.hover()
  const visivel = await page.locator('.tg-card').first()
    .waitFor({ state: 'visible', timeout: 5000 })
    .then(() => true)
    .catch(() => false)
  if (!visivel) return { ok: false, descricao: '' }
  await ctx.screenshot(page, nomePrint)
  const titulo = ((await page.locator('.tg-titulo').first().textContent()) ?? '').trim()
  const descricao = (await page.locator('.tg-descricao').first().innerText()) ?? ''
  const tituloOk = titulo.toLowerCase().includes(TITULO_TOOLTIP_QTD_TRANSF.toLowerCase())
  const pillsOk = PILLS_TOOLTIP_QTD_TRANSF.every(re => re.test(descricao))
  const avisoOk = AVISO_QTD_TRANSF.test(descricao)
  return { ok: tituloOk && pillsOk && avisoOk, descricao }
}

async function clicarCelulaNaoAbrePopover(
  ctx: QtdTransferidaEmtCtx,
  page: Page,
  celula: Locator,
  nomePrint: string,
): Promise<boolean> {
  await celula.click()
  await page.waitForTimeout(400)
  await ctx.screenshot(page, nomePrint)
  const abriu = await page.locator('.gtv-edit-popover').isVisible().catch(() => false)
    || await page.locator('.gtv-edit-moeda-valor').isVisible().catch(() => false)
  return !abriu
}

async function selecionarItemPorIndice(page: Page, rowId: string, indice: number): Promise<void> {
  const cb = page.locator(`.gtv-linha--filho[data-gtv-pai-id="${rowId}"]`).nth(indice).locator('.gtv-checkbox--filho')
  await cb.waitFor({ timeout: 10000 })
  if (!(await cb.isChecked().catch(() => false))) await cb.click()
  await page.waitForTimeout(400)
}

async function abrirModalTransferir(ctx: QtdTransferidaEmtCtx, page: Page, nomePrint: string): Promise<boolean> {
  const btn = page.getByRole('button', { name: /transferir/i }).first()
  if (!(await btn.isVisible({ timeout: 8000 }).catch(() => false))) return false
  await btn.click()
  const abriu = await page.getByText(/transferir pedido/i).first()
    .waitFor({ timeout: 15000 }).then(() => true).catch(() => false)
  if (abriu) await ctx.screenshot(page, nomePrint)
  return abriu
}

async function selecionarCenarioModal(page: Page, cenario: CenarioTransfer): Promise<void> {
  const mapa: Record<CenarioTransfer, RegExp> = {
    split_novo_pedido: /split.*novo pedido|novo pedido derivado/i,
    split_pedido_existente: /split.*pedido existente|pedido existente/i,
    reducao_simples: /redução simples|reducao simples/i,
  }
  await page.getByText(mapa[cenario]).first().click()
  await page.waitForTimeout(400)
}

async function clicarProximoModal(page: Page): Promise<void> {
  await page.getByRole('button', { name: /próximo|proximo|revisar|next/i }).click()
  await page.waitForTimeout(600)
}

async function preencherQuantidadeItemModal(page: Page, qty: number): Promise<void> {
  const input = page.locator('.modal-transferir__input-qty').first()
  await input.waitFor({ timeout: 10000 })
  await input.fill(String(qty))
  await page.waitForTimeout(300)
}

async function botaoProximoDesabilitado(page: Page): Promise<boolean> {
  const btn = page.getByRole('button', { name: /próximo|proximo|revisar|next/i }).first()
  return btn.isDisabled().catch(() => true)
}

async function confirmarTransferencia(ctx: QtdTransferidaEmtCtx, page: Page, nomePrint: string): Promise<boolean> {
  while (await page.getByRole('button', { name: /próximo|proximo|revisar|next/i }).isVisible().catch(() => false)) {
    if (await botaoProximoDesabilitado(page)) return false
    await clicarProximoModal(page)
  }
  const btnConfirmar = page.getByRole('button', { name: /confirmar transferência|confirmar/i }).last()
  await btnConfirmar.waitFor({ timeout: 15000 })
  await btnConfirmar.click()
  const sucesso = await page.getByText(/transferência concluída|transferencia concluida|sucesso/i).first()
    .waitFor({ timeout: 30000 }).then(() => true).catch(() => false)
  await ctx.screenshot(page, nomePrint)
  await page.keyboard.press('Escape').catch(() => {})
  await page.waitForTimeout(800)
  return sucesso
}

async function lerTextoCampoItem(page: Page, rowId: string, indice: number, colKey: string): Promise<string> {
  return page.evaluate(({ paiId, idx, key }) => {
    const filhos = Array.from(document.querySelectorAll(`.gtv-linha--filho[data-gtv-pai-id="${paiId}"]`))
    const filho = filhos[idx]
    if (!filho) return ''
    const cel = filho.querySelector(`[data-gtv-campo="${key}"]`) as HTMLElement | null
    return (cel?.textContent ?? '').replace(/\s+/g, ' ').trim()
  }, { paiId: rowId, idx: indice, key: colKey })
}

function parseNumeroBr(texto: string): number {
  const limpo = texto.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
  const n = parseFloat(limpo)
  return Number.isFinite(n) ? n : 0
}

async function coletarCamposGrade(page: Page, rowId: string): Promise<Record<string, string>> {
  return page.evaluate((paiId) => {
    const mapa: Record<string, string> = {}
    const pai = document.querySelector(`[data-gtv-rowid="${paiId}"]`)?.closest('.gtv-linha--pai')
    if (pai) {
      pai.querySelectorAll('[data-gtv-campo]').forEach(el => {
        const k = el.getAttribute('data-gtv-campo')
        if (k) mapa[`pai:${k}`] = (el.textContent ?? '').replace(/\s+/g, ' ').trim()
      })
    }
    document.querySelectorAll(`.gtv-linha--filho[data-gtv-pai-id="${paiId}"]`).forEach((filho, idx) => {
      filho.querySelectorAll('[data-gtv-campo]').forEach(el => {
        const k = el.getAttribute('data-gtv-campo')
        if (k) mapa[`item${idx}:${k}`] = (el.textContent ?? '').replace(/\s+/g, ' ').trim()
      })
    })
    return mapa
  }, rowId)
}

async function validarPersistenciaHub(
  ctx: QtdTransferidaEmtCtx,
  page: Page,
  numerosPedidos: string[],
  nomePrint: string,
): Promise<boolean> {
  await page.goto(ctx.hubUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(1200)
  await ctx.garantirListaPedidos(page)
  for (const numero of numerosPedidos) {
    const rowId = await ctx.localizarRowIdPorNumeroPedido(page, numero)
    if (!rowId) return false
    await ctx.expandirPedido(page, rowId)
  }
  await ctx.screenshot(page, nomePrint)
  return true
}

async function validarBasico(ctx: QtdTransferidaEmtCtx, page: Page, rowId: string): Promise<void> {
  await ctx.scrollColunaParaVisivel(page, COL_KEY_QTD_TRANSF)
  const celPai = page.locator(`[data-gtv-rowid="${rowId}"][data-gtv-campo="${COL_KEY_QTD_TRANSF}"]`)
  const celItem = page.locator(`.gtv-linha--filho[data-gtv-pai-id="${rowId}"]`).first()
    .locator(`[data-gtv-campo="${COL_KEY_QTD_TRANSF}"]`)

  if (await cursorNotAllowed(celPai)) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, '83 — Cursor not-allowed na célula do pedido')
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_QTD_TRANSF, '83 — Cursor do pedido deve ser not-allowed')
  }
  await ctx.screenshot(page, '83-qtd-transf-cursor-pedido.png')

  const tipPai = await validarTooltipQtdTransf(ctx, page, celPai, '84-qtd-transf-tooltip-pedido.png')
  if (tipPai.ok) ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, '84 — Tooltip pedido (pills + aviso Transferir)')
  else ctx.falharTabela(LOCAL_LISTA, COLUNA_QTD_TRANSF, '84 — Tooltip pedido incompleto')

  if (await clicarCelulaNaoAbrePopover(ctx, page, celPai, '85-qtd-transf-pedido-nao-edita.png')) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, '85 — Pedido não abre popover')
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_QTD_TRANSF, '85 — Célula do pedido não deve editar')
  }

  if (await cursorNotAllowed(celItem)) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, '86 — Cursor not-allowed na célula do item')
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_QTD_TRANSF, '86 — Cursor do item deve ser not-allowed')
  }

  const tipItem = await validarTooltipQtdTransf(ctx, page, celItem, '86-qtd-transf-item-tooltip.png')
  if (tipItem.ok && tipItem.descricao.trim() === tipPai.descricao.trim()) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, '86 — Tooltip item idêntico ao pedido')
  } else if (!tipItem.ok) {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_QTD_TRANSF, '86 — Tooltip item incompleto')
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_QTD_TRANSF, '86 — Tooltip item difere do pedido')
  }

  if (await clicarCelulaNaoAbrePopover(ctx, page, celItem, '87-qtd-transf-item-nao-edita.png')) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, '87 — Item não abre popover')
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_QTD_TRANSF, '87 — Célula do item não deve editar')
  }
}

async function validarTransferNovoPedido(
  ctx: QtdTransferidaEmtCtx,
  page: Page,
  rowId: string,
  numeroOrigem: string,
  indiceItem: number,
): Promise<void> {
  const qtdInicialAntes = parseNumeroBr(await lerTextoCampoItem(page, rowId, indiceItem, COL_KEY_QTD_INICIAL))
  const transfAntes = parseNumeroBr(await lerTextoCampoItem(page, rowId, indiceItem, COL_KEY_QTD_TRANSF))
  const gradeAntes = await coletarCamposGrade(page, rowId)

  await selecionarItemPorIndice(page, rowId, indiceItem)
  ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, `88 — Item ${indiceItem + 1} selecionado`)

  if (!(await abrirModalTransferir(ctx, page, '89-transf-modal-aberto.png'))) {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_QTD_TRANSF, '89 — Modal Transferir não abriu')
    return
  }

  await selecionarCenarioModal(page, 'split_novo_pedido')
  await clicarProximoModal(page)
  ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, '90 — Split Novo Pedido → passo quantidade')

  const qtyTransferir = Math.max(1, Math.floor(qtdInicialAntes * 0.25) || 1)
  await preencherQuantidadeItemModal(page, qtyTransferir)
  await ctx.screenshot(page, '91-transf-novo-saldo.png')
  ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, `91 — Quantidade ${qtyTransferir} (saldo após ≥ 1)`)

  await preencherQuantidadeItemModal(page, qtdInicialAntes + 100)
  if (await botaoProximoDesabilitado(page)) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, '92 — Saldo negativo bloqueia avanço')
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_QTD_TRANSF, '92 — Deve bloquear quantidade acima do saldo')
  }
  await preencherQuantidadeItemModal(page, qtyTransferir)

  const numeroNovo = `EMT-NOVO-${Date.now().toString().slice(-6)}`
  while (!(await page.locator('#destino-numero-novo, input[id*="destino-numero"]').first().isVisible().catch(() => false))) {
    if (await botaoProximoDesabilitado(page)) break
    await clicarProximoModal(page)
  }
  const inputNovo = page.locator('#destino-numero-novo').or(page.locator('input[placeholder*="pedido"]')).first()
  if (await inputNovo.isVisible().catch(() => false)) {
    await inputNovo.fill(numeroNovo)
    ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, `93 — Nº novo pedido ${numeroNovo}`)
  }

  while (await page.locator('.modal-transferir__destino-qty-readonly').count() === 0) {
    if (await botaoProximoDesabilitado(page)) break
    await clicarProximoModal(page)
  }
  await ctx.screenshot(page, '94-transf-novo-qtd-transferir.png')

  if (!(await confirmarTransferencia(ctx, page, '97-transf-novo-sucesso.png'))) {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_QTD_TRANSF, '97 — Confirmar transferência (novo pedido)')
    return
  }

  await ctx.garantirListaPedidos(page)
  const rowNovo = await ctx.localizarRowIdPorNumeroPedido(page, numeroNovo)
  if (rowNovo) {
    await ctx.expandirPedido(page, rowNovo)
    await ctx.screenshot(page, '99-transf-novo-grade-completa.png')
    ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, '98–99 — Novo pedido localizado e grade expandida')
  }

  const rowOrigem = await ctx.localizarRowIdPorNumeroPedido(page, numeroOrigem)
  if (rowOrigem) {
    await ctx.expandirPedido(page, rowOrigem)
    const qtdInicialDepois = parseNumeroBr(await lerTextoCampoItem(page, rowOrigem, indiceItem, COL_KEY_QTD_INICIAL))
    const transfDepois = parseNumeroBr(await lerTextoCampoItem(page, rowOrigem, indiceItem, COL_KEY_QTD_TRANSF))
    if (Math.abs(qtdInicialDepois - qtdInicialAntes) < 0.01) {
      ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, '103 — Origem Qtd. Inicial inalterada')
    } else {
      ctx.falharTabela(LOCAL_LISTA, COLUNA_QTD_TRANSF, `103 — Qtd. Inicial alterou (${qtdInicialAntes} → ${qtdInicialDepois})`)
    }
    if (transfDepois > transfAntes) {
      ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, `104 — Origem Qtd. Transferida (${transfAntes} → ${transfDepois})`)
    } else {
      ctx.falharTabela(LOCAL_LISTA, COLUNA_QTD_TRANSF, '104 — Qtd. Transferida origem deve aumentar')
    }
    ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, `99 — Grade SSOT: ${Object.keys(gradeAntes).length} campos mapeados`)
  }

  if (await validarPersistenciaHub(ctx, page, rowNovo ? [numeroOrigem, numeroNovo] : [numeroOrigem], '106-transf-novo-persistencia.png')) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, '106 — Persistência hub → lista (novo pedido)')
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_QTD_TRANSF, '106 — Persistência falhou')
  }
}

async function validarTransferExistente(
  ctx: QtdTransferidaEmtCtx,
  page: Page,
  rowId: string,
  numeroOrigem: string,
  indiceItem: number,
): Promise<void> {
  const transfAntes = parseNumeroBr(await lerTextoCampoItem(page, rowId, indiceItem, COL_KEY_QTD_TRANSF))
  const qtdInicialAntes = parseNumeroBr(await lerTextoCampoItem(page, rowId, indiceItem, COL_KEY_QTD_INICIAL))

  await selecionarItemPorIndice(page, rowId, indiceItem)
  if (!(await abrirModalTransferir(ctx, page, '108-transf-existente-modal.png'))) {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_QTD_TRANSF, '108 — Modal não abriu')
    return
  }

  await selecionarCenarioModal(page, 'split_pedido_existente')
  await clicarProximoModal(page)

  const qty = Math.max(1, Math.floor(qtdInicialAntes * 0.2) || 1)
  await preencherQuantidadeItemModal(page, qty)
  ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, `109 — Quantidade ${qty}`)

  await preencherQuantidadeItemModal(page, qtdInicialAntes + 50)
  if (await botaoProximoDesabilitado(page)) ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, '110 — Saldo negativo bloqueado')
  await preencherQuantidadeItemModal(page, qty)

  while (!(await page.locator('.modal-transferir__destino-linha select').first().isVisible().catch(() => false))) {
    if (await botaoProximoDesabilitado(page)) break
    await clicarProximoModal(page)
  }
  const selectDestino = page.locator('.modal-transferir__destino-linha select').first()
  if (await selectDestino.isVisible().catch(() => false)) {
    const opts = await selectDestino.locator('option').allTextContents()
    const destino = opts.find(o => o.trim() && !/selecione/i.test(o))
    if (destino) {
      await selectDestino.selectOption({ label: destino })
      ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, `111 — Destino ${destino.trim()}`)
    }
  }

  if (!(await confirmarTransferencia(ctx, page, '114-transf-existente-sucesso.png'))) {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_QTD_TRANSF, '114 — Confirmar split existente')
    return
  }

  await ctx.garantirListaPedidos(page)
  const rowOrigem = await ctx.localizarRowIdPorNumeroPedido(page, numeroOrigem)
  if (rowOrigem) {
    await ctx.expandirPedido(page, rowOrigem)
    const transfDepois = parseNumeroBr(await lerTextoCampoItem(page, rowOrigem, indiceItem, COL_KEY_QTD_TRANSF))
    if (transfDepois > transfAntes) {
      ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, `118–121 — Transferida origem (${transfAntes} → ${transfDepois})`)
    }
    await ctx.screenshot(page, '115-transf-existente-grade.png')
  }

  if (await validarPersistenciaHub(ctx, page, [numeroOrigem], '124-transf-existente-persistencia.png')) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, '124 — Persistência pedido existente')
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_QTD_TRANSF, '124 — Persistência falhou')
  }
}

async function validarReducaoSimples(
  ctx: QtdTransferidaEmtCtx,
  page: Page,
  rowId: string,
  numeroOrigem: string,
  indiceItem: number,
): Promise<void> {
  const qtdInicial = parseNumeroBr(await lerTextoCampoItem(page, rowId, indiceItem, COL_KEY_QTD_INICIAL))
  const transfAntes = parseNumeroBr(await lerTextoCampoItem(page, rowId, indiceItem, COL_KEY_QTD_TRANSF))
  const cancelAntes = parseNumeroBr(await lerTextoCampoItem(page, rowId, indiceItem, COL_KEY_QTD_CANCELADA))
  const saldoAntes = parseNumeroBr(await lerTextoCampoItem(page, rowId, indiceItem, COL_KEY_SALDO))

  await selecionarItemPorIndice(page, rowId, indiceItem)
  if (!(await abrirModalTransferir(ctx, page, '126-transf-reducao-modal.png'))) {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_QTD_TRANSF, '126 — Modal não abriu')
    return
  }

  await selecionarCenarioModal(page, 'reducao_simples')
  await clicarProximoModal(page)
  ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, '126 — Redução Simples')

  const qtyReduzir = Math.max(1, Math.floor(saldoAntes * 0.15) || 1)
  await preencherQuantidadeItemModal(page, qtyReduzir)
  ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, `127 — Reduzir ${qtyReduzir}`)

  await preencherQuantidadeItemModal(page, saldoAntes + 100)
  if (await botaoProximoDesabilitado(page)) ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, '128 — Saldo negativo bloqueado')
  await preencherQuantidadeItemModal(page, qtyReduzir)

  if (!(await confirmarTransferencia(ctx, page, '129-transf-reducao-sucesso.png'))) {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_QTD_TRANSF, '129 — Confirmar redução simples')
    return
  }

  await ctx.garantirListaPedidos(page)
  const rowOrigem = await ctx.localizarRowIdPorNumeroPedido(page, numeroOrigem)
  if (!rowOrigem) {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_QTD_TRANSF, '130–133 — Pedido origem não reencontrado')
    return
  }
  await ctx.expandirPedido(page, rowOrigem)

  const qtdInicialDepois = parseNumeroBr(await lerTextoCampoItem(page, rowOrigem, indiceItem, COL_KEY_QTD_INICIAL))
  const transfDepois = parseNumeroBr(await lerTextoCampoItem(page, rowOrigem, indiceItem, COL_KEY_QTD_TRANSF))
  const cancelDepois = parseNumeroBr(await lerTextoCampoItem(page, rowOrigem, indiceItem, COL_KEY_QTD_CANCELADA))
  const saldoDepois = parseNumeroBr(await lerTextoCampoItem(page, rowOrigem, indiceItem, COL_KEY_SALDO))

  if (Math.abs(qtdInicialDepois - qtdInicial) < 0.01) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, '130 — Qtd. Inicial inalterada')
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_QTD_TRANSF, '130 — Qtd. Inicial mudou')
  }
  if (Math.abs(transfDepois - transfAntes) < 0.01) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, '131 — Qtd. Transferida inalterada')
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_QTD_TRANSF, '131 — Transferida não deve mudar')
  }
  if (cancelDepois > cancelAntes) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, `132 — Qtd. Cancelada (${cancelAntes} → ${cancelDepois})`)
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_QTD_TRANSF, '132 — Qtd. Cancelada deve aumentar')
  }
  const saldoEsperado = Math.max(0, qtdInicial - transfDepois - cancelDepois)
  if (Math.abs(saldoDepois - saldoEsperado) < 0.05) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, `133 — Saldo correto (${saldoDepois})`)
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_QTD_TRANSF, `133 — Saldo esperado ${saldoEsperado}`)
  }

  if (await validarPersistenciaHub(ctx, page, [numeroOrigem], '134-transf-reducao-persistencia.png')) {
    ctx.logAprovado(LOCAL_LISTA, COLUNA_QTD_TRANSF, '134 — Persistência redução simples')
  } else {
    ctx.falharTabela(LOCAL_LISTA, COLUNA_QTD_TRANSF, '134 — Persistência falhou')
  }
}

/** ETAPAs 23–26 — passos 83–134 do plano editar-salvar. */
export async function validarQtdTransferidaLista(
  page: Page,
  ctx: QtdTransferidaEmtCtx,
  rowId: string,
  numeroPedido: string,
  qtdItens: number,
): Promise<void> {
  ctx.log(`ℹ ${COLUNA_QTD_TRANSF}: passos 83–134 (4 suites Transferir)`)
  await validarBasico(ctx, page, rowId)
  const rowAtual0 = await ctx.localizarRowIdPorNumeroPedido(page, numeroPedido) ?? rowId
  await validarTransferNovoPedido(ctx, page, rowAtual0, numeroPedido, 0)
  if (qtdItens >= 2) {
    const rowAtual1 = await ctx.localizarRowIdPorNumeroPedido(page, numeroPedido)
    if (rowAtual1) await validarTransferExistente(ctx, page, rowAtual1, numeroPedido, 1)
  } else {
    ctx.log(`⚠ Suite pedido existente pulada — menos de 2 itens`)
  }
  const rowAtual2 = await ctx.localizarRowIdPorNumeroPedido(page, numeroPedido)
  if (rowAtual2) {
    await validarReducaoSimples(ctx, page, rowAtual2, numeroPedido, qtdItens >= 2 ? 1 : 0)
  }
}
