import { FunctionComponent } from 'react'
import classNames from 'classnames'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import leaflet from 'leaflet'
import './Map.css'

interface Props {
    markers: {
        title: string
        coordinates: {
            latitude: number
            longitude: number
        }
    }[]
}

export const Map: FunctionComponent<Props> = (props) => {
    const icon = new leaflet.Icon({
        iconUrl: '/map_marker.png',
        iconSize: [48, 48],
        iconAnchor: [22, 47],
        popupAnchor: [0, -47],
        tooltipAnchor: [0, -47]
    })

    return (
        <div
            className={classNames(
                'border-black',
                'border-8',
                'shadow',
                'relative',
                'cursor-move',
                'mb-8'
            )}
        >
            <MapContainer
                className={'h-96'}
                center={[0, 0]}
                zoom={1}
                attributionControl={false}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {props.markers.map(
                    (
                        { title, coordinates: { latitude, longitude } },
                        index
                    ) => (
                        <Marker
                            position={[longitude, latitude]}
                            title={title}
                            icon={icon}
                            key={index}
                        />
                    )
                )}
            </MapContainer>
        </div>
    )
}
