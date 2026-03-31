import React, { useState, useRef, useEffect, DragEvent } from 'react';
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
  Users
} from '@phosphor-icons/react';
import './Gabi.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
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

export default function GabiChat({ onClose }: { onClose?: () => void }) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isHoveringDrop, setIsHoveringDrop] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const formatTime = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textOverride?: string) => {
    const textToSend = textOverride || inputVal;
    if (!textToSend.trim() && images.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: formatTime()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputVal('');
    setImages([]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const assistantMessageId = (Date.now() + 1).toString();
      setMessages(prev => [
        ...prev, 
        {
          id: assistantMessageId,
          role: 'assistant',
          content: 'Entendido. Verifiquei que tudo está dentro dos conformes.\n\n### Próximos passos:\n* Enviar notificação\n* Atualizar o CRM\n* Validar **pedidos pendentes**.',
          timestamp: formatTime(),
        }
      ]);
    }, 2500); // Simmons a 2.5s thinking period
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setIsTyping(false);
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
              <div className="gabi-timestamp">{msg.timestamp}</div>
            </div>
          ))
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
