import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ListChecks, MagnifyingGlass, FilePlus } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { adminPlanosTesteApi } from '../../services/api-client'
import { useShellStore } from '@gravity/shell'
import { getAcoesExportacaoPadrao } from '../../utils/export-helper'

interface PlanoResumo {
  id: string
  escopo: string
  sublocal: string
  tela: string
  criticidade: string
  passosTotal: number
  coberturaPercentual: number
  status: string
  ultimoResultado: string | null
}

export function PlanosTesteAdmin() {
  const { t } = useTranslation()
  const addNotification = useShellStore((s) => s.addNotification)
  const [planos, setPlanos] = useState<PlanoResumo[]>([])
  const [carregando, setCarregando] = useState(true)

  async function loadPlanos() {
    try {
      setCarregando(true)
      const res = await adminPlanosTesteApi.listar()
      setPlanos((res.planos as unknown as PlanoResumo[]) ?? [])
    } catch {
      // Registry vazio
      setPlanos([])
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { loadPlanos() }, [])

  const totalPlanos = planos.length
  const coberturaMedia = planos.length > 0
    ? Math.round(planos.reduce((acc, p) => acc + (p.coberturaPercentual ?? 0), 0) / planos.length)
    : 0

  const colunas: TabelaGlobalColuna<PlanoResumo>[] = [
    { key: 'id', label: 'ID', tipo: 'texto' },
    { key: 'escopo', label: 'ESCOPO', tipo: 'texto',
      render: (v: string) => (
        <span style={{ padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', fontSize: '0.7rem', fontWeight: 700 }}>
          {v}
        </span>
      )
    },
    { key: 'tela', label: 'TELA', tipo: 'texto' },
    { key: 'criticidade', label: 'CRITICIDADE', tipo: 'texto',
      render: (v: string) => {
        const colors: Record<string, string> = { critica: '#ef4444', alta: '#f59e0b', media: '#3b82f6', baixa: '#6b7280' }
        return <span style={{ color: colors[v] ?? '#94a3b8', fontWeight: 600, fontSize: '0.8rem' }}>{v}</span>
      }
    },
    { key: 'passosTotal', label: 'PASSOS', tipo: 'numero' },
    { key: 'coberturaPercentual', label: 'COBERTURA', tipo: 'numero',
      render: (v: number) => (
        <span style={{ color: v >= 80 ? '#10b981' : v >= 60 ? '#eab308' : '#ef4444', fontWeight: 700 }}>
          {v}%
        </span>
      )
    },
    { key: 'status', label: 'STATUS', tipo: 'texto',
      render: (v: string) => (
        <span style={{ padding: '0.15rem 0.5rem', borderRadius: '4px', background: v === 'validado' ? 'rgba(16,185,129,0.15)' : 'rgba(234,179,8,0.15)', border: `1px solid ${v === 'validado' ? 'rgba(16,185,129,0.3)' : 'rgba(234,179,8,0.3)'}`, color: v === 'validado' ? '#10b981' : '#eab308', fontSize: '0.7rem', fontWeight: 700 }}>
          {v}
        </span>
      )
    },
  ]

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<ListChecks weight="duotone" size={22} />}
          titulo="Planos de Teste"
          subtitulo="Planos 20/20 gerados pelo agente — cobertura, passos e status"
        />
      }
      stats={
        <>
          <CardBasicoGlobal
            titulo="Total de Planos"
            valor={totalPlanos}
            icone={<ListChecks weight="duotone" size={18} />}
            variante="primario"
          />
          <CardBasicoGlobal
            titulo="Cobertura Média"
            valor={`${coberturaMedia}%`}
            icone={<MagnifyingGlass weight="duotone" size={18} />}
            variante={coberturaMedia >= 80 ? 'sucesso' : 'aviso'}
          />
        </>
      }
    >
      <div className="ws-fade-up" style={{ position: 'relative', zIndex: 10, marginTop: '32px' }}>
        <TabelaGlobal
          id="admin-test-plans"
          dados={planos}
          colunas={colunas}
          idKey="id"
          mensagemVazio="Nenhum plano de teste registrado. Use POST /admin/planos-teste/gerar para criar."
          acoesExportacao={getAcoesExportacaoPadrao(colunas, 'planos-teste', 'Planos de Teste')}
        />
      </div>
    </PaginaGlobal>
  )
}
