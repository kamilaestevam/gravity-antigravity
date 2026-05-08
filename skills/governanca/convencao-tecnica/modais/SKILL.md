---
name: antigravity-mapa-modais
description: Convenção técnica do inventário de modais, drawers e popovers do Gravity — define como cada componente sobreposto é catalogado na aba "7. Modais" da planilha DDD (arquivo, componente, tipo, páginas que abrem, ações disparadas, rotas API consumidas, patente mínima). Use ao registrar modal novo, auditar conformidade DDD ou propor renomeação. Não toca em código — só lê código para cruzar e só escreve na planilha após aprovação.
---

# Convenção Técnica — Mapa de Modais

> ⚠️ **REGRAS ABSOLUTAS:** os nomes (arquivo, componente) seguem [`lei/ddd-nomenclatura`](../../lei/ddd-nomenclatura/SKILL.md). O padrão visual e de UX dos modais mora em [`ux/criacao-telas`](../../../ux/criacao-telas/SKILL.md) e [`ux/componentes`](../../../ux/componentes/SKILL.md). Cruzamentos com páginas vão para [`mapa-paginas`](../mapa-paginas/SKILL.md) e com rotas para [`mapa-rotas`](../mapa-rotas/SKILL.md).
> Esta skill **operacionaliza** o inventário de modais — **não redefine** naming nem padrão visual.

---

## Princípio fundamental

A aba **`7. Modais`** é o inventário de **todo componente sobreposto** do monorepo (modal, drawer, popover) — uma linha por componente React que monta um overlay (`<Dialog>`, `<Drawer>`, `<Popover>`). Cada linha cruza implementação real (arquivo, componente, tipo) com a forma DDD (arquivo renomeado, componente renomeado), classificação, controle de acesso (patente mínima) e dependências (páginas que abrem, ações disparadas, rotas API consumidas, models lidos). **É a fonte da verdade do que existe em sobreposição na UI versus o que deveria existir.** Antes de criar, renomear ou auditar qualquer modal, consulte esta aba.

---

## Estrutura obrigatória

Cada linha tem 17 colunas. A relação chave é:

```
Local + Produto Gravity  →  Arquivo (.tsx)  →  Componente (PascalCase)
                                      ↓ (página que abre via <Modal/>)
                              Paginas que abrem
                                      ↓ (ddd-nomenclatura)
        Arquivo DDD  +  Componente DDD  +  Tipo  +  Patente minima
```

| # | Coluna | Conteúdo | Fonte |
|---|---|---|---|
| 1 | `Local` | `Organizacao` \| `Produto` \| `Configurador` \| `Marketplace` \| `Nucleo Global` | código |
| 2 | `Nome do arquivo` | nome do `.tsx` (ex: `ModalEditarOrganizacao.tsx`) | código |
| 3 | `Nome do arquivo - DDD` | canônico (ver REGRA 3) | esta skill |
| 4 | `Utilizado no código` | `SIM` \| `NAO` (componente importado em pelo menos 1 lugar) | código (grep) |
| 5 | `EXPLICAÇÃO` | 1 frase do que o modal faz para o usuário final | esta skill |
| 6 | `Nome do componente` | identificador exportado (ex: `ModalEditarOrganizacao`) | código |
| 7 | `Nome do componente - DDD` | canônico (= arquivo sem `.tsx`) | esta skill |
| 8 | `Produto Gravity` | slug do produto (ex: `pedido`, `bid-cambio`, `Configurador`, `nucleo-global`) | código |
| 9 | `Tipo` | `Modal` \| `Drawer` \| `Popover` (enum fechado) | código |
| 10 | `Paginas que abrem` | nomes dos componentes de página que renderizam este modal | código (grep) |
| 11 | `Acoes` | ações que o modal dispara (`Salvar`, `Cancelar`, `Excluir`, `Confirmar`) | código |
| 12 | `Rotas de API consumidas` | rotas chamadas pelo modal, separadas por ` \| ` | código (grep) |
| 13 | `Models lidos (heuristico)` | models Prisma derivados das rotas consumidas | cruzamento aba 3 |
| 14 | `Patente minima` | `tipo_usuario` mínima (EN UPPER_SNAKE — REGRA 7) | esta skill + RBAC |
| 15 | `Arquivo` | path completo do `.tsx` | código |
| 16 | `Status DDD` | `OK` \| `RENOMEAR` \| `DEPRECAR` \| `NOVA` | esta skill |
| 17 | `Observacoes` | qualquer divergência ou nota técnica | esta skill |

---

## Regras

1. **Uma linha por componente sobreposto.** Modal/Drawer/Popover montados como tela inteira (sem página por trás) **não** vão aqui — vão para `mapa-paginas` com `Tipo de view = Modal`. Esta aba só registra overlays disparados a partir de outra tela.

2. **`Tipo` é um enum fechado de 3 valores** (extraídos da realidade da planilha):
   - `Modal` — caixa centralizada, bloqueia o fundo (`<Dialog>`)
   - `Drawer` — painel lateral deslizante (`<Drawer>`/`<Sheet>`)
   - `Popover` — flutuante ancorado em um trigger (`<Popover>`/`<Tooltip>` interativo)
   - ❌ inventar (`Toast`, `Sheet`, `Overlay`, `Dialog`) — se aparecer um quarto tipo, **trava e pergunta**.

3. **`Nome do arquivo - DDD` segue `[Tipo][Acao][Entidade]`** (padrão extraído de 34/47 casos):
   - **PascalCase**, sufixo `.tsx`
   - Prefixo = o `Tipo` por extenso: `Modal`, `Drawer`, `Popover`
   - Exceção: quando o overlay é de um produto/contexto específico e não é CRUD (ex: `PaywallDrawer`, `ExitIntentDrawer`), **sufixo do tipo** é aceito — manter o que está, mas **não criar novo** com sufixo.
   - Exemplos canônicos da planilha:
     - ✅ `ModalEditarOrganizacao.tsx`, `ModalNovaOrganizacao.tsx`, `ModalAgendamentoTestes.tsx`
     - ✅ `DrawerPedido.tsx` (overlay de detalhe — sem ação CRUD direta)
     - ❌ `modal-formulario-abas-global.tsx` (kebab-case proibido — vira `ModalFormularioAbasGlobal.tsx`)
     - ❌ `CardKanbanModal.tsx` (sufixo — vira `ModalCardKanban.tsx`)
     - 📝 Caso especial — modais de Dashboard seguem o prefixo `Dashboard*` por agrupamento de pacote, não o prefixo `Modal*` (ex: `DashboardPainelEditarModal.tsx` — alinhado ao Atlas DDD aba 8). Este é o único namespace de modal que não usa `Modal<Acao><Entidade>` por convenção, porque pertence ao componente coletivo `@nucleo/dashboard`.

4. **`Nome do componente - DDD` = `Nome do arquivo - DDD` sem `.tsx`.** O componente exportado **default** deve ter o mesmo nome do arquivo. Constantes auxiliares exportadas (`PRIORIDADE_COR`, `TIPOS_EMPRESA`, `CHAR_LIMIT`) **não** vão nesta coluna — esta coluna é o componente React, não a primeira const exportada do arquivo.
   - 🔴 Achado crítico observado na planilha: a coluna `Nome do componente` está sendo preenchida com a **primeira const exportada** (ex: `cronParaHoraMinuto`, `PRIORIDADE_COR`) em vez do componente React real. Toda linha em que `Nome do componente` ≠ identificador derivado do arquivo é divergência a corrigir.

5. **`Local`, `Produto Gravity` reusam o vocabulário de `mapa-paginas`** + um valor extra:
   - `Local`: `Organizacao` \| `Produto` \| `Configurador` \| `Marketplace` \| **`Nucleo Global`** (modal compartilhado em `nucleo-global/` — não existe em `mapa-paginas`)
   - `Produto Gravity`: slug da pasta — quando `Local = Nucleo Global`, valor obrigatório é `nucleo-global`.

6. **`Utilizado no código` é binário:** `SIM` (importado em ≥ 1 página/componente) ou `NAO` (órfão). Modal com `NAO` é candidato a `Status DDD = DEPRECAR`.

7. **`Paginas que abrem` cruza com aba `6. mapa-paginas`.** Lista os componentes de página que renderizam este modal, separados por ` | `. Cada nome listado **deve existir** na aba 6 (coluna `Nome do componente`). Modal sem nenhuma página que abre + `Utilizado no código = SIM` indica que é aberto por outro modal/componente — registrar em `Observacoes`.

8. **`Acoes` é uma lista curta de verbos no infinitivo PT-BR**, separados por ` | `. Vocabulário canônico:
   - `Salvar`, `Cancelar`, `Excluir`, `Confirmar`, `Aprovar`, `Rejeitar`, `Enviar`, `Importar`, `Exportar`, `Duplicar`, `Disparar`
   - ❌ EN (`Save`, `Cancel`, `Delete`)
   - ❌ substantivo (`Salvamento`, `Confirmação`)

9. **`Rotas de API consumidas` cruza com aba `5. mapa-rotas`.** Mesma disciplina de `mapa-paginas` REGRA 9: lista as rotas chamadas pelo modal (via `fetch`/SDK), separadas por ` | `; cada rota **deve existir** na aba 5; usar a coluna **Atual** da rota.

10. **`Patente minima` em EN UPPER_SNAKE** (REGRA 7 do `ddd-nomenclatura`). Mesmo vocabulário fechado de `mapa-rotas` e `mapa-paginas`: `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `STANDARD`, `VIEWER`, `PUBLIC`. Modal de `Local = Configurador` em `pages/admin/` exige `SUPER_ADMIN`.

11. **`Status DDD` é o mesmo enum fechado:** `OK`, `RENOMEAR`, `DEPRECAR`, `NOVA`. Modal com `Utilizado no código = NAO` deve ter `Status DDD = DEPRECAR` (a menos que seja `NOVA`).

12. **Modais órfãos** (`.tsx` em `*Modal*.tsx` sem linha) e **fantasmas** (linha sem `.tsx`) são **achados críticos** 🔴.

---

## Conversão: Modal real → linha completa da planilha

| Passo | Regra | Exemplo |
|---|---|---|
| 1 | Localizar `.tsx` do modal (grep `<Dialog`/`<Drawer`/`<Popover` ou nome com `Modal`/`Drawer`) | `servicos-global/configurador/src/pages/admin/ModalEditarOrganizacao.tsx` |
| 2 | Ler `export default function <Componente>` (NÃO a primeira const) | `Nome do componente = ModalEditarOrganizacao` |
| 3 | Identificar `Tipo` pelo wrapper (`<Dialog>` → `Modal`; `<Drawer>` → `Drawer`; `<Popover>` → `Popover`) | `Modal` |
| 4 | Aplicar REGRA 3 ao nome | `Nome do arquivo - DDD = ModalEditarOrganizacao.tsx` |
| 5 | Grep `import .* ModalEditarOrganizacao` para listar páginas que abrem | `OrganizacaoDetalhe`, `Tenants` |
| 6 | Listar handlers `on...` chamados (`onSalvar`, `onCancelar`) → `Acoes` | `Salvar | Cancelar` |
| 7 | Listar rotas API consumidas (grep `fetch(` / `api.`) e cruzar com aba 5 | `/api/v1/admin/tenants/:id` |
| 8 | Cruzar com RBAC para `Patente minima` (Configurador/admin → `SUPER_ADMIN`) | `SUPER_ADMIN` |
| 9 | Comparar Atual vs DDD: igual → `OK`; diferente → `RENOMEAR` | `Status DDD = OK` |

---

## Exemplo completo

Modal em `servicos-global/configurador/src/pages/admin/ModalEditarOrganizacao.tsx`, importado por `TenantDetail.tsx` (futura `OrganizacaoDetalhe.tsx`), que dispara `PUT /api/v1/admin/tenants/:id` e tem botões "Salvar" e "Cancelar":

| Coluna | Valor |
|---|---|
| Local | `Configurador` |
| Nome do arquivo | `ModalEditarOrganizacao.tsx` |
| Nome do arquivo - DDD | `ModalEditarOrganizacao.tsx` |
| Utilizado no código | `SIM` |
| EXPLICAÇÃO | Edita os dados cadastrais de uma organização (nome, CNPJ, contatos). |
| Nome do componente | `TIPOS_EMPRESA` *(linha original — divergência)* |
| Nome do componente - DDD | `ModalEditarOrganizacao` |
| Produto Gravity | `Configurador` |
| Tipo | `Modal` |
| Paginas que abrem | `OrganizacaoDetalhe` |
| Acoes | `Salvar \| Cancelar` |
| Rotas de API consumidas | `/api/admin/tenants/:id` |
| Models lidos (heuristico) | `Organizacao` |
| Patente minima | `SUPER_ADMIN` |
| Arquivo | `servicos-global/configurador/src/pages/admin/ModalEditarOrganizacao.tsx` |
| Status DDD | `RENOMEAR` |
| Observacoes | Coluna `Nome do componente` original aponta para a const `TIPOS_EMPRESA` em vez do componente exportado — corrigir. Rota Atual ainda usa `tenants` em vez de `organizacoes` — depende de `mapa-rotas` aprovar renomeação. |

**Achados a reportar:**
- 🔴 `Nome do componente` = `TIPOS_EMPRESA` (const auxiliar, não componente) — divergência de extração (REGRA 4)
- 🟡 Rota Atual ainda em `/admin/tenants/...` — propagar `RENOMEAR` para aba 5
- 🟡 Página que abre é `TenantDetail` — renomear na aba 6 antes de fechar esta linha

---

## Checklist de validação (aplicar a cada linha da aba `7. Modais`)

- [ ] `Local` ∈ {`Organizacao`, `Produto`, `Configurador`, `Marketplace`, `Nucleo Global`}?
- [ ] `Tipo` ∈ {`Modal`, `Drawer`, `Popover`}?
- [ ] `Nome do arquivo - DDD` em PascalCase, com prefixo `Modal`/`Drawer`/`Popover` (salvo exceções de domínio da REGRA 3)?
- [ ] `Nome do componente - DDD` = `Nome do arquivo - DDD` sem `.tsx`?
- [ ] `Nome do componente` (atual) é o componente exportado **default**, não a primeira const auxiliar?
- [ ] `Utilizado no código` ∈ {`SIM`, `NAO`}? Se `NAO`, `Status DDD` é `DEPRECAR`?
- [ ] Cada página em `Paginas que abrem` existe na aba `6. mapa-paginas`?
- [ ] Cada rota em `Rotas de API consumidas` existe na aba `5. mapa-rotas`?
- [ ] `Acoes` contém apenas verbos no infinitivo PT-BR do vocabulário canônico (REGRA 8)?
- [ ] `Patente minima` em EN UPPER_SNAKE? Modais em `pages/admin/` = `SUPER_ADMIN`?
- [ ] `Status DDD` ∈ {`OK`, `RENOMEAR`, `DEPRECAR`, `NOVA`}?
- [ ] Não há modal órfão (`.tsx` sem linha) ou fantasma (linha sem `.tsx`)?

---

## Limites duros

- ❌ Editar código (`.tsx`)
- ❌ Renomear arquivo no repositório (refactor é fora do escopo)
- ❌ Inventar valor fora dos enums fechados (`Tipo`, `Local`, `Status DDD`)
- ❌ Decidir patente mínima sem cruzar com RBAC do Configurador
- ❌ Sobrescrever o `.xlsx` original
- ✅ Auditar a aba `7. Modais`
- ✅ Propor preenchimento/correção de células após aprovação
- ✅ Marcar modais órfãos como `DEPRECAR` (após confirmação)

---

## Skills vizinhas (referência apenas)

- [`lei/ddd-nomenclatura`](../../lei/ddd-nomenclatura/SKILL.md) — naming canônico (arquivo, componente)
- [`ux/criacao-telas`](../../../ux/criacao-telas/SKILL.md) — padrão visual de modais e drawers
- [`ux/componentes`](../../../ux/componentes/SKILL.md) — uso de `<Dialog>`/`<Drawer>` do nucleo-global
- [`convencao-tecnica/mapa-paginas`](../mapa-paginas/SKILL.md) — cruzamento da coluna `Paginas que abrem`
- [`convencao-tecnica/mapa-rotas`](../mapa-rotas/SKILL.md) — cruzamento da coluna `Rotas de API consumidas`
- [`seguranca/permissoes`](../../../seguranca/permissoes/SKILL.md) — patentes (`tipo_usuario`)
