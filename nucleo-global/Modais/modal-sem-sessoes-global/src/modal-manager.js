/**
 * @nucleo/modal-sem-sessoes-global — modal-manager
 * Controle de stack de modais empilháveis.
 * State puro sem dependências externas (sem context global, sem Zustand).
 * Usa padrão pub-sub simples para desacoplar abertura de renderização.
 */
// ─── Store interna ────────────────────────────────────────────────────────────
let state = { stack: [] };
const listeners = new Set();
function notificar() {
    listeners.forEach((l) => l({ ...state, stack: [...state.stack] }));
}
// ─── API pública ──────────────────────────────────────────────────────────────
/**
 * Abre um modal empilhando-o no stack.
 * @param id    ID único do modal
 * @param props Props do ModalSemSessoesGlobal (exceto aberto/aoFechar)
 * @param dados Dados opcionais passados ao modal
 */
export function abrirModal(id, props, dados) {
    // Evita duplicata do mesmo id no stack
    const existe = state.stack.some((m) => m.id === id);
    if (existe)
        return;
    state = {
        stack: [...state.stack, { id, props, dados }],
    };
    notificar();
}
/**
 * Fecha e remove o modal com o ID informado.
 */
export function fecharModal(id) {
    state = {
        stack: state.stack.filter((m) => m.id !== id),
    };
    notificar();
}
/**
 * Fecha o modal mais recente do stack (LIFO).
 */
export function fecharUltimoModal() {
    if (state.stack.length === 0)
        return;
    state = {
        stack: state.stack.slice(0, -1),
    };
    notificar();
}
/**
 * Fecha todos os modais abertos.
 */
export function fecharTodosModais() {
    state = { stack: [] };
    notificar();
}
/**
 * Retorna o estado atual do stack.
 */
export function getEstadoModais() {
    return { ...state, stack: [...state.stack] };
}
/**
 * Verifica se o modal com o ID informado está aberto.
 */
export function isModalAberto(id) {
    return state.stack.some((m) => m.id === id);
}
/**
 * Inscreve um listener para mudanças no stack.
 * Retorna função de cancelamento (unsubscribe).
 */
export function subscribeModais(listener) {
    listeners.add(listener);
    // Chama imediatamente com estado atual
    listener({ ...state, stack: [...state.stack] });
    return () => listeners.delete(listener);
}
