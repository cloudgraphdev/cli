import { isEmpty } from 'lodash'
import { PluginType } from '../../utils/constants'
import Command from '../base'

export default class Install extends Command {
  static description = 'Install policy packs based on the lock file'

  static aliases = ['install']

  static examples = ['$ cg policy install']

  static strict = false

  static hidden = false

  static flags = {
    ...Command.flags,
  }

  static args = Command.args

  async run(): Promise<void> {
    const manager = this.getPluginManager(PluginType.PolicyPack)
    const lockFile = manager.getLockFile()
    if (isEmpty(lockFile)) {
      this.logger.info('No providers found in lock file, have you added any?')
      this.exit()
    }
    for (const [key, value] of Object.entries(lockFile)) {
      await manager.getPlugin(key, value as string)
    }
  }
}
