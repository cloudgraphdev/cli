import {PluginManager} from 'live-plugin-manager' // TODO: replace with homegrown solution
import {Logger} from 'cloud-graph-sdk'

const ora = require('ora')
export class Manager {
  constructor(config: any) {
    this.pluginManager = new PluginManager({
      pluginsPath: './src/plugins',
    })
    this.plugins = {}
    this.logger = config.logger
    this.devMode = config.devMode
  }

  plugins: Record<string, any>

  logger: Logger

  pluginManager: PluginManager

  devMode: boolean

  async getProviderPlugin(provider: string) {
    /**
     * Determine if the user has passed a provider and prompt them if not
     */
    let plugin
    if (this.plugins[provider]) {
      return this.plugins[provider]
    }
    const checkSpinner = ora(`Checking for ${provider} module...`).start()
    try {
      if (process.env.NODE_ENV === 'development' || this.devMode) {
        // TODO: this install doesnt work if it has a yalc-d package in it, how to resolve?
        // await this.manager.installFromPath(path.join(__dirname, `../../.yalc/${provider}-provider-plugin`), {force: true})
        // plugin = this.manager.require(`${provider}-provider-plugin`)
        // TODO: talk with live-plugin-manager maintainer on why above doesnt work but below does??
        plugin = await import(`cg-${provider}-provider`)
      } else {
        const installOra = ora(`Installing ${provider} plugin`).start()
        await this.pluginManager.install(`cg-${provider}-provider`)
        installOra.succeed(`${provider} plugin installed successfully!`)
        plugin = this.pluginManager.require(`cg-${provider}-provider`)
      }
    } catch (error: any) {
      this.logger.log(error, {level: 'error'})
      checkSpinner.fail(`Manager failed to install plugin for ${provider}`)
      throw new Error('FAILED to find plugin!!')
    }
    checkSpinner.succeed(`${provider} module check complete`)
    this.plugins[provider] = plugin
    return plugin
  }
}

export default Manager
