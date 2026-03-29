import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useRef, useEffect } from 'react';
import { PaperPlaneRight, Image as ImageIcon, X, Eraser, Sparkle, ImageSquare, Spinner, DownloadSimple, ChartBar, Users } from '@phosphor-icons/react';
import './Gabi.css';
/** Basic markdown parser to render list, bold, italic, code for mock */
const renderMessageObj = (content) => {
    let parsed = content;
    // bold
    parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // italic
    parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // code
    parsed = parsed.replace(/`(.*?)`/g, '<code>$1</code>');
    // Headers (just h3 for simplicity)
    parsed = parsed.replace(/^### (.*$)/gim, '<div class="header">$1</div>');
    // List items
    parsed = parsed.replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>');
    // Clean up adjacent ul's
    parsed = parsed.replace(/<\/ul>\n<ul>/g, '\n');
    // Newlines
    parsed = parsed.replace(/\n/g, '<br />');
    return { __html: parsed };
};
export default function GabiChat({ onClose }) {
    const [messages, setMessages] = useState([]);
    const [inputVal, setInputVal] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isHoveringDrop, setIsHoveringDrop] = useState(false);
    const [images, setImages] = useState([]);
    const chatEndRef = useRef(null);
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
    const handleSend = (textOverride) => {
        const textToSend = textOverride || inputVal;
        if (!textToSend.trim() && images.length === 0)
            return;
        const userMessage = {
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
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    const handleClear = () => {
        setMessages([]);
        setIsTyping(false);
    };
    const onDragOver = (e) => {
        e.preventDefault();
        setIsHoveringDrop(true);
    };
    const onDragLeave = () => {
        setIsHoveringDrop(false);
    };
    const onDrop = (e) => {
        e.preventDefault();
        setIsHoveringDrop(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            // Mock loading an image thumbnail
            const file = e.dataTransfer.files[0];
            const url = URL.createObjectURL(file);
            setImages(prev => [...prev, url]);
        }
    };
    const onPaste = (e) => {
        if (e.clipboardData.files.length > 0) {
            const file = e.clipboardData.files[0];
            const url = URL.createObjectURL(file);
            setImages(prev => [...prev, url]);
        }
    };
    return (_jsxs("div", { className: "gabi-wrapper", onDragOver: onDragOver, onDragLeave: onDragLeave, onDrop: onDrop, onPaste: onPaste, children: [isHoveringDrop && (_jsxs("div", { className: "gabi-drop-overlay", children: [_jsx(DownloadSimple, { size: 48, weight: "duotone" }), _jsx("p", { children: "Solte suas imagens aqui" })] })), _jsxs("header", { className: "gabi-header", children: [_jsxs("div", { className: "gabi-header-left", children: [_jsxs("div", { className: "gabi-avatar-container", children: [_jsx(Sparkle, { weight: "fill", size: 28, color: "#6366f1" }), _jsx("div", { className: "gabi-status-led" })] }), _jsxs("div", { className: "gabi-header-info", children: [_jsx("h2", { children: "Gabi" }), _jsxs("p", { children: [_jsx("div", { style: { width: 6, height: 6, borderRadius: '50%', background: '#10b981' } }), "Assistente de IA \u00B7 Journey"] })] })] }), _jsxs("div", { className: "gabi-header-actions", children: [messages.length > 0 && (_jsx("button", { className: "gabi-icon-btn", onClick: handleClear, title: "Limpar conversa", children: _jsx(Eraser, { size: 18, weight: "bold" }) })), _jsx("button", { className: "gabi-icon-btn", onClick: onClose, title: "Fechar", children: _jsx(X, { size: 18, weight: "bold" }) })] })] }), _jsxs("div", { className: "gabi-chat-body", children: [messages.length === 0 ? (_jsxs("div", { className: "gabi-welcome", children: [_jsx("div", { className: "gabi-welcome-avatar", children: _jsx(Sparkle, { size: 40, weight: "fill" }) }), _jsx("h3", { children: "Ol\u00E1! Como posso ajudar voc\u00EA hoje?" }), _jsxs("div", { className: "gabi-quick-actions", children: [_jsxs("button", { className: "gabi-quick-btn", onClick: () => handleSend('Resuma o CRM de hoje'), children: [_jsx(ChartBar, { size: 18 }), " Resuma o CRM de hoje"] }), _jsxs("button", { className: "gabi-quick-btn", onClick: () => handleSend('Explique como criar atividades'), children: [_jsx(Sparkle, { size: 18 }), " Explicar Atividades"] }), _jsxs("button", { className: "gabi-quick-btn", onClick: () => handleSend('Listar clientes em risco'), children: [_jsx(Users, { size: 18 }), " Clientes em Risco"] })] })] })) : (messages.map((msg) => (_jsxs("div", { className: `gabi-message ${msg.role}`, children: [_jsxs("div", { className: "gabi-message-row", children: [_jsx("div", { className: `gabi-avatar-small ${msg.role === 'user' ? 'primary' : ''}`, children: msg.role === 'assistant' ? _jsx(Sparkle, { size: 18, color: "#9ca3af" }) : 'D' }), _jsx("div", { className: "gabi-message-bubble gabi-markdown", dangerouslySetInnerHTML: renderMessageObj(msg.content) })] }), _jsx("div", { className: "gabi-timestamp", children: msg.timestamp })] }, msg.id)))), isTyping && (_jsxs("div", { className: "gabi-thinking-badge", children: [_jsx(Spinner, { className: "gabi-spin", size: 14 }), " Analisando...", _jsxs("div", { className: "gabi-typing-indicator", children: [_jsx("span", {}), _jsx("span", {}), _jsx("span", {})] })] })), _jsx("div", { ref: chatEndRef })] }), _jsxs("div", { className: "gabi-footer", children: [images.length > 0 && (_jsx("div", { className: "gabi-upload-preview", children: images.map((url, i) => (_jsxs("div", { className: "gabi-thumbnail", children: [_jsx("img", { src: url, alt: "upload thumbnail" }), _jsx("button", { onClick: () => setImages(prev => prev.filter((_, idx) => idx !== i)), children: _jsx(X, { size: 12, weight: "bold" }) })] }, i))) })), _jsxs("div", { className: "gabi-input-wrapper", children: [_jsx("button", { className: "gabi-attach-btn", title: "Anexar imagem (Ctrl+V ou Arrastar)", children: _jsx(ImageSquare, { size: 20, weight: "light" }) }), _jsx("textarea", { className: "gabi-textarea-new", placeholder: "Pergunte qualquer coisa ou cole uma imagem", rows: 1, value: inputVal, onChange: (e) => {
                                    setInputVal(e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                }, onKeyDown: handleKeyDown }), _jsx("button", { className: "gabi-send-btn", onClick: () => handleSend(), disabled: !inputVal.trim() && images.length === 0, children: _jsx(PaperPlaneRight, { size: 20, weight: "fill" }) })] }), _jsxs("div", { className: "gabi-footer-note", children: [_jsxs("span", { className: "gabi-footer-note-item", children: [_jsx("span", { className: "key", children: "Enter" }), " para enviar"] }), _jsx("span", { className: "gabi-footer-note-item", children: "\u00B7" }), _jsxs("span", { className: "gabi-footer-note-item", children: [_jsx(ImageIcon, { size: 12 }), " Cole com Ctrl+V"] })] })] })] }));
}
