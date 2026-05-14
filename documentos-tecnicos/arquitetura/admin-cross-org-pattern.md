# Padrão Arquitetural — Admin Cross-Organização

> Documento técnico de referência para qualquer tela admin Gravity que
> precise listar/auditar dados de TODAS as organizações da plataforma.
>
> Criado em 2026-05-08 durante a entrega de `EmpresasEParceirosAdmin`.
> Reutilizar este padrão em telas futuras (auditoria cross-org, billing
> cross-org, deploy cross-org, etc.).

## Princípio

**Toda consulta admin que atravessa organizações deve fazer barulho.**
Não pode ser silenciosa, não pode ser invisível, não pode driblar o
isolamento por descuido. O sistema é desenhado para que o caminho
"correto" seja também o caminho "auditado".

## Componentes obrigatórios

### 1. Endpoint S2S no serviço dono dos dados (ex: Cadastros)

- Path: `/api/v1/admin/<recurso>` (preferir, não `/api/v1/cadastros/admin/...`).
- Auth: `requireInternalKey` (S2S only). Frontend NUNCA chama direto.
- NÃO usa `extrairIdOrganizacao`. Aceita filtro `?id_organizacao=` opcional.
- **Apenas GET**. Sem POST/PUT/DELETE — admin é read-only por design.
- **Apenas query string**. Sem body. Garante que filtros vão para audit log.
- **Teto duro de paginação** clamped em servidor (max 200).
- Retorna `alerta_volume: true` quando `total > 500`.
- Comentário `LINT-EXCEPTION` no topo (ver skill `lint-tenant-safety`,
  seção "Exceções permitidas").

### 2. Proxy no Configurador

Pipeline obrigatório:

```
requireAuth                      // valida JWT Clerk, popula req.auth
  → requireGravityAdmin          // bloqueia se tipo_usuario ∉ {SUPER_ADMIN, ADMIN}
  → fetch S2S ao serviço dono    // x-internal-key, query params espelhados
  → enrichment batch IN(...)     // 1 query Prisma, NUNCA N+1
  → audit log fire-and-forget    // AuditLogAdmin.create
  → resposta enriquecida
```

Regras:

- **Enrichment de `nome_organizacao`** com `prisma.organizacao.findMany({ where: { id_organizacao: { in: idsUnicos } } })` — **uma chamada**, não N. Validado em teste.
- **Audit log fire-and-forget** — `void prisma.auditLogAdmin.create(...).catch(log)`. Falha do audit NÃO derruba a resposta, mas é monitorada via alertas.
- **Mand. 08 — falha alta**: se `id_organizacao` não está em `Configurador.Organizacao` mas existe no recurso, o nome volta como `⟨organização removida⟩`. Visível, nunca silencioso.

### 3. Tabela `audit_log_admin` no Configurador

Model `AuditLogAdmin` em `configurador/prisma/schema.prisma`. Campos:

```
id_audit_log_admin             String   @id @default(cuid())
id_usuario_audit_log_admin     String
tipo_usuario_audit_log_admin   String
acao_audit_log_admin           String
recurso_audit_log_admin        String
filtros_audit_log_admin        Json
qtd_resultados_audit_log_admin Int
ip_origem_audit_log_admin      String
correlation_id_audit_log_admin String
data_criacao_audit_log_admin   DateTime @default(now())
```

Índices: `(id_usuario, data_criacao)`, `(acao, data_criacao)`, `(data_criacao)`.

### 4. UI — três camadas de aviso

**Camada 1 — Banner permanente:**
`CardBasicoGlobal variante="aviso"` com ícone Warning. Texto explica modo cross-org + audit log + read-only. Não dispensável (sem botão "X").

**Camada 2 — Modal volume > 500:**
`ModalGlobal` com `Warning` em laranja. Título "Resultado grande", texto sugerindo filtrar, botões `[Filtrar agora]` e `[Continuar mesmo assim]`. SEMPRE aparece quando `alerta_volume === true` — sem checkbox "não perguntar mais".

**Camada 3 — Audit log:**
Invisível ao usuário; visível em `audit_log_admin` para a equipe Gravity.

### 5. Filtro de organização

Usar `SelectOrganizacaoAdminGlobal` (`nucleo-global/Campos/select-organizacao-admin-global/`).
Autocomplete com debounce 300ms. **Proibido input livre de UUID.**

### 6. Coluna `nome_organizacao`

- Sticky-left (fixa à esquerda).
- Clicável → `/admin/organizacoes/:id_organizacao`.
- Quando organização foi removida → mostra `⟨organização removida⟩`.

### 7. Read-only

Edição/criação/inativação cross-org **proibidas na UI admin**. Mudanças continuam exclusivas das telas tenant. Razão: edição cross-org abre porta para violação de isolamento por engano humano.

## Implementação de referência

| Componente | Arquivo |
|:---|:---|
| Endpoint S2S | `servicos-global/cadastros/server/src/routes/admin-empresas.ts` |
| Proxy + audit | `servicos-global/configurador/server/routes/admin-empresas.ts` |
| Model audit | `configurador/prisma/schema.prisma` (`AuditLogAdmin`) |
| Schema Zod | `servicos-global/cadastros/shared/schemas/empresa.schema.ts` (`listaEmpresasAdminSchema`) |
| Página admin | `servicos-global/configurador/src/pages/admin/EmpresasEParceirosAdmin.tsx` |
| Autocomplete org | `nucleo-global/Campos/select-organizacao-admin-global/src/SelectOrganizacaoAdminGlobal.tsx` |
| Testes | `servicos-global/cadastros/__tests__/functional/admin-empresas.test.ts`, `servicos-global/configurador/server/__tests__/admin-empresas.proxy.test.ts` |

## Roadmap — Fase 2

A entrega atual (Opção B) é a vista cross-org global. A **Fase 2 (Opção A)**
é uma tab "Empresas e Parceiros" dentro de `OrganizacaoDetalheAdmin` (vista
única-org). Reutiliza o mesmo endpoint passando `?id_organizacao=<id>` no
query — sem novo backend. Backlog priorizado conforme demanda da equipe.

## Skill referência

- `skills/governanca/convencao-tecnica/lint-tenant-safety/SKILL.md` — Exceções permitidas
- `skills/produtos-gravity/configurador/admin/SKILL.md` — Empresas e Parceiros (Cross-Org)
- `skills/governanca/lei/cadastros-snapshot-policy/SKILL.md` — Nota sobre admin cross-org
