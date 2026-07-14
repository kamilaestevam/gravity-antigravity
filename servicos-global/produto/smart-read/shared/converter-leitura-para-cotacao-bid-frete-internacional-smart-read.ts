/**
 * Converte LeituraSchema (snapshot Smart Read) → prefill do wizard Nova Cotação BID Frete.
 */
import {
  avaliarCamposFaltantesPrefillCotacaoBidFrete,
  resolverPassoInicialPrefillSmartRead,
  type TipoPassoInicialPrefillSmartRead,
} from '../../bid-frete-internacional/shared/regras-prefill-smart-read-cotacao-bid-frete-internacional.js'
import type {
  DetalheMapeamentoCampoSmartReadCotacaoBidFrete,
  DetalheMapeamentoSmartReadCotacaoBidFrete,
  PrefillFormularioCotacaoBidFreteSmartRead,
} from './conversao-leitura-cotacao-bid-frete-smart-read-schema.js'

export type LeituraParaConversaoCotacaoBidFrete = {
  id_leitura: string
  arquivos: Array<{
    resultado_extracao: Array<{
      tipo_documento: string | null
      dados: Record<string, unknown>
    }> | null
  }>
}

const INCOTERMS_VALIDOS = new Set([
  'EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP',
])

function lerCaminho(obj: Record<string, unknown>, segmentos: string[]): unknown {
  let atual: unknown = obj
  for (const seg of segmentos) {
    if (atual == null || typeof atual !== 'object') return undefined
    atual = (atual as Record<string, unknown>)[seg]
  }
  return atual
}

function valorCampo(dados: Record<string, unknown>, caminhos: string[]): string | null {
  for (const caminho of caminhos) {
    const segmentos = caminho.split('.')
    const bruto = lerCaminho(dados, segmentos)
    if (bruto == null) continue
    const texto = String(bruto).trim()
    if (texto.length > 0) return texto
  }
  return null
}

function valorNumero(dados: Record<string, unknown>, caminhos: string[]): number | null {
  const texto = valorCampo(dados, caminhos)
  if (texto == null) return null
  const normalizado = texto.replace(/[^\d.,-]/g, '').replace(',', '.')
  const n = Number(normalizado)
  return Number.isFinite(n) && n > 0 ? n : null
}

function normalizarIncoterm(valor: string | null): string | null {
  if (!valor) return null
  const inc = valor.trim().toUpperCase().slice(0, 3)
  return INCOTERMS_VALIDOS.has(inc) ? inc : null
}

function normalizarCodigoPorto(valor: string | null): string | null {
  if (!valor) return null
  const limpo = valor.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (limpo.length === 5) return limpo
  const match = valor.toUpperCase().match(/\b([A-Z]{5})\b/)
  return match?.[1] ?? null
}

function normalizarIata(valor: string | null): string | null {
  if (!valor) return null
  const match = valor.trim().toUpperCase().match(/\b([A-Z]{3})\b/)
  return match?.[1] ?? null
}

function extrairContainers(dados: Record<string, unknown>): string[] {
  const bruto = dados.containerNumbers
  if (Array.isArray(bruto)) {
    return bruto.map((c) => String(c).trim()).filter(Boolean)
  }
  const texto = valorCampo(dados, ['containerNumbers', 'containers[].number'])
  if (!texto) return []
  return texto.split(/[,;|/]+/).map((c) => c.trim()).filter(Boolean)
}

function extrairDescricaoMercadoria(dados: Record<string, unknown>): string | null {
  const direto = valorCampo(dados, [
    'goods.description',
    'merchandise.description',
    'description',
    'document.goodsDescription',
  ])
  if (direto) return direto.slice(0, 500)

  const itens = dados.items ?? dados.goods ?? dados.lineItems
  if (!Array.isArray(itens) || itens.length === 0) return null
  const partes: string[] = []
  for (const item of itens.slice(0, 5)) {
    if (item == null || typeof item !== 'object') continue
    const desc = valorCampo(item as Record<string, unknown>, [
      'description',
      'productDescription',
      'descriptions.portuguese',
    ])
    if (desc) partes.push(desc)
  }
  return partes.length > 0 ? partes.join('; ').slice(0, 500) : null
}

function registrarCampo(
  detalhe: DetalheMapeamentoCampoSmartReadCotacaoBidFrete[],
  params: DetalheMapeamentoCampoSmartReadCotacaoBidFrete,
): void {
  detalhe.push(params)
}

function aplicarCampoTexto(
  detalhe: DetalheMapeamentoCampoSmartReadCotacaoBidFrete[],
  dados: Record<string, unknown>,
  prefixo: string,
  caminhos: string[],
  campoDestino: keyof PrefillFormularioCotacaoBidFreteSmartRead,
  destino: PrefillFormularioCotacaoBidFreteSmartRead,
  sugerido = false,
): void {
  const valor = valorCampo(dados, caminhos)
  if (!valor) {
    registrarCampo(detalhe, {
      caminho_origem: `${prefixo}.{${caminhos.join('|')}}`,
      campo_destino: campoDestino,
      valor_origem: null,
      valor_destino: null,
      status_mapeamento: 'ignorado',
      motivo: 'ausente_na_leitura',
    })
    return
  }
  destino[campoDestino] = valor as never
  registrarCampo(detalhe, {
    caminho_origem: `${prefixo}.${caminhos[0]}`,
    campo_destino: campoDestino,
    valor_origem: valor,
    valor_destino: valor,
    status_mapeamento: sugerido ? 'sugerido' : 'mapeado',
  })
}

export type ResultadoConversaoLeituraCotacaoBidFrete = {
  prefill: PrefillFormularioCotacaoBidFreteSmartRead
  detalhe_mapeamento: DetalheMapeamentoSmartReadCotacaoBidFrete
  campos_faltantes: string[]
  iniciar_no_passo_fornecedores: boolean
}

export function converterLeituraParaCotacaoBidFreteInternacional(
  leitura: LeituraParaConversaoCotacaoBidFrete,
): ResultadoConversaoLeituraCotacaoBidFrete {
  const detalheCampos: DetalheMapeamentoCampoSmartReadCotacaoBidFrete[] = []
  const prefill: PrefillFormularioCotacaoBidFreteSmartRead = {}
  const camposFaltantes: string[] = []

  let dadosMesclados: Record<string, unknown> = {}
  leitura.arquivos.forEach((arquivo, idxArquivo) => {
    for (const doc of arquivo.resultado_extracao ?? []) {
      const dados = doc.dados ?? {}
      dadosMesclados = { ...dadosMesclados, ...dados }
      const prefixo = `arquivos[${idxArquivo}].dados`

      aplicarCampoTexto(detalheCampos, dados, prefixo, [
        'document.documentNumber',
        'document.number',
        'invoice.number',
      ], 'referencia_interna_cotacao_bid_frete_internacional', prefill)

      const incoterm = normalizarIncoterm(valorCampo(dados, ['document.incoterm', 'incoterm']))
      if (incoterm) {
        prefill.incoterm_cotacao_bid_frete_internacional = incoterm
        registrarCampo(detalheCampos, {
          caminho_origem: `${prefixo}.document.incoterm`,
          campo_destino: 'incoterm_cotacao_bid_frete_internacional',
          valor_origem: incoterm,
          valor_destino: incoterm,
          status_mapeamento: 'mapeado',
        })
      }

      const descricao = extrairDescricaoMercadoria(dados)
      if (descricao) {
        prefill.descricao_mercadoria_cotacao_bid_frete_internacional = descricao
        registrarCampo(detalheCampos, {
          caminho_origem: `${prefixo}.items[].description`,
          campo_destino: 'descricao_mercadoria_cotacao_bid_frete_internacional',
          valor_origem: descricao,
          valor_destino: descricao,
          status_mapeamento: 'mapeado',
        })
      }

      const ncm = valorCampo(dados, ['items[].ncm', 'items[].hsCode', 'ncm', 'hsCode'])
      if (ncm) {
        prefill.ncm_cotacao_bid_frete_internacional = ncm.replace(/\D/g, '').slice(0, 8)
        registrarCampo(detalheCampos, {
          caminho_origem: `${prefixo}.items[].ncm`,
          campo_destino: 'ncm_cotacao_bid_frete_internacional',
          valor_origem: ncm,
          valor_destino: prefill.ncm_cotacao_bid_frete_internacional,
          status_mapeamento: 'mapeado',
        })
      }

      const peso = valorNumero(dados, [
        'totals.grossWeight',
        'totalGrossWeight',
        'weights.gross',
        'grossWeight',
      ])
      if (peso != null) {
        prefill.peso_kg_cotacao_bid_frete_internacional = String(Math.round(peso))
        registrarCampo(detalheCampos, {
          caminho_origem: `${prefixo}.totals.grossWeight`,
          campo_destino: 'peso_kg_cotacao_bid_frete_internacional',
          valor_origem: peso,
          valor_destino: prefill.peso_kg_cotacao_bid_frete_internacional,
          status_mapeamento: 'mapeado',
        })
      }

      const cubagem = valorNumero(dados, ['totals.volume', 'totalVolume', 'volumeM3', 'cbm'])
      if (cubagem != null) {
        prefill.cubagem_m3_cotacao_bid_frete_internacional = String(cubagem)
        registrarCampo(detalheCampos, {
          caminho_origem: `${prefixo}.totals.volume`,
          campo_destino: 'cubagem_m3_cotacao_bid_frete_internacional',
          valor_origem: cubagem,
          valor_destino: prefill.cubagem_m3_cotacao_bid_frete_internacional,
          status_mapeamento: 'mapeado',
        })
      }

      const portoOrigem = normalizarCodigoPorto(valorCampo(dados, [
        'shipmentDetails.origin.portCode',
        'shipmentDetails.origin.port',
        'document.portOfLoading',
        'loadingPort',
        'portOfLoading',
      ]))
      if (portoOrigem) {
        prefill.porto_origem_cotacao_bid_frete_internacional = portoOrigem
        registrarCampo(detalheCampos, {
          caminho_origem: `${prefixo}.shipmentDetails.origin.port`,
          campo_destino: 'porto_origem_cotacao_bid_frete_internacional',
          valor_origem: portoOrigem,
          valor_destino: portoOrigem,
          status_mapeamento: 'mapeado',
        })
      }

      const portoDestino = normalizarCodigoPorto(valorCampo(dados, [
        'shipmentDetails.destination.portCode',
        'shipmentDetails.destination.port',
        'document.portOfDischarge',
        'dischargePort',
        'portOfDischarge',
      ]))
      if (portoDestino) {
        prefill.porto_destino_cotacao_bid_frete_internacional = portoDestino
        registrarCampo(detalheCampos, {
          caminho_origem: `${prefixo}.shipmentDetails.destination.port`,
          campo_destino: 'porto_destino_cotacao_bid_frete_internacional',
          valor_origem: portoDestino,
          valor_destino: portoDestino,
          status_mapeamento: 'mapeado',
        })
      }

      const aeroportoOrigem = normalizarIata(valorCampo(dados, [
        'shipmentDetails.origin.airport',
        'originAirport',
      ]))
      if (aeroportoOrigem) {
        prefill.aeroporto_origem_cotacao_bid_frete_internacional = aeroportoOrigem
        registrarCampo(detalheCampos, {
          caminho_origem: `${prefixo}.shipmentDetails.origin.airport`,
          campo_destino: 'aeroporto_origem_cotacao_bid_frete_internacional',
          valor_origem: aeroportoOrigem,
          valor_destino: aeroportoOrigem,
          status_mapeamento: 'mapeado',
        })
      }

      const aeroportoDestino = normalizarIata(valorCampo(dados, [
        'shipmentDetails.destination.airport',
        'destinationAirport',
      ]))
      if (aeroportoDestino) {
        prefill.aeroporto_destino_cotacao_bid_frete_internacional = aeroportoDestino
        registrarCampo(detalheCampos, {
          caminho_origem: `${prefixo}.shipmentDetails.destination.airport`,
          campo_destino: 'aeroporto_destino_cotacao_bid_frete_internacional',
          valor_origem: aeroportoDestino,
          valor_destino: aeroportoDestino,
          status_mapeamento: 'mapeado',
        })
      }

      const paisOrigem = valorCampo(dados, ['document.originCountry', 'originCountry', 'exporter.country'])
      if (paisOrigem) {
        prefill.origem_pais_cotacao_bid_frete_internacional = paisOrigem.slice(0, 2).toUpperCase()
        registrarCampo(detalheCampos, {
          caminho_origem: `${prefixo}.document.originCountry`,
          campo_destino: 'origem_pais_cotacao_bid_frete_internacional',
          valor_origem: paisOrigem,
          valor_destino: prefill.origem_pais_cotacao_bid_frete_internacional,
          status_mapeamento: 'mapeado',
        })
      }
    }
  })

  const containers = extrairContainers(dadosMesclados)
  const modalTransporte = valorCampo(dadosMesclados, ['shipmentDetails.transportMode', 'shipment.modal'])
  const temAeroporto = Boolean(
    prefill.aeroporto_origem_cotacao_bid_frete_internacional
    || prefill.aeroporto_destino_cotacao_bid_frete_internacional,
  )
  const temPorto = Boolean(
    prefill.porto_origem_cotacao_bid_frete_internacional
    || prefill.porto_destino_cotacao_bid_frete_internacional,
  )

  if (modalTransporte && /AIR|AEREO/i.test(modalTransporte)) {
    prefill.modal_cotacao_bid_frete_internacional = 'AEREO'
    prefill.modalidade_cotacao_bid_frete_internacional = 'AEREO_GERAL'
    registrarCampo(detalheCampos, {
      caminho_origem: 'shipmentDetails.transportMode',
      campo_destino: 'modal_cotacao_bid_frete_internacional',
      valor_origem: modalTransporte,
      valor_destino: 'AEREO',
      status_mapeamento: 'mapeado',
    })
  } else if (containers.length > 0 || temPorto || (modalTransporte && /SEA|MARITIM|OCEAN/i.test(modalTransporte))) {
    prefill.modal_cotacao_bid_frete_internacional = 'MARITIMO'
    prefill.modalidade_cotacao_bid_frete_internacional = containers.length > 0 ? 'FCL' : 'LCL'
    registrarCampo(detalheCampos, {
      caminho_origem: containers.length > 0 ? 'containerNumbers' : 'shipmentDetails.transportMode',
      campo_destino: 'modal_cotacao_bid_frete_internacional',
      valor_origem: containers.length > 0 ? containers.join(', ') : modalTransporte,
      valor_destino: 'MARITIMO',
      status_mapeamento: containers.length > 0 ? 'mapeado' : 'sugerido',
      motivo: containers.length > 0 ? undefined : 'inferido_por_porto_ou_modal',
    })
  } else if (temAeroporto) {
    prefill.modal_cotacao_bid_frete_internacional = 'AEREO'
    prefill.modalidade_cotacao_bid_frete_internacional = 'AEREO_GERAL'
    registrarCampo(detalheCampos, {
      caminho_origem: 'shipmentDetails.origin.airport',
      campo_destino: 'modal_cotacao_bid_frete_internacional',
      valor_origem: 'aeroportos',
      valor_destino: 'AEREO',
      status_mapeamento: 'sugerido',
      motivo: 'inferido_por_aeroporto',
    })
  } else {
    prefill.modal_cotacao_bid_frete_internacional = 'MARITIMO'
    prefill.modalidade_cotacao_bid_frete_internacional = 'LCL'
    registrarCampo(detalheCampos, {
      caminho_origem: '—',
      campo_destino: 'modal_cotacao_bid_frete_internacional',
      valor_origem: null,
      valor_destino: 'MARITIMO',
      status_mapeamento: 'sugerido',
      motivo: 'padrao_maritimo_lcl',
    })
  }

  prefill.tipo_operacao_cotacao_bid_frete_internacional = 'IMPORTACAO'
  registrarCampo(detalheCampos, {
    caminho_origem: '—',
    campo_destino: 'tipo_operacao_cotacao_bid_frete_internacional',
    valor_origem: null,
    valor_destino: 'IMPORTACAO',
    status_mapeamento: 'sugerido',
    motivo: 'padrao_importacao',
  })

  if (containers.length > 0) {
    prefill.quantidade_volume_cotacao_bid_frete_internacional = containers.length
    const tipoContainer = valorCampo(dadosMesclados, [
      'containerType',
      'containers[].type',
      'containers[].containerType',
    ])
    prefill.tipo_container_cotacao_bid_frete_internacional = tipoContainer ?? '22G1'
    registrarCampo(detalheCampos, {
      caminho_origem: 'containerNumbers',
      campo_destino: 'quantidade_volume_cotacao_bid_frete_internacional',
      valor_origem: containers.length,
      valor_destino: containers.length,
      status_mapeamento: 'mapeado',
    })
  } else {
    const volumes = valorNumero(dadosMesclados, ['totals.packages', 'totalPackages', 'numberOfPackages'])
    prefill.quantidade_volume_cotacao_bid_frete_internacional = volumes != null ? Math.round(volumes) : 1
    registrarCampo(detalheCampos, {
      caminho_origem: 'totals.packages',
      campo_destino: 'quantidade_volume_cotacao_bid_frete_internacional',
      valor_origem: volumes,
      valor_destino: prefill.quantidade_volume_cotacao_bid_frete_internacional,
      status_mapeamento: volumes != null ? 'mapeado' : 'sugerido',
      motivo: volumes == null ? 'padrao_1_volume' : undefined,
    })
  }

  if (prefill.modal_cotacao_bid_frete_internacional === 'MARITIMO'
    && prefill.modalidade_cotacao_bid_frete_internacional === 'LCL') {
    prefill.opcao_incluir_armazenagem_cotacao = 'nao'
    registrarCampo(detalheCampos, {
      caminho_origem: '—',
      campo_destino: 'opcao_incluir_armazenagem_cotacao',
      valor_origem: null,
      valor_destino: 'nao',
      status_mapeamento: 'sugerido',
      motivo: 'padrao_sem_armazenagem',
    })
  }

  const camposFaltantesRegras = avaliarCamposFaltantesPrefillCotacaoBidFrete(prefill)
  for (const rotulo of camposFaltantesRegras) {
    if (!camposFaltantes.includes(rotulo)) camposFaltantes.push(rotulo)
  }

  const passo_inicial_tipo: TipoPassoInicialPrefillSmartRead = resolverPassoInicialPrefillSmartRead(prefill)

  return {
    prefill,
    detalhe_mapeamento: { campos: detalheCampos, versao_contrato: 1 },
    campos_faltantes: [...new Set(camposFaltantes)],
    passo_inicial_tipo,
    iniciar_no_passo_fornecedores: passo_inicial_tipo === 'fornecedores',
  }
}

export const ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE: Record<string, string> = {
  referencia_interna_cotacao_bid_frete_internacional: 'Referência interna',
  tipo_operacao_cotacao_bid_frete_internacional: 'Operação',
  modal_cotacao_bid_frete_internacional: 'Modal',
  modalidade_cotacao_bid_frete_internacional: 'Modalidade',
  porto_origem_cotacao_bid_frete_internacional: 'Porto origem',
  porto_destino_cotacao_bid_frete_internacional: 'Porto destino',
  aeroporto_origem_cotacao_bid_frete_internacional: 'Aeroporto origem',
  aeroporto_destino_cotacao_bid_frete_internacional: 'Aeroporto destino',
  origem_pais_cotacao_bid_frete_internacional: 'País origem',
  destino_pais_cotacao_bid_frete_internacional: 'País destino',
  descricao_mercadoria_cotacao_bid_frete_internacional: 'Mercadoria',
  ncm_cotacao_bid_frete_internacional: 'NCM',
  quantidade_volume_cotacao_bid_frete_internacional: 'Volumes',
  tipo_container_cotacao_bid_frete_internacional: 'Tipo container',
  peso_kg_cotacao_bid_frete_internacional: 'Peso (kg)',
  cubagem_m3_cotacao_bid_frete_internacional: 'Cubagem (m³)',
  incoterm_cotacao_bid_frete_internacional: 'Incoterm',
  opcao_incluir_armazenagem_cotacao: 'Armazenagem LCL',
}
