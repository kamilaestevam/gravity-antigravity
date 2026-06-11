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

> O modal Admin («O que será testado») agrupa casos pelos títulos `### ETAPA …` abaixo. **Não remover** essa estrutura.

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

---

## Roteiro de execução

### ETAPA 0 — Preparação

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **00** | Confirmar ambiente (Produção `https://usegravity.com.br` ou Local `http://localhost:8000`) | Runner usa `PLAYWRIGHT_BASE_URL` coerente com o ambiente escolhido no Admin |
| **00.1** | Login Clerk + workspace CDE | `EMT_ROW` Login · Aprovado |
| **00.2** | Criar pasta `resultado-teste/<EMT_RUN_ID>/` | Pasta de saída criada pelo runner |

### ETAPA 1 — Lista / localizar coluna manual (se não houver, criar)

Ir até **Pedido / Lista** / Localizar alguma coluna manual criada pelo usuário — **se não houver, crie**.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **01** | Navegar `/pedido/pedidos/lista`; garantir colunas visíveis (Selecionar tudo) | Cabeçalho da coluna manual visível (`data-find-col-key` = `chave`) · Print `01-lista-coluna-manual-como-esta.png` |
| **01.1** | Se nenhuma coluna manual visível: criar via Configurações → Colunas → Personalizadas → + Criar Coluna (tipo Texto) | Coluna `EMT EXCLUIR …` criada e visível na lista após reload |

### ETAPA 2 — Configurações / Colunas / Personalizadas

Ir até **Pedido / Configurações / Colunas / Personalizadas** e ver a coluna criada.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **02** | Menu **Configurações** → sidebar **Colunas** expandido → **Personalizadas** | URL `/pedido/configuracoes` com aba personalizadas · Print `02-config-personalizadas-coluna-como-esta.png` |
| **02.1** | Localizar linha da coluna alvo na lista **Colunas Personalizadas** | Nome e tipo (Texto/Numérico/Data) visíveis · Print `02-config-personalizadas-coluna-resultado.png` |

### ETAPA 3 — Ícone lixeira

Clicar no ícone da **lixeira** (botão `.cfg-kanban-campo-btn--remove`, ícone `Trash`, `aria-label` Excluir {{nome}}).

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **03** | Clicar lixeira na linha da coluna alvo | Modal abre — **não** exclui imediatamente · Print `03-excluir-icone-como-esta.png` |
| **03.1** | — | Print `03-excluir-icone-selecao.png` com modal visível |

### ETAPA 4 — Modal padrão (mensagem, botões, layout)

Abrir **modal padrão** — mensagem correta, botões corretos e layout correto.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **04** | Validar overlay `.mce__overlay` + `role="dialog"` | Modal padrão aberto · Print `04-modal-excluir-como-esta.png` |
| **04.1** | Validar título `Excluir coluna` e subtítulo `Confirme antes de prosseguir com a exclusão.` | Textos i18n corretos |
| **04.2** | Validar aviso `Esta ação é irreversível.` + `Os valores existentes serão preservados.` | Banner vermelho correto |
| **04.3** | Validar seção **REGISTRO** com nome da coluna em `.mce__td` | Nome da coluna exibido |
| **04.4** | Validar footer: **Cancelar** (secundário) + **Excluir** (perigo, ícone lixeira) | Botões e classes `mce__container`, `mce__header`, `mce__body`, `mce__footer` |

### ETAPA 5 — Confirmar exclusão

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **05** | Clicar botão **Excluir** no footer do modal | Ação de confirmação iniciada · Print `05-confirmar-exclusao-selecao.png` |

### ETAPA 6 — Botão Excluindo...

Botão fica **Excluindo...**

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **06** | Aguardar estado de loading no botão Excluir | Texto `Excluindo...` (`textoCarregando` no `BotaoGlobal`) · Print `06-botao-excluindo-resultado.png` |
| **06.1** | Durante loading | **Cancelar**, X do header e Escape **desabilitados** |

### ETAPA 7 — Mensagem de confirmação de exclusão

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **07** | Aguardar toast `.shell-toast--success` | Texto `Coluna "{{nome}}" excluída com sucesso.` (i18n `msg_excluida`) · Print `07-toast-exclusao-resultado.png` |
| **07.1** | Verificar lista Personalizadas | Coluna **ausente** da lista |
| **07.2** | Aguardar modal | Fecha após flash «Excluído» (~1,2s) |

### ETAPA 8 — Voltar à Lista (coluna excluída)

Voltar em **Pedido / Lista** para ter certeza que coluna foi excluída.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **08** | Navegar `/pedido/pedidos/lista` | Cabeçalho da coluna alvo **ausente** (`data-find-col-key` não presente) · Print `08-lista-sem-coluna-resultado.png` |

### ETAPA 9 — Hub → voltar (persistência)

Sair da tela da lista — **HUB** — Voltar e ter certeza que a coluna está excluída.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **09** | Sair da lista → `/hub` → voltar à lista de pedidos | Navegação completa sem erro |
| **09.1** | Revalidar cabeçalho na grade | Coluna alvo continua **ausente** · Print `08-hub-voltar-lista-sem-coluna-resultado.png` |

---

## Prints planejados

| # | Arquivo | Estado capturado |
|---|---------|------------------|
| 01 | `01-lista-coluna-manual-como-esta.png` | Lista com coluna manual visível (C1) |
| 02 | `02-config-personalizadas-coluna-como-esta.png` | Config Personalizadas antes de validar linha (C1) |
| | `02-config-personalizadas-coluna-resultado.png` | Coluna visível na lista Personalizadas |
| 03 | `03-excluir-icone-como-esta.png` | Linha da coluna antes do clique na lixeira (C1) |
| | `03-excluir-icone-selecao.png` | Após clique — modal aberto (C2) |
| 04 | `04-modal-excluir-como-esta.png` | Modal padrão — layout e textos (C1) |
| 05 | `05-confirmar-exclusao-selecao.png` | Botão Excluir antes/durante confirmação (C2) |
| 06 | `06-botao-excluindo-resultado.png` | Botão com texto Excluindo... |
| 07 | `07-toast-exclusao-resultado.png` | Toast de sucesso + lista sem coluna |
| 08 | `08-lista-sem-coluna-resultado.png` | Lista sem cabeçalho da coluna excluída |
| | `08-hub-voltar-lista-sem-coluna-resultado.png` | Após Hub → voltar — coluna ainda ausente |

---

## Pré-requisitos

| Requisito | Detalhe |
|-----------|---------|
| URL shell | `https://usegravity.com.br` (Produção) ou `http://localhost:8000` (Local) |
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
