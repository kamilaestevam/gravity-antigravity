import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * NovaCotacao.tsx — Wizard de Nova Cotação (T7)
 * Redesenhado para UX 10/10 com visual premium, glassmorphism, micro-animações,
 * cards ricos em descrição, painel inteligente de Incoterms e resumo visual avançado.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Truck, ArrowLeft, ArrowRight, Check, Anchor, AirplaneTilt, Van, Package, MapPin, Scales, Users, FileText, CheckCircle, Info, X, } from '@phosphor-icons/react';
import { criarCotacao } from '../shared/api';
import { OPERACAO_LABELS, MODAL_LABELS, MODALIDADE_LABELS, INCOTERMS, } from '../shared/types';
// ─── Passos do wizard ─────────────────────────────────────────────────────────
const STEPS = [
    { id: 1, label: 'Modal e Operação', icone: _jsx(Truck, { weight: "duotone", size: 16 }) },
    { id: 2, label: 'Origem', icone: _jsx(MapPin, { weight: "duotone", size: 16 }) },
    { id: 3, label: 'Destino', icone: _jsx(MapPin, { weight: "duotone", size: 16 }) },
    { id: 4, label: 'Carga', icone: _jsx(Package, { weight: "duotone", size: 16 }) },
    { id: 5, label: 'Incoterm', icone: _jsx(Scales, { weight: "duotone", size: 16 }) },
    { id: 6, label: 'Fornecedores', icone: _jsx(Users, { weight: "duotone", size: 16 }) },
    { id: 7, label: 'Resumo', icone: _jsx(FileText, { weight: "duotone", size: 16 }) },
];
const INITIAL_FORM = {
    tipo_operacao: '',
    modal: '',
    modalidade: '',
    origem_codigo: '',
    origem_nome: '',
    origem_pais: '',
    destino_codigo: '',
    destino_nome: '',
    destino_pais: '',
    descricao_mercadoria: '',
    ncm: '',
    quantidade: 1,
    tipo_container: '',
    peso_kg: '',
    cubagem_m3: '',
    incoterm: '',
    cep_destino: '',
    prazo_resposta: '',
    visibilidade: 'DIRECIONADA',
    anonima: false,
    valor_alvo: '',
    moeda_alvo: 'USD',
};
// ─── Descrições Enriquecidas de Opções ──────────────────────────────────────
const OPERACAO_DESCS = {
    IMPORTACAO: 'Trazer cargas de outros países para o território nacional.',
    EXPORTACAO: 'Enviar produtos nacionais para compradores internacionais.',
};
const MODAL_DESCS = {
    MARITIMO: 'Grandes volumes por vias oceânicas com custo altamente otimizado.',
    AEREO: 'Agilidade máxima e trânsito expresso para mercadorias críticas.',
    RODOVIARIO: 'Transporte flexível, direto e porta-a-porta por rodovias.',
};
const MODALIDADE_DESCS = {
    FCL: 'Container completo e exclusivo para acomodar suas mercadorias.',
    LCL: 'Carga fracionada. Pague somente pelo volume que ocupar no container.',
    AEREO_GERAL: 'Envio aéreo padrão para cargas gerais em compartimentos dedicados.',
    RODOVIARIO_FTL: 'Caminhão inteiro e exclusivo dedicado para a sua logística.',
    RODOVIARIO_LTL: 'Carga rodoviária fracionada consolidada com outros embarques.',
};
// ─── Dicionário de Incoterms (UX Helper) ──────────────────────────────────
const INCOTERM_EXPLANATIONS = {
    EXW: {
        title: 'EXW — Ex Works (Na Origem)',
        desc: 'O comprador assume todos os custos e riscos a partir do estabelecimento do vendedor (coleta, porto de origem, frete internacional e taxas).',
        responsabilidade: 'Comprador assume 100% da cadeia logística.'
    },
    FCA: {
        title: 'FCA — Free Carrier (Franco Transportador)',
        desc: 'O vendedor realiza o desembaraço de exportação e entrega a carga no local/transportador indicado na origem pelo comprador.',
        responsabilidade: 'Vendedor desembaraça na origem; comprador assume a partir da entrega ao transportador.'
    },
    CPT: {
        title: 'CPT — Carriage Paid To (Transporte Pago Até)',
        desc: 'O vendedor contrata e paga o frete principal até o ponto acordado. Porém, os riscos passam ao comprador na entrega ao primeiro transportador.',
        responsabilidade: 'Custos com o vendedor; riscos de perda ou dano com o comprador durante o transporte.'
    },
    CIP: {
        title: 'CIP — Carriage and Insurance Paid To (Transporte e Seguro Pagos Até)',
        desc: 'Idêntico ao CPT, mas o vendedor é responsável por contratar e pagar um seguro de transporte contra perda ou dano da carga.',
        responsabilidade: 'Custos e seguro com o vendedor; riscos com o comprador a partir da origem.'
    },
    DAP: {
        title: 'DAP — Delivered At Place (Entregue no Local)',
        desc: 'O vendedor assume riscos e fretes até a chegada no local de destino acordado (antes da descarga). O comprador faz a importação e descarga.',
        responsabilidade: 'Vendedor assume frete internacional até o destino; comprador faz desembaraço de importação.'
    },
    DPU: {
        title: 'DPU — Delivered at Place Unloaded (Entregue no Local Descarregado)',
        desc: 'O vendedor entrega a mercadoria descarregada do meio de transporte no local indicado. Substitui o antigo DAT.',
        responsabilidade: 'Vendedor assume o transporte e a descarga no destino; comprador faz o desembaraço.'
    },
    DDP: {
        title: 'DDP — Delivered Duty Paid (Entregue com Direitos Pagos)',
        desc: 'O vendedor assume todos os custos e riscos da operação até a entrega no destino do comprador, incluindo tarifas alfandegárias de importação.',
        responsabilidade: 'Vendedor assume 100% da logística e impostos de importação.'
    },
    FAS: {
        title: 'FAS — Free Alongside Ship (Livre ao Lado do Navio)',
        desc: 'O vendedor coloca a mercadoria ao lado do navio do comprador no porto de embarque indicado. Risco passa na linha de cais.',
        responsabilidade: 'Exclusivo para modal marítimo/fluvial. Comprador contrata frete internacional.'
    },
    FOB: {
        title: 'FOB — Free On Board (Livre a Bordo)',
        desc: 'O vendedor entrega a carga a bordo do navio indicado pelo comprador no porto de embarque designado. O risco passa quando a carga está a bordo.',
        responsabilidade: 'Exclusivo para modal marítimo. Custos de embarque de origem com o vendedor; frete com o comprador.'
    },
    CFR: {
        title: 'CFR — Cost and Freight (Custo e Frete)',
        desc: 'O vendedor paga os custos e frete marítimo até o porto de destino. Os riscos de perda são transferidos ao comprador no embarque.',
        responsabilidade: 'Exclusivo para marítimo. Frete pago pelo vendedor; seguro internacional é opcional do comprador.'
    },
    CIF: {
        title: 'CIF — Cost, Insurance and Freight (Custo, Seguro e Frete)',
        desc: 'O vendedor paga custos, frete internacional e contrata seguro marítimo até o porto de destino designado. Riscos transferem no embarque.',
        responsabilidade: 'Exclusivo para marítimo. Frete e seguro básico com o vendedor; riscos com o comprador.'
    }
};
// ─── Premium Option Button ──────────────────────────────────────────────────
function OptionButton({ selected, onClick, icon, label, description, }) {
    return (_jsxs("button", { type: "button", className: `nc-option-btn ${selected ? 'nc-option-btn--selected' : ''}`, onClick: onClick, children: [_jsx("span", { className: "nc-option-icon", children: icon }), _jsxs("div", { className: "nc-option-text", children: [_jsx("span", { className: "nc-option-label", children: label }), description && _jsx("span", { className: "nc-option-desc", children: description })] })] }));
}
// ─── Input Field ─────────────────────────────────────────────────────────────
function Field({ label, required, children, }) {
    return (_jsxs("div", { className: "nc-field", children: [_jsxs("label", { className: "nc-field-label", children: [label, required && _jsx("span", { style: { color: 'var(--danger, #ef4444)' }, children: " *" })] }), children] }));
}
// ─── Componente Principal ────────────────────────────────────────────────────
export default function NovaCotacao() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState(INITIAL_FORM);
    const [salvando, setSalvando] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    const [cotacaoId, setCotacaoId] = useState(null);
    const stepStatus = (passoId) => {
        if (passoId < step)
            return 'feito';
        if (passoId === step)
            return 'ativo';
        return 'pendente';
    };
    const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
    const canNext = () => {
        switch (step) {
            case 1: return !!form.tipo_operacao && !!form.modal && !!form.modalidade;
            case 2: return !!form.origem_codigo && !!form.origem_nome;
            case 3: return !!form.destino_codigo && !!form.destino_nome;
            case 4: return !!form.descricao_mercadoria && form.quantidade > 0;
            case 5: return !!form.incoterm;
            case 6: return true;
            case 7: return true;
            default: return false;
        }
    };
    const handleSubmit = async () => {
        setSalvando(true);
        try {
            const cotacao = await criarCotacao({
                tipo_operacao: form.tipo_operacao,
                modal: form.modal,
                modalidade: form.modalidade,
                origem_codigo: form.origem_codigo,
                origem_nome: form.origem_nome,
                origem_pais: form.origem_pais,
                destino_codigo: form.destino_codigo,
                destino_nome: form.destino_nome,
                destino_pais: form.destino_pais,
                descricao_mercadoria: form.descricao_mercadoria,
                ncm: form.ncm || undefined,
                quantidade: form.quantidade,
                tipo_container: form.tipo_container || undefined,
                peso_kg: form.peso_kg ? parseFloat(form.peso_kg) : undefined,
                cubagem_m3: form.cubagem_m3 ? parseFloat(form.cubagem_m3) : undefined,
                incoterm: form.incoterm,
                cep_destino: form.cep_destino || undefined,
                visibilidade: form.visibilidade,
                anonima: form.anonima,
                valor_alvo: form.valor_alvo ? parseFloat(form.valor_alvo) : undefined,
                moeda_alvo: form.moeda_alvo,
            });
            setCotacaoId(cotacao.id);
            setSucesso(true);
        }
        catch {
            // erro tratado
        }
        finally {
            setSalvando(false);
        }
    };
    // ─── Step Content ─────────────────────────────────────────────────────
    const renderStep = () => {
        switch (step) {
            // STEP 1 — Modal e Operação
            case 1:
                return (_jsxs("div", { className: "nc-step-content", children: [_jsx("h3", { className: "nc-section-title", children: t('bidfrete.nova_cotacao.tipo_operacao') }), _jsx("div", { className: "nc-options-grid-2", children: ['IMPORTACAO', 'EXPORTACAO'].map(op => (_jsx(OptionButton, { selected: form.tipo_operacao === op, onClick: () => {
                                    set('tipo_operacao', op);
                                }, icon: op === 'IMPORTACAO' ? _jsx(ArrowLeft, { weight: "duotone", size: 24 }) : _jsx(ArrowRight, { weight: "duotone", size: 24 }), label: OPERACAO_LABELS[op], description: OPERACAO_DESCS[op] }, op))) }), _jsx("h3", { className: "nc-section-title", children: t('bidfrete.nova_cotacao.modal_frete') }), _jsxs("div", { className: "nc-options-grid-3", children: [_jsx(OptionButton, { selected: form.modal === 'MARITIMO', onClick: () => {
                                        set('modal', 'MARITIMO');
                                        set('modalidade', ''); // reseta para forçar escolha limpa
                                    }, icon: _jsx(Anchor, { weight: "duotone", size: 28 }), label: "Mar\u00EDtimo", description: MODAL_DESCS.MARITIMO }), _jsx(OptionButton, { selected: form.modal === 'AEREO', onClick: () => {
                                        set('modal', 'AEREO');
                                        set('modalidade', '');
                                    }, icon: _jsx(AirplaneTilt, { weight: "duotone", size: 28 }), label: "A\u00E9reo", description: MODAL_DESCS.AEREO }), _jsx(OptionButton, { selected: form.modal === 'RODOVIARIO', onClick: () => {
                                        set('modal', 'RODOVIARIO');
                                        set('modalidade', '');
                                    }, icon: _jsx(Van, { weight: "duotone", size: 28 }), label: "Rodovi\u00E1rio", description: MODAL_DESCS.RODOVIARIO })] }), _jsx("h3", { className: "nc-section-title", children: t('bidfrete.nova_cotacao.modalidade') }), _jsxs("div", { className: "nc-options-grid-2", children: [form.modal === 'MARITIMO' && (_jsxs(_Fragment, { children: [_jsx(OptionButton, { selected: form.modalidade === 'FCL', onClick: () => set('modalidade', 'FCL'), icon: _jsx(Package, { weight: "duotone", size: 22 }), label: "FCL \u2014 Container Completo", description: MODALIDADE_DESCS.FCL }), _jsx(OptionButton, { selected: form.modalidade === 'LCL', onClick: () => set('modalidade', 'LCL'), icon: _jsx(Package, { weight: "duotone", size: 22 }), label: "LCL \u2014 Carga Fracionada", description: MODALIDADE_DESCS.LCL })] })), form.modal === 'AEREO' && (_jsx("div", { style: { gridColumn: 'span 2' }, children: _jsx(OptionButton, { selected: form.modalidade === 'AEREO_GERAL', onClick: () => set('modalidade', 'AEREO_GERAL'), icon: _jsx(AirplaneTilt, { weight: "duotone", size: 22 }), label: "A\u00E9reo Geral", description: MODALIDADE_DESCS.AEREO_GERAL }) })), form.modal === 'RODOVIARIO' && (_jsxs(_Fragment, { children: [_jsx(OptionButton, { selected: form.modalidade === 'RODOVIARIO_FTL', onClick: () => set('modalidade', 'RODOVIARIO_FTL'), icon: _jsx(Van, { weight: "duotone", size: 22 }), label: "FTL \u2014 Carga Completa", description: MODALIDADE_DESCS.RODOVIARIO_FTL }), _jsx(OptionButton, { selected: form.modalidade === 'RODOVIARIO_LTL', onClick: () => set('modalidade', 'RODOVIARIO_LTL'), icon: _jsx(Van, { weight: "duotone", size: 22 }), label: "LTL \u2014 Carga Fracionada", description: MODALIDADE_DESCS.RODOVIARIO_LTL })] })), !form.modal && (_jsxs("div", { className: "nc-empty-hint", children: [_jsx(Info, { size: 18, weight: "duotone" }), _jsx("p", { children: t('bidfrete.nova_cotacao.selecionar_modal_primeiro') })] }))] })] }));
            // STEP 2 — Origem
            case 2:
                return (_jsx("div", { className: "nc-step-content", children: _jsxs("div", { className: "nc-location-visual-card nc-location-visual-card--origin", children: [_jsxs("div", { className: "nc-location-visual-header", children: [_jsx("div", { className: "nc-location-visual-circle", children: _jsx(MapPin, { weight: "duotone", size: 26, className: "nc-pulsing-icon" }) }), _jsxs("div", { className: "nc-location-visual-text", children: [_jsx("h4", { children: t('bidfrete.nova_cotacao.porto_origem') }), _jsx("p", { children: "Informe o local de coleta ou porto de origem de partida internacional." })] })] }), _jsxs("div", { className: "nc-fields-grid nc-fields-grid--location", children: [_jsx(Field, { label: t('bidfrete.nova_cotacao.codigo_locode'), required: true, children: _jsx("input", { className: "nc-input", placeholder: "Ex: CNSHA", value: form.origem_codigo, onChange: e => set('origem_codigo', e.target.value.toUpperCase()) }) }), _jsx(Field, { label: t('bidfrete.nova_cotacao.nome'), required: true, children: _jsx("input", { className: "nc-input", placeholder: "Ex: Shanghai", value: form.origem_nome, onChange: e => set('origem_nome', e.target.value) }) }), _jsx(Field, { label: t('bidfrete.nova_cotacao.pais'), children: _jsx("input", { className: "nc-input", placeholder: "Ex: China", value: form.origem_pais, onChange: e => set('origem_pais', e.target.value) }) })] })] }) }));
            // STEP 3 — Destino
            case 3:
                return (_jsx("div", { className: "nc-step-content", children: _jsxs("div", { className: "nc-location-visual-card nc-location-visual-card--destination", children: [_jsxs("div", { className: "nc-location-visual-header", children: [_jsx("div", { className: "nc-location-visual-circle", children: _jsx(MapPin, { weight: "duotone", size: 26, className: "nc-pulsing-icon-dest" }) }), _jsxs("div", { className: "nc-location-visual-text", children: [_jsx("h4", { children: t('bidfrete.nova_cotacao.porto_destino') }), _jsx("p", { children: "Defina o local de entrega final ou porto de destino de chegada." })] })] }), _jsxs("div", { className: "nc-fields-grid nc-fields-grid--location", children: [_jsx(Field, { label: t('bidfrete.nova_cotacao.codigo_locode'), required: true, children: _jsx("input", { className: "nc-input", placeholder: "Ex: BRSSZ", value: form.destino_codigo, onChange: e => set('destino_codigo', e.target.value.toUpperCase()) }) }), _jsx(Field, { label: t('bidfrete.nova_cotacao.nome'), required: true, children: _jsx("input", { className: "nc-input", placeholder: "Ex: Santos", value: form.destino_nome, onChange: e => set('destino_nome', e.target.value) }) }), _jsx(Field, { label: t('bidfrete.nova_cotacao.pais'), children: _jsx("input", { className: "nc-input", placeholder: "Ex: Brasil", value: form.destino_pais, onChange: e => set('destino_pais', e.target.value) }) })] })] }) }));
            // STEP 4 — Carga
            case 4:
                return (_jsxs("div", { className: "nc-step-content", children: [_jsx("h3", { className: "nc-section-title", children: t('bidfrete.nova_cotacao.dados_mercadoria') }), _jsxs("div", { className: "nc-fields-grid nc-fields-grid--cargo", children: [_jsx("div", { style: { gridColumn: 'span 2' }, children: _jsx(Field, { label: t('bidfrete.nova_cotacao.descricao_mercadoria'), required: true, children: _jsx("input", { className: "nc-input", placeholder: "Ex: Pe\u00E7as automotivas, eletr\u00F4nicos industriais...", value: form.descricao_mercadoria, onChange: e => set('descricao_mercadoria', e.target.value) }) }) }), _jsx(Field, { label: t('bidfrete.nova_cotacao.ncm'), children: _jsx("input", { className: "nc-input", placeholder: "Ex: 87089990", value: form.ncm, onChange: e => set('ncm', e.target.value.replace(/\D/g, '').slice(0, 8)) }) }), _jsx(Field, { label: t('bidfrete.nova_cotacao.quantidade'), required: true, children: _jsxs("div", { className: "nc-input-group", children: [_jsx("input", { className: "nc-input nc-input--with-suffix", type: "number", min: 1, value: form.quantidade, onChange: e => set('quantidade', parseInt(e.target.value) || 1) }), _jsx("span", { className: "nc-input-suffix", children: "un" })] }) }), form.modal === 'MARITIMO' && (_jsx(Field, { label: t('bidfrete.nova_cotacao.tipo_container'), children: _jsx("input", { className: "nc-input", placeholder: "Ex: 40' HC", value: form.tipo_container, onChange: e => set('tipo_container', e.target.value) }) })), _jsx(Field, { label: t('bidfrete.nova_cotacao.peso_kg'), children: _jsxs("div", { className: "nc-input-group", children: [_jsx("input", { className: "nc-input nc-input--with-suffix", type: "number", placeholder: "Ex: 12000", value: form.peso_kg, onChange: e => set('peso_kg', e.target.value) }), _jsx("span", { className: "nc-input-suffix", children: "Kg" })] }) }), _jsx(Field, { label: t('bidfrete.nova_cotacao.cubagem_m3'), children: _jsxs("div", { className: "nc-input-group", children: [_jsx("input", { className: "nc-input nc-input--with-suffix", type: "number", placeholder: "Ex: 33.2", value: form.cubagem_m3, onChange: e => set('cubagem_m3', e.target.value) }), _jsx("span", { className: "nc-input-suffix", children: "m\u00B3" })] }) })] })] }));
            // STEP 5 — Incoterm
            case 5: {
                const explanation = form.incoterm ? INCOTERM_EXPLANATIONS[form.incoterm] : null;
                return (_jsxs("div", { className: "nc-step-content", children: [_jsx("h3", { className: "nc-section-title", children: t('bidfrete.nova_cotacao.incoterm') }), _jsx("div", { className: "nc-incoterm-grid", children: INCOTERMS.map(inc => (_jsx("button", { type: "button", className: `nc-incoterm-btn ${form.incoterm === inc ? 'nc-incoterm-btn--selected' : ''}`, onClick: () => set('incoterm', inc), children: inc }, inc))) }), explanation && (_jsxs("div", { className: "nc-incoterm-helper-card nc-fade-in", children: [_jsxs("div", { className: "nc-helper-header", children: [_jsx(Scales, { size: 20, weight: "duotone", className: "nc-helper-icon" }), _jsx("h4", { children: explanation.title })] }), _jsx("p", { className: "nc-helper-desc", children: explanation.desc }), _jsxs("div", { className: "nc-helper-footer", children: [_jsx("strong", { children: "Responsabilidade:" }), " ", explanation.responsabilidade] })] })), form.incoterm === 'EXW' && (_jsx("div", { style: { marginTop: '1.25rem' }, className: "nc-fade-in", children: _jsx(Field, { label: t('bidfrete.nova_cotacao.cep_coleta'), required: true, children: _jsx("input", { className: "nc-input", placeholder: "Ex: 01310-100", value: form.cep_destino, onChange: e => set('cep_destino', e.target.value) }) }) })), _jsx("div", { className: "nc-fields-grid", style: { marginTop: '1.5rem' }, children: _jsx(Field, { label: t('bidfrete.nova_cotacao.prazo_respostas'), children: _jsx("input", { className: "nc-input nc-input--date", type: "datetime-local", value: form.prazo_resposta, onChange: e => set('prazo_resposta', e.target.value) }) }) })] }));
            }
            // STEP 6 — Fornecedores
            case 6:
                return (_jsxs("div", { className: "nc-step-content", children: [_jsx("h3", { className: "nc-section-title", children: t('bidfrete.nova_cotacao.visibilidade') }), _jsxs("div", { className: "nc-visibilidade-grid", children: [_jsxs("button", { type: "button", className: `nc-vis-card ${form.visibilidade === 'DIRECIONADA' ? 'nc-vis-card--selected' : ''}`, onClick: () => set('visibilidade', 'DIRECIONADA'), children: [_jsx("div", { className: "nc-vis-icon-wrap", children: _jsx(Users, { weight: "duotone", size: 24 }) }), _jsxs("div", { className: "nc-vis-info", children: [_jsx("span", { className: "nc-vis-title", children: t('bidfrete.nova_cotacao.direcionada_label') }), _jsx("span", { className: "nc-vis-desc", children: t('bidfrete.nova_cotacao.hint_direcionada') })] })] }), _jsxs("button", { type: "button", className: `nc-vis-card ${form.visibilidade === 'ABERTA' ? 'nc-vis-card--selected' : ''}`, onClick: () => set('visibilidade', 'ABERTA'), children: [_jsx("div", { className: "nc-vis-icon-wrap", children: _jsx(Users, { weight: "duotone", size: 24 }) }), _jsxs("div", { className: "nc-vis-info", children: [_jsx("span", { className: "nc-vis-title", children: t('bidfrete.nova_cotacao.aberta_label') }), _jsx("span", { className: "nc-vis-desc", children: t('bidfrete.nova_cotacao.hint_aberta') })] })] })] }), _jsx("div", { className: "nc-switch-row", children: _jsxs("label", { className: "nc-switch-label", children: [_jsxs("div", { className: "nc-switch-text", children: [_jsx("span", { className: "nc-switch-title", children: t('bidfrete.nova_cotacao.anonima_label') }), _jsx("span", { className: "nc-switch-desc", children: "Ocultar o nome da sua empresa no mercado inicial de lances para total confidencialidade." })] }), _jsxs("div", { className: "nc-switch", children: [_jsx("input", { type: "checkbox", checked: form.anonima, onChange: e => set('anonima', e.target.checked) }), _jsx("span", { className: "nc-switch-slider" })] })] }) })] }));
            // STEP 7 — Resumo
            case 7:
                return (_jsxs("div", { className: "nc-step-content", children: [_jsx("h3", { className: "nc-section-title", children: t('bidfrete.nova_cotacao.resumo_cotacao') }), _jsxs("div", { className: "nc-fields-grid nc-fields-grid--summary-inputs", children: [_jsx(Field, { label: t('bidfrete.nova_cotacao.valor_alvo'), children: _jsx("input", { className: "nc-input", type: "number", placeholder: "Ex: 5000", value: form.valor_alvo, onChange: e => set('valor_alvo', e.target.value) }) }), _jsx(Field, { label: t('bidfrete.nova_cotacao.moeda'), children: _jsxs("select", { className: "nc-input", value: form.moeda_alvo, onChange: e => set('moeda_alvo', e.target.value), children: [_jsx("option", { value: "USD", children: "USD ($)" }), _jsx("option", { value: "BRL", children: "BRL (R$)" }), _jsx("option", { value: "EUR", children: "EUR (\u20AC)" })] }) })] }), _jsxs("div", { className: "nc-receipt-card", children: [_jsxs("div", { className: "nc-receipt-header", children: [_jsx("span", { className: "nc-receipt-badge", children: form.tipo_operacao ? OPERACAO_LABELS[form.tipo_operacao] : '—' }), _jsxs("span", { className: "nc-receipt-modal", children: [form.modal ? MODAL_LABELS[form.modal] : '—', " / ", form.modalidade ? MODALIDADE_LABELS[form.modalidade] : '—'] })] }), _jsxs("div", { className: "nc-route-timeline", children: [_jsxs("div", { className: "nc-timeline-node", children: [_jsx("div", { className: "nc-node-dot nc-node-dot--origin" }), _jsxs("div", { className: "nc-node-text", children: [_jsx("span", { className: "nc-node-code", children: form.origem_codigo || '—' }), _jsxs("span", { className: "nc-node-name", children: [form.origem_nome || '—', form.origem_pais ? `, ${form.origem_pais}` : ''] })] })] }), _jsxs("div", { className: "nc-timeline-line", children: [_jsxs("div", { className: "nc-timeline-icon-wrap", children: [form.modal === 'MARITIMO' && _jsx(Anchor, { weight: "duotone", size: 16 }), form.modal === 'AEREO' && _jsx(AirplaneTilt, { weight: "duotone", size: 16 }), form.modal === 'RODOVIARIO' && _jsx(Van, { weight: "duotone", size: 16 }), !form.modal && _jsx(Truck, { weight: "duotone", size: 16 })] }), _jsx("div", { className: "nc-timeline-line-fill" })] }), _jsxs("div", { className: "nc-timeline-node", children: [_jsx("div", { className: "nc-node-dot nc-node-dot--destination" }), _jsxs("div", { className: "nc-node-text", children: [_jsx("span", { className: "nc-node-code", children: form.destino_codigo || '—' }), _jsxs("span", { className: "nc-node-name", children: [form.destino_nome || '—', form.destino_pais ? `, ${form.destino_pais}` : ''] })] })] })] }), _jsxs("div", { className: "nc-receipt-details", children: [_jsxs("div", { className: "nc-receipt-row", children: [_jsx("span", { className: "nc-receipt-label", children: t('bidfrete.nova_cotacao.resumo_mercadoria') }), _jsx("span", { className: "nc-receipt-value", children: form.descricao_mercadoria || '—' })] }), form.ncm && (_jsxs("div", { className: "nc-receipt-row", children: [_jsx("span", { className: "nc-receipt-label", children: t('bidfrete.nova_cotacao.resumo_ncm') }), _jsx("span", { className: "nc-receipt-value font-mono", children: form.ncm })] })), _jsxs("div", { className: "nc-receipt-row", children: [_jsx("span", { className: "nc-receipt-label", children: t('bidfrete.nova_cotacao.resumo_qtd_peso') }), _jsxs("span", { className: "nc-receipt-value", children: [form.quantidade, " un ", form.peso_kg ? `| ${form.peso_kg} Kg` : '', " ", form.cubagem_m3 ? `| ${form.cubagem_m3} m³` : ''] })] }), _jsxs("div", { className: "nc-receipt-row", children: [_jsx("span", { className: "nc-receipt-label", children: t('bidfrete.nova_cotacao.resumo_incoterm') }), _jsx("span", { className: "nc-receipt-value nc-receipt-value--incoterm", children: form.incoterm || '—' })] }), _jsxs("div", { className: "nc-receipt-row", children: [_jsx("span", { className: "nc-receipt-label", children: t('bidfrete.nova_cotacao.resumo_visibilidade') }), _jsxs("span", { className: "nc-receipt-value", children: [form.visibilidade === 'ABERTA' ? 'Aberta' : 'Direcionada', form.anonima ? ' (Anônima)' : ''] })] })] })] })] }));
            default:
                return null;
        }
    };
    // ─── Sucesso ──────────────────────────────────────────────────────────
    if (sucesso) {
        const handleOverlayClick = (e) => {
            if (e.target === e.currentTarget) {
                navigate('/cotacoes');
            }
        };
        return (_jsx("div", { className: "nc-modal-overlay", onClick: handleOverlayClick, children: _jsxs("div", { className: "nc-modal-container nc-fade-in", style: { maxWidth: '520px', padding: '3rem 2rem' }, onClick: e => e.stopPropagation(), children: [_jsx("button", { className: "nc-modal-close", onClick: () => navigate('/cotacoes'), "aria-label": "Fechar", children: _jsx(X, { weight: "bold", size: 20 }) }), _jsxs("div", { className: "nc-sucesso nc-fade-in", children: [_jsx("div", { className: "nc-sucesso-badge", children: _jsx(CheckCircle, { weight: "duotone", size: 72, style: { color: 'var(--success, #10b981)' } }) }), _jsx("h2", { className: "nc-sucesso-title", children: t('bidfrete.nova_cotacao.criado_sucesso') }), _jsx("p", { className: "nc-sucesso-desc", children: t('bidfrete.nova_cotacao.criado_desc') }), _jsxs("div", { className: "nc-sucesso-actions", children: [_jsx("button", { className: "nc-btn nc-btn--secondary", onClick: () => navigate('/cotacoes'), children: t('bidfrete.nova_cotacao.ver_cotacoes') }), cotacaoId && _jsx("button", { className: "nc-btn nc-btn--primary", onClick: () => navigate(`/cotacoes/${cotacaoId}`), children: t('bidfrete.nova_cotacao.ver_detalhes') })] })] })] }) }));
    }
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            navigate('/cotacoes');
        }
    };
    // ─── Render principal ──────────────────────────────────────────────────
    return (_jsxs("div", { className: "nc-modal-overlay", onClick: handleOverlayClick, children: [_jsxs("div", { className: "nc-modal-container nc-fade-in", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "nc-modal-header", children: [_jsxs("div", { className: "nc-modal-header-left", children: [_jsx("div", { className: "nc-modal-header-icon-wrap", children: _jsx(Truck, { weight: "duotone", size: 22 }) }), _jsxs("div", { children: [_jsx("h2", { className: "nc-modal-title", children: "Nova Cota\u00E7\u00E3o" }), _jsx("p", { className: "nc-modal-subtitle", children: "Preencha as informa\u00E7\u00F5es para buscar as melhores op\u00E7\u00F5es de frete" })] })] }), _jsxs("div", { className: "nc-modal-header-step-badge", children: ["Etapa ", step, " de 7 \u2022 ", _jsx("span", { className: "nc-modal-header-step-name", children: STEPS[step - 1].label })] }), _jsx("button", { className: "nc-modal-close", onClick: () => navigate('/cotacoes'), "aria-label": "Fechar", children: _jsx(X, { weight: "bold", size: 20 }) })] }), _jsx("div", { className: "nc-stepper-container", children: _jsx("div", { className: "mpg-stepper", role: "list", "aria-label": "Passos", children: STEPS.map((passo, idx) => {
                                const status = stepStatus(passo.id);
                                const isClickable = status === 'feito';
                                return (_jsxs(React.Fragment, { children: [_jsxs("div", { className: `mpg-passo ${isClickable ? 'mpg-passo-feito' : ''}`, role: "listitem", "aria-current": status === 'ativo' ? 'step' : undefined, onClick: isClickable ? () => setStep(passo.id) : undefined, title: isClickable ? `Voltar para: ${passo.label}` : undefined, style: { cursor: isClickable ? 'pointer' : 'default' }, children: [_jsxs("div", { className: "mpg-circulo-wrap", children: [_jsx("div", { className: `mpg-circulo ${status === 'ativo' ? 'mpg-circulo-ativo' :
                                                                status === 'feito' ? 'mpg-circulo-feito' : 'mpg-circulo-pendente'}`, children: status === 'feito' ? (_jsx("span", { className: "mpg-check-icon", children: _jsx(Check, { size: 14, weight: "bold" }) })) : (passo.icone ?? passo.id) }), status === 'ativo' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mpg-orbita-3d", "aria-hidden": "true", children: [_jsxs("div", { className: "mpg-orbita-ring mpg-orbita-ring--1", children: [_jsx("div", { className: "mpg-orbita-anel" }), _jsx("div", { className: "mpg-orbita-eletron mpg-orbita-eletron--1" })] }), _jsxs("div", { className: "mpg-orbita-ring mpg-orbita-ring--2", children: [_jsx("div", { className: "mpg-orbita-anel" }), _jsx("div", { className: "mpg-orbita-eletron mpg-orbita-eletron--2" })] })] }), _jsx("div", { className: "mpg-nucleo-glow", "aria-hidden": "true" })] }))] }), _jsx("span", { className: `mpg-label ${status === 'ativo' ? 'mpg-label-ativo' :
                                                        status === 'feito' ? 'mpg-label-feito' : ''}`, children: passo.label })] }), idx < STEPS.length - 1 && (_jsx("div", { className: "mpg-conector", "aria-hidden": "true", children: _jsx("div", { className: "mpg-conector-fill", style: { width: status === 'feito' ? '100%' : '0%' } }) }))] }, passo.id));
                            }) }) }), _jsx("div", { className: "nc-modal-body", children: _jsx("div", { className: "nc-step-wrapper nc-fade-in", children: renderStep() }, step) }), _jsxs("div", { className: "nc-footer", children: [step === 1 ? (_jsx("button", { type: "button", className: "nc-btn nc-btn--secondary nc-btn-cancelar", onClick: () => navigate('/cotacoes'), children: "Cancelar" })) : (_jsxs("button", { type: "button", className: "nc-btn nc-btn--secondary nc-btn--navigation", onClick: () => setStep(s => s - 1), children: [_jsx(ArrowLeft, { weight: "bold", size: 14 }), " ", t('comum.anterior')] })), _jsx("div", { className: "nc-footer-spacer" }), step < 7 ? (_jsxs("button", { type: "button", className: "nc-btn nc-btn--primary nc-btn--navigation", disabled: !canNext(), onClick: () => setStep(s => s + 1), children: [t('comum.proximo'), " ", _jsx(ArrowRight, { weight: "bold", size: 14 })] })) : (_jsxs("button", { type: "button", className: "nc-btn nc-btn--primary nc-btn--navigation nc-btn--cta", disabled: salvando, onClick: handleSubmit, children: [salvando ? t('bidfrete.nova_cotacao.criando') : t('bidfrete.nova_cotacao.criar'), " ", _jsx(Check, { weight: "bold", size: 14 })] }))] })] }), _jsx("style", { children: `
        /* ── Modal Layout ── */
        .nc-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(8, 10, 20, 0.7);
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-y: auto;
          padding: 2rem 1.5rem;
        }

        .nc-modal-container {
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: 16px;
          width: 100%;
          max-width: 920px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65);
          position: relative;
          padding: 0; /* Full-bleed layout para cabeçalho e rodapé */
          display: flex;
          flex-direction: column;
          gap: 0; /* Remove gap genérico */
          animation: nc-modal-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          max-height: 90vh;
          overflow: hidden; /* Mantém as bordas arredondadas nos cantos */
        }

        /* ── Cabeçalho do Modal — Inspirado na Imagem 02 ── */
        .nc-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2.5rem;
          background: rgba(10, 15, 30, 0.45);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          position: relative;
        }

        .nc-modal-header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nc-modal-header-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.25) 0%, rgba(124, 58, 237, 0.25) 50%, rgba(99, 102, 241, 0.25) 100%);
          border: 1px solid rgba(99, 102, 241, 0.45);
          color: #a5b4fc;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.25);
        }

        .nc-modal-title {
          font-size: 1.15rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .nc-modal-subtitle {
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.55);
          margin: 0.15rem 0 0 0;
          font-weight: 400;
        }

        .nc-modal-header-step-badge {
          font-size: 0.8125rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.45);
          background: rgba(255, 255, 255, 0.03);
          padding: 0.4rem 0.875rem;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          margin-right: 2rem; /* Espaço para o X close */
        }

        .nc-modal-header-step-name {
          color: #a5b4fc;
        }

        .nc-modal-close {
          position: absolute;
          top: 50%;
          right: 1.5rem;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.45);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }
        .nc-modal-close:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        .nc-stepper-container {
          padding: 1.5rem 2.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(10, 15, 30, 0.25);
        }

        /* Stepper markup aligned with ModalPassoPassoGlobal */
        .mpg-stepper {
          display: flex;
          align-items: flex-start;
          gap: 0;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .mpg-stepper::-webkit-scrollbar {
          display: none;
        }

        .mpg-passo {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .mpg-circulo-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.75rem;
          height: 2.75rem;
        }

        .mpg-circulo {
          position: relative;
          z-index: 3;
          width: 2.75rem;
          height: 2.75rem;
          min-width: 2.75rem;
          flex-shrink: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.03);
          border: 1.5px solid rgba(255, 255, 255, 0.1);
          color: var(--text-muted, #64748b);
          font-size: 0.875rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Active Circle styling with exact linear-gradient and box-shadow */
        .mpg-circulo-ativo {
          background: linear-gradient(135deg, #c084fc 0%, #7c3aed 50%, #2563eb 100%) !important;
          border: 1.5px solid rgba(192, 132, 252, 0.6) !important;
          color: #fff !important;
          font-size: 1rem !important;
          font-weight: 800 !important;
          box-shadow: 0 0 10px rgba(192, 132, 252, 0.5), 0 0 25px rgba(124, 58, 237, 0.35), 0 0 50px rgba(37, 99, 235, 0.2), inset 0 0 12px rgba(255, 255, 255, 0.2) !important;
          animation: mpg-neon-pulse 2s ease-in-out infinite;
        }

        /* Completed Circle styling with exact success gradient and box-shadow */
        .mpg-circulo-feito {
          background: linear-gradient(135deg, #16a34a, #22c55e, #4ade80) !important;
          border: 2px solid rgba(74, 222, 128, 0.4) !important;
          color: #fff !important;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.4), 0 0 20px rgba(34, 197, 94, 0.2), 0 0 35px rgba(34, 197, 94, 0.1) !important;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s ease !important;
        }

        .mpg-passo-feito:hover .mpg-circulo-feito {
          transform: scale(1.1);
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.5), 0 0 25px rgba(34, 197, 94, 0.25), 0 0 50px rgba(34, 197, 94, 0.1) !important;
        }

        /* Stepper Labels */
        .mpg-label {
          font-size: 0.6875rem;
          font-weight: 600;
          text-align: center;
          color: var(--text-muted, #64748b);
          white-space: nowrap;
          transition: color 0.3s, text-shadow 0.3s;
        }

        .mpg-label-ativo {
          color: #c084fc !important;
          text-shadow: 0 0 8px rgba(192, 132, 252, 0.5) !important;
          font-weight: 700 !important;
        }

        .mpg-label-feito {
          color: #86efac !important;
          text-shadow: 0 0 6px rgba(34, 197, 94, 0.3) !important;
        }

        /* Connectors */
        .mpg-conector {
          position: relative;
          flex: 1;
          height: 2px;
          background: rgba(255, 255, 255, 0.06);
          min-width: 20px;
          margin-top: 1.375rem;
          border-radius: 1px;
          overflow: hidden;
        }

        .mpg-conector-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: linear-gradient(90deg, #22c55e, #4ade80);
          border-radius: 1px;
          box-shadow: 0 0 6px rgba(34, 197, 94, 0.4);
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Ambient Glow Behind Active Circle */
        .mpg-nucleo-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%,-50%);
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(192, 132, 252, 0.2) 0%, transparent 70%);
          animation: mpg-nucleo-glow 3s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }

        /* Keyframes for animations */
        @keyframes mpg-neon-pulse {
          0%, 100% {
            box-shadow: 
              0 0 0 1px rgba(192, 132, 252, 0.4),
              0 0 15px 4px rgba(124, 58, 237, 0.6), 
              0 0 35px 12px rgba(37, 99, 235, 0.35),
              inset 0 0 8px rgba(255, 255, 255, 0.35);
          }
          50% {
            box-shadow: 
              0 0 0 2px rgba(192, 132, 252, 0.6),
              0 0 22px 8px rgba(124, 58, 237, 0.85), 
              0 0 45px 18px rgba(37, 99, 235, 0.5),
              inset 0 0 12px rgba(255, 255, 255, 0.5);
          }
        }

        @keyframes mpg-nucleo-glow {
          0%, 100% { opacity: 0.4; transform: translate(-50%,-50%) scale(1); }
          50%      { opacity: 0.8; transform: translate(-50%,-50%) scale(1.3); }
        }

        /* --- Orbita 3D ao redor do circulo ativo (identidade Gravity) --- */
        @keyframes mpg-orbita-drift {
          from { transform: rotateX(70deg) rotateZ(0deg); }
          to   { transform: rotateX(70deg) rotateZ(360deg); }
        }
        @keyframes mpg-eletron-spin {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(360deg); }
        }

        .mpg-orbita-3d {
          position: absolute;
          top: 50%; left: 50%;
          width: 130%; height: 130%;
          transform: translate(-50%,-50%);
          pointer-events: none;
          perspective: 200px;
          transform-style: preserve-3d;
          z-index: 2;
        }
        .mpg-orbita-ring {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          transform-style: preserve-3d;
        }
        .mpg-orbita-ring--1 {
          transform: rotateX(70deg) rotateZ(0deg);
          animation: mpg-orbita-drift 3s linear infinite;
        }
        .mpg-orbita-ring--2 {
          transform: rotateX(70deg) rotateZ(90deg);
          animation: mpg-orbita-drift 4.5s linear infinite reverse;
        }
        .mpg-orbita-anel {
          position: absolute;
          top: 50%; left: 50%;
          width: 100%; height: 100%;
          transform: translate(-50%,-50%);
          border-radius: 50%;
          border: 1px solid rgba(192, 132, 252, 0.3) !important;
          box-shadow: none !important;
        }
        .mpg-orbita-ring--2 .mpg-orbita-anel {
          border: 1px dashed rgba(124, 58, 237, 0.2) !important;
          box-shadow: none !important;
        }
        .mpg-orbita-eletron {
          position: absolute;
          top: 50%; left: 50%;
          width: 100%; height: 100%;
          transform: translate(-50%,-50%);
          border-radius: 50%;
          pointer-events: none;
        }
        .mpg-orbita-eletron--1 {
          animation: mpg-eletron-spin 3s linear infinite;
        }
        .mpg-orbita-eletron--1::after {
          content: '';
          position: absolute;
          width: 5px; height: 5px;
          border-radius: 50%;
          top: -2.5px; left: 50%;
          transform: translateX(-50%);
          background: #c084fc;
          box-shadow: 0 0 8px 2px rgba(192, 132, 252, 0.8), 0 0 16px 4px rgba(192, 132, 252, 0.4);
        }
        .mpg-orbita-eletron--2 {
          animation: mpg-eletron-spin 4.5s linear infinite reverse;
        }
        .mpg-orbita-eletron--2::after {
          content: '';
          position: absolute;
          width: 4px; height: 4px;
          border-radius: 50%;
          top: -2px; left: 50%;
          transform: translateX(-50%);
          background: #7c3aed;
          box-shadow: 0 0 8px 2px rgba(124, 58, 237, 0.8), 0 0 16px 4px rgba(124, 58, 237, 0.4);
        }

        .nc-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 2rem 2.5rem;
          margin-bottom: 0;
          /* Suavizar a barra de rolagem */
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
        }
        .nc-modal-body::-webkit-scrollbar {
          width: 6px;
        }
        .nc-modal-body::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 3px;
        }

        .nc-footer {
          display: flex;
          align-items: center;
          padding: 1.25rem 2.5rem;
          background: rgba(10, 15, 30, 0.45);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        @keyframes nc-modal-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .nc-modal-close {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background: transparent;
          border: none;
          color: var(--text-secondary, #94a3b8);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }
        .nc-modal-close:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary, #f8fafc);
        }

        .nc-modal-body {
          flex: 1;
          overflow-y: auto;
          padding-right: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .nc-page {
          padding: 0.5rem 2rem 1.5rem;
          background: transparent;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          min-height: 0;
          flex: 1;
        }

        /* ── Subheader ── */
        .nc-subheader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.25rem 0;
          margin-bottom: 0.25rem;
        }

        .nc-subheader-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nc-subheader-step {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-secondary, #94a3b8);
        }

        .nc-subheader-separator {
          color: var(--border-subtle, rgba(255, 255, 255, 0.08));
          font-weight: bold;
        }

        .nc-subheader-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary, #f8fafc);
        }

        .nc-subheader-right {
          display: flex;
          align-items: center;
        }

        .nc-btn-cancelar {
          padding: 0.4rem 1rem;
          font-size: 0.8125rem;
          border-radius: 6px;
        }

        /* Removido duplicado .nc-stepper-container */

        /* Animação Suave entre Passos */
        @keyframes nc-fade-in-up {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .nc-fade-in {
          animation: nc-fade-in-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .nc-step-content {
          max-width: 840px;
          margin: 0 auto;
        }

        .nc-section-title {
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--text-secondary, #94a3b8);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 1.25rem;
          margin-top: 2.5rem;
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }
        .nc-section-title:first-child { 
          margin-top: 0; 
        }

        /* ── Grids de Cards de Opções ── */
        .nc-options-grid-2 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2.25rem;
        }
        .nc-options-grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2.25rem;
        }

        /* Botão de Opção Enriquecido */
        .nc-option-btn {
          display: flex;
          align-items: flex-start;
          gap: 1.125rem;
          padding: 1.25rem 1.5rem;
          background: var(--bg-base, rgba(15, 23, 42, 0.5));
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.06));
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: inherit;
          color: var(--text-secondary, #94a3b8);
          text-align: left;
          width: 100%;
        }
        .nc-option-btn:hover {
          border-color: rgba(99, 102, 241, 0.45);
          background: var(--bg-hover, rgba(255, 255, 255, 0.04));
          color: var(--text-primary, #f8fafc);
          transform: translateY(-2px);
        }
        .nc-option-btn--selected {
          border-color: var(--accent, #6366f1);
          background: rgba(99, 102, 241, 0.12);
          color: #fff;
          box-shadow: 0 0 0 1px var(--accent, #6366f1), 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .nc-option-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-secondary, #94a3b8);
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .nc-option-btn:hover .nc-option-icon {
          color: var(--accent, #6366f1);
          background: rgba(99, 102, 241, 0.1);
        }
        .nc-option-btn--selected .nc-option-icon {
          background: var(--accent, #6366f1);
          color: #fff;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
        }

        .nc-option-text {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .nc-option-label {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text-primary, #f8fafc);
        }
        .nc-option-desc {
          font-size: 0.875rem;
          color: var(--text-secondary-light, #cbd5e1);
          line-height: 1.45;
        }
        .nc-option-btn:hover .nc-option-desc {
          color: var(--text-primary, #f8fafc);
        }
        .nc-option-btn--selected .nc-option-desc {
          color: rgba(255, 255, 255, 0.95);
        }

        /* ── Dica Vazia Modalidade ── */
        .nc-empty-hint {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px dashed rgba(255, 255, 255, 0.08);
          padding: 1.25rem 1.5rem;
          border-radius: 8px;
          color: var(--text-secondary, #94a3b8);
          font-size: 0.875rem;
          grid-column: span 2;
        }

        /* ── Fields ── */
        .nc-fields-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1.5rem 1.25rem;
        }
        .nc-fields-grid--cargo {
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem 1.25rem;
        }

        .nc-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nc-field-label {
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: var(--text-secondary, #94a3b8);
        }

        .nc-input {
          padding: 0.625rem 0.875rem;
          background: var(--bg-base, rgba(15, 23, 42, 0.4));
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.1));
          border-radius: 8px;
          color: var(--text-primary, #f8fafc);
          font-size: 0.875rem;
          font-family: inherit;
          outline: none;
          transition: all 0.2s;
          width: 100%;
        }
        .nc-input:focus {
          border-color: var(--accent, #6366f1);
          background: var(--bg-surface-raised, rgba(15, 23, 42, 0.65));
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
        }
        .nc-input::placeholder { 
          color: var(--text-muted, #64748b); 
        }

        select.nc-input {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.875rem center;
          background-size: 1rem;
          padding-right: 2.5rem;
        }

        /* Input Group com Sufixo */
        .nc-input-group {
          position: relative;
          display: flex;
          align-items: center;
        }
        .nc-input--with-suffix {
          padding-right: 3rem;
        }
        .nc-input-suffix {
          position: absolute;
          right: 1rem;
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--text-secondary, #94a3b8);
          pointer-events: none;
          text-transform: uppercase;
        }
        .nc-input:focus ~ .nc-input-suffix {
          color: var(--accent, #6366f1);
        }

        /* ── Origem e Destino Refinados ── */
        .nc-location-visual-card {
          background: var(--bg-base, rgba(15, 23, 42, 0.3));
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.05));
          border-radius: 12px;
          padding: 1.5rem 1.75rem;
          margin-top: 0.75rem;
        }
        .nc-location-visual-card--origin {
          border-left: 4px solid var(--accent, #6366f1);
        }
        .nc-location-visual-card--destination {
          border-left: 4px solid var(--success, #10b981);
        }

        .nc-location-visual-header {
          display: flex;
          align-items: center;
          gap: 1.125rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.05));
          padding-bottom: 1rem;
        }

        .nc-location-visual-circle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.03);
        }
        .nc-location-visual-card--origin .nc-location-visual-circle {
          background: rgba(99, 102, 241, 0.1);
          color: var(--accent, #6366f1);
        }
        .nc-location-visual-card--destination .nc-location-visual-circle {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success, #10b981);
        }

        .nc-location-visual-text h4 {
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--text-primary, #f8fafc);
        }
        .nc-location-visual-text p {
          font-size: 0.875rem;
          color: var(--text-secondary-light, #cbd5e1);
          margin-top: 0.2rem;
        }

        @keyframes nc-pulse {
          0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(99, 102, 241, 0); }
          100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }
        @keyframes nc-pulse-dest {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .nc-pulsing-icon {
          border-radius: 50%;
          animation: nc-pulse 2s infinite;
        }
        .nc-pulsing-icon-dest {
          border-radius: 50%;
          animation: nc-pulse-dest 2s infinite;
        }

        .nc-fields-grid--location {
          grid-template-columns: 1.25fr 2fr 1.5fr;
          gap: 1.25rem;
        }
        @media(max-width: 600px) {
          .nc-fields-grid--location {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }

        /* ── Incoterms ── */
        .nc-incoterm-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1.75rem;
        }

        .nc-incoterm-btn {
          padding: 0.625rem 1.25rem;
          background: var(--bg-base, rgba(15, 23, 42, 0.45));
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
          border-radius: 30px;
          color: var(--text-secondary, #94a3b8);
          font-size: 0.8125rem;
          font-weight: 700;
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.03em;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nc-incoterm-btn:hover {
          border-color: rgba(99, 102, 241, 0.5);
          color: #fff;
          transform: scale(1.05);
        }
        .nc-incoterm-btn--selected {
          background: rgba(99, 102, 241, 0.15);
          border-color: var(--accent, #6366f1);
          color: var(--accent, #6366f1);
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.2);
        }

        /* UX Helper Card do Incoterm */
        .nc-incoterm-helper-card {
          background: rgba(99, 102, 241, 0.04);
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: 10px;
          padding: 1.25rem 1.5rem;
          margin: 1.75rem 0;
        }
        .nc-helper-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--accent, #6366f1);
          margin-bottom: 0.75rem;
        }
        .nc-helper-header h4 {
          font-size: 0.9375rem;
          font-weight: 700;
        }
        .nc-helper-desc {
          font-size: 0.875rem;
          color: var(--text-secondary-light, #cbd5e1);
          line-height: 1.5;
        }
        .nc-helper-footer {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(99, 102, 241, 0.15);
          font-size: 0.8125rem;
          color: var(--text-secondary-light, #cbd5e1);
        }

        /* Visibilidade & Fornecedores */
        .nc-visibilidade-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2.25rem;
        }

        .nc-vis-card {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          padding: 1.25rem 1.5rem;
          background: var(--bg-base, rgba(15, 23, 42, 0.4));
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.06));
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: left;
          font-family: inherit;
        }
        .nc-vis-card:hover {
          border-color: rgba(99, 102, 241, 0.4);
          background: var(--bg-hover, rgba(99, 102, 241, 0.04));
          transform: translateY(-2px);
        }
        .nc-vis-card--selected {
          border-color: var(--accent, #6366f1);
          background: rgba(99, 102, 241, 0.1);
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15);
        }

        .nc-vis-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-secondary, #94a3b8);
          flex-shrink: 0;
        }
        .nc-vis-card--selected .nc-vis-icon-wrap {
          background: var(--accent, #6366f1);
          color: #fff;
        }

        .nc-vis-info {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .nc-vis-title {
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--text-primary, #f8fafc);
        }
        .nc-vis-desc {
          font-size: 0.875rem;
          color: var(--text-secondary-light, #cbd5e1);
          line-height: 1.45;
        }

        /* Custom Alternator Switch Component */
        .nc-switch-row {
          background: var(--bg-base, rgba(15, 23, 42, 0.25));
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.04));
          padding: 1rem 1.5rem;
          border-radius: 10px;
          margin-top: 2rem;
        }
        .nc-switch-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          cursor: pointer;
          width: 100%;
        }

        .nc-switch-text {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .nc-switch-title {
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--text-primary, #f8fafc);
        }
        .nc-switch-desc {
          font-size: 0.875rem;
          color: var(--text-secondary-light, #cbd5e1);
        }

        .nc-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
          flex-shrink: 0;
        }
        .nc-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .nc-switch-slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background-color: rgba(255, 255, 255, 0.1);
          transition: .3s;
          border-radius: 34px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .nc-switch-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: var(--text-secondary, #94a3b8);
          transition: .3s;
          border-radius: 50%;
        }
        .nc-switch input:checked + .nc-switch-slider {
          background-color: var(--accent, #6366f1);
        }
        .nc-switch input:checked + .nc-switch-slider:before {
          transform: translateX(20px);
          background-color: #fff;
        }

        /* ── Resumo Final Premium (Recibo Digital) ── */
        .nc-fields-grid--summary-inputs {
          margin-bottom: 2rem;
          grid-template-columns: 2fr 1.25fr;
        }

        .nc-receipt-card {
          background: var(--bg-surface, rgba(15, 23, 42, 0.45));
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
          border-radius: 12px;
          padding: 1.75rem 2rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
          position: relative;
          overflow: hidden;
        }
        .nc-receipt-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--accent, #6366f1), var(--success, #10b981));
        }

        .nc-receipt-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.75rem;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
          padding-bottom: 1rem;
        }
        .nc-receipt-badge {
          background: rgba(99, 102, 241, 0.15);
          color: var(--accent, #6366f1);
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.35rem 0.75rem;
          border-radius: 30px;
          text-transform: uppercase;
        }
        .nc-receipt-modal {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-secondary, #94a3b8);
        }

        /* Timeline de Rota Comercial */
        .nc-route-timeline {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin: 1.75rem 0 2.5rem 0;
        }
        .nc-timeline-node {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }
        .nc-node-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .nc-node-dot--origin {
          background: var(--accent, #6366f1);
          box-shadow: 0 0 8px var(--accent, #6366f1);
        }
        .nc-node-dot--destination {
          background: var(--success, #10b981);
          box-shadow: 0 0 8px var(--success, #10b981);
        }

        .nc-node-text {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .nc-node-code {
          font-size: 1.0625rem;
          font-weight: 800;
          color: #fff;
          line-height: 1.2;
          font-family: 'DM Mono', monospace;
        }
        .nc-node-name {
          font-size: 0.875rem;
          color: var(--text-secondary-light, #cbd5e1);
        }

        .nc-timeline-line {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          width: 100px;
          flex-shrink: 0;
        }
        .nc-timeline-line-fill {
          height: 2px;
          background: linear-gradient(90deg, var(--accent, #6366f1), var(--success, #10b981));
          width: 100%;
          border-radius: 2px;
        }
        .nc-timeline-icon-wrap {
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-surface, #1e293b);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary, #94a3b8);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 500px) {
          .nc-route-timeline {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }
          .nc-timeline-line {
            width: 2px;
            height: 40px;
            margin-left: 5px;
          }
          .nc-timeline-line-fill {
            width: 2px;
            height: 100%;
          }
        }

        /* Detalhes de Recibo */
        .nc-receipt-details {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }
        .nc-receipt-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }
        .nc-receipt-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .nc-receipt-label {
          font-size: 0.875rem;
          color: var(--text-secondary-light, #cbd5e1);
        }
        .nc-receipt-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary, #f8fafc);
        }
        .nc-receipt-value.font-mono {
          font-family: 'DM Mono', monospace;
          color: var(--text-secondary, #94a3b8);
        }
        .nc-receipt-value--incoterm {
          color: var(--accent, #6366f1);
          font-family: 'DM Mono', monospace;
          background: rgba(99, 102, 241, 0.08);
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        /* ── Footer de Navegação ── */
        .nc-footer {
          display: flex;
          align-items: center;
          padding: 2rem 0 0 0;
          gap: 1.25rem;
        }
        .nc-footer-spacer { 
          flex: 1; 
        }

        /* ── Botões Customizados Premium ── */
        .nc-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.625rem;
          padding: 0.8rem 2rem;
          border-radius: 30px;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          border: none;
          font-family: inherit;
        }
        .nc-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .nc-btn--primary {
          background: linear-gradient(135deg, var(--accent, #6366f1) 0%, var(--accent-hover, #4f46e5) 100%);
          color: #fff;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
        }
        .nc-btn--primary:hover:not(:disabled) {
          background: linear-gradient(135deg, var(--accent-hover, #4f46e5) 0%, #4338ca 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
        }
        .nc-btn--secondary {
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-secondary, #94a3b8);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .nc-btn--secondary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.15);
          color: var(--text-primary, #f8fafc);
        }

        .nc-btn--navigation {
          min-width: 150px;
        }
        .nc-btn--cta {
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);
        }

        /* ── Sucesso Premium ── */
        .nc-sucesso {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          gap: 1.5rem;
          max-width: 520px;
          margin: 0 auto;
          text-align: center;
        }
        .nc-sucesso-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          box-shadow: 0 8px 32px rgba(16, 185, 129, 0.1);
          margin-bottom: 0.5rem;
        }
        .nc-sucesso-title {
          font-size: 1.625rem;
          font-weight: 800;
          color: var(--text-primary, #f8fafc);
        }
        .nc-sucesso-desc {
          font-size: 0.9375rem;
          color: var(--text-secondary-light, #cbd5e1);
          line-height: 1.55;
        }
        .nc-sucesso-actions {
          display: flex;
          gap: 1.25rem;
          margin-top: 1.75rem;
        }
      ` })] }));
}
//# sourceMappingURL=NovaCotacao.js.map