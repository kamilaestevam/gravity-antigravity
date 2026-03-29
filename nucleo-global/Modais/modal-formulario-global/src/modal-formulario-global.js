import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ModalSemSessoesGlobal } from '@nucleo/modal-sem-sessoes-global';
import { CabecalhoGlobal } from '@nucleo/cabecalho-global';
import { BotaoSalvar, BotaoCancelar } from '@nucleo/botoes-salvar-global';
import { StatusSalvarGlobal } from '@nucleo/status-salvar-global';
export function ModalFormularioGlobal({ aberto, aoFechar, aoSalvar, aoExcluir, icone, titulo, subtitulo, dirty = false, podesSalvar = false, tamanho = "lg", altura = "680px", children, textoSalvar = "Salvar Alterações", textoCancelar = "Cancelar" }) {
    return (_jsx(ModalSemSessoesGlobal, { aberto: aberto, aoFechar: aoFechar, titulo: "" // Preenchido via cabecalhoPersonalizado
        , cabecalhoPersonalizado: _jsxs("div", { className: "ws-modal-cabecalho", style: {
                borderBottom: '1px solid var(--ws-accent-border)',
                marginBottom: '1.5rem',
                paddingTop: '1.5rem',
                paddingBottom: '1rem',
                paddingLeft: '1.5rem',
                paddingRight: '3.5rem', // Espaço para o botão fechar
                position: 'relative',
                overflow: 'hidden'
            }, children: [_jsx("style", { dangerouslySetInnerHTML: { __html: `
            .ws-modal-cabecalho .cg-header {
              margin: 0 !important;
              padding: 0 !important;
              height: auto !important;
              min-height: 0 !important;
              background: transparent !important;
              position: static !important;
            }
          ` } }), _jsx(CabecalhoGlobal, { icone: icone, titulo: titulo, subtitulo: subtitulo || '' })] }), tamanho: tamanho, altura: altura, renderizarFooter: () => (_jsxs("div", { className: "mg-footer-personalizado", children: [aoExcluir ? (_jsx("button", { className: "mg-btn-danger mg-btn-danger-fix", onClick: aoExcluir, children: "Excluir" })) : (_jsx("div", {})), _jsxs("div", { className: "botoes-footer-padrao", children: [_jsx(StatusSalvarGlobal, { status: dirty ? 'dirty' : 'idle', hideOnIdle: true }), _jsx(BotaoCancelar, { dirty: dirty, rotulo: textoCancelar, onClick: aoFechar }), _jsx(BotaoSalvar, { dirty: podesSalvar && dirty, rotulo: textoSalvar, onClick: aoSalvar })] })] })), children: children }));
}
