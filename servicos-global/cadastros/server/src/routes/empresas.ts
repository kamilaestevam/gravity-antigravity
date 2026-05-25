/**
 * CRUD Empresa — identidade 1:1 da organização (Cadastros §4.1).
 * Parceiros ficam em /fornecedores (sem alteração).
 */
import { Router } from 'express'
import { Prisma } from '../../../generated/index.js'
import { requireInternalKey } from '../middleware/internal-key.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/app-error.js'
import { criarEmpresaSchema, atualizarEmpresaSchema } from '../../../shared/schemas/empresa.schema.js'
import { gerarSuidEmpresa } from '../utils/gerar-suid-empresa.js'
import { toEmpresaDto, empresaParaFornecedorCompatDto } from '../services/empresa-dto.js'
import { obterEmpresaDaOrganizacao } from '../services/empresa-org.service.js'

const router = Router()
router.use(requireInternalKey)

function extrairIdOrganizacao(req: import('express').Request): string {
  const headerCanonico = req.headers['x-id-organizacao']
  const headerLegado = req.headers['x-organizacao-id']
  const fromHeader =
    typeof headerCanonico === 'string' ? headerCanonico
    : typeof headerLegado === 'string' ? headerLegado
    : undefined
  const fromQuery = typeof req.query.id_organizacao === 'string' ? req.query.id_organizacao : undefined
  const escolhido = fromHeader ?? fromQuery
  if (!escolhido?.length) {
    throw new AppError(
      'id_organizacao é obrigatório (header x-id-organizacao ou query ?id_organizacao=)',
      400,
      'ORGANIZACAO_AUSENTE',
    )
  }
  return escolhido
}

async function obterEmpresaDaOrganizacaoHandler(idOrganizacao: string) {
  return obterEmpresaDaOrganizacao(idOrganizacao)
}

router.post('/', async (req, res, next) => {
  try {
    const bodyComOrg =
      req.body && typeof req.body === 'object' && !(req.body as { id_organizacao?: string }).id_organizacao
        ? (() => {
            try {
              return { ...req.body, id_organizacao: extrairIdOrganizacao(req) }
            } catch {
              return req.body
            }
          })()
        : req.body
    const dados = criarEmpresaSchema.parse(bodyComOrg)

    const existente = await prisma.empresa.findUnique({
      where: { id_organizacao_empresa: dados.id_organizacao },
    })
    if (existente) {
      return next(AppError.conflito('Organização já possui Empresa cadastrada'))
    }

    const id_empresa =
      dados.id_empresa ??
      (await gerarSuidEmpresa(prisma, {
        id_organizacao: dados.id_organizacao,
        pais_empresa: dados.pais_empresa,
        nome_empresa: dados.nome_empresa,
      }))

    const criada = await prisma.empresa.create({
      data: {
        id_empresa,
        id_organizacao_empresa: dados.id_organizacao,
        nome_empresa: dados.nome_empresa,
        cnpj_empresa: dados.cnpj_empresa ?? null,
        tin_empresa: dados.tin_empresa ?? null,
        pais_empresa: dados.pais_empresa,
        estado_provincia_empresa: dados.estado_provincia_empresa ?? null,
        cidade_empresa: dados.cidade_empresa ?? null,
        endereco_empresa: dados.endereco_empresa ?? null,
        cep_zipcode_empresa: dados.cep_zipcode_empresa ?? null,
        email_principal_empresa: dados.email_principal_empresa ?? null,
        telefone_principal_empresa: dados.telefone_principal_empresa ?? null,
        whatsapp_principal_empresa: dados.whatsapp_principal_empresa ?? null,
        pode_ser_importador_empresa: dados.pode_ser_importador_empresa,
        pode_ser_exportador_empresa: dados.pode_ser_exportador_empresa,
        pode_ser_fabricante_empresa: dados.pode_ser_fabricante_empresa,
        pode_ser_agente_empresa: dados.pode_ser_agente_empresa,
        pode_ser_despachante_empresa: dados.pode_ser_despachante_empresa,
        pode_ser_armador_empresa: dados.pode_ser_armador_empresa,
        pode_ser_cia_aerea_empresa: dados.pode_ser_cia_aerea_empresa,
        pode_ser_transportadora_rodoviaria_nacional_empresa: dados.pode_ser_transportadora_rodoviaria_nacional_empresa,
        pode_ser_transportadora_rodoviaria_internacional_empresa: dados.pode_ser_transportadora_rodoviaria_internacional_empresa,
        pode_ser_armazem_alfandegado_empresa: dados.pode_ser_armazem_alfandegado_empresa,
        pode_ser_armazem_nacional_empresa: dados.pode_ser_armazem_nacional_empresa,
        pode_ser_banco_empresa: dados.pode_ser_banco_empresa,
        pode_ser_seguradora_internacional_empresa: dados.pode_ser_seguradora_internacional_empresa,
        pode_ser_seguradora_corretora_cambio_empresa: dados.pode_ser_seguradora_corretora_cambio_empresa,
        ativo_empresa: dados.ativo_empresa,
      },
    })
    res.status(201).json(toEmpresaDto(criada))
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return next(AppError.conflito('Empresa duplicada para esta organização'))
    }
    next(err)
  }
})

router.get('/da-organizacao', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const empresa = await obterEmpresaDaOrganizacaoHandler(idOrganizacao)
    if (!empresa) {
      throw new AppError(
        'Organização não tem Empresa cadastrada (onboarding incompleto).',
        404,
        'EMPRESA_DA_ORG_AUSENTE',
      )
    }
    res.status(200).json(toEmpresaDto(empresa))
  } catch (err) {
    next(err)
  }
})

/** Compat Pedido — shape fornecedor a partir da Empresa da org. */
router.get('/da-organizacao/compat-fornecedor', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const empresa = await obterEmpresaDaOrganizacaoHandler(idOrganizacao)
    if (!empresa) {
      throw new AppError(
        'Organização não tem Empresa cadastrada (onboarding incompleto).',
        404,
        'EMPRESA_DA_ORG_AUSENTE',
      )
    }
    res.status(200).json(empresaParaFornecedorCompatDto(empresa))
  } catch (err) {
    next(err)
  }
})

router.get('/:id_empresa', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const empresa = await prisma.empresa.findFirst({
      where: { id_empresa: req.params.id_empresa, id_organizacao_empresa: idOrganizacao },
    })
    if (!empresa) throw AppError.naoEncontrado('Empresa')
    res.status(200).json(toEmpresaDto(empresa))
  } catch (err) {
    next(err)
  }
})

router.put('/:id_empresa', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const dados = atualizarEmpresaSchema.parse(req.body)
    const existente = await prisma.empresa.findFirst({
      where: { id_empresa: req.params.id_empresa, id_organizacao_empresa: idOrganizacao },
    })
    if (!existente) throw AppError.naoEncontrado('Empresa')
    const atualizada = await prisma.empresa.update({
      where: { id_empresa: existente.id_empresa },
      data: dados,
    })
    res.status(200).json(toEmpresaDto(atualizada))
  } catch (err) {
    next(err)
  }
})

router.delete('/:id_empresa', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const existente = await prisma.empresa.findFirst({
      where: { id_empresa: req.params.id_empresa, id_organizacao_empresa: idOrganizacao },
    })
    if (!existente) throw AppError.naoEncontrado('Empresa')
    const atualizada = await prisma.empresa.update({
      where: { id_empresa: existente.id_empresa },
      data: { ativo_empresa: false },
    })
    res.status(200).json(toEmpresaDto(atualizada))
  } catch (err) {
    next(err)
  }
})

router.delete('/:id_empresa/compensacao', async (req, res, next) => {
  try {
    const idOrganizacao = extrairIdOrganizacao(req)
    const existente = await prisma.empresa.findFirst({
      where: { id_empresa: req.params.id_empresa, id_organizacao_empresa: idOrganizacao },
    })
    if (!existente) {
      res.status(204).send()
      return
    }
    await prisma.empresa.delete({ where: { id_empresa: existente.id_empresa } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export { obterEmpresaDaOrganizacao } from '../services/empresa-org.service.js'
export { empresaParaFornecedorCompatDto } from '../services/empresa-dto.js'
export const empresasRouter = router
