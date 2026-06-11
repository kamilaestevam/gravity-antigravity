# Teste em Tela — Resolução Usuário × Organização (porteiro → produto)

> **ID EMT:** `TST-EMT-PEDIDO-USUARIO-FALTA-ORGANIZACAO-000084`
> **Escopo:** o caminho completo da identidade — login Clerk → `/me` (porteiro) → resolução de organização pelo SDK → acesso ao produto (Pedido). Cobre **todos os erros reais** levantados na investigação de 2026-06-10/11.
> **Criticidade:** CRÍTICA (afeta 100% dos acessos; 36/67 usuários em prod estavam quebrados).
> **Por que existe:** este fluxo falhou em produção de forma intermitente ("hora carrega, hora diz Organização não encontrada"). Cada cenário abaixo é uma falha que **realmente aconteceu** ou uma regressão que **não pode voltar**.

---

## Mapa de causas que este plano cobre

| # | Falha real | Vetor / código | Correção | Commit |
|---|-----------|----------------|----------|--------|
| C1 | 404 "Usuário ou organização não encontrada" no Pedido para usuário `pending_` (mas `/me` funcionava) | Lookup assimétrico — `acesso.ts` `findUnique` seco vs `requireAuth` self-heal | `usuario-clerk-resolver.ts` usado por ambos | `1b8b1749a` |
| C2 | "hora carrega, hora não" — org errada na janela sem-JWT | `lsGet('gravity:idOrganizacao')` defasado dirigindo `x-id-organizacao` | tenant só do store; logout limpa chaves | `502e73df3` |
| C3 | Token ping-pong (2 contas no mesmo navegador) | Multi-session Clerk | single-session na instância Clerk (config) | — |
| C4 | "em vários locais diz **Organização**" (label genérico) | fallback `t('shell.organizacao_padrao')` quando `/me` falha | depende de C1/C2 resolvidos | — |
| C5 | Modal **Transferir** mostra mensagem crua do backend | banner exibe `err.message` (404 do resolver) | UX (follow-up — ver §Observações) | pendente |
| C6 | Tela morta / lentidão quando Configurador indisponível | `/me` sem retry; Portão 3 S2S sem cache; incidente AWS | degradação graciosa + retry (follow-up) | pendente |

---

## Pré-requisitos do ambiente

1. **Shell Vite** na porta do Configurador (`PLAYWRIGHT_BASE_URL`, default `http://localhost:8000`).
2. **Configurador API** + sidecar **Pedido** de pé (porta 8030 via proxy).
3. `CLERK_SECRET_KEY` + `CLERK_PUBLISHABLE_KEY` no `.env.local` / `servicos-global/configurador/.env`.
4. **Dados semeados (obrigatório — sem isso o teste é incompleto):**
   - **U_OK** — usuário com `id_clerk_usuario = 'user_*'` (vinculado), org ATIVA, ≥1 workspace, ≥1 pedido.
   - **U_PENDING** — usuário com `id_clerk_usuario = 'pending_<inv>'`, mesmo e-mail verificado no Clerk, org ATIVA. (Reproduz C1.)
   - **U_ADMIN** — `tipo_usuario = SUPER_ADMIN` ou `ADMIN`, para o fluxo de override (C5/cross-org).
   - **ORG_A** e **ORG_B** distintas e ATIVAS (para cross-org).
   - **ORG_SUSP** — org `SUSPENSO`/`CANCELADO` (para o caminho 403).
   > Helper sugerido: `seedResolucaoOrganizacao.ts` (criar em `_fixtures/`) que cria/garante esses registros e devolve os IDs. Sem o seed, marque o cenário como `SKIP (sem dado)` no RESULTADO — **nunca** invente passou.

---

## Viewport e regras de captura

- Viewport fixo **1440×900**; aguardar `networkidle` antes de cada print.
- Uma pasta por run: `resultado-teste/<runId>/`. `99-erro.png` só no `catch`.
- **Instrumentação obrigatória:** o runner deve capturar **console** e **network** (status HTTP) de cada caso, e gravar no `RESULTADO.txt`:
  - lista de requests `/api/v1/pedidos/*` e `/api/v1/me` com status;
  - presença/ausência da string `"Usuário ou organização não encontrada"` no console e na rede;
  - valor de `localStorage['gravity:idOrganizacao']` no início e fim do caso.

---

## Casos de Teste (estados e prints)

### Bloco 1 — Caminho feliz e regressão (C1, C4)

**EMT-01 — Usuário vinculado (`user_*`) abre o Pedido**
- Login como **U_OK** → navegar para `/pedido/pedidos/lista`.
- ✔️ Esperado: lista carrega; KPIs (`lista/kpis`) e `GET /api/v1/pedidos` retornam **200**; topo mostra o **nome real da org** (não a palavra "Organização"); console sem 404/"não encontrada".
- Prints: `01-login-ok.png`, `02-lista-carregada-user-ok.png`.

**EMT-02 — Usuário `pending_` abre o Pedido (o bug C1)**
- Login como **U_PENDING** → navegar para `/pedido/pedidos/lista`.
- ✔️ Esperado: **self-heal** dispara — `GET /api/v1/internal/usuarios/:sub` resolve via e-mail; `preferencia-usuario-coluna-pedido` e `GET /api/v1/pedidos` retornam **200**; lista carrega; **nenhum** "Usuário ou organização não encontrada".
- Verificação de banco (pós): `id_clerk_usuario` do usuário passou de `pending_*` para `user_*` (contagem de `pending_` decrementa).
- Prints: `03-pending-lista-carregada.png`, `04-network-200-preferencia.png` (DevTools/relatório).
- ❌ Falha (regressão): qualquer 404 com a mensagem → `99-erro.png`.

**EMT-03 — Header mostra org correta, nunca "Organização" genérico (C4)**
- Em U_OK e U_PENDING, inspecionar o `tenantName` no Header/Layout.
- ✔️ Esperado: nome real do workspace/org. ❌ "Organização" (label `shell.organizacao_padrao`) indica `/me` falhou → investigar.
- Print: `05-header-nome-org.png`.

### Bloco 2 — Tenant no client, sem localStorage defasado (C2)

**EMT-04 — localStorage defasado NÃO contamina a request**
- Pré: gravar `localStorage['gravity:idOrganizacao'] = '<ORG_B_id>'` manualmente, logar como usuário da **ORG_A**.
- Recarregar a lista.
- ✔️ Esperado: a lista mostra dados de **ORG_A** (do store/`/me`), **não** de ORG_B; o header `x-id-organizacao` das requests reflete ORG_A. Eventuais requests na janela de hidratação saem **sem** org → **401/400 honesto + retry** (nunca 200 com dados de ORG_B).
- Prints: `06-localstorage-envenenado-antes.png`, `07-lista-org-correta-A.png`.

**EMT-05 — Logout limpa o tenant persistido**
- Logado, confirmar `localStorage['gravity:idOrganizacao']` presente → **Logout**.
- ✔️ Esperado: `gravity:idOrganizacao`, `gravity_id_organizacao`, `gravity_company_id` **removidos**.
- Login como **outro** usuário (org diferente) → lista mostra a org **do novo** usuário, sem resíduo.
- Prints: `08-apos-logout-storage-limpo.png`, `09-novo-login-org-nova.png`.

**EMT-06 — F5 repetido (estabilidade, C2/C4)**
- Logado na lista, F5 **10×** seguidas.
- ✔️ Esperado: carrega **todas** as vezes; nunca "Organização não encontrada"; header sempre com a org certa.
- Prints: `10-f5-estavel.png` (último estado).

### Bloco 3 — Cross-organização e override admin (C3, isolamento)

**EMT-07 — Admin override A→B→A não vaza dados**
- Login como **U_ADMIN** (org A) → ativar "Trocar Organização" → **ORG_B** → abrir Pedido (dados de B) → desativar override (volta A).
- ✔️ Esperado: header `x-organizacao-override` só presente sob override; ao voltar, lista mostra **A**; banner âmbar de override visível durante B.
- Prints: `11-override-ativo-banner-B.png`, `12-volta-A.png`.

**EMT-08 — Logout pós-override + login comum não herda B**
- Após EMT-07, **logout** → login como usuário **comum da org A**.
- ✔️ Esperado: lista mostra **só A**; storage sem vestígio de B; sem 404.
- Print: `13-comum-A-sem-vestigio.png`.

**EMT-09 — Override por não-admin é bloqueado**
- Como usuário **comum**, injetar header `x-organizacao-override` (via runner) numa request.
- ✔️ Esperado: **403 `OVERRIDE_NAO_AUTORIZADO`** do SDK; UI não troca de org.
- Print/relatório: `14-override-nao-admin-403.png`.

**EMT-10 — Single-session (C3): sem token ping-pong**
- Garantir multi-session DESLIGADO. Tentar logar 2 contas no mesmo navegador.
- ✔️ Esperado: a 2ª substitui a 1ª (não empilha); `Clerk.client.sessions.length === 1`; nenhum 404 intermitente em chamadas subsequentes do Pedido.
- Print/relatório: `15-single-session-1.png`.

### Bloco 4 — Estados de erro do resolver (degradação graciosa)

**EMT-11 — Organização suspensa/cancelada → 403 amigável**
- Login como usuário de **ORG_SUSP**.
- ✔️ Esperado: SDK retorna `ORGANIZACAO_INACTIVE` (403); UI mostra mensagem **humana** ("organização inativa, contate o suporte"), não stack/código.
- Print: `16-org-inativa-mensagem.png`.

**EMT-12 — Configurador indisponível (C6) → tela não morre**
- Simular Configurador fora (runner: derrubar/route block `/api/v1/internal/usuarios/*` para 503, ou usar flag de teste).
- ✔️ Esperado: `CONFIGURADOR_UNAVAILABLE` (503); UI mostra estado de erro com **"Tentar novamente"** (não Empty State silencioso); ao restaurar, retry recarrega.
- Prints: `17-configurador-down-estado-erro.png`, `18-retry-sucesso.png`.

**EMT-13 — Modal Transferir não mostra mensagem crua (C5)**
- Forçar um erro no preview de Transferir (ex.: estado de borda).
- ✔️ Esperado (alvo): banner com **mensagem amigável**, não `"Usuário ou organização não encontrada"` cru. **Estado atual conhecido:** mostra a mensagem crua → este caso documenta a regressão até o follow-up de UX ser entregue. Marcar `FALHA ESPERADA (follow-up C5)` enquanto pendente.
- Print: `19-transferir-mensagem.png`.

---

## Matriz de variáveis (resumo — combinações que o runner percorre)

| Variável | Valores testados |
|----------|------------------|
| Estado do usuário (`id_clerk_usuario`) | `user_*` (vinculado), `pending_*` (convidado), e-mail não verificado, e-mail ambíguo (2+ orgs) |
| `tipo_usuario` | SUPER_ADMIN, ADMIN, MASTER, STANDARD, FORNECEDOR |
| Status da organização | ATIVO, SUSPENSO, CANCELADO, CONFIGURACAO_PENDENTE |
| `localStorage[gravity:idOrganizacao]` | ausente, igual à org, **divergente** (envenenado), de org inexistente |
| JWT na request | presente válido, expirado/ausente (janela de hidratação), de outra sessão |
| Override header | ausente, válido (admin), válido (não-admin → 403), formato inválido (400) |
| Sessões Clerk | 1 (single), 2+ (ping-pong — deve ser impossível pós-config) |
| Disponibilidade Configurador | 200, 503 (unavailable), 404 (not found), lento (timeout) |
| Nº de workspaces no escopo | 0, 1, N (multi-workspace) |

---

## Relatório (`RESULTADO.txt`)

Para cada EMT-NN: `✓ PASSOU` / `✗ FALHOU` / `⊘ SKIP (sem dado)` / `⚠ FALHA ESPERADA (follow-up)`, com:
- status HTTP das requests-chave (`/me`, `internal/usuarios/:sub`, `pedidos`, `preferencia-usuario-coluna-pedido`);
- presença da string proibida `"Usuário ou organização não encontrada"`;
- `localStorage[gravity:idOrganizacao]` início→fim;
- `Clerk.client.sessions.length`.
Fechar com `Resultado: PASSOU|FALHOU` e o `runId`.

---

## Observações / follow-ups fora deste plano

- **C5 (mensagem crua no Transferir):** ajuste de UX (traduzir erro do resolver para linguagem humana) — tarefa separada. EMT-13 documenta como `FALHA ESPERADA` até lá.
- **C6 (performance/resiliência):** `/me` chamado 2× por load; Portão 3 S2S sem cache; retry no `useMeSync`. Tarefa de performance/resiliência separada (overlapa "Fase 2/3").
- **Incidente AWS US West/East (2026-06-11):** instabilidade transitória de infra — não confundir com falha funcional; reexecutar este plano após normalização.
