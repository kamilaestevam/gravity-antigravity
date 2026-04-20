# PLAN_BACKEND_Servicos — Plano de Batalha (Backend)

> **Diretório raiz:** `servicos-global/tenant/`
> **Schema Prisma:** `servicos-global/tenant/prisma/schema.prisma` (composto)
> **Fase:** 2 — Plano aprovado. Não executar sem Fase 3 iniciada.

---

## 1. ARQUIVOS PRISMA A ALTERAR

### Fragments a renomear (por serviço)

| Fragment | Models afetados |
|---|---|
| `atividades/prisma/fragment.prisma` | `AtividadesDados`, `AtividadesParticipantes`, `AtividadesTempo` |
| `cronometro/prisma/fragment.prisma` | `AtividadesCronometro`, `AtividadesTimer`, `TempoCriacaoRelatorio` |
| `email/prisma/fragment.prisma` | `EmailAssuntosParticipantes`, `EmailMensagem`, `EmailRegistroEnvio`, `EmailFilaEnvio`, `TemplateEmail` |
| `whatsapp/prisma/fragment.prisma` | `WhatsappConversa`, `WhatsappMensagem`, `WhatsappLog`, `WhatsappRegra` |
| `mensageria/prisma/fragment.prisma` | `Contatos` (merge de ExternalContact + TenantChannelConfig) |
| `dashboard/prisma/fragment.prisma` | `DashboardConfiguracao`, `DashboardCriar`, `DashboardMetricas`, `DashboardCompartilhar`, `DashboardAlertas` |
| `relatorios/prisma/fragment.prisma` | `RelatoriosSalvos`, `RelatoriosConfiguracao`, `ExportarJob`, `ExportarResultado` |
| `historico/prisma/fragment.prisma` | `HistoricoLog` |
| `notificacoes/prisma/fragment.prisma` | `NotificacoesTituloCorpo` (excluir `NotificationPreferences`) |
| `gabi/prisma/fragment.prisma` | `ConversaCompletaGabi`, `MensagemIndividualGabiai`, `GabiaLogUso`, `GabiaTokenConsumidos`, `GabiaTokenWorkspace` + criar `GabiRole` |
| `agendamento/prisma/fragment.prisma` | `Agenda`, `Slot`, `Reserva`, `DisponibilidadeConfig` → MOVER para Configurador |
| `preferencias-usuario/prisma/fragment.prisma` | `PreferenciaWorkspace` → MOVER para Configurador |
| `ncm-sync/prisma/fragment.prisma` | `NcmItem`, `NcmSyncLog`, `NcmScheduleConfig` → MOVER para Configurador |

---

## 2. SUBSTITUIÇÕES GLOBAIS — POR SERVIÇO

### Atividades (`servicos-global/tenant/atividades/`)
| DE | PARA |
|---|---|
| `prisma.atividade` | `prisma.atividadesDados` |
| `prisma.atividadeParticipante` | `prisma.atividadesParticipantes` |
| `prisma.atividadeSessaoTimer` | `prisma.atividadesTempo` |
| `Atividade` (type) | `AtividadesDados` |

### Cronômetro (`servicos-global/tenant/cronometro/`)
| DE | PARA |
|---|---|
| `prisma.timerSession` | `prisma.atividadesCronometro` |
| `prisma.timerActive` | `prisma.atividadesTimer` |
| `prisma.relatorioTempoCache` | `prisma.tempoCriacaoRelatorio` |
| `TimerSession` (type) | `AtividadesCronometro` |

### Email (`servicos-global/tenant/email/`)
| DE | PARA |
|---|---|
| `prisma.emailThread` | `prisma.emailAssuntosParticipantes` |
| `prisma.emailMessage` | `prisma.emailMensagem` |
| `prisma.emailEnviado` | `prisma.emailRegistroEnvio` |
| `prisma.filaEmail` | `prisma.emailFilaEnvio` |
| `prisma.template` | `prisma.templateEmail` |

### WhatsApp (`servicos-global/tenant/whatsapp/`)
| DE | PARA |
|---|---|
| `prisma.whatsAppConversation` | `prisma.whatsappConversa` |
| `prisma.whatsAppMessage` | `prisma.whatsappMensagem` |
| `prisma.whatsAppUsageLog` | `prisma.whatsappLog` |
| `prisma.whatsAppAutomation` | `prisma.whatsappRegra` |
| `WhatsAppConversation` (type) | `WhatsappConversa` |
| `WhatsAppMessage` (type) | `WhatsappMensagem` |

### Mensageria (`servicos-global/tenant/mensageria/`)
| DE | PARA |
|---|---|
| `prisma.externalContact` | `prisma.contatos` |
| `prisma.tenantChannelConfig` | `prisma.contatos` (após merge) |
| `ExternalContact` (type) | `Contatos` |
| `TenantChannelConfig` (type) | removido (merged) |

### Dashboard (`servicos-global/tenant/dashboard/`)
| DE | PARA |
|---|---|
| `prisma.dashboardConfig` | `prisma.dashboardConfiguracao` |
| `prisma.dashboardWidget` | `prisma.dashboardCriar` |
| `prisma.dashboardMetricSnapshot` | `prisma.dashboardMetricas` |
| `prisma.dashboardShare` | `prisma.dashboardCompartilhar` |
| `prisma.dashboardAlert` | `prisma.dashboardAlertas` |

### Relatórios (`servicos-global/tenant/relatorios/`)
| DE | PARA |
|---|---|
| `prisma.relatorio` | `prisma.relatoriosSalvos` |
| `prisma.configRelatorio` | `prisma.relatoriosConfiguracao` |
| `prisma.exportJob` | `prisma.exportarJob` |
| `prisma.exportResult` | `prisma.exportarResultado` |

### Histórico (`servicos-global/tenant/historico/`)
| DE | PARA |
|---|---|
| `prisma.historyLog` | `prisma.historicoLog` |
| `HistoryLog` (type) | `HistoricoLog` |

### Notificações (`servicos-global/tenant/notificacoes/`)
| DE | PARA |
|---|---|
| `prisma.notification` | `prisma.notificacoesTituloCorpo` |
| `prisma.notificationPreferences` | **DELETAR** — remover toda referência |

### Gabi (`servicos-global/tenant/gabi/`)
| DE | PARA |
|---|---|
| `prisma.gabiConversation` | `prisma.conversaCompletaGabi` |
| `prisma.gabiMessage` | `prisma.mensagemIndividualGabiai` |
| `prisma.gabiUsageLog` | `prisma.gabiaLogUso` |
| `prisma.gabiTokenLog` | `prisma.gabiaTokenConsumidos` |
| `prisma.gabiTokenQuota` | `prisma.gabiaTokenWorkspace` |
| `GabiConversation` (type) | `ConversaCompletaGabi` |
| `GabiMessage` (type) | `MensagemIndividualGabiai` |

---

## 3. ROTAS A ATUALIZAR (por serviço)

### Estrutura padrão de cada serviço
```
servicos-global/tenant/[servico]/server/routes/
servicos-global/tenant/[servico]/server/controllers/
servicos-global/tenant/[servico]/server/services/
```

**Atividades:** Atualizar responses que retornam campos `Atividade.*`

**Email:** Atualizar respostas que retornam `EmailThread`, `EmailMessage` — campo names mudam na API response

**WhatsApp:**
- `GET /api/v1/whatsapp/conversations` → responde `WhatsAppConversation[]` → atualizar para `whatsapp_conversa[]`
- Manter `WhatsAppMessage` — agora `whatsapp_mensagem` — verificar HMAC webhook handler (não pode quebrar)

**Gabi:**
- `GabiConversation` → verificar `assertGabiPermission()` ainda referencia correto
- Adicionar rotas para novo model `personalizacao_organizacao_gabiai`

**Notificações:**
- Remover toda referência a `NotificationPreferences` do código de rotas

---

## 4. SERVIÇOS A MOVER (agendamento, NCM, preferências)

Para cada serviço a mover para o Configurador:
1. Copiar routes para `servicos-global/configurador/server/routes/`
2. Atualizar imports de `@gravity/tenant-resolver` → Prisma do Configurador
3. Testar endpoints no contexto do Configurador
4. Remover do servidor de tenant
5. Remover fragment.prisma do tenant

---

## 5. GRUPO PEDIDO/PROCESSO — DELETAR DAS SERVICES

Remover completamente os seguintes de `servicos-global/tenant/`:
- Qualquer rota que use `prisma.pedido`, `prisma.pedidoItem`, `prisma.processo` etc.
- O fragment de processos/pedido (se existir em `servicos-global/tenant/`) que duplica dados do banco Pedido
- Rotas de proxy que repassam chamadas para o banco Pedido via services

### `servicos-global/tenant/processos-core/` — deletar inteiramente

Esta pasta existe no monorepo com 9 arquivos de código mas **sem** `fragment.prisma`. Contém rotas ativas que acessam o banco Pedido diretamente a partir do servidor de tenant — violação de Database-per-Service. Arquivos a deletar:

```
servicos-global/tenant/processos-core/src/routes/pedidos.ts
servicos-global/tenant/processos-core/src/routes/pedidos-lote.ts
servicos-global/tenant/processos-core/src/routes/pedidos-config.ts
servicos-global/tenant/processos-core/src/routes/importacao.ts
servicos-global/tenant/processos-core/src/services/auditClient.ts
servicos-global/tenant/processos-core/src/services/formulaEngine.ts
servicos-global/tenant/processos-core/src/services/importEngine.ts
servicos-global/tenant/processos-core/src/services/saldoEngine.ts
servicos-global/tenant/processos-core/src/constants.ts
```

Verificar se `formulaEngine.ts` e `saldoEngine.ts` têm lógica reutilizável que deve migrar para `produto/pedido/server/src/services/` antes de deletar.

---

## 6. NCM — MOVER PARA CONFIGURADOR

### `servicos-global/tenant/ncm-sync/server/`
- Arquivos: `init.ts`, `routes/api.ts` (ambos modificados per git status)
- Mover lógica para `servicos-global/configurador/server/routes/ncm.ts`
- Atualizar DATABASE_URL para usar CONFIGURADOR_DATABASE_URL
- Remover de `servicos-global/tenant/`

---

## 7. CHECKLIST FASE 3

```bash
# Por serviço, após substituições:
grep -r "prisma\.atividade\b" servicos-global/tenant/atividades/    # zero
grep -r "prisma\.timerSession" servicos-global/tenant/cronometro/   # zero
grep -r "prisma\.emailThread" servicos-global/tenant/email/         # zero
grep -r "prisma\.whatsAppConversation" servicos-global/tenant/      # zero
grep -r "prisma\.historyLog" servicos-global/tenant/historico/      # zero
grep -r "prisma\.gabiConversation" servicos-global/tenant/gabi/     # zero
grep -r "NotificationPreferences" servicos-global/tenant/           # zero
grep -r "ExternalContact" servicos-global/tenant/                   # zero (após merge)
grep -r "TenantChannelConfig" servicos-global/tenant/               # zero (após merge)

# Pedido/Processo removidos das services:
grep -r "prisma\.pedido\b" servicos-global/tenant/                  # zero
grep -r "prisma\.processo\b" servicos-global/tenant/                # zero

npx tsc --noEmit                                                     # zero erros
```
