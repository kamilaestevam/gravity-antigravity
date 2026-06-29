// server/services/servico-memoria.ts
// Memoria persistente da GABI por usuario — preferencias, contexto, onboarding.
// Model: GabiMemoriaUsuario (fragment.prisma)

import { withSchemaOrganizacao } from '../lib/with-schema-organizacao.js'

// ── Tipos ───────────────────────────────────────────────────────────────────

export type TipoMemoria = 'preferencia' | 'contexto' | 'onboarding' | 'padrao' | 'feedback'

export interface MemoriaUsuario {
  tipo: TipoMemoria
  chave: string
  valor: string
  confianca: number
  origem: 'explicito' | 'inferido'
  data_ultimo_uso: Date
}

interface ContextoMemoria {
  id_organizacao: string
  id_usuario: string
}

// ── Constantes ──────────────────────────────────────────────────────────────

const MAX_MEMORIAS_CARREGADAS = 50
const MIN_CONFIANCA = 0.3
const MAX_VALOR_LENGTH = 500

// ── Carregar memorias do usuario ────────────────────────────────────────────

export async function carregarMemorias(
  ctx: ContextoMemoria,
  tipo?: TipoMemoria,
  limit = MAX_MEMORIAS_CARREGADAS,
): Promise<MemoriaUsuario[]> {
  const where: Record<string, unknown> = {
    id_organizacao_gabi_memoria_usuario: ctx.id_organizacao,
    id_usuario_gabi_memoria_usuario: ctx.id_usuario,
    ativo_gabi_memoria_usuario: true,
    confianca_gabi_memoria_usuario: { gte: MIN_CONFIANCA },
  }

  if (tipo) {
    where.tipo_gabi_memoria_usuario = tipo
  }

  const registros = await withSchemaOrganizacao(ctx.id_organizacao, (db) =>
    db.gabiMemoriaUsuario.findMany({
      where,
      orderBy: { data_ultimo_uso_gabi_memoria_usuario: 'desc' },
      take: limit,
    }),
  )

  return registros.map((r) => ({
    tipo: r.tipo_gabi_memoria_usuario as TipoMemoria,
    chave: r.chave_gabi_memoria_usuario,
    valor: r.valor_gabi_memoria_usuario,
    confianca: r.confianca_gabi_memoria_usuario,
    origem: r.origem_gabi_memoria_usuario as 'explicito' | 'inferido',
    data_ultimo_uso: r.data_ultimo_uso_gabi_memoria_usuario,
  }))
}

// ── Salvar ou atualizar memoria ─────────────────────────────────────────────

export async function salvarMemoria(
  ctx: ContextoMemoria,
  tipo: TipoMemoria,
  chave: string,
  valor: string,
  origem: 'explicito' | 'inferido' = 'inferido',
): Promise<void> {
  const valorTruncado = valor.slice(0, MAX_VALOR_LENGTH)

  await withSchemaOrganizacao(ctx.id_organizacao, (db) =>
    db.gabiMemoriaUsuario.upsert({
      where: {
        gmu_unq_org_usr_tipo_chave: {
          id_organizacao_gabi_memoria_usuario: ctx.id_organizacao,
          id_usuario_gabi_memoria_usuario: ctx.id_usuario,
          tipo_gabi_memoria_usuario: tipo,
          chave_gabi_memoria_usuario: chave,
        },
      },
      create: {
        id_organizacao_gabi_memoria_usuario: ctx.id_organizacao,
        id_usuario_gabi_memoria_usuario: ctx.id_usuario,
        tipo_gabi_memoria_usuario: tipo,
        chave_gabi_memoria_usuario: chave,
        valor_gabi_memoria_usuario: valorTruncado,
        origem_gabi_memoria_usuario: origem,
        confianca_gabi_memoria_usuario: origem === 'explicito' ? 1.0 : 0.8,
      },
      update: {
        valor_gabi_memoria_usuario: valorTruncado,
        origem_gabi_memoria_usuario: origem,
        confianca_gabi_memoria_usuario: origem === 'explicito' ? 1.0 : 0.8,
        data_ultimo_uso_gabi_memoria_usuario: new Date(),
        ativo_gabi_memoria_usuario: true,
      },
    }),
  )
}

// ── Registrar uso de memoria (atualiza data_ultimo_uso) ─────────────────────

export async function registrarUsoMemoria(
  ctx: ContextoMemoria,
  tipo: TipoMemoria,
  chave: string,
): Promise<void> {
  try {
    await withSchemaOrganizacao(ctx.id_organizacao, (db) =>
      db.gabiMemoriaUsuario.update({
        where: {
          gmu_unq_org_usr_tipo_chave: {
            id_organizacao_gabi_memoria_usuario: ctx.id_organizacao,
            id_usuario_gabi_memoria_usuario: ctx.id_usuario,
            tipo_gabi_memoria_usuario: tipo,
            chave_gabi_memoria_usuario: chave,
          },
        },
        data: {
          data_ultimo_uso_gabi_memoria_usuario: new Date(),
        },
      }),
    )
  } catch {
    // Memoria nao encontrada — ignorar silenciosamente
  }
}

// ── Desativar memoria ───────────────────────────────────────────────────────

export async function desativarMemoria(
  ctx: ContextoMemoria,
  tipo: TipoMemoria,
  chave: string,
): Promise<void> {
  try {
    await withSchemaOrganizacao(ctx.id_organizacao, (db) =>
      db.gabiMemoriaUsuario.update({
        where: {
          gmu_unq_org_usr_tipo_chave: {
            id_organizacao_gabi_memoria_usuario: ctx.id_organizacao,
            id_usuario_gabi_memoria_usuario: ctx.id_usuario,
            tipo_gabi_memoria_usuario: tipo,
            chave_gabi_memoria_usuario: chave,
          },
        },
        data: { ativo_gabi_memoria_usuario: false },
      }),
    )
  } catch {
    // Memoria nao encontrada — ignorar
  }
}

// ── Formatar memorias para injecao no system prompt ─────────────────────────

export function formatarMemoriasParaPrompt(memorias: MemoriaUsuario[]): string {
  if (memorias.length === 0) return ''

  const grupos = new Map<string, MemoriaUsuario[]>()
  for (const m of memorias) {
    const lista = grupos.get(m.tipo) ?? []
    lista.push(m)
    grupos.set(m.tipo, lista)
  }

  const partes: string[] = ['=== MEMORIA DO USUARIO ===']

  for (const [tipo, lista] of grupos) {
    partes.push(`\n[${tipo.toUpperCase()}]`)
    for (const m of lista) {
      const confiancaLabel = m.confianca >= 0.8 ? '' : ` (confianca: ${m.confianca.toFixed(1)})`
      partes.push(`- ${m.chave}: ${m.valor}${confiancaLabel}`)
    }
  }

  partes.push('\n=== FIM DA MEMORIA ===')
  return partes.join('\n')
}

// Cron cross-org — fora do escopo do hotfix; requer iterar schemas via worker.
export async function aplicarDecaimentoMemorias(): Promise<{ desativadas: number; reduzidas: number }> {
  console.warn('[GABI/memoria] aplicarDecaimentoMemorias: nao implementado em schema-per-org')
  return { desativadas: 0, reduzidas: 0 }
}
