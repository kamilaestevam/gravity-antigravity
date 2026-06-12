# 📋 Plano de Teste Unitário — Preferência de Teste do Usuário (Admin)

**ID:** TST-UNI-PREFERENCIA-TESTE-USUARIO-ADMIN-000091
**Escopo pasta:** `testes/testes-unitarios/admin/testes/aba-plano-de-teste/`
**Spec:** `plano-de-teste/TST-UNI-PREFERENCIA-TESTE-USUARIO-ADMIN-000091.test.ts`
**Código-alvo:** `testes/infra/admin/testes-favoritos-admin.ts`
**Tipo:** [x] Unitário | [ ] Funcional | [ ] E2E | [ ] CRO | [ ] EMT

> O modal Admin («O que será testado») agrupa os passos pelos títulos `### ETAPA …` abaixo. **Não remover** essa estrutura.

---

## Escopo

Lógica pura do domínio dos favoritos do modal "Rodar Testes" (sem React, sem fetch):
contratos Zod (espelham a tabela `teste_favorito_usuario`), rótulos, snapshot de planos e
deduplicação. Persistência (banco/API) é coberta por FUN/CRO.

**Objetivo geral:** garantir que o contrato Zod rejeite dados inválidos antes de chegarem ao banco, que os rótulos/resumos exibidos ao usuário sejam fiéis ao que foi salvo e que a chave de deduplicação impeça favoritos repetidos.

---

## Roteiro de execução

### ETAPA 1 — Contrato Zod (`testeFavoritoUsuarioSchema`)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **U01** | Validar favorito completo (com `id`, `data_criacao`, `planos_resumo: null`) contra o schema | `safeParse(...).success === true` — paridade campo a campo com a tabela `teste_favorito_usuario` |
| **U02** | Validar favorito com `tipos_teste_favorito_usuario: []` | `success === false` — schema exige `min(1)`: favorito sem nenhum tipo de teste é inválido |
| **U03** | Validar favorito com `produto_teste_favorito_usuario: 'inexistente'` | `success === false` — produto fora do enum de produtos Gravity é rejeitado |

### ETAPA 2 — Rótulo e exibição

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **U04** | Montar rótulo via `rotuloTesteFavoritoUsuario(favorito, 'Pedido')` | Retorna exatamente `Pedido · Produção · EMT · 1 plano` (produto legível · ambiente em pt · tipos · contagem de planos) |
| **U05** | Extrair título e descrição do plano via `extrairTituloPlanoTeste` / `extrairDescricaoPlanoTeste` | Título = `modulo` do registry; descrição = `sublocal · N casos no registry` — mesmo texto exibido na lista de planos |
| **U06** | Chamar `planosExibicaoFavorito` com `planos_resumo` persistido | Exibe título/descrição do snapshot salvo no banco (não recalcula do catálogo atual) |
| **U07** | Chamar `planosExibicaoFavorito` com `planos_resumo: null` (coluna Json vazia) | Não quebra: retorna 1 item por plano-id com fallback no próprio id |

### ETAPA 3 — Snapshot e resolução

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **U08** | Gerar snapshot via `montarResumoPlanosFavorito(ids, catalogo)` | Cada item sai com `{ id, titulo, descricao, tipo }` corretos — é o que será gravado em `planos_resumo` |
| **U09** | Resolver "o que foi testado" do plano via `resolverOqueFoiTestadoPlano` | Usa o `modulo` quando presente; se vazio, cai no `id` do plano (nunca string vazia) |
| **U10** | Resolver "o que foi testado" de log legado via `resolverOqueFoiTestadoLog` | ID legado (`...-001`) é resolvido pelo catálogo para o `modulo` do plano atual |

### ETAPA 4 — Deduplicação

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **U11** | Gerar `chaveTesteFavoritoUsuario` para dois favoritos com mesmos tipos/planos em ordens diferentes | As duas chaves são idênticas — ordem de `tipos` e `planos_ids` não cria favorito "novo" |

---

## Como rodar

```bash
npx vitest run --config testes/testes-unitarios/admin/vitest.config.ts TST-UNI-PREFERENCIA-TESTE-USUARIO-ADMIN-000091
```

## 📊 Resultado: [x] APROVADO | [ ] REPROVADO | [ ] RESSALVAS
