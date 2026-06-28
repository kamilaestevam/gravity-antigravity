/**
 * Captura screenshots para o Gravity University.
 * Usa o perfil do Chrome já autenticado para evitar login manual.
 *
 * Uso:
 *   node scripts/capturar-screenshots-university.mjs
 *
 * Pré-requisito: feche o Chrome antes de rodar (conflito de lock no perfil).
 */

import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = path.resolve(__dirname, '../public')
const BASE_URL = 'http://localhost:8001'

// Perfil do Chrome do usuário (Windows)
const CHROME_PROFILE = 'C:/Users/danie/AppData/Local/Google/Chrome/User Data'
const CHROME_PROFILE_COPY = 'C:/Users/danie/AppData/Local/Temp/gravity-playwright-profile'

// ── Capturas a realizar ──────────────────────────────────────────────────────

const CAPTURAS = [
  // Login / O que é o Gravity
  {
    rota: '/hub',
    arquivo: 'assets/screenshots/login/o-que-e-o-gravity/hub-visao-geral.png',
    aguardar: 'h1',
    descricao: 'Hub principal — visão geral',
  },
  {
    rota: '/hub',
    arquivo: 'assets/screenshots/login/o-que-e-o-gravity/hub-workspaces-destaque.png',
    aguardar: 'h1',
    descricao: 'Hub — workspaces em destaque',
  },
  {
    rota: '/processo/lista',
    arquivo: 'assets/screenshots/login/o-que-e-o-gravity/processo-lista-com-dados.png',
    aguardar: 'table, .gtv-table-wrapper, h1',
    descricao: 'Processo — lista com dados',
  },
]

// ── Copiar perfil para evitar lock ──────────────────────────────────────────

function copiarPerfil() {
  console.log('📁 Copiando perfil do Chrome para temp...')
  try {
    if (fs.existsSync(CHROME_PROFILE_COPY)) {
      fs.rmSync(CHROME_PROFILE_COPY, { recursive: true, force: true })
    }
    // Copia apenas o perfil Default (mais rápido que copiar tudo)
    const src = path.join(CHROME_PROFILE, 'Default')
    const dst = path.join(CHROME_PROFILE_COPY, 'Default')
    fs.cpSync(src, dst, { recursive: true, filter: (s) => !s.includes('Cache') && !s.includes('Code Cache') })
    console.log('✅ Perfil copiado')
    return true
  } catch (e) {
    console.warn('⚠️  Não foi possível copiar o perfil:', e.message)
    return false
  }
}

// ── Captura principal ────────────────────────────────────────────────────────

async function capturar() {
  const profileCopiado = copiarPerfil()

  let browser
  try {
    browser = await chromium.launchPersistentContext(
      profileCopiado ? CHROME_PROFILE_COPY : '',
      {
        channel: 'chrome',
        headless: false, // visível para debug; mude para true em CI
        viewport: { width: 1440, height: 900 },
        args: ['--start-maximized'],
        ignoreDefaultArgs: ['--enable-automation'],
      }
    )
  } catch (e) {
    console.error('❌ Erro ao abrir Chrome com perfil:', e.message)
    console.log('🔄 Tentando sem perfil...')
    browser = await chromium.launch({
      channel: 'chrome',
      headless: false,
      args: ['--window-size=1440,900'],
    })
    // Sem perfil → precisará logar manualmente
    const page = await browser.newPage()
    await page.goto(`${BASE_URL}/login`)
    console.log('⚠️  Faça login manualmente no Chrome aberto e pressione Enter aqui...')
    await new Promise(r => process.stdin.once('data', r))
  }

  const page = browser.pages ? (browser.pages()[0] ?? await browser.newPage()) : await browser.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })

  for (const captura of CAPTURAS) {
    console.log(`\n📸 Capturando: ${captura.descricao}`)
    const destino = path.join(PUBLIC_DIR, captura.arquivo)
    fs.mkdirSync(path.dirname(destino), { recursive: true })

    await page.goto(`${BASE_URL}${captura.rota}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    try {
      await page.waitForSelector(captura.aguardar, { timeout: 10000 })
    } catch {
      console.warn('  ⚠️  Seletor não encontrado, capturando assim mesmo')
    }

    await page.screenshot({ path: destino, fullPage: false })
    console.log(`  ✅ Salvo: ${captura.arquivo}`)
  }

  await browser.close()
  console.log('\n🎉 Todas as screenshots capturadas!')
}

capturar().catch(e => {
  console.error('❌ Erro:', e)
  process.exit(1)
})
