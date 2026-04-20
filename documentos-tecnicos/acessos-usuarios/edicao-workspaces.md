# Edição de Workspaces de Usuário Existente

> Última atualização: 2026-04-20
> Feature: `PUT /api/v1/usuarios/:id/workspaces`
> Arquivo de implementação: `servicos-global/configurador/server/routes/users.ts`

---

## Contexto

Após o convite de um usuário, um Master pode alterar quais Empresas (workspaces) um Standard ou Supplier acessa. Esta operação é distinta do convite inicial — não cria o usuário, apenas substitui seus vínculos de `UsuarioWorkspace`.

---

## Endpoint

```
PUT /api/v1/usuarios/:id/workspaces
Authorization: Bearer <clerk_token>   (requireAuth + requireMasterRole)
Content-Type: application/json

{
  "workspaces": ["cld8n2b0j0000mhog...", "cld8n2b0j0001mhog..."]
}
```

### Resposta de Sucesso

```json
HTTP 200
{
  "workspaces": ["cld8n2b0j0000mhog...", "cld8n2b0j0001mhog..."]
}
```

---

## Schema de Validação (Zod — exportado como `UpdateWorkspacesSchema`)

```typescript
export const UpdateWorkspacesSchema = z.object({
  workspaces: z
    .array(z.string().cuid())
    .min(1, 'É necessário pelo menos um workspace')
    .refine(
      (ids) => new Set(ids).size === ids.length,
      'Workspaces duplicados não são permitidos',
    ),
})
```

O schema é **exportado** para uso em contract testing — qualquer alteração breaking no schema deve ser detectada pelo CI.

---

## Regras de Negócio

### 1. Guarda MASTER (400)

```
usuário alvo tem role === 'MASTER' → 400 INVALID_OPERATION
```

Master tem acesso a todos os workspaces via Bulk Insert snapshot no momento do convite. Substituir seus vínculos via este endpoint corromperia o modelo. Para alterar workspaces de um Master, use o fluxo de convite ou redesenhe via admin.

### 2. Usuário não encontrado (404)

`usuario.findFirst` com `{ id, tenant_id }` — se retornar `null`, lança `404 NOT_FOUND`. O filtro por `tenant_id` garante que um usuário de outro tenant nunca seja encontrado (sem vazar existência).

### 3. Prevenção IDOR (403)

```typescript
async function validarWorkspacesDoTenant(tenantId: string, workspaceIds: string[]): Promise<void> {
  const empresas = await prisma.empresa.findMany({
    where: { id: { in: workspaceIds }, tenant_id: tenantId, status: 'ACTIVE' },
    select: { id: true },
  })
  if (empresas.length !== workspaceIds.length) {
    throw new AppError('Um ou mais workspaces não pertencem a esta organização', 403, 'FORBIDDEN')
  }
}
```

Se qualquer ID enviado pertencer a outro tenant ou não existir como Empresa ATIVA, a operação falha antes de qualquer escrita. `$transaction` nunca é chamado.

### 4. Atomicidade ($transaction)

```typescript
async function substituirWorkspacesAtomicamente(
  tenantId: string, userId: string, workspaceIds: string[], role: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.usuarioWorkspace.deleteMany({
      where: { tenant_id: tenantId, user_id: userId },
    })
    await tx.usuarioWorkspace.createMany({
      data: workspaceIds.map((companyId) => ({
        tenant_id: tenantId, user_id: userId, company_id: companyId,
        role, is_active: true,
      })),
      skipDuplicates: true,
    })
  })
}
```

Delete + create rodam na mesma transação. Se `createMany` falhar, o `deleteMany` é revertido — nunca estado com zero workspaces.

---

## Audit Trail

O endpoint calcula o diff entre o estado anterior e o novo:

```typescript
const adicionados = workspaceIds.filter((id) => !antesIds.includes(id))
const removidos   = antesIds.filter((id) => !workspaceIds.includes(id))

if (adicionados.length > 0 || removidos.length > 0) {
  securityAudit.permissionChanged(tenantId, actorId, {
    targetUserId: userId,
    permission:   'workspace_access',
    action:       adicionados.length > 0 ? 'GRANTED' : 'REVOKED',
  }).catch(() => {})
}
```

| Cenário | `action` registrado |
|---|---|
| Apenas adições | `GRANTED` |
| Apenas remoções | `REVOKED` |
| Adições + remoções | `GRANTED` (adição tem precedência) |
| Sem diferença | Nenhum evento emitido |

O `.catch(() => {})` garante que falha no audit trail não bloqueia a resposta ao cliente — o audit é eventual, não blocking.

---

## Erros Possíveis

| HTTP | Código | Quando |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Body inválido (Zod) |
| `400` | `INVALID_OPERATION` | Usuário alvo é MASTER |
| `403` | `FORBIDDEN` | IDs de workspace de outro tenant |
| `404` | `NOT_FOUND` | Usuário não encontrado no tenant |
| `500` | `INTERNAL_ERROR` | Falha no `$transaction` |

Todos os erros usam `AppError` — o body **nunca** expõe stack trace.

---

## Testes

| ID | Tipo | Casos | Arquivo |
|---|---|---|---|
| `TST-UNIT-CONFIG-WSUP-001` | Unitário | 18 | `testes/testes-unitarios/configurador/usuarios/workspaces-put.test.ts` |
| `TST-FUN-CONFIG-WSUP-001` | Funcional | 18 | `testes/testes-funcionais/configurador/usuarios/workspaces-put.test.ts` |

Cobertura: happy path, validação Zod, regras de negócio (MASTER, NOT_FOUND, IDOR, falha DB), isolamento cross-tenant em toda query Prisma.

---

## Diferença vs. Convite Inicial

| | Convite (`POST /invite`) | Edição (`PUT /workspaces`) |
|---|---|---|
| **Quem pode usar** | Master | Master |
| **Alvo** | Usuário novo (pending_*) | Usuário existente |
| **Master** | Bulk Insert em todas as Empresas | Bloqueado (400) |
| **Standard/Supplier** | Cria vínculos no momento do convite | Substitui vínculos atomicamente |
| **Audit** | `roleChanged` (novo vínculo) | `permissionChanged` GRANTED/REVOKED |
