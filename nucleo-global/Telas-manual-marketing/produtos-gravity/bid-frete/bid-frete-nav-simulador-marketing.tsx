import {
  CheckCircle,
  ClockCounterClockwise,
  Envelope,
  GearSix,
  Truck,
  UserCircle,
  WhatsappLogo,
} from '@phosphor-icons/react'
import type { NavItem } from '../../../Layout/menu-lateral-global/src/MenuLateralGlobal'

/** Paridade com a navegação do BID Frete Internacional real (App.tsx + config.ts). */
export const NAV_ITENS_SIMULADOR_BID_FRETE: NavItem[] = [
  {
    label: 'Meu Espaço',
    icon: <UserCircle weight="duotone" size={20} />,
    children: [
      {
        to: '/hub',
        label: 'Minhas Atividades',
        icon: <CheckCircle weight="duotone" size={20} />,
        disabled: true,
        badge: 'Em Breve',
        badgeVariant: 'muted',
      },
      {
        to: '/hub',
        label: 'E-mail',
        icon: <Envelope weight="duotone" size={20} />,
        disabled: true,
        badge: 'Em Breve',
        badgeVariant: 'muted',
      },
      {
        to: '/hub',
        label: 'WhatsApp',
        icon: <WhatsappLogo weight="duotone" size={20} />,
        disabled: true,
        badge: 'Em Breve',
        badgeVariant: 'muted',
      },
    ],
  },
  {
    to: '/bid-frete/fornecedores',
    label: 'Fornecedores',
    icon: <Truck weight="duotone" size={20} />,
    disabled: true,
    badge: 'Em Breve',
    badgeVariant: 'muted',
  },
  {
    to: '/bid-frete/historico',
    label: 'Histórico',
    icon: <ClockCounterClockwise weight="duotone" size={20} />,
    disabled: true,
    badge: 'Em Breve',
    badgeVariant: 'muted',
  },
  {
    to: '/bid-frete/configuracoes',
    label: 'Configurações',
    icon: <GearSix weight="duotone" size={20} />,
    disabled: true,
    badge: 'Em Breve',
    badgeVariant: 'muted',
  },
]
