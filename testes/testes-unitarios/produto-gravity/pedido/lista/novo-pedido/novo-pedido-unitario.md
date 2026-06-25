# Plano de Teste Unitário — Novo Pedido Manual

> **ID:** TST-UNI-PEDIDO-NOVO-000001
> **Produto:** Pedido
> **Feature:** Contrato Cadastros ao criar pedido (snapshot de fornecedor)
> **Tipo:** Unitário (Vitest + fetch mockado)

---

## Regressão 2026-05-26

`buscarEmpresaPorSuid` em `cadastrosClient.ts` deve validar resposta de
`GET /api/v1/fornecedores/:suid` com **`fornecedorSchema`**, não `empresaSchema`.

Erro em produção: Zod falhava em campos como `pode_ser_importador_fornecedor` porque
o parse esperava shape de Empresa.

---

## Casos de Teste (U-NPM-xx)

| ID | Caso | Resposta mock | Resultado |
|----|------|---------------|-----------|
| U-NPM-01 | Payload fornecedor válido | shape fornecedor | parse OK, retorna Fornecedor |
| U-NPM-02 | Payload shape empresa (legado) | campos `_empresa` sem flags fornecedor | ZodError / rejeição |
| U-NPM-03 | 404 Cadastros | status 404 | AppError 400 |

---

## Arquivo de implementação

`cadastros-fornecedor-contrato.test.ts`
