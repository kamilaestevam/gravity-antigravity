/**
 * Mock de @phosphor-icons/react para testes do produto Pedido
 */
import React from 'react'

function createIcon(name: string) {
  const Icon = React.forwardRef<HTMLSpanElement, Record<string, unknown>>(({ weight, size, ...rest }, ref) => (
    <span ref={ref} data-testid={`icon-${name}`} data-icon={name} {...(rest as any)} />
  ))
  Icon.displayName = name
  return Icon
}

export const Package          = createIcon('Package')
export const Plus             = createIcon('Plus')
export const Eye              = createIcon('Eye')
export const PencilSimple     = createIcon('PencilSimple')
export const Trash            = createIcon('Trash')
export const Copy             = createIcon('Copy')
export const CurrencyDollar   = createIcon('CurrencyDollar')
export const Scales           = createIcon('Scales')
export const Cube             = createIcon('Cube')
export const Warning          = createIcon('Warning')
export const CheckCircle      = createIcon('CheckCircle')
export const Coins            = createIcon('Coins')
export const ArrowRight       = createIcon('ArrowRight')
export const Gauge            = createIcon('Gauge')
export const Money            = createIcon('Money')
export const DownloadSimple   = createIcon('DownloadSimple')
export const ArrowsClockwise  = createIcon('ArrowsClockwise')
export const X                = createIcon('X')
export const GearSix          = createIcon('GearSix')
export const ListBullets      = createIcon('ListBullets')
export const Kanban           = createIcon('Kanban')
export const ChartPieSlice    = createIcon('ChartPieSlice')
export const ClockCounterClockwise = createIcon('ClockCounterClockwise')
export const UserCircle       = createIcon('UserCircle')
export const Envelope         = createIcon('Envelope')
export const WhatsappLogo     = createIcon('WhatsappLogo')
