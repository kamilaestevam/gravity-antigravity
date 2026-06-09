# Plano de Teste em Tela — Excluir Coluna Manual (Configurações → Lista)

**ID:** TST-EMT-EXCLUIR-COLUNA-MANUAL-CONFIGURACOES-LISTA-PEDIDO-001  
**Produto:** Pedido  
**Data:** 2026-06-09  
**Criticidade:** alta  
**Skill:** `skills/testes/teste-em-tela/SKILL.md`  
**Status:** Aguardando aprovação do dono

**Escopo pasta:** `testes/testes-em-tela/pedido/configuracoes/colunas/personalizadas/`  
**Plano + runner:** `plano-de-teste/` (este arquivo + `run-excluir-coluna-personalizada.ts`)  
**Prints:** `../resultado-teste/<runId>/` — uma pasta por execução  
**Componente:** `servicos-global/produto/pedido/client/src/pages/Configuracoes.tsx`  
**Modal:** `nucleo-global/Modais/modal-confirmar-excluir-global/src/ModalConfirmarExcluirGlobal.tsx`

---

## Regra de sequência dos prints

> **Padrão obrigatório** (C1/C2/C3):
>
> 1. **`*-como-esta.png`** — estado antes da ação (grade/lista/modal fechado)
> 2. **`*-selecao.png`** — interação em andamento (clique no ícone, botão confirmar)
> 3. **`*-resultado.png`** — estado após a ação (toast, lista sem coluna, botão Excluindo...)

---

## Plano de teste — exclusão 01 (integral)

> **ATENÇÃO:** seguir na íntegra com todos os detalhes. Não resumir nem omitir passos.

### Passo 01

Ir até **Pedido / Lista** / Localizar alguma coluna manual criada pelo usuário — **se não houver, crie**.

| Verificação | Resultado esperado |
|-------------|-------------------|
| URL | `/pedido/pedidos/lista` |
| Coluna manual | Cabeçalho visível na grade (`data-find-col-key` = `chave` da coluna) |
| Se ausente | Criar coluna texto via **Configurações → Colunas → Personalizadas → + Criar Coluna** e voltar à lista com todas as colunas visíveis |

**Prints:** `01-lista-coluna-manual-como-esta.png`

---

### Passo 02

Ir até **Pedido / Configurações / Colunas / Personalizadas** e ver a coluna criada.

| Verificação | Resultado esperado |
|-------------|-------------------|
| Navegação | Menu **Configurações** → sidebar **Colunas** expandido → **Personalizadas** |
| Lista | Linha com nome da coluna alvo visível em **Colunas Personalizadas** |
| Tipo | Rótulo do tipo exibido (ex.: Texto, Numérico, Data) |

**Prints:** `02-config-personalizadas-coluna-como-esta.png`, `02-config-personalizadas-coluna-resultado.png`

---

### Passo 03

Clicar no ícone da **lixeira** (na UI pode ainda aparecer X em capturas antigas; o botão usa ícone `Trash` e `aria-label` «Excluir {{nome}}»).

| Verificação | Resultado esperado |
|-------------|-------------------|
| Botão | `.cfg-kanban-campo-btn--remove` na linha da coluna |
| Ação | Abre modal — **não** exclui imediatamente |

**Prints:** `03-excluir-icone-selecao.png`

---

### Passo 04

Abrir **modal padrão** — mensagem correta, botões corretos e layout correto.

| Verificação | Resultado esperado |
|-------------|-------------------|
| Overlay | `.mce__overlay` + `role="dialog"` |
| Título | `Excluir coluna` (i18n `modal_excluir_titulo`) |
| Subtítulo | `Confirme antes de prosseguir com a exclusão.` |
| Aviso | `Esta ação é irreversível.` + `Os valores existentes serão preservados.` |
| Registro | Seção **REGISTRO** com nome da coluna em `.mce__td` |
| Footer | Botão **Cancelar** (secundário) + **Excluir** (perigo, ícone lixeira) |
| Layout | Classes `mce__container`, `mce__header`, `mce__body`, `mce__footer` |

**Prints:** `04-modal-excluir-como-esta.png`

---

### Passo 05

Confirmar exclusão.

| Verificação | Resultado esperado |
|-------------|-------------------|
| Ação | Clicar botão **Excluir** no footer do modal |

**Prints:** `05-confirmar-exclusao-selecao.png`

---

### Passo 06

Botão fica **Excluindo...**

| Verificação | Resultado esperado |
|-------------|-------------------|
| Loading | `textoCarregando` = `Excluindo...` no `BotaoGlobal` |
| Guards | Cancelar, X do header e Escape desabilitados durante loading |

**Prints:** `06-botao-excluindo-resultado.png`

---

### Passo 07

Mensagem de confirmação de exclusão.

| Verificação | Resultado esperado |
|-------------|-------------------|
| Toast | `.shell-toast--success` com texto `Coluna "{{nome}}" excluída com sucesso.` (i18n `msg_excluida`) |
| Lista config | Coluna **ausente** da lista de personalizadas |
| Modal | Fecha após flash «Excluído» (~1,2s) |

**Prints:** `07-toast-exclusao-resultado.png`

---

### Passo 08

Voltar em **Pedido / Lista** para ter certeza que coluna foi excluída.

| Verificação | Resultado esperado |
|-------------|-------------------|
| URL | `/pedido/pedidos/lista` |
| Cabeçalho | Coluna alvo **não** presente (`data-find-col-key` ausente) |

**Prints:** `08-lista-sem-coluna-resultado.png`

---

### Passo 08 (persistência Hub)

Sair da tela da lista — **HUB** — Voltar e ter certeza que a coluna está excluída.

| Verificação | Resultado esperado |
|-------------|-------------------|
| Navegação | Sair da lista → `/hub` → voltar à lista de pedidos |
| Cabeçalho | Coluna alvo continua **ausente** após navegação |

**Prints:** `08-hub-voltar-lista-sem-coluna-resultado.png`

---

## Pré-requisitos

| Requisito | Detalhe |
|-----------|---------|
| URL shell | `http://localhost:8000` ou staging |
| Login | Clerk — `E2E_CLERK_USER_EMAIL` + `CLERK_SECRET_KEY` |
| Permissões | `pedido:configuracao:editar` |
| Workspace | CDE Exportador (`ID_WORKSPACE_TESTE` opcional) |

---

## Execução

```bash
npx tsx testes/testes-em-tela/pedido/configuracoes/colunas/personalizadas/plano-de-teste/run-excluir-coluna-personalizada.ts
```

Variável opcional: `EMT_RUN_ID=exclusao-01`

---

## Saída

1. Pasta `../resultado-teste/<runId>/` com prints numerados
2. `RESULTADO.txt` com linhas `EMT_ROW|Ambiente|Pedido|…|Ação|Aprovado|Reprovado`
3. `Resultado final: PASSOU` ou `FALHOU`
