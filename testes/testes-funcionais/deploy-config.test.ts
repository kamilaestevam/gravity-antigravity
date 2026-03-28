// @vitest-environment node

/**
 * Testes funcionais — deploy.yml configuration
 * Localização: testes/testes-funcionais/deploy-config.test.ts
 *
 * Valida que o workflow de deploy contém as proteções esperadas:
 * - Health checks sem continue-on-error
 * - Flag --strict no compose do schema
 * - Validação de secrets obrigatórios
 */

import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const DEPLOY_YML_PATH = path.resolve(__dirname, '../../.github/workflows/deploy.yml')
const deployContent = fs.readFileSync(DEPLOY_YML_PATH, 'utf-8')

// ─── 1. Health checks must NOT have continue-on-error ────────────────────────────

describe('deploy.yml — health check rigor', () => {
  it('does not contain continue-on-error anywhere in the file', () => {
    expect(deployContent).not.toContain('continue-on-error')
  })

  it('contains health check steps with curl -f (fail on HTTP errors)', () => {
    expect(deployContent).toContain('curl -f')
  })

  it('health check for staging uses || exit 1', () => {
    const stagingHealthLine = deployContent
      .split('\n')
      .find((line) => line.includes('curl -f') && line.includes('staging'))
    expect(stagingHealthLine).toBeDefined()
    expect(stagingHealthLine).toContain('|| exit 1')
  })

  it('health check for production uses || exit 1', () => {
    const prodHealthLine = deployContent
      .split('\n')
      .find((line) => line.includes('curl -f') && !line.includes('staging') && line.includes('health'))
    expect(prodHealthLine).toBeDefined()
    expect(prodHealthLine).toContain('|| exit 1')
  })
})

// ─── 2. --strict flag on schema compose ──────────────────────────────────────────

describe('deploy.yml — schema compose strict mode', () => {
  it('contains --strict flag for compose-tenant-schema', () => {
    const composeLine = deployContent
      .split('\n')
      .find((line) => line.includes('compose-tenant-schema'))
    expect(composeLine).toBeDefined()
    expect(composeLine).toContain('--strict')
  })
})

// ─── 3. Secrets validation steps ─────────────────────────────────────────────────

describe('deploy.yml — secrets validation', () => {
  it('contains a secrets validation step for Staging', () => {
    expect(deployContent).toContain('Validar secrets obrigatórios (Staging)')
  })

  it('contains a secrets validation step for Production', () => {
    expect(deployContent).toContain('Validar secrets obrigatórios (Produção)')
  })

  it('staging secrets validation checks STAGING_CONFIGURADOR_DATABASE_URL', () => {
    expect(deployContent).toContain('STAGING_CONFIGURADOR_DATABASE_URL')
  })

  it('staging secrets validation checks RAILWAY_TOKEN_STAGING', () => {
    expect(deployContent).toContain('RAILWAY_TOKEN_STAGING')
  })

  it('production secrets validation checks PROD_CONFIGURADOR_DATABASE_URL', () => {
    expect(deployContent).toContain('PROD_CONFIGURADOR_DATABASE_URL')
  })

  it('production secrets validation checks RAILWAY_TOKEN_PRODUCTION', () => {
    expect(deployContent).toContain('RAILWAY_TOKEN_PRODUCTION')
  })

  it('secrets validation exits with code 1 on missing secrets', () => {
    // Both staging and production blocks use: exit 1
    const lines = deployContent.split('\n')
    const exitLines = lines.filter(
      (line) => line.includes('exit 1') && line.includes('missing')
    )
    // At least 2: one for staging, one for production
    expect(exitLines.length).toBeGreaterThanOrEqual(2)
  })
})
