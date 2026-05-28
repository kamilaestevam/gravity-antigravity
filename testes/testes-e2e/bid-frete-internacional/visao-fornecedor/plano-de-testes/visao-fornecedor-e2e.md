# Plano E2E — BID Frete Internacional / Visão Fornecedor

**Escopo:** fluxo fornecedor autenticado + link público  
**Status:** scaffold (`TST-E2E-BIDFRT-VISAO-FORNECEDOR-001.spec.ts`) — `describe.skip` até staging  
**Data:** 26/05/2026

---

## Pré-condições

- Usuário Clerk vinculado a `FornecedorBidFreteInternacional` (`id_clerk_usuario`)
- Disparo de cotação com token público válido (7 dias)
- Produto `bid-frete-internacional` habilitado na organização

---

## Casos

| ID | Caso | Resultado esperado |
|----|------|-------------------|
| VF-E01 | Dashboard fornecedor | KPIs visíveis; nav visão fornecedor |
| VF-E02 | Cotacoes pendentes | Lista disparos; botão responder |
| VF-E03 | Enviar proposta autenticada | Proposta aparece em `/propostas` |
| VF-E04 | Link público | Formulário sem login; proposta aceita |
| VF-E05 | CRUD tabelas valor | Criar/editar/excluir rota na tabela |

---

## Execução (quando habilitado)

```bash
npx playwright test testes/testes-e2e/bid-frete-internacional/visao-fornecedor/TST-E2E-BIDFRT-VISAO-FORNECEDOR-001.spec.ts
```
