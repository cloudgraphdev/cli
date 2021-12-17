import { Entity } from '@cloudgraph/sdk'
import { SchemaMap } from '../types'

export function capitalizeString(input: string): string {
  return input.charAt(0).toUpperCase() + input.slice(1)
}

export const getResourceNameForMutationGenerator = (
  entity: Entity,
  schemaMap: SchemaMap | undefined
): string =>
  ((schemaMap && schemaMap[entity.name]) || entity.className) as string

export function generateMutation({
  type,
  provider,
  entity,
  schemaMap,
}: {
  type: 'add' | 'update'
  provider: string
  entity: Entity
  schemaMap: SchemaMap | undefined
}): string {
  const service: string = getResourceNameForMutationGenerator(entity, schemaMap)
  const capitalizedType = capitalizeString(type)
  // cases: add(upsert), update(update)
  // input names are different for upsert and update
  const mutationVarName = type === 'add' ? '$input' : '$patch'
  const providerServiceString = service.includes(provider)
    ? service
    : `${provider}${capitalizeString(service)}`
  // We get the mutation type name for this mutation
  const mutationInputTypeName = `${capitalizedType}${providerServiceString}Input`
  // When upserting we insert several entities at a time
  // Whereas updating we update edges for one entity at a time
  const mutationInputType =
    type === 'add'
      ? `[${mutationInputTypeName}!]!`
      : `${mutationInputTypeName}!`
  // Add the upsert boolean if the mutation is an upsert
  const mutationAdditionalArgs = type === 'add' ? ',upsert:true' : ''
  // For upsert we tell the mutation to return the number of affected nodes
  // For update we pass the query that filter the node in order to update its edges
  const internalQuery =
    type === 'add' ? 'numUids' : `${providerServiceString}{id}`
  // And we put everything together
  // eslint-disable-next-line max-len
  const mutation = `mutation(${mutationVarName}:${mutationInputType}){${type}${providerServiceString}(input:${mutationVarName}${mutationAdditionalArgs}){${internalQuery}}}`
  return mutation
}

export const generateUpdateVarsObject = (
  service: any,
  connections: Record<string, unknown>
): { filter: { id: { eq: string } }; set: Record<string, unknown> } => ({
  filter: {
    id: { eq: service.id },
  },
  set: {
    ...connections,
  },
})
