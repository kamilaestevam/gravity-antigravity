# Relatório de Impacto — tipo_operacao: exportador_nome e importador_nome

**Data:** 2026-04-07
**Responsável:** Dream Team Ajustes
**Nível de risco:** MEDIUM
**Aprovação obtida:** sim (usuário)

---

## PROBLEMA

- **Descrição:** `exportador_nome` é editável em qualquer tipo_operacao (errado). `importador_nome` existe no frontend mas nunca é salvo nem lido do banco.
- **Reproduzido em:** PATCH /api/v1/pedidos/:id/campo retorna 400 ao tentar editar campo não mapeado. Campo importador_nome retorna sempre null.
- **Causa raiz identificada:** Dois gaps: (1) CAMPOS_EDITAVEIS não valida tipo_operacao; (2) importador_nome não está em mapPedido nem no handler de detalhes_operacionais.
- **Arquivo e linha exatos:** `pedidos.ts:496` (set), `pedidos.ts:148` (mapPedido), `pedidos.ts:619` (handler)
- **Relacionado a ajuste anterior?** não
- **Padrão de ciclo detectado?** não

---

## ESCOPO POSITIVO

| Arquivo | Motivo |
|:--------|:-------|
| `servicos-global/tenant/processos-core/src/routes/pedidos.ts` | mapPedido + CAMPOS_EDITAVEIS + validação tipo_operacao + handler detalhes_operacionais |
| `produto/pedido/client/src/pages/ListaPedidos.tsx` | MAPA_COLUNAS_FILHO + CAMPOS_PAI_TEXTO + PedidoItemEnriquecido + handleEditarFilho + enriquecimento |
| `produto/pedido/client/src/components/ModalEdicaoEmMassa.tsx` | campo importador_nome + visivel por tipo_operacao |
| `produto/pedido/server/src/routes/consolidar.ts` | CAMPOS_COMPARAR + preservar detalhes_operacionais com importador_nome |

## ESCOPO NEGATIVO

| Arquivo / Módulo | Motivo |
|:-----------------|:-------|
| `fragment.prisma` | Sem alteração de schema — importador_nome vai para detalhes_operacionais (JSON já existente) |
| `pdfService.ts` | Não toca exportador_nome no sentido que quebraria |
| `importacao.ts` | Não renomeia campos, só adiciona lógica condicional |
| `produto/processo` | Produto separado, tem exportador_nome como coluna direta — não tocar |
| `KanbanPedidos.tsx` | Já usa `exportador_nome || importador_nome` — correto, não precisa mudar |
| `mockData.ts` / `api.ts` | Mocks de dev — sem impacto em produção |

---

## BLAST RADIUS

- **Dependentes diretos:** ListaPedidos, ModalEdicaoEmMassa, consolidar.ts, pdfService (leitura)
- **Dependentes indiretos:** KanbanPedidos (leitura via || — já correto)
- **Contratos afetados:** mapPedido adiciona campo — adição não quebra consumers
- **Skills verificadas:** agent-policy, code-standards, state-management

---

## CRITÉRIO DE SUCESSO

- PATCH exportador_nome com tipo_operacao=exportacao retorna 400
- PATCH importador_nome com tipo_operacao=importacao retorna 400
- PATCH importador_nome com tipo_operacao=exportacao salva e retorna valor
- GET pedido retorna importador_nome populado

## CRITÉRIO DE PARADA

- Se TypeScript falhar em qualquer arquivo após edição, parar e corrigir antes de continuar
- Se comportamento de exportador_nome existente quebrar, reverter e replanejar

---

## PLANO DE ROLLBACK

| Passo | Descrição |
|:------|:----------|
| 1 | `git diff` para identificar exatamente o que mudou |
| 2 | `git checkout` nos 4 arquivos alterados |

- **Tempo estimado de rollback:** 2 minutos
- **Rollback testado em staging?** não aplicável (dev local)

---

## EXECUÇÃO — PREENCHIDO PELO CIRURGIÃO

- **Commits realizados:** não commitado (mudanças em working tree)
- **Divergências do plano:** 2 — `nucleo-global/tabela-virtual-global/src/tipos.ts` (tipo `editavel` precisou suportar função) e `TabelaVirtualGlobal.tsx` (handler de função `editavel`)
- **Descobertas inesperadas:**
  - `GTMapaColunasFilho.editavel` era só `boolean` — foi estendido para `boolean | ((item: C) => boolean)` com handler no componente
  - `DefinicaoCampo.visivel` em ModalEdicaoEmMassa não estava declarado na interface — adicionado
  - `consolidar.ts` usava `primeiro.exportador_nome` (campo inexistente no objeto raw Prisma) — corrigido para extrair de `detalhes_operacionais`
- **Issues abertas separadamente:**
  - 3 falhas pré-existentes em `testes/testes-e2e/pedido/duplicar-itens.spec.ts` (arquivo nunca commitado, botão "Duplicar" toolbar não encontrado)

## TESTES

- **Fase 7 (unitários/funcionais):** `tsc --noEmit` executado — sem erros novos. Erros pré-existentes são aliases `@nucleo/*` / `@gravity/shell` não resolvíveis fora do Vite.
- **Playwright (teste-em-tela):** 10 críticos passaram, 2 de edição inline passaram. 3 falhas pré-existentes em duplicar-itens.spec.ts (registradas em gaps-de-cobertura.md)
- **Relatório Playwright:** `documentos-tecnicos/testes-em-tela/2026-04-07-tipo-operacao-exportador-importador.md`
