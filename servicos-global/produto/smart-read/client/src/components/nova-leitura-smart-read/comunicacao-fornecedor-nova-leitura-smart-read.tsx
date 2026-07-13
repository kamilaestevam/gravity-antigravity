/**
 * ComunicacaoFornecedorNovaLeituraSmartRead — aba Comunicação com Fornecedor
 * Riscos (pré-selecionados) + campos editados (desmarcados por padrão)
 */

import { useEffect, useMemo, useState } from 'react'
import { EnvelopeSimple, PencilSimple, ShieldWarning, Warning } from '@phosphor-icons/react'
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import {
  aplicarCorrecaoSugeridaPadraoRisco,
  montarDocumentosAnaliseRiscoDeArquivoLocal,
  montarDocumentosAnaliseRiscoDeArquivosLocais,
} from '../../shared/analisar-riscos-aduaneiros-leitura-smart-read'
import type {
  RiscoAduaneiroLeitura,
  SeveridadeRiscoAduaneiro,
} from '../../shared/analisar-riscos-aduaneiros-leitura-smart-read'
import { obterCacheAnaliseRiscosSessaoSmartRead } from '../../shared/cache-analise-riscos-sessao-smart-read'
import { executarAuditoriaV1AnaliseRiscosLeitura } from '../../../../shared/analise-riscos-leitura-smart-read'
import {
  formatarLinhaCampoEditadoComunicacao,
  listarCamposEditadosComunicacaoSmartRead,
} from '../../shared/listar-campos-editados-comunicacao-smart-read'
import { AcoesCorrecaoRiscoNovaLeituraSmartRead } from './acoes-correcao-risco-nova-leitura-smart-read'

type Props = {
  arquivos: ArquivoLocalNovaLeitura[]
  arquivoConferencia?: ArquivoLocalNovaLeitura | null
  indiceDocumentoConferencia?: number
  tituloContextoDocumento?: string
  idLeituraLegado?: string | null
  camposEditados?: ReadonlySet<string>
}

function rotuloSeveridade(severidade: SeveridadeRiscoAduaneiro): string {
  switch (severidade) {
    case 'critico':
      return 'Crítico'
    case 'atencao':
      return 'Atenção'
    default:
      return 'Informativo'
  }
}

export function ComunicacaoFornecedorNovaLeituraSmartRead({
  arquivos,
  arquivoConferencia = null,
  indiceDocumentoConferencia = 0,
  tituloContextoDocumento = '',
  idLeituraLegado = null,
  camposEditados = new Set(),
}: Props) {
  const arquivosAnalisaveis = useMemo(
    () => arquivos.filter((a) => a.status_arquivo_local === 'completo'),
    [arquivos],
  )

  const documentos = useMemo(() => {
    if (arquivoConferencia) {
      return montarDocumentosAnaliseRiscoDeArquivoLocal(arquivoConferencia)
    }
    return montarDocumentosAnaliseRiscoDeArquivosLocais(arquivosAnalisaveis)
  }, [arquivoConferencia, arquivosAnalisaveis])

  const chaveAnalise = useMemo(
    () =>
      `${idLeituraLegado ?? ''}|${documentos.map((d) => `${d.nome_arquivo}:${d.indice}:${d.tipo_documento}`).join('|')}`,
    [documentos, idLeituraLegado],
  )

  const riscos = useMemo<RiscoAduaneiroLeitura[]>(() => {
    const emCache = obterCacheAnaliseRiscosSessaoSmartRead(chaveAnalise)
    if (emCache && emCache.resumo.total > 0) return emCache.resumo.riscos
    if (documentos.length === 0) return []
    return executarAuditoriaV1AnaliseRiscosLeitura(documentos).resumo.riscos
  }, [chaveAnalise, documentos])

  const camposEditadosLista = useMemo(
    () =>
      listarCamposEditadosComunicacaoSmartRead(
        arquivoConferencia,
        indiceDocumentoConferencia,
        camposEditados,
      ),
    [arquivoConferencia, indiceDocumentoConferencia, camposEditados],
  )

  const [riscosSelecionados, setRiscosSelecionados] = useState<Set<string>>(() => new Set())
  const [camposSelecionados, setCamposSelecionados] = useState<Set<string>>(() => new Set())

  // Riscos: pré-selecionados. Campos editados: desmarcados por padrão.
  useEffect(() => {
    setRiscosSelecionados(new Set(riscos.map((r) => r.id)))
    setCamposSelecionados(new Set())
  }, [chaveAnalise, riscos])

  const todosRiscosSelecionados =
    riscos.length > 0 && riscos.every((r) => riscosSelecionados.has(r.id))

  const riscosSelecionadosLista = useMemo(
    () => riscos.filter((r) => riscosSelecionados.has(r.id)).map(aplicarCorrecaoSugeridaPadraoRisco),
    [riscos, riscosSelecionados],
  )

  const camposSelecionadosLista = useMemo(
    () => camposEditadosLista.filter((c) => camposSelecionados.has(c.id)),
    [camposEditadosLista, camposSelecionados],
  )

  const totalSelecionados = riscosSelecionadosLista.length + camposSelecionadosLista.length
  const semItens = riscos.length === 0 && camposEditadosLista.length === 0

  function toggleRisco(id: string) {
    setRiscosSelecionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleCampo(id: string) {
    setCamposSelecionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelecionarTodosRiscos() {
    setRiscosSelecionados(todosRiscosSelecionados ? new Set() : new Set(riscos.map((r) => r.id)))
  }

  return (
    <div className="sr-conf-comunicacao">
      {tituloContextoDocumento && (
        <div className="sr-conf-contexto-linha sr-conf-contexto-linha--sem-acao">
          <span className="sr-conf-contexto-texto">{tituloContextoDocumento}</span>
        </div>
      )}

      {semItens ? (
        <p className="sr-conf-riscos-ok">
          Nenhum risco nem campo editado — não há pendências para comunicar ao fornecedor.
        </p>
      ) : (
        <>
          <p className="sr-conf-comunicacao-intro">
            <EnvelopeSimple size={16} weight="duotone" aria-hidden />
            Selecione riscos e campos editados para incluir na comunicação e gere o e-mail ao
            fornecedor ou a notificação interna.
          </p>

          {riscos.length > 0 && (
            <>
              <p className="sr-conf-comunicacao-secao-titulo">
                <ShieldWarning size={14} weight="duotone" aria-hidden />
                Análise de risco ({riscos.length})
              </p>
              <div className="sr-conf-riscos-cabecalho-rodape">
                <label className="dt-main-toolbar-btn sr-conf-toolbar-selecionar-conferencia">
                  <input
                    type="checkbox"
                    className="sr-conf-chk-checkbox"
                    checked={todosRiscosSelecionados}
                    onChange={toggleSelecionarTodosRiscos}
                    aria-label="Selecionar todos os riscos para a comunicação"
                  />
                  <span>Selecionar todos os riscos ({riscos.length})</span>
                </label>
              </div>

              <div className="sr-conf-comunicacao-lista">
                {riscos.map((risco, indice) => (
                  <label key={risco.id} className="sr-conf-comunicacao-item">
                    <input
                      type="checkbox"
                      className="sr-conf-chk-checkbox"
                      checked={riscosSelecionados.has(risco.id)}
                      onChange={() => toggleRisco(risco.id)}
                      aria-label={`Incluir risco na comunicação: ${risco.titulo}`}
                    />
                    <span className="sr-conf-comunicacao-item-numero" aria-hidden>
                      <Warning weight="duotone" size={14} />
                      {String(indice + 1).padStart(2, '0')}
                    </span>
                    <span className="sr-conf-comunicacao-item-titulo">{risco.titulo}</span>
                    <span
                      className={`sr-conf-risco-badge sr-conf-risco-badge--${risco.severidade}`}
                      aria-hidden
                    >
                      {rotuloSeveridade(risco.severidade)}
                    </span>
                  </label>
                ))}
              </div>
            </>
          )}

          {camposEditadosLista.length > 0 && (
            <>
              <p className="sr-conf-comunicacao-secao-titulo">
                <PencilSimple size={14} weight="fill" aria-hidden />
                Campos editados na conferência ({camposEditadosLista.length})
              </p>
              <div className="sr-conf-comunicacao-lista">
                {camposEditadosLista.map((campo, indice) => (
                  <label key={campo.id} className="sr-conf-comunicacao-item">
                    <input
                      type="checkbox"
                      className="sr-conf-chk-checkbox"
                      checked={camposSelecionados.has(campo.id)}
                      onChange={() => toggleCampo(campo.id)}
                      aria-label={`Incluir campo editado na comunicação: ${campo.rotulo}`}
                    />
                    <span
                      className="sr-conf-comunicacao-item-numero sr-conf-comunicacao-item-numero--editado"
                      aria-hidden
                    >
                      <PencilSimple weight="fill" size={14} />
                      {String(indice + 1).padStart(2, '0')}
                    </span>
                    <span className="sr-conf-comunicacao-item-titulo">
                      {formatarLinhaCampoEditadoComunicacao(campo)}
                    </span>
                    <span className="sr-conf-comunicacao-badge-editado" aria-hidden>
                      Editado
                    </span>
                  </label>
                ))}
              </div>
            </>
          )}

          {totalSelecionados > 0 ? (
            <AcoesCorrecaoRiscoNovaLeituraSmartRead
              riscos={riscosSelecionadosLista}
              camposEditados={camposSelecionadosLista}
            />
          ) : (
            <p className="sr-conf-vazio">
              Selecione ao menos um risco ou campo editado para gerar a comunicação.
            </p>
          )}
        </>
      )}
    </div>
  )
}
