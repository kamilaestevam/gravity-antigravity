import { describe, it, expect } from 'vitest'
import crypto from 'crypto'

// Replicar as funcoes de chunking do ingest.ts para testar isoladamente
// (ingest.ts e um script CLI, nao um modulo importavel)

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

function sha256(text: string): string {
  return crypto.createHash('sha256').update(text, 'utf-8').digest('hex')
}

interface KbChunk {
  hash_conteudo: string
  conteudo: string
  segmento: string
  titulo_secao: string
  nivel: number
  tokens: number
  ordem: number
}

const MAX_CHUNK_TOKENS = 800

function chunkByMarkdownHeaders(text: string, segmento: string): KbChunk[] {
  const chunks: KbChunk[] = []
  const lines = text.split('\n')

  let currentTitle = segmento
  let currentLevel = 1
  let currentContent: string[] = []
  let ordem = 0

  function flushChunk() {
    const content = currentContent.join('\n').trim()
    if (!content || content.length < 20) return

    const tokens = estimateTokens(content)
    if (tokens > MAX_CHUNK_TOKENS) {
      const subChunks = splitLargeChunk(content, currentTitle, currentLevel, segmento, ordem)
      chunks.push(...subChunks)
      ordem += subChunks.length
    } else {
      chunks.push({
        hash_conteudo: sha256(content),
        conteudo: content,
        segmento,
        titulo_secao: currentTitle,
        nivel: currentLevel,
        tokens,
        ordem: ordem++,
      })
    }
    currentContent = []
  }

  for (const line of lines) {
    const headerMatch = line.match(/^(#{1,4})\s+(.+)/)
    if (headerMatch) {
      flushChunk()
      currentLevel = headerMatch[1].length
      currentTitle = headerMatch[2].trim()
      currentContent.push(line)
    } else {
      currentContent.push(line)
    }
  }
  flushChunk()

  return chunks
}

function splitLargeChunk(
  content: string,
  title: string,
  level: number,
  segmento: string,
  startOrdem: number,
): KbChunk[] {
  const paragraphs = content.split(/\n\n+/)
  const results: KbChunk[] = []
  let buffer: string[] = []
  let bufferTokens = 0
  let subOrdem = startOrdem

  for (const para of paragraphs) {
    const paraTokens = estimateTokens(para)
    if (bufferTokens + paraTokens > MAX_CHUNK_TOKENS && buffer.length > 0) {
      const text = buffer.join('\n\n').trim()
      results.push({
        hash_conteudo: sha256(text),
        conteudo: text,
        segmento,
        titulo_secao: title,
        nivel: level,
        tokens: estimateTokens(text),
        ordem: subOrdem++,
      })
      buffer = []
      bufferTokens = 0
    }
    buffer.push(para)
    bufferTokens += paraTokens
  }

  if (buffer.length > 0) {
    const text = buffer.join('\n\n').trim()
    results.push({
      hash_conteudo: sha256(text),
      conteudo: text,
      segmento,
      titulo_secao: title,
      nivel: level,
      tokens: estimateTokens(text),
      ordem: subOrdem++,
    })
  }

  return results
}

describe('estimateTokens', () => {
  it('estima ~4 chars por token', () => {
    expect(estimateTokens('abcd')).toBe(1)
    expect(estimateTokens('abcde')).toBe(2)
    expect(estimateTokens('')).toBe(0)
  })

  it('arredonda para cima', () => {
    expect(estimateTokens('ab')).toBe(1)
    expect(estimateTokens('abc')).toBe(1)
  })
})

describe('sha256', () => {
  it('gera hash deterministico', () => {
    const h1 = sha256('hello')
    const h2 = sha256('hello')
    expect(h1).toBe(h2)
    expect(h1).toHaveLength(64)
  })

  it('hashes diferentes para conteudos diferentes', () => {
    expect(sha256('a')).not.toBe(sha256('b'))
  })
})

describe('chunkByMarkdownHeaders', () => {
  it('cria chunk por secao markdown', () => {
    const md = `# Titulo Principal
Conteudo da secao principal com texto suficiente.

## Sub-secao A
Conteudo da sub-secao A com texto suficiente para gerar chunk.

## Sub-secao B
Conteudo da sub-secao B com texto suficiente para gerar chunk.`

    const chunks = chunkByMarkdownHeaders(md, 'teste')
    expect(chunks.length).toBeGreaterThanOrEqual(2)
    expect(chunks[0].segmento).toBe('teste')
    expect(chunks[0].titulo_secao).toBe('Titulo Principal')
    expect(chunks[0].nivel).toBe(1)
  })

  it('preserva ordem crescente', () => {
    const md = `# A
Conteudo A suficiente para gerar.

## B
Conteudo B suficiente para gerar.

## C
Conteudo C suficiente para gerar.`

    const chunks = chunkByMarkdownHeaders(md, 'seg')
    for (let i = 1; i < chunks.length; i++) {
      expect(chunks[i].ordem).toBeGreaterThan(chunks[i - 1].ordem)
    }
  })

  it('ignora conteudo muito curto (< 20 chars)', () => {
    const md = `# Titulo
abc`
    const chunks = chunkByMarkdownHeaders(md, 'seg')
    expect(chunks).toHaveLength(0)
  })

  it('split chunks grandes em sub-chunks quando ha paragrafos', () => {
    const para1 = 'A'.repeat(2000)
    const para2 = 'B'.repeat(2000)
    const md = `# Titulo Grande\n${para1}\n\n${para2}`

    const chunks = chunkByMarkdownHeaders(md, 'seg')
    expect(chunks.length).toBeGreaterThanOrEqual(2)
    for (const chunk of chunks) {
      expect(chunk.tokens).toBeLessThanOrEqual(MAX_CHUNK_TOKENS + 10)
    }
  })

  it('mantem paragrafo unico grande como chunk unico (sem split possivel)', () => {
    const longParagraph = 'x'.repeat(4000)
    const md = `# Titulo Grande\n${longParagraph}`

    const chunks = chunkByMarkdownHeaders(md, 'seg')
    expect(chunks.length).toBeGreaterThanOrEqual(1)
  })

  it('hash e unico por conteudo', () => {
    const md = `# A
Conteudo unico da secao A para teste.

## B
Conteudo unico da secao B para teste.`

    const chunks = chunkByMarkdownHeaders(md, 'seg')
    const hashes = chunks.map(c => c.hash_conteudo)
    expect(new Set(hashes).size).toBe(hashes.length)
  })

  it('detecta niveis de header corretos (h1, h2, h3, h4)', () => {
    const md = `# H1
Conteudo H1 com tamanho suficiente.

## H2
Conteudo H2 com tamanho suficiente.

### H3
Conteudo H3 com tamanho suficiente.

#### H4
Conteudo H4 com tamanho suficiente.`

    const chunks = chunkByMarkdownHeaders(md, 'seg')
    const niveis = chunks.map(c => c.nivel)
    expect(niveis).toContain(1)
    expect(niveis).toContain(2)
    expect(niveis).toContain(3)
    expect(niveis).toContain(4)
  })
})

describe('splitLargeChunk', () => {
  it('nao divide se cabe em MAX_CHUNK_TOKENS', () => {
    const content = 'Paragrafo curto suficiente para testar.'
    const result = splitLargeChunk(content, 'titulo', 1, 'seg', 0)
    expect(result).toHaveLength(1)
    expect(result[0].conteudo).toBe(content)
  })

  it('divide em multiplos chunks quando excede limite', () => {
    const para1 = 'A'.repeat(2000)
    const para2 = 'B'.repeat(2000)
    const content = `${para1}\n\n${para2}`

    const result = splitLargeChunk(content, 'titulo', 2, 'seg', 0)
    expect(result.length).toBeGreaterThanOrEqual(2)
  })
})
