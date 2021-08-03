import {Logger} from '@cloudgraph/sdk'
import {AxiosPromise} from 'axios'

export interface StorageEngine {
  host: string;
  logger: Logger;
  healthCheck: (showInitialStatus?: boolean) => Promise<boolean>;
  setSchema: (schema: string[]) => Promise<void>;
  push: (data: any) => Promise<void | AxiosPromise<any>>;
}
