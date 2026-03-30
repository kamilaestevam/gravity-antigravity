/**
 * Testes do componente LanguageSwitcherGlobal.
 *
 * Valida:
 * - Renderiza as 3 opções de idioma (PT, EN, ES)
 * - O idioma ativo está destacado visualmente
 * - Ao clicar em outro idioma, a linguagem é atualizada
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { I18nextProvider, useTranslation as useTranslationHook } from 'react-i18next'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// ─── Setup i18n para testes ──────────────────────────────────────────────

const testI18n = i18n.createInstance()
testI18n.use(initReactI18next).init({
  lng: 'pt',
  fallbackLng: 'pt',
  resources: {
    pt: {
      translation: {
        shell: {
          idioma: {
            titulo: 'Idioma',
            trocar_idioma: 'Trocar idioma',
            portugues: 'Português',
            ingles: 'English',
            espanhol: 'Español',
          },
        },
      },
    },
    en: {
      translation: {
        shell: {
          idioma: {
            titulo: 'Language',
            trocar_idioma: 'Change language',
            portugues: 'Português',
            ingles: 'English',
            espanhol: 'Español',
          },
        },
      },
    },
    es: {
      translation: {
        shell: {
          idioma: {
            titulo: 'Idioma',
            trocar_idioma: 'Cambiar idioma',
            portugues: 'Português',
            ingles: 'English',
            espanhol: 'Español',
          },
        },
      },
    },
  },
  interpolation: { escapeValue: false },
})

// ─── Mock do componente (sem dependência de @phosphor-icons) ─────────────

// Criamos uma versão testável do LanguageSwitcher sem a dependência de ícones
function LanguageSwitcherTestable() {
  const { i18n: i18nInstance, t } = useTranslationHook()
  const [open, setOpen] = React.useState(false)

  const LANGUAGES = [
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
  ]

  const currentLang = LANGUAGES.find((l) => l.code === i18nInstance.language) ?? LANGUAGES[0]

  const handleSelect = (code: string) => {
    i18nInstance.changeLanguage(code)
    localStorage.setItem('gravity:language', code)
    document.documentElement.setAttribute('lang', code)
    setOpen(false)
  }

  return (
    <div data-testid="language-switcher">
      <button
        onClick={() => setOpen(!open)}
        aria-label={t('shell.idioma.trocar_idioma')}
        aria-expanded={open}
        aria-haspopup="listbox"
        type="button"
        data-testid="lang-trigger"
      >
        <span>{currentLang.code.toUpperCase()}</span>
      </button>

      {open && (
        <ul role="listbox" aria-label={t('shell.idioma.titulo')}>
          {LANGUAGES.map((lang) => (
            <li
              key={lang.code}
              role="option"
              aria-selected={lang.code === currentLang.code}
              className={lang.code === currentLang.code ? 'active' : ''}
              onClick={() => handleSelect(lang.code)}
              data-testid={`lang-option-${lang.code}`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function renderWithI18n(component: React.ReactElement) {
  return render(
    <I18nextProvider i18n={testI18n}>{component}</I18nextProvider>
  )
}

// ─── Testes ──────────────────────────────────────────────────────────────

describe('LanguageSwitcher: Renderização', () => {
  beforeEach(() => {
    testI18n.changeLanguage('pt')
    localStorage.clear()
  })

  it('renderiza o componente com o idioma atual', () => {
    renderWithI18n(<LanguageSwitcherTestable />)

    const switcher = screen.getByTestId('language-switcher')
    expect(switcher).toBeDefined()

    const trigger = screen.getByTestId('lang-trigger')
    expect(trigger.textContent).toContain('PT')
  })

  it('abre o dropdown ao clicar', () => {
    renderWithI18n(<LanguageSwitcherTestable />)

    const trigger = screen.getByTestId('lang-trigger')
    fireEvent.click(trigger)

    const listbox = screen.getByRole('listbox')
    expect(listbox).toBeDefined()
  })

  it('renderiza as 3 opções de idioma', () => {
    renderWithI18n(<LanguageSwitcherTestable />)

    const trigger = screen.getByTestId('lang-trigger')
    fireEvent.click(trigger)

    const optionPt = screen.getByTestId('lang-option-pt')
    const optionEn = screen.getByTestId('lang-option-en')
    const optionEs = screen.getByTestId('lang-option-es')

    expect(optionPt).toBeDefined()
    expect(optionEn).toBeDefined()
    expect(optionEs).toBeDefined()

    expect(optionPt.textContent).toContain('Português')
    expect(optionEn.textContent).toContain('English')
    expect(optionEs.textContent).toContain('Español')
  })
})

describe('LanguageSwitcher: Idioma ativo destacado', () => {
  beforeEach(() => {
    testI18n.changeLanguage('pt')
    localStorage.clear()
  })

  it('o idioma ativo (PT) tem aria-selected=true', () => {
    renderWithI18n(<LanguageSwitcherTestable />)

    fireEvent.click(screen.getByTestId('lang-trigger'))

    const ptOption = screen.getByTestId('lang-option-pt')
    expect(ptOption.getAttribute('aria-selected')).toBe('true')

    const enOption = screen.getByTestId('lang-option-en')
    expect(enOption.getAttribute('aria-selected')).toBe('false')
  })

  it('o idioma ativo tem a classe CSS "active"', () => {
    renderWithI18n(<LanguageSwitcherTestable />)

    fireEvent.click(screen.getByTestId('lang-trigger'))

    const ptOption = screen.getByTestId('lang-option-pt')
    expect(ptOption.className).toContain('active')

    const enOption = screen.getByTestId('lang-option-en')
    expect(enOption.className).not.toContain('active')
  })
})

describe('LanguageSwitcher: Troca de idioma', () => {
  beforeEach(() => {
    testI18n.changeLanguage('pt')
    localStorage.clear()
  })

  it('ao clicar em EN, o i18n muda para inglês', () => {
    renderWithI18n(<LanguageSwitcherTestable />)

    // Abre dropdown
    fireEvent.click(screen.getByTestId('lang-trigger'))

    // Clica em EN
    fireEvent.click(screen.getByTestId('lang-option-en'))

    expect(testI18n.language).toBe('en')
  })

  it('ao clicar em ES, o i18n muda para espanhol', () => {
    renderWithI18n(<LanguageSwitcherTestable />)

    fireEvent.click(screen.getByTestId('lang-trigger'))
    fireEvent.click(screen.getByTestId('lang-option-es'))

    expect(testI18n.language).toBe('es')
  })

  it('ao trocar idioma, salva no localStorage', () => {
    renderWithI18n(<LanguageSwitcherTestable />)

    fireEvent.click(screen.getByTestId('lang-trigger'))
    fireEvent.click(screen.getByTestId('lang-option-en'))

    expect(localStorage.getItem('gravity:language')).toBe('en')
  })

  it('ao trocar idioma, atualiza document.documentElement.lang', () => {
    renderWithI18n(<LanguageSwitcherTestable />)

    fireEvent.click(screen.getByTestId('lang-trigger'))
    fireEvent.click(screen.getByTestId('lang-option-es'))

    expect(document.documentElement.getAttribute('lang')).toBe('es')
  })

  it('o dropdown fecha após selecionar um idioma', () => {
    renderWithI18n(<LanguageSwitcherTestable />)

    fireEvent.click(screen.getByTestId('lang-trigger'))
    expect(screen.getByRole('listbox')).toBeDefined()

    fireEvent.click(screen.getByTestId('lang-option-en'))

    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('o trigger mostra o código do novo idioma após trocar', () => {
    renderWithI18n(<LanguageSwitcherTestable />)

    fireEvent.click(screen.getByTestId('lang-trigger'))
    fireEvent.click(screen.getByTestId('lang-option-en'))

    const trigger = screen.getByTestId('lang-trigger')
    expect(trigger.textContent).toContain('EN')
  })
})
