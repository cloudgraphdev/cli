import { PluginType } from '@cloudgraph/sdk'

export default {
  MAX_RETRY_ATTEMPS: 3,
  MAX_BACKOFF_DELAY: 10000,
  BASE_BACKOFF_CONSTANT: 2,
}

export const DEFAULT_CONFIG = {
  host: 'localhost',
  port: '8997',
  scheme: 'http',
}

export const DGRAPH_CONTAINER_LABEL = 'cloudgraph-cli-dgraph-standalone'
export const DGRAPH_DOCKER_IMAGE_NAME = 'dgraph/standalone:v22.0.1'

export const messages = {
  [PluginType.PolicyPack]: {
    singular: 'Policy Pack',
    plural: 'policy packs',
  },
  [PluginType.Provider]: {
    singular: 'Provider',
    plural: 'providers',
  },
}

export const DEFAULT_CG_CONFIG = {
  cloudGraph: {
    plugins: {},
    storageConfig: DEFAULT_CONFIG,
    versionLimit: 10,
    queryEngine: 'playground',
    port: '5555',
  },
}
