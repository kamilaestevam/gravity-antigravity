/**
 * refactor-cotacao-nova.mjs — Migra cotacao-nova.tsx para ModalPassoPassoGlobal + Cadastros SSOT.
 * Uso: node servicos-global/produto/bid-frete-internacional/client/scripts/refactor-cotacao-nova.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const filePath = path.resolve(__dirname, '../src/pages/cotacao-nova.tsx')
let content = fs.readFileSync(filePath, 'utf8')

// ── 1. Imports ─────────────────────────────────────────────────────────────
content = content.replace(
  /import React, \{ useState, useEffect, useRef, useCallback \} from 'react'/,
  "import React, { useState, useEffect, useCallback, useMemo } from 'react'",
)
content = content.replace(
  /import \{ useNavigate \} from 'react-router-dom'/,
  "import { useNavigate, useSearchParams } from 'react-router-dom'",
)
content = content.replace(
  /import \{[\s\S]*?\} from '@phosphor-icons\/react'/,
  `import {
  Truck,
  ArrowLeft,
  ArrowRight,
  Anchor,
  AirplaneTilt,
  Van,
  Package,
  MapPin,
  Scales,
  Users,
  FileText,
  CheckCircle,
  Info,
} from '@phosphor-icons/react'

import { ModalPassoPassoGlobal, type PassoConfig } from '@nucleo/modal-passo-passo-global'
import { SelectGlobal, type SelectOpcao } from '@nucleo/campo-select-global'`,
)
content = content.replace(
  /import \{ criarCotacao, getPaises, getPortos, getAeroportos, getContainers \} from '\.\.\/shared\/api'/,
  "import { criarCotacao, getContainers } from '../shared/api'\nimport { useAeroportosPorPais, usePaisesCadastros, usePortosPorPais } from '../shared/useCadastrosLogistica'",
)
content = content.replace(
  /import type \{[\s\S]*?ContainerOption,\n\} from '\.\.\/shared\/types'/,
  `import type {
  TipoOperacao,
  ModalFrete,
  ModalidadeCarga,
  Visibilidade,
  ContainerOption,
} from '../shared/types'`,
)

// ── 2. Remove autocomplete helper ───────────────────────────────────────────
content = content.replace(
  /\/\/ ─── Autocomplete Helper ─[\s\S]*?return \{ query, setQuery, options, open, setOpen, loading, wrapperRef \}\n\}\n\n/,
  '',
)

// ── 3. OPCOES_ESTADOS_BR after UFS ──────────────────────────────────────────
if (!content.includes('OPCOES_ESTADOS_BR')) {
  content = content.replace(
    /const UFS_BRASIL = \[[\s\S]*?\]\n\n/,
    (m) =>
      `${m}const OPCOES_ESTADOS_BR: SelectOpcao[] = [
  { valor: '', rotulo: 'Selecione...' },
  ...UFS_BRASIL.map((uf) => ({ valor: uf, rotulo: uf })),
]

`,
  )
}

// ── 4. Short descriptions ───────────────────────────────────────────────────
content = content.replace(
  /const MODAL_DESCS: Record<ModalFrete, string> = \{[\s\S]*?\}/,
  `const MODAL_DESCS: Record<ModalFrete, string> = {
  MARITIMO: 'Alto volume, menor custo',
  AEREO: 'Entrega rápida e expressa',
  RODOVIARIO: 'Flexível e porta a porta',
}`,
)

// ── 5. Field className ────────────────────────────────────────────────────────
content = content.replace(
  /function Field\(\{\n  label,\n  required,\n  children,\n\}: \{\n  label: string\n  required\?: boolean\n  children: React\.ReactNode\n\}\)/,
  `function Field({
  label,
  required,
  children,
  className,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  className?: string
})`,
)
content = content.replace(
  /return \(\n    <div className="nc-field">/,
  'return (\n    <div className={`nc-field${className ? ` ${className}` : \'\'}`}>',
)

// ── 6. Replace hooks block in NovaCotacao ─────────────────────────────────────
content = content.replace(
  /  \/\/ Autocompletes[\s\S]*?  \/\/ Carregar containers ao montar/,
  `  const ROTA_LISTA = '/bid-frete/cotacoes'

  const { paises: paisesCadastro, opcoes: opcoesPaises, carregando: carregandoPaises } = usePaisesCadastros()
  const paisOrigemCodigo = form.origem_pais_cotacao_bid_frete_internacional
  const paisDestinoCodigo = form.destino_pais_cotacao_bid_frete_internacional
  const {
    portos: portosOrigem,
    opcoes: opcoesPortosOrigem,
    carregando: carregandoPortosOrigem,
  } = usePortosPorPais(form.modal_cotacao_bid_frete_internacional === 'MARITIMO' ? paisOrigemCodigo : '')
  const {
    portos: portosDestino,
    opcoes: opcoesPortosDestino,
    carregando: carregandoPortosDestino,
  } = usePortosPorPais(form.modal_cotacao_bid_frete_internacional === 'MARITIMO' ? paisDestinoCodigo : '')
  const {
    aeroportos: aeroportosOrigem,
    opcoes: opcoesAeroportosOrigem,
    carregando: carregandoAeroportosOrigem,
  } = useAeroportosPorPais(form.modal_cotacao_bid_frete_internacional === 'AEREO' ? paisOrigemCodigo : '')
  const {
    aeroportos: aeroportosDestino,
    opcoes: opcoesAeroportosDestino,
    carregando: carregandoAeroportosDestino,
  } = useAeroportosPorPais(form.modal_cotacao_bid_frete_internacional === 'AEREO' ? paisDestinoCodigo : '')

  const rotuloPais = useCallback(
    (codigo: string) => {
      const pais = paisesCadastro.find((p) => p.codigo_pais_iso_alpha2 === codigo)
      return pais ? \`\${pais.nome_pais_portugues} (\${codigo})\` : codigo
    },
    [paisesCadastro],
  )

  const rotuloPorto = useCallback(
    (codigo: string, portos: typeof portosOrigem) => {
      const porto = portos.find((p) => p.codigo_unlocode_porto === codigo)
      return porto ? \`\${porto.nome_porto} (\${codigo})\` : codigo
    },
    [],
  )

  const rotuloAeroporto = useCallback(
    (iata: string, aeroportos: typeof aeroportosOrigem) => {
      const aeroporto = aeroportos.find((a) => a.codigo_iata_aeroporto === iata)
      return aeroporto ? \`\${aeroporto.nome_aeroporto} (\${iata})\` : iata
    },
    [],
  )

  const aoMudarPaisOrigem = (valor: string | number | null) => {
    const codigo = String(valor ?? '')
    setForm((prev) => ({
      ...prev,
      origem_pais_cotacao_bid_frete_internacional: codigo,
      origem_pais_nome: codigo ? rotuloPais(codigo) : '',
      estado_provincia_origem_cotacao_bid_frete_internacional: '',
      origem_codigo_cotacao_bid_frete_internacional: '',
      origem_nome_cotacao_bid_frete_internacional: '',
      aeroporto_origem_cotacao_bid_frete_internacional: '',
      aeroporto_origem_nome: '',
    }))
  }

  const aoMudarPaisDestino = (valor: string | number | null) => {
    const codigo = String(valor ?? '')
    setForm((prev) => ({
      ...prev,
      destino_pais_cotacao_bid_frete_internacional: codigo,
      destino_pais_nome: codigo ? rotuloPais(codigo) : '',
      estado_provincia_destino_cotacao_bid_frete_internacional: '',
      destino_codigo_cotacao_bid_frete_internacional: '',
      destino_nome_cotacao_bid_frete_internacional: '',
      aeroporto_destino_cotacao_bid_frete_internacional: '',
      aeroporto_destino_nome: '',
    }))
  }

  const aoMudarPortoOrigem = (valor: string | number | null) => {
    const codigo = String(valor ?? '')
    setForm((prev) => ({
      ...prev,
      origem_codigo_cotacao_bid_frete_internacional: codigo,
      origem_nome_cotacao_bid_frete_internacional: codigo ? rotuloPorto(codigo, portosOrigem) : '',
    }))
  }

  const aoMudarPortoDestino = (valor: string | number | null) => {
    const codigo = String(valor ?? '')
    setForm((prev) => ({
      ...prev,
      destino_codigo_cotacao_bid_frete_internacional: codigo,
      destino_nome_cotacao_bid_frete_internacional: codigo ? rotuloPorto(codigo, portosDestino) : '',
    }))
  }

  const aoMudarAeroportoOrigem = (valor: string | number | null) => {
    const iata = String(valor ?? '')
    setForm((prev) => ({
      ...prev,
      aeroporto_origem_cotacao_bid_frete_internacional: iata,
      aeroporto_origem_nome: iata ? rotuloAeroporto(iata, aeroportosOrigem) : '',
    }))
  }

  const aoMudarAeroportoDestino = (valor: string | number | null) => {
    const iata = String(valor ?? '')
    setForm((prev) => ({
      ...prev,
      aeroporto_destino_cotacao_bid_frete_internacional: iata,
      aeroporto_destino_nome: iata ? rotuloAeroporto(iata, aeroportosDestino) : '',
    }))
  }

  // Carregar containers ao montar`,
)

// Remove stepStatus if only used in old render
content = content.replace(
  /  const stepStatus = \(passoId: number\): 'pendente' \| 'ativo' \| 'feito' => \{[\s\S]*?\}\n\n/,
  '',
)

// Fix anonima typo in handleSubmit
content = content.replace(
  /anonima_cotacao_bid_frete_internacional: form\.anonima_cotacao_bid_frete_internacional_cotacao_bid_frete_internacional,/,
  'anonima_cotacao_bid_frete_internacional: form.anonima_cotacao_bid_frete_internacional,',
)

// ── 7. STEP 2 origem ──────────────────────────────────────────────────────────
const step2New = `      // STEP 2 — Origem
      case 2:
        return (
          <div className="nc-step-content">
            <div className="nc-location-visual-card nc-location-visual-card--origin">
              <div className="nc-location-visual-header">
                <div className="nc-location-visual-circle">
                  <MapPin weight="duotone" size={26} className="nc-pulsing-icon" />
                </div>
                <div className="nc-location-visual-text">
                  <h4>{modal === 'AEREO' ? 'Aeroporto de Origem' : modal === 'RODOVIARIO' ? 'Local de Origem' : t('bidfrete.nova_cotacao.porto_origem')}</h4>
                  <p className="nc-caption">{modal === 'AEREO' ? 'Selecione o país e o aeroporto de partida' : modal === 'RODOVIARIO' ? 'Selecione o país e estado/província de coleta' : 'Selecione o país e o porto de embarque'}</p>
                </div>
              </div>

              <div className="nc-fields-grid nc-fields-grid--location-new">
                <Field label="PAÍS" required>
                  <SelectGlobal
                    iconeEsquerda={<MapPin size={16} />}
                    opcoes={opcoesPaises}
                    valor={form.origem_pais_cotacao_bid_frete_internacional || null}
                    aoMudarValor={aoMudarPaisOrigem}
                    placeholder="Selecione o país..."
                    buscavel
                    carregando={carregandoPaises}
                    posicao="auto"
                  />
                </Field>

                <Field label="ESTADO / PROVÍNCIA">
                  {form.origem_pais_cotacao_bid_frete_internacional === 'BR' ? (
                    <SelectGlobal
                      opcoes={OPCOES_ESTADOS_BR}
                      valor={form.estado_provincia_origem_cotacao_bid_frete_internacional || null}
                      aoMudarValor={(v) => set('estado_provincia_origem_cotacao_bid_frete_internacional', String(v ?? ''))}
                      placeholder="Selecione o UF"
                      buscavel
                      desabilitado={!form.origem_pais_cotacao_bid_frete_internacional}
                      posicao="auto"
                    />
                  ) : (
                    <input
                      className="nc-input"
                      placeholder="Ex: Guangdong"
                      value={form.estado_provincia_origem_cotacao_bid_frete_internacional}
                      onChange={(e) => set('estado_provincia_origem_cotacao_bid_frete_internacional', e.target.value)}
                    />
                  )}
                </Field>

                {modal === 'MARITIMO' && (
                  <Field label="PORTO DE EMBARQUE" required className="nc-field--span-2">
                    <SelectGlobal
                      iconeEsquerda={<Anchor size={16} />}
                      opcoes={opcoesPortosOrigem}
                      valor={form.origem_codigo_cotacao_bid_frete_internacional || null}
                      aoMudarValor={aoMudarPortoOrigem}
                      placeholder={
                        form.origem_pais_cotacao_bid_frete_internacional
                          ? 'Selecione o porto...'
                          : 'Selecione o país primeiro'
                      }
                      buscavel
                      carregando={carregandoPortosOrigem}
                      desabilitado={!form.origem_pais_cotacao_bid_frete_internacional}
                      posicao="auto"
                    />
                  </Field>
                )}

                {modal === 'AEREO' && (
                  <Field label="AEROPORTO DE EMBARQUE" required className="nc-field--span-2">
                    <SelectGlobal
                      iconeEsquerda={<AirplaneTilt size={16} />}
                      opcoes={opcoesAeroportosOrigem}
                      valor={form.aeroporto_origem_cotacao_bid_frete_internacional || null}
                      aoMudarValor={aoMudarAeroportoOrigem}
                      placeholder={
                        form.origem_pais_cotacao_bid_frete_internacional
                          ? 'Selecione o aeroporto...'
                          : 'Selecione o país primeiro'
                      }
                      buscavel
                      carregando={carregandoAeroportosOrigem}
                      desabilitado={!form.origem_pais_cotacao_bid_frete_internacional}
                      posicao="auto"
                    />
                  </Field>
                )}
              </div>
            </div>
          </div>
        )`

content = content.replace(
  /      \/\/ STEP 2 — Origem[\s\S]*?      \/\/ STEP 3 — Destino/,
  `${step2New}\n\n      // STEP 3 — Destino`,
)

// ── 8. STEP 3 destino ─────────────────────────────────────────────────────────
const step3New = `      // STEP 3 — Destino
      case 3:
        return (
          <div className="nc-step-content">
            <div className="nc-location-visual-card nc-location-visual-card--destination">
              <div className="nc-location-visual-header">
                <div className="nc-location-visual-circle">
                  <MapPin weight="duotone" size={26} className="nc-pulsing-icon-dest" />
                </div>
                <div className="nc-location-visual-text">
                  <h4>{modal === 'AEREO' ? 'Aeroporto de Destino' : modal === 'RODOVIARIO' ? 'Local de Destino' : t('bidfrete.nova_cotacao.porto_destino')}</h4>
                  <p className="nc-caption">{modal === 'AEREO' ? 'Selecione o país e o aeroporto de chegada' : modal === 'RODOVIARIO' ? 'Selecione o país e estado/província de entrega' : 'Selecione o país e o porto de destino'}</p>
                </div>
              </div>

              <div className="nc-fields-grid nc-fields-grid--location-new">
                <Field label="PAÍS" required>
                  <SelectGlobal
                    iconeEsquerda={<MapPin size={16} />}
                    opcoes={opcoesPaises}
                    valor={form.destino_pais_cotacao_bid_frete_internacional || null}
                    aoMudarValor={aoMudarPaisDestino}
                    placeholder="Selecione o país..."
                    buscavel
                    carregando={carregandoPaises}
                    posicao="auto"
                  />
                </Field>

                <Field label="ESTADO / PROVÍNCIA">
                  {form.destino_pais_cotacao_bid_frete_internacional === 'BR' ? (
                    <SelectGlobal
                      opcoes={OPCOES_ESTADOS_BR}
                      valor={form.estado_provincia_destino_cotacao_bid_frete_internacional || null}
                      aoMudarValor={(v) => set('estado_provincia_destino_cotacao_bid_frete_internacional', String(v ?? ''))}
                      placeholder="Selecione o UF"
                      buscavel
                      desabilitado={!form.destino_pais_cotacao_bid_frete_internacional}
                      posicao="auto"
                    />
                  ) : (
                    <input
                      className="nc-input"
                      placeholder="Ex: California"
                      value={form.estado_provincia_destino_cotacao_bid_frete_internacional}
                      onChange={(e) => set('estado_provincia_destino_cotacao_bid_frete_internacional', e.target.value)}
                    />
                  )}
                </Field>

                {modal === 'MARITIMO' && (
                  <Field label="PORTO DE DESTINO" required className="nc-field--span-2">
                    <SelectGlobal
                      iconeEsquerda={<Anchor size={16} />}
                      opcoes={opcoesPortosDestino}
                      valor={form.destino_codigo_cotacao_bid_frete_internacional || null}
                      aoMudarValor={aoMudarPortoDestino}
                      placeholder={
                        form.destino_pais_cotacao_bid_frete_internacional
                          ? 'Selecione o porto...'
                          : 'Selecione o país primeiro'
                      }
                      buscavel
                      carregando={carregandoPortosDestino}
                      desabilitado={!form.destino_pais_cotacao_bid_frete_internacional}
                      posicao="auto"
                    />
                  </Field>
                )}

                {modal === 'AEREO' && (
                  <Field label="AEROPORTO DE DESTINO" required className="nc-field--span-2">
                    <SelectGlobal
                      iconeEsquerda={<AirplaneTilt size={16} />}
                      opcoes={opcoesAeroportosDestino}
                      valor={form.aeroporto_destino_cotacao_bid_frete_internacional || null}
                      aoMudarValor={aoMudarAeroportoDestino}
                      placeholder={
                        form.destino_pais_cotacao_bid_frete_internacional
                          ? 'Selecione o aeroporto...'
                          : 'Selecione o país primeiro'
                      }
                      buscavel
                      carregando={carregandoAeroportosDestino}
                      desabilitado={!form.destino_pais_cotacao_bid_frete_internacional}
                      posicao="auto"
                    />
                  </Field>
                )}
              </div>
            </div>
          </div>
        )`

content = content.replace(
  /      \/\/ STEP 3 — Destino[\s\S]*?      \/\/ STEP 4 — Carga/,
  `${step3New}\n\n      // STEP 4 — Carga`,
)

// ── 9. Extract content CSS → NC_ESTILOS_CONTEUDO ────────────────────────────
const cssStart = content.indexOf('        /* Animação Suave entre Passos */')
const cssEnd = content.indexOf('        .nc-sucesso-actions {')
const cssEndClose = content.indexOf('        }', content.indexOf('margin-top: 1.75rem;', cssEnd)) + '        }'.length

if (cssStart < 0 || cssEndClose < cssStart) {
  console.error('CSS markers not found', cssStart, cssEndClose)
  process.exit(1)
}

let cssBody = content.slice(cssStart, cssEndClose).trim()
// Typography tokens
cssBody = cssBody.replace(
  /\.nc-option-text \{[\s\S]*?min-width: 0;\n        \}/,
  `.nc-option-text {
          display: flex;
          flex-direction: column;
          gap: 5px;
          line-height: 1.3;
          flex: 1;
          min-width: 0;
        }`,
)
cssBody = cssBody.replace(
  /\.nc-option-label \{[\s\S]*?transition: all 0\.15s ease;\n        \}/,
  `.nc-option-label {
          font-size: 14.5px;
          font-weight: 600;
          color: #f1f5f9;
          transition: color 0.15s ease;
        }`,
)
cssBody = cssBody.replace(
  /\.nc-option-btn--selected \.nc-option-label \{[\s\S]*?\}\n        \.nc-option-btn:hover \.nc-option-label \{[\s\S]*?\}/,
  `.nc-option-btn--selected .nc-option-label {
          color: #f1f5f9;
        }`,
)
cssBody = cssBody.replace(
  /\.nc-option-desc \{[\s\S]*?transition: all 0\.15s ease;\n        \}/,
  `.nc-option-desc {
          font-size: 13px;
          color: var(--nc-muted, #94a3b8);
          transition: color 0.15s ease;
        }`,
)
cssBody = cssBody.replace(
  /\.nc-option-btn--selected \.nc-option-desc \{[\s\S]*?\}\n        \.nc-option-btn:hover \.nc-option-desc \{[\s\S]*?\}/,
  `.nc-option-btn--selected .nc-option-desc,
        .nc-option-btn:hover .nc-option-desc {
          color: var(--nc-muted, #94a3b8);
        }`,
)

if (!cssBody.includes('nc-field--span-2')) {
  cssBody += `

        .nc-field--span-2 {
          grid-column: span 2;
        }
        .nc-caption {
          font-size: 13px;
          color: var(--nc-muted, #94a3b8);
          margin: 0;
        }
        .nc-location-visual-text h4 {
          color: #f1f5f9;
          font-weight: 600;
        }`
}

const ncStylesConst = `\nconst NC_ESTILOS_CONTEUDO = \`\n        .nc-root {
          --nc-muted: var(--ws-muted, #94a3b8);
        }
${cssBody}\n\`\n`

if (!content.includes('NC_ESTILOS_CONTEUDO')) {
  content = content.replace(
    /\/\/ ─── Componente Principal ─/,
    `${ncStylesConst}\n// ─── Componente Principal ─`,
  )
}

// ── 10. Replace render (sucesso + main) ───────────────────────────────────────
const renderStart = content.indexOf('  if (sucesso) {')
const renderEnd = content.lastIndexOf('\n}')

if (renderStart < 0) {
  console.error('render block not found')
  process.exit(1)
}

const newRender = `  const handleFechar = () => navigate(ROTA_LISTA)

  const handleProximo = () => {
    if (step < 7) setStep((s) => s + 1)
    else void handleSubmit()
  }

  const handleVoltar = () => {
    if (step > 1) setStep((s) => s - 1)
    else handleFechar()
  }

  if (sucesso) {
    return (
      <>
        <ModalPassoPassoGlobal
          titulo={t('bidfrete.nova_cotacao.criado_sucesso')}
          aberto
          passos={STEPS}
          passoAtual={7}
          onProximo={handleFechar}
          onVoltar={handleFechar}
          onFechar={handleFechar}
          ocultarStepper
          ocultarFooter
          tamanho="md"
        >
          <div className="nc-root nc-sucesso nc-fade-in">
            <div className="nc-sucesso-badge">
              <CheckCircle weight="duotone" size={72} style={{ color: 'var(--success, #10b981)' }} />
            </div>
            <h2 className="nc-sucesso-title">{t('bidfrete.nova_cotacao.criado_sucesso')}</h2>
            <p className="nc-sucesso-desc">{t('bidfrete.nova_cotacao.criado_desc')}</p>
            <div className="nc-sucesso-actions">
              <button type="button" className="nc-btn nc-btn--secondary" onClick={handleFechar}>{t('bidfrete.nova_cotacao.ver_cotacoes')}</button>
              {cotacaoId && (
                <button type="button" className="nc-btn nc-btn--primary" onClick={() => navigate(\`\${ROTA_LISTA}/\${cotacaoId}\`)}>
                  {t('bidfrete.nova_cotacao.ver_detalhes')}
                </button>
              )}
            </div>
          </div>
        </ModalPassoPassoGlobal>
        <style>{NC_ESTILOS_CONTEUDO}</style>
      </>
    )
  }

  return (
    <>
      <ModalPassoPassoGlobal
        titulo="Nova Cotação"
        icone={<Truck weight="duotone" size={22} />}
        subtitulo="Preencha as informações para buscar as melhores opções de frete"
        aberto
        passos={STEPS}
        passoAtual={step}
        onProximo={handleProximo}
        onVoltar={handleVoltar}
        onFechar={handleFechar}
        onIrParaPasso={(id) => setStep(id)}
        podeAvancar={canNext()}
        carregando={salvando}
        textoCarregando={t('bidfrete.nova_cotacao.criando')}
        labelBotaoFinal={t('bidfrete.nova_cotacao.criar')}
        tamanho="2xl"
        altura="620px"
      >
        <div className="nc-root nc-fade-in">{renderStep()}</div>
      </ModalPassoPassoGlobal>
      <style>{NC_ESTILOS_CONTEUDO}</style>
    </>
  )
}`

content = content.slice(0, renderStart) + newRender

// Remove duplicate handleProximo/handleVoltar if present before render
content = content.replace(
  /  const handleFechar = \(\) => navigate\([^)]+\)\n\n  const handleProximo = \(\) => \{[\s\S]*?\}\n\n  const handleVoltar = \(\) => \{[\s\S]*?\}\n\n  const handleFechar = \(\) => navigate\(ROTA_LISTA\)/,
  '  const handleFechar = () => navigate(ROTA_LISTA)',
)

fs.writeFileSync(filePath, content)
console.log('OK — cotacao-nova.tsx refatorado:', filePath)
