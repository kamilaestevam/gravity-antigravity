# Plano de Teste Unitário — Transferir Pedido

> **ID:** TST-UNI-PEDIDO-TRANSFERIR-000001
> **Produto:** Pedido
> **Feature:** Transferência de itens entre pedidos
> **Tipo:** Unitário (Vitest, sem I/O)

---

## Resumo Executivo

Testa schemas Zod (PreviewSchema, ConfirmarSchema, DestinoSchema, CenarioSchema) e funções puras exportadas.

---

## Casos de Teste — Zod Schemas (U-TZD-xx)

### PreviewSchema

| ID | Caso | Input | Resultado |
|----|------|-------|-----------|
| U-TZD-01 | Payload válido completo | cenario + pedido_id + item_id + quantidade_origem + destinos | success=true |
| U-TZD-02 | Sem cenario | omitir cenario | success=false |
| U-TZD-03 | Cenário inválido | cenario: 'invalido' | success=false |
| U-TZD-04 | pedido_id vazio | pedido_id: '' | success=false |
| U-TZD-05 | item_id vazio | item_id: '' | success=false |
| U-TZD-06 | quantidade_origem zero | quantidade_origem: 0 | success=false |
| U-TZD-07 | quantidade_origem negativa | quantidade_origem: -10 | success=false |
| U-TZD-08 | Destinos default vazio | omitir destinos | success=true, destinos=[] |

### ConfirmarSchema

| ID | Caso | Input | Resultado |
|----|------|-------|-----------|
| U-TZD-10 | Extends PreviewSchema com campos extras | + numero_pedido_novo + confirmar_tipos_divergentes | success=true |
| U-TZD-11 | numero_pedido_novo vazio | numero_pedido_novo: '' | success=false |
| U-TZD-12 | confirmar_tipos_divergentes boolean | confirmar_tipos_divergentes: true | success=true |

### DestinoSchema

| ID | Caso | Input | Resultado |
|----|------|-------|-----------|
| U-TZD-20 | Destino tipo=novo válido | tipo: 'novo', quantidade: 30 | success=true |
| U-TZD-21 | Destino tipo=existente com pedido_id | tipo: 'existente', pedido_id: 'ped-002', quantidade: 20 | success=true |
| U-TZD-22 | Destino tipo inválido | tipo: 'outro' | success=false |
| U-TZD-23 | Destino quantidade zero | quantidade: 0 | success=false |
| U-TZD-24 | Destino quantidade negativa | quantidade: -5 | success=false |

### CenarioSchema

| ID | Caso | Input | Resultado |
|----|------|-------|-----------|
| U-TZD-30 | Cada cenário válido (11 valores) | cada string do enum | success=true |
| U-TZD-31 | Cenário inválido | 'nao_existe' | success=false |

---

## Estrutura de Arquivos

```
testes/testes-unitarios/pedido/lista/transferir/
├── transferir-unitario.md          ← este plano
└── transferir-schemas.test.ts      ← U-TZD-01 a U-TZD-31
```
