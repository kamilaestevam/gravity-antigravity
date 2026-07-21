/**
 * MRU de NCMs usados na Nova Simula (localStorage + seed de simulas recentes).
 * Isolado no produto — SelectNcmGlobal do núcleo não tem lista de recentes.
 */

export type AliquotasNcmPctSimulaCusto = {
  ii?: number | null
  ipi?: number | null
  pis?: number | null
  cofins?: number | null
}

export type NcmRecenteSimulaCusto = {
  codigo: string
  descricao?: string
} & AliquotasNcmPctSimulaCusto

const PIS_PADRAO_IMPORTACAO = 2.1
const COFINS_PADRAO_IMPORTACAO = 9.65

/** Lei 10.865/2004 — padrão de importação quando Cadastros não retorna PIS/COFINS. */
export function aplicarPadraoPisCofinsNcmSimulaCusto(
  aliquotas: AliquotasNcmPctSimulaCusto,
): AliquotasNcmPctSimulaCusto {
  return {
    ...aliquotas,
    pis: aliquotas.pis ?? PIS_PADRAO_IMPORTACAO,
    cofins: aliquotas.cofins ?? COFINS_PADRAO_IMPORTACAO,
  }
}

const CHAVE_STORAGE = 'simula-custo:ultimos-ncm'
/** Máximo de NCMs guardados (localStorage + painel lateral). */
export const LIMITE_ULTIMOS_NCM_SIMULA_CUSTO = 30

const LIMITE_ULTIMOS = LIMITE_ULTIMOS_NCM_SIMULA_CUSTO

function soDigitosNcm(valor: string): string {
  return valor.replace(/\D/g, '').slice(0, 8)
}

export function formatarNcmDisplaySimulaCusto(raw: string): string {
  const d = soDigitosNcm(raw)
  if (d.length <= 4) return d
  if (d.length <= 6) return `${d.slice(0, 4)}.${d.slice(4)}`
  return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6)}`
}

function normalizarEntrada(item: NcmRecenteSimulaCusto): NcmRecenteSimulaCusto | null {
  const codigo = soDigitosNcm(item.codigo)
  if (codigo.length !== 8) return null
  const descricao = item.descricao?.trim()
  const base: NcmRecenteSimulaCusto = { codigo }
  if (descricao) base.descricao = descricao
  if (item.ii != null) base.ii = item.ii
  if (item.ipi != null) base.ipi = item.ipi
  if (item.pis != null) base.pis = item.pis
  if (item.cofins != null) base.cofins = item.cofins
  return base
}

function mesclarItemNcm(
  existente: NcmRecenteSimulaCusto,
  novo: NcmRecenteSimulaCusto,
): NcmRecenteSimulaCusto {
  return {
    ...existente,
    ...novo,
    descricao: novo.descricao ?? existente.descricao,
    ii: novo.ii ?? existente.ii,
    ipi: novo.ipi ?? existente.ipi,
    pis: novo.pis ?? existente.pis,
    cofins: novo.cofins ?? existente.cofins,
  }
}

export function mesclarUltimosNcmSimulaCusto(
  ...listas: NcmRecenteSimulaCusto[][]
): NcmRecenteSimulaCusto[] {
  const porCodigo = new Map<string, NcmRecenteSimulaCusto>()
  const ordem: string[] = []

  for (const lista of listas) {
    for (const bruto of lista) {
      const item = normalizarEntrada(bruto)
      if (!item) continue
      const existente = porCodigo.get(item.codigo)
      if (existente) {
        porCodigo.set(item.codigo, mesclarItemNcm(existente, item))
      } else {
        porCodigo.set(item.codigo, item)
        ordem.push(item.codigo)
      }
    }
  }

  return ordem
    .slice(0, LIMITE_ULTIMOS)
    .map((codigo) => porCodigo.get(codigo)!)
}

export function lerUltimosNcmSimulaCusto(): NcmRecenteSimulaCusto[] {
  if (typeof window === 'undefined') return []
  try {
    const bruto = window.localStorage.getItem(CHAVE_STORAGE)
    if (!bruto) return []
    const parsed: unknown = JSON.parse(bruto)
    if (!Array.isArray(parsed)) return []
    return mesclarUltimosNcmSimulaCusto(
      parsed.filter(
        (item): item is NcmRecenteSimulaCusto =>
          typeof item === 'object'
          && item !== null
          && typeof (item as NcmRecenteSimulaCusto).codigo === 'string',
      ),
    )
  } catch {
    return []
  }
}

export function registrarUltimoNcmSimulaCusto(
  codigo: string,
  descricao?: string,
  aliquotas?: AliquotasNcmPctSimulaCusto,
): NcmRecenteSimulaCusto[] {
  const atualizado = mesclarUltimosNcmSimulaCusto(
    [{
      codigo,
      descricao,
      ii: aliquotas?.ii,
      ipi: aliquotas?.ipi,
      pis: aliquotas?.pis,
      cofins: aliquotas?.cofins,
    }],
    lerUltimosNcmSimulaCusto(),
  )
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(CHAVE_STORAGE, JSON.stringify(atualizado))
    } catch {
      /* quota / private mode — lista em memória ainda vale na sessão */
    }
  }
  return atualizado
}

/** Filtra NCMs recentes por código (dígitos) ou descrição. */
export function filtrarUltimosNcmSimulaCusto(
  itens: NcmRecenteSimulaCusto[],
  termo: string,
): NcmRecenteSimulaCusto[] {
  const q = termo.trim().toLowerCase()
  if (!q) return itens
  const digitos = q.replace(/\D/g, '')
  return itens.filter((item) => {
    if (digitos.length > 0 && item.codigo.includes(digitos)) return true
    return item.descricao?.toLowerCase().includes(q) ?? false
  })
}

/** 30 NCMs de preview (somente dev) para validar o painel lateral. */
function ncmPreview(
  codigo: string,
  descricao: string,
  ii: number,
  ipi: number,
): NcmRecenteSimulaCusto {
  return {
    codigo,
    descricao,
    ii,
    ipi,
    pis: PIS_PADRAO_IMPORTACAO,
    cofins: COFINS_PADRAO_IMPORTACAO,
  }
}

export function ncmsPreviewSimulaCusto(): NcmRecenteSimulaCusto[] {
  return [
    ncmPreview('84148021', 'Turboalimentadores de ar, peso ≤ 50 kg', 14, 5),
    ncmPreview('84713012', 'Máquinas automáticas processamento de dados, portáteis', 0, 0),
    ncmPreview('85044010', 'Retificadores e inversores de potência estática', 14, 9.75),
    ncmPreview('85171231', 'Telefones celulares e outros equipamentos de rede', 0, 0),
    ncmPreview('85287210', 'Monitores com tubo de raios catódicos', 14, 15),
    ncmPreview('85444200', 'Cabos coaxiais e outros condutores elétricos', 10, 5),
    ncmPreview('87032310', 'Automóveis com motor explosão 1500 cm³ a 3000 cm³', 35, 25),
    ncmPreview('87089990', 'Partes e acessórios de veículos automotores', 18, 12),
    ncmPreview('90189099', 'Instrumentos e aparelhos de medicina, parte', 8, 0),
    ncmPreview('94036000', 'Móveis de madeira para escritórios', 16, 5),
    ncmPreview('39269090', 'Outras obras de plástico', 14, 9.75),
    ncmPreview('40111000', 'Pneus novos de borracha para automóveis', 16, 5),
    ncmPreview('73089010', 'Construções e suas partes, de ferro ou aço', 12, 5),
    ncmPreview('84145910', 'Ventiladores de mesa, teto ou parede', 14, 9.75),
    ncmPreview('84213920', 'Aparelhos para filtrar gases', 14, 0),
    ncmPreview('84314929', 'Partes de máquinas de elevação e movimentação', 12, 5),
    ncmPreview('84433111', 'Máquinas de impressão a laser, jato de tinta', 0, 0),
    ncmPreview('84715010', 'Unidades de processamento digitais', 0, 0),
    ncmPreview('84818095', 'Válvulas de retenção e outras válvulas', 14, 5),
    ncmPreview('85011019', 'Motores de corrente contínua, potência ≤ 750 W', 14, 9.75),
    ncmPreview('85043111', 'Transformadores de potência ≤ 1 kVA', 14, 9.75),
    ncmPreview('85176255', 'Aparelhos para comutação de redes de dados', 0, 0),
    ncmPreview('85235110', 'Cartões de memória de dispositivos semicondutores', 0, 0),
    ncmPreview('85366910', 'Tomadas, plugues e outros conectores', 14, 9.75),
    ncmPreview('85423190', 'Processadores e controladores, circuitos integrados', 0, 0),
    ncmPreview('87082999', 'Partes e acessórios de carrocerias', 18, 12),
    ncmPreview('90318099', 'Instrumentos de medida ou verificação', 8, 0),
    ncmPreview('94016100', 'Assentos estofados com armação de madeira', 16, 5),
    ncmPreview('95030099', 'Outros brinquedos e modelos reduzidos', 20, 8),
    ncmPreview('96190000', 'Artigos de higiene ou de toucador', 18, 9.75),
  ]
}

export function semearUltimosNcmSimulaCustoDev(): NcmRecenteSimulaCusto[] {
  if (!import.meta.env.DEV) return lerUltimosNcmSimulaCusto()
  return mesclarUltimosNcmSimulaCusto(
    lerUltimosNcmSimulaCusto(),
    ncmsPreviewSimulaCusto(),
  )
}
