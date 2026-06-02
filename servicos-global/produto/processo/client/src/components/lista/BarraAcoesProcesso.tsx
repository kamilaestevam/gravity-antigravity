/**
 * BarraAcoesProcesso.tsx — Barra de ações da ProcessoLista (paridade Pedido).
 */
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  CaretDown,
  PencilSimple,
  Sparkle,
  UploadSimple,
  ArrowsLeftRight,
  PencilLine,
  CopySimple,
  Trash,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { useProcessosSelecionados } from '../../shared/state/selecaoStore'

export interface BarraAcoesProcessoProps {
  novoDropdownRef: React.RefObject<HTMLDivElement>
  novoDropdownAberto: boolean
  excluindoLote: boolean
  setNovoDropdownAberto: React.Dispatch<React.SetStateAction<boolean>>
  setSmartImportAberto: React.Dispatch<React.SetStateAction<boolean>>
  setModalCockpitAberto: React.Dispatch<React.SetStateAction<boolean>>
  setModalNovoProcessoAberto: React.Dispatch<React.SetStateAction<boolean>>
  setModalEdicaoMassaAberto: React.Dispatch<React.SetStateAction<boolean>>
  setModalDuplicarAberto: React.Dispatch<React.SetStateAction<boolean>>
  onExcluirLote: () => void
}

export const BarraAcoesProcesso = React.memo(function BarraAcoesProcesso({
  novoDropdownRef,
  novoDropdownAberto,
  excluindoLote,
  setNovoDropdownAberto,
  setSmartImportAberto,
  setModalCockpitAberto,
  setModalNovoProcessoAberto,
  setModalEdicaoMassaAberto,
  setModalDuplicarAberto,
  onExcluirLote,
}: BarraAcoesProcessoProps) {
  const { t } = useTranslation()
  const processosSelecionados = useProcessosSelecionados()
  const n = processosSelecionados.length
  const labelProc = n === 1 ? 'processo' : 'processos'

  const opcoesNovo = [
    {
      icon: 'upload' as const,
      label: t('pedido.barra.importacao'),
      desc: t('pedido.barra.importacao_desc_pedido', { defaultValue: 'Excel, CSV ou XML' }),
      action: () => { setSmartImportAberto(true); setNovoDropdownAberto(false) },
    },
    {
      icon: 'api' as const,
      label: t('pedido.barra.api'),
      desc: t('pedido.barra.api_desc_pedido', { defaultValue: 'Integração via Cockpit ou ERP' }),
      action: () => { setModalCockpitAberto(true); setNovoDropdownAberto(false) },
    },
    {
      icon: 'sparkle' as const,
      label: t('pedido.barra.smart_read'),
      desc: t('pedido.barra.smart_read_desc_pedido', { defaultValue: 'IA extrai dados do documento' }),
      badge: t('pedido.barra.em_breve', { defaultValue: 'Em breve' }),
      disabled: true,
      action: () => { setNovoDropdownAberto(false) },
    },
    {
      icon: 'pencil' as const,
      label: t('pedido.barra.manual'),
      desc: 'Preencher formulário do processo',
      action: () => { setModalNovoProcessoAberto(true); setNovoDropdownAberto(false) },
    },
  ]

  return (
    <>
      <div ref={novoDropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
        <BotaoGlobal
          variante="primario"
          tamanho="pequeno"
          icone={<Plus size={14} weight="bold" />}
          onClick={() => setNovoDropdownAberto(prev => !prev)}
        >
          {t('pedido.barra.novo', { defaultValue: 'Novo' })}{' '}
          <CaretDown
            size={12}
            weight="bold"
            style={{
              marginLeft: 2,
              transition: 'transform 0.15s',
              transform: novoDropdownAberto ? 'rotate(180deg)' : 'none',
            }}
          />
        </BotaoGlobal>

        {novoDropdownAberto && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              zIndex: 300,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0.625rem',
              boxShadow: '0 12px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2)',
              minWidth: '260px',
              padding: '0.375rem',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {opcoesNovo.map(item => (
              <button
                key={item.label}
                type="button"
                className="lp-dropdown-btn"
                disabled={item.disabled}
                style={{ opacity: item.disabled ? 0.55 : 1, cursor: item.disabled ? 'not-allowed' : 'pointer' }}
                onClick={item.action}
              >
                <span
                  style={{
                    color: item.icon === 'sparkle' ? '#a78bfa' : 'var(--text-secondary)',
                    flexShrink: 0,
                    marginTop: '0.1875rem',
                    width: '1.5rem',
                    display: 'inline-flex',
                    justifyContent: 'flex-start',
                  }}
                >
                  {item.icon === 'pencil' && <PencilSimple size={16} weight="duotone" />}
                  {item.icon === 'sparkle' && <Sparkle size={16} weight="duotone" />}
                  {item.icon === 'upload' && <UploadSimple size={16} weight="duotone" />}
                  {item.icon === 'api' && <ArrowsLeftRight size={16} weight="duotone" />}
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: '0.0625rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 500 }}>
                    {item.label}
                    {item.badge && (
                      <span
                        style={{
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
            ))}
          </div>
        )}
      </div>

      <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', margin: '0 2px', flexShrink: 0 }} />

      <TooltipGlobal
        titulo={n > 0 ? `${t('pedido.barra.editar_massa')} · ${n} ${labelProc}` : t('pedido.barra.editar_massa')}
        descricao={t('pedido.barra.editar_massa_desc', { defaultValue: 'Alterar campos em lote nos processos selecionados' })}
      >
        <BotaoGlobal
          variante="secundario"
          tamanho="pequeno"
          icone={<PencilLine size={14} weight="duotone" />}
          disabled={n === 0}
          onClick={() => setModalEdicaoMassaAberto(true)}
        />
      </TooltipGlobal>

      <TooltipGlobal
        titulo={n > 0 ? `${t('pedido.barra.duplicar')} · ${n} ${labelProc}` : t('pedido.barra.duplicar')}
        descricao={t('pedido.barra.duplicar_desc', { defaultValue: 'Criar cópias dos processos selecionados' })}
      >
        <BotaoGlobal
          variante="secundario"
          tamanho="pequeno"
          icone={<CopySimple size={14} weight="duotone" />}
          aria-label={t('pedido.barra.duplicar')}
          disabled={n === 0}
          onClick={() => setModalDuplicarAberto(true)}
        />
      </TooltipGlobal>

      <TooltipGlobal
        titulo={n > 0 ? `${t('pedido.barra.excluir')} · ${n} ${labelProc}` : t('pedido.barra.excluir')}
        descricao={t('pedido.barra.excluir_desc', { defaultValue: 'Remover processos selecionados e seus pedidos' })}
      >
        <BotaoGlobal
          variante="perigo"
          tamanho="pequeno"
          icone={<Trash size={14} weight="duotone" />}
          disabled={n === 0}
          carregando={excluindoLote}
          onClick={onExcluirLote}
        />
      </TooltipGlobal>
    </>
  )
})
