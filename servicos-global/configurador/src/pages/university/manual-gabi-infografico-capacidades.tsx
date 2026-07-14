/**
 * Gabi IA — mapa de capacidades reais (catalogo-ferramentas.ts + rotas gabi/server).
 * Não inventa produtos com API: distingue ferramentas conectadas vs. só base de conhecimento.
 */

import React from 'react'
import {
  Sparkle,
  ChatCircleDots,
  Lightbulb,
  Question,
  SquaresFour,
  Package,
  AirplaneTilt,
  Gear,
  ShieldStar,
  ShoppingBag,
  Database,
  MagnifyingGlass,
  Brain,
  Wrench,
  ShieldCheck,
  ThumbsUp,
  Warning,
  BookOpenText,
} from '@phosphor-icons/react'

const CORPO = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 72%, transparent)'
const CORPO_FRACO = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 55%, transparent)'
const GABI = '#e879f9'

type BadgeTipo = 'read' | 'write' | 'confirma' | 'kb' | 'onde'

function Badge({ tipo, children }: { tipo: BadgeTipo; children: React.ReactNode }) {
  const estilos: Record<BadgeTipo, { bg: string; borda: string; cor: string }> = {
    read: { bg: 'rgba(52,211,153,.12)', borda: 'rgba(52,211,153,.35)', cor: '#6ee7b7' },
    write: { bg: 'rgba(96,165,250,.12)', borda: 'rgba(96,165,250,.35)', cor: '#93c5fd' },
    confirma: { bg: 'rgba(251,191,36,.12)', borda: 'rgba(251,191,36,.35)', cor: '#fcd34d' },
    kb: { bg: 'rgba(148,163,184,.1)', borda: 'rgba(148,163,184,.28)', cor: '#cbd5e1' },
    onde: { bg: 'rgba(232,121,249,.12)', borda: 'rgba(232,121,249,.35)', cor: '#f0abfc' },
  }
  const s = estilos[tipo]
  return (
    <span style={{
      display: 'inline-flex',
      fontSize: '.58rem',
      fontWeight: 800,
      letterSpacing: '.06em',
      textTransform: 'uppercase',
      padding: '2px 7px',
      borderRadius: 999,
      background: s.bg,
      border: `1px solid ${s.borda}`,
      color: s.cor,
    }}>
      {children}
    </span>
  )
}

function TituloSecao({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      margin: 0,
      fontSize: '.68rem',
      fontWeight: 800,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      color: 'var(--ws-muted,#94a3b8)',
    }}>
      {children}
    </p>
  )
}

function SecaoInfografico({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        marginTop: 20,
      }}
    >
      <TituloSecao>{titulo}</TituloSecao>
      {children}
    </section>
  )
}

function ColunaAcao({
  tipo,
  titulo,
  itens,
}: {
  tipo: 'read' | 'write' | 'confirma'
  titulo: string
  itens: string[]
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
      <div style={{ minHeight: 22, display: 'flex', alignItems: 'center' }}>
        <Badge tipo={tipo}>{titulo}</Badge>
      </div>
      <ul style={{
        margin: 0,
        paddingLeft: 16,
        fontSize: '.64rem',
        color: CORPO,
        lineHeight: 1.5,
      }}>
        {itens.map((item) => <li key={item} style={{ marginBottom: 4 }}>{item}</li>)}
      </ul>
    </div>
  )
}

const PONTOS_CONTATO = [
  {
    icone: ChatCircleDots,
    titulo: 'Chat flutuante',
    onde: 'Botão roxo com brilho (✨) no canto da tela, no Configurador e nos produtos.',
    serve: 'Conversar, buscar informações, pedir alterações e confirmar ações importantes.',
  },
  {
    icone: Sparkle,
    titulo: 'Ajuda na primeira visita',
    onde: 'Trial, Gravity Store, Organização e Workspaces.',
    serve: 'Sugestões do que perguntar conforme a tela em que você está.',
  },
  {
    icone: Question,
    titulo: 'Ajuda em um campo',
    onde: 'Ícone ? ao lado de campos em formulários.',
    serve: 'Explica o que aquele campo significa e como preencher (usa sua cota de IA).',
  },
  {
    icone: Lightbulb,
    titulo: 'Gabi Insights',
    onde: 'Hub, painel no canto inferior direito.',
    serve: 'Resumo do que merece atenção nos produtos contratados. Não é o chat.',
  },
] as const

const TRANSVERSAL = [
  { icone: BookOpenText, label: 'Manual inteligente', desc: 'Responde dúvidas sobre a plataforma e COMEX com conteúdo atualizado.' },
  { icone: Brain, label: 'Memória', desc: 'Lembra preferências e contexto da sua conta para personalizar respostas.' },
  { icone: Wrench, label: 'Ações nos produtos', desc: 'Consulta e altera dados reais em Pedido, Frete, Configurador e outros módulos.' },
  { icone: ShieldCheck, label: 'Confirmação', desc: 'Antes de excluir ou mudar algo grave, pede sua aprovação no chat.' },
  { icone: ThumbsUp, label: 'Feedback', desc: 'Você pode avaliar se a resposta ajudou ou não.' },
  { icone: Warning, label: 'Suporte', desc: 'Ajuda a entender erros recentes e abrir chamado se precisar.' },
] as const

type ProdutoFerramenta = {
  icone: React.ElementType
  cor: string
  nome: string
  restricao?: string
  leitura: string[]
  escrita?: string[]
  confirma?: string[]
}

const PRODUTOS_COM_API: ProdutoFerramenta[] = [
  {
    icone: Package,
    cor: '#f59e0b',
    nome: 'Pedido',
    leitura: [
      'Ver lista e detalhes dos pedidos',
      'Indicadores, gráficos e insights do dashboard',
      'Status congelado e preferências da sua lista',
      'Dados para relatórios e análises',
    ],
    escrita: ['Criar pedido', 'Editar informações', 'Duplicar pedido'],
    confirma: [
      'Excluir pedidos',
      'Editar vários pedidos de uma vez',
      'Juntar pedidos em um só',
      'Transferir itens entre pedidos',
      'Mudar status de vários pedidos',
    ],
  },
  {
    icone: AirplaneTilt,
    cor: '#60a5fa',
    nome: 'BID Frete Internacional',
    leitura: ['Ver indicadores do dashboard', 'Listar cotações com filtros', 'Abrir detalhe de uma cotação'],
  },
  {
    icone: Gear,
    cor: '#38bdf8',
    nome: 'Configurador',
    leitura: [
      'Ver dados da empresa, plano e assinaturas',
      'Listar workspaces e usuários',
      'Consultar histórico de auditoria',
    ],
    escrita: [
      'Criar e editar workspace',
      'Convidar usuário e vincular à filial',
      'Atualizar dados da organização',
    ],
    confirma: [
      'Excluir workspace',
      'Mudar patente do usuário',
      'Ativar ou inativar usuário',
    ],
  },
  {
    icone: ShieldStar,
    cor: '#f43f5e',
    nome: 'Admin',
    restricao: 'Somente administradores Gravity',
    leitura: [
      'Ver organizações e detalhes',
      'Produtos da plataforma e eventos de segurança',
      'Histórico global e usuários',
    ],
    confirma: ['Alterar organização', 'Alterar produto', 'Ativar produto na conta'],
  },
  {
    icone: SquaresFour,
    cor: '#818cf8',
    nome: 'Hub',
    leitura: ['Resumo ao abrir o Hub', 'Painel principal', 'Processos recentes'],
  },
  {
    icone: ShoppingBag,
    cor: '#10b981',
    nome: 'Gravity Store',
    leitura: ['Ver catálogo de produtos', 'Detalhes e planos de cada módulo'],
  },
  {
    icone: Database,
    cor: GABI,
    nome: 'Consultas avançadas',
    restricao: 'Usuários Master ou acima',
    leitura: ['Cruzar dados da empresa quando a pergunta não cabe em um produto só (até 100 linhas)'],
  },
]

const SO_CONHECIMENTO = [
  'Smart Docs', 'Processo', 'BID Câmbio', 'Financeiro COMEX', 'LPCO',
  'NF Importação', 'Simula Custo', 'API Cockpit', 'Marketplace', 'Dashboard',
]

export function ManualInfograficoGabiCapacidades() {
  return (
    <div style={{
      background: 'rgba(148,163,184,.04)',
      border: '1px solid rgba(148,163,184,.14)',
      borderRadius: 14,
      padding: '16px 18px 18px',
    }}>
      <style>{`
        .uni-gabi-cap-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          align-items: stretch;
        }
        .uni-gabi-cap-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          align-items: stretch;
        }
        .uni-gabi-cap-grid-produto {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .uni-gabi-cap-grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .uni-gabi-cap-grid-3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .uni-gabi-cap-grid-produto { grid-template-columns: 1fr; }
        }
        @media (max-width: 520px) {
          .uni-gabi-cap-grid-4,
          .uni-gabi-cap-grid-3 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Sparkle size={18} weight="duotone" color={GABI} />
        <span style={{ fontWeight: 800, fontSize: '.82rem', color: '#f1f5f9' }}>
          O que a Gabi consegue fazer hoje
        </span>
      </div>
      <p style={{ margin: 0, fontSize: '.7rem', color: CORPO_FRACO, lineHeight: 1.45 }}>
        Resumo do que está disponível agora na sua conta, por tipo de pergunta e por produto.
      </p>

      <SecaoInfografico titulo="Onde encontrar a Gabi">
        <div className="uni-gabi-cap-grid-4">
          {PONTOS_CONTATO.map((p) => {
            const Icone = p.icone
            return (
              <div
                key={p.titulo}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  height: '100%',
                  borderRadius: 10,
                  padding: '12px',
                  background: 'rgba(232,121,249,.06)',
                  border: '1px solid rgba(232,121,249,.22)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: 22 }}>
                  <Icone size={15} weight="duotone" color={GABI} />
                  <span style={{ fontWeight: 700, fontSize: '.72rem', color: '#e2e8f0' }}>{p.titulo}</span>
                </div>
                {([
                  ['Onde', p.onde],
                  ['Para que serve', p.serve],
                ] as const).map(([rotulo, texto]) => (
                  <div
                    key={rotulo}
                    style={{ fontSize: '.64rem', color: CORPO, lineHeight: 1.45, minHeight: 32 }}
                  >
                    <strong style={{ color: '#cbd5e1' }}>{rotulo}:</strong> {texto}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </SecaoInfografico>

      <SecaoInfografico titulo="Em qualquer conversa no chat">
        <div className="uni-gabi-cap-grid-3">
          {TRANSVERSAL.map((t) => {
            const Icone = t.icone
            return (
              <div
                key={t.label}
                style={{
                  display: 'flex',
                  gap: 8,
                  height: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'rgba(30,41,59,.5)',
                  border: '1px solid rgba(148,163,184,.12)',
                }}
              >
                <Icone size={16} weight="duotone" color={GABI} style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '.68rem', fontWeight: 700, color: '#e2e8f0', lineHeight: 1.35 }}>
                    {t.label}
                  </div>
                  <div style={{ fontSize: '.62rem', color: CORPO_FRACO, lineHeight: 1.4, marginTop: 4 }}>
                    {t.desc}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </SecaoInfografico>

      <SecaoInfografico titulo="O que ela faz em cada produto">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PRODUTOS_COM_API.map((prod) => {
            const Icone = prod.icone
            const temEscrita = Boolean(prod.escrita?.length)
            const temConfirma = Boolean(prod.confirma?.length)
            const gridTresColunas = temEscrita || temConfirma
            return (
              <div
                key={prod.nome}
                style={{
                  borderRadius: 10,
                  padding: '14px',
                  background: 'rgba(15,23,42,.35)',
                  border: `1px solid color-mix(in srgb, ${prod.cor} 28%, transparent)`,
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'wrap',
                  marginBottom: 12,
                  minHeight: 22,
                }}>
                  <Icone size={16} weight="duotone" color={prod.cor} />
                  <span style={{ fontWeight: 800, fontSize: '.76rem', color: '#f1f5f9' }}>{prod.nome}</span>
                  {prod.restricao && (
                    <span style={{ fontSize: '.62rem', color: '#fbbf24', fontWeight: 600 }}>{prod.restricao}</span>
                  )}
                </div>
                <div
                  className={gridTresColunas ? 'uni-gabi-cap-grid-produto' : undefined}
                  style={gridTresColunas ? undefined : { display: 'flex', flexDirection: 'column', gap: 8 }}
                >
                  <ColunaAcao tipo="read" titulo="Consultar" itens={prod.leitura} />
                  {temEscrita && prod.escrita && (
                    <ColunaAcao tipo="write" titulo="Alterar" itens={prod.escrita} />
                  )}
                  {temConfirma && prod.confirma && (
                    <ColunaAcao tipo="confirma" titulo="Precisa da sua confirmação" itens={prod.confirma} />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </SecaoInfografico>

      <SecaoInfografico titulo="Só explicação (ainda sem consulta aos dados ao vivo)">
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          padding: '12px',
          borderRadius: 10,
          background: 'rgba(148,163,184,.06)',
          border: '1px solid rgba(148,163,184,.16)',
        }}>
          <MagnifyingGlass size={16} weight="duotone" color="#94a3b8" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ marginBottom: 8, minHeight: 22, display: 'flex', alignItems: 'center' }}>
              <Badge tipo="kb">Só manual por enquanto</Badge>
            </div>
            <p style={{ margin: 0, fontSize: '.64rem', color: CORPO, lineHeight: 1.5 }}>
              Nestes módulos a Gabi <strong>explica como funciona</strong>, mas ainda{' '}
              <strong>não busca nem altera dados</strong> deles pelo chat:
            </p>
            <p style={{ margin: '8px 0 0', fontSize: '.64rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              {SO_CONHECIMENTO.join(' · ')}
            </p>
          </div>
        </div>
      </SecaoInfografico>

      <p style={{
        margin: '20px 0 0',
        fontSize: '.6rem',
        color: CORPO_FRACO,
        lineHeight: 1.45,
        borderTop: '1px solid rgba(148,163,184,.12)',
        paddingTop: 12,
      }}>
        O que a Gabi consegue fazer depende das **permissões da sua conta** e do **plano da organização**.
        Se a cota mensal de IA acabar, novas perguntas ficam bloqueadas até o próximo ciclo.
      </p>
    </div>
  )
}
