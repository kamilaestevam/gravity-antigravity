/**
 * Tela de match — agrupa documentos da leitura em uma ou mais cotações BID Frete.
 */
import { useMemo, useState } from 'react'
import { ArrowsLeftRight, Plus, Sparkle } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import type { LeituraParaConversaoCotacaoBidFrete } from '../../../../shared/converter-leitura-para-cotacao-bid-frete-internacional-smart-read.js'
import {
  criarGrupoVazioMatchPrefill,
  listarDocumentosMatchPrefillCotacaoBidFrete,
  moverDocumentoEntreGruposMatchPrefill,
  sugerirGruposMatchPrefillCotacaoBidFrete,
  type GrupoCotacaoMatchPrefillBidFrete,
} from '../../../../shared/match-documentos-prefill-cotacao-bid-frete-smart-read.js'

type Props = {
  leitura: LeituraParaConversaoCotacaoBidFrete
  onConfirmar: (grupos: GrupoCotacaoMatchPrefillBidFrete[]) => void
}

export function TelaMatchDocumentosPrefillCotacaoBidFreteSmartRead({
  leitura,
  onConfirmar,
}: Props) {
  const documentos = useMemo(
    () => listarDocumentosMatchPrefillCotacaoBidFrete(leitura),
    [leitura],
  )
  const [grupos, setGrupos] = useState(() => sugerirGruposMatchPrefillCotacaoBidFrete(documentos))

  const mapaDocs = useMemo(
    () => new Map(documentos.map((d) => [d.id_documento, d])),
    [documentos],
  )

  const gruposValidos = grupos.filter((g) => g.ids_documentos.length > 0)

  return (
    <div className="sr-prefill-bid-match">
      <div className="sr-prefill-bid-revisao-cabecalho">
        <ArrowsLeftRight weight="duotone" size={20} aria-hidden />
        <div>
          <h3 className="sr-prefill-bid-revisao-titulo">Combinar documentos nas cotações</h3>
          <p className="sr-prefill-bid-revisao-subtitulo">
            O Smart Docs já separou {documentos.length} documento(s). Agrupe invoice + packing do
            mesmo embarque na mesma cotação, ou separe em cotações distintas.
          </p>
        </div>
      </div>

      <div className="sr-prefill-bid-match-grade">
        {grupos.map((grupo) => (
          <section key={grupo.id_grupo} className="sr-prefill-bid-match-grupo" aria-label={grupo.nome_grupo}>
            <header className="sr-prefill-bid-match-grupo-cabecalho">
              <Sparkle weight="duotone" size={14} aria-hidden />
              <strong>{grupo.nome_grupo}</strong>
              <span>{grupo.ids_documentos.length} doc.</span>
            </header>
            <ul className="sr-prefill-bid-match-lista">
              {grupo.ids_documentos.map((id) => {
                const doc = mapaDocs.get(id)
                if (!doc) return null
                return (
                  <li key={id} className="sr-prefill-bid-match-item">
                    <div>
                      <div className="sr-prefill-bid-match-item-titulo">{doc.rotulo}</div>
                      <div className="sr-prefill-bid-match-item-resumo">{doc.resumo}</div>
                    </div>
                    <label className="sr-prefill-bid-match-mover">
                      <span className="sr-visually-hidden">Mover para</span>
                      <select
                        value={grupo.id_grupo}
                        onChange={(e) => {
                          const destino = e.target.value
                          if (destino === grupo.id_grupo) return
                          setGrupos((atual) =>
                            moverDocumentoEntreGruposMatchPrefill(atual, id, destino),
                          )
                        }}
                        aria-label={`Mover ${doc.rotulo}`}
                      >
                        {grupos.map((g) => (
                          <option key={g.id_grupo} value={g.id_grupo}>
                            {g.nome_grupo}
                          </option>
                        ))}
                      </select>
                    </label>
                  </li>
                )
              })}
              {grupo.ids_documentos.length === 0 && (
                <li className="sr-prefill-bid-match-vazio">Arraste documentos para cá via o seletor</li>
              )}
            </ul>
          </section>
        ))}
      </div>

      <div className="sr-prefill-bid-revisao-acoes">
        <BotaoGlobal
          variante="secundario"
          tamanho="padrao"
          iconeEsquerda={<Plus weight="bold" />}
          onClick={() => setGrupos((atual) => criarGrupoVazioMatchPrefill(atual))}
        >
          Nova cotação
        </BotaoGlobal>
        <BotaoGlobal
          variante="primario"
          tamanho="padrao"
          disabled={gruposValidos.length === 0}
          onClick={() => onConfirmar(gruposValidos)}
        >
          {gruposValidos.length <= 1
            ? 'Revisar cotação'
            : `Revisar ${gruposValidos.length} cotações`}
        </BotaoGlobal>
      </div>
    </div>
  )
}
