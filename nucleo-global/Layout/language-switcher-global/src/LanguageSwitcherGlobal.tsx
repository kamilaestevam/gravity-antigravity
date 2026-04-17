/**
 * LanguageSwitcherGlobal — Seletor de idioma da plataforma Gravity.
 *
 * Renderiza um dropdown compacto com os 3 idiomas principais (PT, EN, ES).
 * Ao trocar, dispara i18next.changeLanguage() e persiste no localStorage.
 *
 * Regra nucleo-global: componente puro, sem estado de servidor.
 * A persistência em localStorage é responsabilidade do Shell — aqui
 * apenas chamamos changeLanguage() e disparamos o callback.
 */
import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { GlobeHemisphereWest } from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { changeLanguageLazy, type SupportedLanguage } from '@nucleo/Utilidades/localization/i18n'
import './language-switcher-global.css'

interface LanguageOption {
  code: string
  label: string
  flag: string
}

const LANGUAGES: LanguageOption[] = [
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
]

interface LanguageSwitcherGlobalProps {
  onLanguageChange?: (lang: string) => void
  iconOnly?: boolean
}

export function LanguageSwitcherGlobal({ onLanguageChange, iconOnly = false }: LanguageSwitcherGlobalProps) {
  const { i18n, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) ?? LANGUAGES[0]

  const handleSelect = (code: string) => {
    changeLanguageLazy(code as SupportedLanguage)
    localStorage.setItem('gravity:language', code)
    document.documentElement.setAttribute('lang', code)
    setOpen(false)
    onLanguageChange?.(code)
  }

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="lang-switcher" ref={ref} data-testid="language-switcher">
      <TooltipGlobal descricao={t('shell.idioma.trocar_idioma')}>
        <button
          className={`lang-switcher__trigger${iconOnly ? ' lang-switcher__trigger--icon' : ''}`}
          onClick={() => setOpen(!open)}
          aria-label={t('shell.idioma.trocar_idioma')}
          aria-expanded={open}
          aria-haspopup="listbox"
          type="button"
        >
          <span className="lang-switcher__active-flag" aria-hidden="true">{currentLang.flag}</span>
          {!iconOnly && <span className="lang-switcher__code">{currentLang.code.toUpperCase()}</span>}
        </button>
      </TooltipGlobal>

      {open && (
        <ul
          className="lang-switcher__dropdown"
          role="listbox"
          aria-label={t('shell.idioma.titulo')}
        >
          {LANGUAGES.map((lang) => (
            <li
              key={lang.code}
              role="option"
              aria-selected={lang.code === currentLang.code}
              className={`lang-switcher__option${lang.code === currentLang.code ? ' lang-switcher__option--active' : ''}`}
              onClick={() => handleSelect(lang.code)}
              data-testid={`lang-option-${lang.code}`}
            >
              <span className="lang-switcher__flag" aria-hidden="true">{lang.flag}</span>
              <span className="lang-switcher__label">{lang.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
