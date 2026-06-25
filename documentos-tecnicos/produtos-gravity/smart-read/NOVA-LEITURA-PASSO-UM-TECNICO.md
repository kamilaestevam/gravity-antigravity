# Nova Leitura — Passo 01 (Anexar arquivo) — Smart Read

> **Escopo deste documento:** somente **Passo 1** do wizard.  
> **Branch de referência UX:** `tela_smart_read_tela_1` (stepper dentro do retângulo indigo).  
> **Wizard completo (4 passos):** `ModalNovaLeituraSmartRead` — passos 2–4 ver doc futuro.

---

## 1. SSOT de código

| Artefato | Caminho |
|----------|---------|
| Modal wizard | `client/src/components/nova-leitura-smart-read/modal-nova-leitura-smart-read.tsx` |
| Área upload (passo 1) | `client/src/components/nova-leitura-smart-read/area-anexar-nova-leitura-smart-read.tsx` |
| Formatos aceitos | `client/src/components/nova-leitura-smart-read/formatos-aceitos-anexar-nova-leitura-smart-read.tsx` |
| Sidebar + botões | `client/src/components/nova-leitura-smart-read/painel-lateral-arquivos-nova-leitura-smart-read.tsx` |
| Card de arquivo | `client/src/components/nova-leitura-smart-read/card-arquivo-nova-leitura-smart-read.tsx` |
| Extensões / accept / limite | `client/src/shared/entrada-arquivo-leitura-smart-read.ts` |
| Estilos (container stepper) | `client/src/components/nova-leitura-smart-read/modal-nova-leitura-smart-read.css` (`.sr-wizard-stepper-painel-wrap`) |
| Shell stepper | `@nucleo/modal-passo-passo-global` |

**Entrada na UI:** botão **Novo** (`BotaoNovoListaSmartRead`) em Insights ou Lista → abre modal no passo 1.

---

## 2. Layout — Passo 01 (referência visual)

Modal **2xl**, quase largura total. Topo:

1. Cabeçalho «Nova Leitura» + nome da leitura (indigo).
2. **Stepper dentro de retângulo/container** indigo (`.sr-wizard-stepper-painel-wrap`) — passo **1 ativo**, 2–4 inativos; **sem navegação direta** no passo 1.

Corpo (grid lateral + principal):

| Zona | Conteúdo |
|------|----------|
| **Principal** | Dropzone: boas-vindas, «Clique ou arraste», formatos aceitos (ícones + tooltips), limite 50 MB, aviso multi-documento |
| **Sidebar** | Nome editável · «Arquivos enviados» + badge · lista de cards · rodapé **Cancelar** + **Enviar** |

> **Nomenclatura botão avançar (passo 1):** o rótulo é **Enviar**, não «Continuar». «Continuar» aparece a partir do passo 2. Ambos avançam o fluxo; no passo 1 só **Enviar** está visível.

---

## 3. Regras funcionais — Passo 1

| Regra | Comportamento |
|-------|----------------|
| Anexar | Clique, drag-and-drop ou `input[type=file]` múltiplo |
| Formatos | `.pdf`, `.jpg`, `.jpeg`, `.png`, `.xml`, `.csv`, `.xls`, `.xlsx` — SSOT `EXTENSOES_ARQUIVO_LEITURA_SMART_READ` |
| Limite | 50 MB por arquivo |
| Após anexar | Card na sidebar, status «Arquivo enviado» |
| Nome no card | `item.arquivo.name` (nome original do arquivo) |
| Visualizar | Ícone olho → `window.open(blob URL)` em nova aba |
| Excluir | Ícone lixeira → `ModalConfirmarExcluirGlobal` (padrão Gravity) → remove card e revoga blob |
| Cancelar | Fecha modal (`handleFechar`); persiste progresso se aplicável |
| Enviar | Habilitado só com ≥1 arquivo; dispara `POST` legado + **vai para passo 2** |

Exclusão no legado DATI: **não** chama `DELETE` (rota `501`) — ver [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) §3.

---

## 4. Fixtures de teste (um arquivo por extensão)

SSOT: `testes/testes-unitarios/produto-gravity/smart-read/nova-leitura/passo-um/fixtures/amostras/`

| Extensão | Arquivo fixture |
|----------|-----------------|
| pdf | `amostra.pdf` |
| jpg | `amostra.jpg` |
| jpeg | `amostra.jpeg` |
| png | `amostra.png` |
| xml | `amostra.xml` |
| csv | `amostra.csv` |
| xls | `amostra.xls` |
| xlsx | `amostra.xlsx` |

Gerador: `fixtures/gerar-fixtures-passo-um.mjs`. **Obrigatório** manter paridade com as 8 extensões do SSOT.

---

## 5. Análises obrigatórias — teste em tela (Passo 01)

Plano EMT: `TST-EMT-SMTRD-NOVA-LEITURA-PASSO-UM-000150`  
Ambiente: `http://localhost:8000/smart-read/insights` (ou Lista) + sidecar `8033`.

| # | Análise | Critério de aceite | Print sugerido |
|---|---------|-------------------|----------------|
| **01** | Abertura da tela | Insights/Lista carrega; botão Novo visível | `01-tela-insights-ou-lista.png` |
| **02** | Abertura dos passos — passo 1 | Modal abre; stepper no container indigo; passo «Anexar arquivo» ativo; layout lateral + dropzone | `02-modal-passo1-stepper-container.png` |
| **03** | Anexar arquivos | Upload por clique ou drag adiciona item | `03-anexar-arquivo-sucesso.png` |
| **04** | Todos os tipos aceitos | Cada extensão da §4 anexa sem erro de formato | `04-{ext}-aceito.png` (8 prints) |
| **05** | Abertura do card | Após anexar, card aparece na sidebar | `05-card-aparece-sidebar.png` |
| **06** | Nome no card | Card exibe nome idêntico ao arquivo | `06-card-nome-arquivo.png` |
| **07** | Abrir visualizar | Ícone olho clicável; sem erro na UI | `07-visualizar-clicado.png` |
| **08** | Visualizar abre arquivo | Nova aba/janela com preview ou download do blob | `08-arquivo-aberto-nova-aba.png` |
| **09** | Excluir com aviso | Modal padrão Gravity; confirmar remove card | `09-excluir-modal-e-remocao.png` |
| **10** | Cancelar | Fecha modal; retorna à tela anterior | `10-cancelar-fecha-modal.png` |
| **11** | Avançar para próximo passo | **Enviar** (com arquivo) → passo 2 «Análise do arquivo» | `11-enviar-vai-passo2.png` |

**Fora de escopo deste doc:** validar passo 2+ (análise IA, conferência, resultado).

---

## 6. Testes automatizados (referência cruzada)

| Tipo | ID | Escopo passo 1 |
|------|-----|----------------|
| UNI | TST-UNI-SMTRD-NOVA-LEITURA-PASSO-UM-000146 | accept, card, formatos |
| FUN | TST-FUN-SMTRD-NOVA-LEITURA-PASSO-UM-000147 | fluxo anexar/remover |
| CRO | TST-CRO-SMTRD-NOVA-LEITURA-PASSO-UM-000148 | isolamento org |
| E2E | TST-E2E-SMTRD-NOVA-LEITURA-PASSO-UM-000149 | Playwright fluxo completo passo 1 |
| EMT | TST-EMT-SMTRD-NOVA-LEITURA-PASSO-UM-000150 | checklist §5 (prints) |
