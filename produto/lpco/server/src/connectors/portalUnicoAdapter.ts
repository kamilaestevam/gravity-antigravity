/**
 * portalUnicoAdapter.ts — Adapter bidirecional com API do Portal Unico Siscomex
 *
 * Endpoints implementados:
 * - Registrar LPCO (importacao/exportacao)
 * - Consultar LPCO por numero
 * - Retificar LPCO
 * - Cancelar LPCO
 * - Responder exigencia
 * - Anexar documento
 * - Simular tratamento administrativo
 *
 * Autenticacao via strategy pattern (portalUnicoAuth.ts)
 */

import axios, { AxiosInstance } from 'axios'
import FormData from 'form-data'
import { PrismaClient } from '@prisma/client'
import { PortalUnicoAuth } from './portalUnicoAuth.js'
import { AppError } from '../services/lpcoStatusEngine.js'

const PORTAL_BASE_URL = process.env.PORTAL_UNICO_ENV === 'production'
  ? process.env.PORTAL_UNICO_BASE_URL ?? 'https://api.portalunico.siscomex.gov.br'
  : process.env.PORTAL_UNICO_TRAINING_URL ?? 'https://val.portalunico.siscomex.gov.br'

// ── Tipos de resposta do Portal Unico ────────────────────────────────────────

export interface PortalLpcoRegistro {
  numero: string
  dataCriacao: string
  situacao: string
}

export interface PortalLpcoConsulta {
  numero: string
  situacao: string
  dataRegistro: string
  dataDeferimento: string | null
  dataVigenciaInicio: string | null
  dataVigenciaFim: string | null
  quantidadeDeferida: number | null
  unidadeMedida: string | null
  exigencias: PortalExigencia[]
}

export interface PortalExigencia {
  numero: number
  descricao: string
  dataExigencia: string
  prazoResposta: string | null
}

export interface PortalTratamentoAdm {
  ncm: string
  orgaos: Array<{
    sigla: string
    nome: string
    modelo: string
    obrigatorio: boolean
    descricao: string
  }>
}

// ── Payload para registro ────────────────────────────────────────────────────

export interface RegistrarLpcoPayload {
  tipoOperacao: 'IMPORTACAO' | 'EXPORTACAO'
  tipoLpco: string
  orgaoAnuente: string
  modeloLpco: string
  paisProcedencia: string
  fundamentoLegal: string
  unidadeEntrada?: string
  recintoArmazenamento?: string
  condicaoMercadoria?: string
  importacaoExportadorId?: string
  exportacaoImportadorId?: string
  itens: Array<{
    ncm: string
    catalogoProdutoId?: string
    descricaoProduto: string
    fabricante?: string
    quantidadeEstatistica: number
    unidadeMedida: string
    pesoLiquido: number
    vmle: number
    moeda: string
    condicaoVenda?: string
    atributos?: Array<{ codigo: string; valor: string | number | boolean }>
  }>
}

// ── Adapter ──────────────────────────────────────────────────────────────────

export class PortalUnicoAdapter {
  private auth: PortalUnicoAuth
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
    this.auth = new PortalUnicoAuth(prisma)
  }

  private async getClient(tenantId: string, companyId: string): Promise<AxiosInstance> {
    const authResult = await this.auth.authenticate(tenantId, companyId)

    return axios.create({
      baseURL: PORTAL_BASE_URL,
      timeout: 60_000,
      headers: {
        Authorization: `Bearer ${authResult.token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
  }

  private getEndpointBase(tipoOperacao: string): string {
    return tipoOperacao === 'EXPORTACAO'
      ? '/portal/api/ext/lpco-exportacao'
      : '/portal/api/ext/lpco-importacao'
  }

  // ── Registrar LPCO ──────────────────────────────────────────────────────────

  async registrar(
    tenantId: string,
    companyId: string,
    tipoOperacao: string,
    payload: RegistrarLpcoPayload
  ): Promise<PortalLpcoRegistro> {
    const canWrite = await this.auth.canWrite(tenantId, companyId)
    if (!canWrite) {
      throw new AppError(
        'Credencial atual nao tem permissao de escrita no Portal Unico. Configure um certificado digital.',
        403,
        'PORTAL_NO_WRITE_ACCESS'
      )
    }

    const client = await this.getClient(tenantId, companyId)
    const endpoint = this.getEndpointBase(tipoOperacao)

    try {
      const response = await client.post(endpoint, payload)
      return response.data
    } catch (err) {
      throw this.handlePortalError(err, 'registrar LPCO')
    }
  }

  // ── Consultar LPCO por numero ───────────────────────────────────────────────

  async consultar(
    tenantId: string,
    companyId: string,
    tipoOperacao: string,
    numeroPortal: string
  ): Promise<PortalLpcoConsulta> {
    const client = await this.getClient(tenantId, companyId)
    const endpoint = `${this.getEndpointBase(tipoOperacao)}/${numeroPortal}`

    try {
      const response = await client.get(endpoint)
      return response.data
    } catch (err) {
      throw this.handlePortalError(err, 'consultar LPCO')
    }
  }

  // ── Retificar LPCO ─────────────────────────────────────────────────────────

  async retificar(
    tenantId: string,
    companyId: string,
    tipoOperacao: string,
    numeroPortal: string,
    payload: Partial<RegistrarLpcoPayload>
  ): Promise<PortalLpcoRegistro> {
    const canWrite = await this.auth.canWrite(tenantId, companyId)
    if (!canWrite) {
      throw new AppError('Credencial sem permissao de escrita', 403, 'PORTAL_NO_WRITE_ACCESS')
    }

    const client = await this.getClient(tenantId, companyId)
    const endpoint = `${this.getEndpointBase(tipoOperacao)}/${numeroPortal}`

    try {
      const response = await client.put(endpoint, payload)
      return response.data
    } catch (err) {
      throw this.handlePortalError(err, 'retificar LPCO')
    }
  }

  // ── Cancelar LPCO ──────────────────────────────────────────────────────────

  async cancelar(
    tenantId: string,
    companyId: string,
    tipoOperacao: string,
    numeroPortal: string,
    motivo: string
  ): Promise<{ sucesso: boolean }> {
    const canWrite = await this.auth.canWrite(tenantId, companyId)
    if (!canWrite) {
      throw new AppError('Credencial sem permissao de escrita', 403, 'PORTAL_NO_WRITE_ACCESS')
    }

    const client = await this.getClient(tenantId, companyId)
    const endpoint = `${this.getEndpointBase(tipoOperacao)}/${numeroPortal}/cancelamento`

    try {
      await client.patch(endpoint, { motivo })
      return { sucesso: true }
    } catch (err) {
      throw this.handlePortalError(err, 'cancelar LPCO')
    }
  }

  // ── Responder Exigencia ────────────────────────────────────────────────────

  async responderExigencia(
    tenantId: string,
    companyId: string,
    tipoOperacao: string,
    numeroPortal: string,
    exigenciaId: string,
    resposta: string
  ): Promise<{ sucesso: boolean }> {
    const canWrite = await this.auth.canWrite(tenantId, companyId)
    if (!canWrite) {
      throw new AppError('Credencial sem permissao de escrita', 403, 'PORTAL_NO_WRITE_ACCESS')
    }

    const client = await this.getClient(tenantId, companyId)
    const endpoint = `${this.getEndpointBase(tipoOperacao)}/${numeroPortal}/exigencia/${exigenciaId}/resposta`

    try {
      await client.post(endpoint, { textoResposta: resposta })
      return { sucesso: true }
    } catch (err) {
      throw this.handlePortalError(err, 'responder exigencia')
    }
  }

  // ── Anexar Documento ───────────────────────────────────────────────────────

  async anexarDocumento(
    tenantId: string,
    companyId: string,
    tipoOperacao: string,
    numeroPortal: string,
    nomeArquivo: string,
    tipoDocumento: string,
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<{ documentoId: string }> {
    const canWrite = await this.auth.canWrite(tenantId, companyId)
    if (!canWrite) {
      throw new AppError('Credencial sem permissao de escrita', 403, 'PORTAL_NO_WRITE_ACCESS')
    }

    const authResult = await this.auth.authenticate(tenantId, companyId)
    const endpoint = `${this.getEndpointBase(tipoOperacao)}/${numeroPortal}/anexo`

    const formData = new FormData()
    formData.append('arquivo', fileBuffer, {
      filename: nomeArquivo,
      contentType: mimeType,
    })
    formData.append('tipoDocumento', tipoDocumento)

    try {
      const response = await axios.post(`${PORTAL_BASE_URL}${endpoint}`, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${authResult.token}`,
        },
        timeout: 120_000,
        maxContentLength: 50 * 1024 * 1024,
      })
      return { documentoId: response.data?.id ?? response.data?.documentoId ?? '' }
    } catch (err) {
      throw this.handlePortalError(err, 'anexar documento')
    }
  }

  // ── Simular Tratamento Administrativo ──────────────────────────────────────

  async simularTA(
    tenantId: string,
    companyId: string,
    ncm: string,
    operacao: 'IMPORTACAO' | 'EXPORTACAO'
  ): Promise<PortalTratamentoAdm> {
    const client = await this.getClient(tenantId, companyId)
    const tipoEndpoint = operacao === 'EXPORTACAO' ? 'exportacao' : 'importacao'
    const endpoint = `/portal/api/ext/tratamento-administrativo/${tipoEndpoint}`

    try {
      const response = await client.get(endpoint, { params: { ncm } })
      return response.data
    } catch (err) {
      throw this.handlePortalError(err, 'simular tratamento administrativo')
    }
  }

  // ── Consultar Catalogo de Produtos ─────────────────────────────────────────

  async consultarCatalogo(
    tenantId: string,
    companyId: string,
    ncm: string
  ): Promise<Array<{ id: string; descricao: string; ncm: string }>> {
    const client = await this.getClient(tenantId, companyId)

    try {
      const response = await client.get('/portal/api/ext/catalogo-produtos', {
        params: { ncm },
      })
      return response.data?.produtos ?? response.data ?? []
    } catch (err) {
      throw this.handlePortalError(err, 'consultar catalogo de produtos')
    }
  }

  // ── Error Handler ──────────────────────────────────────────────────────────

  private handlePortalError(err: unknown, operacao: string): AppError {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status ?? 502
      const data = err.response?.data
      const portalMsg = data?.mensagem ?? data?.message ?? data?.error ?? err.message

      // Mapear erros HTTP do Portal para AppError
      if (status === 401 || status === 403) {
        return new AppError(
          `Portal Unico: autenticacao falhou ao ${operacao} — ${portalMsg}`,
          502,
          'PORTAL_AUTH_ERROR'
        )
      }
      if (status === 404) {
        return new AppError(
          `Portal Unico: recurso nao encontrado ao ${operacao}`,
          404,
          'PORTAL_NOT_FOUND'
        )
      }
      if (status === 422) {
        return new AppError(
          `Portal Unico: dados invalidos ao ${operacao} — ${portalMsg}`,
          422,
          'PORTAL_VALIDATION_ERROR'
        )
      }
      if (status >= 500) {
        return new AppError(
          `Portal Unico indisponivel ao ${operacao} — ${portalMsg}`,
          502,
          'PORTAL_UNAVAILABLE'
        )
      }
      if (err.code === 'ECONNABORTED') {
        return new AppError(
          `Timeout ao ${operacao} no Portal Unico`,
          504,
          'PORTAL_TIMEOUT'
        )
      }

      return new AppError(
        `Erro ao ${operacao} no Portal Unico: ${portalMsg}`,
        status >= 400 && status < 600 ? status : 502,
        'PORTAL_ERROR'
      )
    }

    return new AppError(
      `Erro inesperado ao ${operacao}: ${err instanceof Error ? err.message : 'desconhecido'}`,
      500,
      'PORTAL_UNEXPECTED_ERROR'
    )
  }
}
