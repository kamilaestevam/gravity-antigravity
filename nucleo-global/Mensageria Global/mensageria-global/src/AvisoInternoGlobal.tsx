import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  X,
  MagnifyingGlass,
  PaperPlaneRight,
  PaperPlaneTilt,
  CheckCircle,
  Checks,
  Bell,
  Plus,
  CalendarBlank,
  At,
  LinkSimple
} from '@phosphor-icons/react';
import { TooltipGlobal } from '@nucleo/tooltip-global';
import { LocalizarExpandidoCampoGlobal } from '@nucleo/campo-localizar-expandido-global';
import { CalendarioCampoGlobal } from '@nucleo/campo-calendario-global';
import './aviso-interno.css';

export interface AvisoInterno {
  id: string;
  conteudo: string;
  autor?: { nome: string; avatarUrl?: string };
  dataHora: string;
  lido: boolean;
  tipo: 'aviso' | 'mencao' | 'sistema' | 'tarefa';
  statusReal?: 'em_dia' | 'atrasado';
  /** Link opcional — quando presente, o item do aviso vira clicável e navega para a rota indicada. */
  href?: string;
}

/** Usuário disponível para @mention e para o modal Enviar Para. */
export interface UsuarioMencao {
  id: string;
  nome: string;
  email?: string;
}

export interface AvisoInternoGlobalProps {
  avisos: AvisoInterno[];
  onBuscar?: (texto: string) => void;
  onFiltrarData?: (inicio: string, fim: string) => void;
  onMarcarLido?: (id: string) => void;
  onMarcarTodosLidos?: () => void;
  onCriarAviso?: (texto: string) => void;
  /** Callback opcional disparado quando um aviso com `href` é clicado. Permite
   * navegação SPA (React Router) em vez de hard reload via window.location. */
  onNavegarHref?: (href: string) => void;
  /** Callback para enviar notificação a outro(s) usuário(s) com deep link opcional. */
  onEnviarPara?: (destinatarios: string[], mensagem: string, link?: string) => void;
  /** Lista de usuários do tenant — alimenta @mention no composer e o modal Enviar Para. */
  usuariosTenant?: UsuarioMencao[];
  /** Estado de carregamento — exibe skeleton/loader em vez da lista. */
  carregando?: boolean;
  /** Mensagem de erro — exibida no lugar da lista quando presente. */
  erro?: string | null;
  className?: string;
  onFechar?: () => void;
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
  carregando = false,
  erro = null,
  onFechar,
  className = ''
}: AvisoInternoGlobalProps) {
  const CHAR_LIMIT = 170;
  const CHAR_LIMIT_ENVIAR = 500;

  const [busca, setBusca] = useState('');
  const [dataFiltro, setDataFiltro] = useState<{ inicio: Date | null, fim: Date | null }>({ inicio: null, fim: null });
  const [mostrarLidas, setMostrarLidas] = useState(false);
  const [novoAviso, setNovoAviso] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isEnviarParaOpen, setIsEnviarParaOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ─── @mention state ────────────────────────────────────────────────────────
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionDropdownPos, setMentionDropdownPos] = useState<{ top: number; left: number } | null>(null);

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
    setNovoAviso(val);

    // Detect @ mention
    const cursor = e.target.selectionStart ?? val.length;
    const textBefore = val.slice(0, cursor);
    const atMatch = textBefore.match(/@([^\s@]*)$/);
    if (atMatch && usuariosTenant.length > 0) {
      setMentionQuery(atMatch[1]);
      setMentionIndex(0);
      // Position dropdown near textarea
      setMentionDropdownPos({ top: 0, left: 0 });
    } else {
      setMentionQuery(null);
    }
  }, [usuariosTenant]);

  const insertMention = useCallback((user: UsuarioMencao) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const cursor = ta.selectionStart ?? novoAviso.length;
    const textBefore = novoAviso.slice(0, cursor);
    const textAfter = novoAviso.slice(cursor);
    const atPos = textBefore.lastIndexOf('@');
    if (atPos === -1) return;
    const newText = textBefore.slice(0, atPos) + `@${user.nome} ` + textAfter;
    if (newText.length <= CHAR_LIMIT) {
      setNovoAviso(newText);
    }
    setMentionQuery(null);
    ta.focus();
  }, [novoAviso]);

  const handleMentionKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionQuery !== null && mentionResults.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex(i => (i + 1) % mentionResults.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(i => (i - 1 + mentionResults.length) % mentionResults.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(mentionResults[mentionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setMentionQuery(null);
        return;
      }
    }
  }, [mentionQuery, mentionResults, mentionIndex, insertMention]);

  // ─── Enviar Para state ─────────────────────────────────────────────────────
  const [enviarDestinatarios, setEnviarDestinatarios] = useState<string[]>([]);
  const [enviarMensagem, setEnviarMensagem] = useState('');
  const [enviarLink, setEnviarLink] = useState('');
  const [enviarBuscaUsuario, setEnviarBuscaUsuario] = useState('');

  const enviarUsuariosFiltrados = useMemo(() => {
    if (!enviarBuscaUsuario.trim()) return usuariosTenant;
    const q = enviarBuscaUsuario.toLowerCase();
    return usuariosTenant.filter(
      u => u.nome.toLowerCase().includes(q) || (u.email?.toLowerCase().includes(q) ?? false)
    );
  }, [usuariosTenant, enviarBuscaUsuario]);

  const toggleDestinatario = (id: string) => {
    setEnviarDestinatarios(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : prev.length < 20 ? [...prev, id] : prev
    );
  };

  const handleEnviar = () => {
    if (enviarDestinatarios.length === 0 || !enviarMensagem.trim()) return;
    onEnviarPara?.(enviarDestinatarios, enviarMensagem.trim(), enviarLink.trim() || undefined);
    setEnviarDestinatarios([]);
    setEnviarMensagem('');
    setEnviarLink('');
    setEnviarBuscaUsuario('');
    setIsEnviarParaOpen(false);
  };

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

  const handleBuscar = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusca(e.target.value);
    onBuscar?.(e.target.value);
  };

  const handleCriar = () => {
    if (!novoAviso.trim()) return;
    onCriarAviso?.(novoAviso.trim());
    setNovoAviso('');
    setIsComposerOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
      handleCriar();
    }
  };

  const avisosFiltrados = useMemo(() => {
    return avisos.filter(a => {
      if (busca) {
        const termo = busca.toLowerCase();
        const textToSearch = [a.conteudo, a.autor?.nome || 'Sistema'].join(' ').toLowerCase();
        if (!textToSearch.includes(termo)) return false;
      }
      if (a.lido && !mostrarLidas) return false;

      if (dataFiltro.inicio || dataFiltro.fim) {
        // Formato BR esperado gerado pelo backend toLocaleString() => dd/mm/yyyy
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
          
          if (dataFiltro.inicio) {
            const ini = new Date(dataFiltro.inicio);
            ini.setHours(0,0,0,0);
            if (avisoDate < ini) return false;
          }
          if (dataFiltro.fim) {
            const fim = new Date(dataFiltro.fim);
            fim.setHours(23,59,59,999);
            if (avisoDate > fim) return false;
          }
        }
      }
      
      return true;
    });
  }, [avisos, busca, dataFiltro, mostrarLidas]);

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

      {/* HEADER */}
      <div className="aig-top-header">
        <span className="aig-top-title">
           <Bell size={16} weight="duotone" /> NOTIFICAÇÕES
        </span>
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          {avisos.length > 0 && (
            <TooltipGlobal titulo="Ler todas" descricao="">
              <button
                type="button"
                className="aig-top-btn-secondary"
                onClick={onMarcarTodosLidos}
              >
                 <Checks size={14} weight="bold" />
              </button>
            </TooltipGlobal>
          )}
          {onEnviarPara && (
            <TooltipGlobal titulo={isEnviarParaOpen ? "Cancelar envio" : "Enviar para alguém"} descricao="">
              <button
                type="button"
                className={isEnviarParaOpen ? 'aig-top-btn-primary' : 'aig-top-btn-secondary'}
                onClick={() => {
                  setIsEnviarParaOpen(!isEnviarParaOpen);
                  if (!isEnviarParaOpen) setIsComposerOpen(false);
                }}
                aria-label="Enviar para outro usuário"
              >
                {isEnviarParaOpen ? <X size={14} weight="bold" /> : <PaperPlaneTilt size={14} weight="bold" />}
              </button>
            </TooltipGlobal>
          )}
          <TooltipGlobal titulo={isComposerOpen ? "Cancelar" : "Nova notificação"} descricao="">
            <button
              type="button"
              className="aig-top-btn-primary"
              onClick={() => {
                setIsComposerOpen(!isComposerOpen);
                if (!isComposerOpen) setIsEnviarParaOpen(false);
              }}
            >
              {isComposerOpen ? <X size={14} weight="bold" /> : <Plus size={14} weight="bold" />}
            </button>
          </TooltipGlobal>
        </div>
      </div>

      {/* COMPOSER (Aberto pelo '+') — com @mention */}
      {isComposerOpen && (
        <div className="aig-section" style={{ background: 'var(--ws-bg-body, #0f172a)', position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <textarea
              ref={textareaRef}
              className="aig-textarea-tall"
              placeholder={usuariosTenant.length > 0
                ? 'Escreva sua mensagem... (use @ para mencionar)'
                : 'Escreva sua mensagem ou aviso aqui...'}
              value={novoAviso}
              onChange={handleTextareaChange}
              onKeyDown={(e) => {
                handleMentionKeyDown(e);
                if (mentionQuery === null && e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleCriar();
                }
              }}
              rows={4}
              autoFocus
            />
            {/* @mention dropdown */}
            {mentionQuery !== null && mentionResults.length > 0 && (
              <div className="aig-mention-dropdown" role="listbox" aria-label="Mencionar usuário">
                {mentionResults.map((u, i) => (
                  <button
                    key={u.id}
                    type="button"
                    role="option"
                    aria-selected={i === mentionIndex}
                    className={`aig-mention-item ${i === mentionIndex ? 'active' : ''}`}
                    onMouseDown={(e) => { e.preventDefault(); insertMention(u); }}
                    onMouseEnter={() => setMentionIndex(i)}
                  >
                    <span className="aig-mention-avatar">{u.nome.charAt(0).toUpperCase()}</span>
                    <span className="aig-mention-name">{u.nome}</span>
                    {u.email && <span className="aig-mention-email">{u.email}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.375rem' }}>
            <span style={{
              fontSize: '0.6rem',
              fontWeight: 500,
              color: 'var(--ws-muted, #94a3b8)'
            }}>
              {novoAviso.length} / {CHAR_LIMIT}
              {usuariosTenant.length > 0 && (
                <span style={{ marginLeft: '0.5rem', color: 'var(--aig-accent, #818cf8)' }}>
                  <At size={10} weight="bold" style={{ verticalAlign: 'middle' }} /> mencionar
                </span>
              )}
            </span>
            <button
              type="button"
              className="aig-btn-primary"
              onClick={handleCriar}
              disabled={!novoAviso.trim() || novoAviso.length > CHAR_LIMIT}
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* ENVIAR PARA (Aberto pelo ➤) */}
      {isEnviarParaOpen && (
        <div className="aig-section" style={{ background: 'var(--ws-bg-body, #0f172a)' }}>
          {/* Destinatários selecionados (pills) */}
          {enviarDestinatarios.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.5rem' }}>
              {enviarDestinatarios.map(uid => {
                const u = usuariosTenant.find(x => x.id === uid);
                return u ? (
                  <span key={uid} className="aig-enviar-pill">
                    {u.nome}
                    <button type="button" onClick={() => toggleDestinatario(uid)} aria-label={`Remover ${u.nome}`}
                      style={{ all: 'unset', cursor: 'pointer', display: 'inline-flex', marginLeft: '0.25rem' }}>
                      <X size={10} weight="bold" />
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          )}

          {/* Busca de usuários */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            background: 'var(--aig-bg-input, #0f172a)', border: '1px solid var(--aig-border)',
            borderRadius: '6px', padding: '0.375rem 0.5rem', marginBottom: '0.5rem'
          }}>
            <MagnifyingGlass size={13} weight="bold" style={{ color: 'var(--aig-muted)', flexShrink: 0 }} />
            <input
              type="text"
              value={enviarBuscaUsuario}
              onChange={e => setEnviarBuscaUsuario(e.target.value)}
              placeholder="Buscar usuário..."
              aria-label="Buscar usuário para enviar"
              style={{
                all: 'unset', flex: 1, fontSize: '0.75rem',
                color: 'var(--aig-text, #f1f5f9)'
              }}
            />
          </div>

          {/* Lista de usuários (max 120px scroll) */}
          <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '0.5rem' }} role="listbox" aria-label="Selecionar destinatários">
            {enviarUsuariosFiltrados.length === 0 ? (
              <div style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--aig-muted)' }}>
                Nenhum usuário encontrado.
              </div>
            ) : enviarUsuariosFiltrados.map(u => {
              const sel = enviarDestinatarios.includes(u.id);
              return (
                <button
                  key={u.id}
                  type="button"
                  role="option"
                  aria-selected={sel}
                  onClick={() => toggleDestinatario(u.id)}
                  className={`aig-enviar-user-item ${sel ? 'selected' : ''}`}
                >
                  <span className="aig-mention-avatar">{u.nome.charAt(0).toUpperCase()}</span>
                  <span style={{ flex: 1, fontSize: '0.75rem', fontWeight: 500 }}>{u.nome}</span>
                  {u.email && <span style={{ fontSize: '0.625rem', color: 'var(--aig-muted)' }}>{u.email}</span>}
                  {sel && <CheckCircle size={14} weight="fill" style={{ color: 'var(--aig-accent)', flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>

          {/* Mensagem */}
          <textarea
            className="aig-textarea-tall"
            placeholder="Mensagem para o destinatário..."
            value={enviarMensagem}
            onChange={e => { if (e.target.value.length <= CHAR_LIMIT_ENVIAR) setEnviarMensagem(e.target.value); }}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); handleEnviar(); } }}
            rows={2}
          />

          {/* Link opcional */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            background: 'var(--aig-bg-input, #0f172a)', border: '1px solid var(--aig-border)',
            borderRadius: '6px', padding: '0.375rem 0.5rem', marginTop: '0.375rem'
          }}>
            <LinkSimple size={13} weight="bold" style={{ color: 'var(--aig-muted)', flexShrink: 0 }} />
            <input
              type="text"
              value={enviarLink}
              onChange={e => setEnviarLink(e.target.value)}
              placeholder="Link (opcional) — ex: /produto/pedido/123"
              aria-label="Link para o destinatário"
              style={{
                all: 'unset', flex: 1, fontSize: '0.6875rem',
                color: 'var(--aig-text, #f1f5f9)'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.375rem' }}>
            <span style={{ fontSize: '0.6rem', fontWeight: 500, color: 'var(--ws-muted, #94a3b8)' }}>
              {enviarMensagem.length} / {CHAR_LIMIT_ENVIAR}
              <span style={{ marginLeft: '0.5rem', opacity: 0.7 }}>Ctrl+Enter envia</span>
            </span>
            <button
              type="button"
              className="aig-btn-primary"
              onClick={handleEnviar}
              disabled={enviarDestinatarios.length === 0 || !enviarMensagem.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <PaperPlaneTilt size={12} weight="bold" />
              {enviarDestinatarios.length > 1 ? `Enviar (${enviarDestinatarios.length})` : 'Enviar'}
            </button>
          </div>
        </div>
      )}

      {/* BUSCA / DATA COMBO */}
      <div className="aig-section" style={{ borderBottom: 'none', paddingBottom: '0' }}>
        <div className="aig-combo-wrap" style={{ height: '36px' }}>
          <LocalizarExpandidoCampoGlobal 
            value={busca}
            onChange={setBusca}
            disableGlobalDOMFilter
            alwaysExpanded
            placeholder="Buscar..."
            style={{ flex: 1, height: '100%', margin: 0 }}
          />
          <div style={{ width: '130px', flexShrink: 0, height: '100%', margin: 0 }}>
            <CalendarioCampoGlobal
              className="aig-calendar-right"
              valor={dataFiltro}
              aoMudarValor={(val) => {
                if (val && typeof val === 'object' && 'inicio' in val && 'fim' in val) {
                  const r = val as { inicio: Date | null; fim: Date | null }
                  setDataFiltro({ inicio: r.inicio, fim: r.fim })
                }
              }}
              placeholder="Data..."
            />
          </div>
        </div>
      </div>

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
              : mostrarLidas
                ? 'Nenhuma mensagem.'
                : 'Nenhuma mensagem nova. '}
            {!busca && !dataFiltro.inicio && !dataFiltro.fim && !mostrarLidas && avisos.some(a => a.lido) && (
              <button
                type="button"
                className="aig-footer-btn"
                onClick={() => setMostrarLidas(true)}
                style={{ marginLeft: 4 }}
              >
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
                if (onNavegarHref) {
                  onNavegarHref(aviso.href!);
                } else {
                  window.location.href = aviso.href!;
                }
              } : undefined}
              style={aviso.href ? { cursor: 'pointer' } : undefined}
            >
              <div className="aig-list-avatar">
                {aviso.autor?.nome.charAt(0).toUpperCase() || 'S'}
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
                  <button
                    type="button"
                    className="aig-list-check"
                    onClick={(e) => { e.stopPropagation(); onMarcarLido?.(aviso.id); }}
                  >
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

      {/* FOOTER */}
      <div className="aig-footer">
        <button type="button" className="aig-footer-btn" onClick={() => {
           setBusca('');
           setDataFiltro({ inicio: null, fim: null });
           setMostrarLidas(false);
           if (onFechar) onFechar();
        }}>
          <X size={14} weight="bold" /> Limpar filtros
        </button>
        {avisos.some(a => a.lido) && (
          <button
            type="button"
            className="aig-footer-btn"
            onClick={() => setMostrarLidas(v => !v)}
          >
            {mostrarLidas ? 'Esconder lidas' : 'Mostrar lidas'}
          </button>
        )}
      </div>
        </div>
      )}
    </div>
  );
}
