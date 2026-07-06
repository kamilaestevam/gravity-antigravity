import { useEffect, useState, type FormEvent } from 'react'
import {
  Package,
  FileMagnifyingGlass,
  Boat,
  CurrencyDollar,
  Calculator,
  Receipt,
  Bell,
  CheckCircle,
  Rocket,
} from '@phosphor-icons/react'
import { LogoGlobal } from '@nucleo/logo-global'
import { LAUNCH_DATE, LAUNCH_LABEL } from '../launch'
import '../styles/coming-soon.css'

const MODULOS = [
  { nome: 'Pedido', icon: <Package size={16} weight="duotone" /> },
  { nome: 'Smart Docs', icon: <FileMagnifyingGlass size={16} weight="duotone" /> },
  { nome: 'BID Frete', icon: <Boat size={16} weight="duotone" /> },
  { nome: 'BID Câmbio', icon: <CurrencyDollar size={16} weight="duotone" /> },
  { nome: 'Simula Custo', icon: <Calculator size={16} weight="duotone" /> },
  { nome: 'NF Importação', icon: <Receipt size={16} weight="duotone" /> },
]

interface Restante {
  dias: number
  horas: number
  min: number
  seg: number
  acabou: boolean
}

function calcularRestante(): Restante {
  const ms = Math.max(0, LAUNCH_DATE.getTime() - Date.now())
  return {
    dias: Math.floor(ms / 86_400_000),
    horas: Math.floor((ms % 86_400_000) / 3_600_000),
    min: Math.floor((ms % 3_600_000) / 60_000),
    seg: Math.floor((ms % 60_000) / 1_000),
    acabou: ms === 0,
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

export function ComingSoon() {
  const [r, setR] = useState<Restante>(calcularRestante)
  const [email, setEmail] = useState('')
  const [avisado, setAvisado] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setR(calcularRestante()), 1000)
    return () => clearInterval(id)
  }, [])

  function inscrever(e: FormEvent) {
    e.preventDefault()
    const valor = email.trim()
    if (!valor || !valor.includes('@')) return
    try {
      const lista = JSON.parse(localStorage.getItem('gravity_prelaunch_emails') ?? '[]')
      if (Array.isArray(lista) && !lista.includes(valor)) {
        lista.push(valor)
        localStorage.setItem('gravity_prelaunch_emails', JSON.stringify(lista))
      }
    } catch {
      /* localStorage indisponível — ignora, feedback visual ainda ocorre */
    }
    setAvisado(true)
  }

  const unidades: Array<{ valor: string; label: string }> = [
    { valor: String(r.dias), label: 'Dias' },
    { valor: pad(r.horas), label: 'Horas' },
    { valor: pad(r.min), label: 'Min' },
    { valor: pad(r.seg), label: 'Seg' },
  ]

  return (
    <div className="cs-root">
      {/* Fundo decorativo */}
      <div className="cs-orb cs-orb--1" aria-hidden />
      <div className="cs-orb cs-orb--2" aria-hidden />
      <div className="cs-orb cs-orb--3" aria-hidden />
      <div className="cs-grid" aria-hidden />

      <div className="cs-inner">
        <div className="cs-logo">
          <LogoGlobal iconSize={40} />
        </div>

        <span className="cs-badge">
          <span className="cs-badge__dot" aria-hidden />
          Lançamento em breve
        </span>

        <h1 className="cs-title">
          Sua operação de comércio exterior,{' '}
          <span className="cs-title__accent">no próximo nível.</span>
        </h1>

        <p className="cs-subtitle">
          A plataforma modular que unifica pedidos, fretes, câmbio, notas fiscais e
          IA documental. Estamos nos últimos ajustes — falta pouco.
        </p>

        {r.acabou ? (
          <a className="cs-live__btn" href="/login">
            <Rocket size={18} weight="duotone" />
            Estamos no ar — acessar
          </a>
        ) : (
          <>
            <div className="cs-countdown" role="timer" aria-label={`Faltam ${r.dias} dias para o lançamento`}>
              {unidades.map(u => (
                <div key={u.label} className="cs-unit">
                  <span className="cs-unit__num">{u.valor}</span>
                  <span className="cs-unit__label">{u.label}</span>
                </div>
              ))}
            </div>

            <span className="cs-date">
              Lançamento em <strong>{LAUNCH_LABEL}</strong>
            </span>

            {avisado ? (
              <span className="cs-notify--ok">
                <CheckCircle size={18} weight="fill" />
                Pronto! Você será avisado no lançamento.
              </span>
            ) : (
              <form className="cs-notify" onSubmit={inscrever}>
                <input
                  className="cs-notify__input"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  aria-label="Seu e-mail para ser avisado no lançamento"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <button className="cs-notify__btn" type="submit">
                  <Bell size={16} weight="duotone" />
                  Avise-me
                </button>
              </form>
            )}
          </>
        )}

        <div className="cs-teaser">
          <span className="cs-teaser__label">O que vem aí</span>
          <div className="cs-chips">
            {MODULOS.map(m => (
              <span key={m.nome} className="cs-chip">
                {m.icon}
                {m.nome}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="cs-foot">
        © 2026 Gravity · Comércio exterior inteligente
      </div>
    </div>
  )
}
