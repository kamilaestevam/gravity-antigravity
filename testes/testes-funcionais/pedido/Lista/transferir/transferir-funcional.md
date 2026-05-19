# Plano de Teste Funcional — Transferir Pedido

> **ID:** TST-FUN-PEDIDO-TRANSFERIR-000001
> **Produto:** Pedido
> **Feature:** Transferência de itens entre pedidos
> **Tipo:** Funcional (Supertest + Zod real + Prisma mockado)

---

## Resumo Executivo

Testa os 4 endpoints do módulo de transferências:

1. `POST /preview` — pré-visualização sem alterar banco
2. `POST /confirmar` — execução da transferência
3. `POST /:id_transferencia_pedido/reverter` — reversão de transferência anterior
4. `GET /` — histórico de transferências do pedido

---

## Endpoints Cobertos

| Endpoint | Método | Router |
|----------|--------|--------|
| `/api/v1/pedidos/:id_pedido/transferencias/preview` | POST | transferirRouter |
| `/api/v1/pedidos/:id_pedido/transferencias/confirmar` | POST | transferirRouter |
| `/api/v1/pedidos/:id_pedido/transferencias/:id/reverter` | POST | transferirRouter |
| `/api/v1/pedidos/:id_pedido/transferencias` | GET | transferirHistoricoRouter |

---

## Setup do App

```
express()
  ├─ express.json()
  ├─ middleware fake → req.organizacao = { idOrganizacao, idUsuario }
  ├─ app.use('/api/v1/pedidos/:id_pedido/transferencias', transferirRouter)
  └─ app.use('/api/v1/pedidos/:id_pedido/transferencias', transferirHistoricoRouter)
```

---

## Mocks Necessários

| Módulo | Mock |
|--------|------|
| `@gravity/resolver-organizacao` | `withOrganizacao` → cb(mockPrisma) |
| `historico-global/audit-client` | `auditLog` → vi.fn() |
| `processos-core/recalcularAgregadosPedido` | `recalcularAgregadosPedido` → vi.fn().mockResolvedValue({}) |
| `TransferirService` | **NÃO mockado** — instanciado real via import do router |

---

## Casos de Teste — Preview (F-TPV-xx)

| ID | Caso | Request | Resultado Esperado |
|----|------|---------|-------------------|
| F-TPV-01 | Preview com cenário split_novo_pedido | `{ cenario, pedido_id, item_id, quantidade_origem, destinos }` | 200, origem.quantidade_apos calculado |
| F-TPV-02 | Preview detecta quantidade excedida | quantidade_origem > saldo | 200, alertas_globais contém aviso |
| F-TPV-03 | Preview com destino existente resolve numero | destino tipo=existente | 200, destino.pedido_numero preenchido |
| F-TPV-04 | Preview com destino existente inexistente | destino.pedido_id inválido | 200, destino.alertas contém aviso |
| F-TPV-05 | Preview com quantidade que zera pedido | quantidade_origem = saldo | 200, origem.encerra=true |
| F-TPV-06 | Preview detecta tipo_operacao divergente | origem imp + destino exp | 200, aviso_tipo_operacao=true |
| F-TPV-10 | Body vazio retorna 400 | `{}` | 400, VALIDATION_ERROR |
| F-TPV-11 | Cenário inválido retorna 400 | cenario: 'nao_existe' | 400 |
| F-TPV-12 | pedido_id vazio retorna 400 | pedido_id: '' | 400 |
| F-TPV-13 | item_id vazio retorna 400 | item_id: '' | 400 |
| F-TPV-14 | quantidade_origem negativa | quantidade_origem: -5 | 400 |
| F-TPV-15 | quantidade_origem zero | quantidade_origem: 0 | 400 |
| F-TPV-20 | Pedido não encontrado | pedido_id inexistente | 404, NOT_FOUND |
| F-TPV-21 | Item não encontrado no pedido | item_id inexistente | 404, NOT_FOUND |
| F-TPV-30 | Erro interno do banco | findFirst rejeita | 500, INTERNAL_ERROR |

---

## Casos de Teste — Confirmar (F-TCF-xx)

| ID | Caso | Request | Resultado Esperado |
|----|------|---------|-------------------|
| F-TCF-01 | Confirmar split_novo_pedido → 201 | payload válido | 201, pedidos_criados.length=1 |
| F-TCF-02 | Confirmar split_pedido_existente | destino tipo=existente | 201, pedidos_destino_ids preenchido |
| F-TCF-03 | Confirmar reducao_simples | sem destinos | 201, quantidade reduzida |
| F-TCF-04 | Confirmar substituicao_pura | destino tipo=mesmo | 200/201, part_number atualizado |
| F-TCF-05 | Confirmar com encerramento automático | todas qtys ficam zero | 201, pedidos_encerrados preenchido |
| F-TCF-06 | Numero duplicado → 409 | numero_pedido_novo já existe | 409, NUMERO_PEDIDO_DUPLICADO |
| F-TCF-07 | Tipo divergente sem flag → 422 | tipos mistos sem confirmar_tipos_divergentes | 422, TIPO_OPERACAO_DIVERGENTE |
| F-TCF-08 | Tipo divergente com flag=true → 201 | confirmar_tipos_divergentes: true | 201 |
| F-TCF-09 | Quantidade excede disponível → 422 | quantidade_origem > saldo | 422, INSUFFICIENT_QTY |
| F-TCF-10 | Body vazio → 400 | `{}` | 400, VALIDATION_ERROR |
| F-TCF-11 | Pedido origem não encontrado → 404 | pedido_id inexistente | 404 |
| F-TCF-30 | Erro interno → 500 | findFirst rejeita | 500 |

---

## Casos de Teste — Reverter (F-TRV-xx)

| ID | Caso | Request | Resultado Esperado |
|----|------|---------|-------------------|
| F-TRV-01 | Reverter transferência válida → 200 | id_transferencia_pedido válido | 200, quantidade restaurada |
| F-TRV-02 | Reverter já revertida → 409 | revertido=true | 409, CONFLICT |
| F-TRV-03 | Reverter cenário irreversível → 422 | reducao_simples | 422, NOT_REVERSIBLE |
| F-TRV-04 | Reverter cenário irreversível (intercompany) → 422 | transfer_intercompany | 422, NOT_REVERSIBLE |
| F-TRV-05 | Transferência não encontrada → 404 | id inexistente | 404, NOT_FOUND |
| F-TRV-06 | id_transferencia_pedido vazio → 400 | param vazio | 400 |
| F-TRV-30 | Erro interno → 500 | findFirst rejeita | 500 |

---

## Casos de Teste — Histórico (F-THI-xx)

| ID | Caso | Request | Resultado Esperado |
|----|------|---------|-------------------|
| F-THI-01 | Histórico retorna lista ordenada | GET /:id_pedido/transferencias | 200, array ordenado desc |
| F-THI-02 | Histórico vazio retorna array vazio | pedido sem transferências | 200, [] |
| F-THI-30 | Erro interno → 500 | findMany rejeita | 500 |

---

## Casos de Teste — Isolamento de Organização (F-TISO-xx)

| ID | Caso | Resultado Esperado |
|----|------|--------------------|
| F-TISO-01 | Preview WHERE inclui id_organizacao | findFirst recebe id_organizacao correto |
| F-TISO-02 | Confirmar WHERE inclui id_organizacao | findFirst recebe id_organizacao correto |
| F-TISO-03 | Reverter WHERE inclui id_organizacao | findFirst recebe id_organizacao correto |
| F-TISO-04 | Histórico WHERE inclui id_organizacao | findMany recebe id_organizacao correto |
| F-TISO-05 | Preview de pedido da org-A com token org-B → 404 | 404, NOT_FOUND |
| F-TISO-06 | Confirmar de pedido da org-A com token org-B → 404 | 404, NOT_FOUND |

---

## Estrutura de Arquivos

```
testes/testes-funcionais/pedido/Lista/transferir/
├── transferir-funcional.md         ← este plano
├── preview.test.ts                 ← F-TPV-01 a F-TPV-30
├── confirmar.test.ts               ← F-TCF-01 a F-TCF-30
├── reverter.test.ts                ← F-TRV-01 a F-TRV-30
├── historico.test.ts               ← F-THI-01 a F-THI-30
└── isolamento-organizacao.test.ts  ← F-TISO-01 a F-TISO-06
```
