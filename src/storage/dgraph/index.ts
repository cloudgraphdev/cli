import { Logger } from '@cloudgraph/sdk'
import axios from 'axios'
import chalk from 'chalk'
import { GraphQLError, ExecutionResult } from 'graphql'
import isEmpty from 'lodash/isEmpty'

import {
  GraphQLFormattedQuery,
  GraphQLInputData,
  StorageEngine,
  StorageEngineConfig,
} from '../types'

const UPDATE_SCHEMA_QUERY = `
mutation($schema: String!) {
  updateGQLSchema(input: { set: { schema: $schema } }) {
    gqlSchema {
      schema
    }
  }
}`

export default class DgraphEngine implements StorageEngine {
  constructor(config: StorageEngineConfig) {
    this.connectionHost = config.host
    this.logger = config.logger
    this.axiosPromises = []
  }

  connectionHost: string

  logger: Logger

  axiosPromises: (() => Promise<void>)[]

  // set host(host: string) {
  //   if (host) {
  //     return host
  //   }
  //   if (process.env.DGRAPH_HOST) {
  //     return process.env.DGRAPH_HOST
  //   }
  // }
  async healthCheck(showInitialStatus = true): Promise<boolean> {
    showInitialStatus &&
      this.logger.debug(`running dgraph health check at ${this.host}`)
    try {
      const healthCheck = await axios({
        url: `${this.host}/health?all`,
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      this.logger.debug(JSON.stringify(healthCheck.data))
      return true
    } catch (error: any) {
      this.logger.warn(
        `dgraph at ${this.host} failed health check. Is dgraph running?`
      )
      this.logger.debug(JSON.stringify(error))
      return false
    }
  }

  get host(): string {
    return this.connectionHost
  }

  async validateSchema(schema: string[], versionString: string): Promise<void> {
    const versionCaption = versionString.split('-').join(' ')
    this.logger.debug(`Validating Schema for ${versionCaption}`)
    return new Promise<void>(async (resolve, reject) => {
      try {
        await axios({
          url: `${this.host}/admin/schema/validate`,
          method: 'post',
          data: schema.join(),
          headers: {
            'Content-Type': 'text/plain',
          },
        })
        resolve()
      } catch (error: any) {
        const {
          response: {
            data: { errors },
          },
        } = error
        this.logger.error('Schema validation failed')
        const errMsgs = errors.map((e: Error) =>
          e.message.replace('input:', 'line ')
        )
        this.logger.error(
          `${
            errMsgs.length
          } errors found in ${versionCaption} schema. Check the following lines in the schema.graphql file:\n${errMsgs.join(
            '\n'
          )}`
        )
        reject()
      }
    })
  }

  async setSchema(schemas: string[]): Promise<void> {
    const data = {
      query: UPDATE_SCHEMA_QUERY,
      variables: {
        schema: schemas.join(),
      },
    }
    try {
      await axios({
        url: `${this.host}/admin`,
        method: 'post',
        data,
      })
        .then((res: ExecutionResult) => {
          const { data: resData, errors } = res
          this.processGQLExecutionResult({ reqData: data, resData, errors })
        })
        .catch(error => Promise.reject(error))
    } catch (error: any) {
      const {
        response: { data: resData, errors },
        message,
      } = error
      this.logger.error(
        'There was an issue pushing the schema into the Dgraph db'
      )
      this.logger.debug(message)
      this.processGQLExecutionResult({ reqData: data, resData, errors })
    }
  }

  /**
   * Add Service Mutation to axiosPromises Array
   */
  push(data: GraphQLInputData): void {
    const { query, connectedData } = data
    const queryData = {
      query,
      variables: {
        input: connectedData,
      },
    }
    this.axiosPromises.push(() =>
      axios({
        url: `${this.host}/graphql`,
        method: 'post',
        data: queryData,
      })
        .then((res: ExecutionResult) => {
          const { data: resData, errors } = res
          this.processGQLExecutionResult({
            reqData: queryData,
            resData,
            errors,
          })
        })
        .catch(error => Promise.reject(error))
    )
  }

  /**
   * Executes mutations sequentially into Dgraph
   */
  async run(): Promise<void> {
    for (const mutation of this.axiosPromises) {
      try {
        await mutation()
      } catch (error: any) {
        const {
          response: { data: resData, errors },
          message,
        } = error
        this.logger.error('There was an issue pushing data into the Dgraph db')
        this.logger.debug(message)
        this.processGQLExecutionResult({ resData, errors })
      }
    }
  }

  private processGQLExecutionResult({
    errors: resErrors,
    reqData = { query: '', variables: {} },
    resData,
  }: {
    errors?: ReadonlyArray<GraphQLError>
    reqData?: GraphQLFormattedQuery
    resData?: { [key: string]: any } | null
  }): void {
    // Data interpolated to query. Works for both schema push and data load
    const { variables } = reqData
    if (resData && !resErrors) {
      const { data: mutationResultData, errors: dataErrors } = resData
      let executedMutationNames: string[] = []
      if (!isEmpty(mutationResultData)) {
        executedMutationNames = Object.keys(mutationResultData) || []
        executedMutationNames.forEach(mutationName => {
          if (mutationResultData[mutationName]) {
            const { numUids } = mutationResultData[mutationName]
            const numUidsString = numUids ? `numUids affected: ${numUids}` : ''
            this.logger.debug(
              `mutation ${chalk.green(
                mutationName
              )} completed successfully. ${numUidsString}`
            )
          }
        })
      }
      this.processErrorArrayIfExists({
        errors: dataErrors,
        variables,
        additionalInfo: { executedMutationNames },
      })
    }
    // Data related errors
    this.processErrorArrayIfExists({ errors: resErrors, variables })
  }

  private processErrorArrayIfExists({
    errors,
    variables,
    additionalInfo,
  }: {
    errors?: ReadonlyArray<GraphQLError>
    variables: any
    additionalInfo?: { executedMutationNames?: string[] }
  }): void {
    if (errors) {
      errors.forEach((err: GraphQLError) => {
        const { path, locations, message, extensions = {} } = err
        this.printErrorMessage(message, additionalInfo)
        // Sometimes dgraph can provide extra information about an error
        extensions.code &&
          this.logger.debug(`Additional error info: ${extensions.code}`)
        // Happens when data to load into Dgraph fails to pass the schema validation
        path &&
          this.logger.debug(`Additional path info: ${JSON.stringify(path)}`)
        if (path?.[0] && path?.[1] && path?.[2]) {
          if (path[0] === 'variable') {
            if (path[1] === 'input') {
              if (typeof path[2] === 'number') {
                this.logger.debug(variables[path[1]][path[2]][path[3]])
              }
            }
          }
        }
        // Errors that can be schema format/syntax errors
        locations &&
          this.logger.debug(
            `Additional location info: ${JSON.stringify(locations)}`
          )
      })
    }
  }

  // Look for mutation name and color it red
  private printErrorMessage(message: string, additionalInfo: any): void {
    let messageToShow = message
    const found = additionalInfo?.executedMutationNames?.find((v: string) =>
      message.includes(v)
    )
    if (found) {
      messageToShow = message.replace(found, chalk.red(found))
    }
    messageToShow && this.logger.error(messageToShow)
  }
}
