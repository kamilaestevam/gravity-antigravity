/**
 * config-status-simula-custo.ts — Colunas do Kanban (status do enum StatusSimulaCusto).
 * Os status do Simula Custo são fixos no enum do banco (EM_CRIACAO, CRIADA, ARQUIVADA);
 * ordem/visibilidade por usuário ficam no client (preferências locais).
 * GET retorna o catálogo canônico com cor/ícone padrão para montar o Kanban.
 */
import { Router, Request, Response } from 'express'
import { STATUS_SIMULA_CUSTO } from '../schemas/simula-custo-schema.js'

export const configStatusSimulaCustoRouter = Router()

const CATALOGO_STATUS_SIMULA_CUSTO = [
  { nome_status_simula_custo: 'EM_CRIACAO', cor_status_simula_custo: '#f59e0b', icone_status_simula_custo: 'pencil', ordem_status_simula_custo: 1 },
  { nome_status_simula_custo: 'CRIADA',     cor_status_simula_custo: '#22c55e', icone_status_simula_custo: 'check-circle', ordem_status_simula_custo: 2 },
  { nome_status_simula_custo: 'ARQUIVADA',  cor_status_simula_custo: '#64748b', icone_status_simula_custo: 'archive', ordem_status_simula_custo: 3 },
] satisfies Array<{
  nome_status_simula_custo: (typeof STATUS_SIMULA_CUSTO)[number]
  cor_status_simula_custo: string
  icone_status_simula_custo: string
  ordem_status_simula_custo: number
}>

configStatusSimulaCustoRouter.get('/', (_req: Request, res: Response) => {
  res.json({ status_simula_custo: CATALOGO_STATUS_SIMULA_CUSTO })
})
