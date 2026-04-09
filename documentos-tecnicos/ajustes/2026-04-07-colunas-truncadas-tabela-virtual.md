# Ajuste: Colunas truncadas na TabelaVirtualGlobal

**Data:** 2026-04-07  
**Produto:** `nucleo-global/Tabelas/tabela-virtual-global` (afeta todos os produtos)  
**Classificação:** MEDIUM  
**Decisão:** Ajuste cirúrgico

---

## Problema

Headers de colunas aparecem truncados com `...` (ex: "TIPO DE OPERAÇ...", "REF. EXPORTAD...", "NÚMERO DA PROFOR...") mesmo após o auto-fit ter sido implementado. O problema persiste entre sessões e não é corrigido por deploys.

## Causa Raiz

`getColWidth` em `TabelaVirtualGlobal.tsx:1111` retorna `larguraColunas[col.key]` (preferências salvas) **sem verificar se o auto-fit calculou uma largura maior**:

```typescript
// CÓDIGO ATUAL — problemático
const saved = larguraColunas[col.key]
if (saved != null) return saved  // ← bloqueia auto-fit indefinidamente
```

Quando uma preferência foi salva com largura insuficiente (por bug anterior, resize acidental ou migração de dados), ela tem prioridade absoluta sobre o auto-fit. O auto-fit recalcula corretamente a cada render mas nunca é aplicado enquanto `saved` existir.

## Escopo Positivo (O QUE será alterado)

- `TabelaVirtualGlobal.tsx` linha ~1113: lógica de `getColWidth` — `Math.max(saved, autoFit)` em vez de retornar `saved` cegamente

## Escopo Negativo (O QUE NÃO será alterado)

- Não altera persistência de preferências (o salvamento continua igual)
- Não altera a lógica de auto-fit (useEffect canvas)
- Não altera definições de colunas em `ListaPedidos.tsx`
- Não altera CSS

## Blast Radius

- **Direto:** Todos os lugares que usam `TabelaVirtualGlobal` com preferências salvas
- **Indireto:** Nenhum — mudança não altera contratos, não altera API, não altera banco
- **Risco de regressão:** Baixo. A mudança só permite que auto-fit EXPANDA uma largura salva, nunca encolhe. O comportamento de resize manual é preservado: se o usuário redimensionou para MAIOR que o auto-fit, a preferência vence normalmente.

## Critério de Sucesso

- Headers "TIPO DE OPERAÇÃO", "REF. EXPORTADOR", "NÚMERO DA PROFORMA", etc. exibem texto completo sem truncamento
- Resize manual pelo usuário continua funcionando (pode encolher)
- Preferências de largura maiores que auto-fit são preservadas

## Plano de Rollback

Reverter a linha alterada em `getColWidth`. Mudança é localizada a ~3 linhas.

## Arquivos a Alterar

| Arquivo | Linha | Mudança |
|---------|-------|---------|
| `nucleo-global/Tabelas/tabela-virtual-global/src/TabelaVirtualGlobal.tsx` | ~1113 | `Math.max(saved, autoFit ?? 0)` antes de retornar `saved` |
