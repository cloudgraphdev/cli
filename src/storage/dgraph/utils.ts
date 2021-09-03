import CloudGraph from '@cloudgraph/sdk'
import chalk from 'chalk'
import isEmpty from 'lodash/isEmpty'
import { GraphQLError } from 'graphql'

import { GraphQLFormattedQuery } from '../types'

const { logger } = CloudGraph

export const UPDATE_SCHEMA_QUERY = `
mutation($schema: String!) {
  updateGQLSchema(input: { set: { schema: $schema } }) {
    gqlSchema {
      schema
    }
  }
}`

// Look for mutation name and color it red
function printErrorMessage(message: string, additionalInfo: any): void {
  let messageToShow = message
  const found = additionalInfo?.executedMutationNames?.find((v: string) =>
    message.includes(v)
  )
  if (found) {
    messageToShow = message.replace(found, chalk.red(found))
  }
  messageToShow && logger.error(messageToShow)
}

function processErrorArrayIfExists({
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
      printErrorMessage(message, additionalInfo)
      // Sometimes dgraph can provide extra information about an error
      extensions.code &&
        logger.debug(`Additional error info: ${extensions.code}`)
      // Happens when data to load into Dgraph fails to pass the schema validation
      path && logger.debug(`Additional path info: ${JSON.stringify(path)}`)
      if (path?.[0] && path?.[1] && path?.[2]) {
        if (path[0] === 'variable') {
          if (path[1] === 'input') {
            if (typeof path[2] === 'number') {
              logger.debug(variables[path[1]][path[2]][path[3]])
            }
          }
        }
      }
      // Errors that can be schema format/syntax errors
      locations &&
        logger.debug(
          `Additional location info: ${JSON.stringify(locations, null, 2)}`
        )
    })
  }
}

export function processGQLExecutionResult({
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
          logger.debug(
            `mutation ${chalk.green(
              mutationName
            )} completed successfully. ${numUidsString}`
          )
        }
      })
    }
    processErrorArrayIfExists({
      errors: dataErrors,
      variables,
      additionalInfo: { executedMutationNames },
    })
  }
  // Data related errors
  processErrorArrayIfExists({ errors: resErrors, variables })
}
