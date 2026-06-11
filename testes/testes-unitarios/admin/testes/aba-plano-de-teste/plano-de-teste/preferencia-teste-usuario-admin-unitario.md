# 📋 Plano de Teste Unitário — Preferência de Teste do Usuário (Admin)

**ID:** TST-UNI-PREFERENCIA-TESTE-USUARIO-ADMIN-000091
**Escopo pasta:** `testes/testes-unitarios/admin/testes/aba-plano-de-teste/`
**Spec:** `plano-de-teste/TST-UNI-PREFERENCIA-TESTE-USUARIO-ADMIN-000091.test.ts`
**Código-alvo:** `testes/infra/admin/testes-favoritos-admin.ts`
**Tipo:** [x] Unitário | [ ] Funcional | [ ] E2E | [ ] CRO | [ ] EMT

---

## Escopo

Lógica pura do domínio dos favoritos do modal "Rodar Testes" (sem React, sem fetch):
contratos Zod (espelham a tabela `teste_favorito_usuario`), rótulos, snapshot de planos e
deduplicação. Persistência (banco/API) é coberta por FUN/CRO.

## Check-list de análise

### 1. Contrato Zod (`testeFavoritoUsuarioSchema`)
- [x] **U01** — favorito completo válido (com id, data, planos_resumo nulo) passa
- [x] **U02** — favorito sem tipos é rejeitado (`min(1)`)
- [x] **U03** — produto fora do enum é rejeitado

### 2. Rótulo e exibição
- [x] **U04** — `rotuloTesteFavoritoUsuario` monta `Produto · Ambiente(pt) · TIPOS · N plano(s)`
- [x] **U05** — `extrairTitulo/DescricaoPlanoTeste` espelham a lista (módulo + sublocal + casos)
- [x] **U06** — `planosExibicaoFavorito` prioriza `planos_resumo` persistido
- [x] **U07** — `planosExibicaoFavorito` trata `planos_resumo` nulo (coluna Json vazia)

### 3. Snapshot e resolução
- [x] **U08** — `montarResumoPlanosFavorito` gera `{id,titulo,descricao,tipo}`
- [x] **U09** — `resolverOqueFoiTestadoPlano` usa módulo e cai no id se vazio
- [x] **U10** — `resolverOqueFoiTestadoLog` resolve id legado via catálogo

### 4. Deduplicação
- [x] **U11** — `chaveTesteFavoritoUsuario` ignora ordem de tipos e planos

## Como rodar

```bash
npx vitest run --config testes/testes-unitarios/admin/vitest.config.ts TST-UNI-PREFERENCIA-TESTE-USUARIO-ADMIN-000091
```

## 📊 Resultado: [ ] APROVADO | [ ] REPROVADO | [ ] RESSALVAS
