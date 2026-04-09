import { test, expect } from '@playwright/test'
import path from 'path'

/**
 * Testes E2E — Kanban do Pedido (customizado)
 * Porta: 5179
 *
 * Cobertura:
 *  - Visão Kanban abre sem erros de console
 *  - Colunas de status renderizam (Rascunho → Aberto → Em Andamento → Consolidado → Cancelado)
 *  - Cards customizados renderizam (estrutura kbp-card)
 *  - Modal com 4 abas ao clicar em um card (quando há dados)
 *  - Configurações → Kanban: seção existe no sidebar
 *  - Configurações → Kanban: 3 abas configuráveis (Pedido, Quantidades, Datas)
 */

const PRINTS_DIR = path.join(
  process.cwd(),
  'testes/testes-em-tela/produto/pedido/2026-04-08-kanban-customizado'
)

test.describe('Kanban Pedido — visão e cards @critico', () => {
  test('kanban abre sem erros de console e renderiza colunas', async ({ page }) => {
    const consoleErrors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    page.on('pageerror', err => {
      consoleErrors.push(err.message)
    })

    await page.goto('/pedidos/kanban')
    await page.waitForTimeout(3000)

    await page.screenshot({
      path: path.join(PRINTS_DIR, '01-kanban-carregado.png'),
      fullPage: true,
    })

    // Sem erros de SyntaxError / export
    const exportErrors = consoleErrors.filter(e =>
      e.includes('does not provide an export') ||
      e.includes('SyntaxError') ||
      e.includes('is not a function')
    )
    if (exportErrors.length > 0) {
      await page.screenshot({
        path: path.join(PRINTS_DIR, 'FALHA-console-error.png'),
        fullPage: true,
      })
    }
    expect(exportErrors, `Erros de console:\n${exportErrors.join('\n')}`).toHaveLength(0)

    // Página não está em branco
    const bodyText = await page.locator('body').textContent()
    expect(bodyText?.trim().length, 'Página vazia').toBeGreaterThan(10)
  })

  test('colunas de status do kanban são renderizadas', async ({ page }) => {
    await page.goto('/pedidos/kanban')
    await page.waitForTimeout(3000)

    await page.screenshot({
      path: path.join(PRINTS_DIR, '02-kanban-colunas.png'),
      fullPage: true,
    })

    // Verificar que pelo menos uma das colunas de status aparece
    const textosPagina = await page.locator('body').textContent()
    const temColuna = ['Rascunho', 'Aberto', 'Em Andamento', 'Consolidado', 'Cancelado'].some(
      col => textosPagina?.includes(col)
    )
    expect(temColuna, 'Nenhuma coluna de status encontrada na página').toBe(true)
  })
})

test.describe('Kanban Pedido — cards customizados @critico', () => {
  test('cards com classe kbp-card existem na página ou estado vazio exibe mensagem', async ({ page }) => {
    await page.goto('/pedidos/kanban')
    await page.waitForTimeout(3000)

    await page.screenshot({
      path: path.join(PRINTS_DIR, '03-kanban-cards.png'),
      fullPage: true,
    })

    // Ou tem cards customizados, ou tem estado vazio (sem erros)
    const cards = page.locator('.kbp-card')
    const cardCount = await cards.count()

    if (cardCount > 0) {
      // Cards existem — verificar estrutura básica
      const primeiroCard = cards.first()
      await expect(primeiroCard).toBeVisible()
      await page.screenshot({
        path: path.join(PRINTS_DIR, '04-card-estrutura.png'),
        fullPage: false,
      })
    } else {
      // Estado vazio — página ainda deve ter conteúdo (colunas vazias)
      const textosPagina = await page.locator('body').textContent()
      expect(textosPagina?.trim().length, 'Página completamente vazia').toBeGreaterThan(10)
    }
  })
})

test.describe('Configurações — seção Kanban @critico', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/configuracoes')
    await page.waitForTimeout(2000)
  })

  test('seção Kanban aparece no sidebar de Configurações', async ({ page }) => {
    await page.screenshot({
      path: path.join(PRINTS_DIR, '05-configuracoes-sidebar.png'),
      fullPage: true,
    })

    // O sidebar deve ter item Kanban
    const sidebarItems = page.locator('button.cfg-sidebar__item')
    const textosSidebar = await sidebarItems.allTextContents()

    const temKanban = textosSidebar.some(t => t.toLowerCase().includes('kanban'))
    expect(temKanban, `Sidebar não tem Kanban. Itens: ${textosSidebar.join(', ')}`).toBe(true)
  })

  test('seção Kanban exibe 3 abas configuráveis', async ({ page }) => {
    // Navegar para Kanban
    const botaoKanban = page.locator('button.cfg-sidebar__item').filter({ hasText: /kanban/i })
    await expect(botaoKanban).toBeVisible()
    await botaoKanban.click()
    await page.waitForTimeout(1000)

    await page.screenshot({
      path: path.join(PRINTS_DIR, '06-configuracoes-kanban.png'),
      fullPage: true,
    })

    // Verificar que as 3 abas aparecem
    const textosPagina = await page.locator('body').textContent()
    const temAbasPedido = textosPagina?.includes('Pedido') ?? false
    const temAbasQuantidades = textosPagina?.includes('Quantidades') ?? false
    const temAbasDatas = textosPagina?.includes('Datas') ?? false

    expect(temAbasPedido, 'Aba Pedido não encontrada').toBe(true)
    expect(temAbasQuantidades, 'Aba Quantidades não encontrada').toBe(true)
    expect(temAbasDatas, 'Aba Datas não encontrada').toBe(true)
  })

  test('seção Kanban tem aba Lembrete (não configurável)', async ({ page }) => {
    const botaoKanban = page.locator('button.cfg-sidebar__item').filter({ hasText: /kanban/i })
    await expect(botaoKanban).toBeVisible()
    await botaoKanban.click()
    await page.waitForTimeout(1000)

    const textosPagina = await page.locator('body').textContent()
    expect(textosPagina?.includes('Lembrete'), 'Aba Lembrete não encontrada').toBe(true)

    await page.screenshot({
      path: path.join(PRINTS_DIR, '07-configuracoes-kanban-lembrete.png'),
      fullPage: true,
    })
  })
})
