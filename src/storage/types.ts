import { Logger } from '@cloudgraph/sdk'
import { Method } from 'axios'
import { ExecutionResult } from 'graphql'

export interface RequestConfig {
  baseUrl?: string
  path: string
  data?: any
  verb?: Method
  headers?: { [key: string]: string }
}

export interface GraphQLFormattedQuery {
  query: string
  variables: any
}

export interface GraphQLInputData {
  query: string
  connectedData: any
  name: string
}

export interface StorageEngineConnectionConfig {
  scheme: string
  host: string
  port: string
}

export interface StorageEngineConfig extends StorageEngineConnectionConfig {
  type: string
  logger: Logger
}

export interface StorageEngine {
  host: string
  logger: Logger
  healthCheck: (showInitialStatus?: boolean) => Promise<boolean>
  setSchema: (schema: string[]) => Promise<void>
  dropAll: () => Promise<ExecutionResult>
  dropData: () => Promise<ExecutionResult>
  push: (data: any) => void
  run: (dropData?: boolean) => Promise<void>
}
