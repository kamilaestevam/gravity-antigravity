# GABI — Assistente de Fórmulas — Documento Técnico

> **Produto:** Pedido (COMEX) — Colunas Personalizadas
> **Versão:** 1.0
> **Data:** Abril 2026

---

## O que é a GABI

GABI (assistente de fórmulas) é um card de ajuda contextual embutido na criação de colunas do tipo `formula` dentro de Configurações → Colunas do Usuário. Ela guia o usuário durante toda a digitação da expressão, detectando erros de sintaxe, problemas semânticos e sugerindo correções com um botão "Usar" que aplica a sugestão instantaneamente.

---

## Estrutura de Arquivos

```
produto/pedido/
├── client/src/
│   ├── pages/
│   │   └── Configuracoes.tsx          ← Card GABI + lógica de debounce + catch inteligente
│   └── shared/
│       ├── formulaEngine.ts           ← Parser (lexer + recursive descent) → FormulaAST
│       ├── gabiSemantica.ts           ← Análise semântica (4 regras) + SEMANTICA_CAMPOS
│       └── api.ts                     ← gabiAnalisar() → POST /gabi-analise
└── server/src/
    ├── routes/
    │   └── colunasUsuario.ts          ← POST /gabi-analise (com Zod + feature flag)
    └── services/
        └── geminiFormulaAdvisor.ts    ← Integração Gemini 2.5 Flash (feature-flagged)

testes/testes-unitarios/pedido/
├── gabiSemantica.test.ts              ← 34 testes unitários (parser + 4 regras semânticas)
└── vitest.config.ts                   ← inclui gabiSemantica.test.ts + cobertura
```

---

## Fluxo de Estados do Card

```
campo vazio
    └─→ card ROXO  (intro — "Como montar sua fórmula")

usuário digita
    └─→ estados limpos → card ROXO (intro, mantido durante debounce 600ms)
    └─→ após 600ms sem digitação → validarFormulaConfig()

validarFormulaConfig()
    ├─ parse falha → erro detectado?
    │       ├─ "Token inesperado após fim da fórmula" → card AMARELO "Falta um operador" + sugestão
    │       └─ outro erro → card VERMELHO "Erro na expressão" (mensagem raw do parser)
    │
    └─ parse OK
            ├─ referência circular         → card VERMELHO
            ├─ campos não numéricos        → card AMARELO "Campo não numérico"
            ├─ análise semântica local     → card AMARELO (aviso) ou VERDE (ok) — zero latência
            └─ Gemini (async, opcional)    → upgrade para aviso mais detalhado (se habilitado)
```

### Variantes do Card

| Variante   | Cor     | Quando                                          |
|------------|---------|------------------------------------------------|
| `info`     | Roxo    | Campo vazio ou durante debounce                |
| `erro`     | Vermelho| Erro de sintaxe irrecuperável                  |
| `aviso`    | Amarelo | Aviso semântico, operador faltando, não-numérico|
| `ok`       | Verde   | Fórmula sintaticamente e semanticamente válida  |

---

## Parser — formulaEngine.ts

Recursive descent parser que produz uma `FormulaAST`.

### Nós da AST

```ts
type FormulaAST =
  | { tipo: 'numero';   valor: number }
  | { tipo: 'campo';    chave: string }
  | { tipo: 'binop';    op: '+' | '-' | '*' | '/'; esq: FormulaAST; dir: FormulaAST }
  | { tipo: 'se';       condicao: CondicaoAST; verdadeiro: FormulaAST; falso: FormulaAST }
  | { tipo: 'somaItens'; campo: string }
```

### Funções suportadas

| Função              | Exemplo                                             |
|---------------------|-----------------------------------------------------|
| Aritmética básica   | `campo_a + campo_b * 0.15`                          |
| SE()                | `SE(denominador == 0, 0, numerador / denominador)`  |
| SOMA_ITENS()        | `SOMA_ITENS(quantidade_total_inicial_pedido)`        |

### Erros de sintaxe comuns

| Mensagem do parser                                       | Causa                       |
|----------------------------------------------------------|-----------------------------|
| `Token inesperado após fim da fórmula: 'X'`             | Dois campos sem operador    |
| `Parêntese sem fechar`                                   | `(campo + 1` sem `)`        |
| `Expressão esperada, mas encontrado: '+'`               | Operador no início/duplo    |
| `Caractere inválido: '@'`                               | Caractere não permitido     |

---

## Análise Semântica — gabiSemantica.ts

Percorre a AST após parse bem-sucedido e aplica 4 regras em ordem de prioridade.

### SEMANTICA_CAMPOS

Metadados sobre os campos numéricos do produto Pedido:

```ts
const SEMANTICA_CAMPOS: Record<string, MetaCampo> = {
  quantidade_total_inicial_pedido:      { label: 'Quantidade Inicial',     unidade: 'qtd',  papel: 'total' },
  quantidade_cancelada_total_pedido:    { label: 'Quantidade Cancelada',   unidade: 'qtd',  papel: 'parcela', parcelaDe: 'quantidade_total_inicial_pedido' },
  quantidade_transferida_total:         { label: 'Quantidade Transferida', unidade: 'qtd',  papel: 'parcela', parcelaDe: 'quantidade_total_inicial_pedido' },
  quantidade_pronta_itens_pedido_total: { label: 'Quantidade Pronta',      unidade: 'qtd',  papel: 'parcela', parcelaDe: 'quantidade_total_inicial_pedido' },
  saldo_itens_do_pedido:               { label: 'Saldo',                  unidade: 'qtd',  papel: 'calculado' },
  valor_total:                         { label: 'Valor Total',            unidade: 'fin',  papel: 'total' },
  peso_liquido_total_pedido:           { label: 'Peso Líquido',           unidade: 'peso', papel: 'total' },
  peso_bruto_total_pedido:             { label: 'Peso Bruto',             unidade: 'peso', papel: 'total' },
  cubagem_total_pedido:                { label: 'Cubagem',                unidade: 'vol',  papel: 'total' },
}
```

### As 4 Regras (em ordem de prioridade)

| # | Nome                        | Detecta                                      | Exemplo que dispara                          |
|---|-----------------------------|----------------------------------------------|---------------------------------------------|
| 1 | Parcela somada ao seu total | parcela `+` total (dobra valor)              | `qtd_cancelada + qtd_total_inicial`         |
| 4 | Campo somado com si mesmo   | `campo + campo`                              | `valor_total + valor_total`                 |
| 3 | Divisão sem SE()            | `/` fora de `SE()`                           | `valor_total / qtd_total`                   |
| 2 | Unidades incompatíveis      | `qtd + fin`, `peso + vol`, etc. em soma/sub  | `qtd_total_inicial + valor_total`           |

**Importante:** Regra 2 só analisa operações `+` e `-`. Divisão e multiplicação entre unidades diferentes são válidas (ex: `valor / qtd` = preço unitário).

---

## Integração Gemini — geminiFormulaAdvisor.ts

### Feature flag

```
GEMINI_GABI_ENABLED=false   # padrão — análise local é o fallback
GEMINI_GABI_ENABLED=true    # habilita LLM
```

### Arquitetura dual

```
usuário digita
    └─→ análise local (gabiSemantica) → exibe imediatamente (zero latência)
    └─→ POST /gabi-analise (async)
              ├─ Gemini desabilitado → { gemini: false } → mantém resultado local
              └─ Gemini habilitado   → { gemini: true, titulo, texto, sugestao? }
                                             → upgrade do card se análise mais rica
```

### Endpoint

```
POST /api/v1/pedidos/colunas-usuario/gabi-analise

Body: {
  expressao: string,          // max 2000 chars
  campos: Array<{
    chave:   string,
    label:   string,
    unidade?: string,
    papel?:  string,
    tipo?:   string,
  }>
}

Resposta (Gemini desabilitado):  { gemini: false }
Resposta (Gemini habilitado):    { gemini: true, titulo: string, texto: string, sugestao?: string }
```

### Modelo

- `gemini-2.5-flash` — temperature: 0.2, maxOutputTokens: 256
- `responseMimeType: 'application/json'` — garante resposta estruturada
- Em caso de falha de rede → retorna `{ gemini: false }` (frontend usa resultado local)

---

## Detecção Inteligente de Erros no Catch

Quando o parser lança erro, o catch em `validarFormulaConfig` detecta padrões específicos antes de exibir mensagem raw:

### "Dois campos sem operador"

```ts
// Input: "valor_total peso_liquido_total_pedido"
// Parser lança: "Token inesperado após fim da fórmula: 'peso_liquido_total_pedido'"

if (msg.includes('Token inesperado após fim da fórmula:')) {
  // Extrai token extra e o que veio antes → monta sugestão com +
  setFormulaGabi({
    titulo:   'Falta um operador',
    texto:    `Parece que faltou um operador entre "valor_total" e "peso_liquido_total_pedido"...`,
    sugestao: 'valor_total + peso_liquido_total_pedido',
  })
  // → card AMARELO com botão "Usar" que aplica a sugestão
}
```

---

## Testes Unitários

```
testes/testes-unitarios/pedido/gabiSemantica.test.ts
```

34 testes cobrindo:

| Suite                        | Testes |
|------------------------------|--------|
| Parser — sintaxe válida      | 8      |
| Parser — sintaxe inválida    | 4      |
| Regra 1 (parcela + total)    | 6      |
| Regra 4 (campo + si mesmo)   | 3      |
| Regra 2 (unidades)           | 5      |
| Regra 3 (divisão sem SE)     | 3      |
| Casos corretos (retorna null)| 5      |

Executar:
```bash
cd gravity-antigravity
npx vitest run --config testes/testes-unitarios/pedido/vitest.config.ts
```

---

## Debounce e Sincronização de Estado

| Mecanismo                | Finalidade                                                        |
|--------------------------|-------------------------------------------------------------------|
| `formulaDebounceRef`     | Debounce de 600ms — evita análise em cada keystroke              |
| `nomeColRef`             | Ref para `novaColuna.nome` — evita closure stale no callback async|
| `camposFormulaRef`       | Ref para CAMPOS_FORMULA — evita TDZ em `useCallback`             |
| `TIPOS_NUMERICOS_FORMULA`| `useMemo([], [])` — evita recriar array a cada render             |

### Regra de exibição do card (IIFE no JSX)

```
campo vazio                    → card ROXO (intro)
estados todos limpos           → card ROXO (intro, durante debounce)
formulaErro                    → card VERMELHO
formulaGabi                    → card AMARELO (aviso ou operador faltando)
formulaValida && !formulaGabi  → card VERDE
```

---

## Adicionando novos campos ao SEMANTICA_CAMPOS

Para que a GABI reconheça um novo campo do produto e aplique as regras semânticas:

1. Abrir `produto/pedido/client/src/shared/gabiSemantica.ts`
2. Adicionar entrada em `SEMANTICA_CAMPOS`:
   ```ts
   novo_campo_exemplo: {
     label:     'Label Amigável',
     unidade:   'qtd',           // 'qtd' | 'fin' | 'peso' | 'vol'
     papel:     'parcela',       // 'total' | 'parcela' | 'calculado'
     parcelaDe: 'campo_total',   // obrigatório se papel === 'parcela'
   }
   ```
3. Adicionar testes em `gabiSemantica.test.ts` para os cenários desse campo
