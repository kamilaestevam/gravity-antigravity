import type { Meta, StoryObj } from '@storybook/react'
import { BotaoNovoGlobal } from './botao-novo'

const meta = {
  title: 'Nucleo Global/Botoes/BotaoNovoGlobal',
  component: BotaoNovoGlobal,
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
} satisfies Meta<typeof BotaoNovoGlobal>

export default meta
type Story = StoryObj<typeof meta>

export const Padrao: Story = {
  args: {
    rotulo: 'Novo Registro',
    ativo: false,
  },
}

export const Ativo: Story = {
  args: {
    rotulo: 'Novo Registro',
    rotuloAtivo: 'Cancelar',
    ativo: true,
  },
}
