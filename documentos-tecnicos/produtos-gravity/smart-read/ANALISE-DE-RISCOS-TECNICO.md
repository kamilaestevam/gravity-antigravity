# Smart Docs — Matriz Consolidada de Análise de Fatura Comercial

> **Status:** Pipeline 4 passos em produção  
> **SSOT matriz:** `shared/matriz-validacao-invoice-smart-read.ts`  
> **Passo 1 (Código):** `shared/passo-1-validacao-codigo-invoice-smart-read.ts`  
> **Passo 2 (API CNPJ):** `server/src/lib/passo-2-api-cnpj-invoice-smart-read.ts`  
> **Passo 3 (LLM Analista):** `server/src/lib/prompt-analista-invoice-smart-read.ts`  
> **Passo 4 (UI):** `client/.../conferencia-riscos-aduaneiros-nova-leitura-smart-read.tsx`

---

## 1. Pipeline de processamento

```
[OCR / Extração bruta]
        │
        ▼
[Passo 1 — Validação de Código (Backend)]
  • Aritmética: linha, subtotal, fechamento financeiro
  • CNPJ módulo 11, NCM estrutural, ISO 4217, SWIFT/IBAN
  • Peso bruto ≥ líquido, cruzamentos Invoice × PL
        │
        ▼
[Passo 2 — API Cadastro CNPJ]
  • Consulta situação cadastral RFB (BrasilAPI / bureau configurável)
  • JSON oficial anexado ao contexto para o Passo 3
        │
        ▼
[Passo 3 — Analista IA (LLM)]
  • Fuzzy match razão social e endereço (invoice vs RFB)
  • Pré-classificação NCM/HS, descrição comercial, MAPA madeira
  • Exportador, fabricante, notify party, termos de pagamento
  • NÃO recalcula matemática do Passo 1
        │
        ▼
[Passo 4 — Consolidação na UI]
  • Alertas por seção da matriz (1–8)
  • Status: Verde / Amarelo / Vermelho (`status_matriz`)
```

---

## 2. Matriz — 8 seções

| Seção | Escopo | Motor principal |
|-------|--------|-----------------|
| 1 — Identificação | Número, data, PO/Proforma, paginação | Código + LLM |
| 2 — Cadastral (RFB) | CNPJ, status API, fuzzy nome/endereço, exportador, fabricante | Código + API + LLM |
| 3 — Logística | Incoterm, coerência geográfica, rotas, regimes especiais | Código + LLM + RAG |
| 4 — Itens fiscais | Part number, descrição, NCM, unidades | Código + LLM |
| 5 — Financeiro | ISO 4217, unicidade cambial, linha, subtotal, fechamento | Código |
| 6 — Bancário | Beneficiário, SWIFT/IBAN, prazos de pagamento | Código + LLM |
| 7 — Pesos/embalagens | Gross ≥ Net, volumes, MAPA/NIMF 15 | Código + LLM |
| 8 — Legitimidade | Assinatura / carimbo | LLM |

Lista completa de regras (`S1-01` … `S8-01`): ver `MATRIZ_VALIDACAO_INVOICE` no SSOT.

---

## 3. Campos do card de alerta

| Campo | Uso na UI |
|-------|-----------|
| `motivo` | **O que é o risco** — factual |
| `analise` | **Motivo** — justificativa técnica (nunca meta-instrução à IA) |
| `correcao_sugerida` | Ação de/para + disclaimer fiscal quando classificação |
| `secao_matriz` | Agrupamento na UI (seções 1–8) |
| `id_regra_matriz` | Ex.: `S2-03`, `S5-03` |
| `motor_validacao` | `codigo` · `api` · `llm` · `rag` |
| `status_matriz` | `verde` · `amarelo` · `vermelho` |

---

## 4. Passo 3 — Diretriz do prompt (Analista)

O LLM recebe: JSON da invoice + JSON CNPJ oficial + erros aritméticos do Passo 1 (verdade absoluta) + itens para classificação + tributos NCM.

**Restrições:**
- Fuzzy match: ignorar abreviações (`Ltda`/`Limitada`); alerta crítico se bairro, cidade, matriz/filial divergirem.
- Classificação: validar aderência NCM × descrição; sugerir de/para com 8 dígitos.
- Não inventar lei/IN/RFB — `citacoes_normativas` só com fonte em Siscomex ou RAG.
- Disclaimer fiscal **apenas** em `correcao_sugerida`.

---

## 5. Variáveis de ambiente

| Variável | Uso |
|----------|-----|
| `GEMINI_API_KEY` | Passo 3 — Analista IA + classificação fiscal dedicada |
| `CNPJ_CONSULTA_BASE_URL` | Passo 2 — default `https://brasilapi.com.br/api` |
| `CADASTROS_SERVICE_URL` | Validação NCM Siscomex |

---

## 6. Testes

- `testes/.../analisar-riscos-aduaneiros-leitura.test.ts` — Passo 1 via adapter cliente
- `testes/.../texto-analise-riscos-leitura-smart-read.test.ts` — formatadores matemáticos

**Reiniciar BFF `:8033` após alterações em `server/`.**
