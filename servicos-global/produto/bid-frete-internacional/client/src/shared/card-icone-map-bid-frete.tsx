import React from 'react'
import {
  Package, CurrencyDollar, Scales, Warning, CheckCircle, Coins,
  ClipboardText, ArrowRight, Gauge, ArrowsLeftRight, StackSimple, Money,
  ChartBar, TrendUp, TrendDown, Percent, Target, Lightning, Star,
  Heart, Fire, Trophy, Medal, Crown,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

export const ICONE_CARD_COMPONENTES: Record<string, Icon> = {
  Package,
  CurrencyDollar,
  Scales,
  Warning,
  CheckCircle,
  Coins,
  ClipboardText,
  ArrowRight,
  Gauge,
  ArrowsLeftRight,
  StackSimple,
  Money,
  ChartBar,
  TrendUp,
  TrendDown,
  Percent,
  Target,
  Lightning,
  Star,
  Heart,
  Fire,
  Trophy,
  Medal,
  Crown,
}

export const ICONE_CARD_IDS = Object.keys(ICONE_CARD_COMPONENTES)

export function resolverIconeCard(
  iconeId?: string,
  size = 18,
  cor?: string,
): React.ReactNode {
  const Icone = ICONE_CARD_COMPONENTES[iconeId ?? 'Package'] ?? Package
  return <Icone weight="duotone" size={size} style={cor ? { color: cor } : undefined} />
}
