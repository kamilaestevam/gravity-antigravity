import type { Meta, StoryObj } from '@storybook/react'
import { BotaoNovoAdminGlobal } from './botao-novo-admin'

const meta = {
  title: 'Nucleo Global/Botoes/BotaoNovoAdminGlobal',
  component: BotaoNovoAdminGlobal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    rotulo: { control: 'text' },
    rotuloAtivo: { control: 'text' },
    ativo: { control: 'boolean' },
    onClick: { action: 'clicked' }
  },
} satisfies Meta<typeof BotaoNovoAdminGlobal>

export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = {
  args: {
    rotulo: 'Novo Admin',
    ativo: false,
  },
}

export const Ativo: Story = {
  args: {
    rotulo: 'Novo Admin',
    rotuloAtivo: 'Cancelar',
    ativo: true,
  },
}
