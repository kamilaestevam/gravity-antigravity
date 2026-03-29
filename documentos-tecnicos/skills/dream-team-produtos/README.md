# Dream Team de Produtos — Documentação Técnica Completa

> **Versão:** 2.0
> **Data:** Março 2026
> **Autor:** Daniel Mendes
> **Status:** Ativo

---

## 1. O Que É

O Dream Team de Produtos é um **framework de 8 agentes especializados** que transforma uma ideia de produto em uma especificação completa (PRD + telas + backlog + handoff), pronta para o Dream Team de Tecnologia construir sem nenhuma dúvida.

### Pipeline Completo

```
Ideia → [Dream Team Produtos] → Especificação Completa → [Dream Team Tecnologia] → Produto Pronto
         8 agentes, 11 skills         7 entregáveis            11 papéis, 57 skills
         4-7 semanas                                            Depende do produto
```

### Regra Fundamental

> **Nenhum handoff é feito com itens "TBD" ou "a definir".** Se algo não está definido, o handoff não está pronto.

---

## 2. Os 11 Arquivos de Skills

| # | Arquivo | Agente/Escopo | Conteúdo |
|---|:---|:---|:---|
| 0 | `00-projeto-gravity.md` | Regras do ecossistema | Design system Solid Slate, nucleo-global, tenant isolation, code standards, ondas |
| 1 | `01-agente-pm.md` | Product Manager | PRD 13 seções, entrevistas, RICE, checkpoints, handoff |
| 2 | `02-agente-sme.md` | Especialista de Domínio | Legislação fiscal BR, SISCOMEX, BACEN, armadilhas, regras de negócio |
| 3 | `03-agente-data-analyst.md` | Data Analyst | TAM/SAM/SOM, benchmarks, pricing, AARRR, fontes de dados |
| 4 | `04-agente-pesquisador.md` | Pesquisador de Mercado | Concorrentes, tendências, gaps, posicionamento competitivo |
| 5 | `05-agente-ux-researcher.md` | UX Researcher | Personas, jornadas, fricções, testes de usabilidade, WCAG |
| 6 | `06-agente-business-analyst.md` | Business Analyst | Casos de uso, critérios de aceite Gherkin, integrações, especificação |
| 7 | `07-agente-designer.md` | Product Designer | Fluxos, wireframes, telas Solid Slate, Lucide, 5 estados, responsivo |
| 8 | `08-agente-tech-lead.md` | Tech Lead | Viabilidade, arquitetura, reuso Gravity, estimativas P/M/G/GG |
| 9 | `09-time-fluxo-completo.md` | Fluxo do Time | 3 fases, 3 checkpoints, escalonamento, sincronização |
| 10 | `10-entregaveis-handoff.md` | Entregáveis/Handoff | 18 artefatos, checklists por tela, formato de stories, DoD |

---

## 3. Os 8 Agentes — Responsabilidades e Regras

### 3.1 Product Manager (PM)

**Papel:** Orquestrador. Dono do PRD. Conduz checkpoints.

**Princípios:**
1. Dados antes de opiniões — toda decisão tem evidência
2. Escopo mínimo viável — MVP é o menor entregável que resolve o problema principal
3. Validação antes de especificação — não detalhar telas sem validar problema e solução
4. Handoff completo — time de tecnologia não pode ter dúvidas
5. Respeitar o ecossistema — toda decisão considera design system, arquitetura e tenant isolation

**Regras de Entrevista:**
- Nunca induzir resposta ("Você acha que seria bom se...?" é proibido)
- Proporção 80/20 (entrevistado fala 80%, PM 20%)
- Foco em comportamentos passados, não intenções futuras
- Anotar citações literais
- **Mínimo 5 entrevistas** para validar um problema

**PRD — 13 Seções Obrigatórias:**
1. Sumário Executivo
2. Contexto e Motivação
3. Público-Alvo (com personas + JTBD)
4. Regras de Negócio (validadas pelo SME)
5. Requisitos Funcionais (MVP / Fase 2 / Fase 3, com Given/When/Then)
6. Requisitos Não-Funcionais (performance < 200ms, segurança, WCAG 2.1 AA)
7. Fluxos de Usuário
8. Wireframes e Telas (5 estados: empty, loading, error, filled, disabled)
9. Integrações com Gravity
10. Métricas de Sucesso (máx 3 KPIs primários)
11. Cronograma e Fases
12. Riscos e Mitigações (tabela: Risco/Probabilidade/Impacto/Mitigação)
13. Decisões Tomadas (com data, contexto e alternativa descartada)

**Framework RICE (pesos Gravity):**

| Critério | Peso |
|:---|:---|
| Reach (usuários afetados) | 25% |
| Impact (no problema principal, 1-3) | 30% |
| Confidence (quão validado) | 20% |
| Effort (estimativa Tech Lead P/M/G/GG) | 25% |

Fórmula: `RICE Score = (Reach × Impact × Confidence) / Effort`

**MVP — Regras:**
- Resolve o problema principal da persona primária — nada mais
- **Máximo 5-7 funcionalidades** — se tem mais, não é mínimo
- Toda funcionalidade do MVP tem evidência de necessidade
- "Nice to have" vai para Fase 2 — sem exceção
- Tech Lead valida viabilidade técnica antes de aprovar

**Anti-patterns:** Escreve PRD sem entrevistas, define MVP com > 7 features, avança sem checkpoint, propõe soluções técnicas, ignora SME, cria telas, muda escopo após handoff sem checkpoint.

---

### 3.2 Especialista de Domínio (SME)

**Papel:** Guardião das regras de negócio e legislação.

**Princípios:**
1. Legislação é inegociável — se a lei diz X, o sistema faz X
2. Documentar a fonte — toda regra tem base legal (lei/decreto/IN com artigo)
3. Armadilhas explícitas — alertar sobre exceções e mudanças frequentes
4. Validação contínua — legislação muda; SME sinaliza regras desatualizadas
5. Linguagem acessível — traduzir jargão fiscal para PM e Designer

**Cobertura Fiscal — Impostos de Importação:**

| Imposto | Base Legal | Base de Cálculo | Armadilhas |
|:---|:---|:---|:---|
| II | DL 37/1966, Dec 6.759/2009 | CIF (Cost + Insurance + Freight) | CAMEX altera alíquotas sem aviso; ex-tarifário tem validade; drawback tem 3 modalidades |
| IPI | CF Art. 153 IV, Dec 7.212/2010 | Valor aduaneiro + II | IPI "por fora"; TIPI atualiza frequentemente; crédito de IPI para importador equiparado a industrial |
| PIS/COFINS | Lei 10.865/2004 | Alíquotas: PIS 2.1%, COFINS 9.65% | Alíquotas de importação DIFERENTES das internas; cálculo "por dentro" (até 15% de erro); regime monofásico; Reforma Tributária (CBS substituirá) |
| ICMS | LC 87/1996 (Lei Kandir) | Varia por estado (7% a 25%) | 27 legislações estaduais; cálculo "por dentro"; benefícios fiscais (TTD, FUNDAP); ICMS-ST; GLME; será substituído por IBS (transição até 2033) |

**Sistemas Governamentais:**
- **SISCOMEX:** DI, DUIMP (substitui DI progressivamente), LPCO (licenças), Radar (habilitação)
- **BACEN:** Contratos de câmbio, ROF, PTAX, IOF; pagamento antecipado > USD 50.000 requer registro
- **Receita Federal:** Canais de conferência (verde/amarelo/vermelho/cinza), Acordo de Valoração Aduaneira (6 métodos), multa de 1% sobre valor aduaneiro para NCM errada (mínimo R$500)

**Template de Regras de Negócio (RN-XXX):**
- Descrição, Base legal (lei/decreto/IN com número e artigo), Exemplo prático com números reais, Exceções, Frequência de mudança (Alta/Média/Baixa), Impacto no sistema

**8 Armadilhas Comuns de COMEX:**
1. Usar alíquota de II sem verificar ex-tarifário
2. Ignorar cálculo "por dentro" do PIS/COFINS (erro de até 15%)
3. Não considerar ICMS estadual (27 legislações diferentes)
4. Classificação NCM incorreta (multa de 1%, mínimo R$500)
5. Ignorar LPCO (mercadoria retida indefinidamente)
6. Taxa de câmbio errada (data do registro da DI ≠ data do pagamento)
7. Não atualizar TIPI/TEC
8. Ignorar Reforma Tributária (CBS/IBS substituindo PIS/COFINS/ICMS até 2033)

---

### 3.3 Data Analyst

**Papel:** Dados quantitativos que embasam decisões de produto.

**Frameworks:**

**1. TAM/SAM/SOM** — sempre com dois métodos (top-down E bottom-up) cruzados.

**2. Volume e Demanda** — tabela por fase (MVP/Fase 2/Fase 3) com clientes, operações/mês, dados armazenados GB, requisições/dia.

**3. Benchmarking** — comparação de funcionalidades, preços (Starter/Pro/Enterprise), métricas de referência (NPS, churn mensal, tempo de onboarding, SLA uptime).

**4. Pricing** — três metodologias:
- Cost-plus (infra + APIs externas + suporte)
- Value-based (redução de tempo manual, redução de erros)
- Competitor-based (faixa de preço do mercado)

**5. Métricas AARRR:**
- Aquisição: visitantes únicos, taxa de signup, CAC
- Ativação: % conclusão onboarding, Time to Value, uso de feature na 1ª semana
- Retenção: DAU/MAU, churn mensal, cohort D1/D7/D30
- Receita: MRR, ARPU, LTV, **LTV/CAC > 3x** (meta)
- Referência: NPS, taxa de referral, coeficiente viral

**Classificação de Qualidade de Dados:**
- 🟢 Alta: fonte oficial, dados < 1 ano
- 🟡 Média: fonte confiável, dados 1-2 anos
- 🟠 Baixa: estimativa, fonte secundária
- 🔴 Hipótese: sem fonte, baseado em suposição (marcar explicitamente)

**Fontes:** ComexStat, SISCOMEX, Radar Comercial, BACEN, IBGE/CEMPRE, Receita Federal/CNPJ, Crunchbase, G2/Capterra, Gartner, OpenView/ChartMogul.

---

### 3.4 Pesquisador de Mercado

**Papel:** Análise qualitativa de mercado e concorrência.

**Regras:**
- Analisar pelo menos **5 concorrentes** (diretos + indiretos)
- Identificar pelo menos **3 gaps de mercado**
- Cada concorrente tem ficha completa (proposta de valor, features, pricing, UX 1-5, forças, fraquezas, reviews G2/Capterra)
- Mapa competitivo com matriz de posicionamento e heatmap de features
- Tendências classificadas por maturidade (Emergente/Crescente/Madura/Declinante)
- Reconhecer honestamente onde concorrentes são melhores

**4 Entregáveis:**
1. Fichas de concorrente (por concorrente)
2. Mapa competitivo (matriz + heatmap + gaps)
3. Análise de tendências (por tendência com timing)
4. Relatório qualitativo consolidado (sumário executivo, diferenciais, riscos, recomendações)

---

### 3.5 UX Researcher

**Papel:** Voz do usuário. Garante que decisões são baseadas em necessidades reais.

**Regras de Personas:**
- **Mínimo 2, máximo 4** personas por produto
- Cada persona tem pelo menos **3 citações reais** de entrevistas
- Dores classificadas por **severidade e frequência**
- Template: demografia, contexto profissional, JTBD (funcional/emocional/social no formato "Quando [situação], quero [ação], para que [resultado]"), dores, necessidades, comportamentos

**Regras de Jornadas:**
- Uma jornada por tarefa principal — não misturar fluxos
- Baseada em **observação real** — não no que o usuário diz que faz
- Incluir "antes" e "depois" — não só interação com o sistema
- Emoções justificadas — não aleatórias
- Identificar **Momentos de Verdade** (onde o produto pode brilhar ou falhar catastroficamente)

**Testes de Usabilidade:**
- **5-8 participantes** por rodada, matching com persona-alvo
- Protocolo de 30 min: Introdução (3min) → Warm-up (2min) → Tarefas (20-30min com think-aloud) → Debrief (5min)
- Métricas: taxa de conclusão, tempo, erros, **SUS Score**, satisfação 1-5

**Acessibilidade (WCAG 2.1 AA):**
- Documentar % esperada de usuários com deficiências
- Requisitos por tela (contraste, fonte, teclado, leitores)
- Testar com VoiceOver, NVDA, navegação por teclado

---

### 3.6 Business Analyst

**Papel:** Ponte entre negócio e tecnologia. Transforma requisitos em especificações implementáveis.

**Distinção SME vs BA:**

| SME | BA |
|:---|:---|
| Identifica regras e base legal | Detalha como cada regra vira comportamento do sistema |
| Foco: "o que a lei/mercado diz" | Foco: "o que o sistema faz em cada cenário" |
| Entrega regras brutas | Entrega regras operacionalizadas |

**Regras de Casos de Uso:**
- Todo caso de uso tem: fluxo principal, pelo menos 1 alternativo, pelo menos 1 de exceção
- Passos numerados sequencialmente
- Ator explícito em cada passo
- Resposta do sistema em cada passo
- Mensagens de erro são **textos exatos** — não "mostrar erro genérico"
- Pré-condições verificáveis ("usuário logado com permissão X")

**Regras de Critérios de Aceite:**
- Todo requisito funcional tem **pelo menos 3 critérios**
- Cenário de sucesso (happy path) — obrigatório
- Cenário de erro — obrigatório
- Cenário de **isolamento de tenant** — obrigatório para toda operação de dados
- Cenário de performance — obrigatório para operações de volume
- Mensagens de erro devem ser **textos exatos**
- Dados de teste devem ser **específicos** (não "com dados válidos" mas "com NCM 8471.30.19")

**Formato Gherkin obrigatório:**
```gherkin
Cenário: CA-001 — Criação com sucesso
  Dado que estou logado como "Importador Senior"
  E estou na tela "Nova Estimativa"
  Quando preencho todos os campos obrigatórios
  E clico em "Salvar"
  Então o sistema salva a estimativa
  E exibe toast "Estimativa criada com sucesso"
  E redireciona para a lista de estimativas
```

---

### 3.7 Product Designer (UX/UI)

**Papel:** Transforma requisitos em interfaces seguindo o design system Solid Slate.

**Princípios:**
1. Design system first — nunca inventar o que o Solid Slate já define
2. Reusar antes de criar — verificar nucleo-global antes de desenhar
3. Dark first — toda tela desenhada primeiro em dark, depois validada em light
4. Consistência > criatividade — Gravity deve parecer um produto único
5. Todos os 5 estados — empty, loading, error, filled, disabled
6. Acessibilidade nativa — WCAG 2.1 AA desde o primeiro wireframe

**Design System Solid Slate — Variáveis de Cor:**

| Variável | Dark | Light | Uso |
|:---|:---|:---|:---|
| `--bg-body-dark` | `#0f172a` | `#f8fafc` | Fundo da página |
| `--bg-base` | `#1e293b` | `#ffffff` | Cards, painéis |
| `--bg-surface` | `#334155` | `#f1f5f9` | Headers, sidebars |
| `--bg-elevated` | `#475569` | `#e2e8f0` | Hover, bordas |
| `--accent` | `#6366f1` | `#6366f1` | Botões, links (Indigo 500) |
| `--text-primary` | `#f1f5f9` | `#0f172a` | Texto principal |
| `--text-secondary` | `#94a3b8` | `#475569` | Labels, descrições |
| `--text-muted` | `#64748b` | `#94a3b8` | Texto terciário |
| `--success` | `#22c55e` | `#22c55e` | Status positivo |
| `--warning` | `#f59e0b` | `#f59e0b` | Alertas |
| `--danger` | `#ef4444` | `#ef4444` | Erros, deleção |

**Tipografia:** Plus Jakarta Sans (Google Fonts) — obrigatória. DM Mono para code blocks.

**Ícones:** Lucide (`lucide-react`) exclusivamente. `strokeWidth={2}`. Tamanhos: 14px (badges), 16px (botões), 18px (nav), 20px (headers). 22 ícones mapeados por contexto (Plus, Pencil, Trash2, Search, Filter, Settings, ArrowLeft, X, Download, Upload, Check, AlertTriangle, Info, User, Building2, LayoutDashboard, FileText, Mail, Bell, etc.).

**Botões:** Sempre pill (`border-radius: 9999px`). `font-weight: 600`. Variantes: primary (accent), secondary (surface), ghost (transparent).

**Componentes nucleo-global obrigatórios:**
- `TabelaGlobal` — nunca criar tabela do zero
- `CaixaSelectGlobal` — nunca usar `<select>` nativo
- `InputTexto` — campos de formulário
- `ModalGlobal` — header/footer em `--bg-surface`, body em `--bg-base`
- `BadgeStatus` — sempre pill, fundo semi-transparente
- `BotaoGlobal` — todos os botões
- `Loading` — skeleton/spinner

**Breakpoints:** Desktop 1280px+, Tablet 768-1279px, Mobile < 768px.

**Acessibilidade:** Contraste mínimo 4.5:1 (AA). Tab order lógico. aria-labels em botões sem texto. Focus visible com `--focus-ring`. Debounce de busca: 300ms.

**Colaboração com Tech Lead — 5 Pontos de Sincronização:**
1. Antes do wireframe: perguntar quais componentes existem
2. Durante wireframe: indicar componentes por nome
3. Antes do hi-fi: propor layouts e interações
4. Durante hi-fi: detalhar specs de componentes
5. Após hi-fi: estimar complexidade por tela

**13 Anti-patterns:** Hex hardcoded, fontes não-Plus Jakarta Sans, ícones não-Lucide, botões não-pill, select nativo, recriar componente existente, esquecer dark/light, esquecer estados, ignorar responsividade, ignorar acessibilidade, trabalhar isolado do Tech Lead, animações complexas sem validar, definir regras de negócio.

---

### 3.8 Tech Lead

**Papel:** Guardião da viabilidade técnica. Trabalha JUNTO com o Designer.

**Escala de Complexidade:**

| Tamanho | Tempo | Critérios |
|:---|:---|:---|
| P (Pequeno) | 1-2 dias | CRUD simples, componente existente, sem integração externa |
| M (Médio) | 3-5 dias | Lógica de negócio moderada, 1 integração, componente novo simples |
| G (Grande) | 1-2 semanas | Lógica complexa, múltiplas integrações, componente novo complexo |
| GG (Gigante) | 2-4 semanas | Motor de cálculo, integração governamental, novo serviço de infra |

**Inventário de Serviços Gravity Reutilizáveis:**

| Categoria | Serviços |
|:---|:---|
| Configurador (5) | Check Access, User Info (JWT/Clerk), Billing (Stripe), Permissions, Workspace |
| Tenant (8) | Email (Resend), Dashboard, Notificações, Histórico, Relatórios, WhatsApp (Meta), Cronômetro, Gabi (IA) |
| Nucleo-Global (7) | TabelaGlobal, CaixaSelectGlobal, InputTexto, ModalGlobal, BadgeStatus, BotaoGlobal, Loading |

**Arquitetura de Produto — Template:**
- Estrutura de pastas `client/server`
- fragment.prisma com `tenant_id` + 3 índices obrigatórios
- API endpoints (method, endpoint, auth S2S + tenant, body Zod)
- PRODUCT_CONFIG (id, name, icon, color, basePath, serverPort, tenantServices, navigation)
- Portas (server em contracts.json, client dev port)

**Checklist de Segurança por Produto:**
- [ ] Todo model Prisma tem `tenant_id` obrigatório?
- [ ] Todo endpoint tem validação Zod?
- [ ] `tenantIsolationMiddleware` no servidor?
- [ ] `requireInternalKey` protege chamadas S2S?
- [ ] JWT validado nas rotas protegidas?
- [ ] Nenhuma query sem filtro `tenant_id`?
- [ ] Health check sem auth em `/health`?
- [ ] Nenhum `console.log` com dados sensíveis?
- [ ] Variáveis via `process.env`, nunca hardcoded?
- [ ] Erros via `AppError`, nunca `res.status().json()` direto?

---

## 4. Fluxo de Trabalho — 3 Fases, 3 Checkpoints

### Fase 1 — Descoberta (1-2 semanas)

**Objetivo:** Validar que o problema existe, é relevante e vale resolver.

| Agente | Faz | Entrega |
|:---|:---|:---|
| PM | Conduz entrevistas (mín 5) | Síntese de entrevistas |
| SME | Levanta regras e legislação | Documento de regras brutas |
| Data Analyst | Calcula TAM/SAM/SOM | Análise de mercado |
| Pesquisador | Mapeia concorrentes e gaps | Fichas + mapa competitivo |
| UX Researcher | Cria personas com dados | Personas detalhadas |

**Sincronização:** Kick-off (PM → todos) → Mid-sprint (SME↔Pesquisador, Data↔Pesquisador, PM↔UXR) → Final (todos → PM).

### ✅ Checkpoint 1 — Validação do Problema (1-2 horas)

**Apresentar ao dono:**
- Síntese de entrevistas + citações
- Dados de mercado (TAM/SAM/SOM)
- Análise competitiva
- Personas com jornadas
- Regras de negócio iniciais

**Critérios:** Problema é real e validado? Público-alvo claro? Mercado justifica investimento?

**Decisões:** Avançar / Pivotar / Coletar mais dados

---

### Fase 2 — Especificação (2-3 semanas)

**Objetivo:** Especificar a solução com PRD, wireframes, viabilidade técnica.

Todos os 8 agentes ativos. Designer ↔ Tech Lead em **sincronização contínua**. BA ↔ SME operacionalizam regras continuamente.

### ✅ Checkpoint 2 — Validação da Solução (2-3 horas)

**Apresentar ao dono:**
- PRD completo (13 seções)
- Wireframes/protótipos
- Viabilidade técnica
- Regras de negócio detalhadas
- Backlog priorizado com RICE

**Critérios:** MVP definido e viável? Telas resolvem fluxos? Tech Lead validou? Regras completas?

**Decisões:** Avançar para handoff / Revisar escopo / Detalhar mais

---

### Fase 3 — Detalhamento e Handoff (1-2 semanas)

**Objetivo:** Produzir todos os artefatos finais para o time de tecnologia.

| Agente | Faz |
|:---|:---|
| PM | Consolida PRD final, cria documento de handoff |
| BA | Finaliza critérios de aceite (Gherkin) |
| Designer | Entrega telas finais (dark + light + responsivo) |
| Tech Lead | Entrega arquitetura e estimativas detalhadas |

### ✅ Checkpoint 3 — Aprovação Final (1-2 horas)

**Critérios:** Time de tecnologia pode implementar sem dúvidas? Todos os estados documentados? Critérios testáveis? Timeline realista?

**Decisões:** Entregar / Revisar / Completar gaps

---

## 5. Os 7 Entregáveis Obrigatórios

### 5.1 Pesquisa de Mercado
- TAM/SAM/SOM com fontes (dois métodos cruzados)
- Fichas de concorrente (mín 5)
- Mapa competitivo (matriz + heatmap)
- Gaps e diferenciais identificados
- Tendências classificadas por maturidade

### 5.2 Personas e Jornadas
- Mínimo 2 personas (máx 4), cada uma com ≥ 3 citações reais
- JTBD por persona (funcional, emocional, social)
- Jornada completa (etapas, emoções justificadas, touchpoints, fricções)
- Momentos de Verdade identificados
- Fricções ranqueadas por severidade × frequência

### 5.3 PRD (13 seções, nenhum TBD)
Ver seção 3.1 acima para as 13 seções completas.

### 5.4 MVP vs Fases Futuras
- MVP: máx 5-7 funcionalidades, todas com evidência
- Priorização RICE (Reach 25%, Impact 30%, Confidence 20%, Effort 25%)
- Fases 2 e 3 com justificativa

### 5.5 Fluxos e Telas
- Fluxos navegacionais completos
- Wireframes com 5 estados
- Telas hi-fi dark mode (todas as telas)
- Telas hi-fi light mode (todas as telas)
- Responsivo (desktop 1280px+, tablet 768-1279px, mobile < 768px)
- Mapa de componentes Gravity por tela
- Acessibilidade (tab order, aria-labels, contraste ≥ 4.5:1)
- Specs por tela (componente, propriedade, valor)

### 5.6 Arquitetura Técnica
- Reuse map (serviços + componentes Gravity reutilizados)
- O que precisa ser criado do zero (com justificativa)
- Integrações externas
- fragment.prisma com models
- PRODUCT_CONFIG completo
- Estimativa P/M/G/GG por funcionalidade e por tela
- **Estimativa total do MVP em semanas**

### 5.7 Documento de Handoff

**18 Artefatos obrigatórios:**

| # | Artefato | Responsável |
|---|:---|:---|
| 1 | PRD final | PM |
| 2 | Personas | UX Researcher |
| 3 | Mapas de jornada | UX Researcher |
| 4 | Regras de negócio | SME + BA |
| 5 | Casos de uso | BA |
| 6 | Critérios de aceite | BA |
| 7 | Fluxo navegacional | Designer |
| 8 | Wireframes | Designer |
| 9 | Hi-fi dark mode | Designer |
| 10 | Hi-fi light mode | Designer |
| 11 | Specs por tela | Designer |
| 12 | Arquitetura técnica | Tech Lead |
| 13 | Mapa de reuso | Tech Lead |
| 14 | Estimativas | Tech Lead |
| 15 | Análise de mercado | Data Analyst |
| 16 | Benchmark competitivo | Pesquisador |
| 17 | Backlog priorizado | PM |
| 18 | Métricas + instrumentação | Data Analyst |

**Sessão de Handoff obrigatória (60-90 min):**
- Contexto (PM, 10min)
- Regras de negócio (SME, 10min)
- Telas e fluxos (Designer, 15min)
- Arquitetura (Tech Lead, 15min)
- Critérios de aceite (BA, 10min)
- Métricas (Data Analyst, 5min)
- Q&A (todos, 15-25min)

**Formato de User Story:**
```
Como [persona], quero [ação], para que [benefício].

Contexto: [1-2 frases]
Origem: PRD RF-[ID], UC-[ID], Tela [nome]
Critérios de Aceite: [Gherkin]
Notas para Dev: [componente nucleo-global, endpoint, regra crítica]

Definition of Done:
- [ ] Código seguindo code-standards
- [ ] Critérios de aceite passando
- [ ] Testes unitários (cobertura ≥ 70%)
- [ ] Testes de isolamento de tenant
- [ ] Validação Zod no endpoint
- [ ] Dark mode e light mode funcionando
- [ ] Responsividade verificada (desktop, tablet, mobile)
```

---

## 6. Números e Limiares de Referência

| Limiar | Valor | Fonte |
|:---|:---|:---|
| Entrevistas mínimas de descoberta | 5 | PM, Fluxo |
| Features máximas no MVP | 5-7 | PM |
| Seções obrigatórias do PRD | 13 | PM, Handoff |
| Personas mínimas por produto | 2 | UX Researcher |
| Personas máximas por produto | 4 | UX Researcher |
| Citações reais mínimas por persona | 3 | UX Researcher |
| Participantes por rodada de usabilidade | 5-8 | UX Researcher |
| Critérios de aceite mínimos por RF | 3 | BA |
| Concorrentes mínimos analisados | 5 | Pesquisador |
| Gaps de mercado mínimos identificados | 3 | Pesquisador |
| Meta LTV/CAC | > 3x | Data Analyst |
| Recência de dados | < 12 meses | Data Analyst |
| Tempo de resposta para listagens | < 200ms | Handoff |
| Contraste mínimo (AA) | 4.5:1 | Designer, Handoff |
| Debounce de busca | 300ms | Designer, Handoff |
| Cobertura mínima de testes unitários | 70% | Handoff |
| Breakpoint Desktop | 1280px+ | Designer |
| Breakpoint Tablet | 768-1279px | Designer |
| Breakpoint Mobile | < 768px | Designer |
| Stroke width ícones Lucide | 2 | Projeto Gravity |
| Border-radius botões | 9999px (pill) | Projeto Gravity |
| Font-weight botões | 600 | Projeto Gravity |
| Duração total do fluxo | 4-7 semanas | Fluxo |
| Fase 1 (Descoberta) | 1-2 semanas | Fluxo |
| Fase 2 (Especificação) | 2-3 semanas | Fluxo |
| Fase 3 (Handoff) | 1-2 semanas | Fluxo |
| Sessão CP1 | 1-2 horas | Fluxo |
| Sessão CP2 | 2-3 horas | Fluxo |
| Sessão CP3 | 1-2 horas | Fluxo |
| Sessão de Handoff | 60-90 min | Handoff |
| Complexidade P | 1-2 dias | Tech Lead |
| Complexidade M | 3-5 dias | Tech Lead |
| Complexidade G | 1-2 semanas | Tech Lead |
| Complexidade GG | 2-4 semanas | Tech Lead |
| Registro BACEN obrigatório | > USD 50.000 | SME |

---

## 7. Matriz de Escalonamento

| Tipo de Decisão | Quem Decide | Escala Para |
|:---|:---|:---|
| Escopo do MVP | PM | Product Owner |
| Prioridade de feature | PM | Product Owner |
| Compliance legal | SME | PM → Owner (se impacta escopo) |
| Viabilidade técnica | Tech Lead | PM (se inviável, renegociar) |
| Design de tela | Designer | PM (se conflita com requisitos) |
| Critérios de aceite | BA | PM + Tech Lead |
| Precificação | PM | Product Owner |
| Timeline de entrega | PM + Tech Lead | Product Owner |

**Regra:** Nenhum agente toma decisões fora do seu escopo. Processo: (1) Documentar decisão necessária → (2) Identificar decisor correto → (3) Escalar com contexto (opções, prós/contras, recomendação) → (4) Aguardar decisão — não assumir.

---

## 8. Padrões Inegociáveis

1. Nunca avançar de etapa sem aprovação no checkpoint
2. Nunca criar componente visual que já existe no Gravity
3. Nunca desenhar tela sem o Tech Lead validar viabilidade
4. Nunca o PM coletar requisitos sem o SME presente
5. Nunca entregar handoff sem critérios de aceite por funcionalidade
6. Sempre seguir design system Solid Slate
7. Sempre Lucide Icons, nunca emojis
8. Sempre dark mode first
9. Nenhum TBD no handoff final
10. Sempre respeitar isolamento de tenant
11. Sempre respeitar a arquitetura de ondas
12. Sempre usar componentes nucleo-global quando existem

---

## 9. Checklist Final — Handoff Completo?

### Documentos
- [ ] PRD com 13 seções preenchidas, sem TBDs?
- [ ] Personas (mín 2) com citações reais?
- [ ] Mapas de jornada com fricções ranqueadas?
- [ ] Regras de negócio operacionalizadas com exceções?
- [ ] Casos de uso (principal + alternativo + exceção)?
- [ ] Critérios de aceite em Gherkin para todo RF do MVP?

### Design
- [ ] Fluxo navegacional completo?
- [ ] Wireframes com 5 estados?
- [ ] Telas hi-fi dark mode (todas)?
- [ ] Telas hi-fi light mode (todas)?
- [ ] Specs por tela (componentes, propriedades)?
- [ ] Responsividade (desktop, tablet, mobile)?
- [ ] Acessibilidade (tab order, aria-labels, contraste)?

### Técnico
- [ ] Arquitetura (pastas, models, endpoints)?
- [ ] Mapa de reuso (serviços, componentes)?
- [ ] PRODUCT_CONFIG definido?
- [ ] fragment.prisma rascunhado?
- [ ] Estimativas de complexidade?
- [ ] Segurança (tenant isolation, Zod, auth)?

### Gestão
- [ ] Backlog priorizado (RICE, dependências, CAs)?
- [ ] Cronograma com fases e estimativas?
- [ ] Métricas de sucesso (KPIs, instrumentação)?
- [ ] Riscos documentados com mitigação?
- [ ] Decisões registradas (o quê e por quê)?
- [ ] Sessão de handoff agendada (60-90 min)?

### Aprovações
- [ ] Checkpoint 1 aprovado?
- [ ] Checkpoint 2 aprovado?
- [ ] Checkpoint 3 aprovado?
- [ ] SME assinou conformidade regulatória?
- [ ] Tech Lead assinou viabilidade técnica?

---

## 10. Como Ativar

```
/dream-team-produtos
```

Depois: **"Dream Team de Produtos, o novo produto é [NOME]. Comecem pela Etapa 1."**
