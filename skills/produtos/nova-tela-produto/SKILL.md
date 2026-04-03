# SKILL: Nova Tela de Produto — Padrão Inviolável

> **AGENTE:** Esta skill é obrigatória antes de criar, editar ou replicar qualquer tela de produto no ecossistema Gravity. Nenhuma etapa pode ser pulada.

---

## 0. Premissa Fundamental

O ecossistema Gravity opera em dois níveis de código:

| Nível | Localização | Comportamento |
|---|---|---|
| **Compartilhado** | `nucleo-global/` | Mudança aqui → todos os produtos são atualizados automaticamente |
| **Isolado por produto** | `produto/X/client/src/` | Mudança aqui → só afeta o produto X |

O **demo** em `nucleo-global/Layout/tela-produto-global/demo/` é a referência canônica do padrão. Ele nunca é importado por produtos — é copiado e depois diverge livremente dentro de cada produto.

---

## 1. Antes de Começar — Checklist Obrigatório

- [ ] O `productId` está registrado em `nucleo-global/Logo/produtos/src/produtos.tsx`?
- [ ] A cor e o logo do produto estão definidos no `PRODUTO_META`?
- [ ] A pasta `produto/X/client/src/` existe com `App.tsx` e `vite.config.ts`?
- [ ] O `vite.config.ts` tem todos os aliases `@nucleo/*` apontando para `nucleo-global/`?
- [ ] Nenhum import aponta para outro produto?

**Se qualquer item estiver incompleto → parar e resolver antes de continuar.**

---

## 2. Registro do Produto (Pré-requisito #1)

Antes de qualquer código de tela, o produto DEVE estar em:

```
nucleo-global/Logo/produtos/src/produtos.tsx
```

```ts
'meu-produto': {
  icon:     <LogoMeuProduto size={16} />,
  color:    '#HEXCOR',
  sublabel: 'domínio · função',
},
```

Isso garante que `TelaProdutoGlobal` aplique cor e logo automaticamente em **todo o layout** — sidebar, menu topo, destaques — sem nenhuma linha extra no produto.

---

## 3. Estrutura de Arquivos — Padrão Canônico

```
produto/X/client/src/
├── App.tsx                      ← Shell do produto (routing + TelaProdutoGlobal)
├── App.css                      ← Reset + variáveis CSS se necessário
├── shared/
│   ├── cardCatalog.ts           ← Métricas do domínio do produto
│   ├── useCardPreferences.ts    ← Cópia do padrão (chave 'X:cards-v1')
│   ├── useCardValues.ts         ← Valores da API real do produto
│   ├── api.ts                   ← Chamadas HTTP do produto
│   ├── types.ts                 ← Tipos TypeScript do produto
│   └── config.ts                ← PRODUCT_CONFIG (nav, rotas)
└── pages/
    ├── dashboard/
    │   ├── Dashboard.tsx        ← Cards configuráveis
    │   └── Dashboard.css
    ├── lista/
    │   ├── Lista.tsx            ← Tabela global
    │   └── Lista.css
    └── Configuracoes.tsx        ← Período + DnD + catálogo
    └── Configuracoes.css
```

---

## 4. O Que Muda por Produto vs O Que É Idêntico

### Muda (domínio do produto)
| Arquivo | O que adaptar |
|---|---|
| `App.tsx` | `PRODUCT_ID`, `PRODUCT_NAME`, `ROUTE_LABELS`, `NAV_ITEMS`, `ECOSYSTEM_NODES` |
| `shared/cardCatalog.ts` | IDs, labels, descrições e tipoAgg das métricas do produto |
| `shared/useCardPreferences.ts` | Chave do localStorage: `'X:cards-v1'` e `'X:cards-updated'` |
| `shared/useCardValues.ts` | Valores reais da API + tooltips com dados do domínio |
| `pages/dashboard/Dashboard.tsx` | `CARD_ICONE`, `CARD_VARIANTE`, `CARD_LABEL` (cores e ícones do domínio) |
| `pages/Configuracoes.tsx` | `CARD_VISUAL`, `PERIODO_KEY = 'X:periodo-comparacao'` |

### Idêntico (padrão inviolável)
| O que | Por quê não muda |
|---|---|
| Estrutura JSX do `App.tsx` | `TelaProdutoGlobal` recebe sempre os mesmos props |
| Estrutura de `useCardPreferences.ts` | Lógica de DnD/visibilidade/sync é universal |
| CSS classes (`cfg-*`, `demo-db-*`) | Visual idêntico entre produtos |
| Estrutura de `Configuracoes.tsx` | Período + Meus Cards + Catálogo — sempre igual |
| Props do `TelaProdutoGlobal` | Interface do componente é compartilhada |

---

## 5. Regras Invioláveis de Código

### Imports
```ts
// ✅ CORRETO — só nucleo-global e local
import { TelaProdutoGlobal } from '@nucleo/tela-produto-global'
import { CardBasicoGlobal }  from '@nucleo/card-global'
import { useCardPreferences } from '../shared/useCardPreferences'

// ❌ PROIBIDO — nunca importar de outro produto
import { algo } from '../../pedido/src/shared/utils'
import { algo } from '@produto/simula-custo'
```

### Storage Keys
```ts
// ✅ CORRETO — prefixo do produto
const STORAGE_KEY = 'nf:cards-v1'       // NF Importação
const STORAGE_KEY = 'lpco:cards-v1'     // LPCO
const STORAGE_KEY = 'pedido:cards-v1'   // Pedido

// ❌ PROIBIDO — chave genérica (conflito entre produtos)
const STORAGE_KEY = 'cards-v1'
```

### CSS
```ts
// ✅ CORRETO — variáveis CSS do design system
color: var(--ws-accent, #818cf8)
background: var(--surface-card, rgba(255,255,255,0.03))

// ❌ PROIBIDO — cor hardcoded do produto no CSS compartilhado
color: #34d399   // cor do SimulaCusto hardcoded
```

### TypeScript
```ts
// ✅ Tipagem estrita
const PERIODOS = [...] as const
type PeriodoId = (typeof PERIODOS)[number]['id']

// ❌ Proibido
const periodo: any = ...
```

---

## 6. Propagação de Mudanças — Regra de Ouro

```
SE a mudança é visual/comportamental e faz sentido em TODOS os produtos
→ editar em nucleo-global/ → todos os produtos ganham automaticamente

SE a mudança é específica do domínio de um produto
→ editar em produto/X/client/src/ → só esse produto é afetado

SE a mudança é um novo padrão de tela (ex: nova seção em Configuracoes)
→ 1. atualizar o demo em nucleo-global/Layout/tela-produto-global/demo/
→ 2. replicar manualmente para os produtos que devem ter a feature
→ 3. produtos que não precisam NÃO são afetados
```

**Nunca** atualizar o demo sem avaliar impacto nos produtos existentes.
**Nunca** atualizar um produto com algo que deveria estar no nucleo-global.

---

## 7. Replicação de Produto — Passo a Passo

```
1. Registrar productId em PRODUTO_META (cor + logo)
2. Copiar demo/src/App.tsx → produto/X/client/src/App.tsx
3. Substituir: PRODUCT_ID, PRODUCT_NAME, NAV_ITEMS, ROUTE_LABELS, ECOSYSTEM_NODES
4. Copiar demo/src/shared/ → produto/X/client/src/shared/
5. Substituir em useCardPreferences: 'demo:cards-v1' → 'X:cards-v1'
6. Substituir em Configuracoes: 'demo:periodo-comparacao' → 'X:periodo-comparacao'
7. Reescrever cardCatalog.ts com as métricas reais do produto
8. Reescrever useCardValues.ts conectando à API real do produto
9. Copiar demo/src/pages/ → produto/X/client/src/pages/
10. Adaptar CARD_ICONE e CARD_LABEL com os ícones/labels do domínio
11. Configurar vite.config.ts com aliases @nucleo/* corretos
12. npm install + npm run dev — verificar que carrega sem erros
```

---

## 8. Atualização do Demo — Quando e Como

O demo deve ser atualizado quando:
- Um novo componente global é adicionado ao nucleo-global
- Um novo padrão de tela é definido (ex: nova categoria em Configurações)
- O design system muda (cores, espaçamentos, tipografia)

O demo **nunca** deve ter:
- Dados reais de produção
- Imports de produtos específicos
- Lógica de negócio de qualquer domínio
- Chamadas a APIs reais

---

## 9. Checklist de Entrega

- [ ] `productId` registrado em `PRODUTO_META`
- [ ] Nenhum import de outro produto
- [ ] Storage keys com prefixo do produto
- [ ] `useCardPreferences` com chave única do produto
- [ ] `cardCatalog` com métricas reais do domínio
- [ ] `useCardValues` conectado à API real (ou mock aprovado)
- [ ] `vite.config.ts` com todos os aliases `@nucleo/*`
- [ ] Dashboard renderiza cards configuráveis corretamente
- [ ] Configurações: período + DnD + catálogo funcionando
- [ ] Tema light/dark funciona (`[data-theme]`)
- [ ] Sidebar colapsa e título do topo muda para nome do produto
- [ ] Título da página muda conforme rota (Dashboard/Lista/Kanban/Configurações)
