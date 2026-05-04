/**
 * @nucleo/banner-requisitos-global — tipos
 *
 * Estrutura compartilhada para listar requisitos faltantes em formulários
 * antes do botão "Salvar". Substitui o gate booleano único `podeSalvar`
 * por uma lista visível, eliminando o ponto cego "não sei o que falta".
 */

export interface RequisitoSalvar {
  /**
   * Identificador estável do requisito.
   * Use o mesmo nome do campo do form para destacar bordas inline:
   * `camposPendentes(requisitos).has('cnpj')` → mostrar borda vermelha.
   */
  chave: string

  /** Se este requisito está atendido. */
  ok: boolean

  /** Mensagem mostrada no banner quando `ok=false`. PT-BR, frase curta. */
  mensagem: string
}

export interface BannerRequisitosGlobalProps {
  /**
   * Lista completa de requisitos. Apenas os com `ok=false` aparecem.
   * Opcional quando o banner está dentro de `<BannerRequisitosProvider>` —
   * nesse caso, os requisitos vêm do contexto.
   */
  requisitos?: RequisitoSalvar[]

  /** Título do banner. Padrão: "Para salvar, ainda falta:" */
  titulo?: string
}

/**
 * Status de um requisito específico, retornado pelo hook `useRequisitoInput`.
 * Uso típico:
 *   <input {...useRequisitoInput('cnpj_workspace')} />
 */
export interface RequisitoInputProps {
  style?: { borderColor?: string }
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}
