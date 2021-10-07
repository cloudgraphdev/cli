import { test } from '@oclif/test'
import {
  getInitCommand,
  initDgraphContainer,
  initTestSuite,
  removeTestDirs,
  saveTestCloudGraphConfigFile,
  stopDgraphContainer,
} from '../helpers'
import { rootDir as root } from '../helpers/mocks'

initTestSuite()

describe('Teardown command with docker installed', () => {
  beforeAll(async () => {
    await saveTestCloudGraphConfigFile(await getInitCommand(['']))
    await initDgraphContainer()
  })

  test
    .loadConfig({ root })
    .stdout()
    .command(['teardown'])
    .do(ctx => expect(ctx.config.valid).toBe(true))
    .it('should run teardown and stop dgraph container', async (ctx: any, done) => {
      // Prepare for next test
      await stopDgraphContainer()
      done()
    })

  test
    .loadConfig({ root })
    .stdout()
    .command(['teardown'])
    .do(ctx => expect(ctx.config.valid).toBe(true))
    .it(
      'should run teardown and find an already stopped container',
      async (ctx: any, done) => {
        // Prepare for next test
        done()
      }
    )

  test
    .loadConfig({ root })
    .stdout()
    .command(['teardown', '--delete-image'])
    .do(ctx => expect(ctx.config.valid).toBe(true))
    .it(
      'should run teardown, find a stopped container and remove it',
      async (ctx: any, done) => {
        done()
      }
    )


  test
    .loadConfig({ root })
    .stdout()
    .command(['teardown'])
    .do(ctx => expect(ctx.config.valid).toBe(true))
    .it(
      'should run teardown and say that it didnt find any containers to stop',
      async (ctx: any, done) => {
        // Prepare for next test
        await initDgraphContainer()
        done()
      }
    )

  test
    .loadConfig({ root })
    .stdout()
    .command(['teardown', '--delete-image'])
    .do(ctx => expect(ctx.config.valid).toBe(true))
    .it(
      'should run teardown, stop and remove container',
      async (ctx: any, done) => {
        done()
      }
    )

  afterAll(async () => {
    await stopDgraphContainer(true)
    removeTestDirs()
  })
})
