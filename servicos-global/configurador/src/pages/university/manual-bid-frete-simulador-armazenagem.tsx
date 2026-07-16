import React, { useRef } from 'react'
import { Plus, Trash, Warehouse } from '@phosphor-icons/react'
import { SelectGlobal, type SelectOpcao } from '@nucleo/campo-select-global'
import {
  ICONE_FIELD,
  ICONE_LABEL_SECAO,
  SimuladorNcField,
  SimuladorNcSectionTitle,
} from './manual-bid-frete-simulador-nc-ui'

export type LinhaArmazemAlfandegadoSimulador = {
  id: number
  nome_armazem_alfandegado: string
}

export type EstadoArmazenagem = {
  opcao_incluir_armazenagem: '' | 'sim' | 'nao'
  linhas_armazem_alfandegado: LinhaArmazemAlfandegadoSimulador[]
}

const OPCOES_INCLUIR_ARMAZENAGEM: SelectOpcao[] = [
  { valor: 'sim', rotulo: 'Sim' },
  { valor: 'nao', rotulo: 'Não' },
]

function linhaArmazemVazia(id: number): LinhaArmazemAlfandegadoSimulador {
  return { id, nome_armazem_alfandegado: '' }
}

export const ESTADO_ARMAZENAGEM_INICIAL: EstadoArmazenagem = {
  opcao_incluir_armazenagem: '',
  linhas_armazem_alfandegado: [linhaArmazemVazia(1)],
}

export function criarEstadoArmazenagemInicial(): EstadoArmazenagem {
  return {
    ...ESTADO_ARMAZENAGEM_INICIAL,
    linhas_armazem_alfandegado: ESTADO_ARMAZENAGEM_INICIAL.linhas_armazem_alfandegado.map((l) => ({
      ...l,
    })),
  }
}

/** Paridade com canNext() — passo «armazenagem» do wizard real (Marítimo LCL). */
export function podeAvancarPassoArmazenagem(estado: EstadoArmazenagem): boolean {
  return estado.opcao_incluir_armazenagem === 'sim' || estado.opcao_incluir_armazenagem === 'nao'
}

type ConteudoPassoArmazenagemSimuladorProps = {
  estado: EstadoArmazenagem
  aoAtualizar: (parcial: Partial<EstadoArmazenagem>) => void
}

export function ConteudoPassoArmazenagemSimulador({
  estado,
  aoAtualizar,
}: ConteudoPassoArmazenagemSimuladorProps) {
  const proximoIdLinhaRef = useRef(
    Math.max(0, ...estado.linhas_armazem_alfandegado.map((l) => l.id)) + 1,
  )

  const adicionarLinha = () => {
    const id = proximoIdLinhaRef.current++
    aoAtualizar({
      linhas_armazem_alfandegado: [...estado.linhas_armazem_alfandegado, linhaArmazemVazia(id)],
    })
  }

  const removerLinha = (id: number) => {
    if (estado.linhas_armazem_alfandegado.length <= 1) return
    aoAtualizar({
      linhas_armazem_alfandegado: estado.linhas_armazem_alfandegado.filter((l) => l.id !== id),
    })
  }

  const atualizarLinha = (id: number, nome: string) => {
    aoAtualizar({
      linhas_armazem_alfandegado: estado.linhas_armazem_alfandegado.map((l) =>
        l.id === id ? { ...l, nome_armazem_alfandegado: nome } : l,
      ),
    })
  }

  return (
    <div className="nc-root nc-step-wrapper nc-fade-in">
      <div className="nc-step-content">
        <SimuladorNcSectionTitle icone={<Warehouse {...ICONE_LABEL_SECAO} />} obrigatorio>
          Armazenagem
        </SimuladorNcSectionTitle>
        <p className="nc-cargo-subsecao-hint">
          Disponível para embarques Marítimo LCL. Informe se a cotação deve incluir armazenagem.
        </p>

        <SimuladorNcField label="Incluir armazenagem" icone={<Warehouse {...ICONE_FIELD} />} required>
          <SelectGlobal
            id="sim-nc-incluir-armazenagem"
            opcoes={OPCOES_INCLUIR_ARMAZENAGEM}
            valor={estado.opcao_incluir_armazenagem || null}
            aoMudarValor={(v) => {
              const valor = v == null ? '' : (String(v) as '' | 'sim' | 'nao')
              aoAtualizar({
                opcao_incluir_armazenagem: valor,
                linhas_armazem_alfandegado:
                  valor === 'sim'
                    ? estado.linhas_armazem_alfandegado
                    : [linhaArmazemVazia(1)],
              })
            }}
            placeholder="Selecionar"
            posicao="auto"
          />
        </SimuladorNcField>

        {estado.opcao_incluir_armazenagem === 'sim' ? (
          <div className="nc-cargo-cubagem-stack nc-fade-in">
            <div className="nc-linhas-container-header">
              <p className="nc-cargo-subsecao-hint" style={{ margin: 0 }}>
                Nome do armazém alfandegado de preferência da desova.
              </p>
              <button type="button" className="nc-btn-adicionar-linha" onClick={adicionarLinha}>
                <Plus size={14} weight="bold" />
                Adicionar armazém
              </button>
            </div>
            {estado.linhas_armazem_alfandegado.map((linha) => (
              <div key={linha.id} className="nc-linha-armazem-row">
                <SimuladorNcField label="ARMAZÉM ALFANDEGADO" icone={<Warehouse {...ICONE_FIELD} />}>
                  <input
                    className="nc-input"
                    placeholder="Ex: Nome do armazém"
                    value={linha.nome_armazem_alfandegado}
                    onChange={(e) => atualizarLinha(linha.id, e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </SimuladorNcField>
                <button
                  type="button"
                  className="nc-btn-remover-linha"
                  title="Remover linha"
                  disabled={estado.linhas_armazem_alfandegado.length <= 1}
                  onClick={() => removerLinha(linha.id)}
                  aria-label="Remover armazém"
                >
                  <Trash size={16} weight="bold" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
