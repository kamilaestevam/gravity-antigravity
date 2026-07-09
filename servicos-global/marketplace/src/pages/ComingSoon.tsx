import { useEffect, useState } from 'react'
import { Rocket } from '@phosphor-icons/react'
import { LogoGlobal } from '@nucleo/logo-global'
import { LAUNCH_DATE, LAUNCH_LABEL } from '../launch'
import '../styles/coming-soon.css'

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

  useEffect(() => {
    const id = setInterval(() => setR(calcularRestante()), 1000)
    return () => clearInterval(id)
  }, [])

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
          </>
        )}
      </div>
    </div>
  )
}
