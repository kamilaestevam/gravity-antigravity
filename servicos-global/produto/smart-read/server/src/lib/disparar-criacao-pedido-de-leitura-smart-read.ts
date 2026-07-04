/**
 * Orquestração BFF Smart Read: chama Pedido S2S e persiste conversão local.
 */
import {
  CriarPedidoDeLeituraSmartReadRespostaSchema,
  type CriarPedidoDeLeituraSmartReadRequest,
} from '../../../shared/conversao-leitura-pedido-smart-read-schema.js'
import { AppError } from '../lib/app-error.js'
import type { PrismaClient } from '../generated/client/index.js'
import {
  conversaoExistentePorLeitura,
  persistirConversaoLeituraPedidoSmartRead,
} from './persistir-conversao-leitura-pedido-smart-read.js'

const PEDIDO_SERVICE_URL = process.env.PEDIDO_SERVICE_URL ?? 'http://127.0.0.1:8030'

export async function dispararCriacaoPedidoDeLeituraSmartRead(params: {
  prisma: PrismaClient
  idOrganizacao: string
  idUsuario: string
  idWorkspace: string
  nomeUsuario?: string
  body: CriarPedidoDeLeituraSmartReadRequest
}) {
  const existente = await conversaoExistentePorLeitura({
    prisma: params.prisma,
    idOrganizacao: params.idOrganizacao,
    idLeitura: params.body.id_leitura,
  })
  if (existente) {
    throw new AppError('Leitura ja convertida em pedido', 409, 'LEITURA_JA_CONVERTIDA')
  }

  const chave = process.env.CHAVE_INTERNA_SERVICO
  if (!chave) {
    throw new AppError('CHAVE_INTERNA_SERVICO nao configurada', 500, 'CONFIG_AUSENTE')
  }

  const response = await fetch(`${PEDIDO_SERVICE_URL}/api/v1/pedidos/importacoes-smart-read/criar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-chave-interna-servico': chave,
      'x-id-organizacao': params.idOrganizacao,
      'x-id-usuario': params.idUsuario,
      'x-id-workspace': params.idWorkspace,
      'x-nome-usuario': params.nomeUsuario ?? params.idUsuario,
    },
    body: JSON.stringify(params.body),
    signal: AbortSignal.timeout(120_000),
  })

  if (!response.ok) {
    const texto = await response.text().catch(() => '')
    throw new AppError(
      `Pedido indisponivel (${response.status}): ${texto.slice(0, 300)}`,
      response.status >= 500 ? 502 : response.status,
      'PEDIDO_CONVERSAO_FALHOU',
    )
  }

  const raw: unknown = await response.json()
  const resultado = CriarPedidoDeLeituraSmartReadRespostaSchema.parse(raw)

  await persistirConversaoLeituraPedidoSmartRead({
    prisma: params.prisma,
    idOrganizacao: params.idOrganizacao,
    idUsuario: params.idUsuario,
    idWorkspace: params.idWorkspace,
    dados: {
      id_leitura_legado: resultado.id_leitura,
      id_snapshot_leitura_smart_read: resultado.id_snapshot_leitura_smart_read,
      id_pedido: resultado.id_pedido,
      ids_pedido_item: resultado.ids_itens,
      status_conversao:
        resultado.pedidos_criados && resultado.pedidos_criados.length > 1 ? 'parcial' : 'sucesso',
      detalhe_mapeamento: resultado.detalhe_mapeamento,
    },
  })

  return resultado
}
