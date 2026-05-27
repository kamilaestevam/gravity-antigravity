# Empresa × Fornecedor — Operação e Backfill

> **Serviço:** Cadastros  
> **Data:** 26/05/2026  
> **Status:** Hotfix fundação — obrigatório antes de Novo Pedido em produção

---

## Contexto

Em maio/2026 o Cadastros passou por **split semântico**:

| Entidade | Tabela | Papel |
|----------|--------|-------|
| **Empresa** | `empresa` | Identidade **1:1** da organização (SSOT §4.1) — quem assina contrato Gravity |
| **Fornecedor** | `fornecedor` | Parceiros COMEX (importador, exportador, fabricante…) — N por org |

Migration `20260526120000_rename_empresa_to_fornecedor` renomeou a tabela legada.  
Migration `20260528140000_add_empresa_table_cadastros` recriou `empresa` **vazia**.

Sem backfill, `GET /api/v1/fornecedores/da-organizacao` (compat Pedido) falha ou retorna 404 — modal **Novo Pedido** quebra.

---

## Cascata de resolução (`obterEmpresaDaOrganizacao`)

Ordem implementada em `empresa-org.service.ts`:

1. **`empresa.findUnique`** por `id_organizacao` (caminho feliz pós-migration+backfill)
2. Se tabela `empresa` ausente (P2021) ou vazia → **SUID** via Configurador (`suid_empresa` da org)
3. **`fornecedor.findFirst`** pelo SUID
4. Fallback: **`fornecedor.findFirst`** marcado como empresa-da-org (legado)
5. DTO compat: `empresaParaFornecedorCompatDto` → shape `fornecedorSchema` para o Pedido

Erros de infra Prisma (`P1000`, `P1001`, `P1008`, `P1017`, `P2021`) → **503** (`BANCO_INDISPONIVEL`), não 500 genérico.

---

## Deploy operacional (ordem obrigatória)

### 1. Migration

```bash
cd servicos-global/cadastros
npx prisma migrate deploy
```

Confirmar que `20260528140000_add_empresa_table_cadastros` aplicou.

### 2. Backfill (dry-run primeiro)

```bash
npx tsx ../../scripts/sob-demanda/backfill-empresa-tabela-cadastros.ts --dry-run
npx tsx ../../scripts/sob-demanda/backfill-empresa-tabela-cadastros.ts
```

Copia registros de `fornecedor` (empresa-da-org legada) → `empresa` 1:1 por `id_organizacao`.

### 3. Smoke HTTP

```bash
curl -s -H "x-internal-key: $CHAVE_INTERNA_SERVICO" \
  -H "x-organizacao-id: $ID_ORG_TESTE" \
  http://localhost:8031/api/v1/fornecedores/da-organizacao | jq .
```

Esperado: JSON com `id_fornecedor`, `nome_fornecedor`, flags `pode_ser_*_fornecedor`.

### 4. Reiniciar Cadastros

Após deploy de `empresa-org.service.ts` e `app-error.ts`.

---

## Contratos SDK

| Rota | Schema Zod |
|------|------------|
| `/api/v1/fornecedores/*` | `fornecedorSchema` |
| `/api/v1/empresas/*` | `empresaSchema` |

O client `@tenant/cadastros` expõe `fornecedores` e `empresas` separados — **não** misturar schemas.

---

## Pedido — consumo (atualizado 27/05/2026)

- **Empresa-da-org:** `GET /api/v1/empresas/da-organizacao` + `empresaSchema` (client e `cadastrosClient.obterEmpresaDaOrganizacao`)
- **Parceiros (select/cadastro rápido):** `GET/POST /api/v1/fornecedores` + `fornecedorSchema`
- **Snapshot emissão:** `buscarIdentidadeComexPorSuid` → empresa primeiro, fornecedor depois; `montarSnapshotIdentidadeComex` aceita `Empresa | Fornecedor`
- **Legado:** `GET /fornecedores/da-organizacao` permanece `@deprecated` (redireciona leitura para tabela `empresa`)

---

## Rollback

- **Não** reverter rename `fornecedor` — dados de parceiros estão lá
- Se `empresa` corrompida: truncar `empresa` e reexecutar backfill
- Pedidos já emitidos: snapshots congelados — não dependem de Cadastros ao vivo

---

## Testes de regressão

| Arquivo | Cobertura |
|---------|-----------|
| `testes/testes-unitarios/cadastros/empresa-org-resolver.test.ts` | Cascata resolver |
| `testes/testes-funcionais/cadastros/da-organizacao.test.ts` | Rotas + contrato |
| `testes/testes-unitarios/cadastros/cadastros-client-sdk.test.ts` | SDK fornecedorSchema |
| `testes/testes-unitarios/pedido/lista/novo-pedido/cadastros-fornecedor-contrato.test.ts` | processos-core client |
