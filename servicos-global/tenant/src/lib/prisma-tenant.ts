import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface TenantContext {
  tenantId: string;
  companyId?: string;
  userId?: string;
}

/**
 * Função envelopadora (Wrapper) obrigatória para acessar dados privados no banco do Tenant.
 * Adota a postura Zero-Trust garantindo Isolamento de Memória Transacional.
 * Evita vazamento cruzado no Connection Pooling (PgBouncer).
 */
export async function withTenantContext<T>(
  context: TenantContext,
  operation: (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => Promise<T>
): Promise<T> {
  // Envelopa TUDO em uma transação do banco (Commit/Rollback limit)
  return prisma.$transaction(async (tx) => {
    
    // 1. Injeção de Segurança RLS Seguro:
    // O Parâmetro `true` força o Postgres a destruir a variável `app.current_tenant_id`
    // no exato milissegundo em que a instrução return(operation) finalizar.
    // Isso imuniza a API contra conexões "sujas" que caem no pooler da Vercel/Railway.
    await tx.$executeRawUnsafe(
      `SELECT set_config('app.current_tenant_id', $1, true)`,
      context.tenantId
    );

    // 2. Isolamento Específico de Workspace (Company Bleed Prevention)
    if (context.companyId) {
      await tx.$executeRawUnsafe(
        `SELECT set_config('app.current_company_id', $1, true)`, 
        context.companyId
      );
    }
    
    // 3. Execução da lógica de Negócios (A query não verá dados de vizinhos)
    return await operation(tx);
  });
}
