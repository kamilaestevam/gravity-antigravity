import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { AppError } from '../lib/errors.js';

export const relatoriosRouter = Router();

const createRelatorioSchema = z.object({
  product_id: z.string().optional().nullable(),
  nome: z.string().min(1),
  tabelas: z.array(z.any()).optional().default([]),
  colunas: z.array(z.any()).optional().default([]),
  filtros: z.record(z.any()).optional().default({}),
  join_type: z.string().optional().default('left'),
  is_shared: z.boolean().optional().default(false),
});

const updateRelatorioSchema = createRelatorioSchema.partial();

// ---- ACL DTO — mantém payload público estável ----
function toRelatorioDto(r: {
  id_relatorios_salvos: string;
  id_organizacao_relatorios_salvos: string;
  id_produto_relatorios_salvos: string | null;
  id_usuario_relatorios_salvos: string | null;
  nome_relatorios_salvos: string;
  tabelas_relatorios_salvos: unknown;
  colunas_relatorios_salvos: unknown;
  filtros_relatorios_salvos: unknown;
  tipo_join_relatorios_salvos: string;
  compartilhado_relatorios_salvos: boolean;
  data_criacao_relatorios_salvos: Date;
  data_atualizacao_relatorios_salvos: Date;
}) {
  return {
    id: r.id_relatorios_salvos,
    tenant_id: r.id_organizacao_relatorios_salvos,
    product_id: r.id_produto_relatorios_salvos,
    user_id: r.id_usuario_relatorios_salvos,
    nome: r.nome_relatorios_salvos,
    tabelas: r.tabelas_relatorios_salvos,
    colunas: r.colunas_relatorios_salvos,
    filtros: r.filtros_relatorios_salvos,
    join_type: r.tipo_join_relatorios_salvos,
    is_shared: r.compartilhado_relatorios_salvos,
    created_at: r.data_criacao_relatorios_salvos,
    updated_at: r.data_atualizacao_relatorios_salvos,
  };
}

// ---- Workspace: Listar relatórios salvos ----
relatoriosRouter.get('/api/v1/relatorios-salvos', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id_organizacao: tenantId, id_usuario: userId } = req.auth;
    const { product_id } = req.query;

    const where: Record<string, unknown> = {
      id_organizacao_relatorios_salvos: tenantId,
      OR: [
        { id_usuario_relatorios_salvos: userId },
        { compartilhado_relatorios_salvos: true },
      ],
    };

    if (product_id) {
      where.id_produto_relatorios_salvos = String(product_id);
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 100));

    const relatorios = await prisma.relatoriosSalvosUsuario.findMany({
      where,
      orderBy: { data_criacao_relatorios_salvos: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    });

    res.json({ data: relatorios.map(toRelatorioDto) });
  } catch (err) {
    next(err);
  }
});

// ---- Workspace: Salvar relatório ----
relatoriosRouter.post('/api/v1/relatorios-salvos', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id_organizacao: tenantId, id_usuario: userId } = req.auth;

    const parse = createRelatorioSchema.safeParse(req.body);
    if (!parse.success) {
      throw new AppError(parse.error.errors[0].message, 422, 'VALIDATION_ERROR');
    }

    const relatorio = await prisma.relatoriosSalvosUsuario.create({
      data: {
        id_organizacao_relatorios_salvos: tenantId,
        id_usuario_relatorios_salvos: userId || null,
        id_produto_relatorios_salvos: parse.data.product_id ?? null,
        nome_relatorios_salvos: parse.data.nome,
        tabelas_relatorios_salvos: parse.data.tabelas,
        colunas_relatorios_salvos: parse.data.colunas,
        filtros_relatorios_salvos: parse.data.filtros,
        tipo_join_relatorios_salvos: parse.data.join_type,
        compartilhado_relatorios_salvos: parse.data.is_shared,
      },
    });

    res.status(201).json({ data: toRelatorioDto(relatorio) });
  } catch (err) {
    next(err);
  }
});

// ---- Workspace: Ver relatório por ID ----
relatoriosRouter.get('/api/v1/relatorios-salvos/:id_relatorio_salvo', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id_organizacao: tenantId, id_usuario: userId } = req.auth;
    const { id_relatorio_salvo } = req.params;

    const relatorio = await prisma.relatoriosSalvosUsuario.findFirst({
      where: {
        id_relatorios_salvos: id_relatorio_salvo,
        id_organizacao_relatorios_salvos: tenantId,
        OR: [
          { id_usuario_relatorios_salvos: userId },
          { compartilhado_relatorios_salvos: true },
        ],
      },
    });

    if (!relatorio) {
      throw new AppError('Relatório não encontrado', 404, 'NOT_FOUND');
    }

    res.json({ data: toRelatorioDto(relatorio) });
  } catch (err) {
    next(err);
  }
});

// ---- Workspace: Atualizar relatório ----
relatoriosRouter.put('/api/v1/relatorios-salvos/:id_relatorio_salvo', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id_organizacao: tenantId, id_usuario: userId } = req.auth;
    const { id_relatorio_salvo } = req.params;

    const parse = updateRelatorioSchema.safeParse(req.body);
    if (!parse.success) {
      throw new AppError(parse.error.errors[0].message, 422, 'VALIDATION_ERROR');
    }

    // Apenas dono pode editar (ou admin, mas simplificando para dono neste contexto)
    const existente = await prisma.relatoriosSalvosUsuario.findFirst({
      where: {
        id_relatorios_salvos: id_relatorio_salvo,
        id_organizacao_relatorios_salvos: tenantId,
        id_usuario_relatorios_salvos: userId,
      },
    });

    if (!existente) {
      throw new AppError('Relatório não encontrado ou sem permissão para editar', 404, 'NOT_FOUND');
    }

    const data: Record<string, unknown> = {};
    if (parse.data.product_id !== undefined) data.id_produto_relatorios_salvos = parse.data.product_id;
    if (parse.data.nome !== undefined) data.nome_relatorios_salvos = parse.data.nome;
    if (parse.data.tabelas !== undefined) data.tabelas_relatorios_salvos = parse.data.tabelas;
    if (parse.data.colunas !== undefined) data.colunas_relatorios_salvos = parse.data.colunas;
    if (parse.data.filtros !== undefined) data.filtros_relatorios_salvos = parse.data.filtros;
    if (parse.data.join_type !== undefined) data.tipo_join_relatorios_salvos = parse.data.join_type;
    if (parse.data.is_shared !== undefined) data.compartilhado_relatorios_salvos = parse.data.is_shared;

    const relatorio = await prisma.relatoriosSalvosUsuario.update({
      where: { id_relatorios_salvos: id_relatorio_salvo },
      data,
    });

    res.json({ data: toRelatorioDto(relatorio) });
  } catch (err) {
    next(err);
  }
});

// ---- Workspace: Deletar relatório ----
relatoriosRouter.delete('/api/v1/relatorios-salvos/:id_relatorio_salvo', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id_organizacao: tenantId, id_usuario: userId } = req.auth;
    const { id_relatorio_salvo } = req.params;

    const existente = await prisma.relatoriosSalvosUsuario.findFirst({
      where: {
        id_relatorios_salvos: id_relatorio_salvo,
        id_organizacao_relatorios_salvos: tenantId,
        id_usuario_relatorios_salvos: userId,
      },
    });

    if (!existente) {
      throw new AppError('Relatório não encontrado ou sem permissão para deletar', 404, 'NOT_FOUND');
    }

    await prisma.relatoriosSalvosUsuario.delete({
      where: { id_relatorios_salvos: id_relatorio_salvo },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Mock da rota de dados (unificação)
relatoriosRouter.get('/api/v1/relatorios/:id_relatorio', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id_organizacao: tenantId } = req.auth;

    res.json({
      data: [
        { id: '1', name: 'Mock Data 1', tenant: tenantId },
        { id: '2', name: 'Mock Data 2', tenant: tenantId },
      ],
      meta: { total: 2 },
    });
  } catch (err) {
    next(err);
  }
});
