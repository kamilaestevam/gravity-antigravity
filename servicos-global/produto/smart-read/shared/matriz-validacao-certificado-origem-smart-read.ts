/**
 * matriz-validacao-certificado-origem-smart-read.ts — SSOT Matriz de Validação do Certificado de Origem (v1.0)
 *
 * Cobre CO preferencial (Mercosul/ACE/ALADI/acordos extra-regionais), CO não-preferencial (comum)
 * e COD (digital via LPCO). Consequência de falha grave: perda do benefício tarifário (II cheio),
 * não multa fixa.
 *
 * Base normativa geral: RA arts. 30–35, 121–124, 553 IV, 686–702 · IN SRF 680/2006 arts. 18–19 ·
 * Dec. CMC 05/23 · Res. ALADI 252/22 · IN SRF 645/646/2006 · Port. SECEX 23/2011 art. 235-F ·
 * Manual LPCO (COD desde 18/07/2025) · SC COSIT 112/2021 · IN RFB 1.759/2017.
 */

export type SecaoMatrizCertificadoOrigem =
  | 'natureza_acordo'
  | 'partes'
  | 'identificacao_validade'
  | 'mercadoria_ncm'
  | 'criterio_origem'
  | 'emissao_formalidades'
  | 'processo_lpco'
  | 'regime_acordo'
  | 'legitimidade_risco'

export type MotorValidacaoCertificadoOrigem =
  | 'codigo'
  | 'api'
  | 'llm'
  | 'rag'
  | 'cross_doc'
  | 'codigo_rag'
  | 'cross_doc_rag'
  | 'api_llm'
  | 'lpco'

export type SeveridadeMatrizCertificadoOrigem = 'bloq' | 'alerta' | 'info' | 'cond' | null

export type RegraMatrizCertificadoOrigem = {
  id: string
  secao: SecaoMatrizCertificadoOrigem
  item: string
  motor: MotorValidacaoCertificadoOrigem
  severidade: SeveridadeMatrizCertificadoOrigem
  gate_condicional?: boolean
  descricao: string
  tooltip_conferencia: string
  base_normativa: string
}

export const ORDEM_SECOES_MATRIZ_CERTIFICADO_ORIGEM: readonly SecaoMatrizCertificadoOrigem[] = [
  'natureza_acordo',
  'partes',
  'identificacao_validade',
  'mercadoria_ncm',
  'criterio_origem',
  'emissao_formalidades',
  'processo_lpco',
  'regime_acordo',
  'legitimidade_risco',
] as const

export const ROTULO_SECAO_MATRIZ_CERTIFICADO_ORIGEM: Record<SecaoMatrizCertificadoOrigem, string> = {
  natureza_acordo: '1 — Natureza, acordo e enquadramento',
  partes: '2 — Partes (produtor, exportador, importador)',
  identificacao_validade: '3 — Identificação, datas e validade',
  mercadoria_ncm: '4 — Mercadoria, NCM/NALADI e correspondência com a invoice',
  criterio_origem: '5 — Critério de origem e requisitos substantivos',
  emissao_formalidades: '6 — Emissão, entidade habilitada e assinatura',
  processo_lpco: '7 — Coerência com o processo e LPCO',
  regime_acordo: '8 — Regime de origem por acordo e casos especiais',
  legitimidade_risco: '9 — Legitimidade e risco (perda de benefício)',
}

export const ROTULO_SEVERIDADE_MATRIZ_CERTIFICADO_ORIGEM: Record<
  Exclude<SeveridadeMatrizCertificadoOrigem, null>,
  string
> = {
  bloq: 'BLOQ',
  alerta: 'ALERTA',
  info: 'INFO',
  cond: 'COND',
}

export const MATRIZ_VALIDACAO_CERTIFICADO_ORIGEM: RegraMatrizCertificadoOrigem[] = [
  // ── Seção 1 — Natureza, acordo e enquadramento ─────────────────────────────
  {
    id: 'CO1-01',
    secao: 'natureza_acordo',
    item: 'Tipo: preferencial × não-preferencial',
    motor: 'llm',
    severidade: 'bloq',
    descricao:
      'Classificar o CO: preferencial (redução/isenção de II) ou não-preferencial/comum (só atesta origem — defesa comercial, carta de crédito)',
    tooltip_conferencia: 'Identifica se o certificado é preferencial (com benefício) ou comum',
    base_normativa: 'RA arts. 30–35 × 121–124',
  },
  {
    id: 'CO1-02',
    secao: 'natureza_acordo',
    item: 'Acordo/regime aplicável',
    motor: 'rag',
    severidade: 'bloq',
    descricao:
      'Identificar o acordo (Mercosul ACE 18, Chile ACE 35, Bolívia ACE 36, ACE 59, ACE 55-México, ALADI, Mercosul-Egito, SGP etc.) e confirmar cobertura do país e do produto',
    tooltip_conferencia: 'Identifica o acordo comercial e confirma cobertura do país e do produto',
    base_normativa: 'RA arts. 121–124; acordos internalizados',
  },
  {
    id: 'CO1-03',
    secao: 'natureza_acordo',
    item: 'Modelo/formulário correto do acordo',
    motor: 'llm',
    severidade: 'alerta',
    descricao:
      'Cada acordo tem modelo próprio (Mercosul, ALADI Res. 252, Form A do SGP etc.); o modelo apresentado deve corresponder ao acordo de CO1-02',
    tooltip_conferencia: 'Verifica se o modelo do formulário corresponde ao acordo declarado',
    base_normativa: 'Res. ALADI 252; Res. ALADI 22',
  },
  {
    id: 'CO1-04',
    secao: 'natureza_acordo',
    item: 'Formato: físico × COD (LPCO)',
    motor: 'llm',
    severidade: 'info',
    descricao:
      'Detectar CO físico, digitalizado ou COD (XML digital). Desde 18/07/2025 o COD é apresentado exclusivamente via módulo LPCO do Portal Único',
    tooltip_conferencia: 'Identifica se é certificado físico, digitalizado ou digital (COD via LPCO)',
    base_normativa: 'Manual LPCO; IN RFB 1.759/2017',
  },
  {
    id: 'CO1-05',
    secao: 'natureza_acordo',
    item: 'Necessidade do CO × prova alternativa',
    motor: 'rag',
    severidade: 'cond',
    descricao:
      'Verificar se o benefício poderia ser provado por CCROM, CCPTC (livre circulação intrazona/PTC) ou autocertificação SGP — evita exigir CO onde a prova de origem é dispensada',
    tooltip_conferencia: 'Detecta quando a origem pode ser provada sem certificado (CCROM/CCPTC/SGP)',
    base_normativa: 'IN SRF 645/2006 e 646/2006; Dec. CMC 37/05; Port. SECEX 23 art. 235-F',
  },
  {
    id: 'CO1-06',
    secao: 'natureza_acordo',
    item: 'Defesa comercial — origem não preferencial',
    motor: 'cross_doc_rag',
    severidade: 'cond',
    descricao:
      'Se o NCM (S4-03) está sujeito a antidumping/medida compensatória: exigir CO não-preferencial para comprovar origem e afastar/aplicar a medida',
    tooltip_conferencia: 'Detecta produto sob defesa comercial e a exigência de origem não preferencial',
    base_normativa: 'RA arts. 686–702',
  },

  // ── Seção 2 — Partes ───────────────────────────────────────────────────────
  {
    id: 'CO2-01',
    secao: 'partes',
    item: 'Produtor / fabricante',
    motor: 'cross_doc',
    severidade: 'alerta',
    descricao:
      'Produtor identificado (nome/endereço); é ele quem detém a DJO. Cruzar com fabricante da invoice (S2-07) e do PL (P6-07)',
    tooltip_conferencia: 'Confere o produtor e cruza com o fabricante dos demais documentos',
    base_normativa: 'Dec. CMC 05/23; Res. ALADI 252',
  },
  {
    id: 'CO2-02',
    secao: 'partes',
    item: 'Exportador',
    motor: 'cross_doc',
    severidade: 'alerta',
    descricao:
      'Exportador identificado; pode diferir do produtor. Cruzar com exportador da invoice (S2-05)',
    tooltip_conferencia: 'Confere o exportador e cruza com a invoice',
    base_normativa: 'Res. ALADI 252; Dec. CMC 05/23',
  },
  {
    id: 'CO2-03',
    secao: 'partes',
    item: 'Importador / consignatário',
    motor: 'cross_doc',
    severidade: 'alerta',
    descricao:
      'Importador identificado; deve casar com o importador da DUIMP e da invoice (S2-03). País do importador coerente com o acordo',
    tooltip_conferencia: 'Confere o importador contra a invoice e o país do acordo',
    base_normativa: 'RA arts. 121–124; Res. ALADI 252',
  },
  {
    id: 'CO2-04',
    secao: 'partes',
    item: 'País de origem × país de procedência',
    motor: 'llm',
    severidade: 'bloq',
    descricao:
      'País de origem declarado deve ser signatário do acordo (CO1-02); procedência/expedição por país intermediário sem transformação pode exigir regra de trânsito/faturação por operador de terceiro país',
    tooltip_conferencia: 'Confere o país de origem (signatário) e detecta expedição por terceiro país',
    base_normativa: 'Dec. CMC 05/23; Res. ALADI 252',
  },
  {
    id: 'CO2-05',
    secao: 'partes',
    item: 'Faturação por terceiro operador',
    motor: 'llm',
    severidade: 'alerta',
    descricao:
      'Se a invoice é emitida por operador de país distinto do produtor (third-party invoicing): o CO deve indicar essa condição em campo próprio, sob pena de rejeição',
    tooltip_conferencia: 'Detecta faturação por terceiro país e a declaração exigida no certificado',
    base_normativa: 'Dec. CMC 05/23; Res. ALADI 252',
  },

  // ── Seção 3 — Identificação, datas e validade ──────────────────────────────
  {
    id: 'CO3-01',
    secao: 'identificacao_validade',
    item: 'Número do certificado',
    motor: 'codigo',
    severidade: 'alerta',
    descricao: 'Nº do certificado presente e único',
    tooltip_conferencia: 'Confere o número único do certificado',
    base_normativa: 'Res. ALADI 252; Dec. CMC 05/23',
  },
  {
    id: 'CO3-02',
    secao: 'identificacao_validade',
    item: 'Data de emissão × data da fatura',
    motor: 'cross_doc',
    severidade: 'bloq',
    descricao:
      'A emissão do CO não pode ser anterior à data da fatura comercial nem posterior ao embarque (salvo emissão a posteriori justificada e assinalada)',
    tooltip_conferencia: 'Confere se a emissão do certificado é coerente com a fatura e o embarque',
    base_normativa: 'Dec. CMC 05/23; Res. ALADI 252',
  },
  {
    id: 'CO3-03',
    secao: 'identificacao_validade',
    item: 'Validade — 180 / 60 dias',
    motor: 'codigo',
    severidade: 'bloq',
    descricao:
      'Prazo de validade conforme o regime: 180 dias (Mercosul, com NCM) ou 60 dias (ALADI com correlação NALADI). Vencido = perda do benefício',
    tooltip_conferencia: 'Valida o prazo (180 dias Mercosul / 60 dias ALADI) e a prorrogação em regime suspensivo',
    base_normativa: 'Dec. CMC 05/23; Res. ALADI; IN 680/06 art. 19, §2º',
  },
  {
    id: 'CO3-04',
    secao: 'identificacao_validade',
    item: 'Prazo de apresentação vs registro',
    motor: 'rag',
    severidade: 'cond',
    descricao:
      'Apresentação pode ser posterior ao registro da DI em alguns acordos (ex.: até 60 dias no ACE 55, com Termo de Responsabilidade) — não confundir com validade',
    tooltip_conferencia: 'Distingue prazo de apresentação (pode ser pós-registro) do prazo de validade',
    base_normativa: 'SC COSIT 112/2021; IN 680/06',
  },
  {
    id: 'CO3-05',
    secao: 'identificacao_validade',
    item: 'Emissão a posteriori',
    motor: 'llm',
    severidade: 'cond',
    descricao:
      'Se emitido após o embarque: campo "emitido a posteriori" (ou equivalente) assinalado; ausência do assinalamento invalida',
    tooltip_conferencia: 'Verifica o assinalamento de emissão a posteriori quando aplicável',
    base_normativa: 'Dec. CMC 05/23; Res. ALADI 252',
  },

  // ── Seção 4 — Mercadoria, NCM/NALADI ───────────────────────────────────────
  {
    id: 'CO4-01',
    secao: 'mercadoria_ncm',
    item: 'Descrição da mercadoria',
    motor: 'cross_doc',
    severidade: 'bloq',
    descricao:
      'Descrição do CO deve corresponder à da invoice (S4-02) e permitir identificar a mercadoria; divergência substancial invalida a preferência',
    tooltip_conferencia: 'Confere se a descrição do certificado corresponde à da invoice',
    base_normativa: 'Res. ALADI 252; Dec. CMC 05/23',
  },
  {
    id: 'CO4-02',
    secao: 'mercadoria_ncm',
    item: 'NCM / NALADI',
    motor: 'cross_doc',
    severidade: 'bloq',
    descricao:
      'Classificação no CO coerente com a pré-classificação (S4-03) e com o REO do acordo; Mercosul usa NCM, ALADI exige correlação NALADI',
    tooltip_conferencia: 'Cruza a classificação do certificado com a NCM/NALADI e o requisito de origem',
    base_normativa: 'Dec. CMC 05/23; Res. ALADI; IN 680/06 art. 19',
  },
  {
    id: 'CO4-03',
    secao: 'mercadoria_ncm',
    item: 'Quantidade e unidade',
    motor: 'cross_doc',
    severidade: 'alerta',
    descricao:
      'Quantidade do CO ≤ quantidade da invoice/PL (S4-05/P6-03); CO não pode amparar mais do que o embarcado',
    tooltip_conferencia: 'Confere quantidade do certificado contra invoice e packing list',
    base_normativa: 'Res. ALADI 252',
  },
  {
    id: 'CO4-04',
    secao: 'mercadoria_ncm',
    item: 'Fatura vinculada no certificado',
    motor: 'cross_doc',
    severidade: 'bloq',
    descricao:
      'Nº e data da fatura comercial declarados no CO devem casar com a invoice do processo (S1-01)',
    tooltip_conferencia: 'Confere a fatura declarada no certificado contra a invoice do processo',
    base_normativa: 'Res. ALADI 252; Dec. CMC 05/23',
  },
  {
    id: 'CO4-05',
    secao: 'mercadoria_ncm',
    item: 'Múltiplos itens / posições',
    motor: 'llm',
    severidade: 'cond',
    descricao:
      'CO com vários itens: cada linha com sua NCM/NALADI, DJO e critério de origem; um critério por item',
    tooltip_conferencia: 'Verifica critério de origem e DJO por item em certificados multi-produto',
    base_normativa: 'Dec. CMC 05/23; Res. ALADI 252',
  },

  // ── Seção 5 — Critério de origem (núcleo RAG) ───────────────────────────────
  {
    id: 'CO5-01',
    secao: 'criterio_origem',
    item: 'Critério de origem preenchido',
    motor: 'rag',
    severidade: 'bloq',
    descricao:
      'Campo do critério de origem preenchido e válido para o acordo: totalmente obtido, salto tarifário (CTC), VCR, REO específico. Campo vazio ou genérico invalida',
    tooltip_conferencia: 'Verifica se o critério de origem está preenchido e é válido para o acordo',
    base_normativa: 'Dec. CMC 05/23; Res. ALADI 252',
  },
  {
    id: 'CO5-02',
    secao: 'criterio_origem',
    item: 'Coerência critério × produto',
    motor: 'rag',
    severidade: 'alerta',
    descricao:
      'O critério declarado é plausível para a NCM (ex.: "totalmente obtido" para manufatura complexa com insumos importados é red flag)',
    tooltip_conferencia: 'Avalia se o critério declarado é plausível para o tipo de produto',
    base_normativa: 'Dec. CMC 05/23',
  },
  {
    id: 'CO5-03',
    secao: 'criterio_origem',
    item: 'Valor de conteúdo regional',
    motor: 'rag',
    severidade: 'cond',
    descricao:
      'Quando o critério é VCR: verificar o percentual declarado contra o exigido pelo acordo (ex.: Mercosul — máx. 40% extra-zona / mín. 60% regional)',
    tooltip_conferencia: 'Confere o percentual de conteúdo regional contra o exigido pelo acordo',
    base_normativa: 'Dec. CMC 05/23',
  },
  {
    id: 'CO5-04',
    secao: 'criterio_origem',
    item: 'DJO — Declaração Juramentada de Origem',
    motor: 'rag',
    severidade: 'cond',
    descricao:
      'Nº e data da DJO declarados por produto (campo numérico, até 5 posições); a DJO sustenta a emissão',
    tooltip_conferencia: 'Verifica a Declaração Juramentada de Origem que sustenta o certificado',
    base_normativa: 'Dec. CMC 05/23',
  },
  {
    id: 'CO5-05',
    secao: 'criterio_origem',
    item: 'De minimis',
    motor: 'rag',
    severidade: 'cond',
    descricao:
      'Quando aplicável: insumo não originário de mesma posição do produto final ≤ 10% do valor FOB; acima disso não qualifica',
    tooltip_conferencia: 'Verifica a regra de minimis (≤ 10% FOB) quando aplicável',
    base_normativa: 'Dec. CMC 05/23, art. 6º',
  },
  {
    id: 'CO5-06',
    secao: 'criterio_origem',
    item: 'Acumulação de origem',
    motor: 'llm',
    severidade: 'info',
    descricao:
      'Detectar acumulação intra-Mercosul (Declaração de Materiais do fornecedor, Apêndice X) quando o critério a invoca',
    tooltip_conferencia: 'Detecta uso de acumulação de origem e a declaração de materiais exigida',
    base_normativa: 'Dec. CMC 05/23 (Apêndice X)',
  },
  {
    id: 'CO5-07',
    secao: 'criterio_origem',
    item: 'Expedição direta / trânsito',
    motor: 'llm',
    severidade: 'alerta',
    descricao:
      'Regra de expedição direta: trânsito por terceiro país só preserva a origem com controle aduaneiro e sem transformação; cruzar com a rota do BL/AWB',
    tooltip_conferencia: 'Verifica a expedição direta e o trânsito por terceiro país contra a rota',
    base_normativa: 'Dec. CMC 05/23; Res. ALADI 252',
  },

  // ── Seção 6 — Emissão, entidade e assinatura (formalidades — gate) ─────────
  {
    id: 'CO6-01',
    secao: 'emissao_formalidades',
    item: 'Entidade emissora habilitada',
    motor: 'rag',
    severidade: 'bloq',
    descricao:
      'Entidade emissora (federação de indústria, câmara, órgão governamental) deve constar como habilitada/credenciada para o acordo no país de origem',
    tooltip_conferencia: 'Verifica se a entidade emissora é habilitada para o acordo',
    base_normativa: 'Res. ALADI 22; Dec. CMC 05/23',
  },
  {
    id: 'CO6-02',
    secao: 'emissao_formalidades',
    item: 'Assinatura autógrafa do funcionário',
    motor: 'llm',
    severidade: 'bloq',
    descricao:
      'Assinatura do funcionário autorizado da entidade emissora; a RFB é enfática: certificado sem assinatura não é válido, nem digitalizado, nem em emergência',
    tooltip_conferencia: 'Verifica a assinatura autógrafa da entidade emissora — sem ela o certificado é inválido',
    base_normativa: 'Res. ALADI 22, arts. 11–14; SC COSIT 112/2021',
  },
  {
    id: 'CO6-03',
    secao: 'emissao_formalidades',
    item: 'Carimbo da entidade',
    motor: 'llm',
    severidade: 'bloq',
    descricao:
      'Carimbo da repartição/entidade autorizada; requisito formal do próprio acordo, não dispensável por norma nacional',
    tooltip_conferencia: 'Verifica o carimbo da entidade emissora — requisito formal não dispensável',
    base_normativa: 'Res. ALADI 22; SC COSIT 112/2021',
  },
  {
    id: 'CO6-04',
    secao: 'emissao_formalidades',
    item: 'Assinatura do exportador/produtor',
    motor: 'llm',
    severidade: 'alerta',
    descricao:
      'Declaração e assinatura do exportador ou produtor no campo próprio (declaração de que a mercadoria cumpre a origem)',
    tooltip_conferencia: 'Verifica a assinatura do exportador/produtor na declaração de origem',
    base_normativa: 'Res. ALADI 252; Dec. CMC 05/23',
  },
  {
    id: 'CO6-05',
    secao: 'emissao_formalidades',
    item: 'COD — assinatura digital (e-CPF)',
    motor: 'lpco',
    severidade: 'cond',
    descricao:
      'Em COD: validação por assinatura digital (e-CPF) no e-COOL/LPCO substitui assinatura e carimbo físicos; verificar integridade da assinatura digital',
    tooltip_conferencia: 'Verifica a assinatura digital (e-CPF) do certificado de origem digital',
    base_normativa: 'Manual LPCO; IN RFB 1.759/2017',
  },

  // ── Seção 7 — Coerência com o processo e LPCO ──────────────────────────────
  {
    id: 'CO7-01',
    secao: 'processo_lpco',
    item: 'Carregado no módulo LPCO',
    motor: 'lpco',
    severidade: 'alerta',
    descricao:
      'COD e certificados vigentes devem ser carregados/consultados no módulo LPCO do Portal Único; alertar se o processo não tem o LPCO correspondente',
    tooltip_conferencia: 'Verifica se o certificado está no módulo LPCO do Portal Único',
    base_normativa: 'Manual LPCO (obrigatório desde 18/07/2025)',
  },
  {
    id: 'CO7-02',
    secao: 'processo_lpco',
    item: 'Vínculo CO × adição da DUIMP',
    motor: 'cross_doc',
    severidade: 'bloq',
    descricao:
      'O CO deve amparar a(s) adição(ões) da DUIMP que pleiteiam a preferência; NCM e origem da adição = certificado',
    tooltip_conferencia: 'Confere o vínculo entre o certificado e as adições da DUIMP que pedem preferência',
    base_normativa: 'IN 680/06; RA arts. 121–124',
  },
  {
    id: 'CO7-03',
    secao: 'processo_lpco',
    item: 'CCROM / CCPTC como alternativa',
    motor: 'rag',
    severidade: 'cond',
    descricao:
      'Se há CCROM (origem Mercosul de reimportação intrazona) ou CCPTC (PTC): a preferência pode ser pleiteada por esse código, dispensando novo CO',
    tooltip_conferencia: 'Detecta CCROM/CCPTC que dispensam a apresentação de novo certificado',
    base_normativa: 'IN SRF 645/2006 e 646/2006; Dec. CMC 37/05',
  },
  {
    id: 'CO7-04',
    secao: 'processo_lpco',
    item: 'Coerência global do dossiê',
    motor: 'cross_doc',
    severidade: 'alerta',
    descricao:
      'Parecer único: CO × invoice × PL × BL/AWB — produtor/exportador, mercadoria, NCM, quantidade, fatura e rota consistentes',
    tooltip_conferencia: 'Consolida a coerência do certificado com invoice, packing list e conhecimento',
    base_normativa: 'RA art. 553; IN 680/06 arts. 18–19',
  },

  // ── Seção 8 — Regime de origem por acordo e casos especiais ────────────────
  {
    id: 'CO8-01',
    secao: 'regime_acordo',
    item: 'Mercosul (Dec. CMC 05/23)',
    motor: 'rag',
    severidade: 'cond',
    descricao:
      'Aplicar o Regime de Origem vigente desde 18/07/2024: REO em NCM 2017, VCR, de minimis, acumulação',
    tooltip_conferencia: 'Aplica o Regime de Origem do Mercosul vigente (Dec. CMC 05/23)',
    base_normativa: 'Dec. CMC 05/23 (vigência 18/07/2024)',
  },
  {
    id: 'CO8-02',
    secao: 'regime_acordo',
    item: 'ALADI / ACE (Res. 252 e 22)',
    motor: 'rag',
    severidade: 'cond',
    descricao:
      'Acordos de complementação econômica (ACE 18/35/36/55/59/62 etc.): NALADI, formalidades da Res. 22, prazo 60 dias',
    tooltip_conferencia: 'Aplica as regras ALADI/ACE (NALADI, Res. 22, 60 dias)',
    base_normativa: 'Res. ALADI 252 e 22',
  },
  {
    id: 'CO8-03',
    secao: 'regime_acordo',
    item: 'SGP / Form A / autocertificação',
    motor: 'rag',
    severidade: 'cond',
    descricao:
      'Sistema Geral de Preferências: Form A (BB) ou autocertificação na própria fatura (Noruega, Suíça); regras do art. 235-F',
    tooltip_conferencia: 'Aplica as regras do SGP (Form A ou autocertificação na fatura)',
    base_normativa: 'Port. SECEX 23 art. 235-F',
  },
  {
    id: 'CO8-04',
    secao: 'regime_acordo',
    item: 'Acordos extra-regionais',
    motor: 'rag',
    severidade: 'cond',
    descricao:
      'Mercosul-Israel, Mercosul-Egito (preferência progressiva), Mercosul-Índia: regra e percentual específicos',
    tooltip_conferencia: 'Aplica regras de acordos extra-regionais (Israel, Egito, Índia)',
    base_normativa: 'Acordos internalizados',
  },
  {
    id: 'CO8-05',
    secao: 'regime_acordo',
    item: 'Cota / preferência parcial',
    motor: 'rag',
    severidade: 'cond',
    descricao:
      'Produto sob cota tarifária ou preferência parcial (< 100%): verificar saldo de cota e o percentual aplicável',
    tooltip_conferencia: 'Verifica cota tarifária e percentual de preferência parcial',
    base_normativa: 'Acordos com cota; TEC; CCM/Mercosul',
  },

  // ── Seção 9 — Legitimidade e risco (perda de benefício) ───────────────────
  {
    id: 'CO9-01',
    secao: 'legitimidade_risco',
    item: 'Integridade e ausência de rasuras',
    motor: 'llm',
    severidade: 'bloq',
    descricao:
      'Sem rasuras, emendas ou campos alterados; rasura em campo essencial invalida o certificado',
    tooltip_conferencia: 'Avalia rasuras ou alterações que invalidam o certificado',
    base_normativa: 'Res. ALADI 252/22',
  },
  {
    id: 'CO9-02',
    secao: 'legitimidade_risco',
    item: 'Legibilidade e idioma',
    motor: 'llm',
    severidade: 'alerta',
    descricao:
      'Legível; idioma do acordo (português/espanhol no Mercosul); tradução se exigida',
    tooltip_conferencia: 'Avalia legibilidade e idioma do certificado',
    base_normativa: 'Res. ALADI 252; IN 680/06',
  },
  {
    id: 'CO9-03',
    secao: 'legitimidade_risco',
    item: 'Consistência com origem da invoice/BL',
    motor: 'cross_doc',
    severidade: 'alerta',
    descricao:
      'País de origem do CO coerente com "made in"/origem da invoice (S3-05) e com a triangulação analisada (S3-03/P2-07)',
    tooltip_conferencia: 'Cruza a origem do certificado com a origem da invoice e a análise de triangulação',
    base_normativa: 'RA arts. 30–35',
  },
  {
    id: 'CO9-04',
    secao: 'legitimidade_risco',
    item: 'Risco de perda de benefício / defesa comercial',
    motor: 'codigo',
    severidade: 'bloq',
    descricao:
      'Consolidar: certificado inválido → perda da preferência (II cheio); produto sob antidumping sem origem não preferencial → aplicação da medida',
    tooltip_conferencia: 'Consolida o risco de perda do benefício tarifário e de defesa comercial',
    base_normativa: 'RA arts. 121–124 e 686–702; SC COSIT 112/2021',
  },
  {
    id: 'CO9-05',
    secao: 'legitimidade_risco',
    item: 'Score documental',
    motor: 'codigo',
    severidade: null,
    descricao:
      'Score 0–100 sobre regras ALERTA/INFO aplicáveis (COND não disparadas = N/A, fora do score)',
    tooltip_conferencia: 'Pontuação de qualidade documental do certificado',
    base_normativa: 'Metodologia interna',
  },
  {
    id: 'CO9-06',
    secao: 'legitimidade_risco',
    item: 'Classificação de risco (gates + score)',
    motor: 'codigo',
    severidade: null,
    descricao:
      'Pior entre score e gates. Qualquer BLOQ falho ⇒ mínimo "Alto risco". Gates: CO1-01, CO1-02, CO2-04, CO3-02, CO3-03, CO4-01, CO4-02, CO4-04, CO5-01, CO6-01, CO6-02, CO6-03, CO7-02, CO9-01, CO9-04',
    tooltip_conferencia: 'Classificação final combinando gates e pontuação',
    base_normativa: 'Metodologia interna',
  },
]

export const GATES_MATRIZ_CERTIFICADO_ORIGEM: readonly string[] =
  MATRIZ_VALIDACAO_CERTIFICADO_ORIGEM.filter((regra) => regra.severidade === 'bloq').map(
    (regra) => regra.id,
  )

/**
 * Gates cuja falha isolada já classifica como Crítico (CO9-06):
 * formalidade (CO6-01/02/03), validade (CO3-03) e critério (CO5-01).
 */
export const GATES_CRITICOS_MATRIZ_CERTIFICADO_ORIGEM: readonly string[] = [
  'CO6-01',
  'CO6-02',
  'CO6-03',
  'CO3-03',
  'CO5-01',
]

export type ClassificacaoRiscoCertificadoOrigem =
  | 'baixo_risco'
  | 'atencao'
  | 'alto_risco'
  | 'critico'

export const ROTULO_CLASSIFICACAO_RISCO_CERTIFICADO_ORIGEM: Record<
  ClassificacaoRiscoCertificadoOrigem,
  string
> = {
  baixo_risco: 'Baixo risco',
  atencao: 'Atenção',
  alto_risco: 'Alto risco',
  critico: 'Crítico',
}

export function classificacaoPorFaixaScoreCertificadoOrigem(
  score: number,
): ClassificacaoRiscoCertificadoOrigem {
  if (score >= 95) return 'baixo_risco'
  if (score >= 80) return 'atencao'
  if (score >= 60) return 'alto_risco'
  return 'critico'
}

export function classificacaoRiscoCertificadoOrigem(
  score: number,
  gatesFalhos: readonly string[],
): ClassificacaoRiscoCertificadoOrigem {
  const porScore = classificacaoPorFaixaScoreCertificadoOrigem(score)
  if (gatesFalhos.length === 0) return porScore

  const temGateCritico = gatesFalhos.some((id) =>
    GATES_CRITICOS_MATRIZ_CERTIFICADO_ORIGEM.includes(id),
  )
  if (gatesFalhos.length >= 2 || temGateCritico) return 'critico'

  return porScore === 'critico' ? 'critico' : 'alto_risco'
}

export function regraMatrizCertificadoOrigemPorId(
  id: string,
): RegraMatrizCertificadoOrigem | undefined {
  return MATRIZ_VALIDACAO_CERTIFICADO_ORIGEM.find((r) => r.id === id)
}
