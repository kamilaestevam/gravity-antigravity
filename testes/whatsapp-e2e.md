---
service: WhatsApp
wave: 3
agent: Agente WhatsApp — Onda 3 | 4/13
---

# Plano de Testes E2E (WhatsApp Service)

## Cenários de Inbox & UI

### E2E-WA-01: Carregamento Inicial do WhatsApp Inbox
- **Ação:** O usuário acessa a rota central que engloba o Inbox (`WhatsApp.tsx`).
- **Validação:** A sidebar de conversas aparece do lado esquerdo. O estado de "Caixa de Entrada Vazia" com o ícone de fallback carrega corretamente quando não há conversas instanciadas pelo serviço.
- **Camada:** `frontend`, `shell`

### E2E-WA-02: Abertura e Persistência de Conversa Webhook
- **Ação:** Injetar evento de webhook (via POST) simulando a chegada de uma mensagem de um novo contato (`wa_phone_number: "5511999999999"`).
- **Validação (DB):** As tabelas `WhatsAppConversation` e `WhatsAppMessage` confirmam a persistência isolada (com o `tenant_id` correto e com status `"open"`).
- **Camada:** `webhook`, `prisma`

### E2E-WA-03: Despacho e Entrega em Tempo Real (SSE)
- **Ação:** Enquanto a UI de WhatsApp estiver conectada num canal `/api/v1/whatsapp/stream`, injetar outro evento webhook de mensagem para a conversa aberta por um celular.
- **Validação:** O SSE client intercepta `new_message` corretamente. A UI (mock ou final) adiciona a mensagem de texto instantaneamente ao lado do operador sem dar reload.
- **Camada:** `SSE`, `frontend`

## Cenários de Gabi e Regras de Negócio

### E2E-WA-04: Ativação Gabi na Conversa
- **Ação:** Em uma conversa, ativar o switch (no BD: update flag `ai_enabled = true`). Disparar novo webhook de entrada vindo do contato.
- **Validação:** Observar pelo SSE e Logs que o processo assíncrono evoca o framework LLM emulado, emitindo automaticamente uma resposta com log (`origin: "gabi"`). 
- **Camada:** `AI`, `Gabi`, `Prisma`

### E2E-WA-05: Temperature Score no Fechamento
- **Ação:** O usuário clica para arquivar e fechar a conversa via frontend. (Update state API).
- **Validação:** A conversa altera o status para `closed`. A thread da LLM é chamada (analisando o contexto). Valida-se que o banco de dados armazena os outputs semânticos (ex: `gabi_temperatura_score` é populado).
- **Camada:** `Backend Business`, `Prisma`

## Cenários Restritivos Meta

### E2E-WA-06: Normalização +55 Pós Validação Webhook
- **Ação:** Chamar POST para enviar uma mensagem manual de texto livre para o ID de Contato que retornou um Webhook contendo 12 dígitos.
- **Validação:** O proxy service repinta para +`55 DD 9 NNNN-NNNN`. Meta Cloud API o reconhece e retorna um WAMID (Message ID).
- **Camada:** `Meta SDK Adapter`
