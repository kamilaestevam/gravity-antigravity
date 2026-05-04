import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Calculator,
  Globe,
  IdentificationCard,
  CurrencyDollar,
  Percent,
  MapPin
} from '@phosphor-icons/react'
import { ModalFormularioGlobal, SecaoFormulario } from '@nucleo/modal-formulario-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { BannerRequisitosGlobal, type RequisitoSalvar } from '@nucleo/banner-requisitos-global'
import type { SimulacaoInput } from '../../shared/types'

interface ModalSimulacaoCustoProps {
  aberto: boolean
  aoFechar: () => void
  aoSimular: (dados: SimulacaoInput) => void
  loading?: boolean
  dadosIniciais?: SimulacaoInput
}

const MOEDAS = [
  { valor: 'USD', rotulo: 'USD' },
  { valor: 'EUR', rotulo: 'EUR' },
  { valor: 'GBP', rotulo: 'GBP' },
  { valor: 'CNY', rotulo: 'CNY' },
  { valor: 'BRL', rotulo: 'BRL' },
]

const FORM_DEFAULTS: SimulacaoInput = {
  ncm: '',
  paisOrigem: 'US',
  dataFatoGerador: new Date().toISOString().split('T')[0],
  valorProduto: 0,
  moedaProduto: 'USD',
  freteInter: 0,
  moedaFrete: 'USD',
  seguroInter: 0,
  moedaSeguro: 'USD',
  taxasOrigem: [],
  taxasDestino: [],
  ufDesembaraco: 'SP',
  aliquotaII: 0.16,
  aliquotaIPI: 0,
  aliquotaPIS: 0.021,
  aliquotaCOFINS: 0.0965,
  aliquotaICMS: 0.18,
}

export function ModalSimulacaoCusto({
  aberto,
  aoFechar,
  aoSimular,
  loading = false,
  dadosIniciais
}: ModalSimulacaoCustoProps) {
  const { t } = useTranslation()
  const [form, setForm] = useState<SimulacaoInput>(FORM_DEFAULTS)

  useEffect(() => {
    if (aberto) {
      setForm(dadosIniciais || FORM_DEFAULTS)
    }
  }, [aberto, dadosIniciais])

  const update = (field: keyof SimulacaoInput, value: SimulacaoInput[keyof SimulacaoInput]) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSalvar = () => {
    aoSimular(form)
  }

  const requisitos: RequisitoSalvar[] = [
    { chave: 'ncm',          ok: !!form.ncm,             mensagem: 'NCM (8 dígitos)' },
    { chave: 'paisOrigem',   ok: !!form.paisOrigem,      mensagem: 'País de origem (ISO-2)' },
    { chave: 'valorProduto', ok: form.valorProduto > 0, mensagem: 'Valor do produto maior que zero' },
  ]
  const podesSimular = requisitos.every(r => r.ok)

  return (
    <ModalFormularioGlobal
      aberto={aberto}
      aoFechar={aoFechar}
      aoSalvar={handleSalvar}
      icone={<Calculator size={24} weight="duotone" />}
      titulo={t('simulacusto.modal_simulacao.titulo')}
      subtitulo={t('simulacusto.modal_simulacao.subtitulo')}
      tamanho="lg"
      altura="720px"
      dirty={true}
      podesSalvar={podesSimular && !loading}
      textoSalvar={loading ? t('simulacusto.formulario.calculando') : t('simulacusto.formulario.simular_custo')}
    >
      <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* ── Seção: Produto & Operação ─────────────────────────── */}
        <div>
          <SecaoFormulario
            icone={<Globe size={16} weight="duotone" />}
            titulo={t('simulacusto.modal_simulacao.secao_produto')}
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <CampoGeralGlobal label={t('simulacusto.formulario.ncm')} obrigatorio>
              <div className="ws-input-icon-wrap">
                <IdentificationCard size={16} />
                <input
                  type="text"
                  maxLength={8}
                  placeholder="84713019"
                  value={form.ncm}
                  onChange={e => update('ncm', e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </CampoGeralGlobal>

            <CampoGeralGlobal label={t('simulacusto.formulario.pais_origem')} obrigatorio>
              <div className="ws-input-icon-wrap">
                <Globe size={16} />
                <input
                  type="text"
                  maxLength={2}
                  placeholder="US"
                  value={form.paisOrigem}
                  onChange={e => update('paisOrigem', e.target.value.toUpperCase())}
                />
              </div>
            </CampoGeralGlobal>

            <CampoGeralGlobal label={t('simulacusto.formulario.uf_desembaraco')} obrigatorio>
              <div className="ws-input-icon-wrap">
                <MapPin size={16} />
                <input
                  type="text"
                  maxLength={2}
                  placeholder="SP"
                  value={form.ufDesembaraco}
                  onChange={e => update('ufDesembaraco', e.target.value.toUpperCase())}
                />
              </div>
            </CampoGeralGlobal>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <CampoGeralGlobal label={t('simulacusto.formulario.valor_produto')} obrigatorio>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div className="ws-input-icon-wrap" style={{ flex: 1 }}>
                  <CurrencyDollar size={16} />
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="5925.00"
                    value={form.valorProduto || ''}
                    onChange={e => update('valorProduto', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div style={{ width: '100px' }}>
                  <SelectGlobal
                    opcoes={MOEDAS}
                    valor={form.moedaProduto}
                    aoMudarValor={(v: string) => update('moedaProduto', v)}
                  />
                </div>
              </div>
            </CampoGeralGlobal>

            <CampoGeralGlobal label={t('simulacusto.formulario.frete_internacional')}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div className="ws-input-icon-wrap" style={{ flex: 1 }}>
                  <CurrencyDollar size={16} />
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    value={form.freteInter || ''}
                    onChange={e => update('freteInter', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div style={{ width: '100px' }}>
                  <SelectGlobal
                    opcoes={MOEDAS.filter(m => ['USD', 'EUR', 'BRL'].includes(m.valor))}
                    valor={form.moedaFrete}
                    aoMudarValor={(v: string) => update('moedaFrete', v)}
                  />
                </div>
              </div>
            </CampoGeralGlobal>
          </div>
        </div>

        {/* ── Seção: Alíquotas ─────────────────────────────────── */}
        <div>
          <SecaoFormulario
            icone={<Percent size={16} weight="duotone" />}
            titulo={t('simulacusto.formulario.aliquotas')}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <CampoGeralGlobal label="II (%)">
              <input 
                type="number" min={0} max={100} step="0.01" placeholder="16.00"
                value={(form.aliquotaII * 100) || ''}
                onChange={e => update('aliquotaII', (parseFloat(e.target.value) || 0) / 100)} 
              />
            </CampoGeralGlobal>
            <CampoGeralGlobal label="IPI (%)">
              <input 
                type="number" min={0} max={100} step="0.01" placeholder="0.00"
                value={(form.aliquotaIPI * 100) || ''}
                onChange={e => update('aliquotaIPI', (parseFloat(e.target.value) || 0) / 100)} 
              />
            </CampoGeralGlobal>
            <CampoGeralGlobal label="PIS (%)">
              <input 
                type="number" min={0} max={100} step="0.01" placeholder="2.10"
                value={(form.aliquotaPIS * 100) || ''}
                onChange={e => update('aliquotaPIS', (parseFloat(e.target.value) || 0) / 100)} 
              />
            </CampoGeralGlobal>
            <CampoGeralGlobal label="COFINS (%)">
              <input 
                type="number" min={0} max={100} step="0.01" placeholder="9.65"
                value={(form.aliquotaCOFINS * 100) || ''}
                onChange={e => update('aliquotaCOFINS', (parseFloat(e.target.value) || 0) / 100)} 
              />
            </CampoGeralGlobal>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <CampoGeralGlobal label="ICMS (%)">
              <input 
                type="number" min={0} max={100} step="0.01" placeholder="18.00"
                value={(form.aliquotaICMS * 100) || ''}
                onChange={e => update('aliquotaICMS', (parseFloat(e.target.value) || 0) / 100)} 
              />
            </CampoGeralGlobal>
            <CampoGeralGlobal label={t('simulacusto.formulario.reducao_ii')}>
              <input 
                type="number" min={0} max={100} step="0.01" placeholder="0.00"
                value={((form.reducaoII ?? 0) * 100) || ''}
                onChange={e => update('reducaoII', (parseFloat(e.target.value) || 0) / 100)} 
              />
            </CampoGeralGlobal>
          </div>
        </div>

      </div>

      <style>{`
        .ws-input-icon-wrap {
          display: flex;
          align-items: center;
          background: var(--ws-bg-body, #0f172a);
          border: 1px solid var(--ws-accent-border, rgba(129,140,248,0.20));
          border-radius: 8px;
          padding: 0 0.75rem;
          height: 40px;
          transition: border-color 0.15s;
        }
        .ws-input-icon-wrap:focus-within {
          border-color: var(--ws-accent, #818cf8);
          box-shadow: 0 0 0 2px rgba(129,140,248,0.15);
        }
        .ws-input-icon-wrap svg {
          color: var(--ws-muted, #94a3b8);
          margin-right: 0.625rem;
          flex-shrink: 0;
        }
        .ws-input-icon-wrap input {
          background: transparent;
          border: none;
          color: var(--ws-text, #f1f5f9);
          font-size: 0.875rem;
          font-family: inherit;
          outline: none;
          width: 100%;
          height: 100%;
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        /* Estilos para inputs de alíquotas sem ícone para manter padrão */
        input[type="number"]:not(.ws-input-icon-wrap input) {
          width: 100%;
          background: var(--ws-bg-body, #0f172a);
          border: 1px solid var(--ws-accent-border, rgba(129,140,248,0.20));
          border-radius: 8px;
          padding: 0 0.75rem;
          height: 40px;
          color: var(--ws-text, #f1f5f9);
          font-size: 0.875rem;
          font-family: inherit;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s;
        }
        input[type="number"]:not(.ws-input-icon-wrap input):focus {
          border-color: var(--ws-accent, #818cf8);
          box-shadow: 0 0 0 2px rgba(129,140,248,0.15);
        }
      `}</style>
      <BannerRequisitosGlobal requisitos={requisitos} titulo="Para simular, ainda falta:" />
    </ModalFormularioGlobal>
  )
}
