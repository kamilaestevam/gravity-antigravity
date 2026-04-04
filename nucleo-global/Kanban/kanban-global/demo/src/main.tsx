import React from 'react'
import ReactDOM from 'react-dom/client'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import App from './App'
import './App.css'

i18n.use(initReactI18next).init({
  lng: 'pt-BR',
  fallbackLng: 'pt-BR',
  interpolation: { escapeValue: false },
  resources: {
    'pt-BR': {
      translation: {
        campo: {
          selecione_periodo: 'Selecione período',
          limpar: 'Limpar',
          limpar_selecao: 'Limpar seleção',
        },
        calendario: {
          mes_0:  'Janeiro',
          mes_1:  'Fevereiro',
          mes_2:  'Março',
          mes_3:  'Abril',
          mes_4:  'Maio',
          mes_5:  'Junho',
          mes_6:  'Julho',
          mes_7:  'Agosto',
          mes_8:  'Setembro',
          mes_9:  'Outubro',
          mes_10: 'Novembro',
          mes_11: 'Dezembro',
          dia_dom: 'D',
          dia_seg: 'S',
          dia_ter: 'T',
          dia_qua: 'Q',
          dia_qui: 'Q',
          dia_sex: 'S',
          dia_sab: 'S',
          hoje:          'Hoje',
          ontem:         'Ontem',
          ultimos_7:     'Últimos 7 dias',
          ultimos_30:    'Últimos 30 dias',
          este_mes:      'Este mês',
          mes_passado:   'Mês passado',
          este_ano:      'Este ano',
          limpar_periodo:'Limpar período',
          inicio:        'Início',
          fim:           'Fim',
          cancelar:      'Cancelar',
          aplicar:       'Aplicar',
        },
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
