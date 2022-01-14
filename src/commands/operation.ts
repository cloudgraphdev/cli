import { PluginType } from '@cloudgraph/sdk'
import { isEmpty, pickBy } from 'lodash'
import chalk from 'chalk'

import Command from './base'
import { messages } from '../utils/constants'

const configurationLogs = [PluginType.Provider]
export default abstract class OperationBaseCommand extends Command {
  static strict = false

  static hidden = true

  static flags = {
    ...Command.flags,
  }

  static args = Command.args

  private getPlugin(val: string): string {
    return val.includes('@') ? val.split('@')[0] : val
  }

  async add(type: PluginType): Promise<
    {
      key: string
      version: string
      plugin: any
    }[]
  > {
    const { argv } = this.parse(OperationBaseCommand)
    console.log(argv)
    const allPlugins = argv
    const manager = this.getPluginManager(type)
    const plugins = []
    for (let key of allPlugins) {
      let version = 'latest'
      if (key.includes('@')) {
        [key, version] = key.split('@')
      }
      const plugin = await manager.getPlugin(key, version)

      // Only shows for certain plugins
      configurationLogs.includes(type) &&
        this.logger.info(
          `Run ${chalk.italic.green(
            `$cg init ${key}`
          )} to setup configuration for this ${messages[type]?.singular}`
        )

      plugins.push({
        key,
        version,
        plugin,
      })
    }
    return plugins
  }

  async installPlugin(type: PluginType): Promise<void> {
    const manager = this.getPluginManager(type)
    const lockFile = manager.getLockFile()
    if (isEmpty(lockFile?.[type])) {
      this.logger.info(
        `No ${messages[type]?.plural} found in lock file, have you added any?`
      )
      this.exit()
    }
    for (const [key, value] of Object.entries(lockFile[type])) {
      await manager.getPlugin(key, value as string)
    }
  }

  async remove(): Promise<void> {
    // TODO: remove
  }

  async update(type: PluginType): Promise<void> {
    const { argv } = this.parse(OperationBaseCommand)
    const allPlugins = argv
    const manager = this.getPluginManager(type)
    const lockFile = manager.getLockFile()

    if (isEmpty(lockFile?.[type])) {
      this.logger.info(
        `No ${messages[type]?.plural} found in lock file, have you added any?`
      )
      this.exit()
    }
    // Get the plugins from the lock file that user wants to update
    // If user passes something like aws@1.1.0, filter the lock file to only grab 'aws' entry
    const pluginsToList =
      allPlugins.length >= 1
        ? pickBy(lockFile?.[type], (_, key) => {
            const plugins = allPlugins.map(val => {
              return this.getPlugin(val)
            })
            return plugins.indexOf(key) > -1
          })
        : lockFile?.[type] || {}

    // Warn the user if they are trying to update plugins they have not installed.
    const nonInstalledPlugins = allPlugins.filter(rawPlugin => {
      const plugin = this.getPlugin(rawPlugin)
      return Object.keys(lockFile).includes(plugin)
    })
    for (const plugin of nonInstalledPlugins) {
      this.logger.warn(
        `${chalk.green(
          this.getPlugin(plugin)
        )} not found in lock file, have you installed it?`
      )
    }
    // Loop through plugins and try to update them
    for (const [key] of Object.entries(pluginsToList)) {
      try {
        let version = 'latest'
        const rawPlugin = allPlugins.find(val => val.includes(key))
        if (rawPlugin && rawPlugin.includes('@')) {
          [, version] = rawPlugin.split('@')
        }

        this.logger.startSpinner(
          `Updating ${chalk.italic.green(key)} ${messages[
            type
          ]?.singular?.toLowerCase()} to ${version} version`
        )

        await manager.getPlugin(key, version)

        this.logger.successSpinner(
          `${chalk.italic.green(key)} ${messages[
            type
          ]?.singular?.toLowerCase()} updated successfully`
        )

        this.logger.info(
          `Run ${chalk.italic.green(
            `$cg init ${key}`
          )} to ensure you have the latest configuration for this version (including new services).`
        )
      } catch (error) {
        this.logger.stopSpinner()
      }
    }
  }

  async list(type: PluginType): Promise<void> {
    const { argv } = this.parse(OperationBaseCommand)
    const allPlugins = argv
    const manager = this.getPluginManager(type)
    const lockFile = manager.getLockFile()
    if (isEmpty(lockFile?.[type])) {
      this.logger.info(
        `No ${messages[type]?.plural} found, have you installed any?`
      )
      this.exit()
    }
    const pluginsToList =
      allPlugins.length >= 1
        ? pickBy(lockFile, (_, key) => {
            return allPlugins.includes(key)
          })
        : lockFile?.[type] || {}
    for (const [key, value] of Object.entries(pluginsToList)) {
      this.logger.success(
        `${messages[type]?.singular} ${chalk.green(
          `${key}@${value}`
        )} is installed`
      )
    }
  }
}
