/**
 * types.ts — Tipos do domínio BID Frete
 * Skill: antigravity-criar-produto (Passo 1 — shared/types.ts)
 * Alinhado com fragment.prisma — enums e campos.
 */
// ─── Labels para UI ──────────────────────────────────────────────────────────
export const OPERACAO_LABELS = {
    IMPORTACAO: 'Importação',
    EXPORTACAO: 'Exportação',
};
export const MODAL_LABELS = {
    MARITIMO: 'Marítimo',
    AEREO: 'Aéreo',
    RODOVIARIO: 'Rodoviário',
};
export const MODALIDADE_LABELS = {
    FCL: 'FCL',
    LCL: 'LCL',
    AEREO_GERAL: 'Aéreo Geral',
    RODOVIARIO_FTL: 'FTL',
    RODOVIARIO_LTL: 'LTL',
};
export const STATUS_LABELS = {
    RASCUNHO: 'Rascunho',
    ENVIADA_FORNECEDORES: 'Enviada ao fornecedor',
    EM_COTACAO: 'Em cotação',
    AGUARDANDO_APROVACAO: 'Aprovação pendente',
    APROVADA: 'Aprovada',
    REPROVADA: 'Reprovada',
    CANCELADA: 'Cancelada',
    FALTA_INFORMACAO: 'Falta de informação',
    EXPIRADA: 'Expirada',
};
export const STATUS_BADGE = {
    RASCUNHO: 'default',
    ENVIADA_FORNECEDORES: 'info',
    EM_COTACAO: 'info',
    AGUARDANDO_APROVACAO: 'warning',
    APROVADA: 'success',
    REPROVADA: 'danger',
    CANCELADA: 'default',
    FALTA_INFORMACAO: 'warning',
    EXPIRADA: 'default',
};
export const TIPO_FORNECEDOR_LABELS = {
    AGENTE_CARGA: 'Agente de Carga',
    ARMADOR: 'Armador',
    CIA_AEREA: 'Cia Aérea',
    TRANSPORTADORA: 'Transportadora',
};
export const STATUS_FORNECEDOR_LABELS = {
    ATIVO: 'Ativo',
    INATIVO: 'Inativo',
    PENDENTE_APROVACAO: 'Pendente',
    BLOQUEADO: 'Bloqueado',
};
export const CANAL_LABELS = {
    EMAIL: 'Email',
    WHATSAPP: 'WhatsApp',
    API: 'API',
    PORTAL: 'Portal',
};
export const STATUS_BID_LABELS = {
    PENDENTE: 'Pendente',
    ENVIADO: 'Enviado',
    VISUALIZADO: 'Visualizado',
    RESPONDIDO: 'Respondido',
    EXPIRADO: 'Expirado',
    ERRO_ENVIO: 'Erro de envio',
};
export const INCOTERMS = [
    'EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP',
    'FAS', 'FOB', 'CFR', 'CIF',
];
//# sourceMappingURL=types.js.map