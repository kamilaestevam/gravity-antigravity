# Plano de Testes Unitários — Importar Planilha (Smart Import)

**ID:** TST-UNIT-PEDIDO-IMPORTAR-PLANILHA-001
**Data:** 2026-05-24
**Versão:** 1.0
**Criticidade:** alta
**Cobertura mínima:** 70%
**Ambiente:** `@vitest-environment node`

---

## Resumo Executivo

Plano unitário para a importação inteligente de pedidos via planilha (Detroit e template Gravity). Cobre o bug crítico de **FABRICANTE vazio na Lista** (`mapPedido` não lia `dados_extras_importacao_pedido`), resolução de parceiros no Cadastros, cobertura SSOT de campos e `SmartImportService.confirmar`.

---

## Módulos Cobertos

| Módulo | Tipo | Arquivo Fonte |
|--------|------|---------------|
| `mapPedido` | ACL HTTP | `processos-core/src/routes/pedidos.ts` |
| `superficiarCamposJsonPedido` | Função pura | `pedido/shared/camposJsonPedidoLista.ts` |
| `extrairCamposParceirosPorNumeroPedido` | Função pura | `pedido/server/.../smartImportParceirosService.ts` |
| `normalizarPaisIso2` | Função pura | idem |
| Raio-X SSOT vs import | Documentação viva | `smartImportService.ts` + `campos-pedido-ddd.ts` |
| `SmartImportService.confirmar` | Service | `smartImportService.ts` |

---

## Casos de Teste

### 1. mapPedido — visibilidade Lista pós-import (U-MAP)

| ID | Caso | Resultado Esperado |
|----|------|-------------------|
| U-MAP-01 | `dados_extras_importacao_pedido.nome_fabricante = KONGSBERG` | `row.nome_fabricante === 'KONGSBERG'` |
| U-MAP-02 | JSON extras com contatos exportador | `email_contato_exportador`, `exportador_ou_fabricante` no top-level |
| U-MAP-03 | Snapshot fabricante presente | Prioriza `snapshots_empresa_pedido` sobre extras |
| U-MAP-04 | Só itens com mesmo `nome_fabricante_item` | Agrega valor único no pai |
| U-MAP-05 | Extras com primeiro fabricante + itens distintos | Pai mostra extras (primeiro agregado) |

### 2. superficiarCamposJsonPedido (U-JSON)

| ID | Caso | Resultado Esperado |
|----|------|-------------------|
| U-JSON-01 | extras + detalhes OPE | Campos mesclados no shape plano |
| U-JSON-02 | Raio-X: lacunas `cnpj_exportador/importador` | Documentado como débito intencional |

### 3. Parceiros — extração planilha (U-PAR)

| ID | Caso | Resultado Esperado |
|----|------|-------------------|
| U-PAR-01 | Linhas ITEM Detroit com exportador + fabricante | Agrega por `numero_pedido` |
| U-PAR-02 | Dois fabricantes distintos no mesmo pedido | Agrega primeiro nome no pedido |
| U-PAR-03 | `normalizarPaisIso2` ISO-2 e nomes comuns | Mapeamento correto |

### 4. SmartImportService.confirmar (U-CNF)

| ID | Caso | Resultado Esperado |
|----|------|-------------------|
| U-CNF-01 | Create pedido+item sem `$transaction` aninhada | `criados = 1` |
| U-CNF-02 | Append item incremental mesmo PO | `create` pedido 1x, item 2x |
| U-CNF-03 | `decisoes_duplicatas.pular` | `pulados = 1` |
| U-CNF-04 | Valor unitário negativo | Erro na linha |
| U-CNF-05 | preview_id de outro tenant | AppError 403 |
| U-CNF-06 | `parceirosPorNumero` com exportador | FK + snapshots no create |

---

## Estrutura de Arquivos

```
testes/testes-unitarios/pedido/lista/importar/planilha/
├── importar-planilha-unitario.md     ← este plano
├── map-pedido-parceiros.test.ts      ← U-MAP, U-JSON
├── parceiros-extracao.test.ts        ← U-PAR
├── cobertura-campos.test.ts          ← U-JSON-02 + Raio-X
└── confirmar-service.test.ts         ← U-CNF
```
