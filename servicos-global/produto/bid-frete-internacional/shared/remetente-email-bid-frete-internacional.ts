/** Remetente transacional BID Frete Internacional (Resend / EMAIL_FROM override por produto). */
export const REMETENTE_EMAIL_BID_FRETE_INTERNACIONAL =
  process.env.EMAIL_FROM_BID_FRETE_INTERNACIONAL?.trim()
  || 'Gravity <responder@usegravity.com.br>'
