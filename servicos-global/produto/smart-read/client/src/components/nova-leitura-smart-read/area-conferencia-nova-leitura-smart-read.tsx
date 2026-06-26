/**
 * AreaConferenciaNovaLeituraSmartRead — passo 3 (abas + conferência padrão Dados do Processo)
 */

import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { ClipboardText, ShieldWarning, Sparkle } from '@phosphor-icons/react'
import type { IconProps } from '@phosphor-icons/react'
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import { ConferenciaCamposNovaLeituraSmartRead } from './conferencia-campos-nova-leitura-smart-read'
import { ConferenciaQaNovaLeituraSmartRead } from './conferencia-qa-nova-leitura-smart-read'
import { ConferenciaRiscosAduaneirosNovaLeituraSmartRead } from './conferencia-riscos-aduaneiros-nova-leitura-smart-read'
import type { ContextoEvidenciaRiscoNovaLeitura } from '../../shared/contexto-evidencia-risco-nova-leitura-smart-read'
import type { ResumoUsoLlmLeituraSmartRead, UsoLlmChamadaLeituraSmartRead } from '../../../../shared/uso-llm-leitura-smart-read'

export type SelecaoDocumentoConferencia = {
  idArquivoLocal: string
  indiceDocumento: number
}

type AbaConferencia = 'campos' | 'qa' | 'riscos'

const ABAS_CONFERENCIA: {
  id: AbaConferencia
  rotulo: string
  Icone: ComponentType<IconProps>
}[] = [
  { id: 'campos', rotulo: 'Conferência de Campos', Icone: ClipboardText },
  { id: 'qa', rotulo: 'Consultor Inteligente', Icone: Sparkle },
  { id: 'riscos', rotulo: 'Análise de Riscos', Icone: ShieldWarning },
]

type Props = {
  arquivos: ArquivoLocalNovaLeitura[]
  selecao: SelecaoDocumentoConferencia | null
  onSelecionarDocumento: (selecao: SelecaoDocumentoConferencia) => void
  onCompararArquivo?: () => void
  onVerEvidencia?: (ctx: ContextoEvidenciaRiscoNovaLeitura) => void
  idLeituraLegado?: string | null
  onTokensAtualizados?: (
    resumo: ResumoUsoLlmLeituraSmartRead | null | undefined,
    chamada?: UsoLlmChamadaLeituraSmartRead | null,
  ) => void
  onIaInicio?: () => void
  onIaFim?: () => void
}

export function AreaConferenciaNovaLeituraSmartRead({
  arquivos,
  selecao,
  onSelecionarDocumento,
  onCompararArquivo,
  onVerEvidencia,
  idLeituraLegado = null,
  onTokensAtualizados,
  onIaInicio,
  onIaFim,
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
        {ABAS_CONFERENCIA.map(({ id, rotulo, Icone }) => {
          const ativo = aba === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={ativo}
              className={`sr-conf-tab${ativo ? ' sr-conf-tab--ativo' : ''}`}
              onClick={() => setAba(id)}
            >
              <Icone
                className="sr-conf-tab-icone"
                size={16}
                weight="regular"
                aria-hidden
              />
              <span className="sr-conf-tab-rotulo">{rotulo}</span>
            </button>
          )
        })}
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

      {aba === 'qa' && (
        <ConferenciaQaNovaLeituraSmartRead
          arquivos={arquivosCompletos}
          idLeituraLegado={idLeituraLegado}
          onTokensAtualizados={onTokensAtualizados}
          onIaInicio={onIaInicio}
          onIaFim={onIaFim}
        />
      )}

      {arquivosCompletos.length > 0 && (
        <div className="sr-conf-tab-panel" hidden={aba !== 'riscos'}>
          <ConferenciaRiscosAduaneirosNovaLeituraSmartRead
            arquivos={arquivosCompletos}
            onVerEvidencia={onVerEvidencia}
            idLeituraLegado={idLeituraLegado}
            onTokensAtualizados={onTokensAtualizados}
            onIaInicio={onIaInicio}
            onIaFim={onIaFim}
          />
        </div>
      )}
    </div>
  )
}
