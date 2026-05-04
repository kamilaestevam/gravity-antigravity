# ADR 0002 — Subdomínio gerado pelo sistema, único cross-tabela

> **Status:** Aceita · **Data:** 2026-05-03 · **Autor:** Daniel (dono) com aval do Coordenador e Líder Técnico
> **Escopo afetado:** `servicos-global/configurador/server/services/organizacaoService.ts`, `server/routes/me.ts`, `server/routes/admin.ts`, `src/services/apiClient.ts`, `src/hooks/useSugerirSubdominio.ts`, modais de criação/edição de Organização e Workspace.

---

## Contexto

A plataforma Gravity expõe cada **Organização** e cada **Workspace** sob um subdomínio próprio: `<sub>.usegravity.com.br`. Esse subdomínio é canônico — entra em e-mails, integrações ERP, webhooks, links públicos.

Antes desta decisão, o usuário **digitava** o subdomínio durante a criação. O frontend aplicava `slugify` em tempo real e o backend rejeitava com **409 CONFLICT** quando já existia. Resultados:

1. Em colisão, o usuário tinha que adivinhar manualmente o sufixo (`acme-2`, `acme-sp-importadora`, etc.).
2. A unicidade era **por tabela** (`organizacao.subdominio_organizacao` `@unique`, `workspace.subdominio_workspace` `@unique`). Workspace `acme` na Org A e workspace `acme` na Org B coexistiam no banco — mas ambos resolveriam para `acme.usegravity.com.br` no DNS, gerando colisão de roteamento em produção.
3. UX de erro 409 silenciosa em colisão simultânea (race) era ruim.

## Decisão

**O sistema gera o subdomínio. O usuário não escolhe.**

1. **Geração** — derivada do nome (`nome_organizacao` ou `nome_workspace`) via `slugifySubdominio`: lowercase, normalize NFD (remove acentos), troca não-`[a-z0-9-]` por `-`, colapsa repetidos, tira pontas, trunca em 60 chars.
2. **Unicidade GLOBAL cross-tabela** — o helper central [`proximoSubdominioDisponivel`](../../servicos-global/configurador/server/services/organizacaoService.ts) consulta **ambas** as tabelas (`organizacao` E `workspace`) via `Promise.all` antes de retornar o candidato. Inicia com `<base>`; se ocupado em qualquer das duas, tenta `<base>-2`, `<base>-3`, ..., até disponível.
3. **Teto** — 100 tentativas sequenciais. Esgotou → `AppError 409 'Não foi possível gerar subdomínio único'`.
4. **Race-safe** — o helper é probe (otimização). A autoridade final é o `@unique` do Prisma. `createOrganizacao`/`createWorkspace`/`POST /admin/organizacoes` envolvem o `prisma.create` em try/catch, capturando `PrismaClientKnownRequestError` com `code === 'P2002'` e retentando até 2 vezes (2 retries × 100 probes = 200 candidatos no pior caso).
5. **Imutabilidade pós-criação** — uma vez gerado, o subdomínio é **read-only**. `PATCH /me/workspaces/:id` usa `z.object({...}).strict()` e **não aceita** `subdominio_workspace` no body. URLs já em uso por usuários, integrações e webhooks dependem desse valor; mudança exige migração explícita fora do CRUD.
6. **Preview ao vivo** — frontend chama `GET /api/v1/me/sugestoes-subdominio?base=<slug>` (debounce 400ms via hook `useSugerirSubdominio`) e exibe `<sub>.usegravity.com.br` em tempo real conforme o usuário digita o nome. O usuário **vê o subdomínio antes de clicar Criar** — não é surpresa.
7. **Transparência** — payload de criação retorna `subdominio_solicitado` (slug do nome) + `subdominio_ajustado: boolean`. Quando `true`, frontend exibe banner amarelo: "Subdomínio `<solicitado>` já estava em uso. Ajustamos para `<final>`."
8. **AuditService** — registra subdomínio final na linha de `detalhe_acao_historico_log`, indicando se houve ajuste.

## Consequências

### Positivas
- Zero risco de cliente cadastrar e descobrir colisão depois (DNS/branding seguros).
- Cross-tabela enforced a partir do código (compensa schema sem `@unique` global).
- Preview elimina o "branding silencioso" — usuário sempre vê o que vai receber.
- Race condition coberta com retry P2002 + teto.
- Imutabilidade preserva URLs em uso.

### Negativas / aceitas
- **Teto 100 tentativas** — em prefixo extremamente popular pode ficar lento; mitigado por jitter seria overengineering pra cardinalidade esperada. Reavaliar se métricas mostrarem retentativas > P95 = 3.
- **Saga onboarding** (`createOrganizacao`) não retenta P2002 dentro da transação local — race exata entre probe e tx.organizacao.create dispara compensação Cadastros e propaga 409 ao usuário. Aceitável dado raridade.
- **Schema `Subdominio` central** — não criada. Cross-tabela é enforced via código, não constraint do banco. Risco de bypass se alguém criar workspace/organizacao via SQL direto. Documentado como dívida.

## Não-objetivos

- Não criamos tabela `Subdominio` central com `@unique` global (Mandamento 02 — schema intocável sem Coordenador).
- Não removemos o campo `subdominio_workspace` (UI ainda mostra subdomínio próprio do workspace).
- Não migramos enum `'ATIVO'/'INATIVO'` para `'ACTIVE'/'INACTIVE'` (frente separada — REGRA 7).

## Implementação

| Arquivo | Mudança |
|---|---|
| `server/services/organizacaoService.ts` | Adicionados helpers `slugifySubdominio` e `proximoSubdominioDisponivel`; `createOrganizacao` e `createWorkspace` usam o helper + retry P2002. |
| `server/routes/me.ts` | Nova rota `GET /api/v1/me/sugestoes-subdominio?base=<slug>`. `AtualizarWorkspaceSchema` agora `.strict()` sem `subdominio_workspace`. POST `/me/workspaces` retorna `{ workspace, subdominio_solicitado, subdominio_ajustado }`. |
| `server/routes/admin.ts` | `POST /admin/organizacoes` usa helper + retry P2002. Payload com flags. |
| `src/services/apiClient.ts` | `sugestaoSubdominioResponseSchema` (Zod); `workspaceApi.sugerirSubdominio(base)`. |
| `src/hooks/useSugerirSubdominio.ts` | Novo hook com debounce 400ms. |
| `src/pages/workspace/ModalEditarWorkspace.tsx` | Campo subdomínio read-only com preview ao vivo (criação) ou valor existente imutável (edição). |
| `src/pages/admin/ModalNovaOrganizacao.tsx` | Idem, criação. |
| `src/pages/admin/ModalEditarOrganizacao.tsx` | Subdomínio apenas exibido em modo read-only. |
| `servicos-global/contracts.json` | Novas entradas em `configurador-organizacoes` e `configurador-me`. |
| `server/__tests__/subdominio.helper.test.ts` | NOVO — 11 testes (slugify + cross-tabela + auto-suffix + teto + edge cases). |
| `server/__tests__/organizacaoService.saga.test.ts` | Atualizado — teste "rejeita cedo" trocado por "auto-ajusta com sufixo". |

## Testes (17 passando, todos verdes)

1. `slugifySubdominio` — acentos, símbolos, truncamento, edge cases (3 casos)
2. `proximoSubdominioDisponivel` — base livre, ocupado em org, ocupado em workspace, cross-tabela `acme-3`, símbolos → 400, teto esgotado → 409, sufixo do usuário aceito, normalização de acentos (8 casos)
3. Saga onboarding — happy path, Cadastros 4xx, TX falha + compensação, dead-letter, clerk_user_id duplicado, **auto-ajuste com sufixo cross-tabela** (6 casos)

## Pareceres

- **Coordenador** — APROVOU COM CONDIÇÕES: race condition mitigada via P2002, naming DDD (`subdominio_ajustado` boolean PT sem `is_`), cross-tabela coberta no helper, teste cobrindo todos os 8 casos exigidos.
- **Líder Técnico** — REJEITOU proposta de "auto-suffix silencioso pós-criação"; APROVOU com a alteração: **preview antes do create** (sistema gera + usuário vê em tempo real). Branding/SEO preservados.
- **QA** — APROVADO COM RESSALVAS endereçadas: PATCH `.strict()` sem `subdominio_workspace`, retry externo reduzido de 5 para 2 (helper já cobre 100).

## Referências

- Mandamento 02 (schema intocável)
- Mandamento 06 (validação Zod obrigatória)
- Mandamento 07 (sincronia front/back no mesmo PR)
- Mandamento 08 (sem fallback silencioso — preview transparente)
- Mandamento 09 (Zod bilateral: `sugestaoSubdominioResponseSchema` no front espelha o payload do back)
- DDD REGRA 1 (campo PT-BR snake_case)
- DDD REGRA 5 (boolean adjetivo direto sem `is_`)
- Skill `produtos-gravity/configurador/SKILL.md` — política documentada
