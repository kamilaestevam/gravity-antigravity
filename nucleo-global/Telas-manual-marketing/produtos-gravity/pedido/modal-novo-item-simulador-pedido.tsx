import { useCallback, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Tag, X } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import type { LinhaListaPedidoSimulador } from './dados-lista-simulador-pedido'
import './modal-novo-pedido-simulador.css'

type Props = {
  aberto: boolean
  linhas: LinhaListaPedidoSimulador[]
  onFechar: () => void
  onSalvo: (pedidoId: string, partNumber: string, descricao: string) => void
}

export function ModalNovoItemSimuladorPedido({ aberto, linhas, onFechar, onSalvo }: Props) {
  const [pedidoId, setPedidoId] = useState<string | null>(null)
  const [partNumber, setPartNumber] = useState('')
  const [descricao, setDescricao] = useState('')

  const opcoesPedidos = useMemo(
    () => linhas.map((l) => ({ valor: l.id, rotulo: l.numeroPedido })),
    [linhas],
  )

  const resetar = useCallback(() => {
    setPedidoId(null)
    setPartNumber('')
    setDescricao('')
  }, [])

  const fechar = useCallback(() => {
    resetar()
    onFechar()
  }, [onFechar, resetar])

  if (!aberto) return null

  return createPortal(
    <div className="pds-mnp-cadastro-overlay" onClick={fechar}>
      <div
        className="pds-mnp-cadastro-dialog"
        style={{ width: 'min(420px, 100%)' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="pds-novo-item-titulo"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <h3 id="pds-novo-item-titulo" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
            <Tag size={16} weight="duotone" style={{ color: '#34d399' }} aria-hidden />
            Novo Item
          </h3>
          <button type="button" className="pds-mnp-item-remover" style={{ position: 'static' }} onClick={fechar} aria-label="Fechar">
            <X size={14} weight="bold" aria-hidden />
          </button>
        </div>

        <div className="pds-mnp-form">
          <div className="pds-mnp-campo" data-sds-tutorial-alvo="pedido-novo-item-pedido">
            <SelectGlobal
              label="Pedido *"
              opcoes={opcoesPedidos}
              valor={pedidoId}
              aoMudarValor={(v) => setPedidoId(v ? String(v) : null)}
              placeholder="Selecionar pedido…"
              buscavel
            />
          </div>
          <div className="pds-mnp-campo" data-sds-tutorial-alvo="pedido-novo-item-part-number">
            <label className="pds-mnp-label" htmlFor="pds-item-pn">Part Number</label>
            <input
              id="pds-item-pn"
              className="pds-mnp-input"
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
              placeholder="SKU / PN"
            />
          </div>
          <div className="pds-mnp-campo" data-sds-tutorial-alvo="pedido-novo-item-descricao">
            <label className="pds-mnp-label" htmlFor="pds-item-desc">Descrição</label>
            <input
              id="pds-item-desc"
              className="pds-mnp-input"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>
        </div>

        <div className="pds-mnp-cadastro-acoes">
          <BotaoGlobal variante="secundario" tamanho="pequeno" onClick={fechar}>
            Cancelar
          </BotaoGlobal>
          <span data-sds-tutorial-alvo="pedido-novo-item-salvar" style={{ display: 'inline-flex' }}>
          <BotaoGlobal
            variante="primario"
            tamanho="pequeno"
            disabled={!pedidoId || !partNumber.trim()}
            onClick={() => {
              if (!pedidoId) return
              onSalvo(pedidoId, partNumber.trim(), descricao.trim())
              fechar()
            }}
          >
            Adicionar item
          </BotaoGlobal>
          </span>
        </div>
      </div>
    </div>,
    document.body,
  )
}
