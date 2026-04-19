# PLAN_FRONTEND_Servicos — Plano de Batalha (Frontend)

> **Contexto:** Componentes e produtos que consomem APIs dos serviços tenant
> **Diretórios afetados:** `nucleo-global/`, `servicos-global/`, produtos que usam APIs de tenant
> **Fase:** 2 — Plano aprovado. Não executar sem Fase 3 iniciada.

---

## 1. IMPACTO NOS CONSUMIDORES DAS APIs

Os serviços tenant expõem APIs REST. O frontend consome essas APIs via fetch/axios.
Quando o backend renomear os campos nas respostas JSON, os frontends que consomem precisam atualizar.

---

## 2. CAMPOS DE API QUE MUDAM NA RESPOSTA JSON

### Email
| Campo antigo (JSON) | Campo novo (JSON) |
|---|---|
| Thread: `id`, `subject`, `status` | Verificar se campos estão padronizados |
| Message: `id`, `body`, `direction` | Verificar nomes na resposta |

**Grep:** `grep -r "emailThread\|email_thread\|EmailThread" produto/ nucleo-global/`

### WhatsApp
| Campo antigo (JSON) | Campo novo (JSON) |
|---|---|
| Conversation: objeto completo | `whatsapp_conversa` como chave |
| Message: `wa_message_id`, `direction`, `content` | `whatsapp_mensagem` como chave |

**Grep:** `grep -r "WhatsAppConversation\|whatsApp\|whatsapp_conversation" produto/ servicos-global/shell/`

### Gabi
| Campo antigo (JSON) | Campo novo (JSON) |
|---|---|
| `conversation_id` | mantém |
| `GabiConversation` (type) | `ConversaCompletaGabi` |
| `GabiMessage` (type) | `MensagemIndividualGabiai` |

**Grep:** `grep -r "GabiConversation\|GabiMessage\|gabiConversation" produto/ servicos-global/`

### Dashboard
| Campo antigo (JSON) | Campo novo (JSON) |
|---|---|
| `DashboardConfig` | `DashboardConfiguracao` |
| `DashboardWidget` | `DashboardCriar` |

### Notificações
| Campo antigo (JSON) | Campo novo (JSON) |
|---|---|
| `NotificationPreferences` | **REMOVIDO** — componentes que exibem/editam preferências de notificação precisam ser removidos ou refatorados |

**Grep:** `grep -r "NotificationPreferences\|notification_preferences" produto/ servicos-global/shell/`

### Histórico
| Campo antigo (JSON) | Campo novo (JSON) |
|---|---|
| `HistoryLog` (type) | `HistoricoLog` |

---

## 3. SHELL — COMPONENTES AFETADOS

`servicos-global/shell/index.ts` (modificado — git status)

Verificar se o shell expõe ou consome algum dos seguintes:
- Componentes de notificação que usam `NotificationPreferences`
- Componentes de WhatsApp
- Componentes de Gabi

```bash
grep -r "NotificationPreferences\|GabiConversation\|WhatsAppConversation" servicos-global/shell/
```

---

## 4. MENSAGERIA GLOBAL

`nucleo-global/Mensageria Global/mensageria-global/src/AvisoInternoGlobal.tsx` (modificado — git status)
`nucleo-global/Mensageria Global/mensageria-global/src/aviso-interno.css` (modificado — git status)

Verificar se usa `ExternalContact`, `TenantChannelConfig`, ou `contatos`:
```bash
grep -r "ExternalContact\|TenantChannelConfig\|contato" "nucleo-global/Mensageria Global/"
```

---

## 5. NOVOS COMPONENTES PARA `personalizacao_organizacao_gabiai`

O novo model `PersonalizacaoOrganizacaoGabiai` precisará de UI para:
- Configurar system prompt da Gabi por tenant
- Configurar tom de voz e limitações
- Toggle de ativação

Local sugerido: no configurador do tenant (workspace settings) ou admin panel.

---

## 6. AGENDAMENTO — COMPONENTES A MOVER/ATUALIZAR

Se existem componentes de agendamento (Agenda, Slot, Reserva) que se conectam ao banco de serviços, após a migração para o Configurador:
- Atualizar endpoint base de `TENANT_API_URL` para `CONFIGURADOR_URL`
- Atualizar tipos de resposta

---

## 7. CHECKLIST FASE 3

```bash
# Verificar zero referências a nomes antigos nos consumidores:
grep -r "NotificationPreferences" nucleo-global/ servicos-global/shell/ produto/
grep -r "ExternalContact" nucleo-global/ servicos-global/shell/ produto/
grep -r "TenantChannelConfig" nucleo-global/ servicos-global/shell/ produto/
grep -r "GabiConversation" nucleo-global/ servicos-global/ produto/
grep -r "WhatsAppConversation" nucleo-global/ servicos-global/ produto/
grep -r "HistoryLog" nucleo-global/ servicos-global/ produto/

npx tsc --noEmit   # zero erros
```
