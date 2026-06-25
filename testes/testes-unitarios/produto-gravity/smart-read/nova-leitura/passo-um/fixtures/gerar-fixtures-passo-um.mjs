/**
 * Gera arquivos de amostra para os 8 formatos aceitos no Passo 01 Nova Leitura.
 * Uso: node testes/testes-unitarios/produto-gravity/smart-read/nova-leitura/passo-um/fixtures/gerar-fixtures-passo-um.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dir, 'amostras')
mkdirSync(OUT, { recursive: true })

/** PNG 1x1 transparente */
const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

/** JPEG mínimo válido */
const JPEG_MIN = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  'base64',
)

const ARQUIVOS = [
  { nome: 'amostra.pdf', conteudo: Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n') },
  { nome: 'amostra.jpg', conteudo: JPEG_MIN },
  { nome: 'amostra.jpeg', conteudo: JPEG_MIN },
  { nome: 'amostra.png', conteudo: PNG_1X1 },
  { nome: 'amostra.xml', conteudo: '<?xml version="1.0" encoding="UTF-8"?><documento><tipo>BL</tipo></documento>' },
  { nome: 'amostra.csv', conteudo: 'coluna_a,coluna_b\nvalor1,valor2\n' },
  { nome: 'amostra.xls', conteudo: Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0, 0, 0, 0]) },
  { nome: 'amostra.xlsx', conteudo: Buffer.from('PK\x03\x04\x14\x00\x00\x00\x08\x00') },
]

for (const { nome, conteudo } of ARQUIVOS) {
  writeFileSync(join(OUT, nome), conteudo)
  console.log(`✓ ${nome}`)
}

console.log(`\nFixtures em: ${OUT}`)
