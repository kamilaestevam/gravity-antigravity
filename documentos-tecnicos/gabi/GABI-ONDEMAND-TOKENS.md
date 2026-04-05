# GABI On-Demand + Sistema de Tokens — Especificação

> **Versão:** 1.0
> **Data:** Abril 2026
> **Status:** Especificação aprovada — aguardando implementação

---

## Visão Geral

A GABI deixa de analisar automaticamente (modelo que consumiria tokens sem controle) e passa a operar **sob demanda**: um ícone `✦` aparece em campos selecionados de qualquer produto Gravity. O usuário clica quando precisa de ajuda. Cada chamada consome tokens reais do Gemini, contabilizados por tenant.

> **Importante:** a análise determinística de fórmulas (`formulaEngine` + `gabiSemantica`) continua sempre-ativa e gratuita — zero tokens. Apenas a chamada ao LLM (Gemini) é on-demand e consome tokens.

---

## 1. Ícone ✦ por Campo

### Posicionamento
`✦` fixo ao lado direito do label de cada campo onde a GABI tem contexto relevante para ajudar.

**Onde NÃO aparece:** campos triviais sem contexto de negócio (ex: "Criado em", "ID interno").

**Onde aparece:** campos com regras de negócio, cálculos, dependências ou termos específicos do domínio.

### Estados do ícone

| Estado | Visual | Condição |
|--------|--------|----------|
| Disponível | `✦` cor neutra | Tokens disponíveis |
| Hover | `✦` iluminado + tooltip "Perguntar à GABI" | — |
| Carregando | `✦` rotação suave (CSS spin) | Aguardando resposta |
| Esgotado | `✦` acinzentado + tooltip "Tokens esgotados" | Quota zerada |
| Sem permissão | oculto | Usuário sem acesso à GABI |

---

## 2. Popover de Resposta

### Dimensões
Largura: ~360px. Altura: dinâmica com scroll interno se necessário.

### Loading state (UX)
Ao clicar: popover abre **imediatamente** com skeleton animado (2 linhas pulsando). Sem spinner bloqueante. O ícone entra em rotação suave enquanto aguarda. Quando a resposta chega, substitui o skeleton com animação de fade-in.

### Estrutura

```
┌──────────────────────────────────────────────┐
│  ✦ GABI                               [×]   │
│──────────────────────────────────────────────│
│                                              │
│  [resposta contextual ao campo]              │
│                                              │
│  ░░░░░░░░░░░░░░░  ← skeleton enquanto        │
│  ░░░░░░░░░        ← carrega                 │
│                                              │
└──────────────────────────────────────────────┘
```

### Badge de tokens (separado do popover)
Fixo no canto superior da tela (header ou próximo ao campo) enquanto o usuário está em telas com ícones GABI.

```
✦ 36.500 / 50.000 tokens
```

Cor do badge acompanha o consumo:
- Verde: 0–69%
- Amarelo: 70–89%
- Laranja: 90–99%
- Vermelho: 100%

---

## 3. Sistema de Tokens

### Unidade de cobrança
**Tokens reais** (input + output somados por chamada Gemini). Não há abstração de "créditos".

### Fonte da quota
Não existe plano fixo. A quota vem de uma de duas fontes:

| Fonte | Onde configurar | Prioridade |
|-------|-----------------|------------|
| **Token padrão do produto** | Admin → Produtos Gravity → aba Tokens | Base |
| **Negociação especial** | Admin → Produtos Gravity → aba Negociação (já existe) | Sobrescreve o padrão |

### Regras

| Regra | Comportamento |
|-------|--------------|
| Reset | Dia 1 de cada mês |
| Rollover | Tokens não usados **expiram** — não acumulam |
| Ao atingir 80% | Badge muda para amarelo no cliente |
| Ao atingir 90% | Badge laranja + notificação para admin do tenant |
| Ao atingir 100% | GABI desabilitada → usuário vê opção de autorizar compra adicional (se tiver permissão) |

### Comportamento ao estourar
- Usuário **com** permissão de compra: vê modal "Seus tokens acabaram. Autorizar X tokens adicionais por R$ Y?"
- Usuário **sem** permissão de compra: vê mensagem "Tokens esgotados. Contate o administrador."

---

## 4. Nova Aba "Tokens" — Admin / Produtos Gravity

### Localização
Modal de edição de produto no painel Admin:

```
Dados Básicos | Setup | Valor do Produto | Usuários | Help Desk | Tokens | Negociação
```

### Conteúdo da aba

#### Seção 1 — Quota Padrão
```
Token padrão mensal por tenant: [__________] tokens
Aplica-se a todos os tenants deste produto, salvo negociação especial.
Tokens não usados expiram no dia 1 de cada mês (sem rollover).
```

#### Seção 2 — Consumo Visual (gráfico donut)

Gráfico donut pequeno (~64px) com animação de fill ao carregar.

**Estado compacto:** donut colorido pela % consumida (verde → amarelo → laranja → vermelho).

**Ao clicar/hover — tooltip expande:**
```
┌──────────────────────────────┐
│  ████████░░  73%             │
│  36.500 / 50.000 tokens      │
│  Renova em 18 dias           │
└──────────────────────────────┘
```

Dados agregados de todos os tenants do produto:
- Total consumido este mês
- Média por tenant
- Tenant com maior consumo

#### Seção 3 — Comportamento ao Estourar
```
Ao atingir 100% da quota:
  ● Notificar + permitir compra (usuários com permissão)
  ○ Bloquear sem opção de compra
  ○ Bloquear para todos

Alertas automáticos:
  [✓] Aviso ao atingir 80%
  [✓] Notificação ao admin ao atingir 90%
  [✓] Bloqueio ao atingir 100%
```

---

## 5. Custo e Precificação

### Motor
**Gemini 2.5 Flash** — menor custo da família Gemini, adequado para respostas contextuais de campo.

### Custo Google por 1.000 tokens

| Tipo | Custo |
|------|-------|
| Input | US$ 0,075 / 1M = **R$ 0,41 por 1.000** |
| Output | US$ 0,30 / 1M = **R$ 1,65 por 1.000** |
| **Blended (mix real de chamada)** | **~R$ 0,72 por 1.000** |

### Composição típica de 1 chamada GABI

| Componente | Tokens |
|------------|--------|
| System prompt + contexto do produto | ~400 input |
| Estado do formulário + definição do campo | ~300 input |
| Resposta da GABI | ~250 output |
| **Total por chamada** | **~950 tokens** |

**Custo real por chamada:** ~R$ 0,0007 (menos de 0,1 centavo)

### Tabela de precificação sugerida

| Quota mensal | Custo Google | Venda sugerida | Margem |
|---|---|---|---|
| 50.000 tokens | R$ 0,04 | R$ 9,90/mês | ~99% |
| 200.000 tokens | R$ 0,14 | R$ 29,90/mês | ~99% |
| 1.000.000 tokens | R$ 0,72 | R$ 99,90/mês | ~99% |

**Referência rápida para a planilha:**
- Você paga ao Google: **~R$ 0,72 a cada 1.000 tokens consumidos**
- Pode vender os mesmos 1.000 tokens por **R$ 10–15** com margem saudável

> ⚠️ Preços Google verificados em agosto/2025. Confirmar em `ai.google.dev/pricing` antes de fechar pricing ao cliente.

---

## 6. Arquitetura Técnica (visão geral)

```
[Campo com ✦]
     │
     └─ onClick → useGabiOnDemand(campo, contexto)
                       │
                       ├─ verifica quota local (badge atualiza)
                       ├─ POST /api/gabi/field-help
                       │       ├─ autentica tenant + verifica quota no banco
                       │       ├─ chama Gemini 2.5 Flash
                       │       ├─ registra tokens consumidos (GabiTokenLog)
                       │       └─ retorna resposta
                       └─ exibe no popover
```

### Tabelas necessárias (fragment.prisma por produto ou serviço compartilhado)

```prisma
model GabiTokenLog {
  id           String   @id @default(cuid())
  tenant_id    String
  product_id   String
  user_id      String
  campo        String   // qual campo foi consultado
  tokens_input Int
  tokens_output Int
  tokens_total  Int
  mes_ref      String   // "2026-04" — para agrupamento mensal
  created_at   DateTime @default(now())

  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@index([tenant_id, mes_ref])
}

model GabiTokenQuota {
  id           String   @id @default(cuid())
  tenant_id    String   @unique
  product_id   String
  quota_mensal Int      // padrão do produto, sobrescrito por negociação
  mes_ref      String   // "2026-04"
  tokens_usados Int     @default(0)
  updated_at   DateTime @updatedAt

  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@index([tenant_id, mes_ref])
}
```

---

## 7. O que Muda vs. Modelo Anterior

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Análise determinística (parser + semântica) | Sempre-ativa, automática | **Permanece igual — gratuita** |
| Análise LLM (Gemini) | Auto-disparada após debounce | **On-demand — usuário clica ✦** |
| Custo de tokens | Descontrolado, toda digitação | **Controlado, apenas quando solicitado** |
| Visibilidade do custo | Nenhuma | **Badge em tempo real** |
| Quota | Não existia | **Definida no Admin por produto** |
