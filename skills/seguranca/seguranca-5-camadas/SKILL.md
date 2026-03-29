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

## Camada 4 — Isolamento de Dados

**Proteção:** Mesmo com auth e permissão, dados de um tenant nunca vazam para outro.

| Mecanismo | Camada | Função |
|:---|:---|:---|
| Prisma Client Extensions | Código | Injeta `tenant_id` em toda query automaticamente |
| PostgreSQL RLS | Banco | Bloqueia acesso mesmo se o código falhar |

Duas camadas independentes de defesa. Ver skill `antigravity-tenant-isolation` para implementação completa.

**Regras críticas:**
- `tenant_id` NUNCA vem do body — sempre do JWT via middleware
- `product_id` é nullable por design (atividades sem produto são válidas)
- Unique constraints incluem `tenant_id`: `@@unique([tenant_id, slug])`

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

### Camada 4 — Isolamento
- [ ] `tenant_id` filtrado em toda query?
- [ ] `tenant_id` vem do JWT, nunca do body?
- [ ] RLS ativado para tabelas deste serviço?
- [ ] Teste de cross-tenant implementado?

### Camada 5 — Auditoria
- [ ] Mutações registradas no histórico?
- [ ] Tentativas de acesso negado logadas?
- [ ] Nenhum dado sensível nos logs de auditoria?
