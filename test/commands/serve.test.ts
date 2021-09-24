import { test } from '@oclif/test'
import axios from 'axios'
import ServeCommandClass from '../../src/commands/serve'
import {
  getInitCommand,
  getQueryEngineEndpoint,
  getServeCommand,
  initDgraphContainer,
  initTestSuite,
  removeTestDirs,
  saveTestCloudGraphConfigFile,
  stopDgraphContainer,
} from '../helpers'
import { rootDir as root, testQueryEnginePort } from '../helpers/mocks'

initTestSuite()

describe('Serve command with DGraph container stopped', () => {
  beforeAll(async () => {
    await stopDgraphContainer(true)
    await saveTestCloudGraphConfigFile(await getInitCommand([`--port=${testQueryEnginePort}`]))
  })
  afterAll(() => {
    removeTestDirs()
  })

  test
    .loadConfig({ root })
    .stdout()
    .command(['serve'])
    .catch(error => {
      expect(error.message).toMatch(/FAILED canceling SERVE/)
    })
    .it('should try to start query server and fail')
})

describe('Serve command with DGraph container running', () => {
  let serveCommand: ServeCommandClass
  beforeAll(async () => {
    await saveTestCloudGraphConfigFile(await getInitCommand([`--port=${testQueryEnginePort}`]), true)
    await initDgraphContainer()
    serveCommand = await getServeCommand([`--port=${testQueryEnginePort}`])
  })
  afterAll(async () => {
    await stopDgraphContainer(true)
    removeTestDirs()
  })

  it('should start query server and check if queryEngine endpoint is up', async () => {
    await serveCommand.run()
    const res = await axios({
      method: 'get',
      baseURL: getQueryEngineEndpoint(),
    })
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toBe('text/html')
    expect(res.headers['x-powered-by']).toBe('Express')
  })
})
