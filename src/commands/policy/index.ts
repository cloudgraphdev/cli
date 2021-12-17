import Command from '../base'

export default class Add extends Command {
  static description =
    'Commands to manage policy pack modules, run $ cg policy for more info.'

  static strict = false

  static hidden = false

  static flags = {
    ...Command.flags,
  }

  static args = Command.args

  async run(): Promise<void> {
    this.logger.info('cg policy is a topic not a command')
  }
}
