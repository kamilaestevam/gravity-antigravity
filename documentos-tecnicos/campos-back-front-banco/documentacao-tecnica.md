# Documentação Técnica — Campos Pedido e PedidoItem

**Produto:** Pedido (Gestão de Pedidos de Comércio Exterior)
**Data:** 2026-04-09
**Status:** Estável — Refactor de nomenclatura concluído

---

## 1. A Regra Fundamental — 4 Camadas Idênticas

Todo campo do produto Pedido obedece à seguinte convenção:

```
nome_no_banco (PostgreSQL)
  = nome_no_back (Prisma / TypeScript server)
    = nome_no_front (TypeScript client / interface)
      = chave no payload JSON da API
```

**Não existe nenhuma camada de tradução.** O campo `quantidade_inicial_item_pedido` se chama exatamente assim nos quatro contextos. Nenhum `@map()` de coluna, nenhum alias, nenhum mapeamento intermediário.

### O que levou a esta regra

Durante a fase de renomeação dos campos de quantidade (Sprint de Abril/2026), foram usados `@map()` do Prisma e dicionários de alias no TypeScript como solução temporária. Estes "pontes" criaram divergências silenciosas — o backend recebia um campo com nome antigo, não encontrava no banco, e simplesmente não atualizava o registro (sem erro, sem aviso).

A solução foi aplicar um refactor completo com:
1. Migração SQL (`ALTER TABLE RENAME COLUMN`) para renomear as colunas físicas
2. Remoção de todos os `@map()` de coluna do `schema.prisma`
3. Remoção de todos os alias/dicionários do código TypeScript
4. Auditoria completa dos componentes frontend que referenciavam os nomes antigos

---

## 2. Tipos de Natureza dos Campos

Cada campo tem uma `natureza` que define seu comportamento:

| Natureza | Descrição | Editável inline | Editável em massa | Armazenamento |
|---|---|---|---|---|
| `físico` | Dado primário inserido pelo usuário | Sim (maioria) | Sim (maioria) | Coluna direta na tabela |
| `calculado` | Derivado de outros campos — nunca editável diretamente | Não | Não | Coluna na tabela (atualizada por trigger/service) |
| `quantidade` | Subconjunto de físico — campos de quantidade que disparam recálculo de agregados | Sim | Sim | Coluna direta |
| `virtual` | Dado armazenado dentro de um JSONB — sem coluna própria | Sim | Sim (alguns) | Dentro de `detalhes_operacionais` ou `campos_custom` |
| `sistema` | Metadados gerenciados pelo sistema (IDs, timestamps, soft delete) | Não | Não | Coluna direta |

---

## 3. Campos Bloqueados — Nunca Editáveis em Massa

O `EdicaoEmMassaService` mantém duas listas de campos bloqueados validadas server-side. Qualquer tentativa de editar estes campos via API retorna `HTTP 400 CAMPO_BLOQUEADO`.

### Campos Bloqueados — Nível Pedido

```typescript
const CAMPOS_BLOQUEADOS_PEDIDO = new Set([
  'valor_total_pedido',            // calculado
  'quantidade_total_inicial_pedido', // calculado
  'quantidade_transferida_total',   // calculado
  'id',
  'tenant_id',
  'product_id',
  'deleted_at',
  'pedido_criado_em',
  'pedido_atualizado_em',
])
```

### Campos Bloqueados — Nível Item

```typescript
const CAMPOS_BLOQUEADOS_ITEM = new Set([
  'valor_total_itens',   // calculado: valor_unitario × saldo
  'saldo_item_pedido',   // calculado: A − B − C
  'id',
  'tenant_id',
  'pedido_id',
  'item_criado_em',
  'item_atualizado_em',
])
```

---

## 4. Campos Virtuais em JSONB

Alguns campos não têm coluna própria — são armazenados dentro de colunas JSONB:

### `detalhes_operacionais` (modelo Pedido)

Campos de texto descritivo dos parceiros negociais, resolvidos via JOIN virtual no backend:

| Campo virtual | Chave no JSON | Descrição |
|---|---|---|
| `nome_exportador` | `detalhes_operacionais.nome_exportador` | Nome do exportador/fornecedor |
| `nome_importador` | `detalhes_operacionais.nome_importador` | Nome do importador/cliente |
| `nome_fabricante` | `detalhes_operacionais.nome_fabricante` | Nome do fabricante |

**Tratamento especial no `EdicaoEmMassaService`:** campos em `CAMPOS_DETALHES_OPERACIONAIS` passam por merge JSON em vez de update direto, preservando as demais chaves do objeto.

### `campos_custom` (Pedido e PedidoItem)

Colunas criadas pelo próprio usuário via `ColunaUsuarioPedido`. O modelo armazena metadados da coluna; os valores ficam em `ValorColunaUsuarioPedido` (tabela separada, com índice GIN para busca).

---

## 5. Lógica de Quantidades — Modelo A–B–C

Os 5 campos de quantidade do `PedidoItem` seguem uma hierarquia determinística:

| Campo | Letra | Papel |
|---|---|---|
| `quantidade_inicial_item_pedido` | A | Quantidade original contratada — imutável após criação |
| `quantidade_transferida_item_pedido` | B | Quanto já foi transferido para processos logísticos |
| `quantidade_pronta_total_item_pedido` | B' | Quanto está confirmado como pronto (pré-transferência) |
| `quantidade_cancelada_item_pedido` | C | Quanto foi cancelado |
| `saldo_item_pedido` | — | **Calculado:** A − B − C |

**Regra:** `saldo_item_pedido` é sempre calculado. Nunca deve ser editado diretamente.

### Recálculo de Agregados do Pedido

Quando qualquer campo de quantidade de item é alterado (inline ou em massa), o `EdicaoEmMassaService.recalcularAgregados()` é chamado e atualiza:

```typescript
quantidade_total_inicial_pedido = SUM(itens.quantidade_inicial_item_pedido)
valor_total_pedido = SUM(itens.valor_unitario_item × itens.saldo_item_pedido)
```

Os campos de peso e cubagem total do pedido também são calculados analogamente.

---

## 6. Tabela Completa — Modelo `Pedido`

Tabela PostgreSQL: `pedidos_comerciais`

| Campo | Tipo | Natureza | Obrig | Default | Label Tela | Observação |
|---|---|---|---|---|---|---|
| `id` | string | sistema | sim | — | ID | PK — formato `pedi_id_XXXXXXX/YY` |
| `tenant_id` | string | sistema | sim | — | Tenant | Isolamento multi-tenant obrigatório em toda query |
| `company_id` | string | sistema | sim | — | Company | Organização matriz |
| `tipo_operacao` | string | físico | sim | — | Tipo de Operação | `importacao` ou `exportacao` |
| `numero_pedido` | string | físico | sim | — | Nº Pedido | Unique por tenant. Ex: PO-8912 |
| `status` | string | físico | sim | `draft` | Status | Workflow: draft → aberto → transferencia → consolidado → cancelado |
| `status_id` | string? | físico | não | — | Status ID | FK para `PedidoStatus` customizado; null = status built-in |
| `importacao_exportador_id` | string? | físico | não | — | Exportador | FK — Fornecedor exterior (quando importação) |
| `exportacao_importador_id` | string? | físico | não | — | Importador | FK — Cliente exterior (quando exportação) |
| `fabricante_id` | string? | físico | não | — | Fabricante | FK — Fabricante do produto |
| `incoterm` | string? | físico | não | — | Incoterm | Regra de entrega (EXW, FOB, CIF…) |
| `moeda_pedido` | string | físico | sim | `USD` | Moeda | Código ISO 4217 |
| `valor_total_pedido` | Decimal(18,6)? | calculado | não | — | Valor Total | SUM(valor_unitario × saldo) dos itens — atualizado por `recalcularAgregados` |
| `casas_decimais_valor_pedido` | int | físico | sim | `2` | Casas Dec. Valor | Precisão de exibição |
| `quantidade_total_inicial_pedido` | Decimal(18,6)? | calculado | não | — | Qtd Total Inicial | SUM(quantidade_inicial) dos itens |
| `casas_decimais_quantidade_pedido` | int | físico | sim | `2` | Casas Dec. Qtd | Precisão de exibição |
| `unidade_comercializada_pedido` | string? | físico | não | — | Unidade | Lista de unidades padrão Gravity |
| `cobertura_cambial_pedido` | string | físico | sim | `com_cobertura` | Cobertura Cambial | `com_cobertura` ou `sem_cobertura` |
| `condicao_pagamento_pedido` | string? | físico | não | — | Condição Pagamento | Ex: 30% Antecipado, 70% Contra-Documento |
| `numero_proforma` | string? | físico | não | — | Nº Proforma | Número da Proforma Invoice |
| `numero_invoice` | string? | físico | não | — | Nº Invoice | Número da Commercial Invoice |
| `referencia_importador` | string? | físico | não | — | Ref. Importador | Referência interna do importador |
| `referencia_exportador` | string? | físico | não | — | Ref. Exportador | Referência interna do exportador |
| `referencia_fabricante` | string? | físico | não | — | Ref. Fabricante | Referência interna do fabricante |
| `valor_total_cambio_pedido` | Decimal(18,6)? | físico | não | — | Valor Câmbio | Montante do boleto cambial fechado |
| `moeda_cambio_pedido` | string? | físico | não | — | Moeda Câmbio | Ex: BRL→USD |
| `taxa_cambio_estimada_pedido` | Decimal(18,6)? | físico | não | — | Taxa Câmbio Est. | PTAX alvo no fechamento |
| `contrato_cambio_id_pedido` | string? | físico | não | — | Contrato Câmbio | FK para `ContratoCambio` |
| `data_emissao_pedido` | DateTime | físico | sim | `now()` | Data Emissão | Data de emissão do pedido |
| `cnpj_importador` | string? | físico | não | — | CNPJ Importador | CNPJ do importador (usado em exportação) |
| `peso_liquido_total_pedido` | Decimal(18,6)? | calculado | não | — | Peso Líq. Total | SUM(peso_liq_unit × qtd_inicial) dos itens |
| `peso_bruto_total_pedido` | Decimal(18,6)? | calculado | não | — | Peso Bruto Total | SUM(peso_bruto_unit × qtd_inicial) dos itens |
| `cubagem_total_pedido` | Decimal(18,6)? | calculado | não | — | Cubagem Total | SUM(cubagem_unit × qtd_inicial) dos itens |
| `casas_decimais_peso_pedido` | int | físico | sim | `3` | Casas Dec. Peso | Precisão de exibição |
| `casas_decimais_cubagem_pedido` | int | físico | sim | `3` | Casas Dec. Cubagem | Precisão de exibição |
| `detalhes_operacionais` | Json? | virtual | não | — | — | JSONB: `nome_exportador`, `nome_importador`, `nome_fabricante` |
| `campos_custom` | Json? | virtual | não | — | — | JSONB: colunas customizadas pelo usuário |
| `pedidos_origem_id` | Json? | sistema | não | — | — | IDs dos pedidos consolidados neste |
| `data_consolidacao_pedido` | DateTime? | sistema | não | — | — | Momento da consolidação |
| `deleted_at` | DateTime? | sistema | não | — | — | Soft delete: null = ativo |
| `pedido_criado_em` | DateTime | sistema | sim | `now()` | Criado Em | Timestamp de criação |
| `pedido_atualizado_em` | DateTime | sistema | sim | `@updatedAt` | Atualizado Em | Timestamp de última atualização |

### Campos Virtuais (dentro de `detalhes_operacionais`)

| Campo virtual | Tipo | Label Tela | Observação |
|---|---|---|---|
| `nome_exportador` | string | Nome Exportador | Merge JSON — não sobrescreve outras chaves |
| `nome_importador` | string | Nome Importador | Merge JSON — não sobrescreve outras chaves |
| `nome_fabricante` | string | Nome Fabricante | Merge JSON — não sobrescreve outras chaves |

---

## 7. Tabela Completa — Modelo `PedidoItem`

Tabela PostgreSQL: `pedido_itens`

| Campo | Tipo | Natureza | Obrig | Default | Label Tela | Observação |
|---|---|---|---|---|---|---|
| `id` | string | sistema | sim | — | ID | PK — formato `pite_id_XXXXXXX/YY` |
| `tenant_id` | string | sistema | sim | — | Tenant | Isolamento multi-tenant |
| `company_id` | string | sistema | sim | — | Company | Organização matriz |
| `pedido_id` | string | sistema | sim | — | Pedido | FK → `pedidos_comerciais.id` (CASCADE DELETE) |
| `sequencia_item` | int? | físico | não | — | Seq. | Linha sequencial — múltiplos de 10 (10, 20, 30…) |
| `part_number` | string | físico | sim | — | Part Number | SKU interno estável |
| `ncm` | string | físico | sim | — | NCM | Classificação fiscal (8 dígitos) |
| `descricao_item` | string | físico | sim | — | Descrição | Descrição comercial do produto |
| `unidade_comercializada_item` | string? | físico | não | — | Unidade | Unidade de medida do item |
| `quantidade_inicial_item_pedido` | Decimal(18,6) | quantidade | sim | — | Qtd Inicial (A) | Quantidade original contratada |
| `saldo_item_pedido` | Decimal(18,6) | calculado | sim | — | Saldo | A − B − C — nunca editável diretamente |
| `quantidade_pronta_total_item_pedido` | Decimal(18,6) | quantidade | sim | `0` | Qtd Pronta (B') | Quantidade confirmada como pronta |
| `quantidade_transferida_item_pedido` | Decimal(18,6) | quantidade | sim | `0` | Qtd Transferida (B) | Quantidade transferida para processos |
| `quantidade_cancelada_item_pedido` | Decimal(18,6) | quantidade | sim | `0` | Qtd Cancelada (C) | Quantidade cancelada |
| `casas_decimais_quantidade_item` | int | físico | sim | `2` | Casas Dec. Qtd | Precisão de exibição |
| `moeda_item` | string | físico | sim | `USD` | Moeda | Código ISO 4217 |
| `valor_total_itens` | Decimal(18,6)? | calculado | não | — | Valor Total | valor_unitario × saldo — nunca editável |
| `valor_unitario_item` | Decimal(18,6)? | físico | não | — | Valor Unitário | Preço por unidade |
| `casas_decimais_valor_item` | int | físico | sim | `2` | Casas Dec. Valor | Precisão de exibição |
| `peso_liquido_unitario_item` | Decimal(18,6)? | físico | não | — | Peso Líq. Unit. | Peso líquido por unidade |
| `peso_bruto_unitario_item` | Decimal(18,6)? | físico | não | — | Peso Bruto Unit. | Peso bruto por unidade |
| `cubagem_unitaria_item` | Decimal(18,6)? | físico | não | — | Cubagem Unit. | Volume por unidade (m³) |
| `casas_decimais_peso_item` | int | físico | sim | `3` | Casas Dec. Peso | Precisão de exibição |
| `casas_decimais_cubagem_item` | int | físico | sim | `3` | Casas Dec. Cubagem | Precisão de exibição |
| `campos_custom` | Json? | virtual | não | — | — | JSONB: colunas customizadas pelo usuário |
| `item_criado_em` | DateTime | sistema | sim | `now()` | Criado Em | Timestamp de criação |
| `item_atualizado_em` | DateTime | sistema | sim | `@updatedAt` | Atualizado Em | Timestamp de última atualização |

---

## 8. Índices de Banco de Dados

### Índices Estruturais (schema.prisma)

```sql
-- Pedido (pedidos_comerciais)
@@index([tenant_id])
@@index([tenant_id, company_id])
@@index([tenant_id, status])
@@index([tenant_id, status_id])
@@index([tenant_id, tipo_operacao])
@@index([tenant_id, data_emissao_pedido])
@@index([tenant_id, deleted_at])
@@unique([tenant_id, numero_pedido])

-- PedidoItem (pedido_itens)
@@index([tenant_id])
@@index([tenant_id, company_id])
@@index([pedido_id])
```

### Índices de Performance — Busca ILIKE (migração `add_trgm_localizar_indexes`)

Habilitam o endpoint `GET /api/v1/pedidos/localizar` com SLA de 200ms em 1M+ linhas:

```sql
-- Extensão necessária
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Índice GIN trigram nos campos textuais do Pedido
CREATE INDEX IF NOT EXISTS idx_pedido_localizar_trgm
ON pedidos_comerciais USING GIN (
  (COALESCE(numero_pedido, '') || ' ' || COALESCE(tipo_operacao, '') || ' ' ||
   COALESCE(status, '') || ' ' || COALESCE(incoterm, '') || ' ' ||
   COALESCE(moeda_pedido, '') || ' ' || COALESCE(numero_proforma, '') || ' ' ||
   COALESCE(numero_invoice, '') || ' ' || COALESCE(referencia_importador, '') || ' ' ||
   COALESCE(referencia_exportador, '') || ' ' || COALESCE(referencia_fabricante, ''))
  gin_trgm_ops
);

-- Índice GIN trigram nos campos textuais do PedidoItem
CREATE INDEX IF NOT EXISTS idx_pedido_item_localizar_trgm
ON pedido_itens USING GIN (
  (COALESCE(part_number, '') || ' ' || COALESCE(ncm, '') || ' ' ||
   COALESCE(descricao_item, '') || ' ' || COALESCE(unidade_comercializada_item, '') || ' ' ||
   COALESCE(moeda_item, ''))
  gin_trgm_ops
);

-- Índice GIN trigram nas colunas customizadas do usuário
CREATE INDEX IF NOT EXISTS idx_valor_coluna_usuario_localizar_trgm
ON valores_colunas_usuario_pedido USING GIN (valor gin_trgm_ops);

-- Índice GIN trigram no JSONB detalhes_operacionais (nome_exportador/importador/fabricante)
CREATE INDEX IF NOT EXISTS idx_pedido_detalhes_trgm
ON pedidos_comerciais USING GIN ((detalhes_operacionais::text) gin_trgm_ops);
```

> **Nota:** `CREATE INDEX CONCURRENTLY` não pode executar dentro de uma transação. Como o Prisma envolve cada migração em uma transação, os índices devem usar `CREATE INDEX` (sem `CONCURRENTLY`). Para produção com tabelas grandes, execute os índices manualmente fora da migração.

---

## 9. Arquitetura de Schema — fragment.prisma vs schema.prisma

O produto Pedido tem **dois arquivos Prisma** que devem permanecer sincronizados:

| Arquivo | Localização | Uso |
|---|---|---|
| `schema.prisma` | `produto/pedido/server/prisma/schema.prisma` | Schema completo do servidor — gera o Prisma Client usado em produção |
| `fragment.prisma` | `servicos-global/tenant/processos-core/prisma/fragment.prisma` | Fragmento para composição pelo script `compose-tenant-schema.ts` — usado pelo núcleo de processos |

**Regra:** qualquer alteração de campo nos modelos `Pedido` ou `PedidoItem` deve ser aplicada nos dois arquivos. O `fragment.prisma` é o que os outros agentes leem para entender o contrato do produto.

---

## 10. Histórico de Renomeação (Abril 2026)

Os campos abaixo foram renomeados fisicamente via `ALTER TABLE RENAME COLUMN` na migração `20260409000000_rename_fields_final_names`:

### Campos de Pedido Renomeados

| Nome Antigo | Nome Novo |
|---|---|
| `cobertura_cambial` | `cobertura_cambial_pedido` |
| `condicao_pagamento` | `condicao_pagamento_pedido` |

### Campos de PedidoItem Renomeados

| Nome Antigo | Nome Novo |
|---|---|
| `quantidade_transferida_item` | `quantidade_transferida_item_pedido` |
| `quantidade_pronta_total` | `quantidade_pronta_total_item_pedido` |
| `peso_liquido_unitario` | `peso_liquido_unitario_item` |
| `peso_bruto_unitario` | `peso_bruto_unitario_item` |
| `cubagem_unitaria` | `cubagem_unitaria_item` |

Após a renomeação, foram removidos:
- Todos os `@map()` de coluna do `schema.prisma`
- O dicionário `ALIAS_PARA_PRISMA` do `EdicaoEmMassaService`
- A função `traduzirCampoItem()` do `EdicaoEmMassaService`
- As referências aos nomes antigos em `ModalEdicaoEmMassa.tsx`

---

## 11. Onde Cada Arquivo Usa os Nomes dos Campos

| Arquivo | Responsabilidade | Nomes que referencia |
|---|---|---|
| `schema.prisma` | Definição do banco | `nome_no_banco` (= `nome_no_back`) |
| `fragment.prisma` | Contrato do fragmento | `nome_no_banco` (= `nome_no_back`) |
| `edicaoEmMassaService.ts` | Edição em massa server-side | `nome_no_back` (direto, sem alias) |
| `transferirService.ts` | Transferência de quantidades | `nome_no_back` |
| `pedidos.ts` (routes) | Endpoint REST | `nome_no_back` / `nome_no_front` (idênticos) |
| `ModalEdicaoEmMassa.tsx` | UI — seleção de campos para edição | `nome_no_front` (enviado como `campo:` no payload) |
| `ListaPedidos.tsx` | Tabela principal | `nome_no_front` (chaves das colunas) |

---

## 12. Checklist — Ao Adicionar um Novo Campo

- [ ] Definir o nome único que será usado em **todas** as camadas
- [ ] Adicionar ao `fragment.prisma` com tipo, obrigatoriedade e default corretos
- [ ] Aplicar a mesma mudança no `schema.prisma`
- [ ] Criar migração SQL (se novo campo → `ADD COLUMN`; se renomeação → `RENAME COLUMN`)
- [ ] Rodar `prisma generate` (com o servidor parado para evitar lock de DLL no Windows)
- [ ] Atualizar a interface TypeScript do cliente (`PedidoRow`, `PedidoItemRow` ou equivalente)
- [ ] Se o campo for editável em massa: **não** adicioná-lo a `CAMPOS_BLOQUEADOS_*`
- [ ] Se o campo for calculado: adicioná-lo a `CAMPOS_BLOQUEADOS_*` e nunca expor edição no frontend
- [ ] Se o campo estiver em `detalhes_operacionais`: adicioná-lo a `CAMPOS_DETALHES_OPERACIONAIS`
- [ ] Atualizar este CSV e esta documentação
