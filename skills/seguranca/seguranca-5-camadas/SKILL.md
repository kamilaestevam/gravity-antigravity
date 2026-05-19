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
| `x-chave-interna` em toda chamada S2S | Header obrigatório — **PRIORIDADE P1** |
| HTTPS obrigatório | Railway provê TLS automático; Cloudflare DNS com SSL Full mode |
| CSP (Content Security Policy) | Helmet com whitelist por serviço — Clerk, Cloudflare Turnstile, Google Fonts |
| DNS via Cloudflare | Nameservers delegados do Registro.br → Cloudflare (CNAME flattening para domínio raiz) |

### x-chave-interna — Prioridade P1

```typescript
// Middleware obrigatório em todo servidor que recebe chamadas internas
function requireInternalKey(req: Request, res: Response, next: NextFunction) {
  const key = req.headers['x-chave-interna']
  if (key !== process.env.CHAVE_INTERNA_SERVICO) {
    return res.status(403).json({
      error: { code: 'UNAUTHORIZED_SERVICE', message: 'Unauthorized service' }
    })
  }
  next()
}
```

```typescript
// Todo produto DEVE enviar o header ao chamar serviços de organização
orgAPI.get('/activities', {
  headers: { 'x-chave-interna': process.env.CHAVE_INTERNA_SERVICO }
})
```

> **P1 significa:** implementar ANTES de qualquer feature. Sem isso, qualquer processo na rede interna pode chamar serviços livremente.

---

## Camada 2 — Autenticação (Clerk APENAS — Mandamento 01)

**Proteção:** Toda request é de um usuário autenticado e verificável.

| Regra | Implementação |
|:---|:---|
| Clerk JWT em toda request | Token validado por `@clerk/backend` |
| Validação independente | Cada serviço valida o JWT — nunca confia no produto |
| Expiração curta | JWT expira em 1h (Clerk padrão) |
| Machine tokens para async | Service tokens para cron/retry (ver autenticacao-s2s) |
| **PROIBIDO** | Ler `publicMetadata.role` do Clerk para autorização |

```typescript
// CADA serviço valida independentemente — nunca confiar no produto
import { clerkMiddleware, requireAuth } from '@clerk/express'

app.use(clerkMiddleware())
app.use(requireAuth())
```

> **Regra inviolável:** o servidor de organização NUNCA confia no produto cegamente. Ele valida o JWT de forma independente. Clerk responde APENAS por autenticação — autorização vem do Prisma (Camada 3).

---

## Camada 3 — Autorização (Banco = fonte única da verdade — Mandamento 01)

**Proteção:** Mesmo autenticado, o usuário só acessa o que tem permissão.

| Verificação | Quem faz |
|:---|:---|
| Organização tem acesso ao produto? | Configurador (via API) |
| User tem permissão (`tipo_usuario`) para a ação? | Configurador (Prisma — `GET /api/v1/me`) |
| User pertence a esta organização? | JWT contém `id_organizacao`, validado contra Prisma |

```typescript
// Produto verifica com o Configurador antes de agir
const { allowed, tipo_usuario } = await fetch(
  `${CONFIGURATOR_URL}/api/check-access`,
  {
    headers: {
      'Authorization': `Bearer ${req.auth.token}`,
      'x-chave-interna': process.env.CHAVE_INTERNA_SERVICO!,
    }
  }
).then(r => r.json())

if (!allowed) throw new AppError('Sem permissão', 403, 'FORBIDDEN')
```

---

## Camada 4 — Isolamento de Organização (pós-pivô 2026-04-17)

**Proteção:** Mesmo com auth e permissão, dados de uma organização nunca vazam para outra. Após o pivô Schema-per-Organização ([ADR-001](../../../documentos-tecnicos/adr/ADR-001-schema-per-tenant.md)), o isolamento é **físico via PostgreSQL `search_path`** — não mais lógico via `WHERE id_organizacao = ?`.

| Mecanismo | Camada | Função |
|:---|:---|:---|
| **Schema-per-Organização** | Banco | 1 schema PostgreSQL por organização (`tenant_<cuid>` — prefixo histórico mantido como identificador real). Tabelas de produto **não têm coluna de organização** — o schema **é** a organização. |
| **`@gravity/resolver-organizacao` SDK** | Código | Único ponto de acesso ao DB. `withOrganizacao(req, async db => ...)` aplica `SET LOCAL search_path` dentro de `$transaction`. |
| **PgBouncer transaction mode** | Pool | `SET LOCAL` morre no `COMMIT`/`ROLLBACK`. Pool leak é matematicamente impossível. |
| **ESLint + CI lint** | Build | Bloqueia `import { PrismaClient } from '@prisma/client'` fora do SDK. |
| **PostgreSQL RLS** | Banco | Mantido **apenas** no Configurador (single-schema). Em bancos de produto, o `search_path` substitui RLS. |

Ver skill `antigravity-isolamento-organizacao` (reescrita 2026-04-17) e [ADR-002](../../../documentos-tecnicos/adr/ADR-002-tenant-resolver-sdk.md) para implementação completa.

**Regras críticas (pós-pivô):**
- O identificador de organização NUNCA vem do body — sempre de `req.organizacao.idOrganizacao` (API real do SDK, vem do `GET /api/v1/me` do Configurador, **nunca** do `publicMetadata` do Clerk — Mandamento 01)
- Acesso a banco de produto **exclusivamente** via `withOrganizacao(req, async db => ...)` ou `withOrganizacaoContext(idOrganizacao, fn)` para workers
- `import { PrismaClient }` direto é **proibido** fora do SDK — linter CI bloqueia deploy
- Tabelas de produto **NÃO** têm coluna de organização após Fase 4 da migração ([ADR-003](../../../documentos-tecnicos/adr/ADR-003-migracao-dados-legados.md))
- Cache prefixado por `organizacao:<idOrganizacao>:` ou `organizacao:_global:`; linter CI bloqueia chaves sem prefixo
- Pre-signed URLs S3: `tenant_<id>/...` no caminho (prefixo real de path S3), TTL ≤ 300s

---

## Camada 5 — Auditoria

**Proteção:** Toda alteração é registrada de forma imutável para compliance e debugging.

| O que auditar | Dados registrados |
|:---|:---|
| Toda criação | who, what, when, `id_organizacao` |
| Toda alteração | who, what, old_value, new_value, when |
| Toda deleção | who, what, deleted_data, when |
| Tentativas de acesso negado | who, what_attempted, when |

```typescript
// servicos-global/servicos-plataforma/historico intercepta automaticamente
// Middleware registrado no servidor de organizacao
app.use(auditMiddleware({
  ignore: ['GET'], // Só audita mutações
  sensitiveFields: ['password', 'token', 'secret'],
}))
```

> Logs de auditoria são **imutáveis** — nenhum endpoint de DELETE ou UPDATE para audit_logs.

---

## Checklist de Segurança — Obrigatório em Toda Entrega

### Camada 1 — Rede
- [ ] `x-chave-interna` em toda chamada S2S?
- [ ] Serviço não exposto publicamente (exceto marketplace/gateway)?
- [ ] Comunicação via rede interna Railway?

### Camada 2 — Autenticação
- [ ] JWT validado independentemente neste serviço?
- [ ] Machine tokens usados para ações assíncronas?
- [ ] Token nunca logado ou exposto em response?

### Camada 3 — Autorização
- [ ] `tipo_usuario` lido do Prisma via `GET /api/v1/me` — nunca do `publicMetadata` do Clerk (Mandamento 01)?
- [ ] Verificação de permissão via Configurador?
- [ ] Nenhum bypass de auth "para facilitar"?
- [ ] Nenhum fallback silencioso `(data?.x?.y ?? null) as TipoUsuario` (Mandamento 08)?

### Camada 4 — Isolamento (pós-pivô 2026-04-17)
- [ ] Acesso ao banco **exclusivamente** via `withOrganizacao(req, ...)` ou `withOrganizacaoContext(idOrganizacao, ...)` do `@gravity/resolver-organizacao`?
- [ ] Nenhum `import { PrismaClient } from '@prisma/client'` no código (exceto dentro do SDK)?
- [ ] Nenhum `new PrismaClient(`?
- [ ] Nenhum `WHERE id_organizacao = ?` em queries de banco de produto (o schema **é** a organização)?
- [ ] Identificador de organização lido de `req.organizacao.idOrganizacao` (API real do SDK), nunca do `publicMetadata` do Clerk?
- [ ] Toda chave de cache prefixada por `organizacao:<idOrganizacao>:` ou `organizacao:_global:`?
- [ ] Pre-signed URLs S3 com TTL ≤ 300s e `tenant_<id>/...` no caminho?
- [ ] Teste anti-cross-organização + teste de pool leak (`SET LOCAL` reset) implementados?

### Camada 5 — Auditoria
- [ ] Mutações registradas no histórico?
- [ ] Tentativas de acesso negado logadas?
- [ ] Nenhum dado sensível nos logs de auditoria?
