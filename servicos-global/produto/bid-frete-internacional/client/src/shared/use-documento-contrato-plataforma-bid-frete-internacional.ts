import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { DocumentoContratoFechamentoPlataformaBidFreteInternacional } from '../../../shared/contrato-fechamento-plataforma-bid-frete-internacional'
import type { DocumentoContratoPropostaPlataformaBidFreteInternacional } from '../../../shared/contrato-proposta-plataforma-bid-frete-internacional'

type TipoContratoPlataformaPagina = 'fechamento' | 'proposta'

type DocumentoContratoPlataforma =
  | DocumentoContratoFechamentoPlataformaBidFreteInternacional
  | DocumentoContratoPropostaPlataformaBidFreteInternacional

const API_BASE = '/api/v1/bid-frete-internacional/contrato-plataforma-bid-frete-internacional/publico'

export function useDocumentoContratoPlataformaBidFreteInternacional(
  tipo: TipoContratoPlataformaPagina,
  slug: string | undefined,
  documentoFallback: DocumentoContratoPlataforma | null,
): {
  documento: DocumentoContratoPlataforma | null
  versao: string | null
  dataVigencia: string | null
  carregando: boolean
} {
  const [searchParams] = useSearchParams()
  const tokenDisparo = searchParams.get('token_disparo')?.trim() || undefined
  const tokenAceite = searchParams.get('token_aceite')?.trim() || undefined
  const [documento, setDocumento] = useState<DocumentoContratoPlataforma | null>(documentoFallback)
  const [versao, setVersao] = useState<string | null>(null)
  const [dataVigencia, setDataVigencia] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(Boolean(tokenDisparo || tokenAceite))

  const query = useMemo(() => {
    if (!slug || (!tokenDisparo && !tokenAceite)) return null
    const params = new URLSearchParams({ tipo, slug })
    if (tokenDisparo) params.set('token_disparo', tokenDisparo)
    if (tokenAceite) params.set('token_aceite', tokenAceite)
    return params.toString()
  }, [tipo, slug, tokenDisparo, tokenAceite])

  useEffect(() => {
    setDocumento(documentoFallback)
  }, [documentoFallback])

  useEffect(() => {
    if (!query) {
      setCarregando(false)
      return
    }

    let cancelado = false
    setCarregando(true)

    void fetch(`${API_BASE}/contexto?${query}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('contexto indisponível')
        return res.json() as Promise<{
          documento: DocumentoContratoPlataforma
          versao: string
          data_vigencia: string
        }>
      })
      .then((payload) => {
        if (cancelado) return
        setDocumento(payload.documento)
        setVersao(payload.versao)
        setDataVigencia(payload.data_vigencia)
      })
      .catch(() => {
        if (!cancelado) {
          setDocumento(documentoFallback)
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })

    return () => {
      cancelado = true
    }
  }, [query, documentoFallback])

  return { documento, versao, dataVigencia, carregando }
}
