import React from 'react'
import { ArrowRight, Equals, Minus, Plus, type Icon } from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

export type TransferirResultadoVariant = 'novo' | 'existente' | 'reducao'

/** Exemplo numérico ilustrativo — só para leitura do manual, não reflete um PO real. */
const EXEMPLO = {
  qtdInicial: '1.000',
  qtdOperacao: '200',
  saldoOrigemAntes: '800',
  saldoOrigemDepois: '600',
  saldoDestinoAntes: '500',
  saldoDestinoDepois: '700',
  saldoNovoPo: '200',
}

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function CelulaMetrica({
  rotulo,
  valor,
  destaque = false,
  cor = '#818cf8',
}: {
  rotulo: string
  valor: string
  destaque?: boolean
  cor?: string
}) {
  return (
    <div style={{
      borderRadius: 10,
      padding: '10px 12px',
      background: destaque ? 'rgba(99,102,241,.1)' : 'rgba(8,12,24,.28)',
      border: `1px solid ${destaque ? 'rgba(129,140,248,.35)' : 'rgba(148,163,184,.14)'}`,
      minWidth: 0,
    }}>
      <p style={{
        margin: 0,
        fontSize: '.58rem',
        fontWeight: 800,
        letterSpacing: '.06em',
        textTransform: 'uppercase',
        color: '#94a3b8',
        lineHeight: 1.3,
      }}>
        {rotulo}
      </p>
      <p style={{
        margin: '5px 0 0',
        fontSize: destaque ? '1.05rem' : '.92rem',
        fontWeight: 800,
        color: destaque ? cor : '#e2e8f0',
        lineHeight: 1.2,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {valor}
      </p>
    </div>
  )
}

function LinhaCalculo({
  icone: Icone,
  texto,
  cor,
}: {
  icone: Icon
  texto: string
  cor: string
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: '.68rem',
      lineHeight: 1.45,
      color: CORPO_70,
    }}>
      <Icone size={14} weight="bold" color={cor} aria-hidden style={{ flexShrink: 0 }} />
      <span>{renderizarNegrito(texto)}</span>
    </div>
  )
}

function PainelPedido({
  titulo,
  cor,
  borda,
  fundo,
  children,
}: {
  titulo: string
  cor: string
  borda: string
  fundo: string
  children: React.ReactNode
}) {
  return (
    <div style={{
      borderRadius: 12,
      padding: '12px 12px 10px',
      background: fundo,
      border: `1px solid ${borda}`,
      minWidth: 0,
    }}>
      <p style={{
        margin: '0 0 10px',
        fontSize: '.68rem',
        fontWeight: 800,
        letterSpacing: '.05em',
        textTransform: 'uppercase',
        color: cor,
      }}>
        {titulo}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {children}
      </div>
    </div>
  )
}

function ConteudoExistenteOuNovo({ variant }: { variant: 'novo' | 'existente' }) {
  const rotuloDestino = variant === 'novo' ? 'Novo PO (destino)' : 'PO destino'
  const saldoDestinoDepois = variant === 'novo' ? EXEMPLO.saldoNovoPo : EXEMPLO.saldoDestinoDepois
  const saldoDestinoAntes = variant === 'novo' ? '0' : EXEMPLO.saldoDestinoAntes

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 8,
        marginBottom: 12,
      }}>
        <CelulaMetrica rotulo="Quantidade inicial (origem)" valor={EXEMPLO.qtdInicial} />
        <CelulaMetrica rotulo="Quantidade transferida" valor={EXEMPLO.qtdOperacao} destaque cor="#60a5fa" />
        <CelulaMetrica rotulo="Saldo origem (depois)" valor={EXEMPLO.saldoOrigemDepois} destaque cor="#f87171" />
        <CelulaMetrica rotulo={`Saldo ${variant === 'novo' ? 'novo PO' : 'destino'} (depois)`} valor={saldoDestinoDepois} destaque cor="#34d399" />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 10,
        marginBottom: 12,
      }}>
        <PainelPedido
          titulo="Pedido de origem"
          cor="#f87171"
          borda="rgba(248,113,113,.28)"
          fundo="rgba(248,113,113,.06)"
        >
          <CelulaMetrica rotulo="Qtd. inicial" valor={EXEMPLO.qtdInicial} />
          <CelulaMetrica rotulo="Saldo antes" valor={EXEMPLO.saldoOrigemAntes} />
          <LinhaCalculo
            icone={Minus}
            cor="#f87171"
            texto={`Transferiu **−${EXEMPLO.qtdOperacao}**`}
          />
          <CelulaMetrica rotulo="Saldo depois" valor={EXEMPLO.saldoOrigemDepois} destaque cor="#f87171" />
        </PainelPedido>

        <PainelPedido
          titulo={rotuloDestino}
          cor="#34d399"
          borda="rgba(52,211,153,.28)"
          fundo="rgba(52,211,153,.06)"
        >
          {variant === 'existente' ? (
            <CelulaMetrica rotulo="Qtd. inicial do destino" valor={EXEMPLO.qtdInicial} />
          ) : (
            <CelulaMetrica rotulo="Linha nova na Lista" valor="PO recém-criado" />
          )}
          <CelulaMetrica rotulo="Saldo antes" valor={saldoDestinoAntes} />
          <LinhaCalculo
            icone={Plus}
            cor="#34d399"
            texto={`Recebeu **+${EXEMPLO.qtdOperacao}**`}
          />
          <CelulaMetrica rotulo="Saldo depois" valor={saldoDestinoDepois} destaque cor="#34d399" />
        </PainelPedido>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '6px 10px',
        borderRadius: 10,
        padding: '10px 12px',
        background: 'rgba(8,12,24,.25)',
        border: '1px solid rgba(148,163,184,.12)',
        fontSize: '.66rem',
        lineHeight: 1.45,
        color: CORPO_70,
      }}>
        <span style={{ fontWeight: 700, color: '#cbd5e1' }}>Regra rápida:</span>
        <span>Qtd. inicial **não muda**</span>
        <ArrowRight size={12} color="#64748b" aria-hidden />
        <span>Saldo origem **− transferido**</span>
        <ArrowRight size={12} color="#64748b" aria-hidden />
        <span>Saldo destino **+ transferido**</span>
      </div>
    </>
  )
}

function ConteudoReducao() {
  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 8,
        marginBottom: 12,
      }}>
        <CelulaMetrica rotulo="Quantidade inicial" valor={EXEMPLO.qtdInicial} />
        <CelulaMetrica rotulo="Quantidade reduzida" valor={EXEMPLO.qtdOperacao} destaque cor="#fbbf24" />
        <CelulaMetrica rotulo="Saldo depois" valor={EXEMPLO.saldoOrigemDepois} destaque cor="#fbbf24" />
      </div>

      <PainelPedido
        titulo="Item de origem (sem destino)"
        cor="#fbbf24"
        borda="rgba(251,191,36,.28)"
        fundo="rgba(245,158,11,.08)"
      >
        <CelulaMetrica rotulo="Qtd. inicial" valor={EXEMPLO.qtdInicial} />
        <CelulaMetrica rotulo="Saldo antes" valor={EXEMPLO.saldoOrigemAntes} />
        <LinhaCalculo
          icone={Minus}
          cor="#fbbf24"
          texto={`Reduziu **−${EXEMPLO.qtdOperacao}**`}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Equals size={14} weight="bold" color="#94a3b8" aria-hidden />
          <span style={{ fontSize: '.68rem', color: CORPO_70 }}>
            Saldo final = saldo antes − quantidade reduzida
          </span>
        </div>
        <CelulaMetrica rotulo="Saldo depois" valor={EXEMPLO.saldoOrigemDepois} destaque cor="#fbbf24" />
      </PainelPedido>

      <p style={{
        margin: '10px 0 0',
        fontSize: '.66rem',
        lineHeight: 1.45,
        color: CORPO_70,
      }}>
        {renderizarNegrito('**Qtd. inicial** permanece histórica; só o **saldo** reflete a redução na Lista.')}
      </p>
    </>
  )
}

const SUBTITULOS: Record<TransferirResultadoVariant, string> = {
  novo: 'Após confirmar — o que conferir na Lista (origem + novo PO)',
  existente: 'Após confirmar — o que conferir na Lista (origem + destino)',
  reducao: 'Após confirmar — o que conferir na Lista (só origem)',
}

/** Manual Pedido § Transferir — mapa UX 10 das quatro métricas (inicial, transferida/reduzida, saldos). */
export function ManualInfograficoPedidoListaTransferirResultadoEsperado({
  variant,
}: {
  variant: TransferirResultadoVariant
}) {
  return (
    <div
      role="group"
      aria-label="Resultado esperado na Lista após transferência ou redução"
      style={{
        background: 'linear-gradient(165deg, rgba(99,102,241,.08) 0%, rgba(148,163,184,.04) 48%, rgba(52,211,153,.05) 100%)',
        border: '1px solid rgba(148,163,184,.16)',
        borderRadius: 14,
        padding: '16px 16px 14px',
        marginBottom: 12,
        boxShadow: '0 8px 28px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.04)',
      }}
    >
      <p style={{
        fontSize: '.62rem',
        fontWeight: 800,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: '#94a3b8',
        margin: '0 0 4px',
      }}>
        Resultado esperado
      </p>
      <p style={{
        margin: '0 0 12px',
        fontSize: '.78rem',
        fontWeight: 700,
        color: '#e2e8f0',
        lineHeight: 1.4,
      }}>
        {SUBTITULOS[variant]}
      </p>
      <p style={{
        margin: '0 0 12px',
        fontSize: '.64rem',
        lineHeight: 1.45,
        color: CORPO_70,
      }}>
        Exemplo ilustrativo com {renderizarNegrito(`**${EXEMPLO.qtdOperacao} un.**`)} transferidas/reduzidas — substitua pelos valores do seu PO.
      </p>
      {variant === 'reducao'
        ? <ConteudoReducao />
        : <ConteudoExistenteOuNovo variant={variant} />}
    </div>
  )
}
