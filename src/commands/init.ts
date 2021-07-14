/* eslint-disable no-console */
import {flags} from '@oclif/command'
import {cosmiconfigSync} from 'cosmiconfig'
// import axios from 'axios'
import CloudGraph, {Opts} from 'cloud-graph-sdk'

import Command from './base'
import manager from '../manager'

const fs = require('fs')
const path = require('path')
const ora = require('ora')

export default class Init extends Command {
  static description =
    'Initialize your config to being scanning your cloud infrastructure';

  static examples = [
    `$ cloud-graph init
Hi from AutoCloud! Lets setup your config
`,
  ];

  static flags = {
    ...Command.flags,
    // select resources flag
    resources: flags.boolean({char: 'r'}),
  };

  static strict = false;

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
        console.log(res)
        resolve(res.provider)
      })
    })
  }

  async getNewProviderConfig(plugin: any): Promise<{[key: string]: string}> {
    const {
      flags: {resources},
    } = this.parse(Init)
    const result: {[key: string]: string} = {}
    const {enums: {regions, services}} = plugin
    if (regions) {
      const answers = await this.interface.prompt([
        {
          type: 'checkbox',
          message: 'Select regions to scan',
          loop: false,
          name: 'regions',
          choices: regions.map((region: string) => ({
            name: region,
          })),
        },
      ])
      this.logger.log(answers, {verbose: true})
      result.regions = answers.regions.join(',')
      // eslint-disable-next-line max-depth
    }
    if (resources) {
      const answers = await this.interface.prompt([
        {
          type: 'checkbox',
          message: 'Select services to scan',
          loop: false,
          name: 'resources',
          choices: Object.values(services as {[key: string]: string}).map(
            (service: string) => ({
              name: service,
            })
          ),
        },
      ])
      this.logger.log(answers, {verbose: true})
      if (answers.resources.length > 0) {
        result.resources = answers.resources.join(',')
      } else {
        result.resources = Object.values(
          services
        ).join(',')
      }
    } else {
      result.resources = Object.values(
        services
      ).join(',')
    }
    return result
  }

  async run() {
    const {
      argv,
      flags: {debug, dev: devMode},
    } = this.parse(Init)
    const opts: Opts = {logger: this.logger, debug, devMode}
    // First determine the provider if one has not been passed in args
    // if no provider is passed, they can select from a list of offically supported providers
    let allProviders: string[] = argv
    if (allProviders.length === 0) {
      allProviders = [await this.getProvider()]
    }
    this.logger.log(allProviders)
    const configResult: { [key: string]: Record<string, any> } = {}
    for (const provider of allProviders) {
      /**
       * setup base config for provider
       */
      configResult[provider] = {}
      /**
       * First install and require the provider plugin
       */
      const plugin = await this.getProviderPlugin(provider, opts)
      if (!plugin) {
        this.logger.log(`There was an issue initializing ${provider} plugin, skipping...`)
        continue
      }
      /**
       * Search in the config object for the provider to see if its already been configured
       */
      const config = this.getCGConfig(provider)
      if (config) {
        this.logger.log(`Config for ${provider} already exists`)
        const answers = await this.interface.prompt([
          {
            type: 'expand',
            message: `How would you like to change ${provider}'s config`,
            name: 'overwrite',
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
        this.logger.log(answers, {verbose: true})
        if (answers.overwrite) {
          configResult[provider] = await this.getNewProviderConfig(plugin)
        } else {
          this.logger.log(`Init command for ${provider} aborted`)
          this.exit()
        }
      } else {
        configResult[provider] = await this.getNewProviderConfig(plugin)
      }
    }
    fs.writeFileSync(
      path.join(process.cwd(), '.cloud-graphrc.json'),
      JSON.stringify(configResult, null, 2)
    )
    this.exit()
  }
}
