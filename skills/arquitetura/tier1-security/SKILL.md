---
name: Gravity Tier 1 Security & RLS
description: Regras Invioláveis de Arquitetura de Banco de Dados B2B e Prevenção de Transbordamento de Dados Multitenant. LEIA ANTES DE ESCREVER CÓDIGO DB.
---

# 🛡️ Padrão Ouro de Segurança: Gravity Platform (Tier 1)

Você está trabalhando num ecossistema B2B Multitenant da Gravity. Vazamentos de dados cruzados entre Tenants (ex: Empresa A vendo a Fatura ou DUIMP da Empresa B) representam um Incidente de Severidade Crítica (Tier 1 Incident).
**Siga as diretrizes abaixo religiosamente sob risco de corromper a plataforma.**

## 1. Isolamento de Memória Prisma (PostgreSQL + PgBouncer)
A Gravity utiliza PostgreSQL e, frequentemente, *Connection Poolers* como PgBouncer operando em modo transacional (`transaction mode`).
O RLS do Postgres exige injeção da variável `app.current_tenant_id`. Se você não instruir o banco a destruir a variável, ela "vaza" para o próximo cliente (Transbordamento de Sessão).

- **O que você JAMAIS fará:**
  ```typescript
  // A conexão devolvida pro pool da AWS continuará suja com esse ID!
  await prisma.$executeRaw`SET LOCAL app.current_tenant_id = ${id}`;
  ```

- **O que você DEVE fazer (O Wrapper):**
  Toda tabela multi-tenant deve ser consultada usando o `withTenantContext`.
  ```typescript
  import { withTenantContext } from '@/lib/prisma-tenant';
  
  // O Wrapper abre `$transaction` e lança `SELECT set_config('app.current_tenant_id', $1, true)`
  const arquivos = await withTenantContext({ tenantId, companyId }, (tx) => {
    return tx.faturas.findMany(); // O Vizinho foi varrido invisivelmente pelo Banco.
  });
  ```
  O argumento `true` garante que a sessão morra no COMMIT/ROLLBACK. O banco fará a higienização para o PgBouncer no milissegundo final da request.

## 2. A Proteção `NULL-Safe` nas Policies Postgres (RLS)
Sempre que for criar ou migrar uma nova lógica de banco no `scripts/apply-rls.sql`, escreva proteções contra o famigerado `NULL = NULL`.
Uma falha na injeção da API não deve desbloquear o RLS, ela deve travá-lo.

- **Vulnerável:** `USING (tenant_id = current_setting('app.current_tenant_id'))`
- **Blindado:** 
  ```sql
  CREATE POLICY "acesso_seguro" ON "minha_tabela"
    AS RESTRICTIVE
    USING (
      tenant_id = current_setting('app.current_tenant_id', true) 
      AND current_setting('app.current_tenant_id', true) IS NOT NULL
    );
  ```

## 3. Comportamento da API (Anti-Enumeração / 404-Masking)
A Gravity utiliza IDs Sequenciais (ex: `esti_id_00001/26`), o que permite ataques lógicos de força-bruta em rotas como `GET /api/duimp/:id`.
Se a API disparar um erro `HTTP 403 Forbidden` devido ao bloqueio RLS, o atacante confirmará a existência daquele documento.
- **Portanto:** A interceptação de erro do RLS, ou recursos não encontrados pela query Prisma, devem *invariavelmente* retornar falhas silenciosas `HTTP 404 Not Found`.

## 4. O Gatekeeper (Vitest)
Você não implementa lógica estrutural sem rodar a verificação anti-colisão alfa e beta.
A suite residente em `testes/security/rls-isolation.test.ts` ativará o banco fantasma do Github Actions. Se o Alpha ler os dados do Beta (`expect(resultado).not.toBeNull()`), a pipeline bloqueia tudo e seu código quebrou os pilares da Gravity.

## 5. Background Jobs (ETL e Relatórios Noturnos)
Ações de Cronjob para BIs (Business Intelligence) rodando em background operam sob identidades locais rigorosas.
- **Sob nenhuma hipótese** utilize Roles com tag de superusuário `BYPASSRLS` em Workers que lidam com agregações diárias ou e-mails de notificação, pois falhas nesse código causariam envio de e-mails em massa contendo resumos do Tenant A para o CFO do Tenant B.

## 6. O Ecossistema Externo (Cache Redis & Object Storage S3)
A proteção se aplica fora do banco isolando blobs pesados.
- **Key-Value Cache (Redis):** Estruture os acessos unicamente seguindo *nested namespaces*, como em `t:{tenant_id}:c:{company_id}:produtos`.
- **Pre-Signed URLs (AWS S3/R2):** PDFs de Fatura Comercial são estritamente privados (S3 Public ACL = off). 
  1. A API antes de assinar confirma se a *Storage Key* possui match com o proprietário logado.
  2. Nenhuma URL pode nascer com TTL (Tempo de vida útil) superior a **300 Segundos**. 

*Você leu, compreendeu e internalizou. Agora, escreva código blindado.*
