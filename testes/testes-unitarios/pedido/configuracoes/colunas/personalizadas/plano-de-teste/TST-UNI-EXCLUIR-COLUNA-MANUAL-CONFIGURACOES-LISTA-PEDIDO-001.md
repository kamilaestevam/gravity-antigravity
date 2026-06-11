# 📋 Plano de Testes Unitários — Excluir Coluna Manual (Configurações)

**ID:** TST-UNI-EXCLUIR-COLUNA-MANUAL-CONFIGURACOES-LISTA-PEDIDO-001  
**Produto:** Pedido  
**Tela:** Configurações → Colunas → Personalizadas (`/pedido/configuracoes`)  
**Feature:** Exclusão de coluna personalizada via `ModalConfirmarExcluirGlobal`  
**Tipo:** Unitário (Vitest + React Testing Library / jsdom)  
**Data:** 2026-06-09  
**Criticidade:** alta  
**Cobertura mínima:** 70% nos módulos listados  
**Status:** Aguardando aprovação do dono

---

## Resumo executivo

Plano unitário para a exclusão de coluna manual na aba **Personalizadas**: componente global de confirmação (`ModalConfirmarExcluirGlobal`), handler `excluirColunaPersonalizadaConfirmada` e service `ColunasUsuarioService.excluir` (soft delete). Sem I/O de rede real — mocks de API e Prisma.

**Escopo deste plano:** lógica de código e contratos. **Fora do escopo:** teste em tela (`testes-em-tela`) — outro agente.

---

## Módulos cobertos

| Módulo | Arquivo fonte |
|--------|---------------|
| Modal de confirmação | `nucleo-global/Modais/modal-confirmar-excluir-global/src/ModalConfirmarExcluirGlobal.tsx` |
| Tipos / contrato | `nucleo-global/Modais/modal-confirmar-excluir-global/src/tipos.ts` |
| Estilos (tokens) | `nucleo-global/Modais/modal-confirmar-excluir-global/src/modal-confirmar-excluir.css` |
| Handler exclusão | `servicos-global/produto/pedido/client/src/pages/Configuracoes.tsx` (`excluirColunaPersonalizadaConfirmada`) |
| API cliente | `servicos-global/produto/pedido/client/src/shared/api.ts` (`colunasUsuarioApi.excluir`) |
| Service backend | `servicos-global/produto/pedido/server/src/services/colunasUsuarioService.ts` (`excluir`) |

**Spec alvo:** `testes/testes-unitarios/pedido/configuracoes/colunas/personalizadas/TST-UNI-EXCLUIR-COLUNA-MANUAL-CONFIGURACOES-LISTA-PEDIDO-001.test.tsx`

---

## Metadados do teste

- **Ambiente:** [x] Teste | [ ] Produção
- **Local:** Vitest + jsdom
- **Referência visual:** `nucleo-global/Modais/modal-confirmar-excluir-global/PREVISAO_VISUAL.md`

---

## Casos de teste — `ModalConfirmarExcluirGlobal`

### 1. Renderização e acessibilidade

| ID | Caso | Entrada | Resultado esperado |
|----|------|---------|-------------------|
| U-ECM-01 | Modal aberto | `aberto=true`, props mínimas | `role="dialog"`, `aria-modal="true"` |
| U-ECM-02 | Título e subtítulo | `titulo="Excluir coluna"` | `h2#mce-titulo` com texto; subtítulo `comum.modal_excluir_subtitulo` |
| U-ECM-03 | Aviso destrutivo | `descricao` informada | Texto irreversível + `descricao` no `#mce-aviso` |
| U-ECM-04 | Seção registro | `nomeItem="COLUNA MANUAL %"` | Label REGISTRO + célula com nome (tabela 13px) |
| U-ECM-05 | Sem nomeItem | `nomeItem` omitido | Seção registro ausente |
| U-ECM-06 | Modal fechado | `aberto=false` | Retorna `null` (sem portal) |

### 2. Interação — cancelar

| ID | Caso | Ação | Resultado esperado |
|----|------|------|-------------------|
| U-ECM-07 | Botão Cancelar | Click | `aoCancelar` chamado 1× |
| U-ECM-08 | Botão X | Click | `aoCancelar` chamado 1× |
| U-ECM-09 | Tecla Escape | `keydown Escape` | `aoCancelar` chamado 1× |
| U-ECM-10 | Escape durante loading | `confirmando=true` | Escape **não** chama `aoCancelar` |

### 3. Interação — confirmar (sucesso)

| ID | Caso | Setup | Resultado esperado |
|----|------|-------|-------------------|
| U-ECM-11 | Loading ao confirmar | `aoConfirmar` retorna Promise pendente 500ms | Botão com `carregando`; texto `comum.modal_excluir_excluindo` |
| U-ECM-12 | Cancelar desabilitado em loading | Durante U-ECM-11 | Cancelar e X `disabled` |
| U-ECM-13 | Sucesso pós-API | `aoConfirmar` resolve | `resultadoAcao="sucesso"`; label `comum.modal_excluir_excluido` |
| U-ECM-14 | Fecha após sucesso | Após U-ECM-13 + 1200ms | `aoCancelar` chamado automaticamente |
| U-ECM-15 | Reset ao reabrir | `aberto` false→true | `confirmando` e `feedbackBotao` zerados |

### 4. Interação — confirmar (erro)

| ID | Caso | Setup | Resultado esperado |
|----|------|-------|-------------------|
| U-ECM-16 | Erro na API | `aoConfirmar` lança `Error` | `resultadoAcao="erro"`; label `comum.modal_excluir_falhou` |
| U-ECM-17 | Modal permanece | Após U-ECM-16 | `aoCancelar` **não** chamado |
| U-ECM-18 | Reset feedback erro | Após 1500ms pós-erro | Botão volta a `comum.excluir` |
| U-ECM-19 | Erro sem throw | `aoConfirmar` catch interno sem throw | **Falha do teste** — documenta anti-padrão |

### 5. Design system (classes CSS)

| ID | Caso | Verificação |
|----|------|-------------|
| U-ECM-20 | Overlay | Classe `mce__overlay` presente |
| U-ECM-21 | Container max-width | Classe `mce__container` (600px no CSS) |
| U-ECM-22 | Tipografia título | `.mce__titulo` — 1.25rem / 700 |
| U-ECM-23 | Tipografia célula | `.mce__td` — 13px (não 14px bold) |

---

## Casos de teste — `excluirColunaPersonalizadaConfirmada`

| ID | Caso | Mock | Resultado esperado |
|----|------|------|-------------------|
| U-ECM-24 | ID ausente | `confirmarExcluirColunaPersonalizadaId=null` | Retorno imediato; API não chamada |
| U-ECM-25 | Sucesso | `excluir` + `listar` resolvem | `setColunasUsuarioApi` atualizado; `addNotification` success |
| U-ECM-26 | Não fecha modal cedo | Durante promise | Estado `confirmarExcluirColunaPersonalizadaId` **mantido** até modal fechar |
| U-ECM-27 | Erro API | `excluir` rejeita | `addNotification` error + **throw** |
| U-ECM-28 | Mensagem toast sucesso | Coluna `COLUNA MANUAL %` | i18n `msg_excluida` com `{ nome }` |

---

## Casos de teste — `ColunasUsuarioService.excluir`

| ID | Caso | Banco mock | Resultado esperado |
|----|------|------------|-------------------|
| U-ECM-29 | Soft delete | Coluna ativa existe | `ativo_coluna_usuario_pedido: false` |
| U-ECM-30 | Valores preservados | Coluna com valores vinculados | Nenhum `delete` em valores |
| U-ECM-31 | ID inexistente | `findFirst` null | `AppError` 404 `NOT_FOUND` |
| U-ECM-32 | Filtro tenant | Query | `where` inclui `id_organizacao: tenantId` |

---

## Execução

```bash
npx vitest run testes/testes-unitarios/pedido/configuracoes/colunas/personalizadas/TST-UNI-EXCLUIR-COLUNA-MANUAL-CONFIGURACOES-LISTA-PEDIDO-001.test.tsx
```

---

## Resultado final

- [ ] **APROVADO**
- [ ] **REPROVADO**
- [ ] **RESSALVAS**
