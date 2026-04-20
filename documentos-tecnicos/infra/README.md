# Infraestrutura Gravity — Guia de Operações

Fonte de verdade para provisionamento, bootstrap e operações de infraestrutura da plataforma Gravity.

---

## AVISO CRÍTICO — Banco Vazio = 401

> O sistema **nunca** permite acesso sem provisionamento explícito do banco.  
> Esse é o comportamento correto. Não é bug. Não há bypass.

Ao subir um ambiente com banco zerado, **todas as rotas protegidas retornam `401 Unauthorized`** até que o bootstrap seja executado — mesmo que o usuário esteja autenticado no Clerk.

Ver seção [Bootstrap Obrigatório](#bootstrap-obrigatório-ambiente-limpo) abaixo.

---

## Topologia de Bancos

| Serviço | Banco | Responsabilidade |
|:--------|:------|:-----------------|
| `configurador` | `configurador-db` | Identidade global: organizacao, usuario, workspace, permissoes |
| `tenant-services` | `shared-db` | Serviços por tenant: email, dashboard, gabi, alertas, etc. |
| `pedido` | `shared-db` | Produto Pedido (schema-per-tenant via `withTenant`) |
| Outros produtos | banco próprio | Isolamento total por produto |

**Regra:** O Configurador é a única fonte de verdade de identidade. Produtos nunca acessam o banco do Configurador diretamente.

---

## Bootstrap Obrigatório — Ambiente Limpo

### Quando executar

Toda vez que o banco do Configurador for criado ou zerado:

- Criação de ambiente novo (Railway, dev local, CI)
- Após restore de backup zerado
- Após `DROP SCHEMA public CASCADE`

### Sequência obrigatória

```bash
# Passo 1 — Migrations: cria as tabelas DDD em branco
cd configurador
npx prisma migrate deploy

# Passo 2 — Bootstrap: cria org Gravity + Root Admin SUPER_ADMIN
cd servicos-global/configurador
npx tsx server/scripts/bootstrap-seed.ts

# Passo 3 — Produtos: popula catálogo de produtos no Hub
npx tsx server/scripts/seedProducts.ts

# Passo 4 — Validar
curl -H "Authorization: Bearer <token-clerk>" http://localhost:8005/api/v1/me
# Esperado: 200 OK com dados do usuário
```

### O que o bootstrap cria

| Registro | Valor |
|:---------|:------|
| `organizacao` | `{ name: "Gravity", slug: "gravity", status: "ACTIVE" }` |
| `usuario` | `{ email: "dmmltda@gmail.com", role: "SUPER_ADMIN", tenant_id: <org.id> }` |
| `clerk_user_id` | placeholder `bootstrap_<timestamp>` — auto-vinculado no primeiro login |

### Vinculação automática do Clerk no primeiro login

O `requireAuth` possui um fallback de email: se o `clerk_user_id` não bater, busca por email. Se encontrar **exatamente 1 candidato**, vincula automaticamente e libera o acesso. Isso garante que o Root Admin entre sem configuração adicional após o bootstrap.

### Comportamento esperado antes do bootstrap

| Ação | Resultado |
|:-----|:----------|
| Login no Clerk | Funciona — Clerk é independente |
| `GET /api/v1/me` | `401 Unauthorized` |
| Qualquer rota protegida | `401 Unauthorized` |

---

## Ordem de Subida dos Serviços

```
1. configurador        (sem dependências)
2. tenant-services     (depende do configurador para auth)
3. pedido / produtos   (dependem de configurador + tenant-services)
4. marketplace         (sem dependências — sobe a qualquer momento)
```

Verificar health antes de subir o próximo:
```bash
curl https://<servico>.railway.app/health
# { "status": "ok", "service": "nome-do-servico" }
```

---

## Scripts de Operação

| Script | Localização | Quando usar |
|:-------|:------------|:------------|
| `bootstrap-seed.ts` | `servicos-global/configurador/server/scripts/` | **Ambiente limpo — obrigatório** |
| `seedProducts.ts` | `servicos-global/configurador/server/scripts/` | Após bootstrap, popula catálogo |
| `set-super-admin.ts` | `servicos-global/configurador/server/scripts/` | Promover usuário existente para SUPER_ADMIN |
| `relink-clerk-user.ts` | `servicos-global/configurador/server/scripts/` | Revincula Clerk user ID manualmente |
| `list-tenants.ts` | `servicos-global/configurador/server/scripts/` | Inspecionar organizações no banco |
| `list-users.ts` | `servicos-global/configurador/server/scripts/` | Inspecionar usuários no banco |

---

## Referência de Skills

- Deploy completo → `skills/governanca/deploy/SKILL.md`
- Migrations e banco → `skills/infra-estrutura/database-operations/SKILL.md`
- Backup e DR → `skills/infra-estrutura/backup-disaster-recovery/SKILL.md`

---

**Última atualização:** 2026-04-19
**Responsável Técnico:** Antigravity AI
