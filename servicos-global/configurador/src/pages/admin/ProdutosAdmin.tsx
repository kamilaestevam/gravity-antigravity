import React from 'react'
import { ShoppingBagOpen, Tag, Users, CurrencyCircleDollar, BoxArrowUp, FileXls } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaExportAcao } from '@nucleo/tabela-global'
import { StatCardGlobal } from '@nucleo/stat-card-global'

type ProdutoStatus = 'Ativo' | 'Em Breve' | 'Legado'

type ProdutoConfigured = {
  id: string
  nome: string
  descricao: string
  publicoAlvo: string
  valorBase: string
  limite: string
  cobrancaPor: string
  status: ProdutoStatus
}

type NegociacaoEspecial = {
  id: string
  produtoId: string
  cliente: string
  acordo: string
  vigencia: string
}

const produtosGlobais: ProdutoConfigured[] = [
  {
    id: 'p1',
    nome: 'SimulaCusto',
    descricao: 'Gestão de custos estimados de exportação e importação',
    publicoAlvo: 'Importadores, exportadores, despachantes aduaneiros e tradings',
    valorBase: 'Free',
    limite: 'Até 10 estim.',
    cobrancaPor: 'Excedente: R$10,90 / usuário',
    status: 'Ativo'
  },
  {
    id: 'p2',
    nome: 'Gravity Journey',
    descricao: 'Controle de fluxo logístico e processos end-to-end',
    publicoAlvo: 'Agentes de carga, Tradings, Importadores',
    valorBase: 'R$ 499,00',
    limite: 'Até 50 processos',
    cobrancaPor: 'R$ 5,50 / processo extra',
    status: 'Ativo'
  },
  {
    id: 'p3',
    nome: 'Gravity Analytics',
    descricao: 'Dashboards e BI em tempo real das operações',
    publicoAlvo: 'C-Level, Gestores Logísticos',
    valorBase: 'R$ 299,00',
    limite: 'Acessos ilimitados',
    cobrancaPor: 'Fixo mensal',
    status: 'Ativo'
  },
  {
    id: 'p4',
    nome: 'AutoDUIMP',
    descricao: 'Automatização e registro de DUIMP',
    publicoAlvo: 'Despachantes Aduaneiros',
    valorBase: 'R$ 899,00',
    limite: 'Até 100 DUIMPs',
    cobrancaPor: 'R$ 8,90 / DUIMP extra',
    status: 'Em Breve'
  }
]

const negociacoesEspeciais: NegociacaoEspecial[] = [
  { id: 'n1', produtoId: 'p1', cliente: 'Importas SA', acordo: 'R$ 5,90 / usuário (excedente)', vigencia: '12 meses' },
  { id: 'n2', produtoId: 'p2', cliente: 'TechCorp Brasil', acordo: 'R$ 3,00 / processo extra', vigencia: 'Indeterminado' },
  { id: 'n3', produtoId: 'p4', cliente: 'Mega Retail', acordo: 'R$ 7,50 / DUIMP extra', vigencia: '24 meses' }
]

const getStatusBadge = (status: ProdutoStatus) => {
  switch (status) {
    case 'Ativo': return 'ws-badge-success'
    case 'Em Breve': return 'ws-badge-warning'
    case 'Legado': return 'ws-badge-danger'
    default: return 'ws-badge-neutral'
  }
}

export function ProdutosAdmin() {

  const COLUNAS_PRODUTOS: TabelaGlobalColuna<ProdutoConfigured>[] = [
    {
      key: 'nome', label: 'Nome do Produto', tipo: 'texto',
      tooltipTitulo: 'Entity: Produto', tooltipDescricao: 'Identificação comercial mapeada na arquitetura de billing.',
      render: (v) => <span style={{ fontWeight: 600, color: 'var(--ws-text)' }}>{v}</span>
    },
    {
      key: 'descricao', label: 'O que é', tipo: 'texto',
      tooltipTitulo: 'Meta Description', tooltipDescricao: 'Resumo estruturado exibido no frontend para conversão.',
      render: (v) => <span style={{ color: 'var(--ws-muted)', fontSize: '0.85rem' }}>{v}</span>
    },
    {
      key: 'publicoAlvo', label: 'Para quem', tipo: 'texto',
      tooltipTitulo: 'Segmentação Geográfica/Mercado', tooltipDescricao: 'Filtro usado pelo motor de recomendação (IA).',
      render: (v) => <span style={{ color: 'var(--ws-muted)', fontSize: '0.85rem' }}>{v}</span>
    },
    {
      key: 'valorBase', label: 'Valor Base', tipo: 'texto',
      tooltipTitulo: 'Pricing Base', tooltipDescricao: 'SKU inicial antes de modificadores de uso ou descontos.',
      render: (v) => <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--ws-text)', fontSize: '0.9375rem' }}>{v}</span>
    },
    {
      key: 'limite', label: 'Limite / Franquia', tipo: 'texto',
      tooltipTitulo: 'Rate Limit / Quota', tooltipDescricao: 'Limites técnicos (hard/soft) configurados no API Gateway.',
      render: (v) => <span style={{ color: 'var(--ws-muted)' }}>{v}</span>
    },
    {
      key: 'cobrancaPor', label: 'Cobrança Adicional', tipo: 'texto',
      tooltipTitulo: 'Billing Excedente', tooltipDescricao: 'Métrica de pay-as-you-go coletada via eventos (Kafka).',
      render: (v) => <span style={{ color: 'var(--ws-text)', fontSize: '0.85rem' }}>{v}</span>
    },
    {
      key: 'status', label: 'Status', tipo: 'texto',
      tooltipTitulo: 'Lifecycle Status', tooltipDescricao: 'Determina disponibilidade no checkout e rotina de deprecation.',
      render: (v) => <span className={`ws-badge ${getStatusBadge(v as ProdutoStatus)}`}>{v}</span>
    }
  ]

  const COLUNAS_NEGOCIACOES: TabelaGlobalColuna<NegociacaoEspecial>[] = [
    {
      key: 'cliente', label: 'Cliente', tipo: 'texto',
      tooltipTitulo: 'Referência ao Tenant ID', tooltipDescricao: 'Vinculação FK com a tabela de Organizations (Clerk).',
      render: (v) => <span style={{ fontWeight: 600 }}>{v}</span>
    },
    {
      key: 'produtoId', label: 'Produto Relacionado', tipo: 'texto',
      tooltipTitulo: 'Referência ao Product ID', tooltipDescricao: 'FK para a tabela de produtos globais no banco master.',
      render: (v) => {
        const prod = produtosGlobais.find(p => p.id === v)
        return <span style={{ color: 'var(--ws-text)' }}>{prod ? prod.nome : '—'}</span>
      }
    },
    {
      key: 'acordo', label: 'Condição Especial', tipo: 'texto',
      tooltipTitulo: 'Override de Preço', tooltipDescricao: 'Regra de exceção aplicada no motor de billing no final do mês.',
      render: (v) => <span style={{ color: '#818cf8', fontWeight: 500 }}>{v}</span>
    },
    {
      key: 'vigencia', label: 'Vigência', tipo: 'texto',
      tooltipTitulo: 'TTL / Data de Expiração', tooltipDescricao: 'Determina reversão automática para o pricing base após a data limite.',
      render: (v) => <span style={{ color: 'var(--ws-muted)', fontSize: '0.85rem' }}>{v}</span>
    }
  ]

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          titulo="Produtos & Serviços"
          subtitulo="Gestão do catálogo de produtos, franquias e negociações de preços da plataforma Gravity."
          icone={<ShoppingBagOpen weight="duotone" size={22} color="#818cf8" />}
        />
      }
      stats={
        <>
          <StatCardGlobal
            titulo="Total de Produtos"
            icone={<BoxArrowUp weight="duotone" size={16} />}
            valor={<span style={{ fontSize: '1.5rem' }}>{produtosGlobais.length}</span>}
            subtexto="No catálogo oficial"
            variante="padrao"
          />
          <StatCardGlobal
            titulo="Produtos Ativos"
            icone={<Tag weight="duotone" size={16} />}
            valor={<span style={{ fontSize: '1.5rem' }}>{produtosGlobais.filter(p => p.status === 'Ativo').length}</span>}
            subtexto="Disponíveis para assinatura"
            variante="sucesso"
          />
          <StatCardGlobal
            titulo="Negociações Ativas"
            icone={<Users weight="duotone" size={16} />}
            valor={<span style={{ fontSize: '1.5rem' }}>{negociacoesEspeciais.length}</span>}
            subtexto="Condições exclusivas de clientes"
            variante="aviso"
          />
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        
        {/* Bloco Catálogo Geral */}
        <div>
          <p className="ws-section-title ws-fade-up ws-fade-up-d2" style={{ marginBottom: '1rem' }}>
            <Tag weight="duotone" size={14} color="#818cf8" />
            Catálogo Geral
          </p>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <TabelaGlobal<ProdutoConfigured>
              dados={produtosGlobais}
              colunas={COLUNAS_PRODUTOS}
              mensagemVazio="Nenhum produto cadastrado no catálogo."
            />
          </div>
        </div>

        {/* Bloco Negociações Especiais */}
        <div>
          <p className="ws-section-title ws-fade-up ws-fade-up-d3" style={{ marginBottom: '1rem' }}>
            <CurrencyCircleDollar weight="duotone" size={14} color="#f59e0b" />
            Negociações Especiais
          </p>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <TabelaGlobal<NegociacaoEspecial>
              dados={negociacoesEspeciais}
              colunas={COLUNAS_NEGOCIACOES}
              mensagemVazio="Nenhuma negociação especial registrada."
            />
          </div>
        </div>

      </div>
    </PaginaGlobal>
  )
}
