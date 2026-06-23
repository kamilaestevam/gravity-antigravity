import { describe, expect, it, vi } from 'vitest'
import {
  leituraDeRegistroSnapshot,
  leituraElegivelParaSnapshot,
  obterLeituraDoProgresso,
  obterLeituraDoSnapshot,
} from '../../../servicos-global/produto/smart-read/server/src/lib/snapshot-leitura-smart-read.ts'
import type { Leitura } from '../../../servicos-global/produto/smart-read/server/src/schemas/leitura-smart-read.ts'
import type { PrismaClient } from '../../../servicos-global/produto/smart-read/server/src/generated/client/index.ts'

const leituraCompleta: Leitura = {
  id_leitura: 'leitura-teste-001',
  nome_leitura: 'Invoice teste',
  status_leitura: 'COMPLETED',
  total_arquivos: 1,
  arquivos_processados: 1,
  arquivos: [
    {
      id_arquivo: 'arq-1',
      nome_arquivo: 'invoice.pdf',
      status_arquivo: 'COMPLETED',
      resultado_extracao: [{ tipo_documento: 'invoice', dados: { numero: '123' } }],
    },
  ],
}

describe('snapshot-leitura-smart-read', () => {
  it('leituraElegivelParaSnapshot aceita COMPLETED com extracao', () => {
    expect(leituraElegivelParaSnapshot(leituraCompleta)).toBe(true)
  })

  it('leituraElegivelParaSnapshot rejeita PROCESSING sem extracao', () => {
    expect(
      leituraElegivelParaSnapshot({
        ...leituraCompleta,
        status_leitura: 'PROCESSING',
        arquivos: [{ ...leituraCompleta.arquivos[0], resultado_extracao: null }],
      }),
    ).toBe(false)
  })

  it('leituraDeRegistroSnapshot valida payload JSON', () => {
    const leitura = leituraDeRegistroSnapshot({
      dados_extracao_snapshot_leitura_smart_read: leituraCompleta,
      data_envio_snapshot_leitura_smart_read: new Date('2026-06-23T12:00:00.000Z'),
      origem_leitura_snapshot_leitura_smart_read: 'INTERFACE',
      mensagem_erro_snapshot_leitura_smart_read: null,
    })
    expect(leitura?.id_leitura).toBe('leitura-teste-001')
  })

  it('obterLeituraDoSnapshot filtra por id_usuario', async () => {
    const findFirst = vi.fn().mockResolvedValue(null)
    const prisma = { snapshotLeituraSmartRead: { findFirst } } as unknown as PrismaClient

    await expect(obterLeituraDoSnapshot(prisma, 'leitura-1', '')).resolves.toBeNull()
    expect(findFirst).not.toHaveBeenCalled()

    await obterLeituraDoSnapshot(prisma, 'leitura-1', 'usr-abc')
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id_usuario: 'usr-abc',
          id_leitura_legado_snapshot_leitura_smart_read: 'leitura-1',
        },
      }),
    )
  })

  it('obterLeituraDoProgresso exige idUsuario e filtra por usuário', async () => {
    const findFirst = vi.fn()
    const prisma = { progressoLeituraSmartRead: { findFirst } } as unknown as PrismaClient

    await expect(obterLeituraDoProgresso(prisma, 'leitura-1', '')).resolves.toBeNull()
    expect(findFirst).not.toHaveBeenCalled()

    findFirst.mockResolvedValue(null)
    await obterLeituraDoProgresso(prisma, 'leitura-1', 'usr-abc')
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id_leitura_legado_progresso_leitura_smart_read: 'leitura-1',
          id_usuario: 'usr-abc',
        },
      }),
    )
  })
})
