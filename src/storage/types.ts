import { Logger } from '@cloudgraph/sdk'

export interface StorageEngine {
  host: string
  logger: Logger
  healthCheck: (showInitialStatus?: boolean) => Promise<boolean>
  setSchema: (schema: string[]) => Promise<void>
  push: (data: { query: string; variables: { input: any } }) => void
  run: () => Promise<void>
}
