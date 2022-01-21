import { PluginType } from '@cloudgraph/sdk'

import OperationBaseCommand from '../operation'

export default class RemoveProvider extends OperationBaseCommand {
  static description = 'Remove currently installed provider'

  static aliases = ['remove', 'rm', 'del', 'rm', 'del']

  static examples = [
    '$ cg delete provider',
    '$ cg delete provider aws',
    '$ cg delete provider aws --no-save',
  ]

  static strict = false

  static hidden = false

  async run(): Promise<void> {
    try {
      const {
        manager,
        noSave = false,
        plugins: pluginsRemoved = [],
      } = await this.remove(PluginType.Provider)

      for (const key of pluginsRemoved) {
        if (manager && !noSave) {
          manager.removeFromLockFile(key)
        }
      }
    } catch (error) {
      this.logger.stopSpinner()
    }
  }
}
