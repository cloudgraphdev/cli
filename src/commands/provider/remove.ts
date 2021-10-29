import { isEmpty } from 'lodash'
import chalk from 'chalk'
import { flags } from '@oclif/command'

import Command from '../base'
import { PluginType } from '../../utils/constants'

export default class Remove extends Command {
  static description = 'Remove currently installed provider'

  static aliases = ['remove', 'rm', 'del', 'provider:rm', 'provider:del']

  static examples = [
    '$ cg provider delete',
    '$ cg provider delete aws',
    '$ cg provider delete aws --no-save',
  ]

  static strict = false

  static hidden = false

  static flags = {
    'no-save': flags.boolean({
      default: false,
      description: 'Set to not alter lock file, just delete plugin',
    }),
    ...Command.flags,
  }

  static args = Command.args

  async run(): Promise<void> {
    const {
      argv,
      flags: { 'no-save': noSave },
    } = this.parse(Remove)
    const allProviders = argv
    const manager = this.getPluginManager(PluginType.Provider)
    const lockFile = manager.getLockFile()
    if (isEmpty(lockFile)) {
      this.logger.info('No providers found, have you installed any?')
      this.exit()
    }
    for (const key of allProviders) {
      try {
        this.logger.startSpinner(`Removing ${chalk.italic.green(key)} provider`)

        await manager.removePlugin(key)

        this.logger.successSpinner(
          `${chalk.italic.green(key)} provider removed successfully`
        )

        if (!noSave) {
          manager.removeFromLockFile(key)
        }
      } catch (error) {
        this.logger.stopSpinner()
      }
    }
  }
}
