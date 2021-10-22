import { isEmpty } from 'lodash'
import { PluginType } from '../../utils/constants'
import Command from '../base'

export default class Use extends Command {
  static description = 'Select policy pack to use during scan'

  static aliases = ['use']

  static examples = ['$ cg policy use']

  static strict = false

  static hidden = false

  static flags = {
    ...Command.flags,
  }

  static args = Command.args

  async run(): Promise<void> {
    const manager = this.getPluginManager(PluginType.PolicyPack)
    const lockFile = manager.getLockFile()
    if (isEmpty(lockFile?.policyPack)) {
      this.logger.info(
        'No policy packs found in lock file, have you added any?'
      )
      this.exit()
    }

    for (const [key, value] of Object.entries(lockFile.policyPack)) {
      const {
        default: { provider },
      } = await manager.getPlugin(key, value as string)
      const config = this.getCGConfig()
      if (config[provider]) {
        config[provider].policies = [
          ...new Set([...config[provider].policies, key]),
        ]
        this.saveCloudGraphConfigFile(config)
      } else {
        this.logger.info(
          `${provider} does not exist on your cloudgraph configuration. Please install a provider first.`
        )
      }
    }
  }
}
