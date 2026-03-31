# HANDOFF — LPCO (Licencas, Permissoes, Certificados e Outros)

> **De:** Dream Team de Produtos (8 agentes)
> **Para:** Dream Team de Tecnologia (11 papeis, 57 skills)
> **Data:** 30/03/2026
> **Product Owner:** Daniel Mendes
> **Status:** ENTREGUE ao Dream Team de Tecnologia (30/03/2026)
> **Checkpoint 1:** Aprovado 30/03/2026 — Problema validado
> **Checkpoint 2:** Aprovado 30/03/2026 — Solucao viavel
> **Checkpoint 3:** Aprovado 30/03/2026 — Handoff completo

---

## 1. Contexto Executivo (PM — 10 min)

### O que e

LPCO e o produto de **gestao de licencas, permissoes, certificados e outros documentos** exigidos pelos 16 orgaos anuentes do governo brasileiro para operacoes de comercio exterior. E o componente de **compliance regulatorio** do ecosistema Gravity.

O sistema resolve:
- **5 canais de entrada** — "entre como quiser": manual, planilha, Pedido, Smart Read (OCR+IA), API (ERP)
- **Smart Read** — upload de fatura/packing/laudo → IA extrai 90% dos campos → revisao → registra
- **Integracao Portal Unico** — certificado digital + token OAuth2 (novo!) → registra, consulta, responde via API
- **Acompanhamento centralizado** de dezenas de LPCOs simultaneos com sync automatico
- **Alertas inteligentes** para exigencias pendentes e vigencias expirando
- **Controle de saldo** de LPCOs Flex (guarda-chuva) vinculadas a multiplas operacoes
- **API Cockpit** — ERP/SAP/sistema COMEX cria e consulta LPCOs via API REST
- **Rastreabilidade completa** para auditorias e compliance

### Arquitetura de Entidades

| Camada | Entidade | Papel |
|--------|----------|-------|
| **1 — LPCO** | `Lpco` | Documento mestre — orgao anuente, modelo, status, vigencia |
| **2 — Item** | `LpcoItem` | NCM do produto — quantidades, valores, atributos dinamicos |
| **3 — Exigencia** | `LpcoExigencia` | Comunicacao orgao ↔ usuario |
| **4 — Vinculo** | `LpcoVinculo` | Ligacao a DUIMP/DU-E com controle de saldo |
| **5 — Documento** | `LpcoDocumento` | Dossie comprobatorio |
| **6 — Historico** | `LpcoHistorico` | Audit trail append-only |

### Por que agora

- Outubro 2025: todos os 16 orgaos anuentes migraram para o Portal Unico — LPCO e obrigatorio
- Antiga Licenca de Importacao (LI) foi descontinuada — so LPCO
- Gravity ja tem Pedido e Processo — LPCO fecha o ciclo de compliance
- ~15% dos LPCOs sao cancelados por esquecimento de resposta a exigencia (90 dias)

### O que esta no MVP

| Area | Funcionalidades |
|------|----------------|
| **5 Canais de Entrada** | Manual, Planilha (Excel/CSV), A partir do Pedido (~70% auto), Smart Read (OCR+IA), Duplicar existente + API Cockpit |
| Lista de LPCOs | Grid com filtros por status, orgao, tipo, operacao, canal de entrada |
| Criacao (wizard 4 steps) | Step 0 (canal) → Dados gerais → Itens NCM (atributos dinamicos) → Revisao + registro |
| Smart Read | Upload fatura/packing/laudo → OCR+IA → preview (amarelo) → confirma → rascunho |
| Integracao Portal Unico | Registrar, consultar, responder exigencia, anexar — via API |
| Autenticacao dupla | Certificado digital (.pfx/AES-256) + Token OAuth2 (gov.br/Serpro) |
| 15 Webhooks | Recebe eventos do Portal Unico → sync automatico de status |
| Controle de saldo | LPCO Flex: quantidade deferida - SUM(vinculada) = disponivel |
| Cancelamento automatico | Cron: 90 dias em exigencia sem resposta → cancelada |
| Alertas | 60 dias (amarelo), 80 dias (vermelho), 90 dias (cancel), certificado expirando |
| Simulador TA | NCM → quais orgaos exigem LPCO (via API Portal Unico ou local) |
| Vinculacao | LPCO → Processo (DUIMP/DU-E) do Gravity |
| API Cockpit | ERP/SAP/sistema COMEX cria LPCOs via tokens `gv_live_sk_` |

### O que NAO esta no MVP

- Dashboard de compliance com KPIs por orgao — Fase 2
- Registro 1-click (rascunho → Portal Unico em um botao) — Fase 2
- Preenchimento assistido por IA (Gabi: "cria LPCO ANVISA para pedido X") — Fase 3
- Predicao de tempo de deferimento por orgao (ML) — Fase 3
- Push bidirecional de status para ERP — Fase 3

---

## 2. Regras de Negocio Criticas (SME — 10 min)

### Top 5 — O que o tech team PRECISA saber antes de comecar

1. **Cancelamento automatico de 90 dias** — LPCO em exigencia por mais de 90 dias sem resposta e cancelada automaticamente. Isso e regra do Portal Unico e nosso cron deve espelhar. E a dor #1 dos usuarios.

2. **16 orgaos anuentes × N modelos cada** — Cada orgao define formularios com atributos especificos (`ATT_XXXXX`). Os atributos podem mudar via comunicado Siscomex sem aviso previo. O sistema DEVE usar formularios dinamicos (JSON schema), nao hardcoded.

3. **LPCO Flex tem controle de saldo** — Diferente do LPCO por operacao (1:1), o LPCO Flex autoriza multiplas operacoes dentro do saldo/vigencia. Formula: `saldo_disponivel = quantidade_deferida - SUM(quantidade_vinculada)`. Vinculo rejeitado se saldo insuficiente OU vigencia expirada.

4. **Importacao exige Catalogo de Produtos** — LPCO de importacao so pode ser criada se o produto (NCM) estiver cadastrado no Catalogo de Produtos. Exportacao nao tem essa exigencia.

5. **3 modos de operacao** — O Gravity funciona em 3 modos: (a) Integrado com certificado digital — full access via API; (b) Integrado com token OAuth2 — consultas + escrita se o scope permitir; (c) Manual — usuario registra por fora e atualiza no Gravity. O modo e determinado automaticamente pela credencial configurada.

6. **5 canais de entrada** — O usuario escolhe como criar o LPCO: digitar manual, importar planilha, a partir de Pedido (auto-preenche ~70%), Smart Read (OCR+IA de fatura/laudo), ou via API (ERP). Canal e registrado em `Lpco.canal_entrada` para metricas.

7. **Certificado digital = ativo sensivel** — Armazenado com AES-256-GCM (mesmo padrao do Conector ERP). Senha NUNCA em plain text. JWT cacheado em memoria, nunca no banco. Alerta 30 dias antes do vencimento.

### Regras detalhadas

| RN | Regra | Impacto tecnico |
|----|-------|----------------|
| RN-001 | Status transita apenas via `lpcoStatusEngine` | Criar maquina de estados com validacao |
| RN-002 | Toda transicao gera `LpcoHistorico` append-only | Trigger em toda mudanca de status |
| RN-003 | LPCO deferida com vinculos ativos nao pode ser cancelada | Validar vinculos antes de permitir cancel |
| RN-004 | IDs corporativos: `lpco_id_XXXXXXX/YY` | Sequencial por tenant, nao UUID |
| RN-005 | Escudo anti-conflito: `importacao_exportador_id` / `exportacao_importador_id` | Nunca `fornecedor_id` generico |
| RN-006 | Zero-trust: toda query com `tenant_id` + `company_id` | Middleware obrigatorio |
| RN-007 | Anti-enumeracao: 404 para cross-tenant | Nunca 403 |

---

## 3. Publico e Personas (UXR — 5 min)

### 4 Personas

| Persona | Papel | JTBD Principal | Frequencia |
|---------|-------|---------------|-----------|
| Ana | Analista de Importacao | Preparar e acompanhar LPCOs sem perder prazos | Diario |
| Roberto | Despachante Aduaneiro | Gerenciar LPCOs de multiplos clientes | Diario |
| Marcela | Gerente de Compliance | Dashboard de KPIs para auditoria | Semanal |
| Paulo | Exportador (Agro) | LPCOs de exportacao nao atrasarem embarque | Sob demanda |

### Fricoes Principais (o que o produto resolve)

1. **Esquecimento** → Alertas automaticos antes do cancelamento
2. **Formularios complexos** → Validacao pre-registro + duplicacao de modelos
3. **Visibilidade zero** → Dashboard centralizado com todos os LPCOs
4. **Multiplos clientes** → Filtro por company, visao consolidada
5. **Auditoria** → Historico completo e imutavel

---

## 4. Telas e Fluxos (Designer — 15 min)

### Mapa de Telas

| # | Tela | Rota | Complexidade |
|---|------|------|-------------|
| T-00 | Escolha de Canal | `/lpco/novo` | P |
| T-01 | Lista de LPCOs | `/lpco` | M |
| T-02 | Novo — Dados Gerais | `/lpco/novo/dados` | M |
| T-03 | Novo — Itens NCM | `/lpco/novo/itens` | G |
| T-04 | Novo — Revisao | `/lpco/novo/revisao` | M |
| T-05 | Import Planilha | `/lpco/novo/planilha` | M |
| T-06 | Smart Read | `/lpco/novo/smart-read` | M |
| T-07 | Detalhe (container) | `/lpco/:id` | P |
| T-08 | Aba Formulario | `/lpco/:id/formulario` | M |
| T-09 | Aba Documentos | `/lpco/:id/documentos` | M |
| T-10 | Aba Exigencias | `/lpco/:id/exigencias` | M |
| T-11 | Aba Vinculos | `/lpco/:id/vinculos` | G |
| T-12 | Aba Historico | `/lpco/:id/historico` | M |
| T-13 | Simulador TA | `/lpco/simulador` | G |
| T-14 | Credenciais Siscomex | `/lpco/configuracoes` | M |

### Fluxo Principal

```
Lista LPCOs → + Novo LPCO → Step 0: "Como voce quer criar?"
                                    ↓
             ┌──────────┬───────────┬────────────┬──────────┐
          Manual    Planilha    Pedido     SmartRead   Duplicar
             │         │          │            │          │
             ↓         ↓          ↓            ↓          ↓
         Step 1    Upload     Selecionar   Upload      Copia
         (vazio)   Excel/CSV  Pedido       docs        LPCO
                      ↓       (autopreen)  (OCR+IA)       ↓
                   Preview       ↓         Preview     Step 1
                      ↓       Step 1          ↓        (ajusta)
                   Confirma  (completa)    Confirma        ↓
                                ↓             ↓        Step 2...
                             Step 2        Step 1
                                ↓             ↓
                             Step 3        Step 2 → Step 3 → Registrar
                                ↓
                             Registrar (via API Portal Unico ou manual)
                                ↓
                          Detalhe do LPCO (acompanhar — sync via webhooks)
                                ↓
                     Exigencia recebida → Responder (via Gravity ou Portal)
                                ↓
                          Deferida → Vincular a Processo
```

### Componentes Novos Necessarios

| Componente | Descricao | Complexidade |
|-----------|-----------|-------------|
| EscolhaCanalLpco | Step 0: cards para escolha de canal de entrada | P |
| FormularioDinamico | Renderiza campos baseado em JSON schema do orgao | G |
| TimelineLpco | Timeline vertical de eventos do historico | M |
| SaldoIndicador | Barra de progresso: deferido vs consumido vs disponivel | P |
| StepperLpco | Wizard de 4 passos (Step 0 + 3 steps) | P |
| ImportPlanilhaLpco | Upload + mapeamento de colunas + preview | M |
| SmartReadLpco | Upload doc → preview de extracao (amarelo) → confirmacao | M |
| ConfigCredenciais | Upload certificado digital / config token OAuth2 | M |

---

## 5. Arquitetura (Tech Lead — 15 min)

### Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React + TypeScript + Vite (port 5012) |
| Backend | Express + TypeScript (port 4012) |
| ORM | Prisma com RLS |
| Validacao | Zod |
| Auth Gravity | Clerk (JWT) + x-internal-key (S2S) |
| Auth Portal Unico | Certificado digital (mTLS) + Token OAuth2 — strategy pattern |
| Criptografia | AES-256-GCM (certificados, senhas, OAuth secrets) |
| OCR+IA | Smart Read (ja existente no Gravity) |
| Storage | S3/R2 (documentos + certificados criptografados) |

### Modelos Prisma

7 models: `Lpco`, `LpcoItem`, `LpcoExigencia`, `LpcoVinculo`, `LpcoDocumento`, `LpcoHistorico`, `SiscomexCredencial`

Todos com `tenant_id` + `company_id` + 3 indices obrigatorios.

### Engines e Services

| Engine/Service | Responsabilidade |
|--------|-----------------|
| `lpcoStatusEngine` | Maquina de estados com validacao de transicoes |
| `lpcoSaldoEngine` | Controle de saldo para LPCO Flex |
| `lpcoCancelamentoJob` | Cron diario: cancela LPCOs >90 dias em exigencia |
| `lpcoAlertaService` | Gera alertas em 60, 80, 90 dias + cert expirando |
| `lpcoImportService` | Parser de Excel/CSV → validacao → criacao em lote |
| `lpcoSmartReadService` | Orquestrador: upload → Smart Read → rascunho |
| `portalUnicoAdapter` | Adapter bidirecional com API do Portal Unico |
| `portalUnicoAuth` | Strategy: certificado digital vs token OAuth2 |
| `simuladorTAConnector` | Consulta tratamento administrativo via API |

### Integracao com Gravity

| Servico | Direcao | Tipo |
|---------|---------|------|
| Portal Unico Siscomex | LPCO ↔ Portal | API bidirecional + 15 webhooks |
| Processo | LPCO → Processo | Vinculo (LpcoVinculo.processo_id) |
| Pedido | LPCO ← Pedido | Auto-preenchimento (canal "Pedido") |
| Smart Read | LPCO ← Smart Read | OCR+IA de documentos |
| API Cockpit | LPCO ← ERP/COMEX | Tokens + docs + playground |
| Configurador | LPCO ← Config | Check-access, permissoes |
| Notificacoes | LPCO → Notif | Alertas de prazo |
| Email | LPCO → Email | Exigencia, cancelamento |
| Historico | LPCO → Hist | Audit trail |

### O que reutilizar (ja existe)

- **8 servicos:** Notificacoes, Email, Historico, Dashboard, Configurador, API Cockpit, Conector ERP, Smart Read
- **8 componentes nucleo-global:** TabelaGlobal, CaixaSelectGlobal, InputTexto, ModalGlobal, BadgeStatus, BotaoGlobal, Loading, TabsGlobal

### O que criar do zero

- **10 backend:** statusEngine, saldoEngine, cancelamentoJob, alertaService, importService, smartReadService, portalUnicoAdapter, portalUnicoAuth, simuladorTAConnector, cryptoUtils
- **8 frontend:** FormularioDinamico, TimelineLpco, SaldoIndicador, StepperLpco, EscolhaCanalLpco, ImportPlanilhaLpco, SmartReadLpco, ConfigCredenciais

---

## 6. Criterios de Aceite (BA — 10 min)

### Formato

Todos os criterios seguem Gherkin. Exemplos dos mais criticos:

#### CA-001: Criar LPCO em rascunho

```gherkin
Dado que o usuario esta logado com permissao "lpco:create"
  E esta na tela "Novo LPCO"
Quando seleciona tipo_operacao "IMPORTACAO"
  E seleciona orgao_anuente "ANVISA"
  E seleciona modelo_lpco "I00004"
  E preenche pais_procedencia "CN"
  E preenche fundamento_legal "Portaria ANVISA 344/98"
  E clica em "Proximo"
Entao o sistema salva como rascunho
  E avanca para Step 2 (Itens)
```

#### CA-035: Controle de saldo LPCO Flex

```gherkin
Dado que existe LPCO Flex deferida com quantidade_deferida = 1000 kg
  E ja existem vinculos totalizando 700 kg
  E saldo_disponivel = 300 kg
Quando usuario tenta criar vinculo com quantidade = 400 kg
Entao o sistema rejeita com erro "Saldo insuficiente. Disponivel: 300 kg"
  E nenhum vinculo e criado
```

#### CA-042: Cancelamento automatico

```gherkin
Dado que LPCO esta em status "em_exigencia"
  E data_ultima_exigencia foi ha 90 dias
Quando cron job de cancelamento executa
Entao o status muda para "cancelada"
  E LpcoHistorico registra evento "cancelamento_automatico_90_dias"
  E notificacao e enviada ao usuario
  E email e enviado ao usuario
```

#### CA-048: Lista com filtros

```gherkin
Dado que o usuario esta na Lista de LPCOs
  E existem 50 LPCOs no tenant
Quando filtra por status "em_exigencia"
  E filtra por orgao "ANVISA"
Entao apenas LPCOs que atendem AMBOS filtros sao exibidos
  E contagem total e atualizada
  E paginacao reflete o resultado filtrado
```

---

## 7. Metricas e Riscos (Data Analyst + PM — 5 min)

### Metricas de Sucesso

| KPI | Meta | Instrumentacao |
|-----|------|---------------|
| Tempo de preparacao | < 3 min (Smart Read), < 5 min (Pedido), < 15 min (manual) | created_at → data_registro |
| Cancelamentos por esquecimento | 0% | LpcoHistorico: cancelamento_automatico |
| Tempo de resposta a exigencia | < 48h | data_exigencia → data_resposta |
| LPCOs/analista/mes | +50% | Count por user_id |
| NPS | > 40 | Pesquisa trimestral |

### Top 5 Riscos

| Risco | Mitigacao |
|-------|----------|
| Atributos de formulario mudam sem aviso | JSON schema dinamico, atualizavel sem deploy |
| 16 orgaos × N modelos = complexidade alta | MVP com top 5 orgaos; demais progressivamente |
| API Portal Unico instavel | Adapter pattern + 3 modos (cert/token/manual) |
| Token OAuth2 com escopo limitado | Strategy: certificado para escrita, token para leitura |
| Certificado digital vence sem aviso | Alerta 30 dias antes + dashboard de credenciais |

---

## Indice de Artefatos — Handoff Completo

| # | Artefato | Responsavel | Arquivo |
|---|---------|-------------|---------|
| 1 | SKILL (regras de negocio) | PM + SME | `skills/produtos/lpco/SKILL.md` |
| 2 | PRD (13 secoes) | PM | `documentos-tecnicos/produto/lpco/PRD.md` |
| 3 | Arquitetura Tecnica | Tech Lead | `documentos-tecnicos/produto/lpco/ARQUITETURA.md` |
| 4 | Handoff | PM | `documentos-tecnicos/produto/lpco/HANDOFF.md` |
| 5 | Backlog Priorizado (23 stories, RICE) | PM | `documentos-tecnicos/produto/lpco/BACKLOG.md` |
| 6 | Criterios de Aceite (Gherkin) | Business Analyst | `documentos-tecnicos/produto/lpco/CRITERIOS-ACEITE.md` |
| 7 | Metricas e Instrumentacao | Data Analyst | `documentos-tecnicos/produto/lpco/METRICAS.md` |
| 8 | Specs por Tela (15 telas) | Designer + Tech Lead | `documentos-tecnicos/produto/lpco/SPECS-TELAS.md` |
| 9 | Sign-Off Regulatorio | SME | `documentos-tecnicos/produto/lpco/SIGNOFF-REGULATORIO.md` |
| 10 | Scaffold de Codigo (36 arquivos) | Tech Lead | `produto/lpco/` |
| 11 | Registro em contracts.json | Tech Lead | `servicos-global/contracts.json` (porta 8027) |

---

## Contatos e Suporte

| Assunto | Quem Procurar |
|---------|--------------|
| Duvidas de produto/escopo | PM |
| Regras de negocio COMEX | SME |
| Design/telas | Designer |
| Arquitetura tecnica | Tech Lead |
| Dados/metricas | Data Analyst |
| Comportamento do usuario | UX Researcher |
| Criterios de aceite | Business Analyst |
| Aprovacao do dono | PM (intermedia) |

---

## Sessao de Handoff (obrigatoria)

**Duracao:** 60-90 minutos

### Agenda

1. **Contexto** (PM — 10 min): Problema, publico, motivacao
2. **Regras de negocio** (SME — 10 min): Top 5 regras + armadilhas (cancelamento 90 dias, formularios dinamicos)
3. **Telas e fluxos** (Designer — 15 min): Walk-through visual completo (11 telas)
4. **Arquitetura** (Tech Lead — 15 min): 6 models, 4 engines, mapa de reutilizacao
5. **Criterios de aceite** (BA — 10 min): Gherkin dos cenarios criticos
6. **Metricas** (Data Analyst — 5 min): KPIs e instrumentacao
7. **Q&A** (Todos — 15-25 min): Perguntas do tech team
