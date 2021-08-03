import chalk from 'chalk'
import ora from 'ora'
import { exec } from 'child_process'

import Command from './base'
import { fileUtils } from '../utils'

export default class Launch extends Command {
  static description = 'Launch an instance of Dgraph to store data';

  static examples = [
    '$ cg launch',
  ];

  static dgraphContainerLabel = 'cloudgraph-cli-dgraph-standalone'

  static strict = false

  static flags = {
    ...Command.flags,
  }

  static hidden = false

  static args = Command.args

  execCommand(cmd: string) {
    return new Promise((resolve, reject) => {
      exec(cmd, (error: any, stdout: any, stderr: any) => {
        if (error) {
          reject(error)
        }
        resolve(stdout || stderr)
      })
    })
  }

  // eslint-disable-next-line no-warning-comments
  // TODO: convert this func to handle any storage provider
  async run() {
    // const {flags: {debug, dev: devMode}} = this.parse(Launch)
    // eslint-disable-next-line no-warning-comments
    // TODO: not a huge fan of this pattern, rework how to do debug and devmode tasks (specifically how to use in providers)
    // const opts: Opts = {logger: this.logger, debug, devMode}
    const dockerCheck = ora('Checking for Docker').start()
    try {
      await this.execCommand('docker -v')
      dockerCheck.succeed('Docker found')
    } catch (error: any) {
      dockerCheck.fail(
        'It appears Docker is not installed, please install it at: https://docs.docker.com/get-docker/'
        // { level: 'error' }
      )
      this.logger.error(error)
      this.exit()
    }

    const containerCheck = ora(
      'Checking for an existing Dgraph docker instance'
    ).start()
    let runningContainerId
    try {
      const stdout: any = await this.execCommand(
        `docker ps --filter label=${Launch.dgraphContainerLabel} --filter status=running --quiet`
      )
      const containerId = stdout.trim()
      if (containerId) {
        runningContainerId = containerId
      }
    } catch (error: any) {
      this.logger.error(error)
    }

    let exitedContainerId
    if (!runningContainerId) {
      try {
        const stdout: any = await this.execCommand(
          `docker ps --filter label=${Launch.dgraphContainerLabel} --filter status=exited --quiet`
        )
        const containerId = stdout.trim()
        if (containerId) {
          exitedContainerId = containerId
          containerCheck.succeed('Reusable container found!')
        }
      } catch (error: any) {
        this.logger.error(error)
      }
    }

    if (!exitedContainerId && !runningContainerId) {
      containerCheck.succeed('No reusable instances found')
      const dgraphImgCheck = ora('pulling Dgraph Docker image').start()
      try {
        fileUtils.makeDirIfNotExists(`${process.cwd()}/dgraph`)
        await this.execCommand('docker pull dgraph/standalone')
        dgraphImgCheck.succeed('Pulled Dgraph Docker image')
      } catch (error: any) {
        dgraphImgCheck.fail(
          'Failed pulling Dgraph Docker image please check your docker installation'
          // { level: 'error' }
        )
        this.logger.error(error)
      }
    }

    let dgraphInit
    if (runningContainerId) {
      containerCheck.succeed('Reusable container found')
    } else {
      dgraphInit = ora(
        `Spinning up ${exitedContainerId ? 'existing' : 'new'} Dgraph instance`
      ).start()
      try {
        if (exitedContainerId) {
          await this.execCommand(`docker container start ${exitedContainerId}`)
        } else {
          await this.execCommand(
            `docker run -d -p 5080:5080 -p 6080:6080 -p 8080:8080 -p 9080:9080 -p 8000:8000 --label ${
              Launch.dgraphContainerLabel
            } -v ${process.cwd()}/dgraph:/dgraph --name dgraph dgraph/standalone:v21.03.0`
          )
        }
        dgraphInit.succeed('Dgraph instance running')
      } catch (error: any) {
        dgraphInit.fail('Failed starting Dgraph instance')
        this.logger.error(error)
        throw new Error('Dgraph was unable to start')
      }
    }

    await this.checkIfInstanceIsRunningReportStatus()
  }

  async checkIfInstanceIsRunningReportStatus() {
    const healthCheck = ora('Running health check on Dgraph').start()
    // eslint-disable-next-line no-warning-comments
    // TODO: smaller sleep time and exponential backoff for ~5 tries
    await new Promise(resolve => setTimeout(resolve, 10000))
    try {
      const storageEngine = this.getStorageEngine()
      const running = await storageEngine.healthCheck(false)
      if (running) {
        healthCheck.succeed('Dgraph health check passed')
      } else {
        throw new Error('Dgraph was unable to start')
      }
    } catch (error: any) {
      this.logger.debug(error)
      throw new Error('Dgraph was unable to start')
    }
    this.logger.success(
      `Access your dgraph instance at ${chalk.underline.green(
        this.getHost(false)
      )}`
    )
    this.logger.info(
      `For more information on dgraph, see the dgrah docs at: ${chalk.underline.green(
        'https://dgraph.io/docs/graphql/'
      )}`
    )
    this.exit()
  }
}
