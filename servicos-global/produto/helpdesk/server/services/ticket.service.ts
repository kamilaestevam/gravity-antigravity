import { getPrisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';

export const createTicket = async (data: {
  tenant_id: string;
  product_id: string | null;
  user_id: string | null;
  categoria_id: string;
  title: string;
  description: string;
  priority: any;
}) => {
  const prisma = getPrisma();
  const cat = await prisma.helpdeskCategoria.findFirst({
    where: { id: data.categoria_id, tenant_id: data.tenant_id }
  });
  if (!cat) throw new AppError('Categoria não encontrada', 404);

  return prisma.helpdeskTicket.create({
    data: {
      ...data,
      status: 'OPEN',
    }
  });
};

export const listTickets = async (tenant_id: string, product_id: string | null, filters: any = {}) => {
  const prisma = getPrisma();
  return prisma.helpdeskTicket.findMany({
    where: { tenant_id, product_id, ...filters },
    include: { categoria: true }
  });
};

export const getTicket = async (id: string, tenant_id: string) => {
  const prisma = getPrisma();
  const ticket = await prisma.helpdeskTicket.findFirst({
    where: { id, tenant_id },
    include: { categoria: true }
  });
  if (!ticket) throw new AppError('Ticket não encontrado', 404);
  return ticket;
};

export const updateTicketStatus = async (id: string, tenant_id: string, status: any, resolve: boolean = false) => {
  const prisma = getPrisma();
  const ticket = await getTicket(id, tenant_id);
  
  const updates: any = { status };
  if (resolve) {
    updates.resolved_at = new Date();
  }
  if (!ticket.first_response_at && status !== 'OPEN') {
    updates.first_response_at = new Date();
  }

  return prisma.helpdeskTicket.update({
    where: { id },
    data: updates
  });
};
