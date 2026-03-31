/**
 * Mock de @phosphor-icons/react
 * Cada icone retorna um span com data-testid para testes
 */
import React from 'react'

function createIcon(name: string) {
  const Icon = React.forwardRef<HTMLSpanElement, Record<string, unknown>>((props, ref) => (
    <span ref={ref} data-testid={`icon-${name}`} data-icon={name} {...filterProps(props)} />
  ))
  Icon.displayName = name
  return Icon
}

function filterProps(props: Record<string, unknown>) {
  const { weight, size, ...rest } = props
  return rest
}

export const FlowArrow = createIcon('FlowArrow')
export const Package = createIcon('Package')
export const FileText = createIcon('FileText')
export const FileDashed = createIcon('FileDashed')
export const CloudArrowUp = createIcon('CloudArrowUp')
export const PencilLine = createIcon('PencilLine')
export const CurrencyDollar = createIcon('CurrencyDollar')
export const Cube = createIcon('Cube')
export const GearSix = createIcon('GearSix')
export const ClipboardText = createIcon('ClipboardText')
export const Receipt = createIcon('Receipt')
export const Envelope = createIcon('Envelope')
export const EnvelopeOpen = createIcon('EnvelopeOpen')
export const CheckSquare = createIcon('CheckSquare')
export const ArrowLeft = createIcon('ArrowLeft')
export const Info = createIcon('Info')
export const CaretRight = createIcon('CaretRight')
export const Sidebar = createIcon('Sidebar')
export const Anchor = createIcon('Anchor')
export const CalendarBlank = createIcon('CalendarBlank')
export const Scales = createIcon('Scales')
export const ChatText = createIcon('ChatText')
export const File = createIcon('File')
export const Robot = createIcon('Robot')
export const Check = createIcon('Check')
export const Trash = createIcon('Trash')
export const PaperPlaneRight = createIcon('PaperPlaneRight')
export const Warning = createIcon('Warning')
export const Empty = createIcon('Empty')
export const Clock = createIcon('Clock')
export const Truck = createIcon('Truck')
export const ShieldCheck = createIcon('ShieldCheck')
export const Buildings = createIcon('Buildings')
export const Airplane = createIcon('Airplane')
export const IdentificationCard = createIcon('IdentificationCard')
export const MapPin = createIcon('MapPin')
export const Globe = createIcon('Globe')
export const ChartPieSlice = createIcon('ChartPieSlice')
export const MagnifyingGlass = createIcon('MagnifyingGlass')
export const ArrowBendUpLeft = createIcon('ArrowBendUpLeft')
export const ArrowBendUpRight = createIcon('ArrowBendUpRight')
export const Link = createIcon('Link')
export const Paperclip = createIcon('Paperclip')
export const Circle = createIcon('Circle')
export const Tag = createIcon('Tag')
export const Star = createIcon('Star')
export const Plus = createIcon('Plus')
export const Eye = createIcon('Eye')
export const PencilSimple = createIcon('PencilSimple')
