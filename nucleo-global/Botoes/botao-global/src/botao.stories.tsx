import type { Meta, StoryObj } from '@storybook/react'
import { BotaoGlobal } from './botao'

const meta = {
  title: 'Nucleo Global/Botoes/BotaoGlobal',
  component: BotaoGlobal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variante: {
      control: 'select',
      options: ['primario', 'secundario', 'fantasma', 'perigo'],
    },
    tamanho: {
      control: 'select',
      options: ['padrao', 'pequeno', 'grande'],
    },
    blocoCompleto: { control: 'boolean' },
    centralizado: { control: 'boolean' },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
} satisfies Meta<typeof BotaoGlobal>

export default meta
type Story = StoryObj<typeof meta>

export const Primario: Story = {
  args: {
    variante: 'primario',
    children: 'Nova Empresa',
    tamanho: 'padrao',
  },
}

export const Secundario: Story = {
  args: {
    variante: 'secundario',
    children: 'Cancelar',
    tamanho: 'padrao',
  },
}

export const Fantasma: Story = {
  args: {
    variante: 'fantasma',
    children: 'Copiar',
    tamanho: 'pequeno',
  },
}

export const Perigo: Story = {
  args: {
    variante: 'perigo',
    children: 'Excluir',
    tamanho: 'padrao',
  },
}

export const Desabilitado: Story = {
  args: {
    variante: 'primario',
    children: 'Carregando...',
    disabled: true,
  },
}
