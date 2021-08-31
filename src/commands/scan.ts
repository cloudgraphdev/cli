import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import { Opts } from '@cloudgraph/sdk'

import Command from './base'
import { fileUtils, getConnectedEntity } from '../utils'

export default class Scan extends Command {
  static description =
    'Scan one or multiple providers data to be queried through Dgraph'

  static examples = [
    '$ cg scan',
    '$ cg scan aws',
    '$ cg scan aws --dgraph http://localhost:1000 [Save data in dgraph running on port 1000]',
    '$ cg scan aws --no-serve [Do not start the query engine]',
  ]

  static strict = false

  static flags = {
    ...Command.flags,
  }

  static hidden = false

  static args = Command.args

  async run() {
    const {
      argv,
      flags: { dev: devMode },
    } = this.parse(Scan)
    const { dataDir } = this.config
    const opts: Opts = { logger: this.logger, debug: true, devMode }
    let allProviders = argv

    // Run dgraph health check
    const storageEngine = this.getStorageEngine()
    const storageRunning = await storageEngine.healthCheck()
    /**
     * Handle 2 methods of scanning, either for explicitly passed providers OR
     * try to scan for all providers found within the config file
     * if we still have 0 providers, fail and exit.
     */
    if (allProviders.length >= 1) {
      this.logger.debug(`Scanning for providers: ${allProviders}`)
    } else {
      this.logger.debug('Scanning for providers found in config')
      const config = this.getCGConfig()
      allProviders = Object.keys(config).filter(
        (val: string) => val !== 'cloudGraph'
      )
      if (allProviders.length === 0) {
        this.logger.error(
          'There are no providers configured and none were passed to scan'
        )
        this.exit()
      }
    }

    // Build folder structure for saving CloudGraph data by version
    const schema: any[] = []
    const folders = fileUtils.getVersionFolders(
      path.join(dataDir, this.versionDirectory)
    )
    let dataFolder = 'version-1'
    if (folders) {
      dataFolder = `version-${folders.length + 1}`
    }
    const dataStorageLocation = path.join(
      dataDir,
      `${this.versionDirectory}/${dataFolder}`
    )
    fileUtils.makeDirIfNotExists(dataStorageLocation)

    /**
     * loop through providers and attempt to scan each of them
     */
    for (const provider of allProviders) {
      this.logger.info(
        `Beginning ${chalk.italic.green('SCAN')} for ${provider}`
      )
      const client = await this.getProviderClient(provider)
      if (!client) {
        this.logger.warn(`No valid client found for ${provider}, skipping...`)
        continue // eslint-disable-line no-continue
      }
      const config = this.getCGConfig(provider)
      this.logger.debug(config)

      const { accountId } = await client.getIdentity()
      const providerDataLoader = this.logger.startSpinner(
        `${chalk.italic.green('SCANNING')} data for ${chalk.italic.green(
          provider
        )}`
      )
      const providerData = await client.getData({
        opts,
      })
      providerDataLoader.succeed(
        `${chalk.italic.green(provider)} data scanned successfully`
      )

      // Handle schema, write provider and combined schema to file and store in Dgraph if running
      const handleSchemaLoader = this.logger.startSpinner(
        `updating ${chalk.italic.green('Schema')} for ${chalk.italic.green(
          provider
        )}`
      )
      const providerSchema: string = client.getSchema()
      if (!providerSchema) {
        this.logger.warn(`No schema found for ${provider}, moving on`)
        continue // eslint-disable-line no-continue
      }
      schema.push(providerSchema)
      fileUtils.writeGraphqlSchemaToFile(
        dataStorageLocation,
        providerSchema,
        provider
      )
      if (allProviders.indexOf(provider) === allProviders.length - 1) {
        fileUtils.writeGraphqlSchemaToFile(dataStorageLocation, schema.join())
        if (storageRunning) {
          try {
            await storageEngine.setSchema(schema)
          } catch (error: any) {
            this.logger.debug(error)
            this.logger.error(
              `There was an issue pushing schema for providers: ${allProviders.join(
                ' | '
              )} to dgraph at ${storageEngine.host}`
            )
            fileUtils.deleteFolder(dataStorageLocation)
            this.exit()
          }
        }
      }
      handleSchemaLoader.succeed(
        `${chalk.italic.green(
          'Schema'
        )} loaded successfully for ${chalk.italic.green(provider)}`
      )

      try {
        const dataPath = path.join(
          dataStorageLocation,
          `/${provider}_${accountId}_${Date.now()}.json`
        )
        fs.writeFileSync(dataPath, JSON.stringify(providerData, null, 2))
      } catch (error: any) {
        this.logger.error(`There was a problem saving data for ${provider}`)
        this.logger.debug(error)
        fileUtils.deleteFolder(dataStorageLocation)
        this.exit()
      }

      const connectionLoader = this.logger.startSpinner(
        `Making service connections for ${chalk.italic.green(provider)}`
      )
      for (const entity of providerData.entities) {
        const { mutation, data } = entity
        const connectedData = data.map((service: any) =>
          getConnectedEntity(service, providerData)
        )
        if (storageRunning) {
          // Add service mutation to promises array
          storageEngine.push({
            query: mutation,
            variables: {
              input: connectedData,
            },
          })
        }
      }
      connectionLoader.succeed(
        `Connections made successfully for ${chalk.italic.green(provider)}`
      )
    }

    // Execute services mutations promises
    await storageEngine.run()

    this.logger.success(
      `Your data for ${allProviders.join(' | ')} has been saved to ${chalk.italic.green(dataStorageLocation)}`
    )
    if (storageRunning) {
      this.logger.success(
        `Your data for ${allProviders.join(
          ' | '
        )} has been saved to Dgraph. Query at ${chalk.underline.green(
          `${storageEngine.host}/graphql`
        )}`
      )
    }
    storageRunning && (await this.startQueryEngine())
    this.exit()
  }
}
