/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEBUG_PROD: string;
  readonly VITE_ENABLE_OFFLINE_INDICATOR: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
