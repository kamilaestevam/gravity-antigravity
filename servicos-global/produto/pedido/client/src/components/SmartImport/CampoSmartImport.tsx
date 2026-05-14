/**
 * CampoSmartImport.tsx — Renderer universal de campo para o Smart Import.
 *
 * Recebe `{ campo, valor, onChange, obrigatorio?, autoFocus? }` e decide
 * automaticamente o componente correto a renderizar baseado em
 * `kindUiDeCampo(campo)`. Cobre TODOS os 143 campos do SSOT do Pedido +
 * qualquer campo custom (fallback para input texto).
 *
 * Cobertura:
 *   - texto, texto_longo         -> input / textarea
 *   - ncm                         -> SelectNcmGlobal (mask XXXX.XX.XX + valida)
 *   - cnpj                        -> input com mask 00.000.000/0000-00
 *   - cpf                         -> input com mask 000.000.000-00
 *   - email                       -> input type="email"
 *   - telefone                    -> input com mask (00) 00000-0000
 *   - zip, url                    -> input livre
 *   - moeda_codigo                -> SelectGlobal (USD/EUR/BRL/...)
 *   - incoterm                    -> SelectGlobal (FOB/CIF/EXW/...)
 *   - unidade                     -> input (sem lista oficial ainda)
 *   - tipo_linha, tipo_operacao   -> SelectGlobal (opcoesSelect do SSOT)
 *   - cobertura_cambial           -> input (lista a definir)
 *   - select_ssot                 -> SelectGlobal (opcoesSelect do SSOT)
 *   - decimal_quantidade/valor/peso/cubagem/taxa -> CampoDecimalGlobal
 *   - inteiro                     -> CampoDecimalGlobal casas=0
 *   - data                        -> input type="date" (ISO YYYY-MM-DD)
 *
 * Valor sempre passado e recebido como `string | null` no callback `onChange`
 * para uniformizar com o backend (que faz parse via normalizarNumero/normalizarData).
 * O renderer interno converte para number quando necessario (CampoDecimalGlobal).
 *
 * Onde usar:
 *   - Form inline "Adicionar Item" (EtapaPreview.tsx)
 *   - Edicao inline de campo (PencilSimple por campo detectado)
 *   - Futuros: edicao em massa, modal novo pedido, etc.
 */

import React, { useMemo } from 'react'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { CampoDecimalGlobal } from '@nucleo/campo-decimal-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { SelectNcmGlobal } from '@nucleo/campo-ncm-global'
import {
  kindUiDeCampo,
  metadataDeCampo,
  opcoesSsotDeCampo,
  casasDecimaisDefault,
  aplicarMaskCnpj,
  aplicarMaskCpf,
  aplicarMaskTelefone,
  removerMask,
  type KindUI,
} from '../../../../shared/kind-ui-pedido'
// Q6 — Moeda, Incoterm e Unidade vem do Cadastros (SSOT), nao hardcoded.
// Mesmo padrao do `useIncotermsPedido` ja' usado aqui.
import { useIncotermsPedido } from '../../shared/useIncotermsPedido'
import { useMoedasPedido } from '../../shared/useMoedasPedido'
import { useUnidadesPedido } from '../../shared/useUnidadesPedido'
import { ROTULO_POR_CAMPO } from '../../../../shared/campos-pedido-ddd'

// ── Le casas decimais do localStorage (mesma fonte de Pedidos.tsx) ────────────

function lerCasasConfig(): Record<string, number> {
  try {
    const raw = localStorage.getItem('pedido:casas_decimais')
    return raw ? (JSON.parse(raw) as Record<string, number>) : {}
  } catch { return {} }
}

// ── Helpers de conversao number <-> string ───────────────────────────────────

function parseToNumber(valor: string | null | undefined, casas: number): number | null {
  if (valor == null || valor === '') return null
  // Aceita "1.234,56" (BR), "1234.56" (US), "1234,56" (livre)
  const s = String(valor).trim()
  if (!s) return null
  // Heuristica: se tem virgula, e' decimal BR (vírgula); ponto e' milhar
  // Se tem so' ponto, e' decimal US
  let limpo: string
  if (s.includes(',')) {
    limpo = s.replace(/\./g, '').replace(',', '.')
  } else {
    limpo = s
  }
  const n = parseFloat(limpo)
  if (isNaN(n)) return null
  // Arredonda para as casas configuradas (evita 1.005 -> 1.005000001)
  const fator = Math.pow(10, casas)
  return Math.round(n * fator) / fator
}

function numberToString(n: number | null): string {
  if (n == null) return ''
  return String(n)
}

// ── Props ────────────────────────────────────────────────────────────────────

export interface CampoSmartImportProps {
  /** Nome interno do campo (ex: 'numero_pedido', 'ncm_item', 'valor_por_unidade_item'). */
  campo: string
  /** Valor atual — sempre string (uniforme com payload do Smart Import). */
  valor: string
  /** Callback com novo valor (string). Componente nunca expõe number; converte internamente. */
  onChange: (novo: string) => void
  /** Marca como obrigatorio — passa para CampoGeralGlobal (asterisco + borda vermelha quando vazio). */
  obrigatorio?: boolean
  /** Foco automatico no mount (uso em primeiro campo de form). */
  autoFocus?: boolean
  /** Sobrescreve o rotulo do SSOT (raro — usar so' se necessario). */
  labelOverride?: string
  /** Renderiza sem CampoGeralGlobal wrapper (uso em edicao inline com label externo). */
  semLabel?: boolean
  /** Forca um kind UI especifico (override raro — usar so' se classificador falhar). */
  kindOverride?: KindUI
  /** ID externo para a11y. */
  id?: string
}

// ── Componente principal ─────────────────────────────────────────────────────

export function CampoSmartImport(props: CampoSmartImportProps) {
  const { campo, valor, onChange, obrigatorio, autoFocus, labelOverride, semLabel, kindOverride } = props
  // Q6 — SSOT: incoterms, moedas e unidades vem de cadastros via hooks
  // (paridade com useIncotermsPedido — mesma estrutura).
  const { incotermsOpcoes }       = useIncotermsPedido()
  const { moedasOpcoes }          = useMoedasPedido()
  const { unidadesComercializadas } = useUnidadesPedido()

  const kind = kindOverride ?? kindUiDeCampo(campo)
  const rotulo = labelOverride ?? ROTULO_POR_CAMPO[campo] ?? campo.replace(/_/g, ' ')
  const meta = metadataDeCampo(campo)
  const ehObrigatorio = obrigatorio ?? meta?.obrigatorio ?? false
  const valorTrim = (valor ?? '').toString().trim()
  const vazio = !valorTrim

  // Componentes que JA' renderizam seu proprio CampoGeralGlobal interno —
  // wrapping por fora gera label duplicado. Pulamos o wrapper externo neles.
  const kindComWrapperProprio = new Set<KindUI>(['ncm'])
  const usaWrapperProprio = kindComWrapperProprio.has(kind)

  // Casas decimais para campos decimais — le config do usuario uma vez
  const casas = useMemo(() => {
    if (!kind.startsWith('decimal_') && kind !== 'inteiro') return 0
    return casasDecimaisDefault(kind, lerCasasConfig())
  }, [kind])

  // ── Renderiza o componente correto baseado em `kind` ───────────────────────

  function renderizar(): React.ReactNode {
    switch (kind) {
      // ─── NCM ──────────────────────────────────────────────────────────────
      // SelectNcmGlobal ja' usa CampoGeralGlobal internamente; passamos o
      // rotulo como `label` para ele renderizar a UI completa. No nivel
      // do CampoSmartImport, marcamos `usaWrapperProprio=true` para nao
      // duplicar o label externamente.
      case 'ncm':
        return (
          <SelectNcmGlobal
            value={valor}
            onChange={(codigo) => onChange(codigo)}
            obrigatorio={ehObrigatorio}
            label={semLabel ? undefined : rotulo}
          />
        )

      // ─── CNPJ (mask) ──────────────────────────────────────────────────────
      // Estado armazena apenas dígitos (14 chars max); display aplica mask.
      // Backend recebe valor limpo, sem pontuação — passa validação Zod.
      case 'cnpj':
        return (
          <input
            className="smart-import__input"
            value={aplicarMaskCnpj(valor)}
            onChange={(e) => onChange(removerMask(e.target.value))}
            autoFocus={autoFocus}
            inputMode="numeric"
            placeholder="00.000.000/0000-00"
            maxLength={18}
            aria-label={rotulo}
            aria-required={ehObrigatorio || undefined}
          />
        )

      // ─── CPF (mask) ───────────────────────────────────────────────────────
      // Mesmo padrao do CNPJ: estado limpo (11 dígitos), display mascarado.
      case 'cpf':
        return (
          <input
            className="smart-import__input"
            value={aplicarMaskCpf(valor)}
            onChange={(e) => onChange(removerMask(e.target.value))}
            autoFocus={autoFocus}
            inputMode="numeric"
            placeholder="000.000.000-00"
            maxLength={14}
            aria-label={rotulo}
          />
        )

      // ─── Email ────────────────────────────────────────────────────────────
      case 'email':
        return (
          <input
            type="email"
            className="smart-import__input"
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            autoFocus={autoFocus}
            placeholder="usuario@exemplo.com"
            aria-label={rotulo}
          />
        )

      // ─── Telefone (mask) ──────────────────────────────────────────────────
      // Mesmo padrao: estado guarda apenas dígitos (10-11), display mascarado.
      case 'telefone':
        return (
          <input
            className="smart-import__input"
            value={aplicarMaskTelefone(valor)}
            onChange={(e) => onChange(removerMask(e.target.value))}
            autoFocus={autoFocus}
            inputMode="tel"
            placeholder="(00) 00000-0000"
            maxLength={16}
            aria-label={rotulo}
          />
        )

      // ─── ZIP ──────────────────────────────────────────────────────────────
      case 'zip':
        return (
          <input
            className="smart-import__input"
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            autoFocus={autoFocus}
            placeholder="ZIP / CEP"
            aria-label={rotulo}
          />
        )

      // ─── URL ──────────────────────────────────────────────────────────────
      case 'url':
        return (
          <input
            type="url"
            className="smart-import__input"
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            autoFocus={autoFocus}
            aria-label={rotulo}
          />
        )

      // ─── Moeda — SSOT cadastros.moeda via useMoedasPedido ────────────────
      // Q6 — antes era array hardcoded `OPCOES_MOEDA_PEDIDO` em kind-ui-pedido;
      // agora vem do mesmo cadastros que o resto da plataforma usa.
      case 'moeda_codigo':
        return (
          <SelectGlobal
            opcoes={moedasOpcoes.map(o => ({ valor: o.valor, rotulo: o.label }))}
            valor={valor || null}
            aoMudarValor={(v) => onChange(String(v ?? ''))}
            buscavel
            placeholder="Selecionar moeda…"
          />
        )

      // ─── Incoterm — SSOT cadastros.incoterm via useIncotermsPedido ────────
      case 'incoterm':
        return (
          <SelectGlobal
            opcoes={incotermsOpcoes.map(o => ({ valor: o.valor, rotulo: o.label }))}
            valor={valor || null}
            aoMudarValor={(v) => onChange(String(v ?? ''))}
            buscavel={false}
            placeholder="Selecionar incoterm…"
          />
        )

      // ─── Unidade Comercializada — SSOT cadastros.unidade via useUnidadesPedido ─
      // Q6 — antes era input livre uppercase 8 chars; agora SelectGlobal
      // populado do cadastros (mesma fonte de TabelaUnidades, ModalPedidoNovo).
      case 'unidade':
        return (
          <SelectGlobal
            opcoes={unidadesComercializadas.map(o => ({ valor: o.sigla, rotulo: o.rotulo }))}
            valor={valor || null}
            aoMudarValor={(v) => onChange(String(v ?? ''))}
            buscavel
            placeholder="Selecionar unidade…"
          />
        )

      // ─── Tipo Linha (select PEDIDO|ITEM) ──────────────────────────────────
      case 'tipo_linha':
        return (
          <SelectGlobal
            opcoes={[
              { valor: 'PEDIDO', rotulo: 'PEDIDO' },
              { valor: 'ITEM',   rotulo: 'ITEM' },
            ]}
            valor={valor || null}
            aoMudarValor={(v) => onChange(String(v ?? ''))}
            buscavel={false}
          />
        )

      // ─── Tipo Operacao (select importacao|exportacao) ─────────────────────
      case 'tipo_operacao':
        return (
          <SelectGlobal
            opcoes={[
              { valor: 'importacao', rotulo: 'Importação' },
              { valor: 'exportacao', rotulo: 'Exportação' },
            ]}
            valor={valor || null}
            aoMudarValor={(v) => onChange(String(v ?? ''))}
            buscavel={false}
          />
        )

      // ─── Cobertura Cambial — texto enquanto nao oficializa enum ───────────
      case 'cobertura_cambial':
        return (
          <input
            className="smart-import__input"
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            autoFocus={autoFocus}
            placeholder="A definir"
            aria-label={rotulo}
          />
        )

      // ─── Select genérico do SSOT ──────────────────────────────────────────
      case 'select_ssot': {
        const opcoes = opcoesSsotDeCampo(campo) ?? []
        return (
          <SelectGlobal
            opcoes={opcoes}
            valor={valor || null}
            aoMudarValor={(v) => onChange(String(v ?? ''))}
            buscavel={opcoes.length > 6}
          />
        )
      }

      // ─── Decimais (CampoDecimalGlobal) ────────────────────────────────────
      case 'decimal_quantidade':
      case 'decimal_valor':
      case 'decimal_peso':
      case 'decimal_cubagem':
      case 'decimal_taxa':
      case 'inteiro': {
        const numero = parseToNumber(valor, casas)
        return (
          <CampoDecimalGlobal
            valor={numero}
            aoMudarValor={(n) => onChange(numberToString(n))}
            casasDecimais={casas}
            style={{ width: '100%' }}
            aria-invalid={ehObrigatorio && vazio ? true : undefined}
          />
        )
      }

      // ─── Data — input nativo HTML5 (ISO YYYY-MM-DD) ──────────────────────
      case 'data': {
        // Converte qualquer formato em ISO date (sem hora) para o input
        // type=date que so' aceita "yyyy-mm-dd".
        const isoDate = (() => {
          if (!valor) return ''
          const s = String(valor).trim()
          if (!s) return ''
          // Ja' e' yyyy-mm-dd
          if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
          // dd/mm/yyyy
          const ddmm = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s)
          if (ddmm) return `${ddmm[3]}-${ddmm[2]}-${ddmm[1]}`
          // ISO datetime
          if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.slice(0, 10)
          return ''
        })()
        return (
          <input
            type="date"
            className="smart-import__input"
            value={isoDate}
            onChange={(e) => onChange(e.target.value)}
            autoFocus={autoFocus}
            aria-label={rotulo}
            aria-required={ehObrigatorio || undefined}
          />
        )
      }

      // ─── Texto longo (textarea com 2 linhas) ──────────────────────────────
      case 'texto_longo':
        return (
          <textarea
            className="smart-import__input"
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            autoFocus={autoFocus}
            rows={2}
            aria-label={rotulo}
            style={{ resize: 'vertical', minHeight: '2.25rem' }}
          />
        )

      // ─── Texto padrao (fallback) ──────────────────────────────────────────
      case 'texto':
      default:
        return (
          <input
            className="smart-import__input"
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            autoFocus={autoFocus}
            aria-label={rotulo}
            aria-required={ehObrigatorio || undefined}
          />
        )
    }
  }

  // ── Wrapper com label / sem label ─────────────────────────────────────────
  //
  // Casos:
  //   - semLabel: usuario nao quer label (uso em edicao inline com label externo)
  //   - usaWrapperProprio: componente ja' embute CampoGeralGlobal (NCM)
  //   - default: envolve em CampoGeralGlobal com label, obrigatorio, vazio

  if (semLabel || usaWrapperProprio) {
    return <>{renderizar()}</>
  }

  return (
    <CampoGeralGlobal
      label={rotulo}
      obrigatorio={ehObrigatorio}
      vazio={vazio}
    >
      {renderizar()}
    </CampoGeralGlobal>
  )
}
