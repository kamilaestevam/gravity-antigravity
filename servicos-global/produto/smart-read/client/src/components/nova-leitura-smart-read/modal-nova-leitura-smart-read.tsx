/**

 * modal-nova-leitura-smart-read.tsx — Wizard Nova Leitura (4 passos)

 * Padrão ModalPassoPassoGlobal (Pedido Transferir) + layout legado dati.

 */



import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { FileMagnifyingGlass } from '@phosphor-icons/react'

import { ModalPassoPassoGlobal } from '@nucleo/modal-passo-passo-global'

import type { PassoConfig } from '@nucleo/modal-passo-passo-global'

import { smartReadApi } from '../../shared/api'

import { mensagemDeExcecao } from '../../shared/extrair-mensagem-erro-api'

import {

  criarArquivoLocalNovaLeitura,

  todosArquivosAnaliseCompleta,
  todosArquivosProcessamentoFinalizado,

  type ArquivoLocalNovaLeitura,

} from '../../shared/tipo-arquivo-nova-leitura-smart-read'

import { PainelLateralArquivosNovaLeituraSmartRead } from './painel-lateral-arquivos-nova-leitura-smart-read'

import { AreaAnexarNovaLeituraSmartRead } from './area-anexar-nova-leitura-smart-read'

import { DashboardAnaliseNovaLeituraSmartRead } from './dashboard-analise-nova-leitura-smart-read'

import { AreaConferenciaNovaLeituraSmartRead } from './area-conferencia-nova-leitura-smart-read'

import { AreaResultadoNovaLeituraSmartRead } from './area-resultado-nova-leitura-smart-read'

import './modal-nova-leitura-smart-read.css'



const INTERVALO_POLLING_MS = 2000

const LIMITE_POLLING_MS = 5 * 60 * 1000



const PASSOS: PassoConfig[] = [

  { id: 1, label: 'Anexar arquivo' },

  { id: 2, label: 'Análise do arquivo' },

  { id: 3, label: 'Conferência' },

  { id: 4, label: 'Resultado das leituras' },

]



type Props = {

  aberto: boolean

  arquivosIniciais?: File[]

  onFechar: () => void

  onConcluido?: () => void

}



function gerarNomeLeitura(): string {

  const sequencia = Math.floor(100 + Math.random() * 900)

  return `Leitura ${sequencia}`

}



export function ModalNovaLeituraSmartRead({

  aberto,

  arquivosIniciais = [],

  onFechar,

  onConcluido,

}: Props) {

  const [passo, setPasso] = useState(1)

  const [nomeLeitura, setNomeLeitura] = useState(gerarNomeLeitura)

  const [arquivos, setArquivos] = useState<ArquivoLocalNovaLeitura[]>([])

  const [enviando, setEnviando] = useState(false)

  const [inicioAnalise, setInicioAnalise] = useState<number | null>(null)

  const ativo = useRef(true)
  const urlsBlob = useRef<Map<string, string>>(new Map())
  const abertoAnteriorRef = useRef(false)

  useEffect(() => {
    ativo.current = true
    return () => {
      ativo.current = false
    }
  }, [])

  useEffect(() => {
    if (aberto && !abertoAnteriorRef.current) {
      setPasso(1)
      setNomeLeitura(gerarNomeLeitura())
      setEnviando(false)
      setInicioAnalise(null)
      setArquivos(arquivosIniciais.map((arquivo) => criarArquivoLocalNovaLeitura(arquivo)))
    }
    abertoAnteriorRef.current = aberto
  }, [aberto, arquivosIniciais])



  useEffect(() => {

    return () => {

      for (const url of urlsBlob.current.values()) {

        URL.revokeObjectURL(url)

      }

      urlsBlob.current.clear()

    }

  }, [])



  const analiseCompleta = useMemo(() => todosArquivosAnaliseCompleta(arquivos), [arquivos])
  const processamentoFinalizado = useMemo(
    () => todosArquivosProcessamentoFinalizado(arquivos),
    [arquivos],
  )
  const processamentoComErro =
    processamentoFinalizado && !arquivos.some((item) => item.status_arquivo_local === 'completo')



  const atualizarArquivo = useCallback(

    (id: string, patch: Partial<ArquivoLocalNovaLeitura>) => {

      setArquivos((prev) =>

        prev.map((item) => (item.id_arquivo_local === id ? { ...item, ...patch } : item)),

      )

    },

    [],

  )



  const adicionarArquivos = useCallback((lista: File[]) => {

    setArquivos((prev) => [...prev, ...lista.map((arquivo) => criarArquivoLocalNovaLeitura(arquivo))])

  }, [])



  const removerArquivo = useCallback((id: string) => {

    setArquivos((prev) => prev.filter((item) => item.id_arquivo_local !== id))

  }, [])



  const alternarExpandido = useCallback((id: string) => {

    setArquivos((prev) =>

      prev.map((item) =>

        item.id_arquivo_local === id ? { ...item, expandido: !item.expandido } : item,

      ),

    )

  }, [])



  const obterUrlArquivo = useCallback((id: string) => {

    const item = arquivos.find((a) => a.id_arquivo_local === id)

    if (!item) return null

    let url = urlsBlob.current.get(id)

    if (!url) {

      url = URL.createObjectURL(item.arquivo)

      urlsBlob.current.set(id, url)

    }

    return url

  }, [arquivos])



  const visualizarArquivo = useCallback((id: string) => {

    const url = obterUrlArquivo(id)

    if (url) window.open(url, '_blank', 'noopener,noreferrer')

  }, [obterUrlArquivo])



  const visualizarDocumento = useCallback((id: string, _indice: number) => {

    visualizarArquivo(id)

  }, [visualizarArquivo])



  const pollingArquivo = useCallback(

    async (idArquivoLocal: string, idLeitura: string) => {

      const inicio = Date.now()

      while (ativo.current) {

        const leitura = await smartReadApi.obterLeitura(idLeitura)

        if (!ativo.current) return



        if (leitura.status_leitura === 'COMPLETED') {
          atualizarArquivo(idArquivoLocal, {
            status_arquivo_local: 'completo',
            leitura,
            expandido: true,
          })
          return
        }

        if (leitura.status_leitura === 'FAILED') {

          atualizarArquivo(idArquivoLocal, {

            status_arquivo_local: 'erro',

            leitura,

            mensagem_erro: 'Falha no processamento',

          })

          return

        }



        atualizarArquivo(idArquivoLocal, {

          status_arquivo_local: 'analisando',

          leitura,

        })



        if (Date.now() - inicio > LIMITE_POLLING_MS) {

          atualizarArquivo(idArquivoLocal, {

            status_arquivo_local: 'erro',

            mensagem_erro: 'Tempo limite de processamento excedido',

          })

          return

        }

        await new Promise((r) => setTimeout(r, INTERVALO_POLLING_MS))

      }

    },

    [atualizarArquivo],

  )



  const enviarArquivos = useCallback(async () => {

    if (arquivos.length === 0) return

    setEnviando(true)

    setInicioAnalise(Date.now())

    setPasso(2)



    const pendencias = arquivos.map(async (item) => {

      atualizarArquivo(item.id_arquivo_local, { status_arquivo_local: 'enviando' })

      try {

        const criada = await smartReadApi.enviarLeitura(item.arquivo)

        atualizarArquivo(item.id_arquivo_local, {
          status_arquivo_local: 'analisando',
          id_leitura: criada.id_leitura,
          id_arquivo: criada.id_arquivo,
        })

        await pollingArquivo(item.id_arquivo_local, criada.id_leitura)

      } catch (excecao) {

        atualizarArquivo(item.id_arquivo_local, {

          status_arquivo_local: 'erro',

          mensagem_erro: mensagemDeExcecao(excecao, 'Falha ao enviar arquivo'),

        })

      }

    })



    await Promise.all(pendencias)

    if (!ativo.current) return

    setEnviando(false)

  }, [arquivos, atualizarArquivo, pollingArquivo])



  function handleFechar() {

    onFechar()

  }



  function handleVoltarPasso() {

    if (passo <= 1) return

    setPasso((p) => p - 1)

  }



  function handleContinuarPasso() {

    if (passo === 2 && !processamentoFinalizado) return

    if (passo >= 4) {

      onConcluido?.()

      handleFechar()

      return

    }

    setPasso((p) => p + 1)

  }



  const podeContinuar =

    passo === 2 ? processamentoFinalizado :

    passo === 3 ? arquivos.some((a) => a.status_arquivo_local === 'completo') :

    passo === 4 ? true :

    false



  return (

    <ModalPassoPassoGlobal

      titulo="Nova Leitura"

      icone={<FileMagnifyingGlass size={20} weight="duotone" />}

      subtitulo={nomeLeitura}

      aberto={aberto}

      passos={PASSOS}

      passoAtual={passo}

      onProximo={() => {}}

      onVoltar={() => {}}

      onFechar={handleFechar}

      tamanho="2xl"

      altura="min(920px, calc(100vh - 2rem))"

      ocultarFooter

      navegacaoDireta={passo > 1 && analiseCompleta}

      onIrParaPasso={(id) => {

        if (id < passo) setPasso(id)

      }}

    >

      <div className="sr-wizard-corpo">

        <PainelLateralArquivosNovaLeituraSmartRead

          passo={passo}

          nomeLeitura={nomeLeitura}

          arquivos={arquivos}

          enviando={enviando}

          podeContinuar={podeContinuar}

          onEditarNome={() => {

            const novo = window.prompt('Nome da leitura', nomeLeitura)

            if (novo?.trim()) setNomeLeitura(novo.trim())

          }}

          onRemoverArquivo={removerArquivo}

          onAlternarExpandido={alternarExpandido}

          onVisualizarArquivo={visualizarArquivo}

          onVisualizarDocumento={visualizarDocumento}

          onEnviar={() => void enviarArquivos()}

          onVoltar={passo > 1 ? handleVoltarPasso : undefined}

          onContinuar={passo >= 2 ? handleContinuarPasso : undefined}

        />



        {passo === 1 && <AreaAnexarNovaLeituraSmartRead onArquivosAdicionados={adicionarArquivos} />}

        {passo === 2 && (

          <DashboardAnaliseNovaLeituraSmartRead
            analiseCompleta={analiseCompleta}
            processamentoComErro={processamentoComErro}
            inicioAnalise={inicioAnalise}
          />

        )}

        {passo === 3 && <AreaConferenciaNovaLeituraSmartRead arquivos={arquivos} />}

        {passo === 4 && <AreaResultadoNovaLeituraSmartRead arquivos={arquivos} />}

      </div>

    </ModalPassoPassoGlobal>

  )

}


