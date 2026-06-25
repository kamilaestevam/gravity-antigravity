# Plano Teste em Tela — TST-EMT-SMTRD-NOVA-LEITURA-PASSO-UM-000150

**ID:** TST-EMT-SMTRD-NOVA-LEITURA-PASSO-UM-000150  
**Skill:** `skills/testes/teste-em-tela/SKILL.md`  
**Regras prints:** `documentos-tecnicos/testes/regras/08-regras-prints-em-tela.md`

> O modal Admin agrupa roteiro por `### ETAPA …`. **Não remover.**  
> Ícone câmera nos passos exige `Print \`arquivo.png\`` na coluna **APROVADO quando**.

**Objetivo geral:** validar visualmente o Passo 01 (Anexar arquivo) do wizard Nova Leitura — anexo, card, visualizar, excluir, cancelar e Enviar→passo 2, com evidência **como está / como ficou** em cada ação.

**Ambiente:** `http://localhost:8000/smart_read/insights` + Smart Read `:8033`  
**Runner:** `run-TST-EMT-SMTRD-NOVA-LEITURA-PASSO-UM-000150.ts`  
**Prints:** `../resultado-teste/<runId>/`

---

## Regra de sequência dos prints

> **Padrão obrigatório:** par `-selecao.png` (como está) + `-resultado.png` (como ficou), referenciados no roteiro como `Print \`…\``.  
> Runner emite `📸` + `✓ ETAPA …` após cada par — Admin pinta **verde**; `✗` ou `99-erro.png` → **vermelho**.

---

## Roteiro de execução

### ETAPA 1 — Abertura Insights (01)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **01** | Abrir `/smart_read/insights` | Tela carregada; botão Novo visível · Print `01-insights-selecao.png` · Print `01-insights-resultado.png` (sucesso ou erro) |

### ETAPA 2 — Modal passo 1 (02)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **02** | Novo → Nova Leitura | Modal aberto; passo «Anexar arquivo» ativo · Print `02-modal-selecao.png` · Print `02-modal-resultado.png` (sucesso ou erro) |

### ETAPA 3 — Anexar arquivos (03)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **03** | Upload 8 fixtures | Sidebar com arquivos anexados · Print `03-anexar-selecao.png` · Print `03-anexar-resultado.png` (sucesso ou erro) |

### ETAPA 4 — Oito tipos SSOT (04)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **04** | Conferir extensões | pdf, jpg, jpeg, png, xml, csv, xls, xlsx visíveis · Print `04-tipos-selecao.png` · Print `04-tipos-resultado.png` (sucesso ou erro) |

### ETAPA 5 — Card e nome (05)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **05** | Ler card | Nome `amostra.pdf` no card · Print `05-card-selecao.png` · Print `05-card-resultado.png` (sucesso ou erro) |

### ETAPA 6 — Visualizar (06)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **06** | Clicar ícone olho | UI sem erro após clique · Print `06-visualizar-selecao.png` · Print `06-visualizar-resultado.png` (sucesso ou erro) |

### ETAPA 7 — Preview nova aba (07)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **07** | Nova aba blob | Preview/download aberto · Print `07-preview-selecao.png` · Print `07-preview-resultado.png` (sucesso ou erro) |

### ETAPA 8 — Excluir (08)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **08** | Remover arquivo + confirmar | Card removido · Print `08-excluir-selecao.png` · Print `08-excluir-resultado.png` (sucesso ou erro) |

### ETAPA 9 — Cancelar (09)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **09** | Cancelar wizard | Modal fecha · Print `09-cancelar-selecao.png` · Print `09-cancelar-resultado.png` (sucesso ou erro) |

### ETAPA 10 — Enviar passo 2 (10)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **10** | Enviar (API mockada) | Passo 2 «Análise do arquivo» · Print `10-enviar-selecao.png` · Print `10-enviar-resultado.png` (sucesso ou erro) |

---

**Total:** 10 ETAPAs · 20 prints (10 pares selecao/resultado).

---

## Prints planejados

| # | Arquivo | Estado capturado |
|---|---------|------------------|
| 01 | `01-insights-selecao.png` | Insights antes de abrir Nova Leitura |
| 02 | `01-insights-resultado.png` | Insights com botão Novo visível |
| 03 | `02-modal-selecao.png` | Menu Novo aberto |
| 04 | `02-modal-resultado.png` | Modal passo 1 Anexar arquivo |
| 05 | `03-anexar-selecao.png` | Dropzone vazio (antes do upload) |
| 06 | `03-anexar-resultado.png` | Arquivos na sidebar após upload |
| 07 | `04-tipos-selecao.png` | Sidebar antes de conferir 8 tipos |
| 08 | `04-tipos-resultado.png` | Oito extensões visíveis na sidebar |
| 09 | `05-card-selecao.png` | Sidebar com cards recém-anexados |
| 10 | `05-card-resultado.png` | Card `amostra.pdf` com nome legível |
| 11 | `06-visualizar-selecao.png` | Antes de clicar Visualizar |
| 12 | `06-visualizar-resultado.png` | Após clique no ícone olho |
| 13 | `07-preview-selecao.png` | Tela principal com popup pendente |
| 14 | `07-preview-resultado.png` | Nova aba com blob URL |
| 15 | `08-excluir-selecao.png` | Modal Gravity «Excluir arquivo» |
| 16 | `08-excluir-resultado.png` | Card removido da sidebar |
| 17 | `09-cancelar-selecao.png` | Modal aberto antes de Cancelar |
| 18 | `09-cancelar-resultado.png` | Insights após fechar wizard |
| 19 | `10-enviar-selecao.png` | Passo 1 com arquivo e Enviar habilitado |
| 20 | `10-enviar-resultado.png` | Passo 2 Análise do arquivo |
