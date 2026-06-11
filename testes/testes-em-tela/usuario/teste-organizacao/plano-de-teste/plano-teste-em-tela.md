# Plano de Teste em Tela — Usuário × Organização (porteiro /me → resolver → produto)

> **ID EMT:** `TST-EMT-PEDIDO-USUARIO-FALTA-ORGANIZACAO-000084`
> **Escopo:** caminho da identidade — login Clerk → `/me` → resolução de organização (SDK) → acesso ao Pedido. Cobre **todos os erros** da investigação 2026-06-10/11.
> O modal Admin («O que será testado») agrupa os passos pelos títulos `### ETAPA …` abaixo. **Não remover** essa estrutura.

## Ambiente

- **Produção:** UI/API `https://usegravity.com.br` (runner usa `PLAYWRIGHT_BASE_URL`).
- **Local:** UI `http://localhost:8000` / API `:8005`. Passos de "subir servidor" aplicam-se.
- ⚠️ **Não validar durante incidente de infra** (ex.: AWS US West/East 2026-06-11).

## Dados semeados (obrigatório)

- **U_OK** (`user_*`, org ATIVA, ≥1 workspace, ≥1 pedido) · **U_PENDING** (`pending_<inv>`, mesmo e-mail verificado no Clerk) · **U_ADMIN** (SUPER_ADMIN/ADMIN) · **ORG_A**, **ORG_B** ATIVAS · **ORG_SUSP** (SUSPENSO/CANCELADO). Sem o dado → passo sai `SKIP`.

---

## Roteiro de execução

### ETAPA 0 — Preparação

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **00** | Confirmar ambiente coerente (`PLAYWRIGHT_BASE_URL`) | Runner aponta para o ambiente escolhido no Admin |
| **00.1** | Limpar `localStorage['gravity:idOrganizacao']` antes de começar | Chave ausente no início |
| **00.2** | Criar pasta `resultado-teste/<EMT_RUN_ID>/` | Pasta de saída criada |

### ETAPA 1 — Usuário vinculado (`user_*`) abre o Pedido

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **01** | Login como **U_OK** → navegar `/pedido/pedidos/lista` | Lista carrega · `GET /api/v1/pedidos` = **200** · Print `01-login-ok.png` |
| **01.1** | Observar topo da tela | Mostra o **nome real da org** (não a palavra genérica "Organização") · Print `02-lista-user-ok.png` |
| **01.2** | Inspecionar console/rede | **Sem** "Usuário ou organização não encontrada" · sem 404 em `/pedidos` |

### ETAPA 2 — Usuário `pending_` abre o Pedido (bug C1 — self-heal)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **02** | Login como **U_PENDING** → navegar `/pedido/pedidos/lista` | `GET /internal/usuarios/:sub` resolve via e-mail · `preferencia-usuario-coluna-pedido` e `/pedidos` = **200** · Print `03-pending-lista.png` |
| **02.1** | Conferir banco pós-acesso | `id_clerk_usuario` mudou de `pending_*` → `user_*` (contagem de pending decrementa) |
| **02.2** | Console | **Nenhum** 404 "Usuário ou organização não encontrada" (senão `99-erro.png`) |

### ETAPA 3 — Header nunca mostra "Organização" genérico (C4)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **03** | Em U_OK e U_PENDING, ler `tenantName` no Header/Layout | Nome real do workspace/org · Print `05-header-org.png` |
| **03.1** | — | "Organização" (label `shell.organizacao_padrao`) **não** aparece (indicaria `/me` falho) |

### ETAPA 4 — localStorage defasado NÃO contamina a request (C2)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **04** | Gravar `localStorage['gravity:idOrganizacao'] = <ORG_B>`; logar usuário de **ORG_A** | Print `06-localstorage-envenenado.png` |
| **04.1** | Recarregar a lista | Dados de **ORG_A** (do store/`/me`), **não** ORG_B · header `x-id-organizacao` = ORG_A · Print `07-lista-A.png` |
| **04.2** | Requests na janela de hidratação | Saem **sem** org → **401/400 honesto + retry** (nunca 200 com dados de ORG_B) |

### ETAPA 5 — Logout limpa o tenant persistido (C2)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **05** | Logado, confirmar `gravity:idOrganizacao` presente → **Logout** | `gravity:idOrganizacao` + `gravity_id_organizacao` + `gravity_company_id` **removidos** · Print `08-logout-storage-limpo.png` |
| **05.1** | Login como **outro** usuário (org diferente) | Lista mostra a org **do novo** usuário, sem resíduo · Print `09-novo-login.png` |

### ETAPA 6 — F5 repetido (estabilidade, C2/C4)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **06** | Na lista, F5 **10×** seguidas | Carrega todas as vezes · nunca "Organização não encontrada" · header sempre com a org certa · Print `10-f5-estavel.png` |

### ETAPA 7 — Override admin A→B→A não vaza dados (cross-org)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **07** | Login **U_ADMIN** (org A) → "Trocar Organização" → **ORG_B** → abrir Pedido | Banner âmbar de override visível · header `x-organizacao-override` presente · dados de B · Print `11-override-B.png` |
| **07.1** | Desativar override (volta A) | Lista mostra **A** · Print `12-volta-A.png` |

### ETAPA 8 — Logout pós-override + login comum não herda B (cross-org)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **08** | Após ETAPA 7, **logout** → login como usuário **comum da org A** | Lista mostra **só A** · storage sem vestígio de B · sem 404 · Print `13-comum-A.png` |

### ETAPA 9 — Override por não-admin é bloqueado

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **09** | Como usuário comum, injetar header `x-organizacao-override` numa request | **403 `OVERRIDE_NAO_AUTORIZADO`** · UI não troca de org · Print `14-override-403.png` |

### ETAPA 10 — Single-session (C3): sem token ping-pong

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **10** | Garantir multi-session DESLIGADO; tentar logar 2 contas no mesmo navegador | 2ª substitui a 1ª · `Clerk.client.sessions.length === 1` · sem 404 intermitente · Print `15-single-session.png` |

### ETAPA 11 — Organização suspensa/cancelada → 403 amigável

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **11** | Login como usuário de **ORG_SUSP** | SDK retorna `ORGANIZACAO_INACTIVE` (403) · UI mostra mensagem **humana** (não stack/código) · Print `16-org-inativa.png` |

### ETAPA 12 — Configurador indisponível → tela não morre (C6)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **12** | Simular Configurador fora (503 em `/internal/usuarios/*`) | `CONFIGURADOR_UNAVAILABLE` (503) · UI mostra estado de erro com **"Tentar novamente"** · Print `17-configurador-down.png` |
| **12.1** | Restaurar e clicar "Tentar novamente" | Retry recarrega a lista · Print `18-retry-ok.png` |

### ETAPA 13 — Modal Transferir não mostra mensagem crua (C5)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **13** | Forçar erro no preview de Transferir (estado de borda) | **Alvo:** banner com mensagem **amigável**, não `"Usuário ou organização não encontrada"` cru · Print `19-transferir-msg.png` |
| **13.1** | Estado atual conhecido | Mostra a mensagem crua → marcar `FALHA ESPERADA (follow-up C5)` até o ajuste de UX |

---

## Relatório (`RESULTADO.txt`)

Por ETAPA: `✓ PASSOU` / `✗ FALHOU` / `⊘ SKIP (sem dado)` / `⚠ FALHA ESPERADA`, com status HTTP das requests-chave (`/me`, `internal/usuarios/:sub`, `pedidos`, `preferencia-usuario-coluna-pedido`), presença da string proibida `"Usuário ou organização não encontrada"`, `localStorage[gravity:idOrganizacao]` início→fim e `Clerk.client.sessions.length`. Fechar com `Resultado: PASSOU|FALHOU` e o `runId`.
