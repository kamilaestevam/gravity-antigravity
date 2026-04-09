# Fix: Download de template-importacao-pedidos.xlsx bloqueado por middleware de auth

**Data:** 2026-04-09
**Produto:** pedido
**Severidade:** Alta — funcionalidade de importação inacessível para o usuário

---

## Problema

O download de `template-importacao-pedidos.xlsx` a partir do link `<a href="/api/v1/pedidos/smart-import/template" download>` em `EtapaUpload.tsx:178` falhava com a mensagem **"O arquivo não estava disponível no site"**.

## Causa Raiz

O endpoint `GET /api/v1/pedidos/smart-import/template` estava protegido por dois middlewares que o browser não consegue satisfazer em um download direto via `<a href download>`:

1. **`requireInternalKey`** — exige header `x-internal-key` (chamadas S2S)
2. **`tenantIsolationMiddleware`** — exige header `x-tenant-id`

O browser não envia headers customizados em downloads `<a href download>`, portanto ambos os middlewares retornavam 401/400 antes de chegar ao handler do arquivo.

## Arquivos Alterados

### `produto/pedido/server/src/middleware/requireInternalKey.ts`

Adicionado `/api/v1/pedidos/smart-import/template` ao array `PUBLIC_PATHS`:

```ts
const PUBLIC_PATHS = [
  '/health',
  '/api/v1/analytics/pedido',
  '/api/v1/taxa-cambio',
  '/api/v1/pedidos/smart-import/template', // Download público — browser não envia x-internal-key
]
```

### `produto/pedido/server/src/middleware/tenantIsolation.ts`

Adicionado array `TENANT_PUBLIC_PATHS` e verificação de path público no início de `tenantIsolationMiddleware`:

```ts
const TENANT_PUBLIC_PATHS = [
  '/api/v1/pedidos/smart-import/template', // Download público — browser não envia x-tenant-id
]

export function tenantIsolationMiddleware(req, res, next) {
  const isPublic = TENANT_PUBLIC_PATHS.some(p => req.path === p || req.path.startsWith(p + '/'))
  if (isPublic) return next()
  // ... lógica original
}
```

## Validação

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8026/api/v1/pedidos/smart-import/template
# Resultado: 200
```

Nodemon recarregou automaticamente após os saves. Nenhum restart manual foi necessário.

## Impacto e Segurança

- O endpoint de template retorna apenas um arquivo `.xlsx` estático sem dados de tenant — isenção é segura.
- Nenhum dado sensível exposto: o template é genérico, sem linhas de dados reais.
- Os demais endpoints permanecem protegidos pelos dois middlewares.
- Nenhum outro arquivo foi modificado.
