# Workspaces Acessíveis — SSOT (Single Source of Truth)

> **Tema:** Regra de visibilidade de workspaces por tipo de usuário
> **Versão:** 1.0
> **Data:** Maio 2026
> **Refactor:** D11 — eliminação de duplicação entre `/hub/init` e endpoint S2S
> **Status:** ✅ Em produção

---

## Sumário

1. [Por que existe](#por-que-existe)
2. [A regra (uma só, em um lugar só)](#a-regra)
3. [API do service](#api-do-service)
4. [Consumers](#consumers)
5. [Defesa em profundidade](#defesa-em-profundidade)
6. [Como mudar a regra](#como-mudar-a-regra)
7. [Cobertura de testes](#cobertura-de-testes)
8. [Histórico do drift que originou o refactor](#histórico-do-drift)
9. [Anti-padrões a evitar](#anti-padrões)
10. [Referências](#referências)

---

## Por que existe

Múltiplos lugares do sistema precisam responder à pergunta: **"quais workspaces este usuário pode acessar dentro desta organização?"**

Antes da D11, a regra estava replicada em **2 endpoints distintos do Configurador**:

1. `GET /api/v1/hub/init` — alimenta o Hub do frontend (selecionar workspace)
2. `GET /api/v1/internal/usuarios/:id/workspaces-habilitados` — S2S consumido por produtos (validação de filtros multi-workspace)

A duplicação **gerou drift real em produção** (ver histórico abaixo). Diferentes endpoints divergiam silenciosamente, causando bugs de visibilidade ("usuário PADRÃO vê workspaces INATIVO no popover mas backend bloqueia").

**Solução D11**: extrair para um único método de serviço `organizacaoService.workspacesAcessiveis()`. Ambos endpoints consomem o mesmo método. Mudança da regra → 1 lugar só.

---

## A regra

A regra de "workspaces acessíveis" depende **exclusivamente** do `tipo_usuario` (lido do banco — Mand. 01):

| Tipo Usuário | Workspaces acessíveis |
|---|---|
| `SUPER_ADMIN` | Todos os workspaces com `status_workspace = 'ATIVO'` da organização |
| `ADMIN` | Todos os workspaces com `status_workspace = 'ATIVO'` da organização |
| `MASTER` | Todos os workspaces com `status_workspace = 'ATIVO'` da organização |
| `PADRAO` | ATIVO **AND** `UsuarioWorkspace.ativo_usuario_workspace = true` |
| `FORNECEDOR` | ATIVO **AND** `UsuarioWorkspace.ativo_usuario_workspace = true` (cross-organização aceita via flag) |

### Princípios da regra

1. **`status_workspace = 'ATIVO'` é OBRIGATÓRIO para TODOS os tipos.** Workspaces INATIVO só aparecem em telas administrativas (Configurações → Admin Panel), nunca em telas operacionais.

2. **PADRAO/FORNECEDOR exigem AND duplo:**
   - Membership ativo: `UsuarioWorkspace.ativo_usuario_workspace = true`
   - Workspace ativo: `Workspace.status_workspace = 'ATIVO'`

   Quando o Master inativa um workspace (mantendo o membership), o usuário PADRAO/FORNECEDOR **deixa de vê-lo automaticamente**.

3. **FORNECEDOR pode ser cross-organização** (cenário: fornecedor de plataforma atendendo múltiplos clientes). É o único tipo que pode ter `UsuarioWorkspace.id_organizacao ≠ Usuario.id_organizacao`. Habilitado caso a caso via flag `permitirCrossTenantFornecedor` no service.

4. **Não há bypass para PADRAO/FORNECEDOR.** Diferente de Master (Mand. 04), eles dependem 100% do membership.

---

## API do service

### Assinatura

```typescript
import { organizacaoService } from '../services/organizacao-service.js'

const { tipoUsuario, workspaces } = await organizacaoService.workspacesAcessiveis({
  idUsuario: string,                              // ID do usuário consultado
  idOrganizacaoSolicitada: string,                // Org em que se busca workspaces
  permitirCrossTenantFornecedor?: boolean,        // default: false
})
```

### Retorno

```typescript
{
  tipoUsuario: 'SUPER_ADMIN' | 'ADMIN' | 'MASTER' | 'PADRAO' | 'FORNECEDOR',
  workspaces: Array<{
    id_workspace: string
    nome_workspace: string
    subdominio_workspace: string | null
    cnpj_workspace: string | null
    status_workspace: string                       // sempre 'ATIVO' (filtrado)
    data_criacao_workspace: Date
    quantidade_usuarios_workspace: number
    _count: { vinculos_workspace: number }
  }>
}
```

### Erros

| Erro | HTTP | Code |
|---|---|---|
| Usuário inexistente | 404 | `USUARIO_NAO_ENCONTRADO` |
| Usuário não pertence à org (sem flag FORNECEDOR cross-tenant) | 403 | `ORGANIZACAO_MISMATCH` |

### Defesa em profundidade interna

- **`tipo_usuario` é lido do banco**, NUNCA recebido via parâmetro. O caller não pode mentir o tipo para burlar a regra (Mand. 01).
- Cross-org match é validado ANTES da query principal — fail fast.
- Retorno enriquecido com todos os campos do `select` original do `/hub/init` (padrão "fat read, thin projection" — callers projetam o que precisam).

---

## Consumers

### 1. `/api/v1/hub/init` (`hub-init.ts`)

Alimenta o Hub do frontend. Sempre intra-org (id_organizacao vem do JWT).

```typescript
const workspacesPromise = organizacaoService
  .workspacesAcessiveis({
    idUsuario: id_usuario,
    idOrganizacaoSolicitada: id_organizacao,
    // permitirCrossTenantFornecedor: false (default) — Hub é sempre intra-org
  })
  .then((res) => res.workspaces)
```

### 2. `/api/v1/internal/usuarios/:id/workspaces-habilitados` (`workspaces-habilitados-internal.ts`)

Endpoint S2S consumido por produtos. Permite FORNECEDOR cross-tenant.

```typescript
const { tipoUsuario, workspaces } = await organizacaoService.workspacesAcessiveis({
  idUsuario: id_usuario,
  idOrganizacaoSolicitada: id_organizacao,
  permitirCrossTenantFornecedor: true,
})

// Projeção: apenas IDs (contrato S2S preservado)
res.json({
  tipo_usuario: tipoUsuario,
  workspaces_habilitados: workspaces.map((w) => w.id_workspace),
})
```

### Helper SDK público

Para produtos consumirem o S2S:

```typescript
import { obterWorkspacesHabilitadosDoUsuario } from '@gravity/resolver-organizacao'

const { tipoUsuario, workspacesHabilitados } = await obterWorkspacesHabilitadosDoUsuario({
  configuradorBaseUrl: process.env.CONFIGURATOR_URL!,
  chaveInterna:        process.env.CHAVE_INTERNA_SERVICO!,
  idOrganizacao:       ctx.idOrganizacao,
  idUsuario:           ctx.idUsuario,
})
```

---

## Defesa em profundidade

A regra é apenas **uma das camadas** da segurança de visibilidade de workspaces:

```
┌─────────────────────────────────────────────────────────────────┐
│ Camada 1 — UI (frontend)                                        │
│ /hub/init → workspacesAcessiveis() → popover/dropdown só mostra │
│ workspaces que o usuário PODE ver.                              │
│ Defesa contra confusão (usuário não tenta filtrar o impossível) │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Camada 2 — Backend do produto (S2S)                             │
│ obterWorkspacesHabilitadosDoUsuario() → service centralizado.   │
│ Ids fora da lista → 403 com workspaces_bloqueados[].            │
│ Defesa contra forjamento (mesmo se UI for tampered, falha aqui) │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Camada 3 — Portão 3 (header x-id-workspace)                     │
│ verificarAcessoProduto valida acesso ao workspace ATIVO         │
│ (single, do header). NÃO toca query param.                      │
│ Defesa estrutural: produto habilitado no workspace base.        │
└─────────────────────────────────────────────────────────────────┘
```

Camadas 1 e 2 dependem do mesmo service. Camada 3 é ortogonal (middleware Portão 3 inalterado pela D11).

---

## Como mudar a regra

Quando a regra de visibilidade precisar mudar (ex: nova permissão, novo tipo de usuário, novo status de workspace), **edite APENAS o método `workspacesAcessiveis()`** em `organizacao-service.ts`.

Os 2 endpoints consumidores **NÃO precisam ser tocados** se o shape do retorno for preservado.

### Checklist para mudança da regra

- [ ] Editar `workspacesAcessiveis()` em `organizacao-service.ts`
- [ ] Adicionar ou atualizar testes em `organizacao-service-workspaces-acessiveis.test.ts`
- [ ] Verificar que os 6 testes de `workspaces-habilitados-internal.test.ts` continuam passando
- [ ] Verificar que os testes de `hubInit.test.ts` continuam passando (os relacionados a workspaces)
- [ ] Atualizar este documento e a skill `seguranca/permissoes/SKILL.md`

---

## Cobertura de testes

### Testes unitários do service (`organizacao-service-workspaces-acessiveis.test.ts`)

12 testes cobrindo:

1. MASTER → todos workspaces ATIVO da org
2. SUPER_ADMIN → idêntico ao MASTER
3. ADMIN → idêntico ao MASTER
4. PADRAO → ATIVO + UsuarioWorkspace.ativo
5. FORNECEDOR (org match) → idem PADRAO
6. Usuário inexistente → 404
7. PADRAO cross-org → 403
8. FORNECEDOR cross-org SEM flag → 403
9. FORNECEDOR cross-org COM flag → permite
10. Ordenação por `data_criacao_workspace: 'desc'`
11. MASTER cross-org (mesmo com flag) → 403 (flag só vale FORNECEDOR)
12. Retorno enriquecido com `quantidade_usuarios_workspace` + `_count.vinculos_workspace`

### Testes do endpoint S2S (`workspaces-habilitados-internal.test.ts`)

6 testes — preservam contratos públicos do endpoint:

1. MASTER → todos workspaces ATIVO
2. PADRAO → apenas habilitados via memberships.some
3. FORNECEDOR cross-tenant (id_organizacao diferente OK via flag)
4. Usuário inexistente → 404
5. Sem chave interna → 401
6. PADRAO cross-org → 403

### Testes do `/hub/init` (`hubInit.test.ts`)

Mock de `workspacesAcessiveis` configurado. 2 testes específicos do consumer (chama o service com args corretos + cross-tenant via header de auth).

---

## Histórico do drift

Documentado para evitar repetição:

### 2026-05-12 — Bug visibilidade Standard/Fornecedor
**Smoke test do dono** revelou: usuários Standard/Fornecedor viam **TODOS** os workspaces da org no Hub. Causa: `getWorkspaces(org)` sem filtro de membership. Fix aplicado apenas no `/hub/init` (não tinha service centralizado).

### 2026-05-13 — Bug workspaces INATIVO
Outro smoke do dono: todos os tipos de usuário viam workspaces **INATIVO** no Hub. Causa: filtro `status_workspace='ATIVO'` faltando em ambos branches. Fix aplicado novamente apenas em um endpoint.

**Padrão emergente:** correções de regra continuavam sendo feitas em apenas 1 dos 2 endpoints. Inevitavelmente a regra divergia.

### 2026-05-13 — Refactor D11 (este documento)
Consolidação para `workspacesAcessiveis()`. Drift eliminado estruturalmente. Próximas mudanças tocam 1 arquivo.

---

## Anti-padrões a evitar

- ❌ **Reescrever a regra inline em outro endpoint** — sempre chamar o service
- ❌ **Aceitar `tipoUsuario` como parâmetro do service** — sempre ler do banco (Mand. 01)
- ❌ **Bypass de cross-org sem usar a flag** — apenas FORNECEDOR é exceção, sempre via flag explícita
- ❌ **Projeção de retorno modificando o service** — o service retorna shape rico, callers projetam
- ❌ **Esquecer de testar caso PADRAO sem membership** — a regra mais comum de ser violada

---

## Referências

- **Service**: `servicos-global/configurador/server/services/organizacao-service.ts` (método `workspacesAcessiveis`)
- **Consumer 1 (Hub)**: `servicos-global/configurador/server/routes/hub-init.ts`
- **Consumer 2 (S2S)**: `servicos-global/configurador/server/routes/workspaces-habilitados-internal.ts`
- **Helper SDK público**: `packages/resolver-organizacao/src/obter-workspaces-habilitados.ts`
- **Skills**: `skills/seguranca/permissoes/SKILL.md` (regra) + `skills/seguranca/autenticacao-s2s/SKILL.md` (S2S)
- **Filtro multi-workspace no Pedido (primeiro consumer)**: `documentos-tecnicos/produtos-gravity/pedido/FILTRO-MULTI-WORKSPACE-TECNICO.md`
