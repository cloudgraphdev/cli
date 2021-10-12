import { pickBy } from 'lodash'
import chalk from 'chalk'
import Command from '../base'

const getProvider = (val: string): string =>
  val.includes('@') ? val.split('@')[0] : val

export default class Update extends Command {
  static description = 'Update currently installed policy packs'

  static aliases = ['update']

  static examples = [
    '$ cg provider update',
    '$ cg provider update aws',
    '$cg provider update aws@0.12.0',
  ]

  static strict = false

  static hidden = false

  static flags = {
    ...Command.flags,
  }

  static args = Command.args

  async run(): Promise<void> {
    const { argv } = this.parse(Update)
    const allProviders = argv
    const manager = this.getPluginManager()
    const lockFile = manager.getLockFile()

    // Get the providers from the lock file that user wants to update
    // If user passes something like aws@1.1.0, filter the lock file to only grab 'aws' entry
    const providersToList =
      allProviders.length >= 1
        ? pickBy(lockFile, (_, key) => {
            const providers = allProviders.map(val => {
              return getProvider(val)
            })
            return providers.indexOf(key) > -1
          })
        : lockFile

    // Warn the user if they are trying to update providers they have not installed.
    const nonInstalledProviders = allProviders.filter(rawProvider => {
      const provider = getProvider(rawProvider)
      return Object.keys(lockFile).includes(provider)
    })
    for (const provider of nonInstalledProviders) {
      this.logger.warn(
        `${chalk.green(
          getProvider(provider)
        )} not found in lock file, have you installed it?`
      )
    }

    // Loop through providers and try to update them
    for (const [key] of Object.entries(providersToList)) {
      let version = 'latest'
      const rawProvider = allProviders.find(val => val.includes(key))
      if (rawProvider && rawProvider.includes('@')) {
        [, version] = rawProvider.split('@')
      }
      await manager.getProviderPlugin(key, version)
      this.logger.info(
        `Run ${chalk.italic.green(
          `$cg init ${key}`
        )} to ensure you have the latest configuration for this version (including new services).`
      )
    }
  }
}
