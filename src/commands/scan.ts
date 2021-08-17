import chalk from 'chalk'
import ora from 'ora'
import fs from 'fs'
import path from 'path'
import { Opts } from '@cloudgraph/sdk'

import Command from './base'
import { fileUtils, getConnectedEntity } from '../utils'

// const dataDir = 'cg-data'
export default class Scan extends Command {
  static description = 'Scan one or multiple providers data to be queried through Dgraph';

  static examples = [
    '$ cg scan',
    '$ cg scan aws',
    '$ cg scan aws --dgraph http://localhost:1000 [Save data in dgraph running on port 1000]',
    '$ cg scan aws --no-serve [Do not start the query engine]'
  ];

  static strict = false

  static flags = {
    ...Command.flags,
  }

  static hidden = false

  static args = Command.args

  async run() {
    const {argv, flags: {dev: devMode}} = this.parse(Scan)
    // const dgraphHost = this.getDgraphHost()
    const opts: Opts = {logger: this.logger, debug: true, devMode}
    let allProviers = argv

    // Run dgraph health check
    const storageEngine = this.getStorageEngine()
    const storageRunning = await storageEngine.healthCheck()
    /**
     * Handle 2 methods of scanning, either for explicitly passed providers OR
     * try to scan for all providers found within the config file
     * if we still have 0 providers, fail and exit.
     */
    if (allProviers.length >= 1) {
      this.logger.debug(`Scanning for providers: ${allProviers}`)
    } else {
      this.logger.debug('Scanning for providers found in config')
      const config = this.getCGConfig()
      allProviers = Object.keys(config).filter(
        (val: string) => val !== 'cloudGraph'
      )
      if (allProviers.length === 0) {
        this.logger.error(
          'There are no providers configured and none were passed to scan'
        )
        this.exit()
      }
    }

    // Build folder structure for saving CloudGraph data by version
    const schema: any[] = []
    const promises: Promise<any>[] = []
    fileUtils.makeDirIfNotExists(this.versionDirectory)
    const folders = fileUtils.getVersionFolders(this.versionDirectory)
    let dataFolder = 'version-1'
    if (folders) {
      dataFolder = `version-${folders.length + 1}`
    }
    fileUtils.makeDirIfNotExists(`${this.versionDirectory}/${dataFolder}`)

    /**
     * loop through providers and attempt to scan each of them
     */
    for (const provider of allProviers) {
      this.logger.info(
        `Beginning ${chalk.italic.green('SCAN')} for ${provider}`
      )
      const client = await this.getProviderClient(provider)
      if (!client) {
        continue // eslint-disable-line no-continue
      }
      const config = this.getCGConfig(provider)
      this.logger.debug(config)

      const { accountId } = await client.getIdentity()
      const providerDataLoader = ora(
        `${chalk.italic.green('SCANING')} data for ${chalk.italic.green(
          provider
        )}`
      ).start()
      const providerData = await client.getData({
        opts,
      })
      providerDataLoader.succeed(
        `${chalk.italic.green(provider)} data scanned successfully`
      )

      // const allTagData: any[] = []
      const result: { entities: { name: any; data: any }[]; connections: any } =
        {
          entities: [],
          connections: {},
        }

      // Handle schema, write provider and combined schema to file and store in Dgraph if running
      const handleSchemaLoader = ora(
        `updating ${chalk.italic.green('Schema')} for ${chalk.italic.green(
          provider
        )}`
      ).start()
      const providerSchema: string = client.getSchema()
      if (!providerSchema) {
        this.logger.warn(`No schema found for ${provider}, moving on`)
        continue // eslint-disable-line no-continue
      }
      schema.push(providerSchema)
      fileUtils.writeGraphqlSchemaToFile(
        `${this.versionDirectory}/${dataFolder}`,
        providerSchema,
        provider
      )
      if (allProviers.indexOf(provider) === allProviers.length - 1) {
        fileUtils.writeGraphqlSchemaToFile(
          `${this.versionDirectory}/${dataFolder}`,
          schema.join()
        )
        if (storageRunning) {
          try {
            await storageEngine.setSchema(schema)
          } catch (error: any) {
            this.logger.debug(error)
            this.logger.error(
              `There was an issue pushing schema for providers: ${allProviers.join(
                ' | '
              )} to dgraph at ${storageEngine.host}`
            )
            fileUtils.deleteFolder(`${this.versionDirectory}/${dataFolder}`)
            this.exit()
          }
        }
      }
      handleSchemaLoader.succeed(
        `${chalk.italic.green(
          'Schema'
        )} loaded successfully for ${chalk.italic.green(provider)}`
      )

      /**
       * Loop through the aws sdk data to format entities and build connections
       * 1. Format data with provider service format function
       * 2. build connections for data with provider service connections function
       * 3. spread new connections over result.connections
       * 4. push the array of formatted entities into result.entites
       */
       const formatDataLoader = ora(
        `${chalk.italic.green('Formatting')} data for ${chalk.italic.green(
          provider
        )}`).start()
      for (const serviceData of providerData) {
        const serviceClass = client.getService(serviceData.name)
        const entities: any[] = []
        for (const region of Object.keys(serviceData.data)) {
          const data = serviceData.data[region]
          data.forEach((service: any) => {
            entities.push(
              serviceClass.format({
                service,
                region,
                account: accountId,
              })
            )
            if (typeof serviceClass.getConnections === 'function') {
              result.connections = {
                ...result.connections,
                ...serviceClass.getConnections({
                  service,
                  region,
                  account: accountId,
                  data: providerData,
                }),
              }
            }
          })
          result.entities.push({ name: serviceData.name, data: entities })
        }
      }
      try {
        fs.writeFileSync(
          path.join(
            process.cwd(),
            `${
              this.versionDirectory
            }/${dataFolder}/${provider}_${accountId}_${Date.now()}.json`
          ),
          JSON.stringify(result, null, 2)
        )
      } catch (error: any) {
        this.logger.error(`There was a problem saving data for ${provider}`)
        this.logger.debug(error)
        fileUtils.deleteFolder(`${this.versionDirectory}/${dataFolder}`)
        this.exit()
      }
      formatDataLoader.succeed(
        `Data formatted successfully for ${chalk.italic.green(provider)}`
      )

      /**
       * Loop through the result entities and for each entity:
       * Look in result.connections for [key = entity.arn]
       * Loop through the connections for entity and determine its resource type
       * Find entity in result.entites that matches the id found in connections
       * Build connectedEntity by pushing the matched entity into the field corresponding to that entity (alb.ec2Instance => [ec2Instance])
       * Push connected entity into dgraph
       */
      const connectionLoader = ora(
        `Making service connections for ${chalk.italic.green(provider)}`
      ).start()
      for (const entity of result.entities) {
        const { name, data } = entity
        const { mutation } = client.getService(name)
        const connectedData = data.map((service: any) =>
          // getConnectedEntity(service, result, opts)
          getConnectedEntity(service, result)
        )
        if (storageRunning) {
          const axiosPromise = storageEngine.push({
            query: mutation,
            variables: {
              input: connectedData,
            },
          })
          promises.push(axiosPromise)
        }
      }
      connectionLoader.succeed(
        `Connections made successfully for ${chalk.italic.green(provider)}`
      )
    }
    await Promise.all(promises)
    const resultLog = storageRunning ? `saved to Dgraph. Query at ${chalk.underline.green(
      `${storageEngine.host}/graphql`)}` : 'saved to the versions directory'
    this.logger.success(
      `Your data for ${allProviers.join(
        ' | '
      )} has been ${resultLog}`
    )
    storageRunning && await this.startQueryEngine()
    this.exit()
  }
}
