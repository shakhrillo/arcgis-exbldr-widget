import type { ImmutableObject } from 'seamless-immutable'

export interface Config {
  showScale: boolean
  showZoom: boolean
  layerList: any[]
}

export type IMConfig = ImmutableObject<Config>