# Teste em Tela — Preferência de Teste do Usuário (Admin › Rodar Testes › Favoritos)

**ID:** TST-EMT-PREFERENCIA-TESTE-USUARIO-ADMIN-000095
**Escopo pasta:** `testes/testes-em-tela/admin/testes/aba-plano-de-teste/`
**Plano + runner:** `plano-de-teste/` (`plano-teste-em-tela.md` + `run-preferencia-teste-usuario-admin.ts`)
**Prints:** `../resultado-teste/<runId>/`
**Regras de negócio:** `documentos-tecnicos/testes/tecnico/01-arquitetura-sistema-testes.md` (rotas `admin/testes-favoritos`) · `testes/infra/admin/README.md`
**Tela-alvo:** Admin › Testes → modal "Rodar Testes" → seção **Testes Favoritos**
**Total passos no modal (roteiro):** 7
**Total itens no modal (roteiro + prints):** 20

---

## Objetivo

Provar visualmente o ciclo completo da **Preferência de Teste do Usuário** (favoritos persistidos
na tabela `teste_favorito_usuario`, escopados por `id_usuario`): salvar, aplicar, excluir e
**persistência após navegar** — substituindo o antigo `localStorage`.

## Roteiro de execução

As ETAPAs começam colapsadas no modal Admin. Cada passo que edita dados na UI traz a tríade
**o que será editado → a edição → resultado**. Todo print é sufixado com `(sucesso ou erro)`.

### ETAPA 0 — PREPARAÇÃO (PASSOS 01–03)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **01** | Autenticar (Clerk) como admin Gravity e cair no hub/pós-login | Sessão ativa · Print `01-pos-login.png` (sucesso ou erro) |
| **02** | Navegar até Admin › Testes | Página de testes visível · Print `02-admin-testes.png` (sucesso ou erro) |
| **03** | Abrir o modal "Rodar Testes" e localizar a seção "Testes Favoritos" | Modal aberto com a seção visível · Print `03-modal-aberto.png` (sucesso ou erro) |

### ETAPA 1 — SALVAR FAVORITO (PASSO 04)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **04** | Marcar produto/ambiente/tipo, depois clicar "Salvar configuração atual" | Favorito aparece na lista + toast "Configuração salva em Testes Favoritos" · Print `04-salvar-favorito-antes.png` · Print `04-salvar-favorito-selecao.png` · Print `04-salvar-favorito-resultado.png` (sucesso ou erro) |

### ETAPA 2 — APLICAR FAVORITO (PASSO 05)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **05** | Limpar filtros e clicar "Aplicar esta configuração" no favorito salvo | Produto/ambiente/tipos repostos conforme o favorito · Print `05-aplicar-favorito-antes.png` · Print `05-aplicar-favorito-selecao.png` · Print `05-aplicar-favorito-resultado.png` (sucesso ou erro) |

### ETAPA 3 — EXCLUIR FAVORITO (PASSO 06)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **06** | Clicar na lixeira "Remover favorito" do item | Item some da lista + toast "Favorito removido" · Print `06-excluir-favorito-antes.png` · Print `06-excluir-favorito-selecao.png` · Print `06-excluir-favorito-resultado.png` (sucesso ou erro) |

### ETAPA 4 — PERSISTÊNCIA APÓS NAVEGAR (PASSO 07)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **07** | Salvar um favorito, navegar hub → Admin › Testes, reabrir o modal | Favorito continua na lista (gravado no banco, não em localStorage) · Print `07-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

---

## Prints planejados

| # | Arquivo | Estado capturado |
|---|---------|------------------|
| 01 | `01-pos-login.png` | Hub/pós-login — sucesso ou erro de login |
| 02 | `02-admin-testes.png` | Página Admin › Testes carregada |
| 03 | `03-modal-aberto.png` | Modal "Rodar Testes" com seção Testes Favoritos |
| 04 | `04-salvar-favorito-antes.png` | Filtros marcados antes de salvar (o que será salvo) |
| 04 | `04-salvar-favorito-selecao.png` | Clique em "Salvar configuração atual" |
| 04 | `04-salvar-favorito-resultado.png` | Favorito na lista + toast — aprovado ou reprovado |
| 05 | `05-aplicar-favorito-antes.png` | Filtros limpos antes de aplicar |
| 05 | `05-aplicar-favorito-selecao.png` | Clique em "Aplicar esta configuração" |
| 05 | `05-aplicar-favorito-resultado.png` | Filtros repostos pelo favorito — aprovado ou reprovado |
| 06 | `06-excluir-favorito-antes.png` | Favorito presente antes de remover |
| 06 | `06-excluir-favorito-selecao.png` | Clique na lixeira "Remover favorito" |
| 06 | `06-excluir-favorito-resultado.png` | Lista sem o item + toast — aprovado ou reprovado |
| 07 | `07-persistencia-apos-navegar-resultado.png` | Favorito presente após navegar/reabrir — aprovado ou reprovado |

---

## Runner

`run-preferencia-teste-usuario-admin.ts`:
- `resolverPastaResultadoEmt()` → `resultado-teste/<runId>/`
- Viewport `1440x900`, `networkidle` antes de cada screenshot
- Implementa os 13 PNG do roteiro + tabela acima
- `99-erro.png` somente no `catch`
- Grava `RESULTADO.txt` com linhas `EMT_ROW|Ambiente|Produto|Local|Sublocal|Ação|Aprovado/Reprovado`

## 📊 Resultado: [ ] APROVADO | [ ] REPROVADO | [ ] RESSALVAS
