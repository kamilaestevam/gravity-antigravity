# Incidentes e Auditoria de Acessos

> Ultima atualizacao: 2026-03-31

---

## Incidente #001 — Escalada de Privilegio (master → admin)

| Campo | Detalhe |
|-------|---------|
| Data | 2026-03-31 |
| Severidade | P1 — High |
| Tipo | Broken Access Control + DEMO_MODE bypass latente |
| Usuario afetado | daniel@dmm-ie.com.br |
| Role esperado | `master` (cliente/tenant) |
| Comportamento observado | Conseguia navegar para `/admin/*` e ver a interface admin |
| Acesso a dados de API | Nao — APIs retornavam 403 corretamente |
| Status | Resolvido — 2026-03-31 |

---

### Causa Raiz

Foram encontradas **4 vulnerabilidades independentes**:

#### V1 — Frontend sem guarda de role na rota /admin (CRITICA)

**Arquivo:** `App.tsx:241`  
**Problema:** A rota `/admin` usava `ProtectedRoute`, que verifica apenas `isSignedIn`. Qualquer usuario autenticado (`master`, `standard`, etc.) conseguia navegar para `/admin/visao-geral` e ver a interface completa.

```tsx
// ANTES (vulneravel)
<Route path="/admin" element={<ProtectedRoute>...<AdminLayout />...</ProtectedRoute>}>

// DEPOIS (corrigido)
<Route path="/admin" element={<AdminRoute>...<AdminLayout />...</AdminRoute>}>
```

#### V2 — AdminLayout sem verificacao de role (CRITICA)

**Arquivo:** `AdminLayout.tsx:33`  
**Problema:** O componente `AdminLayout` nao verificava o role do usuario antes de renderizar. Renderizava a interface admin completa para qualquer usuario autenticado que chegasse na rota.

```tsx
// ANTES (vulneravel)
export function AdminLayout() {
  // nenhuma verificacao de role
  return <div className="ws-shell">...</div>
}

// DEPOIS (corrigido)
export function AdminLayout() {
  const role = user?.publicMetadata?.role as string | undefined
  if (user && role !== 'gravity_admin') {
    return <Navigate to="/hub" replace />
  }
  return <div className="ws-shell">...</div>
}
```

#### V3 — DEMO_MODE bypass em requireAuth (CRITICA — latente)

**Arquivo:** `requireAuth.ts:35–49`  
**Problema:** Se `DEMO_MODE=true` estivesse no ambiente, qualquer request sem token Bearer era automaticamente autenticado como o primeiro usuario `ADMIN` ou `SUPER_ADMIN` do banco. O `DEMO_MODE` nao estava ativo em producao, mas o codigo existia e era um risco.

```typescript
// REMOVIDO (codigo perigoso)
if (process.env.DEMO_MODE === 'true' && !authHeader?.startsWith('Bearer ')) {
  const demoUser = await prisma.user.findFirst({
    where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] } },
  })
  // autenticava como admin sem token
}
```

#### V4 — DEMO_MODE bypass em requireGravityAdmin (CRITICA — latente)

**Arquivo:** `requireGravityAdmin.ts:16–18`  
**Problema:** Se `DEMO_MODE=true`, a verificacao de `gravity_admin` era completamente ignorada — qualquer usuario passava pela middleware sem verificacao.

```typescript
// REMOVIDO (codigo perigoso)
if (process.env.DEMO_MODE === 'true') {
  return next() // bypass total de admin check
}
```

---

### Correcoes Aplicadas

| Arquivo | Mudanca |
|---------|---------|
| `App.tsx` | Criado `AdminRoute` que verifica `gravity_admin`; substituiu `ProtectedRoute` na rota `/admin` |
| `AdminLayout.tsx` | Adicionado check de role no inicio do componente (defesa em profundidade) |
| `requireAuth.ts` | Removido bloco `DEMO_MODE` completo |
| `requireGravityAdmin.ts` | Removido bloco `DEMO_MODE` completo |

---

### Como o Incidente Foi Detectado

Reportado manualmente pelo dono da plataforma ao observar que `daniel@dmm-ie.com.br`, um usuario criado do zero como cliente, conseguia acessar a URL `/admin/visao-geral` e ver a interface do painel interno.

---

### Acoes Tomadas Alem do Codigo

- `daniel@dmm-ie.com.br` foi removido do Clerk — usuario nao existe mais na plataforma
- Verificado que `dmmltda@gmail.com` e o unico usuario com `gravity_admin` no Clerk

---

### Licoes Aprendidas

1. **Guards de rota no frontend nao sao seguranca — sao UX.** O backend sempre precisa verificar. Mas isso nao significa que o frontend pode ser negligenciado — a ausencia de guard causou o incidente visivel.

2. **DEMO_MODE e codigo perigoso.** Bypasses de autenticacao para desenvolvimento nunca devem existir no codigo de producao. Se necessario para dev local, devem ser features branches ou arquivos `.local.ts` que nunca chegam ao main.

3. **Verificacao de role no frontend deve usar `ShellStore.currentUser.role`**, populado por `useMeSync` via `GET /api/v1/me` — dados que vem do Prisma, nao de `publicMetadata`. Nunca confiar em `localStorage`, claims do JWT, ou qualquer dado que venha do cliente.

4. **Defesa em profundidade vale a pena.** A segunda camada no `AdminLayout` tem custo zero e previne que um erro futuro de roteamento abra a vulnerabilidade novamente.

---

## Log de Auditorias

| Data | Tipo | Resultado | Responsavel |
|------|------|-----------|-------------|
| 2026-03-29 | Auditoria de seguranca geral | 26/37 itens OK | Ver `documentos-tecnicos/seguranca/auditoria-seguranca-2026-03-29.md` |
| 2026-03-31 | Auditoria de acesso admin — incidente #001 | 4 vulnerabilidades encontradas e corrigidas | Claude Code |
| 2026-04-16 | Refatoracao arquitetural — remocao do Clerk Organizations | Concluida sem incidentes | Claude Code |
| 2026-04-19 | Refatoracao #002 — eliminacao de publicMetadata de tenant, DDD cleanup | Concluida — 13 bugs auditados e corrigidos | Claude Code |

---

## Refatoracao #001 — Remocao do Clerk Organizations (2026-04-16)

| Campo | Detalhe |
|-------|---------|
| Data | 2026-04-16 |
| Tipo | Refatoracao arquitetural de autenticacao e multi-tenancy |
| Motivacao | O sistema de Organizations nativo do Clerk (B2B) foi identificado como ponto de acoplamento incorreto — roles e tenancy nao devem ser responsabilidade do IdP |
| Impacto | Backend, Frontend (Shell/Header), Nucleo Global (UsuarioGlobal) |
| Status | Concluido |

### O que foi removido

- Toda dependencia de `useOrganization`, `useOrganizationList`, `OrganizationSwitcher` do Clerk
- Fallback `t('shell.papel_membro')` no `Header.tsx` (exibia "Membro" — role nativo do Clerk Organizations)
- Fallback de avatar `'??'` no `Header.tsx` (exibia iniciais invalidas quando Clerk Organizations nao resolvia o nome)
- Qualquer logica de role baseada em `organizationMemberships` ou `orgRole` do Clerk

### O que foi implementado (Refatoracao #001)

- `publicMetadata.tenantId` e `publicMetadata.role` como unica ponte Prisma → Frontend *(nota: substituido em Refatoracao #002)*
- Hook `useSyncClerkToShell.ts` como sincronizador canonico *(removido em Refatoracao #002)*
- Prop `avatarUrl` no componente `UsuarioGlobal` — renderiza `user.imageUrl` do Clerk via ShellStore, com fallback para primeira letra do email
- Fallback de role na UI: `'Standard'` (consistente com `resolveRole()`) — nunca "Membro"

### Licoes Aprendidas (Refatoracao #001)

1. **O IdP autentica, o banco autoriza.** O Clerk sabe *quem* e o usuario; o Prisma sabe *o que* ele pode fazer e *a qual empresa* pertence.
2. **`publicMetadata` era o contrato entre os dois mundos** — substituido por `GET /api/v1/me` na Refatoracao #002 para eliminar dupla escrita e risk de stale data.
3. **Fallbacks de UI devem ser semanticamente corretos.** "Membro" e um conceito do Clerk Organizations que nao existe no modelo de negocio do Gravity. O fallback correto e `'Standard'`, que e um role real do sistema.

---

## Refatoracao #002 — Eliminacao do publicMetadata de Tenant (2026-04-19)

| Campo | Detalhe |
|-------|---------|
| Data | 2026-04-19 |
| Tipo | Refatoracao arquitetural de autenticacao — DDD Cleanup |
| Motivacao | `publicMetadata` como ponte criava stale data, dupla escrita, e race conditions. O banco Prisma ja e a fonte da verdade — o frontend precisava so de um endpoint para le-la. |
| Impacto | Backend (Configurador), Frontend (Shell/produtos), Audit trail (11 servicos tenant) |
| Status | Concluido |

### O que foi removido

- `syncRole.ts` — modulo que escrevia `publicMetadata: { tenantId, role }` no Clerk para usuarios de tenant
- Todas as chamadas a `syncRoleToClerk()` em `admin.ts`, `users.ts`, `tenantService.ts`, `set-super-admin.ts`
- `publicMetadata.tenantId` e `publicMetadata.role` dos fluxos de convite e promorcao de role
- Hook `useSyncClerkToShell.ts` — substituido por `useMeSync.ts`

### O que foi implementado

- `GET /api/v1/me` como canal unico Prisma → Frontend, com campos DDD em Portugues
- Hook `useMeSync.ts`: busca `/api/v1/me` com Bearer token Clerk, mapeia para `ShellStore.currentUser`
- `injectTenantGetter` + `injectUserNameGetter` em produtos: leem Zustand no momento exato do request (sem stale context)
- `x-user-name` header propagado em todas as chamadas S2S para audit trail correto
- `actor_name` nos logs de auditoria agora exibe nome real do usuario, nao CUID

### Licoes Aprendidas

1. **Clerk como JWT doorman puro.** O Clerk autentica (valida senha, 2FA, sessao). Ele nao precisa saber role ou tenantId de usuarios de tenant. O Prisma ja tem tudo isso.
2. **O endpoint `GET /api/v1/me` elimina todas as sincronizacoes.** Uma unica chamada autenticada retorna identidade completa. Sem dupla escrita, sem cache desatualizado, sem race condition de Clerk refresh.
3. **Nomes DDD em Portugues evitam confusao de mapeamento.** `tipo_usuario` e `id_organizacao_usuario` sao inequivocos — o agente nunca confunde com campos internos do Clerk.

---

## Proximas Auditorias Recomendadas

| O que auditar | Prioridade | Motivo |
|--------------|-----------|--------|
| Todas as rotas `/api/*` sem `requireAuth` | Alta | Garantir que nenhuma rota de dados esta exposta sem autenticacao |
| Headers CORS e rate limiting | Media | Pendente desde auditoria 29/03 |
| CI/CD: variaveis de ambiente em PRs | Alta | `DEMO_MODE` poderia ter sido commitado em CI |
| Logs de acesso ao Clerk Dashboard | Media | Verificar se houve acessos nao autorizados ao painel do Clerk |
