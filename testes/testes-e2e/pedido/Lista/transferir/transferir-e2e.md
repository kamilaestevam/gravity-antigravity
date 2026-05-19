# Plano de Teste E2E — Transferir Pedido

> **ID:** TST-E2E-PEDIDO-TRANSFERIR-000001
> **Produto:** Pedido
> **Feature:** Transferência de itens entre pedidos
> **Tipo:** E2E (Playwright, scaffold com describe.skip)

---

## Resumo Executivo

Testa os fluxos de transferência end-to-end via interface do usuário:
- Seleção de item + cenário + destinos
- Preview com alertas
- Confirmação com resultado
- Reversão via histórico
- Validações de interface

---

## Fluxos

| # | Fluxo | Cenário | Critério de Aceite |
|---|-------|---------|-------------------|
| 1 | Happy path — split novo pedido | split_novo_pedido | Modal abre, preview mostra impacto, confirmar → sucesso |
| 2 | Split para pedido existente | split_pedido_existente | Seleciona pedido destino, quantidade transferida |
| 3 | Redução simples | reducao_simples | Sem destino, quantidade reduzida |
| 4 | Substituição de part_number | substituicao_pura | Part number trocado no mesmo pedido |
| 5 | Tipo de operação divergente | split_pedido_existente | Banner de aviso, checkbox de confirmação |
| 6 | Quantidade excedida | qualquer cenário | Alerta de quantidade excedida |
| 7 | Número do pedido duplicado | split_novo_pedido | Mensagem de erro 409 |
| 8 | Reverter transferência | reversao | Botão reverter no histórico → quantidade restaurada |
| 9 | Cenário irreversível | reducao_simples | Botão reverter desabilitado/oculto |
| 10 | Histórico de transferências | qualquer | Lista ordenada por data |
| 11 | Validações de interface | - | Campos obrigatórios, botões desabilitados |

---

## Estrutura de Arquivos

```
testes/testes-e2e/pedido/Lista/transferir/
├── transferir-e2e.md                          ← este plano
└── TST-E2E-PEDIDO-TRANSFERIR-001.spec.ts      ← scaffold com describe.skip
```
