import {Opts} from 'cloud-graph-sdk'

const boxen = require('boxen')
const CFonts = require('cfonts')
const chalk = require('chalk')
const fs = require('fs')
const glob = require('glob')
const path = require('path')

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

export function getLatestProviderData(provider: string) {
  const fileGlob = path.join(process.cwd(), `cg-data/${provider}*.json`)
  const files = glob.sync(fileGlob)
  if (files && files.length > 0) {
    return files
    .map((name: string) => ({name, ctime: fs.statSync(name).ctime}))
    .sort((a: {name: string; ctime: number}, b: {name: string; ctime: number}) => b.ctime - a.ctime)
  }
  throw new Error('no data for provider')
}

// TODO: convert to a debug or verbose logger
// export function getDebugLogger(debug: boolean): pino.Logger {
//   if (!debug && process.env.NODE_ENV !== 'development') {
//     return pino({enabled: false})
//   }
//   return pino({ name: 'cloud-graph', prettyPrint: process.env.NODE_ENV === 'development' })
// }

const mapFileNameToHumanReadable = (file: string): string => {
  const fileNameParts = file.split('/')
  const fileName = fileNameParts[fileNameParts.length - 1]
  const [providerName, providerIdentity, timestamp] = fileName.replace('.json', '').split('_')
  return `${providerName} ${providerIdentity} ${new Date(Number(timestamp)).toISOString()}`
}

const mapFileSelectionToLocation = (file: string): string => {
  const [providerName, providerIdentity, date] = file.split(' ')
  const location = `${providerName}_${providerIdentity}_${Date.parse(date)}`
  return path.join(process.cwd(), `cg-data/${location}.json`)
}

export function makeDirIfNotExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
}

export function writeGraphqlSchemaToFile(schema: Array<string>, provider?: string) {
  const dir = 'cg-schemas'
  makeDirIfNotExists(dir)
  fs.writeFileSync(
    path.join(process.cwd(), provider ? `${dir}/${provider}_schema.graphql` : `${dir}/schema.graphql`),
    schema.join()
  )
}

export function getConnectedEntity(service: any, {entities, connections: allConnections}: any, opts: Opts) {
  opts.logger.log(`getting connected entity for id = ${service.id}`, {verbose: true})
  const connections = allConnections[service.id]
  const connectedEntity = {
    ...service,
  }
  if (connections) {
    for (const connection of connections) {
      opts.logger.log(
        `searching for ${connection.resourceType} entity data to make connection between ${service.id} && ${connection.resourceType}`
        , {verbose: true})
      const entityData = entities.find(
        ({name}: {name: string}) => name === connection.resourceType
      )
      if (entityData && entityData.data) {
        const entityForConnection = entityData.data.find(
          ({id}: { id: string }) => connection.id === id
        )
        connectedEntity[connection.field] = entityForConnection
      }
    }
  }
  return connectedEntity
}

export async function printWelcomeMessage() {
  CFonts.say('Welcome to|CloudGraph!', {
    font: 'chrome',
    colors: ['greenBright', 'greenBright', 'greenBright'],
    lineHight: 3,
    align: 'center',
  })
  console.log(boxen(chalk.italic.green('By AutoCloud'), {
    borderColor: 'green',
    align: 'center',
    borderStyle: 'singleDouble',
    float: 'center',
    padding: 1,
  }))
}

export const fileUtils = {
  mapFileNameToHumanReadable,
  mapFileSelectionToLocation,
  makeDirIfNotExists,
  writeGraphqlSchemaToFile,
}

