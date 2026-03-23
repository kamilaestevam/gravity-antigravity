# Plano de Testes E2E - API Cockpit

**Escopo:** Validar a funcionalidade fim-a-fim da central de controle de APIs (API Cockpit), garantindo isolamento de tenants, verificação de criptografia AES-256 e fluxos de webhooks.

## 1. Fluxo de Tokens de Acesso
- **Cenário 1:** Criar um token de produção. Validar que retorna uma única vez com o prefixo `gv_live_sk_`.
- **Cenário 2:** Validar hash armazenado no banco (não é plain text).
- **Cenário 3:** Revogar token e testar o acesso com ele na API (deve retornar 401).
- **Cenário 4:** Listar tokens ativos para um tenant, validando que tokens de outros tenants não retornam.

## 2. Fluxo de Webhooks (Disparo e Assinatura)
- **Cenário 1:** Criar webhook para o tenant, configurando a URL.
- **Cenário 2:** Acionar o endpoint `/test` e validar se a notificação HTTP chega ao destino com sucesso.
- **Cenário 3:** Validar que o cabeçalho `X-Gravity-Signature` contém a assinatura HMAC SHA-256 correta e conferir o payload recebido.
- **Cenário 4:** Conferir a gravação do log de execução no `WebhookLog`, mapeando latência, status e tentativas.

## 3. Fluxo de Conexão ERP (Conector OData/REST)
- **Cenário 1:** Salvar credenciais de um ERP SAP. Inserir mock para a chave `ENCRYPTION_KEY` e validar gravação do cipher com formato `{iv}:{authTag}:{encrypted}`.
- **Cenário 2:** Testar endpoint `/connection/test` e conferir se o serviço consegue decifrar os dados em memória para realizar o request (simulação de ping).
- **Cenário 3:** Disparar requisição `/query` via OData (payload) mockando o sistema de destino e validando que o proxy repassa com Authentication Basic correta.

## 4. Documentação e Automação
- **Cenário:** O endpoint GET `/api/v1/cockpit/docs/raw` deve retornar as definições completas OpenAPI compatíveis (via zod-to-openapi) contemplando as rotas criadas. Swagger UI (`/docs/`) deve renderizar na integração final.

---
**Status atual:** Submetido à aprovação do dono (QA).
