# Gestao de Administradores — Gravity Platform

> Ultima atualizacao: 2026-03-31
> Audiencia: Super Admin (dmmltda@gmail.com)

---

## Quem Pode Gerenciar Admins

| Acao | Quem pode fazer |
|------|----------------|
| Criar super_admin | Ninguem via UI — apenas via seed do banco |
| Promover usuario para admin (gravity_admin) | Somente o super_admin via Clerk Dashboard |
| Revogar acesso admin | Somente o super_admin via Clerk Dashboard |
| Ver lista de admins | Super Admin e Admin via painel /admin/usuarios |

**Regra absoluta:** nao existe endpoint publico ou formulario que permita atribuir o role `gravity_admin` a qualquer usuario. O unico caminho e o Clerk Dashboard com credenciais de super_admin.

---

## Como Promover um Usuario a Admin

### Pre-requisito

- O usuario ja deve ter uma conta criada na plataforma (ter feito login ao menos uma vez)
- Voce precisa estar logado no Clerk Dashboard com as credenciais `dmmltda@gmail.com`

### Passo a Passo

**1. Acessar o Clerk Dashboard**
```
https://dashboard.clerk.com
→ Fazer login com dmmltda@gmail.com
→ Selecionar o ambiente correto (production ou development)
```

**2. Localizar o usuario**
```
Menu lateral: Users
→ Buscar por email ou nome
→ Clicar no usuario
```

**3. Editar publicMetadata**
```
Na pagina do usuario:
→ Role no campo "Public metadata"
→ Clicar em "Edit"
→ Inserir o JSON:
```

```json
{
  "role": "gravity_admin"
}
```

**4. Salvar e confirmar**
```
→ Clicar em "Save"
→ O usuario tera acesso ao Admin Panel imediatamente (na proxima requisicao)
→ Nao e necessario fazer logout/login — o Clerk propaga na proxima chamada
```

**5. Registrar o acesso**

Apos promover qualquer usuario, registre na tabela abaixo deste documento:

```
Data: YYYY-MM-DD
Email: usuario@exemplo.com
Promovido por: dmmltda@gmail.com
Motivo: [descrever]
Permissoes de edicao concedidas: [listar ou "nenhuma — somente leitura"]
```

---

## Como Revogar Acesso Admin

**1. Acessar o Clerk Dashboard** (mesmo caminho acima)

**2. Localizar o usuario**

**3. Editar publicMetadata**

```json
{
  "role": "MASTER"
}
```

> Se o usuario e um cliente da plataforma, definir `"role": "MASTER"`.  
> Se nao e cliente, remover a chave `role` completamente (`{}`).

**4. Salvar**

O acesso e revogado imediatamente na proxima requisicao do usuario. Sessoes ativas serao bloqueadas pelo `requireGravityAdmin` no backend (que chama o Clerk em tempo real).

---

## Diferenca entre super_admin e admin no codigo

Tecnicamente, ambos usam `gravity_admin` como valor no Clerk. A distincao entre os dois e gerenciada pela tabela `GravityAdminPermission` no banco:

```prisma
model GravityAdminPermission {
  admin_id    String   // clerk_id do Admin Gravity
  resource    String   // ex: 'tenants', 'billing', 'deploy'
  action      String   // 'READ' | 'WRITE' | 'DELETE' | 'MANAGE'
  granted_by  String   // clerk_id do Super Admin que concedeu
}
```

- **Super Admin** (`dmmltda@gmail.com`): tem acesso de escrita em tudo — nao precisa de registros na tabela
- **Admin regular**: precisa de registros explicitos para cada acao de escrita que for autorizada

A verificacao no codigo:

```typescript
// Admin pode ver tudo (READ sempre permitido)
if (context.action === 'READ') return { allowed: true }

// Para WRITE/DELETE/MANAGE: precisa de permissao explicita
const has = await checkGravityAdminPermission(userId, resource, action)
return { allowed: has }
```

---

## Admins Ativos (Registro Manual)

| Email | Role efetivo | Desde | Permissoes de edicao | Observacoes |
|-------|-------------|-------|---------------------|-------------|
| dmmltda@gmail.com | super_admin | fundacao | Irrestrito | Unico super_admin |

> Atualizar esta tabela sempre que um novo admin for adicionado ou removido.

---

## Alertas de Seguranca

**Nunca compartilhar:**
- A `CLERK_SECRET_KEY` do ambiente de producao
- Credenciais de login do `dmmltda@gmail.com`
- Acesso ao Railway com permissao de edicao de variaveis de ambiente

**Se suspeitar de comprometimento:**
1. Revogar imediatamente o `gravity_admin` de todos os usuarios suspeitos via Clerk Dashboard
2. Rotacionar a `CLERK_SECRET_KEY` no Railway
3. Verificar o log de eventos de seguranca em `/admin/seguranca`
4. Consultar o runbook em `documentos-tecnicos/seguranca/`
