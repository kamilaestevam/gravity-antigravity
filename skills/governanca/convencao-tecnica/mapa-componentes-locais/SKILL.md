---
name: antigravity-mapa-componentes-locais
description: Convenção técnica do inventário de componentes locais do Gravity (componentes específicos de um produto/serviço, fora de `nucleo-global/`) — define como cada componente é catalogado na aba "9. Componentes Locais" da planilha DDD (local, pasta, produto, props, rotas API, páginas que usam). Use ao registrar componente novo, auditar conformidade DDD ou propor renomeação. Não toca em código — só lê código para cruzar e só escreve na planilha após aprovação.
---

# Convenção Técnica — Mapa de Componentes Locais

> ⚠️ **REGRAS ABSOLUTAS:** os nomes (arquivo, componente) seguem [`lei/ddd-nomenclatura`](../../lei/ddd-nomenclatura/SKILL.md). O padrão visual e a decisão entre componente local e nucleo-global moram em [`ux/componentes`](../../../ux/componentes/SKILL.md) e [`arquitetura/nucleo-global`](../../../arquitetura/nucleo-global/SKILL.md). Cruzamentos com páginas vão para [`mapa-paginas`](../mapa-paginas/SKILL.md) e com rotas para [`mapa-rotas`](../mapa-rotas/SKILL.md).
> Esta skill **operacionaliza** o inventário de componentes locais — **não redefine** naming nem decisão de arquitetura.

---

## Princípio fundamental

A aba **`9. Componentes Locais`** é o inventário de **todo componente React específico de um produto/serviço, fora de `nucleo-global/`** — uma linha por arquivo `.tsx` exportando um componente que **não é página** (essas vão para aba 6) e **não é modal** (essas vão para aba 7). Cada linha cruza implementação real (arquivo, componente, pasta) com a forma DDD (arquivo renomeado, componente renomeado), produto dono, dependências (rotas API consumidas, páginas que usam) e status. **É a fonte da verdade dos blocos de UI exclusivos de um produto.** Antes de criar componente local novo, considerar promoção a `nucleo-global/` ou auditar reuso, consulte esta aba.

---

## Estrutura obrigatória

Cada linha tem 15 colunas. A relação chave é:

```
Local + Produto Gravity  →  Arquivo (.tsx)  →  Componente (PascalCase)
                                      ↓ (não é página nem modal — senão vai para aba 6 ou 7)
                                  Pasta (components | layout | outro)
                                      ↓ (ddd-nomenclatura)
        Arquivo DDD  +  Componente DDD  +  Status DDD
```

| # | Coluna | Conteúdo | Fonte |
|---|---|---|---|
| 1 | `Local` | `Organizacao` \| `Produto` \| `Configurador` \| `Marketplace` \| `Shell` | código |
| 2 | `Nome do arquivo` | nome do `.tsx` (ex: `BarraAcoesPedido.tsx`) | código |
| 3 | `Nome do arquivo - DDD` | canônico (PascalCase + `.tsx`) | esta skill |
| 4 | `EXPLICAÇÃO` | 1 frase do que o componente faz para quem o usa | esta skill |
| 5 | `Nome do componente` | identificador exportado **default** (sem TABs nem espaços extras) | código |
| 6 | `Nome do componente - DDD` | canônico (= arquivo sem `.tsx`) | esta skill |
| 7 | `Produto Gravity` | slug do produto/serviço (ex: `pedido`, `Configurador`, `marketplace`, `shell`, `dashboard`) | código |
| 8 | `Pasta` | `components` \| `layout` \| `outro` (enum fechado — REGRA 3) | derivada do path |
| 9 | `Qtd props detectados` | nº de props da interface/type do componente | código |
| 10 | `Rotas de API consumidas` | rotas chamadas, separadas por ` \| ` | código (grep) |
| 11 | `Models lidos (heuristico)` | models Prisma derivados das rotas consumidas | cruzamento aba 3 |
| 12 | `Usado por (paginas)` | páginas (`<Componente>.tsx`) que importam este componente, separadas por ` \| ` | código (grep) |
| 13 | `Arquivo` | path completo do `.tsx` | código |
| 14 | `Status DDD` | `OK` \| `RENOMEAR` \| `DEPRECAR` \| `NOVA` \| `IGNORAR` \| `PROMOVER` | esta skill |
| 15 | `Observacoes` | qualquer divergência ou nota técnica | esta skill |

---

## Regras

1. **Uma linha por componente local — só componentes que NÃO são página nem modal.**
   - Páginas (montadas em `<Route>`) → aba `6. mapa-paginas`
   - Modais/Drawers/Popovers → aba `7. Modais`
   - Componentes do design system (`nucleo-global/**`) → aba `8. Nucleo Global`
   - Esta aba registra **células de tabela, painéis, barras de ação, etapas de wizard, layouts de produto, widgets** locais a um produto/serviço.

2. **`Local` é um enum fechado de 5 valores** (extraídos da realidade da planilha):
   - `Organizacao` — `servicos-global/servicos-plataforma/<servico>/**`
   - `Produto` — `produto/<produto>/**`
   - `Configurador` — `servicos-global/configurador/**`
   - `Marketplace` — `servicos-global/marketplace/**`
   - `Shell` — `servicos-global/shell/**` (raiz do shell autenticado)
   - ❌ inventar (`Worker`, `Backend`) — esta aba só cataloga client; se aparecer um sexto Local, **trava e pergunta**.

3. **`Pasta` é um enum fechado de 3 valores** (1º nível depois de `src/`):
   - `components` — pasta `src/components/**` (caso comum)
   - `layout` — quando o arquivo está em `src/pages/` mas é um layout (`<Outlet/>`) e o componente não é uma tela. Detecção: nome termina em `Layout` e/ou monta `<Outlet/>`.
   - `outro` — qualquer outra pasta (`src/`, `src/widgets/`, `src/hooks/`) ou arquivos que precisam revisão (test harnesses, scripts em `.tsx`).
   - Subpastas internas (`components/SmartImport/`, `components/lista/`, `components/ConfiguracaoColunas/`, `components/flows/`, `components/layout/`) **ficam registradas no `Arquivo`**, não na coluna `Pasta`.

4. **`Nome do arquivo - DDD` segue [`lei/ddd-nomenclatura`](../../lei/ddd-nomenclatura/SKILL.md):**
   - **PascalCase** obrigatório, sufixo `.tsx`
   - ❌ camelCase (`colunasFilho.tsx` → ✅ `ColunasFilho.tsx`; `colunasPai.tsx` → ✅ `ColunasPai.tsx`)
   - ❌ kebab-case (`barra-acoes.tsx` → ✅ `BarraAcoes.tsx`)
   - **Sem sufixo `Global`** — esse sufixo é exclusivo do `nucleo-global` (ver `mapa-nucleo-global` REGRA 4). Componentes locais usam `<Contexto><Funcao>` (`BarraAcoesPedido`, `PainelAnexos`, `CelulaAnexosColuna`).

5. **`Nome do componente - DDD` = `Nome do arquivo - DDD` sem `.tsx`.** O componente exportado **default** deve ter o mesmo nome do arquivo.
   - 🔴 Achado observado: linha com `\tGabiOnboardingWidget` (TAB residual no início) — toda string extraída deve passar por `.trim()`.
   - Mesmo padrão das abas 6, 7, 8: a coluna deve ser o `export default`, não a primeira const auxiliar exportada.

6. **Layouts seguem `<Contexto>Layout`:**
   - ✅ `AdminLayout`, `WorkspaceLayout`, `ProcessoLayout` (canônicos da planilha)
   - ⚠️ `Layout.tsx` solto (Marketplace, Shell) é genérico — aceitável quando há **um único** layout no produto/serviço, mas marcar `Observacoes` se ambíguo.

7. **`Usado por (paginas)` cruza com aba `6. mapa-paginas`.** Lista os nomes de componente de página que importam este componente, separados por ` | `. Cada nome **deve existir** na aba 6 (coluna `Nome do componente`). Componente sem nenhuma página que use + sem ser layout indica:
   - candidato a `Status DDD = DEPRECAR` (morto), ou
   - importado por outro componente local (registrar em `Observacoes`).

8. **`Rotas de API consumidas` cruza com aba `5. mapa-rotas`.** Mesma disciplina das abas 6 e 7: lista as rotas chamadas pelo componente (via `fetch`/SDK), separadas por ` | `; cada rota **deve existir** na aba 5; usar a coluna **Atual** da rota.

9. **Componente local importado por mais de um produto é candidato a promoção.** Se o grep mostra que o componente é usado em ≥ 2 produtos diferentes (ex: `pedido` **e** `lpco`), marcar `Status DDD = PROMOVER` e abrir tarefa para mover para `nucleo-global/`. Componente local nasce **dentro** de um produto; reuso cross-produto é sinal de que deveria virar nucleo (ver `arquitetura/nucleo-global`).

10. **`Status DDD` tem 6 valores fechados:**
    - `OK` — atual = DDD literalmente
    - `RENOMEAR` — corrigir nome
    - `DEPRECAR` — sair sem substituto (componente morto)
    - `NOVA` — planejado, ainda não implementado
    - `IGNORAR` — test harness, debug, scripts (`E2ENotificacoesHarness`, `*Debug*`, `*Probe*`)
    - `PROMOVER` — reuso cross-produto detectado → mover para `nucleo-global/`

11. **Componentes órfãos** (`.tsx` em `client/src/components/` sem linha) e **fantasmas** (linha sem `.tsx`) são **achados críticos** 🔴.

---

## Conversão: componente real → linha completa da planilha

| Passo | Regra | Exemplo |
|---|---|---|
| 1 | Localizar `.tsx` em `(produto\|servicos-global)/**/client/src/components/**` ou `src/pages/<Layout>.tsx` | `produto/pedido/client/src/components/SmartImport/EtapaConfirmacao.tsx` |
| 2 | Confirmar que **não** é página (sem `<Route>`) e **não** é modal (sem `<Dialog>`/`<Drawer>`/`<Popover>` no topo) | ✅ é etapa de wizard |
| 3 | Derivar `Local` do prefixo do path | `Local = Produto` |
| 4 | Derivar `Produto Gravity` do 2º nível do path | `pedido` |
| 5 | Derivar `Pasta` do 1º nível depois de `src/` (`components`/`pages`) | `components` |
| 6 | Ler `export default function <Componente>` (NÃO a primeira const) | `EtapaConfirmacao` |
| 7 | Aplicar REGRA 4 ao nome (PascalCase, sem sufixo `Global`) | `Nome - DDD = EtapaConfirmacao.tsx` |
| 8 | Contar props da interface/type | `Qtd props = 4` |
| 9 | Grep `import .*EtapaConfirmacao` para listar páginas | `ImportarArquivo.tsx` |
| 10 | Listar rotas API (grep `fetch(`) e cruzar com aba 5 | `/api/v1/pedidos/smart-import/confirmar` |
| 11 | Verificar uso cross-produto: se ≥ 2 produtos importam → `PROMOVER` | só `pedido` → não promover |
| 12 | Comparar Atual vs DDD | iguais → `Status DDD = OK` |

---

## Exemplo completo

Componente em `produto/pedido/client/src/components/lista/colunasFilho.tsx` exportando default `ColunasFilho`, usado pela página `Pedidos.tsx` (Lista do produto pedido), sem chamadas API próprias (recebe dados via props):

| Coluna | Valor |
|---|---|
| Local | `Produto` |
| Nome do arquivo | `colunasFilho.tsx` |
| Nome do arquivo - DDD | `ColunasFilho.tsx` |
| EXPLICAÇÃO | Define as colunas de itens-filho da tabela de pedidos (renderiza linhas aninhadas sob o pedido pai). |
| Nome do componente | `ColunasFilho` |
| Nome do componente - DDD | `ColunasFilho` |
| Produto Gravity | `pedido` |
| Pasta | `components` |
| Qtd props detectados | `3` |
| Rotas de API consumidas | (vazio — recebe via props) |
| Models lidos (heuristico) | (vazio) |
| Usado por (paginas) | `Pedidos` |
| Arquivo | `produto/pedido/client/src/components/lista/colunasFilho.tsx` |
| Status DDD | `RENOMEAR` |
| Observacoes | Nome do arquivo em camelCase (`colunasFilho.tsx`) viola REGRA 4 — renomear para PascalCase. Componente já está correto (`ColunasFilho`). |

**Achados a reportar:**
- 🟡 `RENOMEAR`: arquivo em camelCase (REGRA 4) — par de divergências `colunasFilho.tsx`/`colunasPai.tsx`
- 🟢 `Pasta = components` correto, subpasta `lista/` registrada apenas em `Arquivo`
- 🟢 Apenas `pedido` importa → não é candidato a `PROMOVER`

---

## Checklist de validação (aplicar a cada linha da aba `9. Componentes Locais`)

- [ ] `Local` ∈ {`Organizacao`, `Produto`, `Configurador`, `Marketplace`, `Shell`}?
- [ ] Componente **não** é página (não está montado em `<Route>`) e **não** é modal (sem wrapper `<Dialog>`/`<Drawer>`/`<Popover>`)?
- [ ] `Pasta` ∈ {`components`, `layout`, `outro`}?
- [ ] `Nome do arquivo - DDD` em PascalCase com sufixo `.tsx` (sem camelCase, sem kebab, sem sufixo `Global`)?
- [ ] `Nome do componente` (atual) é o `export default` real, sem TABs nem espaços extras (REGRA 5)?
- [ ] `Nome do componente - DDD` = `Nome do arquivo - DDD` sem `.tsx`?
- [ ] `Produto Gravity` corresponde a uma pasta real do monorepo?
- [ ] Layouts seguem `<Contexto>Layout` (REGRA 6)?
- [ ] Cada página em `Usado por (paginas)` existe na aba `6. mapa-paginas`?
- [ ] Cada rota em `Rotas de API consumidas` existe na aba `5. mapa-rotas`?
- [ ] Componente importado por ≥ 2 produtos → `Status DDD = PROMOVER` (REGRA 9)?
- [ ] Test harness/debug → `Status DDD = IGNORAR`?
- [ ] `Status DDD` ∈ {`OK`, `RENOMEAR`, `DEPRECAR`, `NOVA`, `IGNORAR`, `PROMOVER`}?
- [ ] Não há órfão (`.tsx` sem linha) ou fantasma (linha sem `.tsx`)?

---

## Limites duros

- ❌ Editar código (`.tsx`)
- ❌ Renomear/mover arquivo no repositório (refactor é fora do escopo)
- ❌ Promover componente para `nucleo-global/` por conta própria (sinalizar `PROMOVER` e abrir tarefa)
- ❌ Inventar valor fora dos enums fechados (`Local`, `Pasta`, `Status DDD`)
- ❌ Sobrescrever o `.xlsx` original
- ✅ Auditar a aba `9. Componentes Locais`
- ✅ Propor preenchimento/correção de células após aprovação
- ✅ Marcar componentes mortos como `DEPRECAR`, harnesses como `IGNORAR`, cross-produto como `PROMOVER`

---

## Skills vizinhas (referência apenas)

- [`lei/ddd-nomenclatura`](../../lei/ddd-nomenclatura/SKILL.md) — naming canônico (PascalCase, sem sufixo `Global`)
- [`arquitetura/nucleo-global`](../../../arquitetura/nucleo-global/SKILL.md) — quando promover componente local para nucleo
- [`ux/componentes`](../../../ux/componentes/SKILL.md) — decisão entre componente local e nucleo-global
- [`convencao-tecnica/mapa-paginas`](../mapa-paginas/SKILL.md) — cruzamento de `Usado por (paginas)`
- [`convencao-tecnica/modais`](../modais/SKILL.md) — modais vão para a aba 7, não esta
- [`convencao-tecnica/mapa-nucleo-global`](../mapa-nucleo-global/SKILL.md) — destino dos componentes promovidos
- [`convencao-tecnica/mapa-rotas`](../mapa-rotas/SKILL.md) — cruzamento de `Rotas de API consumidas`
