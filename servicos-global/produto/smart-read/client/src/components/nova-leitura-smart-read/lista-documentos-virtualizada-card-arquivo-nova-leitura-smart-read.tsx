/**
 * Lista virtualizada de documentos extraídos na sidebar do wizard (PDFs com muitas invoices).
 */

import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Eye, FileText } from '@phosphor-icons/react'
import type { DocumentoExtraidoArquivoLocal } from '../../shared/tipo-arquivo-nova-leitura-smart-read'

const LIMITE_VIRTUALIZACAO = 8
const ALTURA_LINHA_DOCUMENTO_PX = 34
const ALTURA_MAXIMA_LISTA_PX = 280

type Props = {
  documentos: DocumentoExtraidoArquivoLocal[]
  passo: number
  selecaoConferencia: number | null
  onSelecionarDocumentoConferencia?: (indice: number) => void
  onVisualizarDocumento: (indice: number) => void
}

function LinhaDocumentoCard({
  doc,
  passo,
  ativoConferencia,
  onSelecionarDocumentoConferencia,
  onVisualizarDocumento,
}: {
  doc: DocumentoExtraidoArquivoLocal
  passo: number
  ativoConferencia: boolean
  onSelecionarDocumentoConferencia?: (indice: number) => void
  onVisualizarDocumento: (indice: number) => void
}) {
  return (
    <li className={ativoConferencia ? 'sr-wizard-card-documentos-item--ativo' : undefined}>
      <button
        type="button"
        className="sr-wizard-card-doc-selecao"
        title={`Conferir ${doc.tipo_documento}`}
        aria-label={`Conferir ${doc.tipo_documento}`}
        aria-current={ativoConferencia ? 'true' : undefined}
        onClick={() => onSelecionarDocumentoConferencia?.(doc.indice)}
      >
        <span className="sr-wizard-card-doc-rotulo">
          <FileText size={14} weight="duotone" />
          {doc.tipo_documento}
        </span>
      </button>
      <button
        type="button"
        className="sr-wizard-card-btn-icone"
        title={`Visualizar ${doc.tipo_documento}`}
        aria-label={`Visualizar ${doc.tipo_documento}`}
        onClick={() => onVisualizarDocumento(doc.indice)}
      >
        <Eye size={14} />
      </button>
    </li>
  )
}

export function ListaDocumentosVirtualizadaCardArquivoNovaLeituraSmartRead({
  documentos,
  passo,
  selecaoConferencia,
  onSelecionarDocumentoConferencia,
  onVisualizarDocumento,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: documentos.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ALTURA_LINHA_DOCUMENTO_PX,
    overscan: 4,
  })

  if (documentos.length <= LIMITE_VIRTUALIZACAO) {
    return (
      <ul className="sr-wizard-card-documentos">
        {documentos.map((doc) => (
          <LinhaDocumentoCard
            key={doc.id_documento}
            doc={doc}
            passo={passo}
            ativoConferencia={passo >= 2 && selecaoConferencia !== null && selecaoConferencia === doc.indice}
            onSelecionarDocumentoConferencia={onSelecionarDocumentoConferencia}
            onVisualizarDocumento={onVisualizarDocumento}
          />
        ))}
      </ul>
    )
  }

  return (
    <div
      ref={scrollRef}
      className="sr-wizard-card-documentos-scroll"
      style={{ maxHeight: ALTURA_MAXIMA_LISTA_PX, overflow: 'auto' }}
      aria-label={`${documentos.length} documentos identificados`}
    >
      <ul
        className="sr-wizard-card-documentos sr-wizard-card-documentos--virtual"
        style={{ height: virtualizer.getTotalSize(), position: 'relative', margin: 0 }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const doc = documentos[virtualRow.index]
          if (!doc) return null
          const ativoConferencia =
            passo >= 2 && selecaoConferencia !== null && selecaoConferencia === doc.indice
          return (
            <li
              key={doc.id_documento}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              className={ativoConferencia ? 'sr-wizard-card-documentos-item--ativo' : undefined}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <button
                type="button"
                className="sr-wizard-card-doc-selecao"
                title={`Conferir ${doc.tipo_documento}`}
                aria-label={`Conferir ${doc.tipo_documento}`}
                aria-current={ativoConferencia ? 'true' : undefined}
                onClick={() => onSelecionarDocumentoConferencia?.(doc.indice)}
              >
                <span className="sr-wizard-card-doc-rotulo">
                  <FileText size={14} weight="duotone" />
                  {doc.tipo_documento}
                </span>
              </button>
              <button
                type="button"
                className="sr-wizard-card-btn-icone"
                title={`Visualizar ${doc.tipo_documento}`}
                aria-label={`Visualizar ${doc.tipo_documento}`}
                onClick={() => onVisualizarDocumento(doc.indice)}
              >
                <Eye size={14} />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
