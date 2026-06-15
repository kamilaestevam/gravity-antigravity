import type {
  CampoImportacaoBidFreteInternacional,
  GrupoCampoImportacaoBidFreteInternacional,
  LinhaImportacaoBidFreteInternacional,
} from './tipos-importacao-bid-frete-internacional'

export interface CampoImportacaoBidMeta {
  campo: CampoImportacaoBidFreteInternacional
  rotulo: string
  obrigatorio: boolean
  grupo: GrupoCampoImportacaoBidFreteInternacional
  aliases: readonly string[]
  /** Se false, não entra no template Gravity (somente mapeamento de planilhas externas). */
  incluirTemplateGravity?: boolean
}

/** Normaliza cabeçalho de planilha para comparação (paridade Smart Import Pedido). */
export function normalizarNomeCampoImportacaoBidFreteInternacional(s: string): string {
  return s
    .replace(/^\*+\s+/, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/[—–_/\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const CAMPOS_IMPORTACAO_BID_FRETE_INTERNACIONAL: readonly CampoImportacaoBidMeta[] = [
  {
    campo: 'referencia_interna_cotacao_bid_frete_internacional',
    rotulo: 'Referencia Interna',
    obrigatorio: false,
    grupo: 'essencial',
    aliases: ['referencia', 'ref interna', 'po', 'purchase order', 'internal ref'],
  },
  {
    campo: 'tipo_operacao_cotacao_bid_frete_internacional',
    rotulo: 'Operacao',
    obrigatorio: true,
    grupo: 'essencial',
    aliases: ['tipo operacao', 'tipo de operacao', 'operation type', 'import export', 'operacao', 'tipo', 'direction'],
  },
  {
    campo: 'status_cotacao_bid_frete_internacional',
    rotulo: 'Status',
    obrigatorio: false,
    grupo: 'essencial',
    aliases: ['status cotacao', 'situacao'],
  },
  {
    campo: 'modal_cotacao_bid_frete_internacional',
    rotulo: 'Modal',
    obrigatorio: true,
    grupo: 'essencial',
    aliases: ['modal transporte', 'transport mode', 'mode', 'tipo frete', 'modal frete'],
  },
  {
    campo: 'modalidade_cotacao_bid_frete_internacional',
    rotulo: 'Modalidade',
    obrigatorio: false,
    grupo: 'essencial',
    aliases: ['modalidade carga', 'load type', 'fcl lcl'],
  },
  {
    campo: 'porto_origem_cotacao_bid_frete_internacional',
    rotulo: 'Porto origem',
    obrigatorio: false,
    grupo: 'essencial',
    aliases: ['pol', 'port of loading', 'origem porto', 'porto origem', 'port origin'],
  },
  {
    campo: 'aeroporto_origem_cotacao_bid_frete_internacional',
    rotulo: 'Aeroporto origem',
    obrigatorio: false,
    grupo: 'essencial',
    aliases: ['aol', 'airport origin', 'origem aeroporto', 'aeroporto origem'],
  },
  {
    campo: 'origem_nome_cotacao_bid_frete_internacional',
    rotulo: 'Origem',
    obrigatorio: false,
    grupo: 'essencial',
    aliases: ['origin', 'origem nome', 'port of loading name', 'cidade origem'],
  },
  {
    campo: 'origem_pais_cotacao_bid_frete_internacional',
    rotulo: 'Pais origem',
    obrigatorio: false,
    grupo: 'essencial',
    aliases: ['origin country', 'pais origem', 'country origin'],
  },
  {
    campo: 'endereco_origem_cotacao_bid_frete_internacional',
    rotulo: 'Endereco origem',
    obrigatorio: false,
    grupo: 'essencial',
    aliases: ['origin address', 'endereco origem', 'address origin'],
  },
  {
    campo: 'porto_destino_cotacao_bid_frete_internacional',
    rotulo: 'Porto destino',
    obrigatorio: false,
    grupo: 'essencial',
    aliases: ['pod', 'port of discharge', 'destino porto', 'porto destino', 'port destination'],
  },
  {
    campo: 'aeroporto_destino_cotacao_bid_frete_internacional',
    rotulo: 'Aeroporto destino',
    obrigatorio: false,
    grupo: 'essencial',
    aliases: ['aod', 'airport destination', 'destino aeroporto', 'aeroporto destino'],
  },
  {
    campo: 'destino_nome_cotacao_bid_frete_internacional',
    rotulo: 'Destino',
    obrigatorio: false,
    grupo: 'essencial',
    aliases: ['destination', 'destino nome', 'port of discharge name', 'cidade destino'],
  },
  {
    campo: 'destino_pais_cotacao_bid_frete_internacional',
    rotulo: 'Pais destino',
    obrigatorio: false,
    grupo: 'essencial',
    aliases: ['destination country', 'pais destino', 'country destination'],
  },
  {
    campo: 'endereco_destino_cotacao_bid_frete_internacional',
    rotulo: 'Endereco destino',
    obrigatorio: false,
    grupo: 'essencial',
    aliases: ['destination address', 'endereco destino', 'address destination'],
  },
  {
    campo: 'descricao_mercadoria_cotacao_bid_frete_internacional',
    rotulo: 'Descricao mercadoria',
    obrigatorio: true,
    grupo: 'essencial',
    aliases: ['commodity', 'goods', 'cargo', 'mercadoria', 'description', 'descricao', 'carga', 'descricao da mercadoria'],
  },
  {
    campo: 'ncm_cotacao_bid_frete_internacional',
    rotulo: 'NCM',
    obrigatorio: false,
    grupo: 'detalhes',
    aliases: ['ncm', 'hs code', 'tariff code', 'codigo ncm'],
  },
  {
    campo: 'quantidade_volume_cotacao_bid_frete_internacional',
    rotulo: 'Quantidade de Volume',
    obrigatorio: true,
    grupo: 'essencial',
    aliases: ['qty', 'quantity', 'volume', 'packages', 'quantidade', 'qtd volumes', 'qtde', 'quantidade volume'],
  },
  {
    campo: 'tipo_container_cotacao_bid_frete_internacional',
    rotulo: 'Tipo container',
    obrigatorio: false,
    grupo: 'detalhes',
    aliases: ['container', 'container type', 'tipo container', 'equipamento'],
  },
  {
    campo: 'peso_kg_cotacao_bid_frete_internacional',
    rotulo: 'Peso (kg)',
    obrigatorio: false,
    grupo: 'detalhes',
    aliases: ['peso', 'weight', 'gross weight', 'peso kg', 'peso bruto'],
  },
  {
    campo: 'cubagem_m3_cotacao_bid_frete_internacional',
    rotulo: 'Volume (m3)',
    obrigatorio: false,
    grupo: 'detalhes',
    aliases: ['cubagem', 'cbm', 'volume m3', 'measurement'],
  },
  {
    campo: 'incoterm_cotacao_bid_frete_internacional',
    rotulo: 'Incoterm',
    obrigatorio: true,
    grupo: 'essencial',
    aliases: ['incoterms', 'terms', 'termo comercial', 'condicao entrega'],
  },
  {
    campo: 'zipcode_origem_cotacao_bid_frete_internacional',
    rotulo: 'Zipcode origem',
    obrigatorio: false,
    grupo: 'detalhes',
    aliases: ['zip origem', 'cep origem', 'postal code origin'],
  },
  {
    campo: 'zipcode_destino_cotacao_bid_frete_internacional',
    rotulo: 'Zipcode destino',
    obrigatorio: false,
    grupo: 'detalhes',
    aliases: ['zip destino', 'cep destino', 'postal code destination'],
  },
  {
    campo: 'valor_meta_cotacao_bid_frete_internacional',
    rotulo: 'Valor meta',
    obrigatorio: false,
    grupo: 'detalhes',
    aliases: ['target', 'target value', 'valor alvo', 'budget'],
  },
  {
    campo: 'moeda_meta_cotacao_bid_frete_internacional',
    rotulo: 'Moeda meta',
    obrigatorio: false,
    grupo: 'detalhes',
    aliases: ['currency', 'moeda', 'target currency'],
  },
  {
    campo: 'visibilidade_cotacao_bid_frete_internacional',
    rotulo: 'Visibilidade',
    obrigatorio: false,
    grupo: 'detalhes',
    aliases: ['visibility', 'tipo visibilidade'],
  },
  {
    campo: 'anonima_cotacao_bid_frete_internacional',
    rotulo: 'Anonima',
    obrigatorio: false,
    grupo: 'detalhes',
    aliases: ['anonymous', 'anonimo', 'cotacao anonima'],
  },
  {
    campo: 'data_limite_resposta_cotacao_bid_frete_internacional',
    rotulo: 'Prazo resposta',
    obrigatorio: false,
    grupo: 'detalhes',
    aliases: ['deadline', 'data limite', 'prazo resposta', 'response deadline'],
  },
  {
    campo: 'data_aprovacao_cotacao_bid_frete_internacional',
    rotulo: 'Data aprovacao',
    obrigatorio: false,
    grupo: 'detalhes',
    aliases: ['approval date', 'data aprovacao'],
  },
  {
    campo: 'data_cancelamento_cotacao_bid_frete_internacional',
    rotulo: 'Data cancelamento',
    obrigatorio: false,
    grupo: 'detalhes',
    aliases: ['cancellation date', 'data cancelamento'],
  },
  {
    campo: 'motivo_reprovacao_cotacao_bid_frete_internacional',
    rotulo: 'Motivo reprovacao',
    obrigatorio: false,
    grupo: 'detalhes',
    aliases: ['rejection reason', 'motivo reprovacao'],
  },
  {
    campo: 'motivo_cancelamento_cotacao_bid_frete_internacional',
    rotulo: 'Motivo cancelamento',
    obrigatorio: false,
    grupo: 'detalhes',
    aliases: ['cancellation reason', 'motivo cancelamento'],
  },
  {
    campo: 'origem_codigo_cotacao_bid_frete_internacional',
    rotulo: 'Origem (codigo)',
    obrigatorio: false,
    grupo: 'detalhes',
    incluirTemplateGravity: false,
    aliases: ['origem codigo', 'origin code', 'loc origem', 'unlocode origem'],
  },
  {
    campo: 'destino_codigo_cotacao_bid_frete_internacional',
    rotulo: 'Destino (codigo)',
    obrigatorio: false,
    grupo: 'detalhes',
    incluirTemplateGravity: false,
    aliases: ['destino codigo', 'destination code', 'loc destino', 'unlocode destino'],
  },
] as const

export const CAMPOS_TEMPLATE_GRAVITY_META = CAMPOS_IMPORTACAO_BID_FRETE_INTERNACIONAL.filter(
  c => c.incluirTemplateGravity !== false,
)

export const CAMPOS_ESSENCIAIS_IMPORTACAO_BID: ReadonlySet<CampoImportacaoBidFreteInternacional> = new Set(
  CAMPOS_IMPORTACAO_BID_FRETE_INTERNACIONAL.filter(c => c.obrigatorio).map(c => c.campo),
)

function buildRotuloMap(): Map<string, CampoImportacaoBidMeta> {
  const map = new Map<string, CampoImportacaoBidMeta>()
  for (const meta of CAMPOS_IMPORTACAO_BID_FRETE_INTERNACIONAL) {
    map.set(normalizarNomeCampoImportacaoBidFreteInternacional(meta.rotulo), meta)
  }
  return map
}

function buildNomeInternoMap(): Map<string, CampoImportacaoBidMeta> {
  const map = new Map<string, CampoImportacaoBidMeta>()
  for (const meta of CAMPOS_IMPORTACAO_BID_FRETE_INTERNACIONAL) {
    map.set(normalizarNomeCampoImportacaoBidFreteInternacional(meta.campo), meta)
  }
  return map
}

function buildAliasMap(): Map<string, CampoImportacaoBidMeta[]> {
  const map = new Map<string, CampoImportacaoBidMeta[]>()
  for (const meta of CAMPOS_IMPORTACAO_BID_FRETE_INTERNACIONAL) {
    for (const alias of meta.aliases) {
      const key = normalizarNomeCampoImportacaoBidFreteInternacional(alias)
      const atual = map.get(key) ?? []
      atual.push(meta)
      map.set(key, atual)
    }
  }
  return map
}

export const CAMPO_BID_POR_ROTULO = buildRotuloMap()
export const CAMPO_BID_POR_NOME_INTERNO = buildNomeInternoMap()
export const CAMPO_BID_POR_ALIAS = buildAliasMap()

export function rotuloCampoImportacaoBid(campo: CampoImportacaoBidFreteInternacional): string {
  return CAMPOS_IMPORTACAO_BID_FRETE_INTERNACIONAL.find(c => c.campo === campo)?.rotulo ?? campo
}

export function criarLinhaImportacaoVaziaBid(): LinhaImportacaoBidFreteInternacional {
  return Object.fromEntries(
    CAMPOS_IMPORTACAO_BID_FRETE_INTERNACIONAL.map(c => [c.campo, '']),
  ) as LinhaImportacaoBidFreteInternacional
}

/** Detecta linha de cabeçalho quando há super-header (template Gravity) ou nomes internos legados. */
export function detectarLinhaCabecalhoImportacaoBid(rows: readonly (readonly string[])[]): number {
  let bestIdx = 0
  let bestScore = 0

  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const row = rows[i]
    if (!row.some(c => c.trim().length > 0)) continue

    const firstCell = row[0]?.trim() ?? ''
    if (/^(essencial|detalhes|ope|opcional)/i.test(firstCell)) continue

    let score = 0
    for (const cell of row) {
      const norm = normalizarNomeCampoImportacaoBidFreteInternacional(cell)
      if (CAMPO_BID_POR_ROTULO.has(norm) || CAMPO_BID_POR_NOME_INTERNO.has(norm)) {
        score++
      }
    }

    if (score > bestScore) {
      bestScore = score
      bestIdx = i
    }
  }

  return bestScore >= 3 ? bestIdx : 0
}

export function rotuloTemplateImportacaoBid(meta: CampoImportacaoBidMeta): string {
  return meta.obrigatorio ? `* ${meta.rotulo}` : meta.rotulo
}

export function resolverCodigoOrigemImportacao(row: LinhaImportacaoBidFreteInternacional): string {
  return (
    row.porto_origem_cotacao_bid_frete_internacional?.trim()
    || row.aeroporto_origem_cotacao_bid_frete_internacional?.trim()
    || row.origem_codigo_cotacao_bid_frete_internacional?.trim()
    || ''
  )
}

export function resolverCodigoDestinoImportacao(row: LinhaImportacaoBidFreteInternacional): string {
  return (
    row.porto_destino_cotacao_bid_frete_internacional?.trim()
    || row.aeroporto_destino_cotacao_bid_frete_internacional?.trim()
    || row.destino_codigo_cotacao_bid_frete_internacional?.trim()
    || ''
  )
}
