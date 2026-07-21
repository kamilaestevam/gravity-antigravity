/**
 * DropdownNovoSimuladorBidFrete — botão "+ Nova" com o mesmo menu em cascata
 * do produto real (dropdown-novo-bid-frete-internacional):
 * Buscar Frete → Cotação Avulsa / BID → Importação · API · Smart Docs · Manual.
 * "Manual" abre o wizard de Nova Cotação (5 passos). Opcionalmente exibe
 * "Novo painel" quando usado na Lista.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ArrowsLeftRight,
  CaretDown,
  CaretRight,
  FileText,
  Globe,
  PencilSimple,
  Plus,
  Sparkle,
  SquaresFour,
  Stack,
  UploadSimple,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '../../../Botoes/botao-global/src/index'
import '../../../Botoes/botao-global/src/botao.css'
import './dropdown-novo-simulador-bid-frete.css'

type NovoSubmenu = 'painel' | 'buscar-frete' | 'avulsa' | 'bid' | null

type ItemAcaoNovo = {
  icon: 'upload' | 'api' | 'sparkle' | 'pencil'
  label: string
  desc: string
  badge?: string
  disabled?: boolean
  action?: () => void
}

export type DropdownNovoSimuladorBidFreteProps = {
  onAbrirNovaCotacaoManual: () => void
  onCriarPainelLista?: (nome: string) => boolean
  alinharMenuDireita?: boolean
  className?: string
}

export function DropdownNovoSimuladorBidFrete({
  onAbrirNovaCotacaoManual,
  onCriarPainelLista,
  alinharMenuDireita = false,
  className = '',
}: DropdownNovoSimuladorBidFreteProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [aberto, setAberto] = useState(false)
  const [submenu, setSubmenu] = useState<NovoSubmenu>(null)
  const [nomePainelLista, setNomePainelLista] = useState('')

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAberto(false)
        setSubmenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fechar = useCallback(() => {
    setAberto(false)
    setSubmenu(null)
  }, [])

  const renderIconeAcao = (icon: ItemAcaoNovo['icon']): ReactNode => {
    if (icon === 'pencil') return <PencilSimple size={16} weight="duotone" />
    if (icon === 'sparkle') return <Sparkle size={16} weight="duotone" />
    if (icon === 'upload') return <UploadSimple size={16} weight="duotone" />
    return <ArrowsLeftRight size={16} weight="duotone" />
  }

  const renderItensAcao = (itens: ItemAcaoNovo[]) => (
    itens.map((item) => (
      <button
        key={item.label}
        type="button"
        className="bfs-dropdown-novo-btn"
        disabled={item.disabled}
        onClick={item.disabled ? undefined : item.action}
      >
        <span
          className="bfs-dropdown-novo-btn__icone"
          style={item.icon === 'sparkle' ? { color: '#a78bfa' } : undefined}
        >
          {renderIconeAcao(item.icon)}
        </span>
        <span className="bfs-dropdown-novo-btn__texto">
          <span className="bfs-dropdown-novo-btn__label">
            {item.label}
            {item.badge && <span className="bfs-dropdown-novo-btn__badge">{item.badge}</span>}
          </span>
          <span className="bfs-dropdown-novo-btn__desc">{item.desc}</span>
        </span>
      </button>
    ))
  )

  const itensAcao: ItemAcaoNovo[] = [
    {
      icon: 'upload',
      label: 'Importação',
      desc: 'Excel, CSV ou XML',
      badge: 'Em breve',
      disabled: true,
    },
    {
      icon: 'api',
      label: 'API',
      desc: 'Integração via Cockpit ou ERP',
      badge: 'Em breve',
      disabled: true,
    },
    {
      icon: 'sparkle',
      label: 'Smart Docs',
      desc: 'IA extrai dados do documento',
      badge: 'Demo',
      disabled: true,
    },
    {
      icon: 'pencil',
      label: 'Manual',
      desc: 'Preencher formulário',
      action: () => {
        onAbrirNovaCotacaoManual()
        fechar()
      },
    },
  ]

  const submenuBuscarFreteAtivo = submenu === 'buscar-frete' || submenu === 'avulsa' || submenu === 'bid'

  const classeSubmenu = [
    'bfs-dropdown-novo__submenu',
    alinharMenuDireita ? 'bfs-dropdown-novo__submenu--esquerda' : '',
  ].filter(Boolean).join(' ')

  return (
    <div ref={dropdownRef} className={['bfs-dropdown-novo', className].filter(Boolean).join(' ')}>
      <BotaoGlobal
        variante="primario"
        tamanho="pequeno"
        icone={<Plus size={14} weight="bold" />}
        onClick={() => setAberto((prev) => !prev)}
      >
        Nova
        {' '}
        <CaretDown
          size={12}
          weight="bold"
          style={{
            marginLeft: 2,
            transition: 'transform 0.15s',
            transform: aberto ? 'rotate(180deg)' : 'none',
          }}
        />
      </BotaoGlobal>

      {aberto && (
        <div
          className={[
            'bfs-dropdown-novo__menu',
            alinharMenuDireita ? 'bfs-dropdown-novo__menu--direita' : '',
          ].filter(Boolean).join(' ')}
        >
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setSubmenu('buscar-frete')}
            onMouseLeave={() => setSubmenu(null)}
          >
            <button
              type="button"
              className={`bfs-dropdown-novo-btn${submenuBuscarFreteAtivo ? ' bfs-dropdown-novo-btn--hover' : ''}`}
              onClick={() => setSubmenu(submenuBuscarFreteAtivo ? null : 'buscar-frete')}
            >
              <span className="bfs-dropdown-novo-btn__icone">
                <Globe size={16} weight="duotone" />
              </span>
              <span className="bfs-dropdown-novo-btn__texto">
                <span className="bfs-dropdown-novo-btn__label bfs-dropdown-novo-btn__label--forte">Buscar Frete</span>
                <span className="bfs-dropdown-novo-btn__desc">Cotação avulsa ou BID</span>
              </span>
              <CaretRight size={11} weight="bold" className="bfs-dropdown-novo-btn__caret" />
            </button>

            {submenuBuscarFreteAtivo && (
              <div className={classeSubmenu}>
                <div className="bfs-dropdown-novo__submenu-panel">
                  <div
                    style={{ position: 'relative' }}
                    onMouseEnter={() => setSubmenu('avulsa')}
                    onMouseLeave={() => setSubmenu('buscar-frete')}
                  >
                    <button
                      type="button"
                      className={`bfs-dropdown-novo-btn${submenu === 'avulsa' ? ' bfs-dropdown-novo-btn--hover' : ''}`}
                    >
                      <span className="bfs-dropdown-novo-btn__icone">
                        <FileText size={16} weight="duotone" />
                      </span>
                      <span className="bfs-dropdown-novo-btn__texto">
                        <span className="bfs-dropdown-novo-btn__label bfs-dropdown-novo-btn__label--forte">Cotação Avulsa</span>
                        <span className="bfs-dropdown-novo-btn__desc">Cotar um frete com fornecedores</span>
                      </span>
                      <CaretRight size={11} weight="bold" className="bfs-dropdown-novo-btn__caret" />
                    </button>

                    {submenu === 'avulsa' && (
                      <div className={classeSubmenu} style={{ zIndex: 302 }}>
                        <div className="bfs-dropdown-novo__submenu-panel">
                          {renderItensAcao(itensAcao)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    style={{ position: 'relative' }}
                    onMouseEnter={() => setSubmenu('bid')}
                    onMouseLeave={() => setSubmenu('buscar-frete')}
                  >
                    <button
                      type="button"
                      className={`bfs-dropdown-novo-btn${submenu === 'bid' ? ' bfs-dropdown-novo-btn--hover' : ''}`}
                    >
                      <span className="bfs-dropdown-novo-btn__icone">
                        <Stack size={16} weight="duotone" />
                      </span>
                      <span className="bfs-dropdown-novo-btn__texto">
                        <span className="bfs-dropdown-novo-btn__label bfs-dropdown-novo-btn__label--forte">BID</span>
                        <span className="bfs-dropdown-novo-btn__desc">Conjunto de cotações para vários fornecedores</span>
                      </span>
                      <CaretRight size={11} weight="bold" className="bfs-dropdown-novo-btn__caret" />
                    </button>

                    {submenu === 'bid' && (
                      <div className={classeSubmenu} style={{ zIndex: 302 }}>
                        <div className="bfs-dropdown-novo__submenu-panel">
                          {renderItensAcao(itensAcao)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {onCriarPainelLista && (
            <>
              <div className="bfs-dropdown-novo__divider" />
              <div
                style={{ position: 'relative' }}
                onMouseEnter={() => setSubmenu('painel')}
                onMouseLeave={() => setSubmenu(null)}
              >
                <button
                  type="button"
                  className={`bfs-dropdown-novo-painel-btn${submenu === 'painel' ? ' bfs-dropdown-novo-painel-btn--hover' : ''}`}
                >
                  <span className="bfs-dropdown-novo-painel-btn__esq">
                    <span className="bfs-dropdown-novo-painel-btn__icone">
                      <SquaresFour size={13} weight="duotone" />
                    </span>
                    Novo painel
                  </span>
                  <CaretRight size={11} weight="bold" className="bfs-dropdown-novo-btn__caret" />
                </button>

                {submenu === 'painel' && (
                  <div className={classeSubmenu}>
                    <form
                      className="bfs-dropdown-novo__submenu-panel bfs-dropdown-novo__form-painel"
                      onSubmit={(e) => {
                        e.preventDefault()
                        const nome = nomePainelLista.trim()
                        if (!nome || !onCriarPainelLista) return
                        const ok = onCriarPainelLista(nome)
                        if (!ok) return
                        setNomePainelLista('')
                        fechar()
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        autoFocus
                        type="text"
                        placeholder="Ex.: Exportação Q2"
                        value={nomePainelLista}
                        onChange={(e) => setNomePainelLista(e.target.value)}
                        maxLength={60}
                        className="bfs-dropdown-novo__input-painel"
                      />
                      <button type="submit" className="bfs-dropdown-novo__criar-painel">
                        Criar
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
