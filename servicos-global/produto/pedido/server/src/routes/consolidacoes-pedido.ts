/**
 * consolidar.ts — Rotas de consolidação de pedidos
 *
 * Rota base: /api/v1/pedidos/consolidacoes
 *
 * Endpoints:
 *   POST /api/v1/pedidos/consolidacoes/preview   — retorna divergências e sugestões
 *   POST /api/v1/pedidos/consolidacoes/confirmar — executa o merge real
 *
 * Regras de negócio:
 *   - Mínimo de 2 pedidos para consolidar
 *   - Pedidos originais recebem deleted_at (soft delete) após merge
 *   - Novo pedido guarda pedidos_origem[] para rastreabilidade
 *   - tenant_id é injetado pelo tenantIsolationMiddleware em todas as queries
 *   - Zod valida entrada antes de qualquer lógica
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { withOrganizacao, type ContextoOrganizacao } from '@gravity/resolver-organizacao'
import { detectarTiposMistos } from '../shared/bulkSchemas.js'
import { auditLog } from '../../../../../../servicos-global/servicos-plataforma/historico-global/src/audit-client.js'
import { resolverIdStatusPedidoOpcional } from '../services/statusPedidoLookup.js'
import { recalcularAgregadosPedido } from '../../../../../../servicos-global/produto/processos-core/src/services/recalcularAgregadosPedido.js'

function gerarId(prefixo: string): string {
  const seq = String(Math.floor(Math.random() * 9999999)).padStart(7, '0')
  const ano = String(new Date().getFullYear()).slice(-2)
  return `${prefixo}_id_${seq}-${ano}`
}

export const consolidarRouter = Router()

// ── Classe de erro local (padrão project) ────────────────────────────────────

class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code: string = 'BAD_REQUEST',
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// ── Zod Schemas ───────────────────────────────────────────────────────────────

const PreviewSchema = z.object({
  ids: z.array(z.string().min(1)).min(2, 'Selecione ao menos 2 pedidos para consolidar'),
})

const ConfirmarSchema = z.object({
  ids: z.array(z.string().min(1)).min(2, 'Selecione ao menos 2 pedidos para consolidar'),
  numero_pedido: z.string().min(1).max(100),
  campos_escolhidos: z.record(z.union([z.string(), z.number(), z.null()])),
  fundir_itens_mesmo_part_number: z.boolean(),
})

// ── Campos que participam da detecção de divergência ─────────────────────────
// Separados em "direto" (coluna Prisma) e "json" (detalhes_operacionais_pedido).
// A flag `grupo` alimenta a UI do DE/PARA em seções colapsáveis.

interface CampoComparar {
  campo: string
  rotulo: string
  grupo: string
  fonte: 'direto' | 'json'
}

const CAMPOS_COMPARAR: CampoComparar[] = [
  // ── Identificação / Comercial ──
  { campo: 'incoterm_pedido',               rotulo: 'Incoterm',                   grupo: 'Comercial',     fonte: 'direto' },
  { campo: 'moeda_pedido',                  rotulo: 'Moeda',                      grupo: 'Comercial',     fonte: 'direto' },
  { campo: 'condicao_pagamento_pedido',     rotulo: 'Condição de Pagamento',      grupo: 'Comercial',     fonte: 'direto' },
  { campo: 'unidade_comercializada_pedido', rotulo: 'Unidade Comercializada',     grupo: 'Comercial',     fonte: 'direto' },

  // ── Exportador ──
  { campo: 'nome_exportador',               rotulo: 'Exportador — Nome',          grupo: 'Exportador',    fonte: 'json' },
  { campo: 'cnpj_exportador',               rotulo: 'Exportador — CNPJ',          grupo: 'Exportador',    fonte: 'json' },
  { campo: 'endereco_exportador',           rotulo: 'Exportador — Endereço',      grupo: 'Exportador',    fonte: 'json' },
  { campo: 'pais_exportador',               rotulo: 'Exportador — País',          grupo: 'Exportador',    fonte: 'json' },
  { campo: 'estado_exportador',             rotulo: 'Exportador — Estado',        grupo: 'Exportador',    fonte: 'json' },
  { campo: 'cidade_exportador',             rotulo: 'Exportador — Cidade',        grupo: 'Exportador',    fonte: 'json' },
  { campo: 'zip_code_exportador',           rotulo: 'Exportador — ZIP Code',      grupo: 'Exportador',    fonte: 'json' },
  { campo: 'exportador_ou_fabricante',      rotulo: 'Exportador ou Fabricante',   grupo: 'Exportador',    fonte: 'json' },
  { campo: 'relacao_exportador_fabricante', rotulo: 'Relação Export./Fabric.',    grupo: 'Exportador',    fonte: 'json' },

  // ── Contato Exportador ──
  { campo: 'nome_contato_exportador',       rotulo: 'Contato — Nome',             grupo: 'Contato Exportador', fonte: 'json' },
  { campo: 'email_contato_exportador',      rotulo: 'Contato — Email',            grupo: 'Contato Exportador', fonte: 'json' },
  { campo: 'whatsapp_contato_exportador',   rotulo: 'Contato — WhatsApp',         grupo: 'Contato Exportador', fonte: 'json' },
  { campo: 'cargo_contato_exportador',      rotulo: 'Contato — Cargo',            grupo: 'Contato Exportador', fonte: 'json' },
  { campo: 'departamento_contato_exportador', rotulo: 'Contato — Departamento',   grupo: 'Contato Exportador', fonte: 'json' },

  // ── Importador ──
  { campo: 'nome_importador',               rotulo: 'Importador — Nome',          grupo: 'Importador',    fonte: 'json' },
  { campo: 'cnpj_importador',               rotulo: 'Importador — CNPJ',          grupo: 'Importador',    fonte: 'json' },

  // ── Fabricante ──
  { campo: 'nome_fabricante',               rotulo: 'Fabricante — Nome',          grupo: 'Fabricante',    fonte: 'json' },
  { campo: 'endereco_fabricante',           rotulo: 'Fabricante — Endereço',      grupo: 'Fabricante',    fonte: 'json' },
  { campo: 'pais_fabricante',               rotulo: 'Fabricante — País',          grupo: 'Fabricante',    fonte: 'json' },
  { campo: 'estado_fabricante',             rotulo: 'Fabricante — Estado',        grupo: 'Fabricante',    fonte: 'json' },
  { campo: 'cidade_fabricante',             rotulo: 'Fabricante — Cidade',        grupo: 'Fabricante',    fonte: 'json' },
  { campo: 'zip_code_fabricante',           rotulo: 'Fabricante — ZIP Code',      grupo: 'Fabricante',    fonte: 'json' },

  // ── OPE ──
  { campo: 'codigo_ope',                    rotulo: 'OPE — Código',               grupo: 'OPE',           fonte: 'json' },
  { campo: 'nome_ope',                      rotulo: 'OPE — Nome',                 grupo: 'OPE',           fonte: 'json' },
  { campo: 'endereco_ope',                  rotulo: 'OPE — Endereço',             grupo: 'OPE',           fonte: 'json' },
  { campo: 'pais_ope',                      rotulo: 'OPE — País',                 grupo: 'OPE',           fonte: 'json' },
  { campo: 'estado_ope',                    rotulo: 'OPE — Estado',               grupo: 'OPE',           fonte: 'json' },
  { campo: 'cidade_ope',                    rotulo: 'OPE — Cidade',               grupo: 'OPE',           fonte: 'json' },
  { campo: 'zip_code_ope',                  rotulo: 'OPE — ZIP Code',             grupo: 'OPE',           fonte: 'json' },
  { campo: 'tin_ope',                       rotulo: 'OPE — TIN',                  grupo: 'OPE',           fonte: 'json' },
  { campo: 'email_ope',                     rotulo: 'OPE — Email',                grupo: 'OPE',           fonte: 'json' },
  { campo: 'situacao_ope',                  rotulo: 'OPE — Situação',             grupo: 'OPE',           fonte: 'json' },
  { campo: 'versao_ope',                    rotulo: 'OPE — Versão',               grupo: 'OPE',           fonte: 'json' },
  { campo: 'cnpj_raiz_empresa_responsavel', rotulo: 'CNPJ Raiz Responsável',      grupo: 'OPE',           fonte: 'json' },

  // ── Câmbio ──
  { campo: 'moeda_cambio_pedido',           rotulo: 'Moeda Câmbio',               grupo: 'Câmbio',        fonte: 'direto' },
  { campo: 'taxa_cambio_estimada_pedido',   rotulo: 'Taxa Câmbio Estimada',       grupo: 'Câmbio',        fonte: 'direto' },
  { campo: 'contrato_cambio_id_pedido',     rotulo: 'Contrato de Câmbio',         grupo: 'Câmbio',        fonte: 'direto' },
  { campo: 'valor_total_cambio_pedido',     rotulo: 'Valor Total Câmbio',         grupo: 'Câmbio',        fonte: 'direto' },
  { campo: 'cobertura_cambial_pedido',      rotulo: 'Cobertura Cambial',          grupo: 'Câmbio',        fonte: 'direto' },

  // ── Documentos / Referências ──
  { campo: 'referencia_importador_pedido',  rotulo: 'Referência Importador',      grupo: 'Documentos',    fonte: 'direto' },
  { campo: 'referencia_exportador_pedido',  rotulo: 'Referência Exportador',      grupo: 'Documentos',    fonte: 'direto' },
  { campo: 'referencia_fabricante_pedido',  rotulo: 'Referência Fabricante',      grupo: 'Documentos',    fonte: 'direto' },
  { campo: 'numero_proforma_pedido',        rotulo: 'Nº Proforma',               grupo: 'Documentos',    fonte: 'direto' },
  { campo: 'numero_invoice_pedido',         rotulo: 'Nº Invoice',                grupo: 'Documentos',    fonte: 'direto' },

  // ── Logística ──
  { campo: 'porto_origem',                  rotulo: 'Porto Origem',               grupo: 'Logística',     fonte: 'direto' },
  { campo: 'porto_destino',                 rotulo: 'Porto Destino',              grupo: 'Logística',     fonte: 'direto' },
  { campo: 'quantidade_volumes_pedido',     rotulo: 'Qtd. Volumes',              grupo: 'Logística',     fonte: 'direto' },
  { campo: 'peso_liquido_total_pedido',     rotulo: 'Peso Líquido Total',        grupo: 'Logística',     fonte: 'direto' },
  { campo: 'peso_bruto_total_pedido',       rotulo: 'Peso Bruto Total',          grupo: 'Logística',     fonte: 'direto' },
  { campo: 'cubagem_total_pedido',          rotulo: 'Cubagem Total',             grupo: 'Logística',     fonte: 'direto' },

  // ── Configuração ──
  { campo: 'casas_decimais_valor_pedido',       rotulo: 'Casas Decimais Valor',       grupo: 'Configuração', fonte: 'direto' },
  { campo: 'casas_decimais_quantidade_pedido',  rotulo: 'Casas Decimais Quantidade',  grupo: 'Configuração', fonte: 'direto' },
  { campo: 'casas_decimais_peso_pedido',        rotulo: 'Casas Decimais Peso',        grupo: 'Configuração', fonte: 'direto' },
  { campo: 'casas_decimais_cubagem_pedido',     rotulo: 'Casas Decimais Cubagem',     grupo: 'Configuração', fonte: 'direto' },

  // ── Datas — Documento ──
  { campo: 'data_emissao_pedido',           rotulo: 'Data de Emissão',            grupo: 'Datas',         fonte: 'direto' },
  { campo: 'data_embarque_origem',          rotulo: 'Data de Embarque',           grupo: 'Datas',         fonte: 'direto' },
  { campo: 'data_documento_pedido',         rotulo: 'Data Documento Pedido',      grupo: 'Datas',         fonte: 'direto' },
  { campo: 'data_documento_proforma_pedido', rotulo: 'Data Documento Proforma',   grupo: 'Datas',         fonte: 'direto' },
  { campo: 'data_documento_invoice_pedido', rotulo: 'Data Documento Invoice',     grupo: 'Datas',         fonte: 'direto' },
  { campo: 'data_proforma_invoice',         rotulo: 'Data Proforma Invoice',      grupo: 'Datas',         fonte: 'direto' },
  { campo: 'data_invoice',                  rotulo: 'Data Invoice',               grupo: 'Datas',         fonte: 'direto' },
  { campo: 'data_transferencia_saldo_pedido', rotulo: 'Data Transferência Saldo', grupo: 'Datas',         fonte: 'direto' },

  // ── Datas — Etapa do Pedido (prev / conf / meta) ──
  { campo: 'data_prevista_pedido_pronto',       rotulo: 'Previsão Pedido Pronto',      grupo: 'Datas Etapa',   fonte: 'direto' },
  { campo: 'data_confirmada_pedido_pronto',     rotulo: 'Confirmação Pedido Pronto',   grupo: 'Datas Etapa',   fonte: 'direto' },
  { campo: 'data_meta_pedido_pronto',           rotulo: 'Meta Pedido Pronto',          grupo: 'Datas Etapa',   fonte: 'direto' },
  { campo: 'data_prevista_inspecao_pedido',     rotulo: 'Previsão Inspeção',           grupo: 'Datas Etapa',   fonte: 'direto' },
  { campo: 'data_confirmada_inspecao_pedido',   rotulo: 'Confirmação Inspeção',        grupo: 'Datas Etapa',   fonte: 'direto' },
  { campo: 'data_meta_inspecao_pedido',         rotulo: 'Meta Inspeção',               grupo: 'Datas Etapa',   fonte: 'direto' },
  { campo: 'data_prevista_coleta_pedido',       rotulo: 'Previsão Coleta',             grupo: 'Datas Etapa',   fonte: 'direto' },
  { campo: 'data_confirmada_coleta_pedido',     rotulo: 'Confirmação Coleta',          grupo: 'Datas Etapa',   fonte: 'direto' },
  { campo: 'data_meta_coleta_pedido',           rotulo: 'Meta Coleta',                 grupo: 'Datas Etapa',   fonte: 'direto' },

  // ── Datas — Rascunho Pedido ──
  { campo: 'data_previsao_recebimento_rascunho_pedido',    rotulo: 'Prev. Receb. Rascunho Pedido',    grupo: 'Datas Rascunho',  fonte: 'direto' },
  { campo: 'data_confirmacao_recebimento_rascunho_pedido', rotulo: 'Conf. Receb. Rascunho Pedido',    grupo: 'Datas Rascunho',  fonte: 'direto' },
  { campo: 'data_meta_recebimento_rascunho_pedido',        rotulo: 'Meta Receb. Rascunho Pedido',     grupo: 'Datas Rascunho',  fonte: 'direto' },
  { campo: 'data_previsao_aprovacao_rascunho_pedido',      rotulo: 'Prev. Aprov. Rascunho Pedido',    grupo: 'Datas Rascunho',  fonte: 'direto' },
  { campo: 'data_confirmacao_aprovacao_rascunho_pedido',   rotulo: 'Conf. Aprov. Rascunho Pedido',    grupo: 'Datas Rascunho',  fonte: 'direto' },
  { campo: 'data_meta_aprovacao_rascunho_pedido',          rotulo: 'Meta Aprov. Rascunho Pedido',     grupo: 'Datas Rascunho',  fonte: 'direto' },

  // ── Datas — Proforma (Rascunho + Original) ──
  { campo: 'data_previsao_recebimento_rascunho_proforma_pedido',    rotulo: 'Prev. Receb. Rascunho Proforma',    grupo: 'Datas Proforma',  fonte: 'direto' },
  { campo: 'data_confirmacao_recebimento_rascunho_proforma_pedido', rotulo: 'Conf. Receb. Rascunho Proforma',    grupo: 'Datas Proforma',  fonte: 'direto' },
  { campo: 'data_meta_recebimento_rascunho_proforma_pedido',        rotulo: 'Meta Receb. Rascunho Proforma',     grupo: 'Datas Proforma',  fonte: 'direto' },
  { campo: 'data_previsao_aprovacao_rascunho_proforma_pedido',      rotulo: 'Prev. Aprov. Rascunho Proforma',    grupo: 'Datas Proforma',  fonte: 'direto' },
  { campo: 'data_confirmacao_aprovacao_rascunho_proforma_pedido',   rotulo: 'Conf. Aprov. Rascunho Proforma',    grupo: 'Datas Proforma',  fonte: 'direto' },
  { campo: 'data_meta_aprovacao_rascunho_proforma_pedido',          rotulo: 'Meta Aprov. Rascunho Proforma',     grupo: 'Datas Proforma',  fonte: 'direto' },
  { campo: 'data_previsao_envio_original_proforma_pedido',          rotulo: 'Prev. Envio Original Proforma',     grupo: 'Datas Proforma',  fonte: 'direto' },
  { campo: 'data_confirmacao_envio_original_proforma_pedido',       rotulo: 'Conf. Envio Original Proforma',     grupo: 'Datas Proforma',  fonte: 'direto' },
  { campo: 'data_meta_envio_original_proforma_pedido',              rotulo: 'Meta Envio Original Proforma',      grupo: 'Datas Proforma',  fonte: 'direto' },
  { campo: 'data_previsao_recebimento_original_proforma_pedido',    rotulo: 'Prev. Receb. Original Proforma',    grupo: 'Datas Proforma',  fonte: 'direto' },
  { campo: 'data_confirmacao_recebimento_original_proforma_pedido', rotulo: 'Conf. Receb. Original Proforma',    grupo: 'Datas Proforma',  fonte: 'direto' },
  { campo: 'data_meta_recebimento_original_proforma_pedido',        rotulo: 'Meta Receb. Original Proforma',     grupo: 'Datas Proforma',  fonte: 'direto' },

  // ── Datas — Invoice (Rascunho + Original) ──
  { campo: 'data_previsao_recebimento_rascunho_invoice_pedido',    rotulo: 'Prev. Receb. Rascunho Invoice',    grupo: 'Datas Invoice',   fonte: 'direto' },
  { campo: 'data_confirmacao_recebimento_rascunho_invoice_pedido', rotulo: 'Conf. Receb. Rascunho Invoice',    grupo: 'Datas Invoice',   fonte: 'direto' },
  { campo: 'data_meta_recebimento_rascunho_invoice_pedido',        rotulo: 'Meta Receb. Rascunho Invoice',     grupo: 'Datas Invoice',   fonte: 'direto' },
  { campo: 'data_previsao_aprovacao_rascunho_invoice_pedido',      rotulo: 'Prev. Aprov. Rascunho Invoice',    grupo: 'Datas Invoice',   fonte: 'direto' },
  { campo: 'data_confirmacao_aprovacao_rascunho_invoice_pedido',   rotulo: 'Conf. Aprov. Rascunho Invoice',    grupo: 'Datas Invoice',   fonte: 'direto' },
  { campo: 'data_meta_aprovacao_rascunho_invoice_pedido',          rotulo: 'Meta Aprov. Rascunho Invoice',     grupo: 'Datas Invoice',   fonte: 'direto' },
  { campo: 'data_previsao_envio_original_invoice_pedido',          rotulo: 'Prev. Envio Original Invoice',     grupo: 'Datas Invoice',   fonte: 'direto' },
  { campo: 'data_confirmacao_envio_original_invoice_pedido',       rotulo: 'Conf. Envio Original Invoice',     grupo: 'Datas Invoice',   fonte: 'direto' },
  { campo: 'data_meta_envio_original_invoice_pedido',              rotulo: 'Meta Envio Original Invoice',      grupo: 'Datas Invoice',   fonte: 'direto' },
  { campo: 'data_previsao_recebimento_original_invoice_pedido',    rotulo: 'Prev. Receb. Original Invoice',    grupo: 'Datas Invoice',   fonte: 'direto' },
  { campo: 'data_confirmacao_recebimento_original_invoice_pedido', rotulo: 'Conf. Receb. Original Invoice',    grupo: 'Datas Invoice',   fonte: 'direto' },
  { campo: 'data_meta_recebimento_original_invoice_pedido',        rotulo: 'Meta Receb. Original Invoice',     grupo: 'Datas Invoice',   fonte: 'direto' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function gerarNumeroPedido(total: number): string {
  const ano = new Date().getFullYear()
  const seq = String(total + 1).padStart(3, '0')
  return `PO-CONS-${ano}/${seq}`
}

// ── POST /consolidar/preview ─────────────────────────────────────────────────

consolidarRouter.post('/preview', async (req: Request, res: Response, next: NextFunction) => {
  const parse = PreviewSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  const { ids } = parse.data

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const tenantId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      // Buscar pedidos com itens — filtrado por tenant_id
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pedidos = await db.pedido.findMany({
        where: { id_pedido: { in: ids }, id_organizacao: tenantId },
        include: { itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } } },
      }) as any[]

      if (pedidos.length < 2) {
        throw new AppError('Não foram encontrados pedidos suficientes para consolidar', 404, 'NOT_FOUND')
      }

      if (pedidos.length !== ids.length) {
        throw new AppError('Um ou mais pedidos não foram encontrados', 404, 'NOT_FOUND')
      }

      // Detectar divergências de campo
      const camposDivergentes = []
      const camposIguais: Array<{ campo: string; rotulo: string; grupo: string; valor: string | number | null }> = []

      for (const { campo, rotulo, grupo, fonte } of CAMPOS_COMPARAR) {
        const valores = pedidos.map((p: { id_pedido: string; numero_pedido: string; detalhes_operacionais_pedido: unknown; [key: string]: unknown }) => {
          const det = (typeof p.detalhes_operacionais_pedido === 'object' && p.detalhes_operacionais_pedido !== null)
            ? p.detalhes_operacionais_pedido as Record<string, unknown>
            : {}
          const valor = fonte === 'json'
            ? (det[campo] as string | null | undefined) ?? null
            : p[campo] as string | number | null
          return { pedido_id: p.id_pedido, numero_pedido: p.numero_pedido, valor }
        })
        const unicos = new Set(valores.map((v) => String(v.valor)))
        if (unicos.size > 1) {
          camposDivergentes.push({
            campo,
            rotulo,
            grupo,
            valores,
            valor_sugerido: valores[0].valor,
          })
        } else {
          camposIguais.push({ campo, rotulo, grupo, valor: valores[0]?.valor ?? null })
        }
      }

      // Consolidar itens por part_number (para exibição)
      // TODO: tipar com PrismaTypes (estrutura de item consolidado para exibição)
      const itensPorPart: Record<string, Record<string, unknown>> = {}
      for (const pedido of pedidos) {
        for (const item of pedido.itens_pedido) {
          const partNumber = item.part_number_item
          if (itensPorPart[partNumber]) {
            itensPorPart[partNumber].quantidade_total = Number(itensPorPart[partNumber].quantidade_total ?? 0) + Number(item.quantidade_atual_item ?? 0);
            (itensPorPart[partNumber].pedidos_origem as string[]).push(pedido.numero_pedido)
            itensPorPart[partNumber].pode_fundir = true
          } else {
            itensPorPart[partNumber] = {
              part_number: partNumber,
              descricao_item: item.descricao_item,
              ncm: item.ncm_item,
              unidade_comercializada_item: item.unidade_comercializada_item,
              moeda_item: item.moeda_item,
              valor_unitario: item.valor_por_unidade_item,
              quantidade_total: Number(item.quantidade_atual_item ?? 0),
              pedidos_origem: [pedido.numero_pedido],
              pode_fundir: false,
            }
          }
        }
      }

      // Number() obrigatorio: Prisma.Decimal vira string em + (concatena em vez de somar).
      const valorTotal = pedidos.reduce((acc: number, p: { valor_total_pedido?: number | null }) => acc + (Number(p.valor_total_pedido) || 0), 0)
      const total = await db.pedido.count({ where: { id_organizacao: tenantId } })

      // Detectar mistura de tipos de operação (importação vs exportação)
      const tipos = pedidos.map((p: { tipo_operacao_pedido?: string | null }) => p.tipo_operacao_pedido as string)
      const conflito_tipo_operacao = detectarTiposMistos(tipos)

      res.json({
        ids,
        campos_divergentes: camposDivergentes,
        campos_iguais: camposIguais,
        itens: Object.values(itensPorPart),
        valor_total_soma: valorTotal,
        moeda: pedidos[0].moeda_pedido,
        numero_sugerido: gerarNumeroPedido(total),
        conflito_tipo_operacao,
        pedidos_info: pedidos.map((p: { id_pedido: string; numero_pedido: string; itens_pedido: unknown[] }) => ({
          id: p.id_pedido,
          numero: p.numero_pedido,
          total_itens: p.itens_pedido.length,
        })),
      })
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /consolidar/confirmar ───────────────────────────────────────────────

consolidarRouter.post('/confirmar', async (req: Request, res: Response, next: NextFunction) => {
  const parse = ConfirmarSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  const { ids, numero_pedido, campos_escolhidos, fundir_itens_mesmo_part_number } = parse.data

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const tenantId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      // Buscar pedidos originais — filtrado por tenant_id
      const pedidos = await db.pedido.findMany({
        where: { id_pedido: { in: ids }, id_organizacao: tenantId },
        include: { itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } } },
      })

      if (pedidos.length < 2) {
        throw new AppError('Não foram encontrados pedidos suficientes para consolidar', 404, 'NOT_FOUND')
      }

      if (pedidos.length !== ids.length) {
        throw new AppError('Um ou mais pedidos não foram encontrados', 404, 'NOT_FOUND')
      }

      // Validar homogeneidade de tipo_operacao_pedido antes de iniciar a transação
      const pedidosParaConsolidar = await db.pedido.findMany({
        where: { id_pedido: { in: ids }, id_organizacao: tenantId },
        select: { id_pedido: true, tipo_operacao_pedido: true },
      })
      const tiposConsolidar = pedidosParaConsolidar.map((p: { id_pedido: string; tipo_operacao_pedido: string | null }) => p.tipo_operacao_pedido ?? '')
      if (detectarTiposMistos(tiposConsolidar)) {
        throw new AppError('Não é possível consolidar pedidos de importação com pedidos de exportação.', 422, 'TIPO_OPERACAO_MISTO')
      }

      // Verificar se número do pedido já existe
      const numeroExistente = await db.pedido.findFirst({
        where: { numero_pedido, id_organizacao: tenantId },
      })
      if (numeroExistente) {
        throw new AppError(`Número de pedido "${numero_pedido}" já está em uso`, 409, 'CONFLICT')
      }

      const primeiro = pedidos[0]

      // Consolidar itens
      // TODO: tipar com PrismaTypes (Prisma.PedidoItemGetPayload ou similar)
      const itensMerge: Record<string, unknown>[] = []
      const partNumbersVistos = new Set<string>()

      for (const pedido of pedidos) {
        for (const item of pedido.itens_pedido) {
          const partNumber = item.part_number_item
          if (fundir_itens_mesmo_part_number && partNumbersVistos.has(partNumber)) {
            const existente = itensMerge.find((i) => i['part_number_item'] === partNumber) as Record<string, number> | undefined
            if (existente) {
              existente.quantidade_inicial_item = (Number(existente.quantidade_inicial_item) || 0) + (Number(item.quantidade_inicial_item) || 0)
              existente.quantidade_atual_item = (Number(existente.quantidade_atual_item) || 0) + (Number(item.quantidade_atual_item) || 0)
              existente.quantidade_pronta_item = (Number(existente.quantidade_pronta_item) || 0) + (Number(item.quantidade_pronta_item) || 0)
              existente.valor_total_item = (Number(existente.valor_total_item) || 0) + (Number(item.valor_total_item) || 0)
            }
          } else {
            partNumbersVistos.add(partNumber)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id_item: _id, id_pedido: _pedido_id, data_criacao_item: _ca, data_atualizacao_item: _ua, sequencia_item_pedido: _seq, ...itemData } = item
            itensMerge.push({ ...itemData, id_item: gerarId('pite') })
          }
        }
      }

      // Renumerar sequencia de forma limpa (1, 2, 3...) no pedido consolidado
      itensMerge.forEach((item, i) => { item.sequencia_item_pedido = i + 1 })

      const valorTotal = pedidos.reduce((acc: number, p: { valor_total_pedido?: number | null }) => acc + (Number(p.valor_total_pedido) || 0), 0)

      // Separar campos_escolhidos em "direto" (coluna Prisma) e "json" (detalhes_operacionais)
      const CAMPOS_JSON_SET = new Set(CAMPOS_COMPARAR.filter(c => c.fonte === 'json').map(c => c.campo))
      const camposEscolhidosDireto: Record<string, unknown> = {}
      const camposEscolhidosJson: Record<string, unknown> = {}
      for (const [key, val] of Object.entries(campos_escolhidos)) {
        if (CAMPOS_JSON_SET.has(key)) {
          camposEscolhidosJson[key] = val
        } else {
          camposEscolhidosDireto[key] = val
        }
      }

      // Montar detalhes_operacionais_pedido: base do primeiro + overrides do usuário
      const detPrimeiro = (typeof primeiro.detalhes_operacionais_pedido === 'object' && primeiro.detalhes_operacionais_pedido !== null)
        ? primeiro.detalhes_operacionais_pedido as Record<string, unknown>
        : {}
      const detalhesConsolidado = { ...detPrimeiro, ...camposEscolhidosJson }

      // Campos base do pedido consolidado: copiar TODOS os campos diretos do
      // primeiro pedido (evita data loss silenciosa quando campo existe no banco
      // mas não foi explicitamente listado). campos_escolhidos do usuário fará
      // override dos divergentes via spread posterior.
      const CAMPOS_DIRETO_SET = new Set(CAMPOS_COMPARAR.filter(c => c.fonte === 'direto').map(c => c.campo))
      const camposBaseDinamico: Record<string, unknown> = {}
      for (const campo of CAMPOS_DIRETO_SET) {
        if (primeiro[campo] !== undefined) {
          camposBaseDinamico[campo] = primeiro[campo]
        }
      }

      const camposBase = {
        tipo_operacao_pedido:               primeiro.tipo_operacao_pedido,
        status_pedido:                      'consolidado',
        id_importacao_exportador_pedido:    primeiro.id_importacao_exportador_pedido,
        id_exportacao_importador_pedido:    primeiro.id_exportacao_importador_pedido,
        detalhes_operacionais_pedido:       detalhesConsolidado,
        ...camposBaseDinamico,
      }

      // withOrganizacao já garante atomicidade via $transaction — usar db diretamente

      // 1. Resolver FK do status (Débito 2B — pedido.id_status_pedido aponta
      //    para o catálogo StatusPedido). Consolidação cria pedidos no status
      //    'consolidado' por convenção do produto.
      const idStatusConsolidado = await resolverIdStatusPedidoOpcional(db, tenantId, 'consolidado')

      // 2. Criar o pedido consolidado
      const novo = await db.pedido.create({
        // @lint-agregados: allow-create-placeholder — recalcularAgregadosPedido
        // é chamado logo após para reconciliar os 5 agregados.
        data: {
          id_pedido:                       gerarId('pedi'),
          id_organizacao:                  tenantId,
          id_workspace:                    primeiro.id_workspace,
          id_status_pedido:                idStatusConsolidado,
          ...camposBase,
          ...camposEscolhidosDireto,
          numero_pedido,
          valor_total_pedido:              valorTotal,
          ids_origem_consolidacao_pedido:  ids,
          data_consolidacao_pedido:        new Date(),
          itens_pedido: {
            create: itensMerge,
          },
        },
        include: { itens_pedido: { orderBy: { sequencia_item_pedido: 'asc' } } },
      })

      // Recalcular os 5 agregados do consolidado a partir dos itens fundidos.
      // Nota da Onda A0: consolidação é CÓPIA — origens preservam itens (recebem
      // soft delete), não precisam de recalc.
      await recalcularAgregadosPedido(db, novo.id_pedido, tenantId)

      // 2. Soft delete dos pedidos originais — marcados como data_exclusao_pedido
      await db.pedido.updateMany({
        where: { id_pedido: { in: ids }, id_organizacao: tenantId },
        data: {
          data_exclusao_pedido: new Date(),
          status_pedido: 'consolidado',
        },
      })

      // 3. Audit trail via historico-global (fire-and-forget)
      for (const id of ids) {
        auditLog({
          id_organizacao:               tenantId,
          tipo_ator_historico_log:      'USUARIO',
          id_ator_historico_log:        'system',
          nome_ator_historico_log:      'system',
          modulo_historico_log:         'pedido',
          tipo_recurso_historico_log:   'Pedido',
          id_recurso_historico_log:     id,
          acao_historico_log:           'CONSOLIDAR',
          detalhe_acao_historico_log:   `Pedido consolidado em ${numero_pedido}`,
          estado_posterior_historico_log: { ids_origem: ids, numero_pedido_destino: numero_pedido, pedido_consolidado_id: novo.id_pedido },
        })
      }

      res.status(201).json(novo)
    })
  } catch (err) {
    next(err)
  }
})

// ── Error handler local ───────────────────────────────────────────────────────

consolidarRouter.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    })
  }
  console.error('[Consolidar]', err.message)
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } })
})
