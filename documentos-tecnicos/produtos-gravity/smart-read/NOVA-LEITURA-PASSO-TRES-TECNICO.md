# Nova Leitura — Passo 03 (Conferência) — Smart Docs

> **Escopo deste documento:** **Passo 3** do wizard — conferência de campos, resumo triplo (usuário / Gravity / riscos), checklist matriz e marcação manual.  
> **Passo anterior:** [NOVA-LEITURA-PASSO-DOIS-TECNICO.md](./NOVA-LEITURA-PASSO-DOIS-TECNICO.md) · **Matriz / pipeline riscos:** [ANALISE-DE-RISCOS-TECNICO.md](./ANALISE-DE-RISCOS-TECNICO.md) · **Passo 4:** doc futuro.

---

## 1. SSOT de código

| Artefato | Caminho |
|----------|---------|
| Modal wizard | `client/src/components/nova-leitura-smart-read/modal-nova-leitura-smart-read.tsx` |
| Área conferência | `client/src/components/nova-leitura-smart-read/area-conferencia-nova-leitura-smart-read.tsx` |
| Grid de campos | `client/src/components/nova-leitura-smart-read/conferencia-campos-nova-leitura-smart-read.tsx` |
| Linha editável | `client/src/components/nova-leitura-smart-read/campo-linha-conferencia-nova-leitura-smart-read.tsx` |
| **Resumo triplo** | `client/src/components/nova-leitura-smart-read/resumo-conferencia-analise-risco-nova-leitura-smart-read.tsx` |
| **Modal checklist Gravity** | `client/src/components/nova-leitura-smart-read/modal-checklist-conferencia-nova-leitura-smart-read.tsx` |
| **Corpo checklist** | `client/src/components/nova-leitura-smart-read/checklist-conferencia-corpo-smart-read.tsx` |
| **Infográfico checklist** | `client/src/components/nova-leitura-smart-read/infografico-checklist-geral-smart-read.tsx` |
| **Aba análise de riscos** | `client/src/components/nova-leitura-smart-read/conferencia-riscos-aduaneiros-nova-leitura-smart-read.tsx` |
| **Hook conferência usuário** | `client/src/shared/use-conferencia-usuario-documento-smart-read.ts` |
| **Stores marcação manual** | `client/src/shared/checklist-marcacao-usuario-smart-read.ts` |
| **Matriz checklist (shared)** | `shared/montar-checklist-matriz-invoice-smart-read.ts` |
| **Helpers campo data** | `client/src/shared/data-campo-conferencia-leitura-smart-read.ts` |
| Seções / labels legado | `client/src/shared/extrair-secoes-conferencia-leitura-smart-read.ts`, `mapear-rotulo-campo-legado-conferencia-smart-read.ts` |
| Estilos | `client/src/components/nova-leitura-smart-read/modal-nova-leitura-smart-read.css` |
| Cores barra lateral | [padrao-dt-row-status-campos.md](../../ux/design-system/padrao-dt-row-status-campos.md) |

---

## 2. Campo **data** — padrão oficial Gravity (obrigatório)

Campos cuja chave termina em `Date` (ex.: `document.documentDate`, `document.shippedOnBoardDate`) **não** usam input texto cru nem `CampoCalendarioGlobal` como trigger permanente no card.

| Modo | Comportamento |
|------|----------------|
| **Leitura** | Mesmo layout dos demais campos (`dt-row-value`): valor em **DD/MM/AAAA** via `formatarDataConferenciaSmartRead` |
| **Edição** | Input fino igual ao texto (`dt-row-edit input`, borda indigo) + máscara `DD/MM/AAAA` + ícone calendário à direita |
| **Calendário** | Clique no ícone abre `CampoCalendarioGlobal` (`modoUnico`, `semTrigger`) em **portal** (`document.body`, `z-index: 10001`) — paridade TabelaVirtualGlobal / Pedido; **nunca** inline dentro do `.dt-row` (evita corte por `overflow: hidden`) |
| **Persistência** | Valor canônico **`yyyy-mm-dd`** em `resultado_extracao` / `dados` (via `dateToIsoConferenciaSmartRead`) |
| **Parse entrada** | ISO, `dd/mm/aaaa`, `dd.mm.aaaa` normalizados por `normalizarValorDataConferenciaParaIso` — parse local (`new Date(y, m-1, d)`) para evitar off-by-one de fuso |

**Proibido:** exibir `2026-06-25` cru na UI; substituir o input padrão pelo componente completo do calendário no fluxo de edição; renderizar painel do calendário dentro do card sem portal.

**Testes UNI:** `testes/testes-unitarios/produto-gravity/smart-read/data-campo-conferencia-leitura-smart-read.test.ts`

---

## 3. Outros tipos de campo na conferência

| Tipo | Detecção | Edição |
|------|----------|--------|
| Texto | default | `input` texto em `dt-row-edit` |
| Booleano | prop `tipo="booleano"` ou chave `isSigned` | `SelectGlobal` Sim/Não → exibição «Assinado» / «Não assinado» |

---

## 4. Cores da barra lateral (resumo)

Ver SSOT completo: [padrao-dt-row-status-campos.md](../../ux/design-system/padrao-dt-row-status-campos.md).

| Estado | Cor barra | Smart Docs vs Processo |
|--------|-----------|-------------------------|
| Preenchido | Verde `#34d399` | Igual |
| Vazio | Cinza `vazio-opc` no card; amarelo só na legenda «Vazios» | Processo distingue obrigatório (amarelo) vs opcional (cinza) |
| Alterado | Roxo `#a78bfa` + badge | Só Smart Docs |

---

## 5. Legenda do topo (filtros)

Contadores clicáveis: **Verificados** (azul, total) · **Preenchidos** (verde) · **Vazios** (amarelo) · **Preenchidos alterados** (roxo). Filtram o grid; não alteram a cor individual do card vazio (cinza).

---

## 6. Contador discreto de tokens IA (sidebar)

> **Task:** TASK-000357 · Persistência: [PERSISTENCIA-DADOS-TECNICO.md](./PERSISTENCIA-DADOS-TECNICO.md) §3.1

| Aspecto | Regra |
|---------|-------|
| **Onde** | Rodapé da sidebar (`painel-lateral-arquivos-nova-leitura-smart-read.tsx`), acima de Voltar/Continuar |
| **Quando** | Visível a partir do **passo 2** (`exibirContadorTokens={passo >= 2}`) |
| **Componente** | `contador-tokens-discreto-nova-leitura-smart-read.tsx` |
| **Hook** | `use-contador-tokens-leitura-smart-read.ts` → `GET /leituras/tokens/:id_leitura` |
| **Exibição** | Sempre mostra o total (inclui `0 tokens IA`); formatação `formatarTokensDiscretoLeituraSmartRead` |
| **Atualização** | Após QA ou Análise de Riscos via `onTokensAtualizados` / `uso_llm_leitura` na resposta; senão recarrega do GET |

**Fonte dos números:** `usageMetadata` do Gemini (`promptTokenCount`, `candidatesTokenCount`) — não inclui extração DATI do passo 2. Abas que disparam LLM: **Análise de Riscos** e **Consultor Inteligente** (Rafa); **Conferência de Campos** sozinha mantém 0 até outra aba rodar.

---

## 7. Abas do passo 3

| Aba | Componente | Conteúdo |
|-----|------------|----------|
| **Conferência de Campos** | `conferencia-campos-nova-leitura-smart-read.tsx` | Grid `dt-*` + resumo triplo + toolbar |
| **Consultor Inteligente** | (Rafa) | Chat LLM sobre o documento |
| **Análise de Riscos** | `conferencia-riscos-aduaneiros-nova-leitura-smart-read.tsx` | Lista de problemas acionáveis por severidade |

O documento ativo vem da **sidebar** (`painel-lateral-arquivos-nova-leitura-smart-read.tsx`): cada subdocumento do PDF (ex.: `INVOICE`, `PACKING_LIST`) tem `indiceDocumento` próprio. O título da área principal segue o formato `{nome_arquivo} · {tipo_documento}`.

---

## 8. Três conferências (resumo triplo)

O topo da aba **Conferência de Campos** exibe três blocos (`sr-conf-resumo-triplo`). Cada um mede um aspecto distinto; apenas a **Conferência usuário** agrega marcação manual do operador.

| Bloco | O que mede | Interação | Fonte de dados |
|-------|------------|-----------|----------------|
| **Conferência usuário** | Itens que o operador marcou como revisados | Estático (barra de progresso) | Campos preenchidos + riscos + regras Gravity marcados manualmente |
| **Conferência Gravity** | % conforme na matriz de validação | Clique abre modal checklist completo | `montarResumoGeralChecklistInvoices` — resultado automático da Gravity |
| **Análise de risco** | Problemas detectados (críticos / atenção / informativos) | Clique navega para aba Riscos | `executarAuditoriaV1AnaliseRiscosLeitura` ou cache de sessão |

**Regra de unificação (PR #683):** checks manuais no modal **Conferência Gravity** somam na **Conferência usuário** em tempo real. A barra e a legenda do card usuário incluem contagem `X/Y matriz` além de campos e riscos.

**Legenda exemplo:** `11/47 conferidos por você (0/43 campos · 0/4 riscos · 11/33 matriz)`

---

## 9. Marcação manual — três stores (sessionStorage)

A confirmação manual do operador **não** persiste no Postgres nesta entrega — vive em `sessionStorage` com listeners reativos (`checklist-marcacao-usuario-smart-read.ts`).

| Store | Prefixo | Chave de sessão | Itens marcados |
|-------|---------|-----------------|----------------|
| Campos | `smart-read-campo-marcados:` | `{id_arquivo_local}:{indiceDocumento}` | Campos preenchidos do grid |
| Riscos | `smart-read-risco-marcados:` | `{id_arquivo_local}:{indiceDocumento}` | Riscos do documento ativo |
| Checklist Gravity | `smart-read-chk-marcados:` | `chaveAnaliseRiscos` (id leitura + arquivo) | Regras da matriz; chave item = `{regraId}@{rotuloDocumento}` |

**Hook unificado:** `useConferenciaUsuarioDocumentoSmartRead(arquivo, indiceDocumento, idLeituraLegado)` agrega os três stores e expõe `resumoConferencia`, `todosItensConferidos`, `alternarTodaConferencia`.

**Contagem:** `contarConferenciaUsuarioCamposERiscos` aceita parâmetros opcionais de checklist (`marcadosChecklist`, `chavesChecklist`) e retorna `totalChecklist` / `marcadosChecklist`.

---

## 10. Modal checklist Conferência Gravity

| Aspecto | Regra |
|---------|-------|
| **Abertura** | Clique no card «Conferência Gravity» no resumo triplo |
| **Documento inicial** | Segue o subdocumento selecionado na sidebar via `indiceDocumentoInicial` + `rotuloDocumentoInicial` |
| **Select de documento** | `listarDocumentosOpcoesChecklist()` — **todos** os subdocumentos da leitura (não só INVOICE); opção «Todas» agrega invoices |
| **Resolver rótulo** | `resolverRotuloInvoiceChecklistInicial(rotulo, documentos, valorTodas, indice)` — prioridade: índice → rótulo exato → primeiro documento |
| **Gráfico pizza** | `GraficoConferenciaCheckedSmartRead` — % conferência manual do documento ativo no modal |
| **Ver risco** | Link «Ver risco» em regra com atenção fecha modal e navega para aba Análise de Riscos |

**Matriz checklist:** só gera itens para documentos cujo `tipo_documento` contém `INVOICE`. Subdocumentos não-invoice aparecem no select, mas a lista de regras fica vazia.

**SSOT matriz:** `shared/matriz-validacao-invoice-smart-read.ts` · detalhe pipeline: [ANALISE-DE-RISCOS-TECNICO.md](./ANALISE-DE-RISCOS-TECNICO.md)

---

## 11. Toolbar — Selecionar toda conferência

Na aba **Conferência de Campos**, a toolbar direita (`sr-conf-toolbar-acoes-direita`) contém:

| Controle | Comportamento |
|----------|---------------|
| **Selecionar toda conferência (N)** | Checkbox + ícone; marca/desmarca **campos + riscos + matriz** do documento ativo |
| **Expandir todas / Recolher todas** | Colapsa/expande seções do grid `dt-*` |

**Estilo checkbox:** classe `.sr-conf-chk-checkbox` com `accent-color: #818cf8` (padrão Gravity / Pedido — **não** verde `#34d399`). Ícone da toolbar usa a mesma cor indigo.

---

## 12. Retomar leitura no passo 3

Ao clicar numa leitura na Lista, o wizard reabre no passo salvo em `progresso_leitura_smart_read`. A função `escolherLeituraEfetivaRetomarSmartRead` prioriza dados da API sobre localStorage vazio (evita sidebar sem arquivos).

**Seleção de documento:** `conferenciaSelecao` no modal wizard persiste `{ idArquivoLocal, indiceDocumento }` — ao retomar, a sidebar e o resumo triplo refletem o último subdocumento ativo.
