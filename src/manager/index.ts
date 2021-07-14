import {PluginManager} from 'live-plugin-manager' // TODO: replace with homegrown solution
import {Opts} from 'cloud-graph-sdk'

const ora = require('ora')
const path = require('path')

export class Manager {
  constructor() {
    this.manager = new PluginManager({
      pluginsPath: './src/plugins',
    })
    this.plugins = {}
  }

  plugins: Record<string, any>

  manager

  async getProviderPlugin(provider: string, {debug, devMode, logger}: Opts) {
    /**
     * Determine if the user has passed a provider and prompt them if not
     */
    const checkSpinner = ora(`Checking for ${provider} module...`).start()
    let plugin
    if (this.plugins[provider]) {
      checkSpinner.succeed(`${provider} module check complete`)
      return this.plugins[provider]
    }
    try {
      if (process.env.NODE_ENV === 'development' || devMode) {
        // TODO: this install doesnt work if it has a yalc-d package in it, how to resolve?
        // await this.manager.installFromPath(path.join(__dirname, `../../.yalc/${provider}-provider-plugin`), {force: true})
        // plugin = this.manager.require(`${provider}-provider-plugin`)
        // TODO: talk with live-plugin-manager maintainer on why above doesnt work but below does??
        plugin = await import(path.join(__dirname, `../../.yalc/cg-${provider}-provider`))
      } else {
        const installOra = ora(`Installing ${provider} plugin`).start()
        // const exec = require('child_process').exec
        // await exec(`yalc add ${provider}-provider-plugin`)
        await this.manager.install(`cg-${provider}-provider`)
        installOra.succeed(`${provider} plugin installed successfully!`)
        plugin = this.manager.require(`cg-${provider}-provider`)
      }
    } catch (error: any) {
      logger.log(error, {level: 'error'})
      checkSpinner.fail(`Manager failed to install plugin for ${provider}`)
      throw new Error('FAILED to find plugin!!')
    }
    checkSpinner.succeed(`${provider} module check complete`)
    this.plugins[provider] = plugin
    return plugin
  }
}

export default new Manager()
