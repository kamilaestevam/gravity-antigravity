/**
 * Página pública — contrato de Fechamento (li e aceito) na Plataforma.
 * Variante conforme slug: pagamento-fornecedor | pagamento-contratante-gravity.
 */

import React from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import {
  DATA_VIGENCIA_CONTRATO_FECHAMENTO_PLATAFORMA_BID_FRETE_INTERNACIONAL,
  resolverDocumentoContratoFechamentoPorSlug,
  VERSAO_CONTRATO_FECHAMENTO_PLATAFORMA_BID_FRETE_INTERNACIONAL,
} from '../../../../shared/contrato-fechamento-plataforma-bid-frete-internacional'
import { ROTULO_TAXA_FECHAMENTO_FRETE_USD } from '../../../../shared/condicoes-plataforma-fornecedor-bid-frete-internacional'
import { useDocumentoContratoPlataformaBidFreteInternacional } from '../../shared/use-documento-contrato-plataforma-bid-frete-internacional'
import { renderizarParagrafoContratoPlataformaBidFreteInternacional } from '../../shared/renderizar-paragrafo-contrato-plataforma-bid-frete-internacional'
import './visao-fornecedor-condicoes-plataforma-bid-frete-internacional.css'

function extrairSlugContratoFechamentoPublico(pathname: string): string | undefined {
  const marcador = '/contrato-fechamento/'
  const indice = pathname.indexOf(marcador)
  if (indice === -1) return undefined
  return pathname.slice(indice + marcador.length).split('/')[0]?.trim() || undefined
}

export default function VisaoFornecedorContratoFechamentoPlataformaBidFreteInternacional() {
  const params = useParams<{
    slug_contrato_fechamento_plataforma_bid_frete_internacional: string
  }>()
  const location = useLocation()
  const slug = params.slug_contrato_fechamento_plataforma_bid_frete_internacional?.trim()
    || extrairSlugContratoFechamentoPublico(location.pathname)

  const documentoFallback = resolverDocumentoContratoFechamentoPorSlug(slug?.trim())
  const { documento, versao, dataVigencia, carregando } = useDocumentoContratoPlataformaBidFreteInternacional(
    'fechamento',
    slug?.trim(),
    documentoFallback,
  )

  if (!documentoFallback && !carregando) {
    return <Navigate to="/" replace />
  }

  if (!documento) {
    return null
  }

  const versaoExibicao = versao ?? VERSAO_CONTRATO_FECHAMENTO_PLATAFORMA_BID_FRETE_INTERNACIONAL
  const vigenciaExibicao = dataVigencia ?? DATA_VIGENCIA_CONTRATO_FECHAMENTO_PLATAFORMA_BID_FRETE_INTERNACIONAL

  return (
    <div className="bf-condicoes-plataforma">
      <header className="bf-condicoes-plataforma__header">
        <p className="bf-condicoes-plataforma__marca">Gravity</p>
        <h1 className="bf-condicoes-plataforma__titulo">{documento.titulo}</h1>
        <p className="bf-condicoes-plataforma__subtitulo">
          BID Frete Internacional · {documento.subtituloPagador} · taxa {ROTULO_TAXA_FECHAMENTO_FRETE_USD}
        </p>
        <p className="bf-condicoes-plataforma__subtitulo">
          Contrato eletrônico · Versão {versaoExibicao} · vigente a
          partir de {vigenciaExibicao}
        </p>
      </header>

      <main className="bf-condicoes-plataforma__conteudo">
        {documento.secoes.map(secao => (
          <section key={secao.titulo} className="bf-condicoes-plataforma__secao">
            <h2>{secao.titulo}</h2>
            {secao.paragrafos.map(paragrafo => (
              <p key={paragrafo}>{renderizarParagrafoContratoPlataformaBidFreteInternacional(paragrafo)}</p>
            ))}
          </section>
        ))}
      </main>

      <footer className="bf-condicoes-plataforma__rodape">
        Gravity · DATI · BID Frete Internacional
      </footer>
    </div>
  )
}
