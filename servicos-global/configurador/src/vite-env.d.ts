/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WORKSPACE_URL?: string
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string
  readonly VITE_CARGOWISE_URL?: string
  readonly VITE_INTERNAL_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
