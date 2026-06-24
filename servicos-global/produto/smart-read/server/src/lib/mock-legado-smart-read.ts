/**
 * mock-legado-smart-read.ts — Simula o Smart Read legado em dev (sem URL/chave QA).
 * Ativado por SMART_READ_MOCK_LEGADO=1 ou automaticamente quando legado não está configurado.
 */

import { randomUUID } from 'node:crypto'
import type { LeituraLegado } from '../schemas/leitura-smart-read.js'

const DELAY_MS = 3500

type ArquivoMock = {
  fileReferenceId: string
  filename: string
  mimeType: string
  enviadoEm: number
}

type LeituraMock = {
  _id: string
  name: string
  status: string
  totalFiles: number
  processedFiles: number
  createdAt: string
  completedAt: string | null
  arquivos: ArquivoMock[]
}

const leituras = new Map<string, LeituraMock>()

function inferirTiposDocumento(nomeArquivo: string): string[] {
  const nome = nomeArquivo.toLowerCase()
  if (nome.includes('bl')) return ['Bill of Lading']
  if (nome.includes('invoice') || nome.includes('inv')) return ['Invoice']
  if (nome.includes('pack')) return ['Packing List']
  if (nome.includes('awb')) return ['AWB']
  return ['Bill of Lading', 'Invoice']
}

function montarLeituraLegado(registro: LeituraMock): LeituraLegado {
  const agora = Date.now()
  const arquivosProcessados = registro.arquivos.filter(
    (arquivo) => agora - arquivo.enviadoEm >= DELAY_MS,
  ).length
  const todosConcluidos =
    registro.arquivos.length > 0 && arquivosProcessados === registro.arquivos.length

  return {
    _id: registro._id,
    name: registro.name,
    status: todosConcluidos ? 'completed_ai' : 'processing',
    totalFiles: registro.arquivos.length,
    processedFiles: arquivosProcessados,
    createdAt: registro.createdAt,
    completedAt: todosConcluidos ? new Date().toISOString() : null,
    files: registro.arquivos.map((arquivo) => {
      const concluido = agora - arquivo.enviadoEm >= DELAY_MS
      const tipos = inferirTiposDocumento(arquivo.filename)
      return {
        fileReferenceId: arquivo.fileReferenceId,
        filename: arquivo.filename,
        mimeType: arquivo.mimeType,
        processingStatus: concluido ? 'completed' : 'processing',
        processingTimeMs: concluido ? agora - arquivo.enviadoEm : undefined,
        processingResult: concluido
          ? tipos.map((tipo, indice) => ({
              id: `${arquivo.fileReferenceId}-${indice}`,
              fileType: tipo,
              data: { accuracy: 0.9 + indice * 0.02, origem: 'mock-dev' },
            }))
          : undefined,
      }
    }),
  }
}

export function criarLeituraMockLegado(): string {
  const id = `mock-${randomUUID()}`
  leituras.set(id, {
    _id: id,
    name: `Leitura ${leituras.size + 228}`,
    status: 'processing',
    totalFiles: 0,
    processedFiles: 0,
    createdAt: new Date().toISOString(),
    completedAt: null,
    arquivos: [],
  })
  return id
}

export function enviarArquivoMockLegado(
  idLeitura: string,
  arquivo: { nome: string; mimeType: string },
): string {
  const registro = leituras.get(idLeitura)
  if (!registro) {
    throw new Error(`Leitura mock ${idLeitura} não encontrada`)
  }
  const fileReferenceId = `mock-arq-${randomUUID()}`
  registro.arquivos.push({
    fileReferenceId,
    filename: arquivo.nome,
    mimeType: arquivo.mimeType,
    enviadoEm: Date.now(),
  })
  registro.totalFiles = registro.arquivos.length
  return fileReferenceId
}

export function obterLeituraMockLegado(idLeitura: string): LeituraLegado {
  const registro = leituras.get(idLeitura)
  if (!registro) {
    throw new Error(`Leitura mock ${idLeitura} não encontrada`)
  }
  return montarLeituraLegado(registro)
}

export function listarLeiturasMockLegado(params: {
  pagina: number
  limite: number
  termo_busca?: string
}): { items: LeituraLegado[]; total: number } {
  const termo = params.termo_busca?.trim().toLowerCase()
  const todos = [...leituras.values()]
    .map(montarLeituraLegado)
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
  const filtrados = termo
    ? todos.filter((item) => (item.name ?? item._id).toLowerCase().includes(termo))
    : todos
  const inicio = (params.pagina - 1) * params.limite
  const fatia = filtrados.slice(inicio, inicio + params.limite)
  return { items: fatia, total: filtrados.length }
}
