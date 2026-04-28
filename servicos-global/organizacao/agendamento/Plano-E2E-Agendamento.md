# Plano E2E: Agendamento

Este documento define o plano de testes End-to-End para o serviço de Agendamento (Onda 3 | 9/13).

## 1. Escopo E2E
Validar o fluxo completo de:
- Criação de agenda e configuração de disponibilidade.
- Geração automática de slots baseados na config.
- Criação de reserva por um usuário para um slot disponível.
- Disparo de integração com notificação após confirmação.

## 2. Massa de Dados (Setup)
- **Tenant**: `{ tenant_id: "tenant-e2e-agendamento-1" }`
- **Usuário**: `{ usuario_id: "user-e2e-1", email: "e2e@agendamento.test" }`

## 3. Cenários de Teste

### Cenário 1: Setup e Geração de Slots
- **Ação**: Criar uma Agenda "Consulta Geral".
- **Ação**: Configurar disponibilidade (09:00 as 18:00, slots de 30m).
- **Ação**: Chamar rota `/api/v1/slot/gerar` para o dia atual.
- **Validação**: Verificar resposta `201` e certificar-se de que os slots foram criados no banco de dados isolado.

### Cenário 2: Fluxo de Reserva com Sucesso
- **Ação**: Obter o primeiro slot do Cenário 1.
- **Ação**: Chamar rota POST `/api/v1/reserva` associando ao `usuario_id` e slot.
- **Validação**: Response `201 Confirmado`.
- **Validação Secundária**: Verificar (via mock ou log) se a chamada REST para o serviço de Notificações (`POST /api/v1/notificacoes`) foi efetuada.

### Cenário 3: Fluxo de Conflito de Reserva
- **Ação**: Chamar rota POST `/api/v1/reserva` enviando um usuário diferente para o **mesmo** slot do Cenário 2 (capacidade = 1).
- **Validação**: Response `400` com erro de "Slot já está em sua capacidade máxima".

### Cenário 4: Isolamento de Tenant (Segurança)
- **Ação**: Passar o `tenant_id` falso ("tenant-invasor-xd") e tentar acessar `/api/v1/agenda/{tenant_id_correto}` da Agenda criada no Cenário 1.
- **Validação**: Response `404` ou array vazio, garantindo que logs do outro tenant não escapem.

## 4. Submissão
Plano submetido pelo Agente 9/13 para aprovação do líder de QA e dono de produto.
