---
name: antigravity-mapa-nucleo-global
description: Convenção técnica do inventário dos componentes do design system Gravity (`nucleo-global/`) — define como cada componente, modal, página-demo, logo ou utilitário é catalogado na aba "8. Nucleo Global" da planilha DDD (categoria, tipo, props, usos por produto, sufixo Global). Use ao registrar componente novo, auditar conformidade DDD ou propor renomeação. Não toca em código — só lê código para cruzar e só escreve na planilha após aprovação.
---

# Convenção Técnica — Mapa do Núcleo Global

> ⚠️ **REGRAS ABSOLUTAS:** os nomes (arquivo, componente, sufixo `Global`) seguem [`lei/ddd-nomenclatura`](../../lei/ddd-nomenclatura/SKILL.md). O padrão visual e a arquitetura do design system moram em [`arquitetura/nucleo-global`](../../../arquitetura/nucleo-global/SKILL.md), [`ux/design-system`](../../../ux/design-system/SKILL.md) e [`ux/componentes`](../../../ux/componentes/SKILL.md). Cruzamentos com modais vão para [`modais`](../modais/SKILL.md).
> Esta skill **operacionaliza** o inventário do núcleo — **não redefine** naming nem padrão visual.

---

## Princípio fundamental

A aba **`8. Nucleo Global`** é o inventário de **todo arquivo `.tsx` dentro de `nucleo-global/**`** — uma linha por arquivo, registrando o componente exportado, sua categoria (pasta de 1º nível), tipo, quantidade de props, quem usa e o status de conformidade DDD. **É a fonte da verdade dos blocos reutilizáveis do produto.** Antes de criar componente novo no design system, renomear ou auditar reuso, consulte esta aba.

---

## Estrutura obrigatória

Cada linha tem 11 colunas. A relação chave é:

```
Arquivo (.tsx em nucleo-global/<Categoria>/<pacote>/src/...)
        ↓
Categoria (pasta nível 1)  +  Tipo  +  Nome do componente (default export)
        ↓ (ddd-nomenclatura: PascalCase + sufixo Global, exceto Logos)
Nome do componente - DDD  +  Status DDD
        ↓ (grep por imports)
Usado por (produtos/servicos)  +  Qtd usos
```

| # | Coluna | Conteúdo | Fonte |
|---|---|---|---|
| 1 | `Nome do componente` | identificador exportado **default** | código |
| 2 | `Nome do componente - DDD` | canônico (PascalCase + sufixo `Global`, salvo exceções da REGRA 4) | esta skill |
| 3 | `EXPLICAÇÃO` | 1 frase do que o componente faz para quem consome | esta skill |
| 4 | `Categoria (pasta)` | pasta de 1º nível dentro de `nucleo-global/` (enum fechado — REGRA 2) | derivada do path |
| 5 | `Qtd props detectados` | nº de props da interface/type do componente | código |
| 6 | `Tipo (Modal/Form/Display/...)` | enum fechado — REGRA 3 | esta skill |
| 7 | `Usado por (produtos/servicos)` | slugs separados por ` \| ` (ex: `pedido \| lpco \| Configurador`) | código (grep) |
| 8 | `Qtd usos` | nº total de imports do componente no monorepo | código (grep) |
| 9 | `Arquivo` | path completo do `.tsx` | código |
| 10 | `Status DDD` | `OK` \| `RENOMEAR` \| `DEPRECAR` \| `NOVA` \| `IGNORAR` | esta skill |
| 11 | `Observacoes` | qualquer divergência ou nota técnica | esta skill |

---

## Regras

1. **Uma linha por arquivo `.tsx` em `nucleo-global/**`.** A planilha não filtra por produção: arquivos de demo (`demo/**/App.tsx`, `main.tsx`), Storybook (`*.stories.tsx`) e helpers internos também aparecem. **Estes recebem `Status DDD = IGNORAR`** (REGRA 5) e não são auditados além do enum.

2. **`Categoria (pasta)` é um enum fechado de 16 valores** (extraídos do path real):
   `Botoes`, `Campos`, `Composicao`, `Configuracoes`, `Dashboard`, `Feedback`, `Gabi`, `Kanban`, `Layout`, `Login`, `Logo`, `Mensageria Global`, `Modais`, `Tabelas`, `Templates`, `Utilidades`.
   - Derivação automática: `nucleo-global/<Categoria>/<pacote>/src/...` → coluna recebe `<Categoria>` literal (PascalCase como na pasta).
   - ❌ inventar (`Forms`, `Inputs`, `UI`) — se aparecer 17ª pasta no monorepo, **trava e pergunta**.
   - 🔴 Achado: pasta `logo-global` solta na raiz é divergência (deveria ser `Logo/logo-global`).

3. **`Tipo` é um enum fechado de 8 valores:**
   - `ComponenteDSL` — bloco visual reutilizável (botão, campo, card, badge)
   - `Modal` — overlay (`<Dialog>`/`<Drawer>`/`<Popover>`) — também listar na aba `7. Modais` com `Local = Nucleo Global`
   - `Pagina` — tela de demonstração em `demo/**/pages/` (não é produção)
   - `Logo` — SVG/marca de produto (categoria `Logo/`)
   - `Hook` — `use*.ts(x)` exportando hook React
   - `Util` — função/const sem JSX (`provider.tsx`, helpers)
   - `Storybook` — `*.stories.tsx`
   - `Demo` — `App.tsx`/`main.tsx` em `demo/`
   - ❌ inventar tipo novo — trava e pergunta.

4. **Sufixo `Global` é a convenção padrão** para `Tipo = ComponenteDSL`. Exceções confirmadas pelos dados:
   - **Logos** seguem `Logo<Produto>` sem sufixo Global (`LogoBidCambio`, `LogoNfImportacao`, `LogoGravity`).
   - Subcomponentes internos de um pacote `*-global` podem omitir o sufixo (ex: `KanbanColuna`, `KanbanContext`, `BadgeCelula`) — desde que **só sejam importados de dentro do mesmo pacote**. Se forem usados por algum produto, devem virar `*Global`.
   - ❌ kebab-case no nome do componente (`modal-formulario-global`) → ✅ `ModalFormularioGlobal`
   - ❌ EN no sufixo (`SelectColunasGlobal` está OK; `WidgetEditModal` deveria ser `ModalEditarWidget` — cruzar com `mapa-modais` REGRA 3).

5. **`Status DDD = IGNORAR`** para arquivos que não são alvo de auditoria DDD: `*.stories.tsx`, `demo/**/App.tsx`, `demo/**/main.tsx`, `demo/**/ToastDemo.tsx`, `demo/**/pages/*.tsx` (telas de exemplo). Os outros valores seguem o enum padrão (`OK`, `RENOMEAR`, `DEPRECAR`, `NOVA`).

6. **`Nome do componente` (atual) deve ser o componente exportado `default`, não a primeira `const` exportada.**
   - 🔴 Achado crítico observado: ~70 linhas trazem o nome de uma const auxiliar (`MESES_INDICES`, `GAP_MAP`, `LARGURA_MODAL`, `CHAR_LIMIT`, `parsePtBR`, `PRIORIDADE_COR`) em vez do componente real. Toda linha em que o nome é UPPER_SNAKE, camelCase de função (`calcPos`, `extractNumericValue`) ou não bate com o nome do arquivo é divergência a corrigir.

7. **`Usado por (produtos/servicos)` cruza com `mapa-paginas`, `mapa-modais` e o monorepo.** Lista os slugs de produto/serviço separados por ` | ` (`pedido`, `bid-cambio`, `Configurador`, `nucleo-global`, `marketplace`). Quando `Qtd usos = 0` o componente é candidato a `Status DDD = DEPRECAR`.

8. **Componentes duplicados são achado crítico.** Pacotes/arquivos espelhados em duas pastas (ex: `Tabelas/select-colunas-global/` **e** `Tabelas/tabelas-componentes/select-colunas-global/`) violam o princípio de fonte única do nucleo. Marcar uma linha como `DEPRECAR` e a outra como `OK`/`RENOMEAR`.

9. **Componentes órfãos** (`.tsx` em `nucleo-global/` sem linha) e **fantasmas** (linha sem `.tsx`) são **achados críticos** 🔴.

---

## Conversão: arquivo real → linha completa da planilha

| Passo | Regra | Exemplo |
|---|---|---|
| 1 | Localizar `.tsx` em `nucleo-global/**` | `nucleo-global/Campos/campo-calendario-global/src/CalendarioCampoGlobal.tsx` |
| 2 | Extrair `Categoria (pasta)` do path (1º nível depois de `nucleo-global/`) | `Campos` |
| 3 | Classificar `Tipo`: tem JSX e não é Modal/Logo/demo → `ComponenteDSL` | `ComponenteDSL` |
| 4 | Ler `export default function <Componente>` | `Nome do componente = CalendarioCampoGlobal` (não `MESES_INDICES`) |
| 5 | Aplicar REGRA 4 ao nome (sufixo `Global` para ComponenteDSL) | `Nome - DDD = CalendarioCampoGlobal` |
| 6 | Contar props da interface/type | `Qtd props = 7` |
| 7 | Grep `import .*CalendarioCampoGlobal` no monorepo | `pedido \| lpco`; `Qtd usos = 4` |
| 8 | Comparar Atual vs DDD | iguais → `Status DDD = OK` |

---

## Exemplo completo

Arquivo `nucleo-global/Modais/modal-enviar-para-global/src/ModalEnviarParaGlobal.tsx`, exportando default `ModalEnviarParaGlobal` e a const `CHAR_LIMIT`. Importado por `pedido` e `Configurador`:

| Coluna | Valor |
|---|---|
| Nome do componente | `CHAR_LIMIT` *(linha original — divergência REGRA 6)* |
| Nome do componente - DDD | `ModalEnviarParaGlobal` |
| EXPLICAÇÃO | Modal padrão para enviar um item para outra pessoa (com campo de busca + observação). |
| Categoria (pasta) | `Modais` |
| Qtd props detectados | `5` |
| Tipo (Modal/Form/Display/...) | `Modal` |
| Usado por (produtos/servicos) | `pedido \| Configurador` |
| Qtd usos | `3` |
| Arquivo | `nucleo-global/Modais/modal-enviar-para-global/src/ModalEnviarParaGlobal.tsx` |
| Status DDD | `RENOMEAR` |
| Observacoes | Coluna `Nome do componente` original = `CHAR_LIMIT` (const auxiliar) — extração precisa apontar para o `export default`. Cruzar com aba `7. Modais` (mesma linha lá com `Local = Nucleo Global`). |

**Achados a reportar:**
- 🔴 `Nome do componente` extraindo const auxiliar em vez de default export (REGRA 6)
- 🟡 Linha duplicada na aba `7. Modais` — manter as duas, mas confirmar `Local = Nucleo Global` lá
- 🟢 Sufixo `Global` correto, kebab-case correto na pasta, PascalCase correto no arquivo

---

## Checklist de validação (aplicar a cada linha da aba `8. Nucleo Global`)

- [ ] `Arquivo` começa com `nucleo-global/`?
- [ ] `Categoria (pasta)` ∈ {16 valores da REGRA 2} e bate com o 1º nível do path?
- [ ] `Tipo` ∈ {`ComponenteDSL`, `Modal`, `Pagina`, `Logo`, `Hook`, `Util`, `Storybook`, `Demo`}?
- [ ] `Nome do componente` é o `export default` real, não uma const auxiliar (REGRA 6)?
- [ ] `Nome do componente - DDD` em PascalCase com sufixo `Global` (salvo Logos e subcomponentes internos — REGRA 4)?
- [ ] `Usado por (produtos/servicos)` em ` | ` com slugs reais do monorepo?
- [ ] `Qtd usos = 0` → `Status DDD = DEPRECAR` ou `IGNORAR` (se demo/storybook)?
- [ ] Arquivos de demo/storybook têm `Status DDD = IGNORAR`?
- [ ] `Status DDD` ∈ {`OK`, `RENOMEAR`, `DEPRECAR`, `NOVA`, `IGNORAR`}?
- [ ] Não há componente duplicado em duas pastas (REGRA 8)?
- [ ] Não há órfão (`.tsx` sem linha) ou fantasma (linha sem `.tsx`)?
- [ ] Modais (Tipo=`Modal`) também aparecem na aba `7. Modais` com `Local = Nucleo Global`?

---

## Limites duros

- ❌ Editar código (`.tsx`)
- ❌ Renomear/mover arquivo no repositório (refactor é fora do escopo)
- ❌ Inventar valor fora dos enums fechados (`Categoria`, `Tipo`, `Status DDD`)
- ❌ Sobrescrever o `.xlsx` original
- ✅ Auditar a aba `8. Nucleo Global`
- ✅ Propor preenchimento/correção de células após aprovação
- ✅ Marcar componentes duplicados ou órfãos para `DEPRECAR` (após confirmação)

---

## Skills vizinhas (referência apenas)

- [`lei/ddd-nomenclatura`](../../lei/ddd-nomenclatura/SKILL.md) — naming canônico (sufixo `Global`, PascalCase)
- [`arquitetura/nucleo-global`](../../../arquitetura/nucleo-global/SKILL.md) — arquitetura dos componentes em `nucleo-global/`
- [`ux/design-system`](../../../ux/design-system/SKILL.md) — Solid Slate (cores, tipografia, ícones)
- [`ux/componentes`](../../../ux/componentes/SKILL.md) — mapeamento nucleo-global vs custom
- [`convencao-tecnica/modais`](../modais/SKILL.md) — modais do nucleo aparecem nas duas abas
- Aba `9. Componentes Locais` — destino de componentes específicos de produto (fora do nucleo)
