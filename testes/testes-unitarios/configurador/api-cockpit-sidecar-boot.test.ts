// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(__dirname, '../../..')
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf-8')

describe('sidecar boot — TASK-000395', () => {
  it('middleware sidecar-listen-ready existe', () => {
    expect(read('servicos-global/servicos-plataforma/middleware/sidecar-listen-ready.ts')).toContain(
      'criarSidecarListenReady',
    )
  })

  it('sidecars plataforma exportam sidecarListenReady', () => {
    for (const f of [
      'servicos-global/servicos-plataforma/api-cockpit/server/src/index.ts',
      'servicos-global/servicos-plataforma/gabi/server/index.ts',
      'servicos-global/servicos-plataforma/taxas-moeda/server/src/index.ts',
    ]) {
      expect(read(f)).toContain('export const sidecarListenReady')
    }
  })

  it('Configurador aguarda health nos sidecars 8016/8032/8009', () => {
    const idx = read('servicos-global/configurador/server/index.ts')
    expect(idx).toContain('aguardarSidecarEmbutido(8016')
    expect(idx).toContain('aguardarSidecarEmbutido(8032')
    expect(idx).toContain('aguardarSidecarEmbutido(8009')
  })

  it('proxy loga com maskError(rota)', () => {
    const proxy = read('servicos-global/configurador/server/routes/api-cockpit.ts')
    expect(proxy).toContain('[api-cockpit proxy]')
    expect(proxy).toContain("maskError(err, 'GET /api-tokens')")
  })
})
