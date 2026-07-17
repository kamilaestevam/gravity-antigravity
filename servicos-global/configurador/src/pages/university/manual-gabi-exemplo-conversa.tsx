/**
 * Mock de conversa Gabi para Academy — visual alinhado ao chat real (Gabi.tsx / Gabi.css).
 */

import React from 'react'
import { Sparkle, Wrench, CheckCircle, Warning, ShieldCheck } from '@phosphor-icons/react'
import type {
  ConfirmacaoExemplo,
  DificuldadeGabiExemplo,
  ExemploConversaGabi,
  MensagemGabiExemplo,
} from './manual-gabi-exemplo-conversa-dados'
import { EXEMPLOS_CONVERSA_GABI_POR_ID } from './manual-gabi-exemplo-conversa-dados'

const GABI = '#c084fc'

const DIFICULDADE_ESTILO: Record<DificuldadeGabiExemplo, { rotulo: string; cor: string; borda: string; fundo: string }> = {
  facil: { rotulo: 'Fácil', cor: '#6ee7b7', borda: 'rgba(52,211,153,.35)', fundo: 'rgba(52,211,153,.1)' },
  media: { rotulo: 'Médio', cor: '#93c5fd', borda: 'rgba(96,165,250,.35)', fundo: 'rgba(96,165,250,.1)' },
  dificil: { rotulo: 'Difícil', cor: '#fcd34d', borda: 'rgba(251,191,36,.35)', fundo: 'rgba(251,191,36,.1)' },
}

function renderMarkdownLeve(texto: string): React.ReactNode {
  const linhas = texto.split('\n')
  return linhas.map((linha, i) => {
    const formatada = linha
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^\* (.*)$/, '• $1')
    return (
      <span key={i}>
        <span dangerouslySetInnerHTML={{ __html: formatada }} />
        {i < linhas.length - 1 && <br />}
      </span>
    )
  })
}

function ChipDificuldade({ dificuldade }: { dificuldade: DificuldadeGabiExemplo }) {
  const s = DIFICULDADE_ESTILO[dificuldade]
  return (
    <span style={{
      fontSize: '.58rem',
      fontWeight: 800,
      letterSpacing: '.06em',
      textTransform: 'uppercase',
      padding: '3px 8px',
      borderRadius: 999,
      color: s.cor,
      background: s.fundo,
      border: `1px solid ${s.borda}`,
    }}>
      {s.rotulo}
    </span>
  )
}

const ROTULO_CONFIRMACAO: Record<ConfirmacaoExemplo['classe'], string> = {
  WRITE_SAFE: 'Alteração',
  WRITE_DESTRUTIVA: 'Ação irreversível',
  WRITE_FINANCEIRA: 'Impacto financeiro',
}

function ToolsBadge({ tools }: { tools: MensagemGabiExemplo['tools'] }) {
  if (!tools?.length) return null
  return (
    <div className="uni-gabi-exemplo-tools">
      <Wrench size={11} weight="duotone" />
      {tools.map((t) => (
        <span key={`${t.tool_id}-${t.duracao_ms}`} className={`uni-gabi-exemplo-tool-chip ${t.sucesso ? 'ok' : 'err'}`}>
          {t.rotulo ?? t.tool_id}
        </span>
      ))}
    </div>
  )
}

function CardConfirmacao({ confirmacao }: { confirmacao: ConfirmacaoExemplo }) {
  const classeCss = confirmacao.classe.toLowerCase().replace('_', '-')
  const Icone = confirmacao.classe === 'WRITE_DESTRUTIVA' ? Warning : ShieldCheck
  return (
    <div className={`uni-gabi-exemplo-confirmacao uni-gabi-exemplo-confirmacao--${classeCss}`}>
      <div className="uni-gabi-exemplo-confirmacao-header">
        <Icone size={14} weight="duotone" />
        <span className="uni-gabi-exemplo-confirmacao-classe">{ROTULO_CONFIRMACAO[confirmacao.classe]}</span>
        {confirmacao.estado === 'pendente' && <span className="uni-gabi-exemplo-confirmacao-pendente">Aguardando você</span>}
      </div>
      <p className="uni-gabi-exemplo-confirmacao-desc">{confirmacao.descricao}</p>
      {confirmacao.estado === 'pendente' && (
        <div className="uni-gabi-exemplo-confirmacao-actions">
          <button type="button" className="uni-gabi-exemplo-btn-confirmar">Confirmar</button>
          <button type="button" className="uni-gabi-exemplo-btn-cancelar">Cancelar</button>
        </div>
      )}
      {confirmacao.estado === 'confirmado' && (
        <div className="uni-gabi-exemplo-confirmacao-ok">
          <CheckCircle size={13} weight="fill" /> Confirmado
        </div>
      )}
    </div>
  )
}

function MensagemChat({ msg }: { msg: MensagemGabiExemplo }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`uni-gabi-exemplo-message ${isUser ? 'user' : 'assistant'}`}>
      <div className="uni-gabi-exemplo-message-row">
        {!isUser && (
          <div className="uni-gabi-exemplo-avatar-small primary" aria-hidden>
            <Sparkle size={14} weight="fill" color="#fff" />
          </div>
        )}
        <div className="uni-gabi-exemplo-message-bubble">
          {renderMarkdownLeve(msg.content)}
        </div>
        {isUser && (
          <div className="uni-gabi-exemplo-avatar-small user" aria-hidden>V</div>
        )}
      </div>
      <div className="uni-gabi-exemplo-message-meta">
        {!isUser && <ToolsBadge tools={msg.tools} />}
        {msg.dados_alterados && (
          <span className="uni-gabi-exemplo-data-changed">Dados alterados</span>
        )}
        <span className="uni-gabi-exemplo-hora">{msg.hora}</span>
      </div>
      {!isUser && msg.confirmacoes?.map((c, i) => (
        <CardConfirmacao key={`${c.descricao}-${i}`} confirmacao={c} />
      ))}
    </div>
  )
}

function PainelConversa({ exemplo }: { exemplo: ExemploConversaGabi }) {
  return (
    <article className="uni-gabi-exemplo-card">
      <div className="uni-gabi-exemplo-card-header">
        <div>
          <h4 className="uni-gabi-exemplo-card-titulo">{exemplo.titulo}</h4>
          {exemplo.contexto && (
            <p className="uni-gabi-exemplo-card-contexto">{exemplo.contexto}</p>
          )}
        </div>
        <ChipDificuldade dificuldade={exemplo.dificuldade} />
      </div>

      <div className="uni-gabi-exemplo-wrapper">
        <div className="uni-gabi-exemplo-header">
          <div className="uni-gabi-exemplo-header-left">
            <div className="uni-gabi-exemplo-avatar-container">
              <Sparkle size={22} weight="fill" color={GABI} />
              <span className="uni-gabi-exemplo-status-led" />
            </div>
            <div>
              <div className="uni-gabi-exemplo-header-nome">Gabi</div>
              <div className="uni-gabi-exemplo-header-status">Assistente IA · online</div>
            </div>
          </div>
        </div>

        <div className="uni-gabi-exemplo-chat-body">
          {exemplo.mensagens.map((msg, i) => (
            <MensagemChat key={`${msg.role}-${msg.hora}-${i}`} msg={msg} />
          ))}
        </div>

        <div className="uni-gabi-exemplo-input-mock" aria-hidden>
          <span>Pergunte algo à Gabi…</span>
          <span className="uni-gabi-exemplo-send">Enviar</span>
        </div>
      </div>

      {exemplo.nota && (
        <p className="uni-gabi-exemplo-nota">{exemplo.nota}</p>
      )}
    </article>
  )
}

export function ManualGabiExemploConversa({ exemploId }: { exemploId: string }) {
  const exemplo = EXEMPLOS_CONVERSA_GABI_POR_ID[exemploId]
  if (!exemplo) return null
  return <PainelConversa exemplo={exemplo} />
}

export function ManualGabiExemplosConversa({ ids }: { ids: readonly string[] }) {
  return (
    <>
      <style>{`
        .uni-gabi-exemplos-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .uni-gabi-exemplo-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .uni-gabi-exemplo-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }
        .uni-gabi-exemplo-card-titulo {
          margin: 0;
          font-size: .84rem;
          font-weight: 800;
          color: var(--ws-text, #f1f5f9);
        }
        .uni-gabi-exemplo-card-contexto {
          margin: 4px 0 0;
          font-size: .64rem;
          color: var(--ws-muted, #94a3b8);
        }
        .uni-gabi-exemplo-wrapper {
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,.1);
          background: #0f111a;
          overflow: hidden;
          box-shadow: 0 16px 40px rgba(0,0,0,.25);
        }
        .uni-gabi-exemplo-header {
          padding: 12px 14px 8px;
          border-bottom: 1px solid rgba(255,255,255,.06);
        }
        .uni-gabi-exemplo-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .uni-gabi-exemplo-avatar-container {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid #6366f1;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,.04);
        }
        .uni-gabi-exemplo-status-led {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #10b981;
          border: 2px solid #0f111a;
        }
        .uni-gabi-exemplo-header-nome {
          font-size: .88rem;
          font-weight: 700;
          color: #fff;
        }
        .uni-gabi-exemplo-header-status {
          font-size: .68rem;
          color: #9ca3af;
        }
        .uni-gabi-exemplo-chat-body {
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-height: 420px;
          overflow-y: auto;
        }
        .uni-gabi-exemplo-message {
          display: flex;
          flex-direction: column;
          max-width: 92%;
        }
        .uni-gabi-exemplo-message.assistant { align-self: flex-start; }
        .uni-gabi-exemplo-message.user { align-self: flex-end; align-items: flex-end; max-width: 85%; }
        .uni-gabi-exemplo-message-row {
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }
        .uni-gabi-exemplo-message.user .uni-gabi-exemplo-message-row { flex-direction: row-reverse; }
        .uni-gabi-exemplo-avatar-small {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          font-size: .68rem;
          font-weight: 700;
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(255,255,255,.05);
          color: #e5e7eb;
        }
        .uni-gabi-exemplo-avatar-small.primary { background: #623aea; border: none; }
        .uni-gabi-exemplo-avatar-small.user { background: #3c2373; color: #e2dcf2; border-color: #483183; }
        .uni-gabi-exemplo-message-bubble {
          padding: 10px 12px;
          border-radius: 14px;
          font-size: .78rem;
          line-height: 1.5;
          color: #e5e7eb;
        }
        .uni-gabi-exemplo-message.assistant .uni-gabi-exemplo-message-bubble {
          background: #1c2233;
          border: 1px solid #272d42;
          border-bottom-left-radius: 4px;
        }
        .uni-gabi-exemplo-message.user .uni-gabi-exemplo-message-bubble {
          background: #3c2373;
          border: 1px solid #483183;
          color: #e2dcf2;
          border-bottom-right-radius: 4px;
        }
        .uni-gabi-exemplo-message-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
          margin-left: 36px;
        }
        .uni-gabi-exemplo-message.user .uni-gabi-exemplo-message-meta { margin-left: 0; margin-right: 36px; justify-content: flex-end; }
        .uni-gabi-exemplo-hora {
          font-size: .58rem;
          color: #6b7280;
          margin-left: auto;
        }
        .uni-gabi-exemplo-tools {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 4px;
          font-size: .62rem;
          color: #6b7280;
        }
        .uni-gabi-exemplo-tool-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 6px;
          border-radius: 6px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(16,185,129,.25);
          color: #34d399;
          font-size: .58rem;
          font-weight: 600;
        }
        .uni-gabi-exemplo-tool-chip.err { border-color: rgba(239,68,68,.25); color: #f87171; }
        .uni-gabi-exemplo-data-changed {
          font-size: .58rem;
          font-weight: 600;
          color: #fbbf24;
          background: rgba(251,191,36,.12);
          border: 1px solid rgba(251,191,36,.25);
          padding: 2px 6px;
          border-radius: 6px;
        }
        .uni-gabi-exemplo-confirmacao {
          margin-top: 8px;
          margin-left: 36px;
          max-width: 320px;
          padding: 10px 12px;
          border-radius: 10px;
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.1);
          border-left: 3px solid #6366f1;
        }
        .uni-gabi-exemplo-confirmacao--write-destrutiva { border-left-color: #f59e0b; }
        .uni-gabi-exemplo-confirmacao--write-safe { border-left-color: #10b981; }
        .uni-gabi-exemplo-confirmacao-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: .66rem;
          font-weight: 700;
          color: #9ca3af;
          margin-bottom: 6px;
        }
        .uni-gabi-exemplo-confirmacao-classe {
          letter-spacing: .02em;
          font-size: .62rem;
        }
        .uni-gabi-exemplo-confirmacao-pendente {
          margin-left: auto;
          color: #fbbf24;
          font-size: .58rem;
        }
        .uni-gabi-exemplo-confirmacao-desc {
          margin: 0 0 8px;
          font-size: .72rem;
          color: #d1d5db;
          line-height: 1.45;
        }
        .uni-gabi-exemplo-confirmacao-actions {
          display: flex;
          gap: 8px;
        }
        .uni-gabi-exemplo-btn-confirmar,
        .uni-gabi-exemplo-btn-cancelar {
          font-size: .66rem;
          font-weight: 700;
          padding: 5px 10px;
          border-radius: 8px;
          border: 1px solid transparent;
          cursor: default;
        }
        .uni-gabi-exemplo-btn-confirmar {
          background: rgba(16,185,129,.15);
          border-color: rgba(16,185,129,.35);
          color: #6ee7b7;
        }
        .uni-gabi-exemplo-btn-cancelar {
          background: rgba(255,255,255,.04);
          border-color: rgba(255,255,255,.12);
          color: #9ca3af;
        }
        .uni-gabi-exemplo-confirmacao-ok {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: .64rem;
          color: #34d399;
          font-weight: 600;
        }
        .uni-gabi-exemplo-input-mock {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-top: 1px solid rgba(255,255,255,.06);
          font-size: .72rem;
          color: #6b7280;
        }
        .uni-gabi-exemplo-send {
          color: #818cf8;
          font-weight: 700;
          font-size: .66rem;
        }
        .uni-gabi-exemplo-nota {
          margin: 0;
          font-size: .62rem;
          line-height: 1.45;
          color: color-mix(in srgb, var(--ws-text, #f1f5f9) 55%, transparent);
        }
      `}</style>
      <div className="uni-gabi-exemplos-grid">
        {ids.map((id) => {
          const exemplo = EXEMPLOS_CONVERSA_GABI_POR_ID[id]
          if (!exemplo) return null
          return <PainelConversa key={id} exemplo={exemplo} />
        })}
      </div>
    </>
  )
}
