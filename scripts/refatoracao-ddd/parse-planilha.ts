// =====================================================================
// Refatoração DDD — parser da planilha_geral_gravity.xlsx
// =====================================================================
// Lê abas 1-5, detecta cores (azul=rename, vermelho=delete, amarelo=create)
// e produz um PlanoCompleto JSON (scripts/refatoracao-ddd/plano.json).
//
// Uso:
//   tsx scripts/refatoracao-ddd/parse-planilha.ts <caminho-da-xlsx>
// =====================================================================

import XLSX from 'xlsx'
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '..', '..')

// Mapa serviço → fragment.prisma (duplicado em aplicar-prisma.ts)
const FRAGMENT_POR_SERVICO: Record<string, string> = {
  Configurador: 'servicos-global/configurador/prisma/schema.prisma',
  Cadastros: 'servicos-global/tenant/cadastros/prisma/fragment.prisma',
  'Produto - Pedido': 'produto/pedido/server/prisma/fragment.prisma',
  'Produto - SimulaCusto': 'produtos/simulacusto/server/prisma/fragment.prisma',
  'Produto - LPCO': 'produto/lpco/server/prisma/fragment.prisma',
  'Produto - NF Importacao': 'produto/nf-importacao/server/prisma/fragment.prisma',
}

// Extrai { modelo → Set<fieldName> } do fragment.prisma
function extrairCamposDoFragment(caminho: string): Map<string, Set<string>> {
  const mapa = new Map<string, Set<string>>()
  if (!existsSync(caminho)) return mapa
  const src = readFileSync(caminho, 'utf8')
  const reModel = /model\s+(\w+)\s*\{([\s\S]*?)\n\}/g
  let m: RegExpExecArray | null
  while ((m = reModel.exec(src)) !== null) {
    const [_, nome, corpo] = m
    const campos = new Set<string>()
    for (const linha of corpo.split('\n')) {
      const t = linha.trim()
      if (!t || t.startsWith('//') || t.startsWith('@@')) continue
      const mf = /^(\w+)\s+/.exec(t)
      if (mf) campos.add(mf[1])
    }
    mapa.set(nome, campos)
    mapa.set(nome.toLowerCase(), campos) // lookup case-insensitive
  }
  return mapa
}
import type {
  CampoRefactor,
  ModelRefactor,
  EnumRefactor,
  RotaRefactor,
  PlanoServico,
  PlanoCompleto,
  AcaoCampo,
} from './tipos.ts'

const COR_RENAME = '0000FF' // azul
const COR_DELETE = 'FF0000' // vermelho
const COR_CREATE = 'FFFF00' // amarelo

const ABA_CAMPOS = '1.ddd_campos'
const ABA_API = '2. ddd_api'
const ABA_MODELS = '3. tabelas-models'
const ABA_ENUMS = '4. mapa-enums'
const ABA_ROTAS = '5. mapa-rotas'

// ---------------------------------------------------------------------
// Utilidades de célula
// ---------------------------------------------------------------------
function getCellFill(ws: XLSX.WorkSheet, addr: string): string {
  const c = (ws as any)[addr]
  if (!c?.s) return ''
  return (c.s.fgColor?.rgb || c.s.bgColor?.rgb || '').toUpperCase()
}

function getCellValue(ws: XLSX.WorkSheet, addr: string): string {
  const c = (ws as any)[addr]
  return c?.v != null ? String(c.v).trim() : ''
}

function colLetter(idx: number): string {
  // idx 0-based → A, B, ..., Z, AA, AB
  let s = ''
  let n = idx
  while (n >= 0) {
    s = String.fromCharCode(65 + (n % 26)) + s
    n = Math.floor(n / 26) - 1
  }
  return s
}

// ---------------------------------------------------------------------
// Mapeia "Local" (coluna da planilha) → nome canônico do serviço
// ---------------------------------------------------------------------
function normalizarServico(local: string): string {
  const l = local.toLowerCase().trim()
  if (l.includes('configurador')) return 'Configurador'
  if (l.includes('cadastros')) return 'Cadastros'
  if (l.includes('tenant')) return 'Tenant'
  if (l.includes('pedido')) return 'Produto - Pedido'
  if (l.includes('simulacusto') || l.includes('simula-custo')) return 'Produto - SimulaCusto'
  if (l.includes('lpco')) return 'Produto - LPCO'
  if (l.includes('nf importa') || l.includes('nf_importa')) return 'Produto - NF Importacao'
  return local || 'Desconhecido'
}

// ---------------------------------------------------------------------
// Aba 1 — campos
// ---------------------------------------------------------------------
interface CamposParsed {
  porServico: Map<string, CampoRefactor[]>
  total: number
}

function parseCampos(ws: XLSX.WorkSheet): CamposParsed {
  const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, raw: false, defval: '' })
  const porServico = new Map<string, CampoRefactor[]>()
  let total = 0

  // Headers da aba 1.ddd_campos (confirmados):
  //  A Local | B Tabela | C Entidade | D Nome PG | E Nome Prisma
  //  F Nome DDD | G back Atual | H back DDD | I front Atual | J front DDD
  //  K tela Atual | L tela DDD | M Local Tela | N Descricao
  //  O Tipo Dado | P Produto Gravity | Q Natureza | R Tipo de Dado
  //  S Formato | T Validacao | U Obrigatorio | V Editavel
  //  W Valor Padrao | X Exemplo | Y Componente | Z Origem
  for (let r = 1; r < rows.length; r++) {
    const linha = r + 1
    const local = getCellValue(ws, 'A' + linha)
    const tabela = getCellValue(ws, 'B' + linha)
    if (!tabela) continue

    const pgAtual = getCellValue(ws, 'D' + linha)
    const prismaAtual = getCellValue(ws, 'E' + linha)
    const pgNovo = getCellValue(ws, 'F' + linha)
    const backAtual = getCellValue(ws, 'G' + linha)
    const backNovo = getCellValue(ws, 'H' + linha)
    const frontAtual = getCellValue(ws, 'I' + linha)
    const frontNovo = getCellValue(ws, 'J' + linha)

    // Cor da coluna F (Nome no banco DDD) — principal indicador
    const fillF = getCellFill(ws, 'F' + linha)
    const fillD = getCellFill(ws, 'D' + linha)

    let acao: AcaoCampo | null = null
    if (fillF === COR_RENAME || fillD === COR_RENAME) acao = 'RENAME'
    else if (fillF === COR_DELETE || fillD === COR_DELETE) acao = 'DELETE'
    else if (fillF === COR_CREATE || fillD === COR_CREATE) acao = 'CREATE'

    // Heurística extra: se pgNovo tem conteudo e é diferente de pgAtual → RENAME
    if (!acao && pgNovo && pgAtual && pgNovo !== pgAtual) acao = 'RENAME'
    // Heurística extra: se pgAtual está marcado como "— (não existe no banco)" → CREATE
    if (!acao && pgAtual.startsWith('—') && pgNovo) acao = 'CREATE'

    if (!acao) continue

    const servico = normalizarServico(local)
    const c: CampoRefactor = {
      linha,
      acao,
      servico,
      tabela,
      pgAtual,
      pgNovo: pgNovo || pgAtual,
      prismaAtual,
      prismaNovo: pgNovo || prismaAtual, // REGRA 02: prisma = pg
      backAtual,
      backNovo: backNovo || backAtual,
      frontAtual,
      frontNovo: frontNovo || frontAtual,
      descricao: getCellValue(ws, 'N' + linha),
      tipoDado: getCellValue(ws, 'O' + linha) || getCellValue(ws, 'R' + linha),
      obrigatorio: /sim/i.test(getCellValue(ws, 'U' + linha)),
      valorPadrao: getCellValue(ws, 'W' + linha),
    }

    const arr = porServico.get(servico) ?? []
    arr.push(c)
    porServico.set(servico, arr)
    total++
  }

  return { porServico, total }
}

// ---------------------------------------------------------------------
// Aba 3 — models
// ---------------------------------------------------------------------
function parseModels(ws: XLSX.WorkSheet): Map<string, ModelRefactor[]> {
  const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, raw: false, defval: '' })
  const porServico = new Map<string, ModelRefactor[]>()

  // Headers aba 3: A Local | B PG Atual | C PG DDD | D Prisma Atual
  //   E Prisma DDD | ... | Y Arquivo fragment
  for (let r = 1; r < rows.length; r++) {
    const linha = r + 1
    const local = getCellValue(ws, 'A' + linha)
    const pgAtual = getCellValue(ws, 'B' + linha)
    if (!pgAtual) continue

    const pgNovo = getCellValue(ws, 'C' + linha)
    const prismaAtual = getCellValue(ws, 'D' + linha)
    const prismaNovo = getCellValue(ws, 'E' + linha)
    const fillC = getCellFill(ws, 'C' + linha)
    const fillB = getCellFill(ws, 'B' + linha)

    let acao: 'RENAME' | 'DELETE' | null = null
    if (fillC === COR_RENAME || fillB === COR_RENAME) acao = 'RENAME'
    else if (fillC === COR_DELETE || fillB === COR_DELETE) acao = 'DELETE'
    else if (pgNovo && pgNovo !== pgAtual) acao = 'RENAME'
    else if (prismaNovo && prismaNovo !== prismaAtual) acao = 'RENAME'

    if (!acao) continue

    const servico = normalizarServico(local)
    const m: ModelRefactor = {
      linha,
      acao,
      servico,
      pgAtual,
      pgNovo: pgNovo || pgAtual,
      prismaAtual,
      // REGRA 02: Prisma = PG (sem @map). Sobrescreve se planilha divergir.
      prismaNovo: pgNovo || prismaNovo || prismaAtual,
      descricao: getCellValue(ws, 'F' + linha),
      arquivoFragment: getCellValue(ws, 'Y' + linha),
    }
    const arr = porServico.get(servico) ?? []
    arr.push(m)
    porServico.set(servico, arr)
  }

  return porServico
}

// ---------------------------------------------------------------------
// Aba 4 — enums
// REGRA 07: valores mantidos em EN UPPER_SNAKE. Só o NOME é traduzido.
// ---------------------------------------------------------------------
function parseEnums(ws: XLSX.WorkSheet): Map<string, EnumRefactor[]> {
  const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, raw: false, defval: '' })
  const porServico = new Map<string, EnumRefactor[]>()
  // Agrega por (servico+nomeAtual) pois cada linha é um valor
  const bucket = new Map<string, EnumRefactor>()

  // Headers: A Local | B Nome Enum Prisma | C Nome Enum DDD
  //   D Descricao | E Valor PG | F Valor DDD | G Valor Prisma
  for (let r = 1; r < rows.length; r++) {
    const linha = r + 1
    const local = getCellValue(ws, 'A' + linha)
    const nomeAtual = getCellValue(ws, 'B' + linha)
    if (!nomeAtual) continue

    const nomeNovo = getCellValue(ws, 'C' + linha) || nomeAtual
    const valorAtual = getCellValue(ws, 'E' + linha)
    const servico = normalizarServico(local)
    const key = `${servico}::${nomeAtual}`

    if (!bucket.has(key)) {
      bucket.set(key, {
        linha,
        servico,
        nomeAtual,
        nomeNovo,
        valoresAtuais: [],
      })
    }
    const ref = bucket.get(key)!
    if (valorAtual && !ref.valoresAtuais.includes(valorAtual)) {
      ref.valoresAtuais.push(valorAtual)
    }
  }

  for (const ref of bucket.values()) {
    // Só interessa se o nome muda
    if (ref.nomeAtual === ref.nomeNovo) continue
    const arr = porServico.get(ref.servico) ?? []
    arr.push(ref)
    porServico.set(ref.servico, arr)
  }

  return porServico
}

// ---------------------------------------------------------------------
// Aba 5 — rotas
// ---------------------------------------------------------------------
function parseRotas(ws: XLSX.WorkSheet): Map<string, RotaRefactor[]> {
  const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, raw: false, defval: '' })
  const porServico = new Map<string, RotaRefactor[]>()

  // Headers: A Metodo | B Rota Atual | C Rota DDD | D Explicacao
  //   E Prefixo Mount | F Path | G Local | H Produto/Servico
  //   I Arquivo rota | ...
  for (let r = 1; r < rows.length; r++) {
    const linha = r + 1
    const metodo = getCellValue(ws, 'A' + linha).toUpperCase()
    const rotaAtual = getCellValue(ws, 'B' + linha)
    if (!rotaAtual || !metodo) continue

    const rotaNova = getCellValue(ws, 'C' + linha)
    const fillC = getCellFill(ws, 'C' + linha)
    const fillB = getCellFill(ws, 'B' + linha)

    let acao: 'RENAME' | 'DELETE' | null = null
    if (fillC === COR_RENAME || fillB === COR_RENAME) acao = 'RENAME'
    else if (fillC === COR_DELETE || fillB === COR_DELETE) acao = 'DELETE'
    else if (rotaNova && rotaNova !== rotaAtual) acao = 'RENAME'
    if (!acao) continue

    const local = getCellValue(ws, 'G' + linha)
    const servico = normalizarServico(local)
    const r_: RotaRefactor = {
      linha,
      acao,
      metodo: metodo as RotaRefactor['metodo'],
      servico,
      rotaAtual,
      rotaNova: rotaNova || rotaAtual,
      prefixoMount: getCellValue(ws, 'E' + linha),
      arquivoRota: getCellValue(ws, 'I' + linha),
      descricao: getCellValue(ws, 'D' + linha),
    }
    const arr = porServico.get(servico) ?? []
    arr.push(r_)
    porServico.set(servico, arr)
  }

  return porServico
}

// ---------------------------------------------------------------------
// Pós-processamento — promove ghost RENAMEs para CREATE
// e aplica exceções de sufixo (regra B do dono)
// ---------------------------------------------------------------------
function promoverGhosts(
  campos: CampoRefactor[],
  camposDoFragment: Map<string, Set<string>>,
): CampoRefactor[] {
  const out: CampoRefactor[] = []
  for (const c of campos) {
    if (c.acao !== 'RENAME') {
      out.push(c)
      continue
    }
    // linhas-lixo: "— (não existe no banco)"
    const pgAtualLixo = /não existe no banco/i.test(c.pgAtual)
    const pgNovoLixo = /não existe no banco/i.test(c.pgNovo)
    if (pgAtualLixo && pgNovoLixo) continue // pula completamente
    if (pgAtualLixo && !pgNovoLixo) {
      out.push({ ...c, acao: 'CREATE', pgAtual: '', prismaAtual: '', backAtual: '', frontAtual: '' })
      continue
    }
    if (pgNovoLixo) continue // deleta linha se destino é lixo
    const campos = camposDoFragment.get(c.tabela) || camposDoFragment.get(c.tabela.toLowerCase())
    if (campos && !campos.has(c.prismaAtual) && !campos.has(c.pgAtual)) {
      // Campo não existe no fragment → ghost, promover para CREATE
      out.push({
        ...c,
        acao: 'CREATE',
        pgAtual: '',
        prismaAtual: '',
        backAtual: '',
        frontAtual: '',
      })
      continue
    }
    out.push(c)
  }
  return out
}

function aplicarExcecoesSufixo(
  campos: CampoRefactor[],
  modelsDoServico: ModelRefactor[],
): CampoRefactor[] {
  // Mapa tabela atual → tabela nova (para saber nome lowercase pós-rename)
  const renamePorTabela = new Map<string, string>()
  for (const m of modelsDoServico) {
    if (m.acao === 'RENAME') renamePorTabela.set(m.pgAtual, m.pgNovo)
  }

  return campos.map((c) => {
    if (c.acao !== 'RENAME') return c

    const tabelaAntigaLc = c.tabela.toLowerCase()
    const tabelaNovaLc = (renamePorTabela.get(c.tabela) || c.tabela).toLowerCase()

    const jaTemSufixoTabela =
      c.pgAtual.endsWith('_' + tabelaAntigaLc) || c.pgAtual.endsWith('_' + tabelaNovaLc)

    // FK para outra tabela: id_<X> onde X != tabela atual
    const fkMatch = /^id_([a-z0-9_]+)$/.exec(c.pgAtual)
    const ehFkParaOutra =
      fkMatch && fkMatch[1] !== tabelaAntigaLc && fkMatch[1] !== tabelaNovaLc

    if (jaTemSufixoTabela || ehFkParaOutra) {
      // Cancela a rename — mantém nome original em todas as camadas
      return {
        ...c,
        pgNovo: c.pgAtual,
        prismaNovo: c.prismaAtual || c.pgAtual,
        backNovo: c.backAtual || c.pgAtual,
        frontNovo: c.frontAtual || c.pgAtual,
      }
    }
    return c
  })
}

// ---------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------
function main() {
  const caminho = process.argv[2]
  if (!caminho) {
    console.error('Uso: tsx parse-planilha.ts <caminho-da-xlsx>')
    process.exit(1)
  }
  const abs = resolve(caminho)
  console.log(`[parse-planilha] lendo ${abs}`)
  const wb = XLSX.readFile(abs, { cellStyles: true })

  const campos = parseCampos(wb.Sheets[ABA_CAMPOS])
  const models = parseModels(wb.Sheets[ABA_MODELS])
  const enums = parseEnums(wb.Sheets[ABA_ENUMS])
  const rotas = parseRotas(wb.Sheets[ABA_ROTAS])

  const todosServicos = new Set<string>([
    ...campos.porServico.keys(),
    ...models.keys(),
    ...enums.keys(),
    ...rotas.keys(),
  ])

  const servicos: Record<string, PlanoServico> = {}
  for (const s of todosServicos) {
    let cs = campos.porServico.get(s) ?? []
    const ms = models.get(s) ?? []
    const es = enums.get(s) ?? []
    const rs = rotas.get(s) ?? []

    // Pós-processamento: promover ghosts + exceções de sufixo
    const fragRel = FRAGMENT_POR_SERVICO[s]
    if (fragRel) {
      const fragPath = resolve(ROOT, fragRel)
      const camposFrag = extrairCamposDoFragment(fragPath)
      cs = promoverGhosts(cs, camposFrag)
    }
    cs = aplicarExcecoesSufixo(cs, ms)

    servicos[s] = {
      servico: s,
      campos: cs,
      models: ms,
      enums: es,
      rotas: rs,
      contagem: {
        renameCampos: cs.filter((c) => c.acao === 'RENAME').length,
        deleteCampos: cs.filter((c) => c.acao === 'DELETE').length,
        createCampos: cs.filter((c) => c.acao === 'CREATE').length,
        renameModels: ms.filter((m) => m.acao === 'RENAME').length,
        deleteModels: ms.filter((m) => m.acao === 'DELETE').length,
        renameEnums: es.length,
        renameRotas: rs.filter((r) => r.acao === 'RENAME').length,
        deleteRotas: rs.filter((r) => r.acao === 'DELETE').length,
      },
    }
  }

  const plano: PlanoCompleto = {
    geradoEm: new Date().toISOString(),
    planilha: abs,
    servicos,
    totalGeral: {
      campos: campos.total,
      models: Array.from(models.values()).reduce((a, x) => a + x.length, 0),
      enums: Array.from(enums.values()).reduce((a, x) => a + x.length, 0),
      rotas: Array.from(rotas.values()).reduce((a, x) => a + x.length, 0),
    },
  }

  const out = resolve(__dirname, 'plano.json')
  writeFileSync(out, JSON.stringify(plano, null, 2), 'utf8')
  console.log(`[parse-planilha] plano salvo em ${out}`)
  console.log(`  Serviços:  ${Object.keys(servicos).length}`)
  console.log(`  Campos:    ${plano.totalGeral.campos}`)
  console.log(`  Models:    ${plano.totalGeral.models}`)
  console.log(`  Enums:     ${plano.totalGeral.enums}`)
  console.log(`  Rotas:     ${plano.totalGeral.rotas}`)
  for (const s of Object.keys(servicos).sort()) {
    const c = servicos[s].contagem
    console.log(
      `  [${s}] campos: ${c.renameCampos}R/${c.deleteCampos}D/${c.createCampos}C | models: ${c.renameModels}R/${c.deleteModels}D | enums: ${c.renameEnums}R | rotas: ${c.renameRotas}R/${c.deleteRotas}D`,
    )
  }
}

main()
