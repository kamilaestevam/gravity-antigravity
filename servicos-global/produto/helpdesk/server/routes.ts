import { Router } from 'express';
import { createTicket, listTickets, getTicket, updateTicketStatus } from './controllers/ticket.controller';
import { createCategoria, listCategorias, createSLA, createTemplate } from './controllers/config.controller';
import { extractTenantContext } from './utils/middleware';

const router = Router();

router.use(extractTenantContext);

// Tickets
router.post('/tickets', createTicket);
router.get('/tickets', listTickets);
router.get('/tickets/:id', getTicket);
router.patch('/tickets/:id/status', updateTicketStatus);

// Config
router.post('/categorias', createCategoria);
router.get('/categorias', listCategorias);
router.post('/slas', createSLA);
router.post('/templates', createTemplate);

export default router;
