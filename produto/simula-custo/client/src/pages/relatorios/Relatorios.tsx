import React from 'react'
import { FileText, Plus, ChartLineUp, Clock, CurrencyDollar, DownloadSimple, Funnel } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { StatCardGlobal } from '@nucleo/card-global' 
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { BotaoGlobal } from '@nucleo/botao-global'

export default function Relatorios() {
  // Configuração de colunas seguindo o padrão TabelaGlobalColuna rídigo
  const colunas: TabelaGlobalColuna<any>[] = [
    { key: 'status', label: 'Status', tipo: 'texto', largura: 130, render: (v: string) => {
      const variantes: any = {
        'Concluído': 'ws-badge-success',
        'Processando': 'ws-badge-info',
        'Pendente': 'ws-badge-warning',
        'Atrasado': 'ws-badge-danger'
      }
      return <span className={`ws-badge ${variantes[v] || ''}`}>{v}</span>
    }},
    { key: 'codigo', label: 'Código', tipo: 'texto', largura: 140 },
    { key: 'data', label: 'Data', tipo: 'periodo', largura: 160 },
    { key: 'importador', label: 'Importador', tipo: 'texto', largura: 220 },
    { key: 'origem', label: 'Origem', tipo: 'texto', largura: 120 },
    { key: 'valor', label: 'Valor Total', tipo: 'numero', largura: 150, align: 'right' },
  ]

  // Dados mockados de alta fidelidade
  const dados = [
    { id: '1', status: 'Concluído', codigo: 'SC-2024-001', data: '2026-03-28T10:00:00Z', importador: 'LOGÍSTICA MUNDIAL LTDA', origem: 'CHINA', valor: 145200.80 },
    { id: '2', status: 'Processando', codigo: 'SC-2024-002', data: '2026-03-28T11:30:00Z', importador: 'REDE VAREJO S.A.', origem: 'EUA', valor: 89440.00 },
    { id: '3', status: 'Pendente', codigo: 'SC-2024-003', data: '2026-03-27T16:45:00Z', importador: 'TECH BRASIL INDÚSTRIA', origem: 'ALEMANHA', valor: 432110.50 },
    { id: '4', status: 'Atrasado', codigo: 'SC-2024-004', data: '2026-03-20T09:00:00Z', importador: 'MEGA RETAIL GROUP', origem: 'BRASIL', valor: 12500.00 },
  ]

  const acoesTabela = [
    { id: 'edit', icone: <FileText size={16} />, tooltip: 'Ver Detalhes', onClick: (item: any) => console.log('Edit', item) },
    { id: 'download', icone: <DownloadSimple size={16} />, tooltip: 'Baixar PDF', onClick: (item: any) => console.log('Download', item) },
  ]

  return (
    <PaginaGlobal
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          titulo="Financeiro Global"
          subtitulo="Relatório consolidado por cliente, produto e data com acompanhamento de inadimplências."
          icone={<CurrencyDollar weight="duotone" size={24} />}
        />
      }
      stats={
        <>
          <StatCardGlobal
            titulo="A RECEBER (ABERTO)"
            valor="R$ 145.200,80"
            subtexto="Mês de Março"
            icone={<Clock weight="bold" />}
            variante="padrao"
          />
          <StatCardGlobal
            titulo="RISCO INADIMPLÊNCIA"
            valor="R$ 12.500,00"
            subtexto="Faturas em atraso"
            icone={<Funnel weight="bold" />}
            variante="perigo"
          />
          <StatCardGlobal
            titulo="PERFORMANCE"
            valor="94.2%"
            subtexto="Taxa de recebimento"
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
          title="Novo Relatório"
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
          Faturamento por Cliente e Base
        </div>
      }
    >
      <TabelaGlobal
        id="relatorios-simulacusto-v1"
        colunas={colunas}
        dados={dados}
        acoes={acoesTabela}
        idKey="id"
        mensagemVazio="Nenhum relatório encontrado para o filtro selecionado."
      />
      
      <div style={{ marginTop: '2rem', padding: '1rem 1.25rem', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.25rem' }}>💡</span>
        <span>
          <strong>Gestão Manual:</strong> Utilize as ações laterais para baixar relatórios individuais ou gerar novos cálculos automáticos. Relatórios consolidados são atualizados a cada 4 horas.
        </span>
      </div>
    </PaginaGlobal>
  )
}
