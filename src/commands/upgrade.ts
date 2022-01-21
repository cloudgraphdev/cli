import { PluginType } from '@cloudgraph/sdk'

import OperationCommand from './operation'

export default class Upgrade extends OperationCommand {
  static description = 'Upgrade currently installed plugins.'

  static examples = ['$ cg upgrade']

  static aliases = []

  static strict = false

  static hidden = false

  async run(): Promise<void> {
    try {
      const lockFile = this.getLockFile()

      for (const pluginType in lockFile) {
        if (pluginType) {
          await this.update(pluginType as PluginType)
        }
      }
    } catch (error) {
      this.logger.stopSpinner()
      this.logger.debug(error)
    }
  }
}
