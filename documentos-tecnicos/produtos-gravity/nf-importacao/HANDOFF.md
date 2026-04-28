# HANDOFF — NF Importacao (Nota Fiscal de Entrada para Importacao)

> **De:** Dream Team de Produtos (8 agentes)
> **Para:** Dream Team de Tecnologia (11 papeis, 57 skills)
> **Data:** 30/03/2026
> **Product Owner:** Daniel Mendes
> **Status:** Aprovado — pronto para implementacao

---

## 1. Contexto Executivo (PM — 10 min)

### O que e

NF Importacao e o produto de **composicao inteligente de Notas Fiscais de Entrada** derivadas de importacoes. Recebe dados da DUIMP, permite configurar despesas e regras de rateio flexiveis, e gera o DRAFT da NF no formato exato que o importador precisa.

O sistema resolve:
- **6 canais de entrada** — XML, PDF (Smart Read), Portal Unico, ERP, Processo Gravity, manual
- **Catalogo de despesas flexivel** — cada empresa nomeia suas 100+ despesas como quiser
- **Templates de despesas** — base fixa que auto-popula a cada NF (ou Smart Read de recibos)
- **Motor de rateio multi-metodo** — 9 metodos combinaveis por despesa com preview em tempo real
- **Composicao fiscal** — CFOP + CSTs com favoritos por NCM + empresa
- **Construtor de layout** — usuario monta o formato de saida exato para seu ERP (TXT, XML, JSON, Excel, PDF)
- **API Cockpit** — ERP/sistema externo compoe NF via API REST

### Arquitetura de Entidades

| Camada | Entidade | Papel |
|--------|----------|-------|
| **1 — NF** | `NfImportacao` | Documento mestre — DUIMP de origem, empresa, status, totais |
| **2 — Item** | `NfImportacaoItem` | Item da DUIMP — NCM, valores, impostos, CFOP, CSTs |
| **3 — Despesa** | `NfImportacaoDespesa` | Despesa adicionada a NF — tipo, valor, metodo de rateio |
| **4 — Rateio** | `NfImportacaoRateio` | Resultado do rateio — despesa × item × valor calculado |
| **5 — Documento** | `NfImportacaoDocumento` | Recibos e comprovantes anexados |
| **6 — Historico** | `NfImportacaoHistorico` | Audit trail append-only |
| **Config** | `DespesaCatalogo` | Catalogo de despesas por empresa |
| **Config** | `DespesaTemplate` | Template de despesas fixas por empresa |
| **Config** | `ExportLayout` | Layout de exportacao customizado |
| **Config** | `FavoritoFiscal` | Preset CFOP + CSTs por NCM + empresa |

### Por que agora

- DUIMP consolidada como unica declaracao — volume crescente de NFs de entrada
- Dor validada: despachantes gastam 2-4 horas por NF montando rateio em planilha
- Gravity ja tem Processo (DUIMP) e Smart Read — integracao natural
- Nenhum concorrente oferece rateio flexivel + multi-formato + construtor de layout

### O que esta no MVP

| Area | Funcionalidades |
|------|----------------|
| **6 Canais de Entrada** | XML, PDF (Smart Read), Portal Unico, ERP/API, Processo, Manual |
| **Despesas** | Catalogo livre, template auto-popula, Smart Read de recibos, import planilha |
| **Rateio** | 9 metodos (peso, CIF, FOB, qtd, II, igualitario, manual, customizado), preview tempo real |
| **Fiscal** | CFOP + 4 CSTs por item, favoritos por NCM, beneficios fiscais como override |
| **Exportacao** | XML, TXT, Excel, JSON, PDF + construtor de layout + pre-sets SAP/TOTVS |
| **Gestao** | Lista com filtros, detalhe com abas, duplicar, historico, API Cockpit |

### O que NAO esta no MVP

- Dashboard de NFs pendentes + KPIs — Fase 2
- NF complementar (ajuste pos-desembaraco) — Fase 2
- Consolidacao multi-DUIMP → 1 NF — Fase 2
- Composicao assistida por IA (Gabi) — Fase 3
- Push automatico para ERP (SAP BAPI, TOTVS WS) — Fase 3
- Predicao de despesas por ML — Fase 3

---

## 2. Regras de Negocio Criticas (SME — 10 min)

### Top 7 — O que o tech team PRECISA saber antes de comecar

1. **Motor de rateio e o coracao do produto** — Cada despesa tem metodo de rateio independente. Uma NF com 20 despesas pode ter 20 metodos diferentes. A soma rateada por item DEVE fechar com o total da despesa. Algoritmo de "centavo restante" (ultimo item absorve diferenca de arredondamento).

2. **Despesas nao tem padrao de nome** — Cada empresa nomeia despesas de forma diferente. "Despacho", "despachante", "gestao de despacho" sao a mesma coisa para empresas diferentes. Por isso o catalogo e LIVRE por empresa — nao e lista fixa.

3. **Mais de 100 tipos de despesas** — AFRMM, capatazia, armazenagem, frete interno, seguro, despachante, demurrage, sobreestadia, fumigacao, ISPS, THC, desova, paletizacao, lacre, agenciamento, SDA, taxa Siscomex, e muitas mais. O sistema NAO pode ter lista hardcoded.

4. **Regras fiscais variam por UF, NCM e beneficio** — CFOP, CST de ICMS, IPI, PIS, COFINS dependem do tipo de operacao, UF de destino, beneficio fiscal (TTD, FUNDAP, ZFM). O sistema deve permitir favoritos — o usuario decide e salva.

5. **Formatos de saida sao infinitos** — Cada ERP aceita layout diferente. SAP tem IDOC, TOTVS tem Protheus e Datasul, cada um com posicoes de campo fixas diferentes. O construtor de layout e ESSENCIAL — nao e um "nice to have".

6. **Smart Read serve para 2 coisas** — (a) ler PDF da DUIMP para extrair itens e valores; (b) ler recibos/demonstrativos de despesas para extrair tipo + valor. Sao 2 contextos de uso do mesmo servico.

7. **Template de despesas economiza 80% do tempo** — Despachantes com 100 NFs/mes usam as mesmas 15-20 despesas em toda NF. O template auto-popula e o usuario so ajusta valores. Sem template, o produto perde valor.

### Regras detalhadas

| RN | Regra | Impacto tecnico |
|----|-------|----------------|
| RN-001 | Status transita apenas via `nfImportacaoStatusEngine` | Criar maquina de estados com validacao |
| RN-002 | Toda transicao gera `NfImportacaoHistorico` append-only | Trigger em toda mudanca de status |
| RN-003 | NF exportada nao pode ser editada — deve duplicar | Validar status antes de permitir edicao |
| RN-004 | IDs corporativos: `nfim_id_XXXXXXX/YY` | Sequencial por tenant, nao UUID |
| RN-005 | Zero-trust: toda query com `tenant_id` + `company_id` | Middleware obrigatorio |
| RN-006 | Soma dos rateios = total da despesa (tolerancia ±0.01) | Validacao com arredondamento |
| RN-007 | Casas decimais configuraveis por empresa | campo `casas_decimais` em config |
| RN-008 | Metodo de rateio e por despesa, nao por NF | Relacionamento 1:1 despesa→metodo |
| RN-009 | Catalogo de despesas e por company_id | Filtro obrigatorio |
| RN-010 | Layout de exportacao e por company_id | Filtro obrigatorio |

---

## 3. Publico-Alvo — Personas (UX Researcher)

### Persona 1: Carla — Analista Fiscal de Importacao
- 32 anos, contadora, importadora mid-market (30-50 NFs/mes)
- Monta NF em Excel, faz rateio na mao, converte para formato SAP
- Dor: rateio manual = 2-3 horas por NF, alto risco de erro

### Persona 2: Roberto — Despachante Aduaneiro
- 45 anos, 5 clientes, 100 NFs/mes
- Cada cliente: despesas diferentes, ERP diferente, nomes diferentes
- Dor: precisa lembrar perfil de cada cliente; recebe dezenas de recibos em PDF

### Persona 3: Marcos — Controller Financeiro
- 40 anos, trading company, 500+ processos/mes
- Precisa garantir que custo de importacao esta correto para margem
- Dor: sem visao consolidada, sem auditoria de como rateio foi feito

### Persona 4: Juliana — Analista Junior (pequena empresa)
- 26 anos, 5-10 processos/mes, faz tudo sozinha
- Nao e especialista fiscal, precisa de guia
- Dor: nao sabe qual CFOP usar, quais despesas incluir, como ratear

---

## 4. Telas e Fluxos (Designer)

### Fluxo Principal — Wizard de 6 Steps

```
T-00 (Origem) → T-02 (DUIMP) → T-03 (Despesas) → T-04 (Rateio) → T-05 (Fiscal) → T-06 (Exportacao)
```

### Tela T-00 — Origem da DUIMP

6 cards com icones Lucide:
- `FileCode` Upload XML
- `ScanText` Upload PDF (Smart Read)
- `Globe` Portal Unico
- `Link` Processo Gravity
- `Server` ERP / API
- `PenLine` Manual

### Tela T-01 — Lista de NFs

Grid `TabelaGlobal` com:
- Colunas: ID, DUIMP, Importador, Data, Itens, Valor Total, Despesas, Status, Formato, Acoes
- Filtros: status (select), empresa (select), periodo (daterange), busca livre
- Toolbar: + Nova NF, Filtros, Exportar Lista
- Status como `BadgeStatus`: rascunho (cinza), em_composicao (azul), pronta (amarelo), exportada (verde)

### Tela T-04 — Rateio (tela mais complexa)

Layout: tabela matricial
- Linhas = Itens da NF (NCM + descricao)
- Colunas = Despesas adicionadas
- Celulas = Valor rateado (editavel se metodo = MANUAL)
- Rodape = Totais por despesa + total geral
- Sidebar = Metodo de rateio por despesa (dropdown)
- Preview atualiza em tempo real a cada mudanca de metodo

### Tela T-17 — Construtor de Layout de Saida

Layout: 3 paineis
- Esquerda: campos disponiveis (drag source) — todos os campos da NF
- Centro: campos selecionados (drag target) — ordem + formatacao
- Direita: preview do arquivo gerado com dados de exemplo

Para cada campo selecionado:
- Posicao (inicio, fim — para TXT posicao fixa)
- Formato (numero: casas decimais, zero-fill; data: dd/mm/yyyy, yyyymmdd; texto: maiusculo, trim)
- Tamanho maximo
- Valor padrao (se campo vazio)

---

## 5. Arquitetura de Dados (Tech Lead)

### Entidades Principais

```
NfImportacao (1)
  ├── NfImportacaoItem (N) ← itens da DUIMP
  ├── NfImportacaoDespesa (N) ← despesas com metodo de rateio
  │     └── NfImportacaoRateio (N) ← resultado do rateio por item
  ├── NfImportacaoDocumento (N) ← recibos/comprovantes
  └── NfImportacaoHistorico (N) ← audit trail

DespesaCatalogo (por company_id) ← catalogo livre de despesas
DespesaTemplate (por company_id) ← template de despesas fixas
  └── DespesaTemplateItem (N) ← despesas do template

ExportLayout (por company_id) ← layout de saida customizado
  └── ExportLayoutCampo (N) ← campos do layout com formatacao

FavoritoFiscal (por company_id + NCM) ← presets CFOP + CSTs
```

### Ciclo de Vida (Status Engine)

```
rascunho → em_composicao → pronta → exportada
                                  ↗
rascunho → em_composicao → pronta → exportada → duplicada (cria nova)
                ↓
            cancelada
```

| Status | Descricao | Editavel? |
|--------|-----------|-----------|
| `rascunho` | Dados da DUIMP importados, sem despesas/rateio | Sim |
| `em_composicao` | Despesas adicionadas, rateio em andamento | Sim |
| `pronta` | Rateio validado, fiscal preenchido, pronta para exportar | Sim (fiscal) |
| `exportada` | Arquivo gerado e baixado | Nao — duplicar para nova versao |
| `cancelada` | NF descartada | Nao |

---

## 6. Rotas da API (Tech Lead)

### CRUD de NF Importacao

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/v1/nf-importacao` | Lista NFs com filtros e paginacao |
| POST | `/api/v1/nf-importacao` | Cria NF (manual ou com dados da DUIMP) |
| GET | `/api/v1/nf-importacao/:id` | Detalhe da NF |
| PUT | `/api/v1/nf-importacao/:id` | Atualiza NF (se editavel) |
| DELETE | `/api/v1/nf-importacao/:id` | Cancela NF (soft delete via status) |
| POST | `/api/v1/nf-importacao/:id/duplicar` | Duplica NF como novo rascunho |

### Importacao de Dados (canais de entrada)

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | `/api/v1/nf-importacao/importar/xml` | Upload XML da DUIMP → parse → cria rascunho |
| POST | `/api/v1/nf-importacao/importar/smart-read` | Upload PDF → OCR+IA → preview → confirma |
| POST | `/api/v1/nf-importacao/importar/portal-unico` | Puxa DUIMP do Portal Unico via API |
| POST | `/api/v1/nf-importacao/importar/processo/:processoId` | Puxa dados do Processo Gravity |

### Itens

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/v1/nf-importacao/:id/itens` | Lista itens da NF |
| POST | `/api/v1/nf-importacao/:id/itens` | Adiciona item |
| PUT | `/api/v1/nf-importacao/:id/itens/:itemId` | Atualiza item (CFOP, CSTs, valores) |
| DELETE | `/api/v1/nf-importacao/:id/itens/:itemId` | Remove item |

### Despesas

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/v1/nf-importacao/:id/despesas` | Lista despesas da NF |
| POST | `/api/v1/nf-importacao/:id/despesas` | Adiciona despesa (do catalogo ou ad-hoc) |
| PUT | `/api/v1/nf-importacao/:id/despesas/:despesaId` | Atualiza despesa (valor, metodo de rateio) |
| DELETE | `/api/v1/nf-importacao/:id/despesas/:despesaId` | Remove despesa |
| POST | `/api/v1/nf-importacao/:id/despesas/smart-read` | Upload recibo → Smart Read → extrai despesas |
| POST | `/api/v1/nf-importacao/:id/despesas/importar-planilha` | Upload Excel/CSV de despesas |
| POST | `/api/v1/nf-importacao/:id/despesas/aplicar-template` | Aplica template de despesas da empresa |

### Rateio

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | `/api/v1/nf-importacao/:id/rateio/preview` | Calcula preview do rateio (sem salvar) |
| POST | `/api/v1/nf-importacao/:id/rateio/aplicar` | Aplica rateio definitivo |
| PUT | `/api/v1/nf-importacao/:id/rateio/:rateioId` | Override manual de valor rateado |

### Exportacao

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | `/api/v1/nf-importacao/:id/exportar` | Gera arquivo (body: {formato, layoutId?}) |
| GET | `/api/v1/nf-importacao/:id/exportar/preview` | Preview do arquivo antes de gerar |

### Configuracoes (por empresa)

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/v1/nf-importacao/config/despesas` | Lista catalogo de despesas da empresa |
| POST | `/api/v1/nf-importacao/config/despesas` | Cria despesa no catalogo |
| PUT | `/api/v1/nf-importacao/config/despesas/:id` | Atualiza despesa |
| DELETE | `/api/v1/nf-importacao/config/despesas/:id` | Remove despesa do catalogo |
| GET | `/api/v1/nf-importacao/config/templates` | Lista templates de despesas |
| POST | `/api/v1/nf-importacao/config/templates` | Cria template |
| PUT | `/api/v1/nf-importacao/config/templates/:id` | Atualiza template |
| DELETE | `/api/v1/nf-importacao/config/templates/:id` | Remove template |
| GET | `/api/v1/nf-importacao/config/layouts` | Lista layouts de exportacao |
| POST | `/api/v1/nf-importacao/config/layouts` | Cria layout |
| PUT | `/api/v1/nf-importacao/config/layouts/:id` | Atualiza layout |
| DELETE | `/api/v1/nf-importacao/config/layouts/:id` | Remove layout |
| GET | `/api/v1/nf-importacao/config/favoritos-fiscais` | Lista favoritos CFOP+CSTs |
| POST | `/api/v1/nf-importacao/config/favoritos-fiscais` | Salva favorito por NCM |
| PUT | `/api/v1/nf-importacao/config/favoritos-fiscais/:id` | Atualiza favorito |
| DELETE | `/api/v1/nf-importacao/config/favoritos-fiscais/:id` | Remove favorito |

---

## 7. Dependencias e Integracoes (Tech Lead)

### Servicos Gravity que JA existem (reuso)

| Servico | O que reusar | Esforco |
|---------|-------------|---------|
| Smart Read | OCR+IA para PDF da DUIMP + recibos de despesas | Zero (chamar API existente) |
| API Cockpit | Tokens `gv_live_sk_` + documentacao automatica | Zero |
| Conector ERP | Integracao SAP/TOTVS para importar dados | Zero |
| Historico | Append-only audit trail | Zero |
| Notificacoes | Alertas in-app + email | Zero |
| Email | Envio de NF por email | Zero |
| Dashboard | Widgets | Zero |

### Componentes nucleo-global que serao usados

| Componente | Onde |
|-----------|------|
| TabelaGlobal | T-01 Lista, T-04 Rateio, T-09 Itens, T-15 Catalogo |
| CaixaSelectGlobal | Filtros, CFOP, CST, metodo de rateio |
| InputTexto | Formularios de despesa, layout |
| ModalGlobal | Confirmacao de rateio, exclusao |
| BadgeStatus | Status da NF na lista |
| BotaoGlobal | Todas as acoes |
| Loading | Calculo de rateio, Smart Read |

### O que precisa ser criado do ZERO

| Componente/Servico | Complexidade | Justificativa |
|-------------------|-------------|---------------|
| `rateioEngine` | GG | Motor de calculo com 9 metodos, arredondamento, validacao |
| `exportEngine` | GG | Gerador de arquivos multi-formato com layout customizado |
| `duimpXmlParser` | G | Parser de XML da DUIMP (formato Siscomex) |
| `despesaSmartReadOrchestrator` | G | Orquestra Smart Read para recibos de despesas |
| `layoutBuilder` (frontend) | GG | Construtor visual de layout de saida (drag-and-drop) |
| `rateioPreview` (frontend) | G | Tabela matricial Item × Despesa com calculo em tempo real |

---

## 8. Checklist Pre-Entrega (QA)

### Seguranca
- [ ] Toda query com `tenant_id` + `company_id`
- [ ] Anti-enumeracao: 404 para cross-tenant (nunca 403)
- [ ] Zod validation em todas as rotas antes do banco
- [ ] `x-internal-key` em chamadas inter-servico
- [ ] JWT validado via `@clerk/backend`
- [ ] Sem `console.log` com dados sensiveis
- [ ] Sem variaveis de ambiente hardcoded
- [ ] Erros via `AppError`

### Rateio
- [ ] Soma dos rateios = total da despesa (±0.01)
- [ ] Algoritmo de centavo restante funciona com 200 itens × 30 despesas
- [ ] Nenhum rateio resulta em valor negativo
- [ ] Preview atualiza em < 300ms
- [ ] Casas decimais respeitam configuracao da empresa

### Exportacao
- [ ] XML valido contra XSD (se NF-e)
- [ ] TXT com posicoes fixas corretas (SAP IDOC)
- [ ] Excel com formatacao numerica correta (nao texto)
- [ ] JSON com tipos corretos (numeros como numeros, nao strings)
- [ ] PDF legivel e formatado

### Performance
- [ ] Lista de NFs < 200ms (1000 registros)
- [ ] Rateio 100 itens × 20 despesas < 500ms
- [ ] Exportacao 200 itens < 3s
- [ ] Smart Read resposta < 30s

### Acessibilidade
- [ ] Tab order logico no wizard de 6 steps
- [ ] aria-labels em todos os campos
- [ ] Tabela de rateio navegavel por teclado
- [ ] Contraste WCAG 2.1 AA

---

## 9. Localizacao do Codigo

| O que | Onde |
|-------|------|
| Frontend | `produto/nf-importacao/client/src/` |
| Backend | `produto/nf-importacao/server/src/` |
| Fragment Prisma | `produto/nf-importacao/server/prisma/fragment.prisma` |
| Testes unitarios | `testes/testes-unitarios/nf-importacao/` |
| Testes funcionais | `testes/testes-funcionais/nf-importacao/` |
| Skill IA | `skills/produtos/nf-importacao/SKILL.md` |
| PRD | `documentos-tecnicos/produtos-gravity/nf-importacao/PRD.md` |
| Arquitetura | `documentos-tecnicos/produtos-gravity/nf-importacao/ARQUITETURA.md` |
| Registro | `servicos-global/contracts.json` → `nf-importacao` |
