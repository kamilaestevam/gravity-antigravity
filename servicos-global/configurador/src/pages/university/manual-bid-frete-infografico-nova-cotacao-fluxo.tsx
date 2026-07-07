import React from 'react'
import {
  Airplane,
  Boat,
  CheckCircle,
  ListChecks,
  Package,
  TruckTrailer,
  type Icon,
} from '@phosphor-icons/react'
import { ManualInfograficoRichText } from './manual-infografico-rich-text'

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
  'Abrir wizard na Lista',
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
    descricao: 'Portos de **embarque/destino**, locais door/port e bifurcação **FCL** ou **LCL** no passo de carga.',
    icone: Boat,
    cor: '#38bdf8',
    borda: 'rgba(56,189,248,.32)',
    fundo: 'rgba(56,189,248,.08)',
    passos: ['Portos preferenciais', 'Locais origem/destino', 'FCL ou LCL', 'Cubagem m³'],
  },
  {
    num: 'B',
    rotulo: 'Aéreo',
    descricao: '**Aeroportos** e locais de coleta/entrega; volumes fracionados ou grade **Aéreo/LCL/Rodo**.',
    icone: Airplane,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.32)',
    fundo: 'rgba(167,139,250,.1)',
    passos: ['Aeroportos origem/destino', 'Quantidade de volumes', 'Peso/cubagem aérea'],
  },
  {
    num: 'C',
    rotulo: 'Rodoviário',
    descricao: 'Trechos **door-to-door** ou combinações com outros modais; volumes conforme a operação.',
    icone: TruckTrailer,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.32)',
    fundo: 'rgba(245,158,11,.1)',
    passos: ['Pontos origem/destino', 'Volumes rodoviários', 'Incoterm e valor alvo'],
  },
]

const RAMOS_CARGA: RamoBidFrete[] = [
  {
    num: '1',
    rotulo: 'FCL',
    descricao: '**Full Container Load** — tipo e quantidade de containers; ideal para equipamento fechado.',
    icone: Package,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.32)',
    fundo: 'rgba(52,211,153,.08)',
    passos: ['Tipo de container', 'Quantidade FCL', 'Cubagem consolidada'],
  },
  {
    num: '2',
    rotulo: 'LCL',
    descricao: '**Less than Container Load** — volumes fracionados, embalagens e pesos por linha.',
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
    passos: ['Quantidade', 'Adicionar volume', 'Totais automáticos'],
  },
]

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
            <ManualInfograficoRichText texto={ramo.descricao} />
          </p>
        </div>
      </div>
      <ul style={{
        margin: 0,
        padding: '0 0 0 16px',
        fontSize: '.64rem',
        lineHeight: 1.45,
        color: CORPO_70,
      }}>
        {ramo.passos.map((passo) => (
          <li key={passo} style={{ marginBottom: 3 }}>{passo}</li>
        ))}
      </ul>
    </div>
  )
}

/** Manual BID Frete § Nova cotação — mapa mental trilha comum + ramos modal/carga (paridade Transferir). */
export function ManualInfograficoBidFreteNovaCotacaoFluxo() {
  return (
    <div
      role="group"
      aria-label="Mapa mental do wizard Nova cotação avulsa manual — trilha comum e ramos"
      style={{
        background: 'linear-gradient(165deg, rgba(56,189,248,.09) 0%, rgba(148,163,184,.04) 42%, rgba(52,211,153,.05) 100%)',
        border: '1px solid rgba(148,163,184,.18)',
        borderRadius: 14,
        padding: '18px 18px 16px',
        marginTop: 20,
        marginBottom: 24,
        boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 14,
        marginBottom: 14,
        flexWrap: 'wrap',
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Package size={18} weight="duotone" color="#38bdf8" aria-hidden />
            <span style={{
              fontSize: '.62rem',
              fontWeight: 800,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: '#bae6fd',
              background: 'rgba(56,189,248,.12)',
              border: '1px solid rgba(56,189,248,.32)',
              borderRadius: 999,
              padding: '4px 10px',
            }}>
              3 modais · 3 tipos de carga · 1 wizard
            </span>
          </div>
          <p style={{
            margin: 0,
            fontSize: '.9rem',
            fontWeight: 800,
            color: '#f1f5f9',
            lineHeight: 1.35,
          }}>
            Mesmo assistente, ramos paralelos — telas parecidas
          </p>
          <p style={{
            margin: '8px 0 0',
            fontSize: '.74rem',
            lineHeight: 1.5,
            color: CORPO_70,
          }}>
            <ManualInfograficoRichText texto="Todos começam na **Lista** com **Nova cotação**. Depois do **modal** (passo **09**) e do **tipo de carga** (passo **39**), cada ramo repete **cubagem → fornecedores → envio** até o **resultado na Lista**." />
          </p>
        </div>
      </div>

      <div style={{
        borderRadius: 10,
        padding: '10px 12px',
        background: 'rgba(8,12,24,.25)',
        border: '1px solid rgba(148,163,184,.12)',
        marginBottom: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <ListChecks size={14} weight="duotone" color="#94a3b8" aria-hidden />
          <span style={{
            fontSize: '.62rem',
            fontWeight: 800,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            color: '#94a3b8',
          }}>
            Trilha comum (todos os ramos)
          </span>
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          alignItems: 'center',
        }}>
          {PASSOS_COMUNS.map((passo, idx) => (
            <React.Fragment key={passo}>
              <span style={{
                fontSize: '.62rem',
                fontWeight: 700,
                color: '#cbd5e1',
                background: 'rgba(148,163,184,.1)',
                border: '1px solid rgba(148,163,184,.2)',
                borderRadius: 999,
                padding: '4px 10px',
              }}>
                {passo}
              </span>
              {idx < PASSOS_COMUNS.length - 1 ? (
                <span style={{ color: '#64748b', fontSize: '.7rem' }} aria-hidden>→</span>
              ) : null}
            </React.Fragment>
          ))}
        </div>
      </div>

      <p style={{
        margin: '0 0 10px',
        fontSize: '.72rem',
        fontWeight: 700,
        color: '#93c5fd',
        letterSpacing: '.03em',
      }}>
        Ramos no passo 09 — modal de transporte
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 12,
        marginBottom: 14,
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
        Ramos no passo 39 — tipo de carga
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 12,
        marginBottom: 14,
      }}>
        {RAMOS_CARGA.map((ramo) => (
          <CardRamo key={ramo.rotulo} ramo={ramo} />
        ))}
      </div>

      <div style={{
        borderRadius: 10,
        padding: '10px 12px',
        background: 'rgba(8,12,24,.25)',
        border: '1px solid rgba(148,163,184,.12)',
        fontSize: '.68rem',
        lineHeight: 1.5,
        color: CORPO_70,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
      }}>
        <CheckCircle size={16} weight="duotone" color="#34d399" aria-hidden style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ margin: 0 }}>
          <ManualInfograficoRichText texto="**Marítimo** + **Aéreo** + **Rodoviário** cruzados com **FCL**, **LCL** e **Aéreo/LCL/Rodo** = cobertura completa do wizard. Os passos **43–73** (cubagem, fornecedores e envio) são **compartilhados** após escolher o tipo de carga." />
        </p>
      </div>
    </div>
  )
}
