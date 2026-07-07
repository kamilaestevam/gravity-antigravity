import React from 'react'
import { Anchor, CaretDown, Plus } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'

/** Pin marítimo do mapa Insights — paridade `bfd-map-pin__dot`. */
export function ManualInfograficoPinMapaBidFreteInline() {
  return (
    <span
      role="img"
      aria-label="Pin do mapa"
      style={{
        display: 'inline-flex',
        verticalAlign: 'text-bottom',
        marginLeft: 3,
        marginRight: 2,
        alignItems: 'center',
        justifyContent: 'center',
        width: 18,
        height: 18,
        borderRadius: '50%',
        backgroundColor: '#34d399',
        boxShadow: '0 0 8px rgba(52, 211, 153, 0.6)',
      }}
    >
      <Anchor size={11} weight="bold" color="#000000" aria-hidden />
    </span>
  )
}

function ManualInfograficoIconeInline({ slug }: { slug: string }) {
  if (slug === 'pin-mapa-bid-frete') {
    return <ManualInfograficoPinMapaBidFreteInline />
  }
  return <>{`{{icone:${slug}}}`}</>
}

/** Botão + Novo do BID Frete — paridade `BotaoGlobal` + dropdown Insights/Lista. */
export function ManualInfograficoBotaoNovoBidFreteInline() {
  return (
    <span
      role="img"
      aria-label="Botão Novo"
      style={{
        display: 'inline-flex',
        verticalAlign: 'middle',
        margin: '0 3px',
        transform: 'scale(0.8)',
        transformOrigin: 'left center',
      }}
    >
      <BotaoGlobal
        variante="primario"
        tamanho="pequeno"
        icone={<Plus size={14} weight="bold" />}
        tabIndex={-1}
        aria-hidden
        style={{ pointerEvents: 'none', cursor: 'default' }}
      >
        Novo{' '}
        <CaretDown size={12} weight="bold" style={{ marginLeft: 2 }} />
      </BotaoGlobal>
    </span>
  )
}

export function ManualInfograficoBotaoInline({ slug }: { slug: string }) {
  if (slug === 'novo-bid-frete') {
    return <ManualInfograficoBotaoNovoBidFreteInline />
  }
  return <>{`{{botao:${slug}}}`}</>
}

function renderizarNegrito(texto: string, keyPrefix: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1 ? (
      <strong key={`${keyPrefix}-b-${i}`} style={{ color: '#cbd5e1', fontWeight: 700 }}>
        {parte}
      </strong>
    ) : (
      parte
    ),
  )
}

/** Texto de infográfico com `**negrito**`, `{{icone:…}}` e `{{botao:…}}`. */
export function ManualInfograficoRichText({ texto }: { texto: string }) {
  const partes: React.ReactNode[] = []
  const re = /(\{\{icone:([a-z0-9-]+)\}\}|\{\{botao:([a-z0-9-]+)\}\})/g
  let ultimo = 0
  let match: RegExpExecArray | null
  let ki = 0
  while ((match = re.exec(texto)) !== null) {
    if (match.index > ultimo) {
      partes.push(...[renderizarNegrito(texto.slice(ultimo, match.index), `t-${ki}`)])
    }
    if (match[2] !== undefined) {
      partes.push(<ManualInfograficoIconeInline key={`i-${ki++}`} slug={match[2]} />)
    } else if (match[3] !== undefined) {
      partes.push(<ManualInfograficoBotaoInline key={`b-${ki++}`} slug={match[3]} />)
    }
    ultimo = re.lastIndex
  }
  if (ultimo < texto.length) {
    partes.push(...[renderizarNegrito(texto.slice(ultimo), `t-${ki}`)])
  }
  return <>{partes}</>
}
