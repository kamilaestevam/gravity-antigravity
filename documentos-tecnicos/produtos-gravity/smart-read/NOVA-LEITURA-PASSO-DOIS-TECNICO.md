# Nova Leitura — Passo 02 (Análise do arquivo) — Smart Read

> **Escopo deste documento:** somente **Passo 2** do wizard.  
> **Branch de referência UX:** `tela_smart_read_tela_2` (dashboard métricas + pipeline IA + globo).  
> **Passo anterior:** [NOVA-LEITURA-PASSO-UM-TECNICO.md](./NOVA-LEITURA-PASSO-UM-TECNICO.md) · **Passos 3–4:** doc futuro.

---

## 1. SSOT de código

| Artefato | Caminho |
|----------|---------|
| Modal wizard | `client/src/components/nova-leitura-smart-read/modal-nova-leitura-smart-read.tsx` |
| Dashboard passo 2 | `client/src/components/nova-leitura-smart-read/dashboard-analise-nova-leitura-smart-read.tsx` |
| Sidebar + botões | `client/src/components/nova-leitura-smart-read/painel-lateral-arquivos-nova-leitura-smart-read.tsx` |
| Card de arquivo (documentos identificados) | `client/src/components/nova-leitura-smart-read/card-arquivo-nova-leitura-smart-read.tsx` |
| Tempo congelado / fallback extração | `client/src/shared/resolver-tempo-analise-nova-leitura-smart-read.ts` |
| Agregação «Base de cálculo» | `client/src/shared/montar-entrada-agregacao-nova-leitura-smart-read.ts` |
| Saving passo 2 | `client/src/shared/calcular-saving-nova-leitura-smart-read.ts` |
| Persistência progresso | `client/src/shared/persistencia-leitura-smart-read.ts` |
| Estilos | `client/src/components/nova-leitura-smart-read/modal-nova-leitura-smart-read.css` |
| Modal metodologia saving | `client/src/pages/insights-smart-read/metodologia-saving-insights-smart-read.tsx` |
| BFF polling | `server/src/routes/leituras-smart-read.ts` (`GET /:id_leitura`) |
| Campo `tempo_analise_segundos` | `server/src/schemas/progresso-leitura-smart-read.ts` |

**Entrada no passo 2:** botão **Enviar** do passo 1 dispara upload + polling; modal avança para «Análise do arquivo». Retomar leitura `PROCESSING` abre direto no passo 2.

---

## 2. Layout — Passo 02 (referência visual)

Modal **2xl**, quase largura total. Topo:

1. Cabeçalho «Nova Leitura» + **nome da leitura** (`.sr-wizard-modal-subtitulo-leitura`, padrão `Leitura NNN`).
2. Stepper no container indigo — passo **2 ativo**; passos 1 concluído, 3–4 inativos.

Corpo (grid lateral + principal):

| Zona | Conteúdo |
|------|----------|
| **Principal** | Três cards métricos (Tempo de leitura · Recursos reduzidos · Tempo reduzido acumulado) + painel pipeline (3 análises + globo/cérebro com anel de progresso) |
| **Sidebar** | Nome editável · cards por arquivo · status «Analisando…» / «Análise completa» · chips ou lista expandida de documentos · rodapé **Cancelar** + **Voltar** + **Continuar** |

> **Nomenclatura botão avançar (passo 2):** rótulo **Continuar** (não «Enviar»). **Continuar** só habilita quando `processamentoFinalizado` (polling concluiu ou erro tratado).

---

## 3. Regras funcionais — Passo 2

| Regra | Comportamento |
|-------|----------------|
| Abertura | Após **Enviar** (passo 1) ou retomar leitura `PROCESSING` / `PENDING` |
| Nome da leitura | Subtítulo do modal; editável na sidebar; persistido em `progresso_leitura_smart_read` |
| Polling | `GET /api/v1/smart-read/leituras/:id_leitura` a cada 2s até `COMPLETED` ou `FAILED` (limite 5 min) |
| Cards sidebar | Exibem `resultado_extracao` quando disponível; chips de `tipo_documento` recolhidos ou lista expandida |
| Visualizar original | Ícone olho no card → blob URL (mesmo passo 1) |
| Visualizar documento | Expandir card → ícone olho por tipo → blob/preview do documento identificado |
| Tempo de leitura | Cronômetro `HH : MM : SS`; congela em `tempo_analise_segundos` ao concluir análise |
| Recursos reduzidos | `calcularSavingNovaLeituraSmartRead` — base manual − tempo de leitura; link **Base de cálculo →** abre modal metodologia (z-index acima do wizard) |
| Tempo reduzido acumulado | Infográfico workspace (`useSavingAcumuladoWorkspaceSmartRead`); recarrega ao abrir metodologia |
| Pipeline IA | Três etapas simuladas no client: Primeira (~6s), Segunda (~12s), Terceira (~16s) até API marcar completo |
| Globo | Anel SVG proporcional à média das três barras; 100% quando todas as etapas completas |
| SLA UX | Progresso client-side completa em ~16s; testes EMT validam execução total ≤ **75s** |
| Voltar | Retorna ao passo 1 (arquivos preservados) |
| Continuar | Avança para passo 3 «Conferência» quando análise finalizada |
| Cancelar | Fecha modal; persiste progresso incl. `tempo_analise_segundos` quando aplicável |

Persistência: ver [PERSISTENCIA-DADOS-TECNICO.md](./PERSISTENCIA-DADOS-TECNICO.md) e [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) §3 (`PATCH /progresso`).

---

## 4. Fixtures de teste

| Uso | Caminho |
|-----|---------|
| Upload E2E/EMT | `testes/testes-unitarios/produto-gravity/smart-read/nova-leitura/passo-um/fixtures/amostras/amostra.pdf` |
| Objetos passo 2 (UNI) | `testes/testes-unitarios/produto-gravity/smart-read/nova-leitura/passo-dois/fixtures/arquivos-passo-dois-fixture.ts` |
| Nome fixture UNI | `NOME_LEITURA_FIXTURE_PASSO_DOIS = 'Leitura 742'` |

Mocks E2E/EMT/FUN simulam `GET` com `resultado_extracao` (Bill of Lading + Commercial Invoice) e `status_leitura: COMPLETED`.

---

## 5. Análises obrigatórias — teste em tela (Passo 02)

Plano EMT: `TST-EMT-SMTRD-NOVA-LEITURA-PASSO-DOIS-000155`  
Ambiente: `http://localhost:8000/smart_read/insights` + sidecar Smart Read `8033`.

| # | Análise | Critério de aceite | Print sugerido |
|---|---------|-------------------|----------------|
| **01** | Passo 2 aberto | Stepper «Análise do arquivo» ativo após Enviar | `01-passo2-selecao.png` / `01-passo2-resultado.png` |
| **02** | Nome da leitura | Subtítulo `Leitura NNN` visível e coerente | `02-nome-selecao.png` / `02-nome-resultado.png` |
| **03** | Cards com documentos | Chips/lista com tipos identificados (ex.: BL, Invoice) | `03-cards-selecao.png` / `03-cards-resultado.png` |
| **04** | Visualizar documentos | Expandir + olho abre nova aba `blob:` | `04-visualizar-selecao.png` / `04-visualizar-resultado.png` |
| **05** | Tempo de leitura | Card com timer `HH : MM : SS` incrementando | `05-timer-selecao.png` / `05-timer-resultado.png` |
| **06** | Recursos reduzidos | Card com valor numérico + link Base de cálculo | `06-recursos-selecao.png` / `06-recursos-resultado.png` |
| **07** | Tempo acumulado | Infográfico Documentos + Saving do workspace | `07-acumulado-selecao.png` / `07-acumulado-resultado.png` |
| **08** | Três análises | Primeira, Segunda e Terceira com pill «Completo» | `08-analises-selecao.png` / `08-analises-resultado.png` |
| **09** | Globo 100% | Três barras em 100%; anel do cérebro fechado | `09-globo-selecao.png` / `09-globo-resultado.png` |
| **10** | SLA 75 segundos | Fluxo completo do passo 2 em ≤ 75s | `10-sla-selecao.png` / `10-sla-resultado.png` |

**Fora de escopo deste doc:** conferência campo a campo (passo 3) e resultado final (passo 4).

---

## 6. Testes automatizados (referência cruzada)

Pastas espelhadas em `testes/testes-{unitarios|funcionais|e2e|cross-organizacao|em-tela}/produto-gravity/smart-read/nova-leitura/passo-dois/`.

| Tipo | ID | Escopo passo 2 |
|------|-----|----------------|
| UNI | TST-UNI-SMTRD-NOVA-LEITURA-PASSO-DOIS-000151 | dashboard, cards, saving, pipeline, SLA |
| FUN | TST-FUN-SMTRD-NOVA-LEITURA-PASSO-DOIS-000152 | `GET /leituras/:id` polling PROCESSING→COMPLETED |
| CRO | TST-CRO-SMTRD-NOVA-LEITURA-PASSO-DOIS-000153 | isolamento workspace no polling |
| E2E | TST-E2E-SMTRD-NOVA-LEITURA-PASSO-DOIS-000154 | Playwright fluxo UI passo 2 |
| EMT | TST-EMT-SMTRD-NOVA-LEITURA-PASSO-DOIS-000155 | checklist §5 (20 prints) |

Registry: `testes/test-plans-registry.json` · Task: `TASK-000343`.

```bash
# UNI
npx vitest run --config vitest.config.ci.ts testes/testes-unitarios/produto-gravity/smart-read/nova-leitura/passo-dois/plano-de-teste/TST-UNI-SMTRD-NOVA-LEITURA-PASSO-DOIS-000151.test.tsx

# E2E
npx playwright test testes/testes-e2e/produto-gravity/smart-read/nova-leitura/passo-dois/TST-E2E-SMTRD-NOVA-LEITURA-PASSO-DOIS-000154.spec.ts

# EMT
npx tsx testes/testes-em-tela/produto-gravity/smart-read/nova-leitura/passo-dois/plano-de-teste/run-TST-EMT-SMTRD-NOVA-LEITURA-PASSO-DOIS-000155.ts
```
