# Override de Organização (Admin Gravity)

> **Pendência #4.** Permite que SUPER_ADMIN / ADMIN da Gravity visualize qualquer organização ativa da plataforma como se fosse Master dela — sem trocar de login, sem manipulação de banco, sem cópia de credenciais. Documentado aqui: motivação, fluxo end-to-end, regras de segurança, anti-padrões proibidos, plano de teste cross-tenant.

---

## 1. Motivação

A equipe Gravity precisa investigar incidentes, ajudar clientes em suporte, validar features em ambientes reais e auditar dados sem:

- **Pedir credenciais** ao cliente (LGPD + má prática de segurança).
- **Manipular o banco direto** (DBA com prisma studio em produção — risco enorme).
- **Manter login mock por organização** (drift; usuário "phantom" no DDD).

A solução é um *role-impersonation por request*: o admin Gravity envia, junto da request normal, um header `x-organizacao-override: <id_organizacao_alvo>`. Backend valida que o ator é admin, troca o contexto da request para a org alvo, persiste audit log, e o admin opera como Master daquela org durante aquela request.

Nada do estado da org alvo é copiado para a sessão do admin. Não há cache cruzado. Cada request é independentemente validada.

---

## 2. Quem pode ativar

Exclusivamente `tipo_usuario IN ('SUPER_ADMIN', 'ADMIN')` — verificado no banco (Mand. 01) via `/api/v1/me`, nunca via `publicMetadata` do Clerk.

Qualquer outro tipo de usuário (MASTER, PADRAO, FORNECEDOR) que envie o header recebe **403 OVERRIDE_NAO_AUTORIZADO** — defesa ruidosa, com log estruturado na linha de origem.

---

## 3. Fluxo end-to-end

```
┌──────────┐     1. Clica 🔑 "Trocar Organização" no menu do avatar
│ Frontend │
│ (admin)  │     2. Modal mostra lista de orgs ATIVAS (GET /api/v1/admin/organizacoes)
└────┬─────┘
     │           3. Admin escolhe org alvo. Frontend chama
     │              useOrganizacaoOverride().definirOverride({ id, nome })
     │              → ShellStore.organizacaoOverride = { ... }
     │              → localStorage 'gravity-shell-state' atualizado
     │              → navegação para /hub
     ▼
┌──────────────────┐
│ Browser dispara  │ 4. Qualquer fetch subsequente passa por
│ requests normais │    injetarHeaderOverride() do shell:
└────┬─────────────┘    → header 'x-organizacao-override: c<24chars>' adicionado
     │
     ▼
┌────────────────────────────────────────────────────────────┐
│ packages/resolver-organizacao/src/middleware.ts (Passo 8.5)│
│                                                            │
│ 5. Lê header.                                              │
│ 6. Verifica ctx.tiposUsuario ⊇ {SUPER_ADMIN, ADMIN}.       │
│    Não-admin → 403 OVERRIDE_NAO_AUTORIZADO.                │
│ 7. Valida formato CUID. Inválido → 400.                    │
│ 8. resolveOrganizacaoById(alvo) — Configurador valida que  │
│    org alvo está ATIVA. Inativa → 403 ORGANIZACAO_INACTIVE.│
│ 9. Reconstroi nomeSchema do alvo. Mismatch → 500.          │
│10. log.info('Override aceito').                            │
│11. dispararAuditOverride() — fire-and-forget POST para     │
│    /api/v1/internal/admin/audit-organizacao-override.      │
│12. Muta ctx:                                               │
│      idOrganizacaoOriginal ← ctx.idOrganizacao             │
│      idOrganizacao         ← alvo                          │
│      nomeSchema            ← schema do alvo                │
│      idWorkspace           ← undefined (admin escolhe)     │
└────┬───────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│ withOrganizacao(req, async db => ...) executa com        │
│ search_path apontando para o schema da org alvo. Admin   │
│ enxerga e edita dados da org alvo como Master dela.      │
└──────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ Em paralelo (fire-and-forget, sem await):                  │
│                                                            │
│ Configurador grava em AuditLogAdmin:                       │
│   acao   = 'admin.organizacao_override.trocar'             │
│   recurso = 'organizacao'                                  │
│   filtros = { id_organizacao_origem, id_organizacao_       │
│              destino, cross_org: true }                    │
│   id_usuario, tipo_usuario, ip_origem, correlation_id      │
└────────────────────────────────────────────────────────────┘
```

Marcação visual no frontend durante override:

- Banner âmbar fixo no topo (`BannerOrganizacaoOverride`) com botão "Voltar para Gravity".
- Borda dourada inset ao redor do shell layout (classe `.layout--override-ativo`).
- Item de menu "Trocar Organização" vira "Voltar para Gravity" (ícone `ArrowUUpLeft`, estilo dourado).
- `aoVoltarParaGravity` → `limparOverride()` + `navigate('/hub')`.

---

## 4. Persistência

| Camada | O que persiste | Onde | TTL |
|:---|:---|:---|:---|
| Frontend | `organizacaoOverride: { id, nome }` | `localStorage` (key `gravity-shell-state`) via Zustand `persist` | Até logout (`clearCurrentUser` zera) |
| Backend | 1 row por request com override aceito | `AuditLogAdmin` (Postgres, schema `public` do Configurador) | Permanente |
| Cache | Nenhum dado de override é cacheado | — | — |

O override sobrevive a refresh de página (localStorage), mas é zerado no logout para impedir vazamento entre usuários.

---

## 5. Regras de segurança

1. **Mand. 01 — Autorização do banco.** `currentUser.tipoUsuario` vem de `/api/v1/me` (Prisma), nunca de `publicMetadata` do Clerk.
2. **Mand. 04 — LIMBO.** Admin continua admin sob override: `tiposUsuario` no contexto NÃO é substituído. Admin não vira "Master da org alvo" no banco — apenas o `idOrganizacao` muda para isolamento de query.
3. **Mand. 08 — Falha alta.** Não-admin com header = 403 ruidoso com log estruturado, não silencia. Falha do audit log persistente é logada via `getLogger().warn()` mas NÃO derruba a troca (caso o pipeline esteja down, a feature continua operacional — Mand. 08 prevê fallback com rastro).
4. **Idempotência.** Override apontando para a própria org do ator é ignorado (no-op). Endpoint de audit rejeita origem == destino com 400 OVERRIDE_AUDIT_NOOP.
5. **Defesa em profundidade.** O frontend só adiciona o header se `tipoUsuario ∈ {SUPER_ADMIN, ADMIN}` (filtro client-side em `injetarHeaderOverride()`), mas o backend NÃO confia nisso — valida ator pelo JWT em todas as requests.
6. **CUID v1 obrigatório.** Header inválido = 400 OVERRIDE_FORMATO_INVALIDO. Reduz superfície de injeção SQL via header malformado.
7. **Schema-name mismatch.** Se `buildSchemaName(alvo) ≠ ctxAlvo.nomeSchema`, fail-fast com 500 OVERRIDE_SCHEMA_MISMATCH — sinal de corrupção, não tentar prosseguir.

---

## 6. Anti-padrões proibidos

❌ **Confiar no header sem verificar JWT.** O middleware sempre executa a validação Clerk + resolução de tiposUsuario ANTES de processar o header. Não há "atalho rápido".

❌ **Usar override para CRON / worker.** `withOrganizacaoContext` (background) recebe `idOrganizacao` diretamente — não há header HTTP. Override é exclusivamente para requests interativas de admin Gravity.

❌ **Salvar override em sessionStorage / cookies.** Persistência é `localStorage` via Zustand `persist`. Cookies vazariam o estado para requests não-API e o subdomínio.

❌ **Permitir override no banco do produto.** O override troca apenas `req.organizacao.idOrganizacao` no SDK. Produtos não devem ter campos de "modo override" em nenhum model — o estado é puramente de request.

❌ **Audit log síncrono no middleware.** Bloquearia toda request HTTP do admin no caminho crítico. Tem que ser fire-and-forget (Mand. 08 garante log da falha sem derrubar a request).

❌ **Permitir override para produtos que não usam o SDK.** Os 5 produtos legados (bid-frete, bid-cambio, bid-frete-internacional, simula-custo, e parte do pedido) usam `x-internal-key` + `x-id-organizacao` direto, fora do SDK. Wirar `injetarHeaderOverride()` nesses api-clients seria no-op (backend ignoraria). Aguardam migração para o SDK antes de habilitar override.

---

## 7. Plano de teste cross-tenant (Mand. 04)

**Cenário base:** Org Cliente XYZ tem pedido `P-001` no schema `tenant_<cuidXYZ>`. Admin Gravity (SUPER_ADMIN, vinculado a `c<gravity_org>`) ativa override apontando para XYZ e cria pedido `P-002` via UI.

| # | Ator | Ação | Resultado esperado |
|:--|:--|:--|:--|
| 1 | Admin (override=XYZ) | GET /api/v1/pedidos/P-001 | 200 — pedido visível (mesmo schema) |
| 2 | Admin (override=XYZ) | POST /api/v1/pedidos { ... } | 201 — `P-002` criado no schema de XYZ |
| 3 | Master legítimo de XYZ | GET /api/v1/pedidos | Vê `P-001` e `P-002` (admin não vazou nada para outro schema) |
| 4 | Master de outra org | GET /api/v1/pedidos | NÃO vê `P-002` (isolamento mantido) |
| 5 | Auditor | SELECT * FROM audit_log_admin WHERE acao = 'admin.organizacao_override.trocar' | Vê linhas com `id_organizacao_origem = c<gravity_org>`, `id_organizacao_destino = cuidXYZ` |
| 6 | PADRAO de XYZ | request com `x-organizacao-override: c<gravity_org>` | 403 OVERRIDE_NAO_AUTORIZADO + log estruturado |
| 7 | Admin (override=XYZ) | Org XYZ é suspensa via admin panel | Próxima request 403 ORGANIZACAO_INACTIVE |
| 8 | Admin | Logout | `organizacaoOverride` zerado; próximo login não restaura override |

---

## 8. Arquivos relevantes

| Camada | Arquivo |
|:---|:---|
| SDK middleware | `packages/resolver-organizacao/src/middleware.ts` (Passo 8.5 + `dispararAuditOverride`) |
| SDK types | `packages/resolver-organizacao/src/types.ts` (`idOrganizacaoOriginal` em `ContextoOrganizacao`) |
| Shell store | `servicos-global/shell/store/useShellStore.ts` (campo `organizacaoOverride`) |
| Shell hook | `servicos-global/shell/hooks/useOrganizacaoOverride.ts` |
| Shell utilitário | `servicos-global/shell/utils/inject-override-header.ts` |
| Shell banner | `servicos-global/shell/BannerOrganizacaoOverride.tsx` |
| Menu item | `nucleo-global/Layout/usuario-global/src/UsuarioGlobal.tsx` (props `temAcessoTrocarOrganizacao` etc.) |
| Modal | `servicos-global/configurador/src/components/modal-trocar-organizacao/` |
| Wire pages | `Hub.tsx`, `Core.tsx`, `Store.tsx`, `SelecionarWorkspace.tsx`, `workspace/WorkspaceLayout.tsx`, `admin/AdminLayout.tsx` |
| API client | `servicos-global/configurador/src/services/api-client.ts` (uso de `injetarHeaderOverride`) |
| Audit endpoint | `servicos-global/configurador/server/routes/admin-organizacao-override-audit.ts` |
| Mount | `servicos-global/configurador/server/index.ts` |
