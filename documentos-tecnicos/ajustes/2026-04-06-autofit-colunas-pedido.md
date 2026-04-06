# Relatório de Impacto — Autofit Universal nas Colunas de Pedidos

**Data:** 2026-04-06  
**Classificação:** LOW  
**Decisão:** Ajuste cirúrgico  
**Produto:** produto/pedido

---

## Problema

As colunas da tabela de pedidos tinham larguras fixas definidas manualmente (`largura: XXX`) e algumas com `autoFitDisabled: true`, impedindo que o autofit da TabelaVirtualGlobal operasse. O resultado era larguras estáticas que não refletiam o conteúdo real dos dados.

---

## Regras de negócio confirmadas pelo usuário

1. Funções de ajuste manual (drag para redimensionar) — **intocadas**
2. Ajuste por arrasto (larguraColunas salvo) — **intocado**
3. Todos os ajustes de largura estáticos anteriores — **deletados sem exceção**
4. Colunas nativas e do usuário — **mesma regra**
5. Largura por autofit com cap em 150 caracteres
6. Conteúdo > 150 chars → tooltip mostrando conteúdo completo

---

## Causa Raiz

- `largura: XXX` em ~42 colunas de `COLUNAS_PAI` em `ListaPedidos.tsx`
- `autoFitDisabled: true` em 5 colunas (status, tipo_operacao, incoterm, moeda, unidade)
- A propriedade `largura` tem prioridade 3 no `getColWidth`, bloqueando o autofit (prioridade 2)

---

## Mecanismos já implementados na TabelaVirtualGlobal (sem alteração)

- **Autofit** (`TabelaVirtualGlobal.tsx:1010-1039`): calcula largura em px com cap de 150 chars
- **Truncamento + tooltip** (`TabelaVirtualGlobal.tsx:1489-1500`): para colunas sem render customizado
- **renderTextoC2** (`ListaPedidos.tsx:1923`): para colunas do usuário com render customizado

---

## Arquivos Alterados

| Arquivo | Tipo de Alteração |
|---------|------------------|
| `produto/pedido/client/src/pages/ListaPedidos.tsx` | Remoção de `largura: XXX` e `autoFitDisabled: true` de COLUNAS_PAI |

## Arquivos NÃO Alterados

- `nucleo-global/Tabelas/tabela-virtual-global/src/TabelaVirtualGlobal.tsx`
- `nucleo-global/Tabelas/tabela-virtual-global/src/tabela-virtual.css`
- Qualquer arquivo de backend

---

## Verificação Pós-Execução

- [ ] Zero ocorrências de `largura:` em COLUNAS_PAI
- [ ] Zero ocorrências de `autoFitDisabled:` em COLUNAS_PAI
- [ ] Build TypeScript sem erros
- [ ] Drag manual continua funcionando
