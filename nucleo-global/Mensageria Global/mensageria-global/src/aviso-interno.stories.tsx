import type { Meta, StoryObj } from '@storybook/react'
import { AvisoInternoGlobal } from './AvisoInternoGlobal'

const avisosMock = [
  {
    id: '1',
    conteudo: 'O relatório mensal de faturamento está pronto para revisão.',
    autor: { nome: 'Maria Silva' },
    dataHora: '25/03/2026, 14:30',
    lido: false,
    tipo: 'aviso' as const,
  },
  {
    id: '2',
    conteudo: 'Você foi mencionado na tarefa "Ajustar permissões do workspace".',
    autor: { nome: 'João Pereira' },
    dataHora: '25/03/2026, 10:15',
    lido: false,
    tipo: 'mencao' as const,
  },
  {
    id: '3',
    conteudo: 'Backup automático concluído com sucesso.',
    dataHora: '24/03/2026, 23:00',
    lido: false,
    tipo: 'sistema' as const,
  },
  {
    id: '4',
    conteudo: 'Prazo da tarefa "Integração API v2" vence amanhã.',
    autor: { nome: 'Ana Costa' },
    dataHora: '24/03/2026, 09:00',
    lido: true,
    tipo: 'tarefa' as const,
    statusReal: 'atrasado' as const,
  },
]

const meta = {
  title: 'Nucleo Global/Feedback/AvisoInternoGlobal',
  component: AvisoInternoGlobal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    avisos: { control: 'object' },
    onBuscar: { action: 'buscar' },
    onFiltrarData: { action: 'filtrar-data' },
    onMarcarLido: { action: 'marcar-lido' },
    onMarcarTodosLidos: { action: 'marcar-todos-lidos' },
    onCriarAviso: { action: 'criar-aviso' },
    onFechar: { action: 'fechar' },
    className: { control: 'text' },
  },
} satisfies Meta<typeof AvisoInternoGlobal>

export default meta
type Story = StoryObj<typeof meta>

export const ComNotificacoes: Story = {
  args: {
    avisos: avisosMock,
  },
}

export const SemNotificacoes: Story = {
  args: {
    avisos: [],
  },
}

export const TodasLidas: Story = {
  args: {
    avisos: avisosMock.map(a => ({ ...a, lido: true })),
  },
}

export const MuitasNotificacoes: Story = {
  args: {
    avisos: Array.from({ length: 15 }, (_, i) => ({
      id: String(i + 1),
      conteudo: `Notificação de exemplo número ${i + 1} para testar o scroll da lista.`,
      autor: { nome: `Usuário ${i + 1}` },
      dataHora: '25/03/2026, 12:00',
      lido: false,
      tipo: 'aviso' as const,
    })),
  },
}

export const ApenasUma: Story = {
  args: {
    avisos: [avisosMock[0]],
  },
}
