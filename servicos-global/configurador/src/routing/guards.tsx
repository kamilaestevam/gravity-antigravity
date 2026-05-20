// src/routing/guards.tsx
//
// Wrappers de autorização de rota. Consomem a matriz declarativa
// (route-policy.ts) — fonte ÚNICA de verdade.
//
// Wrappers exportados:
//   - <ConfiguradorRoute>   bloqueia PADRAO/FORNECEDOR de /workspace/*
//   - <AdminRoute>          já existe em App.tsx (gravity_admin)
//   - <ProtectedRoute>      já existe em App.tsx (apenas isSignedIn)
//
// Padrão de loading: ProductLoading (mesma UX que rotas de produto). Evita
// flash de tela em branco enquanto /api/v1/me não retornou.
//
// Mandamentos:
//   01 — tipoUsuario vem do banco via /api/v1/me (useCarregarTipoUsuario)
//   08 — fail-closed: pronto=true && tipoUsuario=null => Navigate /hub
//   04 — Master/SuperAdmin nunca bloqueados (matriz garante)

import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { GravityLoader } from '@nucleo/gravity-loader-global'
import { useCarregarTipoUsuario } from '../hooks/use-carregar-tipo-usuario'
import { podeAcessarArea, type AreaApp } from './route-policy'

const Loading: React.FC = () => (
  <div style={{ position: 'fixed', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0f172a', zIndex: 50 }}>
    <GravityLoader texto="Carregando" tamanho="lg" />
  </div>
)

/**
 * Bloqueia acesso a uma área se o tipo_usuario não está autorizado pela matriz.
 *
 * Comportamento:
 *   - Clerk ainda carregando         -> renderiza null (evita flash)
 *   - não autenticado                -> Navigate /login
 *   - autenticado, hook ainda buscando -> renderiza Loading (Mand. 08: nunca
 *                                          renderiza children sem checagem)
 *   - hook pronto mas tipoUsuario null (erro /me) -> Navigate /hub (fail-closed)
 *   - tipoUsuario presente mas não autorizado     -> Navigate /hub
 *   - tipoUsuario autorizado pela matriz          -> renderiza children
 */
export function AuthorizedRoute({
  area,
  children,
  fallback = '/hub',
}: {
  area: AreaApp
  children: React.ReactNode
  fallback?: string
}) {
  const { isLoaded, isSignedIn } = useAuth()
  const { pronto, tipoUsuario } = useCarregarTipoUsuario()

  if (!isLoaded) return null
  if (!isSignedIn) return <Navigate to="/login" replace />
  if (!pronto) return <Loading />

  if (!podeAcessarArea(tipoUsuario, area)) {
    return <Navigate to={fallback} replace />
  }

  return <>{children}</>
}

/** Atalho semântico: bloqueia /workspace/* para PADRAO/FORNECEDOR. */
export function ConfiguradorRoute({ children }: { children: React.ReactNode }) {
  return <AuthorizedRoute area="configurador">{children}</AuthorizedRoute>
}
