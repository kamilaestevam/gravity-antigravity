import { useState, useCallback, useEffect } from 'react';
export function useTablePersistence({ tableId, initialKeys, defaultHiddenKeys = [] }) {
    const storageKey = `gravity-table-cols-${tableId}`;
    const orderKey   = `gravity-table-order-${tableId}`;

    // ── Visibilidade ─────────────────────────────────────────────────────────────

    const loadInitialState = useCallback(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return new Set(parsed);
            }
        } catch (e) {
            console.error('Erro ao carregar colunas visíveis da tabela:', e);
        }
        const visible = initialKeys.filter(k => !defaultHiddenKeys.includes(k));
        return new Set(visible);
    }, [storageKey, initialKeys, defaultHiddenKeys]);

    const [visibleKeys, setVisibleKeys] = useState(loadInitialState);

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(visibleKeys)));
    }, [visibleKeys, storageKey]);

    const toggleVisibility = useCallback((key) => {
        setVisibleKeys(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    }, []);

    const resetToDefault = useCallback(() => {
        const visible = initialKeys.filter(k => !defaultHiddenKeys.includes(k));
        setVisibleKeys(new Set(visible));
        setColumnOrderState([...initialKeys]);
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

    // ── Ordem das colunas ────────────────────────────────────────────────────────

    const loadInitialOrder = useCallback(() => {
        try {
            const saved = localStorage.getItem(orderKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) { /* silent */ }
        return [...initialKeys];
    }, [orderKey, initialKeys]);

    const [columnOrder, setColumnOrderState] = useState(loadInitialOrder);

    useEffect(() => {
        localStorage.setItem(orderKey, JSON.stringify(columnOrder));
    }, [columnOrder, orderKey]);

    const setColumnOrder = useCallback((newOrder) => {
        setColumnOrderState(newOrder);
    }, []);

    return {
        visibleKeys,
        isVisible,
        toggleVisibility,
        resetToDefault,
        setAllVisible,
        clearAllVisible,
        columnOrder,
        setColumnOrder,
    };
}
