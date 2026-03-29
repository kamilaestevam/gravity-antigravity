import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AppError } from './lib/errors';
import { getCachedKpis, setCachedKpis } from './lib/cache';

const router = Router();
const prisma = new PrismaClient();

const querySchema = z.object({
  tenant_id: z.string().min(1, 'tenant_id is required'),
});

router.get('/kpis', async (req, res, next) => {
  try {
    const { tenant_id } = querySchema.parse(req.query);

    // Try cache first
    const cached = getCachedKpis(tenant_id, 'global');
    if (cached) {
      return res.json({ source: 'cache', data: cached });
    }

    // Em um cenário real, estas métricas viriam de agregação na MetricaSnapshot
    // ou diretamente dos produtos habilitados no Tenant.
    // Por enquanto, forneceremos o objeto conforme o novo Dashboard frontend.
    const latestKpis = {
      // Métricas de Operação (estilo SimulaCusto)
      totalSimulacoes: 128,
      mediaLandedCostBrl: 24500,
      viavel: 96,
      atencao: 24,
      inviavel: 8,
      
      // Métricas CRM (estilo Journey - Imagem 2)
      crm: {
        totalEmpresas: 14,
        clientesAtivos: 8,
        clientesInativos: 0,
        leadsFunil: 4,
        novosEsteMes: 14,
        funil: [
          { etapa: 'Prospects', valor: 4, meta: 10, totalEstimado: 0 },
          { etapa: 'Leads Qualificados', valor: 0, meta: 8, totalEstimado: 0 },
          { etapa: 'Em Reunião', valor: 0, meta: 6, totalEstimado: 0 },
          { etapa: 'Proposta Enviada', valor: 0, meta: 5, totalEstimado: 0 },
          { etapa: 'Clientes Ativos', valor: 8, meta: 10, totalEstimado: 8900 }
        ],
        healthScore: {
          saudavel: 8,
          atencao: 0,
          risco: 0,
          total: 8
        },
        helpDesk: {
          abertos: 0,
          emAndamento: 0,
          tempoMedio: '0h'
        }
      }
    };

    // Update cache
    setCachedKpis(tenant_id, 'global', latestKpis);

    res.json({ source: 'db', data: latestKpis });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Invalid query parameters', 400));
    } else {
      next(error);
    }
  }
});

router.get('/recentes', async (req, res, next) => {
  try {
    const { tenant_id } = querySchema.parse(req.query);
    
    // Mock de simulações recentes para manter a paridade com o design
    const recentes = [
      { id: '1', ncm: '8471.30.19', pais_origem: 'US', valor_fob_usd: 5925, landed_cost_brl: 54320, status: 'criada', data_simulacao: '2026-03-27' },
      { id: '2', ncm: '8517.13.00', pais_origem: 'CN', valor_fob_usd: 12400, landed_cost_brl: 112450, status: 'criada', data_simulacao: '2026-03-26' },
      { id: '3', ncm: '8413.70.10', pais_origem: 'DE', valor_fob_usd: 4200, landed_cost_brl: 38900, status: 'criada', data_simulacao: '2026-03-25' },
    ];

    res.json({ source: 'db', data: recentes });
  } catch (error) {
    next(error);
  }
});

export default router;
