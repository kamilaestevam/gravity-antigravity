/**
 * Conteúdo SSOT do módulo Bem-vindo (referência para Academy; manual docs pode reutilizar).
 */

import type { DocSecao } from './manual-login-conteudo'

export const DOC_BEM_VINDO_SUBTITULO = 'Boas-vindas e introdução ao ecossistema'

export const DOC_BEM_VINDO_METADADOS: { rotulo: string; valor: string; href?: boolean }[] = [
  { rotulo: 'Versão', valor: '1.0' },
  { rotulo: 'Atualizado em', valor: 'julho 2026' },
  { rotulo: 'Produto', valor: 'Plataforma Gravity' },
  { rotulo: 'URL de acesso', valor: 'https://usegravity.com.br/hub', href: true },
  { rotulo: 'Rota base', valor: '/hub' },
]

export const DOC_BEM_VINDO_SECOES: DocSecao[] = [
  {
    num: 1,
    titulo: 'Boas-vindas',
    paragrafos: [
      'Bem-vindo à plataforma **Gravity**. Estamos muito felizes em ter você conosco.',
      'Aqui você tem à disposição um **ecossistema completo** para descomplicar o **Comércio Exterior**. O Gravity foi desenhado para centralizar a operação, unir tecnologia e pessoas, e transformar a complexidade logística em fluxos simples e inteligentes.',
      'Nesta trilha inicial, você vai conhecer as bases da plataforma, a história de onde viemos e como navegar pelo **Guia Gravity**.',
    ],
  },
  {
    num: 2,
    titulo: 'O que é o Gravity',
    paragrafos: [
      'Antes de falar do **Gravity** em si, deixe-nos contar a história de onde ele nasceu.',
      'O **Gravity** é um produto da empresa **DATI**, uma empresa de tecnologia em **Comércio Exterior** fundada em 2018 em Florianópolis, Santa Catarina.',
      'Temos o **DNA** dividido entre **Comércio Exterior** (algo que nossos fundadores vivem há décadas) e a área apaixonante da **tecnologia**.',
      'Nossa missão sempre foi **descomplicar o complicado**: rotinas e processos, com tecnologia e **Inteligência Artificial**. O Gravity é a evolução dessa quase década de experiência, construído lado a lado com nossos clientes para entender exatamente o que vocês precisam.',
      'É uma **plataforma modular** composta por vários produtos. Você pode contratar um, dois, três ou todos: você decide o que faz sentido para a sua operação.',
    ],
    callout: {
      tipo: 'dica',
      texto: 'O ecossistema Gravity se adapta à sua empresa. Conforme você cresce, pode acoplar novos produtos para cobrir mais etapas da sua cadeia de suprimentos sem sair da plataforma.',
    },
  },
]
