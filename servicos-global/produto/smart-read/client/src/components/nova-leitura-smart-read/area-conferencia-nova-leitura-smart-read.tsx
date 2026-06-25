/**
 * AreaConferenciaNovaLeituraSmartRead — passo 3 (abas + conferência padrão Dados do Processo)
 */

import { useEffect, useMemo, useState } from 'react'
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import { ConferenciaCamposNovaLeituraSmartRead } from './conferencia-campos-nova-leitura-smart-read'
import { ConferenciaQaNovaLeituraSmartRead } from './conferencia-qa-nova-leitura-smart-read'

export type SelecaoDocumentoConferencia = {
  idArquivoLocal: string
  indiceDocumento: number
}

type AbaConferencia = 'campos' | 'qa'

type Props = {
  arquivos: ArquivoLocalNovaLeitura[]
  selecao: SelecaoDocumentoConferencia | null
  onSelecionarDocumento: (selecao: SelecaoDocumentoConferencia) => void
  onCompararArquivo?: () => void
}

export function AreaConferenciaNovaLeituraSmartRead({
  arquivos,
  selecao,
  onSelecionarDocumento,
  onCompararArquivo,
}: Props) {
  const [aba, setAba] = useState<AbaConferencia>('campos')

  const arquivosCompletos = arquivos.filter(
    (item) => item.status_arquivo_local === 'completo' && item.leitura,
  )

  const arquivoAtual = useMemo(
    () =>
      arquivosCompletos.find((a) => a.id_arquivo_local === selecao?.idArquivoLocal) ??
      arquivosCompletos[0],
    [arquivosCompletos, selecao?.idArquivoLocal],
  )

  const indiceDocumento = selecao?.indiceDocumento ?? 0

  useEffect(() => {
    if (arquivosCompletos.length === 0) return
    const alvo = arquivoAtual ?? arquivosCompletos[0]
    if (!selecao || selecao.idArquivoLocal !== alvo.id_arquivo_local) {
      onSelecionarDocumento({ idArquivoLocal: alvo.id_arquivo_local, indiceDocumento: 0 })
    }
  }, [arquivosCompletos, arquivoAtual, selecao, onSelecionarDocumento])

  return (
    <div className="sr-wizard-principal sr-wizard-principal--conferencia">
      <div className="sr-conf-tabs" role="tablist" aria-label="Conferência da leitura">
        <button
          type="button"
          role="tab"
          aria-selected={aba === 'campos'}
          className={`sr-conf-tab${aba === 'campos' ? ' sr-conf-tab--ativo' : ''}`}
          onClick={() => setAba('campos')}
        >
          Conferência de Campos
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={aba === 'qa'}
          className={`sr-conf-tab${aba === 'qa' ? ' sr-conf-tab--ativo' : ''}`}
          onClick={() => setAba('qa')}
        >
          Q&amp;A sobre Leitura
        </button>
      </div>

      {aba === 'campos' && (
        <>
          {arquivosCompletos.length === 0 ? (
            <p className="sr-conf-vazio">Aguardando análise dos arquivos.</p>
          ) : arquivoAtual ? (
            <ConferenciaCamposNovaLeituraSmartRead
              arquivo={arquivoAtual}
              indiceDocumento={indiceDocumento}
              onCompararArquivo={onCompararArquivo}
            />
          ) : null}
        </>
      )}

      {aba === 'qa' && <ConferenciaQaNovaLeituraSmartRead arquivos={arquivosCompletos} />}
    </div>
  )
}
