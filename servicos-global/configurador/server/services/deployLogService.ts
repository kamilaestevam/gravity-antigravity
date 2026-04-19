// server/services/deployLogService.ts
// CRUD do histórico manual de deploys da plataforma Gravity.
// Global (não tenant-scoped) — exclusivo gravity_admin.

import { prisma } from '../lib/prisma.js'
import type { Prisma } from '../../../../configurador/generated/index.js'

export type DeployEnvironmentValue = 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION' | 'ALL'
export type DeployStatusValue = 'SUCCESS' | 'FAILED' | 'ROLLBACK' | 'IN_PROGRESS'

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

export const deployLogService = {
  async list(params: ListDeployLogsParams) {
    const page = params.page ?? 1
    const limit = Math.min(params.limit ?? 50, 100)
    const skip = (page - 1) * limit

    const where: Prisma.DeployLogWhereInput = {}
    if (params.area) where.area = params.area
    if (params.environment) where.environment = params.environment
    if (params.status) where.status = params.status
    if (params.search) {
      where.OR = [
        { description: { contains: params.search, mode: 'insensitive' } },
        { version: { contains: params.search, mode: 'insensitive' } },
        { deployed_by: { contains: params.search, mode: 'insensitive' } },
      ]
    }
    if (params.from_date || params.to_date) {
      where.deployed_at = {}
      if (params.from_date) where.deployed_at.gte = new Date(params.from_date)
      if (params.to_date) where.deployed_at.lte = new Date(params.to_date)
    }

    const [rows, total] = await Promise.all([
      prisma.deploy.findMany({
        where,
        skip,
        take: limit,
        orderBy: { deployed_at: 'desc' },
      }),
      prisma.deploy.count({ where }),
    ])

    return {
      deploys: rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }
  },

  async getById(id: string) {
    return prisma.deploy.findUnique({ where: { id } })
  },

  async create(data: CreateDeployLogInput) {
    return prisma.deploy.create({
      data: {
        area: data.area,
        version: data.version,
        description: data.description,
        environment: data.environment ?? 'PRODUCTION',
        status: data.status ?? 'SUCCESS',
        deployed_by: data.deployed_by,
        deployed_by_user_id: data.deployed_by_user_id,
        deployed_at: data.deployed_at ?? new Date(),
      },
    })
  },

  async delete(id: string) {
    return prisma.deploy.delete({ where: { id } })
  },
}
