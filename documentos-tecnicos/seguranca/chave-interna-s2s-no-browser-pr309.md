# Falha de segurança — chave interna S2S exposta no browser (PR #309)

> **Data:** 2026-06-14 · **Correção:** [PR #309](https://github.com/dmmltda/gravity-antigravity/pull/309) (`fix/shell-produtos-s2s-seguranca`)
> **Severidade:** Alta (credencial S2S exposta + IDOR) · **Impacto visível:** nenhum (degradava para "permite tudo")
> **Skill relacionada:** `skills/seguranca/autenticacao-s2s/SKILL.md` › «Anti-padrão — NUNCA chamar endpoint S2S interno a partir do browser»

---

## Resumo

O hook `servicos-global/shell/hooks/useLoadAllowedProducts.ts` chamava `GET /api/v1/internal/organizacao-produtos` **direto do browser**, com três defeitos sobrepostos:

1. **Credencial S2S exposta** — enviava `VITE_CHAVE_INTERNA_SERVICO` (chave interna serviço-a-serviço) no header. Tudo lido via `import.meta.env.VITE_*` é embutido no **bundle JavaScript público**; qualquer um lia a chave no "ver código-fonte". Era o **único** uso dessa variável no Shell.
2. **IDOR (Insecure Direct Object Reference)** — a organização vinha por query param (`?idOrganizacao=X`) e era confiada. Trocando o ID, lia-se a configuração de produtos de **qualquer** organização.
3. **Contrato quebrado (latente)** — a rota responde `chave_produto_configuracao_produto_gravity`/`ativo_...` e o Shell lia `product_key`/`is_active`. Os campos nunca bateram, então o gating de produtos **sempre** degradou para permit-all.

---

## Causa raiz do 401 que expôs o problema

O sintoma que levou à investigação foi um `401` ruidoso no console (`[Shell] Falha ao carregar produtos permitidos: 401`). Origem:

- **2026-05-07**, commit `3c7c7a25b` (*"fix(pedido): lista carrega — alinha S2S DDD"*) renomeou, no middleware `requireInternalKey` do Configurador, o header validado: `x-internal-key` → `x-chave-interna-servico`.
- O caller no Shell **não foi atualizado** na mesma entrega (continuou mandando `x-internal-key`) — **violação do Mandamento 07** (sincronia de contratos front+back).
- Resultado: 401 desde então. Como o erro é **não-fatal** (cai no permit-all), ficou ~5 semanas invisível.

> **Lição:** o 401 era cosmético; a falha real (chave no browser + IDOR) existia desde a criação do hook e seria mascarada para sempre por degradar silenciosamente. Falhas de segurança não aparecem na tela — só em revisão.

---

## Correção aplicada

Decisão do dono: **manter o comportamento atual (sidebar mostra todos os produtos) e fechar a segurança.** A chamada com chave interna foi removida do browser; o hook virou **no-op intencional**.

- ✅ Chave S2S sai do bundle público.
- ✅ IDOR fechado (sem rota, sem query param).
- ✅ 401 some (sem fetch).
- ✅ Zero mudança visível — `productsLoaded` permanece `false` e `isProductAllowed()` retorna `true` para todos (permit-all), como já era na prática.

---

## Follow-up — re-habilitar o gating com segurança

O gating de produtos (esconder do sidebar produtos que a organização não habilitou) permanece **desligado**. Para religá-lo de forma segura, no mesmo commit (Mandamento 07/09):

1. **Backend (Configurador):** rota user-authenticated, ex. `GET /api/v1/me/organizacao-produtos`, sob `requireAuth`. Derivar `id_organizacao` do usuário autenticado — **sem query param**.
2. **Contrato:** devolver shape explícito (`{ products: { product_key, is_active }[] }`) e validar com Zod.
3. **Frontend (Shell):** buscar com `Authorization: Bearer` (token do Clerk, igual `useMeSync.ts`), sem chave interna no bundle; mapear o shape correto.
4. **Atenção:** ativar o gating **muda a tela** (produtos não habilitados somem do menu) — confirmar com o dono antes.

A rota interna S2S (`acesso.ts`) pode permanecer para uso real serviço-a-serviço; o que não pode é o browser usá-la com a chave no bundle.

---

## Regra geral (ver skill `autenticacao-s2s`)

Endpoints `/api/v1/internal/*` são **S2S puro**. Frontend nunca os chama. Quando o client precisa de um dado servido por rota interna, quem faz a chamada S2S é o **backend do produto** (chave em env de servidor); o client fala apenas com rotas `requireAuth` que derivam a organização do JWT.
