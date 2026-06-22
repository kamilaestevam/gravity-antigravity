/**
 * Monta lista de transacoes: legado (primario) + progresso Gravity (complemento).
 */
import type { PrismaClient } from '../generated/client/index.js'
import { listarLeiturasLegado, obterLeituraLegado } from './cliente-legado-smart-read.js'
import {
  extrairItensListaLegado,
  extrairTotalListaLegado,
  normalizarTransacaoDeItemListaLegado,
  normalizarTransacaoDeLeitura,
} from './normalizar-transacao-leitura-smart-read.js'
import { extrairDadosSessaoProgressoLeitura } from '../schemas/progresso-leitura-smart-read.js'
import { normalizarLeitura, type TransacaoLeitura } from '../schemas/leitura-smart-read.js'

export type ParametrosListaLeituras = {
  companyId: string
  pagina: number
  limite: number
  termo_busca?: string
  prisma?: PrismaClient
  idUsuario?: string
}

function filtrarPorTermo(transacoes: TransacaoLeitura[], termo?: string): TransacaoLeitura[] {
  const busca = termo?.trim().toLowerCase()
  if (!busca) return transacoes
  return transacoes.filter((item) => {
    const nome = (item.nome_leitura ?? item.nome_arquivo ?? item.id_leitura).toLowerCase()
    return nome.includes(busca)
  })
}

async function listarViaProgressoGravity(
  prisma: PrismaClient | undefined,
  idUsuario: string | undefined,
): Promise<TransacaoLeitura[]> {
  if (!prisma || !idUsuario) return []

  const registros = await prisma.progressoLeituraSmartRead.findMany({
    where: { id_usuario: idUsuario },
    orderBy: { data_atualizacao_progresso_leitura_smart_read: 'desc' },
    take: 200,
  })

  const transacoes: TransacaoLeitura[] = []
  for (const registro of registros) {
    const sessao = extrairDadosSessaoProgressoLeitura(registro.dados_sessao_progresso_leitura_smart_read)
    if (sessao?.leitura) {
      transacoes.push(
        normalizarTransacaoDeLeitura(sessao.leitura, {
          data_envio: registro.data_criacao_progresso_leitura_smart_read.toISOString(),
        }),
      )
    }
  }
  return transacoes
}

export async function montarListaTransacoesLeituraSmartRead(
  params: ParametrosListaLeituras,
): Promise<{ transacoes: TransacaoLeitura[]; total: number }> {
  let transacoesLegado: TransacaoLeitura[] = []
  let totalLegado = 0
  let legadoIndisponivel = false

  try {
    const bruto = await listarLeiturasLegado(params.companyId, {
      pagina: params.pagina,
      limite: params.limite,
      termo_busca: params.termo_busca,
    })
    const itens = extrairItensListaLegado(bruto)
    transacoesLegado = itens.map(normalizarTransacaoDeItemListaLegado)
    totalLegado = extrairTotalListaLegado(bruto, transacoesLegado.length)
  } catch (erro) {
    legadoIndisponivel = true
    console.warn(
      '[smart-read][lista] legado /list indisponivel — complementando via progresso Gravity',
      erro instanceof Error ? erro.message : erro,
    )
  }

  const viaProgresso = await listarViaProgressoGravity(params.prisma, params.idUsuario)

  const mapa = new Map<string, TransacaoLeitura>()
  for (const item of [...transacoesLegado, ...viaProgresso]) {
    mapa.set(item.id_leitura, item)
  }

  let transacoes = [...mapa.values()].sort((a, b) =>
    (b.data_envio ?? '').localeCompare(a.data_envio ?? ''),
  )
  transacoes = filtrarPorTermo(transacoes, params.termo_busca)

  const total = legadoIndisponivel && transacoesLegado.length === 0 ? transacoes.length : Math.max(totalLegado, transacoes.length)

  const inicio = (params.pagina - 1) * params.limite
  return {
    transacoes: transacoes.slice(inicio, inicio + params.limite),
    total,
  }
}

export async function enriquecerTransacaoViaLegado(
  companyId: string,
  idLeitura: string,
  base?: TransacaoLeitura,
): Promise<TransacaoLeitura> {
  try {
    const legado = await obterLeituraLegado(companyId, idLeitura)
    const leitura = normalizarLeitura(legado)
    return normalizarTransacaoDeLeitura(leitura, {
      data_envio: base?.data_envio ?? legado.createdAt ?? null,
      origem_leitura: base?.origem_leitura,
    })
  } catch {
    return base ?? normalizarTransacaoDeLeitura({
      id_leitura: idLeitura,
      nome_leitura: null,
      status_leitura: 'PROCESSING',
      total_arquivos: 0,
      arquivos_processados: 0,
      arquivos: [],
    })
  }
}
