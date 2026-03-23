# Plano de Testes E2E - Serviço de Relatórios

## 1. Login e Setup de Ambiente
- Realiza login como usuário de tenant ativo.
- Acessa produto que tem integração (ex: NF Importação ou Dashboard).

## 2. Acesso à Interface de Relatórios
- Clica em "Relatórios" na navegação principal ou via tenant shell.
- Verifica carregamento do container do relatório, checando se a rota `GET /api/v1/relatorios/saved` não falha.

## 3. Criação de Novo Relatório
- Preenche "Nome da Visão".
- Clica para adicionar Colunas via Drag and Drop.
- Verifica integração drag-and-drop chamando visualmente a modificação do estado de colunas.
- Salva o relatório (`POST /api/v1/relatorios/saved`).
- Verifica se aparece na lista de relatórios lateral.

## 4. Exportação
- Abre relatório salvo.
- Clica em "Exportar -> Excel".
- Uma notificação deve pular informando "Processando..." e após aguardar alguns segundos, notificação "Download pronto".
- E2E intercepta a chamada de polling `GET /api/v1/relatorios/export/:jobId` verificando a mudança de `PENDENTE -> PROCESSANDO -> DONE`.
- Valida o link de arquivo injetado na resposta após `DONE`.

## 5. Teardown
- Apaga relatório criado (`DELETE /api/v1/relatorios/saved/:id`).
- Garante que a lista não contém o item excluído.
- Faz logoff.
