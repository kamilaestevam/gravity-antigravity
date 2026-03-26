import type { Meta, StoryObj } from '@storybook/react'
import { BotoesSalvarGlobal } from './botoes-salvar'

const meta = {
  title: 'Nucleo Global/Botoes/BotoesSalvarGlobal',
  component: BotoesSalvarGlobal,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    dirty: { control: 'boolean' },
    salvando: { control: 'boolean' },
    alinhamento: {
      control: 'select',
      options: ['esquerda', 'centro', 'direita'],
    },
    onSalvar: { action: 'salvar-clicado' },
    onCancelar: { action: 'cancelar-clicado' }
  },
} satisfies Meta<typeof BotoesSalvarGlobal>

export default meta
type Story = StoryObj<typeof meta>

export const Escondido: Story = {
  args: {
    dirty: false,
    salvando: false,
    alinhamento: 'direita',
  },
}

export const EmEdicao: Story = {
  args: {
    dirty: true,
    salvando: false,
    alinhamento: 'direita',
  },
}

export const Salvando: Story = {
  args: {
    dirty: true,
    salvando: true,
    alinhamento: 'direita',
  },
}

export const AlinhamentoCentro: Story = {
  args: {
    dirty: true,
    salvando: false,
    alinhamento: 'centro',
  },
}
