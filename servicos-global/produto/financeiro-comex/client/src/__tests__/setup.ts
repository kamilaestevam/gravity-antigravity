import '@testing-library/jest-dom'

// Mock do @shell para testes unitários
vi.mock('@shell', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock do ClerkProvider
vi.mock('@clerk/clerk-react', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  useUser: () => ({ user: { id: 'test-user', fullName: 'Test User' }, isSignedIn: true }),
}))
