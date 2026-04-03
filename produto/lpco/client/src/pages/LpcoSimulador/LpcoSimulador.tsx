/**
 * LpcoSimulador — Simulador de Tratamento Administrativo
 * NCM + operacao → orgaos anuentes + modelos obrigatorios
 */

import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import {
  MagnifyingGlass,
  ShieldCheck,
  Warning,
  ArrowLeft,
  Info,
  CheckCircle,
  MinusCircle,
} from '@phosphor-icons/react'
import { simuladorApi } from '../../shared/api'
import type { TipoOperacao } from '../../shared/types'

interface ResultadoOrgao {
  sigla: string
  modelo: string
  obrigatorio: boolean
  descricao: string
}

interface ResultadoSimulacao {
  ncm: string
  capitulo: string
  operacao: string
  orgaos: ResultadoOrgao[]
  total: number
  fonte: string
}

export default function LpcoSimulador() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [ncm, setNcm] = useState('')
  const [operacao, setOperacao] = useState<TipoOperacao>('IMPORTACAO')
  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const handleSimular = useCallback(async () => {
    if (ncm.length !== 8 || !/^\d{8}$/.test(ncm)) {
      setErro(t('lpco.ncm_validacao'))
      return
    }

    setLoading(true)
    setErro(null)
    setResultado(null)

    try {
      const res = await simuladorApi.simular(ncm, operacao)
      setResultado(res as ResultadoSimulacao)
    } catch {
      // Mock fallback
      const capitulo = ncm.substring(0, 2)
      const mockRegras: Record<string, ResultadoOrgao[]> = {
        '30': [{ sigla: 'ANVISA', modelo: 'I00004', obrigatorio: true, descricao: 'Registro ANVISA medicamentos' }],
        '01': [{ sigla: 'MAPA', modelo: 'I00001', obrigatorio: true, descricao: 'Licenca sanitaria animal' }],
        '27': [{ sigla: 'ANP', modelo: 'I00008', obrigatorio: true, descricao: 'Autorizacao ANP combustiveis' }],
        '85': [{ sigla: 'INMETRO', modelo: 'I00007', obrigatorio: false, descricao: 'Conformidade INMETRO (se listado)' }],
      }
      const orgaos = mockRegras[capitulo] ?? []
      setResultado({ ncm, capitulo, operacao, orgaos, total: orgaos.length, fonte: 'base_local' })
    } finally {
      setLoading(false)
    }
  }, [ncm, operacao])

  return (
    <div style={{ padding: '1.5rem', maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <TooltipGlobal titulo={t('comum.voltar')} descricao={t('lpco.voltar_lista')}>
          <button
            onClick={() => navigate('/lpco')}
            type="button"
            style={{
              background: 'none', border: 'none', color: 'var(--ws-muted, #94a3b8)',
              cursor: 'pointer', display: 'flex', padding: '0.25rem',
            }}
          >
            <ArrowLeft weight="bold" size={20} />
          </button>
        </TooltipGlobal>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 700, color: 'var(--ws-text, #f1f5f9)' }}>
            {t('lpco.simulador_titulo')}
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--ws-muted, #94a3b8)' }}>
            {t('lpco.simulador_subtitulo')}
          </p>
        </div>
      </div>

      {/* Form */}
      <div style={{
        display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap',
        padding: '1.25rem', background: 'var(--ws-surface, #1e293b)',
        borderRadius: '10px', border: '1px solid rgba(99,102,241,0.18)',
      }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ws-muted, #94a3b8)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {t('lpco.ncm_8_digitos')}
          </label>
          <input
            type="text"
            value={ncm}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 8)
              setNcm(val)
              setErro(null)
            }}
            placeholder="Ex: 30049099"
            maxLength={8}
            onKeyDown={(e) => e.key === 'Enter' && handleSimular()}
            style={{
              width: '100%', padding: '0.625rem 0.75rem', fontSize: '0.9375rem',
              fontFamily: 'monospace', background: 'var(--ws-bg-body, #0f172a)',
              border: '1px solid rgba(99,102,241,0.18)', borderRadius: '6px',
              color: 'var(--ws-text, #f1f5f9)', outline: 'none',
              letterSpacing: '0.1em',
            }}
          />
        </div>

        <div style={{ flex: '0 0 160px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ws-muted, #94a3b8)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {t('lpco.operacao')}
          </label>
          <select
            value={operacao}
            onChange={(e) => setOperacao(e.target.value as TipoOperacao)}
            style={{
              width: '100%', padding: '0.625rem 0.75rem', fontSize: '0.875rem',
              background: 'var(--ws-bg-body, #0f172a)',
              border: '1px solid rgba(99,102,241,0.18)', borderRadius: '6px',
              color: 'var(--ws-text, #f1f5f9)', outline: 'none',
            }}
          >
            <option value="IMPORTACAO">{t('lpco.importacao')}</option>
            <option value="EXPORTACAO">{t('lpco.exportacao')}</option>
          </select>
        </div>

        <BotaoGlobal
          variante="primario"
          tamanho="medio"
          onClick={handleSimular}
          disabled={loading || ncm.length !== 8}
        >
          <MagnifyingGlass weight="bold" size={16} />
          {loading ? t('lpco.consultando') : t('lpco.simular')}
        </BotaoGlobal>
      </div>

      {/* Erro */}
      {erro && (
        <div style={{
          marginTop: '0.75rem', padding: '0.625rem 1rem', borderRadius: '8px',
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          color: '#f87171', fontSize: '0.875rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <Warning weight="fill" size={16} />
          {erro}
        </div>
      )}

      {/* Resultado */}
      {resultado && (
        <div style={{ marginTop: '1.25rem' }}>
          {/* Summary */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem',
            padding: '0.75rem 1rem', borderRadius: '8px',
            background: resultado.total > 0
              ? 'rgba(251,191,36,0.08)'
              : 'rgba(52,211,153,0.08)',
            border: `1px solid ${resultado.total > 0 ? 'rgba(251,191,36,0.2)' : 'rgba(52,211,153,0.2)'}`,
          }}>
            {resultado.total > 0 ? (
              <ShieldCheck weight="duotone" size={20} style={{ color: '#fbbf24' }} />
            ) : (
              <CheckCircle weight="duotone" size={20} style={{ color: '#34d399' }} />
            )}
            <span style={{ fontSize: '0.9375rem', color: 'var(--ws-text, #f1f5f9)' }}>
              NCM <strong style={{ fontFamily: 'monospace' }}>{resultado.ncm}</strong>
              {`(cap. ${resultado.capitulo}) — `}
              {resultado.total > 0
                ? `${resultado.total} ${t('lpco.orgaos_identificados')}`
                : t('lpco.sem_tratamento')
              }
            </span>
          </div>

          {/* Orgaos */}
          {resultado.orgaos.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {resultado.orgaos.map((orgao, i) => (
                <div
                  key={`${orgao.sigla}-${i}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '0.875rem 1rem', background: 'var(--ws-surface, #1e293b)',
                    borderRadius: '8px', border: '1px solid rgba(99,102,241,0.12)',
                  }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: '8px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: orgao.obrigatorio ? 'rgba(251,191,36,0.1)' : 'rgba(99,102,241,0.08)',
                    border: `1px solid ${orgao.obrigatorio ? 'rgba(251,191,36,0.2)' : 'rgba(99,102,241,0.12)'}`,
                    fontWeight: 700, fontSize: '0.75rem',
                    color: orgao.obrigatorio ? '#fbbf24' : 'var(--ws-muted, #94a3b8)',
                  }}>
                    {orgao.sigla}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--ws-text, #f1f5f9)', fontSize: '0.9375rem' }}>
                        {orgao.sigla}
                      </span>
                      <span style={{
                        fontSize: '0.6875rem', fontWeight: 600, padding: '0.125rem 0.5rem',
                        borderRadius: '9999px',
                        background: orgao.obrigatorio ? 'rgba(251,191,36,0.12)' : 'rgba(99,102,241,0.08)',
                        color: orgao.obrigatorio ? '#fbbf24' : 'var(--ws-muted, #94a3b8)',
                      }}>
                        {orgao.obrigatorio ? t('lpco.obrigatorio') : t('lpco.condicional')}
                      </span>
                    </div>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--ws-muted, #94a3b8)' }}>
                      {orgao.descricao}
                    </p>
                  </div>
                  <div style={{
                    fontFamily: 'monospace', fontSize: '0.8125rem', fontWeight: 600,
                    color: 'var(--ws-muted, #94a3b8)', flexShrink: 0,
                    padding: '0.25rem 0.5rem', background: 'rgba(99,102,241,0.06)',
                    borderRadius: '4px',
                  }}>
                    {orgao.modelo}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fonte */}
          <div style={{
            marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem',
            fontSize: '0.75rem', color: 'var(--ws-muted, #64748b)',
          }}>
            <Info weight="fill" size={12} />
            {t('lpco.fonte_label')} {resultado.fonte === 'base_local' ? t('lpco.fonte_local') : t('lpco.fonte_api')}
          </div>
        </div>
      )}
    </div>
  )
}
