/**
 * ProcessoLista.tsx — Tabela 01: Processo → Pedido → Item (3 camadas).
 * Onda 2 — paridade com lista Pedido (mock-first).
 */
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Briefcase, Eye, Plus } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import {
  TabelaVirtualGlobal,
  type GTAcao,
  type GTAcaoLote,
} from '@nucleo/tabela-virtual-global'
import { buildColunasAvo } from '../components/lista/ColunasAvo'
import { buildColunasFilhaLista } from '../components/lista/ColunasFilhaLista'
import {
  MOCK_PROCESSOS_AVO,
  filhosVisiveisDoProcesso,
  idFilhoLinha,
  todosIdsPedidoMock,
  type FilhoLinhaLista,
  type ProcessoAvoLinha,
} from '../shared/lista/mockListaHierarquica'
import { ConectorFilhoLista } from '../components/lista/ConectorFilhoLista'
import { TodosProcessosTabs } from './todos/TodosProcessosTabs'
import './todos/TodosProcessos.css'
import './ProcessoLista.css'

export default function ProcessoLista() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')
  const [pedidosExpandidos, setPedidosExpandidos] = useState<Set<string>>(
    () => new Set(todosIdsPedidoMock()),
  )
  const [resetCacheFilhos, setResetCacheFilhos] = useState(0)

  const colunasAvo = useMemo(() => buildColunasAvo(t), [t])
  const colunasFilhas = useMemo(() => buildColunasFilhaLista(t), [t])

  const buscaNorm = busca.trim().toLowerCase()
  const processos = useMemo(() => {
    if (!buscaNorm) return MOCK_PROCESSOS_AVO
    return MOCK_PROCESSOS_AVO.filter(p =>
      p.numero_processo.toLowerCase().includes(buscaNorm)
      || (p.referencia_interna_processo?.toLowerCase().includes(buscaNorm) ?? false)
      || p.nome_importador.toLowerCase().includes(buscaNorm)
      || p.nome_exportador.toLowerCase().includes(buscaNorm),
    )
  }, [buscaNorm])

  const togglePedidoItens = useCallback((id_pedido: string) => {
    setPedidosExpandidos(prev => {
      const next = new Set(prev)
      if (next.has(id_pedido)) next.delete(id_pedido)
      else next.add(id_pedido)
      return next
    })
    setResetCacheFilhos(n => n + 1)
  }, [])

  const handleCarregarFilhos = useCallback(async (processo: ProcessoAvoLinha) => {
    return filhosVisiveisDoProcesso(processo.id_processo, pedidosExpandidos)
  }, [pedidosExpandidos])

  const acoesProcesso: GTAcao<ProcessoAvoLinha>[] = useMemo(() => [
    {
      id: 'ver',
      tooltip: 'Abrir processo',
      icone: <Eye size={16} weight="duotone" />,
      onClick: (p) => { void navigate(`${p.id_processo}/workflow`) },
    },
  ], [navigate])

  const acoesLote: GTAcaoLote<ProcessoAvoLinha>[] = useMemo(() => [
    {
      id: 'exportar',
      label: 'Exportar seleção',
      onClick: (itens) => {
        console.info('[ProcessoLista] exportar', itens.length)
      },
    },
  ], [])

  const renderConectorFilho = useCallback((filho: FilhoLinhaLista) => (
    <ConectorFilhoLista
      filho={filho}
      pedidosExpandidos={pedidosExpandidos}
      onTogglePedido={togglePedidoItens}
    />
  ), [pedidosExpandidos, togglePedidoItens])

  const classNameLinhaFilho = useCallback(
    (filho: FilhoLinhaLista) =>
      filho.camada === 'pedido' ? 'pl-linha--pedido' : 'pl-linha--item',
    [],
  )

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<Briefcase weight="duotone" size={22} />}
          titulo="Processos"
          subtitulo="Lista hierárquica — Processo, Pedido e Item"
          acoes={
            <BotaoGlobal variante="primario" icone={<Plus weight="bold" />} onClick={() => { /* Onda 3 */ }}>
              Novo processo
            </BotaoGlobal>
          }
        />
      }
      toolbar={<TodosProcessosTabs />}
    >
      <div
        className="lp-page pl-page"
        style={{ minHeight: 'calc(100vh - 320px)', display: 'flex', flexDirection: 'column' }}
      >
        <div className="lp-tabela-wrapper">
          <TabelaVirtualGlobal<ProcessoAvoLinha, FilhoLinhaLista>
            exibirCabecalhoQuandoVazio
            dados={processos}
            colunas={colunasAvo}
            colunasFilhas={colunasFilhas}
            itemId={(p) => p.id_processo}
            filhoId={idFilhoLinha}
            onCarregarFilhos={handleCarregarFilhos}
            resetCacheFilhos={resetCacheFilhos}
            renderConectorFilho={renderConectorFilho}
            classNameLinhaFilho={classNameLinhaFilho}
            acoes={acoesProcesso}
            acoesLote={acoesLote}
            onBuscar={setBusca}
            placeholderBusca="Buscar processo, referência ou parte..."
            emptyIcon={<Briefcase weight="duotone" size={48} />}
            emptyTitle="Nenhum processo encontrado"
            emptyDescription="Ajuste a busca ou crie um novo processo"
            ariaLabel="Lista hierárquica de processos, pedidos e itens"
            itensPorPagina={25}
          />
        </div>
      </div>
    </PaginaGlobal>
  )
}
