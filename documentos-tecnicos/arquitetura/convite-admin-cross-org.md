# Convite Admin Cross-Org — Arquitetura

> **Data:** 2026-05-12
> **Autores:** Coordenador + Líder Técnico + QA do projeto Gravity
> **Status:** Entregue (commits `7a597453` → `9d47c20a`)
> **Escopo:** Configurador `/api/v1/admin/usuarios/convidar` + `/api/v1/usuarios/convidar` + middleware `requireAuth`

---

## 📌 Resumo executivo

A rota `POST /api/v1/admin/usuarios/convidar` foi reescrita para aceitar `id_organizacao_alvo` no body, corrigindo um bug P0 de multi-tenancy: SUPER_ADMIN convidando usuário para outra organização criava o registro na **própria org do ator** (Gravity HQ), ignorando silenciosamente a organização escolhida no formulário. O frontend (`UsuariosAdmin.tsx`) também foi refatorado — o select de organização era cosmético (state local nunca enviado ao backend).

A solução extraiu a lógica para um **service compartilhado** `convidar-usuario-service.ts`, consumido tanto pela rota admin (cross-org) quanto pela rota regular (intra-org Master). Backend agora aplica 9 validações em sequência, dentro de transação atômica, com rollback do convite Clerk se o DB falhar.

Paralelamente, foi resolvido um bug P1 latente no `requireAuth.ts`: quando o fallback por email encontrava múltiplos candidatos (mesmo email convidado em N organizações), bloqueava silenciosamente com 401 — provocando DoS de login para o usuário convidado em cross-org. A solução **Plan B v6 (lazy disambiguation)** consulta `clerkClient.invitations.getInvitationList({status:'accepted', limit:100})` apenas quando há ambiguidade (~1% dos casos), usando o `invitation.id` mais recente para resolver deterministicamente qual `pending_inv_*` virou o `user_*` real.

---

## 🎯 Bug P0 — Convite admin sem `id_organizacao_alvo`

### Sintoma (smoke do dono 2026-05-12)
SUPER_ADMIN logado em Gravity HQ tentou convidar `dmmltda+fornecedor71@gmail.com` como FORNECEDOR selecionando organização "CDE" no formulário. Resultado:
- Usuário criado na org **Gravity HQ** (a do ator), não em CDE
- Zero `UsuarioWorkspace` (sem vínculos)
- Modal mostrava "Nenhum workspace vinculado"

### Causa raiz

#### Backend (`server/routes/admin.ts:1551`)
```ts
// ❌ ANTES
const AdminInviteSchema = z.object({
  email_usuario: z.string().email().max(255),
  nome_usuario: z.string().min(1).max(200),
  tipo_usuario: z.enum(['SUPER_ADMIN', 'ADMIN', 'MASTER', 'PADRAO', 'FORNECEDOR']),
})
// Schema descartava silenciosamente id_organizacao_alvo enviado pelo frontend

const usuarioCriado = await prisma.usuario.create({
  data: {
    id_organizacao: req.auth.id_organizacao,  // ← sempre HQ do ator
    ...
  },
})
```

#### Bug adicional (`admin.ts:1582`)
```ts
// ❌ ANTES — checava na org do ATOR
const orgAtor = await prisma.organizacao.findUnique({
  where: { id_organizacao: req.auth.id_organizacao },  // ❌
  select: { hospeda_colaboradores_gravity: true },
})
// Validação `hospeda_colaboradores_gravity` deveria ser na ORG ALVO,
// não na do ator. Quando ator é Gravity HQ (hospeda=true), passa
// erroneamente — permite criar SUPER_ADMIN/ADMIN em orgs cliente.
```

#### Frontend (`src/pages/admin/UsuariosAdmin.tsx:330`)
```ts
// ❌ ANTES
async function handleInvite() {
  await adminUsuariosApi.convidar({
    email_usuario: email,
    nome_usuario: nome,
    tipo_usuario: nivelToRole(fTipo),
    // ❌ fOrg (state com nome_organizacao) NUNCA enviado ao backend
  })
}
```

O select de "Organização" no modal era puramente decorativo.

---

## 🏗️ Arquitetura da solução

### Visão geral

```
                ┌─────────────────────────────────────────────┐
                │ SUPER_ADMIN no /admin/usuarios               │
                │ Frontend: UsuariosAdmin.tsx                  │
                │  - SelectGlobal de Organização (CUID real)   │
                │  - Multiselect de Workspaces (lazy load)     │
                │  - aoConvidarUsuario(payload)                │
                └─────────────────┬───────────────────────────┘
                                  │
                                  │ POST /api/v1/admin/usuarios/convidar
                                  │ {
                                  │   id_organizacao_alvo: 'cmoarq...',
                                  │   email_usuario: 'fornecedor@x.com',
                                  │   nome_usuario: 'João',
                                  │   tipo_usuario: 'FORNECEDOR',
                                  │   workspaces_alvo: ['ws_a','ws_b']
                                  │ }
                                  ▼
                ┌─────────────────────────────────────────────┐
                │ Backend: admin.ts:1586                       │
                │  - Zod.strict() valida payload               │
                │  - Verifica req.auth.tipo_usuario === SAdmin │
                │  - Delega a convidarUsuarioService(...)      │
                └─────────────────┬───────────────────────────┘
                                  │
                                  ▼
                ┌─────────────────────────────────────────────┐
                │ convidar-usuario-service.ts (compartilhado)  │
                │ 9 validações em sequência:                   │
                │  1. Org alvo existe e ATIVA                  │
                │  2. hospeda_colaboradores_gravity (na ALVO)  │
                │  3. Pre-existence check (na ALVO)            │
                │  4. PADRAO/FORN exigem workspaces            │
                │  5. Anti-IDOR workspaces da org ALVO         │
                │  6. Compute acesso_workspaces_futuros        │
                │  7. clerkClient.invitations.createInvitation │
                │  8. prisma.$transaction(Usuario+UsuarioWS[]) │
                │  9. Try/catch: revoga Clerk se DB falhar     │
                │ Pós-tx: CP6 Portão 3 + Audit log cross-org   │
                └─────────────────┬───────────────────────────┘
                                  │
                                  ▼ (e-mail enviado pelo Clerk)
                ┌─────────────────────────────────────────────┐
                │ Convidado recebe email → clica → completa    │
                │ cadastro Clerk (cria user_XYZ)               │
                └─────────────────┬───────────────────────────┘
                                  │
                                  ▼
                ┌─────────────────────────────────────────────┐
                │ Webhook user.created (auth.ts:89)            │
                │  log-only — transição feita pelo requireAuth │
                │  no primeiro login (fallback por email)      │
                └─────────────────┬───────────────────────────┘
                                  │
                                  │ Primeiro login do convidado
                                  ▼
                ┌─────────────────────────────────────────────┐
                │ requireAuth.ts                                │
                │  busca por id_clerk_usuario=user_XYZ         │
                │    └─ não acha → fallback por email          │
                │       ├─ length=0 → 401                       │
                │       ├─ length=1 → UPDATE direto (99%)      │
                │       └─ length>1 → LAZY DISAMBIGUATION:     │
                │          getInvitationList({accepted}) →     │
                │          encontra invitation.id mais recente │
                │          UPDATE pending_inv_X → user_XYZ     │
                └─────────────────────────────────────────────┘
```

### Service compartilhado (SSOT)

`servicos-global/configurador/server/services/convidar-usuario-service.ts`

Consumido por:
- `POST /api/v1/usuarios/convidar` (rota regular — Master da própria org)
- `POST /api/v1/admin/usuarios/convidar` (rota admin — SUPER_ADMIN cross-org)

Diferença: rota regular passa `id_organizacao_alvo = req.auth.id_organizacao`; rota admin passa `id_organizacao_alvo` recebido no body.

---

## 🗃️ Schema das tabelas envolvidas

> ⚠️ **Mand. 02 preservado no escopo "convite":** os 8 commits diretamente relacionados ao convite cross-org (`14512725` → `6e4ce9cb`) não alteram `schema.prisma`. O commit paralelo `74670de9` (feature `status_usuario` INATIVO) estendeu o model `Usuario`, com autorização explícita do dono + Coordenador + Líder Técnico documentada na mensagem do commit.

### `Usuario` (`configurador/prisma/schema.prisma:114`)
| Campo | Tipo | Uso na entrega |
|---|---|---|
| `id_usuario` | `String @id @default(cuid())` | PK |
| `id_organizacao` | `String` | **Org ALVO** (não a do ator) |
| `id_clerk_usuario` | `String @unique` | `pending_inv_<id>` enquanto pendente; `user_<id>` após login |
| `email_usuario` | `String` | Unique por org (`@@unique([id_organizacao, email_usuario])`) |
| `tipo_usuario` | `enum UsuarioTipo` | SUPER_ADMIN / ADMIN / MASTER / PADRAO / FORNECEDOR |
| `acesso_workspaces_futuros` | `Boolean` | true quando workspaces_alvo='all' E tipo PADRAO/FORNECEDOR |

### `UsuarioWorkspace` (`schema.prisma:286`)
Vínculo usuário↔workspace. Criado em `createMany` dentro da transação para cada workspace em `workspacesParaVincular`.

### `Organizacao` (`schema.prisma:67`)
Campo crítico para a regra Gravity-interna: `hospeda_colaboradores_gravity: Boolean @default(false)`.

### `ProdutoGravityAssinatura` (`schema.prisma:160`)
Não é tocada na entrega de convite, mas referenciada via `aoVincularUsuarioAoWorkspace` (CP6 — propaga chaves Portão 3 do Cadeia 2 grosseira para os produtos contratados).

---

## ✅ 9 Validações do service

`server/services/convidar-usuario-service.ts:88-219`

| # | Validação | Erro lançado | Linha |
|---|---|---|---|
| 1 | Org alvo existe e `status_organizacao === 'ATIVO'` | `404 ORG_NOT_FOUND` | 88-95 |
| 2 | Regra Gravity-interna na **org ALVO**: SUPER_ADMIN/ADMIN só em org com `hospeda_colaboradores_gravity=true` | `403 TIPO_GRAVITY_EXIGE_ORG_GRAVITY` | 97-110 |
| 3 | Pre-existence na **org ALVO** (não na HQ) | `409 CONFLICT` | 112-123 |
| 4 | PADRAO/FORNECEDOR exigem `workspaces_alvo` (Mand. 08) | `400 VALIDATION_ERROR` | 125-132 |
| 5 | Anti-IDOR: workspaces pertencem à org ALVO + status ATIVO | `403 WORKSPACE_FORA_DA_ORG_ALVO` | 134-161 |
| 6 | Compute `acesso_workspaces_futuros` | (lógica) | 165-167 |
| 7 | Cria invitation no Clerk — try/catch para `duplicate_record` / `identifier_exists` / `form_identifier_exists` | `409 INVITATION_OR_USER_ALREADY_EXISTS` | 169-219 |
| 8 | `prisma.$transaction` cria `Usuario` + `UsuarioWorkspace[]` | (rollback automático) | 197-228 |
| 9 | Try/catch: se DB falhar após Clerk, revoga invitation Clerk | (fire-and-forget) | 197-228 |

### Pós-transação (best-effort)

- **CP6 auto-sync** (`convidar-usuario-service.ts:243-254`): para cada workspace vinculado em PADRAO/FORNECEDOR, chama `aoVincularUsuarioAoWorkspace` propagando chaves Portão 3 dos produtos contratados.
- **Audit log** (`convidar-usuario-service.ts:259-281`): registra com `id_organizacao_alvo` (org afetada). `metadata_ator_historico_log` carrega `id_organizacao_ator` + `tipo_usuario_ator` + `cross_org: boolean` para forense.

---

## 🔄 Plan B v6 — Lazy disambiguation

### Problema (P1)

`UserJSON` do Clerk v5 **não contém `invitation_id`** (verificado em `node_modules/@clerk/backend/dist/api/resources/JSON.d.ts:484`). O webhook `user.created` não tem como saber qual `pending_inv_*` virou o `user_*` que acabou de ser criado.

A transição `pending → real` acontece no **primeiro login** via fallback por email no `requireAuth.ts`. Antes da entrega:
- 1 candidato: vincula direto ✅
- >1 candidatos: **bloqueia silenciosamente com 401** ❌ (DoS de login)

### Solução

`server/middleware/requireAuth.ts:124-187`

Quando `candidates.length > 1`:

```ts
console.warn('[requireAuth] EMAIL_FALLBACK_AMBIGUO', { ... })

const acceptedList = await clerkClient.invitations.getInvitationList({
  status: 'accepted',
  limit: 100,  // QA P1 fix: paginação default de 10 é insuficiente
})

const acceptedByEmail = dataArr
  .filter(inv => inv.emailAddress === primaryEmail)
  .sort((a, b) => b.createdAt - a.createdAt)

for (const inv of acceptedByEmail) {
  const matched = candidates.find(c => c.id_clerk_usuario === `pending_${inv.id}`)
  if (matched) {
    await prisma.usuario.update({ ... })
    user = matched
    break
  }
}
```

### Características

- **Pay-for-use**: API Clerk extra apenas em ambiguidade (~1% dos casos)
- **Determinístico**: `invitation.id` é único, match exato
- **Idempotente**: UPDATE só acontece se acha candidato
- **Fail-loud** (Mand. 08): log alto + 401 explícito se não resolver

---

## 🛡️ Mandamentos atendidos

| Mand. | Aplicação |
|---|---|
| **01** (Clerk só auth) | Nenhum uso de `publicMetadata` para autorização. `id_clerk_usuario` é só identificador, decisões vêm do banco |
| **02** (schema intocável) | Zero migration. Tudo reusa modelos existentes |
| **04** (Limbo) | Master/SAdmin/Admin não precisam de `UsuarioWorkspace` quando alvo de convite (acesso por `tipo_usuario`) |
| **06** (Zod) | `AdminInviteSchema.strict().refine(...)` em `admin.ts:1576` e `ConvidarUsuarioSchema.strict().refine(...)` em `usuario.ts:42` |
| **08** (fail-closed) | Todas as falhas lançam `AppError` específico com `code` único. Lazy disambig logs ruidosos |
| **09** (Zod bilateral) | Frontend `adminUsuariosApi.convidar` tipo bate com `AdminInviteSchema`. Response tipada |

---

## ⚖️ Trade-offs aceitos

### 1. Pending órfão em duplicação cross-org
Se Master CDE convida `email@x.com` E Master ACME convida o mesmo email, mas o convidado aceita só o convite de CDE:
- ✅ CDE: `pending_inv_AAA` → `user_XYZ` (lazy disambig resolve)
- ⚠️ ACME: `pending_inv_BBB` fica órfão no banco até cleanup manual

**Mitigação:** endpoint `DELETE /usuarios/:id/convite` permite Master ACME revogar manualmente. Cron job de cleanup órfãos >30 dias fica como follow-up.

### 2. Dois caminhos de transição (`webhook` vs `fallback`)
Hoje o webhook `user.created` é log-only (não atualiza `pending_*` → `user_*`). A transição depende 100% do fallback no requireAuth. Trade-off conhecido — fallback é robusto, mas se algum dia adicionarmos webhook handler, ambos caminhos precisam ser idempotentes.

### 3. Pay-for-use no Clerk
Lazy disambig chama Clerk API extra em ambiguidade. Em pior caso (email genérico com 100 invitations aceitas), pode ter latência ~500ms no primeiro login. Aceitável (1% dos casos, primeiro login só).

---

## 🚨 Pontos cegos e follow-ups

### Imediatos
1. **Linter `@gravity/eslint-plugin-tenant-safety` não existe** — skill marcada como NÃO IMPLEMENTADO em `6621fbef`. Anti-padrões como `req.auth.id_organizacao` em rota cross-org não são detectados em CI. Defesa atual: revisão humana + testes funcionais.

2. **Unificação dos 2 modais (admin + workspace)** — Coord+Líder Técnico aprovaram como follow-up. Documento de pattern a escrever em sessão dedicada (`documentos-tecnicos/arquitetura/admin-cross-org-pattern.md` — referência futura).
   - Localização correta: `servicos-global/configurador/src/components/`, **NÃO** nucleo-global
   - Padrão: discriminated union via prop `contexto`
   - Sub-componente: `<SeletorWorkspaces>` em `nucleo-global/Campos/seletor-workspaces-global/`

3. **Testes funcionais** — entrega não inclui suite de testes funcionais para os 10 cenários da matriz QA. Deve ser feito em sessão dedicada.

### Médio prazo
4. **Webhook `user.created` ativo** — hoje só log. Quando Clerk adicionar `invitation_id` no payload (ou aceitar `external_id` na invitation), webhook poderá fazer match deterministico imediatamente, eliminando dependência do fallback.

5. **Rate limit em `/admin/usuarios/convidar`** — Coord recomendou ~20 convites/hora para mitigar abuso por SUPER_ADMIN comprometido. Não implementado nesta entrega.

6. **Rename `handleInvite` → `aoConvidarUsuario` em `workspace/Usuarios.tsx`** — convite Master intra-org ainda usa nome legado EN. Não tocado nesta entrega (escopo limitou-se ao admin). DDD-PT só foi aplicado em `UsuariosAdmin.tsx`. Tarefa de 5 minutos para próxima sessão.

7. **Cache stale após lazy disambiguation** — `userCache` em `requireAuth.ts:13` armazena entrada por 60s. Após o fallback fazer UPDATE de `id_clerk_usuario`, a entrada antiga (ainda apontando para `pending_inv_*` se houvesse — improvável porque `verify.sub` é o real) não interfere, mas se o admin REVERTER o vínculo (`DELETE /usuarios/:id/convite`), o cache pode permanecer stale por até 60s. Mitigação: cache TTL é curto; documentar comportamento esperado.

---

## 🔧 Troubleshooting

### Auditar Usuários potencialmente em org errada

```sql
-- Usuários FORNECEDOR/PADRAO sem nenhum UsuarioWorkspace
SELECT u.id_usuario, u.email_usuario, u.tipo_usuario, u.id_organizacao
FROM usuario u
LEFT JOIN usuario_workspace uw ON uw.id_usuario = u.id_usuario
WHERE u.tipo_usuario IN ('PADRAO', 'FORNECEDOR')
GROUP BY u.id_usuario, u.email_usuario, u.tipo_usuario, u.id_organizacao
HAVING COUNT(uw.id_usuario_workspace) = 0;
```

### Email duplicado cross-org (potencial ambiguidade)

```sql
SELECT email_usuario, COUNT(DISTINCT id_organizacao) AS orgs
FROM usuario
GROUP BY email_usuario
HAVING COUNT(DISTINCT id_organizacao) > 1;
```

### Convites pendentes Clerk (`pending_inv_*`) órfãos

```sql
SELECT id_usuario, email_usuario, id_organizacao, id_clerk_usuario,
       data_criacao_usuario
FROM usuario
WHERE id_clerk_usuario LIKE 'pending_inv_%'
  AND data_criacao_usuario < NOW() - INTERVAL '30 days'
ORDER BY data_criacao_usuario;
```

### Audit log de convites cross-org

```sql
SELECT id_historico_log, data_criacao_historico_log,
       id_ator_historico_log, id_recurso_historico_log,
       metadata_ator_historico_log->>'id_organizacao_ator' AS ator_org,
       id_organizacao AS alvo_org,
       detalhe_acao_historico_log
FROM historico_log
WHERE acao_historico_log = 'CONVIDAR'
  AND modulo_historico_log = 'usuarios'
  AND (metadata_ator_historico_log->>'cross_org')::boolean = true
ORDER BY data_criacao_historico_log DESC
LIMIT 50;
```

---

## 🔙 Como reverter

### Reverter toda a entrega
```bash
git reset --hard 7a597453   # USUARIO SEGURO (antes do fix)
```

### Reverter só os docs/skills (manter código)
```bash
git reset --hard 9d47c20a   # CROSS_ORG_ENTREGA_PRONTA (pré-docs)
```

### Recriar dados de teste apagados no pre-cleanup
Não recomendado — `dmmltda+fornecedor71@gmail.com` e `daniel@godati.com.br` foram dados contaminados, não devem voltar.

---

## 📚 Referências

### Commits desta entrega
| Hash | Descrição |
|---|---|
| `7a597453` | Checkpoint USUARIO SEGURO (pré-fix) |
| `14512725` | Backend: service compartilhado + admin/usuario routes + requireAuth |
| `fb2b7684` | Frontend: UsuariosAdmin.tsx + api-client.ts + rename DDD-PT |
| `6621fbef` | Skill linter marcada como NÃO IMPLEMENTADO |
| `088112e4` | QA fixes: P1 paginação + 2x P2 |
| `f57b7c51` | Fix Clerk identifier_exists |
| `9d47c20a` | Checkpoint CROSS_ORG_ENTREGA_PRONTA (pré-docs) |

### Skills atualizadas
- `skills/seguranca/permissoes/SKILL.md` — seção "Convite cross-org admin"
- `skills/seguranca/route-authorization/SKILL.md` — seção "Lazy disambiguation"
- `skills/governanca/lei/isolamento-organizacao/SKILL.md` — seção "Exceção controlada SUPER_ADMIN cross-org"
- `skills/produtos-gravity/configurador/admin/SKILL.md` — fluxo do form de convite
- `skills/governanca/convencao-tecnica/lint-tenant-safety/SKILL.md` — marcado NÃO IMPLEMENTADO

### Arquivos principais
- `servicos-global/configurador/server/services/convidar-usuario-service.ts` (NOVO)
- `servicos-global/configurador/server/routes/admin.ts:1576-1620`
- `servicos-global/configurador/server/routes/usuario.ts:258-360`
- `servicos-global/configurador/server/middleware/requireAuth.ts:88-200`
- `servicos-global/configurador/src/services/api-client.ts:660-700`
- `servicos-global/configurador/src/pages/admin/UsuariosAdmin.tsx:140-200, 320-400, 800-1010`
