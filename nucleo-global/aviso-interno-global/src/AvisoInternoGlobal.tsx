import React, { useState, useMemo } from 'react';
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
import { LocalizarCampoGlobal } from '@nucleo/localizar-campo-global';
import { CalendarioCampoGlobal } from '@nucleo/calendario-campo-global';
import './aviso-interno.css';

export interface AvisoInterno {
  id: string;
  conteudo: string;
  autor?: { nome: string; avatarUrl?: string };
  dataHora: string;
  lido: boolean;
  tipo: 'aviso' | 'mencao' | 'sistema' | 'tarefa';
  statusReal?: 'em_dia' | 'atrasado'; 
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
  const [busca, setBusca] = useState('');
  const [dataFiltro, setDataFiltro] = useState<{ inicio: Date | null, fim: Date | null }>({ inicio: null, fim: null });
  const [novoAviso, setNovoAviso] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<'todas' | 'nao_lidas'>('todas');

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
      if (filtroStatus === 'nao_lidas' && a.lido) return false;

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
  }, [avisos, filtroStatus, busca, dataFiltro]);

  return (
    <div className={`aig-dropdown ${className}`}>
      <style>{`
        .aig-combo-wrap .ws-global-search { width: 100% !important; padding: 0 0.75rem !important; }
        .aig-combo-wrap .ws-global-search__input { display: block !important; width: 100% !important; }
        .aig-combo-wrap .ws-global-cmd { display: none !important; }
        .aig-combo-wrap .ws-input-icon-wrap { padding: 0 0.75rem 0 2.25rem !important; }
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
            onChange={(e) => setNovoAviso(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            autoFocus
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" className="aig-btn-primary" onClick={handleCriar} disabled={!novoAviso.trim()}>
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* ORDENAR / STATUS */}
      <div className="aig-section">
        <span className="aig-label">STATUS</span>
        <div className="aig-pills">
          <button 
            className={`aig-pill ${filtroStatus === 'todas' ? 'active' : ''}`}
            onClick={() => setFiltroStatus('todas')}
          >
            Todas
          </button>
          <button 
            className={`aig-pill ${filtroStatus === 'nao_lidas' ? 'active' : ''}`}
            onClick={() => setFiltroStatus('nao_lidas')}
          >
            Não lidas
          </button>
        </div>
      </div>

      {/* BUSCA / DATA COMBO */}
      <div className="aig-section" style={{ borderBottom: 'none', paddingBottom: '0' }}>
        <div className="aig-combo-wrap" style={{ height: '36px' }}>
          <LocalizarCampoGlobal 
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
            <div key={aviso.id} className={`aig-list-item ${aviso.lido ? 'read' : ''}`}>
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
                  <button type="button" className="aig-list-check" onClick={() => onMarcarLido?.(aviso.id)}>
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
           setFiltroStatus('nao_lidas');
           if (onFechar) onFechar();
        }}>
          <X size={14} weight="bold" /> Limpar filtros
        </button>
      </div>

    </div>
  );
}
