/**
 * Passo 4 (BID Frete) — match multi-documento + revisão editável antes de Nova Cotação.
 */
import { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import { ArrowRight, Sparkle, WarningCircle } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { useShellStore } from '@gravity/shell'
import {
  converterLeituraParaCotacaoBidFreteInternacional,
  type LeituraParaConversaoCotacaoBidFrete,
} from '../../../../shared/converter-leitura-para-cotacao-bid-frete-internacional-smart-read.js'
import type { PrefillFormularioCotacaoBidFreteSmartRead } from '../../../../shared/conversao-leitura-cotacao-bid-frete-smart-read-schema.js'
import {
  filtrarLeituraPorDocumentosMatchPrefill,
  listarDocumentosMatchPrefillCotacaoBidFrete,
  type GrupoCotacaoMatchPrefillBidFrete,
} from '../../../../shared/match-documentos-prefill-cotacao-bid-frete-smart-read.js'
import type { MetaPrefillCotacaoBidFreteSmartRead } from '../../../../../bid-frete-internacional/client/src/components/prefill-smart-read/formulario-editavel-prefill-cotacao-bid-frete-smart-read.js'
import { TelaMatchDocumentosPrefillCotacaoBidFreteSmartRead } from './tela-match-documentos-prefill-cotacao-bid-frete-smart-read'
import './painel-revisao-prefill-cotacao-bid-frete-smart-read.css'
import '../../../../../bid-frete-internacional/client/src/components/prefill-smart-read/prefill-cotacao-bid-frete-smart-read.css'

const FormularioEditavelPrefillCotacaoBidFreteSmartRead = lazy(
  () =>
    import(
      '../../../../../bid-frete-internacional/client/src/components/prefill-smart-read/formulario-editavel-prefill-cotacao-bid-frete-smart-read.js'
    ),
)

export type PayloadContinuarPrefillCotacaoBidFreteSmartRead = {
  prefill: PrefillFormularioCotacaoBidFreteSmartRead
  detalhe_mapeamento: ReturnType<
    typeof converterLeituraParaCotacaoBidFreteInternacional
  >['detalhe_mapeamento']
  campos_faltantes: string[]
  passo_inicial_tipo: MetaPrefillCotacaoBidFreteSmartRead['passo_inicial_tipo']
  iniciar_no_passo_fornecedores: boolean
}

export type OpcoesContinuarPrefillCotacaoBidFreteSmartRead = {
  /** Com várias cotações: abre em nova aba e mantém o wizard para as restantes. */
  manter_wizard_aberto?: boolean
}

type Props = {
  leitura: LeituraParaConversaoCotacaoBidFrete
  onContinuar: (
    payload: PayloadContinuarPrefillCotacaoBidFreteSmartRead,
    opcoes?: OpcoesContinuarPrefillCotacaoBidFreteSmartRead,
  ) => void
  continuando?: boolean
}

type EstadoGrupoRevisao = {
  grupo: GrupoCotacaoMatchPrefillBidFrete
  conversao: ReturnType<typeof converterLeituraParaCotacaoBidFreteInternacional>
  prefill: PrefillFormularioCotacaoBidFreteSmartRead
  meta: MetaPrefillCotacaoBidFreteSmartRead
}

function mensagemAviso(meta: MetaPrefillCotacaoBidFreteSmartRead): string | null {
  if (meta.campos_faltantes.length === 0) return null
  if (meta.iniciar_no_passo_fornecedores) {
    return `Alguns campos opcionais não vieram do documento (${meta.campos_faltantes.join(', ')}).`
  }
  if (meta.passo_inicial_tipo === 'armazenagem') {
    return `Com armazenagem LCL ativa, o wizard abrirá no passo Armazenagem para cadastrar os armazéns antes de fornecedores.`
  }
  return `Campos obrigatórios ausentes (${meta.campos_faltantes.join(', ')}). A cotação abrirá no passo Resumo para você revisar e completar o que faltar.`
}

function montarEstadoGrupo(
  leitura: LeituraParaConversaoCotacaoBidFrete,
  grupo: GrupoCotacaoMatchPrefillBidFrete,
): EstadoGrupoRevisao {
  const filtrada = filtrarLeituraPorDocumentosMatchPrefill(leitura, grupo.ids_documentos)
  const conversao = converterLeituraParaCotacaoBidFreteInternacional(filtrada)
  return {
    grupo,
    conversao,
    prefill: conversao.prefill,
    meta: {
      campos_faltantes: conversao.campos_faltantes,
      passo_inicial_tipo: conversao.passo_inicial_tipo,
      iniciar_no_passo_fornecedores: conversao.iniciar_no_passo_fornecedores,
    },
  }
}

export function PainelRevisaoPrefillCotacaoBidFreteSmartRead({
  leitura,
  onContinuar,
  continuando = false,
}: Props) {
  const documentos = useMemo(
    () => listarDocumentosMatchPrefillCotacaoBidFrete(leitura),
    [leitura],
  )
  const precisaMatch = documentos.length > 1

  const [fase, setFase] = useState<'match' | 'revisao'>(precisaMatch ? 'match' : 'revisao')
  const [estadosGrupos, setEstadosGrupos] = useState<EstadoGrupoRevisao[]>(() =>
    precisaMatch
      ? []
      : [
          montarEstadoGrupo(leitura, {
            id_grupo: 'grupo-1',
            nome_grupo: 'Cotação 1',
            ids_documentos: documentos.map((d) => d.id_documento),
          }),
        ],
  )
  const [indiceGrupoAtivo, setIndiceGrupoAtivo] = useState(0)

  const estadoAtivo = estadosGrupos[indiceGrupoAtivo] ?? null
  const addNotification = useShellStore((s) => s.addNotification)
  const [tentouContinuarIncompleto, setTentouContinuarIncompleto] = useState(false)

  const handleConfirmarMatch = useCallback(
    (grupos: GrupoCotacaoMatchPrefillBidFrete[]) => {
      setEstadosGrupos(grupos.map((grupo) => montarEstadoGrupo(leitura, grupo)))
      setIndiceGrupoAtivo(0)
      setTentouContinuarIncompleto(false)
      setFase('revisao')
    },
    [leitura],
  )

  const handleChange = useCallback(
    (novoPrefill: PrefillFormularioCotacaoBidFreteSmartRead, novoMeta: MetaPrefillCotacaoBidFreteSmartRead) => {
      setTentouContinuarIncompleto(false)
      setEstadosGrupos((atual) =>
        atual.map((item, i) =>
          i === indiceGrupoAtivo ? { ...item, prefill: novoPrefill, meta: novoMeta } : item,
        ),
      )
    },
    [indiceGrupoAtivo],
  )

  const handleContinuar = useCallback(() => {
    if (!estadoAtivo) return
    const faltantes = estadoAtivo.meta.campos_faltantes
    if (faltantes.length > 0) {
      setTentouContinuarIncompleto(true)
      addNotification({
        type: 'warning',
        title: 'Complete os campos obrigatórios',
        message: `Falta preencher: ${faltantes.join(', ')}.`,
      })
      return
    }
    const restamOutras = estadosGrupos.length > 1
    onContinuar(
      {
        prefill: estadoAtivo.prefill,
        detalhe_mapeamento: estadoAtivo.conversao.detalhe_mapeamento,
        campos_faltantes: estadoAtivo.meta.campos_faltantes,
        passo_inicial_tipo: estadoAtivo.meta.passo_inicial_tipo,
        iniciar_no_passo_fornecedores: estadoAtivo.meta.iniciar_no_passo_fornecedores,
      },
      { manter_wizard_aberto: restamOutras },
    )
    if (restamOutras) {
      setEstadosGrupos((atual) => atual.filter((_, i) => i !== indiceGrupoAtivo))
      setIndiceGrupoAtivo(0)
      setTentouContinuarIncompleto(false)
      addNotification({
        type: 'success',
        title: 'Cotação aberta em nova aba',
        message: `Restam ${estadosGrupos.length - 1} cotação(ões) para revisar aqui.`,
      })
    }
  }, [addNotification, estadoAtivo, estadosGrupos.length, indiceGrupoAtivo, onContinuar])

  if (fase === 'match') {
    return (
      <TelaMatchDocumentosPrefillCotacaoBidFreteSmartRead
        leitura={leitura}
        onConfirmar={handleConfirmarMatch}
      />
    )
  }

  if (!estadoAtivo) {
    return <p className="sr-prefill-bid-revisao-subtitulo">Nenhuma cotação para revisar.</p>
  }

  const aviso = mensagemAviso(estadoAtivo.meta)
  const totalGrupos = estadosGrupos.length
  const faltantesAtivos = estadoAtivo.meta.campos_faltantes
  const podeContinuar = faltantesAtivos.length === 0 && !continuando

  return (
    <div className="sr-prefill-bid-revisao">
      <div className="sr-prefill-bid-revisao-cabecalho">
        <Sparkle weight="duotone" size={20} aria-hidden />
        <div>
          <h3 className="sr-prefill-bid-revisao-titulo">Dados para nova cotação de frete</h3>
          <p className="sr-prefill-bid-revisao-subtitulo">
            {totalGrupos > 1
              ? `São ${totalGrupos} cotações: complete os obrigatórios em cada aba e use Continuar — cada uma abre uma Nova Cotação no BID (as restantes ficam aqui).`
              : 'Ajuste os campos com os mesmos controles do BID Frete. Portos/aeroportos sugeridos aparecem como SUGERIDO.'}
          </p>
        </div>
      </div>

      {totalGrupos > 1 && (
        <div className="sr-prefill-bid-abas" role="tablist" aria-label="Cotações">
          {estadosGrupos.map((item, i) => (
            <button
              key={item.grupo.id_grupo}
              type="button"
              role="tab"
              aria-selected={i === indiceGrupoAtivo}
              className={`sr-prefill-bid-aba${i === indiceGrupoAtivo ? ' sr-prefill-bid-aba--ativa' : ''}`}
              onClick={() => {
                setIndiceGrupoAtivo(i)
                setTentouContinuarIncompleto(false)
              }}
            >
              {item.grupo.nome_grupo}
            </button>
          ))}
          {precisaMatch && (
            <button
              type="button"
              className="sr-prefill-bid-aba sr-prefill-bid-aba--link"
              onClick={() => setFase('match')}
            >
              Recombinar
            </button>
          )}
        </div>
      )}

      <Suspense fallback={<p className="sr-prefill-bid-revisao-subtitulo">Carregando formulário…</p>}>
        <FormularioEditavelPrefillCotacaoBidFreteSmartRead
          key={estadoAtivo.grupo.id_grupo}
          prefill={estadoAtivo.prefill}
          detalheMapeamento={estadoAtivo.conversao.detalhe_mapeamento}
          onChange={handleChange}
        />
      </Suspense>

      {aviso && <p className="sr-prefill-bid-revisao-aviso">{aviso}</p>}

      {tentouContinuarIncompleto && faltantesAtivos.length > 0 && (
        <div className="sr-prefill-bid-bloqueio" role="alert">
          <WarningCircle weight="fill" size={18} aria-hidden />
          <div>
            <strong>Não é possível continuar ainda</strong>
            <p>Preencha os obrigatórios: {faltantesAtivos.join(', ')}.</p>
          </div>
        </div>
      )}

      <div className="sr-prefill-bid-revisao-acoes">
        <BotaoGlobal
          variante="primario"
          tamanho="padrao"
          iconeDireita={<ArrowRight weight="bold" />}
          onClick={handleContinuar}
          disabled={continuando}
          className={!podeContinuar && !continuando ? 'sr-prefill-bid-continuar--bloqueado' : undefined}
          aria-disabled={!podeContinuar}
        >
          {totalGrupos > 1
            ? `Continuar cotação ${indiceGrupoAtivo + 1} de ${totalGrupos}`
            : 'Continuar para cotação'}
        </BotaoGlobal>
      </div>
    </div>
  )
}

export { converterLeituraParaCotacaoBidFreteInternacional }
