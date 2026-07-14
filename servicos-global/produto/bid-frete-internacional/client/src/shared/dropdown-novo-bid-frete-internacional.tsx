import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
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
import { BotaoGlobal } from '@nucleo/botao-global'
import { ModalNovoBidFreteInternacional } from '../pages/modal-novo-bid-frete-internacional'
import { PRODUCT_CONFIG } from './config'
import {
  buildRotaNovaCotacaoManual,
  buildUrlNovaLeituraSmartReadBidFreteInternacional,
} from './novo-bid-frete-internacional-utils'
import './dropdown-novo-bid-frete-internacional.css'

type NovoSubmenu = 'painel' | 'buscar-frete' | 'avulsa' | 'bid' | null

type ItemAcaoNovo = {
  icon: 'upload' | 'api' | 'sparkle' | 'pencil'
  label: string
  desc: string
  badge?: string
  disabled?: boolean
  action?: () => void
}

export type DropdownNovoBidFreteInternacionalProps = {
  idPainelLista?: string | null
  onCriarPainelLista?: (nome: string) => Promise<boolean>
  onBidCriado?: () => void
  alinharMenuDireita?: boolean
  className?: string
}

function fecharDropdown(
  setAberto: (v: boolean) => void,
  setSubmenu: (v: NovoSubmenu) => void,
) {
  setAberto(false)
  setSubmenu(null)
}

export function DropdownNovoBidFreteInternacional({
  idPainelLista,
  onCriarPainelLista,
  onBidCriado,
  alinharMenuDireita = false,
  className = '',
}: DropdownNovoBidFreteInternacionalProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [aberto, setAberto] = useState(false)
  const [submenu, setSubmenu] = useState<NovoSubmenu>(null)
  const [nomePainelLista, setNomePainelLista] = useState('')
  const [modalNovoBidAberto, setModalNovoBidAberto] = useState(false)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        fecharDropdown(setAberto, setSubmenu)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fechar = useCallback(() => {
    fecharDropdown(setAberto, setSubmenu)
  }, [])

  const renderIconeAcao = (icon: ItemAcaoNovo['icon']) => {
    if (icon === 'pencil') return <PencilSimple size={16} weight="duotone" />
    if (icon === 'sparkle') return <Sparkle size={16} weight="duotone" />
    if (icon === 'upload') return <UploadSimple size={16} weight="duotone" />
    return <ArrowsLeftRight size={16} weight="duotone" />
  }

  const renderItensAcao = (itens: ItemAcaoNovo[]) => (
    itens.map(item => (
      <button
        key={item.label}
        type="button"
        className="bf-dropdown-novo-btn"
        disabled={item.disabled}
        onClick={item.disabled ? undefined : item.action}
      >
        <span style={{
          color: item.icon === 'sparkle' ? '#a78bfa' : 'var(--text-secondary)',
          flexShrink: 0,
          marginTop: '0.1875rem',
          width: '1.5rem',
          display: 'inline-flex',
          justifyContent: 'flex-start',
        }}
        >
          {renderIconeAcao(item.icon)}
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', gap: '0.0625rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 500 }}>
            {item.label}
            {item.badge && (
              <span style={{
                fontSize: '0.625rem',
                fontWeight: 600,
                padding: '1px 5px',
                borderRadius: '4px',
                background: 'rgba(255,255,255,0.06)',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
              }}
              >
                {item.badge}
              </span>
            )}
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
            {item.desc}
          </span>
        </span>
      </button>
    ))
  )

  const itensAvulsa: ItemAcaoNovo[] = [
    {
      icon: 'upload',
      label: t('bidfrete.novo_bid.importacao'),
      desc: t('bidfrete.novo_bid.importacao_desc'),
      badge: t('comum.em_breve'),
      disabled: true,
    },
    {
      icon: 'api',
      label: t('bidfrete.novo_bid.api'),
      desc: t('bidfrete.novo_bid.api_desc'),
      badge: t('comum.em_breve'),
      disabled: true,
    },
    ...(PRODUCT_CONFIG.features.smart_read ? [{
      icon: 'sparkle' as const,
      label: t('bidfrete.novo_bid.smart_read'),
      desc: t('bidfrete.novo_bid.smart_read_desc'),
      action: () => {
        window.location.href = buildUrlNovaLeituraSmartReadBidFreteInternacional()
        fechar()
      },
    }] : [{
      icon: 'sparkle' as const,
      label: t('bidfrete.novo_bid.smart_read'),
      desc: t('bidfrete.novo_bid.smart_read_desc'),
      badge: t('comum.em_breve'),
      disabled: true,
    }]),
    {
      icon: 'pencil',
      label: t('bidfrete.novo_bid.manual'),
      desc: t('bidfrete.novo_bid.manual_desc'),
      action: () => {
        navigate(buildRotaNovaCotacaoManual(idPainelLista))
        fechar()
      },
    },
  ]

  const itensBid: ItemAcaoNovo[] = [
    {
      icon: 'upload',
      label: t('bidfrete.novo_bid.importacao'),
      desc: t('bidfrete.novo_bid.importacao_desc'),
      badge: t('comum.em_breve'),
      disabled: true,
    },
    {
      icon: 'api',
      label: t('bidfrete.novo_bid.api'),
      desc: t('bidfrete.novo_bid.api_desc'),
      badge: t('comum.em_breve'),
      disabled: true,
    },
    ...(PRODUCT_CONFIG.features.smart_read ? [{
      icon: 'sparkle' as const,
      label: t('bidfrete.novo_bid.smart_read'),
      desc: t('bidfrete.novo_bid.smart_read_desc'),
      action: () => {
        window.location.href = buildUrlNovaLeituraSmartReadBidFreteInternacional()
        fechar()
      },
    }] : [{
      icon: 'sparkle' as const,
      label: t('bidfrete.novo_bid.smart_read'),
      desc: t('bidfrete.novo_bid.smart_read_desc'),
      badge: t('comum.em_breve'),
      disabled: true,
    }]),
    {
      icon: 'pencil',
      label: t('bidfrete.novo_bid.manual'),
      desc: t('bidfrete.novo_bid.manual_desc'),
      action: () => {
        setModalNovoBidAberto(true)
        fechar()
      },
    },
  ]

  const submenuBuscarFreteAtivo = submenu === 'buscar-frete' || submenu === 'avulsa' || submenu === 'bid'

  const classeSubmenu = [
    'bf-dropdown-novo__submenu',
    alinharMenuDireita ? 'bf-dropdown-novo__submenu--esquerda' : '',
  ].filter(Boolean).join(' ')

  return (
    <>
      <div ref={dropdownRef} className={['bf-dropdown-novo', className].filter(Boolean).join(' ')}>
        <BotaoGlobal
          variante="primario"
          tamanho="pequeno"
          icone={<Plus size={14} weight="bold" />}
          onClick={() => setAberto(prev => !prev)}
        >
          {t('bidfrete.cotacoes.toolbar.novo')}
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
          <div className={[
            'bf-dropdown-novo__menu',
            alinharMenuDireita ? 'bf-dropdown-novo__menu--direita' : '',
          ].filter(Boolean).join(' ')}
          >
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => setSubmenu('buscar-frete')}
              onMouseLeave={() => setSubmenu(null)}
            >
              <button
                type="button"
                className="bf-dropdown-novo-btn"
                style={{ width: '100%', background: submenuBuscarFreteAtivo ? 'var(--bg-hover)' : undefined }}
                onClick={() => setSubmenu(prev => (submenuBuscarFreteAtivo ? null : 'buscar-frete'))}
              >
                <span style={{ color: 'var(--text-secondary)', flexShrink: 0, marginTop: '0.1875rem', width: '1.5rem', display: 'inline-flex', justifyContent: 'flex-start' }}>
                  <Globe size={16} weight="duotone" />
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: '0.0625rem', textAlign: 'left', flex: 1 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t('bidfrete.cotacoes.toolbar.buscarFrete')}</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 400 }}>{t('bidfrete.cotacoes.toolbar.buscarFreteDesc')}</span>
                </span>
                <CaretRight size={11} weight="bold" style={{ color: 'var(--text-secondary)', flexShrink: 0, alignSelf: 'center' }} />
              </button>

              {submenuBuscarFreteAtivo && (
                <div className={classeSubmenu}>
                  <div className="bf-dropdown-novo__submenu-panel">
                    <div
                      style={{ position: 'relative' }}
                      onMouseEnter={() => setSubmenu('avulsa')}
                      onMouseLeave={() => setSubmenu('buscar-frete')}
                    >
                      <button
                        type="button"
                        className="bf-dropdown-novo-btn"
                        style={{ width: '100%', background: submenu === 'avulsa' ? 'var(--bg-hover)' : undefined }}
                      >
                        <span style={{ color: 'var(--text-secondary)', flexShrink: 0, marginTop: '0.1875rem', width: '1.5rem', display: 'inline-flex', justifyContent: 'flex-start' }}>
                          <FileText size={16} weight="duotone" />
                        </span>
                        <span style={{ display: 'flex', flexDirection: 'column', gap: '0.0625rem', textAlign: 'left', flex: 1 }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t('bidfrete.cotacoes.toolbar.cotacaoAvulsa')}</span>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 400 }}>{t('bidfrete.cotacoes.toolbar.cotacaoAvulsaDesc')}</span>
                        </span>
                        <CaretRight size={11} weight="bold" style={{ color: 'var(--text-secondary)', flexShrink: 0, alignSelf: 'center' }} />
                      </button>

                      {submenu === 'avulsa' && (
                        <div className={classeSubmenu} style={{ zIndex: 302 }}>
                          <div className="bf-dropdown-novo__submenu-panel">
                            {renderItensAcao(itensAvulsa)}
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
                        className="bf-dropdown-novo-btn"
                        style={{ width: '100%', background: submenu === 'bid' ? 'var(--bg-hover)' : undefined }}
                      >
                        <span style={{ color: 'var(--text-secondary)', flexShrink: 0, marginTop: '0.1875rem', width: '1.5rem', display: 'inline-flex', justifyContent: 'flex-start' }}>
                          <Stack size={16} weight="duotone" />
                        </span>
                        <span style={{ display: 'flex', flexDirection: 'column', gap: '0.0625rem', textAlign: 'left', flex: 1 }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t('bidfrete.cotacoes.toolbar.bid')}</span>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 400 }}>{t('bidfrete.cotacoes.toolbar.bidDesc')}</span>
                        </span>
                        <CaretRight size={11} weight="bold" style={{ color: 'var(--text-secondary)', flexShrink: 0, alignSelf: 'center' }} />
                      </button>

                      {submenu === 'bid' && (
                        <div className={classeSubmenu} style={{ zIndex: 302 }}>
                          <div className="bf-dropdown-novo__submenu-panel">
                            {renderItensAcao(itensBid)}
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
                <div className="bf-dropdown-novo__divider" />
                <div
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setSubmenu('painel')}
                  onMouseLeave={() => setSubmenu(null)}
                >
                  <button
                    type="button"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      padding: '0.5rem 0.625rem',
                      border: 'none',
                      borderRadius: '0.5rem',
                      background: submenu === 'painel' ? 'var(--bg-hover)' : 'transparent',
                      color: 'var(--text-primary)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      width: '100%',
                      fontFamily: 'inherit',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '1.5rem',
                        height: '1.5rem',
                        borderRadius: '0.375rem',
                        background: 'rgba(139,92,246,0.12)',
                        flexShrink: 0,
                      }}
                      >
                        <SquaresFour size={13} weight="duotone" style={{ color: '#a78bfa' }} />
                      </span>
                      {t('bid_frete_internacional.lista.painel_novo', { defaultValue: 'Novo painel' })}
                    </span>
                    <CaretRight size={11} weight="bold" style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                  </button>

                  {submenu === 'painel' && (
                    <div className={classeSubmenu}>
                      <form
                        className="bf-dropdown-novo__submenu-panel"
                        style={{ minWidth: '220px', padding: '0.5rem', gap: '0.375rem' }}
                        onSubmit={e => {
                          e.preventDefault()
                          const nome = nomePainelLista.trim()
                          if (!nome || !onCriarPainelLista) return
                          void (async () => {
                            const ok = await onCriarPainelLista(nome)
                            if (!ok) return
                            setNomePainelLista('')
                            fechar()
                          })()
                        }}
                        onClick={e => e.stopPropagation()}
                      >
                        <input
                          autoFocus
                          type="text"
                          placeholder={t('bid_frete_internacional.lista.painel_novo_placeholder', {
                            defaultValue: 'Ex.: Exportação Q2',
                          })}
                          value={nomePainelLista}
                          onChange={e => setNomePainelLista(e.target.value)}
                          maxLength={60}
                          style={{
                            background: 'var(--bg-hover)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '0.375rem',
                            padding: '0.375rem 0.5rem',
                            fontSize: '0.8125rem',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            width: '100%',
                            fontFamily: 'inherit',
                          }}
                        />
                        <button
                          type="submit"
                          style={{
                            padding: '0.375rem 0.625rem',
                            borderRadius: '0.375rem',
                            border: 'none',
                            background: 'rgba(139,92,246,0.25)',
                            color: '#c4b5fd',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                          }}
                        >
                          {t('bid_frete_internacional.lista.painel_criar', { defaultValue: 'Criar' })}
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

      <ModalNovoBidFreteInternacional
        aberto={modalNovoBidAberto}
        aoFechar={() => setModalNovoBidAberto(false)}
        aoCriarBid={() => { onBidCriado?.() }}
      />
    </>
  )
}
