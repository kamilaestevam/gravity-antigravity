/**
 * adminCertificados.ts — CRUD de certificado digital Siscomex.
 *
 * Catálogo global (sem id_organizacao) — certificado é por CNPJ da empresa.
 * Acessado pelo Configurador via S2S (x-internal-key).
 *
 * Montado em: /api/v1/cadastros/admin/certificados
 *
 *   POST   /                  — upload de certificado .pfx/.p12
 *   GET    /                  — listar certificados (metadata, sem PFX)
 *   GET    /ativo             — obter certificado ativo (metadata)
 *   GET    /:id               — obter certificado por id (metadata)
 *   DELETE /:id               — soft-delete (ativo = false)
 *   POST   /:id/ativar       — marcar como ativo (desativa os demais)
 *   POST   /:id/validar      — testar autenticação no Portal Único
 */

import { Router } from 'express'
import { z } from 'zod'
import { requireInternalKey } from '../middleware/internal-key.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/app-error.js'
import { encryptBuffer } from '../lib/certificado-crypto.js'
import { parsePfx } from '../services/certificado-parser.js'
import { obterTokenSiscomex, invalidarCacheToken } from '../services/siscomex-auth.js'

export const adminCertificadosRouter = Router()
adminCertificadosRouter.use(requireInternalKey)

// ─── POST / — Upload de certificado ─────────────────────────────────────────

const UploadBodySchema = z.object({
  nome: z.string().min(1).max(200),
  pfx_base64: z.string().min(100),
  senha_pfx: z.string().min(1).max(200),
  ativar: z.boolean().default(false),
})

adminCertificadosRouter.post('/', async (req, res, next) => {
  try {
    const parsed = UploadBodySchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    const { nome, pfx_base64, senha_pfx, ativar } = parsed.data

    const pfxBuffer = Buffer.from(pfx_base64, 'base64')
    if (pfxBuffer.length < 100) {
      throw new AppError('Arquivo PFX muito pequeno — verifique o upload', 400, 'CERT_TOO_SMALL')
    }
    if (pfxBuffer.length > 50 * 1024 * 1024) {
      throw new AppError('Arquivo PFX excede 50MB', 400, 'CERT_TOO_LARGE')
    }

    const { metadata } = await parsePfx(pfxBuffer, senha_pfx)

    const pfxCriptografado = encryptBuffer(pfxBuffer)
    const senhaCriptografada = encryptBuffer(Buffer.from(senha_pfx, 'utf8'))

    // Se ativar, desativar todos os demais primeiro
    if (ativar) {
      await prisma.certificadoDigitalSiscomex.updateMany({
        where: { ativo_certificado_digital_siscomex: true },
        data: { ativo_certificado_digital_siscomex: false },
      })
      invalidarCacheToken()
    }

    const criado = await prisma.certificadoDigitalSiscomex.create({
      data: {
        nome_certificado_digital_siscomex: nome,
        cnpj_certificado_digital_siscomex: metadata.cnpj ?? '',
        cn_certificado_digital_siscomex: metadata.cn,
        serial_number_certificado_digital_siscomex: metadata.serial_number,
        emissor_certificado_digital_siscomex: metadata.emissor,
        validade_inicio_certificado_digital_siscomex: metadata.validade_inicio,
        validade_fim_certificado_digital_siscomex: metadata.validade_fim,
        pfx_criptografado_certificado_digital_siscomex: pfxCriptografado,
        senha_hash_certificado_digital_siscomex: senhaCriptografada,
        ativo_certificado_digital_siscomex: ativar,
      },
    })

    res.status(201).json(toMetadataDto(criado))
  } catch (err) {
    next(err)
  }
})

// ─── GET / — Listar certificados (metadata) ─────────────────────────────────

adminCertificadosRouter.get('/', async (_req, res, next) => {
  try {
    const certificados = await prisma.certificadoDigitalSiscomex.findMany({
      orderBy: { data_criacao_certificado_digital_siscomex: 'desc' },
      select: metadataSelect,
    })

    res.json({ certificados: certificados.map(toMetadataDto), total: certificados.length })
  } catch (err) {
    next(err)
  }
})

// ─── GET /ativo — Certificado ativo ──────────────────────────────────────────

adminCertificadosRouter.get('/ativo', async (_req, res, next) => {
  try {
    const ativo = await prisma.certificadoDigitalSiscomex.findFirst({
      where: { ativo_certificado_digital_siscomex: true },
      select: metadataSelect,
    })

    if (!ativo) {
      return res.json({ certificado: null })
    }

    res.json({ certificado: toMetadataDto(ativo) })
  } catch (err) {
    next(err)
  }
})

// ─── GET /:id — Obter por ID ────────────────────────────────────────────────

adminCertificadosRouter.get('/:id', async (req, res, next) => {
  try {
    const certificado = await prisma.certificadoDigitalSiscomex.findUnique({
      where: { id_certificado_digital_siscomex: req.params.id },
      select: metadataSelect,
    })

    if (!certificado) throw AppError.naoEncontrado('Certificado')

    res.json(toMetadataDto(certificado))
  } catch (err) {
    next(err)
  }
})

// ─── DELETE /:id — Soft-delete ───────────────────────────────────────────────

adminCertificadosRouter.delete('/:id', async (req, res, next) => {
  try {
    const existente = await prisma.certificadoDigitalSiscomex.findUnique({
      where: { id_certificado_digital_siscomex: req.params.id },
    })
    if (!existente) throw AppError.naoEncontrado('Certificado')

    await prisma.certificadoDigitalSiscomex.delete({
      where: { id_certificado_digital_siscomex: req.params.id },
    })

    if (existente.ativo_certificado_digital_siscomex) {
      invalidarCacheToken()
    }

    res.json({ sucesso: true, id: req.params.id })
  } catch (err) {
    next(err)
  }
})

// ─── POST /:id/ativar — Ativar certificado ───────────────────────────────────

adminCertificadosRouter.post('/:id/ativar', async (req, res, next) => {
  try {
    const existente = await prisma.certificadoDigitalSiscomex.findUnique({
      where: { id_certificado_digital_siscomex: req.params.id },
      select: metadataSelect,
    })
    if (!existente) throw AppError.naoEncontrado('Certificado')

    // Desativar todos, depois ativar este
    await prisma.certificadoDigitalSiscomex.updateMany({
      where: { ativo_certificado_digital_siscomex: true },
      data: { ativo_certificado_digital_siscomex: false },
    })

    const atualizado = await prisma.certificadoDigitalSiscomex.update({
      where: { id_certificado_digital_siscomex: req.params.id },
      data: { ativo_certificado_digital_siscomex: true },
      select: metadataSelect,
    })

    invalidarCacheToken()

    res.json(toMetadataDto(atualizado))
  } catch (err) {
    next(err)
  }
})

// ─── POST /:id/validar — Testar auth no Portal Único ────────────────────────

adminCertificadosRouter.post('/:id/validar', async (req, res, next) => {
  try {
    const existente = await prisma.certificadoDigitalSiscomex.findUnique({
      where: { id_certificado_digital_siscomex: req.params.id },
    })
    if (!existente) throw AppError.naoEncontrado('Certificado')

    // Temporariamente ativa este cert para testar
    const wasActive = existente.ativo_certificado_digital_siscomex
    if (!wasActive) {
      await prisma.certificadoDigitalSiscomex.updateMany({
        where: { ativo_certificado_digital_siscomex: true },
        data: { ativo_certificado_digital_siscomex: false },
      })
      await prisma.certificadoDigitalSiscomex.update({
        where: { id_certificado_digital_siscomex: req.params.id },
        data: { ativo_certificado_digital_siscomex: true },
      })
      invalidarCacheToken()
    }

    try {
      const token = await obterTokenSiscomex()
      res.json({
        valido: true,
        mensagem: 'Autenticação com Portal Único Siscomex realizada com sucesso',
        token_preview: token.substring(0, 20) + '...',
      })
    } catch (authErr: unknown) {
      const msg = authErr instanceof AppError ? authErr.message : 'Falha na autenticação'
      res.json({
        valido: false,
        mensagem: msg,
        token_preview: null,
      })
    } finally {
      // Restaurar estado anterior se não era ativo
      if (!wasActive) {
        await prisma.certificadoDigitalSiscomex.update({
          where: { id_certificado_digital_siscomex: req.params.id },
          data: { ativo_certificado_digital_siscomex: false },
        })
        invalidarCacheToken()
      }
    }
  } catch (err) {
    next(err)
  }
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

const metadataSelect = {
  id_certificado_digital_siscomex: true,
  nome_certificado_digital_siscomex: true,
  cnpj_certificado_digital_siscomex: true,
  cn_certificado_digital_siscomex: true,
  serial_number_certificado_digital_siscomex: true,
  emissor_certificado_digital_siscomex: true,
  validade_inicio_certificado_digital_siscomex: true,
  validade_fim_certificado_digital_siscomex: true,
  ativo_certificado_digital_siscomex: true,
  data_criacao_certificado_digital_siscomex: true,
  data_atualizacao_certificado_digital_siscomex: true,
} as const

type MetadataRow = {
  id_certificado_digital_siscomex: string
  nome_certificado_digital_siscomex: string
  cnpj_certificado_digital_siscomex: string
  cn_certificado_digital_siscomex: string
  serial_number_certificado_digital_siscomex: string
  emissor_certificado_digital_siscomex: string
  validade_inicio_certificado_digital_siscomex: Date
  validade_fim_certificado_digital_siscomex: Date
  ativo_certificado_digital_siscomex: boolean
  data_criacao_certificado_digital_siscomex: Date
  data_atualizacao_certificado_digital_siscomex: Date
}

function toMetadataDto(row: MetadataRow) {
  return {
    id: row.id_certificado_digital_siscomex,
    nome: row.nome_certificado_digital_siscomex,
    cnpj: row.cnpj_certificado_digital_siscomex,
    cn: row.cn_certificado_digital_siscomex,
    serial_number: row.serial_number_certificado_digital_siscomex,
    emissor: row.emissor_certificado_digital_siscomex,
    validade_inicio: row.validade_inicio_certificado_digital_siscomex,
    validade_fim: row.validade_fim_certificado_digital_siscomex,
    ativo: row.ativo_certificado_digital_siscomex,
    data_criacao: row.data_criacao_certificado_digital_siscomex,
    data_atualizacao: row.data_atualizacao_certificado_digital_siscomex,
  }
}
