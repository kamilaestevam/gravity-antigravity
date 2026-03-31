# PRD — Financeiro Comex (v1.0 — Final)

## Metadados

| Campo | Valor |
|:---|:---|
| **Produto** | Financeiro Comex |
| **PM** | Dream Team de Produtos |
| **Data** | 2026-03-31 |
| **Versão** | 1.0 |
| **Status** | ✅ Aprovado para handoff |
| **Checkpoint 1** | ✅ 2026-03-31 — Problema validado (briefing direto do dono) |
| **Checkpoint 2** | ✅ 2026-03-31 — Solução especificada com referência DATI |
| **Checkpoint 3** | ✅ 2026-03-31 — Handoff completo |

---

## 1. Resumo Executivo

O **Financeiro Comex** é o módulo de gestão e automação de custos de processos de importação e exportação. Ele consolida todos os lançamentos financeiros de um processo (impostos federais, taxas operacionais, câmbio), oferece múltiplas formas de entrada (manual, planilha, XML, Smart Read, Portal Único, email) e produz como saída a planilha de rateio por produto e o espelho de custos para a NF de entrada.

O produto pode ser adquirido de forma isolada ou em conjunto com os demais produtos do ecossistema Gravity (Processo, NF Importação, LPCO, Numerário Comex). Sua métrica principal de sucesso é a **redução do tempo de fechamento financeiro de um processo de importação de X horas para Y minutos**.

---

## 2. Contexto e Motivação

### Por que agora?

- Todo sistema de gestão de comex tem um módulo financeiro, mas a maioria é rígida, não multi-moeda, não integra com Portal Único e exige entrada manual extensiva
- O Gravity já tem Processo, NF Importação e LPCO — o Financeiro é o elo que conecta todos e fecha o ciclo financeiro do processo
- A planilha de rateio é gerada manualmente em Excel por quase 100% das empresas de comex — o produto automatiza exatamente isso
- O ICMS está disponível no Portal Único desde NT RFB 001/2023 para estados integrados, eliminando a necessidade de cálculo manual para a maioria dos processos

### Posicionamento

| Gravity Financeiro Comex | vs. Concorrentes |
|:---|:---|
| Multi-moeda nativo com taxa por lançamento | Maioria converte tudo para BRL imediatamente |
| Import direto do Portal Único (DUIMP) | Maioria exige digitação manual dos impostos |
| Smart Read de NFs de fornecedores | Inexistente em produtos especializados de comex |
| Rateio por 9 métodos + exportação Excel | Rateio fixo por valor CIF apenas |
| Integrado com NF Importação (espelho) | Sistemas separados sem integração |

### Nota sobre mercado

Praticamente toda empresa com ERP (SAP, TOTVS, Senior) já tem um módulo financeiro. Por isso, o Financeiro Comex fará mais sentido para empresas que:
(a) não têm ERP
(b) têm ERP mas precisam de visão específica de custos comex antes de integrar ao ERP
(c) usam o ecossistema Gravity completo e querem o rateio automático

---

## 3. Público-Alvo

### Persona Primária: Analista de Importação / Despachante

| Campo | Descrição |
|:---|:---|
| **Cargo** | Analista de Importação, Assistente de Comex, Despachante |
| **Empresa** | Importadora de médio porte ou despachante aduaneiro |
| **Dor principal** | Passa horas montando a planilha de rateio manualmente após cada processo |
| **Dor secundária** | Perde tempo digitando impostos que já estão no SISCOMEX |
| **JTBD** | "Quando um processo chega ao canal verde, quero ter todos os custos consolidados e ratear em minutos, para fechar a NF hoje" |

**Citações (simuladas com base em entrevistas de mercado):**
- *"O maior trabalho é depois que a mercadoria chegou — tenho que juntar todas as notas dos fornecedores e montar o rateio"*
- *"Fico abrindo o SISCOMEX, copiando os impostos da DUIMP para a planilha, é trabalho repetitivo"*
- *"Quando chega auditoria, não consigo mostrar o histórico de um processo facilmente"*

### Persona Secundária: Controller / Gerente Financeiro

| Campo | Descrição |
|:---|:---|
| **Cargo** | Controller, Gerente Financeiro, CFO de empresa importadora |
| **Dor principal** | Visibilidade dos custos de importação em aberto (multi-processo, multi-moeda) |
| **JTBD** | "Quando entro pela manhã, quero ver o total de obrigações financeiras abertas em cada moeda" |

---

## 4. Regras de Negócio

### RN-001: Dois Grupos de Custos (Importação)

**Grupo 1 — Impostos Federais (DUIMP)**
Impostos calculados e registrados na DUIMP/DI. Podem ser importados via XML, TXT, Smart Read ou Portal Único.

| Tributo | Base Legal | Incidência | Armadilha |
|:---|:---|:---|:---|
| II (Imposto de Importação) | Decreto-Lei 37/1966 | Valor aduaneiro (CIF) | Alíquota varia por NCM; Ex-tarifário pode reduzir |
| IPI | Decreto 7.212/2010 | CIF + II | Incide "por fora" sobre base que já inclui II |
| PIS-Importação | Lei 10.865/2004 | CIF "por dentro" | Alíquota diferente do PIS interno (2,1%) |
| COFINS-Importação | Lei 10.865/2004 | CIF "por dentro" | Alíquota diferente do COFINS interno (9,65%) |
| ICMS | LC 87/1996 + estadual | CIF + II + IPI + PIS + COFINS "por dentro" | Alíquota varia por estado; Reforma Tributária em andamento |
| AFRMM | Lei 10.893/2004 | Frete internacional (marítimo) | Só aplica a marítimo; 25% sobre frete em BRL |
| Taxa Siscomex | IN RFB 680/2006 | Por DI + por adição | Valor fixo; pode ser incluída como lançamento |

**Grupo 2 — Taxas e Custos Operacionais**
Lançados manualmente ou importados via fatura de fornecedor. Exemplos do catálogo:

| Código | Descrição | Fornecedor Típico |
|:---|:---|:---|
| 3 | Frete Internacional | Agente de Carga |
| 4 | Liberação de HAWB/HBL | Agente de Carga |
| 5 | Desconsolidação | Terminal |
| 6 | Collect Fee | Armador |
| 7 | THC (Terminal Handling Charge) | Terminal |
| 8 | Marinha Mercante (AFRMM) | Receita Federal |
| 9 | Taxa Administrativa | Despachante |
| 70 | Frete Rodoviário | Transportadora |
| 74 | Câmbio | Banco/Corretora |
| 120 | Taxas do CE (Collect) | Agente de Carga |

### RN-002: ICMS no Portal Único

Conforme NT RFB 001/2023 e integrações estaduais progressivas, o Portal Único disponibiliza dados de ICMS para estados que assinaram o protocolo de integração. O sistema deve:
- Importar ICMS do Portal Único quando disponível
- Indicar visualmente se o ICMS foi importado automaticamente ou inserido manualmente
- Permitir override manual em todos os casos (estados não integrados)
- **Frequência de mudança:** Alta — monitorar adesão de novos estados

### RN-003: Exportação — Sem Impostos de Importação

Para processos de exportação:
- **Não existe** II, IPI, PIS-Importação, COFINS-Importação, ICMS na saída (imunidade constitucional CF Art. 155, §2, X)
- Apenas Grupo 2 (custos operacionais): frete, seguro, armazenagem, taxas portuárias
- A estrutura de movimentação é idêntica, apenas o catálogo de categorias é diferente

### RN-004: Multi-Moeda por Lançamento

Cada lançamento tem:
- **Moeda** (BRL, USD, EUR, CHF, GBP, CNY, etc.)
- **Taxa** (câmbio na data do fato gerador — PTAX BACEN para efeitos fiscais)
- **Valor** (na moeda original)
- **Valor R$** = Valor × Taxa (calculado automaticamente)

O câmbio para impostos federais usa a PTAX da data de registro da DI/DUIMP.
O câmbio para custos operacionais usa a taxa informada na fatura do fornecedor.

### RN-005: Flags de Classificação por Lançamento

Cada lançamento pode ter 3 classificações independentes:

| Flag | Significado | Impacto |
|:---|:---|:---|
| **Despesa Aduaneira** | Custo compõe o valor aduaneiro da mercadoria | Entra no cálculo base de impostos (II, IPI, ICMS) |
| **Despesa NF** | Custo entra na NF de entrada | Aparece na seção de despesas da NF de entrada |
| **Apresentar no Espelho de NF** | Exibir no espelho da NF Importação | Aparece na impressão/exportação do espelho da NF |

### RN-006: Condição de Pagamento

Cada lançamento tem uma condição de pagamento que determina:
- **Antecipado**: pago antes do embarque
- **À Vista**: pago na entrega / desembaraço
- **A Prazo**: pago após X dias (ex: "60 dias data embarque")
- Condições customizadas são cadastradas pelo tenant

### RN-007: Status de Pagamento

| Status | Quando | Efeito no KPI |
|:---|:---|:---|
| **Pendente** | Lançado mas não pago | Entra em "Pendente" |
| **Agendado** | Data de vencimento futura definida | Entra em "Agendados" |
| **Pago** | Confirmado como pago | Entra em "Pagos" |

### RN-008: Numerário

Numerário é o adiantamento em dinheiro enviado ao despachante aduaneiro para pagar tributos na alfândega.

- **Numerário Principal**: adiantamento inicial (obrigatório)
- **Numerário Complementar**: adiantamento adicional (opcional, múltiplos permitidos)
- Cada numerário tem documento PDF anexo com a prestação de contas
- O total do numerário é exibido na aba Numerário e no KPI "Adiantado" da Movimentação

### RN-009: Rateio

O rateio distribui os custos entre os itens importados para cálculo do custo unitário de cada SKU.
- Reutiliza exatamente o mesmo engine da NF Importação (9 métodos)
- Geração do Excel segue o mesmo layout da planilha `custos_processo`
- O rateio contempla: impostos, frete, seguro, armazenagem e demais despesas

### RN-010: Tipos de Documento por Lançamento

Cada lançamento pode ter um **tipo de documento** que identifica a natureza do comprovante:
- **Boleto** — pagamento via boleto bancário
- **Nota Fiscal** — NF do fornecedor
- **Demonstrativo** — demonstrativo de custos do despachante/agente
- **Fatura** — invoice do fornecedor estrangeiro ou nacional
- **Faturamento** — documento de faturamento de serviço

Este campo, junto com o número do documento, permite rastreabilidade contábil completa. É opcional — lançamentos de impostos importados da DUIMP podem não ter documento separado.

### RN-011: Tipos de Fornecedor

O sistema suporta 13 tipos de fornecedor que determinam o contexto do lançamento:
Agente de carga, Armador, Cia aérea, Armazem alfandegado, Armazem, Transportadora rodoviária, Seguradora, Corretora de cambio, Exportador, Fabricante, Trading, Despachante, Receita Federal.

O select de fornecedor exibe o tipo entre parênteses para facilitar identificação visual: **"SCHENKER DO BRASIL (Agente de carga)"**.

### RN-012: Saldo do Processo

```
Saldo = Total de Custos Lançados - Total de Adiantamentos (Numerário)
```
Saldo negativo = empresa ainda deve ao despachante/fornecedores.
Saldo positivo = empresa tem crédito (raro, indica numerário excedente).

---

## 5. Requisitos Funcionais

### 5.1. MVP (Fase 1) — Módulo Movimentação

| ID | Requisito | Prioridade | Complexidade |
|:---|:---|:---|:---|
| RF-001 | Listar lançamentos de um processo com KPIs (Saldo, Adiantado, Pagos, Agendados, Pendente) | Must-have | M |
| RF-002 | Criar lançamento manual com todos os campos (Descrição, Moeda, Taxa, Valor, Fornecedor, Condição Pgt., Datas, Flags) | Must-have | M |
| RF-003 | Editar lançamento existente | Must-have | P |
| RF-004 | Excluir lançamento | Must-have | P |
| RF-005 | Importar impostos via XML da DUIMP (Grupo 1) | Must-have | G |
| RF-006 | Importar impostos via Portal Único (DUIMP number) — reuso da integração NF Importação | Must-have | M |
| RF-007 | Importar custos via Smart Read (OCR de fatura de fornecedor) | Should-have | G |
| RF-008 | Importar custos via planilha Excel (upload de template pré-definido) | Should-have | M |
| RF-009 | Catálogo de categorias de despesa (customizável por tenant) | Must-have | M |
| RF-010 | Catálogo de condições de pagamento (customizável por tenant) | Must-have | P |
| RF-011 | Badges "Total aberto hoje" por moeda no header | Must-have | P |
| RF-012 | Histórico de alterações com diff de cada mudança | Must-have | P |
| RF-013 | Filtro por período, status, moeda, fornecedor | Should-have | P |
| RF-014 | Exportar lançamentos para Excel | Should-have | P |

### 5.2. MVP (Fase 1) — Módulo Numerário

| ID | Requisito | Prioridade | Complexidade |
|:---|:---|:---|:---|
| RF-020 | Criar Numerário Principal com valor e data | Must-have | P |
| RF-021 | Criar Numerário Complementar (N adicionais por processo) | Must-have | P |
| RF-022 | Anexar documento PDF ao numerário (prestação de contas do despachante) | Must-have | P |
| RF-023 | Listar despesas dentro do numerário com total | Must-have | P |
| RF-024 | Total consolidado de numerário (soma Principal + Complementares) | Must-have | P |

### 5.3. MVP (Fase 1) — Módulo Rateio

| ID | Requisito | Prioridade | Complexidade |
|:---|:---|:---|:---|
| RF-030 | Gerar planilha de rateio Excel (mesma estrutura do custos_processo) | Must-have | G |
| RF-031 | Usar os 9 métodos de rateio do NF Importação (reuso direto) | Must-have | M |
| RF-032 | Exibir histórico de rateios gerados com data | Must-have | P |
| RF-033 | "Gerar Novo" regenera o rateio com os dados atuais | Must-have | P |

### 5.4. MVP (Fase 1) — Exportação

| ID | Requisito | Prioridade | Complexidade |
|:---|:---|:---|:---|
| RF-040 | Suporte a tipo_operacao = IMPORTACAO ou EXPORTACAO | Must-have | P |
| RF-041 | Para EXPORTACAO: catálogo filtrado (sem categorias de impostos federais) | Must-have | P |
| RF-042 | Para EXPORTACAO: não calcular/importar impostos do Grupo 1 | Must-have | P |

### 5.5. Fase 2 — Automação e Integração

| ID | Requisito | Prioridade |
|:---|:---|:---|
| RF-050 | Receber e processar faturas via email (integração com serviço Email do Gravity) | Should-have |
| RF-051 | Dashboard consolidado multi-processo (visão de todos os processos abertos) | Should-have |
| RF-052 | Alertas de vencimento (X dias antes do prazo) via notificação | Should-have |
| RF-053 | Integração com produto NF Importação (espelho automático de custos) | Should-have |
| RF-054 | Exportação para ERP (TOTVS, SAP, Senior) via Conector ERP | Nice-to-have |

### 5.6. Fase 3 — Numerário como Produto Isolado

O módulo Numerário será separado em produto independente chamado **Numerário Comex** após a estabilização do MVP. A arquitetura deve ser projetada para facilitar esta separação (módulo independente com suas próprias rotas e models).

---

## 6. Requisitos Não-Funcionais

| ID | Requisito | Critério |
|:---|:---|:---|
| RNF-001 | Performance | Listagem de lançamentos < 200ms para até 500 lançamentos |
| RNF-002 | Multi-moeda | Suporte a BRL, USD, EUR, GBP, CHF, CNY, ARS, UYU mínimo |
| RNF-003 | Precisão decimal | Valores monetários com 4 casas decimais em storage, 2 na exibição |
| RNF-004 | Tenant isolation | Zero vazamento de dados entre tenants |
| RNF-005 | Acessibilidade | WCAG 2.1 AA |
| RNF-006 | Responsividade | Desktop, tablet (768px+) |

---

## 7. Fluxos de Usuário

### Fluxo 1 — Lançamento Manual de Custo Operacional

```
Processo aberto → Financeiro → Movimentação → "+ Novo"
  → Modal "Novo Lançamento"
    → Selecionar Descrição (catálogo)
    → Selecionar Moeda + informar Taxa + Valor
    → Selecionar Fornecedor
    → Informar Condição de Pagamento + Datas
    → Marcar Flags (Despesa Aduaneira, Despesa NF, Espelho NF)
    → Salvar
  → Lançamento aparece na lista
  → KPIs atualizados
```

### Fluxo 2 — Importação de Impostos via Portal Único

```
Financeiro → Movimentação → "Importar" → "Portal Único"
  → Informar número da DUIMP
  → Sistema busca impostos (II, IPI, PIS, COFINS, ICMS, AFRMM)
  → Preview dos lançamentos a serem criados
  → Confirmar → Lançamentos criados automaticamente
  → KPIs atualizados
```

### Fluxo 3 — Importação via XML DUIMP

```
Financeiro → Movimentação → "Importar" → "XML"
  → Upload do arquivo .xml
  → Parse dos campos de impostos
  → Preview com validação
  → Confirmar → Lançamentos criados
```

### Fluxo 4 — Rateio

```
Financeiro → Rateio → "Gerar Novo"
  → Sistema calcula rateio com todos os lançamentos marcados
  → Gera Excel (formato custos_processo)
  → Arquivo disponível para download na lista
```

### Fluxo 5 — Numerário

```
Financeiro → Numerário → Ver Numerário Principal
  → "+ Numerário Complementar"
    → Informar descrição + lista de despesas
    → Salvar
  → Total atualizado
  → Clicar no numerário → Upload de PDF de prestação de contas
```

---

## 8. Wireframes e Telas

Ver seção completa no documento HANDOFF.md — telas especificadas com base nas imagens de referência (DATI).

### Mapa de Telas

```
Financeiro (produto)
  ├── Tela 1: Movimentação (lista principal)
  │     ├── Modal 1A: Novo Lançamento
  │     ├── Modal 1B: Editar Lançamento
  │     ├── Modal 1C: Importar (sub-opções: XML, Portal Único, Smart Read, Planilha)
  │     └── Modal 1D: Histórico de Alterações
  ├── Tela 2: Numerário
  │     ├── Modal 2A: Inserir Numerário (Complementar)
  │     └── Modal 2B: Exibir Anexo (PDF viewer)
  ├── Tela 3: Rateio
  │     └── (lista de arquivos gerados + botão Gerar Novo)
  └── Config
        ├── Tela 4: Catálogo de Categorias
        └── Tela 5: Condições de Pagamento
```

---

## 9. Integrações com Ecossistema Gravity

| Integração | Tipo | Descrição |
|:---|:---|:---|
| **Processo** | S2S | Financeiro é vinculado a um processo_id; recebe tipo_operacao, itens, declaração |
| **NF Importação** | S2S | Fornece lista de custos marcados como "Despesa NF" para o espelho |
| **Portal Único** | Reuso | Reusa a integração já implementada no NF Importação (portalUnico) |
| **Rateio Engine** | Reuso direto | Reusa exatamente o `rateioAlgorithms.ts` do NF Importação |
| **Smart Read** | Reuso | Reusa o serviço de Smart Read para OCR de faturas |
| **Email** | Tenant service | Recebe faturas de fornecedores por email (Fase 2) |
| **Notificações** | Tenant service | Alerta de vencimentos (Fase 2) |
| **Histórico** | Tenant service | Audit trail imutável de cada lançamento |
| **Dashboard** | Tenant service | KPIs de custos por processo no painel consolidado |
| **Conector ERP** | Tenant service | Exportação para ERP (Fase 3) |

---

## 10. Métricas de Sucesso

| KPI | Meta | Como Medir |
|:---|:---|:---|
| Tempo de fechamento financeiro de processo | < 15 min (vs. 2-4h manual) | Tracking de tempo entre abertura e geração do rateio |
| Taxa de importação automática vs manual | > 60% dos impostos importados via Portal Único/XML | Eventos: canal_entrada |
| Adoção do rateio automático | > 80% dos processos geram rateio pelo Gravity | Evento: rateio_gerado |
| Erros de digitação (lançamentos editados após criação) | < 10% dos lançamentos | Eventos: lancamento_editado / lancamento_criado |

---

## 11. Cronograma e Fases

| Fase | Escopo | Estimativa | Dependência |
|:---|:---|:---|:---|
| **MVP** | Movimentação + Numerário + Rateio (importação e exportação) | 6-8 semanas | Processo existente |
| **Fase 2** | Email integration, dashboard consolidado, alertas | 3-4 semanas | MVP validado |
| **Fase 3** | Numerário Comex como produto isolado | 2-3 semanas | Fase 2 validada |

---

## 12. Riscos e Mitigações

| Risco | Prob. | Impacto | Mitigação |
|:---|:---|:---|:---|
| API Portal Único instável | Alta | Alto | Cache local dos dados importados; fallback para XML |
| Alíquotas de ICMS variam por estado | Alta | Médio | Permitir override manual em qualquer lançamento importado |
| Reforma Tributária (CBS/IBS em 2033) | Baixa | Alto | Arquitetura de catálogo flexível; não hardcodar tributos |
| Baixa adoção standalone (usuários têm ERP) | Alta | Médio | Posicionar como módulo do ecossistema Gravity, não standalone |
| Usuário não tem Portal Único configurado | Média | Médio | XML e manual sempre disponíveis como fallback |

---

## 13. Decisões Tomadas

| # | Decisão | Data | Contexto |
|:---|:---|:---|:---|
| D-001 | Reutilizar RateioEngine do NF Importação sem fork | 2026-03-31 | Mesmo algoritmo, evitar divergência |
| D-002 | ICMS entra no Grupo 1 (importável via Portal Único) | 2026-03-31 | NT RFB 001/2023; com flag indicando origem |
| D-003 | Numerário projetado como módulo isolável desde o início | 2026-03-31 | Facilitar extração posterior em produto independente |
| D-004 | Porta 8029 (server) / 5184 (client dev) | 2026-03-31 | Sequência natural após nf-importacao (8028/5183) |
| D-005 | Catálogo de categorias é por tenant (não global hardcoded) | 2026-03-31 | Flexibilidade; cada empresa tem seus códigos contábeis |
| D-006 | Exportação usa mesma estrutura com catálogo filtrado | 2026-03-31 | Reutilização máxima; tipo_operacao controla o comportamento |
