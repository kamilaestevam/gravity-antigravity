import { memo, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import '../../../Tabelas/tabela-virtual-global/src/tabela-virtual.css'
import type { OpcaoEnumCelula } from './regras-celula-lista-simulador-pedido'

const POPOVER_W = 280

type Props = {
  anchorRect: DOMRect
  label: string
  valor: string | null
  opcoes: OpcaoEnumCelula[]
  onConfirmar: (valor: string | null) => void
  onCancelar: () => void
  salvando?: boolean
  resultado?: 'sucesso' | 'erro' | null
}

export const EdicaoEnumPopoverSimuladorPedido = memo(function EdicaoEnumPopoverSimuladorPedido({
  anchorRect: rect,
  label,
  valor,
  opcoes,
  onConfirmar,
  onCancelar,
  salvando = false,
  resultado = null,
}: Props) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const [busca, setBusca] = useState('')
  const [selecionado, setSelecionado] = useState(valor ?? '')

  const [pos, setPos] = useState(() => {
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - POPOVER_W - 8))
    return { top: rect.bottom + 8, left, arrowLeft: 16, flipUp: false }
  })

  useLayoutEffect(() => {
    const el = popoverRef.current
    if (!el) return
    const h = el.offsetHeight
    const w = el.offsetWidth
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - w - 8))
    const arrowLeft = Math.max(12, Math.min(w - 20, (rect.left + rect.width / 2) - left))
    const belowOk = rect.bottom + h + 12 <= window.innerHeight
    const top = belowOk ? rect.bottom + 8 : Math.max(8, rect.top - h - 8)
    setPos({ top, left, arrowLeft, flipUp: !belowOk })
  }, [rect, busca])

  const termo = busca.trim().toLowerCase()
  const filtradas = termo
    ? opcoes.filter((op) => op.label.toLowerCase().includes(termo) || op.valor.toLowerCase().includes(termo))
    : opcoes

  const conteudo = (
    <>
      <div className="gtv-edit-popover-backdrop" onMouseDown={() => onCancelar()} />
      <div
        className={`gtv-edit-popover-arrow${pos.flipUp ? ' gtv-edit-popover-arrow--flip' : ''}`}
        style={{
          position: 'fixed',
          left: pos.left + pos.arrowLeft,
          top: pos.flipUp ? pos.top + (popoverRef.current?.offsetHeight ?? 0) : pos.top - 8,
          zIndex: 10000,
        }}
      />
      <div
        ref={popoverRef}
        className={`gtv-edit-popover${pos.flipUp ? ' gtv-edit-popover--flip' : ''}`}
        style={{ top: pos.top, left: pos.left, position: 'fixed', zIndex: 10001 }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="gtv-edit-popover-header">
          <span className="gtv-edit-popover-label">
            <svg width="11" height="11" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM51.31,160l96-96,32,32-96,96ZM48,179.31,76.69,208H48Zm160-96L176,115.31,140.69,80,163.31,57.37,208,102Z"/>
            </svg>
            {label}
          </span>
          <button type="button" className="gtv-edit-popover-close" onClick={onCancelar} aria-label="Fechar">×</button>
        </div>
        <div className="gtv-edit-popover-body">
          {opcoes.length > 8 ? (
            <input
              type="search"
              className="gtv-edit-popover-input gtv-edit-popover-input--busca"
              placeholder="Buscar..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          ) : null}
          <div className="gtv-edit-popover-opcoes">
            {filtradas.length === 0 ? (
              <div className="gtv-edit-popover-opcoes-vazio">Nenhuma opção encontrada</div>
            ) : (
              filtradas.map((op) => (
                <button
                  key={op.valor}
                  type="button"
                  className={`gtv-edit-popover-opcao${selecionado === op.valor ? ' gtv-edit-popover-opcao--ativo' : ''}`}
                  onClick={() => setSelecionado(op.valor)}
                >
                  {op.label}
                </button>
              ))
            )}
          </div>
        </div>
        <div className="gtv-edit-popover-footer">
          <div className="gtv-edit-popover-hints">
            <span className="gtv-edit-popover-kbd">Enter</span>
            <span className="gtv-edit-popover-sep">salvar</span>
            <span className="gtv-edit-popover-kbd">Esc</span>
            <span className="gtv-edit-popover-sep">cancelar</span>
          </div>
          <div className="gtv-edit-popover-actions">
            <button type="button" className="gtv-edit-popover-btn gtv-edit-popover-btn--ghost" onClick={onCancelar}>
              Cancelar
            </button>
            <button
              type="button"
              className={`gtv-edit-popover-btn gtv-edit-popover-btn--primary${salvando ? ' gtv-edit-popover-btn--salvando' : ''}${resultado === 'sucesso' ? ' gtv-edit-popover-btn--sucesso' : ''}${resultado === 'erro' ? ' gtv-edit-popover-btn--erro' : ''}`}
              disabled={salvando || !selecionado}
              onClick={() => onConfirmar(selecionado || null)}
            >
              {resultado === 'sucesso' ? 'Salvo' : resultado === 'erro' ? 'Erro' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </>
  )

  return createPortal(conteudo, document.body)
})
