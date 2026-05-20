// server/routes/gabi-internal.ts
// Rotas internas S2S para GABI — aceita x-chave-interna-servico
// Proxy para as mesmas queries que os endpoints publicos (requireAuth),
// mas usando contexto de headers S2S em vez de JWT Clerk.
//
// Montado em: /api/v1/internal/gabi
// Auth: requireInternalKey (x-chave-interna-servico)
// Contexto: x-id-organizacao + x-id-usuario + x-tipo-usuario (headers)
//
// REGRA: estas rotas sao READ-ONLY. Mutacoes (criar workspace, convidar usuario)
// requerem auditoria completa e devem passar pelos endpoints publicos com JWT.

import { Router, type Request, type Response, type NextFunction } from 'express'
import { requireInternalKey } from '../middleware/requireInternalKey.js'
import { prisma } from '../lib/prisma.js'
import { organizacaoService } from '../services/organizacao-service.js'
import { AppError } from '../lib/appError.js'

export const gabiInternalRouter = Router()

// Todas as rotas neste router exigem x-chave-interna-servico
gabiInternalRouter.use(requireInternalKey)

// ── Helper: extrair contexto S2S dos headers ────────────────────────────────

interface ContextoS2S {
  id_organizacao: string
  id_usuario: string
  tipo_usuario: string
}

function extrairContexto(req: Request): ContextoS2S {
  const id_organizacao = req.headers['x-id-organizacao'] as string
  const id_usuario = req.headers['x-id-usuario'] as string
  const tipo_usuario = (req.headers['x-tipo-usuario'] as string) || 'PADRAO'

  if (!id_organizacao) {
    throw new AppError('Header x-id-organizacao obrigatorio para rotas GABI S2S', 400, 'MISSING_HEADER')
  }
  if (!id_usuario) {
    throw new AppError('Header x-id-usuario obrigatorio para rotas GABI S2S', 400, 'MISSING_HEADER')
  }

  return { id_organizacao, id_usuario, tipo_usuario }
}

// ── GET /api/v1/internal/gabi/me ────────────────────────────────────────────
// Espelho de GET /api/v1/me — contexto completo do usuario
// Usado por: config.me no catalogo-ferramentas.ts

gabiInternalRouter.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = extrairContexto(req)

    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: ctx.id_usuario },
      select: {
        id_usuario: true,
        nome_usuario: true,
        email_usuario: true,
        tipo_usuario: true,
        id_organizacao: true,
        id_workspace_preferido_usuario: true,
        acesso_workspaces_futuros: true,
        tenant: {
          select: {
            id_organizacao: true,
            nome_organizacao: true,
            subdominio_organizacao: true,
            status_organizacao: true,
            hospeda_colaboradores_gravity: true,
          },
        },
        memberships: {
          where: { ativo_usuario_workspace: true },
          select: {
            tipo_usuario_workspace: true,
            company: {
              select: {
                id_workspace: true,
                nome_workspace: true,
                status_workspace: true,
                company_products: {
                  where: { ativo_produto_gravity_workspace: true },
                  select: { id_produto_gravity: true },
                },
              },
            },
          },
        },
      },
    })

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario nao encontrado' })
    }

    // Validar tenant isolation — usuario deve pertencer a org do header
    if (usuario.id_organizacao !== ctx.id_organizacao) {
      return res.status(403).json({ error: 'Usuario nao pertence a organizacao informada' })
    }

    res.json({
      usuario: {
        id_usuario: usuario.id_usuario,
        nome_usuario: usuario.nome_usuario,
        email_usuario: usuario.email_usuario,
        tipo_usuario: usuario.tipo_usuario,
        id_organizacao: usuario.id_organizacao,
        id_workspace_preferido_usuario: usuario.id_workspace_preferido_usuario,
        acesso_workspaces_futuros: usuario.acesso_workspaces_futuros,
      },
      organizacao: usuario.tenant
        ? {
            id_organizacao: usuario.tenant.id_organizacao,
            nome_organizacao: usuario.tenant.nome_organizacao,
            subdominio_organizacao: usuario.tenant.subdominio_organizacao,
            status_organizacao: usuario.tenant.status_organizacao,
            hospeda_colaboradores_gravity: usuario.tenant.hospeda_colaboradores_gravity,
          }
        : null,
      workspaces: usuario.memberships.map((m) => ({
        id: m.company.id_workspace,
        nome_workspace: m.company.nome_workspace,
        status: m.company.status_workspace,
        tipo_usuario: m.tipo_usuario_workspace,
        produtos: m.company.company_products.map((p) => p.id_produto_gravity),
      })),
    })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/v1/internal/gabi/usuarios ──────────────────────────────────────
// Espelho de GET /api/v1/usuarios — lista usuarios da organizacao
// Usado por: config.listar_usuarios no catalogo-ferramentas.ts

gabiInternalRouter.get('/usuarios', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = extrairContexto(req)

    const usuarios = await prisma.usuario.findMany({
      where: { id_organizacao: ctx.id_organizacao },
      select: {
        id_usuario: true,
        nome_usuario: true,
        email_usuario: true,
        tipo_usuario: true,
        status_usuario: true,
        acesso_workspaces_futuros: true,
        data_criacao_usuario: true,
        id_clerk_usuario: true,
        memberships: {
          select: {
            id_usuario_workspace: true,
            id_workspace: true,
            tipo_usuario_workspace: true,
            ativo_usuario_workspace: true,
          },
        },
      },
      orderBy: { data_criacao_usuario: 'desc' },
    })

    // Derivar status CONVIDADO (mesmo padrao do usuario.ts publico)
    const dto = usuarios.map(({ memberships, id_clerk_usuario, status_usuario, ...rest }) => ({
      ...rest,
      status_usuario: id_clerk_usuario.startsWith('pending_')
        ? ('CONVIDADO' as const)
        : status_usuario,
      usuario_workspaces: memberships,
    }))

    res.json({ usuarios: dto })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/v1/internal/gabi/usuarios/:id_usuario ──────────────────────────
// Detalhe de um usuario especifico
// Usado por: config.detalhar_usuario no catalogo-ferramentas.ts

gabiInternalRouter.get('/usuarios/:id_usuario', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = extrairContexto(req)
    const { id_usuario } = req.params

    const usuario = await prisma.usuario.findFirst({
      where: {
        id_usuario,
        id_organizacao: ctx.id_organizacao, // tenant isolation
      },
      select: {
        id_usuario: true,
        nome_usuario: true,
        email_usuario: true,
        tipo_usuario: true,
        status_usuario: true,
        acesso_workspaces_futuros: true,
        data_criacao_usuario: true,
        id_clerk_usuario: true,
        memberships: {
          select: {
            id_usuario_workspace: true,
            id_workspace: true,
            tipo_usuario_workspace: true,
            ativo_usuario_workspace: true,
          },
        },
      },
    })

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario nao encontrado nesta organizacao' })
    }

    const { memberships, id_clerk_usuario, status_usuario, ...rest } = usuario
    res.json({
      usuario: {
        ...rest,
        status_usuario: id_clerk_usuario.startsWith('pending_')
          ? ('CONVIDADO' as const)
          : status_usuario,
        usuario_workspaces: memberships,
      },
    })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/v1/internal/gabi/organizacao ───────────────────────────────────
// Espelho de GET /api/v1/organizacoes/me — detalhes da organizacao
// Usado por: config.organizacao no catalogo-ferramentas.ts

gabiInternalRouter.get('/organizacao', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = extrairContexto(req)
    const organizacao = await organizacaoService.getOrganizacaoById(ctx.id_organizacao)

    if (!organizacao) {
      return res.status(404).json({ error: 'Organizacao nao encontrada' })
    }

    res.json({ organizacao })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/v1/internal/gabi/workspaces ────────────────────────────────────
// Espelho de GET /api/v1/me/workspaces — lista workspaces da organizacao
// Usado por: config.listar_workspaces no catalogo-ferramentas.ts

gabiInternalRouter.get('/workspaces', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = extrairContexto(req)
    const workspaces = await organizacaoService.getWorkspaces(ctx.id_organizacao)
    res.json({ workspaces })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/v1/internal/gabi/workspaces/:id_workspace ──────────────────────
// Detalhe de um workspace especifico
// Usado por: config.detalhar_workspace no catalogo-ferramentas.ts

gabiInternalRouter.get('/workspaces/:id_workspace', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = extrairContexto(req)
    const { id_workspace } = req.params

    const workspace = await prisma.workspace.findFirst({
      where: {
        id_workspace,
        id_organizacao: ctx.id_organizacao, // tenant isolation
      },
      select: {
        id_workspace: true,
        nome_workspace: true,
        subdominio_workspace: true,
        status_workspace: true,
        cnpj_workspace: true,
        data_criacao_workspace: true,
        data_atualizacao_workspace: true,
        company_products: {
          where: { ativo_produto_gravity_workspace: true },
          select: {
            id_produto_gravity: true,
            id_produto_gravity_workspace: true,
          },
        },
        _count: {
          select: { members: true },
        },
      },
    })

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace nao encontrado nesta organizacao' })
    }

    res.json({
      workspace: {
        ...workspace,
        produtos_ativos: workspace.company_products.map((p) => p.id_produto_gravity),
        total_membros: workspace._count.members,
      },
    })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/v1/internal/gabi/produtos-ativos ───────────────────────────────
// Produtos ativos na organizacao
// Usado por: config.produtos_ativos no catalogo-ferramentas.ts

gabiInternalRouter.get('/produtos-ativos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = extrairContexto(req)

    const produtos = await prisma.organizacaoProdutoGravity.findMany({
      where: {
        id_organizacao: ctx.id_organizacao,
        ativo_organizacao_produto_gravity: true,
      },
      select: {
        id_organizacao_produto_gravity: true,
        id_produto_gravity: true,
        ativo_organizacao_produto_gravity: true,
        data_ativacao_organizacao_produto_gravity: true,
        produto: {
          select: {
            nome_produto_gravity: true,
            slug_produto_gravity: true,
            descricao_produto_gravity: true,
          },
        },
      },
    })

    res.json({ produtos })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/v1/internal/gabi/assinaturas ───────────────────────────────────
// Assinaturas de produtos da organizacao
// Usado por: config.assinaturas no catalogo-ferramentas.ts

gabiInternalRouter.get('/assinaturas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = extrairContexto(req)

    const assinaturas = await prisma.assinaturaProdutoGravity.findMany({
      where: { id_organizacao: ctx.id_organizacao },
      select: {
        id_assinatura_produto_gravity: true,
        id_produto_gravity: true,
        id_plano_produto_gravity: true,
        status_assinatura_produto_gravity: true,
        data_inicio_assinatura_produto_gravity: true,
        data_fim_assinatura_produto_gravity: true,
        produto: {
          select: {
            nome_produto_gravity: true,
            slug_produto_gravity: true,
          },
        },
        plano: {
          select: {
            nome_plano_produto_gravity: true,
          },
        },
      },
      orderBy: { data_inicio_assinatura_produto_gravity: 'desc' },
    })

    res.json({ assinaturas })
  } catch (err) {
    next(err)
  }
})
