import type { Meta, StoryObj } from '@storybook/react'
import { PaginaGlobal } from './pagina-global'

const meta = {
  title: 'Nucleo Global/Layout/PaginaGlobal',
  component: PaginaGlobal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    layout: {
      control: 'select',
      options: ['lista', 'formulario'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{
        height: '100vh',
        background: '#0f172a',
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PaginaGlobal>

export default meta
type Story = StoryObj<typeof meta>

export const LayoutLista: Story = {
  args: {
    layout: 'lista',
    cabecalho: (
      <div style={{ padding: '12px 16px', background: '#1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>
        Cabeçalho — Workspaces
      </div>
    ),
    stats: (
      <div style={{ display: 'flex', gap: 16 }}>
        {['Ativos: 42', 'Usuários: 23', 'Pendentes: 3'].map(t => (
          <div key={t} style={{ background: '#1e293b', border: '1px solid rgba(129,140,248,0.1)', borderRadius: 8, padding: '10px 16px', color: '#f1f5f9', fontSize: 12 }}>{t}</div>
        ))}
      </div>
    ),
    acoes: (
      <div style={{ background: '#6366f1', color: '#fff', fontSize: 11, fontWeight: 700, padding: '8px 16px', borderRadius: 9999 }}>+ Novo Workspace</div>
    ),
    children: (
      <div style={{ background: '#1e293b', border: '1px solid rgba(129,140,248,0.1)', borderRadius: 8, padding: 16, color: '#94a3b8', fontSize: 12 }}>
        Área de conteúdo (TabelaGlobal, formulários, etc.)
      </div>
    ),
  },
}

export const LayoutFormulario: Story = {
  args: {
    layout: 'formulario',
    cabecalho: (
      <div style={{ padding: '12px 16px', background: '#1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>
        Cabeçalho — Editar Organização
      </div>
    ),
    children: (
      <div style={{ background: '#1e293b', border: '1px solid rgba(129,140,248,0.1)', borderRadius: 8, padding: 24, color: '#94a3b8', fontSize: 12, maxWidth: 600, margin: '0 auto' }}>
        Formulário centralizado
      </div>
    ),
  },
}

export const ComToolbar: Story = {
  args: {
    layout: 'lista',
    cabecalho: (
      <div style={{ padding: '12px 16px', background: '#1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>
        Cabeçalho — Produtos
      </div>
    ),
    toolbar: (
      <div style={{ display: 'flex', gap: 8 }}>
        {['Todos', 'Ativos', 'Inativos'].map(t => (
          <div key={t} style={{ padding: '6px 12px', borderRadius: 6, fontSize: 11, color: t === 'Todos' ? '#818cf8' : '#94a3b8', background: t === 'Todos' ? 'rgba(129,140,248,0.1)' : 'transparent', border: '1px solid rgba(129,140,248,0.15)' }}>{t}</div>
        ))}
      </div>
    ),
    children: (
      <div style={{ background: '#1e293b', border: '1px solid rgba(129,140,248,0.1)', borderRadius: 8, padding: 16, color: '#94a3b8', fontSize: 12 }}>
        Conteúdo filtrado
      </div>
    ),
  },
}
