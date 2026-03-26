import React, { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

/**
 * Provedor Global de Internacionalização da Gravity
 * Este componente deve envolver a aplicação raiz de cada micro serviço ou plataforma.
 */
export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  useEffect(() => {
    // Configura a direção inicial ao montar
    const currentLng = i18n.language || 'pt';
    const direction = currentLng.startsWith('ar') ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', currentLng);
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};
