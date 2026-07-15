/**
 * Tela de match — arrastar documentos entre cotações; criar/excluir grupos.
 */
import { useCallback, useMemo, useState } from 'react'
import { ArrowsLeftRight, DotsSixVertical, Plus, Trash, Sparkle } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import type { LeituraParaConversaoCotacaoBidFrete } from '../../../../shared/converter-leitura-para-cotacao-bid-frete-internacional-smart-read.js'
import {
  criarGrupoVazioMatchPrefill,
  excluirGrupoMatchPrefill,
  listarDocumentosMatchPrefillCotacaoBidFrete,
  moverDocumentoEntreGruposMatchPrefill,
  sugerirGruposMatchPrefillCotacaoBidFrete,
  type GrupoCotacaoMatchPrefillBidFrete,
} from '../../../../shared/match-documentos-prefill-cotacao-bid-frete-smart-read.js'

type Props = {
  leitura: LeituraParaConversaoCotacaoBidFrete
  onConfirmar: (grupos: GrupoCotacaoMatchPrefillBidFrete[]) => void
}

const TIPO_DRAG = 'application/x-sr-prefill-doc-id'

export function TelaMatchDocumentosPrefillCotacaoBidFreteSmartRead({
  leitura,
  onConfirmar,
}: Props) {
  const documentos = useMemo(
    () => listarDocumentosMatchPrefillCotacaoBidFrete(leitura),
    [leitura],
  )
  const [grupos, setGrupos] = useState(() => sugerirGruposMatchPrefillCotacaoBidFrete(documentos))
  const [idArrastando, setIdArrastando] = useState<string | null>(null)
  const [idGrupoSobre, setIdGrupoSobre] = useState<string | null>(null)

  const mapaDocs = useMemo(
    () => new Map(documentos.map((d) => [d.id_documento, d])),
    [documentos],
  )

  const gruposValidos = grupos.filter((g) => g.ids_documentos.length > 0)

  const moverPara = useCallback((idDocumento: string, idGrupoDestino: string) => {
    setGrupos((atual) => moverDocumentoEntreGruposMatchPrefill(atual, idDocumento, idGrupoDestino))
  }, [])

  return (
    <div className="sr-prefill-bid-match">
      <div className="sr-prefill-bid-revisao-cabecalho">
        <ArrowsLeftRight weight="duotone" size={20} aria-hidden />
        <div>
          <h3 className="sr-prefill-bid-revisao-titulo">Combinar documentos nas cotações</h3>
          <p className="sr-prefill-bid-revisao-subtitulo">
            Arraste invoice e packing do mesmo embarque para a mesma cotação. Crie ou exclua
            cotações conforme precisar — depois disso saberemos quantas abrir.
          </p>
        </div>
      </div>

      <div className="sr-prefill-bid-match-grade">
        {grupos.map((grupo) => (
          <section
            key={grupo.id_grupo}
            className={`sr-prefill-bid-match-grupo${idGrupoSobre === grupo.id_grupo ? ' sr-prefill-bid-match-grupo--sobre' : ''}`}
            aria-label={grupo.nome_grupo}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
              setIdGrupoSobre(grupo.id_grupo)
            }}
            onDragLeave={() => {
              setIdGrupoSobre((atual) => (atual === grupo.id_grupo ? null : atual))
            }}
            onDrop={(e) => {
              e.preventDefault()
              const id = e.dataTransfer.getData(TIPO_DRAG) || idArrastando
              setIdGrupoSobre(null)
              setIdArrastando(null)
              if (id) moverPara(id, grupo.id_grupo)
            }}
          >
            <header className="sr-prefill-bid-match-grupo-cabecalho">
              <Sparkle weight="duotone" size={14} aria-hidden />
              <strong>{grupo.nome_grupo}</strong>
              <span>{grupo.ids_documentos.length} doc.</span>
              {grupos.length > 1 && (
                <button
                  type="button"
                  className="sr-prefill-bid-match-excluir"
                  title="Excluir cotação"
                  aria-label={`Excluir ${grupo.nome_grupo}`}
                  onClick={() => setGrupos((atual) => excluirGrupoMatchPrefill(atual, grupo.id_grupo))}
                >
                  <Trash weight="bold" size={14} />
                </button>
              )}
            </header>
            <ul className="sr-prefill-bid-match-lista">
              {grupo.ids_documentos.map((id) => {
                const doc = mapaDocs.get(id)
                if (!doc) return null
                return (
                  <li
                    key={id}
                    className={`sr-prefill-bid-match-item${idArrastando === id ? ' sr-prefill-bid-match-item--arrastando' : ''}`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(TIPO_DRAG, id)
                      e.dataTransfer.effectAllowed = 'move'
                      setIdArrastando(id)
                    }}
                    onDragEnd={() => {
                      setIdArrastando(null)
                      setIdGrupoSobre(null)
                    }}
                  >
                    <DotsSixVertical className="sr-prefill-bid-match-handle" size={16} weight="bold" aria-hidden />
                    <div className="sr-prefill-bid-match-item-texto">
                      <div className="sr-prefill-bid-match-item-titulo">{doc.rotulo}</div>
                      <div className="sr-prefill-bid-match-item-resumo">{doc.resumo}</div>
                    </div>
                  </li>
                )
              })}
              {grupo.ids_documentos.length === 0 && (
                <li className="sr-prefill-bid-match-vazio">Solte documentos aqui</li>
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
