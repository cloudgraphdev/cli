import { Logger } from '@cloudgraph/sdk'
import axios, { AxiosPromise } from 'axios'
import chalk from 'chalk'
import { ExecutionResult } from 'graphql'
import { RequestConfig, StorageEngineConfig, StorageEngineConnectionConfig } from '../types'

export default class DGraphClientWrapper {
  constructor(config: StorageEngineConfig) {
    const { logger, ...rest } = config
    this.connectionConfig = rest
    this.logger = logger
  }

  connectionConfig: StorageEngineConnectionConfig

  logger: Logger

  get host(): string {
    return `${this.connectionConfig.host}:${this.connectionConfig.port}`
  }

  get baseUrl(): string {
    return `${this.connectionConfig.scheme}://${this.connectionConfig.host}:${this.connectionConfig.port}`
  }

  generateAxiosRequest({
    baseUrl,
    path: url,
    data,
    verb,
    headers,
  }: RequestConfig): AxiosPromise<ExecutionResult> {
    return axios({
      method: verb || 'post',
      baseURL: baseUrl || this.baseUrl,
      url,
      headers: {
        ...headers,
      },
      data,
    })
  }

  async dropAll(): Promise<ExecutionResult> {
    return new Promise<ExecutionResult>(async (resolve, reject) => {
      this.logger.debug('Dropping schemas and data')
      try {
        const result = await this.generateAxiosRequest({
          path: '/alter',
          data: '{"drop_all": true}',
        })
        this.logger.debug(JSON.stringify(result.data, null, 2))
        this.logger.debug(`${chalk.green('dropAll')}: Operation successful`)
        resolve(result)
      } catch (error) {
        this.logger.error(`${chalk.red('dropAll')}: Operation failed`)
        this.logger.debug(JSON.stringify(error, null, 2))
        reject(error)
      }
    })
  }

  // Drop All Data, but keep the schema.
  async dropData(): Promise<ExecutionResult> {
    return new Promise<ExecutionResult>(async (resolve, reject) => {
      this.logger.debug('Dropping all data')
      try {
        const result = await this.generateAxiosRequest({
          path: '/alter',
          data: '{"drop_op": "DATA"}',
        })
        this.logger.debug(JSON.stringify(result.data, null, 2))
        this.logger.debug(`${chalk.green('dropData')}: Operation successful.`)
        resolve(result)
      } catch (error) {
        this.logger.error(`${chalk.red('dropData')}: Operation failed.`)
        this.logger.debug(JSON.stringify(error, null, 2))
        reject(error)
      }
    })
  }
}
