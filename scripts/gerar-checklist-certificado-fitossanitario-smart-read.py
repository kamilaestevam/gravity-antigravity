#!/usr/bin/env python3
"""Gera montar-checklist-matriz-certificado-fitossanitario-smart-read.ts a partir do template CO."""

SRC = r'C:\Users\danie\worthree-ajuste-smartdoc-03\servicos-global\produto\smart-read\shared\montar-checklist-matriz-certificado-origem-smart-read.ts'
DST = r'C:\Users\danie\worthree-ajuste-smartdoc-03\servicos-global\produto\smart-read\shared\montar-checklist-matriz-certificado-fitossanitario-smart-read.ts'

with open(SRC, encoding='utf-8') as f:
    text = f.read()

# Ordem importa: nomes longos antes de tokens curtos
subs = [
    ('montar-checklist-matriz-certificado-origem-smart-read.ts — checklist da matriz CO (CO1–CO9)',
     'montar-checklist-matriz-certificado-fitossanitario-smart-read.ts — checklist da matriz CF (CF1–CF9)'),
    ('matriz-validacao-certificado-origem-smart-read.js', 'matriz-validacao-certificado-fitossanitario-smart-read.js'),
    ('GATES_MATRIZ_CERTIFICADO_ORIGEM', 'GATES_MATRIZ_CERTIFICADO_FITOSSANITARIO'),
    ('MATRIZ_VALIDACAO_CERTIFICADO_ORIGEM', 'MATRIZ_VALIDACAO_CERTIFICADO_FITOSSANITARIO'),
    ('ORDEM_SECOES_MATRIZ_CERTIFICADO_ORIGEM', 'ORDEM_SECOES_MATRIZ_CERTIFICADO_FITOSSANITARIO'),
    ('ROTULO_CLASSIFICACAO_RISCO_CERTIFICADO_ORIGEM', 'ROTULO_CLASSIFICACAO_RISCO_CERTIFICADO_FITOSSANITARIO'),
    ('classificacaoRiscoCertificadoOrigem', 'classificacaoRiscoCertificadoFitossanitario'),
    ('ClassificacaoRiscoCertificadoOrigem', 'ClassificacaoRiscoCertificadoFitossanitario'),
    ('RegraMatrizCertificadoOrigem', 'RegraMatrizCertificadoFitossanitario'),
    ('SecaoMatrizCertificadoOrigem', 'SecaoMatrizCertificadoFitossanitario'),
    ('StatusChecklistMatrizCertificadoOrigem', 'StatusChecklistMatrizCertificadoFitossanitario'),
    ('ItemChecklistMatrizCertificadoOrigem', 'ItemChecklistMatrizCertificadoFitossanitario'),
    ('ParametrosChecklistMatrizCertificadoOrigem', 'ParametrosChecklistMatrizCertificadoFitossanitario'),
    ('ScoreChecklistCertificadoOrigem', 'ScoreChecklistCertificadoFitossanitario'),
    ('ehTipoCertificadoOrigemChecklist', 'ehTipoCertificadoFitossanitarioChecklist'),
    ('montarChecklistMatrizCertificadoOrigem', 'montarChecklistMatrizCertificadoFitossanitario'),
    ('calcularScoreChecklistCertificadoOrigem', 'calcularScoreChecklistCertificadoFitossanitario'),
    ('agruparChecklistCertificadoOrigemPorSecao', 'agruparChecklistCertificadoFitossanitarioPorSecao'),
    ('CertificadoOrigemOpcaoChecklist', 'CertificadoFitossanitarioOpcaoChecklist'),
    ('listarCertificadosOrigemChecklist', 'listarCertificadosFitossanitarioChecklist'),
    ('ResumoCertificadoOrigemChecklist', 'ResumoCertificadoFitossanitarioChecklist'),
    ('percentualConformeChecklistCertificadoOrigem', 'percentualConformeChecklistCertificadoFitossanitario'),
    ('montarResumoChecklistCertificadosOrigem', 'montarResumoChecklistCertificadosFitossanitario'),
    ('combinarResumoGeralComCertificadosOrigem', 'combinarResumoGeralComCertificadosFitossanitario'),
    ("'CO9-05'", "'CF9-05'"),
    ("'CO9-06'", "'CF9-06'"),
    ('const co =', 'const cf ='),
    ('(co) =>', '(cf) =>'),
    ('resumosCo', 'resumosCf'),
    ('.map((co)', '.map((cf)'),
    ('rotulo_documento: co.rotulo', 'rotulo_documento: cf.rotulo'),
]

for old, new in subs:
    text = text.replace(old, new)

# Substituir detecção de tipo
old_detect = """/** Detecta Certificado de Origem — físico, digitalizado ou COD. */
export function ehTipoCertificadoFitossanitarioChecklist(tipo: string): boolean {
  const norm = tipo.toUpperCase()
  return (
    norm.includes('CERTIFICADO DE ORIGEM') ||
    norm.includes('CERTIFICATE OF ORIGIN') ||
    norm.includes('ORIGIN CERTIFICATE') ||
    norm.includes('CERTIFICADO ORIGEM') ||
    /\\bCOD\\b/.test(norm)
  )
}"""

new_detect = """/** Detecta Certificado Fitossanitário (CFI/CFR, NIMF 12) — físico ou ePhyto. */
export function ehTipoCertificadoFitossanitarioChecklist(tipo: string): boolean {
  const norm = tipo.toUpperCase()
  if (norm.includes('CERTIFICATE OF ORIGIN') || norm.includes('CERTIFICADO DE ORIGEM')) return false
  return (
    norm.includes('PHYTOSANITARY') ||
    norm.includes('FITOSSANIT') ||
    norm.includes('FITOSANIT') ||
    norm.includes('NIMF 12') ||
    norm.includes('NIMF12') ||
    /\\bCFI\\b/.test(norm) ||
    /\\bCFR\\b/.test(norm)
  )
}"""

text = text.replace(old_detect, new_detect)

# Campo de referência na listagem
text = text.replace(
    "valorTextoComparacaoCampo(mapa.get('document.certificateNumber')) ??\n        valorTextoComparacaoCampo(mapa.get('certificateNumber')) ??\n        valorTextoComparacaoCampo(mapa.get('document.number'))",
    "valorTextoComparacaoCampo(mapa.get('document.phytosanitaryCertificateNumber')) ??\n        valorTextoComparacaoCampo(mapa.get('phytosanitaryCertificateNumber')) ??\n        valorTextoComparacaoCampo(mapa.get('document.certificateNumber')) ??\n        valorTextoComparacaoCampo(mapa.get('certificateNumber')) ??\n        valorTextoComparacaoCampo(mapa.get('document.number'))",
)

with open(DST, 'w', encoding='utf-8') as f:
    f.write(text)
print(f'Wrote {DST}')
