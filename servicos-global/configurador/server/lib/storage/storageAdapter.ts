// server/lib/storage/storageAdapter.ts
// Abstração de storage para anexos. Hoje implementa filesystem local
// (Railway volume). Futuro: trocar para S3-compatible (R2/MinIO) sem
// alterar código consumidor — basta swap do adapter no factory.
//
// Tech-debt explícito (Líder Técnico, 2026-05-04): filesystem local
// não funciona em Railway multi-instance / scale. Migrar para S3 antes
// de ligar auto-scaling.

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

export interface StorageAdapter {
  /** Guarda o arquivo e devolve a chave (id de storage). */
  guardar(params: GuardarParams): Promise<{ chave: string; tamanho_bytes: number }>
  /** Devolve um stream/buffer/url assinada para download. */
  obterUrl(chave: string): Promise<string>
  /** Remove o arquivo (storage). Não é soft-delete — esse fica no DB. */
  remover(chave: string): Promise<void>
}

export interface GuardarParams {
  conteudo:        Buffer
  nome_original:   string
  mime:            string
  id_organizacao:  string
  id_fatura_produto_gravity: string
}

// ─── Filesystem adapter (default) ────────────────────────────────────────────

export class FilesystemStorageAdapter implements StorageAdapter {
  constructor(private readonly raiz: string) {}

  async guardar(params: GuardarParams) {
    const dir = path.join(this.raiz, params.id_organizacao, params.id_fatura_produto_gravity)
    await fs.mkdir(dir, { recursive: true })

    const ext = path.extname(params.nome_original) || ''
    const nomeUnico = `${randomUUID()}${ext}`
    const caminho = path.join(dir, nomeUnico)

    await fs.writeFile(caminho, params.conteudo)

    // Chave relativa à raiz — o adapter S3 futuro usa o mesmo formato como object key.
    const chave = path.join(params.id_organizacao, params.id_fatura_produto_gravity, nomeUnico).replace(/\\/g, '/')
    return { chave, tamanho_bytes: params.conteudo.byteLength }
  }

  async obterUrl(chave: string) {
    // Filesystem: devolve URL relativa ao próprio backend (rota /api/v1/faturas-produto-gravity/:id/documentos/:id/download).
    // S3 futuro: devolveria signed URL com TTL.
    return chave
  }

  async remover(chave: string) {
    const caminho = path.join(this.raiz, chave)
    try {
      await fs.unlink(caminho)
    } catch (err: unknown) {
      if ((err as { code?: string })?.code !== 'ENOENT') throw err
    }
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

let _instancia: StorageAdapter | null = null

export function getStorageAdapter(): StorageAdapter {
  if (_instancia) return _instancia
  const raiz = process.env.STORAGE_ANEXOS_FATURA_ROOT
    ?? path.resolve(process.cwd(), 'data/anexos-fatura')
  _instancia = new FilesystemStorageAdapter(raiz)
  return _instancia
}

export function __resetStorageAdapterCache() {
  _instancia = null
}
