// Extensão do tipo UsageMetadata do SDK @google/generative-ai v0.24.x
// O campo cachedContentTokenCount é retornado pela API quando context caching
// está ativo, mas a tipagem do SDK ainda não o inclui.

export interface UsageMetadataWithCache {
  promptTokenCount: number
  candidatesTokenCount: number
  totalTokenCount: number
  cachedContentTokenCount?: number
}
