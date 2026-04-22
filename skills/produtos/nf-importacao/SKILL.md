---
name: antigravity-nf-importacao
description: "Use esta skill ao desenvolver ou modificar o produto NF Importacao (Nota Fiscal de Entrada para importacoes). Contem regras de rateio, despesas, exportacao multi-formato, e isolamento zero-trust por Organização + Workspace."
---

# Gravity — Skill: NF Importacao

> **ATENCAO IA:** Se voce for modificar queries Prisma, rotas Express, logica de rateio, motor de exportacao, ou qualquer arquivo dentro de `produto/nf-importacao/`, voce DEVE seguir TODAS as regras abaixo. Violacao de qualquer regra e motivo de rejeicao pelo QA.

---

## 1. Arquitetura 3-Tier — Regras Estruturais

| Camada | Entidade | Papel |
|--------|----------|-------|
| **1 — NF** | `NfImportacao` | Documento mestre — DUIMP, empresa, status, totais |
| **2 — Item** | `NfImportacaoItem` | Item da DUIMP — NCM, valores, impostos, CFOP, CSTs |
| **3 — Despesa** | `NfImportacaoDespesa` | Despesa a ratear — nome, valor, metodo |
| **3.1 — Rateio** | `NfImportacaoRateio` | Resultado: despesa × item = valor rateado |
| **4 — Documento** | `NfImportacaoDocumento` | Recibos e comprovantes |
| **5 — Historico** | `NfImportacaoHistorico` | Audit trail append-only |
| **Config** | `DespesaCatalogo` | Catalogo de despesas por empresa |
| **Config** | `DespesaTemplate` | Template de despesas fixas |
| **Config** | `ExportLayout` | Layout de exportacao customizado |
| **Config** | `FavoritoFiscal` | Presets CFOP + CSTs por NCM |

### Regras
- Nunca criar NfImportacaoItem sem NfImportacao pai
- Nunca criar NfImportacaoRateio sem NfImportacaoDespesa + NfImportacaoItem
- Rateios sao recalculados (delete + recreate) quando despesa ou itens mudam
- Historico e APPEND-ONLY — nunca update, nunca delete

---

## 2. Motor de Rateio — Regras Criticas

### 9 Metodos

| Metodo | Chave Prisma | Calculo |
|--------|-------------|---------|
| Peso Liquido | `PESO_LIQUIDO` | `despesa * (peso_item / peso_total)` |
| Peso Bruto | `PESO_BRUTO` | `despesa * (peso_bruto_item / peso_bruto_total)` |
| Valor CIF | `VALOR_CIF` | `despesa * (cif_item / cif_total)` |
| Valor FOB | `VALOR_FOB` | `despesa * (fob_item / fob_total)` |
| Quantidade | `QUANTIDADE` | `despesa * (qtd_item / qtd_total)` |
| Valor II | `VALOR_II` | `despesa * (ii_item / ii_total)` |
| Igualitario | `IGUALITARIO` | `despesa / numero_itens` |
| Manual | `MANUAL` | Usuario define por item |
| Customizado | `CUSTOMIZADO` | Formula ponderada (ex: 60% peso + 40% valor) |

### Regras Inviolaveis do Rateio

1. **Centavo restante:** Arredondamento aplicado no ULTIMO item — `sum(rateios) == despesa.valor_total`
2. **Metodo por despesa:** Cada despesa tem metodo independente — nunca por NF
3. **Divisor zero:** Se `peso_total = 0` e metodo = `PESO_LIQUIDO`, fallback para `IGUALITARIO` com warning
4. **Valor negativo:** Nenhum rateio pode ser < 0 — se formula resultar negativo, erro
5. **Calculo in-memory:** Rateio e calculado na aplicacao, NAO no SQL
6. **Preview stateless:** `/rateio/preview` calcula sem salvar no banco
7. **Tolerancia:** Diferenca maxima aceita entre soma rateada e total = 0.01 * casas_decimais
8. **Formula customizada:** Parser seguro com whitelist — NUNCA `eval()`

---

## 3. IDs Corporativos (Identidades Fortes)

| Entidade | Prefixo | Formato | Exemplo |
|----------|---------|---------|---------|
| NF Importacao | `nfim_id_` | `nfim_id_XXXXXXX/YY` | `nfim_id_0000001/26` |
| Item | `nfit_id_` | `nfit_id_XXXXXXX/YY` | `nfit_id_0000042/26` |
| Despesa | `nfdp_id_` | `nfdp_id_XXXXXXX/YY` | `nfdp_id_0000015/26` |
| Rateio | `nfrt_id_` | `nfrt_id_XXXXXXX/YY` | `nfrt_id_0000099/26` |

- XXXXXXX = sequencial por Organização (7 digitos, zero-padded)
- YY = 2 ultimos digitos do ano
- NUNCA usar `cuid()` ou `uuid()` para entidades de negocio
- Config entities (catalogo, template, layout, favorito) usam `cuid()` — OK

---

## 4. Isolamento Zero-Trust (Organização + Workspace)

```typescript
// TODA query DEVE ter os campos Prisma reais do fragment.prisma:
where: {
  tenant_id: req.tenant.tenantId,        // Organização (campo Prisma real)
  company_id: req.tenant.companyId,      // Workspace (campo Prisma real)
  // ... filtros adicionais
}
```

> Os nomes dos campos Prisma `tenant_id` e `company_id` são preservados conforme o `fragment.prisma` real (Mandamento 02 — schema intocável). Em payloads, JSON e variáveis TypeScript fora do contexto Prisma, use a nomenclatura DDD (`idOrganizacao`, `idWorkspace`).

- Catalogo, templates, layouts, favoritos = SEMPRE filtrados por Workspace (`company_id`)
- Acesso entre Organizações distintas retorna **404** (nunca 403)
- Um despachante com N clientes = N Workspaces = N catalogos separados
- NF de um Workspace NUNCA visivel para outro Workspace

---

## 5. Ciclo de Vida (Status Engine)

```
rascunho → em_composicao → pronta → exportada
                ↓
            cancelada
```

| Transicao | Quando | Validacao |
|-----------|--------|-----------|
| rascunho → em_composicao | Primeira despesa adicionada | Pelo menos 1 item |
| em_composicao → pronta | Rateio calculado + fiscal preenchido | Soma valida + CFOP em todos os itens |
| pronta → exportada | Arquivo gerado e baixado | Formato selecionado |
| * → cancelada | Usuario cancela | NF nao exportada |
| exportada → (duplicar) | Cria nova NF com dados copiados | Nova NF em status rascunho |

- Status transita APENAS via `nfImportacaoStatusEngine`
- NUNCA `prisma.nfImportacao.update({ data: { status: 'xxx' } })` direto
- Toda transicao gera `NfImportacaoHistorico`
- NF `exportada` e READ-ONLY — duplicar para editar

---

## 6. Despesas — Regras

1. **Catalogo e LIVRE** — usuario nomeia como quiser (nao ha lista fixa)
2. **Nome unico por empresa** — `@@unique([tenant_id, company_id, nome])` (campos Prisma reais que mapeiam Organização + Workspace)
3. **Template auto-popula** — ao criar NF, se empresa tem template padrao, despesas sao adicionadas automaticamente
4. **Smart Read de recibos** — upload de PDF/imagem → IA extrai tipo + valor → preview amarelo → confirma
5. **Conta contabil opcional** — para integracao ERP (cada empresa mapeia)
6. **Origem rastreada** — `MANUAL | TEMPLATE | SMART_READ | PLANILHA`

---

## 7. Exportacao — Regras

1. **Layout customizado e o diferencial** — usuario monta formato exato
2. **Pre-sets obrigatorios:** SAP IDOC, TOTVS Protheus, TOTVS Datasul, Excel Generico
3. **Codificacao:** suportar UTF-8 e ISO-8859-1 (ERPs legados usam ISO)
4. **Preview obrigatorio** — usuario ve o arquivo antes de gerar
5. **TXT posicao fixa:** cada campo tem posicao_inicio + tamanho_fixo
6. **Campos dinamicos de despesa:** layout pode incluir `despesa.[nome]` = valor rateado daquela despesa
7. **Formula customizada no layout:** NUNCA usar `eval()` — parser seguro

---

## 8. Localizacao do Codigo

| O que | Onde |
|-------|------|
| Frontend | `produto/nf-importacao/client/src/` |
| Backend | `produto/nf-importacao/server/src/` |
| Motor de rateio | `produto/nf-importacao/server/src/services/rateioEngine.ts` |
| Motor de exportacao | `produto/nf-importacao/server/src/services/exportEngine.ts` |
| Algoritmos de rateio | `produto/nf-importacao/server/src/lib/rateioAlgorithms.ts` |
| Formatadores | `produto/nf-importacao/server/src/lib/exportFormatters/` |
| Fragment Prisma | `produto/nf-importacao/server/prisma/fragment.prisma` |
| Testes | `testes/testes-unitarios/nf-importacao/` |
| PRD | `documentos-tecnicos/produto/nf-importacao/PRD.md` |
| Arquitetura | `documentos-tecnicos/produto/nf-importacao/ARQUITETURA.md` |

---

## 9. Rotas Registradas

### Porta: 8028 | Prefixo: `/api/v1/nf-importacao`

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/` | Lista NFs |
| POST | `/` | Cria NF |
| GET | `/:id` | Detalhe |
| PUT | `/:id` | Atualiza |
| DELETE | `/:id` | Cancela |
| POST | `/:id/duplicar` | Duplica |
| POST | `/importar/xml` | Upload XML DUIMP |
| POST | `/importar/smart-read` | Upload PDF DUIMP |
| POST | `/importar/portal-unico` | Puxa DUIMP via API |
| POST | `/importar/processo/:processoId` | Puxa do Processo |
| GET | `/:id/itens` | Lista itens |
| POST | `/:id/itens` | Adiciona item |
| PUT | `/:id/itens/:itemId` | Atualiza item |
| DELETE | `/:id/itens/:itemId` | Remove item |
| GET | `/:id/despesas` | Lista despesas |
| POST | `/:id/despesas` | Adiciona despesa |
| PUT | `/:id/despesas/:despesaId` | Atualiza despesa |
| DELETE | `/:id/despesas/:despesaId` | Remove despesa |
| POST | `/:id/despesas/smart-read` | Smart Read recibos |
| POST | `/:id/despesas/aplicar-template` | Aplica template |
| POST | `/:id/rateio/preview` | Preview rateio |
| POST | `/:id/rateio/aplicar` | Aplica rateio |
| PUT | `/:id/rateio/:rateioId` | Override manual |
| POST | `/:id/exportar` | Gera arquivo |
| GET | `/:id/exportar/preview` | Preview arquivo |
| GET | `/config/despesas` | Catalogo |
| POST | `/config/despesas` | Cria despesa |
| GET | `/config/templates` | Templates |
| POST | `/config/templates` | Cria template |
| GET | `/config/layouts` | Layouts |
| POST | `/config/layouts` | Cria layout |
| GET | `/config/favoritos-fiscais` | Favoritos |
| POST | `/config/favoritos-fiscais` | Salva favorito |

---

## 10. Casas Decimais

| Campo | Padrao | Configuravel? |
|-------|--------|--------------|
| Valores monetarios (FOB, CIF, impostos) | 2 | Sim (`casas_decimais_valor`) |
| Quantidades | 4 | Sim (`casas_decimais_qtd`) |
| Aliquotas | 4 | Nao (fixo) |
| Percentual de rateio | 4 | Nao (fixo) |
| Peso | 4 | Nao (fixo) |

- NUNCA hardcodar casas decimais — usar config da empresa
- Arredondamento: `ROUND_HALF_UP` (padrao bancario)
- Centavo restante no rateio: ultimo item absorve diferenca

---

## 11. Registro no Admin e contracts.json

```json
// servicos-global/contracts.json
{
  "nf-importacao": {
    "baseUrl": "http://localhost:8028",
    "pathPrefix": "/api/v1/nf-importacao"
  }
}
```

```typescript
// PRODUCT_CONFIG.id = 'nf-importacao'
// Frontend port: 5183
// Backend port: 8028
```
