import { flags } from '@oclif/command'
// import { Opts } from '@cloudgraph/sdk'
import fs from 'fs'
import path from 'path'

import Command from './base'
// import { Opts } from '@cloudgraph/sdk'

// import { printWelcomeMessage } from '../utils'

// const ora = require('ora')

export default class Init extends Command {
  static description =
    'Set initial configuration for providers';

  static examples = [
    '$ cg init',
    '$ cg init aws [Initialize AWS provider]',
    '$ cg init aws -r [Specify resources to crawl]'
  ];

  static flags = {
    ...Command.flags,
    // select resources flag
    resources: flags.boolean({ char: 'r' }),
  }

  static hidden = false

  static strict = false

  static args = Command.args

  getProvider(): Promise<string> {
    // TODO: remove when we have more choices
    const choices = ['aws']
    if (choices.length < 2) {
      return new Promise(resolve => resolve('aws'))
    }
    return new Promise(resolve => {
      this.interface
        .prompt([
          {
            type: 'list',
            name: 'provider',
            message: 'Which cloud provider would you like to use?',
            choices: ['aws'],
          },
        ])
        .then((res: { provider: string }) => {
          this.logger.debug(res.provider)
          resolve(res.provider)
        })
    })
  }

  async getCloudGraphConfig() {
    const {
      flags: { dgraph, directory },
    } = this.parse(Init)
    const result: { [key: string]: any } = {}
    if (dgraph) {
      result.dgraphHost = dgraph
    } else {
      const { dgraph } = await this.interface.prompt([
        // TODO: validate has url structure with regex
        {
          type: 'input',
          message:
            'Enter your dgraph host url (or launch dgraph with "cloud-graph launch")',
          name: 'dgraph',
          default: 'http://localhost:8080',
        },
      ])
      result.dgraphHost = dgraph
    }
    if (directory) {
      result.directory = directory
    } else {
      const { directory } = await this.interface.prompt([
        {
          type: 'input',
          message: 'What directory would you like CloudGraph to store data in?',
          name: 'directory',
          default: 'cg',
        },
      ])
      result.directory = directory
    }
    return result
  }

  async run() {
    const { argv, flags } = this.parse(Init)
    // const opts: Opts = {logger: this.logger, debug, devMode}
    // First determine the provider if one has not been passed in args
    // if no provider is passed, they can select from a list of offically supported providers
    let allProviders: string[] = argv
    if (allProviders.length === 0) {
      allProviders = [await this.getProvider()]
    }
    const configResult: { [key: string]: Record<string, any> } = {}
    for (const provider of allProviders) {
      /**
       * setup base config for provider
       */
      configResult[provider] = {}
      /**
       * First install and require the provider plugin
       */
      const client = await this.getProviderClient(provider)
      if (!client) {
        this.logger.warn(
          `There was an issue initializing ${provider} plugin, skipping...`
        )
        continue // eslint-disable-line no-continue
      }
      /**
       * Search in the config object for the provider to see if its already been configured
       */
      const config = this.getCGConfig(provider)
      if (config) {
        this.logger.info(`Config for ${provider} already exists`)
        const answers = await this.interface.prompt([
          {
            type: 'expand',
            message: `How would you like to change ${provider}'s config`,
            name: 'nextStep',
            choices: [
              {
                key: 'y',
                name: 'Overwrite',
                value: 'overwrite',
              },
              {
                key: 'x',
                name: 'Abort',
                value: 'abort',
              },
            ],
          },
        ])
        this.logger.debug(answers)
        if (answers.nextStep === 'overwrite') {
          configResult[provider] = await client.configure(flags)
        } else {
          this.logger.warn(`Init command for ${provider} aborted`)
          this.exit()
        }
      } else {
        configResult[provider] = await client.configure(flags)
        configResult.cloudGraph = await this.getCloudGraphConfig()
      }
    }
    fs.writeFileSync(
      path.join(process.cwd(), '.cloud-graphrc.json'),
      JSON.stringify(configResult, null, 2)
    )
    this.exit()
  }
}
