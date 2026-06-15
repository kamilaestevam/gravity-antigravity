/**
 * Validação estruturada para preview Smart Import — paridade Pedido EtapaPreview.
 */
import {
  resolverCodigoDestinoImportacao,
  resolverCodigoOrigemImportacao,
  rotuloCampoImportacaoBid,
} from './campos-importacao-bid-frete-internacional'
import type { CampoImportacaoBidFreteInternacional, LinhaImportacaoBidFreteInternacional } from './tipos-importacao-bid-frete-internacional'
import { linhaImportacaoParaCamposRotaModal } from './montar-payload-criacao-cotacao-importacao-bid-frete-internacional'
import { prepararCamposRotaCotacaoPersistencia, type ContextoCatalogoRota } from './rota-cotacao-bid-frete-internacional'
import { validarLinhaImportacaoBidFreteInternacional } from './validar-linha-importacao-bid-frete-internacional'
import { validarPayloadCriacaoCotacaoImportacaoBidFreteInternacional } from './validar-payload-criacao-cotacao-importacao-bid-frete-internacional'

export interface AlertaPreviewImportacaoBid {
  campo: string
  mensagem: string
  nivel: 'erro' | 'aviso'
}

export interface LinhaPreviewImportacaoBid {
  linha_arquivo: number
  status: 'ok' | 'aviso' | 'erro'
  titulo: string
  dados: LinhaImportacaoBidFreteInternacional
  alertas: AlertaPreviewImportacaoBid[]
}

const ERRO_PARA_CAMPO: Record<string, CampoImportacaoBidFreteInternacional> = {
  'tipo_operacao obrigatorio': 'tipo_operacao_cotacao_bid_frete_internacional',
  'tipo_operacao invalido': 'tipo_operacao_cotacao_bid_frete_internacional',
  'modal obrigatorio': 'modal_cotacao_bid_frete_internacional',
  'modal invalido': 'modal_cotacao_bid_frete_internacional',
  'mercadoria obrigatoria': 'descricao_mercadoria_cotacao_bid_frete_internacional',
  'incoterm obrigatorio': 'incoterm_cotacao_bid_frete_internacional',
  'incoterm invalido': 'incoterm_cotacao_bid_frete_internacional',
  'quantidade_volume invalida': 'quantidade_volume_cotacao_bid_frete_internacional',
  'porto_origem obrigatorio': 'porto_origem_cotacao_bid_frete_internacional',
  'porto_destino obrigatorio': 'porto_destino_cotacao_bid_frete_internacional',
  'aeroporto_origem obrigatorio': 'aeroporto_origem_cotacao_bid_frete_internacional',
  'aeroporto_destino obrigatorio': 'aeroporto_destino_cotacao_bid_frete_internacional',
  'origem rodoviaria obrigatoria': 'endereco_origem_cotacao_bid_frete_internacional',
  'destino rodoviario obrigatorio': 'endereco_destino_cotacao_bid_frete_internacional',
  'origem obrigatoria': 'porto_origem_cotacao_bid_frete_internacional',
  'destino obrigatorio': 'porto_destino_cotacao_bid_frete_internacional',
  'origem_pais obrigatorio': 'origem_pais_cotacao_bid_frete_internacional',
  'destino_pais obrigatorio': 'destino_pais_cotacao_bid_frete_internacional',
  'modalidade obrigatoria': 'modalidade_cotacao_bid_frete_internacional',
  'modalidade invalida': 'modalidade_cotacao_bid_frete_internacional',
  'porto_origem invalido': 'porto_origem_cotacao_bid_frete_internacional',
  'porto_destino invalido': 'porto_destino_cotacao_bid_frete_internacional',
  'porto_origem ambiguo': 'porto_origem_cotacao_bid_frete_internacional',
  'porto_destino ambiguo': 'porto_destino_cotacao_bid_frete_internacional',
  'aeroporto_origem invalido': 'aeroporto_origem_cotacao_bid_frete_internacional',
  'aeroporto_destino invalido': 'aeroporto_destino_cotacao_bid_frete_internacional',
  'aeroporto_origem ambiguo': 'aeroporto_origem_cotacao_bid_frete_internacional',
  'aeroporto_destino ambiguo': 'aeroporto_destino_cotacao_bid_frete_internacional',
}

const MENSAGEM_ERRO: Record<string, string> = {
  'tipo_operacao obrigatorio': 'Operação é obrigatória',
  'tipo_operacao invalido': 'Operação inválida (use Importação ou Exportação)',
  'modal obrigatorio': 'Modal é obrigatório',
  'modal invalido': 'Modal inválido (Marítimo, Aéreo ou Rodoviário)',
  'mercadoria obrigatoria': 'Descrição da mercadoria é obrigatória',
  'incoterm obrigatorio': 'Incoterm é obrigatório',
  'incoterm invalido': 'Incoterm inválido',
  'quantidade_volume invalida': 'Quantidade de volumes deve ser maior que zero',
  'porto_origem obrigatorio': 'Porto de origem é obrigatório para modal marítimo',
  'porto_destino obrigatorio': 'Porto de destino é obrigatório para modal marítimo',
  'aeroporto_origem obrigatorio': 'Aeroporto de origem é obrigatório para modal aéreo',
  'aeroporto_destino obrigatorio': 'Aeroporto de destino é obrigatório para modal aéreo',
  'origem rodoviaria obrigatoria': 'Endereço de origem é obrigatório para modal rodoviário',
  'destino rodoviario obrigatorio': 'Endereço de destino é obrigatório para modal rodoviário',
  'origem obrigatoria': 'Origem é obrigatória',
  'destino obrigatorio': 'Destino é obrigatório',
  'origem_pais obrigatorio': 'País de origem é obrigatório',
  'destino_pais obrigatorio': 'País de destino é obrigatório',
  'modalidade obrigatoria': 'Modalidade é obrigatória (FCL, LCL, FTL, LTL ou Aéreo Geral)',
  'modalidade invalida': 'Modalidade inválida para o modal selecionado',
  'porto_origem invalido': 'Porto de origem não reconhecido — use UN/LOCODE ou selecione da lista (ex: CNSHA — Shanghai)',
  'porto_destino invalido': 'Porto de destino não reconhecido — use UN/LOCODE ou selecione da lista (ex: BRSSZ — Santos)',
  'porto_origem ambiguo': 'Porto de origem ambíguo — informe o código UN/LOCODE completo',
  'porto_destino ambiguo': 'Porto de destino ambíguo — informe o código UN/LOCODE completo',
  'aeroporto_origem invalido': 'Aeroporto de origem não reconhecido — use código IATA ou selecione da lista',
  'aeroporto_destino invalido': 'Aeroporto de destino não reconhecido — use código IATA ou selecione da lista',
  'aeroporto_origem ambiguo': 'Aeroporto de origem ambíguo — informe o código IATA completo',
  'aeroporto_destino ambiguo': 'Aeroporto de destino ambíguo — informe o código IATA completo',
}

function coletarAvisos(row: LinhaImportacaoBidFreteInternacional): AlertaPreviewImportacaoBid[] {
  const avisos: AlertaPreviewImportacaoBid[] = []
  const modal = row.modal_cotacao_bid_frete_internacional?.trim().toUpperCase() ?? ''

  if (!row.peso_kg_cotacao_bid_frete_internacional?.trim()) {
    avisos.push({
      campo: 'peso_kg_cotacao_bid_frete_internacional',
      mensagem: `${rotuloCampoImportacaoBid('peso_kg_cotacao_bid_frete_internacional')}: recomendado informar peso`,
      nivel: 'aviso',
    })
  }

  if (!row.cubagem_m3_cotacao_bid_frete_internacional?.trim() && modal === 'MARITIMO') {
    avisos.push({
      campo: 'cubagem_m3_cotacao_bid_frete_internacional',
      mensagem: `${rotuloCampoImportacaoBid('cubagem_m3_cotacao_bid_frete_internacional')}: recomendado para frete marítimo`,
      nivel: 'aviso',
    })
  }

  if (!row.data_limite_resposta_cotacao_bid_frete_internacional?.trim()) {
    avisos.push({
      campo: 'data_limite_resposta_cotacao_bid_frete_internacional',
      mensagem: `${rotuloCampoImportacaoBid('data_limite_resposta_cotacao_bid_frete_internacional')}: prazo de resposta não informado`,
      nivel: 'aviso',
    })
  }

  return avisos
}

function errosParaAlertas(codigos: string[]): AlertaPreviewImportacaoBid[] {
  return codigos.map(codigo => {
    const campo = ERRO_PARA_CAMPO[codigo] ?? 'descricao_mercadoria_cotacao_bid_frete_internacional'
    const rotulo = rotuloCampoImportacaoBid(campo)
    const msgBase = MENSAGEM_ERRO[codigo] ?? codigo
    return {
      campo,
      mensagem: msgBase.includes(rotulo) ? msgBase : `${rotulo}: ${msgBase}`,
      nivel: 'erro' as const,
    }
  })
}

function tituloLinhaPreview(row: LinhaImportacaoBidFreteInternacional, linha: number): string {
  const ref = row.referencia_interna_cotacao_bid_frete_internacional?.trim()
  if (ref) return ref

  const origem = resolverCodigoOrigemImportacao(row) || row.origem_nome_cotacao_bid_frete_internacional?.trim()
  const destino = resolverCodigoDestinoImportacao(row) || row.destino_nome_cotacao_bid_frete_internacional?.trim()
  if (origem && destino) return `${origem} → ${destino}`

  const merc = row.descricao_mercadoria_cotacao_bid_frete_internacional?.trim()
  if (merc) return merc.length > 48 ? `${merc.slice(0, 48)}…` : merc

  return `Linha ${linha}`
}

function calcularStatus(alertas: AlertaPreviewImportacaoBid[]): 'ok' | 'aviso' | 'erro' {
  if (alertas.some(a => a.nivel === 'erro')) return 'erro'
  if (alertas.some(a => a.nivel === 'aviso')) return 'aviso'
  return 'ok'
}

function enriquecerDadosPreviewComRota(
  row: LinhaImportacaoBidFreteInternacional,
  ctx: ContextoCatalogoRota,
): LinhaImportacaoBidFreteInternacional {
  const rota = prepararCamposRotaCotacaoPersistencia(linhaImportacaoParaCamposRotaModal(row), ctx)
  return {
    ...row,
    porto_origem_cotacao_bid_frete_internacional:
      rota.porto_origem_cotacao_bid_frete_internacional ?? row.porto_origem_cotacao_bid_frete_internacional,
    porto_destino_cotacao_bid_frete_internacional:
      rota.porto_destino_cotacao_bid_frete_internacional ?? row.porto_destino_cotacao_bid_frete_internacional,
    aeroporto_origem_cotacao_bid_frete_internacional:
      rota.aeroporto_origem_cotacao_bid_frete_internacional ?? row.aeroporto_origem_cotacao_bid_frete_internacional,
    aeroporto_destino_cotacao_bid_frete_internacional:
      rota.aeroporto_destino_cotacao_bid_frete_internacional ?? row.aeroporto_destino_cotacao_bid_frete_internacional,
    origem_pais_cotacao_bid_frete_internacional:
      rota.origem_pais_cotacao_bid_frete_internacional || row.origem_pais_cotacao_bid_frete_internacional,
    destino_pais_cotacao_bid_frete_internacional:
      rota.destino_pais_cotacao_bid_frete_internacional || row.destino_pais_cotacao_bid_frete_internacional,
    origem_nome_cotacao_bid_frete_internacional:
      rota.origem_nome_cotacao_bid_frete_internacional || row.origem_nome_cotacao_bid_frete_internacional,
    destino_nome_cotacao_bid_frete_internacional:
      rota.destino_nome_cotacao_bid_frete_internacional || row.destino_nome_cotacao_bid_frete_internacional,
  }
}

function errosPayloadParaAlertas(
  row: LinhaImportacaoBidFreteInternacional,
  ctx: ContextoCatalogoRota,
): AlertaPreviewImportacaoBid[] {
  return validarPayloadCriacaoCotacaoImportacaoBidFreteInternacional(row, undefined, ctx).map(erro => {
    const campoResolvido = (erro.campo in ERRO_PARA_CAMPO
      ? ERRO_PARA_CAMPO[erro.campo as keyof typeof ERRO_PARA_CAMPO]
      : erro.campo) as CampoImportacaoBidFreteInternacional
    const rotulo = rotuloCampoImportacaoBid(campoResolvido)
    return {
      campo: campoResolvido,
      mensagem: erro.mensagem.includes(rotulo) ? erro.mensagem : `${rotulo}: ${erro.mensagem}`,
      nivel: 'erro' as const,
    }
  })
}

export function montarLinhaPreviewImportacaoBid(
  row: LinhaImportacaoBidFreteInternacional,
  linhaArquivo: number,
  ctx: ContextoCatalogoRota = {},
): LinhaPreviewImportacaoBid {
  const errosLinha = errosParaAlertas(validarLinhaImportacaoBidFreteInternacional(row, ctx))
  const errosPayload = errosLinha.length === 0 ? errosPayloadParaAlertas(row, ctx) : []
  const erros = [...errosLinha, ...errosPayload]
  const avisos = coletarAvisos(row).filter(
    aviso => !erros.some(e => e.campo === aviso.campo),
  )
  const alertas = [...erros, ...avisos]
  const dadosExibicao = enriquecerDadosPreviewComRota(row, ctx)

  return {
    linha_arquivo: linhaArquivo,
    status: calcularStatus(alertas),
    titulo: tituloLinhaPreview(dadosExibicao, linhaArquivo),
    dados: dadosExibicao,
    alertas,
  }
}

export function montarLinhasPreviewImportacaoBid(
  linhas: LinhaImportacaoBidFreteInternacional[],
  ctx: ContextoCatalogoRota = {},
): LinhaPreviewImportacaoBid[] {
  return linhas.map((row, idx) => montarLinhaPreviewImportacaoBid(row, idx + 1, ctx))
}
