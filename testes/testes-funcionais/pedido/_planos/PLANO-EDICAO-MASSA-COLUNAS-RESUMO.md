# Plano de Teste — Edicao em Massa por Coluna (Funcional + E2E)

> **IDs:**
> - Funcional: `TST-FUN-PEDIDO-EDICAO-MASSA-COLUNAS-000001`
> - E2E: `TST-E2E-PEDIDO-EDICAO-MASSA-COLUNAS-000001`
>
> **Data:** 2026-05-16
> **Criticidade:** Alta
> **Total de campos:** 157 (84 pedido SSOT + 59 item SSOT + 14 Prisma extras)
> **Total de lotes:** 32 (grupos de 5 colunas)
> **Total de cenarios a executar:** 438 (funcional) + 438 (E2E em tela) = **876 verificacoes**

---

## Duas Camadas de Teste

| Camada | Tipo | Ferramenta | O que verifica | Onde mora |
|--------|------|-----------|----------------|-----------|
| **Funcional** | API/Backend | Supertest + Vitest | Endpoints preview/confirmar retornam dados corretos, cascade funciona, bloqueados rejeitam | `testes/testes-funcionais/pedido/_planos/` |
| **E2E em Tela** | UI/Frontend | Playwright | Usuario VE os resultados — checkbox aparece, preview mostra cascade, alerta eh visivel, itens atualizam na tabela | `testes/testes-e2e/pedido/_planos/` |

> **Regra:** Ambas as camadas devem PASSAR para cada coluna. Backend correto + UI quebrada = bug. UI mostra sucesso + backend nao gravou = bug.

---

## Os 5 Cenarios Obrigatorios

| # | Cenario | Nivel Edicao | O que verifica |
|---|---------|-------------|----------------|
| C01 | Editar e salvar pedido | `pedido` | Salva APENAS o pedido, itens intactos |
| C02 | Checkbox "Aplicar a todos os itens" | UI | Campo propagavel = checkbox disponivel. Campo sem par = checkbox ausente |
| C03 | Editar pedido + checkbox marcado | `combinado` | Pedido + TODOS os itens espelhados via cascade |
| C04 | Editar item individual | `item` + `item_ids` | APENAS aquele item salvo. Demais itens e pedido intactos |
| C05 | Item com valor diferente = alerta | Preview | `overrides_sobrescritos >= 1` no preview combinado |

---

## Classificacao dos Campos

| Categoria | Qtd | Cenarios aplicaveis | Descricao |
|-----------|-----|--------------------:|-----------|
| **PROPAGAVEL** | 61 | C01, C02, C03, C04, C05 | Campo do pedido COM par no `MAPA_PROPAGACAO_PEDIDO_ITEM` |
| **PEDIDO_ONLY** | 37 | C01, C02 | Campo do pedido SEM par de cascade |
| **ITEM_ONLY** | 45 | C04 | Campo que existe apenas no PedidoItem |
| **BLOQUEADO** | 14 | 400 error | Calculado/sistema — nao editavel |

---

## Resumo por Lote

### Lotes 1-8: Pedido — Identificacao, Exportador, Importador, Fabricante, OPE

| Lote | Campos | Categoria predominante |
|------|--------|----------------------|
| 1 | tipo_linha (BLOQ), numero_pedido (BLOQ), tipo_operacao (PROP), nome_exportador (PROP), endereco_exportador (PED) | Misto |
| 2 | pais/estado/cidade/zip exportador, exportador_ou_fabricante | PEDIDO_ONLY |
| 3 | relacao_exp_fab, contato exportador (nome/email/whatsapp/cargo) | PEDIDO_ONLY |
| 4 | depto_contato_exp, nome_importador (PROP), cnpj_imp, nome_fabricante (PROP), ref_importador (PROP) | Misto |
| 5 | ref_exportador (PROP), endereco/pais/estado/cidade fabricante | Misto |
| 6 | zip_fabricante, OPE codigo/nome/endereco/pais | PEDIDO_ONLY |
| 7 | OPE estado/cidade/zip/tin/email | PEDIDO_ONLY |
| 8 | OPE situacao/versao, cnpj_raiz, incoterm (PROP), moeda (PROP) | Misto |

### Lotes 9-11: Pedido — Comercial, Cambio, Fisico, Documentos

| Lote | Campos | Categoria predominante |
|------|--------|----------------------|
| 9 | valor_total (BLOQ), qtd_total (BLOQ), unidade (PROP), condicao_pgto (PROP), qtd_volumes | Misto |
| 10 | cobertura_cambial (PROP), valor_cambio, moeda_cambio, taxa_cambio, contrato_cambio | Misto |
| 11 | peso_liq_total (BLOQ), peso_bruto_total (BLOQ), cubagem_total (BLOQ), no_proforma, no_invoice | Misto |

### Lotes 12-21: Pedido — TODAS as Datas (propagaveis)

| Lote | Campos | Nota |
|------|--------|------|
| 12 | ref_fabricante (PROP), porto_origem, porto_destino, data_emissao (PROP), data_documento (PROP) | Misto |
| 13 | data_doc_proforma (PROP), data_doc_invoice (PROP), data_consolidacao (BLOQ), data_prev/conf pedido_pronto | PROPAGAVEL |
| 14 | data_meta_pedido_pronto, datas inspecao (prev/conf/meta), data_prev_coleta | PROPAGAVEL |
| 15 | data_conf/meta_coleta, draft pedido recebimento (prev/conf/meta) | PROPAGAVEL |
| 16 | draft pedido aprovacao (prev/conf/meta), draft proforma recebimento (prev/conf) | PROPAGAVEL |
| 17 | draft proforma (meta receb, aprovacao prev/conf/meta, envio original prev) | PROPAGAVEL |
| 18 | original proforma (envio conf/meta, recebimento prev/conf/meta) | PROPAGAVEL |
| 19 | draft invoice recebimento (prev/conf/meta), aprovacao (prev/conf) | PROPAGAVEL |
| 20 | draft invoice (meta aprov), original invoice (envio prev/conf/meta, receb prev) | PROPAGAVEL |
| 21 | original invoice (recebimento conf/meta) | PROPAGAVEL |

### Lotes 22-29: Item — Campos exclusivos

| Lote | Campos | Nota |
|------|--------|------|
| 22 | sequencia, part_number, ncm, descricao, unidade_item | ITEM_ONLY |
| 23 | qtd_inicial, qtd_atual (BLOQ), qtd_transferida (BLOQ), qtd_pronta, qtd_cancelada | Misto |
| 24 | casas_decimais_qtd, moeda_item, valor_por_unidade, valor_total (BLOQ), casas_valor | Misto |
| 25 | cobertura_cambial_item, nome_exportador/importador/fabricante_item, ref_importador_item | ITEM_ONLY |
| 26 | ref_exportador/fabricante_item, incoterm_item, cond_pgto_item, peso_liq_unitario | ITEM_ONLY |
| 27 | peso_bruto_unitario, cubagem_unitaria, casas_peso, casas_cubagem, data_emissao_item | ITEM_ONLY |
| 28 | data_consolidacao_item, data_embarque_item (DEBITO), datas item_pronto (prev/conf/meta) | ITEM_ONLY |
| 29 | datas inspecao item (prev/conf/meta), datas coleta item (prev/conf) | ITEM_ONLY |

### Lotes 30-32: Item — Coleta meta + Campos Prisma Extras

| Lote | Campos | Nota |
|------|--------|------|
| 30 | data_meta_coleta_item, descricao_completa_item_pt/en/es/nf | ITEM_ONLY (extras) |
| 31 | texto_posicao_ncm, grupo_item, subgrupo_item, campo_especial_item, atributos_catalogo | ITEM_ONLY (extras) |
| 32 | tipo_embalagem, numero_lpco, numero_certificado_origem, data_certificado_origem, data_embarque_item | ITEM_ONLY (extras) |

---

## Campos PROPAGAVEIS — Mapa Completo (61 pares)

> Estes sao os campos que DEVEM ter checkbox "Aplicar a todos os itens" (C02) e suportam todos os 5 cenarios.

| # | Campo Pedido | Campo Item (cascade) |
|---|-------------|---------------------|
| 1 | tipo_operacao | tipo_operacao_item |
| 2 | nome_exportador (JSON) | nome_exportador_item |
| 3 | nome_importador (JSON) | nome_importador_item |
| 4 | nome_fabricante (JSON) | nome_fabricante_item |
| 5 | incoterm_pedido | incoterm_item |
| 6 | moeda_pedido | moeda_item |
| 7 | unidade_comercializada_pedido | unidade_comercializada_item |
| 8 | condicao_pagamento_pedido | condicao_pagamento_item |
| 9 | data_emissao_pedido | data_emissao_item |
| 10 | casas_decimais_valor_pedido | casas_decimais_valor_item |
| 11 | casas_decimais_quantidade_pedido | casas_decimais_quantidade_item |
| 12 | casas_decimais_peso_pedido | casas_decimais_peso_item |
| 13 | casas_decimais_cubagem_pedido | casas_decimais_cubagem_item |
| 14 | cobertura_cambial_pedido | cobertura_cambial_item |
| 15 | referencia_importador_pedido | referencia_importador_item |
| 16 | referencia_exportador_pedido | referencia_exportador_item |
| 17 | referencia_fabricante_pedido | referencia_fabricante_item |
| 18 | data_prevista_pedido_pronto | data_prevista_item_pronto |
| 19 | data_confirmada_pedido_pronto | data_confirmada_item_pronto |
| 20 | data_meta_pedido_pronto | data_meta_item_pronto |
| 21 | data_prevista_inspecao_pedido | data_prevista_inspecao_item |
| 22 | data_confirmada_inspecao_pedido | data_confirmada_inspecao_item |
| 23 | data_meta_inspecao_pedido | data_meta_inspecao_item |
| 24 | data_prevista_coleta_pedido | data_prevista_coleta_item |
| 25 | data_confirmada_coleta_pedido | data_confirmada_coleta_item |
| 26 | data_meta_coleta_pedido | data_meta_coleta_item |
| 27-32 | Draft Pedido (receb prev/conf/meta + aprov prev/conf/meta) | _rascunho_item |
| 33 | data_documento_pedido | data_documento_item |
| 34-39 | Draft Proforma (receb prev/conf/meta + aprov prev/conf/meta) | _proforma_item |
| 40-42 | Original Proforma (envio prev/conf/meta) | _proforma_item |
| 43-45 | Original Proforma (receb prev/conf/meta) | _proforma_item |
| 46 | data_documento_proforma_pedido | data_documento_proforma_item |
| 47-52 | Draft Invoice (receb prev/conf/meta + aprov prev/conf/meta) | _invoice_item |
| 53-55 | Original Invoice (envio prev/conf/meta) | _invoice_item |
| 56-58 | Original Invoice (receb prev/conf/meta) | _invoice_item |
| 59 | data_documento_invoice_pedido | data_documento_invoice_item |
| 60 | data_consolidacao_pedido | data_consolidacao_pedido_replicada_item |
| 61 | data_transferencia_saldo_pedido | data_transferencia_saldo_item |

---

## Campos BLOQUEADOS (14 — devem retornar 400)

| Campo | Motivo |
|-------|--------|
| tipo_linha | Parser-only, nao editavel |
| numero_pedido | @@unique constraint |
| valor_total_pedido | Agregado calculado |
| quantidade_total_pedido | Agregado calculado |
| peso_liquido_total_pedido | Agregado calculado |
| peso_bruto_total_pedido | Agregado calculado |
| cubagem_total_pedido | Agregado calculado |
| data_consolidacao_pedido | Campo de sistema |
| id_pedido | Identidade |
| id_organizacao | Identidade |
| id_workspace | Identidade |
| quantidade_atual_item | Calculado (saldo engine) |
| quantidade_transferida_item | Fluxo de transferencia |
| valor_total_item | Calculado (preco * qtd) |

---

## Pre-requisitos do Teste

1. **Banco:** 1 organizacao + 1 workspace + 1 pedido com 3 itens (campos populados)
2. **Item divergente:** Item2 com `incoterm_item` diferente do `incoterm_pedido` (para C05)
3. **JSON populado:** `detalhes_operacionais_pedido` com dados de exportador/importador/fabricante/OPE
4. **Auth:** Token valido ou `x-chave-interna-servico` (minimo 16 chars)
5. **Mocks:** Prisma, requireAuth, resolver-organizacao, audit-client

---

## Como Executar (Protocolo)

```
Para cada LOTE (1 a 32):
  Para cada CAMPO do lote:
    1. Verificar CATEGORIA do campo
    2. Se BLOQUEADO → testar apenas rejeicao 400
    3. Se PROPAGAVEL → executar C01, C02, C03, C04, C05
    4. Se PEDIDO_ONLY → executar C01, C02 (verificar ausencia de checkbox)
    5. Se ITEM_ONLY → executar C04
    6. Registrar resultado (PASS/FAIL) com evidencia
```

---

## Payload de Referencia

### C01 — Editar pedido (sem cascade)
```json
POST /api/v1/pedidos/edicoes-em-massa/confirmar
{
  "pedido_ids": ["<ID>"],
  "nivel": "pedido",
  "campos": [{"campo": "incoterm_pedido", "tipo": "texto", "nivel": "pedido", "operacao": "substituir", "valor": "CIF"}]
}
```

### C03 — Editar pedido + cascade
```json
POST /api/v1/pedidos/edicoes-em-massa/confirmar
{
  "pedido_ids": ["<ID>"],
  "nivel": "combinado",
  "campos": [{"campo": "incoterm_pedido", "tipo": "texto", "nivel": "pedido", "operacao": "substituir", "valor": "FOB"}]
}
```

### C04 — Editar item individual
```json
POST /api/v1/pedidos/edicoes-em-massa/confirmar
{
  "pedido_ids": ["<ID>"],
  "item_ids": ["<ID_ITEM>"],
  "nivel": "item",
  "campos": [{"campo": "incoterm_item", "tipo": "texto", "nivel": "item", "operacao": "substituir", "valor": "EXW"}]
}
```

### C05 — Preview divergencia
```json
POST /api/v1/pedidos/edicoes-em-massa/preview
{
  "pedido_ids": ["<ID>"],
  "nivel": "combinado",
  "campos": [{"campo": "incoterm_pedido", "tipo": "texto", "nivel": "pedido", "operacao": "substituir", "valor": "FOB"}]
}
// Response deve conter: overrides_sobrescritos >= 1
```

---

## Mapa de Arquivos Envolvidos

| Arquivo | Responsabilidade |
|---------|-----------------|
| `shared/campos-pedido-ddd.ts` | SSOT dos 143 campos (rotulos, tipos, niveis) |
| `shared/mapaPropagacaoPedidoItem.ts` | SSOT dos 57+ pares de cascade Pedido→Item |
| `server/src/routes/edicoes-em-massa-pedido.ts` | Endpoints preview + confirmar |
| `server/src/services/edicaoEmMassaService.ts` | Logica de edicao, cascade, auto-fill, recalculo |
| `client/src/components/ModalPedidosEdicaoMassa.tsx` | UI do modal 3-steps |
| `processos-core/src/services/recalcularAgregadosPedido.ts` | Recalculo de totais |

---

## Observacoes Importantes

1. **"Checkbox" vs "Nivel Combinado":** O sistema atual usa o conceito de `nivel: 'combinado'` como equivalente ao checkbox "Aplicar a todos os itens". O cenario C02 verifica que campos com par de cascade oferecem essa opcao no UI.

2. **Auto-fill tipo_operacao:** Ao mudar `tipo_operacao` em massa, o sistema preenche automaticamente o lado nacional (nome_importador em IMP, nome_exportador em EXP). Testar separadamente.

3. **Recalculo de agregados:** Campos de quantidade/peso/cubagem nos itens disparam recalculo nos totais do pedido. Verificar que totais recalculam corretamente.

4. **DEBITO data_embarque_item_pedido:** Campo no SSOT mas NAO existe no schema Prisma. Verificar comportamento (erro ou ignore silencioso).

5. **Campos Prisma Extras (14):** Existem no schema mas NAO no SSOT (campos-pedido-ddd.ts). Foram adicionados via Tier 2.5 no Smart Import. Testar que edição em massa tambem os suporta.

---

## Camada E2E — Detalhes dos Cenarios em Tela

> Plano completo: `testes/testes-e2e/pedido/_planos/TST-E2E-PEDIDO-EDICAO-MASSA-COLUNAS-000001.json`

### C01 em Tela — Editar pedido, itens intactos

```
1. Navegar para /workspace/pedidos
2. Selecionar 1 pedido → Toolbar → "Editar em Massa"
3. Modal abre → Aba "Pedido" → Selecionar campo → Valor → Proximo
4. VERIFICAR no Preview: apenas pedido mostra alteracao
5. VERIFICAR no Preview: NENHUM texto "Tambem altera...nos itens"
6. Confirmar → Sucesso
7. Abrir pedido → campo atualizado
8. Abrir itens → campo NÃO atualizado em nenhum
PRINTS: 4 screenshots por campo
```

### C02 em Tela — Checkbox Aplicar a todos

```
1. Modal aberto → Selecionar campo PROPAGAVEL (ex: incoterm)
2. VERIFICAR: aba "Combinado" HABILITADA e clicavel
3. VERIFICAR: tooltip ou texto "Aplicar a todos os itens"
4. Trocar para campo PEDIDO_ONLY (ex: porto_origem)
5. VERIFICAR: aba "Combinado" DESABILITADA ou oculta
6. VERIFICAR: tooltip "Este campo nao possui equivalente nos itens"
PRINTS: 3 screenshots por campo
```

### C03 em Tela — Cascade visual

```
1. Modal → Aba "Combinado" → Selecionar campo propagavel → Valor → Proximo
2. VERIFICAR no Preview: "↳ Tambem altera [campo] nos itens"
3. VERIFICAR no Preview: "3 itens" (contagem)
4. VERIFICAR se overrides: texto azul "X itens serao sobrescritos"
5. Confirmar → Sucesso
6. Abrir CADA item → TODOS tem o mesmo valor novo
PRINTS: 5 screenshots por campo
```

### C04 em Tela — Item individual

```
1. Expandir itens do pedido → Selecionar APENAS Item 2
2. Toolbar → "Editar em Massa" (contexto: 1 item)
3. VERIFICAR: titulo do modal indica "1 item selecionado"
4. Selecionar campo → Valor → Preview → Confirmar
5. VERIFICAR: Item 2 atualizado
6. VERIFICAR: Item 1 e Item 3 inalterados
7. VERIFICAR: Pedido pai inalterado
PRINTS: 5 screenshots por campo
```

### C05 em Tela — Alerta de divergencia

```
1. (Pre-condicao: Item 2 foi editado em C04 com valor diferente)
2. Selecionar pedido pai → Editar em Massa → Aba "Combinado"
3. Selecionar o MESMO campo → Valor do pedido → Preview
4. VERIFICAR: texto azul "↳ 1 item sera sobrescrito" VISIVEL
5. VERIFICAR: mostra de/para do item divergente
6. Confirmar → Todos uniformes
PRINTS: 4 screenshots por campo
```

---

## Estrutura de Prints (Teste em Tela)

```
testes/testes-em-tela/produto/pedido/
├── 2026-05-XX-edicao-massa-lote-01/
│   ├── 01-C01-tipo-operacao-aba-pedido.png
│   ├── 02-C01-tipo-operacao-preview.png
│   ├── 03-C01-tipo-operacao-sucesso.png
│   ├── 04-C01-tipo-operacao-itens-intactos.png
│   ├── 05-C02-tipo-operacao-combinado-habilitado.png
│   ├── 06-C03-tipo-operacao-preview-cascade.png
│   ├── 07-C03-tipo-operacao-itens-espelhados.png
│   ├── ...
├── 2026-05-XX-edicao-massa-lote-02/
│   └── ...
└── 2026-05-XX-edicao-massa-lote-32/
    └── ...
```

---

## Estimativa de Tempo

| Camada | Por lote | Total (32 lotes) |
|--------|----------|-----------------|
| Funcional (Supertest) | ~30 min implementar | ~16h |
| E2E em Tela (Playwright) | ~45 min executar | ~24h |
| **Total** | | **~40h de trabalho** |

---

## Arquivos Criados

| Arquivo | Caminho |
|---------|---------|
| Plano Funcional (JSON) | `testes/testes-funcionais/pedido/_planos/TST-FUN-PEDIDO-EDICAO-MASSA-COLUNAS.json` |
| Plano E2E (JSON) | `testes/testes-e2e/pedido/_planos/TST-E2E-PEDIDO-EDICAO-MASSA-COLUNAS-000001.json` |
| Resumo (este arquivo) | `testes/testes-funcionais/pedido/_planos/PLANO-EDICAO-MASSA-COLUNAS-RESUMO.md` |
