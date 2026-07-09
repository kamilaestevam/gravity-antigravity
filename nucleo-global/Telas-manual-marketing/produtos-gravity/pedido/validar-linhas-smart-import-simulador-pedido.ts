/**
 * Validação client-side do Smart Import — paridade com smartImportService.validarLinha
 * e validarCoerenciaMasterDetail (produto real).
 */
import { CAMPOS_PEDIDO_DDD_TODOS } from '../../../../servicos-global/produto/pedido/shared/campos-pedido-ddd'
import { parseNumeroBrOpcional } from '../../../../servicos-global/produto/pedido/shared/formatadores'
import type { SmartImportAlertaSimulador, SmartImportLinhaSimulador } from './tipos-smart-import-simulador-pedido'

function extrairCodigoDropdown(valor: unknown): string {
  if (!valor) return ''
  const s = String(valor).trim()
  const idx = s.indexOf(' — ')
  return idx > 0 ? s.slice(0, idx) : s
}

function calcularStatus(alertas: SmartImportAlertaSimulador[]): SmartImportLinhaSimulador['status'] {
  if (alertas.some((a) => a.nivel === 'erro')) return 'erro'
  if (alertas.some((a) => a.nivel === 'aviso')) return 'aviso'
  return 'ok'
}

export function validarLinhaSmartImportSimulador(dados: Record<string, unknown>): SmartImportAlertaSimulador[] {
  const alertas: SmartImportAlertaSimulador[] = []

  const REGEX_ERRO_EXCEL = /^#(REF|N\/A|VALUE|DIV\/0|NAME|NULL|NUM)[!?]?$/
  for (const [campo, valor] of Object.entries(dados)) {
    if (typeof valor !== 'string') continue
    if (!REGEX_ERRO_EXCEL.test(valor.trim())) continue
    alertas.push({
      campo,
      tipo: 'formato_invalido',
      mensagem: `Célula contém erro de fórmula do Excel ("${valor}"). Verifique a planilha de origem antes de importar.`,
      nivel: 'erro',
    })
  }

  if (dados.tipo_linha !== undefined) {
    const tipoLinha = String(dados.tipo_linha).trim().toUpperCase()
    if (tipoLinha && !['PEDIDO', 'ITEM'].includes(tipoLinha)) {
      alertas.push({
        campo: 'tipo_linha',
        tipo: 'formato_invalido',
        mensagem: `Tipo Linha "${dados.tipo_linha}" inválido — aceitos apenas: PEDIDO, ITEM`,
        nivel: 'erro',
      })
    }
  }

  const tipoOperacaoBruto = dados.tipo_operacao_pedido ?? dados.tipo_operacao
  if (tipoOperacaoBruto !== undefined) {
    const tipoOp = String(tipoOperacaoBruto).trim().toLowerCase()
    if (tipoOp && !['importacao', 'exportacao'].includes(tipoOp)) {
      alertas.push({
        campo: 'tipo_operacao_pedido',
        tipo: 'formato_invalido',
        mensagem: `Tipo de Operação "${tipoOperacaoBruto}" inválido — aceitos apenas: importacao, exportacao`,
        nivel: 'erro',
      })
    }
  }

  const tipoLinhaUpper = String(dados.tipo_linha ?? '').trim().toUpperCase()
  const ehLinhaItem = tipoLinhaUpper === 'ITEM'
  const ehLinhaPedido = tipoLinhaUpper === 'PEDIDO'
  const ehFormatoFlat = tipoLinhaUpper === ''

  if (!dados.numero_pedido && (ehLinhaPedido || ehFormatoFlat)) {
    const partNumber = dados.part_number_item ? String(dados.part_number_item) : ''
    const sugestao = partNumber ? ` Sugestão: usar Part Number "${partNumber}" como referência` : ''
    alertas.push({
      campo: 'numero_pedido',
      tipo: 'obrigatorio_ausente',
      mensagem: `Número do pedido ausente — será gerado automaticamente.${sugestao}`,
      nivel: 'aviso',
    })
  }

  if (!dados.part_number_item && (ehLinhaItem || ehFormatoFlat)) {
    alertas.push({
      campo: 'part_number_item',
      tipo: 'obrigatorio_ausente',
      mensagem: 'Part number ausente',
      nivel: 'aviso',
    })
  }

  if (ehLinhaItem || ehFormatoFlat) {
    const qty = parseNumeroBrOpcional(dados.quantidade_inicial_item)
    if (
      dados.quantidade_inicial_item !== undefined
      && dados.quantidade_inicial_item !== ''
      && (qty === null || qty <= 0)
    ) {
      alertas.push({
        campo: 'quantidade_inicial_item',
        tipo: 'valor_negativo',
        mensagem: 'Quantidade deve ser maior que zero',
        nivel: 'erro',
      })
    }
  }

  const val = parseNumeroBrOpcional(dados.valor_por_unidade_item)
  if (
    dados.valor_por_unidade_item !== undefined
    && dados.valor_por_unidade_item !== ''
    && val !== null
    && val < 0
  ) {
    alertas.push({
      campo: 'valor_por_unidade_item',
      tipo: 'valor_negativo',
      mensagem: 'Valor unitário não pode ser negativo',
      nivel: 'erro',
    })
  }

  const ncm = String(dados.ncm_item ?? '').replace(/[.\s-]/g, '')
  if (ncm && !/^\d{8}$/.test(ncm)) {
    alertas.push({
      campo: 'ncm_item',
      tipo: 'formato_invalido',
      mensagem: `NCM "${dados.ncm_item}" inválido — deve ter 8 dígitos numéricos (ex: 84713019)`,
      nivel: 'aviso',
    })
  }

  const CAMPOS_JA_VALIDADOS = new Set([
    'tipo_linha', 'tipo_operacao_pedido', 'tipo_operacao', 'numero_pedido',
    'part_number_item', 'quantidade_inicial_item', 'valor_por_unidade_item',
    'ncm_item',
  ])

  for (const def of CAMPOS_PEDIDO_DDD_TODOS) {
    if (CAMPOS_JA_VALIDADOS.has(def.campo)) continue
    const valor = dados[def.campo]
    if (valor === undefined || valor === null || valor === '') continue
    const valorStr = String(valor).trim()
    if (!valorStr) continue

    if (def.tipo === 'data') {
      if (Number.isNaN(new Date(valorStr).getTime())) {
        alertas.push({
          campo: def.campo,
          tipo: 'formato_invalido',
          mensagem: `${def.rotulo}: data inválida ("${valorStr}"). Formato esperado: DD/MM/YYYY ou YYYY-MM-DD`,
          nivel: 'aviso',
        })
      }
    } else if (def.tipo === 'numero') {
      if (parseNumeroBrOpcional(valor) === null) {
        alertas.push({
          campo: def.campo,
          tipo: 'formato_invalido',
          mensagem: `${def.rotulo}: número inválido ("${valorStr}"). Esperado: número (use ponto ou vírgula como decimal)`,
          nivel: 'erro',
        })
      }
    } else if (def.tipo === 'select' && def.opcoesSelect && def.opcoesSelect.length > 0) {
      const valorCodigo = extrairCodigoDropdown(valorStr)
      const valorLower = valorCodigo.toLowerCase()
      const opcoesLower = def.opcoesSelect.map((o) => o.toLowerCase())
      if (!opcoesLower.includes(valorLower) && !opcoesLower.includes(valorStr.toLowerCase())) {
        alertas.push({
          campo: def.campo,
          tipo: 'formato_invalido',
          mensagem: `${def.rotulo}: valor inválido ("${valorStr}"). Aceitos: ${def.opcoesSelect.join(', ')}`,
          nivel: 'erro',
        })
      }
    }
  }

  const numFlex = (v: unknown): number | null => parseNumeroBrOpcional(v)
  const qtyItem = numFlex(dados.quantidade_inicial_item)
  const valorUnit = numFlex(dados.valor_por_unidade_item)
  const valorTotal = numFlex(dados.valor_total_item)
  if (qtyItem !== null && valorUnit !== null && valorTotal !== null && qtyItem > 0 && valorUnit > 0) {
    const esperado = qtyItem * valorUnit
    const tolerancia = Math.max(0.01, esperado * 0.01)
    if (Math.abs(esperado - valorTotal) > tolerancia) {
      alertas.push({
        campo: 'valor_total_item',
        tipo: 'formato_invalido',
        mensagem: `Valor total (${valorTotal.toFixed(2)}) não bate com Qtd × Valor unitário (${qtyItem} × ${valorUnit} = ${esperado.toFixed(2)})`,
        nivel: 'aviso',
      })
    }
  }

  const pesoLiq = numFlex(dados.peso_liquido_unitario_item)
  const pesoBruto = numFlex(dados.peso_bruto_unitario_item)
  if (pesoLiq !== null && pesoBruto !== null && pesoLiq > 0 && pesoBruto > 0 && pesoBruto < pesoLiq) {
    alertas.push({
      campo: 'peso_bruto_unitario_item',
      tipo: 'formato_invalido',
      mensagem: `Peso bruto (${pesoBruto}) menor que peso líquido (${pesoLiq}) — impossibilidade física`,
      nivel: 'aviso',
    })
  }

  return alertas
}

export function validarCoerenciaMasterDetailSmartImportSimulador(
  linhas: SmartImportLinhaSimulador[],
): SmartImportLinhaSimulador[] {
  const temTipoLinha = linhas.some((l) => l.dados.tipo_linha !== undefined)
  if (!temTipoLinha) return linhas

  const pedidosNoArquivo = new Map<string, number[]>()
  const itensPorPedido = new Map<string, number[]>()
  let primeiraLinhaPedido = Infinity

  linhas.forEach((l) => {
    const tipo = String(l.dados.tipo_linha ?? '').trim().toUpperCase()
    const numero = (l.dados.numero_pedido as string)?.trim() || ''
    if (tipo === 'PEDIDO' && numero) {
      const arr = pedidosNoArquivo.get(numero) ?? []
      arr.push(l.linha_arquivo)
      pedidosNoArquivo.set(numero, arr)
      if (l.linha_arquivo < primeiraLinhaPedido) primeiraLinhaPedido = l.linha_arquivo
    } else if (tipo === 'ITEM' && numero) {
      const arr = itensPorPedido.get(numero) ?? []
      arr.push(l.linha_arquivo)
      itensPorPedido.set(numero, arr)
    }
  })

  return linhas.map((l) => {
    const tipo = String(l.dados.tipo_linha ?? '').trim().toUpperCase()
    const numero = (l.dados.numero_pedido as string)?.trim() || ''
    const novosAlertas: SmartImportAlertaSimulador[] = []

    if (tipo === 'PEDIDO' && numero) {
      const ocorrencias = pedidosNoArquivo.get(numero) ?? []
      if (ocorrencias.length > 1) {
        const outras = ocorrencias.filter((n) => n !== l.linha_arquivo).join(', ')
        novosAlertas.push({
          campo: 'numero_pedido',
          tipo: 'duplicado_arquivo',
          mensagem: `Pedido "${numero}" aparece em ${ocorrencias.length} linhas PEDIDO do arquivo (linhas: ${outras}). Mantenha apenas 1.`,
          nivel: 'erro',
        })
      }

      const itens = itensPorPedido.get(numero) ?? []
      if (itens.length === 0) {
        novosAlertas.push({
          campo: 'tipo_linha',
          tipo: 'obrigatorio_ausente',
          mensagem: `Pedido "${numero}" não tem nenhum ITEM associado abaixo. Adicione pelo menos 1 linha ITEM com mesmo numero_pedido.`,
          nivel: 'aviso',
        })
      }
    }

    if (tipo === 'ITEM' && l.linha_arquivo < primeiraLinhaPedido) {
      novosAlertas.push({
        campo: 'tipo_linha',
        tipo: 'formato_invalido',
        mensagem: 'Linha ITEM aparece antes de qualquer linha PEDIDO. Reordene: PEDIDO primeiro, depois seus ITENs.',
        nivel: 'erro',
      })
    }

    if (tipo === 'ITEM' && numero && !pedidosNoArquivo.has(numero)) {
      novosAlertas.push({
        campo: 'numero_pedido',
        tipo: 'formato_invalido',
        mensagem: `Item refere ao Pedido "${numero}" que não está em nenhuma linha PEDIDO do arquivo. Adicione a linha PEDIDO correspondente ou corrija o número.`,
        nivel: 'erro',
      })
    }

    if (novosAlertas.length === 0) return l

    const alertasCombinados = [...l.alertas, ...novosAlertas]
    return {
      ...l,
      alertas: alertasCombinados,
      status: calcularStatus(alertasCombinados),
    }
  })
}

export function aplicarValidacaoLinhasSmartImportSimulador(
  linhas: SmartImportLinhaSimulador[],
): SmartImportLinhaSimulador[] {
  const comValidacao = linhas.map((l) => {
    const alertas = validarLinhaSmartImportSimulador(l.dados)
    return {
      ...l,
      alertas,
      status: calcularStatus(alertas),
    }
  })
  return validarCoerenciaMasterDetailSmartImportSimulador(comValidacao)
}
