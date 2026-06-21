/**
 * ModalCompararArquivoConferenciaSmartRead — visualização lado a lado (original + campos)
 */

import { X } from '@phosphor-icons/react'
import { ConferenciaCamposNovaLeituraSmartRead } from './conferencia-campos-nova-leitura-smart-read'
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'

type Props = {
  aberto: boolean
  arquivo: ArquivoLocalNovaLeitura | null
  indiceDocumento: number
  urlOriginal: string | null
  onFechar: () => void
}

export function ModalCompararArquivoConferenciaSmartRead({
  aberto,
  arquivo,
  indiceDocumento,
  urlOriginal,
  onFechar,
}: Props) {
  if (!aberto || !arquivo) return null

  return (
    <div className="sr-conf-comparar-overlay" role="dialog" aria-modal="true" aria-label="Comparar arquivo">
      <div className="sr-conf-comparar-painel">
        <header className="sr-conf-comparar-cabecalho">
          <strong>Comparar arquivo — {arquivo.arquivo.name}</strong>
          <button type="button" onClick={onFechar} aria-label="Fechar">
            <X size={18} weight="bold" />
          </button>
        </header>
        <div className="sr-conf-comparar-corpo">
          <div className="sr-conf-comparar-original">
            {urlOriginal ? (
              <iframe title={`Original ${arquivo.arquivo.name}`} src={urlOriginal} />
            ) : (
              <p className="sr-conf-vazio">Visualização do original indisponível.</p>
            )}
          </div>
          <div className="sr-conf-comparar-campos">
            <ConferenciaCamposNovaLeituraSmartRead
              arquivo={arquivo}
              indiceDocumento={indiceDocumento}
              ocultarComparar
            />
          </div>
        </div>
      </div>
    </div>
  )
}
