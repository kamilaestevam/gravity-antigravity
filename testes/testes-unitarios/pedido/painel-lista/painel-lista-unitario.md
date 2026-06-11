# Plano unitário — Painéis da Lista (Pedido)

> **Status:** RASCUNHO — aguarda pipeline multi-agente (QA)  
> **Escopo:** `listaPainelConfigV1Schema`, mappers API, serialização filtros  
> **FONTE PRIMARIA:** `skills/testes/multi-agente-plano-teste/SKILL.md`

## Casos mínimos

- [ ] `listaPainelConfigV1Schema` aceita payload válido v1
- [ ] Rejeita `ids_workspaces_escopo` no v1 (ou ignora com warn — definir na implementação)
- [ ] Serialização `FiltroEnum`: Set ↔ array
- [ ] Bootstrap painel Principal: nome e `versao: 1`

## Arquivo de teste alvo

`testes/testes-unitarios/pedido/painel-lista/*.test.ts` (criar na Fase 1)
