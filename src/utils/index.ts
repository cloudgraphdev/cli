// import CloudGraph, { Opts } from '@cloudgraph/sdk'
import CloudGraph from '@cloudgraph/sdk'
import { loadFilesSync } from '@graphql-tools/load-files'
import boxen from 'boxen'
import CFonts from 'cfonts'
import chalk from 'chalk'
import fs from 'fs'
import glob from 'glob'
import path from 'path'

const { logger } = CloudGraph

export const getKeyByValue = (object: any, value: any) => {
  return Object.keys(object).find(key => object[key] === value)
}

export function moduleIsAvailable(path: string) {
  try {
    require.resolve(path)
    return true
  } catch (error) {
    return false
  }
}

export function getProviderDataFile(dirPath: string, provider: string): string | void {
  const fileGlob = `${dirPath}${provider}*.json`
  const fileArray = glob.sync(fileGlob)
  if (fileArray && fileArray.length > 0) {
    return fileArray[0]
  }
}

const mapFileNameToHumanReadable = (file: string): string => {
  const fileNameParts = file.split('/')
  const fileName = fileNameParts[fileNameParts.length - 1]
  const [providerName, providerIdentity, timestamp] = fileName
    .replace('.json', '')
    .split('_')
  return `${providerName} ${providerIdentity} ${new Date(
    Number(timestamp)
  ).toISOString()}`
}

// TODO: this could be refactored to go right to the correct version folder (avoid line 70)
// if we extracted the version part of the url and passed to this func
const findProviderFileLocation = (file: string, directory: string): string => {
  const [providerName, providerIdentity, date] = file.trim().split(' ')
  const fileName = `${providerName}_${providerIdentity}_${Date.parse(date)}`
  const fileGlob = path.join(
    process.cwd(),
    `${directory}/version-*/${fileName}.json`
  )
  const fileArray = glob.sync(fileGlob)
  if (fileArray && fileArray.length > 0) {
    return fileArray[0]
  }
  return ''
}

export function makeDirIfNotExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
}

export function writeGraphqlSchemaToFile(
  dirPath: string,
  schema: string,
  provider?: string
) {
  makeDirIfNotExists(dirPath)
  fs.writeFileSync(
    path.join(
      process.cwd(),
      provider
        ? `${dirPath}/${provider}_schema.graphql`
        : `${dirPath}/schema.graphql`
    ),
    schema
  )
}

export function getConnectedEntity(
  service: any,
  { entities, connections: allConnections }: any
) {
  // opts: Opts
  logger.debug(`getting connected entity for id = ${service.id}`)
  const connections = allConnections[service.id]
  const connectedEntity = {
    ...service,
  }
  if (connections) {
    for (const connection of connections) {
      logger.debug(
        `searching for ${connection.resourceType} entity data to make connection between ${service.id} && ${connection.resourceType}`
      )
      const entityData = entities.find(
        ({ name }: { name: string }) => name === connection.resourceType
      )
      if (entityData && entityData.data) {
        const entityForConnection = entityData.data.find(
          ({ id }: { id: string }) => connection.id === id
        )
        connectedEntity[connection.field] = entityForConnection
      }
    }
  }
  return connectedEntity
}

export async function printWelcomeMessage(): void {
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

export function getVersionFolders(directory: string, provider?: string) {
  const folderGlob = path.join(process.cwd(), `${directory}/version-*/`)
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
        (
          a: { name: string; ctime: Date },
          b: { name: string; ctime: Date }
        ) => a.ctime.getTime() - b.ctime.getTime()
      )
  }
  return []
}

export function getSchemaFromFolder(dirPath: string, provider?: string) {
  return loadFilesSync(path.join(dirPath, provider ? `${provider}*` : ''), {
    extensions: ['graphql'],
  })
}

export function deleteFolder(dirPath: string) {
  fs.rmSync(dirPath, {recursive: true})
}

export const fileUtils = {
  mapFileNameToHumanReadable,
  makeDirIfNotExists,
  writeGraphqlSchemaToFile,
  getVersionFolders,
  findProviderFileLocation,
  getSchemaFromFolder,
  getProviderDataFile,
  deleteFolder,
}
