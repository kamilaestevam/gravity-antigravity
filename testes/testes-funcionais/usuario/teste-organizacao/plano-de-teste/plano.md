# Plano Funcional — Usuário × Organização (resolução de identidade)

> Parte do domínio `PEDIDO-USUARIO-FALTA-ORGANIZACAO`. Blinda as Fases 1/2 do 404
> "Usuário ou organização não encontrada". Tipo **FUN** (Vitest + supertest).
> Família de ID: `TST-FUN-PEDIDO-USUARIO-FALTA-ORGANIZACAO-{NNNNNN}`.

## Cenários (da Matriz DEFINITIVA)

| ID matriz | Cenário | Alvo |
|-----------|---------|------|
| FUN-01 | `GET /api/v1/internal/usuarios/:sub` com usuário `pending_*` → **200** + self-heal (era 404) | `routes/acesso.ts` + `usuario-clerk-resolver.ts` |
| FUN-02 | `GET /api/v1/internal/usuarios/:sub` com `user_*` vinculado → 200 (regressão) | `routes/acesso.ts` |
| FUN-03 | `GET /api/v1/internal/usuarios/:sub` org inexistente → 404 `NOT_FOUND` | `routes/acesso.ts` |
| FUN-04 | `requireAuth`: cache hit / miss / `INATIVO` / token inválido (delegando ao service) | `middleware/requireAuth.ts` |
| FUN-05 | Pedido server middleware no-JWT: header `x-id-organizacao` válido → resolve; sem header + sem JWT → 401 | `produto/pedido/server/src/index.ts` |

## Pré-requisitos
- Mock de `prisma` (usuario.findFirst/findMany/update, organizacao.findUnique) + `clerkClient` (users.getUser, invitations.getInvitationList) + `prestador-fornecedor-vinculo-service`.
- Padrão de mock: ver `testes/testes-funcionais/configurador/usuarios/invite.test.ts`.

## Status
⏳ **Specs a gerar** (`TST-FUN-PEDIDO-USUARIO-FALTA-ORGANIZACAO-0000NN.test.ts`). Aprovado o escopo; aguardando geração no próximo bloco.

> ⚠️ Não deletar este arquivo — ele mantém a pasta `plano-de-teste/` versionada (git não salva pasta vazia).
