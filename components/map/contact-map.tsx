import { getMapEmbedUrl } from "./map-embed"
import LazyMap from "./lazy-map"

interface ContactMapProps {
  address: string
  height?: number
  className?: string
}

export default async function ContactMap({ address, height = 400, className = "" }: ContactMapProps) {
  // Координати для вашого сервісного центру в Празі
  const center = { lat: 50.0755381, lng: 14.4194684 }

  // Отримуємо URL для статичної карти з серверного компонента
  const mapUrl = await getMapEmbedUrl({
    lat: center.lat,
    lng: center.lng,
    zoom: 15,
    width: 800,
    height,
  })

  return <LazyMap address={address} center={center} zoom={15} height={height} className={className} mapUrl={mapUrl} />
}
