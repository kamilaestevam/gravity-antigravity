/**
 * ModalCompararArquivoConferenciaSmartRead — comparação campo a campo (padrão dati).
 * Esquerda: documento atual. Direita: enviar novo arquivo → após processar,
 * exibe tabela campo a campo alinhada por caminho_campo legado, marcando divergências.
 * A coluna "Documento atual" é editável e as edições voltam para a leitura original.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowsLeftRight,
  Brain,
  CheckCircle,
  Circle,
  CloudArrowUp,
  MinusCircle,
  PencilSimple,
  WarningCircle,
  X,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { smartReadApi } from '../../shared/api'
import { mensagemDeExcecao } from '../../shared/extrair-mensagem-erro-api'
import type { Leitura } from '../../shared/schemas'
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import {
  extrairDadosArquivoLocal,
  extrairDadosLeitura,
  extrairDocumentosArquivoLocal,
  tipoDocumentoLeitura,
} from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import { ConferenciaCamposNovaLeituraSmartRead } from './conferencia-campos-nova-leitura-smart-read'
import {
  classificarComparacao,
  compararDocumentosConferencia,
  type StatusCampoComparacao,
} from '../../shared/comparar-documentos-conferencia-smart-read'
import '../../../../../processo/client/src/pages/dados-tecnicos/DadosTecnicos.css'

type FiltroComparacao = 'todos' | 'igual' | 'divergente' | 'so' | 'vazio'

const INTERVALO_POLLING_MS = 2000
const LIMITE_POLLING_MS = 5 * 60 * 1000

type FaseComparacao = 'selecionar' | 'processando' | 'pronto' | 'erro'

type Props = {
  aberto: boolean
  arquivo: ArquivoLocalNovaLeitura | null
  indiceDocumento: number
  onFechar: () => void
  onEditarCampoDocumentoAtual?: (chave: string, valor: string) => void
}

const ROTULO_STATUS: Record<StatusCampoComparacao, string> = {
  igual: 'Igual — ambos preenchidos e iguais',
  divergente: 'Divergente — ambos preenchidos e diferentes',
  somente_a: 'Só no documento atual',
  somente_b: 'Só no documento comparado',
  vazio: 'Vazio em ambos',
}

const ROTULO_FILTRO: Record<Exclude<FiltroComparacao, 'todos'>, string> = {
  igual: 'campos iguais',
  divergente: 'campos divergentes',
  so: 'campos só em um documento',
  vazio: 'campos vazios em ambos',
}

function combinaFiltro(status: StatusCampoComparacao, filtro: FiltroComparacao): boolean {
  if (filtro === 'todos') return true
  if (filtro === 'igual') return status === 'igual'
  if (filtro === 'divergente') return status === 'divergente'
  if (filtro === 'vazio') return status === 'vazio'
  return status === 'somente_a' || status === 'somente_b'
}

function IconeStatus({ status }: { status: StatusCampoComparacao }) {
  if (status === 'igual') return <CheckCircle size={15} weight="fill" className="sr-cmp-ico sr-cmp-ico--ok" />
  if (status === 'divergente') return <WarningCircle size={15} weight="fill" className="sr-cmp-ico sr-cmp-ico--div" />
  if (status === 'vazio') return <Circle size={15} weight="bold" className="sr-cmp-ico sr-cmp-ico--vazio" />
  return <MinusCircle size={15} weight="fill" className="sr-cmp-ico sr-cmp-ico--so" />
}

export function ModalCompararArquivoConferenciaSmartRead({
  aberto,
  arquivo,
  indiceDocumento,
  onFechar,
  onEditarCampoDocumentoAtual,
}: Props) {
  const [fase, setFase] = useState<FaseComparacao>('selecionar')
  const [arquivoB, setArquivoB] = useState<File | null>(null)
  const [leituraB, setLeituraB] = useState<Leitura | null>(null)
  const [erroB, setErroB] = useState<string | null>(null)
  const [arrastando, setArrastando] = useState(false)
  const [filtro, setFiltro] = useState<FiltroComparacao>('todos')
  const [edicoes, setEdicoes] = useState<Record<string, string>>({})
  const [editando, setEditando] = useState<string | null>(null)

  const ativo = useRef(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ativo.current = true
    return () => {
      ativo.current = false
    }
  }, [])

  useEffect(() => {
    if (aberto) {
      setFase('selecionar')
      setArquivoB(null)
      setLeituraB(null)
      setErroB(null)
      setArrastando(false)
      setFiltro('todos')
      setEdicoes({})
      setEditando(null)
    }
  }, [aberto, arquivo?.id_arquivo_local, indiceDocumento])

  const dadosA = useMemo(
    () => (arquivo ? extrairDadosArquivoLocal(arquivo, indiceDocumento) : null),
    [arquivo, indiceDocumento],
  )

  const tipoA = useMemo(() => {
    if (!arquivo) return null
    return extrairDocumentosArquivoLocal(arquivo)[indiceDocumento]?.tipo_documento ?? null
  }, [arquivo, indiceDocumento])

  const dadosB = useMemo(() => extrairDadosLeitura(leituraB), [leituraB])
  const tipoB = useMemo(() => tipoDocumentoLeitura(leituraB), [leituraB])

  const comparacaoBase = useMemo(() => {
    if (fase !== 'pronto') return null
    return compararDocumentosConferencia(dadosA, dadosB)
  }, [fase, dadosA, dadosB])

  const comparacao = useMemo(() => {
    if (!comparacaoBase) return null

    let iguais = 0
    let divergentes = 0
    let somenteA = 0
    let somenteB = 0
    let vazios = 0

    const secoes = comparacaoBase.secoes.map((secao) => {
      const linhas = secao.linhas.map((linha) => {
        const editado = linha.chave in edicoes ? edicoes[linha.chave] : undefined
        const valorAtual = editado !== undefined ? (editado || null) : linha.valor_a

        const status = classificarComparacao(valorAtual, linha.valor_b)

        if (status === 'igual') iguais++
        else if (status === 'divergente') divergentes++
        else if (status === 'somente_a') somenteA++
        else if (status === 'somente_b') somenteB++
        else vazios++

        return { ...linha, valor_a: valorAtual, status, editado: editado !== undefined }
      })

      return {
        ...secao,
        linhas,
        divergencias: linhas.filter((l) => l.status === 'divergente').length,
      }
    })

    return {
      secoes,
      total: comparacaoBase.total,
      iguais,
      divergentes,
      somente_a: somenteA,
      somente_b: somenteB,
      vazios,
    }
  }, [comparacaoBase, edicoes])

  const processarArquivoB = useCallback(async (file: File) => {
    setArquivoB(file)
    setLeituraB(null)
    setErroB(null)
    setFase('processando')
    try {
      const criada = await smartReadApi.enviarLeitura(file)
      const inicio = Date.now()
      while (ativo.current) {
        const leitura = await smartReadApi.obterLeitura(criada.id_leitura)
        if (!ativo.current) return
        if (leitura.status_leitura === 'COMPLETED') {
          setLeituraB(leitura)
          setFase('pronto')
          return
        }
        if (leitura.status_leitura === 'FAILED') {
          setErroB('Falha no processamento do arquivo comparado.')
          setFase('erro')
          return
        }
        if (Date.now() - inicio > LIMITE_POLLING_MS) {
          setErroB('Tempo limite de processamento excedido.')
          setFase('erro')
          return
        }
        await new Promise((r) => setTimeout(r, INTERVALO_POLLING_MS))
      }
    } catch (excecao) {
      if (!ativo.current) return
      setErroB(mensagemDeExcecao(excecao, 'Falha ao enviar arquivo para comparação'))
      setFase('erro')
    }
  }, [])

  const onSelecionarArquivo = useCallback(
    (lista: FileList | null) => {
      const file = lista?.[0]
      if (file) void processarArquivoB(file)
    },
    [processarArquivoB],
  )

  const confirmarEdicao = useCallback(
    (chave: string, valor: string) => {
      const limpo = valor.trim()
      setEdicoes((prev) => ({ ...prev, [chave]: limpo }))
      setEditando(null)
      onEditarCampoDocumentoAtual?.(chave, limpo)
    },
    [onEditarCampoDocumentoAtual],
  )

  function reiniciar() {
    setFase('selecionar')
    setArquivoB(null)
    setLeituraB(null)
    setErroB(null)
  }

  if (!aberto || !arquivo) return null

  const tituloA = `${arquivo.arquivo.name}${tipoA ? ` | ${tipoA}` : ''}`
  const tituloB = arquivoB ? `${arquivoB.name}${tipoB ? ` | ${tipoB}` : ''}` : null

  return (
    <div className="sr-cmp-overlay" role="dialog" aria-modal="true" aria-label="Comparar arquivos">
      <div className="sr-cmp-painel">
        <header className="sr-cmp-cabecalho">
          <div className="sr-cmp-cabecalho-titulo">
            <ArrowsLeftRight size={18} weight="duotone" />
            <div>
              <strong>Comparar arquivos</strong>
              <p>Compare campos equivalentes entre dois documentos. Edite o documento atual para corrigir a leitura.</p>
            </div>
          </div>
          <button type="button" onClick={onFechar} aria-label="Fechar">
            <X size={18} weight="bold" />
          </button>
        </header>

        {fase === 'pronto' && comparacao ? (
          <div className="sr-cmp-resultado">
            <div className="sr-cmp-resumo">
              <div className="sr-cmp-resumo-docs">
                <span className="sr-cmp-doc-tag sr-cmp-doc-tag--a">{tituloA}</span>
                <ArrowsLeftRight size={16} weight="bold" />
                <span className="sr-cmp-doc-tag sr-cmp-doc-tag--b">{tituloB}</span>
              </div>
              <BotaoGlobal variante="secundario" tamanho="pequeno" onClick={reiniciar}>
                Trocar arquivo
              </BotaoGlobal>
            </div>

            <div className="sr-cmp-filtros" role="tablist" aria-label="Filtrar campos por status">
              {(
                [
                  ['todos', `Todos ${comparacao.total}`, null],
                  ['igual', `${comparacao.iguais} iguais`, 'ok'],
                  ['divergente', `${comparacao.divergentes} divergentes`, 'div'],
                  ['so', `${comparacao.somente_a + comparacao.somente_b} só em um`, 'so'],
                  ['vazio', `${comparacao.vazios} vazios`, 'vazio'],
                ] as const
              ).map(([id, rotulo, cor]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={filtro === id}
                  className={`sr-cmp-stat${cor ? ` sr-cmp-stat--${cor}` : ''}${filtro === id ? ' sr-cmp-stat--ativo' : ''}`}
                  onClick={() => setFiltro(id)}
                >
                  {cor === 'ok' && <CheckCircle size={13} weight="fill" />}
                  {cor === 'div' && <WarningCircle size={13} weight="fill" />}
                  {cor === 'so' && <MinusCircle size={13} weight="fill" />}
                  {cor === 'vazio' && <Circle size={13} weight="bold" />}
                  {rotulo}
                </button>
              ))}
            </div>

            {filtro !== 'todos' && (
              <div className="sr-cmp-filtro-ativo">
                Exibindo apenas: <strong>{ROTULO_FILTRO[filtro]}</strong>
                <button type="button" onClick={() => setFiltro('todos')}>
                  <X size={12} weight="bold" /> Limpar filtro
                </button>
              </div>
            )}

            <div className="sr-cmp-tabela">
              {comparacao.secoes
                .map((secao) => ({
                  ...secao,
                  linhas: secao.linhas.filter((l) => combinaFiltro(l.status, filtro)),
                }))
                .filter((secao) => secao.linhas.length > 0)
                .map((secao) => (
                  <div key={secao.id} className="sr-cmp-secao">
                    <div className="sr-cmp-secao-titulo">
                      <span>{secao.titulo}</span>
                      {secao.divergencias > 0 && (
                        <span className="sr-cmp-secao-badge">{secao.divergencias} divergências</span>
                      )}
                    </div>
                    <div className="sr-cmp-cards">
                      {secao.linhas.map((linha) => {
                        const podeCopiar =
                          (linha.valor_b ?? '').trim() !== '' &&
                          linha.status !== 'igual' &&
                          linha.status !== 'vazio'
                        return (
                          <div
                            key={linha.chave}
                            className={`sr-cmp-card sr-cmp-card--${linha.status}`}
                          >
                            <span className="sr-cmp-card-status" aria-hidden />
                            <div className="sr-cmp-card-body">
                              <div className="sr-cmp-card-head" title={ROTULO_STATUS[linha.status]}>
                                <IconeStatus status={linha.status} />
                                <span className="sr-cmp-card-label">{linha.rotulo}</span>
                              </div>
                              <div className="sr-cmp-card-valores">
                                <div className="sr-cmp-card-col">
                                  <span className="sr-cmp-card-mini">Documento atual</span>
                                  {editando === linha.chave ? (
                                    <div className="dt-row-edit">
                                      <input
                                        defaultValue={linha.valor_a ?? ''}
                                        autoFocus
                                        onBlur={(e) => confirmarEdicao(linha.chave, e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') e.currentTarget.blur()
                                          if (e.key === 'Escape') setEditando(null)
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      className={`dt-row-value${linha.editado ? ' sr-cmp-editado' : ''}`}
                                      onClick={() => setEditando(linha.chave)}
                                      title="Clique para editar"
                                    >
                                      {linha.valor_a ? (
                                        <span className="dt-row-text">{linha.valor_a}</span>
                                      ) : (
                                        <span className="dt-row-empty">—</span>
                                      )}
                                      <PencilSimple weight="duotone" size={13} className="dt-row-edit-icon" />
                                    </button>
                                  )}
                                </div>
                                <div className="sr-cmp-card-col sr-cmp-card-col--b">
                                  <span className="sr-cmp-card-mini">
                                    Documento comparado
                                    {podeCopiar && (
                                      <button
                                        type="button"
                                        className="sr-cmp-copiar"
                                        title="Copiar este valor para o documento atual"
                                        onClick={() => confirmarEdicao(linha.chave, linha.valor_b ?? '')}
                                      >
                                        <ArrowLeft size={12} weight="bold" />
                                        Usar
                                      </button>
                                    )}
                                  </span>
                                  <span className="sr-cmp-card-valor-b">{linha.valor_b ?? '—'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="sr-cmp-corpo">
            <div className="sr-cmp-lado">
              <div className="sr-cmp-lado-titulo">{tituloA}</div>
              <div className="sr-cmp-lado-campos">
                <ConferenciaCamposNovaLeituraSmartRead
                  arquivo={arquivo}
                  indiceDocumento={indiceDocumento}
                  ocultarComparar
                />
              </div>
            </div>

            <div className="sr-cmp-lado sr-cmp-lado--envio">
              <div className="sr-cmp-lado-titulo">Selecione o arquivo para comparação</div>

              {fase === 'processando' ? (
                <div className="sr-cmp-status">
                  <div className="sr-cmp-cerebro" aria-hidden>
                    <svg className="sr-cmp-cerebro-anel" viewBox="0 0 200 200">
                      <circle cx="100" cy="100" r="88" className="sr-cmp-cerebro-trilha" />
                      <circle cx="100" cy="100" r="88" className="sr-cmp-cerebro-arco" />
                    </svg>
                    <div className="sr-cmp-cerebro-icone">
                      <Brain size={56} weight="duotone" />
                    </div>
                  </div>
                  <strong>Carregando arquivo…</strong>
                  <p>Aguarde enquanto analisamos a cópia de {arquivoB?.name}.</p>
                </div>
              ) : fase === 'erro' ? (
                <div className="sr-cmp-status sr-cmp-status--erro">
                  <strong>Não foi possível comparar</strong>
                  <p>{erroB}</p>
                  <BotaoGlobal variante="secundario" tamanho="pequeno" onClick={reiniciar}>
                    Tentar novamente
                  </BotaoGlobal>
                </div>
              ) : (
                <button
                  type="button"
                  className={`sr-cmp-dropzone${arrastando ? ' sr-cmp-dropzone--ativo' : ''}`}
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setArrastando(true)
                  }}
                  onDragLeave={() => setArrastando(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setArrastando(false)
                    onSelecionarArquivo(e.dataTransfer.files)
                  }}
                >
                  <CloudArrowUp size={36} weight="duotone" />
                  <strong>Envie o arquivo para comparação</strong>
                  <span>Clique ou arraste um PDF. Apenas um documento por arquivo.</span>
                  <em>*Novos arquivos enviados são contabilizados como uma nova leitura.</em>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    hidden
                    onChange={(e) => onSelecionarArquivo(e.target.files)}
                  />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
