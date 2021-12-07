import { Entity } from '@cloudgraph/sdk'
import { generateMutation } from '../../src/utils/mutation'
import { initTestSuite } from '../helpers'
import {
  addmutationMock,
  addmutationMockUsingClassname,
  mockEntityForMutationTest,
  mockSchemaMap,
  updatemutationMock,
} from '../helpers/mocks'

initTestSuite()

describe('Mutation generator basic tests', () => {
  it('should generate the string for an add mutation', () => {
    const mutation = generateMutation({
      type: 'add',
      provider: 'aws',
      entity: mockEntityForMutationTest,
      schemaMap: mockSchemaMap,
    })
    const mock = addmutationMock()
    expect(mutation).toBe(mock)
  })
  it('should generate the string for an update mutation', () => {
    const mutation = generateMutation({
      type: 'update',
      provider: 'aws',
      entity: mockEntityForMutationTest,
      schemaMap: mockSchemaMap,
    })
    const mock = updatemutationMock()
    expect(mutation).toBe(mock)
  })
})

describe('Mutation generator cases test', () => {
  it('should use the schemaMap to get the correct type', () => {
    const entityCopy: Entity = JSON.parse(
      JSON.stringify(mockEntityForMutationTest)
    ) as Entity
    delete entityCopy.className
    const mutation = generateMutation({
      type: 'add',
      provider: 'aws',
      entity: entityCopy,
      schemaMap: mockSchemaMap,
    })
    const mock = addmutationMock()
    expect(mutation).toBe(mock)
  })
  it('should use the className to generate the correct type', () => {
    const entityCopy: Entity = JSON.parse(
      JSON.stringify(mockEntityForMutationTest)
    ) as Entity
    entityCopy.mutation = ''
    const mutation = generateMutation({
      type: 'add',
      provider: 'aws',
      entity: mockEntityForMutationTest,
      schemaMap: undefined,
    })
    const mock = addmutationMockUsingClassname()
    expect(mutation).toBe(mock)
  })
  it('should use the mutation file', () => {
    const entityCopy: Entity = JSON.parse(
      JSON.stringify(mockEntityForMutationTest)
    ) as Entity
    const { mutation } = entityCopy
    const result =
      mutation ||
      generateMutation({
        type: 'add',
        provider: 'aws',
        entity: entityCopy,
        schemaMap: undefined,
      })
    const mock = addmutationMock()
    expect(result).toBe(mock)
  })
})
