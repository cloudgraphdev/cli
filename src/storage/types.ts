import { Logger } from '@cloudgraph/sdk'

export interface GraphQLFormattedQuery {
  query: string
  variables: any
}

export interface GraphQLInputData {
  query: string
  connectedData: any
}

export interface StorageEngineConfig {
  host: string
  logger: Logger
}

export interface StorageEngine {
  host: string
  logger: Logger
  healthCheck: (showInitialStatus?: boolean) => Promise<boolean>
  setSchema: (schema: string[]) => Promise<void>
  push: (data: any) => void
  run: () => Promise<void>
}
