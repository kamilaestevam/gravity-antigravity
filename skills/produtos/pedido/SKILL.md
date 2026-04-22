---
name: antigravity-pedido
description: "Use esta skill ao desenvolver ou modificar o produto Pedido (Gestao de Pedidos COMEX). Define a arquitetura 3-Tier, a matematica de saldo imutavel, o escudo anti-conflito importacao/exportacao, as regras de IDs corporativos e o zero-trust por Organização + Workspace. Todo agente consulta esta skill antes de tocar em Pedido, PedidoItem ou nas rotas de /api/v1/pedidos."
---

# Gravity — Skill: Pedido (Gestao de Pedidos COMEX)

> **ATENCAO IA:** Se voce for modificar queries Prisma, rotas Express, ou logica de negocio relacionada a `Pedido`, `PedidoItem`, ou `saldoEngine`, acate TODAS as regras abaixo. Violacao causa falha em testes e build blockage.

---

## 1. Arquitetura 3-Tier — Regras Estruturais

O Pedido opera na Camada 1 e 2 da hierarquia 3-Tier:

| Camada | Model | Tabela | Responsabilidade |
|--------|-------|--------|-----------------|
| 1 | `Pedido` | `pedidos_comerciais` | Documento comercial mestre (PO/SO) |
| 2 | `PedidoItem` | `pedido_itens` | Rastreador de saldo — o "elo sagrado" |
| 3 | `Processo` | `processos_logisticos` | **NAO faz parte deste produto** |

**Regras:**
- O produto Pedido NUNCA cria, modifica ou deleta `Processo` ou `ProcessoItem`
- A vinculacao de PedidoItem a ProcessoItem acontece APENAS no produto Processo
- O Pedido e o Processo compartilham o fragment em `servicos-global/tenant/processos-core/prisma/fragment.prisma`

---

## 2. Matematica de Saldo Imutavel

**Formula Sagrada:**
```
quantidade_inicial = quantidade_atual + quantidade_transferida + quantidade_cancelada
```

**Regras inviolaveis:**
- `quantidade_inicial` e definida na criacao e NUNCA muda
- Toda operacao de transferencia/cancelamento e ATOMICA (`prisma.$transaction`)
- Anti-sobre-execucao: se `quantidade_atual < quantidade_solicitada`, REJEITAR com erro 400
- `quantidade_pronta` e informativa — NAO afeta a formula
- Tolerancia de arredondamento: < 0.001

**Engine:** `servicos-global/tenant/processos-core/src/services/saldoEngine.ts`

---

## 3. IDs Corporativos (Identidades Fortes)

NAO use `cuid()` ou `uuid()`. Todo objeto do Pedido usa prefixos unicos:

| Entidade | Prefixo | Exemplo |
|----------|---------|---------|
| Pedido | `pedi_id_` | `pedi_id_0000001/26` |
| PedidoItem | `pite_id_` | `pite_id_00001/26` |

Formato: `{prefixo}{sequencial_7_digitos}/{ano_2_digitos}`

---

## 4. Escudo Anti-Conflito (Inversao Semantica)

O sistema suporta importacao e exportacao na mesma tabela. Para impedir ambiguidade:

- **NUNCA** use `fornecedor_id`, `cliente_id` ou `partner_id` genericos
- **USE** prefixos operacionais:
  - `importacao_exportador_id` — se importacao, e o fornecedor no exterior
  - `exportacao_importador_id` — se exportacao, e o cliente no exterior

O Workspace (campo Prisma `company_id` no fragment atual) e sempre a propria empresa. Nao precisa de campo extra.

---

## 5. Isolamento Zero-Trust (Organização + Workspace)

**Toda query exige o par de campos Prisma de Organização + Workspace (atualmente `tenant_id` + `company_id` no fragment.prisma de processos-core).**

> Os nomes dos campos Prisma são preservados conforme o schema real (Mandamento 02 — schema intocável). Em payloads, JSON e variáveis TypeScript fora do contexto Prisma, use a nomenclatura DDD (`idOrganizacao`, `idWorkspace`).

```typescript
// CORRETO — campos Prisma reais
prisma.pedido.findMany({
  where: { tenant_id, company_id, status: 'aberto' }
})

// ERRADO — vazamento entre Organizações
prisma.pedido.findMany({
  where: { status: 'aberto' }
})
```

- Um usuario de uma filial (Workspace) NUNCA enxerga pedidos de outra
- Excecao: Master e Super Admin têm acesso global sem `UsuarioWorkspace` (Mandamento 04)
- Se ID nao pertence à Organização/Workspace ativo, retornar 404 (masking), NUNCA 403

---

## 6. Ciclo de Vida (Status)

```
Draft --> Aberto --> Transferencia --> Consolidado
  |                                       |
  +----------> Cancelado <----------------+
```

**Transicoes permitidas:**
| De | Para | Condicao |
|----|------|----------|
| Draft | Aberto | Dados validados |
| Draft | Cancelado | Qualquer momento |
| Aberto | Cancelado | Qualquer momento |
| Aberto | Transferencia | Automatico quando algum item tem transferida > 0 |
| Transferencia | Consolidado | Automatico quando todos os itens tem atual = 0 |

**Regras de edicao:**
- Pedido so e editavel nos status `Draft` e `Aberto`
- Pedido so e deletavel no status `Draft`
- Item so e removivel se `quantidade_transferida == 0`

---

## 7. Localizacao do Codigo

| O que | Onde |
|-------|------|
| Fragment Prisma | `servicos-global/tenant/processos-core/prisma/fragment.prisma` |
| Rotas CRUD | `servicos-global/tenant/processos-core/src/routes/pedidos.ts` |
| Rotas Importacao | `servicos-global/tenant/processos-core/src/routes/importacao.ts` |
| saldoEngine | `servicos-global/tenant/processos-core/src/services/saldoEngine.ts` |
| importEngine | `servicos-global/tenant/processos-core/src/services/importEngine.ts` |
| Client (UI) | `produto/pedido/client/src/` |
| PRODUCT_CONFIG | `produto/pedido/client/src/shared/config.ts` |
| Types | `produto/pedido/client/src/shared/types.ts` |
| API client | `produto/pedido/client/src/shared/api.ts` |
| HANDOFF | `documentos-tecnicos/produto/pedido/HANDOFF.md` |
| Arquitetura 3-Tier | `documentos-tecnicos/produto/itens-pedido-processo/arquitetura-3-tier.md` |
| Testes unitarios | `testes/testes-unitarios/pedido/` |
| Testes funcionais | `testes/testes-funcionais/pedido/` |

---

## 8. Rotas Registradas

Servidor: Processo (porta 8025)
Registrado em: `contracts.json` como `"pedido"` -> `/api/v1/pedidos`

| Method | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/v1/pedidos` | Listar com filtros e paginacao |
| GET | `/api/v1/pedidos/:id` | Detalhe com itens |
| POST | `/api/v1/pedidos` | Criar com itens |
| PUT | `/api/v1/pedidos/:id` | Atualizar (Draft/Aberto) |
| DELETE | `/api/v1/pedidos/:id` | Deletar (Draft) |
| PATCH | `/api/v1/pedidos/:id/status` | Transicao de status |
| POST | `/api/v1/pedidos/:id/duplicar` | Duplicar completo |
| POST | `/api/v1/pedidos/:id/itens` | Adicionar item |
| PUT | `/api/v1/pedidos/:id/itens/:itemId` | Atualizar item |
| DELETE | `/api/v1/pedidos/:id/itens/:itemId` | Remover item |
| PATCH | `/api/v1/pedidos/:id/itens/:itemId/cancelar` | Cancelar quantidade |
| PATCH | `/api/v1/pedidos/:id/itens/:itemId/pronta` | Atualizar pronta |
| POST | `/api/v1/pedidos/importar` | Upload + parse + preview |
| POST | `/api/v1/pedidos/importar/confirmar` | Confirmar importacao batch |
| POST | `/api/v1/pedidos/exportar` | Exportar CSV |

---

## 9. Casas Decimais

- Valores monetarios: `casas_decimais_total_pedido` (configuravel, default 2)
- Quantidades: `casas_decimais_quantidade` (configuravel, default 2)
- NUNCA hardcodar casas decimais — usar o campo do model
- Float para quantidades (suporta fracionarios: 15.000,00 litros, 2.500,50 metros)

---

## 10. Registro no Admin (Product Catalog)

Para que o produto apareca no Admin e possa ser ativado por tenants:

| Campo Admin | Valor para Pedido |
|-------------|-------------------|
| **name** | `Pedido` |
| **slug** | `pedido` |
| **description** | `Gestao de pedidos de importacao e exportacao com rastreamento de saldo por item` |
| **status** | `ACTIVE` |
| **billing_type** | `PER_PROCESS` |
| **unit_price** | (definir comercialmente) |
| **backend_module** | `pedido` |
| **target_audience** | `Importadores, exportadores, tradings e despachantes aduaneiros` |
| **user_limit_type** | `UNLIMITED` |

O campo `backend_module` = `"pedido"` e o que conecta a linha do Admin ao `contracts.json` e ao `PRODUCT_CONFIG.id`.

---

## 11. Edicao Inline de Campos (PATCH /:id/campo) — Contrato de 5 Lugares

> **REGRA CRITICA:** Adicionar ou renomear um campo editavel exige atualizacao em EXATAMENTE 5 lugares. Esquecer qualquer um causa erro 400 no save.

### Os 5 Lugares Obrigatorios

| # | Lugar | Arquivo | O que fazer |
|---|-------|---------|-------------|
| 1 | **Schema Prisma** | `servicos-global/tenant/processos-core/prisma/fragment.prisma` | Declarar o campo no model `Pedido` |
| 2 | **Whitelist servidor** | `servicos-global/tenant/processos-core/src/routes/pedidos.ts` | Adicionar em `CAMPOS_EDITAVEIS` ou `CAMPOS_RECALCULAVEIS` |
| 3 | **Tipo TypeScript** | `produto/pedido/client/src/shared/types.ts` | Adicionar ao tipo `Pedido` |
| 4 | **Coluna da tabela** | `produto/pedido/client/src/pages/ListaPedidos.tsx` | Adicionar em `COLUNAS_PAI` com `editable: true` (ou `false` se so leitura) |
| 5 | **Logica de save** | `produto/pedido/client/src/pages/ListaPedidos.tsx` | Tratar em `handleEditar` se o campo tiver comportamento especial (ex: valor composto) |

**Checklist antes de fechar o PR:**
- [ ] Campo adicionado no fragment.prisma?
- [ ] Migration gerada e executada no banco?
- [ ] Campo esta em `CAMPOS_EDITAVEIS` OU em `CAMPOS_RECALCULAVEIS` (nao em ambos)?
- [ ] Tipo `Pedido` no frontend reflete o campo?
- [ ] `COLUNAS_PAI` tem o campo com `editable` correto?
- [ ] `handleEditar` trata o campo (se tiver valor composto como `{currency, amount}`)?

### Campos Recalculaveis vs Editaveis

- **`CAMPOS_EDITAVEIS`** — valor enviado pelo cliente e gravado diretamente no banco
- **`CAMPOS_RECALCULAVEIS`** — valor enviado pelo cliente e IGNORADO; servidor recalcula a partir dos itens

Campos atualmente recalculaveis (nao gravar valor do cliente):
- `valor_total_pedido`
- `quantidade_total_inicial_pedido`
- `quantidade_pronta_itens_pedido_total` (virtual — nao persistido)
- `peso_liquido_total_pedido`
- `peso_bruto_total_pedido`
- `cubagem_total_pedido`

### Alias de Nome (Armadilha Conhecida)

O Prisma usa `quantidade_total_pedido`, mas o frontend expoe como `quantidade_total_inicial_pedido`.
O mapeamento acontece em `mapPedido()` dentro de `pedidos.ts`:

```ts
quantidade_total_inicial_pedido: pedido.quantidade_total_pedido ?? null,
```

**Regra:** o nome na whitelist (`CAMPOS_EDITAVEIS`/`CAMPOS_RECALCULAVEIS`) deve ser o nome do FRONTEND (alias), nao o nome do Prisma.

---

## 12. Optimistic Lock — Comportamento e Armadilhas

O PATCH `/:id/campo` usa optimistic lock baseado em `updated_at`:

```ts
// Cliente envia updated_at do pedido que ele esta editando
{ campo: 'incoterm', valor: 'FOB', updated_at: '2026-04-06T12:00:00.000Z' }

// Servidor compara com updated_at atual do banco
// Se diferente → 409 Conflict (nao 400)
```

**Armadilhas:**

1. **Edicoes encadeadas:** ao salvar dois campos seguidos, o segundo `editarCampo` deve usar o `updated_at` retornado pelo primeiro — nao o `updated_at` original do estado local.
   ```ts
   // CORRETO
   editarCampo(id, 'valor_total_pedido', amount, updatedAt)
     .then(p => editarCampo(p.id, 'moeda_pedido', currency, p.updated_at)) // usa p.updated_at
   ```

2. **Estado local desatualizado:** se `pedidoAtual` nao for encontrado no array local (ex: pagina nao carregou ainda), `updatedAt` sera `undefined` e o cliente envia `new Date().toISOString()`. Isso quase sempre causa 409.

3. **409 nao e bug — e protecao:** o usuario editou em duas abas simultaneamente. O cliente deve mostrar o valor atual do banco e perguntar se quer sobrescrever.

---

## 13. AppError — Duas Assinaturas no Projeto (Nao Misturar)

Existem duas classes `AppError` com assinaturas DIFERENTES:

| Arquivo | Assinatura | Uso |
|---------|-----------|-----|
| `servicos-global/tenant/processos-core/src/services/saldoEngine.ts` | `AppError(statusCode, message)` | Usado em `pedidos.ts` e `saldoEngine.ts` |
| `produto/pedido/server/src/errors/AppError.ts` | `AppError(message, statusCode, code)` | Usado em `init.ts` e rotas proprias do servidor pedido |

**Regra:** ao escrever codigo em `processos-core/`, use a assinatura `(statusCode, message)`. Ao escrever em `produto/pedido/server/src/`, use `(message, statusCode, code)`. NUNCA importe a errada.

---

## 14. Endpoint `/init` — Bundle de 4 Queries

O endpoint `GET /api/v1/pedidos/init` agrega 4 queries em `Promise.all` para reduzir round-trips:

1. Primeira pagina de pedidos (cursor keyset)
2. Status configurados pela Organização
3. Preferencias de colunas do usuario
4. Colunas customizadas do usuario

**Consequencia:** se QUALQUER das 4 queries falhar (ex: coluna inexistente no banco por migration nao executada), o endpoint inteiro retorna 500 e a tela nao carrega.

**Checklist antes de adicionar filtro no `/init`:**
- [ ] O campo filtrado existe no banco? (migration executada?)
- [ ] O campo esta no fragment.prisma e no schema compilado?
- [ ] Se o campo for novo (`deleted_at`, `archived_at`, etc.), verificar com `git log` se a migration foi aplicada no ambiente alvo

**Regra para campos de soft-delete:** adicionar `deleted_at: null` no `where` SOMENTE apos confirmar que a migration foi executada em TODOS os ambientes (dev, staging, prod).
