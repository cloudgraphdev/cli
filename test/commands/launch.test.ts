import { test } from '@oclif/test'
import {
  getInitCommand,
  initTestSuite,
  removeTestDirs,
  saveTestCloudGraphConfigFile,
  stopDgraphContainer,
} from '../helpers'
import { rootDir as root } from '../helpers/mocks'

initTestSuite()

describe('Launch command with docker installed', () => {
  beforeAll(async () => {
    await saveTestCloudGraphConfigFile(await getInitCommand(['']))
    await stopDgraphContainer(true)
  })

  test
    .loadConfig({ root })
    .stdout()
    .command(['launch'])
    .do(ctx => expect(ctx.config.valid).toBe(true))
    .it('should run launch and spin up new container', (ctx: any, done) => {
      done()
    })

  test
    .loadConfig({ root })
    .stdout()
    .command(['launch'])
    .do(ctx => expect(ctx.config.valid).toBe(true))
    .it(
      'should run launch and use existing(running) container',
      async (ctx: any, done) => {
        // Prepare for next test
        await stopDgraphContainer()
        done()
      }
    )

  test
    .loadConfig({ root })
    .stdout()
    .command(['launch'])
    .do(ctx => expect(ctx.config.valid).toBe(true))
    .it(
      'should run launch and use existing(stopped) container',
      async (ctx: any, done) => {
        done()
      }
    )

  afterAll(async () => {
    await stopDgraphContainer(true)
    removeTestDirs()
  })
})
