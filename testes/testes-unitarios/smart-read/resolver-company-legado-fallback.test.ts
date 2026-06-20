import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolverCompanyLegado } from '../../../servicos-global/produto/smart-read/server/src/lib/resolver-vinculo-smart-read-legado.js'

describe('resolverCompanyLegado — fallback local', () => {
  const envOriginal = { ...process.env }

  afterEach(() => {
    process.env = { ...envOriginal }
    vi.restoreAllMocks()
  })

  it('usa SMART_READ_ID_COMPANY_LEGADO_PADRAO quando Configurador retorna 422', async () => {
    process.env.CONFIGURATOR_URL = 'http://localhost:8005'
    process.env.CHAVE_INTERNA_SERVICO = 'test-key'
    process.env.SMART_READ_ID_COMPANY_LEGADO_PADRAO = '2'

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: async () => ({
          error: { code: 'ORGANIZACAO_SEM_VINCULO', message: 'sem vínculo' },
        }),
      }),
    )

    await expect(resolverCompanyLegado('org-teste')).resolves.toBe('2')
  })
})
