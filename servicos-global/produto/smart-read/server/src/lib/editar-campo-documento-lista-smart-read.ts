/**
 * editar-campo-documento-lista-smart-read.ts — persistência de edição inline na lista.
 */
import {
  obterLeituraLegado,
  resolverCompanyLegado,
} from './cliente-legado-smart-read.js'
import { mesclarLeituraComConferenciaGravity } from './mesclar-leitura-conferencia-gravity-smart-read.js'
import {
  obterLeituraDoSnapshot,
  persistirSnapshotLeituraSmartRead,
} from './snapshot-leitura-smart-read.js'
import {
  leituraVinculadaAoWorkspaceSmartRead,
  clausulaWorkspaceLeituraSmartRead,
} from './escopo-workspace-leitura-smart-read.js'
import { sincronizarConferenciaLeituraNoLegado } from './sincronizar-conferencia-legado-smart-read.js'
import { normalizarLeitura } from '../schemas/leitura-smart-read.js'
import type { Leitura } from '../schemas/leitura-smart-read.js'
import type { PrismaClient } from '../generated/client/index.js'
import { AppError } from './app-error.js'
import {
  aplicarEdicaoCampoDocumentoListaSmartRead,
  listarAlvosEspelhoGrupoListaSmartRead,
  ListaEdicaoSmartReadErro,
  montarAlvosDocumentoListaEdicao,
  extrairGrupoEspelhoNomeDocumentoSmartRead,
  type ColunaCatalogoListaEdicao,
} from '../../../shared/lista-edicao-espelhada-smart-read.js'
import { CATALOGO_COLUNAS_DOCUMENTO_SMART_READ } from '../../../shared/catalogo-colunas-documento-smart-read.js'
import { montarDocumentosLeituraLista } from '../../../shared/montar-documentos-leitura-smart-read.js'

const CATALOGO_LISTA_EDICAO: ColunaCatalogoListaEdicao[] = CATALOGO_COLUNAS_DOCUMENTO_SMART_READ.map(
  (col) => ({
    key: col.key,
    tipos: col.tipos,
    caminhos: col.caminhos,
    status: col.status,
  }),
)

async function carregarLeituraParaEdicao(params: {
  prisma: PrismaClient
  companyId: string
  idLeitura: string
  idWorkspace: string
}): Promise<{ leitura: Leitura; extrasSnapshot: { data_envio?: string | null; created_at?: string | null; completed_at?: string | null } }> {
  const { prisma, companyId, idLeitura, idWorkspace } = params
  const snapshotRegistro = await prisma.snapshotLeituraSmartRead.findFirst({
    where: {
      ...clausulaWorkspaceLeituraSmartRead(idWorkspace),
      id_leitura_legado_snapshot_leitura_smart_read: idLeitura,
    },
  })
  const leituraLegado = await obterLeituraLegado(companyId, idLeitura)
  let leitura = normalizarLeitura(leituraLegado)
  const doSnapshot = await obterLeituraDoSnapshot(prisma, idLeitura, idWorkspace)
  if (doSnapshot) {
    leitura = mesclarLeituraComConferenciaGravity(leitura, doSnapshot)
  }
  return {
    leitura,
    extrasSnapshot: {
      data_envio: snapshotRegistro?.data_envio_snapshot_leitura_smart_read?.toISOString()
        ?? leituraLegado.createdAt
        ?? null,
      created_at: leituraLegado.createdAt ?? null,
      completed_at: leituraLegado.completedAt ?? null,
    },
  }
}

export async function editarCampoDocumentoListaSmartRead(params: {
  prisma: PrismaClient
  idOrganizacao: string
  idUsuario: string
  idWorkspace: string
  idLeitura: string
  idArquivo: string
  indiceDocumento: number
  campoColuna: string
  valor: string
}): Promise<{
  leitura: Leitura
  documentos_atualizados: ReturnType<typeof montarDocumentosLeituraLista>
}> {
  const {
    prisma,
    idOrganizacao,
    idUsuario,
    idWorkspace,
    idLeitura,
    idArquivo,
    indiceDocumento,
    campoColuna,
    valor,
  } = params

  const vinculada = await leituraVinculadaAoWorkspaceSmartRead(prisma, idLeitura, idWorkspace)
  if (!vinculada) {
    throw new AppError('Leitura nao encontrada neste workspace', 404, 'LEITURA_NAO_ENCONTRADA')
  }

  const companyId = await resolverCompanyLegado(idOrganizacao)
  const { leitura: leituraBase, extrasSnapshot } = await carregarLeituraParaEdicao({
    prisma,
    companyId,
    idLeitura,
    idWorkspace,
  })

  if (leituraBase.id_leitura !== idLeitura) {
    throw new AppError('id_leitura divergente', 400, 'ID_LEITURA_DIVERGENTE')
  }

  let leituraEditada: Leitura
  try {
    leituraEditada = aplicarEdicaoCampoDocumentoListaSmartRead({
      leitura: leituraBase,
      id_arquivo: idArquivo,
      indice_documento: indiceDocumento,
      campo_coluna: campoColuna,
      valor,
      catalogo: CATALOGO_LISTA_EDICAO,
    }) as Leitura
  } catch (erro) {
    if (erro instanceof ListaEdicaoSmartReadErro) {
      throw new AppError(erro.message, erro.statusCode, erro.code)
    }
    throw erro
  }

  const documentosAntes = montarAlvosDocumentoListaEdicao(leituraBase)
  const origem = documentosAntes.find(
    (d) => d.id_arquivo === idArquivo && d.indice_extracao === indiceDocumento,
  )
  if (!origem) {
    throw new AppError('Documento nao encontrado', 404, 'DOCUMENTO_NAO_ENCONTRADO')
  }

  const alvosEspelho = listarAlvosEspelhoGrupoListaSmartRead(
    documentosAntes,
    origem,
    campoColuna,
    CATALOGO_LISTA_EDICAO,
  )
  const idsArquivoAfetados = [...new Set(alvosEspelho.map((alvo) => alvo.id_arquivo))]

  await sincronizarConferenciaLeituraNoLegado({
    companyId,
    idLeitura,
    leitura: leituraEditada,
    idsArquivo: idsArquivoAfetados,
  })

  await persistirSnapshotLeituraSmartRead({
    prisma,
    idOrganizacao,
    idUsuario,
    idWorkspace,
    leitura: leituraEditada,
    motivo: 'conferencia_usuario',
    extras: extrasSnapshot,
  })

  const documentosLista = montarDocumentosLeituraLista(leituraEditada)
  const grupo = extrairGrupoEspelhoNomeDocumentoSmartRead(origem.nome_documento)
  const documentosAtualizados = grupo
    ? documentosLista.filter((d) => extrairGrupoEspelhoNomeDocumentoSmartRead(d.nome_documento) === grupo)
    : documentosLista.filter((d) => d.id_documento_leitura === `${idLeitura}:${idArquivo}:${indiceDocumento}`)

  return {
    leitura: leituraEditada,
    documentos_atualizados: documentosAtualizados,
  }
}
