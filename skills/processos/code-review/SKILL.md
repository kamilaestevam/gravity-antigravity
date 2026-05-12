---
name: antigravity-code-review
description: "Use esta skill para conduzir code reviews. Define padrões de revisão, checklist técnico, tempo máximo de resposta e regras de aprovação. Consultada pelo Líder Técnico ao revisar entregas de qualquer agente ou desenvolvedor."
---

# Gravity — Code Review

## Regra Fundamental

Todo código passa por review antes de merge. Nenhuma exceção. Nenhum "é urgente". O review é a última barreira antes do código ir para staging.

---

## Tempo Máximo de Resposta

| Tipo | Tempo máximo |
|:---|:---|
| Bug fix P0 (produção) | 2 horas |
| Bug fix P1 | 4 horas |
| Feature/refactor | 24 horas úteis |

> Review que passa de 24h úteis → Líder escala.

---

## Checklist Técnico do Reviewer

### Segurança (bloqueia merge se falhar) — pós-pivô 2026-04-17 + DDD 2026-04-19

- [ ] Toda rota tem validação Zod (Mandamento 06)?
- [ ] Acesso ao banco de produto **exclusivamente** via `withOrganizacao(req, ...)` ou `withOrganizacaoContext(idOrganizacao, ...)` do `@gravity/resolver-organizacao`?
- [ ] **Nenhum** `import { PrismaClient } from '@prisma/client'` fora do SDK?
- [ ] **Nenhum** `new PrismaClient(`?
- [ ] **Nenhum** `WHERE id_organizacao = ?` em models de produto (o schema **é** a organizacao — Schema-per-Organizacao)?
- [ ] **Nenhum** `SET search_path` sem `LOCAL` ou fora de `$transaction`?
- [ ] `idOrganizacao` lido de `req.organizacao` (API real do SDK) — **NUNCA** do `publicMetadata` do Clerk (Mandamento 01)?
- [ ] **Nenhuma autorização** baseada em `currentUser.publicMetadata.role` — sempre via `/api/v1/me` + Prisma (Mandamento 01)?
- [ ] `x-chave-interna` em chamadas S2S?
- [ ] Chaves de cache prefixadas por `organizacao:<idOrganizacao>:` ou `organizacao:_global:`?
- [ ] Erros via `AppError` (nunca `res.status().json()` direto)?
- [ ] Nenhum dado sensível em logs?
- [ ] Nenhuma variável hardcoded?
- [ ] **Nenhum** `useState<T>({} as T)` — sempre `useState<T | null>(null)` + tratamento (Mandamento 05)?
- [ ] **Nenhum** fallback silencioso em autorização tipo `(data?.x?.y ?? null) as Role` (Mandamento 08)?
- [ ] Schemas Zod do front refletem o payload do back no MESMO commit (Mandamento 07 + 09)?
- [ ] **Nenhum** `schema.prisma` editado (apenas Coordenador, via script — Mandamento 02)?

> Consultar [ADR-001](../../../documentos-tecnicos/adr/ADR-001-schema-per-tenant.md), [ADR-002](../../../documentos-tecnicos/adr/ADR-002-tenant-resolver-sdk.md), `antigravity-isolamento-organizacao`, `antigravity-tier1-security`, `9-mandamentos`.

### Qualidade de Código

- [ ] TypeScript strict, sem `any`?
- [ ] Funções ≤ 50 linhas?
- [ ] Nenhum código morto ou comentado?
- [ ] Naming segue convenções (camelCase, PascalCase, snake_case)?
- [ ] Imports via aliases?

### Testes

- [ ] Testes unitários presentes?
- [ ] Testes funcionais para rotas?
- [ ] Teste de cross-organizacao (se serviço da Organizacao)?
- [ ] Cobertura ≥ 70%?

### Wiring de cadeia completa em endpoints de mutação (pós-bug 2026-05-06)

Pra cada PATCH/POST/PUT adicionado/modificado, validar:

- [ ] Campo existe no schema Prisma (migration aplicada)?
- [ ] Schema Zod do **request** lista o campo + validações específicas?
- [ ] Rota grava via `prisma.update/create({ data: ... })` (não silenciosamente descartado)?
- [ ] Tipo TS da entidade no frontend (e do api-client) tem o campo?
- [ ] Schema Zod da **response** existe + frontend faz `.parse()` antes de usar?
- [ ] Modal/form `useEffect` popula state com valor existente (não limpa ao abrir)?
- [ ] Teste funcional cobre PATCH→GET confirmando persistência (não só status 200)?

> Faltar qualquer item = bug silencioso (UI mente sobre persistência). Esse foi exatamente o padrão do bug `/admin/organizacoes` em 2026-05-06: 5 campos cadastrais ignorados por meses porque a cadeia de 5 elos (Prisma → Zod request → rota → tipo TS → Zod response) tinha wiring incompleto.

---

### Arquitetura

- [ ] Escopo respeitado (agente só escreveu na sua pasta)?
- [ ] Sem import cruzado entre serviços?
- [ ] Comunicação entre serviços via API (não import)?
- [ ] Schema de produto segue padrão Schema-per-Organizacao (sem filtro por `id_organizacao` em queries — o schema **é** a organizacao)?
- [ ] Migrations de produto rodam via orquestrador `scripts/ativamente/migrate-all-tenants.ts` (nunca `prisma migrate dev` solto)?

### Documentação e Skills (inviolável — DoD §6)

- [ ] `documentos-tecnicos/` foi atualizado se a entrega muda contrato/regra/arquitetura?
- [ ] Skill(s) impactada(s) foi(ram) revisada(s) ou refatorada(s)?
- [ ] Nova skill foi criada se a entrega introduz padrão novo (ex: novo SDK, novo middleware)?
- [ ] PR contém commits visíveis em `documentos-tecnicos/` e/ou `skills/` quando aplicável?

> Sem update de docs/skills quando a entrega muda padrão = **blocker**.

---

## Como Dar Feedback

### Categorias de Comentário

| Prefixo | Significado | Bloqueia merge? |
|:---|:---|:---|
| `[blocker]` | Problema de segurança ou arquitetura | Sim |
| `[must-fix]` | Bug ou violação de padrão | Sim |
| `[suggestion]` | Melhoria opcional | Não |
| `[question]` | Dúvida sobre a abordagem | Não |
| `[praise]` | Reconhecimento de boa prática | Não |

### Regras de Feedback

- Ser específico — apontar a linha, sugerir a alternativa
- Explicar o porquê — "isso viola X porque Y"
- Não reescrever — sugerir, não impor estilo pessoal
- Reconhecer o bom — não só apontar problemas

---

## Regras de Aprovação

- **1 aprovação** do Líder Técnico é suficiente para merge
- **Qualquer blocker** impede merge até ser resolvido
- **Autor não pode aprovar** o próprio PR
- **Re-review** necessário se mudanças foram feitas após feedback

---

## Auto-Merge (quando permitido)

PRs que podem ser auto-merged após CI verde:

- Atualização de dependências (minor/patch)
- Correção de typo em documentação
- Atualização de `.env.example`

> Todo o resto requer review humano ou do Líder Técnico.

---

## Checklist — Antes de Aprovar

- [ ] Li todo o diff, não só os arquivos que conheço?
- [ ] Testei localmente ou confio nos testes do CI?
- [ ] Verifiquei se a skill relevante foi seguida?
- [ ] Nenhum blocker pendente?
- [ ] Definition of Done atendido?
