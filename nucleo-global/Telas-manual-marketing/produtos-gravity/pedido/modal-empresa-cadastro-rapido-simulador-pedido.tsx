import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Buildings, X } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import '../../../Campos/campo-select-global/src/select.css'
import {
  PAISES_SIMULADOR_CADASTRO_EMPRESA,
  rotuloPapelCadastroEmpresaSimulador,
  type FornecedorSimuladorNovoPedido,
  type PapelFornecedorSimuladorNovoPedido,
} from './dados-fornecedores-simulador-novo-pedido'
import './modal-empresa-cadastro-rapido-simulador-pedido.css'

type Props = {
  aberto: boolean
  papel: PapelFornecedorSimuladorNovoPedido
  forcarEstrangeiro: boolean
  onFechar: () => void
  onCriado: (fornecedor: FornecedorSimuladorNovoPedido) => void
}

export function ModalEmpresaCadastroRapidoSimuladorPedido({
  aberto,
  papel,
  forcarEstrangeiro,
  onFechar,
  onCriado,
}: Props) {
  const [nome, setNome] = useState('')
  const [pais, setPais] = useState(forcarEstrangeiro ? '' : 'BR')
  const [cnpj, setCnpj] = useState('')
  const [tin, setTin] = useState('')
  const [salvando, setSalvando] = useState(false)

  const rotuloPapel = rotuloPapelCadastroEmpresaSimulador(papel)
  const ehBr = pais === 'BR'

  const opcoesPais = useMemo(
    () =>
      PAISES_SIMULADOR_CADASTRO_EMPRESA
        .filter((p) => !forcarEstrangeiro || p.codigo !== 'BR')
        .map((p) => ({
          valor: p.codigo,
          rotulo: `${p.nome} (${p.codigo})`,
        })),
    [forcarEstrangeiro],
  )

  const resetar = useCallback(() => {
    setNome('')
    setPais(forcarEstrangeiro ? '' : 'BR')
    setCnpj('')
    setTin('')
    setSalvando(false)
  }, [forcarEstrangeiro])

  useEffect(() => {
    if (aberto) resetar()
  }, [aberto, resetar])

  useEffect(() => {
    if (!aberto) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !salvando) onFechar()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [aberto, onFechar, salvando])

  const cnpjOk = ehBr ? cnpj.trim().length > 0 : true
  const podeSalvar = nome.trim().length >= 2 && !!pais && cnpjOk && !salvando

  const handleSalvar = useCallback(() => {
    if (!podeSalvar) return
    setSalvando(true)
    window.setTimeout(() => {
      const criado: FornecedorSimuladorNovoPedido = {
        id_fornecedor: `forn-${Date.now()}`,
        nome_fornecedor: nome.trim(),
        pais_fornecedor: pais,
        pode_importador: papel === 'importador',
        pode_exportador: papel === 'exportador',
        pode_fabricante: papel === 'fabricante',
      }
      onCriado(criado)
      setSalvando(false)
      onFechar()
    }, 350)
  }, [nome, onCriado, onFechar, pais, papel, podeSalvar])

  if (!aberto) return null

  return createPortal(
    <div
      className="pds-mecr-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pds-mecr-titulo"
      onClick={(e) => {
        if (e.target === e.currentTarget && !salvando) onFechar()
      }}
    >
      <div className="pds-mecr-dialog pds-mecr-dialog--tutorial" onClick={(e) => e.stopPropagation()}>
        <header className="pds-mecr-header">
          <div className="pds-mecr-header-texto">
            <h3 id="pds-mecr-titulo" className="pds-mecr-titulo">
              <Buildings size={20} weight="duotone" className="pds-mecr-titulo-icone" aria-hidden />
              Cadastrar {rotuloPapel}
            </h3>
            <p className="pds-mecr-subtitulo">Cadastre rapidamente uma nova empresa</p>
          </div>
          <button
            type="button"
            className="pds-mecr-fechar"
            onClick={onFechar}
            disabled={salvando}
            aria-label="Fechar"
          >
            <X size={16} weight="bold" />
          </button>
        </header>

        <div className="pds-mecr-corpo">
          <p className="pds-mecr-intro">
            Esta empresa será cadastrada como {rotuloPapel}. Você pode editar os demais dados depois em Cadastros.
          </p>

          <div data-sds-tutorial-alvo="pedido-cadastro-rapido-campos">
          <div className="pds-mecr-campo">
            <label className="pds-mecr-label" htmlFor="pds-mecr-nome">
              Nome do {rotuloPapel} *
            </label>
            <input
              id="pds-mecr-nome"
              type="text"
              className="pds-mecr-input"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Shanghai Manufacturing Co."
              autoFocus
            />
          </div>

          <div className="pds-mecr-campo">
            <SelectGlobal
              label="País *"
              opcoes={opcoesPais}
              valor={pais || null}
              aoMudarValor={(v) => setPais(String(v ?? (forcarEstrangeiro ? '' : 'BR')))}
              buscavel
              placeholder="Selecione o país"
            />
          </div>
          </div>

          {ehBr ? (
            <div className="pds-mecr-campo" data-sds-tutorial-alvo="pedido-cadastro-rapido-fiscal">
              <label
                className={`pds-mecr-label${cnpj.trim() ? '' : ' pds-mecr-label--erro'}`}
                htmlFor="pds-mecr-cnpj"
              >
                CNPJ *
              </label>
              <input
                id="pds-mecr-cnpj"
                type="text"
                className={`pds-mecr-input${cnpj.trim() ? '' : ' pds-mecr-input--erro'}`}
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="00.000.000/0000-00"
                aria-invalid={!cnpj.trim()}
              />
              <p className="pds-mecr-hint">
                Empresas brasileiras precisam de CNPJ para emitir documentos fiscais.
              </p>
            </div>
          ) : (
            <div className="pds-mecr-campo" data-sds-tutorial-alvo="pedido-cadastro-rapido-fiscal">
              <label className="pds-mecr-label" htmlFor="pds-mecr-tin">
                Tax ID / TIN (opcional)
              </label>
              <input
                id="pds-mecr-tin"
                type="text"
                className="pds-mecr-input"
                value={tin}
                onChange={(e) => setTin(e.target.value)}
                placeholder="Ex: 91-1234567"
              />
              <p className="pds-mecr-hint">
                Pode ser preenchido depois em Cadastros — o pedido só é criado quando estiver preenchido.
              </p>
            </div>
          )}
        </div>

        <footer className="pds-mecr-footer">
          <BotaoGlobal variante="secundario" tamanho="padrao" onClick={onFechar} disabled={salvando}>
            Cancelar
          </BotaoGlobal>
          <span data-sds-tutorial-alvo="pedido-cadastro-rapido-salvar" style={{ display: 'inline-flex' }}>
          <BotaoGlobal
            variante="primario"
            tamanho="padrao"
            onClick={handleSalvar}
            disabled={!podeSalvar}
            carregando={salvando}
          >
            {salvando ? 'Salvando…' : 'Salvar e usar'}
          </BotaoGlobal>
          </span>
        </footer>
      </div>
    </div>,
    document.body,
  )
}
