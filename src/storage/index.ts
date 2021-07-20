import DgraphEngine from './dgraph'
import {StorageEngine} from './types'

const engineMap: {[key: string]: new (config: any) => StorageEngine} = {
  dgraph: DgraphEngine,
}

export default engineMap
