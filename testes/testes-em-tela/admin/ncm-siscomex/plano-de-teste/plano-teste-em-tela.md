# Teste em Tela — Agendamento NCM Admin (Integração NCM Siscomex)

**ID:** TST-EMT-ADMIN-NCM-SISCOMEX-AGENDAMENTO-NCM-ADMIN-000100  
**Escopo pasta:** `testes/testes-em-tela/admin/ncm-siscomex/`  
**Plano + runner:** `plano-de-teste/` (`plano-teste-em-tela.md` + `run-TST-EMT-ADMIN-NCM-SISCOMEX-AGENDAMENTO-NCM-ADMIN-000100.ts`)  
**Prints:** `../resultado-teste/<runId>/`  
**Regras de negócio:** `ncm_sync_agendamento` (Cadastros, singleton) · PUT exige **SUPER_ADMIN**  
**Tela-alvo:** Admin › Integração NCM Siscomex  
**Total passos no modal (roteiro):** 9  
**Total itens no modal (roteiro + prints):** 22  

---

## Objetivo

Validar visualmente o ciclo completo:

1. **Agendamento ativo?** → Sim — **Diário às 02h** (`00 02 * * *`)
2. **Agendamento funcionando?** → Config **persiste** após navegar (não só defaults do GET)
3. **Sincronizar Agora** → **Sucesso** (toast + registro Manual no histórico)

---

## Roteiro de execução

### ETAPA 0 — PREPARAÇÃO (PASSOS 01–02)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **01** | Autenticar (Clerk) como **SUPER_ADMIN** | Sessão ativa · Print `01-pos-login.png` (sucesso ou erro) |
| **02** | Navegar até `/admin/ncm-integracao` | Página visível com botões Agendamento e Sincronizar Agora · Print `02-ncm-integracao.png` (sucesso ou erro) |

### ETAPA 1 — CONFIGURAR AGENDAMENTO (PASSO 03)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **03** | Abrir modal, definir **Ativado + Diário + 02h00** e **Salvar Alterações** | Toast de sucesso · Print `03-configurar-agendamento-antes.png` · Print `03-configurar-agendamento-selecao.png` · Print `03-configurar-agendamento-resultado.png` (sucesso ou erro) |

### ETAPA 2 — CHECKLIST DE NEGÓCIO (PASSOS 04–06)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **04** | **01 — Agendamento ativo?** Reabrir modal e inspecionar Configuração | **Sim:** badge ATIVO, Status Ativado, Frequência Diário, hora **02h**, cron **`00 02 * * *`** · Print `04-agendamento-ativo-antes.png` · Print `04-agendamento-ativo-resultado.png` (sucesso ou erro) |
| **05** | **02 — Agendamento funcionando?** Fechar modal, navegar hub → NCM, reabrir modal | Mesmos valores do passo 04 + **sem** "Alterações pendentes" + badge **ATIVO** na toolbar · Print `05-agendamento-funcionando-antes.png` · Print `05-agendamento-funcionando-resultado.png` (sucesso ou erro) |
| **06** | **03 — Sincronizar Agora** na página principal (fora do modal) | Toast **"Sincronização NCM iniciada com sucesso"** e histórico com linha **Manual** + status **Concluído** (ou em andamento → Concluído) · Print `06-sincronizar-agora-antes.png` · Print `06-sincronizar-agora-selecao.png` · Print `06-sincronizar-agora-resultado.png` (sucesso ou erro) |

### ETAPA 3 — CONFIRMAÇÃO FINAL (PASSOS 07–09)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **07** | Revalidar badge ATIVO na toolbar após sync | Botão Agendamento exibe **ATIVO** · Print `07-toolbar-ativo-pos-sync.png` (sucesso ou erro) |
| **08** | Revalidar cron no modal Monitoramento | Aba Monitoramento mostra cron **`00 02 * * *`** e status Ativo · Print `08-monitoramento-cron.png` (sucesso ou erro) |
| **09** | Resumo no `RESULTADO.txt` | Três perguntas respondidas: ativo=sim, funcionando=sim, sync=sucesso |

---

## Prints planejados

| # | Arquivo | Estado capturado |
|---|---------|------------------|
| 01 | `01-pos-login.png` | Pós-login — sucesso ou erro |
| 02 | `02-ncm-integracao.png` | Página Integração NCM |
| 03 | `03-configurar-agendamento-antes.png` | Modal antes de configurar |
| 03 | `03-configurar-agendamento-selecao.png` | Ativado + Diário + 02h selecionados |
| 03 | `03-configurar-agendamento-resultado.png` | Toast após Salvar — sucesso ou erro |
| 04 | `04-agendamento-ativo-antes.png` | Modal Configuração antes da checagem |
| 04 | `04-agendamento-ativo-resultado.png` | ATIVO + Diário + 02h + cron — aprovado ou reprovado |
| 05 | `05-agendamento-funcionando-antes.png` | Toolbar antes de navegar |
| 05 | `05-agendamento-funcionando-resultado.png` | Persistência após hub → NCM — aprovado ou reprovado |
| 06 | `06-sincronizar-agora-antes.png` | Página antes do clique Sincronizar Agora |
| 06 | `06-sincronizar-agora-selecao.png` | Botão Sincronizar Agora acionado |
| 06 | `06-sincronizar-agora-resultado.png` | Toast + histórico — aprovado ou reprovado |
| 07 | `07-toolbar-ativo-pos-sync.png` | Badge ATIVO mantido após sync |
| 08 | `08-monitoramento-cron.png` | Aba Monitoramento com cron e status |

---

## Runner

```bash
npx tsx testes/testes-em-tela/admin/ncm-siscomex/plano-de-teste/run-TST-EMT-ADMIN-NCM-SISCOMEX-AGENDAMENTO-NCM-ADMIN-000100.ts
```

**Variáveis:** `PLAYWRIGHT_BASE_URL`, `CLERK_SECRET_KEY`, `E2E_CLERK_USER_EMAIL`, `E2E_CLERK_USER_PASSWORD`  
**Usuário:** SUPER_ADMIN (obrigatório para salvar agendamento e sincronizar)
