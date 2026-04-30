# Billing & NFS-e — Arquitetura e Checklist de Ativação

Este documento descreve a camada de cobrança e emissão fiscal do Gravity
Configurador, e o que precisa ser feito (código + burocracia) para ativar
cada provider.

## 🎯 Decisão de produto (2026-04-15, atualizada 2026-04-29)

**Provider OFICIAL do Gravity: Conta Azul.**

O Gravity usa **Conta Azul** como provider único para cobrança (boleto/Pix/cartão
recorrente) **e** emissão de NFS-e. Uma assinatura resolve ERP financeiro +
faturamento + fiscal. Veja a seção "Conta Azul" abaixo para o checklist completo.

> **Stripe foi descontinuado em 2026-04-29.** Todas as colunas `stripe_*` do banco
> foram removidas, o webhook `/webhook-stripe`, o singleton `lib/stripe.ts`, o
> `StripeProvider` e o `billingService` foram apagados, e a dependência `stripe`
> saiu do `package.json`.

**Alternativas documentadas (não recomendadas atualmente):** Itaú, Santander,
ABRASF Florianópolis direto. Mantidas como skeletons para caso de mudança
estratégica futura.

---

## Arquitetura

### Abstração `BillingProvider`

A tela `/admin/financeiro` **não conhece** Conta Azul, Itaú, Santander ou qualquer
outro gateway. Ela só conhece o contrato `GravityInvoice` e chama métodos do
`BillingProvider` retornado pela factory em `server/lib/billing/index.ts`.

```
┌────────────────────┐
│  AdminFinanceiro   │  ← componente React
│  (frontend)        │
└────────┬───────────┘
         │ adminBillingApi.*
         ▼
┌────────────────────┐
│  admin.ts routes   │  ← /api/v1/admin/faturas/*
└────────┬───────────┘
         │ getBillingProvider()
         ▼
┌────────────────────┐
│  BillingProvider   │  ← interface (types.ts)
│     interface      │
└────────┬───────────┘
         │
  ┌──────┴──────┬──────────┐
  ▼             ▼          ▼
ContaAzul    Itaú(stub)  Santander(stub)
```

**Para trocar de provider:** mudar `BILLING_PROVIDER=<name>` no `.env`.
Nenhum código do frontend precisa ser alterado.

### Abstração `NfseProvider`

Análoga ao BillingProvider, mas para emissão de NFS-e. Disparada pelo provider
de billing após pagamento confirmado (no Conta Azul, a NFS-e pode ser emitida
junto com a venda via `emitir_nfse: true`).

Se o provider retornar null (nenhuma env var configurada), a emissão é
**silenciosamente pulada**, e o fluxo de pagamento continua normal.

---

## Providers implementados

### 🟡 Conta Azul (PROVIDER OFICIAL — skeleton)

**Status:** skeleton não-funcional. Este é o provider ESCOLHIDO como padrão do
Gravity, mas a implementação real está bloqueada pelos pré-requisitos abaixo.

#### Por que Conta Azul?

- 🟢 **1 integração só** resolve cobrança + NFS-e + ERP financeiro
- 🟢 **NFS-e nativa** — Conta Azul já integrou com ~500 prefeituras incluindo Florianópolis
- 🟢 **Cobrança recorrente** via Cobrança Azul (boleto/Pix/cartão automático)
- 🟢 **Conciliação bancária automática** — faturamento entra direto no fluxo de caixa do ERP
- 🟢 **API REST OAuth2** razoavelmente estável
- 🟡 Requer plano Pro/Enterprise (~R$ 100–300/mês dependendo do tier)
- 🟡 OAuth2 Authorization Code Flow (setup inicial manual)

#### Checklist de ativação

**Pré-requisitos burocráticos:**

- [ ] **Plano Conta Azul Pro ou Enterprise** contratado (plano básico NÃO tem API).
      Verificar em https://contaazul.com/planos
- [ ] **CNPJ do Gravity cadastrado no Conta Azul**
- [ ] **Inscrição Municipal** ativa em Florianópolis cadastrada na empresa
- [ ] **Certificado Digital A1** do CNPJ uploaded no painel Conta Azul
      (Configurações → Empresa → Certificado Digital)
- [ ] **Código de serviço municipal** configurado (ex: `1.05` processamento de
      dados / `1.07` suporte técnico em TI)
- [ ] **Alíquota ISS** definida conforme contábil
- [ ] **Homologação fiscal** concluída — o Conta Azul valida com a prefeitura
      antes de liberar emissão em produção
- [ ] **Cobrança Azul** (produto de recorrência) contratado se quiser cobrança
      recorrente automática

**Pré-requisitos técnicos:**

- [ ] Cadastro de aplicação no DevPortal:
      https://developers.contaazul.com/
- [ ] Obter `client_id` + `client_secret`
- [ ] Definir `redirect_uri` da aplicação (ex:
      `https://configurador.gravity.com.br/api/v1/faturas/conta-azul/oauth-callback`)
- [ ] Implementar endpoint callback OAuth no Gravity
      (`server/routes/billing.ts`)
- [ ] Executar o fluxo OAuth2 Authorization Code **uma vez** manualmente:
  1. Admin abre a URL de autorização (com `client_id` + `redirect_uri` + `state`)
  2. Autoriza o app no Conta Azul
  3. Conta Azul redireciona pra callback com `?code=...`
  4. Gravity troca o `code` por `access_token` + `refresh_token` via POST
     em `https://api.contaazul.com/oauth2/token`
  5. **Armazena o `refresh_token`** em DB (tabela `OAuthCredential` a criar)
     ou env var em dev
- [ ] A partir daí, o provider usa o `refresh_token` pra renovar `access_token`
      (expira em ~2h)

**Env vars:**
```
BILLING_PROVIDER=conta_azul
NFSE_PROVIDER=conta_azul

CONTA_AZUL_CLIENT_ID=
CONTA_AZUL_CLIENT_SECRET=
CONTA_AZUL_REDIRECT_URI=https://configurador.gravity.com.br/api/v1/faturas/conta-azul/oauth-callback
CONTA_AZUL_REFRESH_TOKEN=                # obtido no fluxo OAuth, depois migrar pra DB
CONTA_AZUL_ENVIRONMENT=sandbox           # depois: production
```

**Endpoints que este provider usa:**

| Método | Endpoint | Uso |
|---|---|---|
| `GET`  | `/v1/sales` | listInvoices |
| `POST` | `/v1/sales` | createInvoice (venda + opcional NFS-e junto) |
| `GET`  | `/v1/sales/{id}` | getInvoice |
| `DELETE` | `/v1/sales/{id}` | voidInvoice (cancelamento) |
| `POST` | `/v1/sales/{id}/send-email` | sendInvoice |
| `POST` | `/v1/clientes` | criar/buscar cliente (usado internamente pelo createInvoice) |
| `POST` | `/v1/notas-fiscais/servico` | emissão manual de NFS-e (quando não junto com a venda) |
| `GET`  | `/v1/notas-fiscais/servico/{id}` | status da NFS-e |

**Mapping Gravity ↔ Conta Azul:**

| GravityInvoice | Conta Azul Venda |
|---|---|
| `id` | `id` (UUID) |
| `status` | `situacao`: `PENDENTE` / `PAGA` / `CANCELADA` |
| `customer.tenant_id` | `cliente.id` (Conta Azul Cliente) |
| `amount_due_cents` | `valor` × 100 |
| `due_date` | `data_vencimento` |
| `line_items` | `servicos[]` ou `produtos[]` |
| `documents[type='nfe']` | `nota_fiscal.url_pdf` após emissão |

**Fluxo esperado após ativação:**

1. Admin clica "Lançar Fatura" na tela `/admin/financeiro`
2. `POST /api/v1/admin/faturas` → `ContaAzulProvider.createInvoice`
3. Provider acha ou cria o Cliente no Conta Azul (via CNPJ do tenant)
4. Cria a Venda com `emitir_nfse: true`
5. Conta Azul envia email ao cliente com link de pagamento
6. Cliente paga (boleto/Pix/cartão)
7. Conta Azul envia webhook pra `POST /api/v1/faturas/webhook-conta-azul`
8. Webhook handler detecta `sale_paid` e a NFS-e **já foi emitida junto**
9. Status da invoice muda pra `PAID` e `documents` ganha `nfe_url`

**Implementação:** `server/lib/billing/contaAzulProvider.ts` +
`server/lib/nfse/contaAzulNfse.ts` — hoje todos os métodos lançam erro.

**Docs oficiais:**
- https://developers.contaazul.com/reference/introduction
- https://developers.contaazul.com/docs/autenticacao
- https://developers.contaazul.com/reference/notas-fiscais

---

### 🟡 Itaú (skeleton)

**Status:** skeleton não-funcional. Implementação real bloqueada por pré-requisitos.

#### Checklist de ativação

**Pré-requisitos burocráticos (fazer com o gerente Itaú PJ):**

- [ ] Conta PJ Itaú ativa
- [ ] Convênio de Cobrança Registrada contratado (CNPJ + CPF dos sócios)
- [ ] Gerente aprovou o acesso à API de Cobrança
- [ ] Recebeu: **Convênio ID**, **Carteira** (ex: 109), **Agência/Conta**

**Pré-requisitos técnicos:**

- [ ] Cadastro no DevPortal Itaú: https://devportal.itau.com.br
- [ ] Aplicação criada — gera `client_id` + `client_secret`
- [ ] Certificado mTLS baixado do DevPortal (específico do Itaú, NÃO é o A1 genérico)
- [ ] Homologação em sandbox concluída
- [ ] Liberação em produção pelo gerente

**Env vars (adicionar quando pronto):**
```
BILLING_PROVIDER=itau
ITAU_CLIENT_ID=
ITAU_CLIENT_SECRET=
ITAU_MTLS_CERT_PATH=/path/to/cert.crt
ITAU_MTLS_KEY_PATH=/path/to/key.key
ITAU_CONVENIO_ID=
ITAU_CARTEIRA=109
ITAU_ENVIRONMENT=sandbox   # depois: production
```

**Implementação:** `server/lib/billing/itauProvider.ts` — todos os métodos
lançam erro. Preencher com chamadas HTTP autenticadas por mTLS.

**Docs oficiais:**
- https://developer.itau.com.br/apis/api-cash/

---

### 🟡 Santander (skeleton)

**Status:** skeleton não-funcional.

**Aviso:** a API do Santander tem fama de lentidão e SLA inferior. Se
Gravity tiver conta nos dois bancos, **prefira Itaú**.

#### Checklist de ativação

**Pré-requisitos burocráticos:**

- [ ] Conta PJ Santander ativa
- [ ] Convênio de Cobrança contratado (`convenio` + `workspace_id`)

**Pré-requisitos técnicos:**

- [ ] Cadastro em https://developer.santander.com.br
- [ ] Aplicação criada — `client_id` + `client_secret`
- [ ] **Certificado Digital A1** do CNPJ (~R$ 200/ano, Serasa/Certisign/Valid)
- [ ] Homologação em sandbox

**Env vars:**
```
BILLING_PROVIDER=santander
SANTANDER_CLIENT_ID=
SANTANDER_CLIENT_SECRET=
SANTANDER_CERT_PATH=/path/to/a1.p12
SANTANDER_CERT_PASSWORD=
SANTANDER_CONVENIO=
SANTANDER_WORKSPACE_ID=
SANTANDER_ENVIRONMENT=sandbox
```

**Implementação:** `server/lib/billing/santanderProvider.ts`

**Docs:** https://developer.santander.com.br/api/documentacao/cobranca-titulos

---

## NFS-e — Providers

### 🟡 ABRASF Florianópolis (skeleton)

**Status:** skeleton não-funcional. Implementação real bloqueada por
pré-requisitos burocráticos.

#### Checklist de ativação

- [ ] **Inscrição Municipal** ativa do Gravity em Florianópolis (secretaria
      da fazenda municipal)
- [ ] **Certificado Digital A1** do CNPJ (pode ser o mesmo do Santander)
- [ ] Cadastro no portal NFPS Floripa: https://sistemas.pmf.sc.gov.br/nfps
- [ ] **Código de serviço municipal** definido (ex: `1.05` processamento de
      dados, `1.07` suporte técnico em TI — conforme Lei Complementar 116/2003
      + lista municipal)
- [ ] **Alíquota ISS** conferida com contábil (varia por serviço e regime)

**Env vars:**
```
NFSE_PROVIDER=abrasf_florianopolis
NFSE_FLORIPA_INSCRICAO_MUNICIPAL=
NFSE_FLORIPA_CODIGO_MUNICIPIO=4205407   # IBGE Floripa
NFSE_FLORIPA_CERT_PATH=/path/to/a1.p12
NFSE_FLORIPA_CERT_PASSWORD=
NFSE_FLORIPA_ENVIRONMENT=hom             # depois: prod
NFSE_FLORIPA_CODIGO_SERVICO=1.05
NFSE_FLORIPA_ALIQUOTA_ISS=2.5
```

**Endpoints:**
- Homologação: `https://hom-nfps.pmf.sc.gov.br/nfps-ws/NfseWSService`
- Produção: `https://nfps.pmf.sc.gov.br/nfps-ws/NfseWSService`

**Padrão ABRASF 2.03:**
- XML schema: `http://www.abrasf.org.br/nfse.xsd`
- SOAP 1.2 envelope
- Assinatura digital obrigatória (XMLDSig C14N)
- Métodos: `RecepcionarLoteRpsSincrono`, `ConsultarNfseRps`, `CancelarNfse`

**Implementação:** `server/lib/nfse/abrasfFlorianopolis.ts` — métodos lançam
erro. Preencher com cliente SOAP assinado.

---

### 💡 Alternativa recomendada: agregador

Em vez de implementar ABRASF direto (cliente SOAP + XMLDSig + conhecer o schema
de Floripa), considere usar um **agregador** que já integrou com ~500 prefeituras
brasileiras e oferece API REST única:

| Provider | Custo aproximado | Facilidade | NFS-e Floripa |
|---|---|---|---|
| **NFe.io** | R$ 0,50/nota | 🟢 REST + webhook | ✅ |
| **eNotas** | R$ 0,80/nota | 🟢 REST | ✅ |
| **TecnoSpeed** | Cotação | 🟡 SOAP legado | ✅ |
| **Focus NFe** | R$ 0,30/nota | 🟢 REST | ✅ |

**Vantagem:** 1 integração cobre clientes em qualquer cidade brasileira sem
reescrever o parser por município.

**Implementação:** criar `NfeioProvider` ou `EnotasProvider` implementando a
mesma interface `NfseProvider`. Env var:
```
NFSE_PROVIDER=nfeio
NFEIO_API_KEY=
NFEIO_COMPANY_ID=
```

---

## Fluxo completo esperado (após ativação Conta Azul)

1. Admin Gravity abre `/admin/financeiro`
2. Tela chama `GET /api/v1/admin/faturas` → `billingProvider.listInvoices()`
3. Tela renderiza invoices reais do Conta Azul
4. Admin clica "Lançar Fatura" → preenche tenant/descrição/valor/vencimento
5. `POST /api/v1/admin/faturas` → `ContaAzulProvider.createInvoice()`
6. Conta Azul cria venda + envia email ao cliente
7. Cliente paga via boleto/Pix/cartão
8. Conta Azul envia webhook `sale_paid` → handler dedicado
9. NFS-e já foi emitida junto com a venda; `documents` ganha `nfe_url`
10. Tela admin exibe ícone de NF-e ao lado do PDF
11. Download PDF e NF-e diretos via `<a href={doc.url}>`
