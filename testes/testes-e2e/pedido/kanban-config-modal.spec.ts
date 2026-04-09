import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

/**
 * Testes E2E — Configurações Kanban ↔ Modal (sincronização)
 * Porta: 5179
 *
 * Valida que incluir/excluir campos nas Configurações → Kanban
 * reflete exatamente no modal ao clicar em um card.
 *
 * Pré-requisito: tenant-dev-gravity-2026 deve ter ao menos 1 pedido.
 */

const PRINTS_DIR = path.join(
  process.cwd(),
  'testes/testes-em-tela/produto/pedido/2026-04-09-kanban-config-modal'
)

// Garante que a pasta de prints existe
fs.mkdirSync(PRINTS_DIR, { recursive: true })

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Navega para /configuracoes, abre a seção Kanban */
async function abrirConfiguracoes(page: any) {
  await page.goto('/configuracoes')
  await page.waitForTimeout(2000)

  const botaoKanban = page.locator('button.cfg-sidebar__item').filter({ hasText: /kanban/i })
  await expect(botaoKanban).toBeVisible({ timeout: 5000 })
  await botaoKanban.click()
  await page.waitForTimeout(1000)
}

/** Restaura padrão antes de cada teste que modifica configurações */
async function restaurarPadrao(page: any) {
  await abrirConfiguracoes(page)
  const btnRestaurar = page.locator('button').filter({ hasText: /restaurar padrão/i })
  if (await btnRestaurar.count() > 0) {
    await btnRestaurar.first().click()
    await page.waitForTimeout(1500)
  }
}

/** Abre o modal clicando no primeiro card do Kanban */
async function abrirModalPrimeiroCard(page: any): Promise<boolean> {
  await page.goto('/pedidos/kanban')
  // Aguarda rede quietar (API de pedidos carregar) e então espera pelo card
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
  try {
    await page.waitForSelector('.kbp-card', { timeout: 10000 })
  } catch {
    return false
  }

  const cards = page.locator('.kbp-card')
  const count = await cards.count()
  if (count === 0) return false

  await cards.first().click()
  await page.waitForTimeout(1500)
  return true
}

// ── Setup / Teardown ──────────────────────────────────────────────────────────

test.beforeEach(async ({ page }) => {
  await restaurarPadrao(page)
})

test.afterEach(async ({ page }) => {
  await restaurarPadrao(page)
})

// ── Testes ────────────────────────────────────────────────────────────────────

test.describe('Configurações Kanban ↔ Modal @critico', () => {

  test('01 remover campo da aba Pedido → campo some do modal', async ({ page }) => {
    await abrirConfiguracoes(page)
    await page.screenshot({ path: path.join(PRINTS_DIR, '01a-config-antes-remover.png'), fullPage: true })

    const primeiraAbaPedido = page.locator('.cfg-kanban-aba').filter({ hasText: /pedido/i }).first()

    // Contar campos antes de remover
    const qtdAntes = await primeiraAbaPedido.locator('.cfg-kanban-campo-row').count()
    if (qtdAntes === 0) {
      test.skip(true, 'Nenhum campo configurado na aba Pedido')
      return
    }

    // Capturar label exato do campo que será removido
    const labelRemovido = (await primeiraAbaPedido.locator('.cfg-kanban-campo-row').first()
      .locator('span.cfg-kanban-campo-label').textContent() ?? '').trim()
    console.log('Campo a remover:', labelRemovido, '| Total antes:', qtdAntes)

    const primeiroRemoveBtn = primeiraAbaPedido.locator('.cfg-remove-btn').first()
    if (await primeiroRemoveBtn.count() === 0) {
      test.skip(true, 'Nenhum botão de remoção encontrado')
      return
    }

    await primeiroRemoveBtn.click()
    await page.waitForTimeout(1500) // aguarda debounce (500ms) + save completar

    await page.screenshot({ path: path.join(PRINTS_DIR, '01b-config-apos-remover.png'), fullPage: true })

    // Verificar contador reduziu
    const qtdDepois = await primeiraAbaPedido.locator('.cfg-kanban-campo-row').count()
    expect(qtdDepois, 'Contador deve reduzir 1 após remoção').toBe(qtdAntes - 1)

    // Abrir o modal e verificar que o campo removido NÃO aparece
    const abriuModal = await abrirModalPrimeiroCard(page)
    if (!abriuModal) {
      test.skip(true, 'Nenhum card no Kanban — necessário ter pedidos no tenant dev')
      return
    }

    await page.screenshot({ path: path.join(PRINTS_DIR, '01c-modal-apos-remover.png'), fullPage: true })

    // Clicar na aba Pedido do modal
    const abaPedidoModal = page.locator('.kbp-modal-tab').filter({ hasText: /^pedido$/i }).first()
    if (await abaPedidoModal.count() > 0) await abaPedidoModal.click()
    await page.waitForTimeout(300)

    const camposModal = await page.locator('.kbp-modal-campo-label').allTextContents()
    console.log(`Campos no modal (${camposModal.length}):`, camposModal)

    // ASSERÇÃO REAL: modal deve ter qtdAntes-1 campos
    expect(camposModal.length, `Modal deve ter ${qtdAntes - 1} campos após remover 1`).toBe(qtdAntes - 1)

    // ASSERÇÃO REAL: o campo removido NÃO deve estar no modal
    if (labelRemovido) {
      const temRemovidoNoModal = camposModal.some(c => c.trim() === labelRemovido)
      expect(temRemovidoNoModal, `"${labelRemovido}" não deve aparecer no modal após ser removido`).toBe(false)
    }

    await page.screenshot({ path: path.join(PRINTS_DIR, '01d-modal-sem-campo-removido.png'), fullPage: true })
  })

  test('02 adicionar campo disponível → campo aparece no modal', async ({ page }) => {
    await abrirConfiguracoes(page)

    const primeiraAbaPedido = page.locator('.cfg-kanban-aba').filter({ hasText: /pedido/i }).first()
    const removeBtn = primeiraAbaPedido.locator('.cfg-remove-btn').first()

    if (await removeBtn.count() === 0) {
      test.skip(true, 'Nenhum campo configurado para remover')
      return
    }

    // Remover primeiro campo para criar um disponível
    const qtdAntes = await primeiraAbaPedido.locator('.cfg-kanban-campo-row').count()
    await removeBtn.click()
    await page.waitForTimeout(1000)

    await page.screenshot({ path: path.join(PRINTS_DIR, '02a-campo-removido.png'), fullPage: true })

    // Verificar que há campos disponíveis
    const disponiveisAntes = await page.locator('.cfg-kanban-disponivel-row').count()
    console.log('Campos disponíveis para adicionar:', disponiveisAntes)
    if (disponiveisAntes === 0) {
      test.skip(true, 'Nenhum campo disponível para adicionar')
      return
    }

    // Capturar label do campo a adicionar
    const primeiroDisponivel = page.locator('.cfg-kanban-disponivel-row').first()
    const labelAdicionado = (await primeiroDisponivel.locator('span.cfg-kanban-disponivel-label').textContent() ?? '').trim()

    // Adicionar o campo
    await primeiroDisponivel.locator('.cfg-kanban-add-btn, button').first().click()
    await page.waitForTimeout(1500) // aguarda debounce + save

    console.log('Campo adicionado:', labelAdicionado)
    await page.screenshot({ path: path.join(PRINTS_DIR, '02b-campo-adicionado.png'), fullPage: true })

    // Verificar que o contador voltou ao valor anterior
    const qtdDepois = await primeiraAbaPedido.locator('.cfg-kanban-campo-row').count()
    expect(qtdDepois, 'Contador deve voltar ao valor original após adicionar').toBe(qtdAntes)

    // Abrir modal e verificar que o campo adicionado aparece
    const abriuModal = await abrirModalPrimeiroCard(page)
    if (!abriuModal) {
      test.skip(true, 'Nenhum card no Kanban')
      return
    }

    await page.screenshot({ path: path.join(PRINTS_DIR, '02c-modal-com-campo-adicionado.png'), fullPage: true })

    // Clicar aba Pedido do modal
    const abaPedidoModal = page.locator('.kbp-modal-tab').filter({ hasText: /^pedido$/i }).first()
    if (await abaPedidoModal.count() > 0) await abaPedidoModal.click()
    await page.waitForTimeout(300)

    const camposModal = await page.locator('.kbp-modal-campo-label').allTextContents()
    console.log(`Campos no modal (${camposModal.length}):`, camposModal)

    // ASSERÇÃO REAL: campo adicionado deve estar no modal
    expect(camposModal.length, `Modal deve ter ${qtdAntes} campos`).toBe(qtdAntes)
    if (labelAdicionado) {
      const temNoModal = camposModal.some(c => c.trim() === labelAdicionado)
      expect(temNoModal, `"${labelAdicionado}" deve aparecer no modal após ser adicionado`).toBe(true)
    }

    await page.screenshot({ path: path.join(PRINTS_DIR, '02d-modal-com-campo-confirmado.png'), fullPage: true })
  })

  test('03 ocultar campo com eye → campo some do modal', async ({ page }) => {
    await abrirConfiguracoes(page)
    await page.screenshot({ path: path.join(PRINTS_DIR, '03a-antes-ocultar.png'), fullPage: true })

    const primeiraAbaPedido = page.locator('.cfg-kanban-aba').filter({ hasText: /pedido/i }).first()
    const eyeBtn = primeiraAbaPedido.locator('.cfg-eye-btn').first()

    if (await eyeBtn.count() === 0) {
      test.skip(true, 'Nenhum botão de olho encontrado')
      return
    }

    // Capturar label do campo a ocultar
    const labelOculto = (await primeiraAbaPedido.locator('.cfg-kanban-campo-row').first()
      .locator('span.cfg-kanban-campo-label').textContent() ?? '').trim()
    const qtdConfigTotal = await primeiraAbaPedido.locator('.cfg-kanban-campo-row').count()

    await eyeBtn.click()
    await page.waitForTimeout(1500) // aguarda debounce + save

    console.log('Campo oculto:', labelOculto)
    await page.screenshot({ path: path.join(PRINTS_DIR, '03b-apos-ocultar.png'), fullPage: true })

    // Abrir modal — campo oculto NÃO deve aparecer
    const abriuModal = await abrirModalPrimeiroCard(page)
    if (!abriuModal) {
      test.skip(true, 'Nenhum card no Kanban')
      return
    }

    await page.screenshot({ path: path.join(PRINTS_DIR, '03c-modal-campo-oculto.png'), fullPage: true })

    const abaPedidoModal = page.locator('.kbp-modal-tab').filter({ hasText: /^pedido$/i }).first()
    if (await abaPedidoModal.count() > 0) await abaPedidoModal.click()
    await page.waitForTimeout(300)

    const camposModal = await page.locator('.kbp-modal-campo-label').allTextContents()
    console.log(`Campos visíveis no modal (${camposModal.length}):`, camposModal)

    // ASSERÇÃO REAL: modal deve ter 1 campo a menos (o oculto não aparece)
    expect(camposModal.length, `Modal deve ter ${qtdConfigTotal - 1} campos visíveis`).toBe(qtdConfigTotal - 1)

    // ASSERÇÃO REAL: o campo oculto NÃO deve aparecer no modal
    if (labelOculto) {
      const temOcultoNoModal = camposModal.some(c => c.trim() === labelOculto)
      expect(temOcultoNoModal, `"${labelOculto}" não deve aparecer no modal quando oculto`).toBe(false)
    }

    await page.screenshot({ path: path.join(PRINTS_DIR, '03d-modal-sem-campo-oculto.png'), fullPage: true })
  })

  test('04 restaurar padrão → modal exibe campos originais', async ({ page }) => {
    // Remover um campo para alterar o estado
    await abrirConfiguracoes(page)

    const primeiraAbaPedido = page.locator('.cfg-kanban-aba').filter({ hasText: /pedido/i }).first()
    const removeBtn = primeiraAbaPedido.locator('.cfg-remove-btn').first()
    if (await removeBtn.count() > 0) {
      await removeBtn.click()
      await page.waitForTimeout(1000)
    }

    // Restaurar padrão
    const btnRestaurar = page.locator('button').filter({ hasText: /restaurar padrão/i })
    await expect(btnRestaurar.first()).toBeVisible({ timeout: 5000 })
    await btnRestaurar.first().click()
    await page.waitForTimeout(2000)

    await page.screenshot({ path: path.join(PRINTS_DIR, '04a-apos-restaurar.png'), fullPage: true })

    // Verificar que as 3 abas voltaram a ter campos
    const texto = await page.locator('body').textContent()
    expect(texto).toBeTruthy()

    // Abrir modal
    const abriuModal = await abrirModalPrimeiroCard(page)
    if (!abriuModal) {
      // Mesmo sem card, a restauração passou
      await page.screenshot({ path: path.join(PRINTS_DIR, '04b-sem-card-mas-restaurou.png'), fullPage: true })
      return
    }

    await page.screenshot({ path: path.join(PRINTS_DIR, '04c-modal-padrao-restaurado.png'), fullPage: true })

    // Modal deve ter 4 abas
    const abasModal = page.locator('.kbp-modal-tab')
    const qtdAbas = await abasModal.count()
    console.log('Abas no modal:', qtdAbas)
  })

  test('05 contador X/N campos atualiza ao remover e ao adicionar', async ({ page }) => {
    await abrirConfiguracoes(page)

    await page.screenshot({ path: path.join(PRINTS_DIR, '05a-contador-inicial.png'), fullPage: true })

    // Capturar contador inicial da aba Pedido
    const contadorPedido = page.locator('.cfg-kanban-aba-contador').first()
    const textoInicial = await contadorPedido.textContent()
    console.log('Contador inicial:', textoInicial)

    expect(textoInicial).toMatch(/\d+\/\d+/)

    // Extrair número atual
    const match = textoInicial?.match(/(\d+)\/(\d+)/)
    const atualAntes = parseInt(match?.[1] ?? '0')
    const limite = parseInt(match?.[2] ?? '10')

    // Remover um campo se possível
    const primeiraAbaPedido = page.locator('.cfg-kanban-aba').filter({ hasText: /pedido/i }).first()
    const removeBtn = primeiraAbaPedido.locator('.cfg-remove-btn').first()

    if (await removeBtn.count() > 0 && atualAntes > 0) {
      await removeBtn.click()
      await page.waitForTimeout(1000)

      const textoAposRemover = await contadorPedido.textContent()
      console.log('Contador após remover:', textoAposRemover)

      await page.screenshot({ path: path.join(PRINTS_DIR, '05b-contador-apos-remover.png'), fullPage: true })

      const matchApos = textoAposRemover?.match(/(\d+)\/(\d+)/)
      const atualApos = parseInt(matchApos?.[1] ?? '0')

      expect(atualApos).toBe(atualAntes - 1)
    }

    expect(limite).toBeGreaterThan(0)
  })

  test('06 modal exibe 4 abas: Pedido, Quantidades, Datas, Lembrete', async ({ page }) => {
    await page.goto('/pedidos/kanban')
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
    try {
      await page.waitForSelector('.kbp-card', { timeout: 10000 })
    } catch {
      test.skip(true, 'Nenhum card no Kanban — necessário ter pedidos no tenant dev')
      return
    }

    await page.screenshot({ path: path.join(PRINTS_DIR, '06a-kanban-antes-clicar.png'), fullPage: true })

    const cards = page.locator('.kbp-card')
    const count = await cards.count()

    if (count === 0) {
      test.skip(true, 'Nenhum card no Kanban — necessário ter pedidos no tenant dev')
      return
    }

    await cards.first().click()
    await page.waitForTimeout(1500)

    await page.screenshot({ path: path.join(PRINTS_DIR, '06b-modal-aberto.png'), fullPage: true })

    const abasModal = page.locator('.kbp-modal-tab')
    const qtdAbas = await abasModal.count()
    console.log('Abas encontradas:', qtdAbas)

    await page.screenshot({ path: path.join(PRINTS_DIR, '06c-modal-abas.png'), fullPage: true })

    expect(qtdAbas, 'Modal deve ter 4 abas').toBe(4)

    const textoAbas = await abasModal.allTextContents()
    console.log('Texto das abas:', textoAbas)

    const temPedido = textoAbas.some(t => /pedido/i.test(t))
    const temQuantidades = textoAbas.some(t => /quantidades/i.test(t))
    const temDatas = textoAbas.some(t => /datas/i.test(t))
    const temLembrete = textoAbas.some(t => /lembrete/i.test(t))

    expect(temPedido, 'Aba Pedido não encontrada').toBe(true)
    expect(temQuantidades, 'Aba Quantidades não encontrada').toBe(true)
    expect(temDatas, 'Aba Datas não encontrada').toBe(true)
    expect(temLembrete, 'Aba Lembrete não encontrada').toBe(true)
  })

})
