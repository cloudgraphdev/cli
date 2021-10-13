// import CloudGraph, { Opts } from '@cloudgraph/sdk'
import CloudGraph from '@cloudgraph/sdk'
import boxen from 'boxen'
import CFonts from 'cfonts'
import chalk from 'chalk'
import { exec } from 'child_process'
import fs from 'fs'
import glob from 'glob'
import path from 'path'
import isEmpty from 'lodash/isEmpty'
import detect from 'detect-port'

import scanReport, { scanDataType, scanResult } from '../scanReport'
import C, { DEFAULT_CONFIG, DGRAPH_CONTAINER_LABEL } from '../utils/constants'
import { StorageEngine, StorageEngineConnectionConfig } from '../storage/types'

const { logger } = CloudGraph

export const getKeyByValue = (
  object: Record<string, unknown>,
  value: any
): string | undefined => {
  return Object.keys(object).find(key => object[key] === value)
}

export function moduleIsAvailable(modulePath: string): boolean {
  try {
    require.resolve(modulePath)
    return true
  } catch (error) {
    return false
  }
}

export function getProviderDataFile(
  dirPath: string,
  provider: string
): string | void {
  const fileGlob = `${dirPath}${provider}*.json`
  const fileArray = glob.sync(fileGlob)
  if (fileArray && fileArray.length > 0) {
    return fileArray[0]
  }
}

const mapFileNameToHumanReadable = (file: string): string => {
  const fileNameParts = file.split('/')
  const fileName = fileNameParts[fileNameParts.length - 1]
  const [providerName, timestamp] = fileName.replace('.json', '').split('_')
  return `${providerName} ${new Date(Number(timestamp)).toISOString()}`
}

// TODO: this could be refactored to go right to the correct version folder (avoid line 70)
// if we extracted the version part of the url and passed to this func
const findProviderFileLocation = (directory: string, file: string): string => {
  const [providerName, date] = file.trim().split(' ')
  const fileName = `${providerName}_${Date.parse(date)}`
  const fileGlob = path.join(directory, `/version-*/${fileName}.json`)
  const fileArray = glob.sync(fileGlob)
  if (fileArray && fileArray.length > 0) {
    return fileArray[0]
  }
  return ''
}

export function makeDirIfNotExists(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

export function writeGraphqlSchemaToFile(
  dirPath: string,
  schema: string,
  provider?: string
): void {
  makeDirIfNotExists(dirPath)
  fs.writeFileSync(
    path.join(
      dirPath,
      provider ? `/${provider}_schema.graphql` : '/schema.graphql'
    ),
    schema
  )
}

export function getConnectedEntity(
  service: any,
  { entities, connections: allConnections }: any,
  initiatorServiceName: string
): Record<string, unknown> {
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

export function processConnectionsBetweenEntities(
  providerData: any,
  storageEngine: StorageEngine,
  storageRunning: boolean
): void {
  for (const entity of providerData.entities) {
    const { mutation, data, name } = entity
    const connectedData = data.map((service: any) => {
      scanReport.pushData({
        service: name,
        type: scanDataType.count,
        result: scanResult.pass,
      })
      return getConnectedEntity(service, providerData, name)
    })
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

export function printWelcomeMessage(): void {
  CFonts.say('Welcome to|CloudGraph!', {
    font: 'grid',
    colors: ['#666EE8', '#B8FFBD', '#B8FFBD'],
    lineHight: 3,
    align: 'center',
  })
  console.log(
    boxen(chalk.italic.green('By AutoCloud'), {
      borderColor: 'green',
      align: 'center',
      borderStyle: 'singleDouble',
      float: 'center',
      padding: 1,
    })
  )
}

export function printBoxMessage(msg: string): void {
  console.log(
    boxen(msg, {
      borderColor: 'green',
    })
  )
}

export function getVersionFolders(
  directory: string,
  provider?: string
): { name: string; ctime: Date }[] {
  const folderGlob = path.join(directory, '/version-*/')
  const folders = glob.sync(folderGlob)
  if (folders && folders.length > 0) {
    return folders
      .map((name: string) => ({ name, ctime: fs.statSync(name).ctime }))
      .filter(({ name }: { name: string }) => {
        if (provider) {
          const filesInFolder = glob.sync(`${name}**/*`)
          if (
            filesInFolder.find((val: string) =>
              val.includes(`${provider}_schema.graphql`)
            )
          ) {
            return true
          }
          return false
        }
        return true
      })
      .sort(
        (a: { name: string; ctime: Date }, b: { name: string; ctime: Date }) =>
          a.ctime.getTime() - b.ctime.getTime()
      )
  }
  return []
}

export function deleteFolder(dirPath: string): void {
  fs.rmSync(dirPath, { recursive: true })
}

export const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms))

export const calculateBackoff = (n: number): number => {
  const temp = Math.min(
    C.BASE_BACKOFF_CONSTANT ** n + Math.random(),
    C.MAX_BACKOFF_DELAY
  )
  return (
    temp / C.BASE_BACKOFF_CONSTANT +
    Math.min(0, (Math.random() * temp) / C.BASE_BACKOFF_CONSTANT)
  )
}

export const getPort = (
  hostname: string,
  scheme: string,
  port?: string
): string => {
  if (hostname !== 'localhost' && !port) {
    switch (scheme) {
      case 'http':
        return '80'
      case 'https':
        return '443'
      default:
        return '80'
    }
  }

  if (port) {
    return port
  }

  return DEFAULT_CONFIG.port
}

export const getDefaultStorageEngineConnectionConfig =
  (): typeof DEFAULT_CONFIG => DEFAULT_CONFIG

export const getDefaultEndpoint = (): string =>
  `${DEFAULT_CONFIG.scheme}://${DEFAULT_CONFIG.host}:${DEFAULT_CONFIG.port}`

export const getStorageEngineConnectionConfig = (
  fullUrl: string = getDefaultEndpoint()
): StorageEngineConnectionConfig => {
  const { hostname: host, port, protocol } = new URL(fullUrl)
  const scheme = protocol.split(':')[0]
  return {
    host,
    port: getPort(host, protocol, port),
    scheme,
  }
}

export const execCommand = (cmd: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error: any, stdout: any, stderr: any) => {
      if (error) {
        reject(error)
      }
      resolve(stdout || stderr)
    })
  })
}

export const findExistingDGraphContainerId = async (
  statusFilter: string
): Promise<string> => {
  let result: string
  let stdout: any
  stdout = await execCommand(
    `docker ps --filter label=${DGRAPH_CONTAINER_LABEL} --filter status=${statusFilter} --quiet`
  )
  result = stdout.trim()
  if (!result) {
    stdout = await execCommand(
      `docker ps --filter name=dgraph --filter status=${statusFilter} --quiet`
    )
    result = stdout.trim()
  }
  return result
}

export const fileUtils = {
  mapFileNameToHumanReadable,
  makeDirIfNotExists,
  writeGraphqlSchemaToFile,
  getVersionFolders,
  findProviderFileLocation,
  getProviderDataFile,
  deleteFolder,
}

export const getNextPort = async (port: number): Promise<string> => {
  const availablePort = await detect(port)
  return String(availablePort)
}
