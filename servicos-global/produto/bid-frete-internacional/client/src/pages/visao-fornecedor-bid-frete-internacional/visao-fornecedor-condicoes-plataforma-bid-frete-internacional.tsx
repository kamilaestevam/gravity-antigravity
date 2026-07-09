/**
 * Página pública — aviso de condições comerciais para fornecedores (sem login).
 * Documento informativo pré-contratual — o contrato é celebrado no Fechamento.
 */

import React from 'react'
import {
  DATA_VIGENCIA_CONDICOES_PLATAFORMA_FORNECEDOR_BID_FRETE_INTERNACIONAL,
  ROTULO_TAXA_FECHAMENTO_FRETE_USD,
  SECOES_CONDICOES_PLATAFORMA_FORNECEDOR_BID_FRETE_INTERNACIONAL,
  TITULO_CONDICOES_PLATAFORMA_FORNECEDOR_BID_FRETE_INTERNACIONAL,
  VERSAO_CONDICOES_PLATAFORMA_FORNECEDOR_BID_FRETE_INTERNACIONAL,
} from '../../../../shared/condicoes-plataforma-fornecedor-bid-frete-internacional'
import './visao-fornecedor-condicoes-plataforma-bid-frete-internacional.css'

export default function VisaoFornecedorCondicoesPlataformaBidFreteInternacional() {
  return (
    <div className="bf-condicoes-plataforma">
      <header className="bf-condicoes-plataforma__header">
        <p className="bf-condicoes-plataforma__marca">Gravity</p>
        <h1 className="bf-condicoes-plataforma__titulo">
          {TITULO_CONDICOES_PLATAFORMA_FORNECEDOR_BID_FRETE_INTERNACIONAL}
        </h1>
        <p className="bf-condicoes-plataforma__subtitulo">
          BID Frete Internacional · cotação gratuita · taxa de fechamento {ROTULO_TAXA_FECHAMENTO_FRETE_USD}
        </p>
        <p className="bf-condicoes-plataforma__subtitulo">
          Documento informativo pré-contratual · Versão {VERSAO_CONDICOES_PLATAFORMA_FORNECEDOR_BID_FRETE_INTERNACIONAL} · vigente a partir de {DATA_VIGENCIA_CONDICOES_PLATAFORMA_FORNECEDOR_BID_FRETE_INTERNACIONAL}
        </p>
      </header>

      <main className="bf-condicoes-plataforma__conteudo">
        {SECOES_CONDICOES_PLATAFORMA_FORNECEDOR_BID_FRETE_INTERNACIONAL.map(secao => (
          <section key={secao.titulo} className="bf-condicoes-plataforma__secao">
            <h2>{secao.titulo}</h2>
            {secao.paragrafos.map(paragrafo => (
              <p key={paragrafo}>{paragrafo}</p>
            ))}
          </section>
        ))}
      </main>

      <footer className="bf-condicoes-plataforma__rodape">
        Gravity · BID Frete Internacional
      </footer>
    </div>
  )
}
