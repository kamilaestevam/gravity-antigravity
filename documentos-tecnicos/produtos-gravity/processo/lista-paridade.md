# Processo — Lista Hierárquica 3 Camadas (Paridade com Pedido)

> **Documento de contrato — Onda 0**
> Autores: Líder + Coordenador
> Data: 2026-06-01
> Status: PROPOSTA — aguardando aprovação do dono

---

## Objetivo

Criar `produto/processo/client/src/pages/ProcessoLista.tsx` (e arquivos de suporte) com **arquitetura, nomes e funções idênticas** à Lista do Pedido, adicionando uma **camada avô (Processo)** acima da hierarquia atual `Pedido → Item`.

Resultado final: **Processo → Pedido → Item** (3 camadas), com todas as features do Pedido funcionando idênticas no Processo, mas operando sobre dados próprios.

---

## Restrições (travadas pelo dono)

| Restrição | Valor |
|-----------|-------|
| Pedido pode ser modificado? | **NÃO** — 0 linhas alteradas |
| Duplicação literal de arquivos? | **SIM** — cópia de estrutura/nomes, conteúdo de dados é novo |
| Importar de `pedido/` em runtime? | **NÃO** — Pedido é caixa-preta |
| Backend? | Mock-first; Prisma fica para depois |
| Rota? | Substitui `/acesso-processos/lista` (a flat atual vira hierárquica) |

---

## Volume total mapeado

| Categoria | Arquivos | Linhas |
|-----------|---------:|-------:|
| Lista core (`pages/Pedidos.tsx` + `components/lista/`) | 8 | ~11.700 |
| Modais (Novo, Item, Excluir, Consolidar, Duplicar, EdiçãoMassa, Transferir, GerarPdf) | 8 | ~8.700 |
| Drawer + Banner + outros | 3 | ~1.500 |
| ConfiguraçãoCards/ + ConfiguraçãoColunas/ | 4+ | ~1.500 |
| SmartImport | 5 | ~2.500 |
| Shared (schemas, columnCatalog, formulaEngine, gabiSemantica, etc.) | 40+ | ~6.000 |
| **TOTAL** | **~70** | **~32.000** |

---

## Mapeamento Arquivo a Arquivo

### Página principal

| Pedido | Processo (novo) | Estratégia |
|--------|-----------------|------------|
| `pages/Pedidos.tsx` (7.037 linhas) | `pages/ProcessoLista.tsx` | **Cópia 1:1** + substituição global `pedido→processo`, `Pedido→Processo`, etc. Adicionar lógica de nível avô. |

### Componentes da Lista (`components/lista/`)

| Pedido | Processo (novo) | Estratégia |
|--------|-----------------|------------|
| `ColunasPai.tsx` (1.831) | `ColunasAvo.tsx` (novo, baseado em ColunasPai) **+** `ColunasPai.tsx` (cópia do Pedido — colunas do Pedido como pai) | Avô = colunas Processo. Pai = colunas Pedido. Filho = colunas Item. |
| `ColunasFilho.tsx` (1.968) | `ColunasFilho.tsx` | Cópia 1:1 (colunas do Item permanecem iguais). |
| `BarraAcoesPedido.tsx` (387) | `BarraAcoesProcesso.tsx` | Cópia + ações 3-níveis. |
| `filtros.ts` (58) | `filtros.ts` | Cópia 1:1 + filtros do nível avô. |
| `PopoverFiltroColuna.tsx` (238) | `PopoverFiltroColuna.tsx` | Cópia 1:1. |
| `renderBadgeParteVinculada.tsx` (81) | idem | Cópia 1:1. |
| `renderBadgeParteWorkspace.tsx` (64) | idem | Cópia 1:1. |
| `urlsDeepLinkConfigurador.ts` (68) | idem | Cópia 1:1. |

### Modais (`components/`)

| Pedido | Processo (novo) | Estratégia |
|--------|-----------------|------------|
| `ModalPedidoNovo.tsx` (1.499) | `ModalProcessoNovo.tsx` | Cópia + campos novo nível avô. |
| `ModalItemNovo.tsx` (438) | idem | Cópia 1:1. |
| `ModalPedidosEdicaoMassa.tsx` (2.331) | `ModalProcessosEdicaoMassa.tsx` | Cópia + **cascade 3-níveis** (Processo→Pedido→Item). |
| `ModalPedidosConsolidar.tsx` (1.703) | `ModalProcessosConsolidar.tsx` | Cópia + consolidação no nível avô. |
| `ModalPedidosDuplicar.tsx` (772) | `ModalProcessosDuplicar.tsx` | Cópia. |
| `ModalPedidosExcluir.tsx` (456) | `ModalProcessosExcluir.tsx` | Cópia + exclusão em cascata 3 níveis. |
| `ModalPedidoTransferir.tsx` (1.161) | `ModalProcessoTransferir.tsx` | Cópia. |
| `ModalPedidoGerarPdf.tsx` (417) | `ModalProcessoGerarPdf.tsx` | Cópia. |
| `ModalEmpresaCadastroRapido.tsx` (415) | idem | Cópia 1:1. |

### Drawer + Banner + outros

| Pedido | Processo (novo) | Estratégia |
|--------|-----------------|------------|
| `DrawerPedido.tsx` (879) | `DrawerProcesso.tsx` | Cópia + 3 níveis no detalhe. |
| `BannerSnapshotAtualizado.tsx` (138) | idem | Cópia 1:1. |
| `AnexosPainel.tsx` | idem | Cópia 1:1. |
| `ListaPedidoCards.tsx` | `ListaProcessoCards.tsx` | Cópia. |

### Configurações

| Pedido | Processo (novo) | Estratégia |
|--------|-----------------|------------|
| `pages/Configuracoes.tsx` | `pages/Configuracoes.tsx` (já existe stub em processo!) | Substitui o stub atual pela cópia da do Pedido. |
| `components/ConfiguracaoCards/` (197 + outros) | idem | Cópia. |
| `components/ConfiguracaoColunas/` (807+) | idem | Cópia + nível avô no GerenciadorColunas. |
| `pages/configuracoes/PedidoSnapshotCadastros.tsx` | `pages/configuracoes/ProcessoSnapshotCadastros.tsx` | Cópia. |

### SmartImport

| Pedido | Processo (novo) | Estratégia |
|--------|-----------------|------------|
| `components/SmartImport/*` (5 arquivos) | idem | Cópia + suporte a 3 níveis no Excel. |

### Shared (40+ arquivos)

| Pedido | Processo (novo) | Estratégia |
|--------|-----------------|------------|
| `shared/schemas.ts` | idem | Cópia + `processoSchema`. |
| `shared/columnCatalog.ts` | idem | Cópia + colunas do nível avô. |
| `shared/mockData.ts` | idem | **Reescrita** — mock 3 níveis. |
| `shared/derivedMetrics.ts` | idem | Cópia + métricas Processo. |
| `shared/formulaEngine.ts` | idem | Cópia 1:1. |
| `shared/gabiSemantica.ts` | idem | Cópia 1:1. |
| `shared/kanbanUtils.ts` | idem | Cópia. |
| `shared/cardRegistry.tsx` | idem | Cópia. |
| `shared/dashboardCatalog.ts` | idem | Cópia. |
| `shared/exportUtils.ts` | idem | Cópia 1:1. |
| `shared/permissoes/` | idem | Cópia + seção `processo`. |
| `shared/state/selecaoStore.ts` | idem | Cópia + state do nível avô. |
| `shared/state/useLinkContextualSync.ts` | idem | Cópia. |
| `shared/api.ts` | idem | Cópia + endpoints `/api/v1/processos`. |
| ... (30+ outros) | idem | Cópia 1:1 a menos que mencionado. |

### Outros

| Pedido | Processo (novo) | Estratégia |
|--------|-----------------|------------|
| `pages/PedidoFormulario.tsx` | `pages/ProcessoFormulario.tsx` | Cópia + 3 níveis. |
| `pages/PedidosKanban.tsx` | já existe `TodosProcessosKanban.tsx` | Decisão: substituir ou manter atual? **Substituir** (segue padrão). |
| `pages/PedidosDashboard.tsx` | `pages/ProcessosDashboard.tsx` | Cópia. |
| `pages/PedidosVisaoGeral.tsx` | `pages/ProcessosVisaoGeral.tsx` | Cópia. |
| `pages/PedidosImportar.tsx` | `pages/ProcessosImportar.tsx` | Cópia. |

---

## Plano de Ondas

Volume de 32k linhas exige faseamento. Cada onda termina com QA.

### Onda 0 — Inventário (este documento) ✅
**Entrega:** este `.md`. **Sem código.**

### Onda 1 — Casca (App + roteamento + mocks + types)
- `App.tsx`, `main.tsx`, `shared/config.ts`, `shared/rotas.ts`
- `shared/types.ts`, `shared/schemas.ts` (com `processoSchema`)
- `shared/mockData.ts` (5 Processos × 10 Pedidos × 30 Itens — mock hierárquico)
- `pages/ProcessoLista.tsx` mínimo (renderiza TabelaCamadasGlobal vazia)
- **Volume estimado:** ~2.000 linhas

### Onda 2 — Lista funcional (3 camadas, sem modais)
- `components/lista/ColunasAvo.tsx`, `ColunasPai.tsx`, `ColunasFilho.tsx`
- `components/lista/BarraAcoesProcesso.tsx`, `PopoverFiltroColuna.tsx`, `filtros.ts`
- `components/lista/renderBadge*.tsx`
- `pages/ProcessoLista.tsx` completo (cópia integral de `Pedidos.tsx` adaptada)
- `shared/columnCatalog.ts`, `derivedMetrics.ts`, `state/selecaoStore.ts`
- **Volume estimado:** ~14.000 linhas

### Onda 3 — Modais CRUD
- `ModalProcessoNovo`, `ModalItemNovo`, `ModalProcessosExcluir`, `ModalProcessoTransferir`, `ModalProcessoGerarPdf`, `ModalEmpresaCadastroRapido`
- `DrawerProcesso`, `BannerSnapshotAtualizado`, `AnexosPainel`
- **Volume estimado:** ~5.000 linhas

### Onda 4 — Bulk + Cascade 3 níveis
- `ModalProcessosEdicaoMassa` (com cascade Processo→Pedido→Item)
- `ModalProcessosConsolidar`, `ModalProcessosDuplicar`
- **Volume estimado:** ~5.000 linhas

### Onda 5 — Configurações + Dashboard + Kanban + Visão Geral
- `pages/Configuracoes.tsx` + `ConfiguracaoCards/` + `ConfiguracaoColunas/`
- `pages/ProcessosDashboard`, `ProcessosVisaoGeral`, substituir Kanban atual
- `shared/cardRegistry`, `dashboardCatalog`, `kanbanUtils`
- **Volume estimado:** ~4.000 linhas

### Onda 6 — SmartImport + GABI + Permissões + Testes
- `components/SmartImport/*`
- `shared/gabiSemantica`, `formulaEngine`, `permissoes/`
- Testes unit + funcional + tela (cobertura mínima 70%)
- **Volume estimado:** ~3.000 linhas + testes

### Onda 7 — Backend + QA Final
- Decisão de Prisma (acionar Coordenador para script de schema)
- Conectar endpoints reais substituindo mocks
- QA ULTIMATE Auditor passando

---

## Regras do Líder

- Cada onda termina com **QA acionado** + entrega aprovada pelo dono antes da próxima começar.
- **DDD-nomenclatura** rigorosa: `id_processo`, `numero_processo`, `tipo_processo`, etc. (skill `ddd-nomenclatura`).
- **Nenhum import de `pedido/`** em runtime — confirmar via grep antes de cada commit.
- **9 Mandamentos** respeitados em cada arquivo copiado (especialmente REGRA 05 — proibido mock preguiçoso; REGRA 08 — fallbacks ruidosos).
- **Pedido nunca tocado** — verificar via `git diff -- servicos-global/produto/pedido/` antes de commitar.

---

## Próximo passo

Dono aprova este documento → Líder dispara **Onda 1 (Casca)** imediatamente.
