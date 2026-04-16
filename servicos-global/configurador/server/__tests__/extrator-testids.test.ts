// server/__tests__/extrator-testids.test.ts
// Testes unitários para o extrator de data-testid

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { extractTestIds } from '../lib/extrator-testids.js'
import { existsSync, readFileSync } from 'fs'

// Mock fs para controlar o conteúdo dos arquivos
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>()
  return {
    ...actual,
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
  }
})

describe('extractTestIds', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('extrai testids simples de um componente', () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFileSync).mockReturnValue(`
      <div data-testid="container-principal">
        <input data-testid="input-nome" placeholder="Nome" />
        <button data-testid="btn-salvar" onClick={handleSave}>Salvar</button>
      </div>
    `)

    const result = extractTestIds('/fake/path.tsx')
    expect(result).toHaveLength(3)
    expect(result.map(r => r.id)).toEqual(['container-principal', 'input-nome', 'btn-salvar'])
  })

  it('infere tipo input para <input>', () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFileSync).mockReturnValue('<input data-testid="campo-email" type="email" />')

    const result = extractTestIds('/fake/path.tsx')
    expect(result[0].elemento).toBe('input')
  })

  it('infere tipo botao para <button>', () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFileSync).mockReturnValue('<button data-testid="btn-enviar" onClick={fn}>Enviar</button>')

    const result = extractTestIds('/fake/path.tsx')
    expect(result[0].elemento).toBe('botao')
  })

  it('infere tipo select para <Select>', () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFileSync).mockReturnValue('<Select data-testid="sel-tipo" opcoes={opcoes} />')

    const result = extractTestIds('/fake/path.tsx')
    expect(result[0].elemento).toBe('select')
  })

  it('infere tipo link para <a href>', () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFileSync).mockReturnValue('<a data-testid="link-home" href="/">Home</a>')

    const result = extractTestIds('/fake/path.tsx')
    expect(result[0].elemento).toBe('link')
  })

  it('infere tipo textarea para <textarea>', () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFileSync).mockReturnValue('<textarea data-testid="txt-descricao" />')

    const result = extractTestIds('/fake/path.tsx')
    expect(result[0].elemento).toBe('textarea')
  })

  it('infere tipo modal para Modal/Dialog', () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFileSync).mockReturnValue('<Modal data-testid="modal-confirmar" aberto={true} />')

    const result = extractTestIds('/fake/path.tsx')
    expect(result[0].elemento).toBe('modal')
  })

  it('retorna linhas corretas (1-indexed)', () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFileSync).mockReturnValue(
      'linha 1\n' +
      '<button data-testid="btn-a">A</button>\n' +
      'linha 3\n' +
      '<input data-testid="inp-b" />\n'
    )

    const result = extractTestIds('/fake/path.tsx')
    expect(result[0].linha).toBe(2)
    expect(result[1].linha).toBe(4)
  })

  it('não duplica testids repetidos', () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFileSync).mockReturnValue(
      '<button data-testid="btn-x">A</button>\n' +
      '<button data-testid="btn-x">B</button>\n'
    )

    const result = extractTestIds('/fake/path.tsx')
    expect(result).toHaveLength(1)
  })

  it('extrai testids com aspas simples', () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFileSync).mockReturnValue("<button data-testid='btn-single'>X</button>")

    const result = extractTestIds('/fake/path.tsx')
    expect(result[0].id).toBe('btn-single')
  })

  it('retorna array vazio para arquivo sem testids', () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFileSync).mockReturnValue('<div><span>Hello</span></div>')

    const result = extractTestIds('/fake/path.tsx')
    expect(result).toHaveLength(0)
  })

  it('lança erro se arquivo não existe', () => {
    vi.mocked(existsSync).mockReturnValue(false)

    expect(() => extractTestIds('/fake/nao-existe.tsx')).toThrow('Arquivo nao encontrado')
  })

  it('extrai múltiplos testids na mesma linha', () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFileSync).mockReturnValue(
      '<div data-testid="wrapper"><span data-testid="label">OK</span></div>'
    )

    const result = extractTestIds('/fake/path.tsx')
    expect(result).toHaveLength(2)
    expect(result.map(r => r.id)).toEqual(['wrapper', 'label'])
  })
})
