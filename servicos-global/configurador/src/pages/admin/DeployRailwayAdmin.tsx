import React from 'react'
import { useTranslation } from 'react-i18next'
import { CloudArrowUp, User, GitCommit, CheckCircle, XCircle, Trash } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { getAcoesExportacaoPadrao } from '../../utils/exportHelper'


type DeployLog = {
  id: string
  quando: string
  quem: string
  area: string
  de: string
  para: string
  versao: string
  status: 'Concluído' | 'Removido' | 'Falhado'
}

const mockDeploys: DeployLog[] = [
  {
    id: 'd1',
    quando: '2026-03-24T22:52:00',
    quem: 'dmmltda',
    area: 'Autenticação',
    de: 'Pendente / acumulado',
    para: 'add playwright auth state to gitignore + test fixtures update',
    versao: '8460213',
    status: 'Concluído'
  },
  {
    id: 'd2',
    quando: '2026-03-24T19:24:00',
    quem: 'dmmltda',
    area: 'Infraestrutura',
    de: 'Pendente / acumulado',
    para: 'trigger deploy — aplica 6 migrations pendentes em produção',
    versao: 'cc439d0',
    status: 'Removido'
  },
  {
    id: 'd3',
    quando: '2026-03-24T18:51:00',
    quem: 'dmmltda',
    area: 'Infraestrutura',
    de: '— não existia',
    para: 'adiciona startup-check de variáveis de ambiente e atualiza workflow de deploy',
    versao: '6fceda7',
    status: 'Removido'
  }
]

function formatDate(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function DeployRailwayAdmin() {
  const { t } = useTranslation()

  const COLUNAS: TabelaGlobalColuna<DeployLog>[] = [
    {
      key: 'quando', label: t('admin.deploy.tabela.quando'), tipo: 'periodo',
      tooltipTitulo: t('admin.deploy.tabela.quando_tooltip'), tooltipDescricao: t('admin.deploy.tabela.quando_desc'),
      render: (v) => <span style={{ color: '#cbd5e1' }}>{formatDate(v)}</span>
    },
    {
      key: 'quem', label: t('admin.deploy.tabela.quem'), tipo: 'texto',
      tooltipTitulo: t('admin.deploy.tabela.quem_tooltip'), tooltipDescricao: t('admin.deploy.tabela.quem_desc'),
      render: (v) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            <User size={14} weight="bold" />
          </div>
          <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{v}</span>
        </div>
      )
    },
    {
      key: 'area', label: t('admin.deploy.tabela.area'), tipo: 'texto',
      tooltipTitulo: t('admin.deploy.tabela.area_tooltip'), tooltipDescricao: t('admin.deploy.tabela.area_desc'),
      render: (v) => {
        let corBg = 'rgba(148,163,184,0.12)'
        let corText = '#94a3b8'
        let corBorder = 'rgba(148,163,184,0.3)'

        if (v === 'Autenticação') { corBg = 'rgba(129,140,248,0.12)'; corText = '#818cf8'; corBorder = 'rgba(129,140,248,0.3)'; }
        if (v === 'Infraestrutura') { corBg = 'rgba(248,113,113,0.12)'; corText = '#f87171'; corBorder = 'rgba(248,113,113,0.3)'; }

        return (
          <span style={{
            display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '4px',
            fontSize: '0.6875rem', fontWeight: 600,
            background: corBg, color: corText, border: `1px solid ${corBorder}`
          }}>
            {v}
          </span>
        )
      }
    },
    {
      key: 'de', label: t('admin.deploy.tabela.de'), tipo: 'texto',
      tooltipTitulo: t('admin.deploy.tabela.de_tooltip'), tooltipDescricao: t('admin.deploy.tabela.de_desc'),
      render: (v) => {
        if (v === '— não existia') {
          return <span style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.75rem' }}>{v}</span>
        }
        return (
          <span style={{
            display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '4px',
            fontSize: '0.6875rem', fontWeight: 500,
            background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {v}
          </span>
        )
      }
    },
    {
      key: 'para', label: t('admin.deploy.tabela.para'), tipo: 'texto',
      tooltipTitulo: t('admin.deploy.tabela.para_tooltip'), tooltipDescricao: t('admin.deploy.tabela.para_desc'),
      render: (v) => <span style={{ color: '#f1f5f9', fontWeight: 500 }}>{v}</span>
    },
    {
      key: 'versao', label: t('admin.deploy.tabela.versao'), tipo: 'texto',
      tooltipTitulo: t('admin.deploy.tabela.versao_tooltip'), tooltipDescricao: t('admin.deploy.tabela.versao_desc'),
      render: (v) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#c084fc' }}>
          <GitCommit size={14} weight="bold" />
          <span style={{ fontSize: '0.8125rem', fontFamily: 'monospace' }}>{v}</span>
        </div>
      )
    },
    {
      key: 'status', label: t('admin.deploy.tabela.status'), tipo: 'texto',
      tooltipTitulo: t('admin.deploy.tabela.status_tooltip'), tooltipDescricao: t('admin.deploy.tabela.status_desc'),
      render: (v) => {
        let icone = <CheckCircle size={14} weight="bold" />
        let cor = { bg: 'rgba(52,211,153,0.12)', text: '#34d399', border: 'rgba(52,211,153,0.3)' }

        if (v === 'Removido') {
          icone = <Trash size={14} weight="bold" />
          cor = { bg: 'rgba(148,163,184,0.12)', text: '#94a3b8', border: 'rgba(148,163,184,0.3)' }
        } else if (v === 'Falhado') {
          icone = <XCircle size={14} weight="bold" />
          cor = { bg: 'rgba(248,113,113,0.12)', text: '#f87171', border: 'rgba(248,113,113,0.3)' }
        }

        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.25rem 0.625rem', borderRadius: '9999px',
            fontSize: '0.6875rem', fontWeight: 600,
            background: cor.bg, color: cor.text, border: `1px solid ${cor.border}`
          }}>
            {icone}
            {v}
          </span>
        )
      }
    }
  ]

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<CloudArrowUp weight="duotone" size={22} />}
          titulo={t('admin.deploy.titulo')}
          subtitulo={t('admin.deploy.subtitulo')}
        />
      }
    >
      <div className="ws-fade-up" style={{ position: 'relative', zIndex: 10, marginTop: '32px' }}>
        <TabelaGlobal<DeployLog>
          id="admin-deploys"
          dados={mockDeploys}
          colunas={COLUNAS}
          acoesExportacao={getAcoesExportacaoPadrao(COLUNAS, 'dados_tabela', 'Exportação de Dados')}
          mensagemVazio={t('admin.deploy.vazio_filtros')}
          mensagemSemFiltro={t('admin.deploy.vazio_sem_filtro')}
          tooltipBusca={t('admin.deploy.tooltip_busca')}
        />
      </div>
    </PaginaGlobal>
  )
}
