/**
 * Leituras.tsx — Tela principal do Smart Read
 * Fluxo: upload do documento → processamento (polling no BFF) → resultado
 * com os campos extraídos pela IA. Contratos validados com Zod (REGRA 06/09).
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CloudArrowUp,
  FileMagnifyingGlass,
  ArrowsClockwise,
  CheckCircle,
  XCircle,
  FileText,
} from '@phosphor-icons/react'
import { smartReadApi } from '../../shared/api'
import { type Leitura, type StatusLeitura } from '../../shared/schemas'
import './Leituras.css'

const INTERVALO_POLLING_MS = 2000
const LIMITE_POLLING_MS = 5 * 60 * 1000

type Etapa = 'upload' | 'processando' | 'resultado'

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor)
}

function valorPreenchido(valor: unknown): boolean {
  if (valor === null || valor === undefined || valor === '') return false
  if (Array.isArray(valor)) return valor.length > 0
  if (ehObjeto(valor)) return Object.values(valor).some(valorPreenchido)
  return true
}

function formatarValor(valor: unknown): string {
  if (typeof valor === 'number') return String(valor)
  if (typeof valor === 'boolean') return valor ? 'Sim' : 'Não'
  return String(valor)
}

function CampoExtraido({ rotulo, valor }: { rotulo: string; valor: unknown }) {
  const preenchido = valorPreenchido(valor)
  return (
    <div className={`sr-campo ${preenchido ? 'sr-campo-ok' : 'sr-campo-vazio'}`}>
      <span className="sr-campo-rotulo">{rotulo}</span>
      <span className="sr-campo-valor">{preenchido ? formatarValor(valor) : '—'}</span>
    </div>
  )
}

function SecaoDados({ titulo, dados }: { titulo: string; dados: Record<string, unknown> }) {
  const escalares = Object.entries(dados).filter(([, v]) => !ehObjeto(v) && !Array.isArray(v))
  if (!escalares.some(([, v]) => valorPreenchido(v))) return null
  return (
    <section className="sr-secao">
      <h3 className="sr-secao-titulo">{titulo}</h3>
      <div className="sr-campos-grid">
        {escalares.map(([chave, valor]) => (
          <CampoExtraido key={chave} rotulo={chave} valor={valor} />
        ))}
      </div>
    </section>
  )
}

function DadosExtraidos({ dados }: { dados: Record<string, unknown> }) {
  const { t } = useTranslation()
  const entradas = Object.entries(dados)
  const escalaresRaiz = entradas.filter(([, v]) => !ehObjeto(v) && !Array.isArray(v))
  const objetos = entradas.filter((par): par is [string, Record<string, unknown>] => ehObjeto(par[1]))
  const listas = entradas.filter((par): par is [string, unknown[]] => Array.isArray(par[1]))

  const temConteudo =
    escalaresRaiz.some(([, v]) => valorPreenchido(v)) ||
    objetos.some(([, v]) => valorPreenchido(v)) ||
    listas.some(([, v]) => valorPreenchido(v))

  if (!temConteudo) {
    return <p className="sr-vazio">{t('smart_read.resultado.sem_campos')}</p>
  }

  return (
    <div className="sr-dados">
      {escalaresRaiz.length > 0 && (
        <SecaoDados titulo={t('smart_read.resultado.campos_extraidos')} dados={Object.fromEntries(escalaresRaiz)} />
      )}
      {objetos.map(([chave, objeto]) => (
        <SecaoDados key={chave} titulo={chave} dados={objeto} />
      ))}
      {listas.map(([chave, itens]) =>
        valorPreenchido(itens) ? (
          <section key={chave} className="sr-secao">
            <h3 className="sr-secao-titulo">
              {chave} <span className="sr-secao-contagem">({itens.length})</span>
            </h3>
            <div className="sr-itens">
              {itens.filter(ehObjeto).map((item, indice) => (
                <div key={indice} className="sr-item">
                  <div className="sr-campos-grid">
                    {Object.entries(item)
                      .filter(([, v]) => !ehObjeto(v) && !Array.isArray(v) && valorPreenchido(v))
                      .map(([campo, valor]) => (
                        <CampoExtraido key={campo} rotulo={campo} valor={valor} />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null,
      )}
    </div>
  )
}

function BadgeStatus({ status }: { status: StatusLeitura }) {
  const { t } = useTranslation()
  const classe =
    status === 'COMPLETED' ? 'sr-badge-success' : status === 'FAILED' ? 'sr-badge-danger' : 'sr-badge-warning'
  return <span className={`sr-badge ${classe}`}>{t(`smart_read.status.${status.toLowerCase()}`)}</span>
}

export default function Leituras() {
  const { t } = useTranslation()
  const [etapa, setEtapa] = useState<Etapa>('upload')
  const [arrastando, setArrastando] = useState(false)
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null)
  const [leitura, setLeitura] = useState<Leitura | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const ativo = useRef(true)

  useEffect(() => {
    ativo.current = true
    return () => {
      ativo.current = false
    }
  }, [])

  const processarArquivo = useCallback(
    async (arquivo: File) => {
      setErro(null)
      setLeitura(null)
      setNomeArquivo(arquivo.name)
      setEtapa('processando')
      try {
        const criada = await smartReadApi.enviarLeitura(arquivo)
        const inicio = Date.now()
        while (ativo.current) {
          const atual = await smartReadApi.obterLeitura(criada.id_leitura)
          if (atual.status_leitura === 'COMPLETED' || atual.status_leitura === 'FAILED') {
            if (!ativo.current) return
            setLeitura(atual)
            setEtapa('resultado')
            return
          }
          if (Date.now() - inicio > LIMITE_POLLING_MS) {
            throw new Error(t('smart_read.erro.timeout'))
          }
          await new Promise((resolver) => setTimeout(resolver, INTERVALO_POLLING_MS))
        }
      } catch (excecao) {
        if (!ativo.current) return
        setErro(excecao instanceof Error ? excecao.message : t('smart_read.erro.upload'))
        setEtapa('upload')
      }
    },
    [t],
  )

  const aoSoltar = useCallback(
    (evento: React.DragEvent<HTMLDivElement>) => {
      evento.preventDefault()
      setArrastando(false)
      const arquivo = evento.dataTransfer.files?.[0]
      if (arquivo) void processarArquivo(arquivo)
    },
    [processarArquivo],
  )

  return (
    <div className="sr-pagina">
      <header className="sr-cabecalho">
        <div className="sr-cabecalho-icone">
          <FileMagnifyingGlass weight="duotone" size={28} />
        </div>
        <div>
          <h1 className="sr-titulo">{t('smart_read.titulo')}</h1>
          <p className="sr-subtitulo">{t('smart_read.subtitulo')}</p>
        </div>
      </header>

      {erro && (
        <div className="sr-erro" role="alert">
          <XCircle weight="duotone" size={18} />
          <span>{erro}</span>
        </div>
      )}

      {etapa === 'upload' && (
        <div
          className={`sr-dropzone ${arrastando ? 'sr-dropzone-ativa' : ''}`}
          onDragOver={(evento) => {
            evento.preventDefault()
            setArrastando(true)
          }}
          onDragLeave={() => setArrastando(false)}
          onDrop={aoSoltar}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(evento) => {
            if (evento.key === 'Enter' || evento.key === ' ') inputRef.current?.click()
          }}
        >
          <CloudArrowUp weight="duotone" size={56} className="sr-dropzone-icone" />
          <h2 className="sr-dropzone-titulo">{t('smart_read.upload.titulo')}</h2>
          <p className="sr-dropzone-descricao">{t('smart_read.upload.descricao')}</p>
          <p className="sr-dropzone-formatos">{t('smart_read.upload.formatos')}</p>
          <button type="button" className="sr-btn sr-btn-primario">
            {t('smart_read.upload.botao')}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.xml,.csv,.xls,.xlsx"
            style={{ display: 'none' }}
            onChange={(evento) => {
              const arquivo = evento.target.files?.[0]
              if (arquivo) void processarArquivo(arquivo)
              evento.target.value = ''
            }}
          />
        </div>
      )}

      {etapa === 'processando' && (
        <div className="sr-processando">
          <ArrowsClockwise weight="duotone" size={48} className="sr-spin" />
          <h2 className="sr-processando-titulo">{t('smart_read.processando.titulo')}</h2>
          <p className="sr-processando-descricao">{t('smart_read.processando.descricao')}</p>
          {nomeArquivo && (
            <span className="sr-processando-arquivo">
              <FileText weight="duotone" size={16} /> {nomeArquivo}
            </span>
          )}
        </div>
      )}

      {etapa === 'resultado' && leitura && (
        <div className="sr-resultado">
          <div className="sr-resultado-cabecalho">
            <div className="sr-resultado-info">
              <CheckCircle weight="duotone" size={22} className="sr-resultado-check" />
              <h2 className="sr-resultado-titulo">{t('smart_read.resultado.titulo')}</h2>
              <BadgeStatus status={leitura.status_leitura} />
            </div>
            <button
              type="button"
              className="sr-btn sr-btn-secundario"
              onClick={() => {
                setLeitura(null)
                setNomeArquivo(null)
                setEtapa('upload')
              }}
            >
              {t('smart_read.resultado.nova_leitura')}
            </button>
          </div>

          {leitura.arquivos.map((arquivo) => (
            <article key={arquivo.id_arquivo} className="sr-arquivo">
              <header className="sr-arquivo-cabecalho">
                <span className="sr-arquivo-nome">
                  <FileText weight="duotone" size={18} />
                  {arquivo.nome_arquivo ?? t('smart_read.resultado.arquivo')}
                </span>
                <span className="sr-arquivo-meta">
                  {arquivo.resultado_extracao?.[0]?.tipo_documento && (
                    <span className="sr-badge sr-badge-tipo">{arquivo.resultado_extracao[0].tipo_documento}</span>
                  )}
                  <BadgeStatus status={arquivo.status_arquivo} />
                </span>
              </header>
              {(arquivo.resultado_extracao ?? []).map((resultado, indice) => (
                <DadosExtraidos key={indice} dados={resultado.dados} />
              ))}
              {!arquivo.resultado_extracao?.length && (
                <p className="sr-vazio">{t('smart_read.resultado.sem_campos')}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
