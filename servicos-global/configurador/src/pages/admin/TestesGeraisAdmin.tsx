import React from 'react'
import { LogTestes } from './LogTestes'

// Re-exporta LogTestes como componente principal da tela "Testes Gerais"
// PlanosTesteAdmin e MetricasLLMAdmin ficam como sub-módulos importáveis
// quando necessário (ex: abas futuras ou modais).
export { PlanosTesteAdmin } from './PlanosTesteAdmin'
export { MetricasLLMAdmin } from './MetricasLLMAdmin'

export function TestesGeraisAdmin() {
  return <LogTestes />
}
