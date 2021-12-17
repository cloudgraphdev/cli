import { Method } from 'axios'

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
