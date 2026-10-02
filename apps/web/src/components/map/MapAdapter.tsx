import { useEffect, useState } from 'react'
import { Marker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import { divIcon } from 'leaflet'
import { MapPin, Layers, Sparkles } from 'lucide-react'

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
    map.invalidateSize()
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 250)
    return () => clearTimeout(timer)
  }, [map])

  useEffect(() => {
    if (point) {
      map.flyTo([point.latitude, point.longitude], Math.max(map.getZoom(), 15), {
        duration: 0.8,
        easeLinearity: 0.25,
      })
    }
  }, [point, map])
  return null
}

const TILE_PRESETS = {
  dark: {
    name: 'Đêm Huyền Ảo',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &copy; OpenStreetMap contributors',
  },
  osm: {
    name: 'Sáng Thanh Lịch',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
}

export function MapAdapter({
  points,
  selectedId,
  onSelect,
  className = '',
}: {
  points: MapPoint[]
  selectedId?: string
  onSelect?: (id: string) => void
  className?: string
}) {
  const [styleMode, setStyleMode] = useState<'dark' | 'osm'>('dark')
  const selected = points.find((point) => point.id === selectedId)
  const center: LatLngExpression = [10.775, 106.700]

  return (
    <div
      className={`map-shell-3d ${className}`}
      style={{ height: '680px', minHeight: '500px', width: '100%', position: 'relative' }}
    >
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        className="map-canvas-3d"
        style={{ height: '100%', width: '100%', minHeight: '500px' }}
      >
        <TileLayer
          attribution={TILE_PRESETS[styleMode].attribution}
          url={TILE_PRESETS[styleMode].url}
          maxZoom={19}
        />
        <FocusPoint point={selected} />
        {points.map((point) => {
          const active = point.id === selectedId
          const icon = divIcon({
            className: 'custom-3d-marker',
            html: `
              <div class="marker-3d-pin ${active ? 'marker-3d-active' : ''}">
                <div class="marker-pulse-ring"></div>
                <div class="marker-bubble">
                  ${point.number ? `<b>${point.number}</b>` : '<span class="marker-dot-inner"></span>'}
                </div>
                <div class="marker-stem"></div>
                <div class="marker-shadow"></div>
              </div>
            `,
            iconSize: [38, 48],
            iconAnchor: [19, 44],
            popupAnchor: [0, -42],
          })

          return (
            <Marker
              key={point.id}
              position={[point.latitude, point.longitude]}
              icon={icon}
              eventHandlers={{ click: () => onSelect?.(point.id) }}
            >
              <Popup className="custom-3d-popup">
                <div className="map-popup-3d">
                  <span className="popup-kicker">{point.category ?? 'Trải nghiệm'}</span>
                  <strong className="popup-title">{point.name}</strong>
                  <span className="popup-sub">
                    <MapPin size={11} /> Vị trí mô phỏng · TP. HCM
                  </span>
                  {onSelect && (
                    <button
                      type="button"
                      className="popup-select-btn"
                      onClick={() => onSelect(point.id)}
                    >
                      <Sparkles size={12} /> Xem chi tiết
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Top Map Controls */}
      <div className="map-3d-controls">
        <div className="map-3d-badge">
          <span className="badge-live-pulse" />
          <span>BẢN ĐỒ 3D VECTOR · SÀI GÒN</span>
        </div>

        <button
          type="button"
          className="map-layer-toggle"
          onClick={() => setStyleMode(styleMode === 'dark' ? 'osm' : 'dark')}
          title="Chuyển chế độ Sáng / Tối"
        >
          <Layers size={13} />
          <span>{TILE_PRESETS[styleMode].name}</span>
        </button>
      </div>

      <div className="map-3d-bottom-info">
        <span>Tọa độ mô phỏng · Tự động đồng bộ với danh sách</span>
      </div>
    </div>
  )
}
