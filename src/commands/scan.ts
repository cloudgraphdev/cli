import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import { Opts } from '@cloudgraph/sdk'
import { groupBy, isEmpty, range } from 'lodash'

import Command from './base'
import { fileUtils, processConnectionsBetweenEntities } from '../utils'
import DgraphEngine from '../storage/dgraph'
import { scanReport, rulesReport } from '../reports'
import { mergeSchemas } from '../utils/schema'

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
      flags: { dev: devMode, policies: policyPacks = '' },
    } = this.parse(Scan)
    const { dataDir } = this.config
    const opts: Opts = { logger: this.logger, debug: true, devMode }
    let allProviders = argv
    const policyPacksPlugins: { [policyPackName: string]: any } = {}

    // Run dgraph health check
    const storageEngine = this.getStorageEngine() as DgraphEngine
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
    let folders = fileUtils.getVersionFolders(
      path.join(dataDir, this.versionDirectory)
    )
    let dataFolder = 'version-1'

    if (folders.length >= this.versionLimit) {
      this.logger.warn(
        `Maximum number of data versions has been reached, deleting version-1 and creating a new version-${this.versionLimit}`
      )
      // version 1 gets deleted, version 2 becomes version 1 … new version gets created
      const pathPrefix = path.join(dataDir, this.versionDirectory)
      const versionPrefix = path.join(pathPrefix, 'version-')
      for (const version of [
        1,
        ...range(this.versionLimit + 1, folders.length + 1),
      ]) {
        fs.rmSync(versionPrefix + version, { recursive: true })
      }
      for (const version of range(1, this.versionLimit)) {
        fs.renameSync(versionPrefix + (version + 1), versionPrefix + version)
      }
      folders = fileUtils.getVersionFolders(
        path.join(dataDir, this.versionDirectory)
      )
    }

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
    const failedProviderList: string[] = []
    for (const provider of allProviders) {
      this.logger.info(
        `Beginning ${chalk.italic.green('SCAN')} for ${provider}`
      )
      const { client } = await this.getProviderClient(provider)
      if (!client) {
        failedProviderList.push(provider)
        this.logger.warn(`No valid client found for ${provider}, skipping...`)
        continue // eslint-disable-line no-continue
      }
      const config = this.getCGConfig(provider)
      this.logger.debug(config)
      if (!config) {
        failedProviderList.push(provider)
        this.logger.warn(
          `No configuration found for ${provider}, run "cg init ${provider}" to create one`
        )
        continue // eslint-disable-line no-continue
      }
      this.logger.startSpinner(
        `${chalk.italic.green('SCANNING')} data for ${chalk.italic.green(
          provider
        )}`
      )
      const providerData = await client.getData({
        opts,
      })
      this.logger.successSpinner(
        `${chalk.italic.green(provider)} data scanned successfully`
      )

      // Handle schema, write provider and combined schema to file and store in Dgraph if running
      this.logger.startSpinner(
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
            if (storageEngine instanceof DgraphEngine) {
              await storageEngine.validateSchema(schema, dataFolder)
            }
            await storageEngine.dropAll() // Delete schema before change it
            await storageEngine.setSchema(schema)
          } catch (error: any) {
            this.logger.error(
              `There was an issue pushing schema for providers: ${allProviders.join(
                ' | '
              )} to dgraph at ${storageEngine.host}`
            )
            this.logger.debug(error)
            fileUtils.deleteFolder(dataStorageLocation)
            this.exit()
          }
        }
      }
      this.logger.successSpinner(
        `${chalk.italic.green(
          'Schema'
        )} loaded successfully for ${chalk.italic.green(provider)}`
      )

      try {
        const dataPath = path.join(
          dataStorageLocation,
          `/${provider}_${Date.now()}.json`
        )
        fs.writeFileSync(dataPath, JSON.stringify(providerData, null, 2))
      } catch (error: any) {
        this.logger.error(`There was a problem saving data for ${provider}`)
        this.logger.debug(error)
        fileUtils.deleteFolder(dataStorageLocation)
        this.exit()
      }

      this.logger.startSpinner(
        `Making service connections for ${chalk.italic.green(provider)}`
      )
      processConnectionsBetweenEntities(
        providerData,
        storageEngine,
        storageRunning
      )
      this.logger.successSpinner(
        `Connections made successfully for ${chalk.italic.green(provider)}`
      )

      // Rules
      let allPolicyPacks = isEmpty(policyPacks) ? [] : policyPacks.split(',')

      if (allPolicyPacks.length >= 1) {
        this.logger.debug(`Executing rules for policy packs: ${allPolicyPacks}`)
      } else {
        allPolicyPacks = config.policies || []
        this.logger.debug(
          `Executing rules for policy packs found in config: ${allPolicyPacks}`
        )
      }

      if (allPolicyPacks.length === 0) {
        this.logger.warn(
          'There are no policy packs configured and none were passed to scan'
        )
      }

      const failedPolicyPackList: string[] = []
      const resources = config.resources.split(',')

      // Generate schema mapping
      const resourceTypeNamesToFieldsMap: { [schemaName: string]: string } = {}
      for (const resource of resources) {
        let schemaName = `aws${resource
          .charAt(0)
          .toUpperCase()}${resource.slice(1)}`

        if (resource === 'ec2Instance') {
          schemaName = 'awsEc2'
        }

        if (resource === 'sg') {
          schemaName = 'awsSecurityGroup'
        }

        resourceTypeNamesToFieldsMap[schemaName] = resource
      }

      for (const policyPack of allPolicyPacks) {
        this.logger.info(
          `Beginning ${chalk.italic.green('RULES')} for ${policyPack}`
        )

        const policyPackClient = await this.getPolicyPackClient({
          policyPack,
          mappings: resourceTypeNamesToFieldsMap,
          provider,
        })
        if (!policyPackClient) {
          failedPolicyPackList.push(policyPack)
          this.logger.warn(
            `No valid client found for ${policyPack}, skipping...`
          )
          continue // eslint-disable-line no-continue
        }

        policyPacksPlugins[policyPack] = policyPackClient

        // Update Schema:
        const currentSchema: string = await storageEngine.getSchema()
        const findingsSchema: string[] = policyPackClient.getSchema()

        await storageEngine.setSchema([
          mergeSchemas(currentSchema, findingsSchema),
        ])
      }
    }

    // If every provider that has been passed is a failure, just exit
    if (failedProviderList.length === allProviders.length) {
      this.logger.warn(
        `No providers in list: [${allProviders.join(
          ' | '
        )}] have a valid module and config, exiting`
      )
      this.exit()
    }
    if (storageRunning) {
      this.logger.startSpinner(
        'Inserting data into Dgraph and generating scan report'
      )
      // Execute services mutations promises
      await storageEngine.run()

      this.logger.successSpinner('Data insertion into Dgraph complete')

      for (const policyPack in policyPacksPlugins) {
        if (policyPack && policyPacksPlugins[policyPack]) {
          this.logger.startSpinner(
            `${chalk.italic.green('EXECUTING')} rules for ${chalk.italic.green(
              policyPack
            )}`
          )

          // Run rules:
          const updatedData = await policyPacksPlugins[policyPack].getData(
            storageEngine
          )

          // Save connections
          processConnectionsBetweenEntities(
            updatedData,
            storageEngine,
            storageRunning
          )
          await storageEngine.run(false)

          const { data = [] } = updatedData.entities.find(
            ({ name }: any) => name === 'awsFinding'
          )

          const findingsByRule = groupBy(data, 'ruleId')

          for (const rule in findingsByRule) {
            if (!isEmpty(rule)) {
              const findings = findingsByRule[rule]
              for (const { resourceId, result, ruleDescription } of findings) {
                rulesReport.pushData({
                  policyPack: `${policyPack}-${rule}`,
                  ruleDescription,
                  resourceId,
                  result,
                })
              }
            }
          }

          this.logger.successSpinner(
            `${chalk.italic.green(policyPack)} rules excuted successfully`
          )
        }
      }
    }

    scanReport.print()
    rulesReport.print()

    this.logger.success(
      `Your data for ${allProviders.join(
        ' | '
      )} has been saved to ${chalk.italic.green(dataStorageLocation)}`
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
  }
}
