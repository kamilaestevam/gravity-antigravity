# PRD — BID Cambio v1.0

> **Versao:** 1.0
> **Data:** 29/03/2026
> **Status:** Fase 2 — Especificacao
> **Product Owner:** Daniel Mendes
> **Elaborado por:** Dream Team de Produtos (8 agentes)

---

## 1. Sumario Executivo

**BID Cambio** e uma plataforma de gestao e cotacao de cambio comercial para operacoes de COMEX. Combina dois pilares: (1) gestao completa do ciclo de vida de parcelas de cambio (pendente -> agendado -> pago), com controle financeiro, alertas e rastreabilidade; e (2) marketplace que conecta compradores (importadores, exportadores, tradings, agentes de carga) a corretoras de cambio e bancos para cotacao competitiva de taxas.

**Modelo de negocio:** Gratuito para compradores. Monetizacao exclusivamente nas corretoras de cambio.

**Duas visoes separadas:** Portal do Comprador e Portal da Corretora, com logins, dashboards e experiencias independentes.

**Integracao:** Funciona standalone ou integrado aos demais produtos Gravity (Processo, BID Frete, SimulaCusto) via servicos tenant.

---

## 2. Contexto e Motivacao

Empresas de COMEX no Brasil movimentam ~USD 500 bi/ano em cambio comercial. PMEs e mid-market (sem mesa de cambio propria) cotam manualmente — ligam para corretoras, recebem taxas por WhatsApp, anotam em planilhas, perdem janelas de taxa por demora, e nao tem rastreabilidade para compliance BACEN.

O sistema legado (DATI) ja possui um modulo de controle de cambio com funcionalidades maduras (parcelas, agendamento, pagamento, e-mails), mas sem marketplace de cotacao e sem design moderno.

**Oportunidade:** Nenhum concorrente oferece um marketplace B2B de cambio comercial integrado a gestao de parcelas e ao ecossistema de COMEX (frete + fiscal + processo).

---

## 3. Publico-Alvo

### Persona 1: Carlos — Analista de Cambio (Importador)
- 32 anos, Comercio Exterior, 6 anos de experiencia
- Importadora mid-market, 30-50 operacoes/mes
- **JTBD Funcional:** "Quando preciso fechar cambio para pagar uma DI, quero comparar taxas de pelo menos 3 corretoras em <5 min"
- **JTBD Emocional:** "Quero ter certeza de que consegui a melhor taxa"
- **Dores:** Liga para 3-5 corretoras; anota em Post-it; perde taxa por demora; sem historico; compliance pede documentos que nao encontra

### Persona 2: Fernanda — Gerente Financeira (Trading Company)
- 41 anos, MBA Financas, 15 anos em COMEX
- Trading, 200+ operacoes/mes
- **JTBD Funcional:** "Quero ver dashboard com spread medio e economia acumulada para reportar a diretoria"
- **JTBD Emocional:** "Quero parar de depender do feeling do analista"
- **Dores:** Sem visibilidade do spread real; auditoria e pesadelo; nao sabe se analista cota com melhores corretoras

### Persona 3: Ricardo — Agente de Carga
- 38 anos, despachante aduaneiro, 10 anos
- **JTBD Funcional:** "Quero oferecer cotacao de cambio integrada ao frete para nao perder o servico"
- **Dores:** Nao tem ferramenta; perde receita de intermediacao

### Persona 4: Marina — Operadora de Corretora de Cambio
- 29 anos, corretora de cambio especializada em COMEX
- **JTBD Funcional:** "Quero receber solicitacoes de cotacao e responder rapidamente para ganhar o fechamento"
- **JTBD Emocional:** "Quero visibilidade sobre minha performance e taxa de aprovacao"
- **Dores:** Depende de WhatsApp para receber pedidos; nao sabe taxa de conversao; sem pipeline organizado

---

## 4. Regras de Negocio

### Regulatorio (validadas pelo SME)

| RN | Regra | Base Legal | Excecoes |
|----|-------|-----------|----------|
| RN-001 | Toda operacao de cambio comercial requer contrato de cambio | Res. BCB 277/2022 | Operacoes <USD 50k podem usar boleto simplificado |
| RN-002 | Taxa tem validade em minutos, nao horas | Pratica de mercado | Sistema deve exibir countdown de validade |
| RN-003 | IOF: 0,38% (comercial), 1,1% (financeiro) | Dec. 6.306/2007 | Aliquota pode mudar por decreto |
| RN-004 | Liquidacao D+0, D+1 ou D+2 conforme contrato | Res. BCB 277 | Impacta fluxo de caixa |
| RN-005 | Operacoes >USD 50.000 antecipadas requerem registro BACEN (ROF) | Res. BCB 277 | Multa pesada se nao registrar |
| RN-006 | Spread = taxa cotada - PTAX | Pratica de mercado | PTAX e D-1, referencia contabil |
| RN-007 | Vinculacao cambio-DI obrigatoria para importacao | IN SRF 680/2006 | N do contrato vai na DI/DUIMP |
| RN-008 | Mercado opera 9h-17h (Brasilia) | BCB | Cotacoes fora do horario sao indicativas |

### Gestao de Parcelas (do legado — regras validadas)

| RN | Regra |
|----|-------|
| RN-100 | Parcelas divididas por % do cambio total, soma = 100%, duas casas decimais (ex: 24,50%) |
| RN-101 | Status: PENDENTE -> AGENDADO (ao definir data) -> PAGO (ao registrar pagamento) |
| RN-102 | Forma de pagamento so editavel se nenhuma parcela paga no pedido |
| RN-103 | Valor pago pode ser diferente do valor da parcela, desde que nao ultrapasse (cambio total - parcelas ja pagas) |
| RN-104 | Pagamento parcial: diferenca vai para saldo da proxima parcela pendente |
| RN-105 | Parcela com saldo zerado apos recalculo deve ser eliminada |
| RN-106 | Parcela retornada a pendente: volta com valor original, data original, sem recalculo automatico |
| RN-107 | Vencimento: usa "Data Carga Pronta"; se vazia, usa "Data Esperada da Prontidao" como fallback |
| RN-108 | Valores monetarios sempre com 2 casas decimais (moeda e R$) |
| RN-109 | Numeracao de parcelas no formato "1/3", "2/3", "3/3" — ajusta se pagamento parcial gerar nova parcela |
| RN-110 | Se "Cambio Total" do pedido mudar, diferenca (+ ou -) reflete nas parcelas pendentes/agendadas proporcionalmente |

---

## 5. Requisitos Funcionais

### MVP (Pilar 1 — Gestao + Pilar 2 — Marketplace)

#### RF-001: Lista de Cambios (Comprador)
Grid customizavel com 25+ colunas, filtros por status (Pendentes/Agendados/Pagos/Todos), selecao de colunas drag-and-drop, filtro por coluna (rotulos ou intervalo de datas), busca global, preferencia salva por usuario (colunas + ordem + filtros). Totais em aberto por moeda no topo (USD, EUR, CHF, GBP, BRL, CNY).

**Criterios de Aceite:**
```gherkin
Cenario: CA-001 — Listagem com filtro por status
  Dado que estou logado como "Analista de Cambio" do tenant "acme-import"
  E existem 15 parcelas pendentes e 5 pagas
  Quando seleciono o filtro "Pendentes"
  Entao vejo apenas as 15 parcelas pendentes
  E os totais no topo refletem apenas parcelas pendentes
  E nenhuma parcela de outro tenant e exibida

Cenario: CA-002 — Salvar preferencia de colunas
  Dado que removi a coluna "Numero do B.L" e reordenei "Exportador" para segunda posicao
  Quando clico em "Salvar"
  E faco logout e login novamente
  Entao a lista abre com minha configuracao salva

Cenario: CA-003 — Exportacao
  Dado que tenho parcelas listadas
  Quando clico em "Exportar" e seleciono "Excel"
  Entao um arquivo .xlsx e baixado com as colunas visiveis e filtros aplicados
```

#### RF-002: Agendamento de Parcelas (Comprador)
Selecionar uma ou mais parcelas pendentes -> botao "Agendar" -> modal com selecao de data -> salvar. Status muda de PENDENTE para AGENDADO. Data de vencimento atualizada. Follow-up gerado no processo (se integrado). Total selecionado exibido no topo.

```gherkin
Cenario: CA-004 — Agendar multiplas parcelas
  Dado que selecionei 3 parcelas pendentes com total USD 25.000
  Quando clico "Agendar" e seleciono data 15/04/2026
  E clico "Salvar"
  Entao as 3 parcelas mudam para status "Agendado"
  E a data de vencimento das 3 e atualizada para 15/04/2026
  E o total selecionado exibe "USD 25.000,00"
  E um follow-up e gerado em cada processo vinculado
```

#### RF-003: Pagamento de Cambio (Comprador)
Fluxo em 3 etapas: (1) Selecao de parcelas + valor a pagar (editavel, 2 casas decimais, nao ultrapassa limite); (2) Dados do pagamento (contrato de cambio, banco/corretora, taxa de fechamento, valor em R$); (3) Anexos (comprovante + nome do arquivo opcional) -> Salvar -> Status = PAGO.

```gherkin
Cenario: CA-005 — Pagamento parcial
  Dado que a parcela 1/2 tem valor USD 8,75
  Quando informo "Valor a ser pago" = USD 10,00
  E o cambio total do pedido e USD 17,50
  E nenhuma outra parcela foi paga
  Entao o sistema aceita o pagamento (10,00 < 17,50)
  E a parcela 2/2 fica com saldo = USD 7,50
  E a parcela 1/2 muda para status "Pago"

Cenario: CA-006 — Pagamento com valor menor
  Dado que a parcela 1/2 tem valor USD 8,75
  Quando informo "Valor a ser pago" = USD 8,50
  Entao a diferenca de USD 0,25 e somada ao saldo da parcela 2/2

Cenario: CA-007 — Isolamento de tenant
  Dado que estou logado no tenant "acme-import"
  Quando consulto parcelas de cambio
  Entao nenhuma parcela do tenant "delta-com" e retornada
```

#### RF-004: Cotacao de Cambio — Criar e Disparar (Comprador)
Criar solicitacao de cotacao com: moeda, valor, tipo de operacao (importacao/exportacao), modalidade (pronto/futuro), data de liquidacao desejada, dados do processo vinculado (opcional). Disparar para N corretoras/bancos selecionados via e-mail + portal.

```gherkin
Cenario: CA-008 — Criar cotacao e disparar
  Dado que estou na tela "Nova Cotacao de Cambio"
  Quando preencho moeda "USD", valor "50.000,00", operacao "Importacao", liquidacao "D+2"
  E seleciono 4 corretoras
  E clico "Disparar Cotacao"
  Entao 4 BidRequests sao criados com status "ENVIADO"
  E cada corretora recebe e-mail com link para responder
  E a cotacao muda para status "ENVIADA_CORRETORAS"
```

#### RF-005: Portal da Corretora
Dashboard com: cotacoes pendentes, minhas respostas, taxa de aprovacao, volume operado. Responder cotacao: informar taxa, spread, validade da taxa (em minutos), condicoes. Historico de operacoes.

```gherkin
Cenario: CA-009 — Corretora responde cotacao
  Dado que estou logada como corretora "Abrao Filho"
  E recebi uma cotacao de USD 50.000 para importacao
  Quando informo taxa "5,2350", spread "0,015", validade "10 minutos"
  E clico "Enviar Proposta"
  Entao minha resposta e registrada com status "RECEBIDA"
  E o comprador ve minha proposta no comparativo

Cenario: CA-010 — Corretora nao ve dados de outro tenant
  Dado que estou logada como corretora
  Entao vejo apenas cotacoes enderecadas a mim
  E nao vejo cotacoes de compradores que nao me selecionaram
```

#### RF-006: Comparativo de Taxas (Comprador)
Ranking automatico de respostas: spread vs PTAX, valor total em R$, tempo de resposta, rating da corretora. Tags: MELHOR_TAXA, MELHOR_SPREAD, MELHOR_AVALIACAO. Aprovacao 2-click com calculo de economia.

```gherkin
Cenario: CA-011 — Aprovar melhor taxa
  Dado que recebi 4 propostas para USD 50.000
  E a corretora "Abrao" ofereceu taxa 5,2350 (spread 0,015)
  E a corretora "Bexs" ofereceu taxa 5,2500 (spread 0,030)
  Quando aprovo a proposta da "Abrao"
  Entao a proposta e marcada como "APROVADA"
  E as demais como "REPROVADA"
  E a economia calculada = (5,2500 - 5,2350) x 50.000 = R$ 750,00
  E a corretora "Abrao" recebe notificacao de aprovacao
```

#### RF-007: E-mails Automaticos
- **Alerta de vencimento:** X dias antes (configuravel), enviado as 7h, para departamento financeiro. Lista processos com link. Respeita preferencia de fim de semana (sexta inclui sab/dom).
- **Notificacao ao exportador:** Apos pagamento, em ingles, com comprovante anexo.

```gherkin
Cenario: CA-012 — E-mail de alerta de vencimento
  Dado que a preferencia "dias de antecedencia" esta configurada para 3
  E existem 2 parcelas vencendo em 3 dias
  E hoje e sexta-feira
  E a preferencia "enviar nos finais de semana" esta desativada
  Quando o cron executa as 07:00
  Entao 1 e-mail e enviado ao departamento financeiro
  E o e-mail lista os 2 processos + parcelas que vencem segunda e terca
  E sabado e domingo nao havera envio
```

### Fase 2 (Pos-MVP)
- **RF-F2-001:** Hedge/NDF (cambio futuro) — regras e IOF diferentes
- **RF-F2-002:** Integracao API direta com corretoras/bancos (taxas em tempo real)
- **RF-F2-003:** Registro automatico BACEN para operacoes >USD 50k
- **RF-F2-004:** Vinculacao automatica contrato de cambio <-> DI/DUIMP

### Fase 3
- **RF-F3-001:** Motor de matching automatico (corretora responde automaticamente via tabela de precos)
- **RF-F3-002:** Analytics avancado (spread medio por corretora, tendencia de taxas, previsao)
- **RF-F3-003:** WhatsApp como canal de disparo/resposta de cotacao

---

## 6. Requisitos Nao-Funcionais

| Categoria | Requisito |
|-----------|----------|
| **Performance** | Listagem <200ms (p95), comparativo <300ms |
| **Seguranca** | JWT (Clerk), tenant isolation 4 camadas, Zod em toda rota, x-internal-key S2S |
| **Disponibilidade** | 99,9% uptime |
| **Escalabilidade** | 50k req/dia no MVP, 500k req/dia na Fase 3 |
| **Acessibilidade** | WCAG 2.1 AA, contraste 4.5:1, tab order, aria-labels |
| **Precisao** | Valores monetarios: 2 casas decimais. Taxas de cambio: 4 casas decimais |
| **Dados** | Backup diario, RPO 24h, RTO 1h |
| **Compliance** | Audit trail imutavel (servico Historico), rastreabilidade completa BACEN |

---

## 7. Fluxos de Usuario

### Fluxo 1: Gestao de Parcelas (Comprador)
```
Login -> Dashboard -> Lista de Cambios
  -> Filtrar (Pendentes/Agendados/Pagos)
  -> Selecionar parcela(s)
    -> [Agendar] -> Modal data -> Salvar -> Status=AGENDADO -> Follow-up
    -> [Pagar] -> Etapa 1 (valor) -> Etapa 2 (contrato/taxa/banco) -> Etapa 3 (anexo) -> Salvar -> Status=PAGO -> Follow-up + E-mail exportador
```

### Fluxo 2: Cotacao de Cambio (Comprador)
```
Login -> Dashboard -> Nova Cotacao
  -> Preencher (moeda, valor, operacao, liquidacao)
  -> Selecionar corretoras
  -> Disparar -> Aguardar respostas
  -> Comparativo (ranking automatico)
  -> Aprovar melhor taxa -> Economia calculada
  -> (Opcional) Vincular a parcela de gestao
```

### Fluxo 3: Resposta de Cotacao (Corretora)
```
Login Portal Corretora -> Dashboard
  -> Cotacoes Pendentes -> Selecionar
  -> Informar taxa + spread + validade
  -> Enviar Proposta
  -> Aguardar resultado (Aprovada/Reprovada)
```

### Fluxo 4: Resposta Publica (Corretora sem login)
```
Recebe e-mail com link (token 7 dias)
  -> Abre cotacao publica
  -> Informa taxa + spread + validade
  -> Envia -> Confirmacao
```

---

## 8. Wireframes e Telas

### Telas do Comprador (9 telas)

| # | Tela | 5 Estados | Componentes Gravity |
|---|------|-----------|-------------------|
| 1 | **Dashboard** | empty (sem operacoes), loading, error, filled (KPIs + graficos), disabled (sem permissao) | TabelaGlobal, BadgeStatus, Loading |
| 2 | **Lista de Cambios** | empty (sem parcelas), loading (skeleton), error, filled (grid 25+ colunas), disabled | TabelaGlobal (customizavel), CaixaSelectGlobal, BotaoGlobal |
| 3 | **Nova Cotacao** | empty (formulario limpo), loading (buscando corretoras), error, filled (pronto para disparar), disabled (fora do horario) | InputTexto, CaixaSelectGlobal, BotaoGlobal, ModalGlobal |
| 4 | **Detalhe da Cotacao** | empty (sem respostas ainda), loading, error, filled (com respostas), disabled | BadgeStatus, TabelaGlobal |
| 5 | **Comparativo** | empty (aguardando respostas), loading, error, filled (ranking), disabled | TabelaGlobal, BadgeStatus, BotaoGlobal |
| 6 | **Corretoras** | empty, loading, error, filled (lista), disabled | TabelaGlobal, CaixaSelectGlobal |
| 7 | **Detalhe Corretora** | empty, loading, error, filled (rating + historico), disabled | BadgeStatus |
| 8 | **Configuracoes** | empty, loading, error, filled, disabled | InputTexto, CaixaSelectGlobal |
| 9 | **Modal Pagamento** (3 etapas) | empty, loading, error, filled, disabled | ModalGlobal, InputTexto, BotaoGlobal |

### Telas do Portal da Corretora (7 telas)

| # | Tela | Descricao |
|---|------|-----------|
| 1 | **Dashboard Corretora** | KPIs: cotacoes pendentes, respondidas, aprovadas, taxa de conversao, volume |
| 2 | **Cotacoes Pendentes** | Lista de cotacoes aguardando resposta |
| 3 | **Responder Cotacao** | Formulario: taxa, spread, validade, condicoes |
| 4 | **Minhas Respostas** | Historico de respostas (aprovadas/reprovadas) |
| 5 | **Meu Desempenho** | Metricas: tempo medio de resposta, taxa de aprovacao, rating |
| 6 | **Responder Publico** | Via token (sem login) — mesmos campos |
| 7 | **Configuracoes** | Dados da corretora, contatos, preferencias |

**Total: 16 telas** (9 comprador + 7 corretora) — mesmo padrao do BID Frete.

---

## 9. Integracoes com Gravity

| Servico | Tipo | Uso |
|---------|------|-----|
| **Atividades** (8012) | Fire-and-forget | Log de toda acao (criar cotacao, disparar, aprovar, pagar) |
| **Historico** (8014) | Fire-and-forget | Audit trail imutavel (compliance BACEN) |
| **Notificacoes** (8013) | Fire-and-forget | Alertas in-app (nova cotacao, resposta recebida, vencimento) |
| **GABI** (8015) | Fire-and-forget | Analise IA de melhores taxas, sugestoes |
| **Email** (8022) | Sincrono | Disparo de cotacoes, alertas de vencimento, notificacao exportador |
| **Dashboard** (8010) | API | KPIs consolidados cross-product |
| **Relatorios** (8011) | API | Relatorios de cambio exportaveis |
| **Agendamento** (8018) | Cron | Job diario 7h (alertas de vencimento) |
| **Configurador** (8003) | API | Auth, permissoes, workspace |
| **Processo** (quando integrado) | API (REST) | Leitura de dados do pedido (DI, Invoice, datas, exportador) |
| **BID Frete** (quando integrado) | Via Dashboard | Visao consolidada frete + cambio |

**Regra:** Nenhuma dependencia direta. BID Cambio funciona 100% standalone. Integracoes sao opcionais e via servicos tenant.

---

## 10. Metricas de Sucesso

| KPI | Meta (6 meses) | Como medir |
|-----|----------------|-----------|
| **Economia media por operacao** | >0,5% de spread vs cotacao manual | (spread manual medio - spread BID) / spread manual |
| **Tempo medio de cotacao** | <5 min (vs 30+ min manual) | Timestamp: criacao -> aprovacao |
| **Corretoras ativas no marketplace** | 20+ corretoras | Count distinct corretoras com >=1 resposta/mes |

---

## 11. Cronograma e Fases

| Fase | Escopo | Estimativa |
|------|--------|-----------|
| **MVP** | Gestao de parcelas (lista, agendar, pagar, e-mails) + Marketplace (cotacao, comparativo, portal corretora) | 3-4 semanas (G/GG) |
| **Fase 2** | Hedge/NDF, API real-time corretoras, registro BACEN automatico | 2-3 semanas |
| **Fase 3** | Auto-matching, analytics avancado, WhatsApp | 2-3 semanas |

---

## 12. Riscos e Mitigacoes

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|--------------|---------|-----------|
| Corretoras nao aderirem ao portal | Media | Alto | Onboarding assistido + link publico (sem login) como alternativa |
| Taxa expira antes do usuario aprovar | Alta | Medio | Countdown visual + notificacao push + refresh automatico |
| Mudanca de IOF por decreto | Baixa | Alto | Campo IOF configuravel por tenant, nao hardcoded |
| PTAX indisponivel (BCB fora do ar) | Baixa | Medio | Cache de ultima PTAX + fallback manual |
| Complexidade de parcelas (pagamento parcial, recalculo) | Media | Medio | Testes extensivos com cenarios reais do legado DATI |
| Compliance BACEN insuficiente | Baixa | Critico | Audit trail via Historico + SME valida a cada entrega |

---

## 13. Decisoes Tomadas

| # | Data | Decisao | Alternativa Descartada | Razao |
|---|------|---------|----------------------|-------|
| D-001 | 2026-03-29 | Gratuito para compradores, monetizacao nas corretoras | Cobrar dos dois lados | Atrair volume de compradores primeiro (marketplace classico) |
| D-002 | 2026-03-29 | Duas visoes separadas (Comprador + Corretora) | Portal unico com roles | UX mais limpa, login independente, dashboards especificos |
| D-003 | 2026-03-29 | MVP inclui Gestao + Marketplace | So marketplace primeiro | Gestao de parcelas e core — sem ela o produto nao resolve o problema completo |
| D-004 | 2026-03-29 | Campos do legado DATI migrados para Gravity | Redesign do zero | Campos ja validados por anos de uso real, reduz risco |
| D-005 | 2026-03-29 | Produto standalone com integracao opcional | Dependencia do Processo | Arquitetura Gravity: produtos independentes via servicos tenant |

---

## Campos Mapeados (25+ colunas — extraidos do legado DATI)

| Campo | Tipo | Origem |
|-------|------|--------|
| DATI NUMBER / Referencia | String | Processo |
| PARCELA | String "1/3" | Calculado |
| EXPORTADOR | String | Pedido |
| DATA DE VENCIMENTO | Date | Calculado (metodo + prazo) |
| NUMERO DA DI | String | Processo/SISCOMEX |
| NUMERO DA INVOICE | String | Pedido |
| MOEDA | Enum (USD, EUR, GBP, CHF, BRL, CNY) | Pedido |
| NUMERO PO | String | Pedido |
| A PAGAR (moeda) | Decimal(2) | Calculado |
| A PAGAR R$ | Decimal(2) | Calculado (valor x taxa) |
| REFERENCIA DO CLIENTE | String | Pedido |
| BANCO / CORRETORA | String | Pagamento |
| CONDICAO DE PAGAMENTO | String | Pedido |
| DATA DE CHEGADA FINAL | Date | Processo |
| DATA DE DESEMBARACO | Date | Processo |
| DATA DE EMBARQUE FINAL | Date | Processo |
| DATA DE ENTREGA | Date | Processo |
| DATA DO PAGAMENTO | Date | Pagamento |
| DATA REGISTRO DE DI | Date | Processo |
| NUMERO DE CONTRATO (cambio) | String | Pagamento |
| NUMERO DE TRANSMISSAO DA D.I. | String | Processo |
| NUMERO DO B.L | String | Processo |
| STATUS | Enum (Pendente/Agendado/Pago) | Parcela |
| TAXA DE FECHAMENTO | Decimal(4) | Pagamento |
| ENDERECO DESEMBARACO (CNPJ+Nome) | String | Processo |
| ENDERECO ENTREGA (CNPJ+Nome) | String | Processo |
| DATA ABERTURA PEDIDO | Date | Pedido |
| DATA ESPERADA DA PRONTIDAO | Date | Pedido |
| FORMA DE PAGAMENTO DO CAMBIO | Config | Pedido |
| VALOR A SER PAGO | Decimal(2) | Input do usuario |
| CAMBIO TOTAL | Decimal | Pedido |
| CATEGORIA (anexo) | String | Pagamento |
| NOME DO ARQUIVO | String (opcional) | Pagamento |

---

## Regras de E-mail (do legado DATI)

### E-mail 1: Alerta de Vencimento (Interno)
- **Destinatario:** Contato do departamento financeiro (Preferencias > Contatos)
- **Horario:** 07:00 do dia corrente
- **Condicao:** Parcelas com vencimento dentro de X dias (configuravel)
- **Fim de semana:** Respeita preferencia; sexta inclui sab/dom se desativado
- **Assunto:** FECHAMENTO DE CAMBIO PARA PAGAMENTO
- **Corpo:** Lista de processos com hiperlink + link para tela de cambio
- **Nao dispara** se nao houver parcelas a vencer no periodo

### E-mail 2: Notificacao ao Exportador (Externo)
- **Destinatario:** Contato financeiro do exportador (Preferencias > Exportadores > Contatos)
- **Condicao:** Ativada nas preferencias + parcela paga
- **Idioma:** Ingles
- **Assunto:** NEW PAYMENT // [IMPORTADOR] TO [EXPORTADOR] // [REF PEDIDO] // [REF DATI]
- **Corpo:** Confirmacao de pagamento com numero do pedido
- **Anexos:** Arquivos anexados no momento do pagamento

---

## Preferencias do Tenant (Categoria "Cambio")

| Preferencia | Padrao | Tipo |
|-------------|--------|------|
| Apresentar cambios pagos no menu financeiro do processo? | Desativado | Toggle |
| Desejar ser avisado por e-mail sobre as parcelas de cambio a vencer? | Desativado | Toggle |
| Quantos dias antes do vencimento deseja ser avisado? | - | Numerico (max 3 digitos) |
| Enviar e-mail ao exportador avisando sobre o pagamento do cambio? | Desativado | Toggle |
