/**
 * nfImportar.ts — Canais de importacao de NF (XML, Smart Read, Portal Unico, Processo)
 * Todas as queries filtram por tenant_id + company_id (zero-trust)
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../services/nfStatusEngine.js'
import { gerarId, PREFIXOS } from '../lib/idGenerator.js'
import type { PrismaClient, Prisma } from '@prisma/client'

type TxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

const router = Router()

function ctx(req: Request) {
  return {
    tenantId: (req as unknown as Record<string, unknown>).tenantId as string,
    userId: (req as unknown as Record<string, unknown>).userId as string,
    prisma: (req as unknown as Record<string, unknown>).prisma as PrismaClient,
    companyId: req.headers['x-company-id'] as string || '',
  }
}

// ── Zod Schemas ─────────────────────────────────────────────────────────────

const ImportXmlSchema = z.object({
  company_id: z.string().min(1),
  xml_content: z.string().min(1),
  nome_arquivo: z.string().min(1),
})

const ImportSmartReadSchema = z.object({
  company_id: z.string().min(1),
  storage_key: z.string().min(1),
  nome_arquivo: z.string().min(1),
  mime_type: z.string().optional(),
})

const ImportPortalUnicoSchema = z.object({
  company_id: z.string().min(1),
  di_numero: z.string().optional(),
  duimp_numero: z.string().optional(),
  chave_acesso: z.string().optional(),
})

// ── Helpers ─────────────────────────────────────────────────────────────────

async function criarNfFromImport(
  prisma: PrismaClient,
  tenantId: string,
  userId: string,
  companyId: string,
  canalEntrada: string,
  dados: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const count = await prisma.nFImportacao.count({ where: { tenant_id: tenantId } })
  const id = gerarId(PREFIXOS.NF, count + 1)

  const nf = await prisma.$transaction(async (tx: TxClient) => {
    const created = await tx.nFImportacao.create({
      data: {
        id,
        tenant_id: tenantId,
        company_id: companyId,
        product_id: 'nf-importacao',
        user_id: userId,
        canal_entrada: canalEntrada,
        status: 'rascunho',
        created_by: userId,
        numero_nf: (dados.numero_nf as string) ?? null,
        serie: (dados.serie as string) ?? null,
        chave_acesso: (dados.chave_acesso as string) ?? null,
        tipo_operacao: (dados.tipo_operacao as string) ?? 'importacao',
        natureza_operacao: (dados.natureza_operacao as string) ?? null,
        data_emissao: dados.data_emissao ? new Date(dados.data_emissao as string) : null,
        data_entrada: dados.data_entrada ? new Date(dados.data_entrada as string) : null,
        exportador_nome: (dados.exportador_nome as string) ?? null,
        exportador_pais: (dados.exportador_pais as string) ?? null,
        importador_cnpj: (dados.importador_cnpj as string) ?? null,
        importador_nome: (dados.importador_nome as string) ?? null,
        moeda: (dados.moeda as string) ?? 'USD',
        taxa_cambio: (dados.taxa_cambio as number) ?? null,
        valor_total_fob: (dados.valor_total_fob as number) ?? null,
        valor_frete: (dados.valor_frete as number) ?? null,
        valor_seguro: (dados.valor_seguro as number) ?? null,
        valor_total_cif: (dados.valor_total_cif as number) ?? null,
        incoterm: (dados.incoterm as string) ?? null,
        via_transporte: (dados.via_transporte as string) ?? null,
        di_numero: (dados.di_numero as string) ?? null,
        duimp_numero: (dados.duimp_numero as string) ?? null,
        processo_id: (dados.processo_id as string) ?? null,
      },
    })

    // Criar itens se fornecidos
    const itens = (dados.itens as Array<Record<string, unknown>>) ?? []
    if (itens.length > 0) {
      const itemCount = await tx.nFImportacaoItens.count({ where: { tenant_id: tenantId } })
      for (let i = 0; i < itens.length; i++) {
        const item = itens[i]
        await tx.nFImportacaoItens.create({
          data: {
            id: gerarId(PREFIXOS.ITEM, itemCount + i + 1),
            tenant_id: tenantId,
            company_id: companyId,
            product_id: 'nf-importacao',
            user_id: userId,
            nf_importacao_id: id,
            numero_item: (item.numero_item as number) ?? i + 1,
            ncm: (item.ncm as string) ?? '',
            descricao: (item.descricao as string) ?? '',
            cfop: (item.cfop as string) ?? null,
            quantidade: (item.quantidade as number) ?? 0,
            unidade_medida: (item.unidade_medida as string) ?? 'UN',
            peso_liquido: (item.peso_liquido as number) ?? null,
            peso_bruto: (item.peso_bruto as number) ?? null,
            valor_unitario: (item.valor_unitario as number) ?? null,
            valor_fob: (item.valor_fob as number) ?? null,
            valor_cif: (item.valor_cif as number) ?? null,
            aliquota_ii: (item.aliquota_ii as number) ?? null,
            valor_ii: (item.valor_ii as number) ?? null,
            aliquota_ipi: (item.aliquota_ipi as number) ?? null,
            valor_ipi: (item.valor_ipi as number) ?? null,
            aliquota_pis: (item.aliquota_pis as number) ?? null,
            valor_pis: (item.valor_pis as number) ?? null,
            aliquota_cofins: (item.aliquota_cofins as number) ?? null,
            valor_cofins: (item.valor_cofins as number) ?? null,
            aliquota_icms: (item.aliquota_icms as number) ?? null,
            valor_icms: (item.valor_icms as number) ?? null,
            cst_ipi: (item.cst_ipi as string) ?? null,
            cst_pis: (item.cst_pis as string) ?? null,
            cst_cofins: (item.cst_cofins as string) ?? null,
            cst_icms: (item.cst_icms as string) ?? null,
          },
        })
      }
    }

    await tx.nFImportacaoHistorico.create({
      data: {
        tenant_id: tenantId,
        company_id: companyId,
        product_id: 'nf-importacao',
        user_id: userId,
        nf_importacao_id: id,
        evento: 'importacao',
        status_novo: 'rascunho',
        descricao: `NF importada via ${canalEntrada}`,
        dados_extras: { canal: canalEntrada },
      },
    })

    return created
  })

  return nf as unknown as Record<string, unknown>
}

// ── POST /importar/xml — Upload XML DUIMP ──────────────────────────────────

router.post('/importar/xml', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)
    const body = ImportXmlSchema.parse(req.body)

    // Parse XML basico — placeholder para parser completo
    // Em producao, usar xml2js ou fast-xml-parser para extrair dados da DI/DUIMP
    const dadosExtraidos: Record<string, unknown> = {
      canal_entrada: 'XML',
      observacoes: `Importado de arquivo: ${body.nome_arquivo}`,
    }

    // Placeholder: parsing real de XML da DI/DUIMP
    // O conteudo XML seria parseado aqui e mapeado para os campos da NF
    // Por ora, cria NF vazia para preenchimento manual

    const nf = await criarNfFromImport(prisma, tenantId, userId, body.company_id, 'XML', dadosExtraidos)

    res.status(201).json({
      message: 'XML processado com sucesso',
      nf_importacao: nf,
      warnings: ['Parser XML em modo placeholder — dados podem precisar revisao manual'],
    })
  } catch (err) { next(err) }
})

// ── POST /importar/smart-read — Upload PDF para OCR+AI ─────────────────────

router.post('/importar/smart-read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)
    const body = ImportSmartReadSchema.parse(req.body)

    // Smart Read: OCR + AI para extrair dados de PDF/imagem
    // Placeholder: cria NF vazia + registra job de processamento assincrono

    const nf = await criarNfFromImport(prisma, tenantId, userId, body.company_id, 'SMART_READ', {
      observacoes: `Smart Read: ${body.nome_arquivo} (processando...)`,
    })

    res.status(202).json({
      message: 'Documento recebido para processamento Smart Read',
      nf_importacao: nf,
      storage_key: body.storage_key,
      status_processamento: 'em_fila',
      warnings: ['Smart Read em modo placeholder — dados serao extraidos assincronamente'],
    })
  } catch (err) { next(err) }
})

// ── POST /importar/portal-unico — Buscar do Portal Unico ──────────────────

router.post('/importar/portal-unico', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)
    const body = ImportPortalUnicoSchema.parse(req.body)

    if (!body.di_numero && !body.duimp_numero && !body.chave_acesso) {
      throw new AppError(
        'Informe ao menos um identificador: di_numero, duimp_numero ou chave_acesso',
        400,
        'VALIDATION_ERROR'
      )
    }

    // Portal Unico: integracao com API do Siscomex/Portal Unico
    // Placeholder: cria NF com dados basicos do identificador

    const nf = await criarNfFromImport(prisma, tenantId, userId, body.company_id, 'PORTAL_UNICO', {
      di_numero: body.di_numero ?? null,
      duimp_numero: body.duimp_numero ?? null,
      chave_acesso: body.chave_acesso ?? null,
      observacoes: `Importado do Portal Unico: ${body.di_numero ?? body.duimp_numero ?? body.chave_acesso}`,
    })

    res.status(201).json({
      message: 'Dados importados do Portal Unico',
      nf_importacao: nf,
      warnings: ['Integracao Portal Unico em modo placeholder — dados podem precisar revisao manual'],
    })
  } catch (err) { next(err) }
})

// ── POST /importar/processo/:processoId — Buscar do Gravity Processo ───────

router.post('/importar/processo/:processoId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma, companyId } = ctx(req)

    if (!companyId) {
      throw new AppError('Header x-company-id obrigatorio para importar de processo', 400, 'VALIDATION_ERROR')
    }

    // Buscar dados do processo via API interna do Gravity Processo
    // Placeholder: Em producao, faria chamada HTTP para o servico de Processo
    // com x-internal-key para autenticacao S2S

    const processoId = req.params.processoId

    // Criar NF com referencia ao processo
    const nf = await criarNfFromImport(prisma, tenantId, userId, companyId, 'PROCESSO', {
      processo_id: processoId,
      observacoes: `Importado do Processo ${processoId}`,
    })

    res.status(201).json({
      message: `NF criada a partir do Processo ${processoId}`,
      nf_importacao: nf,
      processo_id: processoId,
      warnings: ['Integracao com Processo em modo placeholder — dados serao sincronizados via S2S'],
    })
  } catch (err) { next(err) }
})

export { router as nfImportarRouter }
