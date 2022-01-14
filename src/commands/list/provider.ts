import { PluginType } from '@cloudgraph/sdk'

import OperationBaseCommand from '../operation'

export default class ListProvider extends OperationBaseCommand {
  static description = 'List currently installed providers and versions'

  static aliases = ['provider:ls', 'list', 'ls']

  static examples = ['$ cg provider list', '$ cg provider list aws']

  static strict = false

  static hidden = false

  async run(): Promise<void> {
    await this.list(PluginType.Provider)
  }
}
