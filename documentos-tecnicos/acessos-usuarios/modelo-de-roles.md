# Modelo de Roles — Gravity Platform

> Ultima atualizacao: 2026-04-19

---

## Principio Arquitetural Absoluto

> **O Clerk e exclusivamente um Provedor de Identidade (IdP). Ele nao gerencia multi-tenancy.**

O sistema de **Organizations nativo do Clerk foi completamente removido em 2026-04-16** e esta proibido para sempre. As seguintes regras nao admitem excecao:

1. **Fonte da Verdade de tenancy e role:** banco de dados (Prisma) — nao o Clerk. O Clerk e apenas um JWT doorman.
2. **Canal Prisma → Frontend:** endpoint `GET /api/v1/me` do Configurador, acessado com o Bearer token do Clerk. Devolve campos DDD em Portugues (`tipo_usuario`, `id_organizacao_usuario`, etc.).
3. **Consumo no frontend:** o hook `useMeSync` busca `/api/v1/me`, mapeia para o formato do ShellStore e chama `setCurrentUser`. **Nenhum componente le o Clerk diretamente** para exibir cargo ou avatar — todos leem o ShellStore.
4. **Roles validos:** apenas `SUPER_ADMIN`, `ADMIN`, `MASTER`, `STANDARD`, `SUPPLIER` (e `gravity_admin` para equipe interna). Qualquer outro valor — incluindo conceitos nativos do Clerk como `org:member`, `basic_member` ou "Membro" — e invalido e deve ser rejeitado.
5. **Fallback de role na UI:** o unico fallback permitido e `'Standard'`. Nunca exibir "Membro", "member", ou qualquer string de Organizations do Clerk.
6. **`publicMetadata` nao e mais escrito para roles de tenant** (MASTER, STANDARD, etc.). O backend removeu `syncRole.ts`. O `publicMetadata.role = 'gravity_admin'` continua sendo usado para acesso ao Admin Panel interno da Gravity, verificado por `requireGravityAdmin`.

---

## Cadeia 1 — Roles Globais

Definem **quem o usuario e** na plataforma. Sao atribuidos pelo sistema ou pelo Super Admin. Nao podem ser alterados por clientes.

```
Gravity (equipe interna)
├── super_admin   ← acesso total irrestrito, criado via seed
└── admin         ← acesso total de leitura, escrita conforme permissao do super_admin

Cliente (Organizacao / Tenant)
├── master        ← acesso total dentro da sua organizacao
├── standard      ← acesso conforme permissoes definidas pelo master
└── fornecedor    ← acesso conforme permissoes definidas pelo master (tipo especial)
```

---

### Role: super_admin

| Atributo | Valor |
|----------|-------|
| Pertence a | Equipe Gravity (interno) |
| Acesso | Irrestrito — ve e edita absolutamente tudo |
| Escopo | Admin Panel, Configurador, todos os tenants, todos os produtos |
| Quem atribui | Sistema via seed de banco — **impossivel criar via UI** |
| Armazenado em (Clerk) | `publicMetadata.role = 'gravity_admin'` — unico role que ainda usa Clerk publicMetadata |
| Frontend consome via | `GET /api/v1/me` → `useMeSync` → `ShellStore.currentUser.role` |

**Regra:** so pode existir via seed do banco. Nenhuma API publica permite criar ou promover um usuario para `super_admin`.

---

### Role: admin

| Atributo | Valor |
|----------|-------|
| Pertence a | Equipe Gravity (interno) |
| Acesso padrao | Pode **visualizar** tudo (Admin Panel, Configurador, todos os clientes) |
| Edicao | Somente onde o Super Admin concedeu permissao explicita |
| Escopo | Admin Panel, Configurador, todos os tenants, todos os produtos |
| Quem atribui | Super Admin via painel Admin |
| Armazenado em (Clerk) | `publicMetadata.role = 'gravity_admin'` — verificado por `requireGravityAdmin` |
| Frontend consome via | `GET /api/v1/me` → `useMeSync` → `ShellStore.currentUser.role` |

> Tecnicamente, tanto `super_admin` quanto `admin` usam `gravity_admin` como valor de role no Clerk. A diferenca entre eles e gerenciada pela tabela `GravityAdminPermission` no banco (quais recursos o admin pode editar). Isso simplifica a verificacao de acesso ao painel.

---

### Role: master

| Atributo | Valor |
|----------|-------|
| Pertence a | Cliente (organizacao / tenant) |
| Acesso | Total dentro da sua organizacao |
| Escopo | Configurador da organizacao, todos os workspaces, todos os produtos contratados |
| Pode | Convidar usuarios, habilitar workspaces, definir permissoes de Standard e Fornecedor |
| Restricoes | Nao acessa dados de outras organizacoes; **jamais acessa o Admin Panel da Gravity** |
| Quem atribui | Sistema — o primeiro usuario de uma organizacao e sempre Master |
| Armazenado em (banco) | `User.role = 'MASTER'` no Prisma |
| Frontend consome via | `GET /api/v1/me` → campo `tipo_usuario` → `useMeSync` → `ShellStore.currentUser.role` |
| Exibido na UI como | **Master** (via `resolveRole()` em `useMeSync.ts`) |

---

### Role: standard

| Atributo | Valor |
|----------|-------|
| Pertence a | Cliente (organizacao / tenant) |
| Acesso | Conforme permissoes definidas pelo Master |
| Escopo | Apenas os workspaces onde foi habilitado, apenas os produtos com permissao |
| Restricoes | Nao gere outros usuarios (a menos que o Master libere explicitamente) |
| Quem atribui | Master da organizacao |
| Armazenado em (banco) | `User.role = 'STANDARD'` no Prisma |
| Frontend consome via | `GET /api/v1/me` → campo `tipo_usuario` → `useMeSync` → `ShellStore.currentUser.role` |
| Exibido na UI como | **Standard** (via `resolveRole()`) |

---

### Role: fornecedor

| Atributo | Valor |
|----------|-------|
| Pertence a | Cliente (organizacao / tenant) — tipo especial para acesso externo |
| Acesso | Conforme permissoes definidas pelo Master — **permissoes granulares sempre obrigatorias** |
| Escopo | Apenas os recursos explicitamente liberados |
| Caracteristica | Pode ter vinculos com multiplas organizacoes (cross-tenant) com o mesmo email |
| Quem atribui | Master da organizacao |
| Armazenado em (banco) | `User.role = 'SUPPLIER'` no Prisma |
| Frontend consome via | `GET /api/v1/me` → campo `tipo_usuario` → `useMeSync` → `ShellStore.currentUser.role` |
| Exibido na UI como | **Fornecedor** (via `resolveRole()`) |

---

## Tabela Comparativa — Cadeia 1

| Capacidade | super_admin | admin | master | standard | fornecedor |
|:-----------|:-----------:|:-----:|:------:|:--------:|:----------:|
| Acessa Admin Panel | Sim | Sim | Nao | Nao | Nao |
| Edita Admin Panel | Sim | com permissao | Nao | Nao | Nao |
| Acessa Configurador | Sim | Sim | Sim (proprio) | Nao | Nao |
| Ve todos os tenants | Sim | Sim | Nao | Nao | Nao |
| Gerencia workspaces | Sim | com permissao | Sim (proprios) | Nao | Nao |
| Convida usuarios | Sim | com permissao | Sim | Nao | Nao |
| Define permissoes | Sim | com permissao | Sim | Nao | Nao |
| Acessa produtos contratados | Sim | Sim | Sim | com permissao | com permissao |
| Acesso cross-tenant | Sim | Sim | Nao | Nao | Sim (vinculado) |

---

## Cadeia 2 — Permissoes Granulares por Produto

Definem **o que o usuario pode fazer dentro de cada produto**. So se aplicam a `standard` e `fornecedor`. Usuarios `master` tem acesso total e nao passam por esta cadeia.

### Modulos universais (presentes em todo produto)

| Modulo | Permissao leitura | Permissao escrita |
|--------|------------------|------------------|
| Atividades | `atividades:read` | `atividades:write` |
| Email | `email:read` | `email:write` |
| WhatsApp | `whatsapp:read` | `whatsapp:write` |
| Relatorios | `relatorios:read` | `relatorios:write` |
| Gabi IA | `gabi:read` | `gabi:write` |

### Como as permissoes sao armazenadas

```prisma
model UserPermission {
  tenant_id   String   // isolamento por organizacao
  company_id  String   // workspace onde se aplica
  user_id     String   // usuario
  product_id  String   // produto ao qual pertence
  permission  String   // ex: 'email:write', 'simulacusto:read'
  granted_by  String   // clerk_id do Master que concedeu
}
```

### Regra de verificacao (ordem obrigatoria)

```
1. super_admin → acesso total, sem mais verificacoes
2. admin (gravity_admin) → leitura total; escrita verifica GravityAdminPermission
3. master → verifica apenas se e membro do tenant
4. standard / fornecedor → verifica permissao granular na tabela UserPermission
```

---

## Labels de Exibicao na UI

O frontend nunca exibe a chave interna do banco (`MASTER`, `SUPPLIER`, etc.). A funcao `resolveRole()` em `useMeSync.ts` converte o valor do campo `tipo_usuario` (retornado por `GET /api/v1/me`) para o label humano exibido no Header e no dropdown de perfil.

```typescript
// servicos-global/shell/hooks/useMeSync.ts
const ROLE_LABELS: Record<string, string> = {
  gravity_admin: 'Admin',     // equipe Gravity com acesso admin
  SUPER_ADMIN:   'Super Admin',
  ADMIN:         'Admin',
  MASTER:        'Master',
  STANDARD:      'Standard',
  SUPPLIER:      'Fornecedor',
}

function resolveRole(raw: string): string {
  return ROLE_LABELS[raw] ?? (raw || 'Standard')
}
```

**Roles invalidos na UI:** `'Membro'`, `'Member'`, `'org:member'`, `'basic_member'`, ou qualquer string nativa do Clerk Organizations. Se algum desses valores aparecer, significa que o Prisma nao tem o role correto para o usuario.

**Fallback:** se `tipo_usuario` retornar vazio, o sistema exibe `'Standard'` — nunca string hardcoded de Organizations.

---

## Enum de Roles no Banco (Prisma)

```prisma
enum TipoUsuario {
  SUPER_ADMIN  // Equipe Gravity — acesso total irrestrito
  ADMIN        // Equipe Gravity — acesso com permissoes explicitas
  MASTER       // Cliente — acesso total na organizacao
  STANDARD     // Cliente — acesso conforme permissoes do Master
  SUPPLIER     // Fornecedor — permissoes explicitas obrigatorias (cross-tenant)
}
```

**Armazenado em:** `configurador/prisma/schema.prisma` — modelo `Usuario.role`

---

## Regras Criticas

1. O role do usuario **sempre vem do Prisma via `GET /api/v1/me`** — nunca do payload da requisicao, nunca de Organizations do Clerk, nunca de localStorage. O Clerk e apenas o porteiro JWT.
2. O backend **nao escreve mais `publicMetadata` para roles de tenant** (MASTER, STANDARD, etc.) — o `syncRole.ts` foi removido em 2026-04-19. Excecao: `gravity_admin` no Clerk, exclusivo para equipe interna.
3. O frontend **nunca le o Clerk diretamente** para exibir cargo — le `useShellStore().currentUser.role`, que e populado pelo `useMeSync` via `GET /api/v1/me`.
4. `master` **nunca recebe verificacao granular** — implica acesso total na organizacao.
5. `fornecedor` **nunca tem acesso amplo** — sempre requer permissoes explicitas.
6. `super_admin` so existe via seed do banco — impossivel criar via UI ou API publica.
7. Permissoes granulares sao **por workspace (`company_id`)** — acesso no workspace A nao implica acesso no workspace B.
8. **Sistema de Organizations do Clerk esta banido** — nenhuma feature, componente ou rota pode depender de `useOrganization`, `useOrganizationList`, `OrganizationSwitcher` ou qualquer API de Organizations do Clerk.
