# Plano E2E — Seletor Produtos Gravity

**Documento canônico:** `testes/testes-unitarios/menu-botoes/seletor-produtos-gravity/_planos/PLANO-MESTRE-SELETOR-PRODUTOS-GRAVITY.json`

**Escopo:** `menu-botoes/seletor-produtos-gravity`  
**Ambiente:** staging/local com auth Clerk  
**Produto Admin (Rodar Testes):** Configurador (`escopo` CONFIG)

---

## Pré-requisitos

- `PLAYWRIGHT_BASE_URL` (ex.: `http://localhost:8000`)
- `PLAYWRIGHT_PEDIDO_AUTH=1` para TST-E2E-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000079
- `PLAYWRIGHT_PROCESSO_AUTH=1` para TST-E2E-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000078
- Usuário com Pedido + Processos habilitados no workspace

---

## TST-E2E-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000078 — Seletor em Processos

| # | Passos | Resultado esperado |
|---|--------|-------------------|
| E01 | Navegar `/acesso-processos/lista` | Botão `Produto: Processos. Trocar produto` visível |
| E02 | Clicar no botão | Listbox aberto; opção Processos com `aria-selected=true` |

---

## TST-E2E-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000079 — Navegação cruzada

| # | Passos | Resultado esperado |
|---|--------|-------------------|
| E03 | Em `/pedido/pedidos/lista`, abrir dropdown → Processos | URL muda para `/acesso-processos/lista` |
| E04 | Em Processos, abrir dropdown → clicar Processos (já selecionado) | Sem reload (sem `framenavigated` em 2s) |

**Executar:**

```bash
npx playwright test testes/testes-e2e/menu-botoes/seletor-produtos-gravity/
```

---

## Categorias E2E

- [x] Navegação e Layout (Categoria 5)
- [x] Selects e Dropdowns (Categoria 3)
- [ ] Validação Visual Percy — fora do escopo desta entrega

**Status:** aguardando aprovação do dono para execução em staging
