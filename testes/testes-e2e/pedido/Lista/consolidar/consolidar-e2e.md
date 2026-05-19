# Plano de Testes E2E — Consolidar Pedido

**ID:** TST-E2E-PEDIDO-CONSOLIDAR-001
**Data:** 2026-05-17
**Versão:** 1.0
**Criticidade:** alta
**Ferramenta:** Playwright
**Ambiente:** Local + Staging

---

## Resumo Executivo

Plano de teste E2E para a feature de consolidação de pedidos. Cobre o fluxo completo do modal de 3 passos (Configurar → Comparar → Confirmar) via browser real. Valida seleção de pedidos, detecção de divergências, resolução de conflitos, merge de itens, e feedback visual ao usuário. Criticidade alta: consolidação incorreta destrói dados (soft delete dos originais).

---

## Pré-Condições

| # | Condição | Como garantir |
|---|----------|---------------|
| 1 | Ao menos 3 pedidos de importação com status 'aberto' | Seed via API ou banco |
| 2 | Ao menos 1 pedido de exportação | Para teste de bloqueio de tipo misto |
| 3 | 2 pedidos com campos divergentes (incoterm, moeda) | Seed com valores diferentes |
| 4 | 2 pedidos com itens de mesmo part_number | Para teste de fusão |
| 5 | Usuário autenticado com permissão de consolidação | Login via fixture |

---

## Fluxos

### Fluxo 1 — Consolidar 2 pedidos (happy path completo)

**Spec:** `TST-E2E-PEDIDO-CONSOLIDAR-001.spec.ts`

| Passo | Ação | Verificação | Locator |
|-------|------|-------------|---------|
| 1 | Acessar Lista de Pedidos | Tabela carregada | `[data-testid="tabela-pedidos"]` |
| 2 | Selecionar checkbox do pedido 1 | Checkbox marcado | `[data-testid="checkbox-pedido-{id}"]` |
| 3 | Selecionar checkbox do pedido 2 | Checkbox marcado | `[data-testid="checkbox-pedido-{id}"]` |
| 4 | Clicar botão "Consolidar" na barra de ações | Modal abre no Passo 1 | `[data-testid="btn-consolidar"]` |
| 5 | Verificar campo "Número do pedido" pré-preenchido | Formato PO-CONS-{ANO}/{SEQ} | `[data-testid="input-numero-pedido-consolidado"]` |
| 6 | Verificar cards de estatísticas | # pedidos, # itens, divergências, valor total | `[data-testid="card-estatisticas"]` |
| 7 | Clicar "Próximo" para Passo 2 | Passo 2 visível | `[data-testid="btn-proximo"]` |
| 8 | Verificar seções de grupos (Comercial, Exportador, etc.) | Grupos colapsáveis visíveis | `[data-testid="grupo-{nome}"]` |
| 9 | Resolver campos divergentes (selecionar valor) | Dropdown com valores de cada pedido | `[data-testid="select-campo-{nome}"]` |
| 10 | Clicar "Próximo" para Passo 3 | Passo 3 visível | `[data-testid="btn-proximo"]` |
| 11 | Verificar resumo de campos escolhidos | Lista de decisões do usuário | `[data-testid="resumo-campos"]` |
| 12 | Verificar lista de pedidos a serem arquivados | IDs e números dos originais | `[data-testid="lista-arquivados"]` |
| 13 | Clicar "Confirmar" | Request POST enviado | `[data-testid="btn-confirmar-consolidacao"]` |
| 14 | Verificar banner de sucesso | Mensagem de consolidação bem-sucedida | `[data-testid="banner-sucesso"]` |
| 15 | Verificar que pedidos originais sumiram da lista | Não visíveis na tabela | Ausência de linhas |
| 16 | Verificar novo pedido consolidado na lista | Número PO-CONS visível | Linha na tabela |

---

### Fluxo 2 — Fusão de itens por part_number

| Passo | Ação | Verificação |
|-------|------|-------------|
| 1 | Selecionar 2 pedidos com itens de mesmo PN | — |
| 2 | No Passo 1, marcar "Fundir itens com mesmo part number" | Checkbox ativo |
| 3 | Avançar até confirmação | — |
| 4 | Verificar que itens com mesmo PN foram mesclados | Quantidade = soma das quantidades |
| 5 | Verificar sequência contígua 1..N | Sem gaps |

---

### Fluxo 3 — Bloqueio por tipo de operação misto

| Passo | Ação | Verificação |
|-------|------|-------------|
| 1 | Selecionar 1 pedido de importação + 1 de exportação | — |
| 2 | Verificar banner de conflito de tipo | Mensagem de alerta visível |
| 3 | Botão "Próximo" desabilitado ou modal bloqueia | Não é possível prosseguir |

---

### Fluxo 4 — Detecção e resolução de divergências

| Passo | Ação | Verificação |
|-------|------|-------------|
| 1 | Selecionar 2 pedidos com incoterm diferentes | — |
| 2 | No Passo 2, campo incoterm aparece como divergente | Badge "N origens" visível |
| 3 | Abrir dropdown do campo divergente | Valores de cada pedido listados |
| 4 | Selecionar valor desejado | Valor escolhido refletido |
| 5 | Campos iguais mostram badge "igual" | Badge verde |
| 6 | Filtrar por "Divergentes" | Só campos divergentes visíveis |
| 7 | Filtrar por "Iguais" | Só campos iguais visíveis |

---

### Fluxo 5 — Todos campos iguais (sem divergências)

| Passo | Ação | Verificação |
|-------|------|-------------|
| 1 | Selecionar 2 pedidos com todos campos iguais | — |
| 2 | No Passo 2, nenhum campo divergente | Lista de divergentes vazia |
| 3 | Avançar direto para Passo 3 | Sem necessidade de resolução |

---

### Fluxo 6 — Número do pedido customizado

| Passo | Ação | Verificação |
|-------|------|-------------|
| 1 | Selecionar 2 pedidos | — |
| 2 | Limpar campo de número sugerido | — |
| 3 | Digitar número customizado "MINHA-CONS-001" | Input aceita |
| 4 | Confirmar consolidação | Pedido criado com número customizado |

---

### Fluxo 7 — Número do pedido duplicado

| Passo | Ação | Verificação |
|-------|------|-------------|
| 1 | Tentar consolidar com número de pedido já existente | — |
| 2 | Verificar mensagem de erro 409 | "Número de pedido já está em uso" |

---

### Fluxo 8 — Consolidar 3+ pedidos

| Passo | Ação | Verificação |
|-------|------|-------------|
| 1 | Selecionar 3 pedidos | — |
| 2 | Verificar que todos 3 aparecem no preview | pedidos_info.length = 3 |
| 3 | Campos divergentes consideram todos 3 pedidos | Dropdown com 3 valores |
| 4 | Confirmar | Novo pedido com itens dos 3 originais |

---

### Fluxo 9 — Validações de interface

| Passo | Ação | Verificação |
|-------|------|-------------|
| 1 | Selecionar < 2 pedidos | Botão "Consolidar" desabilitado |
| 2 | Tentar confirmar sem resolver divergências | Bloqueio ou mensagem |
| 3 | Cancelar consolidação (fechar modal) | Nenhum pedido alterado |

---

### Fluxo 10 — Pedidos originais após consolidação

| Passo | Ação | Verificação |
|-------|------|-------------|
| 1 | Após consolidação, verificar pedidos originais | Soft deleted (não visíveis na lista) |
| 2 | Novo pedido tem campo ids_origem visível | Rastreabilidade mantida |
| 3 | Data de consolidação registrada | Timestamp presente |

---

### Fluxo 11 — Cancelamento e navegação

| Passo | Ação | Verificação |
|-------|------|-------------|
| 1 | Abrir modal, avançar até Passo 2 | — |
| 2 | Voltar para Passo 1 | Dados preservados |
| 3 | Fechar modal com X | Nenhum dado alterado |
| 4 | Reabrir modal | Dados limpos (fresh start) |

---

## Locators Esperados (data-testid)

| Elemento | data-testid |
|----------|-------------|
| Botão Consolidar | `btn-consolidar` |
| Modal | `modal-consolidar-pedidos` |
| Input número pedido | `input-numero-pedido-consolidado` |
| Checkbox fundir itens | `checkbox-fundir-itens` |
| Card estatísticas | `card-estatisticas` |
| Botão Próximo | `btn-proximo` |
| Botão Voltar | `btn-voltar` |
| Botão Confirmar | `btn-confirmar-consolidacao` |
| Grupo colapsável | `grupo-{nome}` |
| Select campo divergente | `select-campo-{nome}` |
| Badge divergente | `badge-divergente` |
| Badge igual | `badge-igual` |
| Banner sucesso | `banner-sucesso` |
| Banner conflito tipo | `banner-conflito-tipo` |
| Resumo campos | `resumo-campos` |
| Lista arquivados | `lista-arquivados` |

---

## Estrutura de Arquivos Esperada

```
testes/testes-e2e/pedido/Lista/consolidar/
├── consolidar-e2e.md                           ← este plano
└── TST-E2E-PEDIDO-CONSOLIDAR-001.spec.ts       ← Fluxos 1-11 (scaffold)
```

**Total de fluxos:** 11
