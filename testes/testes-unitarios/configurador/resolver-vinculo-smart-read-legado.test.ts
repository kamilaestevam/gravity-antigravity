import { afterEach, describe, expect, it } from 'vitest'
import {
  CHAVE_CONFIG_ID_COMPANY_SMART_READ_LEGADO,
  configuracaoInicialSmartReadLegado,
  idCompanySmartReadLegadoDeConfig,
} from '../../../servicos-global/configurador/server/lib/resolver-vinculo-smart-read-legado.js'

describe('resolver-vinculo-smart-read-legado — helpers puros', () => {
  afterEach(() => {
    delete process.env.SMART_READ_ID_COMPANY_LEGADO_PADRAO
  })

  it('extrai id_company_smart_read_legado do JSON de configuração', () => {
    expect(
      idCompanySmartReadLegadoDeConfig({
        [CHAVE_CONFIG_ID_COMPANY_SMART_READ_LEGADO]: '42',
      }),
    ).toBe('42')
    expect(idCompanySmartReadLegadoDeConfig({})).toBeNull()
    expect(idCompanySmartReadLegadoDeConfig(null)).toBeNull()
  })

  it('monta config inicial a partir de SMART_READ_ID_COMPANY_LEGADO_PADRAO', () => {
    process.env.SMART_READ_ID_COMPANY_LEGADO_PADRAO = '  7  '
    expect(configuracaoInicialSmartReadLegado()).toEqual({
      [CHAVE_CONFIG_ID_COMPANY_SMART_READ_LEGADO]: '7',
    })
    delete process.env.SMART_READ_ID_COMPANY_LEGADO_PADRAO
    expect(configuracaoInicialSmartReadLegado()).toEqual({})
  })
})
