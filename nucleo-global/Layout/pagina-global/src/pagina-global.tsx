import React, { ReactNode } from 'react';
import './pagina-global.css';

export interface PaginaGlobalProps {
  /**
   * Cabeçalho fixo no topo (geralmente CabecalhoGlobal).
   * Opcional — quando omitido o conteúdo começa direto nos stats/ações.
   */
  cabecalho?: ReactNode;
  
  /**
   * Informações de painel ou listagem de métricas, ex: [CardEstatisticaGlobal, CardEstatisticaGlobal].
   * Se os cards não preencherem tudo e "acoes" for definido, as "acoes" ficarão ancoradas na base dessa linha.
   */
  stats?: ReactNode;

  /**
   * Botões de ação como "Novo registro", "Gerar Excel", etc.
   */
  acoes?: ReactNode;

  /**
   * Barra fixa entre os cards e o conteúdo (ex: abas, filtros rápidos).
   * Fica fora da área de scroll, garantindo visibilidade constante.
   */
  toolbar?: ReactNode;

  /**
   * Define o comportamento de preenchimento. 
   * "lista" -> 100% da largura. Usado com TabelaGlobal.
   * "formulario" -> Max-width engessado no centro.
   */
  layout?: 'lista' | 'formulario';

  /**
   * O conteúdo principal, como uma TabelaGlobal.
   * A PaginaGlobal engessa a altura para evitar scroll duplo e
   * permite que o container scrolle internamente se configurado.
   */
  children: ReactNode;
  
  /**
   * Classes extras opcionais no container pai.
   */
  className?: string;
}

export function PaginaGlobal({ 
  cabecalho, 
  stats, 
  acoes,
  toolbar,
  layout = 'lista', 
  children, 
  className = '' 
}: PaginaGlobalProps) {
  const customLayoutClass = `pg-layout-${layout}`;
  const hasMiddleLayer = !!stats || !!acoes;
  const hasCabecalho = !!cabecalho;

  return (
    <div className={`pg-container ${className}`}>
      {/* 1. Header (opcional) */}
      {cabecalho && (
        <div className="pg-cabecalho-wrapper">
          {cabecalho}
        </div>
      )}

      {/* 2. Middle Layer: Stats and/or Actions */}
      {hasMiddleLayer && (
        <div className={`pg-contexto-row ${stats ? 'pg-has-stats' : 'pg-no-stats'} ${!hasCabecalho ? 'pg-no-header' : ''}`}>
          <div className="pg-stats-area">
            {stats}
          </div>
          <div className="pg-acoes-area">
            {acoes}
          </div>
        </div>
      )}

      {/* 3. Toolbar fixo: abas, filtros rápidos, etc. */}
      {toolbar && (
        <div className="pg-toolbar-wrapper">
          {toolbar}
        </div>
      )}

      {/* 4. Main content (Tabela ou Formulário) */}
      <main className={`pg-conteudo-area ${customLayoutClass}`}>
        {children}
      </main>
    </div>
  );
}
