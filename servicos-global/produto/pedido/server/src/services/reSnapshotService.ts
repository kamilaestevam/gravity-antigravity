/**
 * reSnapshotService.ts — Re-snapshot de Pedido por mudança em Cadastros
 * (FASE 06E, frente 2 — recomendação b1).
 *
 * Disparado pelo webhook POST /api/v1/internal/cadastros-changed. Para cada
 * notificação:
 *
 *   1. Resolve o contexto de organização (`withOrganizacaoContext`) — obrigatório
 *      para entidades por org (Empresa/OPE). Para catálogo global (NCM/Moeda/
 *      Unidade), exige idOrganizacao explícito (limitação documentada).
 *   2. Lê a policy `pedido_snapshot_atualizacao` do(s) workspace(s).
 *   3. Se a policy permite atualizar, busca o registro fresco no Cadastros via
 *      `cadastrosClient`.
 *   4. Lista os pedidos afetados (JOIN com a tabela snapshot do tipo).
 *   5. Para cada lote de 50 pedidos, monta o snapshot novo e UPSERT
 *      (idempotente: mesma notificação 2x → resultado igual).
 *   6. Marca `motivo_congelamento = 'atualizacao_manual'`.
 *
 * Princípios:
 *   - I/O de rede (Cadastros) ocorre FORA da `$transaction` Prisma — mesma
 *     regra do POST /pedidos.
 *   - Logs estruturados `[reSnapshot] tipo=X identificador=Y org=Z afetados=N`.
 *   - Falha silenciosa apenas para erros de rede (segue o ciclo). Falha de
 *     contrato (Zod) explode com `console.error` para alertar.
 *
 * REGRA 03 DDD: variáveis TS em camelCase. REGRA 06: parse Zod no cliente HTTP.
 */

import { withOrganizacaoContext } from '@gravity/resolver-organizacao'
import { randomUUID } from 'node:crypto'
// Imports diretos para processos-core (mesmo padrão do index.ts).
// processos-core está excluido do tsconfig do pedido server — o TS não
// type-checa esses arquivos aqui, mas o Node carrega normalmente em runtime.
import {
  buscarIdentidadeComexPorSuid,
  buscarOpePorSuid,
  buscarNcmPorCodigo,
  buscarMoedaPorCodigo,
  buscarUnidadePorCodigo,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
} from '../../../../processos-core/src/services/cadastrosClient.js'
import {
  montarSnapshotIdentidadeComex,
  montarSnapshotOpe,
  montarSnapshotNcm,
  montarSnapshotMoeda,
  montarSnapshotUnidade,
  type PapelEmpresa,
} from '../../../../processos-core/src/services/pedidoSnapshots.js'

const TAMANHO_LOTE = 50

const PAPEIS_EMPRESA: ReadonlyArray<PapelEmpresa> = [
  'importador',
  'exportador',
  'fabricante',
  'agente',
  'despachante',
  'armador',
]

const PAPEL_PARA_FLAG_POLICY: Record<PapelEmpresa, string> = {
  importador:  'atualiza_importador_pedido_snapshot_atualizacao',
  exportador:  'atualiza_exportador_pedido_snapshot_atualizacao',
  fabricante:  'atualiza_fabricante_pedido_snapshot_atualizacao',
  agente:      'atualiza_agente_pedido_snapshot_atualizacao',
  despachante: 'atualiza_despachante_pedido_snapshot_atualizacao',
  armador:     'atualiza_armador_pedido_snapshot_atualizacao',
}

export interface MudancaCadastrosInput {
  tipoEntidade:  'empresa' | 'ope' | 'ncm' | 'moeda' | 'unidade'
  identificador: string
  idOrganizacao: string | null
}

interface PolicyRow {
  id_workspace: string
  atualiza_importador_pedido_snapshot_atualizacao:  boolean
  atualiza_exportador_pedido_snapshot_atualizacao:  boolean
  atualiza_fabricante_pedido_snapshot_atualizacao:  boolean
  atualiza_agente_pedido_snapshot_atualizacao:      boolean
  atualiza_despachante_pedido_snapshot_atualizacao: boolean
  atualiza_armador_pedido_snapshot_atualizacao:     boolean
  atualiza_ope_pedido_snapshot_atualizacao:         boolean
}

/**
 * Particiona um array em lotes de tamanho fixo.
 */
function emLotes<T>(itens: T[], tamanho: number): T[][] {
  const lotes: T[][] = []
  for (let i = 0; i < itens.length; i += tamanho) {
    lotes.push(itens.slice(i, i + tamanho))
  }
  return lotes
}

async function processarEmpresa(
  identificador: string,
  idOrganizacao: string,
): Promise<number> {
  const correlationId = randomUUID()
  const identidade = await buscarIdentidadeComexPorSuid(identificador, {
    id_organizacao: idOrganizacao,
    correlation_id: correlationId,
  }).catch((err) => {
    console.warn(
      `[reSnapshot] erro buscando empresa ${identificador}:`,
      err instanceof Error ? err.message : err,
    )
    return null
  })
  if (!identidade) return 0

  return withOrganizacaoContext(idOrganizacao, async (_ctx, rawDb) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = rawDb as any

    // Lê todas as policies do tenant — uma por workspace.
    const policies = (await db.pedidoSnapshotAtualizacao.findMany({
      where: { id_organizacao: idOrganizacao },
    })) as PolicyRow[]

    const workspacesPorPapel = new Map<PapelEmpresa, Set<string>>()
    for (const papel of PAPEIS_EMPRESA) {
      const flag = PAPEL_PARA_FLAG_POLICY[papel] as keyof PolicyRow
      const ws = new Set<string>()
      for (const p of policies) {
        if (p[flag] === true) ws.add(p.id_workspace)
      }
      workspacesPorPapel.set(papel, ws)
    }

    let totalAfetados = 0
    for (const papel of PAPEIS_EMPRESA) {
      const ws = workspacesPorPapel.get(papel)
      if (!ws || ws.size === 0) continue

      const snapshots = (await db.pedidoSnapshotEmpresa.findMany({
        where: {
          id_organizacao: idOrganizacao,
          suid_empresa:   identificador,
          papel,
          id_workspace:   { in: Array.from(ws) },
        },
        select: { id: true, id_pedido: true, id_workspace: true },
      })) as Array<{ id: string; id_pedido: string; id_workspace: string | null }>

      if (snapshots.length === 0) continue

      // Atualiza em lote — processa de TAMANHO_LOTE em TAMANHO_LOTE.
      for (const lote of emLotes(snapshots, TAMANHO_LOTE)) {
        await Promise.all(
          lote.map(async (snap) => {
            const dados = montarSnapshotIdentidadeComex(
              identidade,
              papel,
              idOrganizacao,
              snap.id_workspace ?? null,
              'atualizacao_manual',
            )
            // Update no registro existente (idempotente).
            await db.pedidoSnapshotEmpresa.update({
              where: { id: snap.id },
              data: {
                nome_empresa:        dados.nome_empresa,
                documento_principal: dados.documento_principal,
                tipo_documento:      dados.tipo_documento,
                cnpj_raiz:           dados.cnpj_raiz,
                endereco_cidade:     dados.endereco_cidade,
                endereco_uf:         dados.endereco_uf,
                endereco_cep:        dados.endereco_cep,
                endereco_pais:       dados.endereco_pais,
                endereco_logradouro: dados.endereco_logradouro,
                contato_email:       dados.contato_email,
                contato_whatsapp:    dados.contato_whatsapp,
                motivo_congelamento: dados.motivo_congelamento,
                congelado_em:        new Date(),
              },
            })
          }),
        )
      }
      totalAfetados += snapshots.length
    }
    return totalAfetados
  })
}

async function processarOpe(
  identificador: string,
  idOrganizacao: string,
): Promise<number> {
  const correlationId = randomUUID()
  const ope = await buscarOpePorSuid(identificador, {
    id_organizacao: idOrganizacao,
    correlation_id: correlationId,
  }).catch((err) => {
    console.warn(
      `[reSnapshot] erro buscando ope ${identificador}:`,
      err instanceof Error ? err.message : err,
    )
    return null
  })
  if (!ope) return 0

  return withOrganizacaoContext(idOrganizacao, async (_ctx, rawDb) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = rawDb as any

    const policies = (await db.pedidoSnapshotAtualizacao.findMany({
      where:  { id_organizacao: idOrganizacao },
      select: { id_workspace: true, atualiza_ope_pedido_snapshot_atualizacao: true },
    })) as Array<{ id_workspace: string; atualiza_ope_pedido_snapshot_atualizacao: boolean }>

    const workspacesAtivos = policies
      .filter((p) => p.atualiza_ope_pedido_snapshot_atualizacao)
      .map((p) => p.id_workspace)
    if (workspacesAtivos.length === 0) return 0

    // O codigo_portal_unico_ope é o que identifica a OPE no Pedido (codigo_ope).
    const codigoOpe = ope.codigo_portal_unico_ope
    const snapshots = (await db.pedidoSnapshotOpe.findMany({
      where: {
        id_organizacao: idOrganizacao,
        codigo_ope:     codigoOpe,
        id_workspace:   { in: workspacesAtivos },
      },
      select: { id: true, id_workspace: true },
    })) as Array<{ id: string; id_workspace: string | null }>

    if (snapshots.length === 0) return 0

    let totalAfetados = 0
    for (const lote of emLotes(snapshots, TAMANHO_LOTE)) {
      await Promise.all(
        lote.map(async (snap) => {
          const dados = montarSnapshotOpe(
            ope,
            idOrganizacao,
            snap.id_workspace ?? null,
            'atualizacao_manual',
          )
          await db.pedidoSnapshotOpe.update({
            where: { id: snap.id },
            data: {
              suid_ope:          dados.suid_ope,
              versao_ope:        dados.versao_ope,
              situacao_ope:      dados.situacao_ope,
              nome_ope:          dados.nome_ope,
              cnpj_raiz_empresa: dados.cnpj_raiz_empresa,
              pais_ope:          dados.pais_ope,
              estado_ope:        dados.estado_ope,
              cidade_ope:        dados.cidade_ope,
              endereco_ope:      dados.endereco_ope,
              zip_ope:           dados.zip_ope,
              tin_ope:           dados.tin_ope,
              email_ope:         dados.email_ope,
              motivo_congelamento: dados.motivo_congelamento,
              congelado_em:      new Date(),
            },
          })
        }),
      )
      totalAfetados += lote.length
    }
    return totalAfetados
  })
}

async function processarNcm(
  identificador: string,
  idOrganizacao: string,
): Promise<number> {
  const correlationId = randomUUID()
  const ncm = await buscarNcmPorCodigo(identificador, {
    id_organizacao: idOrganizacao,
    correlation_id: correlationId,
  }).catch((err) => {
    console.warn(
      `[reSnapshot] erro buscando ncm ${identificador}:`,
      err instanceof Error ? err.message : err,
    )
    return null
  })
  if (!ncm) return 0

  return withOrganizacaoContext(idOrganizacao, async (_ctx, rawDb) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = rawDb as any
    const snapshots = (await db.pedidoSnapshotNcm.findMany({
      where:  { id_organizacao: idOrganizacao, codigo_ncm: identificador },
      select: { id: true, id_workspace: true },
    })) as Array<{ id: string; id_workspace: string | null }>
    if (snapshots.length === 0) return 0

    let totalAfetados = 0
    for (const lote of emLotes(snapshots, TAMANHO_LOTE)) {
      await Promise.all(
        lote.map(async (snap) => {
          const dados = montarSnapshotNcm(
            ncm,
            idOrganizacao,
            snap.id_workspace ?? null,
            'atualizacao_manual',
          )
          await db.pedidoSnapshotNcm.update({
            where: { id: snap.id },
            data: {
              descricao_ncm: dados.descricao_ncm,
              ipi_ncm:       dados.ipi_ncm,
              ii_ncm:        dados.ii_ncm,
              pis_ncm:       dados.pis_ncm,
              cofins_ncm:    dados.cofins_ncm,
              motivo_congelamento: dados.motivo_congelamento,
              congelado_em:  new Date(),
            },
          })
        }),
      )
      totalAfetados += lote.length
    }
    return totalAfetados
  })
}

async function processarMoeda(
  identificador: string,
  idOrganizacao: string,
): Promise<number> {
  const correlationId = randomUUID()
  const moeda = await buscarMoedaPorCodigo(identificador, {
    id_organizacao: idOrganizacao,
    correlation_id: correlationId,
  }).catch((err) => {
    console.warn(
      `[reSnapshot] erro buscando moeda ${identificador}:`,
      err instanceof Error ? err.message : err,
    )
    return null
  })
  if (!moeda) return 0

  return withOrganizacaoContext(idOrganizacao, async (_ctx, rawDb) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = rawDb as any
    const snapshots = (await db.pedidoSnapshotMoeda.findMany({
      where:  { id_organizacao: idOrganizacao, codigo_moeda: identificador },
      select: { id: true, id_workspace: true },
    })) as Array<{ id: string; id_workspace: string | null }>
    if (snapshots.length === 0) return 0

    let totalAfetados = 0
    for (const lote of emLotes(snapshots, TAMANHO_LOTE)) {
      await Promise.all(
        lote.map(async (snap) => {
          const dados = montarSnapshotMoeda(
            moeda,
            idOrganizacao,
            snap.id_workspace ?? null,
            'atualizacao_manual',
          )
          await db.pedidoSnapshotMoeda.update({
            where: { id: snap.id },
            data: {
              nome_moeda:    dados.nome_moeda,
              simbolo_moeda: dados.simbolo_moeda,
              motivo_congelamento: dados.motivo_congelamento,
              congelado_em:  new Date(),
            },
          })
        }),
      )
      totalAfetados += lote.length
    }
    return totalAfetados
  })
}

async function processarUnidade(
  identificador: string,
  idOrganizacao: string,
): Promise<number> {
  const correlationId = randomUUID()
  const unidade = await buscarUnidadePorCodigo(identificador, {
    id_organizacao: idOrganizacao,
    correlation_id: correlationId,
  }).catch((err) => {
    console.warn(
      `[reSnapshot] erro buscando unidade ${identificador}:`,
      err instanceof Error ? err.message : err,
    )
    return null
  })
  if (!unidade) return 0

  return withOrganizacaoContext(idOrganizacao, async (_ctx, rawDb) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = rawDb as any
    const snapshots = (await db.pedidoSnapshotUnidade.findMany({
      where:  { id_organizacao: idOrganizacao, codigo_unidade: identificador },
      select: { id: true, id_workspace: true },
    })) as Array<{ id: string; id_workspace: string | null }>
    if (snapshots.length === 0) return 0

    let totalAfetados = 0
    for (const lote of emLotes(snapshots, TAMANHO_LOTE)) {
      await Promise.all(
        lote.map(async (snap) => {
          const dados = montarSnapshotUnidade(
            unidade,
            idOrganizacao,
            snap.id_workspace ?? null,
            'atualizacao_manual',
          )
          await db.pedidoSnapshotUnidade.update({
            where: { id: snap.id },
            data: {
              nome_unidade: dados.nome_unidade,
              tipo_unidade: dados.tipo_unidade,
              motivo_congelamento: dados.motivo_congelamento,
              congelado_em: new Date(),
            },
          })
        }),
      )
      totalAfetados += lote.length
    }
    return totalAfetados
  })
}

/**
 * Entry-point único do receiver. Encaminha para o handler do tipo.
 *
 * Limitação conhecida (debt): para entidades de catálogo global (NCM/Moeda/
 * Unidade), o webhook do Cadastros não envia `idOrganizacao`. A primeira
 * iteração registra `console.warn` e retorna 0 — o fan-out cross-org será
 * implementado em sub-fase posterior (precisa de listagem de orgs no
 * Configurador ou tabela de pedidos cross-schema).
 */
async function processarMudancaCadastros(
  input: MudancaCadastrosInput,
): Promise<void> {
  const { tipoEntidade, identificador, idOrganizacao } = input
  const inicio = Date.now()

  if (idOrganizacao === null) {
    console.warn(
      `[reSnapshot] idOrganizacao ausente para tipo=${tipoEntidade} identificador=${identificador} — fan-out cross-org não implementado (debt)`,
    )
    return
  }

  try {
    let afetados = 0
    switch (tipoEntidade) {
      case 'empresa': afetados = await processarEmpresa(identificador, idOrganizacao); break
      case 'ope':     afetados = await processarOpe(identificador, idOrganizacao);     break
      case 'ncm':     afetados = await processarNcm(identificador, idOrganizacao);     break
      case 'moeda':   afetados = await processarMoeda(identificador, idOrganizacao);   break
      case 'unidade': afetados = await processarUnidade(identificador, idOrganizacao); break
    }
    const dur = Date.now() - inicio
    console.log(
      `[reSnapshot] tipo=${tipoEntidade} identificador=${identificador} org=${idOrganizacao} afetados=${afetados} duracao_ms=${dur}`,
    )
  } catch (err) {
    console.error(
      `[reSnapshot] FALHA tipo=${tipoEntidade} identificador=${identificador} org=${idOrganizacao}:`,
      err instanceof Error ? err.stack ?? err.message : err,
    )
  }
}

export const reSnapshotService = {
  processarMudancaCadastros,
}
