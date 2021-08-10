/* eslint-disable no-console */
import Command from './base'

export default class Serve extends Command {
  static description = 'Scan provider data based on your config';

  static examples = [
    `$ cloud-graph scan aws
Lets scan your AWS resources!
`,
  ];

  static strict = false;

  static flags = {
    ...Command.flags,
  };

  static args = Command.args

  async run() {
    const storageEngine = this.getStorageEngine()
    const storageRunning = await storageEngine.healthCheck()
    if (!storageRunning) {
      this.logger.error(`Storage engine check at ${storageEngine.host} FAILED canceling SERVE`)
      this.exit()
    }
    await this.startQueryEngine()
    this.logger.info('All done, bye')
    this.exit()
  }
}
