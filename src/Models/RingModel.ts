export interface Ringlist {
  óra: number
  becsengetés: string
  kicsengetés: string
  createdate: string
}
export interface RingModel {
  date: string
  rings: Ringlist[]
}