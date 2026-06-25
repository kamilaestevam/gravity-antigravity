import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  espelharArtefatosEmtPersistente,
  resolverCaminhoPrintSeguro,
  isCaminhoRelPrintEmtPermitido,
  prepararEntradaEmtParaPersistencia,
} from '../../../servicos-global/configurador/server/lib/emt-artifacts.js'
import type { TestLogEntry } from '../../../servicos-global/configurador/server/utils/playwright-parser.js'

const EMT_PASTA_FIXTURE = 'testes/testes-em-tela/produto-gravity/pedido/lista/editar-salvar/resultado-teste/1780968164786'

describe('emt-artifacts persistência', () => {
  let tmpArtifacts: string
  let envAnterior: string | undefined

  beforeEach(() => {
    tmpArtifacts = mkdtempSync(join(tmpdir(), 'emt-artifacts-'))
    envAnterior = process.env.EMT_ARTIFACTS_DIR
    process.env.EMT_ARTIFACTS_DIR = tmpArtifacts
  })

  afterEach(() => {
    if (envAnterior === undefined) delete process.env.EMT_ARTIFACTS_DIR
    else process.env.EMT_ARTIFACTS_DIR = envAnterior
    rmSync(tmpArtifacts, { recursive: true, force: true })
  })

  it('isCaminhoRelPrintEmtPermitido aceita pasta persistente', () => {
    expect(isCaminhoRelPrintEmtPermitido(EMT_PASTA_FIXTURE)).toBe(true)
    expect(isCaminhoRelPrintEmtPermitido(`data/emt-artifacts/${EMT_PASTA_FIXTURE}`)).toBe(true)
    expect(isCaminhoRelPrintEmtPermitido('outro/caminho')).toBe(false)
  })

  it('espelhar + resolver serve PNG da cópia persistente', () => {
    const origemAbs = join(process.cwd(), EMT_PASTA_FIXTURE)
    if (!existsSync(join(origemAbs, 'RESULTADO.txt'))) return

    const pastaPersist = espelharArtefatosEmtPersistente(EMT_PASTA_FIXTURE)
    expect(pastaPersist).toMatch(/^data\/emt-artifacts\//)

    const candidato = ['01-pos-login.png', '02-lista-carregada.png']
      .find(n => existsSync(join(tmpArtifacts, EMT_PASTA_FIXTURE, n)))
    if (!candidato) return

    const abs = resolverCaminhoPrintSeguro(pastaPersist!, candidato)
    expect(abs).not.toBeNull()
  })

  it('prepararEntradaEmtParaPersistencia atualiza emt_pasta', () => {
    if (!existsSync(join(process.cwd(), EMT_PASTA_FIXTURE, 'RESULTADO.txt'))) return

    const entry: TestLogEntry = {
      type: 'EMT',
      module: 'TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-001',
      test_name: 'lista',
      result: 'APROVADO',
      duration: '1ms',
      emt_pasta: EMT_PASTA_FIXTURE,
      emt_prints: ['01-pos-login.png'],
    }

    const prep = prepararEntradaEmtParaPersistencia(entry)
    expect(prep.emt_pasta).toMatch(/^data\/emt-artifacts\//)
  })
})
