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
  buffer: Buffer
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
  arquivo: { nome: string; mimeType: string; buffer: Buffer },
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
    buffer: arquivo.buffer,
  })
  registro.totalFiles = registro.arquivos.length
  return fileReferenceId
}

export function obterArquivoMockLegado(
  idLeitura: string,
  idArquivo: string,
): { buffer: Buffer; contentType: string; nomeArquivo: string } {
  const registro = leituras.get(idLeitura)
  if (!registro) {
    throw new Error(`Leitura mock ${idLeitura} não encontrada`)
  }
  const arquivo = registro.arquivos.find((item) => item.fileReferenceId === idArquivo)
  if (!arquivo) {
    throw new Error(`Arquivo mock ${idArquivo} não encontrado`)
  }
  return {
    buffer: arquivo.buffer,
    contentType: arquivo.mimeType || 'application/octet-stream',
    nomeArquivo: arquivo.filename,
  }
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

type TarefaDownloadMock = {
  idLeitura: string
  fileReferenceIds: string[]
  criadoEm: number
}

const tarefasDownload = new Map<string, TarefaDownloadMock>()

function gerarZipMinimoMock(nomeInterno: string, conteudo: string): Buffer {
  const enc = new TextEncoder()
  const nomeBytes = enc.encode(nomeInterno)
  const dados = enc.encode(conteudo)
  const lh = Buffer.alloc(30)
  lh.writeUInt32LE(0x04034b50, 0)
  lh.writeUInt16LE(20, 4)
  lh.writeUInt16LE(0, 6)
  lh.writeUInt16LE(0, 8)
  lh.writeUInt16LE(0, 10)
  lh.writeUInt16LE(0, 12)
  lh.writeUInt32LE(0, 14)
  lh.writeUInt32LE(dados.length, 18)
  lh.writeUInt32LE(dados.length, 22)
  lh.writeUInt16LE(nomeBytes.length, 26)
  lh.writeUInt16LE(0, 28)
  const eocd = Buffer.alloc(22)
  eocd.writeUInt32LE(0x06054b50, 0)
  eocd.writeUInt16LE(0, 4)
  eocd.writeUInt16LE(0, 6)
  eocd.writeUInt16LE(1, 8)
  eocd.writeUInt16LE(1, 10)
  eocd.writeUInt32LE(46 + nomeBytes.length + dados.length, 12)
  eocd.writeUInt32LE(30 + nomeBytes.length + dados.length, 16)
  eocd.writeUInt16LE(0, 20)
  const central = Buffer.alloc(46)
  central.writeUInt32LE(0x02014b50, 0)
  central.writeUInt16LE(20, 4)
  central.writeUInt16LE(20, 6)
  central.writeUInt16LE(0, 8)
  central.writeUInt16LE(0, 10)
  central.writeUInt16LE(0, 12)
  central.writeUInt32LE(0, 16)
  central.writeUInt32LE(dados.length, 20)
  central.writeUInt32LE(dados.length, 24)
  central.writeUInt16LE(nomeBytes.length, 28)
  central.writeUInt32LE(0, 38)
  central.writeUInt32LE(0, 42)
  return Buffer.concat([lh, Buffer.from(nomeBytes), dados, central, Buffer.from(nomeBytes), eocd])
}

const DELAY_EXPORT_MS = 1500

export function criarTarefaDownloadMockLegado(
  idLeitura: string,
  fileReferenceIds: string[],
): { id_tarefa: string; status: string } {
  const id_tarefa = `mock-dl-${randomUUID()}`
  tarefasDownload.set(id_tarefa, {
    idLeitura,
    fileReferenceIds,
    criadoEm: Date.now(),
  })
  return { id_tarefa, status: 'CREATED' }
}

export function obterTarefaDownloadMockLegado(taskId: string): {
  taskId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  downloadUrl?: string
  message?: string
} {
  const tarefa = tarefasDownload.get(taskId)
  if (!tarefa) {
    throw new Error(`Tarefa download mock ${taskId} nao encontrada`)
  }
  const pronto = Date.now() - tarefa.criadoEm >= DELAY_EXPORT_MS
  return {
    taskId,
    status: pronto ? 'completed' : 'processing',
    downloadUrl: pronto ? `mock://export/${taskId}` : undefined,
  }
}

export function obterZipTarefaDownloadMockLegado(taskId: string): Buffer {
  const tarefa = tarefasDownload.get(taskId)
  if (!tarefa) {
    throw new Error(`Tarefa download mock ${taskId} nao encontrada`)
  }
  const linhas = [
    'Gravity Smart Read — export mock (dev)',
    `leitura=${tarefa.idLeitura}`,
    `arquivos=${tarefa.fileReferenceIds.join(',')}`,
  ]
  return gerarZipMinimoMock('export-mock.txt', linhas.join('\n'))
}
