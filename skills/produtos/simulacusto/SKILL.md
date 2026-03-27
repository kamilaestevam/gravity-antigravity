---
name: antigravity-simulacusto
description: "Use esta skill sempre que uma tarefa envolver o produto SimulaCusto da plataforma Gravity. Define as regras de negócio exclusivas do produto: engine de cálculo fiscal (II, IPI, PIS, COFINS, ICMS por dentro), estrutura completa dos campos da Estimativa de Custo, integração com Portal Único SISCOMEX via hCaptcha/certificado A1, cotação BACEN PTAX, estratégia anti-captcha com CapSolver, cache de alíquotas, fallback offline com TIPI/TEC, acordos comerciais, ICMS por UF, dashboard de estimativas e PRODUCT_CONFIG do produto. NÃO cobre funcionalidades já existentes no Gravity (Tabela Global, Modal, Gabi, Email, WhatsApp, Relatórios, Histórico, Notificações, etc.) — para esses, consultar as skills específicas de cada serviço."
---

# SimulaCusto — Produto Gravity

> [!IMPORTANT]
> **SINGLE SOURCE OF TRUTH (SSOT):** 
> Todas as tarefas relacionadas ao SimulaCusto DEVEM seguir rigorosamente o PRD (Product Requirements Document) oficial disponível em:
> **https://docs.google.com/document/d/1xOjYUtixZ0DI0O1Fws78lj2mAg1utTfuoO0667s_AfM/edit?usp=sharing**
> Os agentes devem ler este documento na íntegra ANTES de qualquer implementação.

## O Que é Este Produto

Módulo de inteligência fiscal e viabilidade financeira da plataforma Gravity. Permite que importadores e tradings calculem o **custo total de uma operação de importação (Landed Cost)** antes mesmo de fechar o negócio, considerando impostos, taxas, frete e câmbio em tempo real.

---

## Comparativo de Fluxos de Consulta

| Critério | Público (Sem Certificado) | Autenticado (Certificado A1) |
| :--- | :--- | :--- |
| **Certificado** | Não obrigatório | Obrigatório |
| **hCaptcha** | Sim (por requisição) | Não |
| **Limite** | Por IP + Captcha | Por CPF/CNPJ (~2-3k/dia) |
| **Automação** | Requer serviço Anti-Captcha | Totalmente automatizável |
| **Custo Adicional** | Serviço Anti-Captcha | Certificado A1 (~R$ 200/ano) |

---

## PRODUCT_CONFIG

```json
{
  "product": "simulacusto",
  "enabled": true,
  "features": {
    "siscomex_integration": "active",
    "bacen_auto_update": true,
    "default_icms_mode": "inside_calc",
    "anti_captcha_provider": "capsolver",
    "token_pool_enabled": true
  },
  "services": [
    "engine-fiscal",
    "siscomex-connector",
    "ptax-service",
    "docx-generator"
  ]
}
```

---

## Endpoints de API (Conforme PRD)

- `POST /ttce/api/ext/simular-calculo-publico` — Simulação padrão (requer `hCaptchaToken`).
- `GET /ttce/api/ext/ncm/{codigo}` — Detalhes técnicos de um NCM de 8 dígitos.
- `GET /ttce/api/ext/ncm/busca?q={termo}` — Busca dinâmica de NCMs.
- `GET /ttce/api/ext/paises` — Lista de países ISO 3166-1 alpha-2.
- `GET /ttce/api/ext/ufs` — Lista de UFs e alíquotas internas de ICMS.

---

## Estrutura de Payloads

### Request Payload (`POST /simular-calculo-publico`)
```json
{
  "ncm": "8471.30.19",
  "paisOrigem": "US",
  "dataFatoGerador": "2026-03-22",
  "valorAduaneiro": 5925.00,
  "tipoOperacao": "IMP",
  "ufDesembaraco": "SP",
  "cnpjImportador": "00000000000000",
  "recolhimentoIcms": true,
  "hCaptchaToken": "TOKEN_RESOLVIDO"
}
```

### Response Payload
```json
{
  "sucesso": true,
  "data": {
    "tributos": {
      "ii": { "aliquota": 16.00, "valor": 948.00, "baseCalculo": 5925.00 },
      "ipi": { "aliquota": 0.00, "valor": 0.00 },
      "pis": { "aliquota": 2.10, "valor": 124.42 },
      "cofins": { "aliquota": 9.65, "valor": 571.76 },
      "icms": { "aliquota": 18.00, "valor": 1448.65, "uf": "SP" }
    },
    "totalTributos": 3092.83,
    "totalImportacao": 9017.83
  }
}
```

---

## Engine de Cálculo Fiscal

A ordem de cálculo deve seguir estritamente a legislação aduaneira brasileira:

1.  **Valor Aduaneiro (V.A.):** `(Produto + Frete + Seguro + Taxas Origem) * PTAX`
2.  **II:** `V.A. * Alíquota II`
3.  **IPI:** `(V.A. + II) * Alíquota IPI`
4.  **PIS:** `V.A. * Alíquota PIS`
5.  **COFINS:** `V.A. * Alíquota COFINS`
6.  **Base ICMS (Por Dentro):** `(V.A. + II + IPI + PIS + COFINS + Taxas Destino) / (1 - Alíquota ICMS)`
7.  **ICMS:** `Base ICMS * Alíquota ICMS`

---

## Estratégia Anti-Captcha (Pool de Tokens)

Para mitigar a latência do CapSolver (15-45s), o sistema deve implementar:
- **Pool de Tokens:** Resolver captchas proativamente em background.
- **Validade:** Tokens expiram em 120 segundos.
- **Fallback:** Se o pool estiver vazio, disparar resolução síncrona com loading state na UI.
- **Circuit Breaker:** Após 3 falhas consecutivas no CapSolver, suspender requisições por 60s.

---

## Checklist — Requisitos de Negócio

- [ ] Campo NCM deve aceitar 8 dígitos sem pontuação.
- [ ] Países devem ser selecionados via busca ISO alpha-2.
- [ ] Moedas estrangeiras devem ser convertidas à PTAX do dia via API do Banco Central.
- [ ] Retenção de histórico de simulações com status `rascunho` ou `criada`.
- [ ] Geração de PDF/DOCX de "Memória de Cálculo" com breakdown tributário completo.
- [ ] Suporte a Benefícios Fiscais por NCM/Estado (Opcional - Fase 2).
