import { useState, useCallback, useEffect } from 'react';
export function useTablePersistence({ tableId, initialKeys, defaultHiddenKeys = [] }) {
    const storageKey = `gravity-table-cols-${tableId}`;
    // Carrega as chaves visíveis do localStorage ou usa as padrões
    const loadInitialState = useCallback(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    return new Set(parsed);
                }
            }
        }
        catch (e) {
            console.error('Erro ao carregar colunas visíveis da tabela:', e);
        }
        // Se não houver nada salvo, usa as iniciais excluindo as padrões ocultas
        const visible = initialKeys.filter(k => !defaultHiddenKeys.includes(k));
        return new Set(visible);
    }, [storageKey, initialKeys, defaultHiddenKeys]);
    const [visibleKeys, setVisibleKeys] = useState(loadInitialState);
    // Salva no localStorage sempre que as chaves visíveis mudarem
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(visibleKeys)));
    }, [visibleKeys, storageKey]);
    const toggleVisibility = useCallback((key) => {
        setVisibleKeys(prev => {
            const next = new Set(prev);
            if (next.has(key)) {
                // Pelo menos uma coluna deve permanecer visível? 
                // Vamos permitir ocultar todas por enquanto se o usuário quiser, 
                // mas o Switch geralmente impede.
                next.delete(key);
            }
            else {
                next.add(key);
            }
            return next;
        });
    }, []);
    const resetToDefault = useCallback(() => {
        const visible = initialKeys.filter(k => !defaultHiddenKeys.includes(k));
        setVisibleKeys(new Set(visible));
    }, [initialKeys, defaultHiddenKeys]);
    const setAllVisible = useCallback(() => {
        setVisibleKeys(new Set(initialKeys));
    }, [initialKeys]);
    const clearAllVisible = useCallback(() => {
        setVisibleKeys(new Set());
    }, []);
    const isVisible = useCallback((key) => {
        return visibleKeys.has(key);
    }, [visibleKeys]);
    return {
        visibleKeys,
        isVisible,
        toggleVisibility,
        resetToDefault,
        setAllVisible,
        clearAllVisible
    };
}
