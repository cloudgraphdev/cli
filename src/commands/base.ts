import Command, {flags} from '@oclif/command'
import {Input} from '@oclif/parser';
import CloudGraph, {Opts} from 'cloud-graph-sdk'
import {cosmiconfigSync} from 'cosmiconfig'
import manager from '../manager'

const inquirer = require('inquirer')

export default abstract class BaseCommand extends Command {
  constructor(argv: any, config: any) {
    super(argv, config)
    this.logger
  }

  interface = inquirer

  // TODO: update with logger type from sdk
  logger: any

  static flags = {
    // debug flag
    debug: flags.boolean(),
    // devMode flag
    dev: flags.boolean(),
  }

  static strict = false;

  static args = [{name: 'provider'}];

  async init() {
    // do some initialization
    const {flags: {debug, dev: devMode}} = this.parse(this.constructor as Input<{debug: boolean; dev: boolean}>)
    this.logger = new CloudGraph.Logger(debug)
  }

  async getProviderPlugin(provider: string, opts: Opts) {
    try {
      this.logger.log('we are here')
      const plugin = await manager.getProviderPlugin(provider, opts)
      return plugin
    } catch (error: any) {
      this.logger.log(error, {level: 'error', verbose: true})
      this.logger.log(
        `There was an error installing or requiring a plugin for ${provider}, does one exist?`,
        {level: 'error'}
      )
      return null
    }
  }

  getCGConfig(provider?: string) {
    const config = cosmiconfigSync('cloud-graph').search()
    if (config) {
      const configResult = config.config
      if (provider) {
        return configResult[provider]
      }
      return configResult
    }
    return null
  }

  async catch(err) {
    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling
    return super.catch(err);
  }
}