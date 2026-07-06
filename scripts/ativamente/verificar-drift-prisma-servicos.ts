/**
 * Verifica drift entre o banco real e o schema Prisma de cada serviço do
 * site-usegravity — roda no start (antes do exec do servidor), para que schema
 * desalinhado apareça no deploy, não como P2022 em runtime.
 *
 * Contexto: o outage de 04/07/2026 aconteceu porque as tabelas de Email tinham
 * colunas legado (tenant_id, dedup_key…) e o fragment já usava nomes DDD — nenhum
 * `prisma migrate status` acusa isso (todas as migrations constavam aplicadas).
 * Só `prisma migrate diff --from-url … --to-schema-datamodel …` detecta.
 *
 * Modo padrão: REPORTA drift em log (ERRO DRIFT) sem falhar o deploy — o legado
 * ddd_final deixou drift residual em várias tabelas que ainda está sendo limpo.
 * Com DRIFT_PRISMA_ENFORCAR=1 o script sai com exit 1 em qualquer drift e o
 * deploy falha (Railway mantém o deployment anterior servindo).
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'

interface ServicoVerificavel {
  nome: string
  envUrl: string
  schema: string
}

const SERVICOS: readonly ServicoVerificavel[] = [
  {
    nome: 'servicos-plataforma (email, gabi, historico, ...)',
    envUrl: 'ORGANIZACAO_DATABASE_URL',
    schema: 'servicos-global/servicos-plataforma/prisma/schema.prisma',
  },
  {
    nome: 'configurador',
    envUrl: 'CONFIGURADOR_DATABASE_URL',
    schema: 'configurador/prisma/schema.prisma',
  },
  {
    nome: 'pedido',
    envUrl: 'PEDIDO_DATABASE_URL',
    schema: 'servicos-global/produto/pedido/prisma/schema.prisma',
  },
  {
    nome: 'processo',
    envUrl: 'PROCESSO_DATABASE_URL',
    schema: 'servicos-global/produto/processo/prisma/schema.prisma',
  },
  {
    nome: 'smart-read',
    envUrl: 'SMART_READ_DATABASE_URL',
    schema: 'servicos-global/produto/smart-read/prisma/schema.prisma',
  },
  {
    nome: 'bid-frete-internacional',
    envUrl: 'BID_FRETE_INTERNATIONAL_DATABASE_URL',
    schema: 'servicos-global/produto/bid-frete-internacional/prisma/schema.prisma',
  },
]

interface ResultadoDrift {
  nome: string
  status: 'ok' | 'drift' | 'skip' | 'erro'
  detalhe?: string
}

function verificarServico(servico: ServicoVerificavel): ResultadoDrift {
  const url = process.env[servico.envUrl]?.trim()
  if (!url) return { nome: servico.nome, status: 'skip', detalhe: `${servico.envUrl} ausente` }
  if (!existsSync(servico.schema)) {
    return { nome: servico.nome, status: 'skip', detalhe: `schema não composto: ${servico.schema}` }
  }

  const resultado = spawnSync(
    'npx',
    [
      'prisma', 'migrate', 'diff',
      '--from-url', url,
      '--to-schema-datamodel', servico.schema,
      '--exit-code',
    ],
    { encoding: 'utf8', timeout: 120_000, shell: process.platform === 'win32' },
  )

  // --exit-code: 0 = sem diferença, 2 = diff não vazio, outros = erro de execução
  if (resultado.status === 0) return { nome: servico.nome, status: 'ok' }
  if (resultado.status === 2) {
    const linhas = (resultado.stdout ?? '').trim().split('\n').slice(0, 40).join('\n')
    return { nome: servico.nome, status: 'drift', detalhe: linhas }
  }
  return {
    nome: servico.nome,
    status: 'erro',
    detalhe: (resultado.stderr ?? String(resultado.error ?? 'falha desconhecida')).trim().slice(0, 500),
  }
}

function main(): void {
  const enforcar = process.env.DRIFT_PRISMA_ENFORCAR === '1'
  console.log(`[drift-prisma] Verificando drift banco × schema (enforcar=${enforcar ? 'sim' : 'não — apenas log'})...`)

  const resultados = SERVICOS.map(verificarServico)
  let temDrift = false

  for (const r of resultados) {
    if (r.status === 'ok') {
      console.log(`[drift-prisma] OK    — ${r.nome}`)
    } else if (r.status === 'skip') {
      console.log(`[drift-prisma] SKIP  — ${r.nome} (${r.detalhe})`)
    } else if (r.status === 'erro') {
      console.error(`[drift-prisma] ERRO  — ${r.nome}: ${r.detalhe}`)
    } else {
      temDrift = true
      console.error(`[drift-prisma] ERRO DRIFT — ${r.nome}: banco NÃO bate com o schema Prisma.`)
      console.error(`[drift-prisma] Diff (primeiras linhas):\n${r.detalhe}`)
    }
  }

  if (temDrift && enforcar) {
    console.error('[drift-prisma] DRIFT_PRISMA_ENFORCAR=1 — abortando deploy para não subir servidor com P2022 latente.')
    process.exit(1)
  }
  if (temDrift) {
    console.error('[drift-prisma] AVISO: drift detectado mas enforcement desligado — configure DRIFT_PRISMA_ENFORCAR=1 após limpar o legado.')
  }
}

main()
