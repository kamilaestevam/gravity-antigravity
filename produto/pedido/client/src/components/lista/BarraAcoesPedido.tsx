/**
 * BarraAcoesPedido.tsx — Barra de ações da ListaPedidos
 *
 * Componente memoizado com ~300 linhas de JSX extraído da ListaPedidos.tsx
 * para evitar re-renders desnecessários. React.memo faz shallow comparison;
 * useMemo no pai garante que props referenciais só mudam quando necessário.
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  CaretDown,
  CaretRight,
  Package,
  Tag,
  Columns,
  ArrowRight,
  PencilSimple,
  Sparkle,
  UploadSimple,
  ArrowsLeftRight,
  CheckSquare,
  PencilLine,
  FilePdf,
  CopySimple,
  Trash,
  X,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { useShellStore } from '@gravity/shell'
import type { GTColuna } from '@nucleo/tabela-virtual-global'
import type { Pedido, PedidoItem } from '../../shared/types'
import type { FiltrosAtivosMap } from './filtros'
import { rotulofiltro } from './filtros'
import { useHasMixedTipos } from '../../shared/state/selecaoStore'

export interface BarraAcoesPedidoProps {
  novoDropdownRef: React.RefObject<HTMLDivElement>
  novoDropdownAberto: boolean
  novoSubmenu: 'pedido' | 'item' | null
  pedidosSelecionados: Pedido[]
  itensSelecionados: PedidoItem[]
  excluindoLote: boolean
  filtrosAtivos: FiltrosAtivosMap
  /** Colunas pai visíveis — usadas para renderizar chips de filtros ativos */
  colunasVisiveis: GTColuna<Pedido>[]
  setNovoDropdownAberto: React.Dispatch<React.SetStateAction<boolean>>
  setNovoSubmenu: React.Dispatch<React.SetStateAction<'pedido' | 'item' | null>>
  setSmartImportAberto: React.Dispatch<React.SetStateAction<boolean>>
  setModalCockpitAberto: React.Dispatch<React.SetStateAction<boolean>>
  setModalNovoPedidoAberto: React.Dispatch<React.SetStateAction<boolean>>
  setModalNovoItemAberto: React.Dispatch<React.SetStateAction<boolean>>
  setModalTransferirAberto: React.Dispatch<React.SetStateAction<boolean>>
  setModalConsolidarAberto: React.Dispatch<React.SetStateAction<boolean>>
  setModalEdicaoMassaAberto: React.Dispatch<React.SetStateAction<boolean>>
  setModalGerarPdfAberto: React.Dispatch<React.SetStateAction<boolean>>
  setModalDuplicarAberto: React.Dispatch<React.SetStateAction<boolean>>
  onExcluirLote: () => Promise<void>
  onNavigateToConfiguracoes: () => void
  handleLimparFiltro: (campo: string) => void
  handleLimparTodosFiltros: () => void
}

export const BarraAcoesPedido = React.memo(function BarraAcoesPedido({
  novoDropdownRef,
  novoDropdownAberto,
  novoSubmenu,
  pedidosSelecionados,
  itensSelecionados,
  excluindoLote,
  filtrosAtivos,
  colunasVisiveis,
  setNovoDropdownAberto,
  setNovoSubmenu,
  setSmartImportAberto,
  setModalCockpitAberto,
  setModalNovoPedidoAberto,
  setModalNovoItemAberto,
  setModalTransferirAberto,
  setModalConsolidarAberto,
  setModalEdicaoMassaAberto,
  setModalGerarPdfAberto,
  setModalDuplicarAberto,
  onExcluirLote,
  onNavigateToConfiguracoes,
  handleLimparFiltro,
  handleLimparTodosFiltros,
}: BarraAcoesPedidoProps) {
  const { addNotification } = useShellStore()
  const hasMixedTipos = useHasMixedTipos()
  const { t } = useTranslation()

  const MSG_MIXED_TIPOS = t('pedido.barra.msg_mixed_tipos')

  return (
    <>
      {/* ── Dropdown "Novo" — Pedido · Item · Coluna ── */}
      <div ref={novoDropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
        <BotaoGlobal
          variante="primario"
          tamanho="pequeno"
          icone={<Plus size={14} weight="bold" />}
          onClick={() => { setNovoDropdownAberto(prev => !prev); setNovoSubmenu(null) }}
        >
          {t('pedido.barra.novo')} <CaretDown size={12} weight="bold" style={{ marginLeft: 2, transition: 'transform 0.15s', transform: novoDropdownAberto ? 'rotate(180deg)' : 'none' }} />
        </BotaoGlobal>

        {novoDropdownAberto && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 300,
            background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
            borderRadius: '0.625rem', boxShadow: '0 12px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2)',
            minWidth: '230px', padding: '0.375rem', display: 'flex', flexDirection: 'column',
          }}>

            {/* ── Novo Pedido ── */}
            <div style={{ position: 'relative' }}
              onMouseEnter={() => setNovoSubmenu('pedido')}
              onMouseLeave={() => setNovoSubmenu(null)}
            >
              <button type="button" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '0.5rem', padding: '0.5rem 0.625rem', border: 'none', borderRadius: '0.5rem',
                background: novoSubmenu === 'pedido' ? 'var(--bg-hover)' : 'transparent',
                color: 'var(--text-primary)', fontSize: '0.8125rem', fontWeight: 600,
                cursor: 'pointer', width: '100%', fontFamily: 'inherit',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem', background: 'rgba(129,140,248,0.12)', flexShrink: 0 }}>
                    <Package size={13} weight="duotone" style={{ color: 'var(--ws-accent, #818cf8)' }} />
                  </span>
                  {t('pedido.barra.novo_pedido')}
                </span>
                <CaretRight size={11} weight="bold" style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              </button>

              {novoSubmenu === 'pedido' && (
                <div style={{
                  position: 'absolute', left: '100%', top: 0, marginLeft: '4px', zIndex: 301,
                  background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                  borderRadius: '0.625rem', boxShadow: '0 12px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2)',
                  minWidth: '230px', padding: '0.375rem', display: 'flex', flexDirection: 'column',
                }}>
                  {([
                    { icon: 'upload' as const, label: t('pedido.barra.importacao'), desc: t('pedido.barra.importacao_desc_pedido'), action: () => { setSmartImportAberto(true); setNovoDropdownAberto(false) } },
                    { icon: 'api' as const, label: t('pedido.barra.api'), desc: t('pedido.barra.api_desc_pedido'), action: () => { setModalCockpitAberto(true); setNovoDropdownAberto(false) } },
                    { icon: 'sparkle' as const, label: t('pedido.barra.smart_read'), desc: t('pedido.barra.smart_read_desc_pedido'), badge: t('pedido.barra.em_breve'), action: () => { setSmartImportAberto(true); setNovoDropdownAberto(false) } },
                    { icon: 'pencil' as const, label: t('pedido.barra.manual'), desc: t('pedido.barra.manual_desc_pedido'), action: () => { setModalNovoPedidoAberto(true); setNovoDropdownAberto(false) } },
                  ] as { icon: 'upload'|'api'|'sparkle'|'pencil', label: string, desc: string, badge?: string, action: () => void }[]).map(item => (
                    <button key={item.label} type="button" className="lp-dropdown-btn" onClick={item.action}>
                      <span style={{ color: item.icon === 'sparkle' ? '#a78bfa' : 'var(--text-secondary)', flexShrink: 0, marginTop: '0.1875rem', width: '1.5rem', display: 'inline-flex', justifyContent: 'flex-start' }}>
                        {item.icon === 'pencil' && <PencilSimple size={16} weight="duotone" />}
                        {item.icon === 'sparkle' && <Sparkle size={16} weight="duotone" />}
                        {item.icon === 'upload' && <UploadSimple size={16} weight="duotone" />}
                        {item.icon === 'api' && <ArrowsLeftRight size={16} weight="duotone" />}
                      </span>
                      <span style={{ display: 'flex', flexDirection: 'column', gap: '0.0625rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 500 }}>
                          {item.label}
                          {item.badge && <span style={{ fontSize: '0.625rem', fontWeight: 600, padding: '1px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{item.badge}</span>}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 400 }}>{item.desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Novo Item ── */}
            <div style={{ position: 'relative' }}
              onMouseEnter={() => setNovoSubmenu('item')}
              onMouseLeave={() => setNovoSubmenu(null)}
            >
              <button type="button" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '0.5rem', padding: '0.5rem 0.625rem', border: 'none', borderRadius: '0.5rem',
                background: novoSubmenu === 'item' ? 'var(--bg-hover)' : 'transparent',
                color: 'var(--text-primary)', fontSize: '0.8125rem', fontWeight: 600,
                cursor: 'pointer', width: '100%', fontFamily: 'inherit',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem', background: 'rgba(52,211,153,0.12)', flexShrink: 0 }}>
                    <Tag size={13} weight="duotone" style={{ color: '#34d399' }} />
                  </span>
                  {t('pedido.barra.novo_item')}
                </span>
                <CaretRight size={11} weight="bold" style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              </button>

              {novoSubmenu === 'item' && (
                <div style={{
                  position: 'absolute', left: '100%', top: 0, marginLeft: '4px', zIndex: 301,
                  background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                  borderRadius: '0.625rem', boxShadow: '0 12px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2)',
                  minWidth: '230px', padding: '0.375rem', display: 'flex', flexDirection: 'column',
                }}>
                  {([
                    { icon: 'upload' as const, label: t('pedido.barra.importacao'), desc: t('pedido.barra.importacao_desc_item'), action: () => { setSmartImportAberto(true); setNovoDropdownAberto(false) } },
                    { icon: 'api' as const, label: t('pedido.barra.api'), desc: t('pedido.barra.api_desc_item'), action: () => { setModalCockpitAberto(true); setNovoDropdownAberto(false) } },
                    { icon: 'sparkle' as const, label: t('pedido.barra.smart_read'), desc: t('pedido.barra.smart_read_desc_item'), badge: t('pedido.barra.em_breve'), action: () => { setSmartImportAberto(true); setNovoDropdownAberto(false) } },
                    { icon: 'pencil' as const, label: t('pedido.barra.manual'), desc: t('pedido.barra.manual_desc_item'), action: () => { setModalNovoItemAberto(true); setNovoDropdownAberto(false) } },
                  ] as { icon: 'upload'|'api'|'sparkle'|'pencil', label: string, desc: string, badge?: string, action: () => void }[]).map(item => (
                    <button key={item.label} type="button" className="lp-dropdown-btn" onClick={item.action}>
                      <span style={{ color: item.icon === 'sparkle' ? '#a78bfa' : 'var(--text-secondary)', flexShrink: 0, marginTop: '0.1875rem', width: '1.5rem', display: 'inline-flex', justifyContent: 'flex-start' }}>
                        {item.icon === 'pencil' && <PencilSimple size={16} weight="duotone" />}
                        {item.icon === 'sparkle' && <Sparkle size={16} weight="duotone" />}
                        {item.icon === 'upload' && <UploadSimple size={16} weight="duotone" />}
                        {item.icon === 'api' && <ArrowsLeftRight size={16} weight="duotone" />}
                      </span>
                      <span style={{ display: 'flex', flexDirection: 'column', gap: '0.0625rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 500 }}>
                          {item.label}
                          {item.badge && <span style={{ fontSize: '0.625rem', fontWeight: 600, padding: '1px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{item.badge}</span>}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 400 }}>{item.desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Nova Coluna ── */}
            <button type="button" className="lp-dropdown-item-btn" onClick={onNavigateToConfiguracoes}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem', background: 'rgba(99,102,241,0.12)', flexShrink: 0 }}>
                  <Columns size={13} weight="duotone" style={{ color: '#818cf8' }} />
                </span>
                {t('pedido.barra.nova_coluna')}
              </span>
              <ArrowRight size={11} weight="bold" style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
            </button>
          </div>
        )}
      </div>

      {/* ── Ações contextuais — sempre visíveis, desativadas sem seleção ── */}
      <>
        <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', margin: '0 2px', flexShrink: 0 }} />

        {/* Transferir */}
        <TooltipGlobal
          titulo={
            pedidosSelecionados.length > 0 ? `${t('pedido.barra.transferir')} · ${pedidosSelecionados.length} pedido${pedidosSelecionados.length !== 1 ? 's' : ''}` :
            itensSelecionados.length > 0   ? `${t('pedido.barra.transferir')} · ${itensSelecionados.length} item${itensSelecionados.length !== 1 ? 's' : ''}` :
            t('pedido.barra.transferir')
          }
          descricao={t('pedido.barra.transferir_desc')}
        >
          <BotaoGlobal
            variante="secundario"
            tamanho="pequeno"
            icone={<ArrowRight size={14} weight="duotone" />}
            disabled={pedidosSelecionados.length === 0 && itensSelecionados.length === 0}
            onClick={() => { setModalTransferirAberto(true) }}
          >
            {pedidosSelecionados.length > 0 ? `${t('pedido.barra.transferir')} (${pedidosSelecionados.length})` :
             itensSelecionados.length > 0   ? `${t('pedido.barra.transferir')} (${itensSelecionados.length})` :
             t('pedido.barra.transferir')}
          </BotaoGlobal>
        </TooltipGlobal>

        {/* Consolidar */}
        <TooltipGlobal
          titulo={
            hasMixedTipos
              ? t('pedido.barra.tipos_incompativeis')
              : pedidosSelecionados.length >= 2
                ? `${t('pedido.barra.consolidar')} · ${pedidosSelecionados.length} pedidos`
                : t('pedido.barra.consolidar')
          }
          descricao={
            hasMixedTipos
              ? MSG_MIXED_TIPOS
              : pedidosSelecionados.length < 2
                ? t('pedido.barra.consolidar_min')
                : t('pedido.barra.consolidar_desc')
          }
        >
          <BotaoGlobal
            variante="secundario"
            tamanho="pequeno"
            icone={<CheckSquare size={14} weight="duotone" />}
            disabled={hasMixedTipos || pedidosSelecionados.length < 2}
            onClick={() => {
              if (hasMixedTipos) {
                addNotification({ type: 'warning', message: MSG_MIXED_TIPOS })
                return
              }
              setModalConsolidarAberto(true)
            }}
          />
        </TooltipGlobal>

        {/* Editar em Massa */}
        <TooltipGlobal
          titulo={pedidosSelecionados.length > 0 ? `${t('pedido.barra.editar_massa')} · ${pedidosSelecionados.length} pedido${pedidosSelecionados.length !== 1 ? 's' : ''}` : t('pedido.barra.editar_massa')}
          descricao={t('pedido.barra.editar_massa_desc')}
        >
          <BotaoGlobal
            variante="secundario"
            tamanho="pequeno"
            icone={<PencilLine size={14} weight="duotone" />}
            disabled={pedidosSelecionados.length === 0}
            onClick={() => { setModalEdicaoMassaAberto(true) }}
          />
        </TooltipGlobal>

        {/* Gerar Documento */}
        <TooltipGlobal
          titulo={pedidosSelecionados.length > 0 ? `${t('pedido.barra.gerar_documento')} · ${pedidosSelecionados.length} pedido${pedidosSelecionados.length !== 1 ? 's' : ''}` : t('pedido.barra.gerar_documento')}
          descricao={t('pedido.barra.gerar_documento_desc')}
        >
          <BotaoGlobal
            variante="secundario"
            tamanho="pequeno"
            icone={<FilePdf size={14} weight="duotone" />}
            disabled={pedidosSelecionados.length === 0}
            onClick={() => setModalGerarPdfAberto(true)}
          />
        </TooltipGlobal>

        {/* Duplicar */}
        <TooltipGlobal
          titulo={pedidosSelecionados.length > 0 ? `${t('pedido.barra.duplicar')} · ${pedidosSelecionados.length} pedido${pedidosSelecionados.length !== 1 ? 's' : ''}` : t('pedido.barra.duplicar')}
          descricao={t('pedido.barra.duplicar_desc')}
        >
          <BotaoGlobal
            variante="secundario"
            tamanho="pequeno"
            icone={<CopySimple size={14} weight="duotone" />}
            aria-label={t('pedido.barra.duplicar')}
            disabled={pedidosSelecionados.length === 0}
            onClick={() => setModalDuplicarAberto(true)}
          />
        </TooltipGlobal>

        {/* Excluir */}
        <TooltipGlobal
          titulo={pedidosSelecionados.length > 0 ? `${t('pedido.barra.excluir')} · ${pedidosSelecionados.length} pedido${pedidosSelecionados.length !== 1 ? 's' : ''}` : t('pedido.barra.excluir')}
          descricao={t('pedido.barra.excluir_desc')}
        >
          <BotaoGlobal
            variante="perigo"
            tamanho="pequeno"
            icone={<Trash size={14} weight="duotone" />}
            disabled={pedidosSelecionados.length === 0}
            carregando={excluindoLote}
            onClick={onExcluirLote}
          />
        </TooltipGlobal>
      </>

      {/* ── Chips de filtros ativos (dentro da toolbar) ── */}
      {Object.keys(filtrosAtivos).length > 0 && (
        <div
          role="status"
          aria-label={t('pedido.barra.filtros_ativos', { defaultValue: 'Filtros ativos' })}
          style={{ flex: '0 0 100%', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.375rem', paddingTop: '0.375rem' }}
        >
          {colunasVisiveis.filter(col => filtrosAtivos[col.key] != null).map(col => {
            const filtro = filtrosAtivos[col.key]!
            return (
              <span key={col.key} className="lp-filtro-chip">
                <span className="lp-filtro-chip-label">{col.label}:</span>
                <span className="lp-filtro-chip-valor">{rotulofiltro(col.key, filtro)}</span>
                <button
                  className="lp-filtro-chip-remove"
                  onClick={() => handleLimparFiltro(col.key)}
                  aria-label={t('pedido.barra.remover_filtro', { label: col.label })}
                >
                  <X size={10} weight="bold" />
                </button>
              </span>
            )
          })}
          <button className="lp-filtros-limpar-tudo" onClick={handleLimparTodosFiltros}>
            {t('pedido.barra.limpar_tudo')}
          </button>
        </div>
      )}
    </>
  )
})
