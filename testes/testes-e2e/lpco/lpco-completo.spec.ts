/**
 * E2E Tests — LPCO Produto Completo
 * Testa todas as páginas, interações e fluxos do usuário
 */

import { test, expect } from '@playwright/test'

test.describe('LPCO — Página Lista', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/lpco', { waitUntil: 'networkidle' })
    // Aguardar conteúdo renderizar (mock data carrega após API fallback)
    await page.waitForSelector('text=LPCOs', { timeout: 15000 })
  })

  test('renderiza título e subtítulo', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('LPCOs')
    await expect(page.getByText('Licencas, Permissoes, Certificados')).toBeVisible()
  })

  test('renderiza botão Novo LPCO', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Novo LPCO/i })).toBeVisible()
  })

  test('renderiza botão Simulador TA', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Simulador TA/i })).toBeVisible()
  })

  test('renderiza stats cards (6 cards)', async ({ page }) => {
    const cards = page.locator('.lp-stat-card')
    await expect(cards).toHaveCount(6)
  })

  test('stats cards mostram labels corretos', async ({ page }) => {
    for (const label of ['Total', 'Rascunho', 'Em Analise', 'Em Exigencia', 'Deferida', 'Indeferida']) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible()
    }
  })

  test('tabela renderiza com dados mock (ANVISA visível)', async ({ page }) => {
    await expect(page.getByText('ANVISA').first()).toBeVisible()
  })

  test('tabela mostra IDs corporativos', async ({ page }) => {
    await expect(page.getByText('lpco_id_0000001/26')).toBeVisible()
  })

  test('clicar no stat card "Rascunho" filtra a tabela', async ({ page }) => {
    await page.locator('.lp-stat-card', { hasText: 'Rascunho' }).click()
    await expect(page.locator('.lp-filtro-ativo')).toBeVisible()
    await expect(page.getByText('Filtrando por')).toBeVisible()
  })

  test('clicar no X do filtro limpa', async ({ page }) => {
    // Clicar no 5o stat card (Deferida - index 4)
    await page.locator('.lp-stat-card').nth(4).click()
    await expect(page.locator('.lp-filtro-ativo')).toBeVisible({ timeout: 5000 })
    await page.locator('.lp-filtro-limpar').click()
    await expect(page.locator('.lp-filtro-ativo')).not.toBeVisible()
  })

  test('clicar mesmo card 2x desativa filtro', async ({ page }) => {
    const card = page.locator('.lp-stat-card', { hasText: 'Em Analise' })
    await card.click()
    await expect(page.locator('.lp-filtro-ativo')).toBeVisible()
    await card.click()
    await expect(page.locator('.lp-filtro-ativo')).not.toBeVisible()
  })

  test('botão Novo LPCO navega para /lpco/novo', async ({ page }) => {
    await page.getByRole('button', { name: /Novo LPCO/i }).click()
    await expect(page).toHaveURL(/\/lpco\/novo/)
    await expect(page.locator('h1')).toContainText('Novo LPCO')
  })

  test('botão Simulador TA navega para /lpco/simulador', async ({ page }) => {
    await page.getByRole('button', { name: /Simulador TA/i }).click()
    await expect(page).toHaveURL(/\/lpco\/simulador/)
  })
})

test.describe('LPCO — Wizard Novo LPCO', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/lpco/novo', { waitUntil: 'networkidle' })
    await page.waitForSelector('text=Novo LPCO', { timeout: 15000 })
  })

  test('renderiza título', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Novo LPCO')
  })

  test('step 0: mostra 6 canais de entrada', async ({ page }) => {
    // Verificar que existem 6 cards de canal dentro do grid
    await expect(page.getByRole('button', { name: /Digitacao Manual/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Planilha Excel/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /partir do Pedido/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Smart Read/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Duplicado de existente/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Integracao via API/i })).toBeVisible()
  })

  test('step indicator mostra 4 steps', async ({ page }) => {
    for (const step of ['Canal', 'Dados Gerais', 'Itens', 'Revisao']) {
      await expect(page.getByText(step, { exact: true })).toBeVisible()
    }
  })

  test('step 0→1: Próximo avança para Dados Gerais', async ({ page }) => {
    await page.getByRole('button', { name: /Proximo/i }).click()
    await expect(page.getByText('Tipo Operacao')).toBeVisible()
    await expect(page.getByText('Orgao Anuente')).toBeVisible()
  })

  test('step 1: preencher todos os campos', async ({ page }) => {
    await page.getByRole('button', { name: /Proximo/i }).click()
    // Selecionar orgão
    const orgaoSelect = page.locator('select').nth(2) // terceiro select (apos tipo_op e tipo_lpco)
    await orgaoSelect.selectOption({ label: 'ANVISA — Agencia Nacional de Vigilancia Sanitaria' })
    await page.locator('input[placeholder="Ex: I00004"]').fill('I00004')
    await page.locator('input[placeholder="Ex: CN"]').fill('CN')
    await page.locator('input[placeholder*="RDC"]').fill('RDC 81/2008')
  })

  test('step 1→2: avançar mostra formulário de itens', async ({ page }) => {
    // Step 0 → 1
    await page.getByRole('button', { name: /Proximo/i }).click()
    // Preencher step 1
    const orgaoSelect = page.locator('select').nth(2)
    await orgaoSelect.selectOption({ label: 'ANVISA — Agencia Nacional de Vigilancia Sanitaria' })
    await page.locator('input[placeholder="Ex: I00004"]').fill('I00004')
    await page.locator('input[placeholder="Ex: CN"]').fill('CN')
    await page.locator('input[placeholder*="RDC"]').fill('RDC 81/2008')
    // Step 1 → 2
    await page.getByRole('button', { name: /Proximo/i }).click()
    await expect(page.getByText('Item 1')).toBeVisible()
    await expect(page.getByText('Adicionar Item')).toBeVisible()
  })

  test('step 2: adicionar segundo item', async ({ page }) => {
    // Navigate to step 2
    await page.getByRole('button', { name: /Proximo/i }).click()
    const orgaoSelect = page.locator('select').nth(2)
    await orgaoSelect.selectOption({ label: 'MAPA — Ministerio da Agricultura e Pecuaria' })
    await page.locator('input[placeholder="Ex: I00004"]').fill('I00001')
    await page.locator('input[placeholder="Ex: CN"]').fill('AR')
    await page.locator('input[placeholder*="RDC"]').fill('IN SDA 51/2020')
    await page.getByRole('button', { name: /Proximo/i }).click()

    await expect(page.getByText('Item 1')).toBeVisible()
    await page.getByText('Adicionar Item').click()
    await expect(page.getByText('Item 2')).toBeVisible()
  })

  test('botão Voltar retorna ao step anterior', async ({ page }) => {
    await page.getByRole('button', { name: /Proximo/i }).click()
    await expect(page.getByText('Tipo Operacao')).toBeVisible()
    await page.getByRole('button', { name: /Voltar/i }).click()
    await expect(page.getByText('Digitacao Manual')).toBeVisible()
  })

  test('botão Cancelar (step 0) volta para lista', async ({ page }) => {
    await page.getByRole('button', { name: /Cancelar/i }).click()
    await expect(page).toHaveURL(/\/lpco$/)
  })
})

test.describe('LPCO — Detalhe', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/lpco/test-id', { waitUntil: 'networkidle' })
    // Mock data carrega após API fallback
    await page.waitForSelector('button:has-text("Dados")', { timeout: 15000 })
  })

  test('renderiza header com status badge', async ({ page }) => {
    await expect(page.getByText('Em Exigencia').first()).toBeVisible()
  })

  test('renderiza 6 abas', async ({ page }) => {
    for (const tab of ['Dados', 'Itens', 'Exigencias', 'Vinculos', 'Documentos', 'Historico']) {
      await expect(page.getByRole('button', { name: tab })).toBeVisible()
    }
  })

  test('aba Dados (default) mostra cards de classificação', async ({ page }) => {
    await expect(page.getByText('Classificacao')).toBeVisible()
    await expect(page.getByText('Dados Gerais')).toBeVisible()
    await expect(page.getByText('Datas e Vigencia')).toBeVisible()
  })

  test('aba Dados mostra orgão anuente ANVISA', async ({ page }) => {
    await expect(page.getByText('ANVISA').first()).toBeVisible()
  })

  test('clicar aba Itens mostra itens NCM', async ({ page }) => {
    await page.getByRole('button', { name: 'Itens' }).click()
    await expect(page.getByText('30049099').first()).toBeVisible()
    await expect(page.getByText('Amoxicilina').first()).toBeVisible()
  })

  test('clicar aba Exigencias mostra exigencias pendentes', async ({ page }) => {
    await page.getByRole('button', { name: 'Exigencias' }).click()
    await expect(page.getByText('Exigencia #1')).toBeVisible()
    await expect(page.getByText('Pendente')).toBeVisible()
  })

  test('clicar aba Vinculos mostra mensagem vazia', async ({ page }) => {
    await page.getByRole('button', { name: 'Vinculos' }).click()
    await expect(page.getByText('Nenhum vinculo')).toBeVisible()
  })

  test('clicar aba Historico mostra timeline', async ({ page }) => {
    await page.getByRole('button', { name: 'Historico' }).click()
    // Mock historico pode ter eventos ou estar vazio
    const hasEvents = await page.getByText('LPCO criado').isVisible().catch(() => false)
    const isEmpty = await page.getByText('Nenhum evento').isVisible().catch(() => false)
    expect(hasEvents || isEmpty).toBeTruthy()
  })

  test('botão Cancelar visível (status em_exigencia)', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Cancelar' })).toBeVisible()
  })

  test('botão Duplicar visível', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Duplicar' })).toBeVisible()
  })
})

test.describe('LPCO — Simulador TA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/lpco/simulador', { waitUntil: 'networkidle' })
    await page.waitForSelector('h1', { timeout: 15000 })
  })

  test('renderiza título e campos', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Simulador')
    await expect(page.getByText('NCM (8 digitos)')).toBeVisible()
    await expect(page.getByText('Operacao').first()).toBeVisible()
  })

  test('input NCM limita a 8 dígitos numéricos', async ({ page }) => {
    const input = page.locator('input[placeholder*="30049099"]')
    await input.fill('30049099abc123')
    await expect(input).toHaveValue('30049099')
  })

  test('botão Simular desabilitado com NCM < 8 dígitos', async ({ page }) => {
    await page.locator('input[placeholder*="30049099"]').fill('3004')
    await expect(page.getByRole('button', { name: /Simular/i })).toBeDisabled()
  })

  test('botão Simular habilitado com NCM = 8 dígitos', async ({ page }) => {
    await page.locator('input[placeholder*="30049099"]').fill('30049099')
    await expect(page.getByRole('button', { name: /Simular/i })).toBeEnabled()
  })

  test('simular NCM 30049099 → ANVISA obrigatório', async ({ page }) => {
    await page.locator('input[placeholder*="30049099"]').fill('30049099')
    await page.getByRole('button', { name: /Simular/i }).click()
    await expect(page.getByText('ANVISA').first()).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Obrigatorio')).toBeVisible()
  })

  test('simular NCM 01010101 → MAPA obrigatório', async ({ page }) => {
    await page.locator('input[placeholder*="30049099"]').fill('01010101')
    await page.getByRole('button', { name: /Simular/i }).click()
    await expect(page.getByText('MAPA').first()).toBeVisible({ timeout: 5000 })
  })

  test('simular NCM 99999999 → nenhum tratamento', async ({ page }) => {
    await page.locator('input[placeholder*="30049099"]').fill('99999999')
    await page.getByRole('button', { name: /Simular/i }).click()
    await expect(page.getByText('Nenhum tratamento administrativo')).toBeVisible({ timeout: 5000 })
  })

  test('simular com Enter key', async ({ page }) => {
    await page.locator('input[placeholder*="30049099"]').fill('27010000')
    await page.locator('input[placeholder*="30049099"]').press('Enter')
    await expect(page.getByText('ANP').first()).toBeVisible({ timeout: 5000 })
  })

  test('select Exportação persiste', async ({ page }) => {
    await page.locator('select').last().selectOption('EXPORTACAO')
    await page.locator('input[placeholder*="30049099"]').fill('30049099')
    await page.getByRole('button', { name: /Simular/i }).click()
    await expect(page.getByText('ANVISA').first()).toBeVisible({ timeout: 5000 })
  })
})

test.describe('LPCO — Navegação', () => {
  test('redirect / → /lpco', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    expect(page.url()).toContain('/lpco')
  })

  test('redirect URL desconhecida → /lpco', async ({ page }) => {
    await page.goto('/pagina-inexistente', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    expect(page.url()).toContain('/lpco')
  })

  test('Lista → Novo → Cancelar → Lista', async ({ page }) => {
    await page.goto('/lpco', { waitUntil: 'networkidle' })
    await page.waitForSelector('text=LPCOs', { timeout: 15000 })
    await page.getByRole('button', { name: /Novo LPCO/i }).click()
    await expect(page).toHaveURL(/\/lpco\/novo/)
    await page.getByRole('button', { name: /Cancelar/i }).click()
    await expect(page).toHaveURL(/\/lpco$/)
  })

  test('Lista → Simulador → Voltar → Lista', async ({ page }) => {
    await page.goto('/lpco', { waitUntil: 'networkidle' })
    await page.waitForSelector('text=LPCOs', { timeout: 15000 })
    await page.getByRole('button', { name: /Simulador TA/i }).click()
    await expect(page).toHaveURL(/\/lpco\/simulador/)
    // Voltar usando goBack (browser history)
    await page.goBack()
    await expect(page).toHaveURL(/\/lpco$/)
  })
})
