import { chromium } from '@playwright/test'

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  const logs: string[] = []
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`))
  page.on('pageerror', err => logs.push(`[PAGE ERROR] ${err.message}`))

  await page.goto('http://localhost:5182/lpco', { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)

  const html = await page.content()
  console.log('=== CONSOLE LOGS ===')
  for (const l of logs) console.log(l)
  console.log('=== HTML (first 2000 chars) ===')
  console.log(html.substring(0, 2000))
  console.log('=== ROOT INNER HTML ===')
  const root = await page.$('#root')
  if (root) {
    const inner = await root.innerHTML()
    console.log(inner.substring(0, 1500))
  }

  // Check current URL
  console.log('=== URL ===')
  console.log(page.url())

  // Check all visible text
  const bodyText = await page.textContent('body')
  console.log('=== BODY TEXT (first 500) ===')
  console.log(bodyText?.substring(0, 500))

  await page.screenshot({ path: 'screenshots/lpco-debug.png', fullPage: true })
  await browser.close()
})()
