/**
 * playwright.fixtures.ts
 * ----------------------
 * Fixture global do Playwright para o Gravity.
 *
 * Fornece automaticamente:
 *   1. Screenshot de todo teste (aprovado OU reprovado), no fim do test()
 *   2. Captura de erros JS no console e requests falhadas
 *   3. Helper de login automático (skip Clerk em modo Local)
 *   4. Diretório de output organizado por plano-id e timestamp
 *
 * Todo .spec.ts deve importar daqui em vez de '@playwright/test':
 *   import { test, expect } from '../../../playwright.fixtures'
 *
 * NUNCA usar `screenshot: 'on'` no playwright.config.ts — gera 50+ prints
 * por teste. Esta fixture tira EXATAMENTE 1 print por teste no momento certo.
 */

import { test as base, expect, type Page } from '@playwright/test'
import { mkdirSync } from 'fs'
import { join, dirname } from 'path'

interface GravityFixtures {
  /** Page com captura automática de erros e screenshot no final */
  page: Page
  /** ID do plano de teste (extraído do título do describe — TST-E2E-CONFIG-000001) */
  planId: string
  /** Erros JS capturados durante o teste (pageerror) */
  jsErrors: string[]
  /** Requests com status 4xx/5xx capturados durante o teste */
  failedRequests: Array<{ url: string; status: number; method: string }>
}

export const test = base.extend<GravityFixtures>({
  jsErrors: async ({}, use) => {
    const errors: string[] = []
    await use(errors)
  },

  failedRequests: async ({}, use) => {
    const requests: Array<{ url: string; status: number; method: string }> = []
    await use(requests)
  },

  planId: async ({}, use, testInfo) => {
    // Extrai o ID do título do describe: "TST-E2E-CONFIG-000001 — ..."
    const match = testInfo.titlePath[0]?.match(/TST-(UNI|CON|FUN|CRO|E2E|PEN)-([A-Z]+)-(\d{6})/)
    const id = match ? match[0] : 'TST-UNKNOWN-000000'
    await use(id)
  },

  page: async ({ page, jsErrors, failedRequests }, use, testInfo) => {
    // ─── Captura de erros JS ───────────────────────────────────────────────
    page.on('pageerror', (err) => {
      // Filtra erros conhecidos do Clerk em ambiente Local
      if (
        err.message.includes('Clerk') ||
        err.message.includes('ERR_CONNECTION') ||
        err.message.includes('NetworkError')
      ) return
      jsErrors.push(err.message)
    })

    // ─── Captura de requests falhadas ──────────────────────────────────────
    page.on('response', (res) => {
      const status = res.status()
      if (status >= 400 && status < 600) {
        failedRequests.push({
          url:    res.url(),
          status,
          method: res.request().method(),
        })
      }
    })

    // Usa a page no teste
    await use(page)

    // ─── Screenshot SEMPRE no fim (aprovado ou reprovado) ──────────────────
    try {
      const planMatch = testInfo.titlePath[0]?.match(/TST-(UNI|CON|FUN|CRO|E2E|PEN)-([A-Z]+)-(\d{6})/)
      const planId = planMatch ? planMatch[0] : 'TST-UNKNOWN-000000'

      // Numera screenshots por ordem do teste dentro do describe
      const stepNumber = String(testInfo.titlePath.length > 1 ? testInfo.line ?? 0 : 0).padStart(3, '0')

      // Slug do título do teste
      const slug = testInfo.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '')
        .slice(0, 60)

      // Timestamp pra rastreabilidade
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')

      // Status do teste pro nome do arquivo
      const statusTag = testInfo.status === 'passed' ? 'PASS' : testInfo.status === 'failed' ? 'FAIL' : 'OTHER'

      const screenshotPath = join(
        'testes',
        'test-results',
        planId,
        `${stepNumber}_${slug}_${statusTag}_${stamp}.png`
      )

      mkdirSync(dirname(screenshotPath), { recursive: true })

      await page.screenshot({
        path:     screenshotPath,
        fullPage: true,
      }).catch(() => { /* tela já fechada — ignora */ })

      // Anexa ao relatório do Playwright
      testInfo.attachments.push({
        name:        'screenshot-final',
        contentType: 'image/png',
        path:        screenshotPath,
      })
    } catch {
      // Falha na captura de print não derruba o teste
    }
  },
})

export { expect }
