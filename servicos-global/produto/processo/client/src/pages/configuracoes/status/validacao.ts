/**
 * validacao.ts — Validador semantico das regras de status (GABI).
 *
 * Separado do componente pra ficar facilmente testavel via Vitest.
 * Espelha o validador de Campos Calculados do Pedido.
 */

export type FieldSource = 'dados_processo' | 'pedido'

export type CondicaoTipo =
  | 'vazio' | 'preenchido'
  | 'igual' | 'diferente'
  | 'maior_que' | 'menor_que'
  | 'contem'

export type CampoTipo = 'texto' | 'numero' | 'data' | 'select'

export interface CampoOpcao {
  key: string
  label: string
  tipo: CampoTipo
}

export interface Regra {
  id: string
  origem: FieldSource
  campo: string
  condicao: CondicaoTipo
  valor?: string
}

export interface StatusConfig {
  id: string
  nome: string
  cor: string
  ordem: number
  operador: 'AND' | 'OR'
  regras: Regra[]
}

export type Severidade = 'erro' | 'aviso'

export interface Problema {
  severidade: Severidade
  mensagem: string
}

export interface Validacao {
  problemas: Problema[]
  valida: boolean
}

// ── Catalogos ──────────────────────────────────────────────────────────────

export const CAMPOS_DADOS_PROCESSO: CampoOpcao[] = [
  { key: 'numero_processo',  label: 'Número do Processo',  tipo: 'texto' },
  { key: 'data_abertura',    label: 'Data de Abertura',    tipo: 'data' },
  { key: 'data_embarque',    label: 'Data de Embarque',    tipo: 'data' },
  { key: 'data_chegada',     label: 'Data de Chegada',     tipo: 'data' },
  { key: 'ref_cliente',      label: 'Referência Cliente',  tipo: 'texto' },
  { key: 'responsavel',      label: 'Responsável',         tipo: 'texto' },
  { key: 'despachante',      label: 'Despachante',         tipo: 'texto' },
  { key: 'incoterm',         label: 'Incoterm',            tipo: 'texto' },
  { key: 'canal',            label: 'Canal',               tipo: 'select' },
  { key: 'tipo_decl',        label: 'Tipo de Declaração',  tipo: 'select' },
  { key: 'bl_awb',           label: 'BL / AWB',            tipo: 'texto' },
  { key: 'di_numero',        label: 'DI Nº',               tipo: 'texto' },
  { key: 'li_numero',        label: 'LI Nº',               tipo: 'texto' },
]

export const CAMPOS_PEDIDO: CampoOpcao[] = [
  { key: 'numero_pedido',    label: 'Número do Pedido',    tipo: 'texto' },
  { key: 'status_pedido',    label: 'Status do Pedido',    tipo: 'select' },
  { key: 'valor_fob',        label: 'Valor FOB',           tipo: 'numero' },
  { key: 'peso_bruto',       label: 'Peso Bruto',          tipo: 'numero' },
  { key: 'data_pedido',      label: 'Data do Pedido',      tipo: 'data' },
  { key: 'data_emb_prev',    label: 'Data Embarque Prev.', tipo: 'data' },
]

export function camposPara(origem: FieldSource): CampoOpcao[] {
  return origem === 'dados_processo' ? CAMPOS_DADOS_PROCESSO : CAMPOS_PEDIDO
}

export const ROTULO_CONDICAO: Record<CondicaoTipo, string> = {
  vazio:       'é vazio',
  preenchido:  'está preenchido',
  igual:       'é igual a',
  diferente:   'é diferente de',
  maior_que:   'é maior que',
  menor_que:   'é menor que',
  contem:      'contém',
}

export function precisaValor(c: CondicaoTipo): boolean {
  return c !== 'vazio' && c !== 'preenchido'
}

/**
 * Compatibilidade entre tipo do campo e condicao:
 *
 *   vazio, preenchido    → todos
 *   igual, diferente     → todos (comparacao exata)
 *   contem               → so texto (substring)
 *   maior_que, menor_que → numero ou data (comparacao ordinal)
 */
export const CONDICAO_POR_TIPO: Record<CondicaoTipo, CampoTipo[]> = {
  vazio:      ['texto', 'numero', 'data', 'select'],
  preenchido: ['texto', 'numero', 'data', 'select'],
  igual:      ['texto', 'numero', 'data', 'select'],
  diferente:  ['texto', 'numero', 'data', 'select'],
  contem:     ['texto'],
  maior_que:  ['numero', 'data'],
  menor_que:  ['numero', 'data'],
}

/**
 * Avalia um status e retorna lista de problemas (erros + avisos).
 * Erros bloqueiam o salvamento; avisos sao informativos.
 */
export function validarStatus(status: StatusConfig): Validacao {
  const problemas: Problema[] = []

  if (status.regras.length === 0) {
    problemas.push({
      severidade: 'aviso',
      mensagem: 'Status sem regras nunca é disparado automaticamente.',
    })
  }

  const porCampo = new Map<string, Regra[]>()

  for (const regra of status.regras) {
    const campos = camposPara(regra.origem)
    const campoInfo = campos.find(c => c.key === regra.campo)
    if (!campoInfo) continue
    const labelCampo = campoInfo.label

    // 1. Condicao incompativel com tipo
    const tiposPermitidos = CONDICAO_POR_TIPO[regra.condicao]
    if (!tiposPermitidos.includes(campoInfo.tipo)) {
      const rotuloTipo = campoInfo.tipo === 'texto' ? 'texto'
        : campoInfo.tipo === 'numero' ? 'número'
        : campoInfo.tipo === 'data' ? 'data'
        : 'lista'
      problemas.push({
        severidade: 'erro',
        mensagem: `"${ROTULO_CONDICAO[regra.condicao]}" não funciona em campo de ${rotuloTipo} (${labelCampo}).`,
      })
    }

    // 2. Valor exigido mas vazio
    if (precisaValor(regra.condicao) && (!regra.valor || regra.valor.trim() === '')) {
      problemas.push({
        severidade: 'erro',
        mensagem: `Regra em "${labelCampo}" precisa de um valor de comparação.`,
      })
    }

    // 3. Valor numerico invalido
    if (campoInfo.tipo === 'numero' && regra.valor && regra.valor.trim() !== '') {
      const n = Number(regra.valor.replace(',', '.'))
      if (Number.isNaN(n)) {
        problemas.push({
          severidade: 'erro',
          mensagem: `Valor "${regra.valor}" não é um número válido para o campo "${labelCampo}".`,
        })
      }
    }

    const k = `${regra.origem}.${regra.campo}`
    const arr = porCampo.get(k) ?? []
    arr.push(regra)
    porCampo.set(k, arr)
  }

  // 4. Conflitos no modo AND
  if (status.operador === 'AND') {
    for (const [chave, regras] of porCampo) {
      const temVazio = regras.some(r => r.condicao === 'vazio')
      const temPreenchido = regras.some(r => r.condicao === 'preenchido')
      if (temVazio && temPreenchido) {
        const labelCampoKey = chave.split('.')[1]
        const todosOsCampos = [...CAMPOS_DADOS_PROCESSO, ...CAMPOS_PEDIDO]
        const info = todosOsCampos.find(c => c.key === labelCampoKey)
        problemas.push({
          severidade: 'erro',
          mensagem: `Campo "${info?.label ?? labelCampoKey}" não pode ser "vazio" E "preenchido" ao mesmo tempo (no modo E).`,
        })
      }
    }
  }

  return {
    problemas,
    valida: !problemas.some(p => p.severidade === 'erro'),
  }
}
