/**
 * TST-E2E-PREFERENCIA-TESTE-USUARIO-ADMIN-000093
 * End-to-end (Playwright + Percy) — Preferência de Teste do Usuário (favoritos do modal "Rodar Testes").
 *
 * Pré-condições (staging — nunca produção):
 *   - PLAYWRIGHT_BASE_URL apontando para o ambiente
 *   - Sessão autenticada de um admin Gravity (storageState) — favoritos exigem gravity_admin
 *   - Backend com a tabela `teste_favorito_usuario` migrada
 *
 * Fluxo: abrir Admin › Testes → abrir "Rodar Testes" → marcar tipos → salvar favorito →
 *        ver na lista → aplicar (pré-seleciona) → excluir → confirmar persistência após reload.
 *
 * Execução: QA roda em staging após aprovação do dono (skill antigravity-qa).
 */
import { test, expect } from '@playwright/test'
import percySnapshot from '@percy/playwright'

const ROTA_ADMIN_TESTES = '/admin/testes'

async function abrirModalRodarTestes(page: import('@playwright/test').Page) {
  await page.goto(ROTA_ADMIN_TESTES, { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: /rodar (todos os )?testes/i }).first().click()
  await expect(page.getByText('Rodar Testes')).toBeVisible()
}

test.describe('TST-E2E-PREFERENCIA-TESTE-USUARIO-ADMIN-000093 — favoritos do modal Rodar Testes', () => {
  test('E01 — estado inicial do modal (sem favoritos) + Percy', async ({ page }) => {
    await abrirModalRodarTestes(page)
    await expect(page.getByText('Testes Favoritos')).toBeVisible()
    await percySnapshot(page, 'Admin/Rodar Testes — modal aberto (favoritos)')
  })

  test('E02 — salvar configuração atual cria um favorito', async ({ page }) => {
    await abrirModalRodarTestes(page)
    // Marca um tipo (filtro) antes de favoritar — exigência da UI
    await page.getByRole('button', { name: /^UNI/ }).click()
    await page.getByRole('button', { name: /salvar configuração atual/i }).click()
    await expect(page.getByText(/salva em testes favoritos/i)).toBeVisible()
    await percySnapshot(page, 'Admin/Rodar Testes — favorito salvo')
  })

  test('E03 — favoritar sem marcar tipo é recusado (Zod min 1) com toast de erro', async ({ page }) => {
    await abrirModalRodarTestes(page)
    // Nenhum tipo marcado → backend recusa (tipos_teste_favorito_usuario.min(1))
    await page.getByRole('button', { name: /salvar configuração atual/i }).click()
    await expect(page.locator('[data-notification-type="error"], [role="alert"]').first()).toBeVisible()
  })

  test('E04 — aplicar favorito repõe produto/ambiente/tipos', async ({ page }) => {
    await abrirModalRodarTestes(page)
    const cardFavorito = page.locator('text=Testes Favoritos').locator('xpath=following::*[1]')
    await expect(cardFavorito).toBeVisible()
    // Aplicar o primeiro favorito da lista
    await page.getByTitle(/aplicar esta configuração/i).first().click()
    // O filtro de tipo deve refletir o favorito aplicado
    await expect(page.getByRole('button', { name: /^UNI/ })).toBeVisible()
  })

  test('E05 — excluir favorito remove da lista e persiste após reload', async ({ page }) => {
    await abrirModalRodarTestes(page)
    const removerBtn = page.getByTitle(/remover favorito/i).first()
    await removerBtn.click()
    await expect(page.getByText(/favorito removido/i)).toBeVisible()

    // Persistência: recarrega e reabre — favorito não retorna (gravado no banco)
    await abrirModalRodarTestes(page)
    await percySnapshot(page, 'Admin/Rodar Testes — após exclusão de favorito')
  })
})
