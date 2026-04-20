# Bug: Badge "USUÁRIO" no Header — 2026-04-20

## Resumo Executivo

Badge inválido `USUÁRIO` aparece no header do Hub quando um usuário tem problemas de acesso. Dois bugs independentes foram identificados e documentados com testes. Nenhum código de produção foi alterado nesta sessão — os testes existem para forçar a correção.

---

## BUG 01 — `resolveRole` com passthrough de strings desconhecidas

**Classificação:** HIGH  
**Status:** BUG DETECTION — testes criados, correção pendente

**Causa raiz:** `servicos-global/shell/hooks/useMeSync.ts`

```typescript
// Linha atual (BUGADA):
return ROLE_LABELS[raw] ?? (raw || 'Standard')

// Correção (1 linha):
return ROLE_LABELS[raw] ?? 'Standard'
```

O operador `?? (raw || 'Standard')` faz passthrough da string original quando ela não está no `ROLE_LABELS`. Assim, se o banco retornar `role: 'USUÁRIO'` (valor legado), o hook coloca `'USUÁRIO'` diretamente no `store.currentUser.role`, e o header exibe `USUÁRIO` como badge.

**Strings afetadas:** qualquer valor fora de `{ gravity_admin, SUPER_ADMIN, ADMIN, MASTER, STANDARD, SUPPLIER }` — incluindo `USUÁRIO`, `usuario`, `user`, `USER`, `Admin`, `standard`, `Unknown`, etc.

**Impacto:** o badge do header reflete o valor bruto do banco em vez de um rótulo da allowlist.

**Testes que detectam o bug (falham com implementação atual):**
- `MSYNC-008` — `resolveRole('USUÁRIO')` retorna `'USUÁRIO'` em vez de `'Standard'`
- `MSYNC-009` — `resolveRole('usuario')` retorna `'usuario'`
- `MSYNC-010` — `resolveRole('ROLE_QUALQUER_OUTRA')` retorna passthrough
- `MSYNC-011` — todas as roles legadas/inválidas falham a assertion `toBe('Standard')`
- `MSYNC-012` — `resolveRole` retorna valor fora da allowlist
- `MSYNC-017` — `useMeSync` com `tipo_usuario: 'USUÁRIO'` → `store.role = 'USUÁRIO'`

**Spec:** `testes/testes-unitarios/configurador/useMeSync-role-badge.test.ts`  
**Plano:** `testes/testes-unitarios/configurador/_planos/useMeSync-role-badge.plan.json` (TST-UNIT-CONFIG-MSYNC-001)

---

## BUG 02 — `SelecionarWorkspace.tsx` fallback ambíguo para erro de acesso

**Classificação:** MEDIUM  
**Status:** Documentado — correção futura

**Causa raiz:** `servicos-global/configurador/src/pages/SelecionarWorkspace.tsx`

```typescript
// Linha ~282 (AMBÍGUA):
const userRole = dbRole
  ? (ROLE_LABELS[dbRole] ?? dbRole)      // OK para roles válidas
  : (roleReady ? 'Usuário' : '…')        // BUG: exibe 'Usuário' tanto para STANDARD sem workspace
                                          //      quanto para erro de acesso (dbRole=null, isReady=true)
```

Quando o usuário tem erro de acesso, `dbRole = null` e `isReady = true`. O resultado `'Usuário'` é indistinguível do que um usuário `STANDARD` válido veria. A correção requer distinguir `dbRole === null por erro` de `dbRole === null por role legítima`.

**Impacto:** usuário com problema de acesso vê badge `Usuário` em vez de mensagem de erro.

---

## Cobertura de Testes Criada

| Tipo | Spec | Plano | Status |
|------|------|-------|--------|
| Unitário | `useMeSync-role-badge.test.ts` | TST-UNIT-CONFIG-MSYNC-001 | 16 casos — 6 FALHAM (bug detection) |
| Funcional | `me-role-contract.test.ts` | TST-FUN-CONFIG-ME-001 | 14 casos — todos PASSAM |
| E2E | (bloqueado) | TST-E2E-HUB-000001 | BLOQUEADO — ver abaixo |

### Bloqueadores E2E

**BLQ-001:** falta `data-testid="user-role-badge"` em `nucleo-global/Layout/usuario-global/src/UsuarioGlobal.tsx`  
**BLQ-002:** falta atributo `data-access-status` no badge (necessário para distinguir erro de acesso de role válida)

Esses atributos devem ser adicionados ao componente antes de criar a spec E2E.

---

## Como Corrigir o Bug 01

1. Abrir `servicos-global/shell/hooks/useMeSync.ts`
2. Localizar a função `resolveRole`
3. Alterar a linha de retorno:
   ```typescript
   // DE:
   return ROLE_LABELS[raw] ?? (raw || 'Standard')
   // PARA:
   return ROLE_LABELS[raw] ?? 'Standard'
   ```
4. Rodar `npx vitest run --config testes/testes-unitarios/configurador/vitest.config.ts` — os 6 testes BUG DETECTION devem virar verde
