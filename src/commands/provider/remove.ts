import { PluginType } from '@cloudgraph/sdk'

import OperationBaseCommand from '../operation'

export default class RemoveProvider extends OperationBaseCommand {
  static description = 'Remove currently installed provider'

  static aliases = [
    'remove:provider',
    'provider:remove',
    'provider:rm',
    'del:provider',
    'rm:provider',
  ]

  static examples = [
    '$ cg provider remove',
    '$ cg provider remove aws',
    '$ cg provider remove aws --no-save',
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
