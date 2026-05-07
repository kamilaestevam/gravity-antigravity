// middleware/auth.ts
// Extrai tenant_id e user_id dos headers propagados pelo servidor de produto.
// O JWT foi validado pelo produto antes de chamar o servidor tenant.
// Versão compartilhada — usada pelo super-servidor.

import { Request, Response, NextFunction } from 'express'

// Nomenclatura legada do projeto: alguns clientes enviam `x-internal-key` /
// `INTERNAL_API_KEY`, outros usam `x-chave-interna-servico` / `CHAVE_INTERNA_SERVICO`.
// Aceita os dois nomes (header e env) ate a renomeacao ser uniformizada.
//
// IMPORTANTE: ler env DENTRO do middleware (nao no module load). ES modules
// hoist os imports — middleware carrega ANTES de dotenv.config() do index.ts,
// entao `process.env` esta vazio no module load.
function getInternalKey(): string {
  return process.env.INTERNAL_API_KEY ?? process.env.CHAVE_INTERNA_SERVICO ?? ''
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Rotas inter-serviço (admin, S2S) passam com chave interna — sem tenant_id
  const internalKey =
    (req.headers['x-internal-key']           as string | undefined) ??
    (req.headers['x-chave-interna-servico']  as string | undefined)
  const expected = getInternalKey()
  if (expected && internalKey === expected) {
    req.auth = { id_organizacao: '__internal__', id_usuario: 'system' }
    return next()
  }

  const tenantId = req.headers['x-id-organizacao'] as string | undefined
  const userId   = req.headers['x-id-usuario']   as string | undefined

  if (!tenantId) {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'x-id-organizacao obrigatório' },
    })
    return
  }

  req.auth = { id_organizacao: tenantId, id_usuario: userId ?? '' }
  next()
}
