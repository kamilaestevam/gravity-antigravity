/**
 * CardArquivoNovaLeituraSmartRead — card individual na sidebar do wizard
 */

import {
  CaretDown,
  CaretUp,
  CheckCircle,
  CircleNotch,
  Eye,
  FilePdf,
  FileText,
  Trash,
  XCircle,
} from '@phosphor-icons/react'
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import {
  contarDocumentosArquivoLocal,
  extrairDocumentosArquivoLocal,
} from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import { formatarErroArquivoLeituraSmartRead } from '../../shared/formatar-erro-arquivo-leitura-smart-read'

type Props = {
  item: ArquivoLocalNovaLeitura
  passo: number
  onRemover?: () => void
  onAlternarExpandido: () => void
  onVisualizarArquivo: () => void
  onVisualizarDocumento: (indice: number) => void
}

function rotuloStatus(item: ArquivoLocalNovaLeitura, passo: number): string {
  switch (item.status_arquivo_local) {
    case 'anexado':
      return passo === 1 ? 'Arquivo enviado' : 'Aguardando envio'
    case 'enviando':
      return 'Enviando arquivo...'
    case 'analisando':
      return 'Analisando arquivo...'
    case 'completo':
      return 'Análise completa'
    case 'erro':
      return formatarErroArquivoLeituraSmartRead(item.mensagem_erro)
    default:
      return ''
  }
}

export function CardArquivoNovaLeituraSmartRead({
  item,
  passo,
  onRemover,
  onAlternarExpandido,
  onVisualizarArquivo,
  onVisualizarDocumento,
}: Props) {
  const documentos = extrairDocumentosArquivoLocal(item)
  const quantidadeDocumentos = contarDocumentosArquivoLocal(item)
  const temDocumentosIdentificados = quantidadeDocumentos > 0
  const podeExpandir = passo >= 2 && temDocumentosIdentificados
  const emProcessamento =
    item.status_arquivo_local === 'enviando' || item.status_arquivo_local === 'analisando'
  const completo = item.status_arquivo_local === 'completo'
  const erro = item.status_arquivo_local === 'erro'

  return (
    <article className={`sr-wizard-card${item.expandido ? ' sr-wizard-card--expandido' : ''}`}>
      <div className="sr-wizard-card-cabecalho">
        <span className="sr-wizard-card-icone">
          <FilePdf size={18} weight="duotone" />
        </span>
        <span className="sr-wizard-card-nome" title={item.arquivo.name}>
          {item.arquivo.name}
        </span>
        <div className="sr-wizard-card-acoes">
          <button
            type="button"
            className="sr-wizard-card-btn-visualizar"
            title="Visualizar documento original"
            aria-label={`Visualizar original ${item.arquivo.name}`}
            onClick={onVisualizarArquivo}
          >
            <Eye size={16} weight="duotone" />
            {temDocumentosIdentificados && (
              <span className="sr-wizard-card-contagem" aria-label={`${quantidadeDocumentos} documento(s) identificado(s)`}>
                {quantidadeDocumentos}
              </span>
            )}
          </button>

          {podeExpandir && (
            <button
              type="button"
              className="sr-wizard-card-btn-icone"
              title={item.expandido ? 'Recolher documentos identificados' : 'Expandir documentos identificados'}
              aria-expanded={item.expandido}
              onClick={onAlternarExpandido}
            >
              {item.expandido ? <CaretUp size={16} /> : <CaretDown size={16} />}
            </button>
          )}

          {passo === 1 && onRemover && (
            <button
              type="button"
              className="sr-wizard-card-btn-icone sr-wizard-card-btn-remover"
              title="Remover arquivo"
              aria-label={`Remover ${item.arquivo.name}`}
              onClick={onRemover}
            >
              <Trash size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="sr-wizard-card-status">
        {emProcessamento && <CircleNotch size={14} className="sr-wizard-card-spin" />}
        {completo && <CheckCircle size={14} weight="fill" className="sr-wizard-card-ok" />}
        {erro && <XCircle size={14} weight="fill" className="sr-wizard-card-erro-icone" />}
        <span>{rotuloStatus(item, passo)}</span>
      </div>

      {temDocumentosIdentificados && !item.expandido && (
        <div className="sr-wizard-card-chips" aria-label="Documentos identificados">
          {documentos.map((doc) => (
            <span key={doc.id_documento} className="sr-wizard-card-tag-tipo">
              {doc.tipo_documento}
            </span>
          ))}
        </div>
      )}

      {item.expandido && temDocumentosIdentificados && (
        <ul className="sr-wizard-card-documentos">
          {documentos.map((doc) => (
            <li key={doc.id_documento}>
              <span className="sr-wizard-card-doc-rotulo">
                <FileText size={14} weight="duotone" />
                {doc.tipo_documento}
              </span>
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
          ))}
        </ul>
      )}
    </article>
  )
}
