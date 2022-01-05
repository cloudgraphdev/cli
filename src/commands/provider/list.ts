import { PluginType } from '@cloudgraph/sdk'
import { isEmpty, pickBy } from 'lodash'
import chalk from 'chalk'
import Command from '../base'

export default class List extends Command {
  static description = 'List currently installed providers and versions'

  static aliases = ['provider:ls', 'list', 'ls']

  static examples = ['$ cg provider list', '$ cg provider list aws']

  static strict = false

  static hidden = false

  static flags = {
    ...Command.flags,
  }

  static args = Command.args

  async run(): Promise<void> {
    const { argv } = this.parse(List)
    const allProviders = argv
    const manager = this.getPluginManager(PluginType.Provider)
    const lockFile = manager.getLockFile()
    if (isEmpty(lockFile)) {
      this.logger.info('No providers found, have you installed any?')
      this.exit()
    }
    const providersToList =
      allProviders.length >= 1
        ? pickBy(lockFile, (_, key) => {
            return allProviders.includes(key)
          })
        : lockFile?.provider || {}
    for (const [key, value] of Object.entries(providersToList)) {
      this.logger.success(
        `Provider ${chalk.green(`${key}@${value}`)} is installed`
      )
    }
  }
}
