import { ProviderData, StorageEngine } from '@cloudgraph/sdk'

export interface CloudGraphConfig {
  [key: string]: unknown | Record<NonNullable<string | number>, unknown>
}

export type SchemaMap = {
  [schemaName: string]: string
}

export interface DataToLoad {
  provider: string
  providerData: ProviderData
  storageEngine: StorageEngine
  storageRunning: boolean
  schemaMap: SchemaMap | undefined
}
