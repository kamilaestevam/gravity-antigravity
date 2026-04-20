# Diagrama e Configuracoes de Autenticacao (Clerk)

Este documento centraliza as regras, auditorias de seguranca e decisoes arquiteturais de autenticacao adotadas no **Gravity** utilizando o provedor *Clerk*.

O Clerk atua **exclusivamente** como **JWT doorman** — provedor de identidade (IdP) responsavel por autenticar o usuario, gerenciar senha, 2FA e sessao. Ele **nao** conhece tenants, roles de cliente, ou workspaces. Toda resolucao de multi-tenancy, role e acesso a Empresa e responsabilidade exclusiva do banco Prisma, acessada via `GET /api/v1/me`.

> **Regra absoluta:** O Clerk autentica *quem* e o usuario. O Prisma define *o que* ele pode fazer e *a qual organizacao* pertence.

---

## 1. Posicao do Clerk na Arquitetura (pós-Refatoracao #002)

```
[Usuario digita senha no Clerk]
         |
         v (Clerk emite JWT — Bearer token)
[Frontend: useMeSync chama GET /api/v1/me com Authorization: Bearer <token>]
         |
         v (Configurador valida JWT via @clerk/backend + consulta Prisma)
[Retorna DDD: { usuario: { tipo_usuario, id_organizacao_usuario, ... },
               organizacao: { ... },
               workspaces: [...] }]
         |
         v (useMeSync popula ShellStore)
[ShellStore.currentUser: { role, tenantId, ... }]
         |
         v
[Toda a UI le ShellStore — nunca o Clerk diretamente]
```

**O que o Clerk sabe:** email, senha, 2FA, sessao, e — exclusivamente para equipe interna — `publicMetadata.role = 'gravity_admin'`.

**O que o Clerk NAO sabe:** tenantId, role de tenant (MASTER, STANDARD, SUPPLIER), vinculos com Empresa, permissoes granulares.

---

## 2. Gestao de Contas — Organizations BANIDO

> **Decisao arquitetural de 2026-04-16 — inviolavel.**

O sistema de Organizations nativo do Clerk (B2B) foi **completamente removido** e esta **proibido para sempre**. As seguintes APIs e componentes **nunca** podem ser reintroduzidos:

- `useOrganization`, `useOrganizationList`, `OrganizationSwitcher`
- `organizationMemberships`, `orgRole`
- Qualquer conceito de `org:member`, `basic_member` ou "Membro" vindo do Clerk

**Por que foi removido:** roles e tenancy nao sao responsabilidade do IdP. O acoplamento causava stale data, dupla escrita e race conditions. O Prisma ja e a fonte da verdade — o frontend precisa apenas de um endpoint para le-la.

**O modelo atual:** "Personal Accounts" no Clerk (sem Organizations). O isolamento de tenant e feito 100% no Prisma. O Clerk apenas fornece o Bearer token que autentica o usuario no `GET /api/v1/me`.

---

## 3. Autenticacao e Verificacao

**Caminho no Clerk:** *Configure > User & Authentication > Email, Phone, Username*

- **Sign-up with Email (Ativo):** Permite o cadastro. *(Atencao: se a governanca B2B exigir ecossistema fechado (Invite-Only), desativar esta flag.)*
- **Verify at sign-up (Ativo):** Exige validacao com **codigo de e-mail (OTP)** — impede e-mails forjados.

---

## 4. Gestao de Sessoes (Seguranca e UX)

**Caminho no Clerk:** *Configure > Sessions*

Dois cronometros simultaneos:

1. **Maximum lifetime:** teto da sessao (ex: 7 dias). Independente de atividade, expira na data limite.
2. **Inactivity timeout:** cronometro de inatividade (ex: 24h). Protege terminais abandonados.

*Configuracao Adotada:* timeout de inatividade suficiente para jornada de escritorio, com expiracao compulsoria de ociosidade continua.

---

## 5. Webhooks e Sincronizacao Server-Side

**Caminho no Clerk:** *Configure > Webhooks*

O Clerk e isolado do PostgreSQL. A sincronizacao e feita via Webhooks.

- **Endpoint URL:** HTTPS absoluto apontando para a infraestrutura real.
  * *Testes locais:* Ngrok ou equivalente para transpor localhost.
  * *Producao:* `https://api.seu-dominio.../api/v1/webhooks`.

### Eventos monitorados

| Evento | Comportamento atual (pós-Refatoracao #002) |
|--------|---------------------------------------------|
| `user.created` | Localiza o registro com `clerk_user_id: "pending_<invitationId>"` criado no convite e substitui pelo `clerk_user_id` real do usuario recem-criado. **Nao cria tenant. Nao cria memberships.** Essas operacoes ja foram feitas pelo Bulk Insert no momento do convite. |
| `user.updated` | Atualiza `nome` e `email` no Prisma para manter paridade com o perfil do Clerk. |
| `user.deleted` | **Obrigatorio para LGPD.** Dispara expurgo em cascata ou desativacao no banco. |

---

## 6. Modo Development vs Production

A plataforma foi inicialmente testada em *Development* (tarja laranja).

Checklist de Go-Live:
1. Alteracao explicita de ambiente (chaves de API novas).
2. Configuracao dos registros DNS **CNAME** para dominio customizado (ex: `auth.gravity.com.br`).
3. Cadastramento das credenciais proprias de **Client ID e Secret no Google Cloud** (OAuth).

---

## 7. Mudancas Arquiteturais — Pivo 2026-04-16/19

### Refatoracao #001 — Remocao do Clerk Organizations (2026-04-16)

- Removido: `useOrganization`, `useOrganizationList`, `OrganizationSwitcher`
- Removido: fallback `"Membro"` (role nativo do Clerk Organizations)
- Implementado: `publicMetadata.tenantId` e `publicMetadata.role` como ponte temporaria *(substituida em #002)*

### Refatoracao #002 — Eliminacao do publicMetadata de Tenant (2026-04-19)

- **Removido:** `syncRole.ts` — modulo que escrevia `publicMetadata: { tenantId, role }` no Clerk para usuarios de tenant
- **Removido:** `publicMetadata.tenantId` e `publicMetadata.role` dos fluxos de convite e promocao de role
- **Removido:** hook `useSyncClerkToShell.ts`
- **Implementado:** `GET /api/v1/me` como canal unico Prisma → Frontend (campos DDD em Portugues)
- **Implementado:** hook `useMeSync.ts` — substitui `useSyncClerkToShell`
- **Resultado:** O Clerk nao armazena mais nenhum dado de negocio de tenant. Zero stale data, zero dupla escrita, zero race condition de Clerk refresh.

### O que AINDA usa publicMetadata

Unica excecao: `publicMetadata.role = 'gravity_admin'` para acesso ao Admin Panel interno da Gravity. Atribuido manualmente via Clerk Dashboard pelo super_admin. Ver `gestao-de-admins.md`.
