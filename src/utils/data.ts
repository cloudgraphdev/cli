import chalk from 'chalk'
import isEmpty from 'lodash/isEmpty'
import CloudGraph, {
  ProviderData,
  StorageEngine,
  SchemaMap,
  ServiceConnection,
  Client,
  Logger,
  EntityMutations,
} from '@cloudgraph/sdk'

import { scanReport, scanDataType, scanResult } from '../reports'
import { generateMutation, generateUpdateVarsObject } from './mutation'
import { DataToLoad } from '../types'

const { logger } = CloudGraph

/**
 * Filters connections acording to the afterNodeInsertion boolean
 * this is used to filter connections that need to:
 * 1. Be inserted in the add mutation, afterNodeInsertion = false
 * 2. Be inserted in the patch mutation, afterNodeInsertion = true
 */
export const filterConnectionsByPriorityOfInsertion = (
  connections: { [key: string]: ServiceConnection[] },
  afterNodeInsertion: boolean
): { [key: string]: ServiceConnection[] } => {
  const filteredConnections: { [key: string]: ServiceConnection[] } = {}
  Object.entries(connections).map(([id, sConnections]) => {
    const fConnections = sConnections.filter(
      (i: ServiceConnection) =>
        !!i.insertAfterNodeInsertion === afterNodeInsertion
    )
    if (!isEmpty(fConnections)) {
      filteredConnections[id] = fConnections
    }
  })
  return filteredConnections
}
// the afterNodeInsertion flag provides input
// to whether filter connections that need to be inserted
// in the main add mutation(batch mutation, that pushes fresh nodes and connections)
// or in the patch mutation(list of mutations that patches each node and its connections with others)
export function getConnectedEntity(
  service: any,
  { entities, connections: allConnections }: ProviderData,
  initiatorServiceName: string,
  afterNodeInsertion = false
): Record<string, unknown> {
  logger.debug(
    `Getting connected entities for ${chalk.green(
      initiatorServiceName
    )} id = ${chalk.green(service.id)}`
  )
  const connections: ServiceConnection[] =
    filterConnectionsByPriorityOfInsertion(allConnections, afterNodeInsertion)[
      service.id
    ]
  const connectedEntity: any = { ...(afterNodeInsertion ? {} : service) }
  let connectionsStatus = scanResult.pass
  if (!isEmpty(connections)) {
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

export const processConnectionsBetweenEntities = ({
  provider,
  providerData,
  storageEngine,
  storageRunning,
  schemaMap,
}: {
  provider?: string
  providerData: ProviderData
  storageEngine: StorageEngine
  storageRunning: boolean
  schemaMap?: SchemaMap
}): void => {
  for (const entity of providerData.entities) {
    const { data, name, mutation } = entity

    let connectedData

    if (data instanceof Array) {
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
      const query: string =
        (mutation as EntityMutations)?.upsert || (mutation as string)
      storageEngine.push({
        query:
          query ||
          (provider &&
            generateMutation({ type: 'add', provider, entity, schemaMap })) ||
          '',
        input: connectedData,
        name,
      })
    }
  }
}

export function insertEntitiesAndConnections({
  provider,
  providerData,
  storageEngine,
  storageRunning,
  schemaMap,
}: DataToLoad): void {
  for (const entity of providerData.entities) {
    try {
      const { data, mutation, name } = entity
      const connectedData = data.map((service: any) => {
        scanReport.pushData({
          service: name,
          type: scanDataType.count,
          result: scanResult.pass,
        })
        return getConnectedEntity(service, providerData, name)
      })
      if (storageRunning) {
        const query: string =
          (mutation as EntityMutations)?.upsert || (mutation as string)
        storageEngine.push({
          query:
            query ||
            generateMutation({ type: 'add', provider, entity, schemaMap }) ||
            '',
          input: connectedData,
          name,
        })
      }
    } catch (error) {
      logger.debug(error)
    }
  }
}

export function processConnectionsAfterInitialInsertion({
  provider,
  providerData,
  storageEngine,
  storageRunning,
  schemaMap,
}: DataToLoad): void {
  const additionalConnections: {
    [key: string]: ServiceConnection[]
  } = filterConnectionsByPriorityOfInsertion(providerData.connections, true)
  if (!isEmpty(additionalConnections)) {
    // Filter resourceTypes that have additional connections to process
    const resourcesWithAdditionalConnections = new Set(
      Object.values(additionalConnections)
        .flat()
        .map(({ resourceType }) => resourceType)
    )
    // Filter entities that match filtered resourceTypes
    const entities = providerData.entities.filter(({ name }) =>
      resourcesWithAdditionalConnections.has(name)
    )
    for (const entity of entities) {
      try {
        const { data, name } = entity
        data.map((service: any) => {
          const connections = getConnectedEntity(
            service,
            providerData,
            name,
            true
          )
          if (!isEmpty(connections)) {
            if (storageRunning) {
              const query = generateMutation({
                type: 'update',
                provider,
                entity,
                schemaMap,
              })
              const patch = generateUpdateVarsObject(service, connections)
              // Add service mutation to promises array
              storageEngine.push({ query, patch, name })
            }
          }
        })
      } catch (error) {
        logger.debug(error)
      }
    }
  }
}

export const loadAllData = (
  providerClient: Client,
  data: DataToLoad,
  loggerInstance: Logger
): void => {
  loggerInstance.startSpinner(
    `Inserting entities and connections for ${chalk.italic.green(
      data.provider
    )}`
  )
  insertEntitiesAndConnections(data)
  loggerInstance.successSpinner(
    `Entities and connections inserted successfully for ${chalk.italic.green(
      data.provider
    )}`
  )
  loggerInstance.startSpinner(
    `Processing additional service connections for ${chalk.italic.green(
      data.provider
    )}`
  )
  processConnectionsAfterInitialInsertion(data)
  loggerInstance.successSpinner(
    `Additional connections processed successfully for ${chalk.italic.green(
      data.provider
    )}`
  )
}
