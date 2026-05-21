import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PaperPlaneRight, Image as ImageIcon, X, Eraser, Sparkle, ImageSquare, Spinner, DownloadSimple, ChartBar, Users, ThumbsUp, ThumbsDown, ShieldCheck, XCircle, Wrench, CheckCircle, Warning, } from '@phosphor-icons/react';
import './Gabi.css';
/** Escape HTML entities to prevent XSS */
const escapeHtml = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** Safe markdown-like renderer — returns React elements instead of raw HTML */
const renderMessageContent = (content) => {
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
            return _jsx("div", { className: "header", children: headerMatch[1] }, i);
        }
        // List items
        const listMatch = formatted.match(/^\* (.*)$/);
        if (listMatch) {
            return _jsx("ul", { children: _jsx("li", { children: listMatch[1] }) }, i);
        }
        return _jsxs("span", { children: [formatted, i < lines.length - 1 && _jsx("br", {})] }, i);
    });
};
export default function GabiChat({ onClose, apiBaseUrl = '', headers: extraHeaders }) {
    const { t } = useTranslation();
    const [messages, setMessages] = useState([]);
    const [inputVal, setInputVal] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isHoveringDrop, setIsHoveringDrop] = useState(false);
    const [images, setImages] = useState([]);
    const [transparencyEvents, setTransparencyEvents] = useState([]);
    const [conversationId, setConversationId] = useState('new');
    const chatEndRef = useRef(null);
    const abortRef = useRef(null);
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
    const addTransparency = useCallback((msg) => {
        setTransparencyEvents((prev) => [
            ...prev.slice(-4),
            { id: `t-${Date.now()}`, message: msg, timestamp: Date.now() },
        ]);
    }, []);
    const clearTransparency = useCallback(() => {
        setTransparencyEvents([]);
    }, []);
    const handleConfirm = useCallback(async (nonce, toolId) => {
        if (apiBaseUrl === undefined)
            return;
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
                setMessages((prev) => prev.map((m) => ({
                    ...m,
                    confirmacoes_pendentes: m.confirmacoes_pendentes?.filter((c) => c.nonce !== nonce),
                })));
            }
            else {
                addTransparency(`Falha: ${data.error?.message ?? 'Erro desconhecido'}`);
            }
        }
        catch {
            addTransparency('Erro ao confirmar acao');
        }
    }, [apiBaseUrl, extraHeaders, addTransparency]);
    const handleReject = useCallback((nonce) => {
        setMessages((prev) => prev.map((m) => ({
            ...m,
            confirmacoes_pendentes: m.confirmacoes_pendentes?.filter((c) => c.nonce !== nonce),
        })));
        addTransparency('Acao cancelada pelo usuario');
    }, [addTransparency]);
    const handleFeedback = useCallback(async (messageId, tipo) => {
        setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, feedback: tipo } : m)));
        if (apiBaseUrl === undefined)
            return;
        try {
            await fetch(`${apiBaseUrl}/api/v1/gabi/agente/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...extraHeaders },
                body: JSON.stringify({ id_conversa: conversationId, id_mensagem: messageId, tipo }),
            });
        }
        catch {
            // Fire-and-forget
        }
    }, [apiBaseUrl, extraHeaders, conversationId]);
    const handleSend = useCallback(async (textOverride) => {
        const textToSend = textOverride || inputVal;
        if (!textToSend.trim() && images.length === 0)
            return;
        const userMessage = {
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
        if (abortRef.current)
            abortRef.current.abort();
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
            const assistantMsg = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response,
                timestamp: formatTime(),
                tools_chamadas: data.tools_chamadas ?? data.actions_performed?.map((a) => ({ tool_id: a.tool, sucesso: a.success, duracao_ms: 0 })),
                confirmacoes_pendentes: data.confirmacoes_pendentes ?? [],
                dados_alterados: data.dados_alterados ?? data.data_changed ?? false,
                modelo: data.modelo ?? data.model,
            };
            setMessages((prev) => [...prev, assistantMsg]);
        }
        catch (err) {
            if (err.name === 'AbortError')
                return;
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
        }
        finally {
            setIsTyping(false);
            clearTransparency();
        }
    }, [inputVal, images, apiBaseUrl, extraHeaders, conversationId, addTransparency, clearTransparency]);
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    const handleClear = () => {
        if (abortRef.current)
            abortRef.current.abort();
        setMessages([]);
        setIsTyping(false);
        setConversationId('new');
        clearTransparency();
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
    return (_jsxs("div", { className: "gabi-wrapper", onDragOver: onDragOver, onDragLeave: onDragLeave, onDrop: onDrop, onPaste: onPaste, children: [isHoveringDrop && (_jsxs("div", { className: "gabi-drop-overlay", children: [_jsx(DownloadSimple, { size: 48, weight: "duotone" }), _jsx("p", { children: t('gabi.solte_imagens') })] })), _jsxs("header", { className: "gabi-header", children: [_jsxs("div", { className: "gabi-header-left", children: [_jsxs("div", { className: "gabi-avatar-container", children: [_jsx(Sparkle, { weight: "fill", size: 28, color: "#6366f1" }), _jsx("div", { className: "gabi-status-led" })] }), _jsxs("div", { className: "gabi-header-info", children: [_jsx("h2", { children: t('gabi.titulo') }), _jsxs("p", { children: [_jsx("div", { style: { width: 6, height: 6, borderRadius: '50%', background: '#10b981' } }), t('gabi.subtitulo')] })] })] }), _jsxs("div", { className: "gabi-header-actions", children: [messages.length > 0 && (_jsx("button", { className: "gabi-icon-btn", onClick: handleClear, title: t('gabi.limpar_conversa'), children: _jsx(Eraser, { size: 18, weight: "bold" }) })), _jsx("button", { className: "gabi-icon-btn", onClick: onClose, title: t('gabi.fechar'), children: _jsx(X, { size: 18, weight: "bold" }) })] })] }), _jsxs("div", { className: "gabi-chat-body", children: [messages.length === 0 ? (_jsxs("div", { className: "gabi-welcome", children: [_jsx("div", { className: "gabi-welcome-avatar", children: _jsx(Sparkle, { size: 40, weight: "fill" }) }), _jsx("h3", { children: t('gabi.boas_vindas') }), _jsxs("div", { className: "gabi-quick-actions", children: [_jsxs("button", { className: "gabi-quick-btn", onClick: () => handleSend(t('gabi.acao_resumo_crm')), children: [_jsx(ChartBar, { size: 18 }), " ", t('gabi.acao_resumo_crm')] }), _jsxs("button", { className: "gabi-quick-btn", onClick: () => handleSend(t('gabi.acao_explicar_atividades')), children: [_jsx(Sparkle, { size: 18 }), " ", t('gabi.acao_explicar_atividades')] }), _jsxs("button", { className: "gabi-quick-btn", onClick: () => handleSend(t('gabi.acao_clientes_risco')), children: [_jsx(Users, { size: 18 }), " ", t('gabi.acao_clientes_risco')] })] })] })) : (messages.map((msg) => (_jsxs("div", { className: `gabi-message ${msg.role}`, children: [_jsxs("div", { className: "gabi-message-row", children: [_jsx("div", { className: `gabi-avatar-small ${msg.role === 'user' ? 'primary' : ''}`, children: msg.role === 'assistant' ? _jsx(Sparkle, { size: 18, color: "#9ca3af" }) : 'D' }), _jsx("div", { className: "gabi-message-bubble gabi-markdown", children: renderMessageContent(msg.content) })] }), msg.role === 'assistant' && msg.tools_chamadas && msg.tools_chamadas.length > 0 && (_jsxs("div", { className: "gabi-tools-badge", children: [_jsx(Wrench, { size: 12 }), msg.tools_chamadas.map((tc, i) => (_jsxs("span", { className: `gabi-tool-chip ${tc.sucesso ? 'success' : 'error'}`, children: [tc.sucesso ? _jsx(CheckCircle, { size: 10 }) : _jsx(Warning, { size: 10 }), tc.tool_id, _jsxs("span", { className: "gabi-tool-ms", children: [tc.duracao_ms, "ms"] })] }, i))), msg.dados_alterados && (_jsx("span", { className: "gabi-data-changed", children: "dados alterados" }))] })), msg.role === 'assistant' && msg.confirmacoes_pendentes && msg.confirmacoes_pendentes.length > 0 && (_jsx("div", { className: "gabi-confirmacoes", children: msg.confirmacoes_pendentes.map((c) => (_jsxs("div", { className: `gabi-confirmacao-card gabi-confirmacao-${c.classe.toLowerCase()}`, children: [_jsxs("div", { className: "gabi-confirmacao-header", children: [_jsx(ShieldCheck, { size: 16 }), _jsx("span", { className: "gabi-confirmacao-classe", children: c.classe })] }), _jsx("p", { className: "gabi-confirmacao-desc", children: c.descricao_acao }), _jsxs("div", { className: "gabi-confirmacao-actions", children: [_jsxs("button", { className: "gabi-btn-confirmar", onClick: () => handleConfirm(c.nonce, c.tool_id), children: [_jsx(CheckCircle, { size: 14 }), " Confirmar"] }), _jsxs("button", { className: "gabi-btn-cancelar", onClick: () => handleReject(c.nonce), children: [_jsx(XCircle, { size: 14 }), " Cancelar"] })] })] }, c.nonce))) })), _jsxs("div", { className: "gabi-message-footer", children: [_jsx("div", { className: "gabi-timestamp", children: msg.timestamp }), msg.role === 'assistant' && (_jsxs("div", { className: "gabi-feedback", children: [_jsx("button", { className: `gabi-feedback-btn ${msg.feedback === 'positivo' ? 'active' : ''}`, onClick: () => handleFeedback(msg.id, 'positivo'), title: "Resposta util", children: _jsx(ThumbsUp, { size: 12, weight: msg.feedback === 'positivo' ? 'fill' : 'regular' }) }), _jsx("button", { className: `gabi-feedback-btn ${msg.feedback === 'negativo' ? 'active' : ''}`, onClick: () => handleFeedback(msg.id, 'negativo'), title: "Resposta nao ajudou", children: _jsx(ThumbsDown, { size: 12, weight: msg.feedback === 'negativo' ? 'fill' : 'regular' }) })] }))] })] }, msg.id)))), transparencyEvents.length > 0 && (_jsx("div", { className: "gabi-transparency", children: transparencyEvents.map((ev) => (_jsxs("div", { className: "gabi-transparency-item", children: [_jsx(Spinner, { className: "gabi-spin", size: 10 }), _jsx("span", { children: ev.message })] }, ev.id))) })), isTyping && (_jsxs("div", { className: "gabi-thinking-badge", children: [_jsx(Spinner, { className: "gabi-spin", size: 14 }), " ", t('gabi.analisando'), _jsxs("div", { className: "gabi-typing-indicator", children: [_jsx("span", {}), _jsx("span", {}), _jsx("span", {})] })] })), _jsx("div", { ref: chatEndRef })] }), _jsxs("div", { className: "gabi-footer", children: [images.length > 0 && (_jsx("div", { className: "gabi-upload-preview", children: images.map((url, i) => (_jsxs("div", { className: "gabi-thumbnail", children: [_jsx("img", { src: url, alt: "upload thumbnail" }), _jsx("button", { onClick: () => setImages(prev => prev.filter((_, idx) => idx !== i)), children: _jsx(X, { size: 12, weight: "bold" }) })] }, i))) })), _jsxs("div", { className: "gabi-input-wrapper", children: [_jsx("button", { className: "gabi-attach-btn", title: t('gabi.anexar_imagem'), children: _jsx(ImageSquare, { size: 20, weight: "light" }) }), _jsx("textarea", { className: "gabi-textarea-new", placeholder: t('gabi.textarea_placeholder'), rows: 1, value: inputVal, onChange: (e) => {
                                    setInputVal(e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                }, onKeyDown: handleKeyDown }), _jsx("button", { className: "gabi-send-btn", onClick: () => handleSend(), disabled: !inputVal.trim() && images.length === 0, children: _jsx(PaperPlaneRight, { size: 20, weight: "fill" }) })] }), _jsxs("div", { className: "gabi-footer-note", children: [_jsxs("span", { className: "gabi-footer-note-item", children: [_jsx("span", { className: "key", children: "Enter" }), " ", t('gabi.enter_enviar')] }), _jsx("span", { className: "gabi-footer-note-item", children: "\u00B7" }), _jsxs("span", { className: "gabi-footer-note-item", children: [_jsx(ImageIcon, { size: 12 }), " ", t('gabi.cole_imagem')] })] })] })] }));
}
//# sourceMappingURL=Gabi.js.map