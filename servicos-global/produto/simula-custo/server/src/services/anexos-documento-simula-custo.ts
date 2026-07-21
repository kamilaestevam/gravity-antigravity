/**
 * Armazenamento local de anexos de documento (dev/staging).
 * Prod: SIMULA_CUSTO_ANEXOS_UPLOAD_DIR ou data/simula-custo-anexos.
 */
import fs from 'node:fs'
import path from 'node:path'

export const LIMITE_BYTES_ARQUIVO = 25 * 1024 * 1024
export const LIMITE_BYTES_TOTAL_DOCUMENTO = 100 * 1024 * 1024
export const LIMITE_ARQUIVOS_DOCUMENTO = 20

export const EXTENSOES_PERMITIDAS = new Set([
  'pdf', 'docx', 'doc', 'xlsx', 'xls', 'csv',
  'png', 'jpg', 'jpeg', 'tiff', 'gif',
  'zip', 'rar', 'txt', 'xml', 'json',
])

function resolverUploadsRoot(): string {
  const fromEnv = process.env.SIMULA_CUSTO_ANEXOS_UPLOAD_DIR?.trim()
  if (fromEnv) return path.resolve(fromEnv)
  return path.resolve(process.cwd(), 'data', 'simula-custo-anexos')
}

export function validarExtensaoAnexoDocumentoSimulaCusto(nomeArquivo: string): boolean {
  const ext = nomeArquivo.split('.').pop()?.toLowerCase() ?? ''
  return EXTENSOES_PERMITIDAS.has(ext)
}

export function resolverChaveStorageAnexoDocumentoSimulaCusto(
  idOrganizacao: string,
  idDocumento: string,
  idAnexo: string,
  nomeArquivo: string,
): string {
  const nomeSeguro = nomeArquivo.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `${idOrganizacao}/${idDocumento}/${idAnexo}_${nomeSeguro}`
}

function resolverCaminhoFisico(chaveStorage: string): string {
  return path.join(resolverUploadsRoot(), chaveStorage)
}

function garantirDiretorio(caminhoFisico: string): void {
  fs.mkdirSync(path.dirname(caminhoFisico), { recursive: true })
}

export function salvarAnexoDocumentoSimulaCusto(buffer: Buffer, chaveStorage: string): void {
  const caminho = resolverCaminhoFisico(chaveStorage)
  garantirDiretorio(caminho)
  fs.writeFileSync(caminho, buffer)
}

export function removerAnexoDocumentoSimulaCusto(chaveStorage: string): void {
  const caminho = resolverCaminhoFisico(chaveStorage)
  if (fs.existsSync(caminho)) fs.unlinkSync(caminho)
}

export function lerAnexoDocumentoSimulaCusto(chaveStorage: string): Buffer {
  return fs.readFileSync(resolverCaminhoFisico(chaveStorage))
}

export function anexoDocumentoSimulaCustoExiste(chaveStorage: string): boolean {
  return fs.existsSync(resolverCaminhoFisico(chaveStorage))
}
