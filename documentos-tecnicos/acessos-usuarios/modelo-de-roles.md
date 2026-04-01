# Modelo de Roles — Gravity Platform

> Ultima atualizacao: 2026-03-31

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
| Armazenado em | `publicMetadata.role = 'gravity_admin'` no Clerk |

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
| Armazenado em | `publicMetadata.role = 'gravity_admin'` no Clerk |

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
| Armazenado em | `publicMetadata.role = 'MASTER'` no Clerk + `role = 'MASTER'` no banco |

---

### Role: standard

| Atributo | Valor |
|----------|-------|
| Pertence a | Cliente (organizacao / tenant) |
| Acesso | Conforme permissoes definidas pelo Master |
| Escopo | Apenas os workspaces onde foi habilitado, apenas os produtos com permissao |
| Restricoes | Nao gere outros usuarios (a menos que o Master libere explicitamente) |
| Quem atribui | Master da organizacao |

---

### Role: fornecedor

| Atributo | Valor |
|----------|-------|
| Pertence a | Cliente (organizacao / tenant) — tipo especial para acesso externo |
| Acesso | Conforme permissoes definidas pelo Master — **permissoes granulares sempre obrigatorias** |
| Escopo | Apenas os recursos explicitamente liberados |
| Caracteristica | Pode ter vinculos com multiplas organizacoes (cross-tenant) com o mesmo email |
| Quem atribui | Master da organizacao |

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

## Enum de Roles no Banco (Prisma)

```prisma
enum UserRole {
  SUPER_ADMIN  // Equipe Gravity — acesso total irrestrito
  ADMIN        // Equipe Gravity — acesso com permissoes explicitas
  MASTER       // Cliente — acesso total na organizacao
  STANDARD     // Cliente — acesso conforme permissoes do Master
  SUPPLIER     // Fornecedor — permissoes explicitas obrigatorias (cross-tenant)
}
```

**Armazenado em:** `configurador/prisma/schema.prisma` — modelo `User.role`

---

## Regras Criticas

1. O role do usuario **sempre vem do JWT/Clerk** — nunca do payload da requisicao
2. `master` **nunca recebe verificacao granular** — implica acesso total na organizacao
3. `fornecedor` **nunca tem acesso amplo** — sempre requer permissoes explicitas
4. `super_admin` so existe via seed — impossivel criar via UI ou API publica
5. Permissoes granulares sao **por workspace (`company_id`)** — acesso no workspace A nao implica acesso no workspace B
6. `publicMetadata` do Clerk e server-side — **clientes nao conseguem alterar por conta propria**
