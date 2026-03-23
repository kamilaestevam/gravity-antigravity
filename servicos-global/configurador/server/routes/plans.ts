// server/routes/plans.ts
// Lista de planos Stripe disponíveis
// GET /api/v1/plans

import { Router } from 'express'
import { stripe } from '../lib/stripe.js'

export const plansRouter = Router()

// Planos pré-configurados no Stripe
// Os IDs de preço devem estar nas env vars em produção
const PLANS = [
  {
    key: 'STARTER',
    name: 'Starter',
    description: 'Para pequenos negócios começando',
    priceMonthly: 9700, // R$ 97,00 em centavos
    stripePriceId: process.env.STRIPE_PRICE_STARTER ?? '',
    features: [
      '2 empresas filhas',
      'Até 5 usuários',
      'Serviços base incluídos',
    ],
  },
  {
    key: 'PROFESSIONAL',
    name: 'Professional',
    description: 'Para empresas em crescimento',
    priceMonthly: 29700, // R$ 297,00
    stripePriceId: process.env.STRIPE_PRICE_PROFESSIONAL ?? '',
    features: [
      'Até 20 empresas filhas',
      'Usuários ilimitados',
      'Todos os serviços',
      'Suporte prioritário',
    ],
  },
  {
    key: 'ENTERPRISE',
    name: 'Enterprise',
    description: 'Para grandes operações',
    priceMonthly: 99700, // R$ 997,00
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE ?? '',
    features: [
      '50 empresas filhas',
      'Usuários ilimitados',
      'SLA garantido',
      'Sucesso dedicado',
      'Customizações',
    ],
  },
]

/**
 * GET /api/v1/plans
 * Retorna os planos disponíveis (com metadados do Stripe quando possível)
 */
plansRouter.get('/', async (_req, res, next) => {
  try {
    // Enriquece com dados ao vivo do Stripe (opcional — usa fallback local se falhar)
    const plans = await Promise.all(
      PLANS.map(async (plan) => {
        try {
          if (plan.stripePriceId) {
            const price = await stripe.prices.retrieve(plan.stripePriceId)
            return {
              ...plan,
              priceMonthly: price.unit_amount ?? plan.priceMonthly,
              currency: price.currency ?? 'brl',
            }
          }
        } catch {
          // Continua com dados locais se Stripe não estiver configurado
        }
        return { ...plan, currency: 'brl' }
      })
    )
    res.json({ plans })
  } catch (err) {
    next(err)
  }
})
