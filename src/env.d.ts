/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module 'open-nagish' {
  export interface OpenNagishConfig {
    lang?: 'he' | 'en' | 'ar' | 'ru';
    position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
    bottomOffset?: number;
    mobileBottomOffset?: number;
    statementUrl?: string;
    statementData?: Record<string, string>;
  }

  export interface OpenNagishInstance { destroy(): void }
  export function init(config?: OpenNagishConfig): OpenNagishInstance;
}
