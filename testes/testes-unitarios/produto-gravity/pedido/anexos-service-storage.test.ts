import fs from 'fs'
import os from 'os'
import path from 'path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  arquivoExiste,
  lerArquivoLocal,
  removerArquivoLocal,
  salvarArquivoLocal,
} from '../../../../servicos-global/produto/pedido/server/src/services/anexosService'

describe('anexosService — storage local', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pedido-anexos-test-'))
    process.env.PEDIDO_ANEXOS_UPLOAD_DIR = tmpDir
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
    delete process.env.PEDIDO_ANEXOS_UPLOAD_DIR
  })

  it('salva, detecta existência e lê o arquivo', () => {
    const key = 'org1/ped1/uuid_doc.pdf'
    const buf = Buffer.from('conteudo-teste')
    salvarArquivoLocal(buf, key)
    expect(arquivoExiste(key)).toBe(true)
    expect(lerArquivoLocal(key).toString()).toBe('conteudo-teste')
  })

  it('remove arquivo do diretório primário', () => {
    const key = 'org1/ped1/uuid_doc.pdf'
    salvarArquivoLocal(Buffer.from('x'), key)
    removerArquivoLocal(key)
    expect(arquivoExiste(key)).toBe(false)
  })
})
