/**
 * Servir PNGs EMT — monorepo (dev) + data/emt-artifacts (produção persistente).
 */
import { existsSync, createReadStream } from 'node:fs'
import { resolve } from 'node:path'
import type { Request, Response, NextFunction } from 'express'
import { dirArtefatosEmtPersistente, isCaminhoRelPrintEmtPermitido } from './emt-artifacts.js'
import { raizRepositorioGravity } from './raiz-repositorio-gravity.js'

function resolverAbsPrintEmt(rel: string): string | null {
  if (!isCaminhoRelPrintEmtPermitido(rel)) return null

  const candidatos = rel.startsWith('data/emt-artifacts/')
    ? [resolve(dirArtefatosEmtPersistente(), rel.slice('data/emt-artifacts/'.length))]
    : [
        resolve(raizRepositorioGravity, rel),
        resolve(dirArtefatosEmtPersistente(), rel),
      ]

  for (const abs of candidatos) {
    if (existsSync(abs)) return abs
  }
  return null
}

/** Middleware GET/HEAD — mesmo contrato do Vite /dev-emt-artifacts. */
export function middlewareServirPrintEmt(req: Request, res: Response, next: NextFunction): void {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    next()
    return
  }

  const raw = decodeURIComponent((req.url ?? '').split('?')[0].replace(/^\//, ''))
  const rel = raw.replace(/\\/g, '/')
  if (!rel.endsWith('.png') || rel.includes('..')) {
    res.status(403).end('Forbidden')
    return
  }

  const abs = resolverAbsPrintEmt(rel)
  if (!abs) {
    res.status(404).end('Not found')
    return
  }

  res.setHeader('Content-Type', 'image/png')
  res.setHeader('Cache-Control', 'private, max-age=3600')
  if (req.method === 'HEAD') {
    res.status(200).end()
    return
  }
  createReadStream(abs).pipe(res)
}
