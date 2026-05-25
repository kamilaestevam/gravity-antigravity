import React from 'react'
import { Outlet } from 'react-router-dom'
import { TituloPaginaTopoProvider } from '@nucleo/menu-topo-global'
import { WsTituloPaginaTopo } from './WsTituloPaginaTopo'
import './configurador-page-shell.css'
import '@nucleo/menu-topo-global/src/menu-topo-global.css'

export interface WsAreaConteudoProps {
  accentColor: string
  area: 'admin' | 'configurador'
}

/** Provider + barra de título + shell de padding canônico para rotas filhas. */
export function WsAreaConteudo({ accentColor, area }: WsAreaConteudoProps) {
  return (
    <TituloPaginaTopoProvider>
      <WsTituloPaginaTopo accentColor={accentColor} area={area} />
      <div className="ws-content configurador-page-shell">
        <Outlet />
      </div>
    </TituloPaginaTopoProvider>
  )
}
