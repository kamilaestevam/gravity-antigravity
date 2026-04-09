import { test, expect } from '@playwright/test'

/**
 * Testes E2E — Configurações > Regras (produto Pedido)
 * Porta: 5179
 *
 * Cobertura:
 *  - Seção "Duplicar pedido" renderiza com toggles corretos
 *  - Seção "Duplicar item" renderiza com toggles corretos (novo)
 *  - Seção "Excluir pedido" renderiza
 *  - Seção "Transferir itens" renderiza
 */

test.describe('Configurações — Regras @critico', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/configuracoes')
    // Aguardar sidebar da página carregar
    await expect(page.locator('.cfg-sidebar__titulo')).toBeVisible()
    // Navegar para aba Regras (botão do sidebar)
    await page.locator('button.cfg-sidebar__item').filter({ hasText: 'Regras' }).click()
    await expect(page.locator('.cfg-secao__titulo').filter({ hasText: 'Duplicar pedido' })).toBeVisible()
  })

  test('seção Duplicar pedido renderiza com os 3 toggles', async ({ page }) => {
    const secao = page.locator('section').filter({ hasText: 'Duplicar pedido' }).first()
    await expect(secao).toBeVisible()
    await expect(secao.locator('text=Copiar datas do pedido original')).toBeVisible()
    await expect(secao.locator('text=Numeração automática ao duplicar')).toBeVisible()
    await expect(secao.locator('text=Duplicar também os itens')).toBeVisible()
    await expect(secao.locator('text=STATUS INICIAL DO PEDIDO DUPLICADO')).toBeVisible()
    await expect(secao.locator('text=Rascunho')).toBeVisible()
    await expect(secao.locator('text=Aberto')).toBeVisible()
    await expect(secao.locator('text=Em Andamento')).toBeVisible()
  })

  test('seção Duplicar item renderiza com os 3 toggles', async ({ page }) => {
    const secao = page.locator('section').filter({ hasText: 'Duplicar item' }).first()
    await expect(secao).toBeVisible()
    await expect(secao.locator('text=Numeração automática ao duplicar')).toBeVisible()
    await expect(secao.locator('text=Copiar datas do item original')).toBeVisible()
    await expect(secao.locator('text=Copiar dados do item original')).toBeVisible()
    await expect(secao.locator('text=Copia todos os campos preenchidos do item original para o novo')).toBeVisible()
  })

  test('toggles de Duplicar item são interativos', async ({ page }) => {
    // Toggle "Numeração automática" — começa ligado, desliga via evaluate (input oculto)
    const toggleNumero = page.locator('#dup-item-numero')
    await expect(toggleNumero).toBeChecked()
    await toggleNumero.evaluate(el => (el as HTMLInputElement).click())
    await expect(toggleNumero).not.toBeChecked()

    // Botão salvar deve aparecer após mudança
    await expect(page.locator('button').filter({ hasText: /Salvar/ })).toBeVisible()
  })

  test('toggle Copiar datas do item original é interativo', async ({ page }) => {
    const toggleDatas = page.locator('#dup-item-datas')
    await expect(toggleDatas).toBeChecked()
    await toggleDatas.evaluate(el => (el as HTMLInputElement).click())
    await expect(toggleDatas).not.toBeChecked()
  })

  test('toggle Copiar dados do item original é interativo', async ({ page }) => {
    const toggleDados = page.locator('#dup-item-dados')
    await expect(toggleDados).toBeChecked()
    await toggleDados.evaluate(el => (el as HTMLInputElement).click())
    await expect(toggleDados).not.toBeChecked()
  })

  test('seção Excluir pedido renderiza', async ({ page }) => {
    await expect(page.locator('.cfg-secao__titulo').filter({ hasText: 'Excluir pedido' })).toBeVisible()
    await expect(page.locator('text=Pedido pode ficar sem itens')).toBeVisible()
  })

  test('seção Transferir itens renderiza', async ({ page }) => {
    await expect(page.locator('text=Transferir itens')).toBeVisible()
    await expect(page.locator('text=Encerrar item de origem quando quantidade chega a zero')).toBeVisible()
  })

  test('ordem das seções: Duplicar pedido → Duplicar item → Excluir pedido → Transferir itens', async ({ page }) => {
    const titulos = await page.locator('.cfg-secao__titulo').allTextContents()
    const relevantes = titulos.filter(t =>
      ['Duplicar pedido', 'Duplicar item', 'Excluir pedido', 'Transferir itens'].includes(t)
    )
    expect(relevantes).toEqual(['Duplicar pedido', 'Duplicar item', 'Excluir pedido', 'Transferir itens'])
  })
})
