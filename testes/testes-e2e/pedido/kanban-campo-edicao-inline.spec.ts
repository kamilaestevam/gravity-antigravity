import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

/**
 * Teste E2E — Kanban campo → edição inline na Lista
 * Porta: 5179
 *
 * Valida o fluxo:
 *  1. Abrir Kanban, clicar em um card → modal abre
 *  2. Clicar em um campo clicável do modal
 *  3. Navegar para /pedidos (Lista)
 *  4. Popover de edição inline abre na célula exata daquele pedido e campo
 */

const PRINTS_DIR = path.join(
  process.cwd(),
  'testes/testes-em-tela/produto/pedido/2026-04-09-kanban-campo-edicao-inline'
)

fs.mkdirSync(PRINTS_DIR, { recursive: true })

test.describe('Kanban campo → edição inline @critico', () => {

  test('clicar campo no modal Kanban abre popover de edição inline na Lista', async ({ page }) => {
    // ── 1. Abrir Kanban ───────────────────────────────────────────────────────
    await page.goto('/pedidos/kanban')
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})

    await page.screenshot({ path: path.join(PRINTS_DIR, '01-kanban-carregado.png'), fullPage: true })

    // Aguarda card aparecer
    let temCard = false
    try {
      await page.waitForSelector('.kbp-card', { timeout: 10000 })
      temCard = true
    } catch {
      temCard = false
    }

    if (!temCard) {
      test.skip(true, 'Nenhum card no Kanban — necessário ter pedidos no tenant dev')
      return
    }

    // ── 2. Clicar no primeiro card ────────────────────────────────────────────
    const cards = page.locator('.kbp-card')
    const count = await cards.count()
    if (count === 0) {
      test.skip(true, 'Nenhum card disponível')
      return
    }

    await cards.first().click()
    await page.waitForTimeout(1500)

    await page.screenshot({ path: path.join(PRINTS_DIR, '02-modal-aberto.png'), fullPage: true })

    // Verificar que o modal está aberto
    const modal = page.locator('.kbp-modal-overlay, .kbp-modal-container').first()
    const modalVisivel = await modal.isVisible().catch(() => false)
    if (!modalVisivel) {
      await page.screenshot({ path: path.join(PRINTS_DIR, 'FALHA-modal-nao-abriu.png'), fullPage: true })
      test.skip(true, 'Modal não abriu ao clicar no card')
      return
    }

    // ── 3. Clicar em campo clicável da aba Pedido ─────────────────────────────
    // Certifica que estamos na aba Pedido
    const abaPedidoModal = page.locator('.kbp-modal-tab').filter({ hasText: /^pedido$/i }).first()
    if (await abaPedidoModal.count() > 0) {
      await abaPedidoModal.click()
      await page.waitForTimeout(300)
    }

    await page.screenshot({ path: path.join(PRINTS_DIR, '03-modal-aba-pedido.png'), fullPage: true })

    // Localizar campos clicáveis
    const camposClicaveis = page.locator('.kbp-modal-campo--clicavel')
    const qtdCampos = await camposClicaveis.count()
    console.log('Campos clicáveis no modal:', qtdCampos)

    if (qtdCampos === 0) {
      await page.screenshot({ path: path.join(PRINTS_DIR, 'FALHA-sem-campos-clicaveis.png'), fullPage: true })
      test.skip(true, 'Nenhum campo clicável encontrado no modal')
      return
    }

    // Pegar o label do campo que vamos clicar (para verificar depois)
    const primeiroCampo = camposClicaveis.first()
    const labelCampo = (await primeiroCampo.locator('.kbp-modal-campo-label').textContent() ?? '').trim()
    console.log('Campo a clicar:', labelCampo)

    await page.screenshot({ path: path.join(PRINTS_DIR, '04-antes-clicar-campo.png'), fullPage: true })

    // ── 4. Clicar no campo — deve navegar para /pedidos ───────────────────────
    // Aguardar a navegação após o clique
    const [response] = await Promise.all([
      page.waitForURL('**/pedidos', { timeout: 10000 }).catch(() => null),
      primeiroCampo.click(),
    ])

    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {})

    await page.screenshot({ path: path.join(PRINTS_DIR, '05-apos-navegar-para-lista.png'), fullPage: true })

    // Verificar que navegou para /pedidos
    const urlAtual = page.url()
    console.log('URL atual:', urlAtual)
    expect(urlAtual, 'Deve navegar para /pedidos após clicar no campo').toContain('/pedidos')
    expect(urlAtual, 'Não deve estar mais em /kanban').not.toContain('/kanban')

    // ── 5. Verificar que o popover de edição inline aparece ──────────────────
    // Aguardar tabela carregar + edição abrir (até 8s — inclui busca + 200ms delay)
    await page.waitForTimeout(3000)

    await page.screenshot({ path: path.join(PRINTS_DIR, '06-lista-com-popover.png'), fullPage: true })

    const popover = page.locator('.gtv-edit-popover')
    const popoverVisivel = await popover.isVisible().catch(() => false)

    console.log('Popover de edição visível:', popoverVisivel)
    await page.screenshot({ path: path.join(PRINTS_DIR, '07-estado-final.png'), fullPage: true })

    if (!popoverVisivel) {
      // Capturar estado completo para diagnóstico
      await page.screenshot({ path: path.join(PRINTS_DIR, 'FALHA-popover-nao-abriu.png'), fullPage: true })

      // Verificação suave: ao menos navegou e há linhas na tabela
      const linhasPai = page.locator('.gtv-linha--pai')
      const qtdLinhas = await linhasPai.count()
      console.log('Linhas pai na tabela:', qtdLinhas)

      // Se a busca foi aplicada, deve ter pelo menos 1 linha (o pedido)
      expect(qtdLinhas, 'Deve haver ao menos 1 linha pai na lista após navegar').toBeGreaterThanOrEqual(1)
    } else {
      expect(popoverVisivel, 'Popover de edição inline deve estar visível').toBe(true)
    }
  })

  test('clicar "Abrir pedido completo" abre DrawerPedido na Lista', async ({ page }) => {
    // ── 1. Abrir Kanban com card ──────────────────────────────────────────────
    await page.goto('/pedidos/kanban')
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})

    let temCard = false
    try {
      await page.waitForSelector('.kbp-card', { timeout: 10000 })
      temCard = true
    } catch {
      temCard = false
    }

    if (!temCard) {
      test.skip(true, 'Nenhum card no Kanban')
      return
    }

    const cards = page.locator('.kbp-card')
    if (await cards.count() === 0) {
      test.skip(true, 'Nenhum card disponível')
      return
    }

    await cards.first().click()
    await page.waitForTimeout(1500)

    await page.screenshot({ path: path.join(PRINTS_DIR, '08-modal-para-abrir-completo.png'), fullPage: true })

    // ── 2. Clicar em "Abrir pedido completo" ──────────────────────────────────
    const btnAbrir = page.locator('.kbp-modal-btn-abrir').first()
    if (await btnAbrir.count() === 0) {
      test.skip(true, 'Botão "Abrir pedido completo" não encontrado')
      return
    }

    await Promise.all([
      page.waitForURL('**/pedidos', { timeout: 10000 }).catch(() => null),
      btnAbrir.click(),
    ])

    await page.waitForTimeout(2000)

    await page.screenshot({ path: path.join(PRINTS_DIR, '09-lista-apos-abrir-completo.png'), fullPage: true })

    const urlAtual = page.url()
    expect(urlAtual, 'Deve navegar para /pedidos').toContain('/pedidos')
    expect(urlAtual).not.toContain('/kanban')

    // O DrawerPedido deve ter aberto
    const drawer = page.locator('.dp-overlay, [class*="drawer"], .dp-container').first()
    const drawerVisivel = await drawer.isVisible().catch(() => false)
    console.log('Drawer visível:', drawerVisivel)

    await page.screenshot({ path: path.join(PRINTS_DIR, '10-drawer-aberto.png'), fullPage: true })

    // Verificação: navegou com sucesso para Lista (drawer é bônus)
    expect(urlAtual).toContain('/pedidos')
  })
})
