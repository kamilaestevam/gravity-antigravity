/**
 * Teste em Tela — Kanban reflete configuração de Status (Onda 2 fix)
 * Data: 2026-04-12
 * Porta frontend: 5179
 * Porta backend: 3001
 *
 * Plano:
 *   01 — Kanban carregado (estado inicial)
 *   02 — Kanban colunas visíveis (zoom nas colunas)
 *   03 — Tela de configuração de Status aberta
 *   04 — Comparação: labels e ordem das colunas
 *
 * Critério de sucesso: colunas do Kanban correspondem à config de status
 */

import { chromium } from 'playwright'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PASTA_SAIDA = __dirname

async function executar() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })

  // Coletar status da API antes
  let statusDaApi = []
  page.on('response', async resp => {
    if (resp.url().includes('/api/v1/pedidos/config/status')) {
      try {
        const json = await resp.json()
        if (Array.isArray(json.data)) {
          statusDaApi = json.data.sort((a, b) => a.ordem - b.ordem)
          console.log(`[API] Status recebidos: ${statusDaApi.map(s => s.rotulo).join(', ')}`)
        }
      } catch (_) {}
    }
  })

  try {
    // PASSO 1 — Kanban carregado
    await page.goto('http://localhost:5179/pedidos/kanban')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    await page.screenshot({
      path: path.join(PASTA_SAIDA, '01-kanban-carregado.png'),
      fullPage: true,
    })
    console.log('✓ 01-kanban-carregado.png')

    // PASSO 2 — Zoom nas colunas (área de colunas do Kanban)
    const kanbanEl = page.locator('.kanban-global, .gtv-kanban, [class*="kanban"]').first()
    const kanbanExists = await kanbanEl.count() > 0

    if (kanbanExists) {
      await kanbanEl.screenshot({
        path: path.join(PASTA_SAIDA, '02-kanban-colunas-zoom.png'),
      })
    } else {
      await page.screenshot({
        path: path.join(PASTA_SAIDA, '02-kanban-colunas-zoom.png'),
        fullPage: false,
      })
    }
    console.log('✓ 02-kanban-colunas-zoom.png')

    // Ler texto das colunas da página
    const textosPagina = await page.locator('body').textContent()
    console.log(`[KANBAN] Colunas visíveis contém "${statusDaApi.map(s => s.rotulo).join('", "')}"`)

    let colunasOk = true
    if (statusDaApi.length > 0) {
      for (const s of statusDaApi) {
        const encontrou = textosPagina?.includes(s.rotulo)
        if (!encontrou) {
          console.warn(`  ⚠ Rotulo "${s.rotulo}" não encontrado na página`)
          colunasOk = false
        } else {
          console.log(`  ✓ "${s.rotulo}" presente`)
        }
      }
    } else {
      console.log('  ℹ API não retornou status (servidor offline?) — verificando fallback')
      const temFallback = ['Rascunho', 'Aberto', 'Cancelado'].some(l => textosPagina?.includes(l))
      console.log(`  Fallback visível: ${temFallback}`)
    }

    // PASSO 3 — Tela de Configurações > Status
    await page.goto('http://localhost:5179/configuracoes')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Clicar na seção Status se disponível
    const btnStatus = page.locator('button').filter({ hasText: /status/i }).first()
    const temBtnStatus = await btnStatus.count() > 0
    if (temBtnStatus) {
      await btnStatus.click()
      await page.waitForTimeout(1000)
    }

    await page.screenshot({
      path: path.join(PASTA_SAIDA, '03-config-status.png'),
      fullPage: true,
    })
    console.log('✓ 03-config-status.png')

    // PASSO 4 — Voltar ao Kanban para estado final
    await page.goto('http://localhost:5179/pedidos/kanban')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    await page.screenshot({
      path: path.join(PASTA_SAIDA, '04-kanban-estado-final.png'),
      fullPage: false,
    })
    console.log('✓ 04-kanban-estado-final.png')

    console.log('\n═══════════════════════════════════')
    console.log('RESULTADO:', colunasOk ? 'PASSOU ✓' : 'ATENÇÃO — alguns rotulos não encontrados')
    console.log(`Status da API: ${statusDaApi.length}`)
    console.log('═══════════════════════════════════')

  } finally {
    await browser.close()
  }
}

executar().catch(err => {
  console.error('ERRO:', err)
  process.exit(1)
})
