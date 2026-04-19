# PLAN_BANCO_Servicos — Plano de Batalha (Banco)

> **Banco:** `gravity-servicos-producao` / `gravity-servicos-teste`
> **Schema Prisma:** `servicos-global/tenant/prisma/schema.prisma` (composto de fragments)
> **Fragments:** `servicos-global/tenant/[servico]/prisma/fragment.prisma`
> **Fase:** 2 — Plano aprovado. Não executar sem Fase 3 iniciada.

---

## 1. RENOMEAR TABELAS

| Model (DE) | Model (PARA) | @@map atual | @@map alvo |
|---|---|---|---|
| `Atividade` | `AtividadesDados` | `atividades` | `atividades_dados` |
| `AtividadeParticipante` | `AtividadesParticipantes` | `atividade_participantes` | `atividades_participantes` |
| `AtividadeSessaoTimer` | `AtividadesTempo` | `atividade_sessoes_timer` | `atividades_tempo` |
| `TimerSession` | `AtividadesCronometro` | (sem @@map) | `atividades_cronometro` |
| `TimerActive` | `AtividadesTimer` | (sem @@map) | `atividades_timer` |
| `RelatorioTempoCache` | `TempoCriacaoRelatorio` | (sem @@map) | `tempo_criacao_relatorio` |
| `EmailThread` | `EmailAssuntosParticipantes` | (sem @@map) | `email_assuntos_participantes` |
| `EmailMessage` | `EmailMensagem` | (sem @@map) | `email_mensagem` |
| `EmailEnviado` | `EmailRegistroEnvio` | (sem @@map) | `email_registro_envio` |
| `FilaEmail` | `EmailFilaEnvio` | (sem @@map) | `email_fila_envio` |
| `Template` | `TemplateEmail` | (sem @@map) | `template_email` |
| `WhatsAppConversation` | `WhatsappConversa` | (sem @@map) | `whatsapp_conversa` |
| `WhatsAppMessage` | `WhatsappMensagem` | (sem @@map) | `whatsapp_mensagem` |
| `WhatsAppUsageLog` | `WhatsappLog` | (sem @@map) | `whatsapp_log` |
| `WhatsAppAutomation` | `WhatsappRegra` | (sem @@map) | `whatsapp_regra` |
| `DashboardConfig` | `DashboardConfiguracao` | (sem @@map) | `dashboard_configuracao` |
| `DashboardWidget` | `DashboardCriar` | (sem @@map) | `dashboard_criar` |
| `DashboardMetricSnapshot` | `DashboardMetricas` | (sem @@map) | `dashboard_metricas` |
| `DashboardShare` | `DashboardCompartilhar` | (sem @@map) | `dashboard_compartilhar` |
| `DashboardAlert` | `DashboardAlertas` | (sem @@map) | `dashboard_alertas` |
| `Relatorio` | `RelatoriosSalvos` | (sem @@map) | `relatorios_salvos` |
| `ConfigRelatorio` | `RelatoriosConfiguracao` | (sem @@map) | `relatorios_configuracao` |
| `ExportJob` | `ExportarJob` | (sem @@map) | `exportar_job` |
| `ExportResult` | `ExportarResultado` | (sem @@map) | `exportar_resultado` |
| `HistoryLog` | `HistoricoLog` | (sem @@map) | `historico_log` |
| `AlertRule` | `AlertaRegra` | (sem @@map) | `alerta_regra` |
| `AlertEvent` | `AlertaData` | (sem @@map) | `alerta_data` |
| `AlertNotificationLog` | `AlertaRegistro` | (sem @@map) | `alerta_registro` |
| `Notification` | `NotificacoesTituloCorpo` | (sem @@map) | `notificacoes_titulo_corpo` |
| `GabiConversation` | `ConversaCompletaGabi` | (sem @@map) | `conversa_completa_gabi` |
| `GabiMessage` | `MensagemIndividualGabiai` | (sem @@map) | `mensagem_individual_gabiai` |
| `GabiUsageLog` | `GabiaLogUso` | (sem @@map) | `gabiai_log_uso` |
| `GabiTokenLog` | `GabiaTokenConsumidos` | (sem @@map) | `gabiai_token_consumidos` |
| `GabiTokenQuota` | `GabiaTokenWorkspace` | (sem @@map) | `gabiai_token_workspace` |
| `Agenda` | `AgendaUsuario` | (sem @@map) | `agenda_usuario` |
| `Slot` | `HorarioDisponivel` | (sem @@map) | `horario_disponivel` |
| `Reserva` | `ReservaAgenda` | (sem @@map) | `reserva_agenda` |
| `DisponibilidadeConfig` | `ConfigDisponibilidadeAgenda` | (sem @@map) | `config_disponibilidade_agenda` |
| `UserPreferences` | `PreferenciaWorkspace` | (sem @@map) | `preferencia_workspace` |

---

## 2. MESCLAR (merge — duas tabelas viram uma)

| Tabela A (DE) | Tabela B (DE) | Tabela resultante (PARA) | @@map alvo |
|---|---|---|---|
| `ExternalContact` | `TenantChannelConfig` | `Contatos` | `contatos` |

**Estratégia de merge `contatos`:**
- Criar nova tabela `contatos` com campos superset das duas
- Migrar dados de ambas com `tipo_contato` como discriminador
- Deletar `ExternalContact` e `TenantChannelConfig` após migração

---

## 3. EXCLUIR

| Tabela | Motivo |
|---|---|
| `NotificationPreferences` | Funcionalidade descontinuada |
| `Pedido` (services) | Pertence ao banco Pedido próprio |
| `PedidoItem` (services) | Pertence ao banco Pedido próprio |
| `Processo` (services) | Pertence ao banco Pedido próprio |
| `ProcessoFatura` (services) | Pertence ao banco Pedido próprio |
| `ProcessoItem` (services) | Pertence ao banco Pedido próprio |
| `ProcessoContainer` (services) | Pertence ao banco Pedido próprio |
| `PedidoStatus` (services) | Pertence ao banco Pedido próprio |
| `PedidoColuna` (services) | Pertence ao banco Pedido próprio |
| `PedidoPreferenciaUsuario` (services) | Pertence ao banco Pedido próprio |
| `PedidoPreferenciaPadrao` (services) | Pertence ao banco Pedido próprio |
| `ConfiguracaoPedido` (services) | Pertence ao banco Pedido próprio |
| `MapeamentoImport` (services) | Move para Configurador como `erp_mapa` |

---

## 4. MOVER PARA CONFIGURADOR (remover dos serviços)

| Tabela (services) | @@map alvo (configurador) | Fragment origem |
|---|---|---|
| `UserPreferences` | `preferencia_workspace` | `preferencias-usuario/prisma/fragment.prisma` |
| `Agenda` | `agenda_usuario` | `agendamento/prisma/fragment.prisma` |
| `Slot` | `horario_disponivel` | `agendamento/prisma/fragment.prisma` |
| `Reserva` | `reserva_agenda` | `agendamento/prisma/fragment.prisma` |
| `DisponibilidadeConfig` | `config_disponibilidade_agenda` | `agendamento/prisma/fragment.prisma` |
| `NcmItem` | `ncm_item` | `ncm-sync/prisma/fragment.prisma` (ou equivalente) |
| `NcmSyncLog` | `ncm_log` | `ncm-sync/prisma/fragment.prisma` |
| `NcmScheduleConfig` | `ncm_agendamento` | `ncm-sync/prisma/fragment.prisma` |
| `MapeamentoImport` | `erp_mapa` | `conector-erp/prisma/fragment.prisma` |

---

## 5. CRIAR (nova tabela)

### `personalizacao_organizacao_gabiai`
Configuração de persona/comportamento da Gabi por tenant (system prompt customizado, tom de voz, limitações específicas).

```prisma
model PersonalizacaoOrganizacaoGabiai {
  id                String   @id @default(cuid())
  tenant_id         String   @unique
  product_id        String?
  system_prompt     String?  @db.Text
  tom_voz           String?
  limitacoes        String?  @db.Text
  instrucoes_extras String?  @db.Text
  ativo             Boolean  @default(true)
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt

  @@map("personalizacao_organizacao_gabiai")
  @@index([tenant_id])
}
```

---

## 6. FRAGMENTS A ATUALIZAR

| Fragment | Ação |
|---|---|
| `atividades/prisma/fragment.prisma` | Renomear models + @@map |
| `cronometro/prisma/fragment.prisma` | Renomear TimerSession, TimerActive, RelatorioTempoCache |
| `email/prisma/fragment.prisma` | Renomear EmailThread, EmailMessage, EmailEnviado, FilaEmail, Template |
| `whatsapp/prisma/fragment.prisma` | Renomear WhatsAppConversation, WhatsAppMessage (manter), WhatsAppUsageLog, WhatsAppAutomation |
| `mensageria/prisma/fragment.prisma` | Merge ExternalContact + TenantChannelConfig → contatos |
| `dashboard/prisma/fragment.prisma` | Renomear 5 models de dashboard |
| `relatorios/prisma/fragment.prisma` | Renomear Relatorio, ConfigRelatorio, ExportJob, ExportResult |
| `historico/prisma/fragment.prisma` | Renomear HistoryLog |
| `notificacoes/prisma/fragment.prisma` | Renomear Notification, excluir NotificationPreferences |
| `gabi/prisma/fragment.prisma` | Renomear 5 models Gabi + criar GabiRole |
| `agendamento/prisma/fragment.prisma` | Renomear 4 models + MOVER para Configurador |
| `preferencias-usuario/prisma/fragment.prisma` | Renomear UserPreferences + MOVER para Configurador |
| `ncm-sync/prisma/fragment.prisma` | Renomear 3 models + MOVER para Configurador |
| Processos/Pedido fragments | DELETAR todos (vão para banco Pedido) |

---

## 7. ORDEM DE EXECUÇÃO

```
1. Backup manual do banco
2. Deletar grupo Pedido/Processo (12 models) — sem dependências externas dentro do schema
3. Excluir NotificationPreferences
4. Executar merge ExternalContact + TenantChannelConfig → contatos
5. Criar personalizacao_organizacao_gabiai
6. Renomear tabelas simples (@@map) em lote — sem quebra de dados
7. Mover tabelas para Configurador (migração cross-banco):
   a. Exportar dados das tabelas de origem
   b. Importar no Configurador com @@map correto
   c. Deletar das services após confirmação
8. Atualizar todos os fragments após cada rename
9. Recompilar schema via compose-tenant-schema.ts
10. tsc zero erros + grep zero legacy names
```

---

## 8. RISCOS

| Risco | Mitigação |
|---|---|
| Merge ExternalContact+TenantChannelConfig pode ter conflito de IDs | Usar novo CUID para cada registro na tabela destino |
| Mover tabelas cross-banco (services → configurador) é operação destrutiva | Migrar dados primeiro, validar, só depois deletar origem |
| Grupo Pedido/Processo em services tem dados de produção | Confirmar que banco Pedido tem cópia completa antes de deletar |
| `compose-tenant-schema.ts` precisa ser recompilado após cada fragment | Garantir CI roda compose antes de deploy |
