/**
 * abrir-arquivo-leitura-nova-aba-smart-read.ts — paridade DATI: SOMENTE nova aba, sem modal.
 * Fetch autenticado na janela de origem (headers x-id-organizacao / x-id-usuario); blob reutilizado.
 */

import { useShellStore } from '@gravity/shell'
import {
  abrirDocumentoNovaAba,
  MENSAGEM_POPUP_BLOQUEADO_SMART_READ,
  navegarAbaDocumento,
  reservarAbaDocumento,
} from './abrir-documento-nova-aba-smart-read'
import { mensagemDeExcecao } from './extrair-mensagem-erro-api'
import { resolverUrlVisualizacaoArquivoLeituraSmartRead } from './resolver-url-visualizacao-arquivo-leitura-smart-read'
import {
  arquivoLocalTemBlobVisualizavel,
  type ArquivoLocalNovaLeitura,
} from './tipo-arquivo-nova-leitura-smart-read'
import { criarObjectUrlArquivoLeitura } from './url-blob-arquivo-leitura-smart-read'
import { urlVisualizacaoEhBlobRevogavel } from './url-api-arquivo-leitura-smart-read'

export type ParametrosAbrirArquivoLeituraNovaAba = {
  item: ArquivoLocalNovaLeitura
  idLeituraExistente: string | null
  urlsBlobCache: Map<string, string>
  aoArquivoAtualizado?: (idArquivoLocal: string, arquivo: File) => void
}

function notificarErro(mensagem: string): void {
  useShellStore.getState().addNotification({ type: 'error', message: mensagem, duration: 6000 })
}

function notificarPopupBloqueado(): void {
  useShellStore.getState().addNotification({
    type: 'warning',
    message: MENSAGEM_POPUP_BLOQUEADO_SMART_READ,
    duration: 6000,
  })
}

/** Abre anexo em nova aba — único fluxo para todos os ícones olho do wizard. */
export async function abrirArquivoLeituraNovaAbaSmartRead({
  item,
  idLeituraExistente,
  urlsBlobCache,
  aoArquivoAtualizado,
}: ParametrosAbrirArquivoLeituraNovaAba): Promise<void> {
  const idLocal = item.id_arquivo_local
  const temBlobLocal = arquivoLocalTemBlobVisualizavel(item.arquivo)
  const abaReservada = temBlobLocal ? null : reservarAbaDocumento()

  if (!temBlobLocal && !abaReservada) {
    notificarPopupBloqueado()
    return
  }

  const abrirUrl = (url: string): boolean => {
    if (temBlobLocal) {
      return abrirDocumentoNovaAba(url) != null
    }
    if (abaReservada) {
      navegarAbaDocumento(abaReservada, url)
      return true
    }
    return false
  }

  try {
    if (temBlobLocal) {
      let url = urlsBlobCache.get(idLocal)
      if (!url) {
        url = criarObjectUrlArquivoLeitura(item.arquivo)
        urlsBlobCache.set(idLocal, url)
      }
      if (!abrirUrl(url)) {
        notificarPopupBloqueado()
      }
      return
    }

    const resultado = await resolverUrlVisualizacaoArquivoLeituraSmartRead(item, idLeituraExistente)

    if (!resultado.ok) {
      abaReservada?.close()
      notificarErro(resultado.mensagem)
      return
    }

    if (urlVisualizacaoEhBlobRevogavel(resultado.url)) {
      urlsBlobCache.set(idLocal, resultado.url)
    }

    if (resultado.arquivoAtualizado && aoArquivoAtualizado) {
      aoArquivoAtualizado(idLocal, resultado.arquivoAtualizado)
    }

    if (!abrirUrl(resultado.url)) {
      abaReservada?.close()
      notificarPopupBloqueado()
    }
  } catch (excecao) {
    abaReservada?.close()
    notificarErro(mensagemDeExcecao(excecao, 'Não foi possível abrir o documento.'))
  }
}
