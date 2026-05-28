# Plano de Testes E2E — BID Frete Internacional / Lista

**Escopo:** `BIDFRT` — tela `/bid-frete/cotacoes?visao=lista`  
**Status:** aguardando aprovação do dono (spec scaffold com `describe.skip`)  
**Data:** 26/05/2026

---

## Pré-condições

- App em `http://localhost:3000` (Configurador + produto BID Frete Internacional)
- Usuário autenticado com org e workspace ativos
- Pelo menos 1 cotação de teste no banco

---

## Categorias

| Categoria | Aplicável | Notas |
|-----------|-----------|-------|
| CRUD | Parcial | Visualizar lista + abrir detalhe via link |
| Filtros e Busca | Sim | Abas status + busca texto |
| Visualizações | Sim | Lista vs Kanban, colunas visíveis |
| Colunas legíveis | Sim | Organização, Workspace, Usuário sem CUID |
| Hierarquia BID | Sim | Expandir grupo, filhas visíveis |
| Exportação | Sim | CSV/Excel com nomes legíveis |
| Percy | Pendente | Após aprovação do plano |

---

## Fluxos

### LST-E01 — Colunas legíveis na tabela

1. Acessar `/bid-frete/cotacoes?visao=lista`
2. Verificar que coluna **ID** não aparece
3. Verificar **Organização** exibe nome (não CUID)
4. Verificar **Workspace** exibe nome ou `—`
5. Verificar **Usuário** exibe nome (não `user_dev_default`)

### LST-E02 — Hierarquia BID

1. Com 2+ cotações mesma referência interna
2. Linha pai `BID · {referencia}` expandível
3. Filhas exibem colunas com nomes legíveis

### LST-E03 — Exportação

1. Exportar CSV com colunas Organização/Usuário/Workspace visíveis
2. Arquivo contém nomes legíveis, não IDs

---

## Spec

`testes/testes-e2e/bid-frete-internacional/lista/TST-E2E-BIDFRT-LISTA-001.spec.ts`
