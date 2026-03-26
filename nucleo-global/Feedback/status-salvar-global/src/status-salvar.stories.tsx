import type { Meta, StoryObj } from '@storybook/react'
import { StatusSalvarGlobal } from './StatusSalvarGlobal'

const meta = {
  title: 'Nucleo Global/Feedback/StatusSalvarGlobal',
  component: StatusSalvarGlobal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['idle', 'dirty', 'saving', 'success', 'error'],
    },
    hideOnIdle: { control: 'boolean' },
    autoResetMs: { control: 'number' },
    textIdle: { control: 'text' },
    textDirty: { control: 'text' },
    textSaving: { control: 'text' },
    textSuccess: { control: 'text' },
    textError: { control: 'text' },
    onAutoReset: { action: 'auto-reset' },
  },
} satisfies Meta<typeof StatusSalvarGlobal>

export default meta
type Story = StoryObj<typeof meta>

export const Idle: Story = {
  args: {
    status: 'idle',
    hideOnIdle: false,
  },
}

export const Dirty: Story = {
  args: {
    status: 'dirty',
  },
}

export const Saving: Story = {
  args: {
    status: 'saving',
  },
}

export const Success: Story = {
  args: {
    status: 'success',
    autoResetMs: 0,
  },
}

export const Error: Story = {
  args: {
    status: 'error',
    autoResetMs: 0,
  },
}
