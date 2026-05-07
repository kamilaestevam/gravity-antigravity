# Mapeamento DDD — Configurador (estado atual vs alvo)

**Total:** 640 hits em 59 arquivos

## Renomeações concluídas (registro manual — sweep ainda não regerado)

| Data | De | Para |
|---|---|---|
| 2026-05-04 | `server/services/permissionsService.ts` | `server/services/permissao-usuario-servico.ts` |
| 2026-05-04 | export `permissionsService` | export `servicoPermissaoUsuario` |
| 2026-05-04 | `setPermissions(...)` | `configurarPermissoes(...)` |
| 2026-05-04 | `checkPermission(...)` | `verificarPermissao(...)` |
| 2026-05-04 | `getUserPermissions(...)` | `listarPermissoesUsuario(...)` |
| 2026-05-04 | função `temBypassPermissao` extraída para `shared/permissao-bypass.ts` (back+front importam do mesmo lugar — Mand. 04 + 07) |

> Linhas legadas referenciando `permissionsService.ts` abaixo neste documento estão **obsoletas** — manter por contexto histórico até o sweep ser regerado.



Gerado por sweep automatico. Cada linha mostra:

- **Como esta** (linha atual no arquivo)
- **Como deve ficar** (transformacao DDD aplicada palavra-a-palavra)

**ATENCAO**: a coluna 'Como deve ficar' e SUGESTAO automatica. Refactor real exige analise de contexto (alguns casos sao DTO publico que nao devem mudar sem deploy coordenado).

---

## Resumo por categoria

| Categoria | Hits | Risco refactor |
|---|---:|---|
| OBJ_KEY | 209 | Critico — DTO publico |
| CODE_OTHER | 149 | Variavel |
| AUTH_CONTEXT | 140 | Alto — cascata em ~150 routes |
| TS_TYPE_OR_VAR | 53 | Medio — locais |
| COMMENT | 23 | Zero — quick win |
| CACHE_KEY | 22 | Baixo — invalida cache |
| PROP_ACCESS | 19 | Alto — onde sao consumidos |
| PRISMA_QUERY | 11 | Depende de DB-2 |
| HTTP_HEADER | 6 | Critico — coordenacao deploy |
| STRING | 6 | Baixo — strings tecnicas |
| API_CALL | 2 | Critico — quebra clientes |

---

## Mapeamento por arquivo


### `configurador/prisma/schema.prisma` (5 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 65 | COMMENT | `tenant_id` | `// tenant_id = id do próprio registro (self-referencing por convenção).` | `// id_organizacao = id do próprio registro (self-referencing por convenção).` |
| 104 | COMMENT | `tenant_id` | `// tenant_id é obrigatório — nunca nullable.` | `// id_organizacao é obrigatório — nunca nullable.` |
| 142 | COMMENT | `tenant_id` | `// tenant_id é obrigatório — nunca nullable.` | `// id_organizacao é obrigatório — nunca nullable.` |
| 634 | COMMENT | `tenant_id` | `// Tabela global — sem tenant_id (rates são públicas, iguais para todos).` | `// Tabela global — sem id_organizacao (rates são públicas, iguais para todos).` |
| 681 | CODE_OTHER | `userId` | `  disparado_por_testes  String? // userId que disparou (manual) ou "cron" (automático)` | `  disparado_por_testes  String? // id_usuario que disparou (manual) ou "cron" (automático)` |

### `servicos-global/configurador/docs/BILLING.md` (1 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 166 | PROP_ACCESS | `tenant_id` | `\| `customer.tenant_id` \| `cliente.id` (Conta Azul Cliente) \|` | `\| `customer.id_organizacao` \| `cliente.id` (Conta Azul Cliente) \|` |

### `servicos-global/configurador/server/__tests__/apiCockpitGabi.test.ts` (2 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 26 | OBJ_KEY | `userId` | `  userId: 'admin-001',` | `  id_usuario: 'admin-001',` |
| 28 | OBJ_KEY | `tenantId` | `  tenantId: 'tenant-001',` | `  id_organizacao: 'tenant-001',` |

### `servicos-global/configurador/server/__tests__/hubInit.test.ts` (7 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 57 | OBJ_KEY | `userId` | `  userId: 'user-001',` | `  id_usuario: 'user-001',` |
| 59 | OBJ_KEY | `tenantId` | `  tenantId: 'tenant-001',` | `  id_organizacao: 'tenant-001',` |
| 197 | CODE_OTHER | `tenant_id` | `  it('filtra productConfig por tenant_id (tenant isolation)', async () => {` | `  it('filtra productConfig por id_organizacao (tenant isolation)', async () => {` |
| 207 | OBJ_KEY | `tenantId` | `    authOverride = { userId: 'user-999', clerkUserId: 'clerk_999', tenantId: 'tenant-999', role: 'ADMIN' }` | `    authOverride = { userId: 'user-999', clerkUserId: 'clerk_999', id_organizacao: 'tenant-999', role: 'ADMIN' }` |
| 207 | OBJ_KEY | `userId` | `    authOverride = { userId: 'user-999', clerkUserId: 'clerk_999', tenantId: 'tenant-999', role: 'ADMIN' }` | `    authOverride = { id_usuario: 'user-999', clerkUserId: 'clerk_999', tenantId: 'tenant-999', role: 'ADMIN' }` |
| 306 | OBJ_KEY | `tenantId` | `    authOverride = { userId: 'user-supplier', clerkUserId: 'clerk_s', tenantId: 'tenant-001', role: 'FORNECEDOR' }` | `    authOverride = { userId: 'user-supplier', clerkUserId: 'clerk_s', id_organizacao: 'tenant-001', role: 'FORNECEDOR' }` |
| 306 | OBJ_KEY | `userId` | `    authOverride = { userId: 'user-supplier', clerkUserId: 'clerk_s', tenantId: 'tenant-001', role: 'FORNECEDOR' }` | `    authOverride = { id_usuario: 'user-supplier', clerkUserId: 'clerk_s', tenantId: 'tenant-001', role: 'FORNECEDOR' }` |

### `servicos-global/configurador/server/__tests__/hubInsights.test.ts` (8 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 44 | OBJ_KEY | `userId` | `  userId: 'user-001',` | `  id_usuario: 'user-001',` |
| 46 | OBJ_KEY | `tenantId` | `  tenantId: 'tenant-001',` | `  id_organizacao: 'tenant-001',` |
| 156 | CODE_OTHER | `tenant_id` | `  it('filtra productConfig por tenant_id (tenant isolation)', async () => {` | `  it('filtra productConfig por id_organizacao (tenant isolation)', async () => {` |
| 166 | OBJ_KEY | `tenantId` | `    authOverride = { userId: 'user-999', clerkUserId: 'clerk_999', tenantId: 'tenant-999', role: 'ADMIN' }` | `    authOverride = { userId: 'user-999', clerkUserId: 'clerk_999', id_organizacao: 'tenant-999', role: 'ADMIN' }` |
| 166 | OBJ_KEY | `userId` | `    authOverride = { userId: 'user-999', clerkUserId: 'clerk_999', tenantId: 'tenant-999', role: 'ADMIN' }` | `    authOverride = { id_usuario: 'user-999', clerkUserId: 'clerk_999', tenantId: 'tenant-999', role: 'ADMIN' }` |
| 179 | OBJ_KEY | `tenantId` | `    authOverride = { userId: 'user-001', clerkUserId: 'clerk_001', tenantId: 'tenant-001', role: 'SUPER_ADMIN' }` | `    authOverride = { userId: 'user-001', clerkUserId: 'clerk_001', id_organizacao: 'tenant-001', role: 'SUPER_ADMIN' }` |
| 179 | OBJ_KEY | `userId` | `    authOverride = { userId: 'user-001', clerkUserId: 'clerk_001', tenantId: 'tenant-001', role: 'SUPER_ADMIN' }` | `    authOverride = { id_usuario: 'user-001', clerkUserId: 'clerk_001', tenantId: 'tenant-001', role: 'SUPER_ADMIN' }` |
| 377 | CODE_OTHER | `tenant_id` | `    it('cache key inclui tenant_id (isolamento)', async () => {` | `    it('cache key inclui id_organizacao (isolamento)', async () => {` |

### `servicos-global/configurador/server/__tests__/setup.ts` (2 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 76 | OBJ_KEY | `userId` | `      userId: 'user-test-id',` | `      id_usuario: 'user-test-id',` |
| 78 | OBJ_KEY | `tenantId` | `      tenantId: 'tenant-test-id',` | `      id_organizacao: 'tenant-test-id',` |

### `servicos-global/configurador/server/lib/billing/stripeProvider.ts` (6 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 52 | OBJ_KEY | `tenant_id` | `      tenant_id: null,` | `      id_organizacao: null,` |
| 76 | OBJ_KEY | `tenant_id` | `    tenant_id: tenant?.id_organizacao ?? null,` | `    id_organizacao: tenant?.id_organizacao ?? null,` |
| 169 | COMMENT | `tenant_id` | `      // customer_id DEVE ser tenant_id do Gravity — valida existência antes de` | `      // customer_id DEVE ser id_organizacao do Gravity — valida existência antes de` |
| 251 | OBJ_KEY | `tenant_id` | `        metadata: { tenant_id: tenant.id_organizacao },` | `        metadata: { id_organizacao: tenant.id_organizacao },` |
| 258 | OBJ_KEY | `tenant_id` | `      log.info('stripe customer created', { tenant_id: tenant.id_organizacao, stripe_customer_id: stripeCustomerId })` | `      log.info('stripe customer created', { id_organizacao: tenant.id_organizacao, stripe_customer_id: stripeCustomerId ` |
| 293 | OBJ_KEY | `tenant_id` | `      tenant_id: tenant.id_organizacao,` | `      id_organizacao: tenant.id_organizacao,` |

### `servicos-global/configurador/server/lib/billing/types.ts` (1 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 35 | OBJ_KEY | `tenant_id` | `  tenant_id: string \| null` | `  id_organizacao: string \| null` |

### `servicos-global/configurador/server/middleware/rateLimiter.ts` (2 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 74 | HTTP_HEADER | `tenantId` | `  const tenantId = req.headers['x-tenant-id'] \|\| 'anonymous'` | `  const tenantId = req.headers['x-id-organizacao'] \|\| 'anonymous'` |
| 76 | CACHE_KEY | `tenantId` | `  return `${tenantId}:${ip}`` | `  return `${id_organizacao}:${ip}`` |

### `servicos-global/configurador/server/middleware/requireAuth.ts` (13 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 3 | COMMENT | `tenantId` | `// Injeta req.auth com { userId, tenantId } após validação` | `// Injeta req.auth com { userId, id_organizacao } após validação` |
| 3 | COMMENT | `userId` | `// Injeta req.auth com { userId, tenantId } após validação` | `// Injeta req.auth com { id_usuario, tenantId } após validação` |
| 13 | TS_TYPE_OR_VAR | `tenantId` | `const userCache = new Map<string, { userId: string; tenantId: string; role: string; name: string; expiry: number }>()` | `const userCache = new Map<string, { userId: string; id_organizacao: string; role: string; name: string; expiry: number }` |
| 13 | TS_TYPE_OR_VAR | `userId` | `const userCache = new Map<string, { userId: string; tenantId: string; role: string; name: string; expiry: number }>()` | `const userCache = new Map<string, { id_usuario: string; tenantId: string; role: string; name: string; expiry: number }>(` |
| 19 | OBJ_KEY | `userId` | `        userId: string` | `        id_usuario: string` |
| 20 | OBJ_KEY | `tenantId` | `        tenantId: string` | `        id_organizacao: string` |
| 61 | AUTH_CONTEXT | `tenantId` | `      req.auth = { userId: cached.userId, tenantId: cached.tenantId, clerkUserId: verified.sub, role: cached.role, name:` | `      req.auth = { userId: cached.userId, id_organizacao: cached.id_organizacao, clerkUserId: verified.sub, role: cached` |
| 61 | AUTH_CONTEXT | `userId` | `      req.auth = { userId: cached.userId, tenantId: cached.tenantId, clerkUserId: verified.sub, role: cached.role, name:` | `      req.auth = { id_usuario: cached.id_usuario, tenantId: cached.tenantId, clerkUserId: verified.sub, role: cached.rol` |
| 118 | OBJ_KEY | `userId` | `      userId: user.id_usuario,` | `      id_usuario: user.id_usuario,` |
| 119 | OBJ_KEY | `tenantId` | `      tenantId: user.id_organizacao_usuario,` | `      id_organizacao: user.id_organizacao_usuario,` |
| 126 | OBJ_KEY | `userId` | `      userId: user.id_usuario,` | `      id_usuario: user.id_usuario,` |
| 127 | OBJ_KEY | `tenantId` | `      tenantId: user.id_organizacao_usuario,` | `      id_organizacao: user.id_organizacao_usuario,` |
| 146 | HTTP_HEADER | `tenant_id` | `      tenant_id: (req.headers['x-tenant-id'] as string) ?? 'unknown',` | `      tenant_id: (req.headers['x-id-organizacao'] as string) ?? 'unknown',` |

### `servicos-global/configurador/server/routes/access.ts` (29 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 24 | OBJ_KEY | `tenantId` | `  tenantId: z.string(),` | `  id_organizacao: z.string(),` |
| 25 | OBJ_KEY | `userId` | `  userId: z.string(),` | `  id_usuario: z.string(),` |
| 27 | OBJ_KEY | `companyId` | `  companyId: z.string().optional(),` | `  id_workspace: z.string().optional(),` |
| 34 | OBJ_KEY | `tenantId` | `  tenantId: z.string(),` | `  id_organizacao: z.string(),` |
| 55 | TS_TYPE_OR_VAR | `tenantId` | `    const { tenantId, userId, productId, companyId, productKey, resource, action } = parsed.data` | `    const { id_organizacao, userId, productId, companyId, productKey, resource, action } = parsed.data` |
| 55 | TS_TYPE_OR_VAR | `companyId` | `    const { tenantId, userId, productId, companyId, productKey, resource, action } = parsed.data` | `    const { tenantId, userId, productId, id_workspace, productKey, resource, action } = parsed.data` |
| 55 | TS_TYPE_OR_VAR | `userId` | `    const { tenantId, userId, productId, companyId, productKey, resource, action } = parsed.data` | `    const { tenantId, id_usuario, productId, companyId, productKey, resource, action } = parsed.data` |
| 59 | CODE_OTHER | `tenantId` | `      where: { id_organizacao: tenantId },` | `      where: { id_organizacao: id_organizacao },` |
| 68 | TS_TYPE_OR_VAR | `tenantId` | `    const productConfig = await productConfigService.getConfig(tenantId, productKey)` | `    const productConfig = await productConfigService.getConfig(id_organizacao, productKey)` |
| 77 | CODE_OTHER | `tenantId` | `        tenantId,` | `        id_organizacao,` |
| 78 | CODE_OTHER | `userId` | `        userId,` | `        id_usuario,` |
| 80 | CODE_OTHER | `companyId` | `        companyId,` | `        id_workspace,` |
| 106 | TS_TYPE_OR_VAR | `tenantId` | `    const tenantId = req.query.tenantId as string` | `    const id_organizacao = req.query.id_organizacao as string` |
| 107 | CODE_OTHER | `tenantId` | `    if (!tenantId) {` | `    if (!id_organizacao) {` |
| 108 | CODE_OTHER | `tenantId` | `      throw new AppError('tenantId é obrigatório', 400, 'VALIDATION_ERROR')` | `      throw new AppError('id_organizacao é obrigatório', 400, 'VALIDATION_ERROR')` |
| 111 | TS_TYPE_OR_VAR | `tenantId` | `    const products = await productConfigService.listActiveProducts(tenantId)` | `    const products = await productConfigService.listActiveProducts(id_organizacao)` |
| 115 | OBJ_KEY | `tenant_id` | `      where: { tenant_id: tenantId },` | `      where: { id_organizacao: tenantId },` |
| 115 | CODE_OTHER | `tenantId` | `      where: { tenant_id: tenantId },` | `      where: { tenant_id: id_organizacao },` |
| 119 | OBJ_KEY | `tenant_id` | `    res.json({ tenant_id: tenantId, products: allConfigs })` | `    res.json({ id_organizacao: tenantId, products: allConfigs })` |
| 119 | CODE_OTHER | `tenantId` | `    res.json({ tenant_id: tenantId, products: allConfigs })` | `    res.json({ tenant_id: id_organizacao, products: allConfigs })` |
| 132 | TS_TYPE_OR_VAR | `tenantId` | `    const { tenantId, productKey, config: productConfig } = req.body` | `    const { id_organizacao, productKey, config: productConfig } = req.body` |
| 133 | CODE_OTHER | `tenantId` | `    if (!tenantId \|\| !productKey) {` | `    if (!id_organizacao \|\| !productKey) {` |
| 134 | CODE_OTHER | `tenantId` | `      throw new AppError('tenantId e productKey são obrigatórios', 400, 'VALIDATION_ERROR')` | `      throw new AppError('id_organizacao e productKey são obrigatórios', 400, 'VALIDATION_ERROR')` |
| 138 | CODE_OTHER | `tenantId` | `      tenantId,` | `      id_organizacao,` |
| 156 | TS_TYPE_OR_VAR | `tenantId` | `    const { tenantId, productKey } = req.body` | `    const { id_organizacao, productKey } = req.body` |
| 157 | CODE_OTHER | `tenantId` | `    if (!tenantId \|\| !productKey) {` | `    if (!id_organizacao \|\| !productKey) {` |
| 158 | CODE_OTHER | `tenantId` | `      throw new AppError('tenantId e productKey são obrigatórios', 400, 'VALIDATION_ERROR')` | `      throw new AppError('id_organizacao e productKey são obrigatórios', 400, 'VALIDATION_ERROR')` |
| 161 | PRISMA_QUERY | `tenantId` | `    await productConfigService.disableProduct(tenantId, productKey)` | `    await productConfigService.disableProduct(id_organizacao, productKey)` |
| 212 | PROP_ACCESS | `tenantId` | `      parsed.data.tenantId,` | `      parsed.data.id_organizacao,` |

### `servicos-global/configurador/server/routes/admin.ts` (87 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 217 | OBJ_KEY | `tenant_id` | `          tenant_id: s.id_organizacao_assinatura_produto_gravity,` | `          id_organizacao: s.id_organizacao_assinatura_produto_gravity,` |
| 257 | AUTH_CONTEXT | `tenantId` | `    if (req.params.id_organizacao === req.auth.tenantId) {` | `    if (req.params.id_organizacao === req.auth.id_organizacao) {` |
| 279 | OBJ_KEY | `tenant_id` | `      tenant_id: req.auth.tenantId,` | `      id_organizacao: req.auth.tenantId,` |
| 279 | AUTH_CONTEXT | `tenantId` | `      tenant_id: req.auth.tenantId,` | `      tenant_id: req.auth.id_organizacao,` |
| 281 | AUTH_CONTEXT | `userId` | `      actor_id: req.auth.userId,` | `      actor_id: req.auth.id_usuario,` |
| 282 | AUTH_CONTEXT | `userId` | `      actor_name: req.auth.userId,` | `      actor_name: req.auth.id_usuario,` |
| 330 | OBJ_KEY | `tenant_id` | `      tenant_id: req.auth.tenantId,` | `      id_organizacao: req.auth.tenantId,` |
| 330 | AUTH_CONTEXT | `tenantId` | `      tenant_id: req.auth.tenantId,` | `      tenant_id: req.auth.id_organizacao,` |
| 332 | AUTH_CONTEXT | `userId` | `      actor_id: req.auth.userId,` | `      actor_id: req.auth.id_usuario,` |
| 333 | AUTH_CONTEXT | `userId` | `      actor_name: req.auth.userId,` | `      actor_name: req.auth.id_usuario,` |
| 382 | OBJ_KEY | `tenant_id` | `      tenant_id: req.auth.tenantId,` | `      id_organizacao: req.auth.tenantId,` |
| 382 | AUTH_CONTEXT | `tenantId` | `      tenant_id: req.auth.tenantId,` | `      tenant_id: req.auth.id_organizacao,` |
| 384 | AUTH_CONTEXT | `userId` | `      actor_id: req.auth.userId,` | `      actor_id: req.auth.id_usuario,` |
| 385 | AUTH_CONTEXT | `userId` | `      actor_name: req.auth.userId,` | `      actor_name: req.auth.id_usuario,` |
| 405 | OBJ_KEY | `tenant_id` | `        tenant_id: id_organizacao_workspace,` | `        id_organizacao: id_organizacao_workspace,` |
| 508 | OBJ_KEY | `tenant_id` | `      tenant_id: req.auth.tenantId,` | `      id_organizacao: req.auth.tenantId,` |
| 508 | AUTH_CONTEXT | `tenantId` | `      tenant_id: req.auth.tenantId,` | `      tenant_id: req.auth.id_organizacao,` |
| 510 | AUTH_CONTEXT | `userId` | `      actor_id: req.auth.userId,` | `      actor_id: req.auth.id_usuario,` |
| 511 | AUTH_CONTEXT | `userId` | `      actor_name: req.auth.userId,` | `      actor_name: req.auth.id_usuario,` |
| 527 | OBJ_KEY | `tenant_id` | `      tenant_id: id_organizacao_usuario,` | `      id_organizacao: id_organizacao_usuario,` |
| 531 | OBJ_KEY | `company_id` | `        company_id: m.id_workspace_usuario_workspace,` | `        id_workspace: m.id_workspace_usuario_workspace,` |
| 639 | OBJ_KEY | `tenant_id` | `      tenant_id: req.auth.tenantId,` | `      id_organizacao: req.auth.tenantId,` |
| 639 | AUTH_CONTEXT | `tenantId` | `      tenant_id: req.auth.tenantId,` | `      tenant_id: req.auth.id_organizacao,` |
| 641 | AUTH_CONTEXT | `userId` | `      actor_id: req.auth.userId,` | `      actor_id: req.auth.id_usuario,` |
| 642 | AUTH_CONTEXT | `userId` | `      actor_name: req.auth.userId,` | `      actor_name: req.auth.id_usuario,` |
| 674 | OBJ_KEY | `tenant_id` | `      tenant_id: req.auth.tenantId,` | `      id_organizacao: req.auth.tenantId,` |
| 674 | AUTH_CONTEXT | `tenantId` | `      tenant_id: req.auth.tenantId,` | `      tenant_id: req.auth.id_organizacao,` |
| 676 | AUTH_CONTEXT | `userId` | `      actor_id: req.auth.userId,` | `      actor_id: req.auth.id_usuario,` |
| 677 | AUTH_CONTEXT | `userId` | `      actor_name: req.auth.userId,` | `      actor_name: req.auth.id_usuario,` |
| 705 | OBJ_KEY | `tenant_id` | `      tenant_id: req.auth.tenantId,` | `      id_organizacao: req.auth.tenantId,` |
| 705 | AUTH_CONTEXT | `tenantId` | `      tenant_id: req.auth.tenantId,` | `      tenant_id: req.auth.id_organizacao,` |
| 707 | AUTH_CONTEXT | `userId` | `      actor_id: req.auth.userId,` | `      actor_id: req.auth.id_usuario,` |
| 708 | AUTH_CONTEXT | `userId` | `      actor_name: req.auth.userId,` | `      actor_name: req.auth.id_usuario,` |
| 782 | AUTH_CONTEXT | `userId` | `      where: { id_usuario: req.auth.userId },` | `      where: { id_usuario: req.auth.id_usuario },` |
| 961 | COMMENT | `userId` | `    // POST /admin/usuarios-globais/:userId/promote.` | `    // POST /admin/usuarios-globais/:id_usuario/promote.` |
| 996 | OBJ_KEY | `tenant_id` | `      tenant_id: req.auth.tenantId,` | `      id_organizacao: req.auth.tenantId,` |
| 996 | AUTH_CONTEXT | `tenantId` | `      tenant_id: req.auth.tenantId,` | `      tenant_id: req.auth.id_organizacao,` |
| 998 | AUTH_CONTEXT | `userId` | `      actor_id: req.auth.userId,` | `      actor_id: req.auth.id_usuario,` |
| 999 | AUTH_CONTEXT | `userId` | `      actor_name: req.auth.userId,` | `      actor_name: req.auth.id_usuario,` |
| 1085 | OBJ_KEY | `tenant_id` | `        tenant_id: req.auth.tenantId,` | `        id_organizacao: req.auth.tenantId,` |
| 1085 | AUTH_CONTEXT | `tenantId` | `        tenant_id: req.auth.tenantId,` | `        tenant_id: req.auth.id_organizacao,` |
| 1087 | AUTH_CONTEXT | `userId` | `        actor_id: req.auth.userId,` | `        actor_id: req.auth.id_usuario,` |
| 1088 | AUTH_CONTEXT | `userId` | `        actor_name: req.auth.userId,` | `        actor_name: req.auth.id_usuario,` |
| 1199 | OBJ_KEY | `tenant_id` | `      tenant_id: req.auth.tenantId,` | `      id_organizacao: req.auth.tenantId,` |
| 1199 | AUTH_CONTEXT | `tenantId` | `      tenant_id: req.auth.tenantId,` | `      tenant_id: req.auth.id_organizacao,` |
| 1201 | AUTH_CONTEXT | `userId` | `      actor_id: req.auth.userId,` | `      actor_id: req.auth.id_usuario,` |
| 1202 | AUTH_CONTEXT | `userId` | `      actor_name: req.auth.userId,` | `      actor_name: req.auth.id_usuario,` |
| 1318 | AUTH_CONTEXT | `userId` | `    if (req.params.id_usuario === req.auth.userId) {` | `    if (req.params.id_usuario === req.auth.id_usuario) {` |
| 1326 | AUTH_CONTEXT | `tenantId` | `    if (!user \|\| user.id_organizacao_usuario !== req.auth.tenantId) {` | `    if (!user \|\| user.id_organizacao_usuario !== req.auth.id_organizacao) {` |
| 1336 | AUTH_CONTEXT | `tenantId` | `    securityAudit.roleChanged(req.auth.tenantId, req.auth.userId, {` | `    securityAudit.roleChanged(req.auth.id_organizacao, req.auth.userId, {` |
| 1336 | AUTH_CONTEXT | `userId` | `    securityAudit.roleChanged(req.auth.tenantId, req.auth.userId, {` | `    securityAudit.roleChanged(req.auth.tenantId, req.auth.id_usuario, {` |
| 1377 | AUTH_CONTEXT | `tenantId` | `    const existing = await prisma.usuario.findFirst({ where: { email_usuario: email, id_organizacao_usuario: req.auth.te` | `    const existing = await prisma.usuario.findFirst({ where: { email_usuario: email, id_organizacao_usuario: req.auth.id` |
| 1390 | AUTH_CONTEXT | `tenantId` | `        id_organizacao_usuario: req.auth.tenantId,` | `        id_organizacao_usuario: req.auth.id_organizacao,` |
| 1399 | OBJ_KEY | `tenant_id` | `      tenant_id: req.auth.tenantId,` | `      id_organizacao: req.auth.tenantId,` |
| 1399 | AUTH_CONTEXT | `tenantId` | `      tenant_id: req.auth.tenantId,` | `      tenant_id: req.auth.id_organizacao,` |
| 1401 | AUTH_CONTEXT | `userId` | `      actor_id: req.auth.userId,` | `      actor_id: req.auth.id_usuario,` |
| 1402 | AUTH_CONTEXT | `userId` | `      actor_name: req.auth.userId,` | `      actor_name: req.auth.id_usuario,` |
| 1464 | OBJ_KEY | `tenant_id` | `      tenant_id: req.auth.tenantId,` | `      id_organizacao: req.auth.tenantId,` |
| 1464 | AUTH_CONTEXT | `tenantId` | `      tenant_id: req.auth.tenantId,` | `      tenant_id: req.auth.id_organizacao,` |
| 1466 | AUTH_CONTEXT | `userId` | `      actor_id: req.auth.userId,` | `      actor_id: req.auth.id_usuario,` |
| 1467 | AUTH_CONTEXT | `userId` | `      actor_name: req.auth.userId,` | `      actor_name: req.auth.id_usuario,` |
| 1522 | OBJ_KEY | `tenant_id` | `      tenant_id: req.auth.tenantId,` | `      id_organizacao: req.auth.tenantId,` |
| 1522 | AUTH_CONTEXT | `tenantId` | `      tenant_id: req.auth.tenantId,` | `      tenant_id: req.auth.id_organizacao,` |
| 1524 | AUTH_CONTEXT | `userId` | `      actor_id: req.auth.userId,` | `      actor_id: req.auth.id_usuario,` |
| 1525 | AUTH_CONTEXT | `userId` | `      actor_name: req.auth.userId,` | `      actor_name: req.auth.id_usuario,` |
| 1585 | OBJ_KEY | `tenant_id` | `      tenant_id: req.auth.tenantId,` | `      id_organizacao: req.auth.tenantId,` |
| 1585 | AUTH_CONTEXT | `tenantId` | `      tenant_id: req.auth.tenantId,` | `      tenant_id: req.auth.id_organizacao,` |
| 1587 | AUTH_CONTEXT | `userId` | `      actor_id: req.auth.userId,` | `      actor_id: req.auth.id_usuario,` |
| 1588 | AUTH_CONTEXT | `userId` | `      actor_name: req.auth.userId,` | `      actor_name: req.auth.id_usuario,` |
| 1699 | OBJ_KEY | `tenant_id` | `      tenant_id: req.auth.tenantId,` | `      id_organizacao: req.auth.tenantId,` |
| 1699 | AUTH_CONTEXT | `tenantId` | `      tenant_id: req.auth.tenantId,` | `      tenant_id: req.auth.id_organizacao,` |
| 1701 | AUTH_CONTEXT | `userId` | `      actor_id: req.auth.userId,` | `      actor_id: req.auth.id_usuario,` |
| 1702 | AUTH_CONTEXT | `userId` | `      actor_name: req.auth.userId,` | `      actor_name: req.auth.id_usuario,` |
| 1759 | OBJ_KEY | `tenant_id` | `      tenant_id: req.auth.tenantId,` | `      id_organizacao: req.auth.tenantId,` |
| 1759 | AUTH_CONTEXT | `tenantId` | `      tenant_id: req.auth.tenantId,` | `      tenant_id: req.auth.id_organizacao,` |
| 1761 | AUTH_CONTEXT | `userId` | `      actor_id: req.auth.userId,` | `      actor_id: req.auth.id_usuario,` |
| 1762 | AUTH_CONTEXT | `userId` | `      actor_name: req.auth.userId,` | `      actor_name: req.auth.id_usuario,` |
| 1803 | AUTH_CONTEXT | `userId` | `      rejeitadoPor: req.auth.userId,` | `      rejeitadoPor: req.auth.id_usuario,` |
| 1808 | OBJ_KEY | `tenant_id` | `      tenant_id: req.auth.tenantId,` | `      id_organizacao: req.auth.tenantId,` |
| 1808 | AUTH_CONTEXT | `tenantId` | `      tenant_id: req.auth.tenantId,` | `      tenant_id: req.auth.id_organizacao,` |
| 1810 | AUTH_CONTEXT | `userId` | `      actor_id: req.auth.userId,` | `      actor_id: req.auth.id_usuario,` |
| 1811 | AUTH_CONTEXT | `userId` | `      actor_name: req.auth.userId,` | `      actor_name: req.auth.id_usuario,` |
| 1950 | OBJ_KEY | `tenant_id` | `          tenant_id: 'platform',` | `          id_organizacao: 'platform',` |
| 2180 | OBJ_KEY | `tenant_id` | `        tenant_id: req.auth.tenantId,` | `        id_organizacao: req.auth.tenantId,` |
| 2180 | AUTH_CONTEXT | `tenantId` | `        tenant_id: req.auth.tenantId,` | `        tenant_id: req.auth.id_organizacao,` |
| 2182 | AUTH_CONTEXT | `userId` | `        actor_id: req.auth.userId,` | `        actor_id: req.auth.id_usuario,` |
| 2183 | AUTH_CONTEXT | `userId` | `        actor_name: req.auth.userId,` | `        actor_name: req.auth.id_usuario,` |

### `servicos-global/configurador/server/routes/adminNcmIntegracao.ts` (26 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 40 | STRING | `tenant_id` | `      tenantPrisma.ncmItem.findMany({ select: { tenant_id: true }, distinct: ['tenant_id'] }),` | `      tenantPrisma.ncmItem.findMany({ select: { id_organizacao: true }, distinct: ['id_organizacao'] }),` |
| 103 | TS_TYPE_OR_VAR | `tenantId` | `    const { id_organizacao: tenantId } = req.params` | `    const { id_organizacao: id_organizacao } = req.params` |
| 108 | OBJ_KEY | `tenant_id` | `      where: { tenant_id: tenantId, status: 'RUNNING', iniciado_em: { lt: DOIS_HORAS_ATRAS } },` | `      where: { id_organizacao: tenantId, status: 'RUNNING', iniciado_em: { lt: DOIS_HORAS_ATRAS } },` |
| 108 | CODE_OTHER | `tenantId` | `      where: { tenant_id: tenantId, status: 'RUNNING', iniciado_em: { lt: DOIS_HORAS_ATRAS } },` | `      where: { tenant_id: id_organizacao, status: 'RUNNING', iniciado_em: { lt: DOIS_HORAS_ATRAS } },` |
| 113 | OBJ_KEY | `tenant_id` | `      where: { tenant_id: tenantId, status: 'RUNNING' },` | `      where: { id_organizacao: tenantId, status: 'RUNNING' },` |
| 113 | CODE_OTHER | `tenantId` | `      where: { tenant_id: tenantId, status: 'RUNNING' },` | `      where: { tenant_id: id_organizacao, status: 'RUNNING' },` |
| 119 | TS_TYPE_OR_VAR | `tenantId` | `    const result = await executarSync(tenantPrisma, tenantId, {` | `    const result = await executarSync(tenantPrisma, id_organizacao, {` |
| 121 | AUTH_CONTEXT | `userId` | `      disparadoPor: req.auth.userId,` | `      disparadoPor: req.auth.id_usuario,` |
| 125 | OBJ_KEY | `tenant_id` | `      tenant_id:     req.auth.tenantId,` | `      id_organizacao:     req.auth.tenantId,` |
| 125 | AUTH_CONTEXT | `tenantId` | `      tenant_id:     req.auth.tenantId,` | `      tenant_id:     req.auth.id_organizacao,` |
| 127 | AUTH_CONTEXT | `userId` | `      actor_id:      req.auth.userId,` | `      actor_id:      req.auth.id_usuario,` |
| 128 | AUTH_CONTEXT | `userId` | `      actor_name:    req.auth.userId,` | `      actor_name:    req.auth.id_usuario,` |
| 133 | CACHE_KEY | `tenantId` | `      action_detail: `Sync OK para tenant ${tenantId} — ${result.total} NCMs (${Date.now() - startMs}ms)`,` | `      action_detail: `Sync OK para tenant ${id_organizacao} — ${result.total} NCMs (${Date.now() - startMs}ms)`,` |
| 134 | CODE_OTHER | `tenantId` | `      after:         { tenantId, ...result },` | `      after:         { id_organizacao, ...result },` |
| 200 | OBJ_KEY | `tenant_id` | `      tenant_id:     req.auth.tenantId,` | `      id_organizacao:     req.auth.tenantId,` |
| 200 | AUTH_CONTEXT | `tenantId` | `      tenant_id:     req.auth.tenantId,` | `      tenant_id:     req.auth.id_organizacao,` |
| 202 | AUTH_CONTEXT | `userId` | `      actor_id:      req.auth.userId,` | `      actor_id:      req.auth.id_usuario,` |
| 203 | AUTH_CONTEXT | `userId` | `      actor_name:    req.auth.userId,` | `      actor_name:    req.auth.id_usuario,` |
| 228 | OBJ_KEY | `tenant_id` | `  tenant_id: z.string().optional(),` | `  id_organizacao: z.string().optional(),` |
| 242 | TS_TYPE_OR_VAR | `tenant_id` | `    const { tenant_id } = parsed.data` | `    const { id_organizacao } = parsed.data` |
| 244 | CODE_OTHER | `tenant_id` | `    if (tenant_id) {` | `    if (id_organizacao) {` |
| 246 | CODE_OTHER | `tenant_id` | `        where: { tenant_id, status: 'RUNNING' },` | `        where: { id_organizacao, status: 'RUNNING' },` |
| 251 | TS_TYPE_OR_VAR | `tenant_id` | `      const result = await executarSync(tenantPrisma, tenant_id, { origem: 'MANUAL', disparadoPor: 'gravity-admin' })` | `      const result = await executarSync(tenantPrisma, id_organizacao, { origem: 'MANUAL', disparadoPor: 'gravity-admin' ` |
| 252 | CODE_OTHER | `tenant_id` | `      return res.json({ sucesso: true, tenants_executados: 1, resultados: [{ tenant_id, sucesso: true, ...result }] })` | `      return res.json({ sucesso: true, tenants_executados: 1, resultados: [{ id_organizacao, sucesso: true, ...result }]` |
| 269 | OBJ_KEY | `tenant_id` | `        resultados.push({ tenant_id: tid, sucesso: true, ...r })` | `        resultados.push({ id_organizacao: tid, sucesso: true, ...r })` |
| 271 | OBJ_KEY | `tenant_id` | `        resultados.push({ tenant_id: tid, sucesso: false, erro: err instanceof Error ? err.message : String(err) })` | `        resultados.push({ id_organizacao: tid, sucesso: false, erro: err instanceof Error ? err.message : String(err) })` |

### `servicos-global/configurador/server/routes/adminSecurity.ts` (15 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 210 | OBJ_KEY | `tenant_id` | `    tenant_id: r.id_organizacao_requisicoes,` | `    id_organizacao: r.id_organizacao_requisicoes,` |
| 240 | OBJ_KEY | `tenant_id` | `    tenant_id: req.auth.tenantId,` | `    id_organizacao: req.auth.tenantId,` |
| 240 | AUTH_CONTEXT | `tenantId` | `    tenant_id: req.auth.tenantId,` | `    tenant_id: req.auth.id_organizacao,` |
| 242 | AUTH_CONTEXT | `userId` | `    actor_id: req.auth.userId,` | `    actor_id: req.auth.id_usuario,` |
| 243 | AUTH_CONTEXT | `userId` | `    actor_name: req.auth.userId,` | `    actor_name: req.auth.id_usuario,` |
| 281 | OBJ_KEY | `tenant_id` | `  tenant_id: z.string().max(100).optional(),` | `  id_organizacao: z.string().max(100).optional(),` |
| 293 | PROP_ACCESS | `tenant_id` | `    if (query.tenant_id) where.id_organizacao_seguranca = query.tenant_id` | `    if (query.id_organizacao) where.id_organizacao_seguranca = query.id_organizacao` |
| 308 | OBJ_KEY | `tenant_id` | `      tenant_id: e.id_organizacao_seguranca,` | `      id_organizacao: e.id_organizacao_seguranca,` |
| 317 | OBJ_KEY | `user_id` | `      user_id: e.id_usuario_seguranca,` | `      id_usuario: e.id_usuario_seguranca,` |
| 392 | OBJ_KEY | `tenant_id` | `  tenant_id: z.string().min(1),` | `  id_organizacao: z.string().min(1),` |
| 401 | OBJ_KEY | `user_id` | `  user_id: z.string().optional(),` | `  id_usuario: z.string().optional(),` |
| 415 | PROP_ACCESS | `tenant_id` | `        id_organizacao_seguranca: data.tenant_id,` | `        id_organizacao_seguranca: data.id_organizacao,` |
| 424 | PROP_ACCESS | `user_id` | `        id_usuario_seguranca: data.user_id,` | `        id_usuario_seguranca: data.id_usuario,` |
| 434 | OBJ_KEY | `tenant_id` | `        tenant_id: event.id_organizacao_seguranca,` | `        id_organizacao: event.id_organizacao_seguranca,` |
| 443 | OBJ_KEY | `user_id` | `        user_id: event.id_usuario_seguranca,` | `        id_usuario: event.id_usuario_seguranca,` |

### `servicos-global/configurador/server/routes/apiCockpit.ts` (15 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 84 | HTTP_HEADER | `tenantId` | `    const tenantId = req.auth?.tenantId \|\| (req.headers['x-tenant-id'] as string) \|\| ''` | `    const tenantId = req.auth?.tenantId \|\| (req.headers['x-id-organizacao'] as string) \|\| ''` |
| 86 | OBJ_KEY | `tenant_id` | `      tenant_id: tenantId,` | `      id_organizacao: tenantId,` |
| 86 | CODE_OTHER | `tenantId` | `      tenant_id: tenantId,` | `      tenant_id: id_organizacao,` |
| 122 | PROP_ACCESS | `tenant_id` | `      tenant_id: (req.query.tenant_id as string) \|\| '',` | `      id_organizacao: (req.query.id_organizacao as string) \|\| '',` |
| 147 | COMMENT | `tenant_id` | ` * Quando tenant_id não é informado, retorna uso global (sem filtro).` | ` * Quando id_organizacao não é informado, retorna uso global (sem filtro).` |
| 152 | TS_TYPE_OR_VAR | `tenant_id` | `    const tenantId = (req.query.tenant_id as string) \|\| ''` | `    const tenantId = (req.query.id_organizacao as string) \|\| ''` |
| 152 | TS_TYPE_OR_VAR | `tenantId` | `    const tenantId = (req.query.tenant_id as string) \|\| ''` | `    const id_organizacao = (req.query.tenant_id as string) \|\| ''` |
| 155 | STRING | `tenant_id` | `    if (tenantId) url.searchParams.set('tenant_id', tenantId)` | `    if (tenantId) url.searchParams.set('id_organizacao', tenantId)` |
| 155 | CODE_OTHER | `tenantId` | `    if (tenantId) url.searchParams.set('tenant_id', tenantId)` | `    if (id_organizacao) url.searchParams.set('tenant_id', id_organizacao)` |
| 160 | HTTP_HEADER | `tenantId` | `        'x-tenant-id': tenantId \|\| '__admin_global__',` | `        'x-id-organizacao': tenantId \|\| '__admin_global__',` |
| 189 | TS_TYPE_OR_VAR | `tenant_id` | `    const tenantId = (req.query.tenant_id as string) \|\| ''` | `    const tenantId = (req.query.id_organizacao as string) \|\| ''` |
| 189 | TS_TYPE_OR_VAR | `tenantId` | `    const tenantId = (req.query.tenant_id as string) \|\| ''` | `    const id_organizacao = (req.query.tenant_id as string) \|\| ''` |
| 191 | STRING | `tenant_id` | `    if (tenantId) url.searchParams.set('tenant_id', tenantId)` | `    if (tenantId) url.searchParams.set('id_organizacao', tenantId)` |
| 191 | CODE_OTHER | `tenantId` | `    if (tenantId) url.searchParams.set('tenant_id', tenantId)` | `    if (id_organizacao) url.searchParams.set('tenant_id', id_organizacao)` |
| 196 | HTTP_HEADER | `tenantId` | `        'x-tenant-id': tenantId \|\| '__admin_global__',` | `        'x-id-organizacao': tenantId \|\| '__admin_global__',` |

### `servicos-global/configurador/server/routes/auth.ts` (13 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 42 | OBJ_KEY | `user_id` | `    user_id: z.string().optional(),` | `    id_usuario: z.string().optional(),` |
| 118 | TS_TYPE_OR_VAR | `user_id` | `    if (type === 'session.created' && data.user_id) {` | `    if (type === 'session.created' && data.id_usuario) {` |
| 122 | PROP_ACCESS | `user_id` | `            where: { clerk_user_id: data.user_id },` | `            where: { clerk_user_id: data.id_usuario },` |
| 127 | OBJ_KEY | `tenant_id` | `              tenant_id: user.id_organizacao_usuario,` | `              id_organizacao: user.id_organizacao_usuario,` |
| 137 | OBJ_KEY | `user_id` | `              user_id: user.id_usuario,` | `              id_usuario: user.id_usuario,` |
| 144 | TS_TYPE_OR_VAR | `user_id` | `    if (type === 'session.ended' && data.user_id) {` | `    if (type === 'session.ended' && data.id_usuario) {` |
| 148 | PROP_ACCESS | `user_id` | `            where: { clerk_user_id: data.user_id },` | `            where: { clerk_user_id: data.id_usuario },` |
| 153 | OBJ_KEY | `tenant_id` | `              tenant_id: user.id_organizacao_usuario,` | `              id_organizacao: user.id_organizacao_usuario,` |
| 163 | OBJ_KEY | `user_id` | `              user_id: user.id_usuario,` | `              id_usuario: user.id_usuario,` |
| 170 | TS_TYPE_OR_VAR | `user_id` | `    if (type === 'session.revoked' && data.user_id) {` | `    if (type === 'session.revoked' && data.id_usuario) {` |
| 174 | PROP_ACCESS | `user_id` | `            where: { clerk_user_id: data.user_id },` | `            where: { clerk_user_id: data.id_usuario },` |
| 179 | OBJ_KEY | `tenant_id` | `              tenant_id: user.id_organizacao_usuario,` | `              id_organizacao: user.id_organizacao_usuario,` |
| 189 | OBJ_KEY | `user_id` | `              user_id: user.id_usuario,` | `              id_usuario: user.id_usuario,` |

### `servicos-global/configurador/server/routes/billing.ts` (1 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 61 | AUTH_CONTEXT | `tenantId` | `      where: { id_organizacao: req.auth.tenantId },` | `      where: { id_organizacao: req.auth.id_organizacao },` |

### `servicos-global/configurador/server/routes/companyProducts.ts` (18 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 25 | TS_TYPE_OR_VAR | `companyId` | `    const { id_workspace: companyId } = req.params` | `    const { id_workspace: id_workspace } = req.params` |
| 29 | AUTH_CONTEXT | `tenantId` | `      where: { id_workspace: companyId, id_organizacao_workspace: req.auth.tenantId },` | `      where: { id_workspace: companyId, id_organizacao_workspace: req.auth.id_organizacao },` |
| 29 | CODE_OTHER | `companyId` | `      where: { id_workspace: companyId, id_organizacao_workspace: req.auth.tenantId },` | `      where: { id_workspace: id_workspace, id_organizacao_workspace: req.auth.tenantId },` |
| 38 | CODE_OTHER | `companyId` | `          id_workspace_produto_gravity_workspace: companyId,` | `          id_workspace_produto_gravity_workspace: id_workspace,` |
| 39 | AUTH_CONTEXT | `tenantId` | `          id_organizacao_produto_gravity_workspace: req.auth.tenantId,` | `          id_organizacao_produto_gravity_workspace: req.auth.id_organizacao,` |
| 46 | AUTH_CONTEXT | `tenantId` | `          id_organizacao_config_produto_gravity: req.auth.tenantId,` | `          id_organizacao_config_produto_gravity: req.auth.id_organizacao,` |
| 109 | TS_TYPE_OR_VAR | `companyId` | `    const { id_workspace: companyId } = req.params` | `    const { id_workspace: id_workspace } = req.params` |
| 119 | AUTH_CONTEXT | `tenantId` | `      where: { id_workspace: companyId, id_organizacao_workspace: req.auth.tenantId },` | `      where: { id_workspace: companyId, id_organizacao_workspace: req.auth.id_organizacao },` |
| 119 | CODE_OTHER | `companyId` | `      where: { id_workspace: companyId, id_organizacao_workspace: req.auth.tenantId },` | `      where: { id_workspace: id_workspace, id_organizacao_workspace: req.auth.tenantId },` |
| 129 | AUTH_CONTEXT | `tenantId` | `          id_organizacao_config_produto_gravity: req.auth.tenantId,` | `          id_organizacao_config_produto_gravity: req.auth.id_organizacao,` |
| 146 | CODE_OTHER | `companyId` | `          id_workspace_produto_gravity_workspace: companyId,` | `          id_workspace_produto_gravity_workspace: id_workspace,` |
| 151 | AUTH_CONTEXT | `tenantId` | `        id_organizacao_produto_gravity_workspace: req.auth.tenantId,` | `        id_organizacao_produto_gravity_workspace: req.auth.id_organizacao,` |
| 152 | CODE_OTHER | `companyId` | `        id_workspace_produto_gravity_workspace: companyId,` | `        id_workspace_produto_gravity_workspace: id_workspace,` |
| 165 | OBJ_KEY | `tenant_id` | `        tenant_id: companyProduct.id_organizacao_produto_gravity_workspace,` | `        id_organizacao: companyProduct.id_organizacao_produto_gravity_workspace,` |
| 166 | OBJ_KEY | `company_id` | `        company_id: companyProduct.id_workspace_produto_gravity_workspace,` | `        id_workspace: companyProduct.id_workspace_produto_gravity_workspace,` |
| 184 | TS_TYPE_OR_VAR | `companyId` | `    const { id_workspace: companyId, id_produto_gravity: productKey } = req.params` | `    const { id_workspace: id_workspace, id_produto_gravity: productKey } = req.params` |
| 188 | CODE_OTHER | `companyId` | `        id_workspace_produto_gravity_workspace: companyId,` | `        id_workspace_produto_gravity_workspace: id_workspace,` |
| 190 | AUTH_CONTEXT | `tenantId` | `        id_organizacao_produto_gravity_workspace: req.auth.tenantId,` | `        id_organizacao_produto_gravity_workspace: req.auth.id_organizacao,` |

### `servicos-global/configurador/server/routes/historicoOrganizacao.ts` (6 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 68 | COMMENT | `tenant_id` | `      // Extrair tenant_id e user_id do auth` | `      // Extrair id_organizacao e user_id do auth` |
| 68 | COMMENT | `user_id` | `      // Extrair tenant_id e user_id do auth` | `      // Extrair tenant_id e id_usuario do auth` |
| 70 | TS_TYPE_OR_VAR | `tenantId` | `      const tenantId = auth?.tenantId` | `      const id_organizacao = auth?.id_organizacao` |
| 71 | CODE_OTHER | `tenantId` | `      if (!tenantId) {` | `      if (!id_organizacao) {` |
| 72 | CODE_OTHER | `tenant_id` | `        return next(new AppError('tenant_id obrigatório', 401, 'UNAUTHORIZED'))` | `        return next(new AppError('id_organizacao obrigatório', 401, 'UNAUTHORIZED'))` |
| 79 | HTTP_HEADER | `tenantId` | `          'x-tenant-id': tenantId,` | `          'x-id-organizacao': tenantId,` |

### `servicos-global/configurador/server/routes/hubInit.ts` (12 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 53 | AUTH_CONTEXT | `tenantId` | `    const tenantId = req.auth.tenantId` | `    const id_organizacao = req.auth.id_organizacao` |
| 54 | AUTH_CONTEXT | `userId` | `    const userId = req.auth.userId` | `    const id_usuario = req.auth.id_usuario` |
| 59 | CODE_OTHER | `tenantId` | `      tenantService.getTenantById(tenantId),` | `      tenantService.getTenantById(id_organizacao),` |
| 60 | CODE_OTHER | `tenantId` | `      tenantService.getCompanies(tenantId),` | `      tenantService.getCompanies(id_organizacao),` |
| 62 | CODE_OTHER | `tenantId` | `        where: { id_organizacao_config_produto_gravity: tenantId },` | `        where: { id_organizacao_config_produto_gravity: id_organizacao },` |
| 85 | CODE_OTHER | `userId` | `            where: { id_usuario: userId },` | `            where: { id_usuario: id_usuario },` |
| 117 | CODE_OTHER | `userId` | `            where: { id_usuario: userId },` | `            where: { id_usuario: id_usuario },` |
| 164 | AUTH_CONTEXT | `tenantId` | `    const tenantId = req.auth.tenantId` | `    const id_organizacao = req.auth.id_organizacao` |
| 165 | AUTH_CONTEXT | `userId` | `    const userId = req.auth.userId` | `    const id_usuario = req.auth.id_usuario` |
| 171 | CODE_OTHER | `tenantId` | `        id_organizacao_config_produto_gravity: tenantId,` | `        id_organizacao_config_produto_gravity: id_organizacao,` |
| 180 | CODE_OTHER | `tenantId` | `      tenantId,` | `      id_organizacao,` |
| 181 | CODE_OTHER | `userId` | `      userId,` | `      id_usuario,` |

### `servicos-global/configurador/server/routes/me.ts` (17 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 56 | AUTH_CONTEXT | `userId` | `      where: { id_usuario: req.auth.userId },` | `      where: { id_usuario: req.auth.id_usuario },` |
| 160 | OBJ_KEY | `userId` | `  userId: string,` | `  id_usuario: string,` |
| 161 | OBJ_KEY | `tenantId` | `  tenantId: string,` | `  id_organizacao: string,` |
| 162 | OBJ_KEY | `companyId` | `  companyId: string,` | `  id_workspace: string,` |
| 169 | CODE_OTHER | `companyId` | `        id_workspace: companyId,` | `        id_workspace: id_workspace,` |
| 170 | CODE_OTHER | `tenantId` | `        id_organizacao_workspace: tenantId,` | `        id_organizacao_workspace: id_organizacao,` |
| 181 | CODE_OTHER | `userId` | `      id_usuario_usuario_workspace: userId,` | `      id_usuario_usuario_workspace: id_usuario,` |
| 182 | CODE_OTHER | `companyId` | `      id_workspace_usuario_workspace: companyId,` | `      id_workspace_usuario_workspace: id_workspace,` |
| 183 | CODE_OTHER | `tenantId` | `      id_organizacao_usuario_workspace: tenantId,` | `      id_organizacao_usuario_workspace: id_organizacao,` |
| 211 | AUTH_CONTEXT | `userId` | `      where: { id_usuario: req.auth.userId },` | `      where: { id_usuario: req.auth.id_usuario },` |
| 223 | AUTH_CONTEXT | `userId` | `      req.auth.userId,` | `      req.auth.id_usuario,` |
| 224 | AUTH_CONTEXT | `tenantId` | `      req.auth.tenantId,` | `      req.auth.id_organizacao,` |
| 232 | AUTH_CONTEXT | `userId` | `        where: { id_usuario: req.auth.userId },` | `        where: { id_usuario: req.auth.id_usuario },` |
| 284 | AUTH_CONTEXT | `userId` | `        where: { id_usuario: req.auth.userId },` | `        where: { id_usuario: req.auth.id_usuario },` |
| 294 | AUTH_CONTEXT | `userId` | `      req.auth.userId,` | `      req.auth.id_usuario,` |
| 295 | AUTH_CONTEXT | `tenantId` | `      req.auth.tenantId,` | `      req.auth.id_organizacao,` |
| 309 | AUTH_CONTEXT | `userId` | `      where: { id_usuario: req.auth.userId },` | `      where: { id_usuario: req.auth.id_usuario },` |

### `servicos-global/configurador/server/routes/serviceToken.ts` (12 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 15 | OBJ_KEY | `tenantId` | `  tenantId: z.string(),` | `  id_organizacao: z.string(),` |
| 16 | OBJ_KEY | `userId` | `  userId: z.string(),` | `  id_usuario: z.string(),` |
| 38 | TS_TYPE_OR_VAR | `tenantId` | `    const { tenantId, userId, scope, expiresInHours } = parsed.data` | `    const { id_organizacao, userId, scope, expiresInHours } = parsed.data` |
| 38 | TS_TYPE_OR_VAR | `userId` | `    const { tenantId, userId, scope, expiresInHours } = parsed.data` | `    const { tenantId, id_usuario, scope, expiresInHours } = parsed.data` |
| 49 | OBJ_KEY | `tenant_id` | `        tenant_id: tenantId,` | `        id_organizacao: tenantId,` |
| 49 | CODE_OTHER | `tenantId` | `        tenant_id: tenantId,` | `        tenant_id: id_organizacao,` |
| 50 | OBJ_KEY | `user_id` | `        user_id: userId,` | `        id_usuario: userId,` |
| 50 | CODE_OTHER | `userId` | `        user_id: userId,` | `        user_id: id_usuario,` |
| 95 | PROP_ACCESS | `tenant_id` | `      tenantId: serviceToken.tenant_id,` | `      tenantId: serviceToken.id_organizacao,` |
| 95 | OBJ_KEY | `tenantId` | `      tenantId: serviceToken.tenant_id,` | `      id_organizacao: serviceToken.tenant_id,` |
| 96 | PROP_ACCESS | `user_id` | `      userId: serviceToken.user_id,` | `      userId: serviceToken.id_usuario,` |
| 96 | OBJ_KEY | `userId` | `      userId: serviceToken.user_id,` | `      id_usuario: serviceToken.user_id,` |

### `servicos-global/configurador/server/routes/tenantProducts.ts` (19 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 35 | AUTH_CONTEXT | `tenantId` | `      where: { id_organizacao_config_produto_gravity: req.auth.tenantId },` | `      where: { id_organizacao_config_produto_gravity: req.auth.id_organizacao },` |
| 101 | AUTH_CONTEXT | `tenantId` | `          id_organizacao_config_produto_gravity: req.auth.tenantId,` | `          id_organizacao_config_produto_gravity: req.auth.id_organizacao,` |
| 106 | AUTH_CONTEXT | `tenantId` | `        id_organizacao_config_produto_gravity: req.auth.tenantId,` | `        id_organizacao_config_produto_gravity: req.auth.id_organizacao,` |
| 131 | AUTH_CONTEXT | `tenantId` | `        id_organizacao_config_produto_gravity: req.auth.tenantId,` | `        id_organizacao_config_produto_gravity: req.auth.id_organizacao,` |
| 154 | TS_TYPE_OR_VAR | `tenantId` | `    const { id_organizacao: tenantId } = req.params` | `    const { id_organizacao: id_organizacao } = req.params` |
| 156 | CODE_OTHER | `tenantId` | `      where: { id_organizacao: tenantId },` | `      where: { id_organizacao: id_organizacao },` |
| 164 | CODE_OTHER | `tenantId` | `      where: { id_organizacao_config_produto_gravity: tenantId },` | `      where: { id_organizacao_config_produto_gravity: id_organizacao },` |
| 171 | OBJ_KEY | `tenant_id` | `      tenant_id: c.id_organizacao_config_produto_gravity,` | `      id_organizacao: c.id_organizacao_config_produto_gravity,` |
| 179 | OBJ_KEY | `tenant_id` | `    res.json({ tenant_id: tenant.id_organizacao, tenant_name: tenant.nome_organizacao, products: productsDto })` | `    res.json({ id_organizacao: tenant.id_organizacao, tenant_name: tenant.nome_organizacao, products: productsDto })` |
| 204 | TS_TYPE_OR_VAR | `tenantId` | `      const { id_organizacao: tenantId, id_produto_gravity: productKey } = req.params` | `      const { id_organizacao: id_organizacao, id_produto_gravity: productKey } = req.params` |
| 207 | CODE_OTHER | `tenantId` | `        where: { id_organizacao: tenantId },` | `        where: { id_organizacao: id_organizacao },` |
| 214 | CODE_OTHER | `tenantId` | `        tenantId,` | `        id_organizacao,` |
| 220 | CODE_OTHER | `tenant_id` | `      console.info(`[admin] produto ativado tenant_id=${tenantId} product_key=${productKey}`)` | `      console.info(`[admin] produto ativado id_organizacao=${tenantId} product_key=${productKey}`)` |
| 220 | CACHE_KEY | `tenantId` | `      console.info(`[admin] produto ativado tenant_id=${tenantId} product_key=${productKey}`)` | `      console.info(`[admin] produto ativado tenant_id=${id_organizacao} product_key=${productKey}`)` |
| 239 | TS_TYPE_OR_VAR | `tenantId` | `      const { id_organizacao: tenantId, id_produto_gravity: productKey } = req.params` | `      const { id_organizacao: id_organizacao, id_produto_gravity: productKey } = req.params` |
| 242 | CODE_OTHER | `tenantId` | `        where: { id_organizacao: tenantId },` | `        where: { id_organizacao: id_organizacao },` |
| 249 | CODE_OTHER | `tenantId` | `        tenantId,` | `        id_organizacao,` |
| 253 | CODE_OTHER | `tenant_id` | `      console.info(`[admin] produto desativado tenant_id=${tenantId} product_key=${productKey}`)` | `      console.info(`[admin] produto desativado id_organizacao=${tenantId} product_key=${productKey}`)` |
| 253 | CACHE_KEY | `tenantId` | `      console.info(`[admin] produto desativado tenant_id=${tenantId} product_key=${productKey}`)` | `      console.info(`[admin] produto desativado tenant_id=${id_organizacao} product_key=${productKey}`)` |

### `servicos-global/configurador/server/routes/tenants.ts` (24 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 116 | AUTH_CONTEXT | `tenantId` | `    const tenant = await tenantService.getTenantById(req.auth.tenantId)` | `    const tenant = await tenantService.getTenantById(req.auth.id_organizacao)` |
| 153 | AUTH_CONTEXT | `tenantId` | `    const before = await tenantService.getTenantById(req.auth.tenantId)` | `    const before = await tenantService.getTenantById(req.auth.id_organizacao)` |
| 154 | AUTH_CONTEXT | `tenantId` | `    const tenant = await tenantService.updateTenant(req.auth.tenantId, parsed.data)` | `    const tenant = await tenantService.updateTenant(req.auth.id_organizacao, parsed.data)` |
| 157 | OBJ_KEY | `tenant_id` | `      tenant_id: req.auth.tenantId,` | `      id_organizacao: req.auth.tenantId,` |
| 157 | AUTH_CONTEXT | `tenantId` | `      tenant_id: req.auth.tenantId,` | `      tenant_id: req.auth.id_organizacao,` |
| 159 | AUTH_CONTEXT | `userId` | `      actor_id: req.auth.userId,` | `      actor_id: req.auth.id_usuario,` |
| 160 | AUTH_CONTEXT | `userId` | `      actor_name: req.auth.userId,` | `      actor_name: req.auth.id_usuario,` |
| 163 | AUTH_CONTEXT | `tenantId` | `      resource_id: req.auth.tenantId,` | `      resource_id: req.auth.id_organizacao,` |
| 184 | AUTH_CONTEXT | `tenantId` | `    const companies = await tenantService.getCompanies(req.auth.tenantId)` | `    const companies = await tenantService.getCompanies(req.auth.id_organizacao)` |
| 206 | AUTH_CONTEXT | `tenantId` | `      req.auth.tenantId,` | `      req.auth.id_organizacao,` |
| 211 | OBJ_KEY | `tenant_id` | `      tenant_id: req.auth.tenantId,` | `      id_organizacao: req.auth.tenantId,` |
| 211 | AUTH_CONTEXT | `tenantId` | `      tenant_id: req.auth.tenantId,` | `      tenant_id: req.auth.id_organizacao,` |
| 213 | AUTH_CONTEXT | `userId` | `      actor_id: req.auth.userId,` | `      actor_id: req.auth.id_usuario,` |
| 214 | AUTH_CONTEXT | `userId` | `      actor_name: req.auth.userId,` | `      actor_name: req.auth.id_usuario,` |
| 244 | AUTH_CONTEXT | `tenantId` | `      req.auth.tenantId,` | `      req.auth.id_organizacao,` |
| 250 | OBJ_KEY | `tenant_id` | `      tenant_id: req.auth.tenantId,` | `      id_organizacao: req.auth.tenantId,` |
| 250 | AUTH_CONTEXT | `tenantId` | `      tenant_id: req.auth.tenantId,` | `      tenant_id: req.auth.id_organizacao,` |
| 252 | AUTH_CONTEXT | `userId` | `      actor_id: req.auth.userId,` | `      actor_id: req.auth.id_usuario,` |
| 253 | AUTH_CONTEXT | `userId` | `      actor_name: req.auth.userId,` | `      actor_name: req.auth.id_usuario,` |
| 274 | AUTH_CONTEXT | `tenantId` | `    await tenantService.deleteCompany(req.auth.tenantId, req.params.id_workspace)` | `    await tenantService.deleteCompany(req.auth.id_organizacao, req.params.id_workspace)` |
| 277 | OBJ_KEY | `tenant_id` | `      tenant_id: req.auth.tenantId,` | `      id_organizacao: req.auth.tenantId,` |
| 277 | AUTH_CONTEXT | `tenantId` | `      tenant_id: req.auth.tenantId,` | `      tenant_id: req.auth.id_organizacao,` |
| 279 | AUTH_CONTEXT | `userId` | `      actor_id: req.auth.userId,` | `      actor_id: req.auth.id_usuario,` |
| 280 | AUTH_CONTEXT | `userId` | `      actor_name: req.auth.userId,` | `      actor_name: req.auth.id_usuario,` |

### `servicos-global/configurador/server/routes/users.ts` (48 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 35 | OBJ_KEY | `companyId` | `  companyId: z.string(),` | `  id_workspace: z.string(),` |
| 57 | AUTH_CONTEXT | `tenantId` | `      where: { id_organizacao_usuario: req.auth.tenantId },` | `      where: { id_organizacao_usuario: req.auth.id_organizacao },` |
| 85 | OBJ_KEY | `company_id` | `        company_id: m.id_workspace_usuario_workspace,` | `        id_workspace: m.id_workspace_usuario_workspace,` |
| 115 | AUTH_CONTEXT | `tenantId` | `      where: { id_organizacao_usuario: req.auth.tenantId, email_usuario: email },` | `      where: { id_organizacao_usuario: req.auth.id_organizacao, email_usuario: email },` |
| 132 | AUTH_CONTEXT | `tenantId` | `        where: { id_organizacao_workspace: req.auth.tenantId, status_workspace: 'ATIVO' },` | `        where: { id_organizacao_workspace: req.auth.id_organizacao, status_workspace: 'ATIVO' },` |
| 140 | AUTH_CONTEXT | `tenantId` | `          id_organizacao_workspace: req.auth.tenantId,` | `          id_organizacao_workspace: req.auth.id_organizacao,` |
| 158 | AUTH_CONTEXT | `tenantId` | `          id_organizacao_usuario: req.auth.tenantId,` | `          id_organizacao_usuario: req.auth.id_organizacao,` |
| 169 | AUTH_CONTEXT | `tenantId` | `            id_organizacao_usuario_workspace: req.auth.tenantId,` | `            id_organizacao_usuario_workspace: req.auth.id_organizacao,` |
| 206 | TS_TYPE_OR_VAR | `companyId` | `    const { companyId, role } = parsed.data` | `    const { id_workspace, role } = parsed.data` |
| 207 | TS_TYPE_OR_VAR | `userId` | `    const userId = req.params.id_usuario` | `    const id_usuario = req.params.id_usuario` |
| 211 | AUTH_CONTEXT | `tenantId` | `      where: { id_usuario: userId, id_organizacao_usuario: req.auth.tenantId },` | `      where: { id_usuario: userId, id_organizacao_usuario: req.auth.id_organizacao },` |
| 211 | CODE_OTHER | `userId` | `      where: { id_usuario: userId, id_organizacao_usuario: req.auth.tenantId },` | `      where: { id_usuario: id_usuario, id_organizacao_usuario: req.auth.tenantId },` |
| 219 | AUTH_CONTEXT | `tenantId` | `      where: { id_workspace: companyId, id_organizacao_workspace: req.auth.tenantId },` | `      where: { id_workspace: companyId, id_organizacao_workspace: req.auth.id_organizacao },` |
| 219 | CODE_OTHER | `companyId` | `      where: { id_workspace: companyId, id_organizacao_workspace: req.auth.tenantId },` | `      where: { id_workspace: id_workspace, id_organizacao_workspace: req.auth.tenantId },` |
| 228 | AUTH_CONTEXT | `tenantId` | `          id_organizacao_usuario_workspace: req.auth.tenantId,` | `          id_organizacao_usuario_workspace: req.auth.id_organizacao,` |
| 229 | CODE_OTHER | `userId` | `          id_usuario_usuario_workspace: userId,` | `          id_usuario_usuario_workspace: id_usuario,` |
| 230 | CODE_OTHER | `companyId` | `          id_workspace_usuario_workspace: companyId,` | `          id_workspace_usuario_workspace: id_workspace,` |
| 234 | AUTH_CONTEXT | `tenantId` | `        id_organizacao_usuario_workspace: req.auth.tenantId,` | `        id_organizacao_usuario_workspace: req.auth.id_organizacao,` |
| 235 | CODE_OTHER | `userId` | `        id_usuario_usuario_workspace: userId,` | `        id_usuario_usuario_workspace: id_usuario,` |
| 236 | CODE_OTHER | `companyId` | `        id_workspace_usuario_workspace: companyId,` | `        id_workspace_usuario_workspace: id_workspace,` |
| 246 | OBJ_KEY | `tenant_id` | `      tenant_id: membership.id_organizacao_usuario_workspace,` | `      id_organizacao: membership.id_organizacao_usuario_workspace,` |
| 247 | OBJ_KEY | `user_id` | `      user_id: membership.id_usuario_usuario_workspace,` | `      id_usuario: membership.id_usuario_usuario_workspace,` |
| 248 | OBJ_KEY | `company_id` | `      company_id: membership.id_workspace_usuario_workspace,` | `      id_workspace: membership.id_workspace_usuario_workspace,` |
| 263 | OBJ_KEY | `tenantId` | `  tenantId: string,` | `  id_organizacao: string,` |
| 267 | CODE_OTHER | `tenantId` | `    where: { id_workspace: { in: workspaceIds }, id_organizacao_workspace: tenantId, status_workspace: 'ATIVO' },` | `    where: { id_workspace: { in: workspaceIds }, id_organizacao_workspace: id_organizacao, status_workspace: 'ATIVO' },` |
| 280 | OBJ_KEY | `tenantId` | `  tenantId: string,` | `  id_organizacao: string,` |
| 281 | OBJ_KEY | `userId` | `  userId: string,` | `  id_usuario: string,` |
| 288 | CODE_OTHER | `tenantId` | `        id_organizacao_usuario_workspace: tenantId,` | `        id_organizacao_usuario_workspace: id_organizacao,` |
| 289 | CODE_OTHER | `userId` | `        id_usuario_usuario_workspace: userId,` | `        id_usuario_usuario_workspace: id_usuario,` |
| 294 | CODE_OTHER | `companyId` | `      data: workspaceIds.map((companyId) => ({` | `      data: workspaceIds.map((id_workspace) => ({` |
| 295 | CODE_OTHER | `tenantId` | `        id_organizacao_usuario_workspace: tenantId,` | `        id_organizacao_usuario_workspace: id_organizacao,` |
| 296 | CODE_OTHER | `userId` | `        id_usuario_usuario_workspace: userId,` | `        id_usuario_usuario_workspace: id_usuario,` |
| 297 | CODE_OTHER | `companyId` | `        id_workspace_usuario_workspace: companyId,` | `        id_workspace_usuario_workspace: id_workspace,` |
| 318 | TS_TYPE_OR_VAR | `userId` | `    const userId = req.params.id_usuario` | `    const id_usuario = req.params.id_usuario` |
| 321 | AUTH_CONTEXT | `tenantId` | `      where: { id_usuario: userId, id_organizacao_usuario: req.auth.tenantId },` | `      where: { id_usuario: userId, id_organizacao_usuario: req.auth.id_organizacao },` |
| 321 | CODE_OTHER | `userId` | `      where: { id_usuario: userId, id_organizacao_usuario: req.auth.tenantId },` | `      where: { id_usuario: id_usuario, id_organizacao_usuario: req.auth.tenantId },` |
| 329 | AUTH_CONTEXT | `tenantId` | `    await validarWorkspacesDoTenant(req.auth.tenantId, workspaceIds)` | `    await validarWorkspacesDoTenant(req.auth.id_organizacao, workspaceIds)` |
| 334 | AUTH_CONTEXT | `tenantId` | `          id_organizacao_usuario_workspace: req.auth.tenantId,` | `          id_organizacao_usuario_workspace: req.auth.id_organizacao,` |
| 335 | CODE_OTHER | `userId` | `          id_usuario_usuario_workspace: userId,` | `          id_usuario_usuario_workspace: id_usuario,` |
| 341 | AUTH_CONTEXT | `tenantId` | `    await substituirWorkspacesAtomicamente(req.auth.tenantId, userId, workspaceIds, user.tipo_usuario)` | `    await substituirWorkspacesAtomicamente(req.auth.id_organizacao, userId, workspaceIds, user.tipo_usuario)` |
| 341 | PRISMA_QUERY | `userId` | `    await substituirWorkspacesAtomicamente(req.auth.tenantId, userId, workspaceIds, user.tipo_usuario)` | `    await substituirWorkspacesAtomicamente(req.auth.tenantId, id_usuario, workspaceIds, user.tipo_usuario)` |
| 346 | AUTH_CONTEXT | `tenantId` | `      securityAudit.permissionChanged(req.auth.tenantId, req.auth.userId, {` | `      securityAudit.permissionChanged(req.auth.id_organizacao, req.auth.userId, {` |
| 346 | AUTH_CONTEXT | `userId` | `      securityAudit.permissionChanged(req.auth.tenantId, req.auth.userId, {` | `      securityAudit.permissionChanged(req.auth.tenantId, req.auth.id_usuario, {` |
| 347 | CODE_OTHER | `userId` | `        targetUserId: userId,` | `        targetUserId: id_usuario,` |
| 374 | AUTH_CONTEXT | `tenantId` | `      where: { id_usuario: req.params.id_usuario, id_organizacao_usuario: req.auth.tenantId },` | `      where: { id_usuario: req.params.id_usuario, id_organizacao_usuario: req.auth.id_organizacao },` |
| 382 | AUTH_CONTEXT | `tenantId` | `      where: { id_usuario: req.params.id_usuario, id_organizacao_usuario: req.auth.tenantId },` | `      where: { id_usuario: req.params.id_usuario, id_organizacao_usuario: req.auth.id_organizacao },` |
| 387 | AUTH_CONTEXT | `tenantId` | `    securityAudit.roleChanged(req.auth.tenantId, req.auth.userId, {` | `    securityAudit.roleChanged(req.auth.id_organizacao, req.auth.userId, {` |
| 387 | AUTH_CONTEXT | `userId` | `    securityAudit.roleChanged(req.auth.tenantId, req.auth.userId, {` | `    securityAudit.roleChanged(req.auth.tenantId, req.auth.id_usuario, {` |

### `servicos-global/configurador/server/scripts/bootstrap-seed.ts` (1 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 89 | OBJ_KEY | `tenant_id` | `  console.log(`      tenant_id: ${user.id_organizacao_usuario}`)` | `  console.log(`      id_organizacao: ${user.id_organizacao_usuario}`)` |

### `servicos-global/configurador/server/scripts/create-user.ts` (7 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 4 | COMMENT | `tenant_id` | ` * Uso: npx tsx server/scripts/create-user.ts <email> <tenant_id> [SUPER_ADMIN\|ADMIN\|MASTER\|PADRAO\|FORNECEDOR]` | ` * Uso: npx tsx server/scripts/create-user.ts <email> <id_organizacao> [SUPER_ADMIN\|ADMIN\|MASTER\|PADRAO\|FORNECEDOR]` |
| 15 | TS_TYPE_OR_VAR | `tenantId` | `  const tenantId = process.argv[3]` | `  const id_organizacao = process.argv[3]` |
| 18 | CODE_OTHER | `tenantId` | `  if (!email \|\| !tenantId) {` | `  if (!email \|\| !id_organizacao) {` |
| 19 | CODE_OTHER | `tenant_id` | `    console.error('Uso: npx tsx server/scripts/create-user.ts <email> <tenant_id> [role]')` | `    console.error('Uso: npx tsx server/scripts/create-user.ts <email> <id_organizacao> [role]')` |
| 29 | TS_TYPE_OR_VAR | `tenantId` | `  const tenant = await prisma.organizacao.findUnique({ where: { id_organizacao: tenantId } })` | `  const tenant = await prisma.organizacao.findUnique({ where: { id_organizacao: id_organizacao } })` |
| 31 | CACHE_KEY | `tenantId` | `    console.error(`Organizacao ${tenantId} não encontrado.`)` | `    console.error(`Organizacao ${id_organizacao} não encontrado.`)` |
| 40 | CODE_OTHER | `tenantId` | `      id_organizacao_usuario: tenantId,` | `      id_organizacao_usuario: id_organizacao,` |

### `servicos-global/configurador/server/scripts/list-users.ts` (1 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 16 | OBJ_KEY | `tenant_id` | `    console.log(`  tenant_id: ${u.id_organizacao_usuario}`)` | `    console.log(`  id_organizacao: ${u.id_organizacao_usuario}`)` |

### `servicos-global/configurador/server/scripts/relink-clerk-user.ts` (2 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 5 | COMMENT | `user_id` | ` * Usado quando a sessão ativa do Clerk está com user_id diferente do que` | ` * Usado quando a sessão ativa do Clerk está com id_usuario diferente do que` |
| 46 | OBJ_KEY | `tenant_id` | `  console.log(`  tenant_id:     ${user.id_organizacao_usuario}`)` | `  console.log(`  id_organizacao:     ${user.id_organizacao_usuario}`)` |

### `servicos-global/configurador/server/scripts/seedProducts.ts` (1 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 33 | OBJ_KEY | `tenant_id` | `    log.info('activating demo products for tenant', { tenant_id: demoTenantId })` | `    log.info('activating demo products for tenant', { id_organizacao: demoTenantId })` |

### `servicos-global/configurador/server/scripts/set-super-admin.ts` (1 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 6 | COMMENT | `userId` | ` * POST /api/v1/admin/users/:userId/promote (que exige SUPER_ADMIN autenticado).` | ` * POST /api/v1/admin/users/:id_usuario/promote (que exige SUPER_ADMIN autenticado).` |

### `servicos-global/configurador/server/services/billingService.ts` (9 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 38 | TS_TYPE_OR_VAR | `tenantId` | `        const { tenantId } = session.metadata ?? {}` | `        const { id_organizacao } = session.metadata ?? {}` |
| 39 | CODE_OTHER | `tenantId` | `        if (!tenantId) {` | `        if (!id_organizacao) {` |
| 40 | CODE_OTHER | `tenantId` | `          log.error('checkout.session.completed missing tenantId metadata', { session_id: session.id })` | `          log.error('checkout.session.completed missing id_organizacao metadata', { session_id: session.id })` |
| 47 | CODE_OTHER | `tenantId` | `            where: { id_organizacao_assinatura_produto_gravity: tenantId },` | `            where: { id_organizacao_assinatura_produto_gravity: id_organizacao },` |
| 54 | CODE_OTHER | `tenantId` | `            where: { id_organizacao: tenantId },` | `            where: { id_organizacao: id_organizacao },` |
| 163 | OBJ_KEY | `tenant_id` | `      tenant_id: tenant.id_organizacao,` | `      id_organizacao: tenant.id_organizacao,` |
| 171 | OBJ_KEY | `tenant_id` | `      tenant_id: tenant.id_organizacao,` | `      id_organizacao: tenant.id_organizacao,` |
| 197 | OBJ_KEY | `tenant_id` | `      tenant_id: tenant.id_organizacao,` | `      id_organizacao: tenant.id_organizacao,` |
| 204 | OBJ_KEY | `tenant_id` | `      tenant_id: tenant.id_organizacao,` | `      id_organizacao: tenant.id_organizacao,` |

### `servicos-global/configurador/server/services/hubInsightsService.ts` (26 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 6 | COMMENT | `tenant_id` | ` * Fase 3: Cache in-memory com tenant_id isolation (TTL 5min)` | ` * Fase 3: Cache in-memory com id_organizacao isolation (TTL 5min)` |
| 9 | COMMENT | `tenant_id` | ` *  - Nunca expõe dados de outro tenant (cache-key inclui tenant_id)` | ` *  - Nunca expõe dados de outro tenant (cache-key inclui id_organizacao)` |
| 33 | OBJ_KEY | `tenantId` | `  tenantId: string` | `  id_organizacao: string` |
| 147 | OBJ_KEY | `tenantId` | `function getCacheKey(tenantId: string, userId: string): string {` | `function getCacheKey(id_organizacao: string, userId: string): string {` |
| 147 | OBJ_KEY | `userId` | `function getCacheKey(tenantId: string, userId: string): string {` | `function getCacheKey(tenantId: string, id_usuario: string): string {` |
| 148 | CACHE_KEY | `tenantId` | `  return `${tenantId}:${userId}`` | `  return `${id_organizacao}:${userId}`` |
| 148 | CACHE_KEY | `userId` | `  return `${tenantId}:${userId}`` | `  return `${tenantId}:${id_usuario}`` |
| 151 | OBJ_KEY | `tenantId` | `function getCached(tenantId: string, userId: string): HubInsight[] \| null {` | `function getCached(id_organizacao: string, userId: string): HubInsight[] \| null {` |
| 151 | OBJ_KEY | `userId` | `function getCached(tenantId: string, userId: string): HubInsight[] \| null {` | `function getCached(tenantId: string, id_usuario: string): HubInsight[] \| null {` |
| 152 | TS_TYPE_OR_VAR | `tenantId` | `  const entry = insightsCache.get(getCacheKey(tenantId, userId))` | `  const entry = insightsCache.get(getCacheKey(id_organizacao, userId))` |
| 152 | TS_TYPE_OR_VAR | `userId` | `  const entry = insightsCache.get(getCacheKey(tenantId, userId))` | `  const entry = insightsCache.get(getCacheKey(tenantId, id_usuario))` |
| 155 | CODE_OTHER | `tenantId` | `    insightsCache.delete(getCacheKey(tenantId, userId))` | `    insightsCache.delete(getCacheKey(id_organizacao, userId))` |
| 155 | CODE_OTHER | `userId` | `    insightsCache.delete(getCacheKey(tenantId, userId))` | `    insightsCache.delete(getCacheKey(tenantId, id_usuario))` |
| 161 | OBJ_KEY | `tenantId` | `function setCache(tenantId: string, userId: string, insights: HubInsight[]): void {` | `function setCache(id_organizacao: string, userId: string, insights: HubInsight[]): void {` |
| 161 | OBJ_KEY | `userId` | `function setCache(tenantId: string, userId: string, insights: HubInsight[]): void {` | `function setCache(tenantId: string, id_usuario: string, insights: HubInsight[]): void {` |
| 167 | CODE_OTHER | `tenantId` | `  insightsCache.set(getCacheKey(tenantId, userId), {` | `  insightsCache.set(getCacheKey(id_organizacao, userId), {` |
| 167 | CODE_OTHER | `userId` | `  insightsCache.set(getCacheKey(tenantId, userId), {` | `  insightsCache.set(getCacheKey(tenantId, id_usuario), {` |
| 673 | COMMENT | `tenantId` | ` * @param tenantId         - ID do tenant (obrigatório para isolamento)` | ` * @param id_organizacao         - ID do tenant (obrigatório para isolamento)` |
| 674 | COMMENT | `userId` | ` * @param userId           - ID do usuário (para cache + personalização futura)` | ` * @param id_usuario           - ID do usuário (para cache + personalização futura)` |
| 680 | OBJ_KEY | `tenantId` | `  tenantId: string,` | `  id_organizacao: string,` |
| 681 | OBJ_KEY | `userId` | `  userId: string,` | `  id_usuario: string,` |
| 686 | TS_TYPE_OR_VAR | `tenantId` | `  const cached = getCached(tenantId, userId)` | `  const cached = getCached(id_organizacao, userId)` |
| 686 | TS_TYPE_OR_VAR | `userId` | `  const cached = getCached(tenantId, userId)` | `  const cached = getCached(tenantId, id_usuario)` |
| 691 | CODE_OTHER | `tenantId` | `    tenantId,` | `    id_organizacao,` |
| 778 | CODE_OTHER | `tenantId` | `  setCache(tenantId, userId, result)` | `  setCache(id_organizacao, userId, result)` |
| 778 | CODE_OTHER | `userId` | `  setCache(tenantId, userId, result)` | `  setCache(tenantId, id_usuario, result)` |

### `servicos-global/configurador/server/services/lgpdService.ts` (42 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 21 | OBJ_KEY | `userId` | `  userId: string` | `  id_usuario: string` |
| 22 | OBJ_KEY | `tenantId` | `  tenantId: string` | `  id_organizacao: string` |
| 30 | OBJ_KEY | `userId` | `  userId: string` | `  id_usuario: string` |
| 31 | OBJ_KEY | `tenantId` | `  tenantId: string` | `  id_organizacao: string` |
| 41 | OBJ_KEY | `tenantId` | `  tenantId: string,` | `  id_organizacao: string,` |
| 42 | OBJ_KEY | `userId` | `  userId: string` | `  id_usuario: string` |
| 48 | OBJ_KEY | `tenant_id` | `    where: { tenant_id: tenantId, clerk_user_id: userId },` | `    where: { id_organizacao: tenantId, clerk_user_id: userId },` |
| 48 | CODE_OTHER | `tenantId` | `    where: { tenant_id: tenantId, clerk_user_id: userId },` | `    where: { tenant_id: id_organizacao, clerk_user_id: userId },` |
| 48 | CODE_OTHER | `userId` | `    where: { tenant_id: tenantId, clerk_user_id: userId },` | `    where: { tenant_id: tenantId, clerk_user_id: id_usuario },` |
| 53 | OBJ_KEY | `tenant_id` | `    where: { tenant_id: tenantId, user_id: userId },` | `    where: { id_organizacao: tenantId, user_id: userId },` |
| 53 | CODE_OTHER | `tenantId` | `    where: { tenant_id: tenantId, user_id: userId },` | `    where: { tenant_id: id_organizacao, user_id: userId },` |
| 53 | OBJ_KEY | `user_id` | `    where: { tenant_id: tenantId, user_id: userId },` | `    where: { tenant_id: tenantId, id_usuario: userId },` |
| 53 | CODE_OTHER | `userId` | `    where: { tenant_id: tenantId, user_id: userId },` | `    where: { tenant_id: tenantId, user_id: id_usuario },` |
| 58 | CODE_OTHER | `userId` | `    userId,` | `    id_usuario,` |
| 59 | CODE_OTHER | `tenantId` | `    tenantId,` | `    id_organizacao,` |
| 75 | OBJ_KEY | `tenantId` | `  tenantId: string,` | `  id_organizacao: string,` |
| 76 | OBJ_KEY | `userId` | `  userId: string,` | `  id_usuario: string,` |
| 111 | COMMENT | `user_id` | `    // Contar em todas as tabelas com user_id` | `    // Contar em todas as tabelas com id_usuario` |
| 112 | OBJ_KEY | `tenant_id` | `    await countFrom('userPermission', { tenant_id: tenantId, user_id: userId })` | `    await countFrom('userPermission', { id_organizacao: tenantId, user_id: userId })` |
| 112 | PRISMA_QUERY | `tenantId` | `    await countFrom('userPermission', { tenant_id: tenantId, user_id: userId })` | `    await countFrom('userPermission', { tenant_id: id_organizacao, user_id: userId })` |
| 112 | OBJ_KEY | `user_id` | `    await countFrom('userPermission', { tenant_id: tenantId, user_id: userId })` | `    await countFrom('userPermission', { tenant_id: tenantId, id_usuario: userId })` |
| 112 | PRISMA_QUERY | `userId` | `    await countFrom('userPermission', { tenant_id: tenantId, user_id: userId })` | `    await countFrom('userPermission', { tenant_id: tenantId, user_id: id_usuario })` |
| 113 | OBJ_KEY | `tenant_id` | `    await countFrom('historyLog', { tenant_id: tenantId, user_id: userId })` | `    await countFrom('historyLog', { id_organizacao: tenantId, user_id: userId })` |
| 113 | PRISMA_QUERY | `tenantId` | `    await countFrom('historyLog', { tenant_id: tenantId, user_id: userId })` | `    await countFrom('historyLog', { tenant_id: id_organizacao, user_id: userId })` |
| 113 | OBJ_KEY | `user_id` | `    await countFrom('historyLog', { tenant_id: tenantId, user_id: userId })` | `    await countFrom('historyLog', { tenant_id: tenantId, id_usuario: userId })` |
| 113 | PRISMA_QUERY | `userId` | `    await countFrom('historyLog', { tenant_id: tenantId, user_id: userId })` | `    await countFrom('historyLog', { tenant_id: tenantId, user_id: id_usuario })` |
| 116 | CODE_OTHER | `userId` | `      userId,` | `      id_usuario,` |
| 117 | CODE_OTHER | `tenantId` | `      tenantId,` | `      id_organizacao,` |
| 127 | OBJ_KEY | `tenant_id` | `    await deleteFrom('userPermission', { tenant_id: tenantId, user_id: userId })` | `    await deleteFrom('userPermission', { id_organizacao: tenantId, user_id: userId })` |
| 127 | PRISMA_QUERY | `tenantId` | `    await deleteFrom('userPermission', { tenant_id: tenantId, user_id: userId })` | `    await deleteFrom('userPermission', { tenant_id: id_organizacao, user_id: userId })` |
| 127 | OBJ_KEY | `user_id` | `    await deleteFrom('userPermission', { tenant_id: tenantId, user_id: userId })` | `    await deleteFrom('userPermission', { tenant_id: tenantId, id_usuario: userId })` |
| 127 | PRISMA_QUERY | `userId` | `    await deleteFrom('userPermission', { tenant_id: tenantId, user_id: userId })` | `    await deleteFrom('userPermission', { tenant_id: tenantId, user_id: id_usuario })` |
| 132 | OBJ_KEY | `tenant_id` | `        where: { tenant_id: tenantId, user_id: userId },` | `        where: { id_organizacao: tenantId, user_id: userId },` |
| 132 | CODE_OTHER | `tenantId` | `        where: { tenant_id: tenantId, user_id: userId },` | `        where: { tenant_id: id_organizacao, user_id: userId },` |
| 132 | OBJ_KEY | `user_id` | `        where: { tenant_id: tenantId, user_id: userId },` | `        where: { tenant_id: tenantId, id_usuario: userId },` |
| 132 | CODE_OTHER | `userId` | `        where: { tenant_id: tenantId, user_id: userId },` | `        where: { tenant_id: tenantId, user_id: id_usuario },` |
| 133 | OBJ_KEY | `user_id` | `        data: { user_id: 'DELETED_USER', actor_id: 'DELETED_USER' },` | `        data: { id_usuario: 'DELETED_USER', actor_id: 'DELETED_USER' },` |
| 139 | OBJ_KEY | `tenant_id` | `    await deleteFrom('user', { tenant_id: tenantId, clerk_user_id: userId })` | `    await deleteFrom('user', { id_organizacao: tenantId, clerk_user_id: userId })` |
| 139 | PRISMA_QUERY | `tenantId` | `    await deleteFrom('user', { tenant_id: tenantId, clerk_user_id: userId })` | `    await deleteFrom('user', { tenant_id: id_organizacao, clerk_user_id: userId })` |
| 139 | PRISMA_QUERY | `userId` | `    await deleteFrom('user', { tenant_id: tenantId, clerk_user_id: userId })` | `    await deleteFrom('user', { tenant_id: tenantId, clerk_user_id: id_usuario })` |
| 143 | CODE_OTHER | `userId` | `    userId,` | `    id_usuario,` |
| 144 | CODE_OTHER | `tenantId` | `    tenantId,` | `    id_organizacao,` |

### `servicos-global/configurador/server/services/permissionsService.ts` (30 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 7 | OBJ_KEY | `tenantId` | `  tenantId: string` | `  id_organizacao: string` |
| 8 | OBJ_KEY | `userId` | `  userId: string` | `  id_usuario: string` |
| 10 | CODE_OTHER | `companyId` | `  companyId?: string` | `  id_workspace?: string` |
| 21 | TS_TYPE_OR_VAR | `tenantId` | `    const { tenantId, userId, resource, action, companyId, productId } = input` | `    const { id_organizacao, userId, resource, action, companyId, productId } = input` |
| 21 | TS_TYPE_OR_VAR | `companyId` | `    const { tenantId, userId, resource, action, companyId, productId } = input` | `    const { tenantId, userId, resource, action, id_workspace, productId } = input` |
| 21 | TS_TYPE_OR_VAR | `userId` | `    const { tenantId, userId, resource, action, companyId, productId } = input` | `    const { tenantId, id_usuario, resource, action, companyId, productId } = input` |
| 25 | CODE_OTHER | `tenantId` | `      where: { id_usuario: userId, id_organizacao_usuario: tenantId },` | `      where: { id_usuario: userId, id_organizacao_usuario: id_organizacao },` |
| 25 | CODE_OTHER | `userId` | `      where: { id_usuario: userId, id_organizacao_usuario: tenantId },` | `      where: { id_usuario: id_usuario, id_organizacao_usuario: tenantId },` |
| 37 | COMMENT | `companyId` | `    // Se não houver companyId ou productId, não podemos verificar granularidade` | `    // Se não houver id_workspace ou productId, não podemos verificar granularidade` |
| 38 | CODE_OTHER | `companyId` | `    if (!companyId \|\| !productId) return false` | `    if (!id_workspace \|\| !productId) return false` |
| 45 | CODE_OTHER | `tenantId` | `        id_organizacao_usuario_permissao: tenantId,` | `        id_organizacao_usuario_permissao: id_organizacao,` |
| 46 | CODE_OTHER | `companyId` | `        id_workspace_usuario_permissao: companyId,` | `        id_workspace_usuario_permissao: id_workspace,` |
| 47 | CODE_OTHER | `userId` | `        id_usuario_usuario_permissao: userId,` | `        id_usuario_usuario_permissao: id_usuario,` |
| 59 | OBJ_KEY | `tenantId` | `  async getUserPermissions(tenantId: string, userId: string, companyId?: string) {` | `  async getUserPermissions(id_organizacao: string, userId: string, companyId?: string) {` |
| 59 | CODE_OTHER | `companyId` | `  async getUserPermissions(tenantId: string, userId: string, companyId?: string) {` | `  async getUserPermissions(tenantId: string, userId: string, id_workspace?: string) {` |
| 59 | OBJ_KEY | `userId` | `  async getUserPermissions(tenantId: string, userId: string, companyId?: string) {` | `  async getUserPermissions(tenantId: string, id_usuario: string, companyId?: string) {` |
| 62 | CODE_OTHER | `tenantId` | `        id_organizacao_usuario_permissao: tenantId,` | `        id_organizacao_usuario_permissao: id_organizacao,` |
| 63 | CODE_OTHER | `userId` | `        id_usuario_usuario_permissao: userId,` | `        id_usuario_usuario_permissao: id_usuario,` |
| 64 | CODE_OTHER | `companyId` | `        ...(companyId && { id_workspace_usuario_permissao: companyId }),` | `        ...(id_workspace && { id_workspace_usuario_permissao: id_workspace }),` |
| 73 | COMMENT | `company_id` | `    // DTO: mantém contrato externo (company_id, product_id, permission, created_at)` | `    // DTO: mantém contrato externo (id_workspace, product_id, permission, created_at)` |
| 75 | OBJ_KEY | `company_id` | `      company_id: r.id_workspace_usuario_permissao,` | `      id_workspace: r.id_workspace_usuario_permissao,` |
| 86 | OBJ_KEY | `tenantId` | `    tenantId: string,` | `    id_organizacao: string,` |
| 87 | OBJ_KEY | `companyId` | `    companyId: string,` | `    id_workspace: string,` |
| 88 | OBJ_KEY | `userId` | `    userId: string,` | `    id_usuario: string,` |
| 97 | CODE_OTHER | `tenantId` | `          id_organizacao_usuario_permissao: tenantId,` | `          id_organizacao_usuario_permissao: id_organizacao,` |
| 98 | CODE_OTHER | `companyId` | `          id_workspace_usuario_permissao: companyId,` | `          id_workspace_usuario_permissao: id_workspace,` |
| 99 | CODE_OTHER | `userId` | `          id_usuario_usuario_permissao: userId,` | `          id_usuario_usuario_permissao: id_usuario,` |
| 107 | CODE_OTHER | `tenantId` | `            id_organizacao_usuario_permissao: tenantId,` | `            id_organizacao_usuario_permissao: id_organizacao,` |
| 108 | CODE_OTHER | `companyId` | `            id_workspace_usuario_permissao: companyId,` | `            id_workspace_usuario_permissao: id_workspace,` |
| 109 | CODE_OTHER | `userId` | `            id_usuario_usuario_permissao: userId,` | `            id_usuario_usuario_permissao: id_usuario,` |

### `servicos-global/configurador/server/services/productCatalogService.ts` (6 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 212 | OBJ_KEY | `tenant_id` | `      tenant_id: n.id_organizacao_negociacao_especial,` | `      id_organizacao: n.id_organizacao_negociacao_especial,` |
| 496 | OBJ_KEY | `tenantId` | `  async activateProductsForTenant(tenantId: string, productKeys: string[]) {` | `  async activateProductsForTenant(id_organizacao: string, productKeys: string[]) {` |
| 502 | CODE_OTHER | `tenantId` | `              id_organizacao_config_produto_gravity: tenantId,` | `              id_organizacao_config_produto_gravity: id_organizacao,` |
| 507 | CODE_OTHER | `tenantId` | `            id_organizacao_config_produto_gravity: tenantId,` | `            id_organizacao_config_produto_gravity: id_organizacao,` |
| 516 | OBJ_KEY | `tenant_id` | `    return { activated: results.length, tenant_id: tenantId, products: productKeys }` | `    return { activated: results.length, id_organizacao: tenantId, products: productKeys }` |
| 516 | CODE_OTHER | `tenantId` | `    return { activated: results.length, tenant_id: tenantId, products: productKeys }` | `    return { activated: results.length, tenant_id: id_organizacao, products: productKeys }` |

### `servicos-global/configurador/server/services/productConfigService.ts` (9 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 13 | OBJ_KEY | `tenantId` | `  async getConfig(tenantId: string, productKey: string) {` | `  async getConfig(id_organizacao: string, productKey: string) {` |
| 17 | CODE_OTHER | `tenantId` | `          id_organizacao_config_produto_gravity: tenantId,` | `          id_organizacao_config_produto_gravity: id_organizacao,` |
| 29 | OBJ_KEY | `tenantId` | `    tenantId: string,` | `    id_organizacao: string,` |
| 37 | CODE_OTHER | `tenantId` | `          id_organizacao_config_produto_gravity: tenantId,` | `          id_organizacao_config_produto_gravity: id_organizacao,` |
| 42 | CODE_OTHER | `tenantId` | `        id_organizacao_config_produto_gravity: tenantId,` | `        id_organizacao_config_produto_gravity: id_organizacao,` |
| 57 | OBJ_KEY | `tenantId` | `  async listActiveProducts(tenantId: string) {` | `  async listActiveProducts(id_organizacao: string) {` |
| 60 | CODE_OTHER | `tenantId` | `        id_organizacao_config_produto_gravity: tenantId,` | `        id_organizacao_config_produto_gravity: id_organizacao,` |
| 74 | OBJ_KEY | `tenantId` | `  async disableProduct(tenantId: string, productKey: string) {` | `  async disableProduct(id_organizacao: string, productKey: string) {` |
| 77 | CODE_OTHER | `tenantId` | `        id_organizacao_config_produto_gravity: tenantId,` | `        id_organizacao_config_produto_gravity: id_organizacao,` |

### `servicos-global/configurador/server/services/tenantService.ts` (20 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 174 | OBJ_KEY | `tenantId` | `  async getTenantById(tenantId: string) {` | `  async getTenantById(id_organizacao: string) {` |
| 176 | CODE_OTHER | `tenantId` | `      where: { id_organizacao: tenantId },` | `      where: { id_organizacao: id_organizacao },` |
| 194 | OBJ_KEY | `tenantId` | `  async updateTenant(tenantId: string, data: {` | `  async updateTenant(id_organizacao: string, data: {` |
| 203 | CODE_OTHER | `tenantId` | `      where: { id_organizacao: tenantId },` | `      where: { id_organizacao: id_organizacao },` |
| 211 | OBJ_KEY | `tenantId` | `  async getCompanies(tenantId: string) {` | `  async getCompanies(id_organizacao: string) {` |
| 213 | CODE_OTHER | `tenantId` | `      where: { id_organizacao_workspace: tenantId },` | `      where: { id_organizacao_workspace: id_organizacao },` |
| 240 | OBJ_KEY | `tenantId` | `  async createCompany(tenantId: string, data: CreateCompanyInput) {` | `  async createCompany(id_organizacao: string, data: CreateCompanyInput) {` |
| 243 | CODE_OTHER | `tenantId` | `        id_organizacao_workspace: tenantId,` | `        id_organizacao_workspace: id_organizacao,` |
| 260 | OBJ_KEY | `tenant_id` | `      tenant_id: id_organizacao_workspace,` | `      id_organizacao: id_organizacao_workspace,` |
| 267 | OBJ_KEY | `tenantId` | `  async updateCompany(tenantId: string, companyId: string, data: {` | `  async updateCompany(id_organizacao: string, companyId: string, data: {` |
| 267 | OBJ_KEY | `companyId` | `  async updateCompany(tenantId: string, companyId: string, data: {` | `  async updateCompany(tenantId: string, id_workspace: string, data: {` |
| 274 | CODE_OTHER | `tenantId` | `      where: { id_workspace: companyId, id_organizacao_workspace: tenantId },` | `      where: { id_workspace: companyId, id_organizacao_workspace: id_organizacao },` |
| 274 | CODE_OTHER | `companyId` | `      where: { id_workspace: companyId, id_organizacao_workspace: tenantId },` | `      where: { id_workspace: id_workspace, id_organizacao_workspace: tenantId },` |
| 281 | CODE_OTHER | `companyId` | `      where: { id_workspace: companyId },` | `      where: { id_workspace: id_workspace },` |
| 298 | OBJ_KEY | `tenant_id` | `      tenant_id: id_organizacao_workspace,` | `      id_organizacao: id_organizacao_workspace,` |
| 305 | OBJ_KEY | `tenantId` | `  async deleteCompany(tenantId: string, companyId: string) {` | `  async deleteCompany(id_organizacao: string, companyId: string) {` |
| 305 | OBJ_KEY | `companyId` | `  async deleteCompany(tenantId: string, companyId: string) {` | `  async deleteCompany(tenantId: string, id_workspace: string) {` |
| 307 | CODE_OTHER | `tenantId` | `      where: { id_workspace: companyId, id_organizacao_workspace: tenantId },` | `      where: { id_workspace: companyId, id_organizacao_workspace: id_organizacao },` |
| 307 | CODE_OTHER | `companyId` | `      where: { id_workspace: companyId, id_organizacao_workspace: tenantId },` | `      where: { id_workspace: id_workspace, id_organizacao_workspace: tenantId },` |
| 312 | PRISMA_QUERY | `companyId` | `    await prisma.workspace.delete({ where: { id_workspace: companyId } })` | `    await prisma.workspace.delete({ where: { id_workspace: id_workspace } })` |

### `servicos-global/configurador/src/App.tsx` (3 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 19 | OBJ_KEY | `tenantId` | `  \| { name: 'tenant-detail'; tenantId: string }` | `  \| { name: 'tenant-detail'; id_organizacao: string }` |
| 148 | CODE_OTHER | `tenantId` | `  return <OrganizacaoDetalheAdmin tenantId={id_organizacao!} onBack={() => navigate('/admin/organizacoes')} />` | `  return <OrganizacaoDetalheAdmin id_organizacao={id_organizacao!} onBack={() => navigate('/admin/organizacoes')} />` |
| 252 | PROP_ACCESS | `tenantId` | `    if (next.name === 'tenant-detail') routerNavigate(`/admin/organizacoes/${next.tenantId}`)` | `    if (next.name === 'tenant-detail') routerNavigate(`/admin/organizacoes/${next.id_organizacao}`)` |

### `servicos-global/configurador/src/hooks/useHistoricoLogger.ts` (1 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 69 | OBJ_KEY | `user_id` | `      user_id: user.id,` | `      id_usuario: user.id,` |

### `servicos-global/configurador/src/hooks/useCarregarTipoUsuario.ts` (9 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 5 | COMMENT | `userId` | `// Cache por userId no nível de módulo: uma única chamada por sessão,` | `// Cache por id_usuario no nível de módulo: uma única chamada por sessão,` |
| 21 | TS_TYPE_OR_VAR | `userId` | `  const { isLoaded, isSignedIn, getToken, userId } = useAuth()` | `  const { isLoaded, isSignedIn, getToken, id_usuario } = useAuth()` |
| 24 | CODE_OTHER | `userId` | `    userId ? (roleCache.get(userId) ?? null) : null` | `    id_usuario ? (roleCache.get(id_usuario) ?? null) : null` |
| 27 | CODE_OTHER | `userId` | `    !!(userId && roleCache.has(userId))` | `    !!(id_usuario && roleCache.has(id_usuario))` |
| 32 | CODE_OTHER | `userId` | `    if (!isLoaded \|\| !isSignedIn \|\| !userId) return` | `    if (!isLoaded \|\| !isSignedIn \|\| !id_usuario) return` |
| 35 | CODE_OTHER | `userId` | `    if (roleCache.has(userId)) {` | `    if (roleCache.has(id_usuario)) {` |
| 36 | TS_TYPE_OR_VAR | `userId` | `      const cached = roleCache.get(userId)!` | `      const cached = roleCache.get(id_usuario)!` |
| 58 | CODE_OTHER | `userId` | `            roleCache.set(userId, dbRole)` | `            roleCache.set(id_usuario, dbRole)` |
| 67 | API_CALL | `userId` | `  }, [isLoaded, isSignedIn, userId, getToken])` | `  }, [isLoaded, isSignedIn, id_usuario, getToken])` |

### `servicos-global/configurador/src/pages/Core.tsx` (7 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 67 | TS_TYPE_OR_VAR | `companyId` | `  const companyId = sessionStorage.getItem('gravity_company_id')` | `  const id_workspace = sessionStorage.getItem('gravity_company_id')` |
| 102 | OBJ_KEY | `userId` | `    userId: user?.id,` | `    id_usuario: user?.id,` |
| 103 | PROP_ACCESS | `tenantId` | `    tenantId: currentUser.tenantId,` | `    id_organizacao: currentUser.id_organizacao,` |
| 116 | CODE_OTHER | `companyId` | `    if (!companyId) return` | `    if (!id_workspace) return` |
| 120 | CACHE_KEY | `companyId` | `        const res = await fetch(`/api/v1/workspaces/${companyId}/produtos`, {` | `        const res = await fetch(`/api/v1/workspaces/${id_workspace}/produtos`, {` |
| 148 | API_CALL | `companyId` | `  }, [companyId, getToken, isGravityAdmin])` | `  }, [id_workspace, getToken, isGravityAdmin])` |
| 244 | CODE_OTHER | `companyId` | `  if (!companyId) {` | `  if (!id_workspace) {` |

### `servicos-global/configurador/src/pages/Hub.tsx` (6 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 157 | TS_TYPE_OR_VAR | `companyId` | `  const companyId   = sessionStorage.getItem('gravity_company_id')` | `  const id_workspace   = sessionStorage.getItem('gravity_company_id')` |
| 175 | CODE_OTHER | `companyId` | `      if (!companyId) { setLoading(false); return }` | `      if (!id_workspace) { setLoading(false); return }` |
| 179 | CACHE_KEY | `companyId` | `        const res = await fetch(`${API_URL}/companies/${companyId}/products`, {` | `        const res = await fetch(`${API_URL}/companies/${id_workspace}/products`, {` |
| 199 | CACHE_KEY | `companyId` | `                await fetch(`${API_URL}/companies/${companyId}/products`, {` | `                await fetch(`${API_URL}/companies/${id_workspace}/products`, {` |
| 207 | CACHE_KEY | `companyId` | `                const refresh = await fetch(`${API_URL}/companies/${companyId}/products`, {` | `                const refresh = await fetch(`${API_URL}/companies/${id_workspace}/products`, {` |
| 225 | CODE_OTHER | `companyId` | `  }, [companyId])` | `  }, [id_workspace])` |

### `servicos-global/configurador/src/pages/OrganizacaoDetalheAdmin.tsx` (6 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 123 | OBJ_KEY | `tenantId` | `export function OrganizacaoDetalheAdmin({ tenantId, onBack }: { tenantId: string; onBack: () => void }) {` | `export function OrganizacaoDetalheAdmin({ id_organizacao, onBack }: { id_organizacao: string; onBack: () => void }) {` |
| 134 | TS_TYPE_OR_VAR | `tenantId` | `        const res = await adminTenantsApi.getById(tenantId)` | `        const res = await adminTenantsApi.getById(id_organizacao)` |
| 161 | TS_TYPE_OR_VAR | `tenant_id` | `          const logsRes = await fetch(`/api/v1/admin/historico-global/logs?tenant_id=${tenantId}`)` | `          const logsRes = await fetch(`/api/v1/admin/historico-global/logs?id_organizacao=${tenantId}`)` |
| 161 | CACHE_KEY | `tenantId` | `          const logsRes = await fetch(`/api/v1/admin/historico-global/logs?tenant_id=${tenantId}`)` | `          const logsRes = await fetch(`/api/v1/admin/historico-global/logs?tenant_id=${id_organizacao}`)` |
| 186 | CODE_OTHER | `tenantId` | `  }, [tenantId])` | `  }, [id_organizacao])` |
| 201 | CODE_OTHER | `tenantId` | `        <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: 24 }}>ID: <code style={{ color: '#818cf8' }}` | `        <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: 24 }}>ID: <code style={{ color: '#818cf8' }}` |

### `servicos-global/configurador/src/pages/OrganizacoesAdmin.tsx` (1 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 456 | OBJ_KEY | `tenantId` | `      onClick: (item) => navigate({ name: 'tenant-detail', tenantId: item.id }),` | `      onClick: (item) => navigate({ name: 'tenant-detail', id_organizacao: item.id }),` |

### `servicos-global/configurador/src/pages/Store.tsx` (3 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 283 | TS_TYPE_OR_VAR | `companyId` | `        const companyId = sessionStorage.getItem('gravity_company_id')` | `        const id_workspace = sessionStorage.getItem('gravity_company_id')` |
| 284 | CODE_OTHER | `companyId` | `        if (companyId) {` | `        if (id_workspace) {` |
| 285 | CACHE_KEY | `companyId` | `          await fetch(`${API_URL}/companies/${companyId}/products`, {` | `          await fetch(`${API_URL}/companies/${id_workspace}/products`, {` |

### `servicos-global/configurador/src/pages/admin/AdminLayout.tsx` (2 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 72 | OBJ_KEY | `tenantId` | `  useUserPreferences({ userId: user?.id, tenantId: 'gravity-hq' })` | `  useUserPreferences({ userId: user?.id, id_organizacao: 'gravity-hq' })` |
| 72 | OBJ_KEY | `userId` | `  useUserPreferences({ userId: user?.id, tenantId: 'gravity-hq' })` | `  useUserPreferences({ id_usuario: user?.id, tenantId: 'gravity-hq' })` |

### `servicos-global/configurador/src/pages/admin/HistoricoGlobalAdmin.tsx` (3 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 27 | OBJ_KEY | `tenant_id` | `  tenant_id: string` | `  id_organizacao: string` |
| 44 | CODE_OTHER | `user_id` | `  user_id?: string` | `  id_usuario?: string` |
| 49 | OBJ_KEY | `tenant_id` | `  tenant_id: string` | `  id_organizacao: string` |

### `servicos-global/configurador/src/pages/admin/ModalNcmAgendamentoSincronizacao.tsx` (2 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 386 | PROP_ACCESS | `tenant_id` | `                      key={r.tenant_id}` | `                      key={r.id_organizacao}` |
| 398 | PROP_ACCESS | `tenant_id` | `                      <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.78rem', flex: 1 }}>{r.tenan` | `                      <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.78rem', flex: 1 }}>{r.id_or` |

### `servicos-global/configurador/src/pages/admin/NcmIntegracaoAdmin.tsx` (1 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 157 | STRING | `tenant_id` | `      key: 'tenant_id',` | `      key: 'id_organizacao',` |

### `servicos-global/configurador/src/pages/admin/SegurancaAdmin.tsx` (4 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 23 | OBJ_KEY | `tenant_id` | `  tenant_id: string` | `  id_organizacao: string` |
| 68 | OBJ_KEY | `tenant_id` | `  tenant_id: string \| null` | `  id_organizacao: string \| null` |
| 326 | STRING | `tenant_id` | `    { key: 'tenant_id', label: t('admin.seguranca-admin.tabela.tenant'), tipo: 'texto', largura: '120px',` | `    { key: 'id_organizacao', label: t('admin.seguranca-admin.tabela.tenant'), tipo: 'texto', largura: '120px',` |
| 373 | STRING | `tenant_id` | `    { key: 'tenant_id', label: t('admin.seguranca-admin.tabela.tenant'), tipo: 'texto', largura: '140px',` | `    { key: 'id_organizacao', label: t('admin.seguranca-admin.tabela.tenant'), tipo: 'texto', largura: '140px',` |

### `servicos-global/configurador/src/pages/workspace/EmpresasParceiras.tsx` (1 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 152 | TS_TYPE_OR_VAR | `tenantId` | `  const idOrganizacao = currentUser.tenantId` | `  const idOrganizacao = currentUser.id_organizacao` |

### `servicos-global/configurador/src/pages/workspace/Organizacao.tsx` (2 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 93 | OBJ_KEY | `userId` | `function storageKey(userId: string \| undefined) {` | `function storageKey(id_usuario: string \| undefined) {` |
| 94 | CACHE_KEY | `userId` | `  return `gravity:workspace-ativo:${userId ?? 'anon'}`` | `  return `gravity:workspace-ativo:${id_usuario ?? 'anon'}`` |

### `servicos-global/configurador/src/pages/workspace/TabelaUsuarios.tsx` (1 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 40 | OBJ_KEY | `userId` | `  onDeactivate: (userId: string) => void` | `  onDeactivate: (id_usuario: string) => void` |

### `servicos-global/configurador/src/pages/workspace/Usuarios.tsx` (9 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 36 | OBJ_KEY | `userId` | `  usuarios: { userId: string; role: string; habilitado: boolean }[]` | `  usuarios: { id_usuario: string; role: string; habilitado: boolean }[]` |
| 168 | TS_TYPE_OR_VAR | `company_id` | `          const mappedUsers: TenantUser[] = apiUsers.map((u: { id: string; name?: string; email?: string; tipo_usuario?:` | `          const mappedUsers: TenantUser[] = apiUsers.map((u: { id: string; name?: string; email?: string; tipo_usuario?:` |
| 177 | COMMENT | `userId` | `          // Construir mapa de memberships: userId -> companyIds[]` | `          // Construir mapa de memberships: id_usuario -> companyIds[]` |
| 182 | OBJ_KEY | `company_id` | `                .filter((m: { is_active: boolean; company_id: string }) => m.is_active)` | `                .filter((m: { is_active: boolean; id_workspace: string }) => m.is_active)` |
| 183 | PROP_ACCESS | `company_id` | `                .map((m: { is_active: boolean; company_id: string }) => m.company_id)` | `                .map((m: { is_active: boolean; id_workspace: string }) => m.id_workspace)` |
| 265 | OBJ_KEY | `userId` | `  function handleToggleEspacoTrabalhoUser(filialId: string, userId: string) {` | `  function handleToggleEspacoTrabalhoUser(filialId: string, id_usuario: string) {` |
| 271 | PROP_ACCESS | `userId` | `          u.userId === userId ? { ...u, habilitado: !u.habilitado } : u` | `          u.id_usuario === id_usuario ? { ...u, habilitado: !u.habilitado } : u` |
| 378 | OBJ_KEY | `userId` | `  function espacosDoUsuario(userId: string): EspacoTrabalho[] {` | `  function espacosDoUsuario(id_usuario: string): EspacoTrabalho[] {` |
| 379 | TS_TYPE_OR_VAR | `userId` | `    const ids = membershipsMap[userId] ?? []` | `    const ids = membershipsMap[id_usuario] ?? []` |

### `servicos-global/configurador/src/pages/workspace/WorkspaceLayout.tsx` (2 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 67 | PROP_ACCESS | `tenantId` | `  useUserPreferences({ userId: currentUser.id \|\| user?.id, tenantId: currentUser.tenantId })` | `  useUserPreferences({ userId: currentUser.id \|\| user?.id, id_organizacao: currentUser.id_organizacao })` |
| 67 | OBJ_KEY | `userId` | `  useUserPreferences({ userId: currentUser.id \|\| user?.id, tenantId: currentUser.tenantId })` | `  useUserPreferences({ id_usuario: currentUser.id \|\| user?.id, tenantId: currentUser.tenantId })` |

### `servicos-global/configurador/src/services/apiClient.ts` (30 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 134 | OBJ_KEY | `tenant_id` | `  tenant_id: string` | `  id_organizacao: string` |
| 164 | OBJ_KEY | `tenant_id` | `  tenant_id: string` | `  id_organizacao: string` |
| 267 | OBJ_KEY | `tenant_id` | `    return request<{ workspace: { id: string; name: string; status: string; tenant_id: string } }>(` | `    return request<{ workspace: { id: string; name: string; status: string; id_organizacao: string } }>(` |
| 293 | OBJ_KEY | `tenant_id` | `  tenant_id: string` | `  id_organizacao: string` |
| 297 | OBJ_KEY | `company_id` | `    company_id: string` | `    id_workspace: string` |
| 315 | OBJ_KEY | `userId` | `  async promoteUser(userId: string, role: 'SUPER_ADMIN' \| 'ADMIN') {` | `  async promoteUser(id_usuario: string, role: 'SUPER_ADMIN' \| 'ADMIN') {` |
| 317 | CACHE_KEY | `userId` | `      `/admin/usuarios-globais/${userId}/promote`,` | `      `/admin/usuarios-globais/${id_usuario}/promote`,` |
| 360 | OBJ_KEY | `tenant_id` | `  tenant_id: string \| null` | `  id_organizacao: string \| null` |
| 636 | OBJ_KEY | `tenantId` | `  async listProducts(tenantId: string) {` | `  async listProducts(id_organizacao: string) {` |
| 637 | OBJ_KEY | `tenant_id` | `    return request<{ tenant_id: string; tenant_name: string; products: ConfigProdutoApi[] }>(` | `    return request<{ id_organizacao: string; tenant_name: string; products: ConfigProdutoApi[] }>(` |
| 638 | CACHE_KEY | `tenantId` | `      `/admin/tenants/${tenantId}/products`` | `      `/admin/tenants/${id_organizacao}/products`` |
| 642 | OBJ_KEY | `tenantId` | `  async activate(tenantId: string, productKey: string, config?: Record<string, unknown>) {` | `  async activate(id_organizacao: string, productKey: string, config?: Record<string, unknown>) {` |
| 644 | CACHE_KEY | `tenantId` | `      `/admin/tenants/${tenantId}/products/${productKey}/activate`,` | `      `/admin/tenants/${id_organizacao}/products/${productKey}/activate`,` |
| 649 | OBJ_KEY | `tenantId` | `  async deactivate(tenantId: string, productKey: string) {` | `  async deactivate(id_organizacao: string, productKey: string) {` |
| 651 | CACHE_KEY | `tenantId` | `      `/admin/tenants/${tenantId}/products/${productKey}/deactivate`,` | `      `/admin/tenants/${id_organizacao}/products/${productKey}/deactivate`,` |
| 670 | OBJ_KEY | `tenant_id` | `  tenant_id:    string` | `  id_organizacao:    string` |
| 703 | OBJ_KEY | `tenant_id` | `  tenant_id:   string` | `  id_organizacao:   string` |
| 728 | OBJ_KEY | `tenantId` | `  async triggerSync(tenantId: string) {` | `  async triggerSync(id_organizacao: string) {` |
| 730 | CACHE_KEY | `tenantId` | `      `/admin/ncm-integracao/sync/${tenantId}`,` | `      `/admin/ncm-integracao/sync/${id_organizacao}`,` |
| 748 | CODE_OTHER | `tenantId` | `  async executeManual(tenantId?: string) {` | `  async executeManual(id_organizacao?: string) {` |
| 753 | OBJ_KEY | `tenant_id` | `        body: JSON.stringify(tenantId ? { tenant_id: tenantId } : {}),` | `        body: JSON.stringify(tenantId ? { id_organizacao: tenantId } : {}),` |
| 753 | CODE_OTHER | `tenantId` | `        body: JSON.stringify(tenantId ? { tenant_id: tenantId } : {}),` | `        body: JSON.stringify(id_organizacao ? { tenant_id: id_organizacao } : {}),` |
| 792 | OBJ_KEY | `company_id` | `    return request<{ users: Array<{ id: string; name: string; email: string; tipo_usuario: string; created_at: string; m` | `    return request<{ users: Array<{ id: string; name: string; email: string; tipo_usuario: string; created_at: string; m` |
| 804 | OBJ_KEY | `company_id` | `  async setUserMembership(userId: string, data: { company_id: string; role: string }) {` | `  async setUserMembership(userId: string, data: { id_workspace: string; role: string }) {` |
| 804 | OBJ_KEY | `userId` | `  async setUserMembership(userId: string, data: { company_id: string; role: string }) {` | `  async setUserMembership(id_usuario: string, data: { company_id: string; role: string }) {` |
| 805 | CACHE_KEY | `userId` | `    return request<{ membership: { id: string } }>(`/v1/usuarios/${userId}/memberships`, {` | `    return request<{ membership: { id: string } }>(`/v1/usuarios/${id_usuario}/memberships`, {` |
| 811 | OBJ_KEY | `userId` | `  async updateUserRole(userId: string, role: string) {` | `  async updateUserRole(id_usuario: string, role: string) {` |
| 812 | CACHE_KEY | `userId` | `    return request<{ user: { id: string; tipo_usuario: string } }>(`/v1/usuarios/${userId}/role`, {` | `    return request<{ user: { id: string; tipo_usuario: string } }>(`/v1/usuarios/${id_usuario}/role`, {` |
| 824 | OBJ_KEY | `tenantId` | `  async getActiveProducts(tenantId: string) {` | `  async getActiveProducts(id_organizacao: string) {` |
| 826 | CACHE_KEY | `tenantId` | `      `/internal/check-access?tenantId=${tenantId}`` | `      `/internal/check-access?id_organizacao=${id_organizacao}`` |

### `servicos-global/configurador/src/services/catalogAdapter.ts` (2 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 230 | PROP_ACCESS | `tenant_id` | `            tenantId: n.tenant_id,` | `            tenantId: n.id_organizacao,` |
| 230 | OBJ_KEY | `tenantId` | `            tenantId: n.tenant_id,` | `            id_organizacao: n.tenant_id,` |

### `servicos-global/configurador/src/types/entidades.ts` (1 hits)

| Linha | Cat | Pat | Como esta | Como deve ficar |
|---:|---|---|---|---|
| 60 | OBJ_KEY | `tenantId` | `  tenantId: string // ID da Organização (Clerk/Gravity)` | `  id_organizacao: string // ID da Organização (Clerk/Gravity)` |