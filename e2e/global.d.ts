interface TruckFeature {
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: Record<string, unknown>
}
interface Window {
  __adtruckDebug?: { count: number; features: TruckFeature[] }
}
