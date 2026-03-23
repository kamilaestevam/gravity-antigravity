# Plano E2E — Notificações (Onda 3)

## Autor da Funcionalidade: Agente Notificações (8/13)
## URL da Funcionalidade: `(Dropdown Global)` / API `/api/v1/notificacoes`

---

## 1. Verificação de Acesso e Isolamento de Tenant (Caminho Infeliz)
- [ ] Enviar GET para `/api/v1/notificacoes` sem `x-tenant-id`
  - Esperado: Erro **400/401** de autenticação/isolamento
- [ ] Tentar acessar notificação de outro tenant
  - Esperado: Notificação não encontrada ou 401 Unauthorized

## 2. Inserção / Eventos Base (Worker)
- [ ] Disparar um job `send-notification` via pg-boss com userId válido
  - Esperado: Job concluído e Notification salva no DB do respectivo tenant

## 3. SSE e Comunicação em Tempo Real
- [ ] Abrir stream SSE em `/api/v1/notificacoes/stream` e disparar job via worker
  - Esperado: Receber payload `new_notification` via stream SSE

## 4. UI: Badge e Leitura
- [ ] Enviar 11 notificações não lidas.
  - Esperado: Badge exibir `9+`
- [ ] Clicar no botão 'Marcar todas como lidas'.
  - Esperado: Badge sumir, notificações ficarem acinzentadas/lidas

## 5. Ações da UI In-App
- [ ] Clicar no botão dispensar de uma notificação específica
  - Esperado: Remoção instantânea da notificação do menu dropdown
- [ ] Atualizar a página após dispensar
  - Esperado: A notificação dispensada não deve retornar

## 6. Workers & Falhas
- [ ] Simular falha na API do Email/Resend durante o job
  - Esperado: Job processNotificationJob lança exception, pg-boss reagenda o job (retry ativo)
- [ ] Simular falha na API do WhatsApp
  - Esperado: Job conclui normalmente e evento de erro no WhatsApp é apenas logado (não fatal para in-app/email)
