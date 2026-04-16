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

3. **Verificacao de role no frontend deve usar `publicMetadata` do Clerk** — dados server-side que o usuario nao consegue alterar. Nunca confiar em `localStorage`, claims do JWT, ou qualquer dado que venha do cliente.

4. **Defesa em profundidade vale a pena.** A segunda camada no `AdminLayout` tem custo zero e previne que um erro futuro de roteamento abra a vulnerabilidade novamente.

---

## Log de Auditorias

| Data | Tipo | Resultado | Responsavel |
|------|------|-----------|-------------|
| 2026-03-29 | Auditoria de seguranca geral | 26/37 itens OK | Ver `documentos-tecnicos/seguranca/auditoria-seguranca-2026-03-29.md` |
| 2026-03-31 | Auditoria de acesso admin — incidente #001 | 4 vulnerabilidades encontradas e corrigidas | Claude Code |
| 2026-04-16 | Refatoracao arquitetural — remocao do Clerk Organizations | Concluida sem incidentes | Claude Code |

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

### O que foi implementado

- `publicMetadata.tenantId` e `publicMetadata.role` como unica ponte Prisma → Frontend
- Hook `useSyncClerkToShell.ts` como sincronizador canonico: le `publicMetadata`, mapeia para labels humanos via `resolveRole()`, popula `ShellStore.currentUser`
- Prop `avatarUrl` no componente `UsuarioGlobal` — renderiza `user.imageUrl` do Clerk via ShellStore, com fallback para primeira letra do email
- Fallback de role na UI: `'Standard'` (consistente com `resolveRole()`) — nunca "Membro"

### Licoes Aprendidas

1. **O IdP autentica, o banco autoriza.** O Clerk sabe *quem* e o usuario; o Prisma sabe *o que* ele pode fazer e *a qual empresa* pertence.
2. **`publicMetadata` e o contrato entre os dois mundos.** Escrito pelo backend, lido pelo frontend — imutavel pelo cliente.
3. **Fallbacks de UI devem ser semanticamente corretos.** "Membro" e um conceito do Clerk Organizations que nao existe no modelo de negocio do Gravity. O fallback correto e `'Standard'`, que e um role real do sistema.

---

## Proximas Auditorias Recomendadas

| O que auditar | Prioridade | Motivo |
|--------------|-----------|--------|
| Todas as rotas `/api/*` sem `requireAuth` | Alta | Garantir que nenhuma rota de dados esta exposta sem autenticacao |
| Headers CORS e rate limiting | Media | Pendente desde auditoria 29/03 |
| CI/CD: variaveis de ambiente em PRs | Alta | `DEMO_MODE` poderia ter sido commitado em CI |
| Logs de acesso ao Clerk Dashboard | Media | Verificar se houve acessos nao autorizados ao painel do Clerk |
