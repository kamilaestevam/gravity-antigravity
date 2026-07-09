/**
 * Conferência usuário — campos preenchidos + riscos + checklist Gravity do documento ativo.
 */

import { useMemo } from 'react'
import type { ArquivoLocalNovaLeitura } from './tipo-arquivo-nova-leitura-smart-read'
import { extrairDocumentosArquivoLocal, resolverArquivoApiLeitura } from './tipo-arquivo-nova-leitura-smart-read'
import { extrairSecoesConferenciaLeitura } from './extrair-secoes-conferencia-leitura-smart-read'
import {
  chaveCampoConferenciaUsuario,
  chaveItemChecklistUsuario,
  chaveRiscoConferenciaUsuario,
  contarConferenciaUsuarioCamposERiscos,
  usarCamposMarcacaoConferencia,
  usarChecklistMarcacaoUsuario,
  usarRiscosMarcacaoConferencia,
} from './checklist-marcacao-usuario-smart-read'
import { montarDocumentosAnaliseRiscoDeArquivoLocal } from './analisar-riscos-aduaneiros-leitura-smart-read'
import { executarAuditoriaV1AnaliseRiscosLeitura } from '../../../shared/analise-riscos-leitura-smart-read'
import type { RiscoAduaneiroLeitura } from '../../../shared/analise-riscos-leitura-smart-read'
import { montarChecklistMatrizInvoice } from '../../../shared/montar-checklist-matriz-invoice-smart-read'
import { montarChaveAnaliseRiscosSessaoSmartRead } from './disparar-analise-riscos-background-smart-read'
import { obterCacheAnaliseRiscosSessaoSmartRead } from './cache-analise-riscos-sessao-smart-read'

function filtrarRiscosPorRotuloDocumento(
  riscos: readonly RiscoAduaneiroLeitura[],
  rotulo: string | null,
): RiscoAduaneiroLeitura[] {
  if (!rotulo) return [...riscos]
  return riscos.filter((risco) => risco.evidencias.some((evidencia) => evidencia.documento === rotulo))
}

export function useConferenciaUsuarioDocumentoSmartRead(
  arquivo: ArquivoLocalNovaLeitura,
  indiceDocumento: number,
  idLeituraLegado: string | null = null,
) {
  const arquivoApi = resolverArquivoApiLeitura(arquivo)
  const extracao = arquivoApi?.resultado_extracao?.[indiceDocumento]

  const secoes = useMemo(
    () => extrairSecoesConferenciaLeitura(extracao?.dados ?? {}),
    [extracao?.dados],
  )

  const chaveMarcacaoSessao = `${arquivo.id_arquivo_local}:${indiceDocumento}`
  const { marcados: camposConferidos, alternarMarcadosLote: alternarCamposConferidosLote } =
    usarCamposMarcacaoConferencia(chaveMarcacaoSessao)
  const { marcados: riscosConferidos, alternarMarcadosLote: alternarRiscosConferidosLote } =
    usarRiscosMarcacaoConferencia(chaveMarcacaoSessao)

  const chavesCamposConferencia = useMemo(
    () =>
      secoes.flatMap((secao) =>
        secao.campos
          .filter((campo) => campo.preenchido)
          .map((campo) => chaveCampoConferenciaUsuario(campo.chave)),
      ),
    [secoes],
  )

  const rotuloDocumentoAtual = useMemo(() => {
    const documentos = extrairDocumentosArquivoLocal(arquivo)
    const documentoAtual = documentos[indiceDocumento]
    if (!documentoAtual) return null
    const tipoNorm = documentoAtual.tipo_documento.trim() || `Documento ${indiceDocumento + 1}`
    return `${arquivo.arquivo.name} · ${tipoNorm}`
  }, [arquivo, indiceDocumento])

  const documentosRiscoArquivo = useMemo(
    () => montarDocumentosAnaliseRiscoDeArquivoLocal(arquivo),
    [arquivo],
  )

  const documentosRiscoAtivos = useMemo(() => {
    return documentosRiscoArquivo.filter((doc) => doc.indice === indiceDocumento)
  }, [documentosRiscoArquivo, indiceDocumento])

  const chaveAnaliseRiscos = useMemo(
    () => montarChaveAnaliseRiscosSessaoSmartRead(idLeituraLegado, [arquivo]),
    [arquivo, idLeituraLegado],
  )

  const { marcados: checklistConferidos, alternarMarcadosLote: alternarChecklistConferidosLote } =
    usarChecklistMarcacaoUsuario(chaveAnaliseRiscos)

  const riscosDocumento = useMemo(() => {
    const emCache = obterCacheAnaliseRiscosSessaoSmartRead(chaveAnaliseRiscos)
    if (emCache?.resumo.total) {
      return filtrarRiscosPorRotuloDocumento(emCache.resumo.riscos, rotuloDocumentoAtual)
    }
    if (documentosRiscoAtivos.length === 0) return [] as RiscoAduaneiroLeitura[]
    return executarAuditoriaV1AnaliseRiscosLeitura(documentosRiscoAtivos).resumo.riscos
  }, [chaveAnaliseRiscos, documentosRiscoAtivos, rotuloDocumentoAtual])

  const chavesRiscosConferencia = useMemo(
    () => riscosDocumento.map((risco) => chaveRiscoConferenciaUsuario(risco.id)),
    [riscosDocumento],
  )

  const chavesChecklistConferencia = useMemo(() => {
    if (!rotuloDocumentoAtual) return [] as string[]
    const documentoAtual = documentosRiscoAtivos[0]
    if (!documentoAtual?.tipo_documento.toUpperCase().includes('INVOICE')) return [] as string[]

    const emCache = obterCacheAnaliseRiscosSessaoSmartRead(chaveAnaliseRiscos)
    const auditoria =
      documentosRiscoArquivo.length === 0
        ? null
        : executarAuditoriaV1AnaliseRiscosLeitura(documentosRiscoArquivo)
    const riscosEfetivos =
      emCache && emCache.resumo.total > 0 ? emCache.resumo.riscos : (auditoria?.resumo.riscos ?? [])
    const regrasEfetivas = emCache?.contexto_v1.regras ?? auditoria?.contexto.regras ?? []

    const checklist = montarChecklistMatrizInvoice({
      regras: regrasEfetivas,
      riscos: riscosEfetivos,
      pipelineConcluido: Boolean(emCache),
      llmHabilitado: emCache?.llm_ativo ?? false,
      carregando: false,
      documentos: documentosRiscoArquivo,
      rotulo_documento: rotuloDocumentoAtual,
    })

    return checklist.map((item) => chaveItemChecklistUsuario(item.regra.id, rotuloDocumentoAtual))
  }, [
    chaveAnaliseRiscos,
    documentosRiscoArquivo,
    documentosRiscoAtivos,
    rotuloDocumentoAtual,
  ])

  const resumoConferencia = useMemo(
    () =>
      contarConferenciaUsuarioCamposERiscos(
        camposConferidos,
        riscosConferidos,
        chavesCamposConferencia,
        chavesRiscosConferencia,
        checklistConferidos,
        chavesChecklistConferencia,
      ),
    [
      camposConferidos,
      riscosConferidos,
      checklistConferidos,
      chavesCamposConferencia,
      chavesRiscosConferencia,
      chavesChecklistConferencia,
    ],
  )

  const todosItensConferidos =
    resumoConferencia.total > 0 && resumoConferencia.marcados === resumoConferencia.total

  const alternarTodaConferencia = () => {
    const marcar = !todosItensConferidos
    alternarCamposConferidosLote(chavesCamposConferencia, marcar)
    alternarRiscosConferidosLote(chavesRiscosConferencia, marcar)
    alternarChecklistConferidosLote(chavesChecklistConferencia, marcar)
  }

  return {
    resumoConferencia,
    todosItensConferidos,
    alternarTodaConferencia,
    rotuloDocumentoAtual,
  }
}
