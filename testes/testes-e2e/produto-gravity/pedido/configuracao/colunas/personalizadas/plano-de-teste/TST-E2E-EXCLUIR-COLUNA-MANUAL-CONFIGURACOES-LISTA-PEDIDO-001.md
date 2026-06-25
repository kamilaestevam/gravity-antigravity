# 📋 Plano de Testes E2E — Excluir Coluna Manual (Configurações)

**ID:** TST-E2E-EXCLUIR-COLUNA-MANUAL-CONFIGURACOES-LISTA-PEDIDO-001  
**Produto:** Pedido  
**Tela:** Configurações → Colunas → Personalizadas (`/pedido/configuracoes`)  
**Feature:** Modal de confirmação + exclusão de coluna manual + toast  
**Tipo:** E2E (Playwright)  
**Data:** 2026-06-09  
**Ambiente:** Local (`localhost:8000`) ou Staging  
**Criticidade:** alta  
**Status:** Aguardando aprovação do dono

---

## Resumo executivo

Plano E2E do fluxo completo de exclusão de coluna personalizada na tela de Configurações: abrir modal pelo botão X, confirmar com loading no botão Excluir, validar toast e remoção da lista. Inclui cancelamento, guards durante operação e cenário de erro.

**Fora do escopo:** teste em tela (`testes-em-tela`) — outro agente.

**Spec alvo:** `testes/testes-e2e/produto-gravity/pedido/configuracao/colunas/personalizadas/TST-E2E-EXCLUIR-COLUNA-MANUAL-CONFIGURACOES-LISTA-PEDIDO-001.spec.ts`

---

## Pré-requisitos

| Requisito | Detalhe |
|-----------|---------|
| URL shell | `http://localhost:8000` ou staging |
| Login | Usuário ADMIN com org + workspace ativo |
| Permissões | Acesso a Configurações do Pedido |
| Dados | ≥ 1 coluna personalizada ativa (ex.: `COLUNA MANUAL %`) |
| Backend | `pedido` server com rota `DELETE /colunas-usuario/:id` |

---

## Cobertura — categorias QA

| Cat | Nome | Passos |
|-----|------|--------|
| 6 | Modais e Formulários | E-ECM-01 a E-ECM-12 |
| 7 | Estados de Interface | E-ECM-13 a E-ECM-22 |
| 10 | Validação Visual | E-ECM-23 a E-ECM-26 |
| 16 | A11y | E-ECM-27 a E-ECM-28 |

---

## FLUXO 1 — Abrir modal de exclusão

| ID | Ação | Resultado esperado |
|----|------|-------------------|
| E-ECM-01 | Login → `/pedido/configuracoes` → sidebar **Colunas** → **Personalizadas** | Aba carrega com lista de colunas |
| E-ECM-02 | Localizar coluna `COLUNA MANUAL %` (ou fixture) | Linha visível na lista |
| E-ECM-03 | Clicar botão **X** (excluir) da coluna | Modal abre — **não** exclui imediatamente |
| E-ECM-04 | Verificar título do modal | Texto `Excluir coluna` (i18n) |
| E-ECM-05 | Verificar subtítulo | `Confirme antes de prosseguir com a exclusão.` |
| E-ECM-06 | Verificar aviso vermelho | `Esta ação é irreversível.` + `Os valores existentes serão preservados.` |
| E-ECM-07 | Verificar seção REGISTRO | Nome da coluna exibido (ex.: `COLUNA MANUAL %`) |
| E-ECM-08 | Verificar botões footer | `Cancelar` (secundário) + `Excluir` (perigo, ícone lixeira) |

---

## FLUXO 2 — Cancelar exclusão

| ID | Ação | Resultado esperado |
|----|------|-------------------|
| E-ECM-09 | Com modal aberto, clicar **Cancelar** | Modal fecha; coluna permanece na lista |
| E-ECM-10 | Reabrir modal; clicar **X** do header | Modal fecha; coluna permanece |
| E-ECM-11 | Reabrir modal; tecla **Escape** | Modal fecha; coluna permanece |
| E-ECM-12 | Após cancelar, F5 na página | Coluna ainda presente |

---

## FLUXO 3 — Confirmar exclusão (caminho feliz)

| ID | Ação | Resultado esperado |
|----|------|-------------------|
| E-ECM-13 | Clicar **Excluir** no modal | Botão entra em loading — texto `Excluindo...` |
| E-ECM-14 | Durante loading | Cancelar, X e Escape **desabilitados** |
| E-ECM-15 | Aguardar resposta API | Botão exibe flash `Excluído` (verde) |
| E-ECM-16 | Após ~1,2s | Modal fecha automaticamente |
| E-ECM-17 | Toast na tela | Notificação sucesso com nome da coluna |
| E-ECM-18 | Lista personalizadas | Coluna **ausente** da lista |
| E-ECM-19 | F5 na página | Coluna continua ausente |
| E-ECM-20 | Ir `/pedido/pedidos/lista` | Coluna não aparece no seletor de colunas (se aplicável) |

---

## FLUXO 4 — Erro na exclusão

| ID | Ação | Resultado esperado |
|----|------|-------------------|
| E-ECM-21 | Interceptar `DELETE /colunas-usuario/*` → 500 | Botão exibe `Falhou` (vermelho) |
| E-ECM-22 | Após erro | Modal **permanece aberto** |
| E-ECM-23 | Toast erro | Mensagem `msg_erro_excluir` |
| E-ECM-24 | Clicar Cancelar após erro | Modal fecha; coluna ainda na lista |

---

## FLUXO 5 — Validação visual (Percy / screenshot)

| ID | Estado | Captura |
|----|--------|---------|
| E-ECM-25 | Modal aberto (idle) | Tipografia: título 1.25rem; registro 13px |
| E-ECM-26 | Botão loading | Spinner orbital no botão Excluir |
| E-ECM-27 | Flash sucesso | Label `Excluído` no botão |
| E-ECM-28 | Flash erro | Label `Falhou` no botão |

---

## FLUXO 6 — Acessibilidade

| ID | Verificação | Resultado esperado |
|----|-------------|-------------------|
| E-ECM-29 | `role="dialog"` + `aria-labelledby` | Leitor de tela anuncia título |
| E-ECM-30 | Foco trap no modal | Tab circula dentro do modal enquanto aberto |

---

## Dados de teste

| Fixture | Valor |
|---------|-------|
| Coluna descartável | Criar via UI: nome `TST Excluir E2E`, tipo Texto |
| Coluna permanente | Usar coluna existente apenas em fluxo 4 (erro mock) |

---

## Execução

```bash
npx playwright test testes/testes-e2e/produto-gravity/pedido/configuracao/colunas/personalizadas/TST-E2E-EXCLUIR-COLUNA-MANUAL-CONFIGURACOES-LISTA-PEDIDO-001.spec.ts
```

---

## Prova visual (QA E2E)

Anexar em `resultado-teste/`:
- Screenshot modal aberto
- Screenshot loading `Excluindo...`
- Screenshot toast sucesso pós-fechamento

---

## Resultado final

- [ ] **APROVADO**
- [ ] **REPROVADO**
- [ ] **RESSALVAS**
