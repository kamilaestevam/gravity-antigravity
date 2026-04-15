import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  X, 
  MagnifyingGlass, 
  PaperPlaneRight, 
  CheckCircle,
  Checks,
  Bell,
  Plus,
  CalendarBlank
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

export interface AvisoInternoGlobalProps {
  avisos: AvisoInterno[];
  onBuscar?: (texto: string) => void;
  onFiltrarData?: (inicio: string, fim: string) => void;
  onMarcarLido?: (id: string) => void;
  onMarcarTodosLidos?: () => void;
  onCriarAviso?: (texto: string) => void;
  className?: string;
  onFechar?: () => void;
}

export function AvisoInternoGlobal({
  avisos,
  onBuscar,
  onMarcarLido,
  onMarcarTodosLidos,
  onCriarAviso,
  onFechar,
  className = ''
}: AvisoInternoGlobalProps) {
  const CHAR_LIMIT = 170;

  const [busca, setBusca] = useState('');
  const [dataFiltro, setDataFiltro] = useState<{ inicio: Date | null, fim: Date | null }>({ inicio: null, fim: null });
  const [novoAviso, setNovoAviso] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      if (a.lido) return false;

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
  }, [avisos, busca, dataFiltro]);

  return (
    <div style={{ position: 'relative', display: 'flex' }} ref={dropdownRef}>
      <TooltipGlobal titulo="Quadro de Avisos" descricao="Acompanhe lembretes e pendências que exigem sua ação">
        <button 
          className="ws-global-btn"
          onClick={() => setIsOpen(!isOpen)}
          type="button" 
          style={{ position: 'relative' }}
        >
          <Bell weight="bold" size={18} />
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
        <div style={{ position: 'absolute', right: 0, top: '44px', zIndex: 1000 }} className={`aig-dropdown ${className}`}>
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
          <TooltipGlobal titulo={isComposerOpen ? "Cancelar" : "Nova notificação"} descricao="">
            <button
              type="button"
              className="aig-top-btn-primary"
              onClick={() => setIsComposerOpen(!isComposerOpen)}
            >
              {isComposerOpen ? <X size={14} weight="bold" /> : <Plus size={14} weight="bold" />}
            </button>
          </TooltipGlobal>
        </div>
      </div>

      {/* COMPOSER (Aberto pelo '+') */}
      {isComposerOpen && (
        <div className="aig-section" style={{ background: 'var(--ws-bg-body, #0f172a)' }}>
          <textarea 
            className="aig-textarea-tall"
            placeholder="Escreva sua mensagem ou aviso aqui..." 
            value={novoAviso}
            onChange={(e) => {
              if (e.target.value.length <= CHAR_LIMIT) setNovoAviso(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            rows={4}
            autoFocus
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.375rem' }}>
            <span style={{
              fontSize: '0.6rem',
              fontWeight: 500,
              color: 'var(--ws-muted, #94a3b8)'
            }}>
              {novoAviso.length} / {CHAR_LIMIT}
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
              aoMudarValor={(val) => setDataFiltro(val as any)}
              placeholder="Data..."
            />
          </div>
        </div>
      </div>

      {/* LISTA */}
      <div className="aig-list">
        {avisosFiltrados.length === 0 ? (
          <div className="aig-empty-msg">Nenhuma mensagem encontrada.</div>
        ) : (
          avisosFiltrados.map((aviso) => (
            <div
              key={aviso.id}
              className={`aig-list-item ${aviso.lido ? 'read' : ''}`}
              onClick={aviso.href ? () => {
                onMarcarLido?.(aviso.id);
                setIsOpen(false);
                window.location.href = aviso.href!;
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
           if (onFechar) onFechar();
        }}>
          <X size={14} weight="bold" /> Limpar filtros
        </button>
      </div>
        </div>
      )}
    </div>
  );
}
