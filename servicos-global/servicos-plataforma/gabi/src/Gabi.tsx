import React, { useState, useRef, useEffect, useCallback, DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PaperPlaneRight,
  Image as ImageIcon,
  X,
  Eraser,
  Sparkle,
  ImageSquare,
  Spinner,
  DownloadSimple,
  ChartBar,
  Users,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  XCircle,
  Wrench,
  CheckCircle,
  Warning,
} from '@phosphor-icons/react';
import './Gabi.css';

// ── Tipos ──────────────────────────────────────────────────────────────────

interface ToolCallLog {
  tool_id: string;
  sucesso: boolean;
  duracao_ms: number;
  aguardando_confirmacao?: boolean;
  nonce?: string;
  descricao_acao?: string;
}

interface ConfirmacaoPendente {
  nonce: string;
  tool_id: string;
  descricao_acao: string;
  classe: string;
  expira_em: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tools_chamadas?: ToolCallLog[];
  confirmacoes_pendentes?: ConfirmacaoPendente[];
  dados_alterados?: boolean;
  modelo?: string;
  feedback?: 'positivo' | 'negativo';
}

interface TransparencyEvent {
  id: string;
  message: string;
  timestamp: number;
}

interface GabiChatProps {
  onClose?: () => void;
  apiBaseUrl?: string;
  headers?: Record<string, string>;
}

/** Escape HTML entities to prevent XSS */
const escapeHtml = (str: string) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Safe markdown-like renderer — returns React elements instead of raw HTML */
const renderMessageContent = (content: string): React.ReactNode => {
  const escaped = escapeHtml(content);
  const lines = escaped.split('\n');

  return lines.map((line, i) => {
    // Apply inline formatting on the escaped text
    let formatted = line;
    // bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // italic
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // code
    formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');

    // Headers
    const headerMatch = formatted.match(/^### (.*)$/);
    if (headerMatch) {
      return <div key={i} className="header">{headerMatch[1]}</div>;
    }

    // List items
    const listMatch = formatted.match(/^\* (.*)$/);
    if (listMatch) {
      return <ul key={i}><li>{listMatch[1]}</li></ul>;
    }

    return <span key={i}>{formatted}{i < lines.length - 1 && <br />}</span>;
  });
};

export default function GabiChat({ onClose, apiBaseUrl = '', headers: extraHeaders }: GabiChatProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isHoveringDrop, setIsHoveringDrop] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [transparencyEvents, setTransparencyEvents] = useState<TransparencyEvent[]>([]);
  const [conversationId, setConversationId] = useState('new');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const formatTime = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, transparencyEvents]);

  const addTransparency = useCallback((msg: string) => {
    setTransparencyEvents((prev) => [
      ...prev.slice(-4),
      { id: `t-${Date.now()}`, message: msg, timestamp: Date.now() },
    ]);
  }, []);

  const clearTransparency = useCallback(() => {
    setTransparencyEvents([]);
  }, []);

  const handleConfirm = useCallback(async (nonce: string, toolId: string) => {
    if (apiBaseUrl === undefined) return;
    try {
      addTransparency(`Confirmando ${toolId}...`);
      const resp = await fetch(`${apiBaseUrl}/api/v1/gabi/agente/confirmar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...extraHeaders },
        body: JSON.stringify({ nonce, tool_id: toolId }),
      });
      const data = await resp.json();
      if (data.sucesso) {
        addTransparency(`${toolId} executado com sucesso`);
        setMessages((prev) =>
          prev.map((m) => ({
            ...m,
            confirmacoes_pendentes: m.confirmacoes_pendentes?.filter((c) => c.nonce !== nonce),
          })),
        );
      } else {
        addTransparency(`Falha: ${data.error?.message ?? 'Erro desconhecido'}`);
      }
    } catch {
      addTransparency('Erro ao confirmar acao');
    }
  }, [apiBaseUrl, extraHeaders, addTransparency]);

  const handleReject = useCallback((nonce: string) => {
    setMessages((prev) =>
      prev.map((m) => ({
        ...m,
        confirmacoes_pendentes: m.confirmacoes_pendentes?.filter((c) => c.nonce !== nonce),
      })),
    );
    addTransparency('Acao cancelada pelo usuario');
  }, [addTransparency]);

  const handleFeedback = useCallback(async (messageId: string, tipo: 'positivo' | 'negativo') => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, feedback: tipo } : m)),
    );
    if (apiBaseUrl === undefined) return;
    try {
      await fetch(`${apiBaseUrl}/api/v1/gabi/agente/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...extraHeaders },
        body: JSON.stringify({ id_conversa: conversationId, id_mensagem: messageId, tipo }),
      });
    } catch {
      // Fire-and-forget
    }
  }, [apiBaseUrl, extraHeaders, conversationId]);

  const handleSend = useCallback(async (textOverride?: string) => {
    const textToSend = textOverride || inputVal;
    if (!textToSend.trim() && images.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: formatTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputVal('');
    setImages([]);
    setIsTyping(true);
    clearTransparency();
    addTransparency('Processando sua mensagem...');

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    if (apiBaseUrl === undefined) {
      // Fallback mock — apenas quando explicitamente sem backend
      setTimeout(() => {
        setIsTyping(false);
        clearTransparency();
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'Entendido. Verifiquei que tudo esta dentro dos conformes.\n\n### Proximos passos:\n* Enviar notificacao\n* Atualizar o CRM\n* Validar **pedidos pendentes**.',
            timestamp: formatTime(),
          },
        ]);
      }, 2500);
      return;
    }

    try {
      const resp = await fetch(`${apiBaseUrl}/api/v1/gabi/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...extraHeaders },
        body: JSON.stringify({
          conversationId,
          message: textToSend,
          page: window.location.pathname,
        }),
        signal: abortRef.current.signal,
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error?.message ?? `HTTP ${resp.status}`);
      }

      const data = await resp.json();

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: formatTime(),
        tools_chamadas: data.tools_chamadas ?? data.actions_performed?.map((a: { tool: string; success: boolean }) => ({ tool_id: a.tool, sucesso: a.success, duracao_ms: 0 })),
        confirmacoes_pendentes: data.confirmacoes_pendentes ?? [],
        dados_alterados: data.dados_alterados ?? data.data_changed ?? false,
        modelo: data.modelo ?? data.model,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') return;
      const errMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Desculpe, ocorreu um erro: ${errMsg}`,
          timestamp: formatTime(),
        },
      ]);
    } finally {
      setIsTyping(false);
      clearTransparency();
    }
  }, [inputVal, images, apiBaseUrl, extraHeaders, conversationId, addTransparency, clearTransparency]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    if (abortRef.current) abortRef.current.abort();
    setMessages([]);
    setIsTyping(false);
    setConversationId('new');
    clearTransparency();
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHoveringDrop(true);
  };

  const onDragLeave = () => {
    setIsHoveringDrop(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHoveringDrop(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Mock loading an image thumbnail
      const file = e.dataTransfer.files[0];
      const url = URL.createObjectURL(file);
      setImages(prev => [...prev, url]);
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      const url = URL.createObjectURL(file);
      setImages(prev => [...prev, url]);
    }
  };

  return (
    <div 
      className="gabi-wrapper" 
      onDragOver={onDragOver} 
      onDragLeave={onDragLeave} 
      onDrop={onDrop}
      onPaste={onPaste}
    >
      {isHoveringDrop && (
        <div className="gabi-drop-overlay">
          <DownloadSimple size={48} weight="duotone" />
          <p>{t('gabi.solte_imagens')}</p>
        </div>
      )}

      {/* Header */}
      <header className="gabi-header">
        <div className="gabi-header-left">
          <div className="gabi-avatar-container">
            <Sparkle weight="fill" size={28} color="#6366f1" />
            <div className="gabi-status-led" />
          </div>
          <div className="gabi-header-info">
            <h2>{t('gabi.titulo')}</h2>
            <p>
              <div style={{width: 6, height: 6, borderRadius: '50%', background: '#10b981'}} />
              {t('gabi.subtitulo')}
            </p>
          </div>
        </div>
        
        <div className="gabi-header-actions">
          {messages.length > 0 && (
            <button className="gabi-icon-btn" onClick={handleClear} title={t('gabi.limpar_conversa')}>
              <Eraser size={18} weight="bold" />
            </button>
          )}
          <button className="gabi-icon-btn" onClick={onClose} title={t('gabi.fechar')}>
            <X size={18} weight="bold" />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div className="gabi-chat-body">
        {messages.length === 0 ? (
          <div className="gabi-welcome">
            <div className="gabi-welcome-avatar">
              <Sparkle size={40} weight="fill" />
            </div>
            <h3>{t('gabi.boas_vindas')}</h3>
            <div className="gabi-quick-actions">
              <button className="gabi-quick-btn" onClick={() => handleSend(t('gabi.acao_resumo_crm'))}>
                <ChartBar size={18} /> {t('gabi.acao_resumo_crm')}
              </button>
              <button className="gabi-quick-btn" onClick={() => handleSend(t('gabi.acao_explicar_atividades'))}>
                <Sparkle size={18} /> {t('gabi.acao_explicar_atividades')}
              </button>
              <button className="gabi-quick-btn" onClick={() => handleSend(t('gabi.acao_clientes_risco'))}>
                <Users size={18} /> {t('gabi.acao_clientes_risco')}
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`gabi-message ${msg.role}`}>
              <div className="gabi-message-row">
                <div className={`gabi-avatar-small ${msg.role === 'user' ? 'primary' : ''}`}>
                  {msg.role === 'assistant' ? <Sparkle size={18} color="#9ca3af" /> : 'D'}
                </div>
                <div className="gabi-message-bubble gabi-markdown">
                  {renderMessageContent(msg.content)}
                </div>
              </div>

              {/* Tool calls badge */}
              {msg.role === 'assistant' && msg.tools_chamadas && msg.tools_chamadas.length > 0 && (
                <div className="gabi-tools-badge">
                  <Wrench size={12} />
                  {msg.tools_chamadas.map((tc, i) => (
                    <span key={i} className={`gabi-tool-chip ${tc.sucesso ? 'success' : 'error'}`}>
                      {tc.sucesso ? <CheckCircle size={10} /> : <Warning size={10} />}
                      {tc.tool_id}
                      <span className="gabi-tool-ms">{tc.duracao_ms}ms</span>
                    </span>
                  ))}
                  {msg.dados_alterados && (
                    <span className="gabi-data-changed">dados alterados</span>
                  )}
                </div>
              )}

              {/* Confirmation cards */}
              {msg.role === 'assistant' && msg.confirmacoes_pendentes && msg.confirmacoes_pendentes.length > 0 && (
                <div className="gabi-confirmacoes">
                  {msg.confirmacoes_pendentes.map((c) => (
                    <div key={c.nonce} className={`gabi-confirmacao-card gabi-confirmacao-${c.classe.toLowerCase()}`}>
                      <div className="gabi-confirmacao-header">
                        <ShieldCheck size={16} />
                        <span className="gabi-confirmacao-classe">{c.classe}</span>
                      </div>
                      <p className="gabi-confirmacao-desc">{c.descricao_acao}</p>
                      <div className="gabi-confirmacao-actions">
                        <button
                          className="gabi-btn-confirmar"
                          onClick={() => handleConfirm(c.nonce, c.tool_id)}
                        >
                          <CheckCircle size={14} /> Confirmar
                        </button>
                        <button
                          className="gabi-btn-cancelar"
                          onClick={() => handleReject(c.nonce)}
                        >
                          <XCircle size={14} /> Cancelar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Feedback + timestamp */}
              <div className="gabi-message-footer">
                <div className="gabi-timestamp">{msg.timestamp}</div>
                {msg.role === 'assistant' && (
                  <div className="gabi-feedback">
                    <button
                      className={`gabi-feedback-btn ${msg.feedback === 'positivo' ? 'active' : ''}`}
                      onClick={() => handleFeedback(msg.id, 'positivo')}
                      title="Resposta util"
                    >
                      <ThumbsUp size={12} weight={msg.feedback === 'positivo' ? 'fill' : 'regular'} />
                    </button>
                    <button
                      className={`gabi-feedback-btn ${msg.feedback === 'negativo' ? 'active' : ''}`}
                      onClick={() => handleFeedback(msg.id, 'negativo')}
                      title="Resposta nao ajudou"
                    >
                      <ThumbsDown size={12} weight={msg.feedback === 'negativo' ? 'fill' : 'regular'} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Transparency indicators */}
        {transparencyEvents.length > 0 && (
          <div className="gabi-transparency">
            {transparencyEvents.map((ev) => (
              <div key={ev.id} className="gabi-transparency-item">
                <Spinner className="gabi-spin" size={10} />
                <span>{ev.message}</span>
              </div>
            ))}
          </div>
        )}

        {isTyping && (
          <div className="gabi-thinking-badge">
            <Spinner className="gabi-spin" size={14} /> {t('gabi.analisando')}
            <div className="gabi-typing-indicator">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input / Footer Area */}
      <div className="gabi-footer">
        
        {images.length > 0 && (
          <div className="gabi-upload-preview">
            {images.map((url, i) => (
              <div key={i} className="gabi-thumbnail">
                <img src={url} alt="upload thumbnail" />
                <button onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}><X size={12} weight="bold"/></button>
              </div>
            ))}
          </div>
        )}

        <div className="gabi-input-wrapper">
          <button className="gabi-attach-btn" title={t('gabi.anexar_imagem')}>
            <ImageSquare size={20} weight="light" />
          </button>

          <textarea
            className="gabi-textarea-new"
            placeholder={t('gabi.textarea_placeholder')}
            rows={1}
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={handleKeyDown}
          />

          <button 
            className="gabi-send-btn"
            onClick={() => handleSend()}
            disabled={!inputVal.trim() && images.length === 0}
          >
            <PaperPlaneRight size={20} weight="fill" />
          </button>
        </div>

        <div className="gabi-footer-note">
          <span className="gabi-footer-note-item">
            <span className="key">Enter</span> {t('gabi.enter_enviar')}
          </span>
          <span className="gabi-footer-note-item">·</span>
          <span className="gabi-footer-note-item">
            <ImageIcon size={12} /> {t('gabi.cole_imagem')}
          </span>
        </div>
      </div>
    </div>
  );
}
