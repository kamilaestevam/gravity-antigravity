// src/views/AtividadesView.tsx
// View principal do módulo Atividades.
// Consome a API do servidor via fetch — nunca acessa o banco diretamente.

import React, { useState } from 'react'

type Tab = 'atividades' | 'empresas' | 'contatos' | 'pipeline' | 'kanban'

export default function AtividadesView(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<Tab>('atividades')

  return (
    <div className="atividades-module">
      <header className="atividades-header">
        <h1>Atividades</h1>
        <nav className="atividades-tabs" role="tablist">
          {(['atividades', 'empresas', 'contatos', 'pipeline', 'kanban'] as Tab[]).map(
            (tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                className={`tab-btn${activeTab === tab ? ' tab-btn--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            )
          )}
        </nav>
      </header>

      <main className="atividades-content">
        {activeTab === 'atividades' && <AtividadesTab />}
        {activeTab === 'empresas' && <EmpresasTab />}
        {activeTab === 'contatos' && <ContatosTab />}
        {activeTab === 'pipeline' && <PipelineTab />}
        {activeTab === 'kanban' && <KanbanTab />}
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Componentes de aba — placeholders que o Agente Frontend implementará
// ---------------------------------------------------------------------------

function AtividadesTab(): React.ReactElement {
  return <div data-testid="tab-atividades">Lista de atividades — implementar com TabelaGlobal</div>
}

function EmpresasTab(): React.ReactElement {
  return <div data-testid="tab-empresas">Lista de empresas — implementar com TabelaGlobal</div>
}

function ContatosTab(): React.ReactElement {
  return <div data-testid="tab-contatos">Lista de contatos — implementar com TabelaGlobal</div>
}

function PipelineTab(): React.ReactElement {
  return <div data-testid="tab-pipeline">Funil de vendas — implementar com colunas de etapa</div>
}

function KanbanTab(): React.ReactElement {
  return <div data-testid="tab-kanban">Quadro Kanban — implementar com drag-and-drop</div>
}
