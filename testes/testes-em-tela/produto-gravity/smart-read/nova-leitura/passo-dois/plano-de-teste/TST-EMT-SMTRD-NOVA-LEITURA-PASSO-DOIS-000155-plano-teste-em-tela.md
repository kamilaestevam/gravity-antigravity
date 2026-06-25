# Plano Teste em Tela — TST-EMT-SMTRD-NOVA-LEITURA-PASSO-DOIS-000155

**ID:** TST-EMT-SMTRD-NOVA-LEITURA-PASSO-DOIS-000155  
**Skill:** `skills/testes/teste-em-tela/SKILL.md`  
**Regras prints:** `documentos-tecnicos/testes/regras/08-regras-prints-em-tela.md`

**Objetivo geral:** validar visualmente o Passo 02 (Análise do arquivo) — abertura, nome da leitura, cards/documentos, visualizar, métricas, três análises, globo 100% e SLA ≤ 75s.

**Ambiente:** `http://localhost:8000/smart_read/insights`  
**Runner:** `run-TST-EMT-SMTRD-NOVA-LEITURA-PASSO-DOIS-000155.ts`  
**Prints:** `../resultado-teste/<runId>/`

---

## Roteiro de execução

### ETAPA 1 — Passo 2 aberto (01)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **01** | Enviar arquivo e aguardar passo 2 | Stepper «Análise do arquivo» ativo · Print `01-passo2-selecao.png` · Print `01-passo2-resultado.png` |

### ETAPA 2 — Nome da leitura (02)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **02** | Conferir subtítulo do modal | Padrão `Leitura NNN` visível · Print `02-nome-selecao.png` · Print `02-nome-resultado.png` |

### ETAPA 3 — Cards com documentos (03)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **03** | Sidebar com cards | Chips Bill of Lading / Commercial Invoice · Print `03-cards-selecao.png` · Print `03-cards-resultado.png` |

### ETAPA 4 — Visualizar documentos (04)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **04** | Expandir e clicar olho | Nova aba blob aberta · Print `04-visualizar-selecao.png` · Print `04-visualizar-resultado.png` |

### ETAPA 5 — Tempo de leitura (05)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **05** | Card Tempo de leitura | Timer HH : MM : SS visível · Print `05-timer-selecao.png` · Print `05-timer-resultado.png` |

### ETAPA 6 — Recursos reduzidos (06)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **06** | Card Recursos reduzidos | Valor numérico exibido · Print `06-recursos-selecao.png` · Print `06-recursos-resultado.png` |

### ETAPA 7 — Tempo acumulado (07)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **07** | Card Tempo reduzido acumulado | Documentos + Saving visíveis · Print `07-acumulado-selecao.png` · Print `07-acumulado-resultado.png` |

### ETAPA 8 — Três análises (08)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **08** | Pipeline Primeira/Segunda/Terceira | Três pills «Completo» · Print `08-analises-selecao.png` · Print `08-analises-resultado.png` |

### ETAPA 9 — Globo 100% (09)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **09** | Anel do globo | Três barras em 100% · Print `09-globo-selecao.png` · Print `09-globo-resultado.png` |

### ETAPA 10 — SLA 75 segundos (10)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **10** | Medir tempo total | Conclusão em ≤ 75s · Print `10-sla-selecao.png` · Print `10-sla-resultado.png` |

**Total:** 10 ETAPAs · 20 prints.
