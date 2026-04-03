/**
 * Mock de react-router-dom para testes do produto Pedido.
 * Evita conflito de versões de React (pedido usa React 18, root usa React 19).
 */
import React from 'react'

export function MemoryRouter({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

export function useNavigate() {
  return (_to: string) => {}
}

export function useLocation() {
  return { pathname: '/', search: '', hash: '', state: null }
}

export function useParams() {
  return {}
}

export function Link({ children, to, ...rest }: { children?: React.ReactNode; to: string; [k: string]: unknown }) {
  return <a href={String(to)} {...(rest as any)}>{children}</a>
}

export function NavLink({ children, to, ...rest }: { children?: React.ReactNode; to: string; [k: string]: unknown }) {
  return <a href={String(to)} {...(rest as any)}>{typeof children === 'function' ? children({ isActive: false }) : children}</a>
}

export function Outlet() {
  return null
}

export function Routes({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

export function Route({ element }: { element?: React.ReactNode; path?: string }) {
  return <>{element}</>
}
