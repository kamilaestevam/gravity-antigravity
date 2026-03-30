# HANDOFF — BID Cambio

> **De:** Dream Team de Produtos (8 agentes)
> **Para:** Dream Team de Tecnologia (11 papeis, 57 skills)
> **Data:** 29/03/2026
> **Product Owner:** Daniel Mendes
> **Status:** Aprovado — pronto para implementacao

---

## 1. Contexto Executivo (PM — 10 min)

### O que e

BID Cambio e uma plataforma de **gestao e cotacao de cambio comercial** para operacoes de COMEX. Dois pilares:

- **Pilar 1 — Gestao:** Controle completo do ciclo de vida de parcelas de cambio (PENDENTE -> AGENDADO -> PAGO), com agendamento, pagamento em 3 etapas, recalculo de saldo, alertas de vencimento por e-mail e integracao com o financeiro do processo.

- **Pilar 2 — Marketplace:** Conecta compradores (importadores, exportadores, tradings, agentes de carga) a corretoras de cambio e bancos para cotacao competitiva de taxas, com comparativo automatico, aprovacao 2-click e calculo de economia.

### Por que agora

- Empresas de COMEX cotam cambio manualmente (telefone, WhatsApp, planilha)
- Nenhum concorrente oferece marketplace B2B de cambio comercial integrado a COMEX
- Volume de cambio comercial BR: ~USD 500 bi/ano
- O legado DATI ja tem modulo de gestao de parcelas validado por anos de uso real

### O que esta no MVP

| Pilar | Funcionalidades |
|-------|----------------|
| Gestao | Lista 25+ colunas, agendamento batch, pagamento 3 etapas, recalculo de parcelas, exportacao, alertas e-mail, preferencias por tenant/usuario |
| Marketplace | Criar cotacao, disparar para N corretoras, portal da corretora (auth + publico), comparativo de taxas, aprovacao 2-click, rating, economia |

### O que NAO esta no MVP

- Hedge/NDF (cambio futuro) — Fase 2
- Integracao API real-time com corretoras/bancos — Fase 2
- Registro automatico BACEN — Fase 2
- Auto-matching (corretora responde via tabela de precos) — Fase 3
- Analytics avancado de tendencia de taxas — Fase 3
- WhatsApp como canal de disparo — Fase 3

### Modelo de Negocio

- **Gratuito** para compradores (importadores, exportadores, tradings, agentes de carga)
- **Monetizacao** exclusivamente nas corretoras de cambio
- **Duas visoes separadas** com logins e dashboards independentes

---

## 2. Regras de Negocio Criticas (SME — 10 min)

### Top 5 que o time DEVE saber

| # | Regra | Por que importa |
|---|-------|----------------|
| 1 | **Valores monetarios: 2 casas decimais. Taxas: 4 casas decimais.** | O legado DATI teve problemas com 4+ casas em valores — centavos residuais impediam fechamento de parcelas. Decimal(18,2) para valores, Decimal(10,4) para taxas. |
| 2 | **Parcela com saldo zero apos recalculo deve ser eliminada (RN-105).** | Se o cambio total do pedido diminuir e uma parcela ficar zerada, ela nao pode existir no sistema. |
| 3 | **Vencimento usa Data Carga Pronta; fallback Data Esperada da Prontidao (RN-107).** | Se Data Carga Pronta estiver vazia mas Data Esperada da Prontidao estiver preenchida, usar esta. Quando ambas preenchidas, Data Carga Pronta prevalece. |
| 4 | **Pagamento parcial: diferenca vai para proxima parcela (RN-104).** | Se pagar 8,50 de uma parcela de 8,75, os 0,25 restantes vao para o saldo da proxima. Se pagar 10,00 de uma parcela de 8,75, a proxima recebe 1,25 a menos. |
| 5 | **Taxa de cambio tem validade em minutos, nao horas (RN-002).** | O frontend DEVE ter countdown visual. Se a taxa expirar, a proposta nao pode ser aprovada. |

### Armadilhas regulatorias

- PTAX nao e taxa de mercado — e referencia contabil D-1. Cotacoes reais variam 0,5-2%.
- IOF e 0,38% para cambio comercial, mas pode mudar por decreto a qualquer momento — campo configuravel, nunca hardcoded.
- Operacoes >USD 50k com pagamento antecipado requerem registro BACEN (ROF) — alertar usuario.
- Mercado opera 9h-17h Brasilia — cotacoes fora do horario sao indicativas.
- Reforma Tributaria pode mudar IOF sobre cambio — acompanhar PLP.

### Todas as regras de negocio

**Regulatorio (RN-001 a RN-008):** Ver PRD secao 4, tabela "Regulatorio".

**Gestao de Parcelas (RN-100 a RN-110):** Ver PRD secao 4, tabela "Gestao de Parcelas".

---

## 3. Publico-Alvo e Personas (UX Researcher)

### 4 Personas

| Persona | Perfil | JTBD Principal |
|---------|--------|---------------|
| **Carlos** — Analista de Cambio | Importador mid-market, 30-50 ops/mes | "Comparar taxas de 3+ corretoras em <5 min" |
| **Fernanda** — Gerente Financeira | Trading, 200+ ops/mes | "Ver dashboard com spread medio e economia para reportar" |
| **Ricardo** — Agente de Carga | Despachante, intermedia cambio | "Oferecer cotacao integrada ao frete" |
| **Marina** — Operadora de Corretora | Corretora especializada COMEX | "Receber e responder cotacoes rapidamente" |

**Detalhes completos:** PRD secao 3.

---

## 4. Telas e Fluxos (Designer — 15 min)

### 16 Telas — 9 Comprador + 7 Corretora

#### Portal do Comprador

| # | Tela | Complexidade | Componentes Nucleo-Global | 5 Estados |
|---|------|-------------|--------------------------|-----------|
| 1 | Dashboard | M | TabelaGlobal, BadgeStatus, Loading | empty (sem operacoes), loading (skeleton), error, filled (KPIs), disabled (sem permissao) |
| 2 | Lista de Cambios | G | TabelaGlobal (customizavel), CaixaSelectGlobal, BotaoGlobal | empty (sem parcelas), loading, error, filled (grid 25+), disabled |
| 3 | Nova Cotacao | M | InputTexto, CaixaSelectGlobal, BotaoGlobal, ModalGlobal | empty (form limpo), loading (buscando corretoras), error, filled, disabled (fora horario) |
| 4 | Detalhe Cotacao | M | BadgeStatus, TabelaGlobal | empty (sem respostas), loading, error, filled, disabled |
| 5 | Comparativo | M | TabelaGlobal, BadgeStatus, BotaoGlobal | empty (aguardando), loading, error, filled (ranking), disabled |
| 6 | Corretoras | P | TabelaGlobal, CaixaSelectGlobal | empty, loading, error, filled, disabled |
| 7 | Detalhe Corretora | P | BadgeStatus | empty, loading, error, filled, disabled |
| 8 | Configuracoes | P | InputTexto, CaixaSelectGlobal | empty, loading, error, filled, disabled |
| 9 | Modal Pagamento (3 etapas) | M | ModalGlobal, InputTexto, BotaoGlobal | empty, loading, error, filled, disabled |

#### Portal da Corretora

| # | Tela | Complexidade |
|---|------|-------------|
| 1 | Dashboard Corretora | M |
| 2 | Cotacoes Pendentes | P |
| 3 | Responder Cotacao (auth) | P |
| 4 | Responder Publico (token) | P |
| 5 | Minhas Respostas | P |
| 6 | Meu Desempenho | P |
| 7 | Config Corretora | P |

### Fluxos Navegacionais

**Fluxo 1 — Gestao de Parcelas:**
```
Login -> Dashboard -> Lista de Cambios
  -> Filtrar (Pendentes/Agendados/Pagos)
  -> Selecionar parcela(s)
    -> [Agendar] -> Modal data -> Salvar -> Status=AGENDADO -> Follow-up
    -> [Pagar] -> Etapa 1 (valor) -> Etapa 2 (contrato/taxa) -> Etapa 3 (anexo) -> Salvar -> Status=PAGO
```

**Fluxo 2 — Cotacao (Comprador):**
```
Dashboard -> Nova Cotacao -> Preencher -> Selecionar corretoras -> Disparar
  -> Aguardar -> Comparativo (ranking) -> Aprovar melhor taxa -> Economia calculada
```

**Fluxo 3 — Resposta (Corretora auth):**
```
Login Portal -> Dashboard -> Cotacoes Pendentes -> Responder (taxa + spread + validade) -> Enviar
```

**Fluxo 4 — Resposta (Corretora publica):**
```
E-mail com link (token 7 dias) -> Ver cotacao -> Responder -> Confirmacao
```

### Specs visuais

- **Design System:** Solid Slate (variaveis CSS: --bg-body-dark, --bg-base, --bg-surface, --accent #6366f1)
- **Tipografia:** Plus Jakarta Sans (Google Fonts), DM Mono para code blocks
- **Icones:** Lucide React (`lucide-react`), strokeWidth={2}
- **Botoes:** Pill (border-radius: 9999px), font-weight: 600
- **Dark mode first:** Todas as telas desenhadas primeiro em dark
- **Breakpoints:** Desktop 1280px+, Tablet 768-1279px, Mobile <768px
- **Acessibilidade:** Contraste 4.5:1 (AA), tab order, aria-labels, focus visible

### Codigo de referencia

Todas as 16 telas ja estao scaffoldadas como componentes React em:
```
produto/bid-cambio/client/src/pages/          # 9 telas comprador
produto/bid-cambio/client/src/pages/portal/   # 7 telas corretora
```

---

## 5. Arquitetura Tecnica (Tech Lead — 15 min)

### Ficha do Produto

| Item | Valor |
|------|-------|
| Product ID | `bid-cambio` |
| Porta servidor | 8025 |
| Porta client dev (comprador) | 5176 |
| Porta client dev (corretora) | 5177 |
| Database | `bid_cambio_db` (PostgreSQL) |
| Models Prisma | 15 tabelas |
| Enums | 12 |
| Endpoints | ~45 rotas |
| Engines | 7 servicos internos |

### O que reutilizar do Gravity

| Servico/Componente | Porta | Uso |
|-------------------|-------|-----|
| Configurador | 8003 | Auth Clerk, JWT, permissoes |
| Atividades | 8012 | Log de acoes |
| Notificacoes | 8013 | Alertas in-app |
| Historico | 8014 | Audit trail (compliance BACEN) |
| GABI | 8015 | Analise IA |
| Agendamento | 8018 | Cron job diario 7h |
| Email | 8022 | Disparo de cotacoes + alertas |
| Dashboard | 8010 | KPIs cross-product |
| Relatorios | 8011 | Exportacao |
| TabelaGlobal | nucleo-global | Grid de parcelas |
| CaixaSelectGlobal | nucleo-global | Filtros |
| InputTexto | nucleo-global | Formularios |
| ModalGlobal | nucleo-global | Agendamento, pagamento |
| BadgeStatus | nucleo-global | Status de parcelas/cotacoes |
| BotaoGlobal | nucleo-global | Acoes |
| Loading | nucleo-global | Skeleton/spinner |

### O que criar do zero

| Componente/Engine | Justificativa |
|-------------------|-------------|
| parcelaEngine | Logica de gestao de parcelas — nao existe em BID Frete |
| vencimentoEngine | Calculo de datas de vencimento por metodo — especifico de cambio |
| emailEngine | Templates especificos (alerta vencimento PT-BR, exportador EN) |
| CountdownTimer | Validade da taxa em minutos |
| GridCustomizavel | Extensao do TabelaGlobal com drag-and-drop + preferencia salva |

### Codigo scaffoldado

O scaffold completo ja esta em `produto/bid-cambio/` com 44 arquivos:

```
produto/bid-cambio/
├── client/src/
│   ├── pages/           # 9 paginas comprador
│   ├── pages/portal/    # 7 paginas corretora
│   └── shared/          # config.ts, types.ts, api.ts
└── server/
    ├── src/
    │   ├── index.ts           # Express (porta 8025)
    │   ├── routes/            # 11 routers
    │   ├── services/          # 4 engines
    │   ├── middleware/        # requireInternalKey, tenantIsolation
    │   ├── lib/               # errors, prisma
    │   └── types/             # express.d.ts
    └── prisma/
        └── fragment.prisma    # 15 models, 12 enums
```

### Documento tecnico completo

Ver `documentos-tecnicos/produto/bid-cambio/ARQUITETURA.md` para:
- PRODUCT_CONFIG completo
- fragment.prisma completo
- Todos os endpoints detalhados
- Middleware stack (20 camadas)
- Mapa de reuso completo
- Variaveis de ambiente
- Checklist de seguranca

---

## 6. Criterios de Aceite (BA — 10 min)

### Por funcionalidade do MVP

Todos os criterios estao em formato Gherkin no PRD secao 5. Resumo:

| RF | Funcionalidade | Criterios | Cenarios-chave |
|----|---------------|-----------|---------------|
| RF-001 | Lista de Cambios | CA-001 a CA-003 | Filtro por status, salvar preferencia, exportacao |
| RF-002 | Agendamento | CA-004 | Agendar multiplas parcelas com follow-up |
| RF-003 | Pagamento | CA-005 a CA-007 | Pagamento parcial, valor menor, isolamento tenant |
| RF-004 | Cotacao + Disparo | CA-008 | Criar e disparar para corretoras |
| RF-005 | Portal Corretora | CA-009, CA-010 | Responder cotacao, isolamento de dados |
| RF-006 | Comparativo | CA-011 | Aprovar melhor taxa com calculo de economia |
| RF-007 | E-mails | CA-012 | Alerta de vencimento com logica de fim de semana |

### Criterios universais (todo endpoint)

```gherkin
Cenario: Isolamento de Tenant
  Dado que estou logado no tenant "A"
  Quando faco qualquer operacao
  Entao nenhum dado do tenant "B" e acessivel ou modificado

Cenario: Validacao Zod
  Dado que envio dados invalidos para qualquer endpoint
  Entao recebo erro 400 com mensagem descritiva
  E nenhum dado e gravado no banco

Cenario: Autenticacao S2S
  Dado que faco chamada sem x-internal-key
  Entao recebo erro 401
```

---

## 7. Metricas de Sucesso (Data Analyst — 5 min)

| KPI | Meta (6 meses) | Como medir | Instrumentacao |
|-----|----------------|-----------|---------------|
| Economia media por operacao | >0,5% spread | (spread manual - spread BID) / spread manual | SavingCambio.economia_percentual |
| Tempo medio de cotacao | <5 min | Timestamp criacao -> aprovacao | CotacaoCambio.created_at vs updated_at (status=APROVADA) |
| Corretoras ativas | 20+ | Distinct corretoras com >=1 resposta/mes | BidResponseCambio.corretora_id |

### Metricas secundarias

- Parcelas pagas no prazo (%) — ParcelaCambio onde data_pagamento <= data_vencimento
- Taxa de resposta de corretoras (%) — BidResponseCambio / BidRequestCambio
- NPS (pesquisa trimestral)

---

## 8. Estimativas de Complexidade

### Por funcionalidade

| Funcionalidade | Tamanho | Dias |
|---------------|---------|------|
| Lista de Cambios (grid customizavel) | G | 5-10 |
| parcelaEngine (recalculos) | G | 5-10 |
| Cotacao + Disparo | M | 3-5 |
| Portal da Corretora (7 telas) | M | 3-5 |
| Comparativo + Aprovacao | M | 3-5 |
| Pagamento de Cambio (3 etapas) | M | 3-5 |
| vencimentoEngine | M | 3-5 |
| E-mails Automaticos | M | 3-5 |
| Dashboard | M | 3-5 |
| Rating de Corretoras | P | 1-2 |
| Preferencias do Tenant | P | 1-2 |
| Exportacao (CSV/Excel/PDF) | P | 1-2 |
| Resposta Publica (token) | P | 1-2 |

### Estimativa total MVP

| Categoria | Estimativa |
|-----------|-----------|
| Backend (models + engines + routes) | 2-3 semanas |
| Frontend Comprador (9 telas) | 1-2 semanas |
| Frontend Corretora (7 telas) | 1 semana |
| Integracoes tenant | 2-3 dias |
| Testes | 1 semana |
| **TOTAL MVP** | **4-6 semanas** |

---

## 9. Riscos que o Time Deve Saber

| Risco | Prob. | Impacto | Mitigacao |
|-------|-------|---------|-----------|
| Corretoras nao aderirem | Media | Alto | Link publico (token) como alternativa ao portal |
| Taxa expira antes de aprovar | Alta | Medio | Countdown visual + refresh + notificacao |
| IOF muda por decreto | Baixa | Alto | Campo configuravel, nunca hardcoded |
| PTAX indisponivel (BCB fora) | Baixa | Medio | Cache ultima PTAX + fallback manual |
| Complexidade de parcelas | Media | Medio | Testes extensivos com cenarios do legado DATI |
| Compliance BACEN insuficiente | Baixa | Critico | Audit trail via Historico + validacao SME |

---

## 10. Decisoes Tomadas

| # | Data | Decisao | Razao |
|---|------|---------|-------|
| D-001 | 29/03/2026 | Gratuito para compradores, monetizacao nas corretoras | Modelo marketplace classico — atrair volume primeiro |
| D-002 | 29/03/2026 | Duas visoes separadas (Comprador + Corretora) | UX mais limpa, dashboards especificos |
| D-003 | 29/03/2026 | MVP inclui Gestao + Marketplace | Gestao de parcelas e core — sem ela nao resolve o problema |
| D-004 | 29/03/2026 | Campos do legado DATI migrados | Validados por anos de uso real |
| D-005 | 29/03/2026 | Produto standalone com integracao opcional | Arquitetura Gravity: produtos independentes |
| D-006 | 29/03/2026 | Porta 8025, client 5176/5177 | Proximas disponiveis em contracts.json |

---

## 11. Indice dos 18 Artefatos

| # | Artefato | Local | Status |
|---|---------|-------|--------|
| 1 | PRD final | `documentos-tecnicos/produto/bid-cambio/PRD.md` | Completo |
| 2 | Personas | PRD secao 3 | 4 personas com JTBD |
| 3 | Mapas de Jornada | PRD secao 7 | 4 fluxos completos |
| 4 | Regras de Negocio | PRD secao 4 | RN-001 a RN-110 |
| 5 | Casos de Uso | PRD secao 5 | RF-001 a RF-007 |
| 6 | Criterios de Aceite | PRD secao 5 (Gherkin) | CA-001 a CA-012 |
| 7 | Fluxo Navegacional | PRD secao 7 + este documento secao 4 | 4 fluxos |
| 8 | Wireframes/Telas | `produto/bid-cambio/client/src/pages/` | 16 paginas React |
| 9 | Hi-Fi Dark | Codigo React com CSS vars dark-first | 16 telas |
| 10 | Hi-Fi Light | Variaveis CSS suportam toggle | Via CSS vars |
| 11 | Specs por Tela | PRD secao 8 + ARQUITETURA secao 6 | Componentes mapeados |
| 12 | Arquitetura Tecnica | `documentos-tecnicos/produto/bid-cambio/ARQUITETURA.md` | Completo |
| 13 | Mapa de Reuso | ARQUITETURA secao 6 | 9 servicos + 7 componentes |
| 14 | Estimativas | ARQUITETURA secao 7 + este documento secao 8 | P/M/G/GG |
| 15 | Analise de Mercado | PRD secao 2 + Fase 1 (TAM/SAM/SOM) | Completo |
| 16 | Benchmark Competitivo | Fase 1 — 6 concorrentes + 4 gaps | Completo |
| 17 | Backlog Priorizado | PRD secao 5 (MVP vs Fase 2 vs Fase 3) | Por fase |
| 18 | Metricas + Instrumentacao | PRD secao 10 + este documento secao 7 | 3 KPIs + instrumentacao |

---

## 12. Contatos

| Assunto | Quem Procurar |
|---------|--------------|
| Duvidas de produto/escopo | PM (este documento) |
| Duvidas de regras de negocio/legislacao | SME (PRD secao 4) |
| Duvidas de design/telas | Designer (codigo em pages/) |
| Duvidas de arquitetura | Tech Lead (ARQUITETURA.md) |
| Duvidas de dados/metricas | Data Analyst (PRD secao 10) |
| Duvidas de comportamento do usuario | UX Researcher (PRD secao 3) |
| Duvidas de criterios de aceite | BA (PRD secao 5, Gherkin) |
| Aprovacao do dono | Daniel Mendes (Product Owner) |

---

## 13. Como Ativar o Dream Team Tecnologia

```
/dream-team-tecnologia
```

Depois:

> **"Novo produto: BID Cambio. O handoff completo esta em `documentos-tecnicos/produto/bid-cambio/HANDOFF.md`. O codigo scaffoldado esta em `produto/bid-cambio/`. Leiam o handoff e comecem pela implementacao."**

### Ordem sugerida de implementacao

1. **Registrar** `bid-cambio` em `contracts.json` (porta 8025)
2. **Database:** `prisma migrate dev` com fragment.prisma
3. **Backend core:** parcelaEngine + vencimentoEngine (regras criticas)
4. **Rotas de gestao:** cambios (CRUD + agendar + pagar)
5. **Rotas de marketplace:** cotacoes + bids + comparativo
6. **Frontend comprador:** ListaCambios (tela mais complexa) -> Dashboard -> NovaCotacao -> Comparativo
7. **Frontend corretora:** PortalDashboard -> CotacoesPendentes -> ResponderCotacao -> ResponderPublico
8. **Integracoes:** tenantIntegrations (fire-and-forget) + cronJobs (alertas 7h)
9. **Testes:** unitarios dos engines + funcionais das rotas + cross-tenant
10. **QA:** revisao com checklist de 6 categorias

---

## 14. Checklist Final — Handoff Completo?

### Documentos
- [x] PRD com 13 secoes preenchidas, sem TBDs
- [x] Personas (4) com JTBD
- [x] Fluxos navegacionais (4 fluxos completos)
- [x] Regras de negocio operacionalizadas com excecoes (18 regras)
- [x] Casos de uso (7 RFs com fluxos detalhados)
- [x] Criterios de aceite em Gherkin para todo RF do MVP (12 cenarios)

### Design
- [x] Fluxo navegacional completo
- [x] 16 telas como codigo React (referencia visual)
- [x] Specs por tela (componentes, propriedades)
- [x] Design system Solid Slate aplicado
- [x] Dark mode first
- [x] Acessibilidade especificada (contraste, tab order, aria-labels)

### Tecnico
- [x] Arquitetura (pastas, models, endpoints)
- [x] Mapa de reuso (servicos + componentes)
- [x] PRODUCT_CONFIG definido
- [x] fragment.prisma completo (15 models, 12 enums)
- [x] Estimativas de complexidade (P/M/G/GG)
- [x] Seguranca (tenant isolation, Zod, auth, 5 camadas)

### Gestao
- [x] Backlog priorizado (MVP vs Fase 2 vs Fase 3)
- [x] Cronograma com fases e estimativas (4-6 semanas MVP)
- [x] Metricas de sucesso (3 KPIs + instrumentacao)
- [x] Riscos documentados com mitigacao (6 riscos)
- [x] Decisoes registradas (6 decisoes com razao)

### Aprovacoes
- [x] Checkpoint 1 aprovado (validacao do problema)
- [x] Checkpoint 2 aprovado (validacao da solucao — PRD + arquitetura)
- [x] Checkpoint 3 aprovado (handoff completo)
- [x] SME validou regras regulatorias
- [x] Tech Lead validou viabilidade tecnica
- [x] Product Owner aprovou escopo e modelo de negocio
