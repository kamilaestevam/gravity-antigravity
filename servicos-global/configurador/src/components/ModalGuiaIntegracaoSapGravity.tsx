import React, { useState } from 'react'
import { FileText, Copy } from '@phosphor-icons/react'
import { ModalFormularioGlobal } from '@nucleo/modal-formulario-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import {
  type FocoGuiaIntegracaoSap,
  TITULO_GUIA_INTEGRACAO_SAP,
  SUBTITULO_GUIA_INTEGRACAO_SAP,
  secoesGuiaPorFoco,
} from '../shared/guia-integracao-sap-gravity-conteudo'

const BLOCO_CODIGO_STYLE: React.CSSProperties = {
  marginTop: '0.5rem',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  background: 'rgba(0,0,0,0.35)',
  border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
  fontFamily: "'Fira Code', 'Cascadia Code', monospace",
  fontSize: '0.75rem',
  lineHeight: 1.55,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  color: 'var(--text-primary, #e2e8f0)',
  overflowX: 'auto',
}

const SECAO_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.625rem',
  padding: '1rem',
  borderRadius: '10px',
  background: 'rgba(0,0,0,0.15)',
  border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
}

interface ModalGuiaIntegracaoSapGravityProps {
  aberto: boolean
  aoFechar: () => void
  foco?: FocoGuiaIntegracaoSap
}

export function ModalGuiaIntegracaoSapGravity({
  aberto,
  aoFechar,
  foco = 'completo',
}: ModalGuiaIntegracaoSapGravityProps) {
  const secoes = secoesGuiaPorFoco(foco)

  const copiar = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto)
    } catch {
      /* silencioso */
    }
  }

  return (
    <ModalFormularioGlobal
      aberto={aberto}
      aoFechar={aoFechar}
      aoSalvar={aoFechar}
      icone={<FileText size={24} weight="duotone" />}
      titulo={TITULO_GUIA_INTEGRACAO_SAP}
      subtitulo={SUBTITULO_GUIA_INTEGRACAO_SAP}
      tamanho="lg"
      altura="auto"
      dirty={false}
      podesSalvar
      textoSalvar="Fechar"
      textoCancelar=""
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          padding: '0.5rem 1.5rem 1.25rem',
          maxHeight: 'min(70vh, 640px)',
          overflowY: 'auto',
        }}
      >
        {secoes.map((secao) => (
          <section key={secao.id} style={SECAO_STYLE} aria-labelledby={`guia-secao-${secao.id}`}>
            <h3
              id={`guia-secao-${secao.id}`}
              style={{
                margin: 0,
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: 'var(--text-primary, #fff)',
              }}
            >
              {secao.titulo}
            </h3>

            {secao.paragrafos.map((p) => (
              <p
                key={p}
                style={{
                  margin: 0,
                  fontSize: '0.8125rem',
                  lineHeight: 1.6,
                  color: 'var(--text-secondary, #94a3b8)',
                }}
              >
                {p}
              </p>
            ))}

            {secao.diagrama && (
              <pre style={BLOCO_CODIGO_STYLE} aria-label="Diagrama de fluxos">
                {secao.diagrama}
              </pre>
            )}

            {secao.lista && (
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '1.25rem',
                  fontSize: '0.8125rem',
                  lineHeight: 1.65,
                  color: 'var(--text-secondary, #94a3b8)',
                }}
              >
                {secao.lista.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}

            {secao.codigo?.map((bloco) => (
              <div key={bloco.titulo}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.25rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--brand-primary, #818cf8)',
                    }}
                  >
                    {bloco.titulo}
                  </span>
                  <BotaoGlobal
                    variante="fantasma"
                    tamanho="pequeno"
                    icone={<Copy size={14} />}
                    onClick={() => void copiar(bloco.conteudo)}
                    aria-label={`Copiar ${bloco.titulo}`}
                  >
                    Copiar
                  </BotaoGlobal>
                </div>
                <pre style={BLOCO_CODIGO_STYLE}>{bloco.conteudo}</pre>
              </div>
            ))}
          </section>
        ))}
      </div>
    </ModalFormularioGlobal>
  )
}

interface BotaoGuiaIntegracaoSapGravityProps {
  foco?: FocoGuiaIntegracaoSap
  tamanho?: 'pequeno' | 'medio'
  variante?: 'secundario' | 'fantasma'
  mostrarRotulo?: boolean
}

/** Ícone de documento + tooltip — abre o guia técnico para o time de TI. */
export function BotaoGuiaIntegracaoSapGravity({
  foco = 'completo',
  tamanho = 'pequeno',
  variante = 'secundario',
  mostrarRotulo = false,
}: BotaoGuiaIntegracaoSapGravityProps) {
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <TooltipGlobal
        titulo="Guia técnico de integração"
        descricao="Documentação para o time de TI integrar SAP, CPI ou middleware ao Gravity"
      >
        <span style={{ display: 'inline-flex' }}>
          <BotaoGlobal
            variante={variante}
            tamanho={tamanho}
            onClick={() => setAberto(true)}
            icone={<FileText size={16} weight="duotone" />}
            aria-label="Abrir guia técnico de integração SAP"
          >
            {mostrarRotulo ? 'Guia técnico' : undefined}
          </BotaoGlobal>
        </span>
      </TooltipGlobal>

      <ModalGuiaIntegracaoSapGravity
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        foco={foco}
      />
    </>
  )
}
