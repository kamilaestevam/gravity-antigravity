---
name: antigravity-nucleo-global
description: "Use esta skill sempre que uma tarefa envolver criação, modificação ou uso de componentes do nucleo-global. Define o que pertence ao núcleo, o teste das 3 perguntas, o que um componente nunca pode fazer, a convenção de nomes (Categoria PascalCase / componente kebab-case-global), o catálogo de categorias reais e como configurar os aliases. Todo agente consulta esta skill antes de criar qualquer componente ou decidir onde um código pertence."
---

# Gravity — Núcleo Global

## O Que é o nucleo-global

O nucleo-global contém utilitários puros — sem estado, sem backend e sem conhecimento de negócio. É a camada mais fundamental do projeto e é compartilhada por todos os produtos sem modificação.

> **Princípio:** se você consegue usar em um projeto totalmente offline, sem servidor, é nucleo-global. Caso contrário, não é.

> **Workspace independente:** `nucleo-global/` tem `package.json` próprio e é declarado em `"workspaces"` no `package.json` raiz do monorepo. Dependências instaladas localmente vivem em `nucleo-global/node_modules/`.

---

## O Teste das 3 Perguntas

Antes de colocar qualquer código no nucleo-global, responda:

| Pergunta | Se SIM → | Se NÃO → |
|:---|:---|:---|
| Precisa de banco de dados? | servicos-global | pode ser nucleo-global |
| Chama alguma API externa? | servicos-global | pode ser nucleo-global |
| Conhece alguma regra de negócio? | produto ou servicos-global | pode ser nucleo-global |

As três perguntas precisam ter resposta **NÃO** para o código pertencer ao nucleo-global.

---

## O Que um Componente do nucleo-global NUNCA Pode Fazer

- Importar nada de `servicos-global/*` (alias `@shell`/`@gravity/shell`), `servicos-global/tenant/*` (alias `@tenant`) ou `produto/*` (alias `@produto`) — ciclo de dependência proibido. *Os caminhos físicos ainda usam `tenant` por compatibilidade do alias; a migração DDD para `organizacao` está em curso fora desta skill.*
- Fazer `fetch` ou usar `axios` diretamente
- Acessar `localStorage` ou `sessionStorage` — deve receber dados via props
- Ter lógica de permissão de usuário (`roles`, `permissions`)
- Armazenar estado global (`Redux`, `Zustand`, `React Context` global)

---

## Quem Pode Modificar o nucleo-global

- Qualquer agente pode criar componentes novos após validação com o Coordenador
- Modificações em componentes existentes só podem ser feitas após análise de impacto, pois afetam todos os produtos

---

## Convenção de Nomes

| Nível | Convenção | Exemplo |
|:---|:---|:---|
| Categoria (pasta direta de `nucleo-global/`) | **PascalCase** em português | `Modais`, `Tabelas`, `Utilidades`, `Botoes`, `Mensageria Global` |
| Componente reutilizável (dentro da categoria) | **kebab-case** com sufixo `-global` | `modal-global`, `tabela-global`, `kanban-global` |
| Utilitário interno / subpasta técnica | livre (kebab-case ou nome curto) | `utils`, `export-utils`, `Localization`, `tabelas-base` |
| Estrutura padrão de componente | `<Categoria>/<componente>/src/index.ts` | `Modais/modal-global/src/index.ts` |

> Componentes que fogem do padrão `src/index.ts` são registrados como **aliases especiais** em `nucleo-global/vite-aliases.ts`. Se o seu componente não vai expor `src/index.ts`, adicione um alias especial nesse arquivo.

---

## Catálogo de Categorias

Estrutura real do `nucleo-global/`. Para o conteúdo exato de cada categoria, consultar o filesystem ou `nucleo-global/vite-aliases.ts` (fonte da verdade dos aliases gerados).

| Categoria | O que contém | Exemplos de componentes |
|:---|:---|:---|
| `Botoes/` | Botões reutilizáveis | — |
| `Campos/` | Inputs, selects, áreas de texto | — |
| `Composicao/` | Layouts e containers compositivos | — |
| `Configuracoes/` | Painéis e controles de configuração | — |
| `Dashboard/` | Widgets, grid, query builder | `dashboard-global` (alias especial: `@nucleo/dashboard`, `@nucleo/query-builder-global`) |
| `Feedback/` | Toasts, alerts, loaders | — |
| `Gabi/` | Componentes da IA Gabi | — |
| `Kanban/` | Board Kanban com drag-and-drop | `kanban-global` |
| `Layout/` | Headers, sidebars, language-switcher | — |
| `Login/` | Telas/blocos de autenticação visual | — |
| `Logo/` | Variantes do logo Gravity | `produtos` (alias especial: `@nucleo/logo-produtos`) |
| `logo-global/` | Logo principal (raiz, fora de Logo/) | — |
| `Mensageria Global/` | Componentes de mensageria/chat | — |
| `Modais/` | Família de modais reutilizáveis | `modal-global`, `modal-confirmar-excluir-global`, `modal-formulario-global`, `modal-formulario-abas-global`, `modal-passo-passo-global`, `modal-select-global` (alias: `@nucleo/modal-campo-select-global`), `modal-tabela-moeda`, `modal-tabela-unidades`, `modal-enviar-para-global`, `modal-gabi-caixa-aviso`, `modal-sem-sessoes-global`, `modal-workspace-inicial-global` |
| `Tabelas/` | Tabelas e auxiliares | `tabela-global`, `tabela-virtual-global`, `tabela-camadas-global`, `select-colunas-global`, `tabelas-base/` (subpastas: `moedas`, `unidades`, `unidades-peso`), `tabelas-componentes/` |
| `Templates/` | Templates de página/seção | — |
| `Tokens/` | Design tokens — `index.ts` + `tokens.css` (estrutura flat, alias: `@nucleo/tokens`) | — |
| `Utilidades/` | Funções puras, formatadores, i18n | `Localization/` (i18n), `export-utils/`, `utils/` |

> **Importante:** este catálogo é uma **visão geral**. A lista completa de componentes vivos e seus aliases é gerada automaticamente por `nucleo-global/vite-aliases.ts:createNucleoAliases`. Antes de assumir que um componente existe, rode `ls nucleo-global/<Categoria>/` ou inspecione o arquivo de aliases.

---

## Como Importar do nucleo-global

Os aliases do Vite são **gerados dinamicamente** a partir da estrutura de pastas do `nucleo-global/`. Cada `vite.config.ts` de produto/serviço importa os helpers de `nucleo-global/vite-aliases.ts`.

### Regra de geração (auto-discovery)

Para cada `Categoria/<componente>/src/index.ts` encontrado, o helper cria:

```
@nucleo/<componente> → <monorepoRoot>/nucleo-global/<Categoria>/<componente>/src/index.ts
```

### Aliases especiais (não seguem o padrão)

Mantidos manualmente em `getSpecialAliases()` dentro de `vite-aliases.ts`:

| Alias | Aponta para |
|:---|:---|
| `@nucleo/tokens` | `Tokens/index.ts` |
| `@nucleo/dashboard` | `Dashboard/dashboard-global/src` (diretório, para sub-paths) |
| `@nucleo/query-builder-global` | `Dashboard/dashboard-global/src/QueryBuilder/QueryBuilder.tsx` |
| `@nucleo/logo-produtos` | `Logo/produtos/src/index.ts` |
| `@nucleo/tabelas-base-unidades-peso` | `Tabelas/tabelas-base/unidades-peso/src/index.ts` |
| `@nucleo/modal-campo-select-global` | `Modais/modal-select-global/src/index.ts` |
| `@nucleo/export-utils` | `Utilidades/export-utils/exportUtils.ts` |
| `@nucleo/Utilidades/Localization/i18n` | `Utilidades/Localization/i18n.ts` |
| `@nucleo/Utilidades/Localization/provider` | `Utilidades/Localization/provider.tsx` |
| `@nucleo/Utilidades/Localization/useLocale` | `Utilidades/Localization/useLocale.ts` |

### Aliases de serviço (não-nucleo, mas gerados pelo mesmo arquivo)

Helper `createServiceAliases(monorepoRoot)` em `vite-aliases.ts`:

| Alias | Aponta para |
|:---|:---|
| `@gravity/shell` | `servicos-global/shell/index.ts` |
| `@shell` | `servicos-global/shell` |
| `@tenant` | `servicos-global/tenant` |
| `@produto` | `servicos-global/produto` |

### Aliases de tenant específicos

Helper `createTenantAliases(monorepoRoot, services)` em `vite-aliases.ts` — gera `@tenant/<svc>` para cada serviço passado.

### Configuração no `vite.config.ts` de cada produto/serviço

```typescript
import { createNucleoAliases, createServiceAliases, createTenantAliases } from '../../../nucleo-global/vite-aliases'

export default defineConfig({
  resolve: {
    alias: {
      ...createNucleoAliases(monorepoRoot),
      ...createServiceAliases(monorepoRoot),
      ...createTenantAliases(monorepoRoot, ['historico', 'gabi']),
    },
  },
})
```

> **Onde está a fonte da verdade:** [`nucleo-global/vite-aliases.ts`](../../../nucleo-global/vite-aliases.ts). Se um alias não está lá, ele não existe.

---

## Regras de Teste para nucleo-global

1. 100% dos utilitários devem ter testes de unidade (`vitest`)
2. Componentes de UI devem ter testes de renderização com `@testing-library/react`
3. É proibido mockar o nucleo-global nos testes de outros componentes — ele deve ser testado como parte real da integração

---

## Checklist — Antes de Criar um Componente no nucleo-global

- [ ] Respondi NÃO para as 3 perguntas do teste?
- [ ] O componente funciona sem acesso à internet?
- [ ] O componente funciona sem nenhum dado de `localStorage`?
- [ ] Componente reutilizável termina com `-global`? (utilitários internos e categorias estão isentos)
- [ ] O componente foi colocado dentro de uma **Categoria PascalCase** existente (ou criada com aval do Coordenador)?
- [ ] Estrutura `Categoria/<componente>/src/index.ts` respeitada? (Se não, adicionar alias especial em `vite-aliases.ts`.)
- [ ] Existe documentação no `readme.md` da pasta do componente?
