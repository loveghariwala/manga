import { MangaProvider } from "./types";
import { MangaDexProvider } from "./mangadex";

class ProviderRegistry {
  private providers: Map<string, MangaProvider> = new Map();
  private defaultProviderId: string;

  constructor() {
    // Register initial providers
    const mangadex = new MangaDexProvider();
    this.registerProvider(mangadex);
    
    // Set default provider
    this.defaultProviderId = mangadex.id;
  }

  registerProvider(provider: MangaProvider) {
    this.providers.set(provider.id, provider);
  }

  getProvider(id?: string): MangaProvider {
    const targetId = id || this.defaultProviderId;
    const provider = this.providers.get(targetId);
    
    if (!provider) {
      throw new Error(`Provider with id '${targetId}' not found`);
    }
    
    return provider;
  }

  getAllProviders(): MangaProvider[] {
    return Array.from(this.providers.values());
  }

  // Helper method to get the default provider
  getDefaultProvider(): MangaProvider {
    return this.getProvider(this.defaultProviderId);
  }
}

export const providerRegistry = new ProviderRegistry();

// Export the default provider directly for easier legacy imports during migration
export const defaultProvider = providerRegistry.getDefaultProvider();
