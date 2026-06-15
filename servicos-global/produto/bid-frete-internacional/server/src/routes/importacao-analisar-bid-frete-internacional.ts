/**
 * POST /importacao/analisar — lê planilha no servidor (exceljs) e devolve parse.
 * Paridade Pedido Smart Import /analisar.
 */
import { Router, type Request, type Response, type NextFunction } from 'express'
import multer from 'multer'
import { z } from 'zod'
import { lerBufferImportacaoComoCsv } from '../../../shared/ler-arquivo-importacao-bid-frete-internacional.js'
import { parseCsvBruto, parsearPlanilhaImportacaoBidFreteInternacional } from '../../../shared/parsear-planilha-importacao-bid-frete-internacional.js'
import type { ModoPlanilhaImportacaoBidFreteInternacional } from '../../../shared/tipos-importacao-bid-frete-internacional.js'

const EXTENSOES_ACEITAS = new Set(['xlsx', 'xls', 'csv'])
const TAMANHO_MAX_BYTES = 10 * 1024 * 1024

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANHO_MAX_BYTES },
})

const modoQuerySchema = z.enum(['gravity', 'usuario'])

export const importacaoAnalisarBidRouter = Router()

importacaoAnalisarBidRouter.post(
  '/analisar',
  upload.single('arquivo'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: { message: 'Arquivo não encontrado', code: 'ARQUIVO_AUSENTE' },
        })
      }

      const modoParse = modoQuerySchema.safeParse(req.query.modo ?? 'gravity')
      if (!modoParse.success) {
        return res.status(400).json({
          error: { message: 'Modo de planilha inválido', code: 'MODO_INVALIDO' },
        })
      }
      const modo = modoParse.data as ModoPlanilhaImportacaoBidFreteInternacional

      const ext = req.file.originalname.split('.').pop()?.toLowerCase() ?? ''
      if (!EXTENSOES_ACEITAS.has(ext)) {
        return res.status(400).json({
          error: { message: 'Formato não suportado. Use Excel (.xlsx) ou CSV.', code: 'FORMATO_INVALIDO' },
        })
      }

      const conteudo = await lerBufferImportacaoComoCsv(req.file.buffer, ext)

      if (!conteudo.trim()) {
        return res.status(400).json({
          error: { message: 'Nenhuma linha encontrada no arquivo', code: 'ARQUIVO_VAZIO' },
        })
      }

      const { linhasBrutas } = parseCsvBruto(conteudo)
      const resultado = parsearPlanilhaImportacaoBidFreteInternacional(conteudo, modo)

      res.json({
        linhas: resultado.linhas,
        mapeamento: resultado.mapeamento,
        confianca_global: resultado.confianca_global,
        score_essenciais: resultado.score_essenciais,
        colunas_detectadas: [...resultado.colunas_detectadas],
        linhas_brutas: linhasBrutas,
      })
    } catch (err) {
      next(err)
    }
  },
)
