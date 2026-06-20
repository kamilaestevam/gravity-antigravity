/**
 * TabelaTransacoesLeituraSmartRead — lista hierárquica (leitura → documentos)
 * Padrão Pedido/BID: TabelaVirtualGlobal + barra Nova leitura / Excluir
 */

import { useCallback, useMemo, useRef, useState } from 'react'
import '@nucleo/tabela-virtual-global/tabela-virtual.css'
import { Trash } from '@phosphor-icons/react'
import { useShellStore } from '@gravity/shell'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { TabelaVirtualGlobal } from '@nucleo/tabela-virtual-global'
import type { GTVirtualHandle } from '@nucleo/tabela-virtual-global'
import { BotaoNovoListaSmartRead } from './botao-novo-lista-smart-read'
import { ModalExcluirLeiturasSmartRead } from './modal-excluir-leituras-smart-read'
import { ModalNovaLeituraSmartRead } from './nova-leitura-smart-read/modal-nova-leitura-smart-read'
import {
  COLUNAS_LISTA_LEITURA_SMART_READ,
  MAPA_COLUNAS_DOCUMENTO_LEITURA,
} from '../shared/colunas-lista-leitura-smart-read'
import {
  montarDocumentosLeituraLista,
  type DocumentoLeituraLista,
} from '../shared/montar-documentos-leitura-smart-read'
import { smartReadApi } from '../shared/api'
import { obterLeituraMockSmartRead } from '../shared/dados-mock-lista-smart-read'
import type { TransacaoLeitura } from '../shared/schemas'

const ITENS_POR_PAGINA = 50

type Props = {
  transacoes: TransacaoLeitura[]
  total: number
  pagina: number
  carregando: boolean
  erro: string | null
  termoBusca: string
  onBuscar: (termo: string) => void
  onRecarregar: () => void
  onPaginaChange: (pagina: number) => void
  tituloPainel?: string
  usandoMock?: boolean
}

export function TabelaTransacoesLeituraSmartRead({
  transacoes,
  total,
  pagina,
  carregando,
  erro,
  termoBusca,
  onBuscar,
  onRecarregar,
  onPaginaChange,
  tituloPainel = 'Envios',
  usandoMock = false,
}: Props) {
  const addNotification = useShellStore((s) => s.addNotification)
  const tabelaRef = useRef<GTVirtualHandle>(null)

  const [leiturasSelecionadas, setLeiturasSelecionadas] = useState<TransacaoLeitura[]>([])
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const [modalNovaLeituraAberto, setModalNovaLeituraAberto] = useState(false)
  const [arquivosNovaLeitura, setArquivosNovaLeitura] = useState<File[]>([])

  const itemId = useCallback((item: TransacaoLeitura) => item.id_leitura, [])
  const filhoId = useCallback((item: DocumentoLeituraLista) => item.id_documento_leitura, [])

  const handleCarregarFilhos = useCallback(async (leitura: TransacaoLeitura) => {
    const mock = obterLeituraMockSmartRead(leitura.id_leitura)
    if (mock || usandoMock) {
      const detalhe = mock ?? obterLeituraMockSmartRead('mock-leitura-bl-importacao')
      if (detalhe) return montarDocumentosLeituraLista(detalhe)
    }
    const detalhe = await smartReadApi.obterLeitura(leitura.id_leitura)
    return montarDocumentosLeituraLista(detalhe)
  }, [usandoMock])

  const handleConfirmarExclusao = useCallback(async () => {
    if (leiturasSelecionadas.length === 0) return
    setExcluindo(true)
    try {
      const resultados = await Promise.allSettled(
        leiturasSelecionadas.map((item) => smartReadApi.excluirLeitura(item.id_leitura)),
      )
      const falhas = resultados.filter((r) => r.status === 'rejected')
      const sucesso = resultados.length - falhas.length
      if (sucesso > 0) {
        addNotification({
          type: 'success',
          message:
            sucesso === 1
              ? 'Leitura excluída com sucesso.'
              : `${sucesso} leituras excluídas com sucesso.`,
        })
        setLeiturasSelecionadas([])
        onRecarregar()
      }
      if (falhas.length > 0) {
        const mensagem =
          falhas[0].status === 'rejected' && falhas[0].reason instanceof Error
            ? falhas[0].reason.message
            : 'Não foi possível excluir uma ou mais leituras.'
        addNotification({ type: 'error', message: mensagem })
      }
      setModalExcluirAberto(false)
    } finally {
      setExcluindo(false)
    }
  }, [addNotification, leiturasSelecionadas, onRecarregar])

  const abrirNovaLeitura = useCallback((arquivos: File[] = []) => {
    setArquivosNovaLeitura(arquivos)
    setModalNovaLeituraAberto(true)
  }, [])

  const acoesBarra = useMemo(
    () => (
      <div className="sr-lista-acoes-barra">
        <BotaoNovoListaSmartRead onAbrirNovaLeitura={() => abrirNovaLeitura()} />

        <TooltipGlobal
          titulo={
            leiturasSelecionadas.length > 0
              ? `Excluir · ${leiturasSelecionadas.length} leitura(s)`
              : 'Excluir'
          }
          descricao="Remove as leituras selecionadas do Smart Read"
        >
          <BotaoGlobal
            variante="perigo"
            tamanho="pequeno"
            icone={<Trash size={14} weight="duotone" />}
            aria-label="Excluir leituras selecionadas"
            disabled={leiturasSelecionadas.length === 0 || excluindo}
            onClick={() => setModalExcluirAberto(true)}
          />
        </TooltipGlobal>
      </div>
    ),
    [abrirNovaLeitura, excluindo, leiturasSelecionadas.length],
  )

  return (
    <section className="sr-painel sr-painel--tabela">
      {erro && (
        <div className="sr-erro" role="alert">
          {erro}
        </div>
      )}

      <TabelaVirtualGlobal<TransacaoLeitura, DocumentoLeituraLista>
        imperativeRef={tabelaRef}
        dados={transacoes}
        colunas={COLUNAS_LISTA_LEITURA_SMART_READ}
        itemId={itemId}
        mapaColunasFilho={MAPA_COLUNAS_DOCUMENTO_LEITURA}
        onCarregarFilhos={handleCarregarFilhos}
        filhoId={filhoId}
        labelPai={tituloPainel.toLowerCase()}
        labelFilho={['documento', 'documentos']}
        itensPorPagina={ITENS_POR_PAGINA}
        totalItens={total}
        paginaAtual={pagina}
        onMudarPagina={onPaginaChange}
        carregando={carregando}
        acoesBarra={acoesBarra}
        onSelecaoMudar={setLeiturasSelecionadas}
        onBuscar={onBuscar}
        placeholderBusca="Localizar…"
        distribuirLarguraColunas
        ariaLabel="Lista de envios Smart Read"
        emptyTitle="Nenhum envio encontrado"
        emptyDescription={
          termoBusca.trim()
            ? 'Nenhuma leitura corresponde à busca.'
            : 'Envie a primeira leitura para começar.'
        }
        emptyAction={
          !termoBusca.trim() ? (
            <button type="button" className="sr-link-acao" onClick={() => abrirNovaLeitura()}>
              Enviar primeira leitura
            </button>
          ) : undefined
        }
        classNameLinhaFilho={() => 'sr-linha-documento'}
      />

      <ModalNovaLeituraSmartRead
        aberto={modalNovaLeituraAberto}
        arquivosIniciais={arquivosNovaLeitura}
        onFechar={() => {
          setModalNovaLeituraAberto(false)
          setArquivosNovaLeitura([])
        }}
        onConcluido={() => void onRecarregar()}
      />

      <ModalExcluirLeiturasSmartRead
        aberto={modalExcluirAberto}
        quantidade={leiturasSelecionadas.length}
        excluindo={excluindo}
        onConfirmar={() => void handleConfirmarExclusao()}
        onCancelar={() => {
          if (!excluindo) setModalExcluirAberto(false)
        }}
      />
    </section>
  )
}
