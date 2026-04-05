import React, { useState } from 'react'
import { ModalPassoPassoGlobal } from '@nucleo/modal-passo-passo-global'
import type { PassoConfig } from '@nucleo/modal-passo-passo-global'

// ── Passos ────────────────────────────────────────────────────────────────────

const PASSOS_4: PassoConfig[] = [
  { id: 1, label: 'Dados Gerais' },
  { id: 2, label: 'Endereço' },
  { id: 3, label: 'Revisão' },
  { id: 4, label: 'Confirmação' },
]

const PASSOS_3: PassoConfig[] = [
  { id: 1, label: 'Upload' },
  { id: 2, label: 'Mapeamento' },
  { id: 3, label: 'Resultado' },
]

const PASSOS_2: PassoConfig[] = [
  { id: 1, label: 'Configurar' },
  { id: 2, label: 'Confirmar' },
]

// ── Conteúdo por passo ────────────────────────────────────────────────────────

function ConteudoPasso4({ passo }: { passo: number }) {
  if (passo === 1) return (
    <div className="passo-conteudo">
      <h3>Dados do Cadastro</h3>
      <p>Preencha as informações básicas da entidade que será criada.</p>
      <div className="campo-mock">
        <label>Nome completo</label>
        <input type="text" placeholder="Ex.: Empresa Exemplo Ltda." />
      </div>
      <div className="campo-mock">
        <label>CNPJ</label>
        <input type="text" placeholder="00.000.000/0000-00" />
      </div>
      <div className="campo-mock">
        <label>Segmento</label>
        <select>
          <option>Selecione...</option>
          <option>Importação</option>
          <option>Exportação</option>
          <option>Ambos</option>
        </select>
      </div>
    </div>
  )

  if (passo === 2) return (
    <div className="passo-conteudo">
      <h3>Endereço</h3>
      <p>Informe o endereço principal da empresa.</p>
      <div className="campo-mock">
        <label>CEP</label>
        <input type="text" placeholder="00000-000" />
      </div>
      <div className="campo-mock">
        <label>Logradouro</label>
        <input type="text" placeholder="Rua, Av., etc." />
      </div>
      <div className="campo-mock">
        <label>Cidade / UF</label>
        <input type="text" placeholder="São Paulo / SP" />
      </div>
    </div>
  )

  if (passo === 3) return (
    <div className="passo-conteudo">
      <h3>Revisão dos Dados</h3>
      <p>Confira as informações antes de salvar.</p>
      <div className="resumo-linha"><span>Nome</span><span>Empresa Exemplo Ltda.</span></div>
      <div className="resumo-linha"><span>CNPJ</span><span>00.000.000/0001-00</span></div>
      <div className="resumo-linha"><span>Segmento</span><span>Importação</span></div>
      <div className="resumo-linha"><span>CEP</span><span>01310-200</span></div>
      <div className="resumo-linha"><span>Cidade / UF</span><span>São Paulo / SP</span></div>
    </div>
  )

  return (
    <div className="passo-conteudo" style={{ alignItems: 'center', textAlign: 'center', padding: '2rem 0' }}>
      <span className="badge-ok">✓ Cadastro realizado com sucesso!</span>
      <p style={{ marginTop: '1rem' }}>A empresa foi criada e já está disponível no sistema.</p>
    </div>
  )
}

function ConteudoPasso3({ passo }: { passo: number }) {
  if (passo === 1) return (
    <div className="passo-conteudo">
      <h3>Upload de Arquivo</h3>
      <p>Arraste um arquivo ou clique para selecionar.</p>
      <div style={{
        border: '2px dashed var(--border-accent)',
        borderRadius: '8px',
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.875rem',
        marginTop: '0.5rem',
      }}>
        Formatos aceitos: XLSX, CSV, JSON<br />Tamanho máximo: 10MB
      </div>
    </div>
  )

  if (passo === 2) return (
    <div className="passo-conteudo">
      <h3>Mapeamento de Colunas</h3>
      <p>Associe as colunas do arquivo aos campos do sistema.</p>
      <div className="campo-mock">
        <label>Coluna "ref" → Campo sistema</label>
        <select><option>Referência</option><option>Código</option></select>
      </div>
      <div className="campo-mock">
        <label>Coluna "qtd" → Campo sistema</label>
        <select><option>Quantidade</option><option>Volume</option></select>
      </div>
      <div className="campo-mock">
        <label>Coluna "valor_unit" → Campo sistema</label>
        <select><option>Valor Unitário</option><option>Preço</option></select>
      </div>
    </div>
  )

  return (
    <div className="passo-conteudo" style={{ alignItems: 'center', textAlign: 'center', padding: '2rem 0' }}>
      <span className="badge-ok">✓ 42 registros importados</span>
      <p style={{ marginTop: '1rem' }}>2 linhas ignoradas por dados inválidos.</p>
    </div>
  )
}

function ConteudoPasso2({ passo }: { passo: number }) {
  if (passo === 1) return (
    <div className="passo-conteudo">
      <h3>Configurações</h3>
      <p>Defina os parâmetros da operação antes de confirmar.</p>
      <div className="campo-mock">
        <label>Modo de processamento</label>
        <select><option>Automático</option><option>Manual</option></select>
      </div>
      <div className="campo-mock">
        <label>Notificar responsável</label>
        <select><option>Sim</option><option>Não</option></select>
      </div>
    </div>
  )

  return (
    <div className="passo-conteudo" style={{ alignItems: 'center', textAlign: 'center', padding: '2rem 0' }}>
      <span className="badge-ok">✓ Operação confirmada!</span>
      <p style={{ marginTop: '1rem' }}>As configurações foram salvas com sucesso.</p>
    </div>
  )
}

// ── Wrapper de modal ──────────────────────────────────────────────────────────

interface DemoModalProps {
  titulo: string
  passos: PassoConfig[]
  tamanho?: 'sm' | 'md' | 'lg' | 'xl'
  children: (passo: number) => React.ReactNode
}

function DemoModal({ titulo, passos, tamanho = 'md', children }: DemoModalProps) {
  const [aberto, setAberto]       = useState(false)
  const [passoAtual, setPasso]    = useState(passos[0].id)

  function abrir() { setPasso(passos[0].id); setAberto(true) }
  function fechar() { setAberto(false) }

  function proximo() {
    const idx = passos.findIndex(p => p.id === passoAtual)
    if (idx < passos.length - 1) setPasso(passos[idx + 1].id)
    else fechar()
  }

  function voltar() {
    const idx = passos.findIndex(p => p.id === passoAtual)
    if (idx > 0) setPasso(passos[idx - 1].id)
  }

  const isUltimo = passoAtual === passos[passos.length - 1].id

  return (
    <>
      <button className="demo-btn" onClick={abrir}>
        {titulo} ({passos.length} passos)
      </button>

      <ModalPassoPassoGlobal
        titulo={titulo}
        aberto={aberto}
        passos={passos}
        passoAtual={passoAtual}
        onProximo={proximo}
        onVoltar={voltar}
        onFechar={fechar}
        tamanho={tamanho}
        labelBotaoFinal={isUltimo ? 'Fechar' : 'Salvar'}
      >
        {children(passoAtual)}
      </ModalPassoPassoGlobal>
    </>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [tema, setTema] = useState<'dark' | 'light'>('dark')

  return (
    <div data-theme={tema}>
      <header className="demo-header">
        <div>
          <h1>ModalPassoPassoGlobal</h1>
          <span>nucleo-global / Modais / modal-passo-passo-global</span>
        </div>
        <button className="demo-theme-btn" onClick={() => setTema(t => t === 'dark' ? 'light' : 'dark')}>
          {tema === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
        </button>
      </header>

      <main className="demo-body">
        <div style={{ textAlign: 'center' }}>
          <div className="demo-title">Modal Passo a Passo</div>
          <div className="demo-subtitle">
            Wizard com stepper horizontal — 2, 3 ou 4 passos
          </div>
        </div>

        <div className="demo-buttons">
          <DemoModal titulo="Novo Cadastro" passos={PASSOS_4} tamanho="md">
            {passo => <ConteudoPasso4 passo={passo} />}
          </DemoModal>

          <DemoModal titulo="Importar Arquivo" passos={PASSOS_3} tamanho="lg">
            {passo => <ConteudoPasso3 passo={passo} />}
          </DemoModal>

          <DemoModal titulo="Confirmar Operação" passos={PASSOS_2} tamanho="sm">
            {passo => <ConteudoPasso2 passo={passo} />}
          </DemoModal>
        </div>
      </main>
    </div>
  )
}
