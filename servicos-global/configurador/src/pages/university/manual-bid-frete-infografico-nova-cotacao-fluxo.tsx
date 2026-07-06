import React from 'react'
import {
  Airplane,
  Boat,
  CalendarBlank,
  Package,
  TruckTrailer,
  type Icon,
} from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type RamoBidFrete = {
  num: string
  rotulo: string
  descricao: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
  passos: string[]
}

const PASSOS_COMUNS = [
  'Número e tipo de operação',
  'Escolher modal de transporte',
  'Origem e destino (locais)',
  'NCM, HS Code e descrição',
  'Cubagem, Incoterm e valor alvo',
  'Fornecedores, prazo e envio',
]

const RAMOS_MODAL: RamoBidFrete[] = [
  {
    num: 'A',
    rotulo: 'Marítimo',
    descricao: 'Portos de **embarque/destino**, locais de origem e opção **FCL** ou **LCL** no passo de carga.',
    icone: Boat,
    cor: '#38bdf8',
    borda: 'rgba(56,189,248,.32)',
    fundo: 'rgba(56,189,248,.08)',
    passos: ['Portos preferidos', 'Locais door/port', 'FCL ou LCL', 'Cubagem m³'],
  },
  {
    num: 'B',
    rotulo: 'Aéreo',
    descricao: '**Aeroportos** e locais de coleta/entrega; volumes fracionados ou **Aéreo/LCL/Rodo**.',
    icone: Airplane,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.32)',
    fundo: 'rgba(167,139,250,.1)',
    passos: ['Aeroportos origem/destino', 'Quantidade de volumes', 'Peso/cubagem aérea'],
  },
  {
    num: 'C',
    rotulo: 'Rodoviário',
    descricao: 'Trechos **door-to-door** ou combinações com outros modais; volumes e containers conforme operação.',
    icone: TruckTrailer,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.32)',
    fundo: 'rgba(245,158,11,.1)',
    passos: ['Pontos de origem/destino', 'Volumes rodoviários', 'Incoterm e valor alvo'],
  },
]

const RAMOS_CARGA: RamoBidFrete[] = [
  {
    num: '1',
    rotulo: 'FCL',
    descricao: '**Full Container Load** — tipo e quantidade de containers; ideal para cargas que ocupam equipamento fechado.',
    icone: Package,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.32)',
    fundo: 'rgba(52,211,153,.08)',
    passos: ['Tipo de container', 'Quantidade FCL', 'Cubagem consolidada'],
  },
  {
    num: '2',
    rotulo: 'LCL',
    descricao: '**Less than Container Load** — volumes fracionados, embalagens e pesos detalhados por linha.',
    icone: Package,
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.32)',
    fundo: 'rgba(96,165,250,.08)',
    passos: ['Volumes LCL', 'Peso bruto/líquido', 'Cubagem por volume'],
  },
  {
    num: '3',
    rotulo: 'Aéreo / LCL / Rodo',
    descricao: 'Grade **multi-volume** com adicionar/excluir linhas — comum em aéreo e operações mistas.',
    icone: Airplane,
    cor: '#f472b6',
    borda: 'rgba(244,114,182,.32)',
    fundo: 'rgba(244,114,182,.08)',
    passos: ['Quantidade', 'Adicionar container/volume', 'Totais automáticos'],
  },
]

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function CardRamo({ ramo }: { ramo: RamoBidFrete }) {
  const Icone = ramo.icone
  return (
    <div style={{
      borderRadius: 12,
      padding: '14px 14px 12px',
      background: ramo.fundo,
      border: `1px solid ${ramo.borda}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{
          flexShrink: 0,
          width: 36,
          height: 36,
          borderRadius: 9,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(8,12,24,.35)',
          border: `1px solid ${ramo.borda}`,
        }}>
          <Icone size={20} weight="bold" color={ramo.cor} aria-hidden />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{
              fontSize: '.62rem',
              fontWeight: 800,
              letterSpacing: '.06em',
              color: ramo.cor,
            }}>
              {ramo.num}
            </span>
            <p style={{
              margin: 0,
              fontSize: '.78rem',
              fontWeight: 800,
              color: '#e2e8f0',
              lineHeight: 1.35,
            }}>
              {ramo.rotulo}
            </p>
          </div>
          <p style={{ margin: 0, fontSize: '.72rem', lineHeight: 1.45, color: CORPO_70 }}>
            {renderizarNegrito(ramo.descricao)}
          </p>
        </div>
      </div>
      <ul style={{
        margin: 0,
        paddingLeft: 18,
        fontSize: '.68rem',
        lineHeight: 1.5,
        color: CORPO_70,
      }}>
        {ramo.passos.map((passo) => (
          <li key={passo}>{passo}</li>
        ))}
      </ul>
    </div>
  )
}

export function ManualInfograficoBidFreteNovaCotacaoFluxo() {
  return (
    <div style={{
      margin: '20px 0 24px',
      padding: '18px 16px 16px',
      borderRadius: 14,
      border: '1px solid rgba(96,165,250,.22)',
      background: 'linear-gradient(145deg, rgba(15,23,42,.55), rgba(30,41,59,.35))',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <CalendarBlank size={22} weight="duotone" color="#60a5fa" aria-hidden />
        <div>
          <p style={{ margin: 0, fontSize: '.82rem', fontWeight: 800, color: '#e2e8f0' }}>
            Mapa — Nova cotação avulsa manual
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '.72rem', color: CORPO_70, lineHeight: 1.45 }}>
            Trilha **comum** até escolher modal e tipo de carga; depois seguem **ramos paralelos** (como Transferir no Pedido).
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 8,
        marginBottom: 16,
      }}>
        {PASSOS_COMUNS.map((passo, i) => (
          <div
            key={passo}
            style={{
              borderRadius: 10,
              padding: '10px 12px',
              background: 'rgba(8,12,24,.35)',
              border: '1px solid rgba(148,163,184,.15)',
            }}
          >
            <span style={{
              fontSize: '.58rem',
              fontWeight: 800,
              color: '#94a3b8',
              letterSpacing: '.05em',
            }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <p style={{ margin: '4px 0 0', fontSize: '.68rem', fontWeight: 600, color: '#cbd5e1', lineHeight: 1.35 }}>
              {passo}
            </p>
          </div>
        ))}
      </div>

      <p style={{
        margin: '0 0 10px',
        fontSize: '.72rem',
        fontWeight: 700,
        color: '#93c5fd',
        letterSpacing: '.03em',
      }}>
        Ramos no passo 07 — modal de transporte
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 10,
        marginBottom: 18,
      }}>
        {RAMOS_MODAL.map((ramo) => (
          <CardRamo key={ramo.rotulo} ramo={ramo} />
        ))}
      </div>

      <p style={{
        margin: '0 0 10px',
        fontSize: '.72rem',
        fontWeight: 700,
        color: '#93c5fd',
        letterSpacing: '.03em',
      }}>
        Ramos no passo 15 — tipo de carga
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 10,
      }}>
        {RAMOS_CARGA.map((ramo) => (
          <CardRamo key={ramo.rotulo} ramo={ramo} />
        ))}
      </div>
    </div>
  )
}
