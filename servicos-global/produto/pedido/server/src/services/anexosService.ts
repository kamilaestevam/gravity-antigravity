/**
 * anexosService.ts — Lógica de negócio para Anexos do Pedido
 *
 * Regras de negócio:
 *   - Máximo 25MB por arquivo
 *   - Máximo 200MB total por pedido
 *   - Máximo 50 arquivos por pedido
 *   - Armazenamento local (dev: server/uploads; prod: PEDIDO_ANEXOS_UPLOAD_DIR ou data/pedido-anexos)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Legado — uploads antes de PEDIDO_ANEXOS_UPLOAD_DIR (sidecar src/services → server/uploads). */
const UPLOADS_ROOT_LEGADO = path.resolve(__dirname, '..', '..', 'uploads')

function resolverUploadsRoot(): string {
  const fromEnv = process.env.PEDIDO_ANEXOS_UPLOAD_DIR?.trim()
  if (fromEnv) return path.resolve(fromEnv)
  return path.resolve(process.cwd(), 'data', 'pedido-anexos')
}

export const LIMITE_BYTES_ARQUIVO = 25 * 1024 * 1024        // 25 MB
export const LIMITE_BYTES_TOTAL_PEDIDO = 200 * 1024 * 1024  // 200 MB
export const LIMITE_ARQUIVOS_PEDIDO = 50

export const EXTENSOES_PERMITIDAS = new Set([
  'pdf', 'docx', 'doc', 'xlsx', 'xls', 'csv',
  'png', 'jpg', 'jpeg', 'tiff', 'gif',
  'zip', 'rar', 'txt', 'xml', 'json',
])

export function validarExtensao(nomeArquivo: string): boolean {
  const ext = nomeArquivo.split('.').pop()?.toLowerCase() ?? ''
  return EXTENSOES_PERMITIDAS.has(ext)
}

export function obterExtensao(nomeArquivo: string): string {
  return nomeArquivo.split('.').pop()?.toLowerCase() ?? ''
}

export function resolverStorageKey(tenantId: string, vinculoId: string, uuid: string, nomeArquivo: string): string {
  const nomeSeguro = nomeArquivo.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `${tenantId}/${vinculoId}/${uuid}_${nomeSeguro}`
}

/** Resolve caminho físico — primário (data/pedido-anexos) com fallback legado (server/uploads). */
export function resolverCaminhoFisico(storageKey: string): string {
  const primario = path.join(resolverUploadsRoot(), storageKey)
  if (fs.existsSync(primario)) return primario
  const legado = path.join(UPLOADS_ROOT_LEGADO, storageKey)
  if (fs.existsSync(legado)) return legado
  return primario
}

export function garantirDiretorio(caminhoFisico: string): void {
  const dir = path.dirname(caminhoFisico)
  fs.mkdirSync(dir, { recursive: true })
}

export function salvarArquivoLocal(buffer: Buffer, storageKey: string): void {
  const caminhoFisico = path.join(resolverUploadsRoot(), storageKey)
  garantirDiretorio(caminhoFisico)
  fs.writeFileSync(caminhoFisico, buffer)
}

export function removerArquivoLocal(storageKey: string): void {
  for (const base of [resolverUploadsRoot(), UPLOADS_ROOT_LEGADO]) {
    const caminhoFisico = path.join(base, storageKey)
    if (fs.existsSync(caminhoFisico)) {
      fs.unlinkSync(caminhoFisico)
    }
  }
}

export function lerArquivoLocal(storageKey: string): Buffer {
  const caminhoFisico = resolverCaminhoFisico(storageKey)
  return fs.readFileSync(caminhoFisico)
}

export function arquivoExiste(storageKey: string): boolean {
  const primario = path.join(resolverUploadsRoot(), storageKey)
  if (fs.existsSync(primario)) return true
  return fs.existsSync(path.join(UPLOADS_ROOT_LEGADO, storageKey))
}
