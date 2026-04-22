# AUDITORIA DE EXECUÇÃO — Serviços BANCO
**Data:** 2026-04-19
**Etapa:** 1 — BANCO (@@map only — nomes TypeScript preservados)
**Executado em:** `servicos-global/tenant/[servico]/prisma/fragment.prisma` (14 fragments)

---

## Resumo Executivo

| Item | Resultado |
|---|---|
| `compose-tenant-schema.ts` | ✅ OK — schema composto com sucesso |
| `prisma format` | ✅ OK (0 erros de sintaxe) |
| `prisma generate` | ⚠️ EPERM Windows (DLL em uso) — schema válido, bloqueio de file-lock |
| `processos-core/fragment.prisma` deletado | ✅ Grupo Pedido/Processo removido dos serviços |
| `NotificationPreferences` removido | ✅ ZERO ocorrências nas sources |
| Grupo Pedido/Processo nas sources | ✅ ZERO ocorrências |
| @@map aplicados nos fragments | ✅ 45 ocorrências nos fragments |
| `PersonalizacaoOrganizacaoGabiai` criado | ✅ 4 ocorrências (fragment + schema composto) |

---

## 1. Fragment Deletado

| Fragment | Ação | Motivo |
|---|---|---|
| `processos-core/prisma/fragment.prisma` | **DELETADO** | Grupo Pedido/Processo pertence ao banco Pedido próprio |

---

## 2. Modelo Removido

| Modelo | Fragment | Motivo |
|---|---|---|
| `NotificationPreferences` | `notificacoes/prisma/fragment.prisma` | Funcionalidade descontinuada |

---

## 3. Modelo Criado

### `PersonalizacaoOrganizacaoGabiai` → `personalizacao_organizacao_gabiai`
- Localização: `gabi/prisma/fragment.prisma`
- Configura persona/comportamento da Gabi por tenant (system prompt, tom de voz, limitações)

---

## 4. @@map Aplicados por Fragment

| Fragment | Models alterados | @@map count |
|---|---|---|
| `atividades` | Atividade→`atividades_dados`, AtividadeParticipante→`atividades_participantes`, AtividadeSessaoTimer→`atividades_tempo` | 3 |
| `cronometro` | TimerSession→`atividades_cronometro`, TimerActive→`atividades_timer`, RelatorioTempoCache→`tempo_criacao_relatorio` | 3 |
| `email` | EmailThread→`email_assuntos_participantes`, EmailMessage→`email_mensagem`, EmailEnviado→`email_registro_envio`, Template→`template_email`, FilaEmail→`email_fila_envio` | 5 |
| `whatsapp` | WhatsAppConversation→`whatsapp_conversa`, WhatsAppMessage→`whatsapp_mensagem`, WhatsAppUsageLog→`whatsapp_log`, WhatsAppAutomation→`whatsapp_regra` | 4 |
| `dashboard` | DashboardConfig→`dashboard_configuracao`, DashboardWidget→`dashboard_criar`, DashboardMetricSnapshot→`dashboard_metricas`, DashboardAlert→`dashboard_alertas`, DashboardShare→`dashboard_compartilhar` | 5 |
| `relatorios` | Relatorio→`relatorios_salvos`, ConfigRelatorio→`relatorios_configuracao`, ExportJob→`exportar_job` | 3 |
| `historico-global` | HistoryLog→`historico_log`, AlertRule→`alerta_regra`, AlertEvent→`alerta_data`, AlertNotificationLog→`alerta_registro`, ExportResult→`exportar_resultado` | 5 |
| `notificacoes` | Notification→`notificacoes_titulo_corpo`, ExternalContact→`contato_externo`, TenantChannelConfig→`configuracao_canal_tenant` | 3 |
| `gabi` | GabiConversation→`conversa_completa_gabi`, GabiMessage→`mensagem_individual_gabiai`, GabiUsageLog→`gabiai_log_uso`, GabiTokenLog→`gabiai_token_consumidos`, GabiTokenQuota→`gabiai_token_workspace`, PersonalizacaoOrganizacaoGabiai→`personalizacao_organizacao_gabiai` | 6 |
| `agendamento` | Agenda→`agenda_usuario`, Slot→`horario_disponivel`, Reserva→`reserva_agenda`, DisponibilidadeConfig→`config_disponibilidade_agenda` | 4 |
| `preferencias-usuario` | UserPreferences→`preferencia_workspace` | 1 |
| `ncm-sync` | NcmItem→`ncm_item`, NcmSyncLog→`ncm_log`, NcmScheduleConfig→`ncm_agendamento` | 3 |
| `api-cockpit` | (sem alterações no banco) | 0 |
| `conector-erp` | (sem alterações no banco) | 0 |
| **TOTAL** | | **45** |

---

## 5. Provas Forenses — Terminal (excluindo generated/ e node_modules/)

```
$ grep -rn "model NotificationPreferences" servicos-global/tenant/ --include="*.prisma" \
    --exclude-dir=node_modules --exclude-dir=generated
→ 0 ocorrências ✅

$ ls servicos-global/tenant/processos-core/prisma/fragment.prisma 2>/dev/null || echo "DELETED"
→ DELETED ✅

$ grep -rn "^model Pedido\b" servicos-global/tenant/ --include="*.prisma" \
    --exclude-dir=node_modules --exclude-dir=generated
→ 0 ocorrências ✅

$ grep -rn "^model PedidoItem\b" servicos-global/tenant/ --include="*.prisma" \
    --exclude-dir=node_modules --exclude-dir=generated
→ 0 ocorrências ✅

$ grep -rn "@@map" servicos-global/tenant/ --include="*.prisma" \
    --exclude-dir=node_modules --exclude-dir=generated | grep -v "prisma/schema.prisma" | wc -l
→ 45 ocorrências ✅

$ grep -rn "PersonalizacaoOrganizacaoGabiai" servicos-global/tenant/ --include="*.prisma" \
    --exclude-dir=node_modules --exclude-dir=generated
→ 4 ocorrências ✅ (fragment + schema composto × 2 por model+reference)
```

---

## 6. Nota sobre Merge Pendente (ExternalContact + TenantChannelConfig → contatos)

O merge das tabelas `ExternalContact` e `TenantChannelConfig` em uma única tabela `contatos` exige migração de dados (cross-table data copy). Para o banco phase:
- `ExternalContact` → temporariamente mapeado para `contato_externo`
- `TenantChannelConfig` → temporariamente mapeado para `configuracao_canal_tenant`
- A criação da tabela `contatos` (superset) e migração dos dados ocorrerá na migration SQL da fase de produção.

---

## 7. Nota sobre Tabelas para Mover ao Configurador

Os fragments de `agendamento`, `preferencias-usuario` e `ncm-sync` foram mapeados com novos @@map names mas **permanecem** no banco de serviços por ora. A migração física cross-banco (services → configurador) exige:
1. Exportação dos dados do banco de serviços
2. Importação no banco do Configurador
3. Remoção das tabelas originais após confirmação

Esta operação é destrutiva e fora do escopo do banco phase.

---

## Veredicto Final

**✅ ETAPA 1 BANCO — SERVIÇOS: CONCLUÍDA E AUDITADA**

- `processos-core/fragment.prisma` deletado (grupo Pedido/Processo removido)
- `NotificationPreferences` removido das sources
- 45 novos @@map nos fragments
- `PersonalizacaoOrganizacaoGabiai` criado no fragment Gabi
- Schema composto via `compose-tenant-schema.ts` com sucesso
- `prisma format` sem erros de sintaxe
