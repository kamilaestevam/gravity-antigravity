# Handoff — Financeiro Comex

## Data: 2026-03-31
## De: Dream Team de Produtos
## Para: Dream Team de Tecnologia
## Status: ✅ Checkpoint 3 aprovado — Pronto para implementação

---

## Índice de Artefatos

| # | Artefato | Status |
|:---|:---|:---|
| 1 | PRD (v1.0 final) | ✅ PRD.md |
| 2 | Arquitetura técnica | ✅ ARQUITETURA.md |
| 3 | Regras de negócio operacionalizadas | ✅ Este documento |
| 4 | Casos de uso completos | ✅ Este documento |
| 5 | Critérios de aceite em Gherkin | ✅ Este documento |
| 6 | Especificação de telas | ✅ Este documento |
| 7 | Backlog priorizado | ✅ Este documento |
| 8 | Catálogo de categorias padrão | ✅ Este documento |

---

## Contexto para o Time de Tecnologia

### O que é o Financeiro Comex?

Módulo de gestão financeira de processos de importação e exportação. É vinculado a um **processo** (um por processo) e consolida todos os custos: impostos federais (importados do Portal Único/XML), taxas operacionais (lançadas manualmente ou via Smart Read/email) e numerário (adiantamentos ao despachante).

### Regras de negócio críticas (top 5)

1. **Cada lançamento tem sua própria taxa de câmbio** — o Valor R$ é calculado na hora do lançamento (valor × taxa), não convertido depois. Uma vez salvo, o valor BRL é imutável.
2. **Saldo = Custos Totais (BRL) − Numerário Total** — Saldo negativo = empresa ainda deve; é o estado normal durante o processo.
3. **O ICMS pode vir do Portal Único** (flag `icms_origem_portal`) para estados integrados. Para os demais, entrada manual. **Sempre permitir override manual.**
4. **Exportação não tem Grupo 1** (impostos federais) — apenas custos operacionais. O catálogo de categorias é filtrado por `tipo_operacao`.
5. **Numerário é isolável** — foi projetado para virar produto independente. Não misturar lógica de negócio do Numerário com a Movimentação.

### O que NÃO está no MVP

- Email automático de faturas (Fase 2)
- Dashboard multi-processo consolidado (Fase 2)
- Alertas de vencimento por notificação (Fase 2)
- Integração com ERP (Fase 3)
- Numerário como produto isolado (Fase 3)

---

## Especificação de Telas

### Tela 1 — Movimentação (Lista Principal)

**Rota:** `/financeiro-comex` (embedded no Processo) ou `/financeiro-comex/:processoId` (standalone)
**Caso de Uso:** UC-001

#### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ [Sidebar Gravity]  │  Financeiro                                 │
│                    │  [Tab: Movimentação] [Tab: Numerário] [Tab: Rateio] │
│                    │                                             │
│                    │  [Badge: Total aberto BRL] [Badge: USD] [Badge: EUR] │
│                    │                                             │
│                    │  [Card: Saldo] [Adiantado] [Pagos] [Agendados] [Pendente] │
│                    │                                             │
│                    │              [Histórico de Alterações] [+ Novo] [↓ Importar] │
│                    │                                             │
│                    │  ┌──────────────────────────────────────┐  │
│                    │  │ DATA │ DESCRIÇÃO │ COND.PGT │ FORNECEDOR │ MOEDA │ TAXA │ VALOR │ VALOR R$ │ DT.PGT │ DT.VENC │ STATUS │ 🗑 │
│                    │  │ ... linha 1 ...                       │  │
│                    │  │ ... linha 2 (highlighted) ...         │  │
│                    │  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

#### Especificação Visual

| Elemento | Componente | Especificação |
|:---|:---|:---|
| Tabs | Tabs underline | Movimentação, Numerário, Rateio |
| Badges "Total aberto" | `BadgeStatus` pill | BRL/USD/EUR/outros — cor `--bg-elevated` + `--text-secondary` |
| Cards KPI | div `--bg-base` border `--bg-elevated` | Saldo (vermelho se negativo), Adiantado, Pagos, Agendados, Pendente |
| Botão "+ Novo" | `BotaoGlobal` primary | accent, `Plus` icon 16px |
| Botão "Importar" | `BotaoGlobal` secondary | dropdown com 4 opções |
| Tabela | `TabelaGlobal` | Colunas abaixo |
| Linha destacada | background `--accent` 10% opacity | Lançamento mais recente ou selecionado |
| Botão excluir | `BotaoGlobal` ghost | `Trash2` icon, cor `--danger`, apenas no hover |

#### Colunas da TabelaGlobal

| Coluna | Largura | Sortable | Notas |
|:---|:---|:---|:---|
| Data | 120px | Sim | Formato `DD/MM/YYYY HH:mm` |
| Descrição | 200px | Sim | `codigo - nome` da categoria |
| Cond. Pagto. | 140px | Não | Descrição da condição |
| Fornecedor | 180px | Sim | Nome + tipo entre parênteses |
| Moeda | 70px | Sim | Pill `BadgeStatus` por moeda |
| Taxa | 90px | Não | 7 casas decimais |
| Valor | 110px | Sim | Na moeda original |
| Valor R$ | 110px | Sim | Convertido, negrito |
| Data Pagamento | 110px | Sim | Vazio se não informado |
| Data Vencimento | 110px | Sim | Vermelho se vencida |
| Status | 100px | Sim | `BadgeStatus` (Pago/Pendente/Agendado) |
| Ações | 40px | Não | `Trash2` ghost |

#### Estados da Tela

| Estado | Comportamento |
|:---|:---|
| **Empty** | Ilustração + "Nenhum lançamento. Adicione o primeiro custo do processo." + botão "+ Novo" |
| **Loading** | Skeleton dos cards KPI + 5 linhas skeleton na tabela |
| **Error** | "Erro ao carregar lançamentos" + botão "Tentar novamente" |
| **Filled** | Cards + tabela com dados |
| **Exportação** | Coluna "Impostos" não aparece; catálogo filtrado |

---

### Modal 1A — Novo Lançamento

**Trigger:** Botão "+ Novo"
**Componente:** `ModalGlobal`

#### Campos

| Campo | Tipo | Obrigatório | Comportamento |
|:---|:---|:---|:---|
| Descrição | `CaixaSelectGlobal` (busca) | Sim | Lista do catálogo de categorias; busca por código e nome |
| Moeda | `CaixaSelectGlobal` | Sim | BRL, USD, EUR, GBP, CHF, CNY, ARS, UYU |
| Taxa | `InputTexto` number | Sim | 7 casas decimais; default 1.0000000 para BRL |
| Valor | `InputTexto` number | Sim | 4 casas decimais; Valor R$ calculado automaticamente |
| Fornecedor | `CaixaSelectGlobal` (busca) | Não | Lista do Processo (Remetente, Transportadora, etc.) |
| Condição de Pagamento | `CaixaSelectGlobal` | Não | Lista de condições cadastradas |
| Data de Pagamento | date picker | Não | |
| Data de Vencimento | date picker | Não | |
| Observação | `InputTexto` textarea | Não | Max 500 chars |
| Status do Pagamento | `CaixaSelectGlobal` | Sim | Pendente (default), Agendado, Pago |
| Tipo de Documento | `CaixaSelectGlobal` | Não | Boleto, Nota Fiscal, Demonstrativo, Fatura, Faturamento, Outro |
| Número do Documento | `InputTexto` | Não | Número da NF, boleto, etc. |
| Despesa Aduaneira | toggle | Não | Default: false |
| Despesa NF | toggle | Não | Default: false |
| Apresentar no Espelho de NF | toggle | Não | Default: true |

#### Valor R$ calculado

```
Valor R$ = Valor × Taxa (display apenas, calculado em tempo real)
Exibido abaixo do campo Taxa como "= R$ X.XXX,XX"
```

#### Validações

| Campo | Regra | Mensagem |
|:---|:---|:---|
| Descrição | Obrigatório | "Selecione uma categoria" |
| Moeda | Obrigatório | "Selecione a moeda" |
| Taxa | > 0 | "Taxa deve ser maior que zero" |
| Valor | > 0 | "Valor deve ser maior que zero" |

---

### Modal 1B — Importar (Multi-canal)

**Trigger:** Botão "Importar" → dropdown

**4 sub-opções:**

1. **XML (DUIMP)** — Upload de arquivo .xml; preview dos impostos encontrados → confirmar
2. **Portal Único** — Campo para número da DUIMP → busca → preview → confirmar
3. **Smart Read** — Upload de PDF/imagem de fatura → OCR → preview campos → ajustar → confirmar
4. **Planilha** — Download de template + upload preenchido → preview → confirmar

**Preview (comum a todos):**
- Tabela com lançamentos a serem criados
- Usuário pode marcar/desmarcar quais importar
- Botão "Confirmar" cria todos os selecionados

---

### Tela 2 — Numerário

**Rota:** `/financeiro-comex/numerario` (tab)

#### Layout

```
┌──────────────────────────────────────────────┐
│ [Tabs: Movimentação | Numerário | Rateio]    │
│                                              │
│  Total: R$ 15.492,24        [Histórico] [+ Numerário Complementar] │
│                                              │
│  [NP] Numerário Principal    03/04/2025   15.492,24   [...]  │
│  [NC] Numerário Complementar 1 ...        X.XXX,XX   [...]  │
└──────────────────────────────────────────────┘
```

| Elemento | Comportamento |
|:---|:---|
| Total | Soma de todos os numerários; cor `--success` |
| Avatar NP/NC | Pill com iniciais — NP verde, NC accent |
| Row click | Expandir despesas + link para exibir PDF |
| `[...]` | Menu: Editar, Excluir, Exibir Anexo |

#### Modal 2A — Inserir Numerário

| Campo | Tipo | Obrigatório |
|:---|:---|:---|
| Descrição do Numerário | `InputTexto` | Sim |
| Data | date picker | Sim |
| Despesas (lista dinâmica) | Descrição, Valor, Moeda, Taxa | 0 ou mais |
| [+ botão] | Adicionar linha de despesa | — |

#### Modal 2B — Exibir Anexo

- PDF viewer integrado (iframe ou react-pdf)
- Exibir documento de prestação de contas do despachante
- Botão download

---

### Tela 3 — Rateio

**Rota:** `/financeiro-comex/rateio` (tab)

#### Layout

```
┌──────────────────────────────────────┐
│ [Tabs: Movimentação | Numerário | Rateio] │
│                          [Gerar Novo] │
│                                      │
│ [xlsx icon] Rateio    09/01/2026 15:31 │ (clicável → download)
│ [xlsx icon] Rateio    15/12/2025 09:44 │
└──────────────────────────────────────┘
```

| Estado | Comportamento |
|:---|:---|
| Empty | "Nenhum rateio gerado ainda" + botão "Gerar Novo" |
| Loading (geração) | Spinner + "Gerando planilha de rateio..." |
| Filled | Lista de arquivos com data/hora; clique → download |

---

## Casos de Uso

### UC-001: Lançar Custo Manual de Processo

**Ator:** Analista de Importação
**Pré-condições:** Processo existente; usuário com permissão `financeiro:write`

| Passo | Ator | Ação | Sistema |
|:---|:---|:---|:---|
| 1 | Usuário | Acessa aba Movimentação do processo | Exibe lista de lançamentos + KPIs |
| 2 | Usuário | Clica "+ Novo" | Abre ModalGlobal "Novo Lançamento" |
| 3 | Usuário | Seleciona categoria (ex: "3 - Frete Internacional") | Preenche grupo_custo automaticamente |
| 4 | Usuário | Seleciona moeda USD, informa taxa 5.6923, valor 100 | Exibe "= R$ 569,23" em tempo real |
| 5 | Usuário | Seleciona fornecedor SCHENKER | — |
| 6 | Usuário | Informa data de pagamento, status "Pago" | — |
| 7 | Usuário | Clica "Salvar" | Valida Zod → persiste → atualiza KPIs → toast "Lançamento criado" |
| 8 | Sistema | — | Fecha modal; lançamento aparece no topo da lista |

**FA-1:** Usuário cancela o modal → nada é persistido

**FE-1:** Erro de validação → campos destacados em vermelho com mensagem específica

---

### UC-002: Importar Impostos via Portal Único

| Passo | Ator | Ação | Sistema |
|:---|:---|:---|:---|
| 1 | Usuário | Clica "Importar" → "Portal Único" | Abre modal de importação |
| 2 | Usuário | Informa número da DUIMP | — |
| 3 | Usuário | Clica "Buscar" | Conecta Portal Único → retorna impostos |
| 4 | Sistema | — | Exibe preview: II, IPI, PIS, COFINS, ICMS, AFRMM com valores |
| 5 | Usuário | Confirma seleção | Sistema cria N lançamentos (um por imposto) |
| 6 | Sistema | — | Toast "X lançamentos importados" |
| 7 | Sistema | — | KPIs atualizados |

**FE-1:** DUIMP não encontrada → "DUIMP não localizada no Portal Único. Verifique o número ou use importação via XML."

**FE-2:** Portal Único indisponível → "Portal Único temporariamente indisponível. Tente via XML."

---

### UC-003: Gerar Rateio

| Passo | Ator | Ação | Sistema |
|:---|:---|:---|:---|
| 1 | Usuário | Acessa aba Rateio | Lista arquivos já gerados |
| 2 | Usuário | Clica "Gerar Novo" | Loading + "Gerando..." |
| 3 | Sistema | — | Busca lançamentos + itens do processo |
| 4 | Sistema | — | Aplica rateioEngine (método CIF por padrão) |
| 5 | Sistema | — | Gera Excel no formato custos_processo |
| 6 | Sistema | — | Salva no storage; registra em FinanceiroRateio |
| 7 | Sistema | — | Arquivo aparece na lista; toast "Rateio gerado" |
| 8 | Usuário | Clica no arquivo | Download do Excel |

**FE-1:** Processo sem itens → "O processo não possui itens para ratear. Verifique a DUIMP vinculada."

---

## Critérios de Aceite (Gherkin)

### CA-001: Criar lançamento manual com sucesso

```gherkin
Dado que o usuário está na aba Movimentação do processo "DATI-2875/25"
  E o usuário tem permissão "financeiro:write"
Quando clica em "+ Novo"
  E seleciona a categoria "3 - Frete Internacional"
  E seleciona moeda "USD"
  E informa taxa "5.6923000"
  E informa valor "100"
  E seleciona fornecedor "SCHENKER DO BRASIL"
  E clica em "Salvar"
Então o lançamento é criado com valor_brl = 569.23
  E aparece na lista com status "Pendente"
  E o KPI "Pendente" aumenta em R$ 569,23
  E o toast "Lançamento criado com sucesso" é exibido
```

### CA-002: Validação de campos obrigatórios

```gherkin
Dado que o modal "Novo Lançamento" está aberto
Quando o usuário clica em "Salvar" sem preencher a categoria
Então o campo "Descrição" é destacado em vermelho
  E exibe a mensagem "Selecione uma categoria"
  E o formulário NÃO é enviado
```

### CA-003: Cálculo automático do Valor R$

```gherkin
Dado que o modal "Novo Lançamento" está aberto
Quando o usuário informa moeda "EUR", taxa "6.1864", valor "3929"
Então o campo "Valor R$" exibe automaticamente "R$ 24.306,37"
  E a conversão é feita em tempo real sem precisar salvar
```

### CA-004: Importação Portal Único — sucesso

```gherkin
Dado que o modal "Importar via Portal Único" está aberto
Quando o usuário informa a DUIMP "2515896315"
  E clica em "Buscar"
Então o sistema exibe preview com os impostos: II, IPI, PIS, COFINS, ICMS
  E cada imposto mostra: descrição, moeda, taxa, valor, valor BRL
  E o usuário pode desmarcar itens individualmente
Quando confirma a importação
Então os lançamentos selecionados são criados
  E todos têm canal_entrada = "PORTAL_UNICO"
  E o ICMS tem a flag "icms_origem_portal = true" quando disponível
```

### CA-005: Tenant isolation — lançamentos

```gherkin
Dado que existem lançamentos do tenant "Empresa A" e do tenant "Empresa B"
Quando o usuário do tenant "Empresa A" acessa a Movimentação
Então apenas lançamentos do tenant "Empresa A" são exibidos
  E nenhum dado do tenant "Empresa B" é acessível via API
  E a query sempre inclui filtro WHERE tenant_id = 'empresa_a'
```

### CA-006: Saldo calculado corretamente

```gherkin
Dado que o processo tem lançamentos totalizando R$ 50.000,00
  E tem numerário principal de R$ 15.492,24
Quando o usuário visualiza os KPIs da Movimentação
Então o card "Saldo" exibe "R$ -34.507,76"
  E o valor é exibido em vermelho (saldo negativo)
```

### CA-007: Exportação sem impostos federais

```gherkin
Dado que o processo é do tipo "EXPORTACAO"
Quando o usuário abre o modal "Novo Lançamento"
Então a lista de categorias NÃO inclui: "Imposto de Importação", "IPI", "PIS", "COFINS", "ICMS", "AFRMM"
  E a opção "Importar via Portal Único" NÃO está disponível
  E apenas categorias com tipo_operacao = EXPORTACAO ou NULL são exibidas
```

### CA-008: Geração do rateio Excel

```gherkin
Dado que o processo tem 3 itens importados e 5 lançamentos financeiros
Quando o usuário clica "Gerar Novo" na aba Rateio
Então o sistema gera um arquivo .xlsx
  E o arquivo tem o mesmo formato da planilha custos_processo
  E inclui: cabeçalho do processo, tabela de itens, colunas de impostos e despesas rateadas
  E o arquivo fica disponível para download com data/hora de geração
```

### CA-009: Numerário principal único

```gherkin
Dado que o processo já tem um "Numerário Principal"
Quando o usuário tenta criar outro "Numerário Principal"
Então o sistema exibe erro "Este processo já possui um Numerário Principal"
  E sugere criar um "Numerário Complementar"
```

### CA-010: Performance — listagem

```gherkin
Dado que o processo tem 200 lançamentos
Quando o usuário acessa a aba Movimentação
Então a lista carrega em menos de 200ms
  E a paginação é server-side
  E os KPIs são calculados no servidor, não no cliente
```

---

## Backlog Priorizado (MVP)

| # | Story | RICE | Complexidade | Depende de |
|:---|:---|:---|:---|:---|
| 1 | Scaffold do produto (setup, health, middleware, config) | — | M | — |
| 2 | Fragment.prisma + migration | — | M | #1 |
| 3 | CRUD de categorias (Config) | Alto | P | #2 |
| 4 | CRUD de condições de pagamento (Config) | Alto | P | #2 |
| 5 | Criar lançamento manual (RF-001, RF-002) | Alto | M | #3, #4 |
| 6 | Listagem de lançamentos + KPIs (RF-001) | Alto | M | #5 |
| 7 | Editar e excluir lançamento (RF-003, RF-004) | Alto | P | #5 |
| 8 | Importar via XML DUIMP (RF-005) | Alto | G | #5 |
| 9 | Importar via Portal Único (RF-006) | Alto | M | #5 |
| 10 | Criar/listar Numerário (RF-020 a RF-024) | Alto | M | #2 |
| 11 | Gerar planilha de Rateio (RF-030 a RF-033) | Alto | G | #5 |
| 12 | Importar via Smart Read (RF-007) | Médio | G | #5 |
| 13 | Importar via Planilha (RF-008) | Médio | M | #5 |
| 14 | Histórico de alterações (RF-012) | Alto | P | #5 |
| 15 | Filtros e exportação Excel (RF-013, RF-014) | Médio | P | #6 |
| 16 | Suporte tipo_operacao EXPORTACAO (RF-040–042) | Alto | P | #3 |

**Stories independentes que podem começar em paralelo:** #1, #3

**Caminho crítico:** #1 → #2 → #5 → #6 → #8, #9, #10, #11

---

## Catálogo de Categorias Padrão

O seed deve criar as seguintes categorias padrão para toda nova empresa.
Fonte: planilha oficial de taxas e custos fornecida pelo dono do produto (2026-03-31).

> **Nota para o dev:** O catálogo é customizável por tenant. O seed cria os itens abaixo como ponto de partida. Cada empresa pode adicionar, editar e desativar categorias pelo painel de Config.

### Grupo 1 — Impostos Federais (apenas IMPORTACAO)

| Código | Nome | Grupo | Notas |
|:---|:---|:---|:---|
| 001 | Imposto: I.I - Imposto de Importação | IMPOSTOS_FEDERAIS | Importado da DUIMP |
| 002 | Imposto: IPI | IMPOSTOS_FEDERAIS | Importado da DUIMP |
| 003 | Imposto: PIS | IMPOSTOS_FEDERAIS | Importado da DUIMP |
| 004 | Imposto: COFINS | IMPOSTOS_FEDERAIS | Importado da DUIMP |
| 005 | Imposto: ICMS | IMPOSTOS_FEDERAIS | Importado da DUIMP (estados integrados) |
| 006 | Apuração de IPI | IMPOSTOS_FEDERAIS | Lançamento contábil de apuração |
| 007 | Apuração de PIS | IMPOSTOS_FEDERAIS | Lançamento contábil de apuração |
| 008 | Apuracao de Cofins | IMPOSTOS_FEDERAIS | Lançamento contábil de apuração |
| 009 | Apuração de ICMS | IMPOSTOS_FEDERAIS | Lançamento contábil de apuração |
| 010 | Marinha Mercante (AFRMM) | IMPOSTOS_FEDERAIS | 25% sobre frete marítimo em BRL |
| 011 | Taxa Siscomex | IMPOSTOS_FEDERAIS | Valor fixo por DI + por adição |

### Grupo 2 — Custos Operacionais (ambas as operações, salvo indicado)

#### Custos de Valor Aduaneiro

| Código | Nome | Notas |
|:---|:---|:---|
| 100 | Ad valorem | Tarifa percentual sobre valor da mercadoria |
| 101 | Ad valorem - Transporte rodoviário | Ad valorem específico para modal rodoviário |
| 102 | Ad valorem - DTA | Ad valorem na Declaração de Trânsito Aduaneiro |

#### Armazenagem

| Código | Nome | Fornecedor Típico |
|:---|:---|:---|
| 200 | Armazenagem | Armazem / Armazem alfandegado |
| 201 | Armazenagem na zona primária | Armazem alfandegado (porto/aeroporto) |
| 202 | Armazenagem na zona secundária | Armazem (EADI, CLIA) |
| 203 | Armazenagem - DTA | Armazem (durante trânsito aduaneiro) |
| 204 | Armazenagem Infraero | Cia aérea / Infraero |

#### Frete e Transporte

| Código | Nome | Modal |
|:---|:---|:---|
| 300 | Frete Internacional | Agente de carga / Armador / Cia aérea |
| 301 | Frete Rodoviário | Transportadora rodoviária |
| 302 | Frete Aéreo Interno | Cia aérea |
| 303 | BAF (Bunker Adjustment Factor) | Armador — sobretaxa de combustível marítimo |
| 304 | Bunker | Armador — combustível |

#### Taxas Portuárias e Aeroportuárias

| Código | Nome | Notas |
|:---|:---|:---|
| 400 | THC (Terminal Handling Charge) | Taxa de movimentação no terminal |
| 401 | Liberação de HAWB / HBL | Agente de carga |
| 402 | Desconsolidação | Terminal / Agente de carga |
| 403 | Collect Fee | Armador |
| 404 | Gate-in / Gate-out | Terminal |

#### Container

| Código | Nome |
|:---|:---|
| 500 | Carregamento de container |
| 501 | Carregamento de container cheio |
| 502 | Carregamento de container vazio |
| 503 | Fumigação de container |
| 504 | Conserto de container |
| 505 | Lavagem de container |
| 506 | Levante container |
| 507 | Devolução de container no porto |
| 508 | Lacre |
| 509 | Chapas |
| 510 | Material para carregamento de container |
| 511 | Material para descarregamento de container |
| 512 | Empilhadeira |

#### Serviços e Taxas Diversas

| Código | Nome |
|:---|:---|
| 600 | Taxa Administrativa |
| 601 | Despacho Aduaneiro |
| 602 | Pesagem |
| 603 | Capatazia |
| 604 | Auditoria |
| 605 | Seguro Internacional |
| 606 | Atestado |
| 607 | Atestado Fiesc |
| 608 | Atestado Fiesc - Imobilizado |
| 609 | Certificado |
| 610 | Certificado de origem |

#### Câmbio

| Código | Nome | Notas |
|:---|:---|:---|
| 700 | Câmbio | Operação de câmbio (compra de moeda) |
| 701 | Parcela do câmbio | Pagamento parcelado de câmbio |
| 702 | Taxas do CE (Collect) | Taxas cobradas no CE |

#### Exportação (apenas EXPORTACAO)

| Código | Nome |
|:---|:---|
| 800 | Frete de Exportação |
| 801 | Seguro de Exportação |
| 802 | Despesa Bancária (Exportação) |

---

## Tipos de Documento (campo adicional por lançamento)

Revelado pela planilha de taxas — cada lançamento pode ter um **tipo de documento** associado:

| Valor | Descrição |
|:---|:---|
| `BOLETO` | Boleto bancário |
| `NOTA_FISCAL` | Nota fiscal do fornecedor |
| `DEMONSTRATIVO` | Demonstrativo de custos |
| `FATURA` | Fatura do fornecedor (invoice) |
| `FATURAMENTO` | Documento de faturamento |
| `OUTRO` | Outro tipo de documento |

> **Impacto no modelo:** Campo `tipo_documento` + `numero_documento` adicionados ao `FinanceiroLancamento` — ver ARQUITETURA.md.

> **Impacto no Modal Novo Lançamento:** Adicionar campos "Tipo de Documento" (`CaixaSelectGlobal`) e "Número do Documento" (`InputTexto`) abaixo das datas.

---

## Tipos de Fornecedor (enum oficial)

Lista oficial da planilha — expandida do que estava nas imagens de referência:

| Valor | Exibição |
|:---|:---|
| `AGENTE_DE_CARGA` | Agente de carga |
| `ARMADOR` | Armador |
| `CIA_AEREA` | Cia aérea |
| `ARMAZEM_ALFANDEGADO` | Armazem alfandegado |
| `ARMAZEM` | Armazem |
| `TRANSPORTADORA_RODOVIARIA` | Transportadora rodoviária |
| `SEGURADORA` | Seguradora |
| `CORRETORA_DE_CAMBIO` | Corretora de cambio |
| `EXPORTADOR` | Exportador |
| `FABRICANTE` | Fabricante |
| `TRADING` | Trading |
| `DESPACHANTE` | Despachante aduaneiro |
| `RECEITA_FEDERAL` | Receita Federal (impostos) |
| `OUTRO` | Outro |

> O campo `tipo_fornecedor` no `FinanceiroLancamento` usa este enum. No modal, o select de fornecedor exibe o tipo entre parênteses: "SCHENKER DO BRASIL (Agente de carga)".

---

## Contatos e Suporte

| Assunto | Quem Procurar |
|:---|:---|
| Regras de negócio e legislação | SME do Dream Team |
| Integração Portal Único / XML DUIMP | Tech Lead + NF Importação |
| Rateio Engine | NF Importação (reutilização) |
| Design e UX | Designer do Dream Team |
| Critérios de aceite | Business Analyst |
| Escopo e prioridade | PM |

---

## Checklist Final — Handoff Completo

### Documentos
- [x] PRD (v1.0) — 13 seções preenchidas, sem TBDs
- [x] Arquitetura técnica definida
- [x] Regras de negócio operacionalizadas (10 RNs)
- [x] Casos de uso com fluxos completos (UC-001 a UC-003)
- [x] Critérios de aceite em Gherkin (CA-001 a CA-010)

### Design
- [x] Mapa de telas completo (5 telas + 5 modais)
- [x] Especificação de layout por tela
- [x] Componentes do nucleo-global identificados
- [x] Todos os estados documentados (empty, loading, error, filled)
- [x] Responsividade definida

### Técnico
- [x] Fragment.prisma com 6 modelos completos
- [x] Todos os endpoints definidos
- [x] PRODUCT_CONFIG definido (porta 8029/5184)
- [x] Mapa de reutilização vs criação do zero
- [x] Checklist de segurança
- [x] Estimativa: 6-8 semanas

### Gestão
- [x] Backlog priorizado com dependências
- [x] Caminho crítico identificado
- [x] Fases definidas (MVP → 2 → 3)
- [x] Riscos documentados com mitigação
- [x] Decisões registradas (D-001 a D-006)

### Aprovações
- [x] Checkpoint 1 — Problema validado (briefing dono do produto)
- [x] Checkpoint 2 — Solução viável (referência DATI + planilha)
- [x] Checkpoint 3 — Handoff aprovado

---

## Origem dos Dados do Catálogo

O catálogo de categorias, tipos de documento e tipos de fornecedor foram extraídos da **planilha oficial de taxas e custos** fornecida pelo dono do produto em 2026-03-31. Esta é a fonte de verdade para o seed inicial do banco de dados.
