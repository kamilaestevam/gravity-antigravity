# Plano — TST-E2E-BIDFRT-000103

**ID:** TST-E2E-BIDFRT-000103

> O modal Admin («O que será testado») agrupa os passos pelos títulos ### ETAPA … abaixo. **Não remover** essa estrutura.

**Objetivo geral:** validar o modal de exclusão em lote na lista BID Frete Internacional (preview + confirmação).

---

## Roteiro de execução

### ETAPA 1 — Modal excluir lista

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **E01** | Selecionar linha e abrir modal excluir | dialog visível com aviso irreversível |
| **E02** | Confirmar exclusão de item permitido | lista atualiza sem flicker de loading |
