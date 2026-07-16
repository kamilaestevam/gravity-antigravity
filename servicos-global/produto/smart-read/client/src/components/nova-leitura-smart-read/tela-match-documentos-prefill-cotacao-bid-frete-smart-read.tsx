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
  type DocumentoMatchPrefillCotacaoBidFrete,
  type GrupoCotacaoMatchPrefillBidFrete,
} from '../../../../shared/match-documentos-prefill-cotacao-bid-frete-smart-read.js'

type Props = {
  leitura: LeituraParaConversaoCotacaoBidFrete
  onConfirmar: (grupos: GrupoCotacaoMatchPrefillBidFrete[]) => void
}

const TIPO_DRAG = 'application/x-sr-prefill-doc-id'

function rotuloGrupoDinamico(
  grupo: GrupoCotacaoMatchPrefillBidFrete,
  indice: number,
  mapaDocs: Map<string, DocumentoMatchPrefillCotacaoBidFrete>,
): string {
  const refs = grupo.ids_documentos
    .map((id) => mapaDocs.get(id)?.numero_referencia)
    .filter((r): r is string => Boolean(r))
  const unica = [...new Set(refs)]
  const base = `Cotação ${indice + 1}`
  if (unica.length === 1) return `${base} · ${unica[0]}`
  if (unica.length > 1) return `${base} · ${unica.length} refs`
  return base
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
  const [idArrastando, setIdArrastando] = useState<string | null>(null)
  const [idGrupoSobre, setIdGrupoSobre] = useState<string | null>(null)

  const mapaDocs = useMemo(
    () => new Map(documentos.map((d) => [d.id_documento, d])),
    [documentos],
  )

  const gruposValidos = grupos.filter((g) => g.ids_documentos.length > 0)
  const vazias = grupos.length - gruposValidos.length

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
            Arraste invoice e packing do mesmo embarque para a mesma coluna. Depois revisamos
            cada cotação e abrimos uma Nova Cotação por vez no BID Frete.
          </p>
        </div>
      </div>

      <div className="sr-prefill-bid-match-grade">
        {grupos.map((grupo, indice) => {
          const nome = rotuloGrupoDinamico(grupo, indice, mapaDocs)
          return (
            <section
              key={grupo.id_grupo}
              className={`sr-prefill-bid-match-grupo${idGrupoSobre === grupo.id_grupo ? ' sr-prefill-bid-match-grupo--sobre' : ''}`}
              aria-label={nome}
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
                <strong>{nome}</strong>
                <span>{grupo.ids_documentos.length} doc.</span>
                {grupos.length > 1 && (
                  <button
                    type="button"
                    className="sr-prefill-bid-match-excluir"
                    title="Excluir cotação"
                    aria-label={`Excluir ${nome}`}
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
          )
        })}

        <button
          type="button"
          className="sr-prefill-bid-match-nova"
          onClick={() => setGrupos((atual) => criarGrupoVazioMatchPrefill(atual))}
        >
          <Plus weight="bold" size={22} aria-hidden />
          <span>Nova cotação</span>
        </button>
      </div>

      <div className="sr-prefill-bid-match-rodape">
        <p className="sr-prefill-bid-match-contagem">
          {gruposValidos.length === 0
            ? 'Coloque ao menos um documento em uma cotação para revisar.'
            : vazias > 0
              ? `${gruposValidos.length} cotação(ões) com documentos serão revisadas · ${vazias} vazia(s) ignorada(s).`
              : `${gruposValidos.length} cotação(ões) · cada uma abre uma Nova Cotação no BID, em sequência.`}
        </p>
        <BotaoGlobal
          variante="primario"
          tamanho="padrao"
          disabled={gruposValidos.length === 0}
          onClick={() =>
            onConfirmar(
              gruposValidos.map((g, i) => ({
                ...g,
                nome_grupo: rotuloGrupoDinamico(g, i, mapaDocs),
              })),
            )
          }
        >
          {gruposValidos.length <= 1
            ? 'Revisar cotação'
            : `Revisar ${gruposValidos.length} cotações`}
        </BotaoGlobal>
      </div>
    </div>
  )
}
