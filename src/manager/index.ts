import { PluginManager } from 'live-plugin-manager' // TODO: replace with homegrown solution
import { Logger } from '@cloudgraph/sdk'
import path from 'path'
import satisfies from 'semver/functions/satisfies'

export class Manager {
  constructor(config: any) {
    this.pluginManager = new PluginManager({
      pluginsPath: path.resolve(__dirname, '../plugins'),
    })
    this.plugins = {}
    this.logger = config.logger
    this.devMode = config.devMode
    this.cliConfig = config.cliConfig
  }

  plugins: Record<string, any>

  cliConfig: any

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
      this.logger.info(
        `Installing community provider ${providerName} from namespace ${providerNamespace}`
      )
    }
    if (this.plugins[providerName]) {
      return this.plugins[providerName]
    }
    const checkSpinner = this.logger.startSpinner(
      `Checking for ${providerName} module...`
    )
    try {
      const importPath = `${providerNamespace}/cg-provider-${providerName}`
      if (process.env.NODE_ENV === 'development' || this.devMode) {
        // TODO: this install doesnt work if it has a yalc-d package in it, how to resolve?
        // await thiscd .manager.installFromPath(path.join(__dirname, `../../.yalc/${provider}-provider-plugin`), {force: true})
        // plugin = this.manager.require(`${provider}-provider-plugin`)
        // TODO: talk with live-plugin-manager maintainer on why above doesnt work but below does??
        const isValidVersion = await this.checkRequiredVersion(importPath)
        if (!isValidVersion) {
          throw new Error('Version check failed')
        }
        plugin = await import(importPath)
      } else {
        const installOra = this.logger.startSpinner(
          `Installing ${providerName} plugin`
        )
        await this.pluginManager.install(importPath)
        const isValidVersion = await this.checkRequiredVersion(importPath)
        if (!isValidVersion) {
          throw new Error('Version check failed')
        }
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
  
  async checkRequiredVersion(importPath: string): Promise<boolean> {
    let providerInfo
    if (process.env.NODE_ENV === 'development' || this.devMode) {
      providerInfo = await import(`${importPath}/package.json`)
    } else {
      providerInfo = this.pluginManager.require(
        `${importPath}/package.json`
      )
    }
    const providerVersion = providerInfo?.version
    const requiredVersion = providerInfo?.cloudGraph?.version
    if (!requiredVersion) {
      this.logger.warn(
        'No required cli version found in provider module, assuming compatability'
      )
      return true
    }
    const test = satisfies(this.cliConfig.version, requiredVersion)
    if (!test) {
      const errText = 
        `Provider ${importPath}@${providerVersion} requires cli version ${requiredVersion} but cli version is ${this.cliConfig.version}`
      this.logger.error(errText)
      return false
    }
    return true
  }
}

export default Manager
