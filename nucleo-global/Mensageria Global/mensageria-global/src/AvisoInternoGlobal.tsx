import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  X,
  MagnifyingGlass,
  PaperPlaneTilt,
  CheckCircle,
  Checks,
  Bell,
  CaretDown,
  CaretUp,
  At,
  LinkSimple,
  EnvelopeSimple,
  WhatsappLogo,
  Warning,
  CalendarBlank,
  Plus,
} from '@phosphor-icons/react';
import { TooltipGlobal } from '@nucleo/tooltip-global';
import { CalendarioCampoGlobal } from '@nucleo/campo-calendario-global';
import './aviso-interno.css';

export interface AvisoInterno {
  id: string;
  conteudo: string;
  autor?: { nome: string; avatarUrl?: string };
  dataHora: string;
  lido: boolean;
  tipo: 'aviso' | 'mencao' | 'sistema' | 'tarefa' | 'enviado';
  statusReal?: 'em_dia' | 'atrasado';
  href?: string;
}

export interface UsuarioMencao {
  id: string;
  nome: string;
  email?: string;
}

export type Canal = 'interno' | 'email' | 'whatsapp';

export interface CanaisDisponiveis {
  email: boolean;
  whatsapp: boolean;
}

export interface AvisoInternoGlobalProps {
  avisos: AvisoInterno[];
  onBuscar?: (texto: string) => void;
  onFiltrarData?: (inicio: string, fim: string) => void;
  onMarcarLido?: (id: string) => void;
  onMarcarTodosLidos?: () => void;
  onCriarAviso?: (texto: string) => void;
  onNavegarHref?: (href: string) => void;
  onEnviarPara?: (destinatarios: string[], mensagem: string, link?: string, canais?: Canal[]) => void;
  usuariosTenant?: UsuarioMencao[];
  linkAtual?: string;
  carregando?: boolean;
  erro?: string | null;
  className?: string;
  onFechar?: () => void;
  canaisDisponiveis?: CanaisDisponiveis;
}

export function AvisoInternoGlobal({
  avisos,
  onBuscar,
  onMarcarLido,
  onMarcarTodosLidos,
  onCriarAviso,
  onNavegarHref,
  onEnviarPara,
  usuariosTenant = [],
  linkAtual,
  carregando = false,
  erro = null,
  onFechar,
  className = '',
  canaisDisponiveis = { email: true, whatsapp: false },
}: AvisoInternoGlobalProps) {
  const CHAR_LIMIT = 500;

  const [busca, setBusca] = useState('');
  const [dataFiltro, setDataFiltro] = useState<{ inicio: Date | null, fim: Date | null }>({ inicio: null, fim: null });
  const [mostrarLidas, setMostrarLidas] = useState(false);
  const [filtroVisao, setFiltroVisao] = useState<'todas' | 'recebidas' | 'enviadas'>('todas');
  const [isOpen, setIsOpen] = useState(false);
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [calendarioAberto, setCalendarioAberto] = useState(false);
  const [composerAberto, setComposerAberto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const buscaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (buscaAberta) buscaInputRef.current?.focus();
  }, [buscaAberta]);

  // ─── Composer unificado state ─────────────────────────────────────────────
  const [composerText, setComposerText] = useState('');
  const [composerLink, setComposerLink] = useState('');
  const [destinatarios, setDestinatarios] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerBusca, setPickerBusca] = useState('');
  const [canaisSelecionados, setCanaisSelecionados] = useState<Set<Canal>>(new Set(['interno']));
  const [linkCanais, setLinkCanais] = useState<Set<Canal>>(new Set<Canal>(['interno']));
  const [linkPopoverAberto, setLinkPopoverAberto] = useState(false);
  const linkPopoverRef = useRef<HTMLDivElement>(null);
  const [emailAssunto, setEmailAssunto] = useState('');
  const [emailDestinatarioExterno, setEmailDestinatarioExterno] = useState('');
  const [whatsappNumero, setWhatsappNumero] = useState('');

  const toggleLinkCanal = (canal: Canal) => {
    setLinkCanais(prev => {
      const next = new Set(prev);
      if (next.has(canal)) next.delete(canal);
      else next.add(canal);
      return next;
    });
  };

  // Quando o composer abre, inclui o canal interno no link por padrão
  useEffect(() => {
    if (composerAberto) {
      setLinkCanais(new Set<Canal>(['interno']));
      setLinkPopoverAberto(false);
    }
  }, [composerAberto]);

  // Click-outside para fechar o popover do link
  useEffect(() => {
    if (!linkPopoverAberto) return;
    function handleClickOutside(e: MouseEvent) {
      if (linkPopoverRef.current && !linkPopoverRef.current.contains(e.target as Node)) {
        setLinkPopoverAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [linkPopoverAberto]);

  const toggleCanal = (canal: Canal) => {
    setCanaisSelecionados(prev => {
      const next = new Set(prev);
      if (next.has(canal)) {
        if (canal === 'interno' && next.size === 1) return prev; // interno não pode ser o único desligado
        next.delete(canal);
      } else {
        next.add(canal);
      }
      return next;
    });
  };

  // ─── @mention state ────────────────────────────────────────────────────────
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);

  const mentionResults = useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return usuariosTenant.filter(
      u => u.nome.toLowerCase().includes(q) || (u.email?.toLowerCase().includes(q) ?? false)
    ).slice(0, 6);
  }, [mentionQuery, usuariosTenant]);

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length > CHAR_LIMIT) return;
    setComposerText(val);

    const cursor = e.target.selectionStart ?? val.length;
    const textBefore = val.slice(0, cursor);
    const atMatch = textBefore.match(/@([^\s@]*)$/);
    if (atMatch && usuariosTenant.length > 0) {
      setMentionQuery(atMatch[1]);
      setMentionIndex(0);
    } else {
      setMentionQuery(null);
    }
  }, [usuariosTenant]);

  const insertMention = useCallback((user: UsuarioMencao) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const cursor = ta.selectionStart ?? composerText.length;
    const textBefore = composerText.slice(0, cursor);
    const textAfter = composerText.slice(cursor);
    const atPos = textBefore.lastIndexOf('@');
    if (atPos === -1) return;
    const newText = textBefore.slice(0, atPos) + `@${user.nome} ` + textAfter;
    if (newText.length <= CHAR_LIMIT) setComposerText(newText);
    setMentionQuery(null);
    ta.focus();
  }, [composerText]);

  const handleMentionKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionQuery !== null && mentionResults.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIndex(i => (i + 1) % mentionResults.length); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setMentionIndex(i => (i - 1 + mentionResults.length) % mentionResults.length); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertMention(mentionResults[mentionIndex]); return; }
      if (e.key === 'Escape') { setMentionQuery(null); return; }
    }
  }, [mentionQuery, mentionResults, mentionIndex, insertMention]);

  // ─── User picker ──────────────────────────────────────────────────────────
  const pickerUsuariosFiltrados = useMemo(() => {
    if (!pickerBusca.trim()) return usuariosTenant;
    const q = pickerBusca.toLowerCase();
    return usuariosTenant.filter(
      u => u.nome.toLowerCase().includes(q) || (u.email?.toLowerCase().includes(q) ?? false)
    );
  }, [usuariosTenant, pickerBusca]);

  const toggleDestinatario = (id: string) => {
    setDestinatarios(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : prev.length < 20 ? [...prev, id] : prev
    );
  };

  // ─── Enviar / Salvar ─────────────────────────────────────────────────────
  const handleComposerSend = () => {
    if (!composerText.trim()) return;
    const link = linkCanais.size > 0 ? composerLink.trim() || undefined : undefined;

    if (destinatarios.length > 0 && onEnviarPara) {
      onEnviarPara(destinatarios, composerText.trim(), link, Array.from(canaisSelecionados));
    } else if (onCriarAviso) {
      onCriarAviso(composerText.trim());
    }
    setComposerText('');
    setComposerLink(linkAtual ?? '');
    setPickerOpen(false);
    setPickerBusca('');
    setDestinatarios([]);
    setCanaisSelecionados(new Set(['interno']));
    setEmailAssunto('');
    setEmailDestinatarioExterno('');
    setWhatsappNumero('');
    setLinkCanais(new Set<Canal>(['interno']));
    setLinkPopoverAberto(false);
    setComposerAberto(false);
  };

  // Inicializa link quando dropdown abre
  useEffect(() => {
    if (isOpen && linkAtual) setComposerLink(linkAtual);
  }, [isOpen, linkAtual]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = avisos.filter(a => !a.lido).length;
  const badgeText = unreadCount > 9 ? '9+' : unreadCount > 0 ? unreadCount : null;

  // Contadores por visão
  const countEnviadas = useMemo(() => avisos.filter(a => a.tipo === 'enviado').length, [avisos]);
  const countRecebidas = useMemo(() => avisos.filter(a => a.tipo !== 'enviado').length, [avisos]);

  const avisosFiltrados = useMemo(() => {
    return avisos.filter(a => {
      if (filtroVisao === 'enviadas' && a.tipo !== 'enviado') return false;
      if (filtroVisao === 'recebidas' && a.tipo === 'enviado') return false;

      if (busca) {
        const termo = busca.toLowerCase();
        const textToSearch = [a.conteudo, a.autor?.nome || 'Sistema'].join(' ').toLowerCase();
        if (!textToSearch.includes(termo)) return false;
      }
      if (filtroVisao !== 'enviadas' && a.lido && !mostrarLidas) return false;

      if (dataFiltro.inicio || dataFiltro.fim) {
        const rawDate = a.dataHora.split(',')[0].trim();
        const p = rawDate.split('/');
        let avisoDate: Date | null = null;
        if (p.length === 3) {
          avisoDate = new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
        } else if (rawDate.split('-').length === 3) {
          const dash = rawDate.split(' ')[0].split('-');
          avisoDate = new Date(parseInt(dash[0]), parseInt(dash[1]) - 1, parseInt(dash[2]));
        }
        if (avisoDate && !isNaN(avisoDate.getTime())) {
          avisoDate.setHours(0,0,0,0);
          if (dataFiltro.inicio) { const ini = new Date(dataFiltro.inicio); ini.setHours(0,0,0,0); if (avisoDate < ini) return false; }
          if (dataFiltro.fim) { const fim = new Date(dataFiltro.fim); fim.setHours(23,59,59,999); if (avisoDate > fim) return false; }
        }
      }
      return true;
    });
  }, [avisos, busca, dataFiltro, mostrarLidas, filtroVisao]);

  const hasDestinatarios = destinatarios.length > 0;

  return (
    <div style={{ position: 'relative', display: 'flex' }} ref={dropdownRef}>
      <TooltipGlobal titulo="Quadro de Avisos" descricao="Acompanhe lembretes e pendências que exigem sua ação">
        <button
          className="ws-global-btn"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          style={{ position: 'relative' }}
        >
          <Bell weight="bold" size={18} aria-hidden="true" />
          {badgeText && (
            <span className="ws-global-badge" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'absolute', top: '-2px', right: '-2px',
              fontSize: '11px', fontWeight: 'bold', color: '#ffffff', background: '#3b82f6',
              lineHeight: 1, padding: '2px', minWidth: '18px', height: '18px', borderRadius: '50%',
              boxShadow: '0 0 0 2px var(--ws-bg-body, #0f172a)'
            }}>
              {unreadCount > 9 ? '' : unreadCount}
            </span>
          )}
        </button>
      </TooltipGlobal>

      {isOpen && (
        <div
          style={{ position: 'absolute', right: 0, top: '44px', zIndex: 1000 }}
          className={`aig-dropdown ${className}`}
          role="dialog"
          aria-label="Quadro de notificações"
        >
      <style>{`
        .aig-combo-wrap .ws-global-search { width: 100% !important; padding: 0 0.75rem !important; }
        .aig-combo-wrap .ws-global-search__input { display: block !important; width: 100% !important; }
        .aig-combo-wrap input, .aig-combo-wrap .sg-valor-selecionado { font-size: 11px !important; color: var(--aig-text) !important; }
        .aig-combo-wrap .sg-placeholder { font-size: 11px !important; color: var(--aig-muted) !important; }
        .aig-combo-wrap input::placeholder { font-size: 11px !important; color: var(--aig-muted) !important; }
        .aig-combo-wrap .ws-global-cmd { display: none !important; }
        .aig-combo-wrap .sg-campo { padding: 0 0.75rem !important; }
      `}</style>

      {/* HEADER — título + ler todas + nova mensagem */}
      <div className="aig-top-header">
        <span className="aig-top-title">
           <Bell size={16} weight="duotone" /> NOTIFICAÇÕES
        </span>
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          {avisos.length > 0 && (
            <TooltipGlobal titulo="Ler todas" descricao="">
              <button type="button" className="aig-top-btn-secondary" onClick={onMarcarTodosLidos}>
                <Checks size={14} weight="bold" />
              </button>
            </TooltipGlobal>
          )}
          <TooltipGlobal titulo={composerAberto ? 'Fechar composer' : 'Nova mensagem'} descricao="">
            <button
              type="button"
              className={`aig-top-btn-primary${composerAberto ? ' composer-open' : ''}`}
              onClick={() => setComposerAberto(v => !v)}
              aria-expanded={composerAberto}
            >
              {composerAberto ? <X size={14} weight="bold" /> : <Plus size={14} weight="bold" />}
            </button>
          </TooltipGlobal>
        </div>
      </div>

      {/* FILTRO VISÃO: Todas / Recebidas / Enviadas + ícones rápidos */}
      <div className="aig-section" style={{ borderBottom: 'none', paddingBottom: '0', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          {(['todas', 'recebidas', 'enviadas'] as const).map((v) => {
            const isActive = filtroVisao === v;
            const label = v === 'todas' ? 'Todas'
              : v === 'recebidas' ? `Recebidas${countRecebidas > 0 ? ` ${countRecebidas}` : ''}`
              : `Enviadas${countEnviadas > 0 ? ` ${countEnviadas}` : ''}`;
            return (
              <button
                key={v}
                type="button"
                onClick={() => { setFiltroVisao(v); if (v === 'enviadas') setMostrarLidas(true); }}
                style={{
                  all: 'unset', cursor: 'pointer',
                  padding: '0.15rem 0.45rem', borderRadius: '999px',
                  fontSize: '0.625rem', fontWeight: isActive ? 700 : 500, lineHeight: 1.2,
                  whiteSpace: 'nowrap', boxSizing: 'border-box',
                  transition: 'all 0.15s ease',
                  background: isActive ? 'var(--aig-accent, #818cf8)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--aig-text, #cbd5e1)',
                  border: isActive ? '1px solid transparent' : '1px solid var(--aig-border, #334155)',
                }}
              >
                {label}
              </button>
            );
          })}
          <div style={{ flex: 1 }} />
          <TooltipGlobal titulo="Buscar mensagens" descricao="">
            <button
              type="button"
              className={`aig-filter-icon-btn${(buscaAberta || busca) ? ' active' : ''}`}
              onClick={() => { setBuscaAberta(v => !v); setCalendarioAberto(false); }}
              aria-pressed={buscaAberta}
            >
              <MagnifyingGlass size={13} weight={(buscaAberta || busca) ? 'fill' : 'regular'} />
            </button>
          </TooltipGlobal>
          <TooltipGlobal titulo="Filtrar por data" descricao="">
            <button
              type="button"
              className={`aig-filter-icon-btn${(calendarioAberto || dataFiltro.inicio || dataFiltro.fim) ? ' active' : ''}`}
              onClick={() => { setCalendarioAberto(v => !v); setBuscaAberta(false); }}
              aria-pressed={calendarioAberto}
            >
              <CalendarBlank size={13} weight={(calendarioAberto || dataFiltro.inicio || dataFiltro.fim) ? 'fill' : 'regular'} />
            </button>
          </TooltipGlobal>
          {(busca || dataFiltro.inicio || dataFiltro.fim || mostrarLidas || filtroVisao !== 'todas') && (
            <TooltipGlobal titulo="Limpar filtros" descricao="">
              <button
                type="button"
                className="aig-filter-icon-btn active"
                onClick={() => { setBusca(''); setDataFiltro({ inicio: null, fim: null }); setMostrarLidas(false); setFiltroVisao('todas'); setBuscaAberta(false); setCalendarioAberto(false); if (onFechar) onFechar(); }}
              >
                <X size={13} weight="bold" />
              </button>
            </TooltipGlobal>
          )}
        </div>
      </div>

      {/* BUSCA EXPANSÍVEL */}
      {buscaAberta && (
        <div className="aig-section" style={{ borderBottom: 'none', paddingTop: '0.25rem', paddingBottom: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'var(--aig-bg-input, #0f172a)', border: '1px solid var(--aig-accent, #818cf8)', borderRadius: '5px', padding: '0 0.5rem', height: '28px' }}>
            <MagnifyingGlass size={11} style={{ color: 'var(--aig-muted)', flexShrink: 0 }} />
            <input
              ref={buscaInputRef}
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar mensagens..."
              style={{ all: 'unset', flex: 1, fontSize: '0.6875rem', color: 'var(--aig-text, #f1f5f9)' }}
            />
            {busca && (
              <button type="button" onClick={() => setBusca('')} style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--aig-muted)' }}>
                <X size={10} weight="bold" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* CALENDÁRIO EXPANSÍVEL */}
      {calendarioAberto && (
        <div className="aig-section" style={{ borderBottom: 'none', paddingTop: '0.25rem', paddingBottom: '0' }}>
          <CalendarioCampoGlobal
            className="aig-calendar-right"
            valor={dataFiltro}
            aoMudarValor={(val) => {
              if (val && typeof val === 'object' && 'inicio' in val && 'fim' in val) {
                const r = val as { inicio: Date | null; fim: Date | null }
                setDataFiltro({ inicio: r.inicio, fim: r.fim })
              }
            }}
            placeholder="Selecionar período..."
          />
        </div>
      )}

      {/* LISTA */}
      <div className="aig-list">
        {carregando ? (
          <div className="aig-empty-msg" role="status" aria-live="polite">Carregando notificações…</div>
        ) : erro ? (
          <div className="aig-empty-msg" role="alert" style={{ color: 'var(--accent-red, #f87171)' }}>
            Não foi possível carregar: {erro}
          </div>
        ) : avisos.length === 0 ? (
          <div className="aig-empty-msg">Você não tem notificações.</div>
        ) : avisosFiltrados.length === 0 ? (
          <div className="aig-empty-msg">
            {busca || dataFiltro.inicio || dataFiltro.fim
              ? 'Nenhuma mensagem para os filtros aplicados.'
              : filtroVisao === 'enviadas'
                ? 'Nenhuma mensagem enviada.'
                : filtroVisao === 'recebidas'
                  ? (mostrarLidas ? 'Nenhuma mensagem recebida.' : 'Nenhuma mensagem nova. ')
                  : (mostrarLidas ? 'Nenhuma mensagem.' : 'Nenhuma mensagem nova. ')}
            {filtroVisao !== 'enviadas' && !busca && !dataFiltro.inicio && !dataFiltro.fim && !mostrarLidas && avisos.some(a => a.lido && a.tipo !== 'enviado') && (
              <button type="button" className="aig-footer-btn" onClick={() => setMostrarLidas(true)} style={{ marginLeft: 4 }}>
                Mostrar lidas
              </button>
            )}
          </div>
        ) : (
          avisosFiltrados.map((aviso) => (
            <div
              key={aviso.id}
              className={`aig-list-item ${aviso.lido ? 'read' : ''}`}
              onClick={aviso.href ? () => {
                onMarcarLido?.(aviso.id);
                setIsOpen(false);
                if (onNavegarHref) { onNavegarHref(aviso.href!); } else { window.location.href = aviso.href!; }
              } : undefined}
              style={aviso.href ? { cursor: 'pointer' } : undefined}
            >
              <div className="aig-list-avatar" style={aviso.tipo === 'enviado' ? { background: 'var(--aig-accent, #818cf8)' } : undefined}>
                {aviso.tipo === 'enviado'
                  ? <PaperPlaneTilt size={14} weight="bold" />
                  : (aviso.autor?.nome.charAt(0).toUpperCase() || 'S')}
              </div>
              <div className="aig-list-content">
                <div className="aig-list-header">
                  <span className="aig-list-author">{aviso.autor?.nome || 'Sistema'}</span>
                  <span className="aig-list-time">{aviso.dataHora}</span>
                </div>
                <p className="aig-list-text">{aviso.conteudo}</p>
              </div>
              {!aviso.lido && (
                <TooltipGlobal titulo="Marcar como lida" descricao="">
                  <button type="button" className="aig-list-check" onClick={(e) => { e.stopPropagation(); onMarcarLido?.(aviso.id); }}>
                    <CheckCircle size={18} weight="duotone" />
                  </button>
                </TooltipGlobal>
              )}
              {aviso.lido && (
                <div className="aig-list-check" style={{ cursor: 'default' }}>
                  <Checks size={18} weight="bold" />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ══════ COMPOSER — abre via botão + no header ══════ */}
      {composerAberto && (
        <div className="aig-composer" style={{ borderTop: '1px solid var(--aig-border, #334155)' }}>

          {/* Textarea — primeiro e destaque */}
          <div style={{ position: 'relative' }}>
            <textarea
              ref={textareaRef}
              className="aig-composer-textarea aig-composer-textarea--lg"
              placeholder={usuariosTenant.length > 0 ? 'Escreva sua mensagem... (@ para mencionar)' : 'Escreva sua mensagem...'}
              value={composerText}
              onChange={handleTextareaChange}
              onKeyDown={(e) => {
                handleMentionKeyDown(e);
                if (mentionQuery === null && e.key === 'Enter' && e.ctrlKey) {
                  e.preventDefault();
                  handleComposerSend();
                }
              }}
              rows={4}
              aria-label="Mensagem"
            />
            {mentionQuery !== null && mentionResults.length > 0 && (
              <div className="aig-mention-dropdown" style={{ bottom: '100%', top: 'auto' }} role="listbox" aria-label="Mencionar usuário">
                {mentionResults.map((u, i) => (
                  <button key={u.id} type="button" role="option" aria-selected={i === mentionIndex}
                    className={`aig-mention-item ${i === mentionIndex ? 'active' : ''}`}
                    onMouseDown={(e) => { e.preventDefault(); insertMention(u); }}
                    onMouseEnter={() => setMentionIndex(i)}>
                    <span className="aig-mention-avatar">{u.nome.charAt(0).toUpperCase()}</span>
                    <span className="aig-mention-name">{u.nome}</span>
                    {u.email && <span className="aig-mention-email">{u.email}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Contador + dica */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '-0.125rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.5rem', color: 'var(--aig-muted)' }}>
              {composerText.length}/{CHAR_LIMIT}
              {usuariosTenant.length > 0 && <span style={{ marginLeft: '0.25rem' }}><At size={8} style={{ verticalAlign: 'middle' }} /> mencionar</span>}
            </span>
            <span style={{ fontSize: '0.5rem', color: 'var(--aig-muted)' }}>Ctrl+Enter</span>
          </div>

          {/* Para: compacto com picker */}
          {usuariosTenant.length > 0 && (
            <div style={{ position: 'relative' }}>
              <div className="aig-para-compact"
                onClick={() => setPickerOpen(!pickerOpen)}
                role="button" tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setPickerOpen(!pickerOpen); }}
                aria-expanded={pickerOpen} aria-label="Selecionar destinatários">
                <span className="aig-para-compact__label">Para</span>
                <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '0.2rem', alignItems: 'center' }}>
                  {destinatarios.length === 0 ? (
                    <span style={{ fontSize: '0.625rem', color: 'var(--aig-muted)', fontStyle: 'italic' }}>só você (nota pessoal)</span>
                  ) : destinatarios.map(uid => {
                    const u = usuariosTenant.find(x => x.id === uid);
                    return u ? (
                      <span key={uid} className="aig-enviar-pill">
                        {u.nome}
                        <button type="button" onClick={(e) => { e.stopPropagation(); toggleDestinatario(uid); }}
                          aria-label={`Remover ${u.nome}`}
                          style={{ all: 'unset', cursor: 'pointer', display: 'inline-flex', marginLeft: '0.2rem' }}>
                          <X size={8} weight="bold" />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
                {pickerOpen ? <CaretUp size={11} style={{ color: 'var(--aig-muted)', flexShrink: 0 }} />
                            : <CaretDown size={11} style={{ color: 'var(--aig-muted)', flexShrink: 0 }} />}
              </div>

              {pickerOpen && (
                <div className="aig-picker-up">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.5rem', borderBottom: '1px solid var(--aig-border)' }}>
                    <MagnifyingGlass size={12} style={{ color: 'var(--aig-muted)', flexShrink: 0 }} />
                    <input type="text" value={pickerBusca} onChange={e => setPickerBusca(e.target.value)}
                      placeholder="Buscar usuário..." autoFocus
                      style={{ all: 'unset', flex: 1, fontSize: '0.6875rem', color: 'var(--aig-text)' }} />
                  </div>
                  <div style={{ maxHeight: '140px', overflowY: 'auto' }} role="listbox">
                    {pickerUsuariosFiltrados.length === 0 ? (
                      <div style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.6875rem', color: 'var(--aig-muted)' }}>Nenhum usuário.</div>
                    ) : pickerUsuariosFiltrados.map(u => {
                      const sel = destinatarios.includes(u.id);
                      return (
                        <button key={u.id} type="button" role="option" aria-selected={sel}
                          onClick={() => toggleDestinatario(u.id)} className={`aig-enviar-user-item ${sel ? 'selected' : ''}`}>
                          <span className="aig-mention-avatar">{u.nome.charAt(0).toUpperCase()}</span>
                          <span style={{ flex: 1, fontSize: '0.6875rem', fontWeight: 500 }}>{u.nome}</span>
                          {u.email && <span style={{ fontSize: '0.6rem', color: 'var(--aig-muted)' }}>{u.email}</span>}
                          {sel && <CheckCircle size={13} weight="fill" style={{ color: 'var(--aig-accent)', flexShrink: 0 }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Barra de ações: Link · Canais · Enviar */}
          <div className="aig-composer-actions">
            {composerLink && (
              <div style={{ position: 'relative' }} ref={linkPopoverRef}>
                <TooltipGlobal content={composerLink} position="top">
                  <button type="button"
                    className={`aig-action-chip${linkCanais.size > 0 ? ' active' : ''}`}
                    onClick={() => setLinkPopoverAberto(v => !v)}>
                    <LinkSimple size={10} weight={linkCanais.size > 0 ? 'fill' : 'regular'} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 60 }}>
                      {(() => { const parts = composerLink.split('/').filter(Boolean); return parts[parts.length - 1] || 'link'; })()}
                    </span>
                    {linkCanais.size > 0 && (
                      <span style={{ opacity: 0.65, fontSize: '0.5rem' }}>·{linkCanais.size}</span>
                    )}
                  </button>
                </TooltipGlobal>

                {linkPopoverAberto && (
                  <div className="aig-link-popover">
                    <div className="aig-link-popover__url" title={composerLink}>
                      <LinkSimple size={9} style={{ flexShrink: 0 }} />
                      <span>{composerLink}</span>
                    </div>
                    <div className="aig-link-popover__label">Incluir em:</div>
                    <button type="button"
                      className={`aig-link-popover__canal${linkCanais.has('interno') ? ' active' : ''}`}
                      onClick={() => toggleLinkCanal('interno')}>
                      <Bell size={10} style={{ flexShrink: 0 }} />
                      <span>Mensagem interna</span>
                      {linkCanais.has('interno') && <CheckCircle size={10} weight="fill" style={{ marginLeft: 'auto', color: 'var(--aig-accent)' }} />}
                    </button>
                    {canaisDisponiveis.email && canaisSelecionados.has('email') && (
                      <button type="button"
                        className={`aig-link-popover__canal${linkCanais.has('email') ? ' active' : ''}`}
                        onClick={() => toggleLinkCanal('email')}>
                        <EnvelopeSimple size={10} style={{ flexShrink: 0 }} />
                        <span>E-mail</span>
                        {linkCanais.has('email') && <CheckCircle size={10} weight="fill" style={{ marginLeft: 'auto', color: '#10b981' }} />}
                      </button>
                    )}
                    {canaisDisponiveis.whatsapp && canaisSelecionados.has('whatsapp') && (
                      <button type="button"
                        className={`aig-link-popover__canal${linkCanais.has('whatsapp') ? ' active' : ''}`}
                        onClick={() => toggleLinkCanal('whatsapp')}>
                        <WhatsappLogo size={10} style={{ flexShrink: 0 }} />
                        <span>WhatsApp</span>
                        {linkCanais.has('whatsapp') && <CheckCircle size={10} weight="fill" style={{ marginLeft: 'auto', color: '#25d166' }} />}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            <div style={{ flex: 1 }} />
            {canaisDisponiveis.email && (
              <button type="button"
                className={`aig-canal-pill${canaisSelecionados.has('email') ? ' active email' : ''}`}
                onClick={() => toggleCanal('email')} aria-pressed={canaisSelecionados.has('email')}>
                <EnvelopeSimple size={11} weight={canaisSelecionados.has('email') ? 'fill' : 'regular'} />
                E-mail
              </button>
            )}
            {canaisDisponiveis.whatsapp && (
              <button type="button"
                className={`aig-canal-pill${canaisSelecionados.has('whatsapp') ? ' active whatsapp' : ''}`}
                onClick={() => toggleCanal('whatsapp')} aria-pressed={canaisSelecionados.has('whatsapp')}>
                <WhatsappLogo size={11} weight={canaisSelecionados.has('whatsapp') ? 'fill' : 'regular'} />
                WhatsApp
              </button>
            )}
            <button type="button" className="aig-btn-primary" onClick={handleComposerSend}
              disabled={!composerText.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.625rem', flexShrink: 0 }}
              title="Ctrl+Enter">
              <PaperPlaneTilt size={12} weight="bold" />
              {hasDestinatarios ? (destinatarios.length > 1 ? `Enviar (${destinatarios.length})` : 'Enviar') : 'Salvar'}
            </button>
          </div>

          {/* Campos extras — E-mail */}
          {canaisSelecionados.has('email') && (
            <div className="aig-extra-fields">
              <div className="aig-extra-field-row">
                <label>Assunto</label>
                <input type="text" value={emailAssunto} onChange={e => setEmailAssunto(e.target.value)} placeholder="Assunto do e-mail..." />
              </div>
              {destinatarios.length === 0 && (
                <div className="aig-extra-field-row">
                  <label>Destinatário</label>
                  <input type="email" value={emailDestinatarioExterno} onChange={e => setEmailDestinatarioExterno(e.target.value)} placeholder="email@destino.com" />
                </div>
              )}
              <div className="aig-lgpd-aviso" style={{ marginTop: '0.25rem' }}>
                <Warning size={10} weight="fill" style={{ flexShrink: 0 }} />
                <span>O e-mail será processado pelo Resend para entrega (LGPD, Art. 7, IX).</span>
              </div>
            </div>
          )}

          {/* Campos extras — WhatsApp */}
          {canaisSelecionados.has('whatsapp') && (
            <div className="aig-extra-fields">
              <div className="aig-extra-field-row">
                <label>Número</label>
                <input type="tel" value={whatsappNumero} onChange={e => setWhatsappNumero(e.target.value)} placeholder="+55 11 99999-9999" />
              </div>
              <div className="aig-lgpd-aviso" style={{ marginTop: '0.25rem' }}>
                <Warning size={10} weight="fill" style={{ flexShrink: 0 }} />
                <span>WhatsApp exige consentimento explícito do destinatário (LGPD Art. 8).</span>
              </div>
            </div>
          )}

        </div>
      )}

        </div>
      )}
    </div>
  );
}
