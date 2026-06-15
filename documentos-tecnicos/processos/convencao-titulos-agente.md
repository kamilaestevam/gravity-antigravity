# Convenção de títulos de sessão de agente (AGT)

> **Paridade:** espelha a lógica de `documentos-tecnicos/testes/regras/01-convencao-ids.md` (TST).
> **Registry:** `documentos-tecnicos/processos/registro-agentes.json`
> **Comando:** `/novo-agente`

---

## Identificador sequencial (imutável)

```
AGT-{NNNNNN}
```

- 6 dígitos, sequência global única (baseline histórico: 263; registro automático a partir de 264).
- **Nunca** muda após alocação — igual à Regra 2 dos IDs de teste.

---

## Título canônico (obrigatório a partir de AGT-000264)

```
{TIPO_SESSAO}-{LOCAL}(-{AREA})?-{TIPO_ENTREGA}-{RESUMO}
```

| Parte | Obrigatório | Formato | Exemplo |
|:---|:---:|:---|:---|
| `TIPO_SESSAO` | Sim | 3 letras — tabela fechada abaixo | `ANA` |
| `LOCAL` | Sim | Sigla fechada — **mesma tabela de escopo TST** | `BIDFRT` |
| `AREA` | Não | Sub-local UI — kebab UPPER, 1 segmento | `LISTA`, `KANBAN` |
| `TIPO_ENTREGA` | Sim | 3 letras — tabela fechada abaixo | `BUG` |
| `RESUMO` | Sim | 2–6 segmentos kebab UPPER | `ERRO-ABERTURA-COTACAO` |

**Exemplos canônicos:**

```
ANA-BIDFRT-BUG-ERRO-ABERTURA-COTACAO
PLN-PEDIDO-LISTA-NOV-FILTRO-MULTI-WORKSPACE
IMP-CONFIG-MEL-ONBOARDING-TRIAL-HUB
RSP-LOGIN-DUV-REDIRECIONAMENTO-POS-AUTH
REV-PROCSO-AUD-PADRAO-UX-TELAS
```

**Regex (validação):**

```
^(ANA|PLN|IMP|RSP|REV|DOC|TST|OPS|GOV)-(LOGIN|CONFIG|ADMIN|HUB|CORE|MARKET|TENANT|DBASE|PEDIDO|NFIMP|LPCO|BIDFRT|BIDCAM|SIMCUS|FINCOM|PROCSO|MBOTO|GABI|DEVOPS)(-[A-Z0-9]+)?-(BUG|MEL|NOV|REF|AUD|CFG|DUV)-[A-Z0-9]+(-[A-Z0-9]+){1,5}$
```

---

## TIPO_SESSAO — intenção da conversa

| Código | Significado | Quando usar |
|:---|:---|:---|
| `ANA` | Análise | Diagnosticar, investigar causa, mapear estado atual — **sem entregar código** |
| `PLN` | Planejamento | Arquitetura, plano de implementação, tabela de diagnóstico, `/comando-inicial-padrao` fase 1–2 |
| `IMP` | Implementação | Código, fix, feature, refactor com entrega |
| `RSP` | Resposta | Dúvida pontual, esclarecimento rápido (`/resposta-curta`) |
| `REV` | Revisão | Code review, QA, auditoria de PR |
| `DOC` | Documentação | `documentos-tecnicos/`, skills, `/docs-skills` |
| `TST` | Testes | Planos, registry, execução (`/testes-criar`) |
| `OPS` | Operação | Deploy, migration, backup, infra |
| `GOV` | Governança | Regras, slash commands, processos, nomenclatura |

---

## LOCAL — escopo (lista fechada = TST)

Reutilizar **exatamente** as siglas de `01-convencao-ids.md`:

| Sigla | Módulo |
|:---|:---|
| `LOGIN` | Login global |
| `CONFIG` | Configurador (sem Admin) |
| `ADMIN` | Painel Admin interno |
| `HUB` | Shell pós-login |
| `CORE` | Núcleo Global |
| `MARKET` | Marketplace |
| `TENANT` | Serviços tenant |
| `DBASE` | Cadastros |
| `PEDIDO` | Produto Pedido |
| `NFIMP` | NF Importação |
| `LPCO` | LPCO |
| `BIDFRT` | BID Frete Internacional |
| `BIDCAM` | Bid Câmbio |
| `SIMCUS` | SimulaCusto |
| `FINCOM` | Financeiro Comex |
| `PROCSO` | Processo |
| `MBOTO` | Menu-botoes / seletor universal |
| `GABI` | Integração Gabi / ERP |
| `DEVOPS` | CI/CD, scripts, infra |

> **Não usar** `[BID-F]` ou hífen no título canônico — no código/ID é `BIDFRT`. Colchetes são só para **exibição humana** opcional.

---

## TIPO_ENTREGA — natureza do trabalho

| Código | Significado |
|:---|:---|
| `BUG` | Correção de defeito |
| `MEL` | Melhoria em comportamento existente |
| `NOV` | Funcionalidade nova |
| `REF` | Refactor sem mudança de comportamento |
| `AUD` | Auditoria forense (`/dream-team-detetive-tela`) |
| `CFG` | Configuração, setup, ajuste de ambiente |
| `DUV` | Esclarecimento — sem alteração de produto |

---

## AREA (opcional)

Incluir quando a sessão é **claramente** sobre uma sub-tela — mesmos valores EMT quando aplicável:

`LISTA`, `KANBAN`, `DASHBOARD`, `INSIGHTS`, `CONFIGURACOES`, `MODAL`, `API`, `ONBOARDING`, `BILLING`, `PERMISSOES`

Omitir se a sessão for transversal ao produto (ex.: análise de auth que afeta todo o BID-FRETE).

---

## Título de exibição (opcional, UI)

Formato legível para lista de conversas do Cursor — **não substitui** o canônico no registry:

```
{TIPO_SESSAO} [{LOCAL legível}] {TIPO_ENTREGA} — {Resumo humano curto}
```

Exemplo:

```
ANA [BID Frete] BUG — Erro abertura cotação
```

---

## Citação entre conversas

**Canônica (commits, docs, registry):**

```
AGT-000264 | ANA-BIDFRT-BUG-ERRO-ABERTURA-COTACAO
```

**Markdown (chat):**

```
[ANA BID-FRETE bug cotação](AGT-000264)
```

**Subagente (não consome número):**

```
AGT-000264 › subagente Explore
```

---

## Entrada no `/novo-agente`

Formas aceitas na mesma mensagem:

```
/novo-agente ANA BIDFRT BUG ERRO-ABERTURA-COTACAO
/novo-agente ANA BIDFRT LISTA BUG ERRO-ABERTURA-COTACAO
/novo-agente PLN PEDIDO NOV FILTRO-MULTI-WORKSPACE
```

O agente monta o título canônico, valida contra o regex e grava campos estruturados no registry.

---

## Paridade TST ↔ AGT

| Conceito | Testes (TST) | Agentes (AGT) |
|:---|:---|:---|
| Prefixo fixo | `TST` | `AGT` |
| Sequencial global | `{NNNNNN}` | `{NNNNNN}` |
| Local | `{ESCOPO}` / `{LOCAL}` | `{LOCAL}` — mesma tabela |
| Área UI | `{AREA}` (EMT) | `{AREA}` (opcional) |
| Resumo | `{RESUMO}` kebab | `{RESUMO}` kebab |
| Tipo extra | `UNI`, `FUN`, `E2E`… | `TIPO_SESSAO` + `TIPO_ENTREGA` |

Quando uma sessão `IMP` gera testes, referenciar cruzado:

```
AGT-000270 | IMP-BIDFRT-BUG-ERRO-ABERTURA-COTACAO → TST-FUN-BIDFRT-000088
```
