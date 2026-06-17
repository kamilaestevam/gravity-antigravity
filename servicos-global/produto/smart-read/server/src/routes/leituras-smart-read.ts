/**
 * leituras-smart-read.ts — Rotas do BFF Smart Read
 * POST /          → cria leitura no legado + envia arquivo (202, processamento assincrono)
 * GET  /:id       → status/resultado normalizado (consumidor faz polling)
 * Identidade da organizacao vem do header x-id-organizacao (S2S), nunca do body.
 */

import { Router, Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { z } from 'zod'
import { AppError } from '../lib/app-error.js'
import {
  criarLeituraLegado,
  enviarArquivoLegado,
  obterLeituraLegado,
  resolverCompanyLegado,
} from '../lib/cliente-legado-smart-read.js'
import {
  CriarLeituraRespostaSchema,
  LeituraSchema,
  normalizarLeitura,
} from '../schemas/leitura-smart-read.js'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
})

const IdLeituraSchema = z.object({ id_leitura: z.string().min(8) })

function organizacaoDaRequisicao(req: Request): string {
  const idOrganizacao = req.headers['x-id-organizacao']
  if (!idOrganizacao || typeof idOrganizacao !== 'string') {
    throw new AppError('Header x-id-organizacao obrigatorio', 400, 'ORGANIZACAO_AUSENTE')
  }
  return idOrganizacao
}

router.post('/', upload.single('arquivo'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idOrganizacao = organizacaoDaRequisicao(req)
    if (!req.file) {
      throw new AppError('Arquivo obrigatorio (campo multipart "arquivo")', 400, 'ARQUIVO_AUSENTE')
    }

    const companyId = await resolverCompanyLegado(idOrganizacao)
    const idLeitura = await criarLeituraLegado(companyId)
    const idArquivo = await enviarArquivoLegado(companyId, idLeitura, {
      buffer: req.file.buffer,
      nome: req.file.originalname,
      mimeType: req.file.mimetype,
    })

    const resposta = CriarLeituraRespostaSchema.parse({
      id_leitura: idLeitura,
      id_arquivo: idArquivo,
      status_leitura: 'PROCESSING',
    })
    res.status(202).json(resposta)
  } catch (err) {
    next(err)
  }
})

router.get('/:id_leitura', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idOrganizacao = organizacaoDaRequisicao(req)
    const { id_leitura } = IdLeituraSchema.parse(req.params)

    const companyId = await resolverCompanyLegado(idOrganizacao)
    const leituraLegado = await obterLeituraLegado(companyId, id_leitura)

    res.json(LeituraSchema.parse(normalizarLeitura(leituraLegado)))
  } catch (err) {
    next(err)
  }
})

export { router as leiturasSmartReadRouter }
