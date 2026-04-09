import React, { useState, useRef } from 'react'
import { SelectColunasGlobal } from '@nucleo/select-colunas-global'
import type { ColunaSelectConfig } from '@nucleo/select-colunas-global'

// ── Colunas mock ──────────────────────────────────────────────────────────────

const COLUNAS: ColunaSelectConfig[] = [
  { key: 'numero',      label: 'Número do Pedido',  naoOcultavel: true  },
  { key: 'tipo',        label: 'Tipo de Operação',  naoOcultavel: true  },
  { key: 'status',      label: 'Status'                                  },
  { key: 'empresa',     label: 'Empresa'                                 },
  { key: 'valor',       label: 'Valor Total'                             },
  { key: 'moeda',       label: 'Moeda'                                   },
  { key: 'data',        label: 'Data de Criação'                         },
  { key: 'responsavel', label: 'Responsável'                             },
  { key: 'ncm',         label: 'NCM'                                     },
  { key: 'incoterm',    label: 'Incoterm'                                },
  { key: 'porto',       label: 'Porto de Embarque'                       },
  { key: 'pais',        label: 'País de Origem'                          },
]

const PADRAO = COLUNAS.filter(c => c.naoOcultavel || ['status','empresa','valor','data','responsavel'].includes(c.key)).map(c => c.key)

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [aberto,    setAberto]    = useState(false)
  const [visiveis,  setVisiveis]  = useState<string[]>(PADRAO)
  const [ordem,     setOrdem]     = useState<string[]>(COLUNAS.map(c => c.key))
  const [theme,     setTheme]     = useState<'dark' | 'light'>('dark')
  const btnRef = useRef<HTMLButtonElement>(null)

  function toggle(key: string) {
    setVisiveis(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  function selecionarTodos() {
    setVisiveis(COLUNAS.map(c => c.key))
  }

  function restaurarPadrao() {
    setVisiveis(PADRAO)
    setOrdem(COLUNAS.map(c => c.key))
  }

  function reordenar(fromKey: string, toKey: string) {
    setOrdem(prev => {
      const arr  = [...prev]
      const from = arr.indexOf(fromKey)
      const to   = arr.indexOf(toKey)
      if (from === -1 || to === -1) return prev
      arr.splice(from, 1)
      arr.splice(to, 0, fromKey)
      return arr
    })
  }

  // Colunas ordenadas conforme drag
  const colunasOrdenadas = [...COLUNAS].sort((a, b) => ordem.indexOf(a.key) - ordem.indexOf(b.key))

  return (
    <div className={`demo-shell${theme === 'light' ? ' light-theme' : ''}`}>
      <div className="demo-header">
        <div className="demo-header-title">
          SelectColunasGlobal
          <span className="demo-badge">@nucleo/select-colunas-global v1</span>
        </div>
        <button className="demo-theme-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? '☀ Light' : '☾ Dark'}
        </button>
      </div>

      <div className="demo-content">
        {/* Toolbar */}
        <div className="demo-toolbar">
          <span className="demo-info">
            {visiveis.length} de {COLUNAS.length} colunas visíveis
          </span>
          <div style={{ position: 'relative' }}>
            <button
              ref={btnRef}
              className={`demo-colunas-btn${aberto ? ' demo-colunas-btn--ativo' : ''}`}
              onClick={() => setAberto(v => !v)}
            >
              <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                <path d="M216,48H40A16,16,0,0,0,24,64V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V64A16,16,0,0,0,216,48ZM40,64H80V192H40ZM216,192H96V64H216Z"/>
              </svg>
              Colunas
            </button>

            {aberto && (
              <SelectColunasGlobal
                colunas={COLUNAS}
                colunasVisiveis={visiveis}
                onToggle={toggle}
                onSelecionarTodos={selecionarTodos}
                onRestaurarPadrao={restaurarPadrao}
                onFechar={() => setAberto(false)}
                onReordenar={reordenar}
                triggerRef={btnRef}
                posicao={{ top: 'calc(100% + 6px)', right: 0 }}
              />
            )}
          </div>
        </div>

        {/* Tabela simulada */}
        <div className="demo-tabela-wrap">
          <table className="demo-tabela">
            <thead>
              <tr>
                {colunasOrdenadas
                  .filter(c => visiveis.includes(c.key))
                  .map(c => (
                    <th key={c.key}>{c.label}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map(row => (
                <tr key={row}>
                  {colunasOrdenadas
                    .filter(c => visiveis.includes(c.key))
                    .map(c => (
                      <td key={c.key}>—</td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
