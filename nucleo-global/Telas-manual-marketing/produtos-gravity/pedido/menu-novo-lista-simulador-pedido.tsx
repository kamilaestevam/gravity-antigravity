import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BotaoGlobal } from '@nucleo/botao-global'
import {
  ArrowsLeftRight,
  ArrowRight,
  CaretDown,
  CaretRight,
  Columns,
  Package,
  PencilSimple,
  Plus,
  Sparkle,
  SquaresFour,
  Tag,
  UploadSimple,
} from '@phosphor-icons/react'
import './menu-novo-lista-simulador-pedido.css'

type SubmenuNovo = 'pedido' | 'item' | 'painel' | null

type Props = {
  onAbrirNovoPedidoManual: () => void
  onAbrirNovoItemManual: () => void
  onCriarPainel: (nome: string) => void
  onDemoAcao: (titulo: string, descricao: string) => void
  onMenuAbertoChange?: (aberto: boolean) => void
}

export function MenuNovoListaSimuladorPedido({
  onAbrirNovoPedidoManual,
  onAbrirNovoItemManual,
  onCriarPainel,
  onDemoAcao,
  onMenuAbertoChange,
}: Props) {
  const [aberto, setAberto] = useState(false)
  const [submenu, setSubmenu] = useState<SubmenuNovo>(null)
  const [nomePainel, setNomePainel] = useState('')
  const wrapRef = useRef<HTMLDivElement>(null)

  const fechar = useCallback(() => {
    setAberto(false)
    setSubmenu(null)
    setNomePainel('')
  }, [])

  useEffect(() => {
    if (!aberto) return
    const handler = (ev: PointerEvent) => {
      const alvo = ev.target
      if (!(alvo instanceof Node)) return
      if (wrapRef.current?.contains(alvo)) return
      fechar()
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [aberto, fechar])

  useEffect(() => {
    onMenuAbertoChange?.(aberto)
  }, [aberto, onMenuAbertoChange])

  const opcoesPedido = [
    {
      id: 'importacao',
      icone: <UploadSimple size={14} weight="duotone" aria-hidden />,
      titulo: 'Importação',
      descricao: 'Excel, CSV ou XML',
      acao: () => {
        fechar()
        onDemoAcao('Importação', 'No produto real, abre o assistente Smart Import.')
      },
    },
    {
      id: 'api',
      icone: <ArrowsLeftRight size={14} weight="duotone" aria-hidden />,
      titulo: 'API',
      descricao: 'Integração via Cockpit ou ERP',
      acao: () => {
        fechar()
        onDemoAcao('API', 'No produto real, abre o modal de integração Cockpit.')
      },
    },
    {
      id: 'smart',
      icone: <Sparkle size={14} weight="duotone" aria-hidden />,
      titulo: 'Smart Docs',
      descricao: 'IA extrai dados do documento',
      smart: true,
      acao: () => {
        fechar()
        onDemoAcao('Smart Docs', 'No produto real, redireciona para Nova Leitura no Smart Docs.')
      },
    },
    {
      id: 'manual',
      icone: <PencilSimple size={14} weight="duotone" aria-hidden />,
      titulo: 'Manual',
      descricao: 'Preencher formulário passo a passo',
      acao: () => {
        fechar()
        onAbrirNovoPedidoManual()
      },
      tutorialAlvo: 'pedido-menu-novo-manual' as const,
    },
  ] as const

  const opcoesItem = [
    {
      id: 'importacao-item',
      icone: <UploadSimple size={14} weight="duotone" aria-hidden />,
      titulo: 'Importação',
      descricao: 'Excel, CSV ou XML',
      acao: () => {
        fechar()
        onDemoAcao('Importação de itens', 'No produto real, abre o Smart Import para itens.')
      },
    },
    {
      id: 'api-item',
      icone: <ArrowsLeftRight size={14} weight="duotone" aria-hidden />,
      titulo: 'API',
      descricao: 'Integração via Cockpit ou ERP',
      acao: () => {
        fechar()
        onDemoAcao('API de itens', 'No produto real, abre integração via Cockpit.')
      },
    },
    {
      id: 'smart-item',
      icone: <Sparkle size={14} weight="duotone" aria-hidden />,
      titulo: 'Smart Docs',
      descricao: 'IA extrai dados do documento',
      smart: true,
      acao: () => {
        fechar()
        onDemoAcao('Smart Docs', 'No produto real, extrai itens de documentos com IA.')
      },
    },
    {
      id: 'manual-item',
      icone: <PencilSimple size={14} weight="duotone" aria-hidden />,
      titulo: 'Manual',
      descricao: 'Preencher formulário',
      acao: () => {
        fechar()
        onAbrirNovoItemManual()
      },
    },
  ] as const

  return (
    <div className="pds-novo-wrap pds-lista-btn-novo" ref={wrapRef} data-sds-tutorial-alvo="pedido-lista-novo">
      <BotaoGlobal
        className="pds-lista-btn-novo-trigger"
        variante="primario"
        tamanho="pequeno"
        icone={<Plus size={14} weight="bold" />}
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-haspopup="menu"
      >
        Novo
        <span className="pds-lista-novo-chevron" aria-hidden>
          <CaretDown size={12} weight="bold" />
        </span>
      </BotaoGlobal>

      {aberto && (
        <div className="pds-novo-dropdown" role="menu" data-sds-tutorial-alvo="pedido-menu-novo-dropdown">
          <div
            className={`pds-novo-dropdown-item ${submenu === 'pedido' ? 'pds-novo-dropdown-item--ativo' : ''}`}
            data-sds-tutorial-alvo="pedido-menu-novo-pedido"
            onMouseEnter={() => setSubmenu('pedido')}
            onMouseLeave={() => setSubmenu((s) => (s === 'pedido' ? null : s))}
          >
            <button type="button" className="pds-novo-dropdown-btn" aria-haspopup="menu">
              <span className="pds-novo-dropdown-btn-main">
                <span className="pds-novo-dropdown-icone pds-novo-dropdown-icone--pedido">
                  <Package size={12} weight="duotone" aria-hidden />
                </span>
                Novo Pedido
              </span>
              <CaretRight size={10} weight="bold" style={{ color: '#94a3b8' }} aria-hidden />
            </button>
            {submenu === 'pedido' && (
              <div className="pds-novo-dropdown-submenu" role="menu">
                {opcoesPedido.map((op) => (
                  <button
                    key={op.id}
                    type="button"
                    className="pds-novo-dropdown-opcao"
                    onClick={op.acao}
                    {...('tutorialAlvo' in op && op.tutorialAlvo
                      ? { 'data-sds-tutorial-alvo': op.tutorialAlvo }
                      : {})}
                  >
                    <span className={`pds-novo-dropdown-opcao-icone ${'smart' in op && op.smart ? 'pds-novo-dropdown-opcao-icone--smart' : ''}`}>
                      {op.icone}
                    </span>
                    <span className="pds-novo-dropdown-opcao-texto">
                      <span className="pds-novo-dropdown-opcao-titulo">{op.titulo}</span>
                      <span className="pds-novo-dropdown-opcao-desc">{op.descricao}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            className={`pds-novo-dropdown-item ${submenu === 'item' ? 'pds-novo-dropdown-item--ativo' : ''}`}
            data-sds-tutorial-alvo="pedido-menu-novo-item"
            onMouseEnter={() => setSubmenu('item')}
            onMouseLeave={() => setSubmenu((s) => (s === 'item' ? null : s))}
          >
            <button type="button" className="pds-novo-dropdown-btn" aria-haspopup="menu">
              <span className="pds-novo-dropdown-btn-main">
                <span className="pds-novo-dropdown-icone pds-novo-dropdown-icone--item">
                  <Tag size={12} weight="duotone" aria-hidden />
                </span>
                Novo Item
              </span>
              <CaretRight size={10} weight="bold" style={{ color: '#94a3b8' }} aria-hidden />
            </button>
            {submenu === 'item' && (
              <div className="pds-novo-dropdown-submenu" role="menu">
                {opcoesItem.map((op) => (
                  <button key={op.id} type="button" className="pds-novo-dropdown-opcao" onClick={op.acao}>
                    <span className={`pds-novo-dropdown-opcao-icone ${'smart' in op && op.smart ? 'pds-novo-dropdown-opcao-icone--smart' : ''}`}>
                      {op.icone}
                    </span>
                    <span className="pds-novo-dropdown-opcao-texto">
                      <span className="pds-novo-dropdown-opcao-titulo">{op.titulo}</span>
                      <span className="pds-novo-dropdown-opcao-desc">{op.descricao}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="pds-novo-dropdown-btn"
            onClick={() => {
              fechar()
              onDemoAcao('Nova Coluna', 'No produto real, abre Configurações › Colunas da lista.')
            }}
          >
            <span className="pds-novo-dropdown-btn-main">
              <span className="pds-novo-dropdown-icone pds-novo-dropdown-icone--coluna">
                <Columns size={12} weight="duotone" aria-hidden />
              </span>
              Nova Coluna
            </span>
            <ArrowRight size={10} weight="bold" style={{ color: '#94a3b8' }} aria-hidden />
          </button>

          <div className="pds-novo-dropdown-divisor" />

          <div
            className={`pds-novo-dropdown-item ${submenu === 'painel' ? 'pds-novo-dropdown-item--ativo' : ''}`}
            data-sds-tutorial-alvo="pedido-menu-novo-painel"
            onMouseEnter={() => setSubmenu('painel')}
            onMouseLeave={() => setSubmenu((s) => (s === 'painel' ? null : s))}
          >
            <button type="button" className="pds-novo-dropdown-btn" aria-haspopup="menu">
              <span className="pds-novo-dropdown-btn-main">
                <span className="pds-novo-dropdown-icone pds-novo-dropdown-icone--painel">
                  <SquaresFour size={12} weight="duotone" aria-hidden />
                </span>
                Novo painel
              </span>
              <CaretRight size={10} weight="bold" style={{ color: '#94a3b8' }} aria-hidden />
            </button>
            {submenu === 'painel' && (
              <form
                className="pds-novo-dropdown-submenu pds-novo-painel-form"
                onSubmit={(e) => {
                  e.preventDefault()
                  const nome = nomePainel.trim()
                  if (!nome) return
                  onCriarPainel(nome)
                  fechar()
                }}
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Nome do painel"
                  value={nomePainel}
                  onChange={(e) => setNomePainel(e.target.value)}
                  maxLength={60}
                />
                <button type="submit" disabled={!nomePainel.trim()}>
                  Criar painel
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

type ToastProps = { titulo: string; mensagem: string; onFechar: () => void }

export function ToastDemoNovoSimuladorPedido({ titulo, mensagem, onFechar }: ToastProps) {
  useEffect(() => {
    const t = window.setTimeout(onFechar, 4200)
    return () => window.clearTimeout(t)
  }, [onFechar])

  return createPortal(
    <div className="pds-novo-toast" role="status">
      <strong>{titulo}</strong> — {mensagem}
    </div>,
    document.body,
  )
}
