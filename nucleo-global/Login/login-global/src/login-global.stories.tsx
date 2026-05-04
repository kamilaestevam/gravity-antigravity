import type { Meta, StoryObj } from '@storybook/react'
import { LoginGlobal } from './LoginGlobal'

const meta = {
  title: 'Nucleo Global/Login/LoginGlobal',
  component: LoginGlobal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{
        display: 'flex',
        height: '100vh',
        background: '#0f172a',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}>
        <div style={{
          flex: '0 0 55%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f1f5f9',
          fontSize: '1.5rem',
          fontWeight: 700,
        }}>
          ⬡ Gravity Platform
        </div>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LoginGlobal>

export default meta
type Story = StoryObj<typeof meta>

export const SignIn: Story = {
  parameters: {
    reactRouter: { location: { pathname: '/login' } },
  },
}

export const SignUp: Story = {
  parameters: {
    reactRouter: { location: { pathname: '/cadastro' } },
  },
}
