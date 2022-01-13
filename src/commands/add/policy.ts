import { PluginType } from '@cloudgraph/sdk'
import Command from '../base'

export default class AddPolicy extends Command {
  static description = 'Add new policy packs'

  static examples = [
    '$ cg policy add aws-cis-1.2.0',
    '$ cg policy add aws-cis-1.2.0@0.12.0',
  ]

  static strict = false

  static hidden = false

  static flags = {
    ...Command.flags,
  }

  static args = Command.args

  async run(): Promise<void> {
    const { argv } = this.parse(AddPolicy)
    const allPolicyPacks = argv
    const manager = this.getPluginManager(PluginType.PolicyPack)
    for (let key of allPolicyPacks) {
      let version = 'latest'
      if (key.includes('@')) {
        [key, version] = key.split('@')
      }
      const {
        default: { provider },
      } = await manager.getPlugin(key, version)
      const config = this.getCGConfig()
      if (config && config[provider]) {
        config[provider].policies = config[provider].policies
          ? [...new Set([...config[provider].policies, key])]
          : [key]
        this.saveCloudGraphConfigFile(config)
      }
    }
  }
}
