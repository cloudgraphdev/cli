import { PluginManager } from 'live-plugin-manager' // TODO: replace with homegrown solution
import { Logger } from '@cloudgraph/sdk'
import path from 'path'

export class Manager {
  constructor(config: any) {
    this.pluginManager = new PluginManager({
      pluginsPath: path.resolve(__dirname, '../plugins')
    })
    this.plugins = {}
    this.logger = config.logger
    this.devMode = config.devMode
  }

  plugins: Record<string, any>

  logger: Logger

  pluginManager: PluginManager

  devMode: boolean

  async getProviderPlugin(provider: string): Promise<any> {
    /**
     * Determine if the user has passed a provider and prompt them if not
     */
    let plugin
    let providerNamespace = '@cloudgraph'
    let providerName = provider

    if (provider.includes('/')) {
      [providerNamespace, providerName] = provider.split('/')
      this.logger.info(`Installing community provider ${providerName} from namespace ${providerNamespace}`)
    }
    if (this.plugins[providerName]) {
      return this.plugins[providerName]
    }
    const checkSpinner = this.logger.startSpinner(`Checking for ${providerName} module...`)
    try {
      const importPath = `${providerNamespace}/cg-provider-${providerName}`
      if (process.env.NODE_ENV === 'development' || this.devMode) {
        // TODO: this install doesnt work if it has a yalc-d package in it, how to resolve?
        // await thiscd .manager.installFromPath(path.join(__dirname, `../../.yalc/${provider}-provider-plugin`), {force: true})
        // plugin = this.manager.require(`${provider}-provider-plugin`)
        // TODO: talk with live-plugin-manager maintainer on why above doesnt work but below does??
        plugin = await import(importPath)
      } else {
        const installOra = this.logger.startSpinner(`Installing ${providerName} plugin`)
        await this.pluginManager.install(importPath)
        installOra.succeed(`${providerName} plugin installed successfully!`)
        plugin = this.pluginManager.require(importPath)
      }
    } catch (error: any) {
      this.logger.debug(error)
      checkSpinner.fail(`Manager failed to install plugin for ${providerName}`)
      throw new Error('FAILED to find plugin!!')
    }
    checkSpinner.succeed(`${providerName} module check complete`)
    this.plugins[providerName] = plugin
    return plugin
  }
}

export default Manager
