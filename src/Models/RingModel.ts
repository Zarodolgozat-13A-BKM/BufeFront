export interface RingModel {
  status: string
  message: string
  data: Data
}

export interface Data {
  ringlist: Ringlist[]
  isRingingOn: boolean[]
}

export interface Ringlist {
  óra: number
  becsengetés: string
  kicsengetés: string
  createdate: string
}