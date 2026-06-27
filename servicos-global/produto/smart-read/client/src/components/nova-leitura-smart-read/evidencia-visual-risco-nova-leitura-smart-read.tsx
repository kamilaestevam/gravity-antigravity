/**
 * EvidenciaVisualRiscoNovaLeituraSmartRead — miniatura do documento na evidência
 */

import { useEffect, useMemo, useState } from 'react'
import { Eye, FilePdf } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import { arquivoLocalTemBlobVisualizavel } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import type { EvidenciaRiscoAduaneiroLeitura } from '../../../shared/analise-riscos-leitura-smart-read'
import type { ContextoEvidenciaRiscoNovaLeitura } from '../../shared/contexto-evidencia-risco-nova-leitura-smart-read'

type Props = {
  evidencia: EvidenciaRiscoAduaneiroLeitura
  arquivos: ArquivoLocalNovaLeitura[]
  contextoRisco: Omit<ContextoEvidenciaRiscoNovaLeitura, 'idArquivoLocal' | 'documento' | 'campo' | 'valorAtual'>
  onVerEvidencia?: (ctx: ContextoEvidenciaRiscoNovaLeitura) => void
  compacto?: boolean
}

export function resolverArquivoLocalDaEvidenciaRisco(
  evidencia: EvidenciaRiscoAduaneiroLeitura,
  arquivos: ArquivoLocalNovaLeitura[],
): ArquivoLocalNovaLeitura | null {
  const doc = evidencia.documento.trim()
  const porNome = arquivos.find((a) => doc === a.arquivo.name || doc.startsWith(a.arquivo.name))
  if (porNome) return porNome
  return arquivos.find((a) => doc.includes(a.arquivo.name)) ?? null
}

function ehImagem(nome: string): boolean {
  return /\.(jpe?g|png|webp|gif|bmp)$/i.test(nome)
}

function ehPdf(nome: string): boolean {
  return /\.pdf$/i.test(nome.toLowerCase())
}

export function EvidenciaVisualRiscoNovaLeituraSmartRead({
  evidencia,
  arquivos,
  contextoRisco,
  onVerEvidencia,
  compacto = false,
}: Props) {
  const arquivoLocal = useMemo(
    () => resolverArquivoLocalDaEvidenciaRisco(evidencia, arquivos),
    [evidencia, arquivos],
  )

  const [urlMiniatura, setUrlMiniatura] = useState<string | null>(null)

  useEffect(() => {
    if (!arquivoLocal || !arquivoLocalTemBlobVisualizavel(arquivoLocal.arquivo)) {
      setUrlMiniatura(null)
      return
    }
    if (!ehImagem(arquivoLocal.arquivo.name)) {
      setUrlMiniatura(null)
      return
    }
    const url = URL.createObjectURL(arquivoLocal.arquivo)
    setUrlMiniatura(url)
    return () => URL.revokeObjectURL(url)
  }, [arquivoLocal])

  const podeAbrir = arquivoLocal && onVerEvidencia

  if (compacto) {
    return (
      <div className="sr-conf-risco-evidencia-visual sr-conf-risco-evidencia-visual--compacto">
        <FilePdf size={18} weight="duotone" className="sr-conf-risco-evidencia-icone" aria-hidden />
        <div className="sr-conf-risco-evidencia-meta">
          <span className="sr-conf-risco-evidencia-doc">{evidencia.documento}</span>
          {evidencia.campo && <span className="sr-conf-risco-ev-campo">{evidencia.campo}</span>}
          {evidencia.valor && <span className="sr-conf-risco-ev-valor">{evidencia.valor}</span>}
        </div>
        {podeAbrir && (
          <BotaoGlobal
            variante="secundario"
            tamanho="pequeno"
            type="button"
            className="sr-conf-risco-evidencia-btn"
            onClick={() =>
              onVerEvidencia?.({
                idArquivoLocal: arquivoLocal.id_arquivo_local,
                documento: evidencia.documento,
                campo: evidencia.campo,
                valorAtual: evidencia.valor,
                ...contextoRisco,
              })
            }
          >
            <Eye size={14} weight="bold" aria-hidden />
            Ver no documento
          </BotaoGlobal>
        )}
      </div>
    )
  }

  return (
    <div className="sr-conf-risco-evidencia-visual">
      <div className="sr-conf-risco-evidencia-print" aria-hidden={!urlMiniatura && !ehPdf(evidencia.documento)}>
        {urlMiniatura ? (
          <img src={urlMiniatura} alt="" className="sr-conf-risco-evidencia-img" />
        ) : ehPdf(evidencia.documento) || (arquivoLocal && ehPdf(arquivoLocal.arquivo.name)) ? (
          <div className="sr-conf-risco-evidencia-pdf">
            <FilePdf size={32} weight="duotone" />
            <span>PDF</span>
          </div>
        ) : (
          <div className="sr-conf-risco-evidencia-placeholder">
            <Eye size={28} weight="duotone" />
            <span>Documento</span>
          </div>
        )}
      </div>

      <div className="sr-conf-risco-evidencia-meta">
        <span>{evidencia.documento}</span>
        {evidencia.campo && <span className="sr-conf-risco-ev-campo">{evidencia.campo}</span>}
        {evidencia.valor && <span className="sr-conf-risco-ev-valor">{evidencia.valor}</span>}
        {podeAbrir && (
          <BotaoGlobal
            variante="secundario"
            tamanho="pequeno"
            type="button"
            onClick={() =>
              onVerEvidencia?.({
                idArquivoLocal: arquivoLocal.id_arquivo_local,
                documento: evidencia.documento,
                campo: evidencia.campo,
                valorAtual: evidencia.valor,
                ...contextoRisco,
              })
            }
          >
            <Eye size={14} weight="bold" aria-hidden />
            Ver no documento
          </BotaoGlobal>
        )}
      </div>
    </div>
  )
}
