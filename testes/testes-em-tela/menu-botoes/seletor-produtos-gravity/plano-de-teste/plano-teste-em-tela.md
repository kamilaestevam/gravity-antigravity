# Plano de Teste em Tela — Seletor Produtos Gravity

**ID:** TST-EMB-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY  
**Data:** 2026-06-03  
**Versão:** 1.0  
**Criticidade:** alta  
**Skill:** `skills/testes/teste-em-tela/SKILL.md`  
**Status:** Aguardando aprovação do dono

**Escopo pasta:** `testes/testes-em-tela/menu-botoes/seletor-produtos-gravity/`  
**Runner:** `plano-de-teste/run-seletor-produtos-gravity.ts`  
**Prints:** `../resultado-teste/<runId>/`  
**Produto Admin (Rodar Testes):** **Configurador** (`escopo` CONFIG)

---

## Nome em código

| Camada | Identificador |
|--------|----------------|
| **UI** | `MenuLateralGlobal` — bloco `mlg-logo-area--btn` + dropdown `mlg-prod-dropdown` (`role="listbox"`) |
| **Hook / dados** | `useProdutosSwitcher` (`servicos-global/shell/hooks/useProdutosSwitcher.ts`) |
| **Wrapper produtos** | `TelaProdutoComOrganizacaoOverride` (Pedido, Bid Frete, Bid Câmbio) |
| **Processos** | `Sidebar` + `rotaTemSeletorProdutosProcesso` (`/acesso-processos/lista` …) |
| **Navegação** | `resolverNavegacaoTrocarProduto` / `trocarProduto` |
| **SSOT opções** | `GET /api/v1/workspaces/:id/produtos-gravity` + atalho `Processos` (`kind: 'acao'`) |

---

## Regras do teste

| # | Regra |
|---|--------|
| **SPG-01** | O botão **Trocar produto** (`aria-label` = `Produto: {nome}. Trocar produto`) existe em **Pedido**, **Bid Frete Internacional**, **Bid Câmbio** e **Processos**. |
| **SPG-02** | Em cada origem: abrir dropdown (`aria-expanded=true`, listbox visível) e **contrair** (fechar sem navegar). |
| **SPG-03** | Listbox lista produtos habilitados no workspace + **Processos** (divisor antes do atalho). |
| **SPG-04** | De **cada** origem, navegar para **cada** destino disponível (exceto o já selecionado); URL e seletor válidos no destino. |
| **SPG-05** | Clicar no destino **já selecionado** não recarrega a página. |
| **SPG-06** | Critério dinâmico: opções vêm da API — não fixar slug; validar **presença** e **navegação** conforme lista exibida. |

---

## Origens (URLs de entrada)

| Origem | URL |
|--------|-----|
| Pedido | `/pedido/pedidos/lista` |
| Bid Frete Internacional | `/bid-frete/lista` |
| Bid Câmbio | `/bid-cambio/lista` |
| Processos | `/acesso-processos/lista` |

---

### ETAPA 0 — Preparação (passo 00)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **00** | Login Clerk + workspace ativo | Sessão OK · Print `00-login-ok.png` |

### ETAPA 1 — Existência do seletor (SPG-01)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **01** | Abrir **Pedido** `/pedido/pedidos/lista` | Botão trocar produto visível · `01-pedido-seletor-existe.png` |
| **02** | Abrir **Bid Frete** `/bid-frete/lista` | Botão visível · `02-bid-frete-seletor-existe.png` |
| **03** | Abrir **Bid Câmbio** `/bid-cambio/lista` | Botão visível · `03-bid-cambio-seletor-existe.png` |
| **04** | Abrir **Processos** `/acesso-processos/lista` | Botão visível · `04-processos-seletor-existe.png` |

### ETAPA 2 — Expandir e contrair (SPG-02)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **05** | Em **Pedido**: clicar botão → listbox aberto | `aria-expanded=true` · `05-pedido-dropdown-aberto.png` |
| **06** | Clicar botão novamente | Listbox fecha · `aria-expanded=false` · `06-pedido-dropdown-fechado.png` |
| **07–10** | Repetir **05–06** em Bid Frete, Bid Câmbio, Processos | Prints `07-…` a `10-…` |

### ETAPA 3 — Matriz de navegação (SPG-03 / SPG-04)

Para **cada origem** (01–04): abrir dropdown, listar opções; para **cada opção não selecionada**, clicar → validar URL do destino + seletor visível → print `{origem}-para-{destino}-resultado.png`.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **11** | Matriz **Pedido** → todos destinos | Cada navegação OK ou destino ausente na lista (skip documentado) |
| **12** | Matriz **Bid Frete** → todos destinos | Idem |
| **13** | Matriz **Bid Câmbio** → todos destinos | Idem |
| **14** | Matriz **Processos** → todos destinos | Idem |
| **15** | Destino já selecionado (ex. Processos em Processos) | Sem reload em 2s (SPG-05) |

### ETAPA 4 — Relatório

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **16** | Gerar `RESULTADO.txt` | Linhas `EMT_ROW|…` + resumo Aprovado/Reprovado |

---

## Execução

```bash
npx tsx testes/testes-em-tela/menu-botoes/seletor-produtos-gravity/plano-de-teste/run-seletor-produtos-gravity.ts
```

**Variáveis:** `PLAYWRIGHT_BASE_URL` (ex. `http://localhost:8000`), `CLERK_SECRET_KEY`, `E2E_CLERK_USER_EMAIL`, `E2E_CLERK_USER_PASSWORD`.
