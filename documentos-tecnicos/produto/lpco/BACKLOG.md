# Backlog Priorizado — LPCO MVP

> **Elaborado por:** PM — Dream Team de Produtos
> **Data:** 30/03/2026
> **Metodo:** RICE Score (Reach × Impact × Confidence / Effort)

---

## Como Ler Este Backlog

- Ordenado por **RICE Score** (maior primeiro)
- Cada item tem link para criterios de aceite em `CRITERIOS-ACEITE.md`
- Complexidade estimada pelo Tech Lead
- Dependencias indicam o que precisa estar pronto antes

---

## Backlog MVP

| # | Story | User Story | RICE | Complexidade | CAs | Depende de | Status |
|---|-------|-----------|------|-------------|-----|-----------|--------|
| 1 | Lista de LPCOs | Como analista, quero ver todos os LPCOs em um grid com filtros para ter visao consolidada | 95 | M | CA-048 a CA-052 | — | 🔲 |
| 2 | Criar LPCO manual (rascunho) | Como analista, quero criar um LPCO preenchendo os dados para preparar antes de registrar | 90 | M | CA-001 a CA-005 | — | 🔲 |
| 3 | Preencher itens NCM | Como analista, quero adicionar itens com NCM, quantidades e atributos do orgao para completar o LPCO | 88 | G | CA-006 a CA-012 | #2 | 🔲 |
| 4 | Validar e registrar LPCO | Como analista, quero validar e registrar o LPCO para envia-lo ao orgao anuente | 87 | M | CA-013 a CA-018 | #3 | 🔲 |
| 5 | Criar LPCO a partir do Pedido | Como analista, quero criar LPCO a partir de um Pedido existente para nao redigitar 70% dos dados | 85 | M | CA-063 a CA-066 | #2 | 🔲 |
| 6 | Smart Read (OCR+IA) | Como analista, quero fazer upload de fatura/laudo e ter os dados extraidos automaticamente para economizar tempo | 84 | G | CA-067 a CA-072 | #2 | 🔲 |
| 7 | Acompanhar status | Como analista, quero ver o status atualizado de cada LPCO para saber o que precisa de atencao | 83 | M | CA-019 a CA-022 | #4 | 🔲 |
| 8 | Responder exigencias | Como analista, quero responder exigencias do orgao anuente para evitar cancelamento | 82 | M | CA-023 a CA-026 | #7 | 🔲 |
| 9 | Cancelamento automatico 90 dias | Como sistema, quero cancelar LPCOs com exigencia pendente por >90 dias para espelhar regra do Portal Unico | 80 | M | CA-042 a CA-044 | #8 | 🔲 |
| 10 | Alertas de prazo | Como analista, quero receber alertas em 60/80/90 dias para nao esquecer de responder exigencias | 79 | M | CA-057 a CA-060 | #9 | 🔲 |
| 11 | Integracao Portal Unico (registrar) | Como analista, quero registrar o LPCO no Portal Unico direto do Gravity para nao precisar acessar dois sistemas | 78 | GG | CA-081 a CA-088 | #4 | 🔲 |
| 12 | Infraestrutura certificado digital | Como admin, quero configurar meu certificado digital para integrar com o Portal Unico | 77 | G | CA-089 a CA-093 | — | 🔲 |
| 13 | Autenticacao token OAuth2 | Como admin, quero usar token gov.br/Serpro como alternativa ao certificado digital | 76 | G | CA-094 a CA-097 | #12 | 🔲 |
| 14 | Anexar documentos | Como analista, quero anexar documentos comprobatorios ao LPCO para o dossie ficar completo | 75 | P | CA-027 a CA-029 | #2 | 🔲 |
| 15 | Vincular LPCO a Processo | Como analista, quero vincular LPCO deferida a um Processo (DUIMP/DU-E) para rastreabilidade | 74 | G | CA-030 a CA-034 | #7 | 🔲 |
| 16 | Controle de saldo LPCO Flex | Como analista, quero controlar o saldo de LPCO Flex para saber quanto ainda posso vincular | 73 | G | CA-035 a CA-038 | #15 | 🔲 |
| 17 | Historico completo (timeline) | Como analista, quero ver o historico de tudo que aconteceu no LPCO para auditorias | 72 | M | CA-045 a CA-047 | #2 | 🔲 |
| 18 | Webhooks Portal Unico (15 eventos) | Como sistema, quero receber eventos do Portal Unico para sincronizar status automaticamente | 71 | G | CA-098 a CA-102 | #11 | 🔲 |
| 19 | Importar LPCOs via planilha | Como analista, quero importar LPCOs de uma planilha Excel/CSV para migracao em lote | 70 | M | CA-073 a CA-076 | #2 | 🔲 |
| 20 | API Cockpit (ERP cria LPCOs) | Como sistema ERP, quero criar LPCOs via API para integrar sem interface humana | 69 | M | CA-077 a CA-080 | #2 | 🔲 |
| 21 | Simulador de tratamento administrativo | Como analista, quero consultar se minha NCM exige LPCO e de qual orgao para planejar com antecedencia | 68 | G | CA-053 a CA-056 | — | 🔲 |
| 22 | Cancelar LPCO manualmente | Como analista, quero cancelar um LPCO que nao preciso mais | 67 | P | CA-039 a CA-041 | #2 | 🔲 |
| 23 | Duplicar LPCO existente | Como analista, quero duplicar um LPCO como modelo para nao preencher tudo de novo | 66 | P | CA-061 a CA-062 | #2 | 🔲 |

---

## Agrupamento por Tela

### T-00: Escolha de Canal (`/lpco/novo`)
- Story #2, #5, #6, #19, #23

### T-01: Lista de LPCOs (`/lpco`)
- Story #1, #7

### T-02/T-03/T-04: Wizard de Criacao
- Story #2, #3, #4

### T-05/T-06: Import Planilha / Smart Read
- Story #6, #19

### T-07 a T-12: Detalhe do LPCO (abas)
- Story #8 (Exigencias), #14 (Documentos), #15/#16 (Vinculos), #17 (Historico)

### T-13: Simulador TA
- Story #21

### T-14: Credenciais Siscomex
- Story #12, #13

### Backend-only (sem tela propria)
- Story #9 (cron cancelamento), #10 (alertas), #11/#18 (Portal Unico), #20 (API)

---

## Caminho Critico

```
#2 (criar) → #3 (itens) → #4 (registrar) → #7 (status) → #8 (exigencias) → #9 (cancelamento auto)
                                                ↓
                                          #15 (vinculos) → #16 (saldo Flex)
                                                ↓
#12 (certificado) → #11 (integracao Portal) → #18 (webhooks)
```

## Stories sem dependencia (podem comecar ja)

- **#1** — Lista de LPCOs
- **#2** — Criar LPCO manual
- **#12** — Infraestrutura certificado digital
- **#21** — Simulador TA

---

## Resumo

- **Total de stories no MVP:** 23
- **Estimativa total:** 10-12 semanas
- **Stories sem dependencia:** #1, #2, #12, #21
- **Caminho critico:** #2 → #3 → #4 → #7 → #11 → #18
