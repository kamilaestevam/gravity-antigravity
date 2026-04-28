import React from 'react'
import { useTranslation } from 'react-i18next'
import { FileText, Plus, ChartLineUp, Clock, CurrencyDollar, DownloadSimple, Funnel } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { CardEstatisticaGlobal } from '@nucleo/card-global' 
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { BotaoGlobal } from '@nucleo/botao-global'

export default function Relatorios() {
  const { t } = useTranslation()
  // Configuração de colunas seguindo o padrão TabelaGlobalColuna rígido
  const statusConcluido = t('simulacusto.relatorios.status.concluido')
  const statusProcessando = t('simulacusto.relatorios.status.processando')
  const statusPendente = t('simulacusto.relatorios.status.pendente')
  const statusAtrasado = t('simulacusto.relatorios.status.atrasado')

  const colunas: TabelaGlobalColuna<any>[] = [
    { key: 'status', label: t('simulacusto.relatorios.tabela.status'), tipo: 'texto', largura: 130, render: (v: string) => {
      const variantes: Record<string, string> = {
        [statusConcluido]: 'ws-badge-success',
        [statusProcessando]: 'ws-badge-info',
        [statusPendente]: 'ws-badge-warning',
        [statusAtrasado]: 'ws-badge-danger'
      }
      return <span className={`ws-badge ${variantes[v] || ''}`}>{v}</span>
    }},
    { key: 'codigo', label: t('simulacusto.relatorios.tabela.codigo'), tipo: 'texto', largura: 140 },
    { key: 'data', label: t('simulacusto.relatorios.tabela.data'), tipo: 'periodo', largura: 160 },
    { key: 'importador', label: t('simulacusto.relatorios.tabela.importador'), tipo: 'texto', largura: 220 },
    { key: 'origem', label: t('simulacusto.relatorios.tabela.origem'), tipo: 'texto', largura: 120 },
    { key: 'valor', label: t('simulacusto.relatorios.tabela.valor_total'), tipo: 'numero', largura: 150, align: 'right' },
  ]

  // Dados mockados de alta fidelidade
  const dados = [
    { id: '1', status: statusConcluido, codigo: 'SC-2024-001', data: '2026-03-28T10:00:00Z', importador: 'LOGÍSTICA MUNDIAL LTDA', origem: 'CHINA', valor: 145200.80 },
    { id: '2', status: statusProcessando, codigo: 'SC-2024-002', data: '2026-03-28T11:30:00Z', importador: 'REDE VAREJO S.A.', origem: 'EUA', valor: 89440.00 },
    { id: '3', status: statusPendente, codigo: 'SC-2024-003', data: '2026-03-27T16:45:00Z', importador: 'TECH BRASIL INDÚSTRIA', origem: 'ALEMANHA', valor: 432110.50 },
    { id: '4', status: statusAtrasado, codigo: 'SC-2024-004', data: '2026-03-20T09:00:00Z', importador: 'MEGA RETAIL GROUP', origem: 'BRASIL', valor: 12500.00 },
  ]

  const acoesTabela = [
    { id: 'edit', icone: <FileText size={16} />, tooltip: t('simulacusto.estimativas.acoes.ver_detalhes'), onClick: (item: unknown) => console.log('Edit', item) },
    { id: 'download', icone: <DownloadSimple size={16} />, tooltip: t('simulacusto.relatorios.gestao_manual'), onClick: (item: unknown) => console.log('Download', item) },
  ]

  return (
    <PaginaGlobal
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          titulo={t('simulacusto.relatorios.titulo')}
          subtitulo={t('simulacusto.relatorios.subtitulo')}
          icone={<CurrencyDollar weight="duotone" size={22} color="#818cf8" />}
        />
      }
      stats={
        <>
          <CardEstatisticaGlobal
            titulo={t('simulacusto.relatorios.kpi.a_receber')}
            valor="R$ 145.200,80"
            subtexto={t('simulacusto.relatorios.kpi.subtexto_a_receber')}
            icone={<Clock weight="bold" />}
            variante="padrao"
          />
          <CardEstatisticaGlobal
            titulo={t('simulacusto.relatorios.kpi.risco')}
            valor="R$ 12.500,00"
            subtexto={t('simulacusto.relatorios.kpi.subtexto_risco')}
            icone={<Funnel weight="bold" />}
            variante="perigo"
          />
          <CardEstatisticaGlobal
            titulo={t('simulacusto.relatorios.kpi.performance')}
            valor="94.2%"
            subtexto={t('simulacusto.relatorios.kpi.subtexto_performance')}
            icone={<ChartLineUp weight="bold" />}
            variante="sucesso"
            tendencia={{ direcao: 'up', valor: '3%' }}
          />
        </>
      }
      acoes={
        <BotaoGlobal
          variante="primario"
          icone={<Plus weight="bold" size={18} />}
          title={t('simulacusto.relatorios.novo_relatorio')}
          style={{ 
            width: '42px', 
            height: '42px', 
            minWidth: '42px',
            padding: 0, 
            justifyContent: 'center', 
            borderRadius: '50%',
            background: '#ffffff',
            color: '#000000',
            boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
          }}
        />
      }
      toolbar={
        <div style={{ padding: '0.2rem 0', color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={12} weight="bold" />
          {t('simulacusto.relatorios.faturamento_cliente', 'Faturamento por Cliente e Base')}
        </div>
      }
    >
      <TabelaGlobal
        id="relatorios-simulacusto-v1"
        colunas={colunas}
        dados={dados}
        acoes={acoesTabela}
        idKey="id"
        mensagemVazio={t('simulacusto.relatorios.vazio')}
      />
      
      <div style={{ marginTop: '2rem', padding: '1rem 1.25rem', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.25rem' }}>💡</span>
        <span>
          <strong>{t('simulacusto.relatorios.gestao_manual', 'Gestão Manual')}:</strong> {t('simulacusto.relatorios.gestao_desc', 'Utilize as ações laterais para baixar relatórios individuais ou gerar novos cálculos automáticos.')} {t('simulacusto.relatorios.info_atualizacao')}
        </span>
      </div>
    </PaginaGlobal>
  )
}
