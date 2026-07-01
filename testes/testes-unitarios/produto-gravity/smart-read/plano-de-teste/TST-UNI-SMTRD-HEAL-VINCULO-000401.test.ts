// TST-UNI-SMTRD-HEAL-VINCULO-000401
// @vitest-environment node
import { describe, expect, it, vi, beforeEach } from 'vitest'
import * as escopoWorkspace from '../../../../../servicos-global/produto/smart-read/server/src/lib/escopo-workspace-leitura-smart-read.ts'
import * as registrarVinculo from '../../../../../servicos-global/produto/smart-read/server/src/lib/registrar-vinculo-leitura-usuario-smart-read.ts'
import { tentarRecuperarVinculoLeituraWorkspaceSmartRead } from '../../../../../servicos-global/produto/smart-read/server/src/lib/assegurar-vinculo-leitura-workspace-smart-read.ts'

const paramsBase = {
  prisma: {} as never,
  idOrganizacao: 'org-a',
  idUsuario: 'usr-a',
  idWorkspace: 'ws-a',
  idLeitura: 'leitura-heal-401',
}

describe('TST-UNI-SMTRD-HEAL-VINCULO-000401', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('U01: retorna true quando já vinculada ao workspace', async () => {
    vi.spyOn(escopoWorkspace, 'leituraVinculadaAoWorkspaceSmartRead').mockResolvedValue(true)
    const registrar = vi.spyOn(registrarVinculo, 'registrarVinculoLeituraUsuarioSmartRead')

    const ok = await tentarRecuperarVinculoLeituraWorkspaceSmartRead({
      ...paramsBase,
      leituraExisteNoLegado: false,
    })

    expect(ok).toBe(true)
    expect(registrar).not.toHaveBeenCalled()
  })

  it('U02: retorna false quando legado inexistente e vínculo ausente', async () => {
    vi.spyOn(escopoWorkspace, 'leituraVinculadaAoWorkspaceSmartRead').mockResolvedValue(false)

    const ok = await tentarRecuperarVinculoLeituraWorkspaceSmartRead({
      ...paramsBase,
      leituraExisteNoLegado: false,
    })

    expect(ok).toBe(false)
  })

  it('U03: heal bem-sucedido retorna true', async () => {
    vi.spyOn(escopoWorkspace, 'leituraVinculadaAoWorkspaceSmartRead').mockResolvedValue(false)
    const registrar = vi
      .spyOn(registrarVinculo, 'registrarVinculoLeituraUsuarioSmartRead')
      .mockResolvedValue(undefined)

    const ok = await tentarRecuperarVinculoLeituraWorkspaceSmartRead({
      ...paramsBase,
      leituraExisteNoLegado: true,
    })

    expect(ok).toBe(true)
    expect(registrar).toHaveBeenCalledOnce()
  })

  it('U04: falha de registrarVinculo ainda retorna true (legado é fonte — polling segue)', async () => {
    vi.spyOn(escopoWorkspace, 'leituraVinculadaAoWorkspaceSmartRead').mockResolvedValue(false)
    vi.spyOn(registrarVinculo, 'registrarVinculoLeituraUsuarioSmartRead').mockRejectedValue(
      new Error('table progresso_leitura_smart_read does not exist'),
    )

    const ok = await tentarRecuperarVinculoLeituraWorkspaceSmartRead({
      ...paramsBase,
      leituraExisteNoLegado: true,
    })

    expect(ok).toBe(true)
  })
})
