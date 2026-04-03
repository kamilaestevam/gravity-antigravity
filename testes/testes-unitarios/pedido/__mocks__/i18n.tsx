/**
 * Mock de react-i18next para testes do produto Pedido
 */
export function useTranslation() {
  return {
    t: (key: string) => key,
    i18n: { language: 'pt', changeLanguage: async () => {} },
  }
}

export function Trans({ children }: { children?: unknown }) {
  return children as any
}
