/**
 * config-status-estimativa-custo.ts — Colunas do Kanban (status do enum StatusEstimativaCusto).
 * Os status do Estimativa Custo são fixos no enum do banco (EM_CRIACAO, CRIADA, ARQUIVADA);
 * ordem/visibilidade por usuário ficam no client (preferências locais).
 * GET retorna o catálogo canônico com cor/ícone padrão para montar o Kanban.
 */
import { Router, Request, Response } from 'express'
import { STATUS_ESTIMATIVA_CUSTO } from '../schemas/estimativa-custo-schema.js'

export const configStatusEstimativaCustoRouter = Router()

const CATALOGO_STATUS_ESTIMATIVA_CUSTO = [
  { nome_status_estimativa_custo: 'EM_CRIACAO', cor_status_estimativa_custo: '#f59e0b', icone_status_estimativa_custo: 'pencil', ordem_status_estimativa_custo: 1 },
  { nome_status_estimativa_custo: 'CRIADA',     cor_status_estimativa_custo: '#22c55e', icone_status_estimativa_custo: 'check-circle', ordem_status_estimativa_custo: 2 },
  { nome_status_estimativa_custo: 'ARQUIVADA',  cor_status_estimativa_custo: '#64748b', icone_status_estimativa_custo: 'archive', ordem_status_estimativa_custo: 3 },
] satisfies Array<{
  nome_status_estimativa_custo: (typeof STATUS_ESTIMATIVA_CUSTO)[number]
  cor_status_estimativa_custo: string
  icone_status_estimativa_custo: string
  ordem_status_estimativa_custo: number
}>

configStatusEstimativaCustoRouter.get('/', (_req: Request, res: Response) => {
  res.json({ status_estimativa_custo: CATALOGO_STATUS_ESTIMATIVA_CUSTO })
})
