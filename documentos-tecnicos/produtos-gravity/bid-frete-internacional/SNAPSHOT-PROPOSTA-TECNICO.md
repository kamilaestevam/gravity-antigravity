# Snapshot na Proposta — BID Frete Internacional

> **Arquivo:** `server/src/lib/snapshot-proposta-bid-frete.ts`  
> **Substitui:** `id-workspace-proposta.ts` (removido em #114)

---

## 1. Por quê

A proposta é criada **depois** da cotação, em contextos assíncronos (portal fornecedor, e-mail público, motor automático). Dois campos devem ser **congelados** no instante da criação:

| Campo | Motivo |
|-------|--------|
| `id_workspace` | Saber em qual filial a resposta foi registrada, mesmo se a cotação mudar depois |
| `id_bid_bid_frete_internacional` | Consultas diretas na proposta e visualização no Railway sem JOIN |

A **fonte da verdade** do vínculo BID permanece na cotação (`id_bid_bid_frete_internacional` FK). O campo na proposta é denormalização controlada.

---

## 2. API da função

```typescript
snapshotPropostaFromCotacao(cotacao: {
  id_workspace?: string | null
  id_bid_bid_frete_internacional?: string | null
}): {
  id_workspace?: string
  id_bid_bid_frete_internacional?: string
}
```

- Strings vazias → omitidas (não grava `""`).
- `null` / `undefined` → campo ausente no objeto retorno.

---

## 3. Onde é chamada

| Arquivo | Fluxo |
|---------|-------|
| `motor-bid-frete-internacional.ts` | Resposta automática via tabela de preços |
| `portal.ts` | Fornecedor autenticado responde disparo |
| `cotacoes-publicas.ts` | Resposta via token público (e-mail) |

Padrão:

```typescript
const cotacaoOrigem = await prisma.cotacaoBidFreteInternacional.findFirst({
  where: { id_cotacao_bid_frete_internacional: '...' },
  select: { id_workspace: true, id_bid_bid_frete_internacional: true },
})

await prisma.propostaBidFreteInternacional.create({
  data: {
    ...(cotacaoOrigem ? snapshotPropostaFromCotacao(cotacaoOrigem) : {}),
    // … demais campos
  },
})
```

---

## 4. Backfill (dados existentes)

Migration `20260530120000`:

```sql
UPDATE proposta_bid_frete_internacional p
SET id_bid_bid_frete_internacional = c.id_bid_bid_frete_internacional
FROM cotacao_bid_frete_internacional c
WHERE p.id_cotacao_bid_frete_internacional = c.id_cotacao_bid_frete_internacional
  AND p.id_bid_bid_frete_internacional IS NULL
  AND c.id_bid_bid_frete_internacional IS NOT NULL;
```

FK: `proposta → bid_frete_internacional` ON DELETE SET NULL.

---

## 5. Frontend

Tipo `PropostaBidFreteInternacional` em `client/src/shared/types.ts`:

Ordem dos campos no type espelha ordem lógica (não afeta banco):

1. `id_proposta_bid_frete_internacional`
2. `id_cotacao_bid_frete_internacional`
3. `id_bid_bid_frete_internacional?`
4. `id_organizacao`
5. `id_workspace?`

---

## 6. Testes pendentes (débito QA)

- [ ] Unitário: `snapshot-proposta-bid-frete.test.ts`
- [ ] Funcional: assert create proposta persiste `id_bid` quando cotação vinculada a BID
