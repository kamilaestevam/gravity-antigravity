/**
 * resolver-url-visualizacao-arquivo-leitura-smart-read.ts — blob URL para visualizar anexo da leitura.
 */

import {
  conteudoArquivoLeituraEhVisualizavel,
  mensagemConteudoArquivoInvalido,
  resolverMimePorNomeArquivo,
} from '../../../shared/validar-conteudo-arquivo-leitura-smart-read'
import { smartReadApi } from './api'
import {
  obterArquivoSessaoLeituraSmartRead,
  registrarArquivoSessaoLeituraSmartRead,
} from './cache-sessao-arquivo-leitura-smart-read'
import {
  mensagemErroPreviewArquivoRemoto,
  mensagemPreviewArquivoIndisponivel,
  resolverArquivoOriginalLeituraSmartRead,
  salvarBlobArquivoLeituraSmartRead,
} from './persistencia-blob-arquivo-leitura-smart-read'
import {
  arquivoLocalTemBlobVisualizavel,
  type ArquivoLocalNovaLeitura,
} from './tipo-arquivo-nova-leitura-smart-read'
import { criarObjectUrlArquivoLeitura } from './url-blob-arquivo-leitura-smart-read'
import { montarUrlApiArquivoLeituraSmartRead } from './url-api-arquivo-leitura-smart-read'

export type ResultadoUrlVisualizacaoArquivoLeitura =
  | { ok: true; url: string; arquivoAtualizado: File | null }
  | { ok: false; mensagem: string }

async function validarBlobVisualizacao(blob: Blob, nomeArquivo: string): Promise<Blob | null> {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  if (!conteudoArquivoLeituraEhVisualizavel(bytes, nomeArquivo)) return null
  const mimeInformado = blob.type?.trim() ?? ''
  const mime =
    mimeInformado && mimeInformado !== 'application/octet-stream'
      ? mimeInformado
      : resolverMimePorNomeArquivo(nomeArquivo)
  if (mimeInformado && mimeInformado !== 'application/octet-stream') {
    return blob
  }
  return new Blob([bytes], { type: mime })
}

export async function resolverUrlVisualizacaoArquivoLeituraSmartRead(
  item: ArquivoLocalNovaLeitura,
  idLeituraExistente: string | null,
): Promise<ResultadoUrlVisualizacaoArquivoLeitura> {
  const nomeArquivo = item.arquivo.name

  const idLeitura =
    item.id_leitura ?? idLeituraExistente ?? item.leitura?.id_leitura ?? null
  const idArquivo = item.id_arquivo

  if (idLeitura && idArquivo) {
    return {
      ok: true,
      url: montarUrlApiArquivoLeituraSmartRead(idLeitura, idArquivo),
      arquivoAtualizado: null,
    }
  }

  if (arquivoLocalTemBlobVisualizavel(item.arquivo)) {
    return {
      ok: true,
      url: criarObjectUrlArquivoLeitura(item.arquivo),
      arquivoAtualizado: null,
    }
  }

  if (!idLeitura || !idArquivo) {
    return { ok: false, mensagem: mensagemPreviewArquivoIndisponivel(nomeArquivo) }
  }

  try {
    const daSessao = obterArquivoSessaoLeituraSmartRead(idLeitura, idArquivo, nomeArquivo)
    let blob: Blob | null = daSessao

    if (!blob?.size) {
      blob = await resolverArquivoOriginalLeituraSmartRead(
        idLeitura,
        idArquivo,
        nomeArquivo,
        daSessao,
      )
    }

    if (!blob || blob.size === 0) {
      blob = await smartReadApi.obterArquivoLeitura(idLeitura, idArquivo, nomeArquivo)
    }

    if (!blob || blob.size === 0) {
      return { ok: false, mensagem: mensagemPreviewArquivoIndisponivel(nomeArquivo) }
    }

    const validado = await validarBlobVisualizacao(blob, nomeArquivo)
    if (!validado) {
      return { ok: false, mensagem: mensagemConteudoArquivoInvalido(nomeArquivo) }
    }

    const arquivoAtualizado =
      validado instanceof File ? validado : new File([validado], nomeArquivo, { type: validado.type })

    registrarArquivoSessaoLeituraSmartRead(idLeitura, arquivoAtualizado, idArquivo)
    void salvarBlobArquivoLeituraSmartRead(idLeitura, idArquivo, validado, nomeArquivo)

    return {
      ok: true,
      url: criarObjectUrlArquivoLeitura(validado, nomeArquivo),
      arquivoAtualizado,
    }
  } catch (excecao) {
    return { ok: false, mensagem: mensagemErroPreviewArquivoRemoto(excecao, nomeArquivo) }
  }
}
