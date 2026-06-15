/**
 * Download da planilha modelo — paridade Pedido importacoes-inteligentes/template.
 * Link `<a download>` no browser não envia JWT; proxy injeta x-chave-interna-servico.
 */
import type { Request, Response, NextFunction } from 'express'
import { gerarBufferTemplateXlsxGravity } from '../../../shared/gerar-template-xlsx-importacao-bid-frete-internacional.js'
import { formatarRotuloCodigoNomeImportacao } from '../../../shared/rotulo-cadastro-importacao-bid-frete-internacional.js'
import {
  listaAeroportosCadastroResponseSchema,
  listaContainersCadastroResponseSchema,
  listaPaisesCadastroResponseSchema,
  listaPortosCadastroResponseSchema,
} from '../../../shared/schemas-cadastros-template-importacao-bid-frete-internacional.js'
import {
  MOEDAS_PADRAO_TEMPLATE_BID,
  listasCadastrosPadraoTemplateBid,
  type ListasCadastrosTemplateBid,
} from '../../../shared/template-importacao-config-bid-frete-internacional.js'

const ROTULOS_TIPO_CONTAINER: Record<string, string> = {
  DRY: 'Dry',
  REEFER: 'Reefer',
  OPEN_TOP: 'Open Top',
  FLAT_RACK: 'Flat Rack',
  TANK: 'Tank',
  BULK: 'Bulk',
  PLATAFORMA: 'Plataforma',
}

function rotuloContainerCadastro(container: {
  tipo_container: string
  tamanho_container: string
  armador_dono_container: string | null
}): string {
  const tipo = ROTULOS_TIPO_CONTAINER[container.tipo_container] ?? container.tipo_container
  const partes = [tipo, container.tamanho_container].filter(Boolean)
  if (container.armador_dono_container) {
    partes.push(container.armador_dono_container)
  }
  return partes.join(' · ')
}

async function carregarListasCadastrosS2S(): Promise<ListasCadastrosTemplateBid> {
  const base = process.env.CADASTROS_URL ?? 'http://localhost:8031'
  const chave = process.env.CHAVE_INTERNA_SERVICO ?? ''
  const headers = { 'x-internal-key': chave, 'Content-Type': 'application/json' }

  const padrao = listasCadastrosPadraoTemplateBid()

  try {
    const [resPaises, resPortos, resAeroportos, resContainers] = await Promise.all([
      fetch(`${base}/api/v1/cadastros/paises?apenas_ativos=true`, { headers }),
      fetch(`${base}/api/v1/cadastros/portos?apenas_ativos=true&limit=500`, { headers }),
      fetch(`${base}/api/v1/cadastros/aeroportos?apenas_ativos=true&limit=500`, { headers }),
      fetch(`${base}/api/v1/cadastros/containers?apenas_ativos=true&limit=500`, { headers }),
    ])

    const paises = resPaises.ok
      ? listaPaisesCadastroResponseSchema.parse(await resPaises.json()).itens
      : []
    const portos = resPortos.ok
      ? listaPortosCadastroResponseSchema.parse(await resPortos.json()).itens
      : []
    const aeroportos = resAeroportos.ok
      ? listaAeroportosCadastroResponseSchema.parse(await resAeroportos.json()).itens
      : []
    const containers = resContainers.ok
      ? listaContainersCadastroResponseSchema.parse(await resContainers.json()).itens
      : []

    return {
      portos: portos
        .map(p => formatarRotuloCodigoNomeImportacao(p.codigo_unlocode_porto, p.nome_porto))
        .filter(Boolean),
      aeroportos: aeroportos
        .map(a => {
          const codigo = a.codigo_iata_aeroporto?.trim() || a.codigo_unlocode_aeroporto
          return formatarRotuloCodigoNomeImportacao(codigo, a.nome_aeroporto)
        })
        .filter(Boolean),
      paises: paises
        .map(p => formatarRotuloCodigoNomeImportacao(p.codigo_pais_iso_alpha2, p.nome_pais_portugues))
        .filter(Boolean),
      containers: containers
        .map(c => {
          const codigo = c.codigo_iso_container?.trim()
          if (!codigo) return ''
          return formatarRotuloCodigoNomeImportacao(codigo, rotuloContainerCadastro(c))
        })
        .filter(Boolean),
      moedas: [...MOEDAS_PADRAO_TEMPLATE_BID],
    }
  } catch (err) {
    console.warn(
      '[templateImportacaoBid] Cadastros offline — template sem listas dinâmicas',
      err instanceof Error ? err.message : err,
    )
    return padrao
  }
}

export async function templateImportacaoBidHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const listas = await carregarListasCadastrosS2S()
    const buf = await gerarBufferTemplateXlsxGravity(listas)
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="template-importacao-bid-frete.xlsx"',
    )
    res.send(Buffer.from(buf))
  } catch (err) {
    next(err)
  }
}
