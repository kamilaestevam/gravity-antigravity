# PRD — LPCO (Licencas, Permissoes, Certificados e Outros) v1.0

> **Versao:** 1.0
> **Data:** 30/03/2026
> **Status:** Entregue — Handoff aprovado 30/03/2026
> **Product Owner:** Daniel Mendes
> **Elaborado por:** Dream Team de Produtos (8 agentes)

---

## 1. Sumario Executivo

**LPCO** e o produto do Gravity para gestao de Licencas, Permissoes, Certificados e Outros Documentos exigidos pelos orgaos anuentes do governo brasileiro para operacoes de comercio exterior. O produto permite preparar, acompanhar, responder exigencias e vincular LPCOs a processos de importacao/exportacao — eliminando planilhas, e-mails e controle manual.

**Problema:** Importadores e exportadores gastam horas preenchendo formularios no Portal Unico Siscomex, perdendo LPCOs por cancelamento automatico (90 dias sem resposta), sem visibilidade centralizada do status de dezenas de documentos simultaneos, e sem rastreabilidade para auditoria.

**Solucao:** Plataforma de gestao e integracao com o Portal Unico que oferece 5 canais de entrada de dados ("entre como quiser"), integracao bidirecional via API (certificado digital + token OAuth2), alertas inteligentes e vinculacao ao ecosistema Gravity (Pedido, Processo, SimulaCusto). Smart Read (OCR+IA) e integracao ERP via API Cockpit ja estao prontos no Gravity.

**Metrica de sucesso:** Reducao de 90% no tempo de preparacao de LPCOs (de 30-60 min para 3 min com Smart Read) e zero cancelamentos automaticos por esquecimento.

---

## 2. Contexto e Motivacao

### Por que agora

- **Outubro 2025:** Todos os 16 orgaos anuentes concluiram migracao para o Portal Unico — o LPCO e agora o unico caminho para licenciamento
- **Portaria SECEX 77/2021:** LPCO substituiu definitivamente a antiga Licenca de Importacao (LI)
- **Dor validada:** Empresas de COMEX gerenciam dezenas de LPCOs simultaneos sem ferramenta dedicada
- **Integracao natural:** O Gravity ja possui Pedido (gestao de pedidos) e Processo (logistica) — LPCO fecha o ciclo de compliance

### Dados de mercado

| Metrica | Valor |
|---------|-------|
| Empresas habilitadas no Siscomex | ~80.000 |
| LPCOs registrados/ano (estimativa) | ~2 milhoes |
| Orgaos anuentes integrados | 16 |
| Taxa de cancelamento por inatividade | ~15% (estimativa do mercado) |
| Tempo medio de deferimento | 7-30 dias |

### O que existe hoje

- **Portal Unico Siscomex:** Interface governamental — funcional mas nao gerencial
- **Planilhas:** Maioria das empresas controla LPCOs em Excel
- **ERPs:** Alguns ERPs de COMEX tem modulo basico de LI/LPCO, mas sem integracao profunda

### Oportunidade

Nenhum sistema de mercado oferece gestao completa de LPCOs com:
1. **5 canais de entrada** — digite, importe planilha, use o Pedido, Smart Read (OCR+IA), ou integre via API
2. **Smart Read** — upload de fatura/packing list/laudo → IA extrai 90% dos campos
3. **Integracao Portal Unico** — certificado digital + token OAuth2 (novo!) via strategy pattern
4. **Alertas inteligentes** (prazo de exigencia, vigencia expirando)
5. **Controle de saldo** de LPCO Flex com vinculacao a processos
6. **API Cockpit** — ERP/SAP/sistema COMEX envia dados direto via API REST
7. **Dashboard de compliance** para gestores

---

## 3. Publico-Alvo

### Persona 1: Ana — Analista de Importacao

- 28 anos, graduada em Comercio Exterior, 4 anos de experiencia
- Importadora mid-market, 20-40 processos/mes
- **JTBD Funcional:** "Quando preciso importar um produto que exige anuencia, quero preparar o LPCO rapidamente, registrar no Portal Unico e acompanhar ate o deferimento sem perder prazos"
- **JTBD Emocional:** "Quero parar de ter medo de esquecer uma exigencia e perder o LPCO por cancelamento"
- **Dores:**
  - Preenche formularios complexos com dezenas de campos por orgao anuente
  - Nao tem visao consolidada de todos os LPCOs pendentes
  - Perde LPCOs por cancelamento automatico (90 dias sem resposta a exigencia)
  - Nao sabe quais NCMs exigem LPCO ate consultar o simulador manualmente
  - Retrabalho quando orgao formula exigencia e precisa refazer documentacao

### Persona 2: Roberto — Despachante Aduaneiro

- 45 anos, despachante ha 20 anos, 5 clientes fixos
- Gerencia ~100 processos/mes para multiplos importadores
- **JTBD Funcional:** "Quero ver todos os LPCOs de todos os meus clientes em um unico painel, com alertas de vencimento"
- **JTBD Emocional:** "Quero demonstrar profissionalismo e controle para nao perder clientes"
- **Dores:**
  - Gerencia LPCOs de multiplas empresas em planilhas separadas
  - Cada orgao anuente tem formulario diferente — precisa lembrar de cada um
  - Sem historico centralizado para responder auditorias

### Persona 3: Marcela — Gerente de Compliance

- 38 anos, MBA em Compliance, 12 anos em trading company
- Empresa com 500+ processos/mes, equipe de 8 analistas
- **JTBD Funcional:** "Quero dashboard com KPIs de LPCOs: quantos pendentes, tempo medio de deferimento, taxa de indeferimento por orgao"
- **JTBD Emocional:** "Quero provar para a diretoria que estamos em compliance e sem riscos"
- **Dores:**
  - Sem metricas de compliance para LPCOs
  - Nao sabe o tempo medio de deferimento por orgao anuente
  - Dificuldade em auditorias — historico disperso em emails e Portal Unico

### Persona 4: Paulo — Exportador (Agronegocio)

- 50 anos, diretor de trading de commodities agricolas
- Exporta graos, carnes — MAPA e IBAMA frequentes
- **JTBD Funcional:** "Quero que minha equipe prepare os LPCOs com antecedencia, integrados aos pedidos de exportacao, sem atrasar o embarque"
- **JTBD Emocional:** "Nao quero perder um navio por falta de certificado fitossanitario"
- **Dores:**
  - LPCOs de exportacao atrasam embarques
  - Nao tem visibilidade se o LPCO vai ficar pronto a tempo do booking
  - Certificados do MAPA exigem documentacao especifica que se perde em emails

---

## 4. Regras de Negocio

### Regulatorio (validadas pelo SME)

| RN | Regra | Base Legal | Excecoes |
|----|-------|-----------|----------|
| RN-001 | Todo LPCO e registrado no Portal Unico Siscomex | Portaria SECEX 19/2019 (exp) e 77/2021 (imp) | Nenhuma |
| RN-002 | Orgaos anuentes tem 30 dias para manifestacao | Lei 9.784/1999 | Pode ser maior por regulamento especifico |
| RN-003 | LPCO em exigencia por >90 dias e cancelada automaticamente | Norma Portal Unico | Nenhuma — usuario deve monitorar |
| RN-004 | LPCO de importacao exige produto no Catalogo de Produtos | Portaria SECEX 77/2021 | LPCO de exportacao nao exige |
| RN-005 | LPCO Flex pode ser vinculada a multiplas operacoes dentro do saldo | Portal Unico | Saldo zerado ou vigencia expirada bloqueia novos vinculos |
| RN-006 | Cada NCM pode exigir anuencia de 1 ou mais orgaos simultaneamente | Tratamento Administrativo | Um produto pode gerar multiplos LPCOs (1 por orgao) |
| RN-007 | Atributos de formulario variam por modelo/orgao e podem mudar via comunicado | Comunicados Siscomex | Sistema deve suportar formularios dinamicos |
| RN-008 | Documentos comprobatorios so podem ser anexados apos registro do LPCO | Regra Portal Unico | Gravity permite preparar documentos no rascunho |

### Operacional

| RN | Regra |
|----|-------|
| RN-009 | Um LPCO pertence a exatamente uma empresa (company_id) dentro de um tenant |
| RN-010 | Status so transita via `lpcoStatusEngine` — nunca update direto |
| RN-011 | Toda transicao de status gera registro em `LpcoHistorico` (append-only, imutavel) |
| RN-012 | LPCO `deferida` com vinculos ativos nao pode ser cancelada pelo usuario |
| RN-013 | Saldo de LPCO Flex = quantidade_deferida - SUM(quantidade_vinculada) |
| RN-014 | Vinculo a LPCO Flex rejeitado se saldo insuficiente OU vigencia expirada |
| RN-015 | IDs seguem formato corporativo: `lpco_id_XXXXXXX/YY` |
| RN-016 | Cancelamento automatico roda diariamente via cron job |

### Classificacao de Tratamento Administrativo

| Modalidade | Descricao | Precisa de LPCO? |
|-----------|-----------|-----------------|
| Monitoramento | Orgao acompanha sem intervir | Nao |
| Autorizacao (LPCO) | Manifestacao previa obrigatoria | **Sim** |
| Conferencia (DUIMP) | Verificacao durante despacho | Nao (mas pode ter LPCO) |
| Proibicao | Importacao vedada por lei | N/A |

---

## 5. Requisitos Funcionais

### MVP (Fase 1)

| ID | Requisito | Prioridade | Complexidade | Criterios de Aceite |
|----|-----------|-----------|-------------|-------------------|
| RF-001 | Criar LPCO em rascunho com dados basicos | Must-have | M | CA-001 a CA-005 |
| RF-002 | Preencher itens NCM com quantidades, valores e atributos | Must-have | G | CA-006 a CA-012 |
| RF-003 | Validar LPCO antes de registrar (pre-validacao Zod) | Must-have | M | CA-013 a CA-015 |
| RF-004 | Registrar LPCO (transitar para `para_analise`) | Must-have | M | CA-016 a CA-018 |
| RF-005 | Acompanhar status do LPCO (dashboard de status) | Must-have | M | CA-019 a CA-022 |
| RF-006 | Responder exigencias do orgao anuente | Must-have | M | CA-023 a CA-026 |
| RF-007 | Anexar documentos comprobatorios | Must-have | P | CA-027 a CA-029 |
| RF-008 | Vincular LPCO a Processo (DUIMP/DU-E) | Must-have | G | CA-030 a CA-034 |
| RF-009 | Controlar saldo de LPCO Flex | Must-have | G | CA-035 a CA-038 |
| RF-010 | Cancelar LPCO manualmente | Must-have | P | CA-039 a CA-041 |
| RF-011 | Cancelamento automatico (90 dias em exigencia) | Must-have | M | CA-042 a CA-044 |
| RF-012 | Historico completo do LPCO (timeline) | Must-have | M | CA-045 a CA-047 |
| RF-013 | Lista de LPCOs com filtros, busca e ordenacao | Must-have | M | CA-048 a CA-052 |
| RF-014 | Simulador de tratamento administrativo (NCM → orgaos) | Should-have | G | CA-053 a CA-056 |
| RF-015 | Alertas de prazo (exigencia pendente, vigencia expirando) | Should-have | M | CA-057 a CA-060 |
| RF-016 | Duplicar LPCO existente (modelo como base) | Should-have | P | CA-061 a CA-062 |
| RF-017 | Criar LPCO a partir de Pedido (auto-preenchimento ~70%) | Must-have | M | CA-063 a CA-066 |
| RF-018 | Criar LPCO via Smart Read (OCR+IA de fatura/packing/laudo) | Must-have | G | CA-067 a CA-072 |
| RF-019 | Importar LPCOs via planilha (Excel/CSV) em lote | Must-have | M | CA-073 a CA-076 |
| RF-020 | API Cockpit — ERP/sistema COMEX cria LPCOs via API | Must-have | M | CA-077 a CA-080 |
| RF-021 | Integracao bidirecional com API Portal Unico (registrar, consultar, responder) | Must-have | GG | CA-081 a CA-088 |
| RF-022 | Infraestrutura de certificado digital (upload .pfx, AES-256, auto-refresh JWT) | Must-have | G | CA-089 a CA-093 |
| RF-023 | Autenticacao por token OAuth2 gov.br/Serpro (consulta + escrita se permitido) | Must-have | G | CA-094 a CA-097 |
| RF-024 | Webhooks do Portal Unico (15 eventos → sync automatico de status) | Must-have | G | CA-098 a CA-102 |

### Fase 2

| ID | Requisito | Prioridade | Complexidade | Depende de |
|----|-----------|-----------|-------------|-----------|
| RF-030 | Dashboard de compliance (KPIs por orgao, tempo medio) | Must-have | G | RF-005 |
| RF-031 | Importacao de dados do Catalogo de Produtos (sync bidirecional) | Should-have | M | RF-002 |
| RF-032 | Templates de LPCO por orgao/modelo (presets) | Should-have | M | RF-016 |
| RF-033 | Registro direto no Portal Unico (1-click: rascunho → registrado) | Must-have | G | RF-021 |

### Fase 3

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-040 | Preenchimento assistido por IA (Gabi) — "cria LPCO ANVISA para o pedido X" |
| RF-041 | Predicao de tempo de deferimento por orgao (ML baseado em historico) |
| RF-042 | Workflow de aprovacao interna antes de registrar |
| RF-043 | Integracao bidirecional ERP — push de status do LPCO para SAP/ERP |

---

## 6. Requisitos Nao-Funcionais

| ID | Requisito | Criterio | Prioridade |
|----|-----------|---------|-----------|
| RNF-001 | Performance | Listagem de LPCOs < 200ms (ate 1000 registros) | Must-have |
| RNF-002 | Performance | Formulario dinamico renderiza < 500ms (ate 50 atributos) | Must-have |
| RNF-003 | Escalabilidade | Suportar 10.000 LPCOs/tenant sem degradacao | Must-have |
| RNF-004 | Disponibilidade | 99,9% uptime | Must-have |
| RNF-005 | Seguranca | Tenant isolation em toda query (zero-trust) | Must-have |
| RNF-006 | Seguranca | Anti-enumeracao: 404 para cross-tenant | Must-have |
| RNF-007 | Auditoria | Historico append-only com timestamp e user_id | Must-have |
| RNF-008 | Acessibilidade | WCAG 2.1 AA | Must-have |
| RNF-009 | Responsividade | Desktop (1280+), Tablet (768-1279), Mobile (<768) | Must-have |
| RNF-010 | Internacionalizacao | Preparado para pt-BR (MVP), en-US (Fase 2) | Should-have |

---

## 7. Fluxos de Usuario

### Fluxo Principal — Criar LPCO (5 canais)

```
1. Usuario acessa Lista de LPCOs
2. Clica em "+ Novo LPCO"
3. Step 0 — "Como voce quer criar?"
   a) Digitar manual → Step 1
   b) A partir de Pedido → Seleciona Pedido → auto-preenche → Step 1
   c) Smart Read → Upload fatura/packing/laudo → OCR+IA → preview → Step 1
   d) Planilha → Upload Excel/CSV → mapeamento → preview → cria N rascunhos
   e) Duplicar existente → Seleciona LPCO → copia → Step 1
4. Step 1: Dados gerais (orgao, modelo, pais, fundamento legal)
   - Se veio do Pedido: ~70% ja preenchido
   - Se veio do Smart Read: campos extraidos em amarelo para confirmacao
5. Step 2: Itens NCM (quantidades, valores, atributos dinamicos do orgao)
6. Step 3: Revisao final + validacao Zod
7. Registrar:
   - Se credencial Portal Unico configurada → registra via API automaticamente
   - Se nao → usuario registra no Portal manualmente, atualiza status no Gravity
8. Acompanhar: status sincronizado via API ou webhook (se integrado)
9. Se EM_EXIGENCIA → responde com documentos/info (via Gravity ou Portal)
10. Quando DEFERIDA → pode vincular a Processo
```

### Fluxo — Integracao via API (ERP/Sistema COMEX)

```
1. Sistema externo obtem token via API Cockpit (gv_live_sk_xxxxx)
2. POST /api/v1/lpcos com todos os dados + canal_entrada="API"
3. Gravity valida (Zod) → cria rascunho ou registra direto
4. Se credencial Portal Unico configurada → pode registrar automaticamente
5. Webhooks do Gravity notificam o ERP sobre mudancas de status
```

### Fluxo Secundario — Vincular LPCO Flex a Processo

```
1. Usuario acessa LPCO Flex deferida
2. Clica em "Vincular a Processo"
3. Seleciona Processo (DUIMP/DU-E) do Gravity
4. Informa quantidade a consumir do saldo
5. Sistema valida: saldo >= quantidade E vigencia OK
6. Cria LpcoVinculo → decrementa saldo
7. Mostra saldo atualizado
```

### Fluxo de Alerta — Exigencia Pendente

```
1. Cron job verifica LPCOs EM_EXIGENCIA
2. Se dias_sem_resposta > 60 → alerta amarelo
3. Se dias_sem_resposta > 80 → alerta vermelho
4. Se dias_sem_resposta >= 90 → cancela automaticamente
5. Notificacao in-app + email a cada alerta
```

---

## 8. Wireframes e Telas

### Mapa de Telas — MVP

| # | Tela | Rota | Descricao |
|---|------|------|-----------|
| T-00 | Escolha de Canal | `/lpco/novo` | Step 0: "Como voce quer criar?" — 5 cards de canal |
| T-01 | Lista de LPCOs | `/lpco` | Grid com filtros por status, orgao, tipo, operacao, canal |
| T-02 | Novo LPCO — Dados Gerais | `/lpco/novo/dados` | Step 1: tipo, orgao, modelo, dados basicos |
| T-03 | Novo LPCO — Itens | `/lpco/novo/itens` | Step 2: NCMs, quantidades, valores, atributos |
| T-04 | Novo LPCO — Revisao | `/lpco/novo/revisao` | Step 3: revisao final + validacao + registrar |
| T-05 | Import Planilha | `/lpco/novo/planilha` | Upload → mapeamento colunas → preview → confirmar |
| T-06 | Smart Read | `/lpco/novo/smart-read` | Upload docs → preview extracao (amarelo) → confirmar |
| T-07 | Detalhe do LPCO | `/lpco/:id` | Visao completa com abas |
| T-08 | Aba Formulario | `/lpco/:id/formulario` | Dados preenchidos (readonly se registrado) |
| T-09 | Aba Documentos | `/lpco/:id/documentos` | Upload e lista de documentos |
| T-10 | Aba Exigencias | `/lpco/:id/exigencias` | Lista de exigencias + resposta |
| T-11 | Aba Vinculos | `/lpco/:id/vinculos` | Processos vinculados + saldo (Flex) |
| T-12 | Aba Historico | `/lpco/:id/historico` | Timeline de eventos |
| T-13 | Simulador TA | `/lpco/simulador` | NCM → orgaos anuentes → modelos |
| T-14 | Credenciais Siscomex | `/lpco/configuracoes` | Config certificado digital / token OAuth2 |

---

## 9. Integracoes com Ecosistema Gravity

| Integracao | Tipo | Produto/Servico | Descricao |
|-----------|------|----------------|-----------|
| Portal Unico Siscomex | API bidirecional | API governamental | Registrar, consultar, responder, webhooks |
| Processo | Vinculo bidirecional | produto/processo | LPCO vinculada a DUIMP/DU-E |
| Pedido | Auto-preenchimento | produto/pedido | Canal "Pedido" → preenche ~70% dos campos |
| SimulaCusto | Consulta | produto/simula-custo | Verificar se NCM exige LPCO |
| Smart Read | OCR+IA | servico existente | Extracao de dados de faturas/packing/laudos |
| API Cockpit | Tokens + docs | servicos-global | ERP/SAP/sistema COMEX envia dados via API |
| Conector ERP | OData/REST | servicos-global | Import de dados do sistema do cliente |
| Catalogo de Produtos | Dependencia | servicos-global | NCMs + atributos do produto |
| Historico | Auditoria | servicos-global/tenant | Eventos do ciclo de vida |
| Notificacoes | Alertas | servicos-global/tenant | Status, exigencias, prazos |
| Email | Comunicacao | servicos-global/tenant | Alertas criticos por email |
| Dashboard | KPIs | servicos-global/tenant | Widgets de compliance LPCO |

---

## 10. Metricas de Sucesso

| KPI | Meta | Como Medir |
|-----|------|-----------|
| Tempo medio de preparacao de LPCO | < 3 min com Smart Read, < 5 min com Pedido, < 15 min manual (vs 30-60 min Portal Unico) | Timestamp criacao → registro |
| Taxa de cancelamento por inatividade | 0% (vs ~15% mercado) | LPCOs canceladas automaticamente / total |
| Tempo medio de resposta a exigencia | < 48h (vs dias/semanas) | Timestamp exigencia → resposta |
| LPCOs gerenciados por analista/mes | +50% vs baseline | Count por user_id/mes |
| Satisfacao do usuario (NPS) | > 40 | Pesquisa in-app trimestral |
| Uptime do servico | 99,9% | Health check monitoring |

---

## 11. Cronograma e Fases

| Fase | Escopo | Estimativa | Dependencia |
|------|--------|-----------|-------------|
| MVP (Fase 1) | RF-001 a RF-024 — gestao completa + 5 canais de entrada + integracao Portal Unico + certificado/token | 10-12 semanas | Catalogo de Produtos funcional |
| Fase 2 | RF-030 a RF-033 — dashboard compliance + sync Catalogo + templates + 1-click registro | 4-6 semanas | MVP validado |
| Fase 3 | RF-040 a RF-043 — Gabi IA, predicao ML, workflow aprovacao, push ERP | 4-6 semanas | Fase 2 validada |

---

## 12. Riscos e Mitigacoes

| Risco | Prob. | Impacto | Mitigacao |
|-------|-------|---------|----------|
| API Portal Unico instavel ou com mudancas frequentes | Alta | Alto | Adapter pattern isola mudancas; 3 modos de operacao (certificado/token/manual) |
| Atributos de formulario mudam via comunicado sem aviso | Alta | Medio | Formularios dinamicos com schema JSON, atualizavel sem deploy |
| Complexidade de 16 orgaos × N modelos cada | Media | Alto | Comecar com top 5 orgaos mais usados; demais progressivamente |
| Credenciais de API Siscomex dificeis de obter | Media | Alto | 3 modos: certificado, token OAuth2 (novo!), ou manual |
| Token OAuth2 com escopo limitado (so consultas) | Media | Medio | Strategy pattern: usa certificado para escrita, token para leitura |
| Certificado digital vence sem aviso | Media | Alto | Alerta 30 dias antes + dashboard de credenciais |
| Volume de dados alto (10k+ LPCOs/tenant) | Baixa | Medio | Paginacao server-side; indices otimizados |

---

## 13. Decisoes Tomadas

| # | Decisao | Data | Contexto | Alternativa Descartada |
|---|---------|------|----------|----------------------|
| D-001 | MVP COM integracao Portal Unico + 5 canais de entrada | 30/03/2026 | Smart Read e API Cockpit ja prontos; adapter pattern mitiga instabilidade da API | Esperar para Fase 2 (perdia diferencial competitivo) |
| D-002 | Formularios dinamicos via JSON schema | 30/03/2026 | Atributos mudam por comunicado Siscomex | Formularios hardcoded por orgao (nao escalavel) |
| D-003 | LPCO como produto separado (nao modulo do Processo) | 30/03/2026 | Complexidade propria; ciclo de vida independente | Modulo dentro de Processo (acoplamento excessivo) |
| D-004 | Suporte imp + exp na mesma tabela com discriminador | 30/03/2026 | Consistencia com Pedido; evita duplicacao de codigo | Tabelas separadas (mais complexo) |
| D-005 | Top 5 orgaos no MVP, demais progressivamente | 30/03/2026 | 16 orgaos de uma vez e inviavel; 80/20 | Todos os 16 orgaos no MVP (scope creep) |
| D-006 | Smart Read no MVP (nao Fase 3) | 30/03/2026 | Smart Read ja funciona no Gravity; e o diferencial #1 de UX | Deixar para depois (perdia vantagem competitiva) |
| D-007 | Certificado digital + token OAuth2 (strategy pattern) | 30/03/2026 | Portal Unico lancou token recentemente; certificado continua sendo o padrao | Apenas certificado (excluia empresas sem certificado) |
| D-008 | 3 modos de operacao (integrado cert / integrado token / manual) | 30/03/2026 | Garante que o produto funciona para qualquer empresa, com ou sem credenciais | Exigir credencial (excluia quem nao tem) |
| D-009 | Credenciais com AES-256-GCM (mesmo padrao API Cockpit) | 30/03/2026 | Certificado digital e ativo sensivel; padrao ja existe no Conector ERP | Inventar nova criptografia (desnecessario) |
