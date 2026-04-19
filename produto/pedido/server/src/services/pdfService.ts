/**
 * pdfService.ts — Renderização de templates e geração de PDF do Pedido
 *
 * Estratégia:
 *   1. Compila variáveis do pedido + itens + colunas do usuário
 *   2. Renderiza o template HTML via Handlebars
 *   3. Tenta gerar PDF via Puppeteer (se disponível)
 *   4. Fallback: retorna HTML se Puppeteer não estiver disponível
 *
 * Variáveis suportadas:
 *   {{numero_pedido}}, {{exportador}}, {{fabricante}}, {{incoterm}},
 *   {{moeda}}, {{data_emissao}}, {{valor_total}}, {{quantidade_total}},
 *   {{tenant_nome}}, {{data_geracao}}, {{coluna_nome_da_coluna}},
 *   {{#itens}} ... {{/itens}} com {{item.part_number}}, etc.
 */

import Handlebars from 'handlebars'

// ── Tipos internos ───────────────────────────────────────────────────────────

interface PedidoParaTemplate {
  numero_pedido: string
  tipo_operacao: string
  nome_exportador?: string | null
  nome_fabricante?: string | null
  incoterm?: string | null
  data_emissao_pedido: string
  valor_total_pedido?: number | null
  quantidade_total_pedido?: number | null
  itens: ItemParaTemplate[]
  [key: string]: unknown
}

interface ItemParaTemplate {
  part_number: string
  descricao_item: string
  ncm: string
  quantidade_atual_pedido: number
  quantidade_inicial_pedido: number
  [key: string]: unknown
}

export interface VariaveisTemplate {
  numero_pedido: string
  tipo_operacao: string
  exportador: string
  fabricante: string
  incoterm: string
  data_emissao: string
  valor_total: string
  quantidade_total: string
  tenant_nome: string
  data_geracao: string
  itens: Record<string, unknown>[]
  [key: string]: unknown
}

// ── Compilação de variáveis ──────────────────────────────────────────────────

export function compilarVariaveis(
  pedido: PedidoParaTemplate,
  tenantNome: string
): VariaveisTemplate {
  const dataGeracao = new Date().toLocaleDateString('pt-BR')
  const dataEmissao = pedido.data_emissao_pedido
    ? new Date(pedido.data_emissao_pedido).toLocaleDateString('pt-BR')
    : ''

  const itens: Record<string, unknown>[] = (pedido.itens ?? []).map(item => {
    const base: Record<string, unknown> = { ...item }
    // Aliases convenientes para templates — sobrescrevem os campos originais
    base['quantidade'] = item.quantidade_atual_pedido
    return base
  })

  const vars: VariaveisTemplate = {
    numero_pedido: pedido.numero_pedido,
    tipo_operacao: pedido.tipo_operacao,
    exportador: pedido.nome_exportador ?? '',
    fabricante: pedido.nome_fabricante ?? '',
    incoterm: pedido.incoterm ?? '',
    data_emissao: dataEmissao,
    valor_total: pedido.valor_total_pedido != null
      ? pedido.valor_total_pedido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
      : '',
    quantidade_total: pedido.quantidade_total_pedido != null
      ? pedido.quantidade_total_pedido.toLocaleString('pt-BR')
      : '',
    tenant_nome: tenantNome,
    data_geracao: dataGeracao,
    itens,
  }

  // Expor campos extras do pedido (colunas do usuário) como coluna_*
  for (const [chave, valor] of Object.entries(pedido)) {
    if (!(chave in vars)) {
      vars[`coluna_${chave}`] = valor
    }
  }

  return vars
}

// ── Renderização Handlebars ──────────────────────────────────────────────────

export function renderizarTemplate(conteudoHtml: string, variaveis: VariaveisTemplate): string {
  // Registrar helper para loop de itens com alias 'item'
  Handlebars.registerHelper('itens', function (
    this: unknown,
    _context: unknown,
    options: Handlebars.HelperOptions
  ) {
    let resultado = ''
    const lista = (variaveis.itens ?? []) as Record<string, unknown>[]
    for (const item of lista) {
      resultado += options.fn({ ...this as object, item })
    }
    return resultado
  })

  const template = Handlebars.compile(conteudoHtml, { noEscape: false })
  return template(variaveis)
}

// ── Geração de PDF ───────────────────────────────────────────────────────────

/**
 * Tenta gerar PDF com Puppeteer.
 * Se Puppeteer não estiver instalado, retorna o HTML como fallback
 * (a rota retorna o arquivo HTML com content-type application/pdf e aviso).
 */
export async function gerarPdfBuffer(htmlFinal: string): Promise<{ buffer: Buffer; isPdf: boolean }> {
  try {
    // Importação dinâmica para não bloquear se Puppeteer não estiver instalado.
    // O uso de eval contorna a análise estática do TypeScript que tenta resolver o módulo
    // em tempo de compilação — comportamento intencional para o fallback gracioso.
    // eslint-disable-next-line no-new-func
    const puppeteer = await Function('m', 'return import(m)')('puppeteer').catch(() => null) as {
      default: {
        launch: (opts: Record<string, unknown>) => Promise<{
          newPage: () => Promise<{
            setContent: (html: string, opts: Record<string, unknown>) => Promise<void>
            pdf: (opts: Record<string, unknown>) => Promise<Uint8Array>
          }>
          close: () => Promise<void>
        }>
      }
    } | null

    if (!puppeteer) {
      return { buffer: Buffer.from(htmlFinal, 'utf-8'), isPdf: false }
    }

    const browser = await puppeteer.default.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    try {
      const page = await browser.newPage()
      await page.setContent(htmlFinal, { waitUntil: 'networkidle0' })
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
      })
      return { buffer: Buffer.from(pdfBuffer), isPdf: true }
    } finally {
      await browser.close()
    }
  } catch {
    // Puppeteer falhou — retornar HTML como fallback
    return { buffer: Buffer.from(htmlFinal, 'utf-8'), isPdf: false }
  }
}

// ── Nome do arquivo gerado ───────────────────────────────────────────────────

export function gerarNomeArquivoPdf(nomeTemplate: string, numeroPedido: string): string {
  const data = new Date().toISOString().slice(0, 10)
  const nomeLimpo = nomeTemplate.replace(/[^a-zA-Z0-9_-]/g, '_')
  const pedidoLimpo = numeroPedido.replace(/[^a-zA-Z0-9_-]/g, '_')
  return `${nomeLimpo}_${pedidoLimpo}_${data}.pdf`
}
