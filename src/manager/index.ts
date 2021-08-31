import { PluginManager } from 'live-plugin-manager' // TODO: replace with homegrown solution
import { Logger } from '@cloudgraph/sdk'
import { cosmiconfigSync } from 'cosmiconfig'
import path from 'path'
import chalk from 'chalk'
import fs from 'fs'
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
        `Installing community provider ${chalk.green(providerName)} from namespace ${providerNamespace}`
      )
    }
    if (this.plugins[providerName]) {
      return this.plugins[providerName]
    }
    const checkSpinner = this.logger.startSpinner(
      `Checking for ${chalk.green(providerName)} module...`
    )
    try {
      const importPath = `${providerNamespace}/cg-provider-${providerName}`
      if (process.env.NODE_ENV === 'development' || this.devMode) {
        const isValidVersion = await this.checkRequiredVersion(importPath)
        if (!isValidVersion) {
          throw new Error('Version check failed')
        }
        // TODO: talk with live-plugin-manager maintainer on why above doesnt work but below does??
        plugin = await import(importPath)
      } else {
        const installOra = this.logger.startSpinner(
          `Installing ${chalk.green(providerName)} plugin`
        )
        const providerLockVersion = this.getProviderVersionFromLock(provider)
        this.logger.info(`Installing ${chalk.green(provider)} module version: ${chalk.green(providerLockVersion)}`)
        await this.pluginManager.install(importPath, providerLockVersion)
        const isValidVersion = await this.checkRequiredVersion(importPath)
        if (!isValidVersion) {
          throw new Error('Version check failed')
        }
        // If there is no lock file, we download latest and then update the lock file with latest version
        if (providerLockVersion === 'latest') {
          const version = this.getProviderVersion(importPath)
          this.logger.info(`${chalk.green(provider)} version locked at: ${chalk.green(version)}`)
          this.writeVersionToLockFile(provider, version)
        }
        installOra.succeed(`${chalk.green(providerName)} plugin installed successfully!`)
        plugin = this.pluginManager.require(importPath)
      }
    } catch (error: any) {
      console.log(error)
      checkSpinner.fail(`Manager failed to install plugin for ${chalk.green(providerName)}`)
      throw new Error('FAILED to find plugin!!')
    }
    checkSpinner.succeed(`${chalk.green(providerName)} module check complete`)
    this.plugins[providerName] = plugin
    return plugin
  }

  getProviderVersion(importPath: string): string {
    const providerInfo = this.pluginManager.require(
      `${importPath}/package.json`
    )
    return providerInfo.version
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

  getProviderVersionFromLock(provider: string): string {
    const lockPath = path.join(this.cliConfig.configDir, '.cloud-graph.lock.json')
    let config
    try {
      config = cosmiconfigSync('cloud-graph').load(
        lockPath
      )
    } catch (error: any) {
      this.logger.info('No lock file found for Cloud Graph, creating one...')
    }
    if (!config?.config) {
      const data = {
        [provider]: 'latest'
      }
      fs.writeFileSync(lockPath, JSON.stringify(data, null, 2))
      return 'latest'
    }
    const lockFile = config.config
    if (!lockFile[provider]) {
      const newLockFile = {
        ...lockFile,
        [provider]: 'latest'
      }
      fs.writeFileSync(lockPath, JSON.stringify(newLockFile, null, 2))
      return 'latest'
    }
    return lockFile[provider]
  }

  writeVersionToLockFile(provider: string, version: string): void {
    const lockPath = path.join(this.cliConfig.configDir, '.cloud-graph.lock.json')
    try {
      const test = cosmiconfigSync('cloud-graph').load(
        lockPath
      )
      const lockFile = test?.config
      const newLockFile = {
        ...lockFile,
        [provider]: version
      }
      fs.writeFileSync(lockPath, JSON.stringify(newLockFile, null, 2))
    } catch (error: any) {
      this.logger.error('There was an error writing latest version to the lock file')
    }
  }
}

export default Manager
