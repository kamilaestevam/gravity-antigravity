---
name: antigravity-pedido
description: "Use esta skill ao desenvolver ou modificar o produto Pedido (Gestao de Pedidos COMEX). Define a arquitetura 3-Tier, a matematica de saldo imutavel, o escudo anti-conflito importacao/exportacao, as regras de IDs corporativos e o zero-trust por tenant+company. Todo agente consulta esta skill antes de tocar em Pedido, PedidoItem ou nas rotas de /api/v1/pedidos."
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

O `company_id` (workspace) e sempre a propria empresa. Nao precisa de campo.

---

## 5. Isolamento Zero-Trust (tenant_id + company_id)

**Toda query exige o par `tenant_id` + `company_id`.**

```typescript
// CORRETO
prisma.pedido.findMany({
  where: { tenant_id, company_id, status: 'aberto' }
})

// ERRADO — vazamento cross-tenant
prisma.pedido.findMany({
  where: { status: 'aberto' }
})
```

- Um usuario de uma filial NUNCA enxerga pedidos de outra
- Excecao: perfil Master Cross-Company (acesso explicito)
- Se ID nao pertence ao tenant/company, retornar 404 (masking), NUNCA 403

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
