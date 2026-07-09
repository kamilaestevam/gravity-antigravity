import { useCallback, useEffect, useMemo, useState } from 'react'
import { UploadSimple } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { GravityLoader } from '../../../Feedback/gravity-loader-global/src/GravityLoader'
import '../../../Feedback/gravity-loader-global/src/gravity-loader.css'
import { ModalPassoPassoGlobal } from '../../../Modais/modal-passo-passo-global/src/ModalPassoPassoGlobal'
import type { PassoConfig } from '../../../Modais/modal-passo-passo-global/src/ModalPassoPassoGlobal'
import '../../../Modais/modal-passo-passo-global/src/modal-passo-passo.css'
import type { PerfilEmpresaSimulador } from '../smart-doc/dados-cliente-maduro-simulador-smart-doc'
import type { LinhaListaPedidoSimulador } from './dados-lista-simulador-pedido'
import {
  EtapaConfirmacaoSmartImportSimulador,
  EtapaMapeamentoSmartImportSimulador,
  EtapaPreviewSmartImportSimulador,
  EtapaUploadSmartImportSimulador,
} from './etapas-smart-import-simulador-pedido'
import {
  analisarArquivoSmartImportSimulador,
  calcularConflitosMapeamentoSimulador,
  confirmarSmartImportSimulador,
  decisoesDuplicataIniciaisSmartImport,
  linhasSelecionaveisIniciaisSmartImport,
  montarLinhasImportacaoSmartImportSimulador,
} from './motor-smart-import-simulador-pedido'
import { reprocessarLinhasPreviewSmartImportSimulador } from './parsear-arquivo-smart-import-simulador-pedido'
import { baixarPlanilhaModeloPreenchidaSmartImportSimuladorPedido, NOME_PLANILHA_MODELO_PREENCHIDA_SMART_IMPORT_SIMULADOR } from './planilha-modelo-preenchida-smart-import-simulador-pedido'
import { EscolhaModoSmartImportSimuladorPedido } from './escolha-modo-smart-import-simulador-pedido'
import type {
  ColunaMapeadaSimulador,
  DecisaoDuplicataSimulador,
  ErroDetalhadoUploadSimulador,
  SmartImportPreviewSimulador,
  SmartImportResultadoSimulador,
} from './tipos-smart-import-simulador-pedido'
import './modal-smart-import-simulador-pedido.css'

type Etapa = 'upload' | 'mapeamento' | 'preview' | 'confirmacao'

const ORDEM_ETAPAS: Etapa[] = ['upload', 'mapeamento', 'preview', 'confirmacao']

const PASSOS: PassoConfig[] = [
  { id: 1, label: 'Upload' },
  { id: 2, label: 'Mapeamento' },
  { id: 3, label: 'Preview' },
  { id: 4, label: 'Resultado' },
]

function etapaParaId(e: Etapa): number {
  return ORDEM_ETAPAS.indexOf(e) + 1
}

const MSGS_XLSX = [
  'Lendo colunas do arquivo...',
  'Mapeando campos com IA...',
  'Verificando duplicatas no sistema...',
  'Preparando preview...',
]

type Props = {
  aberto: boolean
  empresaAtiva?: PerfilEmpresaSimulador
  onFechar: () => void
  onConcluido: (linhas: LinhaListaPedidoSimulador[]) => void
}

export function ModalSmartImportSimuladorPedido({ aberto, empresaAtiva, onFechar, onConcluido }: Props) {
  const [etapa, setEtapa] = useState<Etapa>('upload')
  const [analisando, setAnalisando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [erro, setErro] = useState<ErroDetalhadoUploadSimulador | null>(null)
  const [preview, setPreview] = useState<SmartImportPreviewSimulador | null>(null)
  const [mapeamento, setMapeamento] = useState<ColunaMapeadaSimulador[]>([])
  const [lembrarMapeamento, setLembrarMapeamento] = useState(true)
  const [linhasSelecionadas, setLinhasSelecionadas] = useState<Set<number>>(new Set())
  const [decisoesDuplicatas, setDecisoesDuplicatas] = useState<Record<string, DecisaoDuplicataSimulador>>({})
  const [numerosEditados, setNumerosEditados] = useState<Record<number, string>>({})
  const [resultado, setResultado] = useState<SmartImportResultadoSimulador | null>(null)
  const [msgProgresso, setMsgProgresso] = useState(MSGS_XLSX[0])
  const [arquivoAtual, setArquivoAtual] = useState<File | null>(null)
  const [mostrarEscolhaModo, setMostrarEscolhaModo] = useState(true)
  const [carregandoExemplo, setCarregandoExemplo] = useState(false)
  const [erroExemplo, setErroExemplo] = useState<string | null>(null)
  const [avisoPlanilhaModeloBaixada, setAvisoPlanilhaModeloBaixada] = useState(false)

  const conflitosAtuais = useMemo(
    () => calcularConflitosMapeamentoSimulador(mapeamento),
    [mapeamento],
  )

  const resetar = useCallback(() => {
    setEtapa('upload')
    setAnalisando(false)
    setConfirmando(false)
    setErro(null)
    setPreview(null)
    setMapeamento([])
    setLinhasSelecionadas(new Set())
    setDecisoesDuplicatas({})
    setNumerosEditados({})
    setResultado(null)
    setArquivoAtual(null)
    setMsgProgresso(MSGS_XLSX[0])
    setMostrarEscolhaModo(true)
    setCarregandoExemplo(false)
    setErroExemplo(null)
    setAvisoPlanilhaModeloBaixada(false)
  }, [])

  useEffect(() => {
    if (!aberto) {
      const t = window.setTimeout(resetar, 300)
      return () => window.clearTimeout(t)
    }
    return undefined
  }, [aberto, resetar])

  useEffect(() => {
    if (!analisando) return
    let idx = 0
    const interval = window.setInterval(() => {
      idx = (idx + 1) % MSGS_XLSX.length
      setMsgProgresso(MSGS_XLSX[idx])
    }, 1800)
    return () => window.clearInterval(interval)
  }, [analisando])

  const handleArquivoSelecionado = useCallback(async (arquivo: File) => {
    setArquivoAtual(arquivo)
    setAvisoPlanilhaModeloBaixada(false)
    setAnalisando(true)
    setErro(null)
    try {
      const dados = await analisarArquivoSmartImportSimulador(arquivo)
      setPreview(dados)
      setMapeamento(dados.mapeamento)
      setLinhasSelecionadas(linhasSelecionaveisIniciaisSmartImport(dados))
      setDecisoesDuplicatas(decisoesDuplicataIniciaisSmartImport(dados))
      setEtapa('mapeamento')
    } catch {
      setErro({
        code: 'ERRO_ANALISE',
        titulo: 'Não foi possível processar o arquivo',
        mensagem: 'Erro ao analisar arquivo. Tente novamente.',
        sugestoes: ['Verifique se o arquivo é Excel, CSV, XML, JSON ou TXT', 'PDF deve ser lido pelo Smart Docs', 'Tente novamente com a planilha modelo Gravity'],
        retryable: true,
      })
    } finally {
      setAnalisando(false)
    }
  }, [])

  const handleEscolherManual = useCallback(() => {
    setErroExemplo(null)
    setMostrarEscolhaModo(false)
    setEtapa('upload')
  }, [])

  const handleEscolherExemplo = useCallback(async () => {
    if (carregandoExemplo || analisando) return
    setErroExemplo(null)
    setErro(null)
    setCarregandoExemplo(true)
    try {
      await baixarPlanilhaModeloPreenchidaSmartImportSimuladorPedido()
      setAvisoPlanilhaModeloBaixada(true)
      setMostrarEscolhaModo(false)
      setEtapa('upload')
    } catch {
      setErroExemplo('Não foi possível baixar a planilha modelo. Tente novamente ou use o modo manual.')
    } finally {
      setCarregandoExemplo(false)
    }
  }, [carregandoExemplo, analisando])

  const handleConfirmar = useCallback(async () => {
    if (!preview) return
    setConfirmando(true)
    setErro(null)
    try {
      await new Promise((r) => window.setTimeout(r, 900))
      const payload = {
        preview_id: preview.preview_id,
        mapeamento_confirmado: mapeamento,
        decisoes_duplicatas: decisoesDuplicatas,
        linhas_incluidas: Array.from(linhasSelecionadas),
        salvar_mapeamento: lembrarMapeamento,
        numeros_editados: Object.keys(numerosEditados).length > 0 ? numerosEditados : undefined,
        linhas: preview.linhas,
      }
      const res = confirmarSmartImportSimulador(payload)
      setResultado(res)
      setEtapa('confirmacao')
    } catch {
      setErro({
        code: 'ERRO_CONFIRMAR',
        titulo: 'Não foi possível concluir',
        mensagem: 'Erro ao importar pedidos. Tente novamente.',
        sugestoes: ['Revise as linhas selecionadas no preview', 'Tente novamente'],
        retryable: true,
      })
    } finally {
      setConfirmando(false)
    }
  }, [preview, mapeamento, decisoesDuplicatas, linhasSelecionadas, lembrarMapeamento, numerosEditados])

  const handleVerPedidos = useCallback(() => {
    if (!preview || !resultado) {
      onFechar()
      return
    }
    const payload = {
      preview_id: preview.preview_id,
      mapeamento_confirmado: mapeamento,
      decisoes_duplicatas: decisoesDuplicatas,
      linhas_incluidas: Array.from(linhasSelecionadas),
      salvar_mapeamento: lembrarMapeamento,
      numeros_editados: Object.keys(numerosEditados).length > 0 ? numerosEditados : undefined,
      linhas: preview.linhas,
    }
    const linhas = montarLinhasImportacaoSmartImportSimulador(payload, empresaAtiva, resultado.ids_criados)
    onConcluido(linhas)
  }, [preview, resultado, mapeamento, decisoesDuplicatas, linhasSelecionadas, lembrarMapeamento, numerosEditados, empresaAtiva, onConcluido, onFechar])

  const handleFecharModal = useCallback(() => {
    if (etapa === 'confirmacao' && resultado && (resultado.criados > 0 || resultado.atualizados > 0)) {
      handleVerPedidos()
      return
    }
    onFechar()
  }, [etapa, resultado, handleVerPedidos, onFechar])

  const footer = mostrarEscolhaModo ? (
    <BotaoGlobal variante="secundario" tamanho="medio" onClick={onFechar} disabled={carregandoExemplo || analisando}>
      Cancelar
    </BotaoGlobal>
  ) : etapa === 'confirmacao' ? undefined : (
    <>
      <BotaoGlobal variante="secundario" tamanho="medio" onClick={onFechar} disabled={analisando || confirmando}>
        Cancelar
      </BotaoGlobal>
      <div className="smart-import__footer-acoes">
        {etapa === 'preview' && (
          <BotaoGlobal variante="secundario" tamanho="medio" onClick={() => setEtapa('mapeamento')} disabled={confirmando}>
            Voltar
          </BotaoGlobal>
        )}
        {etapa === 'mapeamento' && (
          <BotaoGlobal
            variante="primario"
            tamanho="medio"
            onClick={() => {
              if (preview) {
                const linhasAtualizadas = reprocessarLinhasPreviewSmartImportSimulador(preview, mapeamento)
                setPreview({
                  ...preview,
                  mapeamento,
                  linhas: linhasAtualizadas,
                  total_linhas: linhasAtualizadas.length,
                  confianca_global: mapeamento.length > 0
                    ? Math.round(mapeamento.reduce((s, m) => s + m.confianca, 0) / mapeamento.length)
                    : preview.confianca_global,
                })
                setLinhasSelecionadas(linhasSelecionaveisIniciaisSmartImport({
                  ...preview,
                  linhas: linhasAtualizadas,
                }))
              }
              setEtapa('preview')
            }}
            disabled={analisando || conflitosAtuais.length > 0}
            title={conflitosAtuais.length > 0 ? 'Resolva os conflitos de mapeamento antes de continuar' : undefined}
          >
            Continuar
          </BotaoGlobal>
        )}
        {etapa === 'preview' && preview && (
          <BotaoGlobal
            variante="primario"
            tamanho="medio"
            onClick={handleConfirmar}
            disabled={confirmando || linhasSelecionadas.size === 0}
            carregando={confirmando}
          >
            {confirmando
              ? 'Importando...'
              : linhasSelecionadas.size === preview.linhas.length
                ? 'Importar Pedido'
                : `Importar ${linhasSelecionadas.size} linha(s)`}
          </BotaoGlobal>
        )}
      </div>
      {etapa === 'preview' && (
        <p style={{ width: '100%', margin: '0.5rem 0 0 0', fontSize: '0.6875rem', color: 'var(--text-muted)', textAlign: 'center', gridColumn: '1/-1' }}>
          Pedidos serão criados com status Rascunho — revise e altere para Aberto após importar
        </p>
      )}
    </>
  )

  return (
    <ModalPassoPassoGlobal
      titulo="Importar Pedidos"
      icone={<UploadSimple size={20} weight="duotone" />}
      subtitulo="Importe pedidos por planilha ou arquivo (Excel, CSV, XML, JSON, TXT)"
      aberto={aberto}
      passos={PASSOS}
      passoAtual={mostrarEscolhaModo ? 0 : etapaParaId(etapa)}
      onProximo={() => undefined}
      onVoltar={() => undefined}
      onFechar={handleFecharModal}
      tamanho="xl"
      classNameDialog="pds-si-dialog"
      ocultarStepper={mostrarEscolhaModo || etapa === 'confirmacao'}
      ocultarFooter={etapa === 'confirmacao'}
      footerCustom={footer}
    >
      {preview && (etapa === 'mapeamento' || etapa === 'preview') && (
        <div className="smart-import__contexto-arquivo">
          <span>
            {preview.total_pedidos} pedido(s) — {preview.total_itens} item(ns) — {preview.total_linhas} linha(s)
          </span>
          {preview.extrator_usado && (
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginLeft: '0.75rem', opacity: 0.7 }}>
              parser: {preview.extrator_usado}
            </span>
          )}
        </div>
      )}

      {preview && etapa === 'mapeamento' && preview.confianca_global < 60 && (
        <div className="smart-import__aviso-confianca">
          Confiança média: {preview.confianca_global}% — revise o mapeamento antes de continuar
        </div>
      )}

      {etapa === 'mapeamento' && conflitosAtuais.length > 0 && (
        <div style={{ padding: '0.625rem 1.25rem', background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', fontSize: '0.75rem', fontWeight: 500 }}>
          <strong>Conflito de mapeamento:</strong>{' '}
          {conflitosAtuais.map((c) => `"${c.colunas_arquivo.join('", "')}" apontam para "${c.campo_sistema}"`).join(' · ')}
          . Escolha apenas 1 coluna por campo (marque as outras como Ignorar).
        </div>
      )}

      <div className="smart-import__corpo">
        {analisando && (
          <div className="smart-import__analisando" aria-live="polite" aria-busy="true">
            <GravityLoader tamanho="sm" />
            <span>{msgProgresso}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {arquivoAtual?.name ?? 'Arquivo'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Isso pode levar alguns segundos para arquivos grandes
            </span>
          </div>
        )}

        {!analisando && mostrarEscolhaModo && (
          <EscolhaModoSmartImportSimuladorPedido
            carregandoExemplo={carregandoExemplo}
            erroExemplo={erroExemplo}
            onEscolherManual={handleEscolherManual}
            onEscolherExemplo={() => { void handleEscolherExemplo() }}
          />
        )}

        {!analisando && !mostrarEscolhaModo && etapa === 'upload' && (
          <EtapaUploadSmartImportSimulador
            onArquivoSelecionado={handleArquivoSelecionado}
            carregando={analisando}
            erro={erro}
            avisoPlanilhaModeloBaixada={avisoPlanilhaModeloBaixada}
            nomePlanilhaModeloBaixada={NOME_PLANILHA_MODELO_PREENCHIDA_SMART_IMPORT_SIMULADOR}
          />
        )}

        {!analisando && etapa === 'mapeamento' && preview && (
          <EtapaMapeamentoSmartImportSimulador
            mapeamento={mapeamento}
            memoriaAplicada={preview.memoria_aplicada}
            lembrarMapeamento={lembrarMapeamento}
            dadosBrutos={preview.dados_brutos}
            onMapeamentoChange={setMapeamento}
            onLembrarChange={setLembrarMapeamento}
            onVoltar={() => setEtapa('upload')}
          />
        )}

        {!analisando && etapa === 'preview' && preview && (
          <EtapaPreviewSmartImportSimulador
            linhas={preview.linhas}
            linhasSelecionadas={linhasSelecionadas}
            decisoesDuplicatas={decisoesDuplicatas}
            numerosEditados={numerosEditados}
            onSelecaoChange={setLinhasSelecionadas}
            onDecisaoDuplicata={(numero, decisao) => setDecisoesDuplicatas((prev) => ({ ...prev, [numero]: decisao }))}
            onNumeroEditado={(linha, numero) => setNumerosEditados((prev) => ({ ...prev, [linha]: numero }))}
          />
        )}

        {etapa === 'confirmacao' && resultado && (
          <EtapaConfirmacaoSmartImportSimulador
            resultado={resultado}
            onVerPedidos={handleVerPedidos}
            onFechar={handleFecharModal}
          />
        )}

        {erro && etapa !== 'upload' && (
          <div className="smart-import__erro" role="alert">
            <p style={{ margin: 0, fontWeight: 600 }}>{erro.titulo}</p>
            <p style={{ margin: '0.25rem 0 0' }}>{erro.mensagem}</p>
          </div>
        )}
      </div>
    </ModalPassoPassoGlobal>
  )
}
