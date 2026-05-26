# Transferir Pedidos — Regras de Negócio

> **Produto:** Pedido (COMEX)
> **Versão:** 1.0
> **Data:** Abril 2026
> **Status:** Definido — aguardando implementação

---

## O que é "Transferir"

Transferir é a operação de **realocar quantidade de itens** de um pedido para outro destino. Cobre desde reduções simples até splits complexos com substituição de produto, múltiplos destinos, datas diferentes e transferências entre empresas.

O sistema foi desenhado para cobrir **todos os cenários de um só vez via configuração**, eliminando a necessidade de customização por cliente.

---

## Cenários

| # | Cenário | Descrição + Exemplo | Part# muda? | Qty origem | Pedido destino | Qty destino | Cria novo pedido? | Origem encerra? | Destino logístico muda? | Data muda? | Reversível? |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Redução simples** | Quantidade entregue é menor e a diferença é cancelada. _Ex: PO-001 tinha 1.000 computadores, entregará 800 — os 200 são cancelados._ | Não | Reduz 200 | Nenhum | — | Não | Só se qty=0 + config | Não | Não | Não |
| 2 | **Split → novo pedido** | Diferença sai do pedido original e vira um novo pedido. _Ex: PO-001 tinha 1.000, entregará 800 — os 200 viram PO-002 (novo)._ | Não | Reduz 200 | Novo criado | +200 | Sim | Só se qty=0 + config | Não | Não | Sim |
| 3 | **Split → pedido existente** | Diferença vai para um pedido que já existe. _Ex: PO-001 tinha 1.000, entregará 800 — os 200 vão para PO-005 que já existia._ | Não | Reduz 200 | Existente | +200 | Não | Só se qty=0 + config | Não | Não | Sim |
| 4 | **Multi-split** | Diferença é dividida entre múltiplos destinos (existentes ou novos). _Ex: PO-001 tinha 1.000 — 600 ficam, 300 vão para PO-005, 100 viram PO-006 (novo)._ | Não | Reduz 400 | Múltiplos | Cada um recebe sua parte | Opcional | Só se qty=0 + config | Não | Não | Sim |
| 5a | **Substituição pura** | Mesma quantidade, troca só o produto. _Ex: PO-001 tinha 100 notebooks — vira 100 computadores (mesmo pedido, mesmo qty, outro part#)._ | Sim | Não muda | Mesmo pedido | Não muda | Não | Não | Não | Não | Sim |
| 5b | **Split + substituição** | Parte da quantidade vira outro produto. _Ex: PO-001 tinha 100 notebooks — 80 viram computadores + 20 continuam notebook ou são cancelados._ | Sim (parcial) | Reduz 20 | Existente ou novo | +20 com novo part# | Opcional | Só se qty=0 + config | Não | Não | Sim |
| 6 | **Split por data** | Quantidade dividida em entregas em datas diferentes. _Ex: PO-001 tinha 1.000 para abril — 500 ficam em abril, 500 viram novo pedido para maio._ | Não | Reduz 500 | Novo com nova data | +500 | Sim | Não | Não | Sim | Sim |
| 7 | **Split por destino logístico** | Quantidade dividida por porto/consignatário de destino. _Ex: PO-001 tinha 1.000 para Santos — 800 ficam em Santos, 200 vão para Itajaí (pedido existente ou novo)._ | Não | Reduz 200 | Existente ou novo | +200 | Opcional | Não | Sim | Não | Sim |
| 8 | **Transfer intercompany** | Quantidade transferida para pedido de outra empresa do mesmo tenant. _Ex: Filial SP tinha 1.000 — repassa 300 para Filial RJ que tem pedido próprio._ | Não | Reduz 300 | Pedido outra empresa | +300 | Não | Só se qty=0 + config | Não | Não | Não |
| 9 | **Reversão** | Desfaz uma transferência anterior, devolvendo a quantidade à origem. _Ex: PO-002 recebeu 200 via split de PO-001 — reversão devolve os 200 para PO-001._ | Não | +restaura qty | Pedido origem original | -qty devolvida | Não | Não | Não | Não | — |
| 10 | **Agrupamento inverso** | Vários pedidos cedem quantidade para um único pedido destino. _Ex: PO-001 cede 100, PO-002 cede 150, PO-003 cede 50 — todos vão para PO-010 que recebe 300._ | Não | Reduz (N origens) | 1 destino | +soma das origens | Opcional | Só se qty=0 + config | Não | Não | Sim |

---

## Regras Transversais

| Regra | Descrição | Default |
|---|---|---|
| **Permissão** | Cada tipo de cenário tem permissão configurável separadamente | Desabilitado por tipo |
| **Qty mínima** | Quantidade transferida deve ser > 0 | Sempre ativo |
| **Auditoria** | Todo cenário grava histórico com origem, destino, qty e usuário | Sempre ativo |
| **Status automático** | Recalcula status do pedido origem e destino após qualquer operação | Sempre ativo |
| **Encerrar pedido quando qty = 0** | Pedido origem muda status para "consolidado" quando qty total = 0 | Configuração — **desabilitado** |
| **Excluir item quando qty = 0** | Remove o `PedidoItem` do pedido quando sua quantidade chega a zero | Configuração — **desabilitado** |
| **Excluir pedido quando todos itens = 0** | Remove o `Pedido` quando todos os seus itens chegam a zero | Configuração — **desabilitado** |

---

## Operações Primitivas

Todos os 10 cenários são combinações de 3 operações primitivas:

| Operação | O que faz |
|---|---|
| **Reduzir** | Diminui quantidade de um item no pedido origem |
| **Alocar** | Coloca quantidade em um destino (novo pedido, existente, mesmo pedido) |
| **Transformar** | Muda atributo do item (part_number, data, destino logístico, empresa) |

---

## Consolidar Pedidos

Consolidar é a operação de **juntar dois ou mais pedidos em um só** (diferente de Transferir, que opera em quantidades).

### Regras

| # | Regra | Default |
|---|---|---|
| 1 | Qualquer pedido pode ser consolidado (usuário precisa ter permissão) | — |
| 2 | Pedidos originais são removidos após consolidação — fica apenas histórico (audit trail) | Sempre |
| 3 | Campos divergentes (ex: datas diferentes): usuário escolhe qual valor prevalece | Configuração — **desabilitado** |
| 4 | Aviso de divergência de campos | Configuração — **ativado** |
| 5 | Itens com mesmo `part_number`: usuário decide se soma ou mantém separado | Configuração — **desabilitado** |
| 6 | Número do novo pedido consolidado: usuário digita ou segue regra de numeração configurada | — |
| 7 | Pedido consolidado guarda `pedidos_origem[]` para rastreabilidade | Sempre |
| 8 | Exportação Excel: modo simplificado (1 linha) e detalhado (1 linha por origem) | Configuração |

### UX do Modal de Consolidação

```
┌─────────────────────────────────────────────────┐
│  Consolidar Pedidos (3 selecionados)            │
├─────────────────────────────────────────────────┤
│  Número do pedido:  [PO-CONS-2026/001     ]     │
│                                                 │
│  Campo          Valor consolidado   Origens     │
│  ──────────     ─────────────────   ──────────  │
│  Embarque       [10/04/2026 ▼]      3 datas ⚠   │
│  Incoterm       [FOB        ▼]      2 valores ⚠ │
│  Fornecedor     Empresa A           ✓ igual      │
│  Moeda          USD                 ✓ igual      │
│  Valor total    R$ 3.500,00         soma         │
│                                                 │
│  Itens                                          │
│  ✓ Fundir itens com mesmo part_number           │
│                                                 │
│  ⚠ 2 divergências encontradas                  │
│                                                 │
│        [Cancelar]        [Consolidar]           │
└─────────────────────────────────────────────────┘
```

- Campos iguais: exibem valor sem indicador
- Campos divergentes: exibem valor escolhido + badge "N origens ⚠" + tooltip com todos os valores por pedido
- Datas divergentes: exibem como intervalo `10/04–20/04` + tooltip com detalhe
- Mínimo de 2 pedidos selecionados para habilitar o botão

---

## API — encoding de `id_pedido` (hotfix 2026-05)

IDs de pedido podem conter `/` (ex.: `BR/PO-2026/001`). Todas as chamadas REST de transferência devem usar `encodeURIComponent` no segmento de path:

- `GET .../pedidos/{id}/transferir/preview`
- `POST .../pedidos/{id}/transferir/confirmar`
- `GET .../pedidos/{id}/transferir/historico`
- `POST .../pedidos/{id}/transferir/reverter`

Sem encoding, o Express interpreta barras como novos segmentos → **404**. Ver `pedidoTransferirApi.pid()` em `client/src/shared/api.ts` e testes `pid-url-encoding.test.ts`.
