// server/services/deployLogService.ts
// CRUD do histórico manual de deploys da plataforma Gravity.
// Global (não tenant-scoped) — exclusivo gravity_admin.

import { prisma } from '../lib/prisma.js'
import type { Prisma } from '../../../../configurador/generated/index.js'

export type DeployEnvironmentValue = 'DESENVOLVIMENTO' | 'HOMOLOGACAO' | 'PRODUCAO' | 'TODOS'
export type DeployStatusValue = 'SUCESSO' | 'FALHOU' | 'REVERTIDO' | 'EM_ANDAMENTO'

export interface CreateDeployLogInput {
  area: string
  version: string
  description: string
  environment?: DeployEnvironmentValue
  status?: DeployStatusValue
  deployed_by: string
  deployed_by_user_id?: string
  deployed_at?: Date
}

export interface ListDeployLogsParams {
  page?: number
  limit?: number
  area?: string
  environment?: DeployEnvironmentValue
  status?: DeployStatusValue
  search?: string
  from_date?: string // ISO
  to_date?: string   // ISO
}

// DTO: Deploy Prisma rename → contrato legado da UI/admin
function toDeployDto(row: {
  id_deploy: string
  deploy_number: number
  area_deploy: string
  versao_deploy: string
  descricao_deploy: string
  ambiente_deploy: DeployEnvironmentValue
  status_deploy: DeployStatusValue
  quem_deploy: string
  id_usuario_deploy: string | null
  data_execucao_deploy: Date
  data_criacao_deploy: Date
}) {
  return {
    id: row.id_deploy,
    deploy_number: row.deploy_number,
    area: row.area_deploy,
    version: row.versao_deploy,
    description: row.descricao_deploy,
    environment: row.ambiente_deploy,
    status: row.status_deploy,
    deployed_by: row.quem_deploy,
    deployed_by_user_id: row.id_usuario_deploy,
    deployed_at: row.data_execucao_deploy,
    created_at: row.data_criacao_deploy,
  }
}

export const deployLogService = {
  async list(params: ListDeployLogsParams) {
    const page = params.page ?? 1
    const limit = Math.min(params.limit ?? 50, 100)
    const skip = (page - 1) * limit

    const where: Prisma.DeployWhereInput = {}
    if (params.area) where.area_deploy = params.area
    if (params.environment) where.ambiente_deploy = params.environment
    if (params.status) where.status_deploy = params.status
    if (params.search) {
      where.OR = [
        { descricao_deploy: { contains: params.search, mode: 'insensitive' } },
        { versao_deploy: { contains: params.search, mode: 'insensitive' } },
        { quem_deploy: { contains: params.search, mode: 'insensitive' } },
      ]
    }
    if (params.from_date || params.to_date) {
      where.data_execucao_deploy = {}
      if (params.from_date) where.data_execucao_deploy.gte = new Date(params.from_date)
      if (params.to_date) where.data_execucao_deploy.lte = new Date(params.to_date)
    }

    const [rows, total] = await Promise.all([
      prisma.deploy.findMany({
        where,
        skip,
        take: limit,
        orderBy: { data_execucao_deploy: 'desc' },
      }),
      prisma.deploy.count({ where }),
    ])

    return {
      deploys: rows.map(toDeployDto),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }
  },

  async getById(id: string) {
    const row = await prisma.deploy.findUnique({ where: { id_deploy: id } })
    return row ? toDeployDto(row) : null
  },

  async create(data: CreateDeployLogInput) {
    const row = await prisma.deploy.create({
      data: {
        area_deploy: data.area,
        versao_deploy: data.version,
        descricao_deploy: data.description,
        ambiente_deploy: data.environment ?? 'PRODUCAO',
        status_deploy: data.status ?? 'SUCESSO',
        quem_deploy: data.deployed_by,
        id_usuario_deploy: data.deployed_by_user_id,
        data_execucao_deploy: data.deployed_at ?? new Date(),
      },
    })
    return toDeployDto(row)
  },

  async delete(id: string) {
    return prisma.deploy.delete({ where: { id_deploy: id } })
  },
}
