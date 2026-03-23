import { getPrisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';

export const createCategoria = async (data: { tenant_id: string; product_id: string | null; name: string; description?: string }) => {
  const prisma = getPrisma();
  return prisma.helpdeskCategoria.create({ data });
};

export const listCategorias = async (tenant_id: string, product_id: string | null) => {
  const prisma = getPrisma();
  return prisma.helpdeskCategoria.findMany({
    where: { tenant_id, product_id },
    include: { slas: true },
  });
};

export const createSLA = async (data: { tenant_id: string; product_id: string | null; categoria_id: string; priority: any; response_time_hr: number; resolution_time_hr: number }) => {
  const prisma = getPrisma();
  const cat = await prisma.helpdeskCategoria.findFirst({
    where: { id: data.categoria_id, tenant_id: data.tenant_id }
  });
  if (!cat) throw new AppError('Categoria não encontrada', 404);

  return prisma.helpdeskSLA.create({ data });
};

export const createTemplate = async (data: { tenant_id: string; product_id: string | null; title: string; content: string }) => {
  const prisma = getPrisma();
  return prisma.helpdeskRespostaTemplate.create({ data });
};
