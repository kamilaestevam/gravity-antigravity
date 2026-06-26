# Nova Leitura — Passo 03 (Conferência) — Smart Docs

> **Escopo deste documento:** somente **Passo 3** do wizard — grid de campos extraídos (paridade layout `dt-*` do Processo).  
> **Passo anterior:** [NOVA-LEITURA-PASSO-DOIS-TECNICO.md](./NOVA-LEITURA-PASSO-DOIS-TECNICO.md) · **Passo 4:** doc futuro.

---

## 1. SSOT de código

| Artefato | Caminho |
|----------|---------|
| Modal wizard | `client/src/components/nova-leitura-smart-read/modal-nova-leitura-smart-read.tsx` |
| Área conferência | `client/src/components/nova-leitura-smart-read/area-conferencia-nova-leitura-smart-read.tsx` |
| Grid de campos | `client/src/components/nova-leitura-smart-read/conferencia-campos-nova-leitura-smart-read.tsx` |
| Linha editável | `client/src/components/nova-leitura-smart-read/campo-linha-conferencia-nova-leitura-smart-read.tsx` |
| **Helpers campo data** | `client/src/shared/data-campo-conferencia-leitura-smart-read.ts` |
| Seções / labels legado | `client/src/shared/extrair-secoes-conferencia-leitura-smart-read.ts`, `mapear-rotulo-campo-legado-conferencia-smart-read.ts` |
| Estilos | `client/src/components/nova-leitura-smart-read/modal-nova-leitura-smart-read.css` |
| Cores barra lateral | [padrao-dt-row-status-campos.md](../../ux/design-system/padrao-dt-row-status-campos.md) |

---

## 2. Campo **data** — padrão oficial Gravity (obrigatório)

Campos cuja chave termina em `Date` (ex.: `document.documentDate`, `document.shippedOnBoardDate`) **não** usam input texto cru nem `CampoCalendarioGlobal` como trigger permanente no card.

| Modo | Comportamento |
|------|----------------|
| **Leitura** | Mesmo layout dos demais campos (`dt-row-value`): valor em **DD/MM/AAAA** via `formatarDataConferenciaSmartRead` |
| **Edição** | Input fino igual ao texto (`dt-row-edit input`, borda indigo) + máscara `DD/MM/AAAA` + ícone calendário à direita |
| **Calendário** | Clique no ícone abre `CampoCalendarioGlobal` (`modoUnico`, `semTrigger`) em **portal** (`document.body`, `z-index: 10001`) — paridade TabelaVirtualGlobal / Pedido; **nunca** inline dentro do `.dt-row` (evita corte por `overflow: hidden`) |
| **Persistência** | Valor canônico **`yyyy-mm-dd`** em `resultado_extracao` / `dados` (via `dateToIsoConferenciaSmartRead`) |
| **Parse entrada** | ISO, `dd/mm/aaaa`, `dd.mm.aaaa` normalizados por `normalizarValorDataConferenciaParaIso` — parse local (`new Date(y, m-1, d)`) para evitar off-by-one de fuso |

**Proibido:** exibir `2026-06-25` cru na UI; substituir o input padrão pelo componente completo do calendário no fluxo de edição; renderizar painel do calendário dentro do card sem portal.

**Testes UNI:** `testes/testes-unitarios/produto-gravity/smart-read/data-campo-conferencia-leitura-smart-read.test.ts`

---

## 3. Outros tipos de campo na conferência

| Tipo | Detecção | Edição |
|------|----------|--------|
| Texto | default | `input` texto em `dt-row-edit` |
| Booleano | prop `tipo="booleano"` ou chave `isSigned` | `SelectGlobal` Sim/Não → exibição «Assinado» / «Não assinado» |

---

## 4. Cores da barra lateral (resumo)

Ver SSOT completo: [padrao-dt-row-status-campos.md](../../ux/design-system/padrao-dt-row-status-campos.md).

| Estado | Cor barra | Smart Docs vs Processo |
|--------|-----------|-------------------------|
| Preenchido | Verde `#34d399` | Igual |
| Vazio | Cinza `vazio-opc` no card; amarelo só na legenda «Vazios» | Processo distingue obrigatório (amarelo) vs opcional (cinza) |
| Alterado | Roxo `#a78bfa` + badge | Só Smart Docs |

---

## 5. Legenda do topo (filtros)

Contadores clicáveis: **Verificados** (azul, total) · **Preenchidos** (verde) · **Vazios** (amarelo) · **Preenchidos alterados** (roxo). Filtram o grid; não alteram a cor individual do card vazio (cinza).

---

## 6. Contador discreto de tokens IA (sidebar)

> **Task:** TASK-000357 · Persistência: [PERSISTENCIA-DADOS-TECNICO.md](./PERSISTENCIA-DADOS-TECNICO.md) §3.1

| Aspecto | Regra |
|---------|-------|
| **Onde** | Rodapé da sidebar (`painel-lateral-arquivos-nova-leitura-smart-read.tsx`), acima de Voltar/Continuar |
| **Quando** | Visível a partir do **passo 2** (`exibirContadorTokens={passo >= 2}`) |
| **Componente** | `contador-tokens-discreto-nova-leitura-smart-read.tsx` |
| **Hook** | `use-contador-tokens-leitura-smart-read.ts` → `GET /leituras/tokens/:id_leitura` |
| **Exibição** | Sempre mostra o total (inclui `0 tokens IA`); formatação `formatarTokensDiscretoLeituraSmartRead` |
| **Atualização** | Após QA ou Análise de Riscos via `onTokensAtualizados` / `uso_llm_leitura` na resposta; senão recarrega do GET |

**Fonte dos números:** `usageMetadata` do Gemini (`promptTokenCount`, `candidatesTokenCount`) — não inclui extração DATI do passo 2. Abas que disparam LLM: **Análise de Riscos** e **Consultor Inteligente** (Rafa); **Conferência de Campos** sozinha mantém 0 até outra aba rodar.
