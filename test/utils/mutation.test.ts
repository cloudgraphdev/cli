import { generateMutation } from '../../src/utils/mutation'
import { initTestSuite } from '../helpers'
import { addmutationMock, updatemutationMock } from '../helpers/mocks'

initTestSuite()

describe('Mutation generator tests', () => {
  it('should generate the string for an add mutation', () => {
    const mutation = generateMutation('add', 'aws', 'apiGatewayResource')
    const mock = addmutationMock()
    expect(mutation).toBe(mock)
  })
  it('should generate the string for an update mutation', () => {
    const mutation = generateMutation('update', 'aws', 'apiGatewayResource')
    const mock = updatemutationMock()
    expect(mutation).toBe(mock)
  })
})
