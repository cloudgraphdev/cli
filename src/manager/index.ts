import { Logger } from '@cloudgraph/sdk'
import { cosmiconfigSync } from 'cosmiconfig'
import { IConfig } from '@oclif/config'
import path from 'path'
import chalk from 'chalk'
import fs from 'fs'
import satisfies from 'semver/functions/satisfies'
import gt from 'semver/functions/gt'
import { printBoxMessage, fileUtils } from '../utils'
import { PluginModule, PluginType } from '../utils/constants'
import NpmManager from './npm'

export class Manager {
  constructor(config: {
    logger: Logger
    devMode: boolean
    cliConfig: IConfig
    pluginType: PluginType
  }) {
    this.pluginManager = new NpmManager()
    this.plugins = {}
    this.logger = config.logger
    this.devMode = config.devMode
    this.cliConfig = config.cliConfig
    this.pluginType = config.pluginType
  }

  plugins: Record<string, any>

  cliConfig: IConfig

  logger: Logger

  pluginManager: NpmManager

  devMode: boolean

  pluginType: PluginType

  private getImportPath(plugin: string): {
    importPath: string
    name: string
  } {
    let pluginNamespace = '@cloudgraph'
    let pluginName = plugin

    if (plugin.includes('/')) {
      [pluginNamespace, pluginName] = plugin.split('/')
    }
    return {
      importPath: `${pluginNamespace}/${
        PluginModule[this.pluginType]
      }-${pluginName}`,
      name: pluginName,
    }
  }

  async getPlugin(plugin: string, version?: string): Promise<any> {
    /**
     * Determine if the user has passed a plugin and prompt them if not
     */
    let pluginInstance
    let pluginName = plugin

    this.logger.startSpinner(
      `Checking for ${this.pluginType} ${chalk.green(plugin)} module...`
    )
    try {
      const { importPath, name } = this.getImportPath(plugin)
      pluginName = name
      if (process.env.NODE_ENV === 'development' || this.devMode) {
        const isValidVersion = await this.checkRequiredVersion(importPath)
        if (!isValidVersion) {
          throw new Error('Version check failed')
        }
        this.logger.warn(
          // eslint-disable-next-line max-len
          `You are running CloudGraph in devMode. In devMode, CG will assume plugin modules are already installed. use ${chalk.italic.green(
            '$yarn link {pluginModule}'
          )} to work with a local copy of a plugin module`
        )
        pluginInstance = await import(importPath)
      } else {
        this.logger.startSpinner(`Installing ${chalk.green(pluginName)} plugin`)
        const pluginLockVersion = this.getVersionFromLock(plugin)
        this.logger.info(
          `Installing ${chalk.green(plugin)} module version: ${chalk.green(
            version ?? pluginLockVersion
          )}`
        )
        await this.pluginManager.install(
          importPath,
          version ?? pluginLockVersion
        )
        this.logger.successSpinner(
          `${chalk.green(pluginName)} plugin installed successfully!`
        )
        const isValidVersion = await this.checkRequiredVersion(importPath)
        if (!isValidVersion) {
          throw new Error(`Version check ${chalk.red('failed')}`)
        }
        // If there is no lock file, we download latest and then update the lock file with latest version
        if (version || pluginLockVersion === 'latest') {
          const newLockVersion = await this.getVersion(importPath)
          this.logger.info(
            `${chalk.green(plugin)} version locked at: ${chalk.green(
              version && version !== 'latest' ? version : newLockVersion
            )}`
          )
          this.writeVersionToLockFile({
            plugin,
            version: version && version !== 'latest' ? version : newLockVersion,
          })
        }
        pluginInstance = import(importPath)
      }
    } catch (error: any) {
      this.logger.debug(error)
      this.logger.failSpinner(
        `Manager failed to install ${this.pluginType} plugin for ${chalk.green(
          pluginName
        )}`
      )
      throw new Error(
        `${this.pluginType} ${plugin} module check ${chalk.red(
          'FAILED'
        )}, unable to find plugin`
      )
    }
    this.logger.successSpinner(
      `${this.pluginType} ${chalk.green(pluginName)} module check complete`
    )
    this.plugins[pluginName] = pluginInstance
    return pluginInstance
  }

  async queryRemoteVersion(importPath: string): Promise<string> {
    const info = await this.pluginManager.queryPackage(importPath)
    return info.version
  }

  async getVersion(importPath: string): Promise<string> {
    const pluginInfo = await import(`${importPath}/package.json`)
    return pluginInfo.version
  }

  getLockFile(): any {
    const lockPath = path.join(
      this.cliConfig.configDir,
      '.cloud-graph.lock.json'
    )
    try {
      const lockFile = cosmiconfigSync('cloud-graph').load(lockPath)
      return lockFile?.config ?? {}
    } catch (error: any) {
      this.logger.info('No lock file found for Cloud Graph')
      this.logger.debug(error)
      return {}
    }
  }

  async checkRequiredVersion(importPath: string): Promise<boolean> {
    let pluginInfo
    if (process.env.NODE_ENV === 'development' || this.devMode) {
      pluginInfo = await import(`${importPath}/package.json`)
    } else {
      pluginInfo = await import(`${importPath}/package.json`)
    }
    const pluginVersion = pluginInfo?.version
    const latestRemoveVersion = await this.queryRemoteVersion(importPath)

    if (gt(latestRemoveVersion, pluginVersion)) {
      const stoppedMsg = this.logger.stopSpinner()
      printBoxMessage(
        `Update for ${chalk.italic.green(
          importPath
        )} is available: ${pluginVersion} -> ${latestRemoveVersion}. \n
Run ${chalk.italic.green('cg update')} to install`
      )
      this.logger.startSpinner(stoppedMsg)
    }

    const requiredVersion = pluginInfo?.cloudGraph?.version
    if (!requiredVersion) {
      this.logger.warn(
        `No required cli version found in ${this.pluginType} module, assuming compatability`
      )
      return true
    }
    const [cliVersion] = this.cliConfig.version.split('-')
    const test = satisfies(cliVersion, requiredVersion)
    if (!test) {
      // eslint-disable-next-line max-len
      const errText = `${this.pluginType} ${importPath}@${pluginVersion} requires cli version ${requiredVersion} but cli version is ${this.cliConfig.version}`
      this.logger.error(errText)
      return false
    }
    return true
  }

  getVersionFromLock(plugin: string): string {
    const lockPath = path.join(
      this.cliConfig.configDir,
      '.cloud-graph.lock.json'
    )
    let config
    try {
      config = cosmiconfigSync('cloud-graph').load(lockPath)
    } catch (error: any) {
      this.logger.info('No lock file found for Cloud Graph, creating one...')
    }
    if (!config?.config?.[plugin]) {
      return 'latest'
    }
    const lockFile = config.config
    return lockFile[plugin]
  }

  removeFromLockFile(plugin: string): void {
    const lockPath = path.join(
      this.cliConfig.configDir,
      '.cloud-graph.lock.json'
    )
    try {
      const oldLock = cosmiconfigSync('cloud-graph').load(lockPath)
      const lockFile = oldLock?.config
      if (!lockFile || !lockFile[this.pluginType]?.[plugin]) {
        this.logger.warn(
          `No lock file found containing ${plugin}, could not remove`
        )
        return
      }
      delete lockFile[this.pluginType][plugin]
      this.logger.success(
        `${this.pluginType} ${chalk.green(plugin)} has been removed`
      )
      fs.writeFileSync(lockPath, JSON.stringify(lockFile, null, 2))
    } catch (error: any) {
      this.logger.error(`There was an error removing ${plugin} from lock file`)
      this.logger.debug(error)
    }
  }

  writeVersionToLockFile({
    plugin,
    version,
  }: {
    plugin: string
    version: string
  }): void {
    const lockPath = path.join(
      this.cliConfig.configDir,
      '.cloud-graph.lock.json'
    )

    try {
      const oldLock = cosmiconfigSync('cloud-graph').load(lockPath)
      let newLockFile
      if (oldLock?.config) {
        newLockFile = {
          ...oldLock.config,
          [this.pluginType]: {
            ...oldLock.config[this.pluginType],
            [plugin]: version,
          },
        }
      } else {
        newLockFile = {
          [this.pluginType]: {
            [plugin]: version,
          },
        }
      }
      fileUtils.makeDirIfNotExists(this.cliConfig.configDir)
      fs.writeFileSync(lockPath, JSON.stringify(newLockFile, null, 2))
    } catch (error: any) {
      this.logger.error(
        'There was an error writing latest version to the lock file'
      )
      this.logger.debug(error)
    }
  }

  async removePlugin(plugin: string): Promise<void> {
    const { importPath } = this.getImportPath(plugin)
    try {
      await this.pluginManager.uninstall(importPath)
    } catch (error: any) {
      this.logger.error(
        `There was an error uninstalling ${this.pluginType} ${plugin}`
      )
      this.logger.debug(error)
    }
  }
}

export default Manager
