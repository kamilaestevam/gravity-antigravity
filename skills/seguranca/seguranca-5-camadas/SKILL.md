---
name: antigravity-seguranca-5-camadas
description: "Use esta skill como checklist de segurança obrigatório para toda entrega. Unifica as 5 camadas de proteção do Gravity (Rede, Autenticação, Autorização, Isolamento, Auditoria) em um framework verificável. Todo agente consulta esta skill antes de entregar qualquer código que toque em dados, auth ou comunicação entre serviços."
---

# Gravity — Segurança em 5 Camadas

## Visão Geral

Cada request na plataforma passa por 5 camadas de proteção independentes. Se uma falha, a próxima bloqueia. Todas as 5 devem estar implementadas.

```
Request → [1. Rede] → [2. Autenticação] → [3. Autorização] → [4. Isolamento] → [5. Auditoria] → Response
```

---

## Camada 1 — Rede

**Proteção:** Serviços internos não são acessíveis pela internet pública.

| Regra | Implementação |
|:---|:---|
| Comunicação interna via rede Railway | `*.railway.internal:PORT` |
| Sem exposição pública de serviços | Apenas marketplace e gateway são públicos |
| `x-internal-key` em toda chamada S2S | Header obrigatório — **PRIORIDADE P1** |
| HTTPS obrigatório | Railway provê TLS automático |

### x-internal-key — Prioridade P1

```typescript
// Middleware obrigatório em todo servidor que recebe chamadas internas
function requireInternalKey(req: Request, res: Response, next: NextFunction) {
  const key = req.headers['x-internal-key']
  if (key !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      error: { code: 'UNAUTHORIZED_SERVICE', message: 'Unauthorized service' }
    })
  }
  next()
}
```

```typescript
// Todo produto DEVE enviar o header ao chamar serviços
tenantAPI.get('/activities', {
  headers: { 'x-internal-key': process.env.INTERNAL_SERVICE_KEY }
})
```

> **P1 significa:** implementar ANTES de qualquer feature. Sem isso, qualquer processo na rede interna pode chamar serviços livremente.

---

## Camada 2 — Autenticação

**Proteção:** Toda request é de um usuário autenticado e verificável.

| Regra | Implementação |
|:---|:---|
| Clerk JWT em toda request | Token validado por `@clerk/backend` |
| Validação independente | Cada serviço valida o JWT — nunca confia no produto |
| Expiração curta | JWT expira em 1h (Clerk padrão) |
| Machine tokens para async | Service tokens para cron/retry (ver autenticacao-s2s) |

```typescript
// CADA serviço valida independentemente — nunca confiar no produto
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'

app.use(ClerkExpressRequireAuth())
```

> **Regra inviolável:** o servidor de tenant NUNCA confia no produto cegamente. Ele valida o JWT de forma independente.

---

## Camada 3 — Autorização

**Proteção:** Mesmo autenticado, o usuário só acessa o que tem permissão.

| Verificação | Quem faz |
|:---|:---|
| Tenant tem acesso ao produto? | Configurador (via API) |
| User tem permissão para a ação? | Configurador (roles + permissions) |
| User pertence a este tenant? | JWT contém tenant_id, verificado localmente |

```typescript
// Produto verifica com o Configurador antes de agir
const { allowed, role } = await fetch(
  `${CONFIGURATOR_URL}/api/check-access`,
  {
    headers: {
      'Authorization': `Bearer ${req.auth.token}`,
      'x-internal-key': process.env.INTERNAL_SERVICE_KEY!,
    }
  }
).then(r => r.json())

if (!allowed) throw new AppError('Sem permissão', 403, 'FORBIDDEN')
```

---

## Camada 4 — Isolamento de Dados (pós-pivô 2026-04-17)

**Proteção:** Mesmo com auth e permissão, dados de um tenant nunca vazam para outro. Após o pivô Schema-per-Tenant ([ADR-001](../../../documentos-tecnicos/adr/ADR-001-schema-per-tenant.md)), o isolamento é **físico via PostgreSQL `search_path`** — não mais lógico via `WHERE tenant_id = ?`.

| Mecanismo | Camada | Função |
|:---|:---|:---|
| **Schema-per-Tenant** | Banco | 1 schema PostgreSQL por tenant (`tenant_<uuid>`). Tabelas de produto **não têm `tenant_id`** — o schema **é** o tenant. |
| **`@gravity/tenant-resolver` SDK** | Código | Único ponto de acesso ao DB. `withTenant(req, async db => ...)` aplica `SET LOCAL search_path` dentro de `$transaction`. |
| **PgBouncer transaction mode** | Pool | `SET LOCAL` morre no `COMMIT`/`ROLLBACK`. Pool leak é matematicamente impossível. |
| **ESLint + CI lint** | Build | Bloqueia `import { PrismaClient } from '@prisma/client'` fora do SDK. |
| **PostgreSQL RLS** | Banco | Mantido **apenas** no Configurador (single-schema). Em bancos de produto, o `search_path` substitui RLS. |

Ver skill `antigravity-tenant-isolation` (reescrita 2026-04-17) e [ADR-002](../../../documentos-tecnicos/adr/ADR-002-tenant-resolver-sdk.md) para implementação completa.

**Regras críticas (pós-pivô):**
- `tenantId` NUNCA vem do body — sempre de `req.tenant` (vem do `GET /api/me` do Configurador, **nunca** do `publicMetadata` do Clerk)
- Acesso a banco de produto **exclusivamente** via `withTenant(req, async db => ...)` ou `withTenantContext(tenantId, fn)` para workers
- `import { PrismaClient }` direto é **proibido** fora do SDK — linter CI bloqueia deploy
- Tabelas de produto **NÃO** têm coluna `tenant_id` após Fase 4 da migração ([ADR-003](../../../documentos-tecnicos/adr/ADR-003-migracao-dados-legados.md))
- Cache prefixado por `tenant:<id>:` ou `tenant:_global:` (com justificativa) — linter CI bloqueia chaves sem prefixo
- Pre-signed URLs S3: `tenant_<id>/...` no caminho, TTL ≤ 300s

---

## Camada 5 — Auditoria

**Proteção:** Toda alteração é registrada de forma imutável para compliance e debugging.

| O que auditar | Dados registrados |
|:---|:---|
| Toda criação | who, what, when, tenant_id |
| Toda alteração | who, what, old_value, new_value, when |
| Toda deleção | who, what, deleted_data, when |
| Tentativas de acesso negado | who, what_attempted, when |

```typescript
// servicos-global/tenant/historico intercepta automaticamente
// Middleware registrado no servidor de tenant
app.use(auditMiddleware({
  ignore: ['GET'], // Só audita mutações
  sensitiveFields: ['password', 'token', 'secret'],
}))
```

> Logs de auditoria são **imutáveis** — nenhum endpoint de DELETE ou UPDATE para audit_logs.

---

## Checklist de Segurança — Obrigatório em Toda Entrega

### Camada 1 — Rede
- [ ] `x-internal-key` em toda chamada S2S?
- [ ] Serviço não exposto publicamente (exceto marketplace/gateway)?
- [ ] Comunicação via rede interna Railway?

### Camada 2 — Autenticação
- [ ] JWT validado independentemente neste serviço?
- [ ] Machine tokens usados para ações assíncronas?
- [ ] Token nunca logado ou exposto em response?

### Camada 3 — Autorização
- [ ] Verificação de permissão via Configurador?
- [ ] Roles validadas antes de ações sensíveis?
- [ ] Nenhum bypass de auth "para facilitar"?

### Camada 4 — Isolamento (pós-pivô 2026-04-17)
- [ ] Acesso ao banco **exclusivamente** via `withTenant(req, ...)` ou `withTenantContext(tenantId, ...)` do `@gravity/tenant-resolver`?
- [ ] Nenhum `import { PrismaClient } from '@prisma/client'` no código (exceto dentro do SDK)?
- [ ] Nenhum `new PrismaClient(`?
- [ ] Nenhum `WHERE tenant_id = ?` em queries de banco de produto (o schema **é** o tenant)?
- [ ] `tenantId` lido de `req.tenant`, nunca do `publicMetadata` do Clerk?
- [ ] Toda chave de cache prefixada por `tenant:<id>:` ou `tenant:_global:` (com justificativa)?
- [ ] Pre-signed URLs S3 com TTL ≤ 300s e `tenant_<id>/...` no caminho?
- [ ] Teste anti-cross-tenant + teste de pool leak (`SET LOCAL` reset) implementados?

### Camada 5 — Auditoria
- [ ] Mutações registradas no histórico?
- [ ] Tentativas de acesso negado logadas?
- [ ] Nenhum dado sensível nos logs de auditoria?
