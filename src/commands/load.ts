/* eslint-disable no-console */
import {getLatestProviderData} from '../utils'
import {Opts} from 'cloud-graph-sdk'

import Command from './base'
import {fileUtils, getConnectedEntity} from '../utils'

const chalk = require('chalk')
const fs = require('fs')

export default class Load extends Command {
  static description = 'Scan provider data based on your config';

  static examples = [
    `$ cloud-graph scan aws
Lets scan your AWS resources!
`,
  ];

  static strict = false;

  static flags = {
    ...Command.flags,
  };

  static args = Command.args

  async run() {
    const {argv, flags: {debug, dev: devMode}} = this.parse(Load)
    const storageEngine = this.getStorageEngine()
    const storageRunning = await storageEngine.healthCheck()
    if (!storageRunning) {
      this.logger.log(`Storage engine check at ${storageEngine.host} canceling LOAD`)
      this.exit()
    }
    const opts: Opts = {logger: this.logger, debug, devMode}
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
      this.logger.log(`Loading data to Dgraph for providers: ${allProviers.join(' | ')}`)
    } else {
      this.logger.log('Searching config for initialized providers')
      const config = this.getCGConfig()
      allProviers = Object.keys(config).filter((val: string) => val !== 'cloudGraph')
      this.logger.log(`Found providers ${allProviers.join(' | ')} in cloud-graph config`)
      if (allProviers.length === 0) {
        this.logger.log(
          'Error, there are no providers configured and none were passed to load, try "cloud-graph init" to set some up!'
        )
        this.exit()
      }
    }

    const schema: any[] = []
    for (const provider of allProviers) {
      this.logger.log(`uploading Schema for ${provider}`)
      const client = await this.getProviderClient(provider)
      const {
        getSchema,
      } = client
      const providerSchema: any[] = getSchema()
      if (!providerSchema) {
        this.logger.log(`No schema found for ${provider}, moving on`)
        continue
      }
      schema.push(...providerSchema)
      fileUtils.writeGraphqlSchemaToFile(providerSchema, provider)
    }
    // Write combined schemas to Dgraph
    fileUtils.writeGraphqlSchemaToFile(schema)

    // Push schema to dgraph if dgraph is running
    if (storageRunning) {
      try {
        storageEngine.setSchema(schema)
      } catch (error: any) {
        this.logger.log(error, {verbose: true, level: error})
        this.logger.log(`There was an issue pushing schema for providers: ${allProviers.join(' | ')} to dgraph at ${storageEngine.host}`, {level: 'error'})
      }
    }
    /**
     * loop through providers and attempt to scan each of them
     */
    const promises: Promise<any>[] = []
    for (const provider of allProviers) {
      this.logger.log(`Beginning LOAD for ${provider}`)
      const client = await this.getProviderClient(provider)
      if (!client) {
        continue
      }
      const {
        getService,
      } = client

      const allTagData: any[] = []
      let files
      try {
        files = getLatestProviderData(provider)
      } catch (error: any) {
        this.logger.log(`Unable to find saved data for ${provider}, run "cloud-graph scan aws" to fetch new data for ${provider}`, {level: 'error'})
        this.exit()
      }
      let file
      if (files.length > 1) {
        const answer = await this.interface.prompt([
          {
            type: 'checkbox',
            message: `Select ${provider} version to load into dgraph`,
            loop: false,
            name: 'file',
            choices: files.map(({name: file}: {name: string}) => fileUtils.mapFileNameToHumanReadable(file)),
          },
        ])
        file = fileUtils.mapFileSelectionToLocation(answer.file[0])
        this.logger.log(file, {verbose: true})
      } else {
        file = files[0].name
      }
      const result = JSON.parse(fs.readFileSync(file, 'utf8'))
      /**
       * Loop through the aws sdk data to format entities and build connections
       * 1. Format data with provider service format function
       * 2. build connections for data with provider service connections function
       * 3. spread new connections over result.connections
       * 4. push the array of formatted entities into result.entites
       */
      /**
       * Loop through the result entities and for each entity:
       * Look in result.connections for [key = entity.arn]
       * Loop through the connections for entity and determine its resource type
       * Find entity in result.entites that matches the id found in connections
       * Build connectedEntity by pushing the matched entity into the field corresponding to that entity (alb.ec2Instance => [ec2Instance])
       * Push connected entity into dgraph
       */
      for (const entity of result.entities) {
        const {name, data} = entity
        const {mutation} = getService(name)
        this.logger.log(`connecting service: ${name}`)
        const connectedData = data.map((service: any) => getConnectedEntity(service, result, opts))
        this.logger.log(connectedData, {verbose: true})
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
    this.logger.log(`Your data for ${allProviers.join(' | ')} is now being served at ${chalk.underline.green(storageEngine.host)}`, {level: 'success'})
    this.exit()
  }
}
