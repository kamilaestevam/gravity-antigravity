import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Home } from './pages/Home'
import { Produtos } from './pages/Produtos'
import { SimuladorComex } from './pages/produto/SimuladorComex'
import { ProdutoDetalhe } from './pages/produto/ProdutoDetalhe'
import { Precos } from './pages/Precos'
import { Trial } from './pages/Trial'
import { Checkout } from './pages/Checkout'
import { ComingSoon } from './pages/ComingSoon'
import { isLancado } from './launch'

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
      <p style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--bg-elevated)', lineHeight: 1 }}>404</p>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '1rem 0 0.5rem' }}>Página não encontrada</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>A página que você procura não existe ou foi movida.</p>
      <a href="/" className="btn btn-primary">Voltar para o Início</a>
    </div>
  )
}

export function App() {
  // Pré-lançamento: todo o site público mostra a contagem regressiva.
  // No horário de lançamento (ver launch.ts) a vitrine completa é liberada
  // automaticamente, sem necessidade de novo deploy.
  if (!isLancado()) {
    return <ComingSoon />
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/produtos/simulador-comex" element={<SimuladorComex />} />
          <Route path="/produtos/:id" element={<ProdutoDetalhe />} />
          <Route path="/precos" element={<Precos />} />
          <Route path="/trial" element={<Trial />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
