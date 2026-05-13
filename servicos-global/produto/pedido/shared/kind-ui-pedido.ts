/**
 * kind-ui-pedido.ts — Classificador UI dos 143 campos do Pedido/PedidoItem.
 *
 * O SSOT (`campos-pedido-ddd.ts`) tem apenas 5 tipos amplos:
 *   texto | numero | data | select | usuario
 *
 * Mas a UI precisa de muito mais granularidade — um `texto` pode ser:
 *   - NCM       (mask XXXX.XX.XX, 8 digitos, componente SelectNcmGlobal)
 *   - CNPJ      (mask 00.000.000/0000-00)
 *   - Email     (input type="email")
 *   - Moeda     (select USD/EUR/BRL/...)
 *   - Incoterm  (select FOB/CIF/EXW/...)
 *   - texto livre (input)
 *
 * E um `numero` pode ser:
 *   - Quantidade  (decimal BR com casas configuraveis)
 *   - Valor       (decimal BR com casas configuraveis)
 *   - Peso        (decimal BR, 3 casas default)
 *   - Cubagem     (decimal BR, 3 casas default)
 *   - Taxa cambio (decimal BR, 4 casas default)
 *   - Inteiro     (sequencia, qtd volumes, casas decimais — sem fracao)
 *
 * Este modulo expoe `kindUiDeCampo(campoOuMeta)` que retorna o sub-tipo UI
 * apropriado para o renderer `CampoSmartImport` escolher o componente.
 *
 * Modulo puro: zero dependencia de React, browser ou banco. Usado tanto
 * pelo client (form inline, edicao inline) quanto potencialmente pelo
 * server (validacao por tipo).
 *
 * Quando criar novo campo no SSOT: nao precisa atualizar este arquivo se
 * o nome segue padroes ja cobertos (sufixo _item/_pedido, prefixo cnpj_,
 * peso_, etc.). Se for caso especial, adicione um override em OVERRIDES.
 */

import {
  CAMPOS_PEDIDO_DDD_TODOS,
  type CampoPedidoDDD,
  type TipoCampoDDD,
} from './campos-pedido-ddd'

// ── Tipos UI (mais granular que TipoCampoDDD) ────────────────────────────────

export type KindUI =
  // Texto / variantes
  | 'texto'              // input livre
  | 'texto_longo'        // textarea (descricao_item, endereco_*)
  | 'ncm'                // SelectNcmGlobal
  | 'cnpj'               // mask 00.000.000/0000-00
  | 'cpf'                // mask 000.000.000-00 (futuro)
  | 'email'              // input type=email
  | 'telefone'           // mask BR (00) 00000-0000 (whatsapp_*)
  | 'zip'                // input livre (formato varia por pais)
  | 'url'                // input type=url
  // Selects fixos (lista hardcoded por convenção de negocio)
  | 'moeda_codigo'       // select USD/EUR/BRL/CNY/GBP/JPY
  | 'incoterm'           // select FOB/CIF/EXW/CFR/DDP/DAP/FCA/CPT/CIP/DPU/FAS
  | 'unidade'            // select (PC/KG/M/UN/...) — pode ser livre tambem
  | 'tipo_linha'         // select PEDIDO|ITEM
  | 'tipo_operacao'      // select importacao|exportacao
  | 'cobertura_cambial'  // select (a definir — texto enquanto nao oficializa)
  | 'select_ssot'        // select cujas opcoes vem do `opcoesSelect` do SSOT
  // Numericos / decimais
  | 'decimal_quantidade' // CampoDecimalGlobal, casas via config quantidade_*
  | 'decimal_valor'      // CampoDecimalGlobal, casas via config valor_*
  | 'decimal_peso'       // CampoDecimalGlobal, casas via config peso_*
  | 'decimal_cubagem'    // CampoDecimalGlobal, casas via config cubagem_*
  | 'decimal_taxa'       // CampoDecimalGlobal, 4 casas (taxa cambio)
  | 'inteiro'            // CampoDecimalGlobal, 0 casas (sequencia, volumes, casas_decimais_*)
  // Data
  | 'data'               // input type=date

// ── Overrides explicitos (campo -> KindUI) ───────────────────────────────────
//
// So' coloque aqui campo cujo nome NAO bate as regras de padroes abaixo.
// O default e' tentar derivar pelo nome (prefixo/sufixo/substring).

const OVERRIDES: Record<string, KindUI> = {
  // Selects de negocio (tipo='select' no SSOT — opcoesSelect populadas)
  tipo_linha:                  'tipo_linha',
  tipo_operacao:               'tipo_operacao',
  // Texto especial / "tipo enum semantico" — manter texto ate definir spec
  cobertura_cambial_pedido:    'cobertura_cambial',
  cobertura_cambial_item:      'cobertura_cambial',
  exportador_ou_fabricante:    'texto',
  relacao_exportador_fabricante: 'texto',
  situacao_ope:                'texto',
  versao_ope:                  'texto',
  // Inteiros nominais
  sequencia_item_pedido:       'inteiro',
  quantidade_volumes_pedido:   'inteiro',
  // Casas decimais sao inteiros 0..8
  casas_decimais_quantidade_item: 'inteiro',
  casas_decimais_valor_item:      'inteiro',
  casas_decimais_peso_item:       'inteiro',
  casas_decimais_cubagem_item:    'inteiro',
  // Identificadores nominais
  contrato_cambio_id_pedido:   'texto',
  cnpj_raiz_empresa_responsavel: 'cnpj',
}

// ── Regras por padrao de nome ────────────────────────────────────────────────

function kindUiPorNome(campo: string): KindUI | null {
  const c = campo.toLowerCase()

  // NCM
  if (c === 'ncm_item' || c === 'ncm_duimp' || c.startsWith('ncm_') || c === 'ncm') {
    return 'ncm'
  }

  // CNPJ / CPF
  if (c.startsWith('cnpj_') || c.endsWith('_cnpj') || c === 'cnpj') return 'cnpj'
  if (c.startsWith('cpf_')  || c.endsWith('_cpf')  || c === 'cpf')  return 'cpf'

  // Email
  if (c.startsWith('email_') || c.endsWith('_email') || c === 'email') return 'email'

  // Telefone / WhatsApp
  if (c.startsWith('whatsapp_') || c.startsWith('telefone_') || c.endsWith('_whatsapp') || c.endsWith('_telefone')) {
    return 'telefone'
  }

  // ZIP
  if (c.startsWith('zip_code_') || c === 'zip_code' || c === 'cep') return 'zip'

  // Moeda — `moeda_*` e variantes
  if (c === 'moeda' || c.startsWith('moeda_') || c.endsWith('_moeda')) {
    return 'moeda_codigo'
  }

  // Incoterm
  if (c === 'incoterm' || c.startsWith('incoterm_') || c.endsWith('_incoterm')) {
    return 'incoterm'
  }

  // Unidade comercializada / unidade
  if (c === 'unidade' || c.startsWith('unidade_') || c.endsWith('_unidade')) {
    return 'unidade'
  }

  // Datas — qualquer campo com prefixo data_ (SSOT marca como tipo=data mas
  // confirmamos pelo nome para cobrir campos custom).
  if (c.startsWith('data_') || c.endsWith('_data') || c === 'data') {
    return 'data'
  }

  // Taxa cambio
  if (c.startsWith('taxa_cambio_') || c.includes('taxa_cambio')) {
    return 'decimal_taxa'
  }

  // Peso (peso_liquido_*, peso_bruto_*)
  if (c.startsWith('peso_') || c.includes('_peso_') || c.endsWith('_peso')) {
    return 'decimal_peso'
  }

  // Cubagem
  if (c.startsWith('cubagem_') || c.includes('cubagem')) {
    return 'decimal_cubagem'
  }

  // Quantidade (qualquer prefixo/sufixo quantidade — exceto casas_decimais_quantidade)
  if (c.startsWith('quantidade_') || c.includes('_quantidade_') || c.endsWith('_quantidade')) {
    return 'decimal_quantidade'
  }

  // Valor (valor_*, valor_total_*, valor_por_unidade_*)
  if (c.startsWith('valor_') || c.includes('_valor_') || c.endsWith('_valor')) {
    return 'decimal_valor'
  }

  // Descricao — campo longo
  if (c === 'descricao' || c.startsWith('descricao_') || c.endsWith('_descricao')) {
    return 'texto_longo'
  }

  // Endereco — campo longo
  if (c === 'endereco' || c.startsWith('endereco_') || c.endsWith('_endereco')) {
    return 'texto_longo'
  }

  return null
}

// ── API ──────────────────────────────────────────────────────────────────────

/**
 * Retorna a metadata DDD do campo no SSOT (ou null se campo desconhecido).
 */
export function metadataDeCampo(campo: string): CampoPedidoDDD | null {
  return CAMPOS_PEDIDO_DDD_TODOS.find(c => c.campo === campo) ?? null
}

/**
 * Classificador principal — retorna o sub-tipo UI para o campo.
 *
 * Prioridade:
 *   1. OVERRIDES explicitos
 *   2. SSOT tem opcoesSelect -> 'select_ssot'
 *   3. Regras por nome (prefixo/sufixo)
 *   4. Fallback baseado no `tipo` do SSOT
 *   5. Default 'texto'
 */
export function kindUiDeCampo(campo: string): KindUI {
  // 1) Override explicito
  if (OVERRIDES[campo]) return OVERRIDES[campo]

  // 2) Select com opcoesSelect no SSOT
  const meta = metadataDeCampo(campo)
  if (meta?.tipo === 'select' && meta.opcoesSelect?.length) {
    // tipo_linha e tipo_operacao caem nos overrides; outros casos usam select_ssot
    return 'select_ssot'
  }

  // 3) Regras por nome
  const porNome = kindUiPorNome(campo)
  if (porNome) return porNome

  // 4) Fallback pelo tipo SSOT
  if (meta) {
    switch (meta.tipo) {
      case 'data':    return 'data'
      case 'numero':  return 'decimal_valor'  // fallback generico
      case 'select':  return 'select_ssot'
      case 'usuario': return 'texto'
      case 'texto':
      default:        return 'texto'
    }
  }

  // 5) Default — campo desconhecido (ex: custom_*)
  return 'texto'
}

/**
 * Opcoes de select do SSOT para um campo (ou null se o campo nao for select).
 */
export function opcoesSsotDeCampo(campo: string): Array<{ valor: string; rotulo: string }> | null {
  const meta = metadataDeCampo(campo)
  if (!meta?.opcoesSelect?.length) return null
  return meta.opcoesSelect.map(v => ({ valor: v, rotulo: v }))
}

/**
 * Opcoes de Moeda — usadas para todos os campos `kind === 'moeda_codigo'`.
 * Lista alinhada com ModalPedidoNovo.OPCOES_MOEDA_ITEM (mesma fonte de UX).
 */
export const OPCOES_MOEDA_PEDIDO: Array<{ valor: string; rotulo: string }> = [
  { valor: 'USD', rotulo: 'USD' },
  { valor: 'EUR', rotulo: 'EUR' },
  { valor: 'BRL', rotulo: 'BRL' },
  { valor: 'CNY', rotulo: 'CNY' },
  { valor: 'GBP', rotulo: 'GBP' },
  { valor: 'JPY', rotulo: 'JPY' },
  { valor: 'CHF', rotulo: 'CHF' },
  { valor: 'CAD', rotulo: 'CAD' },
]

// OPCOES_INCOTERM_PEDIDO removido em 2026-05-13 — SSOT migrada para
// cadastros.incoterm. Consumidores devem usar useIncotermsPedido() do
// pedido/client/src/shared/useIncotermsPedido.ts. Para contextos onde
// o hook não é possível (módulo top-level, scripts de teste/seed), buscar
// na API REST GET /api/v1/cadastros/incoterms.

/**
 * Padroes default de casas decimais por kind de decimal.
 * O consumidor pode sobrescrever via prop `casasDecimais`; este e' so o
 * fallback quando a config do usuario nao tem valor.
 */
export function casasDecimaisDefault(kind: KindUI, configUsuario?: Record<string, number>): number {
  const cfg = configUsuario ?? {}
  switch (kind) {
    case 'decimal_quantidade': return cfg.quantidade_total_pedido ?? 2
    case 'decimal_valor':      return cfg.valor_por_unidade_item ?? cfg.valor_total_pedido ?? 2
    case 'decimal_peso':       return cfg.peso_liquido_total_pedido ?? cfg.peso_bruto_total_pedido ?? 3
    case 'decimal_cubagem':    return cfg.cubagem_total_pedido ?? 3
    case 'decimal_taxa':       return 4
    case 'inteiro':            return 0
    default:                   return 2
  }
}

// ── Mask helpers (puros, sem dep de React) ───────────────────────────────────

/**
 * Mask CNPJ: "12345678000190" -> "12.345.678/0001-90"
 * Aceita parcial: "1234" -> "12.34"
 */
export function aplicarMaskCnpj(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 14)
  if (d.length <= 2)  return d
  if (d.length <= 5)  return `${d.slice(0,2)}.${d.slice(2)}`
  if (d.length <= 8)  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`
}

/**
 * Mask CPF: "12345678901" -> "123.456.789-01"
 */
export function aplicarMaskCpf(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3)  return d
  if (d.length <= 6)  return `${d.slice(0,3)}.${d.slice(3)}`
  if (d.length <= 9)  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
}

/**
 * Mask telefone BR — celular "(00) 00000-0000" / fixo "(00) 0000-0000"
 */
export function aplicarMaskTelefone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  if (d.length === 0) return ''
  if (d.length <= 2)  return `(${d}`
  if (d.length <= 6)  return `(${d.slice(0,2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
}

// ── Reverse helpers para parser ───────────────────────────────────────────────

/** Remove mask CNPJ — "12.345.678/0001-90" -> "12345678000190" */
export function removerMask(s: string): string {
  return s.replace(/\D/g, '')
}

// ── Tipo re-export (conveniencia para consumidores) ──────────────────────────

export type { TipoCampoDDD }
