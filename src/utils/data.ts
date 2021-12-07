import chalk from 'chalk'
import isEmpty from 'lodash/isEmpty'
import CloudGraph from '@cloudgraph/sdk'

import { StorageEngine } from '../storage/types'
import { scanReport, scanDataType, scanResult } from '../reports'

const { logger } = CloudGraph

export const getConnectedEntity = (
  service: any,
  { entities, connections: allConnections }: any,
  initiatorServiceName: string
): Record<string, unknown> => {
  // opts: Opts
  logger.debug(
    `Getting connected entities for ${chalk.green(
      initiatorServiceName
    )} id = ${chalk.green(service.id)}`
  )
  const connections = allConnections[service.id]
  const connectedEntity = {
    ...service,
  }
  let connectionsStatus = scanResult.pass
  if (connections) {
    for (const connection of connections) {
      const entityData = entities.find(
        ({ name }: { name: string }) => name === connection.resourceType
      )
      if (entityData && entityData.data) {
        const entityForConnection = entityData.data.find(
          ({ id }: { id: string }) => connection.id === id
        )
        if (!isEmpty(entityForConnection)) {
          if (!connectedEntity[connection.field]) {
            connectedEntity[connection.field] = []
          }
          connectedEntity[connection.field].push(entityForConnection)
          logger.debug(
            `(${initiatorServiceName}) ${service.id} ${chalk.green(
              '<----->'
            )} ${connection.id} (${connection.resourceType})`
          )
        } else {
          connectionsStatus = scanResult.warn
          const error = `Malformed connection found between ${chalk.red(
            initiatorServiceName
          )} && ${chalk.red(connection.resourceType)} services.`
          logger.warn(error)
          logger.warn(
            `(${initiatorServiceName}) ${service.id} ${chalk.red('<-///->')} ${
              connection.id
            } (${connection.resourceType})`
          )
        }
      }
    }
  }
  scanReport.pushData({
    service: initiatorServiceName,
    type: scanDataType.status,
    result: connectionsStatus,
  })
  return connectedEntity
}

export const processConnectionsBetweenEntities = (
  providerData: any,
  storageEngine: StorageEngine,
  storageRunning: boolean
): void => {
  for (const entity of providerData.entities) {
    const { mutation, data, name } = entity

    let connectedData

    if (data instanceof Array) {
      // eslint-disable-next-line no-loop-func
      connectedData = data.map((service: any) => {
        scanReport.pushData({
          service: name,
          type: scanDataType.count,
          result: scanResult.pass,
        })

        return getConnectedEntity(service, providerData, name)
      })
    } else {
      connectedData = data
    }

    if (storageRunning) {
      // Add service mutation to promises array
      storageEngine.push({
        query: mutation,
        connectedData,
        name,
      })
    }
  }
}
