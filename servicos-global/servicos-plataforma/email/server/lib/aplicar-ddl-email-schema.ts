/**
 * DDL idempotente — alinha colunas das 5 tabelas de Email ao schema Prisma atual.
 *
 * Produção tem drift: a migration ddd_final (20260419) criou as tabelas com
 * colunas em inglês (tenant_id, dedup_key, created_at…) e o fragment foi
 * renomeado para DDD sem migration de rename. Resultado: P2022 em
 * prisma.emailRegistroEnvio.create() — foi a causa do outage de 04/07/2026
 * (cron BID disparou e-mail → P2022 → unhandled rejection → monolito caiu).
 *
 * Mesmo padrão de aplicar-ddl-historico-log-schema.ts.
 */
import { Client } from 'pg'

type MapaRenomeacoes = ReadonlyArray<readonly [string, string]>

interface TabelaEmail {
  tabela: string
  /** Colunas mínimas para considerar o schema alinhado ao Prisma. */
  colunasCanonicas: readonly string[]
  renomeacoes: MapaRenomeacoes
}

export const TABELAS_EMAIL: readonly TabelaEmail[] = [
  {
    tabela: 'email_assuntos_participantes',
    colunasCanonicas: [
      'id_email_assuntos_participantes',
      'id_organizacao_email_assuntos_participantes',
      'assunto_email_assuntos_participantes',
      'data_criacao_email_assuntos_participantes',
    ],
    renomeacoes: [
      ['id', 'id_email_assuntos_participantes'],
      ['tenant_id', 'id_organizacao_email_assuntos_participantes'],
      ['product_id', 'id_produto_email_assuntos_participantes'],
      ['user_id', 'id_usuario_email_assuntos_participantes'],
      ['subject', 'assunto_email_assuntos_participantes'],
      ['status', 'status_email_assuntos_participantes'],
      ['sentiment', 'sentimento_email_assuntos_participantes'],
      ['sentiment_label', 'rotulo_sentimento_email_assuntos_participantes'],
      ['mensagens_count', 'contagem_mensagens_email_assuntos_participantes'],
      ['ultimo_contato', 'ultimo_contato_email_assuntos_participantes'],
      ['deep_link', 'deep_link_email_assuntos_participantes'],
      ['created_at', 'data_criacao_email_assuntos_participantes'],
      ['updated_at', 'data_atualizacao_email_assuntos_participantes'],
    ],
  },
  {
    tabela: 'email_mensagem',
    colunasCanonicas: [
      'id_email_mensagem',
      'id_organizacao_email_mensagem',
      'id_thread_email_mensagem',
      'data_criacao_email_mensagem',
    ],
    renomeacoes: [
      ['id', 'id_email_mensagem'],
      ['tenant_id', 'id_organizacao_email_mensagem'],
      ['product_id', 'id_produto_email_mensagem'],
      ['user_id', 'id_usuario_email_mensagem'],
      ['thread_id', 'id_thread_email_mensagem'],
      ['resend_id', 'id_resend_email_mensagem'],
      ['direction', 'direcao_email_mensagem'],
      ['from', 'remetente_email_mensagem'],
      ['to', 'destinatario_email_mensagem'],
      ['subject', 'assunto_email_mensagem'],
      ['body', 'corpo_email_mensagem'],
      ['body_html', 'corpo_html_email_mensagem'],
      ['dedup_key', 'chave_dedup_email_mensagem'],
      ['parent_message_id', 'id_mensagem_pai_email_mensagem'],
      ['gabi_response', 'resposta_gabi_email_mensagem'],
      ['gabi_confidence', 'confianca_gabi_email_mensagem'],
      ['gabi_action', 'acao_gabi_email_mensagem'],
      ['sent_at', 'data_envio_email_mensagem'],
      ['created_at', 'data_criacao_email_mensagem'],
      ['updated_at', 'data_atualizacao_email_mensagem'],
    ],
  },
  {
    tabela: 'email_registro_envio',
    colunasCanonicas: [
      'id_email_registro_envio',
      'id_organizacao_email_registro_envio',
      'chave_dedup_email_registro_envio',
      'data_criacao_email_registro_envio',
    ],
    renomeacoes: [
      ['id', 'id_email_registro_envio'],
      ['tenant_id', 'id_organizacao_email_registro_envio'],
      ['product_id', 'id_produto_email_registro_envio'],
      ['user_id', 'id_usuario_email_registro_envio'],
      ['to', 'destinatario_email_registro_envio'],
      ['from', 'remetente_email_registro_envio'],
      ['reply_to', 'reply_to_email_registro_envio'],
      ['subject', 'assunto_email_registro_envio'],
      ['template_id', 'id_template_email_registro_envio'],
      ['status', 'status_email_registro_envio'],
      ['resend_id', 'id_resend_email_registro_envio'],
      ['dedup_key', 'chave_dedup_email_registro_envio'],
      ['tentativas', 'tentativas_email_registro_envio'],
      ['max_tentativas', 'max_tentativas_email_registro_envio'],
      ['next_retry_at', 'proxima_tentativa_em_email_registro_envio'],
      ['error_message', 'mensagem_erro_email_registro_envio'],
      ['enviado_at', 'data_envio_email_registro_envio'],
      ['created_at', 'data_criacao_email_registro_envio'],
      ['updated_at', 'data_atualizacao_email_registro_envio'],
    ],
  },
  {
    tabela: 'template_email',
    colunasCanonicas: [
      'id_template_email',
      'id_organizacao_template_email',
      'slug_template_email',
      'data_criacao_template_email',
    ],
    renomeacoes: [
      ['id', 'id_template_email'],
      ['tenant_id', 'id_organizacao_template_email'],
      ['product_id', 'id_produto_template_email'],
      ['user_id', 'id_usuario_template_email'],
      ['nome', 'nome_template_email'],
      ['slug', 'slug_template_email'],
      ['assunto', 'assunto_template_email'],
      ['corpo_html', 'corpo_html_template_email'],
      ['corpo_texto', 'corpo_texto_template_email'],
      ['variaveis', 'variaveis_template_email'],
      ['ativo', 'ativo_template_email'],
      ['descricao', 'descricao_template_email'],
      ['created_at', 'data_criacao_template_email'],
      ['updated_at', 'data_atualizacao_template_email'],
    ],
  },
  {
    tabela: 'email_fila_envio',
    colunasCanonicas: [
      'id_email_fila_envio',
      'id_organizacao_email_fila_envio',
      'payload_email_fila_envio',
      'data_criacao_email_fila_envio',
    ],
    renomeacoes: [
      ['id', 'id_email_fila_envio'],
      ['tenant_id', 'id_organizacao_email_fila_envio'],
      ['product_id', 'id_produto_email_fila_envio'],
      ['user_id', 'id_usuario_email_fila_envio'],
      ['status', 'status_email_fila_envio'],
      ['prioridade', 'prioridade_email_fila_envio'],
      ['payload', 'payload_email_fila_envio'],
      ['template_id', 'id_template_email_fila_envio'],
      ['email_enviado_id', 'id_email_enviado_email_fila_envio'],
      ['tentativas', 'tentativas_email_fila_envio'],
      ['max_tentativas', 'max_tentativas_email_fila_envio'],
      ['next_retry_at', 'proxima_tentativa_em_email_fila_envio'],
      ['processado_at', 'processado_em_email_fila_envio'],
      ['erro', 'erro_email_fila_envio'],
      ['created_at', 'data_criacao_email_fila_envio'],
      ['updated_at', 'data_atualizacao_email_fila_envio'],
    ],
  },
]

/**
 * Enums: o chain de renames (20260420 + 20260424) deixou todos os tipos alinhados
 * ao fragment, EXCETO EmailThreadStatus — o fragment usa EmailThreadAtiva.
 */
export const RENOMEACOES_ENUM: MapaRenomeacoes = [['EmailThreadStatus', 'EmailThreadAtiva']]

async function tipoEnumExiste(client: Client, nome: string): Promise<boolean> {
  const { rows } = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = $1) AS exists`,
    [nome],
  )
  return rows[0]?.exists ?? false
}

async function renomearEnumSePossivel(client: Client, de: string, para: string): Promise<boolean> {
  if (!(await tipoEnumExiste(client, de)) || (await tipoEnumExiste(client, para))) return false
  await client.query(`ALTER TYPE "${de}" RENAME TO "${para}"`)
  return true
}

async function tabelaExiste(client: Client, tabela: string): Promise<boolean> {
  const { rows } = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1
     ) AS exists`,
    [tabela],
  )
  return rows[0]?.exists ?? false
}

async function listarColunas(client: Client, tabela: string): Promise<Set<string>> {
  const { rows } = await client.query<{ column_name: string }>(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1`,
    [tabela],
  )
  return new Set(rows.map((r) => r.column_name))
}

async function renomearSePossivel(
  client: Client,
  tabela: string,
  colunas: Set<string>,
  de: string,
  para: string,
): Promise<boolean> {
  if (!colunas.has(de) || colunas.has(para)) return false
  await client.query(`ALTER TABLE "${tabela}" RENAME COLUMN "${de}" TO "${para}"`)
  colunas.delete(de)
  colunas.add(para)
  return true
}

export type ResultadoDdlEmail = 'skip' | 'ok' | 'repair'

/**
 * Aplica renomeações idempotentes nas 5 tabelas de Email em public.
 * Retorna `skip` se nenhuma tabela existe ou tudo já canônico; `repair` se alterou algo.
 * Lança erro se após o repair alguma tabela existente seguir incompatível.
 */
export async function aplicarDdlEmailSchema(databaseUrl: string): Promise<ResultadoDdlEmail> {
  const client = new Client({ connectionString: databaseUrl })
  await client.connect()
  try {
    let alterou = false
    let alguma = false

    for (const [de, para] of RENOMEACOES_ENUM) {
      if (await renomearEnumSePossivel(client, de, para)) {
        alterou = true
      }
    }

    for (const { tabela, colunasCanonicas, renomeacoes } of TABELAS_EMAIL) {
      if (!(await tabelaExiste(client, tabela))) continue
      alguma = true

      const colunas = await listarColunas(client, tabela)
      if (colunasCanonicas.every((c) => colunas.has(c))) continue

      for (const [de, para] of renomeacoes) {
        if (await renomearSePossivel(client, tabela, colunas, de, para)) {
          alterou = true
        }
      }

      const faltando = colunasCanonicas.filter((c) => !colunas.has(c))
      if (faltando.length > 0) {
        throw new Error(
          `${tabela} ainda incompatível após repair — colunas ausentes: ${faltando.join(', ')}`,
        )
      }
    }

    if (!alguma) return 'skip'
    return alterou ? 'repair' : 'ok'
  } finally {
    await client.end()
  }
}
