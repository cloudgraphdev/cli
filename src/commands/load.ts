import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import { isEmpty } from 'lodash'

import Command from './base'
import { fileUtils, processConnectionsBetweenEntities } from '../utils'
import { getSchemaFromFolder } from '../utils/schema'

export default class Load extends Command {
  static description = 'Load a specific version of your CloudGraph data'

  static examples = [
    '$ cg load [Load data for all providers configured]',
    '$ cg load aws [Load data for AWS]',
  ]

  static strict = false

  static flags = {
    ...Command.flags,
  }

  static hidden = false

  static args = Command.args

  async run(): Promise<void> {
    const {
      argv,
      // flags: { debug, dev: devMode },
    } = this.parse(Load)
    const { dataDir } = this.config
    const storageEngine = this.getStorageEngine()
    const storageRunning = await storageEngine.healthCheck()
    if (!storageRunning) {
      this.logger.error(
        `Storage engine check at ${storageEngine.host} FAILED canceling LOAD`
      )
      this.exit()
    }
    // const opts: Opts = { logger: this.logger, debug, devMode }
    let allProviders = argv
    // if (!provider) {
    //   provider = await this.getProvider()
    // }

    /**
     * Handle 2 methods of scanning, either for explicitly passed providers OR
     * try to scan for all providers found within the config file
     * if we still have 0 providers, fail and exit.
     */
    if (allProviders.length >= 1) {
      this.logger.info(
        `Loading data to Dgraph for providers: ${allProviders.join(' | ')}`
      )
    } else {
      this.logger.info('Searching config for initialized providers')
      const config = this.getCGConfig()
      allProviders = Object.keys(config).filter(
        (val: string) => val !== 'cloudGraph'
      )
      // TODO: keep this log?
      this.logger.info(
        `Found providers ${allProviders.join(' | ')} in cloud-graph config`
      )
      if (allProviders.length === 0) {
        this.logger.error(
          'Error, there are no providers configured and none were passed to load, try "cg init" to set some up!'
        )
        this.exit()
      }
    }

    /**
     * loop through providers and attempt to scan each of them
     */
    const schema: any[] = []
    for (const provider of allProviders) {
      this.logger.info(
        `Beginning ${chalk.italic.green('LOAD')} for ${provider}`
      )
      const { client } = await this.getProviderClient(provider)
      if (!client) {
        continue // eslint-disable-line no-continue
      }

      // const allTagData: any[] = []
      // TODO: not in order?
      const folders = fileUtils.getVersionFolders(
        path.join(dataDir, this.versionDirectory),
        provider
      )
      if (isEmpty(folders)) {
        this.logger.error(
          `Unable to find saved data for ${provider}, run "cg scan aws" to fetch new data for ${provider}`
        )
      }
      // Get array of files for provider sorted by creation time
      const files: { name: string; version: number; folder: string }[] = []
      try {
        folders.forEach(({ name }: { name: string }) => {
          const file = fileUtils.getProviderDataFile(name, provider)
          const folderSplits = name.split('/')
          const versionString = folderSplits.find((val: string) =>
            val.includes('version')
          )
          if (!versionString || !file) {
            return
          }
          const version = versionString.split('-')[1]
          // TODO: better to extract version from folder name here?
          files.push({
            name: file,
            version: Number(version),
            folder: name,
          })
        })
      } catch (error: any) {
        this.logger.error(
          `Unable to find saved data for ${provider}, run "cg scan aws" to fetch new data for ${provider}`
        )
        this.exit()
      }
      // If there is one file, just load it, otherwise prompt user to pick a version
      let file: string
      let version: string
      if (files.length > 1) {
        // TODO: rework this using choices[].value to not need to do string manipulation to extract answer
        const answer: { file: string } = await this.interface.prompt([
          {
            type: 'list',
            message: `Select ${provider} version to load into dgraph`,
            loop: false,
            name: 'file',
            choices: files.map(({ name: file, version }) => {
              const fileName = fileUtils.mapFileNameToHumanReadable(file)
              return `version ${version} ... ${fileName}`
            }),
          },
        ])
        try {
          const [versionString, fileName]: string[] = answer.file.split('...')
          version = versionString.split('-')[1] // eslint-disable-line prefer-destructuring
          file = fileUtils.findProviderFileLocation(
            path.join(dataDir, this.versionDirectory),
            fileName
          )
          const foundFile = files.find(val => val.name === file)
          if (!foundFile) {
            this.logger.error(
              `Unable to find file for ${provider} for ${versionString}`
            )
            this.exit()
          }
          version = foundFile.folder
          this.logger.debug(file)
          this.logger.debug(version)
        } catch (error: any) {
          this.logger.error('Please choose a file to load')
          this.exit()
        }
      } else {
        file = files[0].name
        version = files[0].folder
      }
      this.logger.startSpinner(
        `updating ${chalk.italic.green('Schema')} for ${chalk.italic.green(
          provider
        )}`
      )
      const providerData = JSON.parse(fs.readFileSync(file, 'utf8'))
      const providerSchema = getSchemaFromFolder(version, provider)
      if (!providerSchema) {
        this.logger.warn(`No schema found for ${provider}, moving on`)
        continue // eslint-disable-line no-continue
      }
      schema.push(providerSchema)
      if (allProviders.indexOf(provider) === allProviders.length - 1) {
        await storageEngine.setSchema(schema)
      }
      this.logger.successSpinner(
        `${chalk.italic.green(
          'Schema'
        )} loaded successfully for ${chalk.italic.green(provider)}`
      )

      /**
       * Loop through the providerData entities and for each entity:
       * Look in providerData.connections for [key = entity.id]
       * Loop through the connections for entity and determine its resource type
       * Find entity in providerData.entities that matches the id found in connections
       * Build connectedEntity by pushing the matched entity into the field corresponding to that entity (alb.ec2Instance => [ec2Instance])
       * Push connected entity into dgraph
       */
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
    }

    // Execute services mutations promises
    this.logger.startSpinner('Inserting loaded data into Dgraph')
    // Execute services mutations promises
    await storageEngine.run(true)
    this.logger.successSpinner('Data insertion into Dgraph complete')
    this.logger.success(
      `Your data for ${allProviders.join(
        ' | '
      )} has been loaded to Dgraph. Query at ${chalk.underline.green(
        `${storageEngine.host}/graphql`
      )}`
    )
    await this.startQueryEngine()
  }
}
