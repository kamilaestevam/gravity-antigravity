/**
 * VisualizarArquivoLeituraSmartReadPage — fallback para URL direta /visualizar-arquivo/...
 * Aguarda /me antes do fetch (x-id-usuario obrigatório no BFF).
 */

import { useShellStore } from '@gravity/shell'
import { CircleNotch } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { setApiContext, smartReadApi } from '../../shared/api'
import { mensagemDeExcecao } from '../../shared/extrair-mensagem-erro-api'
import { criarObjectUrlArquivoLeitura } from '../../shared/url-blob-arquivo-leitura-smart-read'
import './visualizar-arquivo-leitura-smart-read.css'

type ModoPreview = 'pdf' | 'imagem' | 'indisponivel'

function resolverModoPreview(nomeArquivo: string): ModoPreview {
  const nome = nomeArquivo.toLowerCase()
  if (nome.endsWith('.pdf')) return 'pdf'
  if (/\.(jpe?g|png|webp|gif|bmp)$/.test(nome)) return 'imagem'
  return 'indisponivel'
}

export default function VisualizarArquivoLeituraSmartReadPage() {
  const { id_leitura: idLeitura, id_arquivo: idArquivo } = useParams<{
    id_leitura: string
    id_arquivo: string
  }>()
  const [searchParams] = useSearchParams()
  const nomeArquivo = searchParams.get('nome')?.trim() || 'documento'

  const meStatus = useShellStore((s) => s.meStatus)
  const currentUser = useShellStore((s) => s.currentUser)

  const [url, setUrl] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  const modo = useMemo(() => resolverModoPreview(nomeArquivo), [nomeArquivo])
  const sessaoPronta = meStatus === 'success' && Boolean(currentUser?.id)

  useEffect(() => {
    if (!idLeitura || !idArquivo) {
      setErro('Identificadores da leitura ou do arquivo ausentes.')
      setCarregando(false)
      return
    }

    if (meStatus === 'loading' || meStatus === 'idle') {
      return
    }

    if (!sessaoPronta) {
      setErro('Sessão não carregada. Feche esta aba, volte ao Smart Docs e tente novamente.')
      setCarregando(false)
      return
    }

    setApiContext({
      idOrganizacao: currentUser!.idOrganizacao ?? '',
      idUsuario: currentUser!.id,
    })

    let objectUrl: string | null = null
    let cancelado = false

    void (async () => {
      try {
        const blob = await smartReadApi.obterArquivoLeitura(idLeitura, idArquivo, nomeArquivo)
        if (cancelado) return
        objectUrl = criarObjectUrlArquivoLeitura(blob, nomeArquivo)
        setUrl(objectUrl)
        setErro(null)
      } catch (excecao) {
        if (cancelado) return
        setErro(mensagemDeExcecao(excecao, 'Não foi possível carregar o documento.'))
        setUrl(null)
      } finally {
        if (!cancelado) setCarregando(false)
      }
    })()

    return () => {
      cancelado = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [currentUser, idArquivo, idLeitura, meStatus, nomeArquivo, sessaoPronta])

  if (carregando) {
    return (
      <div className="sr-doc-aba" role="status" aria-live="polite">
        <CircleNotch size={32} className="sr-doc-aba-spin" aria-hidden />
        <strong>Carregando {nomeArquivo}…</strong>
      </div>
    )
  }

  if (erro || !url) {
    return (
      <div className="sr-doc-aba sr-doc-aba--erro" role="alert">
        <strong>Não foi possível abrir o documento</strong>
        <p>{erro ?? 'Arquivo indisponível.'}</p>
      </div>
    )
  }

  if (modo === 'pdf') {
    return (
      <iframe
        src={url}
        className="sr-doc-aba-iframe"
        title={`Visualizar ${nomeArquivo}`}
      />
    )
  }

  if (modo === 'imagem') {
    return (
      <div className="sr-doc-aba sr-doc-aba--imagem">
        <img src={url} alt={nomeArquivo} className="sr-doc-aba-imagem" />
      </div>
    )
  }

  return (
    <div className="sr-doc-aba sr-doc-aba--erro">
      <strong>Pré-visualização não disponível para este formato</strong>
      <a href={url} download={nomeArquivo} className="sr-doc-aba-download">
        Baixar {nomeArquivo}
      </a>
    </div>
  )
}
