import { defaultProvider } from "./providers";

// Re-export the default provider as 'mangadex' to maintain backwards compatibility
// with existing imports while transitioning to the new Provider Architecture.
// In the future, components should import from "@/lib/providers" instead.
export const mangadex = defaultProvider;
