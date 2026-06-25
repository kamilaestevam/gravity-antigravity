---
name: antigravity-smart-read
description: "Smart Read (SMTRD) — wizard Nova Leitura, Lista, Insights, BFF legado DATI + Postgres Gravity."
---

# Gravity — Smart Read (SMTRD)

## O que é o Smart Read

Produto de extração inteligente de documentos de comércio exterior (invoices, BL, NF-e, planilhas).
O usuário envia arquivos no wizard **Nova Leitura**, a IA extrai campos estruturados e o resultado
alimenta Lista, Insights e conferência.

**Características-chave:**

- Multi-tenant por `id_organizacao` (Mand. 04)
- BFF Gravity (`8033`) + legado DATI (leituras reais) + Postgres Gravity (snapshot, progresso, painéis)
- Wizard 4 passos via `ModalPassoPassoGlobal`
- `id_produto_gravity`: `smart-read`

---

## Localização na arquitetura

```text
servicos-global/produto/smart-read/
├── client/src/
│   ├── components/
│   │   ├── nova-leitura-smart-read/     ← wizard Nova Leitura (4 passos)
│   │   ├── SmartReadListaPainelBar.tsx
│   │   └── SmartReadVisualizacaoTabs.tsx
│   ├── pages/
│   │   ├── insights-smart-read/
│   │   ├── lista-leitura-smart-read/
│   │   └── configuracoes-smart-read/
│   └── shared/
│       ├── entrada-arquivo-leitura-smart-read.ts   ← extensões accept (passo 1)
│       ├── api.ts
│       └── schemas.ts
└── server/src/
    ├── routes/leituras-smart-read.ts
    └── routes/progresso-leitura-smart-read.ts
```

---

## Docs técnicos (SSOT)

| Tela | Documento |
|------|-----------|
| **Passo 1 — Anexar** | [NOVA-LEITURA-PASSO-UM-TECNICO.md](../../../documentos-tecnicos/produtos-gravity/smart-read/NOVA-LEITURA-PASSO-UM-TECNICO.md) |
| **Passo 2 — Análise** | [NOVA-LEITURA-PASSO-DOIS-TECNICO.md](../../../documentos-tecnicos/produtos-gravity/smart-read/NOVA-LEITURA-PASSO-DOIS-TECNICO.md) |
| **Passo 3 — Conferência** | [NOVA-LEITURA-PASSO-TRES-TECNICO.md](../../../documentos-tecnicos/produtos-gravity/smart-read/NOVA-LEITURA-PASSO-TRES-TECNICO.md) |
| Lista + progresso | [LISTA-E-PROGRESSO-TECNICO.md](../../../documentos-tecnicos/produtos-gravity/smart-read/LISTA-E-PROGRESSO-TECNICO.md) |
| Persistência | [PERSISTENCIA-DADOS-TECNICO.md](../../../documentos-tecnicos/produtos-gravity/smart-read/PERSISTENCIA-DADOS-TECNICO.md) |
| Insights | [INSIGHTS-TECNICO.md](../../../documentos-tecnicos/produtos-gravity/smart-read/INSIGHTS-TECNICO.md) |
| Análise de riscos | [ANALISE-DE-RISCOS-TECNICO.md](../../../documentos-tecnicos/produtos-gravity/smart-read/ANALISE-DE-RISCOS-TECNICO.md) |
| Índice geral | [README.md](../../../documentos-tecnicos/produtos-gravity/smart-read/README.md) |

---

## Nova Leitura — Passo 1 (resumo operacional)

> Detalhe completo: [NOVA-LEITURA-PASSO-UM-TECNICO.md](../../../documentos-tecnicos/produtos-gravity/smart-read/NOVA-LEITURA-PASSO-UM-TECNICO.md)

| Aspecto | Regra |
|---------|-------|
| **Layout** | Stepper no container indigo (`.sr-wizard-stepper-painel-wrap`); corpo = dropzone + sidebar |
| **Formatos** | 8 extensões em `entrada-arquivo-leitura-smart-read.ts` |
| **Fixtures** | `testes/testes-unitarios/produto-gravity/smart-read/nova-leitura/passo-um/fixtures/amostras/` |
| **Botões passo 1** | Cancelar (fecha modal) · **Enviar** (avança para passo 2 — não confundir com «Continuar») |
| **Excluir** | `ModalConfirmarExcluirGlobal` — z-index acima do wizard |
| **Visualizar** | Blob URL em nova aba (`window.open`) |

### Checklist EMT passo 1 (11 itens)

1. Abertura da tela (Insights/Lista + botão Novo)
2. Modal passo 1 — stepper no container
3. Anexar arquivos (clique ou drag)
4. Todos os 8 tipos de arquivo aceitos (fixtures §4 do doc)
5. Card aparece na sidebar após anexar
6. Card exibe nome do arquivo
7. Ícone visualizar clicável
8. Visualizar abre arquivo em nova aba
9. Excluir com modal padrão Gravity e remoção efetiva
10. Cancelar fecha modal
11. **Enviar** avança para passo 2

Plano EMT: `TST-EMT-SMTRD-NOVA-LEITURA-PASSO-UM-000150`

---

## Nova Leitura — Passo 2 (resumo operacional)

> Detalhe completo: [NOVA-LEITURA-PASSO-DOIS-TECNICO.md](../../../documentos-tecnicos/produtos-gravity/smart-read/NOVA-LEITURA-PASSO-DOIS-TECNICO.md)

| Aspecto | Regra |
|---------|-------|
| **Layout** | Dashboard métricas (3 cards) + pipeline IA (3 análises + globo) + sidebar com cards/documentos |
| **Entrada** | **Enviar** no passo 1 ou retomar leitura `PROCESSING` |
| **Polling** | `GET /api/v1/smart-read/leituras/:id_leitura` até `COMPLETED` / `FAILED` |
| **Tempo** | Cronômetro congela em `tempo_analise_segundos` ao concluir; persistido no progresso |
| **Saving** | Recursos reduzidos + link **Base de cálculo →** (modal metodologia, z-index acima do wizard) |
| **Botões passo 2** | Cancelar · **Voltar** (passo 1) · **Continuar** (passo 3 — só após análise finalizada) |
| **Documentos** | Chips/lista expandível no card; visualizar por tipo abre nova aba |
| **SLA testes** | Pipeline client ~16s; EMT valida execução total ≤ 75s |

### Checklist EMT passo 2 (10 itens)

1. Passo 2 aberto (Análise do arquivo)
2. Nome da leitura no subtítulo (`Leitura NNN`)
3. Cards com documentos identificados
4. Visualizar documento nos cards (blob)
5. Tempo de leitura carregando/correto
6. Recursos reduzidos carregados/corretos
7. Tempo reduzido acumulado (Documentos + Saving)
8. Três análises concluídas («Completo»)
9. Globo/pipeline em 100%
10. Tempo total ≤ 75 segundos

Planos: `TST-UNI/FUN/CRO/E2E/EMT-SMTRD-NOVA-LEITURA-PASSO-DOIS-000151` … `000155` · Task `TASK-000343`

---

## Nova Leitura — Passo 3 (resumo operacional)

> Detalhe completo: [NOVA-LEITURA-PASSO-TRES-TECNICO.md](../../../documentos-tecnicos/produtos-gravity/smart-read/NOVA-LEITURA-PASSO-TRES-TECNICO.md)

| Aspecto | Regra |
|---------|-------|
| **Layout** | Grid `dt-*` (paridade Dados do Processo) + legenda filtros + seções colapsáveis |
| **Campo data** | Exibição **DD/MM/AAAA**; edição = input fino + ícone; calendário via **portal** (`CampoCalendarioGlobal` `modoUnico`); persistência **ISO `yyyy-mm-dd`** |
| **SSOT data** | `data-campo-conferencia-leitura-smart-read.ts` + `campo-linha-conferencia-nova-leitura-smart-read.tsx` |
| **Cores barra** | [padrao-dt-row-status-campos.md](../../../documentos-tecnicos/ux/design-system/padrao-dt-row-status-campos.md) |

---

## Visualizações

| Aba | Rota | Default |
|-----|------|---------|
| Insights | `/smart-read/insights` | **Sim** |
| Lista | `/smart-read/lista` | Não |
| Dashboard / Kanban | rotas existem | Ocultos do seletor (TASK-000306) |

Entrada canônica: `/smart-read` → `/smart-read/insights` (`ROTA_ENTRADA_SMART_READ`).

---

## Regras absolutas (referências SSOT)

> ⚠️ **Esta skill NÃO redefine regras absolutas. Apenas referencia.**

| Regra | Onde mora |
|-------|-----------|
| Schema intocável (`fragment.prisma`) | [Mand. 02](../../governanca/lei/9-mandamentos/SKILL.md) |
| Nomenclatura DDD | [ddd-nomenclatura](../../governanca/lei/ddd-nomenclatura/SKILL.md) |
| Isolamento de organização | [isolamento-organizacao](../../governanca/lei/isolamento-organizacao/SKILL.md) |
| Zod = contrato bilateral | [Mand. 06 + 09](../../governanca/lei/9-mandamentos/SKILL.md) |
| Sem mock preguiçoso / fallback silencioso | [Mand. 05 + 08](../../governanca/lei/9-mandamentos/SKILL.md) |
