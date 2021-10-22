import { PluginManager } from 'live-plugin-manager' // TODO: replace with homegrown solution
import { Logger } from '@cloudgraph/sdk'
import { cosmiconfigSync } from 'cosmiconfig'
import npm from 'npm'
import path from 'path'
import chalk from 'chalk'
import fs from 'fs'
import satisfies from 'semver/functions/satisfies'
import gt from 'semver/functions/gt'
import { printBoxMessage, fileUtils } from '../utils'

const getProviderImportPath = (
  provider: string
): { importPath: string; name: string } => {
  let providerNamespace = '@cloudgraph'
  let providerName = provider
  if (provider.includes('/')) {
    ;[providerNamespace, providerName] = provider.split('/')
  }
  return {
    importPath: `${providerNamespace}/cg-provider-${providerName}`,
    name: providerName,
  }
}

const install = async (path: string, version?: string) => {
  return new Promise((res, rej) => {
    npm.load(function () {
      // catch errors
      npm.config.set('audit', false)
      npm.config.set('silent', true)
      npm.config.set('progress', false)
      npm.config.set('log-level', 'silent')
      npm.config.set('fund', false)

      // super hack to avoid logging to console. This can cause issues if someone else uses this libs
      // npm.log.enableProgress = ()=> {} // console.log('spin!')
      ;(npm as any).output = () => 0 // ignore output

      const module = `${path}${version ? `@${version}` : ''}`
      npm.commands.install([module], function (er, data) {
        // log the error or data
        if (er) return rej(er)
        // console.log('data', data)
        res(data)
      })
      npm.on('log', function (message) {
        // log the progress of the installation
        console.log('[can remove]', message)
      })
    })
  })
}

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

  async getProviderPlugin(provider: string, version?: string): Promise<any> {
    /**
     * Determine if the user has passed a provider and prompt them if not
     */
    let plugin
    const providerName = provider
    try {
      this.logger.info(`Checking for ${chalk.green(provider)} module...`)
      const { importPath } = getProviderImportPath(provider)

      // we may avoid the npm install here by checking the file/folder
      await install(importPath, version)

      plugin = await import(importPath)

      this.logger.successSpinner(`Got the plugin ${chalk.green(providerName)}`)

      this.plugins[providerName] = plugin
    } catch (error: any) {
      console.log(error)
    }
    return plugin
    // try {
    //   providerName = name
    //   if (process.env.NODE_ENV === 'development' || this.devMode) {
    //     const isValidVersion = await this.checkRequiredVersion(importPath)
    //     if (!isValidVersion) {
    //       throw new Error('Version check failed')
    //     }
    //     this.logger.warn(
    //       // eslint-disable-next-line max-len
    //       `You are running CloudGraph in devMode.
    //       In devMode, CG will assume provider modules are already installed. use
    //       ${chalk.italic.green('$yarn link {providerModule}')} to work with a local copy of a provider module`
    //     )
    //     // plugin = await import(importPath)
    //   } else {
    //     this.logger.startSpinner(
    //       `Installing ${chalk.green(providerName)} plugin`
    //     )
    //     const providerLockVersion = this.getProviderVersionFromLock(provider)
    //     this.logger.info(
    //       `Installing ${chalk.green(provider)} module version: ${chalk.green(
    //         version ?? providerLockVersion
    //       )}`
    //     )
    //     await this.pluginManager.install(
    //       importPath,
    //       version ?? providerLockVersion
    //     )
    //     this.logger.successSpinner(
    //       `${chalk.green(providerName)} plugin installed successfully!`
    //     )
    //     const isValidVersion = await this.checkRequiredVersion(importPath)
    //     if (!isValidVersion) {
    //       throw new Error(`Version check ${chalk.red('failed')}`)
    //     }
    //     // If there is no lock file, we download latest and then update the lock file with latest version
    //     if (version || providerLockVersion === 'latest') {
    //       const newLockVersion = this.getProviderVersion(importPath)
    //       this.logger.info(
    //         `${chalk.green(provider)} version locked at: ${chalk.green(
    //           version && version !== 'latest' ? version : newLockVersion
    //         )}`
    //       )
    //       this.writeVersionToLockFile(
    //         provider,
    //         version && version !== 'latest' ? version : newLockVersion
    //       )
    //     }
    //     plugin = this.pluginManager.require(importPath)
    //   }
    // } catch (error: any) {
    //   this.logger.debug(error)
    //   this.logger.failSpinner(
    //     `Manager failed to install plugin for ${chalk.green(providerName)}`
    //   )
    //   console.log(error)
    //   throw new Error(
    //     `${provider} moudle check ${chalk.red('FAILED')}, unable to find plugin`
    //   )
    // }
    // this.logger.successSpinner(
    //   `${chalk.green(providerName)} module check complete`
    // )
    // this.plugins[providerName] = plugin
    // return plugin
  }

  async queryRemoteVersion(importPath: string): Promise<string> {
    const info = await this.pluginManager.queryPackage(importPath)
    return info.version
  }

  getProviderVersion(importPath: string): string {
    const providerInfo = this.pluginManager.require(
      `${importPath}/package.json`
    )
    return providerInfo.version
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
    let providerInfo
    if (process.env.NODE_ENV === 'development' || this.devMode) {
      providerInfo = await import(`${importPath}/package.json`)
    } else {
      providerInfo = this.pluginManager.require(`${importPath}/package.json`)
    }
    const providerVersion = providerInfo?.version
    const latestRemoveVersion = await this.queryRemoteVersion(importPath)
    if (gt(latestRemoveVersion, providerVersion)) {
      const stoppedMsg = this.logger.stopSpinner()
      printBoxMessage(
        `Update for ${chalk.italic.green(
          importPath
        )} is available: ${providerVersion} -> ${latestRemoveVersion}. \n
Run ${chalk.italic.green('cg update')} to install`
      )
      this.logger.startSpinner(stoppedMsg)
    }
    const requiredVersion = providerInfo?.cloudGraph?.version
    if (!requiredVersion) {
      this.logger.warn(
        'No required cli version found in provider module, assuming compatability'
      )
      return true
    }
    const test = satisfies(this.cliConfig.version, requiredVersion)
    if (!test) {
      const errText = `Provider ${importPath}@${providerVersion} requires cli version ${requiredVersion} but cli version is ${this.cliConfig.version}`
      this.logger.error(errText)
      return false
    }
    return true
  }

  getProviderVersionFromLock(provider: string): string {
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
    if (!config?.config?.[provider]) {
      return 'latest'
    }
    const lockFile = config.config
    return lockFile[provider]
  }

  removeProviderFromLockFile(provider: string): void {
    const lockPath = path.join(
      this.cliConfig.configDir,
      '.cloud-graph.lock.json'
    )
    try {
      const oldLock = cosmiconfigSync('cloud-graph').load(lockPath)
      const lockFile = oldLock?.config
      if (!lockFile || !lockFile[provider]) {
        this.logger.warn(
          `No lock file found containing ${provider}, could not remove`
        )
        return
      }
      delete lockFile[provider]
      this.logger.success(`Provider ${chalk.green(provider)} has been removed`)
      fs.writeFileSync(lockPath, JSON.stringify(lockFile, null, 2))
    } catch (error: any) {
      this.logger.error(
        `There was an error removing ${provider} from lock file`
      )
      this.logger.debug(error)
    }
  }

  writeVersionToLockFile(provider: string, version: string): void {
    const lockPath = path.join(
      this.cliConfig.configDir,
      '.cloud-graph.lock.json'
    )
    let oldLock
    try {
      oldLock = cosmiconfigSync('cloud-graph').load(lockPath)
    } catch (error: any) {}
    try {
      let newLockFile
      if (oldLock?.config) {
        newLockFile = {
          ...oldLock.config,
          [provider]: version,
        }
      } else {
        newLockFile = {
          [provider]: version,
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

  async removePlugin(provider: string): Promise<void> {
    const { importPath } = getProviderImportPath(provider)
    try {
      await this.pluginManager.uninstall(importPath)
    } catch (error: any) {
      this.logger.error(`There was an error uninstalling ${provider}`)
      this.logger.debug(error)
    }
  }
}

export default Manager
