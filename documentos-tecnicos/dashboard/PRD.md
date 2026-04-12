# Dashboard BI — PRD (Product Requirements Document)

> **Versão:** 1.0
> **Data:** 2026-04-02
> **Status:** Implementado
> **Owner:** Daniel Mendes
> **Serviço:** `servicos-global/tenant/dashboard/` — porta backend 3001 (super-servidor), frontend 5010

---

## 1. Problema

### 1.1 Contexto

O Gravity é um ecossistema de produtos COMEX que opera sobre isolamento total de banco de dados por tenant. Cada produto (bid-cambio, bid-frete, financeiro-comex, processo, pedido, nf-importacao, simula-custo, lpco) armazena seus dados em seu próprio banco, acessível exclusivamente pelo seu próprio serviço. Essa arquitetura garante segurança e escalabilidade, mas cria um problema crítico para o usuário final: **dados operacionais fragmentados em silos sem visão consolidada**.

### 1.2 A Dor

Gestores e analistas de operações COMEX precisam responder perguntas do tipo:

- "Qual foi meu saving total combinado entre câmbio e frete este mês?"
- "Quantos processos estão atrasados e qual o valor FOB em risco?"
- "Tenho vencimentos financeiros pendentes e LPCOs expirado nesta semana?"
- "Qual a relação entre o volume de pedidos e o custo de frete médio?"

Hoje, sem o Dashboard BI, a única forma de responder essas perguntas é:

1. Acessar cada produto individualmente
2. Exportar dados em CSV ou planilha
3. Combinar manualmente no Excel
4. Montar um relatório que já estará desatualizado no momento em que for lido

Esse fluxo consome de 30 minutos a várias horas por semana por gestor, é propenso a erros de cálculo e não escala. Empresas com alto volume (100+ operações/mês) literalmente não conseguem ter visibilidade em tempo real.

### 1.3 Por que não usar uma ferramenta BI externa (Power BI, Metabase, Tableau)?

- **Isolamento de banco de dados:** Os bancos dos produtos são privados e não expostos a conexões diretas externas. Toda integração passa pela API do produto, que aplica tenant isolation antes de retornar dados.
- **Permissões:** Um usuário no Gravity tem permissões granulares por produto. Uma ferramenta externa não conhece essas permissões sem integração explícita.
- **Custo e fricção:** Ferramentas BI externas custam de R$ 800 a R$ 5.000/mês adicionais, exigem treinamento separado e criam dependência de licença.
- **Contexto COMEX:** Campos como `saving_total`, `taxa_resposta`, `landed_cost_medio` exigem conhecimento do domínio para nomenclatura e formatação.

> **Atualização 2026-04-03 — Integração nativa Power BI:** O produto Pedido passou a expor endpoints OData v4 em `/api/v1/analytics/pedido/*`, permitindo conexão direta pelo Power BI Desktop via Web Connector com Bearer token. Isso não elimina o Dashboard nativo do Gravity, mas oferece uma camada adicional para empresas que já utilizam Power BI internamente e desejam combinar dados do Gravity com outras fontes. Os demais produtos seguirão o mesmo padrão nas próximas sprints.

---

## 2. Objetivos

### 2.1 Objetivo Estratégico

Tornar o Gravity a única interface que o gestor COMEX precisa para monitorar toda a operação em tempo real, eliminando a necessidade de exportações manuais e ferramentas BI externas.

### 2.2 Objetivos Táticos

| # | Objetivo | Métrica de Sucesso |
|---|----------|--------------------|
| T1 | Consolidar dados dos 8 produtos em um único painel | Ao menos 6 produtos com widgets ativos em produção |
| T2 | Permitir personalização sem código | 80% dos usuários configuram seu próprio dashboard sem suporte |
| T3 | Dados sempre frescos | Cache TTL 5 min, SSE para invalidação instantânea |
| T4 | Eliminar exports manuais | Redução de 90% nas solicitações de relatório CSV por email |
| T5 | Alertas proativos | Usuários configurando ao menos 1 alerta por empresa ativa |

### 2.3 Objetivos Operacionais

- Backend responde em **menos de 200ms no p95** para queries cacheadas
- Suporte a **50.000 requisições simultâneas** no pico
- **99,9% de uptime** (máximo 8,7 horas de downtime/ano)
- Isolamento total: nenhum tenant vê dados de outro
- Sem BI externo necessário: o Gravity é autossuficiente

---

## 3. Usuários-Alvo

### 3.1 Persona 1 — Gerente de Operações COMEX

**Perfil:** Responsável por toda a operação de importação/exportação da empresa. Coordena equipes de despacho, financeiro e logística. Normalmente tem acesso a todos os produtos do Gravity.

**Rotina atual (sem Dashboard):**
- Abre cada produto individualmente toda manhã
- Anota KPIs em planilha própria
- Envia resumo por email para diretoria

**O que precisa do Dashboard:**
- Visão geral dos 8 produtos na abertura do dia
- Alertas automáticos de situações críticas (processo atrasado, LPCO vencendo)
- Compartilhar snapshot da semana com diretoria sem exportar nada

**Permissões típicas:** Acesso completo a todos os produtos.

---

### 3.2 Persona 2 — Analista Operacional

**Perfil:** Executa as operações do dia a dia. Pode ser especialista em câmbio, frete, despacho ou financeiro. Tem acesso restrito aos produtos da sua área.

**O que precisa do Dashboard:**
- Dashboard personalizado com apenas os KPIs do seu produto
- Filtros de período para análise histórica (comparativo mensal)
- Gráficos de tendência para identificar anomalias

**Permissões típicas:** Acesso a 1-3 produtos.

---

### 3.3 Persona 3 — CFO / Diretor Financeiro

**Perfil:** Foco em números financeiros. Não opera o Gravity diretamente — recebe links compartilhados ou acessa o dashboard de resultado financeiro.

**O que precisa do Dashboard:**
- KPIs de saving total (câmbio + frete)
- Exposição cambial (financeiro-comex)
- Landed cost médio por NCM (simula-custo)
- Compartilhamento via link sem precisar de conta Gravity

**Permissões típicas:** Acesso read-only a bid-cambio, bid-frete, financeiro-comex, simula-custo.

---

### 3.4 Persona 4 — Gestor de Conformidade / Compliance

**Perfil:** Monitora prazos, licenças e documentos. Preocupado com LPCOs vencendo, processos atrasados, NFs pendentes.

**O que precisa do Dashboard:**
- Alertas de LPCO vencendo nos próximos 30 dias
- Etapas atrasadas em processos
- NFs com problema de transmissão SEFAZ

**Permissões típicas:** Acesso a lpco, processo, nf-importacao.

---

## 4. Proposta de Valor

### 4.1 Diferenciadores

| Funcionalidade | Gravity Dashboard | Power BI | Metabase | Tableau |
|----------------|------------------|----------|----------|---------|
| Integração nativa com dados Gravity | Sim (API interna) | **Sim (OData v4 nativo — desde 2026-04-03)** | Não (requer pipeline) | Não |
| Permissões espelhadas do Gravity | Sim (automático) | Não | Não | Não |
| Widgets contextualizados COMEX | Sim (48 pré-configurados) | Não | Não | Não |
| Criação via linguagem natural (Gabi) | Sim | Não | Não | Não |
| Alertas multi-canal integrados | Sim | Limitado | Não | Limitado |
| Compartilhamento via link sem conta | Sim | Limitado | Sim | Sim |
| Custo adicional | Zero (incluso no Gravity) | R$ 800-3.000/mês | R$ 500-2.000/mês | R$ 3.000-8.000/mês |
| Setup time | Zero | Semanas | Dias | Semanas |

### 4.2 Os 3 Modos de Criação de Widgets

O Dashboard oferece três formas de adicionar widgets, para atender diferentes perfis de usuário:

1. **Catálogo** — Selecionar de 48 widgets pré-configurados com um clique. Para usuários que querem velocidade, sem configuração.
2. **Query Builder** — Wizard em 3 passos: (1) escolher campos do catálogo, (2) definir operação (sum, avg, count, etc.), (3) escolher tipo de visualização. Para usuários que querem personalizar sem código.
3. **Gabi (IA)** — Descrever em linguagem natural o que quer ver. "Mostre o saving total do câmbio nos últimos 30 dias em gráfico de linha." A Gabi interpreta e cria o widget automaticamente.

---

## 5. Escopo do MVP

### 5.1 Dentro do Escopo (Implementado)

#### 5.1.1 Tipos de Dashboard

- **Dashboard Geral** (`mode: GENERAL`): Cross-product, pertencente ao serviço tenant. Agrega dados de todos os produtos que o usuário tem permissão. Um por usuário.
- **Dashboard por Produto** (`mode: PRODUCT`): Cada produto do Gravity pode ter seu próprio dashboard embedado, com widgets pré-filtrados por `product_id`.

#### 5.1.2 Widgets e Catálogo

- **48 campos de catálogo** cobrindo os 8 produtos (detalhamento na seção 6)
- **6 tipos de gráfico nativos do MVP:**
  - `KPI_CARD` — Número grande com label e tendência
  - `LINE` — Gráfico de linha temporal
  - `BAR` — Barras verticais
  - `BAR_HORIZONTAL` — Barras horizontais (rankings)
  - `DONUT` — Pizza/rosca para distribuições
  - `TABLE` — Tabela de dados detalhada

- **Tipos de widget adicionais (disponíveis no modelo, pendente de UI):**
  - `HISTOGRAM`, `FUNNEL`, `GAUGE`, `MAP`, `AREA`

#### 5.1.3 Grid e Layout

- Grid responsivo com `react-grid-layout` (12 colunas)
- Drag & drop de widgets com save automático via debounce de 1s
- Rollback otimista: se o save falhar, o layout reverte
- Modo edição ativado por botão "Editar Dashboard"
- Tamanhos de widget: sm (2x2), md (4x3), lg (6x4) — configurável por widget

#### 5.1.4 Filtros de Período

Todos os widgets suportam filtro de período:
- `7d` — Últimos 7 dias
- `30d` — Últimos 30 dias
- `90d` — Últimos 90 dias
- `12m` — Últimos 12 meses
- `mtd` — Month-to-date (mês atual até hoje)
- `ytd` — Year-to-date (ano atual até hoje)

#### 5.1.5 Cache e Performance

- Cache in-memory com TTL de 5 minutos por chave `tenant_id:querySpec`
- Limite de 1.000 entradas simultâneas no cache (eviction por LRU)
- Eviction automático de entradas expiradas a cada leitura
- Flag `cached: true/false` e `computed_at` em cada resposta de widget

#### 5.1.6 SSE (Server-Sent Events)

- Canal SSE por dashboard (`/api/v1/dashboard/stream/:dashboardId`)
- Eventos suportados:
  - `widget_update` — Notifica que um widget específico tem dados novos
  - `alert_triggered` — Dispara alerta na UI em tempo real
  - `heartbeat` — Keepalive a cada 30s
- Reconexão automática no cliente: 5 segundos após erro
- Badge "LIVE" na interface quando conectado

#### 5.1.7 Sistema de Alertas

- Condições: `gt`, `lt`, `gte`, `lte`, `eq`, `change_pct`
- Anti-spam: cooldown de 1 hora entre disparos consecutivos do mesmo alerta (`ALERT_COOLDOWN_MS = 3.600.000ms`)
- Canais configuráveis por alerta: `in-app`, `email`, `whatsapp`
- Integração com serviço de notificações na porta 3001

#### 5.1.8 Compartilhamento

- Geração de link com `share_token` único via `cuid()`
- Canal (`email`, `whatsapp`, `link`)
- Campo `recipient_email` e `recipient_phone` para envio direto
- `snapshot_data`: snapshot opcional dos dados no momento do compartilhamento
- `expires_at`: expiração opcional do link

#### 5.1.9 Permissões

| Permissão | O que autoriza |
|-----------|----------------|
| `dashboard:read` | Ver dashboards do próprio tenant |
| `dashboard:write` | Criar/editar/deletar widgets e configs |
| `dashboard:share` | Gerar links de compartilhamento |

Catálogo de campos filtrado automaticamente pelas permissões do usuário. Um usuário sem `bid-cambio:read` não vê os campos de câmbio no catálogo.

---

### 5.2 Fora do Escopo (Fase 2)

| Funcionalidade | Justificativa | Previsão |
|----------------|---------------|----------|
| Cache Redis | In-memory suficiente para o volume atual; Redis necessário com múltiplos processos Node | Fase 2 |
| Gabi insights automáticos | Gabi disponível on-demand; insights proativos requerem ML pipeline | Fase 2 |
| Exportação de dashboard como PDF | Requer puppeteer/headless browser; complexidade alta | Fase 2 |
| SQL builder avançado | Query Builder visual cobre 95% dos casos de uso | Fase 2 |
| Alertas via WhatsApp | Infraestrutura WhatsApp (port 3001) existe; falta config de template aprovada | Fase 2 |
| Dashboard público sem login | Requer redesign de auth middleware | Fase 2 |
| Widgets de tipo HISTOGRAM, FUNNEL, GAUGE, MAP | Modelos disponíveis, falta implementação UI | Fase 2 |

---

## 6. Requisitos Funcionais

### RF-001 — Listagem de Dashboards

O sistema deve listar todos os dashboards do usuário autenticado, ordenados por `is_default DESC, updated_at DESC`. A query deve filtrar por `user_id` e opcionalmente por `product_id`. Resultado paginado no futuro; MVP retorna todos.

**Endpoint:** `GET /api/v1/dashboard/configs?mode=GENERAL&product_id=...`

**Critério:** Usuário vê apenas seus próprios dashboards. Nunca dashboards de outro usuário ou tenant.

---

### RF-002 — Criação de Dashboard

O sistema deve permitir criar um novo `DashboardConfig` com:
- `name`: string (max 100 chars), padrão "Meu Dashboard"
- `mode`: `PRODUCT` ou `GENERAL`
- `product_id`: obrigatório para `PRODUCT`, nulo para `GENERAL`
- `is_default`: boolean — se true, o sistema deve definir todos os outros dashboards do mesmo `(user_id, mode, product_id)` como `is_default: false`

**Endpoint:** `POST /api/v1/dashboard/configs`

**Validação:** Schema Zod com os campos acima. Retorna 400 para payload inválido.

---

### RF-003 — Atualização de Layout

O sistema deve salvar o layout do grid quando o usuário finaliza o drag & drop. O payload aceita o array `layout` (posições react-grid-layout). O save é debounced em 1s no frontend para evitar spam de requisições.

**Endpoint:** `PUT /api/v1/dashboard/configs/:id`

**Comportamento de falha:** Frontend realiza rollback otimista e dispara evento `dashboard:layout-save-error`.

---

### RF-004 — Deleção de Dashboard

O sistema deve permitir deletar um dashboard (e seus widgets em cascade). Não é possível deletar um dashboard com `is_default: true` sem antes designar outro como default.

**Endpoint:** `DELETE /api/v1/dashboard/configs/:id`

---

### RF-005 — Criação de Widget via Catálogo

O sistema deve aceitar a criação de um widget informando:
- `config_id`: ID do dashboard pai
- `title`: string
- `chart_type`: um dos tipos válidos (ver enum `ChartType`)
- `widget_type`: `CATALOG`, `CUSTOM` ou `GABI`
- `widget_key`: chave do catálogo (ex: `bid-cambio.saving_total`)
- `query_spec`: objeto com `fields[]`, `operation`, `filters.period`
- `position`: `{x, y, w, h}`

**Endpoint:** `POST /api/v1/dashboard/widgets`

**Validação:** Campo `widget_key` deve existir no `DATA_CATALOG`. Se o usuário não tiver a permissão correspondente ao campo, retornar 403.

---

### RF-006 — Execução de Query de Widget

O sistema deve executar a query de um widget e retornar dados do produto-alvo. O fluxo é:

1. Receber `spec` com `fields`, `operation`, `filters`
2. Verificar cache (chave: `dashboard:widget:${tenantId}:${JSON.stringify(spec)}`)
3. Se cache hit: retornar com `cached: true`
4. Se cache miss: resolver o campo no `DATA_CATALOG`, determinar a porta do produto, fazer chamada REST para `http://localhost:${port}/api/v1/{produto}/dashboard/widgets`
5. Armazenar resultado no cache com TTL 5min
6. Retornar com `cached: false`, `computed_at`, `partial` (true se algum produto não respondeu)

**Endpoint:** `POST /api/v1/dashboard/widgets/query`

**Resultado parcial:** Se um produto-alvo não responder em 3s (timeout), o sistema deve retornar `partial: true` e dados do que conseguiu buscar, sem bloquear o dashboard inteiro.

---

### RF-007 — Catálogo de Campos

O sistema deve expor o catálogo de campos disponíveis para o usuário, filtrado pelas suas permissões. Cada campo inclui:

- `key`: identificador único (ex: `bid-cambio.saving_total`)
- `label`: nome legível em português
- `productId`: produto de origem
- `type`: `number`, `currency`, `date`, `string`, `percentage`
- `aggregations`: operações suportadas (sum, avg, count, min, max, diff_days, distribution, trend)
- `permission`: permissão Gravity necessária
- `chartTypes`: tipos de gráfico compatíveis

**Endpoint:** `GET /api/v1/dashboard/catalog/fields`

**Resposta:** Apenas campos onde o usuário tem a permissão listada.

---

### RF-008 — Catálogo de Widgets Pré-configurados

O sistema deve expor uma lista de widgets prontos para uso, agrupados por categoria e produto. O usuário seleciona um e ele é adicionado ao dashboard imediatamente.

**Endpoint:** `GET /api/v1/dashboard/catalog/widgets`

**Quantidade:** 48 widgets distribuídos entre os 8 produtos (detalhamento no Apêndice A).

---

### RF-009 — Stream SSE por Dashboard

O sistema deve manter uma conexão SSE aberta por dashboard ativo. Quando um widget recebe dados novos (pós-invalidação de cache), o servidor envia `widget_update` com o `widgetId`. O frontend reage fazendo refetch automático daquele widget.

**Endpoint:** `GET /api/v1/dashboard/stream/:dashboardId`

**Headers:** `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`

**Heartbeat:** A cada 30 segundos, enviar `{"type": "heartbeat"}` para manter a conexão ativa em proxies que fecham conexões idle.

---

### RF-010 — Criação de Alerta

O sistema deve permitir criar alertas vinculados a um dashboard, com:
- `metric_key`: chave do catálogo (ex: `processo.etapas_atrasadas`)
- `condition`: operador de comparação (`gt`, `lt`, `gte`, `lte`, `eq`, `change_pct`)
- `threshold`: valor numérico ou objeto `{value, pct}` para variação percentual
- `channels`: array de canais (`in-app`, `email`, `whatsapp`)
- `is_active`: boolean

**Endpoint:** `POST /api/v1/dashboard/alerts`

---

### RF-011 — Avaliação de Alertas

O sistema deve avaliar alertas ativos sempre que os dados de um widget forem atualizados. O motor de alertas (`alert-engine.ts`):

1. Busca todos os alertas ativos do tenant para a `metric_key` em questão
2. Extrai o valor numérico atual do resultado do widget
3. Avalia a condição contra o threshold
4. Se disparar: verifica `last_triggered` — se menos de 1 hora atrás, ignora (anti-spam)
5. Se passar o cooldown: atualiza `last_triggered`, envia para canais configurados via serviço de notificações (port 3001), e emite `alert_triggered` via SSE

**Endpoint interno** (não exposto externamente): acionado pelo query-engine após cada resolução de widget.

---

### RF-012 — Compartilhamento de Dashboard

O sistema deve permitir compartilhar um dashboard gerando um token único (`share_token`). O receptor do link não precisa estar autenticado no Gravity.

**Endpoint:** `POST /api/v1/dashboard/share`

**Payload:**
- `dashboard_id`: ID do dashboard a compartilhar
- `channel`: `email`, `whatsapp`, ou `link`
- `recipient_email` / `recipient_phone`: opcionais, para envio direto
- `snapshot_data`: dados capturados no momento do share (opcional)
- `expires_at`: data de expiração (opcional)

**Acesso público:** `GET /api/v1/dashboard/share/:token`

---

### RF-013 — Query Builder em 3 Passos

O frontend deve oferecer um wizard guiado para criação de widgets sem código:

- **Passo 1 — Campos:** Usuário escolhe um ou mais campos do catálogo (filtrado por permissão)
- **Passo 2 — Operação:** Sistema sugere operações compatíveis com os campos escolhidos (ex: campos `currency` sugerem `sum`, `avg`). Usuário escolhe período.
- **Passo 3 — Visualização:** Sistema sugere tipos de gráfico compatíveis (via `chart-advisor.ts`). Usuário escolhe e define título.

Ao salvar, o sistema cria o widget via `POST /api/v1/dashboard/widgets`.

---

### RF-014 — Deleção de Widget

O sistema deve permitir deletar um widget individualmente, sem afetar os demais widgets do mesmo dashboard.

**Endpoint:** `DELETE /api/v1/dashboard/widgets/:id`

**Cascade:** Ao deletar um `DashboardConfig`, todos os seus `DashboardWidget` são deletados em cascade (configurado no Prisma).

---

### RF-015 — Estado Vazio (Empty State)

Quando um dashboard não tem widgets, o sistema deve exibir um `EmptyState` com:
- Ícone de gráfico em tom muted
- Título "Dashboard ainda sem widgets"
- Subtítulo explicativo
- Botão de call-to-action para adicionar o primeiro widget
- Se o dashboard não existir ainda: criar automaticamente ao clicar no botão

---

### RF-016 — Dashboard por Produto (modo PRODUCT)

Cada produto do Gravity pode embedar o Dashboard com `mode: PRODUCT` e `product_id` fixo. Nesse modo:
- Catálogo filtrado apenas para o produto em questão
- Widgets pré-configurados do produto são sugeridos automaticamente
- O usuário pode personalizar widgets adicionais desde que do mesmo produto

---

### RF-017 — Advisor de Tipo de Gráfico

O sistema deve recomendar automaticamente tipos de gráfico compatíveis com os campos escolhidos, usando o `chart-advisor.ts`. A sugestão leva em conta:
- Tipo do campo (`currency`, `number`, `string`, `percentage`, `date`)
- Operação escolhida (`distribution` → DONUT/BAR; `trend` → LINE; `avg/sum` de número → KPI_CARD ou BAR)
- Número de campos simultâneos (multi-campo → TABLE ou LINE comparativo)

---

### RF-018 — Atualização Manual de Widget

O usuário deve poder forçar o refresh de um widget específico sem esperar o TTL expirar. O botão de refresh no `WidgetContainer` chama o `refetch()` do hook `useDashboardData`, que ignora o cache.

---

### RF-019 — Metadados de Widget (cached / computed_at / partial)

Cada widget deve exibir metadados de qualidade do dado:
- `cached: true` → badge "cache" em tom muted
- `partial: true` → badge "parcial" em amarelo indicando que nem todos os produtos responderam
- `computed_at` → tooltip com horário do último cálculo

---

### RF-020 — Atualização de Posição de Widget em Lote

Ao sair do modo de edição, o sistema deve salvar as posições de todos os widgets alterados em uma única requisição PUT ao `DashboardConfig`, enviando o array `layout` completo. Não deve fazer N requisições individuais.

---

## 7. Requisitos Não-Funcionais

### RNF-001 — Latência (SLA de Performance)

| Tipo de Operação | p50 | p95 | p99 |
|-----------------|-----|-----|-----|
| Query de widget (cache hit) | < 10ms | < 50ms | < 100ms |
| Query de widget (cache miss, produto responde) | < 150ms | < 200ms | < 500ms |
| Listagem de configs | < 20ms | < 80ms | < 200ms |
| Criação de widget | < 50ms | < 150ms | < 300ms |
| Conexão SSE (primeiro evento) | < 100ms | < 300ms | < 500ms |

**Referência:** SLA geral do Gravity é 200ms no p95. O Dashboard deve se manter dentro desse budget mesmo somando a latência do produto-alvo.

---

### RNF-002 — Disponibilidade

- Uptime mínimo: **99,9%** (máximo 8,7 horas de downtime/ano)
- O serviço Dashboard não deve ser um ponto único de falha para os produtos
- Se o Dashboard estiver fora do ar, os produtos individuais devem continuar funcionando normalmente
- Degradação graciosa: se um produto-alvo não responder, o widget exibe `partial: true` e os demais widgets carregam normalmente

---

### RNF-003 — Escala

- Suporte a **50.000 requisições simultâneas** (horizontal scaling via Railway)
- Cache in-memory atual suporta até 1.000 entradas simultâneas; Para escala multi-instância, substituir por Redis (Fase 2)
- Conexões SSE: máximo de 10.000 conexões simultâneas por instância (limite de file descriptors)
- Auto-scaling baseado em CPU > 70% por 2 minutos (configuração Railway)

---

### RNF-004 — Isolamento de Tenant

- **Nenhuma query é executada sem filtro por `tenant_id`**
- Toda chamada REST para produtos inclui o header `x-tenant-id`
- Cache key inclui `tenant_id`: impossível servir dados de um tenant para outro
- Tokens SSE são validados contra `tenant_id` e `user_id` do JWT

---

### RNF-005 — Segurança

- Toda rota protegida valida JWT via `@clerk/backend`
- Chamadas inter-serviço (Dashboard → Produtos) incluem `x-internal-key`
- Validação Zod em todos os endpoints antes de qualquer acesso ao banco
- Erros retornam via `AppError` — nunca expõem stack trace em produção
- `share_token` usa `cuid()` — impossível de enumerar por força bruta
- Links de compartilhamento com `expires_at` são invalidados após expiração

---

### RNF-006 — Consistência de Dados

- O Dashboard não armazena cópias dos dados dos produtos — apenas snapshots em `DashboardMetricSnapshot` para alertas
- Dados sempre buscados em tempo real dos produtos (com cache TTL 5min)
- `partial: true` sinaliza explicitamente quando os dados estão incompletos
- `DashboardMetricSnapshot` mantém histórico para comparativos de período (detalhamento Fase 2)

---

### RNF-007 — Observabilidade

- Correlation ID em todas as requisições (header `x-correlation-id`)
- Logs estruturados com `tenant_id`, `user_id`, `widget_id`, `product_id`
- Métricas de cache hit/miss exportadas para Sentry/APM
- Health check em `GET /api/v1/dashboard/health` retornando status do banco e do cache

---

### RNF-008 — Compatibilidade de Tipos

- Todo arquivo `.ts` ou `.tsx` — nenhum `.js` novo criado
- `strict: true` no `tsconfig.json`
- Sem `any` explícito (exceto `cache.ts` legado — a ser refatorado)
- ESModules (`import`/`export`) em todo o projeto
- Imports via alias `@nucleo/`, `@tenant/` — sem paths relativos a partir da raiz

---

## 8. Critérios de Aceite

### CA-01 — Dashboard Geral

- [ ] Usuário consegue ver o Dashboard Geral sem configuração prévia (auto-criação de config GENERAL)
- [ ] Dashboard exibe Empty State quando não há widgets, com botão funcional para adicionar
- [ ] Badge "LIVE" aparece quando SSE está conectado
- [ ] Modo edição ativa drag & drop; ao sair do modo, layout é salvo automaticamente
- [ ] Se save de layout falhar, layout reverte visualmente para o estado anterior

### CA-02 — Widgets e Catálogo

- [ ] Widgets do catálogo não aparecem para campos cujo usuário não tem permissão
- [ ] Widget exibe skeleton de carregamento durante fetch
- [ ] Widget exibe estado de erro com botão de retry quando produto-alvo falha
- [ ] Badge "cache" aparece quando dado vem do cache
- [ ] Badge "parcial" aparece quando `partial: true`
- [ ] Botão de refresh individual por widget força re-fetch ignorando cache

### CA-03 — Query Builder

- [ ] Wizard apresenta apenas campos com permissão do usuário
- [ ] Operações disponíveis mudam conforme o tipo do campo selecionado
- [ ] Tipos de gráfico sugeridos mudam conforme campos + operação
- [ ] Widget criado via query builder aparece no grid imediatamente após save
- [ ] Cancelar o wizard não cria nenhum widget

### CA-04 — SSE e Tempo Real

- [ ] Ao atualizar dados em um produto, o widget correspondente é atualizado via SSE sem reload de página
- [ ] Se conexão SSE cair, reconecta automaticamente em 5 segundos
- [ ] Heartbeat a cada 30s mantém a conexão ativa em redes com proxy

### CA-05 — Alertas

- [ ] Alerta com condição `gt` dispara quando valor ultrapassa threshold
- [ ] Anti-spam: segundo disparo em menos de 1 hora é ignorado
- [ ] Notificação aparece in-app via SSE (`alert_triggered`)
- [ ] Alerta inativo (`is_active: false`) não é avaliado

### CA-06 — Compartilhamento

- [ ] Link gerado é acessível sem autenticação
- [ ] Link expirado retorna 410 Gone
- [ ] Token não pode ser adivinhado por força bruta (cuid)

### CA-07 — Isolamento

- [ ] Usuário A não vê dashboards do Usuário B do mesmo tenant
- [ ] Tenant A não vê dados do Tenant B em nenhuma circunstância
- [ ] Cache de tenant A nunca serve dados para tenant B

### CA-08 — Performance

- [ ] Query de widget com cache hit responde em < 50ms no p95
- [ ] 6 widgets em paralelo carregam em < 500ms total
- [ ] Grid com 20 widgets não causa degradação perceptível no drag & drop

---

## 9. Métricas de Sucesso

### 9.1 Métricas de Adoção (30 dias pós-lançamento)

| Métrica | Meta | Método de Medição |
|---------|------|-------------------|
| Tenants com ao menos 1 widget configurado | > 60% dos tenants ativos | Query em `DashboardWidget` |
| Usuários que acessam o dashboard diariamente | > 40% dos usuários ativos | Analytics de sessão |
| Widgets criados por tenant (média) | > 5 | Avg de `DashboardWidget` por `tenant_id` |
| Taxa de retenção do dashboard (semana 4 vs semana 1) | > 70% | Comparativo de sessões |

### 9.2 Métricas de Engajamento

| Métrica | Meta | Método de Medição |
|---------|------|-------------------|
| Taxa de uso do Query Builder vs Catálogo | > 30% Query Builder | Evento de analytics por widget_type |
| Taxa de uso da Gabi para criar widgets | > 10% | Count de widgets com `widget_type: GABI` |
| Alertas ativos por tenant | > 2 | Avg de `DashboardAlert` ativos |
| Links de compartilhamento gerados/semana | > 1 por empresa | Count de `DashboardShare` |

### 9.3 Métricas de Performance (Operacional)

| Métrica | Meta | Coleta |
|---------|------|--------|
| p95 latência query widget (cache hit) | < 50ms | APM / Sentry |
| p95 latência query widget (cache miss) | < 200ms | APM / Sentry |
| Cache hit rate | > 80% | Log de `cached: true/false` |
| Taxa de partial (produto indisponível) | < 2% | Log de `partial: true` |
| Uptime do serviço Dashboard | > 99.9% | Railway health checks |
| Reconexões SSE por sessão | < 2 | Analytics cliente |

### 9.4 Impacto de Negócio

| Métrica | Meta | Método de Medição |
|---------|------|-------------------|
| Redução de exports CSV por email | > 80% | Survey com usuários piloto |
| Tempo médio para primeira visão consolidada | < 30s | Analytics de sessão |
| NPS do Dashboard (vs situação anterior) | > 50 | Survey in-app em 30 dias |
| Redução de tickets de suporte "como vejo X?" | > 50% | Zendesk/suporte |

---

## 10. Dependências

### 10.1 Dependências Internas (Serviços Gravity)

| Serviço | Porta | Uso | Tipo de Dependência |
|---------|-------|-----|---------------------|
| Notificações | 3001 | Disparar alertas via in-app, email, WhatsApp | REST — POST /notificacoes |
| Gabi (IA) | 3001 | Criação de widgets por linguagem natural | REST — POST /gabi/interpret |
| Email | 3001 | Compartilhamento de dashboard por email | REST (via Notificações) |
| WhatsApp | 3001 | Alertas via WhatsApp | REST (via Notificações, Fase 2) |
| Configurador | 8000 | Validação de JWT e permissões do usuário | JWT verify via @clerk/backend |

### 10.2 Dependências de Produtos (Fontes de Dados)

| Produto | Porta | Campos no Catálogo | Endpoint de Widgets |
|---------|-------|---------------------|---------------------|
| bid-cambio | 8025 | 6 campos | `GET /api/v1/bid-cambio/dashboard/widgets` |
| bid-frete | 8023 | 6 campos | `GET /api/v1/bid-frete/dashboard/widgets` |
| financeiro-comex | 8029 | 6 campos | `GET /api/v1/financeiro/dashboard/widgets` |
| processo | 8026 | 6 campos | `GET /api/v1/processos/dashboard/widgets` |
| pedido | 8026 | 6 campos | `GET /api/v1/pedidos/dashboard/widgets` |
| nf-importacao | 8028 | 6 campos | `GET /api/v1/nf-importacao/dashboard/widgets` |
| simula-custo | 8020 | 6 campos | `GET /api/v1/simula-custo/dashboard/widgets` |
| lpco | 8027 | 6 campos | `GET /api/v1/lpcos/dashboard/widgets` |

**Total no catálogo:** 48 campos (8 produtos × 6 campos cada)

### 10.3 Dependências de Infraestrutura

| Dependência | Versão | Uso |
|-------------|--------|-----|
| PostgreSQL (via Prisma) | ^5.13.0 | Persistência de configs, widgets, alertas, shares |
| Express | ^4.19.0 | HTTP server |
| Zod | ^3.23.0 | Validação de schema em todas as rotas |
| react-grid-layout | latest | Drag & drop do grid de widgets |
| Zustand | latest | State management do frontend |
| EventSource (nativo) | Web API | Conexão SSE no cliente |
| Plus Jakarta Sans | Web Font | Tipografia do design system |

### 10.4 Contratos com Produtos (x-internal-key)

Toda chamada do Dashboard para um produto deve incluir:
```
x-internal-key: {INTERNAL_KEY_DO_PRODUTO}
x-tenant-id: {TENANT_ID}
x-user-id: {USER_ID}
```

Os produtos devem validar o `x-internal-key` antes de servir dados de widgets. Sem esse header, o produto retorna 401.

---

## 11. Arquitetura Técnica

### 11.1 Estrutura de Arquivos

```
servicos-global/tenant/dashboard/
├── src/                        ← Núcleo exportado (@tenant/dashboard)
│   ├── Dashboard.tsx           ← Componente legado (CRM/KPIs hardcoded)
│   ├── Dashboard.js            ← Build artifact
│   ├── index.ts                ← Exports públicos do pacote
│   ├── components/
│   │   └── KPICard.tsx         ← Componente de card KPI
│   ├── hooks/
│   │   ├── useDashboardData.ts ← Fetch de dados por widget (POST /widgets/query)
│   │   ├── useDashboardLayout.ts ← Save de layout com debounce e rollback
│   │   └── useDashboardSSE.ts  ← Conexão SSE com reconexão automática
│   ├── pages/
│   │   └── DashboardGeralPage.tsx ← Página principal do Dashboard Geral
│   └── store/
│       └── dashboardStore.ts   ← Zustand store: configs, widgets, edit mode, catalog
├── server/
│   ├── index.ts                ← Entry point Express
│   ├── routes.ts               ← Montagem de todos os routers
│   ├── routes/
│   │   ├── config.routes.ts    ← CRUD de DashboardConfig
│   │   ├── widget.routes.ts    ← CRUD de DashboardWidget + query
│   │   ├── catalog.routes.ts   ← GET /catalog/fields e /catalog/widgets
│   │   ├── sse.routes.ts       ← GET /stream/:dashboardId
│   │   ├── alert.routes.ts     ← CRUD de DashboardAlert
│   │   └── share.routes.ts     ← POST /share e GET /share/:token
│   └── lib/
│       ├── cache.ts            ← Cache in-memory TTL 5min, max 1000 entries
│       ├── catalog.ts          ← DATA_CATALOG (48 campos), helpers de filtro
│       ├── query-engine.ts     ← Resolução de campos → chamada REST aos produtos
│       ├── alert-engine.ts     ← Avaliação de condições, anti-spam, dispatch
│       ├── chart-advisor.ts    ← Recomendação de tipos de gráfico
│       ├── sharing-engine.ts   ← Geração e validação de share tokens
│       ├── sse-handler.ts      ← Gerenciamento de conexões SSE abertas
│       ├── widget-registry.ts  ← Widgets pré-configurados do catálogo
│       └── errors.ts           ← AppError class
├── prisma/
│   └── fragment.prisma         ← Modelos: DashboardConfig, DashboardWidget,
│                                   DashboardMetricSnapshot, DashboardAlert, DashboardShare
├── client/
│   └── src/
│       ├── App.tsx             ← Ponto de entrada do cliente Vite
│       └── main.tsx            ← Monta React + providers
├── package.json                ← @tenant/dashboard, dependências
└── tsconfig.json
```

### 11.2 Modelos de Dados (Prisma Fragment)

#### DashboardConfig
```prisma
model DashboardConfig {
  id         String        @id @default(cuid())
  tenant_id  String                               // Obrigatório (tenant isolation)
  product_id String?                              // Null para GENERAL
  user_id    String
  name       String        @default("Meu Dashboard")
  mode       DashboardMode @default(PRODUCT)      // PRODUCT | GENERAL
  layout     Json          @default("[]")         // Array de posições react-grid-layout
  filters    Json?                                // Filtros globais do dashboard
  is_default Boolean       @default(false)
  widgets    DashboardWidget[]
  alerts     DashboardAlert[]
  shares     DashboardShare[]
  created_at DateTime      @default(now())
  updated_at DateTime      @updatedAt

  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@index([tenant_id, user_id])
}
```

#### DashboardWidget
```prisma
model DashboardWidget {
  id           String          @id @default(cuid())
  tenant_id    String
  product_id   String?
  user_id      String
  dashboard_id String
  widget_key   String                              // Chave do catálogo (ex: bid-cambio.saving_total)
  widget_type  WidgetType      @default(CATALOG)   // CATALOG | CUSTOM | GABI
  chart_type   ChartType       @default(KPI_CARD)
  title        String
  query_spec   Json                                // {fields, operation, filters}
  position     Json            @default("{...}")   // {x, y, w, h}
  config       Json?                               // Config extra (cores, formatação)
  dashboard    DashboardConfig @relation(...)
  created_at   DateTime        @default(now())
  updated_at   DateTime        @updatedAt

  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@index([tenant_id, user_id])
}
```

### 11.3 Fluxo de Dados (Query de Widget)

```
Frontend (useDashboardData)
    │
    ▼ POST /api/v1/dashboard/widgets/query
    │   {spec: {fields, operation, filters}}
    │
Dashboard Server (query-engine.ts)
    │
    ├── 1. Verificar cache (key: tenant_id + JSON(spec))
    │       ├── HIT → retornar {cached: true, computed_at, data}
    │       └── MISS → continuar
    │
    ├── 2. Resolver campo no DATA_CATALOG
    │       └── Obter productId e productPort
    │
    ├── 3. Chamar produto via REST
    │       http://localhost:{productPort}/api/v1/{produto}/dashboard/widgets
    │       Headers: x-tenant-id, x-user-id, x-internal-key
    │       Timeout: 3s (partial: true se ultrapassar)
    │
    ├── 4. Armazenar no cache (TTL: 5min)
    │
    └── 5. Retornar {cached: false, partial, computed_at, data, chartType}
```

### 11.4 Fluxo SSE

```
Frontend (useDashboardSSE)
    │
    ├── Abre EventSource para /api/v1/dashboard/stream/:dashboardId
    │
    └── Trata eventos:
            widget_update   → window.dispatchEvent('dashboard:widget-update')
                                → useDashboardData.refetch() do widget afetado
            alert_triggered → Toast de alerta na UI
            heartbeat       → Atualiza lastHeartbeat (mantém conexão ativa)
            [error]         → Fecha EventSource, agenda reconexão em 5s
```

---

## 12. Mapeamento de Campos do Catálogo

### 12.1 BID Câmbio (porta 8025) — 6 campos

| Chave | Label | Tipo | Operações | Gráficos |
|-------|-------|------|-----------|----------|
| `bid-cambio.saving_total` | Saving Total (R$) | currency | sum, avg | KPI_CARD, LINE, BAR |
| `bid-cambio.valor_operado` | Valor Operado (R$) | currency | sum | KPI_CARD, LINE |
| `bid-cambio.cotacoes_status` | Cotações por Status | string | distribution | DONUT, BAR |
| `bid-cambio.taxa_resposta` | Taxa de Resposta (%) | percentage | avg | KPI_CARD, GAUGE |
| `bid-cambio.economia_percentual` | Economia Média (%) | percentage | avg | KPI_CARD, GAUGE |
| `bid-cambio.volume_mensal` | Volume Mensal | number | count, trend | LINE, BAR |

### 12.2 BID Frete (porta 8023) — 6 campos

| Chave | Label | Tipo | Operações | Gráficos |
|-------|-------|------|-----------|----------|
| `bid-frete.saving_total` | Saving Total (R$) | currency | sum, avg | KPI_CARD, LINE, BAR |
| `bid-frete.valor_medio` | Valor Médio de Frete | currency | avg | KPI_CARD, LINE |
| `bid-frete.cotacoes_status` | Cotações por Status | string | distribution | DONUT, BAR |
| `bid-frete.saving_percentual` | Saving Médio (%) | percentage | avg | KPI_CARD, GAUGE |
| `bid-frete.transit_time` | Prazo Médio (dias) | number | avg, min, max | KPI_CARD, HISTOGRAM, BAR |
| `bid-frete.volume_mensal` | Volume Mensal | number | count, trend | LINE, BAR |

### 12.3 Financeiro COMEX (porta 8029) — 6 campos

| Chave | Label | Tipo | Operações | Gráficos |
|-------|-------|------|-----------|----------|
| `fin-comex.total_brl` | Total (R$) | currency | sum | KPI_CARD, LINE, BAR |
| `fin-comex.pendente` | Pendente (R$) | currency | sum | KPI_CARD, GAUGE |
| `fin-comex.pagos` | Pago (R$) | currency | sum | KPI_CARD, LINE |
| `fin-comex.agendados` | Agendado (R$) | currency | sum | KPI_CARD |
| `fin-comex.por_moeda` | Por Moeda | string | distribution | DONUT, BAR |
| `fin-comex.vencimentos_proximos` | Vencimentos Próximos | number | count | KPI_CARD, TABLE |

### 12.4 Processo (porta 8026) — 6 campos

| Chave | Label | Tipo | Operações | Gráficos |
|-------|-------|------|-----------|----------|
| `processo.total_ativos` | Processos Ativos | number | count | KPI_CARD |
| `processo.atraso_chegada` | Atraso Médio (dias) | number | avg, diff_days | KPI_CARD, HISTOGRAM, LINE |
| `processo.etapas_atrasadas` | Etapas Atrasadas | number | count | KPI_CARD, TABLE |
| `processo.por_status` | Por Status | string | distribution | DONUT, FUNNEL, BAR |
| `processo.chegadas_7d` | Chegando em 7 dias | number | count | KPI_CARD |
| `processo.volume_mensal` | Volume Mensal | number | count, trend | LINE, BAR |

### 12.5 Pedido (porta 8026) — 6 campos

| Chave | Label | Tipo | Operações | Gráficos |
|-------|-------|------|-----------|----------|
| `pedido.total_abertos` | Pedidos Abertos | number | count | KPI_CARD |
| `pedido.valor_fob_total` | Valor FOB Total | currency | sum, avg | KPI_CARD, LINE, BAR |
| `pedido.por_status` | Por Status | string | distribution | DONUT, BAR |
| `pedido.volume_mensal` | Volume Mensal | number | count, trend | LINE, BAR |
| `pedido.itens_ncm` | Itens por NCM | string | distribution | BAR, TABLE |
| `pedido.valor_por_fornecedor` | Valor por Fornecedor | string | distribution | BAR_HORIZONTAL, TABLE |

### 12.6 NF Importação (porta 8028) — 6 campos

| Chave | Label | Tipo | Operações | Gráficos |
|-------|-------|------|-----------|----------|
| `nf-imp.total_fob` | Total FOB (R$) | currency | sum, avg | KPI_CARD, LINE, BAR |
| `nf-imp.total_cif` | Total CIF (R$) | currency | sum, avg | KPI_CARD, LINE |
| `nf-imp.total_tributos` | Total Tributos (R$) | currency | sum | KPI_CARD, BAR, DONUT |
| `nf-imp.nfs_por_status` | NFs por Status | string | distribution | DONUT, BAR |
| `nf-imp.tributos_breakdown` | Breakdown de Tributos | string | distribution | BAR_HORIZONTAL, DONUT |
| `nf-imp.volume_mensal` | Volume Mensal | number | count, trend | LINE, BAR |

### 12.7 SimulaCusto (porta 8020) — 6 campos

| Chave | Label | Tipo | Operações | Gráficos |
|-------|-------|------|-----------|----------|
| `simula-custo.landed_cost_medio` | Landed Cost Médio (R$) | currency | avg | KPI_CARD, LINE, BAR |
| `simula-custo.estimativas_ativas` | Estimativas Ativas | number | count | KPI_CARD |
| `simula-custo.total_tributos_medio` | Tributos Médios (R$) | currency | avg | KPI_CARD |
| `simula-custo.tributos_breakdown` | Breakdown de Tributos | string | distribution | DONUT, BAR_HORIZONTAL |
| `simula-custo.ptax_media` | PTAX Média | number | avg | KPI_CARD, LINE |
| `simula-custo.volume_mensal` | Volume Mensal | number | count, trend | LINE, BAR |

### 12.8 LPCO (porta 8027) — 6 campos

| Chave | Label | Tipo | Operações | Gráficos |
|-------|-------|------|-----------|----------|
| `lpco.total_ativo` | LPCOs Ativos | number | count | KPI_CARD |
| `lpco.vencendo_30d` | Vencendo em 30 dias | number | count | KPI_CARD, TABLE |
| `lpco.exigencias_pendentes` | Exigências Pendentes | number | count | KPI_CARD, TABLE |
| `lpco.por_orgao` | Por Órgão Anuente | string | distribution | DONUT, BAR |
| `lpco.por_status` | Por Status | string | distribution | DONUT, BAR |
| `lpco.taxa_deferimento` | Taxa de Deferimento (%) | percentage | avg | KPI_CARD, GAUGE |

---

## 13. Decisões de Design

### 13.1 Por que cache in-memory e não Redis?

O Redis foi deliberadamente adiado para a Fase 2. O cache in-memory (Map nativo do Node.js) oferece latência < 1ms e zero custo operacional para o volume atual (< 5 tenants em produção). A limitação é que o cache não é compartilhado entre múltiplas instâncias do serviço — se o Railway escalar para 2 instâncias, cada uma tem seu próprio cache, causando duplicação de chamadas aos produtos. A solução para Fase 2 é substituir por Redis com serialização JSON.

### 13.2 Por que SSE e não WebSocket?

SSE é unidirecional (servidor → cliente) e mais simples de implementar e escalar. O Dashboard só precisa receber notificações do servidor — não há mensagens do cliente para o servidor pela conexão de tempo real. SSE funciona sobre HTTP/1.1 standard, compatível com proxies e CDNs sem configuração especial. WebSocket exigiria upgrade de protocolo e configuração adicional no Railway.

### 13.3 Por que o Query Builder é um wizard de 3 passos e não um editor visual?

Editores visuais como Metabase ou Apache Superset têm curva de aprendizado alta. O público-alvo do Gravity é operacional (não analistas de dados) e espera criar um widget em menos de 2 minutos. O wizard guiado de 3 passos garante que o usuário nunca fica em um estado inválido — cada passo filtra as opções do próximo baseado na escolha anterior.

### 13.4 Por que o Dashboard não armazena cópia dos dados dos produtos?

Armazenar cópia violaria o princípio de isolamento de banco de dados do Gravity. Se o bid-cambio atualiza uma cotação, o Dashboard precisaria de uma pipeline de sync para atualizar sua cópia — o que cria débito técnico, risco de inconsistência e complexidade desnecessária. O modelo atual (busca em tempo real + cache TTL 5min) garante dados sempre frescos com latência aceitável.

### 13.5 Por que Zustand para state management?

O Dashboard tem estado complexo e interdependente: config ativa, dados por widget, loading por widget, erros por widget, modo de edição, layout pendente, catálogo de campos. O Zustand oferece store centralizada sem boilerplate de Redux, com seletores granulares que evitam re-renders desnecessários. A alternativa seria React Context + useReducer, que é mais verboso sem benefícios nesse caso.

---

## 14. Histórico de Versões

| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| 1.0 | 2026-04-02 | Daniel Mendes | Documento inicial — baseado na implementação existente em `servicos-global/tenant/dashboard/` |

---

## 15. Glossário

| Termo | Definição |
|-------|-----------|
| **Widget** | Unidade visual do dashboard: um gráfico ou KPI card com sua configuração e dados |
| **CatalogField** | Campo de dado disponível no catálogo, mapeado a um produto e uma permissão |
| **QuerySpec** | Especificação de query: campos + operação + filtros de período |
| **DashboardConfig** | Configuração de um dashboard: nome, modo, layout, lista de widgets |
| **mode: GENERAL** | Dashboard cross-produto, único por usuário |
| **mode: PRODUCT** | Dashboard embedado dentro de um produto específico |
| **SSE** | Server-Sent Events — protocolo HTTP para streaming unidirecional servidor→cliente |
| **partial: true** | Flag que indica que nem todos os produtos responderam à query |
| **cache hit** | Dado servido do cache in-memory sem chamar o produto |
| **x-internal-key** | Header de autenticação inter-serviço (Dashboard → Produtos) |
| **share_token** | Token único (cuid) para acesso a um dashboard sem autenticação |
| **anti-spam** | Cooldown de 1 hora entre disparos consecutivos do mesmo alerta |
| **TTL** | Time-to-live — tempo máximo que um dado fica no cache (5 minutos) |
| **widget_type: CATALOG** | Widget criado a partir de um campo do catálogo pré-definido |
| **widget_type: CUSTOM** | Widget criado via Query Builder pelo usuário |
| **widget_type: GABI** | Widget criado via linguagem natural com a assistente IA |
