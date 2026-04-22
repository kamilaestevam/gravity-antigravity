---
name: gravity-entregaveis-handoff
description: "Skill de entregáveis e handoff do Dream Team de Produtos para o Dream Team de Tecnologia Gravity. Define a estrutura exata do PRD, documento de handoff, checklist de aceite por tela, formato do backlog priorizado, como documentar critérios de aceite e todos os artefatos necessários para uma entrega completa. Consultada para montar o pacote final de handoff."
---

# Entregáveis e Handoff — Dream Team de Produtos → Dream Team de Tecnologia

## Objetivo

Este documento define **exatamente** o que o Dream Team de Produtos entrega ao Dream Team de Tecnologia. O objetivo é que o time de tecnologia receba tudo que precisa para implementar sem dúvidas, sem ambiguidades e sem decisões pendentes de produto.

---

## Regra Fundamental

**Nenhum handoff é feito com itens "TBD" ou "a definir".** Se algo não está definido, o handoff não está pronto. Voltar ao Checkpoint 3 e completar.

---

## 1. Estrutura do PRD Final

O PRD que vai para o handoff é a versão final, validada nos 3 checkpoints. Todas as 13 seções devem estar preenchidas.

```markdown
# PRD — [Nome do Produto] (v[X].0 — Final)

## Metadados
| Campo | Valor |
|:---|:---|
| **Produto** | [Nome] |
| **PM** | [Nome do PM] |
| **Data** | [YYYY-MM-DD] |
| **Versão** | [X].0 |
| **Status** | ✅ Aprovado para handoff |
| **Checkpoint 1** | ✅ [Data] — Problema validado |
| **Checkpoint 2** | ✅ [Data] — Solução viável |
| **Checkpoint 3** | ✅ [Data] — Handoff aprovado |

## 1. Resumo Executivo
[O que é, para quem, qual problema resolve, métrica de sucesso — máx 1 parágrafo]

## 2. Contexto e Motivação
[Por que agora? Dados de mercado, demanda validada, oportunidade identificada]

## 3. Público-Alvo
### Persona Primária: [Nome]
[Resumo da persona — link para documento completo]
### Persona Secundária: [Nome]
[Resumo — link para documento completo]

## 4. Regras de Negócio
[Lista completa de RNs operacionalizadas pelo Business Analyst]
- RN-001: [Nome] — [Resumo]
- RN-002: [Nome] — [Resumo]
[Link para documento completo de regras de negócio]

## 5. Requisitos Funcionais
### MVP (Fase 1)
| ID | Requisito | Prioridade | Complexidade | Critérios de Aceite |
|:---|:---|:---|:---|:---|
| RF-001 | [Descrição] | Must-have | [P/M/G/GG] | [Link para CAs] |
| RF-002 | [Descrição] | Must-have | [P/M/G/GG] | [Link para CAs] |

### Fase 2
| ID | Requisito | Prioridade | Complexidade | Depende de |
|:---|:---|:---|:---|:---|
| RF-010 | [Descrição] | Should-have | [P/M/G/GG] | RF-001 |

### Fase 3
[Visão de longo prazo — sem detalhamento de CAs]

## 6. Requisitos Não-Funcionais
| ID | Requisito | Critério | Prioridade |
|:---|:---|:---|:---|
| RNF-001 | Performance | Resposta < 200ms para listagens | Must-have |
| RNF-002 | Escalabilidade | Suportar [X] tenants simultâneos | Must-have |
| RNF-003 | Acessibilidade | WCAG 2.1 AA | Must-have |

## 7. Fluxos de Usuário
[Diagramas de fluxo — referência aos documentos do Designer]

## 8. Wireframes e Telas
[Links para wireframes e telas de alta fidelidade do Designer]
[Checklist de aceite por tela — ver seção 4 deste documento]

## 9. Integrações com Ecossistema Gravity
[Mapa de integrações — do Business Analyst e Tech Lead]

## 10. Métricas de Sucesso
| KPI | Meta | Como Medir |
|:---|:---|:---|
| [KPI 1] | [Valor] | [Instrumentação] |
| [KPI 2] | [Valor] | [Instrumentação] |

## 11. Cronograma e Fases
| Fase | Escopo | Estimativa | Dependência |
|:---|:---|:---|:---|
| MVP | [X] RFs | [Y] semanas | — |
| Fase 2 | [X] RFs | [Y] semanas | MVP validado |
| Fase 3 | [X] RFs | [Y] semanas | Fase 2 validada |

## 12. Riscos e Mitigações
| Risco | Prob. | Impacto | Mitigação |
|:---|:---|:---|:---|
| [Risco 1] | [A/M/B] | [A/M/B] | [Plano] |

## 13. Decisões Tomadas
| # | Decisão | Data | Contexto | Alternativa Descartada |
|:---|:---|:---|:---|:---|
| D-001 | [Decisão] | [Data] | [Por quê] | [O que foi descartado] |
```

---

## 2. Documento de Handoff

O documento de handoff é o **pacote completo** que o Dream Team de Tecnologia recebe. Ele referencia todos os artefatos produzidos.

```markdown
# Handoff — [Nome do Produto]

## Data: [YYYY-MM-DD]
## De: Dream Team de Produtos
## Para: Dream Team de Tecnologia

---

## Índice de Artefatos

| # | Artefato | Responsável | Status | Link |
|:---|:---|:---|:---|:---|
| 1 | PRD (versão final) | PM | ✅ | [link] |
| 2 | Personas | UX Researcher | ✅ | [link] |
| 3 | Mapas de Jornada | UX Researcher | ✅ | [link] |
| 4 | Regras de Negócio | SME + BA | ✅ | [link] |
| 5 | Casos de Uso | Business Analyst | ✅ | [link] |
| 6 | Critérios de Aceite | Business Analyst | ✅ | [link] |
| 7 | Fluxo Navegacional | Designer | ✅ | [link] |
| 8 | Wireframes | Designer | ✅ | [link] |
| 9 | Telas Hi-Fi (Dark) | Designer | ✅ | [link] |
| 10 | Telas Hi-Fi (Light) | Designer | ✅ | [link] |
| 11 | Specs por Tela | Designer | ✅ | [link] |
| 12 | Arquitetura Técnica | Tech Lead | ✅ | [link] |
| 13 | Mapa de Reutilização | Tech Lead | ✅ | [link] |
| 14 | Estimativas | Tech Lead | ✅ | [link] |
| 15 | Análise de Mercado | Data Analyst | ✅ | [link] |
| 16 | Benchmark Competitivo | Pesquisador | ✅ | [link] |
| 17 | Backlog Priorizado | PM | ✅ | [link] |
| 18 | Métricas + Instrumentação | Data Analyst | ✅ | [link] |

---

## Contexto Executivo (para onboarding do tech team)

### O que é o [Produto]?
[2-3 frases — problema que resolve, para quem, diferencial]

### Por que agora?
[1-2 frases — motivação, oportunidade]

### O que está no MVP?
[Lista de 5-7 funcionalidades core]

### O que NÃO está no MVP?
[Lista do que foi deliberadamente cortado e por quê]

### Regras de negócio críticas
[Top 3-5 regras que o tech team PRECISA saber antes de começar]

### Riscos que o tech team deve conhecer
[Top 3 riscos técnicos/negócio com mitigação]

---

## Contatos e Suporte

| Assunto | Quem Procurar |
|:---|:---|
| Dúvidas de produto/escopo | PM |
| Dúvidas de regras de negócio | SME |
| Dúvidas de design/telas | Designer |
| Dúvidas de arquitetura | Tech Lead |
| Dúvidas de dados/métricas | Data Analyst |
| Dúvidas de comportamento do usuário | UX Researcher |
| Dúvidas de critérios de aceite | Business Analyst |
| Aprovação do dono | PM (intermedia) |

---

## Sessão de Handoff (obrigatória)

Duração: 60-90 minutos

### Agenda
1. **Contexto** (PM — 10 min): Problema, público, motivação
2. **Regras de negócio** (SME — 10 min): Top 5 regras críticas e armadilhas
3. **Telas e fluxos** (Designer — 15 min): Walk-through visual completo
4. **Arquitetura** (Tech Lead — 15 min): Estrutura, integrações, o que reutilizar
5. **Critérios de aceite** (BA — 10 min): Como validar cada entrega
6. **Métricas** (Data Analyst — 5 min): Como medir sucesso
7. **Q&A** (Todos — 15-25 min): Perguntas do tech team
```

---

## 3. Backlog Priorizado

### Formato do Backlog

```markdown
## Backlog Priorizado — [Produto] MVP

### Como Ler Este Backlog
- Ordenado por **RICE Score** (maior primeiro)
- Cada item tem link para critérios de aceite detalhados
- Complexidade estimada pelo Tech Lead
- Status: 🔲 Não iniciado | 🔄 Em progresso | ✅ Concluído

### Backlog

| # | Story | Como [persona], quero [ação] para [benefício] | RICE | Complexidade | CAs | Depende de | Status |
|:---|:---|:---|:---|:---|:---|:---|:---|
| 1 | [Nome] | Como [persona], quero [X] para [Y] | [score] | [P/M/G/GG] | [link] | — | 🔲 |
| 2 | [Nome] | Como [persona], quero [X] para [Y] | [score] | [P/M/G/GG] | [link] | #1 | 🔲 |
| 3 | [Nome] | Como [persona], quero [X] para [Y] | [score] | [P/M/G/GG] | [link] | — | 🔲 |
| 4 | [Nome] | Como [persona], quero [X] para [Y] | [score] | [P/M/G/GG] | [link] | #1, #2 | 🔲 |

### Agrupamento por Tela

#### Tela: [Nome da Tela 1]
- Story #1: [Nome]
- Story #3: [Nome]

#### Tela: [Nome da Tela 2]
- Story #2: [Nome]
- Story #4: [Nome]

### Resumo
- **Total de stories no MVP:** [X]
- **Estimativa total:** [Y] semanas
- **Stories sem dependência (podem começar já):** #1, #3
- **Caminho crítico:** #1 → #2 → #4
```

### Formato de User Story

```markdown
## Story #[N]: [Nome descritivo]

### Como [persona], quero [ação], para que [benefício].

### Contexto
[1-2 frases de contexto — por que essa story é importante]

### Requisito de Origem
- PRD: RF-[ID]
- Caso de Uso: UC-[ID]
- Tela: [Nome da tela]

### Critérios de Aceite
[CA-001 a CA-XXX — em Gherkin, ver seção 5]

### Notas para o Desenvolvedor
- Componente do nucleo-global: [X]
- Endpoint: [POST /api/v1/Y]
- Regra de negócio crítica: [RN-Z]

### Definição de Pronto
- [ ] Código implementado seguindo code-standards
- [ ] Critérios de aceite passando
- [ ] Testes unitários (cobertura mín. 70%)
- [ ] Testes de tenant isolation
- [ ] Validação Zod no endpoint
- [ ] Dark mode e light mode funcionando
- [ ] Responsividade verificada (desktop, tablet, mobile)
```

---

## 4. Checklist de Aceite por Tela

Cada tela do produto tem um checklist detalhado que o QA usa para validar a implementação.

```markdown
## Checklist de Aceite — Tela: [Nome]

### Informações
| Campo | Valor |
|:---|:---|
| **Rota** | `/[caminho]` |
| **Caso de uso** | UC-[ID] |
| **Stories** | #[X], #[Y] |
| **Designer** | [Nome] |
| **Última revisão** | [YYYY-MM-DD] |

### Visual
- [ ] Cores seguem variáveis CSS do Design System (nenhum hex hardcoded)
- [ ] Tipografia é Plus Jakarta Sans em toda a tela
- [ ] Ícones são Lucide (nenhum ícone de outra biblioteca)
- [ ] Botões são pill (border-radius: 9999px)
- [ ] Dark mode: visual conforme mockup
- [ ] Light mode: visual conforme mockup
- [ ] Responsivo — Desktop (1280px+): layout conforme spec
- [ ] Responsivo — Tablet (768-1279px): adaptações conforme spec
- [ ] Responsivo — Mobile (<768px): adaptações conforme spec

### Estados
- [ ] Empty state: ilustração + mensagem + CTA
- [ ] Loading state: skeleton/spinner padronizado
- [ ] Error state: mensagem de erro + ação de recuperação
- [ ] Filled state: dados exibidos corretamente
- [ ] Disabled state: elementos desabilitados com visual correto

### Componentes
- [ ] [Componente 1] do nucleo-global usado (não recriado)
- [ ] [Componente 2] do nucleo-global usado (não recriado)
- [ ] Nenhum `<select>` nativo (usar CaixaSelectGlobal)
- [ ] Toasts via `addNotification` (não criados manualmente)

### Interações
- [ ] [Interação 1]: [Descrição do comportamento esperado]
- [ ] [Interação 2]: [Descrição do comportamento esperado]
- [ ] Feedback visual para ações (loading em botões, toasts de sucesso/erro)
- [ ] Validação de formulários com mensagens de erro específicas

### Acessibilidade
- [ ] Tab order lógica (filtros → conteúdo → ações)
- [ ] Aria-labels em botões sem texto
- [ ] Contraste mínimo 4.5:1 (AA)
- [ ] Focus visible com `--focus-ring` em todos os elementos interativos
- [ ] Leitor de tela: todos os elementos importantes acessíveis

### Dados e Segurança
- [ ] Dados filtrados por `id_organizacao` via SDK `@gravity/tenant-resolver` (sem dados de outra organização)
- [ ] Toda resposta `fetch().json()` validada via `schema.parse()` (Mandamento 06)
- [ ] Nenhum acesso a `publicMetadata` para ler papel/permissão (Mandamento 01)
- [ ] Paginação funcionando (se aplicável)
- [ ] Busca/filtros funcionando conforme spec
- [ ] Nenhum dado sensível visível no console/network

### Performance
- [ ] Listagem carrega em < [X]ms
- [ ] Paginação server-side para > [Y] registros
- [ ] Debounce em busca (300ms)
- [ ] Imagens/assets otimizados
```

---

## 5. Formato de Critérios de Aceite (Completo)

### Estrutura por Requisito Funcional

```markdown
## Critérios de Aceite — RF-[ID]: [Nome do requisito]

### Cenários de Sucesso

#### CA-001: [Nome — happy path principal]
```gherkin
Dado que o usuário está logado com permissão "[permissão]"
  E está na tela "[nome da tela]"
Quando clica em "[elemento]"
  E preenche "[campo]" com "[valor]"
  E clica em "[botão de ação]"
Então o sistema [resultado esperado]
  E exibe toast de sucesso "[mensagem exata]"
  E o [recurso] aparece na lista com status "[status]"
```

#### CA-002: [Nome — cenário alternativo]
```gherkin
Dado que [contexto alternativo]
Quando [ação]
Então [resultado diferente]
```

### Cenários de Erro

#### CA-003: [Nome — validação de campo]
```gherkin
Dado que o usuário está no formulário de [ação]
Quando deixa o campo "[campo obrigatório]" vazio
  E clica em "[botão de ação]"
Então o sistema exibe a mensagem "[Campo X] é obrigatório"
  E o campo é destacado em vermelho
  E o formulário NÃO é enviado
```

#### CA-004: [Nome — erro de servidor]
```gherkin
Dado que o servidor retorna erro 500
Quando o usuário tenta [ação]
Então o sistema exibe toast de erro "Erro ao [ação]. Tente novamente."
  E os dados do formulário NÃO são perdidos
```

### Cenários de Isolamento de Organização

#### CA-005: [Nome — isolamento de dados]
```gherkin
Dado que existem [recursos] da organização "Empresa A" e da organização "Empresa B"
Quando o usuário da organização "Empresa A" acessa a lista de [recursos]
Então apenas [recursos] da organização "Empresa A" são exibidos
  E nenhum dado da organização "Empresa B" é visível
  E nenhum dado da organização "Empresa B" é acessível via API
```

### Cenários de Performance

#### CA-006: [Nome — tempo de resposta]
```gherkin
Dado que existem [X] registros de [recurso] para o tenant
Quando o usuário acessa a lista de [recursos]
Então a lista carrega em menos de [Y] milissegundos
  E a paginação é server-side
```

### Cenários de Acessibilidade

#### CA-007: [Nome — navegação por teclado]
```gherkin
Dado que o usuário navega usando apenas teclado
Quando pressiona Tab na tela de [nome da tela]
Então o foco segue a ordem: [elemento 1] → [elemento 2] → [elemento 3]
  E todos os elementos interativos são acessíveis via teclado
  E o focus ring é visível em cada elemento
```

### Dados de Teste

| Campo | Valor Válido | Valor Inválido |
|:---|:---|:---|
| [campo_1] | "[valor válido]" | "[valor inválido]" — mensagem: "[erro]" |
| [campo_2] | "[valor válido]" | "[valor inválido]" — mensagem: "[erro]" |
```

---

## 6. Checklist Final — Handoff Completo?

### Documentos

- [ ] PRD (v final) — todas as 13 seções preenchidas, sem TBDs
- [ ] Personas — mínimo 2, com citações reais
- [ ] Mapas de jornada — todos os fluxos principais
- [ ] Regras de negócio — operacionalizadas, com exceções
- [ ] Casos de uso — fluxo principal + alternativos + exceções
- [ ] Critérios de aceite — Gherkin para todo RF do MVP

### Design

- [ ] Fluxo navegacional — mapa de telas completo
- [ ] Wireframes — todos os estados (empty, loading, error, filled, disabled)
- [ ] Telas hi-fi dark mode — todas as telas do MVP
- [ ] Telas hi-fi light mode — todas as telas do MVP
- [ ] Specs por tela — componentes, propriedades, valores
- [ ] Responsividade — adaptações para desktop, tablet, mobile
- [ ] Acessibilidade — tab order, aria-labels, contraste

### Técnico

- [ ] Arquitetura — estrutura de pastas, models, endpoints
- [ ] Mapa de reutilização — serviços e componentes existentes
- [ ] PRODUCT_CONFIG definido
- [ ] Fragment.prisma rascunhado
- [ ] Estimativas de complexidade por tela/funcionalidade
- [ ] Segurança — tenant isolation, Zod, auth planejados

### Gestão

- [ ] Backlog priorizado — stories com RICE, dependências, CAs
- [ ] Cronograma — fases com estimativas
- [ ] Métricas de sucesso — KPIs, instrumentação
- [ ] Riscos documentados — com mitigação
- [ ] Decisões registradas — o que foi decidido e por quê
- [ ] Sessão de handoff agendada — 60-90 min com tech team

### Aprovações

- [ ] Checkpoint 1 aprovado pelo dono do produto
- [ ] Checkpoint 2 aprovado pelo dono do produto
- [ ] Checkpoint 3 aprovado pelo dono do produto
- [ ] SME sign-off regulatório
- [ ] Tech Lead sign-off de viabilidade

---

## Anti-Padrões de Handoff

- ❌ Entregar PRD com seções "TBD" ou "a definir"
- ❌ Entregar telas sem todos os 5 estados
- ❌ Entregar critérios de aceite vagos ("deve funcionar")
- ❌ Entregar sem mapa de reutilização (tech team recria o que existe)
- ❌ Entregar sem sessão de handoff (tech team interpreta errado)
- ❌ Entregar sem backlog priorizado (tech team decide prioridade)
- ❌ Entregar sem estimativas (prazo vira surpresa)
- ❌ Mudar escopo após handoff sem novo checkpoint
