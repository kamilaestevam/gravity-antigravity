# Relatório de Impacto — Autofit por canvas.measureText (pixels reais)

**Data:** 2026-04-06  
**Classificação:** LOW  
**Decisão:** Ajuste cirúrgico  

---

## Problema

O autofit calculava largura com `char.length × 8px` — uma estimativa que não considera:
- Largura real de cada caractere na fonte proporcional
- Diferença entre header (bold 13px) e células (regular 14px)
- Resultado: cabeçalhos como "NÚMERO DO DOCUMENTO" ficavam truncados

## Solução

Substituir o multiplicador fixo por `canvas.measureText()` que retorna pixels reais da fonte.

- Header medido com: `600 13px 'Plus Jakarta Sans', system-ui, sans-serif` + 40px padding (ícone sort + padding)
- Células medidas com: `400 14px 'Plus Jakarta Sans', system-ui, sans-serif` + 24px padding
- Cap máximo: 1200px
- Fallback: fórmula char × 8px se canvas não disponível (SSR)

## Arquivo Alterado

| Arquivo | Linhas | Tipo |
|---------|--------|------|
| `nucleo-global/Tabelas/tabela-virtual-global/src/TabelaVirtualGlobal.tsx` | 1010-1039 | Substituição de fórmula |

## Arquivos NÃO Alterados

- `tabela-virtual.css`
- `ListaPedidos.tsx`
- Qualquer backend

## Verificação

- [ ] Header de todas as colunas aparece completo sem truncamento
- [ ] Células com conteúdo longo têm largura adequada
- [ ] Build TypeScript sem novos erros
