import { PluginType } from '@cloudgraph/sdk'

import OperationBaseCommand from '../operation'

export default class AddProvider extends OperationBaseCommand {
  static description = 'Add new providers'

  static aliases = ['add']

  static examples = ['$ cg provider add aws', '$ cg provider add aws@0.12.0']

  static strict = false

  static hidden = false

  async run(): Promise<void> {
    await this.add(PluginType.Provider)
  }
}
