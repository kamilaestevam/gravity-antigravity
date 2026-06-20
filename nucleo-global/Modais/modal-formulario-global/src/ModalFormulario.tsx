import React from 'react'
import { useTranslation } from 'react-i18next'
import { ModalSemSessoesGlobal } from '@nucleo/modal-sem-sessoes-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoSalvar, BotaoCancelar } from '@nucleo/botoes-salvar-global'
import { StatusSalvarGlobal } from '@nucleo/status-salvar-global'

export interface ModalFormularioProps {
  aberto: boolean
  aoFechar: () => void
  aoSalvar: () => void
  aoExcluir?: () => void
  icone: React.ReactNode
  titulo: string
  subtitulo?: string
  dirty?: boolean
  podesSalvar?: boolean
  tamanho?: "sm" | "md" | "lg" | "xl" | "full"
  altura?: string
  children: React.ReactNode
  textoSalvar?: string
  textoCancelar?: string
  carregando?: boolean
  /**
   * Fluxo de criação (ex.: convite) — habilita Salvar quando `podesSalvar`,
   * sem exigir `dirty` (não há estado inicial para comparar).
   */
  modoCriacao?: boolean
  /** Conteúdo customizado no lado esquerdo do footer (ex: "Voltar para Pedidos") */
  rodapeEsquerdo?: React.ReactNode
}

export function ModalFormulario({
  aberto,
  aoFechar,
  aoSalvar,
  aoExcluir,
  icone,
  titulo,
  subtitulo,
  dirty = false,
  podesSalvar = false,
  tamanho = "lg",
  altura = "680px",
  children,
  textoSalvar,
  textoCancelar,
  carregando = false,
  modoCriacao = false,
  rodapeEsquerdo
}: ModalFormularioProps) {
  const { t } = useTranslation()
  const resolvedTextoSalvar = textoSalvar ?? t('modal.salvar_alteracoes')
  const resolvedTextoCancelar = textoCancelar ?? t('modal.cancelar')
  const salvarHabilitado = modoCriacao
    ? podesSalvar || carregando
    : (podesSalvar && dirty) || carregando
  const statusDirty = modoCriacao ? (podesSalvar || dirty) : dirty
  return (
    <ModalSemSessoesGlobal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="" // Preenchido via cabecalhoPersonalizado
      cabecalhoPersonalizado={
        <div 
          className="ws-modal-cabecalho" 
          style={{ 
            borderBottom: '1px solid var(--ws-accent-border)', 
            marginBottom: '1.5rem', 
            paddingTop: '1.5rem',
            paddingBottom: '1rem',
            paddingLeft: '1.5rem',
            paddingRight: '3.5rem', // Espaço para o botão fechar
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Sobrescreve margens negativas do CabecalhoGlobal que são específicas para páginas */}
          <style dangerouslySetInnerHTML={{ __html: `
            .ws-modal-cabecalho .cg-header {
              margin: 0 !important;
              padding: 0 !important;
              height: auto !important;
              min-height: 0 !important;
              background: transparent !important;
              position: static !important;
            }
            .ws-modal-cabecalho .cg-header__title-block {
              gap: 0.375rem !important;
            }
          `}} />
          <CabecalhoGlobal
            icone={icone}
            titulo={titulo}
            subtitulo={subtitulo || ''}
          />
        </div>
      }
      tamanho={tamanho}
      altura={altura}
      renderizarFooter={() => (
        <div className="mg-footer-personalizado">
          {rodapeEsquerdo ? (
            rodapeEsquerdo
          ) : aoExcluir ? (
            <button
              className="mg-btn-danger mg-btn-danger-fix"
              onClick={aoExcluir}
            >
              {t('modal.excluir')}
            </button>
          ) : (
            <div />
          )}

          <div className="botoes-footer-padrao">
            {!rodapeEsquerdo && (
              <StatusSalvarGlobal
                status={carregando ? 'saving' : statusDirty ? 'dirty' : 'idle'}
                hideOnIdle={!carregando}
              />
            )}
            <BotaoCancelar
              dirty={statusDirty}
              rotulo={resolvedTextoCancelar}
              onClick={aoFechar}
            />
            <BotaoSalvar
              dirty={salvarHabilitado}
              carregando={carregando}
              rotulo={resolvedTextoSalvar}
              onClick={aoSalvar}
            />
          </div>
        </div>
      )}
    >
      {children}
    </ModalSemSessoesGlobal>
  )
}
