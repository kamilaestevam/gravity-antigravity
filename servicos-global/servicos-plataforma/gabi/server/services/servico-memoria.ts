// server/services/servico-memoria.ts
// Memoria persistente da GABI por usuario — preferencias, contexto, onboarding.
// Model: GabiMemoriaUsuario (fragment.prisma)

import { withSchemaOrganizacao } from '../lib/with-schema-organizacao.js'
import { embedarTexto, similaridadeCosseno } from '../lib/embeddings-gemini.js'

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

// Recuperacao semantica: quantas memorias mais relevantes injetar no prompt.
const TOP_K_MEMORIAS = 8
// Abaixo desta similaridade a memoria e considerada irrelevante para o turno.
const MIN_SIMILARIDADE_MEMORIA = 0.35

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

// ── Recuperacao semantica ───────────────────────────────────────────────────
// A tabela nao tem coluna de embedding (schema intocavel), entao embedamos as
// memorias em runtime e cacheamos por hash do valor — memorias inalteradas nao
// sao re-embedadas. Cache em processo (LRU simples); suficiente por instancia.

const MAX_CACHE_EMBEDDINGS = 2_000
const cacheEmbeddingMemoria = new Map<string, number[]>()

function hashValor(valor: string): string {
  let hash = 0
  for (let i = 0; i < valor.length; i++) {
    hash = ((hash << 5) - hash + valor.charCodeAt(i)) | 0
  }
  return hash.toString(36)
}

async function embeddingDaMemoria(valor: string): Promise<number[]> {
  const chave = hashValor(valor)
  const cacheada = cacheEmbeddingMemoria.get(chave)
  if (cacheada) return cacheada

  const vetor = await embedarTexto(valor, 'SEMANTIC_SIMILARITY')
  if (cacheEmbeddingMemoria.size >= MAX_CACHE_EMBEDDINGS) {
    const primeira = cacheEmbeddingMemoria.keys().next().value
    if (primeira !== undefined) cacheEmbeddingMemoria.delete(primeira)
  }
  cacheEmbeddingMemoria.set(chave, vetor)
  return vetor
}

/**
 * Carrega as memorias do usuario e retorna as TOP_K mais relevantes para a
 * mensagem atual, por similaridade de cosseno. Memorias `explicito` de alta
 * confianca entram sempre (sao preferencias duras do usuario).
 */
export async function recuperarMemoriasRelevantes(
  ctx: ContextoMemoria,
  mensagem: string,
  limit = TOP_K_MEMORIAS,
): Promise<MemoriaUsuario[]> {
  const todas = await carregarMemorias(ctx)
  if (todas.length <= limit) return todas

  let vetorMensagem: number[]
  try {
    vetorMensagem = await embedarTexto(mensagem, 'SEMANTIC_SIMILARITY')
  } catch {
    // Sem embedding, cai no comportamento antigo (as mais recentes).
    return todas.slice(0, limit)
  }

  const pontuadas = await Promise.all(
    todas.map(async (m) => {
      try {
        const vetor = await embeddingDaMemoria(`${m.chave}: ${m.valor}`)
        return { memoria: m, score: similaridadeCosseno(vetorMensagem, vetor) }
      } catch {
        return { memoria: m, score: 0 }
      }
    }),
  )

  const duras = pontuadas.filter((p) => p.memoria.origem === 'explicito' && p.memoria.confianca >= 0.9)
  const relevantes = pontuadas
    .filter((p) => !(p.memoria.origem === 'explicito' && p.memoria.confianca >= 0.9))
    .filter((p) => p.score >= MIN_SIMILARIDADE_MEMORIA)
    .sort((a, b) => b.score - a.score)

  const escolhidas = [...duras, ...relevantes].slice(0, limit)
  return escolhidas.map((p) => p.memoria)
}

/**
 * Decaimento das memorias de UM usuario (chamado no fluxo de request; o cron
 * cross-org itera schemas por fora). Reduz a confianca de memorias `inferido`
 * nao usadas ha mais de `diasSemUso` e desativa as que caem abaixo do minimo.
 */
export async function aplicarDecaimentoMemoriasUsuario(
  ctx: ContextoMemoria,
  diasSemUso = 30,
  fatorDecaimento = 0.8,
): Promise<{ desativadas: number; reduzidas: number }> {
  const corte = new Date(Date.now() - diasSemUso * 24 * 60 * 60 * 1000)

  return withSchemaOrganizacao(ctx.id_organizacao, async (db) => {
    const candidatas = await db.gabiMemoriaUsuario.findMany({
      where: {
        id_organizacao_gabi_memoria_usuario: ctx.id_organizacao,
        id_usuario_gabi_memoria_usuario: ctx.id_usuario,
        ativo_gabi_memoria_usuario: true,
        origem_gabi_memoria_usuario: 'inferido',
        data_ultimo_uso_gabi_memoria_usuario: { lt: corte },
      },
    })

    let desativadas = 0
    let reduzidas = 0
    for (const m of candidatas) {
      const novaConfianca = m.confianca_gabi_memoria_usuario * fatorDecaimento
      if (novaConfianca < MIN_CONFIANCA) {
        await db.gabiMemoriaUsuario.update({
          where: { id_gabi_memoria_usuario: m.id_gabi_memoria_usuario },
          data: { ativo_gabi_memoria_usuario: false },
        })
        desativadas++
      } else {
        await db.gabiMemoriaUsuario.update({
          where: { id_gabi_memoria_usuario: m.id_gabi_memoria_usuario },
          data: { confianca_gabi_memoria_usuario: novaConfianca },
        })
        reduzidas++
      }
    }
    return { desativadas, reduzidas }
  })
}

// Cron cross-org — itera schemas via worker (fora do fluxo de request).
export async function aplicarDecaimentoMemorias(): Promise<{ desativadas: number; reduzidas: number }> {
  console.warn('[GABI/memoria] aplicarDecaimentoMemorias global: use aplicarDecaimentoMemoriasUsuario no fluxo de request; cron cross-org pendente de worker')
  return { desativadas: 0, reduzidas: 0 }
}
