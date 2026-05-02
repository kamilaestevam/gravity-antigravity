import { Request, Response, NextFunction } from 'express';
import { createTicketSchema, updateTicketStatusSchema } from '../schemas';
import * as ticketService from '../services/ticket.service';

export const createTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createTicketSchema.parse(req.body);
    const { tenant_id, product_id, user_id } = res.locals;
    const ticket = await ticketService.createTicket({ ...data, tenant_id, product_id, user_id });
    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
};

export const listTickets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenant_id, product_id } = res.locals;
    const tickets = await ticketService.listTickets(tenant_id, product_id, req.query);
    res.json(tickets);
  } catch (error) {
    next(error);
  }
};

export const getTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenant_id } = res.locals;
    const ticket = await ticketService.getTicket(req.params.id, tenant_id);
    res.json(ticket);
  } catch (error) {
    next(error);
  }
};

export const updateTicketStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenant_id } = res.locals;
    const data = updateTicketStatusSchema.parse(req.body);
    const ticket = await ticketService.updateTicketStatus(req.params.id, tenant_id, data.status, data.resolve);
    res.json(ticket);
  } catch (error) {
    next(error);
  }
};
