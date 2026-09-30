import { useEffect } from 'react'
import { Marker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import { divIcon } from 'leaflet'

export interface MapPoint {
  id: string
  latitude: number
  longitude: number
  name: string
  category?: string
  number?: number
}

function FocusPoint({ point }: { point?: MapPoint }) {
  const map = useMap()
  useEffect(() => {
    if (point) map.flyTo([point.latitude, point.longitude], Math.max(map.getZoom(), 15), { duration: 0.55 })
  }, [point, map])
  return null
}

export function MapAdapter({ points, selectedId, onSelect, className = '' }: {
  points: MapPoint[]; selectedId?: string; onSelect?: (id: string) => void; className?: string
}) {
  const selected = points.find((point) => point.id === selectedId)
  const center: LatLngExpression = [10.775, 106.700]
  return <div className={`map-shell ${className}`}>
    <MapContainer center={center} zoom={13} scrollWheelZoom className="map-canvas">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FocusPoint point={selected} />
      {points.map((point) => {
        const active = point.id === selectedId
        const icon = divIcon({ className: 'numbered-map-marker', html: `<span class="map-marker-core ${active ? 'map-marker-active' : ''}"><b>${point.number ?? ''}</b></span>`, iconSize: [29, 29], iconAnchor: [14, 14] })
        return <Marker key={point.id} position={[point.latitude, point.longitude]} icon={icon} eventHandlers={{ click: () => onSelect?.(point.id) }}>
          <Popup><div className="map-popup"><span>{point.category ?? 'Trải nghiệm'}</span><strong>{point.name}</strong><small>Vị trí mô phỏng · TP. Hồ Chí Minh</small></div></Popup>
        </Marker>
      })}
    </MapContainer>
    <div className="map-stamp"><span className="stamp-dot" /> BẢN ĐỒ DEMO · OSM</div>
    <div className="map-caption">Vị trí minh họa · tuyến đường ước tính</div>
  </div>
}
