/**
 * main.tsx — Entry Point do SimulaCusto
 * Skill: antigravity-criar-produto (Passo 6)
 *
 * Inicializa o React com StrictMode + BrowserRouter.
 * Não usa ClerkProvider diretamente — o Shell lida com autenticação via Configurador.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@shell/shell.css'

import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
