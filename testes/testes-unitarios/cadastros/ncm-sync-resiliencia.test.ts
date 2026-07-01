// @vitest-environment node
import { describe, it, expect, afterEach } from 'vitest'
import { cronNcmHabilitadoNoAmbiente } from '../../../servicos-global/cadastros/server/src/lib/ncm-cron-ambiente.js'
import {
  isErroConexaoBancoTransitorio,
  comRetryConexaoBanco,
} from '../../../servicos-global/cadastros/server/src/lib/retry-conexao-banco.js'

describe('ncm-cron-ambiente', () => {
  const envAnterior = process.env.NCM_CRON_ENABLED

  afterEach(() => {
    if (envAnterior === undefined) delete process.env.NCM_CRON_ENABLED
    else process.env.NCM_CRON_ENABLED = envAnterior
  })

  it('cron habilitado somente com NCM_CRON_ENABLED=1', () => {
    delete process.env.NCM_CRON_ENABLED
    expect(cronNcmHabilitadoNoAmbiente()).toBe(false)
    process.env.NCM_CRON_ENABLED = '1'
    expect(cronNcmHabilitadoNoAmbiente()).toBe(true)
  })
})

describe('retry-conexao-banco', () => {
  it('detecta erro transitório de conexão Prisma', () => {
    expect(isErroConexaoBancoTransitorio(new Error("Can't reach database server"))).toBe(true)
  })

  it('repete em falha transitória', async () => {
    let n = 0
    const r = await comRetryConexaoBanco(async () => {
      n++
      if (n < 2) throw new Error("Can't reach database server")
      return 'ok'
    })
    expect(r).toBe('ok')
    expect(n).toBe(2)
  })
})
