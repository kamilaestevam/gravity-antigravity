/**
 * ComunicacaoFornecedorNovaLeituraSmartRead — aba Comunicação com Fornecedor
 * Seleção de riscos + geração de e-mail/notificação (movido da aba Análise de Riscos)
 */

import { useEffect, useMemo, useState } from 'react'
import { EnvelopeSimple, Warning } from '@phosphor-icons/react'
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
import { AcoesCorrecaoRiscoNovaLeituraSmartRead } from './acoes-correcao-risco-nova-leitura-smart-read'

type Props = {
  arquivos: ArquivoLocalNovaLeitura[]
  arquivoConferencia?: ArquivoLocalNovaLeitura | null
  indiceDocumentoConferencia?: number
  tituloContextoDocumento?: string
  idLeituraLegado?: string | null
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

  // Mesma chave usada pela aba Análise de Riscos — reaproveita o resultado do pipeline
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

  const [selecionados, setSelecionados] = useState<Set<string>>(() => new Set())

  // Ao trocar de documento/leitura, pré-seleciona todos os riscos para o e-mail
  useEffect(() => {
    setSelecionados(new Set(riscos.map((r) => r.id)))
  }, [chaveAnalise, riscos])

  const todosSelecionados = riscos.length > 0 && riscos.every((r) => selecionados.has(r.id))

  const riscosSelecionadosLista = useMemo(
    () => riscos.filter((r) => selecionados.has(r.id)).map(aplicarCorrecaoSugeridaPadraoRisco),
    [riscos, selecionados],
  )

  function toggleSelecao(id: string) {
    setSelecionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelecionarTodos() {
    setSelecionados(todosSelecionados ? new Set() : new Set(riscos.map((r) => r.id)))
  }

  return (
    <div className="sr-conf-comunicacao">
      {tituloContextoDocumento && (
        <div className="sr-conf-contexto-linha sr-conf-contexto-linha--sem-acao">
          <span className="sr-conf-contexto-texto">{tituloContextoDocumento}</span>
        </div>
      )}

      {riscos.length === 0 ? (
        <p className="sr-conf-riscos-ok">
          Nenhum risco identificado — não há pendências para comunicar ao fornecedor.
        </p>
      ) : (
        <>
          <p className="sr-conf-comunicacao-intro">
            <EnvelopeSimple size={16} weight="duotone" aria-hidden />
            Selecione os riscos que deseja incluir na comunicação e gere o e-mail ao fornecedor
            ou a notificação interna.
          </p>

          <div className="sr-conf-riscos-cabecalho-rodape">
            <label className="dt-main-toolbar-btn sr-conf-toolbar-selecionar-conferencia">
              <input
                type="checkbox"
                className="sr-conf-chk-checkbox"
                checked={todosSelecionados}
                onChange={toggleSelecionarTodos}
                aria-label="Selecionar todos os riscos para a comunicação"
              />
              <span>Selecionar todos ({riscos.length})</span>
            </label>
          </div>

          <div className="sr-conf-comunicacao-lista">
            {riscos.map((risco, indice) => (
              <label key={risco.id} className="sr-conf-comunicacao-item">
                <input
                  type="checkbox"
                  className="sr-conf-chk-checkbox"
                  checked={selecionados.has(risco.id)}
                  onChange={() => toggleSelecao(risco.id)}
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

          {riscosSelecionadosLista.length > 0 ? (
            <AcoesCorrecaoRiscoNovaLeituraSmartRead riscos={riscosSelecionadosLista} />
          ) : (
            <p className="sr-conf-vazio">Selecione ao menos um risco para gerar a comunicação.</p>
          )}
        </>
      )}
    </div>
  )
}
