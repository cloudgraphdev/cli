// import { Opts } from '@cloudgraph/sdk'
import chalk from 'chalk'
import fs from 'fs'

import Command from './base'
// import { getLatestProviderData, fileUtils, getConnectedEntity } from '../utils'
import { fileUtils, getConnectedEntity } from '../utils'

// import { Opts } from '@cloudgraph/sdk'

export default class Load extends Command {
  static description = 'Scan provider data based on your config'

  static examples = [
    `$ cloud-graph scan aws
Lets scan your AWS resources!
`,
  ]

  static strict = false

  static flags = {
    ...Command.flags,
  }

  static args = Command.args

  async run() {
    const {
      argv,
      // flags: { debug, dev: devMode },
    } = this.parse(Load)
    const storageEngine = this.getStorageEngine()
    const storageRunning = await storageEngine.healthCheck()
    if (!storageRunning) {
      this.logger.error(
        `Storage engine check at ${storageEngine.host} FAILED canceling LOAD`
      )
      this.exit()
    }
    // const opts: Opts = { logger: this.logger, debug, devMode }
    let allProviers = argv
    // if (!provider) {
    //   provider = await this.getProvider()
    // }

    /**
     * Handle 2 methods of scanning, either for explicitly passed providers OR
     * try to scan for all providers found within the config file
     * if we still have 0 providers, fail and exit.
     */
    if (allProviers.length >= 1) {
      this.logger.info(
        `Loading data to Dgraph for providers: ${allProviers.join(' | ')}`
      )
    } else {
      this.logger.info('Searching config for initialized providers')
      const config = this.getCGConfig()
      allProviers = Object.keys(config).filter(
        (val: string) => val !== 'cloudGraph'
      )
      // TODO: keep this log?
      this.logger.info(
        `Found providers ${allProviers.join(' | ')} in cloud-graph config`
      )
      if (allProviers.length === 0) {
        this.logger.error(
          'Error, there are no providers configured and none were passed to load, try "cloud-graph init" to set some up!'
        )
        this.exit()
      }
    }

    /**
     * loop through providers and attempt to scan each of them
     */
    const promises: Promise<any>[] = []
    const schema: any[] = []
    for (const provider of allProviers) {
      this.logger.info(`Beginning ${chalk.green('LOAD')} for ${provider}`)
      const client = await this.getProviderClient(provider)
      if (!client) {
        continue // eslint-disable-line no-continue
      }

      // const allTagData: any[] = []
      // TODO: not in order?
      const folders = fileUtils.getVersionFolders(
        this.versionDirectory,
        provider
      )
      if (!folders) {
        this.logger.error(
          `Unable to find saved data for ${provider}, run "cloud-graph scan aws" to fetch new data for ${provider}`
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
          if (!versionString) {
            return
          }
          const version = versionString.split('-')[1]
          // TODO: better to extract version from folder name here?
          files.push({
            name: file || '',
            version: Number(version),
            folder: name,
          })
        })
      } catch (error: any) {
        this.logger.error(
          `Unable to find saved data for ${provider}, run "cloud-graph scan aws" to fetch new data for ${provider}`
        )
        this.exit()
      }
      // If there is one file, just load it, otherwise prompt user to pick a version
      let file: string
      let version: string
      if (files.length > 1) {
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
            fileName,
            this.versionDirectory
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
      const result = JSON.parse(fs.readFileSync(file, 'utf8'))
      this.logger.info(`uploading Schema for ${provider}`)
      const providerSchema = fileUtils.getSchemaFromFolder(version, provider)
      if (!providerSchema) {
        this.logger.warn(`No schema found for ${provider}, moving on`)
        continue // eslint-disable-line no-continue
      }
      schema.push(providerSchema)
      if (allProviers.indexOf(provider) === allProviers.length - 1) {
        await storageEngine.setSchema(schema)
      }

      /**
       * Loop through the result entities and for each entity:
       * Look in result.connections for [key = entity.id]
       * Loop through the connections for entity and determine its resource type
       * Find entity in result.entites that matches the id found in connections
       * Build connectedEntity by pushing the matched entity into the field corresponding to that entity (alb.ec2Instance => [ec2Instance])
       * Push connected entity into dgraph
       */
      for (const entity of result.entities) {
        const { name, data } = entity
        const { mutation } = client.getService(name)
        this.logger.info(`connecting service: ${name}`)
        const connectedData = data.map((service: any) =>
          getConnectedEntity(service, result)
        )
        this.logger.debug(connectedData)
        if (storageRunning) {
          const axoisPromise = storageEngine.push({
            query: mutation,
            variables: {
              input: connectedData,
            },
          })
          promises.push(axoisPromise)
        }
      }
    }
    await Promise.all(promises)
    this.logger.success(
      `Your data for ${allProviers.join(
        ' | '
      )} is now being served at ${chalk.underline.green(storageEngine.host)}`
    )
    this.exit()
  }
}
