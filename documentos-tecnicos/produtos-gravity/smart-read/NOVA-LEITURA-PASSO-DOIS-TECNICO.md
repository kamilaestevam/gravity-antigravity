# Nova Leitura — Passo 02 (Análise do arquivo) — Smart Docs

> **Escopo deste documento:** somente **Passo 2** do wizard.  
> **Branch de referência UX:** `tela_smart_read_tela_2` (dashboard métricas + pipeline IA + globo).  
> **Passo anterior:** [NOVA-LEITURA-PASSO-UM-TECNICO.md](./NOVA-LEITURA-PASSO-UM-TECNICO.md) · **Passo seguinte:** [NOVA-LEITURA-PASSO-TRES-TECNICO.md](./NOVA-LEITURA-PASSO-TRES-TECNICO.md) · **Passo 4:** doc futuro.

---

## 1. SSOT de código

| Artefato | Caminho |
|----------|---------|
| Modal wizard | `client/src/components/nova-leitura-smart-read/modal-nova-leitura-smart-read.tsx` |
| Dashboard passo 2 | `client/src/components/nova-leitura-smart-read/dashboard-analise-nova-leitura-smart-read.tsx` |
| Sidebar + botões | `client/src/components/nova-leitura-smart-read/painel-lateral-arquivos-nova-leitura-smart-read.tsx` |
| Card de arquivo (documentos identificados) | `client/src/components/nova-leitura-smart-read/card-arquivo-nova-leitura-smart-read.tsx` |
| Erros amigáveis por arquivo | `client/src/shared/formatar-erro-arquivo-leitura-smart-read.ts` |
| Cliente HTTP legado (mensagem bruta) | `server/src/lib/cliente-legado-smart-read.ts` |
| Tempo congelado / fallback extração | `client/src/shared/resolver-tempo-analise-nova-leitura-smart-read.ts` |
| Agregação «Base de cálculo» | `client/src/shared/montar-entrada-agregacao-nova-leitura-smart-read.ts` |
| Saving passo 2 | `client/src/shared/calcular-saving-nova-leitura-smart-read.ts` |
| Persistência progresso | `client/src/shared/persistencia-leitura-smart-read.ts` |
| Estilos | `client/src/components/nova-leitura-smart-read/modal-nova-leitura-smart-read.css` |
| Modal metodologia saving | `client/src/pages/insights-smart-read/metodologia-saving-insights-smart-read.tsx` |
| BFF polling | `server/src/routes/leituras-smart-read.ts` (`GET /:id_leitura`) |
| Campo `tempo_processo_total_ms` | `server/src/schemas/leitura-smart-read.ts` (dentro de `LeituraSchema` no progresso) |
| Contador «Uso de IA» (sidebar) | `client/src/components/nova-leitura-smart-read/contador-tokens-discreto-nova-leitura-smart-read.tsx` |
| Hook contador (observador passivo) | `client/src/shared/use-contador-tokens-leitura-smart-read.ts` |
| Análise de riscos pós-OCR | `client/src/shared/disparar-analise-riscos-background-smart-read.ts` |
| Animação tokens em tempo real | `client/src/shared/use-valor-tokens-animado-smart-read.ts` |
| Montagem estado persistível (passo 2–4) | `client/src/shared/montar-estado-progresso-leitura-smart-read.ts` |
| Sync leitura API → arquivos locais | `client/src/shared/tipo-arquivo-nova-leitura-smart-read.ts` (`aplicarLeituraApiNosArquivosLocais`) |

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

> **Nomenclatura botão avançar (passo 2):** rótulo **Continuar** (não «Enviar»). **Continuar** só habilita quando `processamentoFinalizado` (polling concluiu ou erro tratado). Durante o save, o botão exibe loading e ignora cliques repetidos (`salvandoPasso` + `continuandoPassoRef` — PR #829).

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
| Tempo de leitura | Cronômetro `HH : MM : SS`; acumula em `tempo_processo_total_ms` e persiste no progresso |
| Recursos reduzidos | `calcularSavingNovaLeituraSmartRead` — base manual − tempo de leitura; link **Base de cálculo →** abre modal metodologia (z-index acima do wizard) |
| Tempo reduzido acumulado | Infográfico workspace (`useSavingAcumuladoWorkspaceSmartRead` — **1 chamada** a `GET /leituras/agregado-workspace`, 100% Postgres); visível já durante a análise; rodapé «Histórico do workspace · desde DD/MM/AAAA» |
| Pipeline (progresso honesto — TASK-000424) | 1. **Envio dos arquivos** = progresso REAL de upload (eventos XHR byte a byte); 2. **Análise dos documentos** = ESTIMATIVA calibrada pela mediana histórica do workspace (`tempo_mediano_analise_ms`, fallback 30s/arquivo), teto 95%, pill «Estimativa»; 3. **Consolidação dos resultados** = fração REAL de arquivos completos. SSOT: `calcular-progresso-etapas-analise-nova-leitura-smart-read.ts` |
| Erro com motivo real | `LeituraSchema.mensagem_erro` carrega o `errorMessage` do DATI (leitura e arquivo); polling `FAILED` exibe o motivo traduzido pelo classificador e loga o texto bruto no console |
| Globo | Anel SVG proporcional à média das três barras; 100% quando todas as etapas completas |
| SLA UX | Barras refletem o tempo real do DATI (~30s/arquivo); testes EMT validam execução total ≤ **75s** |
| Voltar | Retorna ao passo 1 (arquivos preservados); `PATCH` passo anterior com `permitirRegressaoPasso` |
| Continuar | `PATCH` passo 3 + avanço UI quando `montarEstadoProgressoLeituraSmartRead` monta estado válido (exige `resultado_extracao` util — SSOT `leituraTemExtracaoUtilRetomarSmartRead`). Se barras 100% mas extração ainda não chegou ao React, sincroniza via `GET /leituras/:id` por até **15s** antes de falhar; toast «Análise ainda sincronizando» em vez de falha silenciosa (PR #829) |
| Uso de IA (sidebar) | Informativo — **não bloqueia** Continuar. Prefetch de riscos pós-OCR atualiza tokens via `onTokensAtualizados` sem acionar «contando tokens» com zero; OCR em andamento exibe «—» + «aguardando extração do documento» |
| Cancelar | Fecha modal; persiste progresso incl. `tempo_processo_total_ms` quando aplicável |
| Erro parcial | Polling pode concluir com mix de arquivos `completo` + `erro`; usuário segue para Conferência só com os que analisaram |

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
Ambiente: `http://localhost:8000/smart_read/insights` + sidecar Smart Docs `8033`.

| # | Análise | Critério de aceite | Print sugerido |
|---|---------|-------------------|----------------|
| **01** | Passo 2 aberto | Stepper «Análise do arquivo» ativo após Enviar | `01-passo2-selecao.png` / `01-passo2-resultado.png` |
| **02** | Nome da leitura | Subtítulo `Leitura NNN` visível e coerente | `02-nome-selecao.png` / `02-nome-resultado.png` |
| **03** | Cards com documentos | Chips/lista com tipos identificados (ex.: BL, Invoice) | `03-cards-selecao.png` / `03-cards-resultado.png` |
| **04** | Visualizar documentos | Expandir + olho abre nova aba `blob:` | `04-visualizar-selecao.png` / `04-visualizar-resultado.png` |
| **05** | Tempo de leitura | Card com timer `HH : MM : SS` incrementando | `05-timer-selecao.png` / `05-timer-resultado.png` |
| **06** | Recursos reduzidos | Card com valor numérico + link Base de cálculo | `06-recursos-selecao.png` / `06-recursos-resultado.png` |
| **07** | Tempo acumulado | Infográfico Documentos + Saving do workspace | `07-acumulado-selecao.png` / `07-acumulado-resultado.png` |
| **08** | Pipeline honesto | Envio, Análise e Consolidação com pill «Completo» ao concluir; durante a análise, barra do motor exibe pill «Estimativa» | `08-analises-selecao.png` / `08-analises-resultado.png` |
| **09** | Globo 100% | Três barras em 100%; anel do cérebro fechado | `09-globo-selecao.png` / `09-globo-resultado.png` |
| **10** | SLA 75 segundos | Fluxo completo do passo 2 em ≤ 75s | `10-sla-selecao.png` / `10-sla-resultado.png` |
| **11** | Continuar → passo 3 | Um clique avança para Conferência; cliques repetidos não travam; se extração atrasar, toast de sincronização (não falha silenciosa) | `11-continuar-selecao.png` / `11-continuar-resultado.png` |

**Fora de escopo deste doc:** conferência campo a campo (passo 3) e resultado final (passo 4).

---

## 6. Testes automatizados (referência cruzada)

Pastas espelhadas em `testes/testes-{unitarios|funcionais|e2e|cross-organizacao|em-tela}/produto-gravity/smart-read/nova-leitura/passo-dois/`.

| Tipo | ID | Escopo passo 2 |
|------|-----|----------------|
| UNI | TST-UNI-SMTRD-NOVA-LEITURA-PASSO-DOIS-000151 | dashboard, cards, saving, pipeline, SLA |
| UNI | `montar-estado-progresso-leitura-smart-read.test.ts` | diagnóstico passo 3 sem extração; montagem com extração util (PR #829) |
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

---

## 7. Erros de análise por arquivo (UX + legado)

Quando o **Smart Docs legado** (DATI/microservices) falha ao processar um anexo, o BFF grava a mensagem técnica em `mensagem_erro` (`ArquivoLocalNovaLeitura` / transação). A UI **nunca** exibe esse dump na sidebar — traduz via `interpretarErroArquivoLeituraSmartRead`.

### 7.1 O que o usuário vê

| Zona | Conteúdo |
|------|----------|
| **Card sidebar** (`.sr-wizard-card--erro`) | Status **«Análise não concluída»** + bloco `.sr-wizard-card-erro-detalhe` |
| **Motivo** (`.sr-wizard-card-erro-motivo`) | Texto legível em português (causa provável + orientação) |
| **Cobrança** (`.sr-wizard-card-erro-cobranca`) | **«Este arquivo não será cobrado.»** (verde) — regra de produto: falha de análise não gera cobrança daquele anexo |
| **Alerta passo 2** (`.sr-wizard-analise-alerta-erro`) | «Um ou mais arquivos não puderam ser analisados. Veja o motivo na sidebar — arquivos com erro não serão cobrados.» |

Constantes SSOT: `TITULO_ERRO_ARQUIVO_LEITURA_SMART_READ`, `AVISO_SEM_COBRANCA_ERRO_ARQUIVO_LEITURA_SMART_READ`.

Testes UNI: `testes/testes-unitarios/produto-gravity/smart-read/formatar-erro-arquivo-leitura-smart-read.test.ts`.

### 7.2 Origem da mensagem técnica

1. Upload → BFF → legado (`cliente-legado-smart-read.ts`).
2. Falha HTTP → string do tipo `Smart Docs legado respondeu {status}: {corpo}` (até 300 chars).
3. Modal wizard seta `status_arquivo_local: 'erro'` e `mensagem_erro` no card.

### 7.3 Mapeamento legado → motivo amigável

| Padrão na `mensagem_erro` (case-insensitive) | Motivo exibido ao usuário |
|---------------------------------------------|---------------------------|
| `soffice binary` / `could not find soffice` | Excel (.xlsx) não convertido — enviar PDF ou JPG/PNG |
| `central directory` / `is this a zip` | `.xls` (Excel antigo) não suportado na conversão — salvar como .xlsx ou PDF |
| `convert excel to pdf` | Planilha não convertida — tentar PDF, CSV ou imagem |
| `403 forbidden` / `respondeu 403` | XML bloqueado no legado — tentar PDF, imagem ou planilha |
| `tempo limite` / `timeout` | Análise excedeu tempo — reenviar |
| `sem vínculo` / `ORGANIZACAO_SEM_VINCULO` | Organização sem vínculo Smart Docs — suporte |
| `legado indisponível` / `SMART_READ_LEGADO_*` | Serviço indisponível — tentar depois |
| `respondeu 422` / `unprocessable` | Formato/conteúdo não processado — verificar arquivo |
| `respondeu 5` / `service unavailable` | Instabilidade do serviço |
| *(default)* | Falha inesperada — verificar integridade e formato |

### 7.4 Formatos aceitos no passo 1 vs falhas observadas em produção

O passo 1 aceita `.pdf`, `.jpg`, `.jpeg`, `.png`, `.xml`, `.csv`, `.xls`, `.xlsx` ([NOVA-LEITURA-PASSO-UM-TECNICO.md](./NOVA-LEITURA-PASSO-UM-TECNICO.md) §4). Nem todo formato aceito no upload conclui análise no legado:

| Formato | Upload (passo 1) | Análise legado (passo 2) — observado |
|---------|-------------------|--------------------------------------|
| CSV, JPG, JPEG, PNG | OK | OK (classifica documento, ex.: INVOICE) |
| XLSX | OK | Falha se **LibreOffice (`soffice`)** ausente no servidor legado (422) |
| XLS | OK | Falha frequente: legado trata como ZIP/xlsx (422 «central directory») |
| XML | OK | Falha **403 Forbidden** no legado (ambiente produção, jun/2026) |

**Infra pendente (legado, fora do BFF Gravity):** instalar/configurar `soffice` para Excel; liberar rota XML; tratar `.xls` distinto de `.xlsx`.

Fixtures multi-formato para teste manual: script `scripts/gerar-invoice-teste-smart-read.py` → `~/Downloads/smart-read-invoice-teste/`.
